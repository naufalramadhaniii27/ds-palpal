import assert from 'node:assert/strict';
import {resolveObjectRepairProfile as resolve,evaluateRepairRequest as evaluate} from '../src/app/lib/object-repair-runtime.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const source={item:"Forgemaster's Might",maxBreakFeet:5,requiresAttunement:true,itemState:'attuned',grantsKnowledge:true};
const spell=(baseKnown=false)=>({n:'Mending',l:0,objectRepair:{spell:'Mending',maxBreakFeet:999,baseKnown,sources:[{...source}]}});
const item=()=>({n:source.item,key:source.item,q:1,eq:false,attuned:true,attunedActive:true});
const declarations={components:true,equipment:true,castingTimeComplete:true};
const target={object:true,kind:'Object',singleBreak:true,touch:true,dimensionsFeet:[1,0,0]};
const actor={abilities:{STR:{base:16}},inv:[item()]};const before=JSON.stringify(actor);
eq(resolve(actor,spell()).known,true);eq(resolve(actor,spell()).spec.maxBreakFeet,5);eq(JSON.stringify(actor),before);
for(const [field,value] of [['attuned',false],['attunedActive',false],['q',0],['q',Infinity]]){
 const current={...actor,inv:[{...item(),[field]:value}]};eq(resolve(current,spell()).known,false);eq(resolve(current,spell(true)).known,true);eq(resolve(current,spell(true)).spec.maxBreakFeet,1);
}
const gone={inv:[]};eq(resolve(gone,spell()).known,false);eq(resolve(gone,spell(true)).spec.maxBreakFeet,1);
eq(resolve({inv:[{...item(),attuned:false},item()]},spell()).spec.maxBreakFeet,5);
const ordinary={n:'Mending',l:0,objectRepair:{spell:'Mending',baseKnown:true,sources:[]}};eq(resolve(gone,ordinary).spec.maxBreakFeet,1);eq(resolve(gone,ordinary).known,true);
for(const cost of [1,[1,3],undefined])eq(resolve(actor,{...ordinary,itc:{it:"Master Machinist's Marvelous Mallet",c:cost}}).reason,'unsupported-repair-payment');
for(const item of ['Lyre of Building','Needle of Mending'])eq(resolve(actor,{...ordinary,itc:{it:item,c:0}}).reason,'unsupported-repair-source');
eq(resolve(actor,{...ordinary,ct:'Action'}).reason,'unsupported-repair-source');
eq(resolve(actor,{n:'Mending',l:0}).known,false);eq(resolve(actor,{...ordinary,n:'Other'}).known,false);eq(resolve(actor,{...ordinary,l:1}).known,false);
for(const bad of [undefined,null,'bad',{},[{...source,maxBreakFeet:NaN}],[{...source,grantsKnowledge:undefined}],[{...source,itemState:'future'}]])eq(resolve(actor,{...ordinary,objectRepair:{...ordinary.objectRepair,sources:bad}}).known,false);
for(const key of Object.keys(declarations))for(const value of [false,undefined,'true'])eq(evaluate(resolve(actor,spell()),target,{...declarations,[key]:value},false).ok,false);
eq(evaluate(resolve(actor,spell()),target,declarations,true),{ok:false,reason:'rage'});
for(const kind of ['Object','MagicItem']){
 const result=evaluate(resolve(actor,spell()),{...target,kind,dimensionsFeet:[5,5,5]},declarations,false);eq(result.ok,true);eq(result.magicRestored,false);eq('hp' in result,false);
}
for(const kind of ['Creature','Construct','Undead',''])eq(evaluate(resolve(actor,spell()),{...target,kind},declarations,false).ok,false);
for(const cap of [1,5])for(let axis=0;axis<3;axis++){
 const profile=cap===1?resolve(gone,ordinary):resolve(actor,spell());let dimensionsFeet=[0,0,0];dimensionsFeet[axis]=cap;eq(evaluate(profile,{...target,dimensionsFeet},declarations,false).ok,true);dimensionsFeet[axis]+=0.01;eq(evaluate(profile,{...target,dimensionsFeet},declarations,false).reason,'oversize');
}
for(const change of [{object:false},{singleBreak:false},{touch:false},{dimensionsFeet:[0,0,0]},{dimensionsFeet:[NaN,0,0]}])eq(evaluate(resolve(actor,spell()),{...target,...change},declarations,false).ok,false);
console.log(checks+' current-source repair profile / declarations / native physical target checks passed');
