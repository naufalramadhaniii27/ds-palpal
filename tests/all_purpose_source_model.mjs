import assert from 'node:assert/strict';
import {allPurposeMetadata,normalizeAllPurposeSource,normalizeAllPurposeRegistry,migrateAllPurposeSources,allPurposeSourceStatus,reviewAllPurposeSource,splitAllPurposeSource} from '../src/data/lib/all-purpose-source.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},ok=x=>{assert.ok(x);checks++};
const name='+1 All-Purpose Tool',row={n:name,q:1,eq:false,attuned:true,toolForm:{v:1,tool:null}},proof=[{index:0,name,chargeKey:'i-old-native'}];
for(const n of ['+1 All-Purpose Tool','+2 All-Purpose Tool','+3 All-Purpose Tool'])eq(allPurposeMetadata(n),{action:'Action',classKey:'Artificer',ability:'INT',durationSeconds:28800,charges:1,recovery:'dawn'});
for(const n of ['Manifold Tool','All-Purpose Tool','+4 All-Purpose Tool',null,{},' +1 All-Purpose Tool'])eq(allPurposeMetadata(n),null);
const initial=migrateAllPurposeSources([row],undefined,proof);eq(initial.problems,[]);eq(initial.rows[0].borrowedCantripSource,{v:1,id:'ap-1',chargeKey:'i-old-native',reviewRequired:false});eq(initial.registry,{v:1,nextId:2,allocatedKeys:['i-old-native'],reservedKeys:['i-old-native']});eq(row.borrowedCantripSource,undefined);ok(allPurposeSourceStatus(initial.rows[0],initial.registry).ok);
const repeat=migrateAllPurposeSources(initial.rows,initial.registry);ok(repeat.rows===initial.rows);ok(repeat.registry===initial.registry);eq(repeat.problems,[]);
for(const cases of [[{...row,n:'+2 All-Purpose Tool'}],[{...row,q:2}],[row,{...row}],[{...row,q:0}],[{...row,q:1.5}]]){const x=migrateAllPurposeSources(cases,undefined,proof);eq(x.problems,[]);ok(x.rows.every(r=>r.borrowedCantripSource.reviewRequired));ok(x.rows.every(r=>r.borrowedCantripSource.chargeKey!=='i-old-native'))}
// The first case above needs no proof to represent unresolved legacy history.

const unproven=migrateAllPurposeSources([row],undefined);eq(allPurposeSourceStatus(unproven.rows[0],unproven.registry).reason,'use-review');
for(const proofBad of [[{index:1,name,chargeKey:'i-old'}],[{index:0,name:'other',chargeKey:'i-old'}],[{index:0,name,chargeKey:'old'}],[{index:0,name,chargeKey:'i-old'},{index:8,name,chargeKey:'i-old'}]]){const x=migrateAllPurposeSources([row],undefined,proofBad);ok(x.rows[0].borrowedCantripSource.reviewRequired)}
const reviewed=reviewAllPurposeSource(unproven.rows[0],unproven.registry,{available:false,declared:true});ok(reviewed.ok);eq(reviewed.usedValue,1);eq(reviewed.chargeKey,unproven.rows[0].borrowedCantripSource.chargeKey);eq(reviewed.row.borrowedCantripSource.reviewRequired,false);eq(unproven.rows[0].borrowedCantripSource.reviewRequired,true);
eq(reviewAllPurposeSource(unproven.rows[0],unproven.registry,{available:true,declared:true}).usedValue,0);
for(const d of [null,{},true,{available:true},{available:'true',declared:true},{available:true,declared:false},{available:true,declared:true,extra:1}])eq(reviewAllPurposeSource(unproven.rows[0],unproven.registry,d).reason,'declaration');
const before=JSON.stringify(initial),removed=migrateAllPurposeSources([],initial.registry);eq(removed.registry,initial.registry);const replaced=migrateAllPurposeSources([row],removed.registry,proof);ok(replaced.rows[0].borrowedCantripSource.id!=='ap-1');ok(replaced.rows[0].borrowedCantripSource.chargeKey!=='i-old-native');ok(replaced.rows[0].borrowedCantripSource.reviewRequired);eq(JSON.stringify(initial),before);
const two=migrateAllPurposeSources([...initial.rows,{...row,n:'+2 All-Purpose Tool'}],initial.registry);const reversed=migrateAllPurposeSources(two.rows.slice().reverse(),two.registry);eq(reversed.rows[1].borrowedCantripSource,initial.rows[0].borrowedCantripSource);eq(reversed.registry,two.registry);
const stackRow={...initial.rows[0],q:3,toolForm:{v:1,tool:"Smith's Tools"},chargeKey:'i-old-native',extra:{keep:1}},split=splitAllPurposeSource([stackRow],0,initial.registry);ok(split.ok);eq(split.rows.map(x=>x.q),[2,1]);eq(split.rows[0].borrowedCantripSource,stackRow.borrowedCantripSource);eq(split.rows[0].attuned,true);eq(split.rows[0].toolForm,stackRow.toolForm);eq(split.rows[1].attuned,false);eq(split.rows[1].eq,false);eq(split.rows[1].toolForm,{v:1,tool:null});eq(split.rows[1].chargeKey,undefined);ok(split.rows[1].borrowedCantripSource.reviewRequired);ok(split.rows[1].borrowedCantripSource.id!==stackRow.borrowedCantripSource.id);eq(stackRow.q,3);eq(initial.registry.nextId,2);eq(split.rows[1].extra,{keep:1});eq(allPurposeSourceStatus(split.rows[0],split.registry).reason,'split-required');
const future={v:2,opaque:{keep:true}};for(const registry of [null,future,{v:1,nextId:0,allocatedKeys:[],reservedKeys:[]},{v:1,nextId:2,allocatedKeys:[],reservedKeys:['i-x','i-x']},{v:1,nextId:2,allocatedKeys:[],reservedKeys:['x']},{v:1,nextId:1.2,allocatedKeys:[],reservedKeys:[]}]){eq(normalizeAllPurposeRegistry(registry),null);const x=migrateAllPurposeSources([row],registry);ok(x.rows[0]===row);ok(x.registry===registry);eq(x.problems[0].reason,'registry-version')}
for(const source of [null,future,{v:1,id:'ap-0',chargeKey:'i-x',reviewRequired:false},{v:1,id:'ap-1',chargeKey:'x',reviewRequired:false},{v:1,id:'ap-1',chargeKey:'i-x',reviewRequired:0}]){eq(normalizeAllPurposeSource(source),null);const r={...row,borrowedCantripSource:source},x=migrateAllPurposeSources([r],initial.registry);ok(x.rows[0]===r);eq(x.problems[0].reason,'source-version');eq(splitAllPurposeSource([{...r,q:2}],0,initial.registry).ok,false)}
const existingNoRegistry=migrateAllPurposeSources(initial.rows,undefined);eq(existingNoRegistry.problems[0].reason,'missing-registry');ok(existingNoRegistry.rows===initial.rows);
const duplicated=migrateAllPurposeSources([initial.rows[0],structuredClone(initial.rows[0])],initial.registry);ok(duplicated.problems.some(x=>x.reason==='duplicate-source'));
for(const q of [0,-1,1.2,'1',NaN,Infinity])eq(allPurposeSourceStatus({...initial.rows[0],q},initial.registry).reason,'quantity');
for(const q of [0,1,1.5,'2',NaN,Infinity])eq(splitAllPurposeSource([{...initial.rows[0],q}],0,initial.registry).ok,false);
const futureForm={...stackRow,toolForm:{v:2,opaque:1}};eq(splitAllPurposeSource([futureForm],0,initial.registry).reason,'tool-form-version');
const noSupported=[{n:'Manifold Tool',q:1}];const no=migrateAllPurposeSources(noSupported,undefined);ok(no.rows===noSupported);eq(no.registry,undefined);
const exhausted={v:1,nextId:Number.MAX_SAFE_INTEGER,allocatedKeys:[],reservedKeys:[]};const fail=migrateAllPurposeSources([row],exhausted);eq(fail.problems[0].reason,'identity-exhausted');ok(fail.registry===exhausted);ok(fail.rows[0]===row);
const reserved={v:1,nextId:1,allocatedKeys:[],reservedKeys:['i-ap-1']};const skip=migrateAllPurposeSources([row],reserved);eq(skip.rows[0].borrowedCantripSource.id,'ap-2');eq(skip.rows[0].borrowedCantripSource.chargeKey,'i-ap-2');eq(reserved.nextId,1);
eq(normalizeAllPurposeSource({v:1,id:['ap-1'],chargeKey:'i-x',reviewRequired:false}),null);
eq(reviewAllPurposeSource(initial.rows[0],initial.registry,{available:true,declared:true}).reason,'review-not-required');
for(const form of [{v:1,tool:'invalid'},{v:1,tool:null,opaque:1},{v:1}])eq(splitAllPurposeSource([{...stackRow,toolForm:form}],0,initial.registry).reason,'tool-form-version');
// Actual resource projections can contain ordinary native items whose slugs match our IDs.
const occupied=['i-ap-1','i-ap-2','r-class','i-other'];
const collision=migrateAllPurposeSources([row],undefined,[],occupied);
eq(collision.rows[0].borrowedCantripSource.id,'ap-3');eq(collision.rows[0].borrowedCantripSource.chargeKey,'i-ap-3');
eq(collision.registry.reservedKeys,['i-ap-1','i-ap-2','i-other','i-ap-3']);eq(occupied,['i-ap-1','i-ap-2','r-class','i-other']);
// Inheriting an evidenced old pool is allowed even though it is already among current resource keys.
const provenOccupied=migrateAllPurposeSources([row],undefined,proof,['i-old-native','i-ap-1']);
eq(provenOccupied.rows[0].borrowedCantripSource.chargeKey,'i-old-native');eq(provenOccupied.rows[0].borrowedCantripSource.reviewRequired,false);eq(provenOccupied.rows[0].borrowedCantripSource.id,'ap-2');
const reserveOnly=migrateAllPurposeSources(initial.rows,initial.registry,[],['i-ap-2','i-ap-3']);ok(reserveOnly.rows===initial.rows);eq(reserveOnly.registry.reservedKeys,['i-old-native','i-ap-2','i-ap-3']);
const collisionAdded=migrateAllPurposeSources([...reserveOnly.rows,{...row,n:'+2 All-Purpose Tool'}],reserveOnly.registry);eq(collisionAdded.rows[1].borrowedCantripSource.id,'ap-4');
const collisionSplit=splitAllPurposeSource([stackRow],0,initial.registry,['i-ap-2','i-ap-3']);eq(collisionSplit.rows[1].borrowedCantripSource.id,'ap-4');eq(initial.registry.reservedKeys,['i-old-native']);
const reoccupied=migrateAllPurposeSources(collision.rows,collision.registry,[],occupied);ok(reoccupied.rows===collision.rows);ok(reoccupied.registry===collision.registry);
for(const bad of [null,{},'i-ap-1',[null],[''],[1]]){eq(migrateAllPurposeSources([row],undefined,[],bad).problems[0].reason,'input');eq(splitAllPurposeSource([stackRow],0,initial.registry,bad).reason,'input')}
// Imported typed state must contain dense arrays and own data fields.
let getterCalls=0;const getter=()=>{getterCalls++;throw Error('must not execute')};
for(const key of ['v','id','chargeKey','reviewRequired']){const bad={...initial.rows[0].borrowedCantripSource};Object.defineProperty(bad,key,{enumerable:true,get:getter});eq(normalizeAllPurposeSource(bad),null)}
for(const key of ['v','nextId','reservedKeys','allocatedKeys']){const bad={...initial.registry};Object.defineProperty(bad,key,{enumerable:true,get:getter});eq(normalizeAllPurposeRegistry(bad),null)}
const arrayGetter=[];Object.defineProperty(arrayGetter,'0',{enumerable:true,get:getter});
for(const reservedKeys of [Array(1),['i-x',,...['i-z']],arrayGetter,Object.assign(['i-x'],{extra:1})])eq(normalizeAllPurposeRegistry({v:1,nextId:1,reservedKeys,allocatedKeys:[]}),null);
for(const occupiedKeys of [Array(1),arrayGetter]){eq(migrateAllPurposeSources([row],undefined,[],occupiedKeys).problems[0].reason,'input');eq(splitAllPurposeSource([stackRow],0,initial.registry,occupiedKeys).reason,'input')}
eq(normalizeAllPurposeSource({...initial.rows[0].borrowedCantripSource,[Symbol('extra')]:true}),null);
eq(normalizeAllPurposeRegistry({...initial.registry,[Symbol('extra')]:true}),null);
eq(getterCalls,0);
eq(initial.registry.allocatedKeys,['i-old-native']);eq(collision.registry.allocatedKeys,['i-ap-3']);eq(removed.registry.allocatedKeys,['i-old-native']);
eq(collisionSplit.registry.allocatedKeys,['i-old-native','i-ap-4']);
for(const allocatedKeys of [undefined,null,Array(1),['i-foreign'],['i-old-native','i-old-native'],arrayGetter])eq(normalizeAllPurposeRegistry({...initial.registry,allocatedKeys}),null);
const missingOwned={...initial.registry,allocatedKeys:[]};eq(migrateAllPurposeSources(initial.rows,missingOwned).problems[0].reason,'registry-mismatch');
console.log(checks+' All-Purpose stable source and native pool checks PASS');
