(function () {
  var PACKS = [
    { id: '1d', label: '1 Hari', price: 3000, days: 1 },
    { id: '2d', label: '2 Hari', price: 5000, days: 2 },
    { id: '3d', label: '3 Hari', price: 7000, days: 3 },
    { id: '1w', label: '1 Minggu', price: 15000, days: 7 },
    { id: '2w', label: '2 Minggu', price: 18000, days: 14 },
    { id: '1m', label: '1 Bulan', price: 25000, days: 30 },
    { id: '3m', label: '3 Bulan', price: 35000, days: 90 },
    { id: '6m', label: '6 Bulan', price: 55000, days: 180 },
    { id: '1y', label: '1 Tahun', price: 90000, days: 365 },
    { id: '2y', label: '2 Tahun', price: 130000, days: 730 }
  ];
  var EXTRA_PRICE = 1000;
  var state = { type: 'full', pack: '1d' };
  var bots = [];
  var descs = {
    full: 'Bot Full — JPM + JB + jaga grup dalam satu bot.',
    jpm: 'Bot JPM saja — fokus broadcast / promosi JPM.',
    jb: 'Bot JB saja — fokus format jual-beli / JB.'
  };

  function $(id) { return document.getElementById(id); }
  function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
  function packOf() { return PACKS.find(function (p) { return p.id === state.pack; }) || PACKS[0]; }
  function genPair() { return String(Math.floor(100000 + Math.random() * 900000)); }
  function uid() {
    try {
      if (window.VoxyyAuth && VoxyyAuth.getCurrentUser()) return VoxyyAuth.getCurrentUser().uid;
    } catch (e) {}
    return 'guest';
  }

  function statusMeta(st) {
    if (st === 'online') return { bg: '#14532d', fg: '#4ade80', label: 'ONLINE' };
    if (st === 'pairing' || st === 'process') return { bg: '#713f12', fg: '#facc15', label: st === 'pairing' ? 'PAIRING' : 'PROSES' };
    return { bg: '#7f1d1d', fg: '#f87171', label: 'OFFLINE' };
  }

  function logMon(msg, level) {
    var el = $('botMonitor');
    if (!el) return;
    var col = level === 'ok' ? '#4ade80' : level === 'warn' ? '#facc15' : level === 'err' ? '#f87171' : '#8aa0b8';
    var t = new Date().toLocaleTimeString('id-ID');
    el.innerHTML = '<div style="color:' + col + '">[' + t + '] ' + msg + '</div>' + el.innerHTML;
  }

  function setServerPill(online) {
    var p = $('serverPill');
    if (!p) return;
    if (online) {
      p.style.background = '#14532d';
      p.style.color = '#4ade80';
      p.textContent = 'SERVER BOT WA ONLINE';
    } else {
      p.style.background = '#7f1d1d';
      p.style.color = '#f87171';
      p.textContent = 'SERVER BOT WA OFFLINE';
    }
  }

  function saveBots() {
    try { localStorage.setItem('nailong_active_bots', JSON.stringify(bots)); } catch (e) {}
  }

  function renderPairs() {
    var box = $('pairList');
    if (!box) return;
    box.innerHTML = bots.map(function (b, idx) {
      var sc = statusMeta(b.status);
      var no = idx + 1;
      return '<div style="background:#0a0e18;border-radius:12px;padding:12px;margin:8px 0;border:1px solid rgba(255,255,255,0.06);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
        '<b style="color:#fff;font-size:13px;">Nomor ' + no + ' · ' + b.number + '</b>' +
        '<span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:' + sc.bg + ';color:' + sc.fg + ';">' + sc.label + '</span></div>' +
        '<div style="font-size:24px;letter-spacing:3px;font-weight:900;color:#FFC107;text-align:center;padding:8px 0;">' + b.pairing + '</div>' +
        '<button type="button" class="btn-topup btn-copy-pair" data-code="' + b.pairing + '" data-no="' + no + '" style="width:100%;">' +
        '<i class="fa-solid fa-copy"></i> Salin pairing No.' + no + '</button></div>';
    }).join('');
    box.querySelectorAll('.btn-copy-pair').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-code');
        var no = btn.getAttribute('data-no');
        if (navigator.clipboard) navigator.clipboard.writeText(t);
        else {
          var a = document.createElement('textarea');
          a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove();
        }
        alert('Pairing Nomor ' + no + ' disalin:\n' + t);
      };
    });
    renderSlots();
    $('addNumBox').style.display = bots.length ? 'block' : 'none';
  }

  function renderSlots() {
    var box = $('botSlots');
    if (!box) return;
    if (!bots.length) {
      box.innerHTML = '<p class="hint">Belum ada bot aktif.</p>';
      return;
    }
    box.innerHTML = bots.map(function (b, idx) {
      var sc = statusMeta(b.status);
      return '<div class="slot-line" style="border-left:3px solid ' + sc.fg + ';">' +
        '<span style="font-size:12px;color:#cfd8dc;">Bot No.' + (idx + 1) + ' · ' + b.number + '</span>' +
        '<span style="font-size:11px;font-weight:800;color:' + sc.fg + ';">' + sc.label + '</span></div>';
    }).join('');
  }

  function activateBot(bot) {
    bot.status = 'process';
    renderPairs();
    saveBots();
    logMon('Bot No.' + bot.no + ' (' + bot.number + ') — memproses…', 'warn');
    setServerPill(true);
    setTimeout(function () {
      bot.status = 'pairing';
      renderPairs();
      saveBots();
      logMon('Mengambil pairing No.' + bot.no + '…', 'warn');
    }, 700);
    setTimeout(function () {
      bot.status = 'online';
      renderPairs();
      saveBots();
      logMon('Bot No.' + bot.no + ' ONLINE — pairing ' + bot.pairing, 'ok');
      setServerPill(true);
    }, 1800);
  }

  function renderPkgs() {
    var g = $('pkgGrid');
    g.innerHTML = PACKS.map(function (p) {
      return '<div class="pkg-card' + (p.id === state.pack ? ' active' : '') + '" data-id="' + p.id + '">' +
        '<div class="dur">' + p.label + '</div><div class="price">' + rupiah(p.price) + '</div></div>';
    }).join('');
    g.querySelectorAll('.pkg-card').forEach(function (el) {
      el.onclick = function () {
        state.pack = el.getAttribute('data-id');
        renderPkgs();
        $('totalText').textContent = rupiah(packOf().price);
      };
    });
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
      await VoxyyOrders.addSaldo(uid(), -amount, reason || 'Sewa bot');
      return true;
    }
    var s = await getSaldo();
    if (s < amount) return false;
    try {
      localStorage.setItem('nailong_saldo_' + uid(), String(s - amount));
      localStorage.setItem('nailong_saldo', String(s - amount));
    } catch (e) {}
    return true;
  }
  async function updateSaldoHint() {
    var s = await getSaldo();
    $('saldoHint').textContent = 'Bayar: QRIS · ' + rupiah(s);
  }

  $('typeRow').querySelectorAll('button').forEach(function (b) {
    b.onclick = function () {
      $('typeRow').querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      state.type = b.getAttribute('data-type');
      $('typeDesc').textContent = descs[state.type] || '';
    };
  });

  function activateAfterPay(number, amount, packLabel) {
    var bot = {
      no: bots.length + 1,
      number: number,
      pairing: genPair(),
      status: 'process',
      type: state.type,
      pack: packOf().id,
      createdAt: Date.now()
    };
    bots.push(bot);
    saveBots();
    $('pairCard').classList.add('show');
    renderPairs();
    logMon('Pembayaran QRIS OK · ' + rupiah(amount) + ' · ' + packLabel, 'ok');
    var stillOn = bots.filter(function (b) { return b !== bot && b.status === 'online'; }).length;
    if (stillOn) logMon(stillOn + ' bot lain tetap ONLINE (tidak di-restart).', 'ok');
    activateBot(bot);
    try {
      var order = { id: 'BOT-' + Date.now(), uid: uid(), bot: bot, amount: amount, pay: 'qris', createdAt: Date.now() };
      var list = JSON.parse(localStorage.getItem('nailong_bot_orders') || '[]');
      list.unshift(order);
      localStorage.setItem('nailong_bot_orders', JSON.stringify(list.slice(0, 50)));
      if (typeof firebase !== 'undefined' && firebase.database && firebase.auth && firebase.auth().currentUser) {
        firebase.database().ref('bot_orders/' + order.id).set(order);
      }
    } catch (e) {}
    $('pairCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('btnPay').onclick = async function () {
    var number = ($('mainNum').value || '').replace(/\D/g, '');
    if (number.length < 10) { alert('Isi nomor utama (min. 10 digit).'); return; }
    var logged = false;
    try {
      logged = localStorage.getItem('nailong_logged_in') === '1' || !!(window.VoxyyAuth && VoxyyAuth.getCurrentUser());
    } catch (e) {}
    if (!logged) {
      if (confirm('Login dulu untuk sewa bot?')) location.href = 'login.html';
      return;
    }
    var amount = packOf().price;
    var packLabel = packOf().label;
    var btn = $('btnPay');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Siapkan QRIS…';
    try {
      if (!window.NailongPay) throw new Error('Modul bayar belum dimuat');
      var result = await NailongPay.payQris({
        nominal: amount,
        desc: 'Sewa bot ' + state.type + ' ' + packLabel,
        meta: { type: 'sewa-bot', number: number, pack: packOf().id }
      });
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-qrcode"></i> Bayar QRIS & mulai bot';
      NailongPay.showPayModal(result, function () {
        activateAfterPay(number, amount, packLabel);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Sewa paket lagi';
      });
    } catch (e) {
      alert(e.message || e);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-qrcode"></i> Bayar QRIS & mulai bot';
    }
  };

  $('btnAddNum').onclick = async function () {
    var number = ($('addNumInput').value || '').replace(/\D/g, '');
    if (number.length < 10) { alert('Isi nomor baru (min. 10 digit).'); return; }
    var onlineCount = bots.filter(function (b) { return b.status === 'online'; }).length;
    logMon('Tambah nomor — ' + onlineCount + ' bot ONLINE tetap berjalan. Bayar QRIS Rp 1.000.', 'warn');
    var btn = $('btnAddNum');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> QRIS…';
    try {
      var result = await NailongPay.payQris({
        nominal: EXTRA_PRICE,
        desc: 'Tambah nomor bot',
        meta: { type: 'extra-bot', number: number }
      });
      NailongPay.showPayModal(result, function () {
        var bot = {
          no: bots.length + 1,
          number: number,
          pairing: genPair(),
          status: 'process',
          type: state.type,
          pack: 'extra',
          createdAt: Date.now()
        };
        bots.push(bot);
        saveBots();
        $('addNumInput').value = '';
        renderPairs();
        logMon('QRIS OK — nomor tambahan. Bot lama tetap ONLINE. Pairing No.' + bot.no + ' siap.', 'ok');
        activateBot(bot);
      });
    } catch (e) {
      alert(e.message || e);
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-plus"></i> Konfirmasi tambah nomor (QRIS Rp 1.000)';
  };

  setInterval(function () {
    if (!bots.length) { setServerPill(false); return; }
    setServerPill(bots.some(function (b) {
      return b.status === 'online' || b.status === 'pairing' || b.status === 'process';
    }));
  }, 4000);

  renderPkgs();
  $('totalText').textContent = rupiah(packOf().price);
  updateSaldoHint();
  try {
    bots = JSON.parse(localStorage.getItem('nailong_active_bots') || '[]') || [];
    if (bots.length) {
      $('pairCard').classList.add('show');
      renderPairs();
      setServerPill(bots.some(function (b) { return b.status === 'online'; }));
    }
  } catch (e) {}
})();
