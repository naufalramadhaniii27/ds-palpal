# Own-wording species of The Griffon's Saddlebag Book 1 (2024 rules). Shape follows tee24_species.py and tsgeh_species.py.
# The species is written straight into this file because it has no chunk loader.
# Engine notes: a species has one "lin" pick and one "opts" pick. Avian goes in lin so its cantrip is added by SP_AUTO.
# The Feline spell (level 3) sits in opts and is text only because SP_AUTO reads only the lin choice.
AVIAN = {"Jay": "Thaumaturgy", "Owl": "Thaumaturgy", "Raven": "Thaumaturgy", "Eagle": "Message", "Falcon": "Message", "Hawk": "Message",
         "Cardinal": "Prestidigitation", "Mockingbird": "Prestidigitation", "Parrot": "Prestidigitation"}
FELINE = {"Lion": "Detect Evil and Good", "Panther": "Detect Evil and Good", "Saber-Toothed Tiger": "Detect Evil and Good",
          "Cheetah": "Detect Poison and Disease", "Serval": "Detect Poison and Disease", "Tiger": "Detect Poison and Disease",
          "Jaguar": "Detect Magic", "Lynx": "Detect Magic", "Snow Leopard": "Detect Magic"}
SPECIES = {
 "Feathren": {"size": "Medium", "speed": 30, "dark": 60, "type": "Humanoid", "spAb": "choose", "spAbTrait": "Feathren Ancestry",
   "toolPick": {"n": 2, "cats": ["art"], "label": "Natural Creator"},
   "attacks": [{"n": "Talons", "die": "1d6", "type": "Piercing", "range": "5 ft", "ab": "STR", "note": "Your talons replace the Bludgeoning damage of an Unarmed Strike with Piercing damage."}],
   "lin": {"label": "Avian Ancestry", "opts": list(AVIAN)},
   "linText": {k: "You know the cantrip " + v + "." for k, v in AVIAN.items()},
   "opts": {"label": "Feline Ancestry", "n": 1, "list": [[k, "At character level 3 you learn " + v + ". You always have it prepared.", {}] for k, v in FELINE.items()]},
   "traits": [["Darkvision", "Darkvision 60 ft."],
              ["Feathren Ancestry", "Your mix of bird and cat blood gives you magic. Pick one Avian and one Feline ancestry. Avian: Jay, Owl or Raven give Thaumaturgy. Eagle, Falcon or Hawk give Message. Cardinal, Mockingbird or Parrot give Prestidigitation. Feline: Lion, Panther or Saber-Toothed Tiger give Detect Evil and Good. Cheetah, Serval or Tiger give Detect Poison and Disease. Jaguar, Lynx or Snow Leopard give Detect Magic. You know the Avian cantrip and Identify. At character level 3 you learn the Feline spell. At character level 5 you learn Enhance Ability. You always have these spells prepared. You can cast each of the spells once with no slot and no Material component, regaining the use on a Long Rest. You can also cast them with slots of the right level. Intelligence, Wisdom or Charisma is your spellcasting ability for them, chosen with the ancestries."],
              ["Kindred Speech", "You can pass simple ideas to birds and cats of Large size or smaller, griffons included. They understand your words but you gain no special way to understand them. You have Advantage on Wisdom (Animal Handling) checks and on Charisma checks to influence them."],
              ["Natural Creator", "A mote of the astral griffon's creative essence lives in you. You have proficiency with two Artisan's Tools of your choice. You can gain proficiency with a new tool in half the normal time."],
              ["Talons", "When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning."]],
   "hb": "GSB24"},
}
LU = [
 {"src": "species", "owner": "Feathren", "feature": "Feathren Ancestry", "n": "Feathren Ancestry: Identify", "lvl": 1, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Feathren", "feature": "Feathren Ancestry", "n": "Feathren Ancestry: Feline spell", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Feathren", "feature": "Feathren Ancestry", "n": "Feathren Ancestry: Enhance Ability", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
]
ACTS = {}
SP_AUTO = {
 "Feathren": {k: [[1, v], [1, "Identify"], [5, "Enhance Ability"]] for k, v in AVIAN.items()},
}
DEF = {}
