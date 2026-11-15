/* Original physical instruments use owned native transactions, not aggregate charges. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {requestInstrumentSpellCastNative} from './32b-logic-play-concentration-casting.js';
const sessions=new WeakMap(),receipts=new WeakMap(),identity=()=>JSON.stringify([C.name,C.cid,C.id]),fail=reason=>({ok:false,reason});
export function currentInstrumentSpellsInfo(){if(FROZEN||typeof env.__bldInstrumentSpellsInfo!=='function')return {actorAvailable:false};try{return env.__bldInstrumentSpellsInfo(C.name)||{actorAvailable:false}}catch(error){return {actorAvailable:false,reason:'instrument-source-unavailable'}}}
function current(view){try{return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&sheetRootActive(view.root)&&env.__bldInstrumentSpellsTokenCurrent?.(view.native)===true)}catch(error){return false}}
export function createInstrumentSpellsSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldInstrumentSpellsCapture!=='function')return null;const native=env.__bldInstrumentSpellsCapture(C.name,{signature:info?.signature}),view={C,S,root,identity:identity(),native,done:false};if(!native||!current(view))return null;const session={};sessions.set(session,view);return session}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
function recorded(view,reply){if(reply?.ok||reply?.committed){view.done=true;if(reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),result:reply.spell&&reply.stats?structuredClone({spell:reply.spell,stats:reply.stats}):null})}return reply}
export function requestInstrumentSpellsCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldInstrumentSpellsCommand!=='function')return fail('stale-instrument-session');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-instrument-facts-required')}return recorded(view,env.__bldInstrumentSpellsCommand(view.native,request.kind,body,()=>before(view,'Record instrument '+request.kind),()=>current(view))||fail('instrument-operation-unavailable'))}
export function requestInstrumentSpellCast(request){const view=sessions.get(request?.session);if(!current(view))return fail('stale-instrument-session');return requestInstrumentSpellCastNative({...request,session:view.native,isCurrent:()=>current(view),onCommitted:reply=>{recorded(view,reply);if(typeof request.onCommitted==='function')request.onCommitted(reply)}})}
export function acceptInstrumentSpellsCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||FROZEN||typeof env.__bldInstrumentSpellsAcceptReceipt!=='function')return false;return env.__bldInstrumentSpellsAcceptReceipt(reply.receipt)?.ok===true}

export function instrumentSpellResult(reply,root){const proof=receipts.get(reply);return proof?.result&&acceptInstrumentSpellsCommit(reply,root)?structuredClone(proof.result):null}
