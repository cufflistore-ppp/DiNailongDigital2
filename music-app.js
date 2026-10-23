(function () {
  var HITS = ['taylor swift', 'bruno mars', 'ed sheeran', 'adele', 'the weeknd', 'ariana grande'];
  var INDO = ['tulus', 'raisia', 'judika', 'noah band', 'payung teduh', 'yura yunita'];

  function $(id) { return document.getElementById(id); }

  function renderList(tracks) {
    var box = $('list');
    if (!tracks.length) {
      box.innerHTML = '<p style="color:#8aa0b8;font-size:13px;padding:8px;">Tidak ada hasil / preview.</p>';
      return;
    }
    box.innerHTML = tracks.map(function (t, i) {
      return '<div class="sp-item" data-i="' + i + '">' +
        '<img src="' + (t.art || 'nailong-digital-logo.png') + '" alt="">' +
        '<div class="meta"><b>' + t.title + '</b><span>' + t.artist + ' · ' + (t.source || '') + '</span></div>' +
        '<i class="fa-solid fa-play play-ic"></i></div>';
    }).join('');
    box.querySelectorAll('.sp-item').forEach(function (el) {
      el.onclick = function () {
        var i = +el.getAttribute('data-i');
        NailongMusic.playTrack(tracks[i], tracks, i);
        syncPlayer();
      };
    });
    window._ndTracks = tracks;
  }

  function syncPlayer() {
    var s = NailongMusic.state();
    var t = s.track;
    if (!t) return;
    $('nowTitle').textContent = t.title || '-';
    $('nowArtist').textContent = (t.artist || '') + (t.source ? ' · ' + t.source : '');
    $('nowArt').src = t.art || 'nailong-digital-logo.png';
    var ic = document.querySelector('#btnPlay i');
    if (ic) ic.className = s.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    var a = NailongMusic.getAudio();
    var pct = a.duration ? (a.currentTime / a.duration * 100) : 0;
    $('prog').style.width = pct + '%';
  }

  async function loadQuery(q) {
    $('list').innerHTML = '<p style="color:#8aa0b8;font-size:13px;">Mencari…</p>';
    try {
      var tracks = await NailongMusic.searchItunes(q);
      renderList(tracks);
    } catch (e) {
      $('list').innerHTML = '<p style="color:#ff8a80;font-size:13px;">Gagal cari: ' + (e.message || e) + '</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('btnSearch').onclick = function () {
      var q = $('q').value.trim();
      if (q) loadQuery(q);
    };
    $('q').onkeydown = function (e) { if (e.key === 'Enter') $('btnSearch').click(); };

    document.querySelectorAll('.sp-tabs button').forEach(function (b) {
      b.onclick = async function () {
        document.querySelectorAll('.sp-tabs button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var tab = b.getAttribute('data-tab');
        $('searchRow').style.display = tab === 'cari' ? 'flex' : 'none';
        if (tab === 'hits') loadQuery(HITS[Math.floor(Math.random() * HITS.length)]);
        if (tab === 'indo') loadQuery(INDO[Math.floor(Math.random() * INDO.length)]);
        if (tab === 'queue') {
          var s = NailongMusic.state();
          renderList(s.queue || []);
        }
        if (tab === 'cari') $('list').innerHTML = '';
      };
    });

    $('btnPlay').onclick = function () { NailongMusic.toggle(); syncPlayer(); };
    $('btnNext').onclick = function () { NailongMusic.next(); syncPlayer(); };
    $('btnPrev').onclick = function () { NailongMusic.prev(); syncPlayer(); };
    $('seek').onclick = function (e) {
      var a = NailongMusic.getAudio();
      if (!a.duration) return;
      var r = this.getBoundingClientRect();
      a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
    };

    window.addEventListener('nd-music-tick', syncPlayer);
    syncPlayer();
    // default hits
    loadQuery('pop hits');
  });
})();
