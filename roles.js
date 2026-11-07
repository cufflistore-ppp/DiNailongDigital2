/**
 * Nailong Digital — Role & Partner system
 * Roles: pengunjung | partner | paid_promote | founder | buyer_sultan_1|2|3
 * Data di Firebase RTDB agar tidak hilang saat update website.
 */
(function () {
  var ROLES = {
    pengunjung: { label: 'Pengunjung', color: '#555' },
    partner: { label: 'Partner', color: '#FF8C00' },
    paid_promote: { label: 'Paid Promote', color: '#FFD600' },
    founder: { label: 'Founder', color: '#111' },
    buyer_sultan_1: { label: 'Buyer Sultan #1', color: '#FFD600' },
    buyer_sultan_2: { label: 'Buyer Sultan #2', color: '#FF8C00' },
    buyer_sultan_3: { label: 'Buyer Sultan #3', color: '#c9a227' }
  };

  var FOUNDER_EMAILS = [
    'raffliraffli649@gmail.com'
  ];

  var PRICE = { partner: 150000, paid_promote: 90000 };

  function db() {
    try {
      if (typeof firebase === 'undefined') return null;
      if (!firebase.apps.length && window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
        firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG);
      }
      return firebase.database();
    } catch (e) { return null; }
  }

  function uidOf(user) {
    return user && (user.uid || user.id) || null;
  }

  function isFounder(user) {
    if (!user) return false;
    var em = String(user.email || '').toLowerCase();
    if (FOUNDER_EMAILS.indexOf(em) >= 0) return true;
    return false;
  }

  async function ensureUserProfile(user) {
    if (!user || !db()) return null;
    var uid = uidOf(user);
    var ref = db().ref('nd_users/' + uid);
    var snap = await ref.once('value');
    var cur = snap.val() || {};
    var role = cur.role || 'pengunjung';
    if (isFounder(user)) role = 'founder';
    var patch = {
      uid: uid,
      email: user.email || cur.email || '',
      name: user.displayName || cur.name || 'User',
      photo: user.photoURL || cur.photo || '',
      role: role,
      updatedAt: Date.now()
    };
    if (!cur.createdAt) patch.createdAt = Date.now();
    if (!cur.idPublic) patch.idPublic = 'ND' + String(uid).slice(-6).toUpperCase();
    await ref.update(patch);
    try {
      var cache = JSON.parse(localStorage.getItem('nd_profile_cache') || '{}');
      cache[uid] = { name: patch.name, photo: patch.photo, role: patch.role };
      localStorage.setItem('nd_profile_cache', JSON.stringify(cache));
    } catch (e) {}
    return Object.assign({}, cur, patch);
  }

  async function getProfile(uid) {
    if (!uid || !db()) return null;
    var snap = await db().ref('nd_users/' + uid).once('value');
    return snap.val();
  }

  async function setRole(uid, role, extra) {
    if (!uid || !db()) return;
    var data = Object.assign({ role: role, roleUpdatedAt: Date.now() }, extra || {});
    await db().ref('nd_users/' + uid).update(data);
  }

  async function submitApplication(type, payload) {
    if (!db()) throw new Error('Database offline');
    var id = 'app_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var row = Object.assign({}, payload, {
      id: id,
      type: type, // partner | paid_promote
      status: 'pending', // pending | approved | rejected
      createdAt: Date.now()
    });
    await db().ref('nd_applications/' + id).set(row);
    if (payload.uid) {
      await db().ref('nd_users/' + payload.uid).update({
        pendingApp: id,
        pendingAppType: type
      });
    }
    return id;
  }

  async function listApplications(type, status) {
    if (!db()) return [];
    var snap = await db().ref('nd_applications').once('value');
    var all = snap.val() || {};
    return Object.keys(all).map(function (k) { return all[k]; })
      .filter(function (a) {
        if (type && a.type !== type) return false;
        if (status && a.status !== status) return false;
        return true;
      })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }

  async function approveApplication(appId, founderUid) {
    if (!db()) return;
    var ref = db().ref('nd_applications/' + appId);
    var snap = await ref.once('value');
    var app = snap.val();
    if (!app) throw new Error('Aplikasi tidak ditemukan');
    var role = app.type === 'partner' ? 'partner' : 'paid_promote';
    await ref.update({ status: 'approved', approvedAt: Date.now(), approvedBy: founderUid || '' });
    if (app.uid) {
      await setRole(app.uid, role, {
        storeEnabled: true,
        groupJoined: true,
        approvedAppId: appId
      });
    }
    return app;
  }

  async function rejectApplication(appId, reason) {
    if (!db()) return;
    await db().ref('nd_applications/' + appId).update({
      status: 'rejected',
      rejectedAt: Date.now(),
      rejectReason: reason || ''
    });
  }

  async function blacklistUser(uid, reason, evidence, byUid) {
    if (!db() || !uid) return;
    var profile = await getProfile(uid);
    var id = 'bl_' + Date.now();
    var row = {
      id: id,
      uid: uid,
      name: (profile && profile.name) || '',
      email: (profile && profile.email) || '',
      photo: (profile && profile.photo) || '',
      roleBefore: (profile && profile.role) || 'pengunjung',
      storeName: (profile && profile.storeName) || '',
      idents: (profile && profile.idents) || null,
      ktpUrl: (profile && profile.ktpUrl) || '',
      faceKtpUrl: (profile && profile.faceKtpUrl) || '',
      reason: reason || '',
      evidence: evidence || '',
      byUid: byUid || '',
      createdAt: Date.now()
    };
    await db().ref('nd_blacklist/' + id).set(row);
    // role back to pengunjung, close store, clear products flag
    await setRole(uid, 'pengunjung', {
      blacklisted: true,
      blacklistId: id,
      storeEnabled: false,
      storeClosed: true,
      groupJoined: false,
      productsHidden: true
    });
    // hide products
    try {
      var ps = await db().ref('nd_stores/' + uid + '/products').once('value');
      var products = ps.val() || {};
      Object.keys(products).forEach(function (pid) {
        db().ref('nd_stores/' + uid + '/products/' + pid).update({ hidden: true, blacklisted: true });
      });
      await db().ref('nd_stores/' + uid).update({ closed: true, closedAt: Date.now() });
    } catch (e) {}
    return id;
  }

  async function listBlacklist() {
    if (!db()) return [];
    var snap = await db().ref('nd_blacklist').once('value');
    var all = snap.val() || {};
    return Object.keys(all).map(function (k) { return all[k]; })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }

  async function saveStore(uid, data) {
    if (!db() || !uid) return;
    await db().ref('nd_stores/' + uid).update(Object.assign({}, data, { updatedAt: Date.now() }));
    await db().ref('nd_users/' + uid).update({
      storeName: data.name || '',
      storeBanner: data.banner || '',
      storePhoto: data.photo || ''
    });
  }

  async function updateLeaderboardSultans(top3) {
    // top3 = [{uid, name, photo, trxCount}, ...]
    if (!db() || !top3 || !top3.length) return;
    for (var i = 0; i < top3.length && i < 3; i++) {
      var t = top3[i];
      if (!t.uid) continue;
      var role = 'buyer_sultan_' + (i + 1);
      var cur = await getProfile(t.uid);
      if (cur && (cur.role === 'founder' || cur.role === 'partner' || cur.role === 'paid_promote')) continue;
      await setRole(t.uid, role, { trxCount: t.trxCount || 0 });
    }
  }

  
  async function updateProfile(uid, patch) {
    if (!uid || !db()) throw new Error('Offline');
    var ref = db().ref('nd_users/' + uid);
    var snap = await ref.once('value');
    var cur = snap.val() || {};
    var changes = Number(cur.profileChangeCount || 0);
    var wantName = patch.name != null && String(patch.name).trim() && String(patch.name).trim() !== String(cur.name || '');
    var wantPhoto = patch.photo != null && String(patch.photo).trim() && String(patch.photo).trim() !== String(cur.photo || '');
    if (wantName || wantPhoto) {
      if (changes >= 3) throw new Error('Batas ganti profil sudah 3x. Tidak bisa ganti lagi.');
      changes += 1;
    }
    var data = {
      profileChangeCount: changes,
      profileUpdatedAt: Date.now()
    };
    if (patch.name != null) data.name = String(patch.name).trim().slice(0, 40);
    if (patch.photo != null) data.photo = String(patch.photo).trim();
    await ref.update(data);
    // sync chat/channel local members if any
    try {
      var m = JSON.parse(localStorage.getItem('nailong_channel_members') || '{}');
      if (m[uid]) {
        if (data.name) m[uid].name = data.name;
        if (data.photo) m[uid].photo = data.photo;
        localStorage.setItem('nailong_channel_members', JSON.stringify(m));
      }
    } catch (e) {}
    return Object.assign({}, cur, data);
  }

  async function postPartnerTestimoni(payload) {
    // payload: {uid, storeName, role, product, amount, tfPhoto, photo, name, trxCount}
    if (!db()) throw new Error('Offline');
    var id = 'tes_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    var row = Object.assign({
      id: id,
      at: Date.now(),
      source: payload.source || 'auto'
    }, payload || {});
    await db().ref('nd_testimoni/' + id).set(row);
    // also mirror to local channel feed for UI that still reads local
    try {
      var feed = JSON.parse(localStorage.getItem('nailong_channel_feed') || '[]');
      feed.unshift({
        id: id,
        type: 'partner_trx',
        uid: row.uid || '',
        name: row.name || row.storeName || 'Partner',
        photo: row.photo || '',
        storeName: row.storeName || '',
        role: row.role || '',
        product: row.product || '',
        amount: row.amount || '',
        tfPhoto: row.tfPhoto || '',
        trxCount: row.trxCount || 0,
        text: (row.storeName ? row.storeName + ' · ' : '') + (row.product || 'TRX') + (row.amount ? ' · ' + row.amount : ''),
        at: row.at
      });
      localStorage.setItem('nailong_channel_feed', JSON.stringify(feed.slice(0, 200)));
    } catch (e) {}
    // bump trx count on user
    if (row.uid) {
      var p = await getProfile(row.uid);
      var n = Number((p && p.trxCount) || 0) + 1;
      await db().ref('nd_users/' + row.uid).update({ trxCount: n });
    }
    return id;
  }

  async function listTestimoni(limit) {
    if (!db()) return [];
    var snap = await db().ref('nd_testimoni').once('value');
    var all = snap.val() || {};
    return Object.keys(all).map(function (k) { return all[k]; })
      .sort(function (a, b) { return (b.at || 0) - (a.at || 0); })
      .slice(0, limit || 50);
  }

  window.NDRoles = {
    ROLES: ROLES,
    PRICE: PRICE,
    FOUNDER_EMAILS: FOUNDER_EMAILS,
    isFounder: isFounder,
    ensureUserProfile: ensureUserProfile,
    getProfile: getProfile,
    setRole: setRole,
    submitApplication: submitApplication,
    listApplications: listApplications,
    approveApplication: approveApplication,
    rejectApplication: rejectApplication,
    blacklistUser: blacklistUser,
    listBlacklist: listBlacklist,
    saveStore: saveStore,
    updateLeaderboardSultans: updateLeaderboardSultans,
    updateProfile: updateProfile,
    postPartnerTestimoni: postPartnerTestimoni,
    listTestimoni: listTestimoni,
    roleLabel: function (r) { return (ROLES[r] && ROLES[r].label) || r || 'Pengunjung'; }
  };
})();
