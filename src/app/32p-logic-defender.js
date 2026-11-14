/* A Defender's first attack is recorded only when an actual native roll commits. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {D,derive} from './06-logic-derivation.js';
import {env} from './00-env.js';
import {undoMark} from './32-logic-play-undo-actions.js';
import {sheetRootActive} from './05-logic-helpers.js';
import {lateGet} from './00a-reg-late-ports.js';
import {qualifiedSkillMode} from './lib/qualified-skill-roll.js';
import {createDefenderRollRuntime} from './lib/defender-roll.js';
import {defenderItemName} from '../data/lib/defender-source.js';
const fail=reason=>({ok:false,reason}),sessions=new WeakMap(),receipts=new WeakMap();let epoch=0;
const identity=()=>JSON.stringify([C.name,C.cid,C.id]);
function recognizableDefenderAttack(row){return [row?.n,row?.of].some(name=>typeof name==='string'&&defenderItemName(name.replace(/ \(thrown\)$/,'')))}
function attackPrepare(request,transfer){const row=C.attacks?.[request.index],registered=Array.isArray(C.defenderSources?.attacks)&&C.defenderSources.attacks.some(attack=>attack?.index===request.index);if(!row)return null;const marked=Object.prototype.hasOwnProperty.call(row,'defender');if(!marked&&!registered&&!recognizableDefenderAttack(row))return null;if(FROZEN||typeof env.__bldDefenderAttackInfo!=='function')return fail('defender-source-unavailable');const result=transfer===undefined?env.__bldDefenderAttackInfo(C.name,request.index):env.__bldDefenderAttackInfo(C.name,request.index,transfer);if(result===null&&!marked&&!registered)return null;if(!result?.ok)return result||fail('defender-source-unavailable');const total=prospectiveAttackTotal(result,request.index);if(!Number.isFinite(total))return fail('defender-native-bonus-unavailable');return {...result,total,C,S,epoch,identity:identity(),committed:false}}
function prospectiveAttackTotal(result,index){if(!result.plannedCharacter||!result.plannedNamespace||typeof env.__deriveFor!=='function')return null;try{const state={...structuredClone(S),defender:structuredClone(result.plannedNamespace)},derived=env.__deriveFor(result.plannedCharacter,state);return Number.isFinite(derived?.atk?.[index]?.hit)?derived.atk[index].hit:null}catch(error){return null}}
function attackCurrent(prepared,phase){return !!(prepared?.ok&&!FROZEN&&(phase==='committed'||prepared.C===C)&&prepared.S===S&&prepared.epoch===epoch&&prepared.identity===identity()&&typeof env.__bldDefenderAttackCurrent==='function'&&env.__bldDefenderAttackCurrent(prepared.token,phase)===true)}
function attackCommit(prepared,result,current){if(!attackCurrent(prepared,'pending')||typeof env.__bldDefenderCommitAttack!=='function')return false;const reply=env.__bldDefenderCommitAttack(prepared.token,()=>{if(!current())return false;undoMark('Attack with Defender');return current()},current);prepared.committed=reply?.ok===true&&attackCurrent(prepared,'committed');return prepared.committed}
const genericRolls=createDefenderRollRuntime({prepare:attackPrepare,current:attackCurrent,commit:attackCommit});
export function defenderAttackSpec(key,spec){return genericRolls.decorate(key,spec)}
env.__defenderAttackSpec=defenderAttackSpec;
export function currentDefenderInfo(){try{return typeof env.__bldDefenderInfo==='function'?env.__bldDefenderInfo(C.name):fail('defender-source-unavailable')}catch(error){return fail('defender-source-unavailable')}}
function owned(view){return !!(view&&!view.done&&!FROZEN&&view.C===C&&view.S===S&&view.epoch===epoch&&view.identity===identity()&&sheetRootActive(view.root))}
function nativeCurrent(view){return !!(owned(view)&&typeof env.__bldDefenderTokenCurrent==='function'&&env.__bldDefenderTokenCurrent(view.native)&&owned(view))}
export function createDefenderSession(root,info){if(FROZEN||!sheetRootActive(root)||typeof env.__bldDefenderCapture!=='function')return null;const view={root,C,S,epoch,identity:identity(),done:false},native=env.__bldDefenderCapture(C.name,{signature:info?.signature});if(!native||!owned(view))return null;const token={};sessions.set(token,{...view,native});return token}
export function requestDefenderCommand(request){const view=sessions.get(request?.session);if(!view||!nativeCurrent(view)||typeof env.__bldDefenderCommand!=='function')return fail('stale-defender-source');let body;try{body=structuredClone(request.body)}catch(error){return fail('actual-defender-facts-required')}const reply=env.__bldDefenderCommand(view.native,request.kind,body,()=>{if(!nativeCurrent(view))return false;undoMark('Record Defender '+request.kind);return nativeCurrent(view)},()=>nativeCurrent(view));if(reply?.ok){view.done=true;receipts.set(reply,{S,identity:identity(),epoch,root:view.root})}return reply||fail('defender-operation-unavailable')}
export function refreshDefenderContext(){if(!FROZEN)derive()}
export function invalidateDefenderState(state){if(state===S){epoch++;genericRolls.invalidate()}}

function manualDefenderAttack(options,spec,reply){if(!Number.isInteger(options.face)||options.face<1||options.face>20)return fail('actual-d20-face-required');const result={nat:options.face,v:options.face+spec.bon,d:'['+options.face+'] + '+spec.bon,k:options.face===20?'nat20':options.face===1?'nat1':'d20',hand:1,critical:false};if(spec.critAt&&options.face>=spec.critAt){result.critical=true;result.d+=' (critical hit)'}if(!spec.beforeCommit(result))return fail('defender-attack-not-committed');reply(result);return {ok:true,result}}
export function requestDefenderAttack(options){
 const row=C.attacks?.[options?.index],root=options?.root;if(!row||!sheetRootActive(root)||FROZEN)return fail('defender-attack-unavailable');
 const native=lateGet('sitAtk');if(typeof native!=='function')return fail('native-attack-flags-unavailable');
 const mode=qualifiedSkillMode(native(row),false,'Defender');if(!mode.ok)return mode;
 const runtime=createDefenderRollRuntime({prepare:request=>attackPrepare(request,options.transfer),current:(prepared,phase)=>sheetRootActive(root)&&attackCurrent(prepared,phase),commit:attackCommit});
 const permission=typeof env.__temporaryAttackGuard==='function'?env.__temporaryAttackGuard('ah-'+options.index):undefined;if(permission===false)return fail('temporary-attack-unavailable');
 const spec=runtime.decorate('ah-'+options.index,{bon:D.atk?.[options.index]?.hit,...(typeof permission==='function'?{sourceGuard:permission}:{}),...(row.critRange?{critAt:Number(row.critRange)}:{})});if(typeof spec.beforeCommit!=='function'||!spec.sourceGuard())return fail('defender-attack-context-required');
 const reply=result=>{if(typeof options.onResult==='function')options.onResult(result)};
 if(options.face!==undefined)return manualDefenderAttack(options,spec,reply);
 const dice=env.__miRoll;if(!dice||typeof dice.roll!=='function'||dice.commitHook!==1)return fail('native-dice-transaction-unavailable');
 try{dice.roll(spec,mode.mode,row.n+' — Defender',reply,spec.sourceGuard,spec.beforeCommit)}catch(error){runtime.invalidate();return fail('native-dice-failed')}
 return {ok:true,pending:true,cancel:()=>runtime.invalidate()};
}

export function acceptDefenderCommit(reply,root){const proof=receipts.get(reply);return !!(proof&&proof.S===S&&proof.identity===identity()&&proof.epoch===epoch&&proof.root===root&&!FROZEN&&sheetRootActive(root)&&typeof env.__bldDefenderAcceptReceipt==='function'&&env.__bldDefenderAcceptReceipt(reply.receipt)?.ok)}
