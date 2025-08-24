import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseReady, firebaseConfigMissing } from "../firebase";

// TODO: import your existing subcomponents here if needed, e.g.:
// import TrialBalanceUpload from "./TrialBalanceUpload";
// import StatementSelector from "./StatementSelector";
// import StatementViewer from "./StatementViewer";

export default function Dashboard(){
  // Config checks first
  if (!firebaseReady) {
    return (
      <div style={{padding:"1rem"}}>
        <h3>Configuration error</h3>
        <p>Firebase env vars are missing in Netlify.</p>
        <div><b>Missing:</b> {firebaseConfigMissing.join(", ")}</div>
      </div>
    );
  }

  const [user, setUser] = useState(auth?.currentUser ?? undefined);
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return () => unsub();
  }, []);

  if (user === undefined) return <div style={{padding:"1rem"}}>Loading…</div>;
  if (!user) return <div style={{padding:"1rem"}}>You’re signed out. Go to Login.</div>;

  // Minimal stable UI; plug your components back in below once stable
  return (
    <div style={{padding:"1rem"}}>
      <h2>Dashboard</h2>
      <div>User: {user.email}</div>
      <p>Upload a TB and generate statements.</p>

      {/* Example placeholders:
      <TrialBalanceUpload />
      <StatementSelector />
      <StatementViewer />
      */}
    </div>
  );
}
