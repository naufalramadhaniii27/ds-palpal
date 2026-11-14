/* Owned native transaction: one owned Traveling component and its existing native charge key. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {canonicalTravelGoatDefinition} from '../data/lib/travel-goat-profile.js';
const sessions=new WeakMap(),receipts=new WeakMap(),epochs=new WeakMap();
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),fail=reason=>({ok:false,reason});
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
function identity(){return canonicalTravelGoatDefinition([C.name,C.cid,C.id])}
function signature(){return canonicalTravelGoatDefinition([[own(S,'travelGoat'),S.travelGoat],[own(C,'travelGoat'),C.travelGoat],[own(C,'travelGoatSources'),C.travelGoatSources],[own(S,'used'),S.used]])}
export function invalidateTravelGoatState(state){if(state&&typeof state==='object')epochs.set(state,{})}
export function currentTravelGoatInfo(){try{return typeof env.__bldTravelGoatInfo==='function'?env.__bldTravelGoatInfo(C.name):fail('native-traveling-source-unavailable')}catch{return fail('native-traveling-source-unavailable')}}
function owned(view){return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&view.signature===signature()&&view.epoch===epoch(S)&&sheetRootActive(view.root))}
function current(view){try{return !!(owned(view)&&typeof env.__bldTravelGoatTokenCurrent==='function'&&env.__bldTravelGoatTokenCurrent(view.native)&&owned(view))}catch{return false}}
export function createTravelGoatSession(root,info){
 if(FROZEN||!sheetRootActive(root)||typeof env.__bldTravelGoatCapture!=='function')return null;
 const view={C,S,root,identity:identity(),signature:signature(),epoch:epoch(S),done:false};
 let native;try{native=env.__bldTravelGoatCapture(C.name,{signature:info?.signature})}catch{return null}
 if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token;
}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
function remember(view,reply){if(reply?.ok||reply?.committed)view.done=true;if(reply?.ok&&reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),epoch:epoch(S)})}
export function requestTravelGoatCommand(request){
 const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldTravelGoatCommand!=='function')return fail('stale-traveling-source');
 let body;try{body=structuredClone(request.body)}catch{return fail('actual-traveling-facts-required')}
 let reply;try{reply=env.__bldTravelGoatCommand(view.native,request.kind,body,()=>before(view,'Record Goat of Traveling '+request.kind),()=>current(view))}catch{return fail('traveling-operation-unavailable')}
 if(reply?.then)return fail('synchronous-native-transaction-required');reply=reply||fail('traveling-operation-unavailable');remember(view,reply);return reply;
}
export function acceptTravelGoatCommit(reply,root){
 const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||proof.epoch!==epoch(S)||FROZEN||!sheetRootActive(root)||typeof env.__bldTravelGoatAcceptReceipt!=='function')return false;
 try{return env.__bldTravelGoatAcceptReceipt(reply.receipt)?.ok===true}catch{return false}
}
