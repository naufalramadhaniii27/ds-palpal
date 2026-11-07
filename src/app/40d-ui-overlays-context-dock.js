/* Responsibility: overlay stack, long-press menu and the docked card. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env: __bldBack, __learnBack, __ovState, __tgBack. Shared names with other modules come from the imports below, late names through __R. */
import {C,FROZEN} from "./04-logic-storage.js";
import {$,eqOn,esc,num} from "./05-logic-helpers.js";
import {lastFocus,sheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {showHome} from "./15-logic-roster-backup-files-snapshots.js";
import {moveTabInd,mq} from "./21-ui-tabs-pager.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {CONS1,invKey} from "./23b-ui-items-containers.js";
import {cuNm} from "./26-ui-customize.js";
import {ICO} from "./29-ui-ddb-look.js";
import {ICO_FCAT,ICO_TXT} from "./30-ui-icons.js";
import {ckOf,qOk,spAtWill,spCastOpts} from "./32-logic-play-undo-actions.js";
import {qmClose} from "./39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js";
import {__R} from "./00-reg.js";
import {env} from "./00-env.js";
import {CTXSRC} from "./06a-logic-ui-registry.js";
Object.defineProperty(__R,"dockApply",{get:function(){return dockApply;},set:function(v){dockApply=v;},configurable:true});
Object.defineProperty(__R,"dockOff",{get:function(){return dockOff;},set:function(v){dockOff=v;},configurable:true});
let OVG=false, OVSKIP=0, OVQ=0, OV_UNLOAD=0;
env.addEventListener("beforeunload",() =>{ OV_UNLOAD=1; });
/* a reload or page change is under way: going back in history now would cancel it */
function ovTop(){ const c=document.getElementById("ctxm"); if(c) return function(){ c.remove(); };
  const a=document.querySelectorAll("body > .ask"); if(a.length){ const x=a[a.length-1]; return function(){ const b=x.querySelector("[data-no]"); if(b) b.click(); else x.remove(); }; }
  if(env.__tgBack){ const tb=env.__tgBack(); if(tb) return tb; }/* G7 Training Ground: field to setup, setup closes */
  if(env.__learnBack){ const lb=env.__learnBack(); if(lb) return lb; }/* T11 Learn: glossary card, sheet spotlight, then one step back */
  const bl=document.getElementById("bld"); if(bl&&!bl.hidden){ const e=Array.prototype.slice.call(bl.children).filter((d) =>{ return d.classList.contains("exp")&&d.id!=="exp"&&d.querySelector("[data-no]"); }); if(e.length){ const y=e[e.length-1]; return function(){ y.querySelector("[data-no]").click(); }; } if(env.__bldBack) return function(){ env.__bldBack(); }; }/* T11 G6 T5 */
  const q=document.getElementById("hpQm"); if(q) return function(){ qmClose(); };
  const k=Array.prototype.slice.call(document.querySelectorAll("body > .bkp")).filter((w) =>{ return !w.hidden&&w.querySelector(".bkpx"); }); if(k.length){ const z=k[k.length-1]; return function(){ z.querySelector(".bkpx").click(); }; }
  if(sheet.classList.contains("on")) return function(){ const bk=$("#sheetBack"); if(bk&&!bk.hidden) bk.click(); else closeSheet(); };
  /* T11 A6: on the character sheet itself (no popup, builder closed, not a friend's view), Back goes to Home instead of leaving the app */
  const hv=document.getElementById("homeV"); if(hv&&hv.hidden&&!(bl&&!bl.hidden)&&!FROZEN&&typeof showHome==="function") return function(){ showHome(); };
  return null; }
function ovSync(){ OVQ=0; if(FROZEN||OV_UNLOAD) return; const on=!!ovTop();
  if(on&&!OVG){ try{ history.pushState({csOv:1},""); OVG=true; }catch(e){} }
  else if(!on&&OVG){ OVG=false; if(history.state&&history.state.csOv){ OVSKIP++; try{ history.back(); }catch(e){ OVSKIP--; } } } }
Object.defineProperty(__R,"ovQueue",{get:function(){return ovQueue;},configurable:true});
export function ovQueue(){ if(!OVQ) OVQ=setTimeout(ovSync,0); }
env.addEventListener("popstate",() =>{ if(OVSKIP>0){ OVSKIP--; ovQueue(); return; } if(!OVG) return; OVG=false; const f=ovTop(); if(f){ try{ f(); }catch(e){} } ovQueue(); });
try{ if(history.state&&history.state.csOv) history.replaceState(null,""); }catch(e){}
/* a reload while a popup was open: the held entry is plain again */
env.__ovState=function(){ return {held:OVG, top:!!ovTop()}; };
/* ===== v32 p34 RU132: right-click menu on a computer ===== */
function ctxFire(attrs){ const b=document.createElement("button"); b.type="button"; b.hidden=true; Object.keys(attrs).forEach((k) =>{ b.setAttribute(k,attrs[k]); }); document.body.appendChild(b); try{ b.click(); }finally{ b.remove(); } }
function ctxBoxes(scope){ const bx=Array.prototype.slice.call(scope.querySelectorAll(".bx[data-k]")); if(!bx.length) return []; const on=bx.filter((b) =>{ return b.getAttribute("aria-pressed")==="true"||b.classList.contains("on"); }), off=bx.filter((b) =>{ return on.indexOf(b)<0; }), L=[];
  if(off.length) L.push(["Use 1","ui-check",function(){ off[0].click(); }]); else L.push(["Use 1 (none left)","ui-check",null]);
  if(on.length) L.push(["Regain 1","ui-undo",function(){ on[on.length-1].click(); }]); return L; }
CTXSRC.add("inventory-row", {sel:"#invBody .irow", build:function(row){
  const nb=row.querySelector('[data-info^="it:"]'); if(!nb) return null; const ix=+nb.getAttribute("data-info").slice(3), it=(C.inv||[])[ix]; if(!it) return null;
    const L=[["Details","ui-info",function(){ nb.click(); }]], ck=row.querySelector("[data-ieqs]"); if(ck) L.push([eqOn(it)?"Unequip":"Equip",eqOn(it)?"ui-close":"ui-check",function(){ ck.click(); }]);
    if(CONS1.test(it.n)) L.push([num(it.q,1)>0?"Use 1":"Use 1 (none left)","ui-check",num(it.q,1)>0?function(){ ctxFire({"data-use1":ix,"data-potn":it.key||it.n}); }:null]);
    L.push(["Delete","ui-trash",function(){ ctxFire({"data-idel":it.key||it.n,"data-iix":ix,"data-sure":"1"}); },1]); return {t:cuNm("i:"+invKey(it),it.n),L:L,el:row};
}});
CTXSRC.add("spell-row", {sel:'#spBody .sp-r[data-info^="sp:"]', build:function(sp){
  const i=+sp.getAttribute("data-info").slice(3), x=(C.spells||[])[i]; if(!x) return null; const L2=[["Details","ui-info",function(){ sp.click(); }]];
    if(spAtWill(x)) L2.push(["Cast","tab-spells",function(){ ctxFire({"data-cast":i,"data-ck":""}); }]);
    else { const o=spCastOpts(x); if(!o.length) L2.push(["Cast (no slots left)","tab-spells",null]); o.forEach((q) =>{ L2.push([(q.free?"Use ":"Cast with ")+q.lab+" ("+q.left+" left)","tab-spells",qOk(q)?function(){ ctxFire({"data-cast":i,"data-ck":ckOf(q),"data-cl":q.lv}); }:null]); }); }
    return {t:x.n,L:L2,el:sp};
}});
CTXSRC.add("feature-item", {sel:"#featBody .fitem", build:function(fi){
  const tx=fi.querySelector('.tx[data-info^="f:"]'); if(!tx) return null; return {t:tx.textContent,L:[["Details","ui-info",function(){ tx.click(); }]].concat(ctxBoxes(fi)),el:fi};
}});
CTXSRC.add("action-row", {sel:"#actBody .arow, #actBody .rs", build:function(ar){
  const ax=ar.querySelector(".tx[data-info],[data-info]"); if(!ax) return null; return {t:ax.textContent,L:[["Details","ui-info",function(){ ax.click(); }]].concat(ctxBoxes(ar)),el:ar};
}});
/* solid:orchestrator ctxSpec */
function ctxSpec(t){ const L=CTXSRC.list(); for(let i=0;i<L.length;i++){ const el=t.closest&&t.closest(L[i].sel); if(el) return L[i].build(el); } return null; }
function ctxClose(){ const m=document.getElementById("ctxm"); if(m){ m.remove(); if(ctxClose.back&&ctxClose.back.focus) try{ ctxClose.back.focus({preventScroll:true}); }catch(e){} } ctxClose.back=null; }
function ctxOpen(spec,x,y){ ctxClose(); const m=document.createElement("div"); m.id="ctxm"; m.className="ctxm"; m.setAttribute("role","menu"); m.setAttribute("aria-label",spec.t);
  m.innerHTML='<div class="ctxh">'+esc(spec.t)+'</div>'+spec.L.map((a,i) =>{ return '<button type="button" role="menuitem" class="ctxi'+(a[3]?' del':'')+'" data-ctxi="'+i+'"'+(a[2]?'':' disabled')+'>'+ico(a[1])+'<span>'+esc(a[0])+'</span></button>'; }).join("");
  document.body.appendChild(m); const w=m.offsetWidth, h=m.offsetHeight; m.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+"px"; m.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+"px";
  ctxClose.back=document.activeElement; m.__L=spec.L; const f=m.querySelector(".ctxi:not([disabled])"); if(f) f.focus({preventScroll:true}); }
document.addEventListener("contextmenu",(e) =>{ if(mq.matches||e.shiftKey) return; const spec=ctxSpec(e.target); if(!spec) return; e.preventDefault(); ctxOpen(spec,e.clientX,e.clientY); });
document.addEventListener("keydown",(e) =>{ const m=document.getElementById("ctxm");
  if(!m){ if((e.key==="ContextMenu"||(e.shiftKey&&e.key==="F10"))&&!mq.matches){ const spec=ctxSpec(document.activeElement||document.body); if(spec){ e.preventDefault(); const r=spec.el.getBoundingClientRect(); ctxOpen(spec,r.left+16,r.top+r.height/2); } } return; }
  if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); ctxClose(); return; }
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); const b=Array.prototype.slice.call(m.querySelectorAll(".ctxi:not([disabled])")), i=b.indexOf(document.activeElement); if(b.length) b[(i+(e.key==="ArrowDown"?1:-1)+b.length)%b.length].focus(); } },true);
document.addEventListener("pointerdown",(e) =>{ const m=document.getElementById("ctxm"); if(m&&!m.contains(e.target)) ctxClose(); },true);
document.addEventListener("scroll",() =>{ if(document.getElementById("ctxm")) ctxClose(); },true);
env.addEventListener("resize",() =>{ ctxClose(); });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#ctxm [data-ctxi]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const m=document.getElementById("ctxm"), a=m&&m.__L&&m.__L[+b.getAttribute("data-ctxi")]; ctxClose.back=null; ctxClose(); if(a&&a[2]) a[2](); },true);
/* ===== v31 p16 two panels on a computer (RU131) ===== */
const DOCKW=400;
function dockFits(){ const tz=(+document.documentElement.getAttribute("data-tsize")||100)/100; return !mq.matches&&env.innerWidth>=1100&&env.innerWidth-DOCKW>=Math.max(700,760*tz); }
/* v35 p13: with Text Size 115 or 130 the side panel docks only when the sheet keeps room, else it floats over */
function dockable(mode){ return mode==="info"||mode==="bd"; }
function dockAnchor(){ let a=lastFocus&&lastFocus.isConnected&&lastFocus.closest&&lastFocus.closest("#pager")?lastFocus:null; if(!a){ const e=document.elementFromPoint(Math.max(10,(env.innerWidth-DOCKW)/3),env.innerHeight/2); a=e&&e.closest&&e.closest("#pager")?e:null; } return a; }
function dockLayout(on){ const root=document.documentElement; if(root.classList.contains("dk")===on) return; const a=dockAnchor(), y0=a?a.getBoundingClientRect().top:0;
  root.classList.toggle("dk",on); root.classList.toggle("dkn",on&&env.innerWidth-DOCKW<1000); if(on) root.style.setProperty("--dockw",DOCKW+"px");
  if(a&&a.isConnected){ const y1=a.getBoundingClientRect().top; if(Math.abs(y1-y0)>1) env.scrollBy(0,y1-y0); } moveTabInd(true); }
function dockApply(mode,wide){ const on=dockable(mode)&&!wide&&dockFits(); sheet.classList.toggle("dock",on); sheet.setAttribute("aria-modal",on?"false":"true"); if(on) $("#scrim").classList.remove("on"); dockLayout(on); }
function dockOff(){ dockLayout(false); }
env.addEventListener("resize",() =>{ if(!sheet.classList.contains("on")||!sheet.classList.contains("dock")) return; if(!dockFits()){ sheet.classList.remove("dock"); sheet.setAttribute("aria-modal","true"); $("#scrim").classList.add("on"); dockLayout(false); } else { document.documentElement.classList.toggle("dkn",env.innerWidth-DOCKW<1000); } });
/* ===== v31 p17 drag to reorder (RU131) ===== */
ICO_TXT.unshift([/^On Hit$/i,"ui-target"]);
ICO_FCAT["On Hit"]="ui-target";
ICO["ui-target"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4";
ICO["ui-range"]="M3 12h18M6.5 8.5 3 12l3.5 3.5M17.5 8.5 21 12l-3.5 3.5";
ICO["ui-area"]="M12 3a9 9 0 1 0 0.01 0M12 7.5a4.5 4.5 0 1 0 0.01 0M12 11.2a.8.8 0 1 0 0.01 0";
/* v35 p17 */ICO["ui-contrast"]="M12 3a9 9 0 1 0 0.01 0M12 3v18M12 7h5.5M12 11h8.5M12 15h8M12 19h4.5";
/* v35 p01 */ICO["ui-eye"]="M2 12c2.5-4.2 6-6.5 10-6.5s7.5 2.3 10 6.5c-2.5 4.2-6 6.5-10 6.5S4.5 16.2 2 12zM12 9.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 1 0 0-5.6";
ICO["ui-keys"]="M3 7h18v10H3zM6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7 14h10";
/* v32 p27 */
ICO["ui-grip"]="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01";
/* v33 p03: builder icons */
ICO["step-home"]="M3 11.5L12 4l9 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5";
ICO["ui-box"]="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z";
ICO["ui-radio-on"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0";
ICO["item-pack"]="M8 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4.5V6M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5zM8.5 13.5h7v4h-7zM5 11h14";
