/* Native TCE spell-stat contribution; it does not authorize inventory mutations or casting. */
import{tceSpellBonusProfile,canonicalTceSpellBonus}from'./tce-spell-bonus-profiles.js';
import{itemInUse,itemQuantity}from'./attunement.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),fail=reason=>({recognized:true,certified:false,bonus:0,reason});
function data(v,k){const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable&&own(d,'value')}
function quantityValid(row){if(!own(row,'q'))return true;if(!data(row,'q')||!['number','string'].includes(typeof row.q))return false;const quantity=Number(row.q);return Number.isSafeInteger(quantity)&&quantity>0&&quantity===itemQuantity(row)}
const foreign=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption','travelGoat'];
export function tceSpellBonusCustom(frame,kind){
 try{
  const item=frame?.item,items=Array.isArray(frame?.customItems)?frame.customItems:[],custom=items.find(r=>(Array.isArray(r)?r[0]:r?.n)===item),override=own(frame?.fxOverrides,item)?frame.fxOverrides[item]:null,fx=custom?(Array.isArray(custom)?custom[5]?.fx:custom.fx):override?.fx,field=kind==='atk'?'spellAtk':'spellDc';
  return !!fx&&data(fx,field)&&typeof fx[field]==='number'&&Number.isFinite(fx[field]);
 }catch{return false;}
}
function originalsMatch(frame,profile){
 return [frame.originalBookRows,frame.originalCatalogRows].every(rows=>{if(!Array.isArray(rows))return false;const originals=rows.filter(row=>Array.isArray(row)&&row[0]===profile.item);return originals.length===1&&canonicalTceSpellBonus(originals[0])===profile.fingerprint;})&&canonicalTceSpellBonus(frame.resolvedRow)===profile.fingerprint;
}
function originalOverrides(frame,profile){
 if(frame.customItems!==undefined&&!Array.isArray(frame.customItems))return false;
 return !(frame.customItems||[]).some(r=>(Array.isArray(r)?r[0]:r?.n)===profile.item)&&!own(frame.fxOverrides,profile.item)&&!own(frame.gxItems,profile.item);
}
function physicalSource(frame,profile){
 const row=frame.row;if(!row||!data(row,'n')||typeof row.n!=='string'||own(row,'key')&&!data(row,'key')||own(row,'eq')&&!data(row,'eq')||!quantityValid(row))return false;
 const key=own(row,'key')?row.key:row.n;if(key!==profile.item||foreign.some(k=>own(row,k)))return false;
 const quantity=itemQuantity(row);return row.eq===true&&Number.isFinite(quantity)&&quantity>0&&itemInUse(row,frame.attunement)&&frame.attunement?.requires===true&&frame.attunement.attuned===true;
}
function nativeContribution(frame,kind,spellClass,legacyUnscoped){
 const profile=tceSpellBonusProfile(frame?.item);if(!profile)return {recognized:false,certified:false,bonus:0,reason:'not-a-tce-profile'};
 if(!['atk','dc'].includes(kind))return fail('unsupported-native-spell-stat');
 if(!originalOverrides(frame,profile))return fail('original-tce-definition-required');
 if(!originalsMatch(frame,profile))return fail('original-tce-catalog-required');
 if(!physicalSource(frame,profile))return fail('actual-native-tce-physical-source-required');
 const scope=kind==='atk'?profile.attackClass:profile.dcClass;return {recognized:true,certified:true,bonus:legacyUnscoped||scope===null||spellClass===scope?profile.magnitude:0,scope,source:profile.id};
}

export function tceSpellBonusNative(frame,kind,spellClass,options={}){try{return nativeContribution(frame,kind,spellClass,options?.legacyUnscoped===true)}catch{return fail('unsupported-native-tce-source')}}
