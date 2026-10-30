# Own-wording spells of Tal'Dorei Campaign Setting Reborn. Row: [name, level, school, classes, cast, range, components, duration, conc, ritual, save, summary].
# The generator adds the book tag and the class list as the last two entries, like wotc01.
ROWS = [
 ["Freedom of the Waves", 3, "Conjuration", ["Druid", "Ranger", "Sorcerer"], "Action", "120 ft", "V, S, M", "Instantaneous", 0, 0, "STR",
  "A 15-ft-radius, 10-ft-tall deluge of seawater. Str save, 2d8 Bludgeoning and Prone. You can teleport out of the area if you stand in it."],
 ["Freedom of the Winds", 5, "Abjuration", ["Druid", "Ranger", "Sorcerer"], "Action", "Self", "V, S, M", "Up to 10 minutes", 1, 0, "",
  "Gain a Fly Speed of 60 ft and an adjusted roll against grapple, restrain and paralysis (garbled in the source, see the book). Reaction: teleport up to 60 ft when targeted."],
]
FULL = {
 "Freedom of the Waves": "You conjure a deluge of seawater in a Cylinder (15-foot radius, 10 feet tall) centered on a point within range. The water can be a tidal wave, a whirlpool, a waterspout or another shape. Each creature in the area makes a Strength saving throw against your spell save DC. On a failure it takes 2d8 Bludgeoning damage and has the Prone condition. You choose a number of creatures up to your spellcasting modifier (minimum 1) that succeed automatically.\n\nIf you are inside the area, as part of the casting action you can vanish into the water and teleport to an unoccupied space you can see inside the area.\n\n**Material.** A strand of wet hair.",
 "Freedom of the Winds": "Wind wraps around you and lifts you off the ground. For the duration you have a Fly Speed of 60 feet. You also get an adjusted roll (garbled in the source, see the book) on ability checks to avoid the Grappled condition and on saving throws against the Restrained and Paralyzed conditions.\n\nWhen a spell or attack targets you during the duration, you can use your reaction to teleport up to 60 feet to an unoccupied space you can see. If that takes you out of the range of the triggering spell or attack, it does not affect you. The spell then ends when you reappear.\n\n**Material.** A scrap of sailcloth.",
}
