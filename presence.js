/**
 * Online presence + Group members (localStorage + optional Firebase)
 */
(function () {
  var MEMBERS_KEY = 'nailong_group_members';
  var ONLINE_KEY = 'nailong_online_ping';
  var HEARTBEAT_MS = 20000;
  var ONLINE_TTL = 45000; // consider online if ping < 45s

  function uid() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
        return firebase.auth().currentUser.uid;
    } catch (e) {}
    var g = localStorage.getItem('nailong_guest_id');
    if (!g) {
      g = 'g_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('nailong_guest_id', g);
    }
    return g;
  }

  function getUserInfo() {
    try {
      var u = firebase.auth().currentUser;
      if (u) return { id: u.uid, name: u.displayName || u.email || 'User', photo: u.photoURL || '', email: u.email || '' };
    } catch (e) {}
    return { id: uid(), name: 'Pengunjung', photo: '', email: '' };
  }

  function getMembers() {
    try {
      var arr = JSON.parse(localStorage.getItem(MEMBERS_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveMembers(arr) {
    try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(arr || [])); } catch (e) {}
  }

  function getOnlineMap() {
    try {
      return JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function pingOnline() {
    var info = getUserInfo();
    var map = getOnlineMap();
    map[info.id] = { name: info.name, photo: info.photo, ts: Date.now() };
    // cleanup stale
    var now = Date.now();
    Object.keys(map).forEach(function (k) {
      if (now - (map[k].ts || 0) > ONLINE_TTL * 3) delete map[k];
    });
    try { localStorage.setItem(ONLINE_KEY, JSON.stringify(map)); } catch (e) {}

    // Firebase presence if available
    try {
      if (window.VoxyyOrders && VoxyyOrders.isGlobalConfigured && VoxyyOrders.isGlobalConfigured()) {
        var db = firebase.database();
        var ref = db.ref('presence/' + info.id);
        ref.set({ name: info.name, photo: info.photo, ts: firebase.database.ServerValue.TIMESTAMP });
        ref.onDisconnect().remove();
      }
    } catch (e) {}
  }

  function countOnline() {
    var map = getOnlineMap();
    var now = Date.now();
    var n = 0;
    Object.keys(map).forEach(function (k) {
      if (now - (map[k].ts || 0) < ONLINE_TTL) n++;
    });
    return Math.max(n, 1); // at least self
  }

  function listOnline() {
    var map = getOnlineMap();
    var now = Date.now();
    var list = [];
    Object.keys(map).forEach(function (k) {
      if (now - (map[k].ts || 0) < ONLINE_TTL) {
        list.push({ id: k, name: map[k].name, photo: map[k].photo, online: true });
      }
    });
    return list;
  }

  function joinGroup(user) {
    return new Promise(function (resolve) {
      var members = getMembers();
      var id = user.uid || uid();
      var exists = members.some(function (m) { return m.id === id; });
      if (exists) { resolve(false); return; }
      members.push({
        id: id,
        name: user.displayName || user.email || 'Member',
        photo: user.photoURL || '',
        joinedAt: Date.now()
      });
      saveMembers(members);
      try {
        if (typeof firebase !== 'undefined' && firebase.database) {
          firebase.database().ref('group/members/' + id).set({
            name: user.displayName || user.email || 'Member',
            photo: user.photoURL || '',
            joinedAt: firebase.database.ServerValue.TIMESTAMP
          });
        }
      } catch (e) {}
      resolve(true);
    });
  }

  function refreshMembers() {
    var members = getMembers();
    var onlineIds = {};
    listOnline().forEach(function (o) { onlineIds[o.id] = true; });

    var cntM = document.getElementById('cntMember');
    var cntO = document.getElementById('cntOnline');
    var onlineText = document.getElementById('onlineText');
    if (cntM) cntM.textContent = members.length;
    if (cntO) cntO.textContent = countOnline();
    if (onlineText) onlineText.textContent = countOnline() + ' online di website';

    var list = document.getElementById('memberList');
    if (!list) return;
    if (!members.length) {
      list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users"></i><p>Belum ada member. Jadi yang pertama!</p></div>';
      return;
    }
    list.innerHTML = members.slice().reverse().map(function (m) {
      var on = onlineIds[m.id];
      var av = m.photo
        ? '<img src="' + m.photo + '" alt="">'
        : (m.name || '?').charAt(0).toUpperCase();
      return '<div class="member-row">' +
        '<div class="member-av">' + av + '</div>' +
        '<div class="member-name">' + (m.name || 'Member') + '</div>' +
        '<div class="member-status ' + (on ? '' : 'off') + '">' + (on ? '● Online' : 'Offline') + '</div>' +
      '</div>';
    }).join('');
  }

  // Global online badge inject (optional small indicator)
  function updateGlobalOnline() {
    var el = document.getElementById('globalOnlineCount');
    if (el) el.textContent = countOnline();
  }

  window.NailongPresence = {
    joinGroup: joinGroup,
    refreshMembers: refreshMembers,
    countOnline: countOnline,
    listOnline: listOnline,
    ping: pingOnline
  };

  document.addEventListener('DOMContentLoaded', function () {
    pingOnline();
    setInterval(pingOnline, HEARTBEAT_MS);
    refreshMembers();
    updateGlobalOnline();
    setInterval(function () {
      refreshMembers();
      updateGlobalOnline();
    }, 10000);
  });
})();
