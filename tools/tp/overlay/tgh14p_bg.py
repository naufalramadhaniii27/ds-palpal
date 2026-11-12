# Own-wording backgrounds of Grim Hollow Player's Guide (2014 rules). Record shape follows tdm14_bg.py.
# Skills, tools, languages and gear follow the printed text of each background. The source data fields for Fey-Blessed and Lapsed Inquisitor are swapped, the text wins.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
ALSO = []
LU = []
TL = {}
RANKS = " Ranks 1 to 4 are listed in the book, each with holdings and a way to advance."
_clan = "A clan tracks rank by deeds, from newcomer to leader."
BG = {
 "Clan Member (Raider)": {"ab": ["STR", "CON", "DEX"], "sk": ["Intimidation"], "skPick": {"n": 1, "from": ["Athletics", "History", "Nature", "Perception", "Religion", "Survival"]}, "tool": "One tool of your choice",
   "eq": "Basic clothes, Basket, Hatchet, Tankard, Sack, Whetstone, Torch, 10 GP", "gp": 10, "lgn": 1, "feat": "Savage Attacker",
   "bf": [["Display of Strength", "In a large town or city, spend 1 hour and make a DC 10 Charisma (Intimidation) check. Your tough manner draws the notice of local Fighter's Guild members. You learn where the underground fighting rings and guild-friendly businesses are and who the wealthy arena patrons are. You also hear of minor jobs for toughs, such as bodyguard work or debt collection."],
          ["Raider Ranks", "Shield Bearer, Pillager, Raid Leader, then Warlord. You move up by taking a missing raider's place, performing notable deeds, saving a chieftain or defeating a sworn enemy of the tribe. Higher ranks bring command of raiding parties, first pick of plunder and a voice in war councils."]]},
 "Clan Member (Shaman)": {"ab": ["WIS", "INT", "CON"], "sk": ["Religion"], "skPick": {"n": 1, "from": ["Athletics", "History", "Nature", "Perception", "Survival"]}, "tool": "One tool of your choice",
   "eq": "Basic clothes, Basket, Hatchet, Totem of a clan spirit, Clay jug, Tinderbox, 10 GP", "gp": 10, "lgn": 1, "feat": "Magic Initiate (Druid)",
   "bf": [["Spiritual Guidance", "Spend 1 hour petitioning your clan's patron spirits and succeed on a DC 10 Intelligence (Religion) check to commune with them. If they answer, you can ask for guidance on one decision. They show approval or disapproval but give no concrete knowledge of the future."],
          ["Shaman Ranks", "Dabbler, Hedge Witch, Witch Doctor, then Sage. You advance by your master's promotion, taking over a camp or the master's role, and guiding a chieftain's decision. Higher ranks bring authority over rituals, holy sites and apprentices."]]},
 "Clan Member (Tribesperson)": {"ab": ["CON", "WIS", "STR"], "sk": ["Survival"], "skPick": {"n": 1, "from": ["Athletics", "History", "Nature", "Perception", "Religion"]}, "tool": "One set of artisan's tools", "toolPick": {"n": 1, "cats": ["art"]},
   "eq": "Basic clothes, Basket, Hatchet, One set of artisan's tools, Waterskin, 10 GP", "gp": 10, "lgn": 1, "feat": "Tough",
   "bf": [["Tribal Familiarity", "Spend 1 hour in natural wilderness and make a DC 10 Wisdom (Survival) check to spot signs of other humanoid activity. You learn the direction of nearby settlements. If you know the area, you also know which tribe or group they belong to and how they treat outsiders."],
          ["Tribesperson Ranks", "Tribal Member, Hunter-Gatherer, Elder, then Chieftain. You advance by gaining an elder's leave to roam, leading well in a crisis, and serving the tribe wisely in troubled times."]]},
 "Fey-Blessed": {"ab": ["CHA", "WIS", "DEX"], "sk": ["Animal Handling", "Nature"], "tool": "One musical instrument", "toolPick": {"n": 1, "cats": ["music"]},
   "eq": "One musical instrument, 20 GP", "gp": 20, "lgn": 1, "lgf": ["Sylvan"], "feat": "Musician",
   "bf": [["Fortune of the Forest", "Outside civilization, when you are lost, short on food or water, or trying to make a fire or shelter, there is a 50 percent chance a creature of the wild helps you. A squirrel might lead you to a sheltered cave or a clean spring."]]},
 "Lapsed Inquisitor": {"ab": ["WIS", "INT", "CHA"], "sk": ["Arcana", "Religion"], "tool": "Land vehicles, Herbalism Kit",
   "eq": "Holy Symbol, Diplomat's Pack, 10 GP", "gp": 10, "lgn": 1, "feat": "Magic Initiate (Cleric)",
   "bf": [["Language", "Choose one of Abyssal, Celestial or Infernal."], ["The Inquisitor's Stare", "You have seen more fear and pain than most see in a lifetime. With a glance you can tell if someone hides something, is in pain, or is close to collapse. Once per day, you automatically succeed on a Wisdom (Insight) check or learn if a living creature has less than 10 percent of its hit point maximum."]]},
 "One of the Taken": {"ab": ["WIS", "INT", "CON"], "sk": ["Nature", "Survival"], "tool": "Tinker's Tools or Woodcarver's Tools",
   "eq": "One set of artisan's tools, 20 GP", "gp": 20, "lgn": 1, "feat": "Skilled",
   "bf": [["Insightful Flashbacks", "You do not remember your time away, but glimpses return. When you make an ability check to recall something about a monster or other lore and learn nothing, you can reroll. If the new roll gives you information, you cannot use this again until you gain a level."]]},
 "Pauper (Beggar)": {"ab": ["CHA", "DEX", "CON"], "sk": ["Persuasion"], "skPick": {"n": 1, "from": ["Deception", "Insight", "Perception", "Stealth", "Survival"]}, "tool": "One gaming set", "toolPick": {"n": 1, "cats": ["game"]},
   "eq": "Worn blanket, Ragged clothes, Sack, Begging bowl or tin cup, Crutch, Scraps of cloth, Stick of grease paint, 10 CP", "gp": 0, "lgn": 1, "feat": "Lucky",
   "bf": [["Friends in Low Places", "Spend 1 hour talking with other beggars and make a DC 10 Charisma (Persuasion) check. You can steer the mood of the lower classes for or against a person, group or decision. The unrest shows up as the GM decides."],
          ["Beggar Ranks", "Street Beggar, Mendicant, Gutter Baron, then Beggar King. You advance by befriending a business owner, sharing a windfall, and serving the poor against a noble."]]},
 "Pauper (Street Tough)": {"ab": ["STR", "CON", "CHA"], "sk": ["Intimidation"], "skPick": {"n": 1, "from": ["Deception", "Insight", "Perception", "Persuasion", "Stealth", "Survival"]}, "tool": "One gaming set", "toolPick": {"n": 1, "cats": ["game"]},
   "eq": "Worn blanket, Ragged clothes, Sack, Tough leather gloves, One gaming set, Mess kit, 10 CP", "gp": 0, "lgn": 1, "feat": "Tavern Brawler",
   "bf": [["Street Tough", "In a large town or city, spend 1 hour and make a DC 10 Charisma (Intimidation) check. Your tough manner draws the notice of local Fighter's Guild members. You learn where the underground fighting rings and guild-friendly businesses are and who the wealthy arena patrons are. You also hear of minor jobs for toughs, such as bodyguard work or debt collection."],
          ["Street Tough Ranks", "Scrapper, Prize Fighter, Contender, then Arena Champ. You advance by catching a patron's eye, lasting three rounds against a top fighter, and winning a major bout."]]},
 "Pauper (Vagabond)": {"ab": ["WIS", "CON", "DEX"], "sk": ["Insight"], "skPick": {"n": 1, "from": ["Deception", "Perception", "Persuasion", "Stealth", "Survival"]}, "tool": "One gaming set", "toolPick": {"n": 1, "cats": ["game"]},
   "eq": "Worn blanket, Ragged clothes, Sack, Walking stick, Old wool cloak, Iron pot, 10 CP", "gp": 0, "lgn": 1, "feat": "Skilled",
   "bf": [["Friendly Face", "Spend 1 hour in a town or settlement and make a DC 10 Wisdom (Insight) check to find an ally you made on an earlier visit. The ally starts out friendly and answers your questions about the town, its services and its people."],
          ["Vagabond Ranks", "Outcast, Drifter, Seeker, then Wanderer. You advance by surviving a major storm on the road or joining a town's disputes, saving a contact's life, and helping topple a prominent figure."]]},
 "Pox-Touched": {"ab": ["CON", "WIS", "INT"], "sk": ["Intimidation", "Medicine"], "tool": "Herbalism Kit",
   "eq": "Herbalism Kit, 20 GP", "gp": 20, "lgn": 1, "feat": "Healer",
   "bf": [["Medical Marvel", "Your sudden recovery from the Weeping Pox, and the changes it left on your body, amaze people around you. You may be treated as an oddity, but you can ask for small favors such as meals or a place to rest, and common folk will oblige, even if they fear you slightly."]]},
}
