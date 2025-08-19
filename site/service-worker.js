self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('playniti-v1').then(c => c.addAll([
    '/site/index.html','/site/dashboard.html','/site/game.html',
    '/site/css/styles.css','/site/manifest.json'
  ])));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
