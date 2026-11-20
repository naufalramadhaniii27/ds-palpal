
/* === T1, v2: moving between Home and the sheet.
   Same character: a View Transition. The browser keeps a still image of the old screen while the new one draws (no half-drawn frames
   on a busy phone), then Home settles back and fades while the sheet rises in; going back to Home is the mirror. Another character
   reloads the page: Home fades out and the new page fades in (boot/arrive-flag.js, html.mi-arrive). Transform and opacity only, done
   by the compositor. Off with Immersive Off and Reduce Motion. === */
const FXS21A={};
FXS21A.off=function(){ const MI=FXENV.__MI; return !MI||MI.rm()||!document.body.animate; };
/* run swap() inside a View Transition with the class cls on <html> (it picks the keyframes in css/08). Without View Transitions: plain swap */
FXS21A.vt=function(cls,swap){ const D=document, html=D.documentElement; if(FXS21A.off()||!D.startViewTransition){ swap(); return false; }
  html.classList.add(cls); let t; try{ t=D.startViewTransition(swap); }catch(e){ html.classList.remove(cls); swap(); return false; }
  t.finished.finally(() =>{ html.classList.remove(cls); }); return true; };
FXS21A.active=function(){ try{ return (JSON.parse(__store.getItem("cs-roster-v1"))||{}).active; }catch(e){ return null; } };
/* another character: the page reloads. Home fades out, the next page fades in */
FXS21A.leave=function(go){ try{ sessionStorage.setItem("mi-sw","1"); }catch(e){}
  const hv=document.getElementById("homeV"), a=hv&&hv.animate([{opacity:1},{opacity:0,transform:"scale(.97)"}],{duration:180,easing:"ease-in",fill:"forwards"});
  let went=false; const g=() =>{ if(went) return; went=true; go(); }; if(a) a.onfinish=g; setTimeout(g,260); };
/* View or Edit on a Home card (fx/02 calls this with the card and the real tap) */
/* the sheet drawn before the deferred data is in shows stand-ins (GEAR, --) and changes about 0.7 s later. Keep the loader up until the data is in */
FXS21A.ready=function(go){ if(FXENV.__deferDone||!FXENV.__bldNeed){ go(); return; }
  const bz=document.getElementById("busy"), sp=bz&&bz.querySelector("div span:last-child"), old=sp?sp.textContent:"";
  if(sp) sp.textContent="Opening the sheet"; if(bz) bz.classList.add("on");
  const done=function(){ requestAnimationFrame(() =>{ if(bz) bz.classList.remove("on"); if(sp) setTimeout(() =>{ sp.textContent=old; },650); go(); }); };
  /* load after the loader is painted: __bldNeed runs the remaining parts in one task */
  requestAnimationFrame(() =>{ setTimeout(() =>{ let p; try{ p=FXENV.__bldNeed(); }catch(e){ p=null; } Promise.resolve(p).catch(() =>{}).then(done); },0); }); };
FXENV.__miFlyOut=function(card,go0){ const go=function(){ FXS21A.ready(go0); };
  if(FXS21A.off()){ go(); return; }
  const b=card&&card.querySelector("[data-hview]");
  if(b&&b.getAttribute("data-hview")===FXS21A.active()){ FXS21A.ready(() =>{ if(FXS21A.vt("vt-go",go0)) FXENV.__miFlyN=(FXENV.__miFlyN||0)+1; }); return; }
  FXS21A.leave(go0); };
/* Home from the sheet: the Home button inside a View Transition. The tap is repeated inside it, once */
FXS21A.again=false;
FXS21A.home=function(e){ const b=e.target.closest&&e.target.closest("#rosterBtn"); if(!b||FXS21A.again||FXS21A.off()||!document.startViewTransition) return;
  const hv=document.getElementById("homeV"); if(hv&&!hv.hidden) return; e.preventDefault(); e.stopImmediatePropagation();
  FXS21A.vt("vt-back",() =>{ FXS21A.again=true; try{ b.click(); }finally{ FXS21A.again=false; } }); FXENV.__miFlyBackN=(FXENV.__miFlyBackN||0)+1; };
addEventListener("click",FXS21A.home,true);
