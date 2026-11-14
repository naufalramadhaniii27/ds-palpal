import {defenderProblems,defenderProjection} from './defender.js';
import {canonicalDefenderDefinition,defenderNativeSource,defenderMarkerSource} from './defender-source.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)),index=v=>Number.isSafeInteger(v)&&v>=0;
function rowsValid(rows){return dense(rows)&&rows.every(r=>exact(r,['id','base','key','index','attuned','active','itemFingerprint'])&&typeof r.id==='string'&&typeof r.base==='string'&&typeof r.key==='string'&&index(r.index)&&typeof r.attuned==='boolean'&&typeof r.active==='boolean'&&typeof r.itemFingerprint==='string')&&new Set(rows.map(r=>r.id)).size===rows.length&&new Set(rows.map(r=>r.index)).size===rows.length;}
function attacksValid(rows){return dense(rows)&&rows.every(r=>exact(r,['index','id','fingerprint'])&&index(r.index)&&typeof r.id==='string'&&typeof r.fingerprint==='string')&&new Set(rows.map(r=>r.index)).size===rows.length;}
function supported(c,s){
 if(!obj(c)||!obj(s)||!own(c,'defender')||!own(s,'defender')||defenderProblems(c.defender).length||defenderProblems(s.defender).length)return false;
 if(canonicalDefenderDefinition(c.defender)!==canonicalDefenderDefinition(s.defender))return false;
 const registry=c.defenderSources;return exact(registry,['v','rows','attacks'])&&registry.v===1&&rowsValid(registry.rows)&&attacksValid(registry.attacks)&&Array.isArray(c.inv)&&Array.isArray(c.attacks);
}
function sourceSnapshot(fingerprint){try{const row=JSON.parse(fingerprint),source=defenderNativeSource([row]);return source?.itemFingerprint===fingerprint?source:null;}catch(error){return null;}}
function physicalSource(c,s,row){
 if(!row.attuned||!row.active)return null;const physical=s.defender.physical.find(p=>p.id===row.id),raw=c.inv[row.index];
 if(!physical?.present||physical.base!==row.base||!obj(raw)||raw.eq===false||raw.attunedActive!==true||(raw.q==null?1:raw.q)!==1)return null;
 if(c.inv.filter(r=>r?.defender?.id===row.id).length!==1)return null;
 const key=own(raw,'key')?raw.key:raw.n,source=sourceSnapshot(row.itemFingerprint);
 if(key!==row.key||!source||!defenderMarkerSource(raw.defender,source,key)||raw.defender.id!==row.id||raw.defender.base!==physical.base)return null;
 return defenderProjection(s.defender,row.id);
}
function certificateMatches(marker,row){return exact(marker,['v','id','nativeProfile','base','attackBonus','damageBonus','itemFingerprint'])&&marker.v===1&&marker.id===row.id&&marker.nativeProfile==='dmg2024'&&marker.base===row.base&&marker.attackBonus===3&&marker.damageBonus===3&&marker.itemFingerprint===row.itemFingerprint;}
export function defenderAttackEffect(c,s,attackIndex){
 if(!supported(c,s)||!index(attackIndex))return {ok:false};const attack=c.attacks[attackIndex],binding=c.defenderSources.attacks.find(r=>r.index===attackIndex);
 if(!obj(attack)||!binding)return {ok:false};const source=c.defenderSources.rows.find(r=>r.id===binding.id);
 if(!source||!certificateMatches(attack.defender,source))return {ok:false};const payload={...attack};delete payload.defender;
 if(canonicalDefenderDefinition(payload)!==binding.fingerprint||!completeAttackProvenance(c,source))return {ok:false};const projection=physicalSource(c,s,source);
 return projection?.ok?{...projection,id:source.id}:{ok:false};
}
export function defenderAttackDelta(c,s,attackIndex){const effect=defenderAttackEffect(c,s,attackIndex);return effect.ok&&'attackDelta' in effect?effect.attackDelta:0;}
export function defenderDamageDelta(c,s,attackIndex){const effect=defenderAttackEffect(c,s,attackIndex);return effect.ok&&'damageDelta' in effect?effect.damageDelta:0;}
function registeredAttackMatches(c,row,binding){
 const attack=c.attacks[binding.index];if(!obj(attack)||binding.id!==row.id||!certificateMatches(attack.defender,row))return false;
 const payload={...attack};delete payload.defender;return canonicalDefenderDefinition(payload)===binding.fingerprint;
}
function missingSourceBinding(c,row,attack,attackIndex){
 if(!obj(attack))return false;
 // Native labels are a negative integrity check only; they never grant source permission.
 const related=attack.defender?.id===row.id||attack.n===row.key||attack.n===row.key+' (thrown)'||attack.of===row.key;
 if(!related)return false;const binding=c.defenderSources.attacks.find(value=>value.index===attackIndex);
 return !binding||!registeredAttackMatches(c,row,binding);
}
function completeAttackProvenance(c,row){
 const bindings=c.defenderSources.attacks.filter(value=>value.id===row.id);
 return bindings.length>0&&bindings.every(binding=>registeredAttackMatches(c,row,binding))&&!c.attacks.some((attack,attackIndex)=>missingSourceBinding(c,row,attack,attackIndex));
}
export function defenderArmorClassBonus(c,s){if(!supported(c,s))return 0;let bonus=0;for(const row of c.defenderSources.rows){if(!completeAttackProvenance(c,row))continue;const projection=physicalSource(c,s,row);if(projection?.ok)bonus=Math.max(bonus,projection.armorClass);}return bonus;}
