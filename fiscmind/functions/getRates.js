const fetch = require('node-fetch');

/**
 * Netlify/Firebase Function: getRates
 *
 * Returns exchange rates relative to a base currency.  The base is passed via
 * the `base` query parameter.  Rates are retrieved from a public API defined
 * by the `FX_API_URL` environment variable.  The API should accept a URL
 * pattern like `${FX_API_URL}/{base}` or `${FX_API_URL}?base={base}`.  The
 * response must include a `rates` object keyed by currency code.
 */
exports.handler = async (event) => {
  const url = process.env.FX_API_URL;
  const base = event.queryStringParameters?.base || 'USD';
  if (!url) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'FX_API_URL not configured' }),
    };
  }
  try {
    // Determine whether the API expects base as path or query string
    let apiUrl = url;
    if (url.includes('{base}')) {
      apiUrl = url.replace('{base}', base);
    } else if (url.includes('?')) {
      apiUrl = `${url}&base=${encodeURIComponent(base)}`;
    } else {
      apiUrl = `${url}/${encodeURIComponent(base)}`;
    }
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`Failed to fetch rates (${resp.status})`);
    const json = await resp.json();
    // Support both { rates: {...} } and {...} root structures
    const rates = json.rates || json;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(rates),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};