import {bindLive,ovQueue,springEase} from "./00a-reg-late-ports.js";/* Responsibility: page indicator, page slide, card morph and the sheet spring. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env: __MI. Shared names with other modules come from the imports below, late names through __R. */
import {$,$$} from "./05-logic-helpers.js";
import {REDUCE,SPR,spring} from "./07-ui-theme-contrast-spring.js";
import {__set_openSheet,openSheet,sheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13b-ui-detail-spell-targets-render.js";
import {BCSS,PAGES,__set_goPage,__set_setTab,activeTab,bInd,curPage,mq,onPagerScroll,pager,pgShow,setTab} from "./21-ui-tabs-pager.js";

import {env} from "./00-env.js";


bindLive("bIndSet",{get:function(){return bIndSet;}});
bindLive("morphStop",{get:function(){return morphStop;}});
bindLive("pCur",{get:function(){return pCur;}});
bindLive("shClosed",{get:function(){return shClosed;}});
bindLive("shDragEnd",{get:function(){return shDragEnd;}});
bindLive("shOpened",{get:function(){return shOpened;}});
/* ===== v31 p11 swipe + tab slide (RU112, D6, D2) ===== */
let BSPR=0;
function bIndSet(x){ if(BCSS||BSPR) return; const s=SPR.bInd||(SPR.bInd={x:x,v:0,t:x,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; } s.x=s.t=x; s.v=0; bInd.style.transform="translateX("+x+"%)"; }
function bIndTo(i){ if(BCSS){ if(REDUCE) return; const d=(curPage-i)*100; if(!d) return; if(bInd.__a){ try{ bInd.__a.cancel(); }catch(er){} } const e=springEase(340,.82); try{ bInd.__a=bInd.animate([{translate:d+"%"},{translate:"0%"}],{duration:e.d,easing:e.e}); }catch(er){ bInd.__a=null; } return; } const t=i*100; BSPR=1; spring("bInd", t, (v) =>{ bInd.style.transform="translateX("+(Math.round(v*10)/10)+"%)"; if(Math.abs(v-t)<.05) BSPR=0; }, {k:340, zeta:.82}); if(REDUCE) BSPR=0; }
pager.addEventListener("touchstart",() =>{ if(bInd.__a){ try{ bInd.__a.cancel(); }catch(er){} bInd.__a=null; } if(BSPR){ BSPR=0; onPagerScroll(); } },{passive:true});
/* a finger on the pages takes the bar line back */
function pageSlide(el,dir){ if(!el||REDUCE) return; const c=dir>0?"psl-r":"psl-l", busy=el.classList.contains("psl-l")||el.classList.contains("psl-r"); el.classList.remove("psl-l","psl-r"); clearTimeout(el.__psl);
  const go=function(){ el.classList.add(c); el.__psl=setTimeout(() =>{ el.classList.remove("psl-l","psl-r"); },260); }; if(busy) requestAnimationFrame(go); else go(); }
/* no forced layout: a running slide restarts on the next frame */
__set_goPage((i,smooth) =>{ if(!mq.matches) return; pgShow(i); const from=curPage, w=pager.clientWidth; if(smooth&&i!==from&&Math.abs(pager.scrollLeft-from*w)<2){ pageSlide(document.getElementById(PAGES[i]), i>from?1:-1); bIndTo(i); }
  pager.scrollTo({left:i*w, behavior:"auto"}); });
__set_setTab((function(f){ return function(id,focus,instant){ const from=activeTab, ids=$$("#tabs .tab").map((t) =>{ return t.getAttribute("data-tab"); }), a=ids.indexOf(from), b=ids.indexOf(id);
  const r=f.apply(this,arguments); if(!instant&&!mq.matches&&id!==from&&a>=0&&b>=0){ const el=document.getElementById(id); if(el){ el.classList.remove("enter"); pageSlide(el,b>a?1:-1); } } return r; }; })(setTab));
/* ===== v31 p12 card to detail (RU131 shared element) ===== */
let MORPH=null, VTC=null;
function morphSrc(inf){ if(inf.matches(".sp-r,.islot")) return inf; if(inf.matches(".iname")) return inf.closest(".irow")||inf;
  const h=inf.closest(".fitem>h4,.aitem>h4"); if(h) return h.parentNode; if(inf.closest(".arow .an")) return inf.closest(".arow"); if(inf.closest(".rs-h")) return inf.closest(".rs"); return null; }
document.addEventListener("click",(e) =>{ MORPH=null; const t=e.target; if(!t||!t.closest||!document.startViewTransition||REDUCE) return; if(env.__MI&&!env.__MI.rm()) return;/* v55: the F1 morph engine takes over */ if(t.closest("#sheet")) return;
  const inf=t.closest("[data-info]"); if(!inf) return; const c=morphSrc(inf); if(c) MORPH={el:c,t:performance.now()}; },true);
function morphEnd(){ const root=document.documentElement; root.classList.remove("vt-card"); sheet.classList.remove("vt-hold","vt-on"); sheet.style.viewTransitionName=""; $$(".vt-src").forEach((x) =>{ x.classList.remove("vt-src"); x.style.viewTransitionName=""; }); VTC=null; }
function morphIn(card){ let root=document.documentElement, vt;
  card.classList.add("vt-src"); card.style.viewTransitionName="v31card"; root.classList.add("vt-card"); sheet.classList.add("vt-hold");
  try{ vt=document.startViewTransition(() =>{ card.style.viewTransitionName=""; sheet.classList.remove("vt-hold"); sheet.style.viewTransitionName="v31card"; }); }catch(er){ morphEnd(); return; }
  VTC=vt; vt.finished.then(() =>{ if(VTC===vt) morphEnd(); },() =>{ if(VTC===vt) morphEnd(); }); }
__set_openSheet((function(f){ return function(){ const m=MORPH; MORPH=null; morphStop();
  const ok=m&&m.el.isConnected&&performance.now()-m.t<400&&!sheet.classList.contains("on")&&document.startViewTransition&&!REDUCE;
  if(ok) sheet.classList.add("vt-on"); const r=f.apply(this,arguments); if(ok) morphIn(m.el); return r; }; })(openSheet));
function morphStop(){ if(VTC){ try{ VTC.skipTransition(); }catch(er){} morphEnd(); } }
/* ===== v31 p13 header shrinks on scroll (RU130) ===== */
function pCur(i){ PAGES.forEach((p,k) =>{ const el=document.getElementById(p); if(el) el.classList.toggle("pcur",k===i); }); }
pCur(curPage);
(function(){ const band=document.querySelector(".band"), app=document.getElementById("app"); if(!band||!app) return;
  function setH(){ const h=band.offsetHeight; if(h) app.style.setProperty("--bandh",h+"px"); }
  setH(); if(env.ResizeObserver) new ResizeObserver(setH).observe(band); else env.addEventListener("resize",setH); })();
/* ===== v31 p14 popup spring (RU130) ===== */
function shApply(p){ const s=SPR.sheet; if(s&&s.t===0&&p>0&&p<.012){ s.x=0; s.v=0; }
  let q=Math.max(-.2,Math.min(1.2,p)), t;
  if(sheet.classList.contains("dock")) t="translateX("+((1-q)*104).toFixed(2)+"%)";
  else if(mq.matches) t="translateY("+((1-q)*105).toFixed(2)+"%)";
  else t="translate(-50%,"+(-50+3*(1-q)).toFixed(2)+"%) scale("+(.97+.03*q).toFixed(4)+")";
  sheet.style.transform=t; sheet.style.opacity=(mq.matches&&!sheet.classList.contains("dock"))?"":String(Math.max(0,Math.min(1,q*1.6)).toFixed(3));
  if(s&&s.v===0&&s.x===s.t){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; } }
function shOpened(){ let s=SPR.sheet; if(REDUCE||sheet.classList.contains("vt-on")){ if(s){ if(s.raf) cancelAnimationFrame(s.raf); s.raf=0; s.x=s.t=1; s.v=0; } sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  if(!s||(!s.raf&&!sheet.classList.contains("sp-out"))) s=SPR.sheet={x:0,v:0,t:0,raf:0};
  sheet.classList.add("spr"); sheet.classList.remove("sp-out"); spring("sheet",1,shApply,{k:300,zeta:.86}); shApply(s.x); }
function shClosed(){ const s=SPR.sheet; if(REDUCE||!s){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  sheet.classList.add("spr","sp-out"); spring("sheet",0,shApply,{k:420,zeta:1}); }
function shDragEnd(dy,vel,close){ const h=(sheet.offsetHeight||1)*1.05, s=SPR.sheet||(SPR.sheet={x:1,v:0,t:1,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; }
  s.x=1-dy/h; s.v=-vel*1000/h; sheet.style.transform=""; if(close) closeSheet(); else { sheet.classList.add("spr"); spring("sheet",1,shApply,{k:300,zeta:.86}); } }
$("#sheetHead").addEventListener("pointerdown",(e) =>{ const s=SPR.sheet; if(!mq.matches||e.target.closest("button")||!s||!s.raf) return; cancelAnimationFrame(s.raf); s.raf=0; sheet.classList.remove("spr"); sheet.style.opacity=""; });
/* ===== v32 p29 (B15, RU132): exit motion and the Back button for popups and dialogs ===== */
(function(){
  function strip(n){ if(n.nodeType!==1) return; n.removeAttribute("id"); Array.prototype.slice.call(n.attributes).forEach((a) =>{ if(/^data-|^aria-(?!hidden)|^role$|^for$|^name$/.test(a.name)) n.removeAttribute(a.name); }); }
  function ghost(n){ if(REDUCE||!n||n.nodeType!==1||!n.classList||!(n.classList.contains("ask")||n.classList.contains("bkp"))||n.id==="staleV") return;
    const g=n.cloneNode(true); strip(g); Array.prototype.slice.call(g.querySelectorAll("*")).forEach(strip); g.className="ovg"+(n.classList.contains("ask")?" ovg-a":""); g.setAttribute("aria-hidden","true"); g.inert=true;
    document.body.appendChild(g); setTimeout(() =>{ g.remove(); },220); }
  const sig=function(n){ return n.nodeType===1?(n.id||n.className||""):""; };
  const mo=new MutationObserver((recs) =>{ const add={}, rem=[]; recs.forEach((r) =>{ if(r.type==="childList"&&r.target===document.body){ Array.prototype.forEach.call(r.addedNodes,(n) =>{ add[sig(n)]=1; }); Array.prototype.forEach.call(r.removedNodes,(n) =>{ rem.push(n); }); } });
    rem.forEach((n) =>{ if(!add[sig(n)]) ghost(n); });/* a dialog redrawn in place (same id) does not fade */ ovQueue(); });
  mo.observe(document.body,{childList:true}); mo.observe(sheet,{attributes:true,attributeFilter:["class"]});
  new MutationObserver(() =>{ ovQueue(); }).observe(document.body,{attributes:true,attributeFilter:["hidden"],subtree:true});/* T11 A6: Home shown or hidden */
  const tieB=function(){ const b=document.getElementById("bld"); if(b&&!b.__ovo){ b.__ovo=1; mo.observe(b,{childList:true,attributes:true,attributeFilter:["hidden"]}); } }; tieB(); setTimeout(tieB,500);
})();
