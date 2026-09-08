/* JUJU old UI — PERMANENTLY DISABLED (kill-switch SW)
   Clears every old cache, claims clients, then unregisters itself.
   After this runs, the disabled notice page loads straight from network. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (err) {}
    try { await self.clients.claim(); } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
  })());
});
/* no fetch handler — everything goes straight to network */
