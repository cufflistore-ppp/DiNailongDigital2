const express = require('express');
const { getJson } = require('../utils/fetch');
const cache = require('../utils/cache');

const router = express.Router();

/** Anime / tontonan via Jikan + trailer YouTube jika ada */
async function animeSearch(q, page = 1) {
  const url =
    'https://api.jikan.moe/v4/anime?q=' +
    encodeURIComponent(q) +
    '&page=' +
    page +
    '&limit=25&order_by=members&sort=desc';
  const data = await getJson(url);
  return (data.data || []).map((a) => mapAnime(a));
}

async function animeTop(page = 1) {
  const data = await getJson(
    'https://api.jikan.moe/v4/top/anime?page=' + page + '&limit=25'
  );
  return (data.data || []).map((a) => mapAnime(a));
}

function mapAnime(a) {
  const trailerId =
    (a.trailer && a.trailer.youtube_id) ||
    (a.trailer && a.trailer.url && String(a.trailer.url).match(/[?&]v=([\w-]+)/)?.[1]) ||
    '';
  return {
    id: 'anime_' + a.mal_id,
    malId: a.mal_id,
    title: a.title || a.title_english || 'Untitled',
    titleEnglish: a.title_english || '',
    cover:
      (a.images && a.images.jpg && (a.images.jpg.large_image_url || a.images.jpg.image_url)) ||
      '',
    type: a.type || 'TV',
    episodes: a.episodes,
    status: a.status || '',
    score: a.score,
    synopsis: (a.synopsis || '').slice(0, 320),
    genres: (a.genres || []).map((g) => g.name),
    trailerId,
    trailerEmbed: trailerId
      ? 'https://www.youtube-nocookie.com/embed/' + trailerId
      : '',
    url: a.url,
    source: 'MyAnimeList'
  };
}

async function animeDetail(id) {
  const data = await getJson('https://api.jikan.moe/v4/anime/' + id + '/full');
  const a = data.data;
  if (!a) return null;
  const item = mapAnime(a);
  item.synopsis = a.synopsis || '';
  item.studios = (a.studios || []).map((s) => s.name);
  item.note =
    'Info & cover resmi. Episode full dari platform resmi (Crunchyroll, Netflix, dll).';
  return item;
}

router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const page = parseInt(req.query.page, 10) || 1;
  try {
    const results = await cache.wrap(
      'an:s:' + q + ':' + page,
      300,
      () => (q ? animeSearch(q, page) : animeTop(page))
    );
    res.json({ ok: true, count: results.length, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/top', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  try {
    const results = await cache.wrap('an:top:' + page, 600, () => animeTop(page));
    res.json({ ok: true, count: results.length, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/detail/:id', async (req, res) => {
  const id = String(req.params.id || '').replace(/\D/g, '');
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });
  try {
    const item = await cache.wrap('an:d:' + id, 600, () => animeDetail(id));
    if (!item) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
