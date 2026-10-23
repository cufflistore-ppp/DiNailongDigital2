(function () {
  function el(id) { return document.getElementById(id); }
  function fmt(ts) {
    try { return new Date(ts).toLocaleString('id-ID'); } catch (e) { return '-'; }
  }
  function badge(st) {
    var c = { pending: '#FFC107', deploying: '#4fc3f7', live: '#69f0ae', failed: '#ff8a80' }[st] || '#aaa';
    return '<span style="background:' + c + '22;color:' + c + ';padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;">' + (st || '-') + '</span>';
  }
  function render(list) {
    var box = el('listDeploy');
    if (!box) return;
    if (el('cntDeploy')) {
      el('cntDeploy').style.display = list.length ? 'inline' : 'none';
      el('cntDeploy').textContent = list.length;
    }
    if (!list.length) {
      box.innerHTML = '<div class="empty-state"><i class="fa-solid fa-cloud"></i>Belum ada request deploy</div>';
      return;
    }
    box.innerHTML = list.map(function (r) {
      return (
        '<div class="order-card" style="margin-bottom:12px;">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">' +
            '<b style="color:#FFC107;">' + (r.name || '-') + '</b>' + badge(r.status) +
          '</div>' +
          '<div style="font-size:12px;color:#aaa;margin-top:6px;">' +
            'ID: ' + (r.id || '-') + '<br>' +
            'Platform: <b>' + (r.platform || '-') + '</b><br>' +
            'User: ' + (r.userName || '-') + ' ' + (r.userEmail ? '(' + r.userEmail + ')' : '') + '<br>' +
            'ZIP: ' + (r.zipName || '-') + ' · ' + Math.round((r.zipSize || 0) / 1024) + ' KB<br>' +
            'Waktu: ' + fmt(r.createdAt) +
          '</div>' +
          (r.domain ? '<div style="margin-top:8px;font-size:13px;">Domain: <a href="' + r.domain + '" target="_blank" style="color:#69f0ae;font-weight:700;">' + r.domain + '</a></div>' : '') +
          (r.error ? '<div style="margin-top:6px;color:#ff8a80;font-size:12px;">' + r.error + '</div>' : '') +
          '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">' +
            '<button type="button" class="btn-topup" data-dl="' + r.id + '">Download ZIP</button>' +
            (r.status !== 'live' ? '<button type="button" class="btn-pesan" data-retry="' + r.id + '">Retry Deploy</button>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');

    box.querySelectorAll('[data-dl]').forEach(function (btn) {
      btn.onclick = async function () {
        try {
          var blob = await NailongDeploy.downloadZip(btn.getAttribute('data-dl'));
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (btn.getAttribute('data-dl') || 'site') + '.zip';
          a.click();
        } catch (e) { alert(e.message || e); }
      };
    });
    box.querySelectorAll('[data-retry]').forEach(function (btn) {
      btn.onclick = async function () {
        btn.disabled = true;
        try {
          var res = await NailongDeploy.retryDeploy(btn.getAttribute('data-retry'));
          alert('Berhasil: ' + (res.domain || 'OK'));
        } catch (e) { alert(e.message || e); }
        btn.disabled = false;
      };
    });
  }

  function boot() {
    if (!window.NailongDeploy) return;
    NailongDeploy.listenAll(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  var _st = window.switchTab;
  if (typeof _st === 'function') {
    window.switchTab = function (t) {
      _st(t);
      if (t === 'deploy') boot();
    };
  }
})();
