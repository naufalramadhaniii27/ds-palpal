import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {magicRopesItemName} from '../src/data/lib/magic-ropes-source.js';

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,magicRopesItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'mrp-1',nativeProfile:'dmg2024-climbing'},{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ["Rope of Climbing","Rope of Entanglement",{v:99,opaque:["key"]}]){
  const raw={n:"Rope of Climbing",key,magicRopes:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.magicRopes,marker);eq(Object.hasOwn(sheet,'magicRopes'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.magicRopes,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.magicRopes,marker);
  eq(ctx.fsInvNativeName(sheet),magicRopesItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Magic Rope marker/key roundtrip assertions PASS');
