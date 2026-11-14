import {necronomiconOwnedState,necronomiconAbilityProjection,NECRONOMICON_ABILITY_SOURCE} from './10f-logic-necronomicon-reading.js';
import {B} from './04-logic-storage.js';
import {genv,sheetState} from './00-env.js';
import {studyBookProblems,studyBookProfile,studyBookProfileForItem,studyBooksProjection,reconcileStudyBookInventory,studyBooksAbilityEvents} from '../data/lib/study-books.js';
let studyScope=null,inputOnly=false,legacyOnly=false;
const studyOwn=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key),ABILITY_KEYS=['STR','DEX','CON','INT','WIS','CHA'];
export function withStudyBooksProjection(state,run){const previous=studyScope;studyScope={state};try{return run()}finally{studyScope=previous}}
export function withStudyBooksInput(run){const previous=inputOnly;inputOnly=true;try{return run()}finally{inputOnly=previous}}
export function studyBooksInputOnly(){return inputOnly}
export function withStudyBooksLegacy(run){const previous=legacyOnly;legacyOnly=true;try{return run()}finally{legacyOnly=previous}}
export function studyBooksLegacyEntries(entries){return legacyOnly?entries.map(entry=>{const profile=entry.kind==='item'&&studyBookProfileForItem(entry.owner);return profile&&/^Tome of /.test(profile.native)?{...entry,abUp:[[profile.ability,2,30]]}:entry}):entries}
export function studyBooksOwnedState(){
 if(studyScope)return studyScope.state;const live=sheetState(),id=genv.__sheetId&&genv.__sheetId();if(!live?.C||live.C.name!==B.name||!B.cid||B.cid!==id)return undefined;
 if(studyOwn(live.C,'studyBooks')&&studyBookProblems(live.C.studyBooks).length)return live.C.studyBooks;
 const state=live.state&&studyOwn(live.state,'studyBooks')?live.state.studyBooks:undefined;if(state===undefined||studyBookProblems(state).length)return state;
 const planned=reconcileStudyBookInventory(live.C.inv||[],B.inv||[],state);return planned.ok?planned.authority:state;
}
export function studyBooksAbilityProjection(){return studyBooksProjection(studyBooksOwnedState(),B.base||{})}
export function studyBooksAbilityRows(includeNecronomicon=true){const state=studyBooksOwnedState();if(!includeNecronomicon)return studyBookProblems(state).length?[]:state.acquisitions.filter(value=>value.mode==='fixed-delta'&&value.delta).map(value=>({ability:value.ability,delta:value.delta,source:studyBookProfile(value.profile).native+': completed study ('+value.id+')'}));const reading=includeNecronomicon?necronomiconAbilityProjection():null,necro=includeNecronomicon?necronomiconOwnedState():undefined;let events;
 if(!studyBookProblems(state).length){const ordered=studyBooksAbilityEvents(state,necro);events=ordered.ok?ordered.events:state.acquisitions.filter(value=>value.mode==='fixed-delta'&&value.ability!=='WIS').map(value=>({...value,kind:'study-book'}));if(!ordered.ok&&reading?.ok)for(const key of ['INT'])if(reading.additional[key])events.push({kind:'necronomicon',ability:key,delta:reading.additional[key]})}
 else events=reading?.ok&&reading.acquired?['INT','WIS'].filter(key=>reading.additional[key]).map(key=>({kind:'necronomicon',ability:key,delta:reading.additional[key]})):[];
 return events.filter(event=>event.kind!=='necronomicon'||reading?.ok&&!reading.review.includes(event.ability)).map(event=>({ability:event.ability,delta:event.delta,source:event.kind==='necronomicon'?NECRONOMICON_ABILITY_SOURCE:studyBookProfile(event.profile).native+': completed study ('+event.id+')'}))}
export function studyBooksOrderReview(){const state=studyBooksOwnedState();if(studyBookProblems(state).length)return [];const ordered=studyBooksAbilityEvents(state,necronomiconOwnedState());return ordered.ok?[]:ordered.review||['WIS']}
export function studyBooksProjectionMirror(){const state=studyBooksOwnedState();if(state!==undefined)return structuredClone(state);const live=sheetState(),id=genv.__sheetId&&genv.__sheetId();return live?.C?.name===B.name&&B.cid===id&&studyOwn(live.C,'studyBooks')?structuredClone(live.C.studyBooks):undefined}
function studyAbilityAffected(entry,key){return ['abUp','abDown','abSet'].some(field=>Array.isArray(entry[field])&&entry[field].some(row=>row[0]===key))||!!(entry.abPick||entry.abUpPick)}
export function studyBooksInputReview(active,entries,customization){const result=Object.fromEntries(ABILITY_KEYS.map(key=>[key,[]]));for(const key of ABILITY_KEYS){
 if(active.some(row=>row.fx&&['abil','setsc'].some(field=>row.fx[field]?.[0]===key)))result[key].push('item-ability-effect');
 if(entries.some(entry=>studyAbilityAffected(entry,key)&&(entry.kind==='item'||entry.toggle||entry.consume||entry.cond||entry.abSet||entry.abPick?.set)))result[key].push('conditional-or-setting-ability-effect');
 const custom=customization&&customization['n:ab-'+key];if(custom&&typeof custom==='object'&&(custom.b!=null&&custom.b!==''||custom.o!=null&&custom.o!==''))result[key].push('custom-ability-adjustment');
 }return result}
export function studyBooksProjectionReviewByAbility(){const state=studyBooksOwnedState(),projection=studyBooksProjection(state,B.base||{}),result=Object.fromEntries(ABILITY_KEYS.map(key=>[key,[]]));if(state===undefined)return result;if(!projection.ok){for(const key of ABILITY_KEYS)result[key].push('unsupported-study-history');return result}for(const id of projection.review){const acquisition=state.acquisitions.find(value=>value.id===id);result[acquisition.ability].push('study-book-base-review-required')}return result}
