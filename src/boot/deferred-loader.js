
/* v34: the builder data and code run after the sheet is on screen, in order, one part per task. __bldNeed() runs the rest at once.
   Split build (tools/split_dist.py, used for hosting): a part has data-src and no text. The loader fetches the files side by side, starting when the page
   is read or after the first frame, and runs them in the same order. The text is the same, so the sha256 in the page's CSP still checks it. */
/* SOLID stage 13: the loader is a few small closures that share one state object, BootEnv.ld (S). The order of every effect at load is the same as before. */
(function(){ const S=BootEnv.ld={t0:0};
  /* no cached list: a call while the page is still loading runs only the parts already parsed, the rest run later in order */
  S.list=function(){ return document.querySelectorAll('script[type="text/x-defer"]:not([data-lazy])'); };/* data-lazy parts wait for __lazyRun() */
  S.TXT={}; S.ASK={}; S.DONE={}; S.FAILS={}; S.PEND=null; S.WAIT=[];/* fetched text by part name, fetches under way, parts run, failed tries, the step waiting for a file */
  S.pname=function(s){ return s.getAttribute("data-defer"); };
  S.ask=function(s){ const u=s.getAttribute("data-src"), n=S.pname(s); if(!u||S.ASK[n]||S.DONE[n]||S.TXT[n]!=null) return; S.ASK[n]=1;
    fetch(u,{credentials:"same-origin"}).then((r) =>{ if(!r.ok) throw new Error(String(r.status)); return r.text(); }).then((t) =>{ S.ASK[n]=0; if(S.DONE[n]) return; S.TXT[n]=t; if(S.PEND){ const f=S.PEND; S.PEND=null; f(); } const q=S.WAIT; S.WAIT=[]; q.forEach((f) =>{ f(); }); },
      () =>{ S.ASK[n]=0; S.FAILS[n]=(S.FAILS[n]||0)+1; if(S.FAILS[n]<=20) setTimeout(() =>{ if(s.parentNode) S.ask(s); },Math.min(30000,1000*S.FAILS[n])); }); };
  S.askAll=function(){ Array.prototype.forEach.call(document.querySelectorAll('script[type="text/x-defer"][data-src]:not([data-lazy])'),S.ask); };
  BootEnv.addEventListener("online",S.askAll); document.addEventListener("DOMContentLoaded",() =>{ if(S.t0) S.askAll(); },{once:true});
  S.headWait=function(f){ const s=S.list()[0]; if(!s||!s.getAttribute("data-src")||S.TXT[S.pname(s)]!=null) return false; S.ask(s); S.PEND=f; return true; };
})();
(function(){ const S=BootEnv.ld;
    /* T7: the builder reads saved data and uses the sheet, so its parts wait until the store has loaded IndexedDB and the sheet scripts ran (boot/store-gate.js) */
  S.run1=function(){ if(!(BootEnv.__gateDone)) return false; const s=S.list()[0]; if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;/* v100: a part whose end tag has not been read yet is cut short, running it would stop with a syntax error */ let u=s.getAttribute("data-src"), n=S.pname(s), t;
    if(u){ S.ask(s); t=S.TXT[n]; if(t==null) return false; delete S.TXT[n]; S.DONE[n]=1; } else t=s.text;
    const H=BootEnv.__deferHook;/* N32: tests/lib/trace.js sets it, nothing else does */ if(H) H(0,n);
    const x=document.createElement("script"); x.text=BootEnv.__ttLoader?BootEnv.__ttLoader.createScript(t):t;/* T11 A1: Trusted Types */ s.parentNode.replaceChild(x,s); if(H) H(1,n); return true; };
})();
(function(){ const S=BootEnv.ld;
  /* Fase 2.2: a lazy part runs when its guard asks (window.__lazyRun). It answers false when the text has not arrived: the guard then returns what it has, and the loader runs the part as soon as the file is in and calls the hook set by the guard (window.__lazyOn[name]). The page reads the files 2.5 s after it is ready (warm()), so a request to the Library normally finds the text already here */
  S.LAZY={}; S.LZ={}; BootEnv.__lazyOn={};
  S.WANT={};/* a part some code is waiting for; warm() only fetches */
  S.lazyAsk=function(s,quiet){ const n=s.getAttribute("data-defer"), u=s.getAttribute("data-src"); if(!quiet) S.WANT[n]=1; if(!u||S.LZ[n]||S.LAZY[n]!=null) return; S.LZ[n]=1;
    fetch(u,{credentials:"same-origin"}).then((r) =>{ if(!r.ok) throw new Error(String(r.status)); return r.text(); }).then((t) =>{ S.LZ[n]=0; S.LAZY[n]=t; const f=BootEnv.__lazyOn[n]; if(f&&S.WANT[n]&&s.parentNode) try{ f(); }catch(e){} },() =>{ S.LZ[n]=0; }); };
  BootEnv.__lazyRun=function(n){ const s=document.querySelector('script[type="text/x-defer"][data-lazy][data-defer="'+n+'"]'); if(!s) return true; const u=s.getAttribute("data-src"); const t=u?S.LAZY[n]:s.text; if(t==null){ S.lazyAsk(s); return false; } delete S.LAZY[n];
    const H=BootEnv.__deferHook; if(H) H(0,n); const x=document.createElement("script"); x.text=BootEnv.__ttLoader?BootEnv.__ttLoader.createScript(t):t; s.parentNode.replaceChild(x,s); if(H) H(1,n); return true; };
  BootEnv.__lazyReady=function(n){ const s=document.querySelector('script[type="text/x-defer"][data-lazy][data-defer="'+n+'"]'); if(!s||!s.getAttribute("data-src")||S.LAZY[n]!=null) return true; S.lazyAsk(s); return false; };/* true when a read will not have to wait */
  S.warm=function(){ Array.prototype.forEach.call(document.querySelectorAll('script[type="text/x-defer"][data-lazy][data-src]'),(s) =>{ S.lazyAsk(s,true); }); };
})();
(function(){ const S=BootEnv.ld;
  S.fin=function(){ if(BootEnv.__deferDone||document.readyState==="loading"||S.list().length||!(BootEnv.__gateDone)) return; BootEnv.__deferDone=Math.round(performance.now()); try{ document.dispatchEvent(new Event("bldready")); }catch(e){} setTimeout(S.warm,2500); };
  /* M7: __bldNeed() returns a Promise. A page with the parts inside it runs them at once, in this call. A split page asks for the files and runs the rest as they arrive (before, it blocked on a synchronous request) */
  S.NEEDP=null;
  S.tick=function(res){ if(BootEnv.__deferDone){ res(); return; } if(!(BootEnv.__gateDone)){ setTimeout(S.tick,20,res); return; }
      while(S.run1()){} const l=S.list(); if(!l.length){ if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",() =>{ S.tick(res); },{once:true}); return; } S.fin(); res(); return; }
      const s0=l[0]; if(s0.getAttribute("data-src")&&S.TXT[S.pname(s0)]==null&&!(document.readyState==="loading"&&!s0.nextSibling)){ S.askAll(); S.WAIT.push(() =>{ S.tick(res); }); return; } setTimeout(S.tick,40,res); };
  BootEnv.__bldNeed=function(){ if(BootEnv.__deferDone) return Promise.resolve(); if(S.NEEDP) return S.NEEDP;
    S.NEEDP=new Promise((res) =>{ S.tick(res); }); return S.NEEDP; };
})();
(function(){ const S=BootEnv.ld;
  /* T1: the parts run in short slices right after the first frame, while the page is still being read: about 10 ms of work per task,
     or one larger part, then the browser handles taps and drawing. Before, each part waited for an idle moment (up to 400 ms), and
     the first part waited for DOMContentLoaded, so the builder was ready 1 to 20 seconds after the sheet was on screen */
  S.post=(BootEnv.scheduler&&typeof scheduler.postTask==="function")?function(f){ scheduler.postTask(f,{priority:"user-visible"}); }:(function(){
    if(typeof MessageChannel!=="function") return function(f){ setTimeout(f,0); };
    const mc=new MessageChannel(), q=[]; mc.port1.onmessage=function(){ const f=q.shift(); if(f) f(); }; return function(f){ q.push(f); mc.port2.postMessage(0); }; })();
  S.step=function(){ if(BootEnv.__deferDone) return; if(!(BootEnv.__gateDone)){ setTimeout(S.step,20); return; } let t=performance.now(), ran=false;
    while(S.run1()){ ran=true; if(performance.now()-t>10) break; }
    if(!S.list().length){ if(document.readyState==="loading") setTimeout(S.step,40); else S.fin(); return; }/* the parser may still add parts: keep stepping until the page is read (before, one empty list while loading ended the chain and the builder never loaded) */
    if(!ran&&document.readyState==="loading"){ setTimeout(S.step,40); return; }/* the next part is still being read */
    if(!ran&&S.headWait(() =>{ S.post(S.step); })) return;/* split build: the file of the next part has not arrived, its arrival starts the next step */
    S.post(S.step); };
  S.go=function(){ if(BootEnv.__deferDone||S.t0) return; S.t0=performance.now(); let on=0, st=function(){ if(on) return; on=1; S.askAll(); S.post(S.step); }; if(BootEnv.requestAnimationFrame&&document.visibilityState!=="hidden") requestAnimationFrame(() =>{ requestAnimationFrame(() =>{ setTimeout(st,0); }); }); setTimeout(st,300); };/* two frames: the sheet is on screen before the first part runs */
  S.go();
})();
