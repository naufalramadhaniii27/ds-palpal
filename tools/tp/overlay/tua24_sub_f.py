"""Unearthed Arcana 2026 Underdark Options 2 (2024 rules): Faerzress Sorcery, Freedom Domain. Own wording."""
SUB = {
"Faerzress Sorcery": {"spab": "CHA",
 "f": {
  "Faerzress Effects": "Faerzress is magical radiation. Within an area it fills: creatures automatically pass saves against Divination effects. Magical sensors and invisible eyes, such as from Clairvoyance or Arcane Eye, can't enter. A creature teleporting 1 mile or more can't teleport into or out of the area. The area is lit with Dim Light, and creatures using Darkvision there see in color and have Advantage on Wisdom (Perception) checks that rely on sight.",
  "Faerzress Side Effects": "Roll on or choose from the Faerzress Side Effects table to decide what odd effect the radiation you give off has on your surroundings.",
  "Faerzress Spells": "Spells always prepared from the listed Sorcerer levels: 3 Faerie Fire, Magic Weapon, Misty Step, Witch Bolt. 5 Nondetection, Sending. 7 Arcane Eye, Stone Shape. 9 Passwall, Scrying.",
  "Faerzress Zone": "Magic action, spend 3 Sorcery Points: fill an area within 120 feet, no larger than a 40-foot Cube, with faerzress for 24 hours. Filling the same area every day for 365 days makes it permanent.",
  "Immunity to Faerzress": "You ignore faerzress's harmful effects. Creatures in faerzress don't automatically pass saves against your Divination spells. Sensors and eyes from your spells can enter faerzress. When you teleport yourself or others, you can enter or leave faerzress at any distance.",
  "Faerzress Affinity": "You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). You see color in Darkness, and have Advantage on Wisdom (Perception) checks to see in Dim Light or Darkness. Your Immunity to Faerzress also covers allies within 30 feet of you.",
  "Faerzress Spell": "When creatures fail a save against a spell you cast, you can spend 1 Sorcery Point to lace one of them with faerzress for 1 minute. It can't teleport, can't cast Divination spells, and has Disadvantage on saves against Divination spells.",
  "Faerzress Step": "You always have Teleport prepared and can cast it once without a slot, regaining that after a Long Rest. When you roll on the Teleport table you can choose any outcome available for your familiarity.",
  "Faerzress Form": "When you use Innate Sorcery you can become pure faerzress energy for 1 minute, ending early if you choose (no action) or die. You keep your shape, personality, memories, and speech. Equipment doesn't transform, but you can still use it. You gain Immunity to Grappled, Paralyzed, Petrified, Poisoned, Prone, and Restrained. You resist every damage type except Force and Psychic. You gain a Fly Speed equal to your Speed and can hover. You can move through creatures and objects as Difficult Terrain, and take 1d10 Force damage if you end your turn inside an object. You can't use this again until a Long Rest, or until you spend 7 Sorcery Points (no action)."},
 "lu": [{"feature": "Faerzress Step", "n": "Teleport (no slot)", "lvl": 14, "max": 1, "reset": "long", "tag": "Level 7 spell"},
        {"feature": "Faerzress Form", "lvl": 18, "max": 1, "reset": "long", "tag": "Reset by 7 Sorcery Points"}],
 "fx": [[6, "Faerzress Affinity", {"res": ["Lightning"], "senses": [["Darkvision", 60, "adds 30 ft if you have it, see color in Darkness"]]}],
        [18, "Faerzress Form", {"notes": [["Note", "Faerzress Form (Innate Sorcery): Fly Speed equal to Speed, resist all damage but Force and Psychic, immune to several conditions, for 1 minute"]]}]],
 "acts": {"Faerzress Zone": "action"}},

"Freedom Domain": {"spab": "WIS",
 "f": {
  "Freedom Domain Spells": "Spells always prepared from the listed Cleric levels: 3 Expeditious Retreat, Jump, Knock, Misty Step. 5 Fly, Gaseous Form. 7 Dimension Door, Freedom of Movement. 9 Passwall, Tree Stride.",
  "Invoke Liberty": "Magic action, spend a Channel Divinity use while presenting your Holy Symbol: each ally in a 30-foot Emanation can end one condition on itself from Frightened, Grappled, Paralyzed, or Restrained, then use its Reaction to move up to its Speed without Opportunity Attacks. At Cleric level 9 the list also includes Charmed and Petrified.",
  "The Meaning of Freedom": "Roll on or choose from the Foremost Freedom table to decide what freedom means most to your character.",
  "Unencumbered Grace": "While wearing no armor, your base AC is 10 + your Dexterity modifier + your Wisdom modifier. You can use a Shield and keep this. You gain proficiency in Acrobatics, or Expertise in it if you already have proficiency.",
  "Unstoppable": "Difficult Terrain doesn't affect your movement. You gain proficiency in Dexterity saving throws, or in one saving throw you lack if you already have it.",
  "Avatar of Freedom": "Bonus Action: manifest a 30-foot Emanation around you for 10 minutes, ending early if you dismiss it (no action) or are Incapacitated. When an ally first enters it on a turn or starts its turn there, its Speed rises by 30 feet until the end of its next turn. Allies in it ignore Difficult Terrain and have Advantage on Dexterity checks. You can't use this again until a Short or Long Rest."},
 "lu": [{"feature": "Avatar of Freedom", "lvl": 17, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "fx": [[3, "Unencumbered Grace", {"skills": ["Acrobatics"], "notes": [["Armor", "Unencumbered Grace: with no armor, base AC 10 + Dexterity modifier + Wisdom modifier (Shield allowed). Acrobatics proficiency, or Expertise if already proficient"]]}],
        [6, "Unstoppable", {"notes": [["Note", "Unstoppable: ignore Difficult Terrain. Dexterity saving throw proficiency, or another save if you have it"]]}]],
 "acts": {"Invoke Liberty": "action", "Avatar of Freedom": "bonus"}},
}
