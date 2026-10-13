// Service Worker de El Mundo de Ximenita
// Estrategia Network-First para garantizar actualizaciones en tiempo real
const CACHE_NAME = 'ximenita-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpiar cachés anteriores para evitar servir versiones desactualizadas
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Network-First: Siempre intenta obtener la versión más reciente de la red
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
