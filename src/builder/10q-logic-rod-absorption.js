/* Readonly native source/knowledge witnesses; actor edition never proves item source. */
import {lateGet} from './01b-logic-late-ports.js';
import {QRY} from './01a-logic-query-registry.js';
import {genv,sheetState,fxo,gx,featDef,speciesDef,full14,classDef,cfFullText} from './00-env.js';
import {rodAbsorptionProblems} from '../data/lib/rod-absorption.js';
import {rodAbsorptionNativeSource,rodAbsorptionInventorySourceSupported,rodAbsorptionMarkerSource,rodAbsorptionPhysicalSource,rodAbsorptionSpellWitness,rodAbsorptionSourceWitnessProblems,canonicalRodAbsorptionDefinition} from '../data/lib/rod-absorption-source.js';
let scope=null,legacyComparison=false;const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k);
function build(){return lateGet('B');}
function owned(){const live=sheetState();return live?.C&&build()?.cid&&build().cid===genv.__sheetId?.()?live:null;}
export function rodAbsorptionCatalog(){return rodAbsorptionNativeSource(lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]),{customItems:build()?.custLib||[],fxOverrides:fxo(),gxItems:gx().item,resolvedRow:lateGet('DMAP')?.['Rod of Absorption']});}
export function withRodAbsorptionProjection(state,run){const previous=scope;scope={state};try{return run()}finally{scope=previous;}}
export function rodAbsorptionOwnedState(){const live=owned();if(live&&own(live.C,'rodAbsorption')&&rodAbsorptionProblems(live.C.rodAbsorption).length)return live.C.rodAbsorption;if(live&&own(live.state,'rodAbsorption')&&rodAbsorptionProblems(live.state.rodAbsorption).length)return live.state.rodAbsorption;if(scope)return scope.state;return live&&own(live.state,'rodAbsorption')?live.state.rodAbsorption:undefined;}
export function rodAbsorptionProjectionMirror(){if(legacyComparison)return undefined;const state=rodAbsorptionOwnedState();return state===undefined?undefined:structuredClone(state);}
export function rodAbsorptionOwnFuture(){if(legacyComparison)return false;const live=owned();if(live&&((own(live.C,'rodAbsorption')&&rodAbsorptionProblems(live.C.rodAbsorption).length>0)||(own(live.state,'rodAbsorption')&&rodAbsorptionProblems(live.state.rodAbsorption).length>0)))return true;return !!scope&&scope.state!==undefined&&rodAbsorptionProblems(scope.state).length>0;}
export function rodAbsorptionInventoryRows(rows){return rows;}
export function rodAbsorptionSourceWitness(ATT,inventory){
 if(legacyComparison||!rodAbsorptionRelevant())return undefined;
 const live=owned();if(live&&own(live.C,'rodAbsorptionSources')&&rodAbsorptionSourceWitnessProblems(live.C.rodAbsorptionSources).length)return structuredClone(live.C.rodAbsorptionSources);
 const state=rodAbsorptionOwnedState(),source=rodAbsorptionCatalog(),rows=build()?.inv||[];
 return {v:1,inventoryFingerprint:canonicalRodAbsorptionDefinition(inventory),source,rows:rows.flatMap((row,index)=>{const physical=rodAbsorptionPhysicalSource(row,state,source,ATT?.rows?.[index],rows);return physical?[{index,id:physical.id,holding:true,allocatedAttunement:true}]:[]})};
}
export function rodAbsorptionCastingWitness(projectedCharacter,spellCatalog){
 if(!['casterParts','spLists','autoSpells'].every(k=>typeof QRY[k]==='function'))return {ok:false,reason:'native-casting-queries-unavailable'};
 try{const selected=QRY.spLists(),parts=rodClassKnowledgeParts(selected),always=QRY.autoSpells(),grants=rodKnowledgeGrants(spellCatalog,always);for(const grant of grants)if(!parts.some(p=>p.cls===grant.k))parts.push({cls:grant.k,maximumPreparedLevel:null});return rodAbsorptionSpellWitness(projectedCharacter,spellCatalog,parts,selected,always.concat(grants));}catch{return {ok:false,reason:'native-casting-context-unavailable'};}
}

export function rodAbsorptionRelevant(){
 if(legacyComparison)return false;
 const live=owned(),rows=build()?.inv||[];
 return rows.some(row=>row&&(row.n==='Rod of Absorption'||row.key==='Rod of Absorption'||own(row,'rodAbsorption')))||!!live&&(['rodAbsorption','rodAbsorptionSources'].some(k=>own(live.C,k))||own(live.state,'rodAbsorption'));
}
export function rodAbsorptionLegacySourcesSafe(){
 const live=owned();if(live&&(own(live.C,'rodAbsorption')||own(live.C,'rodAbsorptionSources')||own(live.state,'rodAbsorption')))return false;
 const rows=build()?.inv||[];if(rows.some(row=>own(row,'rodAbsorption')||row&&(row.n==='Rod of Absorption'||row.key==='Rod of Absorption')&&!rodAbsorptionInventorySourceSupported(row)))return false;
 return !rows.some(row=>row&&(row.n==='Rod of Absorption'||row.key==='Rod of Absorption'))||!!rodAbsorptionCatalog();
}
export function withRodAbsorptionLegacyComparison(run){
 if(!rodAbsorptionLegacySourcesSafe())throw Error('Original Rod of Absorption source history must be reviewed.');
 const previous=legacyComparison;legacyComparison=true;try{return run()}finally{legacyComparison=previous;}
}
const ROD_APPLY_PLANS=new WeakMap();
function applyBytes(value){return canonicalRodAbsorptionDefinition(value);}
function markerDowngrade(previous,next){
 return (previous||[]).some(row=>{
  if(!own(row,'rodAbsorption'))return false;
  const marker=row.rodAbsorption,name=own(row,'key')?row.key:row.n;
  const matches=(next||[]).filter(candidate=>(own(candidate,'key')?candidate.key:candidate.n)===name);
  return matches.length>0&&!matches.some(candidate=>own(candidate,'rodAbsorption')&&applyBytes(candidate.rodAbsorption)===applyBytes(marker));
 });
}
function futureFieldPreserved(current,candidate,field){
 if(!own(current,field))return true;
 const problems=field==='rodAbsorption'?rodAbsorptionProblems(current[field]):rodAbsorptionSourceWitnessProblems(current[field]);
 return !problems.length||own(candidate,field)&&applyBytes(candidate[field])===applyBytes(current[field]);
}
function applyPayload(candidate){
 const live=owned(),current=build();if(!live)return {ok:true,changed:false,build:current};
 if(!candidate||!Array.isArray(candidate.inv)||markerDowngrade(live.C.inv,current.inv))return {ok:false,reason:'rod-source-history-must-be-preserved'};
 for(const field of ['rodAbsorption','rodAbsorptionSources']){
  if(!futureFieldPreserved(live.C,candidate,field))return {ok:false,reason:'unsupported-rod-source-must-be-preserved'};
 }
 if(own(live.state,'rodAbsorption')){
  if(rodAbsorptionProblems(live.state.rodAbsorption).length){const expected=own(live.C,'rodAbsorption')?live.C.rodAbsorption:live.state.rodAbsorption;return own(candidate,'rodAbsorption')&&applyBytes(candidate.rodAbsorption)===applyBytes(expected)?{ok:true,changed:false,build:current}:{ok:false,reason:'unsupported-rod-energy-history'};}
  if(!own(candidate,'rodAbsorption')||applyBytes(candidate.rodAbsorption)!==applyBytes(live.state.rodAbsorption))return {ok:false,reason:'latest-rod-energy-history-required'};
  if(own(live.C,'rodAbsorption')&&applyBytes(live.C.rodAbsorption)!==applyBytes(live.state.rodAbsorption))return {ok:false,reason:'current-rod-energy-mirror-required'};
 }else if(own(live.C,'rodAbsorption')&&!rodAbsorptionProblems(live.C.rodAbsorption).length)return {ok:false,reason:'rod-energy-authority-required'};
 return {ok:true,changed:false,build:current};
}
export function rodAbsorptionApplyPlan(candidate){
 const live=sheetState(),current=build(),signature=applyBytes([live?.C,live?.state,current,candidate]),plan=applyPayload(candidate);
 if(!plan.ok)return plan;if(signature===null||signature!==applyBytes([sheetState()?.C,sheetState()?.state,build(),candidate]))return {ok:false,reason:'stale-rod-apply-context'};
 ROD_APPLY_PLANS.set(plan,{C:live?.C,S:live?.state,B:current,candidate,cid:genv.__sheetId?.(),readOnly:live?.readOnly,signature});return plan;
}
export function rodAbsorptionApplyCurrent(plan,phase='pending'){
 const ticket=ROD_APPLY_PLANS.get(plan),live=sheetState();return !!(ticket&&['pending','committed'].includes(phase)&&live?.C===ticket.C&&live?.state===ticket.S&&build()===ticket.B&&genv.__sheetId?.()===ticket.cid&&live?.readOnly===ticket.readOnly&&applyBytes([live.C,live.state,build(),ticket.candidate])===ticket.signature);
}
function nonmagicalFrameKnown(live){
 if(!live||rodAbsorptionProblems(live.state?.rodAbsorption).length)return false;
 if(own(live.C,'rodAbsorption')&&applyBytes(live.C.rodAbsorption)!==applyBytes(live.state.rodAbsorption))return false;
 return !own(live.C,'rodAbsorptionSources')||!rodAbsorptionSourceWitnessProblems(live.C.rodAbsorptionSources).length;
}
export function rodAbsorptionNonmagicalRow(row){
 if(!rodAbsorptionInventorySourceSupported(row))return false;
 const live=owned(),state=rodAbsorptionOwnedState();
 if(!nonmagicalFrameKnown(live)||rodAbsorptionProblems(state).length)return false;
 const source=rodAbsorptionCatalog(),marker=row.rodAbsorption,rows=build()?.inv||[];
 if(!rodAbsorptionMarkerSource(marker,source,own(row,'key')?row.key:row.n))return false;
 if(rows.filter(r=>r?.rodAbsorption?.id===marker.id).length!==1)return false;
 if(!own(live.C,'rodAbsorption')&&!(live.C.inv||[]).some(r=>rodAbsorptionMarkerSource(r?.rodAbsorption,source,own(r,'key')?r.key:r?.n)&&applyBytes(r.rodAbsorption)===applyBytes(marker)))return false;
 const rod=state.rods.find(r=>r.id===marker.id);
 return !!rod&&rod.profile===source.nativeProfile&&rod.fingerprint===source.itemFingerprint&&rod.nonmagical===true&&rod.totalAbsorbed===50&&rod.stored===0;
}

export function rodAbsorptionProjectedInventory(rows){
 if(!Array.isArray(rows))return rows;const raw=build()?.inv||[];
 return rows.map((row,index)=>rodAbsorptionNonmagicalRow(raw[index])&&row?.rodAbsorption?.id===raw[index]?.rodAbsorption?.id?{...row,att:0,attuned:false,attunedActive:false}:row);
}

function rodClassKnowledgeParts(selected){
 const inspect=lateGet('spInfoPart'),record=lateGet('spRec');
 return QRY.casterParts().map(part=>{
  const info=typeof inspect==='function'?inspect(part):null,lists=info?.lists||[];
  const known=(selected[part.cls]||[]).filter(name=>{const row=typeof record==='function'?record(name):null;return Array.isArray(row)&&row[1]<=info?.max&&lists.some(list=>row[3]?.includes(list));});
  return {...part,maximumPreparedLevel:info?.max??null,eligiblePreparedSpellNames:known};
 });
}
function sourceKnowsSpells(definition){
 const text=typeof definition?.full==='string'?definition.full:definition?.d;
 return typeof text==='string'&&(/\balways\b[^.!?\n]{0,90}\bprepared\b/i.test(text)||/\b(?:you (?:also )?)?(?:learn|know)\b[^.!?\n]{0,100}\b(?:spells?|rituals?)\b/i.test(text));
}
function featKnowledgeGrants(catalog){
 const out=[];
 for(const name of ['featSpells','dmSpells'])if(typeof QRY[name]==='function')for(const row of QRY[name]()){
  if(!row||/ritual only/i.test(row.use||'')||!sourceKnowsSpells(featDef(row.f)))continue;
  if(row.f==='Magic Initiate (2014)'&&!legacyInitiateSpell(row,catalog))continue;
  out.push({n:row.n,k:row.k,src:row.f,use:row.use||'1/Long Rest free',preparedGrant:true});
 }
 return out;
}
function legacyInitiateSpell(row,catalog){
 if(!row.k?.startsWith('@dm:'))return false;const selected=build()?.ch?.['cp-'+row.k.slice(4)];
 return Array.isArray(selected)&&selected.length===1&&catalog.some(d=>d.n===row.n&&d.l===1&&d.classList?.includes(selected[0]));
}
function initiateKnowledgeGrants(catalog){
 if(typeof QRY.miFeats!=='function')return [];
 const out=[];
 for(const feat of QRY.miFeats()){
  const name='Magic Initiate ('+feat.cls+')';if(!sourceKnowsSpells(featDef(name)))continue;
  for(const spell of build()?.pk?.[feat.key]?.s||[]){const definitions=catalog.filter(d=>d.n===spell&&d.l===1&&d.classList?.includes(feat.cls));if(definitions.length!==1)continue;out.push({n:spell,k:'@mi:'+feat.key,src:'Magic Initiate',mi:name,use:'1/Long Rest free',preparedGrant:true});}
 }
 return out;
}
function speciesKnowsSpell(text,name){
 if(!text.toLowerCase().includes(String(name).toLowerCase()))return false;
 if(/\balways\b[^.!?\n]{0,90}\bprepared\b/i.test(text))return true;
 return text.split(/[.!?\n]/).some(sentence=>sentence.toLowerCase().includes(String(name).toLowerCase())&&/\byou (?:also )?(?:learn|know)\b/i.test(sentence)&&!/\bcantrips?\b/i.test(sentence));
}
function speciesKnowledgeGrants(always){
 if(typeof speciesDef!=='function'||typeof full14!=='function')return [];
 const B=build(),species=speciesDef(B.species);if(!species)return [];
 const texts=(species.traits||[]).map(trait=>full14(B.rs,'Species: '+B.species,trait[0]).full).filter(text=>typeof text==='string');
 const table=typeof SP_AUTO!=='undefined'&&SP_AUTO[B.species],sources=table?Object.keys(table).map(k=>B.species+(k?' ('+k+')':'')):[];
 return always.filter(q=>q.k==='@species'&&sources.includes(q.src)&&texts.some(text=>speciesKnowsSpell(text,q.n))).map(q=>({...q,use:'Always prepared',preparedGrant:true}));
}
function ritualKnowledgeGrants(catalog){
 if(typeof QRY.allFeats!=='function')return [];
 const feats=QRY.allFeats().filter(f=>featDef(f.n)?.pick?.some(p=>p.k==='rc')&&sourceKnowsSpells(featDef(f.n)));if(!feats.length)return [];
 const provider=lateGet('choicesBuild');if(typeof provider!=='function')return [];
 const out=[];
 for(const choice of provider(false)){
  if(!/^rc-/.test(choice.key)||!feats.some(f=>(f.key||f.s)===choice.fk)||!Array.isArray(choice.list))continue;
  for(const spell of (build()?.ch?.[choice.key]||[]).slice(0,choice.n))if(choice.list.some(row=>row[0]===spell)&&catalog.some(d=>d.n===spell&&d.l===1))out.push({n:spell,k:'@ft:'+choice.fk,src:choice.feature,use:'Always prepared',preparedGrant:true});
 }
 return out;
}
function hasPreparedClassFeature(cls,name){
 if(typeof classDef!=='function'||typeof cfFullText!=='function')return false;
 const part=QRY.casterParts().find(p=>p.cls===cls),definition=classDef(cls);
 return !!part&&!!definition&&(definition.f||[]).some(row=>row[0]<=part.lv&&row[1]===name)&&sourceKnowsSpells({full:cfFullText(cls+'|'+name)});
}
function preparedClassFeatureGrants(catalog){
 const out=[];
 if(hasPreparedClassFeature('Warlock','Contact Patron'))out.push({n:'Contact Other Plane',k:'Warlock',src:'Contact Patron',use:'1/Long Rest free',preparedGrant:true});
 if(!hasPreparedClassFeature('Wizard','Spell Mastery')&&!hasPreparedClassFeature('Wizard','Signature Spells'))return out;
 const provider=lateGet('choicesBuild');if(typeof provider!=='function')return out;
 for(const choice of provider(false)){
  const match=/p(18sm([12])|20sig)$/.exec(choice.key);if(!match||!Array.isArray(choice.list))continue;
  const signature=match[1]==='20sig',feature=signature?'Signature Spells':'Spell Mastery',level=signature?3:Number(match[2]);if(!hasPreparedClassFeature('Wizard',feature))continue;
  for(const name of (build()?.ch?.[choice.key]||[]).slice(0,choice.n))if(choice.list.some(row=>row[0]===name)&&catalog.some(d=>d.n===name&&d.l===level))out.push({n:name,k:'Wizard',src:choice.feature,use:signature?'1/Short Rest free':'At will',preparedGrant:true});
 }
 return out;
}
function rodKnowledgeGrants(catalog,always){return featKnowledgeGrants(catalog).concat(initiateKnowledgeGrants(catalog),speciesKnowledgeGrants(always),ritualKnowledgeGrants(catalog),preparedClassFeatureGrants(catalog));}

