import {hdRows,lateGet,num,used} from "./00a-reg-late-ports.js";import {HB_CONDS,HB_SRC} from "./02-data-default-character.js";
import {env} from "./00-env.js";
/* ================= GLOSSARY (paraphrased, not quoted) ================= */
const RG="PHB-2024, Rules Glossary", EQ="PHB-2024, Equipment", PG="PHB-2024, Playing the Game";
export var GLOSS={
  /* abilities */
  "Strength":{c:"Ability",s:PG,d:"Measures raw physical power. It drives melee attacks with most weapons, Unarmed Strike damage, the [[Grapple]] and [[Shove]] DC, the [[Athletics]] skill, Strength saving throws, and [[Carrying Capacity]]."},
  "Dexterity":{c:"Ability",s:PG,d:"Measures agility, reflexes, and balance. It drives [[Initiative]], ranged attacks, Finesse weapons, Armor Class in light armor or no armor (medium armor caps it at +2), and the [[Acrobatics]], [[Sleight of Hand]], and [[Stealth]] skills."},
  "Constitution":{c:"Ability",s:PG,d:"Measures health and stamina. Its modifier is added to your [[Hit Points]] at every level and to each [[Hit Point Dice]] you spend. It also covers Constitution saving throws, such as holding Concentration."},
  "Intelligence":{c:"Ability",s:PG,d:"Measures reasoning and memory. It drives the [[Arcana]], [[History]], [[Investigation]], [[Nature]], and [[Religion]] skills, plus the homebrew [[Computer]] skill."},
  "Wisdom":{c:"Ability",s:PG,d:"Measures perceptiveness and mental fortitude. It drives the [[Animal Handling]], [[Insight]], [[Medicine]], [[Perception]], and [[Survival]] skills, plus the homebrew [[Automotive]] skill."},
  "Charisma":{c:"Ability",s:PG,d:"Measures confidence, poise, and charm. It drives the [[Deception]], [[Intimidation]], [[Performance]], and [[Persuasion]] skills."},
  /* skills */
  "Acrobatics":{c:"Skill, Dexterity",s:PG,d:"Stay on your feet in tricky footing, keep your balance, or pull off a flip or a roll."},
  "Animal Handling":{c:"Skill, Wisdom",s:PG,d:"Calm a frightened animal, read its mood, or get it to do what you want."},
  "Arcana":{c:"Skill, Intelligence",s:PG,d:"Recall lore about spells, magic items, magical symbols, and the planes of existence."},
  "Athletics":{c:"Skill, Strength",s:PG,d:"Jump farther than normal, climb, swim in rough water, or force something open. It's also the check a creature uses to escape your [[Grappled]] condition."},
  "Deception":{c:"Skill, Charisma",s:PG,d:"Tell a convincing lie, keep a straight face, or wear a disguise well."},
  "History":{c:"Skill, Intelligence",s:PG,d:"Recall lore about past events, famous people, nations, and cultures."},
  "Insight":{c:"Skill, Wisdom",s:PG,d:"Read someone's mood and tell whether they're hiding something or lying."},
  "Intimidation":{c:"Skill, Charisma",s:PG,d:"Push someone into doing what you want with threats, hostile body language, or a show of force."},
  "Investigation":{c:"Skill, Intelligence",s:PG,d:"Search for clues, work out how something works, or find information in documents."},
  "Medicine":{c:"Skill, Wisdom",s:PG,d:"Diagnose an illness or figure out what killed someone. A DC 10 Medicine check made with the [[Help]] action can stabilize a creature at 0 Hit Points. In Retromistika, a DC 15 Medicine check also ends [[Bleeding]]."},
  "Nature":{c:"Skill, Intelligence",s:PG,d:"Recall lore about terrain, plants, animals, and weather."},
  "Perception":{c:"Skill, Wisdom",s:PG,d:"Notice something with your senses: a hidden creature, a sound behind a door, a trap on the floor. See also [[Passive Perception]]."},
  "Performance":{c:"Skill, Charisma",s:PG,d:"Act, sing, play music, dance, or tell a story to an audience."},
  "Persuasion":{c:"Skill, Charisma",s:PG,d:"Convince someone honestly and graciously, through good arguments and good manners."},
  "Religion":{c:"Skill, Intelligence",s:PG,d:"Recall lore about gods, rites, prayers, holy symbols, and religious orders."},
  "Sleight of Hand":{c:"Skill, Dexterity",s:PG,d:"Pick a pocket, hide a small object on your body, or do a trick with your hands."},
  "Stealth":{c:"Skill, Dexterity",s:PG,d:"Move quietly and stay out of sight. It's the check behind the [[Hide]] action. Chain Mail gives Disadvantage on it."},
  "Survival":{c:"Skill, Wisdom",s:PG,d:"Follow tracks, find food and water, keep your bearings, and avoid natural hazards."},
  "Automotive":{c:"Skill, Wisdom (homebrew)",s:"Retromistika Playtest, Skills",d:"A Retromistika skill tied to Wisdom. Use it to drive, repair, and understand how vehicles work."},
  "Computer":{c:"Skill, Intelligence (homebrew)",s:"Retromistika Playtest, Skills",d:"A Retromistika skill tied to Intelligence. Use it to operate computers and understand how their hardware and software work."},
  /* core numbers */
  "Proficiency Bonus":{c:"Rule",s:RG,d:"A bonus set by your level. You add it to attack rolls with weapons you're proficient with, to ability checks with proficient skills, to proficient saving throws, and to the DCs your features create, such as the [[Grapple]] DC."},
  "Saving Throw":{c:"Rule",s:RG,d:"A d20 roll to resist or avoid an effect. Add the matching ability modifier, plus your [[Proficiency Bonus]] if you're proficient in that save. Meet or beat the DC to succeed."},
  "Armor Class":{c:"Rule",s:RG,d:"How hard you are to hit. An attack roll that equals or beats your AC hits you."},
  "Initiative":{c:"Rule",s:RG,d:"A Dexterity check everyone rolls when combat starts. Higher results act first."},
  "Speed":{c:"Rule",s:RG,d:"How many feet you can move on your turn. You can split the movement before, between, and after your actions. [[Grappled]], [[Restrained]], and [[Paralyzed]] drop it to 0."},
  "Hit Points":{c:"Rule",s:RG,d:"Your health. When damage takes you to 0 Hit Points, you fall [[Unconscious]] and start making [[Death Saving Throw]]s. If the leftover damage equals or exceeds your Hit Point maximum, you die instantly."},
  "Temporary Hit Points":{c:"Rule",s:RG,d:"A buffer that takes damage before your real Hit Points. They don't stack: if you gain more, you choose which amount to keep. Healing can't restore them, and they vanish after a [[Long Rest]]."},
  "Hit Point Dice":{c:"Rule",s:RG,d:"Dice you spend during a [[Short Rest]] to heal. Roll each die you spend and add your Constitution modifier. A [[Long Rest]] restores all of them."},
  "Death Saving Throw":{c:"Rule",s:RG,d:"At the start of each turn at 0 Hit Points, roll a d20. 10 or higher is a success, lower is a failure. Three successes make you stable, three failures kill you. A 1 counts as two failures, a 20 brings you back with 1 Hit Point. Taking damage at 0 Hit Points counts as a failure."},
  "Heroic Inspiration":{c:"Rule",s:RG,d:"When you have it, you can spend it to reroll any one die right after you roll it, and you must use the new roll. You can only hold one at a time."},
  "Passive Perception":{c:"Rule",s:RG,d:"10 plus your [[Perception]] bonus. The DM compares it against hidden creatures and traps when nobody is rolling."},
  "Darkvision":{c:"Sense",s:RG,d:"Within range, you see in Dim Light as if it were Bright Light, and in Darkness as if it were Dim Light. You can't tell colors apart in Darkness."},
  "Carrying Capacity":{c:"Rule",s:RG,d:"A Medium creature can carry its Strength score times 15 pounds. You can drag, lift, or push up to twice that, but while moving more than your capacity, your [[Speed]] is at most 5 feet."},
  "Short Rest":{c:"Rule",s:RG,d:"At least 1 hour of light activity. You can spend [[Hit Point Dice]] to heal, and some features come back, such as [[Action Surge]] and one use of [[Second Wind]]."},
  "Long Rest":{c:"Rule",s:RG,d:"At least 8 hours, with 6 or more spent sleeping. You regain all Hit Points and all [[Hit Point Dice]], and your [[Exhaustion]] level drops by 1."},
  "Advantage":{c:"Rule",s:RG,d:"Roll two d20s and use the higher. If you have both Advantage and [[Disadvantage]] on the same roll, they cancel out."},
  "Disadvantage":{c:"Rule",s:RG,d:"Roll two d20s and use the lower. If you have both [[Advantage]] and Disadvantage on the same roll, they cancel out."},
  "Size":{c:"Rule",s:RG,d:"Medium creatures take up a 5-foot square. You can [[Grapple]] or [[Shove]] creatures up to one size larger than you, so up to Large."},
  "Languages":{c:"Rule",s:"PHB-2024, Character Creation",d:"Every character knows Common plus two more languages. Udjar and Wicara appear in the Retromistika monster stat blocks, so ask the DM before picking them."},
  /* actions */
  "Unarmed Strike":{c:"Attack",s:RG,d:"A melee attack with your fists, elbows, knees, or head. Everyone is proficient. On a hit, pick one option: **Damage** (normally 1 + Strength modifier), [[Grapple]], or [[Shove]]."},
  "Grapple":{c:"Unarmed Strike option",s:RG,d:"Target a creature no more than one size larger than you, within reach, with one hand free. It makes a Strength or Dexterity saving throw (its choice) against DC 8 + your Strength modifier + [[Proficiency Bonus]]. On a failure, it has the [[Grappled]] condition."},
  "Shove":{c:"Unarmed Strike option",s:RG,d:"Target a creature no more than one size larger than you, within reach. It makes a Strength or Dexterity saving throw against the same DC as [[Grapple]]. On a failure, you either push it 5 feet away or knock it [[Prone]]."},
  "Attack":{c:"Action",s:RG,d:"Make one attack with a weapon or an [[Unarmed Strike]]. You can draw or stow one weapon as part of each attack."},
  "Dash":{c:"Action",s:RG,d:"Gain extra movement equal to your [[Speed]] for this turn."},
  "Disengage":{c:"Action",s:RG,d:"Your movement doesn't provoke [[Opportunity Attack]]s for the rest of the turn."},
  "Dodge":{c:"Action",s:RG,d:"Until the start of your next turn, attacks against you have [[Disadvantage]] if you can see the attacker, and you have [[Advantage]] on Dexterity saving throws. You lose the benefit if you're [[Incapacitated]] or your Speed drops to 0."},
  "Help":{c:"Action",s:RG,d:"Give an ally [[Advantage]] on their next ability check with a skill or tool you're proficient with, or on their next attack against an enemy within 5 feet of you. It's also how you stabilize a dying creature with a DC 10 [[Medicine]] check."},
  "Hide":{c:"Action",s:RG,d:"While Heavily Obscured or behind Three-Quarters or Total Cover, and out of every enemy's line of sight, make a DC 15 Dexterity ([[Stealth]]) check. On a success, you have the [[Invisible]] condition until you make noise, attack, or someone finds you."},
  "Influence":{c:"Action",s:RG,d:"Try to change a creature's attitude with a Charisma or Wisdom check, such as [[Persuasion]], [[Deception]], [[Intimidation]], [[Performance]], or [[Animal Handling]]."},
  "Ready":{c:"Action",s:RG,d:"Pick a trigger and an action. When the trigger happens before your next turn, you can use your [[Reaction]] to take that action."},
  "Search":{c:"Action",s:RG,d:"Make a Wisdom check to notice or find something: [[Insight]], [[Medicine]], [[Perception]], or [[Survival]]."},
  "Study":{c:"Action",s:RG,d:"Make an Intelligence check to recall or figure something out: [[Arcana]], [[History]], [[Investigation]], [[Nature]], or [[Religion]]."},
  "Utilize":{c:"Action",s:RG,d:"Use a nonmagical object, such as a [[Healer's Kit]], a lever, or a door lock."},
  "Magic":{c:"Action",s:RG,d:"Cast a spell, use a magic item, or use a magical feature. [[Action Surge]] can't give you an extra Magic action."},
  "Bonus Action":{c:"Rule",s:RG,d:"A quick extra action you can take only when a feature or rule says so. You get one per turn."},
  "Reaction":{c:"Rule",s:RG,d:"An instant response to a trigger, such as an [[Opportunity Attack]]. You get one per round, and it comes back at the start of your turn."},
  "Opportunity Attack":{c:"Reaction",s:RG,d:"When a creature you can see leaves your reach, you can use your [[Reaction]] to make one melee attack against it, including an [[Unarmed Strike]]. A creature that took the [[Disengage]] action doesn't provoke it."},
  /* conditions */
  "Blinded":{c:"Condition",s:RG,d:"You can't see and automatically fail checks that need sight. Attacks against you have [[Advantage]], and your attacks have [[Disadvantage]]."},
  "Charmed":{c:"Condition",s:RG,d:"You can't attack the charmer or target it with harmful abilities or magic. The charmer has [[Advantage]] on ability checks to interact with you socially."},
  "Deafened":{c:"Condition",s:RG,d:"You can't hear and automatically fail checks that need hearing."},
  "Exhaustion":{c:"Condition",s:RG,d:"Stacks in levels. Each level gives \u22122 to every D20 Test and \u22125 feet of [[Speed]]. Level 6 kills you. A [[Long Rest]] removes one level."},
  "Frightened":{c:"Condition",s:RG,d:"While you can see the source of your fear, you have [[Disadvantage]] on ability checks and attack rolls, and you can't willingly move closer to it."},
  "Grappled":{c:"Condition",s:RG,d:"Your [[Speed]] is 0. You have [[Disadvantage]] on attacks against anyone except the grappler. The grappler can drag you along. You can try to escape with an action: Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) against the grapple DC."},
  "Incapacitated":{c:"Condition",s:RG,d:"You can't take actions, [[Bonus Action]]s, or [[Reaction]]s, you can't speak, and your Concentration breaks."},
  "Invisible":{c:"Condition",s:RG,d:"Others can't see you. Attacks against you have [[Disadvantage]] and your attacks have [[Advantage]], unless the other creature can somehow see you."},
  "Paralyzed":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and your [[Speed]] is 0. You automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]], and hits from within 5 feet are critical hits."},
  "Petrified":{c:"Condition",s:RG,d:"You turn into stone or a similar substance. You're [[Incapacitated]], Speed 0, and automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]]. You resist all damage and can't be [[Poisoned]]."},
  "Poisoned":{c:"Condition",s:RG,d:"You have [[Disadvantage]] on attack rolls and ability checks."},
  "Prone":{c:"Condition",s:RG,d:"You can only crawl, or spend half your [[Speed]] to stand up. Your attacks have [[Disadvantage]]. Attacks against you have [[Advantage]] from within 5 feet and Disadvantage from farther away."},
  "Restrained":{c:"Condition",s:RG,d:"Your [[Speed]] is 0. Attacks against you have [[Advantage]], your attacks have [[Disadvantage]], and you have Disadvantage on Dexterity saves."},
  "Stunned":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]]."},
  "Unconscious":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and [[Prone]], and you drop what you're holding. Speed 0, automatic failure on Strength and Dexterity saves, attacks against you have [[Advantage]], and hits from within 5 feet are critical hits."},
  /* weapon properties and masteries */
  "Ammunition":{c:"Weapon property",s:EQ,d:"You need ammunition to attack at range, and drawing it is part of the attack. After a fight, you can spend a minute to recover half the ammunition you used."},
  "Burst Fire":{c:"Weapon property",s:EQ,d:"As an action, spend 10 pieces of ammunition to spray a 10-foot Cube within normal range. Each creature there makes a DC 15 Dexterity save or takes the weapon's damage, rolled once for all."},
  "Reload":{c:"Weapon property",s:EQ,d:"You can fire only the number of shots listed. Then you must spend an action or a Bonus Action to reload."},
  "Finesse":{c:"Weapon property",s:EQ,d:"Use Strength or Dexterity for the attack and damage rolls. You must use the same one for both."},
  "Heavy":{c:"Weapon property",s:EQ,d:"You have [[Disadvantage]] on attacks with it if your Strength (melee) or Dexterity (ranged) is below 13."},
  "Light":{c:"Weapon property",s:EQ,d:"When you take the [[Attack]] action and attack with a Light weapon, you can make one extra attack as a [[Bonus Action]] with a different Light weapon. Don't add your ability modifier to that extra attack's damage unless it's negative. [[Nick]] moves this extra attack into the Attack action."},
  "Thrown":{c:"Weapon property",s:EQ,d:"You can throw the weapon to make a ranged attack, using the same ability modifier as its melee attack. Drawing it is part of the attack."},
  "Two-Handed":{c:"Weapon property",s:EQ,d:"You need two hands to attack with it."},
  "Versatile":{c:"Weapon property",s:EQ,d:"You can use it with one or two hands. The damage in parentheses is for two hands."},
  "Range":{c:"Weapon property",s:EQ,d:"Two numbers: normal range and long range. Attacks beyond normal range have [[Disadvantage]], and you can't attack beyond long range."},
  "Nick":{c:"Weapon mastery",s:EQ,d:"When you make the extra attack from the [[Light]] property, you make it as part of the [[Attack]] action instead of as a Bonus Action. Once per turn."},
  "Slow":{c:"Weapon mastery",s:EQ,d:"When you hit and deal damage, the target's [[Speed]] drops by 10 feet until the start of your next turn. Several hits don't reduce it by more than 10 feet."},
  "Vex":{c:"Weapon mastery",s:EQ,d:"When you hit and deal damage, you have [[Advantage]] on your next attack roll against that creature before the end of your next turn."},
  "Sap":{c:"Weapon mastery",s:EQ,d:"When you hit, the target has [[Disadvantage]] on its next attack roll before the start of your next turn."},
  "Graze":{c:"Weapon mastery",s:EQ,d:"When you miss, the target still takes damage equal to the ability modifier you used for the attack, of the weapon's damage type."},
  "Cleave":{c:"Weapon mastery",s:EQ,d:"When you hit with a melee attack, you can attack a second creature within 5 feet of the first and within your reach. That second hit deals weapon damage without your ability modifier unless it's negative. Once per turn."},
  "Push":{c:"Weapon mastery",s:EQ,d:"When you hit, you can push a Large or smaller target up to 10 feet straight away from you. Not to be confused with Tavern Brawler's 5-foot push on an Unarmed Strike."},
  "Topple":{c:"Weapon mastery",s:EQ,d:"When you hit, the target makes a Constitution saving throw (DC 8 + the attack's ability modifier + your [[Proficiency Bonus]]) or falls [[Prone]]."},
  /* gear */
  "Chain Mail":{c:"Heavy armor",s:EQ,d:"AC 16, no Dexterity bonus. Needs Strength 13, or your Speed drops by 10 feet. [[Disadvantage]] on [[Stealth]] checks. 55 lb, 75 GP. Takes 10 minutes to put on and 5 to take off."},
  "Healer's Kit":{c:"Gear",s:EQ,d:"Has 10 uses. Take the [[Utilize]] action and spend a use to stabilize a creature at 0 Hit Points with no [[Medicine]] check. In Retromistika it also ends [[Bleeding]] with no check. 3 lb, 5 GP."},
  "Dungeoneer's Pack":{c:"Equipment pack",s:EQ,d:"Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and a Waterskin. 55 lb, 12 GP."},
  "Quiver":{c:"Gear",s:EQ,d:"Holds up to 20 arrows. 1 lb, 1 GP."},
  "Arrows":{c:"Ammunition",s:EQ,d:"Ammunition for bows, sold in bundles of 20. 1 lb, 1 GP per 20."},
  "Traveler's Clothes":{c:"Gear",s:EQ,d:"Sturdy clothes for travel. 4 lb, 2 GP."},
  "Dice Set":{c:"Gaming set",s:EQ,d:"A set of dice for games of chance. Your proficiency lets you add your Proficiency Bonus to checks you make to play. Your Soldier background chose this gaming set."},
  "Dagger":{c:"Simple melee weapon",s:EQ,d:"1d4 Piercing. [[Finesse]], [[Light]], [[Thrown]] (20/60 ft). Mastery: [[Nick]]. 1 lb, 2 GP."},
  "Sickle":{c:"Simple melee weapon",s:EQ,d:"1d4 Slashing. [[Light]]. Mastery: [[Nick]]. 2 lb, 1 GP."},
  "Javelin":{c:"Simple melee weapon",s:EQ,d:"1d6 Piercing. [[Thrown]] (30/120 ft). Mastery: [[Slow]]. 2 lb, 5 SP."},
  "Spear":{c:"Simple melee weapon",s:EQ,d:"1d6 Piercing. [[Thrown]] (20/60 ft), [[Versatile]] (1d8). Mastery: [[Sap]]. 3 lb, 1 GP."},
  "Shortbow":{c:"Simple ranged weapon",s:EQ,d:"1d6 Piercing. [[Ammunition]] (80/320 ft, Arrow), [[Two-Handed]]. Mastery: [[Vex]]. 2 lb, 25 GP."},
  "Improvised Weapon":{c:"Weapon",s:EQ,d:"Any object you swing or throw, like a chair or a bottle. It deals 1d4 damage of a type the DM picks, and thrown range is 20/60 ft. Tavern Brawler makes you proficient with it."}
};
env.__GLOSS=GLOSS;/* v93: the 2014 equipment words change a few entries */

/* v94: 2014 rules words. gl14 lays the 2014 Rules Glossary entries over GLOSS (rests, Exhaustion, grapple, actions, conditions) and puts the 2024 ones back when off. The sheet follows C.rs, the builder follows the build */
let GL14S=null,GL14ON=false;
const GL14={
 "Proficiency Bonus":{d:"A bonus set by your level. You add it to attack rolls with weapons you are proficient with, to ability checks with proficient skills, to proficient saving throws, and to the DCs of your spells and features."},
 "Hit Point Dice":{d:"Dice you spend during a [[Short Rest]] to heal. Roll each die you spend and add your Constitution modifier. A [[Long Rest]] gives back up to half of your total Hit Dice, and at least one."},
 "Heroic Inspiration":{d:"A reward the DM gives for good roleplay, clever play, or a moment that fits your character. Spend it to have [[Advantage]] on one attack roll, saving throw, or ability check, and decide before you roll. You either have it or you do not. You can give yours to another player."},
 "Passive Perception":{d:"10 plus every modifier that applies to your Wisdom ([[Perception]]) check. Advantage adds 5 and Disadvantage subtracts 5. The DM compares it against hidden creatures and traps when nobody is rolling."},
 "Short Rest":{d:"At least 1 hour with nothing more strenuous than eating, drinking, reading, or tending wounds. At the end you can spend any number of your [[Hit Point Dice]] to heal. Some features come back, such as [[Action Surge]] and [[Second Wind]]."},
 "Long Rest":{d:"At least 8 hours of sleep and light activity, with no more than 2 hours awake. One hour of fighting, casting, or walking breaks the rest and it starts over. You regain all Hit Points and up to half of your total Hit Dice, at least one. You lose 1 level of [[Exhaustion]] if you ate and drank. Only one Long Rest counts in 24 hours, and you need at least 1 Hit Point to begin."},
 "Exhaustion":{d:"Stacks in six levels, and each level adds to the ones before it. 1: Disadvantage on ability checks. 2: Speed halved. 3: Disadvantage on attack rolls and saving throws. 4: Hit Point maximum halved. 5: Speed 0. 6: death. A [[Long Rest]] with food and drink removes one level."},
 "Languages":{s:"PHB-2014, Character Creation",d:"Your race and background give you your languages. Common is almost always one of them. Ask the DM before picking a rare one."},
 "Unarmed Strike":{d:"A punch, kick, head butt, or similar blow. It is a melee attack. On a hit it deals 1 + your Strength modifier bludgeoning damage, and you are always proficient with it. [[Grapple]] and [[Shove]] replace one attack."},
 "Grapple":{c:"Special attack",d:"Replaces one attack of your [[Attack]] action. The target can be no more than one size larger than you and within reach, and you need one hand free. Your Strength ([[Athletics]]) check is contested by the target's Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check, its choice. If you win, it has the [[Grappled]] condition. You can drag or carry it, at half Speed unless it is two or more sizes smaller."},
 "Shove":{c:"Special attack",d:"Replaces one attack of your [[Attack]] action. The target can be no more than one size larger than you and within reach. Your Strength ([[Athletics]]) check is contested by the target's Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check, its choice. If you win, you either knock it [[Prone]] or push it 5 feet away."},
 "Attack":{d:"Make one melee or ranged attack. Features such as Extra Attack add more attacks to this action. You can also interact with one object for free as part of your move or action."},
 "Help":{d:"Aid another creature. For a task it could attempt, it gains [[Advantage]] on its next ability check for that task if it makes it before your next turn. Or distract an enemy within 5 feet of you: the next attack roll an ally makes against that enemy before your next turn has Advantage."},
 "Hide":{d:"Make a Dexterity ([[Stealth]]) check while you are out of sight, such as behind cover or in heavy obscurement. The DM compares your result with the passive Wisdom ([[Perception]]) of anyone who could notice you."},
 "Search":{d:"Look for something. Make a Wisdom ([[Perception]]) or Intelligence ([[Investigation]]) check, depending on what you are looking for."},
 "Cast a Spell":{c:"Action",s:"PHB-2014, Combat",d:"Cast a spell with a casting time of 1 action. A spell with a longer time needs that much time. If you cast a spell as a [[Bonus Action]], the only other spell you can cast that turn is a cantrip with a casting time of 1 action."},
 "Use an Object":{c:"Action",s:"PHB-2014, Combat",d:"Use a second object on your turn, or one that needs your action, such as a [[Healer's Kit]], a lever, or a door lock. You can interact with one object for free as part of your move or action."},
 "Opportunity Attack":{d:"When a hostile creature you can see leaves your reach, you can use your [[Reaction]] to make one melee attack against it. It does not provoke if the creature took the [[Disengage]] action, teleported, or was moved without using its own movement, action, or reaction."},
 "Frightened":{d:"While the source of your fear is in line of sight, you have [[Disadvantage]] on ability checks and attack rolls, and you can't willingly move closer to it."},
 "Grappled":{d:"Your [[Speed]] is 0 and you can't gain bonuses to it. The condition ends if the grappler is [[Incapacitated]], or if something moves you out of the grappler's reach. You can use your action to escape: your Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check must beat the grappler's Strength ([[Athletics]]) check."},
 "Incapacitated":{d:"You can't take actions or reactions."}
};
export function gl14(on){ if(typeof GLOSS==="undefined")return;
 ({on}=gl14Step1(on)); if(on===GL14ON)return;
 if(on){ GL14S={}; const ks=Object.keys(GLOSS); Object.keys(GL14).forEach((k) =>{ if(ks.indexOf(k)<0)ks.push(k); });
  ks.forEach((k) => gl14Fn1(k)); GL14ON=true; }
 else if(GL14S){ Object.keys(GL14S).forEach((k) =>{ if(GL14S[k])GLOSS[k]=GL14S[k]; else delete GLOSS[k]; }); GL14S=null; GL14ON=false; } }
function gl14Fn1(k){ if(k==="Heavy"||k==="Light"||k==="Special")return;/* the equipment words (v93) keep their own copy */
 const _gl14Fn1Step1=gl14Fn1Step1(k);
 const {o, ov, ns}=_gl14Fn1Step1;
 let {nd}=_gl14Fn1Step1;
   if(!ov&&ns==null&&nd==null)return;
 gl14Fn1Step2(k, o, ov, ns, nd); }
function gl14Fn1Step1(k){
const o=GLOSS[k], ov=GL14[k], s0=o?String(o.s||""):"", ns=/PHB-2024/.test(s0)?(o.c==="Condition"?"PHB-2014, Appendix A":s0===RG?"PHB-2014, Rules":s0===PG?"PHB-2014, Adventuring and Combat":s0.replace("PHB-2024","PHB-2014")):null;   let nd=(o&&!ov&&o.d)?String(o.d).replace(/\s*Mastery: \[\[[^\]]+\]\]\./g,"").replace(/\[\[Utilize\]\]/g,"[[Use an Object]]").replace(/\[\[Magic\]\]/g,"[[Cast a Spell]]"):null; if(nd!=null&&nd===o.d)nd=null;
  return /** @type {any} */ ({o, ov, ns, nd});
}
function gl14Fn1Step2(k, o, ov, ns, nd){
GL14S[k]=o||null; const n=Object.assign({c:"Rule",s:"PHB-2014, Rules"},o||{},ov||{}); if(ns!=null&&!(ov&&ov.s))n.s=ns; if(nd!=null)n.d=nd; GLOSS[k]=n;
}
function gl14Step1(on){
on=!!on;
  return /** @type {any} */ ({on});
}
env.__gl14=gl14;
export var SL14={Barbarian:"Primal Path",Bard:"Bard College",Cleric:"Divine Domain",Druid:"Druid Circle",Fighter:"Martial Archetype",Monk:"Monastic Tradition",Paladin:"Sacred Oath",Ranger:"Ranger Archetype",Rogue:"Roguish Archetype",Sorcerer:"Sorcerous Origin",Warlock:"Otherworldly Patron",Wizard:"Arcane Tradition",Artificer:"Artificer Specialist"};
/* the group title: "Fighter Subclass: Champion" reads "Martial Archetype: Champion" in the 2014 rules */
export function gName(g){ g=String(g==null?"":g); if(!(typeof lateGet("C")!=="undefined"&&lateGet("C")&&lateGet("C").rs==="2014"))return g; const m=/^(\w+) Subclass: (.+)$/.exec(g); return m&&SL14[m[1]]?SL14[m[1]]+": "+m[2]:g; }
export function athI(){ const s=lateGet("C").skills||[]; for(let i=0;i<s.length;i++) if(s[i].n==="Athletics") return i; return -1; }
export function x14n(n){ return n==="Magic"?"Cast a Spell":n==="Utilize"?"Use an Object":n; }
export function x14(){ return typeof lateGet("C")!=="undefined"&&!!lateGet("C")&&lateGet("C").rs==="2014"; }
/* Exhaustion: 2024 takes 2 from every D20 Test and 5 feet of Speed per level. 2014 has six levels with fixed effects */
export function exSpd(v){ const e=(typeof lateGet("D")!=="undefined"&&lateGet("D")&&lateGet("D").exh)||0; return x14()?(e>=5?0:e>=2?Math.floor(v/2):v):Math.max(0,v-5*e); }
export function exTxt(n){ if(!x14())return "D20 Tests −"+(2*n)+", Speed −"+(5*n)+" ft"; let a=[]; a.push(n>=3?"Disadvantage on ability checks, attack rolls, and saves":"Disadvantage on ability checks"); if(n>=5)a.push("Speed 0"); else if(n>=2)a.push("Speed halved"); if(n>=4)a.push("Hit Point maximum halved"); if(n>=6)a=["Dead"]; return a.join(", "); }
export function exHelp(){ return x14()?"Six levels, each adds to the last: 1 checks, 2 Speed halved, 3 attacks and saves, 4 Hit Points halved, 5 Speed 0, 6 death.":"Each level: −2 to D20 Tests and −5 ft Speed. Level 6 is death."; }
/* Long Rest, 2014: Hit Dice come back up to half of the total (at least 1), the biggest dice first */
export function hdPlan(){ let rows=hdRows().slice().sort((a,b) =>{ return num(b.die,num(lateGet("C").hitDie,10))-num(a.die,num(lateGet("C").hitDie,10)); }), tot=rows.reduce((t,r) =>{return t+r.max},0), bud=Math.max(1,Math.floor(tot/2)), pl={}, sum=0;
 rows.forEach((r) =>{ const u=used(r.k,r.max), t=Math.min(u,bud); pl[r.k]=t; bud-=t; sum+=t; }); pl._n=sum; return pl; }
/* features that resource and action names point to */
GLOSS["Celurit (Sickle)"]=GLOSS["Sickle"];
HB_CONDS.forEach((c) =>{ GLOSS[c.k]={c:"Condition (homebrew)",s:HB_SRC,d:c.d}; });
const FEAT_ALIAS={"Second Wind":"Second Wind","Action Surge":"Action Surge","Tactical Mind":"Tactical Mind"};

export var NOTE_FIELDS = [
  {k:"backstory", l:"Backstory", h:"Write it in your own words", rows:6},
  {k:"personality", l:"Personality", h:"Traits, habits, the way your character talks", rows:3},
  {k:"ideal", l:"Ideals", h:"What your character fights for", rows:2},
  {k:"bond", l:"Bonds", h:"A person, place, or promise", rows:2},
  {k:"flaw", l:"Flaws", h:"A weakness the DM can play with", rows:2},
  {k:"appearance", l:"Appearance", h:"Description or face claim source", rows:2},
  {k:"session", l:"Session Notes", h:"Clues, NPC names, ritual ingredients", rows:5}
];

