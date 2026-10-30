# Own-wording subclasses of Deep Magic (2014 rules), group E. Shape of tvss_sub_wizard.py. Feature names match the source exactly, odd capitals included.
# lu max: int | "pb" | "mod:WIS" | {"f": "mod:WIS", "min": 1} | list of 20. reset: short | long.

def _o(l, key, feature, title, lst, n=1):
    return {"l": l, "k": "opts", "n": n, "key": key, "feature": feature, "title": title, "list": [list(x) for x in lst]}

_CON1 = {"f": "mod:CON", "min": 1}
_CHA1 = {"f": "mod:CHA", "min": 1}
_WIS1 = {"f": "mod:WIS", "min": 1}

_ENTROPY_F = {
  "Bard College": "These Bards chase new challenges just to see what happens and trust luck to carry them through. People call them luck stealers, half in scorn and half in respect, because they walk away unharmed when everyone around them is in trouble.",
  "Bonus Proficiencies": "You gain proficiency in Acrobatics, Athletics and one gaming set of your choice.",
  "Luck Stealer": "Reaction: when a creature you see within 60 ft is about to make an attack roll, ability check or saving throw with Advantage, spend one Bardic Inspiration use. The creature takes a penalty to that roll equal to the number you roll on your Bardic Inspiration die. After the roll resolves, you gain that die as a bonus usable only on yourself. It lasts a number of rounds equal to the number rolled, then it is lost. Example: you roll a 5, so the target takes -5 and you can add +5 to one attack roll, ability check or saving throw within the next 5 rounds. Stealing luck, whether or not you use the die, risks a chaos magic surge.",
  "Infusion of Fortune": "When you cast a chaos spell, you cause a chaos magic surge and regain one use of Bardic Inspiration. Short or Long Rest to use this again.",
  "Belief is a Tool": "Action: swap one spell you know for another Bard spell of the same or a lower level. At the end of your next turn your known spells return to normal. Using this causes a chaos magic surge.",
}
_ENTROPY_X = {
 "lu": [{"feature": "Infusion of Fortune", "lvl": 6, "max": 1, "reset": "short", "tag": "Regain 1 Bardic Inspiration"}],
 "acts": {"Luck Stealer": "reaction", "Belief is a Tool": "action"},
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Acrobatics", "Athletics"], "notes": [["Note", "Bonus Proficiencies: one gaming set of your choice"]]}]],
}

SUB = {
"Aristocratic": {"spab": "CHA",
 "f": {
  "School Mastery": "You have a natural talent for one school of magic, set by your race in the book's table. You can cast the matching bonus spell from the list below without Material components. It does not count against your Sorcerer spells known, and a Long Rest restores its use.",
  "Aristocratic Bloodline Schools and Spells": "Schools and bonus spells: Abjuration, Alarm. Conjuration, Floating Disk. Divination, Identify. Enchantment, Hideous Laughter. Evocation, Burning Hands. Illusion, Illusory Script. Necromancy, False Life. Transmutation, Feather Fall. Whenever Spellcasting lets you learn a Sorcerer cantrip or a Sorcerer spell of level 1 or higher, you may pick it from the Wizard list instead, as long as it belongs to your school.",
  "Channel Energy": "Reaction when you succeed on a save against a spell of a level no higher than your Sorcerer level: you soak up its energy. You are unaffected, and you regain expended spell slots totaling the spell's level. You cannot go above your normal maximum slots, so if you lack open slots of a level you must take the nearest option. Example: a level 3 Sorcerer who saves against a level 2 spell may regain two level 1 slots or one level 2 slot. Across uses you can regain slots equal to twice your Sorcerer level. When you reach that total, finish a Short or Long Rest before using this again.",
  "Metamagic Mastery": "Applying Metamagic to a spell from your school costs 1 less Sorcery Point. A cost of 1 becomes half a point.",
  "Power of the Elite": "Spend 4 Sorcery Points to show the full power of your bloodline for 1 minute. You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. Creatures not of your race have Disadvantage on saves against your spells. Your spells also gain extra damage equal to your Charisma modifier. Long Rest to use again.",
  "Inexorable Might": "When you cast a spell, spend 2 Sorcery Points to make it harder to resist. A damaging spell lets you roll the damage twice and keep the higher result. A non-damaging spell gives its targets Disadvantage on the save."},
 "pick": [_o(3, "aris_school", "School Mastery", "Aristocratic school", [
   ["Abjuration", "Bonus spell: Alarm."], ["Conjuration", "Bonus spell: Floating Disk."], ["Divination", "Bonus spell: Identify."], ["Enchantment", "Bonus spell: Hideous Laughter."],
   ["Evocation", "Bonus spell: Burning Hands."], ["Illusion", "Bonus spell: Illusory Script."], ["Necromancy", "Bonus spell: False Life."], ["Transmutation", "Bonus spell: Feather Fall."]])],
 "lu": [{"feature": "Channel Energy", "lvl": 3, "max": 1, "reset": "short", "tag": "Reaction, until you regain 2x level slots"},
        {"feature": "Power of the Elite", "lvl": 14, "max": 1, "reset": "long", "tag": "4 Sorcery Points"}],
 "acts": {"Channel Energy": "reaction", "Power of the Elite": "action"}},

"Boreal Bloodline": {"spab": "CHA",
 "f": {
  "Sorcerous Origin": "Your magic descends from a Sorcerer who bargained with the God of the North Wind, or who struck a pact with beings of ice and snow. You might be the first of a new bloodline, born from a union with a wintry being, or the first to deal with a boreal power to master the might of winter magic.",
  "Numbing Cold": "A creature that takes Cold damage from one of your spells takes extra damage equal to your Charisma modifier.",
  "Winter'S Child": "You never suffer Extreme Cold, even in light clothing. You also move over snow and ice without Difficult Terrain penalties.",
  "Gelid Form": "You have Resistance to Cold damage. When you spend Sorcery Points on Metamagic for a spell that deals Cold damage or creates snow or ice (such as Sleet Storm), you can lower the cost by 1, to a minimum of 1 point.",
  "Winter'S Form": "Bonus Action and 1 Sorcery Point: take one of two forms for 1 minute. **Sleet.** You become a swirling mass of sleet or snow. Your gear transforms with you or drops in your space, your choice. You cannot speak, handle objects, attack or cast spells. You gain Immunity to Cold damage, Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, and Vulnerability to Fire damage. Your only movement is a 60 ft Fly Speed, and you can hover. You squeeze through gaps as narrow as 1 inch, treat liquids as solid ground, cannot fall, and keep hovering while Stunned or Incapacitated. You can enter another creature's space, and a creature whose space you occupy takes Cold damage equal to your Charisma modifier. **Ice.** Your body becomes blue-white ice and your hair a crown of snow. You gain Immunity to Cold damage, Resistance to nonmagical Bludgeoning damage and Vulnerability to Fire damage, and your AC is never lower than 15 plus your Dexterity modifier. A creature within 5 ft that hits you with a melee weapon attack or touch attack takes Cold damage equal to your Charisma modifier. You also gain an icy slam attack for 1d4 Bludgeoning plus Cold damage equal to your Charisma modifier.",
  "Winter's Soul": "You gain Immunity to Cold damage and Resistance to Fire damage. This Fire Resistance is off while you use Winter's Form, but then you also lose that form's Fire Vulnerability. When a creature fails its save against a spell of yours that deals Cold damage, it is also encased in ice and Grappled until it, or an ally of it within 5 ft, succeeds on a Strength check against your spell save DC. If the spell has no save, the creature makes one to avoid the Grapple. If the spell already causes Grappled, the save has Disadvantage."},
 "acts": {"Winter'S Form": "bonus"},
 "fx": [[3, "Winter'S Child", {"notes": [["Note", "Winter'S Child: never affected by Extreme Cold, ignore Difficult Terrain from snow and ice"]]}],
        [6, "Gelid Form", {"res": ["Cold"]}],
        [18, "Winter's Soul", {"imm": ["Cold"], "res": ["Fire"]}]]},

"Circle of Oaks": {"spab": "WIS",
 "f": {
  "Bonus Cantrip": "You learn the Tree Heal cantrip. Members of the circle often touch each tree they pass, in case it needs help.",
  "Circle Spells": "Your bonded forest gives you spells. Once you have a circle spell it is always prepared and does not count against your prepared spells. Circle spells you gain that are not on the Druid list count as Druid spells for you. Some are forest-bound and work only while you are bonded to a forest. If you lose the bond you lose those spells until you renew or form one. You can cast forest-bound spells outside your forest unless the spell says otherwise. Level 2: Tree Heal. Level 3: Forest Native, Tree Speak. Level 5: Legion of Rabid Squirrels, Ley Disturbance. Level 7: Freedom of Movement, Quick Time. Level 9: Commune with Nature, Lesser Ley Protection. Level 11: Conjure Forest Defender. Level 13: Greater Ley Protection. Level 15: Control Weather. Level 17: Forest Sanctuary.",
  "Forest Binding": "You can ask to be bound to a specific forest. The forest decides, and it never agrees automatically. It usually demands a service first, such as replanting after a war or fire, ending a pestilence, clearing contaminants from its borders or opposing its enemy. While bound, and on the same plane as the forest, you gain one extra spell slot of each level of Druid spell you can cast (level 1 and higher).",
  "Tree Walking": "Once per turn, spend half your movement to step into a living tree within reach and step out of a second living tree within 60 ft of the first. You appear in an open space within 5 ft of the second tree. Both trees must be Large or bigger. Worn and carried items come along, but other creatures do not. At Druid level 14 the second tree can be up to 100 ft away.",
  "Tree Merging": "Action: merge your spirit with a tree within 5 ft. Your body rests petrified and invisible in the Shadow Realm while your spirit knows what happens near the tree. Six hours merged with a tree in your bound forest counts as a Long Rest. No one outside can talk to you unless they cast Tree Speak or Speak with Plants. You leave the tree as an action and reappear in an open space within 5 ft of it. After 24 hours merged you must succeed on a DC 5 Constitution save to leave, and after 48 hours you have Disadvantage. Each month merged raises the DC by 1. On a failure you must wait 24 hours to try again. If you fail every day for a week, you are merged for good and only a Wish, or the tree's death, can free you. Many elder Oak druids choose this fate on purpose.",
  "Forest Restoration": "A ritual that heals a ruined forest or seeds a new one. Spend at least 8 hours a day for 3 months chanting and performing rites over a half-mile radius. After month 1, barriers to regrowth such as soil toxins and poisonous magic are gone. After month 2, native plants are seeded. After month 3, saplings sprout. If no new toxins arrive and the saplings survive, the half-mile radius of saplings grows into a one-mile radius forest within 1 year."},
 "acts": {"Tree Merging": "action"}},

"Circle of Owls": {"spab": "WIS",
 "f": {
  "Bonus Proficiency": "Gain proficiency in your choice of Deception or Stealth.",
  "Circle Spells": "You learn the Message cantrip. Circle spells are always prepared and do not count against your prepared spells. They count as Druid spells for you. Level 3: Detect Thoughts, Invisibility. Level 5: Nondetection, Sending. Level 7: Arcane Eye, Private Sanctum. Level 9: Modify Memory, Scrying.",
  "On Silent Wings": "You can take the Hide action even while a creature sees you, with nothing to obscure you. You stay hidden until the end of your next turn. If you have not found cover by then, you are no longer hidden. Uses equal your Wisdom modifier (minimum 1), regained on a Long Rest.",
  "Owl's Eyes": "Cast Clairvoyance once with no components and a casting time of 1 action. You can make the sensor visible as an owl. Long Rest to use again.",
  "Shadow Flight": "Action: cast Etherealness. Its duration is Concentration, up to 1 minute. Short or Long Rest to use again.",
  "Parliament of Owls": "Action: spend a Wild Shape use to become a swarm of owls."},
 "lu": [{"feature": "On Silent Wings", "lvl": 3, "max": _WIS1, "reset": "long", "tag": "Hide in plain sight"},
        {"feature": "Owl's Eyes", "lvl": 6, "max": 1, "reset": "long", "tag": "Clairvoyance"},
        {"feature": "Shadow Flight", "lvl": 10, "max": 1, "reset": "short", "tag": "Etherealness"}],
 "acts": {"On Silent Wings": "other", "Owl's Eyes": "action", "Shadow Flight": "action", "Parliament of Owls": "action"},
 "fx": [[3, "Bonus Proficiency", {"notes": [["Note", "Bonus Proficiency: choose Deception or Stealth"]]}]]},

"Circle of Roses": {"spab": "WIS",
 "f": {
  "Bittersweet Perfume": "Action and one Wild Shape use: make a mind-bending perfume instead of changing shape. One creature of your choice within 10 ft makes a Charisma save against your spell save DC. On later turns you can use an action to pick a different creature. A creature that fails is Charmed or Frightened by you (your choice) while it stays in the perfume and for 1 minute after it leaves. If it ends its turn outside the area it repeats the save and ends the effect on a success. If you or your allies attack or harm a Charmed creature, it is no longer Charmed. A creature that succeeds or whose effect ends is immune for 24 hours. Creatures that do not breathe or are immune to Poison are immune. The perfume lasts 10 minutes or until you use Wild Shape again.",
  "Bonus Proficiency": "Gain proficiency in one skill from Deception, Intimidation or Persuasion.",
  "Circle Spells": "You learn the Friends cantrip. Circle spells are always prepared and do not count against your prepared spells. They count as Druid spells for you. Level 3: Calm Emotions, Suggestion. Level 5: Hypnotic Pattern, Tongues. Level 7: Confusion, Phantasmal Killer. Level 9: Dominate Person, Geas. Level 2 also gives Poison Spray.",
  "Overpowering Remedy": "Your perfume now reaches one creature of your choice within 20 ft. When you use it, you may end one disease or one condition on a creature in the perfume instead of charming or frightening it. The condition can be Charmed, Frightened or Poisoned.",
  "Rose's Thorns": "Reaction: when a creature within 20 ft hits you with an attack, it makes a Wisdom save against your spell save DC. On a failure it takes 1d10 Psychic damage.",
  "Lingering Perfume": "A faint scent clings to you and trails behind you. You are immune to harmful gases and vapors and have Advantage on saves against being Charmed or Frightened. Bittersweet Perfume now lasts 1 hour or until you use Wild Shape again. Bonus Action: when a creature becomes Charmed or Frightened by your perfume, wrap more perfume around it. It counts as inside your perfume no matter how far it moves, for 1 hour or until you use Wild Shape again. Long Rest to use this bonus action again."},
 "lu": [{"feature": "Lingering Perfume", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action, wrap a creature"}],
 "acts": {"Bittersweet Perfume": "action", "Rose's Thorns": "reaction", "Lingering Perfume": "bonus"},
 "fx": [[3, "Bonus Proficiency", {"notes": [["Note", "Bonus Proficiency: choose Deception, Intimidation or Persuasion"]]}]]},

"Circle of the Spirits": {"spab": "WIS",
 "f": {
  "Circle Spells": "Circle spells are always prepared and do not count against your prepared spells. They count as Druid spells for you. Level 2: Find Familiar. Level 3: Augury, Invisibility. Level 5: Speak with Dead, Spirit Guardians. Level 7: Divination, Hallucinatory Terrain. Level 9: Antilife Shell, Scrying.",
  "Spirit Guide": "You gain a minor Spirit Guide. You can cast Find Familiar as a ritual. While you and the guide (your familiar) are within 100 ft, the guide can keep Concentration on a Druid spell you cast. Decide when you cast it who concentrates, and you cannot change this later. You still have only one Concentration effect at a time. If you concentrate on something else, the guide's Concentration ends. You can still share its senses and cast touch spells through it. The guide makes the Constitution saves when it takes damage, not you.",
  "Spirit Dance": "Bonus Action: dance to call on the spirit world. If you cast a Druid spell on your next turn, one target has Disadvantage on its first saving throw against it. Short or Long Rest to use again.",
  "Savior Spirits": "When you drop to 0 Hit Points but are not killed outright, you drop to 1 Hit Point instead. Long Rest to use again.",
  "Spirit Walk": "Action: dissolve into ectoplasm for up to 1 minute. You gain a Fly Speed equal to your base Speed. You have Resistance to Acid, Cold, Fire, Lightning, Thunder and nonmagical Bludgeoning, Piercing and Slashing damage. You cannot be Grappled, Petrified, knocked Prone or Restrained. You can move through creatures and solid objects as Difficult Terrain, but you take 1d10 Force damage if you end your turn inside an object. This needs Concentration like a spell. Short or Long Rest to use again."},
 "lu": [{"feature": "Spirit Dance", "lvl": 6, "max": 1, "reset": "short", "tag": "Bonus Action"},
        {"feature": "Savior Spirits", "lvl": 10, "max": 1, "reset": "long", "tag": "Drop to 1 HP"},
        {"feature": "Spirit Walk", "lvl": 14, "max": 1, "reset": "short", "tag": "Action, Concentration"}],
 "acts": {"Spirit Dance": "bonus", "Spirit Walk": "action"}},

"College of Entropy": {"spab": "CHA", "f": {k: v for k, v in _ENTROPY_F.items()}, **_ENTROPY_X},

"Entropy": {"spab": "CHA",
 "f": dict(_ENTROPY_F, **{"College of Entropy": "Entropy Bards are itinerant gamblers and thrill seekers whose actions nobody can predict. They gain Acrobatics, Athletics and a gaming set, steal luck from others, and take on risky magic that can set off chaos surges."}),
 **_ENTROPY_X},

"College of Wyrdsingers": {"spab": "CHA",
 "f": {
  "Braggart": "You are a master of boasting, and people listen to a bragger even if the story grows in the telling. Your proficiency bonus is doubled on Intimidation and Persuasion checks.",
  "Inspire Greatness": "Bonus Action: give an ally within 60 ft who can hear you a bonus equal to your Charisma modifier on attack rolls, damage rolls, ability checks and saving throws for a number of rounds equal to your Bard level. That ally cannot benefit from your Bardic Inspiration until this ends. Uses: 1 at level 3, 2 at level 8, 3 at level 15. A Long Rest restores them all. Also, as a Bonus Action you can cast any Abjuration spell you know that has a casting time of 1 action, such as Lesser Restoration. Long Rest to use that option again.",
  "Not This Day": "Reaction when an ally drops to 0 Hit Points: spend one Bardic Inspiration use. The ally gains Temporary Hit Points equal to the die roll and stays conscious. If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first.",
  "Make Your Own Fate": "Action: sing a song of valor for 1 minute. You are immune to the Frightened condition. Allies who carry your Bardic Inspiration share this immunity until they spend the die or the minute ends. You also add your Charisma modifier to your weapon damage and to the damage of your spells."},
 "lu": [{"feature": "Inspire Greatness", "lvl": 3, "max": [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3], "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Inspire Greatness": "bonus", "Not This Day": "reaction", "Make Your Own Fate": "action"},
 "fx": [[3, "Braggart", {"exp": ["Intimidation", "Persuasion"]}]]},

"Elemental Essence": {"spab": "CHA",
 "f": {
  "Elemental Heritage": "Choose Air, Earth, Fire or Water. You can speak, read and write the matching language, and the matching damage type powers your later features. Air: Primordial (Auran), Lightning or Thunder damage (choose one). Earth: Primordial (Terran), Bludgeoning damage. Fire: Primordial (Ignan), Fire damage. Water: Primordial (Aquan), Cold damage.",
  "Manifest Aura": "Bonus Action: wrap yourself in an aura of your element for 1 minute. When you are attacked, you can use your Reaction to impose Disadvantage on the attack roll. When you cast a spell of level 1 or higher, the aura flares until the start of your next turn. A creature that ends its turn within 5 ft of you or enters that area takes 1d6 damage of your heritage type, which becomes 2d6 at Sorcerer level 7. You can use this twice and regain all uses on a Long Rest.",
  "Infuse Elements": "You gain Resistance to the damage type of your heritage. When you damage a creature with a spell, spend 1 Sorcery Point to add an effect by heritage. **Air.** Winds, arcs of lightning and claps of thunder batter the target, which cannot take Reactions until the start of its next turn. **Earth.** The target is Restrained until the start of your next turn. **Fire.** The target is Frightened until the end of its next turn. Fire-immune creatures are unaffected. **Water.** The world pitches like waves, and the target is Poisoned until the end of its next turn.",
  "Elemental Jaunt": "Bonus Action: teleport up to 60 ft to an open space you see. When you arrive you can unleash an effect by heritage. All saves use your spell save DC. **Air.** Arrive within 5 ft of wind, natural or magical, to create a cyclone. Creatures within 10 ft make a Constitution save or take 2d6 Slashing damage and become Blinded until the start of your next turn. **Earth.** Arrive within 5 ft of nonmagical, unworked stone filling at least one 5-ft square to shake the ground. Creatures within 10 ft that touch the ground make a Strength save or take 4d6 Bludgeoning damage and fall Prone. **Fire.** Arrive within 5 ft of a fire at least campfire size to make a burst of flame. Creatures within 10 ft make a Dexterity save or take 2d6 Fire damage and catch fire. A burning creature takes 1d6 Fire damage at the start of each of its turns until a creature uses an action to douse it. **Water.** Arrive within 5 ft of at least 50 gallons of water to make a torrent. Creatures within 10 ft make a Constitution save or take 2d6 Bludgeoning damage and choke. A choking creature cannot speak and has Disadvantage on attack rolls and ability checks until the start of your next turn. Creatures that do not breathe or can breathe water are unaffected. You can use this twice and regain all uses on a Short or Long Rest.",
  "Elemental Soul": "You gain Immunity to the damage type of your heritage, plus a bonus by element. **Air.** A magical Fly Speed equal to your Speed. On your turn you can spend 1 Sorcery Point to become wind and mist until the start of your next turn. You can enter hostile creatures' spaces, move through gaps 1 inch wide, ignore Strong Wind and have Resistance to nonmagical Bludgeoning, Piercing and Slashing damage. **Earth.** A Burrow Speed equal to your Speed, through nonmagical, unworked earth and stone without disturbing it. You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. **Fire.** Speed +10 ft. On your turn you can spend 1 Sorcery Point to turn fiery and insubstantial until the start of your next turn and move through hostile creatures' spaces. The first time you enter a creature's space on a turn, it takes 1d10 Fire damage and catches fire, taking 1d10 Fire damage at the start of each of its turns until a creature uses an action to douse it. **Water.** A Swim Speed equal to your Speed and the ability to breathe water and air. On your turn you can spend 1 Sorcery Point to take a watery form until the start of your next turn. You can enter hostile creatures' spaces and move through gaps 1 inch wide. A hostile creature whose space you enter makes a Strength save against your spell save DC or falls Prone."},
 "pick": [_o(3, "ee_heritage", "Elemental Heritage", "Elemental heritage", [
   ["Air", "Language: Primordial (Auran). Damage type: Lightning or Thunder, choose one."],
   ["Earth", "Language: Primordial (Terran). Damage type: Bludgeoning."],
   ["Fire", "Language: Primordial (Ignan). Damage type: Fire."],
   ["Water", "Language: Primordial (Aquan). Damage type: Cold."]])],
 "lu": [{"feature": "Manifest Aura", "lvl": 3, "max": 2, "reset": "long", "tag": "Bonus Action"},
        {"feature": "Elemental Jaunt", "lvl": 14, "max": 2, "reset": "short", "tag": "Bonus Action, teleport 60 ft"}],
 "acts": {"Manifest Aura": "bonus", "Elemental Jaunt": "bonus"},
 "fx": [[3, "Elemental Heritage", {"langs": ["Primordial"]}]]},

"Farseer": {"spab": "CHA",
 "f": {
  "Blood of the Seer": "You gain proficiency in Insight and History. A sense of danger to come lets you roll Initiative with Advantage.",
  "Quickening": "Take the Dodge action as a Bonus Action on your turn. Uses equal your Constitution modifier (minimum 1), regained on a Short or Long Rest.",
  "Commune with the Unknown": "Focus for 1 minute on one yes-or-no question and put it to powers beyond. The one who answers knows a great deal but is not all-knowing. It can predict only what might happen, not what is certain. Phrase questions about the future in terms of what is possible or likely, to avoid a non-answer. Short or Long Rest to use again.",
  "Time Slip": "Action and 3 Sorcery Points: step out of sync with time for up to 1 minute, with Concentration. You show only as a shimmery outline. Attacks against you have Disadvantage and you have Resistance to nonmagical Bludgeoning, Piercing and Slashing damage. You can move through creatures and solid objects as Difficult Terrain. If you end your turn inside a solid object, you take 1d10 Force damage and are pushed to the nearest open space.",
  "Sharing the Dream": "Action: grant up to five creatures (you may be one) Advantage on attack rolls or saving throws for up to 1 minute, with Concentration. Each creature picks for itself. Pay 2 Sorcery Points per affected creature."},
 "lu": [{"feature": "Quickening", "lvl": 3, "max": _CON1, "reset": "short", "tag": "Bonus Action Dodge"},
        {"feature": "Commune with the Unknown", "lvl": 6, "max": 1, "reset": "short", "tag": "1 minute"}],
 "acts": {"Quickening": "bonus", "Commune with the Unknown": "other", "Time Slip": "action", "Sharing the Dream": "action"},
 "fx": [[3, "Blood of the Seer", {"skills": ["Insight", "History"], "notes": [["Note", "Blood of the Seer: Advantage on Initiative rolls"]]}]]},

"Greenleaf College": {"spab": "CHA",
 "f": {
  "Expanded Spell List": "These spells join the Bard list for you. Level 1: Entangle, Goodberry. Level 2: Pass without Trace, Spike Growth. Level 3: Conjure Animals, Daylight. Level 4: Conjure Woodland Beings, Dominate Beast. Level 5: Commune with Nature, Tree Stride.",
  "Rejuvenating Inspiration": "When a creature uses your Bardic Inspiration die on an ability check, attack roll or saving throw, it also gains Temporary Hit Points equal to the number rolled plus your Charisma modifier.",
  "Land's Stride": "Nonmagical Difficult Terrain costs you no extra movement. You pass through nonmagical plants without being slowed or hurt by thorns, spines or similar hazards. You have Advantage on saves against plants that are magically made or shaped to hinder movement, such as those from Entangle.",
  "Vital Surge": "Action and one Bardic Inspiration use: end one disease or one of these conditions on a creature you see within 60 ft: Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned."},
 "acts": {"Vital Surge": "action"}},

"Griffon Scout": {"spab": "WIS",
 "f": {
  "Mounted Scout": "You have Advantage on Dexterity (Stealth) checks while mounted, and your Stealth checks count for both you and your mount.",
  "Skirmisher's Step": "If you move at least 20 ft straight toward a creature and hit it with a melee weapon attack on the same turn, the attack deals an extra 1d8 damage of the weapon's type. Also, if you or your mount leave that target's reach before the end of your next turn, you do not provoke an Opportunity Attack from it.",
  "Coordinated Strikes": "Reaction: when an ally hits a target within 30 ft of you with an attack, make one weapon attack against that target.",
  "Griffon Wings": "When you cast Find Steed, your steed can take the form of a Griffon, though it is a Fey instead of a Monstrosity.",
  "Strike and Fade": "When you or your mount move at least 20 ft on your turn, you become an evasive blur. Until the start of your next turn, the first attack roll a creature makes against you or your mount has Disadvantage."},
 "acts": {"Coordinated Strikes": "reaction"}},

"Oath of Radiance": {"spab": "CHA",
 "f": {
  "Aura of Resolve": "You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. The benefit ends when someone fails a save that was made with Advantage from this aura. Then you need a Short or Long Rest before it works again. At level 18 the range is 30 ft.",
  "Soul of Light": "You cannot gain levels of shadow corruption. You have Resistance to Necrotic damage, and your ability scores and Hit Point maximum cannot be reduced.",
  "Radiant Champion": "Action: fill yourself with radiance for 1 minute. At the start of each of your turns you regain 10 Hit Points. Once on your turn when you hit an undead creature, a creature native to the Shadow Realm or one with levels of shadow corruption, it makes a Wisdom save against your spell save DC or is Incapacitated until the end of its next turn. Such a creature that touches you or hits you with a melee attack from within 5 ft takes 2d8 Radiant damage."},
 "pick": [_o(3, "rad_cd", "Channel Divinity", "Channel Divinity options", [
   ["Dawn's Radiance", "Action: present your holy symbol or a melee weapon. It flares like the rising sun and dispels magical darkness within 20 ft. It then keeps shining for 1 hour or until you lose it, with bright light out to 20 ft and dim light for another 20 ft. Undead, creatures native to the Shadow Realm or with levels of shadow corruption, and creatures harmed by sunlight suffer in this light. They have Disadvantage on attack rolls and on Dexterity (Stealth) and Wisdom (Perception) checks while they, the target of their attack or what they try to perceive is in the bright light."],
   ["Turn the Corrupted", "Action: present your holy symbol and speak a prayer against death and shadow. Each undead, and each creature native to the Shadow Realm or with levels of shadow corruption, within 30 ft that can see or hear you makes a Wisdom save or is turned for 1 minute or until it takes damage."]], n=2)],
 "lu": [],
 "acts": {"Radiant Champion": "action"},
 "fx": [[15, "Soul of Light", {"res": ["Necrotic"]}]]},

"Oath of the Annihilator": {"spab": "CHA",
 "f": {
  "Channel Divinity": "You gain two Channel Divinity options. **Vow of Ruin.** Bonus Action: for 1 minute, your successful attacks against objects and constructs count as critical hits. A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. **Wither Foe.** Action: present your holy symbol and speak a prayer of damnation over a creature you see within 60 ft. It makes a Charisma save. On a failure it takes Necrotic damage equal to your Charisma modifier plus your Paladin level, and it has Disadvantage on saving throws for 1 minute or until it drops to 0 Hit Points.",
  "Oath Spells": "You always have these spells prepared at the Paladin levels shown. Level 3: Bane, Proselytize. Level 5: Augury, Shatter. Level 9: Bestow Curse, Phantom Steed. Level 13: Blight, Caustic Waste. Level 17: Contagion, Hallow.",
  "Aura of Inevitability": "You and allies within 10 ft are immune to the Frightened condition. When you or an ally within 10 ft takes damage, reduce it by your Charisma modifier (minimum 1). At level 18 the range is 30 ft.",
  "Annihilating Smite": "When you use Divine Smite on a creature of Large size or smaller, it makes a Strength save or is knocked Prone.",
  "Harbinger of the End": "Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. When you reduce a creature to 0 Hit Points, you heal 20 Hit Points. Your attacks and spells ignore a target's damage Resistance. You add your Charisma modifier (minimum 1) to your saving throws. Long Rest to use again."},
 "lu": [{"feature": "Harbinger of the End", "lvl": 20, "max": 1, "reset": "long", "tag": "Action, 1 minute"}],
 "acts": {"Vow of Ruin": "bonus", "Wither Foe": "action", "Harbinger of the End": "action"}},

"Oath of Thunder": {"spab": "CHA",
 "f": {
  "Bonus Proficiency": "Gain proficiency in Stealth.",
  "Aura of Alacrity": "You and allies within 10 ft add your proficiency bonus to Initiative rolls. At level 18 the range is 30 ft.",
  "Strike Like Lightning": "When you hit a creature that has not yet taken its first turn in the combat, or when you hit a creature you were hidden from, that creature has Disadvantage on attack rolls, ability checks and saving throws until the start of your next turn.",
  "Child of the Storm": "Action: take on the aspect of the thunder god for 1 hour. Armor does not give you Disadvantage on Dexterity (Stealth) checks. You have Advantage on Dexterity (Stealth) checks and Initiative rolls. Your weapon attacks deal an extra 1d10 Lightning or Thunder damage, chosen on each hit. As an action you can unleash a war cry. Every enemy in a 30 ft Cone makes a Wisdom save or is Frightened of you for 1 minute. A Frightened creature spends its turn moving as far from you as it can, cannot take Reactions, and can only Dash, Dodge if it has nowhere to go, or try to escape an effect that blocks its movement. A Frightened creature more than 30 ft from you that cannot see you repeats the save at the start of its turn. A creature that succeeds is immune to the war cry for 24 hours. Long Rest to use the war cry again."},
 "pick": [_o(3, "thu_cd", "Channel Divinity", "Channel Divinity options", [
   ["Storm Strike", "Action: infuse a ranged or thrown weapon you hold with storm wrath and make a ranged weapon attack. You also create a line of lightning 5 ft wide and 60 ft long from you toward the target, extending past it if it is closer than 60 ft. Each creature in the line makes a Dexterity save and takes 2d10 plus your Paladin level Lightning damage, or half on a success. If your ranged attack hits, the target has Disadvantage on this save."],
   ["Turn the Unclean", "Action: present your holy symbol and utter a war cry. Each aberration or fiend within 30 ft that can see or hear you makes a Wisdom save or is turned for 1 minute or until it takes damage."]], n=2)],
 "lu": [{"feature": "Child of the Storm", "lvl": 20, "max": 1, "reset": "long", "tag": "War cry"}],
 "acts": {"Child of the Storm": "action"},
 "fx": [[3, "Bonus Proficiency", {"skills": ["Stealth"]}]]},

"Prescient Knight": {"spab": "INT",
 "f": {
  "Bonus Proficiency": "Gain proficiency in Arcana.",
  "Reactive Echo": "In a round when you use Action Surge, you can take a second Reaction.",
  "Spellcasting": "You cast Wizard spells with Intelligence. **Cantrips.** You know two Wizard cantrips and learn one more at Fighter level 10. **Slots.** Slots for level 1+ spells return on a Long Rest, and you can spend a slot of the spell's level or higher. **Spells known.** You learn three level 1 spells at level 3 and more as you advance. You may pick only Wizard spells from the Divination and Abjuration schools. You may also pick any Divination spell with a casting time of 1 Reaction or 1 Bonus Action, even if it is not on the Wizard list. New picks follow the same limits. Each Fighter level lets you swap one known spell. **Table (Fighter level: cantrips, spells known, slots of level 1/2/3/4).** 3: 2, 3, 2. 4: 2, 4, 3. 5 and 6: 2, 4, 3. 7: 2, 5, 4/2. 8 and 9: 2, 6, 4/2. 10: 3, 7, 4/3. 11 and 12: 3, 8, 4/3. 13: 3, 9, 4/3/2. 14 and 15: 3, 10, 4/3/2. 16 to 18: 3, 11, 4/3/3. 19: 3, 12, 4/3/3/1. 20: 3, 13, 4/3/3/1.",
  "Martial Caster": "You can cast spells that have Somatic components while wielding a weapon or shield you are proficient with.",
  "Constant Vigilance": "If you are surprised but not Incapacitated when combat starts, you can use Action Surge to cancel the surprise. You then take a normal turn plus the extra action from Action Surge in the first round. Allies within 15 ft are warned too, so they can take Reactions after your turn.",
  "Evasion": "When an effect lets you make a Dexterity save for half damage, you take no damage on a success and half damage on a failure.",
  "Anticipatory Strike": "When you use Action Surge, you have Advantage on attack rolls and +2 to AC until the end of your next turn.",
  "Action Free of Thought": "In combat, you can take one Reaction every turn instead of one per round."},
 "acts": {},
 "fx": [[3, "Bonus Proficiency", {"skills": ["Arcana"]}]]},

"Serophage": {"spab": "CHA",
 "f": {
  "Sorcerous Origin": "A Serophage learns early that they can steer their own blood, and that this awakens the magic in their veins. The dark side shows when they find they can control the blood of other creatures too.",
  "Strength Beneath the Skin": "You steer blood away from fresh wounds. When you take Bludgeoning damage, roll a d4 and subtract it from the damage. At level 6 the die is a d6.",
  "Blood Fuel": "Instead of moving, you can deal 1d4 Slashing damage to yourself and regain Sorcery Points equal to that damage. Or you can instead raise the save DC or spell attack bonus of the next spell you cast by 1. At level 12 the die is a d8 and the bonus is 2.",
  "Blood Barrier": "Draw blood from a creature of Intelligence 5 or higher killed within the last 30 minutes and shape it into swirling rings around you. You get rings equal to your Charisma modifier. When a melee or ranged weapon attack hits you, one ring absorbs 1d10 damage from it and bursts. Action: turn one ring into a magic spear and send it at a target within 60 ft. Make a ranged spell attack. On a hit the target takes Piercing damage equal to 1d6 plus your Charisma modifier and makes a Constitution save or is Stunned until the start of your next turn. The spear evaporates after use. A ring lasts until it absorbs damage or is thrown.",
  "Siphon Blood": "Action: pick a living creature within 40 ft. It makes a Constitution save. On a failure it takes 2d6 Necrotic damage as blood flows from it to you. For every 2 damage dealt, you regain 1 Hit Point or 1 Sorcery Point. The drain repeats at the start of each of your turns, dealing damage and restoring points, until you end it (no action), or until the target succeeds on a Constitution save at the end of its turn.",
  "Exsanguinate": "Action: pick a living creature within 40 ft. It makes a Constitution save. On a failure it takes 2d6 Necrotic damage as blood flows from it to you. For every 2 damage dealt, you regain 1 Hit Point or 1 Sorcery Point. The drain repeats at the start of each of your turns, dealing damage and restoring points, until you end it (no action), or until the target succeeds on a Constitution save at the end of its turn."},
 "acts": {"Blood Barrier": "action", "Siphon Blood": "action", "Exsanguinate": "action"}},

"Shadow Bloodline": {"spab": "CHA",
 "f": {
  "Evil Eye": "Bonus Action: mark a creature you see within 60 ft with Darkness. Unless it succeeds on a Charisma save, it has Disadvantage on its next attack roll or skill check that involves sight. Uses equal your Charisma modifier (minimum 1), regained on a Long Rest.",
  "Taint of Shadow": "Your magic bends in strange ways, like fire that burns purple and casts inky shadows. You gain Darkvision out to 60 ft, and within that range you see through magical darkness as if it were dim light.",
  "Dark Illusions": "You have Advantage on saves against Illusion magic. You can also cast Blur or Mirror Image by spending 2 Sorcery Points.",
  "Passage Through the Dark": "Bonus Action: when you are in a lightly or heavily obscured area, step through one shadow and come out of another within 200 ft. You can stay in the shadow link for a number of rounds equal to your Charisma modifier (minimum 1). While there you are invisible, nothing can affect you and you cannot affect anything. Each use costs 4 Sorcery Points.",
  "Tainted Shadows": "Spend 4 Sorcery Points to radiate shadow energy in a 15 ft radius until the start of your next turn. The area is lightly obscured by dim light, and any part already dim becomes dark. Enemies that start their turn in it take 10 Necrotic damage and make a Wisdom save or become Frightened."},
 "lu": [{"feature": "Evil Eye", "lvl": 3, "max": _CHA1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Evil Eye": "bonus", "Passage Through the Dark": "bonus"},
 "fx": [[3, "Taint of Shadow", {"senses": [["Darkvision", 60, ""]], "notes": [["Note", "Taint of Shadow: you see through magical darkness within your Darkvision range as if it were dim light"]]}]]},

"The Frozen One": {"spab": "CHA",
 "f": {
  "Deflective Ice": "Reaction when a creature makes a weapon attack against you: a chunk of ice shields you and the attack has Disadvantage. The ice melts right after, whatever the result. Short or Long Rest to use again.",
  "Expanded Spell List": "You can pick from extra spells when you learn a Warlock spell. They join the Warlock list for you. Level 1: Create or Destroy Water, Fog Cloud. Level 2: Blur, Ice Hammer. Level 3: Protection from Energy (Cold only), Sleet Storm. Level 4: Ice Storm, Wintry Glide. Level 5: Cone of Cold, Ice Fortress.",
  "Frozen Path": "As part of your move, leave a layer of ice behind you for 1 minute. A creature other than you that enters an icy space makes a Dexterity save against your spell save DC or falls Prone there. Short or Long Rest to use again.",
  "Icy Body": "You are immune to Cold damage and have Advantage on Strength and Dexterity checks to escape being Grappled.",
  "Wintry Blast": "Pick a creature you see within 60 ft. It makes a Constitution save against your Warlock spell save DC. On a failure it takes 10d10 Cold damage and makes a second Constitution save. If that one fails, it is also Restrained for 1 minute and repeats the save at the end of each of its turns, ending the effect on a success. Short or Long Rest to use again."},
 "pick": [
   _o(3, "frozen_pb", "Expanded Spell List", "Pact Boon (The Frozen One)", [
     ["Pact of the Blade (The Frozen One)", "Use your action to make a pact weapon in your empty hand, in any melee weapon form you pick each time. You are proficient with it and it counts as magical. It vanishes if it is 5 ft or more away from you for 1 minute, if you make another, if you dismiss it (no action) or if you die. A 1-hour ritual (can be done in a Short Rest) lets you bind a magic weapon as your pact weapon, and it returns when you dismiss it to an extradimensional space. An artifact or sentient weapon cannot be bound. The bond ends if you die, bond another weapon or break it with a 1-hour ritual. Frozen One rider: your weapon is rimed with ice and hung with small icicles. When you create or summon it, you may have it deal Cold damage instead of its normal type."],
     ["Pact of the Chain (The Frozen One)", "You learn Find Familiar and can cast it as a ritual without it counting against your spells known. Your familiar can take a normal form or imp, pseudodragon, quasit or sprite. When you take the Attack action, you can give up one attack so that your familiar uses its Reaction to make one attack. Frozen One rider: you can also pick an ice mephit. When you command it to attack, it may use its breath or an innate spell instead."],
     ["Pact of the Tome (The Frozen One)", "Your patron gives you a Book of Shadows. Choose three cantrips from any class list. They need not share a list. While the book is on you, you can cast them at will, they do not count against your cantrips known, and they count as Warlock cantrips. A 1-hour ceremony (Short or Long Rest) replaces a lost book and destroys the old one. The book turns to ash when you die. Frozen One rider: the book is made of rune-etched sheets of ice that feel cold to everyone but you. It is immune to Cold damage."]]),
   _o(3, "frozen_ei3", "Expanded Spell List", "Frozen One invocation (Warlock level 3)", [
     ["Boreal Aura", "Prerequisite: Warlock level 3, patron The Frozen One. Ice and snow swirl around you while you hold Concentration. Your melee attacks deal an extra 1d6 Cold damage. A creature within 5 ft that hits you in melee takes 1d6 Cold damage."]]),
   _o(5, "frozen_ei5", "Expanded Spell List", "Frozen One invocation (Warlock level 5)", [
     ["Horrific Wintry Visage", "Prerequisite: Warlock level 5, patron The Frozen One. Cast Sculpt Snow once using a Warlock slot. A creature that sees your sculpture for the first time makes a Wisdom save against your spell save DC or is Frightened of it for 1 round. Long Rest to use again."]])],
 "lu": [{"feature": "Deflective Ice", "lvl": 3, "max": 1, "reset": "short", "tag": "Reaction"},
        {"feature": "Frozen Path", "lvl": 6, "max": 1, "reset": "short", "tag": "Part of your move"},
        {"feature": "Wintry Blast", "lvl": 14, "max": 1, "reset": "short", "tag": "10d10 Cold"}],
 "acts": {"Deflective Ice": "reaction", "Wintry Blast": "action"},
 "fx": [[10, "Icy Body", {"imm": ["Cold"], "notes": [["Note", "Icy Body: Advantage on Strength and Dexterity checks to escape a Grapple"]]}]]},

"The Genie Lord": {"spab": "CHA",
 "f": {
  "Expanded Spell List": "You can pick from extra spells when you learn a Warlock spell. They join the Warlock list for you, and you may pick an elemental magic spell when you learn a new one. Level 1: Chromatic Orb, Thunderwave. Level 2: Gust of Wind, Sleet Storm. Level 3: Protection from Energy, Water Breathing. Level 4: Conjure Minor Elementals, Fire Shield. Level 5: Creation, Wall of Stone.",
  "Genie Lord's Favor": "You can speak, read and write Primordial, and you understand and can be understood by anyone who speaks Auran, Ignan, Terran or Aquan. Your patron also gives you a magical gemstone token that absorbs elemental power. It works as an arcane focus. When you take Acid, Cold, Fire, Lightning or Thunder damage, you can send some of it into the gem instead. Its capacity is twice your Warlock level plus your Charisma modifier, and it empties on a Long Rest. While it holds any power, you can use an action to make it shed bright light for 20 ft and dim light for 20 ft more, or dim light for 5 ft, or to douse it. If you lose it, a 1-hour ceremony (during a Short or Long Rest) brings a replacement and destroys the old token. When you die the token splinters.",
  "Release Energy": "You can spend stored points from your gem to add damage of a stored type equal to your Charisma modifier when you damage a target with a spell or attack. If a single source hits several targets, you choose which one takes the extra damage. Also, Reaction: when an ally within 30 ft that you see takes damage of a type the gem can absorb, you can move some of it into your gem.",
  "Minor Wish": "Right after you make an attack roll, saving throw, ability check or damage roll, you can reroll it and take the better result. Short or Long Rest to use again.",
  "Herald's Aspect": "Bonus Action: take the form of a herald of your Genie Lord for 1 minute. Your legs fade into elemental energy and your features take on your patron's cast. You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. Choose Acid, Cold, Fire, Lightning or Thunder and gain Immunity to it. Once on your turn when you hit with an attack or spell, you can deal an extra 3d6 damage of any of those five types. Short or Long Rest to use again."},
 "pick": [_o(3, "genie_pb", "Genie Lord's Favor", "Pact Boon (The Genie Lord)", [
   ["Pact of the Blade (The Genie Lord)", "Use your action to make a pact weapon in your empty hand, in any melee weapon form you pick each time. You are proficient with it and it counts as magical. It vanishes if it is 5 ft or more away from you for 1 minute, if you make another, if you dismiss it (no action) or if you die. A 1-hour ritual (can be done in a Short Rest) lets you bind a magic weapon as your pact weapon, and it returns when you dismiss it to an extradimensional space. An artifact or sentient weapon cannot be bound. The bond ends if you die, bond another weapon or break it with a 1-hour ritual. Genie Lord rider: when you create or summon your weapon, you may change its damage type to Acid, Cold, Fire, Lightning or Thunder. Repeat the ceremony to change it again."],
   ["Pact of the Chain (The Genie Lord)", "You learn Find Familiar and can cast it as a ritual without it counting against your spells known. Your familiar can take a normal form or imp, pseudodragon, quasit or sprite. When you take the Attack action, you can give up one attack so that your familiar uses its Reaction to make one attack. Genie Lord rider: you can also pick a mephit. When you command it to attack, it may use its breath or an innate spell instead."],
   ["Pact of the Tome (The Genie Lord)", "Your patron gives you a Book of Shadows. Choose three cantrips from any class list. They need not share a list. While the book is on you, you can cast them at will, they do not count against your cantrips known, and they count as Warlock cantrips. A 1-hour ceremony (Short or Long Rest) replaces a lost book and destroys the old one. The book turns to ash when you die. Genie Lord rider: the book is immune to damage and wear from the elements, including being soaked in water and Acid, Cold, Fire, Lightning or Thunder damage."]])],
 "lu": [{"feature": "Minor Wish", "lvl": 10, "max": 1, "reset": "short", "tag": "Reroll, take better"},
        {"feature": "Herald's Aspect", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action, 1 minute"}],
 "acts": {"Release Energy": "reaction", "Herald's Aspect": "bonus"},
 "fx": [[3, "Genie Lord's Favor", {"langs": ["Primordial"], "notes": [["Note", "Genie Lord's Favor: you understand Auran, Ignan, Terran and Aquan"]]}]]},

"The Great Machine": {"spab": "CHA",
 "f": {
  "Clock's Unwinding": "At the start of another creature's turn (friend or foe), before it moves or acts, you can shift your place in the initiative order to just before it. If you have not taken your turn this round, you take it now. If you already acted this round, you can move or take one action now, not both. Either way your spot in the initiative order moves to the new place. Short or Long Rest to use again. **Expanded Spell List.** You can pick from extra spells when you learn a Warlock spell. They join the Warlock list for you. Level 1: Pendulum, Tireless. Level 2: Armored Heart, Lock Armor. Level 3: Thousand Darts, Winding Key. Level 4: Legend Lore, Steam Blast. Level 5: Animate Objects, Mechanical Union.",
  "The Great Machine and Your Pact Boon": "**Chain.** The Great Machine gives you a clockwork familiar instead of a normal one. **Blade.** Your blade is a thing of gears and clockwork that changes shape as it unfolds for combat. **Tome.** Instead of a book you get a pocket-sized device full of cogs covered in arcane script. You work its small buttons and levers to cast each cantrip. If the Book of Ancient Secrets invocation adds spells to it, you add new gears instead of pages.",
  "Machinelike Precision": "When you miss with an attack, reroll it with Advantage. Short or Long Rest to use again.",
  "Undying Nature": "You are immune to Psychic damage, and no one can read your thoughts unless you allow it.",
  "Indestructible Life": "Action: pick a creature you see within 60 ft. It makes a Charisma save against your Warlock spell save DC. On a failure it glimpses your patron's mind and its place in the great plan, taking 10d10 Psychic damage, and makes a second Charisma save. If that one fails, it is also Stunned for 1 minute. Short or Long Rest to use again."},
 "pick": [_o(3, "gm_ei", "Clock's Unwinding", "Great Machine invocation (take in place of a normal invocation)", [
   ["Cloud of Cogs", "Prerequisite: patron The Great Machine, Warlock level 3. Cast Gear Barrage once using a Warlock spell slot. Long Rest to use again."],
   ["Heat of the Furnace", "Prerequisite: patron The Great Machine, Warlock level 3. While you hold Concentration, your melee attacks deal an extra 1d6 Fire damage. A creature within 5 ft that hits you in melee takes 1d6 Fire damage. The heat does not harm your gear."],
   ["Voice of the Machine", "Prerequisite: patron The Great Machine. Your spells that Charm or Frighten overcome a construct's immunity to those conditions. Saves work normally."]])],
 "lu": [{"feature": "Clock's Unwinding", "lvl": 3, "max": 1, "reset": "short", "tag": "Shift initiative"},
        {"feature": "Machinelike Precision", "lvl": 6, "max": 1, "reset": "short", "tag": "Reroll a miss with Advantage"},
        {"feature": "Indestructible Life", "lvl": 14, "max": 1, "reset": "short", "tag": "10d10 Psychic"}],
 "acts": {"Clock's Unwinding": "other", "Indestructible Life": "action"},
 "fx": [[10, "Undying Nature", {"imm": ["Psychic"]}]]},

"The Sibyl": {"spab": "CHA",
 "f": {
  "Expanded Spell List": "You can pick from extra spells when you learn a Warlock spell. They join the Warlock list for you. Level 1: Alarm, Seer's Reaction. Level 2: Augury, Blindness/Deafness. Level 3: Bestow Curse, Clairvoyance. Level 4: Confusion, Divination. Level 5: Eidetic Memory, Legend Lore.",
  "Touched by the Sibyl": "Your link to your patron makes you babble and speak in ecstatic fits. The prophecy-laden outbursts are unsettling and hurt the mind of your target. This works exactly like the Vicious Mockery cantrip. You are also proficient in Performance and double your proficiency bonus on Performance checks.",
  "Touched by the Sybil": "Your link to your patron makes you babble and speak in ecstatic fits. The prophecy-laden outbursts are unsettling and hurt the mind of your target. This works exactly like the Vicious Mockery cantrip. You are also proficient in Performance and double your proficiency bonus on Performance checks.",
  "The Sybil and your Pact Boons": "You pick Blade, Chain or Tome when you pledge yourself to a patron, and you receive a pact boon artifact. The Sibyl adds a rider to each. **Blade.** When you create or summon your pact weapon, you may have it deal Psychic damage instead of its normal type. **Chain.** Your familiar is a giant moth. **Tome.** Your book is an illuminated manuscript showing prophets who foretold future events. New pictures appear showing your deeds for your patron. While it is on you, your passive Perception rises by 1 when compared against enemy Stealth results. Your artifact carries the mark of your patron. You may describe it. **Sealing your pact.** You get your artifact once you seal the pact with a promise or a sacrifice, or by a ritual of your own design. A promise should be something you can reasonably achieve in play. A sacrifice should be something of great value to your patron. **Renewing your pact.** If you lose the artifact, spend one point of eldritch favor and perform a 1-hour ceremony (Short or Long Rest) to receive a replacement, which destroys the old one. Your patron may demand a fresh seal, meaning a new promise or sacrifice.",
  "Disastrous Prognostication": "Action: pick a creature within 60 ft that can see and hear you. Your patron floods its mind with knowledge of failures in its near future. It makes a Charisma save or is Stunned until the end of your next turn. Short or Long Rest to use again.",
  "Disastrous Prognostications": "Action: pick a creature within 60 ft that can see and hear you. Your patron floods its mind with knowledge of failures in its near future. It makes a Charisma save or is Stunned until the end of your next turn. Short or Long Rest to use again.",
  "Whispered Warnings": "The sibylline voices in your mind grow clear and sharp, warning you of creatures that mean you harm. While you wear light armor or no armor, add your Charisma modifier (minimum 1) to your AC.",
  "Pierce the Veil": "When you deal Psychic damage to a target, you can also flood it with discordant voices of doom. The truths it hears deal 8d10 Psychic damage and leave it Confused (as the spell) until the end of its next turn. Long Rest to use again.",
  "Pierced the Veil": "When you deal Psychic damage to a target, you can also flood it with discordant voices of doom. The truths it hears deal 8d10 Psychic damage and leave it Confused (as the spell) until the end of its next turn. Long Rest to use again."},
 "pick": [_o(3, "sibyl_pb", "The Sybil and your Pact Boons", "Pact Boon (The Sibyl)", [
   ["Pact of the Blade (The Sibyl)", "Use your action to make a pact weapon in your empty hand, in any melee weapon form you pick each time. You are proficient with it and it counts as magical. It vanishes if it is 5 ft or more away from you for 1 minute, if you make another, if you dismiss it (no action) or if you die. A 1-hour ritual (can be done in a Short Rest) lets you bind a magic weapon as your pact weapon, and it returns when you dismiss it to an extradimensional space. An artifact or sentient weapon cannot be bound. The bond ends if you die, bond another weapon or break it with a 1-hour ritual. Sibyl rider: when you create or summon your weapon, you may have it deal Psychic damage instead of its normal type."],
   ["Pact of the Chain (The Sibyl)", "You learn Find Familiar and can cast it as a ritual without it counting against your spells known. Your familiar can take a normal form or imp, pseudodragon, quasit or sprite. When you take the Attack action, you can give up one attack so that your familiar uses its Reaction to make one attack. Sibyl rider: your patron gives you a special familiar, a giant moth."],
   ["Pact of the Tome (The Sibyl)", "Your patron gives you a Book of Shadows. Choose three cantrips from any class list. They need not share a list. While the book is on you, you can cast them at will, they do not count against your cantrips known, and they count as Warlock cantrips. A 1-hour ceremony (Short or Long Rest) replaces a lost book and destroys the old one. The book turns to ash when you die. Sibyl rider: the book is an illuminated manuscript with pictures of prophets, and new pictures show your deeds. While it is on you, your passive Perception rises by 1 against enemy Stealth results."]])],
 "lu": [{"feature": "Disastrous Prognostication", "lvl": 6, "max": 1, "reset": "short", "tag": "Action, Stunned"},
        {"feature": "Disastrous Prognostications", "lvl": 6, "max": 1, "reset": "short", "tag": "Action, Stunned"},
        {"feature": "Pierce the Veil", "lvl": 14, "max": 1, "reset": "long", "tag": "8d10 Psychic"},
        {"feature": "Pierced the Veil", "lvl": 14, "max": 1, "reset": "long", "tag": "8d10 Psychic"}],
 "acts": {"Disastrous Prognostication": "action", "Disastrous Prognostications": "action"},
 "fx": [[3, "Touched by the Sibyl", {"skills": ["Performance"], "exp": ["Performance"]}]]},

"Vampire Slayer": {"spab": "WIS",
 "f": {
  "Favored Enemy": "You must pick undead as your favored enemy at level 1. At levels 6 and 14 you can choose freely from the usual list, and hags and lycanthropes are also allowed.",
  "Hunter's Prey": "Level 3 Vampire Slayer option, offered in place of Colossus Slayer, Giant Killer or Horde Breaker. **Empowered Strike.** Your training against undead and lycanthropes lets you harm them without a magic weapon. When you hit a creature that resists Bludgeoning, Piercing and Slashing damage from nonmagical weapons, you can ignore that Resistance once per turn with a nonmagical weapon. With a magic weapon, one successful attack per turn deals an extra 1d8 damage.",
  "Defensive Tactics": "Level 7 Vampire Slayer option, offered in place of Escape the Horde, Multiattack Defense or Steel Will. **Ranger's Resilience.** You have Advantage on saves against paralysis and effects that lower your Hit Point maximum.",
  "Slayer's Strike": "Level 11 Vampire Slayer option, offered in place of Volley or Whirlwind Attack. **Straight Through the Heart.** When you take the Attack action, you can make a single melee attack against a favored enemy to hit a weak point. If it hits, it deals an extra 6d6 damage.",
  "Superior Hunter's Defense": "Level 15 Vampire Slayer option, offered in place of Evasion, Stand Against the Tide or Uncanny Dodge. **Greater Resilience.** You have Advantage on saves against the spells and abilities of your favored enemies."},
 "acts": {}},

"Oath of the Giving Grave": {"spab": "CHA",
 "f": {
  "Antipaladin Class Features": "A Paladin heading toward the Oath of the Giving Grave uses some class features differently. See Unholy Smite and Improved Unholy Smite.",
  "Unholy Smite": "Replaces Divine Smite. When you hit with a melee weapon attack, you can expend a Paladin spell slot to deal extra Necrotic damage. It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. The damage is 1d8 higher against a celestial, a Good fey or a Good dragon.",
  "Tenets of the Giving Grave": "The grave is a philosophy more than a formal code. **Conquer Death.** The world needs great power to be repaired, and mortal lives are too short, so death must be beaten by passing through the grave. **Serve Those Who Can Teach.** Serve and learn from those with the knowledge, whatever you think of them, until they have nothing more to give. **Brook No Opposition.** Your vision is right and its path is narrow. Anyone who blocks it deserves neither life nor mercy, and the fallen can be made to serve after death. **Honor the Gods of Death.** Give devotion and sacrifice to the gods who grant your power and punish those who mock them.",
  "Oath Spells": "You always have these spells prepared at the Paladin levels shown. Level 3: Blood Tide, Disguise Self. Level 5: Blood Armor, Bloodshot. Level 9: Animate Dead, Vampiric Touch. Level 13: Blight, Freedom of Movement. Level 17: Insect Plague, Seeming.",
  "Channel Divinity": "You gain two Channel Divinity options: Overawe Enemy and Mark of the Funeral Feast.",
  "Overawe Enemy": "Action: present your unholy symbol and promise horrors to come. Pick a creature you see within 60 ft. It makes a Wisdom save, unless it is immune to being Stunned. Celestials and Good fey have Disadvantage. On a failure it is Stunned for 1 minute or until it takes damage.",
  "Mark of the Funeral Feast": "Bonus Action: shout a command and point at a creature you see within 10 ft. Every unintelligent undead of Challenge Rating below 1 that can see the creature is compelled to chase and attack it. The effect ends after 1 minute, when the target drops to 0 Hit Points or when it falls unconscious. The undead then go back to what they were doing.",
  "Aura of the Unrepentant": "While you are conscious, you and allies within 10 ft cannot be turned. At level 18 the range is 30 ft.",
  "Improved Unholy Smite": "Replaces Improved Divine Smite. Your melee weapon strikes carry necrotic evil. When you hit with a melee weapon, the target takes an extra 1d8 Necrotic damage. If you also use Unholy Smite, this adds to its extra damage.",
  "Tenacious Life": "You regenerate. If you start your turn with fewer than half your Hit Points, you regain 5 Hit Points. If you take Fire or Radiant damage, this does not work at the start of your next turn.",
  "Undying Sentinel": "You have Advantage on saves against spells and other magical effects. If you are killed, you rise from the grave within 1d4 days as a death knight. Work out the details with your GM."},
 "acts": {"Overawe Enemy": "action", "Mark of the Funeral Feast": "bonus"}},

}
