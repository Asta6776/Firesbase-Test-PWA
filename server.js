const CACHE_NAME = 'fb-test-v1';
const urlsToCache = [
  './',
  './firebase-test.html',
  './test-manifest.json',
  './test-sw.js'
  // Add any other assets if needed (e.g., icons)
];

// Install – cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch – network‑first for HTML, cache‑first for everything else
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Always go to network first for the test page (to ensure redirect works)
  if (requestUrl.pathname.endsWith('firebase-test.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For other assets, try cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});