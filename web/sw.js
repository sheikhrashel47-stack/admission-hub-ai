/* Admission Hub AI — Service Worker
   - App shell (UI/assets): cache-first → instant open + offline UI
   - API calls (chat/research/files): network — কখনো cache হয় না (তাজা ডেটা)
   - Version bump করলেই পুরোনো ক্যাশ বদলাবে */
const CACHE = 'ahai-v1';
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

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API → network only (SSE চ্যাট, research, files)
  if (url.pathname.startsWith('/api/') || e.request.method !== 'GET') return;
  if (!['https:', 'http:'].includes(url.protocol)) return;
  // cross-origin (workers.dev backend) → network
  if (url.origin !== self.location.origin) return;

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
