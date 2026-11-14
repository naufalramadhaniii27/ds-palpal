/* One owned physical energy authority; casting keeps its native side effects. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {requestRodAbsorptionCast as nativeRodAbsorptionCast} from './32b-logic-play-concentration-casting.js';
const fail=reason=>({ok:false,reason}),sessions=new WeakMap(),receipts=new WeakMap(),epochs=new WeakMap();
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key),json=JSON.stringify;
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
function identity(){return json([C.name,C.cid,C.id])}
function namespace(){return json([[own(S,'rodAbsorption'),S.rodAbsorption],[own(C,'rodAbsorption'),C.rodAbsorption]])}
export function invalidateRodAbsorptionState(state){if(state&&typeof state==='object')epochs.set(state,{})}
export function currentRodAbsorptionInfo(){try{return typeof env.__bldRodAbsorptionInfo==='function'?env.__bldRodAbsorptionInfo(C.name):fail('native-rod-source-unavailable')}catch(error){return fail('native-rod-source-unavailable')}}
function rootOwned(view){return !!(view&&!view.done&&!FROZEN&&view.S===S&&view.identity===identity()&&view.epoch===epoch(S)&&sheetRootActive(view.root))}
function owned(view){return !!(rootOwned(view)&&view.C===C&&view.namespace===namespace())}
function current(view){return !!(owned(view)&&typeof env.__bldRodAbsorptionTokenCurrent==='function'&&env.__bldRodAbsorptionTokenCurrent(view.native)&&owned(view))}
export function createRodAbsorptionSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldRodAbsorptionCapture!=='function')return null;const view={C,S,root,identity:identity(),epoch:epoch(S),namespace:namespace(),done:false},native=env.__bldRodAbsorptionCapture(C.name,{signature:info?.signature});if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
function remember(view,reply){if(!reply||reply.pending)return;if(reply.ok||reply.committed)view.done=true;if(reply.ok&&reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),epoch:epoch(S)})}
export function requestRodAbsorptionCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldRodAbsorptionCommand!=='function')return fail('stale-rod-source');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-rod-facts-required')}const reply=env.__bldRodAbsorptionCommand(view.native,request.kind,body,()=>before(view,'Record Rod of Absorption '+request.kind),()=>current(view))||fail('rod-operation-unavailable');remember(view,reply);return reply}
export function requestRodAbsorptionSpell(request){const view=sessions.get(request?.session);if(!current(view))return fail('stale-rod-source');let declarations;try{declarations=structuredClone(request.declarations)}catch(error){return fail('normal-casting-facts-required')}return nativeRodAbsorptionCast({session:view.native,physicalId:request.physicalId,spellIndex:request.spellIndex,castLevel:request.castLevel,declarations,isCurrent:()=>rootOwned(view),onCommitted:reply=>{remember(view,reply);if(typeof request.onCommitted==='function')request.onCommitted(reply)}})}
export function acceptRodAbsorptionCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||proof.epoch!==epoch(S)||FROZEN||!sheetRootActive(root)||typeof env.__bldRodAbsorptionAcceptReceipt!=='function')return false;return env.__bldRodAbsorptionAcceptReceipt(reply.receipt)?.ok===true}
