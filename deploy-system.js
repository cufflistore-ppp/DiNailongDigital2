/**
 * Sistem request deploy: user isi nama + platform + ZIP
 * → simpan ke Firebase + IndexedDB
 * → admin lihat/download
 * → jika token ada: auto deploy Netlify/Vercel, user terima domain
 */
(function () {
  var DB_NAME = 'nailong_deploy_db';
  var STORE = 'zips';
  var RTDB_PATH = 'deployRequests';

  function cfg() {
    return window.NailongDeployConfig || {};
  }

  function db() {
    try {
      if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) window.VoxyyOrders.initFirebase();
      if (typeof firebase !== 'undefined' && firebase.database) return firebase.database();
    } catch (e) {}
    return null;
  }

  function openIDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbPut(key, blob) {
    return openIDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(blob, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function idbGet(key) {
    return openIDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(STORE, 'readonly');
        var r = tx.objectStore(STORE).get(key);
        r.onsuccess = function () { resolve(r.result || null); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || ('nd-' + Date.now().toString(36));
  }

  function uid() {
    return 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  function currentUserMeta() {
    var u = null;
    try {
      if (window.VoxyyAuth && window.VoxyyAuth.getCurrentUser) u = window.VoxyyAuth.getCurrentUser();
      else if (typeof firebase !== 'undefined' && firebase.auth) u = firebase.auth().currentUser;
    } catch (e) {}
    return {
      uid: u && u.uid ? u.uid : 'guest',
      name: (u && (u.displayName || u.email)) || 'Guest',
      email: (u && u.email) || ''
    };
  }

  /** Upload ZIP ke Firebase Storage jika tersedia, else IndexedDB only */
  async function storeZip(id, file) {
    await idbPut(id, file);
    var url = null;
    try {
      if (typeof firebase !== 'undefined' && firebase.storage) {
        var ref = firebase.storage().ref('deploy-zips/' + id + '.zip');
        await ref.put(file);
        url = await ref.getDownloadURL();
      }
    } catch (e) {
      console.warn('[deploy] storage optional', e.message || e);
    }
    return url;
  }

  async function deployNetlify(name, zipBlob) {
    var token = cfg().NETLIFY_TOKEN;
    if (!token) throw new Error('NETLIFY_TOKEN belum diisi di deploy-config.js');
    var form = new FormData();
    form.append('file', zipBlob, name + '.zip');
    // create site with name
    var siteRes = await fetch(cfg().NETLIFY_API + '/sites', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    });
    var site = await siteRes.json();
    if (!siteRes.ok) {
      // nama mungkin sudah dipakai → biarkan Netlify random
      siteRes = await fetch(cfg().NETLIFY_API + '/sites', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      site = await siteRes.json();
      if (!siteRes.ok) throw new Error(site.message || 'Gagal buat site Netlify');
    }
    var depRes = await fetch(cfg().NETLIFY_API + '/sites/' + site.id + '/deploys', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/zip' },
      body: zipBlob
    });
    var dep = await depRes.json();
    if (!depRes.ok) throw new Error(dep.message || 'Gagal deploy Netlify');
    var domain = site.ssl_url || site.url || ('https://' + (site.name || name) + '.netlify.app');
    return { domain: domain, providerId: site.id, raw: dep };
  }

  async function deployVercel(name, zipBlob) {
    var token = cfg().VERCEL_TOKEN;
    if (!token) throw new Error('VERCEL_TOKEN belum diisi di deploy-config.js');
    // Vercel prefers file tree; for zip use deployment files API is complex.
    // Practical approach: create project + instruct; or use deploy with files from JSZip.
    if (typeof JSZip === 'undefined') {
      await new Promise(function (res, rej) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }
    var zip = await JSZip.loadAsync(zipBlob);
    var files = [];
    var paths = Object.keys(zip.files);
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      if (zip.files[p].dir) continue;
      var content = await zip.files[p].async('uint8array');
      // base64
      var bin = '';
      for (var j = 0; j < content.length; j++) bin += String.fromCharCode(content[j]);
      files.push({ file: p, data: btoa(bin) });
    }
    var team = cfg().VERCEL_TEAM_ID ? ('?teamId=' + encodeURIComponent(cfg().VERCEL_TEAM_ID)) : '';
    var body = {
      name: name,
      files: files,
      projectSettings: { framework: null }
    };
    var res = await fetch(cfg().VERCEL_API + '/v13/deployments' + team, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error && data.error.message ? data.error.message : (data.message || 'Gagal deploy Vercel'));
    var domain = 'https://' + (data.url || (name + '.vercel.app'));
    if (domain.indexOf('https://') !== 0) domain = 'https://' + domain;
    return { domain: domain, providerId: data.id || data.uid, raw: data };
  }

  async function submitRequest(opts) {
    opts = opts || {};
    var name = slugify(opts.name);
    var platform = (opts.platform || 'netlify').toLowerCase();
    var file = opts.file;
    if (!file) throw new Error('Upload ZIP wajib');
    if (!name) throw new Error('Nama domain wajib');

    var id = uid();
    var user = currentUserMeta();
    var zipUrl = await storeZip(id, file);

    var rec = {
      id: id,
      name: name,
      platform: platform,
      status: 'pending', // pending | deploying | live | failed
      domain: '',
      zipName: file.name || (name + '.zip'),
      zipSize: file.size || 0,
      zipUrl: zipUrl || '',
      userUid: user.uid,
      userName: user.name,
      userEmail: user.email,
      error: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // simpan metadata RTDB / local
    var database = db();
    if (database) {
      await database.ref(RTDB_PATH + '/' + id).set(rec);
    }
    try {
      var local = JSON.parse(localStorage.getItem('nailong_deploys') || '[]');
      local.unshift(rec);
      localStorage.setItem('nailong_deploys', JSON.stringify(local.slice(0, 100)));
    } catch (e) {}

    // auto deploy jika token ada
    if (cfg().AUTO_DEPLOY) {
      var hasToken = (platform === 'netlify' && cfg().NETLIFY_TOKEN) || (platform === 'vercel' && cfg().VERCEL_TOKEN);
      if (hasToken) {
        rec.status = 'deploying';
        await updateRec(id, { status: 'deploying' });
        try {
          var blob = file;
          var result = platform === 'vercel' ? await deployVercel(name, blob) : await deployNetlify(name, blob);
          rec.status = 'live';
          rec.domain = result.domain;
          rec.providerId = result.providerId;
          await updateRec(id, { status: 'live', domain: result.domain, providerId: result.providerId, updatedAt: Date.now() });
        } catch (err) {
          rec.status = 'failed';
          rec.error = err.message || String(err);
          await updateRec(id, { status: 'failed', error: rec.error, updatedAt: Date.now() });
        }
      }
    }
    return rec;
  }

  async function updateRec(id, patch) {
    var database = db();
    if (database) {
      await database.ref(RTDB_PATH + '/' + id).update(patch);
    }
    try {
      var local = JSON.parse(localStorage.getItem('nailong_deploys') || '[]');
      local = local.map(function (x) { return x.id === id ? Object.assign({}, x, patch) : x; });
      localStorage.setItem('nailong_deploys', JSON.stringify(local));
    } catch (e) {}
  }

  function listenAll(cb) {
    var database = db();
    if (database) {
      database.ref(RTDB_PATH).on('value', function (snap) {
        var val = snap.val() || {};
        var list = Object.keys(val).map(function (k) { return val[k]; });
        list.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
        cb(list);
      });
      return;
    }
    try {
      cb(JSON.parse(localStorage.getItem('nailong_deploys') || '[]'));
    } catch (e) { cb([]); }
  }

  async function downloadZip(id) {
    var blob = await idbGet(id);
    if (blob) return blob;
    // try storage url from record
    var list = [];
    try { list = JSON.parse(localStorage.getItem('nailong_deploys') || '[]'); } catch (e) {}
    var rec = list.find(function (x) { return x.id === id; });
    if (rec && rec.zipUrl) {
      var r = await fetch(rec.zipUrl);
      return await r.blob();
    }
    throw new Error('ZIP tidak ditemukan di perangkat ini (mungkin di-upload dari device lain). Isi Firebase Storage agar lintas device.');
  }

  async function retryDeploy(id) {
    var blob = await downloadZip(id);
    var list = JSON.parse(localStorage.getItem('nailong_deploys') || '[]');
    var rec = list.find(function (x) { return x.id === id; }) || { id: id, name: 'site', platform: 'netlify' };
    await updateRec(id, { status: 'deploying', error: '' });
    try {
      var result = rec.platform === 'vercel' ? await deployVercel(rec.name, blob) : await deployNetlify(rec.name, blob);
      await updateRec(id, { status: 'live', domain: result.domain, providerId: result.providerId, updatedAt: Date.now() });
      return result;
    } catch (e) {
      await updateRec(id, { status: 'failed', error: e.message || String(e) });
      throw e;
    }
  }

  window.NailongDeploy = {
    submitRequest: submitRequest,
    listenAll: listenAll,
    downloadZip: downloadZip,
    retryDeploy: retryDeploy,
    slugify: slugify
  };
})();
