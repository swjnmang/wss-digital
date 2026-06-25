// Trage hier die Config-Werte aus deinem Firebase-Projekt ein
// (Firebase Console -> Projekteinstellungen -> "Meine Apps" -> Web-App -> SDK-Konfiguration).
// Firestore Database muss im Projekt aktiviert sein.
export const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  projectId: "DEIN_PROJEKT_ID",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID",
};

// Name der Firestore-Collection, in der die Highscore-Einträge gespeichert werden.
export const HIGHSCORE_COLLECTION = "kreuzwortraetsel_highscore";
