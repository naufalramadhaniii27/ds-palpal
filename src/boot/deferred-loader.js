
/* v34: the builder data and code run after the sheet is on screen, in order, one part per task. __bldNeed() runs the rest at once.
   Split build (tools/split_dist.py, used for hosting): a part has data-src and no text. The loader fetches the files side by side, starting when the page
   is read or after the first frame, and runs them in the same order. The text is the same, so the sha256 in the page's CSP still checks it. */
(function(){ var t0=0;
  /* no cached list: a call while the page is still loading runs only the parts already parsed, the rest run later in order */
  function list(){ return document.querySelectorAll('script[type="text/x-defer"]'); }
  var TXT={}, ASK={}, DONE={}, FAILS={}, PEND=null, SYNC=false;/* fetched text by part name, fetches under way, parts run, failed tries, the step waiting for a file */
  function pname(s){ return s.getAttribute("data-defer"); }
  function ask(s){ var u=s.getAttribute("data-src"), n=pname(s); if(!u||ASK[n]||DONE[n]||TXT[n]!=null) return; ASK[n]=1;
    fetch(u,{credentials:"same-origin"}).then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.text(); }).then(function(t){ ASK[n]=0; if(DONE[n]) return; TXT[n]=t; if(PEND){ var f=PEND; PEND=null; f(); } },
      function(){ ASK[n]=0; FAILS[n]=(FAILS[n]||0)+1; if(FAILS[n]<=20) setTimeout(function(){ if(s.parentNode) ask(s); },Math.min(30000,1000*FAILS[n])); }); }
  function askAll(){ Array.prototype.forEach.call(document.querySelectorAll('script[type="text/x-defer"][data-src]'),ask); }
  window.addEventListener("online",askAll); document.addEventListener("DOMContentLoaded",function(){ if(t0) askAll(); },{once:true});
  /* __bldNeed() cannot wait, so a part that has not arrived is read with a synchronous request. The service worker or the HTTP cache answers it at once, except on a first visit */
  function syncGet(u){ try{ var q=new XMLHttpRequest(); q.open("GET",u,false); q.send(); if(q.status===200) return q.responseText; }catch(e){} return null; }
  function headWait(f){ var s=list()[0]; if(!s||!s.getAttribute("data-src")||TXT[pname(s)]!=null) return false; ask(s); PEND=f; return true; }
  function all(){ SYNC=true; try{ while(run1()){} }finally{ SYNC=false; } }
  /* T7: the builder reads saved data and uses the sheet, so its parts wait until the store has loaded IndexedDB and the sheet scripts ran (boot/store-gate.js) */
  function run1(){ if(!(window.__gateDone)) return false; var s=list()[0]; if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;/* v100: a part whose end tag has not been read yet is cut short, running it would stop with a syntax error */ var u=s.getAttribute("data-src"), n=pname(s), t;
    if(u){ ask(s); t=TXT[n]; if(t==null&&SYNC) t=syncGet(u); if(t==null) return false; delete TXT[n]; DONE[n]=1; } else t=s.text;
    var x=document.createElement("script"); x.text=window.__ttLoader?window.__ttLoader.createScript(t):t;/* T11 A1: Trusted Types */ s.parentNode.replaceChild(x,s); return true; }
  function fin(){ if(window.__deferDone||document.readyState==="loading"||list().length||!(window.__gateDone)) return; window.__deferDone=Math.round(performance.now()); try{ document.dispatchEvent(new Event("bldready")); }catch(e){} }
  window.__bldNeed=function(){ if(window.__deferDone) return; all(); if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",function(){ all(); fin(); }); return; } fin(); };
  /* T1: the parts run in short slices right after the first frame, while the page is still being read: about 10 ms of work per task,
     or one larger part, then the browser handles taps and drawing. Before, each part waited for an idle moment (up to 400 ms), and
     the first part waited for DOMContentLoaded, so the builder was ready 1 to 20 seconds after the sheet was on screen */
  var post=(window.scheduler&&typeof scheduler.postTask==="function")?function(f){ scheduler.postTask(f,{priority:"user-visible"}); }:(function(){
    if(typeof MessageChannel!=="function") return function(f){ setTimeout(f,0); };
    var mc=new MessageChannel(), q=[]; mc.port1.onmessage=function(){ var f=q.shift(); if(f) f(); }; return function(f){ q.push(f); mc.port2.postMessage(0); }; })();
  function step(){ if(window.__deferDone) return; if(!(window.__gateDone)){ setTimeout(step,20); return; } var t=performance.now(), ran=false;
    while(run1()){ ran=true; if(performance.now()-t>10) break; }
    if(!list().length){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fin,{once:true}); else fin(); return; }
    if(!ran&&document.readyState==="loading"){ setTimeout(step,40); return; }/* the next part is still being read */
    if(!ran&&headWait(function(){ post(step); })) return;/* split build: the file of the next part has not arrived, its arrival starts the next step */
    post(step); }
  function go(){ if(window.__deferDone||t0) return; t0=performance.now(); var on=0, st=function(){ if(on) return; on=1; askAll(); post(step); }; if(window.requestAnimationFrame&&document.visibilityState!=="hidden") requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(st,0); }); }); setTimeout(st,300); }/* two frames: the sheet is on screen before the first part runs */
  go();
})();
