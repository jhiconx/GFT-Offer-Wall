const CACHE='gft-offer-wall-v2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/offerwall-logo-horizontal.png','./assets/offerwall-icon-192.png','./assets/offerwall-icon-512.png','./assets/chili-rewards-mark.png','./assets/brands/hershey.png','./assets/brands/drpepper.png','./assets/brands/redbull.png','./assets/brands/doritos.png','./assets/brands/crush.png','./assets/brands/icebreakers.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request))));
