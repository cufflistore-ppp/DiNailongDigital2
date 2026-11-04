const express = require('express');
const { getJson } = require('../utils/fetch');
const cache = require('../utils/cache');

const router = express.Router();

function bigArt(url) {
  if (!url) return '';
  return String(url)
    .replace('100x100bb', '600x600bb')
    .replace('60x60bb', '600x600bb')
    .replace('30x30bb', '600x600bb');
}

function placeholder(title, artist) {
  const t = encodeURIComponent(((title || 'M')[0] || 'M') + ((artist || 'D')[0] || 'D'));
  return 'https://placehold.co/300x300/1a1a2e/FFC107/png?text=' + t;
}

async function searchItunes(term, limit = 50) {
  const url =
    'https://itunes.apple.com/search?term=' +
    encodeURIComponent(term) +
    '&media=music&entity=song&limit=' +
    Math.min(50, limit);
  const data = await getJson(url);
  return (data.results || []).map((r) => ({
    id: 'it_' + r.trackId,
    title: r.trackName || r.collectionName || 'Unknown',
    artist: r.artistName || '',
    album: r.collectionName || '',
    composer: r.composerName || '',
    art: bigArt(r.artworkUrl100 || r.artworkUrl60),
    previewUrl: r.previewUrl || '',
    streamUrl: r.previewUrl || '',
    source: 'iTunes',
    license: 'Preview resmi iTunes (~30 dtk)',
    duration: r.trackTimeMillis || 0
  })).filter((t) => t.previewUrl);
}

async function searchMusicBrainz(term, limit = 25) {
  const url =
    'https://musicbrainz.org/ws/2/recording/?query=' +
    encodeURIComponent(term) +
    '&fmt=json&limit=' +
    Math.min(50, limit);
  try {
    const data = await getJson(url, {
      headers: { 'User-Agent': 'NailongDigitalMedia/1.0 ( https://dinailongdigital.vercel.app )' }
    });
    return (data.recordings || []).map((r) => {
      const artist = (r['artist-credit'] || [])
        .map((a) => a.name || (a.artist && a.artist.name) || '')
        .filter(Boolean)
        .join(', ');
      const releaseId = r.releases && r.releases[0] && r.releases[0].id;
      return {
        id: 'mb_' + r.id,
        mbid: r.id,
        title: r.title || 'Unknown',
        artist,
        album: '',
        composer: '',
        art: releaseId
          ? 'https://coverartarchive.org/release/' + releaseId + '/front-250'
          : '',
        previewUrl: '',
        streamUrl: '',
        source: 'MusicBrainz',
        license: 'Metadata'
      };
    });
  } catch (e) {
    return [];
  }
}

async function searchInternetArchive(term, limit = 15) {
  const q =
    'collection:(opensource_audio OR netlabels OR audio_music) AND (' + term + ')';
  const url =
    'https://archive.org/advancedsearch.php?q=' +
    encodeURIComponent(q) +
    '&fl[]=identifier&fl[]=title&fl[]=creator&rows=' +
    Math.min(30, limit) +
    '&page=1&output=json';
  try {
    const data = await getJson(url);
    const docs = (data.response && data.response.docs) || [];
    return docs.map((d) => ({
      id: 'ia_' + d.identifier,
      iaId: d.identifier,
      title: d.title || d.identifier,
      artist: d.creator || 'Internet Archive',
      album: '',
      composer: '',
      art: 'https://archive.org/services/img/' + d.identifier,
      previewUrl: '',
      streamUrl: '',
      source: 'Internet Archive',
      license: 'Public / IA'
    }));
  } catch (e) {
    return [];
  }
}

async function resolveIa(track) {
  if (!track || !track.iaId) return track;
  try {
    const meta = await getJson(
      'https://archive.org/metadata/' + encodeURIComponent(track.iaId)
    );
    const files = (meta.files || []).filter((f) =>
      /\.mp3$|\.ogg$|\.m4a$/i.test(f.name || '')
    );
    if (files.length) {
      files.sort(
        (a, b) => (parseInt(a.size, 10) || 0) - (parseInt(b.size, 10) || 0)
      );
      const prefer = files[Math.floor(files.length / 2)] || files[0];
      track.streamUrl =
        'https://archive.org/download/' +
        track.iaId +
        '/' +
        encodeURIComponent(prefer.name);
      track.previewUrl = track.streamUrl;
    }
  } catch (e) {}
  return track;
}

async function fillArt(tracks) {
  for (const t of tracks.slice(0, 20)) {
    if (t.art && !/placehold|nailong/i.test(t.art)) continue;
    try {
      const list = await searchItunes(
        (t.title + ' ' + (t.artist || '')).trim(),
        3
      );
      if (list[0] && list[0].art) {
        t.art = list[0].art;
        if (!t.previewUrl && list[0].previewUrl) {
          t.previewUrl = list[0].previewUrl;
          t.streamUrl = list[0].previewUrl;
        }
      }
    } catch (e) {}
    if (!t.art) t.art = placeholder(t.title, t.artist);
  }
  tracks.forEach((t) => {
    if (!t.art) t.art = placeholder(t.title, t.artist);
  });
  return tracks;
}

/** Multi-query iTunes biar hasil banyak */
async function searchItunesMulti(term, limit) {
  const variants = [term, term + ' official', term + ' live'];
  if (/hit|popular|top|trending/i.test(term)) {
    variants.push(
      'top hits 2024',
      'indonesia hits',
      'kpop',
      'dangdut',
      'lofi hip hop',
      'taylor swift',
      'bruno mars',
      'blackpink',
      'tulus',
      'yoasobi'
    );
  }
  const jobs = await Promise.allSettled(
    variants.slice(0, 8).map((q) => searchItunes(q, 25))
  );
  const seen = {};
  const out = [];
  jobs.forEach((j) => {
    if (j.status !== 'fulfilled') return;
    (j.value || []).forEach((t) => {
      const k = (t.title + '|' + t.artist).toLowerCase();
      if (seen[k]) return;
      seen[k] = 1;
      out.push(t);
    });
  });
  return out.slice(0, limit || 80);
}

router.get('/search', async (req, res) => {
  const q = String(req.query.q || req.query.term || 'top hits').trim();
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 60);
  try {
    const data = await cache.wrap('music:' + q + ':' + limit, 180, async () => {
      const seen = {};
      const results = [];
      function push(list) {
        (list || []).forEach((t) => {
          const k = (t.title + '|' + t.artist).toLowerCase();
          if (seen[k]) return;
          seen[k] = 1;
          results.push(t);
        });
      }
      const jobs = await Promise.allSettled([
        searchItunesMulti(q, 80),
        searchMusicBrainz(q, 25),
        searchInternetArchive(q, 15)
      ]);
      if (jobs[0].status === 'fulfilled') push(jobs[0].value);
      if (jobs[1].status === 'fulfilled') push(jobs[1].value);
      if (jobs[2].status === 'fulfilled') push(jobs[2].value);

      const ia = results.filter((t) => t.iaId).slice(0, 8);
      await Promise.all(ia.map((t) => resolveIa(t)));
      await fillArt(results);

      results.sort((a, b) => {
        const pa = a.previewUrl || a.streamUrl ? 1 : 0;
        const pb = b.previewUrl || b.streamUrl ? 1 : 0;
        return pb - pa;
      });
      return results.slice(0, limit);
    });
    res.json({
      ok: true,
      query: q,
      count: data.length,
      note: 'Preview legal (iTunes) + metadata + sebagian full dari Internet Archive. Bukan katalog Spotify full-song.',
      results: data
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/resolve-ia', async (req, res) => {
  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });
  try {
    const track = await resolveIa({ iaId: id });
    res.json({ ok: true, track });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
