import {ROD_ABSORPTION_PROFILE as PROFILE,ROD_ABSORPTION_FINGERPRINT as FINGERPRINT} from './rod-absorption-profile.js';
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const exact=(o,ks)=>obj(o)&&Reflect.ownKeys(o).length===ks.length&&ks.every(k=>own(o,k));
const dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&a.every((_,i)=>own(a,i));
const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const text=s=>typeof s==='string'&&s.length>0&&s.trim()===s;
const copy=structuredClone,fail=reason=>({ok:false,reason});
const idNumber=(id,prefix)=>typeof id==='string'&&new RegExp('^'+prefix+'[1-9][0-9]*$').test(id)?Number(id.slice(prefix.length)):NaN;
export const createRodAbsorption=()=>({v:1,nextPhysical:1,nextReceipt:1,rods:[],receipts:[]});
function reviewValid(r){
 if(!exact(r,['totalAbsorbed','stored','foundRoll']))return false;
 if(!integer(r.totalAbsorbed,0,50)||!integer(r.stored,0,r.totalAbsorbed))return false;
 return r.foundRoll===null||integer(r.foundRoll,1,10)&&r.stored===r.foundRoll;
}
function rodValid(r,next){
 if(!exact(r,['id','profile','fingerprint','review','totalAbsorbed','stored','nonmagical']))return false;
 if(!integer(idNumber(r.id,'ra-'),1,next-1)||r.profile!==PROFILE||r.fingerprint!==FINGERPRINT)return false;
 if(r.review===null)return r.totalAbsorbed===null&&r.stored===null&&r.nonmagical===false;
 return reviewValid(r.review)&&integer(r.totalAbsorbed,0,50)&&integer(r.stored,0,r.totalAbsorbed)&&r.nonmagical===(r.totalAbsorbed===50&&r.stored===0);
}
function receiptValid(r,next){
 if(!exact(r,['id','kind','rodId','level','spell']))return false;
 if(!integer(idNumber(r.id,'rae-'),1,next-1)||!text(r.rodId))return false;
 if(r.kind==='absorb')return integer(r.level,0,9)&&r.spell===null;
 return r.kind==='cast'&&integer(r.level,1,5)&&spellValid(r.spell)&&r.spell.baseLevel<=r.level;
}
function spellValid(s){return exact(s,['key','name','baseLevel','definitionFingerprint'])&&text(s.key)&&text(s.name)&&integer(s.baseLevel,1,9)&&text(s.definitionFingerprint);}
function replay(s,rod){
 if(rod.review===null)return !s.receipts.some(r=>r.rodId===rod.id);
 let total=rod.review.totalAbsorbed,stored=rod.review.stored;
 for(const r of s.receipts.filter(r=>r.rodId===rod.id)){
  if(total===50&&stored===0)return false;
  if(r.kind==='absorb'){
   if(total===50||total+r.level>50)return false;
   total+=r.level;stored+=r.level;
  }else{
   if(r.level>stored)return false;stored-=r.level;
  }
 }
 return total===rod.totalAbsorbed&&stored===rod.stored;
}
export function rodAbsorptionProblems(s){
 if(!exact(s,['v','nextPhysical','nextReceipt','rods','receipts'])||s.v!==1)return ['unsupported-state'];
 if(!integer(s.nextPhysical,1,Number.MAX_SAFE_INTEGER)||!integer(s.nextReceipt,1,Number.MAX_SAFE_INTEGER)||!dense(s.rods)||!dense(s.receipts))return ['invalid-state'];
 if(!s.rods.every(r=>rodValid(r,s.nextPhysical))||!s.receipts.every(r=>receiptValid(r,s.nextReceipt)))return ['invalid-record'];
 if(s.nextPhysical!==s.rods.length+1||s.nextReceipt!==s.receipts.length+1)return ['missing-history'];
 if(!s.rods.every((r,i)=>r.id==='ra-'+(i+1))||!s.receipts.every((r,i)=>r.id==='rae-'+(i+1)))return ['invalid-history-order'];
 if(s.receipts.some(r=>!s.rods.some(rod=>rod.id===r.rodId))||!s.rods.every(r=>replay(s,r)))return ['energy-history-mismatch'];
 return [];
}
function current(s,id){
 if(rodAbsorptionProblems(s).length)return fail('unsupported-rod-history');
 const rod=s.rods.find(r=>r.id===id);return rod?{ok:true,rod}:fail('unknown-physical-rod');
}
export function admitRodAbsorption(s,proof){
 if(rodAbsorptionProblems(s).length)return fail('unsupported-rod-history');
 if(!exact(proof,['nativeFingerprint','actualPhysicalIdentityVerified'])||proof.nativeFingerprint!==FINGERPRINT||proof.actualPhysicalIdentityVerified!==true)return fail('actual-original-physical-source-required');
 if(s.nextPhysical===Number.MAX_SAFE_INTEGER)return fail('identity-overflow');
 const next=copy(s),id='ra-'+next.nextPhysical++;
 next.rods.push({id,profile:PROFILE,fingerprint:FINGERPRINT,review:null,totalAbsorbed:null,stored:null,nonmagical:false});
 return {ok:true,state:next,id};
}
export function reviewRodAbsorption(s,id,values,facts){
 const c=current(s,id);if(!c.ok||!('rod' in c))return c;
 if(c.rod.review!==null)return fail('energy-history-already-reviewed');
 if(!reviewValid(values))return fail('actual-total-and-stored-counts-required');
 if(!exact(facts,['actualAttunementCountReview','actualFoundRollVerified'])||facts.actualAttunementCountReview!==true||facts.actualFoundRollVerified!==(values.foundRoll!==null))return fail('actual-attunement-review-required');
 const next=copy(s),rod=next.rods.find(r=>r.id===id);rod.review=copy(values);rod.totalAbsorbed=values.totalAbsorbed;rod.stored=values.stored;rod.nonmagical=rod.totalAbsorbed===50&&rod.stored===0;
 return {ok:true,state:next};
}
function held(facts){return facts?.actualHolding===true&&facts.actualAllocatedAttunement===true;}
function ready(s,id,facts){
 const c=current(s,id);if(!c.ok||!('rod' in c))return c;
 if(c.rod.review===null)return fail('actual-energy-history-review-required');
 if(c.rod.nonmagical)return fail('rod-permanently-nonmagical');
 return held(facts)?c:fail('actual-held-attuned-source-required');
}
function receipt(s,id,kind,level,spell){
 if(s.nextReceipt===Number.MAX_SAFE_INTEGER)return fail('receipt-overflow');
 const next=copy(s),rod=next.rods.find(r=>r.id===id),event={id:'rae-'+next.nextReceipt++,kind,rodId:id,level,spell:spell?copy(spell):null};
 if(kind==='absorb'){rod.totalAbsorbed+=level;rod.stored+=level;}else rod.stored-=level;
 rod.nonmagical=rod.totalAbsorbed===50&&rod.stored===0;next.receipts.push(event);
 return {ok:true,state:next,receipt:copy(event)};
}
export function absorbRodSpell(s,id,level,facts){
 const c=ready(s,id,facts);if(!c.ok||!('rod' in c))return c;
 const keys=['actualHolding','actualAllocatedAttunement','actualReactionCompleted','targetsOnlyActor','producesAreaOfEffect','actualCastLevelVerified'];
 if(!exact(facts,keys)||facts.actualReactionCompleted!==true||facts.targetsOnlyActor!==true||facts.producesAreaOfEffect!==false||facts.actualCastLevelVerified!==true)return fail('actual-qualifying-reaction-required');
 if(!integer(level,0,9))return fail('actual-spell-cast-level-required');
 if(c.rod.totalAbsorbed===50||level>50-c.rod.totalAbsorbed)return {...fail('spell-unaffected-capacity'),spellUnaffected:true};
 return receipt(s,id,'absorb',level,null);
}
function castingValid(c){
 if(!exact(c,['actualHolding','actualAllocatedAttunement','actorIsSpellcaster','maximumSlotLevel','knownPreparedSpells']))return false;
 if(!held(c)||c.actorIsSpellcaster!==true||!integer(c.maximumSlotLevel,0,9)||!dense(c.knownPreparedSpells))return false;
 return c.knownPreparedSpells.every(spellValid)&&new Set(c.knownPreparedSpells.map(s=>s.key)).size===c.knownPreparedSpells.length;
}
export function spendRodEnergy(s,id,request,casting,facts){
 const c=ready(s,id,casting);if(!c.ok||!('rod' in c))return c;
 if(!castingValid(casting))return fail('actual-native-casting-source-required');
 if(!exact(request,['spellKey','castLevel'])||!integer(request.castLevel,1,Math.min(5,casting.maximumSlotLevel)))return fail('actual-permitted-slot-level-required');
 const spell=casting.knownPreparedSpells.find(v=>v.key===request.spellKey);
 if(!spell||spell.baseLevel>request.castLevel)return fail('actual-known-prepared-canonical-spell-required');
 if(!exact(facts,['actualNormalCastingCompleted'])||facts.actualNormalCastingCompleted!==true)return fail('actual-normal-casting-required');
 if(request.castLevel>c.rod.stored)return fail('insufficient-stored-energy');
 return receipt(s,id,'cast',request.castLevel,spell);
}
