# Ledger L3 (shards 07, 08): rows not fixed

Engine gaps (no hack added). Key format: item name, needed field.

| Item | Needed |
|---|---|
| Boomerang Shield, Claws of the Umber Hulk | attack row granted by an item (range, die, type, shield proficiency) |
| Bounty Hunter Enforcer | weapon damage type override on a weapon row |
| Bounty Hunter's Vest | armor base row without a DMGI base plus alternate Initiative |
| Boon of High Magic | extra spell slot of a level the character already has |
| Boots of Speed | speedMul (exists only on claude/w-fixmiss) as a toggle |
| Broken Vow | exhaustion lock |
| Cantrip Module | cantrip pick from three class lists, ability pick per install |
| Concentration Module | concentration save ability swap |
| Couatl Herald's Fang, Guard, Lash, Mantle, Radiance, Reach, Scales | set bonus: fly 30 when attuned to three such items (item count condition) |
| Draconic Rebirth | species swap |
| Elven Chain | armor training only for the item |
| Embedded Weapon | weapon pick that becomes an item |
| Exo-Frame | grant of two Battlefist items (proficiency is added) |
| Dark Gift of Savnok | Mind Blank effects beyond Psychic and Charmed are text notes only |
| Dämglesvir (Master) curse beyond Con saves | HP max reduction per hit (play state) |

Spec errors (already carried, no data needed): Boots of Levitation, Borealus (Ray of Frost), Budding Blossom Rod, Chattering Staff of Skulls, Draconic Familiar, Echo of Dragonsight, Emerald Pen, Encyclopedia Sanguine, Bracers of Defense (+2 AC shown), Boon of the Fire Soul and Stormborn (spells shown, DC 15 added), Deck of Wonder and Deck of Many More Things (fx already dropped in fx-D-item.js), Embedded Armor (Dex was already added; overlap with armor now added).
Ledger spec said "Champion" max by ability 22: used up 2, max 22. Corvum Feather Robe needs a class named exactly (byOk matches "Sorcerer" only because "warlock or wizard" is lowercase in the data): not changed.
