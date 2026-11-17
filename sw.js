/* Poshaak offline cache: app shell + art. Photos live in IndexedDB, not here. */
var CACHE = 'poshaak-v2';
var SHELL = ['./', 'index.html', 'app.js', 'manifest.json', 'assets/poshaak-mark-cocoa.svg', 'assets/icon-192.png',
  'assets/kaaj/wave.webp', 'assets/kaaj/idle.webp', 'assets/kaaj/love.webp', 'assets/kaaj/hop.webp', 'assets/kaaj/sleep.webp', 'assets/kaaj/think.webp', 'assets/kaaj/party.webp', 'assets/kaaj/yes.webp', 'assets/kaaj/peek.webp',
  'assets/icons/tshirt.svg', 'assets/icons/jeans.svg', 'assets/icons/dress.svg', 'assets/icons/sneaker.svg', 'assets/icons/handbag.svg', 'assets/icons/hanger.svg', 'assets/icons/sparkle.svg', 'assets/icons/camera.svg', 'assets/icons/heart.svg', 'assets/icons/button.svg', 'assets/icons/kurta.svg', 'assets/icons/sunglasses.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (hit) {
    var net = fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
