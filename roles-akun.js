/**
 * Halaman akun: kartu stadium + role HANYA jika sudah login.
 * Guest = login dulu, tidak auto-masuk.
 */
(function () {
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function removeCard() {
    var old = document.getElementById('ndRoleCard');
    if (old) old.remove();
  }

  function mount(profile, user) {
    removeCard();
    if (!user) return;

    var host = document.getElementById('viewLoggedIn') || document.querySelector('.akun-page');
    if (!host) return;

    var role = (profile && profile.role) || 'pengunjung';
    var label = window.NDRoles ? NDRoles.roleLabel(role) : role;
    var name = (profile && profile.name) || user.displayName || 'User';
    var photo = (profile && profile.photo) || user.photoURL || 'nd-logo-gold.jpg';
    var idp = (profile && profile.idPublic) || ('ND' + (user.uid || '').slice(-6).toUpperCase());
    var changes = Number((profile && profile.profileChangeCount) || 0);
    var left = Math.max(0, 3 - changes);
    var canStore = role === 'partner' || role === 'paid_promote' || role === 'founder';
    var isFounder = role === 'founder';
    var canEdit = left > 0;

    var card = el(
      '<div id="ndRoleCard" class="nd-role-wrap">' +
        '<div class="nd-stadium-card">' +
          '<img class="nd-st-avatar" id="ndAvPreview" src="' + photo + '" alt="" onerror="this.src=\'nd-logo-gold.jpg\'">' +
          '<div class="nd-st-info">' +
            '<div class="nd-st-name" id="ndNameView">' + name + '</div>' +
            '<div class="nd-st-id">ID: ' + idp + '</div>' +
            '<div class="nd-st-role">Role: <b>' + label + '</b></div>' +
            '<div class="nd-st-limit">Sisa ganti profil: <b>' + left + '/3</b></div>' +
          '</div>' +
        '</div>' +
        '<div class="nd-edit-box">' +
          '<label>Ganti nama</label>' +
          '<input id="ndEditName" maxlength="40" value="' + String(name).replace(/"/g, '&quot;') + '" ' + (canEdit ? '' : 'disabled') + '>' +
          '<label>URL foto profil</label>' +
          '<input id="ndEditPhoto" placeholder="https://..." value="' + String(photo).replace(/"/g, '&quot;') + '" ' + (canEdit ? '' : 'disabled') + '>' +
          '<button type="button" class="nd-role-btn accent" id="ndSaveProfile" ' + (canEdit ? '' : 'disabled') + '>' +
            (canEdit ? '<i class="fa-solid fa-floppy-disk"></i> Simpan profil (' + left + 'x tersisa)' : '<i class="fa-solid fa-lock"></i> Limit 3x sudah habis') +
          '</button>' +
          '<p id="ndEditMsg" style="font-size:12px;font-weight:700;margin:6px 0 0;color:#111"></p>' +
        '</div>' +
        '<div class="nd-role-actions">' +
          (role === 'pengunjung' || String(role).indexOf('buyer_sultan') === 0
            ? '<a class="nd-role-btn" href="daftar-partner.html"><i class="fa-solid fa-handshake"></i> Daftar Partner · Rp 150k</a>' +
              '<a class="nd-role-btn" href="daftar-paid-promote.html"><i class="fa-solid fa-bullhorn"></i> Daftar Paid Promote · Rp 90k</a>'
            : '') +
          (canStore
            ? '<a class="nd-role-btn accent" href="buka-toko.html"><i class="fa-solid fa-store"></i> Kelola Toko Saya</a>' +
              '<a class="nd-role-btn" href="store-settings.html"><i class="fa-solid fa-qrcode"></i> QRIS & Kontak Toko</a>' +
              '<a class="nd-role-btn" href="kirim-testimoni.html"><i class="fa-solid fa-camera"></i> Kirim Testimoni TRX (WA)</a>'
            : '') +
          (isFounder
            ? '<a class="nd-role-btn founder" href="founder.html"><i class="fa-solid fa-briefcase"></i> Ruangan Kerja Founder</a>'
            : '') +
          '<a class="nd-role-btn ghost" href="blacklist.html"><i class="fa-solid fa-ban"></i> Blacklist Partner/PP</a>' +
          '<a class="nd-role-btn ghost" href="buyer-manen.html"><i class="fa-solid fa-book"></i> Buyer Manen</a>' +
          '<a class="nd-role-btn ghost" href="channel.html"><i class="fa-solid fa-comments"></i> Channel Testimoni</a>' +
          '<button type="button" class="nd-role-btn" id="ndLogoutBtn" style="width:100%;background:#ffcdd2;border:2.5px solid #111;box-shadow:4px 4px 0 #111;border-radius:14px;font-weight:900;padding:12px;cursor:pointer;color:#111;">' +
            '<i class="fa-solid fa-right-from-bracket"></i> Logout' +
          '</button>' +
        '</div>' +
      '</div>'
    );

    var first = host.firstChild;
    host.insertBefore(card, first);

    var btn = document.getElementById('ndSaveProfile');
    if (btn) {
      btn.onclick = async function () {
        var msg = document.getElementById('ndEditMsg');
        msg.textContent = 'Menyimpan...';
        try {
          var updated = await NDRoles.updateProfile(user.uid, {
            name: document.getElementById('ndEditName').value.trim(),
            photo: document.getElementById('ndEditPhoto').value.trim()
          });
          msg.textContent = 'Tersimpan. Sisa: ' + Math.max(0, 3 - Number(updated.profileChangeCount || 0)) + '/3';
          setTimeout(boot, 400);
        } catch (e) {
          msg.textContent = e.message || String(e);
        }
      };
    }

    var lo = document.getElementById('ndLogoutBtn');
    if (lo) {
      lo.onclick = async function () {
        try {
          if (window.VoxyyAuth && VoxyyAuth.signOut) await VoxyyAuth.signOut();
          else if (firebase.auth) await firebase.auth().signOut();
        } catch (e) {}
        try { localStorage.removeItem('nailong_logged_in'); } catch (e) {}
        removeCard();
        var g = document.getElementById('viewGuest');
        var l = document.getElementById('viewLoggedIn');
        if (g) g.style.display = 'block';
        if (l) l.style.display = 'none';
        var bl = document.getElementById('btnLogout');
        // also trigger original logout if any
        if (bl) try { bl.click(); } catch (e) {}
        location.href = 'akun.html';
      };
    }
  }

  async function boot() {
    if (!window.NDRoles) return;
    var user = null;
    try {
      if (window.VoxyyAuth && VoxyyAuth.currentUser) user = VoxyyAuth.currentUser();
      if (!user && typeof firebase !== 'undefined' && firebase.auth) user = firebase.auth().currentUser;
    } catch (e) {}

    // jangan pakai localStorage palsu sebagai login
    if (!user) {
      removeCard();
      var g = document.getElementById('viewGuest');
      var l = document.getElementById('viewLoggedIn');
      if (g) g.style.display = 'block';
      if (l) l.style.display = 'none';
      return;
    }
    var profile = await NDRoles.ensureUserProfile(user);
    mount(profile, user);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 600);
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function (u) {
        if (!u) {
          removeCard();
          var g = document.getElementById('viewGuest');
          var l = document.getElementById('viewLoggedIn');
          if (g) g.style.display = 'block';
          if (l) l.style.display = 'none';
        } else {
          setTimeout(boot, 300);
        }
      });
    }
  });
})();
