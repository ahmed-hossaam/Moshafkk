const VERSION = "moshafk-v1";
const APP_CACHE = `${VERSION}-app`;
const API_CACHE = `${VERSION}-api`;
const APP_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/moshafk.svg"];
const API_HOSTS = [
  "api.alquran.cloud",
  "api.aladhan.com",
  "hadis-api-id.vercel.app",
  "raw.githubusercontent.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("moshafk-") && key !== APP_CACHE && key !== API_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        try {
          const response = await fetch(request);
          if (response.ok && response.type !== "opaque") {
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          if (cached) return cached;
          throw new Error("Offline and no cached API response is available.");
        }
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(APP_CACHE);
        return (await cache.match("/index.html")) || Response.error();
      }),
    );
    return;
  }

  if (
    url.origin === self.location.origin &&
    ["script", "style", "font", "image"].includes(request.destination)
  ) {
    event.respondWith(
      caches.open(APP_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      }),
    );
  }
});
