// Source authorization for standalone spell calculators, separate from cast authorization.
import {tattooFixedSourceCapability} from './spellwrought-tattoo.js';
import {projectTattooBody,tattooFixedSourceMarker} from './spellwrought-tattoo.js';
const failure=reason=>({ok:false,reason});
const equal=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Reflect.ownKeys(a);return keys.length===Reflect.ownKeys(b).length&&keys.every(key=>Object.prototype.hasOwnProperty.call(b,key)&&equal(a[key],b[key]))};
export function tattooOwnedSpellRow(body,definitions,row,mode){
 if(!row||!Object.prototype.hasOwnProperty.call(row,'fixedSpellSource'))return failure('typed-source-required');const projected=tattooBodyProjection(body,definitions);if(!projected.ok)return projected;const matches=projected.records.filter(record=>record.spellRow&&record.source.sourceId===row.fixedSpellSource?.sourceId);if(matches.length!==1||!equal(matches[0].spellRow,row))return failure('noncanonical-body-spell');
 const selected=mode==='preview'?(matches[0].phase==='ready'?'ready':matches[0].phase==='casting'?'casting':'receipt'):mode;if(!['ready','casting','receipt'].includes(selected))return failure('invalid-body-spell-mode');const source=tattooFixedSourceCapability(body,row.fixedSpellSource,row,selected);return source.ok?{...source,spell:row,"castLevel":matches[0]['castLevel']}:source;
}
// Standalone spell ownership predicate. A label/use/class never establishes body spell ownership.
export function healingSpellOwned(character,state,definitions,row){if(row&&Object.prototype.hasOwnProperty.call(row,'fixedSpellSource'))return tattooOwnedSpellRow(state.spellwroughtTattoos,definitions,row,'preview').ok;return (character.spells||[]).includes(row)}

export function tattooBodyProjection(body,definitions){const projected=projectTattooBody(body,definitions);if(!projected.ok)return projected;return {ok:true,records:projected.records.map(record=>{const source=tattooFixedSourceMarker(body,record.sourceId);return {...record,source,spellRow:record.spellDefinition?{...record.spellDefinition,use:"Tattoo",fixedSpellSource:source}:null,"castLevel":record.profile.level}}),attacks:[],permanentSpellPicks:[]}}
export function importablePermanentSpell(row){return !!row&&!Object.prototype.hasOwnProperty.call(row,'tattooSource')&&!Object.prototype.hasOwnProperty.call(row,'fixedSpellSource')}
