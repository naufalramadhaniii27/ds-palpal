import {iounCharacterMathStatus} from '../data/lib/ioun-orbit-source.js';
import {applyNativePlayerDamage} from './32u-logic-player-damage.js';
import {summonResourceManaged} from "./lib/summon-resource.js";
import {env} from "./00-env.js";import {concCheck,concEnd,concOf,hasFeat,lateGet,openRest,renderAll,sitReset,toastU,undoMark} from "./00a-reg-late-ports.js";import {hpWord} from "./05-logic-helpers.js";import {hdPlan,x14} from "./03-data-glossary.js";
import {C,FROZEN,S,save} from "./04-logic-storage.js";
import {createSlotRecoveryRestBoundary} from "./lib/slot-recovery-rest.js";
import {invalidateSlotRecoveryState} from "./32j-logic-slot-recovery.js";
import {martyrZero} from "./32e-logic-martyr-actions.js";
import {$,$$,clamp,esc,num,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {renderIdentity,renderTiles,syncLang,used} from "./08-ui-render-sheet-and-actions.js";import {syncLU} from "./08b-ui-render-summaries-actions.js";
import {DS_OVER,__set_DS_OVER,flash,hpFloat,hpOpen,syncDeath,syncHP,vbSync} from "./09-ui-hit-points-playbar-death-saves.js";
import {renderConds} from "./10-ui-conditions.js";
import {refreshEntry,sheet,sheetMode,showEntry,swpMove,swpSet} from "./12-ui-bottom-sheet-modal.js";

import {routeDivineInterventionUse,invalidateClericResourceState,prepareDivineInterventionRest,finishDivineInterventionRest} from "./32f-logic-divine-intervention.js";

const slotRecoveryRest=createSlotRecoveryRestBoundary({actor:()=>({C,S,readOnly:!!FROZEN}),plan:kind=>env.__bldSlotRecoveryRestPlan?.(kind)});
/* ================= GLOBAL CLICK DELEGATION ================= */
function iounMathDenied(){if(!iounCharacterMathStatus(C,S).reviewRequired)return false;toast('Review the saved Ioun Stone bonuses before changing resources. Open the Ioun Stone review panel or Apply this character’s matching Build.');return true}
document.addEventListener("click",(e) =>{
  const inSheet=!!e.target.closest("#sheet");
  const ct=e.target.closest("[data-condtoggle]"); if(ct){ const ck=ct.getAttribute("data-condtoggle"); undoMark((S.cond[ck]?"Remove ":"Add ")+ck); if(S.cond[ck]) delete S.cond[ck]; else S.cond[ck]=true; save(); renderAll(); refreshEntry(); return; }
  const inf=e.target.closest("[data-info]"); if(inf && sheetMode!=="edit"){ e.preventDefault(); if(!inSheet) swpSet(inf); showEntry({type:"info",spec:inf.getAttribute("data-info")}, inSheet); return; }
  const bd=e.target.closest("[data-bd]"); if(bd && sheetMode!=="edit"){ showEntry({type:"bd",key:bd.getAttribute("data-bd")}, inSheet); return; }
  if(e.target.closest("#insp")){ undoMark("Heroic Inspiration"); S.insp=!S.insp; save(); const b=$("#insp"); b.setAttribute("aria-pressed",S.insp); $("#inspN").textContent=S.insp?"Ready":"None"; vbSync(); return; }
  if(e.target.closest("#condOpen")){ showEntry({type:"cond"},false); return; }
  const off=e.target.closest("#conds [data-off]"); if(off){ undoMark("Remove "+off.getAttribute("data-off")); delete S.cond[off.getAttribute("data-off")]; save(); renderAll(); return; }
  const swb=e.target.closest("[data-swp]"); if(swb){ if(!swb.disabled) swpMove(+swb.getAttribute("data-swp")); return; }/* v36 p18 */
  const uf=e.target.closest("[data-usef]"); if(uf&&!uf.disabled){ const up=uf.getAttribute("data-usef").split("|"), ur=(D.res||[]).filter((q) =>{return q.k===up[0]})[0]; if(ur){if(iounMathDenied())return;if(summonResourceManaged(C,S,up[0])){toast('Use the source item’s panel to resolve its activation or actual recovery.');return}if(+up[1]<0&&routeDivineInterventionUse(up[0]))return;invalidateClericResourceState();invalidateSlotRecoveryState(S);undoMark("Limited Use",1); const ulf=clamp(ur.max-used(up[0],ur.max)+(+up[1]),0,ur.max); S.used[up[0]]=ur.max-ulf; save(); syncLU(); refreshEntry(); toast((+up[1]<0?"Used ":"Gave back ")+esc(ur.n||"")+". "+ulf+" left"); } return; }/* v36 p17 */
  const plb=e.target.closest(".plb[data-k]"); if(plb){ const pk=plb.getAttribute("data-k"), pr=(D.res||[]).filter((q) =>{return q.k===pk})[0]; if(pr){if(iounMathDenied())return;if(summonResourceManaged(C,S,pk)){toast('Use the source item’s panel to resolve its activation or actual recovery.');return}if(+plb.getAttribute("data-pd")<0&&routeDivineInterventionUse(pk))return;invalidateClericResourceState();invalidateSlotRecoveryState(S);undoMark("Limited Use",1); const lf=clamp(pr.max-used(pk,pr.max)+(+plb.getAttribute("data-pd")),0,pr.max); S.used[pk]=pr.max-lf; save(); syncLU(); } return; }
  const pw=e.target.closest("[data-pactset]"); if(pw){ const nm=pw.getAttribute("data-pactset"); if(env.__bldSetPact&&env.__bldSetPact(nm)){ toast(nm+" is now your pact weapon."); renderAll(); } return; }
  const bx=e.target.closest("#lu .bx, #featBody .bx, #actBody .bx, #spBody .bx, #sheetBody .bx[data-k]"); if(bx){ if(iounMathDenied())return;const k=bx.getAttribute("data-k"), i=+bx.getAttribute("data-i");if(summonResourceManaged(C,S,k)){toast('Use the source item’s panel to resolve its activation or actual recovery.');return}invalidateClericResourceState();invalidateSlotRecoveryState(S);undoMark(/^s\d$/.test(k)?"Spell slot":k==="hd"?"Hit Dice":"Limited Use"); S.used[k] = (num(S.used[k],0)===i+1) ? i : i+1; save(); syncLU(); return; }
  const rest=e.target.closest("[data-rest]"); if(rest){ openRest(rest.getAttribute("data-rest")); return; }/* RU41 */
  const pip=e.target.closest("#dsS .pip, #dsF .pip"); if(pip){ undoMark("Death Saving Throw"); const which=pip.parentNode.id==="dsS"?0:1, pi=+pip.getAttribute("data-i"); S.ds[which]=(S.ds[which]===pi+1)?pi:pi+1; save(); syncDeath(); if(S.ds[0]===3) toast("Stable at 0 Hit Points"); if(S.ds[1]===3) toast("Three failures. Your character dies"); return; }
});
export function doRest(kind,quiet){
 const {ex0}=doRestStep1(kind);
  doRestStep2(kind, ex0, quiet);
}
function doRestStep1(kind){
const recoveryRest=slotRecoveryRest.prepare(kind);invalidateSlotRecoveryState(S);const interventionRest=prepareDivineInterventionRest();sitReset(kind==='short'?'short':'long'); const ex0=num(S.exh,0), hp14=(kind!=="short"&&x14())?hdPlan():null;/* v94 */ if(S.mode){ if(kind==="short"){ ["rage","sacred","wings","radiance","shroud"].forEach((k) =>{ delete S.mode[k]; }); } else delete S.mode; }/* v22: Rage, Sacred Weapon, and Celestial Revelation last minutes, Wild Shape hours */
  D.res.forEach((r) =>{
    if(Object.prototype.hasOwnProperty.call(r,'slotRecovery')||summonResourceManaged(C,S,r.k))return;
    let u=num(S.used[r.k],0);
    if(kind==="short"){ if(r.reset==="short") u=0; else if(r.reset==="short1") u=Math.max(0,u-1); }    else if(hp14&&hp14[r.k]!=null) u=Math.max(0,u-hp14[r.k]);/* v94: 2014, half of the Hit Dice come back */
    else { if(r.reset!=="none") u=0; }
    S.used[r.k]=u;
  });
  finishDivineInterventionRest(kind,interventionRest);
  slotRecoveryRest.finish(kind,recoveryRest);
  return /** @type {any} */ ({ex0});
}
function doRestStep2(kind, ex0, quiet){
  if(S.mw) delete S.mw;/* Magic Weapon lasts 1 hour: any rest ends it */ if(S.shift) S.shift=0; S.lastDmg=null;
  if(kind==="short"){ if(!quiet) toast("Short Rest: uses restored."); }
  else { const before=S.hp; S.hp=D.hpmax; S.tmp=0; S.ds=[0,0]; if(S.exh>Math.max(0,num(D.exhMin,0))) S.exh--; if(S.hp>before) flash("healed"); if(hasFeat("Resourceful")&&!S.insp){ S.insp=true; try{ renderTiles(); }catch(er){} }/* v21 RU54 */ if(!quiet) toast(x14()?"Long Rest: Hit Points, up to half of your Hit Dice, and every use restored.":"Long Rest: Hit Points, Hit Dice, and every use restored."); }  save(); syncHP(); syncLU(); renderConds();
  if(kind!=="short"&&ex0>0){ try{ renderAll(); }catch(er){} }/* v94: a lower Exhaustion level changes Speed, checks, and (2014) the Hit Point maximum, so the sheet is worked out again */
}
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-campadd]"); if(!b) return; e.preventDefault(); const t=[].slice.call(document.querySelectorAll("[data-tab='p-desc'],[data-go='6']")).filter((x) =>{ return x.offsetParent; })[0]; if(t) t.click(); setTimeout(() =>{ const i=$("#n-camp"); if(i){ i.scrollIntoView({block:"center"}); i.focus(); } },450); });/* T10 */
["#notesBody","#descBody"].forEach((sel) =>{ const nb=$(sel); if(nb) nb.addEventListener("input",(e) =>{/* v23: Description tab too */
  const t=e.target;
  if(t.hasAttribute("data-note")){ S.notes[t.getAttribute("data-note")]=t.value; save(); }
  else if(t.hasAttribute("data-lang")){ S.lang[+t.getAttribute("data-lang")]=t.value; save(); syncLang(); }
  else if(t.id==="n-align"){ S.align=t.value; save(); }
  else if(t.id==="n-camp"){ S.camp=t.value; save(); renderIdentity(); }/* v30 RU133 */
}); });
(function(){
  const {inp, nudge, amt}=uiGlobalClickDelegationAnonStep1();
  $("#dmgBtn").addEventListener("click",() => anonFn1_(amt, nudge, inp));/* v21 RU57, RU50 */
  uiGlobalClickDelegationAnonStep2(inp, amt);
})();
function anonFn1_(amt, nudge, inp){const amount=amt();if(!amount){nudge();return}applyNativePlayerDamage(amount,{input:inp})}
function uiGlobalClickDelegationAnonStep1(){
  const inp=$("#hpAmt");
  function amt(){ const v=parseInt(inp.value,10); return isNaN(v)?0:Math.max(0,v); }
  function nudge(){ inp.focus(); inp.classList.remove("nudge"); void inp.offsetWidth; inp.classList.add("nudge"); clearTimeout(nudge.t); nudge.t=setTimeout(() =>{ inp.classList.remove("nudge"); },900); }
  $("#healBtn").addEventListener("click",() =>{ if(iounCharacterMathStatus(C,S).reviewRequired){toastU("Review the Ioun Stone source and refresh this character’s matching Build before changing Hit Points.");return} const a=amt(); if(!a){nudge();return;} undoMark("Healing"); if(iounCharacterMathStatus(C,S).reviewRequired)return; const wasZero=S.hp===0, before=S.hp; S.hp=Math.min(D.hpmax,S.hp+a); if(wasZero) S.ds=[0,0]; if(S.hp>before){ flash("healed"); hpFloat("+"+(S.hp-before),"heal"); } inp.value=""; save(); syncHP(); toastU("Healed "+(S.hp-before)+" "+hpWord(S.hp-before)+"."); });
  return /** @type {any} */ ({inp, nudge, amt});
}
function uiGlobalClickDelegationAnonStep2(inp, amt){
  inp.addEventListener("keydown",(e) =>{ if(e.key==="Enter"){ e.preventDefault(); (e.shiftKey?$("#healBtn"):$("#dmgBtn")).click(); } });
  $$("[data-tmp]").forEach((b) =>{ b.addEventListener("click",() =>{ undoMark("Temporary Hit Points",1); S.tmp=Math.max(0,S.tmp+(+b.getAttribute("data-tmp"))); save(); syncHP(); }); });
  /* v30 B6: +1, +5, +10 add to the amount, the last button clears it. B7: Set puts the typed amount into Temporary HP */
  $$("[data-hpadd]").forEach((b) =>{ b.addEventListener("click",() =>{ const n=+b.getAttribute("data-hpadd"); inp.value=n?String(amt()+n):""; inp.classList.remove("pop"); void inp.offsetWidth; if(n) inp.classList.add("pop"); }); });
  (function(){ const tv=$("#tmpV"); if(!tv||tv.tagName!=="INPUT") return;/* v31 p96: type Temporary HP directly */
    function commit(){ const v=Math.max(0,Math.floor(+tv.value||0)); if(v===S.tmp){ tv.value=S.tmp; return; } undoMark("Temporary Hit Points"); S.tmp=v; save(); syncHP(); toastU("Temporary Hit Points: "+v+"."); }
    tv.addEventListener("change",commit); tv.addEventListener("keydown",(e) =>{ if(e.key==="Enter"){ e.preventDefault(); tv.blur(); } }); tv.addEventListener("focus",() =>{ try{ tv.select(); }catch(er){} }); })();
  $$("[data-tmpset]").forEach((b) =>{ b.addEventListener("click",() =>{ const a=amt(); if(!a){ toast("Type an amount first, then press Set."); return; } undoMark("Temporary Hit Points"); S.tmp=a; inp.value=""; save(); syncHP(); toastU("Temporary Hit Points: "+a+"."); }); });
}

