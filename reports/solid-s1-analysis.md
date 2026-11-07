# SOLID stage 1: effect engine and builder derivation

Scope: `src/builder/11-logic-derivation.js` (gfx, abil), the registries `GX.<kind>` and `FXO` (read in 03, 09, 11, 14), the field consumers in `12-logic-export-to-sheet.js`, `13-logic-sources-and-packs.js`, `14-logic-multiclass-hp-shop.js`.
Hard constraint: identical behavior. Proof tool: `tests/solid_snapshot.py` (hash of the JSON of the sheet C and the derived D for 777 golden builds and 2220 invariant builds, 2997 builds in all).
Line numbers below are from `origin/main` at 334a05cb (before this stage) unless marked "now".

## 1. Measurement (before)

| Item | Value |
|---|---|
| `gfx()` wrapper (11:69) | 1 line, 194 chars. Settles `pbAdd`, builds the list up to twice |
| `gfx0()` (11:70-83) | 14 lines, of which `put()` (11:72) is one line of 775 chars |
| Effect kinds collected inside `gfx0` | 6: cls, sub, species, bg, feat, item (11:76-82) |
| Field groups handled inside `put()` | 5: `l` (level gate), `when` (pick gate), `abPick.from` (adds a pick), `spCls` "@asi" and "@abpick" (11:81, 82), `toggle` (11:74-75) |
| Branches inside `gfx0` | one per kind (6 `put` calls with their own label and key rules), 3 conditionals in `put`, 2 `map` rewrites for `spCls` |
| `abil()` (11:20-53) | 34 lines. 9 effect field groups inline: `abCut` (26-30), item `abil` (38), `abUp` (39), `abDown` (41), `abPick` up (42), `abUpPick` (44), item `setsc` (45-46), `abSet` and `abPick` set (47-48) |
| `toSheet()` (12:14-470) | 457 lines, 19 lines longer than 600 chars. About 35 effect field groups mixed with class specific rules |
| `gfx()` / `classFx()` call sites | 47 (12: 27, 11: 7, 09: 4, 14: 3, 16: 2, 01, 10, 13, 18: 1 each). Each site reads its own fields from the same entry list. 77 distinct entry fields are read in 09 to 16 |

Window reads and writes of the engine and builder logic (before):

| File | Reads | Writes |
|---|---|---|
| 03 | `window.GX` (14, 19), `window.FXO` (8, 9) | none |
| 09 | `window.GX` (286). Not engine: `WX*`, `DM_*`, `QREFS`, `QLIVE`, `HBIDX`, `__GLOSS`, `__gl14`, `fetch` (data loading of the feat and choice model) | `__sp14Set`, `QREFS`, `QLIVE`, `WXF_ALL` |
| 11 | `window.GX` (25, 57, 70), `window.THIRD_SUBS` (101, 103), `window.__sheetState` (85, 88, 132), `window.__inTS` (160) | none |
| 12 | `window.XSK` (44), `window.__appVer` (19), `window.__inTS` (187) | `window.__inTS` (187, 1 then 0) |
| 13 | `window.EFA_CLS` (46, 48), `window.EFA_NAMES` (46), `window.__gl14` (43) | `__setSrc`, `__hasItem`, `__hasSp`, `__hasBg`, `__hasGear`, `__spellNames`, `__hasAny` (24) |
| 14 | `window.GX` (54, 140) | none |

Bare data globals (no `window.` prefix) that the engine reads: `CLASSES`, `SPECIES`, `FEATS`, `BACKGROUNDS`, `SPELLS`, `WEAPONS`, `ARMOR`, `GEAR`, `SUB_GRANT`, `DMGI`, `PRICE`, `CF_FULL` and more (data scripts declare them as globals).

Module dependencies (imports, builder bundle, arrow = imports from):
`11 -> 01, 03, 04, 05, 09, 10`; `12 -> 01, 03, 04, 05, 08, 09, 10, 11`; `13 -> 03, 04, 05, 08, 09, 11`; `14 -> 01, 03, 04, 05, 09, 10, 11`. Calls that go the other way (earlier file calls later file) use the `__R` registry in `00-reg.js` (`__R.gfx`, `__R.fxv`, `__R.fxOk`, `__R.toSheet`, `__R.TL`, `__R.MCL` and about 100 more). `__R` is a service locator, not a typed interface.

## 2. SOLID violations (before) and what stage 1 did

| Letter | Violation | Where (before) | Stage 1 |
|---|---|---|---|
| S | `gfx0` collects six kinds and also applies five field rules | 11:70-83 | Split: sources in `11b`, field rules as entry handlers in `10b`, loop in `gfx0` (now 11:63-71, 9 lines) |
| S | `abil()` applies nine ability field groups next to the base rules | 11:20-53 | Nine handlers in `10c`, phases run from `abil()` |
| S | `toSheet()` mixes about 35 groups | 12:14-470 | Four groups moved to `11c` (speed, speedMul, darkvision, init). The rest is Deferred |
| S | `13` mixes pack merge, 2014 switch, EFA gating, window exports | 13:24, 43-48 | Window access moved to `00-env.js`. Split of the file is Deferred (no effect on engine) |
| O | A new field group needs an edit in `put`, `abil` or `toSheet` | 11:72, 11:20-53, 12 | New handler registered in a registry, no orchestrator edit (`tests/solid_contract.py` check 5 proves it) |
| O | A new source kind needs an edit in `gfx0` | 11:77-82 | `registerFxSource()` in `11b` |
| O | `fxOk` cond chain (12 string branches, 11:64) and `fxv` value rules (9 branches, 11:61) grow by editing | 11:61, 11:64 | Tables in `10d` (`registerFxCond`, `registerFxValue`). `fxOk` and `fxv` keep their signatures and look the word up. Ability keys and the `[[level, value]]` steps stay in `fxv` (they need `abil()` and recursion) |
| L | Contract is implicit: every consumer assumes the entry shape, a toggled off entry is cut to the keys in `TGKEEP` and every consumer must accept that | 11:73-74 and 47 consumers | Contract written down in `10a` (entry, patch forms, phases, "off" entry rule is the `toggle` handler). Consumers still read `gfx()` directly (Deferred) |
| L | Two shapes are both called "effect": `gfx()` entries and `activeFx()` rows `{n,fx,gx,att,arm,t}`. The ability phases take either, by phase | 03:19, 11 | Documented per phase (`item-raise`, `item-set` take rows, the others take entries) |
| I | `__R` bag gives every file all of the engine | 00-reg.js, 11:9-16 and 11:78-83 | Handlers get a narrow ctx (`sc, src, val, pick` or `ok, val, spd, dark` or `src, ch, fxT`). `__R` itself is Deferred |
| D | Engine reads page globals in 5 modules | list above | `00-env.js`: GX, FXO, `__sheetState`, THIRD_SUBS, `__inTS`, `__appVer`, XSK, EFA_*, `__gl14` are read only there. Old window names and the window exports of 13 stay (now published with `expose()`) |
| D | Derivation reads the model (`B`, `CLASSES`...) directly | everywhere | Handlers get data through ctx only. Collectors in `11b` still read the model (they are the adapter) |

L and I: for function and data code they only apply where code must follow one contract. Two real cases exist (the effect entry as the shared type, `__R`), treated above. No class hierarchy exists, nothing else to do.

## 3. What was built

| File | Role |
|---|---|
| `src/builder/00-env.js` | The only window access of the engine (D) |
| `src/builder/10a-logic-fx-registry.js` | Contract text, registries `entry`, `ability`, `sheet`, source list, cond and value tables, `runFxPhase`, `foldFxPhase`, pure helpers `abOfPick`, `chPick` |
| `src/builder/10b-logic-fx-handlers-entry.js` | gate-level, gate-when, spcls-alias, abpick-pick, toggle |
| `src/builder/10c-logic-fx-handlers-ability.js` | ab-cut, item-abil, ab-up, ab-down, ab-pick-up, ab-up-pick, item-setsc, ab-set, ab-pick-set |
| `src/builder/10d-logic-fx-rules-cond-value.js` | 12 condition rules (noHeavy ... mwArmor), 6 value rules (pb, rage, halfPb, halfPbUp, lvl, halfLvl) |
| `src/builder/11b-logic-fx-sources.js` | class, species, background, feats, items |
| `src/builder/11c-logic-fx-handlers-sheet.js` | speed-add, speed-mul, darkvision, init-bonus |
| `tests/solid_contract.py` | Contract test (in `.github/workflows/tests.yml`, job A) |
| `tests/solid_snapshot.py` | Proof tool for identical output (not in CI, it asserts nothing by itself) |

Manifest order: `00-env` after `00-reg`; `10a, 10b, 10c, 10d` before `11`; `11b, 11c` after `11` (they register at load, the loop runs later). `builder/main.js` imports them in the same order. Existing `GX.<kind>` and `FXO` registries are untouched; they are read through `00-env.js`.

## 4. Deferred (cannot be done in stage 1 without risk to identical behavior, or is outside the engine)

| Item | Why deferred |
|---|---|
| Move the other 31 field groups out of `toSheet()` (ac*, saveBonus*, skill*, senses, armor, weapons, tools, hp, slots, lu, def, spells...) | They share mutable locals (AC parts, `prof`, `exp`, `C.skills`) and run interleaved with about 40 class specific rules (for example 12:96-113 mix `clsParts` special cases with `gfx` groups). A pure patch form per group needs each group's state in ctx first. Four groups with simple state were moved to show the path |
| Replace the 47 direct `gfx()` consumers with phases | Same reason as `toSheet()`. 09, 10, 14, 16, 18 read fields for spells, picks, resources, HP: each is a group to move one at a time |
| Bare data globals (`CLASSES`, `SPECIES`, `FEATS`...) behind an accessor | Hundreds of references in the whole bundle. It would also change the identity of the objects data scripts patch at load |
| Remove `__R` | It breaks load order cycles (earlier file calls later file). Needs a module graph change |
| 09 window reads (`WX*`, `DM_*`, `QREFS`, `QLIVE`, `HBIDX`, `__GLOSS`) | Data loading of the 2025 sources and glossary, not the effect engine |
| Keep names of window globals | Kept on purpose (`__inTS`, `__setSrc`, `__hasItem`... and the data registries). Aliases are not removed in this stage |
| `fxv` ability keys and level steps | Still inline in `fxv`: they call `abil()` (recursion) and the step list calls `fxv` again. Not a table candidate without changing the call graph |

## 5. Results

Proof of identical behavior: `tests/solid_snapshot.py` hashes the JSON of C and D for 2997 builds (777 golden with their fxT, 2220 invariant builds). The tool waits for every deferred data part and ignores the cross link buttons in item texts (they depend on timing and made two runs on the same code differ in 10 to 13 golden builds, so the first draft of the tool was not usable as proof).

| State | Total hash |
|---|---|
| origin/main 334a05cb (run twice) | a893fba7ab867bb0 |
| after D (00-env) | a893fba7ab867bb0 |
| after S and O (handlers, sources, rule tables) | a893fba7ab867bb0 |
| after sheet handlers | a893fba7ab867bb0 |
| final (with hook, contract test) | a893fba7ab867bb0 |

Tests (same counts before and after, no rerun was needed):

| Test | Before | After |
|---|---|---|
| golden_builds | 1479 checks | 1479 checks |
| fx_engine | 265 checks | 265 checks |
| invariants | 2220 builds, 0 violations | 2220 builds, 0 violations |
| fx_overlap | 98 documented | 98 documented |
| mech_scan | 241 known, 24 by design, 0 new | 241 known, 24 by design, 0 new |
| dup_check | 119 builds | 119 builds |
| edition_isolation | 0 problems | 0 problems |
| e2e_fx_toggle, scenarios (24 checks), csp_check, lazy_parts (100), split_dist | pass | pass |
| perf_budget heap, 390 / 1250 | raw 31.33 / 34.08 MB (limit 35), GC 26.03 / 26.15 MB (limit 27) | raw 31.30 / 33.35, GC 26.05 / 26.13 |
| solid_contract (new) | | 1128 checks, 145232 handler runs on 2402 real entries |

Commits 2 to 4 were checked with the snapshot (full), golden_builds, fx_engine, fx_overlap, mech_scan, dup_check, edition_isolation, names_lint and `build.py --check`. The full list ran on the last commit.
