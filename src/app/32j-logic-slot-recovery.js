/* Native slot recovery spends one actual item use and restores one selected spent slot atomically. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {slotRecoveryProfile,slotRecoverySlots} from '../data/lib/slot-recovery.js';
import {slotRecoveryActionAllowed,slotRecoveryCanAct} from './lib/slot-recovery-action.js';
const recoverySessions=new WeakMap(),recoveryEpochs=new WeakMap(),recoveryCommits=new WeakMap();
const recoveryFail=reason=>({ok:false,reason}),recoveryJSON=value=>JSON.stringify(value);
function recoveryEpoch(state){if(!recoveryEpochs.has(state))recoveryEpochs.set(state,{});return recoveryEpochs.get(state)}
export function invalidateSlotRecoveryState(state){if(state&&typeof state==='object')recoveryEpochs.set(state,{})}
function recoveryIdentity(){return recoveryJSON([C.name,C.cid,C.id])}
function recoveryContext(){return recoveryJSON({inventory:C.inv,resources:C.res,casting:C.spellcasting,conditions:S.cond,used:S.used,sources:S.slotRecoveryItems})}
function recoveryProfile(info){return info&&slotRecoveryProfile(info.item||info.name,info.nativeProfile||info.profile&&info.profile.nativeProfile)}
function recoveryCurrent(token){const view=recoverySessions.get(token);return view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===recoveryIdentity()&&view.epoch===recoveryEpoch(S)&&view.context===recoveryContext()&&sheetRootActive(view.root)&&typeof env.__bldSlotRecoveryTokenCurrent==='function'&&env.__bldSlotRecoveryTokenCurrent(view.physical)?view:null}
export function createSlotRecoverySession(root,info){const profile=recoveryProfile(info);if(FROZEN||!profile||!sheetRootActive(root)||!info||info.bound!==true&&info.actorAvailable!==true||typeof env.__bldSlotRecoveryCapture!=='function')return null;const physical=env.__bldSlotRecoveryCapture(info.item||info.name,C.name,info.occ||0,{index:info.index,signature:info.signature,sourceId:info.sourceId});if(!physical)return null;const token={};recoverySessions.set(token,{C,S,identity:recoveryIdentity(),epoch:recoveryEpoch(S),context:recoveryContext(),root,physical,profile,done:false});return token}
export function currentSlotRecoveryOptions(info){const profile=recoveryProfile(info);if(FROZEN||!profile)return recoveryFail('native-recovery-profile-unavailable');const result=slotRecoverySlots(C,S,profile);return result.ok?{ok:true,profile,slots:result.slots.map(slot=>({...slot,label:(slot.key==='pact'?'Pact':'Standard')+' level '+slot.level+' · '+slot.spent+' expended'}))}:result}
/** @param {unknown} value */
function recoveryThenable(value){return value!==null&&(typeof value==='object'||typeof value==='function')&&'then' in value&&typeof value.then==='function'}
function recoveryBefore(view,token){if(!recoveryCurrent(token))return false;const boundary=/** @type {unknown} */ (undoMark('Recover spell slot'));if(boundary===false||recoveryThenable(boundary))return false;return recoveryCurrent(token)?undefined:false}
export function requestSlotRecovery(options){const token=options&&options.session,view=recoveryCurrent(token);if(!view)return recoveryFail('stale-recovery-source');const declarations=structuredClone(options.declarations),selection=structuredClone(options.selection),action=slotRecoveryActionAllowed(S,view.profile,declarations);if(!action.ok)return action;const eligible=slotRecoverySlots(C,S,view.profile);if(!eligible.ok)return eligible;if(!eligible.slots.some(slot=>slot.key===selection?.key&&slot.level===selection?.level))return recoveryFail('actual-spent-slot-required');if(typeof env.__bldSlotRecoveryActivate!=='function')return recoveryFail('native-recovery-service-unavailable');const result=env.__bldSlotRecoveryActivate(view.physical,selection,{presenceSatisfied:true,activationComplete:true},()=>recoveryBefore(view,token),()=>!!recoveryCurrent(token));if(result&&result.ok){view.done=true;recoveryCommits.set(result,{root:view.root,S:view.S,identity:view.identity})}return result||recoveryFail('native-recovery-refused')}
export function slotRecoveryCommitResult(result,root){const proof=result&&recoveryCommits.get(result);if(!result||!result.ok||!result.receipt||!proof||root!==proof.root||S!==proof.S||proof.identity!==recoveryIdentity()||!sheetRootActive(root)||typeof env.__bldSlotRecoveryAcceptReceipt!=='function')return recoveryFail('unowned-recovery-commit');const accepted=env.__bldSlotRecoveryAcceptReceipt(result.receipt);return accepted&&accepted.ok&&Object.keys(accepted).every(key=>key==='ok'||recoveryJSON(accepted[key])===recoveryJSON(result[key]))?accepted:recoveryFail('unowned-recovery-commit')}
export function acceptSlotRecoveryCommit(result,root){return slotRecoveryCommitResult(result,root).ok===true}

export function slotRecoveryNativeActionAllowed(activation){return !FROZEN&&['Magic','Action','Bonus Action'].includes(activation)&&slotRecoveryCanAct(S)}
env.__slotRecoveryActionAllowed=slotRecoveryNativeActionAllowed;
