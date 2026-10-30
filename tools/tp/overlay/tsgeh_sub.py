"""Jaeger Chapters, Steinhardt's Guide to the Eldritch Hunt 2024. Own wording."""
SUB = {
"Absolute Chapter": {"spab": "",
 "f": {
  "Counter Strike": "When Weapon Parry reduces the damage to 0, you can make one weapon attack against the attacker if it is within Reach or range of a weapon you wield. If your Parry left the target Stunned, a hit with this attack is a Critical Hit. Whenever you spend an Adrenaline Point on an Adrenaline Art, you have Advantage on your next weapon attack roll before the end of your next turn.",
  "Unencumbered Movement": "While you wear Light armor or no armor and carry no Shield, your Speed increases by 10 feet, Opportunity Attacks against you have Disadvantage, and Dodge Step lets you move 5 feet farther.",
  "Encircling Strike": "Once per turn, you deal extra damage equal to one roll of your Momentum die the first time you hit a target with a melee weapon attack, and you gain 1 Momentum die. This works if you moved to the opposite side of a creature from where your turn began, or if you stand directly opposite an ally across that creature.",
  "Mobile Pursuer": "When you move with Hunter's Pursuit, Dodge Step, or Jaeger's Rush, you ignore Difficult Terrain, can move through hostile creatures, and spend no extra movement to climb or swim.",
  "The Hunt": "You can declare a hunt as a free action. For 1 minute you gain Freedom of Movement, you gain 2 Momentum dice instead of 1 each time you spend an Adrenaline Point, and you regain 1 Adrenaline Point if you start your turn with none. It ends early if you become Incapacitated. You can use it once per Long Rest, or restore the use by spending 4 Adrenaline Points (no action).",
 },
 "lu": [{"feature": "The Hunt", "n": "The Hunt", "lvl": 17, "max": 1, "reset": "long", "tag": "Free"}],
 "acts": {"The Hunt": "free"},
 "fx": [[3, "Unencumbered Movement", {"notes": [["Note", "Unencumbered Movement: +10 ft Speed in Light or no armor without a Shield. Opportunity Attacks against you have Disadvantage"]]}]]},

"Heretic Chapter": {"spab": "INT",
 "f": {
  "Occult Arts": "You learn one Eldritch Invocation from the Warlock list. Where it refers to Charisma, use Intelligence. You learn another at levels 7, 14, and 17. For invocation prerequisites you count as a level 2 Warlock from Jaeger level 7 and a level 5 Warlock from level 14. When you gain a Jaeger level, you can swap one invocation for another you qualify for. **Spell Flurry.** You also learn the Spell Flurry Adrenaline Art. It does not count against your Arts known.",
  "Heretic Magic": "You cast Warlock spells with Intelligence. **Cantrips.** Learn two Warlock cantrips, and a third at level 10. **Spell slots.** Slots follow the Heretic Spellcasting table and are all the same level. That level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. You have 1 slot at levels 3 and 4 and 2 slots from level 5. Short and Long Rests restore them. **Prepared spells.** Prepare Warlock spells of levels you have slots for: 2 at level 3, 3 at level 6, 4 at level 9, 5 at level 12, 6 at level 15, and 7 at level 18. Whenever you gain a Jaeger level, you can swap one prepared spell. You can use an Arcane Focus as your Spellcasting Focus.",
  "Shrouded Steps": "When a Jaeger feature lets you move without spending your movement, such as Jaeger's Rush or the Chasing Finisher, you can teleport that distance instead. If you do this with Dodge Step, you automatically succeed on its save.",
  "Mystical Momentum": "When you expend a spell slot, you gain Momentum dice equal to the slot's level.",
  "Darkness Within": "As a Bonus Action, you unleash the powers bound in your soul for 1 minute. A 10-foot Emanation around you dims, so Bright Light becomes Dim Light and Dim Light becomes Darkness. You are Heavily Obscured, gain a Fly Speed of 30 feet, and have Resistance to Bludgeoning, Piercing, and Slashing damage. Radiant damage removes that Resistance until the start of your next turn. It ends early if you become Incapacitated or choose to end it as a Bonus Action. You can use it once per Long Rest.",
 },
 "lu": [{"feature": "Darkness Within", "n": "Darkness Within", "lvl": 17, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Darkness Within": "bonus"},
 "fx": [],
 "grant": {}},

"Marauder Chapter": {"spab": "",
 "f": {
  "Marauder Momentum": "While you wield a melee weapon with the 2H property, your Momentum die goes up one size: d8 at the start, d10 from level 11, and d12 from level 17.",
  "Path of Gore": "You learn the Great Cleave Finisher. It does not count against your Finishers known.",
  "Unbreakable": "Your Hit Points maximum increases by 3, and by 1 more for each Jaeger level you gain after this. While you wear Medium armor, you can add your Constitution modifier (maximum +2) to your AC instead of your Dexterity modifier.",
  "Leap Attack": "Once per turn, if you move more than 15 feet toward a creature, or fall 10 feet or more, right before a weapon attack against it, a hit deals extra damage equal to your Momentum die. When falling you can make the attack before landing if a target is in range. On a hit, you take half the falling damage and do not land Prone.",
  "Fell the Leviathan": "Each time you use a Finisher, the target must succeed on a Strength save (DC 8 + your Strength modifier + your Proficiency Bonus) or be knocked Prone. Large or larger creatures have Disadvantage on the save.",
  "Titanic Strength": "You can wield a 2H weapon in one hand and use Two-Weapon Fighting with weapons that lack the Light property, including 2H weapons. When you use two hands on a 2H weapon, hits with it deal extra damage equal to half your Strength modifier, rounded up. When you use a Finisher, you can double your Momentum dice, to no more than your maximum plus 1. You can do this once per Long Rest.",
 },
 "lu": [{"feature": "Titanic Strength", "n": "Titanic Strength (double dice)", "lvl": 17, "max": 1, "reset": "long", "tag": "Finisher"}],
 "acts": {},
 "fx": [[3, "Unbreakable", {"notes": [["Note", "Unbreakable: Hit Point maximum +3, then +1 per Jaeger level after 3. In Medium armor, add Constitution modifier (max +2) to AC instead of Dexterity"]]}]]},

"Salvation Chapter": {"spab": "",
 "f": {
  "Art of Salvation": "You learn the Prayer of Salvation Adrenaline Art. It does not count against your Arts known.",
  "Savior's Focus": "When an ally you can see or hear drops to 0 Hit Points, you regain 1 Adrenaline Point. After you use this, you cannot use it again for 1 minute.",
  "Sanctifying Light": "When you spend an Adrenaline Point, you can shed divine light until the end of your next turn. A 20-foot Emanation around you is Bright Light, with Dim Light for 20 feet beyond it. It counts as Sunlight. An ally who enters the Bright Light for the first time on a turn, or starts a turn there, regains Hit Points equal to 1d6 plus your Proficiency Bonus. The light goes out early if you become Incapacitated.",
  "Purifying Salvation": "Prayer of Salvation can target one more creature, and its healing and Temporary Hit Points become 1d12. You can also end the Charmed, Frightened, or Poisoned condition, or a Short-Term Madness, on any of the targets.",
  "Light of Hope": "As a Bonus Action, you release a blinding inner light for 1 minute. The Emanation of Sanctifying Light grows to 30 feet of Bright Light plus 30 feet of Dim Light. Creatures of your choice in the Bright Light, you included, are under the effect of Bless. Creatures in the Bright Light have Advantage on Death Saving Throws, do not die at three failed saves, and become stable at three successes even if they have three or more failures. A creature that leaves the light while unstable dies if it has three or more failed saves. When you use Prayer of Salvation, you regain the Adrenaline Point you spent. It ends early if you become Incapacitated or choose to end it as a Bonus Action. You can use it once per Long Rest.",
 },
 "lu": [{"feature": "Light of Hope", "n": "Light of Hope", "lvl": 17, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Light of Hope": "bonus"},
 "fx": []},

"Sanguine Chapter": {"spab": "",
 "f": {
  "Crimson Rage": "When you become Bloodied, you regain 1 Adrenaline Point and gain 1 Momentum die. You cannot benefit from this again for 1 minute.",
  "Vital Consumption": "You draw power from the blood of your foes. You learn the Blood Drain Finisher, which does not count against your Finishers known. Your Blood Magic save DC is 8 + your Proficiency Bonus + your Intelligence or Constitution modifier (your choice).",
  "Blood Hex": "When you use a Finisher against a Bloodied target, you can force one target it hit to make a Constitution save against your Blood Magic DC and pick one effect. **Blood Puppet.** The target uses its Reaction to move up to 5 feet in a direction you choose. Without a Reaction it cannot move. **Bound Blood.** Its Speed is halved until the start of your next turn. **Burning Blood.** It takes Fire damage equal to half the Necrotic damage dealt. With Blood Drain you can apply one of these even if the target is not Bloodied, and it uses the Finisher's save instead of a separate one.",
  "Empowered Blood Hex": "You gain stronger versions of the Blood Hex effects. Each costs 2 Adrenaline Points. **Blood Puppet (Empowered).** The target uses its Reaction to move up to 10 feet and make one weapon attack against a creature you choose. Without a Reaction it cannot move. **Bound Blood (Empowered).** The target is Restrained until the start of your next turn. **Burning Blood (Empowered).** At the start of each of its turns the target takes Fire damage equal to the Necrotic damage dealt. It repeats its Blood Drain save at the end of each of its turns, ending the effect on a success.",
  "Blood Frenzy": "While Bloodied, your Speed increases by 20 feet, the Attack action gives you three attacks, and all Hit Points you regain from Jaeger abilities are doubled. If an ability would end your Bloodied condition, its effects last until the end of your turn. You can also use the Blood Craze Adrenaline Art.",
 },
 "lu": [],
 "acts": {},
 "fx": []},
}
