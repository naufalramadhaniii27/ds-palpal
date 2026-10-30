# Own-wording feats of Tal'Dorei Campaign Setting Reborn. Record shape follows src/data/wotc07-feats-2014.js (cat G = general feat).
# lu max: int | "pb" | "mod:CON". reset: short | long. acts: kind of action the feat gives.
FEATS = {
 "Cruel": {"d": "Cruelty dice equal to your Proficiency Bonus (d6): extra damage, temporary HP on a crit, or a bonus to Intimidation.",
   "full": "You gain cruelty dice, a number equal to your Proficiency Bonus, and they are d6s. You can spend only one per turn.\n**Extra damage.** When you damage a creature, spend one to add its roll to the damage.\n**Crit rewards.** When you score a critical hit, spend one to gain temporary HP equal to the roll.\n**Intimidation.** When you make a Charisma (Intimidation) check, spend one and add the roll.\nYou regain all spent dice on a rest.",
   "lu": {"n": "Cruelty dice (d6)", "max": "pb", "reset": "long", "tag": "One per turn"}},
 "Flash Recall": {"d": "Bonus Action: swap a prepared spell for another spell you could prepare, of a level you have slots for. Once per rest.", "pre": "Spellcasting",
   "full": "You must be a spellcaster who prepares spells. As a Bonus Action, prepare a spell of level 1 or higher from your spellbook (Wizard) or your class list (other classes). It must be a level you have slots for, and it replaces a prepared spell of the same or higher level. Rest to use it again.",
   "lu": {"n": "Flash Recall", "max": 1, "reset": "short", "tag": "Bonus Action"}, "act": "bonus"},
 "Mystic Conflux": {"d": "Attune to up to four magic items. Cast Identify once per rest without a slot or components.",
   "full": "You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. Rest to cast it again this way.",
   "fx": {"notes": [["Note", "Mystic Conflux: attune to up to four magic items"]]},
   "lu": {"n": "Identify (Mystic Conflux)", "max": 1, "reset": "short", "tag": "No slot or components"}},
 "Remarkable Recovery": {"d": "Gain HP equal to your Constitution modifier when stabilized, and add it to all healing you receive.", "asi": ["CON"],
   "full": "Increase your Constitution by 1, to a maximum of 20. When you are stabilized while dying, you regain HP equal to your Constitution modifier (minimum 1). Whenever a spell, potion or class feature heals you (not this feat), you regain extra HP equal to your Constitution modifier (minimum 1).",
   "fx": {"notes": [["Note", "Remarkable Recovery: healing you receive adds your Constitution modifier (min 1)"]]}},
 "Spelldriver": {"d": "Cast a spell as a Bonus Action and another spell with your action, but only one of the two may be level 3 or higher.", "pre": "Level 11+, Spellcasting",
   "full": "When you cast a spell of level 1 or higher as a Bonus Action, you can also use your action to cast another spell of level 1 or higher. If you cast two or more spells in one turn, only one of them can be level 3 or higher."},
 "Thrown Arms Master": {"d": "Melee weapons gain the Thrown property, thrown ranges grow, and light thrown weapons return after a miss.", "asi": ["STR", "DEX"],
   "full": "Increase Strength or Dexterity by 1, to a maximum of 20. Simple and martial melee weapons without Thrown gain it for you: one-handed ones have range 20/60 ft, two-handed ones 15/30 ft. Weapons that already have Thrown get +20 ft normal and +40 ft long range. When you miss with a light thrown weapon, it returns to your hand at the end of your turn, and you can catch and stow as many as you threw."},
 "Vital Sacrifice": {"d": "Bonus Action: take 1d6 Necrotic damage for a blood boon (1 hour) that adds 1d6 to an attack, 2d6 Necrotic to a hit, or a d4 penalty to a save.",
   "full": "As a Bonus Action, take 1d6 Necrotic damage (cannot be reduced) to gain a blood boon that lasts 1 hour or until spent. Spend it for one effect: add 1d6 to an attack roll, deal an extra 2d6 Necrotic damage on a hit with an attack or spell, or roll a d4 and subtract it from the save of a creature you force to make a Strength, Dexterity or Constitution save.",
   "act": "bonus"},
}
