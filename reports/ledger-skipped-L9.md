# Ledger skipped, bin 9 (shards 22, 23, 24)

Rows that need an engine field that does not exist. No hack was written. Where a part could be done, it is noted.

| Key | Needed field |
|---|---|
| item tsgs Silver Eagle Weapon | weapon dice replacement (2d6 instead of normal dice) |
| item wdh Oversized Longbow | weapon dice replacement (2d6 + STR) |
| species Bugbear (2014) Long-Limbed | reach multiplier on melee attack rows |
| species Dhakaani Guul'dar (Bugbear) Long-Limbed | reach multiplier |
| species Child of Seth Verbal Culture | Expertise alternative to two skill proficiencies |
| species Githyanki (2014) Decadent Mastery | exclusive skill-or-tool choice (tool part stays "add by hand") |
| species Dwarf (Kaladesh) Artisan's Expertise | `toolExpert` (doubled PB on tool checks). Only a Defenses note written |
| item tsgs Seafarer's Jacket | `toolExpert` for "Expertise if you already had it". Proficiency and a note written |
| item tsgs Wooden Chain of the Unbroken Circle | `acAdd` with a cap (WIS modifier, max +2). Only Medium armor training written |
| species Aven (Ibis-Headed) Kefnet's Blessing | `chkBonus` variant for checks without Proficiency Bonus (non-proficient only) |
| species Manikin Integrated Gold Plating (Sentinel, Tormentor) | AC ability cap (Strength max +3 / +2). Infiltrator and Sentinel Dex path (acDexMax 2) written |
| item tvss Monstrous Weapon | tier table for the Slashing die is "in the book", not in the repo. atkAb and a note written |

## Spec errors
- Lorwyn Elf: spells already in SP_AUTO. Corvum Talons: row exists. Harengon Hare-Trigger: init already carried.
- Cervan "no lgf": lgf exists but only counts under 2014 rules, fx langs still needed (written).
- Avia-Ra Zealous: text has no use limit, the LU row was removed.
- Kalashtar: Githzerai save note scoped by owner.
