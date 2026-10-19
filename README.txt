========================================
   NAILONG JOKI
   Firebase Global + Login Google + Menu Akun
========================================

MENU BAWAH:
Joki | Digital | Home | Antrian | Tentang | Akun

LOGIN AKUN:
- Hanya Google (Firebase Authentication)
- Halaman: akun.html

ANTRIAN & ADMIN GLOBAL:
- Data order di Firebase Realtime Database
- Semua HP melihat antrian yang sama
- Admin ubah status → semua HP ikut berubah (realtime)

----------------------------------------
SETUP FIREBASE (GRATIS, 1x ~5 menit)
----------------------------------------

1. https://console.firebase.google.com → Create project

2. Build → Realtime Database → Create Database
   → Start in test mode

3. Tab Rules → Publish:
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

4. Build → Authentication → Get started
   → Sign-in method → Google → Enable → Save

5. Project Settings (gerigi) → Your apps → Web </>
   → Register app → copy firebaseConfig

6. Buka global-orders.js → tempel ke FIREBASE_CONFIG
   (apiKey, authDomain, databaseURL, projectId, ...)

7. Authentication → Settings → Authorized domains
   → Add domain Vercel kamu (contoh: xxx.vercel.app)

8. Upload semua file ke Vercel
9. Hard refresh di HP

SELESAI.

File penting:
- global-orders.js  → config Firebase + antrian global
- auth.js           → login Google
- akun.html         → halaman akun
- admin.html        → panel admin (global)
- antrian.html      → antrian (global)
========================================

----------------------------------------
PREVIEW LINK WHATSAPP (Open Graph)
----------------------------------------
File og-banner.jpg + meta og:image sudah dipasang.
Saat link website dibagikan di WA, muncul banner logo Nailong Digital.

Penting: setelah deploy (Vercel), edit SEMUA meta og:image menjadi URL absolut, contoh:
  <meta property="og:image" content="https://DOMAIN-KAMU.vercel.app/og-banner.jpg">
Tanpa URL absolut, beberapa app chat tidak menampilkan preview.

----------------------------------------
WIJAYA PAY (QRIS)
----------------------------------------
1. Daftar di https://app.wijayapay.com
2. Ambil code_merchant + api_key
3. Ideal: buat serverless function (Vercel API) yang memanggil API Wijaya Pay
   lalu set window.WijayaPay.setConfig({ proxyUrl: 'https://.../api/wijayapay' })
4. Atau isi sementara di wijayapay.js (kurang aman di frontend)

----------------------------------------
ADMIN KELOLA SALDO
----------------------------------------
Panel Admin → tab "Saldo User"
- Tambah / kurangi / set saldo per UID
- Daftar saldo semua user tersimpan

