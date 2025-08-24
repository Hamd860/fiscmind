import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Outlet } from "react-router-dom";
import { auth, firebaseReady, firebaseConfigMissing } from "../firebase";
import HealthBanner from "./HealthBanner";

export default function RequireAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !auth) { setChecking(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false); });
    return () => unsub && unsub();
  }, []);

  if (checking) return <div style={{padding:12}}>Loading…</div>;

  if (!firebaseReady || !auth) {
    return (
      <HealthBanner
        kind="warn"
        message={`Firebase not initialised. Missing: ${firebaseConfigMissing.join(", ") || "unknown"}`}
      />
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
