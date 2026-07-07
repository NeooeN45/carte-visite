/**
 * Service worker — mode hors-ligne minimal.
 * Stratégie : cache-first pour l'app shell (mêmes origines),
 * stale-while-revalidate pour les polices Google Fonts.
 * Incrémentez CACHE_VERSION à chaque déploiement pour invalider l'ancien cache.
 */
const CACHE_VERSION = 'cp-carte-visite-v3';

const APP_SHELL = [
  '/carte-visite/',
  '/carte-visite/index.html',
  '/carte-visite/assets/css/style.css',
  '/carte-visite/assets/js/main.js',
  '/carte-visite/favicon.svg',
  '/carte-visite/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  // API GitHub et carte OpenStreetMap : toujours le réseau (contenu dynamique / tiers).
  if (url.hostname === 'api.github.com' || url.hostname.includes('openstreetmap.org')) {
    return;
  }

  if (isSameOrigin) {
    // App shell : cache d'abord, réseau en repli.
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => cached))
    );
    return;
  }

  if (isGoogleFonts) {
    // Polices : on sert le cache tout en revalidant en arrière-plan.
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
  }
});
