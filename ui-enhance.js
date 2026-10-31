
  
  
  function injectFlutterLogo() {
    return; // dimatikan — user minta video saja, tanpa animasi logo
    if (sessionStorage.getItem('nd_flutter_logo') === '1') return;
    if (sessionStorage.getItem('nd_enter_anim') === '1') { /* allow once per session together */ }
    try { sessionStorage.setItem('nd_flutter_logo', '1'); } catch (e) {}
    var ov = document.createElement('div');
    ov.id = 'ndFlutterLogo';
    ov.innerHTML = '<div class="nd-flut-inner"><img src="nailong-digital-logo.png" alt="ND"><b>NAILONG DIGITAL</b></div>';
    document.body.appendChild(ov);
    if (!document.getElementById('ndFlutterStyle')) {
      var st = document.createElement('style');
      st.id = 'ndFlutterStyle';
      st.textContent =
        '#ndFlutterLogo{position:fixed;inset:0;z-index:10040;display:flex;align-items:center;justify-content:center;' +
        'background:#0a0e18;transition:opacity .55s ease, transform .55s cubic-bezier(.22,1,.36,1);}' +
        '#ndFlutterLogo .nd-flut-inner{text-align:center;animation:ndFlutIn .7s cubic-bezier(.22,1.2,.36,1) both;}' +
        '#ndFlutterLogo img{width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 8px 24px rgba(255,193,7,.35));}' +
        '#ndFlutterLogo b{display:block;margin-top:14px;color:#FFC107;letter-spacing:2px;font-size:14px;font-weight:800;}' +
        '@keyframes ndFlutIn{from{opacity:0;transform:scale(.72) translateY(18px)}to{opacity:1;transform:none}}' +
        '#ndFlutterLogo.out{opacity:0;transform:scale(1.06)}';
      document.head.appendChild(st);
    }
    setTimeout(function () {
      ov.classList.add('out');
      setTimeout(function () { ov.remove(); }, 560);
    }, 1100);
  }

  
  function ensureLocale(){
    if (window.NDLocale) return;
    if (document.querySelector('script[data-nd-locale]')) return;
    var s=document.createElement('script'); s.src='locale.js'; s.setAttribute('data-nd-locale','1');
    document.head.appendChild(s);
  }
  function ensureUploadUi() {
    if (window.NailongUploadUI) { try { NailongUploadUI.scan(); } catch(e){} return; }
    if (document.querySelector('script[data-nd-upload]')) return;
    var s = document.createElement('script');
    s.src = 'upload-ui.js'; s.setAttribute('data-nd-upload','1');
    s.onload = function(){ try { NailongUploadUI.scan(); } catch(e){} };
    document.head.appendChild(s);
  }

  
  function ensureIntro() {
    try {
      if (sessionStorage.getItem('nd_intro_seen') === '1') return;
      // video full screen only — no logo animation
      var v = document.createElement('div');
      v.id = 'ndIntro';
      v.style.cssText = 'position:fixed;inset:0;z-index:10050;background:#000;display:flex;align-items:center;justify-content:center;';
      v.innerHTML = '<video id="ndIntroVid" src="intro-nd.mp4" autoplay muted playsinline preload="auto" style="width:100%;height:100%;object-fit:contain;background:#000"></video>';
      document.body.appendChild(v);
      var vid = v.querySelector('video');
      var finished = false;
      function done() {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem('nd_intro_seen','1'); } catch(e){}
        try { v.remove(); } catch(e){}
        try {
          var logged = localStorage.getItem('nailong_logged_in') === '1';
          var onLogin = /login\.html/i.test(location.href);
          if (!logged && !onLogin) location.replace('login.html');
        } catch(e2){}
      }
      vid.onended = done;
      vid.onerror = done;
      // safety only if video metadata fails to load after long wait (not to cut early)
      vid.addEventListener('loadedmetadata', function () {
        var dur = (vid.duration || 0) * 1000;
        if (dur > 0 && isFinite(dur)) {
          setTimeout(done, dur + 800);
        }
      });
      // absolute fallback 30s if browser blocks video
      setTimeout(function () { if (!finished) done(); }, 30000);
    } catch (e) {}
  }

  function ensureTheme() {
    if (window.NailongTheme) { try { NailongTheme.apply(NailongTheme.load()); } catch(e){} return; }
    if (document.querySelector('script[data-nd-theme]')) return;
    var s = document.createElement('script');
    s.src = 'theme.js'; s.setAttribute('data-nd-theme','1');
    s.onload = function(){ try { NailongTheme.apply(NailongTheme.load()); } catch(e){} };
    document.head.appendChild(s);
  }

  function ensureMusicPlayer() {
    if (window.NailongMusic) {
      try { NailongMusic.injectMini(); } catch (e) {}
      return;
    }
    if (document.querySelector('script[data-nd-music]')) return;
    var s = document.createElement('script');
    s.src = 'music-player.js';
    s.setAttribute('data-nd-music', '1');
    s.onload = function () { try { NailongMusic.injectMini(); } catch (e) {} };
    document.head.appendChild(s);
  }

/**
 * Nailong Digital - Video BG, FAB Chat, Halo, Login splash
 */
(function () {
  // --- Video background ---
  function injectVideoBg() {
    if (document.getElementById('bgVideoWrap')) return;
    var wrap = document.createElement('div');
    wrap.id = 'bgVideoWrap';
    wrap.className = 'bg-video-wrap';
    wrap.innerHTML =
      '<video id="bgVideo" autoplay muted loop playsinline webkit-playsinline poster="banner.jpg">' +
        '<source src="bg-nailong.mp4" type="video/mp4">' +
      '</video>' +
      '<div class="bg-video-overlay"></div>';
    document.body.insertBefore(wrap, document.body.firstChild);
    document.body.classList.add('has-video-bg');
    document.documentElement.style.background = '#0a0e18';
    document.body.style.background = 'transparent';
    // paksa semua section/page tidak putih
    try {
      document.querySelectorAll('.page-content, .api-form-card, main, section').forEach(function(el){
        var bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgb(255, 255, 255)' || bg === '#fff' || bg === 'white') {
          el.style.background = 'rgba(16,24,42,0.55)';
        }
      });
    } catch(e) {}
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
  function maybeSplash() { /* disabled */ }

  

  
  function injectPageLoader() {
    if (document.getElementById('pageNavLoader')) return;
    var el = document.createElement('div');
    el.id = 'pageNavLoader';
    el.className = 'page-nav-loader';
    el.innerHTML = '<div class="nd-loading"><span></span><span></span></div>';
    document.body.appendChild(el);

    function showLoader() {
      el.classList.add('show');
    }
    // Semua link internal → loading dulu
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (/^https?:\/\//i.test(href) && href.indexOf(location.host) < 0) return;
      // internal navigation
      showLoader();
    }, true);
    // form submit internal
    document.addEventListener('submit', function () { showLoader(); }, true);
    // pageshow dari bfcache → hide
    window.addEventListener('pageshow', function () { el.classList.remove('show'); });
    // safety hide after 4s
    setInterval(function () {
      if (document.readyState === 'complete') el.classList.remove('show');
    }, 400);
  }

  
  function injectIntroSplash() {
    return; // diganti ensureIntro video penuh
    try {
      if (sessionStorage.getItem('nd_intro_done') === '1') return;
    } catch (e) {}
    var el = document.createElement('div');
    el.id = 'ndIntro';
    el.className = 'nd-intro';
    el.innerHTML =
      '<div class="nd-intro-inner">' +
        '<img src="logo-nd-gold.jpg" alt="Nailong Digital" class="nd-intro-logo" onerror="this.src=\'nailong-digital-logo.png\'">' +
        '<div class="nd-intro-title">NAILONG DIGITAL</div>' +
        '<div class="nd-loading nd-intro-dots"><span></span><span></span></div>' +
      '</div>';
    document.body.appendChild(el);
    setTimeout(function () {
      el.classList.add('hide');
      try { sessionStorage.setItem('nd_intro_done', '1'); } catch (e) {}
      setTimeout(function () { el.remove(); }, 500);
    }, 1600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectIntroSplash();
    injectVideoBg();
    try { ensureTheme(); try{ensureUploadUi();}catch(e){} try{ensureLocale();}catch(e){} try{ensureIntro();}catch(e){} try{injectFlutterLogo();}catch(e){} ensureMusicPlayer(); } catch(e) {}
    injectFabChat();
    injectHalo();
    /* nailong run dihapus */
    injectPageLoader();
    /* splash dihapus — login langsung di akun */

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
