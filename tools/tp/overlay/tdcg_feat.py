# Own-wording feats of the TalDorei Campaign Guide. Shapes follow tdcsr_feat.py.
ALSO = ["Fate-Touched"]
FEATS = {
 "Dual-focused": {"d": "Concentrate on two spells at once. Check concentration for each on damage, and make a Constitution save at the end of each turn you hold two.", "pre": "Spellcasting",
   "full": "If you cast a spell that needs concentration while already concentrating on one, you keep both. When you take damage, make a concentration check for each spell separately. At the end of each of your turns on which you hold two, make a Constitution save with DC 8 plus the combined levels of both spells. On a success you keep both. On a failure you lose both.",
   "fx": {"notes": [["Note", "Dual-focused: two concentration spells. End of turn: Con save, DC 8 + both spell levels"]]}},
 "Gambler": {"d": "Gaming-set proficiency (two), better bluffing and recruiting at games of chance, a card-shark reputation, and a Carousing reroll.", "asi": ["CHA"],
   "pick": [{"k": "tl", "t": "tool", "n": 2, "cats": ["game"], "title": "2 Gaming Sets"}],
   "full": "Raise Charisma by 1, to a maximum of 20. You gain proficiency with two gaming sets of your choice. You have an adjusted roll on Charisma (Deception) checks to bluff at games of chance and on Charisma (Persuasion) checks to bring others into a game (the source text is garbled, intended as Advantage). You have a reputation as a card shark: some avoid you, high-stakes gamblers may seek you out. When you take the Carousing downtime action you can reroll the result once, and you keep the second roll."},
 "Mending Affinity": {"d": "When stabilized with a healer's kit, and on all spell, potion or class healing, regain extra HP equal to your Proficiency Bonus.", "asi": ["CON"],
   "full": "Raise Constitution by 1, to a maximum of 20. When a creature uses a healer's kit to stabilize you while you are dying, you also regain hit points equal to your Proficiency Bonus. Whenever you regain hit points from a spell, potion or class feature, you regain extra hit points equal to your Proficiency Bonus.",
   "fx": {"notes": [["Note", "Mending Affinity: healing you receive adds your Proficiency Bonus"]]}},
 "Rapid Drinker": {"d": "Drink a potion as a Bonus Action. Adjusted roll on saves from alcohol and dangerous substances.",
   "full": "You can drink a potion as a Bonus Action instead of an action. You have an adjusted roll on saving throws caused by drinking alcohol or a dangerous substance (the source text is garbled, intended as Advantage).",
   "act": "bonus"},
 "Fate-Touched": {"d": "DM-granted. You gain 1 Luck point that works as the Lucky feat and returns on a Long Rest.",
   "full": "This is a background feature that stacks on top of your normal background. It is normally given by the DM to a character or NPC who has a place in the story's fate. You gain 1 Luck point, used the same way as the Lucky feat. You regain it when you finish a Long Rest. If you already have the Lucky feat, add this point to its total.",
   "lu": {"n": "Luck point (Fate-Touched)", "max": 1, "reset": "long", "tag": "As the Lucky feat"}},
}
