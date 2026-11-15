// Offline support for BLP Pay: the page network-first (saved copy offline), icons and fonts kept once fetched.
const CACHE='blp-pay-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){})); });
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k.indexOf('blp-pay-')===0&&k!==CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  const req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){ const copy=res.clone(); caches.open(CACHE).then(function(c){ c.put('./index.html',copy); }); return res; }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  const url=req.url;
  if(url.indexOf(self.registration.scope)===0||/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)){
    e.respondWith(caches.match(req).then(function(hit){ return hit||fetch(req).then(function(res){ if(res&&(res.ok||res.type==='opaque')){ const copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); } return res; }); }));
  }
});
