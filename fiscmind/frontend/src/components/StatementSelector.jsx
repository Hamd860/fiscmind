import React, { useState } from 'react';
import { generateStatements } from '../lib/statementGenerator.js';
import { fetchRates, convert } from '../lib/currency.js';

/**
 * StatementSelector allows users to choose a reporting standard (IFRS or ASC) and
 * currency (for Pro users), then generate the financial statements.
 */
export default function StatementSelector({ tb, onGenerate, standard, setStandard, currency, setCurrency, isPro }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      let convertedTb = tb;
      if (isPro) {
        // Fetch rates and convert each entry to selected currency if necessary
        const rates = await fetchRates(currency);
        convertedTb = tb.map((entry) => {
          const { debit, credit, currency: entryCurrency } = entry;
          if (entryCurrency && entryCurrency !== currency) {
            const debConverted = convert(debit, entryCurrency, currency, rates);
            const credConverted = convert(credit, entryCurrency, currency, rates);
            return { ...entry, debit: debConverted, credit: credConverted, currency };
          }
          return { ...entry, currency };
        });
      }
      const statements = generateStatements(convertedTb, { standard });
      onGenerate(statements);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">2. Generate Statements</h2>
      <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="IFRS">IFRS</option>
            <option value="ASC">ASC (US GAAP)</option>
          </select>
        </div>
        {isPro && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. USD"
            />
            <p className="text-xs text-gray-500 mt-1">ISO currency code (e.g. USD, EUR, PKR)</p>
          </div>
        )}
        <div className="self-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
    </section>
  );
}