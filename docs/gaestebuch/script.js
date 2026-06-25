import { firebaseConfig, GUESTBOOK_COLLECTION } from "./firebase-config.js";

const LOCAL_KEY = "gaestebuch_local_entries";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB Rohgröße vor Komprimierung
const MAX_IMAGE_DIMENSION = 900; // px, längste Seite nach Komprimierung
const MAX_PHOTO_DATA_LENGTH = 700000; // Zeichen, Firestore-Dokumente sind auf ~1 MB begrenzt

let firestoreReady = false;
let db = null;
let collectionRef = null;
let serverTimestampFn = null;
let firestoreFns = null;

const isFirebaseConfigured = !Object.values(firebaseConfig).some(
  (v) => typeof v === "string" && v.startsWith("DEIN")
);

async function initFirebase() {
  if (!isFirebaseConfigured) {
    console.warn("Firebase ist nicht konfiguriert. Einträge werden nur lokal in diesem Browser gespeichert.");
    return;
  }
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const {
      getFirestore,
      collection,
      addDoc,
      serverTimestamp,
      query,
      orderBy,
      getDocs,
    } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    collectionRef = collection(db, GUESTBOOK_COLLECTION);
    serverTimestampFn = serverTimestamp;
    firestoreFns = { addDoc, query, orderBy, getDocs };
    firestoreReady = true;
  } catch (err) {
    console.error("Firebase konnte nicht initialisiert werden:", err);
  }
}

// Komprimiert das Bild clientseitig und liefert es als Base64-Data-URL,
// damit es direkt im Firestore-Dokument gespeichert werden kann (kein Storage/Blaze-Tarif nötig).
function compressImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      let quality = 0.8;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_PHOTO_DATA_LENGTH && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrl.length > MAX_PHOTO_DATA_LENGTH) {
        reject(new Error("Bild ist auch komprimiert noch zu groß."));
        return;
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderEntryList(entries) {
  const listEl = document.getElementById("entriesList");
  listEl.innerHTML = "";
  if (entries.length === 0) {
    listEl.innerHTML = `<p class="empty">Noch keine Einträge.</p>`;
    return;
  }
  for (const entry of entries) {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <div class="entry-name">${escapeHtml(entry.name)}</div>
      <p class="entry-message">${escapeHtml(entry.message)}</p>
      ${entry.photoData ? `<img class="entry-photo" src="${entry.photoData}" alt="Foto von ${escapeHtml(entry.name)}" loading="lazy">` : ""}
    `;
    listEl.appendChild(div);
  }
}

async function renderEntries() {
  let entries = [];
  if (firestoreReady) {
    try {
      const { query, orderBy, getDocs } = firestoreFns;
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      entries = snapshot.docs.map((doc) => doc.data());
    } catch (err) {
      console.error("Einträge konnten nicht geladen werden:", err);
    }
  } else {
    entries = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]").slice().reverse();
  }
  renderEntryList(entries);
}

async function submitEntry({ name, message, photoFile }) {
  let photoData = null;
  if (photoFile) {
    photoData = await compressImageToDataUrl(photoFile);
  }

  if (firestoreReady) {
    const { addDoc } = firestoreFns;
    await addDoc(collectionRef, {
      name,
      message,
      photoData: photoData || null,
      createdAt: serverTimestampFn(),
    });
  } else {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    local.push({ name, message, photoData: photoData || null, createdAt: Date.now() });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
  }
  await renderEntries();
}

const photoCapture = document.getElementById("photoCapture");
const photoLibrary = document.getElementById("photoLibrary");
const photoPreview = document.getElementById("photoPreview");
let selectedPhotoFile = null;

function handlePhotoSelected(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > MAX_IMAGE_BYTES) {
    alert("Das Bild ist zu groß (max. 8 MB). Bitte ein kleineres Foto wählen.");
    input.value = "";
    return;
  }
  selectedPhotoFile = file;
  photoPreview.src = URL.createObjectURL(file);
  photoPreview.classList.remove("hidden");
}

photoCapture.addEventListener("change", () => handlePhotoSelected(photoCapture));
photoLibrary.addEventListener("change", () => handlePhotoSelected(photoLibrary));

async function showEntriesStep() {
  document.getElementById("formStep").classList.add("hidden");
  document.getElementById("entriesStep").classList.remove("hidden");
  await renderEntries();
}

document.getElementById("entryForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const errorEl = document.getElementById("formError");
  errorEl.classList.add("hidden");

  const name = document.getElementById("nameInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();
  if (!name || !message) return;

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Wird gespeichert...";

  try {
    await submitEntry({ name, message, photoFile: selectedPhotoFile });
    await showEntriesStep();
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Eintragen fehlgeschlagen. Bitte erneut versuchen oder ein kleineres Foto wählen.";
    errorEl.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Eintragen";
  }
});

initFirebase();
