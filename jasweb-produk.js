/**
 * Katalog khusus Produk Jasweb (jasa website)
 * Bisa diubah dari admin / localStorage key: nailong_jasweb
 */
const JASWEB_CATALOG_VER = "1";

const produkJasweb = [
  {
    id: 1,
    slug: "landing-page",
    label: "WEB",
    judul: "Landing Page",
    deskripsi: "Website 1 halaman promo bisnis / produk. Mobile friendly.",
    harga: 150000,
    status: "TERSEDIA",
    img: "nailong-digital-logo.jpg",
    variants: [
      { nama: "Basic", harga: 150000 },
      { nama: "Pro (form + WA)", harga: 250000 },
      { nama: "Premium (animasi)", harga: 350000 }
    ],
    fitur: ["Desain custom", "Mobile responsive", "Revisi 2x"]
  },
  {
    id: 2,
    slug: "toko-online",
    label: "WEB",
    judul: "Website Toko Online",
    deskripsi: "Katalog produk + keranjang + link bayar QRIS.",
    harga: 450000,
    status: "TERSEDIA",
    img: "nailong-digital-logo.jpg",
    variants: [
      { nama: "Starter", harga: 450000 },
      { nama: "Bisnis", harga: 750000 },
      { nama: "Full (admin panel)", harga: 1200000 }
    ],
    fitur: ["Katalog produk", "Checkout QRIS", "Panel admin sederhana"]
  },
  {
    id: 3,
    slug: "company-profile",
    label: "WEB",
    judul: "Company Profile",
    deskripsi: "Website profil perusahaan multi-halaman.",
    harga: 500000,
    status: "TERSEDIA",
    img: "nailong-digital-logo.jpg",
    variants: [
      { nama: "3 Halaman", harga: 500000 },
      { nama: "5 Halaman", harga: 750000 },
      { nama: "Custom", harga: 1000000 }
    ],
    fitur: ["Halaman About / Services / Contact", "Form kontak", "SEO basic"]
  },
  {
    id: 4,
    slug: "jasa-maintenance",
    label: "WEB",
    judul: "Maintenance Website",
    deskripsi: "Perawatan, update konten, fix bug website existing.",
    harga: 100000,
    status: "TERSEDIA",
    img: "nailong-digital-logo.jpg",
    variants: [
      { nama: "Sekali (per job)", harga: 100000 },
      { nama: "Bulanan", harga: 250000 }
    ],
    fitur: ["Update konten", "Backup", "Fix minor bug"]
  },
  {
    id: 5,
    slug: "custom-web-app",
    label: "WEB",
    judul: "Custom Web App",
    deskripsi: "Aplikasi web custom (order system, dashboard, dll).",
    harga: 1500000,
    status: "TERSEDIA",
    img: "nailong-digital-logo.jpg",
    variants: [
      { nama: "Konsultasi dulu", harga: 1500000 }
    ],
    fitur: ["Sesuai brief", "Revisi bertahap", "Deploy assistance"]
  }
];

function formatRpJasweb(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function jaswebPayUrl(judul, harga) {
  return "pembayaran.html?paket=" + encodeURIComponent("Jasweb · " + judul) + "&total=" + encodeURIComponent(String(harga));
}

function loadProdukJasweb() {
  try {
    if (localStorage.getItem("nailong_jasweb_ver") !== JASWEB_CATALOG_VER) {
      localStorage.removeItem("nailong_jasweb");
      localStorage.setItem("nailong_jasweb_ver", JASWEB_CATALOG_VER);
    }
    const saved = localStorage.getItem("nailong_jasweb");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        produkJasweb.length = 0;
        parsed.forEach(p => produkJasweb.push(p));
      }
    }
  } catch (e) {}
}

function saveProdukJasweb() {
  try {
    localStorage.setItem("nailong_jasweb", JSON.stringify(produkJasweb));
  } catch (e) {}
}

function renderJaswebList() {
  const list = document.getElementById("jaswebList");
  if (!list) return;
  loadProdukJasweb();

  if (!produkJasweb.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-globe"></i><p>Belum ada paket jasweb.</p></div>';
    return;
  }

  list.innerHTML = produkJasweb.map(p => {
    const variants = Array.isArray(p.variants) && p.variants.length ? p.variants : null;
    const actions = variants
      ? `<div class="variant-grid">` + variants.map(v =>
          `<a href="${jaswebPayUrl(p.judul + " · " + v.nama, v.harga)}" class="btn-pesan variant-btn">${v.nama}<small>${formatRpJasweb(v.harga)}</small></a>`
        ).join("") + `</div>`
      : `<a href="${jaswebPayUrl(p.judul, p.harga)}" class="btn-pesan">Bayar Sekarang</a>`;

    const link = (p.link || p.url || "").trim();
    let mediaHtml;
    if (link && /^https?:\/\//i.test(link)) {
      mediaHtml = `
          <div class="produk-web-preview">
            <iframe src="${link.replace(/"/g, "&quot;")}" title="${(p.judul || "").replace(/"/g, "&quot;")}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
            <a href="${link.replace(/"/g, "&quot;")}" target="_blank" rel="noopener" class="produk-web-open" title="Buka website"><i class="fa-solid fa-up-right-from-square"></i></a>
            <span class="produk-label">${p.label || 'WEB'}</span>
          </div>`;
    } else {
      mediaHtml = `
          <div class="produk-card-img">
            <img src="${p.img || 'nailong-digital-logo.jpg'}" alt="${(p.judul || "").replace(/"/g, "&quot;")}" onerror="this.src='nailong-digital-logo.jpg'">
            <span class="produk-label">${p.label || 'WEB'}</span>
          </div>`;
    }
    return `
      <div class="produk-card produk-card-glass">
        ${mediaHtml}
        <div class="produk-card-body">
          <h3>${p.judul}</h3>
          <p>${p.deskripsi || ''}</p>
          <div class="produk-harga">${formatRpJasweb(p.harga)}${variants ? ' <small>mulai</small>' : ''}</div>
          ${actions}
        </div>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", renderJaswebList);
