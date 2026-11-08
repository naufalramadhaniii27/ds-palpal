import {bindLive,coachLine,combatHTML,cuBtn,cuDecor,cuHTML,cuOf,cuqBackH,cuqHTML,cuqOf,dockApply,gsHTML,gsMark,ico,icoCls,icoSp,infoHTML,lateGet,shOpened,spmHTML} from "./00a-reg-late-ports.js";import {C,FROZEN} from "./04-logic-storage.js";
import {$} from "./05-logic-helpers.js";
import {B} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {hpDockBack} from "./09-ui-hit-points-playbar-death-saves.js";
import {condHTML} from "./10-ui-conditions.js";
import {bdHTML} from "./11-ui-breakdown.js";

import {html,raw,render} from "./lib/html.js";import {env} from "./00-env.js";import {ENTRY} from "./06a-logic-ui-registry.js";bindLive("__set_navStack",{get:function(){return __set_navStack;}});bindLive("refreshEntry",{get:function(){return refreshEntry;}});bindLive("sheet",{get:function(){return sheet;}});
bindLive("navStack",{get:function(){return navStack;},set:function(v){navStack=v;}});
bindLive("openSheet",{get:function(){return openSheet;}});
bindLive("sheetMode",{get:function(){return sheetMode;},set:function(v){sheetMode=v;}});
bindLive("showEntry",{get:function(){return showEntry;}});
/* ================= SHEET (modal / bottom sheet) with navigation ================= */
export var sheet=$("#sheet"), sheetMode="", lastFocus=null, navStack=[];
let LASTPT=null;document.addEventListener("pointerdown",(e) =>{ LASTPT={x:e.clientX,y:e.clientY,t:Date.now()}; },true);/* v53: the panel grows from where you tapped (wide screens) */
function growFrom(){ try{ if(REDUCE||innerWidth<760||!LASTPT||Date.now()-LASTPT.t>1500){ sheet.style.transformOrigin=""; return; } const r=sheet.getBoundingClientRect(); if(!r.width) return; const x=Math.max(0,Math.min(r.width,LASTPT.x-r.left)), y=Math.max(0,Math.min(r.height,LASTPT.y-r.top)); sheet.style.transformOrigin=Math.round(x)+"px "+Math.round(y)+"px"; }catch(er){} }
/* T10: the same icon the identity chip shows (species, class, subclass emblem, background, size) leads the detail title */
/* T10: watermarks use the HD copy (img/hd, 768 px emblems and 384 px icons). The small file is the fallback if the HD one is missing */
export function wmHd(h){ return String(h||"").replace(/<img ([^>]*?)src="img\/(emblem\/sub\/|emblem\/|icon\/)([^"]+)"/g,(m,a,d,f) =>{ return '<img '+a+'src="img/hd/'+d+f+'" data-fb="img/'+d+f+'"'; }); }
/* T11 A1: the fallback to the normal size picture when an HD file is missing, without an inline onerror handler (the CSP allows no inline handlers) */
document.addEventListener("error",(e) =>{ const t=e.target; if(t&&t.tagName==="IMG"&&t.classList.contains("lib-im")){ t.remove(); return; }/* a Library picture that is missing: no empty frame (was an inline onerror, which the CSP and Trusted Types clean away) */ if(t&&t.tagName==="IMG"&&t.getAttribute("data-fb")){ const f=t.getAttribute("data-fb"); t.removeAttribute("data-fb"); t.src=f; } },true);
export function wmClass(n){ const k=String(n||"").toLowerCase(); if(!(env.__ART&&env.__ART.emblem&&env.__ART.emblem[k])) return ""; try{ if(__store.getItem("mi-clsart")==="off") return ""; }catch(e){} return '<img class="art-sub" src="img/emblem/'+k+'.avif" alt="">'; }
/* the picture from 5etools for an entry (window.QIMG, same tables as the Library), found by title: "Background: X", "Species: X" or an item, spell, feat and so on by name. It goes before the Codex icon. */
const QIM_CATS=["item","gear","spell","feat","bg","species","class","sub","deity","recipe","charopt","language","hazard","object","vehicle","optfeat","rule"];
const qimN=(z) =>String(z||"").toLowerCase().replace(/[^a-z0-9]/g,"");
export function wm5(t){ const Q=env.QIMG; if(!Q||!t) return ""; let n=t, cats=QIM_CATS, m=/^(Background|Species): (.+)$/.exec(t);
  if(m){ n=m[2]; cats=[m[1]==="Background"?"bg":"species"]; }
  env.__qimN=env.__qimN||{};
  for(let i=0;i<cats.length;i++){ const c=cats[i], tb=Q[c]; if(!tb) continue; let im=tb[n]||null;
    if(!im){ if(!env.__qimN[c]){ const mp={}; Object.keys(tb).forEach((z) =>{ mp[qimN(z)]=tb[z]; }); env.__qimN[c]=mp; } im=env.__qimN[c][qimN(n)]||null; }
    if(im) return '<img class="lib-im" loading="lazy" decoding="async" alt="" src="data/img/'+encodeURI(im)+'.webp">'; }
  return ""; }
export function sheetIco(t){ t=String(t||""); let h="", m;
  h=wm5(t); if(h) return h;
  ({m, h}=sheetIcoStep1(m, t, h));
  ({h}=sheetIcoStep2(h, t));
  return wmHd(h); }
function sheetIcoStep1(m, t, h){
  if((m=/^(\w+) Subclass: (.+)$/.exec(t))) h=(env.__artSub&&env.__artSub(m[1],m[2],320))||ico("src-class");
  else if(/^Species: /.test(t)) h=(env.__artIc&&env.__artIc("species",t.slice(9)))||ico(icoSp(t.slice(9))||"sp-custom");
  else if(/^Background: /.test(t)) h=(env.__artIc&&env.__artIc("background",t.slice(12)))||ico("src-background");
  else if(t==="Size") h=(env.__artIc&&env.__artIc("size",C.size))||ico("creature");
  else if(typeof CLASSES==="object"&&CLASSES[t]&&icoCls(t)) h=wmClass(t)||ico(icoCls(t));
  return /** @type {any} */ ({m, h});
}
function sheetIcoStep2(h, t){
  if(!h&&env.__artIc){ const cats=[["spell",""],["item",""],["condition",""],["skill",""],["ability",""],["damage",""],["creature",""],["mastery"," Mastery"],["school"," School"],["featcat",""],["itemcat",""],["coin",""],["feature",""],["feat",""],["opt",""],["rule",""],["facility",""],
    ["language",""]]; const alt=[t]; const pm=/\(([^)]+)\)\s*$/.exec(t); if(pm) alt.push(pm[1]); if(/s$/i.test(t)) alt.push(t.replace(/s$/i,"")); for(let j=0;j<alt.length&&!h;j++) for(let i=0;i<cats.length&&!h;i++) h=env.__artIc(cats[i][0],alt[j]+cats[i][1]);
      }/* custom names like "Celurit (Sickle)" use the base item, "Arrows" the single arrow *//* art icons: spells, items, conditions, skills and the rest */
  return /** @type {any} */ ({h});
}
function setSheetTitle(t){ const e=$("#sheetTitle"); e.textContent=t; let w=$("#shWm"); if(w){ w.remove(); w=null; }/* a fresh picture holder each time: the blend code writes into it, and a reused one kept the previous entry's scene */ if(!w){ w=document.createElement("span");
  w.id="shWm"; w.className="sh-wm"; w.setAttribute("aria-hidden","true"); $("#sheet").insertBefore(w,$("#sheetBody")); } render(raw(sheetIco(t)),w); }
export function openSheet(title, html, mode, wide){
  hpDockBack();/* v30 */
  if(!sheet.classList.contains("on")) lastFocus=document.activeElement;
  sheetMode=mode;
  setSheetTitle(title); const shw=$("#shWm"); $("#sheetBody").innerHTML=html; if(shw) $("#sheetBody").insertBefore(shw,$("#sheetBody").firstChild); $("#sheetBody").scrollTop=0;/* the icon is a big picture at the top of the content */
  $("#sheetBack").hidden = navStack.length<2;
  sheet.classList.toggle("wide",!!wide); sheet.style.transform="";
  if(!sheet.classList.contains("on")) growFrom();
  try{ env.__artSheet&&env.__artSheet(mode,title); }catch(er){}
  try{ env.__blendSheet&&env.__blendSheet(mode,title); }catch(er){}
  $("#scrim").classList.add("on"); sheet.classList.add("on"); dockApply(mode,wide); shOpened();/* v31 p14, p16 */
  setTimeout(() =>{ const b=$("#sheet [data-close]"); if(b) b.focus({preventScroll:true}); },80);
}
/* Potion of Healing: drinking it or giving it to a creature within 5 feet is a Bonus Action in the 2024 rules, an Action in the 2014 rules. The shared item text is written for 2024, so a 2014 character gets the 2014 wording */
export function potEd(h){ if(typeof lateGet("C")==="undefined"||!lateGet("C")||lateGet("C").rs!=="2014") return h;
  const T="(?:<[^>]*>)*";/* the words may carry glossary links (autolink), so tags around them are allowed */
  return String(h).replace(new RegExp("Drink it or give it to someone within 5 feet \\("+T+"Bonus Action"+T+"\\) to regain"),"Drink it or give it to someone (Action) to regain").replace(new RegExp("Drink it, or give it to a creature within 5 feet, as a "+T+"Bonus Action"+T+"\\."),"Drinking it or giving it to another creature takes an Action."); }
ENTRY.add("bd", {content:function(en){
  const cb=cuOf("bd",en.key); return {t:B[en.key]?B[en.key].t:"", h:bdHTML(en.key)+cuqBackH(en.key)+(cb?cuBtn(cb):""), m:"bd"};
}});
ENTRY.add("cond", {content:function(en){
  return {t:"Conditions", h:condHTML(), m:"cond"};
}});
ENTRY.add("combat", {content:function(en){
  return {t:"Combat", h:combatHTML(), m:"combat"};
}});
ENTRY.add("spman", {content:function(en){
  return {t:"Manage Spells", h:spmHTML(), m:"spman"};
}});
ENTRY.add("search", {content:function(en){
  setTimeout(gsMark,0); return {t:"Search", h:gsHTML(), m:"search"};
}});
ENTRY.add("cuq", {content:function(en){
  const cq=cuqOf(en.key); return {t:cq?"Edit "+cq.t:"Edit", h:cuqHTML(en.key), m:"cuq"};
}});
ENTRY.add("cust", {content:function(en){
  return {t:"Customize", h:cuHTML(en.key,en.n), m:"cust"};
}});
/* The sheet entry types that are not registered above are info cards (DETAIL registry) */
/* solid:orchestrator entryContent */
function entryContent(en){
  const e=ENTRY.get(en.type); if(e) return e.content(en);
  const r=cuDecor(en.spec,infoHTML(en.spec)); return {t:r.t, h:potEd(r.h), m:"info"};
}
export var SWP=null;/* v36 p18: {list:[spec], i} of the list the open card came from */
export function swpSet(el){ const c=el.closest("[id$='Body']")||document, sp=el.getAttribute("data-info"), seen={}, L=[];
  [].forEach.call(c.querySelectorAll('[data-info]'),(b) =>{ const s=b.getAttribute("data-info"); if(!/^(sp|f|w|it|xd):/.test(s)||seen[s]||!b.offsetParent) return; seen[s]=1; L.push(s); });
  const i=L.indexOf(sp); SWP=(i>=0&&L.length>1)?{list:L,i:i}:null; }
export function swpMove(d){ if(!SWP||navStack.length!==1) return false; const j=SWP.i+d; if(j<0||j>=SWP.list.length) return false; SWP.i=j; showEntry({type:"info",spec:SWP.list[j]},false); return true; }
function swpSync(){ const b=$("#sheetBody"), old=b&&b.querySelector(".swp"); if(old) old.remove(); const en=navStack[navStack.length-1];
  if(!b||!SWP||navStack.length!==1||!en||en.type!=="info"||en.spec!==SWP.list[SWP.i]||sheetMode==="edit") return;
  let n=SWP.list.length, i=SWP.i, a=Math.max(0,Math.min(i-3,n-7)); const dots=[];
  for(let k=a;k<Math.min(n,a+7);k++) dots.push(html`<i class="${k===i?"on":""}"></i>`);
  const d=document.createElement("div"); d.className="swp"; d.setAttribute("role","group"); d.setAttribute("aria-label","Card "+(i+1)+" of "+n);
  render(html`<button type="button" class="swp-b" data-swp="-1" aria-label="Previous card" ?disabled="${!i}">\u2039</button><span class="swp-d">${dots}</span><span class="swp-n">${i+1} / ${n}</span><button type="button" class="swp-b" data-swp="1" aria-label="Next card" ?disabled="${i>=n-1}">\u203a</button>`,d);
  b.insertBefore(d,b.firstChild); }
document.addEventListener("keydown",(e) =>{ if(!SWP||!sheet.classList.contains("on")||sheetMode!=="info"||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")) return; if(e.key==="ArrowRight"){ if(swpMove(1)) e.preventDefault(); } else if(e.key==="ArrowLeft"){ if(swpMove(-1)) e.preventDefault(); } });
(function(){ let b=document.getElementById("sheetBody"), x0=0, y0=0, on=false; if(!b) return;
  b.addEventListener("touchstart",(e) =>{ on=e.touches.length===1&&!!SWP&&!(e.target.closest&&e.target.closest("input,textarea,select,.swp")); if(on){ x0=e.touches[0].clientX; y0=e.touches[0].clientY; } },{passive:true});
  b.addEventListener("touchend",(e) =>{ if(!on) return; on=false; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6) swpMove(dx<0?1:-1); },{passive:true}); })();
/* T11 Learn F5 (U2): a rule panel on the sheet ends with "Learn this", which opens the Learn stop that teaches it */
export var LEARN_LINK=[[/^(Athletics|Acrobatics|Sleight of Hand|Stealth|Arcana|History|Investigation|Nature|Religion|Animal Handling|Insight|Medicine|Perception|Survival|Deception|Intimidation|Performance|Persuasion)\b|Difficulty Class|Ability Check|D20 Test/i,"rooftops"],
  [/^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\b|Proficiency/i,"green"],[/Armor Class|Attack|Critical Hit|Damage/i,"yard"],
  [/Death Sav|Hit Point Dice|Hit Dice|Stable|Unconscious/i,"camp2"],[/Hit Points|Short Rest|Long Rest/i,"campsite"],[/Speed|Initiative|^Action|Dash|Dodge|Disengage/i,"forest"],
  [/Bonus Action|Reaction|Opportunity Attack/i,"forest2"],[/Advantage|Disadvantage|Heroic Inspiration/i,"cliff"],[/Saving Throw/i,"camp2"],
  [/Prone|Poisoned|Grappled|Blinded|Charmed|Deafened|Frightened|Incapacitated|Invisible|Paralyzed|Petrified|Restrained|Stunned|Exhaustion|Condition/i,"meadow"],
  [/Concentration|Prepared/i,"tower2"],[/Cantrip|Spell Slot|Spellcasting|Spell Attack|Spell Save/i,"tower1"]];
function learnLink(t){ if(FROZEN) return ""; t=String(t||"").replace(/<[^>]*>/g,""); for(let i=0;i<LEARN_LINK.length;i++) if(LEARN_LINK[i][0].test(t)) return '<div class="lrn-link"><button type="button" class="btn press" data-hlearn="place:'+LEARN_LINK[i][1]+'">'+ico("ui-book")+'Learn this</button></div>'; return ""; }
export function showEntry(en, push){
  hpDockBack();/* v30 */
  sheet.dataset.spec=(en&&en.spec)||"";/* the blend reads the entry kind (lib:species|Drow) to pick a scene */
  const open=sheet.classList.contains("on") && sheetMode!=="edit";
  if(push && open) navStack.push(en); else navStack=[en];
  let c=entryContent(en); c={t:c.t,h:(typeof lateGet("coachLine")==="function"?coachLine(c.t):"")+c.h+learnLink(c.t),m:c.m};/* T11 U47 */
  if(open){
    sheetMode=c.m; setSheetTitle(c.t); const b=$("#sheetBody"),shw2=$("#shWm"); b.innerHTML=c.h; if(shw2) b.insertBefore(shw2,b.firstChild); b.scrollTop=0;
    b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
    try{ env.__blendSheet&&env.__blendSheet(c.m,c.t); }catch(er){}/* paging inside an open sheet: rebuild the picture, title bits and colour for this entry */
    $("#sheetBack").hidden = navStack.length<2;
  } else openSheet(c.t, c.h, c.m);
  swpSync();/* v36 p18 */
}
export function refreshEntry(){
  if(!navStack.length || !sheet.classList.contains("on") || sheetMode==="edit") return;
  const c=entryContent(navStack[navStack.length-1]), b=$("#sheetBody"), st=b.scrollTop;
  setSheetTitle(c.t); const shw3=$("#shWm"); b.innerHTML=c.h+learnLink(c.t); if(shw3) b.insertBefore(shw3,b.firstChild); b.scrollTop=st; try{ env.__blendSheet&&env.__blendSheet(sheetMode,c.t,true); }catch(er){} swpSync();/* v36 p18 */
}
$("#sheetBack").addEventListener("click",() =>{
  if(navStack.length<2) return;
  hpDockBack(); navStack.pop(); const c=entryContent(navStack[navStack.length-1]);
  sheetMode=c.m; setSheetTitle(c.t); const b=$("#sheetBody"),shw2=$("#shWm"); b.innerHTML=c.h; if(shw2) b.insertBefore(shw2,b.firstChild); b.scrollTop=0; try{ env.__blendSheet&&env.__blendSheet(c.m,c.t); }catch(er){}
  b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
  $("#sheetBack").hidden = navStack.length<2; swpSync();/* v36 p18 */
});


export function __set_sheetMode(v){ return sheetMode=v; }
export function __set_navStack(v){ return navStack=v; }
export function __set_openSheet(v){ return openSheet=v; }
export function __set_SWP(v){ return SWP=v; }
export function __set_showEntry(v){ return showEntry=v; }
export function __set_refreshEntry(v){ return refreshEntry=v; }
