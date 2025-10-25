import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-prZBW-HvmJNbAaEK6DVpde2vWBIBijs",
  authDomain: "cinema-e-booking-system.firebaseapp.com",
  projectId: "cinema-e-booking-system",
  storageBucket: "cinema-e-booking-system.firebasestorage.app",
  messagingSenderId: "197666656967",
  appId: "1:197666656967:web:d750418f2a13492c2064e2"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };