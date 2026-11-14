import assert from 'node:assert/strict';
import {BRACERS_PROFILES} from '../src/data/lib/bracers-profiles.js';
import {carriedShieldState,bracersDefenseEligibility,bracersNativeProfile} from '../src/data/lib/bracers.js';
let checks=0;const eq=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
const classify=row=>row.nativeBase==='Shield'?true:row.nativeBase==='Unknown'?null:false;
const facts={sourceWorn:true,sourceAttuned:true,armorWorn:false};
const eligible=rows=>bracersDefenseEligibility(facts,rows,classify);
eq(eligible([]).eligible,true);
for(const eqFlag of [true,false,undefined])for(const q of [1,2,.5,'1',undefined]){
 const row={n:'Verified magic Shield',nativeBase:'Shield',q,eq:eqFlag};
 eq(eligible([row]).eligible,false);eq(eligible([row]).reason,'shield-carried');
}
for(const q of [0,'0',-1])eq(eligible([{nativeBase:'Shield',q}]).eligible,true);
eq(eligible([{n:'Not really a Shield',nativeBase:'Trinket',q:1}]).eligible,true);
eq(eligible([{n:'Magic Shield form',nativeBase:'Shield',q:1}]).eligible,false);
eq(eligible([{nativeBase:'Unknown',q:1}]).ok,false);
eq(eligible([{nativeBase:'Unknown',q:0}]).eligible,true);
for(const k of Object.keys(facts)){
 const f={...facts,[k]:!facts[k]};eq(bracersDefenseEligibility(f,[],classify).eligible,false);
 for(const v of [undefined,null,0,1,'true'])eq(bracersDefenseEligibility({...facts,[k]:v},[],classify).ok,false);
}
for(const rows of [null,{},[null],Array(1),[{q:Infinity}],[{q:'Infinity'}]])eq(eligible(rows).ok,false);
const future=[];Object.defineProperty(future,'future',{value:undefined});eq(eligible(future).ok,false);
eq(bracersDefenseEligibility({...facts,future:undefined},[],classify).ok,false);
for(const value of [null,undefined,0,1,'Shield',{}])eq(carriedShieldState([{q:1}],()=>value).ok,false);
let called=0;eq(carriedShieldState([{q:0}],()=>{called++;return null}).carried,false);eq(called,0);
const source=[{q:1,eq:false,nativeBase:'Shield',future:{v:9}}],before=structuredClone(source);eligible(source);eq(source,before);
for(const [name,profile] of Object.entries(BRACERS_PROFILES)){
 const row=JSON.parse(profile.fingerprint);eq(bracersNativeProfile([row],name)?.kind,profile.kind);eq(bracersNativeProfile([row,row],name),null);eq(bracersNativeProfile([],name),null);
 for(const i of [1,2,3,4]){const changed=structuredClone(row);changed[i]=i===3?0:'edited';eq(bracersNativeProfile([changed],name),null);}
 const opaque=structuredClone(row);Object.defineProperty(opaque,'future',{value:undefined});eq(bracersNativeProfile([opaque],name),null);
}
eq(bracersNativeProfile([],'constructor'),null);eq(bracersNativeProfile([], 'Bracers of Defense (2014)'),null);
eq(carriedShieldState([{q:1}],()=>{throw new Error('Missing metadata')}).ok,false);
console.log(checks+' carried Shield / passive source condition checks PASS');
