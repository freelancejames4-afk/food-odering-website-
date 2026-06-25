import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configured using the user's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGqDYi2UjgaaV_H-LrwObCRs34-f-5Who",
  authDomain: "fresh-delivery-39215.firebaseapp.com",
  projectId: "fresh-delivery-39215",
  storageBucket: "fresh-delivery-39215.firebasestorage.app",
  messagingSenderId: "126130322001",
  appId: "1:126130322001:web:c5c4931ebe94ddf4459670"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider setup
export const googleProvider = new GoogleAuthProvider();
// Set custom parameters if needed (e.g., prompt select_account)
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};

export type { FirebaseUser };
