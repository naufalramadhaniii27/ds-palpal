# Own-wording items of the World of Warcraft sourcebook (2024). Row shape as tee24_item.py: [name, type, rarity, attune, text, opts].
# Every item of the book is built. Mounts and powered vehicles are gear rows (cost in gp, weight 0, the stat block is named in the text).
# Variant entries of the data (Ashbringer states, Shalamayne halves, Staff forms, the potion tiers) are their own rows.
ITEMS = []; SP = {}; WPN = {}; GEAR = []
MASTERY = {}
WDESC = {}

def add(name, typ, rar, att, text, **o):
    ITEMS.append((name, typ, rar, att, text, o))

ART = " **Random Properties.** The artifact carries random properties rolled with the DM."
ASH = " +3 to attack and damage rolls. A hit deals an extra 1d10 Fire damage, or 3d10 against Undead. The sword is sentient (Int 14, Wis 17, Cha 17, hearing and Darkvision 120 ft, speaks Common and Dwarvish, telepathy with its wielder). Its state changes at the DM's call after a legendary act of heroism (True) or wickedness (Corrupted)."
add("Ashbringer", "Weapon", "Artifact", 1, "A holy greatsword that fell to corruption and was cleansed again. Attune: Paladin." + ASH + " **Corrupted State.** When you reduce a creature to 0 Hit Points with it, gain 20 Temporary Hit Points. **True State.** When you reduce a creature to 0 Hit Points with it, its corpse can burst into ash: each creature of your choice in a 10-foot Emanation from the target makes a DC 18 Constitution save or is Blinded until the end of its next turn. It is Lawful Good in the True State and Lawful Evil in the Corrupted State." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Greatsword"], by="a Paladin", xd=["+1d10 Fire (3d10 vs Undead)"])
add("Ashbringer (True State)", "Weapon", "Artifact", 1, "Attune: Paladin. The cleansed form of Ashbringer." + ASH + " **Wake of Ashes.** When you reduce a creature to 0 Hit Points with it, its corpse can burst into ash: each creature of your choice in a 10-foot Emanation from the target makes a DC 18 Constitution save or is Blinded until the end of its next turn. It is Lawful Good." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Greatsword"], by="a Paladin", xd=["+1d10 Fire (3d10 vs Undead)"])
add("Corrupted Ashbringer", "Weapon", "Artifact", 1, "Attune: Paladin. The corrupted form of Ashbringer." + ASH + " **Steal Life.** When you reduce a creature to 0 Hit Points with it, gain 20 Temporary Hit Points. It is Lawful Evil." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Greatsword"], by="a Paladin", xd=["+1d10 Fire (3d10 vs Undead)"])
add("Aviana's Feather", "Wondrous Item", "Legendary", 1, "A golden feather. Magic action: grow golden wings that give a Fly Speed of 80 feet. Creatures that make an Opportunity Attack against you as you fly out of their reach have Disadvantage. If you fall with the wings, you descend 60 feet per round. They last until you end them with a Magic action or your attunement ends. If you are airborne when they vanish, you fall.")
add("Crown of the Ogre King", "Wondrous Item", "Very Rare", 1, "Worn on the head. Magic action: a loud belch heard 300 feet away. Each creature in a 20-foot Cone makes a DC 17 Strength save. On a failure it is pushed up to 20 feet and has the Prone condition. **Curse.** Attuning curses you until Remove Curse or similar magic. Removing the crown does not end it. While cursed you lose your table manners and your daily food need triples.")
add("Defias Leather", "Armor", "Rare", 0, "Leather Armor with AC 11. **Mason's Camouflage.** Advantage on Dexterity (Stealth) checks to hide against stone objects and structures. **Meld into Stone.** Cast Meld into Stone from it. After you do, finish the night to the next dawn before using it again.",
    base=["Leather Armor"], ch=[1, "1", "dawn"])
SP["Defias Leather"] = {"sp": [["Meld into Stone", 0]]}
add("Doomhammer", "Weapon", "Artifact", 1, "The warhammer of the Blackrock orcs. Attune: Barbarian. +3 to attack and damage rolls. A hit deals an extra 1d8 Lightning damage. **Doom Winds.** While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). **Lava Stride.** No damage from molten lava, and you can walk on it as solid ground. **Lightning Rod.** Reaction: when a creature you see within 60 feet would take Lightning damage, reduce it to 0. **Storm's Passage.** Cast Wind Walk from it once per dawn." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Warhammer"], by="a Barbarian", ch=[1, "1", "dawn", "Uses for Storm's Passage"], xd=["+1d8 Lightning"])
SP["Doomhammer"] = {"sp": [["Wind Walk", 0]]}
add("Experimental Goblin Jetpack", "Wondrous Item", "Rare", 1, "Worn on the back. Magic action: fire the jets for 1 hour or until you end them with a Magic action. They give a Fly Speed of 60 feet. If you are airborne when they stop, you fall. After they stop, you cannot use them for 1d12 hours.")
add("Figurine of Wondrous Power (Jeweled Panther)", "Wondrous Item", "Rare", 0, "A gem-like panther statuette. Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. You can ride it. The creature is friendly, understands your languages, obeys you and acts right after you in Initiative. It reverts when it drops to 0 Hit Points or when you touch it and use a Magic action. After it is used, wait 2 days.")
add("Flask of the Titans", "Potion", "Very Rare", 0, "Drink: your Hit Point maximum and current Hit Points rise by 30 for 1 hour.")
add("Frostmourne", "Weapon", "Artifact", 1, "A runed mourneblade that steals souls. +3 to attack and damage rolls. A hit deals an extra 2d12 Cold damage. A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. **Pawn of the Lich King.** While attuned, the Lich King can see through your eyes, hear through your ears and speak to you telepathically at any distance. **Prophecy of Frostmourne.** When you attune, your creature type becomes Undead and your alignment becomes Neutral Evil, even after attunement ends. **Twisted Aura (Paladin).** Undead of your choice (not you) in your Aura of Protection have Advantage on attack rolls and saving throws, and allies in it are immune to Cold damage. It shatters if its wielder dies to Ashbringer." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Greatsword"], xd=["+2d12 Cold"])
add("Gnomeregan Engineering Device", "Wand", "Rare", 0, "Reward for Renown 25+ with Gnomeregan. Before a quest for them you can ask for a device that works as a Wand of Wonder. It cannot regain charges and explodes harmlessly when its last charge is spent. It needs no attunement but works only for you.")
add("Goblin Jumper Cables", "Wondrous Item", "Uncommon", 0, "Magic action: attach the cables to a creature dead no longer than 1 minute (not from old age) and make a DC 15 Intelligence (Arcana) check with Tinker's Tools. On a success it revives with 1 Hit Point. On a failure you take 2d6 Lightning damage. Once used, they work again at the next dawn.", ch=[1, "1", "dawn"])
add("Hearthstone", "Wondrous Item", "Uncommon", 1, "Takes 1 minute and a Magic action to use. You teleport to a set place, usually an inn, appearing in an open space within 30 feet. At an inn or another place the DM allows, take a Magic action to set that place as the destination. One Hearthstone does not count against your attunement limit.")
add("Helm of Domination", "Wondrous Item", "Artifact", 1, "A helm of the Lich Kings. **Attuning.** Make a DC 18 Charisma save. On a success take 10d6 Psychic damage. On a failure the Lich King takes control and you become an NPC. While attuned you will not remove it and cannot end attunement. Your alignment is Neutral Evil. **Command the Scourge.** Magic action, once per dawn: an ability check with your spellcasting ability (DC 20) to command the Undead of the Scourge. **Truesight** 120 feet. **Spells.** 8 charges, regains 1d4 + 4 at dawn. Save DC 18. Animate Dead 1, Speak with Dead 1, Clairvoyance 2, Dream 4, Telepathy 5, Word of Recall 5. It breaks if struck by a blade forged in the Shadowlands." + ART,
    ch=[8, "1d4+4", "dawn"])
SP["Helm of Domination"] = {"sp": [["Animate Dead", 1], ["Speak with Dead", 1], ["Clairvoyance", 2], ["Dream", 4], ["Telepathy", 5], ["Word of Recall", 5]], "dc": 18}
add("Judgment Armor", "Armor", "Legendary", 0, "Plate Armor (AC 18, Strength 15, Stealth Disadvantage). While you wear it, you are under Detect Evil and Good and Protection from Evil and Good with no Concentration. If you are a Paladin, Protection from Evil and Good extends to creatures of your choice in your Aura of Protection.",
    base=["Plate Armor"])
add("Life-Staff of the Web Lair", "Weapon", "Legendary", 1, "A quarterstaff with 8 charges that regains 1d6 + 2 at dawn. On the last charge, roll 1d20: on a 1 it turns into harmless spiders and is destroyed. **Arachnid's Grace.** Climb walls and ceilings without hands, Climb Speed equal to your Speed, ignore web movement limits, and know where any creature touching the same web is. **Web.** Spend 1 charge to cast Web (DC 18). **Vampiric Silk.** Bonus Action, 1 charge: a creature in your Web makes a DC 18 Constitution save (Disadvantage if Restrained by the webbing). It takes 4d10 Necrotic damage on a failure, or half on a success. You regain Hit Points equal to half the damage.",
    fx={"climb": "walk"}, base=["Quarterstaff"], ch=[8, "1d6+2", "dawn"])
SP["Life-Staff of the Web Lair"] = {"sp": [["Web", 1]], "dc": 18}
add("Noggenfogger Elixir", "Potion", "Rare", 0, "Drink and roll 1d6. 1-2: you look skeletal for 1d4 hours and need no breath (no Exhaustion from it). 3-4: the Reduce effect of Enlarge/Reduce for 1d4 hours with no Concentration. 5-6: you fall 60 feet per round for 10 minutes and take no falling damage. It does not need a roll on the potion miscibility table.")
add("Philosopher's Stone", "Wondrous Item", "Very Rare", 1, "Attune: its creator. While you carry it you can use it as a Spellcasting Focus. **Transmute Resources.** Spend 1 hour (it can overlap a Short Rest) with resources of one kind (fish, gems, herbs, ore or stone, leather or hide, cloth) to turn them into another kind of equal value. **Mixology.** When you roll a die for a potion's effect, roll twice and pick one. A potion you drink lasts twice as long.", by="its creator")
add("Rod of the Sleepwalker", "Rod", "Very Rare", 0, "Cast Dominate Monster (DC 17) from it once per dawn with these changes. Duration is Concentration up to 8 hours. Creatures that do not sleep, such as elves, or that are immune to Exhaustion pass the save. The target remembers nothing of the duration.", ch=[1, "1", "dawn"])
SP["Rod of the Sleepwalker"] = {"sp": [["Dominate Monster", 0]], "dc": 17}
add("Shadowfang", "Weapon", "Rare", 0, "A longsword with +1 to attack and damage rolls. **Mark of the Worgen.** It looks plain, but under the night sky, fur and fangs grow around the guard. In that form it deals an extra 2d6 Necrotic damage on a hit. It returns to normal at dawn or indoors.",
    fx={"atk": 1, "dmg": 1}, base=["Longsword"], xd=["Under the night sky: +2d6 Necrotic"])
SHAL = " +3 to attack and damage rolls."
add("Shalamayne", "Weapon", "Artifact", 1, "The fused blade of Varian Wrynn." + SHAL + " A hit deals an extra 2d12 Force damage. **Dual Mastery.** With Weapon Mastery and Greatsword mastered, you use Graze and Sap together while wielding it. **Splitting.** Magic action: end attunement and split it into Shalamayne (Shalla'tor) and Shalamayne (Ellemayne), each a +3 Longsword with the Finesse and Light properties. A creature holding both can rejoin them with a Magic action and attune at once. Destroy it by splitting it and burying a blade at the roots of a World Tree in the Emerald Dream for a year." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Greatsword"], xd=["+2d12 Force"])
add("Shalamayne (Shalla'tor)", "Weapon", "Artifact", 0, "One half of Shalamayne. A +3 Longsword with the Finesse and Light properties." + SHAL + " A hit deals an extra 2d12 Force damage. A creature holding both halves can rejoin them with a Magic action and attune at once.",
    fx={"atk": 3, "dmg": 3}, base=["Longsword"], xd=["+2d12 Force"])
add("Shalamayne (Ellemayne)", "Weapon", "Artifact", 0, "The other half of Shalamayne. A +3 Longsword with the Finesse and Light properties." + SHAL + " A hit deals an extra 2d12 Force damage. A creature holding both halves can rejoin them with a Magic action and attune at once.",
    fx={"atk": 3, "dmg": 3}, base=["Longsword"], xd=["+2d12 Force"])
STF = "A quarterstaff with two states, Anathema and Benediction. While attuned you can switch states at dawn. Attune: Cleric. "
add("Staff of Light and Shadow", "Weapon", "Legendary", 1, STF + "**Anathema.** Resistance to Necrotic damage. While you hold it, when you cast a level 1-5 Necromancy spell that uses a slot, roll 1d6. If it is higher than the spell's level, the slot is not spent. **Benediction.** Resistance to Radiant damage. While you hold it, a spell that restores Hit Points can be treated as cast with a slot 1 level higher.",
    base=["Quarterstaff"], by="a Cleric")
add("Staff of Light and Shadow (Anathema)", "Weapon", "Legendary", 1, "Attune: Cleric. The shadow state. Resistance to Necrotic damage. While you hold it, when you cast a level 1-5 Necromancy spell that uses a slot, roll 1d6. If it is higher than the spell's level, the slot is not spent. You can switch to Benediction at dawn.",
    fx={"res": ["Necrotic"]}, base=["Quarterstaff"], by="a Cleric")
add("Staff of Light and Shadow (Benediction)", "Weapon", "Legendary", 1, "Attune: Cleric. The holy state. Resistance to Radiant damage. While you hold it, a spell that restores Hit Points can be treated as cast with a slot 1 level higher. You can switch to Anathema at dawn.",
    fx={"res": ["Radiant"]}, base=["Quarterstaff"], by="a Cleric")
add("Steamwheedle Apparatus", "Wondrous Item", "Legendary", 1, "A Steamwheedle Cartel copy of the Apparatus of Kwalish. It works as that item.")
add("Sulfuras, Hand of Ragnaros", "Weapon", "Artifact", 1, "The elementium maul of Ragnaros. +3 to attack and damage rolls. A hit deals an extra 1d10 Fire damage and sets the target burning. It takes 1d10 Fire damage at the start of each of its turns instead of the normal burning damage. **Ignite the Elements.** Magic action: use one effect. Each can be used again at the next dawn. **Boiling Point:** water in a container or body within 1 mile boils for 1 minute, and a creature that enters or starts its turn there takes 2d10 Fire damage. **Embersmoke:** cast Incendiary Cloud (DC 18). **Eruption:** lava bursts in a 10-foot-radius, 60-foot-high Cylinder at a point you see within 120 feet. Each creature makes a DC 18 Dexterity save and takes 9d10 Fire plus 9d10 Bludgeoning damage on a failure, or half on a success. Placing it on the altar in the temple of Neptulon beneath Vashj'ir quenches it for good." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Maul"], ch=[3, "3", "dawn", "Ignite the Elements"], xd=["+1d10 Fire and burning 1d10"])
SP["Sulfuras, Hand of Ragnaros"] = {"sp": [["Incendiary Cloud", 0]], "dc": 18}
add("Twin Blades of Azzinoth", "Weapon", "Artifact", 1, "A pair of demonic warglaives (scimitars). +3 to attack and damage rolls with each. Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. **Fel Synchronization.** If you hit the same creature with both on a turn, it makes a DC 18 Wisdom save right after the second hit and is Stunned until the end of its next turn on a failure. **Flames of Azzinoth.** Magic action: throw one blade to an open space within 30 feet. It becomes a fiery fiend as if you cast Summon Fiend (Devil option) for 1 minute, then returns to your hand. That blade cannot do this again for 7 days." + ART,
    fx={"atk": 3, "dmg": 3}, base=["Scimitar"], xd=["Fiend target: +2d8 Psychic"])
add("Vithrak, Gaze of the Deadman", "Ring", "Very Rare", 0, "3 charges, regains 1d3 at dawn. Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. Your eyes turn glassy and gray for a moment.", ch=[3, "1d3", "dawn"])
for nm, rar, txt in [
    ("Potion of Mana", "Common", "Regain one expended level 1 spell slot."),
    ("Potion of Mana (Greater)", "Uncommon", "Regain one expended spell slot of level 1 to 3, your choice."),
    ("Potion of Mana (Superior)", "Rare", "Regain one expended spell slot of level 1 to 5, your choice."),
    ("Potion of Rejuvenation", "Uncommon", "Regain 3d4 + 3 Hit Points and one expended level 1 spell slot."),
    ("Potion of Rejuvenation (Greater)", "Rare", "Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice."),
    ("Potion of Rejuvenation (Superior)", "Very Rare", "Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice."),
    ("Troll's Blood Elixir", "Uncommon", "Regain 2 Hit Points now and again at the start of each of your turns for 1 minute while you have at least 1 Hit Point."),
    ("Troll's Blood Elixir (Greater)", "Rare", "Regain 4 Hit Points now and again at the start of each of your turns for 1 minute while you have at least 1 Hit Point."),
    ("Troll's Blood Elixir (Superior)", "Very Rare", "Regain 6 Hit Points now and again at the start of each of your turns for 1 minute while you have at least 1 Hit Point."),
    ("Troll's Blood Elixir (Supreme)", "Legendary", "Regain 8 Hit Points now and again at the start of each of your turns for 1 minute while you have at least 1 Hit Point.")]:
    add(nm, "Potion", rar, 0, "Drink: " + txt)

# ---- mounts and vehicles: [name, gp, weight, category, text]
def mount(n, gp, cap, stat, pre=""):
    GEAR.append([n, gp, 0, "Mount", "Use the " + stat + " stat block. Carrying capacity " + str(cap) + " lb." + (" " + pre if pre else "")])
mount("Cenarion War Hippogryph", 2000, 510, "Hippogriff", "Needs Renown 50+ with the Cenarion Circle. If your Renown there drops below 50 it stops obeying you.")
mount("Dire Wolf", 750, 510, "Dire Wolf", "Needs Renown 10+ with Orgrimmar.")
mount("Elekk", 400, 510, "Giant Goat", "Needs Renown 10+ with the Exodar.")
mount("Giant Goat", 400, 510, "Giant Goat", "Needs Renown 10+ with Ironforge.")
mount("Giant Hyena", 750, 480, "Giant Hyena", "Needs Renown 10+ with the Steamwheedle Cartel.")
mount("Giant Seahorse", 1000, 450, "Giant Seahorse")
mount("Gryphon", 2000, 540, "Griffon", "Needs Renown 25+ with the Alliance.")
mount("Hawkstrider", 150, 420, "Axe Beak", "Needs Renown 10+ with Silvermoon City.")
mount("Kodo", 100, 450, "Giant Lizard", "Needs Renown 10+ with Thunder Bluff.")
mount("Mechanostrider", 450, 420, "Mechanostrider", "Needs Renown 10+ with Gnomeregan.")
mount("Nightsaber", 750, 510, "Tiger", "Needs Renown 10+ with Darnassus.")
mount("Pandarian Dragon Turtle", 500, 480, "Pandarian Dragon Turtle", "Needs Renown 10+ with the Huojin or the Tushui.")
mount("Raptor", 1000, 570, "Allosaurus", "Needs Renown 10+ with the Darkspear Tribe.")
mount("Talbuk", 150, 480, "Elk")
mount("Warhorse", 400, 540, "Warhorse", "Needs Renown 10+ with Stormwind.")
mount("Warhorse Skeleton", 500, 540, "Warhorse Skeleton", "Needs Renown 10+ with Undercity.")
mount("Wind Rider", 2000, 450, "Giant Bat", "Needs Renown 25+ with the Horde.")
mount("Zhevra", 200, 480, "Elk")
VEH = " Powered vehicle: it travels at its speed in miles per hour and needs Fuel (10 lb, 1 gp per 8 hours of travel)."
GEAR.append(["Flying Machine", 0, 0, "Vehicle", "A small gyrocopter. Crew 1, AC 19, 27 Hit Points, speed 4 mph, cargo 0.15 tons. It cannot be bought. A character with expert engineering builds it with 2,000 gp of resources." + VEH])
GEAR.append(["Goblin Trike", 400, 0, "Vehicle", "A three-wheeled motor vehicle. Crew 1, AC 19, 27 Hit Points, speed 3 mph, cargo 0.3 tons. Needs Renown 10+ with any goblin cartel." + VEH])
GEAR.append(["Mechano-Hog", 4000, 0, "Vehicle", "A Horde motorcycle with an optional sidecar. Crew 1, 1 passenger, AC 19, 27 Hit Points, speed 4 mph, cargo 0.4 tons. Needs Renown 10+ with the Horde." + VEH])
GEAR.append(["Mekgineer's Chopper", 4000, 0, "Vehicle", "An Alliance motorcycle with an optional sidecar. Crew 1, 1 passenger, AC 19, 27 Hit Points, speed 4 mph, cargo 0.4 tons. Needs Renown 10+ with the Alliance." + VEH])
GEAR.append(["Fuel", 1, 10, "Adventuring Gear", "Powers a vehicle for 8 hours of travel. A character with the alchemy profession can craft it."])
