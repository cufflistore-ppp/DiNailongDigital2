/**
 * AI Chat Nailong Digital
 * - Paket: free / premium / super / ultra
 * - Gambar: kompres + analisis dasar di browser (ukuran, warna dominan, brightness)
 * - Balasan: engine lokal cerdas + siap dihubungkan API eksternal (NAILONG_AI_API)
 */
(function () {
  var PLANS = {
    free: {
      id: 'free', name: 'Gratis', daily: 8, images: 1,
      features: '8 chat/hari, 1 analisis gambar/hari'
    },
    premium: {
      id: 'premium', name: 'Premium',
      prices: { m1: 258500, y1: 1278500 },
      daily: 80, images: 20,
      features: '80 chat/hari · 20 gambar/hari · prioritas balasan'
    },
    super: {
      id: 'super', name: 'Super',
      prices: { m1: 1478500, y1: 2378500 },
      daily: 250, images: 80,
      features: '250 chat/hari · 80 gambar · jawaban lebih panjang'
    },
    ultra: {
      id: 'ultra', name: 'Ultra',
      prices: { m1: 3058500, y1: 4508500 },
      daily: 9999, images: 300,
      features: 'Chat hampir tanpa batas · 300 gambar · mode detail maksimal'
    }
  };

  var KEY_SUB = 'nd_ai_sub';
  var KEY_USAGE = 'nd_ai_usage';
  var KEY_HIST = 'nd_ai_hist';

  var pendingImage = null; // { dataUrl, meta }

  function $(id) { return document.getElementById(id); }
  function rupiah(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }
  function uid() {
    try {
      if (window.VoxyyAuth && VoxyyAuth.getCurrentUser()) return VoxyyAuth.getCurrentUser().uid;
    } catch (e) {}
    return localStorage.getItem('nailong_uid') || 'guest';
  }
  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function getSub() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY_SUB) || 'null');
      if (s && s.expiresAt && s.expiresAt > Date.now()) return s;
    } catch (e) {}
    return { plan: 'free', expiresAt: 0 };
  }
  function setSub(plan, months) {
    var exp = Date.now() + months * 30 * 86400000;
    var s = { plan: plan, expiresAt: exp, uid: uid() };
    localStorage.setItem(KEY_SUB, JSON.stringify(s));
    return s;
  }
  function planCfg() {
    var s = getSub();
    return PLANS[s.plan] || PLANS.free;
  }
  function getUsage() {
    try {
      var u = JSON.parse(localStorage.getItem(KEY_USAGE) || '{}');
      if (u.day !== today()) return { day: today(), chat: 0, img: 0 };
      return u;
    } catch (e) {
      return { day: today(), chat: 0, img: 0 };
    }
  }
  function saveUsage(u) {
    localStorage.setItem(KEY_USAGE, JSON.stringify(u));
  }

  function refreshPlanUI() {
    var sub = getSub();
    var cfg = planCfg();
    var usage = getUsage();
    $('planName').textContent = cfg.name;
    if (sub.plan !== 'free' && sub.expiresAt) {
      $('planExp').textContent = ' · aktif s/d ' + new Date(sub.expiresAt).toLocaleDateString('id-ID');
    } else {
      $('planExp').textContent = '';
    }
    var left = Math.max(0, cfg.daily - usage.chat);
    $('quotaLeft').textContent = left + ' / ' + cfg.daily;
  }

  async function getSaldo() {
    try {
      if (window.VoxyyOrders && VoxyyOrders.getSaldo) return await VoxyyOrders.getSaldo(uid());
    } catch (e) {}
    try {
      return Number(localStorage.getItem('nailong_saldo_' + uid()) || localStorage.getItem('nailong_saldo') || 0);
    } catch (e2) { return 0; }
  }
  async function potongSaldo(amount, reason) {
    if (window.VoxyyOrders && VoxyyOrders.addSaldo) {
      await VoxyyOrders.addSaldo(uid(), -amount, reason || 'AI plan');
      return true;
    }
    var s = await getSaldo();
    if (s < amount) return false;
    localStorage.setItem('nailong_saldo_' + uid(), String(s - amount));
    localStorage.setItem('nailong_saldo', String(s - amount));
    return true;
  }

  function addMsg(role, text, imgUrl) {
    var row = document.createElement('div');
    row.className = 'msg ' + role;
    var av = document.createElement('div');
    av.className = 'av';
    av.textContent = role === 'user' ? 'U' : 'AI';
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (imgUrl) {
      var im = document.createElement('img');
      im.src = imgUrl;
      im.alt = 'lampiran';
      bubble.appendChild(im);
    }
    if (text) {
      var p = document.createElement('div');
      p.textContent = text;
      bubble.appendChild(p);
    }
    row.appendChild(av);
    row.appendChild(bubble);
    $('chat').appendChild(row);
    $('chat').scrollTop = $('chat').scrollHeight;

    try {
      var hist = JSON.parse(localStorage.getItem(KEY_HIST) || '[]');
      hist.push({ role: role, text: text, img: !!imgUrl, t: Date.now() });
      localStorage.setItem(KEY_HIST, JSON.stringify(hist.slice(-80)));
    } catch (e) {}
  }

  /** Kompres & analisis gambar di browser */
  function processImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('File harus gambar'));
        return;
      }
      if (file.size > 8e6) {
        reject(new Error('Maksimal 8MB'));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 1280;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale);
          var h = Math.round(img.height * scale);
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          // sample warna
          var sw = 32, sh = 32;
          var c2 = document.createElement('canvas');
          c2.width = sw; c2.height = sh;
          var ctx2 = c2.getContext('2d');
          ctx2.drawImage(img, 0, 0, sw, sh);
          var data = ctx2.getImageData(0, 0, sw, sh).data;
          var r = 0, g = 0, b = 0, n = 0, bright = 0;
          for (var i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            bright += (data[i] + data[i + 1] + data[i + 2]) / 3;
            n++;
          }
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
          bright = Math.round(bright / n);

          var dataUrl = c.toDataURL('image/jpeg', 0.82);
          resolve({
            dataUrl: dataUrl,
            meta: {
              width: img.width,
              height: img.height,
              outW: w,
              outH: h,
              sizeKB: Math.round(dataUrl.length / 1024),
              avgColor: 'rgb(' + r + ',' + g + ',' + b + ')',
              brightness: bright,
              name: file.name || 'gambar.jpg'
            }
          });
        };
        img.onerror = function () { reject(new Error('Gagal baca gambar')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Gagal baca file')); };
      reader.readAsDataURL(file);
    });
  }

  function describeImage(meta, userText) {
    var mood =
      meta.brightness > 180 ? 'terang / cerah' :
      meta.brightness < 70 ? 'gelap' : 'pencahayaan sedang';
    var orient = meta.width >= meta.height ? 'landscape (mendatar)' : 'portrait (tegak)';
    var lines = [
      'Gue sudah proses gambarnya.',
      '• Resolusi asli: ' + meta.width + '×' + meta.height + ' px (' + orient + ')',
      '• Setelah kompres: ' + meta.outW + '×' + meta.outH + ' · ~' + meta.sizeKB + ' KB',
      '• Warna dominan: ' + meta.avgColor,
      '• Kesan cahaya: ' + mood + ' (brightness ' + meta.brightness + '/255)'
    ];
    if (userText) {
      lines.push('');
      lines.push('Soal pertanyaanmu: “' + userText + '” — dari atribut visual di atas, gue bisa bantu ide caption, saran crop, atau checklist kualitas foto. Paket Super/Ultra dapat jawaban lebih panjang & detail.');
    } else {
      lines.push('');
      lines.push('Mau gue buatkan caption, saran edit, atau cek apakah fotonya cocok buat produk/toko?');
    }
    return lines.join('\n');
  }

  function localReply(text, hasImage, imgMeta) {
    if (hasImage && imgMeta) return describeImage(imgMeta, text);

    var t = (text || '').toLowerCase();
    if (/halo|hai|hi|pagi|siang|malam/.test(t)) {
      return 'Halo! Ini AI Chat Nailong Digital. Tanya apa aja — produk, ide caption, ringkas teks, atau kirim gambar buat dianalisis. Upgrade Premium/Super/Ultra biar kuotanya gede.';
    }
    if (/premium|super|ultra|upgrade|harga/.test(t)) {
      return [
        'Paket AI:',
        '• Premium — 1 bln ' + rupiah(258500) + ' / 1 thn ' + rupiah(1278500),
        '• Super — 1 bln ' + rupiah(1478500) + ' / 1 thn ' + rupiah(2378500),
        '• Ultra — 1 bln ' + rupiah(3058500) + ' / 1 thn ' + rupiah(4508500),
        'Klik tombol Upgrade di atas, bayar pakai saldo.'
      ].join('\n');
    }
    if (/sewa bot|pairing|joki/.test(t)) {
      return 'Untuk sewa bot & pairing: buka menu Botwa. Bayar dulu baru dapat kode pairing. Tambah nomor +Rp 1.000 tanpa matiin bot lama. Joki/push kontak di menu terpisah.';
    }
    if (/caption|ide konten|marketing/.test(t)) {
      return 'Oke. Kasih tahu: produknya apa, targetnya siapa, nada (formal/gaul), dan panjang caption. Atau kirim foto produk biar gue sesuaikan captionnya.';
    }
    if (t.length < 3) return 'Ketik pesan yang lebih jelas, atau lampirkan gambar.';

    // jawaban generik berkualitas
    var cfg = planCfg();
    var base =
      'Ringkas pemahaman gue: kamu nanya soal “' + text.slice(0, 160) + '”.\n\n' +
      'Jawaban praktis:\n' +
      '1) Perjelas tujuan akhir (mau info, ide, atau langkah).\n' +
      '2) Kalau ini soal Nailong Digital: cek menu Botwa / Tools / Akun.\n' +
      '3) Kalau butuh analisis foto: lampirkan gambarnya.\n\n';
    if (cfg.id === 'free') {
      base += 'Tips: paket Premium ke atas kuota chat & gambar jauh lebih besar.';
    } else if (cfg.id === 'super' || cfg.id === 'ultra') {
      base +=
        'Mode ' + cfg.name + ': jabarkan konteks tambahan (target user, budget, platform) biar jawaban berikutnya lebih presisi dan actionable.';
    } else {
      base += 'Kamu di Premium — boleh kirim follow-up biar dilanjut lebih detail.';
    }
    return base;
  }

  async function externalReply(text, imageDataUrl) {
    var endpoint = window.NAILONG_AI_API || '';
    if (!endpoint) return null;
    try {
      var r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: imageDataUrl || null,
          plan: getSub().plan,
          uid: uid()
        })
      });
      if (!r.ok) return null;
      var j = await r.json();
      return (j && (j.reply || j.text || j.message)) || null;
    } catch (e) {
      return null;
    }
  }

  async function handleSend() {
    var text = ($('inp').value || '').trim();
    var img = pendingImage;
    if (!text && !img) return;

    var cfg = planCfg();
    var usage = getUsage();
    if (usage.chat >= cfg.daily) {
      alert('Kuota chat hari ini habis. Upgrade paket atau coba lagi besok.');
      $('modal').classList.add('show');
      return;
    }
    if (img && usage.img >= cfg.images) {
      alert('Kuota analisis gambar hari ini habis. Upgrade paket ya.');
      $('modal').classList.add('show');
      return;
    }

    addMsg('user', text || '(gambar)', img ? img.dataUrl : null);
    $('inp').value = '';
    clearPreview();
    usage.chat += 1;
    if (img) usage.img += 1;
    saveUsage(usage);
    refreshPlanUI();

    $('typing').classList.add('show');
    var reply = await externalReply(text, img ? img.dataUrl : null);
    if (!reply) {
      // simulasi proses
      await new Promise(function (r) { setTimeout(r, 500 + Math.random() * 600); });
      reply = localReply(text, !!img, img ? img.meta : null);
    }
    $('typing').classList.remove('show');
    addMsg('bot', reply);
  }

  function clearPreview() {
    pendingImage = null;
    $('prevWrap').classList.remove('show');
    $('prevImg').src = '';
    $('fileImg').value = '';
  }

  function renderPlans() {
    var box = $('plans');
    var html = '';
    ['premium', 'super', 'ultra'].forEach(function (id) {
      var p = PLANS[id];
      html += '<div class="plan-card"><h4>' + p.name + '</h4>' +
        '<div class="feat">' + p.features + '</div>' +
        '<div class="price">1 bulan: <b style="color:#fff">' + rupiah(p.prices.m1) + '</b></div>' +
        '<div class="price">1 tahun: <b style="color:#fff">' + rupiah(p.prices.y1) + '</b></div>' +
        '<div class="btns">' +
        '<button type="button" data-plan="' + id + '" data-months="1">Bayar 1 bulan</button>' +
        '<button type="button" class="ghost" data-plan="' + id + '" data-months="12">Bayar 1 tahun</button>' +
        '</div></div>';
    });
    box.innerHTML = html;
    box.querySelectorAll('button[data-plan]').forEach(function (btn) {
      btn.onclick = async function () {
        var plan = btn.getAttribute('data-plan');
        var months = parseInt(btn.getAttribute('data-months'), 10) === 12 ? 12 : 1;
        var price = months === 12 ? PLANS[plan].prices.y1 : PLANS[plan].prices.m1;
        var logged = false;
        try {
          logged = localStorage.getItem('nailong_logged_in') === '1' ||
            !!(window.VoxyyAuth && VoxyyAuth.getCurrentUser());
        } catch (e) {}
        if (!logged) {
          if (confirm('Login dulu untuk berlangganan AI. Ke login?')) location.href = 'login.html';
          return;
        }
        if (!confirm('Bayar QRIS ' + rupiah(price) + ' untuk ' + PLANS[plan].name + ' (' + (months === 12 ? '1 tahun' : '1 bulan') + ')?')) return;
        btn.disabled = true;
        try {
          if (!window.NailongPay) {
            // fallback: anggap pending — admin konfirmasi
            alert('Modul QRIS belum ada. Hubungi admin atau muat pay-qris.js');
            btn.disabled = false;
            return;
          }
          var result = await NailongPay.payQris({
            nominal: price,
            desc: 'AI ' + plan + ' ' + (months === 12 ? '1 tahun' : '1 bulan'),
            meta: { type: 'ai-plan', plan: plan, months: months }
          });
          $('modal').classList.remove('show');
          NailongPay.showPayModal(result, function () {
            setSub(plan, months);
            refreshPlanUI();
            alert('Pembayaran dicatat. Paket ' + PLANS[plan].name + ' aktif.');
          });
        } catch (e) {
          alert(e.message || e);
        }
        btn.disabled = false;
      };
    });
  }

  // events
  $('btnSend').onclick = handleSend;
  $('inp').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  $('btnImg').onclick = function () { $('fileImg').click(); };
  $('fileImg').onchange = async function () {
    var f = this.files && this.files[0];
    if (!f) return;
    try {
      $('typing').classList.add('show');
      $('typing').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses gambar…';
      var out = await processImage(f);
      pendingImage = out;
      $('prevImg').src = out.dataUrl;
      $('prevWrap').classList.add('show');
    } catch (e) {
      alert(e.message || e);
    }
    $('typing').classList.remove('show');
    $('typing').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI sedang membalas…';
  };
  $('prevClear').onclick = clearPreview;
  $('btnUpgrade').onclick = function () { $('modal').classList.add('show'); };
  $('modalClose').onclick = function () { $('modal').classList.remove('show'); };
  $('modal').addEventListener('click', function (e) {
    if (e.target === $('modal')) $('modal').classList.remove('show');
  });

  renderPlans();
  refreshPlanUI();
  addMsg('bot', 'Hai! Ini AI Chat. Kirim teks atau gambar. Paket Gratis terbatas — upgrade Premium / Super / Ultra di tombol atas.');
})();
