# Own-wording species of Valda's Spire of Secrets (2014 rules), shape of src/data/wotc10-species-2014.js. Each subrace is its own species with the parent traits included.
DV = ["Darkvision", "Darkvision out to 60 ft."]
GEP = [
 ["Construct Anatomy", "You are a living creature despite being built. You are immune to nonmagical diseases. You need no food and no air, though you can eat and drink. Instead of sleeping you stay inactive for 4 hours a day, fully aware and alert to approaching enemies. Sleep magic can still put you under."],
 ["Innocuous", "You look like an ordinary toy of your type, so you are good at stealth. You have Advantage on Charisma (Deception) checks to pass as a mundane toy."],
]
GLANG = ["Languages", "You read and write Common and one other language, based on your maker's people."]
def gep(sub, asi, skill, extra):
    return {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "skills": [skill],
            "traits": [DV] + GEP + extra + [GLANG], "hb": "VSS14", "asi": asi, "lgf": ["Common"], "lgn": 1}
MAND = [
 ["Plant Nature", "With at least 4 hours of direct sunlight a day you need no food. You breathe through your leaves and limbs and take in water and nutrients through your feet. Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests."],
 ["Root Magic", "You know the Shillelagh cantrip and can target yourself, treating one limb as a club in place of an unarmed strike. At level 3 you can cast Goodberry once with this trait, and at level 5 Barkskin once. A Long Rest restores each. Wisdom is the spellcasting ability for these spells."],
]
MLANG = ["Languages", "You speak, read and write Common. You can also pass simple ideas to nonmagical plants and ask them about events nearby in the past day, learning of creatures that passed, the weather and similar things."]
def mand(asi, extra, speed=30, spauto=((1, "Shillelagh"), (3, "Goodberry"), (5, "Barkskin"))):
    r = {"size": "Medium", "speed": speed, "dark": 0, "type": "Plant", "spAb": "WIS", "spAbTrait": "Root Magic",
         "traits": MAND + extra + [MLANG], "hb": "VSS14", "asi": asi, "lgf": ["Common"]}
    return r
MOUSE = [
 DV, ["Lightfooted", "You have proficiency in Stealth."],
 ["Scurry", "You can move through the space of any hostile creature as if it were difficult terrain."],
 ["Squeeze", "You take no penalty for squeezing into a space meant for a creature one size smaller than you."],
]
ML = ["Languages", "You speak, read and write Common. You also speak Rodentia, a quiet squeaky tongue with no written form. Mousefolk keep history by story and song, and take notes in Common or in a shorthand that matches the sounds of Rodentia."]
SPECIES = {
 "Bisque Geppettin": gep("Bisque", {"DEX": 1, "CHA": 1, "CON": 1}, "Intimidation", [
   ["China Doll", "Wisdom (Insight) checks to read your true emotions have Disadvantage."],
   ["Surprise Attack", "If you surprise a creature and hit it with an attack on your first turn in combat, the attack deals an extra 2d6 damage. Once per combat."],
   ["Terrifying", "You have proficiency in Intimidation. You have Advantage on Charisma (Intimidation) checks to scare someone who did not know you were alive."]]),
 "Marionette Geppettin": gep("Marionette", {"DEX": 3, "CHA": 1}, "Performance", [
   ["Clipped Strings", "When you make a melee attack with a light weapon on your turn, the weapon gains the Reach property if it lacked it."],
   ["Pantomime", "You have proficiency in Performance and Advantage on Charisma (Performance) checks to dance."]]),
 "Raggedy Geppettin": gep("Raggedy", {"DEX": 1, "CHA": 3}, "Persuasion", [
   ["Adorable", "You have proficiency in Persuasion and Advantage on Charisma (Persuasion) checks against children and other humanoids fond of cute things."],
   ["Stuffed with Fluff", "When you take bludgeoning damage, you can use your reaction to gain resistance to that damage and be knocked 5 feet away from its source."]]),
 "Autumn Mandrake": mand({"WIS": 2, "CHA": 1}, [
   ["Abundance", "You can cast Goodberry with Root Magic from level 1, not level 3. Each creature that eats one of its berries regains hit points equal to your Proficiency Bonus."],
   ["Toxin Resistance", "You have Resistance to Poison damage."]]),
 "Spring Mandrake": mand({"WIS": 2, "DEX": 1}, [
   ["Sprightly Movement", "Your walking Speed rises by 5 feet."],
   ["Storm Resistance", "You have Resistance to Lightning damage."]], speed=35),
 "Summer Mandrake": mand({"WIS": 2, "STR": 1}, [
   ["Deep Roots", "While your feet are on natural ground, you have Advantage on Strength saves and on ability checks to resist being pushed, shoved, knocked prone or otherwise moved against your will."],
   ["Wildfire Resistance", "You have Resistance to Fire damage."]]),
 "Winter Mandrake": mand({"WIS": 2, "CON": 1}, [
   ["Frost Resistance", "You have Resistance to Cold damage."],
   ["Powerful Build", "You count as one size larger for carrying capacity and the weight you can push, drag or lift."]]),
 "Mouseling": {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "skills": ["Stealth"],
   "traits": MOUSE + [["Brave", "You have Advantage on saves against being frightened."],
     ["Nimble Escape", "When a creature you see makes an opportunity attack against you, you can use your reaction to give it Disadvantage on the attack roll. Not while you wear medium or heavy armor."], ML],
   "hb": "VSS14", "asi": {"DEX": 2, "CHA": 1}, "lgf": ["Common", "Rodentia"]},
 "Ratling": {"size": "Small", "speed": 25, "dark": 60, "type": "Humanoid", "skills": ["Stealth"],
   "traits": MOUSE + [["Gnaw", "As an action, chew through a small nonmagical object that is not worn or carried, such as rope, a wooden handle or cloth. Gnawing a wooden wall or floor for 1 minute opens a hole big enough for a Tiny creature. You cannot chew materials harder than your teeth, such as metal, stone or crystal."],
     ["Rat Resilience", "You have Advantage on saves against poison and Resistance to Poison damage."], ML],
   "hb": "VSS14", "asi": {"DEX": 2, "STR": 1}, "lgf": ["Common", "Rodentia"]},
 "Near-Human": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "featPick": True,
   "skillPick": {"n": 1, "from": ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], "label": "Skills"},
   "asiFlex": 2,
   "traits": [["Ability Score Increase", "Two different ability scores of your choice rise by 1. This replaces the human trait of the same name."],
              ["Skills", "You have proficiency in one skill of your choice."],
              ["Feat", "You gain one feat of your choice. It must list Near-Human variant as a prerequisite."],
              ["Languages", "You speak, read and write Common and one other language of your choice."]],
   "hb": "VSS14", "lgf": ["Common"], "lgn": 1},
 "Spirithost": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid",
   "traits": [["Ethereal Vision", "While you are on the Material Plane you can see 60 feet into the Ethereal Plane."],
              ["Incorporeal Movement", "You can move through other creatures as if they were difficult terrain. You can also move through solid objects, but your partly material body cannot pass more than 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt. If you end your movement in the same space as a solid object or creature, you are shunted to the nearest free space and take Force damage equal to twice the number of feet you were moved."],
              ["Ethereal Nature", "You can go twice as long without eating, drinking or breathing, without penalty."],
              ["Spirit Speech", "You can cast Speak with Dead with no slot and no material components. You can ask only one question of the corpse this way. A Long Rest restores it."],
              ["Translucence", "As a bonus action you turn invisible until the start of your next turn or until you attack, make a damage roll or force someone to save. Creatures that can see into the Ethereal Plane see you normally. A Short or Long Rest restores it."],
              ["Languages", "You speak, read and write Common and one other language of your choice."]],
   "asiPick": {"n": 1, "v": 2, "ex": ["DEX", "CHA"]}, "asi": {"DEX": 1}, "hb": "VSS14", "lgf": ["Common"], "lgn": 1},
}
LU = [
 {"src": "species", "owner": "Autumn Mandrake", "feature": "Root Magic", "n": "Root Magic: Goodberry", "lvl": 1, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Autumn Mandrake", "feature": "Root Magic", "n": "Root Magic: Barkskin", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
] + [{"src": "species", "owner": o, "feature": "Root Magic", "n": "Root Magic: Goodberry", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"} for o in ("Spring Mandrake", "Summer Mandrake", "Winter Mandrake")] \
  + [{"src": "species", "owner": o, "feature": "Root Magic", "n": "Root Magic: Barkskin", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"} for o in ("Spring Mandrake", "Summer Mandrake", "Winter Mandrake")] + [
 {"src": "species", "owner": "Bisque Geppettin", "feature": "Surprise Attack", "n": "Surprise Attack", "lvl": 1, "max": 1, "reset": "short", "tag": "Once per combat"},
 {"src": "species", "owner": "Spirithost", "feature": "Spirit Speech", "n": "Spirit Speech", "lvl": 1, "max": 1, "reset": "long", "tag": "Speak with Dead"},
 {"src": "species", "owner": "Spirithost", "feature": "Translucence", "n": "Translucence", "lvl": 1, "max": 1, "reset": "short", "tag": "Bonus Action"},
]
ACTS = {"sp|Spirithost|Translucence": [["bonus", "", "Translucence"]], "sp|Spirithost|Spirit Speech": [["action", "", "Spirit Speech"]]}
SP_AUTO = {n: {"": [[1 if n == "Autumn Mandrake" else 3, "Goodberry"], [5, "Barkskin"], [1, "Shillelagh"]]} for n in ("Autumn Mandrake", "Spring Mandrake", "Summer Mandrake", "Winter Mandrake")}
SP_AUTO["Spirithost"] = {"": [[1, "Speak with Dead"]]}
DEF = {}
GXSP = {
 "Autumn Mandrake": [{"n": "Toxin Resistance", "res": ["Poison"]}],
 "Spring Mandrake": [{"n": "Storm Resistance", "res": ["Lightning"]}],
 "Summer Mandrake": [{"n": "Wildfire Resistance", "res": ["Fire"]}, {"n": "Deep Roots", "advOn": ["Strength saving throws while on natural ground"]}],
 "Winter Mandrake": [{"n": "Frost Resistance", "res": ["Cold"]}],
 "Ratling": [{"n": "Rat Resilience", "res": ["Poison"], "advOn": ["saving throws against poison"]}],
 "Mouseling": [{"n": "Brave", "advOn": ["saving throws against being frightened"]}],
 "Bisque Geppettin": [{"n": "China Doll", "defs": [["Note", "China Doll: Wisdom (Insight) checks to read your emotions have Disadvantage"]]}],
 "Raggedy Geppettin": [{"n": "Stuffed with Fluff", "defs": [["Note", "Stuffed with Fluff: reaction, resistance to one bludgeoning hit, then pushed 5 ft"]]}],
 "Spirithost": [{"n": "Ethereal Vision", "sense": [["Ethereal Sight", 60, "See 60 ft into the Ethereal Plane while on the Material Plane"]]}],
}
