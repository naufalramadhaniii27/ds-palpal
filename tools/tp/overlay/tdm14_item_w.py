# Weapon and armor texts of Dark Matter (2014 rules). Stats come from the source. Property texts are own wording.
PD = {
 "BLSTR": "Blaster: it runs on an arcane battery and never needs reloading. You do not add your ability modifier to its damage rolls unless stated. You can fight with two light blasters, but the bonus attack subtracts 2 from its damage roll (minimum 1).",
 "AU": "Automatic: on your turn, an attack with it can become two attacks, both at Disadvantage regardless of circumstances.",
 "EX": "Explosive: the projectile bursts in a 5-ft radius, and can target an empty space in range. Each other creature in the blast makes a DC 14 Dexterity save, taking half the damage rolled on a failure and none on a success.",
 "FG": "Foregrip: usable in one or two hands. In two hands its range rises by 50 ft and its long range by 200 ft.",
 "FST": "Fist: attacks with it count as unarmed strikes.",
 "HT": "Heat: each attack adds a heat point and each of your turns removes one. At 3 points it overheats and resets to 0, and cannot attack again until the end of your next turn.",
 "MNT": "Mounted: normally used on a tripod, vehicle or other mount. Mounting or unmounting is an action, and while mounted it cannot be moved. Unmounted, only a Medium or larger creature with Strength 15 or higher can attack with it.",
 "NL": "Nonlethal: when it drops a creature to 0 hit points, you can knock it out instead of killing it.",
 "OH": "Overheat: after you attack with it, it cannot attack again until the end of your next turn.",
 "SCTR": "Scatter: against a target within half its normal range, it deals the damage in the parentheses instead of its normal dice.",
 "SGT": "Sighted: Disadvantage on attack rolls against targets within 20 ft.",
}
SPECIAL = {
 "Arc Baton": "Special: a creature it hits cannot take reactions until the start of its next turn.",
 "Battlefist": "Special: it works as an oversized articulated gauntlet that can hold and handle objects. You cannot attack with it while it holds an object.",
 "Diode Beam": "Special: as an action, fire it as a continuous beam along a 120-ft by 5-ft line in a direction you choose. A creature that enters the line for the first time on a turn, or starts its turn there, makes a DC 14 Dexterity save or takes 4d6 Radiant damage. At the start of each of your later turns roll a d20. On a 5 or lower it overheats and cannot fire until the end of your next turn. Otherwise you can use your action to keep firing and turn the line.",
 "Laser Sword": "Special: its damage type is Force, Necrotic or Radiant, chosen when the weapon is made and then fixed.",
 "Plasma Cutter": "Special: it ignores the damage threshold of nonmagical objects it cuts.",
 "Psionic Helm": "Special: use Intelligence, Wisdom or Charisma instead of Dexterity for its attack rolls.",
 "Rocket Hammer": "Special: once per turn when you attack with it, you can fire its thrusters for an extra 1d4 Bludgeoning damage on a hit.",
 "Singularity Emitter": "Special: when it hits, each creature within 10 ft of the target is pulled up to 5 ft toward it.",
 "Sunstaff": "Special: it can also be used as a Quarterstaff.",
 "Volcanic": "Special: each attack spews flames in a 15-ft cone. Each creature in it makes a DC 14 Dexterity save or takes 2d6 Fire damage.",
}
def WDESC_FN(it):
    out = []
    if it["name"] in SPECIAL: out.append(SPECIAL[it["name"]])
    for c in it.get("property", []) or []:
        k = c.split("|")[0]
        if k in PD: out.append(PD[k])
    if it.get("type", "").split("|")[0] in ("LA", "MA", "HA"):
        out.append("Armor: base AC %s%s%s." % (it["ac"], {"LA": " + Dexterity modifier", "MA": " + Dexterity modifier (max 2)", "HA": ""}[it["type"].split("|")[0]], "; Strength %s needed" % it["strength"] if it.get("strength") else ""))
        if it.get("stealth"): out.append("It gives Disadvantage on Dexterity (Stealth) checks.")
    return " ".join(out)

WDESC = {}
