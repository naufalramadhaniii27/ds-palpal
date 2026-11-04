# fx-int status (paused by request)

Branch claude/fx-int, worktree /home/claude/w-int, base claude/w-eng.

Merged and committed (golden_builds passed after each): w-mc, w-inv, w-fixmiss, w-L1, w-L2, w-L3, w-L4, w-L5, w-L6, w-L7, w-L8.
Next merge: claude/w-L9, then L10..L13, then uiux-autolink-all, w-retro, w-audit (all exist on origin).

Last test: tests/golden_builds.py OK, 973 checks (after L8). fx_engine.py last run OK, 201 checks, after w-fixmiss only.
Not yet run on the merged tree: fx_engine, mech_scan, dup_check, invariants, e2e_fx_toggle, scenarios, perf, --check/--lint.

Notes:
- The fetch from origin filled the disk (a 4.6 GB tmp_pack). It was removed. All w-* branches in the local repo equal origin (checked with ls-remote), so no fetch was needed.
- Duplicate effects: L2..L8 define many of the same item names. Resolved per merge by dropping the duplicate (kept the fuller or toggled entry), then fixing golden fixtures to the kept toggle ids and pick keys. New tests/fx_overlap.py (+ tests/fx_overlap_loader.js) lists the rest. Still to do: tests/fx_overlap_allow.json for disjoint pairs (Dragon Masks, Exo-Frame, Ionbreaker, Couatl Herald's Mantle, Damglesvir, Pigskin Armor, Dekella, Indorius's Crown Master) and the pre-existing fx-A..G pairs; add it to .github/workflows/tests.yml.
- wotc11-magic-items-2014.js and manifest/SOURCE-NOTES were merged by union; tp*.js edits not yet logged (reports/tp-direct-edits.md pending).
- Helper scripts used for the dedupe are in tools/ (apply3.py, drop.py, auto.py ...) and may be removed before the final PR.
