import {recordSlotRecoveryReset,slotRecoveryAuthorityProblems,slotRecoveryProfile} from '../../data/lib/slot-recovery.js';
const restJSON=JSON.stringify,restOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
function restPlanValid(plan,authority){if(!plan?.ok||typeof plan.nativeSignature!=='string'||!plan.nativeSignature||restJSON(plan.authority)!==restJSON(authority)||!Array.isArray(plan.managedKeys)||new Set(plan.managedKeys).size!==plan.managedKeys.length)return false;const expected=authority.sources.map(source=>source.state.chargeKey).sort();return restJSON(plan.managedKeys.slice().sort())===restJSON(expected)&&plan.managedKeys.every(key=>typeof key==='string'&&!!key&&!/^s[1-9]$/.test(key)&&key!=='pact')}
export function createSlotRecoveryRestBoundary(host){
 const snapshots=new WeakMap();
 function prepare(kind){
  const actor=host.actor();if(!actor||actor.readOnly!==false||!actor.C||!actor.S||!actor.S.used||typeof actor.S.used!=='object'||Array.isArray(actor.S.used)||slotRecoveryAuthorityProblems(actor.S.slotRecoveryItems).length)return null;
  const character=restJSON(actor.C),state=restJSON(actor.S);let plan;try{plan=host.plan(kind)}catch(error){return null}
  const live=host.actor();if(!restPlanValid(plan,actor.S.slotRecoveryItems)||live?.readOnly!==false||live.C!==actor.C||live.S!==actor.S||restJSON(actor.C)!==character||restJSON(actor.S)!==state)return null;
  const token={},used=plan.managedKeys.map(key=>({key,present:restOwn(actor.S.used,key),value:structuredClone(actor.S.used[key])}));snapshots.set(token,{actor,character,namespace:restJSON(actor.S.slotRecoveryItems),plan,used,kind});return token;
 }
 function finish(kind,token){
  const saved=snapshots.get(token);if(!saved||saved.kind!==kind)return false;snapshots.delete(token);const actor=host.actor();if(actor?.readOnly!==false||actor.C!==saved.actor.C||actor.S!==saved.actor.S||restJSON(actor.C)!==saved.character||restJSON(actor.S.slotRecoveryItems)!==saved.namespace)return false;
  const before=restJSON(actor.S);let current;try{current=host.plan(kind)}catch(error){return false}const live=host.actor();if(!current?.ok||live?.readOnly!==false||live.C!==actor.C||live.S!==actor.S||restJSON(actor.C)!==saved.character||restJSON(actor.S)!==before||restJSON(current)!==restJSON(saved.plan))return false;
  const state=structuredClone(actor.S);for(const entry of saved.used){if(entry.present)state.used[entry.key]=structuredClone(entry.value);else delete state.used[entry.key]}
  if(kind!=='short'&&state.slotRecoveryItems.sources.some(source=>slotRecoveryProfile(source.item,source.nativeProfile).reset==='long')){
   const authority=state.slotRecoveryItems;let ordinal=authority.dawnEvents.length+1;while(authority.dawnEvents.includes('long:native-rest-'+ordinal))ordinal++;if(!Number.isSafeInteger(ordinal))return false;
   const reset=recordSlotRecoveryReset(actor.C.inv||[],authority,state,{reset:'long',actualResetOccurred:true,eventId:'native-rest-'+ordinal});if(!reset.ok)return false;state.used=reset.state.used;state.slotRecoveryItems=reset.authority;
  }
  actor.S.used=state.used;actor.S.slotRecoveryItems=state.slotRecoveryItems;return true;
 }
 return {prepare,finish};
}
