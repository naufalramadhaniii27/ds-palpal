/* Physical magic ropes: object-only defenses, destruction, recovery and knotted climbing.
   Host binds each immutable kind to its actual native inventory source. */
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)),integer=v=>Number.isSafeInteger(v)&&v>=0,clone=structuredClone,fail=reason=>({ok:false,reason}),text=v=>typeof v==='string'&&!!v&&v.trim()===v;
export const MAGIC_ROPE_DAMAGE_TYPES=Object.freeze(['Acid','Bludgeoning','Cold','Fire','Force','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder']);
export const MAGIC_ROPE_LIMITS=Object.freeze({armorClass:20,maximumHP:20,recoveryIntervalSeconds:300,recoveryHPPerInterval:1,normalLengthFeet:60,knottedLengthFeet:50,maximumLoadPounds:3000});
export function createMagicRopes(){return {v:1,nextPhysical:1,physical:[]};}
function physicalValid(p,next){
 if(!exact(p,['id','kind','present','hp','knotted','recoveryEvents'])||typeof p.id!=='string'||!/^mrp-[1-9]\d*$/.test(p.id)||!['climbing','entanglement'].includes(p.kind))return false;
 const id=Number(p.id.slice(4));if(!Number.isSafeInteger(id)||id>=next||typeof p.present!=='boolean'||!dense(p.recoveryEvents)||!p.recoveryEvents.every(text)||new Set(p.recoveryEvents).size!==p.recoveryEvents.length)return false;
 if(p.hp===null)return p.recoveryEvents.length===0&&(p.kind==='climbing'?p.knotted===null:p.knotted===false);
 return integer(p.hp)&&p.hp<=20&&typeof p.knotted==='boolean'&&(p.kind==='climbing'||!p.knotted)&&(p.hp!==0||!p.present);
}
export function magicRopesProblems(s){
 if(!exact(s,['v','nextPhysical','physical'])||s.v!==1||!integer(s.nextPhysical)||s.nextPhysical<1||!dense(s.physical))return ['unsupported-state'];
 return s.physical.every(p=>physicalValid(p,s.nextPhysical))&&new Set(s.physical.map(p=>p.id)).size===s.physical.length?[]:['invalid-physical'];
}
export function adoptMagicRope(s,kind,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');if(s.nextPhysical===Number.MAX_SAFE_INTEGER)return fail('physical-identity-exhausted');
 if(!['climbing','entanglement'].includes(kind)||!exact(facts,['actualPhysicalIdentityVerified'])||facts.actualPhysicalIdentityVerified!==true)return fail('actual-physical-rope-required');
 const state=clone(s),id='mrp-'+state.nextPhysical++;state.physical.push({id,kind,present:true,hp:null,knotted:kind==='climbing'?null:false,recoveryEvents:[]});return {ok:true,state,id};
}
export function reviewMagicRope(s,id,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);
 if(!p||p.hp!==null||!exact(facts,['actualObjectStateVerified','hp','knotted'])||facts.actualObjectStateVerified!==true||!integer(facts.hp)||facts.hp>20||typeof facts.knotted!=='boolean'||p.kind==='entanglement'&&facts.knotted)return fail('actual-unknown-rope-state-required');
 const state=clone(s),next=state.physical.find(p=>p.id===id);next.hp=facts.hp;next.knotted=facts.knotted;if(next.hp===0)next.present=false;return {ok:true,state};
}
function knownAlive(p){return !!p&&p.hp!==null&&p.hp>0;}
export function magicRopeProjection(s,id){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);if(!p)return fail('physical-rope-unavailable');
 return {ok:true,id:p.id,kind:p.kind,present:p.present,reviewRequired:p.hp===null,hp:p.hp,maximumHP:20,armorClass:20,immunities:['Poison','Psychic'],destroyed:p.hp===0,knotted:p.knotted,usableLengthFeet:p.kind==='climbing'&&knownAlive(p)?p.knotted?50:60:0,maximumLoadPounds:p.kind==='climbing'?3000:null};
}
function attackFacts(f){return exact(f,['actualAttackRolled','natural','total'])&&f.actualAttackRolled===true&&integer(f.natural)&&f.natural>=1&&f.natural<=20&&Number.isFinite(f.total);}
export function resolveMagicRopeAttack(s,id,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);if(!knownAlive(p)||!p.present||!attackFacts(facts))return fail('actual-attack-against-intact-rope-required');
 return {ok:true,armorClass:20,hit:facts.natural===20||facts.natural!==1&&facts.total>=20,critical:facts.natural===20,natural:facts.natural,total:facts.total};
}
function packetsValid(packets){return dense(packets)&&packets.length>0&&packets.every(p=>exact(p,['type','amount'])&&MAGIC_ROPE_DAMAGE_TYPES.includes(p.type)&&integer(p.amount)&&p.amount>0);}
export function damageMagicRope(s,id,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);if(!knownAlive(p)||!p.present)return fail('intact-present-rope-required');
 if(!exact(facts,['actualObjectDamageVerified','packets','attack'])||facts.actualObjectDamageVerified!==true||!packetsValid(facts.packets))return fail('actual-typed-object-damage-required');
 const attack=facts.attack===null?{ok:true,hit:true,critical:false}:resolveMagicRopeAttack(s,id,facts.attack);if(!attack.ok||!('hit' in attack))return fail('actual-object-attack-required');
 let damage=0;const ignoredTypes=[];for(const packet of facts.packets){if(['Poison','Psychic'].includes(packet.type)){if(!ignoredTypes.includes(packet.type))ignoredTypes.push(packet.type);}else damage=Math.min(20,damage+Math.min(20,packet.amount));}
 const state=clone(s),next=state.physical.find(p=>p.id===id),hpLoss=attack.hit?Math.min(next.hp,damage):0;next.hp-=hpLoss;if(next.hp===0)next.present=false;
 return {ok:true,state,hit:attack.hit,critical:attack.critical,hpLoss,ignoredTypes,destroyed:next.hp===0};
}
export function regenerateMagicRope(s,id,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);if(!knownAlive(p))return fail('living-known-rope-required');
 if(!exact(facts,['actualCompleteFiveMinuteIntervalsVerified','intervals','eventId'])||facts.actualCompleteFiveMinuteIntervalsVerified!==true||!integer(facts.intervals)||facts.intervals===0||!text(facts.eventId))return fail('actual-complete-five-minute-intervals-required');
 if(p.recoveryEvents.includes(facts.eventId))return fail('recovery-event-already-recorded');const state=clone(s),next=state.physical.find(p=>p.id===id),hpRecovered=Math.min(20-next.hp,facts.intervals);next.hp+=hpRecovered;next.recoveryEvents.push(facts.eventId);return {ok:true,state,hpRecovered};
}
export function setMagicRopeKnots(s,id,facts){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);
 if(!knownAlive(p)||!p.present||p.kind!=='climbing'||!exact(facts,['actualKnotStateChanged','knotted'])||facts.actualKnotStateChanged!==true||typeof facts.knotted!=='boolean')return fail('actual-intact-climbing-rope-knot-state-required');
 if(p.knotted===facts.knotted)return fail('no-change');const state=clone(s);state.physical.find(p=>p.id===id).knotted=facts.knotted;return {ok:true,state};
}
function hintValid(hint){return hint===null||exact(hint,['adv','dis','fail','mode'])&&['adv','dis','fail'].every(k=>dense(hint[k])&&hint[k].every(text))&&['','adv','dis'].includes(hint.mode);}
function climbFacts(f){return exact(f,['kind','ability','bonus','purpose','actualUsingRope','distanceFeet','loadPounds'])&&f.kind==='ability-check'&&['STR','DEX','CON','INT','WIS','CHA'].includes(f.ability)&&Number.isFinite(f.bonus)&&f.purpose==='climbing'&&f.actualUsingRope===true&&Number.isFinite(f.distanceFeet)&&f.distanceFeet>=0&&Number.isFinite(f.loadPounds)&&f.loadPounds>=0;}
export function magicRopeClimbRoll(s,id,input,hint=null){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);
 if(!knownAlive(p)||!p.present||p.kind!=='climbing'||!p.knotted)return fail('intact-present-knotted-climbing-rope-required');
 if(!climbFacts(input)||input.distanceFeet>50||input.loadPounds>3000||!hintValid(hint))return fail('actual-qualified-rope-climb-required');
 const adv=[...(hint?.adv||[]),'Knotted Rope of Climbing'],dis=[...(hint?.dis||[])],failures=[...(hint?.fail||[])];if(failures.length)return {ok:false,reason:'automatic-failure',adv,dis,fail:failures};const mode=adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':'';
 return {ok:true,spec:{bon:input.bonus},adv,dis,fail:failures,mode,dice:mode?2:1};
}
export function setMagicRopePresence(s,id,present,facts={}){
 if(magicRopesProblems(s).length)return fail('unsupported-rope-history');const p=s.physical.find(p=>p.id===id);if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');
 if(present&&(p.hp===0||!exact(facts,['actualPhysicalCopyReturned'])||facts.actualPhysicalCopyReturned!==true))return fail('actual-undestroyed-rope-return-required');const state=clone(s);state.physical.find(p=>p.id===id).present=present;return {ok:true,state};
}
