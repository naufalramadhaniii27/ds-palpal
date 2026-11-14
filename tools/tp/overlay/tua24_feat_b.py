"""Unearthed Arcana 2025 Psion feats, Wild Talent (2024 rules). Own wording."""
_N = " You can take only one Wild Talent feat."
_C = "\n**Psionic Talent.** Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you take the feat). They need no Verbal or Material components. You can cast each once without a slot and regain that use after a Long Rest. You can also cast them with spell slots."
_C3 = " At character level 3 you also always have %s prepared and cast it the same way."
FEATS = {
 "Atmokinesis": {"d": "Change damage to Lightning. Shocking Grasp, Fog Cloud, Gust of Wind.", "cat": "G",
   "full": "**Lightning Jolt.** Once per turn, when you cast a spell or hit with an attack roll and deal Bludgeoning, Piercing, Slashing, or Psychic damage, you can change the damage type to Lightning." + "\n**Psionic Talent.** You know the Shocking Grasp cantrip. You always have Fog Cloud prepared." + (_C3 % "Gust of Wind") + _C[len("\n**Psionic Talent.**"):] + _N},
 "Biokinesis": {"d": "Add 1d4 to healing a spell restores. Spare the Dying, Healing Word, Arcane Vigor.", "cat": "G",
   "full": "**Bend Life Energy.** When a spell you cast restores Hit Points to a creature, you can roll 1d4 and add it to the Hit Points restored. You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You know the Spare the Dying cantrip. You always have Healing Word prepared." + (_C3 % "Arcane Vigor") + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Bend Life Energy", "max": "pb", "reset": "long", "tag": "Add 1d4 to spell healing"}},
 "Clairsentience": {"d": "Advantage on Search checks. Guidance, Detect Evil and Good, See Invisibility.", "cat": "G",
   "full": "**Minor Foreknowledge.** When you take the Search action, you can give yourself Advantage on any ability check made as part of it. You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You know the Guidance cantrip. You always have Detect Evil and Good prepared." + (_C3 % "See Invisibility") + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Minor Foreknowledge", "max": "pb", "reset": "long", "tag": "Advantage on a Search check"}},
 "Cryokinesis": {"d": "Change damage to Cold. Ray of Frost, Armor of Agathys, Ice Knife.", "cat": "G",
   "full": "**Ice Manipulation.** Once per turn, when you cast a spell or hit with an attack roll and deal Bludgeoning, Piercing, Slashing, or Psychic damage, you can change the damage type to Cold.\n**Psionic Talent.** You know the Ray of Frost cantrip. You always have Armor of Agathys and Ice Knife prepared." + _C[len("\n**Psionic Talent.**"):] + _N},
 "Empath": {"d": "Advantage on Influence checks. Charm Person and Calm Emotions.", "cat": "G",
   "full": "**Emotional Sense.** When you take the Influence action, you can give yourself Advantage on any ability check made as part of it. You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You always have Charm Person prepared. It needs no Verbal component." + (_C3 % "Calm Emotions") + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Emotional Sense", "max": "pb", "reset": "long", "tag": "Advantage on an Influence check"}},
 "Flesh Morpher": {"d": "Add Intelligence to Acrobatics and Sleight of Hand. Longstrider and Alter Self.", "cat": "G",
   "full": "**Flexible Flesh.** When you make a Dexterity (Acrobatics or Sleight of Hand) check, you gain a bonus equal to your Intelligence modifier (minimum +1). You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You always have Longstrider prepared." + (_C3 % "Alter Self") + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Flexible Flesh", "max": "pb", "reset": "long", "tag": "Add Intelligence to a check"}},
 "Mind Whisperer": {"d": "Telepathic link at 120 ft. Mind Sliver and Dissonant Whispers.", "cat": "G",
   "full": "**Limited Telepathy.** As a Magic action, pick a creature you can see within 120 feet. You form a telepathic link for 1 hour, so you and that creature can talk mentally while within 120 feet of each other. Each of you must mentally use a language the other knows. After you use this you cannot do so again until you finish a Short or Long Rest.\n**Psionic Talent.** You know the Mind Sliver cantrip. You always have Dissonant Whispers prepared." + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Limited Telepathy", "max": 1, "reset": "short", "tag": "Magic action, 1 hour link"}, "act": "action"},
 "Psi Trickster": {"d": "Add Intelligence to Deception and Persuasion. Minor Illusion and Disguise Self.", "cat": "G",
   "full": "**Cunning Mind.** When you make a Charisma (Deception or Persuasion) check, you gain a bonus equal to your Intelligence modifier (minimum +1). You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You know the Minor Illusion cantrip. You always have Disguise Self prepared." + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Cunning Mind", "max": "pb", "reset": "long", "tag": "Add Intelligence to a check"}},
 "Psykineticist": {"d": "Speed boost on Dash. Telekinetic Fling and Thunderwave.", "cat": "G",
   "full": "**Psi Boost.** When you take the Dash action, you can raise your Speed by 10 feet until the start of your next turn. You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest.\n**Psionic Talent.** You know the Telekinetic Fling cantrip. You always have Thunderwave prepared. Your spells from this feat need no Verbal component." + _C[len("\n**Psionic Talent.**"):] + _N,
   "lu": {"n": "Psi Boost", "max": "pb", "reset": "long", "tag": "+10 ft Speed on Dash"}},
 "Pyrokinesis": {"d": "Change damage to Fire. Produce Flame, Burning Hands, Scorching Ray.", "cat": "G",
   "full": "**Firestarter.** Once per turn, when you cast a spell or hit with an attack roll and deal Bludgeoning, Piercing, Slashing, or Psychic damage, you can change the damage type to Fire.\n**Psionic Talent.** You know the Produce Flame cantrip. You always have Burning Hands prepared." + (_C3 % "Scorching Ray") + _C[len("\n**Psionic Talent.**"):] + _N},
}
