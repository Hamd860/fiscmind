import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady, firebaseConfigMissing } from "../firebase";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (!firebaseReady) {
    return (
      <div style={{ padding: "1rem", maxWidth: 480 }}>
        <h2>Configuration error</h2>
        <p>Firebase environment variables are missing in Netlify.</p>
        <p><b>Missing:</b> {firebaseConfigMissing.join(", ")}</p>
      </div>
    );
  }

  const doSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pw);
      if (cred?.user) nav("/dashboard");
    } catch (ex) {
      console.error("signIn error:", ex);
      setErr(ex?.message || "Sign in failed");
    }
  };

  const doSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      if (cred?.user && db) {
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          createdAt: serverTimestamp(),
          role: "standard",
        }, { merge: true });
      }
      nav("/dashboard");
    } catch (ex) {
      console.error("signUp error:", ex);
      setErr(ex?.message || "Sign up failed");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Fiscmind – Sign in</h2>
      <form style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e)=>setPw(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={doSignIn} type="submit">Sign in</button>
          <button onClick={doSignUp} type="button">Create account</button>
        </div>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
