(function () {
  var CATS = {
    hits: ['popular recordings', 'classical piano', 'jazz standards'],
    indo: ['indonesia', 'keroncong', 'dangdut', 'tulus'],
    korea: ['korea', 'k-pop', 'korean traditional'],
    japan: ['japan', 'j-pop', 'anime soundtrack'],
    us: ['american folk', 'blues', 'rock'],
    kids: ['children songs', 'nursery rhymes', 'kids music']
  };

  function $(id) { return document.getElementById(id); }

  function attrLine(t) {
    var parts = [];
    if (t.artist) parts.push('Penyanyi: ' + t.artist);
    if (t.composer && t.composer !== t.artist) parts.push('Penulis: ' + t.composer);
    return parts.join(' · ');
  }

  function renderList(tracks) {
    var box = $('list');
    if (!tracks.length) {
      box.innerHTML = '<p style="color:var(--nd-muted,#8aa0b8);font-size:13px;padding:8px;">Tidak ada hasil. Coba kata lain.</p>';
      return;
    }
    box.innerHTML = tracks.map(function (t, i) {
      var sub = attrLine(t) || (t.source || '');
      var chip = '<span class="src-chip">' + (t.source || '') + '</span>';
      return '<div class="sp-item" data-i="' + i + '">' +
        '<img src="' + (t.art || 'nailong-digital-logo.png') + '" alt="" loading="lazy" onerror="this.src=\'nailong-digital-logo.png\'">' +
        '<div class="meta"><b>' + escapeHtml(t.title) + chip + '</b>' +
        '<span>' + escapeHtml(t.artist || '—') + '</span>' +
        (t.composer ? '<em>Penulis: ' + escapeHtml(t.composer) + '</em>' : '<em>' + escapeHtml(t.license || t.source || '') + '</em>') +
        '</div><i class="fa-solid fa-play play-ic"></i></div>';
    }).join('');
    box.querySelectorAll('.sp-item').forEach(function (el) {
      el.onclick = async function () {
        var i = +el.getAttribute('data-i');
        var track = tracks[i];
        // resolve IA file if needed
        if (track.iaId && (!track.streamUrl || /\/$/.test(track.streamUrl))) {
          el.querySelector('.play-ic').className = 'fa-solid fa-spinner fa-spin play-ic';
          try { track = await NailongMusic.resolveIaStream(track); tracks[i] = track; } catch (e) {}
        }
        if (track.mbid && !track.composer) {
          try { track = await NailongMusic.enrichComposer(track); tracks[i] = track; } catch (e) {}
        }
        if (!track.streamUrl && !track.previewUrl) {
          alert('Lagu ini metadata saja (MusicBrainz). Pilih yang bertanda Internet Archive / iTunes Preview untuk diputar.');
          el.querySelector('.play-ic').className = 'fa-solid fa-play play-ic';
          return;
        }
        NailongMusic.playTrack(track, tracks, i);
        $('playerBox').style.display = 'block';
        syncPlayer();
        el.querySelector('.play-ic').className = 'fa-solid fa-play play-ic';
      };
    });
    window._ndTracks = tracks;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  }

  function syncPlayer() {
    var s = NailongMusic.state();
    var t = s.track;
    if (!t) return;
    if ($('nowTitle')) $('nowTitle').textContent = t.title || '-';
    if ($('nowArtist')) $('nowArtist').textContent = 'Penyanyi: ' + (t.artist || '—');
    if ($('nowComposer')) {
      $('nowComposer').textContent = t.composer
        ? ('Penulis: ' + t.composer)
        : (t.license || t.source || '');
    }
    if ($('nowArt')) $('nowArt').src = t.art || 'nailong-digital-logo.png';
    var ic = document.querySelector('#btnPlay i');
    if (ic) ic.className = s.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    var a = NailongMusic.getAudio();
    var pct = a.duration ? (a.currentTime / a.duration * 100) : 0;
    if ($('prog')) $('prog').style.width = pct + '%';
    if ($('playerBox') && t) $('playerBox').style.display = 'block';
  }

  async function loadQuery(q) {
    $('list').innerHTML = '<p style="color:var(--nd-muted,#8aa0b8);font-size:13px;">Mencari MusicBrainz · Internet Archive · iTunes…</p>';
    try {
      var tracks = await NailongMusic.searchAll(q, 35);
      renderList(tracks);
    } catch (e) {
      $('list').innerHTML = '<p style="color:#ff8a80;font-size:13px;">Gagal: ' + (e.message || e) + '</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('btnSearch')) {
      $('btnSearch').onclick = function () {
        var q = $('q').value.trim();
        if (q) loadQuery(q);
      };
      $('q').onkeydown = function (e) { if (e.key === 'Enter') $('btnSearch').click(); };
    }
    document.querySelectorAll('.sp-tabs button').forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll('.sp-tabs button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var tab = b.getAttribute('data-tab');
        if ($('searchRow')) $('searchRow').style.display = tab === 'cari' ? 'flex' : 'none';
        if (tab === 'cari') {
          $('list').innerHTML = '<p style="color:var(--nd-muted,#8aa0b8);font-size:13px;">Cari judul / artis / penulis…</p>';
          return;
        }
        if (tab === 'queue') {
          renderList((NailongMusic.state().queue) || []);
          return;
        }
        if (CATS[tab]) {
          var arr = CATS[tab];
          loadQuery(arr[Math.floor(Math.random() * arr.length)]);
        }
      };
    });
    if ($('btnPlay')) $('btnPlay').onclick = function () { NailongMusic.toggle(); syncPlayer(); };
    if ($('btnNext')) $('btnNext').onclick = function () { NailongMusic.next(); syncPlayer(); };
    if ($('btnPrev')) $('btnPrev').onclick = function () { NailongMusic.prev(); syncPlayer(); };
    if ($('seek')) $('seek').onclick = function (e) {
      var a = NailongMusic.getAudio();
      if (!a.duration) return;
      var r = this.getBoundingClientRect();
      a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
    };
    if ($('btnClosePlayer')) {
      $('btnClosePlayer').onclick = function () {
        NailongMusic.pause();
        $('playerBox').style.display = 'none';
      };
    }
    window.addEventListener('nd-music-tick', syncPlayer);
    syncPlayer();
    loadQuery('classical piano');
  });
})();
