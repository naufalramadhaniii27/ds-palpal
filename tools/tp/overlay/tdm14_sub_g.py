# Own-wording subclasses of Dark Matter, 2014 rules, batch G.
SUB = {
"The Singularity": {"spab": "Charisma",
 "f": {
  "Hunger of the Void": "Added to your warlock spell list. Level 1: inflict wounds, silent image. Level 2: blindness/deafness, darkvision. Level 3: haste, slow. Level 4: intensify gravity, phantasmal killer. Level 5: geas, telekinesis. When an effect or attack deals damage that is not Bludgeoning, Piercing or Slashing, you can use your reaction to reduce it by your Charisma modifier. You then gain temporary hit points equal to your warlock level.",
  "Brink of the Void": "As an action, show others the truth of the Void. Each creature within 30 ft that sees you makes a Wisdom save or is Frightened of you for 1 minute. A Frightened creature that ends its turn without line of sight to you can repeat the save to end the effect. Short or Long Rest to use again.",
  "Accretion Disk": "When you use Hunger of the Void, you can ring yourself with swirling energy for a number of rounds equal to your Charisma modifier, or until you use this again or dismiss it on your turn (no action). A creature that starts its turn within 10 ft takes damage equal to your warlock level, of the type you avoided.",
  "Event Horizon": "As an action, summon a 20-ft-radius sphere of pure voidstuff centered on you. The first time a creature enters it on its turn, or starts its turn there, it makes a Strength save. On a failure it takes 7d6 Necrotic damage and is Restrained until the start of its next turn. On a success it takes half and treats the area as difficult terrain. You can concentrate on it as a spell for up to 1 minute. Long Rest to use again. You also have Advantage on checks to control a sphere of annihilation."},
 "acts": {"Hunger of the Void": "reaction", "Brink of the Void": "action", "Event Horizon": "action"},
 "lu": [{"feature": "Brink of the Void", "lvl": 6, "max": 1, "reset": "short", "tag": "Frighten creatures within 30 ft"},
        {"feature": "Event Horizon", "lvl": 14, "max": 1, "reset": "long", "tag": "20 ft voidstuff sphere"}]},

"The Star": {"spab": "Charisma",
 "f": {
  "Nova": "Added to your warlock spell list. Level 1: burning hands, color spray. Level 2: continual flame, scorching ray. Level 3: daylight, fireball. Level 4: fire shield, wall of fire. Level 5: dispel evil and good, flame strike. You also know the light and produce flame cantrips, which count as warlock spells and not against your cantrips known. As a bonus action, enter a Nova. When you enter it, and at the start of each of your turns while it lasts, you take Radiant Nova damage that cannot be reduced or avoided. It starts at 1d6 and grows by 1d6 each turn (2d6, 3d6 and so on). You make no concentration saves because of it. It ends if you drop to 0 hit points or end it with a bonus action. While it is active, when you damage a creature with an attack on your turn you can add bonus d6s, up to twice the number of Nova damage dice you took that turn. You can put all of them on one attack or split them among attacks.",
  "Solar Flare": "If you drop to 0 hit points while your Nova is active, you can instead drop to 1 hit point. Each hostile creature within 30 ft takes Radiant damage equal to your Charisma modifier + warlock level. Your Nova ends. Short or Long Rest to use again.",
  "Healing Rays": "When you start your turn in direct sunlight with your Nova inactive, you can use your action to regain 1d6 hit points. You can do this a number of times equal to your Charisma modifier, regained on a Short or Long Rest. The die is 1d10 from level 14.",
  "Supernova": "When you enter a Nova, you can make the Nova damage dice and the extra damage you deal to others d10s instead of d6s."},
 "acts": {"Nova": "bonus", "Healing Rays": "action"},
 "lu": [{"feature": "Solar Flare", "lvl": 6, "max": 1, "reset": "short", "tag": "Drop to 1 HP and burst Radiant"},
        {"feature": "Healing Rays", "lvl": 10, "max": "mod:CHA", "reset": "short", "tag": "Heal 1d6 in sunlight (1d10 at 14)"}]},

"Coalition Arcanist": {"spab": "Intelligence",
 "f": {
  "Coalition Blaster Gauntlet": "You gain a blaster gauntlet, a spell focus that lends blaster traits to your cantrips. If lost, you requisition a new one after a Long Rest. When you cast a warmage cantrip using the gauntlet as focus, you can use one of these tricks, and no other warmage trick on that cast. Automatic: for a cantrip with a spell attack roll that deals damage, make attacks equal to twice its damage dice, all at Disadvantage. Lower its damage die one step (d12 to d10, d10 to d8, down to d4 minimum). Each hit deals only one die. Nonlethal: when a warmage cantrip with a spell attack roll reduces a creature to 0 hit points, you can knock it unconscious instead. Scatter: when a warmage cantrip with a spell attack roll targets a creature within 15 ft, raise its damage die one step for that attack (d4 to d6 and so on, to d12 maximum).",
  "Tactical Uplink": "With a neural implant, you can use an action to learn the general layout of the land within 1 mile. It shows surface or obvious natural or artificial features only and detects no creatures. You also have a +5 bonus to your passive Wisdom (Perception).",
  "Requisition": "After a Long Rest, choose one item to be teleported to you from the Coalition armory: two attractor mines (using your spell save DC), a dome projector, a gravity nullifier, a jetpack, a ring of spacewalking (attuned to you automatically), or a universal translator. It returns after your next Long Rest.",
  "Squadsight": "While you are within 120 ft of an ally, you know the exact location of any creature the ally sees. You can target a creature your ally sees with a cantrip, as long as the ally does not see it behind cover. The cantrip is fired like a mortar, ricocheted off obstacles or sent through thin barriers.",
  "Orbital Bombardment": "You can cast orbital hardlight cannon without a spell slot or material components. Long Rest to use again."},
 "acts": {"Tactical Uplink": "action", "Orbital Bombardment": "action"},
 "lu": [{"feature": "Orbital Bombardment", "lvl": 18, "max": 1, "reset": "long", "tag": "Cast orbital hardlight cannon free"}],
 "fx": [[7, "Tactical Uplink", {"notes": [["Note", "Tactical Uplink: +5 to passive Wisdom (Perception)"]]}]]},

"House of Lancers": {"spab": "Intelligence",
 "f": {
  "Hand-to-Hand Arcana": "You can use Intelligence instead of Strength for the attack and damage rolls of your unarmed strikes. You can roll a d6 in place of their normal damage. They count as melee weapons for warmage spells. When you take the Attack action with an unarmed strike, you can make one unarmed strike as a bonus action.",
  "Intercept Technique": "While you wear no armor, your AC is 10 + Dexterity modifier + Intelligence modifier. Under mage armor, your AC is 13 + your choice of Dexterity or Intelligence modifier. You do not gain this benefit with a shield.",
  "Shock Trooper": "Whenever you make a melee attack on your turn against a creature you see, you can first lunge up to 15 ft toward it. This costs no movement and provokes no opportunity attacks. You can lunge through the air, and fall after the attack if nothing holds you up.",
  "Mystical Physicality": "On Strength, Dexterity or Constitution checks you can use your Intelligence modifier instead. Difficult terrain costs you no extra movement.",
  "Deflect Energy": "When a ranged spell attack or ranged weapon attack that deals Cold, Fire, Force, Lightning, Necrotic or Radiant damage hits you, use your reaction to reduce the damage by 1d10 + Intelligence modifier + half your warmage level (rounded down).",
  "Improved Shock Trooper": "Your Shock Trooper lunge becomes 30 ft, and you teleport through creatures and objects to the target. You cannot teleport into an occupied space.",
  "Flurry of Spells": "As an action, spend a use of Arcane Surge to cast three different cantrips with a casting time of 1 action or 1 bonus action. You cannot use Arcane Surge on those cantrips. Long Rest to use again."},
 "acts": {"Deflect Energy": "reaction", "Flurry of Spells": "action"},
 "lu": [{"feature": "Flurry of Spells", "lvl": 18, "max": 1, "reset": "long", "tag": "Cast three cantrips as one action"}],
 "acb": {"l": 3, "v": 10, "s": "Intercept Technique", "abs": ["DEX", "INT"]}},

"School of Automata": {"spab": "Intelligence",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in the Technology skill and with mechanist's tools.",
  "Engineering Savant": "When you prepare spells after a Long Rest, you use mechanist's tools and spend spell slots to raise mundane parts into constructs. A slot spent on a construct stays spent until the construct is disassembled (10 minutes) or drops to 0 hit points. Each construct needs a number of slot levels and a minimum wizard level: Defense Drone, Mechanical Spider, Medical Drone and Recon Drone cost 1 level at wizard level 2. Single Task Automaton costs 3 levels at wizard level 5. Multi-Task Automaton costs 7 levels at wizard level 11. You can spend more than one slot per construct, and can have up to 3 constructs. A Long Rest restores constructs to full hit points, and you always have enough scrap. Constructs act on your turn but take actions only on command. As a bonus action, you mentally command any construct within 60 ft. You choose its action and movement, and an attack command gives one attack. You can also give a general command such as guarding a corridor. A command that is too complex leaves it idle. It follows an order until done. You cannot summon or command other creatures while your constructs are active.",
  "Assault Programming": "Your constructs add your Intelligence modifier to attack and damage rolls.",
  "Construct Upgrade": "When you assemble a construct, apply one upgrade. It can have one at a time, and you can switch it when you repair it on a Long Rest. Alloy Chassis: AC +2. Energy Plating: Resistance to one damage type of your choice. High-Torque Motors: speed +10 ft.",
  "Perfected Core": "As an action, take direct control of one construct. You see through its senses and choose where it moves and what it does. If you order an attack, it can make multiple attacks if it has Multiattack."},
 "acts": {"Engineering Savant": "bonus", "Perfected Core": "action"},
 "fx": [[2, "Bonus Proficiencies", {"skills": ["Technology"]}]]},
}
