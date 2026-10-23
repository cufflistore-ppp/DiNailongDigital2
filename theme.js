/**
 * Tema per-akun (localStorage + key user).
 * Tidak mengubah tema akun lain. Persist sampai user ganti lagi.
 */
(function () {
  var KEY_GUEST = 'nd_theme_guest';
  var PRESETS = {
    amber:  { name: 'Amber',  accent: '#d4a017', accent2: '#b8860b', soft: 'rgba(212,160,23,0.14)' },
    blue:   { name: 'Biru',   accent: '#3b82f6', accent2: '#2563eb', soft: 'rgba(59,130,246,0.14)' },
    green:  { name: 'Hijau',  accent: '#22c55e', accent2: '#16a34a', soft: 'rgba(34,197,94,0.14)' },
    purple: { name: 'Ungu',   accent: '#a855f7', accent2: '#9333ea', soft: 'rgba(168,85,247,0.14)' },
    rose:   { name: 'Rose',   accent: '#f43f5e', accent2: '#e11d48', soft: 'rgba(244,63,94,0.14)' },
    cyan:   { name: 'Cyan',   accent: '#06b6d4', accent2: '#0891b2', soft: 'rgba(6,182,212,0.14)' },
    slate:  { name: 'Slate',  accent: '#94a3b8', accent2: '#64748b', soft: 'rgba(148,163,184,0.14)' },
    orange: { name: 'Oranye', accent: '#f97316', accent2: '#ea580c', soft: 'rgba(249,115,22,0.14)' }
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
    return id ? ('nd_theme_' + id) : KEY_GUEST;
  }

  function load() {
    try {
      var raw = localStorage.getItem(storageKey());
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { preset: 'amber' };
  }

  function save(theme) {
    try { localStorage.setItem(storageKey(), JSON.stringify(theme)); } catch (e) {}
  }

  function resolve(theme) {
    theme = theme || load();
    if (theme.custom && theme.accent) {
      return {
        accent: theme.accent,
        accent2: theme.accent2 || theme.accent,
        soft: theme.soft || (theme.accent + '22')
      };
    }
    return PRESETS[theme.preset] || PRESETS.amber;
  }

  function apply(theme) {
    var c = resolve(theme);
    var r = document.documentElement;
    r.style.setProperty('--nd-accent', c.accent);
    r.style.setProperty('--nd-accent-2', c.accent2);
    r.style.setProperty('--nd-accent-soft', c.soft);
    // legacy yellow hooks → map ke accent
    r.style.setProperty('--accent', c.accent);
    r.style.setProperty('--accent-2', c.accent2);
  }

  function setPreset(key) {
    if (!PRESETS[key]) return;
    var t = { preset: key };
    save(t);
    apply(t);
    return t;
  }

  function setCustom(hex) {
    hex = String(hex || '').trim();
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex.replace('#',''))) return null;
    if (hex[0] !== '#') hex = '#' + hex;
    var t = { custom: true, accent: hex, accent2: hex, soft: hex + '24' };
    save(t);
    apply(t);
    return t;
  }

  // apply ASAP
  apply(load());

  // re-apply after auth ready (switch key guest → user)
  function rebind() {
    apply(load());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(rebind, 400);
      setTimeout(rebind, 1500);
    });
  } else {
    setTimeout(rebind, 400);
  }

  window.NailongTheme = {
    PRESETS: PRESETS,
    load: load,
    save: save,
    apply: apply,
    setPreset: setPreset,
    setCustom: setCustom,
    resolve: resolve,
    storageKey: storageKey
  };
})();
