# Art production for the D&D character sheet app

You are producing painted art with $imagegen for this repo. All task files are in the folder art-tasks/ on the branch art-tasks.

How to work:
1. Fetch the branch art-tasks and read this file and the part files art-tasks/part-01.md to art-tasks/part-14.md.
2. Work on the branch art-batch (create it from main if it does not exist, otherwise check it out and pull).
3. Read art/PROGRESS.md on art-batch if it exists. It lists finished images. Skip finished images and continue from the first unfinished one, part by part in order.
4. For each image: generate it with $imagegen using the rules below and the text in the part file, save it to the given path.
5. After every 5 images: update art/PROGRESS.md (one line per finished file path), commit and push to art-batch. Do not open a PR.
6. Never change any other file in the repo. Never touch main.
7. If you hit a usage limit or time limit, push what is done, update PROGRESS.md, and stop with a short report: last finished image and next one. When the user says continue, start again from step 1.
8. If an image comes out realistic, 3D or photo-like, regenerate it once before saving.
9. When everything is finished, write "ALL DONE" at the end of art/PROGRESS.md and report the image model used.

Approved reference look: branch art-style-test, files art/style-test/gnome-scene-pc.png (scenes) and art/style-test/bard-emblem.png (icons and emblems). Match them.

Style lock (identical for every image): it must look like a still frame from a classic Studio Ghibli anime film, with original designs. Characters and props: classic 2D anime cel animation look, clean thin hand-drawn outlines, flat cel colors with two or three tones, simple charming anime faces. Backgrounds: lush hand-painted gouache and watercolor exactly like Ghibli background art, with visible soft brush strokes and gentle color bleeds, which gives the fluid painted feel, warm natural light, lush greenery and soft clouds where they fit, cozy and whimsical but adventurous. Soft, slightly desaturated harmonious colors. Flat 2D look. NOT realistic, NOT a photo, NOT 3D, NOT digital concept art, NOT glossy.
Do not include: any text, letters, numbers, runes that look like writing, logos, watermark, signature, UI elements, photorealism, 3D render look, lens flare, chromatic aberration, oversaturated neon, copies of existing film characters or scenes.

SIZE AND COMPOSITION RULES (apply by the tag in brackets after each image number):
[AS WRITTEN] follow the size and description in the image text exactly.
[PC] 2400x1344 landscape, desktop app background. Characters and busy details only in the LEFT third and RIGHT third. The CENTER (33 to 67 percent of the width) stays calm and simple: open ground, path, water or sky, no characters, no small busy details. Horizon near 40 percent from the top. Medium brightness. All four outer edges fade softly into loose brush strokes and dark paper, no hard rectangular border.
[PHONE] 1088x1920 portrait, phone app background. Same place, light and style as its PC twin (the image just before it) but closer. Show 3 or 4 of the main characters only, all inside the TOP 45 percent. The BOTTOM 55 percent is calm ground fading into darker shadow at the very bottom, no characters, no small details.
[EMBLEM] 1024x1024, transparent background. One centered anime-style magic icon, straight-on front view, filling about 70 percent of the canvas with equal margins. Bold clean dark outline, flat cel colors with two tones, one hard-edged shadow, one small highlight, soft top-left light with a thin bright rim on the right. Only the listed glow color glows, kept tight to the emblem. Nothing outside the emblem. Readable as one bold shape at 64x64 pixels. No human faces.
[PORTRAIT] 768x960 portrait. Head-and-shoulders anime portrait of one original adventurer, facing three-quarters toward the viewer, friendly confident expression, simple charming Ghibli-style face, clean thin outlines and cel shading. Background: soft painted watercolor wash in the listed colors with a few loose brush strokes, no scenery details. The face sits in the upper middle so it still works when cropped to a square or a circle.
[VIGNETTE] 1024x1024. A small story illustration in a soft painted vignette: the scene sits in the middle and fades out to transparent at all edges with loose watercolor brush edges (transparent background around it). Simple composition, warm and charming, readable at 160x160 pixels.
[GRID] 2048x2048, transparent background. An icon sheet: 16 separate icons in an invisible 4 by 4 grid, each cell exactly 512x512 pixels, in the listed order (cell 1 top-left, cell 4 top-right, cell 16 bottom-right). Each icon centered in its own cell, filling about 65 percent of the cell, at least 48 pixels of empty space between neighbours, nothing crossing into another cell. No grid lines, no borders, no labels, no numbers, no text. Same icon style as [EMBLEM]: bold clean dark outline, flat cel colors with two tones, soft top-left light. All 16 icons share the same scale and line weight.

Parts:
- part-01.md: G0 style keys (24 images). ALREADY DONE on branch art-g0. Skip part 01 completely.
- part-02.md: Class scenes (26 images)
- part-03.md: PHB species scenes (18 images)
- part-04.md: Background scenes (32 images)
- part-05.md: Subclass emblems (53 images)
- part-06.md: Preset portraits (20 images)
- part-07.md: Builder steps, sheet tabs and screens (44 images)
- part-08.md: Moments, empty states and system states (20 images)
- part-09.md: Small icon sheets (8 images)
- part-10.md: Weapon and armor icons (4 images)
- part-11.md: Spell icons (595) (38 images)
- part-12.md: Creatures, companions, familiars and bastion (5 images)
- part-13.md: Other species communities (61) (122 images)
- part-14.md: Magic item icons (1144) (72 images)

Total: 486 images, 462 still to make (part 02 to part 14).
