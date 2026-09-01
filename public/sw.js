const CACHE_NAME = "notaku-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// PENTING: jangan pernah cache halaman (HTML) atau file JS/CSS Next.js (_next/*).
// Kalau di-cache, update kode baru bisa "nyangkut" — user masih lihat versi lama
// walau server sudah update, dan tombol jadi tidak merespons (chunk mismatch).
// Service worker ini HANYA membantu cache gambar/ikon statis untuk mode offline ringan.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/_next/")) return; // biarkan Next.js atur cache-nya sendiri
  if (event.request.mode === "navigate") return; // halaman HTML selalu ambil dari network
  if (!/\.(png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) return; // cuma gambar yang di-cache

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
