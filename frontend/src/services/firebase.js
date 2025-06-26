// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa6abS1hCcL7f6LmhT0EBw7JFOtc-CPcw",
  authDomain: "shipment-55c30.firebaseapp.com",
  projectId: "shipment-55c30",
  storageBucket: "shipment-55c30.firebasestorage.app",
  messagingSenderId: "936203134770",
  appId: "1:936203134770:web:74722faec7e8f753ab192b",
  measurementId: "G-TZXQJYFBB5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { app, auth, analytics, db };