/* Defender conserves its native physical +3 across actual attack/damage and held AC.
   Host certifies native physical identity, immutable melee base and allocated ATT. */
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)),integer=v=>Number.isSafeInteger(v)&&v>=0,allocation=v=>integer(v)&&v<=3,clone=structuredClone,fail=reason=>({ok:false,reason});
export const DEFENDER_BASES=Object.freeze(["Longsword","Battleaxe","Club","Dagger","Flail","Glaive","Greataxe","Greatclub","Greatsword","Halberd","Handaxe","Javelin","Lance","Light Hammer","Mace","Maul","Morningstar","Pike","Quarterstaff","Rapier","Scimitar","Shortsword","Sickle","Spear","Trident","War Pick","Warhammer","Whip"]);
const text=v=>typeof v==='string'&&v.length>0&&v.trim()===v;
export function createDefender(){return {v:1,nextPhysical:1,turn:null,turnEvents:[],physical:[]};}
function physicalOK(p,next){
 if(!exact(p,['id','base','present','held','allocation','firstAttack'])||!DEFENDER_BASES.includes(p.base)||typeof p.id!=='string'||!/^dfp-[1-9]\d*$/.test(p.id))return false;
 const id=Number(p.id.slice(4));if(!Number.isSafeInteger(id)||id>=next||typeof p.present!=='boolean'||typeof p.held!=='boolean'||p.held&&!p.present)return false;
 if(p.allocation===null)return p.firstAttack===null;
 return allocation(p.allocation)&&typeof p.firstAttack==='boolean'&&(p.firstAttack||p.allocation===0);
}
export function defenderProblems(s){
 if(!exact(s,['v','nextPhysical','turn','turnEvents','physical'])||s.v!==1||!integer(s.nextPhysical)||s.nextPhysical<1||!dense(s.turnEvents)||!dense(s.physical))return ['unsupported-state'];
 if(!s.turnEvents.every(text)||new Set(s.turnEvents).size!==s.turnEvents.length)return ['invalid-turn-history'];
 if(s.turn===null){if(s.turnEvents.length)return ['invalid-turn-history'];}
 else if(!exact(s.turn,['id','ownTurn'])||!text(s.turn.id)||typeof s.turn.ownTurn!=='boolean'||s.turnEvents.at(-1)!==s.turn.id)return ['invalid-turn'];
 if(!s.physical.every(p=>physicalOK(p,s.nextPhysical))||new Set(s.physical.map(p=>p.id)).size!==s.physical.length)return ['invalid-physical'];
 if(s.turn===null&&s.physical.some(p=>p.allocation!==null||p.firstAttack!==null))return ['unknown-initial-turn'];return [];
}
export function adoptDefender(s,facts){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');
 if(!exact(facts,['actualPhysicalIdentityVerified','base'])||facts.actualPhysicalIdentityVerified!==true||!DEFENDER_BASES.includes(facts.base))return fail('actual-physical-identity-required');
 const state=clone(s),id='dfp-'+state.nextPhysical++;state.physical.push({id,base:facts.base,present:true,held:false,allocation:null,firstAttack:null});return {ok:true,state,id};
}
export function recordDefenderTurnStart(s,facts){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');
 if(!exact(facts,['actualNextOwnTurnStarted','eventId'])||facts.actualNextOwnTurnStarted!==true||!text(facts.eventId))return fail('actual-next-own-turn-required');
 if(s.turnEvents.includes(facts.eventId))return fail('own-turn-event-already-recorded');
 const state=clone(s);state.turnEvents.push(facts.eventId);state.turn={id:facts.eventId,ownTurn:true};for(const p of state.physical){p.allocation=0;p.firstAttack=false;}return {ok:true,state};
}
export function recordDefenderTurnEnd(s,facts){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');
 if(!exact(facts,['actualOwnTurnEnded','turnId'])||facts.actualOwnTurnEnded!==true||!s.turn?.ownTurn||facts.turnId!==s.turn.id)return fail('actual-current-own-turn-end-required');
 const state=clone(s);state.turn.ownTurn=false;return {ok:true,state};
}
export function setDefenderHeld(s,id,held,facts){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');const p=s.physical.find(p=>p.id===id);
 if(!p||typeof held!=='boolean'||!exact(facts,['actualHeldStateVerified'])||facts.actualHeldStateVerified!==true||held&&!p.present)return fail('actual-held-state-required');
 if(p.held===held)return fail('no-change');const state=clone(s);state.physical.find(p=>p.id===id).held=held;return {ok:true,state};
}
export function setDefenderPresence(s,id,present,facts={}){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');const p=s.physical.find(p=>p.id===id);
 if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');
 if(present&&(!exact(facts,['actualPhysicalCopyReturned'])||facts.actualPhysicalCopyReturned!==true))return fail('actual-physical-copy-return-required');
 const state=clone(s),next=state.physical.find(p=>p.id===id);next.present=present;if(!present)next.held=false;return {ok:true,state};
}
export function defenderProjection(s,id){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');const p=s.physical.find(p=>p.id===id);if(!p)return fail('physical-defender-unavailable');
 if(p.allocation===null||!s.turn)return {ok:false,reason:'actual-next-own-turn-required',reviewRequired:true};
 const k=p.allocation;return {ok:true,reviewRequired:false,transfer:k,attackDelta:-k,damageDelta:-k,weaponAttackBonus:3-k,weaponDamageBonus:3-k,armorClass:p.present&&p.held?k:0};
}
function attackFacts(facts){
 if(!obj(facts)||!own(facts,'actualAttackCommitted')||!own(facts,'turnId')||Reflect.ownKeys(facts).some(k=>typeof k!=='string'||!['actualAttackCommitted','turnId','transfer'].includes(k)))return false;
 return facts.actualAttackCommitted===true&&text(facts.turnId)&&(!own(facts,'transfer')||allocation(facts.transfer));
}
export function planDefenderAttack(s,id,facts){
 if(defenderProblems(s).length)return fail('unsupported-defender-history');const p=s.physical.find(p=>p.id===id);
 if(!p||!p.present)return fail('physical-defender-unavailable');
 if(!s.turn||p.allocation===null||p.firstAttack===null)return fail('actual-next-own-turn-required');
 if(!attackFacts(facts)||facts.turnId!==s.turn.id)return fail('actual-current-defender-attack-required');
 const first=s.turn.ownTurn&&!p.firstAttack;if(own(facts,'transfer')&&!first)return fail('first-own-turn-attack-only');
 const state=clone(s),next=state.physical.find(p=>p.id===id);if(first){next.allocation=own(facts,'transfer')?facts.transfer:0;next.firstAttack=true;}
 return {ok:true,state,projection:defenderProjection(state,id),firstAttack:first};
}
