import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx} from './00-env.js';
import {createIounOrbit,iounOrbitProblems,iounOrbitAvailability} from '../data/lib/ioun-orbit.js';
import {iounNativeSources,iounSource,iounMarkerSource,iounOrbitItemName,iounContext,reconcileIounInventory,canonicalIounDefinition} from '../data/lib/ioun-orbit-source.js';
let scope=null,legacyComparison=false;const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row.n;
function currentBuild(){return lateGet('B');}
function nativeAttunementState(){return lateGet('attunementState')();}
export function iounOrbitCatalog(){return iounNativeSources(lateGet('DM14S')||DMGI);}
export function withIounOrbitProjection(state,run){const previous=scope;scope={state};try{return run();}finally{scope=previous;}}
export function withIounOrbitLegacyComparison(run){const previous=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=previous;}}
function ownedFrame(){const live=sheetState();return live?.C&&currentBuild().cid&&currentBuild().cid===genv.__sheetId?.()?live:null;}
export function iounOrbitOwnedState(ATT=nativeAttunementState()){
 const live=ownedFrame();if(!scope&&!live)return undefined;const state=scope?scope.state:own(live.C,'iounOrbit')&&iounOrbitProblems(live.C.iounOrbit).length?live.C.iounOrbit:live.state?.iounOrbit;
 if(state===undefined||iounOrbitProblems(state).length)return state;const plan=reconcileIounInventory(live?.C?.inv||[],currentBuild().inv||[],state,ATT,iounOrbitCatalog(),currentBuild().custLib||[]);return plan.ok?plan.authority:state;
}
export function iounOrbitProjectionMirror(){const state=iounOrbitOwnedState();return state===undefined?undefined:structuredClone(state);}
export function iounOrbitOwnFuture(){const live=ownedFrame();return !!(live&&own(live.C,'iounOrbit')&&iounOrbitProblems(live.C.iounOrbit).length);}
function nativeEffectsMatch(source){
 const overrides=fxo(),override=overrides&&own(overrides,source.item)?overrides[source.item]:undefined;
 if(override!=null){if(typeof override!=='object'||Array.isArray(override)||Reflect.ownKeys(override).some(k=>k!=='fx')||canonicalIounDefinition(override.fx||null)!==canonicalIounDefinition(source.row[5]?.fx||null))return false;}
 const entries=gx()?.item?.[source.item]||[];if(source.kind!=='mastery')return !entries.length;
 return Array.isArray(entries)&&entries.length===1&&entries[0]?.pbAdd===1&&Reflect.ownKeys(entries[0]).every(k=>k==='n'||k==='pbAdd');
}
export function iounOrbitContext(state,inventory=currentBuild().inv||[],ATT=nativeAttunementState()){
 const catalog=iounOrbitCatalog(),context=iounContext({state,inventory,allocatedATT:ATT,catalog,customItems:currentBuild().custLib||[]});if(!context)return null;
 const live=ownedFrame(),plan=live?reconcileIounInventory(live.C.inv||[],inventory,state,ATT,catalog,currentBuild().custLib||[]):null;if(plan&&!plan.ok)context.unresolvedCurrentOrbit=true;if(live&&own(live.C,'iounOrbitSources')&&!sourceWitnessSupported(live.C.iounOrbitSources,state))context.unresolvedCurrentOrbit=true;
 for(const source of context.sources){const profile=catalog.find(entry=>entry.nativeProfile===source.profile);if(source.present&&(!profile||!nativeEffectsMatch(profile)))context.unresolvedCurrentOrbit=true;}return context;
}
function sourceWitnessSupported(value,state=iounOrbitOwnedState()){if(!value||typeof value!=='object'||Array.isArray(value)||Reflect.ownKeys(value).length!==3||value.v!==1||!own(value,'context')||!own(value,'inventoryFingerprint')||typeof value.inventoryFingerprint!=='string')return false;return iounOrbitAvailability(iounOrbitProblems(state).length?createIounOrbit():state,value.context).ok;}
export function iounOrbitSourceWitness(ATT=nativeAttunementState(),inventory=[]){
 if(legacyComparison)return undefined;const live=ownedFrame();if(live&&own(live.C,'iounOrbitSources')&&!sourceWitnessSupported(live.C.iounOrbitSources))return structuredClone(live.C.iounOrbitSources);
 const state=iounOrbitOwnedState(ATT),context=iounOrbitContext(iounOrbitProblems(state).length?createIounOrbit():state,currentBuild().inv||[],ATT);return {v:1,context,inventoryFingerprint:canonicalIounDefinition(inventory)};
}
export function iounOrbitActiveFx(row,index,ATT){
 if(legacyComparison)return null;const catalog=iounOrbitCatalog(),item=key(row),plain=iounSource(catalog,item),source=own(row,'iounOrbit')?iounMarkerSource(row.iounOrbit,catalog,item):plain;
 if(!iounOrbitItemName(item)&&!own(row,'iounOrbit'))return null;
 if(source?.kind==='reserve'||source&&!source.passive&&!source.generic&&!own(row,'iounOrbit'))return null;
 if(!source||!source.passive)return {managed:true,entries:[]};return qualifiedIounEntry(row,source,ATT);
}
function qualifiedIounEntry(row,source,ATT){const state=iounOrbitOwnedState(ATT);if(iounOrbitProblems(state).length)return {managed:true,entries:[]};const stone=state.stones.find(stone=>stone.id===row.iounOrbit?.id),context=iounOrbitContext(state,currentBuild().inv||[],ATT),available=context&&iounOrbitAvailability(state,context);if(!stone||stone.profile!==source.nativeProfile||!available?.ok||!('qualifiedIds' in available)||!available.qualifiedIds.includes(stone.id)||row.eq!==true||!nativeEffectsMatch(source))return {managed:true,entries:[]};return {managed:true,entries:[{n:source.item,mi:source.item,fx:structuredClone(source.row[5]?.fx||{}),gx:source.row[5]?.gx||null,att:true,arm:false,t:source.row[1]}]};}
export function iounOrbitAwarenessQualified(state,witness){if(legacyComparison)return false;if(iounOrbitProblems(state).length||!sourceWitnessSupported(witness,state)||!witness.context)return false;const available=iounOrbitAvailability(state,witness.context);return !!(available.ok&&'qualifiedIds' in available&&available.qualifiedIds.some(id=>state.stones.some(stone=>stone.id===id&&stone.profile==='dmg2024-ioun-awareness')));}
export {reconcileIounInventory};
function iounApplyShape(value,top=false){if(value===null)return ['null'];if(typeof value!=='object')return [typeof value,String(value)];const keys=Reflect.ownKeys(value),version=genv.__appVer,native=top&&typeof genv.__lsSave==='function'&&Number.isSafeInteger(version)&&version>=0;if(native&&!keys.includes('_app'))keys.push('_app');return [Array.isArray(value)?'array':'object',keys.map(key=>[typeof key,String(key),iounApplyShape(native&&key==='_app'?Math.max(+value._app||0,version):value[key])])];}
function iounApplySignature(value){return JSON.stringify(iounApplyShape(value,true));}
function sameIounPayload(a,b){return JSON.stringify(iounApplyShape(a))===JSON.stringify(iounApplyShape(b));}
function iounApplySources(){const catalog=iounOrbitCatalog();return iounApplySignature({catalog,overrides:catalog.map(source=>[source.item,fxo()?.[source.item]]),mastery:gx()?.item?.['Ioun Stone (mastery)']});}
function preserveIounFuture(character,candidate){for(const field of ['iounOrbit','iounOrbitSources']){const valid=field==='iounOrbit'?iounOrbitProblems(character[field]).length===0:sourceWitnessSupported(character[field],character.iounOrbit);if(own(character,field)&&!valid&&(!own(candidate,field)||!sameIounPayload(character[field],candidate[field])))return false;}return true;}
function iounApplyPayload(candidate){
 const live=ownedFrame();if(!live||live.readOnly!==false)return {ok:true,changed:false};if(!candidate||candidate.name!==currentBuild().name||own(candidate,'cid')&&candidate.cid!==currentBuild().cid||!preserveIounFuture(live.C,candidate))return {ok:false,reason:'stale-ioun-apply-owner'};
 const state=live.state?.iounOrbit;if(iounOrbitProblems(state).length)return {ok:true,changed:false};
 const plan=reconcileIounInventory(live.C.inv||[],currentBuild().inv||[],state,nativeAttunementState(),iounOrbitCatalog(),currentBuild().custLib||[]);if(!plan.ok)return plan;
 if(iounOrbitProblems(candidate.iounOrbit).length||!sameIounPayload(candidate.iounOrbit,plan.authority))return {ok:false,reason:'stale-ioun-apply-history'};
 const witness=candidate.iounOrbitSources;if(!sourceWitnessSupported(witness,plan.authority)||witness.inventoryFingerprint!==canonicalIounDefinition(candidate.inv))return {ok:false,reason:'stale-ioun-apply-source-witness'};
 return {ok:true,changed:false};
}
const IOUN_APPLY_PLANS=new WeakMap();
export function iounOrbitApplyPlan(candidate){
 const live=sheetState(),character=live?.C,state=live?.state,build=currentBuild(),before={C:iounApplySignature(character),S:iounApplySignature(state),B:iounApplySignature(build),candidate:iounApplySignature(candidate),sources:iounApplySources()},plan=iounApplyPayload(candidate);if(!plan.ok)return plan;const now=sheetState();
 if(now?.C!==character||now?.state!==state||currentBuild()!==build||before.C!==iounApplySignature(character)||before.S!==iounApplySignature(state)||before.B!==iounApplySignature(build)||before.candidate!==iounApplySignature(candidate)||before.sources!==iounApplySources())return {ok:false,reason:'stale-ioun-apply-context'};
 IOUN_APPLY_PLANS.set(plan,{character,state,build,candidate,before,cid:genv.__sheetId?.(),readOnly:live?.readOnly});return plan;
}
export function iounOrbitApplyCurrent(plan){const ticket=IOUN_APPLY_PLANS.get(plan),live=sheetState();return !!(ticket&&live?.C===ticket.character&&live?.state===ticket.state&&currentBuild()===ticket.build&&live?.readOnly===ticket.readOnly&&genv.__sheetId?.()===ticket.cid&&iounApplySignature(ticket.character)===ticket.before.C&&iounApplySignature(ticket.state)===ticket.before.S&&iounApplySignature(currentBuild())===ticket.before.B&&iounApplySignature(ticket.candidate)===ticket.before.candidate&&iounApplySources()===ticket.before.sources);}

export function iounOrbitLegacySourcesSafe(){
 const catalog=iounOrbitCatalog(),rows=currentBuild()?.inv||[];return rows.every(row=>{if(!row||!iounOrbitItemName(key(row)))return true;const source=iounSource(catalog,key(row));if(!source||(currentBuild().custLib||[]).some(item=>item.n===key(row)))return false;if(source.kind==='reserve')return !own(row,'iounOrbit');return !['iounOrbit','storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses'].some(field=>own(row,field))&&nativeEffectsMatch(source);});
}
