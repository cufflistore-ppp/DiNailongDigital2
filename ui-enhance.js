/**
 * Nailong Digital - Video BG, FAB Chat, Halo, Login splash
 */
(function () {
  // --- Video background ---
  function injectVideoBg() {
    if (document.querySelector('.video-bg')) return;
    var wrap = document.createElement('div');
    wrap.className = 'video-bg';
    wrap.innerHTML = '<video autoplay muted loop playsinline poster="nailong-digital-logo.jpg"><source src="bg-nailong.mp4" type="video/mp4"></video>';
    var overlay = document.createElement('div');
    overlay.className = 'video-bg-overlay';
    document.body.insertBefore(wrap, document.body.firstChild);
    document.body.insertBefore(overlay, wrap.nextSibling);
  }

  // --- FAB Chat Admin ---
  function injectFabChat() {
    if (document.getElementById('fabChat')) return;
    var fab = document.createElement('button');
    fab.id = 'fabChat';
    fab.className = 'fab-chat';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Chat Admin');
    fab.innerHTML = '<img src="chat-admin-btn.png" alt="Chat Admin">';
    document.body.appendChild(fab);

    var overlay = document.createElement('div');
    overlay.id = 'chatSheetOverlay';
    overlay.className = 'chat-sheet-overlay';
    overlay.innerHTML =
      '<div class="chat-sheet">' +
      '<div class="chat-sheet-handle"></div>' +
      '<button type="button" class="chat-sheet-btn" id="btnMasukGrup"><i class="fa-solid fa-users"></i><span>Masuk Grup</span></button>' +
      '<button type="button" class="chat-sheet-btn" id="btnLaporanAdmin"><i class="fa-solid fa-flag"></i><span>Laporan Admin</span></button>' +
      '<button type="button" class="chat-sheet-btn" id="btnChatAdmin"><i class="fa-solid fa-comments"></i><span>Chat Admin</span></button>' +
      '<button type="button" class="chat-sheet-btn cancel" id="btnSheetCancel">Batal</button>' +
      '</div>';
    document.body.appendChild(overlay);

    // Chat modal WA style
    var chat = document.createElement('div');
    chat.id = 'chatModal';
    chat.className = 'chat-modal';
    chat.innerHTML =
      '<div class="chat-header">' +
      '<button type="button" class="back-chat" id="btnCloseChat"><i class="fa-solid fa-arrow-left"></i></button>' +
      '<div class="chat-header-avatar"><i class="fa-solid fa-headset"></i></div>' +
      '<div class="chat-header-info"><h4>Admin Nailong</h4><span>Online</span></div>' +
      '</div>' +
      '<div class="chat-body" id="chatBody">' +
      '<div class="chat-bubble them">Halo! Ada yang bisa dibantu? 😊<div class="time">sekarang</div></div>' +
      '</div>' +
      '<div class="chat-input-bar">' +
      '<button type="button" class="chat-attach" id="btnAttach"><i class="fa-solid fa-paperclip"></i></button>' +
      '<input type="file" id="chatFile" accept="image/*" style="display:none">' +
      '<input type="text" id="chatInput" placeholder="Ketik pesan...">' +
      '<button type="button" id="btnSendChat"><i class="fa-solid fa-paper-plane"></i></button>' +
      '</div>';
    document.body.appendChild(chat);

    fab.addEventListener('click', function () {
      overlay.classList.add('show');
    });
    document.getElementById('btnSheetCancel').addEventListener('click', function () {
      overlay.classList.remove('show');
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });
    document.getElementById('btnMasukGrup').addEventListener('click', function () {
      overlay.classList.remove('show');
      location.href = 'grup.html';
    });
    document.getElementById('btnLaporanAdmin').addEventListener('click', function () {
      overlay.classList.remove('show');
      location.href = 'laporan.html';
    });
    document.getElementById('btnChatAdmin').addEventListener('click', function () {
      overlay.classList.remove('show');
      chat.classList.add('show');
      // load history
      if (window.NailongChat) {
        var body = document.getElementById('chatBody');
        var th = NailongChat.getThread(NailongChat.getUid());
        if (th && th.messages && th.messages.length) {
          body.innerHTML = '';
          th.messages.forEach(function(m) {
            appendBubble(m.text || '', m.from === 'user', m.img || null);
          });
        }
      }
    });
    document.getElementById('btnCloseChat').addEventListener('click', function () {
      chat.classList.remove('show');
    });

    function appendBubble(text, me, imgSrc) {
      var body = document.getElementById('chatBody');
      var div = document.createElement('div');
      div.className = 'chat-bubble ' + (me ? 'me' : 'them');
      var now = new Date();
      var t = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      var html = '';
      if (imgSrc) html += '<img src="' + imgSrc + '" alt="foto">';
      if (text) html += text;
      html += '<div class="time">' + t + '</div>';
      div.innerHTML = html;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    document.getElementById('btnSendChat').addEventListener('click', sendMsg);
    document.getElementById('chatInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMsg();
    });
    function sendMsg() {
      var inp = document.getElementById('chatInput');
      var txt = (inp.value || '').trim();
      if (!txt) return;
      appendBubble(txt, true);
      inp.value = '';
      if (window.NailongChat) {
        NailongChat.sendFromUser(txt, null);
      }
      setTimeout(function () {
        appendBubble('Pesan masuk ke inbox admin. Admin akan membalas dari panel.', false);
      }, 600);
    }
    document.getElementById('btnAttach').addEventListener('click', function () {
      document.getElementById('chatFile').click();
    });
    document.getElementById('chatFile').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        appendBubble('', true, e.target.result);
        if (window.NailongChat) NailongChat.sendFromUser('[Foto]', e.target.result);
        setTimeout(function () {
          appendBubble('Foto diterima di inbox admin.', false);
        }, 600);
      };
      reader.readAsDataURL(f);
      this.value = '';
    });
  }

  // --- Halo banner ---
  function injectHalo() {
    if (document.getElementById('haloBanner')) return;
    var el = document.createElement('div');
    el.id = 'haloBanner';
    el.className = 'halo-banner';
    el.innerHTML = '<img class="halo-avatar" id="haloAvatar" src="" alt=""><span id="haloText">HALO</span>';
    var header = document.querySelector('.header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(el, header.nextSibling);
    } else {
      document.body.insertBefore(el, document.body.firstChild);
    }
  }

  function updateHalo(user) {
    var banner = document.getElementById('haloBanner');
    if (!banner) return;
    if (user) {
      var name = user.displayName || user.email || 'User';
      var first = name.split(' ')[0];
      document.getElementById('haloText').textContent = 'HALO, ' + first.toUpperCase() + '!';
      var av = document.getElementById('haloAvatar');
      if (user.photoURL) {
        av.src = user.photoURL;
        av.style.display = 'block';
      } else {
        av.style.display = 'none';
      }
      banner.classList.add('show');
    } else {
      banner.classList.remove('show');
    }
  }

  // --- Login splash (on akun / first visit) ---
  function maybeSplash() {
    var path = (location.pathname || '').toLowerCase();
    var isAkun = path.indexOf('akun') >= 0;
    var seen = sessionStorage.getItem('nailong_splash_done');
    if (!isAkun && seen) return;
    if (!isAkun) {
      // light splash only on first page of session
      if (seen) return;
    }

    var splash = document.createElement('div');
    splash.className = 'login-splash';
    splash.id = 'loginSplash';
    splash.innerHTML =
      '<img src="nailong-digital-logo.jpg" alt="Nailong Digital" class="login-splash-logo">' +
      '<div class="tiktok-loader"><span></span><span></span><span></span></div>' +
      '<div class="login-splash-text">Memuat Nailong Digital…</div>';
    document.body.appendChild(splash);

    setTimeout(function () {
      splash.classList.add('hide');
      sessionStorage.setItem('nailong_splash_done', '1');
      setTimeout(function () { splash.remove(); }, 600);
    }, isAkun ? 2200 : 1400);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectVideoBg();
    injectFabChat();
    injectHalo();
    maybeSplash();

    // Hook auth for halo
    function tryAuth() {
      try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          firebase.auth().onAuthStateChanged(function (u) {
            updateHalo(u);
          });
        }
      } catch (e) {}
    }
    tryAuth();
    setTimeout(tryAuth, 1500);
  });
})();
