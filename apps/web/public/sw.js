// Service Worker for UHTP Smart Disaster PWA
const CACHE_NAME = 'uhtp-smart-disaster-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard-transparansi',
  '/public-reports',
  '/laporkan-bencana',
  '/laporkan-jalan',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();

          // Cache successful GET requests
          if (response.status === 200) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page or error response
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache First strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  // This would sync queued reports when back online
  // Implementation depends on your offline queue system
  console.log('Syncing reports...');
}
