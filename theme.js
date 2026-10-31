/**
 * Tema tetap gelap + aksen emas Nailong (tidak diganti-ganti mode terang).
 */
(function () {
  var accent = '#FFC107';
  var accent2 = '#FF8F00';
  function apply() {
    var r = document.documentElement;
    r.style.setProperty('--nd-accent', accent);
    r.style.setProperty('--nd-accent-2', accent2);
    r.style.setProperty('--nd-accent-soft', 'rgba(255,193,7,0.14)');
    r.style.setProperty('--nd-bg', '#0a0e18');
    r.style.setProperty('--nd-bg-top', '#0a0e18');
    r.style.setProperty('--nd-bg-bottom', '#070a12');
    r.style.setProperty('--nd-card', '#121a2e');
    r.style.setProperty('--nd-text', '#e8eaed');
    r.style.setProperty('--nd-muted', '#8aa0b8');
    r.style.setProperty('--accent', accent);
    r.style.setProperty('--accent-2', accent2);
    if (document.body) {
      document.body.style.backgroundColor = '#0a0e18';
      document.body.style.color = '#e8eaed';
      document.body.classList.add('nd-dark');
      document.body.classList.remove('nd-light');
    }
  }
  apply();
  document.addEventListener('DOMContentLoaded', apply);
  window.NailongTheme = {
    PALETTES: { gold: { name: 'Nailong Gold', accent: accent } },
    load: function(){ return { mode:'dark', palette:'gold' }; },
    save: function(){},
    apply: apply,
    setTheme: apply,
    setPreset: apply,
    setColors: apply,
    setCustom: apply,
    setMedia: function(){ return Promise.resolve(); },
    clearMedia: function(){ return Promise.resolve(); },
    resolve: function(){ return { mode:'dark', accent:accent, bg:'#0a0e18', text:'#e8eaed' }; }
  };
})();
