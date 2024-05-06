const CACHE_NAME = 'koszty-wakacji-cache-v1'; // Nazwa cache'u

// Lista plików do zcache'owania
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/css/bootstrap.min.css',
  '/js/bootstrap.min.js',
  '/js/jquery-3.5.1.slim.min.js',
  '/js/popper.min.js',
  '/sw.js',
];

// Instalacja Service Worker'a
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache otwarty');
        return cache.addAll(urlsToCache);
      })
  );
});

// Obsługa żądań offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Jeżeli plik jest w cache'u, zwróć go
        if (response) {
          return response;
        }

        // W przeciwnym wypadku pobierz z sieci i dodaj do cache'u
        return fetch(event.request)
          .then(function(response) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Czyszczenie starych cache'i
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});