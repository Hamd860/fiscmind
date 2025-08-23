import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * TrialBalanceUpload allows users to select a CSV or Excel file containing
 * their trial balance.  The file is parsed client‑side into an array of
 * objects with `account`, `debit`, `credit` and optional `currency` fields.
 * The parsed data is passed up via the `onLoad` callback.
 */
export default function TrialBalanceUpload({ onLoad }) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let data = [];
      if (ext === 'csv') {
        // Parse CSV using PapaParse
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = result.data.map((row) => ({
          account: row.account || row.Account,
          debit: parseFloat(row.debit || row.Debit || 0),
          credit: parseFloat(row.credit || row.Credit || 0),
          currency: row.currency || row.Currency || null,
        }));
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Parse Excel using xlsx
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        data = json.map((row) => ({
          account: row.account || row.Account,
          debit: parseFloat(row.debit || row.Debit || 0),
          credit: parseFloat(row.credit || row.Credit || 0),
          currency: row.currency || row.Currency || null,
        }));
      } else {
        setError('Unsupported file type. Please upload a CSV or Excel file.');
        return;
      }
      onLoad(data);
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. Ensure it has columns: account, debit, credit, [currency].');
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">1. Upload Trial Balance</h2>
      <p className="mb-2 text-sm text-gray-600">Upload a CSV or Excel file with columns: <code>account</code>, <code>debit</code>, <code>credit</code> and optional <code>currency</code>.  Debit and credit amounts should be positive numbers.</p>
      <div className="flex items-center">
        <input type="file" accept=".csv, .xls, .xlsx" onChange={handleFile} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
      </div>
      {fileName && <p className="mt-2 text-sm text-gray-700">Loaded: {fileName}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}