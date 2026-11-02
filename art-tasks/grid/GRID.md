# Grid sheets G01 to G04 (393 icons and emblems)

Replaces batches 237 to 268 and the unfinished icon and emblem entries of older batches.
561 older entries already exist as grid icons on art-g1..art-g10 and are not repeated here.
Species portraits (90) are postponed.

## Rules

1. Work only on branch art-tasks. Never touch main.
2. Claim a sheet in the table below (`claimed by <session> <time>`), commit, `git pull --rebase`, push. If the push fails, pull and pick another sheet.
3. Each sheet has up to 100 cells. Make TWO images per sheet: part a = cells 1 to 50, part b = cells 51 to 100 (G04 b = cells 51 to 93, leave the remaining cells empty and transparent).
4. Each image: 2560x1280, transparent background (RGBA), 10 columns x 5 rows, each cell 256x256. Cell order: left to right, then top to bottom. Cell 1 (or 51) is top-left.
5. One subject per cell, centered, about 70% of the cell, nothing crossing into another cell. No grid lines, borders, numbers or labels.
6. Save at art-tasks/grid-out/G0N-a.png and art-tasks/grid-out/G0N-b.png. Do not cut. Claude cuts by cell and names each icon from the sheet list.
7. Mark the sheet `done`, commit `grid: G0N`, `git pull --rebase`, push.
8. If a cell is wrong, redo the whole image once. If still wrong, write the cell numbers in the status as `needs review: cells ...`.
9. Attach art-tasks/grid/style-ref.png (12 icons from the old grid sheets on art-g1..art-g10, the approved look) as the ONLY style reference. Every cell must look like it belongs in that set.
   METHOD (same as the old grid sheets, see art/PROGRESS.md on art-g1, "Sesi 1 sheet-002"): never draw 50 icons in one image. Make FOUR square generates per sheet, 1254x1254 RGBA, each holding 25 icons in a 5x5 layout: cells 1-25, 26-50, 51-75, 76-100. Do not upscale. Extract each object by alpha, scale it down only as needed, and place it centered in its 256x256 cell with at least 24 px margin. Then assemble G0N-a.png (cells 1-50) and G0N-b.png (cells 51-100) as before.
10. STYLE CHECK before saving (v1 of G01 failed all three):
   a. Background is real transparency (alpha 0) and every icon is fully opaque (alpha 255 inside the outline). v1 had 0% opaque pixels: the whole sheet was semi-transparent, so icons look washed out and blurred colors show behind them. Check with Python before saving: at least 20% of pixels must have alpha 255. No painted, blurred, colored or checkerboard background.
   b. Same look as style-ref.png: calm, slightly realistic painted props. Palette of brown, dull gold, ivory, stone with medium accent colors. Fine painted texture, small carvings and folds that still read small, limited gloss, thin contour a little darker than the material (never thick black), soft shadows, magic as soft colored wisps. Not glossy mobile-game icons, not chunky cartoon shapes, not candy saturation, not neon.
   c. Physical props only. No arrows, plus signs, refresh circles, selection boxes or other flat UI symbols. Show an idea through a real object (a bonus action is a small winged boot, an added item is a pouch with a tag), as in style-ref.png.

## Status

| Sheet | Cells | Content | Status |
|---|---|---|---|
| G01 | 100 | app UI icons (replace every line icon) | open (redo v3: match old grid style, four 1254 square generates, rule 9) |
| G02 | 100 | app UI icons, then species emblems | open (redo v3: match old grid style, four 1254 square generates, rule 9) |
| G03 | 100 | species emblems and icons, features, items | claimed by Codex 2026-11-02 14:58 UTC |
| G04 | 93 | items, library, rules, subclass and background emblems, vehicles, objects | open (v3 rules: match old grid style, rule 9) |

## Prompt per image

```
Make ONE image: 1254x1254 PNG with a fully transparent background (alpha 0, nothing painted behind the icons), 25 icons in a 5x5 layout, well separated. No grid lines, borders, numbers or labels. Each cell holds exactly one icon, centered, about 70% of the cell, inside the cell only. Cells are listed below in order: left to right, then top to bottom.

CELLS (copy from the sheet file, e.g. "1. art/batch/icons/ui/act-action.png | <subject>"; the path is only a name, never draw it)

Style: exactly like the 12 icons in the attached style-ref.png (the approved old grid icons): calm, slightly realistic painted fantasy prop, no gore. Thin contour a little darker than the material, fine painted texture, soft shadows, limited gloss, natural wood, brass, cloth, leather, glass or stone materials, magic as soft glowing light. Every icon readable as one bold shape at 24x24 pixels. All 25 icons share one identical line weight, palette logic and lighting, as one matching set.

Every person is an adult. No video game badge, heraldic crest, chrome or spikes everywhere. Never include text, letters, numbers, writing-like runes, logos, watermarks, photorealism, 3D render look, neon colors, or copies of official D&D or Magic: The Gathering art. Book pages, scrolls, maps, signs and dice faces stay blank.
```
