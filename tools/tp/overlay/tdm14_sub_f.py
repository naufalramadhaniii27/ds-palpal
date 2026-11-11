# Own-wording subclasses of Dark Matter, 2014 rules, batch F.
SUB = {
"Infiltrator": {"spab": "Intelligence",
 "f": {
  "Espionage": "You gain proficiency in the Data and Deception skills.",
  "Infiltration Rig": "You build an infiltration rig, an interface rig extended with gloves, a visor and extra functions. While you wear it: you can access arcane terminals, datapads and ship computers from 30 ft away. You have Darkvision to 60 ft, or +30 ft if you already have it. You can use an action to detect surveillance devices within 30 ft. You can cast disguise self once per Long Rest. At level 9 you can also cast invisibility on yourself once per Long Rest. At level 13 both return after a Short or Long Rest. Only you can use your rig, and you can have only one. A lost rig is rebuilt in 24 hours for 100 gp.",
  "Spider Module": "While you wear your rig, you can climb vertical surfaces and move upside down along ceilings with your hands free, and you gain a climbing speed equal to your walking speed.",
  "Hacking Spike": "While you wear your rig, you have Advantage on Intelligence (Data) checks to disable security systems or get sensitive data. When you hit a construct with a melee Sneak Attack, it makes a Wisdom save (DC 8 + Proficiency Bonus + Intelligence modifier) or is Stunned until the start of your next turn, even if normally immune.",
  "Predator Module": "When you cast invisibility with your rig, you can cast greater invisibility instead."},
 "acts": {"Infiltration Rig": "action"},
 "lu": [{"feature": "Infiltration Rig", "n": "Rig: Disguise Self", "lvl": 3, "max": 1, "reset": "long", "tag": "Cast disguise self free"},
        {"feature": "Infiltration Rig", "n": "Rig: Invisibility", "lvl": 9, "max": 1, "reset": "long", "tag": "Cast invisibility on self free"}],
 "fx": [[3, "Espionage", {"skills": ["Data", "Deception"]}], [9, "Spider Module", {"mv": {"climb": "walk"}}]]},

"Jumper": {"spab": "",
 "f": {
  "Tele-step": "As a bonus action, teleport to an unoccupied space you see within 10 ft. You can do this a number of times equal to your Proficiency Bonus, regained on a Long Rest. At level 9 the distance is 15 ft and you can bring one willing passenger you touch. At level 13 you can instead teleport up to 30 ft to a space you see, but after a 30 ft jump you must finish a Short or Long Rest before using Tele-step again.",
  "Murder Hole": "You open brief portals on solid surfaces that only objects can pass through. Once per turn, make a melee attack against a target within 30 ft of you and within 5 ft of a wall as if you stood next to it, or make a ranged attack against a creature behind cover within 30 ft as if it had no cover.",
  "Dimension Hop": "You can cast dimension door with no slot or components. Short or Long Rest to use again.",
  "Evacuation Circle": "You can cast teleportation circle as a ritual with no material components. Such circles cannot be made permanent. Each day you can also create a destination circle by casting it with 50 gp of diamond dust. It lasts 24 hours or until used. While on the same plane, you can use an action to teleport yourself and up to eight willing creatures within 30 ft to it."},
 "acts": {"Tele-step": "bonus", "Dimension Hop": "action"},
 "lu": [{"feature": "Tele-step", "lvl": 3, "max": "pb", "reset": "long", "tag": "Bonus action teleport 10 ft"},
        {"feature": "Dimension Hop", "lvl": 13, "max": 1, "reset": "short", "tag": "Cast dimension door free"}]},

"Nanite Host": {"spab": "Charisma",
 "f": {
  "Bonus Proficiency": "You gain proficiency in the Technology skill.",
  "Nano-Repair": "You learn the mending cantrip if you do not know it. You cast it as an action, and it does not count against your cantrips known. While conscious, you can use a bonus action on your turn to spend one Hit Die, roll it and regain hit points equal to the roll + your Constitution modifier.",
  "Improved Mending": "When you cast mending on a vehicle with mega hit points, you can spend any number of sorcery points to restore the vehicle as a whole. Each point repairs 1d10 lost mega hit points.",
  "Mind-Machine Interface": "You speak the native code-language of machines. You can use it to interact with arcane terminals and ship computers from 60 ft away and to talk to constructs without a shared language. You instantly decipher any encrypted message you meet. As an action, lock a machine or magical device you touch so only you can use it. Others find it unresponsive. A lock lasts up to 1 day, and you can have up to 3 locked devices.",
  "Reboot": "When you regain consciousness after dropping to 0 hit points, you immediately regain extra 4d6 + 4 hit points. Short or Long Rest to use again. You are also immune to any spell or ability that alters your memory or personality."},
 "acts": {"Nano-Repair": "bonus"},
 "lu": [{"feature": "Reboot", "lvl": 18, "max": 1, "reset": "short", "tag": "Regain 4d6 + 4 HP on waking"}],
 "fx": [[1, "Bonus Proficiency", {"skills": ["Technology"]}]]},

"Radiation Freak": {"spab": "Charisma",
 "f": {
  "High Power": "Whenever you deal Cold, Fire, Lightning or Poison damage, you can change its type to Radiant.",
  "Radioactive": "As an action, turn a radioactive aura on or off. While on, you shed bright light in 10 ft and dim light 10 ft further. Each creature that comes within 5 ft of you or starts its turn there takes 1d6 Radiant damage. It becomes 1d8 at level 6 and 1d10 at level 14.",
  "Adaptive Resistance": "After you take damage, you can use your reaction and spend 1 sorcery point to gain Resistance to that damage type until you finish a Short or Long Rest or use this again. It does not apply to the triggering damage.",
  "Glow Cloud": "As an action, turn yourself and everything you wear and carry into a radioactive cloud. This works like gaseous form, except your flying speed is half your speed, a creature that enters your space or starts its turn there takes 4d10 Radiant damage, and you can cast cantrips in this form. Long Rest to use again.",
  "Isotope Poisoning": "As an action, spend 3 sorcery points to bombard a creature you touch with near-lethal radiation. At the start of each of its turns it makes a Constitution save. On a failure it is Poisoned until the start of its next turn and takes 4d10 Radiant damage. After three failures it stays Poisoned for 1 hour and takes 1d10 Radiant damage at the start of each of its turns. After three successes the effect ends."},
 "acts": {"Radioactive": "action", "Adaptive Resistance": "reaction", "Glow Cloud": "action", "Isotope Poisoning": "action"},
 "lu": [{"feature": "Glow Cloud", "lvl": 14, "max": 1, "reset": "long", "tag": "Radioactive gaseous form"}]},
}
