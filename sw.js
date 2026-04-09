const CACHE = "qx-pwa-v1";

const CORE = [
  "./",
  "./index.html",
  "./lib/application.js",
  "./manifest.webmanifest",
];

self.addEventListener("push", function(event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "Class Scheduler";
  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",
    data: data.url || "/"
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin GET requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
