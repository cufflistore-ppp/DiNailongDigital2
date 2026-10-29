(function () {
  var panel, fields, cv, ctx, mode = '';

  function $(id) { return document.getElementById(id); }
  function val(id) { var el = $(id); return el ? el.value : ''; }

  function open(m) {
    mode = m;
    try { document.title = m.toUpperCase() + ' · Canvas Tools'; } catch(e){}
    panel.classList.add('active');
    $('menu').style.display = 'none';
    try {
      var u = new URL(location.href);
      u.searchParams.set('t', m);
      history.replaceState(null, '', u.pathname + '?t=' + encodeURIComponent(m));
    } catch (e) {}
    var html = '';
    if (m === 'ovo' || m === 'dana') {
      html = '<label>Nominal saldo</label><input id="f_nom" class="form-input" value="1000000" type="text">' +
        '<label>Nama (opsional)</label><input id="f_name" class="form-input" value="Demo User" type="text">';
    } else if (m === 'sertifikat') {
      html = '<label>Nama</label><input id="f_name" class="form-input" value="Nama Contoh" type="text">';
    } else if (m === 'wa') {
      html = '<label>Operator (status bar)</label><select id="f_op" class="form-input"><option>Axis</option><option>Telkomsel</option><option>XL</option><option>Indosat</option><option>Tri</option><option>Smartfren</option></select>' +
        '<label>Jam</label><input id="f_time" class="form-input" value="12.00" type="text">' +
        '<label>Pesan chat</label><input id="f_msg" class="form-input" value="Hai" type="text">' +
        '<label>Nama kontak</label><input id="f_name" class="form-input" value="Teman" type="text">';
    } else if (m === 'ff' || m === 'ml') {
      html = '<label>Nama</label><input id="f_name" class="form-input" value="VyanTools" type="text">' +
        '<label>Rank / teks</label><input id="f_rank" class="form-input" value="' + (m === 'ff' ? 'Stardom' : 'Mythic') + '" type="text">';
    } else if (m === 'quote') {
      html = '<label>Teks</label><textarea id="f_text" class="form-input" rows="3">Hidup itu hanya satu kali, jadi berusahalah menjadi orang yang baik.</textarea>' +
        '<label>Penulis</label><input id="f_name" class="form-input" value="Someone" type="text">';
    } else if (m === 'ssweb') {
      html = '<label>URL website</label><input id="f_url" class="form-input" placeholder="https://..." type="url">' +
        '<p class="warn">SS Web memakai layanan thumbnail publik (bisa gagal jika situs blokir). Ada proses loading dulu.</p>';
    } else if (m === 'preset') {
      html = '<label>Link preset / template</label><input id="f_url" class="form-input" placeholder="https://..." type="url">' +
        '<label>Nama simpan</label><input id="f_name" class="form-input" value="preset-saya" type="text">' +
        '<p class="warn">Mengambil meta (judul/gambar) dari link lalu disimpan lokal sebagai template cepat.</p>';
    } else if (m === 'ktp') {
      html = '<p class="warn">PARODI / DEMO — bukan dokumen resmi. Hasil selalu ber-watermark.</p>' +
        '<label>NIK</label><input id="f_nik" class="form-input" value="0000000000000000" type="text">' +
        '<label>Nama</label><input id="f_name" class="form-input" value="NAMA CONTOH" type="text">' +
        '<label>Tempat/Tgl Lahir</label><input id="f_ttl" class="form-input" value="KOTA CONTOH, 01-01-2000" type="text">' +
        '<label>Jenis Kelamin</label><input id="f_jk" class="form-input" value="LAKI-LAKI" type="text">' +
        '<label>Alamat</label><input id="f_alamat" class="form-input" value="JL. CONTOH NO. 01" type="text">' +
        '<label>RT/RW</label><input id="f_rtrw" class="form-input" value="000/000" type="text">' +
        '<label>Kel/Desa</label><input id="f_kel" class="form-input" value="DESA CONTOH" type="text">' +
        '<label>Kecamatan</label><input id="f_kec" class="form-input" value="KECAMATAN CONTOH" type="text">' +
        '<label>Agama</label><input id="f_agama" class="form-input" value="-" type="text">' +
        '<label>Status</label><input id="f_status" class="form-input" value="-" type="text">' +
        '<label>Pekerjaan</label><input id="f_kerja" class="form-input" value="CONTOH" type="text">' +
        '<label>Foto (opsional)</label><input id="f_file" class="form-input" type="file" accept="image/*">';
    } else if (m === 'tiktok') {
      html = '<label>Nama</label><input id="f_name" class="form-input" value="Nailong Digital" type="text">' +
        '<label>Pesan</label><input id="f_msg" class="form-input" value="Hallo cantik" type="text">' +
        '<label>Foto profil (opsional)</label><input id="f_file" class="form-input" type="file" accept="image/*">';
    }
    fields.innerHTML = html;
    var fileInput = $('f_file');
    if (fileInput) {
      fileInput.onchange = async function () {
        if (!fileInput.files || !fileInput.files[0]) return;
        await NailongCanvas.processOverlay(null, 900);
        await draw();
      };
    }
    draw();
  }

  function close() {
    // selalu balik ke daftar (halaman terpisah feel)
    location.href = 'tools-canvas.html';
  }

  function money(n) {
    n = String(n).replace(/\D/g, '') || '0';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }

  async function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (mode === 'ovo') drawOvo();
    else if (mode === 'dana') drawDana();
    else if (mode === 'sertifikat') drawSert();
    else if (mode === 'wa') drawWa();
    else if (mode === 'ff') drawFf();
    else if (mode === 'ml') drawMl();
    else if (mode === 'quote') drawQuote();
    else if (mode === 'ktp') await drawKtp();
    else if (mode === 'tiktok') await drawTiktok();
    else if (mode === 'ssweb') await drawSsweb();
    else if (mode === 'preset') await drawPreset();
    NailongCanvas.watermark(ctx, cv.width, cv.height);
  }

  function drawOvo() {
    cv.width = 720; cv.height = 1280;
    var g = ctx.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, '#4a1a8a'); g.addColorStop(1, '#2d0f5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 720, 1280);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('OVO', 40, 80);
    round(40, 120, 640, 220, 24, '#5b2d9b');
    ctx.fillStyle = '#e0d0ff'; ctx.font = '18px sans-serif'; ctx.fillText('OVO Cash · Total Saldo', 70, 170);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 42px sans-serif'; ctx.fillText(money(val('f_nom')), 70, 230);
    ctx.fillStyle = '#cbb7ff'; ctx.font = '16px sans-serif'; ctx.fillText(val('f_name') || 'Demo', 70, 280);
    ctx.fillStyle = '#f5f5f7'; round(0, 400, 720, 880, 0, '#f5f5f7');
    ctx.fillStyle = '#333'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('Favorit (DEMO)', 40, 460);
  }

  function drawDana() {
    cv.width = 720; cv.height = 1280;
    var g = ctx.createLinearGradient(0, 0, 0, 360);
    g.addColorStop(0, '#108ee9'); g.addColorStop(1, '#0a6fc2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 720, 1280);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(money(val('f_nom')), 40, 90);
    ctx.font = '16px sans-serif'; ctx.fillText(val('f_name') || 'Demo User', 40, 130);
    ctx.fillStyle = '#fff'; round(24, 280, 672, 400, 20, '#fff');
    ctx.fillStyle = '#333'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('Menu cepat (DEMO)', 50, 320);
  }

  function drawSert() {
    cv.width = 900; cv.height = 500;
    ctx.fillStyle = '#1a0a12'; ctx.fillRect(0, 0, 900, 500);
    // stripes
    for (var i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? '#3a1020' : '#2a0c18';
      ctx.beginPath(); ctx.moveTo(i * 90 - 40, 0); ctx.lineTo(i * 90 + 40, 0); ctx.lineTo(i * 90 - 40, 500); ctx.lineTo(i * 90 - 120, 500); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT INI MENYATAKAN BAHWA', 450, 120);
    ctx.font = 'bold 36px sans-serif'; ctx.fillText(val('f_name') || 'Nama Contoh', 450, 190);
    ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 40px Impact, sans-serif';
    ctx.fillText('TERBUKTI TOLOL', 450, 280);
    ctx.fillStyle = '#ddd'; ctx.font = '20px sans-serif'; ctx.fillText('DAN TAK BEROTAK  (PARODI)', 450, 330);
    ctx.textAlign = 'left';
  }

  function drawWa() {
    cv.width = 720; cv.height = 1280;
    ctx.fillStyle = '#0b141a'; ctx.fillRect(0, 0, 720, 1280);
    // status bar
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 720, 56);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText(val('f_op') || 'Axis', 24, 36);
    ctx.fillText(val('f_time') || '12.00', 320, 36);
    ctx.fillText('100%', 640, 36);
    // header
    ctx.fillStyle = '#1f2c34'; ctx.fillRect(0, 56, 720, 90);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(val('f_name') || 'Teman', 100, 110);
    // chat bubble
    round(24, 200, 200, 70, 16, '#1f2c34');
    ctx.fillStyle = '#e9edef'; ctx.font = '22px sans-serif'; ctx.fillText(val('f_msg') || 'Hai', 44, 244);
    ctx.fillStyle = '#8696a0'; ctx.font = '14px sans-serif'; ctx.fillText(val('f_time') || '12.00', 44, 260);
  }

  function drawFf() {
    cv.width = 720; cv.height = 1280;
    var g = ctx.createLinearGradient(0, 0, 0, 1280);
    g.addColorStop(0, '#061428'); g.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 720, 1280);
    ctx.strokeStyle = '#3dbbff'; ctx.lineWidth = 4;
    round(180, 120, 360, 700, 20, 'rgba(10,30,60,0.8)');
    ctx.strokeRect(180, 120, 360, 700);
    ctx.fillStyle = '#7cffb2'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('3 ンス', 360, 180);
    ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText(val('f_rank') || 'STARDOM', 360, 230);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif';
    ctx.fillText(val('f_name') || 'Player', 360, 420);
    ctx.fillStyle = '#9ec9ff'; ctx.font = '16px sans-serif';
    ctx.fillText('DEMO CARD · FREE FIRE STYLE', 360, 470);
    ctx.textAlign = 'left';
  }

  function drawMl() {
    cv.width = 720; cv.height = 1280;
    ctx.fillStyle = '#0a0e18'; ctx.fillRect(0, 0, 720, 1280);
    // character panel vibe
    var g = ctx.createLinearGradient(0, 200, 720, 900);
    g.addColorStop(0, '#1a237e'); g.addColorStop(1, '#4a148c');
    ctx.fillStyle = g; ctx.fillRect(0, 200, 720, 700);
    ctx.fillStyle = '#ffd54f'; round(120, 980, 480, 70, 12, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(val('f_name') || 'Player', 360, 1025);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    ctx.fillText((val('f_rank') || 'Mythic') + ' · DEMO ML', 360, 1080);
    ctx.textAlign = 'left';
  }

  function drawQuote() {
    cv.width = 900; cv.height = 900;
    ctx.fillStyle = '#e8e4dc'; ctx.fillRect(0, 0, 900, 900);
    ctx.fillStyle = '#222'; ctx.font = 'italic 36px Georgia, serif'; ctx.textAlign = 'center';
    wrapText(val('f_text') || 'Quote…', 450, 320, 700, 48);
    ctx.font = '20px sans-serif'; ctx.fillStyle = '#666';
    ctx.fillText('— ' + (val('f_name') || 'Someone'), 450, 700);
    ctx.textAlign = 'left';
  }


  async function drawKtp() {
    cv.width = 1011; cv.height = 638;
    // light blue card
    var g = ctx.createLinearGradient(0, 0, 1011, 638);
    g.addColorStop(0, '#b8d4ea'); g.addColorStop(1, '#9ec4e0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1011, 638);
    // soft circles
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(200, 100, 80, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(850, 500, 100, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#0d47a1'; ctx.font = 'bold 26px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PROVINSI PROVINSI DEMO', 505, 48);
    ctx.fillText('KABUPATEN/KOTA KOTA DEMO', 505, 80);
    ctx.textAlign = 'left';

    function row(label, value, y) {
      ctx.fillStyle = '#111'; ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(label, 40, y);
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(':  ' + (value || '-'), 220, y);
    }

    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('NIK', 40, 130);
    ctx.fillText(':  ' + (val('f_nik') || '0000000000000000'), 220, 130);

    var y0 = 170;
    var gap = 32;
    row('Nama', (val('f_name') || 'NAMA CONTOH').toUpperCase(), y0);
    row('Tempat/Tgl Lahir', val('f_ttl') || 'KOTA CONTOH, 01-01-2000', y0 + gap);
    row('Jenis Kelamin', (val('f_jk') || 'LAKI-LAKI') + '    GOL. DARAH : -', y0 + gap * 2);
    row('Alamat', val('f_alamat') || 'JL. CONTOH NO. 01', y0 + gap * 3);
    row('RT/RW', val('f_rtrw') || '000/000', y0 + gap * 4);
    row('Kel/Desa', val('f_kel') || 'DESA CONTOH', y0 + gap * 5);
    row('Kecamatan', val('f_kec') || 'KECAMATAN CONTOH', y0 + gap * 6);
    row('Agama', val('f_agama') || '-', y0 + gap * 7);
    row('Status Perkawinan', val('f_status') || '-', y0 + gap * 8);
    row('Pekerjaan', val('f_kerja') || 'CONTOH', y0 + gap * 9);
    row('Kewarganegaraan', 'WNI', y0 + gap * 10);
    row('Berlaku Hingga', 'DEMO', y0 + gap * 11);

    // photo box — fixed size, image fit cover
    var px = 780, py = 120, pw = 180, ph = 220;
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 4, py - 4, pw + 8, ph + 8);
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(px, py, pw, ph);

    var file = $('f_file') && $('f_file').files && $('f_file').files[0];
    if (file) {
      try {
        var img = await NailongCanvas.loadImage(file);
        NailongCanvas.fitImage(ctx, img, px, py, pw, ph);
      } catch (e) {
        ctx.fillStyle = '#90a4ae';
        ctx.beginPath(); ctx.arc(px + pw / 2, py + 80, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(px + 40, py + 130, 100, 70);
      }
    } else {
      // placeholder silhouette
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath(); ctx.arc(px + pw / 2, py + 80, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px + 40, py + 130, 100, 70);
    }

    ctx.fillStyle = '#0d47a1'; ctx.font = 'bold 16px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('KOTA DEMO', px + pw / 2, py + ph + 36);
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('KOTA DEMO, 01-01-2026', px + pw / 2, py + ph + 58);
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('DEMO', px + pw / 2, py + ph + 88);
    ctx.textAlign = 'left';

    // big diagonal parody stamp (selain watermark global)
    ctx.save();
    ctx.translate(505, 340);
    ctx.rotate(-0.4);
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillStyle = 'rgba(200,0,0,0.28)';
    ctx.textAlign = 'center';
    ctx.fillText('PARODI — BUKAN DOKUMEN RESMI', 0, 0);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  async function drawTiktok() {
    cv.width = 720; cv.height = 1280;
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(0, 0, 720, 1280);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 720, 100);
    ctx.fillStyle = '#111'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(val('f_name') || 'Chat', 100, 60);
    // bubble
    round(100, 200, 320, 64, 20, '#fff');
    ctx.fillStyle = '#111'; ctx.font = '20px sans-serif'; ctx.fillText(val('f_msg') || 'Halo', 120, 240);
    var file = $('f_file') && $('f_file').files && $('f_file').files[0];
    if (file) {
      try {
        var img = await NailongCanvas.loadImage(file);
        ctx.beginPath(); ctx.arc(50, 200, 28, 0, Math.PI * 2); ctx.closePath();
        NailongCanvas.fitImage(ctx, img, 22, 172, 56, 56);
      } catch (e) {}
    } else {
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(50, 200, 28, 0, Math.PI * 2); ctx.fill();
    }
  }

  async function drawSsweb() {
    cv.width = 720; cv.height = 1280;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 720, 1280);
    var url = val('f_url');
    if (!url) {
      ctx.fillStyle = '#888'; ctx.font = '20px sans-serif'; ctx.fillText('Isi URL dulu', 40, 80);
      return;
    }
    await NailongCanvas.processOverlay(null, 1200);
    // public screenshot thumbnail services (best-effort)
    var thumb = 'https://image.thum.io/get/width/720/crop/1280/' + encodeURIComponent(url);
    try {
      var img = await NailongCanvas.loadImage(thumb);
      ctx.drawImage(img, 0, 0, 720, 1280);
    } catch (e) {
      ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
      ctx.fillText('Gagal ambil preview. Coba URL lain.', 40, 80);
      ctx.fillText(url.slice(0, 50), 40, 120);
    }
  }

  async function drawPreset() {
    cv.width = 720; cv.height = 900;
    ctx.fillStyle = '#0d1220'; ctx.fillRect(0, 0, 720, 900);
    var url = val('f_url');
    ctx.fillStyle = '#FFC107'; ctx.font = 'bold 22px sans-serif'; ctx.fillText('Preset dari link', 40, 60);
    if (!url) {
      ctx.fillStyle = '#8aa0b8'; ctx.fillText('Tempel link template…', 40, 120);
      return;
    }
    await NailongCanvas.processOverlay(null, 800);
    var name = val('f_name') || 'preset';
    try {
      var list = JSON.parse(localStorage.getItem('nd_presets') || '[]');
      list.unshift({ name: name, url: url, at: Date.now() });
      localStorage.setItem('nd_presets', JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
    ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
    ctx.fillText(name, 40, 140);
    ctx.fillStyle = '#8aa0b8'; ctx.font = '16px sans-serif';
    wrapText(url, 360, 200, 640, 24);
    ctx.fillStyle = '#69f0ae'; ctx.font = '18px sans-serif';
    ctx.fillText('Tersimpan di perangkat (local)', 40, 400);
  }

  function wrapText(text, x, y, maxW, lineH) {
    var words = String(text).split(/\s+/), line = '';
    ctx.textAlign = 'center';
    for (var n = 0; n < words.length; n++) {
      var test = line + words[n] + ' ';
      if (ctx.measureText(test).width > maxW && n > 0) {
        ctx.fillText(line, x, y); line = words[n] + ' '; y += lineH;
      } else line = test;
    }
    ctx.fillText(line, x, y);
    ctx.textAlign = 'left';
  }

  function round(x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  document.addEventListener('DOMContentLoaded', function () {
    panel = $('panel'); fields = $('fields'); cv = $('cv'); ctx = cv.getContext('2d');
    document.querySelectorAll('.tc-card').forEach(function (c) {
      c.onclick = function () {
        var t = c.getAttribute('data-t');
        location.href = 'tools-canvas.html?t=' + encodeURIComponent(t);
      };
    });
    var qt = new URLSearchParams(location.search).get('t');
    if (qt) open(qt);
    $('back').onclick = close;
    $('btnGen').onclick = async function () {
      await NailongCanvas.processOverlay(null, 700);
      await draw();
    };
    $('btnDl').onclick = function () {
      NailongCanvas.download(cv, 'nailong-' + (mode || 'canvas') + '.png');
    };
  });
})();
