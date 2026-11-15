import assert from 'node:assert/strict';
import {instrumentProfiles} from '../src/data/lib/instrument-spell-profiles.js';
import {createInstrumentSpells,instrumentModel,instrumentBudgetKey} from '../src/data/lib/instrument-spells.js';
let count=0;const check=(a,b)=>{assert.deepEqual(a,b);count++},profiles=instrumentProfiles(),model=instrumentModel(profiles);
const reviewFacts={actualPhysicalIdentityVerified:true,actualEverySpellHistoryVerified:true,actualLastDawnVerified:true},admitFacts={actualPhysicalIdentityVerified:true,actualSpecificOriginalProfileVerified:true};
const castFacts={actualSourceAndActorCertified:true,actualBardAttunementAllocated:true,actualPlayingCompleted:true,actualPrintedCastingTimeCompleted:true,actualCanonicalSpellCertified:true,actualItemAbilityChannelCertified:true};
const dawnFacts={actualDawnOccurred:true,actualCampaignDawnVerified:true,actualDawnOccurredAfterAdmissions:true};
const source=(p,n=1)=>({profile:p.id,itemFingerprint:p.itemFingerprint,grantsFingerprint:p.grantsFingerprint,parentFingerprint:null,spells:p.grants.map(g=>({grantId:g.id,budgetKey:instrumentBudgetKey(n,g.id)}))});
const commit=(current,result)=>{assert.equal(result.ok,true);return {state:result.state,used:{...current.used,...result.writes}}};
for(const profile of profiles){
 let c={state:createInstrumentSpells(),used:{'i-old-shared-instrument':0}};const originalUsed=structuredClone(c.used);
 let r=model.admit(c.state,c.used,source(profile),admitFacts);check(r.ok,true);c=commit(c,r);check(model.projection(c.state,c.used).physical[0].reviewRequired,true);
 const grant=profile.grants[0],cast={spell:grant.spell,spellSource:grant.spellSource,definitionFingerprint:'host-certified-full-native-definition',castLevel:grant.castLevel,restriction:grant.restriction,ability:'CHA',channelFingerprint:'host-certified-generic-item-channel'};
 check(model.cast(c.state,c.used,'isp-1',grant.id,cast,castFacts).ok,false);check(c.used,originalUsed);
 r=model.review(c.state,c.used,'isp-1',profile.grants.map(g=>({grantId:g.id,used:0})),{occurrenceId:'dawn-10',ordinal:10},reviewFacts);check(r.ok,true);c=commit(c,r);
 check(model.review(c.state,c.used,'isp-1',[],{occurrenceId:'dawn-10',ordinal:10},reviewFacts).ok,false);
 const before=structuredClone(c);r=model.cast(c.state,c.used,'isp-1',grant.id,cast,castFacts);check(r.ok,true);check(Object.keys(r.writes),[instrumentBudgetKey(1,grant.id)]);c=commit(c,r);
 check(model.cast(c.state,c.used,'isp-1',grant.id,cast,castFacts).ok,false);check(model.projection(c.state,c.used).physical[0].spells.slice(1).every(g=>g.remaining===1),true);
 check(model.cast(before.state,before.used,'isp-1',grant.id,{...cast,spellSource:cast.spellSource==='phb2024'?'phb2014':'phb2024'},castFacts).ok,false);
 check(model.cast(before.state,before.used,'isp-1',grant.id,cast,{...castFacts,actualPlayingCompleted:false}).ok,false);
 check(model.dawn(c.state,c.used,{occurrenceId:'dawn-10',ordinal:10},dawnFacts).ok,false);
 check(model.dawn(c.state,c.used,{occurrenceId:'dawn-10',ordinal:11},dawnFacts).ok,false);
 r=model.dawn(c.state,c.used,{occurrenceId:'dawn-11',ordinal:11},dawnFacts);check(r.ok,true);c=commit(c,r);check(c.used[instrumentBudgetKey(1,grant.id)],0);
 check(model.dawn(c.state,c.used,{occurrenceId:'dawn-11',ordinal:11},dawnFacts).ok,false);
 r=model.admit(c.state,c.used,source(profile,2),admitFacts);check(r.ok,true);c=commit(c,r);r=model.review(c.state,c.used,'isp-2',profile.grants.map(g=>({grantId:g.id,used:0})),{occurrenceId:'dawn-11',ordinal:11},reviewFacts);check(r.ok,true);c=commit(c,r);
 c=commit(c,model.cast(c.state,c.used,'isp-1',grant.id,cast,castFacts));check(c.used[instrumentBudgetKey(2,grant.id)],0);
 c=commit(c,model.presence(c.state,c.used,'isp-1',false,{actualPhysicalRemoved:true}));check(model.cast(c.state,c.used,'isp-1',grant.id,cast,castFacts).ok,false);
 c=commit(c,model.dawn(c.state,c.used,{occurrenceId:'dawn-12',ordinal:12},dawnFacts));check(c.used[instrumentBudgetKey(1,grant.id)],0);
 c=commit(c,model.presence(c.state,c.used,'isp-1',true,{actualSamePhysicalReturned:true,recordedMagicHistoryUnchanged:true}));check(model.projection(c.state,c.used).physical[0].spells[0].remaining,1);
 const hidden=structuredClone(c.used);Object.defineProperty(hidden,instrumentBudgetKey(1,grant.id),{value:0,enumerable:false});check(model.projection(c.state,hidden).ok,false);check(model.cast(c.state,hidden,'isp-1',grant.id,cast,castFacts).ok,false);
 let getterReads=0;const getter=structuredClone(c.used);Object.defineProperty(getter,instrumentBudgetKey(1,grant.id),{get(){getterReads++;return 0},enumerable:true});check(model.projection(c.state,getter).ok,false);check(model.cast(c.state,getter,'isp-1',grant.id,cast,castFacts).ok,false);check(getterReads,0);
 const badGrants=structuredClone(c.state);badGrants.physical[0].grantsFingerprint='future';check(model.problems(badGrants).length>0,true);
 const drift=structuredClone(c.used);drift[instrumentBudgetKey(1,grant.id)]=undefined;check(model.cast(c.state,drift,'isp-1',grant.id,cast,castFacts).ok,false);check(c.used['i-old-shared-instrument'],0);
 const unknown=structuredClone(c.state);unknown.v=99;check(model.projection(unknown,c.used).ok,false);
 const tamper=structuredClone(c.state);tamper.events.find(e=>e.kind==='cast').grantId='future-spell';check(model.problems(tamper).length>0,true);
 for(const g of profile.grants){const payload={...cast,spell:g.spell,spellSource:g.spellSource,castLevel:g.castLevel,restriction:g.restriction};check(model.cast(c.state,c.used,'isp-2',g.id,payload,castFacts).ok,true);}
 const collision={ [instrumentBudgetKey(1,grant.id)]:undefined };check(model.admit(createInstrumentSpells(),collision,source(profile),admitFacts).ok,false);
 const allocation=model.allocate(createInstrumentSpells(),collision,profile.id);check(allocation.ok,true);check(allocation.spells.every(g=>!Object.hasOwn(collision,g.budgetKey)),true);check(model.admit(createInstrumentSpells(),collision,{...source(profile),spells:allocation.spells},admitFacts).ok,true);
 check(model.admit(createInstrumentSpells(),{},source(profile),admitFacts,[instrumentBudgetKey(1,grant.id)]).ok,false);
 check(model.problems(undefined).length>0,true);
}
{
 const p=profiles[0];let c={state:createInstrumentSpells(),used:{}};
 c=commit(c,model.admit(c.state,c.used,source(p),admitFacts));check(model.projection(c.state,c.used).physical[0].reviewRequired,true);
 const firstDawn=model.dawn(c.state,c.used,{occurrenceId:'actual-after-admission',ordinal:30},dawnFacts);check(firstDawn.ok,true);check(Object.keys(firstDawn.writes).length,p.grants.length);c=commit(c,firstDawn);check(model.projection(c.state,c.used).physical[0].reviewRequired,false);
 check(model.dawn(c.state,c.used,{occurrenceId:'actual-after-admission',ordinal:30},dawnFacts).ok,false);
 c=commit(c,model.admit(c.state,c.used,source(p,2),admitFacts));check(model.projection(c.state,c.used).physical[1].reviewRequired,true);check(c.state.physical[1].admittedAtEvent,2);
 const foreignCounter={...c.used,[instrumentBudgetKey(2,p.grants[0].id)]:undefined};check(model.dawn(c.state,foreignCounter,{occurrenceId:'next-actual-dawn',ordinal:31},dawnFacts).ok,false);
 c=commit(c,model.dawn(c.state,c.used,{occurrenceId:'next-actual-dawn',ordinal:31},dawnFacts));check(model.projection(c.state,c.used).physical[1].reviewRequired,false);check(c.used[instrumentBudgetKey(2,p.grants[0].id)],0);
}
{
 const p=profiles[0];let getterReads=0;const state=createInstrumentSpells(),used={};const admitted=model.admit(state,used,source(p),admitFacts);const broken=structuredClone(admitted.state);Object.defineProperty(broken.physical[0],'profile',{get(){getterReads++;return p.id},enumerable:true});check(model.problems(broken).length>0,true);check(getterReads,0);
 const nested=structuredClone(admitted.state);nested.events.push({id:'ise-1',kind:'future',payload:{}});nested.nextEvent=2;Object.defineProperty(nested.events[0].payload,'future',{get(){getterReads++;return 1},enumerable:true});check(model.problems(nested).length>0,true);check(getterReads,0);
 const payload={};Object.defineProperty(payload,'initial',{get(){getterReads++;return 0},enumerable:true});check(model.review(admitted.state,used,'isp-1',payload,{occurrenceId:'dawn-0',ordinal:0},reviewFacts).ok,false);check(getterReads,0);
}
console.log(`${count} pure physical instrument history/counter/dawn proofs PASS (${profiles.length} original profiles)`);
