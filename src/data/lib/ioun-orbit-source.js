import {IOUN_PROFILES,IOUN_GENERIC_FINGERPRINT,IOUN_RESERVE_FINGERPRINT} from './ioun-orbit-profiles.js';
import {createIounOrbit,iounOrbitProblems,iounOrbitAvailability,settleIounSourceLoss} from './ioun-orbit.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),clone=structuredClone;
const GENERIC='Ioun Stone',NATIVE=[...Object.entries(IOUN_PROFILES).map(([profile,definition])=>({profile,definition,row:JSON.parse(definition.fingerprint)})),{profile:'dmg2024-ioun-reserve',definition:{fingerprint:IOUN_RESERVE_FINGERPRINT,passive:false},row:JSON.parse(IOUN_RESERVE_FINGERPRINT)}],CONFLICTS=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses'];
export function canonicalIounDefinition(value){if(Array.isArray(value))return '['+value.map(canonicalIounDefinition).join(',')+']';if(obj(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalIounDefinition(value[k])).join(',')+'}';return JSON.stringify(value);}
export function iounOrbitItemName(name){return name===GENERIC||name==='Ioun Stone (reserve)'||NATIVE.some(entry=>entry.row[0]===name);}
export function iounNativeSources(rows){
 if(!Array.isArray(rows))return [];const expected=[{profile:'dmg2024-ioun-generic',definition:{fingerprint:IOUN_GENERIC_FINGERPRINT,passive:false},row:JSON.parse(IOUN_GENERIC_FINGERPRINT)},...NATIVE];
 return expected.flatMap(entry=>{const matches=rows.filter(row=>Array.isArray(row)&&row[0]===entry.row[0]);if(matches.length!==1||canonicalIounDefinition(matches[0])!==entry.definition.fingerprint)return [];return [{item:entry.row[0],kind:entry.profile.slice('dmg2024-ioun-'.length),nativeProfile:entry.profile,itemFingerprint:entry.definition.fingerprint,passive:entry.definition.passive,generic:entry.row[0]===GENERIC,row:clone(matches[0])}];});
}
export function iounSource(sources,item){if(!Array.isArray(sources))return null;const matches=sources.filter(source=>source.item===item);return matches.length===1?clone(matches[0]):null;}
export function iounMarker(stone,source){return stone&&source&&stone.profile===source.nativeProfile&&stone.origin?.childFingerprint===source.itemFingerprint?{v:1,id:stone.id,nativeProfile:stone.profile,itemFingerprint:source.itemFingerprint,parentFingerprint:stone.origin.parentFingerprint}:null;}
export function iounMarkerSource(marker,sources,item){
 if(!exact(marker,['v','id','nativeProfile','itemFingerprint','parentFingerprint'])||marker.v!==1||typeof marker.id!=='string'||!/^io-[1-9]\d*$/.test(marker.id))return null;
 const selected=sources.filter(source=>source.nativeProfile===marker.nativeProfile&&source.itemFingerprint===marker.itemFingerprint&&!source.generic);if(selected.length!==1||selected[0].kind==='reserve')return null;
 const parent=marker.parentFingerprint;if(parent!==null&&parent!==IOUN_GENERIC_FINGERPRINT)return null;
 if(item===GENERIC){const generic=iounSource(sources,GENERIC);return parent!==null&&generic?.itemFingerprint===parent?clone(selected[0]):null;}
 return item===selected[0].item?clone(selected[0]):null;
}
export function selectGenericIounSubtype(row,profile,sources,facts){
 if(!obj(row)||!exact(facts,['actualPhysicalTypeVerified','actualCurrentlyStowedVerified'])||facts.actualPhysicalTypeVerified!==true||facts.actualCurrentlyStowedVerified!==true)return {ok:false,reason:'actual-stowed-original-ioun-type-required'};
 if((own(row,'key')?row.key:row.n)!==GENERIC||(row.q==null?1:row.q)!==1||own(row,'iounOrbit')||CONFLICTS.some(field=>own(row,field)))return {ok:false,reason:'unrecorded-single-generic-ioun-required'};
 const parent=iounSource(sources,GENERIC),children=sources.filter(source=>source.nativeProfile===profile&&!source.generic);if(!parent||children.length!==1)return {ok:false,reason:'original-ioun-subtype-unavailable'};const source=children[0];if(source.kind==='reserve')return {ok:false,reason:'use-existing-reserve-source-controls'};
 const next=clone(row);next.n=source.item;delete next.key;return {ok:true,row:next,source:clone(source),origin:{kind:'generic-factual-selection',parentFingerprint:parent.itemFingerprint,childFingerprint:source.itemFingerprint}};
}
function identityMatches(stone,marker,source){return marker.id===stone.id&&marker.nativeProfile===stone.profile&&marker.itemFingerprint===stone.origin.childFingerprint&&marker.parentFingerprint===stone.origin.parentFingerprint&&source.nativeProfile===stone.profile;}
function currentNativeName(row){return own(row,'key')?row.key:row.n;}
function sourceShape(value){if(value===null)return ['null'];if(typeof value!=='object')return [typeof value,String(value)];return [Array.isArray(value)?'array':'object',Reflect.ownKeys(value).map(key=>[typeof key,String(key),sourceShape(value[key])])];}
function sameSourcePayload(a,b){return JSON.stringify(sourceShape(a))===JSON.stringify(sourceShape(b));}
function currentReserve(row,source){return currentNativeName(row)==='Ioun Stone (reserve)'||source?.kind==='reserve'||row.storedSpells?.profile==='reserve-2024';}
function sourceStatus(ATT,index){const status=ATT?.rows?.[index];return status&&status.requires===true&&typeof status.attuned==='boolean'?status:null;}
function boundSource(stone,inventory,catalog,ATT,customItems,opaque){
 const matches=inventory.map((row,index)=>({row,index})).filter(entry=>entry.row?.iounOrbit?.id===stone.id);
 if(!matches.length)return opaque?null:{id:stone.id,profile:stone.profile,sourceFingerprint:stone.origin.childFingerprint,present:false,allocatedAttunement:false};if(matches.length!==1)return null;
 const {row,index}=matches[0],source=iounMarkerSource(row.iounOrbit,catalog,currentNativeName(row)),q=row.q==null?1:row.q;if(!source||!identityMatches(stone,row.iounOrbit,source)||!Number.isSafeInteger(q)||q<0||CONFLICTS.some(field=>own(row,field))||customItems.some(item=>item.n===currentNativeName(row)))return null;
 if(q===0)return {id:stone.id,profile:stone.profile,sourceFingerprint:stone.origin.childFingerprint,present:false,allocatedAttunement:false};const status=sourceStatus(ATT,index);if(!status)return null;
 return {id:stone.id,profile:stone.profile,sourceFingerprint:source.itemFingerprint,present:true,allocatedAttunement:status.attuned};
}
export function iounContext({state,inventory,allocatedATT,catalog,customItems=[]}){
 if(iounOrbitProblems(state).length||!Array.isArray(inventory)||!Array.isArray(catalog)||!Array.isArray(customItems))return null;
 let unresolved=false,reserveStatus='none',mixedEditionOccupancy='none';const opaque=inventory.some(row=>obj(row)&&own(row,'iounOrbit')&&!iounMarkerSource(row.iounOrbit,catalog,currentNativeName(row)));
 const sources=[];for(const stone of state.stones){const source=boundSource(stone,inventory,catalog,allocatedATT,customItems,opaque);if(!source){unresolved=true;continue;}sources.push(source);const actual=inventory.find(row=>row?.iounOrbit?.id===stone.id);if(stone.orbiting&&source.present&&source.allocatedAttunement&&actual?.eq!==true)unresolved=true;}
 inventory.forEach((row,index)=>{if(!obj(row)){unresolved=true;return;}const name=currentNativeName(row),q=row.q==null?1:row.q,status=sourceStatus(allocatedATT,index),source=iounSource(catalog,name);if(!Number.isSafeInteger(q)||q<0){if(iounOrbitItemName(name))unresolved=true;return;}if(q===0)return;
 if(/^Ioun Stone, /.test(name)&&status?.attuned)mixedEditionOccupancy='unresolved';
 if(currentReserve(row,source)&&status?.attuned)reserveStatus='unresolved';
 if(!iounOrbitItemName(name))return;if(!source)unresolved=true;if(own(row,'iounOrbit')&&!iounMarkerSource(row.iounOrbit,catalog,name)){unresolved=true;return;}if(status?.attuned&&!currentReserve(row,source)&&!state.stones.some(stone=>stone.id===row.iounOrbit?.id))unresolved=true;
 });return {edition:'2024',sources,unresolvedCurrentOrbit:unresolved,reserveStatus,mixedEditionOccupancy};
}
export function reconcileIounInventory(previous,next,state,ATT,catalog,customItems=[]){
 if(iounOrbitProblems(state).length)return {ok:false,reason:'unsupported-ioun-orbit-history'};if(!Array.isArray(previous)||!Array.isArray(next))return {ok:false,reason:'unsupported-ioun-inventory'};
 for(const row of previous){if(!obj(row)||!own(row,'iounOrbit'))continue;const p=state.stones.find(stone=>stone.id===row.iounOrbit?.id),item=currentNativeName(row);if(iounMarkerSource(row.iounOrbit,catalog,item))continue;if(!p&&!iounOrbitItemName(item))continue;if(!next.some(value=>obj(value)&&currentNativeName(value)===item&&own(value,'iounOrbit')&&sameSourcePayload(value.iounOrbit,row.iounOrbit)))return {ok:false,reason:'unsupported-current-ioun-source'};}
 const context=iounContext({state,inventory:next,allocatedATT:ATT,catalog,customItems});if(!context)return {ok:false,reason:'unsupported-ioun-source-context'};
 const ids=context.sources.filter(source=>(!source.present||!source.allocatedAttunement)&&state.stones.some(stone=>stone.id===source.id&&stone.orbiting)).map(source=>source.id);if(!ids.length)return {ok:true,changed:false,authority:clone(state),inventory:clone(next),context};const settled=settleIounSourceLoss(state,ids,context);if(!settled.ok)return settled;return {ok:true,changed:canonicalIounDefinition(settled.state)!==canonicalIounDefinition(state),authority:settled.state,inventory:clone(next),context};
}

function potentialCurrentIoun(character){
 const names=NATIVE.filter(entry=>entry.definition.passive).map(entry=>entry.row[0]),tag=value=>typeof value==='string'&&names.some(name=>value===name||value.startsWith(name+' ('));
 if((Array.isArray(character.inv)?character.inv:[]).some(row=>obj(row)&&(names.includes(currentNativeName(row))||NATIVE.some(entry=>entry.definition.passive&&row.iounOrbit?.nativeProfile===entry.profile))))return true;
 if(Object.values(character.abilities||{}).some(ability=>(Array.isArray(ability?.bonus)?ability.bonus:[]).some(row=>tag(row?.s))))return true;
 return (Array.isArray(character.ac?.bonus)?character.ac.bonus:[]).some(row=>tag(row?.s))||(Array.isArray(character.itemAdv)?character.itemAdv:[]).some(row=>tag(row?.s));
}
function qualifiedMathSources(character,namespace,ids){const catalog=iounNativeSources([JSON.parse(IOUN_GENERIC_FINGERPRINT),...NATIVE.map(entry=>entry.row)]);return ids.every(id=>{const stone=namespace.stones.find(stone=>stone.id===id),rows=character.inv.filter(row=>row?.iounOrbit?.id===id);if(!stone||rows.length!==1)return false;const row=rows[0],source=iounMarkerSource(row.iounOrbit,catalog,currentNativeName(row));return !!source&&identityMatches(stone,row.iounOrbit,source)&&!CONFLICTS.some(field=>own(row,field))&&(row.q==null?1:row.q)===1&&row.eq===true&&row.attunedActive===true;});}
export function iounCharacterMathStatus(character,state){
 if(!obj(character)||!potentialCurrentIoun(character))return {reviewRequired:false,reason:null};
 if(!Array.isArray(character.inv))return {reviewRequired:true,reason:'invalid-ioun-character-inventory'};
 const hasC=own(character,'iounOrbit'),hasS=own(state,'iounOrbit');
 if(hasC!==hasS)return {reviewRequired:true,reason:'ioun-orbit-character-state-mismatch'};
 const namespace=hasS?state.iounOrbit:createIounOrbit();if(iounOrbitProblems(namespace).length||hasC&&(iounOrbitProblems(character.iounOrbit).length||!sameSourcePayload(character.iounOrbit,namespace)))return {reviewRequired:true,reason:'unsupported-ioun-orbit-character-history'};
 const witness=character.iounOrbitSources;if(!exact(witness,['v','context','inventoryFingerprint'])||witness.v!==1||typeof witness.inventoryFingerprint!=='string')return {reviewRequired:true,reason:'legacy-ioun-native-review-required'};
 if(witness.inventoryFingerprint!==canonicalIounDefinition(character.inv))return {reviewRequired:true,reason:'invalid-ioun-native-source-witness'};const availability=iounOrbitAvailability(namespace,witness.context);if(!availability.ok||!('qualifiedIds' in availability)||!qualifiedMathSources(character,namespace,availability.qualifiedIds))return {reviewRequired:true,reason:'invalid-ioun-native-source-witness'};
 return {reviewRequired:false,reason:null};
}
