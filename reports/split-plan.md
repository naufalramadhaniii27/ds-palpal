# Split plan (N32)

From reports/trace.json, 6 runs. Tiers: core 1, on demand 21, never read 7, changeable 1, no global 4.

| Part | Tier | Globals | Examples | Registry keys added | Read on screens |
|---|---|---|---|---|---|
| builder | changeable | 61 | QLIVE, WXF_ALL, __bldArmor, __bldAsk ... | BACKGROUNDS, CLASSES, DMGI, FEATS, SPECIES | boot, library |
| cffull | on demand | 1 | CF_FULL |  | library |
| db1 | on demand | 13 | A6, ALLSK, ARMOR, BACKGROUNDS ... | BACKGROUNDS, FEATS, SPECIES | library |
| db2 | on demand | 3 | CLASSES, MANEUVERS, OPTS | CLASSES | library |
| db3 | on demand | 6 | INVOCATIONS, INV_PICK, METAMAGIC, PACT ... | CLASSES | library |
| db4 | on demand | 46 | ACTS, ARMOR_GEN, ARMOR_RULE, ARR ... | AUTO, DMGI, SPECIES | library |
| dmgi | on demand | 4 | DM14, DMGI, EQ14D, SETSC | DMGI | library |
| efa | on demand | 8 | DM_LIST, DM_SP, EFA_CLS, EFA_LBL ... | AUTO, BACKGROUNDS, CLASSES, FEATS, SPECIES, SPELLS, SPELL_FULL, SUB_FULL | library |
| hbpack | on demand | 1 | HB_BUILTIN |  | library |
| itsp | on demand | 1 | ITEM_SPELLS |  | library |
| learn | never read | 4 | __learnBack, __learnOpen, __learnState, __spot |  |  |
| q1 | core | 11 | CRIMG, DECKFIX, FLUFF, HBIDX ... |  | library, tab6, tab7 |
| q7 | no global | 0 |  |  |  |
| rs14 | never read | 1 | __rsTerm |  |  |
| spells | on demand | 2 | SPELLS, SPELL_FX | SPELLS | library |
| spfull | never read | 1 | SPELL_FULL | SPELL_FULL |  |
| subfull | on demand | 1 | SUB_FULL | SUB_FULL | library |
| tg | never read | 10 | TGE, __tgBack, __tgDraw, __tgDrawStats ... |  |  |
| tp1 | on demand | 2 | WXC, WXE | AUTO, FEATS, SPELL_FULL, SUB_FULL | library |
| wotc1 | on demand | 1 | WX | FEATS, SPELL_FULL | library |
| wotc10 | no global | 0 |  |  |  |
| wotc11 | on demand | 1 | WXWP |  | library |
| wotc12 | never read | 0 |  | SPELL_FULL |  |
| wotc13 | no global | 0 |  |  |  |
| wotc14 | on demand | 1 | WXW |  | library |
| wotc15 | on demand | 1 | WXO |  | library |
| wotc2 | on demand | 1 | WXS | AUTO, SUB_FULL | library |
| wotc3 | on demand | 1 | WXI |  | library |
| wotc4 | on demand | 1 | WXSP |  | library |
| wotc5 | on demand | 1 | WXBG |  | library |
| wotc6 | on demand | 1 | WXG |  | library |
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

## Reading this plan

- Reads are counted against the screen that is open when they happen. The Library index is built in the background soon after the builder data has loaded, and it reads most data parts once. So a part read on `more` or `library` may be read only by that index build, not by the screen. Before moving a part to a later tier, run the trace again with the index build switched off (next step of Fase 2.2) and compare.
- Parts read on `home` or a `tab` screen, with no index build, are the true core. In this run only q1 shows tab reads (tab6, tab7).

A global read through a dynamic name (window[name]) or only on a screen that the 74 screens do not open shows as never read. Check those by hand before moving them.
