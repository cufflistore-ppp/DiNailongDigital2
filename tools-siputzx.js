/**
 * Nailong Tools — powered by Siputzx API (api.siputzx.my.id)
 * Auto-load OpenAPI → form per endpoint → image/JSON result
 */
(function () {
  var BASE = 'https://api.siputzx.my.id';
  var OPENAPI = BASE + '/api/openapi.json';
  var HOST_GRID = null;
  var HOST_PANEL = null;
  var HOST_AREA = null;
  var allPaths = {};
  var byCat = {};

  var CAT_LABEL = {
    m: 'Maker (Brat, TextPro…)',
    canvas: 'Canvas & Foto',
    ai: 'AI Chat',
    d: 'Downloader',
    s: 'Search',
    r: 'Random',
    stalk: 'Stalk',
    tools: 'Tools',
    info: 'Info',
    anime: 'Anime',
    games: 'Games',
    primbon: 'Primbon',
    berita: 'Berita',
    sticker: 'Sticker'
  };

  var PRIORITY = ['m', 'canvas', 'ai', 'd', 's', 'tools', 'r', 'stalk', 'info', 'anime', 'games', 'sticker', 'primbon', 'berita'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function catOf(path) {
    var parts = path.replace(/^\/api\//, '').split('/');
    return parts[0] || 'other';
  }

  function titleOf(path) {
    var rest = path.replace(/^\/api\//, '');
    return rest.split('/').map(function (p) {
      return p.replace(/[-_]/g, ' ');
    }).join(' · ');
  }

  function getOp(pathObj) {
    return pathObj.get || pathObj.post || pathObj.put || null;
  }

  function paramsOf(op) {
    var list = [];
    (op.parameters || []).forEach(function (p) {
      if (p.in === 'query' || p.in === 'path') list.push(p);
    });
    return list;
  }

  function iconFor(cat) {
    var map = {
      m: 'fa-solid fa-pen-fancy',
      canvas: 'fa-solid fa-image',
      ai: 'fa-solid fa-robot',
      d: 'fa-solid fa-download',
      s: 'fa-solid fa-magnifying-glass',
      r: 'fa-solid fa-shuffle',
      stalk: 'fa-solid fa-user-secret',
      tools: 'fa-solid fa-wrench',
      info: 'fa-solid fa-circle-info',
      anime: 'fa-solid fa-tv',
      games: 'fa-solid fa-gamepad',
      sticker: 'fa-solid fa-note-sticky',
      primbon: 'fa-solid fa-star',
      berita: 'fa-solid fa-newspaper'
    };
    return map[cat] || 'fa-solid fa-puzzle-piece';
  }

  function renderGrid(filter) {
    if (!HOST_GRID) return;
    filter = (filter || '').toLowerCase().trim();
    var html = '';
    PRIORITY.forEach(function (cat) {
      var items = byCat[cat];
      if (!items || !items.length) return;
      var filtered = items.filter(function (it) {
        if (!filter) return true;
        return (it.path + ' ' + it.title + ' ' + cat).toLowerCase().indexOf(filter) >= 0;
      });
      if (!filtered.length) return;
      html += '<div class="sx-cat">' + esc(CAT_LABEL[cat] || cat.toUpperCase()) + ' <small>(' + filtered.length + ')</small></div>';
      html += '<div class="sx-grid">';
      filtered.forEach(function (it) {
        html +=
          '<button type="button" class="sx-card" data-path="' + esc(it.path) + '">' +
            '<i class="' + iconFor(cat) + '"></i>' +
            '<span>' + esc(it.title) + '</span>' +
          '</button>';
      });
      html += '</div>';
    });
    // leftover cats
    Object.keys(byCat).forEach(function (cat) {
      if (PRIORITY.indexOf(cat) >= 0) return;
      var items = byCat[cat];
      if (!items) return;
      var filtered = items.filter(function (it) {
        if (!filter) return true;
        return (it.path + ' ' + it.title).toLowerCase().indexOf(filter) >= 0;
      });
      if (!filtered.length) return;
      html += '<div class="sx-cat">' + esc(cat) + '</div><div class="sx-grid">';
      filtered.forEach(function (it) {
        html +=
          '<button type="button" class="sx-card" data-path="' + esc(it.path) + '">' +
            '<i class="fa-solid fa-puzzle-piece"></i><span>' + esc(it.title) + '</span></button>';
      });
      html += '</div>';
    });
    if (!html) html = '<p class="sx-empty">Tidak ada endpoint cocok.</p>';
    HOST_GRID.innerHTML = html;
    HOST_GRID.querySelectorAll('.sx-card').forEach(function (btn) {
      btn.onclick = function () { openTool(btn.getAttribute('data-path')); };
    });
  }

  function openTool(path) {
    var pathObj = allPaths[path];
    if (!pathObj) return;
    var op = getOp(pathObj);
    if (!op) return;
    var params = paramsOf(op);
    var method = pathObj.get ? 'GET' : 'POST';
    var form =
      '<div class="sx-tool-head">' +
        '<button type="button" class="sx-back" id="sxBack" aria-label="Kembali"><i class="fa-solid fa-arrow-left"></i></button>' +
        '<div><b>' + esc(titleOf(path)) + '</b><div class="sx-path">' + esc(method + ' ' + path) + '</div></div>' +
      '</div>';
    if (op.summary) form += '<p class="sx-sum">' + esc(op.summary) + '</p>';
    form += '<div class="sx-form" id="sxForm">';
    if (!params.length) {
      form += '<p class="sx-sum">Tanpa parameter — langsung generate.</p>';
    }
    params.forEach(function (p) {
      var req = p.required ? ' *' : '';
      var ph = (p.schema && p.schema.example) || p.description || p.name;
      var isLong = /text|prompt|message|query|comment|description|quote/i.test(p.name);
      form += '<label>' + esc(p.name) + req + '</label>';
      if (isLong) {
        form += '<textarea data-name="' + esc(p.name) + '" rows="3" placeholder="' + esc(ph) + '"></textarea>';
      } else {
        form += '<input data-name="' + esc(p.name) + '" type="text" placeholder="' + esc(ph) + '">';
      }
    });
    form += '</div>';
    form += '<button type="button" class="sx-run" id="sxRun"><i class="fa-solid fa-bolt"></i> Jalankan</button>';
    form += '<div class="sx-out" id="sxOut"></div>';

    HOST_PANEL.classList.add('active');
    HOST_AREA.innerHTML = form;
    document.getElementById('sxBack').onclick = function () {
      HOST_PANEL.classList.remove('active');
      HOST_AREA.innerHTML = '';
    };
    document.getElementById('sxRun').onclick = function () { runTool(path, method, params); };
  }

  async function runTool(path, method, params) {
    var out = document.getElementById('sxOut');
    var runBtn = document.getElementById('sxRun');
    if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading…'; }
    out.innerHTML = '<div class="sx-loading">Memanggil API Siputzx…</div>';
    try {
      var q = {};
      params.forEach(function (p) {
        var el = document.querySelector('#sxForm [data-name="' + p.name + '"]');
        var v = el ? String(el.value || '').trim() : '';
        if (v) q[p.name] = v;
        else if (p.required) throw new Error('Isi parameter: ' + p.name);
      });
      // defaults for popular tools
      if (path.indexOf('/brat') >= 0 && !q.text) throw new Error('Isi text dulu');

      var url = BASE + path;
      var res;
      if (method === 'GET') {
        var qs = Object.keys(q).map(function (k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]);
        }).join('&');
        if (qs) url += (url.indexOf('?') >= 0 ? '&' : '?') + qs;
        res = await fetch(url, { method: 'GET' });
      } else {
        // try query string for POST too (siputzx often accepts both)
        var qs2 = Object.keys(q).map(function (k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]);
        }).join('&');
        if (qs2) url += (url.indexOf('?') >= 0 ? '&' : '?') + qs2;
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q)
        });
      }

      var ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!res.ok) {
        var errTxt = await res.text();
        var msg = errTxt;
        try {
          var ej = JSON.parse(errTxt);
          msg = ej.error || ej.message || errTxt;
        } catch (e) {}
        throw new Error('HTTP ' + res.status + ' — ' + msg);
      }

      if (ct.indexOf('image/') === 0 || ct.indexOf('octet-stream') >= 0) {
        var blob = await res.blob();
        var obj = URL.createObjectURL(blob);
        out.innerHTML =
          '<img class="sx-img" src="' + obj + '" alt="hasil">' +
          '<a class="sx-dl" href="' + obj + '" download="nailong-tool.png"><i class="fa-solid fa-download"></i> Unduh</a>';
      } else if (ct.indexOf('audio/') === 0 || ct.indexOf('video/') === 0) {
        var blob2 = await res.blob();
        var obj2 = URL.createObjectURL(blob2);
        var tag = ct.indexOf('audio/') === 0 ? 'audio' : 'video';
        out.innerHTML =
          '<' + tag + ' class="sx-media" controls src="' + obj2 + '"></' + tag + '>' +
          '<a class="sx-dl" href="' + obj2 + '" download><i class="fa-solid fa-download"></i> Unduh</a>';
      } else {
        var text = await res.text();
        var pretty = text;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch (e) {}
        // try extract image url from json
        var imgUrl = null;
        try {
          var j = JSON.parse(text);
          imgUrl = j.result || j.url || j.image || (j.data && (j.data.url || j.data.image || j.data.result)) || null;
          if (typeof imgUrl === 'object' && imgUrl) imgUrl = imgUrl.url || imgUrl.image || null;
        } catch (e) {}
        if (imgUrl && /^https?:\/\//i.test(String(imgUrl))) {
          out.innerHTML =
            '<img class="sx-img" src="' + esc(imgUrl) + '" alt="hasil" referrerpolicy="no-referrer">' +
            '<a class="sx-dl" href="' + esc(imgUrl) + '" target="_blank" rel="noopener">Buka link</a>' +
            '<pre class="sx-json">' + esc(pretty) + '</pre>';
        } else {
          out.innerHTML = '<pre class="sx-json">' + esc(pretty) + '</pre>';
        }
      }
    } catch (e) {
      out.innerHTML = '<div class="sx-err"><i class="fa-solid fa-triangle-exclamation"></i> ' + esc(e.message || e) + '</div>';
    }
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Jalankan'; }
  }

  async function boot() {
    HOST_GRID = document.getElementById('sxGrid');
    HOST_PANEL = document.getElementById('sxPanel');
    HOST_AREA = document.getElementById('sxArea');
    var status = document.getElementById('sxStatus');
    if (!HOST_GRID) return;
    try {
      if (status) status.textContent = 'Memuat daftar API Siputzx…';
      var res = await fetch(OPENAPI);
      if (!res.ok) throw new Error('Gagal load OpenAPI (' + res.status + ')');
      var data = await res.json();
      allPaths = data.paths || {};
      byCat = {};
      Object.keys(allPaths).forEach(function (path) {
        var op = getOp(allPaths[path]);
        if (!op) return;
        var cat = catOf(path);
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push({ path: path, title: titleOf(path), op: op });
      });
      // sort each cat
      Object.keys(byCat).forEach(function (c) {
        byCat[c].sort(function (a, b) { return a.title.localeCompare(b.title); });
      });
      var total = Object.keys(allPaths).length;
      if (status) status.textContent = total + ' endpoint dari api.siputzx.my.id';
      renderGrid('');
      var search = document.getElementById('sxSearch');
      if (search) {
        search.oninput = function () { renderGrid(search.value); };
      }
    } catch (e) {
      if (status) status.textContent = 'Error: ' + (e.message || e);
      HOST_GRID.innerHTML =
        '<div class="sx-err">Gagal memuat API. Cek koneksi / CORS.<br>' +
        '<a href="https://app.siputzx.my.id/playground" target="_blank" rel="noopener">Buka playground Siputzx</a></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
