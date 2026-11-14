import assert from 'node:assert/strict';
import * as s from '../src/data/lib/bracers-source.js';
import {BRACERS_PROFILES} from '../src/data/lib/bracers-profiles.js';
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
const rows=Object.values(BRACERS_PROFILES).map(p=>JSON.parse(p.fingerprint)),def='Bracers of Defense',arch='Bracers of Archery';
const registry={armorDef:n=>({Shield:{cat:'Shield'},Plate:{cat:'Heavy'}}[n]),baseOf:n=>({b:n==='Enchanted Guard'?'Shield':n}),weaponDef:n=>n==='Sword'?{}:null,gearDefinition:n=>n==='Rope'?[]:null,itemDefinition:n=>rows.find(r=>r[0]===n),customDefinition:()=>null};
for(const [name,want] of [['Shield',true],['Enchanted Guard',true],['Plate',false],['Sword',false],['Rope',false],[def,false],['Unknown',null]])eq(s.classifyBracersShield({n:name},registry),want);
eq(s.classifyBracersShield({n:'Shield'},{...registry,customDefinition:()=>({})}),null);
eq(s.classifyBracersShield({n:'Shield'},{...registry,armorDef:()=>null}),true);
eq(s.classifyBracersShield({n:'Enchanted Guard'},{...registry,armorDef:()=>null}),true);
eq(s.bracersSourceProfile(rows,def)?.kind,'defense');
eq(s.bracersSourceProfile([...rows,rows[1]],def),null);
for(const options of [{customItems:[{n:def}]},{fxOverrides:{[def]:undefined}}])eq(s.bracersSourceProfile(rows,def,options),null);
for(const value of [undefined,[],[{n:'override',ac:99}]])eq(s.bracersSourceProfile(rows,def,{gxItems:{[def]:value}}),null);
const gx={[arch]:[{n:arch,weapons:['Longbow','Shortbow'],atkBonus:[{when:['Longbow','Shortbow'],dmg:2}]}]};
eq(s.bracersSourceProfile(rows,arch,{gxItems:gx})?.kind,'archery');gx[arch][0].atkBonus[0].dmg=3;eq(s.bracersSourceProfile(rows,arch,{gxItems:gx}),null);
const part={s:'Bracers of Defense (no armor or Shield)',v:2};
function character(extra=[]){const inv=[{n:def,q:1,eq:true,att:1,attunedActive:true},...extra];return {inv,bracersDefense:{v:1,itemFingerprint:BRACERS_PROFILES[def].fingerprint,sourceIndex:0,sourceWorn:true,sourceAttuned:true,armorWorn:false,shieldClasses:inv.map(r=>s.classifyBracersShield(r,registry)),inventoryFingerprint:s.canonicalBracersInventory(inv),acPartIndex:0}}}
let C=character();eq(s.bracersDefenseWitnessProblems(C.bracersDefense),[]);eq(s.bracersDefensePartEligible(C,part,0),true);
for(const row of [{n:'Shield',q:1,eq:false},{n:'Enchanted Guard',q:1,eq:false},{n:'Unknown',q:1}])eq(s.bracersDefensePartEligible(character([row]),part,0),false);
eq(s.bracersDefensePartEligible(character([{n:'Shield',q:0}]),part,0),true);
for(const change of [{eq:false},{attunedActive:false},{q:0},{iounOrbit:undefined}]){C=character();Object.assign(C.inv[0],change);C.bracersDefense.inventoryFingerprint=s.canonicalBracersInventory(C.inv);eq(s.bracersDefensePartEligible(C,part,0),false)}
C=character();C.inv[0].extra=undefined;eq(s.bracersDefensePartEligible(C,part,0),false);
for(const cap of [undefined,null,{v:99}])eq(s.bracersDefensePartEligible({inv:[],bracersDefense:cap},part,0),false);
eq(s.bracersDefensePartEligible({}, {...part,v:7},0),true);eq(s.bracersDefensePartEligible({}, {s:'Manual',v:2},0),true);
eq(s.canonicalBracersInventory([{}])===s.canonicalBracersInventory([{future:undefined}]),false);
for(const marker of ['iounOrbit','timedDefenses','storedSpells'])eq(s.bracersInventorySourceSupported({n:arch,[marker]:undefined},arch),false);
eq(s.bracersInventorySourceSupported({n:arch},arch),true);
{const row={n:'Shield',q:1},before=s.canonicalBracersInventory(row);Object.defineProperty(row,'future',{value:undefined});eq(s.canonicalBracersInventory(row)===before,false);}
console.log(n+' Bracers source/classification/witness checks PASS');
