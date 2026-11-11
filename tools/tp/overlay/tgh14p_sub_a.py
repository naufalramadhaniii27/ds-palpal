# Own-wording subclasses of Grim Hollow Player's Guide, 2014 rules, batch A: Barbarian, Bard, Cleric, Druid.
TALENTS = [
 ["Barbarian", "Bonus action while not in heavy armor: rampage for 1 minute. You have Resistance to Bludgeoning, Piercing and Slashing damage but cannot concentrate on spells. It ends early if you are knocked unconscious. Long Rest to use again."],
 ["Cleric", "Bonus action: pick a creature within 30 ft. For 10 minutes it gains temporary hit points equal to your Charisma modifier + half your bard level. When it hits with an attack, it can lose those temporary hit points to deal that much extra Radiant damage. Short or Long Rest to use again."],
 ["Druid", "Cast polymorph with no slot, on yourself only. The beast's CR must be below half your bard level. Long Rest to use again."],
 ["Fighter", "You gain proficiency with martial weapons and shields, and learn one Fighter Fighting Style."],
 ["Monk", "Wearing no armor and no shield, your AC is 10 + Dexterity modifier + Charisma modifier. You can use Dexterity for unarmed strike attack and damage rolls and roll a d6 for its damage. If you use the Attack action and only make unarmed strikes, you can make one unarmed strike as a bonus action."],
 ["Paladin", "When you hit with a melee weapon attack, spend a spell slot to deal extra Radiant damage: 1d6 for a 1st-level slot plus 1d6 per level above 1st, up to 5d6, and 1d6 more against an undead or fiend (up to 6d6). Use it a number of times equal to your Proficiency Bonus. Regain all uses on a Long Rest."],
 ["Ranger", "You learn hunter's mark as a bard spell that does not count against spells known. Cast it once with no slot, as if using your highest slot. Long Rest to use again."],
 ["Rogue", "On your turn in combat you can take Dash, Disengage or Hide as a bonus action."],
 ["Sorcerer", "You have 2 sorcery points and learn one Metamagic option: Careful, Distant, Empowered, Extended, Quickened or Subtle Spell. As an action, spend a spell slot to gain sorcery points equal to its level. A Long Rest resets you to 2 points. When you gain a level, you can swap the Metamagic option."],
 ["Warlock", "You learn one eldritch invocation. Use half your bard level for any level requirement. When you gain a level, you can swap one of these invocations for another you qualify for."],
 ["Wizard", "You learn two wizard spells of a level you can cast. They count as bard spells and do not count against your spells known. When you gain a level, you can swap one of them for another wizard spell."],
]
def _t(l, key, title):
    return {"l": l, "k": "opts", "n": 1, "key": key, "feature": "Talented Adventurer", "title": title, "list": [list(x) for x in TALENTS]}

SUB = {
"Path of the Fractured": {"spab": "",
 "f": {
  "Face of Rage": "When you enter your rage, your features twist and your body swells. Creatures that did not see the change do not recognize you. While raging and not in heavy armor: your unarmed strike can deal 1d8 and counts as magical, you can make one unarmed strike as a bonus action when you take the Attack action with an unarmed strike and hold no shield, you count as one size larger for grapples, and your unarmed reach is 10 ft.",
  "Mask of Civility": "Gain proficiency in one skill from Arcana, History, Investigation, Medicine, Nature, Persuasion or Religion. Also gain one artisan's tool kit proficiency or one language.",
  "Brains and Brawn": "While not raging you have Resistance to Psychic damage. While raging you have Resistance to all damage except Psychic.",
  "Cunning and Brutal": "While not raging, you can take Disengage or Help as a bonus action each turn. While raging, your unarmed strikes crit on a 19 or 20.",
  "Better Half": "When damage would drop you to 0 hit points, use your reaction to drop to 1 instead and gain temporary hit points equal to half your hit point maximum, lost after 1 minute. If you were raging, the rage ends. If not, you start raging, even with no uses left. Long Rest to use again."},
 "lu": [{"feature": "Better Half", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction, drop to 1 HP"}],
 "acts": {"Better Half": "reaction"},
 "fx": [[6, "Brains and Brawn", {"res": ["Psychic"], "notes": [["Note", "Brains and Brawn: while raging, Resistance to all damage except Psychic"]]}]]},

"Path of the Primal Spirit": {"spab": "",
 "f": {
  "Primal Companion": "A spirit companion fights beside you. Pick Primal Guardian or Primal Striker, and land, sea or sky. Its stat block uses your Proficiency Bonus. It needs no air, food or sleep, and you share thoughts telepathically on the same plane. As an action, dismiss it or summon it within 30 ft. In combat it acts on your initiative right after you. It moves and reacts on its own, and its only action is Dodge unless you use a bonus action to command another. If you are incapacitated it acts freely. Spend 1 minute to heal it 2d6. It heals fully on a Long Rest. If it dies, it returns in a form you choose after your next Long Rest.",
  "Shared Rage": "While you rage, your primal companion has Resistance to Bludgeoning, Piercing and Slashing damage.",
  "Kin to Beasts": "You can cast animal friendship and speak with animals, using Constitution as the spellcasting ability. After casting either, you cannot cast either again until a Short or Long Rest.",
  "Skinrider's Trance": "As an action, choose your primal companion or a beast under your animal friendship to enter a trance. You possess it. You sense through its senses, control its movement and actions, use its physical statistics and abilities, and keep your mental scores. It ends if you choose, the beast drops to 0 hit points, or you are on different planes. You are blinded, deafened, and cannot move or act meanwhile. The trance lasts up to half your barbarian level + your Constitution modifier hours. Long Rest to use again.",
  "Shape of the Wild": "As a bonus action, choose a new form for your primal companion and transform it at once. Its current hit points become its new maximum. Short or Long Rest to use again."},
 "lu": [{"feature": "Kin to Beasts", "lvl": 6, "max": 1, "reset": "short", "tag": "Animal friendship or speak with animals"},
        {"feature": "Skinrider's Trance", "lvl": 10, "max": 1, "reset": "long", "tag": "Possess a beast"},
        {"feature": "Shape of the Wild", "lvl": 14, "max": 1, "reset": "short", "tag": "Reshape companion"}],
 "acts": {"Skinrider's Trance": "action", "Shape of the Wild": "bonus"}},

"College of Adventurers": {"spab": "CHA",
 "f": {
  "Adventurer's Talents": "Talents are class features borrowed from other classes. Each College of Adventurers talent is listed under Talented Adventurer.",
  "Party Planner": "While a creature holds one of your Bardic Inspiration dice, it can take the Help action as a bonus action on each of its turns.",
  "Talented Adventurer": "Gain one adventurer's talent of your choice. Gain another at level 6 and another at level 14.",
  "Well-Rounded": "Choose one skill, one tool and one language. You gain proficiency in the skill and tool and can speak, read and write the language.",
  "Improvisational Talent": "After a Long Rest, replace one adventurer's talent you know with one you do not know."},
 "pick": [_t(3, "adv_talent3", "Adventurer's talent (1st)"), _t(6, "adv_talent6", "Adventurer's talent (2nd)"), _t(14, "adv_talent14", "Adventurer's talent (3rd)")],
 "acts": {}},

"College of Requiems": {"spab": "CHA",
 "f": {
  "Chilling Melody": "Learn two necromancy cantrips from any class list. They count as bard spells and do not count against cantrips known.",
  "Pluck the Heartstrings": "A creature holding one of your Bardic Inspiration dice can spend it when it deals weapon damage to add that die result in Necrotic damage. When a living creature holding your die drops to 0 hit points, it can spend the die as a reaction to drop to 1 hit point instead.",
  "Stir the Bones": "Learn animate dead as a bard spell that does not count against spells known. When you give a creature Bardic Inspiration, choose undead you control within 60 ft, up to your Proficiency Bonus in number. Each gets a Dirge die lost after 10 minutes unused, spent like Bardic Inspiration. You can command your undead mentally as part of the same bonus action. When an undead spends a die on a hit, it can add the result to damage too.",
  "Dance of the Dead": "When you cast a necromancy spell that targets one creature, it can target a second creature in range with no extra components. Short or Long Rest to use again."},
 "lu": [{"feature": "Dance of the Dead", "lvl": 14, "max": 1, "reset": "short", "tag": "Second target for a necromancy spell"}],
 "acts": {}},

"Eldritch Domain": {"spab": "WIS",
 "f": {
  "Eldritch Contagion": "When you cast a spell using a slot of 1st level or higher that targets creatures, use a bonus action on the same turn to make one target make a Wisdom save. On a failure, roll on the Eldritch Effects table and it suffers that effect for 1 minute, repeating the save at the end of each of its turns. It ends early if you use this again. 1: cannot speak or cast verbal spells. 2: 1d8 Psychic damage at the start of each turn. 3: falls Prone, and again whenever it moves 5 ft or more. 4: Disadvantage on attacks and Wisdom (Perception) checks. 5: can move or act but not both, and cannot react. 6: attacks against it and by it have Advantage. 7: Deafened and cannot see beyond 30 ft. 8: Frightened of you.",
  "Unpredictable Inspiration": "Choose any cantrip. It counts as a cleric spell for you and does not count against cleric cantrips known. After a Long Rest you can swap it for another cantrip. You also gain proficiency in one skill, which you can swap after a Long Rest.",
  "Channel Divinity: Prophecy of Doom": "As an action, choose a point within 120 ft you see and roll on the Eldritch Effects table. Each creature in a 15-ft-radius sphere there makes a Wisdom save or suffers that effect for 1 minute, repeating the save at the end of each of its turns.",
  "Otherworldly Calm": "You have Resistance to Psychic damage and Advantage on saves against Charmed and Frightened. A creature that tries to read your thoughts fails automatically and makes a Wisdom save against your cleric spell save DC or takes Psychic damage equal to your cleric level.",
  "Potent Spellcasting": "Add your Wisdom modifier to the damage of cleric cantrips.",
  "Sing the Song that Ends the World": "A creature that fails a save against your Prophecy of Doom takes 10d10 Psychic damage. It cannot take damage this way again for 10 minutes."},
 "lu": [],
 "acts": {"Eldritch Contagion": "bonus", "Channel Divinity: Prophecy of Doom": "action"},
 "fx": [[6, "Otherworldly Calm", {"res": ["Psychic"], "notes": [["Note", "Otherworldly Calm: Advantage on saves against Charmed and Frightened"]]}]]},

"Inquisition Domain": {"spab": "WIS",
 "f": {
  "Bonus Proficiencies": "You gain proficiency with martial weapons and heavy armor.",
  "Witch Hunter's Strike": "When you hit with a weapon attack, deal an extra 1d8 Force damage, or 2d8 if the target is concentrating on a spell. If a creature fails its concentration save from this damage, you gain temporary hit points equal to the extra damage. Use it a number of times equal to your Wisdom modifier (minimum 1), regaining all uses on a Long Rest. At level 14 the damage becomes 2d8, or 3d8 against a concentrating target.",
  "Channel Divinity: Spell Shield": "As a bonus action, present your holy symbol and choose a creature you see within 30 ft, including you. It gains temporary hit points equal to 1d10 + your cleric level. While it has them, it has Resistance to spell damage and Advantage on saves against spells. They vanish after 1 hour.",
  "Rebuke Invoker": "When a creature you see within 60 ft casts a spell, use your reaction to force it to make a Constitution save. On a failure it takes Force damage of 1d8 per level of the slot spent, plus your Wisdom modifier, and half on a success. Cantrips count as 1st level. Use it a number of times equal to your Wisdom modifier (minimum 1), regaining all uses on a Long Rest.",
  "Divine Strike": "Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Force damage. It becomes 2d8 at level 14.",
  "Supernal Safeguard": "When you use Spell Shield, you can choose up to your Wisdom modifier (minimum 2) creatures instead of one."},
 "lu": [{"feature": "Witch Hunter's Strike", "lvl": 1, "max": "mod:WIS", "reset": "long", "tag": "Extra Force damage"},
        {"feature": "Rebuke Invoker", "lvl": 6, "max": "mod:WIS", "reset": "long", "tag": "Reaction, Force damage"}],
 "acts": {"Channel Divinity: Spell Shield": "bonus", "Rebuke Invoker": "reaction"}},

"Circle of Blood": {"spab": "WIS",
 "f": {
  "Blood Boon": "When a creature you see within 60 ft dies, use your reaction to claim its vitality. You regain one spent Hit Die, and you can give a creature you see within 60 ft temporary hit points equal to your druid level. Use it a number of times equal to your Wisdom modifier, regaining all uses on a Long Rest.",
  "Circle Spells": "You always have these spells prepared once you reach each level, and they do not count against your prepared spells. Level 3: hold person, sense lifeblood. Level 5: blood bond, sanguine poppet. Level 7: circle of scarlet, dark sacrament. Level 9: dominate person, mortality.",
  "Rite of the Blood Moon": "As an action, spend one use of Wild Shape to send yourself or a willing creature within 5 ft into a blood frenzy for 1 minute. It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attack action, and +10 ft speed. It cannot speak or cast spells. Only one creature at a time is affected.",
  "Blood Lust": "Once on each of its turns, a creature under your Rite of the Blood Moon that makes a damage roll can spend a Hit Die and add the result to the damage.",
  "Create Blood Elemental": "When a creature you see within 60 ft dies, use your reaction to drain its corpse and conjure a water elemental of its blood in your service for 1 hour, or until it drops to 0 hit points. It rolls initiative and obeys your verbal commands. Long Rest to use again."},
 "lu": [{"feature": "Blood Boon", "lvl": 2, "max": "mod:WIS", "reset": "long", "tag": "Reaction, regain a Hit Die"},
        {"feature": "Create Blood Elemental", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction, blood elemental"}],
 "acts": {"Blood Boon": "reaction", "Rite of the Blood Moon": "action", "Create Blood Elemental": "reaction"}},

"Circle of Mutation": {"spab": "WIS",
 "f": {
  "Circle Forms": "You can use Wild Shape to become a beast of CR 1 or lower, ignoring the Max CR column of the Beast Shapes table but following its other limits. From level 6 you can become a beast with CR up to your druid level divided by 3, rounded down.",
  "Mutate Shape": "You can use Wild Shape as a bonus action. While in beast shape, use a bonus action to spend a spell slot and gain mutation points equal to its level, kept until spent or Wild Shape ends. Spend points with no action to pick mutations that last for the whole Wild Shape. Creature of the Sea: 1 point for air and water breathing and swim 30 ft, +1 for swim 60 ft. Creature of the Sky: 3 points for fly 30 ft, +2 for fly 60 ft. Darkvision: 1 point for 60 ft. Echolocation: 4 points for blindsight 30 ft while not deafened. Enchanted Attacks: 1 point, attacks count as magical. Enlarge: 1 point for one size up, +2 for two sizes. Multiattack: 2 + 2 x the form's CR points, to make two natural weapon attacks with an action. Natural Armor: 1, 2 or 3 points for the same AC bonus. Reduce: 1 point for one size down, +2 for two sizes. Unnatural Voice: 1 point to speak, without casting spells. Venomous Attacks: 2 points, natural weapons deal an extra 1d4 Poison damage.",
  "Unnatural and Unnerving": "Gain proficiency in Intimidation, or if you already have it, in one skill from Athletics, Acrobatics, Perception, Stealth or Survival. You have Advantage on Charisma (Intimidation) checks while in beast shape with at least one mutation.",
  "Endless Evolution": "When you Wild Shape you gain mutation points equal to your Wisdom modifier (minimum 1), lost if unspent when you leave beast shape. Also, as an action, touch a beast and spend a spell slot to give it mutation points equal to the slot level or the beast's CR, whichever is lower, and spend all of them on its mutations at once. The mutations last until you target that beast again or dispel magic, remove curse or similar magic ends them.",
  "Apex Predator Aura": "A beast that starts its turn within 30 ft of you makes a Wisdom save against your druid spell save DC or is Frightened for 10 minutes. On a success it is immune for 24 hours. A frightened creature can use its action each turn to repeat the save. As an action, make the aura affect chosen creatures within 30 ft, not only beasts, until the start of your next turn. Long Rest to use that action again."},
 "lu": [{"feature": "Apex Predator Aura", "lvl": 14, "max": 1, "reset": "long", "tag": "Aura hits all creatures"}],
 "acts": {"Mutate Shape": "bonus", "Endless Evolution": "action", "Apex Predator Aura": "action"}},
}
