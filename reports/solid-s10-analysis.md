# SOLID stage 10: remove `__R`, lower the back-edges

Scope: how a file reads a name that another file owns (import and access paths). No function body was edited. Evaluation order of the modules is unchanged (checked by a DFS of the import graph of `app/main.js` and `builder/main.js`, before and after: the same list, only `00-reg.js` is no longer reached).

## 1. Result

| Measure | Before (main after PR #17) | After |
|---|---|---|
| `__R` names, `src/app` | 275 (767 uses) | 0 |
| `__R` names, `src/builder` | 49 (111 uses) | 0 |
| `guard_deps` back-edges | 158 (app 103, builder 25, data 23, learn 5, tg 2) | 45 (app 6, builder 12, data 23, learn 4, tg 0) |
| `guard_window`, `guard_dispatch`, `guard_size`, `guard_dup` | 5, 1, 242, 0 | 5, 1, 242, 0 |
| `tsc_gate` score | 251 | 247 |

`00-reg.js` (app and builder) is still in the tree and in `manifest.json`, but no file imports it. Deleting a file needs the owner's permission, so its comment now says it is retired.

## 2. What replaced `__R`

| Case | Names | Method |
|---|---|---|
| Reader is earlier than the owner, name is a function | 238 app, 43 builder | Late port: the reader imports a wrapper `NAME(...)` from the port file, the owner binds `bindLive("NAME",{get:function(){return NAME;}})` at the place of the old `Object.defineProperty(__R,...)`. The getter reads the owner variable at the moment of use, so a function that a later patch replaces (`renderAll=...`) is seen as before |
| Reader is earlier than the owner, name is a value (`D`, `C`, `ICO`, `mq`, `SMAP`...) or is written by a reader (`askHTML`) | 37 app, 3 builder | `lateGet("NAME")` and `lateSet("NAME",v)`. The owner passes its own getter and setter text unchanged |
| Every reader is later than the owner | `hpWord` (app), `slotAddApply` (builder) | Plain import. `export` added to the declaration |
| No reader | `classFx`, `kitItems` (builder) | The `defineProperty` line was removed |

Port files: `app/00a-reg-late-ports.js` (new, no imports, unclassified by `guard_lib.layer()` like `00-reg.js`) and `builder/01b-logic-late-ports.js` (the stage 8 file, extended; it keeps `bindLate` for the older 21 names).

Behavior kept from `__R` (tested by `names_lint` and the golden runs): a read before the owner has bound gives `undefined` (this matters for `__R.mq` in `18-ui-header...`, which is read during load inside `try{}` and was always `undefined` there), a call before it throws a `TypeError`, a write before the bind is stored in a plain slot that the bind drops (`__R.CU0={}` in `derive()` runs before `41-ui-edit-mode.js` loads), a write to a bound name without setter throws. New: an unknown name, a second binding or a write without setter throws at once.

## 3. Back-edges: second use of the ports

A data or logic file that imported a function or value from a UI file (`rGet`, `rSave`, `renderAll`, `refreshEntry`, `closeSheet`, `openSheet`, `coinPay`, `STEPS`, `render`, `stamp`...) now imports the same name from the port file. The UI owner binds it at the top of its file. Rules the script used, each checked on the AST:

- the reader is evaluated after the owner (so the bind has run, load-time calls are safe);
- the name is a declaration the owner exports (function, or value that is not written by the reader);
- a function name must only be called or tested with `typeof` in the reader. A function passed as a value is skipped. This rule skipped `bldDot` (`42-logic-pwa...`): the file wraps it with `__set_bldDot((function(f){...})(bldDot))`, and a port returns the newest function, so the wrapper would call itself.

43 names in app and 32 in builder were routed this way. They are the reason for the drop from 158 to 45.

## 4. The 45 back-edges that remain

| Kind | Count | Why it stays |
|---|---|---|
| Name collision of the guard (a property key of a data record such as `spCls`, `saveNotes`, `featOpts`, `autoSpells`, or a word such as `creatures`, `open`, `close`, `sheet`, `live`, `card`, `place` that equals a unique function name in another file or block) | 44 | Not a dependency. The guard maps a name to the one file that defines it and does not know that the reader uses it as a key or a local. Fixing it means renaming either side |
| `bldDot` read by `42-logic-pwa...` from `35-ui-combo.js` | 1 | Monkey patch, see section 3 |

## 5. Deferred

| Item | Why |
|---|---|
| Replace ports by direct imports where the owner is pure | Measured in stage 9: 6 of 45 names could be imported without moving an impure file. A port is the same cost for the reader and keeps the order. A real gain needs the load-time statements of the owners in small init files (stage 11 and 12 split the same files) |
| Delete `app/00-reg.js` and `builder/00-reg.js` | Needs permission. Nothing imports them |
| Move roster functions (`rGet`, `rSave`, `rEnsure`, `RKEY`) out of `14-ui-editor.js` into a logic file | They are logic by content, but moving them edits lines that stage 11 and 12 touch. The port removes the back-edge for now |
| Wrapper cost | Each port call is one extra function call and one getter call. `perf_budget` is the check (result in the PR) |

## 6. Tool changes

- `tools/tsc_gate.py`: TS2630 is ignored on `bindLive(` lines too, as it was on `Object.defineProperty(` lines (the setter of a value assigns a variable, by design). Function names have no setter now.
- `tests/solid_contract.py`: the check of `12-logic-export-to-sheet.js` asks for `bindLive("toSheet"` and no `__R`, instead of two `__R` words and the `defineProperty` line.
- `tests/guard_baseline/guard_deps.json`: updated, 158 to 45.
