# Own-wording Warden subclasses (Champion's Calls) of Valda's Spire of Secrets, 2014 rules, except Stoneheart Defender (tvss14_sub.py). Shape of tvss_sub.py.
EVA = "When an effect lets you make a Dexterity saving throw to take half damage, you take no damage on a success and half damage on a failure."
MET = "When an effect lets you make a Constitution saving throw to take half damage, you take no damage on a success and half damage on a failure."
SPR = "You have Advantage on saving throws against spells."
ALL12 = ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Radiant", "Slashing", "Thunder"]
SUB = {
"Bloodwrath Guardian": {"spab": "",
 "f": {
  "Feral Trance": "Bonus Action: fall into a battle trance for 1 minute. You have Advantage on Strength checks and Strength saving throws, your Speed rises by 10 feet, and you have Advantage on melee weapon attacks made with Strength against a creature you have marked. Attacks against you also have Advantage. The trance ends early if you fall Unconscious, or if your turn ends and you neither attacked a hostile creature nor took damage since your last turn. You can end it as a Bonus Action. Short or Long Rest to use it again.",
  "Predator's Scent": "A creature you have marked stays marked for up to 24 hours, even out of your sight. While it is marked you know its direction and distance, as long as it is on your plane.",
  "Evasion": EVA,
  "Form of the Primal Beast": "Action: for 1 minute you turn into a hunched shape of fur and shadow. You gain the benefits of Feral Trance and Temporary Hit Points equal to twice your level. When you hit with a melee weapon attack you can give the target a bleeding wound (not Constructs, Oozes or Undead). At the start of each of its turns a creature loses 1d8 HP for each bleeding wound unless it uses an action to staunch them, and it cannot regain HP while bleeding. A creature can have wounds up to your Proficiency Bonus. Long Rest to use it again.",
 },
 "lu": [{"feature": "Feral Trance", "lvl": 3, "max": 1, "reset": "short", "tag": "Bonus Action. 1 minute"},
        {"feature": "Form of the Primal Beast", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Feral Trance": "bonus", "Form of the Primal Beast": "action"},
 "fx": [[3, "Feral Trance", {"notes": [["Note", "Feral Trance: Advantage on Strength checks and saves, Speed +10 ft, Advantage on Strength melee attacks against your marked creature, attacks against you have Advantage"]]}],
        [6, "Predator's Scent", {"notes": [["Note", "Predator's Scent: marked creature stays marked 24 hours and you know its direction and distance on the same plane"]]}],
        [13, "Evasion", {"notes": [["Note", "Evasion: a successful Dexterity save against half-damage effects means no damage"]]}]]},

"Carrion King": {"spab": "",
 "f": {
  "Gnawing Mark": "Vermin swarm over a creature you mark. While it is marked, it rolls a d4 and subtracts the result from each attack roll and ability check it makes.",
  "Infested": "Vermin fill your clothes and gear. When a creature within 5 feet hits you with an attack, they strike back for 1d6 Piercing damage. On each later attack that creature makes before the end of its turn, it rolls a d4 and subtracts the result from the attack roll.",
  "Evasion": EVA,
  "Lord of the Flies": "Action: call up a huge swarm of flies and rodents around you for 1 minute. A 10-foot-radius sphere centered on you is heavily obscured. Each creature you choose has Disadvantage on attack rolls and ability checks while in it, and takes 6d4 Piercing damage when it first enters on a turn or starts its turn there. Long Rest to use it again.",
 },
 "lu": [{"feature": "Lord of the Flies", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Lord of the Flies": "action"},
 "fx": [[3, "Gnawing Mark", {"notes": [["Note", "Gnawing Mark: a marked creature subtracts a d4 from its attack rolls and ability checks"]]}],
        [6, "Infested", {"notes": [["Note", "Infested: a creature that hits you in melee takes 1d6 Piercing, then subtracts a d4 from its later attacks that turn"]]}],
        [13, "Evasion", {"notes": [["Note", "Evasion: a successful Dexterity save against half-damage effects means no damage"]]}]]},

"Fey Trailblazer": {"spab": "",
 "f": {
  "Alluring Mark": "When you use Warden's Mark, you can try an Alluring Mark. The target makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + your Constitution modifier). On a failure, instead of the usual effect, it is Charmed by you while it is within 5 feet of you. The mark ends early if you damage the creature.",
  "Misty Jaunt": "You can spend all of your movement to teleport up to half your Speed.",
  "Spell Resistance": SPR,
  "Archfey of Majesty": "Action: for 1 minute you embody the grace of the archfey. When a creature tries to attack you, it makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + your Constitution modifier). On a failure its attack misses. On a success it is immune to this effect for 24 hours. As a Bonus Action you can teleport up to 30 feet to an unoccupied space you can see. Long Rest to use it again.",
 },
 "lu": [{"feature": "Archfey of Majesty", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Archfey of Majesty": "action"},
 "fx": [[3, "Alluring Mark", {"notes": [["Note", "Alluring Mark: Warden's Mark can Charm the target (Wisdom save, DC 8 + PB + CON) while it is within 5 feet of you"]]}],
        [6, "Misty Jaunt", {"notes": [["Note", "Misty Jaunt: spend all movement to teleport up to half your Speed"]]}],
        [13, "Spell Resistance", {"advOn": ["saving throws against spells"]}]]},

"Godsworn": {"spab": "WIS",
 "f": {
  "Anointed Mark": "Warden's Mark can target a friendly creature within 30 feet. While it stays marked, it is under the effects of the Bless spell.",
  "Bonus Proficiencies": "You gain proficiency in Medicine and Religion. If you already have one of them, your Proficiency Bonus is doubled for ability checks with it.",
  "Holy Allies": "Action: cast Spirit Guardians with no spell slot (DC 8 + your Proficiency Bonus + your Strength modifier). Long Rest to use it again.",
  "Mettle": MET,
  "Sainted Mantle": "Bonus Action: wrap yourself in divine light for 1 minute. While conscious you regain 5 HP at the start of each of your turns, or 10 HP if you have less than half your HP at that moment. Long Rest to use it again.",
 },
 "lu": [{"feature": "Holy Allies", "lvl": 6, "max": 1, "reset": "long", "tag": "Spirit Guardians, no slot"},
        {"feature": "Sainted Mantle", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action. 1 minute"}],
 "acts": {"Holy Allies": "action", "Sainted Mantle": "bonus"},
 "fx": [[3, "Bonus Proficiencies", {"skills": ["Medicine", "Religion"], "notes": [["Note", "Bonus Proficiencies: if you already have Medicine or Religion, double your Proficiency Bonus for checks with it"]]}],
        [3, "Anointed Mark", {"notes": [["Note", "Anointed Mark: Warden's Mark on an ally within 30 ft gives it Bless while marked"]]}],
        [13, "Mettle", {"notes": [["Note", "Mettle: a successful Constitution save against half-damage effects means no damage"]]}]]},

"Grey Watchman": {"spab": "",
 "f": {
  "Battle Tactics": "You learn maneuvers powered by Battle Dice. You have two d8 Battle Dice. A die is expended when used. You regain all of them when you finish a Short or Long Rest or roll Initiative. The count and size grow: 3d8 at level 7, 3d10 at level 13, 4d10 at level 19. Once per turn you can expend a die for one maneuver. Saving throw DC for maneuvers: 8 + your Proficiency Bonus + your Strength or Dexterity modifier. **Bull Rush.** After a melee weapon attack made right after moving 10 feet in a straight line, spend a Bonus Action and a die to shove the target. Add the die to the Strength (Athletics) check. On a success you push it 10 feet. **Bulwark.** When you hit with a melee attack, spend a Bonus Action and a die. The next time that creature damages you before your next turn, subtract the die roll from the damage. **Cleave.** When you reduce a hostile creature to 0 HP or score a critical hit with a melee weapon attack on your turn, spend a die to move up to 15 feet and make another melee weapon attack, adding the die to the damage. **Heelcutter.** On an Opportunity Attack, spend a die and add it to the attack roll. The target makes a Strength saving throw or its Speed is 0 until the end of its turn. **Reckless Assault.** When you attack, spend a die to have Advantage on the roll. Attacks against you have Advantage until the start of your next turn. **Staggering Strike.** As a Bonus Action when you make a weapon attack, spend a die to try to stun a Humanoid. On a hit it makes a Constitution saving throw or is Incapacitated until the start of your next turn.",
  "Hold the Line": "When you use Warden's Grasp, each creature you choose in the area other than you gains +1 to AC and saving throws until the start of your next turn while it stays in the area.",
  "Fortification Expert": "You have Advantage on ability checks to build defensive fortifications, search walls and defenses for weak points or entries, or climb built walls. You can also treat cover as full cover.",
  "Mettle": MET,
  "Unbreakable Sentinel": "Action: become a paragon of battle for 1 minute. You have +2 AC. Whenever you hit a creature you have marked, you regain one expended Battle Die. You can take one extra Reaction each round, but only one per turn. Long Rest to use it again.",
 },
 "lu": [{"feature": "Battle Tactics", "n": "Battle Dice", "lvl": 3, "max": [0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4], "reset": "short", "tag": "d8, d10 from 13"},
        {"feature": "Unbreakable Sentinel", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Unbreakable Sentinel": "action"},
 "fx": [[3, "Hold the Line", {"notes": [["Note", "Hold the Line: allies in Warden's Grasp area gain +1 AC and saving throws until your next turn"]]}],
        [6, "Fortification Expert", {"notes": [["Note", "Fortification Expert: Advantage on checks to build or inspect fortifications and climb built walls. Cover counts as full cover"]]}],
        [13, "Mettle", {"notes": [["Note", "Mettle: a successful Constitution save against half-damage effects means no damage"]]}]]},

"Hellkeeper": {"spab": "",
 "f": {
  "Hellish Grasp": "When you use Warden's Grasp, each creature it affects takes 1d6 Fire damage. At level 14 this becomes 2d6.",
  "Tormenter": "You gain proficiency in Intimidation, and your Proficiency Bonus is doubled for Charisma (Intimidation) checks to intimidate a Restrained creature.",
  "Fell Resilience": "While your HP is below half your maximum, you have Advantage on Strength and Constitution saving throws.",
  "Spiteful Mark": "When you mark a creature with Warden's Mark, it takes 1d6 Fire damage. At level 11 this becomes 2d6.",
  "Evasion": EVA,
  "Hellbent": "Action: take the shape of a true devil for 1 minute. Your melee weapon attacks deal an extra 2d8 Fire damage on a hit. Fire damage you deal ignores Resistance and Immunity. Once during the duration, if you fail a saving throw you can succeed instead. Long Rest to use it again.",
 },
 "lu": [{"feature": "Hellbent", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Hellbent": "action"},
 "fx": [[3, "Tormenter", {"skills": ["Intimidation"], "notes": [["Note", "Tormenter: double Proficiency Bonus on Intimidation checks against a Restrained creature"]]}],
        [3, "Hellish Grasp", {"notes": [["Note", "Hellish Grasp: creatures in Warden's Grasp take 1d6 Fire (2d6 at level 14)"]]}],
        [6, "Fell Resilience", {"notes": [["Note", "Fell Resilience: below half HP, Advantage on Strength and Constitution saves"]]}],
        [6, "Spiteful Mark", {"notes": [["Note", "Spiteful Mark: a creature you mark takes 1d6 Fire (2d6 at level 11)"]]}],
        [13, "Evasion", {"notes": [["Note", "Evasion: a successful Dexterity save against half-damage effects means no damage"]]}]]},

"Iceheart Bastion": {"spab": "",
 "f": {
  "Icy Grasp": "When you use Warden's Grasp, ice anchors you to the ground and you gain Temporary Hit Points equal to your Constitution modifier until the start of your next turn.",
  "Snowshoes": "You ignore Difficult Terrain caused by snow and ice, and it does not slow your travel.",
  "North Wind": "Breathe out an icy gale in a line 100 feet long and 5 feet wide. Each creature in it makes a Dexterity saving throw. On a failure it takes 4d6 Cold damage and its Speed is halved until the end of its next turn. On a success it takes half damage and its Speed is unchanged. Short or Long Rest to use it again.",
  "Mettle": MET,
  "Form of the Old Hoarfrost": "Action: turn into a creature of deep cold for 1 minute. A 15-foot-radius freezing vortex surrounds you and puts out nonmagical flames. The area is Difficult Terrain. A creature that first enters it on a turn or starts its turn there takes 8d6 Cold damage. You can exempt creatures from the effects. Long Rest to use it again.",
 },
 "lu": [{"feature": "North Wind", "lvl": 6, "max": 1, "reset": "short", "tag": "100 ft line, 4d6 Cold"},
        {"feature": "Form of the Old Hoarfrost", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"North Wind": "action", "Form of the Old Hoarfrost": "action"},
 "fx": [[3, "Icy Grasp", {"notes": [["Note", "Icy Grasp: Warden's Grasp gives you Temporary HP equal to your Constitution modifier until your next turn"]]}],
        [3, "Snowshoes", {"notes": [["Note", "Snowshoes: ignore Difficult Terrain from snow and ice"]]}],
        [13, "Mettle", {"notes": [["Note", "Mettle: a successful Constitution save against half-damage effects means no damage"]]}]]},

"Loreseeker": {"spab": "INT", "third": {"list": "Wizard", "ab": "INT", "cant": 2},
 "f": {
  "Bookmark": "A creature you have marked subtracts 1d4 from saving throws against your spells and effects.",
  "Spellcasting": "You cast Wizard spells using Intelligence. **Cantrips.** Learn two Wizard cantrips, and a third at level 10. **Spell slots.** The Loreseeker Spellcasting table gives your slots. They return on a Long Rest. **Spells known.** You know three level 1 Wizard spells, two of which must be Abjuration or Evocation. The table shows when you learn more. Each must be Abjuration or Evocation and of a level you have slots for, except those learned at levels 8, 14 and 20, which can be from any school. When you gain a Warden level you can swap one spell for another that follows the same rule. **Spellcasting ability.** Intelligence. Spell save DC is 8 + your Proficiency Bonus + your Intelligence modifier. Spell attack bonus is your Proficiency Bonus + your Intelligence modifier. You can use an arcane focus as a spellcasting focus.",
  "Ensnaring Mark": "When you put Warden's Mark on a creature, you can teleport it to an unoccupied space within 5 feet of you. Short or Long Rest to use it again.",
  "Spell Resistance": SPR,
  "Librarian of the Eternal": "Action: become a living store of ancient lore for 1 minute. When you cast a spell you gain 15 Temporary Hit Points. A cantrip with a casting time of 1 action can be cast as a Bonus Action. A creature you have marked has Disadvantage on saving throws against your spells. Long Rest to use it again.",
 },
 "lu": [{"feature": "Ensnaring Mark", "lvl": 6, "max": 1, "reset": "short", "tag": "Teleport the marked creature"},
        {"feature": "Librarian of the Eternal", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Librarian of the Eternal": "action"},
 "fx": [[3, "Bookmark", {"notes": [["Note", "Bookmark: a marked creature subtracts 1d4 from saves against your spells and effects"]]}],
        [6, "Ensnaring Mark", {"notes": [["Note", "Ensnaring Mark: teleport the creature you mark to within 5 feet of you (once per rest)"]]}],
        [13, "Spell Resistance", {"advOn": ["saving throws against spells"]}]]},

"Nightgaunt": {"spab": "",
 "f": {
  "Darkvision": "You see in dim light within 60 feet as if it were bright, and in darkness as if it were dim, but only in shades of gray. If you already have Darkvision, its range grows by 30 feet. From level 13 you can see through magical darkness too.",
  "Marked for Death": "Your mark leaves a shadow of undeath on the target. If you deal damage to a creature you have marked with a melee weapon attack and its remaining HP is lower than the damage you dealt, it drops to 0 HP.",
  "Undead Empathy": "When an Undead tries to attack you, it makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + your Constitution modifier). On a failure its attack misses, and if its Intelligence is 4 or lower it becomes friendly to you and your allies.",
  "Evasion": EVA,
  "Gravelord": "Action: take in the power of true undead for 1 minute. You are immune to Poison damage and the Poisoned condition. You can use Undying up to three times, even if you have used it today. Once per turn when you deal damage with a melee weapon attack, you can deal an extra 4d6 Necrotic damage and gain Temporary HP equal to it, lasting until the start of your next turn. Long Rest to use it again.",
 },
 "lu": [{"feature": "Gravelord", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Gravelord": "action"},
 "fx": [[3, "Darkvision", {"darkTo": 60, "notes": [["Note", "Darkvision: if you already have Darkvision, add 30 feet to its range. From level 13 it sees through magical darkness"]]}],
        [3, "Marked for Death", {"notes": [["Note", "Marked for Death: a melee hit on your marked creature drops it to 0 HP if its remaining HP is lower than the damage dealt"]]}],
        [6, "Undead Empathy", {"notes": [["Note", "Undead Empathy: an Undead attacking you makes a Wisdom save (DC 8 + PB + CON) or misses, and may turn friendly if Intelligence 4 or lower"]]}],
        [13, "Evasion", {"notes": [["Note", "Evasion: a successful Dexterity save against half-damage effects means no damage"]]}]]},

"Soulblood Shaman": {"spab": "WIS", "third": {"list": "Druid", "ab": "WIS", "cant": 2},
 "f": {
  "Soulblood": "As a Reaction when a creature within 5 feet damages you, you can mark that creature.",
  "Spellcasting": "You cast Druid spells using Wisdom. **Cantrips.** Learn two Druid cantrips, and a third at level 10. **Spell slots.** The Soulblood Shaman Spellcasting table gives your slots. They return on a Long Rest. **Spells known.** You know three level 1 Druid spells, two of which must be Evocation or Transmutation. The table shows when you learn more. Each must be Evocation or Transmutation and of a level you have slots for, except those learned at levels 8, 14 and 20, which can be from any school. When you gain a Warden level you can swap one spell for another that follows the same rule. **Spellcasting ability.** Wisdom. Spell save DC is 8 + your Proficiency Bonus + your Wisdom modifier. Spell attack bonus is your Proficiency Bonus + your Wisdom modifier. You can use a druidic focus as a spellcasting focus.",
  "Whispers of Beyond": "If you spend one minute in contemplation when you make an Intelligence or Wisdom check, you can ask the spirits for Advantage on the roll. The GM can refuse if the spirits would have no fitting knowledge.",
  "Spell Resistance": SPR,
  "Ethereal Watcher": "Action: for 1 minute you become a spiritual watcher. As a Bonus Action on your turn you can become ethereal, as in the Etherealness spell. You can return as a Bonus Action when you cast a spell, or when you use Warden's Mark or Warden's Grasp on your turn. When you return, each creature you choose within 10 feet takes 4d10 Force damage. You can cast level 1 and 2 Druid spells you know with no slot. Long Rest to use it again.",
 },
 "lu": [{"feature": "Ethereal Watcher", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Ethereal Watcher": "action"},
 "fx": [[3, "Soulblood", {"notes": [["Note", "Soulblood: Reaction to mark a creature within 5 feet that damages you"]]}],
        [6, "Whispers of Beyond", {"notes": [["Note", "Whispers of Beyond: one minute of contemplation gives Advantage on an Intelligence or Wisdom check (GM may refuse)"]]}],
        [13, "Spell Resistance", {"advOn": ["saving throws against spells"]}]]},

"Storm Sentinel": {"spab": "",
 "f": {
  "Flash from Above": "While under the open sky you can use your action to call a harmless but striking bolt of lightning or peal of thunder, even with no clouds.",
  "Thunderblast": "When you hit a creature you have marked with a melee weapon attack, each creature you choose within 5 feet of the target takes 1d8 Lightning damage.",
  "Static Burst": "When you use Warden's Grasp as a Bonus Action, each creature it affects cannot take Reactions until the start of your next turn.",
  "Evasion": EVA,
  "Stormlord": "You have a flying Speed equal to your Speed. As an action you can call a lightning bolt onto yourself for 1 minute. Your flying Speed doubles. You can cast Call Lightning as a Bonus Action with no slot (DC 8 + your Proficiency Bonus + your Constitution modifier), and call a bolt on later turns as a Bonus Action. Long Rest to use it again.",
 },
 "lu": [{"feature": "Stormlord", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Stormlord": "action", "Flash from Above": "action"},
 "fx": [[3, "Thunderblast", {"notes": [["Note", "Thunderblast: a melee hit on your marked creature deals 1d8 Lightning to creatures of your choice within 5 feet of it"]]}],
        [6, "Static Burst", {"notes": [["Note", "Static Burst: creatures in a bonus-action Warden's Grasp cannot take Reactions until your next turn"]]}],
        [13, "Evasion", {"notes": [["Note", "Evasion: a successful Dexterity save against half-damage effects means no damage"]]}],
        [20, "Stormlord", {"mv": {"fly": "speed"}}]]},

"Verdant Protector": {"spab": "",
 "f": {
  "Green Mark": "Plants hinder a creature you mark. While it is within 30 feet of you, the ground it walks on is Difficult Terrain.",
  "Verdant Skin": "You gain proficiency in Stealth if you lacked it. Action: draw a mass of vines and leaves over yourself. Until you move, you have Advantage on Dexterity (Stealth) checks to hide among vegetation.",
  "Mettle": MET,
  "Form of the Oak Sentinel": "Action: turn into a bark-covered titan for 1 minute. Your AC becomes 20 if it was lower. Your attacks gain Reach if they lacked it. You can use Warden's Grasp as an action, and when you do you can attack each creature it affects, with a separate attack roll for each. Long Rest to use it again.",
 },
 "lu": [{"feature": "Form of the Oak Sentinel", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Form of the Oak Sentinel": "action"},
 "fx": [[3, "Green Mark", {"notes": [["Note", "Green Mark: ground within 30 ft of you is Difficult Terrain for a creature you have marked"]]}],
        [6, "Verdant Skin", {"skills": ["Stealth"], "notes": [["Note", "Verdant Skin: Action to hide among vegetation with Advantage on Stealth until you move"]]}],
        [13, "Mettle", {"notes": [["Note", "Mettle: a successful Constitution save against half-damage effects means no damage"]]}]]},

"Witchbane Hunter": {"spab": "",
 "f": {
  "Witchbane Mark": "You have Advantage on saving throws against the spells and effects of a creature you have marked. A marked creature has Disadvantage on Constitution saving throws to keep Concentration.",
  "Eldritch Reflection": "When you succeed on a saving throw against a spell, you can use your Reaction to cast the spell back at its caster as if it came from you, with the caster as the target. Long Rest to use it again.",
  "Spell Resistance": SPR,
  "Antimage": "Bonus Action: become a breaker of mages, wrapped in antimagic, for 1 minute. You have Advantage on the first attack roll of each of your turns. When you use Warden's Grasp, its area becomes an antimagic field, as in the spell. You can wrap the field around creatures you choose, leaving pockets where magic still works, though magic from there cannot reach the rest of the field. Long Rest to use it again.",
 },
 "lu": [{"feature": "Eldritch Reflection", "lvl": 6, "max": 1, "reset": "long", "tag": "Reaction"},
        {"feature": "Antimage", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action. 1 minute"}],
 "acts": {"Eldritch Reflection": "reaction", "Antimage": "bonus"},
 "fx": [[3, "Witchbane Mark", {"notes": [["Note", "Witchbane Mark: Advantage on saves against spells and effects of your marked creature, which has Disadvantage on concentration saves"]]}],
        [6, "Eldritch Reflection", {"notes": [["Note", "Eldritch Reflection: Reaction after a successful save against a spell to cast it back at the caster"]]}],
        [13, "Spell Resistance", {"advOn": ["saving throws against spells"]}]]},
}

# The old sub fx path reads only skills, exp, langs, senses, res, imm and notes. Everything else (advOn, darkTo, mv ...) goes to GX.sub rows of the fx engine.
_OLD = ("skills", "exp", "langs", "senses", "res", "imm", "notes")
for _n, _o in SUB.items():
    _gx = []
    for _r in _o.get("fx", []):
        _new = {k: v for k, v in _r[2].items() if k not in _OLD}
        for k in _new: del _r[2][k]
        if _new: _gx.append(dict({"l": _r[0], "n": _r[1]}, **_new))
    _o["fx"] = [r for r in _o.get("fx", []) if r[2]]
    if _gx: _o["gx"] = _gx
