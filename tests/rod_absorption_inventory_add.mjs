import {travelGoatItemName} from '../src/data/lib/travel-goat-source.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {rodAbsorptionItemName} from '../src/data/lib/rod-absorption-source.js';
import {iounOrbitItemName} from '../src/data/lib/ioun-orbit-source.js';
import {timedDefensesItemName} from '../src/data/lib/timed-defenses-source.js';
import {magicRopesItemName} from '../src/data/lib/magic-ropes-source.js';
import {birdTokenItemName} from '../src/data/lib/bird-token-source.js';
import {defenderItemName} from '../src/data/lib/defender-source.js';
import {hornValhallaItemName} from '../src/data/lib/horn-valhalla-source.js';
import {bagTricksItemName} from '../src/data/lib/bag-tricks-source.js';
import {studyBookProfileForItem} from '../src/data/lib/study-books.js';
import {storedSpellProfile} from '../src/data/lib/stored-spell.js';
import {slotRecoveryProfile} from '../src/data/lib/slot-recovery.js';
import {spellGemProfile} from '../src/data/lib/spell-gem.js';
import {spellwroughtTattooProfile} from '../src/data/lib/spellwrought-tattoo.js';
import {allPurposeMetadata} from '../src/data/lib/all-purpose-source.js';
import {riddenVehicleMetadata} from '../src/data/lib/ridden-vehicle.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),source=read('builder/22-ui-shell.js').split('\n').find(line=>line.startsWith(' if(d.iadd){'));
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
function fixture(row){const c={travelGoatItemName,rodAbsorptionItemName,iounOrbitItemName,timedDefensesItemName,magicRopesItemName,birdTokenItemName,defenderItemName,hornValhallaItemName,bagTricksItemName,studyBookProfileForItem,storedSpellProfile,slotRecoveryProfile,spellGemProfile,spellwroughtTattooProfile,allPurposeMetadata,riddenVehicleMetadata,B:{rs:'2024',inv:[structuredClone(row)]},ARMOR:{},DMAP:{},addQty:{},bMsg:'',equippable:()=>false,ensureInv:()=>c.B.inv,commit(){},toast(){},__set_bMsg(){}};vm.createContext(c);vm.runInContext('function nativeAdd(d){'+source+'}',c);return c;}
for(const name of ['Rod of Absorption','Future cosmetic alias'])for(const marker of [undefined,null,{v:99,opaque:'preserve'}])for(const q of [0,1]){
 const c=fixture({n:name,q,eq:false,rodAbsorption:marker}),old=c.B.inv[0];c.nativeAdd({iadd:name,qty:1});eq(c.B.inv.length,2);eq(c.B.inv[0],old);eq(c.B.inv[0].q,q);eq(Object.hasOwn(old,'rodAbsorption'),true);eq(old.rodAbsorption,marker);eq(c.B.inv[1].q,1);eq(Object.hasOwn(c.B.inv[1],'rodAbsorption'),false);
}
const normal=fixture({n:'Rations',q:2});normal.nativeAdd({iadd:'Rations',qty:1});eq(normal.B.inv.length,1);eq(normal.B.inv[0].q,3);
for(const file of ['builder/24-ui-icons.js','builder/25-logic-hooks-for-the-sheet.js']){const name=file.includes('24-')?'typedInventoryWriteAllowed':'physicalSyncAllowed',line=read(file).split('\n').find(l=>l.startsWith('function '+name+'(')),c={genv:{},storedSpellProfile};vm.createContext(c);vm.runInContext(line,c);eq(c[name]({n:'Rod of Absorption',rodAbsorption:undefined},'Rod of Absorption',0),false);eq(c[name]({n:'Rations'},'Rations',0),true);}
console.log(checks+' actual Add/no-coalesce/typed write boundary assertions PASS');
