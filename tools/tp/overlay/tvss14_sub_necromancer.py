# Own-wording Necromancer Grave Ambitions, Valda's Spire of Secrets 2014 rules.
def _spl(extra=""):
    return "You learn additional spells from the ambition's list. Each counts as a Necromancer spell for you and does not count against your spells known. " + extra
_LICH = "You gain these in addition to the Lichdom feature. "
SUB = {
"Black Rider": {"spab": "",
 "f": {
  "Charnel Shield": "As a reaction when a creature you see damages you, spend Charnel Touch points up to half the damage dealt. Reduce the damage by the points spent.",
  "Skeletal Steed": "You are proficient with light armor, medium armor, shields, battleaxes, flails, lances, longswords, morningstars, war picks and warhammers. When you perform Animate Thralls you can raise the skeleton of a horse or similar animal as a warhorse skeleton.",
  "Extra Attack": "You can attack twice, instead of once, whenever you take the Attack action on your turn. Your melee weapon attacks score a critical hit on a 19 or 20.",
  "Gruesome Charge": "If you attack while mounted and 20 feet or more from where your turn began, your mount can use its reaction to make a melee weapon attack.",
  "Lichdom: Dullahan": _LICH + "Your head is your phylactery. Headless Sight: you see normally within 60 feet without eyes, even through magical darkness. Death's Steed: your undead mount gains resistance to nonmagical bludgeoning, piercing and slashing damage and +20 feet Speed. Reaping Charge: when you move 20 feet straight at a creature and hit it with a melee weapon attack while mounted, it makes a Strength save (DC 8 + Proficiency Bonus + Strength or Intelligence modifier) or is knocked prone. Against a prone creature, your mount can make one melee weapon attack as a bonus action.",
 },
 "lu": [], "acts": {"Charnel Shield": "reaction"},
 "grant": {"f": "Skeletal Steed", "armor": [[3, "Light, Medium, Shields"]], "weapons": [[3, "Battleaxes, Flails, Lances, Longswords, Morningstars, War Picks, Warhammers"]]},
 "fx": []},

"Blood Ascendant": {"spab": "",
 "f": {
  "Ascendant Spells": _spl("Charm Person and Sleep (1st), Enthrall and Suggestion (2nd), Hypnotic Pattern and Vampiric Touch (3rd), Phantasmal Killer and Mordenkainen's Private Sanctum (4th), Dominate Person and Modify Memory (5th)."),
  "Charnel Drain": "When you reduce a hostile creature or an enthralled humanoid to 0 HP with Charnel Touch, you regain HP equal to your Intelligence modifier plus your Necromancer level (minimum 3). You can knock the target unconscious instead of killing it.",
  "Enthrall Humanoid": "As an action, touch an incapacitated humanoid to enthrall it. It is charmed by you and follows your commands until Remove Curse is cast on it, its charmed condition ends, you use this again, or you release it as an action. It counts against your thrall count and total CR. You cannot enthrall one whose CR is above your total thrall CR. You can release thralls as part of the action.",
  "Vampiric Transformation": "As an action, spend 15 Charnel Touch points to transform for up to 1 hour, until you drop to 0 HP, or until you revert as an action. Your clothing transforms but carried items do not. Bat: a Tiny bat, cannot speak, walking Speed 5 feet, flying Speed 30 feet, other statistics unchanged. Mist: a Medium cloud, cannot act, speak or handle objects, weightless, flying Speed 20 feet and hover, can enter hostile spaces and stop there, passes anywhere air can (not water), Advantage on Strength, Dexterity and Constitution saves and resistance to bludgeoning, piercing and slashing damage.",
  "Children of the Night": "When you perform Animate Thralls you can summon swarms of bats, swarms of rats or wolves as thralls. When one drops to 0 HP or is released, it vanishes in mist.",
  "Lichdom: Nosferatu": _LICH + "Coffin Phylactery: your phylactery is a coffin of grave dirt. When you drop to 0 HP you reform in it after 1 hour, and are weakened until you rest 24 hours in it, with HP maximum 1 and dropping to 0 HP if you start your turn in sunlight. Regeneration: you regain 10 HP at the start of each of your turns, unless you are at 0 HP or in direct sunlight. Vampiric Agility: your Speed doubles and you climb difficult surfaces, even ceilings, without a check.",
 },
 "lu": [], "acts": {"Enthrall Humanoid": "action", "Vampiric Transformation": "action"}, "fx": []},

"Corpse Florist": {"spab": "",
 "f": {
  "Charnel Entangle": "When you hit with Charnel Touch and spend 5 or more points, the target makes a Strength save against your spell save DC or is restrained by weeds until the end of your next turn.",
  "Corpse Florist Spells": _spl("False Life and Goodberry (1st), Barkskin and Spike Growth (2nd), Plant Growth and Speak with Plants (3rd), Blight and Freedom of Movement (4th), Reincarnate and Tree Stride (5th)."),
  "Garden of the Grave": "When you perform Animate Thralls after a Long Rest you can plant corpse flowers in any thralls. Each such thrall is a Plant instead of Undead but counts as Undead for your Necromancer features. When you finish a short or long rest, it roots and regains 1d8 + your Intelligence modifier HP.",
  "Rotten Seed": "As a bonus action, toss a seed at a hostile non-undead creature within 15 feet. It makes a Dexterity save. On a failure a seedling burrows in. At the start of each of its turns it takes 1d8 Necrotic damage and you gain Temporary HP equal to it. It withers after 1 minute, when the target dies, or when you use this again. The damage becomes 1d10 at level 11 and 1d12 at level 17.",
  "Death in Bloom": "Once on each of your turns, when a hostile humanoid under your Rotten Seed dies, you can animate its corpse as a skeleton or zombie under your control. It counts as a thrall and has Garden of the Grave.",
  "Lichdom: Botanical Lich": _LICH + "Flowers bloom across your body. Flowering Phylactery: your soul sits in thirteen immortal flowers in places important to you, each with a weakness you settle with the GM. You regenerate unless all thirteen are destroyed. At 0 HP you regenerate in the soil at the nearest flower.",
 },
 "lu": [], "acts": {"Rotten Seed": "bonus"}, "fx": []},

"Crone": {"spab": "",
 "f": {
  "Charnel Curse": "When you hit with Charnel Touch and spend 5 or more points, the target makes a Wisdom save against your spell save DC or is cursed for 1 minute. While cursed it subtracts 1d6 from attack rolls, ability checks and saving throws, and can repeat the save at the end of each of its turns. You can curse one creature at a time and can end the curse on your turn at no cost.",
  "Crone Spells": _spl("Find Familiar and Tasha's Hideous Laughter (1st), Blindness/Deafness and Invisibility (2nd), Bestow Curse and Fly (3rd), Banishment and Polymorph (4th), Contagion and Seeming (5th)."),
  "Witch's Cauldron": "Spend 10 minutes and any number of Charnel Touch points to brew potions from foul ingredients. They keep potency 24 hours and use your spell save DC. Costs: 10 points for Animal Friendship, Climbing, Growth or Healing. 20 points for Philter of Love, Heroism, Poison or Resistance.",
  "Walking Hut": "When you perform Animate Thralls you can summon a walking hut as a thrall. As an action you can dismiss it to a pocket dimension or bring it to an unoccupied space within 60 feet.",
  "Lichdom: Baba Yaga": _LICH + "Athame: over a short or long rest, enchant a dagger or similar weapon into an athame, usable as a spellcasting focus. As an action, spend 25 Charnel Touch points to target a creature you see within 60 feet. It makes a Wisdom save against your spell save DC. On a failure, for 1 hour it loses damage resistances and treats immunities as resistances. Effigy: as a bonus action, build an effigy of a creature you see within 60 feet. While it is within 1 mile you can cast spells and use Charnel Touch on it through the effigy, even out of range or sight. The effigy lasts 8 hours, and a Long Rest restores this. Evil Eye: spend 20 points to cast Fear, 35 for Eyebite, or 40 for Mirage Arcane, with no slot.",
 },
 "lu": [{"feature": "Lichdom: Baba Yaga", "n": "Effigy", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action. 8 hours"}],
 "acts": {}, "fx": []},

"Dead Mist Acolyte": {"spab": "",
 "f": {
  "Charnel Consumption": "When you make a Charnel Touch attack and spend 5 or more points, you can lose that many HP instead of spending the points. You cannot regain HP from any spell you cast.",
  "Dead Mist Spells": _spl("Dead Mist Lash and Fog Cloud (1st), Levitate and Misty Step (2nd), Dead Fog and Gaseous Form (3rd), Banishment and Death Ward (4th), Antilife Shell and Cloudkill (5th)."),
  "Mistborne Regeneration": "As an action on your turn, spend 5 or more Charnel Touch points. You regain 1d8 HP for every 5 points spent.",
  "Duskfog": "When you perform Animate Thralls you can summon one or more duskfog as thralls. A duskfog at 0 HP, or released, disperses into the air.",
  "Lichdom: Dead Mist Lord": _LICH + "Damage Resistance: resistance to nonmagical bludgeoning, piercing and slashing damage. Gaseous Body: you can enter other creatures' spaces and pass through small holes and cracks, treating liquids as solid. You gain a flying Speed equal to your walking Speed, cannot fall, and hover even when stunned or incapacitated. Master of the Mists: once on each of your turns when you deal Necrotic damage to a hostile creature with Charnel Touch or a Necromancer spell, you regain 2d6 + your Intelligence modifier HP, up to the damage dealt.",
 },
 "lu": [], "acts": {"Mistborne Regeneration": "action"},
 "fx": [[20, "Lichdom: Dead Mist Lord", {"res": ["Bludgeoning (nonmagical)", "Piercing (nonmagical)", "Slashing (nonmagical)"]}]]},

"Death Knight": {"spab": "",
 "f": {
  "Charnel Strike": "When you take the Attack action, you can channel Charnel Touch through a melee weapon attack instead of a spell attack. On a hit the target takes the weapon attack's normal effects plus the Charnel Touch Necrotic damage. You can deal Necrotic damage this way once per turn. Whenever you deal damage with this or Charnel Touch, you gain Temporary HP equal to the Necrotic damage, up to half your HP maximum.",
  "Intensive Combat Research": "You are proficient with medium armor, shields and martial weapons. You can perform spell somatic components while wielding weapons or shields you are proficient with, as long as your arcane focus is on you.",
  "Extra Attack": "You can attack twice, instead of once, whenever you take the Attack action on your turn. Your melee weapon attacks score a critical hit on a 19 or 20.",
  "Overcharged Thralls": "When one of your thralls dies or you release it, your Charnel Touch pool regains points equal to your Necromancer level.",
  "Lichdom: Imperator": _LICH + "Completed Combat Research: you gain heavy armor proficiency if you lacked it, and resistance to bludgeoning, piercing and slashing damage. Peerless Charnel Strike: Charnel Touch Necrotic damage ignores resistance and immunity to Necrotic damage, and the Temporary HP from Charnel Strike has no cap.",
 },
 "lu": [], "acts": {},
 "grant": {"f": "Intensive Combat Research", "armor": [[3, "Medium, Shields"]], "weapons": [[3, "Martial"]]},
 "fx": [[20, "Lichdom: Imperator", {"res": ["Bludgeoning", "Piercing", "Slashing"]}]]},

"Necrodancer": {"spab": "",
 "f": {
  "Backup Dancers": "Each thrall can take the Dance action, dancing until the start of its next turn. While thralls dance you gain benefits by how many dance and a Backup Dancers Bonus to AC, attack rolls, damage rolls, Charisma (Performance) checks and saving throws, starting at +1. 1 dancer: bonus action Disengage. 2: bonus action Dash. 3 (+2): bonus action melee weapon attack. 4: two different bonus actions from this subclass on your turn. 5 (+3): Dexterity saves for half damage deal no damage on a success, and half on a failure. The book table gives the full list.",
  "Charnel Groove": "When you hit with Charnel Touch and spend 5 or more points, the target makes a Wisdom save against your spell save DC or must dance until the end of your next turn, using all movement to dance in place with Disadvantage on attack rolls and Dexterity saves. A creature that cannot be charmed succeeds automatically.",
  "Footloose": "You are proficient in Acrobatics and Performance, and double your Proficiency Bonus on checks with either. You are proficient with rapiers, scimitars, shortswords and whips.",
  "Graveyard Tango": "As a bonus action, spend 5 Charnel Touch points to give a willing creature other than you that sees or hears you your Backup Dancers Bonus until the start of your next turn.",
  "Disco of the Dead": "When a thrall takes the Dance action, it enters the Ethereal Plane until the start of its next turn, faintly visible in a blur of lights.",
  "Lichdom: Thriller": _LICH + "Dance-Off: as an action, spend 20 Charnel Touch points to challenge up to ten creatures you see within 60 feet. Those that can be charmed make a contested Charisma (Performance) check against yours. A loser takes 8d6 Psychic damage and has Disadvantage on its next attack roll before the end of its next turn. A winner takes half and has no Disadvantage. Moonwalk: you and your thralls are always under Freedom of Movement. Smooth Criminal: your Dexterity and Charisma become 20 if lower.",
 },
 "lu": [], "acts": {"Graveyard Tango": "bonus", "Lichdom: Thriller": "action"},
 "grant": {"f": "Footloose", "skills": [[3, "Acrobatics"], [3, "Performance"]], "weapons": [[3, "Rapiers, Scimitars, Shortswords, Whips"]]},
 "fx": [[3, "Footloose", {"skillPE": ["Acrobatics", "Performance"]}]]},

"Overlord": {"spab": "",
 "f": {
  "Charnel Boon": "As a bonus action, spend any number of Charnel Touch points to empower each thrall within 30 feet. Until the start of your next turn it gains +1 to attack rolls, damage rolls and AC for every 5 points spent, up to +3.",
  "Overlord Spells": "You learn these spells, which do not count against your spells known. Any not on the Necromancer list still count as Necromancer spells for you. Level 3: Hold Person and Suggestion. Level 5: Haste and Slow. Level 7: Compulsion and Confusion. Level 9: Dominate Person and Geas.",
  "Despotic Discourse": "You gain proficiency in Deception, Intimidation or Persuasion (your choice). You can use Intelligence instead of Charisma for checks with all three.",
  "Sacrificial Thralls": "When you are targeted by an attack, you can use your reaction to make a thrall within 5 feet the new target of the attack or spell. Short or Long Rest to use it again.",
  "Lichdom: Tyrant": _LICH + "Immortal Rule: if you drop to 0 HP you can possess a nearby body instead of reforming. Pick an unconscious humanoid, or one that died within the last minute, within 100 feet (not one warded by Protection from Evil and Good or Magic Circle). You control it. Your statistics are replaced by its, but you keep your alignment and Intelligence, Wisdom and Charisma. If it was at 0 HP it becomes undead and regains 50 HP up to its maximum. You keep your class features and cannot use its class features. For an unconscious creature, it makes a Charisma save against your spellcasting DC every 8 hours and on a success you are ejected and begin reforming at your phylactery. You are ejected if the body dies or you leave as an action. You can possess a creature only once. Tyrant's Influence: spend 25 Charnel Touch points to cast Dominate Beast, 30 for Dominate Person, or 60 for Dominate Monster, with no slot or components.",
 },
 "lu": [{"feature": "Sacrificial Thralls", "lvl": 10, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Charnel Boon": "bonus", "Sacrificial Thralls": "reaction"}, "fx": []},

"Pale Master": {"spab": "",
 "f": {
  "Charnel Empower": "When you cast a necromancy spell of level 1 or higher that deals damage, you can spend Charnel Touch points up to your level plus your Intelligence modifier. Add that much Necrotic damage to one of the spell's targets.",
  "Pale Master Spells": _spl("Exhume and Inflict Wounds (1st), Invisibility and Ray of Enfeeblement (2nd), Animate Dead and Fear (3rd), Evard's Black Tentacles and Blight (4th), Cloudkill and Scrying (5th)."),
  "Undead Empathy": "When an undead creature tries to attack you, it makes a Wisdom save against your spell save DC. On a failure its attack misses, and if its Intelligence is 4 or lower it becomes friendly to you and your allies. You have Advantage on Charisma checks against undead with Intelligence 5 or higher.",
  "Frightening Gaze": "You gain proficiency in Intimidation if you lack it. As a bonus action, spend 10 Charnel Touch points to fix your gaze on a creature you see within 60 feet. It makes a Wisdom save against your spell save DC or is frightened of you for 1 minute, repeating the save at the end of each of its turns.",
  "Thrall Rush": "When you roll initiative and are not surprised, you can command each thrall to move up to its Speed or attack once.",
  "Lichdom: Pale Ascendant": _LICH + "Devour Soul: when you reduce a hostile creature to 0 HP you can devour its soul at no action cost. Roll 1d8 and regain expended spell slots whose combined level is no more than the roll. Long Rest to use it again. A soul devoured can be restored only by True Resurrection or Wish. Paralyzing Touch: when you spend 20 or more points on a Charnel Touch attack, the target makes a Constitution save against your spell save DC or is paralyzed for 1 minute, repeating the save at the end of each of its turns.",
 },
 "lu": [{"feature": "Lichdom: Pale Ascendant", "n": "Devour Soul", "lvl": 20, "max": 1, "reset": "long", "tag": "Regain slots up to 1d8 levels"}],
 "acts": {"Frightening Gaze": "bonus"},
 "grant": {"f": "Frightening Gaze", "skills": [[6, "Intimidation"]]}, "fx": []},

"Pharaoh": {"spab": "",
 "f": {
  "Channel Divinity": "You start with one effect, Ankh of Radiance. When you use Channel Divinity you pick an effect, then must finish a short or long rest to use it again. You can also spend 15 Charnel Touch points as an action to regain it. Ankh of Radiance: as an action, brandish your holy symbol and wreath each creature of your choice within 60 feet in holy radiance for 1 minute. When a wreathed creature makes an attack roll or saving throw it can add a d4. The first time it takes damage, it has resistance to that damage and the radiance on it ends.",
  "Holy Symbol": "You can use a holy symbol as a spellcasting focus for your necromancy spells.",
  "Pharaoh Spells": "You learn these spells, which do not count against your spells known. Any not on the Necromancer list still count as Necromancer spells for you. You also learn Thaumaturgy as a bonus cantrip. Level 3: Halo of Flame and Lesser Restoration. Level 5: Snakestaff and Revivify. Level 7: Death Ward and Divination. Level 9: Insect Plague and Greater Restoration.",
  "Mock Divinity": "Thaumaturgy gains more effects. Brighten or darken the sun or moon in a 100-foot radius for 1 minute, or change darkness to dim light, dim light to bright light, or the reverse. You can raise bright light to a blazing radiance (Disadvantage on sight-based Perception checks) or deepen darkness to pitch black (darkvision limited to 30 feet, though magical darkness vision is unaffected). At a point within 100 feet you can manifest a Huge illusory avatar of a deity that mimics your movements and speaks with your booming voice for 1 minute.",
  "Channel Divinity: Scarab of Judgement": "As an action, touch an undead creature you control and choose a willing humanoid you see within 60 feet. The undead turns to dust and the humanoid regains HP equal to its HP. A creature healed this way cannot be again until it finishes a short or long rest.",
  "Lichdom: God-King": _LICH + "Canopic Phylacteries: your organs sit in four canopic jars, each with a weakness you settle with the GM. You regenerate unless all four are destroyed, and reform at your sarcophagus. Mummy Rot: when you spend 20 or more points on a Charnel Touch attack, the target makes a Constitution save against your spell save DC or is cursed with mummy rot. It cannot regain HP, and its HP maximum drops by 3d6 every 24 hours. At 0 maximum it dies and turns to dust. Remove Curse or similar magic ends it. Whirlwind of Sand: as an action, become a whirlwind of sand, move up to 60 feet and revert. In whirlwind form you are immune to all damage and cannot be grappled, petrified, knocked prone, restrained or stunned. Your gear stays with you.",
 },
 "lu": [{"feature": "Channel Divinity", "n": "Channel Divinity", "lvl": 3, "max": 1, "reset": "short", "tag": "Or 15 Charnel Touch points"}],
 "acts": {"Channel Divinity": "action", "Channel Divinity: Scarab of Judgement": "action"}, "fx": []},

"Plague Lord": {"spab": "",
 "f": {
  "Charnel Toxin": "When you spend 10 or more points on a Charnel Touch attack, the target makes a Constitution save against your spell save DC or is poisoned until the start of your next turn.",
  "Vile Congregation": "Vermin swarm over you and those near you. When a creature within 5 feet of you makes an attack roll or saving throw, you can subtract 1d4 from it. This does not affect constructs or undead.",
  "Projectile Spew": "Charnel Touch and spells with a range of Touch reach creatures out to 15 feet.",
  "Bloated Thralls": "When a thrall drops to 0 HP or you release it, you can make it burst. Each creature within 5 feet, other than you and your thralls, makes a Dexterity save against your spell save DC. On a failure it takes 4d6 Poison damage and is poisoned until the start of your next turn. On a success, half damage and no poison.",
  "Lichdom: Corpulent Lich": _LICH + "Gore Burst: when you drop to 0 HP you explode. Each creature in a 20-foot sphere makes a Dexterity save against your spell save DC. On a failure it takes 5d10 Necrotic and 5d10 Poison damage and is poisoned until the start of your next turn. On a success, half damage and no poison. Master of Disease: when you use Charnel Toxin and spend 25 or more points, a target that fails is poisoned for up to 1 minute. You can also apply two effects of your choice while it is poisoned: Disadvantage on checks and saves with one ability score, sight limited to 10 feet, falling prone at the end of each of its turns, losing an extra 1d6 HP whenever it takes damage, or babbling nonsense so it cannot speak or use verbal components. At the end of each of its turns it repeats the Constitution save to end this.",
 },
 "lu": [], "acts": {}, "fx": []},

"Reanimator": {"spab": "",
 "f": {
  "Charnel Voltage": "You can deal Lightning damage with Charnel Touch. When you spend 5 or more points and deal Lightning damage, the energy can arc to a second creature within 5 feet of the target. It makes a Dexterity save against your spell save DC, taking Lightning damage equal to half the points spent on a failure.",
  "Mad Science": "Spend 10 minutes to install a monstrous graft on a thrall that lacks Incorporeal Movement. Thralls lose no HP or Hit Dice installing or removing grafts, and need no recovery time.",
  "Skilled Surgeon": "You gain proficiency in Medicine if you lack it. You can use Intelligence instead of Wisdom for Wisdom (Medicine) checks.",
  "Lazarus Bolt": "As an action, drive a bolt into a creature within 5 feet that died in the last minute and shock it back to life with 1 HP. It fails on creatures without a heart, that died of old age, or that lack vital organs. For 1 minute you can restore its HP with Charnel Touch as if it were a thrall. Short or Long Rest to use it again.",
  "Arcane Stitching": "Spend 10 Charnel Touch points and 1 minute of needlework to stitch one thrall. The stitch lasts until the thrall uses it, dies, or you use this again. Augmented Incision: Advantage on attack rolls and ability checks until the end of its turn. Bulwark Backstitch: it casts Shield when an attack would hit it. Fleet Threads: its Speed triples until the end of its turn. Searing Suture: on a hit it deals an extra 3d6 Necrotic or Lightning damage (your choice).",
  "Lichdom: Patchwork Golem": _LICH + "Golem Form: your Strength, Dexterity and Constitution become 20 if lower. You resist nonmagical bludgeoning, piercing and slashing damage from non-adamantine weapons. You lose no HP or Hit Dice installing or removing grafts, and need no recovery time. Magic Resistance: Advantage on saves against spells and other magical effects.",
 },
 "lu": [{"feature": "Lazarus Bolt", "lvl": 6, "max": 1, "reset": "short", "tag": "Action. Revive to 1 HP"}],
 "acts": {"Lazarus Bolt": "action"},
 "grant": {"f": "Skilled Surgeon", "skills": [[3, "Medicine"]]}, "fx": []},

"Reaper": {"spab": "",
 "f": {
  "Charnel Veil": "When you spend 5 or more points on a Charnel Touch attack, you can become invisible until the start of your next turn and make no sound as you move.",
  "Reaper Spells": _spl("False Life and Inflict Wounds (1st), Invisibility and Silence (2nd), Fear and Speak with Dead (3rd), Greater Invisibility and Phantasmal Killer (4th), Mislead and Passwall (5th)."),
  "Shroud of Death": "As a bonus action you can hide or reveal a wispy cloak of darkness. While cloaked you levitate an inch off the ground, ignore nonmagical difficult terrain, and can walk across fluid surfaces such as water and quicksand.",
  "Umbral Form": "As an action, sink into a surface and flatten into a shadow. You move only along the surfaces you are attached to, with a climbing Speed equal to your Speed, and cross difficult surfaces and ceilings without checks. You cannot speak, manipulate objects, attack or cast spells, and carried items cannot be used. Opportunity attacks against you have Disadvantage. In darkness you are effectively invisible to creatures without darkvision. You can end it as a bonus action on your turn.",
  "Wraith Flight": "The flying Speeds of your thralls double. When a thrall flies out of an enemy's reach, opportunity attacks against it have Disadvantage.",
  "Lichdom: Harbinger": _LICH + "Death's Touch: when you use Charnel Touch against a creature you see and roll 11 or higher on the d20 spell attack, you hit regardless of AC. Fell Flight: you gain a flying Speed of 50 feet. Grim Harvest: when you kill a humanoid with Charnel Touch, you rip out its soul, which animates as a visage under your control.",
 },
 "lu": [], "acts": {"Umbral Form": "action", "Shroud of Death": "bonus"},
 "fx": [[20, "Lichdom: Harbinger", {"notes": [["Note", "Fell Flight: flying Speed 50 feet"]]}]]},

"Toymaker": {"spab": "",
 "f": {
  "Charnel Puppet": "As an action, spend 5 or more Charnel Touch points to animate two slaymates under your control for every 5 points spent. They count as thralls and appear in your space or an unoccupied space within 5 feet.",
  "Slaymates": "You bind the souls of the dead into porcelain dolls, clockwork toys, wooden puppets and stuffed animals. When you perform Animate Thralls you can summon slaymates as thralls. They count as Undead for your Necromancer features, and two slaymates count as one thrall for your thrall maximum. At 0 HP or when released, a slaymate collapses into ruined material.",
  "Soul Doll": "As a reaction when a creature you see within 60 feet dies, you can trap its soul in a soul doll. The creature controls the doll's body using slaymate statistics but cannot attack, and keeps its alignment, personality, Intelligence, Wisdom and Charisma, languages and free will. You do not control it and it is not a thrall. While trapped it cannot return to life. The soul leaves when you release it as an action or the doll drops to 0 HP. You can hold up to five. A new doll can release another as part of the same reaction.",
  "Miniature Minions": "When you perform Animate Thralls, any thrall can be Tiny with a toy-like look you choose. Every Tiny thrall gains Evasion: on a Dexterity save for half damage it takes no damage on a success and half on a failure, unless incapacitated.",
  "Capstone: Clockwork Lich": _LICH + "Clockwork Body: your soul is bound to a Construct body with your statistics. You are Undead, but effects that affect Constructs affect you too. You are immune to blinded, charmed, deafened, frightened, paralyzed and stunned, and to effects that alter your form. Reconstruction: spend 10 days and 500 gp to build an extra clockwork body as a safeguard. When you die your soul moves into one you built. With none available, you reform at your phylactery.",
 },
 "lu": [], "acts": {"Charnel Puppet": "action", "Soul Doll": "reaction"}, "fx": []},
}
