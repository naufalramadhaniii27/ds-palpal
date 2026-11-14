/* Physical magic ropes retain their own object HP and actual recovery history. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {D,derive,nativeAbilityCheckBonus} from './06-logic-derivation.js';
import {lateGet} from './00a-reg-late-ports.js';
import {qualifiedSkillMode} from './lib/qualified-skill-roll.js';
const fail=reason=>({ok:false,reason}),sessions=new WeakMap(),receipts=new WeakMap(),epochs=new WeakMap();
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),json=JSON.stringify;
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
function identity(){return json([C.name,C.cid,C.id])}
function namespace(){return json([[own(S,'magicRopes'),S.magicRopes],[own(C,'magicRopes'),C.magicRopes]])}
export function invalidateMagicRopesState(state){if(state&&typeof state==='object')epochs.set(state,{})}
export function currentMagicRopesInfo(){try{return typeof env.__bldMagicRopesInfo==='function'?env.__bldMagicRopesInfo(C.name):fail('native-magic-rope-source-unavailable')}catch(error){return fail('native-magic-rope-source-unavailable')}}
function owned(view){return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.identity===identity()&&view.epoch===epoch(S)&&view.namespace===namespace()&&sheetRootActive(view.root))}
function current(view){return !!(owned(view)&&typeof env.__bldMagicRopesTokenCurrent==='function'&&env.__bldMagicRopesTokenCurrent(view.native)&&owned(view))}
export function createMagicRopesSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldMagicRopesCapture!=='function')return null;const view={C,S,root,identity:identity(),epoch:epoch(S),namespace:namespace(),done:false},native=env.__bldMagicRopesCapture(C.name,{signature:info?.signature});if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token}
function before(view,label){if(!current(view))return false;undoMark(label);return current(view)}
export function requestMagicRopesCommand(request){const view=sessions.get(request?.session);if(!current(view)||typeof env.__bldMagicRopesCommand!=='function')return fail('stale-magic-rope-source');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-magic-rope-facts-required')}const reply=env.__bldMagicRopesCommand(view.native,request.kind,body,()=>before(view,'Record magic rope '+request.kind),()=>current(view))||fail('magic-rope-operation-unavailable');if(reply.ok){view.done=true;if(reply.receipt)receipts.set(reply,{S,root:view.root,identity:identity(),epoch:epoch(S)})}return reply}
export function acceptMagicRopesCommit(reply,root){const proof=receipts.get(reply);if(!proof||proof.S!==S||proof.root!==root||proof.identity!==identity()||proof.epoch!==epoch(S)||FROZEN||!sheetRootActive(root)||typeof env.__bldMagicRopesAcceptReceipt!=='function')return false;const accepted=env.__bldMagicRopesAcceptReceipt(reply.receipt);if(accepted?.ok!==true)return false;for(const key of ['recorded','hit','critical','hpLoss','ignoredTypes','destroyed','hpRecovered'])if(own(accepted,key))reply[key]=structuredClone(accepted[key]);return true}

const climbSessions=new WeakMap();
function climbContext(){const character={...C},state={...S};delete character._app;delete state._app;return json([character,state,D.skill,D.mod,D.exhN,D.cf])}
function nativeClimbCheck(options){
 if(!options||options.actualUsingRope!==true||!['skill','ability'].includes(options.kind)||!Number.isFinite(options.modifier))return fail('actual-climbing-check-required');
 let row,total,label;
 if(options.kind==='skill'){row=C.skills?.[options.index];total=D.skill?.[options.index];label=row?row.ab+' ('+row.n+')':''}else{row={ab:options.ability,n:''};total=nativeAbilityCheckBonus(options.ability);label=options.ability+' ability check'}
 if(!row||!Number.isFinite(total))return fail('native-climbing-bonus-unavailable');const flags=lateGet('cfSkill');if(typeof flags!=='function')return fail('native-climbing-flags-unavailable');let native;try{native=flags(row)}catch(error){return fail('native-climbing-flags-unavailable')}
 const adjusted=climbFlags(native,row,options);if(!adjusted.ok)return adjusted;const hint=qualifiedSkillMode(adjusted.flags,false,'Rope of Climbing');if(!hint.ok)return hint;
 return {ok:true,row,total:total+options.modifier,label,hint:{adv:hint.adv,dis:hint.dis,fail:[],mode:hint.mode}};
}
function climbFlags(flags,row,options){if(!Array.isArray(flags))return fail('native-climbing-flags-unavailable');flags=flags.slice();if(row.dis)flags.push({t:'DIS',s:row.dis});if(S.cond?.Frightened){if(typeof options.fearSourceInSight!=='boolean')return fail('fear-context-required');if(!options.fearSourceInSight)flags=flags.filter(flag=>flag?.s!=='Frightened, while the source of fear is in sight')}if(options.otherAdvantage===true)flags.push({t:'ADV',s:'Other declared Advantage'});if(options.disadvantage===true)flags.push({t:'DIS',s:'Other declared Disadvantage'});return {ok:true,flags}}
function captureClimb(root,readOptions){if(FROZEN||!sheetRootActive(root)||typeof readOptions!=='function'||typeof env.__bldMagicRopesClimbInfo!=='function')return null;let options;try{options=structuredClone(readOptions())}catch(error){return null}const check=nativeClimbCheck(options);if(!check.ok)return null;const context=climbContext(),input={kind:'ability-check',ability:check.row.ab,bonus:check.total,purpose:'climbing',actualUsingRope:true,distanceFeet:options.distanceFeet,loadPounds:options.loadPounds},result=env.__bldMagicRopesClimbInfo(C.name,options.physicalId,input,check.hint);if(!result?.ok||context!==climbContext())return null;return {C,S,root,identity:identity(),epoch:epoch(S),context,options:json(options),readOptions,native:result.token,check:{total:check.total,label:check.label+' — climb with this knotted rope',mode:result.mode,adv:result.adv,dis:result.dis},pending:false,done:false,cancelled:false}}
function climbOwned(view){if(!view||view.cancelled||view.done||FROZEN||view.C!==C||view.S!==S||view.identity!==identity()||view.epoch!==epoch(S)||!sheetRootActive(view.root)||view.context!==climbContext())return false;try{return json(view.readOptions())===view.options}catch(error){return false}}
function climbCurrent(view){return !!(climbOwned(view)&&typeof env.__bldMagicRopesClimbCurrent==='function'&&env.__bldMagicRopesClimbCurrent(view.native)&&climbOwned(view))}
export function createMagicRopesClimbSession(root,readOptions){const view=captureClimb(root,readOptions);if(!view||!climbCurrent(view))return null;const token={};climbSessions.set(token,view);return token}
export function requestMagicRopesClimb(request){const view=climbSessions.get(request?.session);if(!climbCurrent(view)||view.pending)return fail('stale-magic-rope-climb');const reply=result=>{if(!climbCurrent(view))return;view.done=true;view.pending=false;if(typeof request.onResult==='function')request.onResult({ok:true,result,check:view.check,character:C,state:S})};if(request.face!==undefined)return manualRopeClimb(view,request.face,reply);const dice=env.__miRoll;if(!dice||typeof dice.roll!=='function'||dice.commitHook!==1)return fail('native-dice-unavailable');view.pending=true;try{dice.roll({bon:view.check.total},view.check.mode,view.check.label,reply,()=>climbCurrent(view))}catch(error){view.pending=false;return fail('native-dice-failed')}return {ok:true,pending:!view.done}}
function manualRopeClimb(view,face,reply){if(!Number.isInteger(face)||face<1||face>20)return fail('actual-d20-face-required');const result={nat:face,v:face+view.check.total,hand:1,d:'Chosen d20 face '+face+' + '+view.check.total};reply(result);return {ok:view.done,result}}
export function cancelMagicRopesClimb(token){const view=climbSessions.get(token);if(view){view.cancelled=true;view.pending=false}}
export function refreshMagicRopesContext(){if(!FROZEN)derive()}
