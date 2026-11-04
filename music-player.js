/**
 * Nailong Music — banyak lagu + cover asli
 * Sumber: iTunes (preview + artwork), MusicBrainz (metadata), Internet Archive (stream)
 */
(function () {
  var KEY = 'nd_music_state';
  var UA = 'NailongDigitalMusic/2.0 ( https://dinailongdigital.vercel.app ; music@nailong.local )';
  var audio = null;
  var queue = [];
  var qIndex = 0;

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
        document.body.appendChild(audio);
      }
      audio.addEventListener('ended', function () { next(); });
    }
    return audio;
  }

  function fetchJson(url, opts) {
    opts = opts || {};
    var headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
    if (/musicbrainz\.org/.test(url)) headers['User-Agent'] = UA;
    return fetch(url, { headers: headers, mode: 'cors' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function bigArt(url) {
    if (!url) return '';
    // iTunes 100x100 → 600x600
    return String(url)
      .replace('100x100bb', '600x600bb')
      .replace('60x60bb', '600x600bb')
      .replace('30x30bb', '600x600bb');
  }

  function placeholderArt(title, artist) {
    var t = encodeURIComponent((title || 'M').charAt(0) + (artist || 'D').charAt(0));
    return 'https://placehold.co/300x300/1a1a2e/FFC107/png?text=' + t;
  }

  /** iTunes — cover asli + preview playable */
  async function searchItunes(term, limit) {
    limit = Math.min(50, limit || 40);
    var url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(term) +
      '&media=music&entity=song&limit=' + limit;
    var data = await fetchJson(url);
    return (data.results || []).map(function (r) {
      return {
        id: 'it_' + r.trackId,
        title: r.trackName || r.collectionName || 'Unknown',
        artist: r.artistName || '',
        album: r.collectionName || '',
        composer: r.composerName || '',
        art: bigArt(r.artworkUrl100 || r.artworkUrl60),
        previewUrl: r.previewUrl || '',
        streamUrl: r.previewUrl || '',
        source: 'iTunes',
        license: 'Preview iTunes',
        duration: r.trackTimeMillis || 0
      };
    }).filter(function (t) { return t.previewUrl; });
  }

  /** Beberapa query iTunes digabung → jauh lebih banyak lagu */
  async function searchItunesMulti(term, limit) {
    var variants = [term];
    if (term.length < 40) {
      variants.push(term + ' official');
      variants.push(term + ' acoustic');
      variants.push(term + ' live');
    }
    // kategori populer
    var extra = [];
    if (/hit|popular|trending|top/i.test(term)) {
      extra = ['top hits 2024', 'indonesia hits', 'kpop', 'dangdut koplo', 'lofi hip hop',
        'taylor swift', 'bruno mars', 'tulus hati-hati di jalan', 'raise', 'yoasobi',
        'blackpink', 'bts', 'justin bieber', 'ariana grande', 'the weeknd', 'coldplay',
        'linkin park', 'ed sheeran', 'adele', 'billie eilish', 'drake', 'oasis'];
    }
    variants = variants.concat(extra).slice(0, 8);

    var jobs = await Promise.allSettled(variants.map(function (q) {
      return searchItunes(q, 25);
    }));
    var seen = {};
    var out = [];
    jobs.forEach(function (j) {
      if (j.status !== 'fulfilled') return;
      (j.value || []).forEach(function (t) {
        var k = (t.title + '|' + t.artist).toLowerCase();
        if (seen[k]) return;
        seen[k] = 1;
        out.push(t);
      });
    });
    return out.slice(0, limit || 80);
  }

  async function searchMusicBrainz(term, limit) {
    limit = Math.min(50, limit || 30);
    var url = 'https://musicbrainz.org/ws/2/recording/?query=' + encodeURIComponent(term) +
      '&fmt=json&limit=' + limit + '&offset=0';
    try {
      var data = await fetchJson(url);
      return (data.recordings || []).map(function (r) {
        var artist = (r['artist-credit'] || []).map(function (a) {
          return (a.name || (a.artist && a.artist.name) || '');
        }).filter(Boolean).join(', ');
        var releaseId = r.releases && r.releases[0] && r.releases[0].id;
        return {
          id: 'mb_' + r.id,
          mbid: r.id,
          title: r.title || 'Unknown',
          artist: artist,
          composer: '',
          art: releaseId ? ('https://coverartarchive.org/release/' + releaseId + '/front-250') : '',
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

  async function searchInternetArchive(term, limit) {
    limit = Math.min(30, limit || 15);
    var q = 'collection:(opensource_audio OR netlabels OR audio_music) AND (' + term + ')';
    var url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) +
      '&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&rows=' + limit + '&page=1&output=json';
    try {
      var data = await fetchJson(url);
      var docs = (data.response && data.response.docs) || [];
      return docs.map(function (d) {
        var id = d.identifier;
        return {
          id: 'ia_' + id,
          iaId: id,
          title: d.title || id,
          artist: d.creator || 'Internet Archive',
          composer: '',
          art: 'https://archive.org/services/img/' + id,
          previewUrl: '',
          streamUrl: '',
          source: 'Internet Archive',
          license: 'Public / IA'
        };
      });
    } catch (e) {
      return [];
    }
  }

  async function resolveIaStream(track) {
    if (!track || !track.iaId) return track;
    try {
      var meta = await fetchJson('https://archive.org/metadata/' + encodeURIComponent(track.iaId));
      var files = (meta.files || []).filter(function (f) {
        return /\.mp3$|\.ogg$|\.m4a$/i.test(f.name || '');
      });
      if (files.length) {
        files.sort(function (a, b) { return (parseInt(a.size, 10) || 0) - (parseInt(b.size, 10) || 0); });
        var prefer = files[Math.floor(files.length / 2)] || files[0];
        track.streamUrl = 'https://archive.org/download/' + track.iaId + '/' + encodeURIComponent(prefer.name);
        track.previewUrl = track.streamUrl;
      }
    } catch (e) {}
    return track;
  }

  async function enrichComposer(track) {
    if (!track || !track.mbid) return track;
    try {
      var url = 'https://musicbrainz.org/ws/2/recording/' + track.mbid + '?fmt=json&inc=artist-credits+work-rels';
      var data = await fetchJson(url);
      var rels = data.relations || [];
      for (var i = 0; i < rels.length; i++) {
        if (rels[i].type === 'performance' && rels[i].work) {
          // skip
        }
        if ((rels[i].type === 'composer' || rels[i].type === 'writer') && rels[i].artist) {
          track.composer = rels[i].artist.name;
          break;
        }
      }
      if (!track.composer && data['artist-credit']) {
        track.composer = data['artist-credit'].map(function (a) { return a.name; }).join(', ');
      }
    } catch (e) {}
    return track;
  }

  /** Cari cover iTunes untuk track yang belum ada art bagus */
  async function fillMissingArt(tracks) {
    var need = tracks.filter(function (t) {
      return !t.art || /nailong|placehold|coverartarchive/.test(t.art);
    }).slice(0, 12);
    await Promise.all(need.map(async function (t) {
      try {
        var q = (t.title + ' ' + (t.artist || '')).trim();
        var list = await searchItunes(q, 3);
        if (list[0] && list[0].art) {
          t.art = list[0].art;
          if (!t.previewUrl && list[0].previewUrl) {
            t.previewUrl = list[0].previewUrl;
            t.streamUrl = list[0].previewUrl;
          }
        }
      } catch (e) {}
      if (!t.art) t.art = placeholderArt(t.title, t.artist);
    }));
    tracks.forEach(function (t) {
      if (!t.art) t.art = placeholderArt(t.title, t.artist);
    });
    return tracks;
  }

  async function searchAll(term, limit) {
    limit = Math.max(limit || 60, 40);
    term = (term || 'top hits').trim();
    // Prefer Node API di VPS jika di-set
    try {
      var base = (window.NAILONG_API || '').replace(/\/$/, '');
      if (base) {
        var r = await fetch(base + '/api/music/search?q=' + encodeURIComponent(term) + '&limit=' + limit);
        var j = await r.json();
        if (j && j.ok && j.results && j.results.length) return j.results;
      }
    } catch (eApi) {}
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

    // prioritaskan iTunes multi (banyak + cover asli + bisa diputar)
    var jobs = await Promise.allSettled([
      searchItunesMulti(term, 80),
      searchMusicBrainz(term, 25),
      searchInternetArchive(term, 15)
    ]);
    if (jobs[0].status === 'fulfilled') push(jobs[0].value);
    if (jobs[1].status === 'fulfilled') push(jobs[1].value);
    if (jobs[2].status === 'fulfilled') push(jobs[2].value);

    // resolve beberapa stream IA
    var iaTracks = results.filter(function (t) { return t.iaId; }).slice(0, 8);
    await Promise.all(iaTracks.map(function (t) { return resolveIaStream(t); }));

    // isi cover yang kosong dari iTunes
    results = await fillMissingArt(results);

    // yang bisa diputar di atas
    results.sort(function (a, b) {
      var pa = (a.previewUrl || a.streamUrl) ? 1 : 0;
      var pb = (b.previewUrl || b.streamUrl) ? 1 : 0;
      return pb - pa;
    });

    return results.slice(0, limit);
  }

  function streamUrl(t) {
    return (t && (t.streamUrl || t.previewUrl)) || '';
  }

  function playTrack(track, list) {
    if (list && list.length) {
      queue = list.slice();
      qIndex = Math.max(0, queue.findIndex(function (x) { return x.id === track.id; }));
      if (qIndex < 0) { queue.unshift(track); qIndex = 0; }
    } else {
      queue = [track];
      qIndex = 0;
    }
    var a = getAudio();
    var url = streamUrl(track);
    if (!url) return Promise.reject(new Error('Tidak ada audio'));
    a.src = url;
    save({ current: track, index: qIndex });
    try { injectMini(track); } catch (e) {}
    return a.play();
  }

  function next() {
    if (!queue.length) return;
    qIndex = (qIndex + 1) % queue.length;
    playTrack(queue[qIndex], queue).catch(function () {});
  }
  function prev() {
    if (!queue.length) return;
    qIndex = (qIndex - 1 + queue.length) % queue.length;
    playTrack(queue[qIndex], queue).catch(function () {});
  }
  function toggle() {
    var a = getAudio();
    if (a.paused) a.play(); else a.pause();
  }
  function pause() { getAudio().pause(); }

  function injectMini(track) {
    var el = document.getElementById('ndMiniPlayer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ndMiniPlayer';
      el.style.cssText = 'position:fixed;left:10px;right:10px;bottom:72px;z-index:40;background:#181818;border:1px solid rgba(255,193,7,.25);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 28px rgba(0,0,0,.45);';
      document.body.appendChild(el);
    }
    var art = (track && track.art) || placeholderArt('N', 'D');
    el.innerHTML = '<img src="' + art + '" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">' +
      '<div style="flex:1;min-width:0;"><b style="display:block;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
      (track.title || '') + '</b><span style="font-size:11px;color:#aaa;">' + (track.artist || '') + '</span></div>' +
      '<button type="button" id="ndMpPrev" style="border:none;background:transparent;color:#fff;font-size:16px;"><i class="fa-solid fa-backward-step"></i></button>' +
      '<button type="button" id="ndMpToggle" style="border:none;background:transparent;color:#FFC107;font-size:20px;"><i class="fa-solid fa-pause"></i></button>' +
      '<button type="button" id="ndMpNext" style="border:none;background:transparent;color:#fff;font-size:16px;"><i class="fa-solid fa-forward-step"></i></button>';
    el.querySelector('#ndMpToggle').onclick = function () {
      toggle();
      var a = getAudio();
      el.querySelector('#ndMpToggle i').className = a.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
    };
    el.querySelector('#ndMpNext').onclick = next;
    el.querySelector('#ndMpPrev').onclick = prev;
  }

  window.NailongMusic = {
    playTrack: playTrack,
    toggle: toggle,
    pause: pause,
    next: next,
    prev: prev,
    getAudio: getAudio,
    state: state,
    searchItunes: searchItunes,
    searchAll: searchAll,
    searchMusicBrainz: searchMusicBrainz,
    searchInternetArchive: searchInternetArchive,
    enrichComposer: enrichComposer,
    resolveIaStream: resolveIaStream,
    injectMini: function () {
      var s = state();
      if (s.current) injectMini(s.current);
    }
  };

  document.addEventListener('DOMContentLoaded', function () { getAudio(); });
})();
