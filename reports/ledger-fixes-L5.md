# Ledger L5: fixes for shards 12, 13, 14

Branch `claude/w-L5`. Data: `src/data/fx-L5.js` (registered in `src/manifest.json`, block hbpack after fx-G, and in `SOURCE-NOTES.md`). Goldens: `tests/golden/builds/fx_L5_*.json`, written by `tools/gen_fx_L5_goldens.py`.

## Counts
140 verdict rows (MISS 105, MISS_TOGGLE 9, MISMATCH 26 plus). All handled: see the skipped file for the rows that are partial.

## Edits to original data (an override could not work)
| File | Row | Change | Why |
|---|---|---|---|
| `src/data/wotc11-magic-items-2014.js` | Staff of Ruling | `ch` 1 to `[3,"all","dawn"]` | three effects, each once per dawn. FXO cannot replace `ch` |
| `src/data/wotc11-magic-items-2014.js` | Stonemaker War Pick | `ch` unparsed `{@dice 1d6 + 1}` to `[1,"1","dawn","Meld into Stone"]`; petrification charges are a `lu` row in fx-L5 | the tag string was not a number |
| `src/data/tp01-tdcsr.js` | Star Razor (Awakened, Exalted) | `ch` to 2 and 3 | one use per spell: Faerie Fire and See Invisibility, Exalted adds Fly |
| `src/data/tp08-tghg.js` | Pigskin Armor | `base` Hide Armor to Studded Leather Armor | the text says it counts as light armor; the profile 12 + Dex stays, Dex cap and category are fixed |

`tp*.js` has no JSON source in the repo (see SOURCE-NOTES), so these four edits are direct and would be lost by `tools/tp_build.py`.

## Spec errors found
- Shield of Yggdrasil: the reviewer read the raw row (`ac:3`). `FXO` in fx-D-item.js already sets `ac:1`; the sheet total (Shield 2 + 1 = 3) equals the text. No change.
- Necronomicon Ex Corvis: spec said no cap; the engine needs a number, so the cap is 30 (the general score maximum).
- Star Razor (Exalted): spec said "at least 2"; the text lists three spells (Faerie Fire, See Invisibility, Fly), so 3.
- Starmetal Shield: spec said `shAc:1`. `shAc` adds on top of the Shield; the text replaces the Shield bonus, so the row `ac:1` became `ac:-1` (Shield +2 and -1 = +1).
- Squasher: spec said toggle plus class condition. A Druid entry in `GX.cls.Druid` with `atkAb` on the row "Squasher" does the same without a switch.
- Ring of Fire Elemental Command: spec asked only for the language; the old `imm:Fire` was also on without the slain-elemental condition, now a switch, with Resistance to fire always (the text).
- Raptor and Strig Feather Robe, Spell Duelist's Trophy and others carry `by` text: `byOk` reads class names case-sensitively, so "Sorcerer, warlock or wizard" needs a Sorcerer level to work. Not changed (engine).
- Stone of Good Luck: same effect is in `fx-H-audit.js` of branch `claude/w-fixmiss` (not merged here). fx-L5 removes other entries with a check bonus for this item when it loads after them; if fx-H loads after fx-L5, drop the item from one of the two files.

## Switches added (S.fxT ids)
nepenthe-drawn, nightbringer-evil, nimbus-cloud, cloak-hood-up, glacial-potion, ring-air/earth/fire/water-slain, ruidium-rage, shaarat-favors, dreadnought-active, sirensong-on, spellguard-held, splitter-split.

## Picks added
Nightbringer immunity, Pariah's Shield allies, Resistance Plating, Resistance Suture, Ring of Resistance, Ring of Seething, Ring of Elemental Command plane, Starmetal Solar Axe form, Raptor and Strig Feather Robe ability.
