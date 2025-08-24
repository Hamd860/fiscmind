import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const email = auth?.currentUser?.email || "—";

  return (
    <section className="card p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">User: {email}</p>
      <p className="mt-1 text-sm text-slate-600">Upload a TB and generate statements.</p>

      <div className="mt-5 flex gap-3">
        <a href="/upload" className="btn">Upload Trial Balance</a>
        <button
          className="btn"
          onClick={() => signOut(auth).catch(console.error)}
          title="Sign out"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
