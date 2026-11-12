"""Craftsman, Valda's Spire of Secrets (2014 rules, Mage Hand Press). Own wording. Internal name "Craftsman (2014)"."""
MW = {
 "Apprentice": "Armor (10): Cleated, Climbing, Comfortable, Environmental, Exotic, Integrated, Quick-Change, Retractable, Scaled, Spiked. Weapon (27): Aerodynamic, Automatic, Balanced, Concealable, Elegant, Exotic, Extended Magazine, Finesse, Firearm, Fist, Foregrip, Heavy, Light, Loading, Martial, Parrying, Reach, Reload, Returning, Scatter, Sighted, Superheavy, Switch, Thrown, Trip, Two-Handed, Versatile.",
 "Journeyman": "Armor (8): Adamantine, Arcane, Arrow-Catching, Diving, Juggernaut, Maneuvering, Mithral, Resistance. Weapon (12): Counterweighted, Double, Explosive, Heat, Magical, Massive, Mounted, Precision, Rocket, Sniper, Tension, Twin Shot.",
 "Master": "Armor (6): Animated, Cloaking, Clockwork, Glamoured, Trollskin, Winged. Weapon (11): Adamantine, Blessed, Earthshatter, Elemental, Keen, Magical, Mithral, Serrated, Slaying, Vampiric, Venom.",
 "Legendary": "Armor (7): Colossal, Etherealness, Fleet, Immortal, Mirrored, Spellguard, Warding. Weapon (8): Crushing, Deadly, Magical, Penetrating, Seeking, Threatening, Vorpal, Whirlwind. Your guild also teaches one extra legendary property of its own.",
}
_APP = ("Masterwork gear. Making a masterwork copy of a weapon or armor adds 50 gp to the material cost. Your masterwork weapons get +1 to attack rolls. A magic weapon that already adds a bonus to attack and damage rolls does not add this bonus. "
        "Masterwork properties. Each masterwork weapon or armor can take properties of four tiers. You can add any number of Apprentice properties to a weapon, or up to three to armor. You can also add one Journeyman, one Master and one Legendary property to each item. Master and Legendary properties work only for you. "
        "Modifying gear. Through Active Crafting you can modify one weapon or armor each long rest. Journeyman and higher properties cost gold and need a minimum Craftsman level (Journeyman 5 for 100 gp, Master 11 for 250 gp, Legendary 17 for 400 gp). The first property of each new tier is free when you learn the tier. You can change a modified weapon's damage type between bludgeoning, piercing and slashing, and you can remove properties that are not prerequisites for others. "
        "Masterwork save DC. 8 + your Proficiency Bonus + your Intelligence modifier. "
        "Apprentice properties: ")
CLASS = {
 "eq": ["A set of craftsman's tools, a Shield and Chain Mail, Leather Armor or Scale Mail, a Dagger and a Warhammer or simple weapon, a Light Crossbow and 20 bolts or a Shortbow and 20 arrows, a Dungeoneer's Pack", "5d4 × 10 GP"],
 "f": {
  "Exotic Proficiencies": "You are proficient with exotic weapons and exotic armor, which no other class uses. Other features that grant weapon or armor proficiency do not include exotic gear unless they say so. Craftsman's tools. You carry a combined toolkit (75 gp) that works for any ability check made with any artisan's tools. Multiclassing. A multiclass Craftsman gains proficiencies by Craftsman level. Level 1: all artisan's tools, light and medium armor, shields, simple, martial and exotic weapons. Level 2: heavy armor. Level 3: exotic armor.",
  "Active Crafting": "When you take a Long Rest you can craft one nonmagical item without losing the rest's benefits. You pay half its gold cost in materials, up to the daily amount in the Active Crafting column (25 gp at level 1, rising to 500 gp at level 20). A pricier item takes several days, spending that daily amount each day. You sell items you craft for half their cost, so you recover materials but make no profit.",
  "Masterwork (Apprentice properties)": _APP + MW["Apprentice"],
  "Masterwork (Apprentice Properties)": _APP + MW["Apprentice"],
  "Tool Belt": "As an action you pull a nonmagical piece of gear worth up to 50 gp from your belt, pack or cart, even if you did not own it. It cannot be a weapon, armor, shield or potion. The item vanishes when you finish a Long Rest. You can do this a number of times equal to your Intelligence modifier (minimum 1), and you regain all uses after a Long Rest.",
  "Artisan's Guild": "You join an Artisans' Guild and gain its level 3 feature. Pick one guild from the list below the class.",
  "Extra Attack": "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
  "Masterwork (Journeyman properties)": "You can add Journeyman masterwork properties to your masterwork gear. " + MW["Journeyman"],
  "Folded Steel": "Masterwork weapons you craft or modify count as magical for overcoming resistance and immunity to nonmagical attacks and damage.",
  "Artisan's Guild feature": "Your guild gives you another feature at this level.",
  "Artisan's Guild Feature": "Your guild gives you another feature at this level.",
  "Eye for Quality": "You can cast Identify at will, with no spell slot or components. When you do, you also learn the target item's market value in gold pieces.",
  "Masterwork (Master properties)": "You can add Master masterwork properties to your masterwork gear. " + MW["Master"],
  "Flawless Construction": "Items you craft show no rust, wear or aging. Masterwork items you create have resistance to all damage, and only effects that can destroy magic items can destroy them.",
  "Uncanny Tool Belt": "You can produce one common or uncommon magic item from your tool belt. It vanishes when you finish a Long Rest. Long Rest to use this again.",
  "Masterwork (Legendary properties)": "You can add Legendary masterwork properties to your masterwork gear. " + MW["Legendary"],
  "Legendary Property": "Your guild teaches you a Legendary masterwork property. You can apply it right away to a masterwork weapon or armor.",
  "Magnum Opus": "You spend 30 days of feverish work to create one magic item of very rare or legendary rarity. It is bound to your soul. You are always attuned to it, nobody else can attune to it while you live, it does not count toward your attunement limit, and you ignore its attunement requirements. On the same plane, you can use a Bonus Action to call it to your hand or body. You can craft only one Magnum Opus.",
 },
 "track": {"Active Crafting": ["25 gp", "25 gp", "50 gp", "75 gp", "100 gp", "125 gp", "150 gp", "175 gp", "200 gp", "225 gp", "250 gp", "275 gp", "300 gp", "325 gp", "350 gp", "375 gp", "400 gp", "425 gp", "450 gp", "500 gp"]},
 "res": [{"n": "Tool Belt", "tag": "Intelligence modifier uses. Long Rest", "reset": "long", "max": "mod:INT"},
         {"n": "Uncanny Tool Belt", "tag": "Long Rest", "reset": "long", "max": [0]*14 + [1]*6}],
 "lu": [],
 "acts": {"Tool Belt": "action", "Uncanny Tool Belt": "action"},
}
