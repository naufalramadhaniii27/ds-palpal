import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {iounOrbitItemName} from '../src/data/lib/ioun-orbit-source.js';
import {IOUN_PROFILES} from '../src/data/lib/ioun-orbit-profiles.js';
const [profile,definition]=Object.entries(IOUN_PROFILES).find(([,v])=>JSON.parse(v.fingerprint)[0]==='Ioun Stone (awareness)');
const supportedMarker={v:1,id:'io-1',nativeProfile:profile,itemFingerprint:definition.fingerprint,parentFingerprint:null};

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const unexpected=()=>{throw new Error('Unrelated source evaluated')};
const ctx={structuredClone,clone:structuredClone,iounOrbitItemName,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};
vm.createContext(ctx);
for(const [file,names] of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]]){
 for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),ctx);
}
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const marker of [supportedMarker,{v:99,opaque:['preserve']},undefined,null,'unknown']){
 for(const key of ["Ioun Stone (awareness)","Ioun Stone",{v:99,opaque:["key"]}]){
  const raw={n:"Ioun Stone (awareness)",key,iounOrbit:structuredClone(marker)},before=structuredClone(raw),sheet={n:'A cosmetic alias',key:raw.n};
  ctx.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.iounOrbit,marker);eq(Object.hasOwn(sheet,'iounOrbit'),true);
  const imported={};ctx.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.iounOrbit,marker);
  const restored={};ctx.invTattoo(imported,restored);eq(restored.key,key);eq(restored.iounOrbit,marker);
  eq(ctx.fsInvNativeName(sheet),iounOrbitItemName(key)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Ioun Orbit marker/key roundtrip assertions PASS');
