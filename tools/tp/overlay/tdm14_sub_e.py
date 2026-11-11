# Own-wording subclasses of Dark Matter, 2014 rules, batch E.
_RV = "These archetypes build on the SRD Ranger. If you use one with another ranger version that lacks it, add the Extra Attack feature at level 5."
SUB = {
"Oath of the Sepulcher": {"spab": "Charisma",
 "f": {
  "Channel Divinity": "Oath spells, always prepared. Level 3: detect evil and good, worldseek. Level 5: hold person, zone of truth. Level 9: glyph of warding, tongues. Level 13: banishment, locate creature. Level 17: hold monster, scrying. Tenets: Balance light and dark: law preserves the balance between them. Maintain peace in the universe: seek fair solutions to conflict. Protect the universe: lawbreakers and interlopers at the Solar Citadel and maw stations must not go unpunished. Channel Divinity options:  Gamma Blade: wreathe a melee weapon you hold in arcane energy for 1 minute. It deals Force or Radiant damage (your choice), gains a damage bonus equal to your Proficiency Bonus, and is magical if it was not. It sheds bright blue light in 20 ft and dim light 20 ft further. When you attack with it you can instead swing it to project a ranged spell attack (30/120 ft) dealing 2d8 + Charisma modifier Force damage. It ends if the weapon leaves your hand, you fall unconscious, or you end it on your turn. Longarm: as a bonus action, for 1 minute you can use Divine Smite on ranged weapon hits too, and your ranged weapon attacks ignore half and three-quarters cover and count as magical against resistance and immunity.",
  "Aura of Atmosphere": "You and friendly creatures within 10 ft are under the effect of zone of atmosphere. In zero gravity you have a flight speed equal to your speed, and when you move each friendly creature in the aura can use its reaction to move with you. At level 18 the aura grows to 30 ft.",
  "Universal Shift": "You can cast plane shift on yourself only, with no slot or components, or teleport to the nearest Maw station and appear on its surface. Long Rest to use again.",
  "Galactic Knight": "As an action, choose one. Solar Knight: for 1 hour you gain a 60 ft flying speed and the benefits of Gamma Blade, and when you or an ally within 30 ft takes Bludgeoning, Piercing or Slashing damage you can use your reaction to halve it. Galactic Knight: used in open space outside an atmosphere or gravity field, for 1 minute you grow to 100 times your size inside a cosmic energy field, gain a 6,000 ft flying speed, your attacks deal mega damage and your hit points become mega hit points. Long Rest after either option."},
 "acts": {"Channel Divinity": "action", "Galactic Knight": "action"},
 "lu": [{"feature": "Universal Shift", "lvl": 15, "max": 1, "reset": "long", "tag": "Plane shift self or teleport to a Maw station"},
        {"feature": "Galactic Knight", "lvl": 20, "max": 1, "reset": "long", "tag": "Solar Knight or Galactic Knight"}]},

"Deadeye Sniper": {"spab": "Wisdom",
 "f": {
  "Ranger Variants": _RV,
  "No-Scope": "You ignore the Sighted property of weapons you wield.",
  "One Shot, One Kill": "Once per turn when you hit with a weapon attack, you deal extra 1d8 damage if you have not moved since the start of your last turn.",
  "Concealed Position": "You can build a sniper nest in 10 minutes, a 10-ft square. Inside you have three-quarters cover and see out freely. No creature or sensor over 30 ft away can see you or the nest, even when you attack from it, though you can still be heard and found by divination that passes more than an inch of solid material. A creature within 10 ft can find the nest with an Intelligence (Investigation) check against your spell save DC. Once you leave a nest you cannot use it again.",
  "Overwatch": "While you wield a ranged weapon and a hostile creature you see moves into or within its normal range, you can use your reaction to make an opportunity attack against it with that weapon.",
  "Disappear": "When you take damage, use your reaction to move up to 5 ft without provoking opportunity attacks and turn Invisible until the start of your next turn. You can do this a number of times equal to your Wisdom modifier (minimum 1), regained on a Long Rest."},
 "acts": {"Overwatch": "reaction", "Disappear": "reaction"},
 "lu": [{"feature": "Disappear", "lvl": 15, "max": "mod:WIS", "reset": "long", "tag": "Reaction: move 5 ft, Invisible"}]},

"Reconnaissance Scout": {"spab": "Wisdom",
 "f": {
  "Ranger Variants": _RV,
  "Bonus Proficiencies": "You gain proficiency in the Piloting skill.",
  "Recon Drone": "You gain a tem drone controller linked to a recon drone. As an action, send the drone to its maximum altitude on lookout. You have Advantage on initiative rolls against threats it detects. It stays on lookout until you command it back.",
  "Dodge Roll": "As a bonus action, move up to 15 ft. This movement does not provoke opportunity attacks, ignores difficult terrain, and can pass through hostile creatures' spaces if you do not end there. You can do this a number of times equal to your Dexterity modifier, regained on a Long Rest.",
  "Piercing Blast": "As an action, fire a 5-ft-wide blast in a line out to your blaster's normal range. Each creature in the line makes a Dexterity save (DC 8 + Proficiency Bonus + Dexterity modifier) and takes the blaster's damage on a failure, or half on a success.",
  "Energetic Body Armor": "Your shielding gives you Resistance to one of Cold, Fire, Lightning, Necrotic or Radiant damage. You can change it as a bonus action."},
 "acts": {"Recon Drone": "action", "Dodge Roll": "bonus", "Piercing Blast": "action", "Energetic Body Armor": "bonus"},
 "lu": [{"feature": "Dodge Roll", "lvl": 7, "max": "mod:DEX", "reset": "long", "tag": "Bonus action: move 15 ft freely"}],
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Piloting"]}]]},
}
