# Own-wording Ranger archetypes of Valda's Spire of Secrets, 2014 rules. Spell tables come from the source.
SUB = {
"Beastborne": {"spab": "Wisdom",
 "f": {
  "Bestial Aspect": "As blood is shed you slip into a beastlike form. Whenever you take damage or deal damage to a hostile creature with an attack, add the amount to your damage pool. The pool gives a bonus to your damage rolls and extra beast abilities, as the Bestial Aspect table shows. After 1 minute of taking and dealing no damage, the pool resets to 0.",
  "Shapechanger": "Your body carries a lycanthropic curse. You gain the shapechanger subtype, and your true form is a hybrid of beast and man. You gain Darkvision out to 60 ft (30 ft more if your race already gives it). You have Advantage on Wisdom (Perception) checks that rely on smell.",
  "Wolfbane Fury": "As a bonus action, roll 4d6 and add the total to your damage pool. Short or Long Rest to use again.",
  "Howling Carnage": "When your damage pool is over 50, you attack three times with your claws instead of twice when you take the Attack action.",
  "Relentless Bloodlust": "When you drop to 0 hit points and are not killed outright, you can drop to 1 hit point instead. Add the damage you would have taken to your damage pool. Long Rest to use again."},
 "acts": {"Wolfbane Fury": "bonus"},
 "lu": [{"feature": "Wolfbane Fury", "lvl": 7, "max": 1, "reset": "short", "tag": "Add 4d6 to damage pool"},
        {"feature": "Relentless Bloodlust", "lvl": 15, "max": 1, "reset": "long", "tag": "Drop to 1 HP instead of 0"}],
 "fx": [[3, "Shapechanger", {"notes": [["Note", "Shapechanger: Darkvision 60 ft (+30 ft if you already have it). Advantage on smell-based Perception"]]}]]},

"Freerunner": {"spab": "Wisdom",
 "f": {
  "Freerunning": "You have Advantage on Dexterity (Acrobatics) checks to get past obstacles while running. You can use Dexterity instead of Strength for Strength (Athletics) checks to climb, jump or swing on a rope. You can use freerunning techniques a number of times equal to your Dexterity modifier and regain all uses on a Short or Long Rest. In your favored terrain a technique does not use up a charge. Slide: as a bonus action, move up to 10 ft through another creature's space or squeeze 10 ft through a smaller space, without spending movement. Tumble: as a bonus action, jump, dive or roll up to 10 ft in a straight line without spending movement. Opportunity attacks against you during it have Disadvantage. Wall Run: as a bonus action, run along a vertical surface as part of your move. Until your turn ends you have a climbing speed equal to your walking speed, and you can finish a jump along the wall even beyond your speed.",
  "Momentum": "If you move through a hostile creature's space, leave a creature's reach, or move at least 15 ft, your next weapon attack this turn deals extra 1d6 damage.",
  "Evasive Fighter": "When you use a freerunning technique, you gain +2 AC until the start of your next turn.",
  "Hit Hard, Hit Fast": "The extra damage of Momentum becomes 2d6.",
  "Nimble Dodge": "When an area effect would make you take a saving throw, use your reaction to move up to half your speed, possibly out of the area."},
 "acts": {"Freerunning": "bonus", "Nimble Dodge": "reaction"},
 "lu": [{"feature": "Freerunning", "n": "Freerunner Techniques", "lvl": 3, "max": "mod:DEX", "reset": "short", "tag": "Slide, Tumble, Wall Run"}],
 "fx": [[3, "Freerunning", {"notes": [["Note", "Freerunning: Advantage on Acrobatics to pass obstacles while running. Dexterity may replace Strength for climbing, jumping and swinging Athletics checks"]]}]]},

"Highwayman": {"spab": "Wisdom",
 "f": {
  "Merry Confederates": "When you and two or more friendly creatures hide to prepare an ambush, you and those hiding with you have Advantage on Dexterity (Stealth) checks.",
  "Nobody Move!": "When a creature you see provokes an opportunity attack from a friendly creature, use your reaction to make an opportunity attack against it with a ranged or melee weapon. It happens before the creature moves and before your friend's attack.",
  "Vantage Point": "You have a Climb Speed equal to your Speed. Climbing at half speed, you can scale difficult surfaces, such as slippery vertical walls, without an ability check.",
  "No Seriously, Don't Move!": "You make two attacks instead of one when you make an opportunity attack with a ranged or melee weapon.",
  "Get Out of Dodge": "When you take the Disengage action on your turn, you also gain two of these benefits as part of that action. Dash. Use an Object. One weapon attack against a creature you see. Shove a creature. Half falling damage and double jump distance until the start of your next turn."},
 "acts": {"Nobody Move!": "reaction"},
 "fx": [[7, "Vantage Point", {"mv": {"climb": "speed"}}]]},

"Spellbreaker": {"spab": "Wisdom",
 "f": {
  "Antimagic Strike": "Once on each of your turns, when you attack a creature you see, use your bonus action to deliver an antimagic pulse. During the attack and damage rolls, spells affecting the creature and the properties of magic items it wears or carries are suppressed. This includes protective spells like mage armor or mirror image and reaction effects like hellish rebuke. On a hit the creature takes extra 1d6 Force damage, or 2d6 if it was concentrating on a spell.",
  "Spellbreaker Magic": "You learn an extra spell at the ranger levels in the Spellbreaker Spells table. It counts as a ranger spell for you and does not count against spells known.",
  "Spell Resistance": "You have Advantage on saving throws against spells.",
  "Arcane Burst": "As an action, spend a spell slot to cause a 10-ft-radius arcane explosion centered on you. Each other creature in it makes a Dexterity save against your spell save DC. On a failure it takes Force damage equal to half your ranger level plus 1d8 per spell level, or half on a success.",
  "Antimagic Curse": "As an action, create a 5-ft-diameter sphere of antimagic, as the antimagic field spell, centered on a point within 60 ft. If the point is on a creature, the sphere moves with it. It lasts 1 minute or until you end it on your turn. Long Rest to use again."},
 "acts": {"Antimagic Strike": "bonus", "Arcane Burst": "action", "Antimagic Curse": "action"},
 "lu": [{"feature": "Antimagic Curse", "lvl": 15, "max": 1, "reset": "long", "tag": "Antimagic field on a point or creature"}],
 "fx": [[7, "Spell Resistance", {"notes": [["Note", "Spell Resistance: Advantage on saving throws against spells"]]}]]},

"Trophy Hunter": {"spab": "Wisdom",
 "f": {
  "Trophy": "When you slay a Large or larger beast, giant, humanoid, monstrosity or undead, you can take a body part. You must have damaged it in that fight, but not dealt the killing blow. Harvesting takes 1 minute. Over a Long Rest you treat the part with herbs and preservatives worth 50 gp to make it a trophy. You wear one trophy at a time and can swap on a Short or Long Rest. While wearing it, creatures of its type count as your favored enemy, you gain +2 to damage rolls against them, and +2 to AC and saving throws against their attacks and effects. From level 6 you can also make trophies from aberrations, celestials, constructs, dragons, elementals and fiends.",
  "Visceral Attack": "When you deal damage with a weapon attack, you can deal maximum damage with that weapon's dice. It does not apply to other damage sources such as Sneak Attack or hunter's mark. Short or Long Rest to use again.",
  "Clever Wrestler": "When you are grappled, use a bonus action to end the grapple with no check and move 5 ft without provoking opportunity attacks.",
  "Fell The Leviathan": "When you take the Attack action against a Large or larger creature, you can make one extra attack.",
  "Masterful Sidestep": "When an attack hits you, use your reaction to move up to half your movement without provoking opportunity attacks."},
 "acts": {"Clever Wrestler": "bonus", "Masterful Sidestep": "reaction"},
 "lu": [{"feature": "Visceral Attack", "lvl": 3, "max": 1, "reset": "short", "tag": "Maximum weapon damage dice"}],
 "fx": [[3, "Trophy", {"notes": [["Note", "Trophy: vs the worn trophy's type, +2 damage, +2 AC and +2 saves, and it counts as favored enemy"]]}]]},

"Vigilante": {"spab": "Wisdom",
 "f": {
  "Hand-To-Hand": "While you are unarmored or in light armor only: you can use Dexterity instead of Strength for unarmed strike attack and damage rolls. Your unarmed strikes deal more damage as you level, as the Unarmed Damage table shows. When you hit with an unarmed strike, use your bonus action to add one extra unarmed strike damage die. From level 7 your unarmed strikes count as magical.",
  "Heroic Magic": "You learn an extra spell at the ranger levels in the Heroic Spells table. It counts as a ranger spell for you and does not count against spells known.",
  "Masked Persona": "While you wear a mask or costume, your AC equals 10 + your Wisdom modifier + your Dexterity modifier.",
  "Flashbang": "As a bonus action, throw a concussive flashpaper bomb at your feet. Each creature within 5 ft cannot take reactions until the start of its next turn.",
  "Biff! Bam! Pow!": "When you make an unarmed strike on your turn, you can make two unarmed strikes instead. Both always have Disadvantage.",
  "Catchphrase!": "You can utter your catchphrase when you hit with an attack roll, win an opposed Strength, Dexterity or Constitution check, or succeed on a saving throw. Until the start of your next turn you have Resistance to all damage and add your Wisdom modifier to damage rolls. After use, wait until you score a critical hit or finish a Short or Long Rest."},
 "acts": {"Hand-To-Hand": "bonus", "Flashbang": "bonus"},
 "lu": [{"feature": "Catchphrase!", "lvl": 15, "max": 1, "reset": "short", "tag": "Resistance to all damage, add Wis to damage. Also resets on a critical hit"}],
 "acb": {"l": 3, "v": 10, "s": "Masked Persona", "abs": ["WIS", "DEX"]}},
}
