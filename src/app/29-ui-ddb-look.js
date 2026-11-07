import {GLOSS} from "./03-data-glossary.js";import {C,S} from "./04-logic-storage.js";import {esc,num,sg} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {boxes,used} from "./08-ui-render-sheet-and-actions.js";import {linkify} from "./13-ui-detail-cards.js";import {resOf} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {ordL,scAdj} from "./23e-ui-spells-dc.js";import {__R} from "./00-reg.js";import {env as PGE} from "./00-env.js";
Object.defineProperty(__R,"NOTE_MORE",{get:function(){return NOTE_MORE;},set:function(v){NOTE_MORE=v;},configurable:true});
Object.defineProperty(__R,"clsOfG",{get:function(){return clsOfG;},set:function(v){clsOfG=v;},configurable:true});
Object.defineProperty(__R,"fch",{get:function(){return fch;},set:function(v){fch=v;},configurable:true});
Object.defineProperty(__R,"featNums",{get:function(){return featNums;},set:function(v){featNums=v;},configurable:true});
Object.defineProperty(__R,"featSpL",{get:function(){return featSpL;},set:function(v){featSpL=v;},configurable:true});
Object.defineProperty(__R,"pgGuess",{get:function(){return pgGuess;},set:function(v){pgGuess=v;},configurable:true});
Object.defineProperty(__R,"profsH",{get:function(){return profsH;},set:function(v){profsH=v;},configurable:true});
Object.defineProperty(__R,"scCls",{get:function(){return scCls;},set:function(v){scCls=v;},configurable:true});
Object.defineProperty(__R,"srcPg",{get:function(){return srcPg;},set:function(v){srcPg=v;},configurable:true});
/* ================= v23: D&D BEYOND LOOK 2 ================= */
/* RU36 no. 1: source with the printed page, "PHB-2024, pg. 153, Warlock 1" */
export function srcPg(s,pg,book){ s=String(s||""); if(!pg) return s; const b=book||(/^DMG/.test(s)?"DMG-2024":/^MoM/.test(s)?"MoM":"PHB-2024");/* v36 p21 */ return s.indexOf(b)===0?b+", pg. "+pg+s.slice(b.length):(s?s+", ":"")+b+", pg. "+pg; }
/* m5: a page for features of sheets saved before v23 (no it.pg): class, subclass, feat, species from the group name */
function pgGuess(g,f){ if(f.pg) return f.pg; if(typeof BOOKPG!=="undefined"&&BOOKPG.mom&&/^MoM/.test(f.s||"")){ const mm=/^Species: (.+)$/.exec(String(g&&g.g||"")); return mm&&BOOKPG.mom.species[mm[1]]?BOOKPG.mom.species[mm[1]]._||0:0; }/* v36 p21 */ if(typeof BOOKPG==="undefined"||!/^PHB-2024/.test(f.s||"")) return 0;
 const _pgGuessStep1=pgGuessStep1(g, f);
 const {P, gg, n}=_pgGuessStep1;
 let {m}=_pgGuessStep1;
  if((m=/^Species: (.+)$/.exec(gg))&&P.species[m[1]]) return P.species[m[1]][n]||P.species[m[1]]._||0;
  if(gg==="Feats") return P.feat[n]||0; if(gg==="Eldritch Invocations") return P.invocation[n]||0; if((m=/^Background: (.+)$/.exec(gg))) return P.background[m[1]]||0;
  if((m=/^(\w+) Subclass: (.+)$/.exec(gg))&&P.subclass[m[1]+"|"+m[2]]) return P.subclass[m[1]+"|"+m[2]][n]||P.subclass[m[1]+"|"+m[2]]._||0;
  if((m=/^(\w+)(?: \(multiclass \d+\))?/.exec(gg))&&P["class"][m[1]]) return P["class"][m[1]][n]||P["class"][m[1]][n.split(":")[0]]||0; return 0; }
function pgGuessStep1(g, f){
let P=BOOKPG.phb, gg=String(g&&g.g||""), n=f.n, m;
  return /** @type {any} */ ({P, gg, n, m});
}
/* spellcasting numbers of one class (multiclass with two abilities), else the main ones */
export function scCls(cl){ const sc=scAdj(C.spellcasting||{}); if(cl&&Array.isArray(sc.by)){ const b=sc.by.filter((q) =>{return q.n===cl})[0]; if(b) return b; } return sc; }
function clsOfG(g){ const m=/^(\w+)(?: Subclass:| \(multiclass)/.exec(g||""); if(m) return m[1]; return g&&CLS_NAMES.indexOf(g)>=0?g:(C.cls||""); }
var CLS_NAMES=["Artificer","Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"];
/* RU36 no. 4: numbers worked out for this character, in bold after the words that name them. Only text, never inside tags */
function featNums(h,cl){
 const {sc, lv, B1, AB, MUL, RX}=featNumsStep1(cl);
  return String(h).split(/(<[^>]+>)/).map((t,i) =>{ if(i%2) return t;
    return t.replace(RX,(m,mul,yo,what,cls,ab,div,par,rnd) =>{ let v, sign=false;
      if(what==="Proficiency Bonus"){ v=D.pb; sign=true; } else if(cls){ v=cls==="character"?D.level:(lv[cls]||0); if(!v) return m; } else if(ab){ v=D.mod[AB[ab]]; sign=true; }
      else if(/save DC/.test(what)){ if(!sc||!sc.dc) return m; v=sc.dc; } else { if(!sc||sc.atk==null) return m; v=sc.atk; sign=true; }
      const up=/round(?:ed)? up/.test(par||"")||rnd==="up", mn=/minimum(?: of)? ([+-]?\d+|once|one|two)/.exec(par||""); if(mn) mn[1]={once:1,one:1,two:2}[mn[1]]||mn[1];
      if(mul) v=v*MUL[mul]; if(div) v=v/(+div); if(v!==Math.floor(v)) v=up?Math.ceil(v):Math.floor(v); if(mn) v=Math.max(v,+mn[1]);
      return m+B1(sign&&!mul&&!div?sg(v):(sign&&v>0&&what==="Proficiency Bonus"?"+"+v:v)); });
  }).join(""); }
function featNumsStep1(cl){
const sc=scCls(cl), lv=__R.clsLvls(), B1=function(v){ return ' (<b class="fnum">'+v+'</b>)'; }, AB={Strength:"STR",Dexterity:"DEX",Constitution:"CON",Intelligence:"INT",Wisdom:"WIS",Charisma:"CHA"}, MUL={twice:2,"three times":3,"four times":4,"five times":5,"ten times":10,half:0.5};
  const RX=/\b(?:(twice|three times|four times|five times|ten times|half) )?([Yy]our) (Proficiency Bonus|(Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard|character) level|(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) modifier|spell save DC|spell attack (?:modifier|bonus))(?: divided by (\d+))?((?: \((?:round(?:ed)? (?:up|down)|minimum(?: of)? (?:[+-]?\d+|once|one|two)[^)]*)\))*)(?:,? rounded (up|down))?(?! \()/g;
  return /** @type {any} */ ({sc, lv, B1, AB, MUL, RX});
}
/* RU36 no. 3: the player's choice in a block under the feature */
function fch(h){ return String(h).replace(/(?:<br>)?<strong>Your choice\.<\/strong>\s*([\s\S]*?)(?=<br><strong>|$)/,(m,x) =>{ return '<span class="fch"><b>Your choice</b>'+x+'</span>'; }); }
/* RU36 no. 5: spells a feature gives, as rows that open the spell */
function featSpL(g,f){
 const {L}=featSpLStep1(g, f);
  if(!L.length) return "";
  return '<div class="fspl" role="list">'+L.map((p) =>{ const x=p[0], own=resOf(f.n).map((r) =>{ return r.k; }), rl=(D.res||[]).filter((r) =>{ return r.f===x.src&&r.n.indexOf(x.n)>=0&&own.indexOf(r.k)<0; });/* the feature already shows its boxes */
    return '<div class="fspr" role="listitem"><button type="button" class="tx" data-info="sp:'+p[1]+'"><b>'+esc(x.n)+'</b>'+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</button><small>'+(x.l?ordL(x.l):"Cantrip")+' • '+esc(x.use)+'</small>'+(rl.length?'<span class="boxes">'+boxes(used(rl[0].k,rl[0].max),rl[0].max,rl[0].k,rl[0].n)+'</span>':'')+'</div>'; }).join("")+'</div>'; }
function featSpLStep1(g, f){
const sub=(String(g.g).split(": ")[1]||""), n=f.n;
  const L=(C.spells||[]).map((x,i) =>{return [x,i]}).filter((p) =>{ const x=p[0], s=x.src||""; if(x.mi) return x.mi===n; if(s===n) return true;
    if(/ Spells$/.test(n)&&x.use==="Always prepared"&&sub&&sub.indexOf(n.replace(/ Spells$/,""))===0&&s===sub) return true;
    if(s.length>5&&n.length>5&&(n.indexOf(s+" (")===0||s.indexOf(n+" (")===0)) return true; return false; });
  return /** @type {any} */ ({L});
}
/* RU36 no. 7: proficiencies with where they come from */
const PROF_NM={Light:"Light Armor",Medium:"Medium Armor",Heavy:"Heavy Armor",Shields:"Shields",Simple:"Simple Weapons",Martial:"Martial Weapons",Improvised:"Improvised Weapons"};
function profRows(list){ return list.length?list.map((x) =>{ const n=PROF_NM[x[0]]||x[0]; return '<span class="prw">'+(GLOSS[n]?'<button type="button" class="tx" data-info="g:'+esc(n)+'">'+esc(n)+'</button>':linkify(n))+' <small>('+esc(x[1])+')</small></span>'; }).join(""):'<span class="prw">None</span>'; }
function profNames(t){ return String(t||"None").split(/,\s*/).map((x) =>{ return PROF_NM[x]||x; }).join(", "); }
function profsH(){ const P=C.profSrc;
  const body=P?'<h3>Armor</h3><p class="prl">'+profRows(P.armor||[])+'</p><h3>Weapons</h3><p class="prl">'+profRows(P.weapons||[])+'</p><h3>Tools</h3><p class="prl">'+profRows(P.tools||[])+'</p>'
    :'<h3>Armor</h3><p>'+esc(profNames(C.profs.armor))+'</p><h3>Weapons</h3><p>'+esc(profNames(C.profs.weapons))+'</p><h3>Tools</h3><p>'+linkify(C.profs.tools||"None")+'</p>';
  /* fx engine v6: tool check rows. Each tool with Expertise (C.toolExp) shows the bonus to add to its ability check: double the Proficiency Bonus. The ability modifier is the one your DM names for the check */
  const te=(C.toolExp||[]).length?'<h3>Tool checks</h3><div class="toolrolls">'+(C.toolExp||[]).map((t) =>{ const v=2*num(D.pb,2); return '<div class="sense"><span class="bonus">+'+v+'</span><span>'+linkify(t.n)+' <small>(Expertise, plus the ability modifier for the check)</small></span></div>'; }).join("")+'</div>':'';
  return body+te+'<h3><button type="button" class="tx" data-info="g:Languages">Languages</button></h3><p id="langLine"></p>'+(C.cls?'<p class="fman"><button type="button" class="btn press" data-bldgo="class">Manage Proficiencies</button></p>':''); }
/* RU38 no. 4: Manage buttons open the builder at a step */
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-bldgo]"); if(!b) return; e.preventDefault(); if(PGE.__bldGo) PGE.__bldGo(b.getAttribute("data-bldgo")); else if(PGE.__bldOpen) PGE.__bldOpen(); });

/* RU36 no. 8, RU38 no. 5: Description tab. Characteristics are optional fields in S.notes ("ch_" keys), old data reads as before */
export var CHAR_FIELDS=[["ch_gender","Gender"],["ch_age","Age"],["ch_height","Height"],["ch_weight","Weight"],["ch_eyes","Eyes"],["ch_hair","Hair"],["ch_skin","Skin"],["ch_faith","Faith"]];
function noteTA(f){ return '<div class="note"><label for="n-'+f.k+'">'+f.l+'</label><textarea id="n-'+f.k+'" data-note="'+f.k+'" rows="'+f.rows+'" placeholder="'+f.h+'">'+esc(S.notes[f.k]||"")+'</textarea></div>'; }
/* RU36 no. 9: Notes sections like D&D Beyond (new keys in S.notes) */
var NOTE_MORE=[{k:"org",l:"Organizations",h:"Groups, guilds, and factions",rows:3},{k:"allies",l:"Allies",h:"People who help you",rows:3},{k:"enemies",l:"Enemies",h:"People who stand against you",rows:3}];
