import {B} from './04-logic-storage.js';
import {genv,sheetState} from './00-env.js';
import {DM14S} from './09c-logic-edition-overlays.js';
import {hornValhallaProblems} from '../data/lib/horn-valhalla.js';
import {hornValhallaNativeSources,hornValhallaMarkerSource,reconcileHornValhallaInventory} from '../data/lib/horn-valhalla-source.js';
let scope=null;
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row.n;
export function hornValhallaCatalog(){return hornValhallaNativeSources(DM14S||DMGI,genv.WXI?.dmg14||[])}
export function withHornValhallaProjection(state,run){const previous=scope;scope={state};try{return run()}finally{scope=previous}}
export function hornValhallaOwnedState(){if(scope)return scope.state;const live=sheetState();if(!live?.C||live.C.name!==B.name||!B.cid||B.cid!==genv.__sheetId?.())return undefined;if(own(live.C,'hornValhalla')&&hornValhallaProblems(live.C.hornValhalla).length)return live.C.hornValhalla;const state=live.state&&own(live.state,'hornValhalla')?live.state.hornValhalla:undefined;if(state===undefined||hornValhallaProblems(state).length)return state;return reconcileHornValhallaInventory(live.C.inv||[],B.inv||[],state).authority||state}
export function hornValhallaProjectionMirror(){const state=hornValhallaOwnedState();return state===undefined?undefined:structuredClone(state)}
export function hornValhallaAllocatedKeys(){const state=hornValhallaOwnedState(),live=sheetState(),owned=live?.C?.name===B.name&&B.cid===genv.__sheetId?.()?live.state?.hornValhalla:undefined;return [...new Set([state,owned].flatMap(value=>hornValhallaProblems(value).length?[]:value.physical.map(physical=>physical.key)))]}
export function hornValhallaResource(row,index){if(!own(row,'hornValhalla')){const qualified=hornValhallaCatalog().some(source=>source.item===key(row))&&!(B.custLib||[]).some(value=>value.n===key(row))&&!['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks'].some(field=>own(row,field));return qualified?{managed:true,active:true,untracked:true}:null;}const state=hornValhallaOwnedState();if(hornValhallaProblems(state).length)return {managed:true,active:false};const source=hornValhallaMarkerSource(row.hornValhalla,hornValhallaCatalog(),key(row)),physical=state.physical.find(value=>value.id===row.hornValhalla?.id),unique=(B.inv||[]).filter(value=>value.hornValhalla?.id===physical?.id).length===1;const active=!!(!['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks'].some(field=>own(row,field))&&source&&physical&&source.profile===physical.profile&&(!source.metal||source.metal===physical.metal)&&physical.present&&unique&&(row.q==null?1:row.q)===1);return {managed:true,active,physical,source,index}}
export {reconcileHornValhallaInventory};
