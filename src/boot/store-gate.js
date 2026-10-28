/* T7: storage on IndexedDB. window.__store has the localStorage API (getItem, setItem, removeItem, key, length, clear) on a copy in memory.
   Reads are instant from memory. Writes go to memory at once, then to IndexedDB (database "dnd-sheet", store "kv") in one transaction per task,
   and also to localStorage as a mirror while it fits. The mirror keeps older app versions and tools working and is a second copy.
   A mirror write that fails (localStorage full) is listed in meta "lsFail", so IndexedDB stays the source for that key.
   Start: the app and effect scripts (type text/x-gate) run after the copy in memory is filled, in page order.
   Reconcile at start, per key: a key in lsFail takes the IndexedDB value. Otherwise a localStorage value that differs from IndexedDB was written
   outside this app version (an older version, a test, a tool) and wins, also a removed key. When localStorage holds no app data at all
   (browser cleanup of one store), IndexedDB is kept as it is.
   First run: every localStorage key is copied, a full copy is kept under "__legacy-backup" (meta), and each value is read back before use.
   No IndexedDB (blocked, private mode in old browsers, error, or no answer in 2.5 s): the app runs on localStorage as before (mode "ls"). */
(function(){
  var MEM=new Map(), MODE="", DB=null, FAIL={}, Q=new Map(), QT=0, BC=null, TAB=Math.random().toString(36).slice(2), DONE=false, WAIT=[], ERR="";
  var DBN="dnd-sheet", KV="kv", META="meta", MARK="cs-store-v1";
  function own(k){ return k!==MARK; }
  function lsAll(){ var o={}; try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k!=null&&own(k)) o[k]=localStorage.getItem(k); } }catch(e){} return o; }
  function lsPut(k,v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); if(FAIL[k]){ delete FAIL[k]; metaSoon(); } return true; }catch(e){ if(!FAIL[k]){ FAIL[k]=1; metaSoon(); } return false; } }
  /* the list of failed mirror keys is written in the same transaction as the values, so a closed page never leaves a stale localStorage value that would win at the next start */
  var MDIRTY=false; function metaSoon(){ if(MODE!=="idb") return; MDIRTY=true; if(!QT) QT=setTimeout(flush,0); }
  function fire(name,detail){ try{ window.dispatchEvent(new CustomEvent(name,{detail:detail})); }catch(e){} }
  function flush(){ QT=0; if(MODE!=="idb"||(!Q.size&&!MDIRTY)) return Promise.resolve(); var items=Array.from(Q.entries()), md=MDIRTY; Q.clear(); MDIRTY=false;
    return new Promise(function(res){ try{ var tx=DB.transaction([KV,META],"readwrite"), st=tx.objectStore(KV);
      items.forEach(function(x){ if(x[1]==null) st.delete(x[0]); else st.put(x[1],x[0]); }); if(md) tx.objectStore(META).put(Object.keys(FAIL),"lsFail");
      tx.oncomplete=function(){ if(ERR){ ERR=""; fire("cs-store-ok"); } if(!store.estimate||Date.now()-store.estimate.t>3e4) est(); res(); };
      tx.onerror=tx.onabort=function(){ ERR=String((tx.error&&tx.error.name)||"error"); if(md) MDIRTY=true; items.forEach(function(x){ if(!Q.has(x[0])) Q.set(x[0],x[1]); }); fire("cs-store-fail",ERR); res(); };
    }catch(e){ ERR=String(e&&e.name||e); fire("cs-store-fail",ERR); res(); } }); }
  function queue(k,v){ if(MODE!=="idb") return; Q.set(k,v); if(!QT) QT=setTimeout(flush,0); }
  function post(k,v){ if(BC) try{ BC.postMessage({k:k,v:v,from:TAB}); }catch(e){} }
  var store={
    getItem:function(k){ k=String(k); return MEM.has(k)?MEM.get(k):null; },
    setItem:function(k,v){ k=String(k); v=String(v); if(MODE==="ls"){ localStorage.setItem(k,v); MEM.set(k,v); return; } MEM.set(k,v); queue(k,v); lsPut(k,v); post(k,v); },
    removeItem:function(k){ k=String(k); if(MODE==="ls"){ try{ localStorage.removeItem(k); }catch(e){} MEM.delete(k); return; } MEM.delete(k); queue(k,null); lsPut(k,null); post(k,null); },
    key:function(i){ var a=Array.from(MEM.keys()); return i>=0&&i<a.length?a[i]:null; },
    clear:function(){ Array.from(MEM.keys()).forEach(function(k){ store.removeItem(k); }); },
    flush:function(){ return flush(); },
    mode:function(){ return MODE; },
    ready:function(f){ if(DONE) f(); else WAIT.push(f); },
    failed:function(){ return Object.keys(FAIL); },
    estimate:null
  };
  Object.defineProperty(store,"length",{get:function(){ return MEM.size; }});
  window.__store=store;
  function est(){ try{ if(navigator.storage&&navigator.storage.estimate) navigator.storage.estimate().then(function(e){ store.estimate={usage:e.usage||0,quota:e.quota||0,t:Date.now()}; },function(){}); }catch(e){} }
  /* other tabs: the localStorage event and this channel both update the copy in memory before the app's own listeners run */
  window.addEventListener("storage",function(e){ if(MODE!=="idb"||!e.key||!own(e.key)) return; if(e.newValue==null) MEM.delete(e.key); else MEM.set(e.key,e.newValue); });
  function bcOn(){ try{ if(typeof BroadcastChannel!=="function") return; BC=new BroadcastChannel("cs-store"); BC.onmessage=function(m){ var d=m&&m.data; if(!d||d.from===TAB||!d.k) return; var old=MEM.has(d.k)?MEM.get(d.k):null; if(old===d.v) return;
      if(d.v==null) MEM.delete(d.k); else MEM.set(d.k,d.v); try{ window.dispatchEvent(new StorageEvent("storage",{key:d.k,oldValue:old,newValue:d.v})); }catch(e){} }; }catch(e){ BC=null; } }
  function useLS(why){ if(MODE) return; MODE="ls"; var o=lsAll(); Object.keys(o).forEach(function(k){ MEM.set(k,o[k]); }); store.why=why||""; start(); }
  function start(){ if(DONE) return; DONE=true; est(); var w=WAIT; WAIT=[]; w.forEach(function(f){ try{ f(); }catch(e){ setTimeout(function(){ throw e; }); } }); run(); }
  /* run the gated scripts in page order. Each one runs as a classic script, as if it were inline */
  /* one script per task, as the page parser does between inline scripts: timers a script sets (setTimeout 0) run before the next script */
  function run(){ var s=document.querySelector('script[type="text/x-gate"]'); if(!s) return; var x=document.createElement("script"); x.text=s.text; s.parentNode.replaceChild(x,s); setTimeout(run,0); }
  function openDB(){ return new Promise(function(res,rej){ var rq; try{ rq=indexedDB.open(DBN,1); }catch(e){ rej(e); return; }
    rq.onupgradeneeded=function(){ var d=rq.result; if(!d.objectStoreNames.contains(KV)) d.createObjectStore(KV); if(!d.objectStoreNames.contains(META)) d.createObjectStore(META); };
    rq.onsuccess=function(){ res(rq.result); }; rq.onerror=function(){ rej(rq.error); }; rq.onblocked=function(){ rej(new Error("blocked")); }; }); }
  function getAll(d,name){ return new Promise(function(res,rej){ var o={}, tx=d.transaction(name,"readonly"), st=tx.objectStore(name), rq=st.openCursor();
    rq.onsuccess=function(){ var c=rq.result; if(c){ o[c.key]=c.value; c.continue(); } }; tx.oncomplete=function(){ res(o); }; tx.onerror=tx.onabort=function(){ rej(tx.error); }; }); }
  function putAll(d,kv,meta,del){ return new Promise(function(res,rej){ var tx=d.transaction([KV,META],"readwrite"), st=tx.objectStore(KV), mt=tx.objectStore(META);
    Object.keys(kv).forEach(function(k){ st.put(kv[k],k); }); (del||[]).forEach(function(k){ st.delete(k); }); Object.keys(meta).forEach(function(k){ mt.put(meta[k],k); });
    tx.oncomplete=function(){ res(); }; tx.onerror=tx.onabort=function(){ rej(tx.error); }; }); }
  var timer=setTimeout(function(){ useLS("timeout"); },2500);
  if(!window.indexedDB){ clearTimeout(timer); useLS("none"); return; }
  openDB().then(function(d){ DB=d; d.onversionchange=function(){ try{ d.close(); }catch(e){} };
    return Promise.all([getAll(d,KV),getAll(d,META)]).then(function(r){ var idb=r[0], meta=r[1], ls=lsAll(), lsKeys=Object.keys(ls), fails={}, put={}, del=[], m={};
      (meta.lsFail||[]).forEach(function(k){ fails[k]=1; });
      if(!meta.migrated){ m.migrated=new Date().toISOString(); if(lsKeys.length) m["__legacy-backup"]={t:m.migrated,keys:ls}; }
      if(lsKeys.length){ var all={}; Object.keys(idb).concat(lsKeys).forEach(function(k){ all[k]=1; });
        Object.keys(all).forEach(function(k){ var a=ls.hasOwnProperty(k)?ls[k]:null, b=idb.hasOwnProperty(k)?idb[k]:null;
          if(fails[k]){ if(a===b) delete fails[k]; return; }
          if(a!==b){ if(a==null){ del.push(k); delete idb[k]; } else { put[k]=a; idb[k]=a; } } }); }
      m.lsFail=Object.keys(fails);
      return putAll(d,put,m,del).then(function(){ return getAll(d,KV); }).then(function(back){
        /* read back: what is used must be what was written */
        Object.keys(put).forEach(function(k){ if(back[k]!==put[k]) throw new Error("read back differs for "+k); });
        if(MODE) return;/* the timeout already started the app on localStorage */
        clearTimeout(timer); MODE="idb"; FAIL=fails; Object.keys(back).forEach(function(k){ if(own(k)&&typeof back[k]==="string") MEM.set(k,back[k]); });
        try{ localStorage.setItem(MARK,"1"); }catch(e){} bcOn(); start(); }); }); }).catch(function(e){ clearTimeout(timer); store.why=String(e&&e.message||e); useLS(store.why); });
  addEventListener("pagehide",function(){ flush(); });
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden") flush(); });
})();
