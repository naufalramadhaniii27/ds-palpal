# Own-wording Planar Orders, Valda's Spire of Secrets 2014 rules.
def _c(key, names, lvl8=True):
    L = [[n, "Cantrip. Intelligence is your spellcasting ability for it."] for n in names]
    r = [{"l": 1, "k": "opts", "key": key + "1", "n": 3, "title": "Order Cantrips", "feature": "Cantrips", "list": L}]
    if lvl8: r.append({"l": 8, "k": "opts", "key": key + "8", "n": 1, "title": "Order Cantrip (level 8)", "feature": "Cantrips", "list": L})
    return r
_CT = "Pick three cantrips from the order's list now and a fourth at level 8. Intelligence is your spellcasting ability for them."
SUB = {
"Order of Blinknights": {"spab": "",
 "f": {
  "Cantrips": _CT + " List: Chill Touch, Light, Fire Bolt, Mage Hand, Magic Daggers, Minor Illusion, Prestidigitation, Produce Flame, Ray of Frost, Shocking Grasp, True Strike.",
  "Order of Blinknights": "You unify yourself with a weapon that becomes part of you, and blink across the battlefield. You fear no force in the multiverse.",
  "Portal Key: Weapon": "Your portal key is a weapon that you can send to the Ethereal Plane when not in use. It counts as magical for overcoming resistance and immunity to nonmagical attacks. You summon it to your hand or dismiss it as you would draw or stow a weapon.",
  "Bonus Focus": "You gain the Ethereal planar focus. As a bonus action, spend up to 3 arcana points to teleport to a free space you see within 15 feet per point spent.",
  "Spellstrike Ward": "As a bonus action, raise a ward for 1 minute with a pool of 5 Temporary HP. Whenever you damage a hostile creature with a melee weapon attack, the pool gains your Intelligence modifier. It holds at most twice your level. Short or Long Rest to use it again.",
  "Arcane Edge": "When you hit with a spell attack channeled through a melee weapon attack, you can turn it into a critical hit. Short or Long Rest to use it again.",
 },
 "pick": _c("blink", ["Chill Touch", "Light", "Fire Bolt", "Mage Hand", "Magic Daggers", "Minor Illusion", "Prestidigitation", "Produce Flame", "Ray of Frost", "Shocking Grasp", "True Strike"]),
 "lu": [{"feature": "Spellstrike Ward", "lvl": 10, "max": 1, "reset": "short", "tag": "Bonus action. 5 Temporary HP pool"},
        {"feature": "Arcane Edge", "lvl": 15, "max": 1, "reset": "short", "tag": "Channeled hit becomes a crit"}],
 "acts": {"Bonus Focus": "bonus", "Spellstrike Ward": "bonus"}, "fx": []},

"Order of Dimensional Magi": {"spab": "",
 "f": {
  "Cantrips": _CT + " List: Acid Splash, Chill Touch, Force Dart, Light, Mage Hand, Mending, Message, Minor Illusion, Poison Spray, Prestidigitation, Ray of Frost, Resistance.",
  "Order of Dimensional Magi": "You study the structure of the multiverse and slip between its layers. Your key is a tome of planar secrets.",
  "Portal Key: Book": "Your portal key is a spellbook. It starts with two 1st-level ritual spells from any class list. They do not count against spells known. While you hold it you can cast them as rituals only, unless you learned them another way. You can also cast any channeler spell you know as a ritual if it has the ritual tag. You can add other ritual spells you find, if you can cast their level and spend the time: 2 hours and 50 gp of rare ink per spell level.",
  "Bonus Focus": "You gain the Shadowfell planar focus. On your turn, spend a bonus action and 2 arcana points to turn invisible until the start of your next turn. Spend 1 more point at the start of your turn to keep it another round. It ends if you attack or cast a spell.",
  "Phase Shift": "As an action, shift out of phase with the Material and Ethereal Planes for 1 minute. You subtract your Intelligence modifier from bludgeoning, piercing and slashing damage you take. Damage that affects creatures on the Ethereal Plane ignores this. Short or Long Rest to use it again.",
  "Secret Arcana": "You know three wizard spells of 7th level or lower. While you hold your spellbook, you can cast one of them with no slot or arcana points. Long Rest to use it again.",
 },
 "pick": _c("dimen", ["Acid Splash", "Chill Touch", "Force Dart", "Light", "Mage Hand", "Mending", "Message", "Minor Illusion", "Poison Spray", "Prestidigitation", "Ray of Frost", "Resistance"]),
 "lu": [{"feature": "Phase Shift", "lvl": 10, "max": 1, "reset": "short", "tag": "Action. 1 minute"},
        {"feature": "Secret Arcana", "lvl": 15, "max": 1, "reset": "long", "tag": "One spell, no cost"}],
 "acts": {"Bonus Focus": "bonus", "Phase Shift": "action"}, "fx": []},

"Order of Titanfists": {"spab": "",
 "f": {
  "Cantrips": _CT + " List: Chill Touch, Light, Mage Hand, Minor Illusion, Prestidigitation, Produce Flame, Resistance, Shocking Grasp, True Strike.",
  "Order of Titanfists": "Strength is king. You wear huge metal gauntlets and punch holes in the multiverse, but you pair strength with cunning and agility.",
  "Portal Key: Battlefist": "Your key is a pair of oversized articulated gauntlets called battlefists. Each is a martial melee weapon that deals 1d8 bludgeoning damage. It can hold and handle objects, though you cannot attack with it while it holds one. They have the Light property while you wield them. When you use the Attack action with one battlefist, you can attack with another you wield as a bonus action.",
  "Bonus Focus": "You gain the Olympus planar focus. While you concentrate on it, you grow to titanic size, as with the Enlarge option of Enlarge/Reduce.",
  "Concussive Strike": "When you hit with a battlefist, you can spend 2 arcana points to make the target make a Constitution save against your spell save DC. On a failure it is dazed until the end of its next turn. A dazed creature has Disadvantage on attack rolls and Dexterity saves. Creatures immune to stunned are immune.",
  "Meteor Blow": "When you attack with a battlefist on your turn, you can channel a colossal strike. On a hit it deals an extra 4d6 bludgeoning damage. If the target is on the ground, each other creature on the ground within 5 feet of it makes a Dexterity save against your spell save DC. A creature takes the same bludgeoning damage and falls prone on a failure, or half and stays standing on a success. Long Rest to use it again.",
 },
 "pick": _c("titan", ["Chill Touch", "Light", "Mage Hand", "Minor Illusion", "Prestidigitation", "Produce Flame", "Resistance", "Shocking Grasp", "True Strike"]),
 "lu": [{"feature": "Meteor Blow", "lvl": 15, "max": 1, "reset": "long", "tag": "+4d6 bludgeoning, area save"}],
 "acts": {"Bonus Focus": "bonus"}, "fx": []},

"Order of Wild Hunters": {"spab": "",
 "f": {
  "Cantrips": _CT + " List: Chill Touch, Fire Bolt, Light, Mage Hand, Mending, Minor Illusion, Prestidigitation, Produce Flame, Ray of Frost, Resistance.",
  "Order of Wild Hunters": "You hunt all manner of quarry across the multiverse, from fiends to renegade fey to celestials. You know the secret of shrinking a spell onto an arrowhead.",
  "Portal Key: Quiver": "Your key is a quiver that gives endless nonmagical ammunition. Anything taken out is replaced at once, and what you remove disintegrates after 1 minute. From level 2, when you make a ranged spell attack against a creature, you can use your bonus action to replace it with a ranged weapon attack with ammunition from the quiver. On a hit it deals the weapon's normal damage die (not its ability modifier) in addition to the spell's effects. Spell channeling improvements at higher levels apply to the quiver too.",
  "Bonus Focus": "You gain the Asphodel planar focus. When you miss with a ranged weapon attack on your turn, you can spend an arcana point to repeat the attack against the same target. Once per turn.",
  "Fey Arrowhead": "Once per turn when you make a ranged attack with your quiver, you can spend 2 arcana points to replace it with a Fey Arrowhead. You teleport to where the projectile lands, or to the nearest free space.",
  "Arrow Downpour": "As an action, fire the quiver's ammunition in a high arc over a line 100 feet long and 15 feet wide. Each creature in it makes a Dexterity save against your spell save DC, with Advantage if it has cover from above. It takes 8d6 + 10 piercing damage on a failure or half on a success. Long Rest to use it again.",
 },
 "pick": _c("hunt", ["Chill Touch", "Fire Bolt", "Light", "Mage Hand", "Mending", "Minor Illusion", "Prestidigitation", "Produce Flame", "Ray of Frost", "Resistance"]),
 "lu": [{"feature": "Arrow Downpour", "lvl": 15, "max": 1, "reset": "long", "tag": "Action. 100-foot line"}],
 "acts": {"Bonus Focus": "bonus", "Arrow Downpour": "action"}, "fx": []},
}
