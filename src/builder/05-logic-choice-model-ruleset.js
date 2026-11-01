import {clone} from "./01-logic-core-helpers.js";
import {B} from "./04-logic-storage.js";
/* ---------- choice model ---------- */
export function CL(){return CLASSES[B.cls]}
/* v82: ruleset. B.rs is "2014" for a character that plays by the 2014 rules, anything else is 2024. The switch shows only while the flag cs-rs14 is on, until the mode is finished */
export function R14(){return !!B&&B.rs==="2014"} export var RS14_ON=true;/* v95: the Rules edition choice is open to everyone (before, it needed the cs-rs14 flag) */
/* v95: switching the rules edition. The choices that belong to one edition (race or species, background, subclass, class picks, spells, kit) are set aside under B.rsKeep for the edition the character leaves, and come back when the character returns. A first switch starts those choices empty. Name, scores, class, level, multiclass classes, inventory and coins stay */
var RSK=["species","bg","bg2","bg1","bgMode","size","sub","mc","ch","pk","sp","spm","eqC","eqB","eqG","eqP"], RSU=["species","bg","eqC","eqB"];
export function rsStash(from){B.rsKeep=B.rsKeep||{};var o={u:{}};RSK.forEach(function(k){if(B[k]!==undefined)o[k]=clone(B[k])});RSU.forEach(function(k){o.u[k]=!!(B.unset&&B.unset[k])});B.rsKeep[from]=o}
export function rsLoad(to){var K=(B.rsKeep||{})[to],old=clone(B.mc||[]);RSK.forEach(function(k){delete B[k]});B.unset=B.unset||{};
 if(K){RSK.forEach(function(k){if(K[k]!==undefined)B[k]=clone(K[k])});RSU.forEach(function(k){if(K.u&&K.u[k])B.unset[k]=1;else delete B.unset[k]});delete B.rsKeep[to]}
 else{B.species=to==="2014"?"Human (2014)":"Human";B.bg=to==="2014"?"Acolyte (2014)":"Soldier";B.bgMode=to==="2014"?"111":"21";B.bg2="";B.bg1="";B.size="";B.sub="";B.ch={};B.eqC="A";B.eqB="A";B.eqG=[];B.eqP={};B.mc=old.map(function(m){m.sub="";return m});RSU.forEach(function(k){B.unset[k]=1})}
 if(B.rsKeep&&!Object.keys(B.rsKeep).length)delete B.rsKeep}
/* v85: 2014 classes. Subclass level, subclass list and feature levels of the 2014 books. Levels come from 5e.tools (data/class). */
export var SUBLV14={Barbarian:3,Bard:3,Cleric:1,Druid:2,Fighter:3,Monk:3,Paladin:3,Ranger:3,Rogue:3,Sorcerer:1,Warlock:1,Wizard:2,Artificer:3};
export var SUBLBL14={Barbarian:"Primal Path",Bard:"Bard College",Cleric:"Divine Domain",Druid:"Druid Circle",Fighter:"Martial Archetype",Monk:"Monastic Tradition",Paladin:"Sacred Oath",Ranger:"Ranger Archetype",Rogue:"Roguish Archetype",Sorcerer:"Sorcerous Origin",Warlock:"Otherworldly Patron",Wizard:"Arcane Tradition",Artificer:"Artificer Specialist"};
export var SRC14=["phb14","dmg14","scag","xge","tce","vrgr","egw","ftd","psa","psk","dsotdq","bgg","mtf","erlw","ggr","mot","toa","ai","oga","lr","ttp","eepc"];
