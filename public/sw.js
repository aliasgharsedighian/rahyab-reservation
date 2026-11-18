const CACHE_PREFIX = "foodnix-pwa-assets-";
// Remove caches created before the project was named foodnix.
const LEGACY_CACHE_PREFIX = "rahyab-pwa-assets-";
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
    await Promise.all(keys.filter((key) => (key.startsWith(CACHE_PREFIX) || key.startsWith(LEGACY_CACHE_PREFIX)) && key !== CACHE_NAME)
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

let baasPushReady = false;

function readBaasInstallationToken() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mbaas-sdk", 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("installation-tokens")) {
        request.result.createObjectStore("installation-tokens");
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const token = database.transaction("installation-tokens", "readonly")
        .objectStore("installation-tokens").get("mbaas:installation_token");
      token.onsuccess = () => { database.close(); resolve(token.result ?? null); };
      token.onerror = () => { database.close(); reject(token.error); };
    };
  });
}

async function openNotificationDestination(notification) {
  const requested = notification.data?.url;
  let destination = self.location.origin + "/";
  try {
    const url = new URL(requested || "/", self.location.origin);
    if (url.origin === self.location.origin) destination = url.href;
  } catch {
    // Open the application home when the supplied destination is unusable.
  }
  notification.close();
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const window of windows) {
    if (window.url === destination && "focus" in window) return window.focus();
  }
  return self.clients.openWindow(destination);
}

try {
  importScripts("https://nexus.baas.gov.ir/repository/SDK_Raw/web/cdn/latest/sdk-sw.js");
  const sdk = self.GapPushSDK;
  // Match the database/key used by the installed Core SDK, while retaining one
  // native BaaS OPENED/DISMISSED report and the vendor's event listeners.
  sdk.reportNotificationEvent = async (eventType, event) => {
    const token = await readBaasInstallationToken();
    if (!token) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      await fetch("https://gateway.baas.gov.ir/api/v1/push/event", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventType, pushId: event.notification.data?.pushId }),
        keepalive: true,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };
  sdk.handleNotificationClick = (event) => {
    event.waitUntil(Promise.allSettled([
      openNotificationDestination(event.notification),
      sdk.reportNotificationEvent("OPENED", event),
    ]));
  };
  baasPushReady = true;
} catch {
  // Keep the offline worker available if the Push CDN is unreachable.
  console.warn("BaaS Push could not be loaded in the Service Worker.");
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "FOODNIX_BAAS_PUSH_STATUS") event.ports[0]?.postMessage(baasPushReady);
});
