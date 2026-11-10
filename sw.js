// Offline support for Link Swap Matcher.
// The page is fetched network-first so updates show straight away, with the saved copy used offline.
// Icons, the manifest, the PDF reader (cdnjs) and fonts are kept once fetched.
const CACHE='swap-matcher-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf('swap-matcher-')===0&&k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
function isLibrary(url){
  return /^https:\/\/(cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js|fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(url);
}
self.addEventListener('fetch',function(e){
  const req=e.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      const copy=res.clone();
      caches.open(CACHE).then(function(c){ c.put('./index.html',copy); });
      return res;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  if(req.url.indexOf(self.location.origin)===0||isLibrary(req.url)){
    e.respondWith(caches.match(req).then(function(hit){
      return hit||fetch(req).then(function(res){
        if(res&&(res.ok||res.type==='opaque')){ const copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); }
        return res;
      });
    }));
  }
});
