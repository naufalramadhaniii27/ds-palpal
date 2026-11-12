/* D&D Sheet service worker. The app shell is served from the cache first, so the app opens without internet. A new version is fetched in the
   background, and the page asks before it reloads. Character data stays in IndexedDB (with a localStorage copy) and is never touched here. */
var CACHE="dnd-sheet-30e660cd9656c360";
var SHELL=["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "img/vig/state/offline.avif"];
self.addEventListener("install",function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL.map(function(u){ return new Request(u,{cache:"reload"}); })); })); });
self.addEventListener("activate",function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(n){ return n.indexOf("dnd-sheet-")===0&&n!==CACHE; }).map(function(n){ return caches.delete(n); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("message",function(e){ if(e.data&&e.data.type==="SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch",function(e){ var r=e.request; if(r.method!=="GET") return; var u=new URL(r.url); if(u.origin!==self.location.origin) return; if(u.pathname.indexOf("/api/")===0) return; /* T8: the cloud API always goes to the network, never to the cache */
  if(r.mode==="navigate"){ e.respondWith(caches.open(CACHE).then(function(c){ return c.match("./").then(function(hit){ return hit||fetch(r).then(function(res){ if(res.ok&&!res.redirected) c.put("./",res.clone()); return res; }); }); })); return; }
  e.respondWith(caches.open(CACHE).then(function(c){ return c.match(r,{ignoreSearch:true}).then(function(hit){ var net=fetch(r).then(function(res){ if(res.ok&&res.type==="basic") c.put(r,res.clone()); return res; }).catch(function(){ return hit||Response.error(); }); return hit||net; }); }));
});
