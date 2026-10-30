# Deep Magic (2014 rules) wizard specialties, group A: Alkemancer, Blood Mage, Blood Magic, Chaos, Clockwork Mage, Doomsayer, Dragon Mage, Elementalist, Entropist.
# Level 2 features are clamped to level 3 by the generator.

_DMG = "Random damage type: roll a d10 for Acid, Cold, Fire, Force, Lightning, Necrotic, Poison, Psychic, Radiant, Thunder (1 to 10 in that order)."

_BLOOD_F = {
  "Blood Savant": "Copying a Blood Magic spell into your spellbook costs half the usual gold and time. You gain proficiency in Medicine. You also gain keen control over your own blood. When a disease or poison effect lets you make a Constitution save to take half damage, you take no damage on a success and half damage on a failure.",
  "Bonus Proficiency": "You gain proficiency in Medicine.",
  "Internal Fortitude": "When a disease or poison effect lets you make a Constitution save to take half damage, you take no damage on a success and half damage on a failure.",
  "Wizard Specialty": "Your magic runs on the secrets held in your own blood. In time you learn to work the blood of other creatures too.",
  "Blood Vision": "You can view a moment of the past through the eyes of a creature whose blood you swallow. Drinking a small amount of its blood leaves you Stunned for 1 round, and in that time you live one of its memories. The memory may or may not relate to the wound that spilled the blood. Older blood gives a foggier, less clear memory. Once you have used a creature's blood this way, its blood never gives you another memory.",
  "Absorb Toxins": "You can draw a poison or disease out of another creature, living or dead, and keep it for your own use. Expose a fresh wound to the source and the affliction rests dormant in your blood. As an action, you can spit blood at a creature and make a ranged spell attack. On a hit, the target is exposed to the disease or poison and must make whatever saves it calls for. If you do not pass it to another living creature within 3 days, it activates in you, and you make the first two saves against it with Disadvantage.",
  "Absorb Impurities": "You can draw a poison or disease out of another creature, living or dead, and keep it for your own use. Expose a fresh cut to the source and the affliction rests dormant in your blood. As an action, you can spit blood at a creature and make a ranged spell attack. On a hit, the target is exposed to the disease or poison and must make whatever saves it calls for. If you do not pass it to another living creature within 3 days, it activates in you, and you make the first two saves against it with Disadvantage.",
  "Thicken or Quicken Blood": "As an action, touch a creature and force a Constitution save. On a failure, you choose to either slow it as if by the Slow spell or speed it as if by the Haste spell. The effect lasts a number of rounds equal to your Intelligence modifier. A willing creature can choose to fail the save to gain Haste. Long Rest to use again.",
  "Mire or Quicken Blood": "As an action, force a creature to make a Constitution save. On a failure, you choose to either slow it, thickening its blood to sludge, or speed it, thinning its blood to give it the effects of Haste. The effect lasts a number of rounds equal to your Intelligence modifier. A willing creature can choose to fail the save. You can use this once per day.",
}
_BLOOD_LU = [{"feature": "Thicken or Quicken Blood", "lvl": 14, "max": 1, "reset": "long", "tag": "Action"}]
_BLOOD_ACTS = {"Absorb Toxins": "action", "Absorb Impurities": "action", "Thicken or Quicken Blood": "action", "Mire or Quicken Blood": "action"}
_BLOOD_FX = [[3, "Blood Savant", {"skills": ["Medicine"], "notes": [["Note", "Blood Savant: a Constitution save for half damage from a disease or poison means no damage on a success and half on a failure"]]}]]

_BM_F = dict(_BLOOD_F)
_BM_F["Blood Magic"] = "Your magic runs on the secrets held in your own blood. In time you learn to work the blood of other creatures too. You gain Blood Savant (halved cost to copy Blood Magic spells, Medicine proficiency, and protection against disease and poison damage)."
_BMG_F = dict(_BLOOD_F)
_BMG_F["Blood Mage"] = "Your magic runs on the secrets held in your own blood. In time you learn to work the blood of other creatures too. You gain Blood Savant (halved cost to copy Blood Magic spells, Medicine proficiency, and protection against disease and poison damage)."

_MASTERY = [
 ["Elemental Adaptation", "Needs Elementalist level 14. Plane Shift joins your spellbook if it is not there. You can cast it once with this mastery without a slot, but only to the elemental plane of your focus or to the Material Plane. On that plane you take no harm from its conditions, breathe normally, and move in a fitting way (fly for air, burrow for earth, swim for water). Long Rest to use again."],
 ["Elemental Binding", "Needs Elementalist level 10. Planar Binding joins your spellbook if it is not there. You can cast it once with this mastery without a slot, but only on an elemental tied to your focus. If the elemental fails its save, it gains Temporary HP equal to your Wizard level. Long Rest to use again."],
 ["Elemental Bulwark", "Needs Elementalist level 6. You have Resistance to the damage type of your focus. You have Advantage on Constitution saves to keep Concentration on spells that resonate with your focus."],
 ["Elemental Command", "Action: pick an elemental you see within 30 ft. It must succeed on a Wisdom save or be Charmed for up to 1 hour while you keep Concentration as if on a spell. If you or your companions harm it or act against it, the charm ends. A creature that passes the save, or whose charm ends, is immune to this for 24 hours."],
 ["Elemental Erosion", "Needs Elementalist level 10. After you damage a target with a level 1+ spell that deals your focus damage type, the target is Vulnerable to that type until the end of your next turn. You can do this twice. Short or Long Rest regains all uses."],
 ["Ignite", "Needs fire focus. When you deal Fire damage to a target with a level 1+ spell, use a Bonus Action to set it alight. Unless a creature uses an action to douse the flames, the target takes half the damage the spell dealt at the start of its next turn, and then the fire goes out. If the spell hit several targets, pick one to burn."],
 ["Intensified Element", "When you damage a target with a spell that deals your focus damage type, you ignore its Resistance to that type."],
 ["Overwhelming Onslaught", "Needs Elementalist level 14. When you damage a target with a level 1+ spell that deals your focus damage type, you can wrap it in lingering elemental energy. At the start of its turn it makes a Constitution save. On a failure it takes 4d6 damage of that type and is Stunned until the start of its next turn. On a success it takes half damage and the effect ends. You can do this twice. Short or Long Rest regains all uses."],
 ["Stony Refuge", "Needs earth focus. When you cast a level 1+ spell, use a Bonus Action to raise a stone slab between you and one creature you choose. It gives you Half Cover against that creature until the end of your next turn."],
 ["Sweeping Swell", "Needs water focus. When you cast a level 1+ spell, use a Bonus Action to send a wave at a target you see within 20 ft. It must succeed on a Strength save or be pushed 5 ft in a direction you choose and knocked Prone."],
 ["Wind Blast", "Needs air focus. When you cast a level 1+ spell, use a Bonus Action to create a line of wind 20 ft long and 5 ft wide. Each creature in it makes a Strength save. On a failure it takes 1d6 Slashing damage and is pushed 10 ft along the line."],
]
_FOCUS = [
 ["Air", "Your focus language is Auran or Primordial. Your focus damage type is Lightning or Thunder, chosen when you pick this focus."],
 ["Earth", "Your focus language is Terran or Primordial. Your focus damage type is Acid."],
 ["Fire", "Your focus language is Ignan or Primordial. Your focus damage type is Fire."],
 ["Water", "Your focus language is Aquan or Primordial. Your focus damage type is Cold."],
]

def _m(l, key, n, title):
    return {"l": l, "k": "opts", "n": n, "key": key, "feature": "Elemental Mastery", "title": title, "list": [list(x) for x in _MASTERY]}

SUB = {
"Alkemancer": {"spab": "",
 "f": {
  "Alchemical Savant": "Copying an alkemancy spell into your spellbook costs half the usual gold and time. When you gain a level, one of the two spells you add can be an alkemancy spell even if you never found it. The same goes for a new cantrip, which can be an alkemancy cantrip.",
  "Skilled Alchemist": "You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. Alchemical items you craft cost half as much, so most basic items take a single day. You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons.",
  "Wizard Specialty": "Alkemancers seek human perfection and immortality through alchemy. Their spells tend to blend conjuration, necromancy and transmutation and rarely belong to evocation or illusion. Except where noted, you work as a Wizard and use the Wizard spell list.",
  "Essence Mastery": "You can add one of six essences to a spell as an extra material component, at a cost of 1 gp per spell level. It adds no casting time. **Brimstone.** In a Fire damage spell, creatures damaged must succeed on a Constitution save or be Poisoned for a number of rounds equal to your Intelligence modifier (minimum 1). **Lead.** In a spell that raises AC, such as Mage Armor or Shield, the AC bonus rises by 2 and a duration over 1 round grows by your Intelligence modifier (minimum 1) rounds. **Quicksilver.** In a spell that changes the form of a creature or object, such as Alter Self or Polymorph, the duration grows by your Intelligence modifier (minimum 1) in minutes, or in rounds if the spell lasts under 10 minutes. **Quintessence.** In a necromancy spell that grants Temporary HP, such as False Life, the Temporary HP rise by twice your Intelligence modifier (minimum 2). **Salt.** In an Acid damage spell, creatures damaged must succeed on a Constitution save or lose 1d4 Strength and 1d4 Dexterity (rolled separately) for a number of rounds equal to your Intelligence modifier (minimum 1). **Void salt.** In a Necrotic damage spell, creatures damaged must succeed on a Constitution save or be Restrained for a number of rounds equal to your Intelligence modifier (minimum 1).",
  "Craft Minor Elixir": "You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. When you brew one of them, you can add exotic reagents for extra gold equal to half its normal cost. If you do, an instant effect such as a healing potion has its maximum result, and a potion with a duration lasts twice as long.",
  "Path of the Golden Glower": "You learn the secret formulas of the Six Elixirs. Each takes a year or more to make from very rare ingredients, and each gives the one who drinks or applies it a permanent bonus. You also become skilled with dangerous reagents, gaining Resistance to Acid and Poison damage and immunity to the Poisoned condition."},
 "lu": [],
 "acts": {},
 "fx": [[3, "Skilled Alchemist", {"notes": [["Note", "Skilled Alchemist: proficiency with Alchemist's Supplies, doubled Proficiency Bonus on them, and add Proficiency Bonus to damage with alchemical weapons"]]}],
        [14, "Path of the Golden Glower", {"res": ["Acid", "Poison"], "imm": ["Poisoned"]}]]},

"Blood Mage": {"spab": "", "f": _BM_F, "lu": _BLOOD_LU, "acts": _BLOOD_ACTS, "fx": _BLOOD_FX},

"Blood Magic": {"spab": "", "f": _BMG_F, "lu": _BLOOD_LU, "acts": _BLOOD_ACTS, "fx": _BLOOD_FX},

"Chaos": {"spab": "",
 "f": {
  "School of Chaos": "Chaos wizards crave an understanding of probability and the unpredictable turns of life, to the point of obsession. What begins as pattern study slides into a descent toward madness.",
  "Chaos Savant": "Copying a chaos spell into your spellbook costs half the usual gold and time.",
  "Long Odds": "Bonus Action to give yourself, or Reaction to give a creature you see, Advantage on one attack roll, saving throw or ability check made this turn. Using it causes a chaos magic surge. Long Rest to use again.",
  "Twisted Arcana": "When you cast a damage spell and know it succeeded (after any spell attack roll, before damage), you can channel chaos into it. Roll 1d6 plus 1. That is the most damage dice you can reroll, and you must keep the new results. The spell's damage type is also replaced at random. " + _DMG + " This causes a chaos magic surge. Long Rest to use again.",
  "Shifting Resistance": "When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. " + _DMG + " You can choose to cause a chaos magic surge as part of the casting. If you do, roll twice, keep the type you prefer, and then resolve the surge. Long Rest to use again.",
  "Master of Chaos": "Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. Each time you cast a chaos spell, you gain Temporary HP equal to your Intelligence modifier plus the spell's level."},
 "lu": [{"feature": "Long Odds", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action or Reaction"},
        {"feature": "Twisted Arcana", "lvl": 6, "max": 1, "reset": "long", "tag": "On damage spell"},
        {"feature": "Shifting Resistance", "lvl": 10, "max": 1, "reset": "long", "tag": "On chaos spell"}],
 "acts": {"Long Odds": "bonus"},
 "fx": []},

"Clockwork Mage": {"spab": "",
 "f": {
  "Metal Shape": "**Clockwork Savant (from level 2).** Copying a clockwork spell into your spellbook costs half the usual gold and time. **Clockworker's Charm (from level 2).** When you cast Animate Construct, its duration grows by a number of minutes equal to your Proficiency Bonus. At level 20 you can make it last until dispelled, but only one such construct can be permanent at a time. If you cast Find Familiar, the material components become a small clockwork device shaped like one of the listed animals. It has the chosen form's statistics but is a Construct, its form cannot change without paying for the components to rebuild it, and it never counts toward your limit of controlled constructs. **Metal Shape.** You can reshape metal with a touch. While holding a piece of metal of Small size or smaller, you can alter its form into any shape that suits you. It must be in your hands and under your control, so you cannot reshape armor or a weapon someone else wears or wields. To make a specific object such as a key or part, you must know it well. A key you held for a long time works, but you cannot make a working key from seeing the lock alone. Created objects can have up to two hinges and a latch, with no finer detail. You can also use this to repair metal, as the Repair Metal spell does. Short or Long Rest to use again.",
  "Golem Form": "Action: transform into a living construct for up to 1 minute per level. You keep your Intelligence, Wisdom and Charisma, and you can still speak and cast spells. You become a golem or clockwork creature of a Challenge Rating up to your Wizard level. Otherwise this works like the Druid's Wild Shape.",
  "Clockwork Mastery": "Action: pick a creature you see within 60 ft. It makes an Intelligence save against your spell save DC. This is a magical effect. If it fails, the construct is Friendly to you and obeys your commands for 1 hour, until you use this again, or until you or an ally damages it. If it fails by 5 or more, the time grows to 6 hours or until another condition ends it. When the effect ends, the construct knows you controlled it."},
 "lu": [{"feature": "Metal Shape", "lvl": 6, "max": 1, "reset": "short", "tag": "Touch"}],
 "acts": {"Golem Form": "action", "Clockwork Mastery": "action", "Metal Shape": "other"},
 "fx": []},

"Doomsayer": {"spab": "",
 "f": {
  "Apocalypse Savant": "Copying an apocalypse spell into your spellbook costs half the usual gold and time.",
  "Arcane Specialty": "Anyone can hurl a fireball, but only a master of the apocalypse can open a black hole. Some doomsayers use their dread power to build a conquering army. Others aim to become a force of darkness and remake the world to their own vision.",
  "Wicked Presence": "You can fill witnesses with a sense of coming doom. When you kill a creature with a spell that is not a cantrip, use a Bonus Action to pick one or more creatures within 30 ft of it. Each must succeed on a Wisdom save or be Frightened of you for 1 minute. A Frightened creature repeats the save at the end of each of its turns, ending the effect on itself on a success. Long Rest to use again.",
  "Terrible Power": "When you score a critical hit with a spell attack, pick one effect. Each creature affected by the spell must succeed on a Wisdom save or be Frightened of you until the end of its next turn. Or each creature affected must succeed on a Constitution save or be Poisoned until the end of its next turn.",
  "Merciless Onslaught": "You have Advantage on spell attack rolls against Frightened or Poisoned creatures.",
  "Power from Darkness": "Your spell attacks score a critical hit on a natural 19 or 20."},
 "lu": [{"feature": "Wicked Presence", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Wicked Presence": "bonus"},
 "fx": []},

"Dragon Mage": {"spab": "",
 "f": {
  "Dragon Magic Savant": "Copying a dragon magic spell into your spellbook costs half the usual gold and time.",
  "Wizard Specialty": "Dragon mages show their magic in as many styles as there are kinds of dragons. A kobold advising a great wyrm, a human with ancient draconic blood, or a dragonborn legionnaire might each walk this path. **How to start.** You can take this specialty at level 2 in place of an arcane tradition and gain its features instead. You can also take it alongside a standard tradition. In that case you gain that school's Savant feature as well as Dragon Magic Savant. At level 2 you choose either Invoke Dragon Mask or the level 2 feature of your school. At levels 6, 10 and 14 you again choose between the lowest-level features still unchosen.",
  "Invoke Dragon Mask": "Bonus Action and a spell slot: call a translucent dragon-head mask over your face. It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. It does not block your sight. While worn: you gain a bonus to AC equal to your Intelligence modifier (minimum +1). You gain a bite. As an action, make a melee spell attack against an adjacent target, dealing Piercing damage equal to 1d8 plus your Intelligence modifier, and it counts as magical. You have Advantage on Wisdom (Perception) and Charisma (Intimidation) checks. Your ranged and melee spell attack rolls have Disadvantage, and saving throws against your spells are made with Advantage. As a Bonus Action, spend another slot to add 1d8 per slot level to your next bite and gain Advantage on that attack.",
  "Invoke Dragon Heart": "Bonus Action and a spell slot: call a translucent beating heart over your chest. It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. Your body stays visible. While active: you add your Intelligence modifier (minimum +1) to Wisdom and Charisma saves. You gain Temporary HP equal to twice your Wizard level, and they vanish when the heart ends. As an action, breathe a line 30 ft long and 5 ft wide in a direction you choose. Pick Acid, Cold, Fire or Lightning, which cannot change while this heart lasts. Each creature in the line makes a Dexterity save or takes 4d6 damage of that type. As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath.",
  "Invoke Dragon Wings": "Bonus Action and a spell slot: call magical dragon wings. They last 2 rounds per slot level and end early if you are Incapacitated or dismiss or replace them with a Bonus Action. While active: your Speed rises by 10 ft and you gain a Fly Speed equal to your walking Speed. You have Resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks. You have Advantage on spell attack rolls. As a Bonus Action, spend another slot to boost the wings until the start of your next turn. You gain 5 ft of Speed per slot level, and you pick one creature per slot level within 10 ft, and ranged attacks against them have Disadvantage.",
  "Invoke Dragon Tail": "Bonus Action and a spell slot: call a magical 15-ft dragon tail. It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. While active: you are immune to the Grappled condition. You have proficiency in Strength and Dexterity saves and Strength checks, and you can use your Intelligence modifier in place of the normal modifier for them. As an action, make a tail slam: a separate melee spell attack against each target within 15 ft. On a hit, the target takes 3d10 plus your Intelligence modifier Bludgeoning damage (magical) and is pushed up to 10 ft and knocked Prone unless it succeeds on a Strength save against your spell save DC. As a Reaction, make a tail slam against a creature that moves within 15 ft of your tail. As a Bonus Action, spend another slot to add 1d10 slam damage per slot level until the start of your next turn and heal 3 HP per slot level."},
 "lu": [],
 "acts": {"Invoke Dragon Mask": "bonus", "Invoke Dragon Heart": "bonus", "Invoke Dragon Wings": "bonus", "Invoke Dragon Tail": "bonus"},
 "fx": [[10, "Invoke Dragon Wings", {"notes": [["Note", "Invoke Dragon Wings: while active, Speed +10 ft, Fly Speed equal to walking Speed, Resistance to nonmagical Bludgeoning, Piercing and Slashing"]]}]]},

"Elementalist": {"spab": "",
 "f": {
  "Wizard Speciality": "Elementalists believe their chosen element is better than all others and say so. They are often secluded researchers, but many join adventuring groups that value their singular talents.",
  "Elemental Savant": "Pick one element from the Elemental Focus table. It becomes the focus of your study. You can speak, read and write its language, and its damage type is used by your later features. Copying a spell tied to your element costs half the usual gold and time. Spells tied to the elements include these. **Air.** Shocking Grasp, Wind Lash, Fog Cloud, Thunderwave, Wind Tunnel, Gust of Wind, Rolling Thunder, Call Lightning, Lightning Bolt, Wind Wall, Chain Lightning, Storm of Vengeance. **Earth.** Acid Splash, Pummelstone, Melf's Acid Arrow, Jeweled Fissure, Earthskimmer, Stone Shape, Wall of Stone, Entomb, Move Earth, Caustic Torrent, Earthquake. **Fire.** Fire Bolt, Produce Flame, Fire Darts, Flaming Sphere, Heat Metal, Scorching Ray, Fireball, Fire Shield, Flame Wave, Wall of Fire, Delayed Blast Fireball, Incendiary Cloud, Meteor Swarm, Pyroclasm. **Water.** Ray of Frost, Create or Destroy Water, Tidal Barrier, Frozen Razors, Riptide, Sleet Storm, Control Water, Cone of Cold, Frostbite, Drown, Otiluke's Freezing Sphere, Wall of Ice. Conjure Minor Elementals and Conjure Elemental count for every element.",
  "Elemental Focus": "Pick Air, Earth, Fire or Water. Each has an elemental language and a damage type (Air: Auran and Lightning or Thunder, Earth: Terran and Acid, Fire: Ignan and Fire, Water: Aquan and Cold). Spells that deal that damage, manipulate that element or fit its theme resonate with your focus, and your GM decides which spells count. Copying a resonant spell costs half the usual gold and time. When you gain a level, one of the two spells you add can be a resonant spell even if you never found it. The same goes for a new cantrip.",
  "Elemental Mastery": "You learn magical techniques called masteries to channel elemental magic into yourself and your spells. You learn 2 masteries at level 2, and 1 more at levels 6, 10 and 14. When you learn a new mastery, you can also swap one you know for a different one. When a mastery makes a creature save, the DC is your Wizard spell save DC.",
  "Substitute Elements": "When you cast a spell that deals damage, you can change that damage to the type tied to your elemental focus.",
  "Substitue Elements": "When you cast a spell that deals damage, you can change that damage to the type tied to your elemental focus.",
  "Absorb Elements": "Reaction: when you would take damage of your focus type, take none and regain HP equal to half the damage you would have taken. This works even if you have Resistance or Immunity to that type, and it applies before them. Uses equal your Intelligence modifier (minimum 1). Long Rest regains all uses.",
  "Irresistible Strike": "Your spells that deal your focus damage type ignore Immunity to that type. Uses equal your Intelligence modifier (minimum 1). Long Rest regains all uses."},
 "lu": [{"feature": "Absorb Elements", "lvl": 10, "max": "mod:INT", "reset": "long", "tag": "Reaction"},
        {"feature": "Irresistible Strike", "lvl": 14, "max": "mod:INT", "reset": "long", "tag": "On damage spell"}],
 "acts": {"Absorb Elements": "reaction"},
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "elem_focus", "feature": "Elemental Focus", "title": "Elemental focus", "list": [list(x) for x in _FOCUS]},
          _m(3, "elem_mastery3", 2, "Elemental masteries (2)"), _m(6, "elem_mastery6", 1, "Elemental mastery (3rd)"),
          _m(10, "elem_mastery10", 1, "Elemental mastery (4th)"), _m(14, "elem_mastery14", 1, "Elemental mastery (5th)")],
 "fx": []},

"Entropist": {"spab": "",
 "f": {
  "Chaos Magic Savant": "Copying a chaos spell into your spellbook costs half the usual gold and time.",
  "Long Odds": "Bonus Action to give yourself, or Reaction to give a creature you see, Advantage on one attack roll, saving throw or ability check made this turn. Using it causes a chaos magic surge. Long Rest to use again.",
  "Wizard Specialty": "Studying the patterns of chaos soon becomes a trip down the rabbit hole to madness. **How to start.** You can take this specialty at level 2 in place of an arcane tradition and gain its features instead. You can also take it alongside a standard tradition. In that case you gain that school's Savant feature as well as Chaos Magic Savant. At level 2 you choose either Long Odds or the level 2 feature of your school. At levels 6, 10 and 14 you again choose between the lowest-level features still unchosen.",
  "Twisted Arcana": "When you cast a damage spell and know it succeeded (after any spell attack roll, before damage), you can channel chaos into it. Roll 1d6 plus 1. That is the most damage dice you can reroll, and you must keep the new results. The spell's damage type is also replaced at random. " + _DMG + " This may cause a chaos magic surge. Long Rest to use again.",
  "Shifting Resistance": "When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. " + _DMG + " You can try to steer it, but at a risk. Roll twice and keep the type you prefer, and then also roll to see whether a chaos magic surge occurs. Long Rest to use again.",
  "Master of Chaos": "Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. Each time you cast a chaos spell, you gain Temporary HP equal to your Intelligence modifier plus the spell's level."},
 "lu": [{"feature": "Long Odds", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action or Reaction"},
        {"feature": "Twisted Arcana", "lvl": 6, "max": 1, "reset": "long", "tag": "On damage spell"},
        {"feature": "Shifting Resistance", "lvl": 10, "max": 1, "reset": "long", "tag": "On chaos spell"}],
 "acts": {"Long Odds": "bonus"},
 "fx": []},
}
