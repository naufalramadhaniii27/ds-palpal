/* Current-actor repair capability; derived profiles never replace live source checks. */
import {evaluateObjectRepair,mendingRepairSpec,repairSpecProblems} from "../../data/lib/object-repair.js";
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function repairSourceValid(source){return object(source)&&typeof source.item==='string'&&!!source.item&&typeof source.grantsKnowledge==='boolean'&&typeof source.requiresAttunement==='boolean'&&['attuned','wielded','unattuned'].includes(source.itemState)&&!repairSpecProblems({spell:'Mending',maxBreakFeet:source.maxBreakFeet}).length}
function repairSourceItemActive(item,source){const quantity=item.q==null?1:parseFloat(item.q);if(!Number.isFinite(quantity)||quantity<=0)return false;const desired=item.attuned===true,effective=desired&&item.attunedActive!==false;if(source.requiresAttunement&&!effective)return false;if(source.itemState==='attuned')return effective;if(source.itemState==='unattuned')return item.eq===true&&!effective;return item.eq===true}
function repairSourceState(character,source){const items=(character.inv||[]).filter(it=>it&&(it.key||it.n)===source.item);return {source,items:items.map(it=>({key:it.key||it.n,q:it.q,attuned:it.attuned,attunedActive:it.attunedActive,eq:source.itemState==='attuned'?undefined:it.eq})),active:items.some(it=>repairSourceItemActive(it,source))}}
export function resolveObjectRepairProfile(character,spell){
 const unavailable={known:false,eligible:false,spec:mendingRepairSpec(),sources:[],signature:'',reason:'repair-profile-unavailable'};
 if(!character||!spell||spell.n!=='Mending'||spell.l!==0)return unavailable;
 if(spell.itc&&spell.itc.c!==0)return {...unavailable,reason:'unsupported-repair-payment'};
 if(spell.ct&&spell.ct!=='1 minute'||spell.itc&&['Lyre of Building','Needle of Mending'].includes(spell.itc.it))return {...unavailable,reason:'unsupported-repair-source'};
 const profile=spell.objectRepair;if(!object(profile)||profile.spell!=='Mending'||typeof profile.baseKnown!=='boolean'||!Array.isArray(profile.sources)||profile.sources.some(source=>!repairSourceValid(source)))return unavailable;
 const states=profile.sources.map(source=>repairSourceState(character,source)),sources=states.filter(state=>state.active).map(state=>state.source),known=profile.baseKnown||sources.some(source=>source.grantsKnowledge),spec=mendingRepairSpec(sources.map(source=>({spell:'Mending',maxBreakFeet:source.maxBreakFeet})));
 return {known,eligible:known,spec,sources,signature:JSON.stringify({baseKnown:profile.baseKnown,states,spec}),reason:known?'':'spell-source-unavailable'};
}
export function evaluateRepairRequest(profile,target,declarations,raging){
 if(raging)return {ok:false,reason:'rage'};
 if(!object(declarations)||declarations.components!==true||declarations.equipment!==true||declarations.castingTimeComplete!==true)return {ok:false,reason:'casting-declarations-required'};
 if(!profile||!profile.known)return {ok:false,reason:profile&&profile.reason||'spell-source-unavailable'};
 return evaluateObjectRepair(profile.spec,target,{currentKnownSpell:true,castEligible:true});
}
