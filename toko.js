/**
 * Nailong Digital — Sistem Toko Publik
 * Data stores/products di Firebase (fallback localStorage) agar lintas akun/device.
 * Harga jual utuh (tanpa potongan). Tarik saldo → potong saldo toko + chat admin.
 */
(function () {
  var LOCAL_STORES = 'nailong_stores';
  var LOCAL_PRODUCTS = 'nailong_store_products';
  var LOCAL_REVIEWS = 'nailong_store_reviews';
  var LOCAL_REPORTS = 'nailong_store_reports';
  var LOCAL_CART = 'nailong_cart';
  var LOCAL_SELLER_BAL = 'nailong_seller_balance';
  var LOCAL_LOG = 'nailong_store_mod_log';

  function db() {
    try {
      if (window.VoxyyOrders && VoxyyOrders.isGlobalConfigured && VoxyyOrders.isGlobalConfigured()) {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
          return firebase.database();
        }
      }
    } catch (e) {}
    return null;
  }

  function uid() {
    try {
      var u = window.VoxyyAuth && VoxyyAuth.getCurrentUser && VoxyyAuth.getCurrentUser();
      return u ? (u.uid || u.email || null) : null;
    } catch (e) { return null; }
  }

  function userName() {
    try {
      var u = window.VoxyyAuth && VoxyyAuth.getCurrentUser && VoxyyAuth.getCurrentUser();
      return u ? (u.displayName || u.email || 'User') : 'Guest';
    } catch (e) { return 'Guest'; }
  }

  function genStoreId() {
    var y = new Date().getFullYear();
    var r = Math.floor(1000 + Math.random() * 9000);
    var t = String(Date.now()).slice(-4);
    return 'ND-TOKO-' + y + '-' + r + t;
  }

  function genProductId() {
    return 'PRD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  // ---------- local helpers ----------
  function getLocal(key) {
    try { return JSON.parse(localStorage.getItem(key) || (key === LOCAL_CART || key.indexOf('balance') >= 0 ? (key === LOCAL_CART ? '[]' : '{}') : (key === LOCAL_SELLER_BAL ? '{}' : '[]'))); } catch (e) {
      return key === LOCAL_CART ? [] : (key === LOCAL_SELLER_BAL || key === LOCAL_STORES && false ? {} : []);
    }
  }
  function setLocal(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function loadLocalStores() {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORES) || '{}'); } catch (e) { return {}; }
  }
  function saveLocalStores(m) { setLocal(LOCAL_STORES, m); }

  function loadLocalProducts() {
    try { return JSON.parse(localStorage.getItem(LOCAL_PRODUCTS) || '{}'); } catch (e) { return {}; }
  }
  function saveLocalProducts(m) { setLocal(LOCAL_PRODUCTS, m); }

  // ---------- stores ----------
  async function getAllStores() {
    var d = db();
    if (d) {
      try {
        var snap = await d.ref('stores').once('value');
        var val = snap.val() || {};
        // merge local
        var local = loadLocalStores();
        Object.keys(local).forEach(function (k) { if (!val[k]) val[k] = local[k]; });
        return val;
      } catch (e) {}
    }
    return loadLocalStores();
  }

  async function getStore(storeId) {
    var all = await getAllStores();
    return all[storeId] || null;
  }

  async function getMyStore() {
    var id = uid();
    if (!id) return null;
    var all = await getAllStores();
    var keys = Object.keys(all);
    for (var i = 0; i < keys.length; i++) {
      if (all[keys[i]].ownerUid === id) return all[keys[i]];
    }
    return null;
  }

  async function createStore(data) {
    var id = uid();
    if (!id) return { ok: false, error: 'Login dulu untuk buka toko' };
    var existing = await getMyStore();
    if (existing) return { ok: false, error: 'Kamu sudah punya toko: ' + existing.name, store: existing };

    var storeId = genStoreId();
    var store = {
      storeId: storeId,
      ownerUid: id,
      ownerName: userName(),
      name: (data.name || 'Toko Saya').trim().slice(0, 40),
      desc: (data.desc || '').trim().slice(0, 500),
      logo: data.logo || '',
      banner: data.banner || '',
      link: (data.link || '').trim(),
      wa: (data.wa || '').replace(/\D/g, ''),
      createdAt: Date.now(),
      status: 'active', // active | review | blocked
      ratingSum: 0,
      ratingCount: 0,
      reportCount: 0,
      salesCount: 0
    };

    var local = loadLocalStores();
    local[storeId] = store;
    saveLocalStores(local);

    var d = db();
    if (d) {
      try { await d.ref('stores/' + storeId).set(store); } catch (e) { console.warn(e); }
    }
    return { ok: true, store: store };
  }

  async function updateStore(storeId, patch) {
    var store = await getStore(storeId);
    if (!store) return { ok: false, error: 'Toko tidak ditemukan' };
    if (store.ownerUid !== uid()) return { ok: false, error: 'Bukan pemilik toko' };
    Object.assign(store, patch, { updatedAt: Date.now() });
    var local = loadLocalStores();
    local[storeId] = store;
    saveLocalStores(local);
    var d = db();
    if (d) { try { await d.ref('stores/' + storeId).update(patch); } catch (e) {} }
    return { ok: true, store: store };
  }

  // ---------- products ----------
  async function getAllProducts() {
    var d = db();
    if (d) {
      try {
        var snap = await d.ref('store_products').once('value');
        var val = snap.val() || {};
        var local = loadLocalProducts();
        Object.keys(local).forEach(function (k) { if (!val[k]) val[k] = local[k]; });
        return val;
      } catch (e) {}
    }
    return loadLocalProducts();
  }

  async function getProduct(pid) {
    var all = await getAllProducts();
    return all[pid] || null;
  }

  async function getProductsByStore(storeId) {
    var all = await getAllProducts();
    return Object.keys(all).map(function (k) { return all[k]; }).filter(function (p) {
      return p.storeId === storeId && p.status !== 'deleted';
    });
  }

  async function getPublicProducts() {
    var stores = await getAllStores();
    var all = await getAllProducts();
    return Object.keys(all).map(function (k) { return all[k]; }).filter(function (p) {
      if (p.status === 'deleted') return false;
      var s = stores[p.storeId];
      if (!s || s.status === 'blocked') return false;
      return true;
    }).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }

  async function addProduct(data) {
    var my = await getMyStore();
    if (!my) return { ok: false, error: 'Buka toko dulu' };
    if (my.status === 'blocked') return { ok: false, error: 'Toko diblokir' };
    var pid = genProductId();
    var prod = {
      productId: pid,
      storeId: my.storeId,
      storeName: my.name,
      title: (data.title || 'Produk').trim().slice(0, 80),
      desc: (data.desc || '').trim().slice(0, 500),
      price: Math.max(0, parseInt(data.price, 10) || 0),
      img: data.img || '',
      stock: parseInt(data.stock, 10) || 99,
      createdAt: Date.now(),
      status: 'active',
      sold: 0
    };
    if (prod.price < 100) return { ok: false, error: 'Harga minimal Rp 100' };
    var local = loadLocalProducts();
    local[pid] = prod;
    saveLocalProducts(local);
    var d = db();
    if (d) { try { await d.ref('store_products/' + pid).set(prod); } catch (e) {} }
    return { ok: true, product: prod };
  }

  // ---------- reviews ----------
  function loadReviews() {
    try { return JSON.parse(localStorage.getItem(LOCAL_REVIEWS) || '{}'); } catch (e) { return {}; }
  }
  function saveReviews(m) { setLocal(LOCAL_REVIEWS, m); }

  async function getReviews(storeId) {
    var d = db();
    if (d) {
      try {
        var snap = await d.ref('store_reviews/' + storeId).once('value');
        var val = snap.val() || {};
        return Object.keys(val).map(function (k) { return val[k]; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
      } catch (e) {}
    }
    var all = loadReviews();
    return (all[storeId] || []).slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }

  async function addReview(storeId, rating, text) {
    var id = uid();
    if (!id) return { ok: false, error: 'Login dulu' };
    rating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    var rev = {
      id: 'REV-' + Date.now(),
      storeId: storeId,
      uid: id,
      name: userName(),
      rating: rating,
      text: (text || '').trim().slice(0, 300),
      at: Date.now()
    };
    var local = loadReviews();
    if (!local[storeId]) local[storeId] = [];
    local[storeId].unshift(rev);
    saveReviews(local);

    var store = await getStore(storeId);
    if (store) {
      store.ratingSum = (store.ratingSum || 0) + rating;
      store.ratingCount = (store.ratingCount || 0) + 1;
      var locS = loadLocalStores();
      if (locS[storeId]) { locS[storeId] = store; saveLocalStores(locS); }
      var d = db();
      if (d) {
        try {
          await d.ref('store_reviews/' + storeId + '/' + rev.id).set(rev);
          await d.ref('stores/' + storeId).update({ ratingSum: store.ratingSum, ratingCount: store.ratingCount });
        } catch (e) {}
      }
    }
    return { ok: true, review: rev };
  }

  function storeAvgRating(store) {
    if (!store || !store.ratingCount) return 0;
    return Math.round((store.ratingSum / store.ratingCount) * 10) / 10;
  }

  // ---------- reports & moderation ----------
  function loadReports() {
    try { return JSON.parse(localStorage.getItem(LOCAL_REPORTS) || '{}'); } catch (e) { return {}; }
  }
  function saveReports(m) { setLocal(LOCAL_REPORTS, m); }
  function addModLog(entry) {
    var log = [];
    try { log = JSON.parse(localStorage.getItem(LOCAL_LOG) || '[]'); } catch (e) {}
    log.unshift(Object.assign({ at: Date.now() }, entry));
    setLocal(LOCAL_LOG, log.slice(0, 200));
  }

  async function reportStore(storeId, reason) {
    var id = uid();
    if (!id) return { ok: false, error: 'Login dulu untuk lapor' };
    var rep = {
      id: 'REP-' + Date.now(),
      storeId: storeId,
      uid: id,
      reason: (reason || '').trim().slice(0, 400),
      at: Date.now(),
      status: 'pending' // pending | false_report | upheld | appealed
    };
    var local = loadReports();
    if (!local[storeId]) local[storeId] = [];
    local[storeId].unshift(rep);
    saveReports(local);

    var store = await getStore(storeId);
    if (store) {
      store.reportCount = (store.reportCount || 0) + 1;
      // Rule 3: >= 8 laporan + rating buruk → review
      var avg = storeAvgRating(store);
      if (store.reportCount >= 8 && avg > 0 && avg <= 2.5) {
        store.status = 'review';
        addModLog({ action: 'mark_review', storeId: storeId, reason: '>=8 laporan + rating buruk' });
      }
      var locS = loadLocalStores();
      if (locS[storeId]) { locS[storeId] = store; saveLocalStores(locS); }
      var d = db();
      if (d) {
        try {
          await d.ref('store_reports/' + storeId + '/' + rep.id).set(rep);
          await d.ref('stores/' + storeId).update({ reportCount: store.reportCount, status: store.status });
        } catch (e) {}
      }
    }
    addModLog({ action: 'report', storeId: storeId, by: id, reason: reason });
    return { ok: true };
  }

  async function adminSetStoreStatus(storeId, status, note) {
    // status: active | review | blocked
    var store = await getStore(storeId);
    if (!store) return { ok: false };
    store.status = status;
    var locS = loadLocalStores();
    if (locS[storeId]) { locS[storeId] = store; saveLocalStores(locS); }
    var d = db();
    if (d) { try { await d.ref('stores/' + storeId).update({ status: status }); } catch (e) {} }
    addModLog({ action: 'status_' + status, storeId: storeId, note: note || '' });
    return { ok: true };
  }

  async function appealStore(storeId, note) {
    addModLog({ action: 'appeal', storeId: storeId, by: uid(), note: note || '' });
    var store = await getStore(storeId);
    if (store && store.status === 'blocked') {
      store.status = 'review';
      var locS = loadLocalStores();
      if (locS[storeId]) { locS[storeId] = store; saveLocalStores(locS); }
      var d = db();
      if (d) { try { await d.ref('stores/' + storeId).update({ status: 'review' }); } catch (e) {} }
    }
    return { ok: true };
  }

  // ---------- cart ----------
  function getCart() {
    try { return JSON.parse(localStorage.getItem(LOCAL_CART) || '[]'); } catch (e) { return []; }
  }
  function saveCart(c) { setLocal(LOCAL_CART, c); }

  function addToCart(product, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    var found = cart.find(function (x) { return x.productId === product.productId; });
    if (found) found.qty += qty;
    else {
      cart.push({
        productId: product.productId,
        storeId: product.storeId,
        storeName: product.storeName,
        title: product.title,
        price: product.price,
        img: product.img || '',
        qty: qty
      });
    }
    saveCart(cart);
    return cart;
  }

  function cartCount() {
    return getCart().reduce(function (s, x) { return s + (x.qty || 0); }, 0);
  }

  function cartTotal() {
    return getCart().reduce(function (s, x) { return s + (x.price || 0) * (x.qty || 0); }, 0);
  }

  function removeFromCart(productId) {
    var cart = getCart().filter(function (x) { return x.productId !== productId; });
    saveCart(cart);
    return cart;
  }

  function clearCart() { saveCart([]); }

  // ---------- seller balance (harga utuh, tanpa potongan) ----------
  function getSellerBalances() {
    try { return JSON.parse(localStorage.getItem(LOCAL_SELLER_BAL) || '{}'); } catch (e) { return {}; }
  }
  function getSellerBalance(storeId) {
    var b = getSellerBalances();
    return b[storeId] || 0;
  }
  function creditSeller(storeId, amount) {
    amount = parseInt(amount, 10) || 0;
    if (amount <= 0) return;
    var b = getSellerBalances();
    b[storeId] = (b[storeId] || 0) + amount;
    setLocal(LOCAL_SELLER_BAL, b);
    var d = db();
    if (d) {
      try {
        d.ref('seller_balance/' + storeId).transaction(function (cur) {
          return (cur || 0) + amount;
        });
      } catch (e) {}
    }
  }
  function withdrawSeller(storeId, amount) {
    amount = parseInt(amount, 10) || 0;
    var bal = getSellerBalance(storeId);
    if (amount <= 0 || amount > bal) return { ok: false, error: 'Saldo tidak cukup' };
    var b = getSellerBalances();
    b[storeId] = bal - amount;
    setLocal(LOCAL_SELLER_BAL, b);
    addModLog({ action: 'withdraw', storeId: storeId, amount: amount, by: uid() });
    var d = db();
    if (d) {
      try {
        d.ref('seller_balance/' + storeId).transaction(function (cur) {
          return Math.max(0, (cur || 0) - amount);
        });
      } catch (e) {}
    }
    return { ok: true, left: b[storeId] };
  }

  /** Checkout: bayar penuh (tanpa perak/komisi), credit seller */
  async function checkoutCart() {
    var cart = getCart();
    if (!cart.length) return { ok: false, error: 'Keranjang kosong' };
    var total = cartTotal();
    // group by store — credit full amount per store
    var byStore = {};
    cart.forEach(function (item) {
      byStore[item.storeId] = (byStore[item.storeId] || 0) + item.price * item.qty;
    });
    Object.keys(byStore).forEach(function (sid) {
      creditSeller(sid, byStore[sid]);
    });
    // bump sold
    var prods = loadLocalProducts();
    cart.forEach(function (item) {
      if (prods[item.productId]) {
        prods[item.productId].sold = (prods[item.productId].sold || 0) + item.qty;
      }
    });
    saveLocalProducts(prods);
    clearCart();
    return { ok: true, total: total, byStore: byStore };
  }

  function stars(n) {
    n = Math.round(n || 0);
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s;
  }

  function formatRp(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  window.NailongToko = {
    createStore: createStore,
    getMyStore: getMyStore,
    getStore: getStore,
    getAllStores: getAllStores,
    updateStore: updateStore,
    addProduct: addProduct,
    getProduct: getProduct,
    getProductsByStore: getProductsByStore,
    getPublicProducts: getPublicProducts,
    addReview: addReview,
    getReviews: getReviews,
    storeAvgRating: storeAvgRating,
    reportStore: reportStore,
    adminSetStoreStatus: adminSetStoreStatus,
    appealStore: appealStore,
    addToCart: addToCart,
    getCart: getCart,
    removeFromCart: removeFromCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    clearCart: clearCart,
    checkoutCart: checkoutCart,
    getSellerBalance: getSellerBalance,
    withdrawSeller: withdrawSeller,
    creditSeller: creditSeller,
    stars: stars,
    formatRp: formatRp,
    genStoreId: genStoreId
  };
})();


  // ---------- store WA + product chat ----------
  var LOCAL_CHAT = 'nailong_product_chats';
  function loadChats() {
    try { return JSON.parse(localStorage.getItem(LOCAL_CHAT) || '{}'); } catch (e) { return {}; }
  }
  function saveChats(m) { setLocal(LOCAL_CHAT, m); }

  function chatKey(productId, buyerUid) {
    return String(productId) + '__' + String(buyerUid || 'guest');
  }

  async function sendProductChat(productId, storeId, text, fromRole) {
    var id = uid();
    if (!id) return { ok: false, error: 'Login dulu untuk chat' };
    text = String(text || '').trim();
    if (!text) return { ok: false, error: 'Pesan kosong' };
    var key = chatKey(productId, fromRole === 'seller' ? arguments[4] : id);
    // for buyer: key = product__buyerUid; seller needs buyerUid param
    if (fromRole === 'seller' && arguments[4]) key = chatKey(productId, arguments[4]);
    var all = loadChats();
    if (!all[key]) all[key] = [];
    all[key].push({
      at: Date.now(),
      text: text.slice(0, 500),
      from: fromRole || 'buyer',
      uid: id,
      name: userName(),
      storeId: storeId,
      productId: productId
    });
    saveChats(all);
    var d = db();
    if (d) {
      try {
        await d.ref('product_chats/' + key.replace(/[.#$/\[\]]/g, '_')).push(all[key][all[key].length - 1]);
      } catch (e) {}
    }
    return { ok: true };
  }

  function getProductChats(productId, buyerUid) {
    var key = chatKey(productId, buyerUid || uid());
    var all = loadChats();
    return all[key] || [];
  }

  function getAllChatsForStore(storeId) {
    var all = loadChats();
    var out = [];
    Object.keys(all).forEach(function (k) {
      (all[k] || []).forEach(function (m) {
        if (m.storeId === storeId) out.push(Object.assign({ thread: k }, m));
      });
    });
    return out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }

  window.NailongToko.sendProductChat = sendProductChat;
  window.NailongToko.getProductChats = getProductChats;
  window.NailongToko.getAllChatsForStore = getAllChatsForStore;
  window.NailongToko.chatKey = chatKey;
