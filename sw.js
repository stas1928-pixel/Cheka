/* ---------------------------------------------------------------
   SERVICE WORKER — makes the app load instantly and work offline.

   Strategy (simple on purpose):
   - vendor/ (chess.js, Stockfish, piece images): cache-first. Big and
     never change without a version bump here.
   - everything else (HTML, CSS, JS): network-first, falling back to the
     cache when offline. So a new deploy shows up on the next open while
     the app still works with no network.
   - Lichess / Chess.com API calls: never cached here.

   Bump VERSION whenever vendor/ changes so the old cache is dropped.
--------------------------------------------------------------- */
const VERSION = 'v13';
const CACHE = `opening-trainer-${VERSION}`;

const PRECACHE = [
  './', './index.html', './css/tokens.css', './css/style.css', './css/app-v2.css', './css/app-v3.css', './css/app-v5.css', './manifest.webmanifest', './icon.svg',
  './js/app.js', './js/names.js', './js/describe.js', './js/repertoire.js', './js/repertoire.data.js', './js/tree.js', './js/progress.js', './js/settings.js',
  './js/feedback.js', './js/explorer.js', './js/chesscom.js', './js/engine.js',
  './js/branchBuilder.js', './js/weakness.js',
  './vendor/chess.js',
  ...['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'].map((p) => `./vendor/pieces/${p}.svg`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // APIs, CDNs: leave alone

  if (url.pathname.includes('/vendor/')) {
    // Cache-first: the engine is 7 MB, download it once.
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }

  // Network-first for app files, cache as fallback. `no-cache` forces a
  // revalidation with the server so ES modules can never load as a mix of
  // old and new versions from the browser's HTTP cache after a deploy.
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then((res) => {
      if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit ?? caches.match('./index.html'))),
  );
});
