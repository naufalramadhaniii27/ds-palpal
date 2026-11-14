import assert from 'node:assert/strict';import {createTravelGoatEngine} from './fixtures/travel-goat-native.mjs';
let checks=0;const ok=v=>{assert.ok(v);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
const facts=profile=>({actualPhysicalIdentityVerified:true,actualTravelingComponentVerified:true,actualIvoryGoatTravelingSelection:profile==='current-generic'}),activation={actualSourceActionCompleted:true,actualClearSpaceWithin60Feet:true};
function ready(profileId='current-generic',remaining=24,options={}){const e=createTravelGoatEngine({...options,profileId});ok(e.command('admit',{index:0,nativeProfile:profileId,facts:facts(profileId)}).ok);ok(e.command('review',{physicalId:'tgp-1',remaining,facts:{actualTravelChargeHistoryVerified:true}}).ok);return e}
function start(e){const r=e.command('activate',{physicalId:'tgp-1',facts:activation});ok(r.ok);ok(e.accept(r.receipt).ok);return e.info().physical[0].active.id}
for(const profileId of ['current-generic','current-goats','legacy-goats']){
 const e=createTravelGoatEngine({profileId,used:{s1:2,pact:1,legacyUnrelated:7}}),before=structuredClone(e.c.S.used);ok(e.info().rows[0].canAdmit);ok(e.command('admit',{index:0,nativeProfile:profileId,facts:facts(profileId)}).ok);const p=e.C.travelGoat.physical[0],key=p.budgetKey;eq(Object.hasOwn(e.c.S.used,key),false);eq(e.info().physical[0].remaining,null);const n=e.undos;ok(!e.command('activate',{physicalId:p.id,facts:activation}).ok);eq(e.undos,n);ok(e.command('review',{physicalId:p.id,remaining:24,facts:{actualTravelChargeHistoryVerified:true}}).ok);eq(e.c.S.used[key],0);const formId=start(e),npc=e.info().physical[0].active.creature;eq(npc.maxHP,13);eq(npc.source,profileId==='legacy-goats'?'mm14':'core');const row=e.C.res.find(r=>r.k===key);eq(row.max,24);eq(row.reset,'none');eq(row.travelGoat.id,p.id);const undo=e.undos;let saves=0;e.setSave(()=>{saves++;return true});ok(e.command('elapsed',{physicalId:p.id,formId,completedHours:0,partialHour:true,facts:{actualElapsedTimeVerified:true}}).ok);eq(e.undos,undo+1);eq(saves,1);eq(e.c.S.used[key],1);ok(e.command('elapsed',{physicalId:p.id,formId,completedHours:1,partialHour:false,facts:{actualElapsedTimeVerified:true}}).ok);eq(e.c.S.used[key],1);ok(!e.command('elapsed',{physicalId:p.id,formId,completedHours:1,partialHour:false,facts:{actualElapsedTimeVerified:true}}).ok);ok(e.command('hp',{physicalId:p.id,formId,operation:'damage',amount:13}).ok);eq(e.info().physical[0].active,null);eq(e.c.S.used[key],1);for(const k of Object.keys(before))eq(e.c.S.used[k],before[k]);eq(e.C.hp,25);
}
{
 const e=ready('legacy-goats',1),key=e.C.travelGoat.physical[0].budgetKey,formId=start(e);ok(e.command('hp',{physicalId:'tgp-1',formId,operation:'damage',amount:13}).ok);eq(e.c.S.used[key],24);ok(e.info().physical[0].canRecover);ok(!e.command('activate',{physicalId:'tgp-1',facts:activation}).ok);ok(!e.command('recover',{physicalId:'tgp-1',eventId:'week1',facts:{actualSevenDaysSinceExhaustionPassed:false}}).ok);const r=e.command('recover',{physicalId:'tgp-1',eventId:'week1',facts:{actualSevenDaysSinceExhaustionPassed:true}});ok(r.ok);eq(e.c.S.used[key],0);ok(!e.command('recover',{physicalId:'tgp-1',eventId:'week1',facts:{actualSevenDaysSinceExhaustionPassed:true}}).ok);
}
{
 const e=ready(),formId=start(e),key=e.C.travelGoat.physical[0].budgetKey;ok(e.command('remove',{physicalId:'tgp-1'}).ok);eq(e.info().physical[0].present,false);ok(e.info().physical[0].active);eq(e.c.B.inv.length,0);e.c.B.name='Foreign Build';const foreign=JSON.stringify(e.c.B);e.c.genv.QREFS.monster=[];ok(e.command('elapsed',{physicalId:'tgp-1',formId,completedHours:2,partialHour:false,facts:{actualElapsedTimeVerified:true}}).ok);eq(e.c.S.used[key],2);ok(e.command('hp',{physicalId:'tgp-1',formId,operation:'damage',amount:4}).ok);eq(e.info().physical[0].active.hp,9);eq(JSON.stringify(e.c.B),foreign);ok(!e.command('activate',{physicalId:'tgp-1',facts:activation}).ok);
}
for(const failure of ['false','throw','promise']){
 const e=ready(),formId=start(e),state=JSON.stringify(e.c.S),C=JSON.stringify(e.C);e.setSave(()=>{if(failure==='throw')throw Error('rejected');return failure==='promise'?Promise.resolve(true):false});const r=e.command('elapsed',{physicalId:'tgp-1',formId,completedHours:1,partialHour:false,facts:{actualElapsedTimeVerified:true}});ok(!r.ok&&!r.committed);eq(JSON.stringify(e.c.S),state);eq(JSON.stringify(e.C),C);
}
{
 const e=ready(),formId=start(e);e.setUndo(()=>{e.c.C.name='Other actor';return true});ok(!e.command('elapsed',{physicalId:'tgp-1',formId,completedHours:1,partialHour:false,facts:{actualElapsedTimeVerified:true}}).ok);eq(e.c.S.used[e.C.travelGoat.physical[0].budgetKey],0);
}
{
 const e=ready(),formId=start(e);e.setSave(()=>{e.c.C.notes='Changed in Save';return true});const r=e.command('elapsed',{physicalId:'tgp-1',formId,completedHours:1,partialHour:false,facts:{actualElapsedTimeVerified:true}});ok(!r.ok&&r.committed);eq(e.c.C.notes,'Changed in Save');eq(e.c.S.used[e.C.travelGoat.physical[0].budgetKey],1);ok(!e.accept(r.receipt).ok);
}
for(const profileId of ['current-goats','legacy-goats']){
 const e=createTravelGoatEngine({profileId}),old=e.C.res.find(r=>r.item===1&&r.max===(profileId==='current-goats'?3:24));ok(old);e.c.S.used[old.k]=profileId==='current-goats'?2:19;e.setC(e.project());ok(e.command('admit',{index:0,nativeProfile:profileId,facts:facts(profileId)}).ok);eq(e.c.S.used[old.k],profileId==='current-goats'?2:19);eq(e.C.res.filter(r=>r.k===old.k).length,profileId==='current-goats'?1:0);ok(e.command('review',{physicalId:'tgp-1',remaining:7,facts:{actualTravelChargeHistoryVerified:true}}).ok);eq(e.info().physical[0].remaining,7);eq(e.c.S.used[old.k],profileId==='current-goats'?2:19);
}
{
 const e=ready(),old=structuredClone(e.c.B.inv),key=e.C.travelGoat.physical[0].budgetKey;ok(e.command('remove',{physicalId:'tgp-1'}).ok);e.c.B.inv=old;e.setC(e.project());eq(e.info().physical[0].present,false);ok(!e.command('activate',{physicalId:'tgp-1',facts:activation}).ok);ok(e.command('restore',{physicalId:'tgp-1',facts:{actualPhysicalReturned:true,recordedMagicHistoryUnchanged:true}}).ok);eq(e.info().physical[0].present,true);eq(e.c.S.used[key],0);ok(!e.command('restore',{physicalId:'tgp-1',facts:{actualPhysicalReturned:true,recordedMagicHistoryUnchanged:true}}).ok);
}
for(const namespace of [undefined,null,{v:99}]){
 const e=ready();e.c.S.travelGoat=namespace;e.setC({...e.C,travelGoat:namespace});const n=e.undos,snapshot=JSON.stringify(e.c.S);ok(!e.info().actorAvailable);ok(!e.command('recover',{physicalId:'tgp-1',eventId:'x',facts:{actualSevenDaysSinceExhaustionPassed:true}}).ok);eq(e.undos,n);eq(JSON.stringify(e.c.S),snapshot);
}
{
 const e=createTravelGoatEngine({inventory:[{n:'Figurine of Wondrous Power',q:3,eq:false}]});ok(!e.command('admit',{index:0,nativeProfile:'current-generic',facts:facts('current-generic')}).ok);ok(e.command('split',{index:0,keepRecordedWith:'original'}).ok);eq(e.c.B.inv.map(r=>r.q),[1,2]);ok(e.command('admit',{index:0,nativeProfile:'current-generic',facts:facts('current-generic')}).ok);eq(e.c.B.inv[1].travelGoat,undefined);
}
for(const fault of ['missing','undefined']){
 const e=ready(),key=e.C.travelGoat.physical[0].budgetKey;if(fault==='missing')delete e.c.S.used[key];else e.c.S.used[key]=undefined;const before=structuredClone(e.c.S),n=e.undos;ok(!e.info().actorAvailable);ok(!e.command('admit',{index:0,nativeProfile:'current-generic',facts:facts('current-generic')}).ok);eq(e.undos,n);eq(e.c.S,before);
}
{
 const e=createTravelGoatEngine(),next=structuredClone(e.C);next.travelGoatSources.rows=[{v:99}];e.setC(next);const n=e.undos;ok(!e.info().rows[0].canAdmit);ok(!e.command('admit',{index:0,nativeProfile:'current-generic',facts:facts('current-generic')}).ok);eq(e.undos,n);
}
{
 const e=ready('current-generic',5),formId=start(e),n=e.undos,before=structuredClone(e.c.S);ok(!e.command('elapsed',{physicalId:'tgp-1',formId,completedHours:5,partialHour:true,facts:{actualElapsedTimeVerified:true}}).ok);eq(e.undos,n);eq(e.c.S,before);
 const body={formId,operation:'damage',amount:1};Object.defineProperty(body,'physicalId',{enumerable:true,get(){throw Error('must not read accessor')}});ok(!e.command('hp',body).ok);eq(e.undos,n);
}
console.log(checks+' PASS');
