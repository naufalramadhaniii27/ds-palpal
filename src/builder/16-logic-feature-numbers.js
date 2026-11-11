import {mod,pbOf} from "./01-logic-core-helpers.js";
import {un} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {R14} from "./05-logic-choice-model-ruleset.js";
import {XFX,allFeats,eaType} from "./09-logic-feats-and-choices.js";
import {classFx,clsInh,clsParts,fxList,fxVal} from "./11-logic-derivation.js";
import {subChoicesFor} from "./13-logic-sources-and-packs.js";
import {MCL,TL,mcResMax} from "./14-logic-multiclass-hp-shop.js";

import {provideQueries} from "./01a-logic-query-registry.js";
provideQueries({calcNote,defenses});
/* ---------- level-based numbers for feature text ---------- */
/* calcNote tables (SOLID s16): one note per feature name, from the numbers of the class at level L */
function cnTA(L,c,m,dc,rv,pb){return {
  "Rage":function(){return rv("Rage")+" uses per Long Rest, +"+c.track["Rage Damage"][L-1]+" Rage Damage"},
  "Bardic Inspiration":function(){return Math.max(1,m("CHA"))+" uses, die "+c.track["Inspiration Die"][L-1]},
  "Second Wind":function(){return rv("Second Wind")+" uses, heals 1d10 + "+L},
  "Arcane Shot":function(){return "Arcane Shot Die "+(L>=18?"d12":L>=15?"d10":L>=10?"d8":"d6")+", "+Math.max(1,m("INT"))+" uses, save DC "+dc("INT")},/* v64 */
  "Action Surge":function(){return (L>=17?2:1)+" use"+(L>=17?"s":"")+" per Short Rest"},
  "Indomitable":function(){return (L>=17?3:L>=13?2:1)+" uses, bonus +"+L},
  "Channel Divinity":function(){const r=(c.res||[]).filter((x) =>{return x.n==="Channel Divinity"})[0];return r?r.max[L-1]+" uses":""},
  "Wild Shape":function(){return rv("Wild Shape")+" uses, max CR "+(L>=8?"1":L>=4?"1/2":"1/4")},
  "Martial Arts":function(){return "Martial Arts die "+c.track["Martial Arts Die"][L-1]},
  "Monk's Focus":function(){return L+" Focus Points, save DC "+dc("WIS")},
  "Stunning Strike":function(){return "Constitution save DC "+dc("WIS")},
  "Sneak Attack":function(){return c.track["Sneak Attack"][L-1]},
  "Lay on Hands":function(){return "Pool of "+(5*L)+" Hit Points"}}}
function cnTB(L,c,m,dc,rv,pb){return {
  "Aura of Protection":function(){return "+"+Math.max(1,m("CHA"))+" to saves, "+(L>=18?30:10)+"-foot aura"},
  "Favored Enemy":function(){return rv("Favored Enemy")+" free Hunter's Mark casts"},
  "Font of Magic":function(){return L+" Sorcery Points"},
  "Arcane Recovery":function(){return "Recover up to "+Math.ceil(L/2)+" levels of slots"},
  "Magical Cunning":function(){const p=PACT[L-1];return "Regain up to "+Math.ceil(p[0]/2)+" Pact slot"+(Math.ceil(p[0]/2)>1?"s":"")},
  "Awakened Mind":function(){return "Range "+Math.max(1,m("CHA"))+" mile"+(Math.max(1,m("CHA"))>1?"s":"")+", lasts "+L+" minutes"},
  "Clairvoyant Combatant":function(){return "Wisdom save DC "+dc("CHA")},
  "Combat Superiority":function(){return rv("Superiority Dice","Battle Master")+" Superiority Dice ("+(L>=18?"d12":L>=10?"d10":"d8")+"), save DC "+(8+pb+Math.max(m("STR"),m("DEX")))},
  "Psionic Power":function(){return rv("Psionic Energy Dice","Psi Warrior")+" Psionic Energy Dice"},
  "Breath Weapon":function(){return "Dexterity save DC "+dc("CON")+", "+(L>=17?4:L>=11?3:L>=5?2:1)+"d10, "+pb+" uses"},
  "Healing Hands":function(){return pb+"d4 Hit Points"},
  "Relentless Rage":function(){return "Drops to "+(2*L)+" Hit Points on success"},
  "Divine Intervention":function(){return "Once per Long Rest"},
  "Mystic Arcanum":function(){return L>=17?"Level 6, 7, 8, 9 spells":L>=15?"Level 6, 7, 8 spells":L>=13?"Level 6, 7 spells":"Level 6 spell"}}}
function cnT14(L,c,m,dc,rv,pb){return {
   "Rage":function(){return (L>=20?"Unlimited uses":rv("Rage")+" uses per Long Rest")+", +"+c.track["Rage Damage"][L-1]+" Rage Damage"},
   "Indomitable":function(){return "Reroll a failed save, "+rv("Indomitable")+" use"+(rv("Indomitable")>1?"s":"")+" per Long Rest, you must keep the new roll"},  "Ki":function(){return L+" ki points, ki save DC "+dc("WIS")},
   "Divine Sense":function(){return Math.max(1,1+m("CHA"))+" uses per Long Rest"},
   "Cleansing Touch":function(){return Math.max(1,m("CHA"))+" uses per Long Rest"},
   "Wild Shape":function(){const lim=L>=8?"CR 1":L>=4?"CR 1/2, no flying speed":"CR 1/4, no flying or swimming speed";return (L>=20?"Unlimited uses":rv("Wild Shape")+" uses per Short Rest")+", "+lim+", lasts "+Math.floor(L/2)+" hour"+(Math.floor(L/2)>1?"s":"")},
   "Divine Intervention":function(){return L>=20?"Succeeds automatically":"Succeeds on a d100 roll of "+L+" or lower, then 7 days before you can try again"},
   "Relentless Rage":function(){return "At 0 Hit Points while raging, Con save DC 10 (+5 per use until a rest). On success you drop to 1 Hit Point instead"}
  }}
function calcNote(name,cls,L,a){const dcB=function(n){let t=0;try{classFx().forEach((e) =>{if(e.dcAdd&&e.dcAdd[n]!=null)t+=fxVal(e.dcAdd[n],e)})}catch(er){}return t};const pb=pbOf(TL()),m=function(k){return mod(a.sc[k])},c=CLASSES[cls],dc=function(k){return 8+pb+m(k)+dcB(name)};/* fx engine v4: dcAdd {"Feature name": value} on any entry adds to the save DC shown in that feature note (Monk's Focus, Ki, Breath Weapon) */
 /* uses come from the resource with this name, not from its position in res/resSub (L2). Missing resource: no note, never a wrong number */
 const rv=function(n,sub){const l=sub?((c.resSub||{})[sub]||[]):(c.res||[]),r=l.filter((x) =>{return x.n===n})[0];if(!r)throw new Error("no resource "+n);return mcResMax(r,a,L)};
 const T=Object.assign(cnTA(L,c,m,dc,rv,pb),cnTB(L,c,m,dc,rv,pb)),T14=cnT14(L,c,m,dc,rv,pb);
  const f=(R14()&&T14[name])||T[name];if(!f)return "";try{const s=f();return s?" **At your level:** "+s+".":""}catch(e){return ""}}
/* defenses() in parts (SOLID stage 13C): one function per source, in the same order. Each adds rows with add(type,value,source) */
function defSpecies(add){const sp=SPECIES[B.species];
 (un("species")?[]:DEF_SP[B.species]||[]).forEach((x) =>{add(x[0],x[1],B.species)});
 const lin=B.ch.lin||"";if(B.species==="Dragonborn"&&lin){const mm=/\(([A-Za-z]+)\)/.exec(lin);if(mm)add("Resistance",mm[1],"Dragonborn ("+lin.split(" ")[0]+")")}
 if(sp&&sp.linRes&&lin){const lk=Object.keys(sp.linRes).filter((k) =>{return lin.indexOf(k)===0})[0];if(lk)add("Resistance",sp.linRes[lk],B.species+" ("+lk+")")}/* v66: species whose lineage picks one resistance (Reborn) */
 if(B.species==="Tiefling"&&lin){const tt={Abyssal:"Poison",Chthonic:"Necrotic",Infernal:"Fire"}[lin.split(" ")[0]];if(tt)add("Resistance",tt,"Tiefling ("+lin.split(" ")[0]+")")}
}
function defClassBase(add,cls,lv){if(cls==="Barbarian")add("Resistance","Bludgeoning, Piercing, Slashing (while raging)","Rage");
  if(cls==="Paladin"&&lv>=10)add("Immunity","Frightened (Aura of Courage)","Paladin 10");  if(cls==="Monk"&&lv>=10&&!R14())add("Note","Ends Charmed, Frightened, or Poisoned at the end of your turn","Self-Restoration");
   if(R14()&&cls==="Monk"&&lv>=10){add("Immunity","Disease","Purity of Body");add("Immunity","Poisoned","Purity of Body")}
   if(R14()&&cls==="Paladin"&&lv>=3)add("Immunity","Disease","Divine Health");
}
function defSub(add,sub,lv){
  if(sub==="Path of the Berserker"&&lv>=6)add("Immunity","Charmed, Frightened (while raging)","Mindless Rage");
  if(sub==="Life Domain"&&false)add("","","");
  if(sub==="Great Old One Patron"&&lv>=10)add("Resistance","Psychic","Thought Shield");
  if(sub==="Psi Warrior"&&lv>=10)add("Resistance","Psychic","Guarded Mind");
  if(sub==="Aberrant Sorcery"&&lv>=6)add("Resistance","Psychic","Psychic Defenses");
  if(sub==="Oath of the Ancients"&&lv>=7)add("Resistance","Necrotic, Psychic, Radiant","Aura of Warding");
  if(sub==="War Domain"&&lv>=17)add("Resistance","Bludgeoning, Piercing, Slashing","Avatar of Battle");
  if(sub==="Celestial Patron"&&lv>=6)add("Resistance","Radiant","Radiant Soul");
  if(sub==="Archfey Patron"&&lv>=10)add("Immunity","Charmed","Beguiling Defenses");
  if(sub==="Circle of the Land"&&lv>=10)add("Immunity","Poisoned","Nature's Ward")
}
function defClass(add,cls,lv,sub){defClassBase(add,clsInh(cls)||cls,lv);/* a reskin class shows the numbers of the class it copies */defSub(add,sub,lv)}
function defSubChoices(add){
 /* v32 RL49 no. 38: a homebrew subclass choice with dres (Calon Arang: Immunity) adds each chosen type */
 clsParts().forEach((q,i) =>{if(!q.sub)return;subChoicesFor(q.sub).forEach((c) =>{if(!c.dres||q.lv<c.l)return;const v=B.ch[(q.mc?"m"+(i-1)+":":"")+"sc"+c.k];if(Array.isArray(v))v.forEach((t) =>{add(c.dres,t,c.feature)})})});
}
function defFiend(add){
 /* v32 RL49 no. 32: Fiendish Resilience type. Nature's Ward resistance of the land type (Circle of the Land 10) */
 clsParts().forEach((q,i) =>{const pre=q.mc?"m"+(i-1)+":":"";if((q.sub==="Fiend Patron"||q.sub==="The Fiend (2014)")&&q.lv>=10&&B.ch[pre+"p10opt"])add("Resistance",B.ch[pre+"p10opt"],"Fiendish Resilience");
  const lt=B.ch[pre+"land"],lr={Arid:"Fire",Polar:"Cold",Temperate:"Lightning",Tropical:"Poison"}[lt];if(q.sub==="Circle of the Land"&&q.lv>=10&&lr)add("Resistance",lr,"Nature's Ward ("+lt+")")});
}
function defItems(add){(B.inv||[]).forEach((x) =>{if(!x.eq)return;if(x.n==="Ring of Resistance")add("Resistance","One type (set by the ring)","Ring of Resistance");if(/^Mithral|^Adamantine Armor/.test(x.n)&&/Adamantine/.test(x.n))add("Note","Critical Hits against you become normal hits","Adamantine Armor")});}
function defFeats(add){const eat=eaType();if(eat)add("Resistance",eat,"Elemental Affinity (Draconic Sorcery 6)");/* v19 RL41 */
 allFeats().forEach((f) =>{if(f.n==="Boon of Energy Resistance"){const bt=B.ch["ber-"+(f.key||f.s)];if(Array.isArray(bt)&&bt.length)bt.forEach((t) =>{add("Resistance",t,"Boon of Energy Resistance")});else add("Resistance","Two damage types, not chosen yet","Boon of Energy Resistance")}/* v32 RL49 no. 18 */if(f.n==="Heavy Armor Master")add("Note","Reduce Bludgeoning, Piercing, Slashing damage by your Proficiency Bonus in Heavy armor","Heavy Armor Master")});
}
function defFx(add){fxList().forEach((e) =>{if(e.def)add(e.def[0],e.def[1],e.lbl);(e.defs||[]).forEach((r) =>{add(r[0],r[1],e.lbl)});(e.res||[]).forEach((t) =>{add("Resistance",t,e.lbl)});(e.imm||[]).forEach((t) =>{add("Immunity",t,e.lbl)});(e.vul||[]).forEach((t) =>{add("Vulnerability",t,e.lbl)});(e.advOn||[]).forEach((t) =>{add("Note","Advantage on "+t,e.lbl)});if(e.initAdv)add("Note","Advantage on Initiative rolls",e.lbl);/* fx engine v4: condImm [conditions] (Immunity rows like item condImm), noSurprise true or text, initDie "1d10" (note) */(e.condImm||[]).forEach((t) =>{add("Immunity",t+" (condition)",e.lbl)});if(e.noSurprise)add("Note",typeof e.noSurprise==="string"?e.noSurprise:"Cannot be surprised",e.lbl);if(e.initDie)add("Note","Add "+e.initDie+" to Initiative rolls",e.lbl)});/* fx engine v2: def [type,text], defs [[type,text]], res, imm, vul (damage types), advOn (texts), initAdv *//* generic: class fx.def = [type, text] (Resistance, Immunity, Note) */}
function defenses(a){const o=[],L=B.level;function add(t,v,s){o.push({t:t,v:v,s:s})}
 defSpecies(add);
 defClass(add,B.cls,L,B.sub);MCL().forEach((m) =>{defClass(add,m.cls,m.lv,m.sub)});
 defSubChoices(add);defFiend(add);defItems(add);defFeats(add);defFx(add);
 XFX.def(add);/* v62 */
 /* m5 (RL21): one line per type and value, sources joined in order. Class resources (Channel Divinity) are not touched */
 const out=[],at={};o.forEach((x) =>{const k=x.t+"|"+x.v;if(at[k]==null){at[k]=out.length;out.push({t:x.t,v:x.v,s:x.s})}else if((", "+out[at[k]].s+", ").indexOf(", "+x.s+", ")<0)out[at[k]].s+=", "+x.s});
 return out}
