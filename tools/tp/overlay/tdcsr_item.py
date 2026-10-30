# Own-wording magic items and gear of Tal'Dorei Campaign Setting Reborn.
# Row shape follows src/data/wotc11-magic-items-2014.js: [name, type, rarity, attune, text, opts].
# opts: by (attunement restriction), ch [max, regain, when, note?], fx, base, wp, xd (extra damage riders shown on the attack row), sp via SP.
# Source text was converted by the community, so "Advantage and Disadvantage" is garbled in it. Such lines say "adjusted roll (garbled in the source, see the book)".
ITEMS = []   # list of (name, type, rarity, attune, text, opts)
SP = {}      # item name -> {"sp": [[spell, cost, lvl?, label?]], "dc": n}
WPN = {}     # item name -> weapon definition used as its own base
GEAR = []    # [name, cost gp, weight, type, text]

def add(name, typ, rar, att, text, **o):
    ITEMS.append((name, typ, rar, att, text, o))

def tier(base, typ, rar, att, by, bt, tiers):
    """tiers: three dicts with t (text of that tier) and o (opts). Texts add up, so each state lists what it has."""
    names = ["Dormant", "Awakened", "Exalted"]; acc = bt
    for i, (nm, tr) in enumerate(zip(names, tiers)):
        acc = acc + "\n**" + nm + ".** " + tr["t"]
        o = dict(tr.get("o", {}))
        if by: o["by"] = by
        add("%s (%s)" % (base, nm), typ, rar, att, acc, **o)
        if tr.get("sp"): SP["%s (%s)" % (base, nm)] = tr["sp"]

# ---- armor
add("+2 Studded Leather Armor of Acid Resistance", "Armor", "Rare", 1,
    "Studded leather armor with a +2 bonus to AC while you wear it. You also have resistance to acid damage while you wear it.",
    fx={"ac": 2, "res": ["Acid"]}, base=["Studded Leather Armor"])
add("+2 Studded White Dragon Leather Armor of Cold Resistance", "Armor", "Rare", 1,
    "Studded armor made from white dragon leather with a +2 bonus to AC while you wear it. You also have resistance to cold damage while you wear it.",
    fx={"ac": 2, "res": ["Cold"]}, base=["Studded Leather Armor"])

tier("Armor of the Valiant Soul", "Armor", "Legendary", 1, None,
 "Scale armor of jade and black dragon scales. It has three states that stack: Dormant, Awakened, Exalted. A state shows the benefits of that state and the ones before it.",
 [{"t": "+1 AC while you wear it. While attuned you can cast Command (save DC 14) from it. After you cast it, you must finish a rest to cast it again.",
   "o": {"fx": {"ac": 1}, "base": ["Scale Mail"], "ch": [1, "1", "long"]}, "sp": {"sp": [["Command", 1]], "dc": 14}},
  {"t": "The AC bonus becomes +2. You have resistance to acid damage and you are immune to the frightened condition. Command has save DC 16 and can target up to three creatures.",
   "o": {"fx": {"ac": 2, "res": ["Acid"], "condImm": ["Frightened"]}, "base": ["Scale Mail"], "ch": [1, "1", "long"]}, "sp": {"sp": [["Command", 1]], "dc": 16}},
  {"t": "The AC bonus becomes +3. You are immune to acid damage (this replaces the resistance). While you are conscious, friendly creatures within 15 feet are immune to the frightened condition. Command has save DC 18 and can target up to five creatures.",
   "o": {"fx": {"ac": 3, "imm": ["Acid"], "condImm": ["Frightened"]}, "base": ["Scale Mail"], "ch": [1, "1", "long"]}, "sp": {"sp": [["Command", 1]], "dc": 18}}])

tier("Deathwalker's Ward", "Armor", "Legendary", 1, None,
 "Black studded leather armor with a mantle of raven feathers, tied to the Matron of Ravens.",
 [{"t": "+1 AC while you wear it. You have an adjusted roll on death saving throws (garbled in the source, see the book).",
   "o": {"fx": {"ac": 1}, "base": ["Studded Leather Armor"]}},
  {"t": "The AC bonus becomes +2. Pick one damage type you resist while wearing it: acid, cold, fire, lightning, necrotic or poison. Change the pick when you finish a rest.",
   "o": {"fx": {"ac": 2}, "base": ["Studded Leather Armor"]}},
  {"t": "The AC bonus becomes +3. As a bonus action you grow raven wings. You gain a flying speed of 60 feet for 1 hour. After you use this, you must finish a long rest to use it again.",
   "o": {"fx": {"ac": 3}, "base": ["Studded Leather Armor"], "ch": [1, "1", "long"]}}])

tier("Plate of the Dawnmartyr", "Armor", "Legendary", 1, None,
 "Plate armor of brass and gold with silver scrollwork and rubies.",
 [{"t": "+1 AC while you wear it. When a creature within 5 feet hits you with a melee attack, you can use your reaction to rebuke it for 1d6 fire damage.",
   "o": {"fx": {"ac": 1}, "base": ["Plate Armor"]}},
  {"t": "The AC bonus becomes +2. You are immune to the frightened condition and resist fire damage. The rebuke deals 2d6 fire damage.",
   "o": {"fx": {"ac": 2, "res": ["Fire"], "condImm": ["Frightened"]}, "base": ["Plate Armor"]}},
  {"t": "The AC bonus becomes +3. Your rebuke can deal fire or radiant damage. When you drop to 0 hit points, you can unleash healing flame: you regain 1 hit point and stand up, and each enemy within 10 feet takes 2d6 fire or radiant damage (your choice). Finish a rest to use that again.",
   "o": {"fx": {"ac": 3, "res": ["Fire"], "condImm": ["Frightened"]}, "base": ["Plate Armor"], "ch": [1, "1", "long"]}}])

tier("Honor's Last Stand", "Armor", "Legendary", 1, "a creature of non-evil alignment",
 "A large silvered shield with the crest of the Platinum Dragon. It never tarnishes.",
 [{"t": "+1 AC while you hold it, on top of the shield's normal bonus. You cannot be knocked prone while you hold it.",
   "o": {"fx": {"ac": 1}, "base": ["Shield"]}},
  {"t": "The AC bonus becomes +2. When you shove a creature with it, that creature takes 2d6 force damage. When a creature within 5 feet misses you with an attack, you can use your reaction to try to shove it.",
   "o": {"fx": {"ac": 2}, "base": ["Shield"]}},
  {"t": "The AC bonus becomes +3. When you shove a creature with it, you can also move it up to 15 feet away. As a bonus action you can guard an ally within 5 feet: that ally gets +3 AC until the start of your next turn or until it leaves your 5-foot range.",
   "o": {"fx": {"ac": 3}, "base": ["Shield"]}}])

# ---- weapons (named weapons)
tier("Agony", "Weapon", "Legendary", 1, "a creature of non-good alignment",
 "A flail of hooked chains, stained with old blood. Each state adds to the one before.",
 [{"t": "+2 to attack and damage rolls. When you damage a creature with it, that creature is marked for 10 minutes or until you damage a different creature. Hitting a marked creature deals an extra 1d6 piercing damage.",
   "o": {"fx": {"atk": 2, "dmg": 2}, "base": ["Flail"], "xd": ["Marked target: +1d6 Piercing"]}},
  {"t": "Extra damage on a marked target becomes 1d8. A marked creature has an adjusted roll on Constitution checks and saves (garbled in the source, see the book). When you reduce a creature to 0 hit points with it, you can make another melee attack with it as a bonus action.",
   "o": {"fx": {"atk": 2, "dmg": 2}, "base": ["Flail"], "xd": ["Marked target: +1d8 Piercing"]}},
  {"t": "The bonus becomes +3. Extra damage on a marked target becomes 2d8. On a critical hit, the target must succeed on a DC 17 Wisdom save or be frightened of you for 1 minute. On a success it is immune to this for 24 hours.",
   "o": {"fx": {"atk": 3, "dmg": 3}, "base": ["Flail"], "xd": ["Marked target: +2d8 Piercing"]}}])

tier("Fenthras", "Weapon", "Legendary", 1, None,
 "A living bow of Feywild everbark. When a creature dies to an attack with it, a six-foot tree grows from the corpse within a minute. The tree roots the body but does not harm it.",
 [{"t": "+1 to attack and damage rolls. When you attack with it, you can declare an oracle shot and sense the area around the arrow with your normal senses for 10 minutes. Finish a rest to use that again.",
   "o": {"fx": {"atk": 1, "dmg": 1}, "base": ["Longbow"], "ch": [1, "1", "short"]}},
  {"t": "The bonus becomes +2. Hits deal an extra 1d4 lightning damage. When you hit you can declare a bramble shot: the attack deals an extra 3d8 piercing damage and the target must succeed on a DC 15 Strength save or be restrained by brambles. The target repeats the save at the end of each of its turns. Finish a rest to use it again.",
   "o": {"fx": {"atk": 2, "dmg": 2}, "base": ["Longbow"], "ch": [2, "all", "short", "One use each: oracle shot, bramble shot. Tick one per use"], "xd": ["+1d4 Lightning"]}},
  {"t": "The bonus becomes +3. The lightning damage becomes 1d6. You can use bramble shot twice between rests and its save DC is 17.",
   "o": {"fx": {"atk": 3, "dmg": 3}, "base": ["Longbow"], "ch": [3, "all", "short", "One oracle shot and two bramble shots. Tick one per use"], "xd": ["+1d6 Lightning"]}}])

tier("Condemner", "Weapon", "Legendary", 1, None,
 "A shadow-touched heavy crossbow. When you hit with it, you can use one effect instead of dealing damage. Each effect is usable once per rest.",
 [{"t": "+1 to attack and damage rolls. Hits deal an extra 1d4 poison damage. Effects: cast Fog Cloud or Silence centered on the target's space.",
   "o": {"fx": {"atk": 1, "dmg": 1}, "base": ["Heavy Crossbow"], "ch": [2, "all", "short", "One use per effect. Tick one for each effect used"], "xd": ["+1d4 Poison"]},
   "sp": {"sp": [["Fog Cloud", 1], ["Silence", 1]]}},
  {"t": "The bonus becomes +2 and the poison becomes 1d6. New effect: cast Hold Person on the target (save DC 15).",
   "o": {"fx": {"atk": 2, "dmg": 2}, "base": ["Heavy Crossbow"], "ch": [3, "all", "short", "One use per effect. Tick one for each effect used"], "xd": ["+1d6 Poison"]},
   "sp": {"sp": [["Fog Cloud", 1], ["Hold Person", 1], ["Silence", 1]], "dc": 15}},
  {"t": "The bonus becomes +3 and the poison becomes 1d8. Hold Person has save DC 17. New effect: cast Blight on the target (save DC 17).",
   "o": {"fx": {"atk": 3, "dmg": 3}, "base": ["Heavy Crossbow"], "ch": [4, "all", "short", "One use per effect. Tick one for each effect used"], "xd": ["+1d8 Poison"]},
   "sp": {"sp": [["Blight", 1], ["Fog Cloud", 1], ["Hold Person", 1], ["Silence", 1]], "dc": 17}}])

tier("Mythcarver", "Weapon", "Legendary", 1, "a bard",
 "A silvered longsword that hums with nearby music. Its light make gives it the Finesse property, so you can use Strength or Dexterity for attack and damage.",
 [{"t": "+1 to attack and damage rolls. When you give a creature Bardic Inspiration, you get an adjusted roll on attacks with this sword until the end of your turn (garbled in the source, see the book).",
   "o": {"fx": {"atk": 1, "dmg": 1}}},
  {"t": "The bonus becomes +2. Hits deal an extra 1d6 force damage. When you use Bardic Inspiration on an enemy while you wield it, that enemy has an adjusted roll on its next saves (garbled in the source, see the book).",
   "o": {"fx": {"atk": 2, "dmg": 2}, "xd": ["+1d6 Force"]}},
  {"t": "The bonus becomes +3. As an action you let the sword's spirit guide your body: make 4 melee attacks with it, then gain 1 level of exhaustion. Finish a rest to use that again.",
   "o": {"fx": {"atk": 3, "dmg": 3}, "xd": ["+1d6 Force"], "ch": [1, "1", "short"]}}])
for _n in ("Dormant", "Awakened", "Exalted"):
    WPN["Mythcarver (%s)" % _n] = {"d": "1d8", "t": "Slashing", "cat": "M", "k": "M", "p": "Versatile (1d10), Finesse", "m": "Sap", "w": 3, "xw": 1}

tier("Pyremaul", "Weapon", "Legendary", 1, None,
 "A maul of deep red iron with a fire opal that never stops burning. The bonus applies to attack rolls only.",
 [{"t": "+1 to attack rolls. Hits deal an extra 1d6 fire damage. You can make it shed bright light in 30 feet and dim light for 30 more (no action).",
   "o": {"fx": {"atk": 1, "mw": 1}, "base": ["Maul"], "xd": ["+1d6 Fire"]}},
  {"t": "The attack bonus becomes +2 and the fire damage becomes 2d6. As an action you can slam it down to cast Burning Hands at 2nd level (save DC 15). Finish a rest to use that again. A critical hit forces a DC 15 Strength save or the target is knocked prone.",
   "o": {"fx": {"atk": 2, "mw": 1}, "base": ["Maul"], "ch": [1, "1", "short"], "xd": ["+2d6 Fire"]},
   "sp": {"sp": [["Burning Hands", 1, 2]], "dc": 15}},
  {"t": "The attack bonus becomes +3 and the fire damage becomes 3d6. Burning Hands is cast at 3rd level with save DC 17. The prone save on a critical hit is DC 17 and the critical hit rolls an extra 3d6 fire damage. When you kill a creature with it, you can take 10d10 fire damage (it cannot be reduced) to turn the corpse and its non-magic gear to ash. The creature can only return through true resurrection or wish. You die if this damage drops you to 0. You cannot do this again for 7 days.",
   "o": {"fx": {"atk": 3, "mw": 1}, "base": ["Maul"], "ch": [1, "1", "short"], "xd": ["+3d6 Fire"]},
   "sp": {"sp": [["Burning Hands", 1, 3]], "dc": 17}}])

tier("Star Razor", "Weapon", "Legendary", 1, None,
 "A silver longsword with blue runes. As a bonus action, speak the command word to make it glow (bright light 20 feet, dim light 20 more) until you speak it again, drop it or sheathe it. The bonus and the resistance apply while it glows.",
 [{"t": "While glowing: +1 to attack and damage rolls and resistance to radiant damage. Cast Faerie Fire from it as an action (save DC 13, no components). A spell cast from it cannot be cast again until the next dawn.",
   "o": {"fx": {"atk": 1, "dmg": 1, "res": ["Radiant"]}, "base": ["Longsword"], "ch": [1, "1", "dawn"]}, "sp": {"sp": [["Faerie Fire", 1]], "dc": 13}},
  {"t": "The bonus becomes +2. When a creature within 5 feet hits you with a melee attack, you can use your reaction to burst radiance at it for 1d8 radiant damage. Cast See Invisibility from it as an action. Spell save DC from the sword is 15.",
   "o": {"fx": {"atk": 2, "dmg": 2, "res": ["Radiant"]}, "base": ["Longsword"], "ch": [1, "1", "dawn"]}, "sp": {"sp": [["Faerie Fire", 1], ["See Invisibility", 0]], "dc": 15}},
  {"t": "The bonus becomes +3. The reaction burst deals 1d12 radiant damage and you can teleport to an empty space you can see within 15 feet as part of it. Cast Fly from it as an action. Spell save DC from the sword is 17.",
   "o": {"fx": {"atk": 3, "dmg": 3, "res": ["Radiant"]}, "base": ["Longsword"], "ch": [1, "1", "dawn"]}, "sp": {"sp": [["Faerie Fire", 1], ["Fly", 0], ["See Invisibility", 0]], "dc": 17}}])

tier("Whisper", "Weapon", "Legendary", 1, None,
 "A dagger of strange metal with a sourceless glow and two raven feathers on its pommel.",
 [{"t": "+1 to attack and damage rolls. On a critical hit the target must succeed on a DC 13 Wisdom save or be frightened of you for 1 minute. On a success it is immune for 24 hours.",
   "o": {"fx": {"atk": 1, "dmg": 1}, "base": ["Dagger"]}},
  {"t": "The bonus becomes +2. Hits deal an extra 1d6 psychic damage. The critical hit save DC is 15.",
   "o": {"fx": {"atk": 2, "dmg": 2}, "base": ["Dagger"], "xd": ["+1d6 Psychic"]}},
  {"t": "The bonus becomes +3 and the psychic damage becomes 1d8. The critical hit save DC is 17. When you make a ranged attack with it, you can turn to shadow as part of the attack and teleport: on a hit you appear in an empty space within 5 feet of the target, on a miss where the dagger lands (usually within 1d6 x 5 feet). You appear holding the dagger.",
   "o": {"fx": {"atk": 3, "dmg": 3}, "base": ["Dagger"], "xd": ["+1d8 Psychic"]}}])

# ---- single weapons
add("Corecut Dagger", "Weapon", "Very Rare", 1,
    "A dark hooked blade. +1 to attack and damage rolls. When you hit, you can spend 1 Hit Die to deal an extra 3d6 necrotic damage.\n**Curse.** Identify or attuning reveals the curse. Attuning curses you until Remove Curse or similar magic. Getting rid of the dagger does not end it. While cursed, each time you receive magical healing you must spend 1 Hit Die to regain the hit points. If you run out of Hit Dice, you die.",
    fx={"atk": 1, "dmg": 1}, base=["Dagger"], xd=["Spend 1 Hit Die: +3d6 Necrotic"])
add("Dagger of Denial", "Weapon", "Rare", 1,
    "A silver stiletto with spiral grooves. +2 to attack and damage rolls. As an action you can seal a keyhole by putting the point in it. The lock stays sealed until this dagger is put in that keyhole again (the door or container can still be broken). Sealing a keyhole unseals any keyhole you sealed before.",
    fx={"atk": 2, "dmg": 2}, base=["Dagger"])
add("Graz'tchar, the Decadent End", "Weapon", "Legendary", 1,
    "A silver greatsword inlaid with rubies. +3 to attack and damage rolls.\n**Corrosive Submission.** When you hit a creature with Intelligence 4 or higher, it takes an extra 3d6 acid damage and must succeed on a DC 17 Charisma save or be charmed by you for 1 hour. If you attack it again while charmed, the extra acid damage is 10d6 and the charm ends. After a success or when the charm ends, the creature cannot be charmed this way for 24 hours.\n**Hidden Nature.** The acid looks like radiant damage to observers. True Seeing shows a rusted blade dripping acid.\n**Sentience.** Neutral evil, Int 14, Wis 12, Cha 18. Hearing and darkvision 120 feet. It speaks, reads and understands Common and talks to its wielder by telepathy. Its voice is a Demon Prince of Indulgence in disguise (a DC 26 Wisdom (Insight) check hears the malice).\n**Personality.** It pushes its wielder to cause chaos in Exandria and lies about leaders. If the wielder ignores its urges for long, it can try to control them: DC 17 Charisma save or be charmed for 24 hours. While charmed it can compel one action per hour. The charm ends at once if the action would harm a trusted friend. On a success or an ended charm, the wielder is immune to this for 24 hours.",
    fx={"atk": 3, "dmg": 3, "dark": 120}, base=["Greatsword"], xd=["Int 4+ target: +3d6 Acid (then 10d6 on a second hit)"])
add("Inescapable Lash", "Weapon", "Rare", 1,
    "A bronze braided whip with three barbs. +1 to attack and damage rolls. Its reach is 20 feet. When you hit a creature or object, you can try to grapple it as a bonus action. While you hold a creature grappled with it, you can use your action to pull it up to 20 feet toward you or restrain it until you let go. A restrained creature escapes with a Strength (Athletics) or Dexterity (Acrobatics) check as an action against DC 8 + your proficiency bonus + your Strength modifier.",
    fx={"atk": 1, "dmg": 1}, base=["Inescapable Lash"])
WPN["Inescapable Lash"] = {"d": "1d4", "t": "Slashing", "cat": "M", "k": "M", "p": "Finesse, Reach (20 ft)", "m": "Slow", "w": 3, "xw": 1}
add("Magician's Judge", "Weapon", "Rare", 0,
    "An executioner's greatsword from the Age of Arcanum. When you hit a creature with it, you can cast Dispel Magic on the target as part of the attack. You can also use an action to cast Dispel Magic from it on a target you choose. For any check with your spellcasting ability, use +3 or your own modifier, whichever is higher. After you cast it, you cannot do so again until the next dawn.",
    base=["Greatsword"], ch=[1, "1", "dawn"])
SP["Magician's Judge"] = {"sp": [["Dispel Magic", 1]]}
add("Skysail", "Weapon", "Rare", 1,
    "Bat-like wings on a wooden pole, first used by the Air Ashari. While the wings are open and you ride it, you glide with a flying speed of 60 feet, but you must descend at least 10 feet by the end of each of your turns and cannot gain height. While you touch it, you can use an action to cast Fly on yourself for 1 minute with no concentration. The spell ends if you lose contact. After that use, wait until the next dawn, or until the skysail is soaked in strong elemental air magic (for example at the Summit Peaks near the rift of air in Zephrah, or the Elemental Plane of Air). Folded, the pole works as a quarterstaff.",
    base=["Quarterstaff"], ch=[1, "1", "dawn"])
SP["Skysail"] = {"sp": [["Fly", 1]]}
add("Summer's Dance", "Weapon", "Rare", 1,
    "A golden scimitar that flexes like a reed. +1 to attack and damage rolls. It has 3 charges and regains 1 at dawn. While you wield it, spend 1 charge as a bonus action to cast Misty Step.",
    fx={"atk": 1, "dmg": 1}, base=["Scimitar"], ch=[3, "1", "dawn"])
SP["Summer's Dance"] = {"sp": [["Misty Step", 1]]}
add("Tinkertop Boltblaster 1000", "Weapon", "Very Rare", 1,
    "A hand crossbow of gears, wires and lacquered wood made in Hupperdook. +1 to attack and damage rolls. When you roll a 20 to hit, you can make another attack with it right after the critical hit. When you roll a 1 to hit, make a DC 14 Dexterity save or take 1d6 piercing damage as parts spring loose.",
    fx={"atk": 1, "dmg": 1}, base=["Hand Crossbow"])
add("Cataclysm Bolts", "Weapon", "Very Rare", 0,
    "Steel crossbow bolts made by the Jaggenstrike Clan, usually found in sets of ten. When you hit with one, the attack deals normal damage, then roll a d6:\n1-2: fire blast, 3d8 fire to the target and each creature within 5 feet.\n3-4: jagged ice, the target and each creature within 5 feet make a DC 17 Dexterity save or take 1d10 cold damage and are restrained until the end of your next turn.\n5: necrotic pulse, 2d6 necrotic damage and a DC 16 Strength save or stunned until the end of your next turn.\n6: shrapnel, make six more ranged attacks at the target with +7 to hit, 1d6 piercing each.\nA bolt that hits becomes normal ammunition.")
add("Rod of Mercurial Form", "Rod", "Uncommon", 0,
    "A steel rod engraved with weapon symbols and the monogram T.D. As a bonus action, speak the name of any simple or martial weapon to turn the rod into an ordinary weapon of that type. A ranged form makes its own ammunition, which vanishes after the attack hits or misses.")

# ---- staffs and wondrous items
tier("Spire of Conflux", "Staff", "Legendary", 1, "a spellcaster",
 "A relic of the Ashari leaders, passed down until Joran the Sea-Speaker was lost to an Abyssal demon. Keyleth found it again.",
 [{"t": "8 charges, regains 1d4 + 2 at dawn. While holding it, spend charges to cast burning hands (1) or fireball (3), using your spell save DC. You also gain +1 to spell attack rolls and +1 to your spell save DC.",
   "o": {"fx": {"spellAtk": 1, "spellDc": 1}, "base": ["Quarterstaff"], "ch": [8, "1d4+2", "dawn"]}, "sp": {"sp": [["Burning Hands", 1], ["Fireball", 3]]}},
  {"t": "12 charges, regains 1d6 + 2 at dawn. New spells: ice storm (4) and conjure elemental (5). When you cast a spell that deals bludgeoning, cold, fire, lightning or thunder damage and roll a 1 on a damage die, you can reroll that die and must use the new roll.",
   "o": {"fx": {"spellAtk": 1, "spellDc": 1}, "base": ["Quarterstaff"], "ch": [12, "1d6+2", "dawn"]}, "sp": {"sp": [["Burning Hands", 1], ["Fireball", 3], ["Ice Storm", 4], ["Conjure Elemental", 5]]}},
  {"t": "20 charges, regains 1d6 + 4 at dawn. New spells: chain lightning (6) and fire storm (7). The bonus to spell attack rolls and spell save DC becomes +2.",
   "o": {"fx": {"spellAtk": 2, "spellDc": 2}, "base": ["Quarterstaff"], "ch": [20, "1d6+4", "dawn"]}, "sp": {"sp": [["Burning Hands", 1], ["Fireball", 3], ["Ice Storm", 4], ["Conjure Elemental", 5], ["Chain Lightning", 6], ["Fire Storm", 7]]}}])

tier("Cabal's Ruin", "Wondrous Item", "Legendary", 1, None,
 "A heavy dark cloak with gold trim that sparks with arcane energy.",
 [{"t": "4 charges, regains 1d4 at dawn. When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. If the attack hits several targets, you choose one to take it. When an enemy's spell targets you, use your reaction to soak up some of it: it affects you normally and the cloak regains charges equal to the spell's level. Finish a rest to use that again.",
   "o": {"ch": [4, "1d4", "dawn"]}},
  {"t": "6 charges, regains 1d4 + 2 at dawn. You have an adjusted roll on saves against spells and magical effects (garbled in the source, see the book). When you absorb a spell, you also resist one damage type of that spell (your choice) until the end of your next turn.",
   "o": {"ch": [6, "1d4+2", "dawn"]}},
  {"t": "10 charges, regains 1d6 + 4 at dawn.",
   "o": {"ch": [10, "1d6+4", "dawn"]}}])

tier("Circlet of Barbed Vision", "Wondrous Item", "Legendary", 1, "a creature of non-good alignment",
 "A gnarled onyx circlet whose barbs dig into your head and twist your look to amuse the Spider Queen.",
 [{"t": "You have an adjusted roll on initiative (garbled in the source, see the book). Your Charisma score is lowered by 2. It returns when you take the circlet off, but you take 4d6 psychic damage when you do. Once between rests, as a reaction after you see an attack roll and before the result, add +5 to it.",
   "o": {"fx": {"abil": ["CHA", -2, 20]}, "ch": [1, "1", "short"]}},
  {"t": "You resist poison damage and are immune to the poisoned condition. You can use the +5 attack bonus twice between rests.",
   "o": {"fx": {"abil": ["CHA", -2, 20], "res": ["Poison"], "condImm": ["Poisoned"]}, "ch": [2, "all", "short"]}},
  {"t": "You are immune to poison damage (this replaces the resistance) and gain truesight to 60 feet. You can use the +5 attack bonus three times between rests.",
   "o": {"fx": {"abil": ["CHA", -2, 20], "imm": ["Poison"], "condImm": ["Poisoned"]}, "ch": [3, "all", "short"]}}])

tier("Kiss of the Changebringer", "Wondrous Item", "Legendary", 1, None,
 "A silver chain with a glittering emerald that hums with possibility.",
 [{"t": "+1 to saving throws. You are immune to the grappled condition while you wear it.",
   "o": {"fx": {"save": 1, "condImm": ["Grappled"]}}},
  {"t": "The save bonus becomes +2. You are also immune to the restrained condition. As an action you can cast Blink on yourself. Finish a rest to use that again.",
   "o": {"fx": {"save": 2, "condImm": ["Grappled", "Restrained"]}, "ch": [1, "1", "long"]}, "sp": {"sp": [["Blink", 1]]}},
  {"t": "The save bonus becomes +3. You are also immune to paralyzed and petrified. When you make an attack roll, ability check or saving throw, you can roll an extra d20 after the roll and before the result, then choose which of the two to use. Finish a rest to use that again.",
   "o": {"fx": {"save": 3, "condImm": ["Grappled", "Restrained", "Paralyzed", "Petrified"]}, "ch": [2, "all", "short", "One use each: Blink, extra d20. Tick one per use"]}, "sp": {"sp": [["Blink", 1]]}}])

tier("Titanstone Knuckles", "Wondrous Item", "Legendary", 1, None,
 "Gauntlets carved from the heartstone of a slain earth primordial.",
 [{"t": "Your Strength score becomes 22 while you wear them. Your weapon attacks deal double damage to objects and structures.",
   "o": {"fx": {"setsc": ["STR", 22]}}},
  {"t": "Your Strength becomes 24. As an action you can cast Enlarge/Reduce on yourself (enlarge only) for 10 minutes. Finish a long rest to use that again.",
   "o": {"fx": {"setsc": ["STR", 24]}, "ch": [1, "1", "long"]}, "sp": {"sp": [["Enlarge/Reduce", 1]]}},
  {"t": "Your Strength becomes 26. While the gauntlets' Enlarge/Reduce is on you, you resist cold, fire, lightning and thunder damage.",
   "o": {"fx": {"setsc": ["STR", 26]}, "ch": [1, "1", "long"]}, "sp": {"sp": [["Enlarge/Reduce", 1]]}}])

tier("Wraps of Dyamak", "Wondrous Item", "Legendary", 1, "a monk",
 "Thick strips of cloth stained dark red by blood of unknown origin, made by the ancient warrior-monk Dyamak.",
 [{"t": "+1 to attack and damage rolls with your unarmed strike while you wear them. When you finish a rest, you gain temporary hit points equal to your total ki points.",
   "o": {"fx": {"atk": 1, "dmg": 1}}},
  {"t": "The bonus becomes +2. As a bonus action you can cast Misty Step from the wraps, vanishing in a crimson mist. You cannot use it again until you finish a rest or score a critical hit with an unarmed strike against a hostile creature.",
   "o": {"fx": {"atk": 2, "dmg": 2}, "ch": [1, "1", "short"]}, "sp": {"sp": [["Misty Step", 1]]}},
  {"t": "The bonus becomes +3. When you hit with an unarmed strike, you can make it a ravenous strike: the target takes an extra 6d6 necrotic damage and you regain hit points equal to the necrotic damage dealt. You cannot use it again until you finish a rest or score a critical hit with an unarmed strike against a hostile creature.",
   "o": {"fx": {"atk": 3, "dmg": 3}, "ch": [2, "all", "short", "One use each: Misty Step, ravenous strike. Tick one per use"]}, "sp": {"sp": [["Misty Step", 1]]}}])

add("Boots of Haste", "Wondrous Item", "Very Rare", 1,
    "While you wear these boots, you can click your heels as a bonus action to cast Haste on yourself. You do not suffer the lethargy when the spell ends. After you use this, wait until the next dawn.",
    ch=[1, "1", "dawn"])
SP["Boots of Haste"] = {"sp": [["Haste", 1]]}
add("Boots of the Vigilant", "Wondrous Item", "Uncommon", 0,
    "While you wear these boots you sense danger coming. After you roll initiative, you can roll a d8 and add it to your initiative. After you use this, wait until the next dawn.",
    ch=[1, "1", "dawn"])
add("Stormrider Boots", "Wondrous Item", "Rare", 0,
    "Plain-looking dark leather boots with a storm-cloud pattern on the soles. You can activate them as part of your movement. Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it must succeed on a DC 15 Dexterity save or take 3d8 lightning damage (a creature takes this at most once per turn). After you use this, wait until the next dawn.",
    ch=[1, "1", "dawn"])
add("Circlet of Wisdom", "Wondrous Item", "Unknown", 0,
    "This circlet raises your Wisdom score by 2, to a maximum of 20. Keyleth, Voice of the Tempest, wears one.",
    fx={"abil": ["WIS", 2, 20]})
add("Coat of the Crest", "Wondrous Item", "Rare", 1,
    "A brocade coat in the long, high-collared style of the Clovis Concord. You can wear it over light armor. +1 to AC while you wear it. It has 3 charges and regains 1d3 at dawn. When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. The resistance works against that attack and lasts until the start of your next turn.",
    fx={"ac": 1}, ch=[3, "1d3", "dawn"])
add("Doublet of Dramatic Demise", "Wondrous Item", "Common", 0,
    "A satin jacket for dramatic last moments. When you drop to 0 hit points while wearing it, you do not fall unconscious. You are incapacitated and your speed is 0, but you can speak and communicate. You make death saving throws as normal, but a roll of 1 on the d20 means you gasp and die at once.")
add("Echo Stone", "Wondrous Item", "Uncommon", 0,
    "A dull-blue river stone that is almost silent when dropped. Squeeze it as an action to make it glow for 1 minute. It records all sound within 15 feet while glowing, then repeats the recording at the same volume every 5 minutes until you squeeze it again as an action. Squeezing it twice in quick succession as an action makes it play back the last recording instead.")
add("Earthboard", "Wondrous Item", "Rare", 1,
    "A granite slab 3 inches thick, 9 feet long and 2 feet wide. It weighs 40 pounds while a creature is attuned to it. While you stand on it you gain: a speed of 60 feet on solid ground (not liquid), a jump of up to 60 feet off solid earth with an optional ground slam on landing (creatures standing on the ground within 20 feet make a DC 14 Strength save or fall prone), a burrowing speed of 20 feet through earth or solid rock that leaves a 5-foot tunnel (as an action raise it to 60 feet until the start of your next turn). The board moves with you until you dismount. The benefits end when you end a turn off the board.")
add("Flamefriend Lantern", "Wondrous Item", "Rare", 1,
    "A wrought-iron lantern that holds a small fire elemental spirit. To attune you must also succeed on a DC 10 Charisma check to bond with it.\n**Light and Flame.** While attuned, you can ask the spirit to glow (no action): bright light in a radius you choose up to 60 feet and dim light for the same distance more. You can cast Produce Flame from it at will (Wisdom is the spellcasting ability).\n**Elemental Essence.** As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (save DC 15). After you cast it this way, you cannot do so until you use this property again. After the spirit shares power, it cannot do so again until the next dawn.\n**Willful Attunement.** Attunement lasts until you end it or anger the elemental (dousing the lantern in water, attacking a nonhostile elemental). To attune again, repeat the check during a rest, with an adjusted roll until you make amends (garbled in the source, see the book).",
    ch=[1, "1", "dawn"])
SP["Flamefriend Lantern"] = {"sp": [["Produce Flame", 0], ["Burning Hands", 1, 3]], "dc": 15}
add("Mirror of Infinite Transpondence", "Wondrous Item", "Very Rare", 0,
    "Silver hand mirrors that come in pairs. As an action a mirror links to its pair for 10 minutes, so the two act as opposite sides of one open window, even across planes. After three activations from either end, the link cannot be activated again until the next dawn. A single mirror found by itself has its pair held by someone the GM chooses or rolls (Emon, Whitestone, Kymal, Westruun, Syngorn, the Elemental Plane of Water, the Plane of Shadow, or an untraceable place).",
    ch=[3, "3", "dawn"])
add("Raven's Slumber", "Wondrous Item", "Very Rare", 0,
    "A black crystal pendant that is a gateway to a small pocket dimension. You can use it as an improvised weapon for a melee or ranged attack against a Large or smaller creature. On a hit, the target must succeed on a DC 10 Wisdom save or be trapped inside. A creature that wants to be trapped can fail on purpose. Only one creature can be held at a time. The prisoner sees the world outside as through a window and knows how much time passes. As a bonus action you can release it into an empty space within 5 feet of you. If a companion from a class feature, or a tamed beast companion, drops to 0 hit points within 100 feet of you, it is drawn into the pendant and stabilized. If the pendant already holds a creature, this fails.")
add("Sunbeam Compass", "Wondrous Item", "Unknown", 0,
    "A needle in a glass orb that always points at the sun and glows at its tip. It can turn in every direction, so it helps in underground exploration. Made by Karaline von Ethro.")

# ---- gear: [name, cost gp, weight lb, type, text]
GEAR += [
 ["Azuremite", 0, 0, "Trade Good", "A blue crystal formed from psychic energy in the Crystalfen Caverns. Refined into fine dust it is a strong mind-altering drug that causes temporary visions and psychic effects. Mining it is illegal in many places and the caverns are deadly."],
 ["Dynamite", 100, 0, "Explosive", "A bundle of explosives. Light it and throw it up to 30 feet as an action. It explodes at the start of your next turn. Creatures and objects within 20 feet make a DC 12 Dexterity save, taking 6d6 fire damage on a failure or half on a success."],
 ["Gluebomb", 50, 0, "Explosive", "A throwable explosive, primed and thrown up to 30 feet as an action. It bursts on impact. Creatures within 20 feet make a DC 12 Dexterity save or are restrained for 1 minute. A restrained creature can make a DC 12 Strength check as an action to escape."],
 ["Stink Bomb", 25, 0, "Explosive", "A smelly explosive, primed and thrown up to 30 feet as an action. It goes off at the start of your next turn. Creatures within 20 feet make a DC 12 Constitution save or are poisoned for 1 minute, repeating the save at the end of each of their turns."],
 ["Oloore Root Teabag", 100, 0, "Other", "A ritual root once used by oracles to leave the body and sense gods and spirits, now also taken for fun. Drinking the tea is an action and needs a DC 19 Constitution save. On a failure you hallucinate for 1d4 hours with an adjusted roll on attacks and ability checks (garbled in the source, see the book), and failing by 10 or more also gives a level of exhaustion. On a success you can cast Scrying once in the next 1d4 hours."],
 ["Plainscow", 200, 0, "Mount", "A very sturdy beast of burden of the Dividing Plains, 6 feet tall, about 2 tons, living about 70 years. Unusually empathetic, it often bonds with a rider for life. Carrying capacity 1,500 pounds. Sold in Westruun."],
 ["Residuum", 500, 1, "Trade Good", "Pure arcane residue from whitestone, worth about 500 gp per pound. It can stand in for spell material components that are consumed, at equal value. Items built with at least an ounce of whitestone take one quarter of the normal crafting time."],
 ["Residuum Enchanting Slate", 20000, 0, "Trade Good", "A glassy green slate blown from residuum, used in a stationary enchanting table. It cuts the crafting time of every magic item to one quarter. Archmages pay 20,000 gp or more."],
 ["Skyship", 100000, 0, "Airship", "Speed 10 miles per hour, cargo 10 tons, crew of six to ten, room for up to 30 passengers. Buying one needs a personal link to the Alsfarin Union in Ank'Harel. Passenger fare is 2 gp per mile on standard sky routes, 15 gp per mile to charter elsewhere, cargo 1 gp per mile per 100 pounds (double off-route)."],
 ["Suude (Blue)", 0, 0, "Other", "A glittering powder refined from residuum. Burn it in a vessel and inhale as an action: take 4d10 psychic damage and make a DC 10 Constitution save. On a failure you are poisoned for 1 hour and unconscious for 1 minute (or until shaken awake). Each extra dose within 1 hour adds 5 to the DC. Failing by 10 or more drops you to 0 hit points. On a success, for 1 minute you can use the Twinned Spell Metamagic option once, with no sorcery points. It is highly addictive."],
 ["Suude (Brown)", 0, 0, "Other", "A glittering powder refined from residuum. Burn it in a vessel and inhale as an action: take 4d10 psychic damage and make a DC 10 Constitution save. On a failure you are poisoned for 1 hour and unconscious for 1 minute (or until shaken awake). Each extra dose within 1 hour adds 5 to the DC. Failing by 10 or more drops you to 0 hit points. On a success, for 1 minute you can use the Extended Spell Metamagic option once, with no sorcery points. It is highly addictive."],
 ["Suude (Red)", 0, 0, "Other", "A glittering powder refined from residuum. Burn it in a vessel and inhale as an action: take 4d10 psychic damage and make a DC 10 Constitution save. On a failure you are poisoned for 1 hour and unconscious for 1 minute (or until shaken awake). Each extra dose within 1 hour adds 5 to the DC. Failing by 10 or more drops you to 0 hit points. On a success, for 1 minute you can use the Distant Spell Metamagic option once, with no sorcery points. It is highly addictive."],
 ["Whitestone", 0, 0, "Trade Good", "Mountain stone full of leftover arcane power, very receptive to enchantment. Items made with at least an ounce of whitestone take one quarter of the normal crafting time. Alchemists in Emon dissolve it with acids to leave pure residuum."],
 ["Writing Kit", 0, 0, "Adventuring Gear", "Includes a pouch, a quill, a 1-ounce bottle of ink, one sheet of parchment and a penknife."],
 ["Zeal", 150, 0, "Other", "A purple, ashy-tasting gel distilled from demon ichor, once used by Tal'Dorei berserkers. Smear it on your skin as an action and make a DC 12 Constitution save. On a failure you are paralyzed for 1d4 rounds. On a success your weapon attacks deal an extra 1d6 damage for 1 minute, then you gain 1 level of exhaustion. Addictive, and long use causes mental and physical decline."],
]

add("+2 Ring of Protection", "Ring", "Rare", 1,
    "A ring that gives +2 to AC and +2 to saving throws while you wear it.",
    fx={"ac": 2, "save": 2})
