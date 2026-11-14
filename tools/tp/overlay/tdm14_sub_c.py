# Own-wording subclasses of Dark Matter, 2014 rules, batch C.
SUB = {
"Circle of Configuration": {"spab": "Wisdom",
 "f": {
  "Construct Form": "Your Wild Shape becomes a bonus action, but you can no longer take beast shapes. You take a Construct Form instead. While in it, a bonus action lets you switch into a Configuration or change to another one. Juggernaut: AC +2, and you subtract 2 from Bludgeoning, Piercing and Slashing damage you take. Your Photon Cannon is replaced by Repulsor Gauntlet, a melee spell attack dealing 1d10 + 3 Force damage. Mobile: speed 40 ft, opportunity attacks against you have Disadvantage, and you gain 40 ft climbing and swimming speeds (40 ft flying from level 8). Turret: speed 0, and when you take the Attack action you get one extra attack as a bonus action. Photon Cannon is replaced by Photon Turret, a ranged spell attack (60/240 ft) dealing 2d10 Radiant damage. From level 6 you attack twice with the Attack action in any Configuration.",
  "Machine Code": "You speak the native code-language of machines. You can interact with arcane terminals and ship computers from range and talk to constructs even without a shared language.",
  "Speaker of Steel": "Constructs can be Charmed by you even if they are normally immune. You can also target a construct with animal friendship.",
  "Stalker Configuration": "You gain a Configuration built for stealth. As a bonus action you cloak and turn Invisible until the start of your next turn, or until you attack or cast a spell. You cannot do this again on the following round. You have Advantage on Dexterity (Stealth) checks in this form and gain the Antimatter Dagger action next to your Photon Cannon: a melee spell attack dealing 1d4 + 3 Necrotic damage. Once per turn it deals extra 4d6 if you have Advantage, or if the target is within 5 ft of an able ally of yours and you lack Disadvantage.",
  "Mecha Transformation": "As an action, switch into an empowered Juggernaut Configuration called Mecha. You keep all Juggernaut benefits and keep your photon cannon option, but you subtract 4 from damage taken instead of 2. You become Large, have Advantage on Strength checks and saves, and when you take the Attack action you can make two extra melee weapon attacks as a bonus action. It lasts up to 10 minutes. Long Rest to use again."},
 "acts": {"Construct Form": "bonus", "Stalker Configuration": "bonus", "Mecha Transformation": "action"},
 "lu": [{"feature": "Mecha Transformation", "lvl": 14, "max": 1, "reset": "long", "tag": "Large Mecha form, 10 min"}]},

"Circle of the Obelisk": {"spab": "Wisdom",
 "f": {
  "Evolutionary": "You have a pool of 4 Evolution Dice (d4). As a bonus action, choose a willing creature you see within 60 ft, spend 1 die and roll it. One ability score of your choice on that creature rises by the roll, to a maximum of 20, for 1 minute. A creature can have only one score raised this way at a time. All dice return on a Long Rest.",
  "Transient Awakening": "You can cast speak with animals or speak with plants without using a spell slot.",
  "Superior Health": "You are immune to one condition of your choice: Blinded, Deafened or Poisoned. You can change the choice after a Long Rest.",
  "High Evolutionary": "Each of your ability scores increases by 2, to a maximum of 20."},
 "acts": {"Evolutionary": "bonus"},
 "lu": [{"feature": "Evolutionary", "n": "Evolution Dice", "lvl": 2, "max": 4, "reset": "long", "tag": "d4 ability boost on an ally"}]},

"Space Marine": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in the Piloting skill.",
  "Impulse Frame": "You gain a suit of magically powered, environmentally sealed heavy armor. While you wear it: Composite Plating sets your AC to 16 if it was lower. Impulse Pack: as a bonus action take off, gaining a flight speed equal to your remaining movement until the end of your turn. You must start and end movement on the ground or you fall. Life Support Systems: it counts as a life suit. The frame is a magic item permanently attuned to you and does not count against your attunement limit. You can integrate another armor suit into it with 100 gp of materials and 24 hours, gaining that armor's AC and magical properties. Only one suit can be integrated at a time. A destroyed frame can be rebuilt with 10 days and 1,000 gp.",
  "Bug Hunter": "You gain proficiency in Perception and Survival if you lack them. You have Advantage on those checks when tracking or spotting aberrations or monstrosities.",
  "Squad Leader": "Choose one frame upgrade. Heavy Frame: adamantine composite, AC 19 if it was lower, and Advantage on Strength checks and saves while worn. Marauder Frame: when you take off in combat, double your flight speed until the end of the turn. After that you cannot fly with the frame until you move 0 ft on one of your turns. Opportunity attacks against you while flying have Disadvantage. Skirmish Frame: once per turn, a melee weapon hit deals extra 1d4 per 10 ft you moved on your turn, up to 6d4.",
  "Expert Marksman": "When you attack with a blaster, you score a critical hit on a roll of 19 or 20.",
  "Mobile Commander": "Choose one frame upgrade. Dragon Frame: pick Acid, Cold, Fire or Lightning. You have Resistance to that damage and your weapon attacks deal extra 1d6 of that type. Overshield: you have a pool of 30 temporary hit points. If you take no damage for 5 rounds, you regain 5 of them at the start of each of your turns. Wraith Frame: you can cast invisibility without a slot. If you end it by attacking, that attack deals extra 4d6."},
 "acts": {"Impulse Frame": "bonus"},
 "acb": {"l": 3, "v": 16, "s": "Impulse Frame composite plating (if higher)", "abs": []},
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Piloting"]}], [7, "Bug Hunter", {"skills": ["Perception", "Survival"]}]]},

"Drone Jockey": {"spab": "Intelligence",
 "f": {
  "Hivemaster": "You gain a tem drone controller and two drones, any two of: defense, medical, recon. One bonus action commands all drones. Your drones gain your level in extra HP. Their attack bonus equals your Proficiency Bonus + Intelligence modifier. Your medical drone heals 1d10 hit points. Your recon drone marks three creatures instead of one. You gain an extra drone at levels 6, 10 and 14 (up to 5). The controller commands only three drones at once, and only two of them may be the same type, but you can deploy a stored drone as an action if one is disabled. When you gain a gadgeteer level you can retrofit one drone into another type.",
  "Sacrificial Dive": "When a ranged attack targets you, use your reaction to have a drone within 5 ft fly into the way. The attack targets the drone instead.",
  "Focus Fire": "When you take the Attack action, you can command your drones without using a bonus action.",
  "Omega Drone": "As an action, combine a defense, a medical and a recon drone into one omega drone. Its AC is 10 + your Intelligence modifier, its HP is 5 times your level, and all its ability scores are 14. It can take all actions of its parts and acts right after you in initiative as your AI directs. Its integrated blaster deals 3d6 Radiant damage on a hit. Your controller cannot link other drones while it is active. You can split it back as an action."},
 "acts": {"Hivemaster": "bonus", "Sacrificial Dive": "reaction", "Omega Drone": "action"}},

"Futurist": {"spab": "Intelligence",
 "f": {
  "Advanced Subroutines": "Your AI runs one subroutine at a time. A bonus action switches it. Genetic Algorithm: when a hostile creature damages you, subtract 1 from the damage. Each further hit while it runs adds 1 to the reduction, up to your Intelligence modifier. It resets to 1 after 1 minute or on a switch. Heatmap: when you have Advantage on a weapon attack, add your Proficiency Bonus to the damage. Neural Network: when you miss with the Attack action against a hostile creature, you gain a cumulative +1 to later attack rolls, up to your Intelligence modifier. A creature you cannot see or cannot hit does not add to it. It resets to 0 after 1 minute or on a switch.",
  "Novel Intelligence": "Your AI Companion benefit also applies to another Intelligence skill of your choice. Your AI knows all languages and perfectly recalls all it has seen and heard in the last 30 days.",
  "Tactical Analysis": "As a bonus action, your AI evaluates your options. Until the start of your next turn you have Advantage on your next attack roll, and the next attack roll against you has Disadvantage. Short or Long Rest to use again.",
  "Recursive Deterrence": "When a creature within 15 ft makes a ranged weapon attack, you can use your reaction to make a ranged weapon attack against it.",
  "Singularity": "As a bonus action, let your AI override your movements for 1 minute. Whenever you make a ranged attack roll without Disadvantage, you can treat the result as equal to your gadgeteer level. Short or Long Rest to use again."},
 "acts": {"Advanced Subroutines": "bonus", "Tactical Analysis": "bonus", "Recursive Deterrence": "reaction", "Singularity": "bonus"},
 "lu": [{"feature": "Tactical Analysis", "lvl": 6, "max": 1, "reset": "short", "tag": "Advantage on your next attack"},
        {"feature": "Singularity", "lvl": 14, "max": 1, "reset": "short", "tag": "Ranged attack roll counts as your level"}]},

"Hardlight Architect": {"spab": "Intelligence",
 "f": {
  "Hardlight Projector": "You build a hardlight projector. If lost, you rebuild one over a Long Rest for 200 gp. As an action, create a simple geometric object of hardlight that fits in a 1-ft cube. It weighs 1 lb, lasts 1 minute, has AC 10 and 5 hit points. You can also cast the hardlight needle cantrip with it.",
  "Hardlight Spellcasting": "Your hardlight spells use your Gadget save DC, and your spell attack bonus is your Proficiency Bonus + Intelligence modifier. You can cast hardlight blaster and hardlight nails once each. From level 6 you can also cast hardlight construction and hardlight gauntlet once each. From level 14 you can cast hardlight frame once. Each returns on a Long Rest.",
  "Lightforge": "As a bonus action, forge a shield, a set of artisan tools or a melee weapon that deals Bludgeoning, Piercing or Slashing damage, all from hardlight. After 10 minutes it evaporates.",
  "Prototype Luxcannon": "You can cast hardlight blaster at will and apply your Overcharge feature to it.",
  "Transient Avatar": "As a bonus action, cast conjure hardlight avatar with no slot or components. Its duration is until the end of your next turn. Long Rest to use again."},
 "acts": {"Hardlight Projector": "action", "Lightforge": "bonus", "Transient Avatar": "bonus"},
 "lu": [{"feature": "Hardlight Spellcasting", "n": "Hardlight Blaster", "lvl": 3, "max": 1, "reset": "long", "tag": "Cast once"},
        {"feature": "Hardlight Spellcasting", "n": "Hardlight Nails", "lvl": 3, "max": 1, "reset": "long", "tag": "Cast once"},
        {"feature": "Hardlight Spellcasting", "n": "Hardlight Construction", "lvl": 6, "max": 1, "reset": "long", "tag": "Cast once"},
        {"feature": "Hardlight Spellcasting", "n": "Hardlight Gauntlet", "lvl": 6, "max": 1, "reset": "long", "tag": "Cast once"},
        {"feature": "Hardlight Spellcasting", "n": "Hardlight Frame", "lvl": 14, "max": 1, "reset": "long", "tag": "Cast once"},
        {"feature": "Transient Avatar", "lvl": 14, "max": 1, "reset": "long", "tag": "Conjure hardlight avatar free"}]},

"Mastermaker": {"spab": "",
 "f": {
  "Embedded Gadgets": "You can install one gadget or a one-handed blaster into an arm. You cannot be disarmed of it and can use it if one hand is free. Another creature can spot it only by inspecting the metal plates in your arm. You can change the embedded item after a Long Rest. You lose no hit points or Hit Dice installing or removing construct grafts, and need no recovery time after a new graft.",
  "Thermalsight": "A vect optical sensor replaces one eye. You see living creatures through darkness and heavy obscurement such as fog out to 30 ft, and can tell if a creature is alive or dead by its body heat. You cannot see color, illusions, invisibility or through magical darkness. One inch of solid barrier blocks it. If you already had thermalsight, its range increases by 30 ft.",
  "Carbon Fiber Skin": "Your Armor Class increases by 1.",
  "Reconfigure": "Choose one ability score. It increases by 2, to a maximum of 20. You can change the choice after a Long Rest. It cannot be Constitution.",
  "Construct Perfection": "You no longer need sleep and magic cannot put you to sleep. You are immune to Charmed, Frightened and possession. Your Intelligence maximum becomes 22."},
 "acb": {"l": 6, "v": 1, "s": "Carbon Fiber Skin", "abs": []},
 "fx": [[3, "Thermalsight", {"notes": [["Note", "Thermalsight: see living creatures 30 ft through darkness and fog, no color, blocked by 1 inch of solid barrier"]]}], [14, "Construct Perfection", {"notes": [["Note", "Construct Perfection: no sleep needed, immune to Charmed, Frightened and possession, Intelligence maximum 22"]]}]]},

"Nanoengineer": {"spab": "Intelligence",
 "f": {
  "Cutting-Edge Nanobots": "Your fabricator makes nanites. You have a pool of Nano points equal to your Intelligence modifier + half your gadgeteer level (rounded down), regained on a Long Rest. Deconstruct: as an action, fling nanites at a target within 15 ft. Spend any number of points. Make a ranged attack if the target is beyond your reach, or hit automatically within reach. It takes 1d6 Necrotic damage per point. Nano-Hack: when you make an Intelligence (Data) check to hack technology, spend up to 3 points to add 1d4 per point. Reconstruct: as an action, spend any number of points to heal a willing target within 15 ft for 1d6 hit points per point.",
  "Nano-Duplicate": "As a bonus action, duplicate the shape, but not color or texture, of an object you touch that fits in a 1-ft cube. The nanite replica lasts 10 minutes.",
  "Recycling Protocol": "When you reduce a hostile creature to 0 hit points with a melee weapon attack or Deconstruct, you regain 2 Nano points.",
  "Nanite Weave": "As an action, spend up to 3 Nano points to invest in a protective mesh. Up to 3 points can be invested. While you wield no shield, you gain a bonus to AC equal to the invested points. Each time you take damage, you lose 1 invested point.",
  "Network Response": "When you take damage, use your reaction to use Deconstruct on the attacker or Reconstruct on yourself, spending up to 3 Nano points."},
 "acts": {"Cutting-Edge Nanobots": "action", "Nano-Duplicate": "bonus", "Nanite Weave": "action", "Network Response": "reaction"}},
}
