const CACHE_NAME = "planlayici-v2";
// Önbelleğe alınacak dosyalar
const DOSYALAR = [
    "./",
    "./index.html",
    "./app.js",
    "./manifest.json",
    "./icon.png"
];

// Kurulum (Install): Dosyaları tarayıcı hafızasına indir
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(DOSYALAR);
        })
    );
});

// Çevrimdışı (Fetch): İnternet yoksa hafızadaki dosyaları göster
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
