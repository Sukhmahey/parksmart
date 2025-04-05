
// const CACHE_NAME = "offline-cache-v2";
// const OFFLINE_URL = "offline.html";
// const ASSETS_TO_CACHE = [
//     OFFLINE_URL,
    
// ];

// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.addAll(ASSETS_TO_CACHE);
//         })
//     );
// });

// self.addEventListener("fetch", (event) => {
//     event.respondWith(
//         caches.match(event.request).then((cachedResponse) => {
//             return cachedResponse || fetch(event.request).catch(() => {
//                 if (event.request.destination === "document") {
//                     return caches.match(OFFLINE_URL);
//                 }
//             });
//         })
//     );
// });

// self.addEventListener("activate", (event) => {
//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames.map((cache) => {
//                     if (cache !== CACHE_NAME) {
//                         return caches.delete(cache);
//                     }
//                 })
//             );
//         })
//     );

const cacheName = 'parkSmart-cache-v1';
const assets = [
  '/pages/userPages/homepage.html', // Link to homepage HTML file
  '/styles/homepageStyles.css', // Link to homepage CSS file
  '/pages/userPages/homepage.js', // Link to homepage JS file
  '/pages/userPages/Assets/ParkSmartLogo.png', // Homepage image if used
  '/pages/userPages/Assets/carpark3.avif', // Any other homepage images
  '/pages/userPages/Assets/fevicon.svg',
  '/offline.html' // Offline fallback page
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
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/offline.html');
        });
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
