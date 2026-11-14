import {B} from './04-logic-storage.js';
import {genv,sheetState} from './00-env.js';
import {DM14S} from './09c-logic-edition-overlays.js';
import {bagTricksProblems} from '../data/lib/bag-tricks.js';
import {bagTricksNativeSources,bagTricksMarkerSource,reconcileBagTricksInventory} from '../data/lib/bag-tricks-source.js';
let scope=null;
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row.n;
export function bagTricksCatalog(){return bagTricksNativeSources(DM14S||DMGI,genv.WXI?.dmg14||[])}
export function withBagTricksProjection(state,run){const previous=scope;scope={state};try{return run()}finally{scope=previous}}
export function bagTricksOwnedState(){if(scope)return scope.state;const live=sheetState();if(!live?.C||live.C.name!==B.name||!B.cid||B.cid!==genv.__sheetId?.())return undefined;if(own(live.C,'bagTricks')&&bagTricksProblems(live.C.bagTricks).length)return live.C.bagTricks;const state=live.state&&own(live.state,'bagTricks')?live.state.bagTricks:undefined;if(state===undefined||bagTricksProblems(state).length)return state;return reconcileBagTricksInventory(live.C.inv||[],B.inv||[],state).authority||state}
export function bagTricksProjectionMirror(){const state=bagTricksOwnedState();return state===undefined?undefined:structuredClone(state)}
export function bagTricksAllocatedKeys(){const state=bagTricksOwnedState();return bagTricksProblems(state).length?[]:state.physical.map(value=>value.key)}
export function bagTricksResource(row,index){if(!own(row,'bagTricks')){const qualified=bagTricksCatalog().some(source=>source.item===key(row))&&!(B.custLib||[]).some(value=>value.n===key(row))&&!['storedSpells','spellGem','tattoo','slotRecovery','studyBook'].some(field=>own(row,field));return qualified?{managed:true,active:true,untracked:true}:null;}const state=bagTricksOwnedState();if(bagTricksProblems(state).length)return {managed:true,active:false};const source=bagTricksMarkerSource(row.bagTricks,bagTricksCatalog(),key(row)),physical=state.physical.find(value=>value.id===row.bagTricks?.id),unique=(B.inv||[]).filter(value=>value.bagTricks?.id===physical?.id).length===1;const active=!!(!['storedSpells','spellGem','tattoo','slotRecovery','studyBook'].some(field=>own(row,field))&&source&&physical&&source.profile===physical.profile&&(!source.color||source.color===physical.color)&&physical.present&&unique&&(row.q==null?1:row.q)===1);return {managed:true,active,physical,source,index}}
export {reconcileBagTricksInventory};
