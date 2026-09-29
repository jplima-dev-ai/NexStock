const APP_VERSION = "1.9.0";
const CACHE_NAME = "nexstock-shell-v1.9.0-professional-polish-phase42-phase71";
const SHELL_RESOURCES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/tokens.css", "./css/reset.css", "./css/base.css", "./css/accessibility.css", "./css/components.css", "./css/layout.css", "./css/responsive.css",
  "./js/app.js",
  "./js/components/brand.js", "./js/components/button.js", "./js/components/card.js", "./js/components/command-palette.js", "./js/components/content-state.js", "./js/components/dialog.js", "./js/components/empty-state.js", "./js/components/feedback.js", "./js/components/field.js", "./js/components/icon.js", "./js/components/mobile-navigation.js", "./js/components/mobile-operations.js", "./js/components/pwa-status.js", "./js/components/skip-link.js", "./js/components/status-badge.js", "./js/components/table.js", "./js/components/tabs.js", "./js/components/theme-toggle.js",
  "./js/core/config.js", "./js/core/events.js", "./js/core/router.js", "./js/core/store.js", "./js/core/version.js",
  "./js/i18n/i18n.js", "./js/profiles/profile-registry.js",
  "./js/services/actions-service.js", "./js/services/backup-service.js", "./js/services/copy-service.js", "./js/services/custom-field-service.js", "./js/services/dashboard-service.js", "./js/services/data-upgrade-certification-service.js", "./js/services/draft-service.js", "./js/services/export-service.js", "./js/services/global-search-service.js", "./js/services/health-service.js", "./js/services/import-service.js", "./js/services/insight-service.js", "./js/services/intelligence-service.js", "./js/services/inventory-activity-service.js", "./js/services/inventory-story-service.js", "./js/services/label-service.js", "./js/services/media-service.js", "./js/services/module-service.js", "./js/services/movement-service.js", "./js/services/performance-service.js", "./js/services/product-service.js", "./js/services/profile-service.js", "./js/services/pwa-service.js", "./js/services/scanner-service.js", "./js/services/scenario-service.js", "./js/services/security-service.js", "./js/services/seed-loader.js", "./js/services/settings-service.js", "./js/services/snapshot-service.js", "./js/services/workspace-service.js",
  "./js/storage/data-provider.js", "./js/storage/indexeddb-provider.js", "./js/storage/media-provider.js", "./js/storage/migrations/001-initial-schema.js", "./js/storage/migrations/002-product-workspace-code.js", "./js/storage/migrations/003-module-integrity.js", "./js/storage/migrations/004-product-media.js", "./js/storage/migrations/index.js", "./js/storage/provider-factory.js", "./js/storage/supabase-provider.js",
  "./js/utils/component-id.js", "./js/utils/security.js",
  "./js/views/backup-view.js", "./js/views/custom-field-view.js", "./js/views/dashboard-view.js", "./js/views/export-view.js", "./js/views/glossary-view.js", "./js/views/health-view.js", "./js/views/import-view.js", "./js/views/insight-view.js", "./js/views/labels-view.js", "./js/views/module-view.js", "./js/views/movement-view.js", "./js/views/onboarding-model.js", "./js/views/onboarding-view.js", "./js/views/product-view.js", "./js/views/route-view.js", "./js/views/scan-view.js", "./js/views/scenario-view.js", "./js/views/security-view.js", "./js/views/settings-view.js", "./js/views/snapshot-view.js", "./js/views/tour-view.js",
  "./js/services/audit-service.js", "./js/services/reversal-service.js", "./js/services/privacy-data-center-service.js", "./js/services/offline-experience-service.js", "./js/services/migration-service.js", "./js/services/storage-lifecycle-service.js", "./js/views/audit-view.js", "./js/views/privacy-data-center-view.js", "./js/views/offline-experience-view.js", "./js/views/pwa-update-center-view.js", "./js/views/migration-view.js", "./js/views/storage-lifecycle-view.js",
  "./locales/pt-BR.json", "./locales/en-US.json", "./locales/es.json",
  "./demo/technology.json", "./demo/cosmetics.json", "./demo/fashion.json", "./demo/food.json", "./demo/custom.json",
  "./assets/brand/logos/nexstock-main-logo-16x9.png", "./assets/brand/logos/nexstock-stacked-logo-4x3.png", "./assets/brand/mascot/nexstock-mascot-full-body-3x4.png", "./assets/brand/scenes/nexstock-brand-scene-16x9.jpg", "./assets/brand/symbols/nexstock-app-icon-1x1.png", "./assets/brand/symbols/nexstock-brand-symbol-1x1.png",
  "./assets/icons/pwa/icon-192x192.png", "./assets/icons/pwa/icon-512x512.png", "./assets/icons/pwa/icon-maskable-512x512.png"
];
const SHELL_URLS = new Set(SHELL_RESOURCES.map((resource) => new URL(resource, self.registration.scope).href));

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
  if (event.request.mode !== "navigate" && !SHELL_URLS.has(event.request.url)) return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error());
  }));
});
