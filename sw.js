/**
 * Service worker — network-first, pas de mise en cache agressive.
 * Se désinstalle proprement pour effacer tout ancien cache.
 */

/* Vide tous les caches existants puis se désenregistre */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});

/* Ne met rien en cache — laisse le navigateur gérer */
self.addEventListener('fetch', () => {});
