# Own-wording Warlock patrons of Valda's Spire of Secrets, 2014 rules. Expanded spell lists and tables come from the source.
SUB = {
"The Dead Mists": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Drink The Mists": "As a bonus action, lose 1d8 hit points per level of your Pact Magic slots. At the start of your next turn you regain one expended Pact Magic slot. If this drops you to 0 hit points you fall unconscious, even with temporary hit points. You cannot regain hit points from any spell you cast.",
  "Feed The Soul": "As an action, spend one available Pact Magic slot to regain 1d8 hit points per level of the slot. The healing cannot be increased or maximized.",
  "Fog Form": "As an action, you can cast gaseous form on yourself only, with no spell slot or components.",
  "Master of The Mists": "Once on each of your turns, when you deal Necrotic damage to a hostile creature with a warlock spell, you regain hit points equal to 1d8 + your Charisma modifier, up to the damage dealt."},
 "acts": {"Drink The Mists": "bonus", "Feed The Soul": "action", "Fog Form": "action"}},

"The Future You": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Future You Quirks": "After talking with your future self, strange effects linger. You gain one trait from the Quirks table of the book.",
  "It Happened Like This": "After a Short or Long Rest, the GM secretly rolls a d20 and a d4 and notes the d20 result. The GM tells you the number, unless the d4 was a 4, in which case you get a random false number from 1 to 20. You can replace one attack roll, ability check or saving throw with that value, declared before the roll, once. If the number was false, the GM tells you afterward.",
  "I Could Do With Fewer Scars": "When a creature you see attacks you, use your reaction to gain +10 AC against that attack. Short or Long Rest to use again.",
  "Expect An Ambush": "You cannot be surprised while conscious, and you have Advantage on initiative rolls.",
  "Grandfather Paradox": "As an action, goad a creature that hears you into a paradox. It makes an Intelligence save against your warlock spell save DC. On a failure it is Stunned for up to 1 minute, and repeats the save at the end of each of its turns. Long Rest to use again."},
 "acts": {"I Could Do With Fewer Scars": "reaction", "Grandfather Paradox": "action"},
 "lu": [{"feature": "I Could Do With Fewer Scars", "lvl": 6, "max": 1, "reset": "short", "tag": "Reaction: +10 AC against one attack"},
        {"feature": "Grandfather Paradox", "lvl": 14, "max": 1, "reset": "long", "tag": "Stun a creature that hears you"}],
 "fx": [[10, "Expect An Ambush", {"notes": [["Note", "Expect An Ambush: cannot be surprised while conscious. Advantage on initiative"]]}]]},

"The GM": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Player Character": "You have Advantage on Charisma (Persuasion) and Charisma (Deception) checks to interact with friendly humanoids. This works only when doing so advances the plot in a way the GM finds fitting.",
  "Fudge The Roll": "When you make an attack roll, ability check or saving throw, you can nudge the d20 to one of the three sides next to the top face, or reroll it. You must use the new result. Short or Long Rest to use again. You can push your luck and use it more often between rests, but the GM may impose unpredictable negative side effects.",
  "Plot Armor": "When you finish a Short or Long Rest, you and each ally who rested with you gain temporary hit points equal to your warlock level + your Charisma modifier.",
  "OP Class Feature": "As a bonus action, break the balance of the game for 1 minute. You have Advantage on all attack rolls, ability checks and saving throws, and you roll three d20s and take the highest instead of two. Long Rest to use again."},
 "acts": {"OP Class Feature": "bonus"},
 "lu": [{"feature": "Fudge The Roll", "lvl": 6, "max": 1, "reset": "short", "tag": "Nudge or reroll a d20"},
        {"feature": "OP Class Feature", "lvl": 14, "max": 1, "reset": "long", "tag": "1 minute, Advantage on all rolls, roll three d20s"}]},

"The Legacy": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Relic Force": "Choose one damage type: Acid, Cold, Fire, Lightning, Necrotic or Radiant. While transformed, when you deal damage with a warlock spell, warlock ability or Pact Weapon, you can deal the chosen type instead.",
  "Relic of Transformation": "You hold a relic tied to your patron. As a bonus action you transform, or reverse it. While transformed: your AC equals 10 + your Dexterity modifier + your Charisma modifier. Unless a creature has truesight or watches you change, it cannot recognize you. You have a pool of d6 battle dice. Using one expends it. You regain all on a Short or Long Rest or when you roll initiative. The Battle Dice table gives the die size and number by level. Once on each of your turns when you hit with an attack, you can roll a battle die and add it to the damage.",
  "Resolute Legacy": "While transformed, as an action, emanate an aura of courage for 1 minute. You and friendly creatures within 30 ft have Advantage on death saving throws and saves against being Frightened. During it you can spend a battle die as a bonus action to heal a willing creature in the aura for the die roll + your Charisma modifier. Short or Long Rest to use again.",
  "Aura of Legend": "While transformed, you and friendly creatures within 30 ft have Resistance to your Relic Force damage type.",
  "Final Legacy": "While transformed, use your action to start charging your allies' power. Until the start of your next turn, each friendly creature within 10 ft can use its action to aid the charge. At the start of your next turn, you fire a beam of force in a line 120 ft long and 5 ft wide. Each creature in it makes a Dexterity save against your spell save DC, taking 10d10 Force damage on a failure or half on a success. The damage rises by 4d10 for each creature that aided, up to 30d10. Long Rest to use again."},
 "acts": {"Relic of Transformation": "bonus", "Resolute Legacy": "action", "Final Legacy": "action"},
 "lu": [{"feature": "Resolute Legacy", "lvl": 6, "max": 1, "reset": "short", "tag": "1 minute courage aura, heal with battle dice"},
        {"feature": "Final Legacy", "lvl": 14, "max": 1, "reset": "long", "tag": "Charged beam 10d10 to 30d10 Force"}],
 "acb": {"l": 1, "v": 10, "s": "Relic of Transformation", "abs": ["DEX", "CHA"]}},

"The Magician": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Abracadabra": "You gain proficiency in Sleight of Hand and learn the card trick and prestidigitation cantrips, which do not count against cantrips known. You can try to cast any wizard cantrip you do not know with a successful DC 10 Charisma check. While cast, it counts as a warlock spell. On a failure the spell fails.",
  "Impressive Escape": "You can use your Charisma modifier instead of the normal modifier for Dexterity (Sleight of Hand) checks, and add your Charisma modifier to skill checks for picking locks, slipping ropes or manacles and similar escape feats. As a bonus action you can vanish in smoke, confetti or doves and teleport to an unoccupied spot within 120 ft. You can choose only a spot where no conscious creature can see you appear. Short or Long Rest to use again.",
  "Alakazam": "When you cast a warlock spell of 1st level or higher with a warlock slot, you can manipulate it. Conceal: cast it with no components by succeeding on a Dexterity (Sleight of Hand) check, DC 8 + the spell's level. On a failure it fails. It does not work on spells with costly material components. Transmute: try to cast another wizard spell of the same level or lower instead. You must succeed on a Charisma check with DC 12 + the spell's level, or the spell fails.",
  "Master of Illusions": "You can cast silent image and major image at will with no slot or components. You can concentrate on one of them in addition to another spell."},
 "acts": {"Impressive Escape": "bonus"},
 "lu": [{"feature": "Impressive Escape", "lvl": 6, "max": 1, "reset": "short", "tag": "Bonus action: teleport 120 ft out of sight"}],
 "fx": [[1, "Abracadabra", {"skills": ["Sleight of Hand"]}]]},

"The Symbiont": {"spab": "",
 "f": {
  "Expanded Spell List": "When you learn a warlock spell, you can choose from extra spells added to your warlock list by this patron. See the Expanded Spell List table of the book.",
  "Symbiotic Transformation": "As a bonus action, draw out your Symbiont and coat your body in a living slime shell, or reverse it. While transformed you cannot cast spells, but transforming does not break concentration or stop actions that belong to a spell already cast. The Flesh: your AC equals 10 + your Dexterity modifier + your Charisma modifier. The Claws: you have natural claws, proficient, using Charisma instead of Strength for attack and damage. They deal 1d8 Slashing and count as magical. If you later gain Pact of the Blade, they count as pact weapons. Extra Attack: from level 5 you attack twice with your claws when you take the Attack action.",
  "Traumatic Rend": "When you hit a creature with your claws twice on your turn, you can make one more claw attack against it. On a hit, it has Disadvantage on attack rolls against you until the start of your next turn. Short or Long Rest to use again.",
  "Lifedrain": "While you are conscious, when you deal damage to a hostile creature with your claws, you regain 1d4 hit points.",
  "Violence After Death": "If you drop to 0 hit points while transformed, you do not fall Prone or start death saves until the end of your next turn. Your Symbiont controls you, acting as if you were conscious and attacking hostile creatures it sees. If you take damage at 0 hit points, you fall unconscious and take one death save failure. At the end of your next turn you collapse and make death saves as normal."},
 "acts": {"Symbiotic Transformation": "bonus"},
 "lu": [{"feature": "Traumatic Rend", "lvl": 6, "max": 1, "reset": "short", "tag": "Extra claw attack, target has Disadvantage vs you"}],
 "acb": {"l": 1, "v": 10, "s": "Symbiotic Transformation", "abs": ["DEX", "CHA"]}},
}
