import {itemSpellDamageSnapshotProblems,itemSpellDamageUsageProblems,declareItemSpellDamageEvent,updateItemSpellDamageUsage} from './item-spell-damage.js';
import {discipleOfLifeDescriptorProblems} from './disciple-of-life.js';
// Physical Spellwrought sources and actor-owned body permissions; no storage or dice side effects.
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>x!=null&&Object.prototype.hasOwnProperty.call(x,k);
const exact=(x,keys)=>object(x)&&Reflect.ownKeys(x).length===keys.length&&keys.every(k=>own(x,k));
const text=x=>typeof x==='string'&&!!x&&x.trim()===x;
const dense=x=>Array.isArray(x)&&Object.keys(x).length===x.length&&Reflect.ownKeys(x).length===x.length+1&&Object.keys(x).every((k,i)=>k===String(i));
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const failure=reason=>({ok:false,reason});
function numberId(value,prefix){if(typeof value!=='string')return null;const m=new RegExp('^'+prefix+'([1-9][0-9]*)$').exec(value),n=m&&Number(m[1]);return Number.isSafeInteger(n)?n:null}
const sourceNumber=value=>numberId(value,'tattoo-');
const castNumber=value=>numberId(value,'swc-');
const NAMES=['Spellwrought Tattoo (Cantrip)','Spellwrought Tattoo (1st Level)','Spellwrought Tattoo (2nd Level)','Spellwrought Tattoo (3rd Level)','Spellwrought Tattoo (4th Level)','Spellwrought Tattoo (5th Level)'];
export function spellwroughtTattooProfile(item){const level=NAMES.indexOf(item);if(level<0)return null;const modifier=level<=2?3:level<=4?4:5;return {item,level,modifier,dc:level<=2?13:level<=4?15:17,atk:level<=2?5:level<=4?7:9}}
export function createTattooBodyState(){return {v:1,nextCastId:1,tattoos:[]}}
export function tattooNeedleProblems(state){
 if(!exact(state,['v','id','spell','phase'])||state.v!==1)return ['state'];const errors=[];
 if(!sourceNumber(state.id))errors.push('id');if(!['unrecorded','needle','applied'].includes(state.phase))errors.push('phase');
 if(state.phase==='unrecorded'?state.spell!==null:!text(state.spell))errors.push('spell');return errors;
}
export function tattooRegistryProblems(registry){return exact(registry,['v','nextId'])&&registry.v===1&&integer(registry.nextId)&&registry.nextId>0?[]:['registry']}
function canonicalTattooJSON(value){if(Array.isArray(value))return '['+value.map(canonicalTattooJSON).join(',')+']';if(object(value))return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonicalTattooJSON(value[key])).join(',')+'}';return JSON.stringify(value)}
export function tattooDefinitionStamp(definition){if(!object(definition))return null;const copy={...definition};delete copy.fixedSpellSource;delete copy.use;copy.cmp=String(copy.cmp||'').split(',').map(x=>x.trim()).filter(x=>x!=='M').join(', ');return canonicalTattooJSON(copy)}
function castContextProblems(context){
 if(exact(context,['v','casterLevel'])&&context.v===1)return Number.isSafeInteger(context.casterLevel)&&context.casterLevel>=1&&context.casterLevel<=20?[]:['casterLevel'];
 if(!exact(context,['v','casterLevel','ruleset','nativeDefinition','disciple'].concat(own(context,'itemDamage')?['itemDamage']:[]))||context.v!==2||!Number.isSafeInteger(context.casterLevel)||context.casterLevel<1||context.casterLevel>20||!['2014','2024'].includes(context.ruleset)||!text(context.nativeDefinition)||typeof context.disciple!=='string')return ['castContext'];
 if(own(context,'itemDamage')&&(itemSpellDamageSnapshotProblems(context.itemDamage).length||context.itemDamage.features.some(feature=>feature.source.edition!==context.ruleset)))return ['item-damage-snapshot'];
 try{const d=JSON['parse'](context.disciple);if(d!==null&&discipleOfLifeDescriptorProblems(d).length||canonicalTattooJSON(d)!==context.disciple)return ['disciple']}catch(error){return ['disciple']}return [];
}
export function createTattooCastContext(definition,casterLevel,ruleset,disciple=undefined,itemDamage=undefined){const result={v:2,casterLevel,ruleset,nativeDefinition:tattooDefinitionStamp(definition),disciple:canonicalTattooJSON(disciple===undefined?null:disciple),...(itemDamage===undefined?{}:{itemDamage:structuredClone(itemDamage)})};return castContextProblems(result).length?null:result}
export function tattooBodyProblems(body){
 if(!exact(body,['v','nextCastId','tattoos'])||body.v!==1||!integer(body.nextCastId)||body.nextCastId<1||!dense(body.tattoos))return ['body'];
 const errors=[],sources=new Set(),casts=new Set();
 for(const grant of body.tattoos){
  if(!exact(grant,['sourceId','item','spell','phase','castId','outcome'].concat(own(grant,'castContext')?['castContext']:[]).concat(own(grant,'itemDamageUsage')?['itemDamageUsage']:[]))){errors.push('grant');continue}
  if(own(grant,'castContext')&&(castContextProblems(grant.castContext).length||!['active','ended'].includes(grant.phase)))errors.push('castContext');
  if(own(grant,'itemDamageUsage')&&(itemSpellDamageUsageProblems(grant.itemDamageUsage).length||!['active','ended'].includes(grant.phase)||grant.outcome!=='cast'))errors.push('itemDamageUsage');
  if(!sourceNumber(grant.sourceId)||sources.has(grant.sourceId))errors.push('sourceId');sources.add(grant.sourceId);
  if(!spellwroughtTattooProfile(grant.item)||!text(grant.spell))errors.push('payload');
  if(!['ready','casting','active','ended'].includes(grant.phase))errors.push('phase');
  if(grant.phase==='ready'){if(grant.castId!==null||grant.outcome!==null)errors.push('ready')}
  else{const n=castNumber(grant.castId);if(!n||n>=body.nextCastId||casts.has(grant.castId))errors.push('castId');casts.add(grant.castId);
   if(grant.phase==='casting'?grant.outcome!==null:grant.phase==='active'?grant.outcome!=='cast':!['cast','failed'].includes(grant.outcome))errors.push('outcome')}
 }
 return errors;
}
function bodyState(body){if(body===undefined)body=createTattooBodyState();return tattooBodyProblems(body).length?null:body}
function quantity(row){return row&&row.q==null?1:row&&row.q}
function supportedRow(row){return object(row)&&spellwroughtTattooProfile(row.key||row.n)}
function sourceRow(row){const profile=supportedRow(row);if(!profile)return failure('unsupported-item');if(tattooNeedleProblems(row.tattoo).length)return failure('unsupported-source');const q=quantity(row);if(!Number.isSafeInteger(q)||q<=0)return failure('source-unavailable');if(q!==1)return failure('split-required');return {ok:true,profile,state:row.tattoo}}
export function tattooSourcesProblems(rows,registry,body=undefined){
 if(!Array.isArray(rows)||tattooRegistryProblems(registry).length)return ['registry'];const state=bodyState(body);if(!state)return ['body'];const errors=[],ids=new Set();
 for(const row of rows){if(!supportedRow(row))continue;if(tattooNeedleProblems(row.tattoo).length){errors.push('source');continue}const id=row.tattoo.id,n=sourceNumber(id),q=quantity(row);
  if(n>=registry.nextId||ids.has(id))errors.push('id');ids.add(id);if(!integer(q)||row.tattoo.phase==='applied'&&q!==0)errors.push('quantity');
  const grant=state.tattoos.find(g=>g.sourceId===id);if(grant&&(row.tattoo.phase!=='applied'||row.tattoo.spell!==grant.spell||(row.key||row.n)!==grant.item))errors.push('body-source');
 }
 if(state.tattoos.some(g=>sourceNumber(g.sourceId)>=registry.nextId))errors.push('body-id');return errors;
}
export function migrateTattooSources(rows,registry=undefined,body=undefined){
 if(!Array.isArray(rows))return failure('unsupported-inventory');const state=bodyState(body);if(!state)return failure('unsupported-body');
 const known=[];for(const row of rows)if(supportedRow(row)&&own(row,'tattoo')){if(tattooNeedleProblems(row.tattoo).length)return failure('unsupported-source');known.push(sourceNumber(row.tattoo.id))}
 known.push(...state.tattoos.map(g=>sourceNumber(g.sourceId)));const max=known.reduce((largest,n)=>Math.max(largest,n),0);
 if(registry===undefined){if(!Number.isSafeInteger(max+1))return failure('source-capacity');registry={v:1,nextId:max+1}}
 if(tattooRegistryProblems(registry).length||registry.nextId<=max)return failure('unsupported-registry');let nextId=registry.nextId;
 const next=[];for(const row of rows){if(!supportedRow(row)||own(row,'tattoo')){next.push(row);continue}if(!Number.isSafeInteger(nextId+1))return failure('source-capacity');next.push({...row,tattoo:{v:1,id:'tattoo-'+nextId++,spell:null,phase:'unrecorded'}})}
 const updated={v:1,nextId};if(tattooSourcesProblems(next,updated,state).length)return failure('inconsistent-sources');return {ok:true,rows:next,registry:updated};
}
function spellDefinition(definition,profile,name=undefined){return object(definition)&&text(definition.n)&&definition.n===(name===undefined?definition.n:name)&&definition.l===profile.level&&text(definition.ct)&&typeof definition.cmp==='string'&&(!definition.cmp||/^\s*[VSM](?:\s*,\s*[VSM])*\s*$/.test(definition.cmp))&&text(definition.dur)&&[0,1,false,true].includes(definition.conc)}
function declaration(value,flags){return exact(value,flags)&&flags.every(k=>value[k]===true)}
export function recordTattooNeedle(row,definition,declarations){
 const source=sourceRow(row);if(!source.ok)return source;if(source.state.phase!=='unrecorded')return failure('payload-immutable');
 if(!spellDefinition(definition,source.profile))return failure('invalid-spell');if(!declaration(declarations,['unusedNeedleDeclared']))return failure('unused-needle-declaration-required');
 return {ok:true,row:{...row,tattoo:{...source.state,spell:definition.n,phase:'needle'}}};
}
export function splitTattooNeedle(rows,index,registry,change={},body=undefined){
 if(tattooSourcesProblems(rows,registry,body).length)return failure('inconsistent-sources');const row=Number.isInteger(index)&&rows[index],profile=supportedRow(row);if(!profile)return failure('unsupported-item');
 const q=quantity(row);if(!integer(q)||q<=1||row.tattoo.phase==='applied')return failure('split-required');if(!object(change)||Object.keys(change).some(k=>k!=='keepRecordedWith')||change.keepRecordedWith!==undefined&&!['original','split'].includes(change.keepRecordedWith))return failure('keep-choice');
 if(row.tattoo.phase==='needle'&&!change.keepRecordedWith)return failure('keep-choice');if(!Number.isSafeInteger(registry.nextId+1))return failure('source-capacity');let original,split;try{original=structuredClone(row);split=structuredClone(row)}catch(error){return failure('unsupported-source')}
 original.q=q-1;split.q=1;const unconfiguredCopy=change.keepRecordedWith==='split'?original:split;unconfiguredCopy.tattoo={v:1,id:'tattoo-'+registry.nextId,spell:null,phase:'unrecorded'};
 const next=rows.slice();next.splice(index,1,original,split);return {ok:true,rows:next,index,splitIndex:index+1,registry:{v:1,nextId:registry.nextId+1}};
}
export function applySpellwroughtTattoo(row,body,definition,declarations){
 const source=sourceRow(row);if(!source.ok)return source;const state=bodyState(body);if(!state)return failure('unsupported-body');if(source.state.phase!=='needle')return failure('needle-required');if(!spellDefinition(definition,source.profile,source.state.spell))return failure('invalid-spell');
 if(state.tattoos.some(g=>g.sourceId===source.state.id))return failure('source-already-applied');if(!declaration(declarations,['needleAgainstSkin','commandWord']))return failure('application-declaration-required');
 const grant={sourceId:source.state.id,item:source.profile.item,spell:source.state.spell,phase:'ready',castId:null,outcome:null};return {ok:true,row:{...row,q:0,tattoo:{...source.state,phase:'applied'}},body:{...state,tattoos:[...state.tattoos.map(g=>({...g})),grant]},grant:{...grant}};
}
export function beginTattooCasting(body,sourceId,declarations){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.sourceId===sourceId);if(!grant||grant.phase!=='ready')return failure('permission-unavailable');
 if(!declaration(declarations,['castingStarted']))return failure('casting-declaration-required');if(!Number.isSafeInteger(state.nextCastId+1))return failure('cast-capacity');const castId='swc-'+state.nextCastId;
 return {ok:true,castId,body:{...state,nextCastId:state.nextCastId+1,tattoos:state.tattoos.map(g=>g===grant?{...g,phase:'casting',castId}:{...g})}};
}
export function cancelTattooCasting(body,castId,declarations){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.castId===castId);if(!grant||grant.phase!=='casting')return failure('casting-unavailable');
 if(!declaration(declarations,['noSpellWasCast']))return failure('no-cast-declaration-required');return {ok:true,body:{...state,tattoos:state.tattoos.map(g=>g===grant?{...g,phase:'ready',castId:null}:{...g})}};
}
export function completeTattooCasting(body,castId,definition,declarations,castContext=undefined){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.castId===castId);if(!grant||grant.phase!=='casting')return failure('casting-unavailable');
 const profile=spellwroughtTattooProfile(grant.item);if(!spellDefinition(definition,profile,grant.spell))return failure('invalid-spell');
 if(!exact(declarations,['spellWasCast','castSucceeded','actualEffectEnded'])||declarations.spellWasCast!==true||typeof declarations.castSucceeded!=='boolean'||typeof declarations.actualEffectEnded!=='boolean')return failure('cast-declaration-required');
 if(castContext!==undefined&&castContextProblems(castContext).length)return failure('invalid-cast-context');
 const phase=!declarations.castSucceeded||declarations.actualEffectEnded||definition.dur==='Instantaneous'?'ended':'active',outcome=declarations.castSucceeded?'cast':'failed';
 return {ok:true,castId,body:{...state,tattoos:state.tattoos.map(g=>g===grant?{...g,phase,outcome,...(castContext?{castContext:{...castContext}}:{})}:{...g})},receipt:{sourceId:grant.sourceId,item:grant.item,spell:grant.spell,castId,outcome,profile:{...profile}}};
}
export function endTattooEffect(body,castId,declarations){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.castId===castId);if(!grant||grant.phase!=='active')return failure('effect-unavailable');
 if(!declaration(declarations,['actualSpellEnded']))return failure('end-declaration-required');return {ok:true,body:{...state,tattoos:state.tattoos.map(g=>g===grant?{...g,phase:'ended'}:{...g})}};
}
export function tattooCastPermission(body,sourceId,definition,castId=null){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.sourceId===sourceId);if(!grant||!spellDefinition(definition,spellwroughtTattooProfile(grant.item),grant.spell))return failure('permission-unavailable');
 const available=castId===null?grant.phase==='ready':grant.phase==='casting'&&grant.castId===castId;return available?{ok:true,grant:{...grant},profile:spellwroughtTattooProfile(grant.item)}:failure('permission-unavailable');
}
export function tattooCastReceipt(body,castId,definition){
 const state=bodyState(body);if(!state)return failure('unsupported-body');const grant=state.tattoos.find(g=>g.castId===castId);if(!grant||grant.outcome!=='cast'||!['active','ended'].includes(grant.phase)||!spellDefinition(definition,spellwroughtTattooProfile(grant.item),grant.spell))return failure('receipt-unavailable');
 if(grant.castContext&&grant.castContext.v===2&&grant.castContext.nativeDefinition!==tattooDefinitionStamp(definition))return failure('cast-definition-changed');
 return {ok:true,grant:{...grant},profile:spellwroughtTattooProfile(grant.item)};
}
export function projectTattooBody(body,definitions){
 const state=bodyState(body);if(!state)return failure('unsupported-body');if(!Array.isArray(definitions))return failure('invalid-catalog');const records=[];
 for(const grant of state.tattoos){const profile=spellwroughtTattooProfile(grant.item),matches=definitions.filter(def=>def&&def.n===grant.spell),valid=matches.length===1&&spellDefinition(matches[0],profile,grant.spell),row={...grant,glowing:grant.phase==='casting'||grant.phase==='active',vanished:grant.phase==='ended',castAvailable:valid&&grant.phase==='ready',completionAvailable:valid&&grant.phase==='casting',receiptAvailable:valid&&grant.outcome==='cast'&&['active','ended'].includes(grant.phase),profile:{...profile}};
  if(valid){try{row.spellDefinition={...structuredClone(matches[0]),cmp:matches[0].cmp.split(',').map(x=>x.trim()).filter(x=>x&&x!=='M').join(', ')}}catch(error){return failure('invalid-catalog')}}records.push(row)}
 return {ok:true,records};
}
// Canonical derived C source: identity only. Runtime separately proves current S permission/receipt.
export function tattooFixedSourceProblems(marker,spell=undefined){
 if(!exact(marker,['v','kind','sourceId','item','spell','castId']))return ['marker'];const errors=[],profile=spellwroughtTattooProfile(marker.item);
 if(marker.v!==1||marker.kind!=='spellwrought-tattoo')errors.push('kind');if(!sourceNumber(marker.sourceId))errors.push('sourceId');if(!profile||!text(marker.spell))errors.push('payload');if(marker.castId!==null&&!castNumber(marker.castId))errors.push('castId');
 if(spell!==undefined&&(!object(spell)||spell.n!==marker.spell||!profile||spell.l!==profile.level))errors.push('spell');
 if(object(spell)&&own(spell,'fixedSpellSource')){const embedded=spell.fixedSpellSource,keys=['v','kind','sourceId','item','spell','castId'];if(!exact(embedded,keys)||keys.some(key=>embedded[key]!==marker[key]))errors.push('embedded-source')}return errors;
}
export function tattooFixedSourceMarker(body,sourceId){
 const state=bodyState(body);if(!state)return null;const grant=state.tattoos.find(g=>g.sourceId===sourceId);return grant?{v:1,kind:'spellwrought-tattoo',sourceId:grant.sourceId,item:grant.item,spell:grant.spell,castId:grant.castId}:null;
}
export function tattooFixedSourceStats(marker,spell){
 if(!object(spell)||tattooFixedSourceProblems(marker,spell).length)return null;const profile=spellwroughtTattooProfile(marker.item);return {n:profile.item,mod:profile.modifier,atk:profile.atk,dc:profile.dc};
}
export function tattooFixedSourceCapability(body,marker,spell,mode){
 if(tattooFixedSourceProblems(marker,spell).length||!object(spell))return failure('invalid-source');if(!['ready','casting','receipt'].includes(mode))return failure('invalid-capability');
 const result=mode==='receipt'?tattooCastReceipt(body,marker.castId,spell):tattooCastPermission(body,marker.sourceId,spell,mode==='ready'?null:marker.castId);
 if(!result.ok)return result;const grant=result.grant;
 if(grant.sourceId!==marker.sourceId||grant.item!==marker.item||grant.spell!==marker.spell||grant.castId!==marker.castId||mode==='casting'&&marker.castId===null)return failure('source-mismatch');return {...result,stats:tattooFixedSourceStats(marker,spell)};
}

export function updateTattooDamageUsage(body,castId,expected,next){const state=bodyState(body),grant=state&&state.tattoos.find(value=>value.castId===castId);if(!grant||grant.outcome!=='cast'||!['active','ended'].includes(grant.phase))return failure('successful-tattoo-cast-required');const updated=updateItemSpellDamageUsage(grant.itemDamageUsage,expected,next);return updated.ok?{ok:true,body:{...state,tattoos:state.tattoos.map(value=>value===grant?{...value,itemDamageUsage:updated.usage}:{...value})}}:updated}
export function declareTattooDamageEvent(body,castId,declarations){const state=bodyState(body),grant=state&&state.tattoos.find(value=>value.castId===castId);if(!grant||grant.outcome!=='cast'||!['active','ended'].includes(grant.phase))return failure('successful-tattoo-cast-required');const declared=declareItemSpellDamageEvent(grant.itemDamageUsage,declarations);if(!declared.ok)return declared;const before=grant.itemDamageUsage===undefined?{v:1,nextEventId:1,currentEventId:null,events:[],legacyAffinityUsed:false}:grant.itemDamageUsage,updated=updateTattooDamageUsage(state,castId,before,declared.usage);return updated.ok?{...updated,eventId:declared.eventId}:updated}
