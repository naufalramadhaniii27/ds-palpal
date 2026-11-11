# Own-wording Fighter archetypes of Valda's Spire of Secrets, 2014 rules.
SUB = {
"Bone Knight": {"spab": "",
 "f": {
  "Adamant Ivory": "You can sprout bone plates. While you wear no armor, your AC is 17 (18 at level 5, 19 at level 10, 20 at level 18), and you can still use a shield. When you take Bludgeoning, Piercing or Slashing damage, use your reaction to spend a Hit Die, roll it and reduce the damage by the result.",
  "Bone Blades": "You can grow blades of jagged bone from your palms or wrists as you would draw a weapon, with the statistics of a longsword, shortsword or scimitar. You cannot be disarmed of them and can retract them like sheathing a weapon. From level 7 they count as magical, and once per turn when you hit with one you can spend a Hit Die to drive the bone into the target, adding the die and your Constitution modifier to the damage.",
  "Hardy Constitution": "When you finish a Long Rest you regain all your expended Hit Dice instead of half.",
  "Restructure": "As an action, reshape your skeleton to change your appearance, including height, weight, face shape, teeth and posture. You can even change between Medium and Small. Only bone structure changes, not skin color, hair length or clothing.",
  "Improved Ivory": "When you spend a Hit Die for Adamant Ivory or Bone Blades, you can spend two at once. Subtract the total from the damage you take, or add the total and your Constitution modifier to the weapon damage.",
  "Master Osteoth": "When you roll initiative with fewer than half your Hit Dice, you regain 1d6 Hit Dice. On your turn you can spend 3 Hit Dice to regain a use of Second Wind, or 8 Hit Dice to regain a use of Action Surge, with no action required."},
 "acts": {"Adamant Ivory": "reaction", "Restructure": "action"},
 "fx": [[3, "Adamant Ivory", {"notes": [["Note", "Adamant Ivory: unarmored AC 17 (18 at 5, 19 at 10, 20 at 18), shield allowed. Hit Die reduces Bludgeoning, Piercing, Slashing damage"]]}]],
 "acb": {"l": 3, "v": 17, "s": "Adamant Ivory", "abs": []}},

"Brawler": {"spab": "",
 "f": {
  "Brawling": "You are proficient with improvised weapons and treat one-handed improvised weapons as Thrown (range 20/60). While you are unarmed or wielding an improvised weapon and wear no medium or heavy armor, you can use Strength instead of Dexterity for your AC, and your unarmed strikes and improvised weapons deal d6 (d8 at level 5, d10 at level 11, d12 at level 17). From level 7 your unarmed strikes count as magical.",
  "Brute Force": "When you hit with an unarmed strike or a melee attack with an improvised weapon, use your bonus action to try to grapple the target or deal extra 1d6 damage (1d8 at level 5, 1d10 at level 11, 1d12 at level 17).",
  "Imposing Physique": "You gain proficiency in Intimidation and can use Strength instead of Charisma for Intimidation checks. Your carrying, lifting, pushing and pulling capacities are doubled.",
  "Haymaker": "When you take the Attack action to make an unarmed strike, you can give up your other attacks for one huge blow. For each attack you give up, add two extra damage dice to this attack.",
  "Owlbear Wrestler": "You have Advantage on Strength (Athletics) checks to grapple creatures of Large size or smaller, and you can grapple creatures of any size.",
  "Skullbreaker": "Once per turn, when you damage a creature with an unarmed strike or improvised weapon, you can shatter its resolve. You gain Resistance to any damage that creature deals you until the start of your next turn."},
 "acts": {"Brute Force": "bonus"},
 "fx": [[3, "Brawling", {"notes": [["Note", "Brawling: proficient with improvised weapons. Unarmed or improvised, no medium or heavy armor: Strength for AC, damage d6 (d8 at 5, d10 at 11, d12 at 17)"]]}], [7, "Imposing Physique", {"skills": ["Intimidation"]}]]},

"Celestial Lancer": {"spab": "",
 "f": {
  "Lance Speciality": "When you wield a lance, you do not have Disadvantage attacking creatures within 5 ft. You must still wield it two-handed when not mounted.",
  "Meteor Jump": "Once on each of your turns, use 20 ft of movement to make a high jump up to 10 ft high (20 ft at level 5, 30 ft at level 11, 40 ft at level 17). You need no run-up and do not provoke opportunity attacks while jumping or falling, and you can land within 10 ft of where you started. At the end of a fall, subtract that same height from the distance fallen for falling damage.",
  "Plunging Attack": "Once on each of your turns, when you hit with a melee weapon attack while falling, add 1d6 damage per 10 ft fallen, up to 5d6.",
  "Apex Moment": "When you use Meteor Jump, you can hover until the start of your next turn instead of falling. You then cannot use Meteor Jump on your next turn.",
  "Earthshaker": "At the end of a fall of 20 ft or more, use a bonus action to strike the earth like a meteor. Each creature touching the ground within 10 ft of where you land makes a Dexterity save (DC 8 + Proficiency Bonus + Strength modifier) or falls Prone. You can do this a number of times equal to your Strength modifier (minimum 1) and regain all uses on a Long Rest.",
  "Celestial Aura": "When you use Second Wind, you and each friendly creature you choose within 10 ft gain temporary hit points equal to your fighter level.",
  "Comet Strike": "When you use Earthshaker, a creature that fails its save takes 4d6 Fire, or half on a success. When you roll initiative with no uses of Earthshaker left, you regain one use."},
 "lu": [{"feature": "Earthshaker", "lvl": 10, "max": "mod:STR", "reset": "long", "tag": "Bonus Action after a 20 ft fall"}],
 "acts": {"Earthshaker": "bonus"}},

"Corsair": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in Sleight of Hand if you lack it.",
  "Commandeer": "You can replace one of your attacks with an attempt to steal an item carried by another creature. You cannot take worn clothing or armor, or an item held in a hand. Make a Dexterity (Sleight of Hand) check against the target's AC. On a success you take the object. You need a free hand.",
  "Surprise Attack": "Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. The attack must use a finesse or ranged weapon. You do not need Advantage if another enemy of the target is within 5 ft of it, that enemy is not incapacitated, and you do not have Disadvantage. The extra damage is 2d6 at level 7, 3d6 at level 11 and 4d6 at level 15.",
  "Three Sheets": "When you use Second Wind, you can also take the Dash or Disengage action as part of the same bonus action.",
  "Charmed Life": "You can give yourself Advantage on one ability check, attack roll or saving throw that uses Dexterity or Charisma. Short or Long Rest to use again.",
  "Slippery Positioning": "When a hostile creature you see within 60 ft moves, you can move 5 ft without using your reaction or provoking opportunity attacks. Each round you can do this a number of times equal to your Dexterity modifier.",
  "Untouchable Swordsman": "When you hit with Surprise Attack, the target has Disadvantage on attack rolls against you until the start of your next turn."},
 "lu": [{"feature": "Charmed Life", "lvl": 10, "max": 1, "reset": "short", "tag": "Advantage on a Dex or Cha roll"}],
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Sleight of Hand"]}]]},

"Dungeoneer": {"spab": "",
 "f": {
  "Danger Sense": "You have Advantage on Dexterity saves against effects you can see, such as traps and spells. You cannot be blinded, deafened or incapacitated to gain this.",
  "Kick In The Door": "When you start combat by kicking down a door, diving from overhead, crashing through a window or a similar reckless entrance (the GM decides), you have Advantage on your initiative roll and on attacks in the first round. You do not gain this when surprised or fighting creatures you cannot see.",
  "Dungeoneer's Intuition": "You have Advantage on ability checks to detect shapechangers, traps and unseen magical effects, and can make a check to detect them even when you normally would not.",
  "Monster Kill": "When you hit an aberration, fey, fiend, monstrosity or undead with a weapon attack, you can deal one extra die of weapon damage. You can do this three times and regain all uses on a Short or Long Rest.",
  "Lethality Prevention": "When you take damage over 50 hit points but are not killed outright, you can reduce the damage to 50 hit points.",
  "Avoidance": "When an effect lets you make a Strength, Dexterity or Constitution save for half damage, you take no damage on a success and half on a failure."},
 "lu": [{"feature": "Monster Kill", "lvl": 10, "max": 3, "reset": "short", "tag": "Extra weapon die vs aberration, fey, fiend, monstrosity, undead"}],
 "fx": [[18, "Avoidance", {"notes": [["Note", "Avoidance: a successful Str, Dex or Con save against half-damage effects means no damage, a failure means half"]]}]]},

"Mage Hand Magus": {"spab": "Intelligence",
 "f": {
  "Combat Hands": "While you hold nothing in your hands, your mage hand can wield weapons: each wields one one-handed weapon, or together they wield a two-handed weapon. When you take the Attack action you can make one or more attacks through your mage hand against targets you see within its reach, adding your Intelligence modifier instead of Strength or Dexterity to attack and damage rolls. A hand with no weapon can punch a creature within 5 ft of it for 1d6 Force on a hit.",
  "Mage Hand Master": "You learn mage hand if you do not know it, with these upgrades. You cast and control it as a bonus action. You summon two hands and control one or both. The duration is indefinite and ends only if you are knocked unconscious or choose to end it. The hands lift a combined 5 x your fighter level in pounds and can do anything you could do with your hands for ability checks.",
  "Handy Maneuvers": "While they hold no weapons, both hands together can grapple or shove a creature, adding your Intelligence modifier to the Strength (Athletics) check. You can also use your reaction to make an opportunity attack with one hand when a creature leaves its reach.",
  "Warhand": "When you cast mage hand, you can form one hand into a warhand, identical to the hand from Bigby's hand except that you use its abilities as an action instead of a bonus action. Intelligence is your spellcasting ability for it. When you use a warhand ability, you can use a bonus action to make one attack with your other hand.",
  "Handglide": "While two mage hands or a warhand are within 5 ft of you, they can hold you aloft and carry you. You have a flying speed equal to your walking speed while they do.",
  "Heavy Handed": "When you cast mage hand, you can summon two warhands instead. You can use the abilities of both as part of the same action on your turn."},
 "acts": {"Warhand": "action"}},
}
