/* Physical history controls; no resources or death mutation. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
const sessions=new WeakMap(),receipts=new WeakMap(),identity=()=>JSON.stringify([C.name,C.cid,C.id]),fail=reason=>({ok:false,reason});
export function currentVecnaGraftsInfo(){if(FROZEN||typeof env.__bldVecnaGraftsInfo!=='function')return {actorAvailable:false};try{return env.__bldVecnaGraftsInfo(C.name)||{actorAvailable:false}}catch{return {actorAvailable:false,reason:'vecna-graft-source-unavailable'}}}
function current(view){try{return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&sheetRootActive(view.root)&&env.__bldVecnaGraftsTokenCurrent?.(view.native)===true)}catch{return false}}
export function createVecnaGraftsSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldVecnaGraftsCapture!=='function')return null;const native=env.__bldVecnaGraftsCapture(C.name,{signature:info?.signature}),view={C,S,root,identity:identity(),native,done:false};if(!native||!current(view))return null;const token={};sessions.set(token,view);return token}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
export function requestVecnaGraftsCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldVecnaGraftsCommand!=='function')return fail('stale-vecna-graft-session');let body;try{body=structuredClone(request.body)}catch{return fail('actual-graft-facts-required')}const reply=env.__bldVecnaGraftsCommand(view.native,request.kind,body,()=>before(view,'Record Vecna graft '+request.kind),()=>current(view))||fail('vecna-graft-operation-unavailable');if(reply.ok||reply.committed){view.done=true;if(reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity()})}return reply}
export function acceptVecnaGraftsCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||FROZEN||typeof env.__bldVecnaGraftsAcceptReceipt!=='function')return false;return env.__bldVecnaGraftsAcceptReceipt(reply.receipt)?.ok===true}
