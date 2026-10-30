# Own-wording Dancer subclasses of Valda's Spire of Secrets (2024).
SUB = {
"Acrobat": {"spab": "",
 "f": {
  "Momentum": "While your Dance is active, you gain Momentum when you leave an enemy's reach and each time you move 15 feet on your turn. When you hit with a weapon or an Unarmed Strike, you can spend your Momentum to add one roll of your Dance Die to the damage, of the weapon's type. You can hold only one Momentum. You lose any unspent Momentum at the end of your turn.",
  "Aerial Acrobat": "**Charismatic Acrobatics.** You gain Acrobatics proficiency and add your Charisma modifier (minimum +1) to Acrobatics checks. **Aerialist.** You can use Dexterity instead of Strength to work out your jump distance. **Climber.** You gain a Climb Speed equal to your Speed.",
  "Tumbling": "While Agile Movement is your active Dance Style, you gain these benefits. **Fall Safely.** The first time you fall each turn, reduce the fall damage by 5 times your Dancer level. **Ignore Difficult Terrain.** Difficult Terrain costs you no extra movement. **Speed Increase.** Your Speed rises by 10 feet.",
  "Evasive Speed": "When you move 30 feet or more on your turn, you can take the Dodge action as a Bonus Action.",
  "Deadly Momentum": "You can hold up to three Momentum. While your Dance is active you do not lose Momentum at the end of your turn. When you hit with a weapon or an Unarmed Strike, you can spend up to three Momentum at once."},
 "acts": {"Evasive Speed": "bonus"},
 "fx": [[3, "Aerial Acrobat", {"skills": ["Acrobatics"], "notes": [["Note", "Aerial Acrobat: add Charisma modifier (min +1) to Acrobatics checks. Climb Speed equal to your Speed. Jump distance can use Dexterity"]]}]]},

"Cheerleader": {"spab": "",
 "f": {
  "Inspiring Chant [Dance Style]": "A 10-foot Emanation of inspiration surrounds you. When an ally in it fails a D20 Test, that ally can roll your Dance Die and add it to the D20, which may turn the failure into a success. An ally that rolls your Dance Die this way cannot do so again until the start of your next turn.",
  "Team Player": "**Cheerful.** You have Advantage on saves to avoid or end the Frightened condition. **Go Team!** When you take the Help action to aid an ally with a Strength (Athletics) or Dexterity (Acrobatics) check, that ally adds your Charisma modifier to the roll.",
  "Squad Warmup": "When you begin your Dance, choose a Dance Style other than Inspiring Chant. Each ally within 10 feet of you that can see or hear you gains that style's benefits until the start of your next turn.",
  "Athletic Dexterity": "When you make a Strength or Constitution save, you can make a Dexterity save instead. After you use this, you cannot use it again until you finish a Short or Long Rest. You can also restore it by expending a use of your Dance (no action).",
  "Spirited Start": "When you roll Initiative, you can give yourself and each ally within 60 feet that can see or hear you a special Heroic Inspiration that vanishes after the first round of combat. A creature can hold this one and another Heroic Inspiration at once, but can use only one Heroic Inspiration per roll."},
 "lu": [{"feature": "Athletic Dexterity", "n": "Athletic Dexterity", "lvl": 10, "max": 1, "reset": "short", "tag": "Free"}],
 "acts": {}},

"Contortionist": {"spab": "",
 "f": {
  "Unnatural Grace": "When you roll a 1 or 2 on a Dance Die on another creature's turn, you can use your Reaction to roll another Dance Die and add it to the roll. At Dancer level 11 this works on a 1, 2, or 3.",
  "Double Joints": "While your Dance is active, you are immune to the Grappled and Restrained conditions. You can also end the Prone condition on yourself without spending movement.",
  "Backbend": "You can enter the space of a Small or larger enemy and end your turn there. While in that space, you have Cover against attacks and effects that originate outside your space, and the creature cannot have Advantage on attack rolls against you.",
  "Twisting Redirection": "When a creature you can see misses you with a melee attack roll, you can use your Reaction to make the attack target a different creature within the attacker's reach. Use the same attack roll against the new target's AC. On a hit, it takes damage as normal. You can do this a number of times equal to your Dexterity modifier (minimum 1). A Short Rest returns one use and a Long Rest returns all of them.",
  "Reactive": "While your Dance is active, you have an extra Reaction that you regain at the start of each of your turns. You cannot take two Reactions on the same turn. Once you take a Reaction, such as an Opportunity Attack or a Reaction spell, you cannot take that same Reaction again until the start of your next turn."},
 "lu": [{"feature": "Twisting Redirection", "n": "Twisting Redirection", "lvl": 10, "max": "mod:DEX", "reset": "long", "tag": "Reaction"}],
 "acts": {"Unnatural Grace": "reaction", "Twisting Redirection": "reaction"}},

"Courtesan": {"spab": "",
 "f": {
  "Enthralling Movement [Dance Style]": "When you choose this style, and at the start of each of your turns while it is active, pick a creature within 30 feet that can see you. It makes a Wisdom save (DC 8 + your Charisma modifier + your Proficiency Bonus). On a failure, it is Charmed until the start of your next turn.",
  "Honeyed Words": "**Proficiencies.** You gain Deception and Persuasion proficiency. **Languages.** You learn two languages of your choice.",
  "Sociable Start": "On the first round of combat, you can take the Influence action as a Bonus Action and have Advantage on the ability check you make with it.",
  "Beguiling Charm": "When you give a creature the Charmed condition, you can pick one effect that lasts while it is Charmed. **Bad Influence.** It subtracts your Dance Die from its Intelligence, Wisdom, and Charisma saves. **Friend of My Friends.** It subtracts your Dance Die from all its attack rolls.",
  "Heartbreaker": "When a creature succeeds or fails its save against your Enthralling Movement, you can deal Psychic damage to it equal to two rolls of your Dance Die."},
 "acts": {"Sociable Start": "bonus"},
 "fx": [[3, "Honeyed Words", {"skills": ["Deception", "Persuasion"], "notes": [["Note", "Honeyed Words: you know two languages of your choice"]]}]]},

"Danseur Macabre": {"spab": "",
 "f": {
  "Danse Macabre [Dance Style]": "When you choose this style, and as a Bonus Action on later turns while it is active, you can summon Skeleton Spirits in unoccupied spaces within a 30-foot Emanation. The number of spirits you have cannot exceed your Charisma modifier (minimum 1). Each spirit you summon spends one use of this feature, which has uses equal to your Dancer level + your Charisma modifier. A Long Rest returns all uses. The spirits act on your turn. When you summon them, and as a Bonus Action on later turns, you can command each spirit to make an attack roll. They move when you do to stay within the Emanation. They share one Reaction between them, which one spirit can take each round. They vanish when the style ends. The Skeleton Spirit stat block is in the book.",
  "Ghoulish Calling": "**Darkvision.** You gain Darkvision out to 60 feet. If you already have it, its range grows by 60 feet. **Necrotic Resistance.** You have Resistance to Necrotic damage. **Undead Empathy.** When an Undead creature attacks you, it makes a Wisdom save (DC 8 + your Charisma modifier + your Proficiency Bonus). On a failure, its attack misses.",
  "Dance with the Dead": "You can cast Speak with Dead without a spell slot, using Charisma as the spellcasting ability. The corpse gains enough life to move and dance with you for the duration if it can. It goes where you ask but cannot act or deal damage. As a Bonus Action you can switch the target to another corpse in range. You can ask five questions in total, no matter how many corpses you target. After you use this, you cannot use it again until you finish a Short or Long Rest. You can also restore it by expending a use of your Dance (no action).",
  "Danse Fatale": "Your Danse Macabre style improves. **Avoidance.** If a Skeleton Spirit is subjected to an effect that allows a save for half damage, it takes no damage on a success and half on a failure. It cannot use this while Incapacitated. **Improved Spectral Bolt.** The damage of a Skeleton Spirit's Spectral Bolt becomes 1d6 Necrotic.",
  "Grim Troupe": "While Danse Macabre is active, when a creature you can see within 60 feet dies, you can use your Reaction to cast Create Undead on it without a spell slot or components. The Ghoul is under your control and follows these rules. **Charismatic Attacks.** Its attack bonus is your Charisma modifier + your Proficiency Bonus. **Choreographed Command.** When you use the Bonus Action of Danse Macabre, you can command the Ghouls in the same Bonus Action. **Rhythmic Unlife.** The Ghoul dies when Danse Macabre is no longer active."},
 "lu": [{"feature": "Dance with the Dead", "n": "Dance with the Dead", "lvl": 6, "max": 1, "reset": "short", "tag": "Magic action"}],
 "acts": {"Danse Macabre [Dance Style]": "bonus", "Dance with the Dead": "action", "Grim Troupe": "reaction"},
 "fx": [[3, "Ghoulish Calling", {"res": ["Necrotic"], "notes": [["Note", "Ghoulish Calling: Darkvision 60 ft (adds 60 ft if you already have it). Undead attackers make a Wisdom save or their attack misses"]]}]]},

"Dramaturge": {"spab": "CHA",
 "f": {
  "Spellcasting": "You cast Bard spells using Charisma. **Cantrips.** You know two Bard cantrips. Minor Illusion and Vicious Mockery are good picks. When you gain a Dancer level, you can swap one cantrip for another Bard cantrip. At Dancer level 10 you learn one more Bard cantrip. **Spell Slots.** The Dramaturge Spellcasting table shows your slots. A Long Rest restores them. **Prepared Spells.** At the start, prepare three level 1 Bard spells. Cure Wounds, Tasha's Hideous Laughter, and Silent Image are good picks. The Prepared Spells column shows how many you prepare as you level. They must be of a level you have slots for. When you gain a Dancer level, you can swap one prepared spell for another Bard spell you have slots for. **Focus.** You can use a Disguise Kit as a Spellcasting Focus for your Bard spells.",
  "Thespian": "**Disguise Kits.** You gain proficiency with the Disguise Kit. **Dramatic Flair.** When you make a Charisma (Performance) check, add your Dance Die to the roll if you do not already add it.",
  "Spotlight [Dance Style]": "Once on each of your turns while your Dance is active, when a creature within 60 feet succeeds on a save against one of your Bard spells, you can magically spotlight it. Roll your Dance Die and subtract the result from the creature's roll, which may turn the success into a failure.",
  "Arcane Strike": "When you take the Attack action, you can replace one of the attacks with a cast of a Bard cantrip that has a casting time of an action.",
  "Comedy and Tragedy": "You own a pair of enchanted masks. After a Short or Long Rest you can wear the Comedy Mask or the Tragedy Mask. Its benefits last until you remove it or swap it for the other. **Comedy Mask.** When an ally you can see or hear within 60 feet regains Hit Points or gains Temporary Hit Points, you can use your Reaction to regain or gain the same amount. **Tragedy Mask.** When an ally you can see or hear within 60 feet takes damage that leaves it Bloodied or at 0 Hit Points, you can use your Reaction to gain Resistance to that damage type until you finish a Short or Long Rest or use this benefit again.",
  "Encore": "When you take the Attack action while your Dance is active, you can cast a spell with a casting time of an action as a Bonus Action. After you use this, you cannot use it again until you finish a Short or Long Rest. You can also restore it by expending a use of your Dance (no action)."},
 "lu": [{"feature": "Encore", "n": "Encore", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Comedy and Tragedy": "reaction", "Encore": "bonus"},
 "fx": [[3, "Thespian", {"notes": [["Note", "Thespian: proficiency with the Disguise Kit. Add Dance Die to Charisma (Performance) checks"]]}]],
 "grant": {"f": "Thespian", "tools": [[3, "Disguise Kit"]]}},

"Fencer": {"spab": "",
 "f": {
  "Dueling Stance [Dance Style]": "When you hold a Melee weapon in one hand and no other weapons, you can add one roll of your Dance Die to damage rolls with that weapon.",
  "Panache": "You gain Persuasion proficiency and add your Dexterity modifier (minimum +1) to Persuasion checks.",
  "Fencing Maneuvers": "While your Dance is active, you can use these maneuvers. **Disarm.** As a Bonus Action, target a creature you can see within 5 feet. It makes a Strength save (DC 8 + your Dexterity modifier + your Proficiency Bonus). On a failure, it drops one held item of your choice, which lands in a space you choose within 10 feet of it. **En Garde.** As a Bonus Action, goad an enemy that can see or hear you. Until the start of your next turn, while it is within 5 feet of you, it has Disadvantage on attack rolls against creatures other than you. This ends early if your Dance ends. **Lunge.** As a Bonus Action, add 5 feet to your reach with weapons that lack the Two-Handed or Versatile property until the start of your next turn. This ends early if your Dance ends.",
  "Parry and Riposte": "When you use Graceful Dodge, you can use your Reaction to add another roll of your Dance Die to your AC against that attack. From Dancer level 11, if you use this and the attack misses you, you can use Graceful Retaliation as part of the same Reaction. You can do this a number of times equal to your Dexterity modifier (minimum 1). A Short Rest returns one use and a Long Rest returns all of them.",
  "Superior Flourish": "When you score a Critical Hit or reduce an enemy to 0 Hit Points on your turn, you regain up to 15 feet of spent movement and can make one extra attack. You can make up to three such extra attacks on a single turn."},
 "lu": [{"feature": "Parry and Riposte", "n": "Parry and Riposte", "lvl": 10, "max": "mod:DEX", "reset": "long", "tag": "Reaction"}],
 "acts": {"Fencing Maneuvers": "bonus", "Parry and Riposte": "reaction"},
 "fx": [[3, "Panache", {"skills": ["Persuasion"], "notes": [["Note", "Panache: add Dexterity modifier (min +1) to Persuasion checks"]]}]]},

"Fey Ballerina": {"spab": "",
 "f": {
  "Magic Slippers": "A magical trinket from a Fey creature, such as enchanted slippers, grants you supernatural grace. Difficult Terrain costs you no extra movement.",
  "Perfectionist": "**Flawless Footing.** If you end your Dance and took no damage while it was active, you regain the expended use of your Dance. **One Step Ahead.** You gain a +1 bonus whenever you roll a Dance Die.",
  "Misty Waltz": "You can cast Misty Step without a spell slot a number of times equal to your Charisma modifier (minimum 1). Charisma is your spellcasting modifier for it. A Short Rest returns one use and a Long Rest returns all of them.",
  "Sublime Start": "On the first round of combat, your Speed is doubled and you automatically succeed on saving throws.",
  "Swan Song": "While you are Bloodied and your Dance is active, you can begin a Swan Song as a Bonus Action. You regain Hit Points up to half your Hit Point maximum, and you have Advantage on the first D20 Test you make each turn until your Dance ends. After you use this, you cannot use it again until you finish a Long Rest."},
 "lu": [{"feature": "Misty Waltz", "n": "Misty Waltz", "lvl": 6, "max": "mod:CHA", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Swan Song", "n": "Swan Song", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Misty Waltz": "bonus", "Swan Song": "bonus"}},

"Fire Dancer": {"spab": "",
 "f": {
  "Pyrotechnics [Dance Style]": "Your weapons, Unarmed Strike, and Dancer features can deal Fire damage or their normal type. When you deal Fire damage and roll the highest number on a damage die, you can roll that die again and add it. If it is again the highest number, repeat. You can add a number of extra dice equal to your Charisma modifier (minimum 1).",
  "Flame Twirling": "**Fire Resistance.** You have Resistance to Fire damage. **Torch Juggler.** A lit Torch is a weapon for you. It is a Simple Melee weapon that deals 1d4 Fire damage plus the ability modifier used for the attack roll. It has the Light, Finesse, and Thrown (range 20/60 feet) properties. Its mastery is Nick or Vex. You can use either one, but only one per attack. They do not count against your Weapon Mastery choices.",
  "Fire Breather": "As a Magic action, you breathe flames in a 15-foot Cone. Each creature in it makes a Dexterity save (DC 8 + your Charisma modifier + your Proficiency Bonus). On a failure, a creature takes Fire damage equal to three rolls of your Dance Die + your Dancer level. On a success, it takes half. After you use this, you cannot use it again until you finish a Short or Long Rest. You can also restore it by expending a use of your Dance (no action).",
  "Blinding Flare": "Once on each of your turns while Pyrotechnics is your active style, when you deal damage to a creature and roll the highest number on a damage die, it makes a Constitution save (DC 8 + your Charisma modifier + your Proficiency Bonus). On a failure, it is Blinded until the start of your next turn.",
  "Inferno Breath": "Fire Breather improves. **Ignore Resistance.** Its damage ignores Resistance to Fire. **Improved Cone.** The Cone is 30 feet. **Burning.** Each creature that fails its save starts Burning. At the start of each of its turns it takes Fire damage equal to one roll of your Dance Die. As an action, a creature can put out the fire on itself by dropping Prone and rolling. The fire also goes out if the creature is doused, submerged, or suffocated."},
 "lu": [{"feature": "Fire Breather", "n": "Fire Breather", "lvl": 6, "max": 1, "reset": "short", "tag": "Magic action"}],
 "acts": {"Fire Breather": "action"},
 "fx": [[3, "Flame Twirling", {"res": ["Fire"], "notes": [["Note", "Flame Twirling: a lit Torch is a Simple Melee weapon for you, 1d4 Fire + ability modifier, Light, Finesse, Thrown (20/60), Nick or Vex mastery"]]}]]},

"Harlequin": {"spab": "",
 "f": {
  "Jest [Dance Style]": "When you choose this style, and as a Bonus Action on later turns while it is active, pick a creature within 15 feet to mock. If it can hear you (it need not understand you), it has Disadvantage on the next attack roll it makes against a creature other than you before the end of its next turn.",
  "Dagger Juggling": "**Juggling.** When you draw a weapon, you can begin juggling a number of weapons with the Thrown property, up to your Dexterity modifier (minimum 2). You count as holding all of them. Attacking at long range does not give you Disadvantage with weapons you juggle. **Papercut.** When you roll a 1 on any damage die, treat it as the highest number on that die.",
  "Backflip": "When you roll a Dance Die, you can flip it and use the number on the bottom. On a balanced die, the top and bottom add up to one more than its highest number. After you use this, you cannot use it again until the start of your next turn. You can use it a number of times equal to your Dexterity modifier (minimum 1). A Short Rest returns one use and a Long Rest returns all of them.",
  "Vexing Jest": "Your Jest style improves. **Losing Streak.** When the target of your Jest misses with an attack roll, it has Disadvantage on the next attack roll it makes before the start of your next turn. **Mocking Misfortune.** Until the start of your next turn, when the target of your Jest rolls a 20 on the d20 of a D20 Test, the roll becomes a 1.",
  "Deft Fling": "Once on each of your turns, when you miss a target with an attack roll, you can make one ranged attack against the same target with a weapon you are juggling."},
 "lu": [{"feature": "Backflip", "n": "Backflip", "lvl": 6, "max": "mod:DEX", "reset": "long", "tag": "Free"}],
 "acts": {"Jest [Dance Style]": "bonus"}},

"Marionettist": {"spab": "",
 "f": {
  "Familiar Doll": "You can cast Find Familiar, but only as a Ritual, using Charisma as the spellcasting ability. The familiar is a Construct that looks like a puppet or marionette of your choice.",
  "Puppet Strings [Dance Style]": "When you choose this style, and as a Bonus Action on later turns while it is active, pick a creature within 30 feet that can see you. It makes a Wisdom save (DC 8 + your Charisma modifier + your Proficiency Bonus). On a failure, it must immediately use its Reaction, if it has one, to make a melee attack against a creature other than itself that you choose mentally. If no creature is within its reach, the Reaction is wasted.",
  "Manipulator": "**Stringed Suggestion.** You can cast Suggestion as a Bonus Action without a spell slot, using Charisma as the spellcasting modifier. After you do, you cannot do so again until you finish a Long Rest. You can also restore it by expending a use of your Dance (no action). **Tangle of Lies.** When you make a Charisma (Deception) check, add your Dance Die if you do not already add it.",
  "Heartstrings": "When a creature fails its save against Puppet Strings, it is Charmed and has Disadvantage on attack rolls against your allies until the start of your next turn.",
  "Master of Puppets": "When a Beast or Humanoid fails its save against Puppet Strings, you can cast Dominate Beast or Dominate Person on it, as fits, without a spell slot. It automatically fails its save against the spell. Charisma is your spellcasting modifier for these spells. The spell ends early if Puppet Strings is no longer active. While the spell lasts, you cannot use the Bonus Action of Puppet Strings. From Dancer level 15, when any creature fails its save against Puppet Strings, you can use this to cast Dominate Monster. After you cast a spell with this feature, you cannot do so again until you finish a Long Rest. You can also restore it for Dominate Beast or Dominate Person by expending two uses of your Dance (no action)."},
 "lu": [{"feature": "Manipulator", "n": "Stringed Suggestion", "lvl": 6, "max": 1, "reset": "long", "tag": "Bonus Action"},
        {"feature": "Master of Puppets", "n": "Master of Puppets", "lvl": 14, "max": 1, "reset": "long", "tag": "Free"}],
 "acts": {"Puppet Strings [Dance Style]": "bonus", "Manipulator": "bonus"}},

"Mime": {"spab": "",
 "f": {
  "Pantomime [Dance Style]": "You become magically silent and objects you hold become Invisible. You have Advantage on the first melee attack roll you make on each of your turns.",
  "Silent Routine": "**Mimed Communication.** You can silently convey any sentence of 10 words or fewer to a creature that can see you and understands at least one language. **Sly.** You gain proficiency in Stealth or Sleight of Hand.",
  "Unseen Impact": "Once on each of your turns, when you hit a creature with a melee attack while Pantomime is your active style, you can give the target the Prone condition or push it up to 10 feet away from you.",
  "Invisible Wall": "You can cast Wall of Force without a spell slot or spell components, using Charisma as the spellcasting ability. After you use this, you cannot use it again until you finish a Long Rest. You can also restore it by expending two uses of your Dance (no action).",
  "Mystical Maul": "While Pantomime is your active style, when you roll damage with a Melee weapon that deals 1d4 or 1d6, you can deal 2d6 Force damage instead of its normal type."},
 "lu": [{"feature": "Invisible Wall", "n": "Invisible Wall", "lvl": 10, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Invisible Wall": "action"},
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "dancer_mime_sly", "feature": "Silent Routine", "title": "Sly", "list": [["Stealth", "Gain proficiency in Stealth."], ["Sleight of Hand", "Gain proficiency in Sleight of Hand."]]}]},

"Shadow Dancer": {"spab": "",
 "f": {
  "Nocturnal": "Roll or pick a Shadow Origin: 1 the ghost of a mentor or loved one, 2 a living curse from a shadow demon, 3 a manifestation of your darker impulses, 4 a Fey native to the Shadowfell, 5 the spirit of a long-dead hero, 6 your own shadow, clipped from your heels by magic scissors. **Charismatic Stealth.** You gain Stealth proficiency and add your Charisma modifier (minimum +1) to Stealth checks. **Darkvision.** You gain Darkvision out to 60 feet. If you already have it, its range grows by 60 feet.",
  "Shadowdance": "When you begin your Dance, you can use Shadowdance in place of Graceful Dodge. You create a shadowy duplicate that dances beside you in your space. When a creature hits you with an attack roll while the duplicate remains, roll your Dance Die. On a 3 or higher, the duplicate is hit instead and is destroyed. A creature is not affected if it has the Blinded condition, Blindsight, or Truesight. The duplicate vanishes when your Dance ends. It reappears at the start of each of your turns.",
  "Shrouded Start": "On the first round of combat, you have the Invisible condition. It ends right after you make an attack roll, deal damage, or cast a spell.",
  "Umbral Escape": "When the duplicate from Shadowdance is destroyed, you can use your Reaction to teleport up to 60 feet to an unoccupied space you can see that is entirely in Dim Light or Darkness.",
  "Vengeful Shadow": "When a creature destroys your Shadowdance duplicate, lingering shadowstuff covers it until the end of your next turn. You have Advantage on attacks against a creature covered this way, and when you hit one, you deal an extra 1d6 Necrotic damage."},
 "acts": {"Umbral Escape": "reaction"},
 "fx": [[3, "Nocturnal", {"skills": ["Stealth"], "notes": [["Note", "Nocturnal: add Charisma modifier (min +1) to Stealth checks. Darkvision 60 ft (adds 60 ft if you already have it)"]]}]]},

"Steelsinger": {"spab": "",
 "f": {
  "Steelsong Discipline": "**Charismatic Athletics.** You gain Athletics proficiency and add your Charisma modifier (minimum +1) to Athletics checks. **Defense.** You gain the Defense Fighting Style feat. **Martial Training.** You gain proficiency with Martial weapons and training with Medium armor and Shields.",
  "Deflection [Dance Style]": "When an attack hits you while your Dance is active and you hold a Shield or a Simple or Martial weapon, reduce the Bludgeoning, Piercing, and Slashing damage from that attack by one roll of your Dance Die.",
  "Armored Redirection": "When a creature you can see hits an ally within 5 feet of you with an attack roll, you can use your Reaction to make the attack target you instead. If the roll equals or exceeds your AC, it hits you. Otherwise it misses. After you use this, you cannot use it again until you finish a Short or Long Rest or begin your Dance.",
  "Improved Armored Deflection": "Your Deflection style improves. **Improved Deflection.** You can treat a roll of 1 to 3 on the Dance Die for Deflection as a 4. **Prismatic Deflection.** Deflection also reduces Acid, Cold, Fire, Lightning, Poison, and Thunder damage you take. If an attack deals one of those types along with Bludgeoning, Piercing, or Slashing, each type is reduced separately.",
  "Retaliatory Slam": "You can use Armored Redirection and Graceful Retaliation as part of the same Reaction. When you do, the target takes extra Bludgeoning damage equal to two rolls of your Dance Die on a hit."},
 "lu": [{"feature": "Armored Redirection", "n": "Armored Redirection", "lvl": 6, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Armored Redirection": "reaction"},
 "fx": [[3, "Steelsong Discipline", {"skills": ["Athletics"], "notes": [["Note", "Steelsong Discipline: add Charisma modifier (min +1) to Athletics checks. Defense Fighting Style feat. Martial weapons, Medium armor, and Shields"]]}]]},
}
