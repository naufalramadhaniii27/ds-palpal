/* Paired original current artifacts; attachment history is not inventory equipment. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx} from './00-env.js';
import {vecnaGraftProfile,vecnaGraftProfiles,vecnaGraftNativeGx,canonical} from '../data/lib/vecna-graft-profiles.js';
import {createVecnaGrafts,vecnaGraftsProblems,vecnaGraftsProjection,vecnaGraftMarker,vecnaGraftsRawState} from '../data/lib/vecna-grafts.js';
import {vecnaGraftSourcesProblems,vecnaGraftSourcesSupported,vecnaGraftSourceStatus,vecnaGraftCertificateCurrent} from '../data/lib/vecna-graft-source.js';
export {vecnaGraftSourcesProblems,vecnaGraftSourcesSupported};
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
const foreign=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption','travelGoat','instrumentSpells'];
let scope=null,legacyComparison=false;
function build(){return lateGet('B')}
function owner(){const live=sheetState();return live?.C&&build()?.cid===genv.__sheetId?.()?live:null}
function copy(v){if(v===null||typeof v!=='object')return v;const out=Array.isArray(v)?[]:{};for(const k of Reflect.ownKeys(v)){if(Array.isArray(v)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(v,k);if(own(d,'value'))d.value=copy(d.value);Object.defineProperty(out,k,d)}return out}
function exact(v,keys){return !!v&&typeof v==='object'&&!Array.isArray(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)&&Object.getOwnPropertyDescriptor(v,k).enumerable&&own(Object.getOwnPropertyDescriptor(v,k),'value'))}
export function vecnaGraftItemName(name){return vecnaGraftProfiles().some(p=>p.item===name)}
export function vecnaGraftCatalog(){return vecnaGraftProfiles().map(p=>({id:p.id,profile:p.id,part:p.part,item:p.item,itemFingerprint:p.itemFingerprint}))}
export function vecnaGraftsOwnedState(){if(scope)return scope.state;const live=owner();return live&&own(live.state,'vecnaGrafts')?live.state.vecnaGrafts:undefined}
export function withVecnaGraftsProjection(state,run){const prior=scope;scope={state};try{return run()}finally{scope=prior}}
function supported(state){return state!==undefined&&vecnaGraftsProblems(state).length===0}
export {vecnaGraftMarker};
function original(rows,p){return Array.isArray(rows)&&rows.filter(row=>Array.isArray(row)&&row[0]===p.item).length===1&&canonical(rows.find(row=>Array.isArray(row)&&row[0]===p.item))===p.itemFingerprint}
function singletonOriginalRow(row){return !!row&&typeof row.n==='string'&&canonical(row)!==null&&(!own(row,'q')||['number','string'].includes(typeof row.q)&&Number(row.q)===1)&&!foreign.some(k=>own(row,k))}
function unmodifiedNames(names){return !names.some(n=>own(fxo()||{},n)||own(gx().item||{},n)&&!vecnaGraftNativeGx(n,gx().item[n]))&&!(build().custLib||[]).some(r=>names.includes(Array.isArray(r)?r[0]:r?.n))}
function sourceFrame(row,index,profileId){const p=vecnaGraftProfile(profileId),ATT=lateGet('attunementState')();if(!p||!singletonOriginalRow(row)||!unmodifiedNames([row.n,key(row),p.item]))return null;if(!original(lateGet('DM14S')||DMGI,p)||canonical(lateGet('DMAP')?.[row.n])!==p.itemFingerprint)return null;return {...p,attuned:ATT.rows[index]?.requires===true&&ATT.rows[index]?.attuned===true}}
export function vecnaGraftSourceForRow(row,index,profileId,state=vecnaGraftsOwnedState()){const p=sourceFrame(row,index,profileId),marker=vecnaGraftMarker(row);if(!p||!marker.ok)return {ok:false,reason:'actual-current-attuned-artifact-required'};if(marker.present&&(!supported(state)||!state.physical.some(v=>v.id===marker.id&&v.profile===p.id&&v.itemFingerprint===p.itemFingerprint)||(build().inv||[]).filter(r=>vecnaGraftMarker(r).id===marker.id).length!==1))return {ok:false,reason:'actual-unique-physical-artifact-required'};return {ok:true,id:marker.id,profile:p.id,part:p.part,item:p.item,itemFingerprint:p.itemFingerprint,attuned:p.attuned}}
function bindings(C,ATT){const state=vecnaGraftsOwnedState();if(!supported(state))return [];return (build().inv||[]).flatMap((row,index)=>{const marker=vecnaGraftMarker(row),p=marker.ok&&state.physical.find(p=>p.id===marker.id);if(!p)return [];const source=vecnaGraftSourceForRow(row,index,p.profile,state),current=C.inv?.[index];return source.ok&&source.attuned===true&&current?.attunedActive===true?[{id:p.id,profile:p.profile,index,itemFingerprint:p.itemFingerprint,inventoryName:current.n,inventoryKey:own(current,'key')?current.key:null}]:[]})}
function future(){const live=owner();return live&&((own(live.state,'vecnaGrafts')&&!supported(live.state.vecnaGrafts))||(own(live.C,'vecnaGrafts')&&!supported(live.C.vecnaGrafts))||(own(live.C,'vecnaGraftSources')&&vecnaGraftSourcesProblems(live.C.vecnaGraftSources).length))}
export function vecnaGraftsOwnFuture(){return !!future()&&own(owner().C,'vecnaGrafts')}
export function vecnaGraftSourcesOwnFuture(){return !!future()&&own(owner().C,'vecnaGraftSources')}
export function vecnaGraftsProjectionMirror(){if(legacyComparison)return undefined;const live=owner();return future()?own(live.C,'vecnaGrafts')?copy(live.C.vecnaGrafts):undefined:vecnaGraftsOwnedState()}
export function vecnaGraftSourceWitness(C,ATT){if(legacyComparison)return undefined;const live=owner();if(future())return own(live.C,'vecnaGraftSources')?copy(live.C.vecnaGraftSources):undefined;const state=vecnaGraftsOwnedState();if(!supported(state))return undefined;return {v:1,inventoryFingerprint:canonical(C.inv),authorityFingerprint:canonical(state),bindings:bindings(C,ATT)}}
export function vecnaGraftsSheetProjection(C,ATT){if(legacyComparison)return {flags:C.itemAdv,capability:undefined};const cap=vecnaGraftSourceWitness(C,ATT),flags=(C.itemAdv||[]).filter(row=>row.s!=='Eye and Hand of Vecna');if(future()||!cap||!vecnaGraftSourcesSupported({...C,vecnaGrafts:vecnaGraftsOwnedState(),vecnaGraftSources:cap}))return {flags,capability:cap};const result=vecnaGraftsProjection(vecnaGraftsOwnedState(),cap.bindings.map(b=>({id:b.id,profile:b.profile,itemFingerprint:b.itemFingerprint,attuned:true,originalCurrentSource:true})));if(result.ok&&result.initiativeAdvantage)flags.push({k:'Initiative',s:'Eye and Hand of Vecna'});return {flags,capability:cap}}
export function vecnaGraftSourceStamp(){const names=vecnaGraftProfiles().map(p=>p.item).filter(name=>typeof name==='string');return canonical({inventory:build().inv,state:vecnaGraftsOwnedState(),original:(lateGet('DM14S')||DMGI).filter(row=>Array.isArray(row)&&names.includes(row[0])),resolved:names.map(n=>[n,lateGet('DMAP')?.[n]]),custom:build().custLib,fx:names.map(n=>[n,own(fxo()||{},n),(fxo()||{})[n]]),gx:names.map(n=>[n,own(gx().item||{},n),(gx().item||{})[n]])})}
export function vecnaGraftsLegacySourcesSafe(){const live=owner();return !live||!own(live.C,'vecnaGrafts')&&!own(live.C,'vecnaGraftSources')&&!(build().inv||[]).some(row=>own(row,'vecnaGraft'))}
export function withVecnaGraftsLegacyComparison(run){const prior=legacyComparison;legacyComparison=true;try{return run()}finally{legacyComparison=prior}}
export function vecnaGraftInitiativeAllowed(C,S){return vecnaGraftSourceStatus(C,S).initiativeAdvantage===true}
function relevantEntries(table,names){return Object.fromEntries(names.filter(name=>own(table,name)).map(name=>[name,table[name]]))}
export function nativeVecnaGraftSourceCurrent(C,S=sheetState()?.state){
 if(!vecnaGraftSourcesSupported(C,S))return null;const cap=C.vecnaGraftSources,names=[...new Set(cap.bindings.flatMap(b=>[vecnaGraftProfile(b.profile).item,b.inventoryName,b.inventoryKey].filter(n=>typeof n==='string')))];
 const B=build(),matching=B?.cid===genv.__sheetId?.()&&B.name===C.name,frame={originalCatalogRows:lateGet('DM14S')||DMGI,fxOverrides:relevantEntries(fxo()||{},names),gxItems:relevantEntries(gx().item||{},names)};
 if(matching){frame.resolvedRows=relevantEntries(lateGet('DMAP')||{},names);frame.customItems=B.custLib||[]}
 const out=vecnaGraftCertificateCurrent(C,S,frame);return {current:out.current===true,stamp:typeof out.stamp==='string'?out.stamp:'unsupported-vecna-source'};
}
export function vecnaGraftsRetainedProjection(C,state){if(!supported(state))return null;const next=copy(C);next.vecnaGrafts=copy(state);next.itemAdv=(next.itemAdv||[]).filter(row=>!(row.k==='Initiative'&&row.s==='Eye and Hand of Vecna'));next.vecnaGraftSources={v:1,inventoryFingerprint:canonical(next.inv),authorityFingerprint:canonical(state),bindings:[]};return next}
genv.__nativeVecnaGraftSourceCurrent=nativeVecnaGraftSourceCurrent;

/* Production-shaped additive input for the existing native item-set phase. */
export function vecnaGraftStrengthSource(){
 const state=vecnaGraftsOwnedState();if(vecnaGraftsProblems(state).length)return null;
 const view=vecnaGraftsProjection(state,[]),hands=view.ok?view.physical.filter(p=>p.part==='hand'&&p.present&&p.attached===true):[];if(hands.length!==1)return null;
 const inventory=lateGet('B').inv||[],refs=inventory.map((row,index)=>({row,index})).filter(v=>vecnaGraftMarker(v.row).id===hands[0].id);if(refs.length!==1)return null;
 const {row,index}=refs[0],source=vecnaGraftSourceForRow(row,index,'current-hand',state);return source.ok&&source.attuned===true?{...source,index,eq:row.eq}:null;
}
function handHistoryBlocksUnmarked(){const state=vecnaGraftsOwnedState(),live=owner();if(state!==undefined&&(vecnaGraftsProblems(state).length||state.physical.some(p=>p.part==='hand')))return true;return !!live&&[live.C,live.state].some(value=>{const raw=vecnaGraftsRawState(value);return raw.present&&(!raw.ok||raw.state.physical.some(p=>p.part==='hand'))})}
function vecnaNegativeStrengthNames(){
 const state=vecnaGraftsOwnedState(),view=vecnaGraftsProblems(state).length?null:vecnaGraftsProjection(state,[]),blocked=handHistoryBlocksUnmarked();
 return (lateGet('B').inv||[]).flatMap((row,index)=>{if(!sourceFrame(row,index,'current-hand'))return [];const marker=vecnaGraftMarker(row);if(!marker.present)return blocked?[row.n]:[];const physical=view?.ok?view.physical.find(p=>p.id===marker.id&&p.profile==='current-hand'):null;return marker.ok&&physical?.present&&physical.attached===true?[]:[row.n]});
}
export function vecnaGraftAbilitySources(entries){const negative=vecnaNegativeStrengthNames(),filtered=entries.filter(entry=>!negative.includes(entry.n)||canonical(entry.fx?.setsc)!==canonical(['STR',20])),source=vecnaGraftStrengthSource();return source&&source.eq===false?filtered.concat([{n:lateGet('B').inv[source.index].n,mi:source.item,fx:{setsc:['STR',20]}}]):filtered}

export function vecnaGraftsLegacyComparisonActive(){return legacyComparison}
export function vecnaHandStrengthRelevant(){const state=vecnaGraftsOwnedState();return (build().inv||[]).some(row=>key(row)==='Hand of Vecna')||supported(state)&&state.physical.some(p=>p.part==='hand')}
function handSourceReceipt(row,index,profile,definitionFingerprint,physicalId=null,custom=null){return {index,inventoryName:row.n,inventoryKey:own(row,'key')?row.key:null,profile,definitionFingerprint,physicalId,custom}}
function supportedHandSetter(declared,entry,definition){return Array.isArray(declared)&&declared.length===2&&declared[0]==='STR'&&Number.isFinite(declared[1])&&canonical(entry.fx.setsc)===canonical(declared)&&canonical(definition)!==null}
function customHandProof(row,index,AFX){
 const p=vecnaGraftProfile('current-hand'),names=[row.n,key(row),p.item],FX=fxo()||{},overrideName=names.find(n=>own(FX,n)),customRow=(build().custLib||[]).find(r=>names.includes(Array.isArray(r)?r[0]:r?.n));
 if(!overrideName&&!customRow)return null;const definition=overrideName?FX[overrideName]:customRow,kind=overrideName?'fxo':'custom-library',declared=kind==='custom-library'&&Array.isArray(definition)?definition[5]?.fx?.setsc:definition?.fx?.setsc,entry=AFX.find(e=>e.n===row.n&&e.fx?.setsc);
 if(!entry)return {mode:'inactive',source:null};const marker=vecnaGraftMarker(row);if(!marker.ok||!supportedHandSetter(declared,entry,definition))return {mode:'unverified',source:null};
 const custom={kind,definition:copy(definition)};return {mode:'custom-explicit',source:handSourceReceipt(row,index,'custom-hand',canonical(definition),marker.id,custom)};
}
function legacyHandProof(row,index){const p=vecnaGraftProfile('current-hand'),legacy=genv.DM14?.ov?.['Hand of Vecna'],resolved=lateGet('DMAP')?.[row.n],ATT=lateGet('attunementState')();return unmodifiedNames([row.n,key(row),p.item])&&canonical(legacy)===p.legacyFingerprint&&canonical(resolved)===p.legacyFingerprint&&row.eq===true&&ATT.rows[index]?.attuned===true&&!foreign.some(k=>own(row,k))?{mode:'legacy-original',source:handSourceReceipt(row,index,'legacy-hand',p.legacyFingerprint)}:null}
function originalHandProof(row,index,AFX){
 const p=vecnaGraftProfile('current-hand'),state=vecnaGraftsOwnedState(),source=vecnaGraftSourceForRow(row,index,p.id,state),marker=vecnaGraftMarker(row);
 if(source.ok){if(!source.attuned)return {mode:'inactive',source:null};if(!marker.present)return row.eq===true&&!handHistoryBlocksUnmarked()?{mode:'native-current-existing',source:handSourceReceipt(row,index,p.id,p.itemFingerprint)}:{mode:'inactive',source:null};
  const view=supported(state)?vecnaGraftsProjection(state,[]):null,physical=view?.ok?view.physical.find(v=>v.id===marker.id):null;if(!physical?.present||physical.attached!==true)return {mode:'inactive',source:null};return {mode:'native-current-graft',source:handSourceReceipt(row,index,p.id,p.itemFingerprint,marker.id)};}
 return legacyHandProof(row,index)||{mode:AFX.some(e=>e.n===row.n&&e.fx?.setsc)?'unverified':'inactive',source:null};
}
export function vecnaHandStrengthProofSource(AFX=[]){const rows=(build().inv||[]).map((row,index)=>({row,index})).filter(v=>key(v.row)==='Hand of Vecna');if(rows.length!==1)return {mode:rows.length?'unverified':'inactive',source:null};const {row,index}=rows[0];return customHandProof(row,index,AFX)||originalHandProof(row,index,AFX)}
