/**
 * Channel Testimoni Nailong
 * - Daftar akun → auto join channel
 * - Order sukses → auto post testimoni (mask nama)
 * - Chat hanya: admin + user terverifikasi (sudah pernah order/testimoni)
 */
(function () {
  var STORAGE_KEY = 'nailong_channel_feed';
  var MEMBER_KEY = 'nailong_channel_members';
  var VERIFY_KEY = 'nailong_channel_verified';

  function loadFeed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveFeed(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, 200))); } catch (e) {}
  }
  function loadMembers() {
    try { return JSON.parse(localStorage.getItem(MEMBER_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveMembers(m) {
    try { localStorage.setItem(MEMBER_KEY, JSON.stringify(m)); } catch (e) {}
  }
  function loadVerified() {
    try { return JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveVerified(v) {
    try { localStorage.setItem(VERIFY_KEY, JSON.stringify(v)); } catch (e) {}
  }

  function maskName(name) {
    var n = String(name || 'User').trim();
    if (n.length <= 2) return n[0] + '***';
    return n.substring(0, 1) + '***' + n.substring(n.length - 1);
  }

  function uidFromUser(user) {
    if (!user) return null;
    return user.uid || user.email || null;
  }

  function isAdminUser(user) {
    if (!user) return false;
    // Samakan dengan admin.js bila ada list email admin di localStorage
    try {
      var list = JSON.parse(localStorage.getItem('nailong_admin_emails') || '[]');
      if (user.email && list.indexOf(String(user.email).toLowerCase()) !== -1) return true;
    } catch (e) {}
    if (window._nailongIsAdmin) return true;
    return false;
  }

  function isVerified(user) {
    if (!user) return false;
    if (isAdminUser(user)) return true;
    var id = uidFromUser(user);
    if (!id) return false;
    var v = loadVerified();
    return !!v[id];
  }

  function markVerified(user) {
    var id = uidFromUser(user);
    if (!id) return;
    var v = loadVerified();
    v[id] = { at: Date.now(), name: user.displayName || user.email || 'User' };
    saveVerified(v);
  }

  /** Panggil saat login sukses / daftar */
  function joinOnRegister(user) {
    if (!user) return;
    var id = uidFromUser(user);
    if (!id) return;
    var m = loadMembers();
    if (!m[id]) {
      m[id] = {
        name: user.displayName || user.email || 'Member',
        joinedAt: Date.now(),
        photo: user.photoURL || ''
      };
      saveMembers(m);
      // system post (sekali)
      var feed = loadFeed();
      var already = feed.some(function (p) {
        return p.type === 'join' && p.uid === id;
      });
      if (!already) {
        feed.unshift({
          id: 'join_' + id + '_' + Date.now(),
          type: 'join',
          uid: id,
          name: maskName(user.displayName || user.email || 'User'),
          text: 'bergabung di Channel Testimoni 👋',
          at: Date.now(),
          role: 'member'
        });
        saveFeed(feed);
      }
    }
  }

  /** Panggil saat order dibuat / sukses */
  function postOrderTestimoni(order, user) {
    if (!order) return;
    var name = maskName((user && (user.displayName || user.email)) || order.nama || 'Customer');
    var paket = order.paket || order.nama || 'Order';
    var total = order.total || order.finalAmount || '';
    if (typeof total === 'number') total = 'Rp ' + total.toLocaleString('id-ID');
    var feed = loadFeed();
    feed.unshift({
      id: 'ord_' + (order.kode || Date.now()),
      type: 'order',
      uid: user ? uidFromUser(user) : null,
      name: name,
      text: 'Order berhasil · ' + paket + (total ? ' · ' + total : ''),
      orderTag: order.kode || '',
      at: Date.now(),
      role: 'member'
    });
    saveFeed(feed);
    if (user) markVerified(user);
  }

  function canChat(user) {
    return isAdminUser(user) || isVerified(user);
  }

  function postMessage(text, user) {
    text = String(text || '').trim();
    if (!text) return { ok: false, error: 'Pesan kosong' };
    if (!user) return { ok: false, error: 'Login dulu' };
    if (!canChat(user)) {
      return { ok: false, error: 'Hanya admin & member terverifikasi (sudah order) yang bisa chat.' };
    }
    var admin = isAdminUser(user);
    var feed = loadFeed();
    feed.unshift({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'chat',
      uid: uidFromUser(user),
      name: admin ? (user.displayName || 'Admin') : maskName(user.displayName || user.email || 'User'),
      text: text,
      at: Date.now(),
      role: admin ? 'admin' : 'verified'
    });
    saveFeed(feed);
    return { ok: true };
  }

  function ensureSeed() {
    var feed = loadFeed();
    if (feed.length) return;
    feed = [
      {
        id: 'sys1', type: 'system', name: 'Nailong Official', role: 'admin',
        text: 'Selamat datang di Channel Testimoni. Order dari semua akun muncul di sini. Chat hanya untuk admin & member terverifikasi.',
        at: Date.now() - 86400000
      }
    ];
    saveFeed(feed);
  }

  function renderFeed(container) {
    if (!container) return;
    ensureSeed();
    var feed = loadFeed();
    if (!feed.length) {
      container.innerHTML = '<p style="color:#8aa0b8;font-size:13px;text-align:center;">Belum ada postingan.</p>';
      return;
    }
    container.innerHTML = feed.map(function (p) {
      var isAdm = p.role === 'admin';
      var initial = (p.name || 'U').charAt(0).toUpperCase();
      var time = '';
      try {
        time = new Date(p.at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (e) {}
      var badge = isAdm
        ? '<span class="ch-badge admin-badge">ADMIN</span>'
        : (p.type === 'order' ? '<span class="ch-badge">ORDER</span>' : (p.role === 'verified' ? '<span class="ch-badge">VERIFIED</span>' : ''));
      var tag = p.orderTag ? '<div class="ch-order-tag">#' + String(p.orderTag).replace(/</g, '') + '</div>' : '';
      return (
        '<div class="ch-card' + (isAdm ? ' admin' : '') + '">' +
          '<div class="ch-meta">' +
            '<div class="ch-avatar">' + initial + '</div>' +
            '<div><div class="ch-name">' + escapeHtml(p.name) + ' ' + badge + '</div>' +
            '<div>' + time + '</div></div>' +
          '</div>' +
          '<div class="ch-body">' + escapeHtml(p.text) + '</div>' + tag +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Auto: join saat auth ready
  function hookAuth() {
    function onUser(user) {
      if (user) joinOnRegister(user);
    }
    if (window.VoxyyAuth && VoxyyAuth.onAuthChange) {
      VoxyyAuth.onAuthChange(onUser);
    } else if (window.VoxyyAuth && VoxyyAuth.getCurrentUser) {
      onUser(VoxyyAuth.getCurrentUser());
    }
    // juga cek order lokal → verify + post bila belum
    try {
      var orders = JSON.parse(localStorage.getItem('voxyy_orders') || '[]');
      var user = window.VoxyyAuth && VoxyyAuth.getCurrentUser ? VoxyyAuth.getCurrentUser() : null;
      orders.slice(0, 5).forEach(function (o) {
        var st = String(o.status || '').toLowerCase();
        if (st.includes('sukses') || st.includes('selesai') || st.includes('bayar') || o.kode) {
          if (user) markVerified(user);
        }
      });
    } catch (e) {}
  }

  // Hook order add
  function hookOrders() {
    if (!window.VoxyyOrders || !VoxyyOrders.addOrder) return;
    var orig = VoxyyOrders.addOrder.bind(VoxyyOrders);
    VoxyyOrders.addOrder = async function (order) {
      var res = await orig(order);
      try {
        var user = window.VoxyyAuth && VoxyyAuth.getCurrentUser ? VoxyyAuth.getCurrentUser() : null;
        postOrderTestimoni(order, user);
      } catch (e) {}
      return res;
    };
  }

  window.NailongChannel = {
    joinOnRegister: joinOnRegister,
    postOrderTestimoni: postOrderTestimoni,
    postMessage: postMessage,
    canChat: canChat,
    isVerified: isVerified,
    isAdminUser: isAdminUser,
    renderFeed: renderFeed,
    loadFeed: loadFeed,
    markVerified: markVerified
  };

  function init() {
    hookAuth();
    setTimeout(hookOrders, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
