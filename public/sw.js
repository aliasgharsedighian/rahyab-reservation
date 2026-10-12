const CACHE_PREFIX = "rahyab-pwa-assets-";
const CACHE_NAME = CACHE_PREFIX + "v2";
const OFFLINE_URL = "/offline.html";
const APP_ASSETS = [
  OFFLINE_URL,
  "/assets/fonts/iransanswebfanum.ttf",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Always fetch live pages. Never cache authenticated HTML, API responses or RSC data.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        return await fetch(request, { signal: controller.signal });
      } catch {
        return await caches.match(OFFLINE_URL, { cacheName: CACHE_NAME }) ??
          new Response("اتصال برقرار نشد. اینترنت را بررسی و VPN را خاموش کنید.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
      } finally {
        clearTimeout(timeout);
      }
    })());
    return;
  }

  if (APP_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname, { cacheName: CACHE_NAME })
      .then((cached) => cached ?? fetch(request)));
  }
});
