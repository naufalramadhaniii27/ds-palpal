# Own-wording class options of Tome of Heroes (2014 rules). INV rows: [name, text, minimum Warlock level, required pact]. MM rows: [name, text]. ISP: spells an invocation grants.
def P(lvl, patron, extra=""):
    return "**Prerequisite.** Level %d+ Warlock%s%s. " % (lvl, ", " + patron + " patron" if patron else "", ", " + extra if extra else "")
INV = [
 ["Chaotic Aegis", P(5, "Wyrdweaver") + "When you, or a creature targeting you, must roll dice and read a table to find the result of an effect, such as the confusion spell, you can use your Reaction to force a reroll. The new result stands. Finish a Short or Long Rest to use this again.", 5, ""],
 ["Chaotic Luck", P(3, "Wyrdweaver") + "When an attack hits you, you can use your Reaction to make the attacker reroll the damage dice. The new roll stands. Finish a Short or Long Rest to use this again.", 3, ""],
 ["Convulsions of the World", P(3, "") + "As a Magic action, shake the ground in a 20-foot radius around you. Each other creature there makes a Dexterity saving throw or falls Prone. You pick a number of creatures equal to half your Proficiency Bonus (round down) that pass automatically. Finish a Short or Long Rest to use this again.", 3, ""],
 ["Doom Hound", P(7, "Primordial", "Pact of the Chain") + "As a Bonus Action, your familiar changes into a stronger beast for 1 minute. It becomes a dire wolf at level 7, a winter wolf at level 12 and a hound of the night at level 18. Finish a Short or Long Rest to use this again.", 7, "Pact of the Chain"],
 ["Earthblood Geyser", P(15, "") + "You can cast Magma Spray at will, with no spell slot or material components.", 15, ""],
 ["Echo of the First Words", P(9, "Primordial") + "You can cast Babble once using a Warlock spell slot. Finish a Short or Long Rest to do so again.", 9, ""],
 ["Entangling Blast", P(5, "Primordial", "Eldritch Blast cantrip") + "When you hit a creature with Eldritch Blast, it makes a Dexterity saving throw or is Grappled by roots and vines until the end of its next turn. The save DC and the DC to escape equal your spell save DC.", 5, ""],
 ["Extinguishing Blast", "**Prerequisite.** Primordial patron, Eldritch Blast cantrip. When you hit a creature with Eldritch Blast, the light around it dims until the end of your next turn. Bright light within 10 feet of it becomes dim light.", 1, ""],
 ["Forest-Trained", "You gain proficiency in Nature and Survival.", 1, ""],
 ["Green Thumb", P(5, "Primordial") + "You can cast Plant Growth once using a Warlock spell slot. Finish a Short or Long Rest to do so again.", 5, ""],
 ["Improved Companion", P(12, "Animal Lords") + "When your patron sends a beast through your Patron Companion feature, you can choose a beast of challenge rating 3 or lower that fits your patron's beast type on the Animal Lords table.", 12, ""],
 ["Knowledge of the Wood", P(15, "Old Wood") + "While you are within 5 feet of a body of water in a forest, you can cast Scrying at will on any creature in that forest, with no spell slot or material components. You must stay within 5 feet of the water for the spell's duration or it ends.", 15, ""],
 ["Lurker in Gloom", P(7, "Hunter in Darkness") + "When you take damage while in bright light, you can use your Reaction to wrap yourself in shadow and gain Resistance to that damage. Finish a Short or Long Rest to use this again.", 7, ""],
 ["Patient Hunter", "**Prerequisite.** Hunter in Darkness patron, Pact of the Tome. After you identify a creature's tracks using your tome, you have Advantage on Wisdom (Perception) and Wisdom (Survival) checks to find and track it for the next 24 hours.", 1, "Pact of the Tome"],
 ["Primal Link", "You can cast Animal Friendship at will, with no spell slot or material components.", 1, ""],
 ["Shadow Arrow", P(12, "Hunter in Darkness", "Pact of the Blade") + "When you hit a creature with an arrow fired from your pact weapon, you can fire a second, shadow arrow at it as a Bonus Action. If that arrow hits, it deals Necrotic damage equal to the damage of the first arrow.", 12, "Pact of the Blade"],
 ["Silent Stalker", "You gain proficiency in Stealth and Survival.", 1, ""],
 ["Speaker for the Trees", P(9, "Old Wood") + "You can cast Speak with Plants at will, with no spell slot.", 9, ""],
 ["Touch of the Forest", P(9, "Old Wood") + "You can cast Awaken once using a Warlock spell slot. Finish a Short or Long Rest to do so again.", 9, ""],
]
ISP = {"Earthblood Geyser": "Magma Spray", "Primal Link": "Animal Friendship", "Speaker for the Trees": "Speak with Plants", "Knowledge of the Wood": "Scrying",
       "Green Thumb": ["Plant Growth", "Once per Long Rest"], "Touch of the Forest": ["Awaken", "Once per Long Rest"], "Echo of the First Words": ["Babble", "Once per Long Rest"]}
MAN = []
def C(n, t): return "**Cost.** %d Sorcery Point%s. %s" % (n, "" if n == 1 else "s", t)
MM = [
 ["Autonomous Spell", C(3, "When you cast a spell that needs Concentration, you can make it run without Concentration. For example, Detect Magic then lasts a flat 10 minutes. Only one autonomous spell can be active, and using this on a second ends the first.")],
 ["Bewildering Spell", C(2, "When you cast a spell that damages one creature, you flood its senses. It has Disadvantage on its next Intelligence, Wisdom or Charisma saving throw within the next minute.")],
 ["Concussive Spell", C(1, "When you cast a spell that damages a creature, you can push one target of the spell 10 feet away from you.")],
 ["Contingent Spell", "**Cost.** Variable. Pick a spell to trigger later. Spend Sorcery Points equal to the level of the slot you use to cast it. When the event you named happens, use your Reaction to trigger it. For example, cast Dimension Door with a 4th-level slot and 4 points, set to fire when a creature comes within 5 feet of you."],
 ["Emotional Spell", C(3, "When you cast a spell that lets its target make a Wisdom saving throw, you can change that save to Charisma.")],
 ["Enlightening Spell", C(1, "When you cast a spell that targets a creature, you learn one of its resistances or immunities. Each further use on the same creature reveals a new one.")],
 ["Fearful Spell", C(3, "When you cast a spell that damages a creature, you can make one target Frightened of you until the end of your next turn.")],
 ["Hidden Spell", C(2, "When you cast a spell whose duration is longer than instantaneous, you can hide its magical aura for the duration. Spells and effects such as Detect Magic or a chuul's Sense Magic cannot detect or identify it.")],
 ["Homing Spell", C(2, "When you cast a spell that damages one creature, you can target a creature that has Cover or that you cannot see, if you know it is there. You can target it, but the spell does not hit automatically. It still needs its save or attack roll.")],
 ["Hungry Spell", C(1, "When you cast a spell that damages a single target, add your Charisma modifier to the damage. If this reduces the creature to 0 Hit Points, you regain Hit Points equal to your Charisma modifier (minimum 1).")],
 ["Immaterial Spell", C(1, "You can cast a spell without its costly material components. Spend 1 Sorcery Point for every 100 gp of component cost.")],
 ["Insatiable Spell", C(5, "When you cast a spell on a creature that is immune to the spell's damage or effects, you ignore that immunity for this casting. The creature takes the spell as if it had no immunity and makes any saves as normal.")],
 ["Lingering Spell", "**Cost.** Sorcery Points equal to the spell's level. When you cast an instantaneous damaging spell that calls for a saving throw, you prolong it. A creature that failed the save must repeat it at the start of your next turn or take half the spell's damage."],
 ["Logical Spell", C(3, "When you cast a spell that lets its target make a Wisdom saving throw, you can change that save to Intelligence.")],
 ["Robust Spell", C(2, "A creature that must make an ability check to counter or dispel your spell has Disadvantage on that check.")],
 ["Sapping Spell", C(2, "Boost a spell's damage by spending up to half your remaining Hit Dice. Roll them and add the total to the damage. You then take damage equal to half the amount the dice added.")],
 ["Shared Hunger Spell", C(3, "When you cast a beneficial spell on a friendly creature, you empower its weapons. Its next weapon attack roll has Advantage. If it hits, you and it each regain Hit Points equal to your Charisma modifier (minimum 1).")],
]
