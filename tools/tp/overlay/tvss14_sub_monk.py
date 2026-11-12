# Own-wording Monk traditions of Valda's Spire of Secrets, 2014 rules.
SUB = {
"Way of Street Fighting": {"spab": "Wisdom",
 "f": {
  "Combo": "On your turn, each hit you land on one target with an unarmed strike adds +2 to your later unarmed strike attack rolls against that target, up to +6. The bonus resets to 0 if you take damage on your turn.",
  "Iron Fist": "Your unarmed strikes and monk weapons ignore the damage threshold of objects and deal maximum damage to them.",
  "Special Moves": "You learn three special moves. Ki Blast: as an action, spend 2 ki to make a ranged spell attack (Wisdom) against a creature within 120 ft. On a hit it takes 6d8 + half your monk level Force damage. Uppercut: right after taking the Attack action, spend 1 ki to make an unarmed strike as a bonus action. On a hit, a Large or smaller target that is missing hit points takes the damage and falls Prone. Whirlwind Strike: when you make a melee attack against a creature you see, spend 1 ki to lunge up to 15 ft toward it first, without provoking opportunity attacks. You fall after the attack if you land with no ground under you.",
  "K.O.": "As an action, spend 3 ki and make an unarmed strike against a creature in reach. On a hit it takes the damage, and if it then has 100 hit points or fewer, it drops to 0 hit points, unconscious and stable."},
 "acts": {"Ki Blast": "action", "Uppercut": "bonus", "K.O.": "action"},
 "fx": [[3, "Combo", {"notes": [["Note", "Combo: +2 to unarmed strike attacks per earlier hit on that target this turn (max +6). Resets if you take damage"]]}]]},

"Way of the Bow": {"spab": "Wisdom",
 "f": {
  "Archery Fighting Style": "You gain a +2 bonus to attack rolls with ranged weapons. You cannot take a Fighting Style option more than once.",
  "Bow Arts": "You gain proficiency with the longbow and shortbow, and they count as monk weapons for you. Ranged weapon attacks you make within 5 ft of a hostile creature have no Disadvantage. You can spend ki on Flurry of Arrows and Soul Arrow. From level 6 you can make a ranged weapon attack to deliver a Stunning Strike. Flurry of Arrows: right after taking the Attack action with a ranged weapon or unarmed strike, spend 1 ki to make one extra ranged weapon attack as a bonus action. Soul Arrow: when you take the Attack action with a ranged weapon, spend 1 ki to fire a soul arrow for the first attack. It ignores partial cover, adds your Wisdom modifier to damage and uses no ammunition.",
  "Intercepting Shot": "When an attacker you see makes an attack against you, use your reaction to make a ranged attack roll. If your result beats the attacker's roll, reduce the attack roll against you by 5, to a minimum of 1.",
  "Serenity of The Wind": "As a bonus action, spend 1 ki to gain blindsight out to 120 ft until the end of your next turn. From level 17 you always have blindsight out to 30 ft.",
  "Zen Archery": "If you miss with a ranged weapon attack on your turn, you can immediately make another ranged weapon attack against the same target. This grants one extra attack per turn."},
 "acts": {"Intercepting Shot": "reaction", "Serenity of The Wind": "bonus"},
 "fx": [[3, "Archery Fighting Style", {"notes": [["Note", "Archery Fighting Style: +2 to attack rolls with ranged weapons"]]}]]},

"Way of the Flagellant": {"spab": "Wisdom",
 "f": {
  "Ascetic Implements": "You gain proficiency with the flail and whip, and they count as monk weapons for you. Your unarmed strikes can deal Slashing damage instead of Bludgeoning.",
  "Penitent Lash": "At the start of your turn, spend 1 ki and strike yourself with a ritual flail. You take 2d4 Slashing damage and gain Advantage on your first monk weapon or unarmed attack that turn. If you take 4d4 instead, you gain Advantage on all your attack rolls that turn. It does nothing if you reduce or avoid the damage.",
  "Art of Punishment": "You gain these techniques. Branding Palm: when you hit with an unarmed strike, spend 1 ki as a bonus action to brand the target. The next hit against it within 1 minute deals extra 2d8 Fire (3d8 at level 11, 4d8 at level 17). Electroshock Strike: right after taking the Attack action, spend 1 ki to cast shocking grasp as a bonus action, using Wisdom. Scissorhand Technique: when you deal Slashing damage with a monk weapon or unarmed strike, spend 1 ki to give the target a bleeding wound. Constructs, oozes and undead are immune. A creature loses 1d6 hit points per wound at the start of each of its turns unless it uses an action to staunch all wounds, and cannot regain hit points while bleeding. A creature holds up to your Proficiency Bonus in wounds.",
  "Purity Through Pain": "When you take damage greater than your character level, use your reaction to regain 1d4 ki. You can do this a number of times equal to your Wisdom modifier (minimum 1) and regain all uses on a Long Rest.",
  "Exsanguinate": "When you use Penitent Lash, you can take 6d4 Slashing damage instead. You gain all of its benefits, and your unarmed strikes deal extra 1d4 Slashing until the end of your turn."},
 "lu": [{"feature": "Purity Through Pain", "lvl": 11, "max": "mod:WIS", "reset": "long", "tag": "Reaction: regain 1d4 ki"}],
 "acts": {"Branding Palm": "bonus", "Electroshock Strike": "bonus", "Purity Through Pain": "reaction"}},

"Way of the Four Fists": {"spab": "Wisdom",
 "f": {
  "Grasp of The Monkey": "You gain a tail and gripping limbs. You have a climbing speed equal to your walking speed and double your jump distance. You have Advantage on ability checks and saves to climb, keep your balance and grip things like ledges or ropes. You can hold and use objects and weapons with hands, feet and tail, but you cannot attack with a weapon held by your tail.",
  "Simian Swift": "When you roll initiative and are not surprised, you can spend 1 ki to move up to half your speed or jump into the air, then make one unarmed strike.",
  "Nimbus": "As a bonus action, summon a cloud to ride. Until the start of your next turn you have a flying speed equal to your walking speed. At the start of each of your turns you can spend 1 ki to keep it. If you have nothing holding you aloft then, you fall.",
  "Uncanny Dodge": "When an attacker you see hits you, use your reaction to halve the damage.",
  "Flurry of Limbs": "When you use Flurry of Blows, you make three unarmed strikes instead of two."},
 "acts": {"Nimbus": "bonus", "Uncanny Dodge": "reaction"},
 "fx": [[3, "Grasp of The Monkey", {"mv": {"climb": "speed"}, "notes": [["Note", "Grasp of The Monkey: jump distance doubled. Advantage on checks and saves to climb, balance and grip"]]}]]},

"Way of the Mask": {"spab": "Wisdom",
 "f": {
  "Crowd Favorite": "You can add your Charisma modifier instead of your Wisdom modifier to your ki save DC. While you wear no armor and wield no shield, your AC equals 10 + your Strength modifier + your Charisma modifier.",
  "Heavyweight Champion": "You can try to grapple a creature of any size. As an action you can try to pin a creature you are grappling with another grapple check. On a success, you and the creature are both Restrained until the grapple ends. With the Grappler feat, you choose whether the target escapes with a Strength (Athletics) or Dexterity (Acrobatics) check.",
  "Signature Move": "Choose one move. You can name it yourself. Foreign Object: you are proficient with improvised weapons, which count as monk weapons for you. Once per turn, spend 1 ki to add half your monk level to an improvised weapon's damage. Headbutt of Justice: once per turn when you miss with an unarmed strike, spend 1 ki to make a second unarmed strike on the same target, with a damage die of d8. Infinity Suplex: while grappling a creature, spend 1 ki and a bonus action to end the grapple by slamming it down. Make an attack roll against it. On a hit it takes 2d10 + your Strength modifier Bludgeoning damage and falls Prone.",
  "Off The Top Rope": "Once per turn, when you fall 5 ft or more right before an unarmed strike, you can make a Stunning Strike without spending ki, or knock the target Prone and automatically grapple it on a hit.",
  "Choked Out": "When you pin a creature you are grappling, spend 2 ki to choke it. It makes a Constitution save with Advantage against your ki save DC. On a failure it is unconscious instead of Restrained until the start of your next turn."},
 "acts": {"Heavyweight Champion": "action", "Infinity Suplex": "bonus"},
 "fx": [[3, "Crowd Favorite", {"notes": [["Note", "Crowd Favorite: ki save DC may use Charisma. Unarmored AC 10 + Str + Cha (no shield)"]]}]],
 "acb": {"l": 3, "v": 10, "s": "Crowd Favorite", "abs": ["STR", "CHA"]}},

"Way of the Rose": {"spab": "Wisdom",
 "f": {
  "Blossom Burst": "Once per turn when you hit with an unarmed strike, spend 1 ki to release a burst of petals. Until the end of the target's next turn it sees only out to 5 ft and is Blinded beyond that. The petals follow it unless it takes the Dash action or moves over 40 ft on its turn.",
  "Sweet Aroma": "You smell of roses at all times. You have Advantage on Charisma (Persuasion) checks about love or romance. Creatures with Keen Smell or a similar trait have Disadvantage on ability checks to track you.",
  "Falling Petal Flurry": "When you use Flurry of Blows, you can spend 1 more ki to teleport up to 10 ft in any direction before, during or after the attacks. You cannot split the move.",
  "Colors of Love": "After a Long Rest, choose one aura of 5 ft radius that lasts until you choose another. Pink: you can use the Help action as a bonus action for an ally in the aura. Red: a friendly creature other than you in the aura can use its bonus action when it hits to deal extra 1d6 damage. White: when a friendly creature other than you ends its turn in the aura, it gains temporary hit points equal to your Wisdom modifier.",
  "Wreathed In Thorns": "When a creature you see within 5 ft damages you, spend 1 ki and use your reaction to make an unarmed strike against it."},
 "acts": {"Wreathed In Thorns": "reaction"}},
}
