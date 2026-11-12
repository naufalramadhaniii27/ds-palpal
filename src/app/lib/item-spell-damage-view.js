import {actorCastingScores} from '../../data/lib/casting-sources.js';
import {liveItemSpellDamageFeatures,inspectItemSpellDamage,createItemSpellDamageUsage} from '../../data/lib/item-spell-damage.js';
// Current roll-time sources and original cast-time evidence remain distinct.
export function itemSpellDamageCharisma(character,state){
 const ability=character&&character.abilities&&character.abilities.CHA,override=state&&state.cust&&state.cust['n:ab-CHA'];
 const explicit=override&&override.o!=null&&override.o!==''&&Number.isFinite(+override.o);
 if(!explicit&&(!ability||ability.base==null||ability.base===''||!Number.isFinite(+ability.base)))return undefined;const score=actorCastingScores(character,state).CHA;return Number.isFinite(score)?Math.floor((score-10)/2):undefined;
}
export function itemSpellDamageView(character,state,spell,calculation,snapshot,usage){
 const live=liveItemSpellDamageFeatures(character);if(!live.ok)return live;const liveCharismaModifier=itemSpellDamageCharisma(character,state),parts=[];
 for(let partIndex=0;partIndex<(calculation.parts||[]).length;partIndex++){const info=inspectItemSpellDamage({snapshot,liveFeatures:live.capability,liveCharismaModifier,usage,spellName:spell.n,part:calculation.parts[partIndex]});if(!info.ok||!('usage' in info))return info;parts.push({partIndex,...info})}
 const current=parts.length?parts[0].usage:usage===undefined?createItemSpellDamageUsage():usage;
 return {ok:true,parts,snapshot,liveFeatures:structuredClone(live.capability),liveCharismaModifier,usage:structuredClone(current),spellName:spell.n,event:{id:current.currentEventId},snapshotAbsent:snapshot===undefined,unresolvedCastTime:snapshot===undefined||snapshot.charismaModifier===null&&snapshot.features.length>0,liveFeaturesAbsent:!Object.prototype.hasOwnProperty.call(character,'itemSpellDamageFeatures')};
}
