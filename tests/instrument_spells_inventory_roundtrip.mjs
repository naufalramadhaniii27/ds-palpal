import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {instrumentProfileForItem,INSTRUMENT_GENERIC_ITEM,instrumentProfiles} from '../src/data/lib/instrument-spell-profiles.js';
import {travelGoatItemName} from '../src/data/lib/travel-goat-source.js';

const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),unexpected=()=>{throw Error('Unrelated source evaluated')};
const c={instrumentProfileForItem,INSTRUMENT_GENERIC_ITEM,structuredClone,clone:structuredClone,travelGoatItemName,rodAbsorptionItemName:unexpected,iounOrbitItemName:unexpected,timedDefensesItemName:unexpected,magicRopesItemName:unexpected,birdTokenItemName:unexpected,defenderItemName:unexpected,hornValhallaItemName:unexpected,bagTricksItemName:unexpected,studyBookProfileForItem:unexpected,slotRecoveryProfile:unexpected,storedSpellProfile:unexpected};vm.createContext(c);
for(const [file,names]of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]])for(const name of names)vm.runInContext(read(file).split('\n').find(line=>line.startsWith('function '+name+'(')),c);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
for(const profile of instrumentProfiles().concat({item:INSTRUMENT_GENERIC_ITEM})){
 const valid={v:1,id:'isp-1'};
 for(const marker of [valid,{v:99,opaque:['preserve']},undefined,null,'unknown'])for(const key of [profile.item,'Future source',{v:99,opaque:['key']}]){
  const raw={n:profile.item,key,instrumentSpells:structuredClone(marker)},before=structuredClone(raw),sheet={n:'Cosmetic alias',key:raw.n};c.invTattoo(raw,sheet);eq(sheet.key,key);eq(sheet.instrumentSpells,marker);eq(Object.hasOwn(sheet,'instrumentSpells'),true);
  const imported={};c.fsInvTyped(sheet,imported);eq(imported.key,key);eq(imported.instrumentSpells,marker);const restored={};c.invTattoo(imported,restored);eq(restored.key,key);eq(restored.instrumentSpells,marker);eq(c.fsInvNativeName(sheet),(instrumentProfileForItem(key)||key===INSTRUMENT_GENERIC_ITEM)?key:sheet.n);eq(raw,before);
 }
}
console.log(checks+' actual native Instrument marker/key roundtrip assertions PASS');
