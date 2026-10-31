/**
 * Header: hamburger KIRI (menu pilihan fitur) + lonceng KANAN
 * Isi drawer = katalog layanan, BUKAN halaman akun.
 */
(function () {
  function closeDrawer() {
    var d = document.getElementById('sideDrawer');
    var o = document.getElementById('sideOverlay');
    if (d) d.classList.remove('open');
    if (o) o.classList.remove('show');
  }

  function ensureHeader() {
    var header = document.querySelector('header.header');
    if (!header) return;
    if (header.querySelector('.btn-hamburger-left')) return;
    var isAdminPage = /admin\.html/i.test(location.pathname || '') || /admin\.html/i.test(location.href || '');

    var left = document.createElement('button');
    left.type = 'button';
    left.className = 'btn-hamburger-left';
    left.setAttribute('aria-label', 'Menu');
    left.innerHTML = '<span></span><span></span><span></span>';
    left.onclick = function () {
      var d = document.getElementById('sideDrawer');
      var o = document.getElementById('sideOverlay');
      if (d) d.classList.add('open');
      if (o) o.classList.add('show');
    };

    var right = document.createElement('button');
    right.type = 'button';
    right.className = 'btn-bell';
    right.setAttribute('aria-label', 'Notifikasi');
    right.innerHTML = '<i class="fa-solid fa-bell"></i><span class="bell-dot" id="bellDot" style="display:none;"></span><span class="bell-count" id="bellCount" style="display:none;">0</span>';
    right.onclick = function () { openNotifSheet(); };

    header.classList.add('header-with-tools');
    header.insertBefore(left, header.firstChild);
    header.appendChild(right);

    if (!document.getElementById('sideDrawer')) {
      var overlay = document.createElement('div');
      overlay.id = 'sideOverlay';
      overlay.className = 'side-overlay';
      overlay.onclick = closeDrawer;

      var drawer = document.createElement('div');
      drawer.id = 'sideDrawer';
      drawer.className = 'side-drawer';
      drawer.innerHTML =
        '<div class="side-drawer-head">' +
          '<div><div class="side-title">Menu Nailong</div><div class="side-sub">Semua halaman & layanan</div></div>' +
          '<button type="button" class="side-close" id="sideClose">&times;</button>' +
        '</div>' +

        '<div class="side-section">UTAMA</div>' +
        '<a href="index.html"><i class="fa-solid fa-house"></i><span>Beranda</span></a>' +
        '<a href="channel.html"><i class="fa-solid fa-comments"></i><span>Channel Testimoni</span><em class="side-tag">Live</em></a>' +
        '<a href="leaderboard.html"><i class="fa-solid fa-trophy"></i><span>Leaderboard</span></a>' +
        '<a href="tools.html"><i class="fa-solid fa-screwdriver-wrench"></i><span>Tools</span></a>' +
        '<a href="baca.html"><i class="fa-solid fa-book-open"></i><span>Baca / Anime</span></a>' +
        '<a href="music.html"><i class="fa-solid fa-music"></i><span>Music</span></a>' +
        '<a href="game.html"><i class="fa-solid fa-gamepad"></i><span>Game</span></a>' +
        '<a href="youtube.html"><i class="fa-brands fa-youtube"></i><span>YouTube</span></a>' +
        '<a href="tools-canvas.html"><i class="fa-solid fa-image"></i><span>Canvas Tools</span></a>' +

        '<div class="side-section">LAYANAN BOT</div>' +
        '<a href="botwa.html"><i class="fa-brands fa-whatsapp"></i><span>Sewa Bot (JPM / Jaga)</span></a>' +
        '<a href="badak-wa.html"><i class="fa-solid fa-bolt"></i><span>Badak WA</span></a>' +
        '<a href="push-kontak.html"><i class="fa-solid fa-paper-plane"></i><span>Push Kontak Otomatis</span></a>' +
        '<a href="joki.html"><i class="fa-solid fa-shield-halved"></i><span>Joki Kontak</span></a>' +

        '<div class="side-section">TOKO</div>' +
        '<a href="buka-toko.html"><i class="fa-solid fa-store"></i><span>Buka / Kelola Toko</span></a>' +
        '<a href="keranjang.html"><i class="fa-solid fa-cart-shopping"></i><span>Keranjang</span></a>' +
        '<div class="side-section">PRODUK & JASA</div>' +
        '<a href="digital.html"><i class="fa-solid fa-box"></i><span>Produk Digital</span></a>' +
        '<a href="jasweb.html"><i class="fa-solid fa-globe"></i><span>JasWeb</span></a>' +
        '<a href="akun-jual.html"><i class="fa-solid fa-gamepad"></i><span>Akun Game</span></a>' +
        '<a href="pesan.html?type=jaspost"><i class="fa-solid fa-pen"></i><span>Jasa Post</span></a>' +

        '<div class="side-section">SALDO & BANTUAN</div>' +
        '<a href="topup.html"><i class="fa-solid fa-wallet"></i><span>Top Up / Tarik Saldo</span></a>' +
        '<a href="donasi.html"><i class="fa-solid fa-hand-holding-heart"></i><span>Donasi</span></a>' +
        '<a href="riwayat.html"><i class="fa-solid fa-clock-rotate-left"></i><span>Riwayat Order</span></a>' +
        '<a href="antrian.html"><i class="fa-solid fa-list-check"></i><span>Cek Antrian</span></a>' +
        '<a href="laporan.html"><i class="fa-solid fa-flag"></i><span>Laporan</span></a>' +
        '<a href="https://wa.me/6285124697215" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i><span>Hubungi Admin</span></a>' +

        '<div class="side-foot">Garis tiga = menu layanan, bukan halaman akun.<br>Akun ada di nav bawah.</div>';

      document.body.appendChild(overlay);
      document.body.appendChild(drawer);
      document.getElementById('sideClose').onclick = closeDrawer;
      if (isAdminPage) {
        drawer.innerHTML =
          '<div class="side-drawer-head"><div><div class="side-title">Panel Admin</div><div class="side-sub">Menu khusus admin</div></div>' +
          '<button type="button" class="side-close" id="sideClose">&times;</button></div>' +
          '<div class="side-section">MODERASI</div>' +
          '<a href="admin.html"><i class="fa-solid fa-list"></i><span>Pesanan Customer</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-comment-dots"></i><span>Teks Joki / Push</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-store"></i><span>Moderasi Toko</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-money-bill-wave"></i><span>Pengeluaran Akun</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-inbox"></i><span>Chat Inbox</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-broadcast-tower"></i><span>Nomor SW</span></a>' +
          '<div class="side-section">LAINNYA</div>' +
          '<a href="index.html"><i class="fa-solid fa-house"></i><span>Ke Website User</span></a>' +
          '<div class="side-foot">Hanya menu admin — tidak campur menu user.</div>';
        document.getElementById('sideClose').onclick = closeDrawer;
      }
    }

    updateBellBadge();

    try {
      var isAdminPage = /admin\.html/i.test(location.pathname || '') || /admin\.html/i.test(location.href || '');
      if (isAdminPage && document.getElementById('sideDrawer')) {
        document.getElementById('sideDrawer').innerHTML =
          '<div class="side-drawer-head">' +
            '<div><div class="side-title">Admin Menu</div><div class="side-sub">Khusus panel</div></div>' +
            '<button type="button" class="side-close" id="sideClose">&times;</button>' +
          '</div>' +
          '<div class="side-section">PANEL</div>' +
          '<a href="admin.html"><i class="fa-solid fa-gauge"></i><span>Dashboard Admin</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-box"></i><span>Pesanan</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-comment-dots"></i><span>Teks Joki</span></a>' +
          '<a href="admin.html"><i class="fa-solid fa-store"></i><span>Moderasi Toko</span></a>' +
          '<a href="admin-chat.html"><i class="fa-solid fa-inbox"></i><span>Chat Inbox</span></a>' +
          '<div class="side-section">LAINNYA</div>' +
          '<a href="index.html"><i class="fa-solid fa-house"></i><span>Ke Website</span></a>' +
          '<a href="riwayat.html"><i class="fa-solid fa-clock-rotate-left"></i><span>Riwayat User</span></a>' +
          '<div class="side-foot">Menu admin terpisah agar tidak berantakan.</div>';
        var sc = document.getElementById('sideClose');
        if (sc) sc.onclick = closeDrawer;
      }
    } catch (e) {}

  }

  function countNotifs() {
    var n = 0;
    try {
      var orders = JSON.parse(localStorage.getItem('voxyy_orders') || '[]');
      orders.forEach(function (o) {
        var s = String(o.status || '').toLowerCase();
        if (s && !s.includes('sukses') && !s.includes('selesai') && !s.includes('batal')) n++;
      });
    } catch (e) {}
    try {
      var chats = JSON.parse(localStorage.getItem('nailong_product_chats') || '{}');
      var lastSeen = parseInt(localStorage.getItem('nailong_chat_seen') || '0', 10);
      Object.keys(chats).forEach(function (k) {
        (chats[k] || []).forEach(function (m) {
          if ((m.at || 0) > lastSeen && m.from === 'seller') n++;
        });
      });
    } catch (e) {}
    try {
      var unread = parseInt(localStorage.getItem('nailong_unread_admin') || '0', 10);
      if (unread > 0) n += unread;
    } catch (e) {}
    return n;
  }

  function updateBellBadge() {
    var n = countNotifs();
    var dot = document.getElementById('bellDot');
    var cnt = document.getElementById('bellCount');
    if (n > 0) {
      if (dot) dot.style.display = 'block';
      if (cnt) { cnt.style.display = 'flex'; cnt.textContent = n > 9 ? '9+' : String(n); }
    } else {
      if (dot) dot.style.display = 'none';
      if (cnt) cnt.style.display = 'none';
    }
  }

  function openNotifSheet() {
    var existing = document.getElementById('notifSheet');
    if (existing) existing.remove();
    var items = [];
    try {
      var orders = JSON.parse(localStorage.getItem('voxyy_orders') || '[]');
      orders.slice(0, 8).forEach(function (o) {
        var s = String(o.status || '').toLowerCase();
        if (s.includes('sukses') || s.includes('selesai') || s.includes('batal')) return;
        items.push({
          icon: 'fa-box',
          title: o.paket || 'Order',
          sub: (o.kode || '') + ' · ' + (o.status || 'Proses'),
          href: 'riwayat.html'
        });
      });
    } catch (e) {}
    try {
      var chats = JSON.parse(localStorage.getItem('nailong_product_chats') || '{}');
      var lastSeen = parseInt(localStorage.getItem('nailong_chat_seen') || '0', 10);
      Object.keys(chats).forEach(function (k) {
        var arr = chats[k] || [];
        var last = arr[arr.length - 1];
        if (last && last.from === 'seller' && (last.at || 0) > lastSeen) {
          items.push({
            icon: 'fa-comments',
            title: 'Pesan dibalas penjual',
            sub: (last.text || '').slice(0, 40),
            href: 'riwayat.html'
          });
        }
      });
    } catch (e) {}
    if (!items.length) {
      items.push({ icon: 'fa-bell', title: 'Tidak ada notifikasi baru', sub: 'Cek riwayat pesanan', href: 'riwayat.html' });
    }
    var ov = document.createElement('div');
    ov.id = 'notifSheet';
    ov.className = 'notif-sheet-overlay show';
    ov.innerHTML =
      '<div class="notif-sheet">' +
        '<div class="notif-sheet-head"><b>Notifikasi</b><button type="button" id="notifClose">&times;</button></div>' +
        items.map(function (it) {
          return '<a class="notif-item" href="' + it.href + '"><i class="fa-solid ' + it.icon + '"></i><div><div class="ni-t">' + it.title + '</div><div class="ni-s">' + it.sub + '</div></div></a>';
        }).join('') +
        '<a href="riwayat.html" class="btn-pesan" style="display:block;text-align:center;margin-top:10px;">Semua riwayat / pesanan</a>' +
      '</div>';
    document.body.appendChild(ov);
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
    document.getElementById('notifClose').onclick = function () { ov.remove(); };
    try { localStorage.setItem('nailong_chat_seen', String(Date.now())); } catch (e) {}
    updateBellBadge();
  }

  // expose for refresh
  window.NailongUpdateBell = updateBellBadge;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureHeader);
  } else {
    ensureHeader();
  }
})();
