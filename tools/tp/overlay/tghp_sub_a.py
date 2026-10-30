# Own-wording subclasses of Grim Hollow Player's Guide (2024): Barbarian, Bard, Cleric, Druid.

TALENTS = [
 ["Barbarian", "Bonus Action while not in Heavy armor: rampage for 1 minute. You have Resistance to Bludgeoning, Piercing and Slashing damage, but you cannot keep Concentration. It ends early if you use a Bonus Action or become Incapacitated. Long Rest to use again."],
 ["Cleric", "Bonus Action: pick a creature within 30 ft. For 10 minutes it gains Temporary HP equal to half your Bard level plus your Charisma modifier. When it hits with a weapon or Unarmed Strike, it can lose all those Temporary HP to deal that much extra Radiant damage. Short or Long Rest to use again."],
 ["Druid", "Cast Polymorph with no slot, on yourself only. The Beast's maximum Challenge Rating is half your Druid level. Long Rest to use again."],
 ["Fighter", "You gain martial weapon proficiency and Shield training. You also gain a Fighting Style feat of your choice."],
 ["Monk", "While you wear no armor and hold no Shield, your base AC is 10 plus your Dexterity and Charisma modifiers. You can use Dexterity for Unarmed Strike attack and damage rolls, and roll 1d6 for its damage. After you cast an action spell or take the Attack action, you can make one Unarmed Strike as a Bonus Action."],
 ["Paladin", "Once per turn when you hit with a melee weapon or Unarmed Strike attack, spend a spell slot to add 1d6 Radiant damage plus 1d6 per slot level. Add another 1d6 against a Fiend or Undead. Short or Long Rest to use again."],
 ["Ranger", "Hunter's Mark is always prepared. You can cast it once using a level 5 slot you don't spend. Long Rest to use again."],
 ["Rogue", "On your turn, you can take Dash, Disengage or Hide as a Bonus Action."],
 ["Sorcerer", "Pick one Metamagic option: Careful, Distant, Empowered, Extended, Seeking, Subtle or Transmuted Spell. When you cast a Bard spell, apply it without paying Sorcery Points. Short or Long Rest to use again."],
 ["Warlock", "You learn one Eldritch Invocation. Use your Bard level for any level requirement. When you gain a Bard level, you can swap one of these invocations for another you qualify for."],
 ["Wizard", "Prepare any two Wizard spells of a level you can cast. They count as Bard spells and don't count against your prepared spells. When you gain a Bard level, you can swap one of them."],
]

def _t(l, key, title):
    return {"l": l, "k": "opts", "n": 1, "key": key, "feature": "Talented Adventurer", "title": title, "list": [list(x) for x in TALENTS]}

SUB = {
"Path of the Fractured": {"spab": "",
 "f": {
  "Face of Rage": "Raging twists your face and swells your body, and creatures that haven't seen you change don't recognize you. While Raging: your Unarmed Strike can use 1d8 for damage and deal Force or its normal type. When an Unarmed Strike hits, you can push the target 10 ft or force a Constitution save (DC 8 plus Strength modifier plus Proficiency Bonus) to knock it Prone. You count as one size larger for Grapples, and your Unarmed Strike reach is 5 ft greater.",
  "Mask of Civility": "Gain proficiency in one skill from Arcana, History, Investigation, Medicine, Nature, Persuasion or Religion. Also gain proficiency with one Artisan's Tools or learn one language.",
  "Brains and Brawn": "While not Raging you have Resistance to Psychic damage. While Raging you have Resistance to every damage type except Force and Psychic.",
  "Cunning and Brutal": "While not Raging, you can take Disengage or Help as a Bonus Action. While Raging, your Unarmed Strike attacks crit on a 19 or 20.",
  "Better Half": "When you drop to 0 HP without being killed outright, you can drop to 1 HP instead and gain Temporary HP equal to half your HP maximum. Any left after 1 minute vanish. If you were Raging, the Rage ends. If not, you start Raging at once, even with no uses left. Long Rest to use again."},
 "lu": [{"feature": "Better Half", "lvl": 14, "max": 1, "reset": "long", "tag": "Drop to 1 HP"}],
 "acts": {},
 "fx": [[6, "Brains and Brawn", {"res": ["Psychic"], "notes": [["Note", "Brains and Brawn: while Raging, Resistance to every damage type except Force and Psychic"]]}]]},

"Path of the Primal Spirit": {"spab": "CON",
 "f": {
  "Primal Companion": "You summon a primal spirit in beast form. Pick its stat block (Primal Guardian or Primal Striker), an environment (Land, Sea or Sky) and an animal kind that fits. It bears otherworldly markings, is Friendly to you and your allies, obeys you, and vanishes if you die. **In combat.** It acts on your turn and can move and use its Reaction freely. Its only action is Dodge unless you use a Bonus Action to command another action, or give up one of your attacks in the Attack action to command Beast's Strike. If you are Incapacitated it acts on its own with full freedom. **Restoring or replacing.** If it died within the last hour, a Magic action and one Rage use brings it back with full HP. After a Long Rest you can summon a different one within 5 ft, which replaces the old one.",
  "Shared Rage": "While you are Raging, your primal companion has Resistance to Bludgeoning, Piercing and Slashing damage.",
  "Kin to Beasts": "Animal Friendship and Speak with Animals are always prepared. You can cast each once with no slot, then need a Short or Long Rest to do so again. You can also cast them with slots. Constitution is your spellcasting ability for them.",
  "Skinrider's Trance": "Magic action: enter a trance and possess your primal companion or a Beast within 60 ft affected by your Animal Friendship. You control it. Your HP, Hit Point Dice, Strength, Dexterity, Constitution, Speed and senses become its, and you keep the rest. The trance ends if you choose (no action), the Beast drops to 0 HP, or you are on a different plane. Your body is catatonic, you can't move or take Reactions, and you are unaware of your surroundings. It lasts up to half your Barbarian level plus your Constitution modifier in hours. Long Rest to use again, or spend a Rage use (no action).",
  "Shape of the Wild": "Bonus Action: give your primal companion a new form at once. Its current HP becomes its new HP maximum. Short or Long Rest to use again, or spend a Rage use (no action)."},
 "lu": [{"feature": "Skinrider's Trance", "lvl": 10, "max": 1, "reset": "long", "tag": "Magic action"}, {"feature": "Shape of the Wild", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Skinrider's Trance": "action", "Shape of the Wild": "bonus"}},

"Path of the Wrathful Dead": {"spab": "CON",
 "f": {
  "Final Night Catharsis": "You feel an emotion a nearby spirit felt at death. Pick one, and swap it after a Long Rest. **Hate.** After you miss a creature with an attack, you have Advantage on your next attack against it before the end of your next turn. **Jealousy.** When a creature you have Grappled is about to make a check to end the Grapple, use a Reaction to give it Disadvantage. **Terror.** While Bloodied, you can Dash or Disengage as a Bonus Action.",
  "Rage of the Dead": "While Raging, you take on ghostly traits. **Shadow Form.** You ignore Difficult Terrain and can move through other creatures' spaces but can't end there. **Shadowy Sidestep.** Speed +10 ft, and Opportunity Attacks against you have Disadvantage. **Spectral Sight.** You see Invisible creatures and objects within 120 ft as if visible, and you see into the Ethereal Plane.",
  "Dark Doom Revisited": "Once per Rage, Magic action: channel a gruesome death and pick one effect. At the start of each affected creature's turn it makes the save. Roll a number of d6s equal to your Rage Damage bonus for the damage. **Contamination.** 10-ft Emanation, Constitution save (DC 8 plus Constitution modifier plus Proficiency Bonus). Fail: Poison damage and Poisoned for 1 minute. An affected creature can use an action to end it. **Hypothermia.** 10-ft Emanation, Constitution save (DC 8 plus Strength modifier plus Proficiency Bonus). Fail: Cold damage and Speed halved for 1 minute. A creature can use an action to end it. **Immolation.** 15-ft Emanation, Dexterity save (DC 8 plus Constitution modifier plus Proficiency Bonus). Fail: Fire damage. A creature can put out the fire with an action by dropping Prone and rolling. Dousing, submerging or suffocating it also works.",
  "Death Is but a Door": "**Hard to Kill.** You have Advantage on Death Saving Throws and need four failures to die. **Return the Spirit.** Cast Cure Wounds, Revivify or Raise Dead with no Material components, gaining Exhaustion levels: 1 for Cure Wounds, 2 for Revivify, 3 for Raise Dead. Constitution is your spellcasting ability for it. Long Rest to use again, or spend two Rage uses (no action).",
  "Powered by Pathos": "Your Final Night Catharsis grows. **Hate.** While Raging, your weapon and Unarmed Strike attacks crit on a 19 or 20. **Jealousy.** While Raging, when a creature you see starts its turn within 30 ft, use a Reaction to have spectral hands grab it. It makes a Strength or Dexterity save (DC 8 plus Constitution modifier plus Proficiency Bonus). Fail: Grappled until the end of its turn. Success: each foot of movement costs 1 extra foot until the end of its turn. **Terror.** While Raging, when a creature you see starts its turn within 30 ft, use a Reaction to terrify it until the start of its next turn. Its Speed is halved and Opportunity Attacks against it have Advantage."},
 "lu": [{"feature": "Death Is but a Door", "lvl": 10, "max": 1, "reset": "long", "tag": "Return the Spirit"}],
 "acts": {"Dark Doom Revisited": "action", "Death Is but a Door": "other"},
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "wd_emotion", "feature": "Final Night Catharsis", "title": "Final Night Catharsis",
  "list": [["Hate", "After you miss a creature with an attack, you have Advantage on your next attack against it before the end of your next turn. Level 14: while Raging, your weapon and Unarmed Strike attacks crit on a 19 or 20."],
           ["Jealousy", "When a creature you have Grappled is about to make a check to end the Grapple, use a Reaction to give it Disadvantage. Level 14: while Raging, use a Reaction when a creature starts its turn within 30 ft to Grapple it with spectral hands (Strength or Dexterity save, DC 8 plus Constitution modifier plus Proficiency Bonus. On a success it pays 1 extra foot per foot moved)."],
           ["Terror", "While Bloodied, you can Dash or Disengage as a Bonus Action. Level 14: while Raging, use a Reaction when a creature starts its turn within 30 ft to terrify it until the start of its next turn (Speed halved, Opportunity Attacks against it have Advantage)."]]}]},

"College of Adventurers": {"spab": "CHA",
 "f": {
  "Party Planner": "While a creature holds a Bardic Inspiration die from you, it can take the Help action as a Bonus Action.",
  "Talented Adventurer": "Learn one adventurer's talent, a feature borrowed from another class (see the list). You learn another at Bard levels 6 and 14.",
  "Well-Rounded": "Gain proficiency with one Artisan's Tools, proficiency in one skill, and one language of your choice.",
  "Improvisational Talent": "After a Long Rest, replace one adventurer's talent you know with one you don't."},
 "pick": [_t(3, "adv_talent3", "Adventurer's talent (1st)"), _t(6, "adv_talent6", "Adventurer's talent (2nd)"), _t(14, "adv_talent14", "Adventurer's talent (3rd)")],
 "acts": {}},

"College of Fools": {"spab": "CHA",
 "f": {
  "Antagonistic Antics": "You know Vicious Mockery, which doesn't count against your cantrips known. If you already know it, learn a different Bard cantrip instead. Dissonant Whispers is always prepared. When you take Dash, Disengage or Influence on your turn, you can cast Vicious Mockery as a Bonus Action that turn.",
  "Cruel Jest": "Reaction: when a creature you see or hear within 30 ft fails a D20 Test, spend a Bardic Inspiration use. Roll the die and deal Psychic damage equal to the roll plus your Charisma modifier. The creature also has Disadvantage on its next D20 Test before the end of its next turn.",
  "Gallows Humor": "Reaction: when a creature you see within 60 ft drops to 0 HP or dies, regain one expended Bardic Inspiration use. Pick a creature within 30 ft that can hear and understand you. It makes a Wisdom save against your spell save DC. Fail: Prone and Speed 0 until the end of its next turn. Success: you regain the use of this feature. Otherwise Short or Long Rest to use again.",
  "Last Laugh": "Reaction when you become Bloodied or take damage while Bloodied: regain all expended Bardic Inspiration and burst into fatalistic laughter. For 1 minute you have Resistance to all damage. Also when a creature within 60 ft hits you with an attack, spend up to three Bardic Inspiration dice to force a Charisma save against your spell save DC. Fail: Psychic damage equal to the total rolled plus your Charisma modifier. Long Rest to use again."},
 "lu": [{"feature": "Gallows Humor", "lvl": 6, "max": 1, "reset": "short", "tag": "Reaction"}, {"feature": "Last Laugh", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Cruel Jest": "reaction", "Gallows Humor": "reaction", "Last Laugh": "reaction"}},

"College of Requiems": {"spab": "CHA",
 "f": {
  "Chilling Melody": "Learn two Necromancy cantrips of your choice. They count as Bard spells but not against your cantrips known.",
  "Pluck the Heartstrings": "A creature holding a Bardic Inspiration die from you can use it in one of two ways. **Defense.** When it drops to 0 HP without being killed outright, it rolls the die and is reduced to that many HP instead. **Offense.** Right after it hits with an attack roll, it rolls the die and adds the result as extra Necrotic damage.",
  "Stir the Bones": "Animate Dead is always prepared and counts as a Bard spell. When you spend a Bardic Inspiration use, pick Undead you control within 60 ft, up to your Charisma modifier in number (minimum 1). Each gains a Bardic Inspiration die that doesn't count against your limit. When such an Undead spends the die on an attack roll, it also adds the roll to that attack's damage if it hits.",
  "Dual Death": "When you cast a Necromancy spell that targets one creature only, it can also target a second creature within range. Long Rest to use again, or spend one Bardic Inspiration die (no action)."},
 "lu": [{"feature": "Dual Death", "lvl": 14, "max": 1, "reset": "long", "tag": "Second target"}],
 "acts": {}},

"Eldritch Domain": {"spab": "WIS",
 "f": {
  "Eldritch Domain Spells": "Spells that are always prepared from the listed Cleric level: 3 Detect Thoughts, Tasha's Hideous Laughter, See Invisibility, Sleep. 5 Fear, Tongues. 7 Confusion, Phantasmal Killer. 9 Contact Other Plane, Dream.",
  "Eldritch Contagion": "When you use a Magic action to cast a spell with a slot that targets creatures, you can force one target to make a Wisdom save against your spell save DC. On a fail, roll a d8 on the Eldritch Effects table and the target suffers that effect for 1 minute, repeating the save at the end of each of its turns to end it. Using this feature again ends the earlier effect. **Eldritch Effects.** 1 Can't speak or cast spells with Verbal components. 2 Takes 1d6 Psychic damage at the start of each turn. 3 Disoriented: moving more than 5 ft for anything but standing up makes it Prone. 4 Disadvantage on attack rolls and Wisdom (Perception) checks. 5 Takes an action or a Bonus Action, not both, and makes only one attack with the Attack action. 6 Has Advantage on attack rolls, and attack rolls against it have Advantage. 7 Deafened and can't see beyond 30 ft. 8 Frightened.",
  "Prophecy of Doom": "Magic action and one Channel Divinity use: pick a point within 120 ft that you see and roll on the Eldritch Effects table (see Eldritch Contagion). Each creature in a 15-ft-radius Sphere there makes a Wisdom save against your spell save DC. On a fail it suffers the effect for 1 minute, repeating the save at the end of each of its turns.",
  "Otherworldly Calm": "You have Resistance to Psychic damage and Advantage on saves to avoid or end Charmed and Frightened. Your thoughts can't be read by telepathy or other means unless you allow it. A creature that tries automatically fails and must succeed on a Wisdom save against your spell save DC or take Psychic damage equal to your Cleric level.",
  "Sing the Song that Ends the World": "When a creature fails its save against Prophecy of Doom, you can deal 10d10 Psychic damage to it. It is then immune to this damage for 10 minutes."},
 "acts": {"Eldritch Contagion": "other", "Prophecy of Doom": "action"},
 "fx": [[6, "Otherworldly Calm", {"res": ["Psychic"], "notes": [["Note", "Otherworldly Calm: Advantage on saves to avoid or end Charmed and Frightened"]]}]]},

"Inquisition Domain": {"spab": "WIS",
 "f": {
  "Inquisition Domain Spells": "Spells that are always prepared from the listed Cleric level: 3 See Invisibility, Silence. 5 Dispel Magic, Remove Curse. 7 Arcane Eye, Locate Creature. 9 Creation, Hallow.",
  "Spell Shield": "Bonus Action and one Channel Divinity use: pick a creature you see within 30 ft (you included). For 10 minutes it gains Temporary HP equal to 1d10 plus your Cleric level. While it has them, it has Advantage on saves against spells and Resistance to spell damage. Leftover Temporary HP vanish when it ends.",
  "Witch Hunter's Strike": "When you hit with a weapon or Unarmed Strike, deal extra 1d8 Force damage, or 2d8 if the target is concentrating on a spell. At Cleric level 14 these become 2d8 and 3d8. If the target fails its Concentration save from this damage, you gain Temporary HP equal to the extra Force damage. Uses equal your Wisdom modifier (minimum 1) per Long Rest.",
  "Rebuke Invoker": "Reaction when a creature you see within 60 ft uses a Magic action to cast a spell: it makes a Constitution save against your spell save DC. Fail: Force damage of 1d8 plus 1d8 per level of the slot it spent (cantrips count as level 1). Success: half. Uses equal your Wisdom modifier (minimum 1) per Long Rest.",
  "Supernal Safeguard": "Spell Shield can affect a number of creatures up to your Wisdom modifier (minimum 1)."},
 "lu": [{"feature": "Witch Hunter's Strike", "lvl": 3, "max": "mod:WIS", "reset": "long", "tag": "Extra Force damage"}, {"feature": "Rebuke Invoker", "lvl": 6, "max": "mod:WIS", "reset": "long", "tag": "Reaction"}],
 "acts": {"Spell Shield": "bonus", "Rebuke Invoker": "reaction"}},

"Purification Domain": {"spab": "WIS",
 "f": {
  "Cleanse with Fire": "When you deal damage with a cantrip, or with a weapon or Unarmed Strike attack, add 1d8 Fire damage. Uses equal your Wisdom modifier plus your Proficiency Bonus (minimum 1), regained on a Short or Long Rest.",
  "Purification Domain Spells": "Spells that are always prepared from the listed Cleric level: 3 Detect Poison and Disease, Flame Blade. 5 Fear, Flash Fever. 7 Aura of Purity, Wall of Fire. 9 Flame Strike, Hold Monster.",
  "Unclean Brand": "When you hit with a melee weapon or Unarmed Strike attack, you can skip its normal damage and spend a Channel Divinity use to sear a glowing brand on the creature for 1 minute. It has Disadvantage on saves against your spells and has Vulnerability to Fire damage you deal, even if it has Resistance or Immunity.",
  "Ward Against Corruption": "You have Advantage on saves to avoid or end diseases and against effects that change your form, such as Polymorph. Magic action: touch a willing creature to give it this benefit for 1 hour or until you grant it again. It takes Fire damage equal to your Wisdom modifier (minimum 1) that ignores Resistance and Immunity.",
  "Sear Imperfections": "Cast Lesser Restoration and Greater Restoration on a willing creature with no slot and no Material components. Right after, the target takes 1d6 Fire damage per level of the slot (ignores Resistance and Immunity)."},
 "acts": {"Unclean Brand": "other", "Ward Against Corruption": "action"}},

"Circle of Blood": {"spab": "WIS",
 "f": {
  "Circle of Blood Spells": "Spells that are always prepared from the listed Druid level: 3 Blood Rush, Crimson Lash, Sense Lifeblood. 5 Blood Bond, Sanguine Poppet. 7 Circle of Scarlet, Dark Sacrament. 9 Dominate Person, Mortality.",
  "Rite of the Blood Moon": "Bonus Action and one Wild Shape use: take on the Blood Moon's savagery for 10 minutes. **Red Resilience.** Temporary HP equal to three times your Druid level. **Speed Increased.** Speed +10 ft, and you can Dash as a Bonus Action. **Violent Strikes.** When you hit with a weapon or Unarmed Strike, add 1d6 Necrotic damage.",
  "Blood Boon": "Reaction when a creature you see within 60 ft drops to 0 HP: regain 1 spent Hit Point Die and give a creature you see within 60 ft Temporary HP equal to your Druid level. Uses equal your Wisdom modifier (minimum 1). Regain one use on a Short Rest and all on a Long Rest.",
  "Blood Lust": "While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage.",
  "Exsanguinate": "When you use Blood Boon, regain spent Hit Point Dice equal to half your Druid level and give Temporary HP equal to twice your Druid level to up to your Wisdom modifier (minimum 1) creatures you see within 60 ft. Long Rest to use again."},
 "lu": [{"feature": "Blood Boon", "lvl": 6, "max": "mod:WIS", "reset": "long", "tag": "Reaction"}, {"feature": "Exsanguinate", "lvl": 14, "max": 1, "reset": "long", "tag": "Enhances Blood Boon"}],
 "acts": {"Rite of the Blood Moon": "bonus", "Blood Boon": "reaction"}},

"Circle of Entropy": {"spab": "WIS",
 "f": {
  "Catastrophic Power": "After a Short or Long Rest, gain one benefit until your next Short or Long Rest. **Elemental Cataclysm.** Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. Each creature makes a Dexterity save against your spell save DC. Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). Success: half damage only. **Ruinous Smite.** Once per turn when you hit with a weapon or Unarmed Strike, spend a slot to add 1d8 Necrotic damage plus 1d8 per slot level. **Weapon Mastery.** Use the mastery property of one weapon kind you are proficient with. You can change the kind after a Long Rest.",
  "Ruin Incarnate": "Bonus Action and one Wild Shape use: take an aspect of entropy for 10 minutes. **All Things Pass.** Advantage on attack rolls against Bloodied creatures. **Inexorable Onslaught.** Attack twice with the Attack action. **Ironskin Armor.** Your base AC is 17 plus your Wisdom modifier (minimum +1) if that is higher than your AC.",
  "Many Roads to Ruin": "While Ruin Incarnate is active. **Elemental Assault.** When you hit with a weapon or Unarmed Strike, you can deal Acid, Cold, Fire, Lightning or Necrotic damage instead of the normal type. **Increased Might.** Add your Wisdom modifier (minimum +1) to Strength and Dexterity saves.",
  "Shake the Earth": "Magic action: stamp the ground and grow one size category for 10 minutes. Each creature in a 30-ft Emanation from you makes a Dexterity save against your spell save DC or falls Prone. The tremor deals Bludgeoning damage to structures touching the ground there, rolling d10s equal to your Druid level. While large, your weapon and Unarmed Strike attacks deal an extra 1d4 on a hit. Long Rest to use again.",
  "Entropy's Apex": "**Enhanced Ruinous Smite.** Until the end of your next turn, a creature hit by your Ruinous Smite suffers crits on a 19 or 20. **Improved Inexorable Onslaught.** While Ruin Incarnate is active, attack three times with the Attack action. **World Breaker.** Shake the Earth also recharges on a Short Rest."},
 "lu": [{"feature": "Shake the Earth", "lvl": 10, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Catastrophic Power": "action", "Ruin Incarnate": "bonus", "Shake the Earth": "action"},
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "entropy_power", "feature": "Catastrophic Power", "title": "Catastrophic Power (swap each rest)",
  "list": [["Elemental Cataclysm", "Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. Dexterity save against your spell save DC. Fail: 1d6 of that type per slot level and Vulnerability to it for 1 minute (save again at each turn end to end it). Success: half damage only."],
           ["Ruinous Smite", "Once per turn when you hit with a weapon or Unarmed Strike, spend a slot to add 1d8 Necrotic damage plus 1d8 per slot level."],
           ["Weapon Mastery", "Use the mastery property of one weapon kind you are proficient with. You can change the kind after a Long Rest."]]}]},

"Circle of Mutation": {"spab": "WIS",
 "f": {
  "Circle Forms": "Wild Shape forms gain these benefits. **Challenge Rating.** The form's maximum CR is your Druid level divided by 3, rounded down. **Predator's Strike.** A hit with a Beast form's attack adds +2 damage. **Unpredictable.** You can Dash, Disengage or Influence as a Bonus Action.",
  "Mutate Shape": "When you assume a Wild Shape form, or as a Bonus Action while in one, spend a spell slot to gain Mutation Points equal to its level. They last until spent, until you gain more, or until you leave the form. Spend them on your turn (no action) to gain a Mutation, which lasts until you leave the form or spend a slot for new points. Each Mutation can be taken once per Wild Shape use unless it says Repeatable. **Creature of the Sea (1).** Swim Speed equal to your Speed and water breathing. 1 more point makes the Swim Speed double your Speed. **Creature of the Sky (3).** Fly Speed 30 ft. 2 more points make it 60 ft. **Darkvision (1).** Darkvision 60 ft, or +60 ft if you have it. **Disquieting Voice (1).** Understand and speak with Beasts, and use any Influence skill option on them. **Echolocation (3).** Blindsight 30 ft while not Deafened. **Enlarge (2).** Size up one category. 2 more points make it two categories. Gains the Enlarge benefits. **Manipulate Objects (1).** Utilize as a Bonus Action. **Multiattack (2).** Attack twice with the form's attack when you take the Attack action. **Natural Armor (2).** +1 AC. Repeatable up to three times. **Reduce (1).** Size down one category. 2 more points make it two categories. Gains the Reduce benefits. **Venomous Attacks (2).** Once per turn a creature hit by the form's attack takes 2d6 Poison damage and makes a Constitution save against your spell save DC or is Poisoned for 1 minute (save again at each turn end). Repeatable up to three times, and each extra 2 points add 2d6 Poison. **Wall Crawler (1).** Climb Speed equal to your Speed. 1 more point doubles it.",
  "Unnatural and Unnerving": "When you spend a level 2+ slot for Mutation Points, regain one expended slot of lower level than the spent slot, up to level 5. In Wild Shape, **Unnatural Attacks.** Each hit can deal its normal type or Force damage. **Unnerving Aura.** Advantage on Charisma (Deception or Intimidation) and Wisdom (Animal Handling) checks.",
  "Endless Evolution": "Whenever you gain Mutation Points, gain extra points equal to your Wisdom modifier (minimum 1). You can also buy these Mutations. **Creature of Earth (3).** Tremorsense 30 ft. 2 more points give a Burrow Speed equal to your Speed. **Elemental Inurement (2).** Resistance to Acid, Cold, Fire, Lightning, Poison or Thunder. Repeatable with a different type each time. **Eldritch Assault (2).** +1 to attack and damage rolls with the form's attacks. Repeatable up to three times. **Mystic Monster (3).** You can cast spells in this form. At Druid level 18, creatures have Disadvantage on saves against those spells. **Rapid Regeneration (5).** At the start of each turn regain HP equal to your Wisdom modifier (minimum 1). **Supernatural Hide (5).** Resistance to Bludgeoning, Piercing and Slashing damage.",
  "Apex Predator": "**Evolved Attacks.** Once per turn, add 2d10 Force damage to a target hit by a Wild Shape form's attack. **Mutate Beasts.** Magic action: touch a Beast and spend a slot. You gain Mutation Points equal to its level and must spend them at once on Mutations for the Beast. Unspent points are lost. The Mutations last until you target that Beast with this again. Remove Curse, Greater Restoration or similar magic ends them."},
 "acts": {"Mutate Shape": "bonus", "Apex Predator": "action"}},
}
