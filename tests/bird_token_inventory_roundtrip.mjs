import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {birdTokenItemName} from '../src/data/lib/bird-token-source.js';

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,birdTokenItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'qbtp-1',nativeProfile:'dmg2024-bird'},{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ["Quaal's Feather Token","Quaal's Feather Token (bird)",{v:99,opaque:["key"]}]){
  const raw={n:"Quaal's Feather Token",key,birdToken:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.birdToken,marker);eq(Object.hasOwn(sheet,'birdToken'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.birdToken,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.birdToken,marker);
  eq(ctx.fsInvNativeName(sheet),birdTokenItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Bird token marker/key roundtrip assertions PASS');
