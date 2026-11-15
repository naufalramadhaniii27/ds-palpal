/* Negative-only inventory/resource guards. History is not permission to cast. */
import {instrumentModel} from '../../data/lib/instrument-spells.js';
import {instrumentProfiles,canonicalInstrumentDefinition} from '../../data/lib/instrument-spell-profiles.js';
const model=instrumentModel(instrumentProfiles()),own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k);
export const instrumentSpellsInventoryGuidance='Use the matching Build to change this instrument’s holding or attunement. Use its original spell controls to separate, remove or restore the same physical instrument without losing its spell histories.';
export function instrumentSpellsInventoryRequiresBuild(row){return !!row&&(own(row,'instrumentSpell')||own(row,'instrumentSpells'))}
export function instrumentSpellsResourceManaged(character,state,key){
 if((Array.isArray(character?.res)?character.res:[]).some(row=>row?.k===key&&(own(row,'instrumentSpell')||own(row,'instrumentSpells'))))return true;
 return [state?.instrumentSpells,character?.instrumentSpells].some(value=>!model.problems(value).length&&value.physical.some(p=>p.spells.some(g=>g.budgetKey===key)));
}
function supportedResource(row){const field=Object.getOwnPropertyDescriptor(row,'instrumentSpell');if(!field||!own(field,'value'))return false;const cap=field.value;return !!cap&&typeof cap==='object'&&!Array.isArray(cap)&&Reflect.ownKeys(cap).length===4&&['v','id','grantId','budgetKey'].every(k=>{const d=Object.getOwnPropertyDescriptor(cap,k);return d?.enumerable===true&&own(d,'value')})&&cap.v===1&&cap.budgetKey===row.k&&row.max===1&&row.reset==='none'}
export function instrumentSpellsResourceSummary(character,state,row){
 if(!row||!own(row,'instrumentSpell')&&!own(row,'instrumentSpells'))return null;
 const review='This spell history needs review in the original Instrument controls.';
 if(!supportedResource(row))return review;
 if(own(character,'instrumentSpells')&&canonicalInstrumentDefinition(character.instrumentSpells)!==canonicalInstrumentDefinition(state?.instrumentSpells))return review;
 const result=model.projection(state?.instrumentSpells,state?.used);if(!result.ok||!('physical' in result)||!Array.isArray(result.physical))return review;
 const physical=result.physical.find(p=>p.id===row.instrumentSpell.id),spell=physical?.spells.find(g=>g.grantId===row.instrumentSpell.grantId&&g.budgetKey===row.k);
 if(!spell||spell.remaining===null)return 'This physical instrument’s spell history is unknown; review every spell.';
 return spell.remaining===0?'This spell was cast; record the next actual dawn before reuse.':'One cast remains in the recorded history; use the original Instrument controls.';
}
