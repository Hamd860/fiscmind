import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Which keys are missing (if any)
export const firebaseConfigMissing = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

// Ready only when no keys are missing
export const firebaseReady = firebaseConfigMissing.length === 0;

// Create singletons safely (no duplicate exports)
export const app  = firebaseReady ? (getApps()[0] ?? initializeApp(cfg)) : undefined;
export const auth = app ? getAuth(app) : undefined;
export const db   = app ? getFirestore(app) : undefined;
