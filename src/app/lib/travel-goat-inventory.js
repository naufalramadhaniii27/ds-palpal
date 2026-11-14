/* Negative-only transport/resource guards; readiness comes from the owned native budget. */
import {travelGoatProblems,travelGoatProjection} from '../../data/lib/travel-goat.js';
import {canonicalTravelGoatDefinition} from '../../data/lib/travel-goat-profile.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k);
export function travelGoatInventoryRequiresBuild(row){return !!row&&own(row,'travelGoat')}
export const travelGoatInventoryGuidance='Use the Goat of Traveling panel to record this physical component’s changes. Its charges, transformation and recovery history are preserved.';
export function travelGoatResourceManaged(character,state,key){
 if((Array.isArray(character?.res)?character.res:[]).some(row=>row?.k===key&&own(row,'travelGoat')))return true;
 return [state?.travelGoat,character?.travelGoat].some(value=>!travelGoatProblems(value).length&&value.physical.some(p=>p.budgetKey===key));
}
function supportedResource(cap,row){return !!cap&&Reflect.ownKeys(cap).length===5&&['v','id','nativeProfile','component','budgetKey'].every(k=>own(cap,k))&&cap.v===1&&cap.component==='traveling'&&cap.budgetKey===row.k&&row.max===24}
export function travelGoatResourceSummary(character,state,row){
 if(!row||!own(row,'travelGoat'))return null;
 const cap=row.travelGoat,authority=state?.travelGoat;
 if(row.reviewRequired===true)return 'Traveling charges unknown; review this physical statuette.';
 if(!supportedResource(cap,row))return 'Traveling charge record needs review.';
 if(travelGoatProblems(authority).length||!own(character,'travelGoat')||canonicalTravelGoatDefinition(character.travelGoat)!==canonicalTravelGoatDefinition(authority))return 'Traveling charge record needs review.';
 if(!authority.physical.some(p=>p.id===cap.id&&p.profile===cap.nativeProfile&&p.budgetKey===row.k))return 'Traveling charge record needs review.';
 if(!own(state?.used,row.k))return 'Traveling charges unknown; review this physical statuette.';
 const result=travelGoatProjection(authority,cap.id,{key:row.k,used:state.used[row.k],max:24});
 if(!result.ok||!('remaining' in result)||result.remaining===null)return 'Traveling charge record needs review.';
 return result.waiting?'Exhausted; verify seven days before reuse.':result.remaining+' of 24 Traveling charges remain.';
}
