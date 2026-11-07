import {C,S,save,saveC} from "./04-logic-storage.js";
import {$,$$,armorFx,attCount,attMaxC,bldGuard,bldSync,clamp,eqLinked,eqOn,invAt,num,toast,viaBld} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE,spring} from "./07-ui-theme-contrast-spring.js";
import {__set_actF,actF,renderActions,syncLU} from "./08b-ui-render-summaries-actions.js";import {__set_featF,__set_featQ,__set_invF,featF,featQ,invF,renderFeat,renderInv} from "./08c-ui-render-inventory-features-notes.js";import {used} from "./08-ui-render-sheet-and-actions.js";
import {navStack} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet,infoHTML} from "./13b-ui-detail-spell-targets-render.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";import {PANEL} from "./06a-logic-ui-registry.js";
Object.defineProperty(__R,"curPage",{get:function(){return curPage;},set:function(v){curPage=v;},configurable:true});
Object.defineProperty(__R,"mq",{get:function(){return mq;},set:function(v){mq=v;},configurable:true});
/* ================= TABS + PAGER ================= */
export var mq = env.matchMedia("(max-width:759px)");
/* Pages in order (SOLID stage 9, O): one entry per page in PANEL. The Search sheet builds its "go to" commands from these entries. */
PANEL.add("p-main", {label:"Main", icon:"tab-main", words:["main"]});
PANEL.add("p-skills", {label:"Skills", icon:"tab-skills", words:["skills"]});
PANEL.add("p-actions", {label:"Actions", icon:"act-attack", words:["actions","attacks"], tab:"p-actions"});
PANEL.add("p-spells", {label:"Spells", icon:"tab-spells", words:["spells","spellbook"], tab:"p-spells"});
PANEL.add("p-inv", {label:"Inventory", icon:"tab-inventory", words:["inventory","items","equipment"], tab:"p-inv"});
PANEL.add("p-feat", {label:"Features", icon:"tab-features", words:["features","traits"], tab:"p-feat"});
PANEL.add("p-desc", {label:"Description", icon:"tab-description", words:["description","background"], tab:"p-desc"});
PANEL.add("p-notes", {label:"Notes", icon:"tab-notes", words:["notes","journal"], tab:"p-notes"});
PANEL.add("p-ext", {label:"Extras", icon:"tab-extras", words:["extras","companions"], tab:"p-ext"});
export var PAGES = PANEL.keys();/* v23 */
export var activeTab = "p-actions";
export function setTab(id, focus, instant){
  if(!instant&&!setTab.vt&&setTab.morph&&document.startViewTransition&&!mq.matches&&!(env.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)&&id!==activeTab){ setTab.vt=1; const vt=document.startViewTransition(() =>{ setTab(id,focus,true); }); vt.finished.then(() =>{ setTab.vt=0; },() =>{ setTab.vt=0; }); return; }/* v29: smooth morph between tabs */
  activeTab=id;
  $$("#tabs .tab").forEach((t) =>{ const on=t.getAttribute("data-tab")===id; t.setAttribute("aria-selected",on); t.tabIndex=on?0:-1; if(on&&focus) t.focus(); });
  ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach((p) =>{ const el=document.getElementById(p), on=p===id;
    if(!mq.matches){ if(on&&el.hidden){ el.hidden=false; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); } else if(!on){ el.hidden=true; } } });
  moveTabInd(instant); const ts=$('#tabs .tab[aria-selected="true"]'), tb=$("#tabs"); if(ts&&tb&&tb.scrollWidth>tb.clientWidth){ const l=ts.offsetLeft, r=l+ts.offsetWidth; if(l<tb.scrollLeft) tb.scrollLeft=Math.max(0,l-16); else if(r>tb.scrollLeft+tb.clientWidth) tb.scrollLeft=r-tb.clientWidth+16; }/* v23: seven tabs */
}
let tabX=0, tabW=100;
function paintInd(){ $("#tabInd").style.transform="translateX("+tabX+"px) scaleX("+(tabW/100)+")"; }
export function moveTabInd(instant){ const t=$('#tabs .tab[aria-selected="true"]'); if(!t||!t.offsetWidth) return; const x=t.offsetLeft+10, w=t.offsetWidth-20;
  spring("tabX", x, (v) =>{ tabX=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); spring("tabW", w, (v) =>{ tabW=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); }
$("#tabs").addEventListener("click",(e) =>{ const t=e.target.closest(".tab"); if(t) setTab(t.getAttribute("data-tab")); });
$("#tabs").addEventListener("keydown",(e) =>{ const tabs=$$("#tabs .tab"), i=tabs.findIndex((t) =>{return t.getAttribute("aria-selected")==="true"});
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ e.preventDefault(); const n=(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length; setTab(tabs[n].getAttribute("data-tab"),true); } });
document.addEventListener("click",(e) =>{ const t=e.target.closest("[data-ieqs],[data-idel],[data-invman]"); if(!t) return; if(t.dataset.invman){ if(env.__bldEquip) env.__bldEquip(); return; } if(t.dataset.ieqs){ e.stopPropagation(); const nm=t.dataset.ieqs; const ai=invAt(nm,t.dataset.iix); if(ai&&ai.att&&!eqOn(ai)&&attCount()>=attMaxC()){ toast("You can attune to at most "+attMaxC()+" magic items. Unattune one first."); if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; }/* M18 */ if(viaBld(nm)) bldGuard(() =>{ env.__bldToggleEq(nm,__R.occOf(invAt(nm,t.dataset.iix))); }); else { const it=invAt(nm,t.dataset.iix); if(it){ let lk=eqLinked(it), ne=!eqOn(it), fx=null, acd=false;
  /* RU29: armor or Shield on a hand-filled sheet: AC from the builder, no dialog. Manual entries stay */
  if(!lk&&env.__bldArmor){ try{ fx=env.__bldArmor({C:structuredClone(C),lang:S.lang},nm,ne); }catch(er){ fx=null; } }
  it.eq=ne; if(fx) acd=armorFx(fx,it); else bldSync(nm,{eq:it.eq,occ:__R.occOf(it)}); saveC(); __R.renderAll();
  toast(lk?(it.eq?"Equipped. Its attack is back on the Actions tab.":"Unequipped. Its attack is hidden from the Actions tab."):acd?((it.eq?"Equipped. ":"Unequipped. ")+"Armor Class is now "+D.ac+"."):(it.eq?"Equipped. Open Build and Apply to recalculate AC and attacks.":"Unequipped. Open Build and Apply to recalculate AC and attacks.")); } } if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; } if(t.dataset.idel){ if(t.dataset.sure!=="1"){ t.dataset.sure="1"; t.textContent="TAP AGAIN TO DELETE"; return; } if(viaBld(t.dataset.idel)){ const dn=t.dataset.idel; bldGuard(() =>{ __R.undoMark("Delete "+dn); env.__bldRemove(dn,__R.occOf(invAt(dn,t.dataset.iix))); __R.toastU("Deleted "+dn+"."); }); } else { __R.undoMark("Delete "+t.dataset.idel); const dIt=invAt(t.dataset.idel,t.dataset.iix); bldSync(t.dataset.idel,{del:1,occ:__R.occOf(dIt)}); C.inv=(C.inv||[]).filter((x) =>{return x!==dIt}); if(dIt&&__R.ctOf(dIt.n)&&!C.inv.some((x) =>{ return __R.invKey(x)===__R.invKey(dIt); })) C.inv.forEach((x) =>{ if(x.in===__R.invKey(dIt)) delete x.in; });/* v32 RU134 */ saveC(); __R.renderAll(); __R.toastU("Deleted "+t.dataset.idel+"."); } if(typeof closeSheet==="function") closeSheet(); } }, true);
/* Qty Apply: hand-filled sheet writes C.inv[].q, builder sheet goes through __bldSetQty (B.inv), then the popup redraws in place. */
function iqSync(box){ const r=box.closest(".iqty-r"), a=r&&r.querySelector("[data-iqa]"), v=parseInt(box.value,10); if(a) a.disabled=isNaN(v)||v<0||v===+box.getAttribute("data-iqv"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest("[data-iqd],[data-iqa]"); if(!b||!b.closest("#sheet")) return; e.stopPropagation(); const box=b.closest(".iqty-r").querySelector(".iqi");
  if(b.dataset.iqd){ const v=parseInt(box.value,10); box.value=Math.max(0,(isNaN(v)?0:v)+(+b.dataset.iqd)); iqSync(box); return; }
  if(b.disabled) return; const nm=b.dataset.iqa, q=Math.max(0,parseInt(box.value,10)||0);
  const bix=b.dataset.iix, fin=function(){ const ix=(bix!=null&&C.inv&&C.inv[+bix]&&(C.inv[+bix].key||C.inv[+bix].n)===nm)?+bix:(C.inv||[]).findIndex((x) =>{return (x.key||x.n)===nm}); if(ix>=0){ const r=infoHTML("it:"+ix); $("#sheetBody").innerHTML=r.h; if(navStack.length) navStack[navStack.length-1]={type:"info",spec:"it:"+ix}; }
    toast("Quantity set to "+q); };
  if(viaBld(nm)&&env.__bldSetQty){ bldGuard(() =>{ env.__bldSetQty(nm,q,__R.occOf(invAt(nm,bix))); fin(); }); return; } /* N1 */
  const it=invAt(nm,bix); if(!it) return; it.q=q; bldSync(nm,{q:q,occ:__R.occOf(it)}); saveC(); __R.renderAll(); fin(); },true);
document.addEventListener("input",(e) =>{ if(e.target.classList&&e.target.classList.contains("iqi")) iqSync(e.target); });
/* m6: typed points left for a pool resource */
document.addEventListener("change",(e) =>{ const t=e.target; if(!(t.classList&&t.classList.contains("pli"))) return; const k=t.getAttribute("data-k"), r=(D.res||[]).filter((q) =>{return q.k===k})[0]; if(!r) return; const lf=clamp(Math.round(num(t.value,r.max-used(k,r.max))),0,r.max); S.used[k]=r.max-lf; save(); syncLU(); t.value=lf; });
document.addEventListener("keydown",(e) =>{ if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("iqi")){ e.preventDefault(); const a=e.target.closest(".iqty-r").querySelector("[data-iqa]"); if(a&&!a.disabled) a.click(); } });
$("#invBody").addEventListener("click",(e) =>{ const b=e.target.closest("[data-invf]"); if(!b) return; __set_invF(b.getAttribute("data-invf")); renderInv(); });
$("#actBody").addEventListener("click",(e) =>{ const b=e.target.closest("[data-actf]"); if(!b) return; __set_actF(b.getAttribute("data-actf")); renderActions(); });
$("#featBody").addEventListener("input",(e) =>{ const t=e.target; if(t.id!=="featQ") return; __set_featQ(t.value); const pos=t.selectionStart; renderFeat(); const qq=document.getElementById("featQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
$("#featBody").addEventListener("click",(e) =>{ const b=e.target.closest("[data-featf]"); if(!b) return; __set_featF(b.getAttribute("data-featf")); renderFeat(); });
$("#spBody").addEventListener("click",(e) =>{ const b=e.target.closest("[data-spf]"); if(!b) return; e.stopPropagation(); __R.spF=b.getAttribute("data-spf"); __R.renderSpells(); });
$("#spBody").addEventListener("input",(e) =>{ const t=e.target; if(t.id!=="spQ") return; __R.spQ=t.value; const pos=t.selectionStart; __R.renderSpells(); const qq=document.getElementById("spQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
export var pager=$("#pager"), bInd=$("#bInd"), navBtns=$$("#bnav button"), curPage=0, raf=0;
export var BCSS=!!(env.CSS&&CSS.supports&&CSS.supports("animation-timeline","--a")&&CSS.supports("timeline-scope","--a")&&Element.prototype.animate);/* P1: scroll timeline drives the bar line */
if(BCSS) document.documentElement.classList.add("bi-css");
/* P2 frame rate: pages far from the view are not painted. A page keeps visibility:hidden until it is within one page of the view.
   goPage, focus() and scrollIntoView() show the page first, so a jump never lands on a blank page */
let PGCULL=null;
const PGCULL_ON=false;/* off: on a real phone the first visit to a far page painted late (frames of 120 to 150 ms in the fps test, A/B 2026-10-30). The server benchmark liked it, the phone did not */
function pgOn(){ if(!PGCULL_ON||PGCULL||!env.IntersectionObserver) return; PGCULL=new IntersectionObserver(((es) =>{ if(!mq.matches) return; es.forEach((e) =>{ e.target.style.visibility=e.isIntersecting?"":"hidden"; }); }),{root:pager,rootMargin:"0px 100% 0px 100%"});
  PAGES.forEach((id) =>{ const el=document.getElementById(id); if(el) PGCULL.observe(el); }); }
function pgOff(){ if(PGCULL){ PGCULL.disconnect(); PGCULL=null; } PAGES.forEach((id) =>{ const el=document.getElementById(id); if(el&&el.style.visibility) el.style.visibility=""; }); }
export function pgShow(i){ for(let k=i-1;k<=i+1;k++){ const el=document.getElementById(PAGES[k]); if(el&&el.style.visibility) el.style.visibility=""; } }
function pgReveal(el){ const p=el&&el.closest&&el.closest("#pager>*, #pager .panel"); if(p&&p.style.visibility) p.style.visibility=""; }
(function(){ const f=HTMLElement.prototype.focus, s=Element.prototype.scrollIntoView;
  HTMLElement.prototype.focus=function(){ if(PGCULL) pgReveal(this); return f.apply(this,arguments); };
  Element.prototype.scrollIntoView=function(){ if(PGCULL) pgReveal(this); return s.apply(this,arguments); }; })();
export function onPagerScroll(){ if(raf) return; raf=requestAnimationFrame(() =>{ raf=0; if(!mq.matches) return; const w=pager.clientWidth||1, f=pager.scrollLeft/w; if(!BCSS) __R.bIndSet(f*100);/* v31 p11 */
  const idx=clamp(Math.round(f),0,PAGES.length-1); if(idx!==curPage){ curPage=idx; navBtns.forEach((b,i) =>{ b.classList.toggle("on",i===idx); if(i===idx) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); }); navShow(idx); __R.pCur(idx); const bi=document.getElementById("bInd"); if(bi&&!REDUCE){ bi.classList.remove("hop"); void bi.offsetWidth; bi.classList.add("hop"); } }/* v31 p13 */ }); }
/* v23: the bottom bar scrolls sideways (9 pages); keep the current button in view */
function navShow(i){ const bn=document.querySelector(".bnav"), b=navBtns[i]; if(!bn||!b) return; const l=b.offsetLeft, r=l+b.offsetWidth; if(l<bn.scrollLeft+8) bn.scrollTo({left:Math.max(0,l-24),behavior:REDUCE?"auto":"smooth"}); else if(r>bn.scrollLeft+bn.clientWidth-8) bn.scrollTo({left:r-bn.clientWidth+24,behavior:REDUCE?"auto":"smooth"}); }
pager.addEventListener("scroll",onPagerScroll,{passive:true});
export function goPage(i,smooth){ if(!mq.matches) return; pgShow(i); pager.scrollTo({left:i*pager.clientWidth, behavior:(smooth&&!REDUCE)?"smooth":"auto"}); }
navBtns.forEach((b) =>{ b.addEventListener("click",() =>{ const i=+b.getAttribute("data-go"); if(i===curPage){ document.getElementById(PAGES[i]).scrollTo({top:0,behavior:REDUCE?"auto":"smooth"}); } goPage(i,true); }); });
$("#hpChip").addEventListener("click",() =>{ goPage(0,true); });
export function onMode(){ if(mq.matches){ pgOn(); ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach((p) =>{ document.getElementById(p).hidden=false; }); requestAnimationFrame(() =>{ goPage(curPage,false); onPagerScroll(); }); } else { pgOff(); setTab(activeTab,false,true); } }
/* P6 frame rate: the first visit to a page painted late on a real phone (frames of 90 to 150 ms, A/B on a phone 2026-10-30). Once per visit to the app, right after a character opens,
   every page is shown for two frames while the page area is nearly transparent (about 0.8 s on a phone), so the first real visit is already painted. A touch cancels it at once */
let PGWARM=0;
function pgWarm(){ if(PGWARM||!mq.matches||REDUCE||document.hidden) return; const d=document.getElementById("dmgBtn"); if(!d||!d.getClientRects().length||document.querySelector("dialog[open]")) return;
  PGWARM=1; let root=document.documentElement, back=curPage, i=0, fin=function(){ if(PGWARM!==1) return; PGWARM=2; goPage(back,false); root.classList.remove("pg-warm"); document.removeEventListener("pointerdown",fin,true); };
  [].forEach.call(document.querySelectorAll("#pager img"),(im) =>{ try{ im.loading="eager"; if(im.decode) im.decode().catch(() =>{}); }catch(er){} });
  root.classList.add("pg-warm"); document.addEventListener("pointerdown",fin,true);
  (function step(){ if(PGWARM!==1) return; if(i<PAGES.length){ goPage(i++,false); requestAnimationFrame(() =>{ requestAnimationFrame(step); }); } else requestAnimationFrame(() =>{ fin(); }); })(); }
function pgWarmTry(n){ pgWarm(); if(!PGWARM&&n<12) setTimeout(() =>{ pgWarmTry(n+1); },700); }
document.addEventListener("click",(e) =>{ if(!PGWARM&&e.target.closest&&e.target.closest("[data-hview]")) setTimeout(() =>{ pgWarmTry(0); },450); },true);
setTimeout(() =>{ pgWarmTry(0); },2500);
if(mq.addEventListener) mq.addEventListener("change",onMode); else if(mq.addListener) mq.addListener(onMode);
let rT=null;
env.addEventListener("resize",() =>{ clearTimeout(rT); rT=setTimeout(() =>{ if(mq.matches) goPage(curPage,false); else moveTabInd(true); },80); });

export function spEffect(sp){const m=/(\d+d\d+(?:\s*\+\s*\d+)?)\s+([A-Z][a-z]+)/.exec(sp.sum||"");if(m)return m[1]+" "+m[2];const c=/\b(Blinded|Charmed|Frightened|Incapacitated|Invisible|Paralyzed|Poisoned|Prone|Restrained|Stunned|Unconscious)\b/.exec(sp.sum||"");return c?c[1]:"Utility"}

export function __set_setTab(v){ return setTab=v; }
export function __set_goPage(v){ return goPage=v; }
