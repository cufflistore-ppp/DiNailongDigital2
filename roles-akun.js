/**
 * Halaman akun: kartu stadium, role, edit nama/foto (max 3x, tanpa limit 14 hari)
 */
(function () {
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function mount(profile, user) {
    var host = document.querySelector('.akun-page') || document.querySelector('.page-content') || document.body;
    var old = document.getElementById('ndRoleCard');
    if (old) old.remove();

    var role = (profile && profile.role) || 'pengunjung';
    var label = window.NDRoles ? NDRoles.roleLabel(role) : role;
    var name = (profile && profile.name) || (user && user.displayName) || 'User';
    var photo = (profile && profile.photo) || (user && user.photoURL) || 'nd-logo-gold.jpg';
    var idp = (profile && profile.idPublic) || ('ND' + (user && user.uid || '').slice(-6).toUpperCase());
    var changes = Number((profile && profile.profileChangeCount) || 0);
    var left = Math.max(0, 3 - changes);
    var canStore = role === 'partner' || role === 'paid_promote' || role === 'founder';
    var isFounder = role === 'founder';
    var canEdit = !!user && left > 0;

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
        (user ? (
          '<div class="nd-edit-box">' +
            '<label>Ganti nama</label>' +
            '<input id="ndEditName" maxlength="40" value="' + String(name).replace(/"/g, '&quot;') + '" ' + (canEdit ? '' : 'disabled') + '>' +
            '<label>URL foto profil</label>' +
            '<input id="ndEditPhoto" placeholder="https://..." value="' + String(photo).replace(/"/g, '&quot;') + '" ' + (canEdit ? '' : 'disabled') + '>' +
            '<button type="button" class="nd-role-btn accent" id="ndSaveProfile" ' + (canEdit ? '' : 'disabled') + '>' +
              (canEdit ? '<i class="fa-solid fa-floppy-disk"></i> Simpan profil (' + left + 'x tersisa)' : '<i class="fa-solid fa-lock"></i> Limit 3x sudah habis') +
            '</button>' +
            '<p id="ndEditMsg" style="font-size:12px;font-weight:700;margin:6px 0 0;color:#111"></p>' +
          '</div>'
        ) : '') +
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
        '</div>' +
      '</div>'
    );

    var title = host.querySelector('.akun-page-title') || host.firstChild;
    if (title && title.parentNode) title.parentNode.insertBefore(card, title.nextSibling);
    else host.insertBefore(card, host.firstChild);

    var btn = document.getElementById('ndSaveProfile');
    if (btn && user) {
      btn.onclick = async function () {
        var msg = document.getElementById('ndEditMsg');
        msg.textContent = 'Menyimpan...';
        try {
          var newName = document.getElementById('ndEditName').value.trim();
          var newPhoto = document.getElementById('ndEditPhoto').value.trim();
          var updated = await NDRoles.updateProfile(user.uid, { name: newName, photo: newPhoto });
          msg.textContent = 'Tersimpan. Sisa ganti: ' + Math.max(0, 3 - Number(updated.profileChangeCount || 0)) + '/3';
          document.getElementById('ndNameView').textContent = updated.name || newName;
          document.getElementById('ndAvPreview').src = updated.photo || newPhoto || 'nd-logo-gold.jpg';
          setTimeout(function () { boot(); }, 400);
        } catch (e) {
          msg.textContent = e.message || String(e);
        }
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
    if (!user) {
      mount({ role: 'pengunjung', name: 'Tamu', idPublic: 'ND------', photo: 'nd-logo-gold.jpg', profileChangeCount: 0 }, null);
      return;
    }
    var profile = await NDRoles.ensureUserProfile(user);
    mount(profile, user);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 500);
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function () { setTimeout(boot, 300); });
    }
  });
})();
