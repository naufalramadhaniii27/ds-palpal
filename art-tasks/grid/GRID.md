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
9. Attach art-tasks/emblem-reference.png as style reference. For ui icons, all cells of one image must look like one matching icon set.

## Status

| Sheet | Cells | Content | Status |
|---|---|---|---|
| G01 | 100 | app UI icons (replace every line icon) | claimed by codex-grid-g01-g02 2026-11-02 12:44 UTC |
| G02 | 100 | app UI icons, then species emblems | open |
| G03 | 100 | species emblems and icons, features, items | done; needs review: cells 1-100 (glow padding and cell alignment) |
| G04 | 93 | items, library, rules, subclass and background emblems, vehicles, objects | open |

## Prompt per image

```
Make ONE image: 2560x1280 PNG with a fully transparent background, a grid of 10 columns x 5 rows, each cell 256x256. No grid lines, borders, numbers or labels. Each cell holds exactly one icon, centered, about 70% of the cell, inside the cell only. Cells are listed below in order: left to right, then top to bottom.

CELLS (copy from the sheet file, e.g. "1. art/batch/icons/ui/act-action.png | <subject>"; the path is only a name, never draw it)

Style: Studio Ghibli anime prop exactly like the approved class emblems in the attached reference, bright and warm, no gore. Soft clean hand-drawn anime outline, cel shading with two or three warm tones, natural wood, brass, cloth, leather, glass or stone materials, magic as soft glowing light. Every icon readable as one bold shape at 24x24 pixels. All 50 icons share one identical line weight, palette logic and lighting, as one matching set.

Every person is an adult. No video game badge, heraldic crest, chrome or spikes everywhere. Never include text, letters, numbers, writing-like runes, logos, watermarks, photorealism, 3D render look, neon colors, or copies of official D&D or Magic: The Gathering art. Book pages, scrolls, maps, signs and dice faces stay blank.
```
