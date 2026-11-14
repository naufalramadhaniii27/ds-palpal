import assert from 'node:assert/strict';import {createRodAbsorptionEngine} from './fixtures/rod-absorption-native.mjs';
let checks=0;const ok=value=>{assert.ok(value);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
const review=(e,totalAbsorbed=10,stored=10)=>e.command('review',{physicalId:'ra-1',totalAbsorbed,stored,foundRoll:null,actualAttunementCountReview:true,actualFoundRollVerified:false});
function ready(options={},total=10,stored=10){const e=createRodAbsorptionEngine(options);ok(e.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok);ok(review(e,total,stored).ok);return e}
const reaction={physicalId:'ra-1',actualCastLevel:1,actualHolding:true,actualAllocatedAttunement:true,actualReactionCompleted:true,targetsOnlyActor:true,producesAreaOfEffect:false,actualCastLevelVerified:true};
const declarations={componentsComplete:true,equipmentComplete:true,castingTimeComplete:true,actualNormalCastingCompleted:true};
const request=(e,level=1)=>({physicalId:'ra-1',spellIndex:e.C.spells.findIndex(s=>s.n==='Burning Hands'),castLevel:level,declarations});
{
 const e=createRodAbsorptionEngine();ok(e.info().rows[0].canAdopt);const result=e.command('adopt',{index:0,actualPhysicalIdentityVerified:true});ok(result.ok);ok(e.accept(result.receipt).ok);eq(e.C.rodAbsorption.rods[0].stored,null);eq(e.info().physical[0].canCast,false);const n=e.undos;ok(!e.command('absorb',reaction).ok);eq(e.undos,n);ok(!review(e,0,1).ok);ok(review(e,8,5).ok);eq(e.C.rodAbsorption.rods[0].stored,5);ok(!review(e).ok);
}
{
 const e=ready(),used=structuredClone(e.c.S.used),result=e.command('absorb',reaction);ok(result.ok);ok(e.accept(result.receipt).ok);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,11);eq(e.C.rodAbsorption.rods[0].stored,11);eq(e.c.S.used,used);
 const n=e.undos,before=JSON.stringify(e.C);for(const invalid of [{targetsOnlyActor:false},{producesAreaOfEffect:true},{actualReactionCompleted:false},{actualCastLevel:10}])ok(!e.command('absorb',{...reaction,...invalid}).ok);eq(e.undos,n);eq(JSON.stringify(e.C),before);
}
{
 const e=ready({},49,1),n=e.undos,r=e.command('absorb',{...reaction,actualCastLevel:2});ok(!r.ok&&r.spellUnaffected);eq(e.undos,n);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,49);ok(e.command('absorb',{...reaction,actualCastLevel:0}).ok);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,49);eq(e.C.rodAbsorption.receipts.at(-1).level,0);
}
{
 const e=ready(),used=structuredClone(e.c.S.used),p=e.castPrepare(request(e));ok(p.ok);ok(e.castCurrent(p.payment));const n=e.undos;let saves=0;e.setSave(()=>{saves++;return true});const result=e.castCommit(p.payment,()=>({ok:true,message:'Cast'}));ok(result.ok);ok(e.accept(result.receipt).ok);eq(e.undos,n+1);eq(saves,1);eq(e.C.rodAbsorption.rods[0].stored,9);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,10);eq(e.c.S.used,used);ok(!e.castCurrent(p.payment));ok(!e.castCommit(p.payment,()=>({ok:true})).ok);
}
{
 const e=ready({},50,1),p=e.castPrepare(request(e));eq(e.c.attunementState().used,1);ok(p.ok);ok(e.castCommit(p.payment,()=>({ok:true})).ok);eq(e.C.rodAbsorption.rods[0].nonmagical,true);eq(e.C.inv[0].attunedActive,false);eq(e.c.attunementState().used,0);eq(e.c.B.inv[0].attuned,true);const n=e.undos;ok(!e.command('absorb',{...reaction,actualCastLevel:0}).ok);ok(!e.castPrepare(request(e)).ok);eq(e.undos,n);e.c.S.used.s1=0;e.setC(e.project());eq(e.C.rodAbsorption.rods[0].stored,0);eq(e.C.rodAbsorption.rods[0].nonmagical,true);
}
{
 const e=ready({level:11,used:{s1:99,pact:99,other:9}},50,20);ok(e.castPrepare(request(e,5)).ok);ok(!e.castPrepare(request(e,6)).ok);eq(e.c.S.used,{s1:99,pact:99,other:9});const cantrip=e.C.spells.findIndex(s=>s.l===0);if(cantrip>=0)ok(!e.castPrepare({...request(e),spellIndex:cantrip}).ok);ok(!e.castPrepare({...request(e),declarations:{...declarations,componentsComplete:false}}).ok);ok(!e.castPrepare({...request(e),spellIndex:999}).ok);
}
for(const failure of ['false','throw','promise']){
 const e=ready(),state=JSON.stringify(e.c.S),p=e.castPrepare(request(e));ok(p.ok);e.setSave(()=>{if(failure==='throw')throw Error('rejected');return failure==='promise'?Promise.resolve(true):false});const result=e.castCommit(p.payment,()=>{e.c.S.cdn={test:1};return {ok:true}});ok(!result.ok);eq(JSON.stringify(e.c.S),state);ok(!e.accept(result.receipt).ok);
}
for(const outcome of [false,undefined,{},Promise.resolve({ok:true})]){
 const e=ready(),state=JSON.stringify(e.c.S),p=e.castPrepare(request(e));let saves=0;e.setSave(()=>{saves++;return true});const result=e.castCommit(p.payment,()=>{e.c.S.cdn={test:1};return outcome});ok(!result.ok);eq(JSON.stringify(e.c.S),state);eq(saves,0);
}
{
 const e=ready(),p=e.castPrepare(request(e));e.setUndo(()=>{e.c.C.name='Other';return true});ok(!e.castCommit(p.payment,()=>({ok:true})).ok);eq(e.c.S.rodAbsorption.rods[0].stored,10);
}
{
 const e=ready(),p=e.castPrepare(request(e));e.setSave(()=>{e.c.C.notes='Changed in Save';return true});const result=e.castCommit(p.payment,()=>({ok:true}));ok(!result.ok&&result.committed);eq(e.c.C.notes,'Changed in Save');eq(e.c.S.rodAbsorption.rods[0].stored,9);ok(!e.accept(result.receipt).ok);
}
{
 const e=ready(),p=e.castPrepare(request(e));e.c.SPELLS=e.c.SPELLS.filter(s=>s[0]!=='Burning Hands');ok(!e.castCurrent(p.payment));ok(!e.castCommit(p.payment,()=>({ok:true})).ok);eq(e.c.S.rodAbsorption.rods[0].stored,10);
}
{
 const e=ready(),old=structuredClone(e.c.B.inv);ok(e.command('remove',{physicalId:'ra-1'}).ok);eq(e.C.rodAbsorption.rods[0].stored,10);ok(e.command('restore',{physicalId:'ra-1',actualPhysicalCopyReturned:true,recordedMagicHistoryVerified:true}).ok);eq(e.C.rodAbsorption.rods[0].stored,10);eq(e.c.B.inv[0].rodAbsorption.id,'ra-1');ok(!e.command('restore',{physicalId:'ra-1',actualPhysicalCopyReturned:true,recordedMagicHistoryVerified:true}).ok);e.c.B.inv=old;e.setC(e.project());eq(e.C.rodAbsorption.rods[0].stored,10);ok(!review(e).ok);
}
{
 const e=createRodAbsorptionEngine({inventory:[{n:'Rod of Absorption',q:3,eq:true,attuned:true}]});ok(!e.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok);ok(e.command('split',{index:0,keepRecordedWith:'original'}).ok);eq(e.c.B.inv.map(r=>r.q),[1,2]);ok(e.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok);eq(e.c.B.inv[1].rodAbsorption,undefined);
}
for(const namespace of [undefined,null,{v:99}]){
 const e=ready();e.c.S.rodAbsorption=namespace;e.setC({...e.C,rodAbsorption:namespace});const before=JSON.stringify(e.c.S),n=e.undos;ok(!e.info().actorAvailable);ok(!e.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok);eq(e.undos,n);eq(JSON.stringify(e.c.S),before);
}
for(const raw of [undefined,null,{v:99}]){
 const e=ready(),current=e.C;current.inv[0].rodAbsorption=raw;current.rodAbsorptionSources.inventoryFingerprint=e.c.canonicalRodAbsorptionDefinition(current.inv);const next=e.project(),before=JSON.stringify(e.c.S),n=e.undos;ok(!e.c.genv.__bldRodAbsorptionInventoryOwner(current,next,e.c.S,next).ok);ok(!e.command('absorb',reaction).ok);ok(!e.castPrepare(request(e)).ok);eq(e.undos,n);eq(JSON.stringify(e.c.S),before);ok(Object.hasOwn(current.inv[0],'rodAbsorption'));
}
{
 const e=ready();e.c.B.inv[0].q=0;e.setC(e.project());ok(!e.info().physical[0].present);ok(e.command('restore',{physicalId:'ra-1',actualPhysicalCopyReturned:true,recordedMagicHistoryVerified:true}).ok);eq(e.c.B.inv[0].q,1);eq(e.C.rodAbsorption.rods[0].stored,10);
}
{
 const e=ready();e.c.B.inv[0].q=4;e.setC(e.project());ok(e.command('split',{index:0,keepRecordedWith:'split'}).ok);eq(e.c.B.inv.map(row=>row.q),[3,1]);eq(e.c.B.inv.map(row=>row.rodAbsorption?.id),[undefined,'ra-1']);eq(e.C.rodAbsorption.rods[0].stored,10);
}
{
 const e=createRodAbsorptionEngine();ok(e.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok);ok(e.command('review',{physicalId:'ra-1',totalAbsorbed:12,stored:3,foundRoll:3,actualAttunementCountReview:true,actualFoundRollVerified:true}).ok);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,12);eq(e.C.rodAbsorption.rods[0].stored,3);const n=e.undos;ok(!e.command('rest',{}).ok);eq(e.undos,n);
}
for(const [name,value,consumed]of [['Chromatic Orb',50,false],['Find Familiar',10,true]]){
 const e=ready({spells:[name]}),r={...request(e),spellIndex:e.C.spells.findIndex(s=>s.n===name)};ok(!e.castPrepare(r).ok);ok(!e.castPrepare({...r,declarations:{...declarations,materialValueGP:value-1,consumedMaterialProvided:true}}).ok);ok(e.castPrepare({...r,declarations:{...declarations,materialValueGP:value,consumedMaterialProvided:true}}).ok);if(consumed)ok(!e.castPrepare({...r,declarations:{...declarations,materialValueGP:value,consumedMaterialProvided:false}}).ok);
}
{
 const e=ready(),C=e.C;C.manualOpaque={keep:true};const snapshot=JSON.stringify(C),n=e.undos;ok(!e.command('absorb',reaction).ok);eq(e.undos,n);eq(JSON.stringify(e.C),snapshot);const next=e.project();ok(e.c.genv.__bldRodAbsorptionInventoryOwner(C,next,e.c.S,next).ok);e.setC(next);ok(e.command('absorb',reaction).ok);
}
{
 const e=ready();e.c.S.rodAbsorption=e.c.absorbRodSpell(e.c.S.rodAbsorption,'ra-1',1,Object.fromEntries(['actualHolding','actualAllocatedAttunement','actualReactionCompleted','targetsOnlyActor','producesAreaOfEffect','actualCastLevelVerified'].map(k=>[k,reaction[k]]))).state;const next=e.project();ok(e.c.genv.__bldRodAbsorptionInventoryOwner(e.C,next,e.c.S,next).ok);e.setC(next);eq(e.C.rodAbsorption.rods[0].stored,11);
}
{
 const e=ready({level:1,secondaryLevel:5},20,20),fireball=e.C.spells.findIndex(s=>s.n==='Fireball');ok(e.info().castOptions.every(option=>option.name!=='Fireball'));ok(!e.castPrepare({...request(e,3),spellIndex:fireball}).ok);ok(e.castPrepare(request(e,3)).ok);const p=e.castPrepare(request(e,3)),used=structuredClone(e.c.S.used);ok(e.castCommit(p.payment,()=>({ok:true})).ok);eq(e.C.rodAbsorption.rods[0].stored,17);eq(e.c.S.used,used);
}
{
 const e=ready({},49,1),p=e.castPrepare(request(e));ok(e.castCommit(p.payment,()=>({ok:true})).ok);eq(e.C.rodAbsorption.rods[0].stored,0);eq(e.C.rodAbsorption.rods[0].nonmagical,false);eq(e.c.attunementState().used,1);ok(e.command('absorb',reaction).ok);eq(e.C.rodAbsorption.rods[0].stored,1);eq(e.C.rodAbsorption.rods[0].totalAbsorbed,50);
}
console.log(checks+' PASS');
