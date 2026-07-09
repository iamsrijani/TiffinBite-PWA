self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('dailybite-v1').then((cache) => {
      return cache.addAll(['/offline.html', '/icons/icon-192x192.png']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/offline.html');
    })
  );
});
