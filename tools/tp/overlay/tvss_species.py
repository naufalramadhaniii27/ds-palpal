# Own-wording species of Valda's Spire of Secrets (2024 rules). Shape of src/data/wotc04-species-lorwyn-ravenloft.js.
SPECIES = {
 "Geppettin": {"size": "Small or Medium", "speed": 30, "dark": 60, "type": "Construct",
   "skillPick": {"n": 1, "from": ["Intimidation", "Performance", "Persuasion"], "label": "Handcrafted Quality"},
   "lin": {"label": "Geppettin Construction", "opts": ["Bisque (Small)", "Marionette (Small or Medium)", "Plushie (Small)"]},
   "traits": [["Darkvision", "Darkvision 60 ft."],
              ["Construct Nature", "You need no food, drink or air. You do not sleep and magic cannot put you to sleep. You finish a Long Rest in 4 hours of motionless rest while awake."],
              ["Handcrafted Quality", "Your design may be unnerving, articulated or friendly. You have proficiency in Intimidation, Performance or Persuasion."],
              ["Geppettin Construction", "Pick one. Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. Marionette (wood): on your turn, your reach with a Melee weapon that lacks Reach, Two-Handed and Versatile is 5 feet longer. Plushie (fabric): when you take Bludgeoning damage, use your Reaction to resist that damage and be knocked 5 feet away from the source (not if you cannot be knocked away)."]],
   "hb": "VSS24"},
 "Mandrake": {"size": "Medium", "speed": 30, "dark": 0, "type": "Plant", "spAb": "choose", "spAbTrait": "Root Magic",
   "skillPick": {"n": 1, "from": ["Nature", "Survival"], "label": "Natural Connection"},
   "lin": {"label": "Harvest Season", "opts": ["Autumn", "Spring", "Summer", "Winter"]},
   "traits": [["Plant Nature", "With at least 4 hours of direct sunlight a day, you do not need to eat. You breathe through your leaves and take in water and nutrients through your feet."],
              ["Natural Connection", "Proficiency in Nature or Survival."],
              ["Root Magic", "You know Shillelagh and can target yourself, treating one limb as a Club. At level 3 you always have Goodberry prepared, at level 5 Barkskin. You can cast each once per Long Rest without a slot, or with slots. Intelligence, Wisdom or Charisma is the spell ability, chosen with the species."],
              ["Entangling Vines", "Bonus Action: vines grip a Large or smaller creature you see within 30 feet. Its Speed is 0 and cannot increase until the end of its next turn. It ends early if the creature gives up one attack to free itself. Uses equal your Proficiency Bonus per Long Rest. At level 3 your season adds an effect: Autumn also affects a second creature within 5 feet of the first. Spring lets you target a flying creature within 30 feet of the ground and pulls it safely down. Summer moves the target up to 10 feet to an open space on the ground. Winter deals Cold damage equal to your Proficiency Bonus."]],
   "hb": "VSS24"},
}
LU = [
 {"src": "species", "owner": "Mandrake", "feature": "Entangling Vines", "n": "Entangling Vines", "lvl": 1, "max": "pb", "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Mandrake", "feature": "Root Magic", "n": "Root Magic: Goodberry", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Mandrake", "feature": "Root Magic", "n": "Root Magic: Barkskin", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
]
ACTS = {"sp|Mandrake|Entangling Vines": [["bonus", "", "Entangling Vines"]]}
SP_AUTO = {"Mandrake": {"": [[1, "Shillelagh"], [3, "Goodberry"], [5, "Barkskin"]]}}
DEF = {}
