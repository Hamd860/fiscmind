import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  if (user === undefined) return <div style={{padding:"1rem"}}>Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
