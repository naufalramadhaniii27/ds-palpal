
/* v34: the builder data and code run after the sheet is on screen, in order, one part per task. __bldNeed() runs the rest at once */
(function(){ var t0=0;
  /* no cached list: a call while the page is still loading runs only the parts already parsed, the rest run later in order */
  function list(){ return document.querySelectorAll('script[type="text/x-defer"]'); }
  function run1(){ var s=list()[0]; if(!s) return false; if(document.readyState==="loading"&&!s.nextSibling) return false;/* v100: a part whose end tag has not been read yet is cut short, running it would stop with a syntax error */ var x=document.createElement("script"); x.text=s.text; s.parentNode.replaceChild(x,s); return true; }
  function fin(){ if(window.__deferDone||document.readyState==="loading"||list().length) return; window.__deferDone=Math.round(performance.now()); try{ document.dispatchEvent(new Event("bldready")); }catch(e){} }
  window.__bldNeed=function(){ if(window.__deferDone) return; while(run1()){} if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",function(){ while(run1()){} fin(); }); return; } fin(); };
  /* each part runs when the page is idle (a tap or a scroll goes first), at the latest after a short wait */
  var idle=function(f,ms){ if(window.requestIdleCallback) requestIdleCallback(f,{timeout:ms}); else setTimeout(f,0); };
  function step(){ if(run1()&&list().length) idle(step,400); else fin(); }
  /* after the first frame, or after 150 ms when no frame comes (a reload that has not painted yet, a hidden tab) */
  function go(){ if(window.__deferDone||t0) return; t0=performance.now(); var on=0, st=function(){ if(on) return; on=1; idle(step,1200); }; if(window.requestAnimationFrame&&document.visibilityState!=="hidden") requestAnimationFrame(st); setTimeout(st,150); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go();
})();
