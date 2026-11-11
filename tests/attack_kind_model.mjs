import assert from 'node:assert/strict';
import {normalizeAttackKinds as normalize,allowedAttackKinds as allowed,resolveAttackKind as resolve,attackKindMatches as matches,reviewedSpellAttackKind as spell,attackKindsForRow as kinds} from '../src/data/lib/attack-kind.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const missing of [undefined,[]]){eq(normalize(missing),[]);eq(allowed(missing),['melee','ranged']);eq(resolve(missing),'');eq(resolve(missing,'melee'),'melee');eq(resolve(missing,'ranged'),'ranged');eq(matches('melee',missing),false);eq(matches('melee',missing,'melee'),true);}
for(const bad of [null,'','M','R','MELEE','spell',' melee ',{},false,0,['melee','invalid'],['ranged',null]]){eq(normalize(bad),null);eq(allowed(bad),[]);eq(resolve(bad,'melee'),'');eq(matches('melee',bad,'melee'),false);}
for(const kind of ['melee','ranged']){eq(normalize(kind),[kind]);eq(allowed(kind),[kind]);eq(resolve(kind),kind);eq(resolve([kind]),kind);eq(resolve(kind,kind),kind);eq(resolve(kind,kind==='melee'?'ranged':'melee'),'');for(const bad of ['M','MELEE','invalid',{},[],true])eq(resolve(kind,bad),'');}
const dual=['ranged','melee','ranged'];eq(normalize(dual),['melee','ranged']);eq(dual,['ranged','melee','ranged']);eq(resolve(dual),'');eq(resolve(dual,'melee'),'melee');eq(resolve(dual,'ranged'),'ranged');eq(matches('melee',dual),false);eq(matches('melee',dual,'melee'),true);eq(matches('melee',dual,'ranged'),false);
for(const kind of [null,'','M','invalid',{}])eq(matches(kind,'melee','melee'),false);
// A known ranged hit cannot be relabeled melee by a declaration.
eq(matches('melee','ranged','melee'),false);eq(matches('melee','melee'),true);
// Spell names and distances never supply a fallback for an unknown spell.
eq(spell('Chill Touch','2024'),'melee');eq(spell('Chill Touch','2014'),'ranged');eq(spell('Thorn Whip','2024'),'melee');eq(spell('Shocking Grasp','2014'),'melee');eq(spell('Fire Bolt','2024'),'ranged');eq(spell('Unknown Touch Spell','2024'),'');eq(spell('Shocking Grasp','unknown'),'');eq(spell('toString','2024'),'');eq(spell('Poison Spray','2014'),'');
const allowedCopy=allowed(undefined);allowedCopy.length=0;eq(allowed(undefined),['melee','ranged']);
console.log(checks+' per-hit attack kind normalization/declaration/eligibility/table checks PASS');

const melee={k:'M',p:'Versatile'},thrown={k:'M',p:'Finesse, Thrown (20/60)'},ranged={k:'R',p:'Ammunition'};
eq(kinds({n:'Unarmed Strike'},null,'2024',''),['melee']);
eq(kinds({n:'Longsword',range:'500 ft'},melee,'2024','Longsword'),['melee']);
eq(kinds({n:'Dagger'},thrown,'2024','Dagger'),['melee','ranged']);
eq(kinds({n:'Dagger',sub:'Finesse, Thrown (20/60)'},melee,'2024','Dagger'),['melee','ranged']);
eq(kinds({n:'Dagger (thrown)',sub:'Finesse, Thrown (20/60) • ranged attack'},thrown,'2024','Dagger'),['ranged']);
eq(kinds({n:'Dwarven Thrower (thrown)',sub:'Versatile • ranged attack'},null,'2024',''),['ranged']);
eq(kinds({n:'Dwarven Thrower (thrown)'},melee,'2024','Warhammer'),[]);
eq(kinds({n:'Dagger (thrown)'},thrown,'2024','Dagger'),[]);

eq(kinds({n:'Longbow',range:'Touch'},ranged,'2024','Longbow'),['ranged']);
eq(kinds({n:'Dwarven Thrower'},melee,'2024','Warhammer'),[]);
eq(kinds({n:'Holy Avenger'},melee,'2024','Longsword'),[]);
for(const n of ['Pole Strike','Pole Strike (Spear)'])eq(kinds({n,of:'Spear'},null,'2024',''),['melee']);
eq(kinds({n:'Pole Strike'},null,'2024',''),[]);
for(const n of ['Psychic Blade','Psychic Blade (Bonus Action)'])eq(kinds({n},null,'2024',''),['melee','ranged']);
eq(kinds({n:'Starry Form: Archer'},null,'2024',''),['ranged']);
for(const rs of ['2024','2014']){eq(kinds({n:'Thorn Whip',sub:'Cantrip',range:'30 ft'},null,rs,''),['melee']);eq(kinds({n:'Chill Touch',sub:'Cantrip'},null,rs,''),[rs==='2024'?'melee':'ranged']);eq(kinds({n:'Fire Bolt',sub:'Cantrip'},null,rs,''),['ranged']);}
eq(kinds({n:'Fire Bolt',sub:'Granted attack',range:'Touch'},null,'2024',''),[]);
eq(kinds({n:'Unknown Touch',sub:'Cantrip',range:'Touch'},null,'2024',''),[]);
eq(kinds({n:'Bite',sub:'Natural weapon',gk:'M',range:'5 ft'},null,'2024',''),[]);
eq(kinds({n:'Granted',gk:'R',range:'30/60 ft'},null,'2024',''),[]);
for(const raw of [null,'','M',{},['melee','bad']]){const result=kinds({n:'Unarmed Strike',attackKinds:raw},null,'2024','');eq(result,null);eq(matches('melee',result,'melee'),false);}
eq(kinds({n:'Unknown',attackKinds:['ranged']},null,'2024',''),['ranged']);eq(kinds({n:'Unknown',attackKinds:[]},null,'2024',''),[]);
for(const row of [null,[],1,'Unarmed Strike'])eq(kinds(row,null,'2024',''),null);
const row={n:'Dagger',sub:'Thrown (20/60)'},original=JSON.stringify(row);kinds(row,melee,'2024','Dagger');eq(JSON.stringify(row),original);
eq(kinds({n:'Bite',sub:'Natural weapon',attackKinds:['melee']},null,'2024',''),['melee']);
eq(kinds({n:'Unreviewed Magic (thrown)',attackKinds:['ranged']},melee,'2024','Warhammer'),['ranged']);
for(const edition of ['__proto__','constructor','toString'])for(const name of ['constructor','toString','Chill Touch'])eq(spell(name,edition),'');
console.log(checks+' total attack kind model checks PASS');
