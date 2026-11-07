/**
 * Pembayaran langsung QRIS (tanpa saldo).
 * Pakai WijayaPay bila tersedia; simpan pending order; callback afterPaid(ref).
 */
(function () {
  function rupiah(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  async function payQris(opts) {
    opts = opts || {};
    var nominal = parseInt(opts.nominal, 10) || 0;
    var desc = opts.desc || 'Order Nailong Digital';
    if (nominal < 1000) throw new Error('Nominal minimal Rp 1.000');

    var result;
    if (window.WijayaPay && WijayaPay.createQris) {
      result = await WijayaPay.createQris({
        nominal: nominal,
        desc: desc,
        customerName: opts.customerName || 'Customer'
      });
    } else {
      var id = 'ND-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-8);
      result = { ref_id: id, nominal: nominal, desc: desc, needsConfig: true };
      try {
        var pending = JSON.parse(localStorage.getItem('nailong_pending_pay') || '[]');
        pending.push({
          ref_id: id,
          nominal: nominal,
          desc: desc,
          status: 'pending',
          createdAt: Date.now(),
          gateway: 'qris',
          meta: opts.meta || null
        });
        localStorage.setItem('nailong_pending_pay', JSON.stringify(pending.slice(-50)));
      } catch (e) {}
    }

    // simpan konteks order untuk diaktifkan setelah bayar
    try {
      localStorage.setItem(
        'nailong_last_qris_order',
        JSON.stringify({
          ref_id: result.ref_id,
          nominal: nominal,
          desc: desc,
          meta: opts.meta || null,
          createdAt: Date.now()
        })
      );
    } catch (e) {}

    return result;
  }

  /** UI modal instruksi QRIS sederhana */
  function showPayModal(result, onConfirmPaid) {
    var old = document.getElementById('ndQrisModal');
    if (old) old.remove();
    var m = document.createElement('div');
    m.id = 'ndQrisModal';
    m.style.cssText =
      'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);display:flex;align-items:flex-end;justify-content:center;';
    m.innerHTML =
      '<div style="width:100%;max-width:480px;background:#10182a;border-radius:18px 18px 0 0;padding:18px 16px 28px;border:1px solid rgba(255,193,7,.25);">' +
      '<h3 style="margin:0 0 8px;color:#FFC107;"><i class="fa-solid fa-qrcode"></i> Bayar QRIS</h3>' +
      '<p style="font-size:13px;color:#cfd8dc;line-height:1.45;margin:0 0 10px;">' +
      'Total <b style="color:#fff">' +
      rupiah(result.nominal) +
      '</b><br>Ref: <code style="color:#FFC107">' +
      (result.ref_id || '-') +
      '</code></p>' +
      (result.payment_url || result.qris_url
        ? '<p style="margin:0 0 10px;"><a href="' +
          (result.payment_url || result.qris_url) +
          '" target="_blank" rel="noopener" style="color:#FFC107;font-weight:800;">Buka halaman pembayaran Wijaya Pay</a></p>'
        : '<p style="font-size:12px;color:#8aa0b8;margin:0 0 10px;">Scan QRIS merchant Nailong Digital / lanjutkan di gateway Wijaya Pay. Setelah transfer berhasil, tekan tombol di bawah.</p>') +
      '<button type="button" id="ndQrisDone" style="width:100%;border:none;border-radius:12px;padding:14px;font-weight:900;background:linear-gradient(90deg,#FFC107,#FF8F00);color:#0a0e18;cursor:pointer;margin-bottom:8px;">Saya sudah bayar</button>' +
      '<button type="button" id="ndQrisCancel" style="width:100%;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px;background:transparent;color:#aaa;cursor:pointer;">Batal</button>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById('ndQrisCancel').onclick = function () {
      m.remove();
    };
    document.getElementById('ndQrisDone').onclick = function () {
      m.remove();
      if (typeof onConfirmPaid === 'function') onConfirmPaid(result);
    };
  }

  window.NailongPay = {
    payQris: payQris,
    showPayModal: showPayModal,
    rupiah: rupiah
  };
})();

/* Auto testimoni on mark paid */
(function(){
  function hook(){
    document.addEventListener('click', function(e){
      var t = e.target;
      if(!t) return;
      var id = t.id || '';
      var txt = (t.textContent || '').toLowerCase();
      if(id === 'ndQrisDone' || /sudah bayar|konfirmasi bayar|status sukses|tandai.*sukses|sudah transfer/.test(txt)){
        try {
          var last = JSON.parse(localStorage.getItem('nailong_last_qris_order') || 'null');
          var user = null;
          try { user = firebase.auth().currentUser; } catch(e){}
          var meta = (last && last.meta) || {};
          var order = {
            kode: last && last.ref_id,
            total: last && last.nominal,
            paket: meta.product || meta.paket || last && last.desc || 'Order',
            storeName: meta.storeName || '',
            sellerRole: meta.role || meta.sellerRole || '',
            tfPhoto: meta.tfPhoto || '',
            photo: meta.photo || (user && user.photoURL) || '',
            uid: (user && user.uid) || meta.uid || '',
            trxCount: meta.trxCount || 0
          };
          if (window.NailongChannel && NailongChannel.postOrderTestimoni) {
            NailongChannel.postOrderTestimoni(order, user);
          }
          if (window.NDRoles && (order.sellerRole === 'partner' || order.sellerRole === 'paid_promote' || order.storeName)) {
            NDRoles.postPartnerTestimoni({
              uid: order.uid,
              name: (user && user.displayName) || meta.name || '',
              photo: order.photo,
              storeName: order.storeName,
              role: order.sellerRole,
              product: order.paket,
              amount: typeof order.total === 'number' ? ('Rp ' + order.total.toLocaleString('id-ID')) : order.total,
              tfPhoto: order.tfPhoto,
              trxCount: order.trxCount,
              source: 'pay_confirm'
            });
          }
        } catch (err) { console.warn('testimoni hook', err); }
      }
    }, true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  else hook();
})();
