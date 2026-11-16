// Bản offline: lưu toàn bộ app trên máy, dùng được khi không có mạng.
var C='ontap-offline-v1',F=['./','./index.html','./manifest.json','../data.json'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(F);}).catch(function(){}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x.indexOf('ontap-offline')===0;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  // Ưu tiên bản đã lưu (mở ngay cả khi mất mạng); có mạng thì lặng lẽ cập nhật cho lần sau.
  e.respondWith(caches.open(C).then(function(c){return c.match(e.request,{ignoreSearch:true}).then(function(hit){
    var net=fetch(e.request,{cache:'no-cache'}).then(function(r){if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(function(){return hit||c.match('./index.html');});
    return hit||net;});}));
});
