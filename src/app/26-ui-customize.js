import {C,S,save} from "./04-logic-storage.js";
import {$,$$,esc,num,sg} from "./05-logic-helpers.js";
import {B,part} from "./06-logic-derivation.js";
import {navStack} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {invKey} from "./23b-ui-items-containers.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"cuApply",{get:function(){return cuApply;},set:function(v){cuApply=v;},configurable:true});
Object.defineProperty(__R,"cuBtn",{get:function(){return cuBtn;},set:function(v){cuBtn=v;},configurable:true});
Object.defineProperty(__R,"cuDecor",{get:function(){return cuDecor;},set:function(v){cuDecor=v;},configurable:true});
Object.defineProperty(__R,"cuHTML",{get:function(){return cuHTML;},set:function(v){cuHTML=v;},configurable:true});
Object.defineProperty(__R,"cuK",{get:function(){return cuK;},set:function(v){cuK=v;},configurable:true});
Object.defineProperty(__R,"cuNm",{get:function(){return cuNm;},set:function(v){cuNm=v;},configurable:true});
Object.defineProperty(__R,"cuNum",{get:function(){return cuNum;},set:function(v){cuNum=v;},configurable:true});
Object.defineProperty(__R,"cuOf",{get:function(){return cuOf;},set:function(v){cuOf=v;},configurable:true});
Object.defineProperty(__R,"cuSave",{get:function(){return cuSave;},set:function(v){cuSave=v;},configurable:true});
Object.defineProperty(__R,"cuSpeed",{get:function(){return cuSpeed;},set:function(v){cuSpeed=v;},configurable:true});
Object.defineProperty(__R,"cuW",{get:function(){return cuW;},set:function(v){cuW=v;},configurable:true});
/* ================= v26: CUSTOMIZE (RU38 no. 2) =================
   S.cust (optional): {key: fields}. It sits in the play state, so Apply from the builder keeps it. Keys and fields:
   "n:<number>" numbers (ac, init, speed, save-STR, sk:<skill name>, pas-per, pas-ins, pas-inv): o override, b bonus, note.
   "a:<attack name>": nm display name, hb to-hit bonus, ho to-hit override, db damage bonus, note.
   "s:<spell name>": nm, dc save DC override, atk spell attack override, note.
   "i:<item key or name>": nm, w weight override (lb, each), note. Empty fields are not stored. */
export function cuK(k){ return S.cust&&typeof S.cust==="object"&&S.cust[k]||null; }
function cuNum(v){ return v===""||v==null||isNaN(+v)?null:+v; }
export function cuNm(k,n){ const c=cuK(k); return c&&c.nm?c.nm:n; }
/* number with a custom bonus or override: adds a line to the breakdown */
function cuApply(k,parts,tot){ const c=cuK("n:"+k); if(!c) return tot; __R.CU0["n:"+k+"|o"]=tot; const b=cuNum(c.b), o=cuNum(c.o);
  if(b){ parts.push(part("Customize: bonus", b, c.note||"Set with Customize")); tot+=b; }
  if(o!=null){ parts.push({l:"Set by you", v:cuFmtK(k,o), note:"Calculated value: "+cuFmtK(k,__R.CU0["n:"+k+"|o"])+". Your number replaces it.", raw:true}); tot=o; } return tot; }
function cuFmtK(k,v){ return /^(save-|sk:|init|spatk)/.test(k)?sg(v):String(v); }
function cuSpeed(sp,parts){ const c=cuK("n:speed"); if(!c) return sp; __R.CU0["n:speed|o"]=sp; const b=cuNum(c.b), o=cuNum(c.o);
  if(b){ parts.push({l:"Customize: bonus", v:(b>0?"+":"−")+Math.abs(b)+" ft", note:c.note||"Set with Customize", raw:true}); sp=Math.max(0,sp+b); }
  if(o!=null){ parts.push({l:"Set by you", v:o+" ft", note:"Calculated value: "+__R.CU0["n:speed|o"]+" ft. Your number replaces it.", raw:true}); sp=Math.max(0,o); } return sp; }
function cuW(i){ const c=cuK("i:"+invKey(i)), w=c?cuNum(c.w):null; return w!=null?w:num(i.w,0); }
/* the customize key of a popup (info spec or breakdown key), with the original name */
function cuOf(type,key){ const i=+key;
  if(type==="w"||type==="ah"||type==="ad"){ const a=(C.attacks||[])[i]; return a?{k:"a:"+a.n, n:a.n, kind:"a"}:null; }
  if(type==="sp"){ const x=(C.spells||[])[i]; return x?{k:"s:"+x.n, n:x.n, kind:"s"}:null; }
  if(type==="it"){ const it=(C.inv||[])[i]; return it?{k:"i:"+invKey(it), n:it.n, kind:"i"}:null; }
  if(type==="bd"){ const m=/^(ac|init|speed|save-[A-Z]{3}|pas-(?:per|ins|inv))$/.exec(key); if(m) return {k:"n:"+key, n:(B[key]||{}).t||key, kind:"n"};
    const s=/^sk-(\d+)$/.exec(key); if(s&&C.skills[+s[1]]) return {k:"n:sk:"+C.skills[+s[1]].n, n:C.skills[+s[1]].n, kind:"n"};
    const a2=/^(ah|ad)-(\d+)$/.exec(key); if(a2) return cuOf("w",a2[2]); }
  return null; }
function cuBtn(o){ const c=cuK(o.k); return (c&&c.note?'<div class="info-h">Your note</div><p class="info-d">'+esc(c.note)+'</p>':'')+'<div class="info-act cu-act"><button type="button" class="btn press" data-cust="'+esc(o.k)+'" data-custn="'+esc(o.n)+'">'+(c?"Customized: change":"Customize")+'</button></div>'; }
/* add the custom name, the note, and the Customize button to a popup */
function cuDecor(spec,r){ const i=spec.indexOf(":"), o=cuOf(spec.slice(0,i),spec.slice(i+1)); if(!o||!r) return r; const c=cuK(o.k);
  return {t:c&&c.nm?c.nm:r.t, h:(c&&c.nm?'<p class="info-d cu-was">Shown as '+esc(c.nm)+'. Name in the rules: '+esc(o.n)+'.</p>':'')+r.h+cuBtn(o)}; }
const CU_F={n:[["o","Override","number","Replaces the total"],["b","Bonus","number","Added to the total"],["note","Note","text",""]],
  a:[["nm","Display name","text",""],["hb","To hit bonus","number","Added to the attack roll"],["ho","To hit override","number","Replaces the attack bonus"],["db","Damage bonus","number","Added to the damage"],["note","Note","text",""]],
  s:[["nm","Display name","text",""],["dc","Save DC override","number","Replaces the save DC of this spell"],["atk","Spell attack override","number","Replaces the spell attack bonus of this spell"],["note","Note","text",""]],
  i:[["nm","Display name","text",""],["w","Weight override (lb each)","number","Replaces the weight of one"],["note","Note","text",""]]};
function cuHTML(k,n){ const kind=k.charAt(0), c=cuK(k)||{}, F=CU_F[kind]||CU_F.n;
  return '<div class="cu"><p class="info-d">Changes for <b>'+esc(n||k.slice(2))+'</b> on this sheet only. They stay when you Apply from the builder. Leave a box empty to use the normal value.</p>'+
    F.map((f) =>{ const v=c[f[0]]!=null?c[f[0]]:""; return '<label class="cu-f"><span>'+f[1]+'</span>'+(f[0]==="note"?'<textarea data-cuf="note" rows="2">'+esc(v)+'</textarea>':'<input data-cuf="'+f[0]+'" type="'+(f[2]==="number"?"number":"text")+'"'+(f[2]==="number"?' inputmode="numeric" step="1"':'')+' value="'+esc(v)+'"'+(f[0]==="nm"?' placeholder="'+esc(n||"")+'"':'')+'>')+(f[3]?'<small>'+f[3]+'</small>':'')+'</label>'; }).join("")+
    '<div class="cu-btns"><button type="button" class="btn press pri" data-cusave="'+esc(k)+'">Save</button>'+(S.cust&&S.cust[k]?'<button type="button" class="btn press" data-cureset="'+esc(k)+'">Reset</button>':'')+'</div></div>'; }
function cuBack(){ if(navStack.length>1){ $("#sheetBack").click(); } else closeSheet(); }
function cuSave(k,reset){ const kind=k.charAt(0), o={};
  if(!reset) $$("#sheetBody [data-cuf]").forEach((el) =>{ let f=el.getAttribute("data-cuf"), v=String(el.value||"").trim(); if(v==="") return;
    if(el.type==="number"){ if(isNaN(+v)) return; v=Math.round(+v); } else v=v.slice(0,f==="note"?600:80); o[f]=v; });
  __R.undoMark("Customize"); S.cust=S.cust&&typeof S.cust==="object"?S.cust:{};
  if(Object.keys(o).length) S.cust[k]=o; else delete S.cust[k]; if(!Object.keys(S.cust).length) delete S.cust;
  save(); __R.renderAll(); cuBack(); __R.toastU(reset||!Object.keys(o).length?"Back to the normal values.":"Customized."); }

