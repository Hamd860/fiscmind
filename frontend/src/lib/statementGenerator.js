import { lookupAccount } from './accountMapping.js';

function getNet(row, meta) {
  const debit = Number(row.debit || 0);
  const credit = Number(row.credit || 0);
  let net = meta.normal === 'debit' ? debit - credit : credit - debit;
  if (meta.contra) net *= -1;
  return net;
}

export function generateStatements(tb, standard = 'IFRS') {
  // initialize totals...
  let balanceSheet = { assets: { current: 0, noncurrent: 0 }, liabilities: { current: 0, noncurrent: 0 }, equity: 0 };
  let income = { revenue: 0, expenses: 0 };
  let socie = { openingRetainedEarnings: 0, netIncome: 0, dividends: 0, endingRetainedEarnings: 0 };
  let cashFlow = { operating: 0, investing: 0, financing: 0 };

  // iterate through trial balance rows
  for (const row of tb) {
    const acct = lookupAccount(row.account) || {};
    const net = getNet(row, acct);

    // classify net into assets, liabilities, equity, revenue, expenses etc.
    if (acct.major === 'Asset') {
      if (acct.sub === 'current') balanceSheet.assets.current += net;
      else balanceSheet.assets.noncurrent += net;
    } else if (acct.major === 'Liability') {
      if (acct.sub === 'current') balanceSheet.liabilities.current += net;
      else balanceSheet.liabilities.noncurrent += net;
    } else if (acct.major === 'Equity') {
      if (row.account.toLowerCase().includes('retained earnings')) socie.openingRetainedEarnings += (Number(row.credit) - Number(row.debit));
      else if (row.account.toLowerCase().includes('dividend')) socie.dividends += net;
      else balanceSheet.equity += net;
    } else if (acct.major === 'Revenue') {
      income.revenue += net;
      cashFlow.operating += net; // treat revenue as cash inflow
    } else if (acct.major === 'Expense') {
      income.expenses += net;
      cashFlow.operating -= Math.abs(net); // treat expense as cash outflow
    }
  }

  // compute net income and retained earnings
  socie.netIncome = income.revenue - income.expenses;
  socie.endingRetainedEarnings = socie.openingRetainedEarnings + socie.netIncome - socie.dividends;

  // IFRS vs ASC ordering (assets / liabilities)
  if (standard === 'ASC') {
    // place current assets first, current liabilities first
  } else {
    // IFRS ordering: noncurrent first if needed
  }

  return { balanceSheet, incomeStatement: { ...income, netIncome: socie.netIncome }, socie, cashFlow };
}
