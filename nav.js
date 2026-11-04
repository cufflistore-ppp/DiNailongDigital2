/**
 * Bottom nav tetap — 5 item konsisten di semua halaman utama.
 */
(function () {
  var STANDARD = [
    { href: 'botwa.html', icon: 'fa-brands fa-whatsapp', label: 'Botwa', key: 'botwa' },
    { href: 'joki.html', icon: 'fa-solid fa-shield-halved', label: 'Joki', key: 'joki' },
    { href: 'index.html', icon: 'fa-solid fa-house', label: 'Home', key: 'home' },
    { href: 'tools.html', icon: 'fa-solid fa-screwdriver-wrench', label: 'Tools', key: 'tools' },
    { href: 'akun.html', icon: 'fa-solid fa-user', label: 'Akun', key: 'akun' }
  ];

  function currentKey() {
    var p = (location.pathname || '').split('/').pop() || 'index.html';
    if (/botwa|pairing/.test(p)) return 'botwa';
    if (/joki|push-kontak/.test(p)) return 'joki';
    if (/index|home|^$/.test(p)) return 'home';
    if (/tools|tool/.test(p)) return 'tools';
    if (/akun|login|register|topup|riwayat/.test(p)) return 'akun';
    return '';
  }

  function ensureNav() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    // jangan ubah nav admin
    if (/admin/i.test(location.pathname || '')) return;
    var key = currentKey();
    // rebuild only if structure messy (bukan 5 item standar)
    var items = nav.querySelectorAll(':scope > .nav-item');
    var need = items.length !== 5;
    if (need) {
      nav.className = 'bottom-nav nav-5';
      nav.innerHTML = STANDARD.map(function (it) {
        var active = it.key === key ? ' active' : '';
        return '<a href="' + it.href + '" class="nav-item' + active + '" data-nav="' + it.key + '">' +
          '<span class="nav-icon-wrap"><i class="' + it.icon + '"></i></span><span>' + it.label + '</span></a>';
      }).join('') + '<div class="nav-indicator" id="navIndicator"></div>';
    } else {
      items.forEach(function (a) {
        var k = a.getAttribute('data-nav') || '';
        a.classList.toggle('active', k === key || (a.getAttribute('href') || '').indexOf(key) >= 0);
      });
    }
    moveIndicator();
  }

  function moveIndicator() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    var active = nav.querySelector('.nav-item.active');
    var ind = nav.querySelector('.nav-indicator') || document.getElementById('navIndicator');
    if (!active || !ind) return;
    var nr = nav.getBoundingClientRect();
    var ar = active.getBoundingClientRect();
    ind.style.width = ar.width + 'px';
    ind.style.transform = 'translateX(' + (ar.left - nr.left) + 'px)';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureNav();
    setTimeout(moveIndicator, 50);
    window.addEventListener('resize', moveIndicator);
  });
})();
