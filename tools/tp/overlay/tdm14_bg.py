# Own-wording backgrounds of Dark Matter (Mage Hand Press, 2014 rules). Record shape follows tkdm_bg.py.
# The origin feat and the three ability scores follow the skills, the same way the 2014 PHB backgrounds are carried over.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
ALSO = []
LU = []
TL = {}
BG = {
 "Commercial Pilot": {"ab": ["DEX", "WIS", "CON"], "sk": ["Perception", "Piloting"], "tool": "Ship Maintenance Tools",
   "eq": "A partial map of a distant star system, Badge or insignia from your flying school, Aviator glasses, Traveler's Clothes, Pouch, 15 GP", "gp": 15, "lgn": 1, "feat": "Alert",
   "bf": [["Take-off Checklist", "Your many flying hours have burned the standard checks for launching and docking a ship into your mind. Simple maneuvers you make while piloting go faster and smoother, with no risk of mishap."]]},
 "Exile": {"ab": ["CHA", "WIS", "CON"], "sk": ["Deception", "Survival"], "tool": "",
   "eq": "Dagger, Small strongbox, Memento from your homeland, Common Clothes, Pouch, 5 GP", "gp": 5, "lgn": 2, "feat": "Tough",
   "bf": [["Exile Network", "You keep in touch with a network of exiles and expatriates who have an eclectic mix of skills and a pioneer's durable spirit. If you need someone with an unusual or specialized skill, such as art forgery, translating ancient languages or brewing poison, you likely know where to find them."],
          ["Variant Feature: Radical Sympathizers", "You are a prominent figurehead for a group of religious, political or ethnic radicals, so you often find people who sympathize with you. Hirelings you employ may offer better rates, fanatical loyalty or enhanced services."]]},
 "Interpreter": {"ab": ["CHA", "WIS", "INT"], "sk": ["Insight", "Persuasion"], "tool": "",
   "eq": "Phrasebook, Identification documents, Small recording device, Fine Clothes, Pouch, 10 GP", "gp": 10, "lgn": 2, "feat": "Skilled",
   "bf": [["Flawless Protocol", "You have memorized a vast library of greetings, handshakes and polite gestures from a thousand cultures. You almost always know the right way to address unusual aliens or foreign dignitaries. For strange or uncontacted peoples you can make educated guesses good enough to avoid offense."]]},
 "Low-Worlder": {"ab": ["CHA", "WIS", "CON"], "sk": ["Persuasion", "Survival"], "tool": "One set of artisan's tools and one gaming set", "toolPick": {"n": 2, "cats": ["art", "game"]},
   "eq": "A token of your homeworld, Common Clothes, A container of currency from your homeworld (worth 0 GP)", "gp": 0, "lgn": 0, "feat": "Lucky",
   "bf": [["Low-World Charm", "You share a kinship with other low-worlders, especially the rare ones from your own homeworld. They take a liking to you and will usually grant one reasonable favor if you return a similar one later."]]},
 "Ship's Doctor": {"ab": ["WIS", "INT", "CON"], "sk": ["Investigation", "Medicine"], "tool": "Alchemist's Supplies, Herbalism Kit",
   "eq": "Healer's Kit, Book of physiology, Needle and string, Doctor's uniform, Pouch, 10 GP", "gp": 10, "lgn": 0, "feat": "Healer",
   "bf": [["Xenobiology", "Having seen many strange things, you instinctively understand alien biology. When you meet a creature you have never seen, you can make a few observations and deductions about how dangerous it might be, what its weaknesses could be and how it would react to a given stimulus."]]},
 "Technologist": {"ab": ["INT", "DEX", "CON"], "sk": ["Data", "Technology"], "tool": "Mechanist's Tools and one set of artisan's tools", "toolPick": {"n": 1, "cats": ["art"]},
   "eq": "Tinker's Tools, Broken piece of a mysterious machine, Large pipe wrench (counts as a mace), Common Clothes, Pouch, 10 GP", "gp": 10, "lgn": 0, "feat": "Crafter",
   "bf": [["Vent Tape and Elbow Grease", "Technologists often must repair things without the right tools, training or parts. With stop-gap fixes and whatever is on hand, you can keep a damaged system working for a few crucial minutes or hours, as long as you give it your full attention."]]},
}
