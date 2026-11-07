import {C,S,snSetH} from "./04-logic-storage.js";
import {hcBtn,hcNote,miSetH,themeHTML} from "./07-ui-theme-contrast-spring.js";
import {spPact} from "./22-ui-spell-data-and-slots.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"applyLook2",{get:function(){return applyLook2;},set:function(v){applyLook2=v;},configurable:true});
Object.defineProperty(__R,"carryOf",{get:function(){return carryOf;},set:function(v){carryOf=v;},configurable:true});
Object.defineProperty(__R,"setOf",{get:function(){return setOf;},set:function(v){setOf=v;},configurable:true});
Object.defineProperty(__R,"setPut",{get:function(){return setPut;},set:function(v){setPut=v;},configurable:true});
Object.defineProperty(__R,"settingsHTML",{get:function(){return settingsHTML;},set:function(v){settingsHTML=v;},configurable:true});
/* ================= v25: SETTINGS AND APPEARANCE (RU38 no. 6, no. 7) =================
   S.set (optional): enc "off" (weight not tracked), ab "score" (score big, modifier small), spUp 1 (a spell that gains from a higher slot is listed again
   under each higher slot level). S.frame and S.bdrop (optional): portrait frame and backdrop. Hit Points fixed or rolled stay in the build (B.hpMode). */
export function setOf(k){ return S.set&&S.set[k]!=null?String(S.set[k]):""; }
function setPut(k,v){ S.set=S.set&&typeof S.set==="object"?S.set:{}; if(v===""||v==null) delete S.set[k]; else S.set[k]=k==="spUp"?1:v; if(!Object.keys(S.set).length) delete S.set; }
const FRAMES=[["","Plain"],["round","Round"],["double","Double line"],["gilded","Gilded"],["wood","Carved wood"],["outline","Outline"],["none","No border"]];
const BDROPS=[["","None"],["dusk","Dusk"],["stars","Night sky"],["parchment","Parchment"],["stone","Stone wall"],["waves","Waves"],["leaves","Woodland"]];
function setBtn(k,v,label){ const on=setOf(k)===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-set="'+k+':'+v+'" aria-pressed="'+on+'">'+label+'</button>'; }
function lookBtn(attr,cur,v,label,extra){ const on=(cur||"")===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-'+attr+'="'+v+'" aria-pressed="'+on+'">'+(extra||"")+label+'</button>'; }
function settingsHTML(){ let h='<h3 class="set-h">Appearance</h3>'+themeHTML();
  h+='<div class="info-h">Portrait Frame</div><div class="thg">'+FRAMES.map((f) =>{ return lookBtn("thf",S.frame,f[0],f[1],'<span class="frsw" data-fr="'+f[0]+'" aria-hidden="true"></span>'); }).join("")+'</div>';
  h+='<div class="info-h">Backdrop</div><div class="thg">'+BDROPS.map((f) =>{ return lookBtn("thd",S.bdrop,f[0],f[1],'<span class="bdsw" data-bd0="'+f[0]+'" aria-hidden="true"></span>'); }).join("")+'</div><p class="info-d">The backdrop sits behind the sheet. It is not printed.</p>';
  h+='<h3 class="set-h">Rules</h3><div class="info-h">Carrying Capacity</div><div class="thg">'+setBtn("enc","","Track weight")+setBtn("enc","off","Do not track")+'</div><p class="info-d">Your capacity is your Strength score times 15 pounds for a Small or Medium creature (half for Tiny, double for each size above Medium). Powerful Build counts as one size larger. Do not track hides the weight warning in Inventory.</p>';
  let hm=null; try{ hm=env.__bldHpMode?env.__bldHpMode():null; }catch(er){ hm=null; }
  h+='<div class="info-h">Hit Points</div>'+(hm?'<div class="thg"><button type="button" class="thb'+(hm!=="roll"?" on":"")+'" data-hpm="avg" aria-pressed="'+(hm!=="roll")+'">Fixed (average)</button><button type="button" class="thb'+(hm==="roll"?" on":"")+'" data-hpm="roll" aria-pressed="'+(hm==="roll")+'">Rolled</button></div><p class="info-d">'+(hm==="roll"?'Enter each roll in the builder. Empty rolls count as the average. <button type="button" class="lk" data-hpgo="1">Enter rolls</button>':'Each level after the first adds the average of your Hit Die plus your Constitution modifier.')+'</p>':'<p class="info-d">This sheet has no build, so its Hit Points are typed in. Change them with Edit.</p>');
  h+='<h3 class="set-h">Display</h3><div class="info-h">Ability Scores</div><div class="thg">'+setBtn("ab","","Modifier on top")+setBtn("ab","score","Score on top")+'</div>';
  h+='<div class="info-h">Spells</div><div class="thg">'+setBtn("spUp","","Each spell once")+setBtn("spUp","1","Also at higher slot levels")+'</div><p class="info-d">With higher slot levels on, a spell that gets stronger with a higher slot is listed again under each higher level you have slots for, with its effect at that level.</p>';
  const wk=!!(navigator.wakeLock&&typeof navigator.wakeLock.request==="function");/* v30 p11 RU131 */
  h+='<div class="info-h">Screen</div><div class="thg">'+setBtnI("wake","","Normal","ui-moon")+setBtnI("wake","1","Keep screen on","ui-sun")+'</div><p class="info-d">'+(wk?'Keep screen on stops the screen from dimming or locking while the sheet is open. It uses more battery.':'This browser cannot keep the screen on. The setting is saved and works in a browser that can.')+'</p>';
  h+='<div class="info-h">One-handed mode</div><div class="thg">'+setBtnI("oneh","","Off","ui-close")+setBtnI("oneh","1","On","ui-hand")+'</div><p class="info-d">On phones, a bar above the page buttons holds the amount, Heal, Damage, Rest, and Search, where your thumb reaches.</p>';
  /* v32 p27 RU110, RU113 */
  h+='<div class="info-h">Text Size</div><div class="thg tsg">'+[["90","90%"],["","100%"],["115","115%"],["130","130%"]].map((x) =>{ const on=setOf("fs")===x[0]; return '<button type="button" class="thb tsb'+(on?" on":"")+'" data-set="fs:'+x[0]+'" aria-pressed="'+on+'"><svg class="tsa" viewBox="0 0 44 26" aria-hidden="true"><text x="22" y="20" text-anchor="middle" font-size="'+(x[0]?Math.round(17*x[0]/100):17)+'" font-weight="700" fill="currentColor">Aa</text></svg>'+x[1]+'</button>'; }).join("")+'</div><p class="info-d">Makes the text of the sheet and the builder smaller or larger. Buttons and boxes keep their places.</p>';
  h+='<div class="info-h">Color-blind Mode</div><div class="thg">'+setBtnI("cb","","Off","ui-close")+setBtnI("cb","1","On","ui-eye")+'</div><p class="info-d">For red and green color blindness. Good and bad use blue and orange, low Hit Points get a striped bar, and failed death saves show a cross, so color is never the only sign.</p>';
  h+='<div class="info-h">High Contrast</div><div class="thg">'+hcBtn("auto","Auto","ui-auto")+hcBtn("on","On","ui-contrast")+hcBtn("off","Off","ui-close")+'</div><p class="info-d" id="hcNote">'+hcNote()+'</p>'+miSetH();/* v35 p01, v55 */
  h+='<div class="info-h">Keyboard</div><div class="thg thgw"><button type="button" class="thb thbi" data-keysopen="1">'+ico("ui-keys")+'Keyboard Shortcuts</button></div><p class="info-d">On a computer: 1 to 7 switch tabs, H heals, D takes damage, R rests, and / searches. Press ? on the sheet to see them all.</p>';
  h+=snSetH();/* v32 p33 */
  h+='<h3 class="set-h">Help</h3><div class="thg"><button type="button" class="btn press" data-hlearn="tour">Tour the app</button><button type="button" class="btn press" data-tmopen="1">History</button><button type="button" class="btn press" data-hlearn="1">Learn to play D&amp;D</button><button type="button" class="btn press" data-cheat="1">Table cheat sheet</button><button type="button" class="btn press" data-wdopen="1">Which die do I roll?</button><button type="button" class="btn press" aria-pressed="'+(!!(typeof __R.coachGet==="function"&&__R.coachGet().on))+'" data-coach="1">Coach mode: '+((typeof __R.coachGet==="function"&&__R.coachGet().on)?"on":"off")+'</button></div>';/* T11 U52, U3, U7, U47 */
  return h; }
function setBtnI(k,v,label,ik){ const on=setOf(k)===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" data-set="'+k+':'+v+'" aria-pressed="'+on+'">'+ico(ik)+label+'</button>'; }
function applyLook2(){ const R=document.documentElement; [["data-frame",S.frame],["data-bdrop",S.bdrop],["data-abtop",setOf("ab")],["data-oneh",setOf("oneh")],["data-tsize",setOf("fs")],["data-cb",setOf("cb")]].forEach((a) =>{ if(a[1]) R.setAttribute(a[0],a[1]); else R.removeAttribute(a[0]); }); try{ __R.wakeApply(); }catch(er){} }
/* carrying capacity by size (PHB 2024 Rules Glossary), Powerful Build one size larger */
function hasFeatN(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((f) =>{ return f.n===n; }); }); }
function carryOf(str){ const SIZES=["Tiny","Small","Medium","Large","Huge","Gargantuan"], SIZE_MUL={Tiny:7.5,Small:15,Medium:15,Large:30,Huge:60,Gargantuan:120}, sz=String(C.size||""), s=SIZES.filter((z) =>{ return sz.indexOf(z)>=0; })[0]||"Medium", pb=hasFeatN("Powerful Build")||!!C.carryBump/* fx carryBump: any source that counts you as one size larger */, s2=pb?SIZES[Math.min(5,SIZES.indexOf(s)+1)]:s;
  const bear=(C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n==="Aspect of the Beast"&&/\*\*Your choice\.\*\*\s*Bear/.test(String(i.d||"")); }); }), mul=bear?2:1;/* v102: Totem Warrior (2014), Aspect of the Beast: Bear doubles carrying capacity */
  return {v:SIZE_MUL[s2]*mul*str, m:SIZE_MUL[s2]*mul, s:s, pb:pb, bear:bear}; }
/* spells listed again at higher slot levels */
export function spUpOn(){ return setOf("spUp")==="1"; }
export function spUpMax(){ return ((C.spellcasting||{}).slots||[]).length; }
export function spUpOk(x){ return !!x.l&&!x.itc&&!spPact(x)&&!/Long Rest|At will/.test(x.use||"")&&/Higher-Level Spell Slot/.test(x.full||""); }

