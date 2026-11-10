// 画面のファイルを端末に保存して、すぐ開けるようにする（データ通信は毎回ネットから）
const CACHE = "kyuyocho-v2";
const SHELL = ["./", "index.html", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;               // 保存・読み込み（POST）はそのままネットへ
  const url = new URL(req.url);
  if (url.origin !== location.origin && !url.host.includes("fonts.g")) return;
  // 新しい版をすぐ反映するため、まずネット。つながらない時だけ保存済みの画面
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
