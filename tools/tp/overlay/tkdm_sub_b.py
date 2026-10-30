# Own-wording Wizard subclasses of Deep Magic (group B): Geomancy, Illuminator, Master of Fiends, Necrophage, Ring Warden,
# School of Illumination, Timekeeper, Void Caster, Void Speaker, White Necromancer. None of them uses a pick or optional feature.

_SPECIALTY = "This is an optional specialty. You choose it at Wizard level 2 where you would pick an arcane tradition, and you may take it instead of a tradition or beside one. Beside a tradition, you also get that school's Savant feature. At level 2, 6, 10 and 14 you choose between this specialty's feature and the lowest-level feature of your tradition that you do not have yet."

_OMEN = "You can study the stars for 1 hour to forecast danger for the next 24 hours. The stars must be visible. You gain Advantage on up to two Initiative rolls. The benefit lasts 24 hours or until your next Long Rest. You can give the Advantage on one Initiative roll to another creature you see instead of using it yourself, but then you cannot use it yourself in that combat. Decide before the die is rolled."

_VOID_WHISPER = "Bonus Action right before you cast a level 1+ spell: speak a few words of Void Speech and weave them into the spell. One creature you see that the spell affects has Disadvantage on its next attack roll or ability check before the start of your next turn. You must be able to speak."
_VOID_REBUKE = "Reaction when a creature within 60 ft damages you: bark a word of Void Speech. If the creature can hear you, it takes Necrotic damage equal to half your Wizard level plus your Intelligence modifier. Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest. You must be able to speak."
_VOID_ECHO = "When you cast a Void spell that targets only one creature, it can target a second creature as well. You also have Advantage on Constitution saves to keep Concentration on Void spells."
_VOID_MANIFEST = "Magic action, speaking a long phrase of Void Speech: pick a point you see within 60 ft. A 20 ft radius around it is Dim Light for 1 minute. Creatures hostile to you in it gain Vulnerability to Necrotic damage and have Disadvantage on Wisdom checks. A creature that starts its turn there or enters it for the first time on a turn takes 3d6 Necrotic damage, or half on a successful Constitution save against your spell save DC. Rest to use again. You must be able to speak."

_ILLUSION_PERM = "Illusion spells you cast that need Concentration last 1 more round after you stop concentrating, if their full duration has not run out."

SUB = {
"Geomancy": {"spab": "INT",
 "f": {
  "Ley Line Savant": "Copying a ley line spell into your spellbook costs half the gold and time. Each time you gain a level, one of the two spells you add can be a ley line spell you have not found. You can sense ley lines within 1 mile, and as an Action learn the strength of the nearest one and its direction and distance.",
  "Channel Ley Line": "You can draw on ley lines to boost your spells. After a Short or Long Rest within 1 mile of a weak ley line, you can bind yourself to it. You can hold only one binding, and a new one replaces the old. While bound, you can channel that line from any distance on the same plane. Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest.",
  "Ley Line Manipulation": "When you boost a spell with a ley line, you can reroll the ley line's effect or a Ley Line Backlash result. You must keep the new result. After the reroll you cannot take a Reaction until the end of your next turn.",
  "Ley Line Adept": "You can bind to strong ley lines as well as weak ones. You add your Proficiency Bonus to the check made when you tap a ley line.",
  "Ley Line Mastery": "You can bind to titanic ley lines too, and you have Advantage on the check to tap a ley line. As an Action you can lock or unlock a ley line within 30 ft. A locked line always gives you one effect that you choose. After locking or unlocking, you must finish Long Rests before doing it again: 1 for a weak line, 2 for strong, 3 for titanic."},
 "lu": [{"feature": "Channel Ley Line", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Spell boost"}],
 "acts": {"Ley Line Mastery": "action"}},

"Illuminator": {"spab": "INT",
 "f": {
  "Illumination Magic Savant": "Copying an illumination spell into your spellbook costs half the gold and time.",
  "Omen of Warning": _OMEN,
  "Wizard Specialty": _SPECIALTY,
  "Master of the Radiant Heavens": "The spell attack modifier and spell save DC of your cantrips rise by 1 when you cast them in Dim Light or Darkness.",
  "Illusions of Permanence": _ILLUSION_PERM,
  "Comprehension of the Starry Sky": "During a Long Rest you can read a cosmic event in the visible stars. You store the insight in a held item that matters to you, such as a star chart or astrolabe. While holding it, a Bonus Action spends the insight for one effect. It is lost after 24 hours or at your next Long Rest. Comet: you change your appearance as with Alter Self, with no Concentration, until you finish a Long Rest. Conjunction: one creature you see has Disadvantage on a save against one Enchantment or Illusion spell you cast. Eclipse: when you cast a spell of level 5 or lower that deals Necrotic damage, you can reroll a number of its damage dice up to your Intelligence modifier (minimum 1) and must keep the new rolls."},
 "acts": {"Comprehension of the Starry Sky": "bonus"}},

"Master of Fiends": {"spab": "INT",
 "f": {
  "Dark Arts": "You add bonus spells to your spellbook at half the usual cost when you reach the Wizard level, if you do not know them yet: level 2 Hellish Rebuke, 4 Enthrall, 6 Nest of Infernal Vipers, 8 Conjure Fiends, 10 Channel Fiendish Power, 12 Aura of Wrath, 14 Plane Shift, 16 Dominate Monster, 18 Imprisonment.",
  "Fiendish Presence": "You gain proficiency in Deception, Intimidation or Persuasion, your choice. You can call on that presence for Advantage on one check with the chosen skill. Rest to use again.",
  "Hellbound": "Your soul is claimed by the fiends you bargained with. A caster who uses a spell to return you to life must make a Wisdom save at DC 12, plus 1 for every five levels you gain after 2, to a maximum of DC 15 at level 17. On a success the spell works. On a failure the spell ends and you stay dead. The GM may allow a bargain that lets you be raised anyway.",
  "Wizard Specialty": "This specialty suits a wizard who deals with fiends, either a diabolist (devils) or a demonologist (demons). " + _SPECIALTY,
  "Communion at the Crossroads": "At a liminal place such as a forest edge, a cave mouth or a doorway, you can perform a ritual that calls a dark spirit. You spend spell slots of your Wizard level or lower and gain a pool of dice equal to the number of slots spent. Spend dice as an Action to heal 1d8 Hit Points each, or add one extra die of the spell's damage die size to a spell you cast for each die spent. Long Rest to use again. Unused dice are lost when you rest, and your slots return as normal after the rest.",
  "Planar Defense": "You have Advantage on saves against spells and abilities of Celestials and Fiends that would Charm, Frighten, Paralyze, Restrain, Stun or possess you. If a Celestial or Fiend attacks you, you can cast Dispel Evil and Good as a Reaction when you have it prepared, or by spending a level 5 slot.",
  "Master of Dark Conjuration": "When you cast Magic Circle against Fiends, they have Disadvantage on Charisma saves to enter or leave the cylinder by teleportation or planar travel. Any Fiend you summon with a Conjuration spell gains 13 Temporary Hit Points."},
 "lu": [{"feature": "Fiendish Presence", "lvl": 3, "max": 1, "reset": "short", "tag": "Advantage on a check"}, {"feature": "Communion at the Crossroads", "lvl": 6, "max": 1, "reset": "long", "tag": "Ritual"}],
 "acts": {}},

"Necrophage": {"spab": "INT",
 "f": {
  "Undead Familiar": "Find Familiar is added to your spellbook if it is not there. The familiar you conjure is Undead instead of a Celestial, Fey or Fiend. It has the trait Undead Fortitude. When damage reduces it to 0 Hit Points, it makes a Constitution save at DC 5 plus the damage taken, unless the damage is Radiant or from a critical hit. On a success it drops to 1 Hit Point instead.",
  "Wizard Specialty": "A necrophage treats the Negative Plane as a great devourer that turns matter and life into necrotic energy and undead. Except as noted, you function as a Wizard and use the Wizard spell list. These features replace the matching features of the Wizard.",
  "Memory of Flesh": "Action: eat a bit of flesh from an Undead or a creature with Intelligence 6 or higher that died within the last hour. An unwilling target resists with a Constitution save at DC 14. On a failure you gain Temporary Hit Points equal to your Wizard level. If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. Both benefits last until you finish a Long Rest. You cannot target the same creature again within 24 hours, and using the feature on a new creature ends the earlier effect.",
  "Fruit of the Mind": "You can use Memory of Flesh to gain information as if you had cast Speak with Dead, instead of Temporary Hit Points and a skill. An unwilling target has Disadvantage on its save. The same 24 hour limit and new-target rule apply. A creature can be affected by this feature a number of times equal to its Constitution modifier, and after that further tries on it show nothing.",
  "Feed on Life": "After you use Memory of Flesh or Fruit of the Mind, until you finish a Long Rest you need no air, food, drink or sleep, you are immune to disease, the Poisoned condition, Poison damage and Necrotic damage, and your Hit Point maximum cannot be reduced."},
 "acts": {"Memory of Flesh": "action"}},

"Ring Warden": {"spab": "INT",
 "f": {
  "Transmutation Savant": "Copying a Transmutation spell into your spellbook costs half the gold and time.",
  "Ring Savant": "Copying a ring magic spell into your spellbook costs half the gold and time.",
  "Bonus Proficiency": "You gain proficiency with Smith's Tools or Jeweler's Tools, your choice.",
  "Bonded Ring-Staff": "You make a special Quarterstaff set with two metal rings. You can use it as an Arcane Focus. A new ring takes 8 hours of work with Smith's Tools or Jeweler's Tools and 5 gp of raw materials, and the staff can hold rings up to your Wizard level. When you roll damage for a spell while holding it, you can add your Proficiency Bonus to the result. With a spell that makes several damage rolls, such as Scorching Ray, choose the roll before rolling. Uses equal the number of rings on the staff, up to your Intelligence modifier (minimum 1), regained on a Short or Long Rest.",
  "Wizard Specialty": "Ring wardens blend dwarven craft with Transmutation and are known by their ring-staves. Except as noted, you function as a Wizard and use the Wizard spell list.",
  "Master Metalsmith": "With the tools you chose at level 2, you add double your Proficiency Bonus to checks and make double the normal crafting progress each day on mundane or magic items. You also learn how to craft one kind of magic ring from this list: Ring of Jumping, Ring of Mind Shielding, Ring of Protection, Ring of the Ram, Ring of Regeneration, Ring of Resistance. The GM may allow another ring. You still meet every normal prerequisite for crafting it and pay its cost and any special materials.",
  "Imbue Ring": "When you cast a spell, you can store it in one ring of your staff instead of letting it take effect. You do not regain the spell slot while the spell is stored. As an Action you can take an imbued ring off the staff and hold it or hand it over. A creature holding it can release the spell as an Action. Attack rolls, saves and damage use the original caster's numbers, but the holder counts as the caster for everything else. Dispel Magic treats a stored spell as an ongoing magical effect. You can have as many rings imbued as your Proficiency Bonus. Replacing a removed ring takes 8 hours of work and 5 gp of materials.",
  "Ring Bond": "With 1 hour of work, which can be a Short Rest, you can embed one magic ring you own into your ring-staff. The ring must be common, uncommon or rare. While you hold the staff, you get the ring's effects as if you were attuned and wearing it, including curses, and it does not count toward your three attuned items. Removing or swapping the ring also takes 1 hour."},
 "lu": [{"feature": "Bonded Ring-Staff", "lvl": 3, "max": "mod:INT", "reset": "short", "tag": "Add Proficiency Bonus to spell damage"}]},

"School of Illumination": {"spab": "INT",
 "f": {
  "Illumination Savant": "Copying an illumination spell into your spellbook costs half the gold and time.",
  "Omen of Warning": _OMEN,
  "Master of the Endless Night": "The spell attack modifier and spell save DC of your cantrips rise by 1 when you cast them in Dim Light or Darkness.",
  "Illusions of Permanence": _ILLUSION_PERM,
  "Comprehension of the Starry Sky": "During a Long Rest you can read a cosmic event in the visible stars. You store the insight in a held item that matters to you, such as a star chart or astrolabe. While holding it, a Bonus Action spends the insight for one effect. It is lost after 24 hours or at your next Long Rest. Comet: you change your appearance as with Alter Self, with no Concentration, until you finish a Long Rest. Conjunction: one creature you see has Disadvantage on a save against one Enchantment or Illusion spell you cast. Eclipse: when you cast a spell of level 5 or lower that deals Necrotic damage, you can reroll a number of its damage dice up to your Intelligence modifier (minimum 1) and must keep the new rolls. Nova: one Divination spell you cast counts as one slot level higher than the slot you used."},
 "acts": {"Comprehension of the Starry Sky": "bonus"}},

"Timekeeper": {"spab": "INT",
 "f": {
  "Temporal Magic Savant": "Copying a temporal spell into your spellbook costs half the gold and time.",
  "Temporal Points": "You have 2 temporal points at level 2 and gain 1 more with each Wizard level, up to 20 at level 20. You regain all spent points on a Long Rest. Spend 1 point as a Reaction or as a Bonus Action on your turn for one effect lasting 1 round. Option one: next turn, a Bonus Action to Dash, Disengage, Hide or Utilize. Option two: your AC rises by 2. Option three: Advantage on your next Dexterity check. You can spend 2 points as a Bonus Action to give one of these to a creature you touch.",
  "Wizard Specialty": "Timekeepers see time as a source of power. " + _SPECIALTY,
  "Extended Magic": "When you cast a spell with a duration of 1 minute or more, you can spend 1 temporal point to double the duration, up to 24 hours.",
  "Hastened": "Haste is added to your spellbook. You never suffer the lethargy when Haste ends. You can cast Haste on yourself without a slot. Rest to use again, though you can still cast it with a slot.",
  "Time Mastery": "You can choose to ignore a temporal spell that would affect you, such as Slow in your space, or automatically pass the save against a spell like Quick Time. You can also spend points. 2 points: a spell you cast with a 1 Action casting time takes a Bonus Action this once. 2 points: automatically pass a save against a temporal spell, decided after you see the roll. 5 points: as a Reaction when another creature casts Time Stop, you can act during it, taking turns after the caster. The caster ends the spell for everyone. If you end it, it ends only for you."},
 "lu": [{"feature": "Hastened", "lvl": 10, "max": 1, "reset": "short", "tag": "Free Haste on self"}],
 "acts": {"Temporal Points": "bonus"}},

"Void Caster": {"spab": "INT",
 "f": {
  "Void Affinity": "You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint.",
  "Whispers of the Void": _VOID_WHISPER,
  "Wizard Specialty": "Void casters study Void Speech with great care, because a careless read of a glyph-marked text can kill. Some seek knowledge or defense against what lies beyond, and others become conduits for it. " + _SPECIALTY,
  "Rebuke from Beyond": _VOID_REBUKE,
  "Powerful Echo": _VOID_ECHO,
  "Manifestation": _VOID_MANIFEST},
 "lu": [{"feature": "Rebuke from Beyond", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Reaction"}, {"feature": "Manifestation", "lvl": 14, "max": 1, "reset": "short", "tag": "Magic action"}],
 "acts": {"Whispers of the Void": "bonus", "Rebuke from Beyond": "reaction", "Manifestation": "action"}},

"Void Speaker": {"spab": "INT",
 "f": {
  "Void Savant": "Copying a void spell into your spellbook costs half the gold and time. Each time you gain a level, one of the two spells you add can be a void spell you have not found, and a new cantrip can be a void cantrip you have not found.",
  "Whispers of the Void": _VOID_WHISPER,
  "Rebuke from Beyond": _VOID_REBUKE,
  "Powerful Echo": _VOID_ECHO,
  "Manifestation": _VOID_MANIFEST},
 "lu": [{"feature": "Rebuke from Beyond", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Reaction"}, {"feature": "Manifestation", "lvl": 14, "max": 1, "reset": "short", "tag": "Magic action"}],
 "acts": {"Whispers of the Void": "bonus", "Rebuke from Beyond": "reaction", "Manifestation": "action"}},

"White Necromancer": {"spab": "INT",
 "f": {
  "Lore of Life and Death": "You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. You have Advantage on Intelligence (Religion) checks to recall lore about death gods, burial customs and the afterlife. You also learn the Spare the Dying cantrip, which is a Wizard cantrip for you and does not count against your cantrips known.",
  "Necromancy Savant": "Copying a Necromancy spell into your spellbook costs half the gold and time.",
  "Rebuke Death": "Action: heal a creature you touch for your Intelligence modifier plus your Wizard level (minimum 1) Hit Points. This cannot raise the creature above half its Hit Point maximum. A creature healed this way cannot benefit again until it finishes a Long Rest.",
  "Wizard Specialty": "You honor the cycle of life and death and use your power to aid the living. You can take this specialty only if your alignment is not evil. " + _SPECIALTY,
  "White Necromancy": "Animate Dead is added to your spellbook. When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. Its alignment matches yours. After its first 24 hours of service it may serve 24 more hours, if you succeed on a Charisma (Persuasion) check against DC 8 plus its challenge rating. The DC of each later check rises by 1, and you have Disadvantage if you were disrespectful to it in the last 24 hours. On a failure, or if you choose not to renew, it crumbles to dust. At Wizard level 11 you add Create Undead to your spellbook, and the same effects apply to it.",
  "Life Bond": "Warding Bond is added to your spellbook as a Wizard spell. You can cast it once without a slot or its Material component, and its duration becomes 4 hours. Long Rest to use again. You can still cast it normally with a slot.",
  "Protect Life": "Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. Affected creatures also have Advantage on saves against spells and effects that reduce Hit Point maximum, such as a Specter's Life Drain or Harm. Rest to use again."},
 "fx": [[3, "Lore of Life and Death", {"skills": ["Medicine", "Religion"]}]],
 "lu": [{"feature": "Life Bond", "lvl": 10, "max": 1, "reset": "long", "tag": "Warding Bond free"}, {"feature": "Protect Life", "lvl": 14, "max": 1, "reset": "short", "tag": "Action"}],
 "acts": {"Rebuke Death": "action", "Protect Life": "action"}},
}
