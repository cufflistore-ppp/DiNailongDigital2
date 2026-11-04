const express = require('express');
const { getJson } = require('../utils/fetch');
const cache = require('../utils/cache');

const router = express.Router();

const PIPED = [
  'https://piped.video',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de'
];

function normalize(list) {
  return (list || [])
    .map((v) => {
      let id = v.videoId || v.id || '';
      if (typeof id === 'object') id = id.videoId || '';
      if (v.url && !id) {
        id = String(v.url).replace(/.*v=/, '').replace(/.*\//, '').split('&')[0];
      }
      const thumb =
        v.thumbnail ||
        (v.thumbnails && v.thumbnails[0] && v.thumbnails[0].url) ||
        (v.videoThumbnails &&
          ((v.videoThumbnails.find((t) => t.quality === 'medium') || {})
            .url ||
            (v.videoThumbnails[0] || {}).url)) ||
        (id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : '');
      return {
        id,
        title: v.title || 'Video',
        channel: v.uploaderName || v.author || v.owner || v.channel || '',
        views: v.views || v.viewCount || 0,
        duration: v.duration || v.lengthSeconds || 0,
        ago: v.uploadedDate || v.publishedText || '',
        thumb,
        embed: id ? 'https://www.youtube-nocookie.com/embed/' + id : '',
        watch: id ? 'https://www.youtube.com/watch?v=' + id : ''
      };
    })
    .filter((v) => v.id);
}

async function pipedSearch(q) {
  let lastErr;
  for (const base of PIPED) {
    try {
      const data = await getJson(
        base + '/api/v1/search?q=' + encodeURIComponent(q) + '&filter=videos'
      );
      const items = normalize(Array.isArray(data) ? data : data.items || []);
      if (items.length) return items;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

async function pipedTrending() {
  for (const base of PIPED) {
    try {
      const data = await getJson(base + '/api/v1/trending?region=ID');
      const items = normalize(Array.isArray(data) ? data : []);
      if (items.length) return items;
    } catch (e) {}
  }
  return [];
}

router.get('/search', async (req, res) => {
  const q = String(req.query.q || 'music').trim();
  try {
    const results = await cache.wrap('yt:s:' + q, 120, () => pipedSearch(q));
    res.json({
      ok: true,
      count: results.length,
      results: results.slice(0, 40),
      note: 'Metadata + thumbnail YouTube. Putar via embed resmi.'
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const results = await cache.wrap('yt:tr', 300, () => pipedTrending());
    res.json({ ok: true, count: results.length, results: results.slice(0, 40) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
