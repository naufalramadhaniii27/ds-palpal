/* Source authority is the actual native catalog and physical component, never a display name. */
import {travelGoatProfile,travelGoatProfiles,canonicalTravelGoatDefinition} from './travel-goat-profile.js';
import {travelGoatBudgetKey,travelGoatProblems,travelGoatProjection,recordTravelGoatPresence} from './travel-goat.js';
export {travelGoatBudgetKey};
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k),obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const key=row=>own(row,'key')?row.key:row?.n;
export function travelGoatItemName(name){return travelGoatProfiles().some(p=>p.item===name);}
function original(rows,p){if(!Array.isArray(rows))return false;const matches=rows.filter(row=>Array.isArray(row)&&row[0]===p.item);return matches.length===1&&canonicalTravelGoatDefinition(matches[0])===canonicalTravelGoatDefinition(JSON.parse(p.itemFingerprint));}
function resolvedOriginal(rows,p){const property=obj(rows)&&Object.getOwnPropertyDescriptor(rows,p.item);return !!property&&own(property,'value')&&canonicalTravelGoatDefinition(property.value)===canonicalTravelGoatDefinition(JSON.parse(p.itemFingerprint));}
export function travelGoatNativeSources(rows,{legacyBookRows=null,customItems=[],fxOverrides={},gxItems={},resolvedRows=null}={}){
 return travelGoatProfiles().filter(p=>resolvedOriginal(resolvedRows,p)&&original(rows,p)&&(p.edition!=='legacy'||original(legacyBookRows,p))&&!customItems.some(row=>(Array.isArray(row)?row[0]:row?.n)===p.item)&&!own(fxOverrides,p.item)&&!own(gxItems,p.item)).map(p=>({item:p.item,nativeProfile:p.id,itemFingerprint:p.itemFingerprint,parentFingerprint:p.parentFingerprint,component:'traveling',edition:p.edition,action:p.action}));
}
export function travelGoatSource(sources,profileId){const found=Array.isArray(sources)?sources.filter(s=>s.nativeProfile===profileId):[];return found.length===1?found[0]:null;}
export function travelGoatMarker(physical){return {v:1,id:physical.id,nativeProfile:physical.profile,itemFingerprint:physical.itemFingerprint,parentFingerprint:physical.parentFingerprint,component:'traveling'};}
export function travelGoatMarkerSource(marker,sources,item){
 const fields=['v','id','nativeProfile','itemFingerprint','parentFingerprint','component'];
 if(!obj(marker)||Reflect.ownKeys(marker).length!==fields.length||!fields.every(k=>own(marker,k)&&Object.getOwnPropertyDescriptor(marker,k)?.enumerable===true&&own(Object.getOwnPropertyDescriptor(marker,k),'value'))||marker.v!==1||typeof marker.id!=='string'||!/^tgp-[1-9][0-9]*$/.test(marker.id)||marker.component!=='traveling')return null;
 const source=travelGoatSource(sources,marker.nativeProfile);
 return source&&source.item===item&&source.itemFingerprint===marker.itemFingerprint&&source.parentFingerprint===marker.parentFingerprint?source:null;
}
export function travelGoatBudget(physical,used){
 if(!physical||!travelGoatBudgetKey(physical.budgetKey)||!obj(used))return {ok:false,reason:'canonical-travel-charge-budget-required'};
 if(!own(used,physical.budgetKey))return {ok:true,budget:{key:physical.budgetKey,used:null,max:24}};
 const property=Object.getOwnPropertyDescriptor(used,physical.budgetKey);if(!property?.enumerable||!own(property,'value'))return {ok:false,reason:'unsupported-travel-charge-history'};
 const value=property.value;if(!Number.isSafeInteger(value)||value<0||value>24)return {ok:false,reason:'unsupported-travel-charge-history'};
 return {ok:true,budget:{key:physical.budgetKey,used:value,max:24}};
}
export function travelGoatLegacyCounterWitness(row,index,resources){
 const profile=travelGoatProfile('legacy-goats');if(key(row)!==profile.item||!Number.isSafeInteger(index)||!Array.isArray(resources))return null;
 const found=resources.filter(r=>r?.item===1&&!own(r,'travelGoat')&&r.f===profile.item&&r.invIndex===index&&r.max===24&&r.reset==='none'&&typeof r.k==='string');
 return found.length===1?{key:found[0].k,sourceIndex:index,max:24,reset:'none',purpose:'suppress-original-managed-counter'}:null;
}
export function travelGoatResource(physical,index){
 const p=travelGoatProfile(physical?.profile);if(!p||!Number.isSafeInteger(index)||index<0||!travelGoatBudgetKey(physical.budgetKey))return null;
 return {k:physical.budgetKey,n:'Goat of Traveling charges',max:24,reset:'none',f:p.item,item:1,invIndex:index,tag:'Each actual hour or part of an hour in creature form costs one charge. Restore only after the verified seven-day wait.',travelGoat:{v:1,id:physical.id,nativeProfile:p.id,component:'traveling',budgetKey:physical.budgetKey}};
}

const foreign=['instrumentSpells','storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption'];
export function travelGoatPhysicalBinding(row,state,sources,inventory){
 if(travelGoatProblems(state).length||!obj(row)||foreign.some(k=>own(row,k))||(row.q??1)!==1)return null;
 const source=travelGoatMarkerSource(row.travelGoat,sources,key(row));if(!source)return null;
 const physical=state.physical.find(p=>p.id===row.travelGoat.id);if(!physical||canonicalTravelGoatDefinition(row.travelGoat)!==canonicalTravelGoatDefinition(travelGoatMarker(physical)))return null;
 if(!Array.isArray(inventory)||inventory.filter(r=>r?.travelGoat?.id===physical.id).length!==1)return null;
 return {physical,source};
}
export function travelGoatPhysicalSource(row,state,sources,used,inventory){
 const binding=travelGoatPhysicalBinding(row,state,sources,inventory);if(!binding)return null;
 const budget=travelGoatBudget(binding.physical,used);if(!budget.ok)return null;const projection=travelGoatProjection(state,binding.physical.id,budget.budget);
 return projection.ok?{...binding,budget:budget.budget,projection}:null;
}

function recordedRow(row,state){
 const marker=row?.travelGoat,physical=state.physical.find(p=>p.id===marker?.id),profile=physical&&travelGoatProfile(physical.profile);
 return !!physical&&key(row)===profile.item&&canonicalTravelGoatDefinition(marker)===canonicalTravelGoatDefinition(travelGoatMarker(physical));
}
function inventoryBindings(rows,state){
 if(!Array.isArray(rows))return null;const map=new Map();
 for(const row of rows){const id=row?.travelGoat?.id;if(!state.physical.some(p=>p.id===id))continue;if(map.has(id))return null;map.set(id,{row,valid:recordedRow(row,state),quantity:row.q??1});}
 return map;
}
function opaquePreserved(previous,next,state){
 return previous.every(row=>{
  if(!own(row,'travelGoat')||recordedRow(row,state))return true;
  const matches=next.filter(r=>key(r)===key(row));return !matches.length||matches.some(r=>own(r,'travelGoat')&&canonicalTravelGoatDefinition(row.travelGoat)!==null&&canonicalTravelGoatDefinition(r.travelGoat)===canonicalTravelGoatDefinition(row.travelGoat));
 });
}
export function reconcileTravelGoatInventory(previous,next,state,used){
 if(travelGoatProblems(state).length||!Array.isArray(previous)||!Array.isArray(next))return {ok:false,reason:'unsupported-travel-goat-history'};
 if(!opaquePreserved(previous,next,state))return {ok:false,reason:'unsupported-current-traveling-source'};
 const before=inventoryBindings(previous,state),after=inventoryBindings(next,state);if(!before||!after)return {ok:false,reason:'ambiguous-traveling-component'};
 let authority=state,changed=false;
 for(const physical of state.physical){
  const old=before.get(physical.id),incoming=after.get(physical.id);if(!old?.valid||old.quantity<=0)continue;
  if(incoming&&!incoming.valid)return {ok:false,reason:'unsupported-incoming-traveling-source'};
  if(incoming&&incoming.quantity>0)continue;
  const budget=travelGoatBudget(physical,used);if(!budget.ok)return budget;
  const status=travelGoatProjection(authority,physical.id,budget.budget);if(!status.ok)return status;if(!status.present)continue;
  const result=recordTravelGoatPresence(authority,physical.id,budget.budget,false,{actualPhysicalRemoved:true});if(!result.ok)return result;authority=result.state;changed=true;
 }
 return {ok:true,changed,authority};
}
export function travelGoatSourceWitnessProblems(value){
 const fields=['v','inventoryFingerprint','resourceFingerprint','rows'];
 if(!obj(value)||Reflect.ownKeys(value).length!==4||!fields.every(k=>own(value,k)&&Object.getOwnPropertyDescriptor(value,k)?.enumerable===true&&own(Object.getOwnPropertyDescriptor(value,k),'value'))||value.v!==1)return ['unsupported-source-witness'];
 if(typeof value.inventoryFingerprint!=='string'||typeof value.resourceFingerprint!=='string'||!Array.isArray(value.rows)||Reflect.ownKeys(value.rows).length!==value.rows.length+1||!Object.keys(value.rows).every((k,i)=>k===String(i)))return ['unsupported-source-frame'];
 const ids=new Set(),indices=new Set(),budgets=new Set();
 for(const row of value.rows){
  if(!obj(row)||Reflect.ownKeys(row).length!==4||!['id','index','nativeProfile','budgetKey'].every(k=>own(row,k)&&Object.getOwnPropertyDescriptor(row,k)?.enumerable===true&&own(Object.getOwnPropertyDescriptor(row,k),'value')))return ['unsupported-source-binding'];
  if(typeof row.id!=='string'||!/^tgp-[1-9][0-9]*$/.test(row.id)||!Number.isSafeInteger(row.index)||row.index<0||!travelGoatProfile(row.nativeProfile)||!travelGoatBudgetKey(row.budgetKey)||ids.has(row.id)||indices.has(row.index)||budgets.has(row.budgetKey))return ['unsupported-source-binding'];
  ids.add(row.id);indices.add(row.index);budgets.add(row.budgetKey);
 }
 return [];
}
export function travelGoatOpaqueInventoryPreserved(previous,next,state){if(!Array.isArray(previous)||!Array.isArray(next))return false;return opaquePreserved(previous,next,travelGoatProblems(state).length?{physical:[]}:state);}
