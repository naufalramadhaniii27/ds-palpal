# Own-wording subclasses of Dark Matter, 2014 rules, batch D.
SUB = {
"Laserist": {"spab": "",
 "f": {
  "Beam Shot": "Once per turn, when you make an attack roll with a firearm that has the Blaster property, you can spend a risk die to fire a penetrating laser. It strikes a line 5 ft wide out to the blaster's normal range. Targets beyond that range are automatically missed. Roll a separate attack for each target in the line and add the risk die to one damage roll.",
  "Multi-Configure Blaster": "You can merge two Blaster weapons into one chassis. You keep one merged blaster at a time and can change the pair after a Long Rest. Each time you fire it, choose which of the two it acts as.",
  "Deflection Shield": "You wear an electromagnetic device that scatters blaster shots. When you take Lightning, Necrotic, Radiant or Thunder damage, you can use your reaction and spend a risk die to gain Resistance to that damage.",
  "Tri-Laser": "As an action, fire a tri-laser, a 2-ft sphere of energy. It drifts 15 ft when fired and another 15 ft at the start of each of your turns. It deals 4d10 Radiant damage to anything it touches and disintegrates nonmagical objects it reduces to 0 hit points. It ends when it meets an obstruction it does not destroy."},
 "acts": {"Deflection Shield": "reaction", "Tri-Laser": "action"}},

"Space Cowboy": {"spab": "",
 "f": {
  "Hot Shot": "When you take the Attack action with a blaster that lacks the Overheat property, you can use a bonus action to overcharge it. Each time you hit with it during that action, you can deal an extra die of damage. Afterward the weapon is overheated and cannot fire until the end of your next turn.",
  "Gun with a Name": "By spending a Short Rest on a blaster, you modify it. Its normal and long ranges double, it works in bad weather and underwater, and it can serve as a melee weapon with the statistics of a mace. Only one blaster can be modified this way, and only you use it proficiently.",
  "Final Frontier": "You have Advantage on saves against effects from aberrations, monstrosities and oozes, and on Charisma checks to interact with aberrations.",
  "Zero-G Gunfighter": "You gain a jetpack magic item, usable without limit each day while you wear no medium or heavy armor. You count as having half cover while airborne or in zero gravity."},
 "acts": {"Hot Shot": "bonus"}},

"Cyberghoul": {"spab": "Intelligence",
 "f": {
  "Charnel Blaster": "Your Charnel Touch damages Constructs. When you use Charnel Touch and spend 5 or more points, you can instead make a ranged spell attack against a target you see within 30 ft, dealing Necrotic damage as normal on a hit.",
  "Construct Corpses": "When you perform Animate Thralls after a Long Rest, you can animate any thralls as Constructs. A construct thrall is a Construct, but counts as Undead for your necromancer features. Critical hits against it become normal hits. It gains thermalsight to 60 ft.",
  "Cyber Spells": "You learn extra spells that count as necromancer spells for you but not against your spells known. Level 1: flawed reconstruction, technical difficulties. Level 2: circuit breaker, perception hack. Level 3: greater mending, lightning bolt. Level 4: intensify gravity, logic bomb. Level 5: simulation, wall of force. You also learn the technomancy cantrip, which does not count against your cantrips known.",
  "Ghost in the Machine": "As a bonus action, infect a piece of magical technology you see within 120 ft with a digital daemon. It stays until removed by antivirus or remove curse, or until you infect another device. While infected, and while you share a plane with it, you can use a bonus action to do one of these. Make the device malfunction and become unusable until you restore it. Hack it, with Advantage on Intelligence (Data) checks and no interface rig needed. Operate it remotely within its normal parameters, with unauthorized operations only after hacking it. Or give the daemon a circumstance and a response so it acts alone. It remembers up to eight such pairs.",
  "Digital Death": "When one of your thralls dies, you can cast animate dead as a reaction. You still cannot reanimate Undead reduced to 0 hit points.",
  "Cyber Lich": "You become a lich in digital form. Phylactery Device: a computing device such as an arcane terminal holds your soul. Uploading to a connected terminal, ship computer or datapad takes 10 minutes. A device you left loses a phylactery's invulnerability. When you drop to 0 hit points, you regenerate in hardlight form within 5 ft of your phylactery. Hardlight Form: you act through a hardlight avatar and are immune to Radiant damage. Infect Construct: as an action you turn immaterial and target a Large or smaller Construct you see within 10 ft. It makes a Charisma save against your spell save DC. A Construct with CR above 10 automatically succeeds. On a failure you control it, keeping your Intelligence, Wisdom, Charisma and alignment and using its other statistics, with no access to its class features or proficiencies. It ends when the Construct drops to 0 hit points, when you end it as a bonus action, or when an effect like antivirus forces you out. You reappear within 5 ft of it. Inhabit Technology: as an action, enter magical technology you see within 5 ft. While inside you cannot be targeted, and you can use any function of the device without hacking. As a bonus action you can move to a connected device or leave. It ends if the device is destroyed or you are forced out."},
 "acts": {"Ghost in the Machine": "bonus", "Digital Death": "reaction"}},
}
