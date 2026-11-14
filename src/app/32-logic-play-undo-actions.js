import {invalidateHornValhallaState} from './32o-logic-horn-valhalla.js';
import {invalidateBagTricksState} from './32n-logic-bag-tricks.js';
import {invalidateStudyBooksState} from './32m-logic-study-books.js';
import {invalidatePluvennGrappleclawsState} from './32l-logic-pluvenn-grappleclaws.js';
import {invalidateNecronomiconState} from './32k-logic-necronomicon-reading.js';
import {invalidateSlotRecoveryState} from './32j-logic-slot-recovery.js';
import {invalidateStoredSpellState} from './32i-logic-stored-spells.js';
import {invalidateGemCastState} from './32h-logic-spell-gem.js';
import {invalidateTattooState} from './32g-logic-spellwrought-tattoo.js';
import {bindLive,lateGet,renderAll,closeSheetIfOn,ico,toastKind} from "./00a-reg-late-ports.js";import {C,FROZEN,S,__set_C,__set_S,lsGet,lsSet,save,saveC} from "./04-logic-storage.js";import {$,__set_toastT,esc,toast,toastT} from "./05-logic-helpers.js";import {env} from "./00-env.js";
import {invalidateClericResourceState} from "./32f-logic-divine-intervention.js";
bindLive("UNDO",{get:function(){return UNDO;},set:function(v){UNDO=v;}});
bindLive("UST",{get:function(){return UST;},set:function(v){UST=v;}});
bindLive("redoNow",{get:function(){return redoNow;}});
bindLive("toastU",{get:function(){return toastU;}});
bindLive("undoFix",{get:function(){return undoFix;}});
bindLive("undoLbl",{get:function(){return undoLbl;}});
bindLive("undoMark",{get:function(){return undoMark;}});
bindLive("undoNow",{get:function(){return undoNow;}});
bindLive("undoTidy",{get:function(){return undoTidy;}});
export var UNDO=null;
/* v30 p08: a history of 20 steps in memory (UST), and steps taken back that can be done again (RST). UNDO is the newest step */
var UST=[], RST=[], UMAX=20;
function undoTidy(){ if(UST.length&&UST[UST.length-1]!==UNDO) UST.pop(); }/* UNDO=null right after undoMark takes that step back out */
function undoFix(e){ if(!e||e.A!=null) return; e.A=JSON.stringify(S); e.CA=JSON.stringify(C); e.BA=lsGet(lateGet("BKEY")); if(e.CA===e.C) e.CA=e.C; }/* one copy of C when the step did not change it */
export function undoMark(lbl,join){ undoTidy(); const now=Date.now(), top=UST[UST.length-1];
  if(join&&top&&top.l===lbl&&top.j&&now-top.t<2000&&!RST.length){ top.t=now; top.A=null; UNDO=top; setTimeout(() =>{ undoFix(top); },0); return; }
  const e={l:lbl,t:now,j:!!join,S:JSON.stringify(S),C:JSON.stringify(C),B:lsGet(lateGet("BKEY"))}; UST.push(e); if(UST.length>UMAX) UST.shift(); RST.length=0; UNDO=e; setTimeout(() =>{ undoFix(e); },0); }
export function undoLbl(){ undoTidy(); const u=UST[UST.length-1]; return u?u.l:""; }
export function toastU(msg){ if(!UNDO){ toast(msg); return; } undoFix(UNDO);/* v21 M3: state right after the action */ const t=$("#toast"); const tk=toastKind(msg); t.innerHTML=ico("toast-"+tk,"tico")+'<span>'+esc(msg)+'</span><button type="button" class="tundo" data-undo="1">'+ico("ui-undo")+'Undo</button>'; t.setAttribute("data-kind",tk); t.classList.add("on","act"); clearTimeout(toastT); __set_toastT(setTimeout(() =>{ t.classList.remove("on","act"); },6000)); }
/* v21 M3, m1: only the fields the action changed go back. Changes made since (another tab, a condition) stay */
function undoBack(cur,b0,a0){ const J1=function(x){ return JSON.stringify(x===undefined?null:x); };
  Object.keys(b0).concat(Object.keys(a0)).forEach((k) =>{ if(k==="_app"||J1(b0[k])===J1(a0[k])) return; const b=b0[k], a=a0[k];
    if(b&&a&&typeof b==="object"&&typeof a==="object"&&!Array.isArray(b)&&!Array.isArray(a)&&cur[k]&&typeof cur[k]==="object"&&!Array.isArray(cur[k])){ Object.keys(b).concat(Object.keys(a)).forEach((j) =>{ if(J1(b[j])===J1(a[j])) return; if(b[j]===undefined) delete cur[k][j]; else cur[k][j]=structuredClone(b[j]); }); }
    else if(b===undefined) delete cur[k]; else cur[k]=structuredClone(b); }); return cur; }
/* re=false: back to before the step. re=true: Redo, forward to after it. Only the fields the step changed move */
function undoApply(u,re){invalidateClericResourceState();invalidateTattooState(S);invalidateGemCastState(S);invalidateStoredSpellState(S);invalidateSlotRecoveryState(S);invalidateNecronomiconState(S);invalidatePluvennGrappleclawsState(S);invalidateStudyBooksState(S);invalidateBagTricksState(S);invalidateHornValhallaState(S);undoFix(u); let note="", s0=re?u.A:u.S, s1=re?u.S:u.A;
  __set_S(undoBack(S,JSON.parse(s0),JSON.parse(s1))); if(u.C!==u.CA) __set_C(undoBack(C,JSON.parse(re?u.CA:u.C),JSON.parse(re?u.C:u.CA)));
  const b0=re?u.BA:u.B, b1=re?u.B:u.BA;
  if(b0!=null&&b0!==b1){ if(lsGet(lateGet("BKEY"))===b1){ lsSet(lateGet("BKEY"),b0); try{ if(env.__bldReload) env.__bldReload(); }catch(er){} } else note=" The build changed since then, so it was left as it is."; }
  save(); if(u.C!==u.CA) saveC(); closeSheetIfOn(); renderAll(true); return note; }
function toastR(msg,btn){ const t=$("#toast"), tk=toastKind(msg); t.innerHTML=ico("toast-"+tk,"tico")+'<span>'+esc(msg)+'</span>'+(btn==="redo"?'<button type="button" class="tredo" data-redo="1">'+ico("ui-redo")+'Redo</button>':btn==="undo"?'<button type="button" class="tundo" data-undo="1">'+ico("ui-undo")+'Undo</button>':''); t.setAttribute("data-kind",tk); t.classList.add("on"); t.classList.toggle("act",!!btn); clearTimeout(toastT); __set_toastT(setTimeout(() =>{ t.classList.remove("on","act"); },btn?6000:2400)); }
export function undoNow(){ if(FROZEN) return; undoTidy(); const u=UST.pop(); if(!u){ toast("Nothing to undo."); return; } UNDO=UST[UST.length-1]||null; const note=undoApply(u,false); RST.push(u); toastR("Undone: "+u.l+"."+note,"redo"); }
function redoNow(){ if(FROZEN) return; undoTidy(); const u=RST.pop(); if(!u){ toast("Nothing to redo."); return; } const note=undoApply(u,true); UST.push(u); UNDO=u; toastR("Redone: "+u.l+"."+note,"undo"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-undo],[data-redo]"); if(b){ e.preventDefault(); e.stopPropagation(); if(b.hasAttribute("data-redo")) redoNow(); else undoNow(); } },true);
document.addEventListener("keydown",(e) =>{ if(!(e.ctrlKey||e.metaKey)||e.altKey) return; const k=String(e.key).toLowerCase(); if(k!=="z"&&k!=="y") return;
  const t=e.target, tg=(t&&t.tagName)||"", ty=String(t&&t.type||"").toLowerCase(); if(tg==="TEXTAREA"||tg==="SELECT"||(t&&t.isContentEditable)||(tg==="INPUT"&&/^(text|search|email|url|tel|password|)$/.test(ty))) return;
  if(document.querySelector(".ask, #recov, #homeV:not([hidden])")) return; const bl=$("#bld"); if(bl&&!bl.hidden) return;
  e.preventDefault(); if(k==="y"||e.shiftKey) redoNow(); else undoNow(); });
env.__undoInfo=function(){ undoTidy(); return {u:UST.map((x) =>{ return x.l; }),r:RST.map((x) =>{ return x.l; })}; };
