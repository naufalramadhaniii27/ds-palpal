"""Mechanist subclasses (Black Flag Reference Document). Own wording. The Spellwright text is not in the source data."""
SUB = {
"Metallurgist": {"spab": "INT",
 "f": {
  "Augment: Absorbing": "You gain the Absorbing augment effect for free. It doesn't count against your effects known and can't be replaced. Item: armor or shield. When you take acid, cold, fire, force, lightning, poison, or thunder damage from one instance while wearing or wielding it, use your reaction to reduce the damage by twice your Intelligence modifier. You then gain resistance to that damage type for 1 minute, or until you absorb a different type. You can do this a number of times equal to your proficiency bonus, regaining all uses on a long rest.",
  "Mystic Metal": "Spend 1 hour of focus touching a nonmagical suit of armor (part of a short or long rest) to turn it into mystic metal. It lasts until you end it or transmute another suit, and Augment effects on the armor end when it reverts. It reverts if anyone else tries to don it. You choose its look. It isn't natural material, so heat metal and rust monsters don't affect it, and it is light and doesn't hinder movement. You are proficient with it. It works as magic armor: each gauntlet is a Light simple melee weapon, using Strength or Intelligence for attack and damage, dealing 1d6 plus that modifier of magical bludgeoning damage. If on your plane, summon it as a bonus action within 5 feet or already worn (not if you already wear armor). It can't be removed against your will. While worn, your AC is 13 plus your Intelligence modifier.",
  "Heavy Hitter": "While wearing your mystic metal, your weapon hits deal an extra 1d6 force damage, becoming 1d8 at level 9 and 1d10 at level 15. Your weapon attacks also score a critical hit on a roll of 19 or 20.",
  "Juggernaut": "While wearing your mystic metal, you are proficient in Athletics and have advantage on checks to grapple or shove and on weapon option checks that use Strength. If you move at least 15 feet before a melee weapon attack on your turn, you have advantage on the attack roll.",
  "Full Metal": "While wearing your mystic metal, use a bonus action to make it nigh-impervious for 1 minute. It activates automatically if you drop to 0 hit points. While active you are immune to bludgeoning, piercing, and slashing damage and resist all other damage. Once per long rest."},
 "lu": [{"feature": "Augment: Absorbing", "n": "Absorbing", "lvl": 3, "max": "pb", "reset": "long", "tag": "Reaction"},
        {"feature": "Full Metal", "n": "Full Metal", "lvl": 15, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Mystic Metal": "bonus", "Full Metal": "bonus"}},

"Marshal": {"spab": "CHA",
 "f": {
  "Inspiring Leadership": "When you use a stratagem, you can choose one friendly creature that can see and hear you. It has advantage on the next attack roll it makes before the end of its next turn. You can choose two creatures at level 7, three at level 11, and four at level 15.",
  "War Banner: Banner of Coordination": "A banner effect that helps allies strike together. A friendly creature that starts its turn in range gets a +1 bonus to attack rolls for each other friendly creature in range, up to your proficiency bonus, until the start of its next turn.",
  "General's Gambit": "When you or a friendly creature you can see within 30 feet fails an ability check, attack roll, or save, you can spend and roll one of your Vanguard Hit Dice and add the result. You can do this on several checks in a round, but not twice on the same check.",
  "Comrade in Arms": "When you give a creature advantage with Inspiring Leadership, you also gain advantage on your next attack roll before the end of that turn. Also, when a creature hits with an attack that has advantage from Inspiring Leadership, it deals extra damage of the attack's type equal to your proficiency bonus plus Charisma modifier (minimum 2).",
  "Battlefield Vigor": "When you start your turn below half your hit point maximum with at least 1 hit point, you regain hit points equal to your proficiency bonus plus Constitution modifier (minimum 2)."},
 "acts": {"General's Gambit": "reaction"}},
}
