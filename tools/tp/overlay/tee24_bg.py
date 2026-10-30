# Own-wording backgrounds of Exploring Eberron (2024 rules). Record shape follows tdcg_bg.py and src/data/db1 BACKGROUNDS.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough", "Aquatic Adaptation", "Khesh'dar Training"]
ALSO = []
LU = []
TL = {"xee24": {"list": ["Thieves' Tools", "Poisoner's Kit", "Forgery Kit"], "cat": "Malenti tools", "one": "Malenti tool"}}
BG = {
 "Changeling Traveler": {"ab": ["DEX", "WIS", "CHA"], "feat": "Focused Personas", "sk": ["Deception", "Sleight of Hand"], "tool": "Thieves' Tools",
   "eq": "2 Daggers, Thieves' Tools, Bedroll, 2 Pouches, Shiftweave, 10 GP", "gp": 10},
 "Malenti": {"ab": ["DEX", "INT", "CHA"], "feat": "Aquatic Adaptation", "sk": ["Deception", "Insight"], "tool": "Thieves' Tools, Poisoner's Kit or Forgery Kit (choose one)",
   "toolPick": {"n": 1, "cats": ["xee24"]}, "eq": "The equipment of a background tied to the person you consumed, or 50 GP instead", "gp": 0},
 "Natural": {"ab": ["DEX", "WIS", "CHA"], "feat": "Lucky", "sk": ["Insight", "Stealth"], "tool": "Thieves' Tools",
   "eq": "2 Daggers, Thieves' Tools, Gaming Set (any), Bedroll, Pouch, Traveler's Clothes, 16 GP", "gp": 16},
 "Savant": {"ab": ["CON", "INT", "WIS"], "feat": "Magic Initiate (Wizard)", "sk": ["Arcana", "History"], "tool": "Calligrapher's Supplies",
   "eq": "Quarterstaff, Calligrapher's Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP", "gp": 8},
 "Siege Engineer": {"ab": ["STR", "DEX", "CON"], "feat": "Savage Attacker", "sk": ["Athletics", "Intimidation"], "tool": "Gaming Set (choose one)",
   "toolPick": {"n": 1, "cats": ["game"]}, "eq": "Spear, Shortbow, 20 Arrows, Gaming Set, Healer's Kit, Quiver, Traveler's Clothes, 14 GP", "gp": 14},
 "Technical Support": {"ab": ["DEX", "CON", "INT"], "feat": "Alert", "sk": ["Sleight of Hand", "Stealth"], "tool": "Thieves' Tools",
   "eq": "2 Daggers, Thieves' Tools, Crowbar, Pouch, Traveler's Clothes, 16 GP", "gp": 16},
 "Wage Mage": {"ab": ["STR", "DEX", "INT"], "feat": "Crafter", "sk": ["Investigation", "Persuasion"], "tool": "Artisan's Tools (choose one)",
   "toolPick": {"n": 1, "cats": ["art"]}, "eq": "Artisan's Tools, 2 Pouches, Traveler's Clothes, 32 GP", "gp": 32},
}
