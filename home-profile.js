/**
 * Kartu profil di home: nama, foto, toko, baterai, device, suhu
 */
(function () {
  function deviceLabel() {
    var ua = navigator.userAgent || '';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'Mac';
    return 'Device';
  }
  function approxTemp() {
    // Estimasi ringan (bukan sensor real): berbasis jam lokal WIB-ish
    var h = new Date().getHours();
    var base = 27;
    if (h >= 11 && h <= 15) base = 31;
    else if (h >= 16 && h <= 18) base = 29;
    else if (h >= 19 || h <= 5) base = 25;
    return base + (Math.random() > 0.5 ? 1 : 0);
  }
  async function batteryInfo() {
    try {
      if (navigator.getBattery) {
        var b = await navigator.getBattery();
        return Math.round(b.level * 100) + '%' + (b.charging ? ' ⚡' : '');
      }
    } catch (e) {}
    return '~';
  }
  async function render() {
    var host = document.getElementById('homeProfileCard');
    if (!host) return;
    var name = 'Tamu';
    var photo = '';
    try {
      var u = window.VoxyyAuth && VoxyyAuth.getCurrentUser && VoxyyAuth.getCurrentUser();
      if (u) {
        name = u.displayName || u.email || 'User';
        photo = u.photoURL || localStorage.getItem('nailong_custom_avatar') || '';
      } else {
        photo = localStorage.getItem('nailong_custom_avatar') || '';
      }
    } catch (e) {}
    var storeName = '';
    try {
      if (window.NailongToko && NailongToko.getMyStore) {
        var st = await NailongToko.getMyStore();
        if (st) storeName = st.name;
      }
    } catch (e) {}
    var bat = await batteryInfo();
    var temp = approxTemp();
    var initial = (name || 'U').charAt(0).toUpperCase();
    host.innerHTML =
      '<div class="home-profile">' +
        (photo
          ? '<img class="hp-avatar" src="' + photo.replace(/"/g, '') + '" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML=\\'<div class=hp-avatar ph>' + initial + '</div>\\'">'
          : '<div class="hp-avatar ph">' + initial + '</div>') +
        '<div class="hp-body">' +
          '<div class="hp-name">' + String(name).replace(/</g, '') + '</div>' +
          (storeName ? '<div class="hp-store"><i class="fa-solid fa-store"></i> ' + String(storeName).replace(/</g, '') + '</div>' : '<div class="hp-store" style="opacity:0.6">Belum buka toko</div>') +
          '<div class="hp-meta">' +
            '<span><i class="fa-solid fa-battery-three-quarters"></i> ' + bat + '</span>' +
            '<span><i class="fa-solid fa-mobile-screen"></i> ' + deviceLabel() + '</span>' +
            '<span><i class="fa-solid fa-temperature-half"></i> ' + temp + '°C</span>' +
          '</div>' +
        '</div>' +
        '<img class="hp-logo" src="nailong-digital-logo.png" alt="">' +
      '</div>';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(render, 500); });
  else setTimeout(render, 500);
})();
