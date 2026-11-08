import {clsLvls,lateSet,renderExtras,toastU,undoMark} from "./00a-reg-late-ports.js";import {fmtInt} from "./lib/fmt.js";
import {x14} from "./03-data-glossary.js";
import {C,S,save} from "./04-logic-storage.js";
import {ask,esc,num,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {featAll} from "./08b-ui-render-summaries-actions.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";

/* ================= v28: BASTION (RD22, DMG 2024 chapter 8) =================
   S.bastion (optional): {name, basic:[{k,sp}], fac:[{k, vast, ch:[...], ord}], def, turn, idle, mode ("orders" or "maintain"), log:[{n, t, o:[[facility, option]], m, ev, note, lost}]}.
   Data in BASTION (db4.js). Hirelings, costs, and days are shown; coins are not taken automatically (use Manage Coin). No dice are rolled (D4): the result is picked */
function bsOn(){ const b=S.bastion; if(!b||typeof b!=="object"||Array.isArray(b)) return null; ["basic","fac","log"].forEach((k) =>{ if(!Array.isArray(b[k])) b[k]=[]; });/* v28 I1: a damaged shape is repaired as it is read */
  b.basic=b.basic.filter((x) =>{ return x&&typeof x==="object"&&typeof x.k==="string"; }); b.fac=b.fac.filter((x) =>{ return x&&typeof x==="object"&&typeof x.k==="string"; }); b.log=b.log.filter((x) =>{ return x&&typeof x==="object"; }); b.fac.forEach((f) =>{ if(f.ch!=null&&!Array.isArray(f.ch)) delete f.ch; }); return b; }
function bsSlots(lv){ let n=0; ((typeof BASTION!=="undefined"&&BASTION.slots)||[]).forEach((r) =>{ if(lv>=r[0]) n=r[1]; }); return n; }
function bsLv(){ return D.level||num(C.level,1); }
function bsHasCls(L){ const lv=clsLvls(); return L.some((c) =>{ return lv[c]; }); }
function bsPreOk(k){ if(!k) return true; const fe=featAll().map((x) =>{ return x.f.n; });
  if(k==="arcane") return bsHasCls(["Bard","Sorcerer","Warlock","Wizard"]);
  if(k==="holy") return bsHasCls(["Cleric","Paladin","Druid","Ranger"]);
  if(k==="focus") return bsHasCls(["Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Warlock","Wizard","Artificer"]);
  if(k==="artisan") return bsHasCls(["Artificer"]);/* v61 */
  if(k==="expertise") return (C.skills||[]).some((s) =>{ return num(s.p,0)===2; });
  if(k==="fight") return fe.some((n) =>{ return /^Fighting Style|^Unarmored Defense/.test(n); }); return true; }
function bsEfa(b){ return b.efa!=null?!!b.efa:(C.cls==="Artificer"||/EFotA/.test(String(C.species||"")+String(C.bg||""))||/Heir$|^Archaeologist$|^Inquisitive$|^House Agent$/.test(String(C.bg||""))); }/* v61: Eberron facilities show when the Bastion says so, or the character is an Eberron one */
function bsCap(b){ return (b.fac||[]).filter((f) =>{ return f.k==="Barrack"; }).reduce((t,f) =>{ return t+(f.vast?25:12); },0); }
function bsSel(attr,opts,cur,ph){ return '<select class="bs-sel" '+attr+'>'+(ph?'<option value="">'+esc(ph)+'</option>':'')+opts.map((o) =>{ const v=Array.isArray(o)?o[0]:o, t=Array.isArray(o)?o[1]:o; return '<option value="'+esc(v)+'"'+(String(cur)===String(v)?' selected':'')+'>'+esc(t)+'</option>'; }).join("")+'</select>'; }
function bsGP(n){ return fmtInt(n)+" GP"; }
let bsAddK="",bsAddB="Bedroom",bsAddS="Cramped",bsEv="",bsNote="",bsLost="";
export function bastionH(){ if(typeof BASTION==="undefined"||x14()) return "";/* v94: Bastions are a 2024 Dungeon Master's Guide rule */
 const _bastionHStep1=bastionHStep1();
 const {b, lv, BF}=_bastionHStep1;
 let {h}=_bastionHStep1;
  if(!b) return h+'<div class="bs empty-note empty-st xempty">'+ico("ui-castle","es-i")+'<b>No Bastion yet</b><p class="bs-why">A Bastion is a home base that works for you between adventures: special facilities with hirelings who craft, harvest, recruit, research, and trade (DMG 2024, chapter 8). It usually comes at level 5'+(lv<5?'; your character is level '+lv+', so ask your DM first':'')+'.</p><button type="button" class="btn pri press" data-bs="setup">'+ico("ui-castle","ibt")+'Set Up Bastion</button></div>';/* v31 C9 */
  const _bastionHStep2=bastionHStep2(lv, b, h, BF);
  const {slots, nf}=_bastionHStep2;
  h=_bastionHStep2.h;
  (b.fac||[]).forEach((f,i) =>{ const d=BF[f.k]; if(!d) return; let vast=!!f.vast, ok=bsPreOk(d.pre), ch=d.ch, chosen=f.ch||[];
    h+='<div class="bs-f"><div class="bs-fh"><b>'+esc(f.k)+'</b><small>Level '+d.lv+' • '+(vast?"Vast":d.sp)+' • '+(d.hi+(vast&&/Garden/.test(f.k)?1:0)+(vast&&f.k==="Pub"?3:0)+(vast&&f.k==="Workshop"?2:0)+(vast&&d.enlHi||0))+' hireling'+(d.hi>1||vast?'s':'')+' • '+d.ord+' • '+(d.src||"DMG-2024")+(d.pg?", pg. "+d.pg:"")+'</small></div>'+
      (ok?'':'<p class="caution">Prerequisite not met: '+esc(BASTION.pre[d.pre])+'. Ask your DM.</p>')+(d.lv>bsLv()?'<p class="caution">This facility needs level '+d.lv+'.</p>':'')+
      '<p class="info-d">'+esc(d.d)+'</p>';
    if(ch&&f.k==="Garden"){ const gn=vast?2:1; h+='<div class="bs-ch"><small>'+esc(ch[0])+(gn>1?' (a Vast Garden is two gardens)':'')+'</small><div class="bs-add">'+Array.apply(null,{length:gn}).map((_,j) =>{ return bsSel('data-bsg="'+i+':'+j+'" aria-label="'+esc(ch[0])+' '+(j+1)+'"',ch[3].map((o) =>{ return o[0]; }),chosen[j]||"","- Choose -"); }).join("")+'</div>'+(chosen.length?'<p class="info-d bs-chd">'+chosen.map((c) =>{ const o=ch[3].filter((x) =>{ return x[0]===c; })[0]; return o?'<b>'+esc(o[0])+'.</b> '+esc(o[1])+'.':''; }).join(" ")+'</p>':'')+'</div>'; ch=null; }/* v28 M4 */
    if(ch){ const n=vast?ch[2]:ch[1]; h+='<div class="bs-ch"><small>'+esc(ch[0])+' ('+chosen.length+' / '+n+')</small><div class="bs-chips">'+ch[3].map((o) =>{ const on=chosen.indexOf(o[0])>=0; return '<button type="button" class="chip'+(on?' on':'')+'" data-bs="ch" data-i="'+i+'" data-v="'+esc(o[0])+'" aria-pressed="'+on+'"'+(o[1]?' title="'+esc(o[1])+'"':'')+'>'+esc(o[0])+'</button>'; }).join("")+'</div>'+
      (chosen.length?'<p class="info-d bs-chd">'+ch[3].filter((o) =>{ return chosen.indexOf(o[0])>=0&&o[1]; }).map((o) =>{ return '<b>'+esc(o[0])+'.</b> '+esc(o[1])+'.'; }).join(" ")+'</p>':'')+'</div>'; }
    h+='<div class="bs-ord"><small>Order this turn ('+d.ord+')</small>'+bsSel('data-bso="'+i+'"'+(b.mode==="maintain"?' disabled':''),d.opts.map((o) =>{ return [o[0],o[0]]; }),f.ord||"","No order")+'</div>'+
      (f.ord?'<p class="info-d bs-od">'+esc((d.opts.filter((o) =>{ return o[0]===f.ord; })[0]||["",""])[1])+'</p>':'')+
      '<div class="bkpr">'+(d.enl&&!vast?'<button type="button" class="btn sm press" data-bs="vast" data-i="'+i+'">Enlarge to Vast ('+bsGP(d.enl[0])+')</button>':'')+'<button type="button" class="btn sm press rm" data-bs="rmfac" data-i="'+i+'">Remove</button></div>'+
      (d.enl?'<p class="info-d bs-enl">'+(vast?'Enlarged. ':'')+esc(d.enl[1])+'</p>':'')+'</div>'; });
  const _bastionHStep3=bastionHStep3(b, BF, h, nf, slots, lv);
  const {orders}=_bastionHStep3;
  h=_bastionHStep3.h;
  ({h}=bastionHStep4(b, h, orders));
  return h; }
function bastionHStep1(){
let b=bsOn(), lv=bsLv(), BF=BASTION.f, h='<h3 class="fcat" id="bastion">Bastion</h3>';
  return /** @type {any} */ ({b, lv, BF, h});
}
function bastionHStep2(lv, b, h, BF){
  const slots=bsSlots(lv), nf=(b.fac||[]).length, cap=bsCap(b);
  h+='<div class="bs"><div class="bs-top"><label class="bs-nm"><span>Name</span><input data-bsf="name" value="'+esc(b.name||"")+'" placeholder="For example: The Lantern House" maxlength="60"></label>'+
    '<div class="bs-k"><span><small>Bastion Turn</small><b>'+num(b.turn,0)+'</b></span><span><small>Special Facilities</small><b>'+nf+' / '+slots+'</b></span><span><small>Defenders</small><b class="bs-def"><button type="button" class="bs-pm" data-bs="def-" aria-label="One defender fewer">−</button>'+num(b.def,0)+'<button type="button" class="bs-pm" data-bs="def+" aria-label="One more defender">+</button></b>'+(cap?'<small>Barracks hold '+cap+'</small>':'')+'</span></div></div>';
  if(lv<5) h+='<p class="caution">Special facilities come at level 5 (2), then 4 at level 9, 5 at level 13, and 6 at level 17.</p>';
  if(num(b.idle,0)&&num(b.idle,0)>=lv-1) h+='<p class="caution">No orders for '+b.idle+' Bastion turns in a row. After '+lv+' (your level), the hirelings leave and the Bastion is lost.</p>';
  /* basic facilities */
  h+='<div class="info-h">Basic Facilities</div><p class="info-d">No game effect, but good for stories. Each new one or each step larger costs money and time.</p><div class="bs-list">'+(b.basic||[]).map((x,i) =>{ const g=BASTION.grow[x.sp];
    return '<div class="bs-row"><span><b>'+esc(x.k)+'</b><small>'+esc(x.sp)+', up to '+BASTION.space[x.sp]+' squares</small></span>'+(g?'<button type="button" class="btn sm press" data-bs="grow" data-i="'+i+'" title="'+bsGP(g[0])+', '+g[1]+' days">Enlarge ('+bsGP(g[0])+', '+g[1]+' days)</button>':'')+'<button type="button" class="btn sm press rm" data-bs="rmbasic" data-i="'+i+'" aria-label="Remove '+esc(x.k)+'">Remove</button></div>'; }).join("")+'</div>';
  const ad=BASTION.add[bsAddS]||[0,0];
  h+='<div class="bs-add">'+bsSel('data-bsa="b"',BASTION.basic,bsAddB)+bsSel('data-bsa="s"',["Cramped","Roomy","Vast"],bsAddS)+'<button type="button" class="btn sm press" data-bs="addbasic">Add ('+bsGP(ad[0])+', '+ad[1]+' days)</button></div>';
  /* special facilities */
  h+='<div class="info-h">Special Facilities</div><p class="info-d">You gain them with levels, not money. Each level you gain, you can swap one for another you qualify for.</p>';
  if(Object.keys(BF).some((k) =>{ return BF[k].src==="EFotA"; })){ const ef=bsEfa(b); h+='<div class="bs-mode"><button type="button" class="ifb'+(ef?' on':'')+'" data-bs="efa" aria-pressed="'+ef+'">Eberron facilities (EFotA): '+(ef?'on':'off')+'</button></div>'; }/* v61 */
  return /** @type {any} */ ({slots, nf, h});
}
function bastionHStep3(b, BF, h, nf, slots, lv){
  const have=(b.fac||[]).map((f) =>{ return f.k; }), can=Object.keys(BF).filter((k) =>{ return BF[k].lv<=Math.max(5,lv)&&(BF[k].multi||have.indexOf(k)<0)&&(BF[k].src!=="EFotA"||bsEfa(b)); }).sort((x,y) =>{ return BF[x].lv-BF[y].lv||(x<y?-1:1); });
  if(!can.some((k) =>{ return k===bsAddK; })) bsAddK="";
  h+='<div class="bs-add">'+bsSel('data-bsa="f"',can.map((k) =>{ return [k,k+" (level "+BF[k].lv+(bsPreOk(BF[k].pre)?"":", prerequisite not met")+")"]; }),bsAddK,"- Choose a special facility -")+'<button type="button" class="btn sm press" data-bs="addfac"'+(nf>=slots?' disabled':'')+'>Add</button></div>'+(nf>=slots?'<p class="info-d">All '+slots+' places are used. Remove one to pick another.</p>':'');
  /* Bastion turn */
  const orders=(b.fac||[]).filter((f) =>{ return f.ord; });
  h+='<div class="info-h">Bastion Turn</div><p class="info-d">Usually every 7 days of game time. Give orders to facilities, or give the Maintain order to the whole Bastion, which also happens when you are away.</p>'+
    '<div class="bs-mode">'+[["orders","Give orders"],["maintain","Maintain"]].map((m) =>{ const on=(b.mode||"orders")===m[0]; return '<button type="button" class="ifb'+(on?' on':'')+'" data-bs="mode" data-v="'+m[0]+'" aria-pressed="'+on+'">'+m[1]+'</button>'; }).join("")+'</div>';
  return /** @type {any} */ ({orders, h});
}
function bastionHStep4(b, h, orders){
  if(b.mode==="maintain"){ const EV=BASTION.events;
    h+='<p class="info-d">'+esc(BASTION.orders.Maintain)+' Pick what the DM rolled.</p><div class="bs-add">'+bsSel('data-bsa="ev"',EV.map((e) =>{ return [e[2],(e[0]<10?"0":"")+e[0]+" to "+(e[1]===100?"00":e[1])+": "+e[2]]; }),bsEv,"- Bastion event -")+'</div>';
    const ev=EV.filter((e) =>{ return e[2]===bsEv; })[0]; if(ev) h+='<p class="info-d">'+esc(ev[3])+'</p>'+(/Attack|Request for Aid/.test(ev[2])?'<label class="bs-nm"><span>Defenders lost</span><input type="number" min="0" data-bsa="lost" value="'+esc(bsLost)+'"></label>':'');
  } else h+='<p class="info-d">'+(orders.length?'Orders: '+orders.map((f) =>{ return esc(f.k)+' ('+esc(f.ord)+')'; }).join(", ")+'.':'No order picked yet. Pick an order on a facility above.')+'</p>';
  h+='<label class="bs-nm"><span>Note</span><input data-bsa="note" value="'+esc(bsNote)+'" maxlength="200" placeholder="What came of it"></label><div class="bkpr"><button type="button" class="btn pri press" data-bs="turn">Take Bastion Turn '+(num(b.turn,0)+1)+'</button></div>';
  if((b.log||[]).length) h+='<div class="info-h">Turn Log</div><div class="bs-log">'+b.log.slice().reverse().slice(0,30).map((e) =>{ return '<div class="bs-le"><b>Turn '+e.n+'</b> <small>'+esc(e.t||"")+'</small><p>'+(e.m?'Maintain'+(e.ev?': '+esc(e.ev):'')+(e.lost?', '+e.lost+' defender'+(e.lost>1?'s':'')+' lost':''):(e.o&&e.o.length?e.o.map((o) =>{ return esc(o[0])+': '+esc(o[1]); }).join("; "):'No orders'))+(e.note?'. '+esc(e.note):'')+'</p></div>'; }).join("")+'</div>';
  h+='<div class="bkpr"><button type="button" class="btn sm press rm" data-bs="drop">Give Up the Bastion</button></div></div>';
  return /** @type {any} */ ({h});
}
function bsSave(msg,undo){ save(); renderExtras(); if(msg) (undo?toastU:toast)(msg); }
function bsAct(a,t){
 const {b, BF, i}=bsActStep1(t);
  if(a==="setup"){ undoMark("Set up Bastion"); S.bastion={name:"",basic:[{k:"Bedroom",sp:"Cramped"},{k:"Kitchen",sp:"Roomy"}],fac:[],def:0,turn:0,idle:0,mode:"orders",log:[]}; bsSave("Bastion set up with two basic facilities. Add your special facilities.",1); return; }
  if(!b) return;
  if(a==="def+"||a==="def-"){ b.def=Math.max(0,num(b.def,0)+(a==="def+"?1:-1)); bsSave(); return; }
  if(a==="grow"){ const x=b.basic[i], g=x&&BASTION.grow[x.sp]; if(!g) return; undoMark("Enlarge "+x.k); x.sp=x.sp==="Cramped"?"Roomy":"Vast"; bsSave(x.k+" is now "+x.sp+". It costs "+bsGP(g[0])+" and takes "+g[1]+" days: take the coins in Manage Coin.",1); return; }
  if(a==="rmbasic"){ const y=b.basic[i]; if(!y) return; ask("Remove "+y.k+" ("+y.sp+") from the Bastion?","Remove",() =>{ undoMark("Remove "+y.k); b.basic.splice(i,1); bsSave("Removed "+y.k+".",1); }); return; }
  if(a==="addbasic"){ const ad=BASTION.add[bsAddS]; undoMark("Add "+bsAddB); b.basic=b.basic||[]; b.basic.push({k:bsAddB,sp:bsAddS}); bsSave("Added "+bsAddB+" ("+bsAddS+"). It costs "+bsGP(ad[0])+" and takes "+ad[1]+" days: take the coins in Manage Coin.",1); return; }
  if(a==="addfac"){ if(!bsAddK){ toast("Choose a special facility first."); return; } if((b.fac||[]).length>=bsSlots(bsLv())){ toast("All places are used. Remove one first."); return; } undoMark("Add "+bsAddK); b.fac=b.fac||[]; b.fac.push({k:bsAddK}); const nk=bsAddK; bsAddK=""; bsSave("Added "+nk+".",1); return; }
  if(a==="rmfac"){ const f=b.fac[i]; if(!f) return; ask("Remove "+f.k+" from the Bastion? Its choices and order go with it.","Remove",() =>{ undoMark("Remove "+f.k); b.fac.splice(i,1); bsSave("Removed "+f.k+".",1); }); return; }
  if(a==="vast"){ const fv=b.fac[i], dv=fv&&BF[fv.k]; if(!dv||!dv.enl) return; ask("Enlarge "+fv.k+" to Vast for "+bsGP(dv.enl[0])+"? "+dv.enl[1]+" Take the coins in Manage Coin.","Enlarge",() =>{ undoMark("Enlarge "+fv.k); fv.vast=1; bsSave(fv.k+" is now Vast.",1); }); return; }
  if(a==="ch"){ const fc=b.fac[i], dc=fc&&BF[fc.k]; if(!dc||!dc.ch) return; const L=fc.ch=fc.ch||[], v=t.dataset.v, j=L.indexOf(v), n=fc.vast?dc.ch[2]:dc.ch[1];
    if(j>=0) L.splice(j,1); else { if(n===1) L.length=0; else if(L.length>=n){ toast(dc.ch[0]+": "+n+" at most. Remove one first."); return; } L.push(v); } bsSave(); return; }
  if(a==="mode"){ b.mode=t.dataset.v; bsSave(); return; }
  if(a==="efa"){ b.efa=!bsEfa(b); bsSave(); return; }/* v61 */
  if(a==="turn"){ const maint=b.mode==="maintain", o=maint?[]:(b.fac||[]).filter((f) =>{ return f.ord; }).map((f) =>{ return [f.k,f.ord]; });
    if(maint&&!bsEv){ toast("Pick the Bastion event the DM rolled first."); return; }
    undoMark("Bastion turn"); const e={n:num(b.turn,0)+1,t:new Date().toISOString().slice(0,10),o:o}, note=[];
    if(maint){ e.m=1; e.ev=bsEv; const lost=Math.max(0,Math.round(num(bsLost,0))); if(lost){ e.lost=Math.min(lost,num(b.def,0)); b.def=Math.max(0,num(b.def,0)-lost); } }
    const bfull=!maint&&(b.fac||[]).some((f) =>{ return f.k==="Barrack"&&f.ord&&/^Recruit/.test(f.ord); })&&num(b.def,0)>=bsCap(b); if(bfull){ lateSet("UNDO",null); toast("The Barracks are full. Clear the Recruit order on the Barrack first."); return; }/* v28 M3 */
    (b.fac||[]).forEach((f) =>{ if(!maint&&f.k==="Barrack"&&f.ord==="Recruit: Bastion Defenders"){ const room=bsCap(b)-num(b.def,0), add=Math.max(0,Math.min(4,room)); if(add){ b.def=num(b.def,0)+add; note.push(add+" defender"+(add>1?"s":"")+" recruited"); } } if(f.k==="War Room"&&f.ord==="Recruit: Lieutenant"&&!maint) note.push("one lieutenant joined"); });
    if(bsNote.trim()) note.push(bsNote.trim()); if(note.length) e.note=note.join(", ");
    b.idle=maint||o.length?0:num(b.idle,0)+1; b.turn=e.n; b.log=(b.log||[]).concat([e]).slice(-200); (b.fac||[]).forEach((f) =>{ delete f.ord; }); bsEv=""; bsNote=""; bsLost="";
    bsSave("Bastion turn "+e.n+" done"+(e.note?": "+e.note:"")+".",1); return; }
  if(a==="drop"){ ask("Give up the Bastion? Its facilities, defenders, and turn log are removed from this sheet. Undo can bring them back right after.","Give Up",() =>{ undoMark("Give up Bastion"); delete S.bastion; bsSave("The Bastion is given up.",1); }); return; } }
function bsActStep1(t){
const b=bsOn(), BF=BASTION.f, i=t&&t.dataset&&t.dataset.i!=null?+t.dataset.i:-1;
  return /** @type {any} */ ({b, BF, i});
}
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#extBody [data-bs]"); if(!t||t.disabled) return; e.preventDefault(); bsAct(t.dataset.bs,t); });
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.closest||!t.closest("#extBody .bs")) return; const b=bsOn(); if(!b) return;
  if(t.dataset.bso!=null){ const f=b.fac[+t.dataset.bso]; if(f){ if(f.k==="Barrack"&&/^Recruit/.test(t.value)&&num(b.def,0)>=bsCap(b)){ t.value=""; toast("The Barracks are full ("+bsCap(b)+" Bastion Defenders). This order cannot be given until there is room."); delete f.ord; bsSave(); return; }/* v28 M3 */ if(t.value) f.ord=t.value; else delete f.ord; bsSave(); } return; }
  if(t.dataset.bsg){ const gp=t.dataset.bsg.split(":"), gf=b.fac[+gp[0]]; if(gf){ let gl=Array.isArray(gf.ch)?gf.ch.slice():[]; gl[+gp[1]]=t.value; gl=gl.filter((x,k) =>{ return x||k<+gp[1]; }); while(gl.length&&!gl[gl.length-1]) gl.pop(); if(gl.length) gf.ch=gl; else delete gf.ch; bsSave(); } return; }/* v28 M4 */
  if(t.dataset.bsa==="b"){ bsAddB=t.value; return; } if(t.dataset.bsa==="s"){ bsAddS=t.value; renderExtras(); return; } if(t.dataset.bsa==="f"){ bsAddK=t.value; return; } if(t.dataset.bsa==="ev"){ bsEv=t.value; renderExtras(); return; }
  if(t.dataset.bsf==="name"){ b.name=t.value.slice(0,60); save(); return; } });
document.addEventListener("input",(e) =>{ const t=e.target; if(!t.closest||!t.closest("#extBody .bs")) return; if(t.dataset.bsa==="note") bsNote=t.value; if(t.dataset.bsa==="lost") bsLost=t.value; });

