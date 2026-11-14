import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {rodAbsorptionItemName,rodAbsorptionMarker} from '../src/data/lib/rod-absorption-source.js';
import {ROD_ABSORPTION_PROFILE,ROD_ABSORPTION_FINGERPRINT} from '../src/data/lib/rod-absorption-profile.js';
const supportedMarker=rodAbsorptionMarker({id:'ra-1',profile:ROD_ABSORPTION_PROFILE,fingerprint:ROD_ABSORPTION_FINGERPRINT});

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,rodAbsorptionItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [supportedMarker,{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ["Rod of Absorption","Future native rod",{v:99,opaque:["key"]}]){
  const raw={n:"Rod of Absorption",key,rodAbsorption:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.rodAbsorption,marker);eq(Object.hasOwn(sheet,'rodAbsorption'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.rodAbsorption,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.rodAbsorption,marker);
  eq(ctx.fsInvNativeName(sheet),rodAbsorptionItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Rod Absorption marker/key roundtrip assertions PASS');
