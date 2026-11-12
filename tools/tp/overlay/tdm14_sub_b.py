# Own-wording subclasses of Dark Matter, 2014 rules, batch B.
_VR = "Optional rule for the GM: because many basic weapons here deal energy damage, a raging barbarian can instead have Resistance to Force, Necrotic and Radiant damage."
SUB = {
"Path of the Dreadnought": {"spab": "",
 "f": {
  "Variant Resistances": _VR,
  "Berserker Helm": "You wear a helmet that regulates your emotion and focuses your anger. You can rage at will and end it as fast, but you cannot rage without the helmet. Instead of normal rage, you can rage for a number of rounds equal to half your barbarian level (rounded down) + double your Constitution modifier. They need not be consecutive. You start and end rage as a bonus action. It ends early only if you fall unconscious or choose to end it on your turn. After using up the rounds, finish a Short or Long Rest before raging again. At level 20 you can rage for any number of rounds.",
  "Fearless": "You have Advantage on saves against being Charmed or Frightened. If you make such a save while raging, you can reroll one of the d20s once.",
  "Unstoppable Charge": "When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.",
  "Focused Rage": "When you enter a rage, choose a creature you see within 60 ft. Your attacks deal twice the normal rage damage to it."},
 "acts": {"Berserker Helm": "bonus", "Unstoppable Charge": "bonus"}},

"Path of the Wrecker": {"spab": "",
 "f": {
  "Variant Resistances": _VR,
  "Dismantle": "While raging, you ignore the damage threshold of nonmagical objects, and you double your rage bonus damage against constructs and living constructs.",
  "Percussive Maintenance": "You can try to hack a device that can normally be hacked, such as a door panel or arcane terminal, by smashing it. Make a Strength (Athletics) check in place of Intelligence (Data). On a success, you perform one operation on its system as if you had full access. The machine breaks right afterward and cannot be used until repaired, whether you succeeded or not.",
  "Disarm Foe": "You gain proficiency with improvised weapons. When you reduce a humanoid to 0 hit points with a melee weapon attack, you can rip off one of its limbs. Or use your action to try to rip a limb off a Large or smaller construct or undead within 5 ft with an opposed Strength (Athletics) check. One with more than half its hit points succeeds automatically. After you rip off a limb you can use it for a melee attack as a bonus action. A creature missing a limb cannot attack with it and has Disadvantage on checks that use its limbs. You can remove only one limb per creature. A severed limb is an improvised melee weapon dealing 1d8 Bludgeoning (1d10 if from a Large creature).",
  "Crush, Smash, Bash": "While raging, when you hit a construct or a creature wearing armor with a melee weapon attack, you can give the armor or construct a cumulative -1 penalty to the AC it gives, up to -4. A damaged suit or construct is repaired in 1 hour for 100 gp per point of penalty."},
 "acts": {"Disarm Foe": "action"}},

"Sun Above Domain": {"spab": "Wisdom",
 "f": {
  "Emissary of the Sun": "You gain proficiency with the sunstaff, laser halfsword, laser sword, photonic lash and thermal lance. You can use Dexterity instead of Strength for melee weapon attack and damage rolls with weapons you are proficient with that lack the Heavy property.",
  "Unarmored Defense": "While you wear no armor and wield no shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.",
  "Channel Divinity: Mark of Judgement": "As a bonus action, spend a use of Channel Divinity and present your holy symbol to brand a creature you see within 60 ft. For 1 minute it cannot take the Hide action, since an uncanny light follows it, and you deal extra 1d6 Radiant damage to it whenever you hit it with a weapon attack.",
  "Apologist": "You add your Wisdom modifier to Charisma checks. When you roll initiative and are not surprised, choose a creature you see within 60 ft. It makes a Wisdom save against your spell save DC. On a failure it takes a penalty equal to your Wisdom modifier to its AC and attack rolls for the first round of combat.",
  "Divine Strike": "Once on each of your turns when you hit with a weapon attack, you can deal extra 1d8 Radiant damage. It becomes 2d8 at level 14.",
  "Solar Zenith": "You learn sunbeam as a cleric spell, always prepared and not counted against spells prepared. As an action you can also cast sunbeam as an 8th-level spell with no slot. When cast this way, at the start of each of your turns you regain hit points equal to your Wisdom modifier if you are at half your hit points or less, and damage cannot break your concentration on it. Long Rest to use again."},
 "acts": {"Channel Divinity: Mark of Judgement": "bonus", "Solar Zenith": "action"},
 "lu": [{"feature": "Solar Zenith", "lvl": 17, "max": 1, "reset": "long", "tag": "Cast sunbeam free at 8th level"}],
 "acb": {"l": 3, "v": 10, "s": "Unarmored Defense", "abs": ["DEX", "WIS"]},
 "fx": [[8, "Divine Strike", {"notes": [["Note", "Divine Strike: +1d8 Radiant once per turn on a weapon hit (2d8 from level 14)"]]}]]},

"Void Domain": {"spab": "Wisdom",
 "f": {
  "Darkvision": "You see in dim light within 60 ft as bright light, and in darkness as dim light, in shades of gray. If you already have Darkvision, its range increases by 30 ft. From level 8 you see through magical darkness as well as nonmagical.",
  "Channel Divinity: Shape Void": "As an action, spend a use of Channel Divinity to bend the walls of the universe into a pocket of black voidstuff. Choose one shape. Barrier: a 5-ft-diameter impassable sphere at an empty space within 30 ft. For 1 minute, while you concentrate on it as a spell, nothing can pass through it. Javelin: hurl a crackling spear at a creature you see within 60 ft. Make a ranged spell attack. On a hit it takes Force damage equal to your Wisdom modifier + 1d12 per point of your Proficiency Bonus. Pocket: curve the universe outward to form a hidden extradimensional space that holds 500 lb and up to 64 cubic ft. It is invisible from outside. It is anchored to your holy symbol, and touching the symbol lets a creature see the entrance. It lasts 1 hour, then dissipates and its contents spill out.",
  "Void Step": "As a bonus action, step into the Void and teleport to an unoccupied space you see within 20 ft. Three uses, all regained on a Long Rest.",
  "Potent Spellcasting": "You add your Wisdom modifier to the damage of any cleric cantrip you cast.",
  "Oblivion": "As an action, open a rift to the Void around a creature or object within 120 ft. A creature makes a Dexterity save. On a success it glimpses the Void and takes 2d8 Radiant and 2d8 Psychic damage. On a failure it is banished to the Void for 1d4 rounds and takes 2d8 Radiant and 2d8 Psychic damage at the start of each of its turns there. At the end of your following turn it returns to its previous space or the nearest unoccupied one. Objects over 20 ft in any dimension and Huge or larger creatures cannot fall in. Long Rest to use again."},
 "acts": {"Channel Divinity: Shape Void": "action", "Void Step": "bonus", "Oblivion": "action"},
 "lu": [{"feature": "Void Step", "lvl": 6, "max": 3, "reset": "long", "tag": "Bonus action teleport 20 ft"},
        {"feature": "Oblivion", "lvl": 17, "max": 1, "reset": "long", "tag": "Open a rift to the Void"}],
 "fx": [[1, "Darkvision", {"notes": [["Note", "Darkvision (Void Domain): 60 ft, +30 ft if you already have it. See through magical darkness from level 8"]]}], [8, "Potent Spellcasting", {"notes": [["Note", "Potent Spellcasting: cleric cantrips add your Wisdom modifier to damage"]]}]]},

"Luminaries' Guild": {"spab": "",
 "f": {
  "Hardlight Projector": "You forge lasting equipment out of hardlight with a hardlight projector. If you lose it, you can build a new one over a Long Rest with 100 gp of materials. You can build weapons and armor from hardlight instead of normal materials. They weigh half as much and shed bright and dim light in a 20-ft radius. As a bonus action you can summon them onto your person or dismiss them into the projector. Only you can use your hardlight weapons.",
  "Photonic Fortifications": "As an action, raise a hardlight wall from a point within 15 ft. Up to your Intelligence modifier in translucent panels appear in unoccupied spaces and join into one continuous wall. Each panel is 5 ft wide, 4 ft tall and 1/4 inch thick, tall enough to give cover to a Medium creature behind it. Creatures cannot walk through it but can jump over. It lasts 1 minute or until you dismiss it on your turn with no action. Short or Long Rest to use again.",
  "Honed Weapons": "Spend 10 minutes to fortify a melee weapon with a glittering hardlight coating, or up to 6 during a Short or Long Rest. It stays fortified until it hits a target. A fortified weapon gains one property of your choice. Force Edged: it deals Force damage on a hit, plus extra 1d4 damage. Radiant Edged: its reach increases by 5 ft and it deals Radiant damage on a hit.",
  "Beam Cannon": "As an action, overcharge your projector and fire a beam in a line 100 ft long and 5 ft wide. Each creature in it makes a Dexterity save against your Masterwork save DC and takes 8d6 Radiant damage, or half on a success. The line stays superheated until the start of your next turn. A creature entering it for the first time on its turn takes 3d6 Radiant damage. Unattended flammable objects in the area ignite. Short or Long Rest to use again.",
  "Hardlight Shell": "Legendary armor property. Components: masterwork suit of exotic armor. As a bonus action while wearing it, raise a hardlight sphere around you. You gain temporary hit points equal to twice your level until the start of your next turn. While they last, spell attacks against you automatically miss and you are immune to Radiant damage. Short or Long Rest to use again."},
 "acts": {"Hardlight Projector": "bonus", "Photonic Fortifications": "action", "Beam Cannon": "action", "Hardlight Shell": "bonus"},
 "lu": [{"feature": "Photonic Fortifications", "lvl": 7, "max": 1, "reset": "short", "tag": "Hardlight wall"},
        {"feature": "Beam Cannon", "lvl": 14, "max": 1, "reset": "short", "tag": "8d6 Radiant line"},
        {"feature": "Hardlight Shell", "lvl": 18, "max": 1, "reset": "short", "tag": "Temp HP, spell attacks miss"}]},

"Scrappers' Guild": {"spab": "",
 "f": {
  "Makeshift Brawler": "You gain proficiency with improvised weapons.",
  "Scrap Smithing": "You can craft scrap weapons, armor and shields that work like normal ones, with these exceptions. You can make a number of scrap items equal to your Proficiency Bonus after a Long Rest, as with Active Crafting. They are masterwork and can take masterwork properties. Scrap weapons cost no materials and need no tools. Scrap items break after 24 hours. When you roll a 1 on the d20 attacking with a scrap weapon, it breaks. If you suffer a critical hit while wearing scrap armor or holding a scrap shield, roll a Dexterity save for each piece with DC 10 or half the damage, whichever is higher. On a failure it breaks.",
  "Quality Junk": "When you make a Charisma (Persuasion) check to buy or sell scrap or salvage, you can use Intelligence instead of Charisma and add double your Proficiency Bonus. You also regain expended uses of Tool Belt after a Short or Long Rest.",
  "Scrapper's Improvement": "Spend 10 minutes to fortify a scrap weapon, or up to 6 during a Short or Long Rest. Each gains this property. Unstable: it deals one additional die of damage. On a hit, it breaks and cannot be repaired.",
  "Impromptu Repair": "With enough raw material (metal, wood, stone) and a bonding agent (nails, rivets, sovereign glue, lots of tape), you can use your action to repair a nonmagical object or construct. A repaired object returns to full function and regains hit points equal to your craftsman level + your Intelligence modifier. A destroyed or dead construct can be restored this way if no more than 1 minute has passed. You can do this a number of times equal to your Intelligence modifier, all regained on a Long Rest.",
  "Quick Configuration": "Legendary weapon property. Components: masterwork weapon. When you apply it, pick any masterwork property of Master level or lower the item lacks. The item gains it as a bonus property, even if it already has another property of that level. You can use your action to swap this bonus property for another of Master level or lower. The item must always meet its prerequisites."},
 "acts": {"Impromptu Repair": "action"},
 "lu": [{"feature": "Impromptu Repair", "lvl": 14, "max": "mod:INT", "reset": "long", "tag": "Repair an object or construct"}],
 "fx": [[3, "Makeshift Brawler", {"notes": [["Note", "Makeshift Brawler: proficient with improvised weapons"]]}]]},
}
