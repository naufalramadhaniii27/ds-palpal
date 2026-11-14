import {B} from './04-logic-storage.js';
import {genv,sheetState} from './00-env.js';
import {necronomiconProblems,necronomiconProjection} from '../data/lib/necronomicon-reading.js';
let readingScope=null,inputOnly=false,legacyOnly=false;
const readingOwn=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key);
export const NECRONOMICON_ABILITY_SOURCE='Necronomicon: completed reading (permanent)';
export function withNecronomiconProjection(state,run){const previous=readingScope;readingScope={state};try{return run()}finally{readingScope=previous}}
export function withNecronomiconLegacy(run){const previous=legacyOnly;legacyOnly=true;try{return run()}finally{legacyOnly=previous}}
export function necronomiconLegacyEntries(entries){return legacyOnly?entries.map(entry=>entry.kind==='item'&&entry.owner==='Necronomicon'?{...entry,abUp:[['INT',2,24]],abDown:[['WIS',-2,3]]}:entry):entries}
export function withNecronomiconInput(run){const previous=inputOnly;inputOnly=true;try{return run()}finally{inputOnly=previous}}
export function necronomiconInputOnly(){return inputOnly}
export function necronomiconOwnedState(){
 if(readingScope)return readingScope.state;const live=sheetState(),id=genv.__sheetId&&genv.__sheetId();if(!live?.C||live.C.name!==B.name||!B.cid||B.cid!==id)return undefined;
 if(readingOwn(live.C,'necronomiconReading')&&necronomiconProblems(live.C.necronomiconReading).length)return undefined;
 return live.state&&readingOwn(live.state,'necronomiconReading')?live.state.necronomiconReading:undefined;
}
export function necronomiconAbilityProjection(){const state=necronomiconOwnedState();return necronomiconProblems(state).length?{ok:false}:necronomiconProjection(state,{INT:+B.base?.INT,WIS:+B.base?.WIS})}
export function necronomiconPermanentEntry(entry){return entry.kind!=='item'&&!entry.toggle&&!entry.consume&&!entry.cond}
function readingAbilityAffected(entry,key){return ['abUp','abDown','abSet'].some(field=>Array.isArray(entry[field])&&entry[field].some(row=>row[0]===key))||!!(entry.abPick||entry.abUpPick)}
export function necronomiconInputReview(active,entries,customization){
 const result={INT:[],WIS:[]};for(const key of ['INT','WIS']){
  if(active.some(row=>row.fx&&['abil','setsc'].some(field=>row.fx[field]?.[0]===key)))result[key].push('item-ability-effect');
  if(entries.some(entry=>readingAbilityAffected(entry,key)&&(!necronomiconPermanentEntry(entry)||entry.abSet||entry.abPick?.set)))result[key].push('conditional-or-setting-ability-effect');
  const custom=customization&&customization['n:ab-'+key];if(custom&&typeof custom==='object'&&(custom.b!=null&&custom.b!==''||custom.o!=null&&custom.o!==''))result[key].push('custom-ability-adjustment');
 }return result;
}
export function necronomiconProjectionMirror(){const state=necronomiconOwnedState();return necronomiconProblems(state).length?undefined:structuredClone(state)}
