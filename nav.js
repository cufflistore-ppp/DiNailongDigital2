/**
 * Floating Bottom Navigation + Active Indicator + v2.0.0 footer + skeleton
 */
(function () {
  var VERSION = 'v2.0.0';
  var STANDARD = [
    { href: 'botwa.html', icon: 'fa-brands fa-whatsapp', label: 'Botwa', key: 'botwa' },
    { href: 'joki.html', icon: 'fa-solid fa-shield-halved', label: 'Joki', key: 'joki' },
    { href: 'index.html', icon: 'fa-solid fa-house', label: 'Home', key: 'home' },
    { href: 'riwayat.html', icon: 'fa-solid fa-clock-rotate-left', label: 'Riwayat', key: 'riwayat' },
    { href: 'akun.html', icon: 'fa-solid fa-user', label: 'Akun', key: 'akun' }
  ];

  function currentKey() {
    var p = (location.pathname || '').split('/').pop() || 'index.html';
    p = p.split('?')[0].toLowerCase();
    if (/botwa|pairing|dual|fun|jpm/.test(p)) return 'botwa';
    if (/joki|push-kontak/.test(p)) return 'joki';
    if (/^$|index\.html|home/.test(p)) return 'home';
    if (/riwayat|jasweb/.test(p)) return 'riwayat';
    if (/akun|login|register|topup|pembayaran/.test(p)) return 'akun';
    return '';
  }

  function ensureNav() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'bottom-nav nav-5 nav-float-neo';
      document.body.appendChild(nav);
    }
    if (/admin\.html|founder\.html/i.test(location.pathname || '')) {
      // keep nav but still ok
    }
    var key = currentKey();
    nav.className = 'bottom-nav nav-5 nav-float-neo';
    nav.innerHTML = STANDARD.map(function (it) {
      var active = it.key === key ? ' active' : '';
      return (
        '<a href="' + it.href + '" class="nav-item' + active + '" data-nav="' + it.key + '">' +
          '<span class="nav-icon-wrap"><i class="' + it.icon + '"></i></span>' +
          '<span class="nav-label">' + it.label + '</span>' +
        '</a>'
      );
    }).join('') + '<div class="nav-active-pill" id="navActivePill" aria-hidden="true"></div>';

    // position active pill under active item
    requestAnimationFrame(function () {
      var pill = document.getElementById('navActivePill');
      var act = nav.querySelector('.nav-item.active');
      if (!pill || !act) {
        if (pill) pill.style.opacity = '0';
        return;
      }
      var nr = nav.getBoundingClientRect();
      var ar = act.getBoundingClientRect();
      var left = ar.left - nr.left + ar.width / 2 - 14;
      pill.style.opacity = '1';
      pill.style.transform = 'translateX(' + left + 'px)';
    });
  }

  function ensureVersion() {
    if (document.getElementById('ndVersionFooter')) return;
    var foot = document.createElement('div');
    foot.id = 'ndVersionFooter';
    foot.className = 'nd-version-footer';
    foot.textContent = VERSION;
    document.body.appendChild(foot);
  }

  function showSkeleton() {
    if (document.getElementById('ndSkeleton')) return;
    var sk = document.createElement('div');
    sk.id = 'ndSkeleton';
    sk.className = 'nd-skeleton-overlay';
    sk.innerHTML =
      '<div class="nd-skel-inner">' +
        '<div class="nd-skel-bar nd-skel-logo"></div>' +
        '<div class="nd-skel-bar nd-skel-banner"></div>' +
        '<div class="nd-skel-row"><div class="nd-skel-card"></div><div class="nd-skel-card"></div></div>' +
        '<div class="nd-skel-grid">' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
          '<div class="nd-skel-cell"></div><div class="nd-skel-cell"></div>' +
        '</div>' +
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
      var target = href.split('#')[0].split('?')[0];
      var cur = (location.pathname || '').split('/').pop() || 'index.html';
      if (!target || target === cur) return;
      showSkeleton();
    }, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureNav();
    ensureVersion();
    bindNavSkeleton();
    window.addEventListener('resize', function () { ensureNav(); });
  });
})();
