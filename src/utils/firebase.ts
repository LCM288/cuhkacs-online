import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCh9I9xgFFoXhdfRz9XF-Bq-OceWPe3xD0",
  authDomain: "outstanding-ion-332805.firebaseapp.com",
  databaseURL:
    "https://outstanding-ion-332805-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "outstanding-ion-332805",
  storageBucket: "outstanding-ion-332805.appspot.com",
  messagingSenderId: "344004181789",
  appId: "1:344004181789:web:30930b8c89f73bdbe6ebf4",
  measurementId: "G-K9P59EBQNR",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = (() => {
  const authLocal = getAuth(app);
  if (location.hostname === "localhost") {
    connectAuthEmulator(authLocal, "http://localhost:9099");
  }
  return authLocal;
})();
export const database = (() => {
  const db = getDatabase(app);
  if (location.hostname === "localhost") {
    // Point to the RTDB emulator running on localhost.
    connectDatabaseEmulator(db, "localhost", 9000);
  }
  return db;
})();
