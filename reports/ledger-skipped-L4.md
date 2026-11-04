# Ledger bin 4 (shards 09, 10, 11): rows not fixed or fixed in part

Data file: `src/data/fx-L4.js`. Engine needs are named by the field that does not exist.

| Key | Needed field | State |
|---|---|---|
| Flensing Claws (Small, Medium, Large, Huge) | granted attack row (and a damage die; the row text has none, the books/ folder is absent) | not done |
| Galepierce Weapon | range multiplier; the row also has no base weapon | not done |
| Gurt's Greataxe | weapon dice replacement (3d12) | note on the attack row only, die stays 1d12 |
| Frozen Dagger | weapon damage type override (Cold) | note on the attack row only, type stays Piercing |
| Lucent Destroyer | damage type override (Radiant) and no loading | only the Dancing Lights cantrip added |
| Golem Arms | reach increase | Strength advantage added, reach not |
| Ioun Stone (mastery), Ioun Stone, Mastery | Proficiency Bonus +1 (`pbAdd`) | not done |
| Libram of Souls and Flesh | item spellbook list (`spListAdd` works for non-item sources only; `spells` would make them always prepared) | not done |
| Mithral Armor | armor flag override (no Strength requirement, no Stealth disadvantage) | not done |
| Logic Unit | half Proficiency Bonus on Intelligence checks of skills without proficiency (needs a per-skill proficiency test) | language and cantrip done, bonus not |
| Monstrous Weapon | slashing die by tier; the table is not in the row text | not done |
| Fin Symbiote | +2 to Aberrant Horror Boon DCs (needs the feature name used by `dcAdd`) | advantage on Constitution saves done, DC text only |
| Girdle of Traveling Alchemy | item grant list | tracked as 7 dawn resources instead of inventory items |
| Finger Picks | tool Expertise | proficiency done, double bonus is a note |

Observation (not changed): `byOk` matches class names case sensitively, so "Sorcerer, warlock or wizard" (Gallus and Luma Feather Robe) only passes for a Sorcerer.
