// currency.js
// Helper functions for multi‑currency support.  Rates are retrieved from
// the backend serverless function `getRates.js` which proxies a public FX API.

/**
 * Fetch exchange rates relative to a base currency.  Uses the backend
 * endpoint defined by VITE_BACKEND_URL (default: `/api`).  Returns an object
 * mapping currency codes to rates.
 * @param {string} base Base currency (e.g. "USD")
 */
export async function fetchRates(base = 'USD') {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '/api';
  const resp = await fetch(`${baseUrl}/getRates?base=${encodeURIComponent(base)}`);
  if (!resp.ok) throw new Error(`Failed to fetch rates: ${resp.statusText}`);
  return resp.json();
}

/**
 * Convert an amount from one currency to another using the provided rates.
 * @param {number} amount
 * @param {string} from
 * @param {string} to
 * @param {object} rates
 */
export function convert(amount, from, to, rates) {
  if (from === to) return amount;
  // Rates are relative to base; compute cross rate via USD or base
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) throw new Error(`Missing rate for ${from} or ${to}`);
  // Convert amount to base currency then to target
  const inBase = amount / fromRate;
  return inBase * toRate;
}