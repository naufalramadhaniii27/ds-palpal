/* Source-owned tool checks. Nothing here grants a global tool proficiency. */
import {C,S} from "../04-logic-storage.js";
import {currentAbilityScores,clamp,num,sheetRootActive} from "../05-logic-helpers.js";
import {env} from "../00-env.js";
import {modeOn} from "../33-logic-play-rage-conditions.js";
import {toolFormMetadata,normalizeToolForm,toolFormCheck} from "../../data/lib/tool-form.js";
const ABILITIES=['STR','DEX','CON','INT','WIS','CHA'],INCAP=['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'];
const sessions=new WeakSet();
const signed=n=>(n<0?'':'+' )+n;
function freshToolPb(){const level=clamp(Math.round(num(C.level,1)),1,20),extra=clamp(Math.round(num(C.pbAdd,0)),0,6);return 2+Math.floor((level-1)/4)+extra}
function strictExpertiseRule(rule){return rule&&typeof rule==='object'&&!Array.isArray(rule)&&Object.keys(rule).every(k=>['kind','source','edition'].includes(k))&&rule.kind==='proficient-tool-expertise'&&rule.source==='Artificer: Tool Expertise'&&rule.edition==='2014'}
function toolCharacter(){return {...C,toolCheckRules:C.rs==='2014'&&Array.isArray(C.toolCheckRules)?C.toolCheckRules.filter(strictExpertiseRule):[]}}
function toolName(item,form){return form.tool||((item.key||item.n)==='Manifold Tool'?'Basic tool':'Screwdriver')}
function freshToolExhaustion(){let level=num(S.exh,0);const minimum=clamp(Math.round(num(C.exhMin,0)),0,5),lock=S.exhLk;if(minimum>level)level=minimum;else if(lock&&minimum<lock.min)level=Math.max(minimum,level-Math.min(lock.add||0,Math.max(0,level-minimum)));return clamp(Math.round(level),0,6)}
function toolConditions(ability,options){const condition=S.cond||{},adv=[],dis=[],exhaustion=freshToolExhaustion(),legacy=C.rs==='2014';if(options.mode==='adv')adv.push('Declared Advantage');if(options.mode==='dis')dis.push('Declared Disadvantage');if(condition.Poisoned&&!condition.Petrified)dis.push('Poisoned');if(legacy&&exhaustion>=1)dis.push('Exhaustion');if(condition.Frightened&&options.fearSourceInSight===true)dis.push('Frightened: source in sight');if(ability==='STR'&&modeOn('rage'))adv.push('Rage');return {adv,dis,penalty:legacy?0:-2*exhaustion,mode:adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':''}}
function toolBlocked(reason,info={}){return {active:false,allowed:false,total:null,breakdown:'',...info,reason}}
function toolRequestRestriction(options){if(!ABILITIES.includes(options.ability))return 'ability-required';if(!['normal','adv','dis'].includes(options.mode||'normal'))return 'invalid-mode';if(options.usingThisItem!==true)return 'using-item-required';if((S.cond||{}).Frightened&&typeof options.fearSourceInSight!=='boolean')return 'fear-declaration-required';if(S.hp===0||INCAP.some(name=>(S.cond||{})[name]))return 'cannot-use-tool';return ''}
export function currentToolCheck(index,options={}){
 const item=Number.isInteger(index)&&(C.inv||[])[index],profile=item&&toolFormMetadata(item.key||item.n),form=item&&normalizeToolForm(item.toolForm);
 if(!profile)return toolBlocked('tool-source-unavailable');if(!form)return toolBlocked('unsupported-tool-form');
 const tool=form.tool,name=toolName(item,form),label='Using this '+item.n+' as '+name,pb=freshToolPb(),base=toolFormCheck(item,tool,0,pb,toolCharacter(),{usingThisItem:true}),info={tool,label,pb,multiplier:base&&base.proficiencyMultiplier,sourceEligible:!!(base&&base.active)};
 if(!base||!base.active)return toolBlocked('tool-source-unavailable',info);if(base.reviewRequired)return toolBlocked(base.reason,info);
 const restriction=toolRequestRestriction(options);if(restriction)return toolBlocked(restriction,info);
 const score=currentAbilityScores()[options.ability];if(!Number.isFinite(score))return toolBlocked('ability-unavailable',info);
 const abilityModifier=Math.floor((score-10)/2),check=toolFormCheck(item,tool,abilityModifier,pb,toolCharacter(),{usingThisItem:true}),conditions=toolConditions(options.ability,options),total=check.total+conditions.penalty;
 return {...info,active:true,allowed:true,reason:'',abilityModifier,score,total,...conditions,breakdown:options.ability+' '+score+' ('+signed(abilityModifier)+') + '+check.proficiencyMultiplier+' × PB '+pb+(conditions.penalty?' '+signed(conditions.penalty)+' Exhaustion':'')+' = '+signed(total)};
}
function toolInventorySignature(){return JSON.stringify((C.inv||[]).map(item=>item&&({n:item.n,key:item.key,q:item.q,attuned:item.attuned,attunedActive:item.attunedActive,toolForm:item.toolForm})))}
function toolOccurrence(index,key){return (C.inv||[]).slice(0,index).filter(item=>item&&(item.key||item.n)===key).length}
export function createToolCheckSession(index,root){const item=Number.isInteger(index)&&(C.inv||[])[index];if(!item||!root||!toolFormMetadata(item.key||item.n))return null;const key=item.key||item.n,session={index,root,item,key,occurrence:toolOccurrence(index,key),character:C,state:S,owner:C.name,inventorySignature:toolInventorySignature(),rolling:false};sessions.add(session);return session}
function toolSessionCurrent(view){return sessions.has(view)&&view.character===C&&view.state===S&&view.owner===C.name&&sheetRootActive(view.root)&&(C.inv||[])[view.index]===view.item&&(view.item.key||view.item.n)===view.key&&toolOccurrence(view.index,view.key)===view.occurrence&&toolInventorySignature()===view.inventorySignature}
function toolRollSignature(check,options){return JSON.stringify({check,options})}
function toolRollReply(view,onResult,response){if(typeof onResult==='function')onResult({...response,owner:view.owner,index:view.index,character:view.character,state:view.state})}
function toolRollGuard(roll){if(roll.cancelled||roll.completed)return false;const {view,options,check,onResult}=roll;if(!toolSessionCurrent(view)){view.rolling=false;roll.cancelled=true;return false}const fresh=currentToolCheck(view.index,options);if(!fresh.allowed||toolRollSignature(fresh,options)!==toolRollSignature(check,options)){view.rolling=false;roll.cancelled=true;toolRollReply(view,onResult,{ok:false,reason:'stale-tool-check',check:fresh});return false}return true}
function toolRollCallback(roll,result){if(!toolRollGuard(roll))return;roll.completed=true;roll.view.rolling=false;toolRollReply(roll.view,roll.onResult,{ok:true,result,check:roll.check})}
export function requestToolCheckRoll(request){
 const view=request&&request.session;if(!toolSessionCurrent(view))return {ok:false,reason:'stale-tool-check'};if(view.rolling)return {ok:false,reason:'roll-pending'};
 const options={ability:request.ability,usingThisItem:request.usingThisItem,mode:request.mode||'normal',fearSourceInSight:request.fearSourceInSight},check=currentToolCheck(view.index,options);
 if(!check.allowed||!('mode' in check)||!('label' in check))return {ok:false,reason:check.reason,check};if(!env.__miRoll||typeof env.__miRoll.roll!=='function')return {ok:false,reason:'dice-unavailable'};
 const roll={view,options,check,onResult:request.onResult,cancelled:false,completed:false};view.rolling=true;try{env.__miRoll.roll({bon:check.total},check.mode,check.label,result=>toolRollCallback(roll,result),()=>toolRollGuard(roll))}catch(error){view.rolling=false;return {ok:false,reason:'dice-failed'}}return {ok:true,pending:view.rolling,check};
}
