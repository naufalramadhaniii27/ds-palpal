# Own-wording backgrounds of the TalDorei Campaign Guide (Matthew Mercer, 2014 rules). Record shape follows tdcsr_bg.py.
# Fate-Touched is a feature that stacks on another background, so it is built as a feat (see tdcg_feat.py).
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
ALSO = ["Fate-Touched"]
LU = []
TL = {"xtdcg": {"list": ["Disguise Kit", "Forgery Kit", "Thieves' Tools"], "cat": "Myriad tools", "one": "Myriad tool"}}
BG = {
 "Lyceum Student": {"ab": ["INT", "CHA", "CON"], "sk": [], "skPick": {"n": 2, "from": ["Arcana", "History", "Persuasion"]}, "tool": "Calligrapher's Supplies",
   "eq": "Fine Clothes, Lyceum uniform, Calligrapher's Supplies, Pouch, 10 GP", "gp": 10, "lgn": 2, "feat": "Magic Initiate (Wizard)",
   "bf": [["Student Privilege", "On the Lyceum grounds and at some allied universities you may use any tool kit in the chamber that holds it. Each kit is magically marked and sounds an alarm if taken out. Dangerous kits (a Poisoner's Kit) and advanced work (enchanting an item) may need staff to watch. You may also get free crafting materials and enchanting tables, if the school allows it."]]},
 "Myriad Operative": {"ab": ["CHA", "DEX", "CON"], "sk": ["Deception"], "skPick": {"n": 1, "from": ["Sleight of Hand", "Stealth"]}, "tool": "Thieves' Tools, Forgery Kit or Disguise Kit (choose one)",
   "toolPick": {"n": 1, "cats": ["xtdcg"]}, "eq": "Dark common clothes with a hood, tools to match your tool choice, Pouch, 10 GP", "gp": 10, "langs": ["Thieves' Cant"], "lgf": ["Thieves' Cant"], "feat": "Alert",
   "bf": [["A Favor in Turn", "Near a center of Myriad activity you can call in a favor of up to 20 words. An unseen Spireling approves it and the DM decides how it is met: muscle from a Myriad minion, a small loan, or help getting out of jail. The favor will be called back, often with no warning (a burglary, getting a secret from a dignitary, or a hit). If you do not repay it in a fair time you can lose your place, and a large debt can put a contract on you."],
          ["Slavery and Exotic Trade", "The Myriad deals in slavery and rare goods, so you sometimes get servants or rare materials without using your favor. Your contacts are fewer than a Clasp member's, and if a Clasp member finds you out, you will be hunted."]]},
 "Recovered Cultist": {"ab": ["CHA", "INT", "CON"], "sk": ["Deception", "Religion"], "tool": "None",
   "eq": "Vestments and holy symbol of your old cult, Common Clothes, Pouch, 15 GP", "gp": 15, "lgn": 1, "feat": "Magic Initiate (Cleric)",
   "bf": [["Wicked Awareness", "Your time in secret worship leaves you able to spot hidden signs, messages and signals left in settled places. When you actively look for signs of a cult or dark following, you get an adjusted roll on ability checks to find and read them (the source text is garbled, intended as Advantage)."]]},
}
