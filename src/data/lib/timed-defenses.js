/* Physical Armor/Potion sources and retained timed defensive effects.
   Native S.used is the armor's sole budget; host commits source inventory atomically. */
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)),integer=v=>Number.isSafeInteger(v)&&v>=0,clone=structuredClone,fail=reason=>({ok:false,reason}),text=v=>typeof v==='string'&&!!v&&v.trim()===v;
export const RESISTANCE_POTION_TYPES=Object.freeze(['Acid','Cold','Fire','Force','Lightning','Necrotic','Poison','Psychic','Radiant','Thunder']);
const BPS=['Bludgeoning','Piercing','Slashing'];
export function createTimedDefenses(){return {v:1,nextPhysical:1,nextEffect:1,physical:[],effects:[],dawnEvents:[]};}
function idNumber(id,prefix){if(typeof id!=='string'||!new RegExp('^'+prefix+'[1-9]\\d*$').test(id))return null;const n=Number(id.slice(prefix.length));return Number.isSafeInteger(n)?n:null;}
function armor(p){return p?.kind==='armor-invulnerability';}function potion(p){return p?.kind==='potion-resistance';}
function physicalValid(p,next){
 if(!obj(p)||idNumber(p.id,'tdp-')===null||idNumber(p.id,'tdp-')>=next||typeof p.present!=='boolean')return false;
 if(armor(p))return exact(p,['id','kind','key','present','wearing','historyKnown'])&&text(p.key)&&[null,true,false].includes(p.wearing)&&typeof p.historyKnown==='boolean'&&(p.present||p.wearing!==true);
 return potion(p)&&exact(p,['id','kind','present','availability','damageType'])&&[null,true,false].includes(p.availability)&&(p.damageType===null||RESISTANCE_POTION_TYPES.includes(p.damageType))&&(p.availability!==false||!p.present);
}
function effectValid(e,s){
 if(!exact(e,['id','physicalId','kind','active','endReason'])||idNumber(e.id,'tde-')===null||idNumber(e.id,'tde-')>=s.nextEffect||typeof e.active!=='boolean')return false;const p=s.physical.find(p=>p.id===e.physicalId);if(!p)return false;
 if(e.kind==='armor-immunity'){if(!armor(p)||!p.historyKnown)return false;return e.active?e.endReason===null&&p.present&&p.wearing===true:['ten-minutes','wear-loss','replaced'].includes(e.endReason);}
 if(e.kind!=='potion-resistance'||!potion(p)||p.availability!==false||p.damageType===null)return false;return e.active?e.endReason===null:e.endReason==='one-hour';
}
export function timedDefensesProblems(s){
 if(!exact(s,['v','nextPhysical','nextEffect','physical','effects','dawnEvents'])||s.v!==1||!integer(s.nextPhysical)||s.nextPhysical<1||!integer(s.nextEffect)||s.nextEffect<1||!dense(s.physical)||!dense(s.effects)||!dense(s.dawnEvents))return ['unsupported-state'];
 if(!s.physical.every(p=>physicalValid(p,s.nextPhysical))||new Set(s.physical.map(p=>p.id)).size!==s.physical.length)return ['invalid-physical'];
 const keys=s.physical.filter(armor).map(p=>p.key);if(new Set(keys).size!==keys.length)return ['duplicate-armor-budget'];
 if(!s.effects.every(e=>effectValid(e,s))||new Set(s.effects.map(e=>e.id)).size!==s.effects.length)return ['invalid-effect'];
 for(const p of s.physical){const effects=s.effects.filter(e=>e.physicalId===p.id);if(potion(p)&&effects.length>1||armor(p)&&effects.filter(e=>e.active).length>1)return ['duplicate-source-effect'];}
 return s.dawnEvents.every(text)&&new Set(s.dawnEvents).size===s.dawnEvents.length?[]:['invalid-dawn-events'];
}
const budgetValid=(b,key)=>exact(b,['key','used','max'])&&b.key===key&&b.max===1&&integer(b.used)&&b.used<=1;
function addPhysical(s,physical){if(s.nextPhysical===Number.MAX_SAFE_INTEGER)return fail('physical-identity-exhausted');const state=clone(s),id='tdp-'+state.nextPhysical++;state.physical.push({id,...physical});return {ok:true,state,id};}
export function adoptTimedArmor(s,key,budget,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');if(!text(key)||!budgetValid(budget,key)||!exact(facts,['actualPhysicalIdentityVerified'])||facts.actualPhysicalIdentityVerified!==true)return fail('actual-physical-armor-required');if(s.physical.some(p=>armor(p)&&p.key===key))return fail('armor-budget-already-bound');return addPhysical(s,{kind:'armor-invulnerability',key,present:true,wearing:null,historyKnown:budget.used===1});
}
export function reviewTimedArmorHistory(s,id,budget,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);
 if(!armor(p)||p.historyKnown||!budgetValid(budget,p.key)||!exact(facts,['actualDawnUseHistoryVerified','used'])||facts.actualDawnUseHistoryVerified!==true||!integer(facts.used)||facts.used>1)return fail('actual-unknown-armor-history-required');const state=clone(s);state.physical.find(p=>p.id===id).historyKnown=true;return {ok:true,state,budget:{key:p.key,used:facts.used,max:1}};
}
function endArmorEffects(state,id,reason){for(const effect of state.effects)if(effect.physicalId===id&&effect.kind==='armor-immunity'&&effect.active){effect.active=false;effect.endReason=reason;}}
export function setTimedArmorWearing(s,id,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);
 if(!armor(p)||!exact(facts,['actualWearingStateVerified','wearing'])||facts.actualWearingStateVerified!==true||typeof facts.wearing!=='boolean'||facts.wearing&&!p.present)return fail('actual-armor-wearing-state-required');if(p.wearing===facts.wearing)return fail('no-change');const state=clone(s);state.physical.find(p=>p.id===id).wearing=facts.wearing;if(!facts.wearing)endArmorEffects(state,id,'wear-loss');return {ok:true,state};
}
export function reconcileTimedArmorWearing(s,wearingIds){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');if(!dense(wearingIds)||new Set(wearingIds).size!==wearingIds.length||!wearingIds.every(id=>s.physical.some(p=>p.id===id&&armor(p))))return fail('actual-canonical-armor-wearing-required');
 const authority=clone(s);let changed=false;for(const p of authority.physical.filter(armor)){const wearing=p.present&&wearingIds.includes(p.id);if(p.wearing!==wearing){p.wearing=wearing;changed=true;}if(!wearing&&authority.effects.some(e=>e.physicalId===p.id&&e.active)){endArmorEffects(authority,p.id,'wear-loss');changed=true;}}return {ok:true,changed,authority};
}
function addEffect(state,physicalId,kind){const effectId='tde-'+state.nextEffect++;state.effects.push({id:effectId,physicalId,kind,active:true,endReason:null});return effectId;}
export function planTimedArmorActivation(s,id,budget,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);
 if(!armor(p)||!p.present||p.wearing!==true||!p.historyKnown||!budgetValid(budget,p.key)||budget.used!==0)return fail('qualified-worn-ready-armor-required');
 if(!exact(facts,['actualMagicActionCompleted','actualAllocatedAttunementVerified'])||facts.actualMagicActionCompleted!==true||facts.actualAllocatedAttunementVerified!==true)return fail('actual-attuned-armor-activation-required');if(s.nextEffect===Number.MAX_SAFE_INTEGER)return fail('effect-identity-exhausted');
 const state=clone(s);endArmorEffects(state,id,'replaced');const effectId=addEffect(state,id,'armor-immunity');return {ok:true,state,effectId,budget:{key:p.key,used:1,max:1}};
}
function expireEffect(s,id,kind,facts,key,reason){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const effect=s.effects.find(e=>e.id===id);if(!effect||effect.kind!==kind||!effect.active||!exact(facts,[key])||facts[key]!==true)return fail('actual-active-effect-expiry-required');const state=clone(s),next=state.effects.find(e=>e.id===id);next.active=false;next.endReason=reason;return {ok:true,state};
}
export function recordTimedArmorExpiry(s,id,facts){return expireEffect(s,id,'armor-immunity',facts,'actualTenMinutesSinceActivationPassed','ten-minutes');}
export function recordTimedDefenseDawn(s,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');if(!exact(facts,['actualNextDawnOccurred','eventId'])||facts.actualNextDawnOccurred!==true||!text(facts.eventId)||s.dawnEvents.includes(facts.eventId))return fail('actual-new-dawn-required');const state=clone(s);state.dawnEvents.push(facts.eventId);const budgets=[];for(const p of state.physical.filter(armor)){p.historyKnown=true;budgets.push({key:p.key,used:0,max:1});}return {ok:true,state,budgets};
}
export function adoptResistancePotion(s,facts){if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');if(!exact(facts,['actualPhysicalIdentityVerified'])||facts.actualPhysicalIdentityVerified!==true)return fail('actual-physical-potion-required');return addPhysical(s,{kind:'potion-resistance',present:true,availability:null,damageType:null});}
export function reviewResistancePotionAvailability(s,id,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);if(!potion(p)||p.availability!==null||!exact(facts,['actualPhysicalAvailabilityVerified','available'])||facts.actualPhysicalAvailabilityVerified!==true||typeof facts.available!=='boolean')return fail('actual-unknown-potion-history-required');const state=clone(s),next=state.physical.find(p=>p.id===id);next.availability=facts.available;if(!facts.available)next.present=false;return {ok:true,state};
}
export function selectResistancePotionType(s,id,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);if(!potion(p)||!p.present||p.availability!==true||p.damageType!==null)return fail('unused-untyped-potion-required');
 let type=null;if(exact(facts,['actualDamageTypeVerified','damageType'])&&facts.actualDamageTypeVerified===true&&RESISTANCE_POTION_TYPES.includes(facts.damageType))type=facts.damageType;
 if(exact(facts,['actualD10Rolled','die'])&&facts.actualD10Rolled===true&&integer(facts.die)&&facts.die>=1&&facts.die<=10)type=RESISTANCE_POTION_TYPES[facts.die-1];if(!type)return fail('actual-known-potion-type-required');const state=clone(s);state.physical.find(p=>p.id===id).damageType=type;return {ok:true,state};
}
export function planResistancePotionConsumption(s,id,facts){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);if(!potion(p)||!p.present||p.availability!==true||p.damageType===null)return fail('known-unused-resistance-potion-required');if(!exact(facts,['actualPotionDrunk'])||facts.actualPotionDrunk!==true)return fail('actual-potion-consumption-required');if(s.nextEffect===Number.MAX_SAFE_INTEGER)return fail('effect-identity-exhausted');const state=clone(s),next=state.physical.find(p=>p.id===id);next.availability=false;next.present=false;return {ok:true,state,effectId:addEffect(state,id,'potion-resistance')};
}
export function recordResistancePotionExpiry(s,id,facts){return expireEffect(s,id,'potion-resistance',facts,'actualOneHourSinceConsumptionPassed','one-hour');}
export function setTimedDefensePresence(s,id,present,facts={}){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');const p=s.physical.find(p=>p.id===id);if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');if(present&&(potion(p)&&p.availability===false||!exact(facts,['actualPhysicalCopyReturned'])||facts.actualPhysicalCopyReturned!==true))return fail('actual-unconsumed-source-return-required');const state=clone(s),next=state.physical.find(p=>p.id===id);next.present=present;if(armor(next)&&!present){next.wearing=false;endArmorEffects(state,id,'wear-loss');}return {ok:true,state};
}
export function timedDefenseCapabilities(s,qualifiedArmorIds=[]){
 if(timedDefensesProblems(s).length)return fail('unsupported-timed-defense-history');if(!dense(qualifiedArmorIds)||new Set(qualifiedArmorIds).size!==qualifiedArmorIds.length||!qualifiedArmorIds.every(id=>s.physical.some(p=>armor(p)&&p.id===id)))return fail('canonical-qualified-armor-required');const rows=[];
 for(const p of s.physical){if(armor(p)&&p.present&&p.wearing===true&&qualifiedArmorIds.includes(p.id)){for(const type of BPS)rows.push({t:'Resistance',v:type,s:'Armor of Invulnerability',sourceId:p.id});const effect=s.effects.find(e=>e.physicalId===p.id&&e.active);if(effect)for(const type of BPS)rows.push({t:'Immunity',v:type,s:'Armor of Invulnerability: Metal Shell',sourceId:p.id,effectId:effect.id});}
 if(potion(p)){const effect=s.effects.find(e=>e.physicalId===p.id&&e.active);if(effect)rows.push({t:'Resistance',v:p.damageType,s:'Potion of Resistance',sourceId:p.id,effectId:effect.id});}}return {ok:true,rows};
}
