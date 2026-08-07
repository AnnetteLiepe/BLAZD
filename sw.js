// Minimaler Service Worker – nur nötig, damit Android/Chrome die App
// als "installierbar" erkennt. Kein Offline-Caching, um sicherzustellen,
// dass immer die neueste Version aus Firebase geladen wird.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
