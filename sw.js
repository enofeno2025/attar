const CACHE_NAME = 'teachers-assistant-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/vite.svg',
  '/manifest.json'
];

// Install event: opens a cache and adds the app shell assets to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves requests from the cache first. If a resource is not in the cache, it fetches it from the network and caches it for future use.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the cached response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          function(networkResponse) {
            // Check if we received a valid response
            // We don't cache non-2xx responses or opaque responses from third-party CDNs without CORS.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response because it's a stream that can only be consumed once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
