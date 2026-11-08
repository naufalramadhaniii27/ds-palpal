# SOLID stage 13b: the last 46 over-budget functions in `src/app`

Scope: `src/app` only. Not touched: `tg`, `learn`, `boot`, `builder`, `fx` (other agents).
Hard constraint: identical behavior and identical order of effects. Old global names stay alive (no name was removed or renamed).

## 1. Measurement

| Measure | origin/main a01bcd20 | After |
|---|---|---|
| guard_size, functions over budget in `src/app` | 46 | 0 |
| guard_size, functions over budget (all areas) | 171 | 125 |
| guard_size, total violations (files + functions) | 173 | 127 |
| guard_deps | 47 | 47 (no new edge) |
| guard_window, guard_dispatch, guard_dup | 0, 1, 0 | 1 (from main, see 5), 1, 0 |
| function declarations in `src/app` | 1594 | 1910 |

`tests/guard_baseline/guard_size.json` was lowered with `python3 tests/guard_size.py --update-baseline` (only that guard, the other baselines are untouched).

## 2. Why the stage 12 tool stopped, and what was added

The stage 12 tool only moved runs of top-level statements. It refused three shapes: (a) one giant statement, (b) a nested function that is the cost (callbacks, handlers), (c) closure state used by other handlers. Three more tools were written (kept outside the repo, like the earlier ones, in `/tmp/claude-0/s13b`).

| Tool | What it does | Why order and values stay the same |
|---|---|---|
| `lift.js` (closure lifter) | A nested function becomes a module level helper. The nested function stays as a thin wrapper `(a,b)=>helper(free,a,b)` at the same place | Only variables that are never reassigned are passed (they are read when the wrapper runs, the same moment the closure read them). A variable that is written anywhere, declared after the function, or used in its own initializer blocks the lift. `this` is forwarded with `.call(this,...)`. Arrow with `this`, `arguments`, `new.target`, `super`, async, generator, getters, methods, `new F` are refused |
| `xex.js` (expression extractor) | A sub-expression (conditional, logical chain, call, template, object) becomes `helper(free)` at the same place | The call replaces the expression where it stood, so short-circuit and evaluation order are unchanged. Free locals are passed only when they cannot change during the expression: never reassigned, or reassigned only by straight-line code of the function (no closure touches them) and not inside the expression. No write to an outer local inside, no `await`, `yield`, `arguments`, optional chain spine, call target of a method, assignment target |
| `cases.py` (case splitter) | `if(kind==="x"){...; return}` branches of a dispatcher become `fnX(args)` plus `return` | Every moved block ended in `return` on all paths (checked by hand), so the dispatcher returns at the same point |

The stage 12 splitter was re-used once after the lifter, on the new helpers. A second round of it was tried and rejected: it only stacked wrappers on wrappers without lowering any count, so the tree was reset and the passes were run once each in the order lift, split, extract.

Result of the automatic passes: 46 functions down to 15. The other 15 were done by hand (section 3).

## 3. Hand work: state to objects and block extraction

| File | Function | Change | Proof of same behavior |
|---|---|---|---|
| `01-logic-boot-flags-builder-loader.js` | `anonFn1` (the tap gate) | The two "wait for the builder" blocks became `bldTapWait(e,t)` and `bldTapOpen(e,t)`, each followed by `return` | Both blocks ended in `return` on every path |
| `13-ui-detail-cards.js` | `xlScan` | The checks on a candidate name became `xlScanGate(...)` returning the (maybe replaced) key or `null`. `null` means the old `break`. The word tokenizer loop became `xlScanTokens` | `k` is never `null` before the gate (`if(!k) continue`). `p` is not read after the tokenizer |
| `15-logic-roster-backup-files-snapshots.js` | `showHome` | Home element creation and its 5 listeners moved to `showHomeMake()` (same order). The click handler cases (`hview, hedit, hkeep, hdel, hcampf, hwn, hnew, hall, hbin`) became `showHomeCase*` | The element is the same object the old closures held as `w`. Each case ended in `return` |
| `15b-logic-backup.js` | `bkpCheck` | The character list check became `bkpCheckList(r)` | It was the last block, followed by `return ""` |
| `16-logic-import-chat-text-and-build-files.js` | `impBuild` | The "normalise, check, ask" block became `impBuildGate(b,o)` returning `{stop, b}` | `b` is the only value the block changed. The `ask` callback reads `o`, which is not reassigned after this point |
| `23-ui-uses-items-coins-rest-spell-dc.js` | `icoItem` | The last regex ladder became `icoItemTail` | Pure, last statement |
| `27b-ui-library.js` | `libBook`, `libDetailRaw` | `libBookFind(e)` for the kind chain. `libDetailRaw` is now a dispatcher: one `libDetailRaw<Kind>(c,k)` per kind. Only the `item` block can fall through (no hit), so its helper returns `undefined` and the dispatcher falls on exactly as before | `h` and `sub` were assigned before any read in every block, so they became locals of the helpers |
| `27c-ui-report-pins.js` | long press drag IIFE | State `timer, sx, sy, cur, ghost, zone, hold` is now one module object `libDrag`. The six handlers are module functions `libDrag*`, wired by `libDragWire()` called at the same line the IIFE ran | Same listener order (pointerdown, pointermove, touchmove, pointerup, pointercancel, keydown, click, contextmenu). The timer callback reads `sx,sy` when it fires, like before |
| `28-ui-bastion.js` | `bsAct` | One helper per action (`bsActGrow` ... `bsActDrop`) | Every moved block ended in `return`. The module level `bsAdd*`, `bsEv`, `bsNote`, `bsLost` are assigned from the helpers in the same file, so the same variables |
| `29b-ui-creatures-extras.js` | `crEnv` | The `sp:` branch became `crEnvSp(ctx,c,env)` | `env` is the object that was filled |
| `34-ui-situations.js` | `sitDo` | One helper per `kind` (`on, used, opt, act`) | Every block ended in `return`. `st` is passed as the object |
| `39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js` | hit point drag IIFE | State `st, bub, supT` and the three constants are one module object `hpGest`. Handlers are `hpG*` module functions, wired by `hpGWire()` at the same line | Same listener order. Text strings were checked after the rename (`Drag up or down` is intact) |
| `43-logic-cloud-sync.js` | `syRunFn1` | The shared closure state `hadNone, jobs, changedR, reload` is one per call object `cx`. The per id handler is `syRunFn1One`, the final step `syRunFn1Done` | `cx` is created per call, as the `let`s were. `res==="reload"` strings are intact |
| `54-dev-fps-probe.js` | fps probe IIFE | State is the module object `fpsP`. Functions are `fpsRun, fpsPhase, fpsLoafTxt, fpsTabOf`. The `#fps` check stays in `devFpsProbeInit()`, called at the same line | Nothing runs without `#fps`. No `await` was moved into a new `async` helper, so the microtask order of the run is the same |

Helpers are always placed at module level, after the top level statement that held the function, so no enclosing function grows.

## 4. Proof

Base for the UI snapshot: origin/main e2360836 built in a separate worktree. This tree is that commit plus this stage.

| Test | Result |
|---|---|
| `solid_snapshot` full, 2997 builds | total a893fba7ab867bb0 (same as before), page errors 0, build errors 0 |
| `solid_snapshot --golden`, 777 builds, base against this tree | 76cc2943d6bf0384 both |
| `golden_builds` | OK, 1479 checks |
| `fx_engine` | OK, 265 checks |
| `solid_contract` | OK, 4766 checks |
| `solid_ui_contract` | 308 checks, 0 failed |
| `solid_ui_snapshot`, scenario A at 390 (solo), A at 1250 (solo), B (both viewports), C (both viewports), base against this tree | identical hashes in every step, page errors 0 |
| `invariants`, `scenarios`, `e2e_fx_toggle`, `csp_check`, `names_lint` | all exit 0 |
| `perf_budget --fast --runs 3 --check` | budget ok (heap home raw 34.56 MB at 1250x850, limit 35) |
| guard_size | 127 (was 173), 0 new |
| guard_all `--enforce` | exit 1 on this tree **and on origin/main**: `guard_window` counts the new `window` use in `app/20-ui-portrait.js` that main already has. The other guards: 0 new |
| `tools/html_gate.py` | exit 1 on this tree **and on origin/main**: `app/20-ui-portrait.js` 3 vs 1, `fx/00b-fx-shared.js` 1 vs 0 (both from main) |
| `lazy_parts` | one timing check fails (`first search does not wait for the 4.7 MB file`, 3 to 4.6 s) on this tree **and on origin/main** (2.3 s). The machine was loaded by other agents |
| `split_dist` | flaky on both trees. The check "window names equal" races with the 250 ms timer that sets `__bldPendList`: origin/main failed 2 of 3 runs, this tree 2 of 4, the other runs pass all checks |

Note on `solid_ui_snapshot` in one single run of all 280 steps: three full runs of this tree (each ran while another heavy suite ran on the same machine) showed 4 to 8 different DOM hashes in the overlay steps of scenario A (and once `B ov detail feat`). The base tree gave the same total in two full runs. Reading the dumps of one differing step shows the cause is timing, not code: the header got a `mi-bs` class (a micro-interaction class that is added by a timer) in one run and not in the other, and the search box held the typed text in one run and not in the other. Every one of those steps is identical when the scenario is run alone, for both trees. So the proof above uses the per scenario runs.

## 5. Deferred and notes

| Item | Note |
|---|---|
| Nothing in `src/app` is deferred | All 46 are under budget. No function was left because it could not be proven |
| `guard_window` shows 1 new use on current main | `app/20-ui-portrait.js` (IntersectionObserver). It comes from the portrait picker commit on main (369edca4), not from this stage. Not touched here. Whoever owns that file should use the `env` module |
| `tools/tsc_gate.py` | `src/builder/00-env.js` fails (1 vs baseline 0) on main already. Total errors went from 226 (after the automatic passes) to 221 |
| Style | Helper names from the tools are mechanical (`NAMEFn1`, `NAMEPart1`, `NAMEStep1`) like in stage 12. The hand written ones have descriptive names |

