"""Unearthed Arcana 2026 Underdark Options 2 species (2024 rules): Deep Imaskari, Drider, Illithidkin, Myconid. Own wording."""
DV120 = ["Darkvision", "Darkvision 120 ft."]
SPELLCHOICE = " Intelligence, Wisdom, or Charisma is the spellcasting ability, chosen when you pick the species."
SPECIES = {
 "Deep Imaskari": {"size": "Small or Medium", "speed": 30, "dark": 0, "type": "Humanoid",
   "traits": [
     ["Photoresistant", "You have Resistance to Radiant damage."],
     ["Resourceful", "You gain Heroic Inspiration whenever you finish a Long Rest."],
     ["Unluminescent", "Action: make the crystals on your body glow with Unlight, shedding Bright Light in a 5-foot radius until you use an action to stop it. They stop glowing if you die or are Unconscious."],
     ["Aura of Unlight", "From level 3, Bonus Action: create an aura that sheds Bright Light in a 10-foot Emanation for 1 minute or until you end it (no action). You can't do this again until a Long Rest. Choose one option each time. Abjuring Unlight: you and allies in the aura gain a bonus to AC equal to half your Proficiency Bonus (round down). Brilliant Unlight: other creatures that start their turn in it make a Constitution save (DC 8 + Charisma modifier + Proficiency Bonus) or are Blinded until the end of your next turn. Corrupting Unlight: when you damage a creature with an attack or spell you can change the damage to Radiant, and you can spend one of your unspent Hit Point Dice to add its roll as extra Radiant damage."]],
   "hb": "UA24"},
 "Drider": {"size": "Medium", "speed": 30, "dark": 120, "type": "Monstrosity", "spAb": "choose", "spAbTrait": "Spells of the Spider Queen", "fx": {"moves": {"climb": 30}},
   "traits": [DV120,
     ["Arachnid Build", "You count as one size larger for carrying capacity."],
     ["Spells of the Spider Queen", "You know the Dancing Lights cantrip. At level 3 Faerie Fire is always prepared, and at level 5 Web is. You can cast each once without a slot per Long Rest, and also with slots." + SPELLCHOICE],
     ["Spider Climb", "You have a Climb Speed equal to your Speed. From level 3 you can also move up, down, and across vertical surfaces and along ceilings with your hands free."],
     ["Web Walker", "You ignore movement limits from webs and know where any other creature touching the same web is."]],
   "hb": "UA24"},
 "Illithidkin": {"size": "Small or Medium", "speed": 30, "dark": 120, "type": "Humanoid", "spAb": "choose", "spAbTrait": "Psionic Aptitude",
   "traits": [DV120,
     ["Psionic Aptitude", "You know the Mage Hand cantrip and can make the hand Invisible. At level 3 Command is always prepared, and at level 5 Levitate is. You can cast each once without a slot per Long Rest, and also with slots." + SPELLCHOICE],
     ["Sharpened Mind", "You have Resistance to Psychic damage and Advantage on saves to avoid or end the Charmed condition."],
     ["Telepathy", "You have Telepathy with a range of 30 feet."]],
   "hb": "UA24"},
 "Myconid": {"size": "Small or Medium", "speed": 30, "dark": 120, "type": "Plant",
   "traits": [DV120,
     ["Telepathy", "You have Telepathy with a range of 30 feet."],
     ["Rapport Spores", "Action: release spores in a 30-foot Emanation. Creatures there with Intelligence 2 or higher that aren't Constructs, Elementals, or Undead gain Telepathy 30 feet for 1 hour. You can't use this again until a Long Rest."],
     ["Skill Meld", "After a Long Rest you can hold a melding ritual. Choose up to six allies within 30 feet (you can be one) and a skill that at least one participant is proficient in. Each chosen creature is proficient in that skill until it finishes a Long Rest."]],
   "hb": "UA24"},
}
LU = [
 {"src": "species", "owner": "Deep Imaskari", "feature": "Aura of Unlight", "n": "Aura of Unlight", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action"},
 {"src": "species", "owner": "Drider", "feature": "Spells of the Spider Queen", "n": "Faerie Fire (Lv 3)", "lvl": 3, "max": 1, "reset": "long", "tag": "Special"},
 {"src": "species", "owner": "Drider", "feature": "Spells of the Spider Queen", "n": "Web (Lv 5)", "lvl": 5, "max": 1, "reset": "long", "tag": "Special"},
 {"src": "species", "owner": "Illithidkin", "feature": "Psionic Aptitude", "n": "Command (Lv 3)", "lvl": 3, "max": 1, "reset": "long", "tag": "Special"},
 {"src": "species", "owner": "Illithidkin", "feature": "Psionic Aptitude", "n": "Levitate (Lv 5)", "lvl": 5, "max": 1, "reset": "long", "tag": "Special"},
 {"src": "species", "owner": "Myconid", "feature": "Rapport Spores", "n": "Rapport Spores", "lvl": 1, "max": 1, "reset": "long", "tag": "Action"},
]
ACTS = {
 "sp|Deep Imaskari|Unluminescent": [["action", "", "Unluminescent"]],
 "sp|Deep Imaskari|Aura of Unlight": [["bonus", "", "Aura of Unlight"]],
 "sp|Myconid|Rapport Spores": [["action", "", "Rapport Spores"]],
}
SP_AUTO = {
 "Drider": {"": [[1, "Dancing Lights"], [3, "Faerie Fire"], [5, "Web"]]},
 "Illithidkin": {"": [[1, "Mage Hand"], [3, "Command"], [5, "Levitate"]]},
}
DEF = {}
GXSP = {
 "Deep Imaskari": [{"n": "Photoresistant", "res": ["Radiant"]}],
 "Illithidkin": [{"n": "Sharpened Mind", "res": ["Psychic"], "advOn": ["saving throws to avoid or end the Charmed condition"]}],
}
