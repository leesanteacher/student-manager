// 화면 파일 묶음의 버전입니다. 파일을 바꿀 때 숫자를 올리면 설치된 앱이 새 파일을 받습니다.
const CACHE = 'student-manager-shell-v14';
// 인터넷이 없어도 앱을 열 수 있게 미리 저장해 둘 화면 파일 목록입니다.
const ASSETS = [
  './index.html', './styles.css', './app.js',
  './xlsx.full.min.js', './manifest.json', './icon-192.svg', './icon-512.svg',
];

self.addEventListener('install', event => {
  // 새 버전의 파일을 저장하고, 설치가 끝나면 즉시 활성화합니다.
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(path => new Request(path, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // 새 버전이 준비되면 예전 파일 묶음을 지워 오래된 화면이 섞이지 않게 합니다.
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // 앱을 열 때는 저장해 둔 첫 화면을 즉시 보여 줍니다(오프라인 실행 지원).
    if (request.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      return shell || fetch(request);
    }

    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
