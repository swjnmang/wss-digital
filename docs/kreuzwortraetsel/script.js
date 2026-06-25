import { firebaseConfig, HIGHSCORE_COLLECTION } from "./firebase-config.js";

// --- Rätsel-Daten -----------------------------------------------------
// row/col sind 0-basiert. dir: "across" | "down".
const ENTRIES = [
  { num: 1, word: "SCHWARZGELB", row: 0, col: 18, dir: "down" },
  { num: 2, word: "STUHL", row: 0, col: 18, dir: "across" },
  { num: 3, word: "REUS", row: 12, col: 15, dir: "down" },
  { num: 4, word: "GERNER", row: 9, col: 28, dir: "down" },
  { num: 5, word: "TAUCHEN", row: 9, col: 5, dir: "down" },
  { num: 6, word: "SPAETI", row: 7, col: 7, dir: "across" },
  { num: 7, word: "MAUERWERK", row: 2, col: 20, dir: "down" },
  { num: 8, word: "DREHEND", row: 10, col: 24, dir: "across" },
  { num: 9, word: "PULBIBER", row: 12, col: 8, dir: "across" },
  { num: 10, word: "FLADENBROT", row: 2, col: 22, dir: "down" },
  { num: 11, word: "NUERNBERG", row: 3, col: 25, dir: "down" },
  { num: 12, word: "KAISERBURG", row: 1, col: 14, dir: "down" },
  { num: 13, word: "WECKLA", row: 10, col: 7, dir: "across" },
  { num: 14, word: "LEBKUCHEN", row: 14, col: 4, dir: "across" },
  { num: 15, word: "PEGNITZ", row: 9, col: 0, dir: "across" },
  { num: 16, word: "INNENVERTEIDIGER", row: 5, col: 11, dir: "across" },
  { num: 17, word: "WOHNSITUATION", row: 2, col: 12, dir: "down" },
];

let ROWS = 0;
let COLS = 0;
for (const e of ENTRIES) {
  const endRow = e.dir === "down" ? e.row + e.word.length - 1 : e.row;
  const endCol = e.dir === "across" ? e.col + e.word.length - 1 : e.col;
  ROWS = Math.max(ROWS, endRow + 1);
  COLS = Math.max(COLS, endCol + 1);
}

// cells[r][c] = { letter, number?, wordsAcross?: entry, wordsDown?: entry }
const cells = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) cells[r][c] = null;
}
for (const entry of ENTRIES) {
  for (let i = 0; i < entry.word.length; i++) {
    const r = entry.dir === "down" ? entry.row + i : entry.row;
    const c = entry.dir === "across" ? entry.col + i : entry.col;
    if (!cells[r][c]) cells[r][c] = { letter: entry.word[i] };
    if (entry.dir === "across") cells[r][c].across = entry;
    else cells[r][c].down = entry;
    if (i === 0) {
      cells[r][c].number = cells[r][c].number
        ? Math.min(cells[r][c].number, entry.num)
        : entry.num;
    }
  }
}

// --- Grid rendern ------------------------------------------------------
const gridEl = document.getElementById("crossword");
gridEl.style.gridTemplateColumns = `repeat(${COLS}, var(--cell-size))`;
gridEl.style.gridTemplateRows = `repeat(${ROWS}, var(--cell-size))`;

const inputMap = {}; // "r,c" -> input element

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cellData = cells[r][c];
    const cellEl = document.createElement("div");
    cellEl.className = "cw-cell" + (cellData ? "" : " blocked");
    if (cellData) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.dataset.row = r;
      input.dataset.col = c;
      input.setAttribute("aria-label", `Feld Zeile ${r + 1}, Spalte ${c + 1}`);
      cellEl.appendChild(input);
      inputMap[`${r},${c}`] = input;

      if (cellData.number) {
        const numEl = document.createElement("span");
        numEl.className = "cw-number";
        numEl.textContent = cellData.number;
        cellEl.appendChild(numEl);
      }

      input.addEventListener("input", () => onCellInput(input, r, c));
      input.addEventListener("keydown", (ev) => onCellKeydown(ev, r, c));
    }
    gridEl.appendChild(cellEl);
  }
}

const TOTAL_LETTERS = Object.keys(inputMap).length;
let startTime = null;
let elapsedMs = null;
let timerInterval = null;

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (startTime !== null) return;
  startTime = Date.now();
  const timerEl = document.getElementById("timerDisplay");
  timerInterval = setInterval(() => {
    timerEl.textContent = `⏱ ${formatDuration(Date.now() - startTime)}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function onCellInput(input, r, c) {
  startTimer();
  const value = input.value.toUpperCase();
  input.value = value;
  const expected = cells[r][c].letter;

  input.classList.remove("correct", "incorrect");
  if (value === "") {
    // neutral
  } else if (value === expected) {
    input.classList.add("correct");
    moveToNextCell(r, c);
  } else {
    input.classList.add("incorrect");
  }
  updateProgress();
}

function moveToNextCell(r, c) {
  const cellData = cells[r][c];
  const entry = cellData.across || cellData.down;
  if (!entry) return;
  const idx = entry.dir === "down" ? r - entry.row : c - entry.col;
  const nextIdx = idx + 1;
  if (nextIdx >= entry.word.length) return;
  const nr = entry.dir === "down" ? entry.row + nextIdx : entry.row;
  const nc = entry.dir === "across" ? entry.col + nextIdx : entry.col;
  const nextInput = inputMap[`${nr},${nc}`];
  if (nextInput) nextInput.focus();
}

function onCellKeydown(ev, r, c) {
  const dirs = {
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
    ArrowDown: [1, 0],
    ArrowUp: [-1, 0],
  };
  if (dirs[ev.key]) {
    ev.preventDefault();
    const [dr, dc] = dirs[ev.key];
    const target = inputMap[`${r + dr},${c + dc}`];
    if (target) target.focus();
    return;
  }
  if (ev.key === "Backspace" && ev.target.value === "") {
    const cellData = cells[r][c];
    const entry = cellData.across || cellData.down;
    if (!entry) return;
    const idx = entry.dir === "down" ? r - entry.row : c - entry.col;
    const prevIdx = idx - 1;
    if (prevIdx < 0) return;
    const pr = entry.dir === "down" ? entry.row + prevIdx : entry.row;
    const pc = entry.dir === "across" ? entry.col + prevIdx : entry.col;
    const prevInput = inputMap[`${pr},${pc}`];
    if (prevInput) prevInput.focus();
  }
}

function updateProgress() {
  let correct = 0;
  for (const key in inputMap) {
    if (inputMap[key].classList.contains("correct")) correct++;
  }
  if (correct === TOTAL_LETTERS) {
    onPuzzleSolved();
  }
}

// --- Highscore / Firebase ---------------------------------------------
const SOLVED_FLAG_KEY = "kreuzwortraetsel_solved";
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
    console.warn(
      "Firebase ist noch nicht konfiguriert (firebase-config.js). Highscore wird nur lokal in diesem Browser gespeichert."
    );
    return;
  }
  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
    );
    const {
      getFirestore,
      collection,
      addDoc,
      serverTimestamp,
      query,
      orderBy,
      limit,
      getDocs,
    } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
    );
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    collectionRef = collection(db, HIGHSCORE_COLLECTION);
    serverTimestampFn = serverTimestamp;
    firestoreFns = { addDoc, query, orderBy, limit, getDocs };
    firestoreReady = true;
  } catch (err) {
    console.error("Firebase konnte nicht initialisiert werden:", err);
  }
}

async function renderHighscore() {
  const listEl = document.getElementById("highscoreList");
  let entries = [];

  if (firestoreReady) {
    try {
      const { query, orderBy, limit, getDocs } = firestoreFns;
      const q = query(collectionRef, orderBy("durationMs", "asc"), limit(20));
      const snapshot = await getDocs(q);
      entries = snapshot.docs.map((doc) => doc.data());
    } catch (err) {
      console.error("Highscore konnte nicht geladen werden:", err);
    }
  } else {
    entries = JSON.parse(localStorage.getItem("kreuzwortraetsel_local_highscore") || "[]").sort(
      (a, b) => a.durationMs - b.durationMs
    );
  }

  listEl.innerHTML = "";
  if (entries.length === 0) {
    listEl.innerHTML = `<li class="empty">Noch keine Einträge.</li>`;
    return;
  }
  for (const entry of entries) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(entry.name)}</span><span class="highscore-time">${formatDuration(entry.durationMs)}</span>`;
    listEl.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function submitHighscore(name) {
  if (firestoreReady) {
    const { addDoc } = firestoreFns;
    await addDoc(collectionRef, { name, durationMs: elapsedMs, completedAt: serverTimestampFn() });
  } else {
    const local = JSON.parse(localStorage.getItem("kreuzwortraetsel_local_highscore") || "[]");
    local.push({ name, durationMs: elapsedMs, completedAt: Date.now() });
    localStorage.setItem("kreuzwortraetsel_local_highscore", JSON.stringify(local));
  }
  await renderHighscore();
}

function showHighscoreStep() {
  document.getElementById("nameStep").classList.add("hidden");
  document.getElementById("highscoreStep").classList.remove("hidden");
  document.getElementById("winOverlay").classList.remove("hidden");
  renderHighscore();
}

function onPuzzleSolved() {
  if (elapsedMs === null) {
    stopTimer();
    elapsedMs = startTime !== null ? Date.now() - startTime : 0;
    document.getElementById("timerDisplay").textContent = `⏱ ${formatDuration(elapsedMs)}`;
  }
  if (localStorage.getItem(SOLVED_FLAG_KEY)) {
    showHighscoreStep();
    return;
  }
  document.getElementById("nameStep").classList.remove("hidden");
  document.getElementById("highscoreStep").classList.add("hidden");
  document.getElementById("winOverlay").classList.remove("hidden");
  document.getElementById("solveTime").textContent = formatDuration(elapsedMs);
}

document.getElementById("nameForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const errorEl = document.getElementById("nameFormError");
  errorEl.classList.add("hidden");
  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    await submitHighscore(name);
    localStorage.setItem(SOLVED_FLAG_KEY, "1");
    showHighscoreStep();
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Eintragen fehlgeschlagen. Bitte erneut versuchen.";
    errorEl.classList.remove("hidden");
  }
});

document.getElementById("closeOverlay").addEventListener("click", () => {
  document.getElementById("winOverlay").classList.add("hidden");
});

initFirebase();
updateProgress();
