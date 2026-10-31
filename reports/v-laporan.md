# V. Final verification (branch third-party-all)

## Tests
- Suite on the build before the last fix: scenarios 24, tp_ui 9, tp_spells 5, tp_items (all ok), tp_class 259, tp_p5g 185, tp_p5l 75, tp_sources 2097, xlinks 35, q_ref 11, q_lib 34, q_reward 87, q_hb 10, q_fluff 6, q_img 14, golden_rules 1001 characters, fuzz_rules 500 characters, csp_check. Zero failures.
- After the save-advantage fix: scenarios 24, tp_ui 9, tp_items (new check "item save advantage shown as save note" ok at both viewports).
- Three required scenarios (old Yudhi sheet, after Apply, new character) at 390x844 and 1250x850: screenshots in tests/out/.

## Fix in V
- `C.itemAdv` filter tested "save" and missed "saving throws". Item advantage on saves now goes to `C.saveNotes` ("Advantage on ..."), shown under Saving Throws and in the printable sheet.

## Known limits
- Monster trait and action text is not copied (names and attack numbers only). 8 monster rows stay unresolved (`_copy`), see reports/q-gap.md.
- Homebrew rows are facts only. They reach the Library, not the builder or sheet.
- Library images and lore show in Library detail only, not on the sheet.
- 18 monsters have no image. Deities (376), mantras (331) and recipes (263) have no image.
- 5etools image wins over Codex art (qart.py skips names that already have a 5etools image).
- T5 waits for branch art-t4 from Codex.
- Item audit (items without fx): Save advantage 48 (mostly conditional), Immunity 86, Resistance 34, Speed 37, Darkvision 25.
- UA covers only the Mystic psionics.
- About 250 other homebrew collections without an edition (`collection/`) are not in the plan.
