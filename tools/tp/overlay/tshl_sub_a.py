# Own-wording Healer subclasses (Healer 2024).
SUB = {
"Vow of the Augmenter": {"spab": "INT",
 "f": {
  "Augmenter Spells": "At the Healer levels in the Augmenter Spells table, you always have the listed spells prepared. Level 3: Bless, Buff, Enhance Ability, Enlarge/Reduce, Jump. Level 5: Fly, Haste. Level 7: Stoneskin, Unlock Potential. Level 9: Greater Enhance Ability, Jotunn Transformation.",
  "Enhancing Tether": "Whenever you use Life Tether, you can cast Buff on that ally as part of the same Bonus Action.",
  "Dual Augmentation": "When you take the Magic action to cast a spell from your Augmenter Spells, you can also cast a second prepared Augmenter spell as part of that action, using a separate spell slot. Each spell targets a different single ally, and both targets get your Combat Supporter bonus. You can concentrate on both at once. If you must roll to keep Concentration, you roll once and lose both spells on a failure. A Short Rest or Long Rest restores this feature.",
  "Greater Empowerment": "The damage die of your Empowering Tether becomes a d12. Creatures on your Life Tether also score a Critical Hit on a d20 roll one lower than normal.",
  "Master Augmenter": "When you target a creature with Buff, it gets all three enhancements at once instead of one."},
 "lu": [{"feature": "Dual Augmentation", "n": "Dual Augmentation", "lvl": 6, "max": 1, "reset": "short", "tag": "Magic Action"}],
 "acts": {"Enhancing Tether": "bonus", "Dual Augmentation": "action"}},

"Vow of the Martyr": {"spab": "INT",
 "f": {
  "Martyr Spells": "At the Healer levels in the Martyr Spells table, you always have the listed spells prepared. Level 3: Compelled Duel, Shield of Faith, Warding Bond, Zone of Truth. Level 5: Dispel Magic, Life Transference. Level 7: Guardian of Faith, Heroic Sacrifice. Level 9: Circle of Power, Mass Cure Wounds.",
  "Martyr's Endurance": "Your self-sacrifice improves Life Tether. **Endurance.** Your Hit Point maximum rises by 3, and by 1 more each time you gain a Healer level. When you use Life Tether to heal an ally, you gain Temporary Hit Points equal to half the total rolled on the Healer's Dice (round up). **Anguish.** Whenever a creature on your Life Tether takes damage, you can halve it (round down) and take the other half yourself (no action). You cannot reduce the damage you take this way.",
  "Exemplar": "When you take damage in place of another creature with a feature like Anguish or a spell like Warding Bond, your sacrifice can inspire an ally of your choice within 60 feet that can see you (no action). Until the end of its next turn, that ally has Advantage on attack rolls and Wisdom saving throws. You can do this once per turn start, up to a number of times equal to your Intelligence modifier (minimum 1). A Long Rest restores all uses.",
  "Selfless Sacrifice": "You can cast Heroic Sacrifice by spending 4 Healer's Dice instead of a spell slot. If the target is on your Life Tether, you have Advantage on the saving throw it causes. If you succeed, that creature also gains Heroic Inspiration if it lacks it.",
  "True Martyrdom": "This replaces the benefits of Martyr's Endurance. **Endurance.** When you use Life Tether to heal an ally, you gain Temporary Hit Points equal to the full total rolled on the Healer's Dice. **Anguish.** Whenever a creature on your Life Tether takes damage, you can reduce it by any amount you choose at that moment, then you take damage equal to half the amount you reduced (round down, no action)."},
 "lu": [{"feature": "Exemplar", "n": "Exemplar", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Free"}],
 "acts": {"Exemplar": "free"}},

"Vow of the Protector": {"spab": "INT",
 "f": {
  "Protector Spells": "At the Healer levels in the Protector Spells table, you always have the listed spells prepared. Level 3: Aid, Prayer of Healing, Sanctuary, Shield. Level 5: Beacon of Hope, Revivify. Level 7: Death Ward, Otiluke's Resilient Sphere. Level 9: Greater Restoration, Wall of Force.",
  "Tether of Protection": "Whenever you use Life Tether on a creature, it gains a bonus to its saving throws until the start of your next turn. The bonus is 1 plus the number of Healer's Dice you spent.",
  "Shield of the Protector": "**Free Castings.** You can cast Shield without a spell slot, a number of times equal to your Intelligence modifier (minimum 1). A Long Rest restores all uses. **Protective Shield.** When an attack hits a creature on your Life Tether, you can use your Reaction to cast Shield so that the target gets its benefits instead of you.",
  "Vigilant Protector": "When an ally within 60 feet is hit by an attack or makes a saving throw, you can use your Reaction to attach Life Tether to it. You can use Shield of the Protector or Life Tether as part of this Reaction.",
  "Warding Essence": "After a Short Rest or Long Rest, you can pick two damage types, two conditions, or one of each from the lists below. You and creatures on your Life Tether have Resistance to the chosen damage types and Advantage on saving throws to avoid or end the chosen conditions, until you use this feature again. **Damage types.** Acid, Cold, Fire, Lightning, Poison, Thunder. **Conditions.** Blinded, Deafened, Charmed, Frightened, Poisoned, Prone, Restrained.",
  "Bountiful Healing": "When you use the Extra Healing benefit of Master Healer, you can swap one or more of the Healer's Dice for a d6 each instead of spending them.",
  "Improved Life Tether": "**Total Protection.** When you use the Healer's Protection Reaction of Life Tether, the ally can automatically succeed on the save. If you are making a save against the same effect, you can gain this benefit too. A Short Rest or Long Rest restores this use. **Expansive Ward.** Warding Essence now lets you pick any damage type or condition."},
 "lu": [{"feature": "Shield of the Protector", "n": "Free Shield", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Reaction"},
        {"feature": "Improved Life Tether", "n": "Total Protection", "lvl": 18, "max": 1, "reset": "short", "tag": "Free"}],
 "acts": {"Shield of the Protector": "reaction", "Vigilant Protector": "reaction"}},

"Vow of the Siphon": {"spab": "INT",
 "f": {
  "Siphon Spells": "At the Healer levels in the Siphon Spells table, you always have the listed spells prepared. Level 3: Bane, Blindness/Deafness, Hold Person, Inflict Wounds. Level 5: Counterspell, Vampiric Touch. Level 7: Blight, Confusion. Level 9: Contagion, Hold Monster. Wizard spells of the Necromancy school also join your Healer spell list.",
  "Harmful Tether": "You can attach Life Tether to foes as well as allies. **Leeching Tether.** When you use Life Tether, you can deal Necrotic damage equal to the healing roll to the target instead of healing it. **Sap Strength.** Whenever the tethered target deals damage to another creature, you can use your Reaction to reduce that damage by your Intelligence modifier (minimum 1). From Healer level 10, this costs no Reaction.",
  "Life Leech": "When you use Harmful Tether, you or one creature of your choice within 15 feet of the target regains Hit Points equal to half the damage the target took (round up).",
  "Improved Sap Strength": "When you use Harmful Tether, you can use your Reaction to add half your Healer level (round up) to the damage reduced.",
  "Sap Defenses": "As a Magic action, you try to strip the defenses of one creature on your Life Tether. Pick a damage type. The target makes a Constitution save against your spell save DC. On a failure, it has Vulnerability to that type until the start of your next turn. This Vulnerability overrides Resistance, but a target with Immunity automatically succeeds. Once a creature fails the save, you cannot use this feature again until you finish a Long Rest.",
  "Leech Conduit": "You always have Life Siphon prepared. While you concentrate on Life Siphon, a creature on your Life Tether automatically fails its saves against the spell and takes an extra 1d12 damage."},
 "lu": [{"feature": "Sap Defenses", "n": "Sap Defenses", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic Action"}],
 "acts": {"Sap Defenses": "action", "Sap Strength": "reaction"}},
}
