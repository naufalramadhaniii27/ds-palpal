/* Passive, source-qualified Gloves bonus. Movement remains in the native item fx.
   This module does not alter ordinary Athletics or create actor storage. */
const ITEM='Gloves of Swimming and Climbing',PROFILE='dmg2024',obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>own(v,k)),dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i));
const CONFLICTS=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes'];
export function canonicalSwimClimbGlovesDefinition(value){if(Array.isArray(value))return '['+value.map(canonicalSwimClimbGlovesDefinition).join(',')+']';if(obj(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalSwimClimbGlovesDefinition(value[k])).join(',')+'}';return JSON.stringify(value);}
function printedGloves(row){
 if(!Array.isArray(row)||row[0]!==ITEM||row[3]!==1||typeof row[4]!=='string'||!exact(row[5],['fx'])||!exact(row[5].fx,['climb','swim'])||row[5].fx.climb!=='walk'||row[5].fx.swim!=='walk')return false;
 const text=row[4].toLowerCase();return text.includes('wearing these gloves')&&text.includes('swim speed')&&text.includes('climb speed')&&text.includes('each equal to your speed')&&text.includes('+5 bonus')&&text.includes('strength (athletics)')&&text.includes('climb or to swim');
}
export function swimClimbGlovesNativeProfile(rows){
 if(!Array.isArray(rows))return null;const matches=rows.filter(row=>Array.isArray(row)&&row[0]===ITEM);if(matches.length!==1||!printedGloves(matches[0]))return null;return {nativeProfile:PROFILE,item:ITEM,itemFingerprint:canonicalSwimClimbGlovesDefinition(matches[0])};
}
function sourceValid(source){return exact(source,['nativeProfile','item','itemFingerprint'])&&source.nativeProfile===PROFILE&&source.item===ITEM&&fingerprintValid(source.itemFingerprint);}
function indicesValid(indices){return dense(indices)&&indices.length>0&&indices.every(i=>Number.isSafeInteger(i)&&i>=0)&&new Set(indices).size===indices.length;}
export function swimClimbGlovesCapability(source,indices){return sourceValid(source)&&indicesValid(indices)?{v:1,item:ITEM,nativeProfile:PROFILE,itemFingerprint:source.itemFingerprint,sourceIndices:indices.slice()}:null;}
function fingerprintValid(fingerprint){if(typeof fingerprint!=='string')return false;try{const row=JSON.parse(fingerprint);return printedGloves(row)&&canonicalSwimClimbGlovesDefinition(row)===fingerprint;}catch(error){return false;}}
export function swimClimbGlovesProblems(cap){return exact(cap,['v','item','nativeProfile','itemFingerprint','sourceIndices'])&&cap.v===1&&cap.item===ITEM&&cap.nativeProfile===PROFILE&&fingerprintValid(cap.itemFingerprint)&&indicesValid(cap.sourceIndices)?[]:['unsupported-swim-climb-gloves-source'];}
function currentRow(row){
 if(!obj(row)||CONFLICTS.some(k=>own(row,k)))return false;const key=own(row,'key')?row.key:row.n,q=row.q==null?1:row.q;
 return key===ITEM&&row.eq===true&&row.attunedActive===true&&(!own(row,'att')||row.att===true||row.att===1)&&Number.isSafeInteger(q)&&q>0;
}
export function swimClimbGlovesCheck(C,input){
 if(!obj(C)||!own(C,'swimClimbGloves')||swimClimbGlovesProblems(C.swimClimbGloves).length||!Array.isArray(C.inv))return {ok:false,bonus:0,reason:'swim-climb-gloves-source-unavailable'};
 if(!C.swimClimbGloves.sourceIndices.every(i=>currentRow(C.inv[i])))return {ok:false,bonus:0,reason:'swim-climb-gloves-source-changed'};
 if(!exact(input,['skill','ability','purpose'])||input.skill!=='Athletics'||input.ability!=='STR'||!['climbing','swimming'].includes(input.purpose))return {ok:false,bonus:0,reason:'actual-strength-athletics-climb-or-swim-required'};
 return {ok:true,bonus:5};
}
