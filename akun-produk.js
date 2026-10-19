/**
 * Katalog Akun Jual (FF, ML, dll) + Flash Sale
 * Storage: nailong_akun_jual
 */
(function () {
  var KEY = 'nailong_akun_jual';
  var KEY_FS = 'nailong_flash_sale';

  var DEFAULT = [
    {
      id: 'ff1',
      game: 'Free Fire',
      judul: 'Akun FF Sultan Rank Heroic',
      deskripsi: 'Skin lengkap, level tinggi, login Google aman.',
      harga: 85000,
      hargaAsli: 120000,
      stok: 3,
      status: 'TERSEDIA',
      img: 'nailong-digital-logo.jpg',
      badge: 'FF'
    },
    {
      id: 'ff2',
      game: 'Free Fire',
      judul: 'Akun FF Murah Bundle',
      deskripsi: 'Cocok pemula, sudah ada beberapa skin.',
      harga: 25000,
      hargaAsli: 35000,
      stok: 5,
      status: 'TERSEDIA',
      img: 'nailong-digital-logo.jpg',
      badge: 'FF'
    },
    {
      id: 'ml1',
      game: 'Mobile Legends',
      judul: 'Akun ML Mythic',
      deskripsi: 'Hero lengkap, skin epic+',
      harga: 150000,
      hargaAsli: 200000,
      stok: 2,
      status: 'TERSEDIA',
      img: 'nailong-digital-logo.jpg',
      badge: 'ML'
    },
    {
      id: 'pubg1',
      game: 'PUBG Mobile',
      judul: 'Akun PUBG Conqueror',
      deskripsi: 'Outfit rare, level tinggi.',
      harga: 200000,
      hargaAsli: 280000,
      stok: 1,
      status: 'TERSEDIA',
      img: 'nailong-digital-logo.jpg',
      badge: 'PUBG'
    }
  ];

  function load() {
    try {
      var s = localStorage.getItem(KEY);
      if (s) {
        var arr = JSON.parse(s);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) {}
    return DEFAULT.map(function (x) { return Object.assign({}, x); });
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list || [])); } catch (e) {}
  }

  /** Hari libur nasional & agama (tanggal tetap Gregorian) MM-DD */
  var HARI_OTOMATIS = {
    '01-01': 'Tahun Baru Masehi',
    '02-14': 'Valentine Promo',
    '03-22': 'Hari Air Sedunia',
    '04-21': 'Hari Kartini',
    '05-01': 'Hari Buruh',
    '05-02': 'Hari Pendidikan Nasional',
    '06-01': 'Hari Lahir Pancasila',
    '08-17': 'Hari Kemerdekaan RI',
    '10-01': 'Hari Kesaktian Pancasila',
    '10-28': 'Sumpah Pemuda',
    '11-10': 'Hari Pahlawan',
    '12-22': 'Hari Ibu',
    '12-25': 'Hari Natal',
    '12-31': 'Malam Tahun Baru'
  };
  var AUTO_DISKON = 2; // diskon otomatis 2%

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function endOfTodayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T23:59:59';
  }

  function detectAutoFlash() {
    var now = new Date();
    var day = now.getDay(); // 0 Minggu ... 5 Jumat
    var md = pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    var sampai = endOfTodayISO();

    // Jumat (shalat Jumat) — setiap hari Jumat
    if (day === 5) {
      return {
        aktif: true,
        label: 'FLASH SALE JUMAT',
        diskonPersen: AUTO_DISKON,
        sampai: sampai,
        source: 'auto',
        reason: 'Hari Jumat'
      };
    }

    // Tahun baru (1 Jan sudah di map, plus jaga-jaga)
    if (md === '01-01') {
      return {
        aktif: true,
        label: 'FLASH SALE TAHUN BARU',
        diskonPersen: AUTO_DISKON,
        sampai: sampai,
        source: 'auto',
        reason: 'Tahun Baru'
      };
    }

    // Hari nasional / agama (tanggal tetap)
    if (HARI_OTOMATIS[md]) {
      return {
        aktif: true,
        label: 'FLASH SALE ' + HARI_OTOMATIS[md].toUpperCase(),
        diskonPersen: AUTO_DISKON,
        sampai: sampai,
        source: 'auto',
        reason: HARI_OTOMATIS[md]
      };
    }

    return { aktif: false, label: '', diskonPersen: 0, sampai: null, source: 'none' };
  }

  function getFlashRaw() {
    try {
      var s = localStorage.getItem(KEY_FS);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return { aktif: false, label: 'FLASH SALE', diskonPersen: 0, sampai: null, source: 'admin' };
  }

  /**
   * Flash aktif:
   * 1) Admin manual (jika aktif & belum expired) — prioritas
   * 2) Otomatis Jumat / hari nasional / tahun baru — diskon 2%, hilang habis hari
   */
  function getFlash() {
    var admin = getFlashRaw();
    var adminValid = !!admin.aktif;
    if (admin.sampai) {
      try {
        var end = new Date(admin.sampai);
        // jika hanya tanggal YYYY-MM-DD, anggap sampai akhir hari
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(admin.sampai))) {
          end = new Date(admin.sampai + 'T23:59:59');
        }
        if (end.getTime() < Date.now()) adminValid = false;
      } catch (e) { adminValid = false; }
    }
    if (adminValid) {
      return {
        aktif: true,
        label: admin.label || 'FLASH SALE',
        diskonPersen: parseInt(admin.diskonPersen, 10) || 0,
        sampai: admin.sampai || null,
        source: 'admin'
      };
    }

    // otomatis
    var auto = detectAutoFlash();
    return auto;
  }

  function setFlash(obj) {
    try {
      var o = obj || {};
      o.source = 'admin';
      localStorage.setItem(KEY_FS, JSON.stringify(o));
    } catch (e) {}
  }

  function formatRp(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  function effectivePrice(item, flash) {
    var h = item.harga;
    if (flash && flash.aktif && flash.diskonPersen > 0) {
      h = Math.round(h * (1 - flash.diskonPersen / 100));
    }
    return Math.max(0, h);
  }

  function renderList(containerId) {
    var el = document.getElementById(containerId || 'akunList');
    if (!el) return;
    var list = load();
    var flash = getFlash();
    var flashValid = !!(flash && flash.aktif && flash.diskonPersen > 0);

    var banner = '';
    if (flashValid) {
      var srcTag = flash.source === 'auto' ? ' · otomatis' : ' · admin';
      banner = '<div class="flash-banner"><i class="fa-solid fa-bolt"></i> ' +
        (flash.label || 'FLASH SALE') +
        ' · Diskon ' + flash.diskonPersen + '%' +
        (flash.sampai ? ' · s/d hari ini' : '') +
        '<small style="display:block;font-weight:600;opacity:0.9;margin-top:2px;">' + (flash.reason || '') + srcTag + '</small>' +
        '</div>';
    }

    if (!list.length) {
      el.innerHTML = banner + '<div class="empty-state"><i class="fa-solid fa-gamepad"></i><p>Belum ada akun dijual.</p></div>';
      return;
    }

    el.innerHTML = banner + list.map(function (p) {
      var price = effectivePrice(p, flashValid ? flash : null);
      var showStrike = (p.hargaAsli && p.hargaAsli > price) || (flashValid && flash.diskonPersen > 0 && p.harga > price);
      var strikeVal = p.hargaAsli && p.hargaAsli > price ? p.hargaAsli : p.harga;
      var sold = (p.stok || 0) <= 0 || p.status === 'HABIS';
      return (
        '<div class="akun-card' + (sold ? ' sold' : '') + '">' +
          '<div class="akun-img">' +
            '<img src="' + (p.img || 'nailong-digital-logo.jpg') + '" alt="" onerror="this.src=\'nailong-digital-logo.jpg\'">' +
            '<span class="akun-badge">' + (p.badge || p.game || 'AKUN') + '</span>' +
            (flashValid ? '<span class="akun-flash">SALE</span>' : '') +
          '</div>' +
          '<div class="akun-body">' +
            '<div class="akun-game">' + (p.game || '') + '</div>' +
            '<h3>' + (p.judul || 'Akun') + '</h3>' +
            '<p>' + (p.deskripsi || '') + '</p>' +
            '<div class="akun-harga-row">' +
              (showStrike ? '<span class="harga-coret">' + formatRp(strikeVal) + '</span>' : '') +
              '<span class="harga-kuning">' + formatRp(price) + '</span>' +
            '</div>' +
            '<div class="akun-meta">Stok: ' + (p.stok || 0) + (sold ? ' · HABIS' : '') + '</div>' +
            (sold
              ? '<button type="button" class="btn-pesan" disabled style="opacity:0.5">Habis</button>'
              : '<a class="btn-pesan" href="pembayaran.html?paket=' + encodeURIComponent('Akun · ' + p.judul) + '&total=' + price + '">Beli Sekarang</a>') +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  window.NailongAkun = {
    load: load,
    save: save,
    getFlash: getFlash,
    setFlash: setFlash,
    render: renderList,
    formatRp: formatRp,
    effectivePrice: effectivePrice,
    DEFAULT: DEFAULT
  };
})();
