import {pluvennGrappleclawsControls} from './21m-ui-pluvenn-grappleclaws.js';
import {necronomiconReadingControls} from './21l-ui-necronomicon-reading.js';
import {slotRecoveryControls} from './21k-ui-slot-recovery.js';
import {storedSpellReceiptControls} from './08m-ui-stored-spell-casting.js';
import {spellGemReceiptControls} from './08l-ui-spell-gem-casting.js';
import {spellwroughtTattooControls} from './08k-ui-spellwrought-body.js';
import {turnDamageControls,turnDamageGuide} from './08f-ui-turn-damage.js';
import {supremeHealingControls} from './08g-ui-supreme-healing.js';
import {divineInterventionControls} from './08h-ui-divine-intervention.js';
import {ordersWrathControls} from './08i-ui-orders-wrath.js';
import {attackResourceDamageControls,syncAttackResourceDamageControls} from "./08e-ui-attack-resource-damage.js";
import {attackSelfDamageControls} from "./08d-ui-attack-self-damage.js";
import {env} from "./00-env.js";import {akIcon,ammoBonus,atkKind,bindLive,cfFlags,clsLvls,clsOfG,cuNm,dTxt,dtIcon,fch,featNums,foldP,ico,lateGet,manCost,modeXdRows,noActH,ordL,resBoxes,resOf,resPips,resSpec,resTail,saveCantripRows,scCls,scOf,sitAtk,sitCardH,sitDiceRows,spAreaTxt,spCalc,spFx,spLvRange,spRowLv,tyIcon} from "./00a-reg-late-ports.js";/* Responsibility: short text summaries (number blocks, pills) and the Actions page. Split out of the former single file 08 in SOLID stage 9 (S); runs in the same order as before. */
import {GLOSS,x14,x14n} from "./03-data-glossary.js";import {C,S} from "./04-logic-storage.js";import {$,$$,actOn,atkOn,temporarySpellOn,clamp,eqInvOf,eqOn,esc,rich,sg} from "./05-logic-helpers.js";import {D,fill,richP} from "./06-logic-derivation.js";import {boxes,used} from "./08-ui-render-sheet-and-actions.js";bindLive("__set_actF",{get:function(){return __set_actF;}});bindLive("actF",{get:function(){return actF;}});bindLive("featAll",{get:function(){return featAll;}});bindLive("renderActions",{get:function(){return renderActions;}});bindLive("syncLU",{get:function(){return syncLU;}});
function luSub(r){
  const left=r.max-used(r.k,r.max);
  /* RU27: Hit Dice rows always count, also with one die */
  if(r.max===1&&!/^hd(-d\d+)?$/.test(r.k)) return left ? "Ready" : r.reset==="none" ? "Expended" : "Expended until a "+(r.reset==="long"?"Long Rest":"Short or Long Rest");
  return left+" of "+r.max+" left";
}
export var actF="all";
export function shortX(n,g){ return (/^(Maneuvers known|Eldritch Invocations|Metamagic Options)$/.test(g||"")||n==="Paladin's Smite")&&MAN_SUM[n]?MAN_SUM[n]:""; }/* v41 p10 */
export function featAll(){ const o=[]; (C.features||[]).forEach((g,gi) =>{ (g.items||[]).forEach((f,fi) =>{ o.push({g:g.g,gi:gi,fi:fi,f:f,t:f.full||f.d||""}); }); }); return o; }
/* v35 p15 (RU129): card text is the short version, the popup has the full text. "At your level" is its own line */
/* v35 p15: numbers in short texts. "(DC 8 + PB + STR)", "(spell save DC)", "(DC 8 + PB + the ability you raised)" and "+ Fighter level" become the character's numbers */
function sumNums(t,cl){ const sc=scCls(cl), lv=clsLvls(), M=D.mod||{}, S0=t;
  t=t.replace(/\(DC 8 \+ PB \+ (STR|DEX|CON|INT|WIS|CHA)(?: or (STR|DEX|CON|INT|WIS|CHA))?\)/g,(m,a,b) =>{ return "DC "+(8+D.pb+Math.max(M[a]||0,b?(M[b]||0):-99)); });
  t=t.replace(/\(DC 8 \+ PB \+ the ability you raised\)/g,(m) =>{ const r=/\b(STR|DEX|CON|INT|WIS|CHA) \+[12]\b/.exec(S0); return r?"DC "+(8+D.pb+(M[r[1]]||0)):m; });
  t=t.replace(/\(spell save DC\)/g,(m) =>{ return sc&&sc.dc?"DC "+sc.dc:m; });
  t=t.replace(/\(Superiority Die\)/g,() =>{ const f=lv.Fighter||D.level; return "1d"+(f>=18?12:f>=10?10:8); });/* v35 p18 */
  return t.replace(/\+ (Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard) level\b/g,(m,c) =>{ return lv[c]?"+ "+lv[c]:m; }); }
export function aylSplit(t,cl){ t=sumNums(String(t||""),cl); const m=/\s*\*\*At your level:\*\*\s*([^]*?)\s*$/.exec(t); return m?{t:t.slice(0,m.index).replace(/\s+$/,""),a:m[1].replace(/\.$/,"")}:{t:t,a:""}; }
/* v35 p17 (RU129, card design): short text becomes number blocks. Label on top, big number below, Fail and Success chips, footer.
   Numbers come from the computed short text (sumNums) and from spCalc for spells. Classes .sum, .sum-p, .sum-ks, .sum-k, .sum-l, .sum-n, .sum-o, .sum-m stay stable for later skins */
const SUM_PILL={"Action":"time-action","Bonus Action":"time-bonus","Reaction":"time-reaction","On hit":"ui-target"};
const SUM_COND=["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
const SUM_DT="Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder";
export function sumParse(t){ let s=String(t||""), o={p:"",k:[],o:[],m:[],yc:"",rest:""}, m;
  const yi=s.search(/\s*\*\*Your choice\.\*\*/); if(yi>=0){ o.yc=s.slice(yi).trim(); s=s.slice(0,yi); } const s0=s;
  m=/(^|\.\s+)(Bonus Action|Reaction|Magic action|Action)\b(:?)\s*/.exec(s); if(m){ o.p=m[2]==="Magic action"?"Action":m[2]; if(m[3]) s=s.slice(0,m.index+m[1].length)+s.slice(m.index+m[0].length); }
  if(!o.p&&/\bhit\b[^.]*\b(spend|Target)\b|\bafter a melee hit\b|\bSneak Attack hit\b|\bon a [^.]*\bhit\b/i.test(s)) o.p="On hit";
  m=new RegExp("Target (STR|DEX|CON|INT|WIS|CHA) save DC (\\d+)\\. Fail: ([^.]*)\\.(?: Success: ([^.]*)\\.)?").exec(s);
  if(m){ let fail=m[3], dm=new RegExp("^(\\d+d\\d+(?: ?\\+ ?\\d+)?) (?:damage of your ancestry type|("+SUM_DT+")(?: damage)?)(.*)$").exec(fail);
    if(dm){ o.k.push({l:"Damage",n:dm[1].replace(/ /g,""),t:dm[2]||"ancestry type"}); fail="full damage"+dm[3]; }
    o.k.unshift({l:"Save",n:m[1]+" "+m[2],ab:m[1]}); o.o.push({f:1,t:fail}); if(m[4]) o.o.push({f:0,t:m[4]}); s=s.replace(m[0],""); }
  m=/\bheal (\d+d\d+(?: ?\+ ?\d+)?)\.?/i.exec(s); if(m){ o.k.push({l:"Heal",n:m[1].replace(/ /g,"")}); s=s.replace(m[0],""); }
  o.s0=s0;
  const sen=s.split(/(?<=\.)\s+/).map((x) =>{ return x.trim(); }).filter((x) =>{ return x&&x!=="."; }), keep=[];
  sen.forEach((x) =>{ const dm=/^Damage (\+?\d+d\d+)\s*(.*)$/.exec(x);
    if(dm){ o.k.unshift({l:"Damage",n:dm[1]}); const tl=dm[2].replace(/\.$/,"").replace(/^[,;:]\s*/,"").trim(); if(tl) keep.push(tl.replace(/^./,(c) =>{ return c.toUpperCase(); })+"."); return; }
    if(/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal|Large or smaller|Medium or smaller|Huge or smaller|Weapon or Unarmed Strike|Melee, weapon)/.test(x)) o.m.push(x.replace(/\.$/,"")); else keep.push(x); });
  if(!o.k.length) return null;
  o.rest=keep.join(" ").replace(/^[,:;]\s*/,"").replace(/^./,(c) =>{ return c.toUpperCase(); });
  if(!/[A-Za-z]{3}/.test(o.rest)) o.rest=s0.split(/(?<=\.)\s+/).filter((x) =>{ return !/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal)/.test(x.trim()); }).join(" ").trim();/* the short sentence is never empty */
  return o; }
/* card short sentence: 14 px, main text color, up to 3 lines, no Show more (the popup has the full text). Your choice stays visible under it */
export function sumText(t,cl){ let s=String(t||""), yi=s.search(/\s*\*\*Your choice\.\*\*/), yc=yi>=0?s.slice(yi).trim():""; if(yi>=0) s=s.slice(0,yi);
  return '<p class="sum-d sum-c">'+featNums(richP(fill(s)),cl)+'</p>'+(yc?'<p class="sum-d">'+fch(richP(fill(yc)))+'</p>':''); }
export function sumPill(p){ return p?'<span class="sum-p">'+ico(SUM_PILL[p]||"act-action","sum-i")+'<span>'+esc(p)+'</span></span>':""; }
function sumLab(k){ const i=k.l==="Damage"?(k.t&&lateGet("DT_ICON")[k.t]?dtIcon(k.t):ico("ui-dice","sum-i")):k.l==="Save"?ico("ab-"+String(k.ab||"str").toLowerCase(),"sum-i"):k.l==="Heal"?ico("hp-heal","sum-i sum-heal"):k.l==="To hit"?ico("ui-target","sum-i"):ico("ui-range","sum-i");
  return '<small class="sum-l">'+i+'<span>'+esc(k.l)+'</span></small>'; }
function sumFoot(x){ const k=/Short Rest/.test(x)?"rest-short":/Long Rest/.test(x)?"rest-long":/Mastery/.test(x)?"item-weapon":/\barea\b|Sphere|Cone|Cube|Line|Cylinder|Emanation/.test(x)?"ui-area":/smaller|larger/.test(x)?"ui-users":/Weapon|weapon|Unarmed/.test(x)?"item-weapon":/\bft\b|feet|Touch|Self|mile/.test(x)?"ui-range":"ui-info"; return '<span>'+ico(k,"sum-i")+'<span>'+esc(x)+'</span></span>'; }
function sumChip(c){ const cd=SUM_COND.filter((n) =>{ return new RegExp("\\b"+n+"\\b").test(c.t); })[0];
  return '<span class="sum-'+(c.f?'f':'s')+'">'+ico(c.f?(cd?"cond-"+cd.toLowerCase():"hp-damage"):"ui-shield","sum-i")+'<b>'+(c.f?"Fail":"Success")+'</b> '+esc(c.t)+'</span>'; }
/* v36 p11: cards that stand for an attack read To hit and Damage from the attack rows (C.attacks, D.atk) */
function fatkRows(f){ const o=[]; (C.attacks||[]).forEach((a,i) =>{ if(!atkOn(a)||!D.atk[i]) return; if(f(a)) o.push({a:a,d:D.atk[i]}); }); return o; }
const FATK={
 "Pole Strike":{p:"Bonus Action",s:"After the Attack action, hit with the other end of your polearm.",f:function(a){ return /^Pole Strike/.test(a.n); }},
 "Reactive Strike":{p:"Reaction",s:"A creature enters your reach. Make one melee attack against it.",f:function(a){ const of=(C.attacks||[]).filter((r) =>{ return /^Pole Strike/.test(r.n); }).map((r) =>{ return r.of; }); return of.indexOf(a.n)>=0; }},
 "Push":{p:"",s:"When an Unarmed Strike hits during the Attack action, you also push the target 5 ft. Once per turn.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Enhanced Dual Wielding":{p:"Bonus Action",s:"After attacking with a Light weapon, attack again with a different one-handed melee weapon. No ability modifier on damage unless it is negative.",nomod:1,f:function(a){ return a.n!=="Unarmed Strike"&&!a.act&&atkKind(a)==="melee"&&!/Two-Handed/.test(a.sub||""); }},
 "Charge Attack":{p:"",s:"Move 10 ft straight at a target, then hit it with a melee attack in the Attack action. Add 1d8 damage, or push it up to 10 ft. Once per turn.",k:[{l:"Damage",n:"+1d8"}],m:["Or push the target 10 ft (size up to one larger than you)"]},
 "Flurry of Blows":{p:"Bonus Action",s:"Spend 1 Focus Point to make two Unarmed Strikes.",s14:"Spend 1 ki point to make two Unarmed Strikes.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Bonus Unarmed Strike":{p:"Bonus Action",s:"After the Attack action with a Monk weapon or Unarmed Strike, make one Unarmed Strike.",f:function(a){ return a.n==="Unarmed Strike"; }}
};
function fatkSum(n){ const F=FATK[n]; if(!F) return null; const rows=F.f?fatkRows(F.f):[], o={p:F.p||"",k:(F.k||[]).slice(),o:[],m:(F.m||[]).slice(),yc:"",rest:(C.rs==="2014"&&F.s14)||F.s,r:[]};
  const dm=function(r){ const t=String(r.d.dmg); return F.nomod?t.replace(/\+\d+$/,""):t; };
  if(rows.length===1){ const r=rows[0]; o.k.unshift({l:"To hit",n:sg(r.d.hit),t:r.a.of||r.a.n},{l:"Damage",n:dm(r),t:r.a.type||""}); }
  else if(rows.length>1) o.r=rows.slice(0,4).map((r) =>{ return {w:r.a.of||r.a.n,h:sg(r.d.hit),d:dm(r),t:r.a.type||""}; });
  return o; }
function sumRows(rs){ return '<div class="sum-rows">'+rs.map((r) =>{ return '<div class="sum-row"><span class="sum-rn">'+esc(r.w)+'</span><span class="sum-rc"><small>To hit</small><b>'+esc(r.h)+'</b></span><span class="sum-rc"><small>Damage</small><b>'+esc(r.d)+'</b>'+tyIcon(r.t)+'</span></div>'; }).join("")+'</div>'; }
export function sumH(o,cl,yc){ return '<div class="sum">'+(o.rest?'<p class="sum-d sum-c">'+featNums(richP(fill(o.rest)),cl)+'</p>':'')+'<div class="sum-ks">'+o.k.map((k) =>{ return '<div class="sum-k">'+sumLab(k)+'<span class="sum-n">'+esc(k.n)+(k.t?'<em class="sum-t">'+esc(k.t)+'</em>':'')+'</span></div>'; }).join("")+'</div>'+(o.r&&o.r.length?sumRows(o.r):'')+
  (o.o.length?'<div class="sum-o">'+o.o.map(sumChip).join("")+'</div>':'')+
  (o.m.length?'<div class="sum-m">'+o.m.map(sumFoot).join("")+'</div>':'')+(o.yc?'<p class="sum-d">'+fch(richP(fill(o.yc)))+'</p>':'')+'</div>'; }
/* spell popup: the same blocks from spCalc and the spell row numbers */
export function spSum(x){
 const {c, o, full}=spSumStep1(x);
  if(!o.k.length) return "";
  spSumStep2(x, o, c, full);
  return '<div class="sum-sp">'+sumPill(o.p)+sumH(o,"")+'</div>'; }
function spSumStep1(x){
const sc=scOf(x), rg=spLvRange(x), lv=clamp(lateGet("spLvSel")[x.n]!=null?lateGet("spLvSel")[x.n]:spRowLv(x),rg[0],rg[1]), c=spCalc(x,lv,D.level,sc.mod), o={p:"",k:[],o:[],m:[]}, full=String(x.full||x.sum||"");
  o.p=/^Bonus/.test(x.ct)?"Bonus Action":/^Reaction/.test(x.ct)?"Reaction":/^Action/.test(x.ct)?"Action":"";
  if(x.sv==="ATK") o.k.push({l:"To hit",n:sg(sc.atk)}); else if(x.sv) o.k.push({l:"Save",n:x.sv+" "+sc.dc,ab:x.sv});
  if(c&&c.parts.length){ const p=c.parts[0], ty=String(p.t).split("|"); o.k.push({l:"Damage",n:(c.n>1?c.n+"× ":"")+p.d,t:ty.length>1?"choice":dTxt(ty[0])}); }
  else if(c&&c.heal) o.k.push({l:"Heal",n:c.heal});
  return /** @type {any} */ ({c, o, full});
}
function spSumStep2(x, o, c, full){
  if(x.sv&&x.sv!=="ATK"){ const cd=SUM_COND.filter((n) =>{ return new RegExp("\\b(has|have|gains?) the "+n+" condition|\\b"+n+" condition").test(full); })[0];
    if(c&&c.parts.length) o.o.push({f:1,t:"full damage"+(cd?", "+cd:"")}); else if(cd) o.o.push({f:1,t:cd});
    if(/half as much damage|half damage/i.test(full)) o.o.push({f:0,t:"half damage"}); }
  if(x.r) o.m.push(String(x.r).replace(/ ft$/," ft")); const fx=spFx(x); if(fx&&fx.area) o.m.push(fx.area[0]+" "+spAreaTxt(fx.area).replace(/\.$/,""));
}

export function aylH(a,cls){ return a?'<p class="fayl"><strong>At your level:</strong> '+featNums(rich(fill(a)),cls)+'.</p>':""; }
function actKind(t){ if(/\bas a Bonus Action\b|^As a Bonus Action|\bBonus Action to\b|\bBonus Action\b,? (?:you|choose)/i.test(t)) return "bonus"; if(/\btake a Reaction\b|\bas a Reaction\b|\bReaction\b to /.test(t)) return "reaction"; if(/\bAs a Magic action\b|\bas a Magic action\b|\bAs an action\b/i.test(t)) return "action"; if(/\bOnce per turn when you hit\b|when you hit a creature/i.test(t)) return "action"; return ""; }
function actItem(x,chip){ const rl=resOf(x.f.n), r=rl[0], cs=aylSplit(shortX(x.f.n,x.g)||x.f.d||x.t,clsOfG(x.g)), so=fatkSum(x.f.n)||sumParse(cs.t);/* v35 p17, v36 p11 */
  return '<div class="aitem"><h4><button type="button" class="tx" data-info="f:'+x.gi+'.'+x.fi+'">'+esc(x.f.n)+'</button>'+(so&&so.p?sumPill(so.p):(chip?' <span class="muted">('+chip+')</span>':''))+(so&&r?resPips(rl):'')+'</h4>'+(so?sumH(so,clsOfG(x.g))+aylH(cs.a,clsOfG(x.g)):'')+(so?'':(function(){ return x.f.full?sumText(cs.t,clsOfG(x.g))+aylH(cs.a,clsOfG(x.g)):foldP(richP(fill(cs.t)),"a:"+x.gi+"."+x.fi,cs.t,!!x.f.full||!!shortX(x.f.n,x.g))+aylH(cs.a,clsOfG(x.g)); })())+(r?resTail(rl,so):'')+'</div>'; }
export function spellsBy(re){ return (C.spells||[]).map((x,i) =>{return [x,i]}).filter((p) =>{return temporarySpellOn(p[0])&&re.test(p[0].ct)}); }
function spLine(ps){ return ps.length?'<h4 class="asub">Spells</h4><div class="aline">'+ps.map((p) =>{const x=p[0];return '<button type="button" class="tx" data-info="sp:'+p[1]+'"><i>'+esc(x.n)+'</i></button>'+(x.conc?' <span class="ctag">C</span>':'')+(x.rit?' <span class="ctag rit">R</span>':'')+' <small class="muted">('+(x.l?ordL(x.l).replace(" Level","").toUpperCase():"CANTRIP")+')</small>'}).join("<br>")+'</div>':''; }
function combat(list){ if(x14()) list=list.filter((n) =>{ return n!=="Influence"&&n!=="Study"; }).map(x14n);/* v94: 2014 has no Influence or Study action */ const ln=list.map((n,i) =>{return '<span class="acx">'+(GLOSS[n]?'<button type="button" class="tx" data-info="g:'+n+'">'+n+'</button>':n)+(i<list.length-1?',':'')+'</span>'}).join(" ");/* v35 p09 *//* v31 C4: a long list folds */
  if(list.length<=3) return '<div class="acomb short"><h4 class="asub">'+ico("act-free","aci")+'Actions in Combat</h4><div class="aline noico">'+ln+'</div></div>';
  const op=!!lateGet("FOPEN").combat; return '<div class="acomb'+(op?' open':'')+'"><button type="button" class="acomb-t press" data-fmore="combat" aria-expanded="'+op+'">'+ico("act-free","aci")+'<span class="acw"><span class="asub">Actions in Combat</span><small>'+list.length+' actions anyone can take</small></span>'+ico("ui-chev-d","fmi")+'</button><div class="aline noico"'+(op?'':' hidden')+'>'+ln+'</div></div>'; }
/* v32 RL51: actions from C.acts (feats, features, species, invocations, maneuvers, magic items). A feature named in its group's ak list uses only
   C.acts; other features (old sheets, hand-added ones) keep the old text rule. Attack rows with act "bonus" or "reaction" show in that part */
function actFeat(g,n){ let r=null; featAll().some((x) =>{ if(x.f.n===n&&(g==null||x.g===g)){ r=x; return true; } return false; }); return r; }
const CMAP={"Actions":"action","Bonus Actions":"bonus","Reactions":"reaction","Other":"other"};
/* v35 p18 (user decision, option A): an On Hit group under Actions. It holds effects used when an attack hits, with no action of their own.
   The book text decides: the first sentences name a hit as the trigger and no Bonus Action, Reaction, or Magic action cost */
const ONHIT_RX=/\b(after your attack roll[^.]{0,60}\bhits\b|after you hit\b|when(?:ever)? you hit\b|if you hit\b|(?:if|when|whenever|each time) (?:an|your|the|that) [^.]{0,90}?\bhits\b|the attack hits\b|whenever your Sneak Attack deals damage)/i;
const ONHIT_NO=/\b(?:take|takes|as|use|using) a (?:Bonus Action|Reaction|Magic action)\b|\bYou can take a Bonus Action\b|\bas part of the Attack action\b|\battack roll misses\b|\bmisses you\b/i;
function actHit(t){ const s=String(t||"").replace(/\*\*[^*]{1,60}\*\*\s*/g,"").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,a,b) =>{ return b||a; }), sen=s.split(/(?<=\.)\s+/), f2=sen.slice(0,2).join(" ");
  return ONHIT_RX.test(f2)&&!ONHIT_NO.test(sen[0]||""); }
/* short texts for maneuvers used on a hit (own words, PHB 2024). "(Superiority Die)" becomes the die for the Fighter level */
var MAN_SUM={"Paladin's Smite":"Bonus Action: right after you hit with a melee weapon or an Unarmed Strike, cast Divine Smite. Damage 2d8 Radiant. Add 1d8 against a Fiend or an Undead, and 1d8 per slot level above 1. Free once per Long Rest, then it needs a slot.","Bait and Switch":"Swap places with a willing creature within 5 ft (uses 5 ft of your movement, no Opportunity Attacks). Roll the die. You or that creature adds the result to AC until your next turn starts.","Commander's Strike":"Give up one attack in the Attack action. A willing ally that sees or hears you attacks once with its Reaction and adds the die to damage on a hit. Damage +(Superiority Die).","Feinting Attack":"Bonus Action: feint at a creature within 5 ft. Your next attack roll against it this turn has Advantage, and a hit adds the die to damage. Damage +(Superiority Die).","Lunging Attack":"Bonus Action: take the Dash action. This turn, a melee hit in the Attack action right after moving 5 ft or more in a straight line adds the die. Damage +(Superiority Die).","Rally":"Bonus Action: an ally within 30 ft that sees or hears you gains Temporary Hit Points equal to the die roll plus half your Fighter level (round down).","Riposte":"Reaction: when a creature misses you with a melee attack, strike back with a melee attack and add the die to damage on a hit. Damage +(Superiority Die).","Agonizing Blast":"Level 2+. Pick a Warlock damage cantrip you know. Add your Charisma modifier to its damage. Repeatable with a different cantrip.","Eldritch Smite":"Level 5+, Pact of the Blade. When your pact weapon hits, once per turn, expend a Pact Magic slot: +1d8 Force plus 1d8 per slot level. Huge or smaller: you can knock it Prone.","Eldritch Spear":"Level 2+. Pick a Warlock damage cantrip with range 10 ft or more. Add 30 ft of range per Warlock level. Repeatable with a different cantrip.","Fiendish Vigor":"Level 2+. Cast False Life on yourself with no slot. Skip the roll and take the highest Temporary Hit Points the die can give.","Gaze of Two Minds":"Level 5+. Bonus Action: touch a willing creature and perceive through its senses until the end of your next turn. Renew each turn with a Bonus Action. You gain its special senses. Within 60 ft you can cast spells from its space.","Gift of the Depths":"Level 5+. Your Speed is also your Swim Speed, and you breathe underwater. Cast Water Breathing once per Long Rest with no slot.","Gift of the Protectors":"Level 9+, Pact of the Tome. Creatures can sign your Book of Shadows page, up to your Charisma modifier (min 1). A signer dropped to 0 HP (not killed outright) stays at 1 HP. Once per Long Rest. A Magic action erases a name.","Investment of the Chain Master":"Level 5+, Pact of the Chain. Your Find Familiar familiar gets a 40 ft Fly or Swim Speed, a Bonus Action to command Attack, Necrotic or Radiant damage, your spell save DC, and a Reaction to give it Resistance to damage it takes.","Lessons of the First Ones":"Level 2+. Gain one Origin feat of your choice. Repeatable with a different feat.","Lifedrinker":"Level 9+, Pact of the Blade. When your pact weapon hits, once per turn: +1d6 Necrotic, Psychic, or Radiant. You can also spend a Hit Point Die and regain HP equal to the roll plus Constitution modifier (min 1).","Pact of the Blade":"Bonus Action: conjure a pact weapon (any Simple or Martial Melee weapon) or bond with a magic weapon. You are proficient with it, it is a Spellcasting Focus, and you can use Charisma for its attack and damage. Damage can be Necrotic, Psychic, or Radiant.","Pact of the Chain":"Know Find Familiar and cast it as a Magic action with no slot, with special forms such as Imp, Pseudodragon, Quasit, Sprite, or Venomous Snake. Give up one of your attacks so the familiar attacks with its Reaction.","Pact of the Tome":"After a Short or Long Rest, conjure a Book of Shadows with three cantrips and two level 1 Ritual spells from any class list. They are prepared Warlock spells for you. The book is your Spellcasting Focus.","Repelling Blast":"Level 2+. Pick a Warlock cantrip that needs an attack roll. When it hits a Large or smaller creature, push it up to 10 ft straight away from you. Repeatable with a different cantrip.","Thirsting Blade":"Level 5+, Pact of the Blade. Extra Attack with your pact weapon: two attacks per Attack action.","Careful Spell":"Cost: 1 Sorcery Point. When a spell forces saves, pick up to your Charisma modifier (min 1) creatures. They succeed automatically, and take no damage if they would take half on a success.","Empowered Spell":"Cost: 1 Sorcery Point. Reroll up to your Charisma modifier (min 1) of a spell's damage dice and use the new rolls. Works with another Metamagic option on the same spell.","Extended Spell":"Cost: 1 Sorcery Point. Double the duration of a spell that lasts 1 minute or longer, up to 24 hours. You have Advantage on saves to keep Concentration on it.","Quickened Spell":"Cost: 2 Sorcery Points. Cast a spell with an Action casting time as a Bonus Action. Not if you already cast a level 1+ spell this turn, and no level 1+ spell after it this turn.","Seeking Spell":"Cost: 1 Sorcery Point. Reroll a missed spell attack roll and use the new d20. Works with another Metamagic option on the same spell.","Subtle Spell":"Cost: 1 Sorcery Point. Cast a spell with no Verbal, Somatic, or Material components. Material components that are consumed or have a cost are still required.","Trip Attack":"Add the die to damage and try to knock the target down. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: Prone. Large or smaller. Weapon or Unarmed Strike.",
 "Pushing Attack":"Add the die to damage and drive the target back. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: pushed up to 15 ft away. Large or smaller. Weapon or Unarmed Strike.",
 "Disarming Attack":"Add the die to damage and try to disarm the target. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: drops one held object you choose.",
 "Goading Attack":"Add the die to damage and goad the target into attacking you until the end of your next turn. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Disadvantage vs others.",
 "Menacing Attack":"Add the die to damage and try to frighten the target. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Frightened until the end of your next turn.",
 "Distracting Strike":"Add the die to damage and leave the target open. Damage +(Superiority Die). The next attack roll by someone else against it before your next turn has Advantage.",
 "Maneuvering Attack":"Add the die to damage and move an ally. Damage +(Superiority Die). A willing ally who sees or hears you uses its Reaction to move up to half its Speed without provoking the target.",
 "Sweeping Attack":"Hit a second creature within your reach and 5 ft of the first target, if the original roll would hit it. Damage (Superiority Die), same damage type. Melee, weapon or Unarmed Strike."};
env.__MANSUM=MAN_SUM;/* the maneuver summaries, shown in the builder choice list */

export function actSplit(feats){
 const {kinds, ak}=actSplitStep1(feats);
  actSplitStep2(feats, kinds, ak);
  return kinds; }
function actSplitStep1(feats){
const kinds={action:[],onhit:[],bonus:[],reaction:[],other:[]}, ak={}, ents=Array.isArray(C.acts)?C.acts:[];
  (C.features||[]).forEach((g) =>{ (Array.isArray(g.ak)?g.ak:[]).forEach((n) =>{ ak[g.g+"|"+n]=1; }); });
  feats.forEach((x) =>{ if(/^Background/.test(x.g)) return; const hasRes=resOf(x.f.n).length>0;
    if(ak[x.g+"|"+x.f.n]){ const mine=ents.filter((e) =>{ return !e.it&&e.f===x.f.n&&e.g===x.g; }); mine.forEach((e) =>{ if(kinds[e.k]) kinds[e.k].push({e:e,x:x}); }); if(!mine.length&&hasRes) kinds.other.push({x:x}); return; }
    const hw=(C.actions||[]).filter((a) =>{ return a.n===x.f.n&&CMAP[a.c]; })[0]; if(hw){ kinds[CMAP[hw.c]].push({x:x}); return; }/* a hand-written entry of the same name sets the category */
    const k=actKind(x.t); if(k) kinds[k].push({x:x}); else if(hasRes) kinds.other.push({x:x}); });
  ents.forEach((e) =>{ if(!e.it||!kinds[e.k]) return; const i=eqInvOf(e.it); if(i&&!eqOn(i)) return; kinds[e.k].push({e:e}); });
  return /** @type {any} */ ({kinds, ak});
}
function actSplitStep2(feats, kinds, ak){
  /* v35 p18: On Hit. Effects already listed under Action or Other move when their text says a hit triggers them; class, subclass, species and
     feat features with no group yet join when the text says the same */
  ["action","other"].forEach((k) =>{ kinds[k]=kinds[k].filter((o) =>{ if(o.e&&o.e.it) return true; const t=o.e?(o.e.d!=null?o.e.d:(o.x?o.x.t:"")):o.x.t; if(actHit(t)){ kinds.onhit.push(o); return false; } return true; }); });
  const seen={}; ["action","onhit","bonus","reaction","other"].forEach((k) =>{ kinds[k].forEach((o) =>{ if(o.x) seen[o.x.gi+"."+o.x.fi]=1; }); });
  feats.forEach((x) =>{ if(/^Background/.test(x.g)||seen[x.gi+"."+x.fi]||ak[x.g+"|"+x.f.n]) return; if(actHit(x.t)) kinds.onhit.push({x:x}); });
}
function actEnt(e,x,chip){
 const {rl}=actEnt2Step1(e);
  if(e.it){ const ix=(C.inv||[]).findIndex((i) => actEntFn1(e, i));
    return '<div class="aitem" data-act="'+e.k+'"><h4>'+(ix>=0?'<button type="button" class="tx" data-info="it:'+ix+'">'+esc(e.n)+'</button>':esc(e.n))+' <span class="muted">(Magic item)</span></h4>'+(e.d?foldP(rich(fill(e.d)),"ai:"+e.k+":"+e.n,e.d):'')+(rl.length?resBoxes(rl):'')+'</div>'; }
  const {same, t, ay, sx, so}=actEnt2Step2(e, x);
  return actEntPart1(e, x, same, chip, so, rl)+(so?sumH(so,clsOfG(x.g)):(e.d==null&&x&&x.f.full)?sumText(t,clsOfG(x.g)):foldP(richP(fill(t)),same&&x?"a:"+x.gi+"."+x.fi:"ae:"+e.f+":"+e.n,t,!!(sx||(e.d==null&&x&&x.f.full))))+ay+(e.f==="Maneuvers known"&&rl.length?manCost(rl):(rl.length?resTail(rl,so):''))+'</div>'; }
function actEntPart1(e, x, same, chip, so, rl){ return ('<div class="aitem" data-act="'+e.k+'"><h4>'+(x?'<button type="button" class="tx" data-info="f:'+x.gi+'.'+x.fi+'">'+esc(e.n)+'</button>':esc(e.n))+(!same?(e.f==="Maneuvers known"?'':' <span class="muted">('+esc(e.f)+')</span>'):(chip&&!(so&&so.p)?' <span class="muted">('+chip+')</span>':''))+sumPill(so&&so.p)+(so&&rl.length&&e.f!=="Maneuvers known"?resPips(rl):'')+'</h4>'); }
function actEnt2Step1(e){
 const {rl}=actEntStep1(e);
  return /** @type {any} */ ({rl});
}
function actEnt2Step2(e, x){
  const _actEntStep2=actEntStep2(e, x);
  const {same}=_actEntStep2;
  let {t, ay, sx, so}=_actEntStep2;
  return /** @type {any} */ ({same, t, ay, sx, so});
}
function actEntFn1(e, i){ return (i.key||i.n)===e.it; }
function actEntStep1(e){
const rl=resOf(e.it?e.n:e.f); if(e.u) resOf(e.u).forEach((r) =>{ if(!rl.some((q) =>{ return q.k===r.k; })) rl.push(r); });
  return /** @type {any} */ ({rl});
}
function actEntStep2(e, x){
  let t=e.d!=null?e.d:(x?(x.f.d||x.t):""), same=e.n===e.f, ay="", sx=0; if(e.d==null&&x){ const cs=aylSplit(t,clsOfG(x.g)); t=cs.t; ay=aylH(cs.a,clsOfG(x.g)); }/* v35 p15 */ let so=(e.d==null&&x)?sumParse(t):null;/* v35 p17 */ if(x&&(e.f==="Maneuvers known"||shortX(e.n,x.g))&&MAN_SUM[e.n]){ t=aylSplit(MAN_SUM[e.n],clsOfG(x.g)).t; so=sumParse(t); sx=1; }/* v35 p18 */ if(x&&FATK[e.n]) so=fatkSum(e.n);/* v36 p11 */
  return /** @type {any} */ ({t, same, ay, sx, so});
}
export function actOne(o,chip){ return o.e?actEnt(o.e,o.x,chip):actItem(o.x,chip); }
/* hand-written C.actions entries of a category (the editor offers all four). Entries that repeat a feature, the Opportunity Attack line, or the spell list are left out */
const ACT_STD=["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize","Opportunity Attack","Two-Weapon Fighting","Interact with an Object"];
function actStdList(a){ const p=String(a.n||"").split(/\s*,\s*/); return p.length>1&&p.every((x) =>{ return ACT_STD.indexOf(x)>=0; }); }/* v35 p09: shown in Actions in Combat */
function actPlain(c,feats){ return (C.actions||[]).filter((a) =>{ return (a.c||"")===c&&actOn(a)&&!actStdList(a)&&!feats.some((x) =>{return x.f.n===a.n})&&!(c==="Reactions"&&a.n==="Opportunity Attack")&&!(a.n==="Spells"&&/casting time$/.test(a.t||"")); }).map((a) =>{return '<div class="aitem"><h4>'+esc(a.n)+'</h4>'+foldP(rich(fill(a.d)),"c:"+a.n,a.d)+'</div>'}).join(""); }
export function renderActions(){
  const _renderActionsStep1=renderActionsStep1();
  const {feats, kinds, aprIco}=_renderActionsStep1;
  let {apa}=_renderActionsStep1;
  const {rowsOf, AH}=renderActionsStep2(aprIco);
  const _renderActionsStep3=renderActionsStep3(rowsOf, apa, AH, kinds, feats);
  const {show, bRows, rRows}=_renderActionsStep3;
  let {h}=_renderActionsStep3;
  ({h}=renderActionsStep4(show, h, bRows, AH, kinds, feats, rRows));
}
function renderActionsStep1(){
  const feats=featAll(), kinds=actSplit(feats);
  let apa=1; feats.forEach((x) =>{ if(x.f.n==="Extra Attack") apa=Math.max(apa,2); if(x.f.n==="Two Extra Attacks") apa=Math.max(apa,3); if(x.f.n==="Three Extra Attacks") apa=Math.max(apa,4); if(x.f.n==="Extra Attack (2)") apa=Math.max(apa,3); if(x.f.n==="Extra Attack (3)") apa=Math.max(apa,4); if(x.f.n==="Thirsting Blade") apa=Math.max(apa,2); if(x.f.n==="Devouring Blade") apa=Math.max(apa,3); });
  const aprIco=function(t){ return ico(/Ammunition/i.test(t)?"item-ammo":/Two-Handed|Versatile/i.test(t)?"ui-hand":/Reach|Thrown/i.test(t)?"ui-range":/Heavy/i.test(t)?"ui-weight":/Bonus Action/i.test(t)?"time-bonus":/Loading/i.test(t)?"ui-pause":/Finesse|Light/i.test(t)?"item-weapon":"ui-info","apr-i"); };/* v36 p12 */
  return /** @type {any} */ ({feats, kinds, apa, aprIco});
}
function attackRollData(a,d){return {hit:a.critRange?' data-crit-at="'+a.critRange+'"':"",damage:d.damageParts?' data-damage-parts="'+esc(JSON.stringify(d.damageParts))+'"':"",types:d.damageParts?d.damageParts.map((p) =>tyIcon(p.type)+esc(p.type)).join(" + "):tyIcon(a.type)+esc(a.type||"")}}
function renderActionsStep2(aprIco){
  const pactNow=function(){ try{ return env.__bldPactInfo?env.__bldPactInfo():null; }catch(e){ return null; } };
  const aprChips=function(a){ const L=String(a.sub||"").split(/\s*[,\u2022]\s*/).filter(Boolean).map((t) =>{ return '<span class="apc">'+aprIco(t)+'<span>'+esc(t)+'</span></span>'; }); if(a.m) L.push('<span class="apc ap-m">'+ico("item-weapon","apr-i")+'<span>Mastery: '+esc(a.m)+'</span></span>'); const amq=ammoBonus(a); if(amq) L.push(amq.on?'<span class="apc ap-m"><span>'+sg(amq.on.n)+' ammo</span></span>':((S.ammoAct||{})[amq.kd]==="none"?'<span class="apc"><span>No magic ammo</span></span>':'<span class="apc ap-w"><span>Pick ammo</span></span>'));/* v102 */ const pi=pactNow(); if(pi&&pi.melee.indexOf(a.n)>=0&&pi.cur!==a.n) L.push('<button type="button" class="apc ap-w" data-pactset="'+esc(a.n)+'"><span>Make Pact Weapon</span></button>');/* Pact of the Blade: bond this weapon */ return L.length?'<span class="apr">'+L.join("")+'</span>':""; };
  const atkRow=function(a,i){ const d=D.atk[i], rd=attackRollData(a,d);
    return '<div class="arow"'+(a.act?' data-act="'+esc(a.act)+'"':'')+'><div class="an">'+akIcon(atkKind(a))+'<button type="button" class="tx" data-info="w:'+i+'">'+esc(cuNm("a:"+a.n,a.n))+'</button>'+aprChips(a)+cfFlags(sitAtk(a))+'<span class="arng">'+ico("ui-range","apr-i")+esc(a.range||"--")+'</span></div><button type="button" class="abox bd" data-bd="ah-'+i+'"'+rd.hit+'>'+sg(d.hit)+'</button><button type="button" class="abox wide bd" data-bd="ad-'+i+'"'+rd.damage+'>'+esc(d.dmg)+'<small>'+rd.types+'</small></button></div>'+attackSelfDamageControls(a,i)+attackResourceDamageControls(a,i)+turnDamageControls(a,i); };
  const rowsOf=function(act){ return (C.attacks||[]).map((a,i) =>{ if(!atkOn(a)) return ""; if(act!=="*"&&(a.act||"")!==act) return ""; return atkRow(a,i); }).join(""); };
  const AH='<div class="ahead"><span>Range</span><span>Hit/DC</span><span>Damage</span></div>';
  return /** @type {any} */ ({rowsOf, AH});
}
function renderActionsStep3(rowsOf, apa, AH, kinds, feats){
  const rows=rowsOf(actF==="attack"?"*":"")+
    (C.xdmg||[]).map((x,i) =>{ return '<div class="arow xd"><div class="an">'+akIcon("feature")+'<button type="button" class="tx" data-info="xd:'+i+'">'+esc(String(x.n).replace(/ \([^)]*\)$/,""))+'</button>'+(/ \([^)]*\)$/.test(x.n)?'<span class="muted anp">'+esc(/ (\([^)]*\))$/.exec(x.n)[1])+'</span>':'')+'<small>'+esc(String(x.sub||"").toUpperCase().slice(0,40))+'</small><span class="arng">--</span></div><span class="abox">'+(x.save?esc(x.save)+'<small>'+x.dc+'</small>':'--')+'</span><span class="abox wide">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join("");/* RU35 no. 5 */
  const tabs='<div class="ifil">'+[["all","All"],["attack","Attack"],["action","Action"],["onhit","On Hit"],["bonus","Bonus Action"],["reaction","Reaction"],["other","Other"],["limited","Limited Use"]].map((f) =>{return '<button type="button" class="ifb'+(actF===f[0]?' on':'')+'" data-actf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
  const show=function(k){return actF==="all"||actF===k};
  let h=tabs, bRows=rowsOf("bonus"), rRows=rowsOf("reaction");
  h+=pluvennGrappleclawsControls()+necronomiconReadingControls()+slotRecoveryControls()+storedSpellReceiptControls()+spellGemReceiptControls()+spellwroughtTattooControls()+noActH()+turnDamageGuide()+supremeHealingControls()+divineInterventionControls()+ordersWrathControls();/* v22 RU53 */
  if(show("attack")||show("action")) h+=sitCardH();/* v103 */
  if(show("attack")||show("action")) h+='<h3 class="fcat">Actions <span class="apa">• Attacks per Action: '+apa+'</span></h3>'+AH+rows+saveCantripRows()+modeXdRows()+sitDiceRows();/* v22 RU43, RU56 */
  if(show("action")) h+=combat(["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize"])+kinds.action.map((o) =>{return actOne(o,"")}).join("")+actPlain("Actions",feats);
  if(show("onhit")&&kinds.onhit.length) h+='<h3 class="fcat fcat-onhit">On Hit</h3><div class="aonhit">'+kinds.onhit.map((o) =>{return actOne(o,"")}).join("")+'</div>';/* v35 p18 */
  return /** @type {any} */ ({show, h, bRows, rRows});
}
function renderActionsStep4(show, h, bRows, AH, kinds, feats, rRows){
  if(show("bonus")) h+='<h3 class="fcat">Bonus Actions</h3>'+(bRows?AH+bRows:'')+((C.attacks||[]).some((a) =>{return atkOn(a)&&/Light/.test(a.sub||"")})?combat(["Two-Weapon Fighting"]):'')+spLine(spellsBy(/^Bonus/))+kinds.bonus.map((o) =>{return actOne(o,"1 Bonus Action")}).join("")+actPlain("Bonus Actions",feats);
  if(show("reaction")) h+='<h3 class="fcat">Reactions</h3>'+(rRows?AH+rRows:'')+combat(["Opportunity Attack"])+spLine(spellsBy(/^Reaction/))+kinds.reaction.map((o) =>{return actOne(o,"1 Reaction")}).join("")+actPlain("Reactions",feats);
  if(show("other")) h+='<h3 class="fcat">Other</h3>'+combat(["Interact with an Object"])+spLine(spellsBy(/minute|hour|Ritual/i))+kinds.other.map((o) =>{return actOne(o,"Special")}).join("")+actPlain("Other",feats);
  if(show("limited")||actF==="all") h+=(D.res.length?'<h3 class="fcat">Limited Use</h3><div class="lu" id="lu">'+D.res.map((r) =>{ const rsp=resSpec(r); return '<div class="rs"><div class="rs-h"><b>'+(rsp?'<button type="button" class="tx" data-info="'+esc(rsp)+'">'+esc(r.n)+'</button>':esc(r.n))+'</b><span>'+esc(r.tag)+'</span></div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="sub" id="sub-'+r.k+'">'+luSub(r)+'</div></div>'; }).join("")+'</div><div class="rests"><button class="btn press" type="button" data-rest="short">Short Rest</button><button class="btn press" type="button" data-rest="long">Long Rest</button></div>':'');
  $("#actBody").innerHTML=h;
  return /** @type {any} */ ({h});
}
export function syncLU(){
  D.res.forEach((r) =>{
    /* RU39: each box knows its own position (data-i). #lu sits inside #actBody, so a running index over the three areas was wrong */
    $$('#lu .bx[data-k="'+r.k+'"], #featBody .bx[data-k="'+r.k+'"], #actBody .bx[data-k="'+r.k+'"], #spBody .bx[data-k="'+r.k+'"], #sheetBody .bx[data-k="'+r.k+'"]').forEach((b) =>{ b.setAttribute("aria-pressed", (+b.getAttribute("data-i"))<used(r.k,r.max)); });
    const el=document.getElementById("sub-"+r.k); if(el) el.textContent=luSub(r); $$('.supd[data-k="'+r.k+'"] b').forEach((b) =>{ b.textContent=r.max-used(r.k,r.max); });/* v36 p10 */
    if(r.pool) $$('.pli[data-k="'+r.k+'"]').forEach((x) =>{ if(document.activeElement!==x) x.value=r.max-used(r.k,r.max); });
  });
  syncAttackResourceDamageControls();
}
export function __set_actF(v){ return actF=v; }
export function __set_renderActions(v){ return renderActions=v; }
