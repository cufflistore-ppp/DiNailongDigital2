/**
 * NAILONG DIGITAL — 2D Neo-Brutalism theme
 * Background gradient kuning → oranye, card putih, outline + hard shadow hitam.
 * Icons Font Awesome tetap hitam.
 */
(function () {
  var KEY = 'nd_ui_mode';
  var accent = '#FFD600';
  var accent2 = '#FF8C00';

  function mode() {
    try {
      var m = localStorage.getItem(KEY);
      if (m === 'dark') return 'dark';
    } catch (e) {}
    return 'light';
  }

  function apply(m) {
    m = m || mode();
    var r = document.documentElement;
    var dark = m === 'dark';
    r.setAttribute('data-theme', dark ? 'dark' : 'light');
    r.setAttribute('data-neo', '1');

    r.style.setProperty('--nd-accent', accent);
    r.style.setProperty('--nd-accent-2', accent2);
    r.style.setProperty('--nd-accent-soft', 'rgba(255,214,0,0.22)');
    r.style.setProperty('--accent', accent);
    r.style.setProperty('--nd-yellow', '#FFD600');
    r.style.setProperty('--nd-orange', '#FF8C00');
    r.style.setProperty('--nd-hard', '#111111');

    if (dark) {
      r.style.setProperty('--nd-bg', '#1a1408');
      r.style.setProperty('--nd-bg-2', '#241c0c');
      r.style.setProperty('--nd-card', '#2a2210');
      r.style.setProperty('--nd-card-2', '#322814');
      r.style.setProperty('--nd-text', '#fff8e7');
      r.style.setProperty('--nd-muted', '#c4b48a');
      r.style.setProperty('--nd-border', '#111111');
      r.style.setProperty('--nd-icon', '#111111');
      r.style.setProperty('--nd-shadow', '#111111');
      r.style.setProperty('--nd-raised', '#3a2e14');
      r.style.setProperty('--nd-inset', '#1a1408');
    } else {
      r.style.setProperty('--nd-bg', '#FFD600');
      r.style.setProperty('--nd-bg-2', '#FFB300');
      r.style.setProperty('--nd-card', '#FFFFFF');
      r.style.setProperty('--nd-card-2', '#FFF8E7');
      r.style.setProperty('--nd-text', '#111111');
      r.style.setProperty('--nd-muted', '#555555');
      r.style.setProperty('--nd-border', '#111111');
      r.style.setProperty('--nd-icon', '#111111');
      r.style.setProperty('--nd-shadow', '#111111');
      r.style.setProperty('--nd-raised', '#FFFFFF');
      r.style.setProperty('--nd-inset', '#FFF3C4');
    }

    r.style.setProperty('--text-muted', r.style.getPropertyValue('--nd-muted'));

    if (document.body) {
      document.body.classList.toggle('nd-dark', dark);
      document.body.classList.toggle('nd-light', !dark);
      document.body.classList.add('nd-neo');
      document.body.style.color = r.style.getPropertyValue('--nd-text');
    }

    try { localStorage.setItem(KEY, m); } catch (e) {}

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      var icon = btn.querySelector('i');
      var span = btn.querySelector('span');
      if (icon) icon.className = dark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      if (span) span.textContent = dark ? 'Gelap' : 'Terang';
    });
  }

  function toggle() {
    var next = mode() === 'dark' ? 'light' : 'dark';
    apply(next);
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

  window.NDTheme = {
    mode: mode,
    apply: apply,
    toggle: toggle,
    set: function () {},
    resolve: function () {
      return {
        mode: mode(),
        accent: accent,
        bg: getComputedStyle(document.documentElement).getPropertyValue('--nd-bg'),
        text: getComputedStyle(document.documentElement).getPropertyValue('--nd-text')
      };
    }
  };
})();
