// netgauge service worker — caches the app shell only. See CLAUDE.md:
// a cached /download response would return instantly from disk and report
// a fake multi-gigabit result, so test traffic must never be intercepted here.

const CACHE_NAME = "netgauge-shell-v1";
const SHELL_URLS = ["/"];

// Must match NEXT_PUBLIC_WORKER_URL. Hardcoded because this file is served
// as a static asset, not run through the Next.js build.
const WORKER_ORIGIN = "https://netgauge-worker.zeeshanai.workers.dev";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch the data plane or the app's own API routes — only app-shell
  // navigations get cached. Everything else passes straight to the network.
  if (url.origin === WORKER_ORIGIN) return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match("/").then((cached) => cached ?? Response.error()))
  );
});
