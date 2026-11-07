# SOLID stage 9: sheet UI (src/app), boot, Training Ground, Learn

Scope: `src/app`, `src/boot`, `src/tg`, `src/learn` on origin/main 416df4b9 (after stages 6 and 8). Not touched: `src/builder`, `src/fx`, `src/data`, `src/css`, `src/html`.
Hard constraint: identical behavior. Old global names stay alive as aliases (the builder, fx packs, tests and the Training Ground still read `window.NAME`).

## 1. Measurement (before and after)

| Measure | Before | After |
|---|---|---|
| guard_window, `src/app` | 112 | 0 |
| guard_window, `src/boot` | 54 | 0 (`boot/boot-env.js` is the env module, exempt) |
| guard_window, `src/learn` | 24 | 0 |
| guard_window, `src/tg` | 29 | 4 (see 3, UMD engine) |
| guard_window, all of `src/` | 911 | 696 |
| guard_size violations (files and functions over budget) | 247 | 242 |
| guard_deps back-edges | 137 | 158 (structural, see 4) |
| guard_dispatch, guard_dup | 1, 1 | 1, 1 |
| `__R` names / uses in `src/app` | 280 / 775 | 275 / 767 |
| Files in `src/app` (without `main.js`) | 72 | 83 |
| Largest `src/app` file (code) | 74,955 bytes (27b) | 74,928 bytes (27b). Data only: 16b 52 KB |
| 08 / 15 / 16 / 29 / 32 / 34, bytes before | 56.5 / 56.6 / 62.2 / 45.7 / 45.6 / 49.9 KB | each piece below 35 KB, except the data table `16b` (52 KB, one table, one job) |

## 2. D: environment modules

| Module | Bound names | What it hides |
|---|---|---|
| `app/00-env.js` (extended) | +27 browser names | `addEventListener`, `removeEventListener`, `matchMedia`, `innerWidth`, `innerHeight`, `scrollY`, `scrollTo`, `scrollBy`, `focus`, `print`, `fetch`, `requestAnimationFrame`, `showSaveFilePicker`, `CSS`, `claude`, `devicePixelRatio`, the observers, `CompressionStream`, `BarcodeDetector`, `documentPictureInPicture`, `launchQueue`, `scheduler`, `isSecureContext` |
| `boot/boot-env.js` (new) | 17 hooks, 5 browser names, 3 bound methods, `isWindow(t)` | the boot scripts are classic scripts without imports. The env is a top-level `const BootEnv` of the first script: later classic scripts share it and it is not a window property (no new window name) |
| `tg/00-env.js` (new) | 19 names | `__MI`, `__app`, `TGE`, `CLASSES`, `__dice3d`, bridges the screen publishes |
| `learn/00-env.js` (new) | 15 names | `__MI`, `__app`, `__tour`, `__spot` and the other bridges |

Getters read `window[n]` at the moment of use and setters write it, so a test that replaces `window.print` or `window.addEventListener` is still seen. Methods that need `this` to be the window (`addEventListener`, `matchMedia`, `scrollTo`, `showSaveFilePicker`, `fetch`, `print`, `focus`, `requestAnimationFrame`) are returned bound. `"launchQueue" in window` became `env.launchQueue&&...` (same result: the next test of the line checked the same value). `this` of bridge calls is `env` instead of `window`: no bridge function uses `this`.

## 3. Deferred in D

| Item | Why |
|---|---|
| `tg/20-engine.js`, `tg/25-sim.js` (2 uses each) | UMD wrappers `typeof window!=="undefined"?window:this`. In Node (tests) `this` is `module.exports`; any other expression changes where `TGE` attaches |

## 4. S: six big files split

Method: `/tmp` tool (acorn plus eslint-scope), pieces are contiguous ranges of top-level statements, so the order of execution of every impure statement is unchanged. A piece that only holds function declarations, pure initial values and `env.X=fn;` lines may be evaluated earlier by a forward import (cycle in a bundle is fine for such pieces). Where that is not true the reference goes through `__R` (the existing pattern). Importers of the old file were rewritten to import each name from the piece that owns it. `tests/solid_ui_contract.py` and the snapshot prove the result.

| Before | After | Notes |
|---|---|---|
| 08 (56 KB, 5 jobs) | 08 identity, abilities, skills / 08b summaries and Actions page / 08c Inventory, Features, Notes | no forward reference |
| 15 (57 KB, 5 jobs) | 15 roster and Home / 15b backup / 15c file state, compression, Home info / 15d snapshots and character files | one name (`BIN_OPEN`, written from Home) goes through `__R`. 15b, 15c, 15d run before 15 (pure pieces, forward imports from Home) |
| 16 (62 KB in 65 lines) | 16 import / 16b data: release notes table (52 KB) / 16c What is new window and backup hooks | all three pure |
| 29 (46 KB) | 29 features and proficiencies / 29b creatures and Extras / 29c icon table (data) | |
| 32 (46 KB) | 32 undo / 32b concentration and casting / 32c temporary features, potions, ammo / 32d HP, rest recovery | no forward reference |
| 34 (50 KB) | 34 situations / 34b combat effects and modes / 34c experience, journal, combat view | no forward reference |

Evaluation order was checked with a DFS simulation of the import graph (`main.js`): the only modules that move are the pure ones (15b, 15c, 15d, 25, 26, 33 and files that import them).

guard_deps rises from 137 to 158 only because the same back-edges now name more files (same effect as in stage 3, 140 to 146). No new name edge was added. The baseline was updated for that reason, after the window and size totals went down. `tools/ts-baseline.json` and `tools/html-baseline.json` were updated too: the split files carried the old errors of their parent (tsc 250 before and after, html sites 250 before and after; the CI gate wants every new file listed).

## 5. O and L: registries

| Registry | Key | Entries | Dispatcher |
|---|---|---|---|
| SEARCHGRP (new) | id of a result group of the Search sheet | 6 (`spells attacks inventory features rules other-spells`) | `gsHTML` (marked `solid:orchestrator`): asks each entry for its rows, in registration order |
| OVERLAY (new) | id of an overlay layer | 9 (`context-menu ask training-ground learn builder hp-quick-menu backup-window sheet home`) | `ovTop` (marked): first layer whose `top()` answers a function. Registration order is the z-order, same as the old chain |
| PANEL (new) | id of a sheet page | 9 (`p-main ... p-ext`) | `PAGES` is `PANEL.keys()`. The Search commands "go to ..." are built from the entries (the `PAL_TABS` array is gone). The tab buttons are markup and stay in `sheet-body.html`: a new page still needs that one markup edit |

`tests/solid_ui_contract.py` checks them now (308 checks): shape of each entry, that `top()` answers a function or null, and the O proof (a new search group is shown in Search with no edit of `gsHTML`).

## 6. `__R` (service locator)

Not removable as a whole. `__R` exists because a reader file is earlier in the load order than the owner, and an import would move the owner (and everything it imports) before the reader. Measured on the graph: of the 45 names whose owner file holds only function declarations and pure values, only 6 could be imported without moving an impure file; one of the 6 (`ICO`) is tested for `undefined` by early callers, so importing it would change behavior. Done: 5 names (`spUpMax spUpOk spUpOn cuW modeOn`) became imports. Not done: 275 names. Next step that works: move load-time statements (listener setup, `env.X=` publishing) out of the owner into a small init file, so the owners become pure and every reader can import. That changes where statements run, so it needs its own stage.

## 7. Proof

| Test | Result |
|---|---|
| `solid_ui_snapshot` | see the table in the PR. Scenario A at 1250x850 is flaky in the baseline itself: the fx scroll handler toggles the `mi-bs` class on the header and the Search input keeps text, depending on timing under load. Two baseline runs of the same steps gave two different hashes, and the new build matched the stable one |
| golden_builds | 1479 |
| fx_engine | 265 |
| solid_snapshot --golden | 777 builds, same total as before the stage |
| solid_ui_contract | 308 checks |

Final numbers of the full list (invariants, scenarios, perf_budget, e2e_fx_toggle, csp_check, lazy_parts, split_dist, names_lint, guard_all --enforce, full snapshot) are in the PR description.
