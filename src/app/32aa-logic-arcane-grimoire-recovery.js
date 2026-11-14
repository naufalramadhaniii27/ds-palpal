/* Arcane Grimoire changes the existing recovery allowance, never its uses. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {D} from './06-logic-derivation.js';
import {captureNativeActorFrame} from './lib/native-actor-frame.js';
import {arcaneGrimoireRecoveryBonus as sourceBonus} from '../data/lib/arcane-grimoire-recovery-source.js';
import {canonicalTceSpellBonus} from '../data/lib/tce-spell-bonus-profiles.js';
const tickets=new WeakMap(),own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key),fail=reason=>({ok:false,reason});
export function arcaneGrimoireRecoveryBonus(resource,level){return sourceBonus(C,resource,level)}
function plain(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)}
function usedCount(key){const value=own(S.used,key)?S.used[key]:0;return Number.isSafeInteger(value)&&value>=0?value:null}
function validatePool(row,selection){
 if(!plain(selection))return fail('invalid-recovery-selection');let total=0;const counts={};
 for(const level of Reflect.ownKeys(selection)){if(typeof level!=='string'||! /^[1-5]$/.test(level)||!Number.isSafeInteger(selection[level])||selection[level]<0)return fail('invalid-recovery-selection');counts[level]=selection[level];total+=Number(level)*selection[level];}
 if(!Number.isSafeInteger(total)||!Number.isSafeInteger(row.cap)||total>row.cap)return fail('recovery-allowance-exceeded');
 if(total){const used=usedCount(row.r?.k);if(used===null||!Number.isSafeInteger(row.r?.max)||row.r.max<1||used>=row.r.max||!Number.isSafeInteger(row.left)||row.left<1)return fail('recovery-use-unavailable');}
 return {ok:true,total,counts};
}
function recoveryPlan(rows,selection,slots){
 if(!Array.isArray(rows)||!plain(selection)||!Array.isArray(slots)||slots.length!==5||slots.some(value=>!Number.isSafeInteger(value)||value<0))return fail('invalid-recovery-selection');
 const totals=[0,0,0,0,0],pools=[];
 for(const index of Reflect.ownKeys(selection)){if(typeof index!=='string'||! /^(0|[1-9][0-9]*)$/.test(index)||!rows[Number(index)])return fail('invalid-recovery-selection');const row=rows[Number(index)],result=validatePool(row,selection[index]);if(!result.ok)return result;for(const level of Object.keys(result.counts))totals[Number(level)-1]+=result.counts[level];if(result.total)pools.push({index:Number(index),key:row.r.k,total:result.total,counts:result.counts});}
 if(new Set(pools.map(pool=>pool.key)).size!==pools.length||totals.some((count,index)=>count>slots[index]))return fail('spent-standard-slots-required');return {ok:true,pools};
}
function snapshot(rows,selection,context){return canonicalTceSpellBonus([rows,selection,context,D.res,D.hpmax,D.mod,C.arcaneGrimoireRecovery])}
export function prepareShortRestRecovery(rows,selection={},context){
 const stamp=snapshot(rows,selection,context);if(FROZEN||typeof stamp!=='string')return fail('rest-context-unavailable');const result=recoveryPlan(rows,selection,context?.slots);if(!result.ok)return result;const ticket={},frame=captureNativeActorFrame();if(!frame())return fail('rest-context-unavailable');tickets.set(ticket,{frame,stamp});return {ok:true,ticket,pools:result.pools};
}
export function currentShortRestRecovery(ticket,rows,selection={},context){const proof=tickets.get(ticket);return !!(proof&&!FROZEN&&proof.frame()&&snapshot(rows,selection,context)===proof.stamp)}
