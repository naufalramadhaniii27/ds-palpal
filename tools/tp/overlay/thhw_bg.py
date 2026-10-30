# Own-wording backgrounds of Humblewood Campaign Setting (2014 rules). Record shape follows tdcsr_bg.py and the 2014 PHB backgrounds.
# The book gives no ability scores or origin feat, so they are chosen by skills and theme, the same way the 2014 PHB backgrounds are carried over.
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
ALSO = []
LU = []
TL = {}
BG = {
 "Bandit Defector": {"ab": ["DEX", "CHA", "CON"], "sk": ["Deception", "Survival"], "tool": "Gaming Set or Musical Instrument (choose one)", "toolPick": {"n": 1, "cats": ["game", "music"]}, "toolFix": "Disguise Kit",
   "eq": "Knife, Cooking Pot, Winter Blanket, an object that was your cut of a robbery, Common Clothes, Pouch, 10 GP", "gp": 10, "feat": "Alert",
   "bf": [["Bandit Routes", "You know the roads of the Wood and the escape paths bandits use. Outside combat, you and companions you lead cross forested ground between locations twice as fast as your Speed would normally allow."]]},
 "Grounded": {"ab": ["STR", "WIS", "CON"], "sk": ["Athletics", "Insight"], "tool": "Artisan's Tools (choose one)", "toolPick": {"n": 1, "cats": ["art"]}, "lgn": 1,
   "eq": "Artisan's Tools (same as above), Walking Stick, a trinket from another culture, Traveler's Clothes, Pouch, 5 GP", "gp": 5, "feat": "Crafter",
   "bf": [["Find Another Path", "You have lived close to the ground and know the undergrowth as other birdfolk know the canopy. You can always recall the general layout of the terrain around you on the forest floor. If an obstacle on your path needs climbing or extra height to pass, you can always find a way around if one exists. You can usually find a safe shelter on the forest floor (a cave, tree hollow or bramble thicket) for you and up to five others."]]},
 "Wind-Touched": {"ab": ["DEX", "CHA", "WIS"], "sk": ["Acrobatics", "Performance"], "tool": "Wind Musical Instrument (choose one)", "toolPick": {"n": 1, "cats": ["music"]}, "langs": ["Auran"], "lgf": ["Auran"],
   "eq": "Wind Musical Instrument (same as above), Ornate Cloak, Symbol of the Wind, Common Clothes, Pouch, 10 GP", "gp": 10, "feat": "Musician",
   "bf": [["Supernatural Presence", "Many across Everden believe the wind has blessed you, whether or not it has. When you show skill or power that can be put down to wind or air, such as acrobatics or commanding unseen forces, believers are bolstered by it. They support you and, depending on how well you have convinced them, may treat you with reverence or even worship."]]},
}
