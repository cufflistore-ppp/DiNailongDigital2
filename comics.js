const express = require('express');
const fs = require('fs');
const path = require('path');
const { getJson } = require('../utils/fetch');
const cache = require('../utils/cache');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'data', 'comics.json');
const DEV_EMAIL = 'raffliraffli649@gmail.com';

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const j = JSON.parse(raw);
    if (!j.items) j.items = [];
    return j;
  } catch (e) {
    return { updatedAt: 0, items: [] };
  }
}

function writeDb(db) {
  db.updatedAt = Date.now();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function isDev(req) {
  const email = String(req.headers['x-dev-email'] || req.query.devEmail || '').toLowerCase();
  const key = String(req.headers['x-dev-key'] || req.query.devKey || '');
  // simple: email developer ATAU key env NAILONG_DEV_KEY
  if (email === DEV_EMAIL.toLowerCase()) return true;
  if (process.env.NAILONG_DEV_KEY && key === process.env.NAILONG_DEV_KEY) return true;
  return false;
}

/** Sinkron sample dari Jikan ke database lokal (katalog awal) */
async function jikanTop(page = 1) {
  const url = 'https://api.jikan.moe/v4/top/manga?page=' + page + '&limit=25';
  const data = await getJson(url);
  return (data.data || []).map((m) => ({
    id: 'mal_' + m.mal_id,
    malId: m.mal_id,
    title: m.title || 'Untitled',
    titleEnglish: m.title_english || '',
    cover:
      (m.images && m.images.jpg && (m.images.jpg.large_image_url || m.images.jpg.image_url)) ||
      '',
    type: m.type || 'Manga',
    chapters: m.chapters,
    score: m.score,
    synopsis: (m.synopsis || '').slice(0, 500),
    url: m.url,
    source: 'MyAnimeList',
    active: true,
    createdAt: Date.now()
  }));
}

async function jikanSearch(q, page = 1) {
  const url =
    'https://api.jikan.moe/v4/manga?q=' +
    encodeURIComponent(q) +
    '&page=' +
    page +
    '&limit=25&order_by=members&sort=desc';
  const data = await getJson(url);
  return (data.data || []).map((m) => ({
    id: 'mal_' + m.mal_id,
    malId: m.mal_id,
    title: m.title || m.title_english || 'Untitled',
    cover:
      (m.images && m.images.jpg && (m.images.jpg.large_image_url || m.images.jpg.image_url)) ||
      '',
    type: m.type || 'Manga',
    chapters: m.chapters,
    score: m.score,
    synopsis: (m.synopsis || '').slice(0, 500),
    url: m.url,
    source: 'MyAnimeList',
    active: true,
    createdAt: Date.now()
  }));
}

/** GET daftar dari database lokal (+ optional seed dari Jikan jika kosong) */
router.get('/db', async (req, res) => {
  try {
    let db = readDb();
    if (!db.items.length && req.query.seed === '1') {
      const seeded = await jikanTop(1);
      db.items = seeded;
      writeDb(db);
    }
    let items = (db.items || []).filter((x) => x.active !== false);
    const q = String(req.query.q || '').trim().toLowerCase();
    if (q) {
      items = items.filter(
        (x) =>
          (x.title || '').toLowerCase().includes(q) ||
          (x.titleEnglish || '').toLowerCase().includes(q)
      );
    }
    res.json({
      ok: true,
      count: items.length,
      updatedAt: db.updatedAt,
      results: items
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** GET search: prioritaskan DB, fallback Jikan */
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const page = parseInt(req.query.page, 10) || 1;
  try {
    const db = readDb();
    let local = (db.items || []).filter((x) => x.active !== false);
    if (q) {
      const ql = q.toLowerCase();
      local = local.filter(
        (x) =>
          (x.title || '').toLowerCase().includes(ql) ||
          (x.titleEnglish || '').toLowerCase().includes(ql)
      );
    }
    if (local.length >= 5 || (!q && local.length)) {
      return res.json({
        ok: true,
        source: 'database',
        count: local.length,
        results: local.slice(0, 50)
      });
    }
    const remote = await cache.wrap(
      'comic:s:' + q + ':' + page,
      300,
      () => (q ? jikanSearch(q, page) : jikanTop(page))
    );
    res.json({
      ok: true,
      source: 'jikan',
      count: remote.length,
      results: remote,
      note: 'Hasil live katalog. Simpan ke DB lewat POST /api/comics/db (developer).'
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/top', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  try {
    const db = readDb();
    if (db.items && db.items.length) {
      return res.json({
        ok: true,
        source: 'database',
        count: db.items.length,
        results: db.items.filter((x) => x.active !== false).slice(0, 50)
      });
    }
    const results = await cache.wrap('comic:top:' + page, 600, () => jikanTop(page));
    res.json({ ok: true, source: 'jikan', count: results.length, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/detail/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const db = readDb();
  const found = (db.items || []).find(
    (x) => x.id === id || String(x.malId) === id.replace(/\D/g, '')
  );
  if (found) return res.json({ ok: true, source: 'database', item: found });
  try {
    const malId = id.replace(/\D/g, '');
    const data = await getJson('https://api.jikan.moe/v4/manga/' + malId + '/full');
    const m = data.data;
    if (!m) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({
      ok: true,
      source: 'jikan',
      item: {
        id: 'mal_' + m.mal_id,
        malId: m.mal_id,
        title: m.title,
        cover:
          (m.images && m.images.jpg && (m.images.jpg.large_image_url || m.images.jpg.image_url)) ||
          '',
        synopsis: m.synopsis,
        score: m.score,
        url: m.url
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Developer: tambah / update item ke database */
router.post('/db', express.json(), (req, res) => {
  if (!isDev(req)) {
    return res.status(403).json({ ok: false, error: 'Hanya developer' });
  }
  const body = req.body || {};
  const db = readDb();
  if (!body.title) {
    return res.status(400).json({ ok: false, error: 'title wajib' });
  }
  const id = body.id || 'local_' + Date.now();
  const item = {
    id,
    malId: body.malId || null,
    title: body.title,
    titleEnglish: body.titleEnglish || '',
    cover: body.cover || '',
    type: body.type || 'Komik',
    chapters: body.chapters || null,
    score: body.score || null,
    synopsis: body.synopsis || '',
    url: body.url || '',
    source: body.source || 'local',
    active: body.active !== false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  const idx = db.items.findIndex((x) => x.id === id);
  if (idx >= 0) db.items[idx] = Object.assign({}, db.items[idx], item);
  else db.items.unshift(item);
  writeDb(db);
  res.json({ ok: true, item });
});

/** Developer: hapus */
router.delete('/db/:id', (req, res) => {
  if (!isDev(req)) {
    return res.status(403).json({ ok: false, error: 'Hanya developer' });
  }
  const id = req.params.id;
  const db = readDb();
  db.items = (db.items || []).filter((x) => x.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

/** Developer: seed dari top Jikan */
router.post('/db/seed', async (req, res) => {
  if (!isDev(req)) {
    return res.status(403).json({ ok: false, error: 'Hanya developer' });
  }
  try {
    const seeded = await jikanTop(1);
    const db = readDb();
    const seen = {};
    db.items.forEach((x) => {
      seen[x.id] = 1;
    });
    seeded.forEach((x) => {
      if (!seen[x.id]) db.items.push(x);
    });
    writeDb(db);
    res.json({ ok: true, count: db.items.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
