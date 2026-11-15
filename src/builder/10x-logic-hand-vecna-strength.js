/* Native math proof: no score arithmetic or saved acquisition state. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx} from './00-env.js';
import {canonical,vecnaGraftProfile,vecnaGraftNativeGx} from '../data/lib/vecna-graft-profiles.js';
import {vecnaGraftsProblems} from '../data/lib/vecna-grafts.js';
import {handVecnaStrengthWitness,handVecnaStrengthProblems,handVecnaStrengthMathStatus,handVecnaStrengthRelevant} from '../data/lib/hand-vecna-strength.js';
import {vecnaGraftsOwnedState,vecnaGraftsLegacyComparisonActive,vecnaHandStrengthProofSource} from './10w-logic-vecna-grafts.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),HAND=vecnaGraftProfile('current-hand');
function owned(){const live=sheetState();return live&&lateGet('B')?.cid===genv.__sheetId?.()?live:null}
function unsupportedGraft(owner){const descriptor=owner&&Object.getOwnPropertyDescriptor(owner,'vecnaGrafts');return !!descriptor&&(!own(descriptor,'value')||!descriptor.enumerable||vecnaGraftsProblems(descriptor.value).length>0)}
function preserve(live){if(!live)return false;const descriptor=Object.getOwnPropertyDescriptor(live.C,'handVecnaStrength');return unsupportedGraft(live.C)||unsupportedGraft(live.state)||!!descriptor&&(!own(descriptor,'value')||!descriptor.enumerable||handVecnaStrengthProblems(descriptor.value).length>0)}
function projectedSource(C,source){if(source===null)return null;const row=C.inv?.[source.index];return row?{...source,inventoryName:row.n,inventoryKey:own(row,'key')?row.key:null}:source}
function plannedAuthority(){const state=vecnaGraftsOwnedState();return state===undefined?{}:{vecnaGrafts:state}}
function relevantProjection(C,authority,live){return !!live&&own(live.C,'handVecnaStrength')||handVecnaStrengthRelevant({inv:C.inv,abilities:C.abilities},authority)}
export function projectHandVecnaStrength(C,AFX){
 if(vecnaGraftsLegacyComparisonActive())return C;const live=owned();
 if(preserve(live)){const descriptor=Object.getOwnPropertyDescriptor(live.C,'handVecnaStrength');if(descriptor)Object.defineProperty(C,'handVecnaStrength',descriptor);return C}
 const authority=plannedAuthority();if(!relevantProjection(C,authority,live))return C;
 const proof=vecnaHandStrengthProofSource(AFX),cap=handVecnaStrengthWitness(C,authority,proof.mode,projectedSource(C,proof.source));if(cap!==null)C.handVecnaStrength=cap;return C;
}
function entries(table,names){const out={};for(const name of names)if(own(table,name))Object.defineProperty(out,name,Object.getOwnPropertyDescriptor(table,name));return out}
function original(rows,name,fingerprint){if(!Array.isArray(rows))return false;const found=rows.filter(row=>Array.isArray(row)&&row[0]===name);return found.length===1&&canonical(found[0])===fingerprint}
function nativeFrame(C){const source=C.handVecnaStrength.source,names=[...new Set([HAND.item,source.inventoryName,source.inventoryKey].filter(n=>typeof n==='string'))],B=lateGet('B'),matching=B?.cid===genv.__sheetId?.()&&B.name===C.name;return {names,original:C.handVecnaStrength.mode==='legacy-original'?[]:(lateGet('DM14S')||DMGI).filter(row=>Array.isArray(row)&&row[0]===HAND.item),legacy:genv.DM14?.ov?.['Hand of Vecna'],fx:entries(fxo()||{},names),gx:entries(gx().item||{},names),resolved:matching?entries(lateGet('DMAP')||{},names):null,custom:matching?(B.custLib||[]).filter(row=>names.includes(Array.isArray(row)?row[0]:row?.n)):null}}
function nativeCurrent(cap,frame){
 if(cap.mode!=='legacy-original'&&!original(frame.original,HAND.item,HAND.itemFingerprint)||frame.names.some(name=>own(frame.fx,name)||own(frame.gx,name)&&!vecnaGraftNativeGx(name,frame.gx[name])))return false;
 const fingerprint=cap.mode==='legacy-original'?HAND.legacyFingerprint:HAND.itemFingerprint;if(cap.mode==='legacy-original'&&canonical(frame.legacy)!==fingerprint)return false;
 if(frame.resolved!==null&&canonical(frame.resolved[cap.source.inventoryName])!==fingerprint)return false;return frame.custom===null||frame.custom.length===0;
}
function customCurrent(cap,frame){const custom=cap.source.custom;if(custom.kind==='fxo')return frame.names.some(name=>own(frame.fx,name)&&canonical(frame.fx[name])===canonical(custom.definition));return custom.kind==='custom-library'&&(frame.custom===null||frame.custom.some(row=>canonical(row)===canonical(custom.definition)))}
export function nativeHandVecnaStrengthCurrent(C,S=sheetState()?.state){
 const status=handVecnaStrengthMathStatus(C,S);if(status.reviewRequired||!C?.handVecnaStrength?.source)return null;
 const cap=C.handVecnaStrength,frame=nativeFrame(C),stamp=canonical({cap,frame});if(stamp===null)return {current:false,stamp:'unsupported-hand-strength-source'};
 return {current:cap.mode==='custom-explicit'?customCurrent(cap,frame):nativeCurrent(cap,frame),stamp};
}
genv.__nativeHandVecnaStrengthCurrent=nativeHandVecnaStrengthCurrent;
/* Final sheet boundary preserves opaque own-undefined/descriptors beyond patch delete semantics. */
export function restoreHandVecnaStrengthFuture(C){if(vecnaGraftsLegacyComparisonActive())return C;const live=owned();if(!preserve(live))return C;const descriptor=Object.getOwnPropertyDescriptor(live.C,'handVecnaStrength');if(descriptor)Object.defineProperty(C,'handVecnaStrength',descriptor);else delete C.handVecnaStrength;return C}
