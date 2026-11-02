import {exSpd,hdPlan,x14} from "./03-data-glossary.js";
import {C,S,save,saveC} from "./04-logic-storage.js";
import {$,$$,ask,bldGuard,bldSync,esc,fmtW,invAt,num,sg,toast,viaBld} from "./05-logic-helpers.js";
import {B,D,derive,part} from "./06-logic-derivation.js";
import {CHEV,boxes,esArt,renderInv,syncLU,used} from "./08-ui-render-sheet-and-actions.js";
import {__set_navStack,navStack,openSheet,refreshEntry,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {doRest} from "./19-ui-global-click-delegation.js";
import {setTab} from "./21-ui-tabs-pager.js";
import {dtIcon,spEffH,spGrpLv,spPact,spRangeH,spRowLv,svgI} from "./22-ui-spell-data-and-slots.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"akIcon",{get:function(){return akIcon;},set:function(v){akIcon=v;},configurable:true});
Object.defineProperty(__R,"atkKind",{get:function(){return atkKind;},set:function(v){atkKind=v;},configurable:true});
Object.defineProperty(__R,"coinSet",{get:function(){return coinSet;},set:function(v){coinSet=v;},configurable:true});
Object.defineProperty(__R,"coinStrip",{get:function(){return coinStrip;},set:function(v){coinStrip=v;},configurable:true});
Object.defineProperty(__R,"coinsNow",{get:function(){return coinsNow;},set:function(v){coinsNow=v;},configurable:true});
Object.defineProperty(__R,"ctCap",{get:function(){return ctCap;},set:function(v){ctCap=v;},configurable:true});
Object.defineProperty(__R,"ctH",{get:function(){return ctH;},set:function(v){ctH=v;},configurable:true});
Object.defineProperty(__R,"ctLoad",{get:function(){return ctLoad;},set:function(v){ctLoad=v;},configurable:true});
Object.defineProperty(__R,"ctOf",{get:function(){return ctOf;},set:function(v){ctOf=v;},configurable:true});
Object.defineProperty(__R,"ctShut",{get:function(){return ctShut;},set:function(v){ctShut=v;},configurable:true});
Object.defineProperty(__R,"hdRows",{get:function(){return hdRows;},set:function(v){hdRows=v;},configurable:true});
Object.defineProperty(__R,"ico",{get:function(){return ico;},set:function(v){ico=v;},configurable:true});
Object.defineProperty(__R,"icoCls",{get:function(){return icoCls;},set:function(v){icoCls=v;},configurable:true});
Object.defineProperty(__R,"invKey",{get:function(){return invKey;},set:function(v){invKey=v;},configurable:true});
Object.defineProperty(__R,"invWeight",{get:function(){return invWeight;},set:function(v){invWeight=v;},configurable:true});
Object.defineProperty(__R,"itemRes",{get:function(){return itemRes;},set:function(v){itemRes=v;},configurable:true});
Object.defineProperty(__R,"itemW",{get:function(){return itemW;},set:function(v){itemW=v;},configurable:true});
Object.defineProperty(__R,"manCost",{get:function(){return manCost;},set:function(v){manCost=v;},configurable:true});
Object.defineProperty(__R,"moveCtl",{get:function(){return moveCtl;},set:function(v){moveCtl=v;},configurable:true});
Object.defineProperty(__R,"occOf",{get:function(){return occOf;},set:function(v){occOf=v;},configurable:true});
Object.defineProperty(__R,"openRest",{get:function(){return openRest;},set:function(v){openRest=v;},configurable:true});
Object.defineProperty(__R,"ordL",{get:function(){return ordL;},set:function(v){ordL=v;},configurable:true});
Object.defineProperty(__R,"packH",{get:function(){return packH;},set:function(v){packH=v;},configurable:true});
Object.defineProperty(__R,"renderSpeedDef",{get:function(){return renderSpeedDef;},set:function(v){renderSpeedDef=v;},configurable:true});
Object.defineProperty(__R,"renderSpells",{get:function(){return renderSpells;},set:function(v){renderSpells=v;},configurable:true});
Object.defineProperty(__R,"resBoxes",{get:function(){return resBoxes;},set:function(v){resBoxes=v;},configurable:true});
Object.defineProperty(__R,"resOf",{get:function(){return resOf;},set:function(v){resOf=v;},configurable:true});
Object.defineProperty(__R,"resPips",{get:function(){return resPips;},set:function(v){resPips=v;},configurable:true});
Object.defineProperty(__R,"resTail",{get:function(){return resTail;},set:function(v){resTail=v;},configurable:true});
Object.defineProperty(__R,"saveNotesH",{get:function(){return saveNotesH;},set:function(v){saveNotesH=v;},configurable:true});
Object.defineProperty(__R,"scAdj",{get:function(){return scAdj;},set:function(v){scAdj=v;},configurable:true});
Object.defineProperty(__R,"scOf",{get:function(){return scOf;},set:function(v){scOf=v;},configurable:true});
Object.defineProperty(__R,"spF",{get:function(){return spF;},set:function(v){spF=v;},configurable:true});
Object.defineProperty(__R,"spQ",{get:function(){return spQ;},set:function(v){spQ=v;},configurable:true});
Object.defineProperty(__R,"tyIcon",{get:function(){return tyIcon;},set:function(v){tyIcon=v;},configurable:true});
/* moved here from a later file: used while this file loads (a function declaration used to be hoisted across the closure) */
export function icoText(el){ const t=(el.getAttribute("aria-label")||el.textContent||"").replace(/\s+/g," ").trim(); for(let i=0;i<__R.ICO_TXT.length;i++) if(__R.ICO_TXT[i][0].test(t)) return __R.ICO_TXT[i][1]; return ""; }
export function icoItem(it){ if(!it) return "item-gear"; const n=it.n||"", t=String(it.type||"")+" "+(it.rar||""), b=n.replace(/, \+\d$/,"");
  if(!__R.ICO_CAT&&typeof DMGI!=="undefined"){ __R.ICO_CAT={}; DMGI.forEach((x) =>{ __R.ICO_CAT[x[0]]=x[1]; }); }
  const cat=(__R.ICO_CAT&&(__R.ICO_CAT[n]||__R.ICO_CAT[n.replace(/ \(.*\)$/,"")]))||(/^(Rod|Staff|Wand|Ring|Potion|Scroll|Wondrous Item)\b/.exec(String(it.type||""))||[""])[0];/* R2-2: the item type when the DMG list has no entry *//* v24 M4: the DMG category decides for magic items */
  if(typeof ctOf==="function"&&ctOf(n)) return "item-container"; if(/^(Arrows|Bolts|Sling Bullets|Needles|Firearm Bullets)\b|^(Arrow|Bolt|Needle|Sling Bullet|Firearm Bullet), \+/.test(n)) return "item-ammo";
  if(cat&&!(typeof ctOf==="function"&&ctOf(n))){ if(/^Armor/.test(cat)) return /^Shield\b|\bShield$|, Shield|Shield,/.test(n)?"item-shield":"item-armor"; if(/^Weapon/.test(cat)) return /^(Arrow|Bolt|Needle|Sling Bullet|Firearm Bullet|Ammunition)/.test(n)?"item-ammo":"item-weapon";
    const K={Potion:"item-potion",Ring:"item-ring",Rod:"item-rod",Scroll:"item-scroll",Staff:"item-staff",Wand:"item-wand","Wondrous Item":"item-wondrous"}; for(const k in K) if(cat.indexOf(k)===0) return K[k]; }
  if(/^Shield\b/.test(b)) return "item-shield"; if(/Weapon/.test(t)) return "item-weapon"; if(/Armor/.test(t)) return "item-armor";
  if(/^Potion|^Elixir|^Oil of|^Philter/.test(n)) return "item-potion"; if(/^Ring\b|Ring of/.test(n)) return "item-ring"; if(/^Spell Scroll|Scroll/.test(n)) return "item-scroll";
  if(/^Rod\b|Rod of/.test(n)) return "item-rod"; if(/^Staff\b|Staff of/.test(n)) return "item-staff"; if(/^Wand\b|Wand of/.test(n)) return "item-wand"; if(it.rar||/Wondrous/.test(t)) return "item-wondrous"; return "item-gear"; }
export function icoCls(t){ const m=/\b(Artificer|Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\b/.exec(t||""); return m?"cls-"+m[1].toLowerCase():""; }
export function ico(k,cls,label){ const d=__R.ICO[k]; if(!d) return ""; return '<svg class="ico '+(cls||"")+'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '+(label?'role="img" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>':'aria-hidden="true" focusable="false">')+'<path d="'+d+'"/></svg>'; }
/* ================= v17 ================= */
/* RU40: every Limited Use row of a feature (several rows can belong to one feature, f = feature or item name) */
export function resOf(name){ return (D.res||[]).filter((q) =>{ return q.n===name||q.f===name; }); }
/* v36 p10: usage pips in the card head (the same .bx boxes), the reset line only when the sentence does not already say it */
function resPips(rl){ const p=rl.filter((r) =>{ return !r.pool; }); return p.length?'<span class="hpips">'+p.map((r) =>{ return (p.length>1?'<small class="hpl">'+esc(r.n)+'</small>':'')+'<span class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>'; }).join("")+'</span>':''; }
function resTail(rl,so){ const rest=so&&(so.m||[]).some((x) =>{ return /Rest/.test(x); }); return rl.map((r) =>{ if(so&&!r.pool) return rest?'':'<div class="fres">'+resetTxt(r)+'</div>'; return resBoxes([r]); }).join(""); }
function manCost(rl){ const r=rl.filter((q) =>{ return !q.pool; })[0]; if(!r) return ""; const left=r.max-used(r.k,r.max); return '<div class="sum-m"><span class="supd" data-k="'+r.k+'">'+ico("ui-dice","sum-i")+'<span>1 '+esc(String(r.n).replace(/Dice$/,"Die"))+'. <b>'+left+'</b> left</span></span></div>'; }
function resBoxes(rl){ return rl.map((r) =>{ return '<div class="fuse">'+(rl.length>1||r.n!==r.f?esc(r.n)+': ':'')+(r.pool?'Points:':'Used:')+'</div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="fres">'+resetTxt(r)+'</div>'; }).join(""); }
function itemRes(it){ const rl=resOf(it.n); return rl.length?'<div class="fsub ires">'+resBoxes(rl)+rl.map(__R.chMaxH).join("")+'</div>':''; }
function resetTxt(r){ return {short:"Resets on a Short or Long Rest",short1:"One use back on a Short Rest, all on a Long Rest",long:"Resets on a Long Rest",none:"Does not reset on a rest"}[r.reset]||""; }
/* RU35 no. 4: icon of the kind of attack */
export var AK_ICON={melee:"M14 3h7v7L10 21l-7-7zM6 14l4 4",ranged:"M4 20L20 4M13 4h7v7M5 13c3 0 6 3 6 6",spell:"M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",unarmed:"M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0",feature:"M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"};
export function atkKind(a){ if(/Unarmed/.test(a.n)) return "unarmed"; if(/^Cantrip/.test(a.sub||"")) return "spell"; if(/thrown/i.test(a.n)||/^\d+\/\d+/.test(String(a.range||"").trim())) return "ranged"; return "melee"; }
export function akIcon(k){ return svgI(AK_ICON[k],"aki ak-"+k,{melee:"Melee attack",ranged:"Ranged attack",spell:"Spell attack",unarmed:"Unarmed Strike",feature:"Feature"}[k]); }
export function tyIcon(t){ const h=dtIcon(String(t||"").replace(/ or |, /g,"|")); return h||(t?svgI(AK_ICON.melee,"dti dt-weapon",String(t)):""); }
/* RU35 no. 1: slot boxes in the heading of each spell level (Pact Magic slots where Pact spells are listed) */
function spSlotsH(l,rows){ if(!l) return ""; let o="", r=(D.res||[]).filter((q) =>{return q.k==="s"+l})[0], pr=(D.res||[]).filter((q) =>{return q.k==="pact"})[0];
  if(r) o+='<span class="spsl"><small>SLOTS</small>'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>';
  if(pr&&rows.some((p) =>{return spPact(p[0])})) o+='<span class="spsl"><small>PACT</small>'+boxes(used(pr.k,pr.max),pr.max,pr.k,pr.n)+'</span>';
  return o?'<span class="spslw">'+o+'</span>':""; }
/* RU35 no. 7: Speed and Defenses, always shown */
function renderSpeedDef(){ const e=document.getElementById("speeds"); if(e){ const sp=Object.assign({},C.speeds||{}); if(D.cf&&D.cf.fly&&!sp.fly) sp.fly=D.cf.fly;/* v22 */ let rows='<div class="sense"><span class="bonus">'+D.speed+'</span><span>Walking, ft</span></div>';
    ["fly","swim","climb","burrow"].forEach((k) =>{ const x=sp[k]; if(!x) return; const v=x.v==="walk"?D.speed:(D.cf&&D.cf.speed0.length?0:exSpd(num(x.v,0))); rows+='<div class="sense"><span class="bonus">'+v+'</span><span>'+{fly:"Fly",swim:"Swim",climb:"Climb",burrow:"Burrow"}[k]+', ft<small class="muted"> '+esc(x.s||"")+'</small></span></div>'; });
    if(!["fly","swim","climb","burrow"].some((k) =>{return sp[k]})) rows+='<p class="muted dnone">No other speeds</p>'; e.innerHTML=rows; }
  const f=document.getElementById("defs"); if(f){ const L=(C.defenses||[]).concat(D.cf?D.cf.res:[]),/* v22 */ g=function(t){ return L.filter((d) =>{return d.t===t}); };
    const sec=function(t,lbl,none){ const x=g(t); return '<h3 class="defh">'+lbl+'</h3>'+(x.length?x.map((d) =>{return '<div class="defl"><b>'+esc(d.v)+'</b><small>'+esc(d.s)+'</small></div>'}).join(""):'<p class="muted dnone">'+none+'</p>'); };
    const oth=L.filter((d) =>{return ["Resistance","Immunity","Vulnerability"].indexOf(d.t)<0});
    f.innerHTML=sec("Resistance","Resistances","No Resistances")+sec("Immunity","Immunities","No Immunities")+sec("Vulnerability","Vulnerabilities","No Vulnerabilities")+(oth.length?'<h3 class="defh">Other</h3>'+oth.map((d) =>{return '<div class="defl"><b>'+esc(d.t)+'</b> '+esc(d.v)+'<small>'+esc(d.s)+'</small></div>'}).join(""):""); } }
/* RU35 no. 6: notes under Saving Throws */
function saveNotesH(){ const n=(C.saveNotes||[]), b=(C.saveBonus||[]); if(!n.length&&!b.length) return ""; return '<div class="snotes">'+b.map((x) =>{return '<p><b>'+sg(num(x.v))+'</b> to all saving throws <small>'+esc(x.s)+'</small></p>'}).join("")+n.map((x) =>{return '<p>'+esc(x.t)+' <small>'+esc(x.s)+'</small></p>'}).join("")+'</div>'; }
/* RU35 no. 8: containers. An item with "in" sits inside that container item. A magic container (CONTAINERS[2] set) has a fixed weight, its contents do not count */
function ctOf(n){ const b=String(n||"").replace(/ \(.*\)$/,""); return (typeof CONTAINERS!=="undefined"?CONTAINERS:[]).filter((c) =>{ return c[0]===n||c[0]===b; })[0]||null; }
export function invKey(i){ return i.key||i.n; }
/* v32 RU134: occurrence of an item among the items with the same key (0 = first), for the builder hooks */
export function occOf(it){ let L=C.inv||[], k=it&&invKey(it), n=0; for(let i=0;i<L.length&&L[i]!==it;i++) if(invKey(L[i])===k) n++; return n; }
function packOf(it){ return typeof PACKS==="undefined"||!it?"":PACKS[it.n]?it.n:it.key&&PACKS[it.key]?it.key:""; }
function gearOf(n){ return (typeof GEAR!=="undefined"?GEAR:[]).filter((g) =>{ return g[0]===n; })[0]||null; }
/* a pack row of a hand-filled sheet opens into its container and items, in its place (weight and price from the data) */
function unpackC(it){ const pn=packOf(it), L=C.inv||[], i=L.indexOf(it); if(!pn||i<0) return 0; const P=PACKS[pn], q=Math.max(0,Math.floor(num(it.q,1))), out=[];
  for(let k=0;k<q;k++){ var nm=P[0]+" ("+pn+")", c2=2; while(L.concat(out).some((y) =>{ return invKey(y)===nm; })) nm=P[0]+" ("+pn+" "+(c2++)+")";
    const g0=gearOf(P[0]), ct={n:nm,q:1,w:g0?g0[2]:0}; if(g0) ct.cost=g0[1]; if(it.in) ct.in=it.in; out.push(ct);
    P[1].forEach((x) =>{ const g=gearOf(x[0]), o={n:x[0],q:x[1],w:g?g[2]:0,in:nm}; if(g) o.cost=g[1]; out.push(o); }); }
  L.splice.apply(L,[i,1].concat(out)); C.inv=L; return out.length; }
function packH(it,ix){ const pn=packOf(it); if(!pn) return ""; const P=PACKS[pn], q=num(it.q,1);
  return '<div class="info-h">Unpack</div>'+(q>0?'<p class="info-d">Turns this row into the '+esc(P[0])+' and its '+P[1].length+' kinds of items, each with its own Qty, so you can count torches, rations, and oil as you use them.</p><div class="ipk"><button type="button" class="btn pri press" data-unpack="'+esc(invKey(it))+'" data-iix="'+ix+'">'+ico("item-container")+'Unpack</button></div>':'<p class="muted">Qty is 0, so there is nothing to unpack.</p>'); }
/* a container made from a pack holds what the book puts in it (a Backpack of 30 lb holds the 50 lb of an Explorer's Pack); more than that is over */
function ctCap(c,ct){ const m=/\(([^()]+'s Pack)(?: \d+)?\)$/.exec(c&&c.n||""), P=m&&typeof PACKS!=="undefined"&&PACKS[m[1]]; if(!P||!ct[1]) return ct[1];
  return Math.max(ct[1], P[1].reduce((t,x) =>{ const g=gearOf(x[0]); return t+(g?g[2]:0)*x[1]; },0)); }
/* a container popup lists what is inside; each line opens that item */
function ctH(it,ix){ if(!ctOf(it.n)) return ""; const k=invKey(it), L=(C.inv||[]).map((x,i) =>{ return [x,i]; }).filter((p) =>{ return p[0]!==it&&p[0].in===k; });
  return '<div class="info-h">Inside ('+L.length+')</div>'+(L.length?'<div class="info-l">'+L.map((p) =>{ const q=num(p[0].q,1); return '<button type="button" data-info="it:'+p[1]+'">'+esc(__R.cuNm("i:"+invKey(p[0]),p[0].n))+'<span>Qty '+q+' • '+fmtW(q*__R.cuW(p[0]))+' lb.</span></button>'; }).join("")+'</div>':'<p class="muted">Empty. Open an item and use Move to put it here.</p>'); }
var ctShut={};
export var CONS1=/^(Torch|Candle|Rations \(1 day\)|Oil \(flask\))$/;
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-unpack]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const nm=b.getAttribute("data-unpack"), it=invAt(nm,b.getAttribute("data-iix")); if(!it) return; const occ=occOf(it), pn=packOf(it), lbl=it.n;
  if(num(it.q,1)<1){ toast("Qty is 0, so there is nothing to unpack."); return; }
  const done1=function(n){ if(typeof closeSheet==="function") closeSheet(); __R.renderAll(); if(typeof setTab==="function") setTab("p-inv"); __R.toastU(n?"Unpacked "+lbl+": a "+PACKS[pn][0]+" and "+PACKS[pn][1].length+" kinds of items.":"Nothing to unpack."); };
  if(viaBld(nm)&&window.__bldUnpack){ bldGuard(() =>{ __R.undoMark("Unpack "+lbl); const ok=window.__bldUnpack(nm,C.name,occ,true); done1(ok?1:0); }); return; }
  __R.undoMark("Unpack "+lbl); const n=unpackC(it); try{ if(window.__bldUnpack) window.__bldUnpack(nm,C.name,occ,false); }catch(er){} saveC(); done1(n); },true);
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-use1]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const nm=b.getAttribute("data-potn"), ix=+b.getAttribute("data-use1"), it=invAt(nm,ix); if(!it) return;
  const left=Math.max(0,num(it.q,1)-1), lb=it.n; if(num(it.q,1)<1){ toast("None left."); return; } __R.qtyAdj(nm,ix,-1,"Use "+lb,() =>{ __R.toastU("Used 1 "+lb+". "+left+" left."); }); },true);
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#invBody [data-ctog]"); if(!b) return; const k=b.getAttribute("data-ctog"); ctShut[k]=!ctShut[k]; renderInv();
  const nb=Array.prototype.slice.call(document.querySelectorAll("#invBody [data-ctog]")).filter((x) =>{ return x.getAttribute("data-ctog")===k; })[0]; if(nb) nb.focus({preventScroll:true}); });

function itemW(i){ const c=ctOf(i.n); if(c&&c[2]!=null) return c[2]*num(i.q,1); return num(i.q,1)*__R.cuW(i); }
export function invWeight(){ const L=C.inv||[], byK={}; L.forEach((i) =>{ byK[invKey(i)]=i; }); return L.reduce((t,i) =>{ const p=i.in&&byK[i.in], pc=p&&ctOf(p.n); if(pc&&pc[2]!=null) return t; return t+itemW(i); },0); }
function ctLoad(c){ return (C.inv||[]).filter((i) =>{ return i.in===invKey(c); }).reduce((t,i) =>{ return t+num(i.q,1)*__R.cuW(i); },0); }
function moveCtl(it,ix){ const cs=(C.inv||[]).filter((c) =>{ return c!==it&&ctOf(c.n)&&c.in!==invKey(it); }); if(!cs.length&&!it.in) return "";
  return '<div class="imv"><label class="muted" for="imove">Move to</label><select id="imove" data-imove="'+ix+'"><option value="">Equipment (not in a container)</option>'+cs.map((c) =>{ return '<option value="'+esc(invKey(c))+'"'+(it.in===invKey(c)?' selected':'')+'>'+esc(c.n)+'</option>'; }).join("")+'</select></div>'; }
const XDIM=/^(Bag of Holding|Heward's Handy Haversack|Portable Hole)\b/;
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-imove]")) return; const it=(C.inv||[])[+t.getAttribute("data-imove")]; if(!it) return;
  const dst=t.value?(C.inv||[]).filter((c) =>{ return invKey(c)===t.value; })[0]:null;
  if(dst&&XDIM.test(it.n)&&XDIM.test(dst.n)){ const tv=t.value, lbl=t.options[t.selectedIndex].text; t.value=it.in||""; ask("If "+it.n+" goes inside "+dst.n+", both are torn apart and a rift to the Astral Plane opens. Move it anyway?","Move", () =>{ it.in=tv; bldSync(invKey(it),{in:tv,occ:occOf(it)}); saveC(); __R.renderAll(); refreshEntry(); toast("Moved to "+lbl+"."); }); return; }
  if(t.value) it.in=t.value; else delete it.in; bldSync(invKey(it),{in:t.value||"",occ:occOf(it)}); saveC(); __R.renderAll(); refreshEntry(); toast(t.value?"Moved to "+t.options[t.selectedIndex].text+".":"Moved out of the container.");
  if(t.value){ const ix0=t.getAttribute("data-imove"); setTimeout(() =>{ const b=document.querySelector('.ichk.on[data-iix="'+ix0+'"]'); if(b) b.click(); },0); }/* v32 p24 */ });
/* RU37: coins. S.coins {pp,gp,ep,sp,cp} is game state (kept by Apply). C.gp is the builder's starting gold: a change of C.gp is added to gp (S.coinBase) */
export var COINS=[["pp","Platinum",10,"1 pp = 10 gp"],["gp","Gold",1,""],["ep","Electrum",0.5,"1 gp = 2 ep"],["sp","Silver",0.1,"1 gp = 10 sp"],["cp","Copper",0.01,"1 gp = 100 cp"]];
export function coinsNow(){ const g=num(C.gp,0); if(!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; const c={}; COINS.forEach((k) =>{ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; }
/* v31 RU123: the five coins, each with its icon and amount (copper to platinum), total in GP as a note. One button opens Manage Coin */
function coinStrip(c){ const o=[["cp","Copper"],["sp","Silver"],["ep","Electrum"],["gp","Gold"],["pp","Platinum"]], t=coinTotal(c);
  return '<button type="button" class="igp icoins" data-coinopen="1" aria-description="Manage Coin">'+o.map((k) =>{ return '<span class="icn ic-'+k[0]+'">'+ico("coin-"+k[0],"icn-i")+'<b>'+__R.fmtN(num(c[k[0]],0))+'</b> <small>'+k[0].toUpperCase()+'</small></span>'; }).join("")+'<span class="itot">'+t+' GP in all</span></button>'; }
export function coinTotal(c){ return Math.round(COINS.reduce((t,k) =>{ return t+c[k[0]]*k[2]; },0)*100)/100; }
export function coinSet(c){ S.coins=c; S.coinBase=num(C.gp,0); save(); }
/* T4: convert one coin into another, and pay a price with change. Values in copper: cp 1, sp 10, ep 50, gp 100, pp 1000 */
const CVAL={cp:1,sp:10,ep:50,gp:100,pp:1000}, CORD=["cp","sp","ep","gp","pp"];
export function coinCp(c){ return CORD.reduce((t,k) =>{ return t+num(c[k],0)*CVAL[k]; },0); }
export function coinList(o){ const a=[]; ["pp","gp","ep","sp","cp"].forEach((k) =>{ if(o[k]>0) a.push(__R.fmtN(o[k])+" "+k); }); return a.join(", "); }
/* price in gold (may be a fraction) shown in the largest coin that keeps it whole */
export function priceTxt(gp){ const cp=Math.round(gp*100); if(cp%100===0) return __R.fmtN(cp/100)+" gp"; if(cp%10===0) return __R.fmtN(cp/10)+" sp"; return __R.fmtN(cp)+" cp"; }
/* pay price (in copper) from coins c. Spends the smallest coins first. When a big coin has to be broken, change comes back in gp, sp and cp. Returns null when there is not enough */
export function coinPay(c,price){ price=Math.round(price); if(coinCp(c)<price) return null; let n={}, use={pp:0,gp:0,ep:0,sp:0,cp:0}, chg={pp:0,gp:0,ep:0,sp:0,cp:0}, left=price;
  CORD.forEach((k) =>{ n[k]=num(c[k],0); });
  CORD.forEach((k) =>{ const t=Math.min(n[k],Math.floor(left/CVAL[k])); use[k]+=t; n[k]-=t; left-=t*CVAL[k]; });
  if(left>0){ const b=CORD.filter((k) =>{ return n[k]>0&&CVAL[k]>=left; })[0]; if(!b) return null; n[b]--; use[b]++; let ch=CVAL[b]-left; left=0;
    ["gp","sp","cp"].forEach((k) =>{ const t=Math.floor(ch/CVAL[k]); chg[k]=t; n[k]+=t; ch-=t*CVAL[k]; }); }
  return {c:n,use:use,chg:chg}; }
/* convert amt coins of type from into type to. A remainder that does not fill a whole coin of the new type stays as the old coin */
function coinConv(c,from,to,amt){ amt=Math.floor(amt); if(from===to||amt<1) return {err:"Choose two different coins and an amount."}; if(amt>num(c[from],0)) return {err:"You only have "+__R.fmtN(num(c[from],0))+" "+from+"."};
  const val=amt*CVAL[from], cnt=Math.floor(val/CVAL[to]); if(cnt<1) return {err:amt+" "+from+" is worth less than one "+to+"."}; const rem=val-cnt*CVAL[to], back=Math.round(rem/CVAL[from]), n=Object.assign({},c);
  n[from]=num(c[from],0)-amt+back; n[to]=num(c[to],0)+cnt; return {c:n,got:cnt,used:amt-back}; }
let coinOpen=false;
function coinHTML(){ const c=coinsNow(), ls=S.lifestyle||"", L=(typeof LIFESTYLE!=="undefined"?LIFESTYLE:[]), lo=L.filter((x) =>{return x[0]===ls})[0];
  return '<div id="coinDlg"><button type="button" class="ctot" data-coin="tog" aria-expanded="'+coinOpen+'"><b>Total (in gp)</b><span>'+coinTotal(c)+'</span>'+CHEV+'</button>'+(coinOpen?'<p class="muted">Every coin converted to gold. Electrum, silver, and copper count as fractions of a gold piece.</p>':'')+
   '<div class="crows">'+COINS.map((k) =>{ return '<div class="crow"><span class="cico c-'+k[0]+'"></span><span class="cnm"><b>'+k[1]+' ('+k[0]+')</b><small>'+k[3]+'</small></span><span class="cv" id="cv-'+k[0]+'">'+c[k[0]]+'</span></div>'; }).join("")+'</div>'+
   '<div class="info-h">Adjust Coin</div><div class="cadj">'+COINS.map((k) =>{ return '<label><span>'+k[0].toUpperCase()+'</span><input type="number" min="0" inputmode="numeric" data-camt="'+k[0]+'" placeholder="0"></label>'; }).join("")+'</div>'+
   '<div class="info-h">Convert Coin</div><div class="cconv"><label><span>From</span><select data-cvf aria-label="Convert from">'+CORD.slice().reverse().map((k) =>{ return '<option value="'+k+'"'+(k==="gp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>To</span><select data-cvt aria-label="Convert to">'+CORD.slice().reverse().map((k) =>{ return '<option value="'+k+'"'+(k==="sp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>Amount</span><input type="number" min="1" inputmode="numeric" data-cvamt placeholder="0" aria-label="Amount to convert"></label><button type="button" class="btn press" data-coin="conv">Convert</button></div><p class="muted" id="cvPrev" aria-live="polite"></p>'+
   '<div class="cbtns"><button type="button" class="btn press" data-coin="add">+ Add</button><button type="button" class="btn press" data-coin="rem">\u2212 Remove</button><button type="button" class="btn press" data-coin="clr">\u00d7 Clear</button></div>'+
   '<div class="info-h">Lifestyle Expenses</div><select data-life="1" aria-label="Lifestyle"><option value="">Choose a lifestyle</option>'+L.map((x) =>{ return '<option value="'+x[0]+'"'+(x[0]===ls?' selected':'')+'>'+x[0]+' ('+x[1]+(x[1]==="Free"?'':' per day')+')</option>'; }).join("")+'</select>'+(lo?'<p class="info-d">'+esc(lo[2])+'</p>':'<p class="muted">Pick the lifestyle you pay for each week or month. It covers lodging, food, and upkeep.</p>')+'</div>'; }
function openCoins(){ __set_navStack([]); openSheet("Manage Coin", coinHTML(), "coin"); }
export function coinRefresh(){ const b=$("#sheetBody"); if(b&&sheetMode==="coin") b.innerHTML=coinHTML(); renderInv(); }
document.addEventListener("input",(e) =>{ const t=e.target; if(!t||!t.matches||!t.matches("[data-cvamt],[data-cvf],[data-cvt]")) return; const p=$("#cvPrev"); if(!p) return; const f=$("#coinDlg [data-cvf]").value, to=$("#coinDlg [data-cvt]").value, am=num($("#coinDlg [data-cvamt]").value,0), r=am>0?coinConv(coinsNow(),f,to,am):null;
  p.textContent=!r?"":r.err?r.err:__R.fmtN(r.used)+" "+f+" becomes "+__R.fmtN(r.got)+" "+to+"."+(r.used<Math.floor(am)?" The other "+__R.fmtN(Math.floor(am)-r.used)+" "+f+" stay as they are.":""); });
document.addEventListener("click",(e) =>{ const b=e.target.closest("[data-coin],[data-coinopen]"); if(!b) return;
  if(b.hasAttribute("data-coinopen")){ openCoins(); return; }
  const a=b.getAttribute("data-coin"); if(a==="tog"){ coinOpen=!coinOpen; coinRefresh(); return; }
  if(a==="conv"){ const c0=coinsNow(), cf=$("#coinDlg [data-cvf]").value, ct=$("#coinDlg [data-cvt]").value, r0=coinConv(c0,cf,ct,num($("#coinDlg [data-cvamt]").value,0)); if(r0.err){ toast(r0.err); return; }
    __R.undoMark("Convert coins"); coinSet(r0.c); coinRefresh(); __R.toastU("Converted "+__R.fmtN(r0.used)+" "+cf+" into "+__R.fmtN(r0.got)+" "+ct+"."); return; }
  let c=coinsNow(), amt={}, any=false; $$("#coinDlg [data-camt]").forEach((i) =>{ const v=Math.floor(num(i.value,0)); amt[i.getAttribute("data-camt")]=v>0?v:0; if(v>0) any=true; });
  if(a==="clr"){ $$("#coinDlg [data-camt]").forEach((i) =>{ i.value=""; }); return; }
  if(!any){ toast("Type an amount first."); return; }
  if(a==="rem"){ const short=COINS.filter((k) =>{ return amt[k[0]]>c[k[0]]; }); if(short.length){ toast("Not enough "+short.map((k) =>{return k[1].toLowerCase()}).join(" and ")+". Nothing was removed."); return; } }
  __R.undoMark(a==="add"?"Add coins":"Remove coins"); COINS.forEach((k) =>{ c[k[0]]+= (a==="add"?1:-1)*amt[k[0]]; }); coinSet(c); coinRefresh(); __R.toastU(a==="add"?"Coins added.":"Coins removed."); });
document.addEventListener("change",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-life]")){ S.lifestyle=t.value; save(); coinRefresh(); } });
/* RU41: rest dialogs like D&D Beyond. Hit Dice: a box per die left. Each picked box asks for the number rolled (no dice rolling in the app) */
let restSel={}, restAuto=true;
function hdRows(){ return (D.res||[]).filter((r) =>{ return r.k==="hd"||/^hd-d/.test(r.k); }); }
function shortList(){ return (D.res||[]).filter((r) =>{ return r.reset==="short"||r.reset==="short1"; }); }
function restHTML(kind){ let hp1=S.hp!=null&&S.hp<1, h='<div id="restDlg" data-kind="'+kind+'">';
  if(kind==="menu") return h+restCards()+'</div>';/* v32 p25 C15 */
  if(kind==="short"){ let cm=D.mod.CON, tot=0; h+=restHint();/* v32 p25 */
    h+=x14()?'<p class="info-d">A Short Rest lasts at least 1 hour. You do nothing more strenuous than eating, drinking, reading, or tending wounds. At the end you can spend any number of your Hit Dice to heal, one at a time, and some features recharge.</p>':'<p class="info-d">A Short Rest is 1 hour of downtime with nothing more tiring than talking, eating, reading, or keeping watch. It ends early, with no benefit, if you roll Initiative, cast any spell except a cantrip, or take damage. You can spend Hit Point Dice to heal, one at a time, and some features recharge.</p>';
    const rl=shortList(); h+='<div class="info-h">Recover</div>'+(rl.length?recUL(rl.map((r) =>{ const u=used(r.k,r.max); return [r.n+(r.reset==="short1"?" (one use)":"")+(u?"":" (already full)"),!u]; })):'<p class="info-d">No features recharge on a Short Rest.</p>');
    h+='<label class="ck"><input type="checkbox" data-rauto="1"'+(restAuto?' checked':'')+'> Automatically apply healing</label>';
    hdRows().forEach((r) =>{ const die=num(r.die,num(C.hitDie,10)), left=r.max-used(r.k,r.max), sel=restSel[r.k]||[];
      h+='<div class="hdrow"><b>'+(hdRows().length<2?esc((C.cls||"").toUpperCase())+' ':'D'+die+' ')+'HIT DICE</b>'+(hdRows().length>1&&hdCls(die)?' <span class="muted">('+esc(hdCls(die))+')</span>':'')+' <span class="muted">(Hit Die: 1d'+die+sg(cm)+' \u2022 Total: '+r.max+', left: '+left+')</span><div class="boxes">';
      for(let i=0;i<left;i++){ const on=sel[i]!=null; h+='<button type="button" class="bx" aria-pressed="'+on+'" data-hdk="'+r.k+'" data-hdi="'+i+'" aria-label="Spend Hit Die '+(i+1)+'"></button>'; }
      h+='</div>'+(left?'':'<p class="muted">No Hit Dice left. A Long Rest restores '+(x14()?'half of them, at least one':'them')+'.</p>');
      sel.forEach((v,i) =>{ if(v==null) return; const heal=v?__R.hdHeal(v):0; tot+=heal; h+='<label class="hdv">Die '+(i+1)+' (1 to '+die+')<input type="number" min="1" max="'+die+'" data-hdv="'+r.k+'" data-hdi="'+i+'" value="'+(v||"")+'" placeholder="roll">'+(window.__miRoll&&window.__miRoll.roll?'<button type="button" class="btn press hd-roll" data-hdroll="'+r.k+'" data-hdi="'+i+'" data-die="'+die+'">Roll</button>':'')+'<span class="hdh">'+(v?'+'+heal+' '+hpW(heal):'type the number rolled')+'</span></label>'; });
      h+='</div>'; });
    h+=__R.shortExtraH();/* v21 */
    h+='<p class="info-d"><b id="restTot">Healing: '+tot+' '+hpW(tot)+'</b> (each die: the number rolled plus your Constitution modifier, at least 1'+(__R.periOn()?', then doubled':'')+')</p>';
    if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Short Rest.</p>';
    return h+slideC("short","Slide to take Short Rest",hp1)+'</div>'; }
  const rec=longRec();/* v32 p25: the same list as the Long Rest card */
  h+=(x14()?'<p class="info-d">A Long Rest lasts at least 8 hours. You sleep and do light activity, with no more than 2 hours awake. One hour of fighting, casting spells, or walking breaks the rest, and you must start it again to gain anything. You can gain the benefit of only one Long Rest in 24 hours, and you need at least 1 Hit Point when you start. You regain all Hit Points and up to half of your total Hit Dice, at least one. If you had food and drink, you also lose 1 level of Exhaustion.</p>':'<p class="info-d">A Long Rest takes at least 8 hours: at least 6 asleep and no more than 2 of light activity. It ends early if you roll Initiative, cast any spell except a cantrip, take damage, or spend 1 hour walking or exerting yourself. If you had rested for at least 1 hour, an early end still counts as a Short Rest. You can resume right away by adding 1 hour to the rest. After a Long Rest, wait 16 hours before starting another.</p>')+'<div class="info-h">Recover</div>'+(rec.length?recUL(rec):'<p class="info-d">Everything is already full.</p>');
  h+=__R.longExtraH();/* v21 */
  if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Long Rest.</p>';
  return h+slideC("long","Slide to take Long Rest",hp1)+'</div>'; }
/* v55: slide-to-confirm control for the rests (the handler sits next to the PDF button code) */
function slideC(kind,txt,off){ return '<div class="slidec'+(off?' off':'')+'" data-slide-go="'+kind+'" data-label="'+txt+'"><div class="slidec-fill"></div><div class="slidec-label">'+txt+'</div><button type="button" class="slidec-h" aria-label="'+txt+'. Press Enter to confirm"'+(off?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>'; }
/* ===== v32 p25 (C15, RU132): rest cards, hint, and the summary after a rest ===== */
function longRec(){ let sl=(D.res||[]).filter((r) =>{return /^s\d$/.test(r.k)||r.k==="pact"}).reduce((t,r) =>{return t+used(r.k,r.max)},0), hdu=hdRows().reduce((t,r) =>{return t+used(r.k,r.max)},0),
      oth=(D.res||[]).filter((r) =>{ return r.reset!=="none"&&!/^s\d$|^pact$|^hd/.test(r.k)&&used(r.k,r.max)>0; }).map((r) =>{return r.n});
  let hpTo=D.hpmax; if(__R.restX.hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0)) hpTo=Math.max(1,(B.hp&&B.hp.parts||[]).filter((p) =>{ return p.l!=="Max HP modifier"&&p.l!=="Set by you"; }).reduce((t,p) =>{ return t+num(p.v,0); },0));/* v21 i2 */
  let rec=[]; if(S.hp==null||S.hp<hpTo) rec.push("Hit Points to "+hpTo); if(x14()) hdu=hdPlan()._n; if(hdu) rec.push(hdu+" Hit "+(hdu>1?"Dice":"Die")); if(sl) rec.push(sl+" Spell Slot"+(sl>1?"s":"")); rec=rec.concat(oth); if(__R.hasFeat("Resourceful")&&!S.insp) rec.push("Heroic Inspiration (Resourceful)"); if(S.exh>0) rec.push("Exhaustion level reduced by 1"); if(S.ds&&(S.ds[0]||S.ds[1])) rec.push("Death Saving Throws reset"); if(S.tmp) rec.push("Temporary Hit Points end");
  return rec; }
function hdLeft(){ return hdRows().reduce((t,r) =>{ return t+Math.max(0,r.max-used(r.k,r.max)); },0); }
function shortRec(){ const o=[], miss=Math.max(0,D.hpmax-num(S.hp==null?D.hpmax:S.hp,0)), hl=hdLeft();
  if(miss&&hl) o.push("Spend up to "+hl+" Hit "+(hl>1?"Dice":"Die")+" to heal ("+miss+" "+hpW(miss)+" missing)"); else if(!hl) o.push(["No Hit Dice left to spend",1]); else o.push(["Hit Points are full",1]);
  shortList().forEach((r) =>{ if(used(r.k,r.max)) o.push(r.n+(r.reset==="short1"?" (one use)":"")); });
  if(o.length===1&&typeof o[0]!=="string"&&!shortList().some((r) =>{ return used(r.k,r.max); })) o.push(["No uses to get back",1]);
  return o; }
function recUL(L){ return '<div class="rlist" role="list">'+L.map((x) =>{ const off=Array.isArray(x)&&x[1], t=Array.isArray(x)?x[0]:x; return '<span class="rli'+(off?' off':'')+'" role="listitem">'+ico(off?"ui-minus":"ui-check","rli-i")+'<span>'+esc(t)+'</span></span>'; }).join("")+'</div>'; }
function restCards(){ const z=S.hp!=null&&S.hp<1, card=function(k,t,d,L){ return '<button type="button" class="restm rcard press" data-rest="'+k+'"><span class="rc-h"><span class="rc-i">'+ico(k==="short"?"rest-short":"rest-long")+'</span><span class="rc-t"><b>'+t+'</b><small>'+d+'</small></span>'+ico("ui-chev-r","rc-go")+'</span>'+recUL(L)+'</button>'; };
  return (z?'<p class="caution">You need at least 1 Hit Point to rest. Heal first, or make Death Saving Throws.</p>':'')+'<div class="rcards">'+card("short","Short Rest","1 hour",shortRec())+card("long","Long Rest","8 hours",longRec().length?longRec():[["Everything is already full",1]])+'</div>'; }
function restHint(){ const hp=num(S.hp==null?D.hpmax:S.hp,0), miss=Math.max(0,D.hpmax-hp), hl=hdLeft(); if(hp<1) return "";
  const t=miss&&hl?"You are missing "+miss+" "+hpW(miss)+". You have "+hl+" Hit "+(hl>1?"Dice":"Die")+" left: tap a box below to spend one, then type the number rolled.":miss?"You are missing "+miss+" "+hpW(miss)+", but no Hit Dice are left. A Long Rest restores "+(x14()?"half of them, at least one":"them")+".":"Your Hit Points are full, so you do not need to spend Hit Dice.";
  return '<p class="rhint">'+ico("ui-info","rh-i")+'<span>'+esc(t)+'</span></p>'; }
let RS0=null, REST_SUM=null;
function restSnap(){ return {hp:S.hp==null?D.hpmax:S.hp, tmp:num(S.tmp,0), used:JSON.parse(JSON.stringify(S.used||{})), exh:num(S.exh,0), insp:!!S.insp, ds:(S.ds||[0,0]).slice(), mode:Object.keys(S.mode||{})}; }
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
export function openRest(kind){ restSel={}; __R.restX={}; __set_navStack([]); openSheet(kind==="menu"?"Rest":kind==="short"?"Short Rest":"Long Rest", restHTML(kind), "rest"); }
export function restRefresh(kind){ const b=$("#sheetBody"); if(b&&sheetMode==="rest") b.innerHTML=restHTML(kind); }
document.addEventListener("click",(e) =>{ const t=e.target, dlg=t.closest&&t.closest("#restDlg"); if(!dlg) return; const kind=dlg.getAttribute("data-kind");
  const bx=t.closest("[data-hdk]"); if(bx){ e.stopPropagation(); const k=bx.getAttribute("data-hdk"), i=+bx.getAttribute("data-hdi"), s=restSel[k]||(restSel[k]=[]); if(s[i]!=null) s[i]=null; else s[i]=0; restRefresh(kind); return; }
  const go=t.closest("[data-rest-go]"); if(go){ e.stopPropagation(); takeRest(go.getAttribute("data-rest-go")); return; } },true);
document.addEventListener("change",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-rauto]")){ restAuto=t.checked; return; } });
/* V17-3: a typed die value updates its line and the total in place. The dialog is not rebuilt, so focus and the next click stay */
document.addEventListener("input",(e) =>{ const t=e.target; if(!t.matches||!t.matches("#restDlg [data-hdv]")) return; let k=t.getAttribute("data-hdv"), i=+t.getAttribute("data-hdi"), r=hdRows().filter((q) =>{return q.k===k})[0], die=r?num(r.die,num(C.hitDie,10)):12, v=Math.floor(num(t.value,0)), cm=D.mod.CON;
  v=v>=1?Math.min(die,v):0; (restSel[k]||(restSel[k]=[]))[i]=v; const sp=t.parentNode.querySelector(".hdh"); if(sp) sp.textContent=v?"+"+__R.hdHeal(v)+" "+hpW(__R.hdHeal(v)):"type the number rolled";
  let tot=0; Object.keys(restSel).forEach((q) =>{ (restSel[q]||[]).forEach((x) =>{ if(x) tot+=__R.hdHeal(x); }); }); const te=document.getElementById("restTot"); if(te) te.textContent="Healing: "+tot+" "+hpW(tot); });
function hpW(n){ return n===1?"Hit Point":"Hit Points"; }
function hdCls(die){ return (String(C.clsLabel||"").match(/[A-Z][A-Za-z']+ \d+/g)||[]).filter((x) =>{ const c=(typeof CLASSES!=="undefined")&&CLASSES[x.replace(/ \d+$/,"")]; return c&&num(c.hd,0)===die; }).join(", "); }
export function takeRest(kind){ if(S.hp!=null&&S.hp<1){ toast("You need at least 1 Hit Point to rest."); return; }
  if(kind==="short"){ let cm=D.mod.CON, heal=0, spent=0, miss=0; Object.keys(restSel).forEach((k) =>{ (restSel[k]||[]).forEach((v) =>{ if(v===0) miss++; }); });
    if(miss){ toast("Type the number rolled for each Hit Die you picked, or untick it."); return; }/* V17-2: nothing changes before this check */
    const picked=Object.keys(restSel).some((k) =>{ return (restSel[k]||[]).some((v) =>{ return v; }); }), chefV=__R.restX.chef&&picked?Math.floor(num(__R.restX.chefV,0)):0;
    if(__R.restX.chef&&picked&&(chefV<1||chefV>8)){ toast("Type the 1d8 roll for Replenishing Meal, 1 to 8, or untick it."); return; }
    const rl=__R.recList(), bad=rl.filter((q,i) =>{ return __R.recSum(i)>q.cap; })[0]; if(bad){ toast(bad.n+": choose slots with a combined level of "+bad.cap+" or less."); return; }
    const both={}; rl.forEach((q,i) =>{ const m=__R.restX.rec&&__R.restX.rec[i]||{}; Object.keys(m).forEach((L) =>{ both[L]=(both[L]||0)+num(m[L],0); }); }); const over=Object.keys(both).filter((L) =>{ return both[L]>__R.slotUsed(+L); })[0]; if(over){ toast("You chose more level "+over+" slots than you have spent."); return; }
    __R.undoMark("Short Rest");/* v21 RU57 */ RS0=restSnap();/* v32 p25 */
    Object.keys(restSel).forEach((k) =>{ (restSel[k]||[]).forEach((v) =>{ if(!v) return; spent++; heal+=__R.hdHeal(v); S.used[k]=num(S.used[k],0)+1; }); });
    if(chefV) heal+=chefV;
    const before=S.hp==null?D.hpmax:S.hp; if(restAuto&&heal) S.hp=Math.min(D.hpmax,before+heal);
    doRest("short",true); const rec=[]; rl.forEach((q,i) =>{ const s=__R.recSum(i); if(!s) return; const m=__R.restX.rec[i]; Object.keys(m).forEach((L) =>{ S.used["s"+L]=Math.max(0,num(S.used["s"+L],0)-num(m[L],0)); }); S.used[q.r.k]=num(S.used[q.r.k],0)+1; rec.push(q.n+": "+s+" slot level"+(s>1?"s":"")+" recovered."); });
    const nc=__R.chgApply(__R.shortChg()); save(); syncLU(); closeSheet();
    __R.toastU("Short Rest taken."+(spent?" "+spent+" Hit "+(spent>1?"Dice":"Die")+" spent"+(restAuto?", "+(S.hp-before)+" "+hpW(S.hp-before)+" regained.":", "+heal+" "+hpW(heal)+" rolled (apply them yourself)."):" No Hit Dice spent.")+(rec.length?" "+rec.join(" "):"")+(nc?" Charges updated.":"")+(function(){ const n=restNames(restDiff(RS0)); return n?" Restored: "+n+".":""; })()); restSumToast("short"); return; }
  __R.undoMark("Long Rest");/* v21 RU57 */ RS0=restSnap();/* v32 p25 */ const lc=__R.chgRows(["dawn","dusk","long"]), hr=__R.restX.hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0);
  if(hr){ delete S.hpMod; delete S.hpOver; derive(); }
  doRest("long",true); const nc2=__R.chgApply(lc); if(nc2){ save(); syncLU(); } closeSheet(); const LD=restDiff(RS0), ln=restNames(LD), hpx=LD.filter((x) =>{ return x[0]==="Hit Points"; })[0];
  __R.toastU("Long Rest taken."+(LD.length?" Restored: "+[hpx?"Hit Points ("+hpx[1]+")":""].concat(ln?[ln]:[]).filter(Boolean).join(", ")+".":" Everything was already full.")+(hr?" Maximum HP changes reset.":"")+(nc2?" Charges updated.":"")); restSumToast("long"); }
window.__openRest=openRest; window.__coinsNow=coinsNow;
/* v33 p03 (RU123 builder): the five coins the sheet shows after Apply when the starting gold is g (same data and rule as coinsNow) */
window.__coinsFor=function(g,mine){ g=num(g,0); if(!mine||!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; const c={}; COINS.forEach((k) =>{ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; };
window.__coinTotal=coinTotal; window.__ico=ico; window.__icoCls=icoCls; window.__icoItem=icoItem; window.__icoText=icoText;
export function ordL(n){return n===0?"Cantrip":n+(n===1?"st":n===2?"nd":n===3?"rd":"th")+" Level"}
var spQ="",spF="all";
/* Spells tab header: Modifier, Spell Attack, Save DC, then slots. Numbers come from C.spellcasting (builder).
   M9: C.spellcasting.by (2+ abilities, multiclass or species): one header per source, and each spell uses the numbers of its ability (C.spells[].ab) */
/* v19 RL44: spell attack shown with Exhaustion */
export function scAdj(sc){ if(!sc) return sc; const ex=D&&D.exhN?2*D.exhN:0, o={}; for(const k in sc) o[k]=sc[k]; if(ex) o.atk=num(sc.atk,0)-ex;
  const many=Array.isArray(sc.by)&&sc.by.length>1; if(Array.isArray(sc.by)) o.by=sc.by.map((b) =>{ const c={}; for(const j in b) c[j]=b[j]; if(ex) c.atk=num(b.atk,0)-ex; return many?scCu(c,"-"+b.ab,ex):scCu(c,"",ex,1); });
  return scCu(o,"",ex); }
/* v34 RU85: Spell Attack and Save DC set by you (S.cust "n:spatk", "n:spdc", one pair per ability when 2+ sources), with a breakdown */
function scCu(o,sf,ex,quiet){ const ak="n:spatk"+sf, dk="n:spdc"+sf, a=__R.cuK(ak), d=__R.cuK(dk), av=a?__R.cuNum(a.o):null, dv=d?__R.cuNum(d.o):null, m=num(o.mod,0), pb=D&&D.pb||2, oth=num(o.atk,0)+ex-m-pb, odc=num(o.dc,0)-8-m-pb, src=sf&&o.n?" ("+o.n+")":"";
  const pa=[part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")], pd=[{l:"Base",v:8,note:"",raw:true},part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")];
  if(oth) pa.push(part("Other bonuses",oth,"Items or features")); if(ex) pa.push(part("Exhaustion level "+(ex/2),-ex,"Every D20 Test is 2 lower for each Exhaustion level")); if(odc) pd.push(part("Other bonuses",odc,"Items or features"));
  if(av!=null){ __R.CU0[ak+"|o"]=o.atk; pa.push({l:"Set by you",v:sg(av),note:"Calculated value: "+sg(o.atk)+". Your number replaces it.",raw:true}); o.atk=av; }
  if(dv!=null){ __R.CU0[dk+"|o"]=o.dc; pd.push({l:"Set by you",v:String(dv),note:"Calculated value: "+o.dc+". Your number replaces it.",raw:true}); o.dc=dv; }
  if(B&&!quiet){ B["spatk"+sf]={t:"Spell Attack"+src,parts:pa,total:sg(o.atk),f:""}; B["spdc"+sf]={t:"Spell Save DC"+src,parts:pd,total:String(o.dc),f:"A creature makes its saving throw against this number when your spell asks for one."}; }
  return o; }
/* v26 RU38 no. 2: a spell with its own save DC or spell attack (Customize) */
export function scOf(x){ let r=scOf0(x), c=x&&__R.cuK("s:"+x.n); if(c&&(__R.cuNum(c.dc)!=null||__R.cuNum(c.atk)!=null)){ r=Object.assign({},r); if(__R.cuNum(c.dc)!=null) r.dc=__R.cuNum(c.dc); if(__R.cuNum(c.atk)!=null) r.atk=__R.cuNum(c.atk); } return r; }
function scOf0(x){ let sc=scAdj(C.spellcasting||{}); if(x&&x.itc&&(x.itc.dc!=null||x.itc.atk!=null)){ sc=Object.assign({},sc); if(x.itc.dc!=null) sc.dc=x.itc.dc; if(x.itc.atk!=null) sc.atk=x.itc.atk; return sc; } if(x&&x.ab&&Array.isArray(sc.by)){ const b=sc.by.filter((q) =>{return q.ab===x.ab})[0]; if(b) return b; } return sc; }
function spHeadBy(sc){ return sc.by.map((b) =>{ const sf="-"+b.ab; return '<p class="sp-src">'+esc(b.n)+'</p><div class="sp-head"><div><b>'+sg(b.mod)+'</b><span>Modifier ('+b.ab+')</span></div><div class="bd" data-bd="spatk'+sf+'" role="button" tabindex="0"><b>'+sg(b.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc'+sf+'" role="button" tabindex="0"><b>'+b.dc+'</b><span>Save DC</span></div></div>'; }).join(""); }
function spHead(sc){sc=scAdj(sc);let h=Array.isArray(sc.by)&&sc.by.length>1?spHeadBy(sc):'<div class="sp-head"><div><b>'+sg(sc.mod)+'</b><span>Modifier ('+sc.ab+')</span></div><div class="bd" data-bd="spatk" role="button" tabindex="0"><b>'+sg(sc.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc" role="button" tabindex="0"><b>'+sc.dc+'</b><span>Save DC</span></div></div>';
 const sl=[];(sc.slots||[]).forEach((n,i) =>{sl.push(ordL(i+1).replace(" Level","")+" \u00d7"+n)});if(sc.pact)sl.push("Pact \u00d7"+sc.pact.n+" (level "+sc.pact.lvl+")");if(sl.length)h+='<p class="sp-slots">Slots: '+sl.join(", ")+'. Tick the boxes at each spell level, or in Limited Use on the Actions tab.</p>';
 return h}
export function renderSpells(){const el=document.getElementById("spBody");if(!el)return;const L=C.spells||[],sc=C.spellcasting;
 /* RU20: a caster with no spells chosen still sees Modifier, Spell Attack, Save DC and slots (C.spellcasting), then the note */
 const MB='<div class="spm-bar">'+(L.length?'<button type="button" class="btn press spm-open" data-spcards="1">Print Cards</button>':'')+'<button type="button" class="btn press spm-open" data-spman="1">'+ico("spellbook","ibt")+'Manage Spells</button></div>';/* v27 RU68 *//* v25 RU38 no. 3 */
 if(!L.length){el.innerHTML=(sc?spHead(sc):'')+'<div class="empty-note empty-st">'+esArt("book")+'<b>No spells yet</b><span>'+(sc?'Add the cantrips and spells your class can cast. They show here with their slots.':'Spells from your class, species, feats, or magic items show up here.')+'</span><button type="button" class="btn pri press spm-open" data-spman="1">'+ico("tab-spells","ibt")+'Manage Spells</button></div>';return}/* v31 C5 */
 let h=(sc?spHead(sc):'')+MB;
 h+='<input class="sp-q" id="spQ" type="search" placeholder="Search Spell Names, Casting Times, Damage Types" value="'+esc(spQ)+'">';
 const lvs=[],UP=__R.spUpOn(),UPX=__R.spUpMax();L.forEach((x) =>{const g=spGrpLv(x);if(lvs.indexOf(g)<0)lvs.push(g);if(UP&&__R.spUpOk(x))for(let u=g+1;u<=UPX;u++)if(lvs.indexOf(u)<0)lvs.push(u)});lvs.sort((a,b) =>{return a-b});/* v25 RU38 no. 6 */
 h+='<div class="ifil">'+[["all","All"]].concat(lvs.map((l) =>{return [String(l),l?ordL(l).replace(" Level","").toUpperCase():"-0-"]})).concat([["conc","Conc."],["rit","Ritual"]]).map((f) =>{return '<button type="button" class="ifb'+(spF===f[0]?' on':'')+'" data-spf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
 const q=spQ.toLowerCase(),lv=lvs.slice();
 lv.forEach((l) =>{const rows=L.map((x,i) =>{return [x,i]}).filter((p) =>{const x=p[0];return (spGrpLv(x)===l||(UP&&__R.spUpOk(x)&&l>spGrpLv(x)&&l<=UPX))&&(spF==="all"||spF===String(l)||(spF==="conc"&&x.conc)||(spF==="rit"&&x.rit))&&(!q||(x.n+" "+x.ct+" "+x.sum+" "+x.src).toLowerCase().indexOf(q)>=0)&&!(x.use==="Prepared"&&L.some((y) =>{return y!==x&&y.n===x.n&&y.use==="Always prepared"}))/* v22 T1: sheets saved before v22 */}).sort((a,b) =>{return a[0].n<b[0].n?-1:a[0].n>b[0].n?1:a[1]-b[1]});if(!rows.length)return;
  h+='<h3 class="sp-lv"><span>'+ordL(l)+'</span>'+spSlotsH(l,rows)+'</h3><div class="sp-tbl"><div class="sp-r sp-th"><span></span><span>Name</span><span>Time</span><span>Range</span><span>Hit / DC</span><span>Effect</span></div>'+rows.map((p) =>{const x=p[0],xs=scOf(x),hd=x.sv==="ATK"?sg(xs.atk):x.sv?x.sv+" "+xs.dc:"\u2014";
   const badge=/At will|Cantrip/i.test(x.use)||!x.l?'<span class="sp-b" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">AT<br>WILL</span>':/1\/Long/.test(x.use)?'<span class="sp-b use" data-qcast="'+p[1]+'" title="Use '+esc(x.n)+'" aria-hidden="true">USE</span>':'<span class="sp-b cast" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">CAST</span>';
   return '<button type="button" class="sp-r" data-info="sp:'+p[1]+'"'+(x.sch?' data-sch="'+esc(x.sch)+'"':'')+'>'+badge+'<span class="sp-n"><b>'+(window.__artIc?window.__artIc("spell",x.n):"")+esc(__R.cuNm("s:"+x.n,x.n))+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</b><small><span class="sp-u">'+esc(x.use)+' \u2022 </span><span class="sp-s">'+esc(x.src||"")+'</span>'+(l>spGrpLv(x)?'<span class="sp-w"> \u2022 with a '+ordL(l).replace(" Level","")+' slot</span>':'')+'</small></span><span class="sp-t">'+esc(x.ct.replace("Bonus Action","1BA").replace("Reaction","1R").replace("Action","1A"))+'</span><span class="sp-g">'+spRangeH(x.r,x)+'</span><span class="sp-hd'+(hd==="\u2014"?" sp-no":"")+'">'/* v36 p13 */+esc(hd)+'</span><span>'+spEffH(x,l>spGrpLv(x)?l:spRowLv(x))+'</span></button><button type="button" class="spk" data-qcast="'+p[1]+'">'+(/1\/Long/.test(x.use)?"Use ":"Cast ")+esc(x.n)+'</button>'}).join("")+'</div>'});/* v21 m4 */
 el.innerHTML=h}


export function __set_renderSpells(v){ return renderSpells=v; }
