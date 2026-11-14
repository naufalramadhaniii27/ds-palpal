/* Existing native spell-item reduction only; no additional sheet bonus or owner. */
import {lateGet} from './01b-logic-late-ports.js';
import {genv,fxo,gx} from './00-env.js';
import {itemInUse} from '../data/lib/attunement.js';
import {legacyPactRodNativeBonus} from '../data/lib/pact-rod-source.js';
import {LEGACY_PACT_ROD_ROWS} from '../data/lib/pact-rod-profiles.js';
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
const key=row=>own(row,'key')?row.key:row?.n;
let legacyComparison=false;
export function withLegacyPactRodComparison(run){const previous=legacyComparison;legacyComparison=true;try{return run();}finally{legacyComparison=previous;}}
function explicitCustomBonus(item,build,overrides,kind){
 const custom=(build.custLib||[]).find(row=>(Array.isArray(row)?row[0]:row?.n)===item);
 const override=own(overrides,item)?overrides[item]:null;
 const fx=custom?(Array.isArray(custom)?custom[5]?.fx:custom.fx):override?.fx;
 const field=kind==='atk'?'spellAtk':'spellDc';
 return fx&&own(fx,field)&&typeof fx[field]==='number'&&Number.isFinite(fx[field]);
}
export function legacyPactRodBonus(entry,kind,spellClass){
 const item=entry?.mi||entry?.n;
 if(!own(LEGACY_PACT_ROD_ROWS,item))return null;
 const build=lateGet('B'),overrides=fxo()||{};
 if(explicitCustomBonus(item,build,overrides,kind))return null;
 const inventory=build.inv||[],ATT=lateGet('attunementState')();
 const index=inventory.findIndex((row,i)=>row.n===entry.n&&itemInUse(row,ATT.rows[i]));
 if(index<0)return 0;
 const result=originalPactRodBonus(build,index,ATT,kind,spellClass);
 if(!result?.certified)return 0;
 return legacyComparison&&kind==='dc'?LEGACY_PACT_ROD_ROWS[item][5].fx.spellDc:result.bonus;
}
function originalPactRodBonus(build,index,ATT,kind,spellClass){
 const item=key(build.inv[index]),catalog=lateGet('DM14S')||(typeof DMGI!=='undefined'?DMGI:[]);
 if(!Array.isArray(catalog)||catalog.filter(row=>Array.isArray(row)&&row[0]===item).length!==1)return null;
 return legacyPactRodNativeBonus({legacyBookRows:genv.WXI?.dmg14,resolvedRow:lateGet('DMAP')?.[item],inventoryRow:build.inv[index],allocatedStatus:ATT.rows[index],customItems:build.custLib||[],fxOverrides:fxo()||{},gxItems:gx().item||{},slotRecoverySources:build.slotRecoverySources},kind,spellClass);
}
export function legacyPactRodSourcesSafe(){
 const build=lateGet('B'),ATT=lateGet('attunementState')();
 return (build.inv||[]).every((row,index)=>!own(LEGACY_PACT_ROD_ROWS,key(row))||!itemInUse(row,ATT.rows[index])||originalPactRodBonus(build,index,ATT,'dc','Warlock')?.certified===true);
}
