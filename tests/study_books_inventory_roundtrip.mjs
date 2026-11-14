import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {studyBookProfileForItem} from '../src/data/lib/study-books.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const context={structuredClone,clone:structuredClone,studyBookProfileForItem,slotRecoveryProfile:()=>null,storedSpellProfile:()=>null};
vm.createContext(context);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]])for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),context);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [{v:1,id:'sbp-1',profile:'thought',epoch:0,available:false},{v:99,opaque:['future']},null,'unknown',17])for(const key of ['Tome of Clear Thought','opaque-key',null,17,{v:99,opaque:['key']}]){
 const raw={n:'Tome of Clear Thought',q:1,key,studyBook:structuredClone(marker)},before=JSON.stringify(raw),sheet={n:'A displayed alias',key:raw.n};
 context.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.studyBook,marker);
 const imported={};context.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.studyBook,marker);
 const returned={};context.invTattoo(imported,returned);eq(returned.key,key);eq(returned.studyBook,marker);eq(JSON.stringify(raw),before);
 eq(context.fsInvNativeName(sheet),key==='Tome of Clear Thought'?key:sheet.n);
}
const plain={n:'Ordinary item'},output={};context.invTattoo(plain,output);eq(output,{});eq(context.fsInvNativeName(plain),plain.n);
console.log(checks+' actual native study-book marker/key roundtrip assertions PASS');
