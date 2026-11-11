# Own-wording subclasses (Champion's Calls) of Valda's Spire of Secrets, 2014 rules. Shape of tvss_sub.py. Built subclass names get " (2014)" when the 2024 book has the same name.
SUB = {
"Stoneheart Defender": {"spab": "",
 "f": {
  "Roots of Rock": "When you use Warden's Grasp, rocky roots grow from your feet. Until the start of your next turn you have a +2 bonus to AC. Also, until you move, hostile actions, spells and effects cannot shove or push you from your spot unless you allow it. You have Advantage on Strength saving throws against being knocked Prone, you cannot slip or fall from ledges, and you are immune to the Fly, Levitate and Telekinesis spells.",
  "Earthshatter": "You can use Warden's Grasp as an action instead of a Bonus Action. If you do, each creature it affects makes a Strength saving throw (DC 8 + your Proficiency Bonus + your Strength modifier) or falls Prone. You can do this a number of times equal to your Strength modifier, and you regain all uses when you finish a Long Rest.",
  "Mettle": "When an effect lets you make a Constitution saving throw to take half damage, you take no damage on a success and half damage on a failure.",
  "Immortal Mountain": "As an action you wrap yourself in stone for 1 minute. While it lasts: Bludgeoning, Piercing and Slashing damage you take is reduced by 5; you gain the effects of Roots of Rock for the whole duration; and as you move you can upend the ground, leaving a 5-foot-wide trail of difficult terrain behind you. After you use this, you cannot use it again until you finish a Long Rest.",
 },
 "lu": [{"feature": "Earthshatter", "lvl": 6, "max": "mod:STR", "reset": "long", "tag": "Action. Prone on a failed save"},
        {"feature": "Immortal Mountain", "lvl": 20, "max": 1, "reset": "long", "tag": "Action. 1 minute"}],
 "acts": {"Earthshatter": "action", "Immortal Mountain": "action"},
 "fx": [[6, "Earthshatter", {"notes": [["Note", "Earthshatter: Warden's Grasp as an action. Creatures in it make a Strength save or fall Prone"]]}],
        [13, "Mettle", {"notes": [["Note", "Mettle: a successful Constitution save against half-damage effects means no damage"]]}]],
},
}

# The other Valda 2014 subclasses live in their own files, one per class
import importlib.util as _u, os as _o
for _f in ("tvss14_sub_warden", "tvss14_sub_alchemist", "tvss14_sub_captain", "tvss14_sub_craftsman"):
    _p = _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), _f + ".py")
    _sp = _u.spec_from_file_location(_f, _p); _m = _u.module_from_spec(_sp); _sp.loader.exec_module(_m)
    SUB.update(_m.SUB)
