/**
 * Auth guard — login sekali, tidak spam redirect.
 * Halaman bebas (game, music, baca, tema, login, register): tidak paksa login.
 * Halaman order (joki, topup, dll): wajib login, tapi hormati session yang sudah ada.
 */
(function () {
  var FREE = [
    'login.html', 'register.html', 'game.html', 'play.html', 'music.html',
    'baca.html', 'tema.html', 'index.html', 'channel.html', 'donasi.html',
    'leaderboard.html', 'tools.html'
  ];
  var path = (location.pathname || '').split('/').pop() || 'index.html';
  path = path.toLowerCase();

  function isFree() {
    if (!path || path === '' || path === '/') return true;
    for (var i = 0; i < FREE.length; i++) {
      if (path === FREE[i] || path.endsWith('/' + FREE[i])) return true;
    }
    // root domain
    if (path.indexOf('.') < 0) return true;
    return false;
  }

  function loggedFlag() {
    try { return localStorage.getItem('nailong_logged_in') === '1'; } catch (e) { return false; }
  }

  function currentUser() {
    try {
      if (window.VoxyyAuth && VoxyyAuth.getCurrentUser) {
        var u = VoxyyAuth.getCurrentUser();
        if (u) return u;
      }
      if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().currentUser || null;
      }
    } catch (e) {}
    return null;
  }

  function markLogged() {
    try {
      localStorage.setItem('nailong_logged_in', '1');
      sessionStorage.removeItem('nailong_login_gate');
    } catch (e) {}
  }

  // Selalu pantau auth → set flag, jangan paksa logout visual
  function bindAuthWatcher() {
    function onUser(user) {
      if (user) markLogged();
    }
    if (window.VoxyyAuth && VoxyyAuth.onAuthChange) {
      VoxyyAuth.onAuthChange(onUser);
      return true;
    }
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(onUser);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Halaman bebas: tidak pernah redirect login
  if (isFree()) {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (bindAuthWatcher() || tries > 20) clearInterval(t);
    }, 250);
    // restore flag jika firebase masih punya user
    setTimeout(function () {
      if (currentUser()) markLogged();
    }, 800);
    return;
  }

  // Halaman terproteksi
  if (loggedFlag() || currentUser()) {
    markLogged();
    bindAuthWatcher();
    return;
  }

  // Tunggu restore Firebase (jangan langsung tendang)
  var waited = 0;
  var iv = setInterval(function () {
    waited += 300;
    bindAuthWatcher();
    if (currentUser() || loggedFlag()) {
      markLogged();
      clearInterval(iv);
      return;
    }
    if (waited >= 5000) {
      clearInterval(iv);
      // masih belum — baru arahkan login sekali
      try {
        if (sessionStorage.getItem('nailong_login_gate') === '1') return;
        sessionStorage.setItem('nailong_login_gate', '1');
        sessionStorage.setItem('nailong_return_after_login', location.href);
      } catch (e) {}
      location.href = 'login.html';
    }
  }, 300);
})();
