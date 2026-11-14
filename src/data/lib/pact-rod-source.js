import {LEGACY_PACT_ROD_ROWS} from './pact-rod-profiles.js';
import {itemInUse,itemQuantity} from './attunement.js';
import {assertSlotRecoveryCurrent} from './slot-recovery.js';
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const fail=reason=>({certified:false,bonus:0,reason});
const foreign=['storedSpells','spellGem','tattoo','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption'];
function canonical(value){
 const seen=new Set();
 function encode(v){
  if(v===undefined)return ['undefined'];
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(!obj(v)&&!Array.isArray(v)||seen.has(v))throw Error('unsupported');
  seen.add(v);const keys=Reflect.ownKeys(v);if(keys.some(k=>typeof k!=='string'))throw Error('unsupported');
  const result=Array.isArray(v)?['array',v.length,keys.filter(k=>k!=='length').sort().map(k=>[k,encode(v[k])])]:['object',keys.sort().map(k=>[k,encode(v[k])])];
  seen.delete(v);return result;
 }
 try{return JSON.stringify(encode(value));}catch{return null;}
}
function nativeRow(rows,item,expected){
 if(!Array.isArray(rows))return false;
 const found=rows.filter(row=>Array.isArray(row)&&row[0]===item);
 return found.length===1&&canonical(found[0])===expected;
}
function physicalSource(frame,item){
 const row=frame.inventoryRow,status=frame.allocatedStatus;
 if(!obj(row)||foreign.some(k=>own(row,k)))return false;
 if(!Number.isFinite(itemQuantity(row))||status?.requires!==true||status.attuned!==true||!itemInUse(row,status))return false;
 if(!own(row,'slotRecovery'))return true;
 const current=assertSlotRecoveryCurrent(row,frame.slotRecoverySources);
 return current.ok&&'profile' in current&&current.profile?.nativeProfile==='dmg2014'&&current.profile.item===item;
}
export function legacyPactRodNativeBonus(frame,kind,spellClass){
 if(!obj(frame)||!['atk','dc'].includes(kind))return fail('unsupported-request');
 const row=frame.inventoryRow,item=own(row,'key')?row.key:row?.n;
 if(typeof item!=='string'||!own(LEGACY_PACT_ROD_ROWS,item))return fail('not-original-legacy-profile');
 const original=LEGACY_PACT_ROD_ROWS[item],fingerprint=canonical(original);
 if(!nativeRow(frame.legacyBookRows,item,fingerprint)||canonical(frame.resolvedRow)!==fingerprint)return fail('original-source-book-unavailable');
 if(!Array.isArray(frame.customItems)||frame.customItems.some(r=>(Array.isArray(r)?r[0]:r?.n)===item))return fail('custom-source');
 if(!obj(frame.fxOverrides)||!obj(frame.gxItems)||own(frame.fxOverrides,item)||own(frame.gxItems,item))return fail('altered-source-effects');
 if(!physicalSource(frame,item))return fail('physical-source-unavailable');
 const amount=original[5].fx[kind==='atk'?'spellAtk':'spellDc'];
 return {certified:true,bonus:kind==='dc'&&spellClass!=='Warlock'?0:amount,item,nativeProfile:'dmg2014'};
}
