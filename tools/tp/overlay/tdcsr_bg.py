# Own-wording backgrounds of Tal'Dorei Campaign Setting Reborn. Record shape follows src/data/wotc08-backgrounds-2014.js.
# The source lists no starting equipment for four of the five backgrounds, so eq says so and gp is 0 (no invented kit).
OPTS = ["Alert", "Crafter", "Healer", "Lucky", "Magic Initiate (Cleric)", "Magic Initiate (Druid)", "Magic Initiate (Wizard)", "Musician", "Savage Attacker", "Skilled", "Tavern Brawler", "Tough"]
NOEQ = "None listed in the book. Ask your DM."
# Origin feat and the three ability scores are chosen by the skills and theme, the same way the 2014 backgrounds of the PHB are carried over.
BG = {
 "Ashari": {"ab": ["INT", "WIS", "CON"], "sk": ["Nature"], "skPick": {"n": 1, "from": ["Arcana", "Survival"]}, "tool": "Herbalism Kit",
   "eq": "Traveler's Clothes, Staff, Herbalism Kit, Pouch, 10 GP", "gp": 10, "langs": ["Primordial"], "lgf": ["Primordial"], "feat": "Magic Initiate (Druid)",
   "bf": [["Elemental Harmony", "As an action, use minor magic tied to your Ashari order: Pyrah lights or snuffs a small flame, Terrah makes a small rock that turns to dust after 1 minute, Vesrah makes a drink of hot or cold water, Zephrah makes a puff of wind."]]},
 "Clasp Member": {"ab": ["CHA", "DEX", "CON"], "sk": ["Deception"], "skPick": {"n": 1, "from": ["Sleight of Hand", "Stealth"]}, "tool": "Disguise Kit, Forgery Kit or Thieves' Tools (choose one)",
   "toolPick": {"n": 1, "cats": ["xtdcl"]}, "eq": NOEQ, "gp": 0, "langs": ["Thieves' Cant"], "lgf": ["Thieves' Cant"], "feat": "Alert",
   "bf": [["A Favor in Turn", "Near a center of Clasp activity you can call in a favor of up to 20 words. A Spireling approves it and the DM decides how it is met: muscle, a small loan, or help getting out of jail."],
          ["Variant: Myriad Operative", "You work for the Myriad, a more sophisticated and ruthless syndicate than the Clasp, and you keep your work secret from other criminals and the law. This changes the story only, not the rules."]]},
 "Lyceum Scholar": {"ab": ["INT", "CHA", "CON"], "sk": [], "skPick": {"n": 2, "from": ["Arcana", "History", "Persuasion"]}, "tool": "None",
   "eq": NOEQ, "gp": 0, "lgn": 2, "feat": "Magic Initiate (Wizard)",
   "bf": [["Academic Requisition", "On the Lyceum grounds or at another major academic institution you can requisition any set of tools. Each set is magically marked and sounds an alarm if taken off the grounds."]]},
 "Reformed Cultist": {"ab": ["CHA", "INT", "CON"], "sk": ["Deception", "Religion"], "tool": "None",
   "eq": NOEQ, "gp": 0, "lgn": 1, "feat": "Magic Initiate (Cleric)",
   "bf": [["Fell Teachings", "You know the commandments and secrets of one Betrayer God of your choice. You have an adjusted roll on Intelligence (Religion) checks about that faith (the source text is garbled, intended as Advantage)."]]},
 "Whitestone Rifle Corps": {"ab": ["STR", "WIS", "CON"], "sk": [], "skPick": {"n": 2, "from": ["Athletics", "Perception", "Survival"]}, "tool": "None",
   "eq": NOEQ, "gp": 0, "lgn": 1, "feat": "Savage Attacker",
   "bf": [["Legacy of Secrecy", "You were trusted with a powerful and frightening firearm made by Percival de Rolo, a weapon that may change war in Tal'Dorei."],
          ["Rifle Corps Relationship", "You are or were part of Whitestone's elite defenders. Agree with your DM what your relationship with the Corps is today."],
          ["Variant: Grey Hunter", "You belong to a secret group drawn from the Rifle Corps who serve the de Rolo family as spies, bodyguards and sometimes assassins. You have the ear of Whitestone's rulers, and must use that privilege with care. This changes the story only."]]},
}
TL = {"xtdcl": {"cat": "Clasp tools (pick one)", "one": "tool", "list": ["Disguise Kit", "Forgery Kit", "Thieves' Tools"], "txt": "Disguise Kit, Forgery Kit or Thieves' Tools"}}
