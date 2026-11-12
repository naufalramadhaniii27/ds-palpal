# Own-wording Rogue archetypes of Valda's Spire of Secrets, 2014 rules. Spell tables come from the source.
SUB = {
"Arachnoid Stalker": {"spab": "",
 "f": {
  "Venomous Strike": "When you deal Sneak Attack damage, you can change the Sneak Attack dice to d8s and make the damage Poison.",
  "Webbing": "You can make silk web from your palms. As a bonus action, project a line of web to make a temporary rope, pull an unattended object, close doors, or snatch a small object under 10 lb within 60 ft. The line dissolves after 1 minute. If you aim it at a point you see within 60 ft, you can pull yourself to that point in a straight line. This uses movement and provokes opportunity attacks normally. When you fall, you can use your reaction to pull yourself up to 10 ft in any direction, or to make a web rope up to 60 ft long anchored to a point you choose.",
  "Wall Crawling": "You can move up, down and across vertical surfaces and upside down along ceilings with your hands free. You have a climbing speed equal to your walking speed. On a ceiling you can hide from any creature at least 10 ft below you even without cover.",
  "Web Walker": "You can cast web at will with no slot or components. Your save DC for it is 8 + your Dexterity modifier + your Proficiency Bonus. You ignore movement limits from webbing.",
  "Paralytic Venom": "When you use Venomous Strike to deal Poison Sneak Attack damage, you can force the target to make a Constitution save (DC 8 + your Dexterity modifier + your Proficiency Bonus). On a failure it is Paralyzed for 1 minute, and repeats the save at the end of each of its turns. Short or Long Rest to use again."},
 "acts": {"Webbing": "bonus"},
 "lu": [{"feature": "Paralytic Venom", "lvl": 17, "max": 1, "reset": "short", "tag": "Paralyze on a Poison Sneak Attack"}],
 "fx": [[9, "Wall Crawling", {"mv": {"climb": "speed"}}]]},

"Enforcer": {"spab": "",
 "f": {
  "Bonus Proficiencies": "You gain proficiency with medium armor and martial weapons.",
  "Brutal Attack": "You can make a Sneak Attack with any simple or martial melee weapon.",
  "Massive Shove": "When you make an attack, you can shove the target as a bonus action. On a success you can push it up to 15 ft instead of 5 ft. With a reach weapon you can use your bonus action to shove in reverse and pull the target toward you on a success.",
  "Threatening Demeanor": "When you roll initiative, choose a creature you see within 60 ft. It makes a Wisdom save (DC 8 + Proficiency Bonus + your Strength or Charisma modifier). On a failure it is Frightened of you for up to 1 minute. You have Advantage on attack rolls against it while it is Frightened. It repeats the save at the end of each of its turns.",
  "Double Attack": "When you reduce a creature to 0 hit points on your turn, use your bonus action to make another attack. It can be a Sneak Attack even if you already used one this turn."},
 "acts": {"Massive Shove": "bonus", "Double Attack": "bonus"}},

"Grifter": {"spab": "Charisma",
 "f": {
  "Double Bluff": "You can use Sneak Attack without Advantage on a creature if you are within 5 ft of it and also within 5 ft of another hostile creature.",
  "Swindle": "You gain proficiency with all gaming sets. You learn the cheat cantrip, using Charisma.",
  "Cut And Run": "When you take the Dash action, creatures have Disadvantage on opportunity attacks against you. When you take the Disengage action, you can move up to half your speed.",
  "Long Con": "After a Long Rest, choose one falsehood to rehearse, a single lie or a whole false history. You never need a Deception check for it. You recite it flawlessly until you rehearse another.",
  "Heist Plan": "You can take the Ready action as a bonus action. Its trigger must be a hostile creature taking a specific type of action, and cannot fire until your turn ends."},
 "acts": {"Heist Plan": "bonus"},
 "fx": [[3, "Swindle", {"notes": [["Note", "Swindle: proficient with all gaming sets. Knows the cheat cantrip (Charisma)"]]}]]},

"Shadow Master": {"spab": "",
 "f": {
  "Abyssal Eyes": "You gain Darkvision out to 60 ft. If you already have it, the range increases by 60 ft.",
  "Release Shadow": "As a bonus action, detach your shadow so it moves on its own. It is a flat, black silhouette of you that crawls along surfaces. It has AC 10, 1 hit point and immunity to all conditions. It is your size, can share spaces with creatures and uses your bonus on any save or interaction check. It acts on your turns. Command it to move up to 30 ft along walls or floor with no action. It does not attack, can interact with objects and counts as an ally for your Sneak Attack. It vanishes if it drops to 0 hit points, enters light from a spell of 1st level or higher, or is over 60 ft from you, and returns at your heels at the end of your next turn. In a heavily obscured area or magical darkness it is effectively invisible. It can pass for another creature's shadow, using your Charisma (Performance) or Charisma (Deception).",
  "Gloaming Black": "You can cast darkness with no slot or components and see through it. When your shadow enters the area, you can have it spread to fill the whole area. Short or Long Rest to use again.",
  "Shadow Puppet": "While your shadow is within 5 ft of another creature's shadow, use your bonus action to have it do one of these. Attack that shadow using Dexterity and your proficiency. On a hit against the creature's AC it takes 2d6 magical damage, of your carried weapon's type if Bludgeoning, Piercing or Slashing, otherwise Bludgeoning. Grapple that shadow using your Dexterity (Acrobatics). If it wins, the creature is grappled until the end of its next turn. Hook onto the creature's heels as a second shadow until the end of its next turn. If you see it attack in that time, use your reaction to make the shadow leap in and become the target.",
  "Shadowdance": "As a bonus action, swap places with your shadow, both teleporting in a dim haze. You can do it once more before the end of your turn with no bonus action. If you land in dim light or darkness, you have Advantage on your first melee attack this turn while there."},
 "acts": {"Release Shadow": "bonus", "Shadow Puppet": "bonus", "Shadowdance": "bonus"},
 "lu": [{"feature": "Gloaming Black", "lvl": 9, "max": 1, "reset": "short", "tag": "Cast darkness free"}],
 "fx": [[3, "Abyssal Eyes", {"notes": [["Note", "Abyssal Eyes: Darkvision 60 ft (+60 ft if you already have it)"]]}]]},

"Temporal Trickster": {"spab": "Intelligence",
 "f": {
  "Chrono-Master": "You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. You regain all on a Long Rest. The Time Magic table lists the spells and point costs, and you gain more spells at levels 9 and 13. Intelligence is your spellcasting ability and sets the save DC for these spells.",
  "Moment To Act": "You learn the moment to think cantrip, using Intelligence. When you cast it you can move 10 ft without provoking opportunity attacks. You can use your action while time is stopped to take the Hide action.",
  "Impressions of The Future": "As a bonus action, glimpse a possible future. Tell the GM what you plan to do on your turn. The GM describes the likely immediate results before the start of your next turn, including what you would see or hear. It can be wrong, since it ignores allies' actions and unexpected failed rolls. Short or Long Rest to use again.",
  "Time Dilation": "When you cast a spell with the chronomancy tag, including haste and slow, you gain +2 AC and +2 to Dexterity saves until the start of your next turn.",
  "Stop The Clock": "You can cast time stop once with no spell slot. Long Rest to use again."},
 "acts": {"Impressions of The Future": "bonus"},
 "lu": [{"feature": "Impressions of The Future", "lvl": 9, "max": 1, "reset": "short", "tag": "Glimpse the next turn"},
        {"feature": "Stop The Clock", "lvl": 17, "max": 1, "reset": "long", "tag": "Cast time stop free"}]},

"Titan Slayer": {"spab": "",
 "f": {
  "Knee Striker": "When you make a Sneak Attack on a creature larger than you, you can give up half your Sneak Attack dice (rounded down, minimum 1) to knock it Prone.",
  "Underfoot Combat": "While adjacent to a creature two or more sizes larger than you, use your bonus action to enter its space. You stay until it moves or you use a bonus action to step to an unoccupied space next to it. In a hostile creature's space you can use Sneak Attack against it if you do not have Disadvantage, even with no Advantage and no enemy of the target within 5 ft. You also gain cover while there, if it is two sizes larger, and three-quarters cover if it is three or more sizes larger.",
  "Confound The Big Folk": "You have Advantage on Dexterity (Stealth) checks to hide from and sneak past creatures larger than you. When you check to avoid, climb on or confuse a creature at least one size larger, and the check does not already use your Proficiency Bonus, add half your Proficiency Bonus.",
  "Fear No Monster": "You cannot be Frightened. When you roll initiative, you have Advantage on ability checks and saving throws until the end of your next turn.",
  "Fell The Giant": "Your weapon attacks against creatures at least one size larger than you score a critical hit on a roll of 19 or 20. Your critical hits also knock the target Prone."},
 "acts": {"Underfoot Combat": "bonus"},
 "fx": [[13, "Fear No Monster", {"notes": [["Note", "Fear No Monster: you cannot be Frightened. Advantage on checks and saves until end of your next turn after initiative"]]}]]},
}
