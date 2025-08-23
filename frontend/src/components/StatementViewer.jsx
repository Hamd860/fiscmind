import React from 'react';
import Papa from 'papaparse';

/**
 * Render financial statements in a simple tabular format.  Pro users can
 * download the results as CSV files.  This component expects the `statements`
 * object returned from the `generateStatements` function.
 */
export default function StatementViewer({ statements, isPro }) {
  const { balanceSheet, incomeStatement, socie, cashFlow } = statements;

  const downloadCsv = () => {
    const csvParts = [];
    // Balance sheet
    csvParts.push('Balance Sheet');
    balanceSheet.assets.forEach((row) => {
      csvParts.push(Papa.unparse([[row.label, row.amount]]));
    });
    balanceSheet.liabilities.forEach((row) => {
      csvParts.push(Papa.unparse([[row.label, row.amount]]));
    });
    balanceSheet.equity.forEach((row) => {
      csvParts.push(Papa.unparse([[row.label, row.amount]]));
    });
    csvParts.push('\nIncome Statement');
    csvParts.push(Papa.unparse([[incomeStatement.revenues[0].label, incomeStatement.revenues[0].amount]]));
    csvParts.push(Papa.unparse([[incomeStatement.expenses[0].label, incomeStatement.expenses[0].amount]]));
    csvParts.push(Papa.unparse([['Net Income', incomeStatement.netIncome]]));
    csvParts.push('\nStatement of Changes in Equity');
    csvParts.push(Papa.unparse([
      ['Opening Retained Earnings', socie.openingRetainedEarnings],
      ['Net Income', socie.netIncome],
      ['Dividends', socie.dividends],
      ['Ending Retained Earnings', socie.endingRetainedEarnings],
    ]));
    csvParts.push('\nCash Flow Statement');
    csvParts.push(Papa.unparse([
      ['Operating', cashFlow.operating],
      ['Investing', cashFlow.investing],
      ['Financing', cashFlow.financing],
    ]));
    const csv = csvParts.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'statements.csv');
    link.click();
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">3. Statement Results</h2>
      <div className="space-y-6">
        {/* Balance Sheet */}
        <div>
          <h3 className="text-lg font-semibold">Balance Sheet</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Assets</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {balanceSheet.assets.map((row) => (
                    <tr key={row.label}>
                      <td className="py-1">{row.label}</td>
                      <td className="py-1 text-right">{row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-medium">Liabilities</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {balanceSheet.liabilities.map((row) => (
                    <tr key={row.label}>
                      <td className="py-1">{row.label}</td>
                      <td className="py-1 text-right">{row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {balanceSheet.equity.map((row) => (
                    <tr key={row.label}>
                      <td className="py-1 font-medium">{row.label}</td>
                      <td className="py-1 text-right">{row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Income Statement */}
        <div>
          <h3 className="text-lg font-semibold">Income Statement</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1">{incomeStatement.revenues[0].label}</td>
                <td className="py-1 text-right">{incomeStatement.revenues[0].amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">{incomeStatement.expenses[0].label}</td>
                <td className="py-1 text-right">{incomeStatement.expenses[0].amount.toFixed(2)}</td>
              </tr>
              <tr className="font-medium">
                <td className="py-1">Net Income</td>
                <td className="py-1 text-right">{incomeStatement.netIncome.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* SOCIE */}
        <div>
          <h3 className="text-lg font-semibold">Statement of Changes in Equity</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1">Opening Retained Earnings</td>
                <td className="py-1 text-right">{socie.openingRetainedEarnings.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">Net Income</td>
                <td className="py-1 text-right">{socie.netIncome.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">Dividends</td>
                <td className="py-1 text-right">{socie.dividends.toFixed(2)}</td>
              </tr>
              <tr className="font-medium">
                <td className="py-1">Ending Retained Earnings</td>
                <td className="py-1 text-right">{socie.endingRetainedEarnings.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Cash Flow */}
        <div>
          <h3 className="text-lg font-semibold">Cash Flow Statement</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1">Operating Activities</td>
                <td className="py-1 text-right">{cashFlow.operating.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">Investing Activities</td>
                <td className="py-1 text-right">{cashFlow.investing.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">Financing Activities</td>
                <td className="py-1 text-right">{cashFlow.financing.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {isPro && (
          <div className="text-right">
            <button
              onClick={downloadCsv}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Download CSV
            </button>
          </div>
        )}
      </div>
    </section>
  );
}