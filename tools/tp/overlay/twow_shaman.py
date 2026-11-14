"""Shaman, World of Warcraft (2024 rules). Reskin of the Barbarian. Own wording."""
CLASS = {
 "parent": "Barbarian",
 "f": {
  "Totems": "This replaces Primal Knowledge. As a Bonus Action you plant one totem in an empty space you can see within 10 feet. A totem is a Small object with AC 10 and 1 Hit Point. It lasts 1 minute, until it drops to 0 Hit Points, or until you plant another. At the end of each of your turns it pulses and fills a 30-foot Emanation. Earthbind: each enemy in the area loses 10 feet of Speed until the end of your next turn. Primal Knowledge: each ally in the area may make Acrobatics, Intimidation, Perception, Stealth, and Survival checks as Strength checks until the end of your next turn. You can plant this totem once per Long Rest, or again by spending a use of Rage (no action). Tremor: each ally in the area is immune to Charmed and Frightened until the end of your next turn, and existing effects are suppressed for that time. Wind Rush: each ally in the area gains 10 feet of Speed until the end of your next turn.",
 },
 "drop": ["Primal Knowledge"],
 "lu": [{"feature": "Totems", "n": "Primal Knowledge Totem", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Totems": "bonus"},
 "mcreq": [["STR"]],
}
