import {ownedStoredSpellRow} from '../../data/lib/stored-spell.js';
import {discipleHealingBonus} from '../../data/lib/disciple-of-life.js';
// Retained original source numbers are separate from the wearer's cast-time and roll-time features.
export function storedSpellHealingCalculation(character,state,row,facts,originalDefinitions){
 if(!facts||Object.keys(facts).length!==2||typeof facts.targetCreature!=='boolean'||typeof facts.restoresHitPoints!=='boolean')return {ok:false,reason:'invalid-healing-facts'};
 const owned=ownedStoredSpellRow(state.storedSpellCasts,row,character.rs===undefined?'2024':character.rs,originalDefinitions);if(!owned.ok)return owned;if(!owned.effectCalculationAvailable)return {ok:false,reason:'original-spell-modifier-review-required'};
 const descriptor=owned.cast.context.discipleOfLife,event={spellLevel:owned.castLevel,slotLevel:null,usedSpellSlot:false,targetCreature:facts.targetCreature,restoresHitPoints:facts.restoresHitPoints};
 const bonus=descriptor===undefined?{ok:true,applies:false,bonus:0}:discipleHealingBonus(descriptor,event);if(!bonus.ok)return bonus;
 return {ok:true,...owned,calculationRow:{...row,...(bonus.applies?{hb:[{v:bonus.bonus,s:'Disciple of Life'}]}:{})},bonus:bonus.bonus,signature:JSON.stringify({cast:owned.cast,row,supreme:character.supremeHealing,event})};
}
