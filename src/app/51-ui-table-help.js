import {bindLive} from "./00a-reg-late-ports.js";import {ABN} from "./02-data-default-character.js";
import {C,FROZEN} from "./04-logic-storage.js";
import {esc,num,sg,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {uiGet} from "./07-ui-theme-contrast-spring.js";
import {LEARN_LINK,__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {uiSet} from "./15c-logic-file-state-compress.js";
import {RB_AB} from "./50-logic-reverse-builder.js";
import {env} from "./00-env.js";
bindLive("cheatOpen",{get:function(){return cheatOpen;}});
bindLive("coachGet",{get:function(){return coachGet;}});
bindLive("coachLine",{get:function(){return coachLine;}});
bindLive("wdOpen",{get:function(){return wdOpen;}});
/* T11 Learn U7, U3, U47: help at the table, made from the character's own numbers.
   U7 "Which die do I roll?": pick what you are doing, get the die and the bonus of this character.
   U3 table cheat sheet: one short page for a running session (your turn, the actions, your numbers, a few rules).
   U47 coach mode (Settings, off by default): the first time a kind of rule is opened on the sheet, one plain sentence explains it
   above the panel, with the Learn this link. Each sentence shows once (cs-coach {on, seen}). No reminders, no streaks (U30). */
function wdRows(){ const r=[], at=C.attacks||[];
  at.forEach((a,i) =>{ const d=D.atk&&D.atk[i]; if(!d) return; r.push({g:"Attack",t:a.n,d:"1d20 "+sg(d.hit),n:"To hit: reach the target's Armor Class"}); if(d.dmg) r.push({g:"Damage",t:a.n,d:String(d.dmg),n:"Only after a hit. A Critical Hit (20) rolls these dice twice"}); });
  if(C.spellcasting) r.push({g:"Spell",t:"Spell attack",d:"1d20 "+sg(D.dc-8),n:"For spells that make an attack roll"},{g:"Spell",t:"Spell save DC",d:"Others roll against "+D.dc,n:"You do not roll: the target makes the save"});
  RB_AB.forEach((k) =>{ if(D.save&&D.save[k]!=null) r.push({g:"Saving throw",t:ABN[k]+" save",d:"1d20 "+sg(D.save[k]),n:"When an effect says to make a "+ABN[k]+" saving throw"}); });
  (C.skills||[]).forEach((s,i) =>{ if(D.skill&&D.skill[i]!=null) r.push({g:"Check",t:s.n,d:"1d20 "+sg(D.skill[i]),n:"When the DM asks for a "+s.n+" check"}); });
  r.push({g:"Fight",t:"Initiative",d:"1d20 "+sg(D.init),n:"Once, when a fight starts"},{g:"Fight",t:"Death save",d:"1d20",n:"Only at 0 Hit Points, at the start of your turn. 10 or more is a success"});
  const hd=num(C.hitDie,10), cm=D.mod&&D.mod.CON||0; r.push({g:"Rest",t:"Hit Point Die",d:"1d"+hd+" "+sg(cm),n:"During a Short Rest, to heal"});
  return r; }
function wdOpen(){ __set_navStack([]); const rows=wdRows(), gs=[]; rows.forEach((x) =>{ if(gs.indexOf(x.g)<0) gs.push(x.g); });
  openSheet("Which die do I roll?",'<p class="bk-f">Pick what you are doing. The die and the bonus come from '+esc(C.name||"your character")+'.</p><div class="wd-g" role="group" aria-label="What are you doing?">'+gs.map((g,i) =>{ return '<button type="button" class="lib-chip'+(i?'':' on')+'" data-wdg="'+esc(g)+'">'+esc(g)+'</button>'; }).join("")+'</div><div class="wd-l">'+wdList(rows,gs[0])+'</div>',"wd"); }
function wdList(rows,g){ return rows.filter((x) =>{ return x.g===g; }).map((x) =>{ return '<div class="wd-r"><b>'+esc(x.t)+'</b><span class="wd-d">'+esc(x.d)+'</span><small>'+esc(x.n)+'</small></div>'; }).join(""); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-wdg],[data-wdopen],[data-cheat]"); if(!b) return;
  if(b.hasAttribute("data-wdopen")){ wdOpen(); return; } if(b.hasAttribute("data-cheat")){ cheatOpen(); return; }
  const g=b.getAttribute("data-wdg"); Array.prototype.forEach.call(document.querySelectorAll("#sheetBody [data-wdg]"),(x) =>{ x.classList.toggle("on",x===b); }); const l=document.querySelector("#sheetBody .wd-l"); if(l) l.innerHTML=wdList(wdRows(),g); });
function cheatOpen(){ __set_navStack([]); const sp=C.spellcasting?'<div><dt>Spell save DC</dt><dd>'+D.dc+'</dd></div><div><dt>Spell attack</dt><dd>'+sg(D.dc-8)+'</dd></div>':'';
  const acts=[["Attack","One attack, more with Extra Attack"],["Dash","Extra movement equal to your Speed"],["Disengage","Moving does not trigger Opportunity Attacks this turn"],["Dodge","Attacks against you have Disadvantage"],["Help","A friend gets Advantage on one roll"],["Hide","Stealth check, DC 15, out of sight"],["Influence","Talk someone into something"],["Magic","Cast a spell or use a magic item"],["Ready","Act later, when a trigger happens"],["Search","Look for something, Wisdom check"],["Study","Recall or work out something, Intelligence check"],["Utilize","Use an object"]];
  openSheet("Table cheat sheet",'<div class="cht"><section><h3>Your numbers</h3><dl class="cht-n"><div><dt>Armor Class</dt><dd>'+D.ac+'</dd></div><div><dt>Hit Points</dt><dd>'+D.hpmax+'</dd></div><div><dt>Initiative</dt><dd>'+sg(D.init)+'</dd></div><div><dt>Speed</dt><dd>'+esc(String(D.speed||C.speed||30))+' ft</dd></div><div><dt>Passive Perception</dt><dd>'+esc(String(D.pas_per!=null?D.pas_per:""))+'</dd></div><div><dt>Proficiency</dt><dd>'+sg(D.pb)+'</dd></div>'+sp+'</dl></section>'+
    '<section><h3>Your turn</h3><ul><li><b>Move</b> up to your Speed, split as you like</li><li><b>One action</b> from the list below</li><li><b>One Bonus Action</b>, only if a feature or spell gives one</li><li><b>One Reaction</b> per round, also on other turns</li><li>Free: talk a little, use one object such as opening a door</li></ul></section>'+
    '<section><h3>Actions</h3><dl class="cht-a">'+acts.map((a) =>{ return '<div><dt>'+a[0]+'</dt><dd>'+a[1]+'</dd></div>'; }).join("")+'</dl></section>'+
    '<section><h3>Rolls</h3><ul><li>d20 + bonus, reach the number (DC or Armor Class)</li><li>Advantage: roll 2, keep the higher. Disadvantage: keep the lower. Both: roll 1</li><li>Attack 20: Critical Hit, damage dice twice. Attack 1: miss</li><li>0 Hit Points: death save each turn, 10 or more is a success, three of either ends it</li></ul></section></div><p><button type="button" class="btn press" data-wdopen="1">Which die do I roll?</button></p>',"cheat"); }
/* U47 coach mode */
const COACH={rooftops:"An ability check is a d20 plus a bonus, against a number the DM sets (the DC).",green:"Each ability score gives a modifier. The modifier, not the score, goes on your rolls.",
  yard:"An attack roll must reach the target's Armor Class to hit. Damage is rolled only after a hit.",camp2:"A saving throw is a d20 plus a bonus to resist an effect. At 0 Hit Points you make death saves instead.",
  campsite:"Hit Points are how much harm you can take. A Short Rest or Long Rest brings them back.",forest:"On your turn you can move up to your Speed and take one action.",
  forest2:"A Bonus Action and a Reaction are small extra actions. You only have them when a feature or spell gives one.",cliff:"Advantage: roll two d20 and keep the higher. Disadvantage: keep the lower.",
  meadow:"A condition changes what you can do until it ends. Tap it to read what it does.",tower2:"Concentration lets you keep one spell going. Taking damage can break it.",tower1:"Spell slots pay for spells. Cantrips cost no slot."};
function coachGet(){ const o=uiGet("cs-coach"); if(!o.seen||typeof o.seen!=="object") o.seen={}; return o; }
function coachLine(title){ if(FROZEN) return ""; const o=coachGet(); if(!o.on) return ""; let t=String(title||"").replace(/<[^>]*>/g,""), k=null;
  for(let i=0;i<LEARN_LINK.length;i++) if(LEARN_LINK[i][0].test(t)){ k=LEARN_LINK[i][1]; break; } if(!k||!COACH[k]||o.seen[k]) return "";
  o.seen[k]=Date.now(); uiSet("cs-coach",o); return '<p class="coach" role="note"><b>Coach</b> '+esc(COACH[k])+'</p>'; }
function coachToggle(){ const o=coachGet(); o.on=o.on?0:1; uiSet("cs-coach",o); return o.on; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-coach]"); if(!b) return; const on=coachToggle(); b.setAttribute("aria-pressed",String(!!on)); b.textContent="Coach mode: "+(on?"on":"off"); toast(on?"Coach mode on. The first time you open a rule, one short line explains it.":"Coach mode off."); });
env.__whichDie=function(){ wdOpen(); }; env.__cheatOpen=function(){ cheatOpen(); };
