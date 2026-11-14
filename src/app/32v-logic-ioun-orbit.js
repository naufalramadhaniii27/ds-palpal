/* Physical Ioun Stones change native effects only through verified orbit actions. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {D} from './06-logic-derivation.js';
import {cfSkill} from './34b-ui-combat-effects-modes.js';
import {canonicalIounDefinition,iounCharacterMathStatus} from '../data/lib/ioun-orbit-source.js';
import {nativeActorPayload} from './lib/native-actor-frame.js';
import {iounOrbitAvailability} from '../data/lib/ioun-orbit.js';
const fail=reason=>({ok:false,reason}),sessions=new WeakMap(),receipts=new WeakMap(),epochs=new WeakMap();
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),json=JSON.stringify;
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
function identity(){return json([C.name,C.cid,C.id])}
function namespace(){return json([[own(S,'iounOrbit'),S.iounOrbit],[own(C,'iounOrbit'),C.iounOrbit]])}
export function invalidateIounOrbitState(state){if(state&&typeof state==='object')epochs.set(state,{})}
export function iounOrbitMathStatus(){return iounCharacterMathStatus(C,S)}
env.__iounOrbitMathStatus=iounOrbitMathStatus;
export function currentIounOrbitInfo(){try{return typeof env.__bldIounOrbitInfo==='function'?env.__bldIounOrbitInfo(C.name):fail('native-ioun-orbit-source-unavailable')}catch(error){return fail('native-ioun-orbit-source-unavailable')}}
function owned(view){return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&view.epoch===epoch(S)&&view.namespace===namespace()&&sheetRootActive(view.root))}
function current(view){return !!(owned(view)&&typeof env.__bldIounOrbitTokenCurrent==='function'&&env.__bldIounOrbitTokenCurrent(view.native)&&owned(view))}
export function createIounOrbitSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldIounOrbitCapture!=='function')return null;const view={C,S,root,identity:identity(),epoch:epoch(S),namespace:namespace(),done:false},native=env.__bldIounOrbitCapture(C.name,{signature:info?.signature});if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
export function requestIounOrbitCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldIounOrbitCommand!=='function')return fail('stale-ioun-orbit-source');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-ioun-orbit-facts-required')}const reply=env.__bldIounOrbitCommand(view.native,request.kind,body,()=>before(view,'Record Ioun Stone orbit '+request.kind),()=>current(view))||fail('ioun-orbit-operation-unavailable');if(reply.ok){view.done=true;if(reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),epoch:epoch(S)})}return reply}
export function acceptIounOrbitCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||proof.epoch!==epoch(S)||FROZEN||!sheetRootActive(root)||typeof env.__bldIounOrbitAcceptReceipt!=='function')return false;return env.__bldIounOrbitAcceptReceipt(reply.receipt)?.ok===true}

function awarenessRollContext(key){
 if(key==='init')return {bonus:D.init,flags:(D.cf?.chk||[]).concat(D.cf?.init||[])};
 const match=/^sk-([0-9]+)$/.exec(key),index=match?Number(match[1]):-1,row=C.skills?.[index];
 return row?.n==='Perception'&&row.ab==='WIS'?{bonus:D.skill?.[index],flags:cfSkill(row)}:null;
}
function awarenessRollInfo(){if(typeof env.__bldIounOrbitInfo==='function')return currentIounOrbitInfo();if(iounOrbitMathStatus().reviewRequired||!C.iounOrbitSources||!S.iounOrbit)return null;return {stones:S.iounOrbit.stones,availability:iounOrbitAvailability(S.iounOrbit,C.iounOrbitSources.context)}}
function awarenessQualified(info){const ids=info?.availability?.qualifiedIds||[];return info?.stones?.some(stone=>stone.profile==='dmg2024-ioun-awareness'&&ids.includes(stone.id))===true}
function awarenessBackendCurrent(token){if(typeof env.__bldIounOrbitInfo!=='function')return !token;if(token)return env.__bldIounOrbitTokenCurrent?.(token)===true;const info=currentIounOrbitInfo();if(!awarenessQualified(info))return false;try{const current=env.__bldIounOrbitCapture?.(C.name,{signature:info.signature});return !!current&&env.__bldIounOrbitTokenCurrent?.(current)===true}catch(error){return false}}
export function iounOrbitCheckRoll(key){
 const context=awarenessRollContext(key);if(!context)return undefined;
 const info=awarenessRollInfo();if(!awarenessQualified(info))return undefined;
 const character=C,state=S,actor=identity(),stamp=nativeActorPayload(),number=context.bonus,flags=canonicalIounDefinition(context.flags),generation=epoch(S);
 let token=null;try{token=env.__bldIounOrbitCapture?.(C.name,{signature:info.signature})}catch(error){}
 const adv=context.flags.filter(f=>f.t==='ADV').map(f=>f.s),dis=context.flags.filter(f=>f.t==='DIS').map(f=>f.s),fail=context.flags.filter(f=>f.t==='FAIL').map(f=>f.s);
 const guard=()=>{if(FROZEN||C!==character||S!==state||identity()!==actor||epoch(S)!==generation||nativeActorPayload()!==stamp)return false;const next=awarenessRollContext(key);return !!(next&&Number.isFinite(number)&&next.bonus===number&&canonicalIounDefinition(next.flags)===flags&&awarenessBackendCurrent(token))};
 return {adv,dis,fail,mode:adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':'',guard};
}
env.__iounOrbitCheckRoll=iounOrbitCheckRoll;
