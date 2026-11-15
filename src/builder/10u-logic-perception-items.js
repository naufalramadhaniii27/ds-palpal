/* Source-qualified attributed flags; no saved item ledger. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx} from './00-env.js';
import {itemInUse} from '../data/lib/attunement.js';
import {perceptionItemProfile,canonicalPerceptionItemDefinition} from '../data/lib/perception-item-profiles.js';
import {perceptionItemSource,perceptionItemSourcesProblems,perceptionItemSourceStatus,perceptionItemCertificateCurrent} from '../data/lib/perception-item-source.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
let legacyComparison=false;
function build(){return lateGet('B');}
function owned(){const live=sheetState();return live?.C&&build()?.cid&&build().cid===genv.__sheetId?.()?live:null;}
function cloneOwn(value){if(value===null||typeof value!=='object')return value;const out=Array.isArray(value)?[]:{};for(const k of Reflect.ownKeys(value)){if(Array.isArray(value)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(value,k);if(own(d,'value'))d.value=cloneOwn(d.value);Object.defineProperty(out,k,d);}return out;}
function futureCapability(){const live=owned();return live&&own(live.C,'perceptionItemSources')&&perceptionItemSourcesProblems(live.C.perceptionItemSources).length?{value:live.C.perceptionItemSources}:null;}
export function perceptionItemsOwnFuture(){return !!futureCapability();}
function nativeItemName(row){const definition=lateGet('DMAP')?.[row.n];return perceptionItemProfile(key(row))?key(row):Array.isArray(definition)&&perceptionItemProfile(definition[0])?definition[0]:null;}
function legacySourceRows(){return typeof DM14==='undefined'?[]:Object.values(DM14.ov||{}).filter(row=>Array.isArray(row)&&perceptionItemProfile(row[0]));}
function sourceFrame(row,index,ATT,entry=null){const B=build(),item=entry?.mi||nativeItemName(row)||key(row);return {item,row,attunement:ATT?.rows?.[index],originalCatalogRows:lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]),legacyCatalogRows:legacySourceRows(),resolvedName:row.n,resolvedRow:lateGet('DMAP')?.[row.n],entryFx:entry?.fx,customItems:B.custLib||[],fxOverrides:fxo()||{},gxItems:gx().item||{}};}
function actualBindings(C,ATT,AFX){
 const rows=build().inv||[];return AFX.flatMap(entry=>{
  if(!perceptionItemProfile(entry.mi||entry.n))return [];
  const index=rows.findIndex((row,i)=>row.n===entry.n&&itemInUse(row,ATT.rows[i]));if(index<0)return [];
  const source=perceptionItemSource(sourceFrame(rows[index],index,ATT,entry));return source.ok?[{index,item:source.item,mode:source.mode,definitionFingerprint:source.definitionFingerprint,flags:source.flags,inventoryName:C.inv[index].n,inventoryKey:own(C.inv[index],'key')?C.inv[index].key:null}]:[];
 });
}
function sourceLabel(binding,label){const row=build().inv[binding.index];return binding.item===label||row?.n===label||key(row)===label;}
function qualifiedFlag(row,bindings,AFX){
 const known=perceptionItemProfile(row.s)||AFX.some(entry=>entry.n===row.s&&perceptionItemProfile(entry.mi||entry.n));if(!known||!['Perception','Initiative'].includes(row.k))return row;
 const source=bindings.find(binding=>sourceLabel(binding,row.s)&&binding.flags.includes(row.k));if(!source)return null;
 return source.mode==='native'&&row.k==='Perception'?{...row,ab:'WIS'}:row;
}
export function perceptionItemsProjection(C,ATT,AFX){
 if(legacyComparison)return {flags:C.itemAdv,capability:undefined};const future=futureCapability();if(future)return {flags:C.itemAdv,capability:cloneOwn(future.value)};
 const bindings=actualBindings(C,ATT,AFX),flags=(C.itemAdv||[]).map(row=>qualifiedFlag(row,bindings,AFX)).filter(Boolean);
 if(!bindings.length)return {flags,capability:undefined};const capability={v:1,inventoryFingerprint:canonicalPerceptionItemDefinition(C.inv),bindings};
 return {flags,capability:perceptionItemSourcesProblems(capability).length?undefined:capability};
}
export function perceptionItemsLegacySourcesSafe(){
 const live=owned();if(live&&own(live.C,'perceptionItemSources'))return false;const ATT=lateGet('attunementState')();
 return (build().inv||[]).every((row,index)=>!nativeItemName(row)||!itemInUse(row,ATT.rows[index])||perceptionItemSource(sourceFrame(row,index,ATT)).ok);
}
export function withPerceptionItemsLegacyComparison(run){if(!perceptionItemsLegacySourcesSafe())throw Error('Review the original alertness item source.');const previous=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=previous;}}

function sourceEntries(table,names){const out={};for(const name of names){if(!own(table,name))continue;Object.defineProperty(out,name,Object.getOwnPropertyDescriptor(table,name));}return out;}
function globalSourceFrame(C){
 const cap=C.perceptionItemSources,items=cap.bindings.map(binding=>binding.item),names=[...new Set(items.concat(cap.bindings.flatMap(binding=>[binding.inventoryName,binding.inventoryKey].filter(name=>typeof name==='string'))))];
 const frame={originalCatalogRows:(lateGet('DM14S')||DMGI).filter(row=>Array.isArray(row)&&items.includes(row[0])),legacyCatalogRows:legacySourceRows().filter(row=>items.includes(row[0])),fxOverrides:sourceEntries(fxo()||{},names),gxItems:sourceEntries(gx().item||{},names)};
 const B=build(),matching=B?.cid===genv.__sheetId?.()&&B.name===C.name;
 return matching?{...frame,resolvedRows:sourceEntries(lateGet('DMAP')||{},names),customItems:(B.custLib||[]).filter(row=>names.includes(Array.isArray(row)?row[0]:row?.n))}:frame;
}
export function nativePerceptionItemSourceCurrent(C){
 if(typeof DMGI==='undefined')return null;
 if(!perceptionItemSourceStatus(C).verified)return null;
 const frame=globalSourceFrame(C),stamp=canonicalPerceptionItemDefinition(frame);if(stamp===null)return {current:false,stamp:'unsupported-perception-item-source'};
 const result=perceptionItemCertificateCurrent(C,frame);return {current:result.current===true,stamp};
}

genv.__nativePerceptionItemSourceCurrent=nativePerceptionItemSourceCurrent;
