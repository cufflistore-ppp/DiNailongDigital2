/**
 * NAILONG DIGITAL — 2D Neo-Brutalism (fixed light)
 * Gradient kuning → oranye, card krem, hard shadow hitam.
 * Tidak ada mode gelap / toggle.
 */
(function () {
  var accent = '#FFD600';
  var accent2 = '#FF8C00';

  function apply() {
    var r = document.documentElement;
    r.setAttribute('data-theme', 'light');
    r.setAttribute('data-neo', '1');

    r.style.setProperty('--nd-accent', accent);
    r.style.setProperty('--nd-accent-2', accent2);
    r.style.setProperty('--nd-accent-soft', 'rgba(255,214,0,0.22)');
    r.style.setProperty('--accent', accent);
    r.style.setProperty('--nd-yellow', '#FFD600');
    r.style.setProperty('--nd-orange', '#FF8C00');
    r.style.setProperty('--nd-hard', '#111111');
    r.style.setProperty('--nd-bg', '#FFD600');
    r.style.setProperty('--nd-bg-2', '#FFB300');
    r.style.setProperty('--nd-card', '#FFF5E0');
    r.style.setProperty('--nd-card-2', '#FFEFD0');
    r.style.setProperty('--nd-text', '#111111');
    r.style.setProperty('--nd-muted', '#555555');
    r.style.setProperty('--nd-border', '#111111');
    r.style.setProperty('--nd-icon', '#111111');
    r.style.setProperty('--nd-shadow', '#111111');
    r.style.setProperty('--nd-raised', '#FFF5E0');
    r.style.setProperty('--nd-inset', '#FFE8B8');
    r.style.setProperty('--text-muted', '#555555');

    if (document.body) {
      document.body.classList.remove('nd-dark');
      document.body.classList.add('nd-light', 'nd-neo');
      document.body.style.color = '#111111';
      document.body.style.background = '';
      document.body.style.backgroundImage = '';
    }
    try { localStorage.setItem('nd_ui_mode', 'light'); } catch (e) {}
  }

  apply();
  document.addEventListener('DOMContentLoaded', apply);

  // no-op toggle
  window.NDTheme = {
    mode: function () { return 'light'; },
    apply: apply,
    toggle: function () {},
    set: function () {},
    resolve: function () {
      return { mode: 'light', accent: accent, bg: '#FFD600', text: '#111111' };
    }
  };
})();
