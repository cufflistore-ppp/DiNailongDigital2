/**
 * Nailong Canvas API — siap pakai di tools
 * window.NailongCanvas.export(canvas, filename)
 * window.NailongCanvas.loadImage(file|url) → Promise<HTMLImageElement>
 * window.NailongCanvas.roundRect / fitImage / watermark / download
 */
(function () {
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      if (src instanceof HTMLImageElement) return resolve(src);
      if (src instanceof File || src instanceof Blob) {
        var url = URL.createObjectURL(src);
        var img = new Image();
        img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = reject;
        img.src = url;
        return;
      }
      var img2 = new Image();
      img2.crossOrigin = 'anonymous';
      img2.onload = function () { resolve(img2); };
      img2.onerror = reject;
      img2.src = String(src);
    });
  }

  function fitImage(ctx, img, x, y, w, h) {
    var ir = img.width / img.height, br = w / h;
    var dw, dh, dx, dy;
    if (ir > br) { dh = h; dw = h * ir; dx = x - (dw - w) / 2; dy = y; }
    else { dw = w; dh = w / ir; dx = x; dy = y - (dh - h) / 2; }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function watermark(ctx, w, h, text) {
    text = text || 'DEMO / PARODI';
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.35);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = 'rgba(255,0,0,0.18)';
    ctx.textAlign = 'center';
    for (var i = -2; i <= 2; i++) {
      ctx.fillText(text, 0, i * 48);
    }
    ctx.restore();
  }

  function download(canvas, filename) {
    filename = filename || 'nailong-canvas.png';
    var a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
  }

  function processOverlay(parent, ms) {
    ms = ms || 900;
    return new Promise(function (resolve) {
      var el = document.createElement('div');
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;';
      el.innerHTML = '<div style="text-align:center">' +
        '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;">' +
        '<i style="width:8px;height:8px;border-radius:50%;background:#FFC107;display:inline-block;animation:ndP 0.8s ease infinite"></i>' +
        '<i style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;animation:ndP 0.8s ease 0.2s infinite"></i>' +
        '</div>Memproses foto / gambar…</div>';
      if (!document.getElementById('ndProcessAnim')) {
        var st = document.createElement('style');
        st.id = 'ndProcessAnim';
        st.textContent = '@keyframes ndP{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}';
        document.head.appendChild(st);
      }
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); resolve(); }, ms);
    });
  }

  window.NailongCanvas = {
    loadImage: loadImage,
    fitImage: fitImage,
    watermark: watermark,
    download: download,
    processOverlay: processOverlay,
    export: download
  };
})();
