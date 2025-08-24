import { Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import HealthBanner from "./components/HealthBanner";
import RequireAuth from "./components/RequireAuth";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

function Shell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-slate-800">
            Fiscmind
          </Link>
          <nav className="text-sm">
            <Link className="hover:underline" to="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>

      <HealthBanner kind="info" message="Welcome to Fiscmind" />
      <main className="mx-auto max-w-6xl px-4 pb-16">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}><Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<div className="text-sm text-slate-600 p-4">Not Found</div>} />
      </Routes>
      <Outlet />
    </Shell>
  );
}
