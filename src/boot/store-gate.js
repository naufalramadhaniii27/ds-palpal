/* T7: storage on IndexedDB. window.__store has the localStorage API (getItem, setItem, removeItem, key, length, clear) on a copy in memory.
   Reads are instant from memory. Writes go to memory at once, then to IndexedDB (database "dnd-sheet", store "kv") in one transaction per task,
   and also to localStorage as a mirror while it fits. The mirror keeps older app versions and tools working and is a second copy.
   A mirror write that fails (localStorage full) is listed in meta "lsFail" (and in the localStorage key cs-store-v1), so IndexedDB stays the source for that key.
   Fast start: when cs-store-v1 says every key is mirrored, the copy in memory is filled from localStorage at once and the app starts as fast as before.
   IndexedDB opens in the background and is brought level with memory.
   Slow start (first run, a key larger than localStorage allows, or cs-store-v1 missing): the app and effect scripts (type text/x-gate) wait until
   IndexedDB is read. Reconcile per key: a key in lsFail takes the IndexedDB value. Otherwise a localStorage value that differs from IndexedDB was
   written outside this app version (an older version, a test, a tool) and wins, also a removed key. When localStorage holds no app data at all
   (browser cleanup of one store), IndexedDB is kept as it is.
   First run: every localStorage key is copied, a full copy is kept under "__legacy-backup" (meta), and each value is read back before use.
   No IndexedDB (blocked, private mode in old browsers, error, or no answer in 2.5 s): the app runs on localStorage as before (mode "ls"). */
/* SOLID stage 13: the gate is a few small closures that share one state object, BootEnv.sg (G). The order of every effect at load is the same as before. */
(function(){
const G=BootEnv.sg={RUN:false, MEM:new Map(), MODE:"", DB:null, FAIL:{}, Q:new Map(), QT:0, BC:null, TAB:Math.random().toString(36).slice(2), DONE:false, WAIT:[], ERR:"", FAST:false};
G.DBN="dnd-sheet"; G.KV="kv"; G.META="meta"; G.MARK="cs-store-v1";
  G.own=function(k){ return k!==G.MARK; };
  G.lsAll=function(){ const o={}; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k!=null&&G.own(k)) o[k]=localStorage.getItem(k); } }catch(e){} return o; };
  /* cs-store-v1 in localStorage: the keys whose mirror failed. Written at once, so the next start knows whether localStorage alone is complete */
  /* N40 (seed 287): when this write fails, the mark is removed and was never written again while no key changed its failed state, so the next start read an older IndexedDB copy over the newer localStorage one. MARKBAD makes the next successful mirror write, and the pagehide, write it again */
  G.MARKBAD=false;
  G.markSet=function(){ try{ localStorage.setItem(G.MARK,JSON.stringify({v:1,fail:Object.keys(G.FAIL)})); G.MARKBAD=false; }catch(e){ G.MARKBAD=true; try{ localStorage.removeItem(G.MARK); }catch(er){} } };
  G.markGet=function(){ try{ const m=JSON.parse(localStorage.getItem(G.MARK)||"null"); return m&&m.v===1&&Array.isArray(m.fail)?m:null; }catch(e){ return null; } };
  G.lsPut=function(k,v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); if(G.FAIL[k]){ delete G.FAIL[k]; G.failChanged(); } else if(G.MARKBAD) G.markSet(); return true; }catch(e){ if(!G.FAIL[k]){ G.FAIL[k]=1; G.failChanged(); } return false; } };
  /* the list of failed mirror keys is written in the same transaction as the values, so a closed page never leaves a stale localStorage value that would win at the next start */
  G.MDIRTY=false;
 G.failChanged=function(){ G.markSet(); if(G.MODE!=="idb") return; G.MDIRTY=true; if(!G.QT) G.QT=setTimeout(G.flush,0); };
})();
(function(){ const G=BootEnv.sg;
  G.fire=function(name,detail){ try{ BootEnv.dispatchEvent(new CustomEvent(name,{detail:detail})); }catch(e){} };
  G.flush=function(){ G.QT=0; if(G.MODE!=="idb"||!G.DB||(!G.Q.size&&!G.MDIRTY)) return Promise.resolve(); const items=Array.from(G.Q.entries()), md=G.MDIRTY; G.Q.clear(); G.MDIRTY=false;
    return new Promise((res) =>{ try{ const tx=G.DB.transaction([G.KV,G.META],"readwrite"), st=tx.objectStore(G.KV);
      items.forEach((x) =>{ if(x[1]==null) st.delete(x[0]); else st.put(x[1],x[0]); }); if(md) tx.objectStore(G.META).put(Object.keys(G.FAIL),"lsFail");
      tx.oncomplete=function(){ if(G.ERR){ G.ERR=""; G.fire("cs-store-ok"); } if(!G.store.estimate||Date.now()-G.store.estimate.t>3e4) G.est(); res(); };
      tx.onerror=tx.onabort=function(){ G.ERR=String((tx.error&&tx.error.name)||"error"); if(md) G.MDIRTY=true; items.forEach((x) =>{ if(!G.Q.has(x[0])) G.Q.set(x[0],x[1]); }); G.fire("cs-store-fail",G.ERR); res(); };
    }catch(e){ G.ERR=String(e&&e.name||e); G.fire("cs-store-fail",G.ERR); res(); } }); };
})();
(function(){ const G=BootEnv.sg;
  G.queue=function(k,v){ if(G.MODE!=="idb") return; G.Q.set(k,v); if(!G.QT&&G.DB) G.QT=setTimeout(G.flush,0); };
  G.post=function(k,v){ if(G.BC) try{ G.BC.postMessage({k:k,v:v,from:G.TAB}); }catch(e){} };
})();
(function(){ const G=BootEnv.sg;
  G.store={
    getItem:function(k){ k=String(k); return G.MEM.has(k)?G.MEM.get(k):null; },
    setItem:function(k,v){ k=String(k); v=String(v); if(G.MODE==="ls"){ localStorage.setItem(k,v); G.MEM.set(k,v); return; } G.MEM.set(k,v); G.queue(k,v); G.lsPut(k,v); G.post(k,v); },
    removeItem:function(k){ k=String(k); if(G.MODE==="ls"){ try{ localStorage.removeItem(k); }catch(e){} G.MEM.delete(k); return; } G.MEM.delete(k); G.queue(k,null); G.lsPut(k,null); G.post(k,null); },
    key:function(i){ const a=Array.from(G.MEM.keys()); return i>=0&&i<a.length?a[i]:null; },
    clear:function(){ Array.from(G.MEM.keys()).forEach((k) =>{ G.store.removeItem(k); }); },
    flush:function(){ return G.DB||G.MODE!=="idb"?G.flush():new Promise((r) =>{ G.WDB.push(() =>{ G.flush().then(r); }); }); },
    mode:function(){ return G.MODE; },
    ready:function(f){ if(G.DONE) f(); else G.WAIT.push(f); },
    failed:function(){ return Object.keys(G.FAIL); },
    estimate:null
  };
  G.WDB=[];
  Object.defineProperty(G.store,"length",{get:function(){ return G.MEM.size; }});
  BootEnv.__store=G.store;
})();
(function(){ const G=BootEnv.sg;
  G.est=function(){ try{ if(navigator.storage&&navigator.storage.estimate) navigator.storage.estimate().then((e) =>{ G.store.estimate={usage:e.usage||0,quota:e.quota||0,t:Date.now()}; },() =>{}); }catch(e){} };
  /* other tabs: the localStorage event and this channel both update the copy in memory before the app's own listeners run */
  BootEnv.addEventListener("storage",(e) =>{ if(G.MODE!=="idb"||!e.key||!G.own(e.key)) return; if(e.newValue==null) G.MEM.delete(e.key); else G.MEM.set(e.key,e.newValue); });
  G.bcOn=function(){ try{ if(G.BC||typeof BroadcastChannel!=="function") return; G.BC=new BroadcastChannel("cs-store"); G.BC.onmessage=function(m){ const d=m&&m.data; if(!d||d.from===G.TAB||!d.k) return; const old=G.MEM.has(d.k)?G.MEM.get(d.k):null; if(old===d.v) return;
      if(d.v==null) G.MEM.delete(d.k); else G.MEM.set(d.k,d.v); try{ BootEnv.dispatchEvent(new StorageEvent("storage",{key:d.k,oldValue:old,newValue:d.v})); }catch(e){} }; }catch(e){ G.BC=null; } };
})();
(function(){ const G=BootEnv.sg;
  G.useLS=function(why){ if(G.MODE) return; G.MODE="ls"; const o=G.lsAll(); Object.keys(o).forEach((k) =>{ G.MEM.set(k,o[k]); }); G.store.why=why||""; G.start(); };
  G.start=function(){ if(G.DONE) return; G.DONE=true; G.store.t=Math.round(performance.now()); G.est(); const w=G.WAIT; G.WAIT=[]; w.forEach((f) =>{ try{ f(); }catch(e){ setTimeout(() =>{ throw e; }); } }); G.run(); };
  /* run the gated scripts in page order, each as a classic script. The first one runs at once, the rest one per task, as the page parser does
     between inline scripts: timers a script sets (setTimeout 0) run before the next script. This script sits in the head. A short script after
     the last gated block sets __gateAll and calls run() again */
    /* Gated blocks: the app and effect scripts start with if(!window.__storeHold){...}. On a fast start __storeHold is never set, so they run inline
     where the parser meets them, as before T7. On a slow start they skip, and run() runs them again in page order once the store is filled:
     the first at once, the rest one per task (timers a script sets run before the next one, as between inline scripts). A block the parser
     has not finished reading is left to the parser, which now runs it inline. The short script after the last block calls __gateRun */
  G.one=function(){ const s=document.querySelector('script[data-gate]:not([data-ran])'); if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;
    s.setAttribute("data-ran","1"); const x=document.createElement("script"); x.text=BootEnv.__ttLoader?BootEnv.__ttLoader.createScript(s.text):s.text;/* T11 A1: Trusted Types */ s.parentNode.insertBefore(x,s.nextSibling); return true; };
  G.gateEnd=function(){ if(BootEnv.__gateAll&&!BootEnv.__gateDone){ BootEnv.__gateDone=1; document.documentElement.classList.remove("st-wait"); G.fire("cs-gate-done"); } };
  G.run=function(){ if(!G.DONE||G.RUN) return; BootEnv.__storeHold=0; G.RUN=true; (function next(){ if(!G.one()){ G.RUN=false; if(!document.querySelector('script[data-gate]:not([data-ran])')) G.gateEnd(); return; } setTimeout(next,0); })(); };
  BootEnv.__gateRun=function(){ BootEnv.__gateAll=1; G.run(); };
})();
(function(){ const G=BootEnv.sg;
  G.openDB=function(){ return new Promise((res,rej) =>{ let rq; try{ rq=indexedDB.open(G.DBN,1); }catch(e){ rej(e); return; }
    rq.onupgradeneeded=function(){ const d=rq.result; if(!d.objectStoreNames.contains(G.KV)) d.createObjectStore(G.KV); if(!d.objectStoreNames.contains(G.META)) d.createObjectStore(G.META); };
    rq.onsuccess=function(){ res(rq.result); }; rq.onerror=function(){ rej(rq.error); }; rq.onblocked=function(){ rej(new Error("blocked")); }; }); };
  /* both stores in one transaction with getAll and getAllKeys: few round trips, so a busy page (parsing the large data blocks) answers sooner */
  G.readAll=function(d){ return new Promise((res,rej) =>{ const tx=d.transaction([G.KV,G.META],"readonly"), o={kv:{},meta:{}};
    [[G.KV,"kv"],[G.META,"meta"]].forEach((p) =>{ const st=tx.objectStore(p[0]), rk=st.getAllKeys(), rv=st.getAll();
      rv.onsuccess=function(){ const ks=rk.result||[], vs=rv.result||[]; for(let i=0;i<ks.length;i++) o[p[1]][ks[i]]=vs[i]; }; });
    tx.oncomplete=function(){ res(o); }; tx.onerror=tx.onabort=function(){ rej(tx.error); }; }); };
  G.putAll=function(d,kv,meta,del){ return new Promise((res,rej) =>{ const tx=d.transaction([G.KV,G.META],"readwrite"), st=tx.objectStore(G.KV), mt=tx.objectStore(G.META);
    Object.keys(kv).forEach((k) =>{ st.put(kv[k],k); }); (del||[]).forEach((k) =>{ st.delete(k); }); Object.keys(meta).forEach((k) =>{ mt.put(meta[k],k); });
    tx.oncomplete=function(){ res(); }; tx.onerror=tx.onabort=function(){ rej(tx.error); }; }); };
  G.dbReady=function(d){ G.DB=d; d.onversionchange=function(){ try{ d.close(); }catch(e){} }; const w=G.WDB; G.WDB=[]; w.forEach((f) =>{ f(); }); if(G.Q.size||G.MDIRTY) G.flush(); };
})();
(function(){ const G=BootEnv.sg;
G.fastStart=function(){
    /* fast start: localStorage holds every key. IndexedDB is brought level with memory in the background */
    G.FAST=true; G.store.fast=true; G.MODE="idb"; const o=G.lsAll(); Object.keys(o).forEach((k) =>{ G.MEM.set(k,o[k]); }); G.bcOn(); G.start();
    G.openDB().then((d) =>{ return G.readAll(d).then((r) =>{ const idb=r.kv, put={}, del=[];
        G.MEM.forEach((v,k) =>{ if(idb[k]!==v) put[k]=v; }); Object.keys(idb).forEach((k) =>{ if(!G.MEM.has(k)) del.push(k); });
        G.Q.clear(); const m={}; if(G.MDIRTY){ m.lsFail=Object.keys(G.FAIL); G.MDIRTY=false; }
        return (Object.keys(put).length||del.length||Object.keys(m).length?G.putAll(d,put,m,del):Promise.resolve()).then(() =>{ G.dbReady(d); }); }); })
      .catch((e) =>{ G.store.why=String(e&&e.message||e); G.MODE="ls"; G.Q.clear(); });/* no IndexedDB after all: localStorage only, as before */
};
G.boot=function(){ if(!BootEnv.indexedDB){ G.useLS("none"); return false; } const mk=G.markGet();
  if(mk&&!mk.fail.length&&G.lsAll()&&localStorage.length>1) G.fastStart(); else G.slowStart();
  return true; };
})();
(function(){ const G=BootEnv.sg;
G.slowPlan=function(r){ const idb=r.kv, meta=r.meta, ls=G.lsAll(), lsKeys=Object.keys(ls), fails={}, put={}, del=[], m={};
        (meta.lsFail||[]).forEach((k) =>{ fails[k]=1; });
        if(!meta.migrated){ m.migrated=new Date().toISOString(); if(lsKeys.length) m["__legacy-backup"]={t:m.migrated,keys:ls}; }
        if(lsKeys.length){ const all={}; Object.keys(idb).concat(lsKeys).forEach((k) =>{ all[k]=1; });
          Object.keys(all).forEach((k) =>{ const a=ls.hasOwnProperty(k)?ls[k]:null, b=idb.hasOwnProperty(k)?idb[k]:null;
            if(fails[k]){ if(a===b) delete fails[k]; return; }
            if(a!==b){ if(a==null){ del.push(k); delete idb[k]; } else { put[k]=a; idb[k]=a; } } }); }
        const lf=Object.keys(fails).sort(), lf0=(meta.lsFail||[]).slice().sort(); if(lf.join("\n")!==lf0.join("\n")) m.lsFail=lf;
        const pk=Object.keys(put), need=pk.length||del.length||Object.keys(m).length;
        return {idb,fails,put,del,m,pk,need}; };
})();
(function(){ const G=BootEnv.sg;
G.slowRead=function(d,r,timer){ const {idb,fails,put,del,m,pk,need}=G.slowPlan(r);
        return (need?G.putAll(d,put,m,del).then(() =>{ return pk.length?G.readAll(d).then((x) =>{ return x.kv; }):idb; }):Promise.resolve(idb)).then((back) =>{
          /* read back: what is used must be what was written */
          pk.forEach((k) =>{ if(back[k]!==put[k]) throw new Error("read back differs for "+k); });
          if(G.MODE) return;/* the timeout already started the app on localStorage */
          clearTimeout(timer); G.MODE="idb"; G.FAIL=fails; Object.keys(back).forEach((k) =>{ if(G.own(k)&&typeof back[k]==="string") G.MEM.set(k,back[k]); });
          G.markSet(); G.bcOn(); G.dbReady(d); G.start(); }); };
G.slowStart=function(){
    /* slow start: the gated blocks wait, the empty sheet markup stays hidden (4 s at most) */
    BootEnv.__storeHold=1; document.documentElement.classList.add("st-wait"); setTimeout(() =>{ document.documentElement.classList.remove("st-wait"); },4000);
    const timer=setTimeout(() =>{ G.useLS("timeout"); },2500);
    G.openDB().then((d) =>{ return G.readAll(d).then((r) =>{ return G.slowRead(d,r,timer); }); }).catch((e) =>{ clearTimeout(timer); G.store.why=String(e&&e.message||e); G.useLS(G.store.why); });
};
})();
(function(){ const G=BootEnv.sg;
if(G.boot()){
  addEventListener("pagehide",() =>{ if(G.MARKBAD) G.markSet(); G.flush(); });
  document.addEventListener("visibilitychange",() =>{ if(document.visibilityState==="hidden") G.flush(); });
}
})();
