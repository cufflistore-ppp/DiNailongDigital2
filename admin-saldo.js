/**
 * Admin: kelola saldo user lain
 */
(function () {
  var KEY = 'nailong_balance';
  var TX_KEY = 'nailong_balance_tx';

  function allBalances() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveBalances(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj || {})); } catch (e) {}
  }
  function addTx(uid, amount, desc) {
    try {
      var list = JSON.parse(localStorage.getItem(TX_KEY) || '[]');
      list.push({
        uid: uid,
        amount: amount,
        desc: desc || 'Admin adjust',
        time: new Date().toLocaleString('id-ID'),
        ts: Date.now(),
        byAdmin: true
      });
      localStorage.setItem(TX_KEY, JSON.stringify(list.slice(-300)));
    } catch (e) {}
  }

  function setUserBalance(uid, value, reason) {
    uid = String(uid || '').trim();
    if (!uid) return false;
    var all = allBalances();
    var old = parseInt(all[uid] || 0, 10) || 0;
    var neu = Math.max(0, parseInt(value, 10) || 0);
    all[uid] = neu;
    saveBalances(all);
    addTx(uid, neu - old, reason || ('Admin set saldo → Rp ' + neu));
    return true;
  }

  function addUserBalance(uid, delta, reason) {
    uid = String(uid || '').trim();
    var all = allBalances();
    var old = parseInt(all[uid] || 0, 10) || 0;
    var neu = Math.max(0, old + (parseInt(delta, 10) || 0));
    all[uid] = neu;
    saveBalances(all);
    addTx(uid, parseInt(delta, 10) || 0, reason || 'Admin top up/koreksi');
    return neu;
  }

  function listUsers() {
    var all = allBalances();
    // also from group members / chats
    var extra = {};
    try {
      var members = JSON.parse(localStorage.getItem('nailong_group_members') || '[]');
      members.forEach(function (m) { if (m.id) extra[m.id] = m.name || m.id; });
    } catch (e) {}
    try {
      var chats = JSON.parse(localStorage.getItem('nailong_chats') || '{}');
      Object.keys(chats).forEach(function (k) {
        extra[k] = (chats[k] && chats[k].name) || k;
      });
    } catch (e) {}
    var rows = [];
    var seen = {};
    Object.keys(all).forEach(function (uid) {
      seen[uid] = true;
      rows.push({ uid: uid, name: extra[uid] || uid, balance: parseInt(all[uid] || 0, 10) || 0 });
    });
    Object.keys(extra).forEach(function (uid) {
      if (!seen[uid]) rows.push({ uid: uid, name: extra[uid], balance: 0 });
    });
    rows.sort(function (a, b) { return b.balance - a.balance; });
    return rows;
  }

  window.NailongAdminSaldo = {
    list: listUsers,
    set: setUserBalance,
    add: addUserBalance,
    getAll: allBalances
  };
})();
