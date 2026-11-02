// Guarda la app en el celu para que abra al instante (y aunque no haya señal).
// Las páginas se piden siempre a internet primero (así llegan las versiones nuevas);
// los archivos de la app tienen nombre único por versión, así que se sirven desde lo guardado.
const CACHE = "bocaditos-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase y demás: directo a internet

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("/", copy)); return res; })
        .catch(() => caches.match("/")),
    );
    return;
  }
  if (url.pathname.startsWith("/_expo/") || url.pathname.startsWith("/assets/") || /\.(png|ico|ttf|webmanifest)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
