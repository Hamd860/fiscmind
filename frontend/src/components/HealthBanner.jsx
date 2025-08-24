import { firebaseReady, firebaseConfigMissing } from "../firebase";

export default function HealthBanner(){
  if (firebaseReady) return null;
  return (
    <div style={{background:"#fff3cd", color:"#664d03", padding:"8px 12px", border:"1px solid #ffecb5"}}>
      <b>Fiscmind config warning:</b> Missing Firebase keys → {firebaseConfigMissing.join(", ")}.
      Check Netlify → Environment variables (VITE_FIREBASE_*).
    </div>
  );
}
