// Bản lưu để dùng khi mất mạng. Luôn lấy bản mới nhất khi có mạng.
var C='ontap-qh-v6',F=['./','./index.html','./data.json','./config.js','./manifest.json','./icon.png','./online.js'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(F);}).catch(function(){}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||/admin\.html$/.test(u.pathname))return;
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(function(r){
    if(r&&r.ok){var cp=r.clone();caches.open(C).then(function(c){c.put(e.request,cp);});}
    return r;
  }).catch(function(){return caches.match(e.request,{ignoreSearch:true}).then(function(h){return h||caches.match('./index.html');});}));
});
