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
9. Attach art-tasks/grid/style-ref.png (12 icons already in the app) as the ONLY style reference. Every cell must look like it belongs in that set. For ui icons, all cells of one image must look like one matching icon set.
10. STYLE CHECK before saving (v1 of G01 failed all three):
   a. Background is real transparency (alpha 0) and every icon is fully opaque (alpha 255 inside the outline). v1 had 0% opaque pixels: the whole sheet was semi-transparent, so icons look washed out and blurred colors show behind them. Check with Python before saving: at least 20% of pixels must have alpha 255. No painted, blurred, colored or checkerboard background.
   b. Same look as style-ref.png: soft thin brown-black outline, two or three soft cel tones, natural materials, gentle highlights. Not glossy mobile-game icons, not thick black outlines, not candy saturation, not neon glow.
   c. Physical props only. No arrows, plus signs, refresh circles, selection boxes or other flat UI symbols. Show an idea through a real object (a bonus action is a small winged boot, an added item is a pouch with a tag), as in style-ref.png.

## Status

| Sheet | Cells | Content | Status |
|---|---|---|---|
| G01 | 100 | app UI icons (replace every line icon) | done; needs review: cells 1-100 (padding/style consistency); cells 30,33 (remaining aura), 51 (rod resembles fishing pole), 87 (ability symbolism), 97-99 (inventory/description/main subjects shifted); rule 10a passed after authorized alpha correction |
| G02 | 100 | app UI icons, then species emblems | claimed by codex-grid-g01-g02 2026-11-02 12:49 UTC |
| G03 | 100 | species emblems and icons, features, items | claimed by codex-grid-g03-g04 2026-11-02 12:52 UTC (redo rule 10) |
| G04 | 93 | items, library, rules, subclass and background emblems, vehicles, objects | claimed by codex-grid-g03-g04 2026-11-02 12:48 UTC |

## Prompt per image

```
Make ONE image: 2560x1280 PNG with a fully transparent background (alpha 0, nothing painted behind the icons), a grid of 10 columns x 5 rows, each cell 256x256. No grid lines, borders, numbers or labels. Each cell holds exactly one icon, centered, about 70% of the cell, inside the cell only. Cells are listed below in order: left to right, then top to bottom.

CELLS (copy from the sheet file, e.g. "1. art/batch/icons/ui/act-action.png | <subject>"; the path is only a name, never draw it)

Style: exactly like the 12 icons in the attached style-ref.png (icons already in the app): Studio Ghibli anime prop, bright and warm, no gore. Soft clean hand-drawn anime outline, cel shading with two or three warm tones, natural wood, brass, cloth, leather, glass or stone materials, magic as soft glowing light. Every icon readable as one bold shape at 24x24 pixels. All 50 icons share one identical line weight, palette logic and lighting, as one matching set.

Every person is an adult. No video game badge, heraldic crest, chrome or spikes everywhere. Never include text, letters, numbers, writing-like runes, logos, watermarks, photorealism, 3D render look, neon colors, or copies of official D&D or Magic: The Gathering art. Book pages, scrolls, maps, signs and dice faces stay blank.
```
