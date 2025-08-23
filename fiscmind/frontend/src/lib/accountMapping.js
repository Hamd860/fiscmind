/*
 * accountMapping.js
 *
 * Defines a simplified chart of accounts and helper functions for mapping trial
 * balance entries into financial statement categories.  In practice you would
 * extend this mapping to cover all the accounts used in your general ledger.
 * Each account maps to a major classification and (optionally) a sub‑type.
 */

// Sample chart of accounts.  Each entry associates an account name (or code) to
// its classification.  If your TB uses numeric codes you can map on `code`.
export const CHART_OF_ACCOUNTS = {
  // Assets
  Cash: { major: 'asset', sub: 'current' },
  'Accounts Receivable': { major: 'asset', sub: 'current' },
  Inventory: { major: 'asset', sub: 'current' },
  'Prepaid Expenses': { major: 'asset', sub: 'current' },
  'Property, Plant & Equipment': { major: 'asset', sub: 'noncurrent' },
  'Intangible Assets': { major: 'asset', sub: 'noncurrent' },
  // Liabilities
  'Accounts Payable': { major: 'liability', sub: 'current' },
  'Accrued Expenses': { major: 'liability', sub: 'current' },
  'Deferred Revenue': { major: 'liability', sub: 'current' },
  'Long‑term Debt': { major: 'liability', sub: 'noncurrent' },
  // Equity
  'Share Capital': { major: 'equity' },
  'Retained Earnings': { major: 'equity' },
  // Revenue
  'Sales Revenue': { major: 'revenue' },
  'Service Revenue': { major: 'revenue' },
  'Interest Income': { major: 'revenue' },
  // Expenses
  'Cost of Goods Sold': { major: 'expense' },
  'Salary Expense': { major: 'expense' },
  'Rent Expense': { major: 'expense' },
  'Depreciation Expense': { major: 'expense' },
  'Interest Expense': { major: 'expense' },
};

/**
 * Look up an account’s classification.  If the account is not found the
 * function returns `unknown`, allowing the caller to handle unmapped entries.
 * @param {string} accountName
 * @returns {object|null}
 */
export function lookupAccount(accountName) {
  return CHART_OF_ACCOUNTS[accountName] ?? null;
}

/**
 * Sum trial balance entries by major and sub classification.
 *
 * @param {Array<{account: string, debit: number, credit: number}>} tb
 *   Trial balance entries; debit and credit should be positive numbers.
 * @returns {object} An object keyed by major classification with totals.
 */
export function summarizeByClassification(tb) {
  const summary = {};
  for (const entry of tb) {
    const { account, debit = 0, credit = 0 } = entry;
    const classification = lookupAccount(account);
    const net = (debit || 0) - (credit || 0);
    if (!classification) {
      // accumulate unknown accounts separately
      if (!summary.unknown) summary.unknown = 0;
      summary.unknown += net;
      continue;
    }
    const key = classification.major;
    if (!summary[key]) summary[key] = 0;
    summary[key] += net;
    // optionally accumulate by sub‑type for ordering (current/noncurrent)
    if (classification.sub) {
      const subKey = `${key}:${classification.sub}`;
      if (!summary[subKey]) summary[subKey] = 0;
      summary[subKey] += net;
    }
  }
  return summary;
}