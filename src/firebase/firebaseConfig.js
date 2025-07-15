
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvYoqdaQM5OHFtZgQAkbdUh49gbASQhfU",
  authDomain: "online-shop-cdf6a.firebaseapp.com",
  projectId: "online-shop-cdf6a",
  storageBucket: "online-shop-cdf6a.firebasestorage.app",
  messagingSenderId: "27825652517",
  appId: "1:27825652517:web:a15a249a8212ba6b4410cc",
  measurementId: "G-W2YMC12W7P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
const db = getFirestore(app);
 
export { app, auth, db };

