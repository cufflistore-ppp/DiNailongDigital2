/**
 * Wijaya Pay integration (QRIS)
 * Isi MERCHANT_CODE & API_KEY dari dashboard https://app.wijayapay.com
 * Catatan: API key idealnya dipanggil lewat server/proxy (jangan expose di production).
 * Untuk static site, set endpoint PROXY_URL ke serverless function kamu.
 */
(function () {
  var CONFIG = {
    // Isi dari Member Area WijayaPay
    merchantCode: '', // code_merchant
    apiKey: '',       // api_key
    isProduction: true,
    // Jika punya backend proxy (disarankan):
    // PROXY_URL: 'https://your-api.vercel.app/api/wijayapay'
    proxyUrl: ''
  };

  function refId() {
    return 'ND-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000) + String(Date.now()).slice(-3);
  }

  /**
   * createQrisPayment({ nominal, desc, onSuccess, onError })
   * Returns promise with { ref_id, payment_url / qris_url, raw }
   */
  async function createQrisPayment(opts) {
    opts = opts || {};
    var nominal = parseInt(opts.nominal, 10) || 0;
    var desc = opts.desc || 'Order Nailong Digital';
    if (nominal < 1000) throw new Error('Nominal minimal Rp 1.000');

    var id = refId();
    var payload = {
      ref_id: id,
      code_payment: 'QRIS',
      nominal: nominal,
      customer_name: opts.customerName || 'Customer',
      customer_email: opts.customerEmail || '',
      description: desc
    };

    // Prefer proxy (secure)
    if (CONFIG.proxyUrl) {
      var res = await fetch(CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...payload })
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat pembayaran');
      return { ref_id: id, ...data };
    }

    // Tanpa proxy: simpan order lokal + arahkan ke halaman pembayaran dengan instruksi
    // (API key tidak dipanggil dari browser demi keamanan)
    try {
      var pending = JSON.parse(localStorage.getItem('nailong_pending_pay') || '[]');
      pending.push({
        ref_id: id,
        nominal: nominal,
        desc: desc,
        status: 'pending',
        createdAt: Date.now(),
        gateway: 'wijayapay'
      });
      localStorage.setItem('nailong_pending_pay', JSON.stringify(pending.slice(-50)));
    } catch (e) {}

    return {
      ref_id: id,
      nominal: nominal,
      desc: desc,
      needsConfig: !(CONFIG.merchantCode && CONFIG.apiKey),
      message: 'Order dibuat. Lanjutkan pembayaran QRIS Wijaya Pay.'
    };
  }

  async function checkStatus(refId) {
    if (CONFIG.proxyUrl) {
      var res = await fetch(CONFIG.proxyUrl + '?action=status&ref_id=' + encodeURIComponent(refId));
      return res.json();
    }
    return { ref_id: refId, status: 'pending' };
  }

  window.WijayaPay = {
    config: CONFIG,
    createQris: createQrisPayment,
    checkStatus: checkStatus,
    setConfig: function (c) { Object.assign(CONFIG, c || {}); }
  };
})();
