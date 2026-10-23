/**
 * Cover 2D (SVG data-URI) untuk kartu game — bukan emoji.
 */
(function () {
  function svg(w, h, body) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  var covers = {
    snake: svg(160, 100,
      '<rect width="160" height="100" fill="#9ca89c"/>' +
      '<rect x="8" y="8" width="144" height="84" fill="none" stroke="#5a655a" stroke-width="3"/>' +
      '<g fill="#2e7d32">' +
      '<rect x="24" y="52" width="11" height="11" rx="2"/><rect x="35" y="52" width="11" height="11" rx="2"/>' +
      '<rect x="46" y="52" width="11" height="11" rx="2"/><rect x="57" y="52" width="11" height="11" rx="2"/>' +
      '<rect x="68" y="52" width="11" height="11" rx="2"/><rect x="79" y="41" width="11" height="11" rx="2"/>' +
      '<rect x="90" y="30" width="11" height="11" rx="2"/>' +
      '</g>' +
      '<rect x="90" y="30" width="11" height="11" rx="2" fill="#1b5e20"/>' +
      '<circle cx="122" cy="35" r="6" fill="#c62828"/>' +
      '<rect x="120" y="26" width="3" height="5" fill="#2e7d32"/>' +
      '<text x="14" y="22" fill="#3e463e" font-size="9" font-family="monospace" font-weight="700">SNAKE</text>'),
    tetris: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<g>' +
      '<rect x="50" y="20" width="14" height="14" fill="#00bcd4"/><rect x="64" y="20" width="14" height="14" fill="#00bcd4"/><rect x="78" y="20" width="14" height="14" fill="#00bcd4"/><rect x="92" y="20" width="14" height="14" fill="#00bcd4"/>' +
      '<rect x="64" y="48" width="14" height="14" fill="#ffeb3b"/><rect x="78" y="48" width="14" height="14" fill="#ffeb3b"/><rect x="64" y="62" width="14" height="14" fill="#ffeb3b"/><rect x="78" y="62" width="14" height="14" fill="#ffeb3b"/>' +
      '<rect x="30" y="62" width="14" height="14" fill="#e91e63"/><rect x="30" y="76" width="14" height="14" fill="#e91e63"/><rect x="44" y="76" width="14" height="14" fill="#e91e63"/><rect x="58" y="76" width="14" height="14" fill="#e91e63"/>' +
      '</g><text x="8" y="14" fill="#8aa0b8" font-size="9" font-family="monospace">TETRIS</text>'),
    mines: svg(160, 100,
      '<rect width="160" height="100" fill="#1a2332"/>' +
      '<g font-family="monospace" font-size="11" font-weight="700">' +
      '<rect x="30" y="25" width="22" height="22" fill="#c0c0c0" stroke="#333"/><text x="36" y="40" fill="#1565c0">1</text>' +
      '<rect x="52" y="25" width="22" height="22" fill="#c0c0c0" stroke="#333"/><text x="58" y="40" fill="#2e7d32">2</text>' +
      '<rect x="74" y="25" width="22" height="22" fill="#c0c0c0" stroke="#333"/><circle cx="85" cy="36" r="6" fill="#111"/><circle cx="85" cy="36" r="2" fill="#f44336"/>' +
      '<rect x="96" y="25" width="22" height="22" fill="#c0c0c0" stroke="#333"/><text x="102" y="40" fill="#c62828">3</text>' +
      '<rect x="30" y="47" width="22" height="22" fill="#9e9e9e" stroke="#333"/>' +
      '<rect x="52" y="47" width="22" height="22" fill="#c0c0c0" stroke="#333"/><text x="58" y="62" fill="#1565c0">1</text>' +
      '<rect x="74" y="47" width="22" height="22" fill="#9e9e9e" stroke="#333"/>' +
      '<rect x="96" y="47" width="22" height="22" fill="#c0c0c0" stroke="#333"/><text x="100" y="62" fill="#f9a825">⚠</text>' +
      '</g>'),
    pong: svg(160, 100,
      '<rect width="160" height="100" fill="#000"/>' +
      '<rect x="12" y="35" width="6" height="30" fill="#fff"/>' +
      '<rect x="142" y="45" width="6" height="30" fill="#fff"/>' +
      '<circle cx="80" cy="50" r="5" fill="#fff"/>' +
      '<line x1="80" y1="8" x2="80" y2="92" stroke="#333" stroke-dasharray="4 4"/>' +
      '<text x="50" y="18" fill="#666" font-size="10" font-family="monospace">3 - 2</text>'),
    breakout: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="20" y="16" width="28" height="10" fill="#e53935"/><rect x="50" y="16" width="28" height="10" fill="#fb8c00"/><rect x="80" y="16" width="28" height="10" fill="#fdd835"/><rect x="110" y="16" width="28" height="10" fill="#43a047"/>' +
      '<rect x="20" y="28" width="28" height="10" fill="#1e88e5"/><rect x="50" y="28" width="28" height="10" fill="#8e24aa"/><rect x="80" y="28" width="28" height="10" fill="#e53935"/><rect x="110" y="28" width="28" height="10" fill="#00acc1"/>' +
      '<circle cx="90" cy="60" r="4" fill="#fff"/>' +
      '<rect x="60" y="84" width="40" height="6" fill="#FFC107" rx="2"/>'),
    dino: svg(160, 100,
      '<rect width="160" height="100" fill="#f7f7f7"/>' +
      '<line x1="0" y1="78" x2="160" y2="78" stroke="#535353" stroke-width="2"/>' +
      '<g fill="#535353">' +
      '<rect x="28" y="52" width="22" height="18"/>' +
      '<rect x="42" y="42" width="16" height="12"/>' +
      '<rect x="52" y="44" width="5" height="5"/>' +
      '<rect x="30" y="70" width="7" height="8"/><rect x="42" y="70" width="7" height="8"/>' +
      '<rect x="95" y="58" width="8" height="20"/><rect x="91" y="62" width="5" height="10"/><rect x="103" y="64" width="5" height="8"/>' +
      '<rect x="120" y="60" width="7" height="18"/><rect x="117" y="64" width="4" height="8"/>' +
      '</g>' +
      '<rect x="50" y="45" width="3" height="3" fill="#f7f7f7"/>'),
    flappy: svg(160, 100,
      '<rect width="160" height="100" fill="#70c5ce"/>' +
      '<rect x="0" y="88" width="160" height="12" fill="#ded895"/><rect x="0" y="84" width="160" height="5" fill="#5e8c31"/>' +
      '<rect x="105" y="0" width="32" height="32" fill="#73bf2e" stroke="#3d5c1f" stroke-width="2"/>' +
      '<rect x="102" y="28" width="38" height="10" fill="#5e8c31" stroke="#3d5c1f" stroke-width="2"/>' +
      '<rect x="105" y="68" width="32" height="20" fill="#73bf2e" stroke="#3d5c1f" stroke-width="2"/>' +
      '<rect x="102" y="62" width="38" height="10" fill="#5e8c31" stroke="#3d5c1f" stroke-width="2"/>' +
      '<ellipse cx="48" cy="48" rx="14" ry="11" fill="#f4d03f"/>' +
      '<ellipse cx="40" cy="50" rx="7" ry="6" fill="#f5d76e"/>' +
      '<circle cx="55" cy="45" r="3.5" fill="#fff"/><circle cx="56" cy="45" r="1.6" fill="#000"/>' +
      '<path d="M60 48 L72 51 L60 55 Z" fill="#e67e22"/>'),
    space: svg(160, 100,
      '<rect width="160" height="100" fill="#000015"/>' +
      '<g fill="#e53935"><rect x="30" y="16" width="14" height="10"/><rect x="50" y="16" width="14" height="10"/><rect x="70" y="16" width="14" height="10"/><rect x="90" y="16" width="14" height="10"/><rect x="110" y="16" width="14" height="10"/>' +
      '<rect x="40" y="30" width="14" height="10"/><rect x="60" y="30" width="14" height="10"/><rect x="80" y="30" width="14" height="10"/><rect x="100" y="30" width="14" height="10"/></g>' +
      '<rect x="72" y="78" width="16" height="10" fill="#69f0ae"/><rect x="78" y="68" width="4" height="10" fill="#fff"/>'),
    g2048: svg(160, 100,
      '<rect width="160" height="100" fill="#faf8ef"/>' +
      '<rect x="20" y="18" width="36" height="36" rx="4" fill="#eee4da"/><text x="30" y="42" fill="#776e65" font-size="16" font-weight="700" font-family="sans-serif">2</text>' +
      '<rect x="62" y="18" width="36" height="36" rx="4" fill="#ede0c8"/><text x="72" y="42" fill="#776e65" font-size="16" font-weight="700" font-family="sans-serif">4</text>' +
      '<rect x="104" y="18" width="36" height="36" rx="4" fill="#f2b179"/><text x="110" y="42" fill="#f9f6f2" font-size="16" font-weight="700" font-family="sans-serif">8</text>' +
      '<rect x="20" y="60" width="36" height="28" rx="4" fill="#f59563"/><text x="26" y="80" fill="#f9f6f2" font-size="14" font-weight="700" font-family="sans-serif">16</text>' +
      '<rect x="62" y="60" width="36" height="28" rx="4" fill="#f67c5f"/><text x="68" y="80" fill="#f9f6f2" font-size="14" font-weight="700" font-family="sans-serif">32</text>'),
    ttt: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<g stroke="#FFC107" stroke-width="3" fill="none"><line x1="55" y1="15" x2="55" y2="85"/><line x1="105" y1="15" x2="105" y2="85"/><line x1="20" y1="38" x2="140" y2="38"/><line x1="20" y1="62" x2="140" y2="62"/></g>' +
      '<text x="28" y="34" fill="#69f0ae" font-size="18" font-weight="800">X</text><text x="78" y="58" fill="#e53935" font-size="18" font-weight="800">O</text><text x="118" y="34" fill="#69f0ae" font-size="18" font-weight="800">X</text>'),
    c4: svg(160, 100,
      '<rect width="160" height="100" fill="#1565c0"/>' +
      '<g>' +
      '<circle cx="30" cy="25" r="9" fill="#e53935"/><circle cx="50" cy="25" r="9" fill="#fdd835"/><circle cx="70" cy="25" r="9" fill="#0b1220"/><circle cx="90" cy="25" r="9" fill="#0b1220"/>' +
      '<circle cx="30" cy="48" r="9" fill="#fdd835"/><circle cx="50" cy="48" r="9" fill="#e53935"/><circle cx="70" cy="48" r="9" fill="#e53935"/><circle cx="90" cy="48" r="9" fill="#0b1220"/>' +
      '<circle cx="30" cy="71" r="9" fill="#e53935"/><circle cx="50" cy="71" r="9" fill="#fdd835"/><circle cx="70" cy="71" r="9" fill="#fdd835"/><circle cx="90" cy="71" r="9" fill="#e53935"/>' +
      '</g>'),
    memory: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="20" y="20" width="28" height="36" rx="4" fill="#1e88e5"/><rect x="54" y="20" width="28" height="36" rx="4" fill="#43a047"/><rect x="88" y="20" width="28" height="36" rx="4" fill="#1a2740" stroke="#FFC107"/><text x="96" y="42" fill="#FFC107" font-size="14">?</text>' +
      '<rect x="122" y="20" width="28" height="36" rx="4" fill="#e53935"/>' +
      '<rect x="20" y="62" width="28" height="28" rx="4" fill="#1a2740" stroke="#555"/><rect x="54" y="62" width="28" height="28" rx="4" fill="#1e88e5"/>'),
    sudoku: svg(160, 100,
      '<rect width="160" height="100" fill="#f5f5f5"/>' +
      '<g stroke="#333" fill="none"><rect x="40" y="15" width="80" height="70"/>' +
      '<line x1="60" y1="15" x2="60" y2="85"/><line x1="80" y1="15" x2="80" y2="85"/><line x1="100" y1="15" x2="100" y2="85"/>' +
      '<line x1="40" y1="32" x2="120" y2="32"/><line x1="40" y1="50" x2="120" y2="50"/><line x1="40" y1="68" x2="120" y2="68"/></g>' +
      '<text x="45" y="28" font-size="11" fill="#1565c0" font-weight="700">5</text><text x="85" y="46" font-size="11" fill="#333" font-weight="700">9</text><text x="105" y="64" font-size="11" fill="#1565c0" font-weight="700">2</text>'),
    watersort: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="30" y="25" width="22" height="55" rx="0 0 8 8" fill="none" stroke="#aaa" stroke-width="2"/>' +
      '<rect x="32" y="50" width="18" height="14" fill="#e53935"/><rect x="32" y="64" width="18" height="14" fill="#1e88e5"/>' +
      '<rect x="70" y="25" width="22" height="55" rx="0 0 8 8" fill="none" stroke="#aaa" stroke-width="2"/>' +
      '<rect x="72" y="36" width="18" height="14" fill="#43a047"/><rect x="72" y="50" width="18" height="14" fill="#fdd835"/><rect x="72" y="64" width="18" height="14" fill="#43a047"/>' +
      '<rect x="110" y="25" width="22" height="55" rx="0 0 8 8" fill="none" stroke="#aaa" stroke-width="2"/>'),
    tebak: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<text x="25" y="55" fill="#FFC107" font-size="22" font-family="monospace" font-weight="700" letter-spacing="6">_ A _ A</text>' +
      '<text x="40" y="80" fill="#8aa0b8" font-size="10" font-family="monospace">HANGMAN</text>'),
    wordle: svg(160, 100,
      '<rect width="160" height="100" fill="#121213"/>' +
      '<g font-family="sans-serif" font-size="12" font-weight="800" fill="#fff">' +
      '<rect x="20" y="25" width="22" height="22" fill="#538d4e"/><text x="26" y="41">M</text>' +
      '<rect x="46" y="25" width="22" height="22" fill="#b59f3b"/><text x="52" y="41">A</text>' +
      '<rect x="72" y="25" width="22" height="22" fill="#3a3a3c"/><text x="78" y="41">K</text>' +
      '<rect x="98" y="25" width="22" height="22" fill="#538d4e"/><text x="104" y="41">A</text>' +
      '<rect x="124" y="25" width="22" height="22" fill="#3a3a3c"/><text x="130" y="41">N</text>' +
      '</g>'),
    guessn: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<text x="50" y="48" fill="#FFC107" font-size="28" font-weight="800" font-family="monospace">?</text>' +
      '<text x="35" y="72" fill="#8aa0b8" font-size="10" font-family="monospace">1 — 100</text>'),
    highlow: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="40" y="20" width="40" height="56" rx="4" fill="#fff" stroke="#ccc"/>' +
      '<text x="50" y="55" fill="#e53935" font-size="22" font-weight="800">A</text>' +
      '<rect x="88" y="28" width="40" height="56" rx="4" fill="#1a2740" stroke="#FFC107"/>' +
      '<text x="98" y="62" fill="#FFC107" font-size="18" font-weight="800">?</text>'),
    cookie: svg(160, 100,
      '<rect width="160" height="100" fill="#3e2723"/>' +
      '<circle cx="80" cy="50" r="32" fill="#d4a574"/><circle cx="68" cy="40" r="4" fill="#5d4037"/><circle cx="90" cy="44" r="3" fill="#5d4037"/><circle cx="75" cy="58" r="4" fill="#5d4037"/><circle cx="95" cy="60" r="3" fill="#5d4037"/>'),
    pet: svg(160, 100,
      '<rect width="160" height="100" fill="#e8f5e9"/>' +
      '<ellipse cx="80" cy="58" rx="28" ry="22" fill="#ffb74d"/>' +
      '<circle cx="70" cy="50" r="4" fill="#333"/><circle cx="90" cy="50" r="4" fill="#333"/>' +
      '<ellipse cx="80" cy="62" rx="6" ry="4" fill="#e57373"/>' +
      '<ellipse cx="55" cy="40" rx="8" ry="10" fill="#ffb74d"/><ellipse cx="105" cy="40" rx="8" ry="10" fill="#ffb74d"/>'),
    stack: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="45" y="70" width="70" height="12" fill="#43a047"/><rect x="50" y="56" width="60" height="12" fill="#1e88e5"/>' +
      '<rect x="55" y="42" width="50" height="12" fill="#FFC107"/><rect x="30" y="20" width="50" height="12" fill="#e53935"/>'),
    block: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="30" y="25" width="20" height="20" fill="#e53935"/><rect x="52" y="25" width="20" height="20" fill="#e53935"/><rect x="74" y="25" width="20" height="20" fill="#1e88e5"/>' +
      '<rect x="30" y="47" width="20" height="20" fill="#43a047"/><rect x="52" y="47" width="20" height="20" fill="#1e88e5"/><rect x="74" y="47" width="20" height="20" fill="#1e88e5"/>' +
      '<rect x="96" y="47" width="20" height="20" fill="#fdd835"/>'),
    tod: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="25" y="20" width="50" height="60" rx="6" fill="#c62828"/><text x="32" y="55" fill="#fff" font-size="11" font-weight="800">TRUE</text>' +
      '<rect x="85" y="20" width="50" height="60" rx="6" fill="#1565c0"/><text x="95" y="55" fill="#fff" font-size="11" font-weight="800">DARE</text>'),
    uno: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<rect x="30" y="22" width="32" height="48" rx="4" fill="#e53935" stroke="#fff"/><text x="38" y="52" fill="#fff" font-size="16" font-weight="800">7</text>' +
      '<rect x="64" y="28" width="32" height="48" rx="4" fill="#1e88e5" stroke="#fff"/><text x="72" y="58" fill="#fff" font-size="16" font-weight="800">2</text>' +
      '<rect x="98" y="22" width="32" height="48" rx="4" fill="#43a047" stroke="#fff"/><text x="106" y="52" fill="#fff" font-size="16" font-weight="800">9</text>'),
    ular: svg(160, 100,
      '<rect width="160" height="100" fill="#e8f5e9"/>' +
      '<g stroke="#81c784" fill="#c8e6c9" stroke-width="0.5">' +
      '<rect x="20" y="15" width="24" height="18"/><rect x="44" y="15" width="24" height="18"/><rect x="68" y="15" width="24" height="18"/><rect x="92" y="15" width="24" height="18"/>' +
      '<rect x="20" y="33" width="24" height="18"/><rect x="44" y="33" width="24" height="18"/><rect x="68" y="33" width="24" height="18"/><rect x="92" y="33" width="24" height="18"/>' +
      '</g><path d="M30 70 Q50 40 70 55 Q90 70 110 30" stroke="#e53935" stroke-width="3" fill="none"/>' +
      '<path d="M40 80 L55 50 L70 80" stroke="#2e7d32" stroke-width="3" fill="none"/>'),
    chess: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<g>' +
      '<rect x="40" y="18" width="16" height="16" fill="#f0d9b5"/><rect x="56" y="18" width="16" height="16" fill="#b58863"/><rect x="72" y="18" width="16" height="16" fill="#f0d9b5"/><rect x="88" y="18" width="16" height="16" fill="#b58863"/>' +
      '<rect x="40" y="34" width="16" height="16" fill="#b58863"/><rect x="56" y="34" width="16" height="16" fill="#f0d9b5"/><rect x="72" y="34" width="16" height="16" fill="#b58863"/><rect x="88" y="34" width="16" height="16" fill="#f0d9b5"/>' +
      '<rect x="40" y="50" width="16" height="16" fill="#f0d9b5"/><rect x="56" y="50" width="16" height="16" fill="#b58863"/><rect x="72" y="50" width="16" height="16" fill="#f0d9b5"/><rect x="88" y="50" width="16" height="16" fill="#b58863"/>' +
      '</g><text x="44" y="48" font-size="12">♟</text><text x="76" y="64" font-size="12">♞</text>'),
    rps: svg(160, 100,
      '<rect width="160" height="100" fill="#0b1220"/>' +
      '<text x="25" y="58" font-size="28">✊</text><text x="68" y="58" font-size="28">✌️</text><text x="110" y="58" font-size="28">🖐</text>'),
    hero: svg(160, 100,
      '<rect width="160" height="100" fill="#1a1030"/>' +
      '<circle cx="80" cy="40" r="18" fill="#7c4dff"/><rect x="62" y="58" width="36" height="22" rx="6" fill="#4527a0"/>' +
      '<text x="48" y="90" fill="#b39ddb" font-size="9" font-family="monospace">TEBAK HERO</text>'),
    pong_alt: null
  };

  // generic cover from name hash — 2D shapes, not emoji
  function genericCover(name) {
    var h = 0;
    name = String(name || 'Game');
    for (var i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    var hues = [200, 160, 30, 280, 340, 120, 20, 50];
    var hue = hues[Math.abs(h) % hues.length];
    var hue2 = (hue + 40) % 360;
    var letters = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'GAME';
    return svg(160, 100,
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="hsl(' + hue + ',45%,22%)"/>' +
      '<stop offset="100%" stop-color="hsl(' + hue2 + ',40%,14%)"/></linearGradient></defs>' +
      '<rect width="160" height="100" fill="url(#g)"/>' +
      '<rect x="12" y="12" width="136" height="76" rx="4" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>' +
      '<circle cx="40" cy="50" r="14" fill="hsla(' + hue + ',70%,60%,0.35)"/>' +
      '<rect x="60" y="38" width="70" height="10" rx="2" fill="rgba(255,255,255,0.2)"/>' +
      '<rect x="60" y="54" width="50" height="8" rx="2" fill="rgba(255,255,255,0.12)"/>' +
      '<text x="80" y="28" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="11" font-family="monospace" font-weight="700">' + letters + '</text>');
  }

  function coverFor(key, name) {
    if (key && covers[key]) return covers[key];
    // fuzzy match by name
    var n = String(name || key || '').toLowerCase();
    var map = [
      [/snake|ular nokia/, 'snake'], [/tetris/, 'tetris'], [/mine/, 'mines'],
      [/pong/, 'pong'], [/breakout|arkanoid/, 'breakout'], [/dino/, 'dino'],
      [/flappy|bird/, 'flappy'], [/space|invader|galaga/, 'space'],
      [/2048/, 'g2048'], [/tic|tictac/, 'ttt'], [/connect/, 'c4'],
      [/memory|match/, 'memory'], [/sudoku/, 'sudoku'], [/water|sort/, 'watersort'],
      [/hangman|tebak kata/, 'tebak'], [/wordle/, 'wordle'], [/guess|angka/, 'guessn'],
      [/higher|lower/, 'highlow'], [/cookie|clicker/, 'cookie'], [/pet|virtual/, 'pet'],
      [/stack/, 'stack'], [/block blast/, 'block'], [/truth|dare|tod/, 'tod'],
      [/uno/, 'uno'], [/ular tangga|snake.*ladder/, 'ular'], [/chess|catur/, 'chess'],
      [/suit|rock|rps/, 'rps'], [/hero/, 'hero']
    ];
    for (var i = 0; i < map.length; i++) {
      if (map[i][0].test(n) && covers[map[i][1]]) return covers[map[i][1]];
    }
    return genericCover(name || key);
  }

  window.NailongGameCovers = { coverFor: coverFor, covers: covers };
})();
