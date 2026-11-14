# Weapons and armor of Valda's Spire of Secrets (2014 rules). Stats come from the source. Rules text per property and per special weapon is own wording.
import re
PD = {
 "AU": "Automatic: on your turn, an attack with it can become two attacks, both at Disadvantage, using twice the ammunition.",
 "CO": "Concealable: Advantage on Dexterity (Stealth) checks to hide it while it is stowed.",
 "DR": "Dry: soaking or submerging it jams it. A jammed firearm cannot attack until a creature uses its action to clear it.",
 "DU": "Double: it has two damage-dealing ends. When you take the Attack action with it, you can use a Bonus Action for one extra attack with it, adding no ability modifier to that damage.",
 "EL": "Elegant: you need Dexterity 16 or higher to wield it.",
 "EX": "Explosive: the projectile bursts in a 15-ft sphere. Others in the blast (within 5 ft of a Medium or smaller target) make a DC 14 Dexterity save, taking half the damage rolled on a failure and none on a success. It can target an empty space in range.",
 "FG": "Foregrip: usable in one or two hands. In two hands its range rises by 50 ft and its long range by 200 ft.",
 "FI": "Fist: attacks with it count as unarmed strikes.",
 "HT": "Heat: each attack adds a heat point and each of your turns removes one. At 3 points it overheats and resets to 0, and cannot attack again until the end of your next turn.",
 "LO": "Loading: you can fire only one piece of ammunition from it per action, Bonus Action or Reaction, whatever the number of attacks you normally have.",
 "MA": "Massive: you can attack with it only when you take the Attack action, and only as your first attack, after which you cannot attack again until your next turn. For each extra attack you forgo, you deal two extra damage dice.",
 "MO": "Mounted: normally used on a tripod, vehicle or other mount. Mounting or unmounting is an action, and while mounted it cannot be moved. Unmounted, only a Medium or larger creature with Strength 15 or higher can attack with it.",
 "MS": "Misfire: rolling a 1 on the d20 for an attack with it jams it. A jammed weapon cannot attack until a creature uses its action to clear it.",
 "PA": "Parrying: while you wield it and no shield, you have +1 AC against melee attacks.",
 "RE": "Returning: a thrown one returns to your hand at the end of your turn.",
 "RO": "Rocket: it has a small engine. Once per turn when it hits, it deals an extra 1d4 damage.",
 "SC": "Scatter: against a target within half its normal range, it deals the damage in the parentheses instead of its normal dice.",
 "SH": "Superheavy: you need Strength 16 or higher to wield it.",
 "ST": "Sighted: Disadvantage on attack rolls against targets within 20 ft.",
 "TE": "Tension: a ranged attack with it uses your choice of Strength or Dexterity for both the attack and damage rolls, the same one for both.",
 "TR": "Trip: you can try to shove any creature within its reach, with Advantage on the check.",
 "TW": "Twinshot: once on each of your turns when you attack with it, you can make another attack against a different creature within 5 ft of the first target and within range.",
 "RLD": "Reload: it holds a fixed number of shots (the number in brackets). Reloading takes an action.",
}
SPECIAL = {
 "Bayonet": "Special: as an action, mount it on any two-handed ranged weapon or remove it. Mounted, it lets you make a two-handed melee attack dealing 1d8 piercing damage.",
 "Bolas": "Special: a creature it hits falls prone until freed. A creature can use its action for a DC 10 Strength check to free itself or a creature within reach. Dealing 5 slashing damage to the bolas (AC 10) also frees it and destroys the bolas. You can throw only one per turn.",
 "Bomb": "Special: it explodes on a hit in a 15-ft sphere and is used up. It can target an empty space in range. Others in the blast (within 5 ft of a Medium or smaller target) make a DC 11 Dexterity save, taking half the damage on a failure and none on a success. As a Bonus Action you can strip out some explosive to remove the blast, so only the target takes damage.",
 "Catchpole": "Special: a hit on a Large or smaller creature can grapple it instead of dealing damage. The grapple uses your attack roll in place of an Athletics check.",
 "Harpoon": "Special: tie a rope to it with an action before throwing. If it hits, it lodges in the target. On later turns you can use an action to hold the rope and make an opposed Strength (Athletics) check to pull the target up to 10 ft closer. When it moves, you can use your Reaction for an opposed check to stop its movement. Doing anything else with your action loses your grip. A target with hands can pull it out as an action.",
 "Hook Hand": "Special: one-handed, usable only if you lack a hand or wear a cuff made for it. A humanoid missing a hand and regularly wearing a hook is proficient with it.",
 "Light Cannon": "Special: it deals double damage to objects and structures. Reloading takes 2 actions.",
 "Rocket Launcher": "Special: it deals double damage to objects and structures. Reloading takes 2 actions.",
 "Machete": "Special: it deals double damage to plants and plant creatures.",
}
def WDESC_FN(it):
    out = []
    for c in it.get("property", []) or []:
        k = c.split("|")[0]
        if k in PD and k not in ("RLD",): out.append(PD[k])
        elif k == "RLD": out.append(PD[k])
    if it["name"] in SPECIAL: out.append(SPECIAL[it["name"]])
    if it.get("type", "").split("|")[0] in ("LA", "MA", "HA"):
        out.append("Armor: base AC %s%s%s." % (it["ac"], {"LA": " + Dexterity modifier", "MA": " + Dexterity modifier (max 2)", "HA": ""}[it["type"].split("|")[0]], "; Strength %s needed" % it["strength"] if it.get("strength") else ""))
        if it.get("stealth"): out.append("It gives Disadvantage on Dexterity (Stealth) checks.")
    return " ".join(out)
ITEMS = []
