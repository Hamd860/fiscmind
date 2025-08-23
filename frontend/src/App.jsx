import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

/**
 * The top level component defines application routes and protects the dashboard
 * by redirecting unauthenticated users to the login page.  When the user
 * authenticates, their role is loaded from Firestore to determine feature
 * access (Standard vs. Pro).
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const unsub = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        // Load user role from Firestore
        try {
          const ref = doc(db, 'users', current.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role || 'standard');
          } else {
            setRole('standard');
          }
        } catch (err) {
          console.error('Failed to fetch user role', err);
          setRole('standard');
        }
        navigate('/dashboard');
      } else {
        setRole(null);
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} role={role} /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}