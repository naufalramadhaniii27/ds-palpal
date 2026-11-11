import assert from 'node:assert/strict';
import {riddenVehicleMetadata as meta,normalizeRiddenVehicleState as normalize,migrateRiddenVehicles as migrate,riddenVehicleSourceStatus as source,activateRiddenVehicle as activate,endRiddenVehicle as end,evaluateRiddenVehicle as evaluate,splitRiddenVehicle as split,riddenVehicleProfile as profile} from '../src/data/lib/ridden-vehicle.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const broom={n:'Broom of Flying',q:1,attuned:true,attunedActive:true,vehicle:{v:1,active:true,size:null}},lily={n:'Bobbing Lily Pad',q:1,attuned:true,attunedActive:true};
const facts={loadDeclared:true,loadLb:0,riding:true,spokenDirections:true};
eq(meta('Broom of Flying').activation,'Magic');eq(meta('Bobbing Lily Pad').activation,null);eq(meta('Bobbing Lily Pad').swimSurfaceOnly,true);
for(const name of ['Carpet of Flying','Ornithopter of Flying','Flying Chariot','Broom of Flying (2014)',''])eq(meta(name),null);
for(const [loadLb,flyFeet,canCarry] of [[0,50,true],[199.99,50,true],[200,50,true],[200.01,30,true],[400,30,true],[400.01,null,false]]){const r=evaluate(broom,{...facts,loadLb});eq(r.ok,true);eq(r.flyFeet,flyFeet);eq(r.canCarry,canCarry);eq(r.commandAllowed,canCarry);eq(r.hover,canCarry);eq('walkFeet' in r,false);eq('swimFeet' in r,false)}
for(const [loadLb,speed,canCarry] of [[0,20,true],[299.99,20,true],[300,20,true],[300.01,10,true],[600,10,true],[600.01,null,false]]){const r=evaluate(lily,{...facts,loadLb});eq(r.flyFeet,speed);eq(r.walkFeet,speed);eq(r.swimFeet,speed);eq(r.swimSurfaceOnly,true);eq(r.commandAllowed,canCarry);eq(r.canCarry,canCarry)}
for(const row of [broom,lily]){
 for(const loadLb of [-1,NaN,Infinity,'200',null,undefined])eq(evaluate(row,{...facts,loadLb}).reason,'invalid-declarations');
 for(const riding of [null,undefined,1,'true'])eq(evaluate(row,{...facts,riding}).reason,'invalid-declarations');
 for(const spokenDirections of [null,1,'true'])eq(evaluate(row,{...facts,spokenDirections}).reason,'invalid-declarations');
 eq(evaluate(row,{...facts,loadDeclared:false}).ok,false);eq(evaluate(row,{...facts,distanceFeet:30}).ok,false);
 for(const q of [0,-1,0.5,1.5,'1',NaN,Infinity])eq(source({...row,q}).ok,false);
 for(const q of [2,3])eq(source({...row,q}).reason,'split-required');
 eq(source({...row,attuned:false}).reason,'attunement');eq(source({...row,attuned:true,attunedActive:false}).reason,'attunement');eq(source({...row,attuned:true,attunedActive:undefined}).ok,true);
 eq(evaluate({...row,eq:false},facts).commandAllowed,true);
}
const noRider=evaluate(broom,{...facts,riding:false});eq(noRider.vehicleActive,false);eq(noRider.recordedActive,true);eq(noRider.needsEndingRecord,true);eq(noRider.hover,false);eq(noRider.commandAllowed,false);eq(noRider.flyFeet,50);eq(broom.vehicle.active,true);
const inactive=evaluate({...broom,vehicle:{...broom.vehicle,active:false}},facts);eq(inactive.commandAllowed,false);eq(inactive.hover,false);eq(inactive.vehicleActive,false);eq(inactive.needsEndingRecord,false);
const lilyUnridden=evaluate(lily,{...facts,riding:false});eq(lilyUnridden.commandAllowed,false);eq(lilyUnridden.commandReason,'rider-required');eq(lilyUnridden.vehicleActive,true);eq(lilyUnridden.hover,true);eq(lilyUnridden.needsEndingRecord,false);eq(lilyUnridden.recordedActive,null);
eq(evaluate(lily,{...facts,spokenDirections:false}).commandReason,'spoken-directions-required');eq(evaluate(broom,{...facts,spokenDirections:false}).commandAllowed,true);
const declaration={astride:true,action:'Magic',actionComplete:true};eq(activate(broom,declaration),broom.vehicle);eq(activate({...broom,vehicle:{v:1,active:false,size:null}},declaration).active,true);eq(activate(lily,declaration),null);
for(const [key,value] of [['astride',false],['astride','true'],['action','Action'],['action','Bonus Action'],['actionComplete',false]])eq(activate(broom,{...declaration,[key]:value}),null);
eq(activate(broom,{...declaration,commandWord:true}),null);eq(activate({...broom,attuned:false},declaration),null);
for(const event of [{landed:true},{gotOff:true},{landed:true,gotOff:false},{landed:false,gotOff:true},{landed:true,gotOff:true}]){eq(end(broom,event).active,false);eq(end({...broom,attuned:false},event).active,false)}
for(const event of [{},{landed:false},{gotOff:false},{gotOff:1},{landed:'true'},{landed:true,action:'Magic'},null])eq(end(broom,event),null);
eq(end(lily,{landed:true}),null);eq(end({...broom,q:0},{landed:true}),null);eq(end({...broom,q:2},{landed:true}),null);
for(const vehicle of [null,undefined,{v:2,active:true,size:null},{v:1,active:'true',size:null},{v:1,active:true,size:'3x5'},{active:true,size:null}]){eq(normalize(vehicle),null);eq(source({...broom,vehicle}).reason,'unsupported-state');eq(activate({...broom,vehicle},declaration),null);eq(end({...broom,vehicle},{landed:true}),null)}
const extended={v:1,active:true,size:null,note:{preserved:true}};eq(normalize(extended),extended);eq(activate({...broom,vehicle:extended},declaration).note,extended.note);eq(end({...broom,vehicle:extended},{gotOff:true}).note,extended.note);
const rows=[{n:'Broom of Flying'},lily,{n:'Carpet of Flying',vehicle:{v:1,active:false,size:'3x5'}},{n:'Longsword'}],before=JSON.stringify(rows),migrated=migrate(rows);eq(JSON.stringify(rows),before);eq(migrated[0].vehicle,{v:1,active:false,size:null});for(let i=1;i<rows.length;i++)eq(migrated[i],rows[i]);eq(migrate(migrated),migrated);eq(migrate(null),null);
for(const vehicle of [undefined,null,{v:99,opaque:true}]){const row={n:'Broom of Flying',vehicle};eq(migrate([row])[0],row)}
eq('vehicle' in migrate([lily])[0],false);eq(evaluate({...lily,vehicle:{v:99,opaque:true}},facts).commandAllowed,true);
const original=JSON.stringify([broom,lily]);evaluate(broom,facts);evaluate(lily,facts);activate(broom,declaration);end(broom,{gotOff:true});eq(JSON.stringify([broom,lily]),original);const copiedMeta=meta('Broom of Flying');copiedMeta.flyFeet=999;eq(meta('Broom of Flying').flyFeet,50);
const stack={...broom,q:3,vehicle:{...broom.vehicle,note:{record:'one physical source'}}},stackRows=[{n:'Dagger'},stack,{n:'Rope'}],stackBefore=JSON.stringify(stackRows);
eq(split(stackRows,1).reason,'keep-choice');
for(const keepRecordedWith of ['original','split']){
 const r=split(stackRows,1,{keepRecordedWith});eq(r.ok,true);eq(r.index,1);eq(r.splitIndex,2);eq(r.rows.length,4);eq(r.rows[1].q,2);eq(r.rows[2].q,1);eq(r.rows[1].q+r.rows[2].q,stack.q);eq(r.rows[0],stackRows[0]);eq(r.rows[3],stackRows[2]);
 const kept=r.rows[keepRecordedWith==='original'?1:2],cleared=r.rows[keepRecordedWith==='original'?2:1];eq(kept.attuned,true);eq(kept.attunedActive,true);eq(kept.vehicle,stack.vehicle);eq(cleared.attuned,false);eq(cleared.attunedActive,false);eq(cleared.vehicle,{v:1,active:false,size:null});eq(source(cleared).ok,false);eq(kept.vehicle===stack.vehicle,false);eq(kept.vehicle.note===stack.vehicle.note,false);
}
eq(JSON.stringify(stackRows),stackBefore);
const inert={...broom,q:2,attuned:false,attunedActive:false,vehicle:{v:1,active:false,size:null}};eq(split([inert],0).ok,true);eq(split([inert],0).rows.map(row=>row.attuned),[false,false]);eq(split([{...inert,vehicle:{...inert.vehicle,note:1}}],0).reason,'keep-choice');
eq(split([{...inert,vehicle:{...inert.vehicle,active:true}}],0).reason,'keep-choice');eq(split([{...inert,attuned:true}],0).reason,'keep-choice');
const lilyStack={...lily,q:2};eq(split([lilyStack],0).reason,'keep-choice');
for(const keepRecordedWith of ['original','split']){const r=split([lilyStack],0,{keepRecordedWith});eq(r.ok,true);eq(r.rows.map(row=>row.attuned),keepRecordedWith==='original'?[true,false]:[false,true]);eq(r.rows.some(row=>'vehicle' in row),false);eq(r.rows[0].q+r.rows[1].q,2)}
eq(split([{...lilyStack,attuned:false}],0).ok,true);
for(const vehicle of [null,undefined,{v:99,opaque:true},{v:1,active:true,size:'3x5'}]){const row={...inert,vehicle},before=JSON.stringify(row);eq(split([row],0,{keepRecordedWith:'original'}).reason,'unsupported-state');eq(JSON.stringify(row),before)}
for(const vehicle of [undefined,null,{v:99,opaque:true},{v:1,active:false,size:null}]){const row={...lilyStack,vehicle},before=JSON.stringify(row);eq(split([row],0,{keepRecordedWith:'original'}).reason,'unsupported-state');eq(JSON.stringify(row),before)}
for(const q of [undefined,null,0,-1,1,1.5,'2',NaN,Infinity])eq(split([{...inert,q}],0).ok,false);
for(const change of [null,[],{keepRecordedWith:'other'},{keepRecordedWith:false},{keepRecordedWith:'original',extra:true}])eq(split([inert],0,change).reason,'keep-choice');
for(const index of [-1,1,0.5,null])eq(split([inert],index).ok,false);eq(split(null,0).ok,false);eq(split([{n:'Carpet of Flying',q:2}],0).reason,'unsupported-vehicle');
// Native 2014 overlay: no attunement or Action cost; only landing ends hovering.
const legacy={...broom,attuned:false,attunedActive:false},legacyWord={astride:true,commandWord:true};
eq(meta('Broom of Flying','2014').activation,'Command word');eq(meta('Broom of Flying','2014').requiresAttunement,false);eq(meta('Broom of Flying','2014').endsOnGetOff,false);eq(meta('Broom of Flying','2024').endsOnGetOff,true);
eq(source(legacy,'2014').ok,true);eq(source(legacy,'2024').reason,'attunement');eq(activate(legacy,legacyWord,'2014').active,true);eq(activate(legacy,declaration,'2014'),null);eq(activate(broom,legacyWord,'2024'),null);
for(const declaration of [{astride:false,commandWord:true},{astride:true,commandWord:false},{astride:true,commandWord:'true'},{...legacyWord,action:'Action'},{...legacyWord,actionComplete:true}])eq(activate(legacy,declaration,'2014'),null);
eq(end(legacy,{gotOff:true},'2014'),null);eq(end(legacy,{landed:true},'2014').active,false);eq(end(legacy,{landed:true,gotOff:true},'2014').active,false);
const unmountedLegacy=evaluate(legacy,{...facts,riding:false},'2014');eq(unmountedLegacy.vehicleActive,true);eq(unmountedLegacy.recordedActive,true);eq(unmountedLegacy.hover,true);eq(unmountedLegacy.needsEndingRecord,false);eq(unmountedLegacy.commandAllowed,false);
for(const [loadLb,flyFeet] of [[0,50],[200,50],[200.01,30],[400,30],[400.01,null]])eq(evaluate(legacy,{...facts,loadLb},'2014').flyFeet,flyFeet);
for(const edition of ['2014','2024']){eq(evaluate(lily,facts,edition).walkFeet,20);eq(source({...lily,attuned:false},edition).reason,'attunement');eq(profile(lily,edition).nativeEdition,edition)}
for(const edition of [null,false,'unknown','']){eq(meta('Broom of Flying',edition),null);eq(source(broom,edition).ok,false);eq(activate(broom,declaration,edition),null);eq(end(broom,{landed:true},edition),null);eq(evaluate(broom,facts,edition).ok,false);eq(profile(broom,edition),null);eq(split([inert],0,{},edition).ok,false)}
const activeProfile=profile(broom);eq(activeProfile.nativeEdition,'2024');eq(activeProfile.available,true);eq(activeProfile.activationAvailable,false);eq(activeProfile.endAvailable,true);eq(activeProfile.splitAvailable,false);eq(activeProfile.requiresKeepChoice,true);eq(activeProfile.vehicleMeta.requiresAttunement,true);
eq(profile({...broom,vehicle:{v:1,active:false,size:null}}).activationAvailable,true);eq(profile({...broom,attuned:false}).available,false);eq(profile({...broom,attuned:false}).endAvailable,true);eq(profile({...broom,q:0}).endAvailable,false);
eq(profile(legacy,'2014').available,true);eq(profile(legacy,'2014').vehicleMeta.requiresAttunement,false);eq(profile({...legacy,q:2},'2014').splitAvailable,true);eq(profile({...legacy,q:2},'2014').requiresKeepChoice,true);
const inertLegacy={...inert,attuned:false};eq(profile(inertLegacy,'2014').requiresKeepChoice,false);eq(split([inertLegacy],0,{},'2014').ok,true);
for(const edition of ['2014','2024']){const p=profile(lily,edition);eq(p.activationAvailable,false);eq(p.endAvailable,false);eq(p.available,true);eq(profile({...lily,q:2},edition).splitAvailable,true);eq(profile({...lily,q:2,vehicle:{v:99}},edition).splitAvailable,false);eq(profile({...lily,q:2,attuned:false},edition).requiresKeepChoice,false)}
eq(profile({n:'Longsword'}),null);eq(profile({...broom,q:2,vehicle:{v:99}}).splitAvailable,false);eq(profile({...inert,vehicle:{v:1,active:false,size:null,note:1}}).requiresKeepChoice,true);
console.log(count+' ridden vehicle model checks PASS');
