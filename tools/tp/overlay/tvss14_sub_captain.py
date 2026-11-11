# Own-wording Captain banners, Valda's Spire of Secrets 2014 rules.
SUB = {
"Demon Banner": {"spab": "",
 "f": {
  "Maneuver: Abyssal Rebuke": "When a creature you can see within 60 feet damages you, you can use your Reaction and spend a battle die. It makes a Dexterity save. On a failure it takes Fire damage equal to the die plus your Charisma modifier, or half on a success.",
  "Demon's Sight": "You gain your demon's Darkvision out to 120 feet. You and the demon can see normally in magical darkness.",
  "Abyssal Arcana": "You can use your demon's Innate Spellcasting trait even when you are not transformed.",
  "One with the Abyss": "Your bond with the demon is unbreakable. You and it share a pool of HP, your maximum plus the demon's. You both have the higher AC of the two forms. You can use the demon's flying Speed even when not transformed.",
 },
 "lu": [], "acts": {"Maneuver: Abyssal Rebuke": "reaction"},
 "fx": [[7, "Demon's Sight", {"senses": [["Darkvision", 120, "Also see in magical darkness"]]}]]},

"Dragon Banner": {"spab": "",
 "f": {
  "Bonus Battle Dice": "Your total number of battle dice rises by 1.",
  "Maneuver: Cleave": "Once on each of your turns, when you reduce a hostile creature to 0 HP or score a critical hit with a melee weapon attack, spend a battle die to move up to 15 feet and make another melee weapon attack as part of the same action. On a hit, add the die to the damage.",
  "Maneuver: Wade Into Battle": "Spend a battle die to take the Dash or Disengage action as a Bonus Action on your turn.",
  "Maneuver: Fury Attack": "When you take the Attack action on your turn, spend a battle die as a Bonus Action to unleash a barrage. Make up to three melee weapon attacks as part of the Attack action instead of one, each against a different creature.",
  "Vicious Focus": "When you reduce a hostile creature to 0 HP or score a critical hit with a melee weapon attack, you enter a battle trance for 1 minute. Your weapon attacks score a critical hit on a 19 or 20. Each time you drop another hostile creature to 0 HP or score another critical hit, the range widens: first 18-20, then 17-20, then 16-20. It ends early if you fall Unconscious.",
 },
 "lu": [], "acts": {},
 "fx": [[3, "Bonus Battle Dice", {"notes": [["Note", "Bonus Battle Dice: you have one more battle die than the Captain table shows"]]}]]},

"Eagle Banner": {"spab": "",
 "f": {
  "Maneuver: Eagle Shot": "When you make a ranged weapon attack roll against a creature, you can use your Bonus Action and spend a battle die to add it to the roll, before or after rolling but before the GM says whether it hits.",
  "Vantage Point": "You have a Climb Speed equal to your Speed. Climbing at half speed, you can scale difficult surfaces, such as slippery vertical walls, without an ability check.",
  "Close-Quarters Shooting": "A hostile creature within 5 feet does not impose Disadvantage on your ranged attack rolls, or on those of friendly creatures within 15 feet of you.",
  "Scatter Shot": "As an action you launch a volley. Make a ranged weapon attack against any number of creatures you choose in a 15-foot cone, with a separate roll for each. If you target only one creature, a hit deals one extra weapon damage die.",
 },
 "lu": [], "acts": {"Scatter Shot": "action"},
 "fx": [[7, "Vantage Point", {"notes": [["Note", "Vantage Point: Climb Speed equal to your Speed"]]}]]},

"Jolly Roger Banner": {"spab": "",
 "f": {
  "Maneuver: Double Thrust": "When you attack with a finesse weapon as part of the Attack action on your turn, spend a battle die as a Bonus Action to make one more attack with it. That attack adds the die to the damage instead of your ability modifier.",
  "Tricky Footwork": "When you hit a creature of your size or smaller with a melee attack on your turn, you can swap places with the target. This does not provoke Opportunity Attacks.",
  "Unfair Play": "You and your cohort can use a Bonus Action to take the Hide or Use an Object action, or to try to shove a creature. You have Advantage on Strength (Athletics) checks to push another creature out of a boat or other vessel on water.",
  "All Hands on Deck": "As an action on your turn you direct each friendly creature within 60 feet that can see or hear you to take an action of its choice, other than Attack, Cast a Spell, Dodge or Use a Magic Item. Each can use its Reaction at once to do so.",
 },
 "lu": [], "acts": {"All Hands on Deck": "action"}, "fx": []},

"Lion Banner": {"spab": "",
 "f": {
  "Maneuver: Lion's Challenge": "When you hit a creature with a weapon attack on your turn, spend a battle die as a Bonus Action to challenge it to a duel. Until the end of your next turn it has Disadvantage on attack rolls that are not against you.",
  "Saddle Sure": "You have Advantage on saves to avoid falling off your mount, and you land on your feet if you fall unless Incapacitated. Mounting or dismounting costs you only 5 feet of movement. You can force an attack aimed at your mount to target you instead.",
  "Reposition": "When you roll Initiative, you and up to three friendly creatures you can see can each move up to 20 feet. A creature with 0 Speed cannot benefit.",
  "Lion's Gambit": "When a creature within 5 feet damages you, you can use your Reaction to make a melee weapon attack against it. On a hit you add half your level to the damage. You can do this three times, and a Short or Long Rest restores all uses.",
 },
 "lu": [{"feature": "Lion's Gambit", "lvl": 17, "max": 3, "reset": "short", "tag": "Reaction"}],
 "acts": {"Lion's Gambit": "reaction"}, "fx": []},

"Ram Banner": {"spab": "",
 "f": {
  "Maneuver: Bull Rush": "When you move at least 10 feet in a straight line and then make a melee weapon attack against a creature, spend a Bonus Action and a battle die to shove it after the attack. Add the die to the Strength (Athletics) check. On a success you can knock the target Prone or push it up to 10 feet away.",
  "Surefooted": "Nonmagical Difficult Terrain costs you no extra movement.",
  "Lock Horns": "When you shove a creature into one of your allies, that ally can use its Reaction to attack the shoved creature.",
  "And Stay Down": "When a creature within your reach stands up from Prone, you can make an Opportunity Attack against it.",
 },
 "lu": [], "acts": {},
 "fx": [[7, "Surefooted", {"notes": [["Note", "Surefooted: nonmagical Difficult Terrain costs no extra movement"]]}]]},

"Raven Banner": {"spab": "",
 "f": {
  "Maneuver: Effortless Dodge": "As a Bonus Action, spend a battle die to take the Dodge action. You cannot use this while wearing medium or heavy armor.",
  "Maneuver: Flanking Strike": "When you hit a creature with a weapon attack while an ally is within 5 feet of it, spend a battle die to strike a vital spot. Add the die and half your level (rounded down) to the damage. The attack must use a finesse or light weapon.",
  "Covert": "When you are hidden and a creature spots you with a Wisdom (Perception) check, you can retry your Dexterity (Stealth) check. On a success you slip away unnoticed. Short or Long Rest to use it again.",
  "Strike First, Strike Last": "As a Reaction when a hostile creature you can see attacks, you move up to your Speed toward it without provoking Opportunity Attacks and make one attack against it. Resolve your attack before the creature attacks. Long Rest to use it again.",
  "Guerilla Warfare": "You have Advantage on attack rolls against creatures that have not taken a turn in the combat yet. The first time you hit a creature during the first round of combat, you add two battle dice to the damage without spending them.",
 },
 "lu": [{"feature": "Covert", "lvl": 7, "max": 1, "reset": "short", "tag": "Retry hide"},
        {"feature": "Strike First, Strike Last", "lvl": 13, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Strike First, Strike Last": "reaction"}, "fx": []},

"Siegeball Banner": {"spab": "",
 "f": {
  "Sports Enthusiast": "You gain proficiency in Athletics (or double your Proficiency Bonus if you have it) and in improvised weapons tied to sports, such as bats, clubs and darts.",
  "Team Player": "As a Bonus Action you can give one of your unspent battle dice to a creature within 60 feet that can hear you. Once within the next minute, it can roll the die and add the result to one ability check, attack roll or saving throw, deciding after the d20 but before the GM says whether it succeeds. After you use this, you cannot use it again for 1 minute.",
  "Superfan": "You have Advantage on ability checks to play a sport or to recall facts about a sport or its teams.",
  "Incisive Taunt": "As a Bonus Action you mock a creature within 15 feet. If it can hear you and understands a language, it has Disadvantage on attack rolls against creatures other than you until the end of its next turn. You can use this a number of times equal to your Charisma modifier (minimum 1). Spend a battle die to regain a use. A Long Rest restores all uses.",
  "Game-Winning Play": "If you drop to 0 HP, you can use your Reaction to delay falling Unconscious. You then move up to twice your Speed without provoking Opportunity Attacks and take an action. Damage still causes death save failures, and three failures can still kill you. After this you fall Unconscious if you are still at 0 HP. Long Rest to use it again.",
 },
 "lu": [{"feature": "Incisive Taunt", "lvl": 13, "max": "mod:CHA", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Game-Winning Play", "lvl": 17, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Team Player": "bonus", "Incisive Taunt": "bonus", "Game-Winning Play": "reaction"},
 "fx": [[3, "Sports Enthusiast", {"skills": ["Athletics"], "notes": [["Note", "Sports Enthusiast: if already proficient in Athletics, double your Proficiency Bonus for it. Proficient with sports improvised weapons"]]}]]},

"Treant Banner": {"spab": "",
 "f": {
  "Maneuver: Blocked Passage": "As a Bonus Action, spend a battle die to block your enemies' way with natural terrain. The area is a number of unoccupied 10-foot cubes equal to the roll, arranged as you like with each cube touching another by a face. The GM chooses the terrain, such as boulders, fallen trees or gusting winds. You choose whether it is Difficult Terrain or impassable. Each cube has AC 15, 15 HP and Immunity to Poison and Psychic damage. After you use it, you cannot use it again for 1 minute.",
  "Druidbane": "You and your cohort ignore magical and nonmagical Difficult Terrain. You are immune to Spike Growth and other spells that change natural terrain, such as Hallucinatory Terrain and Plant Growth.",
  "Superior Positioning": "You and each friendly creature within 15 feet have Advantage on attack rolls against creatures standing in Difficult Terrain.",
  "Thornfoot": "When you or your cohort move over ground, you can leave a 5-foot-wide strip of thorns behind, as in Spike Growth, using your maneuver save DC. It lasts 10 minutes or until you dismiss it on your turn with no action.",
 },
 "lu": [], "acts": {},
 "fx": [[7, "Druidbane", {"notes": [["Note", "Druidbane: ignore Difficult Terrain. Immune to Spike Growth, Hallucinatory Terrain and Plant Growth"]]}]]},

"Turtle Banner": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency with heavy armor.",
  "Maneuver: Iron Shell": "As a Bonus Action, spend a battle die to fortify an ally you can see within 60 feet. For 1 minute, against the next attack made against it, the ally gains a bonus to AC equal to half the roll, rounded down (minimum +1).",
  "Slow and Steady": "Your Speed cannot be reduced to 0 by effects, and you cannot be knocked Prone or moved against your will.",
  "Shield Wall": "You count as cover against effects passing through your space for allies of your size or smaller within 5 feet of you.",
  "Unbreakable": "You have a pool of 20 armor points. As a Reaction when a melee weapon attack hits you, spend any number of them and add them to your AC against that attack, which can make it miss. A Long Rest restores all of them.",
 },
 "lu": [{"feature": "Unbreakable", "lvl": 17, "max": 20, "reset": "long", "tag": "Armor points"}],
 "acts": {"Unbreakable": "reaction"},
 "fx": [[3, "Bonus Proficiencies", {"armor": ["Heavy"]}], [7, "Slow and Steady", {"notes": [["Note", "Slow and Steady: Speed cannot be removed. Cannot be knocked Prone or moved against your will"]]}]]},
}
