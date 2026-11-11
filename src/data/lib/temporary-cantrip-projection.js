// Native spell definitions and temporal permissions remain separate from permanent knowledge.
import {activeTemporaryCantrips} from './temporary-cantrip.js';
const text=x=>typeof x==='string'&&!!x&&x.trim()===x;
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const dense=x=>Array.isArray(x)&&Object.keys(x).length===x.length&&Object.keys(x).every((k,i)=>k===String(i));
function classesValid(keys){return dense(keys)&&keys.length>0&&keys.every(text)&&new Set(keys).size===keys.length}
export function nativeCantripDefinition(rows,name,classKeys){
 if(!dense(rows)||!text(name)||!classesValid(classKeys))return null;
 const matches=rows.filter(row=>Array.isArray(row)&&row[0]===name);if(matches.length!==1)return null;
 const row=matches[0];
 if(row[1]!==0||!dense(row[3])||!row[3].length||!row[3].every(text)||!row[3].some(key=>classKeys.includes(key)&&!/^(fx:|Mark of |Aberrant Dragonmark)/.test(key)))return null;
 if(![2,4,5,6,7,10,11].every(i=>typeof row[i]==='string')||![0,1].includes(row[8])||![0,1].includes(row[9]))return null;
 return {n:row[0],l:0,sch:row[2],ct:row[4],r:row[5],cmp:row[6],dur:row[7],conc:row[8],rit:row[9],sv:row[10],sum:row[11],classLists:[...row[3]]};
}
// Only explicit known provenance establishes knowledge. Cast availability and display labels do not.
export function definitelyKnownCantrip(name,origins){return text(name)&&dense(origins)&&origins.some(origin=>object(origin)&&origin.spell===name&&origin.kind==='known')}
// classKeys describes native class lists, not the actor's current classes. Activation owns prerequisites.
export function projectTemporaryCantrips(state,rows,classKeys,artificerSourceKey){
 if(artificerSourceKey!=='Artificer'||!classesValid(classKeys))return [];
 const projected=[];
 for(const grant of activeTemporaryCantrips(state)){
  const definition=nativeCantripDefinition(rows,grant.spell,classKeys);if(!definition)continue;
  let spell=projected.find(row=>row.n===grant.spell);
  if(!spell){spell={...definition,sourceKey:artificerSourceKey,ability:'INT',use:'Temporary cantrip',temporaryCantrip:{v:1,grantIds:[],grants:[]},baseKnown:false};projected.push(spell)}
  spell.temporaryCantrip.grantIds.push(grant.id);
  spell.temporaryCantrip.grants.push({id:grant.id,sourceId:grant.sourceId,item:grant.item,startedAt:grant.startedAt,expiresAt:grant.expiresAt});
 }
 return projected;
}
