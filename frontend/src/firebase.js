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

export const firebaseConfigMissing = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseReady = firebaseConfigMissing.length === 0;

let app, auth, db; // declare first (NOT exported yet)

if (firebaseReady) {
  app = getApps()[0] || initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.error("[fiscmind] Missing Firebase keys:", firebaseConfigMissing);
}

export { app, auth, db };      // single named export
export default app;            // optional default export
