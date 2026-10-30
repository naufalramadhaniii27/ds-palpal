# Own-wording Bard colleges of Valda's Spire of Secrets (2024).
SUB = {
"College of Bartending": {"spab": "CHA",
 "f": {
  "Bartender": "You gain Brewer's Supplies with proficiency, usable as a focus for Bard spells. You gain Insight proficiency and add your Charisma modifier (minimum +1) to Insight checks.",
  "Brew Cocktail": "Magic action: spend a spell slot to brew a magical cocktail. The book's cocktail table lists the slot level and Bard level each one needs (level 3, 6 and 14 tiers). A cocktail loses its magic after 1 minute if no one drinks it. The Drunk condition rules are in the book.",
  "Hangover": "Hangover is always prepared. Cast it as a Bonus Action with no slot. Long Rest to use again, or spend 2 Bardic Inspiration uses (no action).",
  "Alcoholic Adventurers": "Drunken Inspiration: a Drunk creature that rolls your Bardic Inspiration die adds twice its Drunkenness level. Numbing Buzz: when a Drunk creature within 120 ft starts its turn, give it Temporary HP equal to its Drunkenness level plus half your Bard level."},
 "lu": [{"feature": "Hangover", "lvl": 6, "max": 1, "reset": "long", "tag": "Bonus Action, free cast"}],
 "acts": {"Brew Cocktail": "action", "Hangover": "bonus"},
 "grant": {"f": "Bartender", "tools": [[3, "Brewer's Supplies"]]},
 "fx": [[3, "Bartender", {"skills": ["Insight"], "notes": [["Note", "Bartender: add Charisma modifier (min +1) to Insight checks"]]}]]},

"College of Birdsong": {"spab": "CHA",
 "f": {
  "Feathered Friends": "Speak with Animals is always prepared. You can cast it with no slot. If you do, it only lets you talk to Beasts and Monstrosities that have a Fly Speed.",
  "Birdsong": "When you give a creature Bardic Inspiration with a Bonus Action, you and that creature each gain a Fly Speed equal to your Speed until the end of your next turn. A creature still aloft then floats gently down.",
  "Zephyr's Blessing": "Zephyr's Feather is always prepared. When you cast it, each feather can orbit you or a willing creature you see within 60 ft. A creature can launch an orbiting feather as a Bonus Action, using your spell attack bonus. While a feather orbits it, the creature gets +2 to Dexterity saves, +10 ft Speed, and Opportunity Attacks against it have Disadvantage.",
  "Chorus of the Sky": "Birdsong's Fly Speed lasts 1 minute and ends at the end of the creature's turn if it spends its Bardic Inspiration die. A creature holding your die can spend it to take Attack (one weapon attack), Dash, Disengage, Dodge or Hide as a Bonus Action."},
 "acts": {}},

"College of Calligraphy": {"spab": "CHA",
 "f": {
  "Quill and Ink": "Arcane Flourish: when you cast a level 1-5 Bard spell that deals no damage, spend one Bardic Inspiration use to raise its effective level by 1. Brushstroke Components: cast any spell without Verbal components by writing them. It gains Somatic components if it lacked them. Scrivener: Calligrapher's Supplies with proficiency, usable as a Bard focus.",
  "Manuscript": "You keep a Tiny, 3 lb manuscript of 100 pages that only you or Identify can read. It starts with four Ritual spells from any list. Each Bard level after 3 adds one more Ritual spell of a level you have slots for. You can cast any manuscript spell with the Ritual tag as a ritual without preparing it, reading from the book. Copying a found Bard, Cleric, Druid or Wizard Ritual spell costs 2 hours and 50 gp per level. Copying a spell out of the manuscript costs 1 hour and 10 gp per level. If you lose it, you can recall some spells from memory (see the book).",
  "Spell Inscription": "When you cast a level 1-2 Bard spell with an action or Bonus Action casting time, you can inscribe it on a willing creature within 5 ft instead. A creature takes a Magic action to activate it, casting the spell with your attack bonus and save DC. A new inscription replaces the old. It fades after 1 hour. Uses equal your Charisma modifier (minimum 1) per Long Rest.",
  "Illuminated Spells": "After a Long Rest, add one prepared Bard spell of each level up to 5 to your manuscript as an Illuminated Spell. While you hold the manuscript you can cast each once with no slot. Unused ones vanish at your next Long Rest."},
 "lu": [{"feature": "Spell Inscription", "lvl": 6, "max": "mod:CHA", "reset": "long", "tag": "Casting"}],
 "acts": {"Spell Inscription": "free"},
 "grant": {"f": "Quill and Ink", "tools": [[3, "Calligrapher's Supplies"]]}},

"College of Cantors": {"spab": "CHA",
 "f": {
  "Chorus Leader": "You gain Religion proficiency and add your Charisma modifier (minimum +1) to Religion checks. You know Thaumaturgy, which doesn't count against your cantrips known, and cast it as a Bonus Action.",
  "Healing Hymn": "When you give a creature a Bardic Inspiration die, it rolls the die without spending it and regains HP equal to the roll plus your Charisma modifier.",
  "Minor Miracles": "When you cast Thaumaturgy, pick an effect. Dazzling Light: a creature in range has Disadvantage on Perception checks and on its next attack roll until your next turn starts. Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. Golden Ward: for 1 minute, an attacker that hits the warded creature takes Radiant damage equal to your Charisma modifier (minimum 1).",
  "Song of Life": "When Healing Hymn or a level 1+ healing spell restores HP, the creature regains 1d8 more, or 2d8 if Bloodied."},
 "acts": {"Thaumaturgy": "bonus"},
 "fx": [[3, "Chorus Leader", {"skills": ["Religion"], "notes": [["Note", "Chorus Leader: add Charisma modifier (min +1) to Religion checks"]]}]]},

"College of Chronology": {"spab": "CHA",
 "f": {
  "Chronomantic Secrets": "You know Moment to Think (not counted against your cantrips). You gain History proficiency and add your Charisma modifier (minimum +1) to History checks. Spells tagged Chronomancy join your Bard list (Haste, Slow and Time Stop have it). Pick two Chronomancy spells you have slots for. They are always prepared, and you can swap one each Bard level.",
  "Retroactive Inspiration": "Reaction: when a creature within 60 ft that can see or hear you fails a D20 Test, spend one Bardic Inspiration use to give it a die. It can roll that die at once and add it to the d20, maybe turning the failure into a success.",
  "Borrowed Time": "Action and Delay are always prepared. If you cast either with a level 2+ slot, its casting time becomes a Bonus Action.",
  "Reorder Events": "Reaction when an enemy starts its turn: take a second turn before it acts. You cannot cast spells with slots during it. Long Rest to use again, or spend a level 5+ slot (no action), once per round at most."},
 "lu": [{"feature": "Reorder Events", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Retroactive Inspiration": "reaction", "Reorder Events": "reaction"},
 "fx": [[3, "Chronomantic Secrets", {"skills": ["History"], "notes": [["Note", "Chronomantic Secrets: add Charisma modifier (min +1) to History checks"]]}]]},

"College of Dirges": {"spab": "CHA",
 "f": {
  "Death's Friend": "You know Spare the Dying and always have Gentle Repose prepared. Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. Short or Long Rest to use again.",
  "Dirge": "Bonus Action and one Bardic Inspiration die: play a dirge at a creature you see within 60 ft that can hear you. It makes a Wisdom save against your spell DC or is Frightened until the end of your next turn.",
  "Call of the Grave": "Reaction: when an enemy you see within 60 ft takes damage that leaves it with fewer HP than twice your Bard level, it drops to 0 HP. Short or Long Rest to use again, or spend a level 1+ slot (no action).",
  "Song of Sorrow": "When you Frighten a creature: if it is Bloodied, attacks have Advantage against it. Creatures within 60 ft that see it have Disadvantage on saves against or to end Frightened. It is also Incapacitated until it takes damage."},
 "lu": [{"feature": "Memento Mori", "lvl": 3, "max": 1, "reset": "short", "tag": "Regain Inspiration"}, {"feature": "Call of the Grave", "lvl": 6, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Dirge": "bonus", "Call of the Grave": "reaction"}},

"College of Jesters": {"spab": "CHA",
 "f": {
  "Acrobatic Clown": "You gain Acrobatics and Performance proficiency. Add your Charisma modifier (minimum +1) to Acrobatics checks and your Dexterity modifier (minimum +1) to Performance checks. You know Vicious Mockery.",
  "Tumbling Taunt": "Reaction when an enemy you see attacks you: spend one Bardic Inspiration use to mock it. Until your next turn starts, when it hits you, roll the die and subtract it from its attack roll. When it misses you, you can move 10 ft without Opportunity Attacks.",
  "Raconteur": "Vicious Mockery adds your Charisma modifier (minimum 1) to its damage, and you can cast it as a Bonus Action.",
  "Insult to Injury": "When a creature misses you with an attack, deal 2d8 Psychic damage to it, or give it Disadvantage on its next save against one of your spells before the end of your next turn (no action)."},
 "acts": {"Tumbling Taunt": "reaction", "Raconteur": "bonus"},
 "fx": [[3, "Acrobatic Clown", {"skills": ["Acrobatics", "Performance"], "notes": [["Note", "Acrobatic Clown: add Charisma modifier (min +1) to Acrobatics checks and Dexterity modifier (min +1) to Performance checks"]]}]]},

"College of the Mad God": {"spab": "CHA",
 "f": {
  "Outer Knowledge": "After a Long Rest you gain proficiency and Expertise in one skill chosen by the GM, who can change it each Long Rest.",
  "Mad Melody": "Bonus Action and one Bardic Inspiration use: start a 15-ft Emanation. A creature takes Psychic damage equal to one roll of your die (no die spent) when the Emanation enters its space, when it enters, or ends its turn there. Once per turn per creature. The Emanation also has a random effect (a table of 6 in the book, such as Difficult Terrain or Deafened). It lasts until the end of your next turn. A Bonus Action extends it 1 round (1 minute maximum) and re-rolls the effect.",
  "Frenzied Strings": "On rolling Initiative or as a Magic action, a creature you see within 60 ft that can hear you makes a Wisdom save against your spell DC. On a fail it is Frenzied for 1 minute. It treats everyone as an enemy and picks attack targets at random, and must make Opportunity Attacks when it can. It repeats the save at each turn end. Long Rest to use again, or spend a level 2+ slot (no action).",
  "Cacophonous Melody": "Mad Melody grows to a 30-ft Emanation and deals two rolls of your die. You can pick its effect instead of rolling."},
 "lu": [{"feature": "Frenzied Strings", "lvl": 6, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Mad Melody": "bonus", "Frenzied Strings": "action"}},

"College of Masks": {"spab": "CHA",
 "f": {
  "Persona Masks": "You gain 3 persona masks from the book's list, 4 at Bard level 6 and 5 at 14. Swap one after a Long Rest. Put on or switch a mask as a Bonus Action. Only you gain a mask's effects. A lost mask can be remade in 8 hours, during a Long Rest. Mask details are in the book.",
  "Virtuoso Skill": "Once per turn when you make a D20 Test, use Charisma instead if it does not already use it. Uses equal your Charisma modifier (minimum 1) per Long Rest.",
  "Master of Many Faces": "You can wear two masks at once and gain both."},
 "lu": [{"feature": "Virtuoso Skill", "lvl": 6, "max": "mod:CHA", "reset": "long", "tag": "D20 Test"}],
 "acts": {}},

"College of Opera": {"spab": "CHA",
 "f": {
  "Operatic Inspiration": "Magic action: start a 30-ft Emanation performance for 1 minute. When a creature starts its turn in it, you can give it a special Bardic Inspiration d4. A creature holds one die at a time, and these dice vanish when the Emanation ends. Long Rest to use again, or spend 2 Bardic Inspiration uses (no action).",
  "Vocalist": "Golden Voice: if you cast a spell with a Verbal component, ignore its Material components worth up to 100 gp. Your voice counts as a Musical Instrument you are proficient with.",
  "Heroic Ballad": "Divine Favor, Heroism and Longstrider are always prepared. When you start casting one, make it affect each creature you choose in a 30-ft Emanation. Casting time becomes 1 action and duration Concentration up to 1 minute. Long Rest to use again, or spend a level 2+ slot (no action).",
  "Overture": "Operatic Inspiration dice become d8. A creature that gets a special die while holding another die can roll one at once to regain HP equal to the roll plus your Charisma modifier (minimum 1)."},
 "lu": [{"feature": "Operatic Inspiration", "lvl": 3, "max": 1, "reset": "long", "tag": "Magic action"}, {"feature": "Heroic Ballad", "lvl": 6, "max": 1, "reset": "long", "tag": "Casting"}],
 "acts": {"Operatic Inspiration": "action"}},

"College of Origami": {"spab": "CHA",
 "f": {
  "Origami Familiar": "Find Familiar is always prepared. You can cast it as an action, with the familiar as a folded paper Beast. It has 1 HP and a Fly Speed of 60 ft whatever its form, and can flatten itself to slip through tight spaces.",
  "Paper Trinket": "Spend a Bardic Inspiration use for one of four shapes. Paper Airplane (Magic action): a 25-word message flies 100 ft per round up to 10 miles to its addressee, who can add 25 words and send it back. It turns mundane after 1 hour or one round trip. Paper Fortune Teller (Magic action): cast Guidance on an ally, who adds your Inspiration die instead of a d4 without spending it. Paper Lantern (Bonus Action): an ally within 5 ft can cast Dancing Lights for 1 hour, and Faerie Fire once with no slot at your DC. Paper Star (Bonus Action): throw a star as a ranged spell attack (see the book).",
  "Lucky Crane": "Magic action: give an ally within 5 ft a second, special Heroic Inspiration. If the ally spends it to reroll a D20 Test that still fails, it is not spent. Long Rest to use again, or spend a level 2+ slot (no action).",
  "Origami Fortune": "Magic action: the GM picks a level 5 or lower Bard, Cleric, Druid or Wizard spell (not a Reaction) that fits the moment, and you cast it as part of the action. Long Rest to use again."},
 "lu": [{"feature": "Lucky Crane", "lvl": 6, "max": 1, "reset": "long", "tag": "Magic action"}, {"feature": "Origami Fortune", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Lucky Crane": "action", "Origami Fortune": "action"}},

"College of Paint": {"spab": "CHA",
 "f": {
  "Painter": "Graffiti: Magic action with Painter's Supplies to paint a picture on any object within a 10-ft square. Palette and Brush: Painter's Supplies with proficiency, usable as a Bard focus.",
  "Colorful Casting": "Color Spray, Disguise Self and Silent Image are always prepared. When you start casting one, spend a Bardic Inspiration use to make it a Bonus Action.",
  "Marvelous Pigments": "After a Long Rest you create 1 pot of Marvelous Pigments. Unused pigments and what they made vanish at your next Long Rest. Spend a level 3+ slot to regain a used pot.",
  "Master Illustrator": "Speed Painting: use a pot as a Magic action instead of over 10 minutes. Animated Paintings: paint a creature that comes alive. It follows a summoning spell of the GM's choice (such as Summon Dragon at level 6) and needs your Concentration. Long Rest to use again."},
 "lu": [{"feature": "Marvelous Pigments", "lvl": 6, "max": 1, "reset": "long", "tag": "Pot"}, {"feature": "Master Illustrator", "lvl": 14, "max": 1, "reset": "long", "tag": "Animate"}],
 "acts": {},
 "grant": {"f": "Painter", "tools": [[3, "Painter's Supplies"]]}},

"College of Sculpture": {"spab": "CHA",
 "f": {
  "Sculpted Golem": "You have a golem companion that uses the Sculpted Golem stat block. In combat it acts on your turn and takes only Dodge unless you use a Bonus Action to command it. If you are Incapacitated it acts freely. If it died within the last hour, a Magic action touch revives it with 1 HP. A new golem costs 100 gp. It is clay at first, stone from Bard level 6, iron from level 14.",
  "Golem's Bulwark": "When you command the golem to attack with a Bonus Action, spend a Bardic Inspiration use to make it attack twice. It gains Temporary HP equal to the die roll plus your Charisma modifier.",
  "Sculpted Sentinel": "Golem's Redirection: Reaction when a creature it sees hits an ally within 5 ft, to make the attack target the golem instead (it hits if the roll meets the golem's AC, else misses). Golem's Vengeance: Reaction after a creature within 5 ft hits it in melee, to make one melee attack against that creature."},
 "acts": {"Sculpted Golem": "bonus"}},
}
