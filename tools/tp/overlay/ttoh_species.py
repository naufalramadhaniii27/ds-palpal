# Own-wording species of Tome of Heroes (2014 rules), shape of src/data/wotc10-species-2014.js. Each subrace is its own species with the parent traits included.
DV60 = ["Darkvision", "Darkvision out to 60 ft."]
DV120 = ["Superior Darkvision", "Darkvision out to 120 ft."]
SUNS = ["Sunlight Sensitivity", "You have Disadvantage on attack rolls, and on Wisdom (Perception) checks that rely on sight, when you, your target or what you try to perceive is in direct sunlight."]
def claw(n, die, typ, note):
    return [{"n": n, "die": die, "type": typ, "range": "5 ft", "ab": "STR", "note": note}]

# ---------------- Plain races
CAT = [DV60, ["Cat's Claws", "Your claws are natural weapons for Unarmed Strikes and deal 1d4 + Strength modifier Slashing damage instead of Bludgeoning."], ["Hunter's Senses", "Proficiency in Perception and Stealth."], ["Languages", "You speak, read and write Common."]]
DARAKHUL = [
 DV60,
 ["Hunger for Flesh", "You must eat 1 pound of raw meat each day or suffer starvation. After 24 hours without it you gain one level of Exhaustion. While you have any Exhaustion from this trait, you cannot regain hit points or remove Exhaustion until you spend at least 1 hour eating 10 pounds of raw meat."],
 ["Imperfect Undeath", "You are a humanoid, but your incomplete turn to undeath leaves you open to effects that target undead, such as Turn Undead. You still regain hit points from spells like cure wounds. Effects that raise the dead work normally but return you as a darakhul. True resurrection or wish can restore you as a living member of your original race."],
 ["Powerful Jaw", "Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning."],
 SUNS,
 ["Undead Resilience", "You have Resistance to Necrotic and Poison damage, immunity to disease, and Advantage on saves against being Charmed or Poisoned. When you finish a rest, you can reduce your Exhaustion by 1 if you ate at least 1 pound of raw meat in the last 24 hours."],
 ["Undead Vitality", "You do not need to breathe and do not sleep normally. Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. Afterward you gain what a human gets from 8 hours of sleep."],
]
def dk(asi, size, speed, extra, lang, **o):
    r = {"size": size, "speed": speed, "dark": 60, "type": "Humanoid", "traits": DARAKHUL + extra + [["Languages", "You speak, read and write Common, Darakhul and " + lang + "."]],
         "hb": "ToH", "asi": asi, "lgf": ["Common", "Darakhul"], "attacks": claw("Bite", "1d4", "Piercing", "Your jaw is a natural weapon. Piercing damage replaces the normal Bludgeoning damage of an Unarmed Strike.")}
    r.update(o); return r
GEAR_T = [
 ["Construct Resilience", "You have Resistance to Poison damage, immunity to disease, and Advantage on saves against being Poisoned."],
 ["Construct Vitality", "You need no food, drink or air and do not sleep normally. You go dormant like a statue, semiconscious, for 6 hours a day while your soul gem and springs repair your body. You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep."],
 ["Living Construct", "You are a living creature with some benefits and drawbacks of a construct. You regain hit points from spells like cure wounds, but effects that target constructs, such as shatter, also affect you. While your soul gem is intact, raising effects repair your body and return you as a gearforged. If only your body is destroyed, the soul gem and memory gears can go into a new body with a one-day ritual using 10,000 gp of materials. If the gem is destroyed, only wish can restore you, as a living member of your original race."],
]
def gf(asi, size, speed, dark, extra, lang, **o):
    t = ([["Darkvision", "Darkvision out to 60 ft."]] if dark else []) + GEAR_T + extra + [["Languages", "You speak, read and write Common, Machine Speech (a whistling, clicking tongue that only gearforged follow) and " + lang + "."]]
    r = {"size": size, "speed": speed, "dark": 60 if dark else 0, "type": "Construct", "traits": t, "hb": "ToH", "asi": asi, "lgf": ["Common", "Machine Speech"]}
    r.update(o); return r

DWARF_T = [DV60, ["Dwarven Resilience", "Advantage on saves against poison and Resistance to Poison damage."], ["Dwarven Combat Training", "Proficiency with the battleaxe, handaxe, light hammer and warhammer."], ["Tool Proficiency", "Proficiency with smith's tools, brewer's supplies or mason's tools (your choice)."], ["Stonecunning", "On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus."]]
ELF_T = [DV60, ["Keen Senses", "Proficiency in Perception."], ["Fey Ancestry", "Advantage on saves against being Charmed, and magic cannot put you to sleep."], ["Trance", "You meditate for 4 hours instead of sleeping and get the benefit of 8 hours of sleep."]]
GNOME_T = [DV60, ["Gnome Cunning", "Advantage on Intelligence, Wisdom and Charisma saves against magic."]]
HALF_T = [["Lucky", "When you roll a 1 on an attack roll, ability check or saving throw, reroll the die and use the new roll."], ["Brave", "Advantage on saves against being Frightened."], ["Halfling Nimbleness", "You can move through the space of any creature larger than you."]]

SPECIES = {
 "Alseid": {"size": "Medium", "speed": 40, "dark": 60, "type": "Humanoid", "skills": ["Stealth"], "profs": {"weapons": "Spear, Shortbow"},
   "traits": [DV60, ["Alseid Weapon Training", "Proficiency with the spear and shortbow."], ["Light Hooves", "Proficiency in Stealth."],
              ["Quadruped", "Humanoid structures are awkward for you. You must squeeze through trapdoors, manholes and similar openings even if a Medium humanoid would not. Ladders, stairs and similar structures are difficult terrain for you."],
              ["Woodfriend", "In a forest you leave no tracks and always know true north."],
              ["Languages", "You speak, read and write Common and Elvish."]],
   "hb": "ToH", "asi": {"DEX": 2, "WIS": 1}, "lgf": ["Common", "Elvish"]},
 "Erina": {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "skills": ["Perception"], "asiPick": {"n": 1, "v": 1, "from": ["WIS", "CHA"]},
   "fx": {"moves": {"burrow": 20}},
   "traits": [DV60, ["Hardy", "Advantage on saves against poison and Resistance to Poison damage."],
              ["Spines", "Needle-sharp spines grow on your head and back. While you grapple a creature or one grapples you, it takes 1d4 Piercing damage at the start of your turn."],
              ["Keen Senses", "Proficiency in Perception."], ["Digger", "Burrow Speed 20 feet, through earth and sand only, not mud, ice or rock."],
              ["Languages", "You speak Erina and your choice of Common or Sylvan."]],
   "hb": "ToH", "asi": {"DEX": 2}, "lgf": ["Erina"], "lgn": 1},
 "Satarre": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Arcana"], "skillPick": {"n": 1, "from": ["History", "Insight", "Religion"], "label": "Keeper of Secrets"},
   "traits": [DV60, ["A Friend to Death", "Resistance to Necrotic damage."],
              ["Keeper of Secrets", "Proficiency in Arcana, and Advantage on Arcana checks about the planes and planar travel. You also gain proficiency in History, Insight or Religion (your choice)."],
              ["Carrier of Rot", "As an action, rot a creature you can see within 10 feet. It makes a Constitution save (DC 8 + Constitution modifier + Proficiency Bonus), taking 1d4 Necrotic damage on a failure or half on a success. On a failure it also rots for 1 minute, taking 1d4 Necrotic damage at the end of each of its turns. The target, or a creature within 5 feet of it, can use an action to cut out the rot with a Medicine check against the same DC. Magical healing also ends it. The damage becomes 2d4 at level 6, 3d4 at level 11 and 4d4 at level 16. You regain this on a rest."],
              ["Languages", "You speak, read and write Common and Abyssal, Infernal or Void Speech."]],
   "hb": "ToH", "asi": {"CON": 2, "INT": 1}, "lgf": ["Common"], "lgn": 1},
 "Shade": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "asiPick": {"n": 1, "v": 1, "ex": ["CHA"]},
   "traits": [DV60,
              ["Ghostly Flesh", "From level 3, use an action to turn your body into translucent, colorless spirit stuff, chilling the air around you. It lasts 1 minute or until you end it as a bonus action. You gain a Fly Speed of 30 feet with hover, Resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks not made with silvered weapons, Advantage on checks and saves to escape a grapple or the Restrained condition, and you can move through creatures and solid objects as through difficult terrain. If you end your turn inside an object, you take 1d10 Force damage. You regain this on a rest."],
              ["Imperfect Undeath", "You are a humanoid, but your partial turn to undeath leaves you open to effects that target undead, such as Turn Undead. You still regain hit points from spells like cure wounds. Effects that raise the dead work normally but return you as a shade. True resurrection or wish can restore you as a living member of your original race."],
              ["Life Drain", "When you damage a creature with an attack or spell, you can deal extra Necrotic damage equal to your level. If the creature's race matches your Living Origin, you gain temporary hit points equal to that damage. You regain this on a rest."],
              ["Spectral Resilience", "Advantage on saves against poison and disease, and Resistance to Necrotic damage."],
              ["Living Origin", "Pick another race as the one you were in life. Your size and speed are those of that race, and you know one language it speaks."],
              ["Languages", "You speak, read and write Common and one language of your Living Origin."]],
   "hb": "ToH", "asi": {"CHA": 2}, "lgf": ["Common"], "lgn": 1},

 # Catfolk
 "Malkin Catfolk": {"size": "Small", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Perception", "Stealth", "Investigation"], "attacks": claw("Cat's Claws", "1d4", "Slashing", "Your claws are natural weapons. Slashing damage replaces the normal Bludgeoning damage of an Unarmed Strike."),
   "traits": CAT[:-1] + [["Curiously Clever", "Proficiency in Investigation."], ["Charmed Curiosity", "When you roll a 1 on a Dexterity check or saving throw, reroll the die and use the new roll."], CAT[-1]],
   "hb": "ToH", "asi": {"DEX": 2, "INT": 1}, "lgf": ["Common"]},
 "Pantheran Catfolk": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Perception", "Stealth"], "skillPick": {"n": 1, "from": ["Insight", "Medicine", "Nature", "Survival"], "label": "One With the Wilds"},
   "attacks": claw("Cat's Claws", "1d4", "Slashing", "Your claws are natural weapons. Slashing damage replaces the normal Bludgeoning damage of an Unarmed Strike."),
   "traits": CAT[:-1] + [["Hunter's Charge", "Once per turn, if you move at least 10 feet toward a target and hit it with a melee weapon attack, you can use a bonus action to attack it with Cat's Claws. You can do this a number of times equal to your Proficiency Bonus, and regain all uses on a rest."], ["One With the Wilds", "Proficiency in Insight, Medicine, Nature or Survival."], CAT[-1]],
   "hb": "ToH", "asi": {"DEX": 2, "WIS": 1}, "lgf": ["Common"]},

 # Darakhul heritages
 "Derro Heritage": dk({"CON": 1, "CHA": 2}, "Small", 30, [["Calculating Insanity", "You know true strike, with Charisma as its ability. You can cast it as a bonus action a number of times equal to your Charisma modifier (minimum once) and regain all uses on a rest."]], "Dwarvish", lgf=None),
 "Dragonborn Heritage": dk({"CON": 1, "STR": 2}, "Medium", 25, [["Corrupted Bite", "Your breath weapon is twisted by necrosis and oozes from your maw. As a bonus action, breathe necrotic energy onto your fangs and make one bite attack. If it hits, it deals extra Necrotic damage equal to your level. You regain this on a rest."], ["Heavy Armor Stride", "Your Speed is not reduced by wearing heavy armor."]], "Draconic"),
 "Drow Heritage": dk({"CON": 1, "INT": 2}, "Medium", 30, [["Poison Bite", "When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. You regain this on a rest."]], "Elvish"),
 "Dwarf Heritage": dk({"CON": 1, "WIS": 2}, "Medium", 25, [["Dwarven Stoutness", "Your hit point maximum rises by 1, and by 1 more each level."], ["Heavy Armor Stride", "Your Speed is not reduced by wearing heavy armor."]], "Dwarvish"),
 "Elf/Shadow Fey Heritage": dk({"CON": 1, "DEX": 2}, "Medium", 30, [["Supernatural Senses", "You can smell blood in the air. Proficiency in Perception, and Advantage on Perception checks to notice or find a creature within 30 feet that lacks some of its hit points."]], "Elvish (elf) or Umbral (shadow fey)", skills=["Perception"]),
 "Gnome Heritage": dk({"CON": 1, "INT": 2}, "Small", 25, [["Magical Hunger", "When a creature you can see within 30 feet casts a spell, use a Reaction to consume its residual magic. This does not counter or change the spell. You gain temporary hit points equal to your Constitution modifier (minimum 1). You regain this on a rest."]], "Gnomish"),
 "Halfling Heritage": dk({"CON": 1, "DEX": 2}, "Small", 25, [["Ill Fortune", "When a creature rolls a natural 20 on an attack roll against you, it must reroll and use the new roll. If the new roll misses you, the attacker takes Necrotic damage equal to twice your Constitution modifier (minimum 2)."]], "Halfling"),
 "Human/Half-Elf Heritage": dk({"CON": 1}, "Medium", 30, [["Versatility", "Proficiency in two skills and one tool of your choice."]], "one other language of your choice", asiPick={"n": 2, "v": 1, "from": ["STR", "DEX", "INT", "WIS", "CHA"]}, skillPick={"n": 2, "from": ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], "label": "Versatility"}, toolPick={"n": 1, "cats": ["art", "music", "game", "other"], "label": "Versatility"}),
 "Kobold Heritage": dk({"CON": 1, "INT": 2}, "Small", 30, [["Devious Bite", "When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage."]], "Draconic"),
 "Ravenfolk Heritage": dk({"CON": 1, "DEX": 2}, "Medium", 30, [["Sudden Bite and Flight", "If you surprise a creature in the first round of combat, you can make a bite attack as a bonus action. If it hits, you can immediately take the Dodge action as a Reaction."]], "Huginn's Speech"),
 "Tiefling Heritage": dk({"CON": 1, "CHA": 2}, "Medium", 30, [["Necrotic Rebuke", "When a weapon attack hits you, use a Reaction to wrap the attacker in shadowy flame. It takes Necrotic damage equal to your Charisma modifier (minimum 1) and has Disadvantage on attack rolls until the end of its next turn. You regain this on a rest."]], "Infernal"),
 "Trollkin Heritage": dk({"CON": 1, "STR": 2}, "Medium", 30, [["Regenerative Bite", "As an action, make a bite attack against a creature that is not undead or a construct. On a hit, you regain hit points (minimum 1) equal to half the damage dealt. You regain this on a rest."]], "Trollkin"),

 # Derro
 "Far-Touched Derro": {"size": "Small", "speed": 30, "dark": 120, "type": "Humanoid", "spAb": "CHA",
   "traits": [DV120, ["Eldritch Resilience", "Advantage on Constitution saves against spells."], SUNS,
              ["Insanity", "Advantage on saves against being Charmed or Frightened. You can read and understand Void Speech, but can speak only the few words needed for your Mad Fervor spells."],
              ["Mad Fervor", "You know vicious mockery. At level 3 you can cast enthrall, and at level 5 fear, once each per rest. Charisma is your spellcasting ability."],
              ["Languages", "You speak, read and write Dwarvish and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"DEX": 2, "CHA": 1}, "lgf": ["Dwarvish"], "lgn": 1},
 "Mutated Derro": {"size": "Small", "speed": 30, "dark": 120, "type": "Humanoid", "skills": ["Athletics"],
   "opts": None,
   "traits": [DV120, ["Eldritch Resilience", "Advantage on Constitution saves against spells."], SUNS,
              ["Athletic Training", "Proficiency in Athletics and with two martial weapons of your choice."],
              ["Otherworldly Influence", "Your link to your people's strange powers has mutated you. Pick one. Alien Appendage: a tentacle-like growth that is a natural weapon for Unarmed Strikes, dealing 1d4 + Strength modifier Bludgeoning damage with 5 feet of reach. It lifts pounds equal to double your Strength score, but cannot wield weapons or shields or do delicate work such as spell somatic components, though it can open an unlocked door, stow or fetch an object or pour out a vial. Tainted Blood: when you take Piercing or Slashing damage, use a Reaction to spray blood so you and each creature within 5 feet take Necrotic damage equal to your level, once per rest. Tenebrous Flesh: your rubbery, dark skin gives +1 to AC."],
              ["Languages", "You speak, read and write Dwarvish and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"DEX": 2, "STR": 1}, "lgf": ["Dwarvish"], "lgn": 1},
 "Uncorrupted Derro": {"size": "Small", "speed": 30, "dark": 120, "type": "Humanoid", "skills": ["Insight"],
   "traits": [DV120, ["Eldritch Resilience", "Advantage on Constitution saves against spells."], SUNS,
              ["Extra Language", "You speak, read and write one extra language of your choice."],
              ["Psychic Barrier", "Resistance to Psychic damage, and Advantage on ability checks and saves against effects that cause insanity, such as contact other plane, symbol, and effects that cause short-term, long-term or indefinite madness."],
              ["Studied Insight", "Proficiency in Insight. If you study a creature for at least 1 minute, you have Advantage on Initiative against it for the next hour."],
              ["Languages", "You speak, read and write Dwarvish, your choice of Common or Undercommon, and one extra language."]],
   "hb": "ToH", "asi": {"DEX": 2, "WIS": 1}, "lgf": ["Dwarvish"], "lgn": 2},

 # Drow (the Tome of Heroes drow castes)
 "Delver Drow": {"size": "Medium", "speed": 30, "dark": 120, "type": "Humanoid", "asiPick": {"n": 1, "v": 1, "from": ["STR", "DEX"]},
   "skillPick": {"n": 1, "from": ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], "label": "Specialized Training"},
   "toolPick": {"n": 1, "cats": ["art", "music", "game", "other"], "label": "Specialized Training"},
   "traits": [DV120, ["Mind of Steel", "Advantage on Wisdom, Intelligence and Charisma saves against spells."], SUNS,
              ["Rapport with Insects", "You can share simple ideas with insect-like beasts of Intelligence 3 or lower, such as spiders, beetles, wasps, scorpions and centipedes, and understand their simple state in return, such as hungry, content or in danger. Delvers often keep them as pets, mounts or pack animals."],
              ["Specialized Training", "Proficiency in one skill and one tool of your choice."],
              ["Martial Excellence", "Proficiency with one martial weapon of your choice and with Light armor."],
              ["Languages", "You speak, read and write Elvish and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"INT": 2}, "lgf": ["Elvish"], "lgn": 1},
 "Fever-Bit Drow": {"size": "Medium", "speed": 30, "dark": 120, "type": "Humanoid",
   "traits": [DV120, ["Mind of Steel", "Advantage on Wisdom, Intelligence and Charisma saves against spells."], SUNS,
              ["Deathly Resilience", "Resistance to Necrotic damage, and Advantage on death saving throws."], ["Iron Constitution", "You are immune to disease."],
              ["Near-Death Experience", "Advantage on saves against being Frightened."],
              ["Languages", "You speak, read and write Elvish and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"INT": 2, "CON": 1}, "lgf": ["Elvish"], "lgn": 1},
 "Purified Drow": {"size": "Medium", "speed": 30, "dark": 120, "type": "Humanoid", "spAb": "INT", "skillPick": {"n": 2, "from": ["History", "Insight", "Performance", "Persuasion"], "label": "Born Leader"},
   "traits": [DV120, ["Mind of Steel", "Advantage on Wisdom, Intelligence and Charisma saves against spells."], SUNS,
              ["Innate Spellcasting", "You know poison spray. At level 3 you can cast suggestion, and at level 5 tongues, once each per rest. Intelligence is your spellcasting ability."],
              ["Born Leader", "Proficiency in two of History, Insight, Performance and Persuasion."],
              ["Languages", "You speak, read and write Elvish and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"INT": 2, "CHA": 1}, "lgf": ["Elvish"], "lgn": 1},

 # Dwarf, Elf, Gnome, Halfling subraces
 "Fireforge Dwarf": {"size": "Medium", "speed": 25, "dark": 0, "type": "Humanoid", "spAb": "INT", "toolPick": {"n": 1, "cats": ["art"], "label": "Expert Artisan"},
   "profs": {"weapons": "Battleaxe, Handaxe, Light Hammer, Warhammer"},
   "traits": [["Burned Vision", "You have no darkvision, unlike other dwarves."], DWARF_T[1], DWARF_T[2], DWARF_T[3], DWARF_T[4],
              ["Expert Artisan", "Proficiency with glassblower's tools or smith's tools. Pick one, and your Proficiency Bonus is doubled on ability checks that use it."],
              ["Forgeborn", "Resistance to Fire damage."],
              ["Reforge", "You know mending and can cast it as an action, but only to repair metal objects, such as joining the halves of a broken sword. Intelligence is its spellcasting ability."],
              ["Languages", "You speak, read and write Common, Dwarvish and Ignan."]],
   "hb": "ToH", "asi": {"CON": 2, "INT": 1}, "lgf": ["Common", "Dwarvish", "Ignan"]},
 "Spindrift Dwarf": {"size": "Medium", "speed": 25, "dark": 0, "type": "Humanoid", "toolPick": {"n": 1, "cats": ["other"], "label": "Nautical Proficiency"},
   "profs": {"weapons": "Club, Handaxe, Hand Crossbow, Net, Rapier, Scimitar"},
   "fx": {"notes": [["Note", "Rigger: Climb Speed equal to your Speed while not wearing Heavy armor or using a shield"]]},
   "traits": [["Sailor's Eyes", "You have no darkvision, unlike other dwarves."], DWARF_T[1],
              ["Dwarven Marine Training", "Proficiency with the club, handaxe, hand crossbow, net, rapier and scimitar. This replaces Dwarven Combat Training."],
              ["Nautical Proficiency", "Proficiency with carpenter's tools, navigator's tools or woodcarver's tools (your choice), and with water vehicles. This replaces Tool Proficiency."],
              ["Rigger", "While you wear no Heavy armor and use no shield, you have a Climb Speed equal to your walking Speed."],
              ["Shipwright", "On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. This replaces Stonecunning."],
              ["Spindrift Step", "As a bonus action, or a Reaction while submerged, you can walk on water as if solid for a number of rounds equal to your level or until your Concentration ends, as for a spell. If you are submerged when you use it, you rise to the surface at 60 feet per round. You regain this on a rest."],
              ["Languages", "You speak, read and write Common and Dwarvish."]],
   "hb": "ToH", "asi": {"CON": 2, "DEX": 1}, "lgf": ["Common", "Dwarvish"]},
 "Dunewalker Elf": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Perception", "Survival"], "profs": {"weapons": "Longbow, Scimitar, Shortbow, Spear"},
   "traits": [DV60, ELF_T[1], ELF_T[2], ELF_T[3],
              ["Desert Dweller", "You suffer no ill effects from high temperatures and need no extra water in them. Proficiency in Survival."],
              ["Desert Mirage", "Outdoors in a sunny area warmer than freezing, use a bonus action to raise a natural mirage around you and up to a number of allies within 10 feet equal to your Proficiency Bonus. For 1 minute it hides each of you from creatures more than 30 feet away, and each target can try to hide even if only the mirage obscures it. You regain this on a rest."],
              ["Dunewalker Elf Weapon Training", "Proficiency with the longbow, scimitar, shortbow and spear."],
              ["Sand Spirit", "Difficult terrain of sand or similar desert ground costs you no extra movement."],
              ["Languages", "You speak, read and write Common and Elvish."]],
   "hb": "ToH", "asi": {"DEX": 2, "WIS": 1}, "lgf": ["Common", "Elvish"]},
 "Frostfell Elf": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Perception"], "profs": {"weapons": "Longsword, Shortsword, Shortbow, Longbow"},
   "traits": [DV60, ELF_T[1], ELF_T[2], ELF_T[3], ["Cold Dweller", "Resistance to Cold damage."], ["Elf Weapon Training", "Proficiency with the longsword, shortsword, shortbow and longbow."],
              ["Ice Crafting", "You can magically form an item from nearby water, ice or snow. It takes 1 minute and can be any nonmagical object without moving parts, up to 10 pounds. Though made of ice, it works like a normal item of that kind. It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. Above freezing it lasts 1 minute, and at freezing or colder it lasts 24 hours or until destroyed. You regain this on a rest."],
              ["Snow Step", "Difficult terrain of snow or ice costs you no extra movement."],
              ["Languages", "You speak, read and write Common and Elvish."]],
   "hb": "ToH", "asi": {"DEX": 2, "CON": 1}, "lgf": ["Common", "Elvish"]},
 "Shoal Gnome": {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "fx": {"moves": {"swim": 25}},
   "traits": [DV60, GNOME_T[1], ["Amphibious", "You can breathe air and water."], ["Aquatic Beast Affinity", "With sounds and gestures you can share simple ideas with dolphins, sea turtles and beasts that breathe water."], ["Swimmer", "Swim Speed 25 feet."],
              ["Languages", "You speak, read and write Common and Gnomish."]],
   "hb": "ToH", "asi": {"INT": 2, "CHA": 1}, "lgf": ["Common", "Gnomish"]},
 "Wyrd Gnome": {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "spAb": "WIS",
   "traits": [DV60, GNOME_T[1],
              ["Natural Diviner", "You know guidance. At level 3 you can cast identify with no material components, and at level 5 augury, once each per rest. Wisdom is your spellcasting ability."],
              ["Prescience", "When you finish a rest, roll a d20 and record it. Before your next Long Rest, you can replace one attack roll, saving throw or ability check made by you or a creature you can see with that roll, choosing before the roll. If 20 wyrd gnomes are within a half-mile when you roll, add 1. Each doubling of the number nearby adds 1 more (+2 for 40, +3 for 80), to a maximum of +5."],
              ["Languages", "You speak, read and write Common and Gnomish."]],
   "hb": "ToH", "asi": {"INT": 2, "WIS": 1}, "lgf": ["Common", "Gnomish"]},
 "Courtfolk Halfling": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid",
   "traits": HALF_T + [["Boon Companion", "When you help an ally with a task or take the Help action in combat, the ally adds a d4 to the check or attack roll."], ["Wee Glamour", "A touch of elven magic: Advantage on saves against being Charmed and against enchantment spells."], ["Languages", "You speak, read and write Common and Halfling."]],
   "hb": "ToH", "asi": {"DEX": 2, "CHA": 1}, "lgf": ["Common", "Halfling"]},
 "Hinterfolk Halfling": {"size": "Small", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Survival"], "fx": {"moves": {"climb": 20, "swim": 20}},
   "traits": HALF_T + [["Highly Mobile", "Your walking Speed is 30 feet. In Light armor or none, you have a Climb Speed and a Swim Speed of 20 feet."], ["Hunter and Gatherer", "Proficiency in Survival."], ["Languages", "You speak, read and write Common and Halfling."]],
   "hb": "ToH", "asi": {"DEX": 2, "STR": 1}, "lgf": ["Common", "Halfling"]},
 "Riverfolk Halfling": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid", "profs": {"weapons": "Barge Pole"},
   "traits": HALF_T + [["River's Child", "Advantage on Athletics checks to swim and on Animal Handling checks with animals native to rivers or riverbanks. Proficiency with the barge pole."], ["Sure-Footed", "Advantage on Acrobatics checks to keep your balance. Difficult terrain of slippery surfaces, such as a wet deck, frozen lake or oily dock, costs you no extra movement."], ["Languages", "You speak, read and write Common and Halfling."]],
   "hb": "ToH", "asi": {"DEX": 2, "STR": 1}, "lgf": ["Common", "Halfling"]},
 "Urban Halfling": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid", "skillPick": {"n": 1, "from": ["Acrobatics", "Animal Handling", "Medicine", "Performance", "Persuasion"], "label": "Family Business"},
   "toolPick": {"n": 1, "cats": ["art", "music", "game", "other"], "label": "Family Business"},
   "traits": HALF_T + [["Family Business", "Proficiency with one tool of your choice, or in Acrobatics, Animal Handling, Medicine, Performance or Persuasion."], ["Lost in the Crowd", "In a crowded area, such as a city street or a gathering of at least 10 humanoids, you can try to hide, blending in with the people around you."], ["Street Cant", "You know the secret creole your people use, halfling mixed with Common and words from other tongues. Only creatures that know it understand you when you speak it, though magic can reveal the conversation."], ["Languages", "You speak, read and write Common, Halfling and Street Cant."]],
   "hb": "ToH", "asi": {"DEX": 2, "INT": 1}, "lgf": ["Common", "Halfling", "Street Cant"]},
 "Winterfolk Halfling": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid",
   "traits": HALF_T + [["Hardened", "You recover from all Exhaustion at the end of a rest, and have Advantage on saves against the effects of a cold environment, such as frostbite and hypothermia."], ["Old Soul", "You can use your Wisdom modifier instead of Intelligence on History and Religion checks."], ["Languages", "You speak, read and write Common and Halfling."]],
   "hb": "ToH", "asi": {"DEX": 2, "CON": 1}, "lgf": ["Common", "Halfling"]},

 # Gearforged chassis
 "Dwarf Chassis": gf({"CON": 1}, "Medium", 25, True, [
   ["Always Armed", "Pick a weapon you are proficient with that is not Two-Handed and integrate it into one arm. While integrated, you cannot be disarmed of it, though you can use an action to remove it. You draw and sheathe it as normal, with it folding into or springing from your arm. While drawn, it is held in that hand, which you cannot use for other actions such as casting. You can integrate a new weapon or swap one with 1 hour of work, which can be during a rest."],
   ["Remembered Training", "Proficiency with two martial weapons of your choice and with Light and Medium armor."]], "Dwarvish", asiPick={"n": 2, "v": 1, "from": ["STR", "DEX", "CON", "INT", "WIS", "CHA"]}),
 "Gnome Chassis": gf({"INT": 1}, "Small", 25, True, [
   ["Mental Fortitude", "Pick Intelligence, Wisdom or Charisma. You have Advantage on saves with that ability against magic."],
   ["Quick Fix", "When you are below half your hit point maximum, use a bonus action to patch yourself up and gain temporary hit points equal to your Proficiency Bonus. You regain this on a rest."]], "Gnomish", asiPick={"n": 2, "v": 1, "from": ["STR", "DEX", "CON", "INT", "WIS", "CHA"]}),
 "Human Chassis": gf({}, "Medium", 30, False, [
   ["Adaptable Acumen", "Proficiency in two skills or tools of your choice. Pick one of them, or another skill or tool you are proficient in, and your Proficiency Bonus is doubled on checks that use it."],
   ["Inspired Ingenuity", "When you roll 9 or lower on the d20 for an ability check, use a Reaction to make it a 10. You regain this on a rest."]], "one extra language of your choice", asiPick={"n": 3, "v": 1, "from": ["STR", "DEX", "CON", "INT", "WIS", "CHA"]}, lgn=1),
 "Kobold Chassis": gf({"DEX": 1}, "Small", 30, True, [
   ["Clutch Aide", "You can take the Help action as a bonus action."],
   ["Resourceful", "If you have at least one set of tools, you can cobble together a makeshift set of a different kind with 1 minute of work. It lasts 10 minutes, then falls apart, and you cannot use the set you built it from while it exists. The GM can rule that some tools, like an alchemist's alembic or a disguise kit's cosmetics, cannot be copied. A creature other than you has Disadvantage on checks with the makeshift tools."]], "Draconic", asiPick={"n": 2, "v": 1, "from": ["STR", "DEX", "CON", "INT", "WIS", "CHA"]}),

 # Minotaur
 "Bhain Kwai Minotaur": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "fx": {"moves": {"swim": 25}}, "attacks": claw("Horns", "1d6", "Piercing", "Your horns are natural weapons. Piercing damage replaces the normal Bludgeoning damage of an Unarmed Strike."),
   "traits": [DV60, ["Natural Attacks", "Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage."], ["Charge", "Once per turn, if you move at least 10 feet toward a target and hit it with your horns, you deal an extra 1d6 Piercing damage and can shove it up to 5 feet as a bonus action (10 feet from level 11). You can do this a number of times per day equal to your Constitution modifier (minimum once), and regain all uses on a rest."], ["Labyrinth Sense", "You can retrace any path you have taken without error, with no check."],
              ["Strong Back", "Your carrying capacity is your Strength score times 20 instead of 15."], ["Wetland Dweller", "Difficult terrain of mud or wading through water up to waist deep costs you no extra movement. Swim Speed 25 feet."],
              ["Languages", "You speak, read and write Common and Minotaur."]],
   "hb": "ToH", "asi": {"STR": 3, "CON": 3}, "lgf": ["Common", "Minotaur"]},
 "Boghaid Minotaur": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Performance"], "toolPick": {"n": 1, "cats": ["music"], "label": "Storied Culture"}, "attacks": claw("Horns", "1d6", "Piercing", "Your horns are natural weapons. Piercing damage replaces the normal Bludgeoning damage of an Unarmed Strike."),
   "traits": [DV60, ["Natural Attacks", "Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage."], ["Charge", "Once per turn, if you move at least 10 feet toward a target and hit it with your horns, you deal an extra 1d6 Piercing damage and can shove it up to 5 feet as a bonus action (10 feet from level 11). You can do this a number of times per day equal to your Constitution modifier (minimum once), and regain all uses on a rest."], ["Labyrinth Sense", "You can retrace any path you have taken without error, with no check."],
              ["Highlander", "You suffer no ill effects from elevations above 8,000 feet."], ["Storied Culture", "Proficiency in Performance and in one of bagpipes, drum, horn or shawm."], ["Wooly", "Your thick coat keeps you warm in cold weather without special gear, and gives Advantage on saves against spells and effects that deal Cold damage."],
              ["Languages", "You speak, read and write Common and Minotaur."]],
   "hb": "ToH", "asi": {"STR": 2, "WIS": 2, "CON": 2}, "lgf": ["Common", "Minotaur"]},

 # Mushroomfolk
 "Acid Cap Mushroomfolk": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Survival", "Athletics"],
   "traits": [DV60, ["Fungoid Form", "Advantage on saves against poison, Resistance to Poison damage, and immunity to disease."], ["Hardy Survivor", "Proficiency in Survival."],
              ["Acid Cap Resistance", "Resistance to Acid damage."], ["Acid Spores", "When a melee weapon attack hits you, use a Reaction to release acid spores. The attacker takes Acid damage equal to half your level, rounded up. You can do this a number of times equal to your Constitution modifier (minimum once) and regain all uses on a rest."], ["Clan Athlete", "Proficiency in Athletics."],
              ["Languages", "You speak, read and write Mushroomfolk and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"WIS": 2, "STR": 1}, "lgf": ["Mushroomfolk"], "lgn": 1},
 "Favored Mushroomfolk": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "skills": ["Survival", "Persuasion"], "spAb": "CHA",
   "traits": [DV60, ["Fungoid Form", "Advantage on saves against poison, Resistance to Poison damage, and immunity to disease."], ["Hardy Survivor", "Proficiency in Survival."],
              ["Blessed Help", "You know spare the dying. At level 3 you can cast bless once per rest. Charisma is your spellcasting ability."], ["Clan Leader", "Proficiency in Persuasion."],
              ["Restful Spores", "If you or friendly creatures within 30 feet spend Hit Dice to regain hit points at the end of a rest, each regains extra hit points equal to your Proficiency Bonus. A creature that benefits cannot do so again until it finishes a rest."],
              ["Languages", "You speak, read and write Mushroomfolk and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"WIS": 2, "CHA": 1}, "lgf": ["Mushroomfolk"], "lgn": 1},
 "Morel Mushroomfolk": {"size": "Small", "speed": 35, "dark": 60, "type": "Humanoid", "skills": ["Survival", "Stealth"],
   "traits": [DV60, ["Fungoid Form", "Advantage on saves against poison, Resistance to Poison damage, and immunity to disease."], ["Hardy Survivor", "Proficiency in Survival."],
              ["Adaptable Camouflage", "If you spend at least 1 minute in an area with plenty of natural plants or fungi, such as grassland, forest or a fungal cavern, you can shift your coloring to match. You then have Advantage on Stealth checks there for the next 24 hours."], ["Clan Scout", "Proficiency in Stealth."],
              ["Languages", "You speak, read and write Mushroomfolk and your choice of Common or Undercommon."]],
   "hb": "ToH", "asi": {"WIS": 2, "DEX": 1}, "lgf": ["Mushroomfolk"], "lgn": 1},
}
# keys the engine does not read are dropped
for _k, _v in SPECIES.items():
    for _x in ("opts",):
        if _x in _v and _v[_x] is None: del _v[_x]
    if _v.get("lgf") is None: _v.pop("lgf", None)

DEF = {}
for _n, _r in (("Derro Heritage", [["Resistance", "Necrotic"], ["Resistance", "Poison"]]),):
    pass
for _n in SPECIES:
    if _n.endswith("Heritage"): DEF[_n] = [["Resistance", "Necrotic"], ["Resistance", "Poison"]]
for _n in ("Alseid",): pass
DEF.update({
 "Erina": [["Resistance", "Poison"]], "Satarre": [["Resistance", "Necrotic"]], "Shade": [["Resistance", "Necrotic"]],
 "Fever-Bit Drow": [["Resistance", "Necrotic"]], "Fireforge Dwarf": [["Resistance", "Poison"], ["Resistance", "Fire"]], "Spindrift Dwarf": [["Resistance", "Poison"]],
 "Frostfell Elf": [["Resistance", "Cold"]], "Uncorrupted Derro": [["Resistance", "Psychic"]],
 "Acid Cap Mushroomfolk": [["Resistance", "Poison"], ["Resistance", "Acid"]], "Favored Mushroomfolk": [["Resistance", "Poison"]], "Morel Mushroomfolk": [["Resistance", "Poison"]],
 "Dwarf Chassis": [["Resistance", "Poison"]], "Gnome Chassis": [["Resistance", "Poison"]], "Human Chassis": [["Resistance", "Poison"]], "Kobold Chassis": [["Resistance", "Poison"]],
})

LU = [
 {"src": "species", "owner": "Satarre", "feature": "Carrier of Rot", "n": "Carrier of Rot", "lvl": 1, "max": 1, "reset": "long", "tag": "Action"},
 {"src": "species", "owner": "Shade", "feature": "Ghostly Flesh", "n": "Ghostly Flesh", "lvl": 3, "max": 1, "reset": "long", "tag": "Action, 1 minute"},
 {"src": "species", "owner": "Shade", "feature": "Life Drain", "n": "Life Drain", "lvl": 1, "max": 1, "reset": "long", "tag": "Extra Necrotic damage"},
 {"src": "species", "owner": "Pantheran Catfolk", "feature": "Hunter's Charge", "n": "Hunter's Charge", "lvl": 1, "max": "pb", "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Bhain Kwai Minotaur", "feature": "Charge", "n": "Charge", "lvl": 1, "max": "mod:CON", "reset": "long", "tag": "Extra 1d6 Piercing"},
 {"src": "species", "owner": "Boghaid Minotaur", "feature": "Charge", "n": "Charge", "lvl": 1, "max": "mod:CON", "reset": "long", "tag": "Extra 1d6 Piercing"},
 {"src": "species", "owner": "Acid Cap Mushroomfolk", "feature": "Acid Spores", "n": "Acid Spores", "lvl": 1, "max": "mod:CON", "reset": "long", "tag": "Reaction"},
 {"src": "species", "owner": "Favored Mushroomfolk", "feature": "Blessed Help", "n": "Blessed Help: Bless", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Far-Touched Derro", "feature": "Mad Fervor", "n": "Mad Fervor: Enthrall", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Far-Touched Derro", "feature": "Mad Fervor", "n": "Mad Fervor: Fear", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Purified Drow", "feature": "Innate Spellcasting", "n": "Innate Spellcasting: Suggestion", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Purified Drow", "feature": "Innate Spellcasting", "n": "Innate Spellcasting: Tongues", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Wyrd Gnome", "feature": "Natural Diviner", "n": "Natural Diviner: Identify", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Wyrd Gnome", "feature": "Natural Diviner", "n": "Natural Diviner: Augury", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Frostfell Elf", "feature": "Ice Crafting", "n": "Ice Crafting", "lvl": 1, "max": 1, "reset": "long", "tag": "1 minute"},
 {"src": "species", "owner": "Dunewalker Elf", "feature": "Desert Mirage", "n": "Desert Mirage", "lvl": 1, "max": 1, "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Spindrift Dwarf", "feature": "Spindrift Step", "n": "Spindrift Step", "lvl": 1, "max": 1, "reset": "long", "tag": "Bonus Action or Reaction"},
 {"src": "species", "owner": "Human Chassis", "feature": "Inspired Ingenuity", "n": "Inspired Ingenuity", "lvl": 1, "max": 1, "reset": "long", "tag": "Reaction"},
 {"src": "species", "owner": "Gnome Chassis", "feature": "Quick Fix", "n": "Quick Fix", "lvl": 1, "max": 1, "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Derro Heritage", "feature": "Calculating Insanity", "n": "Calculating Insanity", "lvl": 1, "max": "mod:CHA", "reset": "long", "tag": "True Strike, Bonus Action"},
 {"src": "species", "owner": "Dragonborn Heritage", "feature": "Corrupted Bite", "n": "Corrupted Bite", "lvl": 1, "max": 1, "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Drow Heritage", "feature": "Poison Bite", "n": "Poison Bite", "lvl": 1, "max": 1, "reset": "long", "tag": "Extra Poison damage"},
 {"src": "species", "owner": "Gnome Heritage", "feature": "Magical Hunger", "n": "Magical Hunger", "lvl": 1, "max": 1, "reset": "long", "tag": "Reaction"},
 {"src": "species", "owner": "Tiefling Heritage", "feature": "Necrotic Rebuke", "n": "Necrotic Rebuke", "lvl": 1, "max": 1, "reset": "long", "tag": "Reaction"},
 {"src": "species", "owner": "Trollkin Heritage", "feature": "Regenerative Bite", "n": "Regenerative Bite", "lvl": 1, "max": 1, "reset": "long", "tag": "Action"},
]
ACTS = {
 "sp|Satarre|Carrier of Rot": [["action", "", "Carrier of Rot"]], "sp|Shade|Ghostly Flesh": [["action", "", "Ghostly Flesh"]],
 "sp|Pantheran Catfolk|Hunter's Charge": [["bonus", "", "Hunter's Charge"]], "sp|Dunewalker Elf|Desert Mirage": [["bonus", "", "Desert Mirage"]],
 "sp|Gnome Chassis|Quick Fix": [["bonus", "", "Quick Fix"]], "sp|Human Chassis|Inspired Ingenuity": [["reaction", "", "Inspired Ingenuity"]],
 "sp|Kobold Chassis|Clutch Aide": [["bonus", "", "Clutch Aide (Help)"]], "sp|Acid Cap Mushroomfolk|Acid Spores": [["reaction", "", "Acid Spores"]],
 "sp|Dragonborn Heritage|Corrupted Bite": [["bonus", "", "Corrupted Bite"]], "sp|Tiefling Heritage|Necrotic Rebuke": [["reaction", "", "Necrotic Rebuke"]],
 "sp|Trollkin Heritage|Regenerative Bite": [["action", "", "Regenerative Bite"]], "sp|Gnome Heritage|Magical Hunger": [["reaction", "", "Magical Hunger"]],
 "sp|Derro Heritage|Calculating Insanity": [["bonus", "", "True Strike"]], "sp|Spindrift Dwarf|Spindrift Step": [["bonus", "", "Spindrift Step"]],
}
SP_AUTO = {
 "Far-Touched Derro": {"": [[1, "Vicious Mockery"], [3, "Enthrall"], [5, "Fear"]]},
 "Purified Drow": {"": [[1, "Poison Spray"], [3, "Suggestion"], [5, "Tongues"]]},
 "Fireforge Dwarf": {"": [[1, "Mending"]]},
 "Wyrd Gnome": {"": [[1, "Guidance"], [3, "Identify"], [5, "Augury"]]},
 "Favored Mushroomfolk": {"": [[1, "Spare the Dying"], [3, "Bless"]]},
 "Derro Heritage": {"": [[1, "True Strike"]]},
}
GXSP = {
 "Erina": [{"n": "Hardy", "res": ["Poison"], "advOn": ["saves against poison"]}],
 "Fireforge Dwarf": [{"n": "Forgeborn", "res": ["Fire"]}],
 "Frostfell Elf": [{"n": "Cold Dweller", "res": ["Cold"]}],
 "Bhain Kwai Minotaur": [],
}
GXSP = {k: v for k, v in GXSP.items() if v}
