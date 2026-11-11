# Own-wording feats of Grim Hollow Campaign Guide (2014 rules). Shapes follow tdm14_feat_a.py.
import importlib.util, os
_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tgh14c_talent.py")
_sp = importlib.util.spec_from_file_location("tgh14c_talent", _p); _t = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_t)
_TF = _t.talent_feats()
ALSO = list(_TF)
FEATS = {
 "Blackpowder Expert": {"d": "Ignore Loading on proficient blackpowder weapons and shoot a creature that moves within 10 ft as a reaction.", "pre": "Proficiency with advanced weapons",
   "full": "**Quick Reload.** You ignore the Loading property of blackpowder weapons you are proficient with.\n**Point-Blank Shot.** When a hostile creature moves within 10 ft of you and you did not move on your last turn, use your reaction to make a ranged weapon attack against it."},
 "Blood Hound": {"d": "Sense moving creatures within 10 ft, no Disadvantage against unseen foes you know of, Advantage on sound and smell checks.", "pre": "Wisdom 13",
   "full": "**Hunter's Senses.** While conscious, you notice any Small or larger creature that moves within 10 ft of you.\n**Track the Unseen.** Your attack rolls have no Disadvantage against invisible creatures you are aware of.\n**Nose and Ears.** You have Advantage on Wisdom (Perception) and Wisdom (Survival) checks that rely on sound or smell."},
 "Hulking Figure": {"d": "Count as one size larger for carrying, +1d4 melee damage with Strength, add Strength to Intimidation against smaller foes.", "pre": "Strength 13",
   "full": "**Big Frame.** You count as one size larger, up to Large, for carrying capacity and the weight you can push, drag and lift.\n**Heavy Hitter.** When you hit with a melee attack made with your Strength modifier, you deal 1d4 extra damage of the weapon's type.\n**Looming.** On a Charisma (Intimidation) check against a creature of your size or smaller, add your Strength modifier to the result."},
 "Iron Gut": {"d": "Advantage on saves against Poisoned, regain one extra Hit Die per Long Rest, and spend Hit Dice as a Short Rest.", "pre": "Constitution 13",
   "full": "**Strong Stomach.** You have Advantage on saves against being Poisoned.\n**Hardy Recovery.** After a Long Rest you regain 1 additional spent Hit Die.\n**Quick Mend.** As an action, you can spend Hit Dice to heal as if you took a Short Rest. You can do this a number of times equal to your Constitution modifier (minimum 1) per Long Rest.",
   "act": "action", "lu": {"n": "Iron Gut: Quick Mend", "max": "mod:CON", "reset": "long", "tag": "Action, spend Hit Dice"}},
 "Lightning Caster": {"d": "A single-target cantrip can hit two enemies within 5 ft of each other, using a bonus action.", "pre": "Able to cast at least one cantrip",
   "full": "When you cast a cantrip that targets only one enemy, you can use your bonus action to target two enemies within 5 ft of each other instead."},
 "Nimble Physique": {"d": "Dodge as a bonus action while unarmored, squeeze like a smaller creature, and move through allies freely.", "pre": "Dexterity 13",
   "full": "**Evasive.** While you wear no armor, you can take the Dodge action as a bonus action. You can do this a number of times equal to your Dexterity modifier (minimum once) per Long Rest.\n**Slim.** You can fit through spaces as if you were one size smaller.\n**Slip Past.** Moving through spaces held by allies costs you no extra movement.",
   "act": "bonus", "lu": {"n": "Nimble Physique: Dodge", "max": "mod:DEX", "reset": "long", "tag": "Bonus action Dodge, unarmored"}},
 "Nocturnal": {"d": "Darkvision 60 ft (or +30 ft, max 120) and Advantage on Stealth in dim light or nonmagical darkness.",
   "full": "**Night Eyes.** You gain darkvision out to 60 ft. If you already have it, its range rises by 30 ft, to a maximum of 120 ft.\n**Dark Hunter.** You have Advantage on Dexterity (Stealth) checks in dim light or nonmagical darkness.",
   "fx": {"senses": [["Darkvision", 60, ""]]}},
 "Scatter Weapon Master": {"d": "Crits double Scatter damage, choose who gets Advantage on the Scatter save, and ignore Loading on scatter weapons.", "pre": "Proficiency with advanced weapons",
   "full": "**Devastating Spread.** On a critical hit, the damage from the Scatter property on a failed save doubles.\n**Pick Your Targets.** When you attack with a Scatter weapon, you can choose any number of targets to have Advantage on the saves it causes.\n**Quick Reload.** You ignore the Loading property of Scatter weapons you are proficient with."},
 "Thrown Weapon Master": {"d": "After throwing with the Attack action, use a bonus action for two more thrown attacks, and draw a new weapon as part of the throw.",
   "full": "**Barrage.** When you take the Attack action to throw a weapon with the Thrown property, you can use a bonus action to make two more thrown attacks. You can do this a number of times equal to your Dexterity or Strength modifier (minimum once) per Short Rest.\n**Quick Draw.** When you throw a weapon as part of an attack, you can draw another one-handed weapon as part of that attack.",
   "act": "bonus", "lu": {"n": "Thrown Weapon Master: Barrage", "max": "mod:DEX", "reset": "short", "tag": "Bonus action, two more thrown attacks"}},
 "Weaver of Maledictions": {"d": "Effigy dolls give targets Disadvantage on the first curse save and hide a failed curse.", "pre": "Able to cast at least one spell",
   "full": "You learn to use effigy dolls in your curses. A doll takes 8 hours to make and works only on the target it was made to resemble. Only you benefit from dolls you made. When you use a doll, the target has Disadvantage on its first save against your curse, and if it succeeds, it does not know you tried to curse it."},
 "Witch Hunter": {"d": "Wisdom save to redirect spells aimed at you, slow spellcasters you hit, and Advantage on saves against curses.",
   "full": "**Spell Ward.** When a hostile creature targets you with a spell, make a Wisdom save against its spell save DC. On a success, the caster must pick a new target or lose the spell. It does not protect you from area effects such as fireball.\n**Hamstring.** When you hit a spellcaster with a melee attack, its speed drops by 10 ft until the start of your next turn.\n**Curse Resistance.** You have Advantage on saves against being cursed."},
}
FEATS.update(_TF)
