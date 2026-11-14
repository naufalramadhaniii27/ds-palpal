/* Native component/source projection only. S.used is the sole charge balance. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx} from './00-env.js';
import {travelGoatProblems,travelGoatProjection} from '../data/lib/travel-goat.js';
import {travelGoatNativeSources,travelGoatItemName,travelGoatMarkerSource,travelGoatPhysicalBinding,travelGoatPhysicalSource,travelGoatBudget,travelGoatResource,travelGoatLegacyCounterWitness,travelGoatSourceWitnessProblems,travelGoatOpaqueInventoryPreserved,reconcileTravelGoatInventory} from '../data/lib/travel-goat-source.js';
import {canonicalTravelGoatDefinition} from '../data/lib/travel-goat-profile.js';
export {reconcileTravelGoatInventory};
let scope=null,legacyComparison=false;const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
function build(){return lateGet('B');}
function owned(){const live=sheetState();return live?.C&&build()?.cid&&build().cid===genv.__sheetId?.()?live:null;}
function cloneOwn(value){if(value===null||typeof value!=='object')return value;const out=Array.isArray(value)?[]:{};for(const k of Reflect.ownKeys(value)){if(Array.isArray(value)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(value,k);if(own(d,'value'))d.value=cloneOwn(d.value);Object.defineProperty(out,k,d);}return out;}
export function travelGoatCatalog(){return travelGoatNativeSources(lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]),{legacyBookRows:genv.WXI?.dmg14,customItems:build()?.custLib||[],fxOverrides:fxo()||{},gxItems:gx().item||{},resolvedRows:lateGet('DMAP')});}
export function withTravelGoatProjection(state,run,usedOverride=undefined){const previous=scope;scope={state,used:usedOverride};try{return run()}finally{scope=previous;}}
export function travelGoatOwnedUsed(){return scope?.used!==undefined?scope.used:owned()?.state?.used;}
export function travelGoatOwnedState(){
 const live=owned();if(live&&own(live.C,'travelGoat')&&travelGoatProblems(live.C.travelGoat).length)return live.C.travelGoat;
 if(live&&own(live.state,'travelGoat')&&travelGoatProblems(live.state.travelGoat).length)return live.state.travelGoat;
 if(scope)return scope.state;const state=live&&own(live.state,'travelGoat')?live.state.travelGoat:undefined;
 if(travelGoatProblems(state).length)return state;const result=reconcileTravelGoatInventory(live.C.inv||[],build()?.inv||[],state,live.state.used);return result.ok?result.authority:state;
}
export function travelGoatOwnFuture(){const live=owned();if(opaqueFrame(live))return own(live.C,'travelGoat');return !!scope&&scope.state!==undefined&&travelGoatProblems(scope.state).length>0;}
export function travelGoatProjectionMirror(){if(legacyComparison)return undefined;const live=owned();if(opaqueFrame(live))return own(live.C,'travelGoat')?cloneOwn(live.C.travelGoat):undefined;const state=travelGoatOwnedState();return state===undefined?undefined:cloneOwn(state);}
export function travelGoatRelevant(){if(legacyComparison)return false;const live=owned();return (build()?.inv||[]).some(row=>row&&(travelGoatItemName(key(row))||own(row,'travelGoat')))||!!live&&(['travelGoat','travelGoatSources'].some(k=>own(live.C,k))||own(live.state,'travelGoat'));}
export function travelGoatAllocatedKeys(){const state=travelGoatOwnedState();return travelGoatProblems(state).length?[]:state.physical.map(p=>p.budgetKey);}
function unsupportedRaw(row,live){
 if(!own(row,'travelGoat')||!(build()?.inv||[]).some(candidate=>key(candidate)===key(row)))return false;const state=live.state?.travelGoat;
 return travelGoatProblems(state).length>0||!travelGoatPhysicalBinding(row,state,travelGoatCatalog(),live.C.inv||[]);
}
function rawIdentity(row){return {item:key(row),q:row.q??1,eq:row.eq===true};}
export function travelGoatInventoryRows(rows){
 const live=owned();if(!live||!Array.isArray(rows))return rows;let out=rows;
 (live.C.inv||[]).forEach((row,index)=>{
  if(!unsupportedRaw(row,live))return;const next=rows[index];
  if(!next||rows.filter(candidate=>key(candidate)===key(row)).length!==1||bytes(rawIdentity(row))!==bytes(rawIdentity(next)))throw Error('Unknown Traveling physical source moved or changed.');
  if(out===rows)out=rows.slice();out[index]=cloneOwn(next);Object.defineProperty(out[index],'travelGoat',Object.getOwnPropertyDescriptor(cloneOwn(row),'travelGoat'));
 });return out;
}
function sourceFrame(){const state=travelGoatOwnedState();return {state,used:travelGoatOwnedUsed(),sources:travelGoatCatalog(),inventory:build()?.inv||[]};}
function supportedWitness(value){return travelGoatSourceWitnessProblems(value).length===0;}
function budgetFault(live){
 const state=scope?scope.state:live.state?.travelGoat;if(travelGoatProblems(state).length)return false;
 return !budgetHistoryKnown(state,scope?.used!==undefined?scope.used:live.state.used);
}
function opaqueFrame(live=owned()){
 if(!live)return false;
 return (own(live.C,'travelGoat')&&travelGoatProblems(live.C.travelGoat).length>0)||(own(live.state,'travelGoat')&&travelGoatProblems(live.state.travelGoat).length>0)||(own(live.C,'travelGoatSources')&&!supportedWitness(live.C.travelGoatSources))||(live.C.inv||[]).some(row=>unsupportedRaw(row,live))||budgetFault(live);
}
function futureWitness(){const live=owned();return opaqueFrame(live)&&own(live.C,'travelGoatSources')?{value:live.C.travelGoatSources}:null;}
export function travelGoatSourcesOwnFuture(){const live=owned();return opaqueFrame(live)&&own(live.C,'travelGoatSources');}
function rawTravelSlice(rows){
 return (rows||[]).filter(row=>travelGoatItemName(key(row))||own(row,'travelGoat')).map(row=>({item:key(row),q:row.q??1,eq:row.eq===true,hasMarker:own(row,'travelGoat'),marker:row.travelGoat}));
}
function opaqueRawUnchanged(live){const before=bytes(rawTravelSlice(live.C.inv)),after=bytes(rawTravelSlice(travelGoatInventoryRows(build()?.inv||[])));return before!==null&&before===after;}
function opaqueLegacyIndices(rows,sources){return rows.flatMap((row,index)=>own(row,'travelGoat')&&sources.some(source=>source.edition==='legacy'&&source.item===key(row))?[index]:[]);}
function legacyCounterProof(row,index,resources){
 const item=key(row),old=resources.filter(r=>r?.item===1&&!own(r,'travelGoat')&&r.f===item&&r.max===24);if(!old.length)return null;
 const proof=travelGoatLegacyCounterWitness(row,index,resources);if(!proof)throw Error('The original Traveling counter cannot be attributed to this physical source.');return proof;
}
function preserveOpaqueResources(resources,live){
 if(!opaqueRawUnchanged(live))throw Error('Unsupported Traveling source changed. Review before rebuilding.');
 const current=Array.isArray(live.C.res)?live.C.res:[],sources=travelGoatCatalog(),newIndices=opaqueLegacyIndices(build()?.inv||[],sources);
 const kept=current.filter(row=>own(row,'travelGoat'));
 newIndices.forEach(index=>legacyCounterProof(build().inv[index],index,resources));
 const fresh=resources.filter(row=>!own(row,'travelGoat')&&!(row?.item===1&&row.max===24&&newIndices.includes(row.invIndex)&&sources.some(source=>source.edition==='legacy'&&source.item===row.f)));
 if(fresh.some(row=>kept.some(old=>old.k===row.k)))throw Error('Unknown Traveling resource key conflicts with the current native source.');
 return fresh.concat(kept.map(cloneOwn));
}

export function travelGoatProjectResources(inventory,resources){
 if(!travelGoatRelevant()||!Array.isArray(resources))return resources;const live=owned();if(opaqueFrame(live))return preserveOpaqueResources(resources,live);const frame=sourceFrame();if(travelGoatProblems(frame.state).length)return resources;
 let result=resources.slice();
 frame.inventory.forEach((row,index)=>{
  const binding=travelGoatPhysicalBinding(row,frame.state,frame.sources,frame.inventory);if(!binding)return;
  if(binding.source.edition==='legacy'){const proof=legacyCounterProof(row,index,result);if(proof)result=result.filter(r=>!(r.k===proof.key&&r.invIndex===proof.sourceIndex&&r.max===24&&r.f===binding.source.item));}
  const physical=travelGoatPhysicalSource(row,frame.state,frame.sources,frame.used,frame.inventory);if(!physical)return;
  const resource=travelGoatResource(physical.physical,index);if(!resource)return;
  resource.reviewRequired=physical.projection.reviewRequired;resource.inactive=!physical.projection.present;
  result.push(resource);
 });
 return result;
}
export function travelGoatSourceWitness(inventory,resources){
 if(!travelGoatRelevant())return undefined;const live=owned();if(opaqueFrame(live)){if(!opaqueRawUnchanged(live))throw Error('Unsupported Traveling source changed.');return own(live.C,'travelGoatSources')?cloneOwn(live.C.travelGoatSources):undefined;}const frame=sourceFrame();
 const rows=frame.inventory.flatMap((row,index)=>{const physical=travelGoatPhysicalSource(row,frame.state,frame.sources,frame.used,frame.inventory);return physical&&Array.isArray(resources)&&resources.some(r=>r?.k===physical.physical.budgetKey&&r?.travelGoat?.id===physical.physical.id)?[{id:physical.physical.id,index,nativeProfile:physical.physical.profile,budgetKey:physical.physical.budgetKey}]:[];});
 return {v:1,inventoryFingerprint:canonicalTravelGoatDefinition(inventory),resourceFingerprint:canonicalTravelGoatDefinition(resources),rows};
}
export function travelGoatLegacySourcesSafe(){const live=owned();if(live&&(own(live.C,'travelGoat')||own(live.C,'travelGoatSources')||own(live.state,'travelGoat')))return false;const rows=build()?.inv||[];if(rows.some(row=>own(row,'travelGoat')))return false;const sources=travelGoatCatalog();return rows.every(row=>!travelGoatItemName(key(row))||sources.some(s=>s.item===key(row)));}
export function withTravelGoatLegacyComparison(run){if(!travelGoatLegacySourcesSafe())throw Error('Review the original Traveling component source.');const previous=legacyComparison;legacyComparison=true;try{return run()}finally{legacyComparison=previous;}}
const APPLY_PLANS=new WeakMap();
function bytes(value){return canonicalTravelGoatDefinition(value);}
function futureFieldPreserved(current,candidate,field){
 if(!own(current,field))return true;const valid=field==='travelGoat'?!travelGoatProblems(current[field]).length:supportedWitness(current[field]);
 return valid||own(candidate,field)&&bytes(current[field])!==null&&bytes(current[field])===bytes(candidate[field]);
}
function budgetHistoryKnown(state,used){return state.physical.every(physical=>{const budget=travelGoatBudget(physical,used);return budget.ok&&travelGoatProjection(state,physical.id,budget.budget).ok;});}
function unsupportedAuthorityPreserved(live,candidate,state){
 const expected=own(live.C,'travelGoat')?live.C.travelGoat:state;
 return own(candidate,'travelGoat')&&bytes(expected)!==null&&bytes(candidate.travelGoat)===bytes(expected);
}
function applyPayload(candidate){
 const live=owned(),B=build();if(!live)return {ok:true,changed:false,build:B};
 if(!candidate||!Array.isArray(candidate.inv)||!travelGoatOpaqueInventoryPreserved(live.C.inv||[],B.inv||[],live.state?.travelGoat))return {ok:false,reason:'traveling-source-history-must-be-preserved'};
 if(!['travelGoat','travelGoatSources'].every(field=>futureFieldPreserved(live.C,candidate,field)))return {ok:false,reason:'unsupported-traveling-source-must-be-preserved'};
 if(!own(live.state,'travelGoat'))return own(live.C,'travelGoat')&&!travelGoatProblems(live.C.travelGoat).length?{ok:false,reason:'traveling-authority-required'}:{ok:true,changed:false,build:B};
 const state=live.state.travelGoat;
 if(travelGoatProblems(state).length)return unsupportedAuthorityPreserved(live,candidate,state)?{ok:true,changed:false,build:B}:{ok:false,reason:'unsupported-traveling-history'};
 if(!budgetHistoryKnown(state,live.state.used))return {ok:false,reason:'canonical-travel-charge-history-required'};
 const next=reconcileTravelGoatInventory(live.C.inv||[],B.inv||[],state,live.state.used);if(!next.ok)return next;
 if(!own(candidate,'travelGoat')||bytes(candidate.travelGoat)!==bytes(next.authority))return {ok:false,reason:'latest-traveling-authority-required'};
 return {ok:true,changed:false,build:B,authority:next.authority};
}
export function travelGoatApplyPlan(candidate){
 const live=sheetState(),B=build(),signature=bytes([live?.C,live?.state,B,candidate]),result=applyPayload(candidate);if(!result.ok)return result;
 if(signature===null||signature!==bytes([sheetState()?.C,sheetState()?.state,build(),candidate]))return {ok:false,reason:'stale-traveling-apply-frame'};
 APPLY_PLANS.set(result,{C:live?.C,S:live?.state,B,candidate,signature,cid:genv.__sheetId?.(),readOnly:live?.readOnly});return result;
}
export function travelGoatApplyCurrent(plan,phase='pending'){
 const ticket=APPLY_PLANS.get(plan),live=sheetState();return !!(ticket&&['pending','committed'].includes(phase)&&live?.C===ticket.C&&live?.state===ticket.S&&build()===ticket.B&&genv.__sheetId?.()===ticket.cid&&live?.readOnly===ticket.readOnly&&bytes([live.C,live.state,build(),ticket.candidate])===ticket.signature);
}
