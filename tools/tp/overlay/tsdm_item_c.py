# Own-wording items of Dark Matter (2024), chunk c: Nanobot Canister (Transformative) to Zipgun. Row shape as tghp_item.py.
# Weapons (Rebounding Blade, Thunder Rifle, W-REC, Zipgun) point at their base blaster or sword from the source baseitems.
# Mundane gear, packs and ship systems are GEAR rows: name, cost gp, weight lb, type, text.
ITEMS = []; SP = {}; WPN = {}; GEAR = []
def add(name, typ, rar, att, text, **o):
    ITEMS.append((name, typ, rar, att, text, o))

SPRAY = "A 20 lb canister of pressurized nanites. Use a Magic action from inside or outside a damaged ship and the ship regains %s Mega Hit Points."

add("Nanobot Canister (Transformative)", "Wondrous Item", "Rare", 0,
    "A capsule of short-lived nanobots. A DC 15 Intelligence (Technology) check tells which of the three kinds it holds. Use a Magic action to throw it at a creature, an object or an empty space within 30 ft (an empty space gets a 5-ft square of nanobots).\n**Transformative.** The nanobots form a Nanite Swarm at the impact point. It is friendly to you and your allies, understands your languages and obeys your spoken commands. With no command it takes the Dodge action and moves away from danger. After 8 hours, or when it drops to 0 Hit Points, the nanites deactivate.")
add("Overdrive Module", "Wondrous Item", "Rare", 0,
    "Graft (Internal slot). An internal generator that speeds up your reactions. Use a Bonus Action to start it for 1 minute. When you start it and as a Bonus Action on each later turn, you have Advantage on the next attack roll or ability check you make before your turn ends. You can also use your Reaction to gain Advantage on a Dexterity save or to impose Disadvantage on an attack against you from a creature you can see. Once used, it cannot be started again until you finish a Long Rest.")
add("Personality Module", "Wondrous Item", "Uncommon", 0,
    "Graft (Head slot). A neural trace of a whole personality. While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. Each module is modeled on a different person and gives its own skills, languages and trait.")
add("Phase Suit", "Armor", "Rare", 1,
    "A skin-tight suit that shifts you out of phase with the Material Plane (made from Light armor). While attuned, you can move through solid objects and occupied spaces as if they were Difficult Terrain. If you end your turn in such a space, you are shunted to the last unoccupied space you were in.")
add("Potion of Liquid Air", "Potion", "Common", 0,
    "For 8 hours after you drink it, you can breathe underwater and in the vacuum of space. It also protects you from extreme temperatures and pressures.")
add("Potion of Solar Radiance", "Potion", "Uncommon", 0,
    "An opaque silver liquid that glows when shaken. For 1 hour your body sheds sunlight, Bright Light in a 20-ft radius and Dim Light for 20 ft beyond. Until it ends, you can use a Bonus Action on your turn to deal 1d8 Radiant damage to each creature in the Bright Light.")
add("Psionic Piercing", "Wondrous Item", "Uncommon", 1,
    "An exotic crystal piercing (ring, stud, bar or any form, worn anywhere). All your Psionic Piercings count as one attuned item, up to 7 of them. Each one you are attuned to gives you 1 psionic energy point to spend on the properties below. Change your picks daily at dawn. For spells from it, choose Intelligence, Wisdom or Charisma as the spellcasting ability.\n**Empathy (1).** Magic action: read the emotional state of a creature you see within 30 ft.\n**Fly (5).** Fly Speed equal to your Speed.\n**Influence (2).** Cast Detect Thoughts and Suggestion once each. Each is then unavailable until the next dawn.\n**Minor Kinesis (1).** Learn Mage Hand. Its hand is invisible.\n**Prescience (2).** Bonus Action: the GM reveals something likely to happen in the next minute, and you have Advantage on D20 Tests about it. Uses equal the number of piercings you are attuned to, all regained at dawn.\n**Psiblast (5).** A 60-ft Cone. Each creature makes an Intelligence save (DC 8 + Proficiency Bonus + your Intelligence, Wisdom or Charisma modifier, your choice). Fail: 6d8 Psychic damage and Stunned for 1 minute. Success: half damage. A Stunned creature repeats the save at the end of each of its turns. Once used, not again until the next dawn.\n**Psychic Resistance (1).** Resistance to Psychic damage.\n**Telepathy (1).** Speak telepathically to a creature you see within 60 ft. It understands only if it knows the language and cannot answer this way.\n**Telekinesis (3).** Cast Telekinesis once without a slot, regained at dawn.\n**Third Eye (3).** Blindsight with a range of 20 ft.")
add("Rebounding Blade", "Weapon", "Rare", 1,
    "A Laser Sword with a +2 bonus to attack and damage rolls. It has the Thrown property (range 40/120). Right after any thrown attack, the weapon flies back to your hand.",
    fx={"atk": 2, "dmg": 2}, base=["Laser Sword"])
add("Remote Eye", "Wondrous Item", "Uncommon", 0,
    "Graft (Head slot). A spherical mechanical eye replaces one of yours. Remove or insert it as a Bonus Action. While it is out, you still see what it sees as long as you are within 120 ft of it. It looks in every direction but cannot move by itself.")
add("Remote Piloting Apparatus", "Wondrous Item", "Rare", 0,
    "A set of linked devices that takes 1 hour to install in a Fighter-sized ship. The fighter can then be deployed and flown remotely from the included controller, which relays sight and sensor data and lets a character in the Dogfighter role use it. If the ship goes more than 10 miles from the controller, it loses the link and goes dormant until the controller is back in signal range.")
add("Replacement", "Wondrous Item", "Common", 0,
    "Graft (Any slot). An organ or limb swapped for an efficient mechanical one. It can replace a missing limb or organ but cannot revive a dead creature. A replacement limb can look natural or openly metallic. It uses the body slot it fits (a robotic hand takes Arms, a kidney takes Internal). You can have several Replacements in one slot.")
add("Resistance Plating", "Wondrous Item", "Rare", 0,
    "Graft (External slot). A subdermal layer that redirects one kind of elemental energy. While installed you have Resistance to one damage type, picked by the GM or rolled on 1d6: 1 Acid, 2 Cold, 3 Fire, 4 Lightning, 5 Poison, 6 Thunder.")
add("Ring of Paradoxes", "Ring", "Legendary", 0,
    "Use a Magic action to spend 1 of its 3 charges and cast Paradox from it. The ring becomes nonmagical when the last charge is spent.", ch=[3, "0", "never"])
SP["Ring of Paradoxes"] = {"sp": [["Paradox", 1]]}
add("Ring of Spacewalking", "Ring", "Uncommon", 1,
    "While attuned, you can breathe underwater and in the vacuum of space, and you are protected from extreme temperatures and pressures. In zero gravity you have a Fly Speed equal to your Speed.")
add("Scout Scanner", "Wondrous Item", "Rare", 1,
    "A device worn over one eye with 3 charges, all regained at dawn. As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it.",
    ch=[3, "3", "dawn"])
add("Shield Emitter", "Wondrous Item", "Uncommon", 1,
    "A device that wraps you in a shimmering force field. Activate it as a Bonus Action. The next attack against you within the next hour has a -10 penalty to hit. Then it must recharge and cannot be used again until the next dawn.")
add("Shield Module", "Wondrous Item", "Uncommon", 0,
    "Graft (Internal slot). Cast Shield once with it without a spell slot. Once used, it cannot be used again until you finish a Long Rest.")
add("Shipmending Spray", "Wondrous Item", "Common", 0, SPRAY % "3d6")
add("Shipmending Sprays", "Wondrous Item", "Common", 0,
    "A 20 lb canister of pressurized nanites. Use a Magic action from inside or outside a damaged ship and the ship regains Mega Hit Points by rarity: Common 3d6, Greater (Uncommon) 6d6, Superior (Rare) 12d6, Supreme (Very Rare) 18d6.")
add("Superior Shipmending Spray", "Wondrous Item", "Rare", 0, SPRAY % "12d6")
add("Supreme Shipmending Spray", "Wondrous Item", "Very Rare", 0, SPRAY % "18d6")
add("Shock Absorbers", "Wondrous Item", "Uncommon", 0,
    "Graft (Legs slot). Coiled absorbers let you bound higher. Your Long Jump and High Jump distance grows by 10 ft (the extra distance costs movement as normal), and standing jumps carry no penalty. When you fall, use your Reaction to cut the damage by five times your Proficiency Bonus.")
add("Shoulder Cannon", "Wondrous Item", "Rare", 1,
    "Worn on the back. Speak the command word as a Magic action and a cannon rises above your left shoulder for 1 minute. At the start of each of your turns (no action needed) it attacks the nearest enemy it sees within 60 ft, with a +9 attack bonus, dealing 3d8 Force damage on a hit. It has Darkvision and Thermalsight out to 120 ft and sees Invisible creatures. If you are Incapacitated or die, it stays active until the duration ends. Once activated, it cannot be activated again until the next dawn.")
add("Singularity Emitter", "Wondrous Item", "Rare", 0,
    "A stripped-down Dark Matter engine that launches miniature black holes. It has 5 charges and regains 1d4 + 1 at dawn. While holding it, use a Magic action and spend 1 or more charges to cast Gravity Well from it (save DC 15). One charge casts it at level 3, and each extra charge raises the slot level by 1.",
    ch=[5, "1d4+1", "dawn"])
SP["Singularity Emitter"] = {"sp": [["Gravity Well", 1]]}
add("Skeleton Keycard", "Wondrous Item", "Very Rare", 0,
    "A black keycard marked with a white skull. As a Magic action, use it on any door that could be hacked (a ship door, for example), even without a card reader. The door unlocks and opens as if hit by Knock.")
add("Solar Wings of Ra", "Wondrous Item", "Rare", 1,
    "A cloak. While you wear it in Bright Light, use a Magic action and speak its command word to turn it into radiant wings until you dismiss them (no action). You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light.\n**Magic Item Set.** Attuning to these wings, an Ankh of Ra and a Heretical Sunstaff of Ra counts as one attunement. While attuned to the wings and one of those items, you can cast Daylight at will with the wings.")
add("Sorting Beast", "Wondrous Item", "Uncommon", 0,
    "A six-legged machine with eyes, legs and antennae at both ends and measuring tools in the middle. It handles objects up to 30 lb. As a Magic action it collects and sorts all loose valuables within 100 ft, stacking coins in tens and appraising goods like gems by weight and quality, then prints the results on a paper strip. It works until done or switched off (no action). It can also cast Identify with no material components on an object you name, then cannot do so again until the next dawn.")
add("Spacewalkers", "Wondrous Item", "Uncommon", 0,
    "Graft (Legs slot). Creates a zone of breathable air, so you can breathe underwater and in the vacuum of space. It also protects you from extreme temperatures and pressures. In zero gravity you have a Fly Speed equal to your Speed.")
add("Spider Pod", "Wondrous Item", "Common", 0,
    "Throw this metal container as a Magic action and it unfolds into a Mechanical Spider. The spider acts on its own but always obeys you. In combat it takes its turn right before or after yours each round (your choice). If it drops to 0 Hit Points it cannot be repaired. A Magic action folds it back into the pod. You can control at most 3 spiders at once.")
add("Spiked Skin", "Wondrous Item", "Uncommon", 0,
    "Graft (External slot). A mechanical skin hiding thousands of razor spikes. When a creature you see within 5 ft hits you with a melee attack, use your Reaction to deal 1d4 Piercing damage to it. The damage becomes 2d4 at level 5, 3d4 at level 11 and 4d4 at level 17.")
add("Tachyon Missile Launcher", "Wondrous Item", "Rare", 0,
    "A shoulder cannon firing heat-seeking missiles built to pierce ship hulls. As a Magic action, lock onto a ship or Mega-sized creature you see within 2,000 ft. The lock breaks if the target moves more than 2,000 ft away or takes Evasive Maneuvers. On a later turn, use a Magic action to fire: make a ranged spell attack with a +9 bonus. On a hit the target takes 3d10 Mega Necrotic damage.")
add("Terraforming Engine", "Wondrous Item", "Legendary", 0,
    "A 40-ft-tall machine with great smokestacks that remakes materials and balances an atmosphere. It takes 1 hour of work to turn on or off. Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). If it is stopped or removed, the planet returns to its old state over 7 days.")
add("Thermalsight Eyes", "Wondrous Item", "Uncommon", 0,
    "Graft (Head slot). Heat-sensing augments in your eyes give you Thermalsight with a range of 30 ft.")
add("Thunder Rifle", "Weapon", "Rare", 0,
    "A Concussion Rifle with a +2 bonus to attack and damage rolls. When it hits a target, it makes an explosion in a 5-ft Emanation around that target. You can also aim it at an empty space within range. Each creature in the area makes a DC 15 Dexterity save, taking half the Thunder damage rolled on a failure and none on a success.",
    fx={"atk": 2, "dmg": 2}, base=["Concussion Rifle"])
add("Titan Armor", "Wondrous Item", "Rare", 0,
    "Graft (External slot). Plating built into your body like a suit of armor. Your base AC is 17 and your Dexterity modifier does not affect it. You can wear armor over it and use either armor for your AC. You can still use a Shield and gain this benefit.")
add("Traction Spikes", "Wondrous Item", "Common", 0,
    "Graft (Legs slot). Retractable spikes in your legs let you ignore Difficult Terrain and give you Advantage on saves to avoid the Prone condition.")
add("Un's Codex", "Wondrous Item", "Artifact", 1,
    "A 6-inch mechanical disc of countless layered parts, an intricate puzzle made of the exotic metal found in Maw stations and the Sepulcher Star. Its making is credited to Old Un.\n**Solving the Codex.** Until solved, attuning gives no benefits. Spend 8 hours attuned to solve part of it and unlock one property of your choice. Unlocks apply only to you.\n**Blink Step.** Cast Misty Step without a slot. You may teleport into a creature's space. That creature makes a DC 17 Dexterity save. Fail: 4d6 Force damage and it is pushed to the nearest free space. Success: half damage and you move to the nearest free space instead.\n**Extradimensional Lodge.** You and up to six willing creatures within 30 ft are moved to a demiplane holding a large, comfortable lodge in a coniferous forest. Leaving the lodge returns you to where you entered. It has many floors, hidden compartments, secret passages, old nonmagical gear from past owners, and dozens of near-transparent servants who obey all who enter. They do any ordinary servant task but cannot attack, harm anyone or leave the lodge.\n**Magic Resistance.** Advantage on saves against spells and other magical effects.\n**Slip Gate.** 4 charges, 1 regained at dawn. As a Magic action, create two 10-ft circular portals at places you know (or a general place such as a named Maw) on the same plane. They float just above the ground, filled with sight-blocking mist. Anything entering the front of one exits the other. They last 1 minute or until you dismiss them on your turn (no action).\n**Universal Function.** Magic action: rewrite a law of the universe in a 15-ft Emanation from you for 1 minute or until you use this again. You can raise or lower gravity, change a material's boiling or melting point, speed or slow time in the area (Haste or Slow for all creatures inside), make the area breathable (as Zone of Atmosphere), or change another law at the GM's discretion. If the change is too fundamental, such as reversing time, nothing happens and the action is wasted.\n**Destroying the Codex.** It cannot be damaged. Only Old Un can destroy it, but throwing it into the Sepulcher Star or any black hole banishes it for 1d100 years, after which it reappears somewhere in the 'Verse.",
    ch=[4, "1", "dawn"])
add("Universal Translator", "Wondrous Item", "Uncommon", 0,
    "A handheld device for long voyages. While holding it, you understand any spoken language you hear. When you speak or sign, any creature that knows at least one language and can hear or see you understands you.")
add("Vari-Blaster", "Weapon", "Rare", 0,
    "Any Blaster can be made a Vari-Blaster. It holds five power cells in a rotating set. As a Bonus Action, switch its damage type to Cold, Fire, Lightning, Necrotic or Radiant. It deals an extra 1d6 damage of the chosen type to any target it hits.")
add("Voice Changer", "Wondrous Item", "Common", 0,
    "Graft (Head slot). An electronic modulator replaces your vocal cords. You can change pitch, tone and character of your voice at will, flawlessly copy any voice or sound you have heard, and add synthetic effects such as reverb.")
add("Void Beacon", "Wondrous Item", "Uncommon", 0,
    "A beacon that sends an ultra-high-frequency signal through the Void, detectable tens of thousands of light-years away. The signal holds its current coordinates and a message of up to 16 characters (spaces count). Change the message as a Magic action. Once active, it repeats the signal for 7 days and then burns out for good.")
add("W-REC", "Weapon", "Rare", 1,
    "A REC Gun loaded with dozens of absurd and unneeded modifications. It has a +2 bonus to attack and damage rolls. It gains the Automatic mastery in addition to Mounted. If you are proficient with it, you can use both mastery properties even without the Weapon Mastery feature, and it does not count against your number of weapons. Once on each of your turns, if you attack a target with it and hit two or more times, you can attack the same target again. That attack has Disadvantage no matter what. If it hits, attack again, and so on, to a total of five attacks against the target or until you miss.",
    fx={"atk": 2, "dmg": 2}, base=["REC Gun"])
add("Weapon Wheel", "Wondrous Item", "Uncommon", 0,
    "A bracer with a rotary dial and buttons, linked to nine tiny extradimensional spaces. While wearing it, use a Magic action to store a weapon or object you hold (up to 100 lb and small enough for a 10-ft cube) in one space and link it to the wheel. It links up to 9 items. A Magic action unlinks one. Once on each of your turns (no action), teleport one linked item to your hand. Any other linked items go back to their spaces.")
add("Zipgun", "Weapon", "Uncommon", 0,
    "An Antimatter Pistol built to fire only once, at far above normal power. On a hit it deals 6d6 Necrotic damage. After firing, it smolders, stops being magical and becomes unusable.",
    base=["Antimatter Pistol"])

GEAR += [
 ["Omnitool", 10, 1, "Adventuring Gear", "A multipurpose gadget packed with small knives, a small hammer, screwdrivers, a file, a bottle opener, a small saw, a wrench, a can opener, a wire-cutter and pliers."],
 ["Quadcorder", 75, 1, "Adventuring Gear", "A handheld scanner with four small radar-dish sensors. Aim it at an object within 5 ft as a Utilize action to read its temperature, density, boiling point, freezing point, conductivity and viscosity."],
 ["Researcher's Pack", 377, 35, "Adventuring Gear", "Holds a Backpack, Binoculars, a Comm Set, a Datapad, a Flashlight, a Holo-Sphere, a Hypodermic Needle, a Life Suit, a Log Keeper, an Omnitool, a Quadcorder and a Wristwatch."],
 ["Roach", 100, 0, "Adventuring Gear", "A ten-legged insectoid (Ocoulori Radavitis). Eating one brings a rush of euphoria that lets you see the whole universe at once and improves the result of a void jump. Long-term use is addictive and psychologically harmful."],
 ["Sling", 0.5, 0, "Adventuring Gear", "A strap worn on the body and attached to a weapon, usually a blaster. A weapon you drop while it is slung falls to your side and stays within reach."],
 ["Spacer's Pack", 241, 29, "Adventuring Gear", "Holds a Backpack, a Bandolier, a Comm Set, a Datapad, 2 Flashlights, a Holo-Sphere, an Interface Rig, 2 cans of Krash, a Life Suit, a Log Keeper, an Igniter, an Omnitool, a Quadcorder, 10 rolls of Vent Tape and a Wristwatch."],
 ["Surveyor's Pack", 237, 66, "Adventuring Gear", "Holds a Backpack, a Bandolier, a Bedroll, Binoculars, a Comm Set, a Flashlight, a Log Keeper, an Igniter, a Life Suit, a Quadcorder, 10 days of Rations, Rope and a Wristwatch."],
 ["Tactical Vest", 15, 6, "Adventuring Gear", "A light vest covered in pouches, straps and holsters, worn over armor. It carries one Melee weapon with the Two-Handed or Versatile property on the back and a Dagger or Antimatter Dagger on the front. It has two Holsters and one built-in Sling."],
 ["Vent Tape", 0.1, 0.5, "Adventuring Gear", "Durable adhesive tape, 60 ft of 2-inch-wide tape per roll. Used for quick repairs, or to fix a Flashlight to a blaster in a pinch."],
 ["Wristwatch", 5, 0, "Adventuring Gear", "A simple watch that tells time in a way all major galactic factions accept."],
 ["Pilot's Seat", 400, 0, "Ship System", "Adds the Pilot role to the ship. Repeatable: a Personal-size or larger ship can hold two. If more than one creature is in the Pilot role, they must take different actions each combat round."],
 ["Probe", 450, 0, "Ship System", "A remotely piloted drone launched from the ship to inspect hazardous targets and places. The Engineer uses the Use System action to launch, dock or control it. It has 5 Mega Hit Points, AC 12, Speed 1,500 ft and 360-degree Maneuverability. The Engineer sees and hears through it and reads data such as temperature, gravity and radiation."],
 ["Sensors", 400, 0, "Ship System", "Lets the ship perceive ships and obstacles and talk with other ships (audio, video, holo) out to 1,000 miles. With Sensors disabled, the ship has Disadvantage on attack rolls.\n**Deep Scan.** The Engineer uses Use System on an object of interest within 1 mile and makes an Intelligence (Investigation) check. On a success, they learn of lifesigns inside, whether it has working power, and other details the GM picks.\n**Planetary Scan.** The Engineer uses Use System on a planet within 1,000 miles and makes an Intelligence (Investigation) check. On a success, they learn of major environmental hazards, whether the surface is inhabited, and other details the GM picks."],
 ["Shield Generator", 500, 0, "Ship System", "Projects a directional shield around the ship, forward-facing by default. The Engineer can reposition it as a Bonus Action. If it is disabled, the ship loses all Shield Points until repaired. Shield Points depend on ship size (Shield Points table)."],
 ["Signal Jammer", 2500, 0, "Ship System", "The Engineer uses Use System to jam the Sensors of a ship within 3,000 ft. That ship makes a Wisdom save (DC 8 + the Engineer's Intelligence modifier + Proficiency Bonus). On a failure its Sensors are disabled until the start of the Engineer's next turn, and it has Disadvantage on attack rolls for that time."],
 ["Teleporters", 2000, 0, "Ship System", "Powers a permanent set of Teleportation Circles for short-range transport. The Engineer uses Use System to open a temporary destination circle at an unmoving location within 100 miles. It lasts 1 minute or until another is made. A working Dark Matter engine disrupts the magic, so you cannot make a destination circle inside a ship with a running engine unless both ships agree to allow it.\n**Repeatable.** A Frigate-size or larger ship can install this twice. The second set is always active and speeds travel around the ship."],
 ["Tractor Beam", 1000, 0, "Ship System", "Pulls ships and objects toward your ship. The Engineer uses Use System on a Mega-sized ship, object or creature within 3,000 ft. A Mega creature or ship makes a Dexterity save (DC 8 + the Engineer's Strength or Intelligence modifier + Proficiency Bonus), and anything larger than your ship passes automatically. On a failure the target is caught and pulled up to 1,000 ft closer, with Speed 0. At the start of each of the Engineer's turns, a Utilize action pulls it up to 1,000 ft closer. The target repeats the save at the end of each of its turns and escapes on a success."],
]
