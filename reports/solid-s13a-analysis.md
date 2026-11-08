# SOLID stage 13A: the leftovers of Training Ground, Learn and boot

Scope: `src/tg` (20, 25, 30, 31), `src/learn/47-ui-learn.js`, `src/boot` (4 scripts). Not touched: `src/app`, `src/builder`, `src/fx`, `src/data`.
Hard constraint: identical behavior and identical order of effects. Old global names stay alive (`window.TGE`, `TGE.sim`, `__store`, `__errReport`, `__bldNeed`, `__lazyRun`, `__lazyReady`, `__lazyOn`, `__gateRun`, `__learnOpen`, `__learnBack`, `__learnState`).

## 1. Measurement

| Measure | origin/main a01bcd20 | After |
|---|---|---|
| guard_size, functions over budget in `src/tg` | 13 | 0 |
| guard_size, functions over budget in `src/learn` | 4 | 0 |
| guard_size, functions over budget in `src/boot` | 4 | 0 |
| guard_size, total (files + functions) | 173 | 152 |
| guard_window | 0 | 0 |
| guard_deps back-edges | 47 | 39 |
| guard_dispatch, guard_dup | 1, 0 | 1, 0 |

## 2. Method: explicit state

| Area | Problem in stage 12 | Change |
|---|---|---|
| `tg/20-engine.js`, `tg/25-sim.js` | classic UMD, the whole file is one IIFE, so any helper grows the IIFE | Both are now ES modules with no wrapper. `20` exports `TGE`, `25` imports it (`import {TGE} from "./20-engine.js"`). Both also write `export {X as "module.exports"}`, so `require("src/tg/20-engine.js")` in Node (22.12 or newer, CI uses 22) still returns the same object as before (`tests/tg_engine.js` is unchanged). The page global `window.TGE` is now set by `30-ui-tg.js` through `env.TGE=TGE` at the top of its body, before any use. The files left the `pre` list of the manifest (they are bundled with the tg block) |
| `tg/25` `pilot` | one function with a closure state (`st`, `cmds`, `tg`, `u`) | The state is one object `P`. Ten small functions take `P` (`go`, `me`, `inR`, `pickTarget`, `walkTarget`, `pilotOa`, `pilotWalk`, `pilotMulti`, `pilotSingle`, `pilotStrike`). The hero object `P.u` stays the one from the start of the turn, as before (the old code also read the stale unit) |
| `tg/20` six big functions | `advOf`, `reach`, `attack`, `save`, `cast`, `odds` | Helpers at module level in the same order of checks and effects: `advSelf advTarget advFor`, `reachFrom stepCost`, `atkCheck atkSpend atkReach atkRoll`, `saveSpend saveTarget`, `findSpell castCheck castLevel castFar castSpend castEffect castHit castSave castHeal`, `oddsHit oddsDamage`. A check returns its refusal text, the command returns `fail(st,text)` at the same place |
| `tg/30`, `tg/31` | `evText` (38 branches), `panelHtml`, `tapCell`, `wire` (83 branches) | `evText` is three switches tried in order. `panelHtml` gives its last string to `panelHtmlTail`. `tapCell` calls five handlers `tapMove tapLg tapTarget tapSpell tapSave`. The click handler of `wire` is a list of 36 functions `tgc01..tgc36(b,d,w)` that return true when they took the click, tried in the original order |
| `learn/47-ui-learn.js` | one IIFE of 230 lines, state `V` closed over by all handlers | The IIFE wrapper is gone. `V`, `OPENER`, `SHOTS`, `POPB` are module variables of the ES module (the file is bundled strict as before), so every handler already reads `V`. `step` gives six cases to `guessStep showStep pickStep gridStep sheetStep cardStep`. `drawFrame` gives three views to `frameMod frameTalk frameGrid`. The click handler of `wire` is a list of 35 functions `clk01..clk35(t,d,st,S)`, `onKey` is separate |
| `boot/*` | classic scripts, a helper outside the IIFE would be a page name | Several small IIFEs per script. They share one object that hangs on `BootEnv` (a top-level const of the head script, not a window property): `BootEnv.sg` (store-gate), `BootEnv.ld` (deferred loader), `BootEnv.err`, `BootEnv.dbg`. No `window` word added, no new page name. The pieces run in the original order. `store-gate` keeps `if(!indexedDB){useLS("none");return}` as `boot()` returning false, and only then registers `pagehide` and `visibilitychange` (as before) |

Names that guard_deps saw as new edges once the Learn and engine helpers became module-level (`reduce`, `onKey`, `after`, `show`, `near`, `next`; `reach`, `create`, `replay`) were renamed inside their files (`lrnReduce`, `lrnOnKey`, `lrnAfter`, `lrnShow`, `lrnNear`, `lrnNext`; `reachMap`, `createFight`, `replayFight`). The public key names of `TGE` are unchanged (`TGE.reach`, `TGE.create`, `TGE.replay`).

## 3. Proof

Beyond the standard evidence list (see the PR description):

| Check | Result |
|---|---|
| Differential fuzz of the engine, old file (origin/main, kept outside the repo) against the new module: 400 fights, 45551 random commands of every type (attack, oa, legendary, save, cast with levels, multi, move, dash, disengage, dodge, stand, help, manual, damage, heal, cond, end, and refused ones), the whole state compared as JSON after every command, `odds` for every action against 6 targets, `reach`, `hash` | 0 differences |
| Same for the simulation: `fight` on 60 groups, `est`, and `pilot` turn by turn on 30 turns each | 0 differences |
| `node tests/tg_engine.js 300` | same text as before (109 won, 191 lost, average 6.9 rounds, longest 26) |

### 3.1 Standard evidence (on the merge with origin/main 04f3141a)

| Test | Result |
|---|---|
| `solid_snapshot` full (2997 builds) | total a893fba7ab867bb0, page errors 0 (identical to the required total) |
| `solid_ui_snapshot` against a build of origin/main | 390x844: identical (280 steps total 18c6e679b5a4fc47 on the base side). 1250x850: identical in clean runs of A, B and C. Under heavy machine load a different single step differed in some runs, and base against base differed the same way (one run of the base itself gave 569f0901be409eef where two other base runs and the new build gave a749e498391181af) |
| golden_builds 1479, fx_engine 265, solid_contract (4766 checks), solid_ui_contract (308 checks), invariants (2220 builds, 0 violations) | pass |
| scenarios (3 required, both viewports) | 24 checks, 0 failed |
| perf_budget `--fast --runs 3 --check` | budget ok (raw heap 34.9 MB at 1250x850, limit 35, not raised) |
| e2e_fx_toggle, csp_check, split_dist, names_lint, storage_idb (39 checks), chaos_storage (seeds 0 to 39 in the first run) | pass |
| area tests: tg_engine 300, tg_ui, tg_layer, tg_n2, tg_dice, tg_queue, learn_flow, g4_play, learn_lint | pass (tg_queue and learn_flow each failed once on a timeout while eight other test runs shared the machine, and passed on the rerun with the same code. `lazy_parts` "early read" failed on the base too under that load) |
| guard_all | size 173 to 152, deps 47 to 39, window 1 (see 5), dispatch 1, dup 0 |

## 5. Not from this stage

`guard_window` reports 1 new use in `src/app/20-ui-portrait.js` (`IntersectionObserver`), and `tools/html_gate.py` reports 1 new site in `src/fx/00b-fx-shared.js`. Both come from origin/main commit 369edca4 (portrait picker), not from this branch. `tools/tsc_gate.py` still fails on `builder/00-env.js` (known on main since stage 12). Left for their owners.

## 4. Deferred

Nothing deferred in the three areas. Remaining over-budget functions of the whole tree are in `src/app`, `src/fx`, `src/builder` (other stages).
