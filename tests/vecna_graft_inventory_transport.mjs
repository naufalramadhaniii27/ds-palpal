import {instrumentProfileForItem,INSTRUMENT_GENERIC_ITEM,instrumentProfiles} from '../src/data/lib/instrument-spell-profiles.js';
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

import {vecnaGraftProfiles,canonical} from '../src/data/lib/vecna-graft-profiles.js';
import {createVecnaManagementEngine} from './fixtures/vecna-management-native.mjs';
import {installInstrumentApp17} from './fixtures/instrument-app17-native.mjs';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),line=(file,prefix)=>read(file).split('\n').find(s=>s.startsWith(prefix));
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++},profiles=vecnaGraftProfiles();
const helpers={vecnaGraftProfiles,instrumentProfileForItem,INSTRUMENT_GENERIC_ITEM,travelGoatItemName,rodAbsorptionItemName,iounOrbitItemName,timedDefensesItemName,magicRopesItemName,birdTokenItemName,defenderItemName,hornValhallaItemName,bagTricksItemName,studyBookProfileForItem,storedSpellProfile,slotRecoveryProfile,spellGemProfile,spellwroughtTattooProfile,allPurposeMetadata,riddenVehicleMetadata};
const transport=vm.createContext({...helpers,structuredClone,clone:structuredClone});
for(const [file,names]of [['builder/12i-logic-sheet-handlers-gear-resources.js',['invTattoo']],['builder/15-logic-import-from-sheet.js',['fsInvTyped','fsInvNativeName']]])for(const name of names)vm.runInContext(line(file,'function '+name+'('),transport);
for(const p of profiles)for(const marker of [{v:1,id:'vg-1'},{v:99,opaque:['preserve']},null,undefined]){
 const raw={n:p.item,key:p.item,q:1,vecnaGraft:structuredClone(marker)},before=structuredClone(raw),sheet={n:'Cosmetic display name',key:raw.n};transport.invTattoo(raw,sheet);eq(sheet.vecnaGraft,marker);eq(Object.hasOwn(sheet,'vecnaGraft'),true);eq(sheet.key,p.item);const imported={};transport.fsInvTyped(sheet,imported);eq(imported.vecnaGraft,marker);eq(imported.key,p.item);eq(transport.fsInvNativeName(sheet),p.item);eq(raw,before);
 const c={...helpers,B:{rs:'2024',inv:[structuredClone(raw)]},ARMOR:{},DMAP:{},addQty:{},bMsg:'',equippable:()=>false,ensureInv:()=>c.B.inv,commit(){},toast(){},__set_bMsg(){}};vm.createContext(c);vm.runInContext('function add(d){'+line('builder/22-ui-shell.js',' if(d.iadd){')+'}',c);c.add({iadd:p.item,qty:1});eq(c.B.inv.length,2);eq(c.B.inv[0],raw);eq(c.B.inv[1].q,1);eq(Object.hasOwn(c.B.inv[1],'vecnaGraft'),false);
 let writes=0;c.commit=()=>writes++;c.qOf=x=>x.q;for(const [prefix,d]of [[' if(d.iq!=null)',{iq:0,d:1}],[' if(d.irm!=null)',{irm:0}]]){vm.runInContext('function blocked(d){'+line('builder/22-ui-shell.js',prefix)+'}',c);const snapshot=structuredClone(c.B);c.blocked(d);eq(c.B,snapshot);eq(writes,0);}
}
const opaque={n:'Display alias',key:{v:99,opaque:'native key'},vecnaGraft:undefined},saved={};transport.invTattoo(opaque,saved);const imported={};transport.fsInvTyped(saved,imported);eq(imported.key,opaque.key);eq(Object.hasOwn(imported,'vecnaGraft'),true);eq(imported.vecnaGraft,undefined);
const f=createVecnaManagementEngine();installInstrumentApp17(f.e);const c=f.e.c,admit={actualPhysicalArtifactIdentityVerified:true,actualCurrentOriginalSourceVerified:true};
for(const [index,profile,part]of [[0,'current-eye','eye'],[1,'current-hand','hand']]){eq(f.command('admit',{index,profile,facts:admit}).ok,true);eq(f.command('attachment',{physicalId:'vg-'+(index+1),facts:{actualPhysicalIdentityVerified:true,[part==='eye'?'actualEyeFusedIntoThisCharactersSocket':'actualHandGraftedOntoThisCharactersLeftStump']:true,printedRemovalConsequenceAcknowledged:true}}).ok,true);}
c.storedSpellProfile=storedSpellProfile;vm.runInContext(line('builder/21-ui-rules-reference.js','export function invFind(').replace('export ',''),c);vm.runInContext(line('builder/24-ui-icons.js','function typedInventoryWriteAllowed('),c);for(const name of ['__bldToggleEq','__bldSetQty','__bldRemove'])vm.runInContext(line('builder/24-ui-icons.js','genv.'+name+'='),c);
c.toSheet=()=>f.e.project();let writes=0;const save=c.save;c.save=()=>{writes++;return save()};const name=profiles[0].item,before=canonical([c.B,f.e.C,c.S]);eq(c.genv.__bldRemove(name,0),false);eq(c.genv.__bldSetQty(name,0,0),false);eq(c.genv.__bldSetQty(name,2,0),false);eq(writes,0);eq(canonical([c.B,f.e.C,c.S]),before);
const ownerPort=c.genv.__vecnaGraftsInventoryWriteAllowed;eq(ownerPort(name,0),true);delete c.genv.__vecnaGraftsInventoryWriteAllowed;eq(c.genv.__bldToggleEq(name,0),false);eq(writes,0);eq(canonical([c.B,f.e.C,c.S]),before);c.genv.__vecnaGraftsInventoryWriteAllowed=ownerPort;c.genv.__bldToggleEq(name,0);eq(writes,1);eq(c.B.inv[0].eq,true);eq(f.e.C.itemAdv.some(row=>row.s==='Eye and Hand of Vecna'),true);
const history=canonical(c.S.vecnaGrafts);eq(ownerPort(name,0),true);c.B.inv[0].attuned=false;let next=f.e.project();eq(c.attunementState().rows[0].attuned,false);eq(f.controller.inventoryOwner(f.e.C,next,c.S).ok,true);c.genv.__sheetSoft(next);eq(f.e.C.itemAdv.some(row=>row.s==='Eye and Hand of Vecna'),false);eq(canonical(c.S.vecnaGrafts),history);
c.B.inv[0].attuned=true;next=f.e.project();eq(f.controller.inventoryOwner(f.e.C,next,c.S).ok,true);c.genv.__sheetSoft(next);eq(f.e.C.itemAdv.some(row=>row.s==='Eye and Hand of Vecna'),true);
eq(f.command('absence',{physicalId:'vg-1',facts:{actualPhysicalSourceAbsent:true}}).ok,true);eq(c.B.inv.some(row=>row.vecnaGraft?.id==='vg-1'),false);eq(f.command('return',{physicalId:'vg-1',facts:{actualSamePhysicalArtifactReturned:true,recordedGraftHistoryUnchanged:true}}).ok,true);const returned=c.B.inv.find(row=>row.vecnaGraft?.id==='vg-1');eq(returned.attuned,false);eq(returned.eq,false);eq(c.S.vecnaGrafts.physical[0].id,'vg-1');
console.log(`${checks} actual Vecna raw transport/Add/write-port/ATT/absence-return checks PASS`);
