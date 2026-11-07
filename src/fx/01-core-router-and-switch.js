
/* === v55 MI core: one event router, one switch for effects (Immersive: full / lite / off, plus reduce motion),
   one haptic map. Every v55 effect goes through here. === */
var MI=(function(){
  const html=document.documentElement, mq=FXENV.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
  function ls(k,d){ try{ return __store.getItem(k)||d; }catch(e){ return d; } }
  const M={ mode:ls("mi-fx","full"), bz:ls("mi-bz","on") };
  M.rm=function(){ return M.mode==="off"||!!(mq&&mq.matches); };
  M.full=function(){ return M.mode==="full"&&!M.rm()&&!M.weak; };
  M.apply=function(){ html.classList.toggle("mi-off",M.mode==="off"); html.classList.toggle("mi-lite",M.mode==="lite"||(M.mode==="full"&&!!M.weak)); };
  /* T11 N14: effects that fit the device. When the person never chose an effects level (no mi-fx saved), a weak device gets the lite
     effects: 4 cores or fewer with 2 GB of memory or less, or the first 90 frames after start come slower than 28 ms (median).
     The saved setting is not changed, and a level chosen in Settings always wins */
  M.weak=false; M.tier=function(){ return M.mode!=="full"?M.mode:(M.weak?"lite (this device)":"full"); };
  (function(){ let chose=false; try{ chose=__store.getItem("mi-fx")!=null; }catch(e){} if(chose) return;
    if((navigator.hardwareConcurrency||8)<=4&&(navigator.deviceMemory||8)<=2){ M.weak=true; return; }
    let t=[], last=0, n=0; function f(ts){ if(last) t.push(ts-last); last=ts; if(++n<90) requestAnimationFrame(f); else { t.sort((a,b) =>{ return a-b; }); const med=t[t.length>>1]||16; if(med>28&&document.visibilityState==="visible"){ M.weak=true; M.apply(); } } }
    if(FXENV.requestAnimationFrame) requestAnimationFrame(f); })();
  /* next frame, or 60 ms later if this browser holds frames back. Anything the app must still do goes through here, so it always happens */
  FXENV.__miNF=function(fn){ let d=false, go=function(){ if(d) return; d=true; fn(); }; requestAnimationFrame(go); setTimeout(go,60); };
  /* safety net: if the browser refuses an effect's animation, run it with a plain curve rather than leave a half-made effect on screen */
  (function(){ const EP=FXENV.Element&&Element.prototype, _an=EP&&EP.animate; if(!_an||_an.__mi) return; const HT=document.documentElement, zero=function(o){ if(typeof o==='number') return 0; const z={}; if(o&&typeof o==='object') for(const y in o) z[y]=o[y]; z.duration=0; z.delay=0; z.endDelay=0; z.iterations=1; return z; };/* T2: Immersive Off runs every animation at length 0, so the end state is set at once and finish handlers still run */
    const safe=function(k,o){ if(HT.classList.contains('mi-off')) o=zero(o); try{ return _an.call(this,k,o); }catch(e){ if(o&&typeof o==="object"){ const o2={}; for(const x in o) o2[x]=o[x]; o2.easing="ease-out"; try{ return _an.call(this,k,o2); }catch(e2){} } throw e; } }; safe.__mi=1; EP.animate=safe; })();
  M.set=function(k,v){ M[k]=v; if(k==="mode") M.weak=false;/* T11 N14: a chosen level wins */ try{ __store.setItem(k==="mode"?"mi-fx":"mi-bz",v); }catch(e){} M.apply(); if(FXENV.__miAmb) FXENV.__miAmb(true); };
  const HZ={light:8,medium:[10,30,12],heavy:[16,40,22],success:[10,40,18]};
  M.buzz=function(k){ if(M.bz!=="on"||M.rm()) return; try{ if(navigator.vibrate) navigator.vibrate(HZ[k]||k||8); }catch(e){} };
  /* router: one real listener per event type; handlers run in the order they were added and stop when one stops propagation */
  const R={}, PASSIVE={pointermove:1,pointerover:1,scroll:1};
  M.on=function(type,fn,opt){ const cap=opt===true||!!(opt&&opt.capture), key=type+(cap?"!":"");
    if(!R[key]){ R[key]=[]; document.addEventListener(type,(e) =>{ const L=R[key]; for(let i=0;i<L.length;i++){ try{ L[i](e); }catch(er){ if(FXENV.console) console.error(er); } if(e.cancelBubble) break; } },PASSIVE[type]?{capture:cap,passive:true}:cap); }
    R[key].push(fn); };
  /* exit animations: a fixed copy of an element the app is about to remove or redraw. The copy is animated, the app logic is untouched. */
  M.ghost=function(el){ if(!el||!el.getBoundingClientRect) return null; const r=el.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return null;
    const g=el.cloneNode(true), cs=getComputedStyle(el); g.removeAttribute("id"); Array.prototype.forEach.call(g.querySelectorAll("[id]"),(x) =>{ x.removeAttribute("id"); });
    g.setAttribute("aria-hidden","true"); g.classList.add("mi-ghost-copy");
    g.style.cssText+=";position:fixed;left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;margin:0;z-index:var(--z-fx);pointer-events:none;box-sizing:border-box;background:"+cs.backgroundColor+";border-radius:"+cs.borderRadius;
    document.body.appendChild(g); setTimeout(() =>{ g.remove(); },3000); return g; };
  /* one shared Web Audio context for sound effects and music (T5). Created on first use, resumed when suspended */
  let AC0=null; M.ac=function(){ if(!AC0){ const A=FXENV.AudioContext||FXENV.webkitAudioContext; if(!A) return null; AC0=new A(); } if(AC0.state==="suspended") AC0.resume(); return AC0; };
  M.apply(); return M;
})();
FXENV.__MI=MI;

