# Own-wording backgrounds of Steinhardt's Guide to the Eldritch Hunt (2024 rules). Record shape follows tee24_bg.py and tghp_bg.py.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough",
        "Curious", "Faithful", "Grizzled", "Worthless"]
ALSO = []
LU = []
TL = {}
BG = {
 "Amnesiac": {"ab": ["CON", "INT", "WIS"], "feat": "Curious", "sk": ["Insight", "Investigation"], "tool": "Artisan's Tools (choose one)",
   "toolPick": {"n": 1, "cats": ["art"]}, "eq": "Bedroll, Book (fiction), Traveler's Clothes, 22 GP", "gp": 22},
 "Beast Hunter": {"ab": ["STR", "DEX", "WIS"], "feat": "Grizzled", "sk": ["Athletics", "Survival"], "tool": "Herbalism Kit",
   "eq": "Dagger, Flare, Flask, 20 Bullets, Healer's Kit, Herbalism Kit, Traveler's Clothes, 30 GP", "gp": 30},
 "Cult Initiate": {"ab": ["CON", "WIS", "CHA"], "feat": "Faithful", "sk": ["Arcana", "Persuasion"], "tool": "Artisan's Tools or Musical Instrument (choose one)",
   "toolPick": {"n": 1, "cats": ["art", "music"]}, "eq": "Arcane Focus (any), Art Object (worth 10 GP), the Artisan's Tools or Musical Instrument you chose, Hooded Lantern, 5 flasks of Oil, Traveler's Clothes, 5 GP", "gp": 5},
 "Disciple": {"ab": ["INT", "WIS", "CHA"], "feat": "Faithful", "sk": ["Persuasion", "Religion"], "tool": "Calligrapher's Supplies",
   "eq": "Book (prayer), Calligrapher's Supplies, Fine Clothes, Holy Symbol, 5 GP", "gp": 5},
 "Inquisitor": {"ab": ["STR", "WIS", "CHA"], "feat": "Faithful", "sk": ["Intimidation", "Religion"], "tool": "Torture Tools",
   "eq": "Book (prayer), Holy Symbol, Manacles, Torture Tools, Traveler's Clothes, 3 GP", "gp": 3},
 "Investigator": {"ab": ["DEX", "INT", "WIS"], "feat": "Curious", "sk": ["Insight", "Investigation"], "tool": "Artisan's Tools (choose one, tied to your investigative methods)",
   "toolPick": {"n": 1, "cats": ["art"]}, "eq": "The Artisan's Tools you chose, 10 sheets of Paper, Traveler's Clothes, 32 GP", "gp": 32},
 "Marked for Death": {"ab": ["STR", "DEX", "CON"], "feat": "Grizzled", "sk": ["Arcana", "Survival"], "tool": "",
   "eq": "Dagger, Flare, 50 sheets of Paper, Sacrificial Brand Eldritch Carving (Scarified), Traveler's Clothes, 44 GP. Option B is the Carving and 50 GP", "gp": 44},
 "Scion": {"ab": ["STR", "DEX", "INT"], "feat": "Curious", "sk": ["Arcana", "Investigation"], "tool": "Artisan's Tools (choose one)",
   "toolPick": {"n": 1, "cats": ["art"]}, "toolFix": "Tinker's Tools", "eq": "The Artisan's Tools you chose, Ink, Ink Pen, 50 sheets of Paper, Tinker's Tools, Traveler's Clothes, 3 GP", "gp": 3},
 "Worthless Husk": {"ab": ["DEX", "CON", "WIS"], "feat": "Worthless", "sk": ["Stealth", "Survival"], "tool": "",
   "eq": "Dagger, Sewer Grate Key, Traveler's Clothes, 5 GP. Option B is 10 GP", "gp": 5},
}
