import {DMAP,dmapAlias,spX,un} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {cls14Apply} from "./08-logic-2014-rules.js";
import {DM14M,DM14ON,DM14S,__set_DM14M,__set_DM14ON,__set_DM14S,allFeats,dm14Set,eq14Set,sbAuto,sp14Set,wxGate} from "./09-logic-feats-and-choices.js";
import {clsParts} from "./11-logic-derivation.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"BASE",{get:function(){return BASE;},set:function(v){BASE=v;},configurable:true});
Object.defineProperty(__R,"autoSpells",{get:function(){return autoSpells;},set:function(v){autoSpells=v;},configurable:true});
Object.defineProperty(__R,"enabledPacks",{get:function(){return enabledPacks;},set:function(v){enabledPacks=v;},configurable:true});
Object.defineProperty(__R,"miFeats",{get:function(){return miFeats;},set:function(v){miFeats=v;},configurable:true});
Object.defineProperty(__R,"packSkills",{get:function(){return packSkills;},set:function(v){packSkills=v;},configurable:true});
Object.defineProperty(__R,"spHasFeat",{get:function(){return spHasFeat;},set:function(v){spHasFeat=v;},configurable:true});
Object.defineProperty(__R,"spOptFx",{get:function(){return spOptFx;},set:function(v){spOptFx=v;},configurable:true});
Object.defineProperty(__R,"subChoicesFor",{get:function(){return subChoicesFor;},set:function(v){subChoicesFor=v;},configurable:true});
Object.defineProperty(__R,"subGrant",{get:function(){return subGrant;},set:function(v){subGrant=v;},configurable:true});
/* ---------- sources & homebrew packs ---------- */
export var PACK_TEMPLATE={id:"my-homebrew",name:"My Homebrew",desc:"Short description",species:{"Example Folk":{size:"Medium",speed:30,dark:60,traits:[["Trait Name","What it does."]]}},subclasses:{"Rogue":{"Example Archetype":[[3,"Feature","What it does."]]}},feats:{"Example Feat":{cat:"G",pre:"Level 4+",asi:["STR","DEX"],d:"What it does."}},backgrounds:{"Example Background":{ab:["STR","DEX","CON"],feat:"Alert",sk:["Athletics","Stealth"],tool:"Thieves' Tools",eq:"Dagger, 15 GP",gp:15}},skills:{"Example Skill":"INT"},items:[["Example Ring","Ring","Rare",1,"What it does."]]};
export var BASE=null;
let PACK_CF=[];/* v20 RD24: CF_FULL keys a pack added */
export function snap(){if(!BASE){eq14Set(false);dm14Set(false)}if(!BASE)BASE={cf:JSON.stringify(Object.keys(CLASSES).reduce((o,c) =>{o[c]=CLASSES[c].f;return o},{})),price:JSON.stringify(PRICE),sp:JSON.stringify(SPECIES),bg:JSON.stringify(BACKGROUNDS),ft:JSON.stringify(FEATS),subs:JSON.stringify(Object.keys(CLASSES).reduce((o,c) =>{o[c]=CLASSES[c].subs;return o},{})),dmgi:DMGI.slice(),auto:JSON.stringify(AUTO)}}
export function allPacks(){return Object.keys(HB_BUILTIN).map((k) =>{return HB_BUILTIN[k]}).concat(B.packs||[])}
function enabledPacks(){B.src=B.src||{core:true,dmg:true};return allPacks().filter((p) =>{return B.src[p.id]})}
window.__setSrc=function(k,v){B.src=B.src||{core:true,dmg:true};B.src[k]=!!v;applyPacks()};window.__hasItem=function(n){return !!DMAP[n]};window.__hasSp=function(n){return !!SPECIES[n]};window.__hasBg=function(n){return !!BACKGROUNDS[n]};window.__hasGear=function(n){return GEAR.some((g) =>{return g[0]===n})};window.__spellNames=function(){return SPELLS.map((x) =>{return x[0]})};window.__hasAny=function(n){return !!(DMAP[n]||ARMOR[n]||WEAPONS[n]||GEAR.some((g) =>{return g[0]===n})||POTIONS.some((q) =>{return q[0]===n}))};/* v75: for tests *//* v65: for tests *//* v38 p13: for tests */
export function applyPacks(){B.src=B.src||{core:true,dmg:true};snap();const sp=JSON.parse(BASE.sp),bg=JSON.parse(BASE.bg),ft=JSON.parse(BASE.ft),subs=JSON.parse(BASE.subs);
 Object.keys(SPECIES).forEach((k) =>{delete SPECIES[k]});Object.assign(SPECIES,sp);
 if(sp[B.species]&&sp[B.species].hb==="MoM")B.src.mom=true;/* v38 p13: a character that uses a MoM species keeps the source on */
 if(!B.src.mom)Object.keys(SPECIES).forEach((k) =>{if(SPECIES[k].hb==="MoM")delete SPECIES[k]});
 Object.keys(BACKGROUNDS).forEach((k) =>{delete BACKGROUNDS[k]});Object.assign(BACKGROUNDS,bg);
 Object.keys(FEATS).forEach((k) =>{delete FEATS[k]});Object.assign(FEATS,ft);
 Object.keys(CLASSES).forEach((c) =>{CLASSES[c].subs=CLASSES[c].tp&&!subs[c]?{}:subs[c]});const cf0=JSON.parse(BASE.cf);Object.keys(CLASSES).forEach((c) =>{if(cf0[c])CLASSES[c].f=cf0[c]});/* P4: a class of a third party book is not in the base snapshot, it keeps its own features */PACK_CF.forEach((k) =>{delete CF_FULL[k]});PACK_CF=[];const pr0=JSON.parse(BASE.price);Object.keys(PRICE).forEach((k) =>{delete PRICE[k]});Object.assign(PRICE,pr0);/* v20 RD24 */const au=JSON.parse(BASE.auto);Object.keys(AUTO).forEach((k) =>{delete AUTO[k]});Object.assign(AUTO,au); __set_DM14ON(false);__set_DM14S(null);__set_DM14M(null);/* v93: DMGI is rebuilt below */ DMGI.length=0;if(B.src.dmg!==false)BASE.dmgi.forEach((x) =>{DMGI.push(x)});
 Object.keys(DMAP).forEach((k) =>{delete DMAP[k]});DMGI.forEach((x) =>{DMAP[x[0]]=x});dmapAlias();/* V16-1 */
 enabledPacks().forEach((p) =>{
  Object.keys(p.species||{}).forEach((k) =>{const s=p.species[k];SPECIES[k]={size:s.size||"Medium",speed:+s.speed||30,dark:+s.dark||0,traits:s.traits||[],featPick:s.featPick,skillPick:s.skillPick,lin:s.lin,linFx:s.linFx,linText:s.linText,opts:s.opts,skills:s.skills,hb:p.name}});
  Object.keys(p.subclasses||{}).forEach((c) =>{if(!CLASSES[c])return;Object.keys(p.subclasses[c]).forEach((s) =>{CLASSES[c].subs[s]=p.subclasses[c][s]})});
  Object.keys(p.feats||{}).forEach((k) =>{FEATS[k]=Object.assign({cat:"G"},p.feats[k],{hb:p.name})});
  Object.keys(p.backgrounds||{}).forEach((k) =>{BACKGROUNDS[k]=p.backgrounds[k]});
  Object.keys(p.autoSpells||{}).forEach((k) =>{AUTO[k]=p.autoSpells[k]});
  (p.items||[]).forEach((x) =>{DMGI.push(x);DMAP[x[0]]=x;if(x[5]&&x[5].cost!=null)PRICE[x[0]]=x[5].cost});
  /* v20 RD24: class features of a pack (Bonus Class Features), at their level, with full text */
  Object.keys(p.clsFeat||{}).forEach((c) =>{if(!CLASSES[c])return;p.clsFeat[c].forEach((f) =>{const k=c+"|"+f[1];if(CLASSES[c].f.some((x) =>{return x[1]===f[1]}))return;/* a core feature of that name wins */
   CLASSES[c].f=CLASSES[c].f.concat([f]).sort((x,y) =>{return x[0]-y[0]});if(CF_FULL[k]==null||PACK_CF.indexOf(k)>=0){CF_FULL[k]=(f[3]&&f[3].full)||f[2];PACK_CF.push(k)}})})});
 efaGate();/* v56: Eberron: Forge of the Artificer */ wxGate();/* v62: WotC sources */cls14Apply();/* v85 v86 */sp14Set(R14(),true);/* v92 */eq14Set(R14(),true);dm14Set(R14(),true);/* v93 */window.__gl14&&window.__gl14(R14());/* v94 */
 if(!SPECIES[B.species]&&B.species!=="Custom")B.species="Human";if(!BACKGROUNDS[B.bg])B.bg="Soldier";if(B.sub&&B.sub!=="__custom"&&!CL().subs[B.sub])B.sub=""}
/* v56 EFotA: the class, species and feats exist only while the source is on. A character that uses any of them keeps the source on. */
function efaGate(){if(!window.EFA_CLS)return;const us=!R14()&&(B.cls==="Artificer"||(B.mc||[]).some((m) =>{return m.cls==="Artificer"}))||!R14()&&(SPECIES[B.species]&&SPECIES[B.species].hb==="EFotA")||(BACKGROUNDS[B.bg]&&BACKGROUNDS[B.bg].hb==="EFotA")||(function(){const js=JSON.stringify(B.ch||{});return (window.EFA_NAMES.feats||[]).some((n) =>{return js.indexOf('"'+n+'"')>=0})})(); if(R14())B.src.efa=false;if(us)B.src.efa=true;
 if(!B.src.efa){Object.keys(SPECIES).forEach((k) =>{if(SPECIES[k].hb==="EFotA")delete SPECIES[k]});Object.keys(FEATS).forEach((k) =>{if(FEATS[k].hb==="EFotA")delete FEATS[k]});Object.keys(BACKGROUNDS).forEach((k) =>{if(BACKGROUNDS[k].hb==="EFotA")delete BACKGROUNDS[k]});if(!(CLASSES.Artificer&&CLASSES.Artificer.a14))delete CLASSES.Artificer;return}
 if(!CLASSES.Artificer||CLASSES.Artificer.a14){const all=Object.keys(CLASSES).map((k) =>{return [k,CLASSES[k]]});all.push(["Artificer",window.EFA_CLS]);all.sort((a,b) =>{return a[0]<b[0]?-1:1});Object.keys(CLASSES).forEach((k) =>{delete CLASSES[k]});all.forEach((r) =>{CLASSES[r[0]]=r[1]})}}
export function packSkills(){const o=[];enabledPacks().forEach((p) =>{Object.keys(p.skills||{}).forEach((k) =>{o.push({n:k,ab:p.skills[k],src:p.name,d:(p.skillD||{})[k]||""})})});return o}
function subGrant(sub){let g=null,G0=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[sub];if(G0&&(G0.armor||G0.weapons))g={armor:G0.armor,weapons:G0.weapons,f:G0.f};/* v58: armor and weapons of built-in subclasses (EFotA). Tools and skills have their own paths */enabledPacks().forEach((p) =>{if(p.subGrants&&p.subGrants[sub])g=p.subGrants[sub]});return g}
export function subChoicesFor(sub){const o=[];enabledPacks().forEach((p) =>{(p.subChoices&&p.subChoices[sub]||[]).forEach((c) =>{o.push(c)})});return o}
function spOptFx(){const sp=spX(),fx={};if(!sp)return fx;Object.keys(sp.fx||{}).forEach((k) =>{fx[k]=sp.fx[k]});/* v36 p21: fixed species effects */if(sp.opts)(B.ch.spopt||[]).forEach((n) =>{const o=sp.opts.list.filter((x) =>{return x[0]===n})[0];if(o)Object.keys(o[2]).forEach((k) =>{const a=fx[k],b=o[2][k];if(Array.isArray(a)&&Array.isArray(b))fx[k]=a.concat(b.filter((z) =>{return a.indexOf(z)<0}));else if(a&&b&&typeof a==="object"&&typeof b==="object"&&!Array.isArray(a))fx[k]=Object.assign({},a,b);else fx[k]=b})});/* tp P5: several chosen options may each add skills, resistances or senses, so lists and maps merge */
 if(sp.linFx&&B.ch.lin)Object.keys(sp.linFx).forEach((k) =>{if(B.ch.lin.indexOf(k)===0)Object.assign(fx,sp.linFx[k])});return fx}
function spHasFeat(){const sp=spX();return !!(sp&&(sp.featPick||spOptFx().feat))}
/* always-prepared spells. Tables AUTO, LAND, CLS_AUTO, SP_AUTO are in db4.js (M17) */
/* M9: k = source key for the spellcasting ability (class name, "@species", "@spcan"), see spellAb() */
export function autoSpells(){const L=B.level,out=[];function add(tab,src,lv,k){const LL=lv||L;(tab||[]).forEach((r) =>{if(r[0]<=LL)r[1].split(",").forEach((n) =>{n=n.trim();if(!n)return;/* fx engine v4: an empty placeholder like [[3,""]] adds nothing */if(!out.some((o) =>{return o.n===n}))out.push({n:n,src:src,k:k,g:r[0]})/* v21 M1: level the spell is gained at */})})}
 add(CLS_AUTO[B.cls],B.cls,0,B.cls);if(B.sub&&B.sub!=="__custom")add(AUTO[B.sub],B.sub,0,B.cls);
 if(B.sub==="Circle of the Land"&&B.ch.land)add(LAND[B.ch.land],"Circle of the Land ("+B.ch.land+")",0,B.cls);
 /* v32 RL49: Circle of the Land as a multiclass, Magical Discoveries (College of Lore 6), High Elf cantrip */
 __R.MCL().forEach((m,i) =>{const ld=B.ch["m"+i+":land"];if(m.sub==="Circle of the Land"&&ld&&LAND[ld])add(LAND[ld],"Circle of the Land ("+ld+")",m.lv,m.cls)});
 clsParts().forEach((q,i) =>{if(q.sub==="Illusionist"&&q.lv>=3)(B.ch[(q.mc?"m"+(i-1)+":":"")+"p3illcan"]||[]).forEach((n) =>{add([[1,n]],"Improved Illusions",q.lv,q.cls)})});
 clsParts().forEach((q,i) =>{if(q.sub==="College of Lore"&&q.lv>=6)(B.ch[(q.mc?"m"+(i-1)+":":"")+"p6disc"]||[]).forEach((n) =>{add([[1,n]],"Magical Discoveries",q.lv,q.cls)})});
 sbAuto(add);/* v63 */
 __R.gfx().forEach((e) =>{if(e.spells)add(e.spells,e.lbl,e.lv,e.spCls||e.cls||"@species")});/* fx engine v2: spells [[level, "A,B"]] always prepared */(function(){(__R.gxPicks?__R.gxPicks():[]).forEach((o) =>{if(!o.gxc)return;(B.ch[o.key]||[]).forEach((n) =>{add([[1,n]],o.src,0,o.gxc)})})})();
 const S=un("species")?null:SP_AUTO[B.species];if(S){const k=Object.keys(S).filter((k) =>{return k===""||(B.ch.lin||"").indexOf(k)===0})[0];if(k!=null)add(S[k],B.species+(k?" ("+k+")":""),__R.TL(),"@species")}/* M5 (RL9): species spells use the character level (PHB 2024 p. 190, 197) */
 __R.MCL().forEach((m) =>{add(CLS_AUTO[m.cls],m.cls,m.lv,m.cls);if(m.sub)add(AUTO[m.sub],m.sub,m.lv,m.cls)});
 (B.ch.spcan||[]).forEach((n) =>{add([[1,n]],B.species+" ("+(spOptFx().cantripLabel||"Limited Spellcaster")+")",0,"@spcan")});
 (B.ch.bwc||[]).forEach((n) =>{add([[1,n]],B.ch["fs"+CL().fs]||"Fighting Style",0,B.cls)});
 __R.MCL().forEach((m,i) =>{(B.ch["m"+i+":bwc"]||[]).forEach((n) =>{add([[1,n]],B.ch["m"+i+":fs"]||"Fighting Style",m.lv,m.cls)})});/* v32 RL49 no. 42 */(B.ch.tomeC||[]).concat(B.ch.tomeR||[]).forEach((n) =>{add([[1,n]],"Pact of the Tome",0,"Warlock")});
 const hc=(B.ch.hecan||[])[0],hs=spX();if(hc&&hs&&hs.linCan)out.forEach((o) =>{if(o.k==="@species"&&o.n===hs.linCan[Object.keys(hs.linCan)[0]].def)o.n=hc});
 return out}
export function miFeats(){return allFeats().filter((f) =>{return /^Magic Initiate \((?!2014)/.test(f.n)}).map((f,i) =>{return {key:"mi"+i,cls:/\((\w+)\)/.exec(f.n)[1],src:f.s}})}
