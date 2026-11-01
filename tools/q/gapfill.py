#!/usr/bin/env python3
"""Library entries that spell pages point to but the Library lacked: Artificer class and subclasses, Khoravar, dragonmark feats, Boon of Siberys, two Warlock pacts.
Own wording, facts checked against 5e.tools EFA and XPHB data. python3 tools/q/gapfill.py -> src/data/q23-gapfill.js"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rows = {}
def add(cat, n, s, sub, tl, p):
    r = {"n": n, "s": s, "sub": sub, "tl": tl, "p": p}
    r["tx"] = (n + " " + sub + " " + " ".join(v for _, v in tl) + " " + " ".join(x if isinstance(x, str) else x[1] for x in p)).lower()
    rows.setdefault(cat, []).append(r)
# ---- Artificer
add("class", "Artificer", "efa", "Class • d8 Hit Die • Intelligence",
    [["Hit Die", "d8"], ["Primary Ability", "Intelligence"], ["Saving Throws", "Constitution, Intelligence"], ["Armor", "Light, Medium, Shields"], ["Weapons", "Simple"],
     ["Tools", "Thieves' Tools, Tinker's Tools, one Artisan's Tools"], ["Skills", "Choose 2: Arcana, History, Investigation, Medicine, Nature, Perception, Sleight of Hand"], ["Spellcasting", "Intelligence, prepared"]],
    ["The Artificer binds magic to objects. You cast spells through tools and crafted items, build temporary gear on demand, and copy or tinker with magic items. Intelligence powers your spells and most class features.",
     ["Features by level", "1: Spellcasting, Tinker's Magic. 2: Replicate Magic Item. 3: Artificer Subclass. 4, 8, 12, 16: Ability Score Improvement. 6: Magic Item Tinker. 7: Flash of Genius. 10: Magic Item Adept. 11: Spell-Storing Item. 14: Advanced Artifice. 18: Magic Item Master. 19: Epic Boon. 20: Soul of Artifice. Subclass features arrive at levels 3, 5, 9 and 15."],
     ["Subclasses", "Alchemist, Armorer, Artillerist, Battle Smith, Cartographer."],
     "This is the 2024 style class from the Eberron book. The older Tasha's version has the same four subclasses without Cartographer."])
SUB = [
 ("Alchemist", "You mix reagents into magical potions and elixirs that heal, harm or boost your allies.", ["Alchemist Spells: a fixed list of spells that are always prepared.", "Experimental Elixir: after a Long Rest, holding Alchemist's Supplies, you produce two elixirs. Each takes a random effect from a table and fades when used or at the next Long Rest.", "Tools of the Trade: proficiency with Alchemist's Supplies and the Herbalism Kit."]),
 ("Armorer", "You turn a suit of armor into a second skin that sharpens your spells, adds weapons, and makes you hard to move.", ["Armorer Spells: always-prepared spells.", "Arcane Armor: with Smith's Tools in hand and a Magic action, your worn armor becomes Arcane Armor that you can take off or put on at will, ignores Strength requirements, and counts as a spellcasting focus.", "Armor Model: pick Dreadnaught (a force-powered melee fist and extra reach), Guardian (thunder gauntlets that mark targets) or Infiltrator (a lightning launcher and stealth bonus).", "Tools of the Trade: heavy armor training and proficiency with Smith's Tools."]),
 ("Artillerist", "You bring a flexible magical cannon to every fight and hurl energy from a distance.", ["Artillerist Spells: always-prepared spells.", "Eldritch Cannon: with Smith's or Woodcarver's Tools you create a small or tiny cannon. Choose a Flamethrower, Force Ballista or Protector, each with its own attack or defensive effect.", "Tools of the Trade: martial ranged weapons and Woodcarver's Tools."]),
 ("Battle Smith", "You fight beside a constructed companion and mend allies and gear between blows.", ["Battle Smith Spells: always-prepared spells.", "Steel Defender: you build a loyal construct companion that fights for you and can be repaired.", "Battle Ready: use Intelligence for attack and damage rolls with magic weapons.", "Tools of the Trade: proficiency with Smith's Tools and a weapon-crafting benefit."]),
 ("Cartographer", "You draw magical maps that reveal danger, guard your party, and open paths across long distances.", ["Cartographer Spells: always-prepared spells.", "Adventurer's Atlas: after a Long Rest, holding Cartographer's Tools, you give a group of creatures magical maps that grant benefits while they carry them.", "Mapping Magic: you can cast Faerie Fire without a slot a limited number of times and the targets are outlined as if in ink.", "Tools of the Trade: Calligrapher's Supplies and Cartographer's Tools."]),
]
for n, intro, ft in SUB:
    add("sub", n, "efa", "Artificer subclass", [["Class", "Artificer"], ["Level", "3"]], [intro, ["Level 3 features", " ".join(ft)]])
# ---- Khoravar
add("species", "Khoravar", "efa", "Species • Small or Medium • Speed 30 ft",
    [["Creature Type", "Humanoid"], ["Size", "Small or Medium"], ["Speed", "30 ft."], ["Darkvision", "60 ft."]],
    [["Darkvision", "You see in dim light within 60 feet as if it were bright, and in darkness as if it were dim."], ["Fey Ancestry", "You have advantage on saving throws to avoid or end the Charmed condition."],
     ["Fey Gift", "You know the Friends cantrip. After each Long Rest you may swap it for another cantrip from the Cleric, Druid or Wizard list. Intelligence, Wisdom or Charisma is its spellcasting ability, chosen when you pick this species."],
     ["Lethargy Resilience", "When you fail a save against the Unconscious condition, you can succeed instead. After using this, you cannot do so again for 1d4 Long Rests."],
     ["Skill Versatility", "You gain proficiency in one skill or one tool of your choice. After each Long Rest you can swap it for another skill or tool."]])
# ---- dragonmark feats
M = [
 ("Detection", "Intelligence (Investigation) or Wisdom (Insight)", "Detect Magic and Detect Poison and Disease", "See Invisibility", ""),
 ("Finding", "Wisdom (Perception or Survival)", "Hunter's Mark", "Locate Object", ""),
 ("Handling", "Intelligence (Nature) or Wisdom (Animal Handling)", "Animal Friendship and Speak with Animals", "", "From level 3, those two spells can also target a Monstrosity whose Intelligence is 3 or lower."),
 ("Healing", "Wisdom (Medicine) or a check with a Herbalism Kit", "Cure Wounds", "Lesser Restoration", ""),
 ("Hospitality", "Charisma (Persuasion) or a check with Brewer's Supplies or Cook's Utensils", "Purify Food and Drink and Unseen Servant", "Calm Emotions", ""),
 ("Making", "Intelligence (Arcana) or a check with Artisan's Tools", "Magic Weapon", "", "You also know the Mending cantrip."),
 ("Passage", "Strength (Athletics) or Dexterity (Acrobatics)", "Misty Step", "", "Your Speed increases by 5 feet."),
 ("Scribing", "Intelligence (History) or a check with Calligrapher's Supplies", "Comprehend Languages", "Magic Mouth", "You also know the Message cantrip."),
 ("Sentinel", "Wisdom (Insight or Perception)", "Shield", "", "Vigilant Guardian: when a creature you can see within 5 feet is hit by an attack, you can use a Reaction to swap places with it and take the hit instead. You can do this a number of times equal to your Proficiency Bonus, and regain all uses after a Long Rest."),
 ("Shadow", "Dexterity (Stealth) or Charisma (Performance)", "Invisibility", "", "You also know the Minor Illusion cantrip."),
 ("Storm", "Dexterity (Acrobatics) or a check with Navigator's Tools", "", "Gust of Wind", "You have Resistance to Lightning damage and know the Thunderclap cantrip."),
 ("Warding", "Intelligence (Investigation) or a check with Thieves' Tools", "Alarm and Mage Armor", "Arcane Lock", ""),
]
for k, chk, sp, sp3, extra in M:
    p = ["When you make a " + chk + " check, you can add 1d4 to the roll."]
    if sp: p.append("You always have " + sp + " prepared. You can cast " + ("each of them" if " and " in sp else "it") + " once without a spell slot, and you regain that use after a Long Rest. You can also cast " + ("them" if " and " in sp else "it") + " with spell slots. Intelligence, Wisdom or Charisma is the spellcasting ability, chosen when you take this feat.")
    if sp3: p.append("At character level 3 you also always have " + sp3 + " prepared and can cast it the same way.")
    if extra: p.append(extra)
    p.append("If you have Spellcasting or Pact Magic, the spells of the Mark of " + k + " join that class's spell list.")
    add("feat", "Mark of " + k, "efa", "Dragonmark Feat • Eberron", [["Category", "Dragonmark"], ["Prerequisite", "Eberron campaign. Only one dragonmark feat."]], p)
add("feat", "Boon of Siberys", "efa", "Epic Boon • Eberron", [["Category", "Epic Boon"], ["Prerequisite", "Level 19+, Eberron campaign"], ["Ability Score", "+1 to one ability, up to 30"]],
    ["You carry a fragment of the dragonmark source in the sky.",
     ["Aberrant Magic", "Choose a spell of level 8 or lower from the Sorcerer list or from the Siberys Dragonmark Spells table. You always have it prepared. You can cast it once without a slot or components and regain that use after a Short or Long Rest. You can also cast it with slots. Intelligence, Wisdom or Charisma is its spellcasting ability, chosen when you take the feat."]])
# ---- pacts
add("optfeat", "Pact of the Tome", "core", "Eldritch Invocation • Pact boon", [["Type", "Eldritch Invocation"], ["Book", "PHB'24"]],
    ["After a Short or Long Rest you conjure a Book of Shadows. It vanishes if you conjure another or die.",
     ["Cantrips and Rituals", "Choose three cantrips and two level 1 spells with the Ritual tag, from any class list. While the book is on you, you have them prepared and they count as Warlock spells."], ["Focus", "The book works as your spellcasting focus."]])
add("optfeat", "Pact of the Chain", "core", "Eldritch Invocation • Pact boon", [["Type", "Eldritch Invocation"], ["Book", "PHB'24"]],
    ["You learn Find Familiar and can cast it as a Magic action without a slot. Besides the usual forms, your familiar can be an Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite or Venomous Snake.",
     "When you take the Attack action, you can give up one of your attacks so your familiar makes one attack with its Reaction."])
js = "/* Generated by tools/q/gapfill.py. Own wording. Do not edit by hand. */\n(function(){\nvar R=" + json.dumps(rows, ensure_ascii=False) + ";\nwindow.QREFS=window.QREFS||{};Object.keys(R).forEach(function(c){window.QREFS[c]=(window.QREFS[c]||[]).concat(R[c]);});\n})();\n"
open(os.path.join(ROOT, "src", "data", "q23-gapfill.js"), "w", encoding="utf-8").write(js); print({k: len(v) for k, v in rows.items()})
