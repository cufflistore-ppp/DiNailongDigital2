(function () {
  var area, panel, timers = [];
  function clearTimers() { timers.forEach(clearInterval); timers = []; }
  function how(t){ return '<div class="g-how"><b style="color:#FFC107">Cara main:</b> '+t+'</div>'; }
  function show(html) {
    if (panel) panel.classList.add('active');
    if (!area) area = document.getElementById('gameArea');
    if (area) area.innerHTML = html;
    clearTimers();
  }
  function back() { clearTimers(); panel.classList.remove('active'); area.innerHTML = ''; }
  function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ===== SNAKE ===== */
  function snake() {
    show(how('Makan apel agar ular memanjang. Jangan tabrak dinding atau badan sendiri. Swipe/panah untuk gerak.')+'<div class="g-hud"><span>Skor: <b id="sc">0</b></span><span>Best: <b id="bs">0</b></span></div><canvas class="game-cv" id="cv" width="300" height="300" style="background:#9ca89c;border:3px solid #5a655a;box-shadow:inset 0 0 0 2px #c5d0c5"></canvas><p style="text-align:center;font-size:12px;color:#8aa0b8;margin-top:8px;">Swipe / panah untuk gerak</p><div style="display:flex;gap:8px;justify-content:center;margin-top:8px;"><button class="g-btn" id="rst">Restart</button></div>');
    var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
    var N = 15, cell = 300 / N, dir = { x: 1, y: 0 }, next = { x: 1, y: 0 };
    var snake = [{ x: 7, y: 7 }], apple = { x: 3, y: 3 }, score = 0, alive = true;
    var best = lsGet('nd_snake_best', 0);
    document.getElementById('bs').textContent = best;
    function placeApple() {
      do { apple = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
      while (snake.some(function (s) { return s.x === apple.x && s.y === apple.y; }));
    }
    placeApple();
    function draw() {
      // Nokia-style dark LCD
      ctx.fillStyle = '#9ca89c';
      ctx.fillRect(0, 0, 300, 300);
      // subtle grid
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      for (var i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, 300); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(300, i * cell); ctx.stroke();
      }
      // apple
      var ax = apple.x * cell + cell / 2, ay = apple.y * cell + cell / 2;
      ctx.fillStyle = '#c62828';
      ctx.beginPath(); ctx.arc(ax, ay, cell * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(ax - 1, ay - cell * 0.42, 3, 5);
      // snake body segments rounded
      snake.forEach(function (s, i) {
        var x = s.x * cell, y = s.y * cell, pad = 1.5;
        ctx.fillStyle = i === 0 ? '#1b5e20' : '#2e7d32';
        roundRect(ctx, x + pad, y + pad, cell - pad * 2, cell - pad * 2, 4);
        ctx.fill();
        if (i === 0) {
          // eyes
          ctx.fillStyle = '#fff';
          var ex = x + cell * (dir.x === 1 ? 0.65 : dir.x === -1 ? 0.35 : 0.35);
          var ey = y + cell * (dir.y === 1 ? 0.65 : dir.y === -1 ? 0.35 : 0.35);
          ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(ex + (dir.y === 0 ? 0 : 5), ey + (dir.x === 0 ? 0 : 5), 2.2, 0, Math.PI * 2); ctx.fill();
        }
      });
    }
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function tick() {
      if (!alive) return;
      dir = next;
      var h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some(function (s) { return s.x === h.x && s.y === h.y; })) {
        alive = false;
        if (score > best) { best = score; lsSet('nd_snake_best', best); document.getElementById('bs').textContent = best; }
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER · ' + score, 150, 150);
        return;
      }
      snake.unshift(h);
      if (h.x === apple.x && h.y === apple.y) { score++; document.getElementById('sc').textContent = score; placeApple(); }
      else snake.pop();
      draw();
    }
    draw();
    timers.push(setInterval(tick, 140));
    function setDir(x, y) { if (dir.x + x !== 0 || dir.y + y !== 0) next = { x: x, y: y }; }
    document.onkeydown = function (e) {
      if (e.key === 'ArrowUp') setDir(0, -1);
      if (e.key === 'ArrowDown') setDir(0, 1);
      if (e.key === 'ArrowLeft') setDir(-1, 0);
      if (e.key === 'ArrowRight') setDir(1, 0);
    };
    var sx, sy;
    cv.ontouchstart = function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    cv.ontouchend = function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
      else setDir(0, dy > 0 ? 1 : -1);
    };
    document.getElementById('rst').onclick = function () { snake(); };
  }

  /* ===== TRUTH OR DARE ===== */
  function tod() {
    var TRUTH = ['Apa rahasia terbesarmu?', 'Kapan terakhir kali bohong?', 'Siapa crush kamu?', 'Hal paling memalukan yang pernah terjadi?', 'Apa ketakutan terbesarmu?', 'Siapa teman yang paling kamu percaya?', 'Pernah suka sama teman sendiri?', 'Apa kebiasaan burukmu?', 'Chat terakhir dengan siapa?', 'Hal apa yang ingin kamu ubah dari dirimu?'];
    var DARE = ['Nyanyi 15 detik', 'Teriakkan nama crush', 'Push-up 5x', 'Kirim emoji random ke kontak terakhir', 'Tari 10 detik', 'Tirukan suara hewan', 'Bilang "aku keren" 3x', 'Jalan jongkok di tempat 5 langkah', 'Imitasi seleb favorit', 'Cerita lelucon garing'];
    show(
      '<p style="font-size:12px;color:#8aa0b8;margin-bottom:10px;">Kartu <b style="color:#e53935">merah = Truth</b>, <b style="color:#1e88e5">biru = Dare</b>. Bisa giliran teman (satu HP) atau vs Bot.</p>' +
      '<div class="tod-card shuffle" id="todCard"><div class="tod-type">KOCOk</div><div class="tod-text">Tekan kocok kartu</div></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">' +
      '<button class="g-btn" id="todShuffle" style="flex:1;">Kocok</button>' +
      '<button class="g-btn sec" id="todTruth" style="flex:1;background:#c62828;color:#fff;border:none;">Truth</button>' +
      '<button class="g-btn sec" id="todDare" style="flex:1;background:#1565c0;color:#fff;border:none;">Dare</button></div>' +
      '<div class="g-hud" style="margin-top:12px;"><span>Giliran: <b id="todTurn">Pemain 1</b></span><button class="g-btn sec" id="todNext">Giliran berikutnya</button></div>' +
      '<label style="font-size:12px;color:#8aa0b8;display:block;margin-top:8px;">Mode</label>' +
      '<select id="todMode" class="form-input"><option value="friends">Teman (satu HP)</option><option value="bot">vs Bot</option></select>'
    );
    var turn = 1, mode = 'friends';
    document.getElementById('todMode').onchange = function () { mode = this.value; };
    function setCard(type, text) {
      var c = document.getElementById('todCard');
      c.className = 'tod-card ' + type;
      c.innerHTML = '<div class="tod-type">' + (type === 'truth' ? 'TRUTH' : 'DARE') + '</div><div class="tod-text">' + text + '</div>';
    }
    function pick(type) {
      var arr = type === 'truth' ? TRUTH : DARE;
      setCard(type, arr[Math.floor(Math.random() * arr.length)]);
      if (mode === 'bot' && turn === 2) {
        setTimeout(function () {
          var t = Math.random() > 0.5 ? 'truth' : 'dare';
          var arr2 = t === 'truth' ? TRUTH : DARE;
          setCard(t, 'Bot: ' + arr2[Math.floor(Math.random() * arr2.length)]);
        }, 600);
      }
    }
    document.getElementById('todShuffle').onclick = function () {
      var c = document.getElementById('todCard');
      c.className = 'tod-card shuffle';
      c.innerHTML = '<div class="tod-type">...</div><div class="tod-text">Mengocok...</div>';
      setTimeout(function () { pick(Math.random() > 0.5 ? 'truth' : 'dare'); }, 500);
    };
    document.getElementById('todTruth').onclick = function () { pick('truth'); };
    document.getElementById('todDare').onclick = function () { pick('dare'); };
    document.getElementById('todNext').onclick = function () {
      turn = turn === 1 ? 2 : 1;
      document.getElementById('todTurn').textContent = mode === 'bot' ? (turn === 1 ? 'Kamu' : 'Bot') : ('Pemain ' + turn);
    };
  }

  /* ===== UNO (simple vs bot) ===== */
  function uno() {
    var colors = ['r', 'y', 'g', 'b'], nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    function card() { return { c: colors[Math.floor(Math.random() * 4)], n: nums[Math.floor(Math.random() * 10)] }; }
    function label(x) { return x.n; }
    var deck = [], hand = [], bot = [], top;
    for (var i = 0; i < 7; i++) { hand.push(card()); bot.push(card()); }
    top = card();
    function render(msg) {
      show(
        '<div class="g-hud"><span>Bot: <b>' + bot.length + '</b> kartu</span><span id="unoMsg">' + (msg || '') + '</span></div>' +
        '<div style="text-align:center;margin:10px 0;"><div class="uno-card ' + top.c + '" style="margin:0 auto;width:56px;height:80px;font-size:18px;">' + label(top) + '</div><div style="font-size:11px;color:#8aa0b8;margin-top:4px;">Tumpukan</div></div>' +
        '<div style="font-size:12px;color:#8aa0b8;margin-bottom:6px;">Kartu kamu (klik yang cocok warna/angka):</div>' +
        '<div class="uno-hand" id="unoHand"></div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;"><button class="g-btn sec" id="unoDraw" style="flex:1;">Ambil</button><button class="g-btn" id="unoNew" style="flex:1;">Game Baru</button></div>'
      );
      var h = document.getElementById('unoHand');
      hand.forEach(function (k, idx) {
        var el = document.createElement('div');
        el.className = 'uno-card ' + k.c;
        el.textContent = label(k);
        el.onclick = function () { play(idx); };
        h.appendChild(el);
      });
      document.getElementById('unoDraw').onclick = function () { hand.push(card()); botTurn(); render(); };
      document.getElementById('unoNew').onclick = function () { uno(); };
    }
    function play(idx) {
      var k = hand[idx];
      if (k.c !== top.c && k.n !== top.n) { render('Kartu tidak cocok!'); return; }
      top = k; hand.splice(idx, 1);
      if (!hand.length) { render('KAMU MENANG!'); return; }
      botTurn(); render();
    }
    function botTurn() {
      for (var i = 0; i < bot.length; i++) {
        if (bot[i].c === top.c || bot[i].n === top.n) { top = bot[i]; bot.splice(i, 1); break; }
      }
      if (bot.length === 0) render('BOT MENANG!');
      else if (bot.every(function (k) { return k.c !== top.c && k.n !== top.n; })) bot.push(card());
    }
    render('Giliranmu');
  }

  /* ===== ULAR TANGGA ===== */
  function ular() {
    var snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
    var ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
    var p = [1, 1], turn = 0;
    function draw(msg) {
      var cells = '';
      for (var r = 9; r >= 0; r--) {
        var row = [];
        for (var c = 0; c < 10; c++) {
          var n = r % 2 === 0 ? r * 10 + c + 1 : r * 10 + (9 - c) + 1;
          var cls = 'sl-cell';
          if (snakes[n]) cls += ' snake';
          if (ladders[n]) cls += ' ladder';
          if (p[0] === n) cls += ' sl-p1';
          if (p[1] === n) cls += ' sl-p2';
          row.push('<div class="' + cls + '">' + n + '</div>');
        }
        cells += row.join('');
      }
      show(
        '<div class="g-hud"><span>🔵 P1: ' + p[0] + '</span><span>🔴 P2: ' + p[1] + '</span></div>' +
        '<div class="sl-board">' + cells + '</div>' +
        '<p style="text-align:center;margin:10px 0;color:#FFC107;font-weight:700;" id="slMsg">' + (msg || ('Giliran ' + (turn === 0 ? '🔵 P1' : '🔴 P2'))) + '</p>' +
        '<button class="g-btn" id="slRoll" style="width:100%;">Lempar Dadu</button>'
      );
      document.getElementById('slRoll').onclick = roll;
    }
    function roll() {
      var d = 1 + Math.floor(Math.random() * 6);
      var np = p[turn] + d;
      if (np > 100) np = p[turn];
      if (ladders[np]) np = ladders[np];
      if (snakes[np]) np = snakes[np];
      p[turn] = np;
      if (np === 100) { draw((turn === 0 ? '🔵 P1' : '🔴 P2') + ' MENANG! Dadu:' + d); return; }
      var msg = (turn === 0 ? '🔵' : '🔴') + ' dapat ' + d + ' → ' + np;
      turn = 1 - turn;
      draw(msg + ' · Giliran ' + (turn === 0 ? '🔵' : '🔴'));
    }
    draw();
  }

  /* ===== MEMORY ===== */
  function memory() {
    var icons = ['🍎', '🍌', '🍇', '🍉', '🍒', '🥝', '🍑', '🍓'];
    var cards = icons.concat(icons).sort(function () { return Math.random() - 0.5; });
    var open = [], done = {}, moves = 0, lock = false;
    function render() {
      show('<div class="g-hud"><span>Langkah: <b id="mv">' + moves + '</b></span><button class="g-btn sec" id="memNew">Baru</button></div><div class="mem-grid" id="mg"></div>');
      var g = document.getElementById('mg');
      cards.forEach(function (ic, i) {
        var d = document.createElement('div');
        d.className = 'mem-card' + (done[i] ? ' done' : '');
        d.textContent = (done[i] || open.indexOf(i) >= 0) ? ic : '?';
        d.onclick = function () { flip(i); };
        g.appendChild(d);
      });
      document.getElementById('memNew').onclick = memory;
    }
    function flip(i) {
      if (lock || done[i] || open.indexOf(i) >= 0) return;
      open.push(i); moves++;
      render();
      if (open.length === 2) {
        lock = true;
        if (cards[open[0]] === cards[open[1]]) { done[open[0]] = done[open[1]] = 1; open = []; lock = false; render(); }
        else setTimeout(function () { open = []; lock = false; render(); }, 600);
      }
    }
    render();
  }

  /* ===== TIC TAC TOE ===== */
  function ttt() {
    var board = Array(9).fill(''), turn = 'X', vsBot = true, over = false;
    function render(msg) {
      show(
        '<div class="g-hud"><span>' + (msg || ('Giliran ' + turn)) + '</span>' +
        '<select id="tttMode" class="form-input" style="width:auto;padding:6px 10px;"><option value="bot"' + (vsBot ? ' selected' : '') + '>vs Bot</option><option value="p2"' + (!vsBot ? ' selected' : '') + '>2 Pemain</option></select></div>' +
        '<div class="ttt" id="ttt"></div><button class="g-btn" id="tttNew" style="width:100%;margin-top:12px;">Game Baru</button>'
      );
      var g = document.getElementById('ttt');
      board.forEach(function (v, i) {
        var d = document.createElement('div'); d.textContent = v;
        d.onclick = function () { move(i); };
        g.appendChild(d);
      });
      document.getElementById('tttMode').onchange = function () { vsBot = this.value === 'bot'; ttt(); };
      document.getElementById('tttNew').onclick = ttt;
    }
    function win(p) {
      return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(function (l) {
        return l.every(function (i) { return board[i] === p; });
      });
    }
    function move(i) {
      if (over || board[i]) return;
      board[i] = turn;
      if (win(turn)) { over = true; render(turn + ' MENANG!'); return; }
      if (board.every(Boolean)) { over = true; render('SERI'); return; }
      turn = turn === 'X' ? 'O' : 'X';
      if (vsBot && turn === 'O' && !over) {
        var empty = board.map(function (v, i) { return v ? -1 : i; }).filter(function (i) { return i >= 0; });
        board[empty[Math.floor(Math.random() * empty.length)]] = 'O';
        if (win('O')) { over = true; render('Bot MENANG!'); return; }
        if (board.every(Boolean)) { over = true; render('SERI'); return; }
        turn = 'X';
      }
      render();
    }
    render();
  }

  /* ===== 2048 ===== */
  function g2048() {
    var g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], score = 0;
    function add() {
      var e = [];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (!g[r][c]) e.push([r, c]);
      if (!e.length) return;
      var p = e[Math.floor(Math.random() * e.length)];
      g[p[0]][p[1]] = Math.random() < 0.9 ? 2 : 4;
    }
    add(); add();
    function draw() {
      var html = '<div class="g-hud"><span>Skor: <b>' + score + '</b></span><button class="g-btn sec" id="n2048">Baru</button></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:280px;margin:0 auto;">';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var v = g[r][c];
        html += '<div style="aspect-ratio:1;border-radius:8px;background:' + (v ? '#FFC107' : '#1a2740') + ';color:#0a0e18;font-weight:800;font-size:' + (v > 100 ? 14 : 18) + 'px;display:flex;align-items:center;justify-content:center;">' + (v || '') + '</div>';
      }
      html += '</div><p style="text-align:center;font-size:12px;color:#8aa0b8;margin-top:8px;">Swipe / panah</p>';
      show(html);
      document.getElementById('n2048').onclick = g2048;
    }
    function slide(row) {
      var a = row.filter(function (x) { return x; });
      for (var i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a[i + 1] = 0; }
      a = a.filter(function (x) { return x; });
      while (a.length < 4) a.push(0);
      return a;
    }
    function move(dir) {
      var ng = g.map(function (r) { return r.slice(); });
      if (dir === 'L') for (var r = 0; r < 4; r++) ng[r] = slide(ng[r]);
      if (dir === 'R') for (var r = 0; r < 4; r++) ng[r] = slide(ng[r].reverse()).reverse();
      if (dir === 'U') for (var c = 0; c < 4; c++) { var col = slide([ng[0][c], ng[1][c], ng[2][c], ng[3][c]]); for (var r = 0; r < 4; r++) ng[r][c] = col[r]; }
      if (dir === 'D') for (var c = 0; c < 4; c++) { var col = slide([ng[3][c], ng[2][c], ng[1][c], ng[0][c]]); for (var r = 0; r < 4; r++) ng[3 - r][c] = col[r]; }
      if (JSON.stringify(ng) !== JSON.stringify(g)) { g = ng; add(); }
      draw();
    }
    document.onkeydown = function (e) {
      var m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D' };
      if (m[e.key]) { e.preventDefault(); move(m[e.key]); }
    };
    draw();
  }

  /* ===== RPS ===== */
  function rps() {
    show('<div style="text-align:center;"><p id="rpsRes" style="font-size:16px;font-weight:800;color:#FFC107;min-height:48px;">Pilih</p><div style="display:flex;gap:10px;justify-content:center;"><button class="g-btn" data-r="✊">✊</button><button class="g-btn" data-r="✌️">✌️</button><button class="g-btn" data-r="🖐">🖐</button></div><p style="margin-top:12px;color:#8aa0b8;font-size:12px;">Skor kamu <b id="ys">0</b> · Bot <b id="bs">0</b></p></div>');
    var ys = 0, bs = 0;
    area.querySelectorAll('[data-r]').forEach(function (b) {
      b.onclick = function () {
        var you = b.getAttribute('data-r');
        var bot = ['✊', '✌️', '🖐'][Math.floor(Math.random() * 3)];
        var res = 'Seri';
        if ((you === '✊' && bot === '✌️') || (you === '✌️' && bot === '🖐') || (you === '🖐' && bot === '✊')) { res = 'Kamu menang!'; ys++; }
        else if (you !== bot) { res = 'Bot menang'; bs++; }
        document.getElementById('rpsRes').textContent = you + ' vs ' + bot + ' → ' + res;
        document.getElementById('ys').textContent = ys;
        document.getElementById('bs').textContent = bs;
      };
    });
  }

  /* ===== TEBAK KATA ===== */
  function tebak() {
    var words = ['NAILONG', 'JAKARTA', 'KOMPUTER', 'SEPATU', 'MATAHARI', 'LAYANGAN', 'PESAWAT', 'GUNUNG', 'SAMUDRA', 'MERDEKA'];
    var w = words[Math.floor(Math.random() * words.length)];
    var guess = Array(w.length).fill('_');
    var wrong = 0;
    function render(msg) {
      show('<div class="g-hud"><span>Salah: ' + wrong + '/6</span><button class="g-btn sec" id="tbNew">Kata Baru</button></div>' +
        '<p style="text-align:center;font-size:28px;letter-spacing:8px;font-weight:800;color:#FFC107;margin:16px 0;">' + guess.join(' ') + '</p>' +
        '<p style="text-align:center;color:#8aa0b8;font-size:12px;">' + (msg || 'Tebak huruf') + '</p>' +
        '<div id="keys" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;"></div>');
      var keys = document.getElementById('keys');
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (ch) {
        var b = document.createElement('button');
        b.className = 'g-btn sec'; b.textContent = ch; b.style.padding = '8px 10px';
        b.onclick = function () {
          if (w.indexOf(ch) >= 0) {
            for (var i = 0; i < w.length; i++) if (w[i] === ch) guess[i] = ch;
            if (guess.join('') === w) render('BENAR! ' + w);
            else render();
          } else {
            wrong++;
            if (wrong >= 6) render('Gagal. Jawaban: ' + w);
            else render();
          }
        };
        keys.appendChild(b);
      });
      document.getElementById('tbNew').onclick = tebak;
    }
    render();
  }

  /* ===== TEBAK HERO ===== */
  function hero() {
    var pool = [
      { q: 'Hero ML tank dengan ultimate black hole?', a: ['Franco', 'Tigreal', 'Atlas', 'Khufra'], c: 2 },
      { q: 'Karakter FF yang ikonik dengan bandana?', a: ['Alok', 'Kelly', 'Hayato', 'Andrew'], c: 0 },
      { q: 'Senjata PUBG klasik assault rifle?', a: ['AWM', 'M416', 'Kar98', 'Pan'], c: 1 },
      { q: 'Hero ML marksman ' + 'lesley' + ' role?', a: ['Tank', 'Mage', 'Marksman', 'Support'], c: 2 },
      { q: 'FF character support healing?', a: ['Alok', 'Chrono', 'Kenta', 'Wukong'], c: 0 },
      { q: 'PUBG zone berwarna?', a: ['Biru', 'Merah', 'Hijau', 'Kuning'], c: 0 }
    ];
    var i = Math.floor(Math.random() * pool.length), item = pool[i];
    show('<p style="font-weight:800;color:#fff;margin-bottom:12px;">' + item.q + '</p><div class="quiz-opts" id="qo"></div><button class="g-btn sec" id="hNext" style="width:100%;margin-top:10px;">Soal Lain</button>');
    item.a.forEach(function (opt, idx) {
      var b = document.createElement('button'); b.textContent = opt;
      b.onclick = function () {
        b.style.borderColor = idx === item.c ? '#69f0ae' : '#ff8a80';
        b.style.color = idx === item.c ? '#69f0ae' : '#ff8a80';
      };
      document.getElementById('qo').appendChild(b);
    });
    document.getElementById('hNext').onclick = hero;
  }

  /* ===== PONG ===== */
  function pong() {
    show('<canvas class="game-cv" id="cv" width="320" height="200"></canvas><p style="text-align:center;font-size:12px;color:#8aa0b8;">Drag / sentuh gerak paddle</p><div class="g-hud"><span id="ps">0 - 0</span><button class="g-btn sec" id="pNew">Restart</button></div>');
    var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
    var py = 80, by = 100, bx = 160, vx = 3, vy = 2, s1 = 0, s2 = 0, bot = 80;
    function loop() {
      ctx.fillStyle = '#0a0e18'; ctx.fillRect(0, 0, 320, 200);
      ctx.fillStyle = '#FFC107'; ctx.fillRect(10, py, 8, 40); ctx.fillRect(302, bot, 8, 40);
      ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
      bx += vx; by += vy;
      if (by < 0 || by > 200) vy *= -1;
      if (bx < 20 && by > py && by < py + 40) vx = Math.abs(vx);
      if (bx > 300 && by > bot && by < bot + 40) vx = -Math.abs(vx);
      if (bx < 0) { s2++; bx = 160; by = 100; vx = 3; }
      if (bx > 320) { s1++; bx = 160; by = 100; vx = -3; }
      bot += (by - bot - 20) * 0.08;
      document.getElementById('ps').textContent = s1 + ' - ' + s2;
    }
    timers.push(setInterval(loop, 20));
    cv.ontouchmove = function (e) { e.preventDefault(); var r = cv.getBoundingClientRect(); py = (e.touches[0].clientY - r.top) - 20; };
    cv.onmousemove = function (e) { var r = cv.getBoundingClientRect(); py = (e.clientY - r.top) - 20; };
    document.getElementById('pNew').onclick = pong;
  }

  /* ===== MINESWEEPER ===== */
  function mines() {
    var W = 8, H = 8, BOMBS = 10;
    var grid = [], open = [], flag = [], over = false;
    for (var i = 0; i < W * H; i++) grid.push(0);
    var placed = 0;
    while (placed < BOMBS) {
      var p = Math.floor(Math.random() * W * H);
      if (grid[p] !== -1) { grid[p] = -1; placed++; }
    }
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (grid[y * W + x] === -1) continue;
      var n = 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && grid[ny * W + nx] === -1) n++;
      }
      grid[y * W + x] = n;
    }
    function render(msg) {
      var html = '<div class="g-hud"><span>' + (msg || 'Hindari bom') + '</span><button class="g-btn sec" id="mnNew">Baru</button></div><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:3px;max-width:280px;margin:0 auto;">';
      for (var i = 0; i < W * H; i++) {
        var showc = open[i];
        var t = showc ? (grid[i] === -1 ? '💣' : (grid[i] || '')) : (flag[i] ? '🚩' : '');
        html += '<div data-i="' + i + '" style="aspect-ratio:1;border-radius:4px;background:' + (showc ? '#0d1220' : '#1a2740') + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#FFC107;cursor:pointer;">' + t + '</div>';
      }
      html += '</div><p style="font-size:11px;color:#8aa0b8;text-align:center;margin-top:8px;">Tap buka · long-press bendera</p>';
      show(html);
      area.querySelectorAll('[data-i]').forEach(function (el) {
        var idx = +el.getAttribute('data-i');
        el.onclick = function () {
          if (over || flag[idx]) return;
          open[idx] = 1;
          if (grid[idx] === -1) { over = true; for (var j = 0; j < grid.length; j++) if (grid[j] === -1) open[j] = 1; render('BOOM!'); return; }
          render();
        };
        var timer;
        el.ontouchstart = function () { timer = setTimeout(function () { flag[idx] = !flag[idx]; render(); }, 400); };
        el.ontouchend = function () { clearTimeout(timer); };
      });
      document.getElementById('mnNew').onclick = mines;
    }
    render();
  }

  /* ===== BLOCK BLAST (simple) ===== */
  function block() {
    var best = lsGet('nd_block_best', 0), score = 0;
    show('<div class="g-hud"><span>Skor: <b id="sc">0</b> · Best: <b>' + best + '</b></span><button class="g-btn sec" id="bbNew">Reset</button></div><div id="bg" style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;max-width:280px;margin:0 auto;"></div><p style="text-align:center;font-size:12px;color:#8aa0b8;margin-top:8px;">Klik kotak berwarna untuk hapus grup</p>');
    var colors = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa'];
    var grid = [];
    for (var i = 0; i < 36; i++) grid.push(colors[Math.floor(Math.random() * colors.length)]);
    function draw() {
      var g = document.getElementById('bg'); g.innerHTML = '';
      grid.forEach(function (c, i) {
        var d = document.createElement('div');
        d.style.cssText = 'aspect-ratio:1;border-radius:6px;background:' + (c || '#1a2740') + ';cursor:pointer;';
        d.onclick = function () { pop(i); };
        g.appendChild(d);
      });
      document.getElementById('sc').textContent = score;
    }
    function pop(i) {
      var c = grid[i]; if (!c) return;
      var stack = [i], seen = {};
      while (stack.length) {
        var cur = stack.pop(); if (seen[cur]) continue; seen[cur] = 1;
        if (grid[cur] !== c) continue;
        var x = cur % 6, y = Math.floor(cur / 6);
        [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(function (p) {
          if (p[0] >= 0 && p[0] < 6 && p[1] >= 0 && p[1] < 6) stack.push(p[1] * 6 + p[0]);
        });
      }
      var keys = Object.keys(seen);
      if (keys.length < 2) return;
      keys.forEach(function (k) { grid[k] = null; });
      score += keys.length * 10;
      if (score > best) { best = score; lsSet('nd_block_best', best); }
      draw();
    }
    draw();
    document.getElementById('bbNew').onclick = block;
  }

  /* ===== CHESS simplified random bot ===== */
  function chess() {
    show('<p style="font-size:13px;color:#cfd8dc;margin-bottom:10px;">Catur sederhana vs bot (gerak legal dasar). Untuk full rules gunakan app khusus.</p>' +
      '<div id="cb" style="display:grid;grid-template-columns:repeat(8,1fr);max-width:320px;margin:0 auto;border:2px solid #FFC107;border-radius:8px;overflow:hidden;aspect-ratio:1;"></div>' +
      '<button class="g-btn" id="chNew" style="width:100%;margin-top:10px;">Reset</button>');
    var start = ['♜','♞','♝','♛','♚','♝','♞','♜','♟','♟','♟','♟','♟','♟','♟','♟',
      '','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',
      '♙','♙','♙','♙','♙','♙','♙','♙','♖','♘','♗','♕','♔','♗','♘','♖'];
    var board = start.slice(), sel = -1;
    function draw() {
      var g = document.getElementById('cb'); g.innerHTML = '';
      for (var i = 0; i < 64; i++) {
        var d = document.createElement('div');
        var r = Math.floor(i / 8), c = i % 8;
        d.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;background:' + ((r + c) % 2 ? '#b58863' : '#f0d9b5') + (sel === i ? ';outline:3px solid #FFC107;outline-offset:-3px' : '');
        d.textContent = board[i];
        d.onclick = (function (idx) { return function () { click(idx); }; })(i);
        g.appendChild(d);
      }
    }
    function click(i) {
      if (sel < 0) { if (board[i]) sel = i; }
      else { board[i] = board[sel]; board[sel] = ''; sel = -1; bot(); }
      draw();
    }
    function bot() {
      var moves = [];
      for (var i = 0; i < 64; i++) if ('♜♞♝♛♚♟'.indexOf(board[i]) >= 0) {
        for (var j = 0; j < 64; j++) if ('♖♘♗♕♔♙'.indexOf(board[j]) >= 0 || !board[j]) moves.push([i, j]);
      }
      if (!moves.length) return;
      var m = moves[Math.floor(Math.random() * moves.length)];
      board[m[1]] = board[m[0]]; board[m[0]] = '';
    }
    draw();
    document.getElementById('chNew').onclick = chess;
  }


  /* ===== TETRIS ===== */
  function tetris() {
    var W=10,H=18,cell=16;
    var shapes={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],L:[[1,0],[1,0],[1,1]],J:[[0,1],[0,1],[1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]]};
    var keys=Object.keys(shapes), board=[], piece=null, px=0,py=0, score=0, alive=true;
    for(var i=0;i<H;i++) board.push(Array(W).fill(0));
    var pieceColor=1;
    function spawn(){
      var k=keys[Math.floor(Math.random()*keys.length)];
      var colorMap={I:1,O:2,T:3,L:4,J:5,S:6,Z:7};
      pieceColor=colorMap[k]||1;
      piece=shapes[k].map(function(r){return r.slice();});
      px=Math.floor((W-piece[0].length)/2); py=0;
      if(collide(px,py,piece)){ alive=false; }
    }
    function collide(x,y,p){
      for(var r=0;r<p.length;r++) for(var c=0;c<p[r].length;c++) if(p[r][c]){
        var nx=x+c, ny=y+r;
        if(nx<0||nx>=W||ny>=H) return true;
        if(ny>=0 && board[ny][nx]) return true;
      }
      return false;
    }
    function merge(){
      for(var r=0;r<piece.length;r++) for(var c=0;c<piece[r].length;c++) if(piece[r][c]&&py+r>=0) board[py+r][px+c]=pieceColor;
      // clear lines
      for(var r=H-1;r>=0;r--){
        if(board[r].every(Boolean)){ board.splice(r,1); board.unshift(Array(W).fill(0)); score+=100; r++; }
      }
    }
    function rot(){
      var n=piece[0].length, m=piece.length, np=[];
      for(var c=0;c<n;c++){ np[c]=[]; for(var r=m-1;r>=0;r--) np[c].push(piece[r][c]); }
      if(!collide(px,py,np)) piece=np;
    }
    function drawBlock(ctx,x,y,col){
      ctx.fillStyle=col; ctx.fillRect(x,y,cell-1,cell-1);
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(x,y,cell-1,3);
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(x,y+cell-4,cell-1,3);
    }
    var palette=['#000','#00f0f0','#f0f000','#a000f0','#f0a000','#0000f0','#00f000','#f00000'];
    function draw(){
      var cv=document.getElementById('cv'); if(!cv) return; var ctx=cv.getContext('2d');
      ctx.fillStyle='#111'; ctx.fillRect(0,0,W*cell,H*cell);
      // grid
      ctx.strokeStyle='#1a1a1a'; for(var i=0;i<=W;i++){ ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,H*cell); ctx.stroke(); }
      for(var r=0;r<H;r++) for(var c=0;c<W;c++) if(board[r][c]) drawBlock(ctx,c*cell,r*cell, palette[board[r][c]]||'#FFC107');
      if(piece) for(var r=0;r<piece.length;r++) for(var c=0;c<piece[r].length;c++) if(piece[r][c]){
        drawBlock(ctx,(px+c)*cell,(py+r)*cell, palette[pieceColor]||'#69f0ae');
      }
      document.getElementById('sc').textContent=score;
      if(!alive){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,W*cell,H*cell); ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER', W*cell/2, H*cell/2); }
    }
    function tick(){
      if(!alive) return;
      if(!collide(px,py+1,piece)) py++; else { merge(); spawn(); }
      draw();
    }
    show(how('Susun balok sampai baris penuh hilang. Panah kiri/kanan gerak, atas putar, bawah jatuh. Di HP: tombol di bawah.')+
      '<div class="g-hud"><span>Skor: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="'+ (W*cell) +'" height="'+ (H*cell) +'"></canvas>'+
      '<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">'+
      '<button class="g-btn sec" id="tl">←</button><button class="g-btn sec" id="tr">↻</button><button class="g-btn sec" id="tt">→</button><button class="g-btn sec" id="td">↓</button></div>');
    spawn(); draw();
    timers.push(setInterval(tick, 450));
    document.onkeydown=function(e){
      if(!alive) return;
      if(e.key==='ArrowLeft'&&!collide(px-1,py,piece)) px--;
      if(e.key==='ArrowRight'&&!collide(px+1,py,piece)) px++;
      if(e.key==='ArrowDown'&&!collide(px,py+1,piece)) py++;
      if(e.key==='ArrowUp') rot();
      draw();
    };
    document.getElementById('tl').onclick=function(){ if(!collide(px-1,py,piece)) px--; draw(); };
    document.getElementById('tt').onclick=function(){ if(!collide(px+1,py,piece)) px++; draw(); };
    document.getElementById('tr').onclick=function(){ rot(); draw(); };
    document.getElementById('td').onclick=function(){ if(!collide(px,py+1,piece)) py++; draw(); };
    document.getElementById('rst').onclick=tetris;
  }

  /* ===== BREAKOUT ===== */
  function breakout() {
    show(how('Gerakkan papan di bawah (drag/sentuh). Pantulkan bola untuk hancurkan semua bata.')+
      '<div class="g-hud"><span>Sisa: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="320" height="240"></canvas>');
    var cv=document.getElementById('cv'), ctx=cv.getContext('2d');
    var px=130, bx=160, by=180, vx=2.5, vy=-2.5, bricks=[], alive=true;
    for(var r=0;r<4;r++) for(var c=0;c<8;c++) bricks.push({x:c*40+2,y:r*16+20,w:36,h:12,on:1});
    function loop(){
      if(!alive) return;
      ctx.fillStyle='#0a0e18'; ctx.fillRect(0,0,320,240);
      ctx.fillStyle='#FFC107'; ctx.fillRect(px,220,60,8);
      bx+=vx; by+=vy;
      if(bx<0||bx>320) vx*=-1; if(by<0) vy*=-1;
      if(by>220&&bx>px&&bx<px+60){ vy=-Math.abs(vy); }
      if(by>240){ alive=false; ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER',160,120); return; }
      var left=0;
      bricks.forEach(function(b){
        if(!b.on) return; left++;
        ctx.fillStyle='#69f0ae'; ctx.fillRect(b.x,b.y,b.w,b.h);
        if(bx>b.x&&bx<b.x+b.w&&by>b.y&&by<b.y+b.h){ b.on=0; vy*=-1; }
      });
      document.getElementById('sc').textContent=left;
      if(!left){ alive=false; ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('CLEAR!',160,120); }
      ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
    }
    timers.push(setInterval(loop,16));
    cv.ontouchmove=function(e){ e.preventDefault(); var r=cv.getBoundingClientRect(); px=(e.touches[0].clientX-r.left)-30; };
    cv.onmousemove=function(e){ var r=cv.getBoundingClientRect(); px=(e.clientX-r.left)-30; };
    document.getElementById('rst').onclick=breakout;
  }

  /* ===== FLAPPY ===== */
  function flappy() {
    show(how('Tap / klik agar burung naik. Hindari pipa. Skor tiap pipa yang dilewati.')+
      '<div class="g-hud"><span>Skor: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="320" height="220"></canvas>');
    var cv=document.getElementById('cv'), ctx=cv.getContext('2d');
    var y=100, vy=0, pipes=[], frame=0, score=0, alive=true;
    function loop(){
      if(!alive) return;
      frame++; vy+=0.35; y+=vy;
      if(frame%90===0) pipes.push({x:320, gap:40+Math.random()*80});
      pipes.forEach(function(p){ p.x-=2; });
      pipes=pipes.filter(function(p){ if(p.x<-40){ score++; return false;} return true; });
      // sky
      ctx.fillStyle='#70c5ce'; ctx.fillRect(0,0,320,220);
      // ground
      ctx.fillStyle='#ded895'; ctx.fillRect(0,200,320,20);
      ctx.fillStyle='#5e8c31'; ctx.fillRect(0,196,320,6);
      pipes.forEach(function(p){
        ctx.fillStyle='#5e8c31';
        ctx.fillRect(p.x,0,40,p.gap);
        ctx.fillRect(p.x,p.gap+66,40,220);
        ctx.fillStyle='#73bf2e';
        ctx.fillRect(p.x-3,p.gap-12,46,12);
        ctx.fillRect(p.x-3,p.gap+66,46,12);
        if(10< p.x+40 && 36>p.x && (y<p.gap || y>p.gap+66)) alive=false;
      });
      // bird body
      ctx.fillStyle='#f4d03f';
      ctx.beginPath(); ctx.ellipse(28,y,12,10,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(34,y-2,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(35,y-2,1.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e67e22';
      ctx.beginPath(); ctx.moveTo(38,y); ctx.lineTo(48,y+2); ctx.lineTo(38,y+5); ctx.fill();
      ctx.fillStyle='#f5d76e';
      ctx.beginPath(); ctx.ellipse(22,y+2,6,5,0,0,Math.PI*2); ctx.fill();
      if(y>220||y<0) alive=false;
      document.getElementById('sc').textContent=score;
      if(!alive){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,320,220); ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER · '+score,160,110); }
    }
    timers.push(setInterval(loop,20));
    function flap(){ if(alive) vy=-5.5; else flappy(); }
    cv.onclick=flap; cv.ontouchstart=function(e){ e.preventDefault(); flap(); };
    document.getElementById('rst').onclick=flappy;
  }

  /* ===== DINO ===== */
  function dino() {
    show(how('Tap / spasi untuk lompat. Hindari kaktus. Bertahan selama mungkin.')+
      '<div class="g-hud"><span>Skor: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="320" height="140"></canvas>');
    var cv=document.getElementById('cv'), ctx=cv.getContext('2d');
    var y=0, vy=0, onGround=true, obs=[], frame=0, score=0, alive=true, speed=4;
    function loop(){
      if(!alive) return;
      frame++; score++; if(frame%100===0) speed+=0.2;
      if(frame%70===0) obs.push({x:320,w:12+Math.random()*10,h:20+Math.random()*20});
      vy+=0.6; y+=vy; if(y>0){ y=0; vy=0; onGround=true; }
      obs.forEach(function(o){ o.x-=speed; });
      obs=obs.filter(function(o){ return o.x>-20; });
      ctx.fillStyle='#f7f7f7'; ctx.fillRect(0,0,320,140);
      ctx.strokeStyle='#535353'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(0,110); ctx.lineTo(320,110); ctx.stroke();
      // dino body
      var dy=90+y;
      ctx.fillStyle='#535353';
      ctx.fillRect(30,dy+6,20,16);
      ctx.fillRect(42,dy,14,10);
      ctx.fillRect(50,dy+2,4,4);
      ctx.fillRect(32,dy+20,6,8); ctx.fillRect(42,dy+20,6,8);
      ctx.fillStyle='#f7f7f7'; ctx.fillRect(48,dy+3,2,2);
      ctx.fillStyle='#535353';
      obs.forEach(function(o){
        // cactus
        ctx.fillRect(o.x,110-o.h,o.w,o.h);
        ctx.fillRect(o.x-3,110-o.h+6,4,o.h*0.4);
        ctx.fillRect(o.x+o.w-1,110-o.h+10,4,o.h*0.35);
        if(o.x<50&&o.x+o.w>30&&dy+24>110-o.h) alive=false;
      });
      document.getElementById('sc').textContent=score;
      if(!alive){ ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER · '+score,160,60); }
    }
    timers.push(setInterval(loop,20));
    function jump(){ if(onGround&&alive){ vy=-9; onGround=false; } else if(!alive) dino(); }
    cv.onclick=jump; document.onkeydown=function(e){ if(e.code==='Space'){ e.preventDefault(); jump(); } };
    document.getElementById('rst').onclick=dino;
  }

  /* ===== SPACE SHOT ===== */
  function space() {
    show(how('Geser kapal di bawah. Otomatis tembak. Hindari & hancurkan alien.')+
      '<div class="g-hud"><span>Skor: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="320" height="240"></canvas>');
    var cv=document.getElementById('cv'), ctx=cv.getContext('2d');
    var px=150, bullets=[], enemies=[], frame=0, score=0, alive=true;
    function loop(){
      if(!alive) return;
      frame++;
      if(frame%40===0) enemies.push({x:Math.random()*300,y:0});
      if(frame%12===0) bullets.push({x:px+10,y:210});
      ctx.fillStyle='#0a0e18'; ctx.fillRect(0,0,320,240);
      ctx.fillStyle='#FFC107'; ctx.fillRect(px,215,24,12);
      bullets.forEach(function(b){ b.y-=5; ctx.fillStyle='#fff'; ctx.fillRect(b.x,b.y,3,8); });
      bullets=bullets.filter(function(b){ return b.y>0; });
      enemies.forEach(function(e){
        e.y+=1.5; ctx.fillStyle='#e53935'; ctx.fillRect(e.x,e.y,20,14);
        if(e.y>210&&e.x<px+24&&e.x+20>px) alive=false;
        bullets.forEach(function(b){ if(b.x>e.x&&b.x<e.x+20&&b.y>e.y&&b.y<e.y+14){ e.hit=1; b.y=-9; score+=10; } });
      });
      enemies=enemies.filter(function(e){ return !e.hit&&e.y<240; });
      document.getElementById('sc').textContent=score;
      if(!alive){ ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER',160,120); }
    }
    timers.push(setInterval(loop,20));
    cv.ontouchmove=function(e){ e.preventDefault(); var r=cv.getBoundingClientRect(); px=(e.touches[0].clientX-r.left)-12; };
    cv.onmousemove=function(e){ var r=cv.getBoundingClientRect(); px=(e.clientX-r.left)-12; };
    document.getElementById('rst').onclick=space;
  }

  /* ===== CONNECT 4 ===== */
  function c4() {
    var W=7,H=6, board=Array(H).fill(0).map(function(){return Array(W).fill(0);}), turn=1, over=false;
    function check(p){
      // horiz, vert, diag
      for(var r=0;r<H;r++) for(var c=0;c<W;c++){
        if(c+3<W && board[r][c]==p&&board[r][c+1]==p&&board[r][c+2]==p&&board[r][c+3]==p) return true;
        if(r+3<H && board[r][c]==p&&board[r+1][c]==p&&board[r+2][c]==p&&board[r+3][c]==p) return true;
        if(r+3<H&&c+3<W && board[r][c]==p&&board[r+1][c+1]==p&&board[r+2][c+2]==p&&board[r+3][c+3]==p) return true;
        if(r+3<H&&c-3>=0 && board[r][c]==p&&board[r+1][c-1]==p&&board[r+2][c-2]==p&&board[r+3][c-3]==p) return true;
      }
      return false;
    }
    function render(msg){
      var html=how('Giliran menaruh keping. Yang pertama susun 4 sebaris (horizontal/vertikal/diagonal) menang. vs Bot.')+
        '<div class="g-hud"><span>'+(msg||('Giliran '+(turn===1?'🔵':'🔴')))+'</span><button class="g-btn sec" id="rst">Baru</button></div><div class="c4" id="c4">';
      for(var r=0;r<H;r++) for(var c=0;c<W;c++){
        var col=board[r][c]===1?'#1e88e5':board[r][c]===2?'#e53935':'#1a2740';
        html+='<div data-c="'+c+'" style="background:'+col+'"></div>';
      }
      html+='</div>';
      show(html);
      area.querySelectorAll('[data-c]').forEach(function(el){
        el.onclick=function(){ drop(+el.getAttribute('data-c')); };
      });
      document.getElementById('rst').onclick=c4;
    }
    function drop(c){
      if(over) return;
      var r=H-1; while(r>=0&&board[r][c]) r--;
      if(r<0) return;
      board[r][c]=turn;
      if(check(turn)){ over=true; render((turn===1?'🔵':'🔴')+' MENANG!'); return; }
      turn=turn===1?2:1;
      if(turn===2&&!over){
        // bot random
        var cols=[]; for(var i=0;i<W;i++) if(!board[0][i]) cols.push(i);
        if(cols.length) drop(cols[Math.floor(Math.random()*cols.length)]);
        return;
      }
      render();
    }
    render();
  }

  /* ===== SUDOKU MINI 4x4 ===== */
  function sudoku() {
    var puzzle=[
      [1,0,0,4],[0,0,1,0],[0,4,0,0],[2,0,0,3]
    ];
    var sol=[
      [1,3,2,4],[4,2,1,3],[3,4,2,1],[2,1,4,3]
    ];
    var grid=puzzle.map(function(r){return r.slice();});
    function render(msg){
      var html=how('Isi angka 1–4. Tiap baris, kolom, dan kotak 2×2 tidak boleh ada angka kembar.')+
        '<div class="g-hud"><span>'+(msg||'Sudoku 4×4')+'</span><button class="g-btn sec" id="chk">Cek</button></div>'+
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;max-width:220px;margin:0 auto;">';
      for(var r=0;r<4;r++) for(var c=0;c<4;c++){
        var locked=puzzle[r][c]!==0;
        html+='<input data-r="'+r+'" data-c="'+c+'" value="'+(grid[r][c]||'')+'" '+(locked?'readonly':'')+' maxlength="1" style="aspect-ratio:1;text-align:center;font-size:18px;font-weight:800;border-radius:8px;border:1px solid rgba(255,193,7,.3);background:'+(locked?'#1a2740':'#0d1220')+';color:#FFC107;">';
      }
      html+='</div>';
      show(html);
      area.querySelectorAll('input').forEach(function(inp){
        inp.oninput=function(){ grid[+inp.dataset.r][+inp.dataset.c]=parseInt(inp.value,10)||0; };
      });
      document.getElementById('chk').onclick=function(){
        var ok=true;
        for(var r=0;r<4;r++) for(var c=0;c<4;c++) if(grid[r][c]!==sol[r][c]) ok=false;
        render(ok?'BENAR! 🎉':'Masih ada yang salah');
      };
    }
    render();
  }

  /* ===== WATER SORT ===== */
  function watersort() {
    var tubes=[
      ['#e53935','#1e88e5','#e53935','#43a047'],
      ['#43a047','#e53935','#1e88e5','#fdd835'],
      ['#1e88e5','#fdd835','#43a047','#fdd835'],
      [],[]
    ];
    var sel=-1;
    function topColor(t){ return t.length? t[t.length-1]: null; }
    function render(msg){
      var html=how('Tuangkan warna dari satu tabung ke tabung lain. Hanya boleh menuang ke warna yang sama atau tabung kosong. Target: tiap tabung satu warna.')+
        '<div class="g-hud"><span>'+(msg||'Water Sort')+'</span><button class="g-btn sec" id="rst">Reset</button></div>'+
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;" id="tubes"></div>';
      show(html);
      var box=document.getElementById('tubes');
      tubes.forEach(function(t,i){
        var el=document.createElement('div');
        el.style.cssText='width:44px;height:120px;border:2px solid '+(sel===i?'#FFC107':'#555')+';border-radius:0 0 12px 12px;display:flex;flex-direction:column-reverse;overflow:hidden;cursor:pointer;background:#0a0e18;';
        t.forEach(function(col){
          var s=document.createElement('div'); s.style.cssText='height:28px;background:'+col+';'; el.appendChild(s);
        });
        el.onclick=function(){ click(i); };
        box.appendChild(el);
      });
      document.getElementById('rst').onclick=watersort;
    }
    function click(i){
      if(sel<0){ if(tubes[i].length) sel=i; }
      else if(sel===i) sel=-1;
      else {
        var from=tubes[sel], to=tubes[i];
        if(from.length && to.length<4 && (!to.length || topColor(to)===topColor(from))){
          var col=topColor(from);
          while(from.length && topColor(from)===col && to.length<4) to.push(from.pop());
        }
        sel=-1;
      }
      // win?
      var win=tubes.every(function(t){ return t.length===0 || (t.length===4 && t.every(function(c){return c===t[0];})); });
      render(win?'SELESAI! 🎉':'Water Sort');
    }
    render();
  }

  /* ===== COOKIE CLICKER ===== */
  function cookie() {
    var s=0, perClick=1, auto=0;
    try{ var st=JSON.parse(localStorage.getItem('nd_cookie')||'{}'); s=st.s||0; perClick=st.pc||1; auto=st.a||0; }catch(e){}
    function save(){ try{ localStorage.setItem('nd_cookie', JSON.stringify({s:s,pc:perClick,a:auto})); }catch(e){} }
    function render(){
      show(how('Klik kue untuk dapat poin. Beli upgrade agar produksi otomatis / klik lebih kuat. Progress tersimpan.')+
        '<div style="text-align:center;"><div style="font-size:48px;cursor:pointer;user-select:none;" id="ck">🍪</div>'+
        '<p style="font-size:22px;font-weight:800;color:#FFC107;margin:8px 0;"><span id="sc">'+Math.floor(s)+'</span> kue</p>'+
        '<p style="font-size:12px;color:#8aa0b8;">'+perClick+'/klik · '+auto+'/detik</p>'+
        '<button class="g-btn" id="up1" style="width:100%;margin-top:8px;">+1 per klik (15)</button>'+
        '<button class="g-btn sec" id="up2" style="width:100%;margin-top:8px;">+1 / detik (50)</button></div>');
      document.getElementById('ck').onclick=function(){ s+=perClick; document.getElementById('sc').textContent=Math.floor(s); save(); };
      document.getElementById('up1').onclick=function(){ if(s>=15){ s-=15; perClick++; save(); render(); } };
      document.getElementById('up2').onclick=function(){ if(s>=50){ s-=50; auto++; save(); render(); } };
    }
    render();
    timers.push(setInterval(function(){ s+=auto; var el=document.getElementById('sc'); if(el) el.textContent=Math.floor(s); save(); },1000));
  }

  /* ===== VIRTUAL PET ===== */
  function pet() {
    var hunger=70, happy=70, clean=70;
    try{ var st=JSON.parse(localStorage.getItem('nd_pet')||'{}'); hunger=st.h??70; happy=st.p??70; clean=st.c??70; }catch(e){}
    function save(){ try{ localStorage.setItem('nd_pet', JSON.stringify({h:hunger,p:happy,c:clean})); }catch(e){} }
    function mood(){
      var avg=(hunger+happy+clean)/3;
      if(avg>70) return '😺 Senang';
      if(avg>40) return '🐱 Biasa';
      return '😿 Butuh perhatian';
    }
    function render(){
      show(how('Rawat hewan: beri makan, main, bersihkan. Jangan sampai semua bar habis!')+
        '<div style="text-align:center;font-size:64px;margin:8px 0;">🐾</div>'+
        '<p style="text-align:center;font-weight:800;color:#FFC107;">'+mood()+'</p>'+
        '<div style="font-size:12px;color:#cfd8dc;margin:10px 0;">Lapar: '+hunger+'%<br>Senang: '+happy+'%<br>Bersih: '+clean+'%</div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
        '<button class="g-btn" id="feed" style="flex:1;">🍽️ Makan</button>'+
        '<button class="g-btn sec" id="play" style="flex:1;">🎾 Main</button>'+
        '<button class="g-btn sec" id="wash" style="flex:1;">🛁 Mandi</button></div>');
      document.getElementById('feed').onclick=function(){ hunger=Math.min(100,hunger+20); happy=Math.min(100,happy+5); save(); render(); };
      document.getElementById('play').onclick=function(){ happy=Math.min(100,happy+20); hunger=Math.max(0,hunger-5); save(); render(); };
      document.getElementById('wash').onclick=function(){ clean=Math.min(100,clean+25); save(); render(); };
    }
    render();
    timers.push(setInterval(function(){ hunger=Math.max(0,hunger-1); happy=Math.max(0,happy-1); clean=Math.max(0,clean-1); save(); },5000));
  }

  /* ===== STACK TOWER ===== */
  function stack() {
    show(how('Tap untuk menjatuhkan balok. Usahakan sejajar. Makin tinggi makin sulit.')+
      '<div class="g-hud"><span>Tinggi: <b id="sc">0</b></span><button class="g-btn sec" id="rst">Restart</button></div>'+
      '<canvas class="game-cv" id="cv" width="280" height="320"></canvas>');
    var cv=document.getElementById('cv'), ctx=cv.getContext('2d');
    var stack=[{x:90,w:100}], cur={x:0,w:100,dir:1}, score=0, alive=true, speed=2;
    function loop(){
      if(!alive) return;
      cur.x+=cur.dir*speed;
      if(cur.x<0||cur.x+cur.w>280) cur.dir*=-1;
      ctx.fillStyle='#0a0e18'; ctx.fillRect(0,0,280,320);
      stack.forEach(function(b,i){
        ctx.fillStyle=i===stack.length-1?'#FFC107':'#69f0ae';
        ctx.fillRect(b.x,300-i*14,b.w,12);
      });
      ctx.fillStyle='#fff'; ctx.fillRect(cur.x,300-stack.length*14,cur.w,12);
      document.getElementById('sc').textContent=score;
    }
    function drop(){
      if(!alive) return;
      var last=stack[stack.length-1];
      var left=Math.max(cur.x,last.x), right=Math.min(cur.x+cur.w,last.x+last.w);
      var w=right-left;
      if(w<8){ alive=false; ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER · '+score,140,160); return; }
      stack.push({x:left,w:w}); cur={x:0,w:w,dir:1}; score++; speed=Math.min(5,2+score*0.08);
      if(stack.length>18) stack.shift();
    }
    timers.push(setInterval(loop,16));
    cv.onclick=drop; cv.ontouchstart=function(e){ e.preventDefault(); drop(); };
    document.getElementById('rst').onclick=stack;
  }

  /* ===== WORDLE ID ===== */
  function wordle() {
    var words=['MATAHARI','SEKOLAH','LAYANGAN','KOMPUTER','SEPATU','GUNUNG','SAMUDRA','MERDEKA','KELAPA','RUMAH'].map(function(w){return w.slice(0,5);});
    // ensure 5 letter
    words=['MATAH','SAKIT','BULAN','KUCING','HUJAN','PANAS','DINGIN','MAKAN','MINUM','TIDUR'];
    var ans=words[Math.floor(Math.random()*words.length)];
    var row=0, guesses=[];
    function render(msg){
      var html=how('Tebak kata 5 huruf Indonesia. Hijau=benar, kuning=ada di kata tapi posisi salah, abu=tidak ada.')+
        '<div class="g-hud"><span>'+(msg||'Wordle ID')+'</span><button class="g-btn sec" id="rst">Baru</button></div>';
      for(var i=0;i<6;i++){
        html+='<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px;">';
        for(var j=0;j<5;j++){
          var ch=(guesses[i]&&guesses[i][j])||'';
          var bg='#1a2740';
          if(guesses[i]){
            if(ans[j]===guesses[i][j]) bg='#43a047';
            else if(ans.indexOf(guesses[i][j])>=0) bg='#f9a825';
            else bg='#333';
          }
          html+='<div style="width:36px;height:36px;border-radius:6px;background:'+bg+';display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;">'+ch+'</div>';
        }
        html+='</div>';
      }
      html+='<input id="wd" class="form-input" maxlength="5" placeholder="Ketik 5 huruf" style="text-transform:uppercase;text-align:center;font-weight:800;margin-top:8px;">'+
        '<button class="g-btn" id="go" style="width:100%;margin-top:8px;">Tebak</button>';
      show(html);
      document.getElementById('go').onclick=function(){
        var g=(document.getElementById('wd').value||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,5);
        if(g.length<5) return;
        guesses.push(g); row++;
        if(g===ans) render('BENAR! '+ans);
        else if(row>=6) render('Jawaban: '+ans);
        else render();
      };
      document.getElementById('rst').onclick=wordle;
    }
    render();
  }

  /* ===== GUESS NUMBER ===== */
  function guessn() {
    var n=1+Math.floor(Math.random()*100), tries=0;
    show(how('Tebak angka rahasia 1–100. Tiap tebakan dapat petunjuk lebih besar / lebih kecil.')+
      '<div class="g-hud"><span>Percobaan: <b id="tr">0</b></span><button class="g-btn sec" id="rst">Baru</button></div>'+
      '<input type="number" id="gn" class="form-input" placeholder="1–100" min="1" max="100">'+
      '<button class="g-btn" id="go" style="width:100%;margin-top:8px;">Tebak</button>'+
      '<p id="msg" style="text-align:center;margin-top:12px;color:#FFC107;font-weight:700;"></p>');
    document.getElementById('go').onclick=function(){
      var g=parseInt(document.getElementById('gn').value,10); tries++;
      document.getElementById('tr').textContent=tries;
      if(g===n) document.getElementById('msg').textContent='Benar! Angkanya '+n+' dalam '+tries+' tebakan';
      else document.getElementById('msg').textContent=g<n?'Terlalu kecil':'Terlalu besar';
    };
    document.getElementById('rst').onclick=guessn;
  }

  /* ===== HIGHER LOWER ===== */
  function highlow() {
    var cur=1+Math.floor(Math.random()*13), score=0;
    function face(n){ return n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n); }
    function render(msg){
      show(how('Tebak apakah kartu berikutnya lebih tinggi atau lebih rendah. A=1 … K=13.')+
        '<div class="g-hud"><span>Skor: <b>'+score+'</b></span><button class="g-btn sec" id="rst">Baru</button></div>'+
        '<div style="text-align:center;font-size:48px;font-weight:800;color:#FFC107;margin:16px;">'+face(cur)+'</div>'+
        '<p style="text-align:center;color:#8aa0b8;font-size:13px;">'+(msg||'Kartu berikutnya?')+'</p>'+
        '<div style="display:flex;gap:8px;"><button class="g-btn" id="hi" style="flex:1;">Higher</button><button class="g-btn sec" id="lo" style="flex:1;">Lower</button></div>');
      function guess(higher){
        var next=1+Math.floor(Math.random()*13);
        var ok=(higher&&next>=cur)||(!higher&&next<=cur);
        if(ok){ score++; cur=next; render('Benar! Sekarang '+face(cur)); }
        else { render('Salah. Kartu: '+face(next)+' · Skor akhir '+score); score=0; cur=next; }
      }
      document.getElementById('hi').onclick=function(){ guess(true); };
      document.getElementById('lo').onclick=function(){ guess(false); };
      document.getElementById('rst').onclick=highlow;
    }
    render();
  }

  var map = {
    snake: snake, tod: tod, uno: uno, ular: ular, memory: memory, ttt: ttt,
    g2048: g2048, rps: rps, tebak: tebak, hero: hero, pong: pong, mines: mines,
    block: block, chess: chess,
    tetris: tetris, breakout: breakout, flappy: flappy, dino: dino, space: space,
    c4: c4, sudoku: sudoku, watersort: watersort, cookie: cookie, pet: pet,
    stack: stack, wordle: wordle, guessn: guessn, highlow: highlow
  };

  function startGame(id, cat) {
    area = document.getElementById('gameArea');
    panel = document.getElementById('gamePanel'); // optional
    clearTimers();
    if (map[id]) {
      map[id]();
      return;
    }
    // katalog only — halaman sendiri dengan cara main
    var name = (cat && cat.name) || id;
    var howTxt = (cat && cat.how) || 'Game ini masih dalam katalog.';
    if (area) {
      area.innerHTML =
        '<div class="g-how"><b style="color:#FFC107">Cara main:</b> ' + howTxt + '</div>' +
        '<div class="soon-box">' +
          '<div style="font-size:40px;margin-bottom:10px;">🎮</div>' +
          '<p style="color:#fff;font-weight:800;font-size:16px;margin-bottom:8px;">' + name + '</p>' +
          '<p style="color:#8aa0b8;font-size:13px;line-height:1.45;margin-bottom:14px;">Versi interaktif belum dipasang. Cara main sudah tersedia di atas. Game playable ada di tab <b>Bisa main</b> di katalog.</p>' +
          '<a href="game.html" class="g-btn" style="text-decoration:none;display:inline-block;">Kembali ke katalog</a>' +
        '</div>';
    }
  }

  window.NailongGames = { start: startGame, map: map };

  document.addEventListener('DOMContentLoaded', function () {
    area = document.getElementById('gameArea');
    panel = document.getElementById('gamePanel');
    var backBtn = document.getElementById('gameBack');
    if (backBtn) backBtn.onclick = back;
    document.querySelectorAll('.game-card').forEach(function (c) {
      c.onclick = function () {
        var g = c.getAttribute('data-g');
        location.href = 'play.html?id=' + encodeURIComponent(g);
      };
    });
  });
})();
