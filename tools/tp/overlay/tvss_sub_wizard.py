# Own-wording Wizard subclasses of Valda's Spire of Secrets (2024). Shape of tdcsr_sub.py.
SUB = {
"Chronomancer": {"spab": "INT",
 "f": {
  "Chronomancy Savant": "Spells tagged Chronomancy join your Wizard list (Haste, Slow and Time Stop have the tag). Add two Chronomancy Wizard spells of level 2 or lower to your spellbook free. Each time you gain a new spell slot level, add one more Chronomancy Wizard spell of a level you have slots for.",
  "Chronoshift": "Once per turn, when you cast a level 1+ Chronomancy spell, you take one extra action that turn. It can only be Dash, Disengage, Hide, Search, Study or Utilize.",
  "Retroactive Spell": "When you roll Initiative without Disadvantage, you cast a level 1-3 spell on yourself as if before combat began, with a slot and no action. It must take an action or Bonus Action, have a duration other than Instantaneous and deal no damage.",
  "Lag Spell": "When you cast a level 1+ Wizard spell, you can delay it by 1, 2 or 3 rounds after choosing targets and spending the slot. It resolves at the start of your turn, saves included. You can cast with a slot on the same turn it triggers. A delayed Concentration spell needs no Concentration until it takes effect. If the spell becomes impossible (a target left range) it fizzles. Rest to use again.",
  "Time Loop": "Reaction when a creature you see ends its turn: freeze time for everyone but it while it takes an extra turn. No time passes for others, you included unless it is you. The extra turn ends early if its actions or effects touch a creature other than itself or an object held or worn by someone else. Long Rest to use again."},
 "lu": [{"feature": "Lag Spell", "lvl": 10, "max": 1, "reset": "short", "tag": "Casting"}, {"feature": "Time Loop", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Time Loop": "reaction"}},

"Familiar Master": {"spab": "INT",
 "f": {
  "Beckon Familiar": "Find Familiar is in your spellbook free. You cast it as an action with no slot and no Material components, a number of times equal to your Intelligence modifier (minimum 1), regained on a Long Rest.",
  "Arcane Evolution": "When you start casting Find Familiar, you can make the familiar empowered. It can attack. The spell needs Concentration and lasts 10 minutes. It ends if the familiar vanishes or is dismissed. Its stats are replaced with the Evolved Familiar stat block but it keeps senses, traits, speeds, alignment, personality and creature type. It vanishes at 0 HP. Use the slot level as the spell level in the stat block (level 1 with no slot).",
  "Servitor's Agility": "While you have a familiar, by its special Speed (your pick if several): Burrow, Difficult Terrain costs you no extra movement. Climb, you have a Climb Speed equal to your Speed. Fly, Bonus Action for a Fly Speed of half your Speed until end of turn. Swim, you breathe underwater and have a Swim Speed equal to your Speed. None, Opportunity Attacks against you have Disadvantage.",
  "Bolster Familiar": "Bonus Action: your familiar gains Temporary HP equal to twice your Wizard level, and you can change its creature type and form from the Find Familiar list. Rest to use again, or spend a level 2+ slot (no action) to restore it.",
  "Planar Familiar": "By creature type. Celestial: when a creature within 60 ft of the familiar fails a D20 Test, the familiar's Reaction lets it reroll with Advantage and it must use the new roll. Fey: Bonus Action, teleport up to 30 ft to an open space it sees, and attacks against it have Disadvantage until its next turn starts. Fiend: when it takes the Attack action, it can replace an attack with a 5-ft Emanation of hellfire: Dexterity save against your spell DC, 4d6 Fire, half on a success."},
 "lu": [{"feature": "Beckon Familiar", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Find Familiar free"}, {"feature": "Bolster Familiar", "lvl": 10, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Beckon Familiar": "action", "Bolster Familiar": "bonus"}},

"Fumaturge": {"spab": "INT",
 "f": {
  "Fogcrafting": "Fog Cloud is in your spellbook free. When you cast Cloudkill, Fog Cloud, Incendiary Cloud or Stinking Cloud you can: make the area Difficult Terrain for creatures you choose, make the cloud not Heavily Obscured for you, remove any number of 5-ft Cubes from the area, and make it immune to dispersal by strong wind such as Gust of Wind.",
  "Smoke Animals": "Find Familiar is in your spellbook free. You can cast it as an action, with the familiar as a puff of smoke shaped like the chosen Beast. The smoke familiar has 1 HP and a Fly Speed of 60 ft whatever the Beast form.",
  "Gaseous Escape": "Gaseous Form is in your spellbook free. When you take Bludgeoning, Piercing or Slashing damage, cast it on yourself as a Reaction with no slot. Its Resistance applies to the triggering damage. Long Rest to use again, or spend a level 3+ slot.",
  "Greater Fogcrafting": "You automatically pass saves against Cloudkill, Incendiary Cloud and Stinking Cloud and take no damage from them. While fully inside the area of Cloudkill, Fog Cloud, Incendiary Cloud or Stinking Cloud, Bonus Action: teleport up to 60 ft to an open space also inside the area.",
  "Smoke Mage": "When you start casting Gaseous Form (also via Gaseous Escape) you can drop its Concentration. Its duration becomes 1 minute, your Fly Speed equals your Speed, and you can cast spells while shape-shifted. Long Rest to use again, or spend a level 6+ slot."},
 "lu": [{"feature": "Gaseous Escape", "lvl": 6, "max": 1, "reset": "long", "tag": "Reaction"}, {"feature": "Smoke Mage", "lvl": 14, "max": 1, "reset": "long", "tag": "Casting"}],
 "acts": {"Gaseous Escape": "reaction", "Greater Fogcrafting": "bonus"}},

"Gastronomer": {"spab": "INT",
 "f": {
  "Sous Chef": "You gain Cook's Utensils and proficiency with them, and can use them as a spellcasting focus for Wizard spells. You can cast Create Food and Water without a slot, with ingredients of your choice. Long Rest to use again.",
  "Monster Meal": "As part of a Short or Long Rest you can cook a meal for creatures equal to half your Wizard level plus your Intelligence modifier. Eaters gain Temporary HP equal to your Wizard level. Add one monster ingredient (a whole corpse slain in the last 24 hours or kept by Gentle Repose) for a benefit until a Long Rest by type. Aberration: critical hits against you become normal hits. Celestial: add 1d4 to attacks and saves. Dragon: +2 AC. Elemental: +10 ft Speed. Fey: immune to Charmed and Frightened. Fiend: resist Cold and Fire. Giant: Advantage on Strength checks and saves. Monstrosity: HP maximum and current +5. Ooze: Blindsight 10 ft. Plant: Difficult Terrain costs no extra movement.",
  "Arcane Condiments": "When you make a Monster Meal you can add a condiment by casting Comprehend Languages, Darkvision, Longstrider, Nondetection, See Invisibility or Water Breathing (prepared, slot spent as normal). Each eater gains the spell's benefit until a rest.",
  "Heroic Snacks": "You can cast Heroes' Feast with no slot and no Material components as an action. It makes snacks equal to your Intelligence modifier (minimum 1). A creature eats one as a Bonus Action for the spell's benefits, lasting 1 hour. Long Rest to use again.",
  "Five-Star Condiments": "As Arcane Condiments, but with Blur, Enlarge/Reduce, Fly, Invisibility or Protection from Energy. You keep Concentration on the spell for each affected creature, and it ends for all if you lose Concentration."},
 "lu": [{"feature": "Sous Chef", "lvl": 3, "max": 1, "reset": "long", "tag": "Create Food and Water free"}, {"feature": "Heroic Snacks", "lvl": 10, "max": 1, "reset": "long", "tag": "Heroes' Feast free"}],
 "acts": {},
 "grant": {"f": "Sous Chef", "tools": [[3, "Cook's Utensils"]]}},

"Magic Missile Mage": {"spab": "INT",
 "f": {
  "Magic Missile Savant": "Magic Missile is in your spellbook free. Extra Darts: it makes 1 more dart, 2 more at Wizard level 6, 3 more at 10, 4 more at 14. Free Casting: cast it with no slot a number of times equal to your Intelligence modifier (minimum 1). Short Rest regains one use, Long Rest all. Penetrating Darts: its darts bypass effects that block Magic Missile specifically, such as Shield.",
  "Versatile Missiles": "When you cast Magic Missile, give a target struck an effect by giving up darts for it. Trip, 1 dart: Strength save against your DC or Prone. Blinding, 3 darts: Constitution save or Blinded until your next turn starts. Stunning, 5 darts: Constitution save or Stunned until your next turn starts. Different targets can take different effects, each paid separately.",
  "Shield of Missiles": "When you cast Magic Missile you can set the darts orbiting you in a 10-ft Emanation for up to 1 minute. You gain AC equal to the darts orbiting (maximum +5). When a creature within 120 ft misses you, one dart hits it for normal damage and leaves orbit. You can also hit with any number of orbiting darts a creature that enters the Emanation, ends its turn there, or has the Emanation enter its space (once per creature per turn). Long Rest to use again, or spend a level 3+ slot.",
  "Giga-Missile": "When you cast Magic Missile, each dart deals extra Force damage equal to your Intelligence modifier (minimum 1). Long Rest to use again, or spend a level 6+ slot."},
 "lu": [{"feature": "Magic Missile Savant", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Free cast, a Short Rest regains 1", "n": "Magic Missile (free)"},
        {"feature": "Shield of Missiles", "lvl": 10, "max": 1, "reset": "long", "tag": "Casting"}, {"feature": "Giga-Missile", "lvl": 14, "max": 1, "reset": "long", "tag": "Casting"}]},

"Mystic Strategist": {"spab": "INT",
 "f": {
  "Battle Tactics": "You hold Battle Dice, d6s at first. Using one spends it. You regain all of them when you roll Initiative or finish a Short or Long Rest. The count and die size grow with level (2d6 at 3, 3d6 at 7, 3d8 at 13, 4d8 at 19). You spend them on maneuvers. A maneuver's save DC is your spell save DC.",
  "Maneuver Options": "Maneuvers for the Battle Dice. Bolstering Spell: Bonus Action and one die when you cast a timed spell on an ally, giving that ally Temporary HP equal to the roll plus your Intelligence modifier until the spell ends. Flash of Brilliance: when you fail an Intelligence or Wisdom check, add a die (once per turn). Morale Boost: Reaction when an ally within 60 ft fails a save, add a die. Potent Spell: Bonus Action, add a die to one damage roll of a spell you deal. Staggering Spell: when a creature fails a save against your spell, Bonus Action and a die halve its Speed and subtract the die from its next attack roll until your next turn starts. Unbreakable Concentration: Reaction when you fail a Concentration save, add a die.",
  "Arcane Assessment": "Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest.",
  "Spell Tactics": "Maneuver Burst: when a maneuver spends one Battle Die, spend a spell slot to roll two dice instead, adding or subtracting the total, and the second die is not spent. Strategic Recovery: Bonus Action, spend a spell slot to regain Battle Dice up to the slot's level.",
  "Supreme Stratagems": "Two more maneuvers. Inexorable Spell: when a creature passes a save against your spell, Bonus Action and 2 Battle Dice make it reroll with Disadvantage. Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. Each time it takes damage until the end of your next turn, it takes extra Necrotic damage equal to one Battle Die roll."},
 "lu": [{"feature": "Battle Tactics", "lvl": 3, "max": 2, "reset": "short", "tag": "Battle Dice (d6, more at 7, 13, 19)", "n": "Battle Dice"},
        {"feature": "Arcane Assessment", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Arcane Assessment": "bonus"}},

"Protomancer": {"spab": "INT",
 "f": {
  "Proto-Magic": "Add two Wizard spells tagged Protospell to your spellbook free. Each time you gain a new spell slot level, add one more Protospell Wizard spell free.",
  "Amnesia Surge": "When you cast a Wizard spell, you can also un-prepare one Wizard spell you have prepared (not an always-prepared one). Pick one benefit: Advantage on the spell's attack rolls, Disadvantage on one target's saves against it, or Advantage on your saving throws until your next turn starts.",
  "Vital Recovery": "When you use Arcane Recovery, spend Hit Point Dice up to your Intelligence modifier. The slots regained increase by the number of dice spent.",
  "Mnemonic Concentration": "When you fail a Constitution save to hold Concentration, use your Reaction to succeed instead. You un-prepare a Wizard spell of your choice (not an always-prepared one).",
  "Proto-Master": "Cast each prepared Protospell spell once without a slot, as a level 3 spell. Each one returns on a Long Rest."},
 "acts": {"Amnesia Surge": "free", "Mnemonic Concentration": "reaction"}},

"Scroll Scribe": {"spab": "INT",
 "f": {
  "Scrivener": "Copying spells into your spellbook costs 5 gp per spell level. You gain Calligrapher's Supplies and proficiency with them, and can use them as a focus for Wizard spells.",
  "Scribe Scroll": "After a Long Rest you can make temporary Spell Scrolls. Pick a level 1+ spell in your spellbook, spend a slot of that level and the components. The scroll lasts until your next Long Rest. Anyone who reads a language can cast it, using your save DC and attack bonus. A Magic action destroys a scroll and returns the slot. You can hold one scroll per spell level, up to level 5.",
  "Arcane Revision": "When you use Arcane Recovery you can make Scribe Scroll scrolls with the recovered slots. You can also swap the spell on each scroll for a prepared spell of the same level.",
  "Warding Scrawl": "A creature that casts a spell from one of your scrolls gains Temporary HP equal to your Wizard level plus the spell's level, and Advantage on Constitution saves to hold Concentration on it.",
  "Scroll Codex": "After a Long Rest you can also make one level 1, one level 2 and one level 3 scroll with no slots. They do not count against your scroll limit, cannot be recycled for slots, and cannot repeat a spell."},
 "acts": {"Scribe Scroll": "action"},
 "grant": {"f": "Scrivener", "tools": [[3, "Calligrapher's Supplies"]]}},

"Somnomancer": {"spab": "INT",
 "f": {
  "Somnambulist": "While Unconscious with at least 1 HP, you ignore the condition. Instead your Speed is halved and you have Disadvantage on D20 Tests. You can do light work, such as copying spells, while asleep without breaking a Long Rest.",
  "Deep Sleep": "Sleep is in your spellbook free. Cast it with no slot once per Short or Long Rest. A creature that fails its first save is Unconscious as if it failed the second. With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1.",
  "Hypnotize": "Spend 1 minute on a repetitive action to hypnotize a willing or Unconscious creature. It is Charmed for 1 minute. Mind-affecting effects on it are suppressed, it answers questions truthfully and recalls everything. You can cast Suggestion on it and it auto-fails the save. The Suggestion needs no Concentration and triggers on a command word. A new Subconscious Suggestion ends your earlier ones.",
  "Lucid Dream": "During a Long Rest you can cast Divination, Dream, Legend Lore or Scrying while asleep, with no slot and no Material components. It does not interrupt the rest.",
  "Nightmares": "Bonus Action: deal Psychic damage equal to your Wizard level to each Unconscious creature you see within 60 ft. This cannot end the Unconscious condition."},
 "lu": [{"feature": "Deep Sleep", "lvl": 3, "max": 1, "reset": "short", "tag": "Sleep free"}],
 "acts": {"Nightmares": "bonus"}},

"Tyromancer": {"spab": "INT",
 "f": {
  "Cheese Magic": "Your spells take on a cheese look. When you cast a spell, you can twist its name into a dairy pun. If the GM approves, pick one: gain Heroic Inspiration (once per Long Rest), Advantage on a spell attack roll, or Disadvantage on one target's first save against the spell. The book has a table of 40 sample puns.",
  "Ferment Spell": "When you cast a level 1+ spell with an action casting time that forces a save, change its save to Constitution. A creature that fails is Poisoned until the end of your next turn. Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest.",
  "Legen-Dairy Resistance": "When you fail a saving throw, choose to succeed instead. Long Rest to use again.",
  "Lactose Intolerance": "When you use Ferment Spell, the spell can deal extra Poison damage equal to half your Wizard level plus your Intelligence modifier."},
 "lu": [{"feature": "Cheese Magic", "lvl": 3, "max": 1, "reset": "long", "tag": "Heroic Inspiration"},
        {"feature": "Ferment Spell", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Casting"},
        {"feature": "Legen-Dairy Resistance", "lvl": 10, "max": 1, "reset": "long", "tag": "Free"}],
 "acts": {"Legen-Dairy Resistance": "free"}},

"Universalist": {"spab": "INT",
 "f": {
  "Arcane Excellence": "You have one extra spell slot. It is always your highest available slot level, to a maximum of level 7.",
  "Multidisciplinary Scholar": "Pick another skill from the Scholar feature. You gain Expertise in it.",
  "Universal Savant": "Add two Wizard spells of level 2 or lower to your spellbook free. Each time you gain a new spell slot level, add one Wizard spell of a level you have slots for.",
  "Eidetic Memory": "Memorize Spell becomes a Bonus Action, a number of times equal to your Intelligence modifier (minimum 1) per Long Rest.",
  "Spellwarp": "When you cast a spell that forces a save, change its save between Strength, Dexterity and Constitution, or between Intelligence, Wisdom and Charisma. Long Rest to use again, or spend a level 4+ slot (no action).",
  "Erudite Focus": "Magic action: focus your talent. It needs Concentration like a spell. While it lasts, a Bonus Action lets you Study, cast a Wizard cantrip with an action casting time, or use an action magic item. You also have Advantage on saves against spells."},
 "lu": [{"feature": "Eidetic Memory", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Spellwarp", "lvl": 10, "max": 1, "reset": "long", "tag": "Casting"}],
 "acts": {"Erudite Focus": "action", "Eidetic Memory": "bonus"}},

"Wand Wizard": {"spab": "INT",
 "f": {
  "Arcane Duelist": "Once per turn when you hit with a spell attack, pick one. Disarm: the target drops a Component Pouch or focus it holds, landing up to 15 ft away in a space you choose. Impair: the target has Disadvantage on its next spell attack before your next turn starts.",
  "Craft Wands": "After a Long Rest you can make temporary wands. Pick a level 1 spell in your spellbook with an action casting time (the level cap rises with Wizard level). Spend one or more slots. Charges equal the slot levels spent divided by the spell's level, plus 1. Spend a charge to cast the spell using your casting ability. The wand burns away when empty or at your next Long Rest. Arcane Recovery can restore wand charges instead of slots. Only you can use your wands. Total wands: 2 at level 3, 3 at 5, 4 at 9, 5 at 13, 6 at 17. No two wands hold the same spell.",
  "Wand Slinger": "Bonus Action: take the Magic action to activate a wand. Not allowed if you cast a level 1+ spell this turn, and you cannot cast one afterward this turn. Uses equal your Intelligence modifier (minimum 1) per Long Rest.",
  "Warding Shield": "Shield is in your spellbook free. When you fail a save, cast Shield with no slot. Its +5 applies to the triggering save, which can turn it into a success. Short or Long Rest to use again, or spend a level 3+ slot (no action).",
  "Remnant Recharge": "When you spend a wand's last charge, roll 1d6. On a 5 or 6 the charge is not spent."},
 "lu": [{"feature": "Wand Slinger", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Warding Shield", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Wand Slinger": "bonus", "Warding Shield": "reaction"}},
}
