/* Source-qualified existing spell-item reduction. No second bonus or ledger. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,fxo,gx} from './00-env.js';
import {itemInUse} from '../data/lib/attunement.js';
import {tceSpellBonusNative,tceSpellBonusCustom} from '../data/lib/tce-spell-bonus-source.js';
import {tceSpellBonusProfile} from '../data/lib/tce-spell-bonus-profiles.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
let legacyComparison=false;
export function withLegacyTceSpellBonusComparison(run){const previous=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=previous;}}
function sourceFrame(item,index,ATT){
 const B=lateGet('B');return {item,row:B.inv[index],attunement:ATT.rows[index],originalBookRows:genv.WXI?.tce,originalCatalogRows:lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]),resolvedRow:lateGet('DMAP')?.[item],customItems:B.custLib||[],fxOverrides:fxo()||{},gxItems:gx().item||{}};
}
export function tceSpellItemBonus(entry,kind,spellClass,originClass=undefined){
 const item=entry?.mi||entry?.n;if(!tceSpellBonusProfile(item))return null;
 const B=lateGet('B'),ATT=lateGet('attunementState')(),inventory=B.inv||[];
 const customFrame={item,customItems:B.custLib||[],fxOverrides:fxo()||{}};if(tceSpellBonusCustom(customFrame,kind))return null;
 const index=inventory.findIndex((row,i)=>row.n===entry.n&&key(row)===item&&itemInUse(row,ATT.rows[i]));if(index<0)return 0;
 const result=tceSpellBonusNative(sourceFrame(item,index,ATT),kind,originClass===undefined?spellClass:originClass,{legacyUnscoped:legacyComparison});return result.certified?result.bonus:0;
}
export function tceSpellItemSourcesSafe(){
 const B=lateGet('B'),ATT=lateGet('attunementState')();return (B.inv||[]).every((row,index)=>!tceSpellBonusProfile(key(row))||!itemInUse(row,ATT.rows[index])||tceSpellBonusNative(sourceFrame(key(row),index,ATT),'dc','Bard').certified===true);
}
