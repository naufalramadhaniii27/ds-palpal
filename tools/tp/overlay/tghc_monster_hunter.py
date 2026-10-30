"""Monster Hunter, Grim Hollow Player's Guide 2024. Own wording."""
_LANG = {"Aberration": ("Aberrations", "Deep Speech or Undercommon"), "Beast": ("Beasts", "Sylvan"), "Celestial": ("Celestials", "Celestial"),
         "Construct": ("Constructs", "Draconic"), "Dragon": ("Dragons", "Draconic"), "Elemental": ("Elementals", "Primordial"),
         "Fey": ("Fey", "Sylvan"), "Fiend": ("Fiends", "Abyssal or Infernal"), "Giant": ("Giants", "Giant"),
         "Monstrosity": ("Monstrosities", "Deep Speech"), "Ooze": ("Oozes", "Deep Speech or Undercommon"), "Plant": ("Plants", "Sylvan"),
         "Undead": ("Undead", "Abyssal or Infernal")}
_MGS = {k: "Add your Proficiency Bonus to Intelligence and Wisdom checks about %s. If you are already proficient in the skill, add double your Proficiency Bonus instead. You also learn %s." % (pl, lg)
        for k, (pl, lg) in _LANG.items()}
CLASS = {
 "eq": ["Scale Mail, Longsword, Light Crossbow, 20 Bolts, Dungeoneer's Pack, 5 GP",
        "Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack, 10 GP",
        "160 GP"],
 "f": {
  "Monster Grimoire": "You keep a Monster Grimoire, a manual of dangerous creatures that is unique to you. It can be an annotated tome, a bundle of bloodstained scrolls from a past hunter, or even a gem that holds a talking spirit. If you lose it, you keep your knowledge and suffer no immediate penalty, but you cannot add to it or take another Monster Hunter level until it is replaced. Recreating a grimoire takes 8 hours and 50 GP of books, scrolls, and ink. **Chosen types.** Pick two creature types to specialize in from Aberrations, Beasts, Celestials, Constructs, Dragons, Elementals, Fey, Fiends, Giants, Monstrosities, Oozes, Plants, and Undead. Add your Proficiency Bonus to Intelligence and Wisdom checks that relate to those types, for example History to recall lore about an Undead or Medicine to read the claw marks an Undead left. If you are already proficient in the skill, add double your Proficiency Bonus. **Language.** Each type also teaches you a language: Aberration Deep Speech or Undercommon, Beast Sylvan, Celestial Celestial, Construct Draconic, Dragon Draconic, Elemental Primordial, Fey Sylvan, Fiend Abyssal or Infernal, Giant Giant, Monstrosity Deep Speech, Ooze Deep Speech or Undercommon, Plant Sylvan, Undead Abyssal or Infernal. Your GM can extend this list for the campaign world.",
  "Weapon Mastery": "You can use the mastery properties of two kinds of weapons you are proficient with, such as Longbow and Longsword. After each Long Rest you can drill and swap one of those choices. The Weapon Mastery column of the class table shows when you can use more kinds.",
  "Fighting Style": "You gain a Fighting Style feat of your choice.",
  "Studied Response": "When a creature you can see within 60 feet targets you or another creature with a melee or ranged attack, you can use your Reaction before the attack roll to make one attack against that creature with a weapon or an Unarmed Strike. If your attack misses, you regain your Reaction.",
  "Expert Strike": "Add your Intelligence modifier to the attack rolls and damage rolls of your weapons and Unarmed Strikes.",
  "Improved Monster Grimoire": "**Level 6.** Add a third creature type to your Monster Grimoire. It cannot be one you already chose, and all grimoire benefits apply to it. Also, your weapon and Unarmed Strike attack rolls against creature types in your grimoire score a Critical Hit on a 19 or 20 on the d20. **Level 13.** Add a fourth creature type in the same way.",
  "Knowledgeable Defense": "When a creature type in your Monster Grimoire forces you to make a saving throw, you can make an Intelligence saving throw instead.",
  "Extra Attack": "You can attack twice, instead of once, when you take the Attack action on your turn.",
  "Lair Sense": "You have Advantage on saving throws and Resistance to damage from lair actions and regional effects caused by creatures. You also have Advantage on saving throws and Resistance to damage from the Legendary Actions of creature types in your Monster Grimoire.",
  "Slayer's Aid": "When you use Studied Response, you can choose a Friendly creature that can see or hear you. That creature can use its Reaction to make one attack with a weapon or Unarmed Strike against the creature that triggered your Studied Response. If the ally has no Reaction available, it regains it but must spend it on this attack. The ally's attack happens after yours and before the target makes its own attack. This ability refreshes at the start of your turn.",
  "Grave Strike": "Your weapon and Unarmed Strike attack rolls against creature types in your Monster Grimoire score a Critical Hit on a roll of 18 to 20 on the d20. When you score a Critical Hit against such a creature, it makes a Constitution saving throw. The DC equals the damage it took, to a maximum of 30. On a failure it drops to 0 Hit Points. On a success it takes the attack's normal damage. You can use this a number of times equal to your Intelligence modifier (minimum 1) and regain all uses after a Long Rest.",
 },
 "res": [],
 "lu": [{"feature": "Grave Strike", "n": "Grave Strike", "lvl": 20, "max": "mod:INT", "reset": "long", "tag": "Critical Hit"}],
 "acts": {"Studied Response": "reaction", "Slayer's Aid": "free"},
 "opts": [{"feature": "Monster Grimoire", "title": "Grimoire creature type", "types": ["MGS"], "cum": {"1": 2, "6": 3, "13": 4}}],
 "opt": {"MGS": _MGS},
}
