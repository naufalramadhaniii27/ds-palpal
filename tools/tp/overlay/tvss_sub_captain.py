# Own-wording Captain subclasses of Valda's Spire of Secrets (2024).
SUB = {
"Daggermark": {"spab": "",
 "f": {
  "Covert Tactics": "**Roguish Proficiencies.** You gain proficiency in Sleight of Hand and Stealth. **Charismatic Initiative.** Add your Charisma modifier (minimum +1) to your Initiative rolls. **Quick Hide.** You can take the Hide action as a Bonus Action.",
  "Effortless Dodge [Maneuver]": "Bonus Action: expend one Battle Die to take the Disengage or Dodge action. You cannot use this maneuver while wearing Medium or Heavy armor.",
  "Flanking Strike": "When you hit a creature with a weapon attack, the next attack roll an ally makes against that target before the end of your next turn has Advantage.",
  "Evasion": "When an effect lets you make a Dexterity saving throw for half damage, you take no damage on a success and half on a failure. You lose this while Incapacitated. Your Cohort gains this benefit too.",
  "Preemptive Strike": "Reaction: when a creature you can see within 30 feet attacks you, make one weapon attack against it. Resolve your attack before the triggering attack. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it."},
 "lu": [{"feature": "Preemptive Strike", "n": "Preemptive Strike", "lvl": 14, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Effortless Dodge [Maneuver]": "bonus", "Preemptive Strike": "reaction"},
 "fx": [[3, "Covert Tactics", {"skills": ["Sleight of Hand", "Stealth"], "notes": [["Note", "Covert Tactics: add Charisma modifier (min +1) to Initiative rolls. Hide is a Bonus Action"]]}]]},

"Demon Brand": {"spab": "",
 "f": {
  "Abyssal Arcana": "You can expend Battle Dice to cast spells with no spell slot. A spell cast this way has a duration of 1 minute if it would normally last longer. **1 Battle Die:** Detect Magic, Disguise Self, Expeditious Retreat, Silent Image. **2 Battle Dice:** Alter Self, Darkness, Darkvision, Detect Thoughts. **3 Battle Dice:** Dispel Magic, Nondetection, Tongues.",
  "Demon Cohort": "A demon lives inside you and acts as your Cohort. It is jealous, so you cannot gain another Cohort. It is not a separate creature and takes no turn of its own. Instead you transform into it. **Shape-Shift.** As a Bonus Action you can shape-shift into the demon or back. While shape-shifted, the Demon Cohort stat block replaces your game statistics, but you keep your Hit Points, Hit Point Dice, Intelligence, Wisdom, Charisma, class features, and feats. You choose whether your gear merges into the demon or is worn by it. **Temporary Hit Points.** While shape-shifted you have Temporary Hit Points equal to the demon's Hit Points, lasting until you return to normal. Any Temporary Hit Points you lose are also lost by the demon. If you run out of them or the demon drops to 0 Hit Points, you return to normal and cannot shape-shift again until the demon regains any Hit Points. **In Combat.** The demon takes no separate turn. **Restoring the Demon.** The demon gets the benefits of Short and Long Rests. Healing can target you or the demon while shape-shifted. When the demon regains Hit Points, your Temporary Hit Points rise by the same amount. If the demon drops to 0 Hit Points, it regains 1 Hit Point after 1 minute, so you can shape-shift again.",
  "Blindsight": "You have Blindsight with a 30-foot range, both shape-shifted and in your normal form.",
  "Instinctive Transformation": "Reaction: when you take damage, shape-shift into the demon or back. You have Resistance to the triggering damage. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Abyssal Regeneration": "At the start of each of your turns, the demon regains Hit Points equal to 5 + your Charisma modifier if it is Bloodied."},
 "lu": [{"feature": "Instinctive Transformation", "n": "Instinctive Transformation", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Demon Cohort": "bonus", "Instinctive Transformation": "reaction"},
 "fx": [[6, "Blindsight", {"notes": [["Note", "Blindsight 30 ft, in both forms"]]}]]},

"Dragon Banner": {"spab": "",
 "f": {
  "Critical Focus": "**Improved Critical.** Your weapon and Unarmed Strike attack rolls score a Critical Hit on a 19 or 20. **Chain Critical.** Each time you reduce an enemy to 0 Hit Points or score a Critical Hit against one, your crit range grows. After the first it is 18-20, after the second 17-20, and after the third 16-20. The range resets after 1 minute or when you are Incapacitated.",
  "Rampage [Maneuver]": "Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack roll, expend one Battle Die to move up to your Speed and make a melee attack (no action required). On a hit, add the die to the damage roll.",
  "Martial Recovery": "Bonus Action: regain all your expended Battle Dice. Once you use this, you cannot use it again until you finish a Long Rest.",
  "Bloody Spectacle": "When you reduce an enemy to 0 Hit Points or score a Critical Hit against one, you can terrify nearby foes. Each creature of your choice in a 30-foot Emanation from you makes a Wisdom saving throw against your Maneuver save DC. On a failure it has the Frightened condition for 1 minute, repeating the save at the end of each of its turns and ending the condition on a success. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Coup de Grâce [Maneuver]": "When you hit with a weapon or Unarmed Strike, expend two Battle Dice as a Bonus Action to try to execute the target. Add the dice to the damage roll. If you reduce the target to 0 Hit Points, the maneuver costs no Battle Dice."},
 "lu": [{"feature": "Martial Recovery", "n": "Martial Recovery", "lvl": 6, "max": 1, "reset": "long", "tag": "Bonus Action"},
        {"feature": "Bloody Spectacle", "n": "Bloody Spectacle", "lvl": 10, "max": 1, "reset": "short", "tag": "Free"}],
 "acts": {"Rampage [Maneuver]": "free", "Martial Recovery": "bonus", "Coup de Grâce [Maneuver]": "bonus"}},

"Eagle Banner": {"spab": "",
 "f": {
  "Close-Quarters Shooting": "Being within 5 feet of an enemy does not give Disadvantage on your attack rolls with Ranged weapons. Your Cohort gains this benefit too.",
  "Eagle Eye [Maneuver]": "Once per turn, when you miss with a ranged attack roll, expend one Battle Die and add it to the roll, which may turn the miss into a hit.",
  "Vantage Point": "**Climb Speed.** You have a Climb Speed equal to your Speed. **High Ground Shot.** You have Advantage on ranged attack rolls made from 15 feet or more above the target.",
  "Counter-Shot [Maneuver]": "Reaction: when an enemy you can see hits a creature with a ranged attack roll, expend one Battle Die to try to intercept it. You must hold a Ranged weapon, and the creature must be within its range. Subtract the die from the attack roll, which may turn the hit into a miss.",
  "Hundred-Arrow Volley": "When you take the Attack action with a Ranged weapon, you can replace one attack with a flurry of projectiles. **Arrow Rain.** Choose a point within weapon range. The shots fall in a 10-foot-radius, 40-foot-high Cylinder centered there. Make a separate ranged attack roll against each target in it. **Scatter Shot.** Fire into a 20-foot Cone and make a separate ranged attack roll against each target in it."},
 "acts": {"Eagle Eye [Maneuver]": "free", "Counter-Shot [Maneuver]": "reaction"}},

"Holy Icon": {"spab": "CHA",
 "f": {
  "Minor Miracle": "A creature you target with Rally regains Hit Points equal to two rolls of your Battle Die + your Charisma modifier. You can also use Rally on a creature at 0 Hit Points. From Captain level 10, Rally heals four rolls of your Battle Die + your Charisma modifier.",
  "Theological Studies": "**Charismatic Religion.** You gain proficiency in Religion and add your Charisma modifier (minimum +1) to Intelligence (Religion) checks. **Cantrips.** You learn two cantrips of your choice from the Cleric spell list. Charisma is your spellcasting ability for them.",
  "Zealous Fervor": "**Strength of Spirit.** When you use Blitz on an ally that has the Charmed or Frightened condition, it can reroll its save against the effect causing it and ends the condition on a success. **Radiant Strike.** When you use Blitz to have an ally attack, a hit deals an extra 1d6 Radiant damage.",
  "Aura of Reprieve": "Magic action: create a 15-foot Emanation from you that lasts 1 minute or until you are Incapacitated. When you or an ally starts a turn in it, that creature picks one benefit. **Temporary Hit Points:** gain 2d8. **Resistance:** gain Resistance to one damage type other than Bludgeoning, Piercing, or Slashing until the start of its next turn. **End Condition:** end Blinded, Deafened, Paralyzed, or Poisoned on itself. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend two Battle Dice (no action required) to restore it.",
  "Raise Cohort": "You can cast Raise Dead with no spell slot. If you revive a former Cohort, you cast it without Material components, and the creature becomes your Cohort again with no 8-hour initiation. After you use this, you cannot use it again until you finish a Long Rest."},
 "lu": [{"feature": "Aura of Reprieve", "n": "Aura of Reprieve", "lvl": 10, "max": 1, "reset": "short", "tag": "Magic Action"},
        {"feature": "Raise Cohort", "n": "Raise Cohort", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic Action"}],
 "acts": {"Aura of Reprieve": "action", "Raise Cohort": "action"},
 "fx": [[3, "Theological Studies", {"skills": ["Religion"], "notes": [["Note", "Theological Studies: add Charisma modifier (min +1) to Intelligence (Religion) checks"]]}]]},

"Jolly Roger": {"spab": "",
 "f": {
  "Scallywag": "You have a Swim Speed equal to your Speed. Your Cohort has a Swim Speed equal to its Speed.",
  "Skirmish [Maneuver]": "When you make a weapon attack, expend one Battle Die as a Bonus Action to make another attack later on the same turn, with the same weapon or a different one. One attack must be a melee attack roll and the other a ranged attack roll.",
  "Fancy Footwork": "When you hit a creature of Large size or smaller with a Melee weapon, you can force it to move to an unoccupied space within 5 feet of it, and you can move 5 feet. This movement does not provoke Opportunity Attacks.",
  "Dirty Tactics": "Once per turn, when you hit a creature with a Melee weapon, pick one effect. **Flank:** your Cohort has Advantage on its next melee attack roll against the target while you are within 5 feet of it, before the end of your next turn. **Pocket Sand:** the target has Disadvantage on its next attack roll before the end of your next turn. **Trip:** the target has the Prone condition if it is Large or smaller.",
  "All Hands on Deck": "Bonus Action: give orders to allies within 30 feet that can see or hear you. Each has Advantage on the next D20 Test it makes before the start of your next turn. You can use this a number of times equal to your Charisma modifier and regain all uses when you finish a Long Rest."},
 "lu": [{"feature": "All Hands on Deck", "n": "All Hands on Deck", "lvl": 14, "max": "mod:CHA", "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Skirmish [Maneuver]": "bonus", "All Hands on Deck": "bonus"},
 "fx": [[3, "Scallywag", {"notes": [["Note", "Scallywag: Swim Speed equal to your Speed"]]}]]},

"Lion Banner": {"spab": "",
 "f": {
  "Challenge [Maneuver]": "When you hit with a Melee weapon or an Unarmed Strike, expend one Battle Die as a Bonus Action to goad the target. Add the die to the damage roll. Until the start of your next turn, the target has Disadvantage on attack rolls against creatures other than you while you are within 5 feet of it.",
  "Commanding Presence": "If you use Born Leader and the check still fails, you do not expend the Battle Die.",
  "High Morale": "You can use Morale Boost when two or more creatures, you included, fail a saving throw against the same effect at the same time, such as a dragon's breath. Each creature that failed gains the benefit, and you expend only one Battle Die.",
  "Vengeful Gambit": "Reaction: when a creature under your Challenge maneuver hits you with an attack, you gain Resistance to the damage of that attack and make a weapon or Unarmed Strike attack against that creature as part of the same Reaction.",
  "Heroic Leadership": "When you use Bolster or Rally, the target gains Heroic Inspiration if it does not already have it."},
 "acts": {"Challenge [Maneuver]": "bonus", "Vengeful Gambit": "reaction"}},

"Siegeball Jersey": {"spab": "",
 "f": {
  "Sports Fanatic": "**Charismatic Athletics.** You gain proficiency in Athletics and add your Charisma modifier (minimum +1) to Strength (Athletics) checks. **Number One Fan.** You have Advantage on ability checks to recall information about a sport, its teams, and its players.",
  "Team Inspiration [Maneuver]": "Bonus Action: inspire another creature within 60 feet that can see or hear you by giving it one of your unexpended Battle Dice. A creature can hold only one die from this maneuver at a time. Once within the next minute, when it fails a D20 Test, it can roll the die and add the result to the d20, which may turn the failure into a success. The die is expended when rolled.",
  "Game Plan": "When you use Blitz, you can direct your Cohort or an ally within 60 feet to take a Reaction for one of these options. **Defensive Tackle:** move up to its Speed and use the Grapple or Shove option of its Unarmed Strike. **Go Long:** move up to twice its Speed. **Take Cover:** move up to its Speed and take the Hide action, with Advantage on its Dexterity (Stealth) check.",
  "Athletic Constitution": "When you make a Strength or Dexterity saving throw, you can make a Constitution saving throw with Advantage instead. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Game-Winning Play": "Reaction: when you drop to 0 Hit Points, delay the Unconscious condition. You immediately move up to twice your Speed without provoking Opportunity Attacks and take an action and a Bonus Action. Damage still causes Death Saving Throw failures, and three failures can still kill you. Afterward you have the Unconscious condition if you are still at 0 Hit Points. After you use this, you cannot use it again until you finish a Long Rest."},
 "lu": [{"feature": "Athletic Constitution", "n": "Athletic Constitution", "lvl": 10, "max": 1, "reset": "short", "tag": "Free"},
        {"feature": "Game-Winning Play", "n": "Game-Winning Play", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Team Inspiration [Maneuver]": "bonus", "Game-Winning Play": "reaction"},
 "fx": [[3, "Sports Fanatic", {"skills": ["Athletics"], "notes": [["Note", "Sports Fanatic: add Charisma modifier (min +1) to Strength (Athletics) checks"]]}]]},

"Skull Banner": {"spab": "",
 "f": {
  "Horrific Strike [Maneuver]": "When you hit with a Melee weapon or an Unarmed Strike, expend one Battle Die as a Bonus Action to terrify the target. Add the die to the damage roll. The target has the Frightened condition until the end of your next turn.",
  "Undead Cohort": "Instead of initiating a normal Cohort, you can perform an 8-hour ritual, which can happen during a Long Rest, to animate an Undead Cohort. Choose the Corporeal Undead or Incorporeal Undead stat block. You also pick the kind of Undead, such as a zombie or ghost, that fits the stat block.",
  "Undead Horde": "Bonus Action: cast Animate Dead with no spell slot, targeting the corpse of a Medium or Small Humanoid that died within the last minute. The Undead counts as your Cohort for your Captain features and uses your Charisma for attack and damage rolls. It lasts 10 minutes, then crumbles to dust.",
  "Sacrificial Thralls": "Reaction: when an attack targets you while an Undead you control is within 5 feet of you, command it to leap in the way so the attack targets the Undead instead. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Necromantic Burst": "Magic action: release negative energy in a 30-foot Emanation centered on a corpse you can see within 60 feet. Each creature you choose in it makes a Constitution saving throw against your Maneuver save DC, taking 10d8 Necrotic damage on a failure or half on a success. Undead you control in the Emanation gain Temporary Hit Points equal to half the Necrotic damage dealt. After you use this, you cannot use it again until you finish a Long Rest."},
 "lu": [{"feature": "Sacrificial Thralls", "n": "Sacrificial Thralls", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"},
        {"feature": "Necromantic Burst", "n": "Necromantic Burst", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic Action"}],
 "acts": {"Horrific Strike [Maneuver]": "bonus", "Undead Horde": "bonus", "Sacrificial Thralls": "reaction", "Necromantic Burst": "action"}},

"Star-Spangled Banner": {"spab": "",
 "f": {
  "Bull Rush [Maneuver]": "If you move at least 10 feet in a straight line toward a target right before hitting it with a melee attack roll, expend one Battle Die as a Bonus Action to Bull Rush. The target takes extra Bludgeoning damage equal to the die roll and must succeed on a Strength saving throw or be pushed 10 feet away from you and knocked Prone.",
  "Patriotism": "**Heroic Anthem.** You can cast Heroism with no spell slot. After you do, you cannot do so again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it. **Second Amendment.** You can use the mastery property of a third kind of weapon of your choice.",
  "Shield Fighter": "You can use a Shield as a weapon. When you throw it, it flies back to your hand whether it hits or misses. **Category:** Martial Melee. **Damage:** 1d8 Bludgeoning plus the ability modifier used for the attack roll. **Properties:** Finesse, Thrown (range 20/60 feet). **Mastery:** Push.",
  "Extra Attack": "You can attack twice instead of once when you take the Attack action on your turn. You cannot use Blitz and this feature on the same turn.",
  "Freedom of Movement": "You can cast Freedom of Movement on yourself and your Cohort with no spell slot.",
  "Wings of Liberty": "Bonus Action: transform into an embodiment of freedom, a red, white, and blue spirit shaped like a bald eagle carrying an enormous sword or gun, for 1 minute. After you use this, you cannot use it again until you finish a Long Rest, unless you expend three Battle Dice (no action required) to restore it. **Deft Maneuver.** Once on each of your turns you have an extra Bonus Action that can be used only for a maneuver. **Flight.** You have a Fly Speed of 30 feet and can hover. **Liberty or Death.** When you drop to 0 Hit Points without being killed outright, you can expend one Battle Die to instead drop to Hit Points equal to the number rolled + your Charisma modifier."},
 "lu": [{"feature": "Patriotism", "n": "Heroic Anthem", "lvl": 3, "max": 1, "reset": "short", "tag": "Heroism"},
        {"feature": "Wings of Liberty", "n": "Wings of Liberty", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Bull Rush [Maneuver]": "bonus", "Wings of Liberty": "bonus"}},

"Tower Banner": {"spab": "",
 "f": {
  "Iron Wall [Maneuver]": "Bonus Action: expend one Battle Die to fortify yourself. The next time you are hit by an attack within the next minute, roll the die and add the result to your AC against that attack, which may turn the hit into a miss. This ends early if you are Incapacitated. You must wear Heavy armor to use this maneuver.",
  "Siege Defense": "**Defensive Tactics.** When you attack with a Melee weapon whose mastery property you can use, you can replace that property with Push or Slow for that attack. **Shooting from Cover.** You gain a +2 bonus to ranged attack rolls while you have Cover.",
  "Armored Redirection": "Reaction: when a creature you can see hits an ally within 5 feet of you with an attack roll, force the attack to target you instead. If the roll equals or exceeds your AC, it hits you. Otherwise it misses. After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Mettle": "When an effect lets you make a Constitution saving throw for half damage, you take no damage on a success and half on a failure. You lose this while Incapacitated. Your Cohort gains this benefit too.",
  "Iron Retribution": "When a creature within 5 feet of you misses you with an attack roll, you can strike it with a Shield you are carrying (no action required), dealing 3d6 Bludgeoning damage."},
 "lu": [{"feature": "Armored Redirection", "n": "Armored Redirection", "lvl": 6, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Iron Wall [Maneuver]": "bonus", "Armored Redirection": "reaction", "Iron Retribution": "free"}},

"Yellow Sign": {"spab": "",
 "f": {
  "Eldritch Herald": "**Outer Knowledge.** When you finish a Long Rest, you gain proficiency and Expertise in a skill chosen by the GM. The GM can change it after each Long Rest. **Enthralled.** You and your Cohort have Advantage on saving throws to avoid or end the Charmed and Frightened conditions.",
  "Frenzied Strike [Maneuver]": "When you hit with a Melee weapon or an Unarmed Strike, expend one Battle Die as a Bonus Action to infect the target's mind. The target has the Frenzied condition until the end of its next turn. A Frenzied creature cannot tell friend from foe and treats every creature it can see as an enemy. It picks the targets of its attacks, spells, and abilities at random among creatures it can see in range, and it must make an Opportunity Attack if any creature provokes one.",
  "Pallid Aura": "Bonus Action: trace the Yellow Sign to create a 10-foot Emanation of psychic energy centered on you for 1 minute or until you are Incapacitated. Once per turn, when a creature in the Emanation makes a D20 Test, you can roll 1d6 and subtract it from the roll (no action required). After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no action required) to restore it.",
  "Maniacal Influence": "**Frenzied Ally.** A creature with the Frenzied condition from your Frenzied Strike regards you and your Cohort as allies while it has the condition. **Frenzied Blitz.** When you use Blitz, you can direct a creature with that Frenzied condition, even though it is not an ally. **Extended Frenzy.** When a creature with that Frenzied condition ends its turn, it makes a Wisdom saving throw against your Maneuver save DC. On a failure the condition does not end. On a success it ends.",
  "Nightmarish Glow": "While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike."},
 "lu": [{"feature": "Pallid Aura", "n": "Pallid Aura", "lvl": 6, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Frenzied Strike [Maneuver]": "bonus", "Pallid Aura": "bonus"}},
}
