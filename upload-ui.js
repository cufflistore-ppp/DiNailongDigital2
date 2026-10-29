/**
 * Rapikan semua input type=file → kartu upload modern.
 * Skip jika sudah .nd-upload / data-nd-skip
 */
(function () {
  function enhance(input) {
    if (!input || input.tagName !== 'INPUT' || input.type !== 'file') return;
    if (input.dataset.ndUi === '1') return;
    if (input.closest('.nd-upload') || input.closest('label.nd-upload')) return;
    input.dataset.ndUi = '1';

    var accept = (input.getAttribute('accept') || '').toLowerCase();
    var isVid = accept.indexOf('video') >= 0;
    var isImg = accept.indexOf('image') >= 0 || !accept;
    var multi = input.multiple;

    var wrap = document.createElement('label');
    wrap.className = 'nd-upload nd-upload-auto';
    wrap.innerHTML =
      '<i class="fa-solid ' + (isVid && !isImg ? 'fa-video' : 'fa-cloud-arrow-up') + '"></i>' +
      '<b>' + (multi ? 'Pilih file dari galeri' : (isVid && isImg ? 'Foto / video' : isVid ? 'Pilih video' : 'Pilih foto')) + '</b>' +
      '<span>Ketuk untuk buka galeri' + (multi ? ' (bisa banyak)' : '') + '</span>' +
      '<div class="nd-upload-preview" style="display:none;margin-top:10px;width:100%;"></div>';

    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.style.display = 'none';

    var prev = wrap.querySelector('.nd-upload-preview');
    var title = wrap.querySelector('b');

    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) {
        prev.style.display = 'none';
        prev.innerHTML = '';
        title.textContent = multi ? 'Pilih file dari galeri' : 'Pilih dari galeri';
        return;
      }
      title.textContent = files.length + ' file dipilih';
      prev.style.display = 'flex';
      prev.style.flexWrap = 'wrap';
      prev.style.gap = '8px';
      prev.style.justifyContent = 'center';
      prev.innerHTML = '';
      files.slice(0, 6).forEach(function (f) {
        if (f.type.indexOf('image/') === 0) {
          var url = URL.createObjectURL(f);
          var img = document.createElement('img');
          img.src = url;
          img.alt = '';
          img.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:10px;';
          prev.appendChild(img);
        } else if (f.type.indexOf('video/') === 0) {
          var v = document.createElement('div');
          v.style.cssText = 'width:72px;height:72px;border-radius:10px;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:var(--nd-accent,#c9a227);font-size:20px;';
          v.innerHTML = '<i class="fa-solid fa-film"></i>';
          prev.appendChild(v);
        } else {
          var d = document.createElement('div');
          d.style.cssText = 'font-size:11px;color:var(--nd-muted,#8aa0b8);padding:6px 10px;background:rgba(255,255,255,0.06);border-radius:8px;';
          d.textContent = f.name.slice(0, 18);
          prev.appendChild(d);
        }
      });
    });
  }

  function scan() {
    document.querySelectorAll('input[type="file"]').forEach(enhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      scan();
      setTimeout(scan, 800);
      setTimeout(scan, 2000);
    });
  } else {
    scan();
    setTimeout(scan, 500);
  }

  // observe dynamic forms
  try {
    var mo = new MutationObserver(function () { scan(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  window.NailongUploadUI = { enhance: enhance, scan: scan };
})();
