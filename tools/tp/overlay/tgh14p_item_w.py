# Weapon property texts of Grim Hollow Player's Guide (2014 rules). Own wording. Stats come from the source.
PD = {
 "ADV_AP": "Armor Piercing: you get +1 to the attack roll against a target that wears armor or has natural armor.",
 "ADV_B": "Brutal: when you score a critical hit with it, you add one extra weapon damage die.",
 "ADV_BP": "Blackpowder: each shot is heard 300 ft away. It cannot fire if soaked by heavy rain, submerged or drenched. You cannot use it again until you finish a Short Rest in dry conditions.",
 "ADV_C": "Cumbersome: you must use your Strength modifier for its attack and damage rolls.",
 "ADV_DBL": "Double: a two-handed double weapon counts as two light weapons, one in each hand, for two-weapon fighting. If it also has Reach, you can use only one of the two properties in a turn.",
 "ADV_DEF": "Defending: when a melee attack hits you, use your reaction to add 1d4 to your AC against that attack.",
 "ADV_DIS": "Disarming: when a foe misses you with a melee weapon attack, use your reaction to contest attack rolls with it. If you win and the weapon can be dropped, it falls within 5 ft of the target in a space you choose. If you crit and the attacker did not, you can fling it up to 15 ft away. With a free hand on that crit you end up holding it. On a tie or loss, nothing happens.",
 "ADV_DMG": "Damage: you can choose the damage type each time you attack, from the types listed for the weapon.",
 "ADV_ENT": "Entangling: when you hit a target no more than one size larger than you, use a bonus action to try to grapple it. You need no free hand. The target is grappled by you or by the weapon if you no longer hold it. You cannot attack another target with the weapon while the grapple lasts. If you do not hold it, such as with a thrown gladiator net, the target escapes with a DC 10 Dexterity (Acrobatics) or Strength (Athletics) check.",
 "ADV_G": "Guard: if you did not move on your last turn, when a hostile creature moves into your reach you can use your reaction to attack it. On a hit it takes no damage, stops at once, and its speed is 0 until the end of its turn.",
 "ADV_HFT": "Hafted: when you attack with only this weapon, use a bonus action to attack with its haft for 1d4 Bludgeoning damage, adding your ability modifier as with other off-hand attacks. If you have a feat that does the same, the haft deals 1d8.",
 "ADV_M": "Momentum: when you hit after moving at least 20 ft in a straight line this turn, you can upgrade its damage dice to its momentum dice.",
 "ADV_MAG": "Magazine: it holds a set number of a set ammunition type. Loading or removing a magazine uses your object interaction, so doing both takes an action. It comes with one empty magazine. Filling an empty magazine takes 1 minute.",
 "ADV_MON": "Monk: a monk is proficient with it from level 5 and can use it as a monk weapon.",
 "ADV_PRC": "Precise: you crit on a 19 or 20. Features that widen your crit range widen this by one more. A roll under 20 must still hit.",
 "ADV_RES": "Restraining: if you already have a target grappled with this weapon and succeed on another grapple attempt with it, the target is Restrained instead. It stays Restrained until the grapple ends. If you let go of the weapon, the target can escape as from an unheld entangling weapon.",
 "ADV_RET": "Returning: when you throw it, an even d20 roll means it returns to you by the end of your turn. You catch it with a free hand, or it lands within 5 ft of you. An odd roll means it does not return.",
 "ADV_RPT": "Repeater: when you take the Attack action with it, use a bonus action to attack again with it. You do not add your ability modifier to that damage unless it is negative. You can do this even if it has Loading.",
 "ADV_SC": "Scatter: when you hit with it, creatures other than the target in its scatter area make a Dexterity save against your Scatter DC, taking damage equal to the ability modifier you used to hit (minimum 1) of the weapon's type. Scatter DC = 8 + Proficiency Bonus + that modifier. The area starts at the target. A Flame Bellows reaches 15 ft with a 15-ft cone behind the target.",
 "ADV_SET": "Set: use a bonus action to set it against a foe approaching you. It becomes unset if you move or take any action. If a target enters your reach while set, use your reaction to attack it. If you hit and it moved 20 ft or more toward you first, roll one of the weapon's damage dice one extra time and add it.",
 "ADV_STRD": "Strong-Draw: you need Strength 13 or you have Disadvantage on attacks with it. You add your Dexterity modifier to damage, plus 1 plus half your Strength modifier, rounded down.",
 "ADV_SW": "Swift: after you miss with it, you have Advantage on your next attack roll with it against the same target.",
 "ADV_TRIP": "Tripping: when you hit, use a bonus action to make a target no more than one size larger than you make a Strength save, DC 8 + Proficiency Bonus + your Strength or Dexterity modifier. On a failure it falls Prone.",
}
def WDESC_FN(it):
    out = []
    for c in it.get("property", []) or []:
        k = c.split("|")[0]
        if k in PD: out.append(PD[k])
    return " ".join(out)
WDESC = {}
