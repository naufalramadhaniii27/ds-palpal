# SOLID stage 2: toSheet() and sheet-state registries

Scope: `src/builder/12-logic-export-to-sheet.js` (toSheet), the handler files `12a` to `12l`, the schemas `12b` and `10e`, the accessors in `00-env.js`.
Proof tool: `tests/solid_snapshot.py` (hash of C and D for 2997 builds). Baseline on origin/main: `a893fba7ab867bb0`.

## 1. What changed

| Item | Before | After |
|---|---|---|
| `toSheet()` | one function of about 460 dense lines, 31 field groups mixed with about 40 class special cases | 6 lines: build inputs, run the phases, set `ACM` and `PROFC` |
| Field groups | inline | 179 group handlers (`registerSheetGroup`) in `12c` to `12l`, one per field group or sub-step |
| Class rules | inline `if(cls===...)` inside loops | 50 rule handlers (`registerSheetRule`), each with `about` naming the rule |
| Order | position in the text | phase, then `order`, then registration. Loops over class parts (`scope:"part"`) and over elements (`scope:"each"`) keep the old interleaving |
| State | local variables | `state = {i inputs, q queries, C sheet, l locals}`, typed by `12b` |
| Entry schema | none | `10e-logic-fx-schema.js`: one table of every effect field and its types |
| Stage 1 handlers | `fields` was documentation | `uses` (context slice) is required, the orchestrator passes only that slice, `eKeys` lists structural entry keys |

## 2. SOLID status and evidence

| Letter | Status | Evidence |
|---|---|---|
| S | Done | toSheet only loops. `tests/solid_contract.py` fails if the orchestrator holds `for`, `if`, `switch` or `forEach` |
| O | Done | A group and a rule registered at run time are applied with no edit of toSheet (contract test, section "O") |
| L | Done | `patchProblems` (state schema) and `fxEntryProblems` (entry schema) run on every patch and on 4058 real entries (GX, class, species, background, item rows, built entries). Six negative controls and two entry controls must fail |
| I | Done | Sheet handlers: `makeCtx` builds the slice from `reads` and `writes`, strict mode wraps it in Proxies that throw on any other key. Stage 1 handlers: `uses` slice in production, entry Proxy over `fields` + `eKeys` in the test |
| D | Done for migrated code | Handler files import only the registry, schemas, `01` and `00-env.js`. The test fails on `window`, `document`, `__R` and on 29 bare global names (CLASSES, SPECIES, FEATS, WEAPONS, DMAP ...). New accessors in `00-env.js` keep the old globals alive |
| DRY | See section 3 | |

## 3. DRY: merged and left

| Merged (same knowledge in two places) | Where |
|---|---|
| Every proficiency source was listed twice (text in `C.profs`, list in `C.profSrc`). Now each source adds rows once, `prof-finish` derives both | `12g` |
| Five loops "join all `B.ch` values whose key matches" | `chJoin` in `01` (invocations, metamagic, maneuvers) |
| `typeOk` would exist in the state schema and the entry schema | one copy in `01` |
| Six `!initBonus.some(...)` patterns, skill and misc adders | `initOnce`, `addProf`, `addMisc` |
| Dead code `KIT=__R.kitItems()` | removed |

| Left (look-alikes that change for different reasons) | Reason |
|---|---|
| Rule handlers for Monk, Rogue, Gloom Stalker saves | same shape, different class text and level gates |
| Speed rules per class | different formulas and sources |
| `cantrip-attack-rows` stays one handler | it reads the Warlock invocation choices inside the row |
| Tavern Brawler inside `prof-feats` | one feat, no second copy |

## 4. Deferred

| Item | Reason |
|---|---|
| `13-logic-sources-and-packs.js` (pack section appliers) | Not moved. The pattern is a table of appliers over a pack, but the appliers write window helper sets (`__setSrc`, `__hasItem` ...). A registry needs those sets in the env module first |
| `q` services in `12-logic-export-to-sheet.js` still call `__R.*` | They are the adapter layer between the registry and the old modules. Moving them needs the owning modules (09, 10, 11) to export the functions |
| `guard_size` total 273 against 267 on main | 17 handlers moved verbatim from the old function exceed 20 branches (for example `actsFor`, the attack-row rules). Splitting them changes text and risks the hash. Baseline not updated |
| Entry slicing in production | Only `ctx` is sliced at run time. The entry is checked behind a Proxy in the test, because copying each of 2400 entries per handler costs heap (perf budget) |

## 5. Tests

See the final report of the session for the counts before and after.
