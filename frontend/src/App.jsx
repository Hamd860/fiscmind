import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HealthBanner from "./components/HealthBanner";
import RequireAuth from "./components/RequireAuth";

import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/* keep non-Route UI OUTSIDE <Routes> */}
      <HealthBanner kind="info" message="Welcome to Fiscmind" />

      <Routes>
        {/* redirect home to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{padding:12}}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
