import {bindLive,chMaxH,lateGet,lateSet} from "./00a-reg-late-ports.js";import {exSpd} from "./03-data-glossary.js";
import {C} from "./04-logic-storage.js";
import {esc,num,sg} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {boxes,used} from "./08-ui-render-sheet-and-actions.js";
import {html,render} from "./lib/html.js";
import {dtIcon,spPact,svgI} from "./22-ui-spell-data-and-slots.js";

bindLive("akIcon",{get:function(){return akIcon;}});
bindLive("atkKind",{get:function(){return atkKind;}});
bindLive("ctOf",{get:function(){return ctOf;}});
bindLive("ico",{get:function(){return ico;}});
bindLive("icoCls",{get:function(){return icoCls;}});
bindLive("itemRes",{get:function(){return itemRes;}});
bindLive("manCost",{get:function(){return manCost;}});
bindLive("renderSpeedDef",{get:function(){return renderSpeedDef;}});
bindLive("resBoxes",{get:function(){return resBoxes;}});
bindLive("resOf",{get:function(){return resOf;}});
bindLive("resPips",{get:function(){return resPips;}});
bindLive("resTail",{get:function(){return resTail;}});
bindLive("saveNotesH",{get:function(){return saveNotesH;}});
bindLive("tyIcon",{get:function(){return tyIcon;}});
/* moved here from a later file: used while this file loads (a function declaration used to be hoisted across the closure) */
export function icoText(el){ const t=(el.getAttribute("aria-label")||el.textContent||"").replace(/\s+/g," ").trim(); for(let i=0;i<lateGet("ICO_TXT").length;i++) if(lateGet("ICO_TXT")[i][0].test(t)) return lateGet("ICO_TXT")[i][1]; return ""; }
export function icoItem(it){ if(!it) return "item-gear";
 const {n, t, b, cat}=icoItem2Step1(it);
  if(typeof ctOf==="function"&&ctOf(n)) return "item-container"; if(/^(Arrows|Bolts|Sling Bullets|Needles|Firearm Bullets)\b|^(Arrow|Bolt|Needle|Sling Bullet|Firearm Bullet), \+/.test(n)) return "item-ammo";
  if(icoItemPart1(cat, n)){ if(/^Armor/.test(cat)) return /^Shield\b|\bShield$|, Shield|Shield,/.test(n)?"item-shield":"item-armor"; if(/^Weapon/.test(cat)) return /^(Arrow|Bolt|Needle|Sling Bullet|Firearm Bullet|Ammunition)/.test(n)?"item-ammo":"item-weapon";
    const K={Potion:"item-potion",Ring:"item-ring",Rod:"item-rod",Scroll:"item-scroll",Staff:"item-staff",Wand:"item-wand","Wondrous Item":"item-wondrous"}; for(const k in K) if(cat.indexOf(k)===0) return K[k]; }
  return icoItemTail(it, n, t, b); }
function icoItemTail(it, n, t, b){
  if(/^Shield\b/.test(b)) return "item-shield"; if(/Weapon/.test(t)) return "item-weapon"; if(/Armor/.test(t)) return "item-armor";
  if(/^Potion|^Elixir|^Oil of|^Philter/.test(n)) return "item-potion"; if(/^Ring\b|Ring of/.test(n)) return "item-ring"; if(/^Spell Scroll|Scroll/.test(n)) return "item-scroll";
  if(/^Rod\b|Rod of/.test(n)) return "item-rod"; if(/^Staff\b|Staff of/.test(n)) return "item-staff"; if(/^Wand\b|Wand of/.test(n)) return "item-wand"; if(it.rar||/Wondrous/.test(t)) return "item-wondrous"; return "item-gear"; }
function icoItemPart1(cat, n){ return (cat&&!(typeof ctOf==="function"&&ctOf(n))); }
function icoItem2Step1(it){
 const {n, t, b, cat}=icoItemStep1(it);
  return /** @type {any} */ ({n, t, b, cat});
}
function icoItemStep1(it){
const n=it.n||"", t=String(it.type||"")+" "+(it.rar||""), b=n.replace(/, \+\d$/,"");
  if(!lateGet("ICO_CAT")&&typeof DMGI!=="undefined"){ lateSet("ICO_CAT",{}); DMGI.forEach((x) =>{ lateGet("ICO_CAT")[x[0]]=x[1]; }); }
  const cat=(lateGet("ICO_CAT")&&(lateGet("ICO_CAT")[n]||lateGet("ICO_CAT")[n.replace(/ \(.*\)$/,"")]))||(/^(Rod|Staff|Wand|Ring|Potion|Scroll|Wondrous Item)\b/.exec(String(it.type||""))||[""])[0];/* R2-2: the item type when the DMG list has no entry *//* v24 M4: the DMG category decides for magic items */
  return /** @type {any} */ ({n, t, b, cat});
}
export function icoCls(t){ const m=/\b(Artificer|Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\b/.exec(t||""); return m?"cls-"+m[1].toLowerCase():""; }
/* duotone line icons (owner 2026-11-06): a finer line plus a soft fill in the colour of the meaning, set by data-ic */
const IC_DT={acid:1,bludgeoning:1,cold:1,fire:1,force:1,lightning:1,necrotic:1,piercing:1,poison:1,psychic:1,radiant:1,slashing:1,thunder:1};
export function icTint(k){ k=String(k||""); const p=k.split("-")[0], r=k.slice(p.length+1);
  if(p==="dt") return IC_DT[r]?r:"";
  if(k==="hp-heal"||k==="death-success"||k==="toast-ok") return "heal"; if(k==="hp-damage"||k==="death-fail"||k==="toast-error") return "dmg"; if(k==="hp-temp") return "temp"; if(k==="toast-warn") return "warn";
  return ({cond:"cond",school:"arcane",sense:"sense",speed:"sense",coin:"gold",res:"res",tag:"arcane",def:"res"})[p]||""; }
export function ico(k,cls,label){ const d=lateGet("ICO")[k]; if(!d) return ""; const t=icTint(k); return '<svg class="ico '+(cls||"")+'"'+(t?' data-ic="'+t+'"':'')+' viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '+(label?'role="img" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>':'aria-hidden="true" focusable="false">')+'<path d="'+d+'"/></svg>'; }
/* ================= v17 ================= */
/* RU40: every Limited Use row of a feature (several rows can belong to one feature, f = feature or item name) */
export function resOf(name){ return (D.res||[]).filter((q) =>{ return q.n===name||q.f===name; }); }
/* v36 p10: usage pips in the card head (the same .bx boxes), the reset line only when the sentence does not already say it */
function resPips(rl){ const p=rl.filter((r) =>{ return !r.pool; }); return p.length?'<span class="hpips">'+p.map((r) =>{ return (p.length>1?'<small class="hpl">'+esc(r.n)+'</small>':'')+'<span class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>'; }).join("")+'</span>':''; }
function resTail(rl,so){ const rest=so&&(so.m||[]).some((x) =>{ return /Rest/.test(x); }); return rl.map((r) =>{ if(so&&!r.pool) return rest?'':'<div class="fres">'+resetTxt(r)+'</div>'; return resBoxes([r]); }).join(""); }
function manCost(rl){ const r=rl.filter((q) =>{ return !q.pool; })[0]; if(!r) return ""; const left=r.max-used(r.k,r.max); return '<div class="sum-m"><span class="supd" data-k="'+r.k+'">'+ico("ui-dice","sum-i")+'<span>1 '+esc(String(r.n).replace(/Dice$/,"Die"))+'. <b>'+left+'</b> left</span></span></div>'; }
function resBoxes(rl){ return rl.map((r) =>{ return '<div class="fuse">'+(rl.length>1||r.n!==r.f?esc(r.n)+': ':'')+(r.pool?'Points:':'Used:')+'</div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="fres">'+resetTxt(r)+'</div>'; }).join(""); }
function itemRes(it){ const rl=resOf(it.n); return rl.length?'<div class="fsub ires">'+resBoxes(rl)+rl.map(chMaxH).join("")+'</div>':''; }
function resetTxt(r){ return {short:"Resets on a Short or Long Rest",short1:"One use back on a Short Rest, all on a Long Rest",long:"Resets on a Long Rest",none:"Does not reset on a rest"}[r.reset]||""; }
/* RU35 no. 4: icon of the kind of attack */
export var AK_ICON={melee:"M14 3h7v7L10 21l-7-7zM6 14l4 4",ranged:"M4 20L20 4M13 4h7v7M5 13c3 0 6 3 6 6",spell:"M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",unarmed:"M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0",feature:"M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"};
export function atkKind(a){ if(/Unarmed/.test(a.n)) return "unarmed"; if(/^Cantrip/.test(a.sub||"")) return "spell"; if(/thrown/i.test(a.n)||/^\d+\/\d+/.test(String(a.range||"").trim())) return "ranged"; return "melee"; }
export function akIcon(k){ return svgI(AK_ICON[k],"aki ak-"+k,{melee:"Melee attack",ranged:"Ranged attack",spell:"Spell attack",unarmed:"Unarmed Strike",feature:"Feature"}[k]); }
export function tyIcon(t){ const h=dtIcon(String(t||"").replace(/ or |, /g,"|")); return h||(t?svgI(AK_ICON.melee,"dti dt-weapon",String(t)):""); }
/* RU35 no. 1: slot boxes in the heading of each spell level (Pact Magic slots where Pact spells are listed) */
export function spSlotsH(l,rows){ if(!l) return ""; let o="", r=(D.res||[]).filter((q) =>{return q.k==="s"+l})[0], pr=(D.res||[]).filter((q) =>{return q.k==="pact"})[0];
  if(r) o+='<span class="spsl"><small>SLOTS</small>'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>';
  if(pr&&rows.some((p) =>{return spPact(p[0])})) o+='<span class="spsl"><small>PACT</small>'+boxes(used(pr.k,pr.max),pr.max,pr.k,pr.n)+'</span>';
  return o?'<span class="spslw">'+o+'</span>':""; }
/* RU35 no. 7: Speed and Defenses, always shown */
/* Resolve and merge movement sources separately from rendering defenses. */
function modeSpeed(x){return x.v==="walk"?D.speed:(D.cf&&D.cf.speed0.length?0:exSpd(num(x.v,0)))}
function speedModes(){const sp=Object.assign({},C.speeds||{});
 const merge=(k,x) =>{if(!sp[k]||modeSpeed(x)>modeSpeed(sp[k]))sp[k]=x};
 (C.moves||[]).forEach((m) =>{if(m&&["fly","swim","climb","burrow"].includes(m.m)&&Number.isFinite(+m.v))merge(m.m,{v:+m.v,s:m.s||""})});
 if(D.cf&&D.cf.fly)merge("fly",D.cf.fly);return sp}
function renderSpeedDef(){ const e=document.getElementById("speeds"); if(e){ const sp=speedModes();
    const KS=["fly","swim","climb","burrow"], NM={fly:"Fly",swim:"Swim",climb:"Climb",burrow:"Burrow"};
    render(html`<div class="sense"><span class="bonus">${D.speed}</span><span>Walking, ft</span></div>${KS.filter((k) => sp[k]).map((k) =>{ const x=sp[k], v=modeSpeed(x); return html`<div class="sense"><span class="bonus">${v}</span><span>${NM[k]}, ft<small class="muted"> ${x.s||""}</small></span></div>`; })}${KS.some((k) => sp[k])?null:html`<p class="muted dnone">No other speeds</p>`}`,e); }
  const f=document.getElementById("defs"); if(f){ const L=(C.defenses||[]).concat(D.cf?D.cf.res:[]),/* v22 */ g=function(t){ return L.filter((d) =>{return d.t===t}); };
    const sec=function(t,lbl,none){ const x=g(t); return html`<h3 class="defh">${lbl}</h3>${x.length?x.map((d) => html`<div class="defl"><b>${d.v}</b><small>${d.s}</small></div>`):html`<p class="muted dnone">${none}</p>`}`; };
    const oth=L.filter((d) =>{return ["Resistance","Immunity","Vulnerability"].indexOf(d.t)<0});
    render(html`${sec("Resistance","Resistances","No Resistances")}${sec("Immunity","Immunities","No Immunities")}${sec("Vulnerability","Vulnerabilities","No Vulnerabilities")}${oth.length?html`<h3 class="defh">Other</h3>${oth.map((d) => html`<div class="defl"><b>${d.t}</b> ${d.v}<small>${d.s}</small></div>`)}`:null}`,f); } }
/* RU35 no. 6: notes under Saving Throws */
function saveNotesH(){ const n=(C.saveNotes||[]), b=(C.saveBonus||[]); if(!n.length&&!b.length) return ""; return '<div class="snotes">'+b.map((x) =>{return '<p><b>'+sg(num(x.v))+'</b> '+(x.np?'to saving throws that do not use your Proficiency Bonus':x.ab?'to '+({STR:'Strength',DEX:'Dexterity',CON:'Constitution',INT:'Intelligence',WIS:'Wisdom',CHA:'Charisma'}[x.ab]||x.ab)+' saving throws':'to all saving throws')+' <small>'+esc(x.s)+'</small></p>'}).join("")+n.map((x) =>{return '<p>'+esc(x.t)+' <small>'+esc(x.s)+'</small></p>'}).join("")+'</div>'; }
/* RU35 no. 8: containers. An item with "in" sits inside that container item. A magic container (CONTAINERS[2] set) has a fixed weight, its contents do not count */
export function ctOf(n){ const b=String(n||"").replace(/ \(.*\)$/,""); return (typeof CONTAINERS!=="undefined"?CONTAINERS:[]).filter((c) =>{ return c[0]===n||c[0]===b; })[0]||null; }

