# Own-wording Witch's Crafts, Valda's Spire of Secrets 2014 rules. Craft spells come from the source additionalSpells.
def _u(f, lvl, mx, rs, tag, n=None):
    r = {"feature": f, "lvl": lvl, "max": mx, "reset": rs, "tag": tag}
    if n: r["n"] = n
    return r
SUB = {
"Black Magic": {"spab": "",
 "f": {
  "Black Magic": "Hexes of pain and spells of undeath. Craft spells. 1st: Exhume, Inflict Wounds. 2nd: Gentle Repose, Magic Weapon. 3rd: Animate Dead, Vampiric Touch. 4th: Blight, Death Ward. 5th: Cloudkill, Contagion.",
  "Hex: Decay": "Action. A creature you see within 60 feet makes a Constitution save. On a failure it takes 1d4 necrotic damage at the start of its next turn, and its hit point maximum drops by the damage taken until the hex ends. It dies if its maximum reaches 0. The hex ends at the end of your next turn.",
  "Undeath Command": "When you use your bonus action to command your familiar, the same bonus action can command any undead you control through Animate Dead or similar magic.",
  "Life Tether": "As a reaction when a creature you see damages you, move part of the damage to a creature that is the sole target of your hex. You take half (rounded down) and the hexed creature takes the rest. Short or Long Rest to use it again.",
  "Black Sacrifice": "Action, with your familiar within 10 feet. Order it to break its bond to this plane in a burst of necromantic energy. Each creature you pick within 20 feet of it makes a Dexterity save against your spell save DC. It takes 8d10 necrotic damage on a failure or half on a success, and its hit point maximum drops by the damage taken. A target dies if its maximum reaches 0. You cannot summon your familiar again until you finish a Long Rest.",
 },
 "lu": [_u("Life Tether", 10, 1, "short", "Reaction"), _u("Black Sacrifice", 14, 1, "long", "Action. 8d10 necrotic")],
 "acts": {"Hex: Decay": "action", "Life Tether": "reaction", "Black Sacrifice": "action"}, "fx": []},

"Blood Magic": {"spab": "",
 "f": {
  "Blood Magic": "Dark spells and deadly hexes fed by your own blood. Craft spells. 1st: Hollowing Curse, Hellish Rebuke. 2nd: Melf's Acid Arrow, Hold Person. 3rd: Ruby-Eye Curse, Vampiric Touch. 4th: Blight, Dominate Beast. 5th: Cloudkill, Dominate Person.",
  "Hex: Blood Curse": "Action. A creature you see within 60 feet makes a Constitution save. On a failure it hovers at the brink of death until the end of your next turn. If during that time it is missing any hit points and has fewer than twice your witch level, it drops to 0 hit points at once.",
  "Novice Hemomancy": "When you cast a spell whose material components have no listed cost, you can replace them with a drop of blood.",
  "Arcane Bloodletting": "When you cast a spell with a casting time of 1 action, you can lose 5 hit points to make that casting a bonus action. You can do this a number of times equal to your Charisma modifier (minimum 1), regained on a Long Rest.",
  "Deathseeker": "You sense creatures within 60 feet that are missing any hit points, even through heavy obscurement. 1 foot of stone, 1 inch of common metal, a thin sheet of lead or 3 feet of wood or dirt blocks this. You have Advantage on checks to track a creature you or your familiar harmed in the last 24 hours.",
  "Hemomantic Recovery": "Once a day when you finish a short rest, spend Hit Dice to recover spell slots. 1st level costs 2 Hit Dice, 2nd costs 3, 3rd costs 5, 4th costs 6, 5th costs 7. You cannot recover slots of 6th level or higher.",
  "Sanguine": "Once per round, when you cast a damaging spell on a creature under your hex, you can lose hit points to add damage. For every 5 hit points lost, add 2d8 necrotic damage, up to 6d8. This works only on a hostile creature that is the sole target of your hex.",
 },
 "lu": [_u("Arcane Bloodletting", 3, "mod:CHA", "long", "Lose 5 HP. Cast as bonus action"), _u("Hemomantic Recovery", 10, 1, "long", "Once per day, on a short rest")],
 "acts": {"Hex: Blood Curse": "action"}, "fx": []},

"Blue Magic": {"spab": "",
 "f": {
  "Blue Magic": "You learn spells only by experiencing them. From level 3 you no longer gain spells by leveling (you keep those known). When a spell is cast on you, or you are in its area or targeted by it and feel any of its effect, you can use your reaction to learn it. You do not learn it if you make a save, succeed and it has no effect on you. The Cantrips Known and Spells Known columns show your maximum. Your spells of 1st level or higher cap rises by 4 at level 3 (8 known), then by 2 at levels 5, 7 and 9 (12, 16, 20). They need not be on the witch list. You can use an action to forget a spell.",
  "Hex: Arcane Awareness": "Action. Cast Detect Magic with no slot, lasting until the end of your next turn. While it is active you can use an action or bonus action to learn whether a creature you see within 60 feet has Spellcasting, Innate Spellcasting or any ability that lets it cast spells.",
  "Turquoise Efficiency": "You have Advantage on saves against spells you know. When you succeed on a save against a spell you know, you can regain one expended slot of that spell's level. Long Rest to regain a slot this way again.",
  "Copycat": "When you see another creature make an ability check with a skill it is proficient in, you can gain that skill proficiency, if you lack it, until you take a Long Rest. Long Rest to use it again.",
  "Cerulean Reflection": "When a spell lets you take half damage on a save, you take none on a success and half on a failure. If you succeed on the save by 10 or more, you can use your reaction to cast the spell back at the caster as if it came from you, with the caster as the target. Long Rest to reflect again.",
 },
 "lu": [_u("Turquoise Efficiency", 6, 1, "long", "Regain a slot"), _u("Copycat", 10, 1, "long", "Copy a skill"), _u("Cerulean Reflection", 14, 1, "long", "Reaction")],
 "acts": {"Hex: Arcane Awareness": "action", "Cerulean Reflection": "reaction"}, "fx": []},

"Fragrant Magic": {"spab": "",
 "f": {
  "Fragrant Magic": "Aromatic smoke and herbs that can calm a mind or choke a lung. Craft spells. 1st: Color Spray, Fog Cloud. 2nd: Calm Emotions, Enhance Ability. 3rd: Gaseous Form, Stinking Cloud. 4th: Compulsion, Hallucinatory Terrain. 5th: Cloudkill, Hallow.",
  "Hex: Fragrant Aura": "Action. A 30-foot-radius aura around you lasts until the end of your next turn. It does nothing to creatures that do not breathe. Pick a scent. Frankincense: creatures you pick have Advantage on Wisdom checks and saves, and fiends and undead in the aura have Disadvantage on attack rolls and saves. Smelling Salts: each unconscious creature you pick with at least 1 hit point wakes, and everyone in it has Advantage on saves against being charmed or put to sleep. Sulfur: creatures you pick have Disadvantage on Constitution checks and saves.",
  "Smoke Rings": "When you create smoke, such as by burning herbs or incense, you can shape it as you wish in the moments before it drifts away.",
  "Aromatherapy": "You can replace the verbal, somatic and material components of a witch spell by burning incense. The incense is always consumed, and you must burn incense worth any listed gold cost of the components. A block costs 2 gp and holds 10 sticks worth 2 sp each. Rarer incense can replace costlier components.",
  "Dizzying Fog": "Action. Release a 20-foot-radius cloud of colored smoke around you that heavily obscures its area and fades at the end of your turn. Each creature you pick in it makes a Wisdom save or is dazed for up to 1 minute. A dazed creature has Disadvantage on attack rolls and Dexterity saves. Creatures immune to stunned are immune. It can repeat the save at the end of each of its turns. Short or Long Rest to use it again.",
  "Olfactory Aurora": "A flowery fog follows you. When a friendly creature within 30 feet makes an attack roll, ability check or saving throw, it can add 1d4.",
 },
 "lu": [_u("Dizzying Fog", 10, 1, "short", "Action. 20-foot radius")],
 "acts": {"Hex: Fragrant Aura": "action", "Dizzying Fog": "action"}, "fx": []},

"Gingerbread Magic": {"spab": "",
 "f": {
  "Gingerbread Magic": "Confectionery magic, kind or cruel. Craft spells. 1st: Tasha's Hideous Laughter, Sleep. 2nd: Arcane Lock, Protection from Poison. 3rd: Create Food and Water, Tiny Hut. 4th: Confusion, Hallucinatory Terrain. 5th: Animate Objects, Dream.",
  "Gingerbread Familiar": "When you summon your familiar, it can be made of gingerbread. It keeps its statistics and gains blindsight 10 feet and these traits. Distracting Aroma: a hostile creature within 5 feet of it has Disadvantage on attacks against creatures other than it. False Appearance: while motionless it looks like an ordinary gingerbread build. Fragile: it adds your witch level, not twice your witch level, to its hit point maximum.",
  "Hex: Sweet Tooth": "Action. Touch a nonmagical object, not worn or carried by another creature, that fits in a 1-foot cube. It becomes an edible candy copy of a type you choose. If it is not eaten by the end of your next turn it reverts.",
  "Sugar Rush": "As a bonus action, you give a creature you touch a quick surge of energy. On its next turn it can Dash or Disengage as a bonus action.",
  "Candied Decoy": "Action. Create a candy double of yourself in an empty space within 5 feet and swap places with it if you wish. It is a construct with AC 10, 20 hit points, your ability scores, and immunity to poison and psychic damage. It looks like you until cracks show as it takes damage. It moves at your walking Speed to a spot you choose, and cannot speak, act, or take bonus actions or reactions. It collapses into candy at 0 hit points or after 1 minute. Long Rest to use it again.",
  "Candy Land": "Action. Pick a point you see within 120 feet. For 1 minute, every nonmagical object fully inside a 30-foot-radius sphere there that is not worn or carried becomes an edible candy copy. Structures become gingerbread houses, trees become chocolate, and so on, as the GM decides. Candy objects have no damage threshold and are vulnerable to all damage. Objects not eaten when it ends revert. The area looks joyful and colorful. At the start of each of your turns in it, you and your familiar each regain 5 hit points, unless at 0 hit points or dismissed. Long Rest to use it again.",
 },
 "lu": [_u("Candied Decoy", 10, 1, "long", "Action"), _u("Candy Land", 14, 1, "long", "Action. 120 feet")],
 "acts": {"Hex: Sweet Tooth": "action", "Sugar Rush": "bonus", "Candied Decoy": "action", "Candy Land": "action"}, "fx": []},

"Green Magic": {"spab": "",
 "f": {
  "Green Magic": "Plants, nature and growing things. Craft spells. 1st: Entangle, Goodberry. 2nd: Barkskin, Locate Animals or Plants. 3rd: Conjure Animals, Plant Growth. 4th: Conjure Woodland Beings, Stoneskin. 5th: Awaken, Tree Stride.",
  "Hex: Elder Tongue": "Bonus action. Until the end of your next turn you can speak with beasts and plants in a limited way. Most cannot convey complex ideas but can tell what they recently saw or heard. You have Advantage on Charisma checks to influence beasts and plants.",
  "Primal Ally": "Your summoned familiar is sturdier. Add three times your witch level, not twice, to its hit point maximum.",
  "Twin Familiar": "When you summon your familiar you can split its spirit into two identical bodies that share one pool of hit points. They act on later turns. You can use your bonus action to order one twin to attack and your action to order the other. A spell or feature that targets or dismisses your familiar affects both.",
  "Vital Nourishment": "When you finish a Long Rest, plant life within 120 feet grows as if a month of ideal care had passed, and fruiting plants yield enough food for six creatures for a day. You also pick up to six creatures you see at the end of the rest. Each gains Temporary HP equal to half your witch level + your Charisma modifier, and you can end one disease on each or one condition from blinded, deafened, paralyzed or poisoned.",
  "Sacrificial Familiar": "When a melee attack targets you while your familiar is within 5 feet, you can use your reaction to have it leap in the way and take the attack instead. You can do this a number of times equal to your Charisma modifier (minimum 1), regained on a Long Rest.",
 },
 "lu": [_u("Sacrificial Familiar", 14, "mod:CHA", "long", "Reaction")],
 "acts": {"Hex: Elder Tongue": "bonus", "Sacrificial Familiar": "reaction"}, "fx": []},

"Purple Magic": {"spab": "",
 "f": {
  "Purple Magic": "Illusions, enchantments and anything not quite what it seems. Craft spells. 1st: Charm Person, Silent Image. 2nd: Enthrall, Invisibility. 3rd: Hypnotic Pattern, Major Image. 4th: Confusion, Mordenkainen's Private Sanctum. 5th: Modify Memory, Seeming.",
  "Hex: Hallucination": "Action. A creature you see within 60 feet makes a Wisdom save. A creature immune to charmed succeeds automatically. On a failure its view of the world warps and it takes a -1 penalty to attack rolls and ability checks. At the start of each of its turns the penalty grows by 1, to a maximum of -5. It lasts until the end of your next turn.",
  "False Authority": "Action. Anyone who sees you perceives a figure of authority, such as a guild master to a blacksmith or a captain to a soldier. The change fails physical inspection. It lasts 1 hour or until you end it on your turn. A creature can use its action to inspect you and must succeed on an Intelligence (Investigation) check against your spell save DC to see through it. Short or Long Rest to use it again.",
  "Deceitful Transposition": "Bonus action. Cast an illusion over two creatures within 60 feet so it seems they teleported and swapped places. Sounds, smells and other effects of each move to the right spot. The affected creatures do not perceive the illusion. A creature can use its action to examine one and make an Intelligence (Investigation) check against your spell save DC to see both for what they are. It lasts 1 minute and ends early if one illusory creature takes damage or interacts in a way that reveals the trick. Short or Long Rest to use it again.",
  "Waking Nightmare": "When a creature fails its save against your Hallucination hex, you can twist its mind so it counts every creature it sees as an enemy until the hex ends. Whenever it picks a target for an attack, spell or other effect, it picks at random from creatures it can see in range. It must use its reaction for an opportunity attack whenever one is provoked. It ends after 1 minute. Long Rest to use it again.",
 },
 "lu": [_u("False Authority", 6, 1, "short", "Action. 1 hour"), _u("Deceitful Transposition", 10, 1, "short", "Bonus action"), _u("Waking Nightmare", 14, 1, "long", "On Hallucination fail")],
 "acts": {"Hex: Hallucination": "action", "False Authority": "action", "Deceitful Transposition": "bonus"}, "fx": []},

"Red Magic": {"spab": "",
 "f": {
  "Red Magic": "Elemental arcana, dangerous to use. Craft spells. 1st: Burning Hands, Magic Missile. 2nd: Melf's Acid Arrow, Scorching Ray. 3rd: Fireball, Protection from Energy. 4th: Ice Storm, Wall of Fire. 5th: Cone of Cold, Telekinesis.",
  "Hex: Imperil": "Action. A creature you see within 60 feet makes a Constitution save, and you pick one damage type. On a failure it loses resistance to that type until the end of your next turn, or counts as merely resistant if it was immune.",
  "Convolute Energy": "When you cast a spell that deals acid, cold, fire, lightning or thunder damage, you can gain resistance to that damage type until the end of your next turn.",
  "Invulnerability": "As a reaction when an attacker you see hits you, you become nearly invulnerable and the damage from that attack is reduced by 50. Long Rest to use it again.",
  "Elemental Annihilation": "When you cast a witch spell that deals acid, cold, fire, lightning or thunder damage, you can spend another slot of equal or higher level to maximize the damage. Long Rest to use it again.",
 },
 "lu": [_u("Invulnerability", 10, 1, "long", "Reaction. -50 damage"), _u("Elemental Annihilation", 14, 1, "long", "Maximize damage")],
 "acts": {"Hex: Imperil": "action", "Invulnerability": "reaction"}, "fx": []},

"Sky Magic": {"spab": "",
 "f": {
  "Sky Magic": "Cloud witches spend as much time aloft as on the ground. Craft spells. 1st: Feather Fall, Fog Cloud. 2nd: Gust of Wind, Misty Step. 3rd: Call Lightning, Fly. 4th: Hallucinatory Terrain, Ice Storm. 5th: Cloudkill, Commune with Nature.",
  "Hex: Light Heels": "Action. Gain a flying Speed equal to your base Speed until the end of your next turn. You fall if you end your movement off solid ground.",
  "Corvid Familiar": "Your familiar becomes a feathered monstrous hybrid. It gains a flying Speed of 50 feet (unless it already has a faster one), the ability to speak Common, and these traits. Aerial Agility: +2 AC while flying. Keen Sight: Advantage on Wisdom (Perception) checks that use sight.",
  "Hex: Vortex": "Action. Create a 5-foot-radius sphere of twisting wind centered on you. It is difficult terrain for others. It pushes fog, clouds and gases, and Small or smaller flying creatures and objects, up above the sphere. Attacks through it with arrows, bolts and other projectiles have Disadvantage. Heavy projectiles such as boulders and ballista bolts are unaffected.",
  "Cloud Dancer": "While you fly, fall or levitate and an attack hits you, you can roll a d4. On a 4 the attack misses.",
 },
 "lu": [], "acts": {"Hex: Light Heels": "action", "Hex: Vortex": "action"}, "fx": []},

"Steel Magic": {"spab": "",
 "f": {
  "Steel Magic": "Covens that draw spells into their blades. Craft spells. 1st: Heroism, Shield. 2nd: Heat Metal, Magic Weapon. 3rd: Blink, Haste. 4th: Death Ward, Freedom of Movement. 5th: Flame Strike, Telekinesis.",
  "Bonus Proficiencies": "You gain proficiency with all martial melee weapons that lack the Heavy or Special property.",
  "Hex: Malevolence": "Bonus action. Wrap yourself in evil smog until the end of your next turn. Damage cannot break your concentration on this hex. While it lasts: your AC is 12 + Dexterity + Charisma if you hold no shield. You can use Charisma instead of Strength or Dexterity for attack and damage rolls with melee weapons lacking Heavy or Special. When a creature you see within 5 feet damages you, you can use your reaction to make a melee weapon attack against it.",
  "Cackling Killer": "When you use Cackle, you can attack twice, not once, if you take the Attack action that turn.",
  "Soulsword Familiar": "Bonus action. Draw your familiar's essence into your weapon in a cloak of green flame. The familiar is dismissed and cannot be resummoned until you finish a short or long rest. Until then the weapon deals an extra 1d8 fire damage on a hit.",
  "Shrieking Strike": "Once per turn when you hit a creature with a melee weapon attack, you can make it a shrieking strike. The target makes a Wisdom save against your spell save DC or is frightened of you for up to 1 minute, repeating the save at the end of each of its turns. You can do this a number of times equal to your Charisma modifier (minimum 1), regained on a Long Rest.",
 },
 "lu": [_u("Shrieking Strike", 14, "mod:CHA", "long", "Once per turn")],
 "acts": {"Hex: Malevolence": "bonus", "Soulsword Familiar": "bonus"},
 "grant": {"f": "Bonus Proficiencies", "weapons": [[3, "Martial melee weapons without Heavy or Special"]]}, "fx": []},

"Tea Magic": {"spab": "",
 "f": {
  "Tea Magic": "Calm and friendly witches who radiate warmth. Craft spells. 1st: Tasha's Hideous Laughter, Sanctuary. 2nd: Augury, Calm Emotions. 3rd: Clairvoyance, Sending. 4th: Divination, Mordenkainen's Private Sanctum. 5th: Legend Lore, Scrying.",
  "Hex: Tasseography": "Action. Pick a friendly creature you see within 60 feet, roll a d20 and record the number. Until the end of your next turn you can replace any attack roll, saving throw or ability check by that creature with the recorded roll. You must decide before the roll. Once you replace a roll, the hex ends.",
  "Tea Ceremony": "Whenever you take a short or long rest you can magically conjure enough tea for you and your allies. A creature that drinks it loses one extra level of exhaustion during that rest.",
  "Shapes and Omens": "When you finish a Long Rest you can read your tea leaves. The GM tells you a shape that hints at coming events. A tower might mean a wizard tomorrow, a serpent a lair or a monster.",
  "Herbal Remedy": "You can cast Greater Restoration with no slot and no material components. Short or Long Rest to use it again.",
  "Invigorate": "Bonus action. Give yourself or a friendly creature you see within 5 feet a rush of energy from a cup of tea. On the target's next turn it can take one additional action. Long Rest to use it again.",
 },
 "lu": [_u("Herbal Remedy", 10, 1, "short", "Greater Restoration, no slot"), _u("Invigorate", 14, 1, "long", "Bonus action")],
 "acts": {"Hex: Tasseography": "action", "Invigorate": "bonus"}, "fx": []},

"Technicolor Magic": {"spab": "",
 "f": {
  "Technicolor Magic": "Power drawn from friendship, adorable animals and a relentlessly positive outlook. Craft spells. 1st: Color Spray, Speak with Animals. 2nd: Animal Messenger, Warding Bond. 3rd: Fly, Sending. 4th: Freedom of Movement, Locate Creature. 5th: Rary's Telepathic Bond, Teleportation Circle.",
  "Animal Friends": "You have Advantage on Wisdom (Animal Handling) checks to befriend beasts, and you can use Charisma instead of Wisdom for them if the creature is Small or smaller. A beast you adopt as a pet can be dismissed into an extradimensional space, as a familiar can.",
  "Hex: Musical Interlude": "Action. Each willing creature that you see, that sees you, within 30 feet gains Temporary HP equal to your Charisma modifier + half your witch level. They last until the end of your next turn.",
  "Friendship Bracelet": "Action. Weave a small bracelet from string, beads or similar cheap materials. You always know where a creature wearing one is while you share a plane. You can target it with spells and effects as if you could see it, even if it is obscured.",
  "Positivity": "When an attacker you see hits you, you can use your reaction to gain a bonus to AC equal to the number of friendly creatures within 5 feet of you, possibly making the attack miss. Short or Long Rest to use it again.",
  "Redemptive Arc": "When a hostile creature you see drops to 0 hit points, you can use your reaction to spare it. It is stable but unconscious until it regains hit points. When it wakes, any magical effect on it that charmed, cursed, frightened or possessed it ends, and it loses one Bond or Flaw that made it hostile toward you. Long Rest to use it again.",
 },
 "lu": [_u("Positivity", 10, 1, "short", "Reaction. +AC per nearby ally"), _u("Redemptive Arc", 14, 1, "long", "Reaction")],
 "acts": {"Hex: Musical Interlude": "action", "Friendship Bracelet": "action", "Positivity": "reaction", "Redemptive Arc": "reaction"}, "fx": []},

"White Magic": {"spab": "",
 "f": {
  "White Magic": "Benevolent magic that heals and protects. Craft spells. 1st: Bless, Cure Wounds. 2nd: Lesser Restoration, Prayer of Healing. 3rd: Beacon of Hope, Revivify. 4th: Death Ward, Guardian of Faith. 5th: Mass Cure Wounds, Raise Dead.",
  "Hex: Remedy": "Action. A creature you see within 60 feet regains 1d10 + your witch level hit points. A creature healed this way cannot be affected by this hex again until it finishes a short or long rest.",
  "Talisman of Protection": "Spend 1 hour, which can be part of a short rest, crafting a talisman. You can have only one. A new one makes the old one mundane. A creature wearing it adds a d4 to its saving throws.",
  "Benevolent Surge": "When you, your familiar or an ally you see within 30 feet takes damage, you can use your reaction to heal that creature for 1d10 + your Charisma modifier. Short or Long Rest to use it again.",
  "Witch's Gift": "When you cast a spell or hex that restores hit points to a creature, it gains +3 AC until the end of your next turn.",
 },
 "lu": [_u("Benevolent Surge", 10, 1, "short", "Reaction. 1d10 + CHA")],
 "acts": {"Hex: Remedy": "action", "Benevolent Surge": "reaction"}, "fx": []},
}
