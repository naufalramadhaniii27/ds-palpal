/* Saved spell channels must be rebuilt together when a legacy Pact rod changes. */
import {nativeSpellBonusSourceClaim} from '../../data/lib/pact-rod-source.js';
export function legacyPactRodInventoryRequiresBuild(character){return nativeSpellBonusSourceClaim(character)}
export const legacyPactRodInventoryGuidance='Open this character’s matching Build and Apply before changing inventory while an original spell-bonus item is recorded. Its held item, attunement and each spellcasting source must be recalculated together.';
