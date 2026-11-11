# Own-wording Bard colleges of Valda's Spire of Secrets, 2014 rules.
_MASKS = [
 ["Angel", "When you hit with a melee weapon attack, spend a Bardic Inspiration use to deal extra Radiant damage equal to one roll of your Bardic Inspiration die plus your Charisma modifier."],
 ["Archmage", "You know Fire Bolt and always have these spells while you wear it: level 3 Gust of Wind, Scorching Ray. Level 5 Lightning Bolt, Protection from Energy. Level 7 Dimension Door, Ice Storm. Level 9 Scrying, Wall of Stone. They count as bard spells and do not count against spells known."],
 ["Devil", "When a creature you see within 5 ft damages you, use your Reaction and a Bardic Inspiration use to deal Fire damage to it equal to two rolls of your Bardic Inspiration die."],
 ["Dragon", "As an action, spend a Bardic Inspiration use to exhale a 15-ft cone. Each creature makes a Dexterity save against your spell save DC, taking Fire damage equal to three rolls of your Bardic Inspiration die on a failure or half on a success."],
 ["Faceless", "You can cast disguise self with no slot or material components."],
 ["Fool", "Your walking Speed rises by 10 ft and you can Disengage as a bonus action. From level 6 you can also Dash as a bonus action."],
 ["Gladiator", "You are proficient with martial weapons and shields. From level 6 you add your Charisma modifier to melee weapon damage rolls."],
 ["High Priest", "You know Sacred Flame and always have these spells while you wear it: level 3 Aid, Lesser Restoration. Level 5 Mass Healing Word, Tongues. Level 7 Banishment, Death Ward. Level 9 Greater Restoration, Mass Cure Wounds. They count as bard spells and do not count against spells known."],
 ["Lord", "When a creature rolls a 1 on one of your Bardic Inspiration dice, it can reroll and must use the new roll. From level 6 this also applies to a 2."],
 ["Spirit", "You become invisible if you do not speak, move or act for 1 minute. It lasts up to 10 minutes or until you remove the mask, take damage, attack or cast a spell. While invisible, a bonus action lets you appear as a ghostly half-image or turn invisible again. From level 6 you hover an inch above the ground while invisible, ignoring Difficult Terrain and moving silently."],
]
def _pk(l, n, key, title): return {"l": l, "k": "opts", "n": n, "key": key, "feature": "Persona Masks", "title": title, "list": _MASKS}
SUB = {
"College of Cantors": {"spab": "Charisma",
 "f": {
  "Healing Hymn": "When you cast a spell of level 1 or higher that restores hit points, you can spend a Bardic Inspiration use to bolster it. Each creature that regains hit points adds one roll of your Bardic Inspiration die plus half your bard level to the amount.",
  "Heavenly Voice": "You learn the thaumaturgy cantrip. It counts as a bard spell and does not count against cantrips known.",
  "Angelic Chorus": "Thaumaturgy gains two extra effects. First, as part of the casting action you can use the Help action on two allies. When you help an ally attack, the target can be within 30 ft of you instead of 5 ft if it can see or hear you. Second, you ward a willing creature you see within 30 ft with golden light for up to 1 minute, one creature at a time. When an attacker within 5 ft hits the warded creature, it can use its reaction to deal Radiant damage to the attacker equal to half your bard level.",
  "Song of The Divines": "You can use Healing Hymn without spending Bardic Inspiration uses."}},

"College of Graffiti": {"spab": "Charisma",
 "f": {
  "Bonus Proficiencies": "You gain proficiency with painter's supplies and with Stealth or Sleight of Hand (your choice).",
  "Street Art": "You learn the tag cantrip. It counts as a bard cantrip and does not count against cantrips known. When you cast tag you can spend a Bardic Inspiration use to spray a mural. For 1 minute you and friendly creatures within 30 ft of the mural that can see it gain +1 to ability checks, attack rolls and saving throws. Spend more uses to expand it, +1 each time, up to +3.",
  "Signature Mark": "As a bonus action, make a melee spell attack against a creature you see within 5 ft to paint a target on it. While it is marked, once per turn when you hit it with a melee weapon attack you add 1d8 to the damage. When a friendly creature attacks it, you can use your reaction to give that attack Advantage. A creature can wash itself with soap or remove its armor or outer clothing as an action to remove the mark.",
  "Kaleidoscopic Spray": "As an action, throw magical paint in a 15-ft cone. Each creature you choose makes a Dexterity save against your spell save DC or is Blinded until the end of its next turn. Every creature in the cone is marked, whether or not it saves. Short or Long Rest to use again."},
 "lu": [{"feature": "Kaleidoscopic Spray", "lvl": 14, "max": 1, "reset": "short", "tag": "Action. 15-ft cone"}],
 "acts": {"Signature Mark": "bonus", "Kaleidoscopic Spray": "action"}},

"College of Jesters": {"spab": "Charisma",
 "f": {
  "Advanced Tumbling": "You can move through any creature's space with acrobatic flips. After you do, that creature has Disadvantage on opportunity attacks against you until the end of your turn.",
  "Raconteur": "You learn vicious mockery if you do not know it. When a creature fails its save against it, you can spend a Bardic Inspiration use to add one roll of your Bardic Inspiration die plus your Charisma modifier to the damage. If it fails by 5 or more, it also has Disadvantage on the first save it makes before the start of your next turn.",
  "Juggling": "As a bonus action, start juggling thrown weapons, up to twice your Proficiency Bonus. Once per turn, when you take the Attack action to throw a weapon, move out of a creature's reach, or cast vicious mockery, you can make one ranged weapon attack with a juggled weapon against a creature you see.",
  "Grand Finale": "When you use this, you take one extra action on top of your action and any bonus action. You cannot use it on the first round of combat. After using it you cannot take actions or bonus actions on your next turn."},
 "acts": {"Juggling": "bonus"}},

"College of Masks": {"spab": "Charisma",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in Performance.",
  "Masks": "Each mask is a magical archetype. Angel: extra Radiant on melee hits. Archmage: Fire Bolt and spells from a table. Devil: Fire retaliation. Dragon: fire breath. Faceless: disguise self. Fool: faster, bonus Disengage. Gladiator: martial and shield proficiency. High Priest: Sacred Flame and cleric spells. Lord: rerolls Bardic Inspiration 1s. Spirit: invisibility. Their rules are listed under Persona Masks.",
  "Persona Masks": "You craft magical masks, each giving a persona. You have two masks of your choice, three at level 6 and four at level 14. You can swap a mask for another whenever you gain a level in this class. A lost mask can be remade with 8 hours of work and 100 gp of materials. Putting on or switching a mask takes a bonus action, and only you gain its effects. At level 6 some masks improve (noted in each mask).",
  "Hidden Persona": "As a bonus action, you can make a mask you wear invisible or visible again.",
  "Master of Many Faces": "You can wear two masks at once and gain both benefits."},
 "pick": [_pk(3, 2, "m14k3", "Persona masks (2)"), _pk(6, 1, "m14k6", "Persona mask (3rd)"), _pk(14, 1, "m14k14", "Persona mask (4th)")],
 "acts": {"Hidden Persona": "bonus"}},

"College of Romance": {"spab": "Charisma",
 "f": {
  "Cupid's Arrow": "As an action, spend a Bardic Inspiration use and pick a creature you see within 30 ft that can see or hear you. It makes a Wisdom save or is Charmed by you for a number of rounds equal to the die roll. It ends early if you move more than 30 ft from it, it can neither see nor hear you, it takes damage from you or your allies, or you use this again.",
  "Likeable": "As a bonus action, distract a hostile creature you have Charmed. On its turn it has Disadvantage on attack rolls and cannot move farther from you unless it first takes the Disengage action. A creature you charm that is not hostile sees you and your allies as friendly acquaintances.",
  "Enemy of My Enemy": "When you take the Attack action, use your bonus action to order a creature you have Charmed that sees or hears you to attack. It uses its reaction to make one weapon attack against a target you choose.",
  "Infatuate": "As an action, touch an incapacitated humanoid. It is Charmed by you until remove curse is cast on it, the condition is removed, or you use this again."},
 "acts": {"Cupid's Arrow": "action", "Likeable": "bonus", "Enemy of My Enemy": "bonus"}},

"College of the Mad God": {"spab": "Charisma",
 "f": {
  "Bonus Proficiencies": "You gain proficiency in one skill that the GM picks. The GM can change it after each Long Rest.",
  "Cacophony": "Once per turn, when a creature fails an Intelligence, Wisdom or Charisma save against one of your bard spells or features while you hold an instrument, you can spend a Bardic Inspiration use to play a cacophony. A Deafened creature is immune. Pick one: it takes Psychic damage equal to one roll of your Bardic Inspiration die; or it is Deafened and cannot speak until the end of its next turn; or it moves up to 10 ft in a direction you choose without provoking opportunity attacks.",
  "Frenzied Strings": "As an action, play a mind-infecting tune for a creature within 60 ft that can hear you. It makes a Wisdom save or is frenzied for up to 1 minute, repeating the save whenever it takes damage. A frenzied creature cannot tell friend from foe and treats all creatures it sees as enemies. It picks targets for attacks, spells and abilities at random among creatures it sees in range, and must make an opportunity attack if one is provoked. Short or Long Rest to use again.",
  "Mad Melody": "As an action, start playing the accursed melody, and continue it with your action on later turns. Only creatures you choose within 60 ft hear it as music. Others hear noise, and Deafened creatures still hear it. When you play it, each creature that hears it makes a Wisdom save against your spell save DC. On a failure it takes Psychic damage and an extra effect by consecutive round: round 1, 4d8 and Deafened. Round 2, 7d8, cannot speak and Disadvantage on ability checks. Round 3, 4d8 and Charmed by you until the end of its turn. Round 4, 7d8. After round 4, or if no creature hears it for a round, it starts over."},
 "lu": [{"feature": "Frenzied Strings", "lvl": 6, "max": 1, "reset": "short", "tag": "Action. Wisdom save"}],
 "acts": {"Frenzied Strings": "action", "Mad Melody": "action"}},
}
