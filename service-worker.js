const CACHE_NAME = 'mi-jornada-pro-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Service Worker: Error caching files', error);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Found in cache', event.request.url);
                    return response;
                }
                
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Background Sync (for future use)
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Add background sync functionality here
            console.log('Service Worker: Performing background sync')
        );
    }
});

// Push Notification (for future use)
self.addEventListener('push', event => {
    console.log('Service Worker: Push received', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de Mi Jornada Pro',
        icon: './icon-192x192.png',
        badge: './icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver aplicación',
                icon: './icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: './icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Mi Jornada Pro', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    } else if (event.action === 'close') {
        // Close notification
        event.notification.close();
    }
});