"""Unearthed Arcana 2026 Villainous Options 2 (2024 rules): Path of Lament, Primordial Patron, Warrior of Venom. Own wording."""
SUB = {
"Path of Lament": {"spab": "WIS",
 "f": {
  "Banshee's Wail": "When you start your Rage, or as a Bonus Action while it lasts, you can wail. Each creature of your choice in a 30-foot Emanation makes a Constitution save (DC 8 + Constitution modifier + Proficiency Bonus). A failure takes Psychic damage and is Deafened for 1 minute. A success takes half damage. The damage is a number of d12 equal to your Rage Damage bonus. You can use this a number of times equal to your Constitution modifier (min 1), regaining all uses after a Long Rest, or by spending a Rage use (no action).",
  "Commune with the Dead": "You can cast Speak with Dead as a Ritual only. Wisdom is your spellcasting ability for it.",
  "Horrifying Strike": "Once per turn, when you hit with a Strength-based attack roll while Raging, you can try to horrify the target. It makes a Wisdom save (DC 8 + Constitution modifier + Proficiency Bonus) or is Frightened until the start of your next turn.",
  "Otherworldly Anguish": "Deathly Wail: a target that fails its save against Banshee's Wail and has Hit Points equal to or below twice your Barbarian level drops to 0 Hit Points instead of taking damage. Impenetrable Sorrow: you can't be possessed. Resistance: while Raging you have Resistance to Cold and Necrotic damage.",
  "Sorrow Form": "When you start your Rage you can take on an undead form for 1 minute or until you drop to 0 Hit Points. You can do this once per Long Rest. Immunities: you have Immunity to Charmed and Frightened, any such condition on you ends, and you can't gain Exhaustion. Life-Draining Strike: a creature that fails its save against Horrifying Strike takes 2d10 Necrotic damage and you regain Hit Points equal to the damage. Undead: your creature type is Undead."},
 "lu": [{"feature": "Banshee's Wail", "lvl": 3, "max": "mod:CON", "reset": "long", "tag": "Reset by a Rage use"},
        {"feature": "Sorrow Form", "lvl": 14, "max": 1, "reset": "long", "tag": "When you Rage"}],
 "fx": [[10, "Otherworldly Anguish", {"notes": [["Note", "Otherworldly Anguish: while Raging, Resistance to Cold and Necrotic damage. Can't be possessed"]]}],
        [14, "Sorrow Form", {"condImm": ["Charmed", "Frightened"], "notes": [["Note", "Sorrow Form: Undead creature type, no Exhaustion, for 1 minute"]]}]],
 "acts": {"Banshee's Wail": "bonus"}},

"Primordial Patron": {"spab": "CHA",
 "f": {
  "Elemental Node": "Pick an element: Air (Thunder), Earth (Acid), Fire (Fire), or Water (Cold). It sets the damage type of several features, and you can change it whenever you gain a level. Magic action: create a 5-foot-radius Sphere of elemental magic centered on a point you see within 60 feet. On later turns you can move it up to 30 feet as a Bonus Action. Each other creature in the node makes a Dexterity save against your spell save DC when it appears, when it moves into a creature's space, and when a creature enters or ends its turn there (once per turn per creature). A failure takes 1d6 damage of your element's type, a success takes half. It lasts 1 minute, until you dismiss it (no action), or until you make a new node. You can't make one again until a Short or Long Rest, or until you spend a Pact Magic slot (no action). Damage becomes 2d6 at Warlock level 6 and 3d6 at 14.",
  "Elemental Spells": "Always prepared from the listed Warlock levels: 3 Chromatic Orb, Darkvision. 5 Elemental Weapon. 7 Summon Elemental. 9 Commune with Nature. Plus your element's spells. Air: 3 Feather Fall, Shatter. 5 Fly. 7 Freedom of Movement. 9 Steel Wind Strike. Earth: 3 Entangle, Knock. 5 Plant Growth. 7 Vitriolic Sphere. 9 Wall of Stone. Fire: 3 Burning Hands, Heat Metal. 5 Fireball. 7 Wall of Fire. 9 Flame Strike. Water: 3 Alter Self, Ice Knife. 5 Water Walk. 7 Control Water. 9 Cone of Cold.",
  "Elemental Haven": "Elemental Protection: while you are in your node you gain a bonus to AC equal to your Charisma modifier (min 1). Elemental Teleport: as a Bonus Action, teleport into your node or the nearest free space within 5 feet of it. You can do this a number of times equal to your Charisma modifier (min 1), regaining all uses after a Long Rest.",
  "Primeval Protection": "Elemental Fortitude: you have Resistance to your element's damage type, and Immunity to it while in your node. Node Improvement: your node becomes a 10-foot-radius Sphere.",
  "Elemental Harbinger": "Elemental Vortex: when you spend a Pact Magic slot while in your node, you can pull one creature you choose within 30 feet of it. It makes a Strength save or is pulled up to 15 feet toward the node's center. Node Improvement: the node lasts up to 1 hour. Primordial Herald: while in the node you can cast Planar Ally without a slot, naming your patron. After you do this you can't do it again until you finish 2d4 Long Rests."},
 "lu": [{"feature": "Elemental Node", "lvl": 3, "max": 1, "reset": "short", "tag": "Reset by a Pact Magic slot"},
        {"feature": "Elemental Haven", "n": "Elemental Teleport", "lvl": 6, "max": "mod:CHA", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Elemental Harbinger", "n": "Primordial Herald (Planar Ally)", "lvl": 14, "max": 1, "reset": "none", "tag": "Available again after 2d4 Long Rests"}],
 "fx": [[6, "Elemental Haven", {"notes": [["Note", "Elemental Protection: +Charisma modifier (min +1) AC while in your Elemental Node"]]}],
        [10, "Primeval Protection", {"notes": [["Note", "Elemental Fortitude: Resistance to your element's damage type (Air Thunder, Earth Acid, Fire Fire, Water Cold). Immunity while in your node"]]}]],
 "acts": {"Elemental Node": "action", "Elemental Haven": "bonus"}},

"Warrior of Venom": {"spab": "WIS",
 "f": {
  "Envenom Weapon": "At the start of your turn, spend 1 Focus Point to coat one Monk weapon you hold with a toxin from your blood. A creature damaged by it suffers one effect you chose when applying it. Slowing Toxin: until the start of your next turn its Speed is halved, it can't take Reactions, and it takes an action or a Bonus Action on its turn, not both. Venom: it takes Poison damage equal to two rolls of your Martial Arts die. The toxin lasts 1 minute or until a creature is damaged by the weapon.",
  "Potent Arsenal": "You gain a Poisoner's Kit and proficiency with it. You can make a Basic Poison in 1 day (8 hours of work). When you deal Poison damage with a Monk feature or Monk weapon, you can change it to Acid damage.",
  "Toxic Touch": "Magic action, spend 1 Focus Point: apply a toxin to a creature you touch. It makes a Constitution save. On a failure it is Poisoned for 1 minute and you choose one effect while it is Poisoned. Intoxicant: it is Charmed until the duration ends or you or your allies damage it. Sedative: it falls asleep and is Unconscious, and another creature can wake it with an action. Truth Serum: it can't knowingly lie.",
  "Toxic Blood": "When a creature hits you with a melee attack roll, the attacker takes 1d6 Poison damage. While you are Bloodied it takes one roll of your Martial Arts die instead.",
  "Toxin Refiner": "You have Immunity to Poison damage. When you are subjected to Poison damage, your Envenom Weapon options each deal extra Poison damage equal to one roll of your Martial Arts die, and you can't gain this benefit again until the end of your next turn. When you ingest a poison, you regain Hit Points equal to one roll of your Martial Arts die.",
  "Hallucinogenic Breath": "When you take the Attack action, spend 2 Focus Points and replace one attack with a breath of vapors at a creature you see within 30 feet. It makes a Constitution save. A failure takes Poison damage equal to three rolls of your Martial Arts die and is Frightened for 1 minute or until it takes damage. While Frightened it must Dash away from you by the safest route each turn if it can. A success takes half damage."},
 "lu": [],
 "fx": [[3, "Potent Arsenal", {"notes": [["Note", "Potent Arsenal: Poisoner's Kit proficiency. Monk Poison damage can become Acid"]]}],
        [11, "Toxin Refiner", {"imm": ["Poison"]}]],
 "acts": {"Toxic Touch": "action", "Hallucinogenic Breath": "other"}},
}
