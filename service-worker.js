const cacheName = 'parkSmart-cache-v1';
const assets = [
  '/pages/userPages/homepage.html', // Link to homepage HTML file
  '/styles/homepageStyles.css', // Link to homepage CSS file
  '/pages/userPages/homepage.js',          // Link to homepage JS file
  '/pages/userPages/Assets/ParkSmartLogo.png',         // Homepage image if used
  '/pages/userPages/Assets/carpark3.avif',   // Any other homepage images
  '/pages/userPages/Assets/fevicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Caching assets for offline use');
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
