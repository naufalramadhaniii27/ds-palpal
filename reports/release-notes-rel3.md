# Release 3: engine v6, fx batch M2 and N1, clause gate (report mode)

Branch `claude/rel3`. Base: `origin/main` at 33bd000e (Release 2, PR 4). Merged in: `claude/w-eng3` (engine v6 and fx-M2, ea3a2ddb) and `claude/clause-gate2` (clause gate and fx-N1, 62b8c22b, which includes `claude/clause-gate` eb77bc9d).

## What is in it

| Part | Content |
|---|---|
| Engine v6 | Spell filters on picks (`t:"spell"` with level, class, ritual, school, names), `spCls:"@pick:k"`, `luBump` and `cdAdd` for resource pools, `offHand`, `wmAdd`, `sizeSet` and `dieStep`, `grantItem`, `slotAdd` in the builder spell step, Exhaustion release, tool check rows on the sheet |
| fx-M2 | `src/data/fx-M2.js`: 13 ledger rows unlocked (110 to 97 still skipped), 5 AC state rows from the mech baseline, 3 rows of wave 2 beyond the table, 9 wave 2 gaps closed. Details in `reports/ledger-m2.md` |
| fx-N1 | `src/data/fx-N1.js`: 70 entries, 68 goldens `tests/golden/builds/fx_N1_*` |
| Clause gate | `tests/clause_gate.py` in report mode (does not fail the build): reason coded excuses, selftest with mutation test, audit 2. Reports: `reports/clause-gate-report.md`, `reports/clause-gate-audit2.md` |

## Merge notes

| Item | Result |
|---|---|
| Merge of origin/main into rel3 | Clean, no conflict |
| Merge of clause-gate2 | Conflicts only in `index.html`, `sw.js` (resolved with `git checkout --ours`, then `python3 build.py`), `src/manifest.json` (kept both `data/fx-M2.js` and `data/fx-N1.js`), `tests/fx_overlap_allow.json` (union of both sides) |
| `SOURCE-NOTES.md`, `tests/golden` | Merged automatically, no conflict |
| Double counting M2 and N1 | `tests/fx_overlap.py` passes. No name appears in both fx-M2 and fx-N1, so no entry was removed and no new allow entry was needed. 98 documented overlaps after the merge (65 in main before, 72 on the M2 side, 91 on the N1 side). Two keys were changed on one side only and one on both sides (`GX.item|Exo-Frame`, kept the M2 text because it lists fx-M2) |
| Part count in `tests/split_dist.py` | 35 parts plus one lazy part (36 files in `p/`). The check passes at both viewports with no change to the test, so no new deferred part came from M2 or N1 |
| `tp*.js` | Not touched |

## Tests (run through /home/claude/ledger/runslot)

| Suite | Result |
|---|---|
| build --check | index.html same, sw.js same, hash 316574ae990999f5, vendor/pdf ok |
| build --lint | 237 JS pieces, 44 script blocks, 0 failed |
| golden_builds | OK, 1440 checks |
| fx_engine | OK, 265 checks |
| mech_scan | OK, 241 known gaps, 24 by design, 0 new (38 closed since the baseline, baseline not updated) |
| dup_check | OK, 119 builds |
| invariants | OK, 2220 builds, 0 violations |
| fx_overlap | OK, 1277 names in 25 fx files, 98 documented overlaps |
| e2e_fx_toggle | OK at 390x844 and 1250x850, no errors |
| scenarios | 24 checks, 0 failed at 390x844 and 1250x850 (see note 1) |
| csp_check | csp 0, tt 0, errors 0 at both viewports |
| perf_budget full | budget ok. Max over 4 runs: heap_home_raw 33.91 MB (budget 35), heap_home after GC 26.13 MB (budget 27), heap_tools 60.25 MB |
| lazy_parts | OK, SCORE 100 |
| split_dist | all checks pass (see note 1) |
| names_lint | 4 checks, 0 failed |
| golden_rules | 0 sanity failures, 0 oracle differences, 0 changed characters |
| version_label | 9 checks, 0 failed |
| fonts_dist | OK, SCORE 100 (see note 1) |
| edition_isolation | 0 problems |
| metamorphic | 0 broken |
| clause_gate --selftest | OK, mutation cases flagged |

Note 1: the first parallel round ran at load average 12 to 14. `scenarios` (5 checks at 1250x850: Yudhi card missing), `split_dist` (`__bldPendList` only in the split window at 390x844) and `fonts_dist` (offline reload) failed under that load. Rerun at load 3 to 4: all three pass with no code change. `__bldPendList` is old code (`src/app/42-logic-pwa-qr-icons-wallet.js`), so this looks like timing, not a regression of this release.

## Visual check (Playwright, both viewports, no page errors)

Warden (golden `warforged_warden10_tower`, Warden 10) on Actions and Features and Traits. Examples from the M2 goldens:

| Feature | Build | Sheet | Builder |
|---|---|---|---|
| offHand | Fighter 5, Two-Weapon Fighting | Actions has "Shortsword (off-hand)" and "Dagger (off-hand)" rows, damage 1d6+3 | opens, text has Two-Weapon Fighting |
| grantItem | Fighter 5, Exo-Frame | Actions and Inventory show Battlefist | opens, text has Battlefist |
| Spell filter pick | Fighter 5, Forest Sage (Goodberry, Shield) | Spells tab lists Goodberry with source Forest Sage | opens, text has Goodberry and Forest Sage |

Screenshots (20 files, 12 MB, not committed to keep the repo small): `/tmp/claude-0/-home-claude/6717b3a4-237f-5333-9ca8-5177ec02a694/scratchpad/rel3-shots/`.

## Behavior changes

| Area | Change |
|---|---|
| Picks | Spell picks can filter by level, class list, ritual tag, school and name. Feats such as Forest Sage and subclass features such as Occult Knowledge now ask for spells in the builder and list them on the sheet |
| Off-hand | Two-Weapon Fighting adds an off-hand row with the ability modifier for each Light melee weapon |
| Items | Exo-Frame adds two Battlefists and the matching attack row (`grantItem`) |
| Pools | Blessed Reliquary and Focused Fighting or Hunter (Adrenaline Point) change pool size or die through `luBump` and `cdAdd` |
| Mastery, size | Third mastery weapon (`wmAdd`), size change with die step (Lilliputian) |
| AC states | Agile Parry, Evasive Fighter, Anticipatory Strike, Blood-Drunk, Swift Glide and Enchanted Wings have toggles |
| Builder | `slotAdd` shows in the spell step. Sheet shows tool check rows |
| fx-N1 | 70 more entries for the sheet numbers |
| Clause gate | Report only, new tests and reports, no effect on the app |
| Storage | No localStorage key renamed, no migration needed |

## Known gaps

| Gap | Note |
|---|---|
| 97 ledger rows still skipped | Reasons per row in `reports/ledger-m2.md` (for example Chronomancy tags missing in the spell table, spellbook model `bookAdd`, weapon pick filters) |
| mech_scan | 241 known gaps remain, 38 closed since the baseline. Baseline file was not updated in this release |
| Clause gate | Report mode only. It does not fail the build yet. Many sentences are still uncovered (see `reports/clause-gate-report.md`) |
| Test timing | `scenarios`, `split_dist`, `fonts_dist` are sensitive to high machine load (note 1) |
| Screenshots | Not committed (size) |
