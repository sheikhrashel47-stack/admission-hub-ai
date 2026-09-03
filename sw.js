/* Admission Hub AI — Service Worker v16
   - HTML (./, ./index.html): NETWORK-FIRST → সবসময় তাজা ভার্সন (পুরোনো ক্যাশ আর আটকাবে না)
   - Assets (icons/manifest): cache-first → দ্রুত খোলে
   - API (chat/research/files): network only — কখনো cache হয় না
   - Offline: পুরোনো ক্যাশ থেকে শেল দেখায়
   v9: Phase 1 polish — jump-to-latest, offline banner, skeletons, reply/quote, archive
   v10: Agent Workspace — in-chat live task cards, status bar, progress, diff view, task panel, search, fullscreen code */
const CACHE = 'ahai-v16';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];
const NETWORK_FIRST = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/') || e.request.method !== 'GET') return;
  if (!['https:', 'http:'].includes(url.protocol)) return;
  if (url.origin !== self.location.origin) return;

  const isHtml = NETWORK_FIRST.some((p) => url.pathname === p || (url.pathname.endsWith('/') && p === './'));
  if (isHtml) {
    // network-first: online হলে সবসময় তাজা
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./')))
    );
    return;
  }
  // cache-first for static assets
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fetchP = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fetchP;
    })
  );
});
