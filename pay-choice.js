/**
 * 2 pilihan bayar: Saldo (jika cukup) atau QRIS
 * Top up tidak wajib — tanpa saldo = pakai QRIS
 */
(function () {
  function formatRp(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
  }

  /**
   * showPayChoice({ amount, desc, onSaldo, onQris })
   * onSaldo called after successful deduct
   * onQris called to continue QRIS flow (redirect pembayaran.html)
   */
  function showPayChoice(opts) {
    opts = opts || {};
    var amount = parseInt(opts.amount, 10) || 0;
    var desc = opts.desc || 'Pembayaran';
    var saldo = (window.NailongBalance && NailongBalance.get) ? NailongBalance.get() : 0;
    var cukup = saldo >= amount;

    var existing = document.getElementById('payChoiceOverlay');
    if (existing) existing.remove();

    var ov = document.createElement('div');
    ov.id = 'payChoiceOverlay';
    ov.className = 'chat-sheet-overlay show';
    ov.innerHTML =
      '<div class="chat-sheet">' +
      '<div class="chat-sheet-handle"></div>' +
      '<div style="text-align:center;margin-bottom:12px;">' +
        '<div style="font-size:13px;color:#8aa0b8;">Total bayar</div>' +
        '<div style="font-size:24px;font-weight:800;color:#FFC107;">' + formatRp(amount) + '</div>' +
        '<div style="font-size:12px;color:#6b7a90;margin-top:4px;">Saldo kamu: ' + formatRp(saldo) + '</div>' +
      '</div>' +
      (cukup
        ? '<button type="button" class="chat-sheet-btn" id="paySaldo"><i class="fa-solid fa-wallet"></i><span>Bayar pakai Saldo<br><small style="font-weight:400;opacity:0.8">Langsung potong, tanpa QRIS</small></span></button>'
        : '<button type="button" class="chat-sheet-btn" id="paySaldo" disabled style="opacity:0.45"><i class="fa-solid fa-wallet"></i><span>Saldo tidak cukup<br><small style="font-weight:400">Top up opsional, atau pakai QRIS</small></span></button>'
      ) +
      '<button type="button" class="chat-sheet-btn" id="payQris"><i class="fa-solid fa-qrcode"></i><span>Bayar QRIS<br><small style="font-weight:400;opacity:0.8">Tanpa isi saldo dulu</small></span></button>' +
      '<button type="button" class="chat-sheet-btn cancel" id="payCancel">Batal</button>' +
      '</div>';
    document.body.appendChild(ov);

    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.getElementById('payCancel').onclick = function () {
      try {
        var orders = JSON.parse(localStorage.getItem('voxyy_orders') || '[]');
        var params = new URLSearchParams(location.search || '');
        var kode = (opts && opts.kode) || params.get('kode') || '';
        var found = false;
        if (kode) {
          for (var i = 0; i < orders.length; i++) {
            if (orders[i].kode === kode) {
              orders[i].status = 'Dibatalkan';
              orders[i].waktu = new Date().toLocaleString('id-ID');
              found = true;
              break;
            }
          }
        }
        if (!found) {
          kode = kode || ('ND-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
          orders.unshift({
            kode: kode,
            paket: desc,
            total: 'Rp ' + amount.toLocaleString('id-ID'),
            finalAmount: amount,
            status: 'Dibatalkan',
            waktu: new Date().toLocaleString('id-ID'),
            createdAt: Date.now()
          });
        }
        localStorage.setItem('voxyy_orders', JSON.stringify(orders));
      } catch (e) {}
      ov.remove();
      if (typeof opts.onCancel === 'function') opts.onCancel();
      else location.href = 'riwayat.html';
    };

    var btnSaldo = document.getElementById('paySaldo');
    if (cukup && btnSaldo) {
      btnSaldo.onclick = async function () {
        if (!window.NailongBalance) return alert('Sistem saldo belum siap');
        var ok = await NailongBalance.deduct(amount, desc);
        if (!ok) { alert('Saldo tidak cukup'); return; }
        ov.remove();
        if (typeof opts.onSaldo === 'function') opts.onSaldo();
        if (NailongBalance.refresh) NailongBalance.refresh();
      };
    }

    document.getElementById('payQris').onclick = function () {
      ov.remove();
      if (typeof opts.onQris === 'function') {
        opts.onQris();
      } else {
        location.href = 'pembayaran.html?total=' + amount + '&paket=' + encodeURIComponent(desc);
      }
    };
  }

  window.NailongPay = { showChoice: showPayChoice, formatRp: formatRp };
})();
