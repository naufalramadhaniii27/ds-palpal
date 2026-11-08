#!/usr/bin/env python3
"""Second gap fill after the 5etools category comparison: backgrounds (Eberron houses, Project Lamordia, Custom), Greater dragonmark feats, Potent Dragonmark,
basic and Eberron Bastion facilities, MPMM Genasi and Yuan-Ti, Boon of Skill Proficiency.
Facts come from 5etools data, wording is our own.  python3 tools/q/gapfill2.py [5etools data dir] -> src/data/q24-gapfill2.js"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = (sys.argv[1] if len(sys.argv) > 1 else "/home/claude/5etools-src/data").rstrip("/") + "/"
rows = {}
def add(cat, n, s, sub, tl, p):
    r = {"n": n, "s": s, "sub": sub, "tl": tl, "p": p}
    r["tx"] = (n + " " + sub + " " + " ".join(v for _, v in tl) + " " + " ".join(x if isinstance(x, str) else x[1] for x in p)).lower()
    rows.setdefault(cat, []).append(r)
AB = {"str": "Strength", "dex": "Dexterity", "con": "Constitution", "int": "Intelligence", "wis": "Wisdom", "cha": "Charisma"}
def nm(s): return re.sub(r"\|.*", "", s).title().replace("Of ", "of ").replace("The ", "the ") if s else s
def cap(s): return " ".join(w if w in ("of", "and") else w[:1].upper() + w[1:] for w in s.split(" "))
# ---- backgrounds
HOUSE = {"Aberrant": "a person whose dragonmark is aberrant, wild and unrecognised by any house",
         "Cannith": "House Cannith, the house of Making", "Deneith": "House Deneith, the house of Sentinel", "Ghallanda": "House Ghallanda, the house of Hospitality",
         "Jorasco": "House Jorasco, the house of Healing", "Kundarak": "House Kundarak, the house of Warding", "Lyrandar": "House Lyrandar, the house of Storm",
         "Medani": "House Medani, the house of Detection", "Orien": "House Orien, the house of Passage", "Phiarlan": "House Phiarlan, the house of Shadow",
         "Sivis": "House Sivis, the house of Scribing", "Tharashk": "House Tharashk, the house of Finding", "Thuranni": "House Thuranni, the house of Shadow",
         "Vadalis": "House Vadalis, the house of Handling"}
for x in json.load(open(D + "backgrounds.json"))["background"]:
    n = x["name"]
    if x["source"] not in ("EFA", "PL", "PHB") or not (n.endswith(" Heir") or x["source"] == "PL" or n == "Custom Background") or x.get("edition") == "classic": continue
    if n == "Custom Background":
        add("bg", n, "phb", "Background • Custom", [["Skills", "Any two"], ["Languages or tools", "Any two"], ["Equipment", "The package of any background"]],
            ["Build your own background. Take two skill proficiencies, two picks from languages or tool proficiencies, and the equipment package of any background in the book. Choose one feature from any background. Pick a feat that fits your story, using the Origin feat rules."]); continue
    ab = x["ability"][0]["choose"]["weighted"]["from"]
    feats = []
    for f in x.get("feats", []):
        for k in f:
            if k == "anyFromCategory": feats.append("a feat from the " + ", ".join(f[k]["category"]) + " category")
            else: feats.append(nm(k))
    sk = [cap(k) for s in x.get("skillProficiencies", []) for k in s if s[k] is True]
    tools = []
    for t in x.get("toolProficiencies", []):
        for k, v in t.items():
            tools.append("One kind of artisan's tools" if k == "anyArtisansTool" else "One gaming set" if k == "anyGamingSet" else "One musical instrument" if k == "anyMusicalInstrument" else cap(k))
    eq = ""
    for blk in x.get("startingEquipment", []):
        a = blk.get("a", []); gp = [i["value"] // 100 for i in a if isinstance(i, dict) and "value" in i]
        names = []
        for i in a:
            if isinstance(i, str): names.append(nm(i))
            elif isinstance(i, dict) and "item" in i: names.append((str(i.get("quantity", "")) + " " if i.get("quantity") else "") + (i.get("displayName") or nm(i["item"])))
            elif isinstance(i, dict) and "equipmentType" in i: names.append(i.get("displayName") or {"toolArtisan": "One set of artisan's tools", "setGaming": "One gaming set", "instrumentMusical": "One musical instrument"}.get(i["equipmentType"], "Tools"))
        eq = ", ".join(names) + (", " + str(gp[0]) + " GP" if gp else "") + ". Or take 50 GP instead."
    abtxt = ", ".join(AB[a] for a in ab)
    if n.endswith(" Heir"):
        key = n.replace(" Heir", "").replace("House ", ""); who = HOUSE.get(key, key)
        intro = "You belong to " + who + ". Your family expects you to use the mark for the house's ends, and the house expects you to answer for it." if key != "Aberrant" else "You carry an aberrant dragonmark and are " + who + ". You grew up hiding it, or fighting for the right to keep it."
    else:
        intro = "A Project Lamordia background. It marks a person whose past runs through the strange, grim stories of that setting."
    tl = [["Ability Scores", abtxt], ["Origin Feat", " or ".join(feats)], ["Skills", " and ".join(sk)], ["Tool", " and ".join(tools) or "None"], ["Equipment", eq]]
    add("bg", n, x["source"].lower(), "Background • " + ("Eberron" if x["source"] == "EFA" else "Lamordia"), tl,
        [intro, ["Ability scores", "Raise one of " + abtxt + " by 2 and another by 1, or raise all three by 1."]])
# ---- Greater dragonmark feats (own wording)
G = {
 "Aberrant Mark": ("Aberrant Dragonmark", ["Fortitude die grows from d4 to d6, and it refreshes on a Short or Long Rest.", "When you cast a cantrip you may spend one or two Hit Point Dice. Roll them, gain that many Temporary Hit Points plus your Constitution modifier, and one creature you choose within 30 feet takes that much Force damage. Uses equal your Proficiency Bonus per Long Rest."]),
 "Mark of Detection": ("Mark of Detection", ["Deductive Intuition die grows from d4 to d6.", "When you cast See Invisibility through the mark, one creature you can see within 30 feet shares its effect."]),
 "Mark of Finding": ("Mark of Finding", ["Hunter's Intuition die grows from d4 to d6.", "When you cast Hunter's Mark through the mark, its range doubles and the target can't gain the benefit of being Invisible."]),
 "Mark of Handling": ("Mark of Handling", ["Wild Intuition die grows from d4 to d6.", "While mounted, after you hit a target within 5 feet of your mount with a melee attack, your mount can use its Reaction to move up to its Speed or make one attack.", "As a Magic action you command a Beast or Monstrosity within 30 feet. On a failed Wisdom save it is Frightened until the start of your next turn."]),
 "Mark of Healing": ("Mark of Healing", ["Medical Intuition die grows from d4 to d6.", "You can cast Cure Wounds through Healing Touch without a slot a number of times equal to your Proficiency Bonus per Long Rest. When you roll healing dice for it, treat a 1 or 2 as a 3."]),
 "Mark of Hospitality": ("Mark of Hospitality", ["Ever Hospitable die grows from d4 to d6.", "You can alter Purify Food and Drink so it refreshes creatures instead. Each chosen creature within 30 feet loses one level of Exhaustion and gains Temporary Hit Points equal to your Proficiency Bonus plus a mental ability modifier you choose when you take the feat. Once per Long Rest."]),
 "Mark of Making": ("Mark of Making", ["Artisan's Intuition die grows from d4 to d6.", "When you cast Magic Weapon through Spellsmith, it takes effect as a level 3 spell."]),
 "Mark of Passage": ("Mark of Passage", ["Intuitive Motion die grows from d4 to d6.", "When you cast Misty Step through the mark, up to two willing creatures within 30 feet can use their Reactions to teleport up to 30 feet to a free space they can see."]),
 "Mark of Scribing": ("Mark of Scribing", ["Gifted Scribe die grows from d4 to d6.", "You can stretch Comprehend Languages to three willing creatures within 30 feet. For the duration you and they can speak telepathically within 1 mile. Once per Long Rest."]),
 "Mark of Sentinel": ("Mark of Sentinel", ["Sentinel's Intuition die grows from d4 to d6.", "When you use Vigilant Guardian, you can also make one weapon attack or Unarmed Strike as part of the same Reaction."]),
 "Mark of Shadow": ("Mark of Shadow", ["Cunning Intuition die grows from d4 to d6.", "When you cast Invisibility through Shape Shadows, it takes effect as a level 3 spell."]),
 "Mark of Storm": ("Mark of Storm", ["Windwright's Intuition die grows from d4 to d6.", "When you cast Gust of Wind through Storm Magic, you also gain a 60 foot Fly Speed for the spell's duration."]),
 "Mark of Warding": ("Mark of Warding", ["Warder's Intuition die grows from d4 to d6.", "As a Reaction you can impose Disadvantage on an attack roll against you or a creature you see within 30 feet. Uses equal your Proficiency Bonus per Long Rest."]),
}
for k, (base, ben) in G.items():
    add("feat", "Greater " + k, "efa", "Greater Dragonmark Feat • Eberron", [["Category", "General"], ["Prerequisite", "Level 4+, " + base + " feat"]],
        ["Your dragonmark deepens. This feat builds on " + base + "."] + [["Benefit " + str(i + 1), b] for i, b in enumerate(ben)])
add("feat", "Potent Dragonmark", "efa", "Greater Dragonmark Feat • Eberron", [["Category", "General"], ["Prerequisite", "Level 4+, any Dragonmark feat"], ["Ability Score", "+1 to the spellcasting ability of your Dragonmark feat, up to 20"]],
    ["Your mark's spells are always ready and you gain a slot to power them.", ["Preparation", "The spells on your Spells of the Mark list are always prepared."],
     ["Extra slot", "You gain one extra spell slot for your Dragonmark spells. Its level is half your character level rounded up, to a maximum of 5. You regain it after a Short or Long Rest. It can cast only spells you have prepared through your Dragonmark feat or this feat."]])
# ---- facilities: name -> (source, level, space, hirelings, order, paragraphs). Own wording, rules numbers kept.
ENL = ["Enlarging", "Pay 2,000 GP to make it Vast."]
F = [
 ("Barrack", "xdmg", "Level 5", "Roomy or Vast", "1", "Recruit", ["Sleeping quarters for Bastion Defenders. You can build more than one. Each Barrack houses up to twelve Defenders.",
   ["Recruit: Bastion Defenders", "Each Recruit order adds up to four Defenders to this Barrack at no cost. You can't use it while the Barrack is full. Track the Defenders in each Barrack and remove any you lose. You name them and give them personalities."], ["Enlarging", "Pay 2,000 GP to make it Vast. A Vast Barrack holds up to twenty-five Defenders."]]),
 ("Bedroom", "xdmg", "Basic", "Cramped, Roomy or Vast", "None", "None", ["A basic facility. It comes with plain furnishings suited to the room. It has no hireling and no order. A bigger room only means more space and comfort."]),
 ("Kitchen", "xdmg", "Basic", "Cramped, Roomy or Vast", "None", "None", ["A basic facility. It comes with plain furnishings suited to a kitchen. It has no hireling and no order."]),
 ("Garden", "xdmg", "Level 5", "Roomy or Vast", "1 (2 if Vast)", "Harvest", ["A plot you plant for a purpose. You can own several. Choose a type each time you add one. The hireling can switch the type, which takes 21 days and stops all other work in the Garden.",
   ["Harvest: Garden Growth", "The Harvest order takes 7 days and costs nothing. The hireling collects the yield for the Garden's type."],
   ["Garden types", "Decorative: ten bouquets worth 5 GP each, ten vials of perfume, or ten candles. Food: 100 days of rations. Herb: ten healer's kits or one Potion of Healing. Poison: two vials of antitoxin or one vial of basic poison."],
   ["Enlarging", "Pay 2,000 GP to make it Vast. A Vast Garden counts as two Roomy ones, each with its own type and its own harvest, and gains one more hireling."]]),
 ("Library", "xdmg", "Level 5", "Roomy", "1", "Research", ["Shelves of books, with desks and reading chairs.",
   ["Research: Topical Lore", "The hireling studies one topic for 7 days. It can be a legend, an event, a place, an important person, a type of creature or a famous object. They return with up to three true facts you did not know. Your DM picks the facts."]]),
 ("Pub", "xdmg", "Level 13", "Roomy or Vast", "1 (4 if Vast)", "Research", ["A bar, café or tea room with a name of your choice. The bartender runs a network of spies that drink there, often in disguise.",
   ["Research: Information Gathering", "For the next 7 days the spies hear about every important event within 10 miles. They can also reveal where any creature you know is, if it lies within 50 miles and is not hidden by magic or out of the network's reach. They learn where the target has been over the past 7 days as well."],
   ["Pub Special", "One magical drink is on tap. Each lasts 24 hours and loses its magic after 24 hours in the glass. Bigby's Burden: the Enlarge effect, no save. Kiss of the Spider Queen: Spider Climb. Moonlight Serenade: Darkvision 60 feet, or +60 feet if you have it. Positive Reinforcement: resistance to Necrotic damage. Sterner Stuff: you automatically succeed on saves against Frightened. You can swap the drink at the start of any Bastion turn."],
   ["Enlarging", "Pay 2,000 GP to make it Vast. Two drinks can be on tap at once, and three server hirelings join."]]),
 ("War Room", "xdmg", "Level 17", "Vast", "Lieutenants", "Recruit", ["A table, chairs and war trophies where you plan campaigns with your lieutenants. Each lieutenant is a Veteran Warrior with your alignment. You start with two. They are hirelings, not Defenders. If lieutenants live in the Bastion and it is attacked, each one lowers by 1 the number of dice you roll for Defenders lost. Without housing they stay in the nearest inn or settlement.",
   ["Recruit: Lieutenant", "Gain one new lieutenant, up to ten in all. You name them."],
   ["Recruit: Soldiers", "Each lieutenant you assign raises one hundred Guards in 7 days. Or twenty mounted Guards on Riding Horses. Feeding each guard and each horse costs 1 GP a day. A lieutenant or you must lead the army, or it disbands. It also disbands after a day without food. You can't raise another army until this one is gone."]]),
 ("Workshop", "xdmg", "Level 5", "Roomy or Vast", "3 (5 if Vast)", "Craft", ["A crafting space with six kinds of artisan's tools. When you build it, pick six from Carpenter's, Cobbler's, Glassblower's, Jeweler's, Leatherworker's, Mason's, Painter's, Potter's, Tinker's, Weaver's and Woodcarver's tools.",
   ["Craft: Adventuring Gear", "The hirelings make anything those tools can make, using the crafting rules in the Player's Handbook."],
   ["Craft: Magic Item (Implement)", "At level 9 or higher, they craft a Common or Uncommon item from the Implements tables. They have the tool, Arcana proficiency and the right skills. If the item casts spells, you must craft it yourself with help, and keep those spells prepared on every day of crafting."],
   ["Source of Inspiration", "Spend a Short Rest here to gain Heroic Inspiration. Once per Long Rest."],
   ["Enlarging", "Pay 2,000 GP to make it Vast. It gains two hirelings and three more tool kinds."]]),
 ("Artificer's Forge", "efa", "Level 13", "Roomy", "2", "Craft", ["Two magewright hirelings who are skilled at making magic items.",
   ["Crafting Assistants", "If you craft a magic item in the Bastion by the Dungeon Master's Guide rules, one or both hirelings can help and shorten the time."],
   ["Craft: Magic Item", "The hirelings make a Common or Uncommon magic item of your choice. They have the needed tool and Arcana proficiency, they help each other to cut the time, and they have any spells the item casts prepared."],
   ["Charge Refreshment", "When a magic item in your Bastion regains charges, it regains 1 extra charge."]]),
 ("Construct Forge", "efa", "Level 17", "Vast", "2", "Recruit", ["A forge for building Constructs.",
   ["Recruit: Construct", "The hirelings build one Construct from the Forge Constructs table for the time and cost shown. They count as Bastion Defenders, and you remove any you lose. You can choose not to count one as a Defender. It then acts by its nature and uses its Monster Manual stat block."],
   ["Forge Constructs", "Animated Armor: 14 days, 1,000 GP. Animated Broom: 7 days, 250 GP. Animated Flying Sword: 7 days, 250 GP. Animated Rug of Smothering: 21 days, 2,000 GP. Helmed Horror: 42 days, 5,000 GP. Scarecrow: 14 days, 1,000 GP. Shield Guardian: 63 days, 25,000 GP. Warforged Titan: 250 days, 200,000 GP."]]),
 ("Dragonmark Outpost", "efa", "Level 5", "Roomy", "1", "Empower", ["A space reserved for your dragonmarked house. Its hireling is a house agent who links you to your superiors. Adding the Outpost raises your Renown with the house by 1.",
   ["Dragonmark Empowerment", "You need a Dragonmark feat. After a Long Rest in the Bastion you gain one extra level 2 spell slot. It can cast only spells you have prepared through a Dragonmark feat."],
   ["Empower: House Favor", "The agent calls in a favor from the house. You get any benefit your Renown allows, and it does not count against your normal favors. You can't use this again until your Renown with the house goes up."]]),
 ("Inquisitive Agency", "efa", "Level 13", "Roomy", "1", "Research", ["The office of an investigative agency, either your own or a branch of a larger one. The hireling is a secretary with a long list of contacts and agents.",
   ["Research: Information Gathering", "Name one person. The agents build a picture of their activity over the prior 7 days and the next 7 days within 10 miles of the Bastion. Unless your DM rules otherwise, you learn where they stay, what they spend money on, whom they meet and where they show identity papers to officials."],
   ["Mobile Bastions", "You can't use this order while the Bastion travels. After it arrives, the first Research order costs 7 days to set up a new network."]]),
 ("Kundarak Vault", "efa", "Level 9", "Cramped", "1", "Trade", ["An extradimensional vault with a door only you and your hirelings can open. It stores trade goods and treasure very safely.",
   ["Kundarak Access", "Only you can open the vault from any Kundarak bank in the world. Those banks stand in cities across Khorvaire, and in Stormreach."],
   ["Trade: Goods", "The hireling spends 7 days buying nonmagical goods worth up to 2,000 GP and storing them, or selling goods from the vault. You pay for purchases. The buying cap rises to 5,000 GP at level 13. Buyers pay 20 percent over the standard price. That rises to 50 percent at level 13 and 100 percent at level 17."]]),
 ("Lyrandar Helm", "efa", "Level 13", "Cramped", "1", "Empower", ["Lets a mobile Bastion on an elemental airship or elemental galleon travel. The hireling is a dragonmarked heir of House Lyrandar. On an airship the Helm station is part of this facility.",
   ["Empower: Travel", "The hireling pilots the Bastion to a destination you name at the vehicle's speed, 8 hours a day, through the Bastion turn. It stops early on arrival or if something interrupts travel. The DM rolls on the Bastion Events table as if you used the Maintain order."]]),
 ("Manifest Zone", "efa", "Level 13", "Vast", "1", "Empower", ["Your Bastion sits in a place soaked with the energy of one of Eberron's planes. You choose the plane when you build it.",
   ["Empower: Manifest Charm", "The hireling performs rites for 7 days. You then gain a Manifest Charm that lasts until you use it. You don't need to be present. The Charm depends on the linked plane: Daanvi, Dolurrh, Fernia, Irian, Lamannia, Mabar, Risia, Shavarath, Syrania, Thelanis or Xoriat."],
   ["Mobile Bastions", "While the Bastion moves, the link is suspended and you can't use the order. On arrival, an Empower order sets a new link, to the same plane or a different one, and that takes 7 days."]]),
 ("Museum", "efa", "Level 13", "Roomy or Vast", "1 (3 if Vast)", "Research", ["Relics and treasures from expeditions you took part in or paid for, catalogued and on display.",
   ["Research: Specialized Lore", "The hireling studies treasures for 7 days and learns the answer to a question about ancient history, as if by Legend Lore. They share it next time you talk."],
   ["Secrets of the Past", "One treasure gives you a Charm after you study it for 7 days and finish a Long Rest in the Bastion. The Charm lasts 7 days or until used, and you can't gain another while you hold one. The origin of the treasure sets the effect: Argonnessen, Ashtakala, Dhakaan, Khyber or Xen'drik. Your DM may add or remove options based on your past expeditions."],
   ["Enlarging", "Pay 2,000 GP to make it Vast. It holds two treasures of different origins and gains two hirelings."]]),
 ("Navigator's Helm", "efa", "Level 9", "Cramped", "1", "Empower", ["Lets a mobile Bastion built on a mundane waterborne vehicle travel.",
   ["Empower: Travel", "The hireling sails the Bastion to a destination you name at the vehicle's speed, 8 hours a day, through the Bastion turn. It stops early on arrival or if something interrupts travel. The DM rolls on the Bastion Events table as if you used the Maintain order."]]),
 ("Orien Helm", "efa", "Level 9", "Cramped", "1", "Empower", ["Lets a mobile Bastion built on a Lightning Rail cart travel. The hireling is a dragonmarked heir of House Orien.",
   ["Empower: Travel", "The Bastion rides existing conductor stone routes at 30 miles an hour, 8 hours a day, through the Bastion turn. It stops early on arrival or if something interrupts travel. The DM rolls on the Bastion Events table as if you used the Maintain order."]]),
]
for n, s, lv, sp, h, o, t in F:
    add("facility", n, s, "Bastion Facility • " + ("Eberron" if s == "efa" else "Special" if lv != "Basic" else "Basic"), [["Level", lv], ["Space", sp], ["Hirelings", h], ["Order", o]], t)
# ---- species
add("species", "Genasi (MPMM)", "mpmm", "Species • Small or Medium • Speed 30 ft", [["Size", "Small or Medium"], ["Speed", "30 ft."], ["Darkvision", "60 ft."], ["Lineage", "Air, Earth, Fire or Water"]],
    ["Genasi carry the mark of an elemental parent far back in their line. This is the Monsters of the Multiverse version. Pick one lineage. Each gives one cantrip and spells from level 3 or 5. Intelligence, Wisdom or Charisma is your casting ability, chosen when you pick the species. You can also cast the lineage spells with spell slots of the right level.",
     ["Air Genasi", "You can hold your breath indefinitely while not incapacitated. You resist Lightning damage. You know Shocking Grasp. At level 3 you can cast Feather Fall and at level 5 Levitate, each once per Long Rest, without material components."],
     ["Earth Genasi", "You ignore difficult terrain while walking on the ground or a floor. You know Blade Ward, which you can also cast as a Bonus Action a number of times equal to your Proficiency Bonus per Long Rest. At level 5 you can cast Pass without Trace once per Long Rest, without material components."],
     ["Fire Genasi", "You resist Fire damage. You know Produce Flame. At level 3 you can cast Burning Hands and at level 5 Flame Blade, each once per Long Rest. Flame Blade needs no material component."],
     ["Water Genasi", "You have a Swim Speed equal to your Speed and you breathe air and water. You resist Acid damage. You know Acid Splash. At level 3 you can cast Create or Destroy Water and at level 5 Water Walk, each once per Long Rest. Water Walk needs no material component."]])
add("species", "Yuan-Ti (MPMM)", "mpmm", "Species • Small or Medium • Speed 30 ft", [["Size", "Small or Medium"], ["Speed", "30 ft."], ["Darkvision", "60 ft."], ["Resistance", "Poison"]],
    ["Serpentine people shaped by old magic.", ["Magic Resistance", "You have Advantage on saving throws against spells."], ["Poison Resilience", "You have Advantage on saves against being Poisoned and resistance to Poison damage."],
     ["Serpentine Spellcasting", "You know Poison Spray. You can cast Animal Friendship at will, but only on snakes. At level 3 you can cast Suggestion once per Long Rest, or with higher slots. Intelligence, Wisdom or Charisma is your casting ability, chosen when you pick the species."]])
# ---- reward
add("item", "Boon of Skill Proficiency", "dmg", "Boon", [["Type", "Boon"]], ["You gain proficiency in all skills."])
js = "/* Generated by tools/q/gapfill2.py. Own wording. Do not edit by hand. */\n(function(){\nvar R=" + json.dumps(rows, ensure_ascii=False) + ";\nDataEnv.slot.QREFS=DataEnv.slot.QREFS||{};Object.keys(R).forEach(function(c){DataEnv.slot.QREFS[c]=(DataEnv.slot.QREFS[c]||[]).concat(R[c]);});\n})();\n"
open(os.path.join(ROOT, "src", "data", "q24-gapfill2.js"), "w", encoding="utf-8").write(js); print({k: len(v) for k, v in rows.items()})
