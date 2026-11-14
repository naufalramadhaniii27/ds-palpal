# Own-wording Paladin oaths of Valda's Spire of Secrets, 2014 rules. Oath spells come from the source spell tables.
SUB = {
 "Oath of Eternal Night": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Cover of Darkness: As a bonus action, spend a use of Channel Divinity to create a 15-ft-radius sphere of magical darkness centered on a point you see within 30 ft. It spreads around corners and lasts 1 minute. You can see through it. Shrouded Armor: As an action, spend a use of Channel Divinity to wrap armor you wear in shadow from the Plane of Shadow. It reflects no light. You add your Charisma modifier to Dexterity (Stealth) checks while wearing it, and it imposes no Disadvantage on Stealth. This lasts 8 hours or until you end it on your turn, remove the armor or fall unconscious.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of Eternal Night": "You hold to three tenets. None Are Exempt: rulers answer to their own laws. Good of The Many: the many outweigh the few, and you shield the weak from the powerful. Knight of Night: justice not done in daylight is restored in the dark.",
   "Slip Into The Shadows": "You and friendly creatures within 10 ft can take the Hide action as a bonus action. At level 18 the range is 30 ft.",
   "Cloak of Night": "When you take damage, use your reaction to shed flakes of darkness. The next attack roll against you before the start of your next turn has Disadvantage.",
   "Shadow Form": "As an action, become a shadow stalker for 1 hour. While you are in dim light or darkness you have Advantage on Strength, Dexterity and Constitution checks. As a bonus action you can teleport up to 60 ft to an unoccupied space you see that is also in dim light or darkness. Once on each of your turns when you hit with a melee weapon attack, you deal extra 3d6 Necrotic damage. Long Rest to use again."
  },
  "acts": {
   "Cloak of Night": "reaction",
   "Shadow Form": "action"
  },
  "lu": [
   {
    "feature": "Shadow Form",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "1 hour, extra 3d6 Necrotic"
   }
  ]
 },
 "Oath of Heresy": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Blaspheme: As an action, spend a use of Channel Divinity and speak shaking heresy. Each creature you choose within 30 ft makes a Wisdom save. On a failure it takes 2d6 Psychic damage per point of your Proficiency Bonus and is Deafened for 1 minute. On a success it takes half damage and is not Deafened. Turn The Holy: As an action, spend a use of Channel Divinity. Each celestial that sees or hears you within 30 ft, and each humanoid within range that casts 1st-level or higher spells with Wisdom, makes a Wisdom save. On a failure it is turned for 1 minute or until it takes damage. A turned creature must move as far from you as it can, cannot willingly end within 30 ft of you and cannot take reactions. It can only Dash or try to escape an effect that holds it. With nowhere to go it can Dodge.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of Heresy": "You vow to follow three tenets. Spread The Revolution: share the truth with everyone, by sword if words fail. Defy Convention: break laws that bind the truth. Speak Truth To Power: confront the mighty and do not let them look away.",
   "Godless Aura": "When a creature other than you within 10 ft regains hit points, you can make the healing fail. You can also use your reaction to cast counterspell with no slot or components, to stop a spell of 1st level or higher cast within 10 ft by a creature that casts with Wisdom. At level 18 the range is 30 ft.",
   "Implacable Will": "When you fail a saving throw, you can reroll it with Advantage and must use the new roll. Long Rest to use again.",
   "Apostate": "As an action, assume an anti-divine form for 1 minute. You can use Blaspheme as a bonus action without spending Channel Divinity, and it then deals 4d6 Psychic damage on a failure and half on a success. You gain 20 temporary hit points at the start of each of your turns. Long Rest to use again."
  },
  "acts": {
   "Godless Aura": "reaction",
   "Apostate": "action"
  },
  "lu": [
   {
    "feature": "Implacable Will",
    "lvl": 15,
    "max": 1,
    "reset": "long",
    "tag": "Reroll a failed save with Advantage"
   },
   {
    "feature": "Apostate",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "1 minute, 20 temp HP each turn"
   }
  ]
 },
 "Oath of Revelry": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Conjure Drink: After a Long Rest, spend a use of Channel Divinity to fill your flask with heavenly ale. Up to three creatures can drink from it. Each has Advantage on its next saving throw before its next Long Rest. Any ale left becomes mundane when you take a Short Rest. Song And Dance: As an action, spend a use of Channel Divinity to dance a catchy jig. Each creature you choose within 15 ft makes a Wisdom save or joins in, and keeps dancing as long as you do. Creatures immune to being Charmed are unaffected. You can end it on your turn. A creature can retry the save at the end of its turn. A dancer spends its movement shuffling in place, and has Disadvantage on Dexterity saves and Dexterity-based attack rolls.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of Revelry": "Many revelers follow a code of party conduct, built on these ideas. The Party Don't Stop: every occasion deserves a celebration with everyone invited. Work Hard, Party Hard: a good bash needs planning and effort. Fight For Your Right To Party: remind those who block you what fun is, or go around them.",
   "Aura of Fraternity": "While at least one ally is adjacent to you, you and each ally within 5 ft deal extra 1d4 damage on melee attacks. At level 18 the range is 15 ft.",
   "Merrymaker": "When you or a friendly creature within 30 ft makes an ability check or saving throw without Disadvantage, you can give it Advantage. Three uses, all regained on a Long Rest.",
   "Party Animal": "As an action, sprout satyr horns and emit a 30-ft aura of gaiety for 1 minute. You and friendly creatures in it cannot be Blinded, Deafened, Poisoned or gain Exhaustion. At the start of each of your turns, you and each friendly creature there that is not incapacitated regains 10 hit points. Long Rest to use again."
  },
  "acts": {
   "Party Animal": "action"
  },
  "lu": [
   {
    "feature": "Merrymaker",
    "lvl": 15,
    "max": 3,
    "reset": "long",
    "tag": "Grant Advantage on a check or save"
   },
   {
    "feature": "Party Animal",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "1 minute aura, heal 10 per turn"
   }
  ]
 },
 "Oath of Storms": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Thunderous Revenge: Right after a creature you see within 30 ft damages you with an attack, spend a use of Channel Divinity and your reaction. The attacker makes a Wisdom save. On a failure it takes Lightning damage equal to the damage it dealt you, or half on a success. Walk On Waves: As a bonus action, spend a use of Channel Divinity. For 1 hour you gain the benefits of water walk, and your speed doubles while you walk on water.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of The Storm": "Storm knights swear on sea superstitions. Safe Harbor: protect sailors and captains who respect the sea's laws. Howling Gales: let the winds steer you, often into storms. Thunderous Castigation: answer every slight, large or small, with equal reprisal.",
   "Vortex Aura": "As a bonus action, summon a strong wind in a 10-ft radius until you dismiss it on your turn. The area is difficult terrain for others. The wind puts out unprotected flames and disperses gas and vapor. At level 18 the radius is 30 ft and you can exempt creatures.",
   "Storm Soul": "You have Resistance to Lightning damage. When a creature within 5 ft attacks you while you are not incapacitated, it takes Lightning damage equal to your Charisma modifier.",
   "Thunder God": "As an action, take a tempest form for 1 minute. You are immune to Lightning and Thunder damage and have a flying speed of 60 ft. You cast call lightning as a 5th-level spell as a bonus action with no slot or components, and on later turns use a bonus action to call down the bolt. Long Rest to use again."
  },
  "acts": {
   "Vortex Aura": "bonus",
   "Thunder God": "action"
  },
  "lu": [
   {
    "feature": "Thunder God",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "1 minute, fly 60, call lightning"
   }
  ],
  "fx": [
   [
    15,
    "Storm Soul",
    {
     "res": [
      "Lightning"
     ]
    }
   ]
  ]
 },
 "Oath of The Sun": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Glorious Radiance: As an action, spend a use of Channel Divinity and radiate sunlight. You shed bright light in 30 ft and gain temporary hit points equal to your paladin level + your Charisma modifier. When a creature hits you with a melee attack while you have them, use your reaction to deal 5 Radiant damage to it (10 at level 11, 15 at level 17). This lasts 1 hour, or until the hit points are gone or you dismiss it on your turn. Solar Flare: As an action, spend a use of Channel Divinity and emit a blinding flash. Each creature you choose within 20 ft makes a Constitution save or is Blinded for 1 minute. It can repeat the save at the end of each of its turns.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of The Sun": "The oath is taken in public at noon. The Sun Rises: spread your faith and knowledge every day. The Sun Blazes: let the sun's light burn away impurity in those who fear it. The Sun Sets: give your fury rest in the service of mercy, though only for those who deserve it.",
   "Sun's Warmth": "You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. When you deal Fire damage you can deal Radiant instead, and the reverse. At level 18 the range is 30 ft.",
   "Incandescent Fury": "The damage die of your Improved Divine Smite becomes a d10.",
   "Zenith": "As an action, you can cast sunbeam with no spell slot. For the spell's duration, at the start of each of your turns you regain hit points equal to your Charisma modifier if you are at half your hit points or less. Long Rest to use again."
  },
  "acts": {
   "Zenith": "action"
  },
  "lu": [
   {
    "feature": "Zenith",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "Cast sunbeam free"
   }
  ]
 },
 "Oath of Winter": {
  "spab": "Charisma",
  "f": {
   "Channel Divinity": "You gain two Channel Divinity options. Ice Armor: As a bonus action, spend a use of Channel Divinity to coat your armor in ice. You gain temporary hit points equal to twice your paladin level + your Charisma modifier. Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. North Wind: As an action, spend a use of Channel Divinity and breathe a frigid wind in a 30-ft cone. Each creature makes a Constitution save. On a failure it takes 2d6 Cold damage per point of your Proficiency Bonus and its speed is halved until the start of your next turn. On a success it takes half damage and keeps its speed. A creature killed by it becomes a frozen statue until it thaws.",
   "Oath Spells": "You always have these oath spells prepared at the paladin levels in the Oath Spells table of the book. They do not count against the number of spells you prepare.",
   "Tenets of Winter": "Your concord with Father Winter rests on these. Winter's Snow: winter is harsh but not wholly evil. Winter's Wind: shield the innocent from frigid dangers. Winter's Throne: never try to unseat Father Winter, whatever his reign. Seasons change, your oath does not.",
   "Frigid Aura": "You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. At level 18 the range is 30 ft.",
   "Iceflesh": "When you take damage or become Blinded, Deafened, Paralyzed, Petrified or Poisoned, use your reaction to freeze your blood. The damage or condition is held off for 1 minute and then takes effect. Durations of self-only condition spells pause, and concentration on them is not needed until then. You can hold one effect at a time. After use, wait 1 minute before using it again.",
   "Father Winter": "As an action, become an effigy of Father Winter for 1 hour. You are immune to Cold damage. A creature within 5 ft that damages you while you are not incapacitated takes 2d10 Cold damage. You emit a 10-ft-radius aura of frozen ground that is difficult terrain, and you can exempt creatures. On your turn you can pull heat from the room and put out nonmagical fires you see within 30 ft, with no action. Long Rest to use again."
  },
  "acts": {
   "Iceflesh": "reaction",
   "Father Winter": "action"
  },
  "lu": [
   {
    "feature": "Father Winter",
    "lvl": 20,
    "max": 1,
    "reset": "long",
    "tag": "1 hour, Cold immunity, aura"
   }
  ],
  "fx": [
   [
    7,
    "Frigid Aura",
    {
     "res": [
      "Cold",
      "Fire"
     ]
    }
   ]
  ]
 }
}
