import { IOUN_PROFILES, IOUN_GENERIC_FINGERPRINT } from './ioun-orbit-profiles.js';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const keys=(o,list)=>object(o)&&Reflect.ownKeys(o).length===list.length&&list.every(k=>own(o,k));
const dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&a.every((_,i)=>own(a,i));
const copy=s=>JSON.parse(JSON.stringify(s));
const fail=reason=>({ok:false,reason});
const profile=p=>typeof p==='string'&&own(IOUN_PROFILES,p)?IOUN_PROFILES[p]:null;
export const createIounOrbit=()=>({v:1,nextPhysical:1,stones:[]});
function validOrigin(o,p){
 if(!keys(o,['kind','parentFingerprint','childFingerprint']))return false;
 if(o.childFingerprint!==p.fingerprint)return false;
 if(o.kind==='native-child')return o.parentFingerprint===null;
 return o.kind==='generic-factual-selection'&&o.parentFingerprint===IOUN_GENERIC_FINGERPRINT;
}
export function iounOrbitProblems(s){
 if(!keys(s,['v','nextPhysical','stones'])||s.v!==1)return ['unsupported-state'];
 if(!Number.isSafeInteger(s.nextPhysical)||s.nextPhysical<1||!dense(s.stones))return ['invalid-state'];
 const ids=new Set();
 for(const r of s.stones){
  if(!keys(r,['id','profile','origin','orbiting']))return ['invalid-stone'];
  const p=profile(r.profile),n=typeof r.id==='string'&&/^io-[1-9][0-9]*$/.test(r.id)?Number(r.id.slice(3)):NaN;
  if(!p||!Number.isSafeInteger(n)||n>=s.nextPhysical||ids.has(r.id))return ['invalid-identity'];
  if(typeof r.orbiting!=='boolean'||!validOrigin(r.origin,p))return ['invalid-provenance'];
  ids.add(r.id);
 }
 return [];
}
function validContext(c){
 if(!keys(c,['edition','sources','unresolvedCurrentOrbit','reserveStatus','mixedEditionOccupancy']))return false;
 if(c.edition!=='2024'||!dense(c.sources)||typeof c.unresolvedCurrentOrbit!=='boolean')return false;
 if(!['none','unresolved'].includes(c.reserveStatus)||!['none','unresolved'].includes(c.mixedEditionOccupancy))return false;
 const ids=new Set();
 return c.sources.every(r=>{
  if(!keys(r,['id','profile','sourceFingerprint','present','allocatedAttunement']))return false;
  const p=profile(r.profile);
  if(!p||typeof r.id!=='string'||ids.has(r.id)||r.sourceFingerprint!==p.fingerprint)return false;
  ids.add(r.id);return typeof r.present==='boolean'&&typeof r.allocatedAttunement==='boolean';
 });
}
function witness(s,c){
 if(iounOrbitProblems(s).length)return fail('unsupported-state');
 if(!validContext(c))return fail('invalid-source-witness');
 const source=new Map(c.sources.map(r=>[r.id,r]));
 if(c.sources.some(r=>!s.stones.some(x=>x.id===r.id&&x.profile===r.profile)))return fail('unbound-source');
 const matching=r=>{const x=source.get(r.id);return x&&x.profile===r.profile?x:null;};
 const active=r=>{const x=matching(r);return !!x&&x.present&&x.allocatedAttunement;};
 return {ok:true,source,matching,active};
}
export function admitIounStone(s,p,origin,facts){
 if(iounOrbitProblems(s).length)return fail('unsupported-state');
 if(!keys(facts,['actualCurrentlyStowedVerified'])||facts.actualCurrentlyStowedVerified!==true)return fail('actual-stowed-review-required');
 const info=profile(p);
 if(!info||!validOrigin(origin,info))return fail('unverified-profile');
 if(s.nextPhysical===Number.MAX_SAFE_INTEGER)return fail('identity-overflow');
 const next=copy(s),id='io-'+next.nextPhysical++;
 next.stones.push({id,profile:p,origin:copy(origin),orbiting:false});
 return {ok:true,state:next,id};
}
export function iounOrbitAvailability(s,c){
 const w=witness(s,c);if(!w.ok)return w;
 const review=[];
 if(c.unresolvedCurrentOrbit)review.push('unresolved-current-orbit');
 if(c.reserveStatus==='unresolved')review.push('unresolved-current-reserve');
 if(c.mixedEditionOccupancy==='unresolved')review.push('unresolved-mixed-edition');
 const missing=s.stones.filter(r=>r.orbiting&&!w.matching(r));
 if(missing.length)review.push('unresolved-source-binding');
 const lost=s.stones.filter(r=>r.orbiting&&w.matching(r)&&!w.active(r)).map(r=>r.id);
 if(lost.length)review.push('source-loss-reconciliation-required');
 const occupied=s.stones.filter(r=>r.orbiting&&w.active(r));
 if(occupied.length>3)review.push('over-capacity');
 return {ok:true,qualifiedIds:review.length?[]:occupied.filter(r=>profile(r.profile).passive).map(r=>r.id),occupiedIds:occupied.map(r=>r.id),review,sourceLossIds:lost};
}
function changeOrbit(s,id,c,facts,action,value){
 const w=witness(s,c);if(!w.ok)return w;
 if(!keys(facts,[action])||facts[action]!==true)return fail('actual-action-required');
 const r=s.stones.find(x=>x.id===id);if(!r)return fail('unknown-stone');
 if(r.orbiting===value)return fail(value?'already-orbiting':'already-stowed');
 if(!w.matching(r))return fail('unbound-source');
 if(value){
  if(!w.active(r))return fail('actual-source-and-attunement-required');
  const a=iounOrbitAvailability(s,c);
  if(a.review.length)return fail(a.review[0]);
  if(a.occupiedIds.length>=3)return fail('orbit-capacity');
 }
 const next=copy(s);next.stones.find(x=>x.id===id).orbiting=value;
 return {ok:true,state:next,id};
}
export const tossIounStone=(s,id,c,f)=>changeOrbit(s,id,c,f,'actualMagicActionCompleted',true);
export const catchIounStone=(s,id,c,f)=>changeOrbit(s,id,c,f,'actualUtilizeActionCompleted',false);
export function settleIounSourceLoss(s,ids,c){
 const w=witness(s,c);if(!w.ok)return w;
 if(!dense(ids)||!ids.length||new Set(ids).size!==ids.length)return fail('invalid-selection');
 for(const id of ids){
  const r=s.stones.find(x=>x.id===id);
  if(!r||!r.orbiting||!w.matching(r)||w.active(r))return fail('source-loss-not-proven');
 }
 const next=copy(s);next.stones.forEach(r=>{if(ids.includes(r.id))r.orbiting=false;});
 return {ok:true,state:next,settled:[...ids]};
}
export function iounPassiveProfiles(s,c){
 const a=iounOrbitAvailability(s,c);if(!a.ok)return a;
 return {ok:true,profiles:s.stones.filter(r=>a.qualifiedIds.includes(r.id)).map(r=>({id:r.id,profile:r.profile})),review:a.review};
}
