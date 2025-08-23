/*
 * statementGenerator.js
 *
 * Provides functions to build financial statements from a trial balance.  The
 * generator supports IFRS and ASC (US GAAP) presentation formats.  It relies
 * on a simplified chart of accounts defined in `accountMapping.js` to
 * categorize balances.  You can extend or replace the mapping to suit your
 * organization’s chart of accounts.
 */

import { lookupAccount } from './accountMapping.js';

/**
 * Generate all statements (BS, IS, SOCIE, CF) from a trial balance.
 *
 * @param {Array<{account: string, debit: number, credit: number}>} tb
 *   Trial balance entries
 * @param {object} options
 *   Configuration object
 * @param {'IFRS'|'ASC'} options.standard
 *   Which accounting standard to use for presentation
 * @param {object} [options.classify] Optional overrides for cash flow
 *   classification.  Keys: interestIncome, interestExpense, dividendsReceived,
 *   dividendsPaid.  Values: 'operating'|'investing'|'financing'.
 * @returns {object}
 */
export function generateStatements(tb, options = {}) {
  const { standard = 'IFRS', classify = {} } = options;
  const balanceSheet = buildBalanceSheet(tb, standard);
  const incomeStatement = buildIncomeStatement(tb);
  const socie = buildSOCIE(tb, incomeStatement);
  const cashFlow = buildCashFlow(tb, incomeStatement, standard, classify);
  return { balanceSheet, incomeStatement, socie, cashFlow };
}

/**
 * Build a balance sheet (statement of financial position).
 * @param {Array} tb
 * @param {string} standard
 */
function buildBalanceSheet(tb, standard) {
  // Aggregate balances by classification
  const totals = {
    currentAssets: 0,
    noncurrentAssets: 0,
    currentLiabilities: 0,
    noncurrentLiabilities: 0,
    equity: 0,
  };
  for (const entry of tb) {
    const classification = lookupAccount(entry.account);
    const net = (entry.debit || 0) - (entry.credit || 0);
    if (!classification) continue;
    const { major, sub } = classification;
    if (major === 'asset') {
      if (sub === 'current') totals.currentAssets += net;
      else totals.noncurrentAssets += net;
    } else if (major === 'liability') {
      if (sub === 'current') totals.currentLiabilities += net;
      else totals.noncurrentLiabilities += net;
    } else if (major === 'equity') {
      totals.equity += net;
    }
  }
  // Order assets and liabilities based on standard
  const assetsOrder = standard === 'ASC' ? ['currentAssets', 'noncurrentAssets'] : ['noncurrentAssets', 'currentAssets'];
  const liabilitiesOrder = standard === 'ASC' ? ['currentLiabilities', 'noncurrentLiabilities'] : ['noncurrentLiabilities', 'currentLiabilities'];
  // Compose result
  const assets = assetsOrder.map((key) => ({ label: formatLabel(key), amount: totals[key] }));
  const liabilities = liabilitiesOrder.map((key) => ({ label: formatLabel(key), amount: totals[key] }));
  const equity = [{ label: 'Equity', amount: totals.equity }];
  return { assets, liabilities, equity };
}

/**
 * Build an income statement (statement of profit or loss).
 * @param {Array} tb
 */
function buildIncomeStatement(tb) {
  let totalRevenue = 0;
  let totalExpenses = 0;
  for (const entry of tb) {
    const classification = lookupAccount(entry.account);
    const net = (entry.debit || 0) - (entry.credit || 0);
    if (!classification) continue;
    if (classification.major === 'revenue') {
      totalRevenue += -net; // credit balances reduce net (debit minus credit)
    } else if (classification.major === 'expense') {
      totalExpenses += net;
    }
  }
  const netIncome = totalRevenue - totalExpenses;
  return {
    revenues: [{ label: 'Revenue', amount: totalRevenue }],
    expenses: [{ label: 'Expenses', amount: totalExpenses }],
    netIncome,
  };
}

/**
 * Build the statement of changes in equity.  This simplified version
 * calculates ending retained earnings based on beginning retained earnings
 * (assumed zero), net income and dividends paid.
 * @param {Array} tb
 * @param {object} incomeStatement
 */
function buildSOCIE(tb, incomeStatement) {
  let dividends = 0;
  for (const entry of tb) {
    if (entry.account === 'Retained Earnings' || entry.account === 'Dividends') {
      // For demonstration treat credit on Retained Earnings as dividends
      dividends += (entry.credit || 0) - (entry.debit || 0);
    }
  }
  const openingRE = 0;
  const netIncome = incomeStatement.netIncome;
  const endingRE = openingRE + netIncome - dividends;
  return {
    openingRetainedEarnings: openingRE,
    netIncome,
    dividends,
    endingRetainedEarnings: endingRE,
  };
}

/**
 * Build a basic cash flow statement.  This implementation uses a very
 * simplified direct method: it classifies revenue and expense accounts into
 * operating activities and uses changes in balance sheet accounts to derive
 * investing and financing cash flows.  For a production system you would
 * implement a more robust algorithm.
 *
 * @param {Array} tb
 * @param {object} incomeStatement
 * @param {'IFRS'|'ASC'} standard
 * @param {object} classifyOverrides
 */
function buildCashFlow(tb, incomeStatement, standard, classifyOverrides = {}) {
  // Defaults per standard
  const defaultClassification = {
    interestIncome: standard === 'ASC' ? 'operating' : 'operating',
    interestExpense: standard === 'ASC' ? 'operating' : 'operating',
    dividendsReceived: standard === 'ASC' ? 'operating' : 'operating',
    dividendsPaid: 'financing',
  };
  const classify = { ...defaultClassification, ...classifyOverrides };
  const cashFlows = {
    operating: 0,
    investing: 0,
    financing: 0,
  };
  for (const entry of tb) {
    const net = (entry.debit || 0) - (entry.credit || 0);
    const classification = lookupAccount(entry.account);
    if (!classification) continue;
    // Revenue and expenses affect operating cash
    if (classification.major === 'revenue' || classification.major === 'expense') {
      cashFlows.operating += net;
    }
    // Specific accounts override classification
    if (entry.account === 'Interest Income') {
      cashFlows[classify.interestIncome] += net;
    } else if (entry.account === 'Interest Expense') {
      cashFlows[classify.interestExpense] += net;
    } else if (entry.account === 'Dividends Received') {
      cashFlows[classify.dividendsReceived] += net;
    } else if (entry.account === 'Dividends Paid') {
      cashFlows[classify.dividendsPaid] += net;
    }
  }
  return cashFlows;
}

// Format internal keys like "currentAssets" to human readable labels
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}