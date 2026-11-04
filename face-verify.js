/**
 * Verifikasi muka (mirip alur premium e-wallet):
 * kamera depan, cek terang/gelap, wajah di frame, ambil foto.
 */
(function () {
  function createUI(host) {
    var wrap = document.createElement('div');
    wrap.id = 'ndFaceVerify';
    wrap.innerHTML = `
      <div style="background:rgba(12,16,28,0.98);border:1px solid rgba(255,193,7,0.25);border-radius:18px;padding:14px;margin:12px 0;">
        <h3 style="margin:0 0 8px;color:#FFC107;font-size:14px;"><i class="fa-solid fa-camera"></i> Verifikasi muka</h3>
        <p style="margin:0 0 10px;font-size:12px;color:#8aa0b8;line-height:1.45;">Arahkan wajah ke kamera. Pastikan ruangan cukup terang dan wajah penuh di dalam bingkai.</p>
        <div style="position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:3/4;max-height:360px;">
          <video id="ndFaceVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;"></video>
          <canvas id="ndFaceCanvas" style="display:none;"></canvas>
          <div id="ndFaceOval" style="position:absolute;inset:12% 18%;border:3px solid rgba(255,193,7,0.75);border-radius:50%;box-shadow:0 0 0 999px rgba(0,0,0,0.35);pointer-events:none;"></div>
          <div id="ndFaceStatus" style="position:absolute;left:0;right:0;bottom:0;padding:10px;background:linear-gradient(transparent,rgba(0,0,0,.85));color:#fff;font-size:12px;font-weight:700;text-align:center;">Menyalakan kamera…</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button type="button" id="ndFaceCapture" class="btn-pesan" style="flex:1;" disabled><i class="fa-solid fa-camera"></i> Ambil foto</button>
          <button type="button" id="ndFaceRetake" class="btn-topup" style="flex:1;display:none;"><i class="fa-solid fa-rotate"></i> Ulangi</button>
        </div>
        <img id="ndFacePreview" alt="" style="display:none;width:100%;max-height:180px;object-fit:contain;border-radius:12px;margin-top:10px;border:1px solid rgba(255,193,7,0.2);">
      </div>`;
    host.appendChild(wrap);
    return wrap;
  }

  function brightnessFromCanvas(ctx, w, h) {
    try {
      var data = ctx.getImageData(0, 0, w, h).data;
      var sum = 0, n = 0;
      // sample every 8th pixel
      for (var i = 0; i < data.length; i += 32) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        n++;
      }
      return n ? sum / n : 0;
    } catch (e) {
      return 128;
    }
  }

  async function start(hostSelector, onCapture) {
    var host = typeof hostSelector === 'string' ? document.querySelector(hostSelector) : hostSelector;
    if (!host) return null;
    if (document.getElementById('ndFaceVerify')) {
      // already
    } else createUI(host);

    var video = document.getElementById('ndFaceVideo');
    var canvas = document.getElementById('ndFaceCanvas');
    var status = document.getElementById('ndFaceStatus');
    var btnCap = document.getElementById('ndFaceCapture');
    var btnRet = document.getElementById('ndFaceRetake');
    var preview = document.getElementById('ndFacePreview');
    var stream = null;
    var timer = null;
    var okBright = false;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      status.textContent = 'Posisikan wajah di dalam oval';
    } catch (e) {
      status.textContent = 'Kamera tidak bisa dibuka. Izinkan akses kamera di browser.';
      status.style.color = '#f87171';
      return null;
    }

    function loop() {
      if (!video.videoWidth) return;
      var w = 160, h = 120;
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      var bright = brightnessFromCanvas(ctx, w, h);
      if (bright < 45) {
        status.textContent = 'Terlalu gelap — nyalakan lampu / cari tempat lebih terang';
        status.style.color = '#fbbf24';
        okBright = false;
        btnCap.disabled = true;
      } else if (bright > 230) {
        status.textContent = 'Terlalu silau — hindari cahaya langsung ke kamera';
        status.style.color = '#fbbf24';
        okBright = false;
        btnCap.disabled = true;
      } else {
        status.textContent = 'Pencahayaan oke — tahan wajah di oval, lalu ambil foto';
        status.style.color = '#86efac';
        okBright = true;
        btnCap.disabled = false;
      }
    }
    timer = setInterval(loop, 500);

    btnCap.onclick = function () {
      if (!okBright) return;
      var w = video.videoWidth || 720;
      var h = video.videoHeight || 960;
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      // watermark ringan
      ctx.fillStyle = 'rgba(255,193,7,0.85)';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('NAILONG VERIFY · ' + new Date().toLocaleString('id-ID'), 16, h - 20);
      var data = canvas.toDataURL('image/jpeg', 0.85);
      preview.src = data;
      preview.style.display = 'block';
      btnRet.style.display = 'block';
      btnCap.style.display = 'none';
      status.textContent = 'Foto tersimpan — lanjutkan formulir';
      status.style.color = '#86efac';
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      clearInterval(timer);
      video.style.opacity = '0.3';
      if (typeof onCapture === 'function') onCapture(data);
    };
    btnRet.onclick = function () {
      preview.style.display = 'none';
      btnRet.style.display = 'none';
      btnCap.style.display = 'block';
      video.style.opacity = '1';
      start(host, onCapture);
    };

    return {
      stop: function () {
        clearInterval(timer);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      }
    };
  }

  window.NailongFaceVerify = { start: start };
})();
