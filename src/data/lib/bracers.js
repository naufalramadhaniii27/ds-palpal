/* Passive source conditions only. Inventory is carried, including unequipped rows.
   Shield identity must come from the host's native armor/base/form metadata. */
import {itemQuantity} from './attunement.js';
import {BRACERS_PROFILES} from './bracers-profiles.js';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const failure=reason=>({ok:false,reason});
export function carriedShieldState(inventory,classifyShield){
 if(!Array.isArray(inventory)||typeof classifyShield!=='function')return failure('inventory-classification-unavailable');
 if(Reflect.ownKeys(inventory).length!==inventory.length+1)return failure('unsupported-inventory');
 let shieldIndex=null;
 for(let i=0;i<inventory.length;i++){
  if(!own(inventory,i)||!record(inventory[i]))return failure('unsupported-inventory-row');
  const quantity=itemQuantity(inventory[i]);
  if(!Number.isFinite(quantity))return failure('unsupported-inventory-quantity');
  if(quantity<=0)continue;
  let shield;
  try{shield=classifyShield(inventory[i],i);}catch{return failure('shield-classification-unavailable');}
  if(typeof shield!=='boolean')return failure('shield-classification-unavailable');
  if(shield&&shieldIndex===null)shieldIndex=i;
 }
 return {ok:true,carried:shieldIndex!==null,shieldIndex};
}
export function bracersDefenseEligibility(facts,inventory,classifyShield){
 if(!record(facts)||Reflect.ownKeys(facts).length!==3)return failure('source-conditions-unavailable');
 if(!['sourceWorn','sourceAttuned','armorWorn'].every(k=>own(facts,k)&&typeof facts[k]==='boolean'))return failure('source-conditions-unavailable');
 if(!facts.sourceWorn)return {ok:true,eligible:false,reason:'not-worn'};
 if(!facts.sourceAttuned)return {ok:true,eligible:false,reason:'not-attuned'};
 if(facts.armorWorn)return {ok:true,eligible:false,reason:'armor-worn'};
 const shields=carriedShieldState(inventory,classifyShield);
 if(!shields.ok)return shields;
 return {ok:true,eligible:!shields.carried,reason:shields.carried?'shield-carried':null};
}

export function bracersNativeProfile(rows,item){
 if(!Array.isArray(rows)||typeof item!=='string'||!own(BRACERS_PROFILES,item))return null;
 const matching=rows.filter(row=>Array.isArray(row)&&row[0]===item);
 const profile=BRACERS_PROFILES[item];
 if(matching.length!==1)return null;
 const row=matching[0];
 if(Reflect.ownKeys(row).length!==row.length+1||!row.every((_,i)=>own(row,i)))return null;
 try{if(JSON.stringify(matching[0])!==profile.fingerprint)return null;}catch{return null;}
 return {item,kind:profile.kind,fingerprint:profile.fingerprint,attunementRequired:true};
}
export const bracersDefenseCondition=bracersDefenseEligibility;
