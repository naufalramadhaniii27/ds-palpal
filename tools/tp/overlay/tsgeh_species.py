# Own-wording species of Steinhardt's Guide to the Eldritch Hunt (2024 rules). Shape follows tee24_species.py and tvss_species.py.
# Engine notes: a species has one "lin" pick and one "opts" pick. Manikin uses both (armor preset in lin, Service Model in opts).
# The Manikin armor presets and the Deep One Dwarf attack option cannot change AC or the attack list, so they are text only.
DV60 = ["Darkvision", "Darkvision 60 ft."]
DV120 = ["Darkvision", "Darkvision 120 ft."]
SPECIES = {
 "Manikin": {"size": "Small or Medium", "speed": 30, "dark": 0, "type": "Construct",
   "lin": {"label": "Integrated Gold Plating", "opts": ["Infiltrator", "Sentinel", "Tormentor"]},
   "linText": {
     "Infiltrator": "Your base AC is 11 + Dexterity modifier. You count as unarmored for features that need no armor. You have Advantage on Dexterity (Stealth) checks.",
     "Sentinel": "Your base AC is 13 + Dexterity modifier (maximum +2) or Strength modifier (maximum +3). You count as wearing Medium armor, so you suffer the drawbacks of it if you lack Medium armor training.",
     "Tormentor": "Your base AC is 16 + Strength modifier (maximum +2). You count as wearing Heavy armor, so you suffer the drawbacks of it if you lack Heavy armor training. You have Disadvantage on Dexterity (Stealth) checks."},
   "opts": {"label": "Service Model", "n": 1, "list": [
     ["Custodian", "Advantage on ability checks to end the Grappled condition. You count as one size larger for carrying capacity. Reaction, when a creature within 5 feet is targeted by an attack: if the creature is willing, swap places with it and become the target. Uses equal your Proficiency Bonus per Long Rest.", {}],
     ["Handler", "Proficiency in Stealth and with the Disguise Kit. You can embed up to two Melee weapons in your body, each with the Finesse or Light property. Swapping one or both for weapons you hold takes 1 hour, which can be a Short Rest. You draw and stow them as normal and cannot be disarmed of them unless your arms are cut off.", {"skills": ["Stealth"]}],
     ["Thespian", "Proficiency in Performance. Bonus Action: link yourself to a willing creature you can see within 30 feet by immaterial strings for 1 hour. If that creature leaves some of its movement unused on its turn (use its highest Speed), you can use your Reaction at the end of its turn to move up to the unused amount. After you link, finish a Short or Long Rest to do so again.", {"skills": ["Performance"]}]]},
   "traits": [
     ["Born to Serve", "You cannot hate or resent your creators. You have Disadvantage on Wisdom (Insight) checks."],
     ["Electric Heart", "Resistance to Lightning damage."],
     ["Integrated Gold Plating", "Your body is its own armor. Armor gives you no AC, but a Shield works as normal. Pick Infiltrator, Sentinel or Tormentor when you pick the species. It sets your base AC and may give a Stealth effect."],
     ["Living Material", "You need no food, drink or air. Immunity to the Poisoned condition."],
     ["Service Model", "Pick Custodian, Handler or Thespian when you pick the species. Each gives a different support benefit."],
     ["Age", "You do not age. Over time your materials lose their magic and you eventually turn back into inanimate objects."]],
   "hb": "SGttEH24"},
 "Accursed": {"size": "Medium", "speed": 30, "dark": 60, "type": "Aberration", "fx": {"moves": {"climb": "walk"}},
   "spAb": "choose", "spAbTrait": "Legacy of a Thousand Young",
   "traits": [DV60,
     ["Climb Speed", "You have a Climb Speed equal to your Speed."],
     ["Blood Moon's Call", "If you sleep under a Blood Moon, the Black Goat sends a dream that places a compulsion in your mind. When you wake, you are under the Suggestion spell (save DC 16) and must follow the order. A successful save resists it."],
     ["Eldritch Endurance", "Resistance to Necrotic damage."],
     ["Legacy of a Thousand Young", "You know Spare the Dying. At level 3 you always have False Life prepared and at level 5 Mirror Image. You can cast each once without a slot and regain that use on a Long Rest. You can also cast them with spell slots. Intelligence, Wisdom or Charisma is the spell ability, chosen with the species."]],
   "hb": "SGttEH24"},
 "Cursed-Blood": {"size": "Small", "speed": 25, "dark": 0, "type": "Humanoid", "fx": {"moves": {"climb": "walk"}},
   "spAb": "choose", "spAbTrait": "Together Forever",
   "lin": {"label": "Together Forever", "opts": ["Hungering Twin", "Spirit Twin", "Watchful Twin"]},
   "linFx": {"Watchful Twin": {"dark": 120}},
   "linText": {
     "Hungering Twin": "Level 1: your stomach is bigger inside. It holds up to 250 pounds and 32 cubic feet, and a creature inside can breathe for 1 minute. Nonmagical items inside are destroyed by psychic energy after 24 hours. If you die, you harmlessly regurgitate everything. Level 3: pick Acid, Cold, Fire or Poison. When you take damage of that type, reduce it by your Proficiency Bonus. Level 5: nonmagical items are no longer destroyed, and the stomach holds 500 pounds and 64 cubic feet.",
     "Spirit Twin": "Level 1: you have telepathy out to 5 feet times your character level. A creature without telepathy that gets your messages cannot answer you mentally. You also know Mage Hand. Level 3: you can turn a Critical Hit against you into a normal hit. After you do, finish a Short or Long Rest to do so again. Level 5: a creature without telepathy that gets your messages can reply to you in a language it knows.",
     "Watchful Twin": "Level 1: Darkvision 120 ft. You also know Cosmic Eye. Level 3: you learn Detect Magic. Level 5: you learn See Invisibility."},
   "traits": [
     ["Climb Speed", "You have a Climb Speed equal to your Speed. You cannot use it while wearing Medium or Heavy armor."],
     ["Together Forever", "Your dead twin lives on in your stomach. Pick Hungering Twin, Spirit Twin or Watchful Twin. You get the level 1 benefit now and more at levels 3 and 5. A spell you learn here is always prepared, castable once without a slot per Long Rest, or with spell slots. Intelligence, Wisdom or Charisma is the spell ability, chosen with the species."],
     ["Vigilant", "You cannot be surprised. When you roll Initiative, add your Proficiency Bonus to the roll."],
     ["Age", "You mature at 5 years and usually live about 60 years, rarely up to 100."]],
   "hb": "SGttEH24"},
 "Demidritch": {"size": "Medium", "speed": 30, "dark": 120, "type": "Humanoid", "spAb": "CHA",
   "lin": {"label": "Unleash Infinity", "opts": ["Nebulare", "Oculare"]},
   "linText": {
     "Nebulare": "Creatures other than your allies within 10 feet make a Dexterity save (DC 8 + Charisma modifier + Proficiency Bonus) or take Radiant damage of a number of d6s equal to your Proficiency Bonus. You shed Bright Light in 10 feet and Dim Light 10 feet beyond. A 20-foot Emanation from you is Difficult Terrain for enemies you can see. At level 12 the Emanation grows to 60 feet, and you gain a Fly Speed of 30 feet and can hover.",
     "Oculare": "No creature within 60 feet gets Advantage on attack rolls against you because it has the Invisible condition. At level 12 you also grow eye-covered wings that give you a Fly Speed of 30 feet, and you have Truesight out to 60 feet."},
   "traits": [DV120,
     ["Astral Sight", "Advantage on saving throws against the Blinded condition. You know Cosmic Eye, with Charisma as the spell ability."],
     ["Shard of Infinity", "Resistance to Cold damage."],
     ["Unleash Infinity", "From level 3, as a Bonus Action, transform for 1 minute or until you end it (no action). Pick Nebulare or Oculare when you pick the species. After you transform, finish a Long Rest to do so again."],
     ["Age", "You mature at 10 years. Your body decays quickly and you live up to 60 years."]],
   "hb": "SGttEH24"},
 "Scourgeborne": {"size": "Medium", "speed": 30, "dark": 0, "type": "Monstrosity",
   "attacks": [{"n": "Feral Limbs", "die": "1d6", "type": "Piercing", "range": "5 ft", "ab": "STR", "note": "Horns, claws or fangs from your mutation. Piercing damage replaces the normal damage of an Unarmed Strike. The die is 1d8 if your alignment is Evil."}],
   "lin": {"label": "Monstrous Lineage", "opts": ["Aranea", "Belua", "Cervus", "Vespertilio"]},
   "linFx": {"Aranea": {"moves": {"climb": 30}}, "Cervus": {"speedSet": 40}, "Vespertilio": {"senses": [["Blindsight", 30, "Monstrous Lineage", "Disadvantage on ability checks and attack rolls that need sight beyond this range"]]}},
   "linText": {
     "Aranea": "Level 1: Climb Speed 30 feet. In water you have Disadvantage on all ability checks and attack rolls. Level 3: you climb difficult surfaces, ceilings included, with no check. After using this for 1 minute, finish a Long Rest to do so again. Level 5: you can use the level 3 trait for a number of minutes equal to your Proficiency Bonus, regained on a Long Rest.",
     "Belua": "Level 1: Advantage on Wisdom (Perception) checks that use hearing or smell. When you cause a creature to become Bloodied, you take 1d4 Psychic damage. Level 3: Bonus Action, make an Unarmed Strike against a creature in reach to feed. On a hit you regain Hit Points equal to the damage dealt. After you use this, finish a Long Rest to do so again. Level 5: you can use the level 3 trait a number of times equal to your Proficiency Bonus, regained on a Long Rest.",
     "Cervus": "Level 1: Speed 40 feet. Standing up from Prone costs 5 extra feet. Level 3: if you move at least 20 feet straight at a creature and hit it with a melee attack in the same turn, it makes a Strength save (DC 8 + Strength modifier + Proficiency Bonus) or falls Prone. You can then use a Bonus Action to make one melee attack against it. After you force this save, finish a Long Rest to do so again. Level 5: you can use the level 3 trait a number of times equal to your Proficiency Bonus, regained on a Long Rest.",
     "Vespertilio": "Level 1: Blindsight 30 feet. You have Disadvantage on ability checks and attack rolls that need sight beyond that range. Level 3: Bonus Action, gain a Fly Speed of 30 feet until the end of your turn. You fall if nothing holds you up when the turn ends. After you use this, finish a Short or Long Rest to do so again. Level 5: you can use the level 3 trait a number of times equal to your Proficiency Bonus, regained on a Short or Long Rest."},
   "opts": {"label": "Born of Madness", "n": 1, "list": [
     ["Good Alignment", "Advantage on saving throws to avoid or end Madness. Disadvantage on Charisma (Intimidation) checks.", {}],
     ["Neutral Alignment", "Your alignment gives you no benefit and no penalty.", {}],
     ["Evil Alignment", "Add your Proficiency Bonus to your Dexterity saving throws. Disadvantage on saving throws to avoid or end Madness. Your Feral Limbs die is 1d8.", {}]]},
   "traits": [
     ["Born of Madness", "Your body is a result of exposure to eldritch madness. Pick the option that matches your alignment."],
     ["Eldritch Curse", "You are immune to spells that change your form, such as Alter Self and Polymorph."],
     ["Feral Limbs", "Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. The die is 1d8 if your alignment is Evil."],
     ["Monstrous Lineage", "Pick Aranea, Belua, Cervus or Vespertilio. You get the level 1 benefit now and more at levels 3 and 5."],
     ["Age", "You age at the rate of the race you were before the change."]],
   "hb": "SGttEH24"},
 "Deep One Dwarf": {"size": "Medium", "speed": 30, "dark": 0, "type": "Humanoid", "fx": {"moves": {"swim": 25}}, "spAb": "CHA",
   "opts": {"label": "Slumbering Legacy", "n": 1, "list": [
     ["Coiling Arm", "Your arm is a writhing mass of tentacles. On your turn, right after you hit an enemy with a melee attack, you can use a Bonus Action to make an Unarmed Strike with the Grapple option against it. Normal grappling limits apply.", {}],
     ["Brutal Pincers", "Your forearm is a pincer you can use for Unarmed Strikes. A hit deals 1d6 + Strength modifier Piercing damage instead of Bludgeoning. Against a creature you are grappling the die is 1d10. You cannot do precise work with this arm.", {}],
     ["Mucoid Extremities", "Cupped, palmed hands and feet raise your Swim Speed to 35 feet and give you a Climb Speed of 20 feet.", {"moves": {"swim": 35, "climb": 20}}]]},
   "traits": [
     ["Amphibious", "You breathe air and water."],
     ["Cosmic Knowledge", "On Intelligence (History) checks about the origin of an eldritch item or construction, you count as having proficiency and Expertise in History."],
     ["Dreamer's Curse", "Dreams of the Slumbering One cloud your mind. You have Disadvantage on ability checks and saving throws to discern illusions."],
     ["Guiding Light", "You know Dancing Lights, with Charisma as the spell ability."],
     ["Illusory Body", "An illusion makes you look like a typical hill dwarf. Other Deep Ones see through it. You have Advantage on Charisma (Deception) checks against creatures that cannot see through it."],
     ["Otherworldly Resistance", "Resistance to Cold damage. Advantage on saving throws to avoid or end the Poisoned condition."],
     ["Slumbering Legacy", "Pick Coiling Arm, Brutal Pincers or Mucoid Extremities when you pick the species."],
     ["Dreamer's Gift (optional)", "From level 5, when you fail an ability check or saving throw, you can succeed instead. After you use this, you cannot do so again until the Dreamer replaces one of your D20 Test results with a 1, at the GM's choice of moment. You are also immune to the Curse of the Slumbering Moon."],
     ["Age", "You mature at 10 years and cannot die of old age. At 50 your mind fails and you become a brainless servant of He Who Lies Dreaming."]],
   "hb": "SGttEH24"},
}
LU = [
 {"src": "species", "owner": "Manikin", "feature": "Service Model", "n": "Custodian: Swap Places", "lvl": 1, "max": "pb", "reset": "long", "tag": "Reaction", "opt": "Custodian"},
 {"src": "species", "owner": "Manikin", "feature": "Service Model", "n": "Thespian: Strings", "lvl": 1, "max": 1, "reset": "short", "tag": "Bonus Action", "opt": "Thespian"},
 {"src": "species", "owner": "Accursed", "feature": "Legacy of a Thousand Young", "n": "Legacy: False Life", "lvl": 3, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Accursed", "feature": "Legacy of a Thousand Young", "n": "Legacy: Mirror Image", "lvl": 5, "max": 1, "reset": "long", "tag": "1/Long Rest spell"},
 {"src": "species", "owner": "Demidritch", "feature": "Unleash Infinity", "n": "Unleash Infinity", "lvl": 3, "max": 1, "reset": "long", "tag": "Bonus Action"},
]
ACTS = {
 "sp|Demidritch|Unleash Infinity": [["bonus", "", "Unleash Infinity"]],
}
SP_AUTO = {
 "Accursed": {"": [[1, "Spare the Dying"], [3, "False Life"], [5, "Mirror Image"]]},
 "Cursed-Blood": {"Spirit Twin": [[1, "Mage Hand"]], "Watchful Twin": [[1, "Cosmic Eye"], [3, "Detect Magic"], [5, "See Invisibility"]]},
 "Demidritch": {"": [[1, "Cosmic Eye"]]},
 "Deep One Dwarf": {"": [[1, "Dancing Lights"]]},
}
DEF = {}
