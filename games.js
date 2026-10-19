(function () {
  var area = null;
  var panel = null;
  function show(html) {
    panel.classList.add('active');
    document.getElementById('gameMenu').style.display = 'none';
    area.innerHTML = html;
  }
  function back() {
    panel.classList.remove('active');
    document.getElementById('gameMenu').style.display = 'grid';
    area.innerHTML = '';
  }

  // ===== CHESS (simplified) =====
  var pieces = {
    wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',
    bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'
  };
  function startChess(mode) {
    // mode: bot | local
    var board = [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ];
    var turn = 'w';
    var sel = null;
    function draw() {
      var html = '<p style="text-align:center;color:#8aa0b8;font-size:12px;">Mode: '+(mode==='bot'?'Lawan Bot':'2 pemain 1 HP')+' · Giliran: <b style="color:#FFC107">'+(turn==='w'?'Putih':'Hitam')+'</b></p>';
      html += '<div class="chess-board">';
      for (var r=0;r<8;r++) for (var c=0;c<8;c++) {
        var light = (r+c)%2===0;
        var p = board[r][c];
        var cls = 'chess-cell '+(light?'light':'dark');
        if (sel && sel.r===r && sel.c===c) cls += ' sel';
        html += '<div class="'+cls+'" data-r="'+r+'" data-c="'+c+'">'+(p?pieces[p]:'')+'</div>';
      }
      html += '</div><p style="text-align:center;font-size:11px;color:#6b7a90;margin-top:8px;">Tap bidak lalu kotak tujuan. Catur sederhana (tanpa cek aturan penuh).</p>';
      area.innerHTML = html;
      area.querySelectorAll('.chess-cell').forEach(function(cell){
        cell.onclick = function(){
          var r = +cell.getAttribute('data-r'), c = +cell.getAttribute('data-c');
          var p = board[r][c];
          if (sel) {
            if (sel.r===r && sel.c===c) { sel=null; draw(); return; }
            var moving = board[sel.r][sel.c];
            if (moving && moving.charAt(0)===turn) {
              board[r][c] = moving;
              board[sel.r][sel.c] = null;
              turn = turn==='w'?'b':'w';
              sel = null;
              draw();
              if (mode==='bot' && turn==='b') setTimeout(botMove, 400);
              return;
            }
          }
          if (p && p.charAt(0)===turn) { sel={r:r,c:c}; draw(); }
        };
      });
    }
    function botMove() {
      var moves = [];
      for (var r=0;r<8;r++) for (var c=0;c<8;c++) {
        if (board[r][c] && board[r][c].charAt(0)==='b') {
          for (var tr=0;tr<8;tr++) for (var tc=0;tc<8;tc++) {
            if (!board[tr][tc] || board[tr][tc].charAt(0)==='w')
              moves.push({fr:r,fc:c,tr:tr,tc:tc});
          }
        }
      }
      if (!moves.length) return;
      var m = moves[Math.floor(Math.random()*moves.length)];
      board[m.tr][m.tc] = board[m.fr][m.fc];
      board[m.fr][m.fc] = null;
      turn = 'w';
      draw();
    }
    show('');
    draw();
  }

  // ===== BLOCK BLAST =====
  function startBlast() {
    var last = parseInt(localStorage.getItem('nd_blast_last')||'0',10);
    var best = parseInt(localStorage.getItem('nd_blast_best')||'0',10);
    var score = 0;
    var grid = [];
    for (var i=0;i<64;i++) grid.push(Math.random()>0.7 ? (1+Math.floor(Math.random()*4)) : 0);
    var colors = ['','#FFC107','#69f0ae','#40c4ff','#ff8a80','#ce93d8'];
    function save() {
      localStorage.setItem('nd_blast_last', String(score));
      if (score > best) { best = score; localStorage.setItem('nd_blast_best', String(best)); }
    }
    function draw() {
      var html = '<div style="text-align:center;margin-bottom:10px;color:#cfd8dc;font-size:13px;">Skor: <b style="color:#FFC107">'+score+'</b> · Terakhir: '+last+' · Best: '+best+'</div>';
      html += '<div class="bb-grid">';
      for (var i=0;i<64;i++) {
        html += '<div class="bb-cell" data-i="'+i+'" style="background:'+(grid[i]?colors[grid[i]]:'#1a2740')+'"></div>';
      }
      html += '</div><p style="text-align:center;font-size:11px;color:#8aa0b8;margin-top:8px;">Tap blok sewarna yang nyambung untuk hancurkan.</p>';
      html += '<button type="button" class="btn-pesan" id="bbReset" style="width:100%;margin-top:10px;">Reset papan</button>';
      area.innerHTML = html;
      area.querySelectorAll('.bb-cell').forEach(function(cell){
        cell.onclick = function(){
          var i = +cell.getAttribute('data-i');
          var col = grid[i];
          if (!col) return;
          var stack = [i], seen = {}, list = [];
          while (stack.length) {
            var x = stack.pop();
            if (seen[x] || grid[x]!==col) continue;
            seen[x]=1; list.push(x);
            var r=Math.floor(x/8), c=x%8;
            if (c>0) stack.push(x-1);
            if (c<7) stack.push(x+1);
            if (r>0) stack.push(x-8);
            if (r<7) stack.push(x+8);
          }
          if (list.length < 2) return;
          list.forEach(function(x){ grid[x]=0; });
          score += list.length * list.length;
          save();
          draw();
        };
      });
      document.getElementById('bbReset').onclick = function(){
        for (var i=0;i<64;i++) grid[i]=Math.random()>0.7?(1+Math.floor(Math.random()*4)):0;
        draw();
      };
    }
    show('');
    draw();
  }

  // ===== TEBAK KATA =====
  function startKata() {
    var words = ['NAILONG','DIGITAL','WHATSAPP','JOKI','TOKO','SALDO','ANIME','KOMIK','CATUR','BLAST','PAIRING','CHANNEL'];
    var word = words[Math.floor(Math.random()*words.length)];
    var hide = word.split('').map(function(ch,i){ return i%2===0 ? ch : '_'; }).join(' ');
    show(
      '<p style="text-align:center;color:#8aa0b8;font-size:12px;">Tebak kata Indonesia / tema Nailong</p>'+
      '<div style="text-align:center;font-size:28px;letter-spacing:4px;color:#FFC107;margin:16px 0;font-weight:800;">'+hide+'</div>'+
      '<input type="text" id="kataIn" class="form-input" placeholder="Ketik jawaban" autocomplete="off">'+
      '<button type="button" class="btn-pesan" id="kataCek" style="width:100%;margin-top:10px;">Cek</button>'+
      '<p id="kataMsg" style="text-align:center;margin-top:10px;font-size:13px;"></p>'
    );
    document.getElementById('kataCek').onclick = function(){
      var v = (document.getElementById('kataIn').value||'').trim().toUpperCase();
      var msg = document.getElementById('kataMsg');
      if (v === word) msg.innerHTML = '<span style="color:#69f0ae">Benar! '+word+'</span>';
      else msg.innerHTML = '<span style="color:#ff8a80">Salah, coba lagi</span>';
    };
  }

  // ===== QUIZ HERO (gambar dari web) =====
  var QUIZ = {
    ff: [
      { name:'Alok', img:'https://static.wikia.nocookie.net/freefire/images/8/8e/Alok.png' },
      { name:'Chrono', img:'https://static.wikia.nocookie.net/freefire/images/3/3a/Chrono.png' },
      { name:'Kelly', img:'https://static.wikia.nocookie.net/freefire/images/4/4e/Kelly.png' },
      { name:'Hayato', img:'https://static.wikia.nocookie.net/freefire/images/9/9a/Hayato.png' }
    ],
    ml: [
      { name:'Fanny', img:'https://static.wikia.nocookie.net/mobile-legends/images/f/f9/Hero011-portrait.png' },
      { name:'Gusion', img:'https://static.wikia.nocookie.net/mobile-legends/images/0/0a/Hero071-portrait.png' },
      { name:'Lancelot', img:'https://static.wikia.nocookie.net/mobile-legends/images/5/5e/Hero057-portrait.png' },
      { name:'Kagura', img:'https://static.wikia.nocookie.net/mobile-legends/images/8/8e/Hero032-portrait.png' }
    ],
    pubg: [
      { name:'M416', img:'https://static.wikia.nocookie.net/pubg/images/8/8e/Icon_weapon_M416.png' },
      { name:'AKM', img:'https://static.wikia.nocookie.net/pubg/images/8/8a/Icon_weapon_AKM.png' },
      { name:'AWM', img:'https://static.wikia.nocookie.net/pubg/images/2/2a/Icon_weapon_AWM.png' },
      { name:'UMP45', img:'https://static.wikia.nocookie.net/pubg/images/4/4e/Icon_weapon_UMP45.png' }
    ]
  };
  function startQuiz(type) {
    var pool = QUIZ[type] || QUIZ.ff;
    var item = pool[Math.floor(Math.random()*pool.length)];
    var opts = pool.map(function(x){ return x.name; }).sort(function(){ return Math.random()-0.5; });
    show(
      '<p style="text-align:center;color:#8aa0b8;font-size:12px;">Gambar dari web · tebak namanya</p>'+
      '<img class="quiz-img" src="'+item.img+'" alt="quiz" onerror="this.src=\'https://via.placeholder.com/300x180?text=Gambar+Web\'">'+
      '<div class="quiz-opts" id="qOpts"></div><p id="qMsg" style="text-align:center;margin-top:10px;"></p>'
    );
    var box = document.getElementById('qOpts');
    opts.forEach(function(name){
      var b = document.createElement('button');
      b.type='button'; b.textContent = name;
      b.onclick = function(){
        var msg = document.getElementById('qMsg');
        if (name === item.name) msg.innerHTML = '<span style="color:#69f0ae">Benar! '+item.name+'</span>';
        else msg.innerHTML = '<span style="color:#ff8a80">Salah. Jawaban: '+item.name+'</span>';
      };
      box.appendChild(b);
    });
  }

  function startAngka() {
    var n = 1 + Math.floor(Math.random()*100);
    show(
      '<p style="text-align:center;color:#8aa0b8;">Tebak angka 1–100</p>'+
      '<input type="number" id="angIn" class="form-input" min="1" max="100" placeholder="Angka">'+
      '<button type="button" class="btn-pesan" id="angCek" style="width:100%;margin-top:10px;">Cek</button>'+
      '<p id="angMsg" style="text-align:center;margin-top:10px;"></p>'
    );
    document.getElementById('angCek').onclick = function(){
      var v = parseInt(document.getElementById('angIn').value,10);
      var msg = document.getElementById('angMsg');
      if (v===n) msg.innerHTML='<span style="color:#69f0ae">Benar! '+n+'</span>';
      else if (v<n) msg.textContent='Terlalu kecil';
      else msg.textContent='Terlalu besar';
    };
  }

  function startMemory() {
    var icons = ['🎮','🔥','⭐','💎','🚀','🐱','🎯','⚡'];
    var cards = icons.concat(icons).sort(function(){ return Math.random()-0.5; });
    var open = [], done = {}, moves = 0;
    function draw() {
      var html = '<p style="text-align:center;color:#8aa0b8;font-size:12px;">Gerakan: '+moves+'</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
      cards.forEach(function(ic,i){
        var showC = done[i] || open.indexOf(i)>=0;
        html += '<div data-i="'+i+'" style="aspect-ratio:1;border-radius:10px;background:#1a2740;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;border:1px solid rgba(255,193,7,0.2);">'+(showC?ic:'❓')+'</div>';
      });
      html += '</div>';
      area.innerHTML = html;
      area.querySelectorAll('[data-i]').forEach(function(el){
        el.onclick = function(){
          var i = +el.getAttribute('data-i');
          if (done[i] || open.indexOf(i)>=0) return;
          open.push(i);
          if (open.length===2) {
            moves++;
            if (cards[open[0]]===cards[open[1]]) { done[open[0]]=1; done[open[1]]=1; open=[]; }
            else { var keep=open.slice(); open=[]; setTimeout(function(){ draw(); }, 500); return; }
          }
          draw();
        };
      });
    }
    show('');
    draw();
  }

  document.addEventListener('DOMContentLoaded', function(){
    area = document.getElementById('gameArea');
    panel = document.getElementById('panel');
    document.getElementById('btnBack').onclick = back;
    document.querySelectorAll('.game-card').forEach(function(c){
      c.onclick = function(){
        var g = c.getAttribute('data-g');
        if (g==='chess') {
          show('<div style="display:flex;gap:8px;flex-direction:column;">'+
            '<button type="button" class="btn-pesan" id="chBot">Lawan Bot</button>'+
            '<button type="button" class="btn-topup" id="chLocal">2 Pemain (1 HP)</button>'+
            '<p style="font-size:11px;color:#8aa0b8;">Cari lawan online butuh server realtime — sementara bot &amp; lokal.</p></div>');
          document.getElementById('chBot').onclick = function(){ startChess('bot'); };
          document.getElementById('chLocal').onclick = function(){ startChess('local'); };
        }
        else if (g==='blast') startBlast();
        else if (g==='kata') startKata();
        else if (g==='ff') startQuiz('ff');
        else if (g==='ml') startQuiz('ml');
        else if (g==='pubg') startQuiz('pubg');
        else if (g==='angka') startAngka();
        else if (g==='memory') startMemory();
      };
    });
  });
})();
