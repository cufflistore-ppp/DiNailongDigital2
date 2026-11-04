const fetch = require('node-fetch');

async function getJson(url, opts = {}) {
  const headers = Object.assign(
    {
      Accept: 'application/json',
      'User-Agent': 'NailongDigitalMedia/1.0 (VPS; contact@nailong.local)'
    },
    opts.headers || {}
  );
  const r = await fetch(url, {
    headers,
    timeout: opts.timeout || 15000
  });
  if (!r.ok) {
    const err = new Error('HTTP ' + r.status + ' ' + url);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

module.exports = { getJson, fetch };
