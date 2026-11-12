# Own-wording Druid circles of Valda's Spire of Secrets, 2014 rules.
SUB = {
"Circle of Stones": {"spab": "",
 "f": {
  "Raise Henge": "As an action, spend a use of Wild Shape to raise a henge of six standing stones (5 ft high, 3 ft wide, 1 ft deep) in a 10-ft-radius circle around a point you see within 60 ft. Each stone gives a Medium creature cover from ranged attacks. The ground must bear their weight. When you start your turn in the henge you gain temporary hit points equal to your Wisdom modifier + half your druid level. You can choose allies who gain temporary hit points equal to your Wisdom modifier when they start a turn in it. These last only while the creature stays inside. The henge lasts 8 hours. Spend another use of Wild Shape to make the stones permanent, but they no longer grant temporary hit points. Otherwise they vanish. At level 10 the henge can be 15 ft radius with 10 stones, and at level 14 it can be 20 ft radius with 20 stones. You choose the radius when you create it.",
  "Warding Stones": "While inside a henge, you can cast magic circle as an action with no slot or material components. It is centered on the henge, with the henge's radius and height. Long Rest to do it again.",
  "Ley Passage": "After 1 minute of concentration inside a henge, you link it to another henge on the same plane that you have seen or touched, as teleportation circle. For 1 minute any creature can use an action to step into the first henge and leave from the other.",
  "Great Henge": "When you cast a druid spell that needs concentration while in a henge, you can hand it to the henge, which shows burning runes. Only spells of level 5 or lower whose effect lies entirely inside the henge qualify, and you can trim the area to the henge's edge. The henge holds concentration instead of you, so you can keep two concentration spells. The spell ends early if any part of its effect leaves the henge."},
 "lu": [{"feature": "Warding Stones", "lvl": 6, "max": 1, "reset": "long", "tag": "Action. Magic circle"}],
 "acts": {"Raise Henge": "action", "Warding Stones": "action"}},

"Circle of the City": {"spab": "",
 "f": {
  "City Shape": "As an action, spend a use of Wild Shape to warp the city around you, choosing one effect. Cobbleshift: move the bricks, cobblestones or planks of a constructed floor within 60 ft by up to 1 ft without destabilizing it. Make chosen sections Difficult Terrain, and creatures standing on them make a Dexterity save against your spell save DC or fall Prone. You ignore it. On each of your turns you can raise up to three low walls (2.5 ft high, 5 ft wide, 1 ft deep, giving a Medium creature cover). It lasts 1 minute, then everything reverts. Passwall: cast passwall with no slot or material components. Wall Warp: a contiguous wall without corners, at most 1 ft thick and made of wood, plaster, stone or something not natural, within 30 ft, shifts, grows, shrinks or rotates. It stays vertical and moves up to a 60-ft radius from its old place, never into occupied space, and only grows or shrinks vertically. After 1 minute it reverts.",
  "Streettalk": "You have Advantage on Intelligence (Investigation) checks to gather rumors or find a creature or place in a city. You learn thieves' cant, a coded dialect that hides messages in normal talk. Only those who know it understand, and conveying such a message takes four times as long as saying it plainly.",
  "Urban Arcana": "Your druid spells look urban instead of natural. Entangle and spike growth might show as twisting wires and pipes, and barkskin as pitted iron or brick. You can wear metal armor and use metal shields.",
  "Whispers of Walls": "As an action, touch a constructed part of a building such as a wall, pillar, ceiling or floor. You learn how many humanoids are in the building and in each room. If there are more than fifty, you detect the closest fifty.",
  "Breath of Smog": "When you take damage, use your reaction to exhale a 10-ft-radius sphere of toxic smoke centered on yourself. It is heavily obscured. A creature other than you that starts its turn fully inside makes a Constitution save against your spell save DC or is Poisoned until the start of its next turn, coughing. The smog lasts 1 minute. A moderate wind (10 mph) clears it after 4 rounds and a strong wind (20 mph) after 1. You regain this use when you use City Shape or finish a Short or Long Rest.",
  "Twisting Architecture": "You can spend two uses of Wild Shape to use every effect of City Shape at once. When you use City Shape you can also warp gravity along surfaces you choose within 60 ft. For 1 minute creatures and objects within 15 ft of such a surface fall toward it as if it were the ground, and a creature can walk on it as if level, even if vertical or upside down. When it ends, everything falls from the surfaces."},
 "lu": [{"feature": "Breath of Smog", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction. Also back on City Shape"}],
 "acts": {"City Shape": "action", "Whispers of Walls": "action", "Breath of Smog": "reaction"},
 "grant": {"f": "Urban Arcana", "armor": [[3, "Metal armor and shields"]]}},

"Circle of the Deep": {"spab": "",
 "f": {
  "Aquatic": "You can breathe water and air and have a swim speed equal to your walking speed. These also apply in Wild Shape forms: a form without a swim speed gains one equal to its Speed.",
  "Bonus Proficiencies": "You are proficient with the fishhook, harpoon, net, spear and trident. Deep druids avoid metal weapons and use coral ones as merfolk do. Coral weapons work as normal weapons but cost twice as much on land.",
  "Vortex Attack": "You can attack twice when you take the Attack action with a weapon you hold. If you are in water or below half your hit point maximum, you can use your action to attack every creature within 5 ft with a melee attack, rolling separately for each.",
  "Ocean's Ally": "You can speak with fish and other aquatic creatures at will, as speak with animals. While underwater, you can use your action to call an aquatic beast of CR 3 or lower from the surroundings. It arrives at the start of your next turn, rolls its own initiative, acts on its own turn, and is friendly and follows your commands. After 1 hour, or if you or your companions harm it, it returns to the wild. Short or Long Rest to call another.",
  "Davy Jones' Locker": "When you hit with a melee weapon attack, you can deal extra 1d8 damage. Your attacks ignore resistance to nonmagical Bludgeoning, Piercing and Slashing damage, ignore the damage threshold of ships and deal double damage to ships."},
 "lu": [{"feature": "Ocean's Ally", "lvl": 10, "max": 1, "reset": "short", "tag": "Action. CR 3 aquatic beast"}],
 "acts": {"Ocean's Ally": "action"},
 "grant": {"f": "Bonus Proficiencies", "weapons": [[3, "Fishhook, Harpoon, Net, Spear, Trident"]]},
 "fx": [[3, "Aquatic", {"notes": [["Note", "Aquatic: you breathe water and air and have a swim speed equal to your walking speed"]]}]]},

"Circle of the Fist": {"spab": "",
 "f": {
  "Primal Infusion": "As a bonus action, spend a use of Wild Shape to draw nature's power into your body. You gain temporary hit points equal to 4 x your druid level + your Wisdom modifier. While you have them, your walking Speed rises by 10 ft.",
  "Untamed Fury": "While unarmed, with no armor or shield, you gain these. Your AC is 10 + Dexterity modifier + Wisdom modifier. You can use Dexterity instead of Strength for unarmed strike attack and damage rolls. You can roll a d4 instead of the normal unarmed damage (d6 at level 5, d8 at level 11), and in beast form you can use this die if it beats the form's weapon die. When you take the Attack action with an unarmed strike, you can make one unarmed strike as a bonus action, two if you spend a spell slot of level 1 or higher, or three with a slot of level 5 or higher. From level 6 your unarmed strikes count as magical.",
  "Extra Attack": "You can attack twice when you take the Attack action with an unarmed strike.",
  "Savage Instinct": "When you roll initiative, you can spend a use of Wild Shape to use Primal Infusion. If you do, you also gain one benefit for up to 1 minute while those temporary hit points last. Feral Agility: when you hit with an unarmed strike, move 10 ft without provoking opportunity attacks. Mountain's Might: Advantage on Strength checks and saves and on attacks against a creature you are grappling. Tree's Resilience: when an attacker you see hits you, use your reaction to reduce the damage by your Wisdom modifier.",
  "Nature's Wrath": "When you lose all temporary hit points from Primal Infusion, you can use your reaction to either make two unarmed strikes against a creature you see within reach, or spend a use of Wild Shape to use Primal Infusion again."},
 "acts": {"Primal Infusion": "bonus", "Nature's Wrath": "reaction"},
 "fx": [[3, "Untamed Fury", {"notes": [["Note", "Untamed Fury: unarmored and unarmed, AC 10 + Dexterity + Wisdom. Unarmed strike d4 (d6 at 5, d8 at 11), Dexterity allowed, bonus-action strikes"]]}]],
 "acb": {"l": 3, "v": 0, "s": "Untamed Fury"}},

"Circle of the Wyrm": {"spab": "",
 "f": {
  "Draconic Wild Shape": "You can use Wild Shape as a bonus action on your turn. Your beast shapes look like dragon hybrids and gain these traits while transformed. Breath Weapon: use your action and spend a spell slot to exhale in a 15-ft cone, choosing acid, cold, fire, lightning or poison. Each creature makes a Dexterity save against your spell save DC, taking 2d10 of that type plus 1d10 per slot level above 1, or half on a success. Resistance: you resist Bludgeoning, Piercing and Slashing damage from nonmagical weapons.",
  "Dragonkin": "You learn Draconic and have Advantage on saves against the spells and effects of dragons.",
  "Fangs And Flight": "While transformed you gain these. Dragon Wings: a flying speed equal to your walking speed, unless you already have a higher flying speed. Infused Strikes: when you transform, choose acid, cold, fire, lightning or poison. Your melee hits deal an extra 1d6 of that type.",
  "Primordial Aura": "As a bonus action, create a 30-ft aura of elemental magic and choose acid, cold, fire, lightning or poison. For 1 minute you and creatures you choose in the aura resist that type. Once per turn, when you deal damage of that type to a hostile creature, a creature you choose in the aura regains 1d10 + your Wisdom modifier hit points. Short or Long Rest to use again.",
  "Wyrm Perfection": "Even when not transformed you have the Breath Weapon and Dragon Wings traits."},
 "lu": [{"feature": "Primordial Aura", "lvl": 10, "max": 1, "reset": "short", "tag": "Bonus Action. 30-ft aura"}],
 "acts": {"Primordial Aura": "bonus"},
 "fx": [[3, "Dragonkin", {"langs": ["Draconic"]}]]},

"Circle of Vermin": {"spab": "",
 "f": {
  "Infested": "Vermin cover your clothes and gear. When a creature within 5 ft hits you with an attack, the vermin retaliate for 1d4 Piercing damage to the attacker, who also subtracts that damage from its next attack roll before the end of its turn.",
  "Lord of the Low": "As an action, spend a use of Wild Shape to summon a swarm of rats in your space. It vanishes after half your druid level in hours (round down), at 0 hit points, or when you summon another. It is friendly to you and your companions, rolls initiative, has its own turns and obeys your spoken commands for free. With no orders it defends itself. While it is in your space you have +2 AC, and when you take damage you can have the swarm take it instead. From level 6 you can summon a swarm of bats, insects or ravens, and from level 14 a swarm of poisonous snakes.",
  "Tremorsense": "You gain tremorsense to 10 ft. You and the source of vibrations must touch the same ground or substance. It cannot detect flying or incorporeal creatures.",
  "Plague Carrier": "You are immune to disease and the Poisoned condition. When you would make a Constitution save to resist a disease or poison, you can instead become its carrier, for one at a time and up to 7 days. When a creature you see within 5 ft damages you, use your reaction to pass the disease or poison to it. It makes a Constitution save against your spell save DC or contracts it, and you stop carrying it.",
  "Swarm Master": "When you use Lord of the Low to summon a swarm, you can summon two swarms instead of one."},
 "acts": {"Lord of the Low": "action", "Plague Carrier": "reaction"},
 "fx": [[6, "Tremorsense", {"senses": [["Tremorsense", 10, ""]]}], [10, "Plague Carrier", {"notes": [["Note", "Plague Carrier: immune to disease and the Poisoned condition"]]}]]},
}
