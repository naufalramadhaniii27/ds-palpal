# Split plan (N32)

From reports/trace.json, 6 runs. Tiers: core 4, on demand 22, never read 3, changeable 1, no global 4.

| Part | Tier | Globals | Examples | Registry keys added | Read on screens |
|---|---|---|---|---|---|
| builder | changeable | 61 | QLIVE, WXF_ALL, __bldArmor, __bldAsk ... | BACKGROUNDS, CLASSES, DMGI, FEATS, SPECIES | boot, library |
| cffull | on demand | 1 | CF_FULL |  | boot, library, load |
| db1 | on demand | 13 | A6, ALLSK, ARMOR, BACKGROUNDS ... | BACKGROUNDS, FEATS, SPECIES | boot, library, load |
| db2 | on demand | 3 | CLASSES, MANEUVERS, OPTS | CLASSES | boot, library, load |
| db3 | on demand | 6 | INVOCATIONS, INV_PICK, METAMAGIC, PACT ... | CLASSES | library, load |
| db4 | on demand | 46 | ACTS, ARMOR_GEN, ARMOR_RULE, ARR ... | AUTO, DMGI, SPECIES | boot, library, load |
| dmgi | on demand | 4 | DM14, DMGI, EQ14D, SETSC | DMGI | boot, library, load |
| efa | on demand | 8 | DM_LIST, DM_SP, EFA_CLS, EFA_LBL ... | AUTO, BACKGROUNDS, CLASSES, FEATS, SPECIES, SPELLS, SPELL_FULL, SUB_FULL | boot, library, load |
| hbpack | on demand | 1 | HB_BUILTIN |  | boot, library, load |
| itsp | on demand | 1 | ITEM_SPELLS |  | boot, library |
| learn | core | 4 | __learnBack, __learnOpen, __learnState, __spot |  | boot, detail, home, library |
| q1 | core | 11 | CRIMG, DECKFIX, FLUFF, HBIDX ... |  | library, load, tab6, tab7 |
| q7 | no global | 0 |  |  |  |
| rs14 | core | 1 | __rsTerm |  | detail, home, tab0, tab1 |
| spells | on demand | 2 | SPELLS, SPELL_FX | SPELLS | boot, library, load |
| spfull | on demand | 1 | SPELL_FULL | SPELL_FULL | boot |
| subfull | on demand | 1 | SUB_FULL | SUB_FULL | boot, library |
| tg | core | 10 | TGE, __tgBack, __tgDraw, __tgDrawStats ... |  | boot, detail, home, library |
| tp1 | on demand | 2 | WXC, WXE | AUTO, FEATS, SPELL_FULL, SUB_FULL | library, load |
| wotc1 | on demand | 1 | WX | FEATS, SPELL_FULL | boot, library, load |
| wotc10 | no global | 0 |  |  |  |
| wotc11 | on demand | 1 | WXWP |  | library, load |
| wotc12 | never read | 0 |  | SPELL_FULL |  |
| wotc13 | no global | 0 |  |  |  |
| wotc14 | on demand | 1 | WXW |  | library, load |
| wotc15 | on demand | 1 | WXO |  | library, load |
| wotc2 | on demand | 1 | WXS | AUTO, SUB_FULL | boot, library, load |
| wotc3 | on demand | 1 | WXI |  | library, load |
| wotc4 | on demand | 1 | WXSP |  | library, load |
| wotc5 | on demand | 1 | WXBG |  | library, load |
| wotc6 | on demand | 1 | WXG |  | library, load |
| wotc7 | never read | 0 |  | FEATS |  |
| wotc8 | no global | 0 |  |  |  |
| wotc9 | never read | 0 |  | AUTO, SUB_FULL |  |

## Shared tables

| Table | Parts that add keys |
|---|---|
| AUTO | db4, efa, tp1, wotc2, wotc9 |
| BACKGROUNDS | builder, db1, efa |
| CLASSES | builder, db2, db3, efa |
| DMGI | builder, db4, dmgi |
| FEATS | builder, db1, efa, tp1, wotc1, wotc7 |
| SPECIES | builder, db1, db4, efa |
| SPELLS | efa, spells |
| SPELL_FULL | efa, spfull, tp1, wotc1, wotc12 |
| SUB_FULL | efa, subfull, tp1, wotc2, wotc9 |

## Ownership

Globals made by deferred parts: 185, all owned by one part (a global made by two parts would show twice).
Globals made by more than one part: 0

## Lazy candidates

Parts that add no keys to a shared table and are read only by the Library (or by no screen): safe to load on demand, if a guard loads them before the first read. Reads made while another part loads are ignored.

| Part | Size KB |
|---|---|
| q7 | 4759 |
| wotc11 | 974 |
| wotc10 | 136 |
| wotc14 | 111 |
| wotc13 | 72 |
| wotc8 | 66 |
| wotc3 | 58 |
| wotc15 | 23 |
| wotc6 | 12 |
| wotc4 | 11 |
| wotc5 | 9 |

Total 6239 KB of 20896 KB deferred data (30%).

## Reading this plan

- Reads are counted against the screen that is open when they happen. The Library index is built in the background soon after the builder data has loaded, and it reads most data parts once. So a part read on `more` or `library` may be read only by that index build, not by the screen. Before moving a part to a later tier, run the trace again with the index build switched off (next step of Fase 2.2) and compare.
- Parts read on `home` or a `tab` screen, with no index build, are the true core. In this run only q1 shows tab reads (tab6, tab7).

A global read through a dynamic name (window[name]) or only on a screen that the 74 screens do not open shows as never read. Check those by hand before moving them.
