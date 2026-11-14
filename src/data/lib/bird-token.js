/* Quaal's Bird token: one consumed physical token and one retained transport.
   Host certifies native source/inventory ownership and commits physical consumption. */
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)),integer=v=>Number.isSafeInteger(v)&&v>=0,clone=structuredClone,fail=reason=>({ok:false,reason});
export const BIRD_TOKEN_LIMITS=Object.freeze({distanceUnitsPerMile:79200,distanceUnitsPerFoot:15,maximumDistanceUnits:11404800,fullSpeedMph:16,halfSpeedMph:8,fullSpeedUnitsPerSecond:352,halfSpeedUnitsPerSecond:176,fullSpeedLoadOunces:8000,maximumLoadOunces:16000,flightSecondsBeforeRest:10800,restSeconds:3600});
export function canonicalBirdTokenDefinition(value){if(Array.isArray(value))return '['+value.map(canonicalBirdTokenDefinition).join(',')+']';if(obj(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalBirdTokenDefinition(value[k])).join(',')+'}';return JSON.stringify(value);}
export function createBirdToken(){return {v:1,nextPhysical:1,nextBird:1,physical:[],birds:[]};}
function idNumber(id,prefix){if(typeof id!=='string'||!new RegExp('^'+prefix+'[1-9]\\d*$').test(id))return null;const n=Number(id.slice(prefix.length));return Number.isSafeInteger(n)?n:null;}
function physicalValid(p,next){return exact(p,['id','profile','present','availability'])&&idNumber(p.id,'qbtp-')!==null&&idNumber(p.id,'qbtp-')<next&&p.profile==='dmg2024-bird'&&typeof p.present==='boolean'&&[null,true,false].includes(p.availability)&&(p.availability!==false||!p.present);}
function creatureValid(r){
 if(!exact(r,['logicalName','nativeName','source','maxHP','definitionFingerprint','definition'])||r.logicalName!=='Roc'||r.nativeName!=='Roc'||r.source!=='core'||r.maxHP!==248||!obj(r.definition))return false;
 if(r.definition.n!=='Roc'||r.definition.s!=='core'||canonicalBirdTokenDefinition(r.definition)!==r.definitionFingerprint)return false;
 const hp=Array.isArray(r.definition.tl)?r.definition.tl.filter(row=>Array.isArray(row)&&row[0]==='HP'):[];return hp.length===1&&typeof hp[0][1]==='string'&&/^248(?:\s*\([^\n]*\))?$/.test(hp[0][1]);
}
function birdValid(b,state){
 if(!exact(b,['id','physicalId','creature','hp','active','endReason','loadOunces','flightSecondsSinceRest','distanceUnits'])||idNumber(b.id,'qbb-')===null||idNumber(b.id,'qbb-')>=state.nextBird||!creatureValid(b.creature))return false;
 const physical=state.physical.find(p=>p.id===b.physicalId);if(!physical||physical.availability!==false||physical.present)return false;
 if(!integer(b.hp)||b.hp>248||typeof b.active!=='boolean'||!integer(b.loadOunces)||!integer(b.flightSecondsSinceRest)||b.flightSecondsSinceRest>10800||!integer(b.distanceUnits)||b.distanceUnits>11404800)return false;
 if(b.active)return b.hp>0&&b.distanceUnits<11404800&&b.endReason===null;
 if(b.endReason==='zero-hp')return b.hp===0&&b.distanceUnits<11404800;
 if(b.endReason==='distance')return b.hp>0&&b.distanceUnits===11404800;
 return b.endReason==='dismissed'&&b.hp>0&&b.distanceUnits<11404800;
}
export function birdTokenProblems(s){
 if(!exact(s,['v','nextPhysical','nextBird','physical','birds'])||s.v!==1||!integer(s.nextPhysical)||s.nextPhysical<1||!integer(s.nextBird)||s.nextBird<1||!dense(s.physical)||!dense(s.birds))return ['unsupported-state'];
 if(!s.physical.every(p=>physicalValid(p,s.nextPhysical))||new Set(s.physical.map(p=>p.id)).size!==s.physical.length)return ['invalid-physical'];
 if(!s.birds.every(b=>birdValid(b,s))||new Set(s.birds.map(b=>b.id)).size!==s.birds.length||new Set(s.birds.map(b=>b.physicalId)).size!==s.birds.length)return ['invalid-bird'];return [];
}
export function adoptBirdToken(s,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');if(s.nextPhysical===Number.MAX_SAFE_INTEGER)return fail('physical-identity-exhausted');if(!exact(facts,['actualPhysicalIdentityVerified'])||facts.actualPhysicalIdentityVerified!==true)return fail('actual-physical-identity-required');
 const state=clone(s),id='qbtp-'+state.nextPhysical++;state.physical.push({id,profile:'dmg2024-bird',present:true,availability:null});return {ok:true,state,id};
}
export function reviewBirdTokenAvailability(s,id,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const p=s.physical.find(p=>p.id===id);
 if(!p||p.availability!==null||!exact(facts,['actualPhysicalAvailabilityVerified','available'])||facts.actualPhysicalAvailabilityVerified!==true||typeof facts.available!=='boolean')return fail('actual-unknown-token-history-required');
 const state=clone(s),next=state.physical.find(p=>p.id===id);next.availability=facts.available;if(!facts.available)next.present=false;return {ok:true,state};
}
function activationFacts(f){return exact(f,['actualMagicActionCompleted','actualTokenThrownFiveFeetUp','actualTokenConsumed','loadOunces'])&&f.actualMagicActionCompleted===true&&f.actualTokenThrownFiveFeetUp===true&&f.actualTokenConsumed===true&&integer(f.loadOunces);}
export function planBirdTokenActivation(s,id,creature,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const p=s.physical.find(p=>p.id===id);if(!p||!p.present||p.availability!==true)return fail('unused-physical-token-required');
 if(s.nextBird===Number.MAX_SAFE_INTEGER)return fail('bird-identity-exhausted');
 if(!creatureValid(creature)||!activationFacts(facts))return fail('qualified-bird-activation-required');
 const state=clone(s),next=state.physical.find(p=>p.id===id),birdId='qbb-'+state.nextBird++;next.availability=false;next.present=false;
 state.birds.push({id:birdId,physicalId:id,creature:clone(creature),hp:248,active:true,endReason:null,loadOunces:facts.loadOunces,flightSecondsSinceRest:0,distanceUnits:0});return {ok:true,state,birdId};
}
function birdSpeed(b){return b.loadOunces<=8000?{mph:16,unitsPerSecond:352}:b.loadOunces<=16000?{mph:8,unitsPerSecond:176}:{mph:0,unitsPerSecond:0};}
export function birdTokenTransport(s,id){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id);if(!b)return fail('bird-unavailable');const speed=birdSpeed(b),restRequired=b.flightSecondsSinceRest===10800;
 return {ok:true,active:b.active,canFly:b.active&&!restRequired&&speed.mph>0,topMph:speed.mph,unitsPerSecond:speed.unitsPerSecond,loadOunces:b.loadOunces,maximumLoadOunces:16000,remainingDistanceUnits:11404800-b.distanceUnits,flightSecondsRemaining:10800-b.flightSecondsSinceRest,restRequired};
}
export function setBirdTokenLoad(s,id,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id);if(!b?.active||!exact(facts,['actualCarriedLoadVerified','loadOunces'])||facts.actualCarriedLoadVerified!==true||!integer(facts.loadOunces))return fail('actual-active-bird-load-required');if(b.loadOunces===facts.loadOunces)return fail('no-change');
 const state=clone(s);state.birds.find(b=>b.id===id).loadOunces=facts.loadOunces;return {ok:true,state};
}
export function recordBirdTokenFlight(s,id,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id),transport=birdTokenTransport(s,id);
 if(!b?.active||!transport.ok||!('canFly' in transport)||!transport.canFly)return fail('active-flight-ready-bird-required');
 if(!exact(facts,['actualFlightSegmentCompleted','seconds','distanceUnits'])||facts.actualFlightSegmentCompleted!==true||!integer(facts.seconds)||facts.seconds===0||!integer(facts.distanceUnits))return fail('actual-flight-segment-required');
 if(facts.seconds>transport.flightSecondsRemaining||facts.distanceUnits>transport.remainingDistanceUnits||facts.distanceUnits>facts.seconds*transport.unitsPerSecond)return fail('flight-segment-exceeds-remaining-limits');
 const state=clone(s),next=state.birds.find(b=>b.id===id);next.flightSecondsSinceRest+=facts.seconds;next.distanceUnits+=facts.distanceUnits;if(next.distanceUnits===11404800){next.active=false;next.endReason='distance';}return {ok:true,state};
}
export function recordBirdTokenRest(s,id,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id);
 if(!b?.active||b.flightSecondsSinceRest!==10800||!exact(facts,['actualOneHourRestCompleted'])||facts.actualOneHourRestCompleted!==true)return fail('actual-required-one-hour-rest-required');const state=clone(s);state.birds.find(b=>b.id===id).flightSecondsSinceRest=0;return {ok:true,state};
}
export function changeBirdTokenHP(s,id,kind,amount){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id);if(!b?.active||!['damage','healing'].includes(kind)||!integer(amount)||amount===0)return fail('actual-active-bird-hp-change-required');const hp=kind==='damage'?Math.max(0,b.hp-amount):Math.min(248,b.hp+Math.min(248,amount));if(hp===b.hp)return fail('no-change');
 const state=clone(s),next=state.birds.find(b=>b.id===id);next.hp=hp;if(hp===0){next.active=false;next.endReason='zero-hp';}return {ok:true,state};
}
export function dismissBirdToken(s,id,facts){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const b=s.birds.find(b=>b.id===id);if(!b?.active||!exact(facts,['actualMagicActionDismissalCompleted'])||facts.actualMagicActionDismissalCompleted!==true)return fail('actual-active-bird-dismissal-required');const state=clone(s),next=state.birds.find(b=>b.id===id);next.active=false;next.endReason='dismissed';return {ok:true,state};
}
export function setBirdTokenPresence(s,id,present,facts={}){
 if(birdTokenProblems(s).length)return fail('unsupported-bird-history');const p=s.physical.find(p=>p.id===id);if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');
 if(present&&(p.availability===false||!exact(facts,['actualPhysicalCopyReturned'])||facts.actualPhysicalCopyReturned!==true))return fail('actual-unconsumed-token-return-required');const state=clone(s);state.physical.find(p=>p.id===id).present=present;return {ok:true,state};
}
