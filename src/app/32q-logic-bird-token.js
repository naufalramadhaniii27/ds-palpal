/* Consumed tokens and the retained transport bird share one owned transaction. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
const fail=reason=>({ok:false,reason}),sessions=new WeakMap(),receipts=new WeakMap(),epochs=new WeakMap();
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),json=JSON.stringify;
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
function identity(){return json([C.name,C.cid,C.id])}
function namespace(){return json([[own(S,'birdToken'),S.birdToken],[own(C,'birdToken'),C.birdToken]])}
export function invalidateBirdTokenState(state){if(state&&typeof state==='object')epochs.set(state,{})}
export function currentBirdTokenInfo(){try{return typeof env.__bldBirdTokenInfo==='function'?env.__bldBirdTokenInfo(C.name):fail('native-bird-token-source-unavailable')}catch(error){return fail('native-bird-token-source-unavailable')}}
function owned(view){return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&view.epoch===epoch(S)&&view.namespace===namespace()&&sheetRootActive(view.root))}
function current(view){return !!(owned(view)&&typeof env.__bldBirdTokenTokenCurrent==='function'&&env.__bldBirdTokenTokenCurrent(view.native)&&owned(view))}
export function createBirdTokenSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldBirdTokenCapture!=='function')return null;const view={C,S,root,identity:identity(),epoch:epoch(S),namespace:namespace(),done:false},native=env.__bldBirdTokenCapture(C.name,{signature:info?.signature});if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
export function requestBirdTokenCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldBirdTokenCommand!=='function')return fail('stale-bird-token-source');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-bird-token-facts-required')}const reply=env.__bldBirdTokenCommand(view.native,request.kind,body,()=>before(view,'Record feather-token bird '+request.kind),()=>current(view))||fail('bird-token-operation-unavailable');if(reply.ok){view.done=true;if(reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),epoch:epoch(S)})}return reply}
export function acceptBirdTokenCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||proof.epoch!==epoch(S)||FROZEN||!sheetRootActive(root)||typeof env.__bldBirdTokenAcceptReceipt!=='function')return false;return env.__bldBirdTokenAcceptReceipt(reply.receipt)?.ok===true}
