/**
 * Bottom nav — floating neo-brutalism pill
 * Botwa · Joki · Home · JasWeb · Akun
 * + skeleton shimmer on page change
 */
(function () {
  var STANDARD = [
    { href: 'botwa.html', icon: 'fa-brands fa-whatsapp', label: 'Botwa', key: 'botwa' },
    { href: 'joki.html', icon: 'fa-solid fa-shield-halved', label: 'Joki', key: 'joki' },
    { href: 'index.html', icon: 'fa-solid fa-house', label: 'Home', key: 'home' },
    { href: 'riwayat.html', icon: 'fa-solid fa-clock-rotate-left', label: 'Riwayat', key: 'riwayat' },
    { href: 'akun.html', icon: 'fa-solid fa-user', label: 'Akun', key: 'akun' }
  ];

  function currentKey() {
    var p = (location.pathname || '').split('/').pop() || 'index.html';
    if (/botwa|pairing|dual|fun|jpm/.test(p)) return 'botwa';
    if (/joki|push-kontak/.test(p)) return 'joki';
    if (/index|home|^$/.test(p)) return 'home';
    if (/riwayat|jasweb/.test(p)) return 'riwayat';
    if (/akun|login|register|topup|riwayat|pembayaran/.test(p)) return 'akun';
    return '';
  }

  function ensureNav() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    if (/admin/i.test(location.pathname || '')) return;
    var key = currentKey();
    nav.className = 'bottom-nav nav-5 nav-float-neo';
    nav.innerHTML = STANDARD.map(function (it) {
      var active = it.key === key ? ' active' : '';
      return '<a href="' + it.href + '" class="nav-item' + active + '" data-nav="' + it.key + '">' +
        '<span class="nav-icon-wrap"><i class="' + it.icon + '"></i></span>' +
        '<span class="nav-label">' + it.label + '</span></a>';
    }).join('');
  }

  /* Skeleton shimmer when navigating internal pages */
  function showSkeleton() {
    if (document.getElementById('ndSkeleton')) return;
    var sk = document.createElement('div');
    sk.id = 'ndSkeleton';
    sk.className = 'nd-skeleton-overlay';
    sk.innerHTML =
      '<div class="nd-skel-inner">' +
        '<div class="nd-skel-bar nd-skel-logo"></div>' +
        '<div class="nd-skel-bar nd-skel-banner"></div>' +
        '<div class="nd-skel-row">' +
          '<div class="nd-skel-card"></div><div class="nd-skel-card"></div>' +
        '</div>' +
        '<div class="nd-skel-grid">' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
        '</div>' +
        '<div class="nd-skel-bar nd-skel-wide"></div>' +
        '<div class="nd-skel-bar nd-skel-mid"></div>' +
      '</div>';
    document.body.appendChild(sk);
  }

  function bindNavSkeleton() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
      if (/^https?:\/\//i.test(href) && href.indexOf(location.host) < 0) return;
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      // same-page hash only
      if (href.split('#')[0] === '' || href.split('#')[0] === location.pathname.split('/').pop()) return;
      showSkeleton();
    }, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureNav();
    bindNavSkeleton();
    // hide any leftover skeleton from previous page (bfcache)
    var old = document.getElementById('ndSkeleton');
    if (old) old.remove();
  });
})();
