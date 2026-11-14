import {iounCharacterMathStatus} from '../data/lib/ioun-orbit-source.js';
import {bindLive,chgApply,chgRows,hasFeat,hdHeal,lateGet,lateSet,longExtraH,periOn,recList,recSum,shortChg,shortExtraH,slotUsed,toastU,undoMark} from "./00a-reg-late-ports.js";/* Responsibility: short and long rest: dialog, recovery, summary and takeRest. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env: __coinTotal, __coinsFor, __coinsNow, __ico, __icoCls, __icoItem, __icoText, __miRoll, __openRest. Shared names with other modules come from the imports below, late names through __R. */
import {hdPlan,x14} from "./03-data-glossary.js";
import {C,S,save} from "./04-logic-storage.js";
import {$,esc,num,sg,toast,hpWord} from "./05-logic-helpers.js";
import {B,D,derive} from "./06-logic-derivation.js";
import {syncLU} from "./08b-ui-render-summaries-actions.js";import {used} from "./08-ui-render-sheet-and-actions.js";
import {__set_navStack,openSheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13b-ui-detail-spell-targets-render.js";
import {doRest} from "./19-ui-global-click-delegation.js";

import {env} from "./00-env.js";
import {ico,icoCls,icoItem,icoText} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {COINS,coinTotal,coinsNow} from "./23c-ui-coins.js";bindLive("restRefresh",{get:function(){return restRefresh;}});
bindLive("hdRows",{get:function(){return hdRows;}});
bindLive("openRest",{get:function(){return openRest;}});
/* RU41: rest dialogs like D&D Beyond. Hit Dice: a box per die left. Each picked box asks for the number rolled (no dice rolling in the app) */
let restSel={}, restAuto=true;
function hdRows(){ return (D.res||[]).filter((r) =>{ return r.k==="hd"||/^hd-d/.test(r.k); }); }
function shortList(){ return (D.res||[]).filter((r) =>{ return r.reset==="short"||r.reset==="short1"; }); }
function restHTML(kind){
 const _restHTML2Step1=restHTML2Step1(kind);
 const {hp1}=_restHTML2Step1;
 let {h}=_restHTML2Step1;
  if(kind==="menu") return h+restCards()+'</div>';/* v32 p25 C15 */
  if(kind==="short"){ let cm=D.mod.CON, tot=0; h+=restHint();/* v32 p25 */
    h+=x14()?'<p class="info-d">A Short Rest lasts at least 1 hour. You do nothing more strenuous than eating, drinking, reading, or tending wounds. At the end you can spend any number of your Hit Dice to heal, one at a time, and some features recharge.</p>':'<p class="info-d">A Short Rest is 1 hour of downtime with nothing more tiring than talking, eating, reading, or keeping watch. It ends early, with no benefit, if you roll Initiative, cast any spell except a cantrip, or take damage. You can spend Hit Point Dice to heal, one at a time, and some features recharge.</p>';
    const rl=shortList(); h+='<div class="info-h">Recover</div>'+(rl.length?recUL(rl.map((r) => restHTMLFn1(r))):'<p class="info-d">No features recharge on a Short Rest.</p>');
    h+='<label class="ck"><input type="checkbox" data-rauto="1"'+(restAuto?' checked':'')+'> Automatically apply healing</label>';
    hdRows().forEach((r) =>{ const die=num(r.die,num(C.hitDie,10)), left=r.max-used(r.k,r.max), sel=restSel[r.k]||[];
      h+=restHTMLPart1(die, cm, r, left);
      for(let i=0;i<left;i++){ const on=sel[i]!=null; h+='<button type="button" class="bx" aria-pressed="'+on+'" data-hdk="'+r.k+'" data-hdi="'+i+'" aria-label="Spend Hit Die '+(i+1)+'"></button>'; }
      h+='</div>'+(left?'':'<p class="muted">No Hit Dice left. A Long Rest restores '+(x14()?'half of them, at least one':'them')+'.</p>');
      sel.forEach((v,i) =>{ if(v==null) return; const heal=v?hdHeal(v):0; tot+=heal; h+='<label class="hdv">Die '+(i+1)+' (1 to '+die+')<input type="number" min="1" max="'+die+'" data-hdv="'+r.k+'" data-hdi="'+i+'" value="'+(v||"")+'" placeholder="roll">'+(env.__miRoll&&env.__miRoll.roll?'<button type="button" class="btn press hd-roll" data-hdroll="'+r.k+'" data-hdi="'+i+'" data-die="'+die+'">Roll</button>':'')+'<span class="hdh">'+(v?'+'+heal+' '+hpWord(heal):'type the number rolled')+'</span></label>'; });
      h+='</div>'; });
    h+=shortExtraH();/* v21 */
    h+='<p class="info-d"><b id="restTot">Healing: '+tot+' '+hpWord(tot)+'</b> (each die: the number rolled plus your Constitution modifier, at least 1'+(periOn()?', then doubled':'')+')</p>';
    if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Short Rest.</p>';
    return h+slideC("short","Slide to take Short Rest",hp1)+'</div>'; }
  ({h}=restHTML2Step2(h, hp1));
  return h+slideC("long","Slide to take Long Rest",hp1)+'</div>'; }
function restHTMLPart1(die, cm, r, left){ return ('<div class="hdrow"><b>'+(hdRows().length<2?esc((C.cls||"").toUpperCase())+' ':'D'+die+' ')+'HIT DICE</b>'+(hdRows().length>1&&hdCls(die)?' <span class="muted">('+esc(hdCls(die))+')</span>':'')+' <span class="muted">(Hit Die: 1d'+die+sg(cm)+' \u2022 Total: '+r.max+', left: '+left+')</span><div class="boxes">'); }
function restHTML2Step1(kind){
 const _restHTMLStep1=restHTMLStep1(kind);
 const {hp1}=_restHTMLStep1;
 let {h}=_restHTMLStep1;
  return /** @type {any} */ ({hp1, h});
}
function restHTML2Step2(h, hp1){
  ({h}=restHTMLStep2(h, hp1));
  return /** @type {any} */ ({h});
}
function restHTMLFn1(r){ const u=used(r.k,r.max); return [r.n+(r.reset==="short1"?" (one use)":"")+(u?"":" (already full)"),!u]; }
function restHTMLStep1(kind){
let hp1=S.hp!=null&&S.hp<1, h='<div id="restDlg" data-kind="'+kind+'">';
  return /** @type {any} */ ({hp1, h});
}
function restHTMLStep2(h, hp1){
  const rec=longRec();/* v32 p25: the same list as the Long Rest card */
  h+=(x14()?'<p class="info-d">A Long Rest lasts at least 8 hours. You sleep and do light activity, with no more than 2 hours awake. One hour of fighting, casting spells, or walking breaks the rest, and you must start it again to gain anything. You can gain the benefit of only one Long Rest in 24 hours, and you need at least 1 Hit Point when you start. You regain all Hit Points and up to half of your total Hit Dice, at least one. If you had food and drink, you also lose 1 level of Exhaustion.</p>':'<p class="info-d">A Long Rest takes at least 8 hours: at least 6 asleep and no more than 2 of light activity. It ends early if you roll Initiative, cast any spell except a cantrip, take damage, or spend 1 hour walking or exerting yourself. If you had rested for at least 1 hour, an early end still counts as a Short Rest. You can resume right away by adding 1 hour to the rest. After a Long Rest, wait 16 hours before starting another.</p>')+'<div class="info-h">Recover</div>'+(rec.length?recUL(rec):'<p class="info-d">Everything is already full.</p>');
  h+=longExtraH();/* v21 */
  if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Long Rest.</p>';
  return /** @type {any} */ ({h});
}
/* v55: slide-to-confirm control for the rests (the handler sits next to the PDF button code) */
function slideC(kind,txt,off){ return '<div class="slidec'+(off?' off':'')+'" data-slide-go="'+kind+'" data-label="'+txt+'"><div class="slidec-fill"></div><div class="slidec-label">'+txt+'</div><button type="button" class="slidec-h" aria-label="'+txt+'. Press Enter to confirm"'+(off?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>'; }
/* ===== v32 p25 (C15, RU132): rest cards, hint, and the summary after a rest ===== */
function longRec(){
 let {rec}=longRecStep1();
 longRecStep2(rec);
  return rec; }
function longRecStep1(){
let sl=(D.res||[]).filter((r) =>{return /^s\d$/.test(r.k)||r.k==="pact"}).reduce((t,r) =>{return t+used(r.k,r.max)},0), hdu=hdRows().reduce((t,r) =>{return t+used(r.k,r.max)},0),
      oth=(D.res||[]).filter((r) =>{ return r.reset!=="none"&&!/^s\d$|^pact$|^hd/.test(r.k)&&used(r.k,r.max)>0; }).map((r) =>{return r.n});
  let hpTo=D.hpmax; if(lateGet("restX").hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0)) hpTo=Math.max(1,(B.hp&&B.hp.parts||[]).filter((p) =>{ return p.l!=="Max HP modifier"&&p.l!=="Set by you"; }).reduce((t,p) =>{ return t+num(p.v,0); },0));/* v21 i2 */
  let rec=[]; if(S.hp==null||S.hp<hpTo) rec.push("Hit Points to "+hpTo); if(x14()) hdu=hdPlan()._n; if(hdu) rec.push(hdu+" Hit "+(hdu>1?"Dice":"Die")); if(sl) rec.push(sl+" Spell Slot"+(sl>1?"s":"")); rec=rec.concat(oth);
  return /** @type {any} */ ({rec});
}
function longRecStep2(rec){
if(hasFeat("Resourceful")&&!S.insp) rec.push("Heroic Inspiration (Resourceful)"); if(S.exh>0) rec.push("Exhaustion level reduced by 1"); if(S.ds&&(S.ds[0]||S.ds[1])) rec.push("Death Saving Throws reset"); if(S.tmp) rec.push("Temporary Hit Points end");
}
function hdLeft(){ return hdRows().reduce((t,r) =>{ return t+Math.max(0,r.max-used(r.k,r.max)); },0); }
function shortRec(){ const o=[], miss=Math.max(0,D.hpmax-num(S.hp==null?D.hpmax:S.hp,0)), hl=hdLeft();
  if(miss&&hl) o.push("Spend up to "+hl+" Hit "+(hl>1?"Dice":"Die")+" to heal ("+miss+" "+hpWord(miss)+" missing)"); else if(!hl) o.push(["No Hit Dice left to spend",1]); else o.push(["Hit Points are full",1]);
  shortList().forEach((r) =>{ if(used(r.k,r.max)) o.push(r.n+(r.reset==="short1"?" (one use)":"")); });
  if(o.length===1&&typeof o[0]!=="string"&&!shortList().some((r) =>{ return used(r.k,r.max); })) o.push(["No uses to get back",1]);
  return o; }
function recUL(L){ return '<div class="rlist" role="list">'+L.map((x) =>{ const off=Array.isArray(x)&&x[1], t=Array.isArray(x)?x[0]:x; return '<span class="rli'+(off?' off':'')+'" role="listitem">'+ico(off?"ui-minus":"ui-check","rli-i")+'<span>'+esc(t)+'</span></span>'; }).join("")+'</div>'; }
function restCards(){ const z=S.hp!=null&&S.hp<1, card=function(k,t,d,L){ return '<button type="button" class="restm rcard press" data-rest="'+k+'"><span class="rc-h"><span class="rc-i">'+ico(k==="short"?"rest-short":"rest-long")+'</span><span class="rc-t"><b>'+t+'</b><small>'+d+'</small></span>'+ico("ui-chev-r","rc-go")+'</span>'+recUL(L)+'</button>'; };
  return (z?'<p class="caution">You need at least 1 Hit Point to rest. Heal first, or make Death Saving Throws.</p>':'')+'<div class="rcards">'+card("short","Short Rest","1 hour",shortRec())+card("long","Long Rest","8 hours",longRec().length?longRec():[["Everything is already full",1]])+'</div>'; }
function restHint(){ const hp=num(S.hp==null?D.hpmax:S.hp,0), miss=Math.max(0,D.hpmax-hp), hl=hdLeft(); if(hp<1) return "";
  const t=miss&&hl?"You are missing "+miss+" "+hpWord(miss)+". You have "+hl+" Hit "+(hl>1?"Dice":"Die")+" left: tap a box below to spend one, then type the number rolled.":miss?"You are missing "+miss+" "+hpWord(miss)+", but no Hit Dice are left. A Long Rest restores "+(x14()?"half of them, at least one":"them")+".":"Your Hit Points are full, so you do not need to spend Hit Dice.";
  return '<p class="rhint">'+ico("ui-info","rh-i")+'<span>'+esc(t)+'</span></p>'; }
let RS0=null, REST_SUM=null;
function restSnap(){ return {hp:S.hp==null?D.hpmax:S.hp, tmp:num(S.tmp,0), used:structuredClone(S.used||{}), exh:num(S.exh,0), insp:!!S.insp, ds:(S.ds||[0,0]).slice(), mode:Object.keys(S.mode||{})}; }
function restDiff(a){ const o=[], hp=S.hp==null?D.hpmax:S.hp, MODE={rage:"Rage",sacred:"Sacred Weapon",wings:"Celestial wings",radiance:"Celestial radiance",shroud:"Celestial shroud",wild:"Wild Shape"};
  if(hp!==a.hp) o.push(["Hit Points",a.hp+" to "+hp]); if(a.tmp&&!num(S.tmp,0)) o.push(["Temporary Hit Points",a.tmp+" to 0"]);
  (D.res||[]).forEach((r) =>{ const u0=Math.min(r.max,num(a.used[r.k],0)), u1=used(r.k,r.max); if(u0===u1) return; const n=/^s(\d)$/.exec(r.k)?"Level "+r.k.slice(1)+" Spell Slots":r.k==="pact"?"Pact Magic slots":r.n;
    o.push([n,(r.max-u0)+" to "+(r.max-u1)+" of "+r.max+" left"]); });
  if(a.exh!==num(S.exh,0)) o.push(["Exhaustion","level "+a.exh+" to "+num(S.exh,0)]); if(!a.insp&&S.insp) o.push(["Heroic Inspiration","gained"]);
  if((a.ds[0]||a.ds[1])&&!(S.ds&&(S.ds[0]||S.ds[1]))) o.push(["Death Saving Throws","reset"]);
  a.mode.forEach((k) =>{ if(!(S.mode&&S.mode[k])) o.push([MODE[k]||k,"ended"]); });
  return o; }
function restSumToast(kind){ if(!RS0) return; const L=restDiff(RS0); REST_SUM={k:kind,L:L}; RS0=null; const t=$("#toast"); if(!t||!t.classList.contains("on")) return;
  const b=document.createElement("button"); b.type="button"; b.className="tsum"; b.setAttribute("data-restsum","1"); b.innerHTML=ico("ui-info")+"Details"; t.appendChild(b); }
function restSumHTML(){ const s=REST_SUM; if(!s) return '<p class="info-d">No rest taken yet.</p>';
  return '<div id="restSum"><p class="info-d">'+(s.L.length?'What changed when you finished the '+(s.k==="short"?"Short":"Long")+' Rest:':'Nothing changed. Everything was already full.')+'</p>'+(s.L.length?'<div class="rsum">'+s.L.map((x) =>{ return '<div class="rsr">'+ico("ui-check","rli-i")+'<b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>'; }).join("")+'</div>':'')+'<p class="muted">Undo in the message that appeared after the rest puts everything back.</p></div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-restsum]"); if(!b) return; e.preventDefault(); __set_navStack([]); openSheet((REST_SUM&&REST_SUM.k==="long"?"Long":"Short")+" Rest Summary",restSumHTML(),"restsum"); });
function restNames(L){ const n=L.filter((x) =>{ return x[0]!=="Hit Points"&&!/^Hit Dice|^Hit Point Dice/.test(x[0]); }).map((x) =>{ return x[0]; }); return n.length>4?n.slice(0,3).join(", ")+", and "+(n.length-3)+" more":n.join(", "); }
const CAMP="M12 3c1 3 4 4 4 7a4 4 0 0 1-8 0c0-2 1.5-3 1.5-4.5C11 7 11.5 8.5 12 9c.5-2 0-4 0-6zM4 20l16-4M4 16l16 4", MOON="M12 3a7.5 7.5 0 1 0 9 9A9 9 0 1 1 12 3z";
function iounRestDenied(){if(!iounCharacterMathStatus(C,S).reviewRequired)return false;toast('Review the saved Ioun Stone bonuses before using rest recovery. Open the Ioun Stone review panel or Apply this character’s matching Build.');return true}
export function openRest(kind){if(iounRestDenied())return; restSel={}; lateSet("restX",{}); __set_navStack([]); openSheet(kind==="menu"?"Rest":kind==="short"?"Short Rest":"Long Rest", restHTML(kind), "rest"); }
export function restRefresh(kind){ const b=$("#sheetBody"); if(b&&sheetMode==="rest") b.innerHTML=restHTML(kind); }
document.addEventListener("click",(e) =>{ const t=e.target, dlg=t.closest&&t.closest("#restDlg"); if(!dlg) return; const kind=dlg.getAttribute("data-kind");
  const bx=t.closest("[data-hdk]"); if(bx){ e.stopPropagation(); const k=bx.getAttribute("data-hdk"), i=+bx.getAttribute("data-hdi"), s=restSel[k]||(restSel[k]=[]); if(s[i]!=null) s[i]=null; else s[i]=0; restRefresh(kind); return; }
  const go=t.closest("[data-rest-go]"); if(go){ e.stopPropagation(); takeRest(go.getAttribute("data-rest-go")); return; } },true);
document.addEventListener("change",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-rauto]")){ restAuto=t.checked; return; } });
/* V17-3: a typed die value updates its line and the total in place. The dialog is not rebuilt, so focus and the next click stay */
document.addEventListener("input",(e) =>{ const t=e.target; if(!t.matches||!t.matches("#restDlg [data-hdv]")) return; let k=t.getAttribute("data-hdv"), i=+t.getAttribute("data-hdi"), r=hdRows().filter((q) =>{return q.k===k})[0], die=r?num(r.die,num(C.hitDie,10)):12, v=Math.floor(num(t.value,0)), cm=D.mod.CON;
  v=v>=1?Math.min(die,v):0; (restSel[k]||(restSel[k]=[]))[i]=v; const sp=t.parentNode.querySelector(".hdh"); if(sp) sp.textContent=v?"+"+hdHeal(v)+" "+hpWord(hdHeal(v)):"type the number rolled";
  let tot=0; Object.keys(restSel).forEach((q) =>{ (restSel[q]||[]).forEach((x) =>{ if(x) tot+=hdHeal(x); }); }); const te=document.getElementById("restTot"); if(te) te.textContent="Healing: "+tot+" "+hpWord(tot); });
function hdCls(die){ return (String(C.clsLabel||"").match(/[A-Z][A-Za-z']+ \d+/g)||[]).filter((x) =>{ const c=(typeof CLASSES!=="undefined")&&CLASSES[x.replace(/ \d+$/,"")]; return c&&num(c.hd,0)===die; }).join(", "); }
export function takeRest(kind){if(iounRestDenied())return; if(S.hp!=null&&S.hp<1){ toast("You need at least 1 Hit Point to rest."); return; }
  if(kind==="short"){ let cm=D.mod.CON, heal=0, spent=0, miss=0; Object.keys(restSel).forEach((k) =>{ (restSel[k]||[]).forEach((v) =>{ if(v===0) miss++; }); });
    if(miss){ toast("Type the number rolled for each Hit Die you picked, or untick it."); return; }/* V17-2: nothing changes before this check */
    const picked=Object.keys(restSel).some((k) => takeRestFn1(k)), chefV=lateGet("restX").chef&&picked?Math.floor(num(lateGet("restX").chefV,0)):0;
    if(takeRestPart1(picked, chefV)){ toast("Type the 1d8 roll for Replenishing Meal, 1 to 8, or untick it."); return; }
    const rl=recList(), bad=rl.filter((q,i) =>{ return recSum(i)>q.cap; })[0]; if(bad){ toast(bad.n+": choose slots with a combined level of "+bad.cap+" or less."); return; }
    const both={}; rl.forEach((q, i) => takeRestFn2(both, q, i)); const over=Object.keys(both).filter((L) =>{ return both[L]>slotUsed(+L); })[0]; if(over){ toast("You chose more level "+over+" slots than you have spent."); return; }
    undoMark("Short Rest");if(iounRestDenied())return;/* v21 RU57 */ RS0=restSnap();/* v32 p25 */
    Object.keys(restSel).forEach((k) =>{ (restSel[k]||[]).forEach((v) =>{ if(!v) return; spent++; heal+=hdHeal(v); S.used[k]=num(S.used[k],0)+1; }); });
    if(chefV) heal+=chefV;
    const before=S.hp==null?D.hpmax:S.hp; if(restAuto&&heal) S.hp=Math.min(D.hpmax,before+heal);
    doRest("short",true); const rec=[]; rl.forEach((q, i) => takeRestFn3(rec, q, i));
    const nc=chgApply(shortChg()); save(); syncLU(); closeSheet();
    takeRestPart2(spent, before, heal, rec, nc); restSumToast("short"); return; }
  takeRest2Step1(); }
function takeRestPart1(picked, chefV){ return (lateGet("restX").chef&&picked&&(chefV<1||chefV>8)); }
function takeRestPart2(spent, before, heal, rec, nc){ return (toastU("Short Rest taken."+(spent?" "+spent+" Hit "+(spent>1?"Dice":"Die")+" spent"+(restAuto?", "+(S.hp-before)+" "+hpWord(S.hp-before)+" regained.":", "+heal+" "+hpWord(heal)+" rolled (apply them yourself)."):" No Hit Dice spent.")+(rec.length?" "+rec.join(" "):"")+(nc?" Charges updated.":"")+(function(){ return takeRestFn4(); })())); }
function takeRest2Step1(){
  takeRestStep1();
}
function takeRestFn1(k){ return (restSel[k]||[]).some((v) =>{ return v; }); }
function takeRestFn2(both, q,i){ const m=lateGet("restX").rec&&lateGet("restX").rec[i]||{}; Object.keys(m).forEach((L) =>{ both[L]=(both[L]||0)+num(m[L],0); }); }
function takeRestFn3(rec, q,i){ const s=recSum(i); if(!s) return; const m=lateGet("restX").rec[i]; Object.keys(m).forEach((L) =>{ S.used["s"+L]=Math.max(0,num(S.used["s"+L],0)-num(m[L],0)); }); S.used[q.r.k]=num(S.used[q.r.k],0)+1; rec.push(q.n+": "+s+" slot level"+(s>1?"s":"")+" recovered."); }
function takeRestFn4(){ const n=restNames(restDiff(RS0)); return n?" Restored: "+n+".":""; }
function takeRestStep1(){if(iounRestDenied())return;
  undoMark("Long Rest");if(iounRestDenied())return;/* v21 RU57 */ RS0=restSnap();/* v32 p25 */ const lc=chgRows(["dawn","dusk","long"]), hr=lateGet("restX").hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0);
  if(hr){ delete S.hpMod; delete S.hpOver; derive(); }
  doRest("long",true); const nc2=chgApply(lc); if(nc2){ save(); syncLU(); } closeSheet(); const LD=restDiff(RS0), ln=restNames(LD), hpx=LD.filter((x) =>{ return x[0]==="Hit Points"; })[0];
  toastU("Long Rest taken."+(LD.length?" Restored: "+[hpx?"Hit Points ("+hpx[1]+")":""].concat(ln?[ln]:[]).filter(Boolean).join(", ")+".":" Everything was already full.")+(hr?" Maximum HP changes reset.":"")+(nc2?" Charges updated.":"")); restSumToast("long");
}
env.__openRest=openRest;
env.__coinsNow=coinsNow;
/* v33 p03 (RU123 builder): the five coins the sheet shows after Apply when the starting gold is g (same data and rule as coinsNow) */
env.__coinsFor=function(g,mine){ g=num(g,0); if(!mine||!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; const c={}; COINS.forEach((k) =>{ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; };
env.__coinTotal=coinTotal;
env.__ico=ico;
env.__icoCls=icoCls;
env.__icoItem=icoItem;
env.__icoText=icoText;
