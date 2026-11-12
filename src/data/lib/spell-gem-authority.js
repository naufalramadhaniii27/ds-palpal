import {gemRegistryProblems} from './spell-gem-physical.js';
import {spellGemCastsProblems} from './spell-gem-casts.js';
// One actor-owned physical budget; inventory rows are guarded mirrors, never an independent refill source.
import {spellGemProfile,spellGemProblems} from './spell-gem.js';
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k),object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),exact=(x,keys)=>object(x)&&Reflect.ownKeys(x).length===keys.length&&keys.every(k=>own(x,k)),fail=reason=>({ok:false,reason});
const clone=x=>structuredClone(x),dense=x=>Array.isArray(x)&&Reflect.ownKeys(x).length===x.length+1&&Object.keys(x).every((k,i)=>k===String(i));
function same(a,b){if(a===b)return true;if(!object(a)||!object(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>same(v,b[i]));const keys=Reflect.ownKeys(a);return keys.length===Reflect.ownKeys(b).length&&keys.every(k=>own(b,k)&&same(a[k],b[k]))}
function numberId(value,prefix){const m=typeof value==='string'&&new RegExp('^'+prefix+'([1-9][0-9]*)$').exec(value);return m&&Number.isSafeInteger(+m[1])?+m[1]:null}
const unrecorded=state=>exact(state,['v','id','contents','imbueAvailable','reviewRequired'])&&state.v===1&&!!numberId(state.id,'gem-')&&state.contents===null&&state.imbueAvailable===null&&state.reviewRequired===true;
export function canonicalGemItem(row){if(!object(row))return null;const key=own(row,'key')?row.key:row.n;return typeof key==='string'&&spellGemProfile(key)?key:null}
const native=row=>{const key=canonicalGemItem(row);return key&&spellGemProfile(key)},unknown=id=>({v:1,id,contents:null,imbueAvailable:null,reviewRequired:true});
function stateValid(item,state,authoritative=false){if(unrecorded(state))return true;if(spellGemProblems({n:item,spellGem:state}).length)return false;return !authoritative||own(state,'loadId')&&(state.contents===null?state.loadId===null:!!numberId(state.loadId,'sgl-'))}
export function createGemPhysicalAuthority(){return {v:1,nextLoadId:1,sources:[]}}
export function gemPhysicalAuthorityProblems(authority){
 if(!exact(authority,['v','nextLoadId','sources'])||authority.v!==1||!Number.isSafeInteger(authority.nextLoadId)||authority.nextLoadId<1||!dense(authority.sources))return ['authority'];const ids=new Set(),loads=new Set();
 for(const source of authority.sources){if(!exact(source,['sourceId','item','state','present','legacyState'])||!numberId(source.sourceId,'gem-')||ids.has(source.sourceId)||!spellGemProfile(source.item)||typeof source.present!=='boolean'||!stateValid(source.item,source.state,true)||source.state.id!==source.sourceId||source.legacyState!==null&&(!stateValid(source.item,source.legacyState)||source.legacyState.id!==source.sourceId))return ['physical-source'];ids.add(source.sourceId);if(source.state.loadId){const number=numberId(source.state.loadId,'sgl-');if(!number||number>=authority.nextLoadId||loads.has(source.state.loadId))return ['load-id'];loads.add(source.state.loadId)}}return [];
}
export function assertGemPhysicalCurrent(row,authority){if(gemPhysicalAuthorityProblems(authority).length||!native(row)||!row.spellGem)return fail('physical-authority-unavailable');const source=authority.sources.find(s=>s.sourceId===row.spellGem.id);return source&&source.present&&source.item===canonicalGemItem(row)&&same(source.state,row.spellGem)?{ok:true,source:clone(source)}:fail('physical-history-mismatch')}
export function initializeGemAuthority(rows,authority=undefined,castLedger=undefined){
 if(!Array.isArray(rows)||authority!==undefined&&gemPhysicalAuthorityProblems(authority).length)return fail('physical-authority-unavailable');const next=clone(authority||createGemPhysicalAuthority()),result=[],seen=new Set();
 if(castLedger!==undefined){if(spellGemCastsProblems(castLedger).length)return fail('unsupported-cast-ledger');for(const cast of castLedger.casts)next.nextLoadId=Math.max(next.nextLoadId,numberId(cast.loadId,'sgl-')+1)}
 for(const row of rows)if(native(row)&&row.spellGem&&row.spellGem.loadId){const number=numberId(row.spellGem.loadId,'sgl-');if(!number)return fail('unsupported-load-id');next.nextLoadId=Math.max(next.nextLoadId,number+1)}
 for(const row of rows){if(!native(row)){result.push(clone(row));continue}if(!row.spellGem||!stateValid(canonicalGemItem(row),row.spellGem)||seen.has(row.spellGem.id))return fail('unsupported-physical-state');seen.add(row.spellGem.id);const source=next.sources.find(s=>s.sourceId===row.spellGem.id);if(source){if(!assertGemPhysicalCurrent(row,next).ok)return fail('physical-history-mismatch');result.push(clone(row));continue}const state=unknown(row.spellGem.id);next.sources.push({sourceId:state.id,item:canonicalGemItem(row),state:clone(state),present:true,legacyState:unrecorded(row.spellGem)?null:clone(row.spellGem)});result.push({...clone(row),spellGem:state})}
 return gemPhysicalAuthorityProblems(next).length?fail('invalid-physical-authority'):{ok:true,rows:result,authority:next};
}
function mintLoad(authority,state){if(state.contents===null)return {...clone(state),loadId:null};if(!Number.isSafeInteger(authority.nextLoadId+1))return null;return {...clone(state),loadId:'sgl-'+authority.nextLoadId++}}
function transitionAllowed(before,after,kind){
 if(kind==='review')return unrecorded(before)&&!unrecorded(after);
 if(kind==='imbue')return !unrecorded(before)&&before.contents===null&&before.imbueAvailable===true&&after.contents!==null&&after.imbueAvailable===false;
 if(kind==='release')return !unrecorded(before)&&before.contents!==null&&after.contents===null&&after.imbueAvailable===before.imbueAvailable;
 if(kind==='dawn')return !unrecorded(before)&&same(before.contents,after.contents)&&after.imbueAvailable===true;
 return ['split','adopt','remove'].includes(kind)&&same(before,after);
}
export function applyGemPhysicalChanges(authority,oldRows,newRows,kind,context=undefined){
 if(gemPhysicalAuthorityProblems(authority).length||!Array.isArray(oldRows)||!Array.isArray(newRows)||!['review','imbue','release','dawn','split','remove','adopt'].includes(kind))return fail('invalid-physical-transition');const next=clone(authority),oldIds=new Set(),seen=new Set(),result=[];
 for(const row of oldRows){if(!native(row))continue;if(!assertGemPhysicalCurrent(row,authority).ok||oldIds.has(row.spellGem.id))return fail('physical-history-mismatch');oldIds.add(row.spellGem.id)}
 for(const row of newRows){if(!native(row)){result.push(clone(row));continue}if(!row.spellGem||!stateValid(canonicalGemItem(row),row.spellGem)||seen.has(row.spellGem.id))return fail('unsupported-physical-state');seen.add(row.spellGem.id);const source=next.sources.find(s=>s.sourceId===row.spellGem.id);
  if(!source){if(!['split','adopt'].includes(kind)||!unrecorded(row.spellGem))return fail('unrecorded-source-required');next.sources.push({sourceId:row.spellGem.id,item:canonicalGemItem(row),state:clone(row.spellGem),present:true,legacyState:null});result.push(clone(row));continue}
  if(!oldIds.has(source.sourceId)||!source.present||source.item!==canonicalGemItem(row))return fail('physical-history-mismatch');if(same(source.state,row.spellGem)){result.push(clone(row));continue}if(!transitionAllowed(source.state,row.spellGem,kind))return fail('invalid-physical-transition');if(kind==='imbue'&&(!exact(context,['actualCastLevel','castSucceeded'])||context.castSucceeded!==true||!Number.isSafeInteger(context.actualCastLevel)||context.actualCastLevel<row.spellGem.contents.level||context.actualCastLevel>native(row).maxSpellLevel))return fail('imbue-level-exceeds-capacity');let state=clone(row.spellGem);
  if(['review','imbue'].includes(kind)){state=mintLoad(next,state);if(!state)return fail('load-capacity')}else state.loadId=kind==='release'?null:source.state.loadId;
  source.state=clone(state);source.legacyState=null;result.push({...clone(row),spellGem:state});
 }
 for(const source of next.sources)if(oldIds.has(source.sourceId)&&!seen.has(source.sourceId)){if(kind!=='remove')return fail('source-removal-required');source.present=false}
 return gemPhysicalAuthorityProblems(next).length?fail('invalid-physical-authority'):{ok:true,rows:result,authority:next};
}
export function resyncGemPhysical(rows,authority){if(gemPhysicalAuthorityProblems(authority).length||!Array.isArray(rows))return fail('physical-authority-unavailable');const result=[];for(const row of rows){if(!native(row)){if(object(row)&&own(row,'spellGem'))return fail('unsupported-physical-state');result.push(clone(row));continue}if(!row.spellGem||!stateValid(canonicalGemItem(row),row.spellGem))return fail('unsupported-physical-state');const source=row.spellGem&&authority.sources.find(s=>s.sourceId===row.spellGem.id);if(!source||!source.present||source.item!==canonicalGemItem(row))return fail('physical-authority-unavailable');result.push({...clone(row),spellGem:clone(source.state)})}return {ok:true,rows:result,authority:clone(authority)}}

// C+S are sufficient for managed operations; a separate open builder draft is never consulted.
export function validateGemActorView(character,state){
 if(!object(character)||!object(state)||!dense(character.inv)||gemRegistryProblems(character.spellGemSources).length||gemPhysicalAuthorityProblems(state.spellGemPhysical).length)return fail('managed-actor-gems-unavailable');
 const authority=state.spellGemPhysical,registry=character.spellGemSources;if(authority.sources.some(source=>!registry.reservedIds.includes(source.sourceId)))return fail('unreserved-physical-history');const managed=[],unmanaged=[],seen=new Set();
 for(let index=0;index<character.inv.length;index++){const row=character.inv[index],item=canonicalGemItem(row);if(!item){if(row&&own(row,'spellGem'))return fail('physical-item-profile-mismatch');continue}if(!own(row,'spellGem')){unmanaged.push(index);continue}const sourceId=row.spellGem&&row.spellGem.id;if(seen.has(sourceId)||!registry.reservedIds.includes(sourceId))return fail('duplicate-or-unreserved-source');seen.add(sourceId);const current=assertGemPhysicalCurrent(row,authority);if(!current.ok)return current;managed.push({index,row:clone(row),source:current.source,item,profile:spellGemProfile(item)});}
 return {ok:true,rows:clone(character.inv),registry:clone(registry),authority:clone(authority),managed,unmanaged};
}
