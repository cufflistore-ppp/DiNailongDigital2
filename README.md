# Nailong Digital — Media API (Node.js)

Backend untuk **musik, komik, tontonan, YouTube** agar website bisa ambil data banyak + cover resmi.

## Batasan penting (baca)

- **Musik**: iTunes preview (~30 dtk) + MusicBrainz + Internet Archive (yang publik). **Bukan** full Spotify/Joox semua lagu dunia (itu tidak legal tanpa lisensi mahal).
- **Komik / anime**: katalog + **cover resmi** MyAnimeList (Jikan API). Bukan host scan chapter ilegal.
- **YouTube / tontonan**: cari video + thumbnail + **embed resmi**. Bukan unduh/simpan video YouTube di VPS.

## Install di VPS

```bash
cd server
npm install
npm start
# default port 8787
```

Atau:

```bash
PORT=8787 node index.js
```

## Contoh panggilan

```
GET http://IP:8787/api/music/search?q=tulus
GET http://IP:8787/api/comics/top
GET http://IP:8787/api/comics/search?q=one%20piece
GET http://IP:8787/api/tontonan/search?q=naruto
GET http://IP:8787/api/youtube/search?q=lofi
GET http://IP:8787/api/youtube/trending
```

## Hubungkan ke website

Di frontend, set:

```js
window.NAILONG_API = 'https://api.domain-kamu.com'; // atau http://IP:8787
```

Lalu `music-player.js` / `baca.html` / `youtube.html` akan memakai API ini jika tersedia.

## Firewall

Buka port `8787` (atau pakai Nginx reverse proxy + HTTPS).
