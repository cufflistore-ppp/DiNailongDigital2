/**
 * Nailong Digital — Media API (Node.js)
 * Jalankan di VPS: npm install && npm start
 *
 * Endpoint:
 *   GET /api/health
 *   GET /api/music/search?q=
 *   GET /api/comics/search?q=  | /api/comics/top
 *   GET /api/comics/detail/:malId
 *   GET /api/tontonan/search?q= | /api/tontonan/top
 *   GET /api/tontonan/detail/:malId
 *   GET /api/youtube/search?q= | /api/youtube/trending
 */
const express = require('express');
const cors = require('cors');

const music = require('./routes/music');
const comics = require('./routes/comics');
const tontonan = require('./routes/tontonan');
const youtube = require('./routes/youtube');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'Nailong Digital Media API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/music/search?q=',
      '/api/comics/search?q=',
      '/api/comics/top',
      '/api/comics/detail/:id',
      '/api/tontonan/search?q=',
      '/api/tontonan/top',
      '/api/tontonan/detail/:id',
      '/api/youtube/search?q=',
      '/api/youtube/trending'
    ],
    note: 'Musik: preview legal + metadata. Komik/anime: katalog+cover MAL. YouTube: search+embed. Bukan piracy host.'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), uptime: process.uptime() });
});

app.use('/api/music', music);
app.use('/api/comics', comics);
app.use('/api/tontonan', tontonan);
app.use('/api/youtube', youtube);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Nailong Media API http://0.0.0.0:' + PORT);
});
