import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {defenderItemName} from '../src/data/lib/defender-source.js';

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,defenderItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'dfp-1',base:'Longsword'},{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ['Defender',{v:99,opaque:['key']}]){
  const raw={n:'Defender',key,defender:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.defender,marker);eq(Object.hasOwn(sheet,'defender'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.defender,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.defender,marker);
  eq(ctx.fsInvNativeName(sheet),defenderItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Defender marker/key roundtrip assertions PASS');
