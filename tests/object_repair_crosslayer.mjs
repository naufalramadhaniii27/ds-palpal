import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {mendingRepairSpec,repairSpecProblems} from '../src/data/lib/object-repair.js';
import {resolveObjectRepairProfile as resolve,evaluateRepairRequest as evaluate} from '../src/app/lib/object-repair-runtime.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const source={item:"Forgemaster's Might (Maul)",itemState:'attuned',requiresAttunement:true,grantsKnowledge:true,maxBreakFeet:5};
const character={inv:[{key:source.item,q:1,eq:false,attuned:true,attunedActive:true}]};
const spell={n:'Mending',l:0,objectRepair:{spell:'Mending',maxBreakFeet:5,baseKnown:false,sources:[source]}};
const target={object:true,kind:'MagicItem',singleBreak:true,touch:true,dimensionsFeet:[5,0,0]},facts={components:true,equipment:true,castingTimeComplete:true};
let profile=resolve(character,spell);eq(profile.known,true);eq(profile.spec.maxBreakFeet,5);eq(evaluate(profile,target,facts,false).magicRestored,false);
// Item remains usable stowed, and every actual source boundary is checked again.
for(const change of [{q:0},{q:'bad'},{attuned:false},{attunedActive:false}]){
 const actor={inv:[{...character.inv[0],...change}]};const absent=resolve(actor,spell);eq(absent.known,false);eq(absent.spec.maxBreakFeet,1);eq(absent.signature===profile.signature,false);
 const independent=resolve(actor,{...spell,objectRepair:{...spell.objectRepair,baseKnown:true}});eq(independent.known,true);eq(independent.spec.maxBreakFeet,1);eq(evaluate(independent,target,facts,false).reason,'oversize');
}
eq(resolve({inv:[]},spell).known,false);eq(resolve(character,{...spell,l:1}).known,false);
for(const axis of [0,1,2])for(const dimension of [-1,NaN,Infinity,5.01]){const dimensionsFeet=[0,0,0];dimensionsFeet[axis]=dimension;eq(evaluate(profile,{...target,dimensionsFeet},facts,false).ok,false)}
eq(evaluate(profile,{...target,dimensionsFeet:[0,0,0]},facts,false).ok,false);eq(evaluate(profile,{...target,kind:'Construct'},facts,false).ok,false);
for(const fact of Object.keys(facts))eq(evaluate(profile,target,{...facts,[fact]:false},false).ok,false);
eq(evaluate(profile,target,facts,true).reason,'rage');
const twice=resolve(character,{...spell,objectRepair:{...spell.objectRepair,sources:[source,{...source}]}});eq(twice.spec.maxBreakFeet,5);
// Run actual backend finish helper so typed output is consumed by actual runtime.
const text=fs.readFileSync(new URL('../src/builder/12k-logic-sheet-handlers-spells.js',import.meta.url),'utf8');const start=text.indexOf('function repairEffectSource'),end=text.indexOf('registerSheetGroup({id:"spell-object-repair"',start);
const context={mendingRepairSpec,repairSpecProblems,structuredClone};vm.createContext(context);vm.runInContext(text.slice(start,end),context);
const row={n:'Mending',l:0,_repairKnowledge:{baseKnown:false,sources:[{...source,maxBreakFeet:1}]}};
context.finishRepairProfile(row,[{...source,grantsKnowledge:false}]);eq(row.objectRepair.baseKnown,false);eq(row.objectRepair.sources[0].grantsKnowledge,true);eq(row.objectRepair.maxBreakFeet,5);eq('_repairKnowledge' in row,false);eq(resolve(character,row).known,true);
const independent={n:'Mending',l:0,_repairKnowledge:{baseKnown:true,sources:[]}};context.finishRepairProfile(independent,[{...source,grantsKnowledge:false}]);eq(resolve({inv:[]},independent).known,true);eq(resolve({inv:[]},independent).spec.maxBreakFeet,1);
const before=JSON.stringify({character,spell,target});evaluate(profile,target,facts,false);eq(JSON.stringify({character,spell,target}),before);
// Exercise the real shared FX schema, including null/wrong-type and unknown nested fields.
// Core module's existing reference-data decoration needs these empty data tables in Node.
globalThis.FEAT_FULL={};globalThis.FEATS={};
const {fxEntryProblems}=await import('../src/builder/10e-logic-fx-schema.js');
for(const value of [null,'bad',{},true,1,[null],[{}],[{spell:'Mending',maxBreakFeet:'5'}],[{spell:'Mending',maxBreakFeet:NaN}],[{spell:'Mending',maxBreakFeet:Infinity}],[{spell:'Mending',maxBreakFeet:0}],[{spell:'Healing',maxBreakFeet:5}],[{spell:'Mending',maxBreakFeet:5,unknown:true}]])eq(fxEntryProblems({objectRepair:value}).length>0,true);
for(const value of [[],[{spell:'Mending',maxBreakFeet:1}],[{spell:'Mending',maxBreakFeet:5}]])eq(fxEntryProblems({objectRepair:value}).length,0);
console.log(checks+' object repair cross-layer checks PASS');
