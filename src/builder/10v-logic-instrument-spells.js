/* Native original instrument identity, printed spells and sole S.used budgets. */
import {lateGet} from './01b-logic-late-ports.js';
import {QRY} from './01a-logic-query-registry.js';
import {genv,sheetState,fxo,gx,classDef} from './00-env.js';
import {castingSourcesProblems} from '../data/lib/casting-sources.js';
import {instrumentProfile,instrumentProfiles,instrumentProfileForItem,instrumentGenericRow,INSTRUMENT_GENERIC_ITEM,INSTRUMENT_GENERIC_FINGERPRINT,canonicalInstrumentDefinition as canonical} from '../data/lib/instrument-spell-profiles.js';
import {instrumentModel,createInstrumentSpells} from '../data/lib/instrument-spells.js';
import {instrumentSpellSource,instrumentSpellDefinition,instrumentSpellsMarker,instrumentSpellsRawState,instrumentSpellNeedsController} from '../data/lib/instrument-spells-source.js';
const MODEL=instrumentModel(instrumentProfiles()),own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
let scope=null,legacyComparison=false;
function build(){return lateGet('B');}
function live(){const value=sheetState();return value?.C&&build()?.cid===genv.__sheetId?.()?value:null;}
function copy(value){if(value===null||typeof value!=='object')return value;const out=Array.isArray(value)?[]:{};for(const k of Reflect.ownKeys(value)){if(Array.isArray(value)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(value,k);if(own(d,'value'))d.value=copy(d.value);Object.defineProperty(out,k,d);}return out;}
export function instrumentItemName(name){return name===INSTRUMENT_GENERIC_ITEM||!!instrumentProfileForItem(name);}
export function instrumentCatalog(){return instrumentProfiles().map(p=>({profile:p.id,item:p.item,itemFingerprint:p.itemFingerprint,grantsFingerprint:p.grantsFingerprint,parentFingerprints:p.parentFingerprints,grants:copy(p.grants)}));}
export function withInstrumentSpellsProjection(state,run,usedOverride=undefined){const old=scope;scope={state,used:usedOverride};try{return run();}finally{scope=old;}}
export function instrumentOwnedState(){if(scope)return scope.state;const owner=live();if(!owner||!own(owner.state,'instrumentSpells'))return undefined;const state=owner.state.instrumentSpells;if(MODEL.problems(state).length)return state;const next=reconcileInstrumentInventory(owner.C.inv||[],build().inv||[],state,owner.state.used||{});return next.ok?next.authority:state;}
export function instrumentOwnedUsed(){return scope?.used!==undefined?scope.used:live()?.state?.used;}
function knownState(){const state=instrumentOwnedState();return state===undefined?createInstrumentSpells():state;}
function exact(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>{const d=Object.getOwnPropertyDescriptor(value,key);return !!d&&d.enumerable&&own(d,'value');});}
export function instrumentSourceWitnessProblems(cap){try{
 if(!exact(cap,['v','inventoryFingerprint','resourceFingerprint','spellFingerprint','bindings'])||cap.v!==1||!['inventoryFingerprint','resourceFingerprint','spellFingerprint'].every(key=>typeof cap[key]==='string')||!Array.isArray(cap.bindings)||canonical(cap)===null)return ['unsupported-instrument-sources'];
 const ids=new Set(),indices=new Set();for(const b of cap.bindings){const p=instrumentProfile(b.profile);if(!exact(b,['id','index','profile','itemFingerprint','grantsFingerprint','parentFingerprint','spells'])||!p||ids.has(b.id)||indices.has(b.index)||!Number.isSafeInteger(b.index)||b.index<0||b.itemFingerprint!==p.itemFingerprint||b.grantsFingerprint!==p.grantsFingerprint)return ['unsupported-instrument-source'];ids.add(b.id);indices.add(b.index);}
 return [];
 }catch{return ['unsupported-instrument-sources'];}}
function supportedSources(cap){return instrumentSourceWitnessProblems(cap).length===0;}
export function instrumentSourceWitnessSupported(C){return supportedSources(C?.instrumentSpellSources)&&C.instrumentSpellSources.inventoryFingerprint===canonical(C.inv)&&C.instrumentSpellSources.resourceFingerprint===canonical(C.res)&&C.instrumentSpellSources.spellFingerprint===canonical(C.spells);}
function budgetFault(owner){const state=scope?scope.state:owner.state.instrumentSpells;if(MODEL.problems(state).length)return false;return !MODEL.projection(state,instrumentOwnedUsed()||{}).ok;}
function rawFuture(owner){const state=scope?scope.state:owner.state.instrumentSpells,ids=MODEL.problems(state).length?[]:state.physical.map(p=>p.id);return (owner.C.inv||[]).some(row=>{const marker=instrumentSpellsMarker(row);return marker.present&&(!marker.ok||!ids.includes(marker.id))&&(build().inv||[]).some(next=>next.n===row.n);});}
function opaque(){const owner=live();return !!owner&&((own(owner.C,'instrumentSpells')&&MODEL.problems(owner.C.instrumentSpells).length)||(own(owner.state,'instrumentSpells')&&MODEL.problems(owner.state.instrumentSpells).length)||(own(owner.C,'instrumentSpellSources')&&!supportedSources(owner.C.instrumentSpellSources))||rawFuture(owner)||budgetFault(owner));}
export function instrumentProjectionMirror(){if(legacyComparison)return undefined;const owner=live();if(opaque())return own(owner.C,'instrumentSpells')?copy(owner.C.instrumentSpells):undefined;const state=instrumentOwnedState();return state===undefined?undefined:copy(state);}
export function instrumentOwnFuture(){return opaque()&&own(live().C,'instrumentSpells');}
export function instrumentSourcesOwnFuture(){return opaque()&&own(live().C,'instrumentSpellSources');}
export function instrumentCastingFuture(){const owner=live();return instrumentAbilityRelevant(build())&&owner&&own(owner.C,'castingSources')&&castingSourcesProblems(owner.C.castingSources).length?{value:copy(owner.C.castingSources)}:null;}
export function instrumentRelevant(){const owner=live();return instrumentAbilityRelevant(build())||!!owner&&(own(owner.state,'instrumentSpells')||own(owner.C,'instrumentSpells')||own(owner.C,'instrumentSpellSources'));}
export function instrumentAbilityRelevant(B){return !legacyComparison&&(B.inv||[]).some(row=>instrumentItemName(key(row))||own(row,'instrumentSpells'));}
export function instrumentSpellsAllocatedKeys(){const state=knownState();return MODEL.problems(state).length?[]:state.physical.flatMap(p=>p.spells.map(spell=>spell.budgetKey));}
export function instrumentSourceForRow(row,index,profileId,parentFingerprint=null,state=knownState()){
 const ATT=lateGet('attunementState')(),generic=key(row)===INSTRUMENT_GENERIC_ITEM;
 return instrumentSpellSource({profileId,row,index,inventory:build().inv||[],attunement:ATT.rows[index],originalCatalogRows:lateGet('DM14S')||(typeof DMGI==='undefined'?[]:DMGI),legacyCatalogRows:genv.WXI?.dmg14,resolvedRow:lateGet('DMAP')?.[row.n],fxOverrides:fxo()||{},gxItems:gx().item||{},customItems:build().custLib||[],parentFingerprint:generic?INSTRUMENT_GENERIC_FINGERPRINT:parentFingerprint});
}
function physicalSources(){const state=knownState();if(MODEL.problems(state).length)return [];return (build().inv||[]).flatMap((row,index)=>{const marker=instrumentSpellsMarker(row),p=marker.ok&&state.physical.find(p=>p.id===marker.id);if(!p)return [];const source=instrumentSourceForRow(row,index,p.profile,p.parentFingerprint,state);return source.ok&&source.itemFingerprint===p.itemFingerprint&&source.grantsFingerprint===p.grantsFingerprint?[{...source,id:p.id,index,physical:p}]:[];});}
function catalogFor(profile){return typeof genv.__spellCatalogForRuleset==='function'?genv.__spellCatalogForRuleset(profile.edition):null;}
function definitionFor(source,grantId){const p=instrumentProfile(source.profileId);return instrumentSpellDefinition(p.id,grantId,catalogFor(p));}
function markerFor(source,spell){return {v:1,id:source.id,grantId:spell.grantId,budgetKey:spell.budgetKey};}
function originalSpellRow(source,spell,definition,a){
 const d=definition.definition,p=instrumentProfile(source.profileId),row={...copy(d),full:definition.full,ct:definition.castingTime,cmp:'None (item)',use:'Item',src:p.item+' ['+source.id+']',sourceKey:'@instrument:'+source.id,itc:{it:p.item,c:1,lv:definition.castLevel},instrumentSpell:markerFor(source,spell),instrumentSpellSource:definition.spellSource,instrumentCastLevel:definition.castLevel,instrumentRestriction:copy(definition.restriction)};
 if(typeof QRY.spFxTo==='function')QRY.spFxTo(row,row.sourceKey,a,d.fx);delete row.mat;return row;
}
function oldOriginalSpell(row){return !!row&&(own(row,'instrumentSpell')||instrumentSpellNeedsController(null,row));}
function retainedRows(field,rows){const owner=live(),protectedRow=row=>field==='spells'?oldOriginalSpell(row):own(row,'instrumentSpell');return (rows||[]).filter(row=>!protectedRow(row)).concat((owner?.C?.[field]||[]).filter(protectedRow).map(copy));}
function rawIdentity(row){return {n:row.n,key:key(row),q:Number(row.q??1),eq:!!row.eq};}
export function instrumentInventoryRows(rows){const owner=live();if(!owner)return rows;const state=scope?scope.state:owner.state.instrumentSpells,ids=MODEL.problems(state).length?[]:state.physical.map(p=>p.id);let out=rows;(owner.C.inv||[]).forEach((row,index)=>{const marker=instrumentSpellsMarker(row);if(!marker.present||marker.ok&&ids.includes(marker.id)||!(build().inv||[]).some(value=>value.n===row.n))return;const next=rows[index];if(!next||rows.filter(value=>value.n===row.n).length!==1||canonical(rawIdentity(row))!==canonical(rawIdentity(next)))throw Error('Unknown instrument source moved or changed.');if(out===rows)out=rows.slice();out[index]=copy(next);Object.defineProperty(out[index],'instrumentSpells',Object.getOwnPropertyDescriptor(copy(row),'instrumentSpells'));});return out;}
function preserveOpaqueResources(C){const rows=retainedRows('res',C.res),owner=live(),indices=(owner.C.res||[]).filter(row=>own(row,'instrumentSpell')).map(row=>row.invIndex);return rows.filter(row=>!(indices.includes(row.invIndex)&&oldPool(build().inv[row.invIndex],row.invIndex,row)&&originalInstrumentDefinition(build().inv[row.invIndex]?.n)));}
export function instrumentProjectSpells(C,a){
 if(legacyComparison||!instrumentRelevant())return C.spells;if(opaque())return retainedRows('spells',C.spells);let rows=(C.spells||[]).filter(row=>!oldOriginalSpell(row));
 const catalogs=new Map();for(const source of physicalSources()){const profile=instrumentProfile(source.profileId);if(!catalogs.has(profile.edition))catalogs.set(profile.edition,catalogFor(profile));for(const spell of source.physical.spells){const definition=instrumentSpellDefinition(profile.id,spell.grantId,catalogs.get(profile.edition));if(definition.ok)rows.push(originalSpellRow(source,spell,definition,a));}}
 return rows;
}
function oldPool(row,index,r){return r?.item===1&&!own(r,'instrumentSpell')&&r.invIndex===index&&r.f===row.n&&Number.isSafeInteger(r.max)&&[4,7,8].includes(r.max);}
const OTHER_ITEM_OWNERS=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption','travelGoat'];
function genuineInstrumentRow(row){
 if(!row||OTHER_ITEM_OWNERS.some(field=>own(row,field))||!instrumentSpellsMarker(row).ok||!originalInstrumentDefinition(row.n))return false;const definition=lateGet('DMAP')[row.n],names=[row.n,key(row),definition[0]];
 return !names.some(name=>own(fxo(),name)||own(gx().item,name))&&!(build().custLib||[]).some(value=>names.includes(Array.isArray(value)?value[0]:value?.n));
}
function suppressOldPools(resources,sources){const indices=(build().inv||[]).flatMap((row,index)=>genuineInstrumentRow(row)?[index]:[]);return resources.filter(r=>!indices.some(index=>oldPool(build().inv[index],index,r)));}
export function instrumentProjectResources(C){
 if(legacyComparison||!instrumentRelevant())return C.res;if(opaque())return preserveOpaqueResources(C);const sources=physicalSources(),projection=MODEL.projection(knownState(),instrumentOwnedUsed()||{});let rows=suppressOldPools(C.res||[],sources);if(!projection.ok)return rows;
 for(const source of sources){const p=projection.physical.find(p=>p.id===source.id);if(!p||!p.present)continue;for(const spell of source.physical.spells)rows.push({k:spell.budgetKey,n:instrumentProfile(source.profileId).item+': '+instrumentProfile(source.profileId).grants.find(g=>g.id===spell.grantId).spell,max:1,reset:'none',f:build().inv[source.index].n,item:1,invIndex:source.index,reviewRequired:p.reviewRequired,instrumentSpell:markerFor(source,spell),tag:'One cast of this spell; recover only at an actual declared dawn.'});}
 return rows;
}
export function instrumentSourceWitness(C){
 if(legacyComparison)return undefined;const owner=live();if(opaque())return own(owner.C,'instrumentSpellSources')?copy(owner.C.instrumentSpellSources):undefined;
 if(!instrumentAbilityRelevant(build())&&!own(owner?.state,'instrumentSpells'))return undefined;
 return {v:1,inventoryFingerprint:canonical(C.inv),resourceFingerprint:canonical(C.res),spellFingerprint:canonical(C.spells),bindings:physicalSources().map(s=>({id:s.id,index:s.index,profile:s.profileId,itemFingerprint:s.itemFingerprint,grantsFingerprint:s.grantsFingerprint,parentFingerprint:s.parentFingerprint,spells:copy(s.physical.spells)}))};
}
export function instrumentAbilityChoices(C,S){
 const cap=C?.castingSources;if(castingSourcesProblems(cap).length||cap.complete!==true)return {ok:false,reason:'Actual spellcasting ability sources are unavailable.'};
 const abilities=[...new Set(cap.sources.map(source=>source.ability))];return {ok:true,abilities:abilities.length?abilities:[null],sources:copy(cap.sources)};
}
function castSource(C,S,physicalId,grantId){
 if(!instrumentSourceWitnessSupported(C)||canonical(C.instrumentSpells)!==canonical(S?.instrumentSpells))return {ok:false,reason:'Apply this character’s current instrument source.'};
 const state=S?.instrumentSpells;if(MODEL.problems(state).length)return {ok:false,reason:'Review this instrument’s original physical history.'};const projection=MODEL.projection(state,S.used||{});if(!projection.ok)return projection;
 const source=physicalSources().find(source=>source.id===physicalId),view=projection.physical.find(p=>p.id===physicalId);if(!source||!view?.present||view.reviewRequired)return {ok:false,reason:'Review this instrument’s current source and per-spell history.'};
 const definition=definitionFor(source,grantId);if(!definition.ok)return definition;
 const slot=source.physical.spells.find(spell=>spell.grantId===grantId),remaining=view.spells.find(spell=>spell.grantId===grantId);if(!slot||remaining?.remaining!==1)return {ok:false,reason:'This instrument cannot cast that spell again before the next actual dawn.'};const expected=canonical(markerFor(source,slot)),indices=(C.spells||[]).flatMap((row,index)=>canonical(row.instrumentSpell)===expected?[index]:[]),spellIndex=indices.length===1?indices[0]:-1,resource=(C.res||[]).filter(row=>row.k===slot.budgetKey&&canonical(row.instrumentSpell)===expected);
 if(spellIndex<0||resource.length!==1||resource[0].max!==1||resource[0].reset!=='none')return {ok:false,reason:'Apply this character’s matching native instrument source.'};
 return {ok:true,source,definition,spellIndex};
}
export function instrumentCastWitness(C,S,physicalId,grantId,ability){
 const current=castSource(C,S,physicalId,grantId);if(!current.ok)return current;const {definition,spellIndex}=current;const choice=instrumentAbilityChoices(C,S);if(!choice.ok)return choice;if(!choice.abilities.includes(ability))return {ok:false,reason:'Choose an actual spellcasting ability for this item.',abilities:choice.abilities};
 const derived=typeof genv.__deriveFor==='function'?genv.__deriveFor(C,S):null;if(!Number.isFinite(derived?.pb)||!Number.isInteger(derived?.exhN)||derived.exhN<0||derived.exhN>6||ability!==null&&!Number.isFinite(derived?.mod?.[ability])||derived?.sourceReview?.reviewRequired)return {ok:false,reason:'Native character spellcasting statistics are unavailable.'};
 const modifier=ability===null?0:derived.mod[ability],sourceKey='@instrument:'+physicalId,stats={ability,modifier,pb:derived.pb,atk:derived.pb+modifier+QRY.spItemB('atk',sourceKey)-2*derived.exhN,dc:8+derived.pb+modifier+QRY.spItemB('dc',sourceKey)};
 return {ok:true,spellIndex,spell:copy(C.spells[spellIndex]),...definition,stats,abilityOptions:choice.abilities,sourceStamp:instrumentSourceStamp()};
}
function relevantEntry(table,names){const result={};for(const name of names)if(own(table,name))Object.defineProperty(result,name,Object.getOwnPropertyDescriptor(table,name));return result;}
export function instrumentSourceStamp(){
 const B=build(),names=new Set([...instrumentProfiles().map(p=>p.item),typeof INSTRUMENT_GENERIC_ITEM==='string'?INSTRUMENT_GENERIC_ITEM:'']),spellNames=new Set(instrumentProfiles().flatMap(p=>p.grants.map(g=>g.spell))),items=(B.inv||[]).map(row=>row.n),catalog=lateGet('DM14S')||(typeof DMGI==='undefined'?[]:DMGI),filter=rows=>Array.isArray(rows)?rows.filter(row=>Array.isArray(row)&&names.has(row[0])):rows;
 return canonical({inventory:B.inv,state:instrumentOwnedState(),used:instrumentOwnedUsed(),catalog:filter(catalog),legacy:filter(genv.WXI?.dmg14),resolved:relevantEntry(lateGet('DMAP'),[...names,...items]),fx:relevantEntry(fxo(),[...names,...items]),gx:relevantEntry(gx().item,[...names,...items]),custom:B.custLib,spells:['2014','2024'].map(edition=>{const rows=typeof genv.__spellCatalogForRuleset==='function'?genv.__spellCatalogForRuleset(edition):null;return Array.isArray(rows)?rows.filter(row=>spellNames.has(row.n)):rows;})});
}
function presentQuantity(row){return row&&Number(row.q??1)>0;}
export function reconcileInstrumentInventory(previous,next,state,used){
 if(MODEL.problems(state).length)return {ok:false,reason:'unsupported-instrument-history'};let authority=state,changed=false;const projection=MODEL.projection(state,used);if(!projection.ok)return projection;
 for(const physical of state.physical){const before=(previous||[]).filter(row=>instrumentSpellsMarker(row).id===physical.id),after=(next||[]).filter(row=>instrumentSpellsMarker(row).id===physical.id);if(before.length>1||after.length>1)return {ok:false,reason:'duplicate-instrument-identity'};
  const view=projection.physical.find(p=>p.id===physical.id);if(view?.present&&before.some(presentQuantity)&&!after.some(presentQuantity)){const result=MODEL.presence(authority,used,physical.id,false,{actualPhysicalRemoved:true});if(!result.ok)return result;authority=result.state;changed=true;}}
 return {ok:true,changed,authority};
}
function legacyInstrumentRowSafe(row,index,ATT){
 if(own(row,'instrumentSpells'))return false;const resolved=lateGet('DMAP')?.[row.n],name=Array.isArray(resolved)?resolved[0]:key(row);if(!instrumentItemName(name))return true;
 if(!row.eq||ATT.rows[index]?.requires===true&&ATT.rows[index].attuned!==true)return true;const names=[name,row.n,key(row)],B=build();if(names.some(n=>own(fxo(),n)||own(gx().item,n))||(B.custLib||[]).some(value=>names.includes(Array.isArray(value)?value[0]:value?.n)))return false;
 return originalInstrumentDefinition(row.n);
}
export function instrumentLegacySourcesSafe(){const owner=live();if(owner&&['instrumentSpells','instrumentSpellSources'].some(field=>own(owner.C,field)))return false;const ATT=lateGet('attunementState')();return (build().inv||[]).every((row,index)=>legacyInstrumentRowSafe(row,index,ATT));}
export function withInstrumentLegacyComparison(run){if(!instrumentLegacySourcesSafe())throw Error('Review the instrument’s saved source history.');const old=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=old;}}
const APPLY=new WeakMap();
function preservedOpaqueFields(C,candidate){return ['instrumentSpells','instrumentSpellSources'].every(field=>own(C,field)===own(candidate,field)&&(!own(C,field)||canonical(C[field])===canonical(candidate[field])));}
function preservedOpaqueRows(previous,next){return (previous||[]).every(row=>{const marker=instrumentSpellsMarker(row);if(!marker.present||marker.ok)return true;const matches=(next||[]).filter(value=>key(value)===key(row));return matches.length===0||matches.length===1&&own(matches[0],'instrumentSpells')&&canonical(matches[0].instrumentSpells)===canonical(row.instrumentSpells);});}
function instrumentApplyResult(C,owner,B){
 if(!owner?.C||!owner.state)return {ok:true,changed:false,build:B};const raw=instrumentSpellsRawState(owner.state,MODEL);
 if(!preservedOpaqueRows(owner.C.inv,C.inv))return {ok:false,reason:'unsupported-instrument-marker-must-be-preserved'};
 if(!raw.ok||opaque())return preservedOpaqueFields(owner.C,C)?{ok:true,changed:false,build:B}:{ok:false,reason:'unsupported-instrument-history-must-be-preserved'};
 if(!raw.present)return own(owner.C,'instrumentSpells')?{ok:false,reason:'instrument-history-authority-required'}:{ok:true,changed:false,build:B};const result=reconcileInstrumentInventory(owner.C.inv,C.inv,raw.state,owner.state.used);if(!result.ok)return result;
 if(canonical(C.instrumentSpells)!==canonical(result.authority))return {ok:false,reason:'latest-instrument-history-required'};return {ok:true,changed:false,build:B,authority:result.authority};
}
export function instrumentSpellsApplyPlan(C){const owner=sheetState(),B=build(),plan=instrumentApplyResult(C,owner,B);if(!plan.ok)return plan;const stamp=canonical([owner?.C,owner?.state,B,C]);if(stamp===null)return {ok:false,reason:'unsupported-instrument-apply-frame'};APPLY.set(plan,{C:owner?.C,S:owner?.state,B,candidate:C,stamp});return plan;}
export function instrumentSpellsApplyCurrent(plan,phase='pending'){const ticket=APPLY.get(plan),owner=sheetState();return !!ticket&&['pending','committed'].includes(phase)&&owner?.C===ticket.C&&owner?.state===ticket.S&&build()===ticket.B&&canonical([owner?.C,owner?.state,build(),ticket.candidate])===ticket.stamp;}
export const instrumentAllocatedKeys=instrumentSpellsAllocatedKeys;

const SCOPED_DC_ITEMS=new Set(['Arcane Grimoire','Bloodwell Vial','All-Purpose Tool','Moon Sickle'].flatMap(name=>[1,2,3].map(n=>'+'+n+' '+name)).concat("Reveler's Concertina"));
export function instrumentUnscopedItemBonus(entry,kind,source){
 if(kind!=='dc'||typeof source!=='string'||!/^@instrument:isp-[1-9][0-9]*$/.test(source))return null;const item=entry?.mi||entry?.n;if(!SCOPED_DC_ITEMS.has(item))return null;
 const B=build(),custom=(B.custLib||[]).find(row=>[item,entry.n].includes(Array.isArray(row)?row[0]:row?.n)),overrides=fxo()||{},override=own(overrides,item)?overrides[item]:null;
 const effect=custom?(Array.isArray(custom)?custom[5]?.fx:custom.fx):override?.fx;return effect&&own(effect,'spellDc')&&typeof effect.spellDc==='number'&&Number.isFinite(effect.spellDc)?null:0;
}

function originalThiefDevice(){
 const rows=genv.WXS;if(!Array.isArray(rows))return false;const sources=rows.filter(row=>row&&row.cls==='Rogue'&&row.name==='Thief (2014)'&&row.src==='phb14');if(sources.length!==1)return false;
 const source=sources[0],feature=[13,'Use Magic Device','Ignore class, species, and level requirements on magic items.'],full='You ignore all class, species, and level requirements on the use of magic items.';
 const effective=classDef('Rogue')?.subs?.['Thief (2014)'];return Array.isArray(source.arr)&&canonical(source)!==null&&Array.isArray(effective)&&effective.some(row=>canonical(row)===canonical(feature))&&source.arr.some(row=>canonical(row)===canonical(feature))&&source.full?.['Thief (2014)|Use Magic Device']===full;
}
function originalInstrumentDefinition(name){
 const row=lateGet('DMAP')?.[name];if(!Array.isArray(row))return false;const p=instrumentProfileForItem(row[0]),generic=row[0]===INSTRUMENT_GENERIC_ITEM;if(!p&&!generic)return false;
 const fingerprint=generic?INSTRUMENT_GENERIC_FINGERPRINT:p.itemFingerprint,rows=p?.edition==='2014'?genv.WXI?.dmg14:lateGet('DM14S')||(typeof DMGI==='undefined'?[]:DMGI);if(!Array.isArray(rows)||canonical(row)!==fingerprint)return false;
 return rows.filter(value=>Array.isArray(value)&&value[0]===row[0]&&canonical(value)===fingerprint).length===1;
}
export function instrumentBardRequirementIgnored(name,row){
 if(legacyComparison)return false;
 if(!originalInstrumentDefinition(name)||!instrumentSpellsMarker(row).ok||!originalThiefDevice())return false;const B=build(),parts=[{cls:B.cls,sub:B.sub,lv:B.level}].concat(B.mc||[]);
 return parts.some(part=>part.cls==='Rogue'&&part.sub==='Thief (2014)'&&Number.isSafeInteger(part.lv)&&part.lv>=13);
}
