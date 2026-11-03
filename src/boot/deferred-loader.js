
/* v34: the builder data and code run after the sheet is on screen, in order, one part per task. __bldNeed() runs the rest at once.
   Split build (tools/split_dist.py, used for hosting): a part has data-src and no text. The loader fetches the files side by side, starting when the page
   is read or after the first frame, and runs them in the same order. The text is the same, so the sha256 in the page's CSP still checks it. */
(function(){ let t0=0;
  /* no cached list: a call while the page is still loading runs only the parts already parsed, the rest run later in order */
  function list(){ return document.querySelectorAll('script[type="text/x-defer"]:not([data-lazy])'); }/* data-lazy parts wait for __lazyRun() */
  let TXT={}, ASK={}, DONE={}, FAILS={}, PEND=null, WAIT=[];/* fetched text by part name, fetches under way, parts run, failed tries, the step waiting for a file */
  function pname(s){ return s.getAttribute("data-defer"); }
  function ask(s){ const u=s.getAttribute("data-src"), n=pname(s); if(!u||ASK[n]||DONE[n]||TXT[n]!=null) return; ASK[n]=1;
    fetch(u,{credentials:"same-origin"}).then((r) =>{ if(!r.ok) throw new Error(String(r.status)); return r.text(); }).then((t) =>{ ASK[n]=0; if(DONE[n]) return; TXT[n]=t; if(PEND){ const f=PEND; PEND=null; f(); } const q=WAIT; WAIT=[]; q.forEach((f) =>{ f(); }); },
      () =>{ ASK[n]=0; FAILS[n]=(FAILS[n]||0)+1; if(FAILS[n]<=20) setTimeout(() =>{ if(s.parentNode) ask(s); },Math.min(30000,1000*FAILS[n])); }); }
  function askAll(){ Array.prototype.forEach.call(document.querySelectorAll('script[type="text/x-defer"][data-src]:not([data-lazy])'),ask); }
  window.addEventListener("online",askAll); document.addEventListener("DOMContentLoaded",() =>{ if(t0) askAll(); },{once:true});
  function headWait(f){ const s=list()[0]; if(!s||!s.getAttribute("data-src")||TXT[pname(s)]!=null) return false; ask(s); PEND=f; return true; }
    /* T7: the builder reads saved data and uses the sheet, so its parts wait until the store has loaded IndexedDB and the sheet scripts ran (boot/store-gate.js) */
  function run1(){ if(!(window.__gateDone)) return false; const s=list()[0]; if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;/* v100: a part whose end tag has not been read yet is cut short, running it would stop with a syntax error */ let u=s.getAttribute("data-src"), n=pname(s), t;
    if(u){ ask(s); t=TXT[n]; if(t==null) return false; delete TXT[n]; DONE[n]=1; } else t=s.text;
    const H=window.__deferHook;/* N32: tests/lib/trace.js sets it, nothing else does */ if(H) H(0,n);
    const x=document.createElement("script"); x.text=window.__ttLoader?window.__ttLoader.createScript(t):t;/* T11 A1: Trusted Types */ s.parentNode.replaceChild(x,s); if(H) H(1,n); return true; }
  /* Fase 2.2: a lazy part runs when its guard asks (window.__lazyRun). It answers false when the text has not arrived: the guard then returns what it has, and the loader runs the part as soon as the file is in and calls the hook set by the guard (window.__lazyOn[name]). The page reads the files 2.5 s after it is ready (warm()), so a request to the Library normally finds the text already here */
  const LAZY={}, LZ={}; window.__lazyOn={};
  const WANT={};/* a part some code is waiting for; warm() only fetches */
  function lazyAsk(s,quiet){ const n=s.getAttribute("data-defer"), u=s.getAttribute("data-src"); if(!quiet) WANT[n]=1; if(!u||LZ[n]||LAZY[n]!=null) return; LZ[n]=1;
    fetch(u,{credentials:"same-origin"}).then((r) =>{ if(!r.ok) throw new Error(String(r.status)); return r.text(); }).then((t) =>{ LZ[n]=0; LAZY[n]=t; const f=window.__lazyOn[n]; if(f&&WANT[n]&&s.parentNode) try{ f(); }catch(e){} },() =>{ LZ[n]=0; }); }
  window.__lazyRun=function(n){ const s=document.querySelector('script[type="text/x-defer"][data-lazy][data-defer="'+n+'"]'); if(!s) return true; const u=s.getAttribute("data-src"); const t=u?LAZY[n]:s.text; if(t==null){ lazyAsk(s); return false; } delete LAZY[n];
    const H=window.__deferHook; if(H) H(0,n); const x=document.createElement("script"); x.text=window.__ttLoader?window.__ttLoader.createScript(t):t; s.parentNode.replaceChild(x,s); if(H) H(1,n); return true; };
  window.__lazyReady=function(n){ const s=document.querySelector('script[type="text/x-defer"][data-lazy][data-defer="'+n+'"]'); if(!s||!s.getAttribute("data-src")||LAZY[n]!=null) return true; lazyAsk(s); return false; };/* true when a read will not have to wait */
  function warm(){ Array.prototype.forEach.call(document.querySelectorAll('script[type="text/x-defer"][data-lazy][data-src]'),(s) =>{ lazyAsk(s,true); }); }
  function fin(){ if(window.__deferDone||document.readyState==="loading"||list().length||!(window.__gateDone)) return; window.__deferDone=Math.round(performance.now()); try{ document.dispatchEvent(new Event("bldready")); }catch(e){} setTimeout(warm,2500); }
  /* M7: __bldNeed() returns a Promise. A page with the parts inside it runs them at once, in this call. A split page asks for the files and runs the rest as they arrive (before, it blocked on a synchronous request) */
  let NEEDP=null;
  window.__bldNeed=function(){ if(window.__deferDone) return Promise.resolve(); if(NEEDP) return NEEDP;
    NEEDP=new Promise((res) =>{ const tick=function(){ if(window.__deferDone){ res(); return; } if(!(window.__gateDone)){ setTimeout(tick,20); return; }
      while(run1()){} const l=list(); if(!l.length){ if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",tick,{once:true}); return; } fin(); res(); return; }
      const s0=l[0]; if(s0.getAttribute("data-src")&&TXT[pname(s0)]==null&&!(document.readyState==="loading"&&!s0.nextSibling)){ askAll(); WAIT.push(tick); return; } setTimeout(tick,40); };
      tick(); }); return NEEDP; };
  /* T1: the parts run in short slices right after the first frame, while the page is still being read: about 10 ms of work per task,
     or one larger part, then the browser handles taps and drawing. Before, each part waited for an idle moment (up to 400 ms), and
     the first part waited for DOMContentLoaded, so the builder was ready 1 to 20 seconds after the sheet was on screen */
  const post=(window.scheduler&&typeof scheduler.postTask==="function")?function(f){ scheduler.postTask(f,{priority:"user-visible"}); }:(function(){
    if(typeof MessageChannel!=="function") return function(f){ setTimeout(f,0); };
    const mc=new MessageChannel(), q=[]; mc.port1.onmessage=function(){ const f=q.shift(); if(f) f(); }; return function(f){ q.push(f); mc.port2.postMessage(0); }; })();
  function step(){ if(window.__deferDone) return; if(!(window.__gateDone)){ setTimeout(step,20); return; } let t=performance.now(), ran=false;
    while(run1()){ ran=true; if(performance.now()-t>10) break; }
    if(!list().length){ if(document.readyState==="loading") setTimeout(step,40); else fin(); return; }/* the parser may still add parts: keep stepping until the page is read (before, one empty list while loading ended the chain and the builder never loaded) */
    if(!ran&&document.readyState==="loading"){ setTimeout(step,40); return; }/* the next part is still being read */
    if(!ran&&headWait(() =>{ post(step); })) return;/* split build: the file of the next part has not arrived, its arrival starts the next step */
    post(step); }
  function go(){ if(window.__deferDone||t0) return; t0=performance.now(); let on=0, st=function(){ if(on) return; on=1; askAll(); post(step); }; if(window.requestAnimationFrame&&document.visibilityState!=="hidden") requestAnimationFrame(() =>{ requestAnimationFrame(() =>{ setTimeout(st,0); }); }); setTimeout(st,300); }/* two frames: the sheet is on screen before the first part runs */
  go();
})();
