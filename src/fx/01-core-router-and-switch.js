
/* === v55 MI core: one event router, one switch for effects (Immersive: full / lite / off, plus reduce motion),
   one haptic map. Every v55 effect goes through here. === */
var MI=(function(){
  var html=document.documentElement, mq=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
  function ls(k,d){ try{ return localStorage.getItem(k)||d; }catch(e){ return d; } }
  var M={ mode:ls("mi-fx","full"), bz:ls("mi-bz","on") };
  M.rm=function(){ return M.mode==="off"||!!(mq&&mq.matches); };
  M.full=function(){ return M.mode==="full"&&!M.rm(); };
  M.apply=function(){ html.classList.toggle("mi-off",M.mode==="off"); html.classList.toggle("mi-lite",M.mode==="lite"); };
  /* next frame, or 60 ms later if this browser holds frames back. Anything the app must still do goes through here, so it always happens */
  window.__miNF=function(fn){ var d=false, go=function(){ if(d) return; d=true; fn(); }; requestAnimationFrame(go); setTimeout(go,60); };
  /* safety net: if the browser refuses an effect's animation, run it with a plain curve rather than leave a half-made effect on screen */
  (function(){ var EP=window.Element&&Element.prototype, _an=EP&&EP.animate; if(!_an||_an.__mi) return; var safe=function(k,o){ try{ return _an.call(this,k,o); }catch(e){ if(o&&typeof o==="object"){ var o2={}; for(var x in o) o2[x]=o[x]; o2.easing="ease-out"; try{ return _an.call(this,k,o2); }catch(e2){} } throw e; } }; safe.__mi=1; EP.animate=safe; })();
  M.set=function(k,v){ M[k]=v; try{ localStorage.setItem(k==="mode"?"mi-fx":"mi-bz",v); }catch(e){} M.apply(); if(window.__miAmb) window.__miAmb(true); };
  var HZ={light:8,medium:[10,30,12],heavy:[16,40,22],success:[10,40,18]};
  M.buzz=function(k){ if(M.bz!=="on"||M.rm()) return; try{ if(navigator.vibrate) navigator.vibrate(HZ[k]||k||8); }catch(e){} };
  /* router: one real listener per event type; handlers run in the order they were added and stop when one stops propagation */
  var R={}, PASSIVE={pointermove:1,pointerover:1,scroll:1};
  M.on=function(type,fn,opt){ var cap=opt===true||!!(opt&&opt.capture), key=type+(cap?"!":"");
    if(!R[key]){ R[key]=[]; document.addEventListener(type,function(e){ var L=R[key]; for(var i=0;i<L.length;i++){ try{ L[i](e); }catch(er){ if(window.console) console.error(er); } if(e.cancelBubble) break; } },PASSIVE[type]?{capture:cap,passive:true}:cap); }
    R[key].push(fn); };
  /* exit animations: a fixed copy of an element the app is about to remove or redraw. The copy is animated, the app logic is untouched. */
  M.ghost=function(el){ if(!el||!el.getBoundingClientRect) return null; var r=el.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return null;
    var g=el.cloneNode(true), cs=getComputedStyle(el); g.removeAttribute("id"); Array.prototype.forEach.call(g.querySelectorAll("[id]"),function(x){ x.removeAttribute("id"); });
    g.setAttribute("aria-hidden","true"); g.classList.add("mi-ghost-copy");
    g.style.cssText+=";position:fixed;left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;margin:0;z-index:var(--z-fx);pointer-events:none;box-sizing:border-box;background:"+cs.backgroundColor+";border-radius:"+cs.borderRadius;
    document.body.appendChild(g); setTimeout(function(){ g.remove(); },3000); return g; };
  M.apply(); return M;
})();
window.__MI=MI;

