# Own-wording subclass of Valda's Spire of Secrets (2024): Cleric.
SUB = {
"Pestilence Domain": {"spab": "WIS",
 "f": {
  "Pestilence Domain Spells": "Always prepared from the listed Cleric levels: 3 Blindness/Deafness, Detect Poison and Disease, Poison Spray, Ray of Enfeeblement, Ray of Sickness. 5 Bestow Curse, Remove Curse. 7 Blight, Confusion. 9 Contagion, Insect Plague.",
  "Carrier": "Your Cleric spells and features ignore Immunity to Poison damage and the Poisoned condition. A creature immune to Poison damage resists it instead, for you. Magic action: touch a creature to end the Poisoned condition and magical contagions on it. It also resists Poison damage for 1 minute.",
  "Infection": "Magic action, spend a Channel Divinity use: a creature you see within 30 ft makes a Constitution save or is Poisoned for 1 minute, repeating the save at the end of each of its turns. While Poisoned it suffers one contagion of your choice. Bloodmore: it takes an extra 1d6 Necrotic damage whenever it takes Bludgeoning, Piercing or Slashing damage. Joint Lock: its Speed drops by 15 ft (minimum 5 ft). Ruby Eye: it sees normally to 5 ft but is Blinded beyond that.",
  "Fester": "When you cast a Cleric spell or use a Cleric feature that forces a Constitution save, you can give one creature Disadvantage on that save.",
  "Epidemic Infection": "Cursed Infection: when a creature gains Poisoned from your Infection, pick an ability. While Poisoned it has Disadvantage on checks and saves with that ability. Viral Infection: a Poisoned target spreads disease in a 5-ft Emanation. A creature you see that is in it, enters it or ends its turn there can be forced to make the Constitution save against your Infection. On a failure it is Poisoned, carries the same contagion and spreads it too."},
 "acts": {"Carrier": "action", "Infection": "action"},
 "fx": [[3, "Carrier", {"notes": [["Note", "Carrier: your Cleric spells and features ignore Poison immunity (immune creatures resist instead)"]]}]]},
}
