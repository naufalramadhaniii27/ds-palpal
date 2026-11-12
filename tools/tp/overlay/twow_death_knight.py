"""Death Knight, World of Warcraft (2024 rules). Reskin of the Paladin. Own wording."""
CLASS = {
 "parent": "Paladin",
 "res_drop": ["Lay on Hands"],
 "f": {
  "Death Coil": "This replaces Lay on Hands. Your creature type becomes Undead. You also command negative energy through a pool of d8s. The pool holds one die plus your Charisma modifier (minimum one die in total). As a Bonus Action, pick a creature you can see within 60 feet and spend dice from the pool, up to your Charisma modifier (minimum 1) at once. Roll them. The target makes a Constitution saving throw and takes Necrotic damage equal to the total on a failure, or half on a success. If the target is Undead, you can instead have it regain Hit Points equal to the total. All spent dice return after a Long Rest.",
  "Runic Smite": "This replaces Paladin's Smite. You always have the Rune Strike spell prepared. You can cast it once without a spell slot and regain that free cast after a Long Rest.",
  "Faithful Steed": "You always have the Find Steed spell prepared, and you can cast it once without a spell slot, regaining that free cast after a Long Rest. When you cast it, the Otherworldly Steed can be Undead. An Undead steed deals Necrotic damage with Otherworldly Slam and gains this Bonus Action, usable once and regained after a Long Rest. Ghostly Stride: until the end of the turn the steed and its rider move through creatures and objects as if they were Difficult Terrain. Both take 5 (1d10) Force damage if they end the turn inside an object.",
  "Runic Strikes": "This replaces Radiant Strikes. When you hit with a Melee weapon or an Unarmed Strike, the target takes an extra 1d8 Necrotic damage.",
  "Improved Death Coil": "This replaces Restoring Touch. When Death Coil deals damage, the target takes extra Necrotic damage equal to your Charisma modifier (minimum 1), whether or not it passes the save. If you use Death Coil to heal an Undead target, it regains extra Hit Points equal to your Paladin level.",
 },
 "lu": [
  {"feature": "Death Coil", "n": "Death Coil dice", "lvl": 1, "max": {"f": "1+mod:CHA", "min": 1}, "reset": "long", "tag": "Bonus Action"},
  {"feature": "Runic Smite", "n": "Rune Strike (free cast)", "lvl": 2, "max": 1, "reset": "long", "tag": "Spell"},
  {"feature": "Faithful Steed", "n": "Find Steed (free cast)", "lvl": 5, "max": 1, "reset": "long", "tag": "Spell"},
 ],
 "acts": {"Death Coil": "bonus"},
 "auto": [[2, "Rune Strike"], [5, "Find Steed"]],
 "mcreq": [["STR"], ["CHA"]],
}
