# SOLID stage 3: the sheet UI (src/app)

Scope: `src/app/*` (57 files plus `main.js` on origin/main 18dbdf43, 1,151,050 bytes, 624 `window.*` references, 131 of them writes), `src/css` untouched.
Hard constraint: identical behavior and visuals. Proof tool: `tests/solid_ui_snapshot.py` (hash of the normalized DOM and of the normalized localStorage, 3 scenarios, 2 viewports, 140 steps each viewport, 280 steps in all).
Owner decision: SOLID in full, all five letters, DRY allowed. Where a letter does not apply the reason is written down.

## 1. Measurement (before, origin/main)

### 1.1 Per file

S = distinct jobs in the file (judged from the function groups). D = window reads/writes before (browser APIs such as `addEventListener` and `matchMedia` are counted here too, they are not shared state). Size in bytes, lines.

| File | Bytes | Lines | Jobs (S) | window reads | window writes |
|---|---|---|---|---|---|
| 01-logic-boot-flags-builder-loader.js | 4961 | 28 | boot flags, builder lazy loader (2) | 7 | 0 |
| 02-data-default-character.js | 3770 | 14 | default sheet, condition and ability tables (1) | 0 | 0 |
| 03-data-glossary.js | 30225 | 184 | rules glossary data, rest tables, 2014 switch (2) | 2 | 2 |
| 04-logic-storage.js | 12731 | 106 | load/save C and S, store keys, sync of tabs state (2) | 7 | 5 |
| 05-logic-helpers.js | 12066 | 90 | DOM helpers, number helpers, toast, ask (3) | 10 | 2 |
| 06-logic-derivation.js | 16159 | 140 | derive D from C and S, rich text (2) | 0 | 0 |
| 07-ui-theme-contrast-spring.js | 13698 | 93 | theme, contrast, spring animator (3) | 17 | 2 |
| 08-ui-render-sheet-and-actions.js | 56497 | 336 | render main sheet, skills, actions, spells row, inventory row (5) | 13 | 0 |
| 09-ui-hit-points-playbar-death-saves.js | 13330 | 96 | HP, play bar, death saves (3) | 15 | 0 |
| 10-ui-conditions.js | 5687 | 49 | conditions panel (1) | 4 | 0 |
| 11-ui-breakdown.js | 4028 | 38 | number breakdown card (1) | 2 | 2 |
| 12-ui-bottom-sheet-modal.js | 14878 | 149 | sheet open/close, nav stack, entry dispatcher, swipe list, watermark (4) | 30 | 1 |
| 13-ui-detail-cards.js | 44939 | 417 | detail card bodies per type, cross links, masterwork (3) | 9 | 4 |
| 14-ui-editor.js | 15183 | 128 | sheet editor and roster keys (2) | 0 | 0 |
| 15-logic-roster-backup-files-snapshots.js | 56645 | 309 | roster, Home, backup, files, snapshots (5) | 26 | 1 |
| 16-logic-import-chat-text-and-build-files.js | 62201 | 65 | import text/chat/build files (2, 62 KB in 65 lines) | 10 | 2 |
| 17-logic-tab-sync-and-test-hooks.js | 12674 | 83 | tab sync, test hooks (2) | 29 | 18 |
| 18-ui-header-and-more-menu.js | 15135 | 118 | header, more menu (2) | 20 | 2 |
| 19-ui-global-click-delegation.js | 9706 | 69 | global click delegation, doRest (2) | 0 | 0 |
| 20-ui-portrait.js | 4116 | 30 | portrait (1) | 2 | 0 |
| 21-ui-tabs-pager.js | 14882 | 97 | tabs, pager (2) | 13 | 0 |
| 22-ui-spell-data-and-slots.js | 11335 | 79 | spell data, slots (2) | 5 | 5 |
| 23-ui-uses-items-coins-rest-spell-dc.js | 54711 | 326 | icons, resources, speeds, containers, coins, rest, spell DC and spells (7) | 16 | 8 |
| 24-ui-manage-spells.js | 11358 | 85 | manage spells sheet (1) | 17 | 0 |
| 25-ui-settings-appearance.js | 9811 | 54 | settings (1) | 2 | 0 |
| 26-ui-customize.js | 7410 | 66 | customize values (1) | 0 | 0 |
| 27-ui-party-search-commands-library.js | 118972 | 582 | party, campaign, search, command palette, library, spell cards, report, Foundry, pins (6) | 108 | 14 |
| 28-ui-bastion.js | 18001 | 103 | bastion (1) | 0 | 0 |
| 29-ui-ddb-look.js | 45652 | 190 | DDB look, creature blocks, extras (3) | 9 | 1 |
| 30-ui-icons.js | 27574 | 109 | icon tables (1) | 3 | 3 |
| 31-ui-tour-and-focus.js | 11066 | 69 | tour, focus (2) | 24 | 1 |
| 32-logic-play-undo-actions.js | 45553 | 305 | play actions, undo (3) | 6 | 1 |
| 33-logic-play-rage-conditions.js | 3442 | 39 | rage and condition play rules (1) | 0 | 0 |
| 34-ui-situations.js | 49911 | 294 | situations, combat panels (3) | 3 | 1 |
| 35-ui-combo.js | 26520 | 163 | keyboard combo, renderAll (2) | 7 | 1 |
| 36-ui-printable-sheet.js | 13258 | 107 | print sheet (1) | 1 | 0 |
| 37-ui-pdf-export-hold-slide-confirm.js | 9269 | 112 | PDF export, hold-slide (2) | 9 | 0 |
| 38-boot-init.js | 2350 | 19 | boot (1) | 2 | 0 |
| 39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js | 24892 | 147 | exhaustion, keys, HP drag, PiP, wake lock, one hand (6) | 18 | 6 |
| 40-ui-segments-notes-swipe-motion-panels.js | 48945 | 345 | segments, folds, notes, description, page motion, morph, overlays, long-press, dock, reorder, tab scroll, bar spring (8) | 39 | 1 |
| 41-ui-edit-mode.js | 16688 | 121 | edit mode (1) | 11 | 3 |
| 42-logic-pwa-qr-icons-wallet.js | 30347 | 217 | PWA, QR, wallet (3) | 34 | 21 |
| 43-logic-cloud-sync.js | 23334 | 179 | cloud sync (1) | 11 | 5 |
| 44-ui-friends.js | 26975 | 158 | friends (1) | 2 | 2 |
| 45-learn-bridge.js | 1509 | 19 | Learn bridge (1) | 1 | 1 |
| 46-logic-receipts.js | 5156 | 44 | receipts (1) | 9 | 6 |
| 47-logic-time-machine.js | 5299 | 42 | time machine (1) | 1 | 1 |
| 48-logic-sync-merge.js | 9541 | 83 | sync merge (1) | 3 | 1 |
| 49-logic-status-and-odds.js | 26543 | 182 | status text, odds (2) | 24 | 2 |
| 50-logic-reverse-builder.js | 15751 | 111 | reverse builder (1) | 29 | 3 |
| 51-ui-table-help.js | 8421 | 52 | table help (1) | 2 | 2 |
| 52-tg-bridge.js | 5967 | 49 | Training Ground bridge (1) | 10 | 0 |
| 53-logic-number-map.js | 3721 | 28 | number map (1) | 1 | 1 |
| 54-dev-fps-probe.js | 7993 | 52 | dev FPS probe (1) | 1 | 0 |
| 99-ui-backup-reminder-handlers.js | 856 | 8 | backup reminder (1) | 0 | 0 |

Files with more than 5 jobs or more than 45 KB: 08, 15, 16, 23, 27, 34, 39, 40 (and 29, 32 at 45 KB).

### 1.2 Extension points that need edits in several places (O)

| Point | Where the kind list lives (before) | Cost of a new kind |
|---|---|---|
| Detail card (`data-info="type:key"`) | `infoHTML0` chain of 12 `if(type===...)` in 13 (72 lines, 44 KB file), self-name chain of 8 `t0===` in `infoHTML` | edit the chain in two places in 13 |
| Sheet entry (`navStack` entry type) | `entryContent` chain of 7 `en.type===` in 12 | edit 12 |
| Command word of the Search sheet | `palWords()` array of 24 literals + tab loop + condition loop in 27 | edit the array in 27 |
| Long-press menu source | `ctxSpec` chain of 4 `t.closest(...)` blocks in 40 | edit 40 |
| Search result group | 5 `G.push` blocks in `gsHTML` (27) | edit `gsHTML` (Deferred, see 5) |
| Panel / tab | `PAGES`, `PAL_TABS` and the 7 `data-tab` buttons in `sheet-body.html` | 3 places. Deferred: the tab buttons are markup (HTML out of scope) and the page ids are also used by CSS |
| Overlay | `ovTop()` in 40 lists `#ctxm`, `#lib`, `#sheet`... | Deferred: z-order of overlays is behavior, one list of 6 ids |

### 1.3 DRY candidates found

| Candidate | Where | Decision |
|---|---|---|
| `hpW(n)` and `hpWord(n)`, same body | 23 and 32 | merged into `hpWord` in 05 |
| `if(sheet.classList.contains("on")) closeSheet();` | 12 times in 27, 4 in 31, 1 in 32, 1 in 34 | merged into `closeSheetIfOn()` in 13 |
| `typeof X!=="undefined"?X:...` data guards | 54 sites | left: each guards a different lazy data part, a helper would hide which part is needed |
| `esc(...)` + tile/strip HTML builders in 13, 27, 29 | similar markup, different classes | left: output must stay byte identical, the shapes differ in class names and attribute order |
| Long-press/`ctxBoxes`/`ctxFire` helpers | one place | none |
| The 12-line block in fx/16 and fx/18 | `fx/` (guard_dup baseline) | outside `src/app`, not touched |

### 1.4 L and I: where they apply

* L (substitution). Four real families of components that must be interchangeable: detail cards (12 types, one dispatcher), sheet entries (7), command words (24 + tabs + conditions), long-press sources (4). Before, the contract was implicit: each branch returned `{t,h}` (or `{t,h,m}`, or a command object) and the dispatcher trusted it. Differences found: `palNeed` commands carry `fill` and no `run`; the `lib` card answers `{t,h}` from another module; `search` entry schedules a timer. Now written in `06a-logic-ui-registry.js` and checked on every entry.
* I (interface segregation). Three real cases: (a) page globals: 119 distinct `window.NAME` names were reachable from every file; now `env` per name, (b) `__R` service locator, a bag of 277 names visible to every file: not removable without changing the module graph (Deferred), (c) the registries give each extension point a 1 to 2 function interface (`render`, `content`, `words`, `sel`+`build`) instead of a branch inside a dispatcher. Class hierarchies do not exist in this code (functions and data), so I applies to modules, not to classes.

## 2. What was done

### 2.1 D: `src/app/00-env.js`

`env.NAME` is the same property as `window.NAME` (getter reads at the moment of use, setter writes). 200 names are bound in 6 groups: data tables (WX*, QREFS, QIMG, FLUFF...), art helpers, builder bridge (35 `__bld*`), MI/Training Ground/Learn bridges, vendor libraries, and the hooks the sheet publishes itself (`__D`, `__sheetState`, `__sheetApply`... 120 names, old window names stay). The rewrite was done with a parser (acorn), only on `window.NAME` member expressions outside strings and comments.

| | Before | After |
|---|---|---|
| `window.*` references in `src/app` | 624 (131 writes) | 120 (all browser APIs: addEventListener, matchMedia, innerWidth, scrollY, fetch...) and 0 shared-state names |
| guard_window | 1952 | 1446 (baseline updated, total went down) |

File 29 has local variables named `env` (the creature spell environment); there the import is `PGE`. `this` of called bridge functions is `env` instead of `window` (none of the called functions uses `this`; proven by the snapshot and the tests).

### 2.2 O and L: four registries (`06a-logic-ui-registry.js`)

| Registry | Key | Entries now | Dispatcher (marked `solid:orchestrator`) |
|---|---|---|---|
| DETAIL | type before ":" of `data-info` | 12 (`spn mi lib g cr xd sp spx f grp w it`) | `infoHTML0` (13): 3 lines, no type names. `infoHTML` asks `self(key)` of the entry |
| ENTRY | `en.type` of a sheet entry | 7 (`bd cond combat spman search cuq cust`) | `entryContent` (12). Types not registered are info cards |
| PALWORD | id of a provider | 24 words + `tabs` + `condition-toggles` = 26 providers, 50 words | `palWords` (27) |
| CTXSRC | id of a long-press source | 4 | `ctxSpec` (40) |

Adding one is one `X.add(key, entry)`. `tests/solid_ui_contract.py` (231 checks, in `.github/workflows/tests.yml` job A) checks every entry: required fields, arity (`render(key)`, `content(en)`, `build(el)` take one argument, `words()` none), no `window` in the entry source, the answered shape for a real probe and for a missing key, and the O proof: a new card, a new command word and a new long-press source registered from outside are used by the dispatcher with no other edit. It also checks statically that `src/app` reads no shared window name outside `env`.

Honest note on L: the check found that all 12 cards answer `{t,h}` even for a missing key, but command words differ (`palNeed` returns `fill` instead of `run`). The contract now says run OR fill. That difference existed before and is kept.

### 2.3 S: files split (execution order kept)

| Before | After | Notes |
|---|---|---|
| 27 (117,507 bytes, 6 jobs) | 27 party, campaigns, search, command words (about 43 KB) / 27b library (about 75 KB) / 27c spell cards print, report, Foundry, pins | Late names that the head used only through `Object.defineProperty(__R, ...)` moved with their owner |
| 23 (54,727 bytes, 7 jobs) | 23 icons, resources, speeds / 23b containers and packs / 23c coins / 23d rest / 23e spell DC and spells | `ctOf` stayed in 23 (the head uses it) |
| 40 (48,675 bytes, 8 jobs) | 40 lint, segments, folds / 40b notes and description / 40c page motion, sheet spring, morph / 40d overlays, long-press, dock / 40e reorder / 40f tab scroll, bar spring | two late calls (`ovQueue`, `springEase`) go through `__R`, the existing pattern |

Largest file: 117,507 bytes before, 74,955 bytes after (27b, one job: the Library). Files in `src/app`: 57 before, 70 after (without `main.js`). Each new file starts with a comment that names its job and the env names it touches. Manifest and `main.js` list them in the old order.

### 2.4 DRY merges

| Merged | Into |
|---|---|
| `hpW` (23) and `hpWord` (32) | `hpWord` in 05 |
| 18 copies of `if(sheet.classList.contains("on")) closeSheet();` (27: 12, 31: 4, 32: 1, 34: 1) | `closeSheetIfOn()` in 13 |

Left as is: see 1.3.

## 3. Proof of identical behavior

`tests/solid_ui_snapshot.py`: three scenarios (old Yudhi sheet, a golden build applied as the active sheet, a new character from Home), viewports 390x844 and 1250x850, per scenario all 7 tabs and 13 overlays (search, command palette `dmg 7`, search `fire`, library, library `fireball`, more menu, theme, edit mode, heal, spell/feature/item/action detail cards, breakdown, rest) = 280 steps, DOM and localStorage hashed after the page is quiet (two equal reads 500 ms apart). Normalized: timestamps and clock texts, relative times, the CSP script hashes (they change with any code change), icon SVGs added in idle time, the load dependent `mi-lite` class, the order of the parts added later to `body`, the hidden Home content.

| State | Total hash (280 steps) |
|---|---|
| origin/main, run twice | ec3dd8dd90be6800 both times |
| After D | identical |
| After registries | identical |
| After split 27 | identical |
| After split 23 | identical |
| After split 40 and DRY | identical |
| Final (merged with newest main) | ec3dd8dd90be6800 (identical on the second run, the first run had 2 steps of `A home` and `A sheet` at 1250 differ, flaky under load, the rerun matched) |

The baseline was never updated to make a run pass. It was rebuilt twice for the tool itself (the first normalization let the CSP hashes and timing noise through) and only from origin/main.

## 4. Tests

| Test | Before (origin/main) | After |
|---|---|---|
| build.py --check | ok | ok (270 JS pieces) |
| golden_builds | 1479 | 1479 |
| fx_engine | 265 | 265 |
| invariants | 2220 builds | 2220 builds, 0 violations |
| edition_isolation, csp_check, names_lint (4), link_sweep, split_dist, e2e_fx_toggle | pass | pass |
| scenarios | 24 checks | 24 checks, 0 failed |
| lazy_parts | SCORE 97 (one timing check: dist early read, 1.9 s) | SCORE 97, the same single check (1.6 to 1.8 s). Same on origin/main, not caused by this stage |
| perf_budget (--fast, 3 runs) | heap raw 31.74 / 34.14, GC 26.34 / 26.42 | raw 31.78 / 34.78, GC 26.40 / 26.48. Budget ok (35 / 27) |
| solid_ui_contract (new) | | 231 checks |
| guard_all | window 1952, dispatch 1, deps 140, size 273, dup 1 | window 1446, dispatch 1, deps 146, size 271, dup 1 |

guard_deps went from 140 to 146 because one provider file became several files (the same back-edges now name more files). guard_size went down by 2 in total. Only the window baseline was updated (the total went down).

tsc_gate and html_gate show the same results as on origin/main (a WORSE line for `builder/11b`, html sites 250 against 248): not from this stage.

## 5. Deferred

| Item | Why |
|---|---|
| Search result groups (5 `G.push` blocks in `gsHTML`) as a registry | Each group closes over locals of `gsHTML` (`q`, `sc`, `pick`) and the order of the groups is part of the output. Needs a ctx object for them first |
| Panel/tab registry | The 7 tab buttons are markup (`sheet-body.html`) and the ids are used by CSS. Out of scope for `src/app` |
| Overlay list in `ovTop()` | The z-order of overlays is behavior and the list is 6 ids |
| Remove `__R` (277 names) | Breaks load-order cycles; needs a module graph change |
| Bare data globals (`SPELLS`, `DMGI`, `GEAR`, `PACKS`...) behind an accessor | Hundreds of references; they are declared by data scripts as globals and `typeof X!=="undefined"` guards (54 sites) test for lazy parts |
| Split of 08, 15, 16, 29, 32, 34 | Same method works, but each has many cross edges and long lines (16 has 62 KB in 65 lines). Not done to keep every commit provably identical in the time available |
| `this` of bridge calls | Kept as `env`; no function uses it, listed for completeness |
