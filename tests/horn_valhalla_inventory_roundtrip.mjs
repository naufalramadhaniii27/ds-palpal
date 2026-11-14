import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {hornValhallaItemName} from '../src/data/lib/horn-valhalla-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,hornValhallaItemName,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]])for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'hvp-1',nested:{metal:'silver'}},{v:99,opaque:['preserve']},undefined,null,'unknown'])for(const key of ['Horn of Valhalla','Horn of Valhalla (silver)','Horn of Valhalla, Silver',{v:99,opaque:['key']}]){
 const raw={n:'Horn of Valhalla',key,hornValhalla:structuredClone(marker)},before=JSON.stringify(raw),sheet={n:'A cosmetic alias',key:raw.n};
 ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.hornValhalla,marker);eq(Object.hasOwn(sheet,'hornValhalla'),true);
 const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.hornValhalla,marker);
 const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.hornValhalla,marker);
 eq(ctx.fsInvNativeName(sheet),hornValhallaItemName(key)?key:sheet.n);eq(JSON.stringify(raw),before);
}
console.log(checks+' actual native Horn marker/key roundtrip assertions PASS');
