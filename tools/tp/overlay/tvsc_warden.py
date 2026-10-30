"""Warden, Valda's Spire of Secrets 2024 (Mage Hand Press). Own wording."""
CLASS = {
 "eq": ["Chain Mail, Shield, Warhammer, 6 Javelins, Dungeoneer's Pack, 15 GP", "130 GP"],
 "f": {
  "Fighting Style": "You gain a Fighting Style feat of your choice. Defense is recommended. Whenever you gain a Warden level, you can swap that feat for a different Fighting Style feat.",
  "Sentinel's Stand": "Choose one of these benefits. Whenever you gain a Warden level, you can swap it for another. **Stalwart Spirit.** You gain proficiency in one saving throw of your choice. **Steadfast Toughness.** Your Hit Point maximum rises by your Constitution modifier plus your Warden level. If you swap this benefit out, the increase goes away. **Tower Shield.** While you hold a Shield, its AC bonus is +3 instead of +2. At Warden level 10 it becomes +4.",
  "Weapon Mastery": "You can use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Halberd and Longsword. After a Long Rest you can practice weapon drills and change one of those choices. At higher Warden levels you master more kinds of weapons, as shown in the Weapon Mastery column.",
  "Guardian Tactics": "You hinder foes and protect allies with these Bonus Actions. **Block.** Choose an ally you can see. Until the start of your next turn, while that ally is within 5 feet of you, its AC equals your AC if yours is higher. It ends early if you or the ally are Incapacitated. **Challenge.** Goad an enemy that can see or hear you. Until the start of your next turn, while it is within 5 feet of you, it has Disadvantage on attack rolls against creatures other than you. It ends early if you are Incapacitated. **Grasp.** Until the start of your next turn, creatures in a 5-foot Emanation around you cannot willingly move farther from you unless they first take the Disengage action. It ends early if you are Incapacitated.",
  "Unyielding Resolve": "While you are Bloodied, you have Resistance to Bludgeoning, Piercing, and Slashing damage.",
  "Extra Attack": "You attack twice instead of once when you take the Attack action on your turn.",
  "Interrupt": "When an enemy within 5 feet of you takes an action that lets it make several attacks or use several abilities, such as Multiattack, you can use your Reaction to stop one of them. You do this before any D20 Test is rolled for that action. You learn which attacks and abilities the enemy uses and choose which one to stop. The enemy makes one fewer attack or uses one fewer ability than normal. **Uses.** You have three uses at level 5. A Short Rest regains one expended use. A Long Rest regains all of them. You gain more uses at higher Warden levels, as shown in the Interrupt column.",
  "Mettle": "When an effect lets you make a Constitution saving throw to take half damage, you take no damage on a success and half damage on a failure. You cannot use this feature while Incapacitated.",
  "Survive": "When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. After you use this, you cannot use it again until you finish a Long Rest.",
  "Sentinel's Strike": "Choose one of these benefits. After a Long Rest you can swap it for another. **Interdict.** When you use Interrupt, you can make a melee attack against that enemy as part of the same Reaction. You also regain one use of Interrupt when you roll Initiative. **Shield Slam.** Once per turn, when you hit a creature within 5 feet with a Melee weapon as part of the Attack action, you can bash it with your equipped Shield. It takes Bludgeoning damage equal to 1d8 plus the Shield's AC bonus. **Sweep.** When you take the Attack action with a Melee weapon, you can instead make one attack against each creature of your choice within 5 feet, with a separate attack roll for each.",
  "Font of Life": "At the start of your turn, you can end one of these conditions on yourself with no action: Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, Stunned, or Restrained. You can use this feature twice. A Short Rest regains one expended use. A Long Rest regains all of them.",
  "Extended Tactics": "Your Guardian Tactics reach 10 feet. Block works on an ally within 10 feet of you, Challenge works on an enemy within 10 feet of you, and Grasp becomes a 10-foot Emanation.",
  "Improved Resolve": "While you are Bloodied, you have Resistance to every damage type except Force, Necrotic, Psychic, and Radiant.",
  "Sentinel's Soul": "Choose one of these benefits. After a Long Rest you can swap it for another. **All-Seeing.** You have Blindsight with a range of 30 feet. If you already have Blindsight, its range grows by 30 feet. **Fortified.** No attack roll has Advantage against you unless you are Incapacitated. **Unstoppable.** You can move through the space of any creature at no extra movement cost, but you cannot stop in that space. If the creature is your size or smaller, it becomes Prone when you enter its space.",
  "Legendary Resistance": "If you fail a saving throw, you can choose to succeed instead. You can do this three times. A Long Rest regains all expended uses.",
 },
 "s": {
  "Sentinel's Stand": "Pick Stalwart Spirit, Steadfast Toughness, or Tower Shield. You can swap on each Warden level.",
  "Sentinel's Strike": "Pick Interdict, Shield Slam, or Sweep. You can swap after a Long Rest.",
  "Sentinel's Soul": "Pick All-Seeing, Fortified, or Unstoppable. You can swap after a Long Rest.",
 },
 "res": [{"n": "Interrupt", "tag": "Short Rest 1, Long Rest all", "reset": "long", "max": "col:Interrupt"}],
 "lu": [
  {"feature": "Survive", "n": "Survive", "lvl": 9, "max": 1, "reset": "long", "tag": "Drop to 1 HP"},
  {"feature": "Font of Life", "n": "Font of Life", "lvl": 13, "max": 2, "reset": "long", "tag": "Short Rest regains 1"},
  {"feature": "Legendary Resistance", "n": "Legendary Resistance", "lvl": 20, "max": 3, "reset": "long", "tag": "Succeed on a save"},
 ],
 "acts": {"Guardian Tactics": "bonus", "Interrupt": "reaction", "Font of Life": "free"},
}
