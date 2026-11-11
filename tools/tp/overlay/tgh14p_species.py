# Own-wording species of Grim Hollow Player's Guide (2014 rules). Each subrace is its own species with the parent traits included.
DV = ["Darkvision", "Darkvision out to 60 ft."]
PB = ["Powerful Build", "You count as one size larger for carrying capacity and for the weight you can push, drag or lift."]
LANESHI = [DV, ["Amphibious", "You can breathe both air and water."],
           ["Beast Whisperers", "You know speak with animals and can cast it once with no slot. Long Rest to use again. Wisdom is the spellcasting ability."]]
DOWNCAST = [["Divine Learning", "Proficiency in the Religion skill. You know the thaumaturgy cantrip. Wisdom is the spellcasting ability."],
            ["Divine Sangromancy", "When an ally within 30 ft of you regains hit points, you can spend a Hit Die and add the roll to the healing."],
            ["Lingering Divinity", "Resistance to Necrotic damage."]]
DCL = ["Languages", "You speak, read and write Celestial and one other language of your choice."]
SPECIES = {
 "Dreamer": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid",
   "traits": [DV, ["Dreamwalking", "While asleep, you can reach into the dreams of others within 1 mile. After a Long Rest in which you slept, choose one skill or tool. Until your next Long Rest you add your Proficiency Bonus to rolls with it."],
              ["Even in Sleep", "While asleep, you have no penalty to Perception rolls that use senses other than sight."],
              ["Power Nap", "During a Short Rest you can sleep for 1 hour. If you do, you lower your exhaustion by one level and regain one Hit Die in addition to the Short Rest benefits."],
              ["Languages", "You speak, read and write Dreamspeak, Dwarvish and one other language of your choice."]],
   "hb": "GHPG14", "asi": {"INT": 2, "CON": 1}, "lgf": ["Dreamspeak", "Dwarvish"]},
 "Mystic Laneshi": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "fx": {"moves": {"swim": 30}}, "spAb": "WIS",
   "traits": LANESHI + [["Duality of Spirit", "After the Rite of Tann'lia, your dead twin's soul is bound to yours. You have Resistance to Psychic damage and Advantage on Intelligence, Wisdom and Charisma saves against magic. The first time this activates after a Long Rest, make a DC 12 Wisdom save. On a failure your twin tries to seize control and you are Stunned until the end of your next turn."],
                        ["Laneshi Magic", "You know one necromancy cantrip of your choice, and a second at level 5. Wisdom is the spellcasting ability for them."],
                        ["Languages", "You speak, read and write Laneshi and one other language of your choice."]],
   "hb": "GHPG14", "asi": {"WIS": 2, "STR": 1}, "lgf": ["Laneshi"]},
 "Warrior Laneshi": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "fx": {"moves": {"swim": 30}}, "skills": ["Animal Handling"], "profs": {"weapons": "Spear, Trident, Javelin", "armor": "Light armor"}, "spAb": "WIS",
   "traits": LANESHI + [["Skirmish Tactics", "When you hit a hostile creature with a weapon attack, you can take the Disengage action as a bonus action until the end of your turn."],
                        ["Laneshi Weapon Training", "Proficiency with the spear, trident, javelin and light armor, and the Animal Handling skill."],
                        ["Languages", "You speak, read and write Laneshi and one other language of your choice."]],
   "hb": "GHPG14", "asi": {"STR": 2, "WIS": 1}, "lgf": ["Laneshi"]},
 "Ogresh": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "spAb": "CHA",
   "traits": [["Takes One to Know One", "Advantage on saves against being Charmed."], PB,
              ["Gift of Gab", "Proficiency in two of these skills of your choice: Persuasion, Insight, Deception and Performance."],
              ["A Friendly Ear", "Once per Short Rest, if you talk with a non-hostile creature for at least 1 minute, you can try to charm it. It makes a Wisdom save against DC 8 + your Charisma modifier + your Proficiency Bonus. On a failure it is Charmed by you for 1 hour and you learn one fact it knows about the topic, as the DM decides. Whether or not it saves, it does not know you tried."],
              ["Languages", "You speak, read and write three languages of your choice."]],
   "hb": "GHPG14", "asi": {"CHA": 2, "CON": 1, "WIS": 1}, "lgf": []},
 "The Disembodied": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Arcana"], "spAb": "INT",
   "traits": [["Origin Race", "You choose what race you appear as. Your height and size match that race. You gain none of its racial features. Your weight is a quarter of the original."],
              ["Fade Away", "As an action, fade into the Ethereal Plane for 1 minute or until you end it with a bonus action. While faded you cannot interact with the Material Plane and it cannot affect you, including spells and creatures. You can still move and hear, and see everything in grey. You reappear in the nearest open space to where you vanished. Long Rest to use again."],
              ["Planar Outcast", "You can cast feather fall on yourself once per day. At level 3 you can cast blur once per day. At level 5 you can cast blink once per day. Intelligence is the spellcasting ability."],
              ["Arcane Origins", "Proficiency in the Arcana skill."],
              ["Languages", "You speak, read and write two languages of your choice."]],
   "hb": "GHPG14", "asi": {"INT": 2, "DEX": 1}, "lgf": []},
 "Aurelian": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Religion"], "spAb": "WIS",
   "traits": DOWNCAST + [["Hand of Aurelia", "You can cast cure wounds at 1st level once with no slot. Long Rest to use again. Wisdom is the spellcasting ability."], DCL],
   "hb": "GHPG14", "asi": {"WIS": 2, "CHA": 1}, "lgf": ["Celestial"]},
 "Galtian": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Religion"], "spAb": "WIS",
   "traits": DOWNCAST + [["Galt's Bulwark", "You can cast shield of faith once with no slot. Long Rest to use again."], DCL],
   "hb": "GHPG14", "asi": {"WIS": 2, "CON": 1}, "lgf": ["Celestial"]},
 "Maliganti": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Religion"], "spAb": "WIS",
   "traits": DOWNCAST + [["Fury of Maligant", "You can cast branding smite at 1st level once with no slot. Long Rest to use again. Wisdom is the spellcasting ability."], DCL],
   "hb": "GHPG14", "asi": {"WIS": 2, "STR": 1}, "lgf": ["Celestial"]},
 "Ulmyrite": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "skills": ["Religion"], "spAb": "WIS",
   "traits": DOWNCAST + [["Ulmyr's Sight", "You can cast detect magic once with no slot. Long Rest to use again."], DCL],
   "hb": "GHPG14", "asi": {"WIS": 2, "INT": 1}, "lgf": ["Celestial"]},
 "Wechselkind": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid", "skills": ["Acrobatics"], "spAb": "CHA",
   "traits": [["Artificial Form", "You have Advantage on saves against being Poisoned and Resistance to Poison damage. You are immune to disease and magical aging. You need no food, drink, sleep or air. You still count as a humanoid."],
              ["Faerie Glamour", "You can cast disguise self once with no slot, only to look like the child you were meant to replace. Long Rest to use again. Charisma is the spellcasting ability."],
              ["Childish Agility", "You can move through the space of any creature larger than you. Proficiency in the Acrobatics skill."],
              ["Languages", "You speak, read and write Sylvan and one other language of your choice."]],
   "hb": "GHPG14", "asi": {"CON": 2, "CHA": 1}, "lgf": ["Sylvan"]},
}
def _lu(owner, feat, n, lvl, reset, tag):
    return {"src": "species", "owner": owner, "feature": feat, "n": n, "lvl": lvl, "max": 1, "reset": reset, "tag": tag}
LU = [
 _lu("Mystic Laneshi", "Beast Whisperers", "Beast Whisperers", 1, "long", "Speak with animals"),
 _lu("Warrior Laneshi", "Beast Whisperers", "Beast Whisperers", 1, "long", "Speak with animals"),
 _lu("Ogresh", "A Friendly Ear", "A Friendly Ear", 1, "short", "Charm a non-hostile creature"),
 _lu("The Disembodied", "Fade Away", "Fade Away", 1, "long", "Action, 1 minute"),
 _lu("The Disembodied", "Planar Outcast", "Planar Outcast: Feather Fall", 1, "long", "1/Long Rest spell"),
 _lu("The Disembodied", "Planar Outcast", "Planar Outcast: Blur", 3, "long", "1/Long Rest spell"),
 _lu("The Disembodied", "Planar Outcast", "Planar Outcast: Blink", 5, "long", "1/Long Rest spell"),
 _lu("Aurelian", "Hand of Aurelia", "Hand of Aurelia", 1, "long", "Cure wounds"),
 _lu("Galtian", "Galt's Bulwark", "Galt's Bulwark", 1, "long", "Shield of faith"),
 _lu("Maliganti", "Fury of Maligant", "Fury of Maligant", 1, "long", "Branding smite"),
 _lu("Ulmyrite", "Ulmyr's Sight", "Ulmyr's Sight", 1, "long", "Detect magic"),
 _lu("Wechselkind", "Faerie Glamour", "Faerie Glamour", 1, "long", "Disguise self"),
]
ACTS = {"sp|The Disembodied|Fade Away": [["action", "", "Fade Away"]]}
SP_AUTO = {k: {"": [[1, "Thaumaturgy"]]} for k in ("Aurelian", "Galtian", "Maliganti", "Ulmyrite")}
DEF = {"Mystic Laneshi": [["Resistance", "Psychic"]], "Aurelian": [["Resistance", "Necrotic"]], "Galtian": [["Resistance", "Necrotic"]], "Maliganti": [["Resistance", "Necrotic"]], "Ulmyrite": [["Resistance", "Necrotic"]], "Wechselkind": [["Resistance", "Poison"]]}
GXSP = {}
