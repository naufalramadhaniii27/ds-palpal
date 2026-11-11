// Source-owned healing and discrete recovery; existing native resource keys remain the only use pools.
import {damageExpression} from './attack-target.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const data=(x,k)=>{const d=Object.getOwnPropertyDescriptor(x,k);return !!d&&own(d,'value')};
const exact=(x,keys,optional=[])=>object(x)&&Reflect.ownKeys(x).every(k=>typeof k==='string'&&[...keys,...optional].includes(k)&&data(x,k))&&keys.every(k=>data(x,k));
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const key=x=>typeof x==='string'&&/^[A-Za-z][A-Za-z0-9:_-]*$/.test(x)&&!['constructor','prototype'].includes(x);
const failure=reason=>({ok:false,reason});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function supremeHealingProfile(domain,clericLevel){
 if(!Number.isSafeInteger(clericLevel)||clericLevel<17||clericLevel>20||!['Life Domain','Life Domain (2014)','Solidarity Domain (PSA)'].includes(domain))return null;
 const legacy=domain!=='Life Domain';return {v:1,key:'supreme-healing',source:domain,feature:'Supreme Healing',sourceEdition:legacy?'2014':'2024',sourceKinds:legacy?['spell']:['spell','channel-divinity'],creatureOnly:!legacy};
}
export function supremeHealingProblems(rule){
 const fields=['v','key','source','feature','sourceEdition','sourceKinds','creatureOnly'];if(!exact(rule,fields))return ['rule'];const canonical=supremeHealingProfile(rule.source,17);return canonical&&fields.every(k=>equal(rule[k],canonical[k]))?[]:['native-profile'];
}
export function maximumHealingExpression(raw){
 const expression=damageExpression(raw);if(!expression)return failure('unsupported-healing-expression');let diceMaximum=0,flatTotal=0,diceCount=0;
 for(const term of expression.matchAll(/([+-]?)(?:(\d*)d(\d+)|(\d+))/gi)){
  const sign=term[1]==='-'?-1:1;
  if(term[3]){const count=Number(term[2]||1),sides=Number(term[3]);if(sign<0||!integer(count)||count<1||!Number.isSafeInteger(sides)||sides<2||!Number.isSafeInteger(count*sides))return failure('unsupported-healing-expression');diceMaximum+=count*sides;diceCount+=count}
  else{const flat=Number(term[4]);if(!integer(flat))return failure('unsupported-healing-expression');flatTotal+=sign*flat}
  if(!Number.isSafeInteger(diceMaximum)||!Number.isSafeInteger(flatTotal)||!Number.isSafeInteger(diceCount))return failure('healing-capacity');
 }
 const total=diceMaximum+flatTotal;return Number.isSafeInteger(total)?{ok:true,expression,diceMaximum,flatTotal,diceCount,total}:failure('healing-capacity');
}
export function evaluateSupremeHealing(rule,packet,facts){
 if(supremeHealingProblems(rule).length)return failure('invalid-rule');
 if(!exact(packet,['v','sourceKind','owner','effect','expression'],['minimum'])||packet.v!==1||!['spell','channel-divinity','potion','hit-die','weapon','other'].includes(packet.sourceKind)||!['actor','other'].includes(packet.owner)||!['restore-hp','temporary-hp','maximum-hp','damage','damage-derived-healing'].includes(packet.effect)||typeof packet.expression!=='string'||own(packet,'minimum')&&!integer(packet.minimum))return failure('invalid-healing-packet');
 if(!exact(facts,['targetCreature'])||typeof facts.targetCreature!=='boolean')return failure('invalid-context');
 const applies=packet.owner==='actor'&&packet.effect==='restore-hp'&&rule.sourceKinds.includes(packet.sourceKind)&&(!rule.creatureOnly||facts.targetCreature);
 if(!applies)return {ok:true,applies:false,expression:packet.expression};const maximum=maximumHealingExpression(packet.expression);if(!maximum.ok)return maximum;if(!maximum.diceCount)return {ok:true,applies:false,expression:packet.expression};
 const amount=Math.max(packet.minimum||0,maximum.total);return {ok:true,applies:true,expression:String(amount),normalExpression:maximum.expression,amount,diceMaximum:maximum.diceMaximum,flatTotal:maximum.flatTotal,source:rule.source};
}
const DI_SOURCE='Cleric|Greater Divine Intervention';
export function greaterInterventionProfile(clericLevel,actorEdition,baseKey,wishKey){
 if(actorEdition!=='2024'||clericLevel!==20||!key(baseKey)||!key(wishKey)||baseKey===wishKey)return null;
 return {v:1,source:DI_SOURCE,classKey:'Cleric',sourceEdition:'2024',level:20,baseKey,wishKey,cooldownDice:'2d4'};
}
export function interventionProfileProblems(profile){if(!exact(profile,['v','source','classKey','sourceEdition','level','baseKey','wishKey','cooldownDice']))return ['source'];const native=greaterInterventionProfile(profile.level,profile.sourceEdition,profile.baseKey,profile.wishKey);return native&&Object.keys(native).every(k=>profile[k]===native[k])?[]:['source']}
export function interventionCooldownProblems(cooldown){
 if(cooldown===undefined)return [];
 if(!exact(cooldown,['v','source','remainingLongRests','baseKey','wishKey','lastRestGeneration','releasePending','baseRecoveryPending']))return ['cooldown'];
 return cooldown.v===1&&cooldown.source===DI_SOURCE&&integer(cooldown.remainingLongRests)&&cooldown.remainingLongRests<=8&&key(cooldown.baseKey)&&key(cooldown.wishKey)&&cooldown.baseKey!==cooldown.wishKey&&integer(cooldown.lastRestGeneration)&&typeof cooldown.releasePending==='boolean'&&typeof cooldown.baseRecoveryPending==='boolean'&&!(cooldown.remainingLongRests>0&&(cooldown.releasePending||cooldown.baseRecoveryPending))&&(!cooldown.baseRecoveryPending||cooldown.releasePending)?[]:['cooldown'];
}
export function interventionRecoveryProfile(clericLevel,actorEdition,baseKey,wishKey=null,historicalWishKey=wishKey,historicalWishStatus=historicalWishKey?'verified':'unavailable'){
 if(actorEdition!=='2024'||!Number.isSafeInteger(clericLevel)||clericLevel<10||clericLevel>20||!key(baseKey)||wishKey!==null&&(!key(wishKey)||wishKey===baseKey||clericLevel<20)||!['verified','ambiguous','unavailable'].includes(historicalWishStatus)||historicalWishStatus==='verified'&&(!key(historicalWishKey)||historicalWishKey===baseKey)||historicalWishStatus!=='verified'&&historicalWishKey!==null||wishKey!==null&&(historicalWishKey!==wishKey||historicalWishStatus!=='verified'))return null;
 return {v:1,classKey:'Cleric',sourceEdition:'2024',level:clericLevel,baseKey,wishKey,historicalWishKey,historicalWishStatus};
}
export function interventionRecoveryProblems(profile){if(!exact(profile,['v','classKey','sourceEdition','level','baseKey','wishKey','historicalWishKey','historicalWishStatus']))return ['binding'];const native=interventionRecoveryProfile(profile.level,profile.sourceEdition,profile.baseKey,profile.wishKey,profile.historicalWishKey,profile.historicalWishStatus);return native&&Object.keys(native).every(k=>profile[k]===native[k])?[]:['binding']}
function bindingFor(source){if(!interventionProfileProblems(source).length)return interventionRecoveryProfile(20,'2024',source.baseKey,source.wishKey);return !interventionRecoveryProblems(source).length?source:null}
function resourceState(used,source){if(!object(used))return null;const base=own(used,source.baseKey)?used[source.baseKey]:0,wish=source.wishKey===null?null:own(used,source.wishKey)?used[source.wishKey]:0;return (base===0||base===1)&&(wish===null||wish===0||wish===1)?{base,wish}:null}
export function readInterventionRecovery(cooldown,used,source){
 const binding=bindingFor(source);if(!binding)return failure('source-ineligible');if(interventionCooldownProblems(cooldown).length)return failure('unsupported-cooldown');const resources=resourceState(used,binding);if(!resources)return failure('unsupported-resource');
 if(cooldown===undefined){if(binding.historicalWishStatus!=='verified')return failure('history-binding-required');const historical=own(used,binding.historicalWishKey)?used[binding.historicalWishKey]:0;if(historical!==0&&historical!==1)return failure('unsupported-resource');if(historical===1)return failure('cooldown-review-required')}if(cooldown&&cooldown.baseRecoveryPending)return failure('base-recovery-review-required');const remaining=cooldown?cooldown.remainingLongRests:0,pending=!!(cooldown&&cooldown.releasePending),baseAvailable=remaining===0&&resources.base===0,wishAvailable=baseAvailable&&!pending&&resources.wish===0;
 return {ok:true,available:wishAvailable,baseAvailable,wishAvailable,blocked:remaining>0,remainingLongRests:remaining,releasePending:pending,baseKey:binding.baseKey,wishKey:binding.wishKey};
}
export function readInterventionAvailability(cooldown,used,source){return interventionProfileProblems(source).length?failure('source-ineligible'):readInterventionRecovery(cooldown,used,source)}
export function recordWishIntervention(cooldown,used,source,restCount,generation,declarations){
 const available=readInterventionAvailability(cooldown,used,source);if(!available.ok)return available;if(!available.available)return failure('intervention-unavailable');
 if(!Number.isInteger(restCount)||restCount<2||restCount>8||!integer(generation))return failure('invalid-cooldown-roll');if(!exact(declarations,['wishChosen','magicActionComplete','spellWasCast'])||Object.values(declarations).some(value=>value!==true))return failure('wish-declarations-required');
 return {ok:true,cooldown:{v:1,source:DI_SOURCE,remainingLongRests:restCount,baseKey:source.baseKey,wishKey:source.wishKey,lastRestGeneration:generation,releasePending:false,baseRecoveryPending:false},used:{...used,[source.baseKey]:1,[source.wishKey]:1}};
}
function recoveryBinding(cooldown,used,binding,remaining,releasePending){const next={...cooldown,remainingLongRests:remaining,releasePending},nextUsed={...used};if(!binding)return {cooldown:next,used:nextUsed};next.baseKey=binding.baseKey;if(binding.wishKey!==null)next.wishKey=binding.wishKey;
 if(remaining){nextUsed[binding.baseKey]=1;if(binding.wishKey!==null)nextUsed[binding.wishKey]=1}else if(releasePending&&!next.baseRecoveryPending&&binding.wishKey!==null){nextUsed[binding.wishKey]=0;next.releasePending=false}
 return {cooldown:next,used:nextUsed}}
export function completeInterventionLongRest(cooldown,used,source,event){
 if(interventionCooldownProblems(cooldown).length||!object(used))return failure('unsupported-cooldown');if(!exact(event,['completed','kind','generation'])||event.completed!==true||event.kind!=='long'||!integer(event.generation))return failure('long-rest-required');const binding=bindingFor(source);if(binding&&!resourceState(used,binding))return failure('unsupported-resource');
 if(cooldown===undefined){if(binding){const state=readInterventionRecovery(cooldown,used,binding);if(!state.ok)return state}return {ok:true,cooldown,used:{...used},changed:false}}
 if(event.generation<cooldown.lastRestGeneration)return failure('stale-rest');
 if(event.generation===cooldown.lastRestGeneration){const same=recoveryBinding(cooldown,used,binding,cooldown.remainingLongRests,cooldown.releasePending);return {ok:true,...same,changed:false,duplicate:true}}
 if(!cooldown.remainingLongRests&&!cooldown.releasePending)return {ok:true,cooldown:{...cooldown},used:{...used},changed:false};
 const remaining=Math.max(0,cooldown.remainingLongRests-1),finishing=cooldown.remainingLongRests>0&&remaining===0,released=finishing||cooldown.releasePending,next=recoveryBinding(cooldown,used,binding,remaining,released);next.cooldown.lastRestGeneration=event.generation;
 if(finishing){next.cooldown.baseRecoveryPending=!binding;if(binding)next.used[binding.baseKey]=0}return {ok:true,...next,changed:cooldown.remainingLongRests>0||released};
}
export function rebindInterventionRecovery(cooldown,used,source){
 if(interventionCooldownProblems(cooldown).length||!cooldown)return failure('unsupported-cooldown');const binding=bindingFor(source);if(!binding)return failure('source-ineligible');if(!resourceState(used,binding))return failure('unsupported-resource');
 if(cooldown.baseRecoveryPending&&resourceState(used,binding).base===1)return failure('base-recovery-review-required');const reconciled={...cooldown,baseRecoveryPending:false};return {ok:true,...recoveryBinding(reconciled,used,binding,cooldown.remainingLongRests,cooldown.releasePending)};
}
export function reviewLegacyInterventionRecovery(cooldown,used,source,remaining,generation,declarations){
 if(cooldown!==undefined)return failure('cooldown-already-recorded');const binding=bindingFor(source);if(!binding||binding.historicalWishStatus!=='verified')return failure('history-binding-required');const resources=resourceState(used,binding);if(!resources||used[binding.historicalWishKey]!==1)return failure('legacy-wish-use-required');
 if(!integer(remaining)||remaining>8||!integer(generation)||!exact(declarations,['actualRemainingDeclared'],['ordinaryInterventionAvailable'])||declarations.actualRemainingDeclared!==true||own(declarations,'ordinaryInterventionAvailable')&&(typeof declarations.ordinaryInterventionAvailable!=='boolean'||remaining>0&&declarations.ordinaryInterventionAvailable))return failure('recovery-declaration-required');
 return {ok:true,cooldown:{v:1,source:DI_SOURCE,remainingLongRests:remaining,baseKey:binding.baseKey,wishKey:binding.historicalWishKey,lastRestGeneration:generation,releasePending:remaining===0&&binding.wishKey===null,baseRecoveryPending:false},used:{...used,[binding.baseKey]:remaining?1:own(declarations,'ordinaryInterventionAvailable')?(declarations.ordinaryInterventionAvailable?0:1):resources.base,...(binding.wishKey!==null?{[binding.wishKey]:remaining?1:0}:{})}};
}

export function reviewInterventionBaseRecovery(cooldown,used,source,declarations){
 if(interventionCooldownProblems(cooldown).length||!cooldown||!cooldown.baseRecoveryPending||cooldown.remainingLongRests!==0)return failure('base-review-unavailable');const binding=bindingFor(source);if(!binding)return failure('source-ineligible');if(!resourceState(used,binding))return failure('unsupported-resource');if(!exact(declarations,['ordinaryInterventionAvailable'])||typeof declarations.ordinaryInterventionAvailable!=='boolean')return failure('daily-use-declaration-required');
 const recovered=recoveryBinding({...cooldown,baseRecoveryPending:false},used,binding,0,true);recovered.used[binding.baseKey]=declarations.ordinaryInterventionAvailable?0:1;return {ok:true,...recovered};
}
