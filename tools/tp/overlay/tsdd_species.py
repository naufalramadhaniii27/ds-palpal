# Own-wording species of Dr Dhrolin's Dictionary of Dinosaurs (2024 rules). Shape follows tee24_species.py and tvss_species.py.
# The species are written straight into this file because it has no chunk loader.
# Engine notes: Archosauric and the dinosaur creature tag are text only. Osteoderms offers two AC options and is text only.
DV60 = ["Darkvision", "Darkvision 60 ft."]
DINO = ["Creature Type", "You are a Humanoid. You count as a dinosaur for any prerequisite or effect that needs a dinosaur."]
ARCH = ["Bonus Languages", "You know Archosauric. Species do not normally give languages, but it fits here."]
SPECIES = {
 "Pluvenn": {"size": "Small or Medium", "speed": 30, "dark": 60, "type": "Humanoid",
   "attacks": [{"n": "Razormaw", "die": "1d4", "type": "Piercing", "range": "5 ft", "ab": "DEX", "note": "Your teeth are natural weapons. A hit deals Piercing damage in place of the normal Bludgeoning damage of an Unarmed Strike."}],
   "traits": [DINO,
              ["Lifespan", "Pluvenn mature at 11 or 12 years old and live 40 to 50 years."],
              ["Razormaw", "Your teeth are natural weapons you can use for Unarmed Strikes. On a hit they deal 1d4 + Dexterity modifier Piercing damage instead of Bludgeoning."],
              ["Grappleclaws", "Large curved claws on your feet help you climb and grip. You have Advantage on an Unarmed Strike made to Grapple a creature and on Athletics checks to climb. While you Grapple a creature, you can use a Bonus Action to deal 1d4 + your Proficiency Bonus Piercing damage to it."],
              ["Nocturnal/Diurnal", "You have Darkvision 60 ft. A Long Rest takes you only 4 hours."],
              ["Pneumatised and Feathered", "While you are not Incapacitated, you have Resistance to falling damage."],
              ARCH],
   "hb": "DDD24"},
 "Manyhorn": {"size": "Small or Medium", "speed": 30, "dark": 0, "type": "Humanoid",
   "attacks": [{"n": "Horns", "die": "1d6", "type": "Piercing", "range": "5 ft", "ab": "STR", "note": "Horned Repose only. Finesse, so use Strength or Dexterity. Add your Proficiency Bonus to the damage from level 10."}],
   "traits": [DINO,
              ["Lifespan", "Manyhorn mature between 15 and 32 years old and live 40 to 120 years. Larger kinds live longer."],
              ["Musclebound", "You count as one size larger for carrying capacity and the weight you can push, drag or lift."],
              ["Guild Connections", "When you enter a new city, town or other major settlement, roll a d4. You gain the matching benefit while you are there. 1: you and your party find simple overnight lodging for free. 2: traders charge you and your party 10 percent less. 3: town guards are more lenient with you and your party. 4: one NPC shares uncommon information with you and your party."],
              ["Head Crest", "You have proficiency in Intimidation. As a Bonus Action you can flood your crest with blood so it shows bright pinks and reds. For the next minute you have Advantage on Intimidation checks."],
              ["Horned Repose", "Reaction when an enemy within 5 ft fails to hit you with a melee attack: make one unarmed attack against it with your horns. You are trained with them and they have the Finesse property. They deal 1d6 + your Strength or Dexterity modifier Piercing damage. From level 10, add your Proficiency Bonus to the damage."],
              ARCH],
   "hb": "DDD24"},
 "Jeholrak": {"size": "Small", "speed": 30, "dark": 0, "type": "Humanoid", "spAb": "choose", "spAbTrait": "Power of Persuasion",
   "traits": [DINO,
              ["Lifespan", "Jeholrak mature at 16 or 17 and typically live up to 50 years, a result of their cutthroat society. An isolated Jeholrak can reach the late 70s or early 80s."],
              ["Power of Persuasion", "You give off hypnotic pheromones. At level 1 you can cast Charm Person and at level 5 Suggestion, each once with no slot and no components, regaining the use on a Long Rest. A faint sweet smell is the only sign. Constitution, Wisdom or Charisma is your spellcasting ability for them, chosen with the species. They have no effect on other Jeholrak."],
              ["Cutthroat Society", "You have Advantage on Sleight of Hand checks. As a Bonus Action you can hide a small one-handed weapon or item on your person. Only a successful Investigation check or magic finds it, against DC 8 + your Dexterity modifier + your Proficiency Bonus. This suits wands, daggers, handaxes, hand clubs and similar small items. It cannot hide a shortsword."]],
   "hb": "DDD24"},
 "Ankylier": {"size": "Medium", "speed": 25, "dark": 0, "type": "Humanoid",
   "attacks": [{"n": "Clubbed Tail", "die": "1d6", "type": "Bludgeoning", "range": "5 ft", "ab": "STR", "note": "Can replace any of your attacks. Add your Proficiency Bonus to the damage from level 10."}],
   "traits": [DINO,
              ["Lifespan", "Ankylier join Ankylier society at about 12, mature at about 25 and live 110 to 130 years."],
              ["Musclebound", "You count as a Large creature for carrying capacity and the weight you can push, drag or lift."],
              ["Clubbed Tail", "When you attack, you can replace any of your attacks with a tail attack. It is a Melee Attack Roll you are trained with and it uses your Strength modifier to hit. It deals 1d6 + Strength modifier Bludgeoning damage. From level 10, add your Proficiency Bonus to the damage."],
              ["Metalworker", "You have proficiency with Smith's Tools and training with Medium armor. Over a Long Rest you can make one mundane shield, simple weapon, martial weapon or Medium armor, if you have materials and a forge. If you do, you gain only the benefits of a Short Rest from that rest."],
              ["Osteoderms", "Thick bony plates cover your skin. You get +3 AC but cannot add your Dexterity modifier to AC. Or, you can have an unarmored AC of 17 and still not add your Dexterity modifier. Agree with your GM which version you use."],
              ARCH],
   "hb": "DDD24"},
 "Limukin": {"size": "Small or Medium", "speed": 30, "dark": 60, "type": "Humanoid",
   "traits": [DINO, DV60,
              ["Lifespan", "Limukin reach adult size at 6 to 8 years old and are fully mature at 9 or 10. They usually live into their early 20s, and the oldest reach their late 20s or early 30s."],
              ["Hunter-Gatherer", "You have Advantage on Stealth and Survival checks in a forest, wood, jungle or other heavily vegetated area. In a vegetated habitat you know well, you can forage twice as much food as normal. This stacks with similar abilities."],
              ["Envenomed Weapons", "Action: coat a weapon or up to 5 pieces of ammunition with venom you secrete. A creature damaged by the coated weapon or ammunition makes a Constitution save. On a failure it takes 2d4 Poison damage and has the Poisoned condition for 1 minute. The damage is 3d4 from level 5. The save DC is 10 + your Proficiency Bonus. The venom dries and loses strength after 1 minute. Long Rest to use again."],
              ["Innate Toxicology", "You have Resistance to Poison damage. You have Advantage on any check or save to avoid or end the Poisoned condition."],
              ARCH],
   "hb": "DDD24"},
 "Child of Seth": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "fx": {"moves": {"fly": 30}},
   "skillPick": {"n": 2, "from": ["Arcana", "History", "Religion"], "label": "Verbal Culture"},
   "traits": [["Creature Type", "You are a Humanoid. You count as a dinosaur and as a pterosaur for any prerequisite or effect that needs one."],
              ["Lifespan", "Children of Seth mature at about 50 and live 300 to 400 years."],
              ["Flight", "You have a Fly Speed of 30 ft. It drops to 20 ft while you wear Medium or Heavy armor."],
              ["Global Migrators", "You have proficiency in Athletics. When you can see the sky, you always know which way is north."],
              ["Verbal Culture", "You have proficiency in two of these skills: Arcana, History, Religion. Or you can take Expertise in one of them instead. You remember every person you have met, including their name if you learned it."],
              ["Well-Travelled", "You know the value of any trade goods at a glance, if you have met them before."],
              ["Bonus Languages", "You know Archosauric and one other language of your choice. Species do not normally give languages, but it fits here."]],
   "hb": "DDD24"},
}
LU = [
 {"src": "species", "owner": "Jeholrak", "feature": "Power of Persuasion", "n": "Power of Persuasion: Charm Person", "lvl": 1, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Jeholrak", "feature": "Power of Persuasion", "n": "Power of Persuasion: Suggestion", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Limukin", "feature": "Envenomed Weapons", "n": "Envenomed Weapons", "lvl": 1, "max": 1, "reset": "long", "tag": "Action"},
]
ACTS = {
 "sp|Pluvenn|Grappleclaws": [["bonus", "", "Grappleclaws"]],
 "sp|Manyhorn|Head Crest": [["bonus", "", "Head Crest"]],
 "sp|Manyhorn|Horned Repose": [["reaction", "", "Horned Repose"]],
 "sp|Jeholrak|Cutthroat Society": [["bonus", "", "Cutthroat Society"]],
 "sp|Limukin|Envenomed Weapons": [["action", "", "Envenomed Weapons"]],
}
SP_AUTO = {
 "Jeholrak": {"": [[1, "Charm Person"], [5, "Suggestion"]]},
}
DEF = {}
