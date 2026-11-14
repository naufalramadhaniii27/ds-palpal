import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {timedDefensesItemName} from '../src/data/lib/timed-defenses-source.js';

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,timedDefensesItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'tdp-1',nativeProfile:'dmg2024-armor-invulnerability'},{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ["Armor of Invulnerability","Potion of Resistance",{v:99,opaque:["key"]}]){
  const raw={n:"Armor of Invulnerability",key,timedDefenses:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.timedDefenses,marker);eq(Object.hasOwn(sheet,'timedDefenses'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.timedDefenses,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.timedDefenses,marker);
  eq(ctx.fsInvNativeName(sheet),timedDefensesItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Timed Defense marker/key roundtrip assertions PASS');
