# Own-wording Gunslinger's Creeds, Valda's Spire of Secrets 2014 rules. Uses the Deed save DC of the class.
def _u(f, lvl, mx, rs, tag, n=None):
    r = {"feature": f, "lvl": lvl, "max": mx, "reset": rs, "tag": tag}
    if n: r["n"] = n
    return r
SUB = {
"Covert Operative": {"spab": "",
 "f": {
  "Covert Operative": "You defeat enemies by stealing what they know and feeding them lies. Your training gives you tools beyond the gun.",
  "Secret Agent Training": "You gain proficiency in two tool sets from: disguise kit, thieves' tools, land vehicles, water vehicles. You also gain two skills from: Investigation, Sleight of Hand, Stealth, Survival. You add double your Proficiency Bonus to checks that use these tools or skills.",
  "Sneaky Shot": "When you take the Dash or Disengage action on your turn, you can make one firearm attack as a bonus action.",
  "Concealed Gear": "Gear you carry, except weapons and armor that is not light, cannot be spotted by a casual observer. A creature making a thorough search of you makes an Intelligence (Investigation) check against DC 13 + your Intelligence modifier + twice your Proficiency Bonus.",
  "Fieldcraft": "You cannot be surprised while you are conscious. You can use a bonus action to make a Wisdom (Perception) check to spot hidden creatures.",
  "Risky Mission": "You can spend two risk dice to perform two deeds in the same turn.",
  "License to Kill": "When you hit with a firearm attack, you can spend a risk die and add it to the damage roll.",
 }, "lu": [], "acts": {"Sneaky Shot": "bonus"}, "fx": []},

"Grenadier": {"spab": "",
 "f": {
  "Grenadier": "High explosives solve most problems. You specialize in demolitions and anything that detonates at range.",
  "Heavy Ordinance": "Weapons with the Explosive property use your Deed save DC if it is higher than theirs. From level 5, once per turn when you hit with an Explosive firearm, you deal an extra 1d8 damage.",
  "High Explosive": "When you attack with a weapon that has the Explosive property, you can use your bonus action to double the blast radius.",
  "Lock and Load": "As a bonus action at the end of your turn, you can reload any weapon you hold that has the Reload property and takes more than 1 action to reload.",
  "Mortar Shot": "When you attack with an Explosive weapon you can fire in an arc. The attack ignores cover unless the target has cover from above.",
  "Clusterbomb": "As an action, load and fire a cluster projectile with the weapon's range. It bursts in a 20-foot radius. Each creature there makes a Dexterity save against your Deed save DC with Disadvantage, taking 10d6 fire damage on a failure or half on a success. Long Rest to use it again.",
 }, "lu": [_u("Clusterbomb", 14, 1, "long", "Action. 20-foot radius")], "acts": {"High Explosive": "bonus", "Lock and Load": "bonus", "Clusterbomb": "action"}, "fx": []},

"Gundead": {"spab": "",
 "f": {
  "Gundead": "Your soul is shattered into fragments, hanging between life and death, which lets you wield dark powers of the gun one shot at a time.",
  "Dead Shot": "As an action, or as a reaction when you reduce a humanoid to 0 hit points with a ranged firearm attack, shoot a humanoid corpse so it rises as a zombie under your control, as with Animate Dead. These undead crumble after 1 minute. The time becomes 10 minutes at level 7, 1 hour at level 10 and 24 hours at level 14. Short or Long Rest to use it again. From level 10 you can use it twice between rests.",
  "Gun Soul": "When you hit with a ranged firearm attack, you can use your bonus action to deal extra necrotic damage equal to your Proficiency Bonus.",
  "Sleep of the Dead": "While you stay motionless you look like a corpse.",
  "Grave Whisperer": "You can talk with undead as if you shared a language. You have Advantage on Charisma checks to interact with undead that understand a language.",
  "Ghost Bullet": "Creatures you raise with Dead Shot rise as ghouls instead of zombies. Otherwise Animate Dead applies.",
 }, "lu": [_u("Dead Shot", 3, [0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], "short", "Action or reaction")],
 "acts": {"Dead Shot": "action", "Gun Soul": "bonus"}, "fx": []},

"Janissary": {"spab": "",
 "f": {
  "Janissary": "You were among the first to see how gunpowder reshapes war, using the newest weapons along with new tactics, organization and logistics.",
  "Coordinated Volley": "Once on each of your turns, when you attack with a firearm a target within normal range that an ally hit with a firearm attack since the end of your last turn, you have Advantage on the attack.",
  "Masterwork Weapons": "Firearms you wield never jam or misfire, even underwater, and any spell or effect that would make your weapons or ammunition malfunction fails automatically.",
  "Steel Discipline": "You have Advantage on saves against illusion spells and on checks to see through or disbelieve illusions.",
  "Influence": "When you make a Charisma check to influence a humanoid, you can spend a risk die and add the roll to the result, after you roll but before the outcome is known.",
  "Defensive Formation": "While you are within 10 feet of an ally who is not unconscious, you have cover against ranged attacks. If you stand directly behind that ally you have full cover.",
 }, "lu": [], "acts": {}, "fx": []},

"Storm Gunner": {"spab": "",
 "f": {
  "Storm Gunner": "Overkill is a silly idea. You rain bullets on foes with automatic weapons and sprint around the field.",
  "Bullet Hell": "Once per turn when you attack twice with Disadvantage using an Automatic firearm, you can spend a risk die to make one attack roll with Disadvantage against each target within normal range, up to the number you rolled on the die.",
  "Concentrated Fire": "When you attack with Disadvantage using an Automatic firearm, you have +2 to attack rolls. This does not stack with Archery or Bullseye.",
  "Ammunition Belt": "As an action, load each Automatic firearm you hold with an extended belt. While you hold it, it needs no reloading, though it uses ammunition as normal.",
  "Running Riot": "Your base walking Speed increases by 10 feet.",
  "Riddle with Holes": "When you use an Automatic firearm to attack automatically, you can make the attacks without Disadvantage. If a feature such as Mankiller would add an ability modifier to the damage, you do not add it to these attacks. When you use an area attack such as the Spray and Pray feat, you can exclude creatures you pick from its saves and damage.",
 }, "lu": [], "acts": {}, "fx": [[10, "Running Riot", {"notes": ["Speed +10 feet"]}]]},

"Twice-Damned": {"spab": "",
 "f": {
  "Twice-Damned": "Someone wronged you and you will not die before you shoot them. The gun is your tool of vengeance.",
  "Black Bullet": "When you damage a creature with a ranged firearm attack, its hit point maximum drops for 1 hour by the damage dealt. Anything that removes a disease also restores this loss. When you damage a creature below half its hit points with a firearm, you can use a bonus action to add 1d6 necrotic damage, 2d6 from level 11.",
  "Hateful Vengeance": "Pick one specific creature that wronged you, which you can name or identify. Your attack rolls against it have Advantage and deal maximum damage. You can change the pick only if you learn it was innocent and another creature was responsible.",
  "Grim Determination": "You have Advantage on saves against being frightened.",
  "Shotgun Interrogation": "You have Advantage on Charisma (Intimidation) checks while you hold a firearm, and you can treat a roll of 10 or lower as 10.",
  "Marked for Death": "When you roll initiative, pick a creature you see within 60 feet. If you reduce it to 0 hit points on your turn in the next minute, you gain one extra action to Attack, Dash, Dodge, Disengage or Hide.",
 }, "lu": [], "acts": {"Black Bullet": "bonus"}, "fx": []},

"Gun Tank": {"spab": "",
 "f": {
  "Gun Tank": "Requires Strength 15 or higher. You are a living siege engine, wading in with weapons most people cannot lift.",
  "Heavy Gunner": "You can carry heavy firearms regardless of their weight. You can use Strength instead of Dexterity for attack and damage with heavy firearms and for your Deed save DC.",
  "Tough As Nails": "Your hit point maximum rises by 1, and by 1 again each time you gain a Gunslinger level. You gain proficiency with medium and heavy armor.",
  "Thick-Headed": "You have Advantage on saves against being charmed.",
  "Strong as an Ox": "Your carrying capacity and the weight you can push, drag and lift are doubled. You have Advantage on Strength checks and saves. You can ignore the Two-Handed property of firearms you are proficient with.",
  "Gun Rage": "As a bonus action, rage for 1 minute. You have resistance to bludgeoning, piercing and slashing damage and make one extra attack when you take the Attack action. Your Speed is halved and you have Disadvantage on Dexterity checks and saves. It ends if you take cover, end your turn without attacking, or choose to end it as a bonus action. Short or Long Rest to use it again.",
 }, "lu": [_u("Gun Rage", 14, 1, "short", "Bonus action. 1 minute")], "acts": {"Gun Rage": "bonus"},
 "grant": {"f": "Tough As Nails", "armor": [[3, "Medium, Heavy"]]}, "fx": []},

"Gun-Ko Master": {"spab": "",
 "f": {
  "Gun-Ko": "You treat firearms as melee weapons with the Finesse property that deal 1d6 bludgeoning damage, or 1d8 if the firearm is Two-Handed. When you make a ranged firearm attack against a creature within 5 feet, you can make a melee attack with that firearm as a bonus action.",
  "Gun-Ko Master": "The art of gun-ko treats the gun as the perfect weapon, as deadly in melee as at range.",
  "Point-Blank Shot": "Being within 5 feet of a hostile creature does not give you Disadvantage on ranged firearm attack rolls.",
  "Bullet-Catch": "As a reaction when a ranged weapon attack hits you, deflect or catch the projectile and reduce the damage by 1d10 + your Dexterity modifier + your Proficiency Bonus.",
  "Lightning Disarm": "As a bonus action, spend a risk die to disarm a creature within 5 feet that holds a firearm. It makes a Dexterity save against your Deed save DC. On a failure you take the firearm. You need at least one empty hand.",
  "Predictive Dodge": "As a bonus action, pick a creature you see within 30 feet. Until the start of your next turn you get the benefits of Dodge against its ranged attacks and effects. You lose this if it damages you.",
  "Gatling Strikes": "As a bonus action, make two melee weapon attacks and one firearm ranged attack against targets within 15 feet. Short or Long Rest to use it again.",
 }, "lu": [_u("Gatling Strikes", 14, 1, "short", "Bonus action")], "acts": {"Gun-Ko": "bonus", "Bullet-Catch": "reaction", "Lightning Disarm": "bonus", "Predictive Dodge": "bonus", "Gatling Strikes": "bonus"}, "fx": []},

"High Roller": {"spab": "",
 "f": {
  "High Roller": "You mix card sharp and dice thrower with gunplay. You push your luck until it runs out, then push harder.",
  "All In": "As a bonus action when you make an ability check or attack roll, or a reaction for a saving throw, spend and roll a risk die after seeing the d20 but before the GM says if it succeeds. If the die shows a 1, the roll fails regardless. Otherwise add the die to the result.",
  "Bonus Proficiencies": "You gain proficiency with all gaming sets and one skill of your choice: Deception, Insight or Perception.",
  "Liar's Dice": "When you make an ability check, attack roll or saving throw, you can roll the d20 in secret and declare any result. If the GM calls your bluff, reveal the die. If you told the truth, treat it as a 20. If you lied, roll again and take the lower. If the GM does not call it, your declared result stands. You can do this a number of times equal to 1 + your Charisma modifier (minimum 1), regained on a Long Rest.",
  "Risky Business": "When you make an attack roll against a hostile creature, or a hostile creature forces you to save, you can roll with Disadvantage. If you do, you regain one expended risk die.",
  "Boom and Bust": "When you score a critical hit with a ranged firearm attack, you can roll the damage twice and use the higher. When you roll a 1 on a ranged firearm attack roll, you can take psychic damage equal to your Proficiency Bonus or lose this critical hit benefit for 1 minute.",
  "Double or Nothing": "When you score a critical hit with a firearm, you can roll two more d20s as ranged attack rolls against the target. If both miss, the critical hit becomes a normal hit. If either would crit, roll all of the attack's damage dice three times, not twice. Otherwise the critical hit works as normal.",
 }, "lu": [_u("Liar's Dice", 3, {"f": "1+mod:CHA", "min": 1}, "long", "Roll in secret")],
 "acts": {"All In": "bonus"}, "grant": {"f": "Bonus Proficiencies", "tools": [[3, "Gaming Sets (all)"]]}, "fx": []},

"Musketeer": {"spab": "",
 "f": {
  "Musketeer": "A swashbuckling shooter. Blunderbusses, flintlocks and muskets are your tools, with a bayonet or blade in the other hand.",
  "Bonus Proficiencies": "You gain proficiency with the bayonet, cutlass, halberd, rapier and shortsword.",
  "Heavy Shot": "Whenever you hit with a blunderbuss, flintlock or musket, you deal extra damage equal to the number of damage dice rolled for the attack.",
  "Lock, Stock, and Barrel": "You ignore the Loading and Misfire properties of the blunderbuss, flintlock and musket.",
  "Bayonet Charge": "When you move at least 15 feet in a straight line on your turn, you can use your bonus action to make one attack with a bayonet or melee weapon.",
  "All For One": "As a reaction when a friendly creature within 5 feet is targeted by an attack, make a firearm attack against the attacker.",
 }, "lu": [], "acts": {"Bayonet Charge": "bonus", "All For One": "reaction"},
 "grant": {"f": "Bonus Proficiencies", "weapons": [[3, "Bayonet, Cutlass, Halberd, Rapier, Shortsword"]]}, "fx": []},

"Pistolero": {"spab": "",
 "f": {
  "Pistolero": "More bullets mean more power. Not every shot needs to be accurate to count.",
  "Fan The Hammer": "When you take the Attack action with a firearm, you can spend a risk die as a bonus action to make two additional ranged attacks with that weapon, always with Disadvantage. The weapon cannot have Automatic or Two-Handed, and you need a free hand. At level 14 you make three additional attacks.",
  "Point-Blank Shot": "Being within 5 feet of a hostile creature does not give you Disadvantage on ranged firearm attack rolls.",
  "Speed Loader": "On your turn you can reload one one-handed firearm without using an action or bonus action.",
  "Bullet Time": "When you make a ranged attack with a one-handed firearm on your turn, you can use your bonus action to gain Advantage on it. Short or Long Rest to use it again.",
  "Swift Vengeance": "As a reaction when a creature within 15 feet damages you, make a firearm attack against it.",
 }, "lu": [_u("Bullet Time", 10, 1, "short", "Bonus action")], "acts": {"Fan The Hammer": "bonus", "Bullet Time": "bonus", "Swift Vengeance": "reaction"}, "fx": []},

"Sharpshooter": {"spab": "",
 "f": {
  "Sharpshooter": "A well-placed bullet beats a sword, arrow or spell. Every fight should end with one loud crack and a long silence.",
  "Eagle Eye": "When you attack with a firearm you hold in two hands, you can use a bonus action to spend a risk die and add it to the attack roll. The attack has no Disadvantage for long range.",
  "Sniper's Stance": "You do not have Disadvantage on ranged firearm attacks from being prone. Standing up from prone costs 5 feet of movement instead of half your Speed.",
  "Camouflage": "Spend 1 minute preparing camouflage. Until you move, you have Advantage on Dexterity (Stealth) checks to hide, your attacks while hidden do not reveal your position automatically, and creatures have Disadvantage on checks to find the source of your firearm attacks.",
  "Eye For Movement": "As a bonus action you gain darkvision and See Invisibility against targets 30 feet or farther away until the end of your next turn. You can use it only if you have not moved this turn, and your Speed is 0 until the end of the turn.",
  "Focused Shot": "When you use the Attack action to make only one ranged firearm attack and do not have Disadvantage, you can gain Advantage on it and deal damage as if it were a critical hit.",
 }, "lu": [], "acts": {"Eagle Eye": "bonus", "Eye For Movement": "bonus"}, "fx": []},

"Spellslinger": {"spab": "INT", "third": {"list": "Wizard", "ab": "INT", "cant": 3},
 "f": {
  "Spellslinger": "Magic and guns are alike. You are the gun, directing spells with precision, loading arcane charges into your shots.",
  "Bang, You're Dead!": "You can use deeds with finger guns spell attacks. When you hit with finger guns, you can spend a risk die as a bonus action to deal extra 1d8 force damage.",
  "Spellcasting": "You add spells to your bullets. Cantrips. You learn Finger Guns and two other wizard cantrips, and one more wizard cantrip at level 10. Slots. The Spellslinger table gives your slots, which a Long Rest restores. Spells known. You know three 1st-level wizard spells, two of them abjuration or evocation. More come as the table shows, each abjuration or evocation of a level you have slots for, except those learned at levels 8, 14 and 20, which can be any school. When you gain a level you can swap a known spell for another allowed one. Ability. Intelligence.",
  "Rune-Carved Cartridges": "Firearms you use count as magical for overcoming resistance and immunity to nonmagical attacks.",
  "Spellshot": "When you use your action to cast a cantrip, you can use your bonus action to make one ranged firearm attack or a ranged spell attack with Finger Guns.",
  "Magic Bullet": "As an action, fire a bullet with Magic Missile magic from a firearm at a target within normal range. You do not roll. It hits automatically and deals force damage. Long Rest to use it again.",
  "Improved Spellshot": "When you use your action to cast a spell, you can spend a risk die as a bonus action to make one ranged firearm attack or Finger Guns spell attack. If the spell needs a spell attack roll, you can swap it for a ranged firearm attack. Add the risk die to the firearm attack roll. On a hit the attack deals its normal damage in addition to the spell's effects.",
 }, "lu": [_u("Magic Bullet", 10, 1, "long", "Action. Auto hit")], "acts": {"Spellshot": "bonus", "Magic Bullet": "action", "Improved Spellshot": "bonus"}, "fx": []},

"Trick Shot": {"spab": "",
 "f": {
  "Trick Shot": "Accuracy means hitting after the bullet bounces a dozen times. Your attacks stay dangerous even when they miss.",
  "Creative Trajectory": "Your firearm attacks ignore cover.",
  "Ricochet": "When you miss with a firearm attack and have no Disadvantage, you can use your bonus action to reroll the attack roll and must use the new roll. If this makes it hit, it deals only half damage.",
  "Light-Footed": "Difficult terrain costs you no extra movement.",
  "Deft Deflectionist": "As a reaction when an attacker you see makes a ranged weapon attack against you, make an attack with a firearm you hold to deflect it. If your roll beats the attacker's, its attack has Disadvantage. Use this before you know the outcome.",
  "Pinball Shot": "Once per turn when you hit a creature with a ranged firearm attack, you can ricochet to a second target within half the firearm's range of the first, with a separate attack roll. You can do this a number of times equal to your Dexterity modifier (minimum 1), regained on a Long Rest.",
 }, "lu": [_u("Pinball Shot", 14, "mod:DEX", "long", "Once per turn")], "acts": {"Ricochet": "bonus", "Deft Deflectionist": "reaction"}, "fx": []},

"White Hat": {"spab": "",
 "f": {
  "White Hat": "You live by a code and expect others to. You keep friends safe and bring enemies in alive, which they rarely allow.",
  "Lay Down The Law": "As a bonus action, spend a risk die and roll it. You gain a pool of Temporary HP equal to the roll + your Gunslinger level, which you split among any creatures other than you that you see within range of a firearm you hold, giving each at least 1. When a creature loses these Temporary HP to an attack, you can use your reaction to make a ranged firearm attack against the attacker. Leftover points vanish at the start of your next turn. At level 10 the pool is the roll + twice your Gunslinger level.",
  "Steely-Eyed Aura": "While you are conscious, you and friendly creatures within 10 feet have Advantage on saves against being frightened.",
  "Reach For The Skies": "As an action, call for surrender. A creature you pick within 30 feet that sees or hears you makes a Wisdom save (DC 8 + Proficiency Bonus + Charisma modifier). Creatures immune to frightened succeed. A creature at or above half its hit point maximum has Advantage. On a failure it is incapacitated and its Speed is 0 for 1 minute or until it takes damage. It can repeat the save at the end of each of its turns. Long Rest to use it again.",
  "Long Arm of The Law": "Once per turn when you hit a Large or smaller creature with a firearm, you can deal half damage to hobble it. It cannot move on its next turn unless it first takes the Disengage action.",
  "Gold Star Hero": "A creature with Temporary HP from Lay Down The Law has resistance to bludgeoning, piercing and slashing damage. Steely-Eyed Aura grows to 30 feet. You regain Reach For The Skies on a short or long rest.",
 }, "lu": [_u("Reach For The Skies", 7, 1, "long", "Action. Short rest too at level 14")],
 "acts": {"Lay Down The Law": "bonus", "Reach For The Skies": "action"}, "fx": []},
}
