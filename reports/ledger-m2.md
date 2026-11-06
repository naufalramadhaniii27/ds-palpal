# Ledger rows unlocked by engine wave 3 (fx engine v6, `src/data/fx-M2.js`)

Base: `reports/ledger-m1.md` (110 rows still skipped after wave 2, 42 rows opened in wave 2, some with gaps). Section numbers are those of `reports/ledger-skipped-all.md`.

## Unlocked rows

| Section | Field | Rows unlocked |
|---|---|---|
| 2 Spell filter | pick `t:"spell"`: `lvl`/`lvMin`/`lvMax`, `cls` (name, list, `@pick:k`), `rit`, `schools`, `names`, `rx`, `bk`; `spCls:"@pick:k"`, item `@abpick` | 6 of 21: Quicksmithing + Ritual Caster (2014) (one row), Spell Sniper (2014) + Fey Pact (one row), Forest Sage, Cantrip Module (L3 and L8), Occult Knowledge |
| 4 Resource pool | `luBump`, `cdAdd` | 3: Blessed Reliquary (L2 and L8), Focused Fighting + Focused Hunter (Adrenaline Point only) |
| 7 Off-hand, mastery | `offHand`, `wmAdd` | Two-Weapon Fighting off-hand row (1), Star-Spangled Banner Patriotism and Burden of Awakening Mind Mastery (third mastery weapon, 2 more rows outside the table) |
| 9 Size | `sizeSet`, `dieStep` | Lilliputian (1) |
| 10 Item grants | `grantItem` | Exo-Frame, two Battlefists (L3 and L8): 2 |
| AC states (mech_baseline gaps) | existing toggle + `acAdd` (no new field) | Agile Parry (Kensei), Evasive Fighter (Freerunner), Anticipatory Strike (Prescient Knight), Blood-Drunk (AC and saves), Circle of the Feathers (Swift Glide, Enchanted Wings): 5 |

Rows of wave 2 whose gap is now closed: tool check rows on the sheet (Finger Picks L4 and L8, Seafarer's Jacket L5 and L9, Green Reaper and Runetagger: 5 rows), builder spell step for `slotAdd` (Boon of High Magic L2 and L3, Universalist: 3 rows), Exhaustion release when the lock ends (Broken Vow: 1 row). 9 of the 42.

Total: 13 ledger rows unlocked (110 to 97 still skipped), 5 AC state rows from the mech baseline, 3 wave-2 rows beyond the table, 9 wave-2 gaps closed.

## Still skipped, with the reason

| Row | Reason |
|---|---|
| Chronomancy Initiate, Gun-Mage Adept, College of Chronology and Calligraphy (Chronomancy picks), Chronomancer, Sangromancer, Protomancer (2 rows) | The tag (Chronomancy, Sangromancy, Protospell, Firearm) is not in the spell table. The text names only three Chronomancy examples. A made-up list would be wrong |
| Libram of Souls and Flesh, Planecaller's Codex, Protective Verses | Spells in a spellbook the owner may prepare, not always prepared. Needs a `bookAdd` model, not a pick |
| Calligraphy Manuscript, Gourmand Fine Cuisine | Ritual-only spells kept in a book. Marking them always prepared would allow normal casting |
| Thayan Spell Tattoo | Already three single picks. The fixed DC 13 and +5 for non-casters is not modelled |
| Archivist Thesis | Per-thesis spell tables are not in the repo |
| Finger Gun Glove | The Finger Guns cantrip has no row in the spell table |
| Kensei weapon filters, Bladesinging one-handed pick | Weapon pick filter (melee, one-handed, Heavy, Special) is a different field, not in this wave |
| Universalist Universal Savant, Materializer Arcane Artisan, Daemonologist Stolen Secrets | Pick without school, `minending` condition, invocation list: each needs its own change |
| Draconic Rebirth (species swap) | Ambiguous: the gift does not say which dragonborn family applies, and `B.species` is read in about 100 places. A swap inside `gfx()` would leave the sheet half old, half new |
| Concentration Module | Save ability swap for Concentration saves: separate field, one row |
| Embedded Weapon | Weapon pick that becomes an item: the text names no weapon list |
| Girdle of Traveling Alchemy | Seven dawn consumables are already tracked as `lu` rows. Inventory copies would count twice |
| Couatl Herald items (set bonus) | Needs an item-count condition (three attuned items), not in this wave |
| Spell Dynamos, Path of Spellfury, Dramaturge, Mage Brand | Slot and known tables exist only in the book |
| Living Crucible, Big Game Hunter | `lu` max with a per-level offset or a formula that changes at a level: not a bump of another pool |
| Shadowsteel Caster, stage feats (Seraph, Specter, Ooze, Vampire) | Best of three abilities for `lu max`; stage feat reading a pick of another stage feat (`when.any` branch) |
| Homebrew Unarmored Defense, Steel Skin | No such feature exists in the repo (searched `hbpack-builtin-homebrew.js` and all `tp*.js`). Not guessed |
| Pencak Silat Defensive Stance | The AC bonus is a rolled 1d10 added to one attack, not a fixed value |
| Backup Dancers, Entourage, Miniature Minions, Witch's Gift, Gourmand Monster Meal (Dragon) | The bonus depends on a count of dancers or charmed creatures, belongs to an ally, or comes from a meal choice. Needs a count pick |
| Feathers Fly Speed (5 x Wisdom modifier) | `mv` takes a fixed number. The AC part is done |
| Infernal Bulwark, Coalition Recruit, Serpent Scale, Bounty Hunter's Vest, Elven Chain, Mithral Armor, Pigskin Armor, Absolute Chapter | Armor flag overrides and armor training from an item: not touched in this wave |
| Species swap rows other than Draconic Rebirth, Boots of Speed, Blood Ascendant (`speedMul`) | Not in this wave |

## Notes

- Ritual Caster (2014): the picked spells are always prepared on the sheet. A Defenses note says they are cast only as rituals.
- Spell Sniper (2014): the attack-roll filter is a name list of the PHB cantrips (the spell table has no attack flag).
- Forest Sage and Occult Knowledge: "a level you can cast" is read as half the character level rounded up (full caster).
- Stale note: the Defenses note of Blessed Reliquary in `fx-L2.js` repeats what `cdAdd` now counts. It is kept as it is.
