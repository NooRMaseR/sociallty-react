import { precacheAndRoute } from 'workbox-precaching';

const CACHE_NAME = "socialltyCacheV2";

// This is required for injectManifest to work
precacheAndRoute(self.__WB_MANIFEST);


// const urlsToCache = [
//     "/",
//     "/login",
//     "/social-user-profile"
// ];

// Install Service Worker
// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             console.log("Opened cache");
//             return cache.addAll(urlsToCache);
//         })
//     );
// });

// Fetch requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                }),
                self.clients.claim()
            );
        })
    );
});

// Listen for skipWaiting message
// self.addEventListener('message', (event) => {
//     if (event.data && event.data.type === 'SKIP_WAITING') {
//       console.info('Service Worker: Skipping waiting');
//       self.skipWaiting();
//     }
//   });

// Handle notification clicks
// self.addEventListener("notificationclick", (event) => {
//     event.notification.close();

//     if (event.action === "close") return;

//     event.waitUntil(
//         self.clients.openWindow(event.notification.data.url)
//     );
// });