import assert from 'node:assert/strict';import {CARPET_SIZES as sizes,carpetMetadata as meta,normalizeVehicleState as normalize,migrateVehicles as migrate,chooseCarpetSize as choose,activateCarpet as activate,evaluateCarpet as evaluate} from '../src/data/lib/carpet-vehicle.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const facts={loadDeclared:true,loadLb:0,distanceDeclared:true,distanceFeet:30,directionsGiven:true};
for(const size of sizes){const row={n:'Carpet of Flying',q:1,vehicle:{v:1,active:true,size:size.size}};
 for(const [weight,speed,carry] of [[0,size.flyFeet,true],[size.capacityLb,size.flyFeet,true],[size.capacityLb+0.01,size.flyFeet/2,true],[2*size.capacityLb,size.flyFeet/2,true],[2*size.capacityLb+0.01,null,false]]){const r=evaluate(row,{...facts,loadLb:weight});eq(r.flyFeet,speed);eq(r.canCarry,carry);eq(r.commandAllowed,carry)}
 for(const distance of [0,29.99,30,30.01,-1,NaN,Infinity])eq(evaluate(row,{...facts,distanceFeet:distance}).commandAllowed,Number.isFinite(distance)&&distance>=0&&distance<=30);
 for(const loadLb of [-1,NaN,Infinity,'100'])eq(evaluate(row,{...facts,loadLb}).ok,false);
 eq(evaluate({...row,vehicle:{...row.vehicle,active:false}},facts).commandAllowed,false);
}
const row={n:'Carpet of Flying',q:1},rows=[row,{n:'Longsword',form:{v:1,active:true}}],before=JSON.stringify(rows),migrated=migrate(rows);eq(JSON.stringify(rows),before);eq(migrated[0].vehicle,{v:1,active:false,size:null});eq(migrated[1],rows[1]);eq(migrate(migrated),migrated);
const chosen=choose(migrated[0].vehicle,'3x5');eq(activate({...row,vehicle:chosen},{commandWord:true,actionComplete:true,action:'Magic'}).active,true);eq(activate({...row,vehicle:chosen},{commandWord:false,actionComplete:true,action:'Magic'}),null);eq(activate(migrated[0],{commandWord:true,actionComplete:true,action:'Magic'}).active,true);
for(const state of [{v:99,active:true,size:'3x5'},null,{v:1,active:'true',size:'3x5'},{v:1,active:true,size:'guess'}])eq(normalize(state),null);
const opaque={n:'Carpet of Flying',vehicle:{v:99,foo:1}};eq(migrate([opaque])[0],opaque);
for(const [name,action] of [['Carpet of Flying','Magic'],['Carpet of Flying, 3 ft. × 5 ft.','Action']])eq(meta(name).activation,action);
eq(evaluate({...row,vehicle:{v:1,active:true,size:'3x5'},q:0},facts).reason,'source-unavailable');
for(const key of ['commandWord','actionComplete'])eq(activate({...row,vehicle:chosen},{commandWord:true,actionComplete:true,action:'Magic',[key]:false}),null);
eq(activate({...row,vehicle:chosen},{commandWord:true,actionComplete:true,action:'Action'}),null);
const fixed={n:'Carpet of Flying, 3 ft. × 5 ft.',q:1,vehicle:{v:1,active:true,size:'3x5'}};
eq(evaluate(fixed,facts).commandAllowed,false);eq(evaluate(fixed,{...facts,spokenDirections:true}).commandAllowed,true);
eq(evaluate(fixed,{...facts,spokenDirections:true,distanceFeet:31}).vehicleActive,true);
eq(evaluate({...fixed,q:2},facts).reason,'split-required');
eq(activate({...fixed,q:2},{commandWord:true,actionComplete:true,action:'Action'}),null);
eq(evaluate(fixed,{...facts,spokenDirections:true}).widthFeet,3);eq(evaluate(fixed,{...facts,spokenDirections:true}).lengthFeet,5);
for(const q of [0.5,1.5,2.1])eq(evaluate({...fixed,q},facts).reason,'invalid-quantity');
for(const q of [2,3])eq(evaluate({...fixed,q},facts).reason,'split-required');
eq(evaluate({...fixed,q:0},facts).reason,'source-unavailable');
console.log(count+' carpet vehicle checks PASS');
