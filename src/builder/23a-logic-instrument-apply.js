import {toast} from "./01-logic-core-helpers.js";
import {instrumentSpellsApplyPlan,instrumentSpellsApplyCurrent} from "./10v-logic-instrument-spells.js";
export function prepareInstrumentSpellsApply(candidate){
 const plan=instrumentSpellsApplyPlan(candidate);if(plan.ok&&instrumentSpellsApplyCurrent(plan))return true;
 toast("Review this character's instrument spell histories and physical sources before applying the build.");return false;
}
