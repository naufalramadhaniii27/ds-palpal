import {FROZEN} from "./04-logic-storage.js";
import {$} from "./05-logic-helpers.js";
import {B} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {hpDockBack} from "./09-ui-hit-points-playbar-death-saves.js";
import {condHTML} from "./10-ui-conditions.js";
import {bdHTML} from "./11-ui-breakdown.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"navStack",{get:function(){return navStack;},set:function(v){navStack=v;},configurable:true});
Object.defineProperty(__R,"openSheet",{get:function(){return openSheet;},set:function(v){openSheet=v;},configurable:true});
Object.defineProperty(__R,"sheetMode",{get:function(){return sheetMode;},set:function(v){sheetMode=v;},configurable:true});
Object.defineProperty(__R,"showEntry",{get:function(){return showEntry;},set:function(v){showEntry=v;},configurable:true});
/* ================= SHEET (modal / bottom sheet) with navigation ================= */
export var sheet=$("#sheet"), sheetMode="", lastFocus=null, navStack=[];
let LASTPT=null;document.addEventListener("pointerdown",(e) =>{ LASTPT={x:e.clientX,y:e.clientY,t:Date.now()}; },true);/* v53: the panel grows from where you tapped (wide screens) */
function growFrom(){ try{ if(REDUCE||innerWidth<760||!LASTPT||Date.now()-LASTPT.t>1500){ sheet.style.transformOrigin=""; return; } const r=sheet.getBoundingClientRect(); if(!r.width) return; const x=Math.max(0,Math.min(r.width,LASTPT.x-r.left)), y=Math.max(0,Math.min(r.height,LASTPT.y-r.top)); sheet.style.transformOrigin=Math.round(x)+"px "+Math.round(y)+"px"; }catch(er){} }
/* T10: the same icon the identity chip shows (species, class, subclass emblem, background, size) leads the detail title */
/* T10: watermarks use the HD copy (img/hd, 768 px emblems and 384 px icons). The small file is the fallback if the HD one is missing */
export function wmHd(h){ return String(h||"").replace(/<img ([^>]*?)src="img\/(emblem\/sub\/|emblem\/|icon\/)([^"]+)"/g,(m,a,d,f) =>{ return '<img '+a+'src="img/hd/'+d+f+'" data-fb="img/'+d+f+'"'; }); }
/* T11 A1: the fallback to the normal size picture when an HD file is missing, without an inline onerror handler (the CSP allows no inline handlers) */
document.addEventListener("error",(e) =>{ const t=e.target; if(t&&t.tagName==="IMG"&&t.getAttribute("data-fb")){ const f=t.getAttribute("data-fb"); t.removeAttribute("data-fb"); t.src=f; } },true);
export function wmClass(n){ const k=String(n||"").toLowerCase(); if(!(window.__ART&&window.__ART.emblem&&window.__ART.emblem[k])) return ""; try{ if(__store.getItem("mi-clsart")==="off") return ""; }catch(e){} return '<img class="art-sub" src="img/emblem/'+k+'.avif" alt="">'; }
export function sheetIco(t){ t=String(t||""); let h="", m;
  if((m=/^(\w+) Subclass: (.+)$/.exec(t))) h=(window.__artSub&&window.__artSub(m[1],m[2],320))||__R.ico("src-class");
  else if(/^Species: /.test(t)) h=__R.ico(__R.icoSp(t.slice(9))||"sp-custom");
  else if(/^Background: /.test(t)) h=__R.ico("src-background");
  else if(t==="Size") h=__R.ico("creature");
  else if(typeof CLASSES==="object"&&CLASSES[t]&&__R.icoCls(t)) h=wmClass(t)||__R.ico(__R.icoCls(t));
  if(!h&&window.__artIc){ const cats=[["spell",""],["item",""],["condition",""],["skill",""],["ability",""],["damage",""],["creature",""],["mastery"," Mastery"],["school"," School"],["featcat",""],["itemcat",""],["coin",""]]; for(let i=0;i<cats.length&&!h;i++) h=window.__artIc(cats[i][0],t+cats[i][1]); }/* art icons: spells, items, conditions, skills and the rest */
  return wmHd(h); }
function setSheetTitle(t){ const e=$("#sheetTitle"); e.textContent=t; let w=$("#shWm"); if(!w){ w=document.createElement("span"); w.id="shWm"; w.className="sh-wm"; w.setAttribute("aria-hidden","true"); $("#sheet").insertBefore(w,$("#sheetBody")); } w.innerHTML=sheetIco(t); }
export function openSheet(title, html, mode, wide){
  hpDockBack();/* v30 */
  if(!sheet.classList.contains("on")) lastFocus=document.activeElement;
  sheetMode=mode;
  setSheetTitle(title); const shw=$("#shWm"); $("#sheetBody").innerHTML=html; if(shw) $("#sheetBody").insertBefore(shw,$("#sheetBody").firstChild); $("#sheetBody").scrollTop=0;/* the icon is a big picture at the top of the content */
  $("#sheetBack").hidden = navStack.length<2;
  sheet.classList.toggle("wide",!!wide); sheet.style.transform="";
  if(!sheet.classList.contains("on")) growFrom();
  try{ window.__artSheet&&window.__artSheet(mode,title); }catch(er){}
  $("#scrim").classList.add("on"); sheet.classList.add("on"); __R.dockApply(mode,wide); __R.shOpened();/* v31 p14, p16 */
  setTimeout(() =>{ const b=$("#sheet [data-close]"); if(b) b.focus({preventScroll:true}); },80);
}
function entryContent(en){
  if(en.type==="bd"){ const cb=__R.cuOf("bd",en.key); return {t:B[en.key]?B[en.key].t:"", h:bdHTML(en.key)+__R.cuqBackH(en.key)+(cb?__R.cuBtn(cb):""), m:"bd"}; }/* v26 RU38 no. 2 */
  if(en.type==="cond") return {t:"Conditions", h:condHTML(), m:"cond"};
  if(en.type==="combat") return {t:"Combat", h:__R.combatHTML(), m:"combat"};/* v22 RU62 */
  if(en.type==="spman") return {t:"Manage Spells", h:__R.spmHTML(), m:"spman"};
  if(en.type==="search"){ setTimeout(__R.gsMark,0); return {t:"Search", h:__R.gsHTML(), m:"search"}; }/* v27 RU66 *//* v25 RU38 no. 3 */
  if(en.type==="cuq"){ const cq=__R.cuqOf(en.key); return {t:cq?"Edit "+cq.t:"Edit", h:__R.cuqHTML(en.key), m:"cuq"}; }/* v34 RU85 */
  if(en.type==="cust") return {t:"Customize", h:__R.cuHTML(en.key,en.n), m:"cust"};/* v26 RU38 no. 2 */
  const r=__R.cuDecor(en.spec,__R.infoHTML(en.spec)); return {t:r.t, h:r.h, m:"info"};
}
export var SWP=null;/* v36 p18: {list:[spec], i} of the list the open card came from */
export function swpSet(el){ const c=el.closest("[id$='Body']")||document, sp=el.getAttribute("data-info"), seen={}, L=[];
  [].forEach.call(c.querySelectorAll('[data-info]'),(b) =>{ const s=b.getAttribute("data-info"); if(!/^(sp|f|w|it|xd):/.test(s)||seen[s]||!b.offsetParent) return; seen[s]=1; L.push(s); });
  const i=L.indexOf(sp); SWP=(i>=0&&L.length>1)?{list:L,i:i}:null; }
export function swpMove(d){ if(!SWP||navStack.length!==1) return false; const j=SWP.i+d; if(j<0||j>=SWP.list.length) return false; SWP.i=j; showEntry({type:"info",spec:SWP.list[j]},false); return true; }
function swpSync(){ const b=$("#sheetBody"), old=b&&b.querySelector(".swp"); if(old) old.remove(); const en=navStack[navStack.length-1];
  if(!b||!SWP||navStack.length!==1||!en||en.type!=="info"||en.spec!==SWP.list[SWP.i]||sheetMode==="edit") return;
  let n=SWP.list.length, i=SWP.i, a=Math.max(0,Math.min(i-3,n-7)), dots="";
  for(let k=a;k<Math.min(n,a+7);k++) dots+='<i'+(k===i?' class="on"':'')+'></i>';
  const d=document.createElement("div"); d.className="swp"; d.setAttribute("role","group"); d.setAttribute("aria-label","Card "+(i+1)+" of "+n);
  d.innerHTML='<button type="button" class="swp-b" data-swp="-1" aria-label="Previous card"'+(i?'':' disabled')+'>\u2039</button><span class="swp-d">'+dots+'</span><span class="swp-n">'+(i+1)+' / '+n+'</span><button type="button" class="swp-b" data-swp="1" aria-label="Next card"'+(i<n-1?'':' disabled')+'>\u203a</button>';
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
function learnLink(t){ if(FROZEN) return ""; t=String(t||"").replace(/<[^>]*>/g,""); for(let i=0;i<LEARN_LINK.length;i++) if(LEARN_LINK[i][0].test(t)) return '<div class="lrn-link"><button type="button" class="btn press" data-hlearn="place:'+LEARN_LINK[i][1]+'">'+__R.ico("ui-book")+'Learn this</button></div>'; return ""; }
export function showEntry(en, push){
  hpDockBack();/* v30 */
  const open=sheet.classList.contains("on") && sheetMode!=="edit";
  if(push && open) navStack.push(en); else navStack=[en];
  let c=entryContent(en); c={t:c.t,h:(typeof __R.coachLine==="function"?__R.coachLine(c.t):"")+c.h+learnLink(c.t),m:c.m};/* T11 U47 */
  if(open){
    sheetMode=c.m; setSheetTitle(c.t); const b=$("#sheetBody"),shw2=$("#shWm"); b.innerHTML=c.h; if(shw2) b.insertBefore(shw2,b.firstChild); b.scrollTop=0;
    b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
    $("#sheetBack").hidden = navStack.length<2;
  } else openSheet(c.t, c.h, c.m);
  swpSync();/* v36 p18 */
}
export function refreshEntry(){
  if(!navStack.length || !sheet.classList.contains("on") || sheetMode==="edit") return;
  const c=entryContent(navStack[navStack.length-1]), b=$("#sheetBody"), st=b.scrollTop;
  setSheetTitle(c.t); const shw3=$("#shWm"); b.innerHTML=c.h+learnLink(c.t); if(shw3) b.insertBefore(shw3,b.firstChild); b.scrollTop=st; swpSync();/* v36 p18 */
}
$("#sheetBack").addEventListener("click",() =>{
  if(navStack.length<2) return;
  hpDockBack(); navStack.pop(); const c=entryContent(navStack[navStack.length-1]);
  sheetMode=c.m; setSheetTitle(c.t); const b=$("#sheetBody"),shw2=$("#shWm"); b.innerHTML=c.h; if(shw2) b.insertBefore(shw2,b.firstChild); b.scrollTop=0;
  b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
  $("#sheetBack").hidden = navStack.length<2; swpSync();/* v36 p18 */
});


export function __set_sheetMode(v){ return sheetMode=v; }
export function __set_navStack(v){ return navStack=v; }
export function __set_openSheet(v){ return openSheet=v; }
export function __set_SWP(v){ return SWP=v; }
export function __set_showEntry(v){ return showEntry=v; }
export function __set_refreshEntry(v){ return refreshEntry=v; }
