# Own-wording backgrounds of Deep Magic (Kobold Press, 2014 rules). Record shape follows tdcg_bg.py.
# The origin feat and the three ability scores follow the skills, the same way the 2014 PHB backgrounds are carried over.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
ALSO = []
LU = []
TL = {}
BG = {
 "Archivist": {"ab": ["INT", "WIS", "CON"], "sk": ["Arcana", "Investigation"], "tool": "Calligrapher's Supplies",
   "eq": "Calligrapher's Supplies, Leather-bound journal of research notes, Robes, 5 sheets of loose paper, Spectacles, Pouch, 15 GP", "gp": 15, "lgn": 2, "feat": "Magic Initiate (Wizard)",
   "bf": [["Expert Researcher", "Spend 1 hour studying the books and records of an archive, library or similar collection while researching one subject. Afterward, any Intelligence-based check on that subject that totals 9 or lower counts as a 10. You can't use this again on the same subject in the same library."]]},
 "Fey Hostage": {"ab": ["CHA", "WIS", "CON"], "sk": ["Deception", "Insight"], "tool": "One gaming set and one musical instrument",
   "toolPick": {"n": 2, "cats": ["game", "music"]}, "eq": "Fine Clothes, A flower whose petals never wilt, Musical Instrument (one of your choice), Pouch, 10 GP", "gp": 10, "langs": ["Elvish", "Sylvan"], "lgf": ["Elvish", "Sylvan"], "feat": "Musician",
   "bf": [["First Impressions", "You grew up where missing the manners and intrigues of a fey court could be disastrous, so you make the first moment count. In your first social interaction with an individual fey, you gain +2 to the first Charisma-based check you make."]]},
 "Soul Channeler": {"ab": ["INT", "CHA", "CON"], "sk": ["Arcana"], "skPick": {"n": 1, "from": ["Persuasion", "Intimidation"]}, "tool": "Alchemist's Supplies, Poisoner's Kit",
   "eq": "Alchemist's Supplies, Pocket knife, Chalk on a string, Chapbook of esoteric symbols, Common Clothes, Pouch, 10 GP", "gp": 10, "lgn": 1, "feat": "Magic Initiate (Wizard)",
   "bf": [["Channel Essence", "You draw on inner reserves to recover from lasting injury. During a short rest, you can offset a reduction to one of your ability scores by spending Hit Dice equal to twice the reduction you want to undo. The Hit Dice give no other benefit when used this way."]]},
 "Transformed Familiar": {"ab": ["WIS", "INT", "CON"], "sk": ["Perception", "Survival"], "tool": "Alchemist's Supplies",
   "eq": "A trinket worn or carried by your previous form, Traveler's Clothes, Alchemist's Supplies, Explorer's Pack, Pouch, 5 GP", "gp": 5, "lgn": 1, "feat": "Alert",
   "bf": [["Familiar Insight", "Your body has changed but your born instincts have not. When you deal with creatures of your original type, you gain +2 to Wisdom (Insight) checks to read their motives and judge whether they are telling the truth."]]},
}
