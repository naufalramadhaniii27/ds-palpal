import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {bagTricksItemName} from '../src/data/lib/bag-tricks-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('An unrelated typed source was evaluated')};
const ctx={structuredClone,clone:structuredClone,bagTricksItemName,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]])for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'btp-1',nested:{color:'gray'}},{v:99,opaque:['preserve']},undefined,null,'unknown'])for(const key of ['Bag of Tricks','Bag of Tricks, Gray','opaque-key',{v:99,opaque:['key']}]){
 const raw={n:'Bag of Tricks',q:1,key,bagTricks:structuredClone(marker)},before=JSON.stringify(raw),sheet={n:'A cosmetic alias',key:raw.n};
 ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.bagTricks,marker);eq(Object.hasOwn(sheet,'bagTricks'),true);
 const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.bagTricks,marker);
 const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.bagTricks,marker);
 eq(ctx.fsInvNativeName(sheet),bagTricksItemName(key)?key:sheet.n);eq(JSON.stringify(raw),before);
}
console.log(checks+' actual native Bag marker/key roundtrip assertions PASS');
