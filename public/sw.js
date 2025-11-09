// Service Worker dla PWA - Transport Na Żądanie
const CACHE_NAME = "bus-app-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Instalacja Service Workera
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Instalacja...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Service Worker: Cache otwarty");
      return cache.addAll(urlsToCache);
    })
  );
  
  // Aktywuj od razu
  self.skipWaiting();
});

// Aktywacja Service Workera
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: Aktywowany");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Service Worker: Usuwam stary cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Przejmij kontrolę natychmiast
  return self.clients.claim();
});

// Obsługa requestów
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Zwróć z cache lub pobierz z sieci
      return response || fetch(event.request);
    })
  );
});
