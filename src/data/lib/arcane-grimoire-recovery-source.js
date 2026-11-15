/* Recovery-only source capability. No slot, counter or saved history is created here. */
import {arcaneGrimoireRecoveryProfile,canonicalArcaneGrimoireDefinition as canonical} from './arcane-grimoire-recovery-profiles.js';
import {itemQuantity} from './attunement.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),int=(v,min=0)=>Number.isSafeInteger(v)&&v>=min,fail=reason=>({certified:false,bonus:0,reason});
const foreign=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','rodAbsorption','travelGoat','arcaneGrimoireRecovery','instrumentSpells'];
function data(v,k){const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable&&own(d,'value');}
function exact(v,keys){return object(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>data(v,k));}
function dense(v){return Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i));}
function quantityValid(row){if(!own(row,'q'))return true;if(!data(row,'q')||!['string','number'].includes(typeof row.q))return false;const value=Number(row.q);return int(value)&&value===itemQuantity(row);}
function original(rows,profile){if(!Array.isArray(rows))return false;const found=rows.filter(row=>Array.isArray(row)&&row[0]===profile.item);return found.length===1&&canonical(found[0])===profile.fingerprint;}
function definition(frame){
 const profile=arcaneGrimoireRecoveryProfile(frame?.item);if(!profile)return fail('not-an-original-arcane-grimoire');
 if(frame.customItems!==undefined&&!Array.isArray(frame.customItems))return fail('unsupported-custom-item-data');
 if((frame.customItems||[]).some(row=>(Array.isArray(row)?row[0]:row?.n)===profile.item)||own(frame.fxOverrides,profile.item)||own(frame.gxItems,profile.item))return fail('original-arcane-grimoire-required');
 if(!original(frame.originalBookRows,profile)||!original(frame.originalCatalogRows,profile)||canonical(frame.resolvedRow)!==profile.fingerprint)return fail('original-arcane-grimoire-catalog-required');
 const row=frame.row;if(!object(row)||!data(row,'n')||typeof row.n!=='string'||own(row,'key')&&!data(row,'key')||!quantityValid(row))return fail('supported-arcane-grimoire-row-required');
 if((own(row,'key')?row.key:row.n)!==profile.item||foreign.some(k=>own(row,k)))return fail('original-arcane-grimoire-identity-required');
 return {certified:true,bonus:0,item:profile.item,itemFingerprint:profile.fingerprint,source:profile.id};
}
export function arcaneGrimoireNativeDefinition(frame){try{return definition(frame)}catch{return fail('unsupported-arcane-grimoire-source')}}
export function arcaneGrimoireNativeSource(frame){
 try{const result=definition(frame);if(!result.certified)return result;if(itemQuantity(frame.row)<=0||frame.attunement?.requires!==true||frame.attunement.attuned!==true)return fail('present-allocated-arcane-grimoire-required');return {...result,bonus:1};}catch{return fail('unsupported-arcane-grimoire-source')}
}
function resourceValid(resource){return exact(resource,['key','index','max','reset'])&&typeof resource.key==='string'&&resource.key.trim()===resource.key&&resource.key.length>0&&!['__proto__','constructor','prototype'].includes(resource.key)&&int(resource.index)&&int(resource.max,1)&&resource.reset==='long';}
export function arcaneGrimoireRecoveryWitnessProblems(value){
 try{
  if(!exact(value,['v','bonus','sources','inventoryFingerprint','resource','wizardLevel'])||value.v!==1||value.bonus!==1||!dense(value.sources)||!value.sources.length||typeof value.inventoryFingerprint!=='string'||!resourceValid(value.resource)||!int(value.wizardLevel,1)||value.wizardLevel>20)return ['unsupported-arcane-grimoire-capability'];
  const seen=new Set();for(const source of value.sources){if(!exact(source,['index','item','itemFingerprint'])||!int(source.index)||seen.has(source.index))return ['unsupported-arcane-grimoire-source-witness'];const profile=arcaneGrimoireRecoveryProfile(source.item);if(!profile||source.itemFingerprint!==profile.fingerprint)return ['unsupported-arcane-grimoire-source-witness'];seen.add(source.index);}
  return [];
 }catch{return ['unsupported-arcane-grimoire-capability']}
}
function matchesResource(C,cap,resource){
 const row=C.res?.[cap.resource.index];if(!row||row.k!==cap.resource.key||row.max!==cap.resource.max||row.reset!=='long'||row.n!=='Arcane Recovery'||row.item||C.res.filter(r=>r?.k===row.k).length!==1)return false;
 return !resource||resource.k===row.k&&resource.max===row.max&&resource.reset===row.reset;
}
export function arcaneGrimoireRecoveryBonus(C,resource=undefined,wizardLevel=undefined){
 try{
  if(!object(C)||!data(C,'arcaneGrimoireRecovery')||!data(C,'inv')||!data(C,'res'))return 0;const cap=C.arcaneGrimoireRecovery;if(arcaneGrimoireRecoveryWitnessProblems(cap).length)return 0;
  if(wizardLevel!==undefined&&wizardLevel!==cap.wizardLevel||!Array.isArray(C.inv)||canonical(C.inv)!==cap.inventoryFingerprint||!matchesResource(C,cap,resource))return 0;
  return cap.sources.every(source=>{const row=C.inv[source.index],name=own(row,'key')?row.key:row?.n;return name===source.item&&quantityValid(row)&&itemQuantity(row)>0&&row.attunedActive===true&&!foreign.some(k=>own(row,k));})?1:0;
 }catch{return 0;}
}
