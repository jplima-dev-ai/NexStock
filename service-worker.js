const APP_VERSION = "1.0.0";
const CACHE_NAME = "nexstock-shell-v1.0.0";
const SHELL_RESOURCES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/tokens.css", "./css/reset.css", "./css/base.css", "./css/accessibility.css", "./css/components.css", "./css/layout.css", "./css/responsive.css",
  "./js/app.js", "./locales/pt-BR.json", "./locales/en-US.json", "./locales/es.json",
  "./demo/technology.json", "./demo/cosmetics.json", "./demo/fashion.json", "./demo/food.json", "./demo/custom.json",
  "./assets/brand/symbols/nexstock-app-icon-1x1.png", "./assets/brand/symbols/nexstock-brand-symbol-1x1.png", "./assets/brand/mascot/nexstock-mascot-full-body-3x4.png",
  "./assets/icons/pwa/icon-192x192.png", "./assets/icons/pwa/icon-512x512.png", "./assets/icons/pwa/icon-maskable-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_RESOURCES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("nexstock-shell-v") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      if (!response || !response.ok) return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error());
  }));
});
