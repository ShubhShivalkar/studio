
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJskznDoqk1wHCKj5s2VfSHcdIlnzBjv8",
  authDomain: "soulful-sync.firebaseapp.com",
  projectId: "soulful-sync",
  storageBucket: "soulful-sync.firebasestorage.app",
  messagingSenderId: "739237901979",
  appId: "1:739237901979:web:ebf71a07cfc0512a4d383e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
