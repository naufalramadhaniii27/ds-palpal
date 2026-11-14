# Own-wording Cleric domains of Valda's Spire of Secrets, 2014 rules. Domain spells come from the source spell lists.
_DS = "Cleric spells you always have prepared from your domain: see the Domain Spells table of the book. "
SUB = {
"Destruction Domain": {"spab": "Wisdom",
 "f": {
  "Devastation Initiate": "You learn two cantrips of your choice from the wizard list. They count as cleric spells and do not count against cantrips known.",
  "Channel Divinity: Calamity": "As a bonus action, spend a use of Channel Divinity. For 1 minute, when you deal damage with a cleric spell, any damage die that rolls its maximum can be rolled again and added, repeating on maximums. You can roll at most twice as many damage dice as the spell originally had.",
  "Shockwave": "Once per turn, when you cast a cleric spell of level 1 or higher that deals fire, force, lightning, radiant or thunder damage, you can send a shockwave through one creature it damages: a 5-ft-radius sphere around that creature that harms only objects not worn or carried. Each object in it takes twice the damage the creature took, ignoring the object's damage threshold.",
  "Potent Spellcasting": "You add your Wisdom modifier to the damage of any cleric cantrip you cast.",
  "Havoc Spell": "When you damage a creature with a cleric spell, you can spend a spell slot as a bonus action to deal extra Radiant damage to one creature that took damage from it: 2d6 for a level 1 slot, plus 1d6 per slot level above 1, up to 5d6."},
 "acts": {"Channel Divinity: Calamity": "bonus", "Havoc Spell": "bonus"},
 "fx": [[8, "Potent Spellcasting", {"notes": [["Note", "Potent Spellcasting: cleric cantrips add your Wisdom modifier to damage"]]}]]},

"Madness Domain": {"spab": "Wisdom",
 "f": {
  "Lunatic Insight": "When you make an ability check that does not include your Proficiency Bonus and the d20 shows an even number, you add your Proficiency Bonus to the check.",
  "Unhinged Initiate": "You learn a random wizard cantrip chosen by the GM. It counts as a cleric spell and does not count against cantrips known. The GM can change it after each Long Rest.",
  "Channel Divinity: Temporary Insanity": "As an action, spend a use of Channel Divinity. A creature within 60 ft makes a Wisdom save or suffers a random madness for up to 1 minute. Roll a d20: 1-5 Aphasia, it cannot speak, cast spells or understand others. 6-10 Delusion, when it attacks or targets a creature, roll a d20 and on an odd result the attack misses or the effect fails. 11-15 Frenzy, it cannot tell friend from foe, treats all creatures it sees as enemies, picks targets at random among those in range and must make an opportunity attack if one is provoked. 16-20 Vertigo, it falls Prone at the end of each of its turns unless leaning on something. A frenzied creature repeats the save when it takes damage.",
  "Fragmented Mind": "You have Advantage on saves against being Charmed or Frightened and against effects that sense your emotions or read your thoughts. After 10 minutes of conversation with another creature you can give it this benefit for up to 1 hour.",
  "Potent Spellcasting": "You add your Wisdom modifier to the damage of any cleric cantrip you cast.",
  "Embrace Unreality": "As an action, rewrite the rules of reality in a 120-ft radius around a point within 60 ft, for 1 minute. Pick one rule. No Up, No Down: every creature and object in it is weightless as with levitate. Opposite Day: a creature that would have Advantage has Disadvantage and the reverse. Red Light, Green Light: no creature moves on its turn, and at the start of each round all creatures choose a destination and move at once, with creatures ending in the same space colliding and falling Prone. Through The Looking Glass: at the start of each creature's turn it rolls any die, doubling in size on even (as enlarge) and halving on odd (as reduce). Long Rest to use again."},
 "lu": [{"feature": "Embrace Unreality", "lvl": 17, "max": 1, "reset": "long", "tag": "Action. 120-ft radius"}],
 "acts": {"Channel Divinity: Temporary Insanity": "action", "Embrace Unreality": "action"},
 "fx": [[8, "Potent Spellcasting", {"notes": [["Note", "Potent Spellcasting: cleric cantrips add your Wisdom modifier to damage"]]}]]},

"Pestilence Domain": {"spab": "Wisdom",
 "f": {
  "Bonus Proficiency": "You gain proficiency with heavy armor.",
  "Carrier": "You are immune to disease and the Poisoned condition. You also have a lingering symptom, chosen or rolled on a d8: constant sickening cough; one withered but working limb; blood-red eyes; waves of shivers; tumors and a hunched back; boils and sores; gaunt body; constant fever and sweat.",
  "Tumor": "When a creature within 5 ft hits you with an attack, you can use your reaction to poison it with a bulbous tumor. It makes a Constitution save or is Poisoned for 1 minute, repeating the save at the end of each of its turns. Short or Long Rest to use again.",
  "Channel Divinity: Infection": "As an action, spend a use of Channel Divinity and touch a creature within reach. It makes a Constitution save or suffers one disease of your choice for 1 minute. Effects that remove or ease disease work on it. Bloodmore: whenever it takes Bludgeoning, Piercing or Slashing damage, it loses an extra 1d6 hit points. Joint Lock: it can move at most 15 ft or half its Speed, whichever is lower, on its turn. Ruby-Eye: it sees normally to 5 ft but is Blinded beyond.",
  "Fester": "You can change Necrotic or Radiant damage you deal to Poison. You ignore Resistance to Poison damage. Your cleric spells and features ignore immunity to the Poisoned condition and to disease. A creature immune to either has Advantage on saves against your effects.",
  "Divine Strike": "Once per turn when you hit with a weapon attack, you can deal extra 1d8 Poison damage (2d8 from level 14).",
  "Viral Infection": "When you use Infection, the target also has Disadvantage on ability checks and saves with one ability score of your choice while diseased. When an Infection target is within 5 ft of another creature, you can use your reaction to spread it: that creature makes a Constitution save or catches the same disease for 1 minute."},
 "lu": [{"feature": "Tumor", "lvl": 3, "max": 1, "reset": "short", "tag": "Reaction. Poison a melee attacker"}],
 "acts": {"Tumor": "reaction", "Channel Divinity: Infection": "action", "Viral Infection": "reaction"},
 "grant": {"f": "Bonus Proficiency", "armor": [[3, "Heavy"]]},
 "fx": [[3, "Carrier", {"notes": [["Note", "Carrier: immune to disease and the Poisoned condition"]]}], [8, "Divine Strike", {"notes": [["Note", "Divine Strike: +1d8 Poison once per turn on a weapon hit (2d8 from level 14)"]]}]]},

"Rum Domain": {"spab": "Wisdom",
 "f": {
  "Cup Floweth Over": "As an action, fill your mug with beer or rum. Only you can drink it, and you suffer no ill effect from any amount of alcohol: you are flushed and slurred but steady and clear-headed. You also learn the legendary libation cantrip. It counts as a cleric spell and does not count against cantrips known.",
  "Drunken Sway": "While you wear no armor and hold no shield, your AC is 10 + Dexterity modifier + Wisdom modifier. You also gain proficiency with martial weapons.",
  "Channel Divinity: Intoxicate": "When a creature you see makes an attack, use your reaction and a use of Channel Divinity. It makes a Constitution save against your spell save DC or is Poisoned and has Disadvantage on saves for up to 1 minute, repeating the save at the end of each of its turns.",
  "Rumrunner": "When a hostile creature moves, you can use your reaction to move up to half your Speed. This does not provoke opportunity attacks from that creature.",
  "Divine Strike": "Once per turn when you hit with a weapon attack, you can deal extra 1d8 damage of the weapon's type (2d8 from level 14).",
  "Next Round's On Me": "As an action, choose up to 6 friendly creatures you see within 60 ft. For 1 minute you and they have Advantage on Intelligence, Wisdom and Charisma saves and subtract your Wisdom modifier from Bludgeoning, Piercing and Slashing damage taken. Short or Long Rest to use again."},
 "lu": [{"feature": "Next Round's On Me", "lvl": 17, "max": 1, "reset": "short", "tag": "Action. 6 allies"}],
 "acts": {"Channel Divinity: Intoxicate": "reaction", "Rumrunner": "reaction", "Next Round's On Me": "action"},
 "grant": {"f": "Drunken Sway", "weapons": [[3, "Martial weapons"]]},
 "fx": [[3, "Drunken Sway", {"notes": [["Note", "Drunken Sway: unarmored, no shield: AC 10 + Dexterity + Wisdom modifier"]]}], [8, "Divine Strike", {"notes": [["Note", "Divine Strike: +1d8 weapon damage type once per turn (2d8 from level 14)"]]}]],
 "acb": {"l": 3, "v": 0, "s": "Drunken Sway"}},

"Travel Domain": {"spab": "Wisdom",
 "f": {
  "Jaunt": "As a bonus action, move 10 ft without provoking opportunity attacks. You can do this a number of times equal to your Wisdom modifier (minimum 1) and regain all uses on a Long Rest.",
  "Well-Traveled": "You gain proficiency with four finesse or ranged weapons of your choice and learn two languages of your choice.",
  "Channel Divinity: Divine Transportation": "As an action, spend a use of Channel Divinity and pick up to three willing Small or Medium creatures, yourself included. They teleport into each other's spaces, swapping places as you choose.",
  "Overland Expedition": "When you travel, you and up to 10 creatures with you always move at a fast pace and ignore delays from rough terrain, weather and other nonmagical obstacles, and hazards of travel on other planes. You can travel 12 hours instead of 8 before Constitution saves for a forced march. You are also unaffected by Difficult Terrain.",
  "Divine Strike": "Once per turn when you hit with a weapon attack, you can deal extra 1d8 Force damage (2d8 from level 14).",
  "Godspeed": "Your walking Speed doubles. If you attack while 30 ft or more from where your turn began, the extra damage of Divine Strike rises to 4d8."},
 "lu": [{"feature": "Jaunt", "lvl": 3, "max": "mod:WIS", "reset": "long", "tag": "Bonus Action. 10 ft, no opportunity attacks"}],
 "acts": {"Jaunt": "bonus", "Channel Divinity: Divine Transportation": "action"},
 "fx": [[8, "Divine Strike", {"notes": [["Note", "Divine Strike: +1d8 Force once per turn on a weapon hit (2d8 from level 14)"]]}], [17, "Godspeed", {"notes": [["Note", "Godspeed: walking Speed doubles"]]}]]},

"Wealth Domain": {"spab": "Wisdom",
 "f": {
  "Appraisal": "As an action, you learn the exact market price of any object and what it would fetch second-hand. You can use Wisdom instead of Charisma for Charisma checks to buy, sell or haggle.",
  "Leverage": "When you cast a spell with a material component that has a stated cost, you need materials worth only half of that cost.",
  "Channel Divinity: Riches": "When you reduce a hostile creature to 0 hit points, you can spend a use of Channel Divinity to burst coins around it. The gold pieces created equal the creature's XP value divided by 10, rounded down. You can use this option once and regain it on a Long Rest.",
  "Bribe": "As an action, choose a hostile creature you see. It makes a Charisma save against your spell save DC. On a failure you bribe it with goods or a bag of gold that teleports to it. The cost is half the creature's XP value in gp. It then cannot be hostile to you or your allies for 24 hours, ending early if you or your allies damage it. It does not work on creatures with Intelligence 3 or lower, or any the GM rules out.",
  "Potent Spellcasting": "You add your Wisdom modifier to the damage of any cleric cantrip you cast.",
  "Tycoon": "Any money you gain, whether from selling, gifts, downtime activities, pickpocketing or treasure, is doubled."},
 "lu": [{"feature": "Channel Divinity: Riches", "lvl": 3, "max": 1, "reset": "long", "tag": "On reducing a foe to 0 HP"}],
 "acts": {"Appraisal": "action", "Bribe": "action"},
 "fx": [[8, "Potent Spellcasting", {"notes": [["Note", "Potent Spellcasting: cleric cantrips add your Wisdom modifier to damage"]]}]]},
}
