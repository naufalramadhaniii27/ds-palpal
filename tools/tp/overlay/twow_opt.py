# Own-wording class options of the World of Warcraft sourcebook (2024 rules).
# INV rows: [name, text, minimum Warlock level, prerequisite label]. MAN rows: [name, text]. Both join the app lists while the source is on (wxOpts).
SD = "one Superiority Die"
INV = [
 ["Pact of the Legion", "You learn Find Familiar and can cast it with the Magic action without a spell slot. The familiar you summon is a Fel Imp. When you take the Attack action, you can give up one of your attacks so the familiar makes one attack with its Reaction.", 1, ""],
 ["Call of the Void", "**Prerequisite.** Level 5+ Warlock, Pact of the Legion invocation. When you cast Find Familiar through Pact of the Legion, you can summon a Fel Imp or a Voidwalker. As a Bonus Action you can command the familiar to take the Attack action. The familiar uses your spell attack bonus for its attacks.", 5, "Pact of the Legion"],
 ["Curse of Corruption", "**Prerequisite.** Level 2+ Warlock. When an enemy starts its turn under a curse from a Warlock spell you cast, such as Hex, it makes a Charisma saving throw. On a failure it takes Necrotic damage equal to your Charisma modifier.", 2, ""],
 ["Expendable Minions", "**Prerequisite.** Level 9+ Warlock. When your familiar or a creature you summoned and control dies, you or another creature within 60 feet regains Hit Points equal to your Warlock level plus your Charisma modifier.", 9, ""],
 ["Health Funnel", "**Prerequisite.** Level 2+ Warlock. As a Bonus Action, spend any number of your unspent Hit Point Dice and roll them, adding your Charisma modifier to each die. Your familiar or another Fiend you command gains Temporary Hit Points equal to the total.", 2, ""],
 ["Legion Summoning", "**Prerequisite.** Level 9+ Warlock, Pact of the Legion invocation. You can cast Planar Binding without a spell slot. The creature you summon is a Felguard, a Felhound, an Incubus or a Succubus, and it becomes the spell's target. After you cast it this way, finish a Long Rest to do so again.", 9, "Pact of the Legion"],
 ["Master Demonologist", "**Prerequisite.** Level 5+ Warlock. Fiends you command deal the same extra damage to the target of your Hex spell that you do.", 5, ""],
]
MAN = [
 ["Battle Shout", "Bonus Action, spend " + SD + ": allies within 30 feet who can hear you are encouraged. Until the start of your next turn, each one adds the die to the damage of the next melee attack it hits with."],
 ["Demoralizing Shout", "Bonus Action, spend " + SD + ": enemies within 30 feet who can hear you are shaken. Until the end of your next turn, each one subtracts the die from the damage of the next melee hit it makes against a target other than you."],
 ["Heroic Leap", "Bonus Action, spend " + SD + ": jump a number of feet up to your Strength score. Creatures within 5 feet of where you land make a Strength saving throw. They take Bludgeoning damage equal to the die roll on a failure, or half on a success."],
 ["Mortal Strike", "When you hit a creature with an attack roll, spend " + SD + " and add it to the damage. The target cannot regain Hit Points until the end of your next turn."],
 ["Warding Maneuver", "Reaction, spend " + SD + ", while you wield a melee weapon or a Shield: when you or a creature you see within 5 feet is hit by an attack roll, add the die to the target's AC against that attack. If the attack still hits, the target has Resistance to its damage."],
]
