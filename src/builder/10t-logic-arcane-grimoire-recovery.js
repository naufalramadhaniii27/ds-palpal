/* Source-certified Arcane Recovery capacity; no item charge or additional use. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,sheetState,fxo,gx,classDef} from './00-env.js';
import {arcaneGrimoireRecoveryProfile,canonicalArcaneGrimoireDefinition} from '../data/lib/arcane-grimoire-recovery-profiles.js';
import {arcaneGrimoireNativeSource,arcaneGrimoireNativeDefinition,arcaneGrimoireRecoveryWitnessProblems} from '../data/lib/arcane-grimoire-recovery-source.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
let legacyComparison=false;
function build(){return lateGet('B');}
function owned(){const live=sheetState();return live?.C&&build()?.cid&&build().cid===genv.__sheetId?.()?live:null;}
function cloneOwn(value){if(value===null||typeof value!=='object')return value;const out=Array.isArray(value)?[]:{};for(const k of Reflect.ownKeys(value)){if(Array.isArray(value)&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(value,k);if(own(d,'value'))d.value=cloneOwn(d.value);Object.defineProperty(out,k,d);}return out;}
function futureCapability(){const live=owned();return live&&own(live.C,'arcaneGrimoireRecovery')&&arcaneGrimoireRecoveryWitnessProblems(live.C.arcaneGrimoireRecovery).length?{value:live.C.arcaneGrimoireRecovery}:null;}
export function arcaneGrimoireRecoveryOwnFuture(){return !!futureCapability();}
function nativeFrame(row,index,ATT){
 const B=build(),item=key(row);return {item,row,attunement:ATT?.rows?.[index],originalBookRows:genv.WXI?.tce,originalCatalogRows:lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]),resolvedRow:lateGet('DMAP')?.[item],customItems:B.custLib||[],fxOverrides:fxo()||{},gxItems:gx().item||{}};
}
function nativeSource(row,index,ATT){return arcaneGrimoireNativeSource(nativeFrame(row,index,ATT));}
function nativeWizardRule(){const rules=classDef('Wizard')?.res;if(!Array.isArray(rules))return false;const rows=rules.filter(row=>row.n==='Arcane Recovery');return rows.length===1&&rows[0].max===1&&rows[0].reset==='long';}
export function arcaneGrimoireResourceBinding(ctx){
 const parts=(ctx.i.parts||[]).filter(part=>part.cls==='Wizard');if(parts.length!==1||!nativeWizardRule())return null;const level=parts[0].lv;
 if(!Number.isSafeInteger(level)||level<1||level>20)return null;
 const expected=ctx.i.B.cls==='Wizard'?'r-arcane-recovery':'m-'+ctx.q.slugK('Wizard')+'-arcane-recovery',rows=ctx.C.res||[];
 const indices=rows.flatMap((row,index)=>row.k===expected&&row.n==='Arcane Recovery'&&!row.item&&Number.isSafeInteger(row.max)&&row.max>0&&row.reset==='long'?[index]:[]);
 return indices.length===1?{index:indices[0],wizardLevel:level}:null;
}
export function arcaneGrimoireRecoveryProjection(C,ATT,binding){
 if(legacyComparison)return undefined;const future=futureCapability();if(future)return cloneOwn(future.value);
 if(!binding)return undefined;const resource=C.res?.[binding.index];if(!resource||C.res.filter(row=>row.k===resource.k).length!==1)return undefined;
 const sources=(build().inv||[]).flatMap((row,index)=>{const profile=arcaneGrimoireRecoveryProfile(key(row));return profile&&nativeSource(row,index,ATT).certified?[{index,item:key(row),itemFingerprint:profile.fingerprint}]:[];});
 if(!sources.length)return undefined;
 const cap={v:1,bonus:1,sources,inventoryFingerprint:canonicalArcaneGrimoireDefinition(C.inv),resource:{key:resource.k,index:binding.index,max:resource.max,reset:resource.reset},wizardLevel:binding.wizardLevel};return arcaneGrimoireRecoveryWitnessProblems(cap).length?undefined:cap;
}
export function arcaneGrimoireLegacySourcesSafe(){
 const live=owned();if(live&&own(live.C,'arcaneGrimoireRecovery'))return false;const ATT=lateGet('attunementState')();
 return (build().inv||[]).every((row,index)=>!arcaneGrimoireRecoveryProfile(key(row))||arcaneGrimoireNativeDefinition(nativeFrame(row,index,ATT)).certified);
}
export function withArcaneGrimoireLegacyComparison(run){if(!arcaneGrimoireLegacySourcesSafe())throw Error('Review the original Arcane Grimoire source.');const previous=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=previous;}}
