// Trage hier die Config-Werte aus deinem Firebase-Projekt ein
// (Firebase Console -> Projekteinstellungen -> "Meine Apps" -> Web-App -> SDK-Konfiguration).
// Firestore Database muss im Projekt aktiviert sein.
export const firebaseConfig = {
  apiKey: "AIzaSyC503SQThV2Jsxp7_rhTsbGlia0shMGyug",
  authDomain: "kreuzwort-ll.firebaseapp.com",
  projectId: "kreuzwort-ll",
  storageBucket: "kreuzwort-ll.firebasestorage.app",
  messagingSenderId: "202694711622",
  appId: "1:202694711622:web:b9dc97111fe5b22ac7ed47",
};

// Name der Firestore-Collection, in der die Highscore-Einträge gespeichert werden.
export const HIGHSCORE_COLLECTION = "kreuzwortraetsel_highscore";
