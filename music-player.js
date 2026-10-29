/**
 * Nailong Music — sumber legal/metadata:
 * - MusicBrainz (artis, penulis/composer, rekaman)
 * - Internet Archive (audio publik yang bisa di-stream)
 * - Wikidata (info tambahan lewat MusicBrainz + entity)
 * - iTunes (preview cadangan, beratribusi)
 * User-Agent wajib untuk MusicBrainz.
 */
(function () {
  var KEY = 'nd_music_state';
  var UA = 'NailongDigitalMusic/1.0 ( https://nailong.digital ; music@nailong.local )';
  var audio = null;

  function state() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function save(patch) {
    var s = Object.assign(state(), patch || {}, { updated: Date.now() });
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function getAudio() {
    if (!audio) {
      audio = document.getElementById('ndGlobalAudio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'ndGlobalAudio';
        audio.preload = 'metadata';
        audio.crossOrigin = 'anonymous';
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
      audio.onended = function () { window.NailongMusic && NailongMusic.next(true); };
      audio.ontimeupdate = function () {
        try {
          var s = state();
          s.currentTime = audio.currentTime;
          s.duration = audio.duration || 0;
          localStorage.setItem(KEY, JSON.stringify(s));
          window.dispatchEvent(new CustomEvent('nd-music-tick', { detail: s }));
        } catch (e) {}
      };
      audio.onplay = function () { save({ playing: true }); window.dispatchEvent(new CustomEvent('nd-music-tick', { detail: state() })); };
      audio.onpause = function () { save({ playing: false }); window.dispatchEvent(new CustomEvent('nd-music-tick', { detail: state() })); };
    }
    return audio;
  }

  function streamUrl(track) {
    return (track && (track.streamUrl || track.previewUrl)) || '';
  }

  function playTrack(track, queue, index) {
    var a = getAudio();
    var q = queue || state().queue || [];
    var idx = typeof index === 'number' ? index : 0;
    save({ track: track, queue: q, index: idx, playing: true });
    var url = streamUrl(track);
    if (url) {
      a.src = url;
      a.play().catch(function () {});
    }
    window.dispatchEvent(new CustomEvent('nd-music-tick', { detail: state() }));
  }

  function toggle() {
    var a = getAudio();
    if (!a.src) {
      var s = state();
      var url = streamUrl(s.track);
      if (url) {
        a.src = url;
        if (s.currentTime) a.currentTime = s.currentTime;
      } else return;
    }
    if (a.paused) a.play().catch(function () {});
    else a.pause();
  }

  function pause() {
    var a = getAudio();
    if (a && !a.paused) a.pause();
  }

  function next(auto) {
    var s = state();
    var q = s.queue || [];
    if (!q.length) return;
    var i = (typeof s.index === 'number' ? s.index : 0) + 1;
    if (i >= q.length) i = 0;
    playTrack(q[i], q, i);
  }

  function prev() {
    var s = state();
    var q = s.queue || [];
    if (!q.length) return;
    var a = getAudio();
    if (a.currentTime > 3) { a.currentTime = 0; return; }
    var i = (typeof s.index === 'number' ? s.index : 0) - 1;
    if (i < 0) i = q.length - 1;
    playTrack(q[i], q, i);
  }

  async function fetchJson(url, opts) {
    opts = opts || {};
    var headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
    // Browser menolak set User-Agent kustom; MusicBrainz tetap terima request halaman.
    var r = await fetch(url, { headers: headers, mode: 'cors' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  /** MusicBrainz recording search + artist-credit + composer relations */
  async function searchMusicBrainz(term, limit) {
    limit = limit || 20;
    var url = 'https://musicbrainz.org/ws/2/recording/?query=' + encodeURIComponent(term) +
      '&fmt=json&limit=' + limit + '&inc=artist-credits+releases';
    var j = await fetchJson(url);
    var out = [];
    (j.recordings || []).forEach(function (rec) {
      var artists = (rec['artist-credit'] || []).map(function (ac) {
        return (ac.name || (ac.artist && ac.artist.name) || '').trim();
      }).filter(Boolean);
      var artist = artists.join(', ') || 'Unknown artist';
      var release = (rec.releases && rec.releases[0]) || null;
      var mbid = rec.id;
      var releaseId = release && release.id;
      out.push({
        id: 'mb-' + mbid,
        mbid: mbid,
        releaseId: releaseId || '',
        title: rec.title || 'Untitled',
        artist: artist,
        composer: '', // diisi async optional
        source: 'MusicBrainz',
        license: 'Metadata © MusicBrainz contributors',
        art: releaseId ? ('https://coverartarchive.org/release/' + releaseId + '/front-250') : 'nailong-digital-logo.png',
        previewUrl: '',
        streamUrl: '',
        score: rec.score || 0
      });
    });
    return out;
  }

  /** Ambil composer/lyricist dari work relations */
  async function enrichComposer(track) {
    if (!track || !track.mbid) return track;
    try {
      var url = 'https://musicbrainz.org/ws/2/recording/' + track.mbid + '?fmt=json&inc=artist-credits+work-rels+artist-rels';
      var rec = await fetchJson(url);
      var composers = [];
      var rels = rec.relations || [];
      rels.forEach(function (rel) {
        if (rel.type === 'composer' || rel.type === 'lyricist' || rel.type === 'writer') {
          if (rel.artist && rel.artist.name) composers.push(rel.artist.name + (rel.type === 'lyricist' ? ' (lirik)' : ''));
        }
        if (rel.work && rel.work.id) {
          // work title only; deep fetch skipped for rate limits
        }
      });
      // also check artist-credit for "composer" in attributes rarely
      if (!composers.length && track.artist) composers.push(track.artist + ' (performer)');
      track.composer = composers.join(', ');
      track.artist = (rec['artist-credit'] || []).map(function (ac) {
        return ac.name || (ac.artist && ac.artist.name);
      }).filter(Boolean).join(', ') || track.artist;
    } catch (e) {}
    return track;
  }

  /** Internet Archive audio search */
  async function searchInternetArchive(term, limit) {
    limit = limit || 15;
    var q = 'mediatype:audio AND (' + term + ')';
    var url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) +
      '&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&fl[]=licenseurl&fl[]=year' +
      '&rows=' + limit + '&page=1&output=json';
    var j = await fetchJson(url);
    var docs = (j.response && j.response.docs) || [];
    return docs.map(function (d) {
      var id = d.identifier;
      return {
        id: 'ia-' + id,
        iaId: id,
        title: d.title || id,
        artist: (Array.isArray(d.creator) ? d.creator.join(', ') : (d.creator || 'Internet Archive')),
        composer: '',
        source: 'Internet Archive',
        license: d.licenseurl || 'Public / IA terms',
        art: 'https://archive.org/services/img/' + id,
        // generic download path — browser picks streamable file via /download/
        streamUrl: 'https://archive.org/download/' + id + '/',
        previewUrl: 'https://archive.org/download/' + id + '/',
        year: d.year || ''
      };
    });
  }

  /** Resolve actual audio file from IA item metadata */
  async function resolveIaStream(track) {
    if (!track || !track.iaId) return track;
    try {
      var meta = await fetchJson('https://archive.org/metadata/' + encodeURIComponent(track.iaId));
      var files = meta.files || [];
      var prefer = files.find(function (f) {
        var n = (f.name || '').toLowerCase();
        return /\.(mp3)$/i.test(n);
      }) || files.find(function (f) {
        return /\.(ogg|m4a|wav|flac)$/i.test(f.name || '');
      });
      if (prefer) {
        track.streamUrl = 'https://archive.org/download/' + track.iaId + '/' + encodeURIComponent(prefer.name);
        track.previewUrl = track.streamUrl;
      }
      if (meta.metadata) {
        var md = meta.metadata;
        if (md.creator && !track.artist) track.artist = Array.isArray(md.creator) ? md.creator.join(', ') : md.creator;
        if (md.licenseurl) track.license = md.licenseurl;
      }
    } catch (e) {}
    return track;
  }

  /** iTunes fallback previews */
  async function searchWikidata(term) {
    try {
      var url = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' +
        encodeURIComponent(term) + '&language=en&limit=3&format=json&origin=*';
      var j = await fetchJson(url);
      return (j.search || []).map(function (x) {
        return { id: x.id, label: x.label, description: x.description || '' };
      });
    } catch (e) { return []; }
  }

  async function searchItunes(term, limit) {
    limit = limit || 25;
    var url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(term) + '&media=music&limit=' + limit;
    var r = await fetch(url);
    var j = await r.json();
    return (j.results || []).filter(function (x) { return x.previewUrl; }).map(function (x) {
      return {
        id: 'it-' + x.trackId,
        title: x.trackName,
        artist: x.artistName,
        composer: x.collectionArtistName && x.collectionArtistName !== x.artistName ? x.collectionArtistName : x.artistName,
        source: 'iTunes Preview',
        license: '30s preview · © ' + (x.artistName || 'rights holder'),
        art: (x.artworkUrl100 || '').replace('100x100', '300x300'),
        previewUrl: x.previewUrl,
        streamUrl: x.previewUrl
      };
    });
  }

  /**
   * Gabungan: MusicBrainz + IA + iTunes
   * Prioritas stream: IA full → iTunes preview; metadata: MB composer/artist
   */
  async function searchAll(term, limit) {
    limit = limit || 30;
    var results = [];
    var seen = {};

    function push(list) {
      (list || []).forEach(function (t) {
        var key = (t.title + '|' + t.artist).toLowerCase();
        if (seen[key]) return;
        seen[key] = 1;
        results.push(t);
      });
    }

    var jobs = await Promise.allSettled([
      searchMusicBrainz(term, Math.min(limit, 20)),
      searchInternetArchive(term, 12),
      searchItunes(term, limit)
    ]);

    if (jobs[0].status === 'fulfilled') push(jobs[0].value);
    if (jobs[1].status === 'fulfilled') push(jobs[1].value);
    if (jobs[2].status === 'fulfilled') push(jobs[2].value);

    // resolve a few IA streams
    var iaTracks = results.filter(function (t) { return t.iaId; }).slice(0, 6);
    await Promise.all(iaTracks.map(function (t) { return resolveIaStream(t); }));

    // enrich top MB with composer (rate-limit friendly: 3 saja)
    var mbTracks = results.filter(function (t) { return t.mbid; }).slice(0, 3);
    await Promise.all(mbTracks.map(function (t) { return enrichComposer(t); }));

    // only keep playable or rich metadata
    results = results.filter(function (t) {
      return streamUrl(t) || t.mbid || t.iaId;
    });

    return results.slice(0, limit);
  }

  // compat
  async function searchItunesCompat(term, limit) {
    return searchAll(term, limit);
  }

  window.NailongMusic = {
    playTrack: playTrack,
    toggle: toggle,
    pause: pause,
    next: next,
    prev: prev,
    getAudio: getAudio,
    state: state,
    searchItunes: searchItunesCompat,
    searchAll: searchAll,
    searchMusicBrainz: searchMusicBrainz,
    searchInternetArchive: searchInternetArchive,
    searchWikidata: searchWikidata,
    enrichComposer: enrichComposer,
    resolveIaStream: resolveIaStream
  };

  // restore playing if needed
  document.addEventListener('DOMContentLoaded', function () {
    getAudio();
  });
})();
