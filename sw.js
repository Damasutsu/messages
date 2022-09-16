const cacheName = 'messages-v1'
const cacheFiles = [
    '/messages/icon-192x192.png',
    '/messages/index.html',
    '/messages/css/style.css',
    '/messages/js/script.js',
    '/messages/js/app.js',
    '/messages/',
    '/messages/manifest.webmanifest',
    'https://sun9-35.userapi.com/impg/Q-fY-01DZi1trvDrVETWPDM1uxbYoGrLM_5jQQ/9VfyaTRATI4.jpg?size=1850x1400&quality=96&sign=d4aa340ac0e36c91d888d87c676d2004&type=album',
    'https://sun9-84.userapi.com/impg/GoN1HZUe3Q0GKTILfC7QSMvAaFpDgZvXa1TFxA/zc-knDjsWOg.jpg?size=2560x1440&quality=96&sign=ac333b580b9cf53cb4495c5590cd3092&type=album',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,600,700'
]

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        await cache.addAll(cacheFiles);
    })());
});

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        if (r) return r;
        const response = await fetch(e.request);
        return response;
    })());
});
