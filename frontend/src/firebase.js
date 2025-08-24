import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ← add this

// Read Vite env (client-side)
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseConfigMissing = missing;
export const firebaseReady = missing.length === 0;

if (!firebaseReady) {
  console.error("FISCMIND: Missing Firebase env keys:", missing);
}

export const app  = firebaseReady ? (getApps()[0] || initializeApp(cfg)) : undefined;
export const auth = firebaseReady ? getAuth(app) : undefined;
export const db   = firebaseReady ? getFirestore(app) : undefined; // ← export db
