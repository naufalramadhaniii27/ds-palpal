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
# ---- facilities: name -> (source, tag, level, space, hirelings, order, text)
F = [
 ("Barrack", "xdmg", "Level 5", "Roomy or Vast", "1", "Recruit", "Sleeping quarters for up to twelve Bastion Defenders. You can own several. Each Recruit order brings up to four free Defenders into a Barrack that has room."),
 ("Bedroom", "xdmg", "Basic", "Cramped, Roomy or Vast", "None", "None", "A basic facility. It is a furnished private room. It has no hireling and no order. Larger bedrooms simply give more comfort and space."),
 ("Kitchen", "xdmg", "Basic", "Cramped, Roomy or Vast", "None", "None", "A basic facility. It is a working cooking area with no hireling and no order."),
 ("Garden", "xdmg", "Level 5", "Roomy or Vast", "1 or 2", "Harvest", "You pick a garden type when you build it, and can switch it by spending 21 days of work. The Harvest order takes 7 days, costs nothing, and yields goods set by the garden type."),
 ("Library", "xdmg", "Level 5", "Roomy", "1", "Research", "Shelves, desks and reading chairs. The Research order sends the hireling to study one topic for 7 days. They return with up to three useful facts about a legend, event, place, person, creature or object."),
 ("Pub", "xdmg", "Level 13", "Roomy or Vast", "1 or 4", "Research", "A bar, café or tea room. The bartender runs a spy network among the regulars. The Research order gathers local information from those spies."),
 ("War Room", "xdmg", "Level 17", "Vast", "Lieutenants", "Recruit", "Where you plan campaigns with an inner circle of loyal veteran lieutenants. You start with two and can add more. The Recruit order raises troops for your Bastion."),
 ("Workshop", "xdmg", "Level 5", "Roomy or Vast", "3 or 5", "Craft", "A crafting space with six kinds of artisan's tools chosen from a list of eleven. The Craft order produces goods and items with those tools."),
 ("Artificer's Forge", "efa", "Level 13", "Roomy", "2", "Craft", "Two magewright hirelings who craft magic items. They can speed up item crafting you do in the Bastion. The Craft order makes one Common or Uncommon magic item of your choice."),
 ("Construct Forge", "efa", "Level 17", "Vast", "2", "Recruit", "A forge for building Constructs. The Recruit order makes one from the Forge Constructs table, for the time and cost listed there. Constructs made here count as Bastion Defenders."),
 ("Dragonmark Outpost", "efa", "Level 5", "Roomy", "1", "Empower", "An outpost of your dragonmarked house, staffed by a house agent. Adding it raises your Renown with the house by 1. If you have any Dragonmark feat, finishing a Long Rest in the Bastion gives you an extra level 2 spell slot."),
 ("Inquisitive Agency", "efa", "Level 13", "Roomy", "1", "Research", "The office of an investigative agency, with a secretary who knows useful contacts. The Research order uses that network for information gathering."),
 ("Kundarak Vault", "efa", "Level 9", "Cramped", "1", "Trade", "An extradimensional vault with a door only you and your hirelings can open. It stores trade goods and treasure safely, and you alone can reach its contents from other places."),
 ("Lyrandar Helm", "efa", "Level 13", "Cramped", "1", "Empower", "Lets a mobile Bastion on an elemental airship or galleon travel. The hireling is a dragonmarked heir of House Lyrandar. The Empower order pilots the Bastion to a destination you name."),
 ("Manifest Zone", "efa", "Level 13", "Vast", "1", "Empower", "Your Bastion is soaked in the energy of one of Eberron's planes, which you choose when you build it. The Empower order yields a Manifest Charm after 7 days of rites."),
 ("Museum", "efa", "Level 13", "Roomy or Vast", "1 or 3", "Research", "Relics from expeditions you joined or paid for, catalogued and displayed. The Research order studies them for 7 days and answers a question about ancient history as if by Legend Lore."),
 ("Navigator's Helm", "efa", "Level 9", "Cramped", "1", "Empower", "Lets a mobile Bastion built in a mundane waterborne vehicle travel. The Empower order sails it to a named destination at the vehicle's speed, 8 hours a day."),
 ("Orien Helm", "efa", "Level 9", "Cramped", "1", "Empower", "Lets a mobile Bastion on a Lightning Rail cart travel. The hireling is a dragonmarked heir of House Orien. The Empower order moves it 30 miles an hour, 8 hours a day, along conductor stones."),
]
for n, s, lv, sp, h, o, t in F:
    add("facility", n, s, "Bastion Facility • " + ("Eberron" if s == "efa" else "Special" if lv != "Basic" else "Basic"), [["Level", lv], ["Space", sp], ["Hirelings", h], ["Order", o]], [t])
# ---- species
add("species", "Genasi (MPMM)", "mpmm", "Species • Small or Medium • Speed 30 ft", [["Size", "Small or Medium"], ["Speed", "30 ft."], ["Darkvision", "60 ft."], ["Lineage", "Air, Earth, Fire or Water"]],
    ["Genasi carry the mark of an elemental parent far back in their line. This version uses the Monsters of the Multiverse rules. You pick a lineage tied to one of the four elements, and it sets your resistance and spells. Darkvision lets you see 60 feet in the dark."])
add("species", "Yuan-Ti (MPMM)", "mpmm", "Species • Small or Medium • Speed 30 ft", [["Size", "Small or Medium"], ["Speed", "30 ft."], ["Darkvision", "60 ft."], ["Resistance", "Poison"]],
    ["Serpentine people shaped by old magic.", ["Magic Resistance", "You have Advantage on saving throws against spells."], ["Poison Resilience", "You have Advantage on saves against being Poisoned and resistance to Poison damage."],
     ["Serpentine Spellcasting", "You know Poison Spray. You can cast Animal Friendship at will, but only on snakes. At level 3 you can cast Suggestion once per Long Rest, or with higher slots. Intelligence, Wisdom or Charisma is your casting ability, chosen when you pick the species."]])
# ---- reward
add("item", "Boon of Skill Proficiency", "dmg", "Boon", [["Type", "Boon"]], ["You gain proficiency in all skills."])
js = "/* Generated by tools/q/gapfill2.py. Own wording. Do not edit by hand. */\n(function(){\nvar R=" + json.dumps(rows, ensure_ascii=False) + ";\nwindow.QREFS=window.QREFS||{};Object.keys(R).forEach(function(c){window.QREFS[c]=(window.QREFS[c]||[]).concat(R[c]);});\n})();\n"
open(os.path.join(ROOT, "src", "data", "q24-gapfill2.js"), "w", encoding="utf-8").write(js); print({k: len(v) for k, v in rows.items()})
