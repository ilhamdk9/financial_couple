const CACHE = 'fcouple-v1';
const ASSETS = [
  '/',              // pastikan file ini bisa diserve
  '/manifest.webmanifest',
  '/icons/heart.svg',
  '/icons/heart-maskable.svg',
  '/icons/heart-192.png',
  '/icons/heart-512.png'
  // tambahkan css/js statik kamu jika ada, mis: '/styles.css', '/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first utk aset statik, network-first utk yang lain
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // abaikan non-GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAsset = ASSETS.includes(url.pathname);

  if (isAsset) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  } else {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
