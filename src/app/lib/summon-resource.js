import {timedDefensesProblems} from '../../data/lib/timed-defenses.js';
import {bagTricksProblems} from '../../data/lib/bag-tricks.js';
import {hornValhallaProblems} from '../../data/lib/horn-valhalla.js';
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key);
/* Source-owned activation counters cannot be changed through generic pips. */
export function summonResourceManaged(character,state,key){
 if((Array.isArray(character?.res)?character.res:[]).some(row=>row&&row.k===key&&(own(row,'bagTricks')||own(row,'hornValhalla')||own(row,'timedDefenses'))))return true;
 return [[state?.bagTricks,bagTricksProblems],[state?.hornValhalla,hornValhallaProblems]].some(([namespace,validate])=>!validate(namespace).length&&namespace.physical.some(row=>row.key===key))||!timedDefensesProblems(state?.timedDefenses).length&&state.timedDefenses.physical.some(row=>row.kind==='armor-invulnerability'&&row.key===key);
}
