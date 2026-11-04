/**
 * Mode gelap / terang + aksen Nailong.
 * Light: bg putih, ikon/teks gelap.
 * Dark: bg hitam, ikon/teks terang.
 */
(function () {
  var KEY = 'nd_ui_mode'; // 'dark' | 'light'
  var accent = '#FFC107';
  var accent2 = '#E6A800';

  function mode() {
    try {
      var m = localStorage.getItem(KEY);
      if (m === 'light' || m === 'dark') return m;
    } catch (e) {}
    return 'dark';
  }

  function apply(m) {
    m = m || mode();
    var r = document.documentElement;
    var dark = m !== 'light';
    r.setAttribute('data-theme', dark ? 'dark' : 'light');
    r.style.setProperty('--nd-accent', accent);
    r.style.setProperty('--nd-accent-2', accent2);
    r.style.setProperty('--nd-accent-soft', dark ? 'rgba(255,193,7,0.16)' : 'rgba(212,160,23,0.18)');
    if (dark) {
      r.style.setProperty('--nd-bg', '#0c0c0e');
      r.style.setProperty('--nd-bg-2', '#141418');
      r.style.setProperty('--nd-card', '#1a1a1f');
      r.style.setProperty('--nd-card-2', '#222228');
      r.style.setProperty('--nd-text', '#f4f4f5');
      r.style.setProperty('--nd-muted', '#a1a1aa');
      r.style.setProperty('--nd-border', '#0a0a0a');
      r.style.setProperty('--nd-icon', '#f4f4f5');
      r.style.setProperty('--nd-shadow', 'rgba(0,0,0,0.65)');
      r.style.setProperty('--nd-raised', '#24242c');
      r.style.setProperty('--nd-inset', '#121216');
    } else {
      r.style.setProperty('--nd-bg', '#f3f3f5');
      r.style.setProperty('--nd-bg-2', '#ffffff');
      r.style.setProperty('--nd-card', '#ffffff');
      r.style.setProperty('--nd-card-2', '#f0f0f3');
      r.style.setProperty('--nd-text', '#121214');
      r.style.setProperty('--nd-muted', '#52525b');
      r.style.setProperty('--nd-border', '#0a0a0a');
      r.style.setProperty('--nd-icon', '#121214');
      r.style.setProperty('--nd-shadow', 'rgba(0,0,0,0.28)');
      r.style.setProperty('--nd-raised', '#ffffff');
      r.style.setProperty('--nd-inset', '#e8e8ec');
    }
    r.style.setProperty('--accent', accent);
    r.style.setProperty('--text-muted', r.style.getPropertyValue('--nd-muted'));
    if (document.body) {
      document.body.classList.toggle('nd-dark', dark);
      document.body.classList.toggle('nd-light', !dark);
      document.body.style.color = r.style.getPropertyValue('--nd-text');
    }
    try { localStorage.setItem(KEY, m); } catch (e) {}
    // update toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.innerHTML = dark
        ? '<i class="fa-solid fa-sun"></i><span>Terang</span>'
        : '<i class="fa-solid fa-moon"></i><span>Gelap</span>';
    });
  }

  function toggle() {
    apply(mode() === 'dark' ? 'light' : 'dark');
  }

  apply(mode());
  document.addEventListener('DOMContentLoaded', function () {
    apply(mode());
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggle();
      });
    });
  });

  window.NailongTheme = {
    mode: mode,
    apply: apply,
    toggle: toggle,
    setTheme: function (m) { apply(m === 'light' ? 'light' : 'dark'); },
    load: function () { return { mode: mode(), palette: 'gold' }; },
    save: function () {},
    resolve: function () {
      return { mode: mode(), accent: accent, bg: getComputedStyle(document.documentElement).getPropertyValue('--nd-bg'), text: getComputedStyle(document.documentElement).getPropertyValue('--nd-text') };
    }
  };
})();
