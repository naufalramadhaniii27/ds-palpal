# Own-wording Barbarian paths of Valda's Spire of Secrets, 2014 rules. Shape of tvss14_sub_warmage.py.
SUB = {
"Path of Heavy Metal": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency with one musical instrument of your choice.",
  "Heavy Metal Axe": "Spend 8 hours of work to turn a two-handed weapon into an instrument you are proficient with. Only you can play it, and it keeps all its combat uses. You can keep a number of these instrument weapons equal to your Proficiency Bonus.",
  "Solo Shredding": "When you rage you start a solo on your instrument weapon. Each time you damage a hostile creature with it during the rage, your Rage damage bonus rises by 1, up to twice your Proficiency Bonus. The bonus ends if you are incapacitated, stop holding the instrument weapon, miss an attack, or your rage ends.",
  "Killer Vocals": "As a bonus action, let out a roar, screech or growl. Each Large or smaller creature of your choice within 5 ft is pushed 5 ft away and is Deafened until the end of your next turn.",
  "Up To Eleven": "When you make a Charisma check, or any check involving your instrument weapon, you can treat a d20 roll of 10 or lower as an 11.",
  "Smash Hit": "When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. A nonmagical instrument weapon is destroyed. A magic one loses its musical parts and becomes a normal weapon. Short or Long Rest to use again."},
 "lu": [{"feature": "Smash Hit", "lvl": 14, "max": 1, "reset": "short", "tag": "On hit while raging"}],
 "acts": {"Killer Vocals": "bonus"}},

"Path of the Colossus": {"spab": "",
 "f": {
  "Larger Than Life": "When you rage, your size doubles in every dimension and your weight is multiplied by eight, which raises your size by one category (Medium to Large, for example). It does not stack with other size increases such as enlarge/reduce. If there is not enough room you grow as far as the space allows. Your weapons grow too, and while enlarged your attacks with them deal 1d4 extra damage. While raging you can use your action to swing hugely at every creature in a 15-ft line within your reach. Roll a separate attack against each.",
  "Imposing Presence": "Ranged effects whose line of sight passes through you treat targets behind you as having cover. While you rage this becomes full cover.",
  "Boulder Throw": "You can throw boulders and similarly large objects as weapons. They count as two-handed, heavy, thrown weapons with range 30/60 ft, and you are proficient with them. A hit deals 2d8 Bludgeoning. You can throw only one per turn.",
  "Colossal Strength": "Your Strength score rises by 2 and its maximum becomes 22. At level 20 the maximum is 26 instead of 24. While raging, your melee weapon attacks gain reach if they lacked it."},
 "fx": [[14, "Colossal Strength", {"notes": [["Note", "Colossal Strength: Strength +2, maximum 22 (26 at level 20). Raging melee attacks gain reach"]]}]],
 "acts": {"Larger Than Life": "action"}},

"Path of the Fin": {"spab": "",
 "f": {
  "Aquatic": "You are adapted to life underwater. You can breathe water and air, and you have a swim speed equal to your walking speed. While you are swimming, your rage cannot end early unless you end it.",
  "Feeding Frenzy": "While raging you grow rows of shark teeth and gain a bite, a natural weapon you can use for unarmed strikes. It deals 1d8 + Strength modifier Piercing instead of the usual Bludgeoning. From level 6 the bite counts as magical for overcoming resistance and immunity to nonmagical damage. When you hit a creature within 5 ft with a melee attack, use a bonus action to bite it. This has Advantage if the target has half its hit points or fewer. You can do this a number of times equal to your Constitution modifier (minimum 1) and regain all uses on a Long Rest.",
  "Blood Sense": "You gain a keen sense of smell. You have Advantage on Intelligence (Investigation) and Wisdom (Perception) checks that involve smell. You automatically track one living creature whose scent you know if the trail is under a week old. After a minute of concentration you detect the scent of every living creature within 100 ft, or within 1 mile in water.",
  "Mako": "Your bite damage rises to 1d10. Once per turn when your bite hits, the target makes a Dexterity save (DC 8 + Proficiency Bonus + Strength modifier) or is knocked Prone or grappled by you (your choice). It has Disadvantage on the save if you are swimming.",
  "Tsunami": "As a bonus action, raise a wave of salt water up to 15 ft wide and 15 ft tall that glides under you and moves as you swim. A creature caught in it must swim and hold its breath until it leaves the wave or the wave moves off it. The wave puts out unprotected flames. It lasts 1 minute, then spreads over the ground and evaporates. Short or Long Rest to use again."},
 "lu": [{"feature": "Feeding Frenzy", "lvl": 3, "max": "mod:CON", "reset": "long", "tag": "Bonus Action bite"}, {"feature": "Tsunami", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Feeding Frenzy": "bonus", "Tsunami": "bonus"},
 "fx": [[3, "Aquatic", {"notes": [["Note", "Aquatic: you breathe water and air and have a swim speed equal to your walking speed"]]}]]},

"Path of the Muscle Wizard": {"spab": "",
 "f": {
  "Unarguable Wizardry": "You have Advantage on Charisma (Intimidation) checks made to convince others you are a wizard. If someone questions your magical skill, you can fly into a rage for 1 round. It cannot be extended and does not count against your Rages per Long Rest. During it you can attack only that creature and its allies.",
  "\"Cantrips\"": "You can use these \"cantrips\" in combat a number of times equal to your Strength modifier, regaining all uses on a Short or Long Rest. While raging you use them at will, with no use spent. Mage Hand: bonus action after you hit with a melee weapon attack on your turn, shove the target. It makes an opposed Strength check against you and falls Prone if you win. Shocking Grasp: bonus action when you attack, and on a hit the target cannot take reactions until the start of your next turn. True Strike: bonus action when you attack, and on a hit the target takes an extra 1d8.",
  "\"Spells\"": "You can cast each of these \"spells\" once and regain all uses on a Long Rest. Burning Hands: action, make an Unarmed Strike against each creature in reach, each hit dealing 1d8 + Strength modifier Bludgeoning. Magic Missile: when you take the Attack action, use a bonus action to make a ranged weapon attack with Advantage. Shield: reaction when targeted by an attack, gain a Shield's AC bonus against it even if you hold none. If you are hit anyway, reduce the damage by 1d12 + Constitution modifier.",
  "Magic Resistance": "While raging, you have Resistance to damage from spells.",
  "I Cast Fist": "While raging, use your action and bonus action to punch one creature in reach: a melee attack roll with Advantage, dealing 8d8 + Strength modifier Bludgeoning on a hit. Once per rage."},
 "lu": [{"feature": "\"Cantrips\"", "lvl": 3, "max": "mod:STR", "reset": "short", "tag": "Free while raging"}, {"feature": "\"Spells\"", "lvl": 6, "max": 3, "reset": "long", "tag": "Burning Hands, Magic Missile, Shield"}, {"feature": "I Cast Fist", "lvl": 14, "max": 1, "reset": "long", "tag": "Once per rage"}],
 "acts": {"\"Spells\"": "action", "I Cast Fist": "action"}},

"Path of the Rage Mage": {"spab": "Charisma", "third": {"list": "Sorcerer", "ab": "CHA", "cant": 2},
 "f": {
  "Arcane Intuition": "You gain proficiency in Arcana and can use Constitution instead of Intelligence for Intelligence (Arcana) checks.",
  "Spellcasting": "While raging you can cast and concentrate on spells, and casting a spell on your turn counts as attacking a hostile creature to keep your rage going. Cantrips. You know two sorcerer cantrips, and one more at level 10. Slots. The Rage Mage Spellcasting table gives your slots. You must be raging to cast with them, and a Long Rest restores them. Spells known. You know three 1st-level sorcerer spells, two of which are evocation or transmutation. The table shows when you learn more. Each must be evocation or transmutation of a level you have slots for, except those learned at levels 8, 14 and 20. When you gain a level you can swap one known spell for another of an allowed level. Ability. Charisma.",
  "Arcane Rampage": "When you take the Attack action while raging and attacking recklessly, you can use your bonus action to cast a spell in place of one of your attacks. The spell must take 1 action or 1 bonus action to cast.",
  "Supernatural Exploits": "Even when not raging, you can cast darkvision, feather fall, jump and see invisibility at will on yourself, with no slot or material components.",
  "Eldritch Explosions": "Once per turn when you hit with a melee weapon attack, spend a spell slot to burst energy at a point you choose within 10 ft. Each creature other than you within 10 ft of that point makes a Dexterity save against your spell save DC, taking 2d6 Force per level of the slot on a failure or half on a success."},
 "acts": {"Arcane Rampage": "bonus"}},

"Path of Tranquility": {"spab": "",
 "f": {
  "Mantra": "Taking the Dodge action on your turn counts as attacking a hostile creature for keeping your rage going.",
  "Anticipate": "If you make no attack roll on your turn, you brace for blows. Until the start of your next turn, when a creature makes a melee attack against you, you can use your reaction to make one melee weapon attack against it.",
  "Battle Trance": "When you use your reaction to make an attack, you can make two attacks instead.",
  "Tranquility": "You can cast calm emotions, enthrall and sanctuary once each, with no slot or components, and regain them on a Long Rest. You can cast them while raging. The save DC is 8 + Proficiency Bonus + Constitution modifier.",
  "Zen State": "Whenever a creature misses you with a melee attack, you gain +2 AC, up to +6. The bonus resets to 0 when you take damage or at the start of your turn."},
 "lu": [{"feature": "Tranquility", "lvl": 10, "max": 3, "reset": "long", "tag": "Calm Emotions, Enthrall, Sanctuary"}],
 "acts": {"Anticipate": "reaction"}},
}
