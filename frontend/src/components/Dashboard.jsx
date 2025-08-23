import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import TrialBalanceUpload from './TrialBalanceUpload.jsx';
import StatementSelector from './StatementSelector.jsx';
import StatementViewer from './StatementViewer.jsx';

/**
 * Dashboard component displays after the user logs in.  It holds the trial
 * balance state and orchestrates statement generation.  Pro users gain access
 * to currency selection and export features.
 */
export default function Dashboard({ user, role }) {
  const [tb, setTb] = useState([]);
  const [statements, setStatements] = useState(null);
  const [standard, setStandard] = useState('IFRS');
  const [currency, setCurrency] = useState('USD');

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Fiscmind Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <TrialBalanceUpload onLoad={setTb} />
          {tb.length > 0 && (
            <StatementSelector
              tb={tb}
              onGenerate={setStatements}
              standard={standard}
              setStandard={setStandard}
              currency={currency}
              setCurrency={setCurrency}
              isPro={role === 'pro'}
            />
          )}
          {statements && <StatementViewer statements={statements} isPro={role === 'pro'} />}
        </div>
      </main>
    </div>
  );
}