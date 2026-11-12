import {gemOwnedSpellRow,gemFormulaModifierPolicy} from '../../data/lib/spell-gem-casts.js';
import {discipleHealingBonus} from '../../data/lib/disciple-of-life.js';
// Only original successful release receipts authorize effect resolution; no physical-row dependency.
export function gemHealingCalculation(character,state,definitions,row,facts){
 if(!facts||Object.keys(facts).length!==2||typeof facts.targetCreature!=='boolean'||typeof facts.restoresHitPoints!=='boolean')return {ok:false,reason:'invalid-healing-facts'};
 const owned=gemOwnedSpellRow(state.spellGemCasts,definitions,row,character.rs===undefined?'2024':character.rs);if(!owned.ok)return owned;
 if(owned.cast.spellcasting.kind==='unresolved'){const policy=gemFormulaModifierPolicy(owned.sourceRow);if(!policy.ok||policy.requiresModifier)return {ok:false,reason:'spellcasting-modifier-review-required'};}
 const descriptor=JSON.parse(owned.cast.castContext.disciple)||undefined,event={spellLevel:owned.castLevel,slotLevel:null,usedSpellSlot:false,targetCreature:facts.targetCreature,restoresHitPoints:facts.restoresHitPoints};
 const bonus=descriptor===undefined?{ok:true,applies:false,bonus:0}:discipleHealingBonus(descriptor,event);if(!bonus.ok)return bonus;
 return {ok:true,...owned,calculationRow:{...row,...(bonus.applies?{hb:[{v:bonus.bonus,s:'Disciple of Life'}]}:{})},bonus:bonus.bonus,signature:JSON.stringify({cast:owned.cast,row,supreme:character.supremeHealing,event})};
}
