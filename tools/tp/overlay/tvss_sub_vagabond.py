# Own-wording Vagabond subclasses of Valda's Spire of Secrets (2024). Cross-compatible with Captain.
SUB = {
"Adrenaline Junkie": {"spab": "",
 "f": {
  "Adrenaline": "At the start of your turn while Bloodied, you gain an Adrenaline Battle Die (d6). You can hold only one. You lose it when you stop being Bloodied.",
  "Stim Potion": "After a Long Rest, you can brew Stim Potions equal to your Constitution modifier. They go inert after your next Long Rest. Drink one as a Bonus Action. Then, at the start of each of your turns for 1 minute, you can pick one benefit (no action required). Each time you use a benefit, you take Necrotic damage equal to one roll of your Battle Die, ignoring Resistance and Immunity and bypassing Temporary Hit Points. **Bullet Time.** The next attack against you before your next turn has Disadvantage. **Hyper Focus.** You have Advantage on the next attack roll you make before the end of your turn. **Rush.** You take the Dash or Disengage action (no action required).",
  "Live Fast": "**Insane Stunt.** You gain Heroic Inspiration when you make a Strength, Dexterity, or Constitution check that has Disadvantage because it is impractical, dangerous, or hard. **Tuck and Roll.** You take no damage from falling 60 feet or less.",
  "Daredevil": "While Bloodied, when a creature you can see misses you with an attack, you can take a Reaction to gain Temporary Hit Points equal to half your Vagabond level + your Constitution modifier.",
  "Adrenaline High": "Your Adrenaline Battle Dice become d8s. At the start of each of your turns you gain two while Bloodied, or one while not Bloodied."},
 "lu": [{"feature": "Stim Potion", "n": "Stim Potions", "lvl": 3, "max": "mod:CON", "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Stim Potion": "bonus", "Daredevil": "reaction"}},

"Brigand": {"spab": "",
 "f": {
  "Ambush [Maneuver]": "When you roll Initiative, right after regaining your Battle Dice, you can spend one to draw up to two weapons and make one weapon attack. You cannot use this while Incapacitated.",
  "Craven": "When a creature you can see misses you with a melee attack, you can take a Reaction to move 5 feet without provoking Opportunity Attacks.",
  "Take Hostage": "When you hit a Medium or smaller creature with a melee weapon or Unarmed Strike and leave it at Hit Points equal to or below twice your Vagabond level, you can take a Bonus Action to hold it hostage. It is Grappled and Incapacitated. You have Cover, and attacks that miss you hit the hostage instead. You have Advantage on Charisma (Intimidation) checks against the hostage's allies. In response to any creature's action, you can take a Reaction to release the hostage or attack it with a weapon you hold.",
  "Underhanded Blow": "When you hit with an attack roll, you can give the target Disadvantage on attacks it makes before your next turn starts. You can use this once, then you must roll Initiative or finish a Short or Long Rest to use it again.",
  "Cutthroat": "When you hit with an attack roll and a damage die shows its highest number, roll that die again and add it. If the new roll is also the highest, repeat. Each die can be rolled this way up to four times."},
 "lu": [{"feature": "Underhanded Blow", "n": "Underhanded Blow", "lvl": 10, "max": 1, "reset": "short", "tag": "On hit"}],
 "acts": {"Craven": "reaction", "Take Hostage": "bonus"}},

"Feylost": {"spab": "",
 "f": {
  "Fey Moods": "When damage makes you Bloodied, roll on the Fey Moods table. The mood lasts 1 minute or until you stop being Bloodied. **1 Arrogant.** Enemies within 5 feet of you have Disadvantage on attacks against anyone but you. **2 Elated.** At the start of each of your turns, you gain Temporary Hit Points equal to your Constitution modifier. **3 Fearful.** Opportunity Attacks against you have Disadvantage. **4 Forlorn.** When a creature you can see hits an ally within 5 feet of you, you can take a Reaction to make the attack hit you instead. **5 Manic.** When you roll a 1 on the d20 for a D20 Test, it becomes a 20. **6 Paranoid.** You have Advantage on Dexterity checks and saving throws. **7 Serene.** You have Advantage on Intelligence, Wisdom, and Charisma saving throws. **8 Spiteful.** When a creature damages you, the next time you hit it before the end of your next turn, it takes an extra 1d8 Force damage.",
  "Frenzied Strike [Maneuver]": "When you hit with a Melee weapon or Unarmed Strike, spend one Battle Die as a Bonus Action to infect the target's mind. It is Frenzied until the end of its next turn. A Frenzied creature cannot tell friend from foe and treats every creature it sees as an enemy. It picks targets for attacks, spells, and abilities at random from creatures it can see in range, and it must make an Opportunity Attack if any creature provokes one.",
  "Misty Pathways": "You can cast Misty Step with no spell slot. After you do, you cannot do so again until you finish a Short or Long Rest, unless you spend one Battle Die (no action required) to restore the use.",
  "Irresistible Mood": "When a creature deals damage that makes you Bloodied, you can take a Reaction to give it the Charmed or Frightened condition for 1 minute. At the end of each of its turns, it makes a Wisdom save against your Maneuver save DC, ending the condition on a success.",
  "Mercurial": "As a Bonus Action, spend one Battle Die to activate any Fey Mood you choose for 1 minute. If you already have a mood active, or become Bloodied while this one is active, both moods can be active at once."},
 "lu": [{"feature": "Misty Pathways", "n": "Misty Pathways", "lvl": 6, "max": 1, "reset": "short", "tag": "Bonus Action, free cast"}],
 "acts": {"Frenzied Strike [Maneuver]": "bonus", "Misty Pathways": "bonus", "Irresistible Mood": "reaction", "Mercurial": "bonus"}},

"Gourmand": {"spab": "WIS",
 "f": {
  "Fine Cuisine": "**Cook's Utensils.** You gain proficiency with Cook's Utensils if you lack it. **Gentle Repose.** You can cast Gentle Repose, but only as a Ritual. Wisdom is your spellcasting ability for it.",
  "Monster Meal": "As part of a Long Rest, you can cook and eat a special meal if you have ingredients and Cook's Utensils. It feeds creatures equal to half your Vagabond level + your Constitution modifier. Each eater gains Temporary Hit Points equal to one roll of your Battle Die + your Constitution modifier, without spending the die. If you add monster ingredients, eaters also gain a matching benefit until they finish a Long Rest. You can add up to three monster ingredients to one meal and gain each benefit. One corpse generally yields enough for one meal. **Aberration, Strange Sushi.** A Critical Hit against the creature becomes a normal hit. **Celestial, Heavenly Trifle.** The creature adds 1d4 to attack rolls and saving throws. **Dragon, Wyvern Wings.** +2 bonus to AC. **Elemental, Maelstrom Stew.** Speed increases by 10 feet. **Fey, Pixie Sticks.** Immunity to the Charmed and Frightened conditions. **Fiend, Diablo Barbeque.** Resistance to Cold and Fire damage. **Giant, Colossal Steak.** Advantage on Strength checks and saving throws. **Monstrosity, Dire Sandwich.** Hit Points maximum and current Hit Points increase by 5. **Ooze, Gelatinous Soup.** Blindsight with a range of 10 feet. **Plant, Treant Salad.** Difficult Terrain costs no extra movement.",
  "Carve [Maneuver]": "When you hit with a weapon or Unarmed Strike, spend two Battle Dice as a Bonus Action to try to butcher the target. Add the dice to the damage. If the creature's type is on the Monster Meal table, you gain the matching benefit for 1 hour.",
  "Quick Snack": "At the start of each of your turns, you can eat a snack to use your Breather (no action required). You can do this once, then you must finish a Short or Long Rest to do it again. You can also restore the use by spending one Battle Die (no action required).",
  "Gourmet Ingredients": "When you prepare a Monster Meal, you can give each eater one of these benefits until it finishes a Long Rest. **Hero Sauce.** The creature gains Heroic Inspiration. It can hold this one and another at the same time. **Munchkin Spice.** One ability score of its choice increases by 2, to a maximum of 22. **Wish Bone.** It can cast one spell of level 5 or lower with a casting time of an action, with no spell slot."},
 "lu": [{"feature": "Quick Snack", "n": "Quick Snack", "lvl": 10, "max": 1, "reset": "short", "tag": "Free"}],
 "acts": {"Carve [Maneuver]": "bonus"},
 "grant": {"f": "Fine Cuisine", "tools": [[3, "Cook's Utensils"]]}},

"Houndmaster": {"spab": "",
 "f": {
  "Faithful Hound": "A loyal hound is always at your side. It uses the Hound stat block. **In Combat.** It acts on your turn. It can move and use its Reaction on its own, but its only action is Dodge, unless you use a Bonus Action to command it to take an action from its stat block or another action. While you are Incapacitated, it acts on its own and is not limited to Dodge. **At 0 Hit Points.** The hound is Unconscious until you finish a Long Rest or it regains any Hit Points. After a Short or Long Rest, it regains all its Hit Points and loses this condition. **Losing the dog.** The hound is a companion, not a disposable minion. Talk with your GM about what losing it means. It might be impossible, or a key story moment. You might switch to another subclass, such as Adrenaline Junkie, while it is gone.",
  "Sick 'Em! [Maneuver]": "As a Bonus Action, spend one Battle Die to command your hound to attack a creature you can see within 40 feet of it. The hound moves up to its Speed without provoking Opportunity Attacks and makes one Bite attack against the target. Add the Battle Die to the attack and damage rolls.",
  "Desperate Companion": "While you are Bloodied, your hound has Advantage on attack rolls.",
  "Hound's Instincts": "**Blindsight.** The hound has Blindsight to 30 feet. **Supernatural Scent.** The hound can tell if a creature is possessed, magically disguised, or shape-shifted.",
  "Loyal Redirection": "When a creature you can see hits your hound with an attack while it is within 5 feet of you, you can take a Reaction to make the attack hit you instead. Or your hound can take a Reaction to make an attack that hits you hit it instead.",
  "Old Dog, New Tricks": "**Battle Dice.** Your hound has two d10 battle dice. A die is spent when the hound uses it. It regains all spent dice when it finishes a Short or Long Rest or rolls Initiative. **Maneuvers.** The hound knows two of your maneuvers that have no prerequisite. Its Bite counts as a Melee weapon for maneuvers. **Saving Throws.** Any save a maneuver requires uses your Maneuver save DC."},
 "acts": {"Sick 'Em! [Maneuver]": "bonus", "Loyal Redirection": "reaction"}},

"Knight Errant": {"spab": "",
 "f": {
  "Chivalrous Oath": "**Bonus Proficiencies.** You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. **Heroic Resolve.** When you roll Initiative, you gain Temporary Hit Points equal to your Vagabond level. **Unwavering Loyalty.** You have Advantage on saves to avoid or end the Charmed or Frightened conditions.",
  "Knight's Challenge": "You learn the Challenge maneuver. If you already know it, learn a different maneuver you qualify for instead. When you use Challenge, you can make it last 1 minute instead of until the end of your next turn. It then ends early if you use the maneuver again, if you make an attack roll or cast a spell that targets an enemy other than the target, if an ally damages the target, or if you end your turn more than 30 feet from the target.",
  "Inspiring Battlecry": "When you become Bloodied, you can give Heroic Inspiration to yourself and to allies within 30 feet who can see or hear you (no action required). You can do this once, then you must finish a Long Rest to do it again.",
  "Redirection": "When a creature you can see hits an ally within 5 feet of you with an attack, you can take a Reaction to make the attack hit you instead. You have Resistance to Bludgeoning, Piercing, and Slashing damage from that attack.",
  "Surge of Valor": "As a Bonus Action, you can summon your resolve. Until your next turn starts, **Unbreakable.** When an enemy damages you, you can roll a Battle Die without spending it and reduce the damage by the roll. **Undaunted.** When you fail a D20 Test, you can roll a Battle Die without spending it and add it to the roll, which may turn the failure into a success. You can do this once, then you must finish a Short or Long Rest to do it again, or spend two Battle Dice (no action required) to restore the use."},
 "lu": [{"feature": "Inspiring Battlecry", "n": "Inspiring Battlecry", "lvl": 6, "max": 1, "reset": "long", "tag": "Free"},
        {"feature": "Surge of Valor", "n": "Surge of Valor", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Inspiring Battlecry": "free", "Redirection": "reaction", "Surge of Valor": "bonus"},
 "pick": [{"l": 3, "k": "opts", "n": 2, "key": "knighterrant_skills", "feature": "Chivalrous Oath", "title": "Bonus Proficiencies (choose 2)",
           "list": [["Animal Handling", "Gain proficiency in Animal Handling."], ["History", "Gain proficiency in History."], ["Insight", "Gain proficiency in Insight."], ["Persuasion", "Gain proficiency in Persuasion."]]}]},

"Mage Brand": {"spab": "CHA",
 "f": {
  "Spellbranding": "**Cantrips.** You know two Sorcerer cantrips of your choice. Fire Bolt and True Strike are suggested. When you gain a Vagabond level, you can swap one for another Sorcerer cantrip. At level 10 you learn one more. **Spellbrand Spellcasting.** To cast a level 1+ Sorcerer spell, you spend Battle Dice to make a spell slot that is used up at once. The slot's level equals the dice spent, up to the Max Slot Level for your level on the Mage Brand Spellcasting table. **Prepared Spells.** You keep a list of level 1+ Sorcerer spells. Start with three level 1 spells. Chromatic Orb, Jump, and Shield are suggested. The list grows as the Prepared Spells column shows. Each spell must not exceed your Max Slot Level. **Early Ending.** When you roll Initiative, your ongoing spells end. **Changing Spells.** When you gain a Vagabond level, you can swap one list spell for another Sorcerer spell of the same level. **Spellcasting Ability.** Charisma.",
  "Arcane Synesthesia": "You can smell and taste lingering magic. You instantly know whether a creature has cast a spell in the last 24 hours. By touching an object, you sense whether it is a magic item, but not what it does.",
  "Arcane Strike": "When you take the Attack action, you can replace one attack with a Sorcerer cantrip you know that has a casting time of an action.",
  "Desperate Ward": "While Bloodied, you have Advantage on saves against spells and other magical effects.",
  "Imprinted Spellscar": "When a creature casts a spell of level 5 or lower that damages you, you can take a Reaction to imprint it on yourself. You have it prepared and can cast it by spending Battle Dice equal to its level. The imprint fades once cast or after a Long Rest. You can hold imprints up to your Charisma modifier."},
 "acts": {"Arcane Strike": "other", "Imprinted Spellscar": "reaction"}},

"Plague Doctor": {"spab": "",
 "f": {
  "Physician": "**Medical Training.** You gain proficiency and Expertise in Medicine. **Diagnosis.** You can take the Search action to learn whether a creature you see within 30 feet is Poisoned, Bloodied, or has a magical contagion. You sense the source of the Poisoned condition, the nature of its wounds, and the contagion.",
  "Remedy [Maneuver]": "As a Bonus Action on your turn, spend one Battle Die and pick an ally within 5 feet. It regains Hit Points equal to two rolls of the die + your Constitution modifier. You can also end one of these conditions on it: Blinded, Deafened, Paralyzed, or Poisoned.",
  "Imbalance Humors": "Once on each of your turns, when you hit with a weapon or Unarmed Strike, you can imbalance the target's humors with one option. You can do this once, then you must finish a Short or Long Rest to do it again, unless you spend one Battle Die (no action required) to restore the use. **Choleric.** Until your next turn starts, the target has Advantage on attack rolls and attacks against it have Advantage. **Melancholic.** The target has Disadvantage on its next D20 Test before your next turn starts. **Phlegmatic.** The target cannot make Opportunity Attacks until the start of its turn. **Sanguine.** The next time the target takes damage before your next turn starts, it takes extra Necrotic damage equal to one roll of your Battle Die, which is not spent.",
  "Analgesic Remedy": "When you use Remedy, you can give yourself or the ally Temporary Hit Points equal to your Vagabond level.",
  "Bloodletting": "You learn the Wounding Strike maneuver. If you already know it, learn a different maneuver instead. You can use Wounding Strike by spending 1 to 3 Battle Dice. You add only one die to the damage, but the target gains bleeding wounds equal to the dice spent."},
 "lu": [{"feature": "Imbalance Humors", "n": "Imbalance Humors", "lvl": 6, "max": 1, "reset": "short", "tag": "On hit"}],
 "acts": {"Physician": "action", "Remedy [Maneuver]": "bonus"},
 "fx": [[3, "Physician", {"skills": ["Medicine"], "exp": ["Medicine"]}]]},

"Pugilist": {"spab": "",
 "f": {
  "Hand-to-Hand": "**Unarmed Strike.** You can roll 1d6 instead of the normal Unarmed Strike damage. The die becomes 1d8 at level 5, 1d10 at level 11, and 1d12 at level 17. From level 6, your Unarmed Strike can deal Force damage or its normal type. **Brute Force.** The first creature you hit with an Unarmed Strike on each turn takes extra damage equal to one roll of your Unarmed Strike die. **Unarmored Defense.** With no armor, your base AC is 10 + your Dexterity modifier + your Constitution modifier. You can use a Shield and keep this.",
  "Shrug Off [Maneuver]": "When you take damage, you can use a Reaction and spend one Battle Die to reduce the damage by the number rolled.",
  "Intimidating Blow": "You learn the Horrific Strike maneuver. If you already know it, learn a different maneuver instead. When you use Horrific Strike, you can add a frightening display in a 10-foot Emanation from you. Each creature you choose there makes a Wisdom save against your Maneuver save DC or is Frightened until the start of your next turn.",
  "Desperate Endurance": "When you fail a save while Bloodied, you can choose to succeed instead. You can do this once, then you must finish a Long Rest to do it again.",
  "Knockout [Maneuver]": "When you hit with an Unarmed Strike, spend three Battle Dice as a Bonus Action to try to knock the target out. Add the dice to the damage. If the target has fewer Hit Points than three times your Vagabond level after taking the damage, it is Unconscious until it regains any Hit Points or finishes a Long Rest."},
 "lu": [{"feature": "Desperate Endurance", "n": "Desperate Endurance", "lvl": 10, "max": 1, "reset": "long", "tag": "Free"}],
 "acts": {"Shrug Off [Maneuver]": "reaction", "Knockout [Maneuver]": "bonus"}},

"Rōnin": {"spab": "",
 "f": {
  "Grudge": "As a Bonus Action, you can hold a grudge against a creature you see within 30 feet that has damaged you or an ally. It lasts 1 minute, until the target dies, or until you use this Bonus Action again. At the start of each of your turns during the grudge, you gain a Grudge Battle Die (d6). You can hold only one. You can use it only for maneuvers that target the creature you hold the grudge against.",
  "Infamy": "Choose Deception or Intimidation. You gain proficiency and Expertise in it.",
  "Lone Wolf": "**Outnumbered, Not Outmatched.** When you roll Initiative and enemies outnumber allies in the Initiative order, you have Advantage on the roll. **Stand Alone.** While no ally is within 5 feet of you and you are not Incapacitated, enemies cannot have Advantage on attack rolls against you.",
  "Killing Stroke": "When a creature you can see within 5 feet attacks you, you can take a Reaction to make one Melee weapon attack against it. You can draw a weapon as part of this Reaction. Resolve your attack first. On a hit, the triggering attack automatically misses you. You can do this once, then you must finish a Short or Long Rest to do it again, unless you spend two Battle Dice (no action required) to restore the use.",
  "Swordmaster": "Once per turn, when you miss with an attack roll, you can repeat that attack against the same target."},
 "lu": [{"feature": "Killing Stroke", "n": "Killing Stroke", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Grudge": "bonus", "Killing Stroke": "reaction"},
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "ronin_infamy", "feature": "Infamy", "title": "Infamy Skill",
           "list": [["Deception", "Gain proficiency and Expertise in Deception."], ["Intimidation", "Gain proficiency and Expertise in Intimidation."]]}]},

"Troubadour": {"spab": "",
 "f": {
  "Folk Musician": "**Performer.** You gain proficiency and Expertise in Performance, and proficiency with two Musical Instruments of your choice. **Pantomime.** You can get simple ideas across to any creature that understands at least one language. It takes twice as long as normal speech.",
  "Inspiring Tune [Maneuver]": "As a Bonus Action, you can inspire another creature within 60 feet that can see or hear you. Give it one of your unspent Battle Dice. A creature can hold only one die from this maneuver at a time. Once within the next minute, when it fails a D20 Test, it can roll the die and add the result to the d20, which may turn the failure into a success. The die is spent when rolled.",
  "Fast Friends": "You can take the Influence action to try to befriend a creature you see within 30 feet that can see or hear you. It makes a Wisdom save (DC 8 + your Charisma modifier + your Proficiency Bonus) or is Charmed for 1 minute or until it takes damage. While Charmed, it is friendly to you and your allies. You can do this once, then you must finish a Short or Long Rest to do it again, unless you spend one Battle Die (no action required) to restore the use.",
  "Scathing Retort": "When a creature you see within 60 feet misses you with an attack roll, or forces a save that you succeed on, you can take a Reaction to insult it. It takes Psychic damage equal to 1d10 + half your Vagabond level (round down).",
  "Marvelous Troupe": "When you use Inspiring Tune, you can target a number of allies up to your Charisma modifier. Each one gains a Battle Die."},
 "lu": [{"feature": "Fast Friends", "n": "Fast Friends", "lvl": 6, "max": 1, "reset": "short", "tag": "Action"}],
 "acts": {"Inspiring Tune [Maneuver]": "bonus", "Fast Friends": "action", "Scathing Retort": "reaction"},
 "fx": [[3, "Folk Musician", {"skills": ["Performance"], "exp": ["Performance"]}]]},
}
