# Own-wording backgrounds of Dark Matter (2024 rules). Record shape follows tghp_bg.py and tsgeh_bg.py.
# Money in the book is Credits (CR). The "gp" field carries the Credit amount of option A. Option B is 50 CR in every background.
# The new skills Data, Piloting and Technology are written as plain names.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough",
        "Affluent", "Creative", "Gambler", "Industrious", "Jinx", "Silver-Tongued", "Technical"]
ALSO = []
LU = []
TL = {"xtsdm": {"list": ["Disguise Kit", "Forgery Kit"], "cat": "Exile kits", "one": "Disguise Kit or Forgery Kit"}}
AMN = ["Alert", "Creative", "Gambler", "Industrious", "Jinx", "Magic Initiate (Wizard)", "Savage Attacker", "Silver-Tongued", "Skilled", "Technical"]
ALLSK = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Data", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Piloting", "Religion", "Sleight of Hand", "Stealth", "Survival", "Technology"]
BG = {
 "Academic": {"ab": ["DEX", "INT", "WIS"], "feat": "Magic Initiate (Wizard)", "sk": ["Arcana", "History"], "tool": "",
   "eq": "Book (history), Ink, Ink Pen, 10 sheets of Paper, Traveler's Clothes (casual), Wristwatch, 1 CR. Option B is 50 CR", "gp": 1},
 "Amnesiac": {"ab": ["STR", "DEX", "CON", "INT", "WIS", "CHA"], "feat": "Alert", "featOpts": AMN, "sk": [], "skPick": {"n": 2, "from": ALLSK}, "tool": "",
   "eq": "Traveler's Clothes, one trinket, 48 CR. Option B is 50 CR. The book has you pick one score and roll for two more on its table, and roll twice on its feat and skill tables. Here you simply pick them", "gp": 48},
 "Aristocrat": {"ab": ["INT", "WIS", "CHA"], "feat": "Affluent", "sk": ["Deception", "Persuasion"], "tool": "Gaming Set (choose one)",
   "toolPick": {"n": 1, "cats": ["game"]}, "eq": "Fine Clothes, Fine Wine (bottle), Gaming Set (same as above), Log Keeper, Perfume, 9 CR. Option B is 50 CR", "gp": 9},
 "Artist": {"ab": ["DEX", "WIS", "CHA"], "feat": "Creative", "sk": ["Acrobatics", "Performance"], "tool": "Musical Instrument or Painter's Supplies (choose one)",
   "toolPick": {"n": 1, "cats": ["music", "art"]}, "eq": "Ink, Ink Pen, Musical Instrument or Painter's Supplies (same as above), 10 sheets of Paper, Traveler's Clothes (casual), 6 CR. Option B is 50 CR", "gp": 6},
 "Botanist": {"ab": ["CON", "INT", "WIS"], "feat": "Skilled", "sk": ["Nature", "Survival"], "tool": "Herbalism Kit",
   "eq": "Book (field guide), Herbalism Kit, 2 Pouches, Traveler's Clothes (overalls), 17 CR. Option B is 50 CR", "gp": 17},
 "Exile": {"ab": ["DEX", "CON", "CHA"], "feat": "Jinx", "sk": ["Deception", "Stealth"], "tool": "Disguise Kit or Forgery Kit (choose one)",
   "toolPick": {"n": 1, "cats": ["xtsdm"]}, "eq": "Disguise Kit or Forgery Kit (same as above), Igniter, Traveler's Clothes, 18 CR. Option B is 50 CR", "gp": 18},
 "Galactic Colonist": {"ab": ["STR", "CON", "INT"], "feat": "Industrious", "sk": ["Survival", "Technology"], "tool": "",
   "eq": "Binoculars, Flashlight, Traveler's Clothes (duster), Utility Axe, 18 CR. Option B is 50 CR", "gp": 18},
 "Haunted": {"ab": ["CON", "INT", "CHA"], "feat": "Jinx", "sk": ["Arcana", "Deception"], "tool": "",
   "eq": "Bedroll, Book (mythology), 5 Flares, Map, Tent, Traveler's Clothes, 14 CR. Option B is 50 CR", "gp": 14},
 "Holo-Influencer": {"ab": ["DEX", "INT", "CHA"], "feat": "Creative", "sk": ["Data", "Performance"], "tool": "Gaming Set (Digital Games)",
   "eq": "Costume, Fine Clothes, Mirror, Perfume, 20 CR. Option B is 50 CR", "gp": 20},
 "Interpreter": {"ab": ["INT", "WIS", "CHA"], "feat": "Silver-Tongued", "sk": ["Insight", "Performance"], "tool": "",
   "eq": "Ink, Ink Pen, Fine Clothes, Log Keeper, 10 sheets of Paper, 13 CR. Option B is 50 CR", "gp": 13},
 "Lawyer": {"ab": ["INT", "WIS", "CHA"], "feat": "Silver-Tongued", "sk": ["Deception", "Persuasion"], "tool": "",
   "eq": "Book (legal reference), Fine Clothes, 10 CR. Option B is 50 CR", "gp": 10},
 "Low-Worlder": {"ab": ["STR", "CON", "WIS"], "feat": "Skilled", "sk": ["Athletics", "Survival"], "tool": "Artisan's Tools (choose one)",
   "toolPick": {"n": 1, "cats": ["art"]}, "eq": "Artisan's Tools (same as above), Backpack, Rope, 10 Silver Pieces, Traveler's Clothes, 29 CR. Option B is 50 CR. Any 5th Edition background from another setting can be reused for a low-worlder by renaming it", "gp": 29},
 "Medic": {"ab": ["DEX", "CON", "WIS"], "feat": "Skilled", "sk": ["Insight", "Medicine"], "tool": "",
   "eq": "Healer's Kit, 2 Hypodermic Needles, Log Keeper, Traveler's Clothes (scrubs), 32 CR. Option B is 50 CR", "gp": 32},
 "Mercenary": {"ab": ["STR", "DEX", "CON"], "feat": "Savage Attacker", "sk": ["Acrobatics", "Athletics"], "tool": "",
   "eq": "Bandolier, Igniter, Tactical Vest, Traveler's Clothes (fatigues), Utility Axe, 15 CR. Option B is 50 CR", "gp": 15},
 "Miner": {"ab": ["STR", "CON", "WIS"], "feat": "Industrious", "sk": ["Athletics", "Technology"], "tool": "",
   "eq": "2 Flashlights, Rope, Shovel, Traveler's Clothes (overalls), 25 CR. Option B is 50 CR", "gp": 25},
 "Programmer": {"ab": ["DEX", "INT", "WIS"], "feat": "Technical", "sk": ["Data", "Investigation"], "tool": "Gaming Set (Digital Games)",
   "eq": "6 cans of Krash, Interface Rig, Traveler's Clothes (hoodie), 22 CR. Option B is 50 CR", "gp": 22},
 "Salvager": {"ab": ["STR", "INT", "WIS"], "feat": "Gambler", "sk": ["Perception", "Technology"], "tool": "",
   "eq": "Backpack, Crowbar, Flashlight, Traveler's Clothes (jumpsuit), Wrenchinator, 4 CR. Option B is 50 CR", "gp": 4},
 "Scoundrel": {"ab": ["DEX", "CON", "CHA"], "feat": "Gambler", "sk": ["Sleight of Hand", "Stealth"], "tool": "Thieves' Tools",
   "eq": "Dagger, 2 Pouches, Thieves' Tools, Traveler's Clothes (streetwear), 20 CR. Option B is 50 CR", "gp": 20},
 "Security Guard": {"ab": ["STR", "CON", "CHA"], "feat": "Alert", "sk": ["Athletics", "Intimidation"], "tool": "",
   "eq": "Book (magazine), Holster, Manacles, Traveler's Clothes (uniform), 20 CR. Option B is 50 CR", "gp": 20},
 "Sleuth": {"ab": ["DEX", "CON", "INT"], "feat": "Alert", "sk": ["Insight", "Investigation"], "tool": "",
   "eq": "Binoculars, Crowbar, Flashlight, Igniter, Log Keeper, Traveler's Clothes (trenchcoat), 18 CR. Option B is 50 CR", "gp": 18},
 "Spacer": {"ab": ["STR", "DEX", "WIS"], "feat": "Alert", "sk": ["Perception", "Piloting"], "tool": "",
   "eq": "Flashlight, Omnitool, Traveler's Clothes (jumpsuit), Vent Tape, Wristwatch, 28 CR. Option B is 50 CR", "gp": 28},
 "Technologist": {"ab": ["DEX", "INT", "WIS"], "feat": "Technical", "sk": ["Arcana", "Technology"], "tool": "Gaming Set (Digital Games)",
   "eq": "Interface Rig, Omnitool, Traveler's Clothes (overalls), Vent Tape, 13 CR. Option B is 50 CR", "gp": 13},
}
