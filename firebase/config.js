import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDaS_LwnTTQe7zFwkz6FKrLmvdyzcM0sC8",
  authDomain: "tiec-cuoi.firebaseapp.com",
  projectId: "tiec-cuoi",
  storageBucket: "tiec-cuoi.firebasestorage.app",
  messagingSenderId: "1099149193340",
  appId: "1:1099149193340:web:ee90c90197116e2c0dd9f9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
