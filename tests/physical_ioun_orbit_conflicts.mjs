import assert from 'node:assert/strict';
import fs from 'node:fs';
// Reuse only the established native backend fixture setup, never its regression matrix.
async function fixtureModule(file,marker,exports){
 const url=new URL(file,import.meta.url),source=fs.readFileSync(url,'utf8'),end=source.indexOf(marker);
 assert.ok(end>0,`Fixture boundary exists: ${file}`);
 const setup=source.slice(0,end).replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,a,path,b)=>a+new URL(path,url).href+b).replaceAll('import.meta.url',JSON.stringify(url.href));
 return import('data:text/javascript;base64,'+Buffer.from(setup+'\nexport {'+exports+'};').toString('base64'));
}
const recovery=await fixtureModule('slot_recovery_backend.mjs','const f=fixture();','fixture,ready');
const gem=await fixtureModule('spell_gem_backend.mjs','const legacy=fixture();','fixture,review,release');
const tattoo=await fixtureModule('tattoo_backend.mjs','for(let iteration=0;','fixture,ready,apply');
const stored=await fixtureModule('stored_spell_backend.mjs','const f=fixture();','fixture,ready,load,releaseFacts');
let checks=0;function eq(a,b){assert.deepEqual(a,b);checks++}
const cases=[
 {name:'Pearl',module:recovery,ready:recovery.ready,action:f=>f.activate(),adopt:f=>f.adopt()},
 {name:'Gem',module:gem,ready:gem.review,action:f=>gem.release(f),adopt:f=>f.genv.__bldGemAdopt('Hero',f.undo)},
 {name:'Tattoo',module:tattoo,ready:tattoo.ready,action:f=>tattoo.apply(f),adopt:f=>f.genv.__bldAdoptTattoos('Actor',f.undo)},
 {name:'Stored',module:stored,ready:stored.ready,action:f=>stored.load(f,'Cure Wounds',2),adopt:f=>f.service.adopt()}
];
const snapshot=f=>JSON.stringify([f.B,f.C,f.S]);

for(const c of cases)for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=c.module.fixture();c.ready(f);f[side].inv[0].iounOrbit=structuredClone(value);const before=snapshot(f),undos=f.history.length;
 eq(c.action(f).ok,false);eq(f.history.length,undos);eq(snapshot(f),before);eq(Object.hasOwn(f[side].inv[0],'iounOrbit'),true);
 const fresh=c.module.fixture();fresh.B.inv[0].iounOrbit=structuredClone(value);const state=snapshot(fresh);eq(c.adopt(fresh).ok,false);eq(snapshot(fresh),state);eq(fresh.history.length,0);
}
const {createStudyBooksBackend}=await import('./fixtures/study-books-backend-native.mjs');
const {createBagTricksEngine}=await import('./fixtures/bag-tricks-native.mjs');
for(const kind of ['book','bag'])for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=kind==='book'?createStudyBooksBackend():createBagTricksEngine();
 const adopt=()=>f.command('adopt',kind==='book'?{index:0}:{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true});eq(adopt().ok,true);
 const id=kind==='book'?f.c.B.inv[0].studyBook.id:f.c.B.inv[0].bagTricks.id;
 eq(f.command(kind==='book'?'review-availability':'review-history',kind==='book'?{physicalId:id,actualAvailabilityVerified:true,available:true}:{physicalId:id,actualDawnHistoryVerified:true,used:0}).ok,true);
 f.c[side].inv[0].iounOrbit=structuredClone(value);const before=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 const result=f.command(kind==='book'?'study':'draw',kind==='book'?{physicalId:id,actualStudyAndPracticeCompleted:true,completedStudyHours:48,elapsedSpanHours:72}:{physicalId:id,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true});
 eq(result.ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),before);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
}
// Committed summoned creatures retain their own HP/dawn permissions despite a later source conflict.
const kept=createBagTricksEngine();eq(kept.command('adopt',{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true}).ok,true);const pid=kept.c.B.inv[0].bagTricks.id;
eq(kept.command('review-history',{physicalId:pid,actualDawnHistoryVerified:true,used:0}).ok,true);eq(kept.command('draw',{physicalId:pid,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true}).ok,true);const eid=kept.info().entities[0].id;
kept.c.B.inv[0].iounOrbit={v:99};kept.C.inv[0].iounOrbit={v:99};eq(kept.command('hp',{entityId:eid,kind:'damage',amount:1}).ok,true);eq(kept.command('dawn',{actualNextDawnOccurred:true,eventId:'retained-dawn'}).ok,true);
eq(kept.c.B.inv[0].iounOrbit.v,99);eq(kept.C.inv[0].iounOrbit.v,99);


const {createHornValhallaEngine}=await import('./fixtures/horn-valhalla-native.mjs');
function readyHorn(f){eq(f.command('adopt',{index:0,nativeProfile:'dmg2024',metal:'silver',actualPhysicalIdentityVerified:true}).ok,true);const id=f.c.B.inv[0].hornValhalla.id;eq(f.command('review-history',{physicalId:id,actualSevenDayUseHistoryVerified:true,used:0}).ok,true);return id}
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createHornValhallaEngine(),id=readyHorn(f);f.c[side].inv[0].iounOrbit=structuredClone(value);const prior=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 eq(f.command('summon',{physicalId:id,actualPhysicalAccessVerified:true,actualActivationCompleted:true,dice:[]}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),prior);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
 const fresh=createHornValhallaEngine();fresh.c[side].inv[0].iounOrbit=structuredClone(value);eq(fresh.command('adopt',{index:0,nativeProfile:'dmg2024',metal:'silver',actualPhysicalIdentityVerified:true}).ok,false);eq(fresh.undos,0);eq(Object.hasOwn(fresh.c[side].inv[0],'iounOrbit'),true);
}
// Retained creatures are actor-owned; a conflicting physical source cannot erase HP or expiry permission.
for(const kind of ['bag','horn'])for(const value of [undefined,null,{v:99,opaque:'retain'}]){
 const f=kind==='bag'?createBagTricksEngine():createHornValhallaEngine();let id;
 if(kind==='horn'){id=readyHorn(f);eq(f.command('summon',{physicalId:id,actualPhysicalAccessVerified:true,actualActivationCompleted:true,dice:[]}).ok,true)}else{eq(f.command('adopt',{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true}).ok,true);id=f.c.B.inv[0].bagTricks.id;eq(f.command('review-history',{physicalId:id,actualDawnHistoryVerified:true,used:0}).ok,true);eq(f.command('draw',{physicalId:id,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true}).ok,true)}
 const eid=f.info().entities[0].id;for(const side of ['B','C'])f.c[side].inv[0].iounOrbit=structuredClone(value);
 eq(f.command('hp',{entityId:eid,kind:'damage',amount:1}).ok,true);
 if(kind==='horn'){eq(f.command('condition',{entityId:eid,condition:'Blinded',present:true}).ok,true);eq(f.command('hour',{activationId:f.info().activations[0].id,actualOneHourSinceActivationPassed:true}).ok,true);eq(f.command('seven-days',{physicalId:id,actualSevenDaysSinceLastUsePassed:true,eventId:'real-week'}).ok,true)}else eq(f.command('dawn',{actualNextDawnOccurred:true,eventId:'real-dawn'}).ok,true);
 for(const side of ['B','C']){eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);eq(f.c[side].inv[0].iounOrbit,value)}
}
// Own undefined is absent from JSON: save callbacks must not lose a newly added conflicting source namespace.
for(const [kind,field] of [['bag','iounOrbit'],['horn','iounOrbit']]){
 const f=kind==='bag'?createBagTricksEngine():createHornValhallaEngine();let id;
 if(kind==='horn'){id=readyHorn(f);eq(f.command('summon',{physicalId:id,actualPhysicalAccessVerified:true,actualActivationCompleted:true,dice:[]}).ok,true)}else{eq(f.command('adopt',{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true}).ok,true);id=f.c.B.inv[0].bagTricks.id;eq(f.command('review-history',{physicalId:id,actualDawnHistoryVerified:true,used:0}).ok,true);eq(f.command('draw',{physicalId:id,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true}).ok,true)}
 const currentC=f.C;f.setSave(()=>{f.C.inv[0][field]=undefined});const reply=f.command('hp',{entityId:f.info().entities[0].id,kind:'damage',amount:1});eq(reply.committed,true);eq(reply.warning,'actor-changed-after-save');eq(f.C,currentC);eq(Object.hasOwn(f.C.inv[0],field),true);eq(f.C.inv[0][field],undefined);
}


const {createDefenderEngine}=await import('./fixtures/defender-native.mjs');
function readyDefender(f){eq(f.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,true);const id=f.c.B.inv[0].defender.id;eq(f.command('held',{physicalId:id,held:true,actualHeldStateVerified:true}).ok,true);eq(f.command('turn-start',{actualNextOwnTurnStarted:true,eventId:'own-turn-one'}).ok,true);return id}
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createDefenderEngine(),id=readyDefender(f);f.c[side].inv[0].iounOrbit=structuredClone(value);const prior=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 eq(f.attack(1).ok,false);eq(f.command('held',{physicalId:id,held:true,actualHeldStateVerified:true}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),prior);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
 const rehold=createDefenderEngine(),reholdId=readyDefender(rehold);eq(rehold.command('held',{physicalId:reholdId,held:false,actualHeldStateVerified:true}).ok,true);rehold.c[side].inv[0].iounOrbit=structuredClone(value);const beforeRehold=rehold.undos;eq(rehold.command('held',{physicalId:reholdId,held:true,actualHeldStateVerified:true}).ok,false);eq(rehold.undos,beforeRehold);eq(rehold.c.S.defender.physical[0].held,false);
 const fresh=createDefenderEngine();fresh.c[side].inv[0].iounOrbit=structuredClone(value);eq(fresh.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,false);eq(fresh.undos,0);eq(Object.hasOwn(fresh.c[side].inv[0],'iounOrbit'),true);
 const pending=createDefenderEngine();readyDefender(pending);const prepared=pending.attack(1),n=pending.undos;pending.c[side].inv[0].iounOrbit=structuredClone(value);eq(pending.commit(prepared).ok,false);eq(pending.undos,n);eq(pending.c.S.defender.physical[0].firstAttack,false);eq(Object.hasOwn(pending.c[side].inv[0],'iounOrbit'),true);
}
// Source ambiguity cannot prevent ending an already acquired turn allocation or dropping its AC permission.
for(const value of [undefined,null,{v:99,opaque:'retained'}]){
 const f=createDefenderEngine(),id=readyDefender(f);eq(f.commit(f.attack(2)).ok,true);for(const side of ['B','C'])f.c[side].inv[0].iounOrbit=structuredClone(value);
 eq(f.command('held',{physicalId:id,held:false,actualHeldStateVerified:true}).ok,true);eq(f.command('turn-end',{actualOwnTurnEnded:true,turnId:'own-turn-one'}).ok,true);eq(f.command('turn-start',{actualNextOwnTurnStarted:true,eventId:'own-turn-two'}).ok,true);eq(f.c.S.defender.physical[0].allocation,0);for(const side of ['B','C']){eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);eq(f.c[side].inv[0].iounOrbit,value)}
}
const foreignDefender=createDefenderEngine();readyDefender(foreignDefender);foreignDefender.c.B={name:'Foreign',cid:'foreign',inv:[{n:'Defender (Longsword)',iounOrbit:undefined}],opaque:{v:99}};const foreignBefore=JSON.stringify(foreignDefender.c.B);eq(foreignDefender.commit(foreignDefender.attack(1)).ok,true);eq(JSON.stringify(foreignDefender.c.B),foreignBefore);eq(Object.hasOwn(foreignDefender.c.B.inv[0],'iounOrbit'),true);
const saveDefender=createDefenderEngine();readyDefender(saveDefender);const beforeSaveC=saveDefender.C;saveDefender.setSave(()=>saveDefender.C.inv[0].iounOrbit=undefined);const partial=saveDefender.commit(saveDefender.attack(1));eq(partial.committed,true);eq(saveDefender.C,beforeSaveC);eq(Object.hasOwn(saveDefender.C.inv[0],'iounOrbit'),true);eq(saveDefender.C.inv[0].iounOrbit,undefined);


const {createBirdTokenEngine}=await import('./fixtures/bird-token-native.mjs');
function readyBird(f){eq(f.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,true);const id=f.c.B.inv[0].birdToken.id;eq(f.command('review',{physicalId:id,actualPhysicalAvailabilityVerified:true,available:true}).ok,true);return id}
const birdFacts={actualMagicActionCompleted:true,actualTokenThrownFiveFeetUp:true,loadOunces:0};
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createBirdTokenEngine(),id=readyBird(f);f.c[side].inv[0].iounOrbit=structuredClone(value);const prior=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;eq(f.command('activate',{physicalId:id,...birdFacts}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),prior);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
 const fresh=createBirdTokenEngine();fresh.c[side].inv[0].iounOrbit=structuredClone(value);eq(fresh.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,false);eq(fresh.undos,0);eq(Object.hasOwn(fresh.c[side].inv[0],'iounOrbit'),true);
}
for(const value of [undefined,null,{v:99,opaque:'retain'}]){
 const f=createBirdTokenEngine(),id=readyBird(f);eq(f.command('activate',{physicalId:id,...birdFacts}).ok,true);const bid=f.c.S.birdToken.birds[0].id;for(const side of ['B','C'])f.c[side].inv[0].iounOrbit=structuredClone(value);
 eq(f.command('hp',{birdId:bid,kind:'damage',amount:1}).ok,true);eq(f.command('load',{birdId:bid,actualCarriedLoadVerified:true,loadOunces:16}).ok,true);eq(f.command('flight',{birdId:bid,actualFlightSegmentCompleted:true,seconds:10800,distanceUnits:0}).ok,true);eq(f.command('rest',{birdId:bid,actualOneHourRestCompleted:true}).ok,true);eq(f.command('dismiss',{birdId:bid,actualMagicActionDismissalCompleted:true}).ok,true);
 for(const side of ['B','C']){eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);eq(f.c[side].inv[0].iounOrbit,value)}
}
const birdSave=createBirdTokenEngine(),birdSaveId=readyBird(birdSave);eq(birdSave.command('activate',{physicalId:birdSaveId,...birdFacts}).ok,true);const oldBirdC=birdSave.C;birdSave.setSave(()=>{birdSave.C.inv[0].iounOrbit=undefined});const birdPartial=birdSave.command('hp',{birdId:birdSave.c.S.birdToken.birds[0].id,kind:'damage',amount:1});eq(birdPartial.committed,true);eq(birdPartial.warning,'actor-changed-after-save');eq(birdSave.C,oldBirdC);eq(Object.hasOwn(birdSave.C.inv[0],'iounOrbit'),true);


const {createMagicRopesEngine}=await import('./fixtures/magic-ropes-native.mjs');
function readyRope(f){eq(f.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,true);const id=f.c.B.inv[0].magicRopes.id;eq(f.command('review',{physicalId:id,actualObjectStateVerified:true,hp:20,knotted:true}).ok,true);eq(f.command('knot',{physicalId:id,knotted:false,actualKnotStateChanged:true}).ok,true);eq(f.command('knot',{physicalId:id,knotted:true,actualKnotStateChanged:true}).ok,true);return id}
const ropeInput={kind:'ability-check',ability:'WIS',bonus:7,purpose:'climbing',actualUsingRope:true,distanceFeet:50,loadPounds:3000};
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createMagicRopesEngine(),id=readyRope(f);const token=f.c.genv.__bldMagicRopesClimbInfo('Actor',id,ropeInput).token;eq(f.c.genv.__bldMagicRopesClimbCurrent(token),true);f.c[side].inv[0].iounOrbit=structuredClone(value);const prior=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 eq(f.c.genv.__bldMagicRopesClimbInfo('Actor',id,ropeInput).ok,false);eq(f.c.genv.__bldMagicRopesClimbCurrent(token),false);eq(f.command('knot',{physicalId:id,knotted:false,actualKnotStateChanged:true}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),prior);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
 const fresh=createMagicRopesEngine();fresh.c[side].inv[0].iounOrbit=structuredClone(value);eq(fresh.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,false);eq(fresh.undos,0);
}
for(const value of [undefined,null,{v:99,opaque:'retain'}]){
 const f=createMagicRopesEngine(),id=readyRope(f);for(const side of ['B','C'])f.c[side].inv[0].iounOrbit=structuredClone(value);
 eq(f.command('damage',{physicalId:id,actualObjectDamageVerified:true,packets:[{type:'Fire',amount:2}],attack:null}).ok,true);eq(f.c.S.magicRopes.physical[0].hp,18);eq(f.command('regenerate',{physicalId:id,actualCompleteFiveMinuteIntervalsVerified:true,intervals:1,eventId:'actual-five-minutes'}).ok,true);eq(f.c.S.magicRopes.physical[0].hp,19);for(const side of ['B','C']){eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);eq(f.c[side].inv[0].iounOrbit,value)}
}
const ropeSave=createMagicRopesEngine(),ropeId=readyRope(ropeSave),oldRopeC=ropeSave.C;ropeSave.setSave(()=>ropeSave.C.inv[0].iounOrbit=undefined);const ropeReply=ropeSave.command('damage',{physicalId:ropeId,actualObjectDamageVerified:true,packets:[{type:'Fire',amount:1}],attack:null});eq(ropeReply.committed,true);eq(ropeReply.warning,'actor-changed-after-save');eq(ropeSave.C,oldRopeC);eq(Object.hasOwn(ropeSave.C.inv[0],'iounOrbit'),true);
const {createGlovesProducer}=await import('./fixtures/swim-climb-gloves-native.mjs');const {swimClimbGlovesCheck}=await import('../src/data/lib/swim-climb-gloves.js');for(const value of [undefined,null,{v:99}]){const f=createGlovesProducer();f.c.B.inv[0].iounOrbit=structuredClone(value);eq(Object.hasOwn(f.project(),'swimClimbGloves'),false);const clean=createGlovesProducer().project();clean.inv[0].iounOrbit=structuredClone(value);eq(swimClimbGlovesCheck(clean,{skill:'Athletics',ability:'STR',purpose:'climbing'}).ok,false)}
const foreignRope=createMagicRopesEngine(),foreignRopeId=readyRope(foreignRope);foreignRope.c.B={name:'Foreign',cid:'foreign',inv:[{n:'Rope of Climbing',iounOrbit:undefined}],opaque:{v:99}};const foreignRopeRaw=JSON.stringify(foreignRope.c.B);eq(foreignRope.c.genv.__bldMagicRopesClimbInfo('Actor',foreignRopeId,ropeInput).ok,true);eq(foreignRope.command('damage',{physicalId:foreignRopeId,actualObjectDamageVerified:true,packets:[{type:'Fire',amount:1}],attack:null}).ok,true);eq(JSON.stringify(foreignRope.c.B),foreignRopeRaw);eq(Object.hasOwn(foreignRope.c.B.inv[0],'iounOrbit'),true);
const {createTimedDefensesEngine}=await import('./fixtures/timed-defenses-native.mjs');
function readyTimedArmor(f){eq(f.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,true);eq(f.command('review-armor',{physicalId:'tdp-1',actualDawnUseHistoryVerified:true,used:0}).ok,true)}
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createTimedDefensesEngine();readyTimedArmor(f);f.c[side].inv[0].iounOrbit=structuredClone(value);const before=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;eq(f.command('activate-armor',{physicalId:'tdp-1',actualMagicActionCompleted:true}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),before);eq(Object.hasOwn(f.c[side].inv[0],'iounOrbit'),true);
 const fresh=createTimedDefensesEngine();fresh.c[side].inv[0].iounOrbit=structuredClone(value);eq(fresh.command('adopt',{index:0,actualPhysicalIdentityVerified:true}).ok,false);eq(fresh.undos,0);
}
console.log('physical Ioun Orbit typed-marker conflicts: '+checks+' PASS');
