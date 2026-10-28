
/* v34: the builder data and code run after the sheet is on screen, in order, one part per task. __bldNeed() runs the rest at once */
(function(){ var t0=0;
  /* no cached list: a call while the page is still loading runs only the parts already parsed, the rest run later in order */
  function list(){ return document.querySelectorAll('script[type="text/x-defer"]'); }
  /* T7: the builder reads saved data and uses the sheet, so its parts wait until the store has loaded IndexedDB and the sheet scripts ran (boot/store-gate.js) */
  function run1(){ if(!(window.__gateDone)) return false; var s=list()[0]; if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;/* v100: a part whose end tag has not been read yet is cut short, running it would stop with a syntax error */ var x=document.createElement("script"); x.text=s.text; s.parentNode.replaceChild(x,s); return true; }
  function fin(){ if(window.__deferDone||document.readyState==="loading"||list().length||!(window.__gateDone)) return; window.__deferDone=Math.round(performance.now()); try{ document.dispatchEvent(new Event("bldready")); }catch(e){} }
  window.__bldNeed=function(){ if(window.__deferDone) return; while(run1()){} if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",function(){ while(run1()){} fin(); }); return; } fin(); };
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
    post(step); }
  function go(){ if(window.__deferDone||t0) return; t0=performance.now(); var on=0, st=function(){ if(on) return; on=1; post(step); }; if(window.requestAnimationFrame&&document.visibilityState!=="hidden") requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(st,0); }); }); setTimeout(st,300); }/* two frames: the sheet is on screen before the first part runs */
  go();
})();
