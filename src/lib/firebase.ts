
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB8t1nn61fQUfSdPxG3S_EMPvwGWVb3pnA",
  authDomain: "anubhav-anuvaad.firebaseapp.com",
  projectId: "anubhav-anuvaad",
  storageBucket: "anubhav-anuvaad.firebasestorage.app",
  messagingSenderId: "954897713031",
  appId: "1:954897713031:web:0e53e59ae6e4768f777522",
  measurementId: "G-4ZXZLG112G"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
