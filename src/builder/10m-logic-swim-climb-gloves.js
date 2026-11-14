import {B} from './04-logic-storage.js';
import {genv,sheetState} from './00-env.js';
import {DM14S} from './09c-logic-edition-overlays.js';
import {attunementState,itemInUse} from './03-logic-magic-item-effects.js';
import {swimClimbGlovesProblems,swimClimbGlovesNativeProfile,canonicalSwimClimbGlovesDefinition} from '../data/lib/swim-climb-gloves.js';
export {canonicalSwimClimbGlovesDefinition};
const ITEM='Gloves of Swimming and Climbing',own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),typed=['storedSpells','spellGem','tattoo','slotRecovery','studyBook','bagTricks','hornValhalla','defender','birdToken','magicRopes','timedDefenses','iounOrbit'];
export function swimClimbGlovesNativeSource(rows){return swimClimbGlovesNativeProfile(rows)}
export function swimClimbGlovesCatalog(){return swimClimbGlovesNativeSource(DM14S||DMGI)}
function futureOwnedCapability(){const live=sheetState();return live?.C&&B.cid&&B.cid===genv.__sheetId?.()&&own(live.C,'swimClimbGloves')&&swimClimbGlovesProblems(live.C.swimClimbGloves).length?{value:live.C.swimClimbGloves}:null}
export function swimClimbGlovesOwnFuture(){return !!futureOwnedCapability()}
export function swimClimbGlovesProjection(ATT=attunementState()){const future=futureOwnedCapability();if(future)return structuredClone(future.value);const source=swimClimbGlovesCatalog();if(!source||(B.custLib||[]).some(row=>row.n===ITEM))return undefined;const sourceIndices=[];(B.inv||[]).forEach((row,index)=>{const name=own(row,'key')?row.key:row.n,status=ATT?.rows?.[index];if(name===ITEM&&!typed.some(field=>own(row,field))&&status?.requires===true&&status.attuned===true&&itemInUse(row,status))sourceIndices.push(index)});return sourceIndices.length?{v:1,...source,sourceIndices}:undefined}
