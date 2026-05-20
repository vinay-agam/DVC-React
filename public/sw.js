// Minimal Service Worker for PWA Install support
// This enables the "Add to Home Screen" prompt in browsers

const CACHE_NAME = 'dvc-cache-v1';

// Install event — cache essential files
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch event — network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
