/**
 * Tema per-akun — sederhana seperti referensi:
 * - Mode Gelap / Terang
 * - Palet warna aksen (pastel)
 * Berlaku di seluruh halaman untuk akun itu saja.
 */
(function () {
  var KEY_GUEST = 'nd_theme_guest';

  var PALETTES = {
    peach:   { name: 'Peach Coral', sub: 'Original Pastel', accent: '#f0a48a', accent2: '#e08b6e' },
    sky:     { name: 'Sky Blue', sub: 'Blueberry Pop', accent: '#5bb8f5', accent2: '#3a9de0' },
    lemon:   { name: 'Lemon Custard', sub: 'Butter Yellow', accent: '#f0c94d', accent2: '#d4a82e' },
    matcha:  { name: 'Matcha Mint', sub: 'Pastel Green', accent: '#7dcfb0', accent2: '#55b894' },
    straw:   { name: 'Strawberry Pink', sub: 'Sweet Blossom', accent: '#f0a0b8', accent2: '#e07a9a' },
    lavender:{ name: 'Sweet Lavender', sub: 'Soft Taro', accent: '#b8a0e0', accent2: '#9678c8' },
    mikan:   { name: 'Mikan Orange', sub: 'Warm Citrus', accent: '#f0b070', accent2: '#e09040' },
    gold:    { name: 'Nailong Gold', sub: 'Klasik', accent: '#c9a227', accent2: '#a68520' }
  };

  function uid() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        var u = firebase.auth().currentUser;
        if (u) return u.uid;
      }
      if (window.VoxyyAuth && VoxyyAuth.getCurrentUser) {
        var u2 = VoxyyAuth.getCurrentUser();
        if (u2) return u2.uid || u2.email || null;
      }
    } catch (e) {}
    return null;
  }

  function storageKey() {
    var id = uid();
    return id ? ('nd_theme_v4_' + id) : KEY_GUEST;
  }

  function defaultTheme() {
    return { mode: 'dark', palette: 'gold' };
  }

  function load() {
    try {
      var raw = localStorage.getItem(storageKey());
      if (raw) return Object.assign(defaultTheme(), JSON.parse(raw));
    } catch (e) {}
    // migrate v3
    try {
      var old = localStorage.getItem(uid() ? ('nd_theme_v3_' + uid()) : 'nd_theme_guest');
      if (old) {
        var o = JSON.parse(old);
        return { mode: 'dark', palette: o.preset === 'navy' ? 'sky' : 'gold' };
      }
    } catch (e2) {}
    return defaultTheme();
  }

  function save(theme) {
    try { localStorage.setItem(storageKey(), JSON.stringify(theme)); } catch (e) {}
  }

  function resolve(theme) {
    theme = theme || load();
    var p = PALETTES[theme.palette] || PALETTES.gold;
    var dark = theme.mode !== 'light';
    if (dark) {
      return {
        mode: 'dark',
        palette: theme.palette,
        name: p.name,
        accent: p.accent,
        accent2: p.accent2,
        soft: p.accent + '22',
        bg: '#0c0f14',
        bgTop: '#0c0f14',
        bgBottom: '#080a0e',
        card: '#141a22',
        text: '#e8eaed',
        muted: '#8b95a5',
        border: 'rgba(255,255,255,0.08)'
      };
    }
    return {
      mode: 'light',
      palette: theme.palette,
      name: p.name,
      accent: p.accent,
      accent2: p.accent2,
      soft: p.accent + '28',
      bg: '#f4f5f7',
      bgTop: '#f8f9fb',
      bgBottom: '#eceef2',
      card: '#ffffff',
      text: '#1a1d24',
      muted: '#6b7280',
      border: 'rgba(0,0,0,0.08)'
    };
  }

  function apply(theme) {
    theme = theme || load();
    var c = resolve(theme);
    var r = document.documentElement;
    r.style.setProperty('--nd-accent', c.accent);
    r.style.setProperty('--nd-accent-2', c.accent2);
    r.style.setProperty('--nd-accent-soft', c.soft);
    r.style.setProperty('--nd-bg', c.bg);
    r.style.setProperty('--nd-bg-top', c.bgTop);
    r.style.setProperty('--nd-bg-bottom', c.bgBottom);
    r.style.setProperty('--nd-card', c.card);
    r.style.setProperty('--nd-text', c.text);
    r.style.setProperty('--nd-muted', c.muted);
    r.style.setProperty('--nd-border', c.border);
    r.style.setProperty('--accent', c.accent);
    r.style.setProperty('--accent-2', c.accent2);
    if (document.body) {
      document.body.style.backgroundColor = c.bg;
      document.body.style.color = c.text;
      document.body.classList.toggle('nd-light', c.mode === 'light');
      document.body.classList.toggle('nd-dark', c.mode === 'dark');
    }
    // header / nav common
    try {
      document.querySelectorAll('.header, .bottom-nav, .side-drawer').forEach(function (el) {
        if (c.mode === 'light') {
          el.style.backgroundColor = c.card;
          el.style.color = c.text;
        } else {
          el.style.backgroundColor = '';
          el.style.color = '';
        }
      });
    } catch (e) {}
  }

  function setTheme(opts) {
    var t = load();
    if (opts.mode) t.mode = opts.mode;
    if (opts.palette) t.palette = opts.palette;
    save(t);
    apply(t);
    return t;
  }

  apply(load());

  function rebind() { apply(load()); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(rebind, 300);
      setTimeout(rebind, 1200);
    });
  } else setTimeout(rebind, 300);

  // compat lama
  window.NailongTheme = {
    PALETTES: PALETTES,
    PRESETS: PALETTES,
    VARIANTS: {},
    load: load,
    save: save,
    apply: apply,
    resolve: resolve,
    setTheme: setTheme,
    setPreset: function (k) { return setTheme({ palette: k }); },
    setColors: function (o) {
      var t = {};
      if (o.variant === 'glass') { /* ignore complex variants */ }
      if (o.accent) {
        // map nearest or custom store as gold override
        t.palette = 'gold';
      }
      return setTheme(t);
    },
    setCustom: function () { return setTheme({}); },
    setMedia: function () { return Promise.resolve(); },
    clearMedia: function () { return Promise.resolve(); },
    storageKey: storageKey
  };
})();
