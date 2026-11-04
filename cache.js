/** Cache memori sederhana (TTL detik) */
const store = new Map();

function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    store.delete(key);
    return null;
  }
  return hit.val;
}

function set(key, val, ttlSec) {
  store.set(key, { val, exp: Date.now() + (ttlSec || 300) * 1000 });
}

function wrap(key, ttlSec, fn) {
  const hit = get(key);
  if (hit) return Promise.resolve(hit);
  return Promise.resolve()
    .then(fn)
    .then((val) => {
      set(key, val, ttlSec);
      return val;
    });
}

module.exports = { get, set, wrap };
