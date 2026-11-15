import assert from 'node:assert/strict';
import {vecnaGraftProfiles} from '../src/data/lib/vecna-graft-profiles.js';
import {createVecnaGrafts,admitVecnaGraft,recordVecnaAttachment,recordVecnaDetachment,recordVecnaGraftPresence,vecnaGraftsProjection,vecnaGraftsProblems,vecnaGraftMarker,vecnaGraftsRawState} from '../src/data/lib/vecna-grafts.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++},profiles=vecnaGraftProfiles(),admitFacts={actualPhysicalArtifactIdentityVerified:true,actualCurrentOriginalSourceVerified:true};
const source=p=>({profile:p.id,part:p.part,itemFingerprint:p.itemFingerprint});
const attachFacts=p=>({actualPhysicalIdentityVerified:true,[p.part==='eye'?'actualEyeFusedIntoThisCharactersSocket':'actualHandGraftedOntoThisCharactersLeftStump']:true,printedRemovalConsequenceAcknowledged:true});
const bound=(p,id)=>({id,profile:p.id,itemFingerprint:p.itemFingerprint,attuned:true,originalCurrentSource:true});
let state=createVecnaGrafts(),bindings=[];eq(vecnaGraftsProjection(state).initiativeAdvantage,false);
for(const p of profiles){const r=admitVecnaGraft(state,source(p),admitFacts);eq(r.ok,true);state=r.state;bindings.push(bound(p,r.id));eq(vecnaGraftsProjection(state,bindings).initiativeAdvantage,false);const before=structuredClone(state);eq(recordVecnaAttachment(state,r.id,{...attachFacts(p),printedRemovalConsequenceAcknowledged:false}).ok,false);eq(state,before);const a=recordVecnaAttachment(state,r.id,attachFacts(p));eq(a.ok,true);state=a.state;eq(recordVecnaAttachment(state,r.id,attachFacts(p)).ok,false);}
eq(vecnaGraftsProjection(state,bindings).initiativeAdvantage,true);
eq(admitVecnaGraft(state,source(profiles[0]),admitFacts).ok,true);
for(const value of [[],[bindings[0]],[bindings[0],bindings[0]],bindings.map((b,i)=>i?{...b,attuned:false}:b),bindings.map((b,i)=>i?{...b,itemFingerprint:profiles[1].legacyFingerprint}:b),bindings.map((b,i)=>i?{...b,originalCurrentSource:false}:b)])eq(vecnaGraftsProjection(state,value).initiativeAdvantage,false);
const old=structuredClone(state),absent=recordVecnaGraftPresence(state,'vg-1',false,{actualPhysicalSourceAbsent:true});eq(absent.ok,true);eq(vecnaGraftsProjection(absent.state,bindings).initiativeAdvantage,false);eq(vecnaGraftsProjection(absent.state,bindings).physical[0].attached,true);eq(absent.state.events.at(-1).kind,'absent');
const returned=recordVecnaGraftPresence(absent.state,'vg-1',true,{actualSamePhysicalArtifactReturned:true,recordedGraftHistoryUnchanged:true});eq(returned.ok,true);eq(vecnaGraftsProjection(returned.state,bindings).initiativeAdvantage,true);
eq(recordVecnaDetachment(state,'vg-1',{actualPhysicalRemovalVerified:true,printedRemovalConsequenceAcknowledged:false}).ok,false);eq(state,old);
const detached=recordVecnaDetachment(state,'vg-1',{actualPhysicalRemovalVerified:true,printedRemovalConsequenceAcknowledged:true});eq(detached.ok,true);eq(vecnaGraftsProjection(detached.state,bindings).initiativeAdvantage,false);eq(vecnaGraftsProjection(detached.state,bindings).physical[0].removalRecorded,true);eq(Object.hasOwn(detached,'hp'),false);
for(const invalid of [undefined,null,{v:99}, {...state,v:99},{...state,nextEvent:state.nextEvent+1}])eq(vecnaGraftsProblems(invalid).length>0,true);
let reads=0;const getter=structuredClone(state);Object.defineProperty(getter.physical[0],'profile',{get(){reads++;return profiles[0].id},enumerable:true});eq(vecnaGraftsProblems(getter).length>0,true);eq(reads,0);
const future=structuredClone(state);future.events[0].facts.future=true;eq(vecnaGraftsProblems(future).length>0,true);
const chronology=structuredClone(state);chronology.physical[0].admittedAtEvent=2;eq(vecnaGraftsProblems(chronology).length>0,true);
{
 const replacement=admitVecnaGraft(detached.state,source(profiles[0]),admitFacts);eq(replacement.ok,true);eq(replacement.id,'vg-3');eq(replacement.state.physical.length,3);
 const grafted=recordVecnaAttachment(replacement.state,replacement.id,attachFacts(profiles[0]));eq(grafted.ok,true);const currentBindings=[bindings[1],bound(profiles[0],replacement.id)];eq(vecnaGraftsProjection(grafted.state,currentBindings).initiativeAdvantage,true);eq(grafted.state.events.some(e=>e.kind==='detach'&&e.physicalId==='vg-1'),true);eq(vecnaGraftsProjection(grafted.state,[...currentBindings,bindings[0]]).initiativeAdvantage,true);
 const duplicate=admitVecnaGraft(state,source(profiles[0]),admitFacts),duplicateGraft=recordVecnaAttachment(duplicate.state,duplicate.id,attachFacts(profiles[0]));eq(duplicateGraft.ok,true);eq(vecnaGraftsProjection(duplicateGraft.state,[...bindings,bound(profiles[0],duplicate.id)]).initiativeAdvantage,false);
 const retiredPresence=recordVecnaGraftPresence(duplicateGraft.state,'vg-1',false,{actualPhysicalSourceAbsent:true});eq(retiredPresence.ok,true);eq(vecnaGraftsProjection(retiredPresence.state,[bindings[1],bound(profiles[0],duplicate.id)]).initiativeAdvantage,true);
}
{
 eq(vecnaGraftsRawState({}),{present:false,ok:true,state:null});eq(vecnaGraftMarker({}),{present:false,ok:true,id:null});
 for(const value of [undefined,null,{v:99},{...state,v:2}]){const owner={vecnaGrafts:value},before=structuredClone(owner);eq(vecnaGraftsRawState(owner).ok,false);eq(vecnaGraftsRawState(owner).present,true);eq(owner,before);}
 eq(vecnaGraftsRawState({vecnaGrafts:state}).ok,true);
 for(const value of [undefined,null,{v:99,id:'vg-1'},{v:1,id:'vg-01'},{v:1,id:'__proto__'},{v:1,id:'vg-9007199254740992'}])eq(vecnaGraftMarker({vecnaGraft:value}).ok,false);
 eq(vecnaGraftMarker({vecnaGraft:{v:1,id:'vg-3'}}),{present:true,ok:true,id:'vg-3'});
 let reads=0;const owner={};Object.defineProperty(owner,'vecnaGrafts',{get(){reads++;return state},enumerable:true});Object.defineProperty(owner,'vecnaGraft',{get(){reads++;return {v:1,id:'vg-1'}},enumerable:true});eq(vecnaGraftsRawState(owner).ok,false);eq(vecnaGraftMarker(owner).ok,false);eq(reads,0);
 const hidden={};Object.defineProperty(hidden,'vecnaGrafts',{value:state,enumerable:false});Object.defineProperty(hidden,'vecnaGraft',{value:{v:1,id:'vg-1'},enumerable:false});eq(vecnaGraftsRawState(hidden).ok,false);eq(vecnaGraftMarker(hidden).ok,false);
 const duplicate=structuredClone(state);duplicate.physical[1].id=duplicate.physical[0].id;eq(vecnaGraftsProblems(duplicate).length>0,true);
 const repeated=structuredClone(state);repeated.events[1].id=repeated.events[0].id;eq(vecnaGraftsProblems(repeated).length>0,true);
 const old=structuredClone(state);for(const id of ['__proto__','vg-01','vg-0','vg-9007199254740992'])eq(recordVecnaDetachment(state,id,{actualPhysicalRemovalVerified:true,printedRemovalConsequenceAcknowledged:true}).ok,false);eq(state,old);
 const a=createVecnaGrafts(),candidate={...source(profiles[0]),id:'vg-7'};eq(admitVecnaGraft(a,candidate,admitFacts).ok,false);eq(a,createVecnaGrafts());
 const accepted=admitVecnaGraft(a,source(profiles[0]),admitFacts),factual=attachFacts(profiles[0]),recorded=recordVecnaAttachment(accepted.state,accepted.id,factual);factual.printedRemovalConsequenceAcknowledged=false;eq(recorded.state.events[0].facts.printedRemovalConsequenceAcknowledged,true);eq(accepted.state.events.length,0);
 const mutableSource=source(profiles[0]),admitted=admitVecnaGraft(createVecnaGrafts(),mutableSource,admitFacts);mutableSource.itemFingerprint='changed';eq(admitted.state.physical[0].itemFingerprint,profiles[0].itemFingerprint);
 const opaque=structuredClone(state);opaque.future=undefined;eq(vecnaGraftsProblems(opaque).length>0,true);
 const nested=structuredClone(state);Object.defineProperty(nested.events[0].facts,'future',{get(){reads++;return true},enumerable:true});eq(vecnaGraftsProblems(nested).length>0,true);eq(reads,0);
}
console.log(`${count} paired Vecna graft/attachment/presence/source-history checks PASS`);
