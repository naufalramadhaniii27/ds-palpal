import {bagTricksProblems} from '../../data/lib/bag-tricks.js';
import {hornValhallaProblems} from '../../data/lib/horn-valhalla.js';
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key);
/* These counters pay for recorded NPCs; generic pips cannot create or refund them. */
export function summonResourceManaged(character,state,key){
 if((Array.isArray(character?.res)?character.res:[]).some(row=>row&&row.k===key&&(own(row,'bagTricks')||own(row,'hornValhalla'))))return true;
 return [[state?.bagTricks,bagTricksProblems],[state?.hornValhalla,hornValhallaProblems]].some(([namespace,validate])=>!validate(namespace).length&&namespace.physical.some(row=>row.key===key));
}
