import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseReady, firebaseConfigMissing } from "../firebase";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  if (!firebaseReady) {
    return (
      <div style={{ padding: "1rem" }}>
        <b>Configuration error:</b> Firebase environment variables are missing.
        <div style={{ marginTop: 8 }}>
          Missing keys: {firebaseConfigMissing.join(", ")}
        </div>
      </div>
    );
  }

  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  if (user === undefined) return <div style={{ padding: "1rem" }}>Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
