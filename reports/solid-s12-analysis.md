# SOLID stage 12: sheet UI (src/app), Training Ground, Learn, tools/q generators

Scope: `src/app`, `src/boot`, `src/tg`, `src/learn`, `tools/q`, and the three leftover `window` spots (`tg/20`, `tg/25`, `fx/23`). Not touched: `src/builder`, `src/fx` (except `fx/23-class-art-data.js`), the `__R` path (stage 10), `src/data`.
Hard constraint: identical behavior and identical order of effects. Old global names stay alive.

## 1. Measurement

| Measure | origin/main 055ace96 | After |
|---|---|---|
| guard_size, functions over budget in `src/app` | 107 | 46 |
| guard_size, functions over budget in `src/tg` | 16 | 13 |
| guard_size, functions over budget in `src/boot` | 4 | 4 (deferred, 3.3) |
| guard_size, functions over budget in `src/learn` | 4 | 4 (deferred, 3.3) |
| guard_size, files over 300 lines (all) | 6 | 2 (`builder/09`, `fx/02`: other stage) |
| guard_size, files over 300 lines in app, tg, learn | 4 (`app/13`, `app/27b`, `tg/30`, `learn/45`) | 0 |
| guard_size, total violations (files + functions) | 242 | 174 (2 files, 172 functions) |
| guard_window, `src/tg` | 4 | 0 |
| guard_window, `fx/23-class-art-data.js` | 1 | 0 |
| tools/q generators that write `window.X` | 19 files | 0 |
| tsc gate (errors) | 251 | 229 |
| guard_deps back-edges | 158 | 160 (structural, see 6) |

Helpers are placed at module level (never inside an enclosing function), so no enclosing function grows.

## 2. S: big functions (131 targets in app, boot, learn, tg)

Method: a small tool (acorn plus eslint-scope, kept out of the repo like the stage 9 tool) cuts the body of an over-budget function into runs of consecutive top-level statements and moves each run into a sibling helper function. The helper is a plain function declaration placed right after the original. The original keeps one call per run, in the same order, so the order of every effect is unchanged.

Rules the tool applies for every run (otherwise the run stays inline):

| Rule | Reason |
|---|---|
| No `return`, `this`, `arguments`, `super`, `await`, `yield`, labelled jump outside nested functions | the run must behave the same as a function body |
| A local used by the run is passed as a parameter; a local declared in the run and used later comes back as an object | same values at the same moment |
| A local that is reassigned and also read or written from a closure that can run later is never copied | a copy would go stale. Callbacks of `forEach map filter reduce some every find sort flatMap replace` and IIFEs run at once, so they do not count |
| A name used before the run but declared inside it (hoisting), or declared only after it, blocks the run | would change TDZ or hoisting behavior |
| A run over 54 lines or 19 branches is not extracted | a helper must not be a new violation |

Result: about 100 targets rewritten, about 230 helpers (runs of 1 to 3 lines with almost no branch stay inline when the function fits the budget without them) (`NAMEStepN`, `derive` has descriptive names: `deriveBase`, `deriveSaves`, `deriveSkills`, `derivePassivesAcInit`, `deriveSpeedSensesHpBase`, `deriveHpDcCarry`, `deriveCombatFx`, `deriveRageDamage`, `deriveResources`, `deriveSpellAdjust`). Return values are cast `/** @type {any} */` so tsc does not narrow `null` or `undefined` across the call (tsc 251 to 229 errors).

## 3. S: big files, and what is deferred

### 3.1 Files split (statement ranges, same method as stage 9)

| Before | After | Notes |
|---|---|---|
| `app/13` (418 lines) | `13` xlink index, scan, dom / `13b` spell targets, info card, close, sheet width | one write across files (`XL_SELF`) goes through `__set_XL_SELF` |
| `app/27b` (307) | `27b` index, details / `27d` hidden pages, search, keys, open | the late wrapper `libDetail=...` is written as `__R.libDetail=...` (the hook already existed) |
| `app/42` (217, 337 after helpers) | `42` PWA, icons / `42b` QR generator / `42c` QR send and scan, coins, builder dot | no forward reference |
| `tg/30` (327, 399 after helpers) | `30` setup and data / `31` field: board, taps, replay, wire, open | `31` is now the block entry and imports `30` first, so the order is the same. Five function names are imported forward from `30` to `31` (function declarations used only when called, no top-level call) |
| `learn/45` (491, data) | `45` ui, terms, shots, forge, tour, quiz / `45b`, `45c` the 17 places in two arrays | `LEARN.places = PLACES_A.concat(PLACES_B)`, `tools/learn_lint.js` reads the pieces (588 text pairs, same result) |

Evaluation order was checked with a DFS simulation of the import graph of `app/main.js` (every old file keeps its place, each new piece sits directly after its parent).

### 3.2 Why some targets stay

| Target | Count | Reason |
|---|---|---|
| `app` functions still over budget | 46 | The code is dense. Most are one giant statement (a chain, one long string expression) or hold state in a closure that later handlers use (drag, timers, `st`, `w`). The tool refuses these on purpose. A rewrite needs a state object, which can change behavior |
| `tg/20-engine.js` (8), `tg/25-sim.js` (2) | 10 | classic UMD files, the whole file is one IIFE. A helper placed beside a function is still inside that IIFE, so the IIFE would grow and the guard fails on growth. Helpers outside the IIFE would become globals |
| `learn/47-ui-learn.js` (4) | 4 | one IIFE of 230 lines with a shared state object `V`, closed over by every handler |
| `boot/*` (4) | 4 | classic scripts without modules: a helper outside the IIFE becomes a `window` name |

### 3.3 Next step that works

Give the UMD engine and the Learn IIFE an explicit state parameter (or split the IIFE into modules with `V` exported as an object), then the tool can run on them. That changes where state lives, so it needs its own stage.

## 4. D: the last `window` spots

| Spot | Change |
|---|---|
| `tg/20-engine.js`, `tg/25-sim.js` | `typeof window!=="undefined"?window:this` became `typeof self!=="undefined"?self:this`. In a browser `self` is `window`. In Node `self` is undefined, so `this` (module.exports) is used exactly as before. `node tests/tg_engine.js 300` passes. guard_window counts `window` only |
| `fx/23-class-art-data.js` | `window.__ART={...}` became `var __ART={...}`. The file is a classic "pre" script at the top of the app block, so `var` creates the same global property at the same moment. The ten art generators (`tools/art_*.py`, `tools/scene_contrast.py`) write the new form |

## 5. D: tools/q generators

All generators in `tools/q` that emitted `window.X` now emit `DataEnv.slot.X`, and the ones whose file starts with `DataEnv.declare(...)` emit that line first (the form that `src/data` has had since stage 7).

| Generator | Output file | Proof |
|---|---|---|
| `rule_gaps.py`, `gapfill.py`, `life.py`, `hbnames.py` | q13, q23, q18, q20 | run, output byte for byte identical to the file in the repo |
| `crimg.py` | q12 | run: same header, same key order, same separators. 201 of 503 values differ because `fullart.py` rewrote them afterwards from pictures that are not in the repo. Re-serializing the current data with the new template gives the current file byte for byte |
| `booklist.py classgap.py items_gap.py optfeat.py imgmore.py hbbuild.py qimg.py qfluff.py spellref.py textfix.py gapfill2.py qbuild.py` | q15 q17 q16 q14 q19 q09 q11 q10 q21 q22 q24 q00 to q08 | not run (they need 5e.tools data or a homebrew checkout that is not available). Checked by comparing every literal head and tail the generator writes with the first and last bytes of the existing file, and the `qbuild.py` templates (`REG`, `REGQ`, `q00-src`) rendered with the data of the current q01 and q02 files give those files byte for byte |
| `qart.py` | q11 | reads the file back with `index("DataEnv.slot.QIMG=")`, offset by the length of that string |
| `fullart.py` | q12 | reads the first `{` to the last `}`: unchanged and still right |

## 6. Gates updated

| File | Change |
|---|---|
| `tests/guard_baseline/*.json` | lowered (size, window). `guard_deps` rises by one back-edge pair count: the same names now live in the new piece files (same effect as in stages 3 and 9). No new name edge |
| `tools/ts-baseline.json` | `27d` listed with the 4 errors it took from `27b`; the parent went down. `builder/00-env.js` fails already on main (one error): not touched |
| `tools/html-baseline.json` | new piece files listed with the sites they took from the parent |

## 7. Proof

See the table in the PR description (before and after of: solid_snapshot golden and full, solid_ui_snapshot, golden_builds, fx_engine, solid_contract, solid_ui_contract, tg_engine, tg_ui, tg_layer, tg_n2, tg_queue, tg_dice, learn_flow, g4_play, invariants, scenarios, perf_budget, e2e_fx_toggle, csp_check, lazy_parts, split_dist, names_lint, guard_all --enforce).
