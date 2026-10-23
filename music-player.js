/**
 * Nailong Music — player global (localStorage + audio tunggal)
 * Preview dari iTunes Search API (gratis, tanpa key).
 * Auto next saat lagu selesai. Mini player di semua halaman.
 */
(function () {
  var KEY = 'nd_music_state';
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

  function playTrack(track, queue, index) {
    var a = getAudio();
    var q = queue || state().queue || [];
    var idx = typeof index === 'number' ? index : 0;
    save({
      track: track,
      queue: q,
      index: idx,
      playing: true
    });
    if (track && track.previewUrl) {
      a.src = track.previewUrl;
      a.play().catch(function () {});
    }
    window.dispatchEvent(new CustomEvent('nd-music-tick', { detail: state() }));
  }

  function toggle() {
    var a = getAudio();
    if (!a.src) {
      var s = state();
      if (s.track && s.track.previewUrl) {
        a.src = s.track.previewUrl;
        if (s.currentTime) a.currentTime = s.currentTime;
      } else return;
    }
    if (a.paused) a.play().catch(function () {});
    else a.pause();
  }

  function next(auto) {
    var s = state();
    var q = s.queue || [];
    if (!q.length) return;
    var i = (s.index || 0) + 1;
    if (i >= q.length) i = 0;
    playTrack(q[i], q, i);
  }

  function prev() {
    var s = state();
    var q = s.queue || [];
    if (!q.length) return;
    var i = (s.index || 0) - 1;
    if (i < 0) i = q.length - 1;
    playTrack(q[i], q, i);
  }

  /** Mini player di semua halaman */
  function injectMini() {
    if (document.getElementById('ndMusicMini')) return;
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('music.html') >= 0) return; // full player di music page

    var el = document.createElement('div');
    el.id = 'ndMusicMini';
    el.innerHTML =
      '<img id="ndMiniArt" alt="">' +
      '<div class="nd-mini-t"><b id="ndMiniTitle">Music</b><span id="ndMiniArtist"></span></div>' +
      '<button type="button" id="ndMiniPrev"><i class="fa-solid fa-backward-step"></i></button>' +
      '<button type="button" id="ndMiniPlay"><i class="fa-solid fa-play"></i></button>' +
      '<button type="button" id="ndMiniNext"><i class="fa-solid fa-forward-step"></i></button>' +
      '<a href="music.html" id="ndMiniOpen"><i class="fa-solid fa-up-right-from-square"></i></a>';
    document.body.appendChild(el);

    if (!document.getElementById('ndMusicMiniStyle')) {
      var st = document.createElement('style');
      st.id = 'ndMusicMiniStyle';
      st.textContent =
        '#ndMusicMini{position:fixed;left:8px;right:8px;bottom:70px;z-index:90;display:none;align-items:center;gap:8px;' +
        'background:rgba(12,16,28,0.94);border:1px solid rgba(255,193,7,0.25);border-radius:14px;padding:8px 10px;backdrop-filter:blur(10px);}' +
        '#ndMusicMini.show{display:flex;}' +
        '#ndMusicMini img{width:40px;height:40px;border-radius:8px;object-fit:cover;background:#1a2740;}' +
        '#ndMusicMini .nd-mini-t{flex:1;min-width:0;}' +
        '#ndMusicMini .nd-mini-t b{display:block;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
        '#ndMusicMini .nd-mini-t span{font-size:10px;color:#8aa0b8;}' +
        '#ndMusicMini button,#ndMusicMini a{border:none;background:transparent;color:#FFC107;font-size:14px;padding:6px;cursor:pointer;text-decoration:none;}' +
        'body{padding-bottom:130px !important;}';
      document.head.appendChild(st);
    }

    document.getElementById('ndMiniPlay').onclick = function (e) { e.preventDefault(); toggle(); };
    document.getElementById('ndMiniNext').onclick = function (e) { e.preventDefault(); next(); };
    document.getElementById('ndMiniPrev').onclick = function (e) { e.preventDefault(); prev(); };

    function sync() {
      var s = state();
      if (!s.track) { el.classList.remove('show'); return; }
      el.classList.add('show');
      document.getElementById('ndMiniTitle').textContent = s.track.title || 'Lagu';
      document.getElementById('ndMiniArtist').textContent = s.track.artist || '';
      document.getElementById('ndMiniArt').src = s.track.art || 'nailong-digital-logo.png';
      var ic = document.querySelector('#ndMiniPlay i');
      if (ic) ic.className = s.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      // restore play if was playing
      var a = getAudio();
      if (s.playing && s.track.previewUrl && a.paused) {
        if (!a.src || a.src.indexOf(s.track.previewUrl) < 0) a.src = s.track.previewUrl;
        if (s.currentTime && Math.abs((a.currentTime || 0) - s.currentTime) > 2) {
          try { a.currentTime = s.currentTime; } catch (e) {}
        }
        a.play().catch(function () {});
      }
    }
    window.addEventListener('nd-music-tick', sync);
    sync();
  }

  async function searchItunes(term) {
    var url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(term) + '&media=music&limit=25';
    var r = await fetch(url);
    var j = await r.json();
    return (j.results || []).filter(function (x) { return x.previewUrl; }).map(function (x) {
      return {
        id: String(x.trackId),
        title: x.trackName,
        artist: x.artistName,
        art: (x.artworkUrl100 || '').replace('100x100', '200x200'),
        previewUrl: x.previewUrl,
        source: 'iTunes Preview'
      };
    });
  }

  window.NailongMusic = {
    state: state,
    save: save,
    playTrack: playTrack,
    toggle: toggle,
    next: next,
    prev: prev,
    searchItunes: searchItunes,
    injectMini: injectMini,
    getAudio: getAudio
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { injectMini(); getAudio(); });
  } else {
    injectMini(); getAudio();
  }
})();
