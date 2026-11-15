import {rodAbsorptionNativeProfile,ROD_ABSORPTION_PROFILE,ROD_ABSORPTION_FINGERPRINT} from './rod-absorption-profile.js';
import {rodAbsorptionProblems} from './rod-absorption.js';
import {itemInUse,itemQuantity} from './attunement.js';
import {canonicalBracersInventory} from './bracers-source.js';
export const canonicalRodAbsorptionDefinition=canonicalBracersInventory;
export function rodAbsorptionItemName(name){return name==='Rod of Absorption';}
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),key=row=>own(row,'key')?row.key:row?.n;
const foreign=['instrumentSpells','storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit','travelGoat'];
export function rodAbsorptionInventorySourceSupported(row){return obj(row)&&key(row)==='Rod of Absorption'&&!foreign.some(k=>own(row,k));}
export function rodAbsorptionNativeSource(rows,options={}){
 const profile=rodAbsorptionNativeProfile(rows);if(!profile)return null;
 if((options.customItems||[]).some(row=>(Array.isArray(row)?row[0]:row?.n)===profile.item))return null;
 if(own(options.fxOverrides,profile.item)||own(options.gxItems,profile.item))return null;
 if(own(options,'resolvedRow')&&canonicalRodAbsorptionDefinition(options.resolvedRow)!==canonicalRodAbsorptionDefinition(JSON.parse(ROD_ABSORPTION_FINGERPRINT)))return null;
 return {item:profile.item,nativeProfile:profile.profile,itemFingerprint:profile.fingerprint};
}
export function rodAbsorptionMarker(rod){return {v:1,id:rod.id,nativeProfile:ROD_ABSORPTION_PROFILE,itemFingerprint:rod.fingerprint};}
export function rodAbsorptionMarkerSource(marker,source,item='Rod of Absorption'){
 if(!source||item!==source.item||!obj(marker)||Reflect.ownKeys(marker).length!==4)return null;
 if(!['v','id','nativeProfile','itemFingerprint'].every(k=>own(marker,k)))return null;
 return marker.v===1&&/^ra-[1-9][0-9]*$/.test(marker.id)&&marker.nativeProfile===source.nativeProfile&&marker.itemFingerprint===source.itemFingerprint?source:null;
}
export function rodAbsorptionPhysicalSource(row,state,source,status,inventory){
 if(rodAbsorptionProblems(state).length||!obj(row)||foreign.some(k=>own(row,k)))return null;
 if(!rodAbsorptionMarkerSource(row.rodAbsorption,source,key(row))||itemQuantity(row)!==1)return null;
 if(!Array.isArray(inventory)||inventory.filter(r=>r?.rodAbsorption?.id===row.rodAbsorption.id).length!==1)return null;
 const rod=state.rods.find(r=>r.id===row.rodAbsorption.id);
 if(!rod||rod.nonmagical||rod.fingerprint!==source.itemFingerprint||rod.profile!==source.nativeProfile)return null;
 if(status?.requires!==true||status.attuned!==true||!itemInUse(row,status))return null;
 return {rod,source,id:rod.id};
}
const excluded=['fixedSpellSource','tattooSource','gemSpellcasting','storedSpellcasting','storedSpellSlotLevel','itc','temporaryCantrip'];
export function rodAbsorptionSlotMaximum(character){
 const sc=character?.spellcasting;if(!obj(sc)||!Array.isArray(sc.slots))return null;
 let maximum=0;
 for(let i=0;i<sc.slots.length;i++){const n=sc.slots[i];if(!Number.isSafeInteger(n)||n<0||i>=9)return null;if(n>0)maximum=i+1;}
 if(sc.pact!==undefined&&sc.pact!==null){const p=sc.pact;if(!obj(p)||!Number.isSafeInteger(p.n)||p.n<0||!Number.isSafeInteger(p.lvl)||p.lvl<1||p.lvl>5)return null;if(p.n>0)maximum=Math.max(maximum,p.lvl);}
 return maximum;
}
function eligibleClassRow(row,cls,names,always){
 if(!obj(row)||excluded.some(k=>own(row,k))||!Number.isSafeInteger(row.l)||row.l<1)return false;
 if(own(row,'sourceKey')&&row.sourceKey!==cls)return false;
 if(Array.isArray(names)&&names.includes(row.n)&&row.src===cls&&row.use==='Prepared')return true;
 return always.some(s=>s.n===row.n&&s.k===cls&&s.src===row.src&&(s.preparedGrant===true?s.use===row.use&&(!s.mi||s.mi===row.mi):row.use==='Always prepared'));
}
function preparedPoolMatches(part,definition,name){
 if(Array.isArray(part.eligiblePreparedSpellNames))return part.eligiblePreparedSpellNames.includes(name);
 return Array.isArray(definition.classList)&&[part.list||part.cls,...(part.xl||[])].some(cls=>definition.classList.includes(cls));
}
export function rodAbsorptionSpellWitness(character,catalog,parts,classSpells,always){
 const maximumSlotLevel=rodAbsorptionSlotMaximum(character);
 if(maximumSlotLevel===null||!Array.isArray(character?.spells)||!Array.isArray(catalog)||!Array.isArray(parts)||!obj(classSpells)||!Array.isArray(always))return {ok:false,reason:'native-casting-context-unavailable'};
 const knownPreparedSpells=[],bindings=[];
 for(let spellIndex=0;spellIndex<character.spells.length;spellIndex++){
  const row=character.spells[spellIndex],matches=parts.filter(p=>typeof p?.cls==='string'&&eligibleClassRow(row,p.cls,classSpells[p.cls]||[],always));
  if(matches.length!==1)continue;const definitions=catalog.filter(d=>d?.n===row.n&&d.l===row.l);
  if(definitions.length!==1)continue;const definition=definitions[0];
  if(row.use==='Prepared'&&(!Number.isSafeInteger(matches[0].maximumPreparedLevel)||row.l>matches[0].maximumPreparedLevel))continue;
  if(row.use==='Prepared'&&!preparedPoolMatches(matches[0],definition,row.n))continue;
  const fingerprint=canonicalRodAbsorptionDefinition(definition);if(!fingerprint)continue;
  const sourceKey=matches[0].cls,spellKey='class:'+encodeURIComponent(sourceKey)+'|'+encodeURIComponent(row.n);
  if(!knownPreparedSpells.some(s=>s.key===spellKey))knownPreparedSpells.push({key:spellKey,name:row.n,baseLevel:row.l,definitionFingerprint:fingerprint});
  bindings.push({spellIndex,spellKey,sourceKey,definition:structuredClone(definition)});
 }
 return {ok:true,casting:{actualHolding:false,actualAllocatedAttunement:false,actorIsSpellcaster:parts.length>0,maximumSlotLevel,knownPreparedSpells},bindings};
}
export function rodAbsorptionSourceWitnessProblems(witness){
 if(!obj(witness)||Reflect.ownKeys(witness).length!==4||!['v','inventoryFingerprint','source','rows'].every(k=>own(witness,k))||witness.v!==1)return ['unsupported-witness'];
 if(typeof witness.inventoryFingerprint!=='string'||!Array.isArray(witness.rows)||Reflect.ownKeys(witness.rows).length!==witness.rows.length+1||!Object.keys(witness.rows).every((k,i)=>k===String(i)))return ['unsupported-frame'];
 if(witness.source!==null&&(!obj(witness.source)||Reflect.ownKeys(witness.source).length!==3||!['item','nativeProfile','itemFingerprint'].every(k=>own(witness.source,k))||witness.source.item!=='Rod of Absorption'||witness.source.nativeProfile!==ROD_ABSORPTION_PROFILE||witness.source.itemFingerprint!==ROD_ABSORPTION_FINGERPRINT))return ['unsupported-source'];
 if(witness.source===null&&witness.rows.length)return ['unsupported-source'];
 const seen=new Set(),indices=new Set();
 for(const row of witness.rows){if(!obj(row)||Reflect.ownKeys(row).length!==4||!['index','id','holding','allocatedAttunement'].every(k=>own(row,k))||!Number.isSafeInteger(row.index)||row.index<0||!/^ra-[1-9][0-9]*$/.test(row.id)||row.holding!==true||row.allocatedAttunement!==true||seen.has(row.id)||indices.has(row.index))return ['unsupported-binding'];seen.add(row.id);indices.add(row.index);}
 return [];
}
