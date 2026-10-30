# Own-wording items and gear of Valda's Spire of Secrets (2024). Row shape as tdcsr_item.py: [name, type, rarity, attune, text, opts].
# Weapons (baseitem) are built by the generator from the source stats. This file adds their mastery texts and descriptions (MASTERY, WDESC).
ITEMS = []; SP = {}; WPN = {}; GEAR = []
def add(name, typ, rar, att, text, **o):
    ITEMS.append((name, typ, rar, att, text, o))

# ---- masteries of the new weapons (own wording)
MASTERY = {
 "Bludgeon": "A melee weapon with a Finesse feel: a hit deals Bludgeoning damage of 1d6 plus the attack ability modifier, or 1d8 with two hands.",
 "Jolt": "A creature you hit with this weapon cannot make Opportunity Attacks until the start of its next turn.",
 "Mounted": "Bonus Action: fix the weapon in place until the end of your turn. While mounted it deals the damage shown in parentheses on ranged attacks and cannot be moved.",
 "Overheat": "On a hit you can overcharge the weapon for extra damage of its type equal to your Proficiency Bonus. It then cannot attack again until the end of your next turn.",
 "Parry": "When you hit with this weapon while not wielding a Shield, you gain +2 AC until your next turn starts. Once per turn.",
 "Shift": "When you hit with this weapon, you can move 10 ft right away without provoking Opportunity Attacks.",
 "Tension": "On ranged attacks with this weapon, use Strength or Dexterity for both the attack and damage rolls (the same one for both).",
 "Automatic": "You can replace one attack with a burst of two attacks, both with Disadvantage. Each uses ammunition.",
 "Explode": "Replace one ranged attack with an explosion: a 5-ft-radius Sphere at a point in the weapon's range. Dexterity save (DC 8 + Strength or Dexterity modifier + Proficiency Bonus). A fail takes the weapon's damage without the ability modifier unless it is negative, a success takes half. Once per turn.",
 "Scatter": "Being within 5 ft of an enemy does not give Disadvantage on ranged attacks with this weapon. Its range is 20/60 if it was higher.",
 "Sighted": "Long range does not give Disadvantage on attacks with this weapon. When you hit at long range you can reroll any damage dice and must keep the new roll.",
}
# ---- short own-wording descriptions of named weapons (stats come from the source)
WDESC = {
 "Antimatter Carbine": "A deadlier carbine that fires antimatter bolts in automatic bursts.",
 "Antimatter Pistol": "A compact antimatter sidearm for close quarters.",
 "Avia-Ra Sunstaff": "A forked staff with a gemstone that works as a blaster and as a Quarterstaff in melee.",
 "Blitz Cannon": "A blocky blaster that sprays lightning in a wide, inaccurate spread. Best at short range.",
 "Bolt Caster": "An early crossbow-shaped blaster that fires single plasma shots with a long cooldown.",
 "Bomb": "A thrown explosive. A miss simply fizzles or goes off harmlessly in the background. The GM may add side effects.",
 "Concussion Rifle": "A capacitor-lined rifle that compresses its blast into a precise burst. Strongest at range.",
 "Dueling Laser": "A pistol for honorable duels. It fires a blinding streak of light and then overheats.",
 "Ion Cannon": "Fires a bright, wide cone, deadly up close. An arcane battery charges it between shots.",
 "Magnus": "A heavy handgun, nearly twice the weight of a Repeater, with big recoil and stopping power.",
 "Phaser": "A portable, non-lethal blaster issued to peacekeepers and emissaries.",
 "Plasma Launcher": "A short tube that lobs a plasma orb in an arc. It bursts into a fireball on contact.",
 "REC Gun": "The Revolving Exothermic Cannon. A mounted multi-barrel blaster on the same principle as other blasters.",
 "Repeater": "The standard handheld blaster of the frontier. Reliable and common.",
 "Standard Carbine": "The standard-issue blaster of Hegemony and Coalition troops. Compact and widespread.",
 "Swarm Pistol": "A rapid-fire blaster styled like a Repeater. Nimble users can wield one in each hand.",
}
SWITCH_NOTE = "Switch Weapon: it has two forms, each with the stats of a base weapon listed in the book. This sheet lists one entry per form."

# ---- grafts (donor body parts installed in a body slot)
add("Amphibious Adaptation", "Wondrous Item", "Uncommon", 0, "Graft (Any Creature with Amphibious or Water Breathing). Fins and gills of an aquatic creature. You have a Swim Speed equal to your Speed and breathe air and water.", fx={"swim": "walk"})
add("Angelic Wings", "Wondrous Item", "Very Rare", 0, "Graft (External slot, donor: a Celestial with a Fly Speed). You have a Fly Speed equal to your Speed.", fx={"fly": "walk"})
add("Antimagic Eye", "Wondrous Item", "Rare", 0, "Graft (donor: a creature with Magic Resistance). Cast Dispel Magic from it, choosing Intelligence, Wisdom or Charisma each time you install it. The level of spell it ends automatically depends on the donor's Challenge Rating: Lesser (CR 1/8-4) level 1, Greater (5-10) level 3, Superior (11-16) level 5, Supreme (17+) level 7. Once used, it works again after a Long Rest. Rarity matches the tier: Common, Uncommon, Rare, Very Rare.", ch=[1, "1", "long"])
SP["Antimagic Eye"] = {"sp": [["Dispel Magic", 1]]}
add("Arcane Synapses", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with the Spellcasting action). The GM picks one of the donor's spells. It is always prepared for you and you can cast it once with this graft without a slot, using Intelligence, Wisdom or Charisma (pick on installing).")
add("Burrowing Adaptation", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with a Burrow Speed of 10+ ft). You have a Burrow Speed equal to half your Speed. You can dig through sand, earth, mud and ice, not solid rock.")
add("Climbing Apparatus", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with a Climb Speed). You can cling to surfaces and have a Climb Speed equal to your Speed.", fx={"climb": "walk"})
add("Draconis Fundamentum", "Wondrous Item", "Rare", 0, "Graft (donor: a dragon with a Breath Weapon). When you take the Attack action, replace one attack with a Cone of breath of the donor's damage type. Dexterity save, full damage on a fail and half on a success. Wyrmling (CR 1/8-4): 2d8, DC 13, 15 ft, 1 Hit Point Die to restore. Young (5-10): 4d8, DC 15, 30 ft, 2 dice. Adult (11-16): 6d8, DC 17, 60 ft, 4 dice. Ancient (17+): 8d8, DC 19, 90 ft, 6 dice. Rarity by tier: Uncommon, Rare, Very Rare, Legendary. Once used, it returns after a Long Rest, or spend the listed Hit Point Dice (no action) to restore it.", ch=[1, "1", "long"])
add("Heart of Steel", "Wondrous Item", "Common", 0, "Graft (donor: a Construct). You do not need to sleep and magic cannot put you to sleep. You can finish a Long Rest in 4 hours if you spend them motionless but conscious.")
add("Heavy Legs", "Wondrous Item", "Uncommon", 0, "Graft (donor: a Large or larger Monstrosity). Bonus Action: kick a Large or smaller creature within 5 ft with an Unarmed Strike. A hit deals no damage and pushes it 5 ft away. You count as one size larger for carrying capacity.")
add("Hellfire Blood", "Wondrous Item", "Uncommon", 0, "Graft (donor: a Fiend). When a creature you see within 30 ft damages you, use your Reaction and spend a Hit Point Die. It takes Fire damage equal to one roll of the die plus your Constitution modifier.")
add("Leaping Legs", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with Standing Leap or a leap Bonus Action). Bonus Action: jump up to 15 ft by spending 5 ft of movement.")
add("Legendary Trophy", "Wondrous Item", "Rare", 0, "Graft (donor: a creature with Legendary Actions). Magic action: you and each ally within 30 ft gain Heroic Inspiration. Once used, it returns after a Long Rest.", ch=[1, "1", "long"])
add("Mechanical Limb", "Wondrous Item", "Rare", 0, "Graft (donor: a Medium or larger Construct). An extra arm below your normal arms. It can hold weapons and Shields (so you can hold a two-handed weapon and a one-handed weapon together) and perform Somatic components. It gives no extra actions.")
add("Monstrous Bite", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with a Bite action). You can use Dexterity instead of Strength for Unarmed Strike attacks and damage. An Unarmed Strike can deal 1d6 Piercing plus Strength or Dexterity modifier instead of its normal damage. When you score a Critical Hit with a melee attack, make a Monstrous Bite attack as a Bonus Action.")
add("Monstrous Hide", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with AC 17+ without armor). Your base AC is 13 plus your Dexterity modifier. You can wear armor over it and use either AC, and still use a Shield.", fx={"acBase": 13})
add("Monstrous Weapon", "Wondrous Item", "Rare", 0, "Graft (donor: a creature with a Claw or Rend action). You can use Dexterity instead of Strength for Unarmed Strike attacks and damage. An Unarmed Strike can deal Slashing damage by tier plus Strength or Dexterity modifier instead of its normal damage. The tier table is in the book.")
add("Nocturnal Eyes", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with Darkvision). You gain Darkvision with a range of 60 ft.", fx={"dark": 60})
add("Ooze Infusion", "Wondrous Item", "Uncommon", 0, "Graft (donor: an Ooze). Your insides turn semi-fluid. A Critical Hit against you becomes a normal hit.")
add("Oversized Arms", "Wondrous Item", "Rare", 0, "Graft (donor: a Giant). Your reach is 5 ft greater when you attack with a Melee weapon or Unarmed Strike.")
add("Prehensile Tail", "Wondrous Item", "Common", 0, "Graft (donor: a creature with a tail). A flexible tail that can hold and move objects and weapons. It cannot attack or hold a Shield.")
add("Regenerating Marrow", "Wondrous Item", "Rare", 0, "Graft (donor: a creature with Regeneration). While Bloodied with at least 1 HP, use a Bonus Action and spend a Hit Point Die: regain HP equal to the roll plus your Constitution modifier.")
add("Replacement", "Wondrous Item", "Common", 0, "Graft (any donor). Replaces a lost limb or organ. It cannot bring back the dead. It uses the body slot of what it replaces, and you can have several Replacements in one slot.")
add("Resistance Suture", "Wondrous Item", "Rare", 0, "Graft (donor: a creature immune to Acid, Cold, Fire, Lightning, Poison or Thunder). You have Resistance to one of those types that the donor was immune to.")
add("Shapeshifter Blood", "Wondrous Item", "Uncommon", 0, "Graft (donor: a creature with a Shape-Shift action). Over 1 minute you can change your appearance fully, as another species if you like. None of your statistics change. You cannot change size or basic shape.")
add("Sprinting Legs", "Wondrous Item", "Rare", 0, "Graft (donor: a creature with Speed 60+ ft). Your Speed increases by 10 ft and Opportunity Attacks against you have Disadvantage.")

# ---- wondrous items
add("Aura Lenses (Complete)", "Wondrous Item", "Rare", 0, "A cylindrical case of eight tinted glass lenses, one per school of magic (Abjuration white, Conjuration blue, Divination yellow, Enchantment pink, Evocation red, Illusion purple, Necromancy grey, Transmutation green). Bonus Action: look through a lens. The world looks tinted, except creatures and objects under a spell of that school, which look normal.")
add("Aura Lenses (Incomplete)", "Wondrous Item", "Uncommon", 0, "As the complete set, but it holds only 1d8 of the eight lenses.")
for o, n in (("Black Pudding", 0), ("Gelatinous Cube", 0), ("Gray Ooze", 0), ("Ochre Jelly", 0)):
    add("Bottled Ooze (%s)" % o, "Wondrous Item", "Uncommon", 0, "Bonus Action: throw the bottle up to 60 ft. It shatters and releases a %s. The ooze is friendly to you and your allies and attacks the nearest creature it can sense, or follows you if there is none. It dissolves into sludge after 1 hour or when you release another Bottled Ooze." % o)
add("Crimson Compass", "Wondrous Item", "Uncommon", 0, "Magic action: put a drop of blood on the face. The needle points to the creature the blood came from, if it is alive and on the same plane. Otherwise it spins wildly. It cannot find a creature under Nondetection. Removing the blood is a Magic action.")
add("Dire Diary", "Wondrous Item", "Rare", 1, "A diary of 50 pages, filled in your own handwriting about events to come. Only you can attune to it. Cast Dire Warning from it by filling a page with a message of up to 50 words from your future, which can be a sketch. Messages are vague to avoid paradoxes. It cannot cast the spell again for 7 days.", ch=[1, "1", "never", "Regains after 7 days"])
SP["Dire Diary"] = {"sp": [["Dire Warning", 1]]}
add("Encyclopedia Sanguine", "Wondrous Item", "Uncommon", 0, "A book of hundreds of bloody ink prints. Cast Blood Print from it while holding it. As a Magic action you can also read a print to learn the kind of creature the blood is from, its approximate age and sex, and whether its health is poor or good.")
SP["Encyclopedia Sanguine"] = {"sp": [["Blood Print", 0]]}
add("Fate Deck", "Wondrous Item", "Very Rare", 0, "A box of cards woven with fate (often 52 playing cards, or other sets). Playing any game with it casts Game of Fate (DC 17). It cannot do so again until the next dawn.", ch=[1, "1", "dawn"])
SP["Fate Deck"] = {"sp": [["Game of Fate", 0]], "dc": 17}
add("Grimoire Monstrum", "Wondrous Item", "Uncommon", 1, "A book of myths and monsters. While you hold it, you have Advantage on Intelligence checks about monsters, spells, and secret or ancient lore.")

# ---- cocktails (Bartending college). Drunk level: a Constitution save sets how many levels you gain.
def ck(name, rar, dc, fail, ok, extra):
    add(name, "Potion", rar, 0, "Make a DC %d Constitution save when you drink it. You gain %d Drunk levels on a fail, %d on a success. %s" % (dc, fail, ok, extra))
ck("Barbarian's Brew", "Uncommon", 13, 2, 1, "For 1 hour your Strength score rises by your Drunk level, to a maximum of 22.")
add("Chaser", "Potion", "Common", 0, "Drink it right after another potion as part of the same Bonus Action. You gain 1 Drunk level.")
ck("Communion Wine", "Uncommon", 13, 2, 1, "You gain the effect of Sanctuary for 1 minute (DC 10 plus your Drunk level).")
ck("Cup of Cthulhu", "Common", 10, 2, 1, "You gain Telepathy with a range of 60 ft for 1 hour.")
ck("Disappearing Mule", "Uncommon", 13, 2, 1, "You teleport up to 120 ft to a random unoccupied space chosen by the GM.")
ck("Displacer Daiquiri", "Rare", 15, 3, 2, "For 1 minute an illusion shows you standing near your real spot, so attack rolls against you have Disadvantage. The effect pauses until your next turn starts if you take damage.")
ck("Dragon's Breath Shot", "Uncommon", 13, 2, 1, "You gain the effect of Dragon's Breath for 1 minute (DC 10 plus your Drunk level, no Concentration).")
ck("Drifting Drink", "Uncommon", 13, 2, 1, "You are under the effect of Levitate for 10 minutes. At the end of each minute, roll a d20. On a 1 the effect ends early.")
add("Druid's Draught", "Potion", "Rare", 0, "Make a DC 15 Constitution save when you drink it. You gain 3 Drunk levels on a fail, 2 on a success. For 10 minutes you are shape-shifted, as the Polymorph spell, into a Beast of CR 1/4 or lower chosen by the GM.")
ck("Expert's Espresso", "Rare", 15, 3, 2, "For 1 minute you have proficiency and Expertise in all skills.")
ck("Goodberry Wine", "Uncommon", 13, 2, 1, "You regain 10 HP and the drink feeds you for one day.")
add("Hair of the Dog", "Potion", "Common", 0, "Your Drunk level drops by 2. For 10 minutes you cannot gain Drunk levels or the effects of potions you drink.")
add("Honeyed Mead", "Potion", "Rare", 0, "Make a DC 15 Constitution save when you drink it. On a fail you gain 3 Drunk levels and treat the next activity you hear within 1 minute (25 words or fewer) as the suggestion of the Suggestion spell. On a success you only gain 2 Drunk levels.")
ck("Invisible Spirit", "Rare", 15, 3, 2, "You are Invisible for 10 minutes. It ends early if you attack, deal damage or cast a spell. When it ends you are Poisoned until the end of your next turn.")
ck("Liquid Courage", "Uncommon", 10, 2, 1, "You gain Heroic Inspiration and Immunity to the Frightened condition for 10 minutes. You cannot gain Heroic Inspiration from this drink again until a Long Rest.")
ck("Nightcap", "Common", 10, 2, 1, "If you begin a Long Rest within the next hour, you gain 4d4 Temporary HP when you finish it.")
ck("Piña Colossus", "Uncommon", 13, 2, 1, "You get the enlarge effect of Enlarge/Reduce for 1 minute, then the reduce effect for 1 minute (no Concentration).")
ck("Prophecy Wine", "Common", 13, 2, 1, "Before the end of your next turn you can cast Augury as a Magic action once, with no slot or Material components.")
ck("Rogue's Brew", "Uncommon", 13, 2, 1, "For 1 hour your Dexterity score rises by your Drunk level, to a maximum of 22.")
add("Vino Veritas", "Potion", "Uncommon", 0, "Make a DC 13 Constitution save when you drink it. On a fail you gain 2 Drunk levels and blurt out 1d4 embarrassing facts about yourself or secrets about others. On a success you gain 1 Drunk level. For 10 minutes you cannot tell a deliberate lie.")

# ---- gear: [name, cost gp, weight lb, type, text]
GEAR += [
 ["Ball Bearings", 1, 2, "Adventuring Gear", "Utilize action: spill them across a level 10-ft square within 10 ft of you. A creature entering for the first time on a turn makes a Dexterity save or falls Prone. Recovering them takes 10 minutes."],
 ["Ballista Trap", 10, 0, "Adventuring Gear", "Utilize action: set up in an open space within 5 ft and aim it. It triggers when a creature first enters, or ends its turn in, a 30-ft by 5-ft Line from it. It makes a ranged attack (Intelligence modifier plus Masterwork Bonus plus Proficiency Bonus) for 1d8 Piercing. A creature triggers only one per turn. Recovering it takes a Utilize action."],
 ["Caltrops", 1, 2, "Adventuring Gear", "Utilize action: scatter them over a 5-ft square within 5 ft. A creature entering for the first time on a turn makes a Dexterity save or takes 1 Piercing damage and has Speed 0 until its next turn starts. Recovering them takes 10 minutes."],
 ["Hunting Trap", 2.5, 25, "Adventuring Gear", "Utilize action: set a toothed steel trap chained to something fixed. A creature that steps on the plate makes a Dexterity save or takes 1d4 Piercing damage and has Speed 0 until its next turn starts, then its movement is limited by the chain (about 3 ft). A Strength (Athletics) check against your Traps save DC frees a creature in reach. Each failed check deals 1 Piercing damage. Recovering it takes a Utilize action."],
 ["Razor Wire", 5, 0, "Adventuring Gear", "Utilize action: lay it in up to four connected 5-ft Cubes on the ground within 10 ft. The area is Difficult Terrain. A creature moving in it takes 1d4 Slashing damage per 5 ft traveled. It cannot be recovered."],
 ["Trigger Bomb", 5, 0, "Adventuring Gear", "Utilize action: toss it into an open space within 30 ft. When a creature moves within 5 ft, use your Reaction to detonate it in a 5-ft Emanation. Dexterity save, 1d6 Fire on a fail or half on a success. Loose flammable objects there catch fire and other Trigger Bombs there explode. A creature saves once per turn. Recovering it takes a Utilize action."],
 ["Bullets (10)", 3, 1.5, "Ammunition", "Ten firearm bullets. Firearm ammunition is destroyed when used."],
 ["Cannonballs (5)", 25, 10, "Ammunition", "Five cannonballs. Destroyed when used."],
 ["Flares (5)", 5, 5, "Ammunition", "Five flares. Destroyed when used."],
 ["Grenades (5)", 25, 3, "Ammunition", "Five grenades. Destroyed when used."],
 ["Shells (10)", 5, 1.5, "Ammunition", "Ten shotgun shells. Destroyed when used."],
 ["Shot (10)", 1, 2, "Ammunition", "Ten pieces of shot. Destroyed when used."],
]
