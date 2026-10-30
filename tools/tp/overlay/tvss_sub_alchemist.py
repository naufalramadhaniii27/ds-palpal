"""Alchemist subclasses, Valda's Spire of Secrets 2024 (Mage Hand Press). Own wording."""
SUB = {
"Amorist": {"spab": "",
 "f": {
  "Charmer": "You gain proficiency in Deception and Persuasion, and add your Intelligence modifier (minimum +1) to checks with those skills. When you brew potions, you can make a Philter of Love for 1 Reagent.",
  "Pheromone Bomb [Formula]": "Bomb Formula. The Bomb deals no damage. With Explode, creatures make a Wisdom save instead of Dexterity. A target hit by it, or that fails its save against it, has the Charmed condition until the start of your next turn or until it takes damage.",
  "Magnetic Personality": "You can take the Influence action as a Bonus Action. When you take it, you can treat a Hostile creature as Indifferent, and an Indifferent creature as Friendly.",
  "Beguiling Perfume": "Your perfume sways those who would hurt you. When an enemy within 5 feet makes an attack roll against you, it makes a Wisdom save against your Alchemist save DC. On a failure, the attacker must pick a new target or lose the attack. A creature that takes damage from you is immune to this feature for 1 hour.",
  "Alchemical Romance": "When you use your Pheromone Bomb, you can spend 1 to 4 Reagents. Choose that many benefits from this list. **Dreamy Haze.** One creature with the Bomb's Charmed condition sees every creature as the charmer while Charmed. **Extended Charm.** One creature with the Bomb's Charmed condition stays Charmed for 1 minute or until it takes damage. **Ignore Immunity.** The Bomb ignores Immunity to the Charmed condition. **Toxic Love.** A target hit by the Bomb, or that fails its save against it, takes Poison damage equal to 4d8 plus your Intelligence modifier, or half on a successful save. This damage does not end the Charmed condition."},
 "fx": [[3, "Charmer", {"skills": ["Deception", "Persuasion"], "notes": [["Note", "Charmer: add Intelligence modifier (min +1) to Deception and Persuasion checks"]]}]]},

"Apothecary": {"spab": "",
 "f": {
  "Physician's Studies": "You gain proficiency in Medicine and add your Intelligence modifier (minimum +1) to Medicine checks. You can use a Healer's Kit as a Bonus Action.",
  "Painkiller Bomb [Formula]": "Bomb Formula. The Bomb deals no damage. Instead the target, or each creature in the Explode sphere, gains Temporary Hit Points equal to your Alchemist level. When you use this formula, Prime Bomb raises the Temporary Hit Points instead of the damage. You can use it a number of times equal to your Intelligence modifier (minimum once) and regain all uses after a Long Rest.",
  "Concentrated Healing": "When a creature regains Hit Points from drinking one of your potions, it can pick up to half of the potion's dice after rolling and treat each of them as its maximum number.",
  "Alchemical Resurrection": "If you give a Potion of Superior Healing or Potion of Supreme Healing to a creature that died no more than 24 hours ago, it returns to life with 1 Hit Point.",
  "Miracle Serum": "When a creature drinks one of your potions and regains Hit Points, it has Advantage on D20 Tests until the start of its next turn."},
 "lu": [{"feature": "Painkiller Bomb [Formula]", "n": "Painkiller Bomb", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Bomb Formula"}],
 "fx": [[3, "Physician's Studies", {"skills": ["Medicine"], "notes": [["Note", "Physician's Studies: add Intelligence modifier (min +1) to Medicine checks"]]}]]},

"Dynamo Engineer": {"spab": "INT",
 "f": {
  "Spectrum Analyzer": "You build a monocle that reveals magical auras. You can cast Detect Magic once with no spell slot or components. You regain this use after a Short or Long Rest.",
  "Spell Dynamos": "You cast spells through handheld Spell Dynamos, each holding one spell slot. The Dynamo Engineer Spellcasting table gives your number of dynamos and their slot level, which is the same for all. To cast a Wizard spell of level 1 or higher, you must expend a dynamo. A Long Rest restores all of them. **Configuring.** You set each dynamo in advance to one prepared Wizard spell. You configure them after a Long Rest. After a Short Rest you can reconfigure each unexpended dynamo. **Prepared Spells.** You keep a list of level 1+ Wizard spells. Start with three level 1 spells (Feather Fall, Grease, and Magic Missile are suggested). The list grows as the Prepared Spells column shows, and its spells cannot exceed the Slot Level column. When you gain an Alchemist level, you can swap one spell on the list for another Wizard spell you have slots for. **Spellcasting.** Intelligence is your spellcasting ability. You can use an Arcane Focus as a Spellcasting Focus.",
  "Arcano Bomb [Formula]": "Bomb Formula. Attach an unexpended Spell Dynamo to your Bomb, which expends its slot. The Bomb deals Force damage instead of Fire, all its damage dice are d12s, and it deals an extra 1d12 Force damage.",
  "Counter-Discharge": "When a creature you can see within 60 feet casts a spell that affects you, you can use your Reaction and expend a Spell Dynamo to release disruptive energy. You have Advantage on any save against the spell and Resistance to any damage it deals.",
  "Arcane Recycler": "Right after a creature casts a spell that targets you or includes you in its area, you can use your Reaction to capture the spell in an expended Spell Dynamo. With no expended dynamo, you can expend one as part of this Reaction. The dynamo is restored and configured to that spell, at the level it was cast. It can be any spell, not only a Wizard spell or one you have slots for. You regain this use after a Short or Long Rest."},
 "lu": [{"feature": "Spectrum Analyzer", "n": "Spectrum Analyzer", "lvl": 3, "max": 1, "reset": "short", "tag": "Detect Magic"},
        {"feature": "Arcane Recycler", "n": "Arcane Recycler", "lvl": 14, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Counter-Discharge": "reaction", "Arcane Recycler": "reaction"}},

"Mad Bomber": {"spab": "",
 "f": {
  "Blasting Specialty": "Your Bombs deal double damage to objects and structures.",
  "Black Powder Bomb [Formula]": "Bomb Formula. All the Bomb damage dice are d12s. A target with Resistance to Fire damage loses it for this damage roll. A target with Immunity to Fire damage has Resistance instead for this roll. You can use this formula a number of times equal to your Intelligence modifier (minimum once) and regain all uses after a Long Rest.",
  "Timed Demolition": "As a Utilize action, you can set one of your Bombs on a timer. Choose any number of rounds, up to 10 minutes. The Bomb explodes with Explode at the start of your turn when that many rounds have passed. A creature caught in the area of several of these explosions at once is affected by only one Bomb, your choice.",
  "Blast Shield": "After each Short or Long Rest, choose Acid, Cold, Fire, Lightning, or Thunder. You have Resistance to that damage type until you choose a different one with this feature.",
  "Overloaded Charge": "When you use Prime Bomb and spend the maximum number of Reagents allowed by the Prime Bomb column for your level, the Bomb gains two more Reagents of Prime Bomb dice at no cost."},
 "lu": [{"feature": "Black Powder Bomb [Formula]", "n": "Black Powder Bomb", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Bomb Formula"}],
 "acts": {"Timed Demolition": "other"}},

"Mutagenist": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in Acrobatics and Athletics.",
  "Mutagens": "As a Bonus Action, you inject a Mutagen and gain one benefit of your choice for 1 minute, or until you inject a different Mutagen with a Bonus Action. **Strength.** Your Strength increases by 3, to a maximum of 23. You also grow a natural weapon such as claws, fangs, spines, or horns, and can make Unarmed Strikes with it. You can use Dexterity instead of Strength for those attack and damage rolls. Your Unarmed Strike can deal 1d8 plus your Strength or Dexterity modifier as Bludgeoning, Piercing, or Slashing damage to fit the weapon. **Dexterity.** Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. **Constitution.** Your Constitution increases by 3, to a maximum of 23. You gain Temporary Hit Points instead of more Hit Point maximum or current Hit Points. If your Constitution modifier rises by 1, you gain Temporary Hit Points equal to your level. If it rises by 2, you gain twice your level. They last as long as the score increase.",
  "Shared Mutagen": "As a Bonus Action, spend 1 Reagent to inject an ally within 5 feet with a Mutagen of your choice. A creature can be under only one Mutagen at a time. After you inject another creature, you cannot do so again until that Mutagen ends.",
  "Advanced Mutation": "Whenever you inject yourself with a Mutagen, you can also gain one mutation of your choice. **Hyperelastic.** Your reach increases by 5 feet. You have Advantage on checks and saves to avoid or end the Grappled and Restrained conditions. **Mucilaginous.** You can climb vertical surfaces and ceilings with your hands free, and you have a Climb Speed equal to your Speed. **Polybrachia.** You grow two extra working arms. You can hold weapons and shields (two 2H weapons or four one-handed weapons) and perform Somatic components, but they give no extra actions.",
  "Mutated Blood": "Choose Strength, Dexterity, or Constitution. That score increases by 2, to a maximum of 22. When a Mutagen applies to that score, its maximum becomes 25. You can change the chosen score after a Long Rest."},
 "acts": {"Mutagens": "bonus", "Shared Mutagen": "bonus"},
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Acrobatics", "Athletics"]}]]},

"Ooze Rancher": {"spab": "",
 "f": {
  "Ooze Resilience": "You have Resistance to Acid damage. **Ooze Empathy.** When an Ooze tries to attack you, it makes a Wisdom save against your Alchemist save DC. On a failure, the attack automatically misses you. On a success, that Ooze is immune to this benefit for 24 hours.",
  "Slime Bomb": "You gain the Acid Bomb formula, and it does not count against your formulas known. If you already know it, choose another formula instead. For you the Bomb is improved. A creature hit by your Acid Bomb, or that fails its save against it, has its Speed halved and cannot take the Dash, Disengage, or Dodge action until the start of your next turn.",
  "Bottled Oozes": "When you brew potions, you can spend 2 Reagents to make a Bottled Ooze holding a Gray Ooze. It stays potent until you finish a Long Rest, then goes inert, and it counts toward your potion limit. The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. **Improved Bottled Oozes.** Level 6: Gray Ooze 2 Reagents. Level 8: Ochre Jelly 4, Gelatinous Cube 4. Level 12: Black Pudding 6. A Bottled Ooze cannot use the Split Reaction.",
  "Sacrificial Slime": "When an attack targets you while an allied Ooze is within 5 feet, you can use your Reaction to make the attack target the Ooze instead. You can do this a number of times equal to your Intelligence modifier (minimum once) and regain all uses after a Long Rest. You can also restore one use by spending 2 Reagents (no action).",
  "Elemental Oozes": "When you create a Bottled Ooze, choose Acid, Cold, Fire, Lightning, Poison, or Thunder. The Ooze has Immunity to that damage. When it would take that damage, it takes none and instead regains Hit Points equal to half the damage dealt."},
 "lu": [{"feature": "Sacrificial Slime", "n": "Sacrificial Slime", "lvl": 10, "max": "mod:INT", "reset": "long", "tag": "Reaction, 2 Reagents restore 1"}],
 "acts": {"Sacrificial Slime": "reaction"},
 "fx": [[3, "Ooze Resilience", {"res": ["Acid"]}]]},

"Pigmentist": {"spab": "",
 "f": {
  "Painter": "You gain proficiency with Painter's Supplies and add your Intelligence modifier (minimum +1) to checks made with them. After each Short or Long Rest, you can make a gallon of paint.",
  "Paint Bombs": "You gain the Paint Bomb formula, and it does not count against your formulas known. If you already know it, choose another formula instead. For you the Bomb is improved. **Extended Duration.** Creatures stay coated until the end of your next turn instead of the start. **Magical Pigments.** When you throw a Paint Bomb, choose a color, each tied to a damage type. Whenever an attack roll hits a paint-coated creature, it takes an extra 1d4 damage of that type. Blue Cold, Green Poison, Indigo Thunder, Orange Acid, Red Fire, Violet Necrotic, Yellow Lightning.",
  "Palette Portals": "Once on each of your turns, you can spend 10 feet of movement to step into wet paint within 5 feet of you and come out of other wet paint within 60 feet of you. Both patches must be at least as large as you and must have been coated within the last minute.",
  "Pigment Potions": "When you brew a potion, you can add a pigment from the Magical Pigments list. A creature that drinks it also gains the benefits of a Potion of Resistance for the matching damage type for 1 minute.",
  "Splatter Bombs": "Your Paint Bombs improve further. **Rainbow Blast.** You can add up to three colors from the Magical Pigments list when you throw one. **Selective Splatter.** The extra damage of your Magical Pigments becomes 1d8."},
 "grant": {"f": "Painter", "tools": [[3, "Painter's Supplies"]]},
 "fx": [[3, "Painter", {"notes": [["Note", "Painter: add Intelligence modifier (min +1) to checks with Painter's Supplies"]]}]]},

"Resonator": {"spab": "",
 "f": {
  "Anti-Sound Bomb": "You gain the Concussion Bomb formula, and it does not count against your formulas known. If you already know it, choose another formula instead. For you the Bomb is improved. **Selectable Save.** With Explode, you choose each time whether targets make a Strength, Dexterity, or Constitution save. **Silenced.** With Explode, you can silence the blast area from the explosion until the start of your next turn. Creatures and objects entirely inside have Immunity to Thunder damage, creatures are Deafened, and spells with a Verbal component cannot be cast there.",
  "Resonant Frequency": "As a Magic action, pick one solid material such as wood, glass, metal, or stone, and play its resonant frequency through an audio device. You can stop playing on your turn (no action). When you start playing and at the start of each of your turns while playing, unworn and uncarried objects of that material within 15 feet take Force damage equal to 1d8 plus your Intelligence modifier. Constructs or Elementals made mostly of one material, and parts of objects such as a metal lock, can also be hurt.",
  "Flashbang": "As a Bonus Action, throw a concussive charge at your feet. Each Large or smaller creature of your choice within 10 feet cannot make Opportunity Attacks until the start of your next turn. You can use this a number of times equal to your Intelligence modifier (minimum once) and regain all uses after a Long Rest.",
  "Audio Enhancer": "You gain Blindsight with a range of 30 feet, and Immunity to Thunder damage and the Deafened condition.",
  "Reverb Explosions": "When you use Explode, you can spend 4 Reagents to make it echo. If the Bomb deals damage, all its damage dice drop one step (d12, d10, d8, d6, d4, minimum d4). At the start of your next turn the explosion happens again with the same area and damage, with its dice dropped one more step."},
 "lu": [{"feature": "Flashbang", "n": "Flashbang", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Resonant Frequency": "action", "Flashbang": "bonus"},
 "fx": [[10, "Audio Enhancer", {"senses": [["Blindsight", 30, ""]], "imm": ["Thunder"], "notes": [["Note", "Audio Enhancer: Immunity to the Deafened condition"]]}]]},

"Venomsmith": {"spab": "",
 "f": {
  "Laughing Gas Bombs": "You gain the Laughing Gas Bomb formula, and it does not count against your formulas known. If you already know it, choose another formula instead. For you the Bomb is improved. **Improved Damage.** All its damage dice are d10s. **Side-Splitter.** A creature that rolls a 1 on the d20 for its save against this Bomb's Explode has the Prone condition and Speed 0 until the start of your next turn.",
  "Poisoner": "You gain the Alchemy of Poison Discovery. You can brew its poisons without needing Alchemist level 5. It does not count against your Discoveries known, and you cannot swap it out later.",
  "Alchemical Assassin": "You have a needle ring made for poisoning. As a Bonus Action, apply a contact or injury poison to the ring. On later turns, you can use a Bonus Action to deal 1 Piercing damage to a creature within 5 feet, exposing it to the poison. You have Advantage on Dexterity (Sleight of Hand and Stealth) checks to hide and use the ring.",
  "Mithridatism": "You have Immunity to Poison damage and the Poisoned condition. A creature that drinks one of your potions also gains the benefits of a Potion of Poison Resistance.",
  "Toxic Recompense": "When a creature within 5 feet hits you with an attack, you can use your Reaction to spray poisonous vapor. The attacker must succeed on a Constitution save against your Alchemist save DC or have the Poisoned condition for 1 minute. While Poisoned this way, it takes 2d10 Poison damage at the start of each of its turns. It can repeat the save at the end of each of its turns, ending the effect on a success."},
 "acts": {"Alchemical Assassin": "bonus", "Toxic Recompense": "reaction"},
 "fx": [[10, "Mithridatism", {"imm": ["Poison"], "notes": [["Note", "Mithridatism: Immunity to the Poisoned condition"]]}]]},

"Xenoalchemist": {"spab": "",
 "f": {
  "Xenobiology": "You gain proficiency in one skill of your choice from Arcana, Nature, or Medicine. You have Advantage on ability checks to identify or research monsters.",
  "Mad Scientist": "**Two Grafts.** You gain two Common or Uncommon monstrous grafts of your choice (Monstrous Weapon and Climbing Apparatus are suggested). The grafts are described at the end of the class. **Painless Attachment.** Installing or removing a graft costs you no Hit Point Dice and no recovery time. **Intelligent Grafts.** You can use Intelligence instead of Strength or Dexterity for attacks and damage of Unarmed Strikes that a graft improves, such as Monstrous Bite and Monstrous Weapon. A save forced by a graft uses your Alchemist save DC.",
  "Sleep Bomb [Formula]": "Bomb Formula. The Bomb deals no damage. With Explode, creatures make a Wisdom save instead of Dexterity. A target hit by it, or that fails its save against it, has the Incapacitated condition until the end of its next turn, then repeats the save. On a second failure it has the Unconscious condition for 1 minute. The condition ends if it takes damage or a creature within 5 feet uses an action to shake it awake. Creatures that do not sleep, such as elves, or that are immune to Exhaustion, automatically succeed on saves against this Bomb. A creature that succeeds on its save is immune to the Bomb's conditions for 24 hours. You can use this formula a number of times equal to your Intelligence modifier (minimum once) and regain all uses after a Long Rest.",
  "Examine Specimen": "As a Bonus Action, you can take the Study action on a creature. You learn its creature type and make a DC 15 Intelligence check with the skill matching the type. **Arcana:** Aberrations, Constructs, Elementals, Fey, Monstrosities. **History:** Giants, Humanoids. **Nature:** Beasts, Dragons, Oozes, Plants. **Religion:** Celestials, Fiends, Undead. On a success, you learn one thing of your choice about it: its AC, an Immunity, a Resistance, or whether it is Bloodied. Pass or fail, you cannot use this on that creature or another of its specific kind (such as humans or unicorns) until you finish a Short or Long Rest.",
  "Necromantic Organs": "Reanimated organs keep you going. When you are reduced to 0 Hit Points but not killed outright, you can instead drop to Hit Points equal to twice your Alchemist level. You regain this use after a Long Rest.",
  "It's Alive!": "You build a golem from discarded parts, using the Alchemy Golem stat block. **Creating or Replacing.** Making one takes 3 Humanoid corpses and 8 hours of work, which can happen during a Long Rest. A new golem kills the old one. **In Combat.** The golem is an ally to you and your allies. It acts right before or after your turn each round (your choice). As a Bonus Action, you can command it mentally within 500 feet. With no command, it takes the Dodge action and moves only to avoid harm. **Golem Grafts.** You can attach up to three monstrous grafts to it. **Restoring.** If it died within the last hour, you can use a Magic action to touch it and spend 1 Reagent. It returns with Hit Points equal to 1d10 plus your Intelligence modifier."},
 "lu": [{"feature": "Sleep Bomb [Formula]", "n": "Sleep Bomb", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Bomb Formula"},
        {"feature": "Necromantic Organs", "n": "Necromantic Organs", "lvl": 10, "max": 1, "reset": "long", "tag": "At 0 HP"}],
 "acts": {"Examine Specimen": "bonus", "It's Alive!": "other"}},
}
