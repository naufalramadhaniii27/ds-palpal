"""Gadgeteer subclasses, Dark Matter 2024. Own wording."""
SUB = {
"AI Futurist": {"spab": "",
 "f": {
  "Advanced Subroutines": "When you roll Initiative, choose whether your AI runs Adaptive Accuracy or Predictive Avoidance. You can tell it to switch as a Bonus Action. **Adaptive Accuracy.** When you miss with an attack, your AI corrects the error. The next attack roll you make before the end of your next turn has Advantage. **Predictive Avoidance.** When a creature hits you with an attack roll, your AI predicts the next strike. That attacker has Disadvantage on the next attack roll it makes against you this turn.",
  "Novel Intelligence": "**Bonus Skill.** Choose one more skill from the AI Companion list to gain that feature's benefit. **Translator.** Your AI knows all languages.",
  "Tactical Analysis": "When you roll Initiative, your AI studies one creature you can see within 60 feet. You learn one of these: its Armor Class, one of its Immunities, Resistances, or Vulnerabilities, or the spells currently affecting it.",
  "Reactive Hack": "When a creature you can see attacks you with a weapon that is Magical Technology, such as a Laser Sword or blaster, you can use a Reaction to have your AI disable it. The attacker makes an Intelligence save against your Gadget save DC. On a failure the weapon is disabled until the end of the current turn, and the attacker must use another weapon or an Unarmed Strike, or lose the attack.",
  "Hyperintelligence": "When you make a D20 Test, you can treat a d20 roll of 9 or lower as a 10. You can do this a number of times equal to your Intelligence modifier (minimum once) and regain all uses when you finish a Long Rest."},
 "lu": [{"feature": "Hyperintelligence", "n": "Hyperintelligence", "lvl": 14, "max": "mod:INT", "reset": "long", "tag": "Free"}],
 "acts": {"Advanced Subroutines": "bonus", "Reactive Hack": "reaction"}},

"Cyber Surgeon": {"spab": "",
 "f": {
  "Bio-Serum": "As a Bonus Action, inject yourself or a creature you can see within 5 feet with a healing serum. The target regains Hit Points equal to your Gadgeteer level. It can also spend one of its Hit Point Dice, rolling it and regaining extra Hit Points equal to the roll. You can use this a number of times equal to your Intelligence modifier (minimum once). A Short Rest restores one use and a Long Rest restores all of them.",
  "Skilled Surgeon": "You gain proficiency in Medicine if you lack it. You also add your Intelligence modifier (minimum +1) to Medicine checks.",
  "Lazarus Bolt": "As a Magic action, drive a bolt into the chest of a creature within 5 feet that died in the last minute and shock it back to life. It returns with 1 Hit Point and gains Temporary Hit Points equal to twice your Gadgeteer level. It cannot revive a creature without a heart, one that died of old age, or one missing vital organs. Once you use it, you cannot use it again until you finish a Long Rest. You can also restore it by spending two uses of Bio-Serum (no action).",
  "Experimental Trials": "When you use Bio-Serum, you can also give the target the effect of one of these spells, with no Concentration needed: Blur, Enhance Ability, Enlarge/Reduce, Invisibility, or Spider Climb. The spell ends early for that creature if you use this feature on it again.",
  "Biotech Field": "As a Magic action, start a healing field in a 30-foot Emanation from you. Restore up to 100 Hit Points, divided as you choose among any creatures in it. A creature that regains at least 1 Hit Point this way has Advantage on D20 Tests until the start of your next turn. Once you use it, you cannot use it again until you finish a Long Rest."},
 "lu": [{"feature": "Bio-Serum", "n": "Bio-Serum", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Lazarus Bolt", "n": "Lazarus Bolt", "lvl": 6, "max": 1, "reset": "long", "tag": "Magic"},
        {"feature": "Biotech Field", "n": "Biotech Field", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic"}],
 "acts": {"Bio-Serum": "bonus", "Lazarus Bolt": "action", "Biotech Field": "action"},
 "grant": {"f": "Skilled Surgeon", "skills": [[3, "Medicine"]]},
 "fx": [[3, "Skilled Surgeon", {"skills": ["Medicine"], "notes": [["Note", "Skilled Surgeon: add Intelligence modifier (min +1) to Medicine checks"]]}]]},

"Drone Jockey": {"spab": "",
 "f": {
  "Drone Commander": "You have a special Drone Controller that does not count against your attunement limit. While you use it: **Swift Command.** If you do not have the Incapacitated condition, you can command your drone on your turn without spending a Bonus Action. You can do this a number of times equal to your Intelligence modifier (minimum once) and regain all uses when you finish a Long Rest. **Intelligent Blaster.** You can use your Intelligence modifier for your drone's attack. **Omni-Drone.** A drone linked to the controller counts as an Assault drone, a Medical drone, and a Shield drone. **Drone Replacements.** If you lose a drone, you can build a free replacement and link it to the controller over 1 hour, during a Short Rest or Long Rest.",
  "Swarm Tactics": "You have a second drone linked to your Drone Controller. When you command your drone with the controller, you can command all linked drones at once, giving them the same orders or different ones. At Gadgeteer level 10 you gain a third linked drone.",
  "Sacrificial Dive": "When a creature hits you with an attack roll, you can use a Reaction to put one of your drones between the attacker and you. The attack hits the drone instead. Once you use this feature, you cannot use it again until you finish a Short Rest or Long Rest.",
  "Omega Upgrade": "You upgrade the drones linked to your Drone Controller. **Integrated Blaster.** Your drones deal 2d6 Radiant damage on a hit. **Revival Protocol.** The drone restores 18 (4d8) Hit Points to a creature within 5 feet of it. **Shield Projector.** Roll a d8 instead of a d6 and add it to AC."},
 "lu": [{"feature": "Drone Commander", "n": "Swift Command", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Free"},
        {"feature": "Sacrificial Dive", "n": "Sacrificial Dive", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Sacrificial Dive": "reaction"}},

"Hologrammer": {"spab": "INT",
 "f": {
  "Hologram Projector": "You have a projector for lifelike holograms. Its energy is a pool of Hologram points equal to your Gadgeteer level, and you regain all spent points when you finish a Long Rest. While you hold the projector, you can cast spells from the table below. Each costs the listed points and needs the listed Gadgeteer level. Intelligence is your spellcasting ability for them. **Level 3, 1 point.** Color Spray, Silent Image. **Level 5, 2 points.** Blur, Invisibility. **Level 9, 3 points.** Hypnotic Pattern, Major Image. **Level 13, 4 points.** Greater Invisibility, Hallucinatory Terrain. **Level 17, 5 points.** Mislead, Seeming.",
  "Illusory Decoy": "As a Bonus Action, create a holographic copy of yourself that mirrors your movement for 10 minutes. While it exists, when a creature hits you with an attack roll, roll a d6. On a 3 or higher the decoy is hit instead and is destroyed. Once you use this Bonus Action, you cannot use it again until you finish a Short Rest or Long Rest. You can also restore it by spending 2 Hologram points (no action).",
  "Dazzling Devices": "You gain the Magic Item (Flashbang) and Magic Item (Invisibomb) Gadgets, which do not count against your number of Gadgets. When you take the Attack action, you can replace one attack with throwing a Flashbang or Invisibomb.",
  "Holographic Burst": "When your Illusory Decoy is destroyed, you can use a Reaction and spend 2 Hologram points to deal 2d8 Radiant damage to the attacker and create a new decoy at once.",
  "Cognitohazard": "While you concentrate on Hypnotic Pattern, Major Image, Mislead, or Silent Image, you can replace one attack with making the illusion lash out at a creature you can see within 30 feet of the spell's image. The target makes a Wisdom save against your Gadget save DC. On a failure it takes 3d6 plus half your Gadgeteer level (round down) Psychic damage and has Disadvantage on the next saving throw it makes before the end of your next turn. On a success it takes half damage only."},
 "lu": [{"feature": "Hologram Projector", "n": "Hologram points", "lvl": 3, "max": list(range(1, 21)), "reset": "long", "tag": "Spell cost"},
        {"feature": "Illusory Decoy", "n": "Illusory Decoy", "lvl": 3, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Illusory Decoy": "bonus", "Holographic Burst": "reaction", "Cognitohazard": "other"}},

"Jumper": {"spab": "",
 "f": {
  "Slip Gate": "As a Bonus Action, use a portal device to open two 5-foot-diameter circular portals at spots you choose within 30 feet. They are flat glowing rings filled with sight-blocking mist, floating inches above the ground and upright. Anything entering the front of one exits at the other, in the nearest unoccupied space to its front. The portals vanish after a creature passes through, after 1 minute, or when you dismiss them on your turn (no action). You can use this a number of times equal to your Intelligence modifier (minimum once) and regain all uses when you finish a Long Rest.",
  "Dimensional Pit": "As a Magic action, open a circular portal beside a Large or smaller creature you can see within 60 feet. The target makes a Dexterity save against your Gadget save DC. On a failure it is pulled into a harmless demiplane for 1 minute and the portal closes. At the end of each of its turns it repeats the save, and on a success it reappears in that space, or the nearest unoccupied space if it is taken. If the first save succeeds, the portal stays open until the end of your next turn. The portal floats inches above the ground and is upright. A creature pushed into it is sent to the demiplane as if it failed. Once you use this, you cannot use it again until you finish a Short Rest or Long Rest.",
  "Improved Slip Gate": "When you or an ally passes through one of your Slip Gate portals, you can add one of these effects. **Persistent Gate.** The portals do not vanish after the creature passes through. **Shield Gate.** The creature gains Temporary Hit Points equal to your Gadgeteer level plus your Intelligence modifier. **Tele-Frag.** Just before the creature arrives, each creature in a 5-foot Emanation from the destination portal makes a Dexterity save against your Gadget save DC, taking 4d6 Force damage on a failure or half on a success.",
  "Displacement": "When you take the Attack action, you can replace one attack with trying to teleport an enemy you can see within 60 feet. The target makes a Charisma save against your Gadget save DC. On a failure it teleports to an unoccupied space of your choice within 60 feet of you and has the Prone condition."},
 "lu": [{"feature": "Slip Gate", "n": "Slip Gate", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Dimensional Pit", "n": "Dimensional Pit", "lvl": 6, "max": 1, "reset": "short", "tag": "Magic"}],
 "acts": {"Slip Gate": "bonus", "Dimensional Pit": "action", "Displacement": "other"}},

"Mastermaker": {"spab": "",
 "f": {
  "Advanced Construct Grafts": "You improve your body with Construct grafts. **Two Grafts.** Choose two Common or Uncommon Construct grafts. Arm Cannon and Shield Module are suggested. **Quick Installation.** You can install a graft on your body as a Utilize action. **Painless Attachment.** Installing or removing grafts costs you no Hit Point Dice, and a new graft needs no recovery time.",
  "Reconfigure": "You gain a +2 bonus to your Strength, Dexterity, Charisma, or Wisdom score, to a maximum of 20. When you finish a Short Rest or Long Rest, you can change which score gets the bonus.",
  "Engineered Identity": "You gain the Android Skin and Voice Changer grafts, which do not use up External and Internal graft slots respectively. When you finish a Short Rest or Long Rest, you can change the look of the Android Skin.",
  "Expendable Parts": "When an attack roll hits you, you can use a Reaction to have one of your installed grafts take the brunt. The damage is reduced by your Gadgeteer level plus your Intelligence modifier. That graft is damaged, and you cannot use it or remove it from its slot until you repair it by finishing a Long Rest. You cannot pick Android Skin or Voice Changer for this.",
  "Construct Perfection": "You install a Construct core in your head. **Heightened Intelligence.** Your Intelligence increases by 2, to a maximum of 22. **Immunities.** You have Immunity to Poison and Psychic damage and to the Charmed, Frightened, and Poisoned conditions."},
 "acts": {"Expendable Parts": "reaction", "Advanced Construct Grafts": "other"},
 "fx": [[14, "Construct Perfection", {"imm": ["Poison", "Psychic", "Charmed", "Frightened", "Poisoned"], "notes": [["Note", "Construct Perfection: Intelligence +2, maximum 22"]]}]]},

"Quantum Mechanic": {"spab": "INT",
 "f": {
  "Temporal Relativism": "You learn the Moment to Think cantrip. Whenever you roll Initiative, you can cast Delay without a spell slot. Intelligence is your spellcasting ability for these spells.",
  "Uncertainty Principle": "When you miss with an attack roll, you can reroll it and must use the new roll. If the rerolled attack hits, the target takes damage as if you rolled a 1 on every damage die.",
  "Quantum Tunneling": "As a Bonus Action, switch on a quantum tunneling device. Until the end of your turn, you have Resistance to all damage and can move through occupied spaces as if they were Difficult Terrain. If you end your turn in such a space, you are shunted to the last unoccupied space you were in. You can use this a number of times equal to your Intelligence modifier (minimum once) and regain all uses when you finish a Long Rest.",
  "Schrödinger's Defense": "When you take damage, you can use a Reaction to trigger a Feline Waveform Collapser and roll a d20. On a 10 or higher you take no damage. Once you use this feature, you cannot use it again until you finish a Short Rest or Long Rest. If you roll a 9 or lower, this use is not expended.",
  "Entanglement": "As a Magic action, try to entangle yourself with a creature you can see within 30 feet. It makes a Charisma save against your Gadget save DC. On a failure it is linked to you for 1 minute. While linked, you have Resistance to all damage, and each time you take damage the linked creature takes the same amount. The link ends early if you have the Incapacitated condition, if the creature dies, if it is ever more than 30 feet from you, or if you dismiss it (no action). Once you use this, you cannot use it again until you finish a Short Rest or Long Rest."},
 "lu": [{"feature": "Quantum Tunneling", "n": "Quantum Tunneling", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Schrödinger's Defense", "n": "Schrödinger's Defense", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"},
        {"feature": "Entanglement", "n": "Entanglement", "lvl": 14, "max": 1, "reset": "short", "tag": "Magic"}],
 "acts": {"Quantum Tunneling": "bonus", "Schrödinger's Defense": "reaction", "Entanglement": "action"}},
}
