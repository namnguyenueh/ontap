var C='ontap-qh-v3',F=['./','./index.html','./manifest.json','./icon.png','./config.js'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(F);}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;
 e.respondWith(caches.open(C).then(function(c){return c.match(e.request,{ignoreSearch:true}).then(function(hit){
  var net=fetch(e.request).then(function(r){if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(function(){return hit;});
  return hit||net;});}));});
