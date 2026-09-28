const CACHE='student-manager-shell-v10';
const ASSETS=['./','./index.html','./styles.css','./app.js','./xlsx.full.min.js','./manifest.json','./icon-192.svg','./icon-512.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(CACHE).then(cache=>fetch(e.request).then(res=>{cache.put(e.request,res.clone());return res}).catch(()=>cache.match(e.request).then(cached=>cached||cache.match('./index.html')))))});
