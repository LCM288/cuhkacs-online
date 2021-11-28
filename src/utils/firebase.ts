// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
