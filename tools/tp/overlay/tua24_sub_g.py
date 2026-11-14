"""Unearthed Arcana 2025 Arcane Updates (2024 rules): Tattooed Warrior with its tattoo picks. Own wording."""
def _p(l, key, feature, title, lst):
    return {"l": l, "k": "opts", "n": 1 if l > 3 else 2, "key": key, "feature": feature, "title": title, "list": [list(x) for x in lst]}
BEAST = [
 ["Bat", "You know the Dancing Lights cantrip and have Blindsight 10 feet."],
 ["Butterfly", "You know the Light cantrip. For a High Jump you can use your Dexterity modifier instead of Strength."],
 ["Crane", "You know the Guidance cantrip. When an attack from Flurry of Blows misses a creature, you have Advantage on your next attack roll against it before the end of your next turn."],
 ["Horse", "You know the Message cantrip. When you spend 1 Focus Point on Step of the Wind, your Speed rises by 10 feet until the start of your next turn."],
 ["Tortoise", "You know the Spare the Dying cantrip. When you spend 1 Focus Point on Patient Defense, you have +1 AC until the start of your next turn."]]
CELESTIAL = [
 ["Comet", "When you take the Search action, spend 1 Focus Point to add a roll of your Martial Arts die to the Wisdom check."],
 ["Eclipse", "When you take the Hide action, spend 1 Focus Point to add a roll of your Martial Arts die to the Dexterity (Stealth) check."],
 ["Sunburst", "When you take the Study action, spend 1 Focus Point to add a roll of your Martial Arts die to the Intelligence check."]]
NATURE = [
 ["Sea Storm", "You have Resistance to Cold, Lightning, or Thunder damage (your choice). You can change the choice after a Short or Long Rest or when you use Uncanny Metabolism."],
 ["Volcano", "You have Resistance to Acid, Fire, or Poison damage (your choice). You can change the choice after a Short or Long Rest or when you use Uncanny Metabolism."]]
MONSTER = [
 ["Beholder", "At the start of your turn, spend 1 Focus Point to gain a Fly Speed equal to your Speed for 10 minutes, and you can hover. Magic action, spend 1 Focus Point: fire four rays from your eyes at one target within 120 feet or several. Make a ranged spell attack for each ray with Wisdom as your spellcasting ability. A hit deals Force damage equal to one roll of your Martial Arts die + your Wisdom modifier."],
 ["Chromatic Dragon", "When you take the Attack action, spend 1 Focus Point to replace one attack with a 30-foot Cone of magical energy. Choose Acid, Cold, Fire, Lightning, or Poison. Each creature makes a Dexterity save. A failure takes two rolls of your Martial Arts die + your Wisdom modifier damage of that type, a success takes half."],
 ["Displacer Beast", "When you spend a Focus Point on Flurry of Blows or Step of the Wind, you can spend 1 more Focus Point to cast Mirror Image as part of that Bonus Action."],
 ["Troll", "At the start of each of your turns, if you are Bloodied and have at least 1 Hit Point, you regain 5 + your Wisdom modifier Hit Points. A severed body part regrows after a Short or Long Rest."]]
SUB = {
"Tattooed Warrior": {"spab": "WIS",
 "f": {
  "Beast Tattoos": "You gain two animal tattoos of your choice: Bat, Butterfly, Crane, Horse, or Tortoise.",
  "Magic Tattoos": "The tattoos from this subclass appear wherever you like, and injury doesn't impair them. A tattoo's save DC is 8 + your Wisdom modifier + your Proficiency Bonus. Wisdom is your spellcasting ability for spells a tattoo grants. After a Long Rest you can swap one of your tattoos for another from the same list.",
  "Celestial Tattoo": "You gain one celestial tattoo of your choice: Comet, Eclipse, or Sunburst.",
  "Nature Tattoo": "You gain one nature tattoo of your choice: Sea Storm or Volcano.",
  "Monster Tattoo": "You gain one monster tattoo of your choice: Beholder, Chromatic Dragon, Displacer Beast, or Troll."},
 "pick": [_p(3, "tat_beast", "Beast Tattoos", "Beast tattoos (two)", BEAST), _p(6, "tat_celestial", "Celestial Tattoo", "Celestial tattoo", CELESTIAL),
          _p(11, "tat_nature", "Nature Tattoo", "Nature tattoo", NATURE), _p(17, "tat_monster", "Monster Tattoo", "Monster tattoo", MONSTER)],
 "lu": [],
 "fx": [],
 "acts": {}},
}
