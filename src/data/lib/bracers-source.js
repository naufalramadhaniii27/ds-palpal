import {bracersNativeProfile,bracersDefenseCondition} from './bracers.js';
import {BRACERS_PROFILES} from './bracers-profiles.js';
import {itemQuantity} from './attunement.js';
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&Object.keys(a).every((k,i)=>k===String(i));
const exact=(o,keys)=>obj(o)&&Reflect.ownKeys(o).length===keys.length&&keys.every(k=>own(o,k));
const nativePart='Bracers of Defense (no armor or Shield)';
const foreign=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit'];
export function canonicalBracersInventory(value){
 const seen=new Set();
 function encode(v){
  if(v===undefined)return ['undefined'];
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number')return Number.isFinite(v)?v:['number',String(v)];
  if(typeof v!=='object'||seen.has(v))throw Error('unsupported');
  seen.add(v);let result;
  if(Array.isArray(v)){
   if(!dense(v))throw Error('unsupported');result=['array',v.map(encode)];
  }else{
   const keys=Reflect.ownKeys(v);if(keys.some(k=>typeof k!=='string'))throw Error('unsupported');
   const names=keys.filter(k=>typeof k==='string');
   result=['object',names.sort().map(k=>[k,encode(v[k])])];
  }
  seen.delete(v);return result;
 }
 try{return JSON.stringify(encode(value));}catch{return null;}
}
const call=(r,k,n)=>typeof r?.[k]==='function'?r[k](n):null;
export function classifyBracersShield(row,registry){
 if(!obj(row)||!obj(registry))return null;
 const name=own(row,'key')?row.key:row.n;if(typeof name!=='string')return null;
 try{
  const custom=call(registry,'customDefinition',name);if(custom)return null;
  // Shield is the native engine's canonical special base, outside ARMOR.
  if(name==='Shield')return true;
  const direct=call(registry,'armorDef',name);
  if(direct)return direct.cat==='Shield';
  const base=call(registry,'baseOf',name),baseName=base?.b;
  if(baseName==='Shield')return true;
  const armor=typeof baseName==='string'?call(registry,'armorDef',baseName):null;
  if(armor)return armor.cat==='Shield';
  if(call(registry,'weaponDef',name)||call(registry,'gearDefinition',name))return false;
  if(typeof baseName==='string'&&call(registry,'weaponDef',baseName))return false;
  const definition=call(registry,'itemDefinition',name);
  if(Array.isArray(definition)&&['Wondrous Item','Ring','Rod','Staff','Wand','Potion','Scroll','Ammunition'].includes(definition[1]))return false;
  return null;
 }catch{return null;}
}
export function bracersSourceProfile(rows,item,options={}){
 const profile=bracersNativeProfile(rows,item);if(!profile)return null;
 if((options.customItems||[]).some(r=>(Array.isArray(r)?r[0]:r?.n)===item))return null;
 if(own(options.fxOverrides,item))return null;
 if(item==='Bracers of Defense'&&own(options.gxItems,item))return null;
 if(item==='Bracers of Archery'&&own(options,'gxItems')){
  const original=[{n:item,weapons:['Longbow','Shortbow'],atkBonus:[{when:['Longbow','Shortbow'],dmg:2}]}];
  if(canonicalBracersInventory(options.gxItems?.[item])!==canonicalBracersInventory(original))return null;
 }
 return profile;
}
export function isBracersDefensePart(row){return exact(row,['s','v'])&&row.s===nativePart&&row.v===2;}
export function bracersDefenseWitnessProblems(cap){
 const keys=['v','itemFingerprint','sourceIndex','sourceWorn','sourceAttuned','armorWorn','shieldClasses','inventoryFingerprint','acPartIndex'];
 if(!exact(cap,keys)||cap.v!==1)return ['unsupported-witness'];
 if(cap.itemFingerprint!==BRACERS_PROFILES['Bracers of Defense'].fingerprint)return ['unsupported-source'];
 if(![cap.sourceIndex,cap.acPartIndex].every(v=>v===null||(Number.isSafeInteger(v)&&v>=0)))return ['unsupported-index'];
 if(!['sourceWorn','sourceAttuned','armorWorn'].every(k=>typeof cap[k]==='boolean'))return ['unsupported-conditions'];
 if(!dense(cap.shieldClasses)||!cap.shieldClasses.every(v=>v===null||typeof v==='boolean')||typeof cap.inventoryFingerprint!=='string')return ['unsupported-frame'];
 return [];
}
export function bracersInventorySourceSupported(row,item){
 return obj(row)&&(own(row,'key')?row.key:row.n)===item&&!foreign.some(k=>own(row,k));
}
function currentSource(row){
 return obj(row)&&(own(row,'key')?row.key:row.n)==='Bracers of Defense'&&itemQuantity(row)>0&&row.eq===true&&row.attunedActive===true&&(!own(row,'att')||row.att===1||row.att===true)&&!foreign.some(k=>own(row,k));
}
export function bracersDefensePartEligible(C,row,index){
 if(!isBracersDefensePart(row))return true;
 const cap=C?.bracersDefense;
 if(bracersDefenseWitnessProblems(cap).length||!dense(C?.inv))return false;
 if(cap.acPartIndex!==index||cap.shieldClasses.length!==C.inv.length||canonicalBracersInventory(C.inv)!==cap.inventoryFingerprint)return false;
 if(!currentSource(C.inv[cap.sourceIndex]))return false;
 const facts={sourceWorn:cap.sourceWorn,sourceAttuned:cap.sourceAttuned,armorWorn:cap.armorWorn};
 const result=bracersDefenseCondition(facts,C.inv,(_,i)=>cap.shieldClasses[i]);
 return result.ok&&result.eligible===true;
}
