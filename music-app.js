(function () {
  var CATS = {
    hits: [
      'top hits 2025', 'top hits 2024', 'indonesia top charts', 'viral tiktok songs',
      'kpop hits', 'dangdut koplo hits', 'pop indonesia hits', 'global top 50'
    ],
    baru: [
      'new music friday', 'lagu baru indonesia', 'new song 2025', 'latest kpop',
      'new releases pop', 'lagu terbaru viral'
    ],
    indo: ['tulus', 'rais a', 'bernadya', 'nadin amizah', 'dangdut koplo', 'fiersa besari', 'mahalini'],
    korea: ['blackpink', 'bts', 'newjeans', 'ive', 'seventeen', 'k-pop'],
    japan: ['yoasobi', 'lisa', 'official hige dandism', 'anime opening', 'j-pop'],
    us: ['taylor swift', 'bruno mars', 'the weeknd', 'billie eilish', 'drake', 'ed sheeran'],
    kids: ['nursery rhymes', 'baby shark', 'kids songs english', 'lagu anak indonesia']
  };
  var lastTracks = [];

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function artUrl(t) {
    if (t.art && !/nailong/i.test(t.art)) return t.art;
    return 'https://placehold.co/300x300/1a1a2e/FFC107/png?text=' + encodeURIComponent((t.title || 'M').charAt(0));
  }

  function renderList(tracks) {
    lastTracks = tracks || [];
    var box = $('list');
    if (!box) return;
    if (!lastTracks.length) {
      box.innerHTML = '<p style="color:#8aa0b8;font-size:13px;padding:12px;">Tidak ada hasil. Coba kata kunci lain.</p>';
      return;
    }
    box.innerHTML = lastTracks.map(function (t, i) {
      return '<div class="sp-item" data-i="' + i + '">' +
        '<img src="' + artUrl(t) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'https://placehold.co/300x300/1a1a2e/FFC107/png?text=♪\'">' +
        '<div class="meta"><b>' + escapeHtml(t.title) + '</b>' +
        '<span>' + escapeHtml(t.artist || '—') + (t.album ? ' · ' + escapeHtml(t.album) : '') + '</span>' +
        '<em>' + escapeHtml(t.source || '') + (t.composer ? ' · Penulis: ' + escapeHtml(t.composer) : '') + '</em>' +
        '</div><i class="fa-solid fa-play play-ic"></i></div>';
    }).join('');
    box.querySelectorAll('.sp-item').forEach(function (el) {
      el.onclick = async function () {
        var i = +el.getAttribute('data-i');
        var track = lastTracks[i];
        var ic = el.querySelector('.play-ic');
        if (ic) ic.className = 'fa-solid fa-spinner fa-spin play-ic';
        try {
          if (track.iaId && !track.streamUrl) track = await NailongMusic.resolveIaStream(track);
          if (!track.streamUrl && !track.previewUrl) {
            alert('Lagu ini metadata saja. Coba lagu bertanda iTunes (ada preview).');
            if (ic) ic.className = 'fa-solid fa-play play-ic';
            return;
          }
          await NailongMusic.playTrack(track, lastTracks);
        } catch (e) {
          alert('Gagal putar: ' + (e.message || e));
        }
        if (ic) ic.className = 'fa-solid fa-play play-ic';
      };
    });
  }

  async function runSearch(q) {
    var box = $('list');
    if (box) box.innerHTML = '<p style="color:#8aa0b8;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Mencari hits & lagu baru…</p>';
    try {
      var tracks = await NailongMusic.searchAll(q, 80);
      renderList(tracks);
    } catch (e) {
      if (box) box.innerHTML = '<p style="color:#e11d48;padding:12px;">Gagal: ' + (e.message || e) + '</p>';
    }
  }

  /** Gabung beberapa query hits/baru biar selalu ada lagu populer + terbaru */
  async function loadHomeHits() {
    var box = $('list');
    if (box) box.innerHTML = '<p style="color:#8aa0b8;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat chart hits & rilis baru…</p>';
    var queries = [
      'top hits 2025',
      'indonesia hits',
      'viral tiktok',
      'new music',
      'kpop',
      'lagu terbaru indonesia'
    ];
    var seen = {};
    var all = [];
    for (var i = 0; i < queries.length; i++) {
      try {
        var part = await NailongMusic.searchAll(queries[i], 25);
        (part || []).forEach(function (t) {
          var k = (t.title + '|' + t.artist).toLowerCase();
          if (seen[k]) return;
          seen[k] = 1;
          all.push(t);
        });
      } catch (e) {}
    }
    renderList(all.slice(0, 80));
  }

  function bind() {
    var form = $('searchForm') || document.querySelector('.sp-search');
    var input = $('q') || document.querySelector('.sp-search input');
    if (form && form.tagName === 'FORM') {
      form.onsubmit = function (e) {
        e.preventDefault();
        runSearch((input && input.value) || 'top hits');
      };
    }
    document.querySelectorAll('.sp-tabs button').forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll('.sp-tabs button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var tab = b.getAttribute('data-tab') || b.getAttribute('data-q') || 'hits';
        if (tab === 'hits' || tab === 'baru') {
          loadHomeHits();
          return;
        }
        var list = CATS[tab];
        var q = list ? list[Math.floor(Math.random() * list.length)] : tab;
        if (input) input.value = q;
        runSearch(q);
      };
    });
    loadHomeHits();
    // refresh hits tiap 30 menit (lagu baru/hits)
    setInterval(function () {
      if (document.visibilityState === 'visible') loadHomeHits();
    }, 30 * 60 * 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
