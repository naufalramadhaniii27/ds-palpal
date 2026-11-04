# Release candidate 1 (branch claude/fx-int)

Release method in this repo: no release script, no CHANGELOG, no git tags. The version label (0.0.13, build 115) is edited by hand in `src/app/04-logic-storage.js`, `src/app/16-logic-import-chat-text-and-build-files.js` and `tests/version_label.py`. The version is NOT bumped here. Whoever releases decides the number.

## What is in
- fx engine v4 (toggles, picks, ability set/up/down, limited-use rows, new fx fields), the sheet side for it, and the Warden/Fighter multiclass work (w-mc, w-inv, w-fixmiss).
- Ledger fix bins w-L1 to w-L13 (item, feat, class and subclass effects as data in `src/data/fx-L*.js`, new `fxd` deferred part).
- Not in: uiux-autolink-all (perf budget fails by 0.3 MB), w-retro, w-audit (release 2).

## Behaviour changes users can notice
- Items that need attunement by a class or species now check the restriction without case sensitivity. Before, a lowercase text such as "a sorcerer, warlock or wizard" let every class attune.
- Tools, weapons and armor granted by effects now show in Proficiencies and make attack rows proficient.
- Many magic items now apply only what the item text says (toggles for situational effects, correct dice, senses, languages, uses per rest).

## Test changes
- `fx_overlap` (new, in CI): fails when two data files add the same additive field to one name, unless listed with a reason in `tests/fx_overlap_allow.json` (50 pairs).
- `scenarios.py`, `e2e_fx_toggle.py`: wait for the builder to load instead of a fixed pause. Asserts unchanged.
- `split_dist.py`: expects 35 parts (the new `fxd` part).
- 3 new goldens: fx_int_byok_case, fx_int_byok_case_other_class, fx_int_item_weapon_prof.

## Golden fixtures edited by the merge (expected values unchanged unless noted)
Toggle or pick ids renamed to the kept entry: fx_L8_jetpack_on, fx_L8_moonswaddled_night, fx_L8_shaarat_truesight, fx_L7_nightbringer_nopick, fx_L7_nightbringer_pick, fx_L7_wingwear_on, fx_L6_pariah_shield_allies, fx_L8_resistance_plating_fire, fx_L6_living_gloves_artisan, fx_L6_living_gloves_sleight.
Label or case only in expectC: fx_L8_lu_pools (resource name "Shield (Hearthfire Breastplate)"), fx_L7_athreos_devotee_min1 (resource name), fx_L6_thorn_wyrmreaver_unarmed ("force" to "Force"). Numbers unchanged.
Build changed because of the byOk fix: fx_L8_staff_forgotten_one (Fighter to Wizard Evoker, since a Fighter cannot attune that staff).
