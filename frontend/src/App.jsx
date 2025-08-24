import { Routes, Route, Navigate } from "react-router-dom";
import HealthBanner from "./components/HealthBanner";
import RequireAuth from "./components/RequireAuth";

import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  return (
    <>
      {/* UI that should always show, but NOT inside <Routes> */}
      <HealthBanner kind="info" message="Welcome to Fiscmind" />

      <Routes>
        {/* redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected branch */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 12 }}>Not Found</div>} />
      </Routes>
    </>
  );
}
