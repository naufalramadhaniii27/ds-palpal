# Own-wording subclasses of Dark Matter, 2014 rules, batch A.
SUB = {
"Ionizer": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in the Technology skill.",
  "Formula: Plasma Bomb": "You can craft plasma bombs. Swap your bomb's explosive contents for an ion-fluxer. A plasma bomb deals Radiant damage instead of Fire. When it hits a creature, it sticks to it for good, then explodes at the end of that creature's next turn and deals its damage as normal.",
  "Heatsink": "Once per turn, as an action or bonus action, supercool a blaster you touch. The next time it would overheat within 1 minute, it cools down instead. If it is already overheated, it stops being overheated at once. You can do this a number of times equal to your Intelligence modifier (minimum 1) and regain all uses on a Long Rest.",
  "Electromagnetic Shield": "When a ranged weapon attack that deals Force, Lightning, Necrotic or Radiant damage hits you, use your reaction to roll a d6. On a 6, the attack misses you whatever its roll.",
  "Energetic Discharge": "You make a fist-sized discharge device that stores energy. Each time you use Electromagnetic Shield, whatever you roll, it gains 1 charge, up to 10. Charges last 24 hours. As a bonus action on your turn, spend any number of charges and make a ranged weapon attack against a target within 60 ft. On a hit it takes 1d8 Force or Radiant damage (your choice) per charge spent."},
 "acts": {"Electromagnetic Shield": "reaction", "Energetic Discharge": "bonus"},
 "lu": [{"feature": "Heatsink", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Supercool a blaster"}],
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Technology"]}]]},

"College of the Spheres": {"spab": "",
 "f": {
  "Astronomy Domine": "When you deal damage with a bard spell, you can change its damage type to Radiant. You can also spend one use of Bardic Inspiration and add that die to the spell's damage.",
  "Universal Music": "You have Advantage on Intelligence checks about advanced mathematics, geometry, kinematics, acoustics or ballistics.",
  "Stellar Chorus": "When you roll one of your Bardic Inspiration dice, you can roll it twice and take the result you prefer.",
  "Harmonic Convergence": "Once per turn, when a creature makes a saving throw against a spell you cast, you can spend one use of Bardic Inspiration, roll the die and subtract the result from the creature's save."}},

"Star Wolf Banner": {"spab": "",
 "f": {
  "Daring Deeds": "You learn the Covering Fire and Dodge Roll deeds of the gunslinger. They count as maneuvers for you and use battle dice instead of risk dice. If you already have the gunslinger's Risk feature, you can use battle dice for any of that class's deeds. Covering Fire: when you hit a creature with a ranged weapon attack, spend one die as a bonus action to cow it. Roll the die and subtract it from the next attack roll the creature makes before the start of your next turn. Dodge Roll: spend one die as a bonus action to move up to 15 ft and reload any firearm you hold. The move provokes no opportunity attacks, ignores difficult terrain and lets you pass through hostile creatures' spaces, but you cannot end there.",
  "Squadron Leader": "While you pilot a ship with friendly ships within 10,000 ft, you and those ships can fly in formation. When you take an action to move your ship or make evasive maneuvers, each other pilot can take the same action at the same time. Pilots in the formation have Advantage on initiative rolls, and each ship in it has +2 AC. A ship stays in formation while within 10,000 ft of you and takes only those same movement actions.",
  "Tactical Formation": "You can use the Blitz to direct up to 4 friendly creatures, including your cohort, within 60 ft that see or hear you. Each uses its reaction to move up to its speed, fall Prone or stand up. Those who can see you need not hear you.",
  "Leave No One Behind": "When your cohort or a friendly creature you see within 60 ft drops to 0 hit points and starts making death saves, use your reaction to spend a battle die. The creature instead drops to hit points equal to the roll. Until the end of its next turn it provokes no opportunity attacks and has Advantage on saving throws. Short or Long Rest to use again."},
 "acts": {"Daring Deeds": "bonus", "Leave No One Behind": "reaction"},
 "lu": [{"feature": "Leave No One Behind", "lvl": 17, "max": 1, "reset": "short", "tag": "Reaction: ally drops to a die roll in HP"}]},

"Order of Mawstone Psions": {"spab": "Intelligence",
 "f": {
  "Cantrips": "You learn three cantrips from this list: cheat, chill touch, eye of Anubis, eye of Ra, force dart, hardlight needle, light, message, minor illusion, prestidigitation, ray of frost, true strike. Intelligence is your spellcasting ability for them. You learn a fourth at level 8.",
  "Key Mawstone": "Your planar key is a smooth bone fragment from a maw. While you hold it you have these psionic abilities. Empathy: as an action, probe the surface emotions of a creature you see within 30 ft that has Intelligence 3 or higher. You learn its emotional state and, at the GM's discretion, one of its Bonds. Kinesis: as an action, invisibly move things within 30 ft. You can move objects under 10 lb, open an unlocked door or container, stow or fetch an item from an open container, or pour out a vial. You cannot attack or activate magic items with it.",
  "Bonus Focus": "You gain a Planar Focus option. The 'Verse: while you keep this focus, your melee weapon attacks score a critical hit on a roll of 19 or 20. As usual, if you crit with a spell during Spell Channeling, you roll both the spell's and the weapon's damage dice twice.",
  "Telekinetic": "You can cast telekinesis once without spending arcana points, and regain it on a Short or Long Rest. You can keep focus on this spell and a Planar Focus at the same time.",
  "Grandmaster Psion": "When you score a critical hit, you gain temporary hit points equal to your level for 1 hour, and regain 2 expended arcana points."},
 "acts": {"Key Mawstone": "action"},
 "lu": [{"feature": "Telekinetic", "lvl": 10, "max": 1, "reset": "short", "tag": "Cast telekinesis free"}]},

"Way of Gravity": {"spab": "",
 "f": {
  "Subjective Gravity": "On your turn, use half your movement to choose a solid surface within 30 ft, such as a wall or ceiling, as your ground. You are pulled to it as if by gravity. It follows smooth curves but stops at corners that turn 90 degrees or more. Only you and your worn or carried objects are affected.",
  "Negate Mass": "You can spend 2 ki to cast levitate.",
  "Distortion Field": "As a bonus action, spend 1 ki to create an invisible 10-ft-diameter sphere of gravitational distortion, centered on a point you see within 60 ft, for 1 minute. A creature entering it stops moving. At the start of each of its turns it can use half its movement and make a Strength save to escape to an adjacent unoccupied space of its choice. On a failure it cannot move. Projectiles passing through the field stop in midair.",
  "Singularity Strike": "When you hit a creature with two or more unarmed strikes on your turn, you form a gravitational field around it. Until the start of your next turn it cannot move willingly, unless it first takes the Disengage action and spends half its movement to escape."},
 "acts": {"Distortion Field": "bonus"}},

"Lawbringer": {"spab": "",
 "f": {
  "Astute": "You have Advantage on ability checks to tell whether a creature you see is telling the truth.",
  "Axiomatic Mark": "When a creature you have marked within 30 ft moves, use your reaction to move up to half your speed. You must end closer to the marked creature than you began.",
  "Mandate": "You can cast command once with no spell slot. It targets each creature you choose within 30 ft with the same command. The save DC is 8 + your Proficiency Bonus + your Constitution modifier. Short or Long Rest to use again.",
  "Clockwork Mind": "You have Advantage on saves against being Charmed or Frightened. When you succeed on a save against an enchantment spell or an ability that clouds thoughts or controls your mind, the caster takes 4d6 Psychic damage.",
  "Universal Axiom": "As an action, become a ticking construct of universal law for 1 minute. You cannot be Exhausted, Frightened, Grappled, Incapacitated, Paralyzed, Petrified, Poisoned, Prone, Restrained or Stunned. You have Advantage on all saving throws. You can use Mandate at will. Long Rest to use again."},
 "acts": {"Axiomatic Mark": "reaction", "Universal Axiom": "action"},
 "lu": [{"feature": "Mandate", "lvl": 6, "max": 1, "reset": "short", "tag": "Cast command on many targets"},
        {"feature": "Universal Axiom", "lvl": 20, "max": 1, "reset": "long", "tag": "1 minute of condition immunities"}]},

"Lunar Magic": {"spab": "",
 "f": {
  "Hex: Lunacy": "As an action, choose a creature you see within 60 ft. It makes a Charisma save. On a failure it suffers one randomly chosen long-term madness effect until the end of your next turn.",
  "Under Cover of Darkness": "In dim light or darkness, you can use your bonus action to take the Hide action.",
  "Everlasting Night": "As an action, for 10 minutes you reduce all light within 300 ft: direct sunlight becomes bright light, bright light becomes dim, dim light becomes darkness. Light sources stay visible and only their illumination drops. Short or Long Rest to use again.",
  "Moonsight": "You have truesight out to 60 ft, and you see a shimmering halo of moonlight around any creature you see that has the shapechanger subtype."},
 "acts": {"Hex: Lunacy": "action", "Under Cover of Darkness": "bonus", "Everlasting Night": "action"},
 "lu": [{"feature": "Everlasting Night", "lvl": 10, "max": 1, "reset": "short", "tag": "10 minutes of reduced light"}]},
}
