/**
 * Multi-user chat: users chat, admin reads each conversation
 */
(function () {
  var CHATS_KEY = 'nailong_chats';

  function getUid() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
        return firebase.auth().currentUser.uid;
    } catch (e) {}
    var g = localStorage.getItem('nailong_guest_id');
    if (!g) {
      g = 'g_' + Math.random().toString(36).slice(2);
      localStorage.setItem('nailong_guest_id', g);
    }
    return g;
  }

  function getUserMeta() {
    try {
      var u = firebase.auth().currentUser;
      if (u) return { uid: u.uid, name: u.displayName || u.email || 'User', photo: u.photoURL || '' };
    } catch (e) {}
    return { uid: getUid(), name: 'Pengunjung', photo: '' };
  }

  function loadAll() {
    try {
      var o = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
      return o && typeof o === 'object' ? o : {};
    } catch (e) { return {}; }
  }

  function saveAll(data) {
    try { localStorage.setItem(CHATS_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function getThread(uid) {
    var all = loadAll();
    if (!all[uid]) {
      all[uid] = {
        uid: uid,
        name: 'User',
        photo: '',
        messages: [],
        updatedAt: Date.now(),
        unreadAdmin: 0
      };
    }
    return all[uid];
  }

  function sendFromUser(text, imgDataUrl) {
    var meta = getUserMeta();
    var all = loadAll();
    var t = all[meta.uid] || {
      uid: meta.uid,
      name: meta.name,
      photo: meta.photo,
      messages: [],
      updatedAt: 0,
      unreadAdmin: 0
    };
    t.name = meta.name;
    t.photo = meta.photo;
    t.messages.push({
      from: 'user',
      text: text || '',
      img: imgDataUrl || null,
      ts: Date.now()
    });
    t.updatedAt = Date.now();
    t.unreadAdmin = (t.unreadAdmin || 0) + 1;
    all[meta.uid] = t;
    saveAll(all);
    return t;
  }

  function sendFromAdmin(targetUid, text, imgDataUrl) {
    var all = loadAll();
    var t = all[targetUid];
    if (!t) return null;
    t.messages.push({
      from: 'admin',
      text: text || '',
      img: imgDataUrl || null,
      ts: Date.now()
    });
    t.updatedAt = Date.now();
    t.unreadAdmin = 0;
    all[targetUid] = t;
    saveAll(all);
    return t;
  }

  function listThreads() {
    var all = loadAll();
    return Object.keys(all).map(function (k) { return all[k]; })
      .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }

  function markRead(uid) {
    var all = loadAll();
    if (all[uid]) {
      all[uid].unreadAdmin = 0;
      saveAll(all);
    }
  }

  window.NailongChat = {
    sendFromUser: sendFromUser,
    sendFromAdmin: sendFromAdmin,
    listThreads: listThreads,
    getThread: function (uid) { return loadAll()[uid] || null; },
    markRead: markRead,
    getUid: getUid
  };
})();
