import assert from 'node:assert/strict';
import * as m from '../src/data/lib/ioun-orbit.js';
import {IOUN_PROFILES,IOUN_GENERIC_FINGERPRINT} from '../src/data/lib/ioun-orbit-profiles.js';
let count=0;const test=(v,e=true)=>{assert.deepEqual(v,e);count++;};
const clone=x=>structuredClone(x),origin=p=>({kind:'native-child',parentFingerprint:null,childFingerprint:IOUN_PROFILES[p].fingerprint});
let s=m.createIounOrbit();test(m.iounOrbitProblems(s),[]);
const names=['agility','fortitude','absorption','mastery'];
for(const n of names){const p='dmg2024-ioun-'+n;const r=m.admitIounStone(s,p,origin(p),{actualCurrentlyStowedVerified:true});test(r.ok);s=r.state;}
const context=()=>({edition:'2024',sources:s.stones.map(r=>({id:r.id,profile:r.profile,sourceFingerprint:r.origin.childFingerprint,present:true,allocatedAttunement:true})),unresolvedCurrentOrbit:false,reserveStatus:'none',mixedEditionOccupancy:'none'});
let c=context();test(m.iounOrbitAvailability(s,c).qualifiedIds,[]);
for(const id of ['io-1','io-2','io-3']){const r=m.tossIounStone(s,id,c,{actualMagicActionCompleted:true});test(r.ok);s=r.state;}
test(m.iounOrbitAvailability(s,c).occupiedIds.length,3);test(m.iounOrbitAvailability(s,c).qualifiedIds,['io-1','io-2']);
test(m.tossIounStone(s,'io-4',c,{actualMagicActionCompleted:true}).reason,'orbit-capacity');
for(const field of ['reserveStatus','mixedEditionOccupancy','unresolvedCurrentOrbit']){const x=clone(c);x[field]=field==='unresolvedCurrentOrbit'?true:'unresolved';test(m.iounOrbitAvailability(s,x).qualifiedIds,[]);test(m.catchIounStone(s,'io-1',x,{actualUtilizeActionCompleted:true}).ok);}
for(const field of ['present','allocatedAttunement']){const x=clone(c);x.sources[0][field]=false;test(m.iounOrbitAvailability(s,x).qualifiedIds,[]);test(m.iounOrbitAvailability(s,x).sourceLossIds,['io-1']);const settled=m.settleIounSourceLoss(s,['io-1'],x);test(settled.ok);test(m.iounOrbitAvailability(settled.state,c).qualifiedIds,['io-2']);}
for(const bad of [undefined,null,{},false,{actualMagicActionCompleted:false},{actualMagicActionCompleted:true,extra:1}])test(m.tossIounStone(s,'io-4',c,bad).ok,false);
for(const bad of [null,{}, {v:2}, {...s,unknown:undefined},{...s,nextPhysical:0},{...s,stones:[...s.stones,s.stones[0]]}])test(m.iounOrbitProblems(bad).length>0);
for(const mutate of [x=>x.sources[0].sourceFingerprint='fake',x=>x.sources[0].profile='constructor',x=>x.sources.push(x.sources[0]),x=>x.unknown=undefined,x=>x.edition='2014',x=>x.sources[0].allocatedAttunement=1]){const x=clone(c);mutate(x);test(m.iounOrbitAvailability(s,x).ok,false);}
const before=JSON.stringify(s);m.catchIounStone(s,'io-1',c,{actualUtilizeActionCompleted:true});test(JSON.stringify(s),before);
for(const p of Object.keys(IOUN_PROFILES)){const a=m.admitIounStone(m.createIounOrbit(),p,origin(p),{actualCurrentlyStowedVerified:true});test(a.ok);test(a.state.stones[0].orbiting,false);const o={kind:'generic-factual-selection',parentFingerprint:IOUN_GENERIC_FINGERPRINT,childFingerprint:IOUN_PROFILES[p].fingerprint};test(m.admitIounStone(m.createIounOrbit(),p,o,{actualCurrentlyStowedVerified:true}).ok);o.parentFingerprint='fake';test(m.admitIounStone(m.createIounOrbit(),p,o,{actualCurrentlyStowedVerified:true}).ok,false);}
test(m.admitIounStone(s,'dmg2024-ioun-reserve',{}).ok,false);test(m.admitIounStone(s,'constructor',{}).ok,false);
const missing=clone(c);missing.sources=missing.sources.slice(1);test(m.iounOrbitAvailability(s,missing).sourceLossIds,[]);test(m.iounOrbitAvailability(s,missing).review.includes('unresolved-source-binding'));test(m.settleIounSourceLoss(s,['io-1'],missing).ok,false);
const hidden=clone(s);Object.defineProperty(hidden.stones,'future',{value:undefined});test(m.iounOrbitProblems(hidden).length>0);
for(const facts of [undefined,null,{}, {actualCurrentlyStowedVerified:false},{actualCurrentlyStowedVerified:true,extra:1}])test(m.admitIounStone(s,'dmg2024-ioun-agility',origin('dmg2024-ioun-agility'),facts).reason,'actual-stowed-review-required');
console.log(count+' Ioun orbit pure checks PASS');
