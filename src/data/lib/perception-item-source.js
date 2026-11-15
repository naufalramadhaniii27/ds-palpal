/* Typed native item Advantage; persisted old unqualified rows are not source proof. */
import {perceptionItemProfile,perceptionItemDefinition,canonicalPerceptionItemDefinition as canonical} from './perception-item-profiles.js';
import {itemQuantity} from './attunement.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),TARGETS=['Perception','Initiative'];
const foreign=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption','travelGoat','arcaneGrimoireRecovery','perceptionItemSources','instrumentSpells'];
function data(v,k){const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable&&own(d,'value');}
function exact(v,keys){return object(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>data(v,k));}
function dense(v){return Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i));}
function flagsValid(flags){return dense(flags)&&flags.every(k=>TARGETS.includes(k))&&new Set(flags).size===flags.length;}
function quantity(row){if(!own(row,'q'))return 1;if(!data(row,'q')||!['number','string'].includes(typeof row.q))return null;const q=Number(row.q);return Number.isSafeInteger(q)&&q>=0&&q===itemQuantity(row)?q:null;}
function fail(item,reason){return {recognized:!!perceptionItemProfile(item),ok:false,mode:'unsupported',item,flags:[],reason};}
function present(frame){const row=frame.row;if(!object(row)||!data(row,'n')||typeof row.n!=='string'||own(row,'key')&&(!data(row,'key')||typeof row.key!=='string')||!data(row,'eq')||row.eq!==true||!(quantity(row)>0)||foreign.some(k=>own(row,k)))return false;return frame.attunement?.requires===false||frame.attunement?.requires===true&&frame.attunement.attuned===true;}
function declaredAdv(fx){return object(fx)&&data(fx,'adv')&&dense(fx.adv)&&fx.adv.every(k=>typeof k==='string')&&canonical(fx)!==null?fx.adv:null;}
function custom(frame){
 const items=Array.isArray(frame.customItems)?frame.customItems:[],item=items.find(row=>(Array.isArray(row)?row[0]:row?.n)===frame.item),override=own(frame.fxOverrides,frame.item)?frame.fxOverrides[frame.item]:undefined;
 if(!item&&override===undefined)return null;const candidates=[item?(Array.isArray(item)?item[5]?.fx:item.fx):null,override?.fx].map(declaredAdv).filter(Boolean);
 const effective=frame.entryFx===undefined?(candidates.length===1?candidates[0]:null):declaredAdv(frame.entryFx);if(!effective||!candidates.some(adv=>canonical(adv)===canonical(effective)))return fail(frame.item,'explicit-supported-custom-advantage-required');
 return {recognized:true,ok:true,mode:'custom',item:frame.item,definitionFingerprint:canonical({item,override,adv:effective}),flags:TARGETS.filter(k=>effective.includes(k))};
}
function certifiedDefinition(profile,fingerprint,frame){
 const definition=perceptionItemDefinition(profile.item,fingerprint);if(!definition||!Array.isArray(frame.originalCatalogRows))return null;
 const originals=frame.originalCatalogRows.filter(row=>Array.isArray(row)&&row[0]===profile.item);if(originals.length!==1||canonical(originals[0])!==profile.fingerprint)return null;
 if(definition.edition==='2014'){if(!Array.isArray(frame.legacyCatalogRows))return null;const rows=frame.legacyCatalogRows.filter(row=>Array.isArray(row)&&row[0]===profile.item);if(rows.length!==1||canonical(rows[0])!==definition.fingerprint)return null;}return definition;
}
export function perceptionItemSource(frame){
 try{
  const profile=perceptionItemProfile(frame?.item);if(!profile)return fail(frame?.item,'not-a-native-perception-item');if(!present(frame))return fail(frame.item,'actual-held-allocated-source-required');
  const declared=custom(frame);if(declared)return declared;if(own(frame.fxOverrides,profile.item)||own(frame.gxItems,profile.item)||own(frame.gxItems,frame.resolvedName)||own(frame.gxItems,frame.row.n)||frame.customItems!==undefined&&!Array.isArray(frame.customItems))return fail(frame.item,'original-perception-item-required');
  const definition=certifiedDefinition(profile,canonical(frame.resolvedRow),frame);if(!definition||frame.attunement.requires!==profile.requiresAttunement)return fail(frame.item,'original-perception-catalog-required');
  const row=frame.row,key=own(row,'key')?row.key:row.n;if(key!==profile.item&&frame.resolvedName!==row.n)return fail(frame.item,'original-perception-alias-required');
  return {recognized:true,ok:true,mode:'native',item:profile.item,definitionFingerprint:definition.fingerprint,flags:TARGETS.slice()};
 }catch{return fail(frame?.item,'unsupported-perception-source')}
}
function decodeDefinition(text){
 try{
  function decode(value){
   if(value===null||['string','boolean','number'].includes(typeof value))return value;
   if(!Array.isArray(value))throw Error('encoding');if(value[0]==='undefined'&&value.length===1)return undefined;
   const array=value[0]==='array';if(!array&&value[0]!=='object')throw Error('encoding');const pairs=value[array?2:1];if(!Array.isArray(pairs)||value.length!==(array?3:2))throw Error('encoding');
   const out=array?new Array(value[1]):{};for(const pair of pairs){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||own(out,pair[0]))throw Error('encoding');Object.defineProperty(out,pair[0],{value:decode(pair[1]),enumerable:true,writable:true,configurable:true});}return out;
  }
  const value=decode(JSON.parse(text));return canonical(value)===text?value:null;
 }catch{return null;}
}
function customDefinition(binding){
 const value=decodeDefinition(binding.definitionFingerprint);if(!exact(value,['item','override','adv'])||!dense(value.adv)||!value.adv.every(k=>typeof k==='string')||canonical(TARGETS.filter(k=>value.adv.includes(k)))!==canonical(binding.flags))return null;
 const item=value.item;if(item!==undefined&&(Array.isArray(item)?item[0]:item?.n)!==binding.item)return null;const declared=[item?(Array.isArray(item)?item[5]?.fx:item.fx):null,value.override?.fx].map(declaredAdv).filter(Boolean);return declared.some(adv=>canonical(adv)===canonical(value.adv))?value:null;
}
function identityMatches(row,binding){return object(row)&&row.n===binding.inventoryName&&(own(row,'key')?row.key:null)===binding.inventoryKey;}
export function perceptionItemSourcesProblems(cap){
 try{
  if(!exact(cap,['v','inventoryFingerprint','bindings'])||cap.v!==1||typeof cap.inventoryFingerprint!=='string'||!dense(cap.bindings))return ['unsupported-perception-item-sources'];
  const indices=new Set();for(const binding of cap.bindings){
   if(!exact(binding,['index','item','mode','definitionFingerprint','flags','inventoryName','inventoryKey'])||!Number.isSafeInteger(binding.index)||binding.index<0||indices.has(binding.index)||!flagsValid(binding.flags)||typeof binding.inventoryName!=='string'||!binding.inventoryName||binding.inventoryKey!==null&&typeof binding.inventoryKey!=='string')return ['unsupported-perception-item-binding'];
   const p=perceptionItemProfile(binding.item);if(!p||!['native','custom'].includes(binding.mode)||typeof binding.definitionFingerprint!=='string'||!binding.definitionFingerprint)return ['unsupported-perception-item-binding'];
   if(binding.mode==='native'&&(!perceptionItemDefinition(binding.item,binding.definitionFingerprint)||canonical(binding.flags)!==canonical(TARGETS)))return ['unsupported-perception-item-binding'];
   if(binding.mode==='custom'&&!customDefinition(binding))return ['unsupported-perception-item-custom-definition'];indices.add(binding.index);
  }
  return [];
 }catch{return ['unsupported-perception-item-sources']}
}
function aliasNames(row,binding){return [row?.n,own(row,'key')?row.key:null,binding?.item,binding?.inventoryName,binding?.inventoryKey].filter(name=>typeof name==='string');}
function candidate(C,row){
 if(!row||!TARGETS.includes(row.k))return false;if(own(C,'perceptionItemSources')&&(!data(C,'perceptionItemSources')||perceptionItemSourcesProblems(C.perceptionItemSources).length))return true;if(perceptionItemProfile(row.s))return true;
 if((C?.inv||[]).some(item=>item?.n===row.s&&perceptionItemProfile(own(item,'key')?item.key:item.n)))return true;
 const cap=data(C,'perceptionItemSources')?C.perceptionItemSources:null;return !perceptionItemSourcesProblems(cap).length&&cap.bindings.some(binding=>aliasNames(C.inv?.[binding.index],binding).includes(row.s));
}
function verified(C){
 if(!object(C)||!data(C,'perceptionItemSources')||!data(C,'inv')||!Array.isArray(C.inv))return false;const cap=C.perceptionItemSources;if(perceptionItemSourcesProblems(cap).length||canonical(C.inv)!==cap.inventoryFingerprint)return false;
 return cap.bindings.every(binding=>{const row=C.inv[binding.index],p=perceptionItemProfile(binding.item);const requires=binding.mode==='native'?p.requiresAttunement:!!row?.att;return identityMatches(row,binding)&&row.eq===true&&quantity(row)>0&&(!requires||row.attunedActive===true)&&!foreign.some(k=>own(row,k));});
}
export function perceptionItemSourceStatus(C){try{const relevant=own(C,'perceptionItemSources')||(C?.itemAdv||[]).some(row=>candidate(C,row));const valid=verified(C);return {relevant,reviewRequired:relevant&&!valid,verified:valid};}catch{return {relevant:true,reviewRequired:true,verified:false}}}
export function perceptionItemFlag(C,row){
 try{
  if(!candidate(C,row))return row;if(!verified(C))return null;const cap=C.perceptionItemSources,binding=cap.bindings.find(binding=>aliasNames(C.inv[binding.index],binding).includes(row.s));if(!binding||!binding.flags.includes(row.k))return null;
  const fields=row.k==='Perception'&&binding.mode==='native'?['k','s','ab']:['k','s'];if(!exact(row,fields)||fields.includes('ab')&&row.ab!=='WIS')return null;return row;
 }catch{return null;}
}

export function perceptionItemCertificateCurrent(C,frame={}){
 try{
  const cap=C?.perceptionItemSources,names=cap?.bindings?.map(binding=>binding.item)||[],stamp=canonical({cap,inventory:C?.inv,catalog:(frame.originalCatalogRows||[]).filter(row=>names.includes(row?.[0])),legacyCatalog:(frame.legacyCatalogRows||[]).filter(row=>names.includes(row?.[0])),fx:names.map(name=>[name,frame.fxOverrides?.[name],frame.gxItems?.[name]]),resolved:frame.resolvedRows,custom:frame.customItems});
  if(!verified(C)||stamp===null)return {current:false,stamp};
  const current=cap.bindings.every(binding=>{
   const p=perceptionItemProfile(binding.item),override=own(frame.fxOverrides,binding.item)?frame.fxOverrides[binding.item]:undefined;
   if(binding.mode==='native'){if(!certifiedDefinition(p,binding.definitionFingerprint,frame)||override!==undefined||own(frame.fxOverrides,binding.item)||own(frame.gxItems,binding.item)||own(frame.gxItems,binding.inventoryName))return false;}
   else{const definition=customDefinition(binding);if(!definition||canonical(definition.override)!==canonical(override))return false;if(frame.customItems!==undefined){if(!Array.isArray(frame.customItems))return false;const item=frame.customItems.find(row=>(Array.isArray(row)?row[0]:row?.n)===binding.item);if(canonical(item)!==canonical(definition.item))return false;}}
   if(frame.resolvedRows!==undefined){const resolved=frame.resolvedRows[binding.inventoryName]||frame.resolvedRows[binding.item];if(binding.mode==='native'&&canonical(resolved)!==binding.definitionFingerprint)return false;}return true;
  });return {current,stamp};
 }catch{return {current:false,stamp:null};}
}
