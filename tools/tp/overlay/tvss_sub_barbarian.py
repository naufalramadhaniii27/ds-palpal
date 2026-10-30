# Own-wording Barbarian paths of Valda's Spire of Secrets (2024). Rage Damage = the Rage Damage column of the Barbarian table.
SUB = {
"Path of the Abomination": {"spab": "STR",
 "f": {
  "Abominable Transformation": "When you Rage you become a monster. Your size becomes Large if smaller. Your Strength and Dexterity rise by your Rage Damage bonus (maximum 29) while Raging. You grow natural weapons. A hit with your Unarmed Strike can deal 1d8 plus Strength modifier instead of normal damage, of Bludgeoning, Piercing or Slashing type to suit the weapon. A table of 6 forms is in the book.",
  "Bloodcurdling Howl": "When you Rage, creatures of your choice that see or hear you in a 10-ft Emanation make a Wisdom save (DC 8 + Strength modifier + Proficiency Bonus) or are Frightened for 1 minute. They repeat the save at each turn end. Short or Long Rest to use again.",
  "Monstrous Brutality": "While Raging, your Brutal Strike options improve. Forceful Blow pushes 30 ft. Hamstring Blow cuts Speed by 30 ft. Staggering Blow gives Disadvantage on the target's next save and next attack before your next turn. Sundering Blow raises the next attacker's bonus to +10. Improved Brutal Strike options also improve at level 13.",
  "Ravage": "Bonus Action when you hit one target with two or more attacks on a turn: make Unarmed Strikes against it. Each hit grants another attack, to a total of three extra. Long Rest to use again, or spend a Rage use (no action)."},
 "lu": [{"feature": "Bloodcurdling Howl", "lvl": 6, "max": 1, "reset": "short", "tag": "On Rage"}, {"feature": "Ravage", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Ravage": "bonus"}},

"Path of the Battlemind": {"spab": "INT",
 "f": {
  "Psionic Power": "You have Psionic Energy Dice (d6 x2 at level 3, d8 x4 at 5, x6 at 9, d10 x8 at 11, x10 at 13, d12 x12 at 17). Regain one on a Short Rest and all on a Long Rest. Concussive Blast: once per turn right after hitting with a melee weapon or Unarmed Strike, spend a die to deal Force damage equal to the roll to every other creature in a 5-ft Emanation around the target. Psychic Resilience: Bonus Action, spend a die to gain Temporary HP equal to the roll plus your Intelligence modifier.",
  "Psychic Assault": "Mind Spike: replace an attack and spend 1-3 dice to cast Mind Spike at level 2, 3 or 4, using Intelligence, even while Raging. Telekinetic Grasp: replace an attack and spend one die to seize a creature you see within 30 ft. It makes a Strength save (DC 8 + Intelligence modifier + Proficiency Bonus) or is Restrained until the end of your next turn.",
  "Unbreakable Mind": "You gain proficiency in Intelligence and Wisdom saving throws.",
  "Psionic Redirection": "Reaction when a creature you see hits an ally within 30 ft: spend a die, teleport within 5 ft of the ally and take the attack instead. Add the die roll to your AC against it."},
 "lu": [{"feature": "Psionic Power", "lvl": 3, "max": [0,0,2,2,4,4,4,4,6,6,8,8,10,10,10,10,12,12,12,12], "reset": "long", "tag": "Psionic Energy Dice", "n": "Psionic Energy Dice"}],
 "acts": {"Psychic Resilience": "bonus", "Psionic Redirection": "reaction"},
 "fx": [[10, "Unbreakable Mind", {"notes": [["Note", "Unbreakable Mind: proficient in Intelligence and Wisdom saves"]]}]]},

"Path of the Dad": {"spab": "STR",
 "f": {
  "Paternal Proficiencies": "You gain proficiency with two sets of Artisan's Tools of your choice. You have Advantage on checks to grill food, make minor repairs, or assert authority over something unimportant.",
  "Not Angry, Just Disappointed": "When you Rage, pick one enemy you see. While you Rage, it subtracts your Rage Damage bonus from its attack and damage rolls.",
  "Dad Jokes": "Bonus Action: tell a joke to a creature within 60 ft that can hear you. It makes a Wisdom save (DC 8 + Strength modifier + Proficiency Bonus) or takes 1d8 Psychic damage. On a roll of 8 it finds the joke hilarious and is Incapacitated until your next turn starts.",
  "Don't Need to Ask For Directions": "Follow Me, Kids: allies that move within 10 ft of you provoke no Opportunity Attacks. Pretty Sure It's Over Here: cast Locate Animals or Plants, Locate Creature and Locate Object once each with no slot, using Wisdom. Each returns on a Long Rest.",
  "Go to Your Room": "Bonus Action: scold a creature within 60 ft that can hear you. It makes a Charisma save (DC 8 + Strength modifier + Proficiency Bonus) or is Stunned for 1 minute and flees from you on its turns. It repeats the save at each turn end. Long Rest to use again, or spend a Rage use (no action)."},
 "lu": [{"feature": "Pretty Sure It's Over Here", "lvl": 10, "max": 3, "reset": "long", "tag": "Locate Animals or Plants, Locate Creature, Locate Object"}, {"feature": "Go to Your Room", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Dad Jokes": "bonus", "Go to Your Room": "bonus"}},

"Path of the Drifter": {"spab": "STR",
 "f": {
  "Lone Wolf": "Outnumbered, Not Outmatched: you have Advantage on Initiative when enemies outnumber allies in the order. Stand Alone: while Raging with no ally within 5 ft, enemies cannot have Advantage on attacks against you. This stops while you are Incapacitated.",
  "Break Free": "When you Rage, or as a Bonus Action while Raging, remove Grappled or Restrained from yourself. Until the end of your turn, Difficult Terrain does not slow you and magic cannot reduce your Speed.",
  "Crowd Brawler": "When you hit with an Unarmed Strike or a melee weapon whose mastery you can use, you can also use Cleave in addition to another mastery. When you use Cleave, add the attack's ability modifier to that damage.",
  "Relentless Aggression": "Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft."},
 "acts": {"Break Free": "bonus"}},

"Path of the Fin": {"spab": "STR",
 "f": {
  "Aquatic Adaptation": "You breathe underwater and have a Swim Speed equal to your Speed.",
  "Frenzied Bite": "When you Rage, and as a Bonus Action while Raging, make an Unarmed Strike with shark teeth. It deals 1d8 Piercing plus Strength modifier. You have Advantage against a Bloodied target. Uses equal your Constitution modifier (minimum 1). Activating Rage regains one use. A Long Rest regains all.",
  "Blood Sense": "You sense each creature within 60 ft that is missing any HP, and you see them even if Invisible. You have Advantage on checks to track a creature you damaged in the last 24 hours.",
  "Feeding Frenzy": "When Frenzied Bite hits, regain HP equal to the Piercing damage. If the target is Large or smaller, you can make it Grappled or Prone.",
  "Blood in the Water": "While Raging, turn a hit on a Bloodied creature (Unarmed Strike or melee weapon) into a Critical Hit. Long Rest to use again, or spend a Rage use (no action). If the crit drops the target to 0 HP, the use is not spent."},
 "lu": [{"feature": "Frenzied Bite", "lvl": 3, "max": "mod:CON", "reset": "long", "tag": "Bonus Action, Rage regains 1"}, {"feature": "Blood in the Water", "lvl": 14, "max": 1, "reset": "long", "tag": "Critical Hit"}],
 "acts": {"Frenzied Bite": "bonus"},
 "fx": [[3, "Aquatic Adaptation", {"notes": [["Note", "Aquatic Adaptation: Swim Speed equals Speed, breathe underwater"]]}]]},

"Path of the Frostrager": {"spab": "STR",
 "f": {
  "Cold Resistance": "You have Resistance to Cold damage.",
  "Frostrage": "Rimeshield: while Raging and not using a Shield, you gain AC equal to your Rage Damage bonus. Thorns of Ice: a creature that hits you with a melee attack while you Rage takes Cold damage equal to your Constitution modifier (minimum 1).",
  "Icicle Throw": "While Raging, replace an attack with Icicle Javelin, using Strength, even while Raging. Uses equal your Strength modifier (minimum 1). Activating Rage regains one. A Long Rest regains all.",
  "Abominable": "You have Advantage on Constitution saves unless Incapacitated.",
  "Frigid Wind": "When you Rage, create a 30-ft Emanation of icy wind. Creatures you choose make a Constitution save (DC 8 + Strength modifier + Proficiency Bonus), taking 6d6 Cold on a fail or half on a success."},
 "lu": [{"feature": "Icicle Throw", "lvl": 6, "max": "mod:STR", "reset": "long", "tag": "Rage regains 1"}],
 "acts": {},
 "fx": [[3, "Cold Resistance", {"res": ["Cold"], "notes": [["Note", "Frostrage: while Raging without a Shield, AC bonus equals Rage Damage. Melee attackers take Cold damage equal to Constitution modifier (min 1)"]]}]]},

"Path of Heavy Metal": {"spab": "STR",
 "f": {
  "Rocker": "You gain proficiency with three Musical Instruments. After a Long Rest, you can turn a two-handed melee weapon into an Instrument Weapon, up to your Strength modifier (minimum 1) at once. It counts as a Musical Instrument you are proficient with and keeps its weapon stats. You gain Performance proficiency and add your Strength modifier (minimum +1) to Performance checks.",
  "Solo Shredding": "When you damage an enemy with an Instrument Weapon while Raging, raise your Rage Damage bonus by 1 until the Rage ends, to a maximum of double the table value. The extra resets to 0 if you miss an attack.",
  "Head Banging": "While Raging, Bonus Action: until your next turn starts, enemies within 5 ft have Disadvantage on attacks against anyone but you.",
  "Smash Hit": "When you Brutal Strike with an Instrument Weapon, you can break it on the target to reduce its AC by 3 until the end of your next turn. The weapon is broken until you repair it on a Short or Long Rest.",
  "Up to Eleven": "While Raging, when you deal damage with a melee weapon or Unarmed Strike, replace one damage die roll with 11. Long Rest to use again, or spend a Rage use (no action)."},
 "lu": [{"feature": "Up to Eleven", "lvl": 14, "max": 1, "reset": "long", "tag": "Damage die"}],
 "acts": {"Head Banging": "bonus"},
 "fx": [[3, "Rocker", {"skills": ["Performance"], "notes": [["Note", "Rocker: add Strength modifier (min +1) to Performance checks"]]}]]},

"Path of Spellfury": {"spab": "CHA",
 "f": {
  "Mystical Physicality": "Mighty Arcana: Arcana proficiency, and add your Strength modifier (minimum +1) to Arcana checks. Somatic Components: you can perform Somatic components with weapons or a Shield in your hands.",
  "Spellcasting": "You can cast spells and keep Concentration while Raging, but you can only cast level 1+ spells from this feature while Raging. Casting a spell extends your Rage by 1 round. You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. Your slots and prepared count follow the Spellfury Spellcasting table in the book and return on a Long Rest. Charisma is your spellcasting ability and an Arcane Focus works as your focus.",
  "Arcane Strike": "When you take the Attack action, replace one attack with a Sorcerer cantrip that has an action casting time. Spend a Rage use to replace it with a level 1 or 2 Sorcerer spell with an action casting time.",
  "Supernatural Exploits": "Cast on yourself with no slot, even when not Raging: Darkvision, Jump, Longstrider, See Invisibility, Spider Climb and Water Breathing.",
  "Eldritch Rampage": "Once per turn while Raging, right after you drop an enemy to 0 HP or score a melee Critical Hit, move up to your Speed and make a melee attack, or cast an action-time spell as a Bonus Action."},
 "acts": {},
 "fx": [[3, "Mystical Physicality", {"skills": ["Arcana"], "notes": [["Note", "Mighty Arcana: add Strength modifier (min +1) to Arcana checks"]]}]]},

"Path of the Slasher": {"spab": "STR",
 "f": {
  "Mark of the Slasher": "You gain proficiency in Athletics, Intimidation or Stealth (your pick). You wear a cowl of your choice. A table of 6 is in the book.",
  "Execution": "When you damage a creature with a melee weapon or Unarmed Strike while Raging and it has fewer HP than twice your Barbarian level left, it drops to 0 HP.",
  "Menacing Stare": "When you Rage, pick a creature within 60 ft that sees you. It makes a Wisdom save (DC 8 + Strength modifier + Proficiency Bonus) or is Frightened for 1 minute. It repeats the save at each turn end.",
  "Blood-Drunk": "When you drop an enemy to 0 HP while Raging, until the end of your next turn your Rage Damage bonus rises by 2 and you gain AC and save bonuses equal to your Rage Damage bonus. It does not stack.",
  "Killing Spree": "When you Rage, or as a Bonus Action while Raging, regain all your movement and make one extra attack this turn. Long Rest to use again, or spend a Rage use (no action)."},
 "lu": [{"feature": "Killing Spree", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Killing Spree": "bonus"}},

"Path of the Swamp": {"spab": "WIS",
 "f": {
  "Bogborne": "Difficult Terrain costs you no extra movement. You have a Swim Speed equal to your Speed and breathe underwater.",
  "Swamp Thing": "When you Rage, vines and roots fill a 10-ft Emanation. It is Difficult Terrain for creatures you choose. While Raging, Bonus Action: a Large or smaller creature you see in the Emanation makes a Strength save (DC 8 + Strength modifier + Proficiency Bonus) or is Restrained for 1 minute, repeating the save at each turn end. It ends early if you entangle another creature, your Rage ends, or the target leaves. Uses equal your Constitution modifier (minimum 1) per Long Rest, or spend a Rage use to regain all.",
  "Primal Magic": "Cast each once with no slot: Fog Cloud, Goodberry, Speak with Plants, Spike Growth, Water Walk. You can cast and concentrate while Raging. Pick Intelligence, Wisdom or Charisma as the casting ability each time. Each returns on a Long Rest.",
  "Muck and Mire": "The Swamp Thing Emanation becomes 20 ft. Creatures you choose in it cannot take Reactions and take a penalty to Dexterity saves equal to your Rage Damage bonus.",
  "Crushing Roots": "While Raging, Magic action: make one melee weapon or Unarmed Strike attack against each creature in your Swamp Thing Emanation. A hit knocks a Large or smaller target Prone."},
 "lu": [{"feature": "Swamp Thing", "lvl": 3, "max": "mod:CON", "reset": "long", "tag": "Bonus Action, Rage regains all"},
        {"feature": "Primal Magic", "lvl": 6, "max": 5, "reset": "long", "tag": "Fog Cloud, Goodberry, Speak with Plants, Spike Growth, Water Walk"}],
 "acts": {"Swamp Thing": "bonus", "Crushing Roots": "action"},
 "fx": [[3, "Bogborne", {"notes": [["Note", "Bogborne: ignore Difficult Terrain, Swim Speed equals Speed, breathe underwater"]]}]]},

"Path of Tranquility": {"spab": "STR",
 "f": {
  "Battle Trance": "When you Rage you can enter a Battle Trance. Your Rage ends early if you take the Attack action or make an attack roll on your turn. Reaction: when a creature you see in reach attacks you or an ally within 5 ft, attack it with as many attacks as the Attack action gives, resolved before the triggering attack. You have Advantage on attacks made as a Reaction. When you hit on the target's own turn with a Strength-based attack, deal 1d6 extra damage of the attack's type.",
  "Mantra": "While in a Battle Trance, add your Rage Damage bonus to Intelligence, Wisdom and Charisma saves.",
  "Serene Strike": "You can give up the Advantage on a Reaction attack to use Brutal Strike. Its extra damage then uses d12s instead of d10s.",
  "Reactive": "In a Battle Trance you gain an extra Reaction, refreshed at each of your turns starts. You cannot take two Reactions on the same turn. After you take a Reaction, you cannot take that same Reaction again until your next turn starts."},
 "acts": {"Battle Trance": "free"}},

"Path of the Muscle Wizard": {"spab": "STR",
 "f": {
  "Unarguable Wizardry": "You have Advantage on Intimidation checks to convince others you are a wizard. If someone questions your magic, Reaction: Rage until the end of your next turn. It cannot be extended and costs no Rage use.",
  "\"Cantrips\"": "Once per turn when you hit with a Strength-based attack, pick one. Mage Hand: push a Large or smaller target 5 ft away (10 ft while Raging). Shocking Grasp: the target cannot make Opportunity Attacks this turn (until your next turn starts while Raging). True Strike: 1d6 extra damage of the attack's type, plus half your Barbarian level (round down) while Raging.",
  "\"Spells\"": "While Raging, use each once, then rest. Burning Hands: action, Unarmed Strike against each creature in reach. A hit deals 1d8 plus Strength modifier Bludgeoning and the target has Disadvantage on its next attack. Magic Missile: action, three ranged attacks with Dart, Dagger or similar Thrown weapons using Strength, with Advantage. Shield: Reaction when hit, gain a Shield's AC bonus against the attack. If it still hits, damage is reduced by your Barbarian level. Each returns on a Long Rest.",
  "Magic Resistance": "While Raging, you have Advantage on saves against spells and other magical effects.",
  "I Cast Fist": "While Raging, when you take the Attack action, replace one attack with a Fist: an Unarmed Strike with Advantage that deals 6d6 plus Strength modifier Bludgeoning on a hit and knocks a Huge or smaller target Prone. Once per active Rage."},
 "lu": [{"feature": "\"Spells\"", "lvl": 6, "max": 3, "reset": "long", "tag": "Burning Hands, Magic Missile, Shield", "n": "Wizard \"Spells\""}],
 "acts": {"Unarguable Wizardry": "reaction"}},
}
