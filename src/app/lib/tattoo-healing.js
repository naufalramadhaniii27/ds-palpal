import {tattooDefinitionStamp} from '../../data/lib/spellwrought-tattoo.js';
import {tattooOwnedSpellRow} from '../../data/lib/tattoo-projection.js';
import {discipleHealingBonus} from '../../data/lib/disciple-of-life.js';
// Validate raw source FIRST. A calculation-only clone never substitutes for ownership or cast permission.
export function tattooHealingCalculation(character,state,definitions,row,facts,mode='receipt'){
 if(!facts||Object.keys(facts).length!==2||typeof facts.targetCreature!=='boolean'||typeof facts.restoresHitPoints!=='boolean')return {ok:false,reason:'invalid-healing-facts'};
 const owned=tattooOwnedSpellRow(state.spellwroughtTattoos,definitions,row,mode);if(!owned.ok)return owned;
 const receipt=['active','ended'].includes(owned.grant.phase),context=owned.grant.castContext;if(receipt&&(!context||context.v!==2))return {ok:false,reason:'cast-context-unrecorded'};
 const casterLevel=receipt?context.casterLevel:character.level;
 const edition=character.rs===undefined?'2024':character.rs;if(receipt&&(context.ruleset!==edition||context.nativeDefinition!==tattooDefinitionStamp(row)))return {ok:false,reason:'cast-definition-changed'};
 const event={spellLevel:owned.castLevel,slotLevel:null,usedSpellSlot:false,targetCreature:facts.targetCreature,restoresHitPoints:facts.restoresHitPoints},descriptor=receipt?(JSON.parse(context.disciple)||undefined):character.discipleOfLife;
 if(!receipt&&descriptor!==undefined){const source=descriptor&&descriptor.source,edition=character.rs===undefined?'2024':character.rs;if(!['2014','2024'].includes(edition)||!source||source.edition!==edition||!Number.isSafeInteger(character.level)||character.level<source.level||(source.pre===''&&character.cls!=='Cleric'))return {ok:false,reason:'disciple-source-unavailable'};}
 const bonus=descriptor===undefined?{ok:true,applies:false,bonus:0}:discipleHealingBonus(descriptor,event);if(!bonus.ok)return bonus;
 return {ok:true,sourceRow:row,calculationRow:{...row,...(bonus.applies?{hb:[{v:bonus.bonus,s:'Disciple of Life'}]}:{})},castLevel:owned.castLevel,casterLevel,bonus:bonus.bonus,signature:JSON.stringify({body:state.spellwroughtTattoos,row,disciple:descriptor,supreme:character.supremeHealing,event})};
}
