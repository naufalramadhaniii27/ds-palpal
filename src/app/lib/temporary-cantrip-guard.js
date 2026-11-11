// Cached spell/attack rows never authorize a temporal permission without its current actor-owned window.
import {temporaryCantripStateProblems} from '../../data/lib/temporary-cantrip.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const own=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
const idsValid=ids=>Array.isArray(ids)&&ids.length>0&&Object.keys(ids).length===ids.length&&ids.every(id=>typeof id==='string'&&/^tc-[1-9][0-9]*$/.test(id))&&new Set(ids).size===ids.length;
export function temporaryGrantPermission(name,grantIds,state){
 if(typeof name!=='string'||!name||!idsValid(grantIds)||temporaryCantripStateProblems(state).length)return {allowed:false,reason:'temporary-cantrip-unavailable',signature:''};
 const grants=grantIds.map(id=>state.grants.find(grant=>grant.id===id&&grant.spell===name));
 if(grants.some(grant=>!grant))return {allowed:false,reason:'temporary-cantrip-unavailable',signature:''};
 const allowed=grants.some(grant=>state.elapsedSeconds<grant.expiresAt);
 return {allowed,reason:allowed?'':'temporary-cantrip-expired',signature:JSON.stringify({elapsedSeconds:state.elapsedSeconds,grants})};
}
export function temporaryCantripStatus(row,state){
 if(!object(row)||!own(row,'temporaryCantrip'))return {tagged:false,allowed:true,reason:'',signature:''};
 const marker=row.temporaryCantrip,unavailable={tagged:true,allowed:false,reason:'temporary-cantrip-unavailable',signature:''};
 if(!object(marker)||marker.v!==1||Reflect.ownKeys(marker).length!==3||!['v','grantIds','grants'].every(key=>own(marker,key))||!idsValid(marker.grantIds)||!Array.isArray(marker.grants)||marker.grants.length!==marker.grantIds.length||row.sourceKey!=='Artificer'||row.ab!=='INT'||own(row,'l')&&row.l!==0)return unavailable;
 const permission=temporaryGrantPermission(row.n,marker.grantIds,state);if(!permission.signature)return unavailable;
 for(let index=0;index<marker.grantIds.length;index++){
  const record=marker.grants[index],grant=state.grants.find(entry=>entry.id===marker.grantIds[index]);
  if(!object(record)||Reflect.ownKeys(record).length!==5||!['id','sourceId','item','startedAt','expiresAt'].every(key=>own(record,key)&&record[key]===grant[key]))return unavailable;
 }
 return {tagged:true,...permission};
}
