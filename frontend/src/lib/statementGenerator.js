import * as ACC from "./accountMapping";

/* -------- mapping fallback (works even if mapAccount isn't exported) -------- */
const norm = (s) => (s ?? "").toString().trim().toLowerCase();
const lookupMapping = (name) => {
  const n = norm(name);
  const dicts = [ACC.CHART, ACC.ALIASES, ACC.MAP, ACC.default].filter(Boolean);

  for (const d of dicts) {
    if (d[name]) return d[name];
    for (const k of Object.keys(d)) if (norm(k) === n) return d[k];
  }

  // Heuristic mapping by keywords (covers common SaaS labels)
  if (n.includes("revenue") || n.includes("sales")) return { type: "revenue" };
  if (n.includes("cogs") || n.includes("cost of goods") || n.includes("hosting") || n.includes("infrastructure") || n.includes("support") || n.includes("licenses"))
    return { type: "expense", subtype: "cogs" };
  if (n.includes("expense") || n.includes("tax")) return { type: "expense" };

  if (n.includes("accumulated") && (n.includes("depreciation") || n.includes("amort")))
    return { type: "contra-asset" };

  if (n.includes("cash") || n.includes("receivable") || n.includes("inventory") || n.includes("prepaid") || n.includes("deferred contract cost"))
    return { type: "asset", subtype: "current" };

  if (n.includes("property") || n.includes("equipment") || n.includes("intangible") || n.includes("goodwill") || n.includes("right-of-use") || n.includes("rou"))
    return { type: "asset", subtype: "noncurrent" };

  if (n.includes("payable") || n.includes("deferred revenue") || n.includes("accrued") || n.includes("lease liability") || n.includes("bank loan") || n.includes("loan")) {
    const isNoncurrent = n.includes("noncurrent") || n.includes("long") || n.includes("non current");
    return { type: "liability", subtype: isNoncurrent ? "noncurrent" : "current" };
  }

  if (n.includes("retained earning") || n.includes("share capital") || n.includes("additional paid-in capital") || n.includes("equity"))
    return { type: "equity" };

  return { type: "unmapped" };
};

const mapAccount = (name) => (typeof ACC.mapAccount === "function" ? ACC.mapAccount(name) : lookupMapping(name));

/* -------------------- normal-balance helpers & numbers -------------------- */
const normalSide = (type) => (["asset", "expense", "dividend"].includes(type) ? "debit" : "credit");
const toNum = (v) => (v == null ? 0 : Number(v) || 0);
const signedAmount = (row, type) => {
  const d = toNum(row.debit), c = toNum(row.credit);
  return normalSide(type) === "debit" ? d - c : c - d;
};

/* ------------------------------ main function ----------------------------- */
export function generateStatements(rows, framework = "IFRS") {
  const totals = {
    assets: { current: 0, noncurrent: 0 },
    liabilities: { current: 0, noncurrent: 0 },
    equity: { total: 0 },
    income: { revenue: 0, expense: 0, net: 0 },
    socie: { openingRE: 0, dividends: 0, endingRE: 0 },
    cashflow: { operating: 0, investing: 0, financing: 0 },
    nonCash: { dep: 0, amort: 0, stockComp: 0 },
  };

  for (const row of rows || []) {
    const info = mapAccount(row.account) || {};
    const type = info.type || "unmapped";
    const sub = info.subtype;

    // Income Statement
    if (type === "revenue") totals.income.revenue += signedAmount(row, "revenue");
    if (type === "expense") {
      totals.income.expense += signedAmount(row, "expense");
      const nm = norm(row.account);
      if (nm.includes("depreciation")) totals.nonCash.dep += toNum(row.debit) - toNum(row.credit);
      if (nm.includes("amortization")) totals.nonCash.amort += toNum(row.debit) - toNum(row.credit);
      if (nm.includes("stock") && nm.includes("comp")) totals.nonCash.stockComp += toNum(row.debit) - toNum(row.credit);
    }

    // Assets
    if (type === "asset") {
      const v = signedAmount(row, "asset");
      (sub === "current" ? totals.assets.current : totals.assets.noncurrent) += v;
    }

    // Contra-assets
    if (type === "contra-asset") {
      const v = signedAmount(row, "contra-asset"); // credit-normal positive
      (sub === "current" ? totals.assets.current : totals.assets.noncurrent) -= v;
    }

    // Liabilities
    if (type === "liability") {
      const v = signedAmount(row, "liability");
      (sub === "current" ? totals.liabilities.current : totals.liabilities.noncurrent) += v;
    }

    // Equity (+ capture opening RE if present)
    if (type === "equity") {
      totals.equity.total += signedAmount(row, "equity");
      const nm = norm(row.account);
      if (nm.includes("retained") && nm.includes("earning")) {
        totals.socie.openingRE += toNum(row.credit) - toNum(row.debit); // credit-normal
      }
    }

    // Dividends (if mapped)
    if (type === "dividend") totals.socie.dividends += signedAmount(row, "dividend"); // debit-normal
  }

  totals.income.net = totals.income.revenue - totals.income.expense;

  // SOCIE rollforward
  const netIncome = totals.income.net;
  const dividends = totals.socie.dividends || 0;
  const openingRE = totals.socie.openingRE || 0;
  const endingRE = openingRE + netIncome - dividends;
  totals.socie = { openingRE, netIncome, dividends, endingRE };

  // Simple CFO: net income + non-cash addbacks
  const nonCash = (totals.nonCash.dep || 0) + (totals.nonCash.amort || 0) + (totals.nonCash.stockComp || 0);
  totals.cashflow.operating = netIncome + nonCash;

  return {
    framework,
    balanceSheet: {
      assets: {
        current: Math.abs(totals.assets.current),
        noncurrent: Math.abs(totals.assets.noncurrent),
      },
      liabilities: {
        current: Math.abs(totals.liabilities.current),
        noncurrent: Math.abs(totals.liabilities.noncurrent),
      },
      equity: Math.abs(totals.equity.total),
    },
    incomeStatement: {
      revenue: totals.income.revenue,
      expenses: totals.income.expense,
      netIncome: totals.income.net,
    },
    socie: {
      openingRetainedEarnings: openingRE,
      netIncome,
      dividends,
      endingRetainedEarnings: endingRE,
    },
    cashFlow: {
      operating: totals.cashflow.operating,
      investing: 0,
      financing: 0,
    },
  };
}
