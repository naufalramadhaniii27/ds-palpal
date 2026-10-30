# Own-wording subclasses of Humblewood Campaign Setting and Humblewood Tales (2014 rules). Shapes follow tvss_sub_bard.py and tghp_sub_a.py.
# Feature levels below 3 are lifted to 3 by the generator. Choice features (Traveler's Tricks, Predator invocations) are carried as picks.

TRICKS = [
 ["Acrobatics Lessons", "Trick: spend a Bardic Inspiration use when you or an ally (within 60 ft, able to see and hear you) makes a Dexterity save, and add the die to it. Level 6: if the save succeeds against an effect that deals half damage on a success, the target takes none. Level 14: on a failed save the target takes only half damage."],
 ["Armed Combat Lessons", "Choose Archery, Dueling, Great Weapon Fighting or Two-Weapon Fighting. When you make a weapon attack, spend a Bardic Inspiration use to add the die to the attack or damage roll and gain that Fighting Style for 10 minutes. Level 6: while it lasts, you attack twice (once) when you take the Attack action. Level 14: +1 AC while it lasts."],
 ["Bind the Wound", "Reaction: when you or an ally within 5 ft receives any healing, spend a Bardic Inspiration use to add healing equal to the die roll plus your Wisdom modifier (minimum 1). You need a free hand. Level 6: you can also end the poisoned or paralyzed condition on the target. Level 14: you can also end one disease on the target."],
 ["Boxing Lessons", "When you take the Attack action, spend a Bardic Inspiration use to make two Unarmed Strikes against creatures you could target. You may use Dexterity for them, and their damage die is your Bardic Inspiration die. Level 6: you provoke no Opportunity Attacks this turn. Level 14: on a hit you can try a stunning strike. The target makes a Constitution save or is stunned until the end of your next turn."],
 ["Conjure Woodland Spirit", "Magical. Action and one Bardic Inspiration use: conjure a Large spectral predatory cat in an empty space you see within 60 ft. It lasts while you concentrate, up to 10 minutes. An enemy that moves into or out of a space next to it makes a Wisdom save or takes slashing damage equal to your Bardic Inspiration die. Level 6: a creature it damages has Speed 0 for the rest of the turn. Level 14: a Large or smaller creature reduced to Speed 0 is also restrained while you concentrate. It can use an action for a Strength (Athletics) check against your Trick save DC to break free."],
 ["Dark Bargain", "Magical. Choose a Warlock Eldritch Invocation you meet the prerequisites for. Spend a Bardic Inspiration use, roll the die and take necrotic damage equal to the roll, to gain that invocation for 10 minutes. Level 6: take double the roll instead to make it last 1 hour. Level 14: choose one Warlock spell of level 7 or lower. You can cast it once during the effect with no slot, at your highest slot level. You take extra necrotic damage equal to twice the level it was cast at."],
 ["Evocation Lessons", "Magical. Choose a damage-dealing spell you can cast. When you cast it, spend a Bardic Inspiration use to change its damage type to acid, cold, fire, lightning or thunder, and add your Bardic Inspiration roll plus your Wisdom modifier (minimum 1) to its damage. Levels 6 and 14: you may swap the chosen spell for another spell you know."],
 ["Hunting Lessons", "Magical. Spend a Bardic Inspiration use to mark a creature you see within 90 ft as your quarry. While you concentrate, up to 1 hour, your weapon attacks against it deal extra damage equal to your Bardic Inspiration die. Level 6: you know its distance and direction while on the same plane. Level 14: the effect can last up to 24 hours."],
 ["Reckless Tactics", "When you attack with a melee weapon that has the heavy, two-handed or versatile property, spend a Bardic Inspiration use to gain Advantage on it and add your die roll plus your Wisdom modifier (minimum 1) to the damage. Attacks against you have Advantage this round. Level 6: you may take a -5 penalty to the attack roll for +10 damage on a hit. Level 14: if you have not moved this turn, you may set your Speed to 0 until your next turn and attack every creature within 5 ft, one roll each."],
 ["Warding Trick", "Magical. Action and one Bardic Inspiration use: give an ally you see within 60 ft Temporary HP equal to your die roll plus your Wisdom modifier (minimum 1). It lasts while you concentrate, up to 10 minutes. Level 6: a creature that damages the ally makes a Wisdom save or takes radiant damage equal to your Bardic Inspiration die. Level 14: at the start of each round on your turn the ally gains Temporary HP equal to your die plus your Wisdom modifier (minimum 1), replacing the old ones."],
]

BONUS = [
 ["Gaming Set", "Proficiency with one Gaming Set of your choice."],
 ["Martial weapon", "Proficiency with one martial weapon of your choice."],
 ["Herbalism Kit", "Proficiency with the Herbalism Kit."],
 ["Thieves' Tools", "Proficiency with Thieves' Tools."],
 ["Skill", "Proficiency in one skill of your choice."],
 ["Languages", "You learn two languages of your choice."],
]

PRED_INV = [
 ["Feral Transformation", "Requires Warlock level 7. Action: take the form of a dire wolf, giant spider or giant octopus, using the Polymorph rules, but you keep your Intelligence, Wisdom and Charisma and all your saving throw proficiencies, and gain the beast's too. You also keep skill proficiencies the form can physically use, and take the beast's bonus where it is higher. You can speak and cast spells with only a verbal component. It lasts 1 hour or until the form drops to 0 HP, and extra damage carries over to your normal form. Long Rest to use again."],
 ["Hexshredder", "Requires the Pact of the Blade. Your fingers become claws for Unarmed Strikes that deal 1d6 slashing damage, and you can use Charisma instead of Strength for their attack and damage rolls. They count as pact weapons along with your chosen melee weapons, and as light weapons for two-weapon fighting."],
 ["Hunter's Grimoire", "Requires the Pact of the Tome. A 10 minute ritual consumes physical evidence from a creature (blood, hair, a feather, tooth or claw) and writes its name in your book. While you carry the book you have Advantage on Intelligence checks about that creature. You can also spend 1 minute to learn one fact: its type and alignment, its names or aliases, its distance and direction on the same plane, its vulnerabilities or flaws, whether it is wounded, or what condition or curse affects it. The page holds one name at a time and you can replace it by repeating the ritual."],
 ["Primal Summoner", "Requires the Pact of the Chain. When you cast Find Familiar your familiar can also take the form of a blink dog, death dog, panther or worg. You can use a Bonus Action to command your familiar to take the Attack action against a foe of your choice."],
]

SUB = {
"College of the Road": {"spab": "WIS",
 "f": {
  "Bonus Proficiencies": "Choose three different options: a Gaming Set, a martial weapon, the Herbalism Kit, Thieves' Tools, one skill, or two languages.",
  "Traveler's Tricks": "You pick up tricks from adventurers met on the road. You learn two Traveler's Tricks at level 3 and one more at levels 6 and 14. Each costs one use of Bardic Inspiration and takes a Bonus Action unless it says otherwise. Wisdom powers them, and the Trick save DC is 8 plus your Proficiency Bonus plus your Wisdom modifier.",
  "Wanderer's Lore": "When a creature holding your Bardic Inspiration die makes an Arcana, History, Nature or Religion check, it has Advantage. It may choose whether to add the die.",
  "Favorite Trick": "Level 6: choose one Trick you know as your favorite. If you roll Initiative with no Bardic Inspiration left, you regain one use, which only fuels that trick. Level 14: pick a second favorite trick.",
  "Improved Tricks": "At levels 6 and 14 your Traveler's Tricks grow stronger, as each trick's level 6 and level 14 text describes."},
 "pick": [
  {"l": 3, "k": "opts", "n": 3, "key": "road_bp", "feature": "Bonus Proficiencies", "title": "Bonus proficiencies (3 different)", "list": BONUS},
  {"l": 3, "k": "opts", "n": 2, "key": "road_tt3", "feature": "Traveler's Tricks", "title": "Traveler's Tricks (2)", "list": TRICKS},
  {"l": 6, "k": "opts", "n": 1, "key": "road_tt6", "feature": "Traveler's Tricks", "title": "Traveler's Trick (3rd)", "list": TRICKS},
  {"l": 14, "k": "opts", "n": 1, "key": "road_tt14", "feature": "Traveler's Tricks", "title": "Traveler's Trick (4th)", "list": TRICKS}]},

"Community Domain": {"spab": "WIS",
 "f": {
  "Blessing of the Hearth": "Whenever you rest, you can conjure a small stone hearth with an iron cooking pot. When you or friendly creatures camping with you regain HP from Hit Dice at the end of a Short Rest, each may reroll one Hit Die and keep the higher result. You gain Cook's Utensils proficiency.",
  "Channel Divinity: Magnificent Feast": "Spend 10 minutes to conjure simple, tasty food items equal to your Wisdom modifier (minimum 1). They last 8 hours or until a rest ends and never spoil. Eating one is an action and heals 2d4 plus your Cleric level. The eater also ends the frightened or poisoned condition, their choice.",
  "Channel Divinity: Community Watch": "You and up to your Wisdom modifier (minimum 1) allies who see you within 30 ft gain a boon for that many rounds (minimum 1). Once per round, a creature with the boon can add 1d6 to a skill check, saving throw or attack roll. It only works while the creature can see at least one ally.",
  "Divine Strike": "Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 psychic damage, 2d8 from level 14. You choose whether a foe dropped to 0 HP by it is stable or dies.",
  "Paragon of the People": "Community Watch adds another 1d6 and also gives immunity to fear while it lasts. Magnificent Feast makes twice as many items, and each can remove one curse or disease on the eater, including attunement to a cursed item."},
 "lu": [],
 "acts": {"Channel Divinity: Magnificent Feast": "other", "Channel Divinity: Community Watch": "action"},
 "grant": {"f": "Blessing of the Hearth", "tools": [[3, "Cook's Utensils"]]}},

"Night Domain": {"spab": "WIS",
 "f": {
  "Eye of Twilight": "You see dim light within 60 ft as bright, and darkness as dim light, in gray only. At level 6 the range is 120 ft. At level 8 you see normally in darkness within 120 ft. At level 17 you can gain truesight in darkness within 120 ft for minutes equal to your Wisdom modifier (minimum 1). Long Rest to use again.",
  "Ward of Shadows": "Reaction: when a creature you see within 30 ft attacks you, impose Disadvantage on the roll. Creatures that cannot be blinded are immune. You can use it a number of times equal to your Wisdom modifier (minimum 1) and regain all uses on a Long Rest.",
  "Channel Divinity: Invocation of Night": "Action: you put out all mundane and magical light within 30 ft. Each hostile creature within 30 ft makes a Constitution save or is blinded for rounds equal to your Cleric level. A blinded creature repeats the save at the end of each of its turns. Creatures with Cover from you are unaffected.",
  "Improved Ward": "Ward of Shadows also works when a creature you see within 30 ft attacks someone other than you.",
  "Veil of Dreams": "When you cast Sleep, add your Cleric level to the dice rolled for its HP total. You choose the order of creatures affected, and if the first chosen has too many HP, the spell moves to the next one you chose. Creatures put to sleep cannot be woken until the start of your next turn.",
  "Creature of the Night": "Action: for 1 minute (or until you dismiss it with an action) you emit heavily obscuring darkness in a 30-ft radius and lightly obscuring shadow 50 ft beyond that. Only light from a 9th-level spell or similar can negate it. Enemies in the shadow are frightened. Enemies in the darkness are blinded and frightened while they remain there."},
 "lu": [{"feature": "Eye of Twilight", "n": "Eye of Twilight: truesight", "lvl": 17, "max": 1, "reset": "long", "tag": "Truesight 120 ft"}],
 "acts": {"Ward of Shadows": "reaction", "Channel Divinity: Invocation of Night": "action", "Creature of the Night": "action"},
 "fx": [[3, "Eye of Twilight", {"notes": [["Note", "Eye of Twilight: dim light within 60 ft counts as bright, darkness as dim light (gray only)"]]}]]},

"Scofflaw": {"spab": "",
 "f": {
  "Bonus Proficiency": "Gain proficiency in one of Deception, Insight, Intimidation, Sleight of Hand or Stealth. Alternatively, learn Thieves' Cant.",
  "Brutal Brawler": "You are proficient with improvised weapons and treat them as having the finesse property. When you hit with one, a Bonus Action lets you break it over the target. It is destroyed, and the hit deals the maximum on each of its damage dice (extra dice from other sources are unchanged). Level 10: breaking one adds 2d6 to its base damage dice. Level 18: you have Advantage on improvised weapon attacks.",
  "Intimidating Banter": "In combat you may use Strength or Dexterity for Charisma checks.",
  "Misdirection": "Bonus Action: goad a foe within 5 ft that can see, hear or understand you. It makes an Intelligence save (DC 8 plus your Proficiency Bonus plus your Strength or Dexterity modifier). On a failure it must use its reaction to attack a creature of your choice within 5 ft of it, or swing at empty air if none is there.",
  "Blindside": "Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. The damage becomes 7d6 at level 15 and 9d6 at level 18. If you have no uses left when combat starts on your turn, you regain one.",
  "Infamy": "Level 15: as part of your Attack action, threaten one creature within 30 ft that can see, hear or understand you. It makes a Wisdom save (DC 8 plus your Proficiency Bonus plus your Strength or Dexterity modifier) or is frightened of you for 1 minute, repeating the save at the end of each of its turns. A creature that has seen or heard of your ruthlessness saves with Disadvantage.",
  "Two For Flinching": "Level 18: once per round, when you take the Attack action against a creature you misdirected this turn or one that has a condition, make one extra attack against it."},
 "lu": [{"feature": "Blindside", "lvl": 10, "max": 1, "reset": "short", "tag": "Short Rest"}],
 "acts": {"Misdirection": "bonus", "Infamy": "other", "Brutal Brawler": "bonus"},
 "pick": [{"l": 3, "k": "skill", "n": 1, "from": ["Deception", "Insight", "Intimidation", "Sleight of Hand", "Stealth"], "feature": "Bonus Proficiency", "title": "Scofflaw skill", "key": "scof_sk"}]},

"Circle of the Warden": {"spab": "WIS",
 "f": {
  "Heartbeat of the Land": "You gain Expertise in Nature and Insight. By communing with nature for 10 minutes you learn about the area within 3 miles: the place and severity of immediate environmental threats such as fire, flood or blight, whether aberrations, beasts, elementals, fey or undead are present (not where), and the direction of the nearest portal to an elemental plane.",
  "Reclamation": "Reaction: when a creature within 30 ft takes cold, fire, lightning or thunder damage, it gains Resistance to that damage and you take an amount equal to what it took. Action: shrink persistent cold, fire or lightning effects within 30 ft by up to a 20-ft cube. You take 1d4 damage of that type per 5-ft space removed, or 1d4 per spell level per space if a spell made it. A spell with no damaging spaces left is dispelled.",
  "Sympathetic Shield": "Level 6: action and one Wild Shape use to wrap yourself or an ally within 30 ft in see-through spirit armor shaped like a Beast you could assume. The target gains 1d10 Temporary HP per 3 Druid levels and +1 AC until those HP are gone or replaced. Level 14: when a creature within 5 ft damages the shielded one, the armor deals 1d8 magical bludgeoning, piercing or slashing damage (chosen when you cast it), once per round per target.",
  "Aura of Calm": "Level 10: when you or a friend within 10 ft is healed by a spell, add HP equal to half your Druid level. Non-creature plants in the aura thrive, give no difficult terrain, including from Entangle or Spike Growth, and their targets have Advantage on saves against those spells' harmful effects.",
  "Bond of Shelter": "Level 14: action to raise a cylinder of protective nature energy (30-ft radius, 20 ft tall) centered on you for 1 hour. It does not move. You choose creatures you know and see to be immune to it. Others cannot willingly enter without a Charisma save against your spell save DC. It blocks planar entry through the Astral Plane, Ethereal Plane, Feywild, Shadowfell and Plane Shift. Creatures inside have Disadvantage on attacks against targets in it. Targets of your choice inside cannot be charmed, frightened or possessed. A creature that enters or starts its turn inside takes 5d10 magical bludgeoning damage. Long Rest to use again."},
 "lu": [{"feature": "Bond of Shelter", "lvl": 14, "max": 1, "reset": "long", "tag": "Long Rest"}],
 "acts": {"Reclamation": "reaction", "Sympathetic Shield": "action", "Bond of Shelter": "action"},
 "fx": [[3, "Heartbeat of the Land", {"exp": ["Nature", "Insight"]}]]},

"Leyline Magic": {"spab": "INT",
 "f": {
  "Natural Attunement": "When you prepare spells in a natural setting you can attune to one nearby leyline and gain its spells. Use the Leyline Spells table row that matches the terrain. You can hold one attunement at a time. While attuned you always have its spells prepared for which you meet the level, and they do not count against your prepared total or go in your spellbook. They count as Wizard spells for you.",
  "Leyline Spells": "Wizard level then spells for each terrain. Arctic: 1 Grease, 3 Hold Person, 5 Slow, 7 Ice Storm, 9 Cone of Cold. Coast: 1 Thunderwave, 3 Mirror Image, 5 Call Lightning, 7 Control Water, 9 Conjure Elemental (air or water only). Desert: 1 Color Spray, 3 Blur, 5 Daylight, 7 Blight, 9 Seeming. Forest: 1 Entangle, 3 Barkskin, 5 Conjure Animals, 7 Shape Plants, 9 Tree Stride. Grassland: 1 Elevated Sight, 3 Gust of Wind, 5 Wind Wall, 7 Freedom of Movement, 9 Commune with Nature. Mountain: 1 Fog Cloud, 3 Silence, 5 Sleet Storm, 7 Stoneskin, 9 Wall of Stone. Swamp: 1 Veil of Dusk, 3 Spike Growth, 5 Stinking Cloud, 7 Giant Insect, 9 Insect Plague.",
  "Thrum of the Land": "When you cast a leyline spell in a terrain matching your attuned leyline, choose one benefit for that cast: +2 to its attack rolls, +1 to its save DC, or Advantage on Constitution saves to keep concentration on it plus double its normal duration. Level 14: you can also apply one of these to a single spell of level 6 or higher. Long Rest to use again.",
  "Biorhythm": "Level 6: while attuned, when you use Arcane Recovery you regain 1d8 HP per spell slot recovered. After a Short Rest in a natural setting you can attune to a different leyline.",
  "Natural Disruption": "Level 10: cast Counterspell or Dispel Magic with no slot, at the level of your highest slot. Long Rest to use again.",
  "Leyline Weaving": "Level 14: meditate 1 hour to create a temporary leyline of any terrain from the Leyline Spells table, with a 1-mile radius around you, and attune to it whatever the real terrain is. It fades after 24 hours. Long Rest to use again. Repeating it on the same spot daily for a year makes it permanent and reshapes the land. You choose whether the area becomes the new terrain or blends both."},
 "lu": [{"feature": "Natural Disruption", "lvl": 10, "max": 1, "reset": "long", "tag": "Free cast"}, {"feature": "Leyline Weaving", "lvl": 14, "max": 1, "reset": "long", "tag": "Long Rest"}],
 "acts": {"Natural Disruption": "other", "Leyline Weaving": "other"}},

"The Predator": {"spab": "CHA",
 "f": {
  "Expanded Spell List": "These spells join the Warlock list for you. 1st: Hunter's Mark, Jump. 2nd: Alter Self, Ambush Prey. 3rd: Blink, Slow. 4th: Dominate Beast, Freedom of Movement. 5th: Contagion, Mislead.",
  "Bonus Proficiencies": "You gain Expertise in Survival.",
  "Form of the Beast": "Bonus Action: for 10 minutes, take a beastly form. You gain Temporary HP equal to twice your Warlock level (maximum 20 at level 10) that last through the form. You have Advantage on Stealth, Perception and Survival checks to stalk or track prey. You grow teeth and claws that are natural weapons you are proficient with, and you use Charisma for their attack and damage. A bite deals 1d6 piercing and claws deal 1d4 slashing. If you already had bite or claw attacks (talons count as claws) their damage die goes up one step. After a bite you can make a claw attack as a Bonus Action. Level 5: after a bite you can make two claw attacks with your Bonus Action, and you can Dash or Hide as a Bonus Action. You can use this twice per Short or Long Rest. Level 6: the form lasts 1 hour.",
  "Thrill of the Hunt": "Level 6: while in Form of the Beast, once per turn a bite hit adds 3d6 necrotic damage and you regain HP equal to half the total damage. Level 10: 5d6. It recharges when you score a critical hit with a bite or claw, or after a Short or Long Rest.",
  "Fearsome Presence": "Level 10: action. Each hostile creature you see within 30 ft makes a Wisdom save against your spell save DC. On a failure it is frightened of you for 1 minute and restrained until the end of your next turn. A frightened creature repeats the save at the end of each of its turns. Short or Long Rest to use again.",
  "Uncaged Beast": "Level 14: when an attacker you see hits you, use your reaction to enter Form of the Beast and make one bite or claw attack against an enemy within 5 ft. While in that form, when a creature within 5 ft damages you, you can use your reaction to make a bite or claw attack against it."},
 "lu": [{"feature": "Form of the Beast", "lvl": 3, "max": 2, "reset": "short", "tag": "Bonus Action"}, {"feature": "Thrill of the Hunt", "lvl": 6, "max": 1, "reset": "short", "tag": "Or on a critical hit"}, {"feature": "Fearsome Presence", "lvl": 10, "max": 1, "reset": "short", "tag": "Short Rest"}],
 "acts": {"Form of the Beast": "bonus", "Fearsome Presence": "action", "Uncaged Beast": "reaction"},
 "fx": [[3, "Bonus Proficiencies", {"exp": ["Survival"]}]],
 "pick": [{"l": 3, "k": "opts", "n": 1, "key": "pred_inv", "feature": "Predator invocations", "title": "Predator invocation (swap on level up)", "list": PRED_INV}]},
}
