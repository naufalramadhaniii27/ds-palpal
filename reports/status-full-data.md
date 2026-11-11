# Status full data (2026-11-11)

Released on main: 0.0.23 (72 Valda 2014 core-class subclasses), 0.0.24 (34 Valda 2014 monsters, Investigator and Warmage feature names), coverage gate (tools/audit_coverage.py, tests/coverage_gate.py, Job A).

## Sources
Source files come from https://github.com/TheGiddyLimit/homebrew (folder collection). Local clone: /home/claude/src-data/hb-full (sparse, collection only), copied to /home/claude/src-data/hb/collection (HB_DIR). Re-create with:
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/TheGiddyLimit/homebrew.git hb-full; cd hb-full; git sparse-checkout set collection; git checkout
Not yet cloned: 5etools-src, unearthed-arcana, open5e-api.

## Coverage gate
Run mode: HB_DIR=/home/claude/src-data/hb/collection python3 tools/audit_coverage.py --run --update tvss14 (writes reports/coverage-gaps.json and tests/coverage_baseline.json). CI check mode reads the committed report, so refresh and commit the report whenever a book changes. It counts GAP rows from tools/tp_build.py. It does not yet compare every source entry per ID against built data. Open: per-ID comparison against all four sources.

## Next books (step 2, explicit 2014)
| Book | File | Content | Overlap with built 2024 twin |
| --- | --- | --- | --- |
| Dark Matter 2014 | Mage Hand Press; Dark Matter - 2014.json | 1 class, 36 subclasses, 212 subclass features, 49 optional features, 59 feats, 64 spells, 191 items, 90 monsters, 65 vehicles | 17 of 36 subclasses, 19 of 59 feats, 22 of 64 spells share names with tsdm |
| Grim Hollow Player's Guide 2014 | Ghostfire Gaming; Grim Hollow - Player's Guide - 2014.json | 24 subclasses, 166 subclass features, 115 optional features, 42 spells, 86 items | not measured |
| Grim Hollow Campaign Guide 2014 | Ghostfire Gaming; Grim Hollow - Campaign Guide - 2014.json | 146 optional features, 24 backgrounds, 11 feats, 18 spells | not measured |

Method that worked for Valda 2014: BOOKS entry in tools/tp_build.py (ed "2014", subsfx " (2014)"), own-wording overlays in tools/tp/overlay/<id>_*.py (dump source text first, write fresh English), build with HB_DIR=... TP_ONLY=<id> python3 tools/tp_build.py, then python3 build.py, mech_scan by_design entries, version bump, CI Job A and B.

## Remaining Valda 2014
Channeler multiclassing (source gives none, by design). 38 overlay rows without a source feature (names that differ from the source, review).

## Open decisions
None blocking.
