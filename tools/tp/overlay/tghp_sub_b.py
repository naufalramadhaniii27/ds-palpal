# Own-wording subclasses of Grim Hollow Player's Guide (2024): Fighter, Monk, Paladin, Ranger.
ALLSK = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"]

# Living Crucible compounds (optional features LC:CO)
COMPOUNDS = [
 ["Adrenal Injection", "For 1 minute, your Speed rises by 10 ft. Once on each of your turns you can jump up to 30 ft by spending 10 ft of movement."],
 ["Allsense Injection", "For 1 minute, you have Blindsight with a range of 30 ft."],
 ["Arcane Eye Oil", "For 1 hour, you sense magical effects within 30 ft. When you sense one, a Magic action lets you see a faint aura on any visible creature or object that carries it, and you learn the school of magic if a spell made it. 1 ft of stone, dirt or wood, 1 inch of metal, or a thin sheet of lead blocks this sense."],
 ["Draught of Bear's Endurance", "For 10 minutes, you have Advantage on Constitution checks and Constitution saving throws."],
 ["Draught of Bull's Strength", "For 10 minutes, you have Advantage on Strength checks and Strength saving throws."],
 ["Draught of Cat's Grace", "For 10 minutes, you have Advantage on Dexterity checks and Dexterity saving throws."],
 ["Draught of Eagle's Splendor", "For 10 minutes, you have Advantage on Charisma checks and Charisma saving throws."],
 ["Draught of Fox's Cunning", "For 10 minutes, you have Advantage on Intelligence checks and Intelligence saving throws."],
 ["Draught of Owl's Wisdom", "For 10 minutes, you have Advantage on Wisdom checks and Wisdom saving throws."],
 ["Elfsight Oil", "For 8 hours, you have Darkvision with a range of 120 ft."],
 ["Fleshknit Phosphate", "For 1 minute, at the start of each of your turns you regain HP equal to your Proficiency Bonus, as long as you have at least 1 HP."],
 ["Ironmind Injection", "For 1 hour, you have Advantage on saving throws to avoid or end the Charmed or Frightened condition."],
 ["Liquid Courage", "You gain Temporary HP equal to twice your Fighter level plus your Constitution modifier. Whatever remains after 1 minute vanishes."],
 ["Liquid Rage", "For 1 minute, your weapon attacks and Unarmed Strikes deal an extra 1d4 damage on a hit."],
 ["Presto Powder", "For 10 minutes, you have Advantage on Initiative rolls and can take the Dash or Disengage action as a Bonus Action."],
 ["Spellshine Ointment", "For 1 minute, you have Resistance to Force, Necrotic, Psychic and Radiant damage."],
 ["Steelskin Ointment", "For 1 minute, you have Resistance to Bludgeoning, Piercing and Slashing damage."],
 ["Tenmen Tincture", "For 1 hour, you count as one size larger for carrying capacity. When you attack with a Melee weapon whose mastery property you can use, you can swap that property for Topple on that attack."],
]
def _comp(l, n, key, title):
    return {"l": l, "k": "opts", "n": n, "key": key, "feature": "Compound Creator", "title": title, "list": COMPOUNDS}

SUB = {
# ---------------------------------------------------------------- Fighter
"Bulwark Warrior": {"spab": "CON",
 "f": {
  "Protective Taunt": "Once per turn, when you hit a creature with a melee weapon attack or Unarmed Strike, you can taunt it. Until the start of your next turn, or until you are Incapacitated, it has Disadvantage on attack rolls against anyone but you. A creature can suffer only one Taunt at a time.",
  "Weather the Storm": "Bonus Action: toughen up for 1 minute. At the end of each of your turns in that time, you gain Temporary HP equal to your Fighter level plus your Constitution modifier. Short or Long Rest to use again.",
  "Threatening Presence": "Magic action: every creature of your choice that can hear you within a 30-ft Emanation makes a Wisdom save (DC 8 + Constitution modifier + Proficiency Bonus). On a fail it takes 5d6 Psychic damage and has Disadvantage on attacks against anyone but you. Using this restores your use of Weather the Storm. You have 2 uses, 3 at Fighter level 15. Long Rest restores all of them.",
  "Aggressive Defense": "Once on each of your turns, when you hit with a Melee weapon or Unarmed Strike attack, you can lose Temporary HP (up to half your Fighter level, round down) to deal that much extra damage to the target.",
  "Improved Second Wind": "When Second Wind restores your HP, you also gain Temporary HP equal to the total of the roll.",
  "Halt the Assault": "Reaction: when an attack roll hits another creature you see within 5 ft of you, change the target to yourself. You have Resistance to all damage from that attack."},
 "lu": [{"feature": "Weather the Storm", "lvl": 3, "max": 1, "reset": "short", "tag": "Bonus Action"},
        {"feature": "Threatening Presence", "lvl": 7, "max": [0,0,0,0,0,0,2,2,2,2,2,2,2,2,3,3,3,3,3,3], "reset": "long", "tag": "Magic action, restores Weather the Storm"}],
 "acts": {"Weather the Storm": "bonus", "Threatening Presence": "action", "Halt the Assault": "reaction"}},

"Living Crucible": {"spab": "INT",
 "f": {
  "Compound Creator": "You learn 3 compounds from the Compound Options, plus 2 more at Fighter levels 7, 10 and 15. When you learn new ones you can also swap one you know. After a Long Rest while holding Alchemist's Supplies, you magically produce any number of your compounds, each in a vial. Unused compounds and vials vanish at your next Long Rest. Drinking one is a Bonus Action. You can drink up to 1 + Constitution modifier (minimum 1) between Long Rests. Several different compounds can be active together, but a second dose of the same one adds nothing. Only you benefit. Any other creature that drinks one makes a Constitution save (DC 8 + Intelligence modifier + Proficiency Bonus) or is Poisoned for 1 minute.",
  "Student of Alchemy": "You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them.",
  "Living Cauldron": "The number of compounds you can drink between Long Rests becomes 3 + Constitution modifier (minimum 1). At Fighter level 18 it becomes 5 + Constitution modifier (minimum 1).",
  "Rapid Consumption": "When you use a Bonus Action to drink a compound, you can drink a second one with it.",
  "Toxin Transmutation": "You have Resistance to Poison damage. As a Bonus Action you can end the Poisoned condition on yourself, and when you do you can gain Temporary HP equal to your Fighter level. Long Rest to gain these Temporary HP again.",
  "Living Catalyst": "After a Long Rest, you can swap one compound you know for another."},
 "lu": [{"feature": "Toxin Transmutation", "lvl": 15, "max": 1, "reset": "long", "tag": "Bonus Action, Temp HP"}],
 "acts": {"Toxin Transmutation": "bonus"},
 "pick": [_comp(3, 3, "lc3", "Compounds (3)"), _comp(7, 2, "lc7", "Compounds (2 more)"), _comp(10, 2, "lc10", "Compounds (2 more)"), _comp(15, 2, "lc15", "Compounds (2 more)")],
 "fx": [[3, "Student of Alchemy", {"notes": [["Note", "Student of Alchemy: Alchemist's Supplies proficiency, doubled Proficiency Bonus on checks with them"]]}],
        [15, "Toxin Transmutation", {"res": ["Poison"]}]]},

"Nightwatcher": {"spab": "",
 "f": {
  "Ever Vigilant": "Darkvision 60 ft. If you already have it, its range grows by 60 ft. You have Advantage on Initiative rolls and Wisdom (Perception) checks. Warning Shout: when you roll Initiative, use a Reaction to alert creatures of your choice within 30 ft that can see or hear you. Each can use a Reaction to gain Advantage on its Initiative roll and move up to half its Speed without Opportunity Attacks. Long Rest to use again.",
  "Skilled Guardian": "Expertise in one skill you are proficient in and lack Expertise in. You also gain proficiency in two skills from Deception, History, Insight, Intimidation, Investigation, Perception and Stealth.",
  "Size Up": "Bonus Action: assess a creature you see within 30 ft. Until the start of your next turn, when it makes an attack roll against you or a creature within 5 ft of you, use a Reaction to give that roll Disadvantage and give the target Resistance to the damage.",
  "Night Stalker": "Blindsight 30 ft for 10 minutes as a Bonus Action (Short or Long Rest to use again). Opportunity Attacks against you have Disadvantage. While you are entirely in Dim Light or Darkness, your movement provokes no Opportunity Attacks.",
  "Ready for Action": "On an Initiative roll, treat a d20 result of 9 or lower as 10. If you roll 18 to 20 on Initiative, you can take one extra action on your first turn, other than the Magic action.",
  "Beat Down": "Right after you miss a creature affected by your Size Up with an attack roll, use a Bonus Action or Reaction to make a melee attack against it if it is in range. You have Advantage on that attack."},
 "lu": [{"feature": "Ever Vigilant", "n": "Warning Shout", "lvl": 3, "max": 1, "reset": "long", "tag": "Reaction"},
        {"feature": "Night Stalker", "lvl": 10, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Warning Shout": "reaction", "Size Up": "bonus", "Night Stalker": "bonus", "Beat Down": "other"},
 "pick": [{"l": 3, "k": "expertise", "n": 1, "from": ALLSK, "feature": "Skilled Guardian", "key": "nw_exp"},
          {"l": 3, "k": "skill", "n": 2, "from": ["Deception", "History", "Insight", "Intimidation", "Investigation", "Perception", "Stealth"], "feature": "Skilled Guardian", "title": "Skilled Guardian: two skills", "key": "nw_sk"}],
 "fx": [[3, "Ever Vigilant", {"senses": [["Darkvision", 60, ""]], "notes": [["Note", "Ever Vigilant: Advantage on Initiative and Wisdom (Perception) checks. If you already had Darkvision, add 60 ft to it"]]}],
        [10, "Night Stalker", {"notes": [["Note", "Night Stalker: Opportunity Attacks against you have Disadvantage. No Opportunity Attacks from your movement while entirely in Dim Light or Darkness"]]}]]},

# ---------------------------------------------------------------- Monk
"Warrior of Pride": {"spab": "",
 "f": {
  "Assertive Attacker": "While you are Bloodied, add your Wisdom modifier to damage dealt with Unarmed Strikes and Monk weapons.",
  "Bruised Ego": "When you spend a Focus Point, you can also gain Temporary HP equal to your Wisdom modifier (minimum 1). While you are Bloodied you gain twice that amount.",
  "Tall Tales": "Proficiency in one skill of your choice from Deception, Intimidation, Performance and Persuasion.",
  "Irrational Retaliation": "Reaction and 1 Focus Point when a creature damages you: you have Advantage on attack rolls against it until the end of your next turn.",
  "Redoubled Efforts": "When you score a Critical Hit while Bloodied, roll one extra damage die for the extra damage.",
  "Ever Prideful": "When you drop to 0 HP without being killed outright, spend 1 Focus Point to enter a trance. In it, you cannot be made Unconscious, you can't speak, you can't cast or concentrate on spells, and a Critical Hit adds only 1 Death Saving Throw failure instead of 2. Each time your turn starts at 0 HP, spend 1 Focus Point to keep the trance going. You make Death Saving Throws as normal.",
  "Egotistical": "You count as Bloodied whenever your current HP is below your HP maximum."},
 "acts": {"Irrational Retaliation": "reaction", "Ever Prideful": "other"},
 "pick": [{"l": 3, "k": "skill", "n": 1, "from": ["Deception", "Intimidation", "Performance", "Persuasion"], "feature": "Tall Tales", "title": "Tall Tales: a skill", "key": "pride_tt"}],
 "fx": [[3, "Bruised Ego", {"notes": [["Note", "Bruised Ego: spending a Focus Point gives Temp HP equal to Wisdom modifier (min 1), doubled while Bloodied"]]}]]},

"Warrior of Regret": {"spab": "",
 "f": {
  "Shade of Regret": "Once per turn, on your turn, spend 1 Focus Point (no action) to make an intangible shade of yourself in an unoccupied space you see within 10 ft. It takes up no space and lasts until the end of your next turn. You can dismiss it (no action) and it ends if you are Incapacitated. Shade Strike: when you use Flurry of Blows, the attacks can come from the shade, and they deal Necrotic or Force damage (your choice) instead of their normal type. Move: Bonus Action to move the shade up to 60 ft to an unoccupied space you see within 60 ft of you.",
  "The Road Not Traveled": "When you take the Dash action, you can skip your movement and instead teleport yourself or an ally within 60 ft to your shade's space.",
  "Aid Not Given": "Bonus Action: take the Help action, or touch a creature to restore HP equal to a roll of your Martial Arts die plus your Wisdom modifier. You can act as though you were in the shade's space.",
  "Crushing Guilt": "Spend 3 Focus Points: creatures of your choice in a 20-ft Emanation from you or your shade make a Wisdom save against your Focus Point save DC. On a fail a creature takes Psychic damage equal to three rolls of your Martial Arts die and is Prone. On a success it takes half damage only.",
  "Relive the Past": "Shade of Regret lasts 10 minutes. After you use Flurry of Blows, your shade can make one more Unarmed Strike as per Shade Strike. You can also use Stunning Strike through Shade Strike."},
 "acts": {"Shade of Regret": "free", "Aid Not Given": "bonus", "Crushing Guilt": "other"}},

"Warrior of the Leaden Crown": {"spab": "WIS",
 "f": {
  "Psionic Prowess": "You know Mage Hand. You can cast it without Verbal or Somatic components and make the hand Invisible. You can also cast spells for Focus Points with a Magic action. 1 Focus Point: Detect Evil and Good or Protection from Evil and Good. 2 Focus Points: Hold Person, Levitate or Shatter. Wisdom is your spellcasting ability for them and they need no Material components.",
  "Subtle Hand": "On your turn your Unarmed Strike reach is 5 ft greater. When you hit with an Unarmed Strike as part of the Attack action on your turn, you can deal Psychic damage instead of its normal type.",
  "Unsubtle Strike": "Once on each of your turns, when you hit with an Unarmed Strike or Monk weapon, you can force the target to make a Strength save against your Focus Point save DC. On a fail, you move it up to 10 ft toward or away from you.",
  "Psychic Crush": "Each Unarmed Strike hit gives the target a Pressure Point. A creature loses all its Pressure Points if you give a different creature one, or after 1 minute. Bonus Action and 1 Focus Point: crush a creature that has 1 or more of your Pressure Points. It loses them all and makes a Strength save against your Focus Point save DC. On a fail it takes 1d8 Force damage per Pressure Point and is Restrained until the end of your next turn. On a success it takes half damage only.",
  "Psionic Mastery": "Magic action and 5 Focus Points: cast Dispel Evil and Good, Hold Monster, Telekinesis or Wall of Force. Wisdom is your spellcasting ability for them and they need no Material components."},
 "acts": {"Psionic Prowess": "action", "Psychic Crush": "bonus", "Psionic Mastery": "action"},
 "fx": [[3, "Subtle Hand", {"notes": [["Note", "Subtle Hand: on your turn Unarmed Strike reach is +5 ft. Unarmed Strike hits in the Attack action can deal Psychic damage"]]}]]},

# ---------------------------------------------------------------- Paladin
"Oath of Pestilence": {"spab": "CHA",
 "f": {
  "Debilitating Fever": "When you hit with a weapon or Unarmed Strike attack, spend one Channel Divinity use to make the target Poisoned for 1 minute. While Poisoned this way it is also Incapacitated. At the end of each of its turns it makes a Constitution save, ending the effect on a success.",
  "Entropic Infection": "Magic action and one Channel Divinity use: pick a creature you see within 30 ft. For 1 minute, it takes an extra 2d6 Necrotic damage whenever you damage it, and it loses Resistance and Immunity to Necrotic damage. At the end of each of its turns it makes a Constitution save against your spell save DC, ending the effect on a success.",
  "Oath of Pestilence Spells": "Always prepared from the listed Paladin levels: 3 Bane, Inflict Wounds. 5 Melf's Acid Arrow, Ray of Enfeeblement. 9 Flash Fever, Stinking Cloud. 13 Blight, Confusion. 17 Contagion, Insect Plague.",
  "Aura of Rampant Sickness": "Reaction: when a creature in your Aura of Protection is about to make a D20 Test, give that test Disadvantage.",
  "Disgusting Resilience": "When you drop to 0 HP without being killed outright, you can spend any number of Hit Point Dice, roll them, and reduce the damage by the total. If you are killed, your corpse bursts. Each creature in a 20-ft Emanation from you makes a Constitution save against your spell save DC, taking 8d6 Necrotic damage on a fail or half as much on a success.",
  "Plaguebringer": "Bonus Action: gain these benefits for 10 minutes or until you end them (no action). Long Rest to use again, or spend a level 5 spell slot (no action). One with Plague: Immunity to Poison damage and the Poisoned condition, and Resistance to Necrotic damage. Bolstered by Rot: your HP maximum can't be reduced. Entropic Radiance: an enemy that starts its turn in your Aura of Protection takes Necrotic damage equal to your Charisma modifier plus Proficiency Bonus."},
 "lu": [{"feature": "Plaguebringer", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Debilitating Fever": "other", "Entropic Infection": "action", "Aura of Rampant Sickness": "reaction", "Plaguebringer": "bonus"}},

"Oath of Slaughter": {"spab": "CHA",
 "f": {
  "Frenzied Slaughter": "Bonus Action and one Channel Divinity use: enter a battle frenzy until the end of your next turn. Reflexive Attack: when you miss with a Melee weapon or Unarmed Strike attack, use a Reaction to attack again with the same weapon. Condition Resistance: Advantage on saves to avoid or end the Charmed, Frightened and Stunned conditions. The frenzy ends early if you are Incapacitated. On your next turn you can extend it another round by making an attack roll against an enemy, forcing an enemy to make a saving throw, or being Bloodied at the end of your turn. Each extension lasts until the end of your next turn, up to 1 minute in all.",
  "Oath of Slaughter Spells": "Always prepared from the listed Paladin levels: 3 Crimson Lash, Inflict Wounds. 5 Bloodletter, Shatter. 9 Fear, Suffocate. 13 Consume Mind, Supernal Smite. 17 Destructive Wave, Incite Riot.",
  "Bloodthirst Aura": "When a Bloodied ally in your Aura of Protection attacks with a weapon or Unarmed Strike, it gains a damage bonus equal to your Charisma modifier. When a Bloodied creature in your Aura saves against a Sangromancy spell, use a Reaction to give it Disadvantage on the save.",
  "Follow Through": "Reaction: when a creature in your Aura of Protection becomes Bloodied, move up to half your Speed (no Opportunity Attacks) and make a Melee weapon or Unarmed Strike attack with Advantage.",
  "Blood Knight": "Bonus Action: gain these benefits for 10 minutes or until you end them (no action). Long Rest to use again, or spend a level 5 spell slot (no action). Crimson Armor: when an enemy makes a creature in your Aura of Protection Bloodied, you gain 30 Temporary HP. Seeing Red: when a creature hits you with an attack roll, use a Reaction to make one melee attack against it with a weapon or Unarmed Strike. Wanton Slaughter: when you hit with a melee weapon or Unarmed Strike attack, any creatures of your choice within 5 ft of the target and within your reach take Force damage equal to your Charisma modifier (minimum +1) plus Proficiency Bonus."},
 "lu": [{"feature": "Blood Knight", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Frenzied Slaughter": "bonus", "Follow Through": "reaction", "Blood Knight": "bonus"}},

"Oath of Zeal": {"spab": "CHA",
 "f": {
  "Mark of the Heretic": "Bonus Action and one Channel Divinity use: mark a creature you see within 30 ft as a heretic for 1 minute. Your weapon and Unarmed Strike attacks against it score a Critical Hit on a 19 or 20. Each time it starts its turn, use a Reaction to make a melee attack against it if it is within reach.",
  "Oath of Zeal Spells": "Always prepared from the listed Paladin levels: 3 Detect Evil and Good, Hunter's Mark. 5 Detect Thoughts, Knock. 9 Fear, Tongues. 13 Divination, Locate Creature. 17 Insect Plague, Scrying.",
  "Aura of Clarity": "You and your allies in your Aura of Protection are Immune to the Blinded condition. A Blinded ally who enters the aura is unaffected by it while inside. You can also see Invisible creatures in your aura.",
  "Compel Confession": "You can cast Zone of Truth without a spell slot. A creature that succeeds on its save takes 1d6 Psychic damage at the start of each of its turns while in your Zone of Truth, until it chooses to fail the save.",
  "Apocalyptic Revelation": "Bonus Action: reveal your enemies' true nature for 1 minute. Long Rest to use again, or spend a level 5 spell slot (no action). Blinding Glory: an enemy that starts its turn within 5 ft of you makes a Constitution save against your spell save DC or is Blinded until the start of its next turn. See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it."},
 "lu": [{"feature": "Apocalyptic Revelation", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Mark of the Heretic": "bonus", "Apocalyptic Revelation": "bonus"},
 "fx": [[7, "Aura of Clarity", {"notes": [["Note", "Aura of Clarity: you and allies in your Aura of Protection are Immune to Blinded. You see Invisible creatures in the aura"]]}],
        [20, "Apocalyptic Revelation", {"notes": [["Note", "Apocalyptic Revelation (active): Truesight 60 ft"]]}]]},

# ---------------------------------------------------------------- Ranger
"Green Reaper": {"spab": "WIS",
 "f": {
  "Envenomed Attack": "Bonus Action: put a poison dose on a weapon or up to 20 pieces of ammunition. It stays potent for 1 minute, and hits with it deal an extra 1d4 Poison damage. Uses equal your Wisdom modifier (minimum 1) per Long Rest. At Ranger level 11 the extra damage is 2d4 and uses return on a Short or Long Rest.",
  "Green Reaper Spells": "Always prepared from the listed Ranger levels: 3 Detect Poison and Disease. 5 Hold Person. 9 Bestow Curse. 13 Greater Invisibility. 17 Cloudkill.",
  "Toxic Tradecraft": "You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. If you lose it, 1 hour of harvesting toxic plants and venomous creatures, during a Short or Long Rest, makes a new one and destroys the old. Once per turn, when you deal Poison damage with a weapon attack, spend a spell slot (no action). The attack deals an extra 1d6 Poison damage and the target is Poisoned until the end of your next turn. You can add a Toxin Effect from the lists below, usually lasting until the end of your next turn. Slot level 1+: Attenuate (Disadvantage on Strength and Dexterity saves), Befuddled (can't speak, read or write, Disadvantage on Concentration saves), Uncoordinated (no Reactions, Disengage or Dodge). Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). Slot level 3+: Lingering (Poisoned for 10 minutes, Disadvantage on saves to end it, and a Constitution save at the end of each of its turns), Supernatural (loses Immunity to Poisoned and is Poisoned for 1 minute, with a Constitution save at each turn end to end it and regain the Immunity). Slot level 4+: Flesh Eating (Poisoned for 1 minute and takes 2d6 Acid damage at the start of each turn), Insensate (also Blinded and Deafened), Paraplegia (Speed 0 and Disadvantage on Dexterity saves). Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice).",
  "Poison Control": "Resistance to Poison damage, and Advantage on saves to avoid or end the Poisoned condition. You can cast Protection from Poison without a slot a number of times equal to your Wisdom modifier (minimum 1) per Long Rest.",
  "Variegated Vexations": "When you would deal Poison damage with a weapon attack, you can change it to Acid or Necrotic damage.",
  "Pain Tolerance": "Reaction: right before a creature you see within 60 ft damages you, gain Temporary HP equal to that damage. Any left at the end of your next turn vanish."},
 "lu": [{"feature": "Envenomed Attack", "lvl": 3, "max": {"f": "mod:WIS", "min": 1}, "reset": "long", "tag": "Bonus Action, Short Rest too from level 11"},
        {"feature": "Poison Control", "n": "Protection from Poison", "lvl": 7, "max": {"f": "mod:WIS", "min": 1}, "reset": "long", "tag": "Free cast"}],
 "acts": {"Envenomed Attack": "bonus", "Pain Tolerance": "reaction"},
 "fx": [[3, "Toxic Tradecraft", {"notes": [["Note", "Toxic Tradecraft: Poisoner's Kit proficiency with doubled Proficiency Bonus"]]}],
        [7, "Poison Control", {"res": ["Poison"], "notes": [["Note", "Poison Control: Advantage on saves to avoid or end the Poisoned condition"]]}]]},

"Primordial Archer": {"spab": "WIS",
 "f": {
  "Elemental Arrows": "Bonus Action: imbue a Longbow or Shortbow for 1 minute. Pick Acid, Cold, Fire, Lightning or Thunder. The weapon deals that type instead of its normal one, plus an extra 1d6 of it on a hit. You can change the choice at the start of each of your turns. Uses equal your Wisdom modifier (minimum 1) per Long Rest.",
  "Herbal Lore": "You gain an Herbalism Kit with proficiency. As a Bonus Action, use it to stabilize an Unconscious creature with 0 HP within 5 ft as if using a Healer's Kit, with no Wisdom (Medicine) check. If you take the Utilize action instead, that creature gains 1 HP. Short or Long Rest to use again.",
  "Primordial Archer Spells": "Always prepared from the listed Ranger levels: 3 Hex. 5 Blindness/Deafness. 9 Call Lightning. 13 Polymorph. 17 Wall of Stone.",
  "Weave the Elements": "With 1 hour of work or after a Long Rest, use an Herbalism Kit to mark yourself with elemental patterns. You gain Resistance to one of Acid, Cold, Fire, Lightning or Thunder (your choice) until your next Long Rest.",
  "Witching Arrows": "Once per turn, when you hit with a ranged attack using a Longbow or Shortbow, spend a level 1+ spell slot (no action) for one effect. Listed damage rises by 2d6 per slot level above 1. Arcing Shot: make a ranged attack with the same weapon against a second creature within 30 ft of the first and in range. Each creature hit takes 2d6 Lightning damage. Entangling Shot: the target makes a Strength save against your spell save DC. On a fail it takes 2d6 Piercing damage and is Restrained for 1 minute, repeating the save at the end of each of its turns. On a success it takes the damage only. Hexing Shot: Wisdom save. On a fail the target takes 2d6 Psychic damage and is Charmed or Frightened (your choice) for 1 minute, repeating the save at each turn end. On a success it takes half damage only. Viper Shot: Constitution save. On a fail the target takes 2d6 Poison damage and is Poisoned for 1 minute, repeating the save at each turn end. On a success it takes half damage only.",
  "Primordial Magic": "Damage can't break your Concentration on Ranger spells you cast. Bonus Action: change the damage type you chose for Weave the Elements to another from its list. When you do, you can pick a creature you see within 30 ft. It makes a Constitution save or takes 6d6 damage of either of those two types (your choice). Uses equal your Wisdom modifier (minimum 1) per Long Rest."},
 "lu": [{"feature": "Elemental Arrows", "lvl": 3, "max": {"f": "mod:WIS", "min": 1}, "reset": "long", "tag": "Bonus Action"},
        {"feature": "Herbal Lore", "lvl": 3, "max": 1, "reset": "short", "tag": "Bonus Action"},
        {"feature": "Primordial Magic", "lvl": 15, "max": {"f": "mod:WIS", "min": 1}, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Elemental Arrows": "bonus", "Herbal Lore": "bonus", "Primordial Magic": "bonus"},
 "pick": [{"l": 7, "k": "opts", "n": 1, "key": "pa_weave", "feature": "Weave the Elements", "title": "Weave the Elements: resistance", "list": [["Acid", "Resistance to Acid damage until your next Long Rest."], ["Cold", "Resistance to Cold damage until your next Long Rest."], ["Fire", "Resistance to Fire damage until your next Long Rest."], ["Lightning", "Resistance to Lightning damage until your next Long Rest."], ["Thunder", "Resistance to Thunder damage until your next Long Rest."]]}],
 "fx": [[3, "Herbal Lore", {"notes": [["Note", "Herbal Lore: Herbalism Kit proficiency"]]}]]},

"Vermin Lord": {"spab": "WIS",
 "f": {
  "Swarming Strikes": "Bonus Action: command all your swarms to take the Attack action, or have one swarm attack twice when it takes the Attack action. Uses equal your Wisdom modifier plus Proficiency Bonus, regained on a Short or Long Rest.",
  "Vermin Lord Spells": "Always prepared from the listed Ranger levels: 3 Consumption. 5 Animal Messenger. 9 Flash Fever. 13 Freedom of Movement. 17 Contagion.",
  "Verminkin": "You understand and can speak with Tiny Beasts. Magic action: spend a spell slot to summon vermin swarms, one per slot level, for 1 hour. Each appears in an unoccupied space you see within 30 ft and uses the Swarm of Vermin stat block. Swarms act on your turn. They move and use Reactions on their own, but only Dodge unless you command them with a Bonus Action (one swarm per Bonus Action) to use a stat block action or another action. Short or Long Rest to use again.",
  "Filth and Fortitude": "You are Immune to the Poisoned condition and gain proficiency in Constitution saving throws.",
  "Infectious Spread": "When you use Swarming Strikes, each swarm that takes the Attack action makes one extra attack. Each creature a swarm damages in that action is Poisoned until the start of your next turn.",
  "Strength of the Swarm": "Reaction: when a creature you see within 10 ft damages you, redirect the damage to a swarm you control that you see within 5 ft of you."},
 "lu": [{"feature": "Verminkin", "lvl": 3, "max": 1, "reset": "short", "tag": "Magic action, spend a slot"},
        {"feature": "Swarming Strikes", "lvl": 3, "max": {"f": "mod:WIS+pb", "min": 1}, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Swarming Strikes": "bonus", "Verminkin": "action", "Strength of the Swarm": "reaction"},
 "fx": [[3, "Verminkin", {"notes": [["Note", "Verminkin: you understand and can speak with Tiny Beasts"]]}],
        [7, "Filth and Fortitude", {"notes": [["Note", "Filth and Fortitude: Immunity to the Poisoned condition and Constitution saving throw proficiency"]]}]]},
}
