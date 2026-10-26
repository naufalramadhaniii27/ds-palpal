# Art production for the D&D character sheet app

RULE 1, HIGHEST PRIORITY: ZERO AI SLOP, MAXIMUM WOW.
The user is extremely strict about AI slop and wants every image to be WOW. Follow the QUALITY BAR below for every image. Never lower quality to finish faster. If quota runs out, stop and report.

You are producing painted art with $imagegen for this repo. All task files are in the folder art-tasks/ on the branch art-tasks.

How to work:
1. Fetch the branch art-tasks and read this file and the part files art-tasks/part-01.md to art-tasks/part-26.md.
0. Before any commit run: git config user.name "naufalramadhaniii27" and git config user.email "284653644+naufalramadhaniii27@users.noreply.github.com". Never commit with any other email (pushes with a private email are blocked).
2. Work on the branch art-batch (create it from main if it does not exist, otherwise check it out and pull).
3. Read art/PROGRESS.md on art-batch if it exists. It lists finished images. Skip finished images and continue from the first unfinished one, part by part in order.
4. For each image: generate it with $imagegen using the rules below and the text in the part file, save it to EXACTLY the given path (create folders as needed). Keep the folder structure exactly as written. Do not rename files, do not put files anywhere else. art-tasks/index.json lists every path.
5. After every 5 images: update art/PROGRESS.md (one line per finished file path), commit and push to art-batch. Do not open a PR.
6. Never change any other file in the repo. Never touch main.
7. If you hit a usage limit or time limit, push what is done, update PROGRESS.md, and stop with a short report: last finished image and next one. When the user says continue, start again from step 1.
8. If an image comes out realistic, 3D or photo-like, regenerate it.
9. When everything is finished, write "ALL DONE" at the end of art/PROGRESS.md and report the image model used.


FIRST, BEFORE PART 02: PART 00 (UPDATED). The user did NOT like the worn, rusty, muted redo direction. The user wants WOW: bold, epic, striking, polished. The originals on art-g0 were better than the worn redos.
- Delete these worn redos from art-batch: art/batch/g0/emblem-artificer.png, art/batch/g0/emblem-barbarian.png, art/batch/g0/emblem-druid.png, art/batch/g0/emblem-fighter.png. The originals on art-g0 are KEEP.
- KEEP all other art-g0 and art-style-test originals as they are, except the list below.
- Redo ONLY these, in the new WOW style (more epic and dramatic than the originals, same meaning and size): art/g0/emblem-cleric.png (no ribbons, no lilies: a radiant mace and sun disc with real power), art/g0/emblem-paladin.png (not a generic winged sword: a holy oath blade with drama), art/g0/emblem-wizard.png (not a generic glowing star: a living spellbook with spell energy pouring out), art/g0/emblem-warlock.png (a specific eldritch pact object with menace), art/g0/frame-portrait.png and art/g0/badge-level.png and art/g0/divider-wood.png (richer, more ornate carving and inlay, premium, still clean), art/style-test/bard-emblem.png (an epic magical lute, music bursting from it, no random ribbon), art/g0/home-inn-phone.png and art/style-test/gnome-scene-phone.png (fix layout: all characters in the top 45 percent, calm bottom).
- Save redos to art/batch/g0/<same name> and art/batch/style-test/<same name>, overwriting the worn cleric redo.
- Rewrite art/REVIEW.md with the new verdicts. Commit, push, then continue with part 02.

Reference look for scenes: art/style-test/gnome-scene-pc.png on branch art-style-test and art/g0/home-inn-pc.png on branch art-g0. For emblems and icons use the approved originals on art-g0 (emblem-barbarian, emblem-fighter, emblem-druid, emblem-artificer, emblem-monk, emblem-sorcerer) and the WOW redos from part 00 as the reference.

Style lock (identical for every image): it must look like a still frame from a classic Studio Ghibli anime film, with original designs. Characters and props: classic 2D anime cel animation look, clean thin hand-drawn outlines, flat cel colors with two or three tones, simple charming anime faces. Backgrounds: lush hand-painted gouache and watercolor exactly like Ghibli background art, with visible soft brush strokes and gentle color bleeds, which gives the fluid painted feel, warm natural light, lush greenery and soft clouds where they fit, cozy and whimsical but adventurous. Soft, slightly desaturated harmonious colors. Flat 2D look. NOT realistic, NOT a photo, NOT 3D, NOT digital concept art, NOT glossy.
Do not include: any text, letters, numbers, runes that look like writing, logos, watermark, signature, UI elements, photorealism, 3D render look, lens flare, chromatic aberration, oversaturated neon, copies of existing film characters or scenes.

QUALITY BAR: "WOW", NOT SLOP (applies to every image, read before each part):
- The target is WOW: striking, bold, epic and beautiful at first glance, the kind of art that makes people stop scrolling. Think key art and class crests of a premium fantasy game, painted in the Ghibli anime look. NOT dull, NOT muddy, NOT rusty and faded.
- The approved originals on art-g0 (emblems, corners, crest) show the right level of polish, color and punch. Keep that punch. Make it even more dramatic, never more drab.
- Strong, readable silhouettes. Dynamic, confident composition with energy and movement (a swing, a burst, a twist), not stiff and flat.
- Rich saturated accent colors with clean value contrast, dramatic rim light and magical glow where it tells the story. Materials look premium and alive: polished steel with sharp highlights, glowing runes-free enchantments, lustrous gems, vivid flames.
- Details are purposeful and tell the story of the class or item. No filler decoration.
- What counts as AI SLOP and must be avoided: random ribbons, flowers or bows added for no reason; the same generic glowing star or orb as the whole idea; mushy or blurry details; broken anatomy, extra fingers, warped perspective; duplicated copy-paste objects; meaningless ornament spam; plastic skin; text-like squiggles; a bland stock-image composition.
- Scenes: rich, layered and alive, with specific characters doing specific things, varied faces and bodies, clear dramatic light. Still keep the calm center (PC) or calm bottom (phone) for the app cards.

SIZE AND COMPOSITION RULES (apply by the tag in brackets after each image number):
[AS WRITTEN] follow the size and description in the image text exactly.
[PC] 2400x1344 landscape, desktop app background. Characters and busy details only in the LEFT third and RIGHT third. The CENTER (33 to 67 percent of the width) stays calm and simple: open ground, path, water or sky, no characters, no small busy details. Horizon near 40 percent from the top. Medium brightness. All four outer edges fade softly into loose brush strokes and dark paper, no hard rectangular border.
[PHONE] 1088x1920 portrait, phone app background. Same place, light and style as its PC twin (the image just before it) but closer. Show 3 or 4 of the main characters only, all inside the TOP 45 percent. The BOTTOM 55 percent is calm ground fading into darker shadow at the very bottom, no characters, no small details.
[EMBLEM] 1024x1024, transparent background. One centered anime-style magic icon, straight-on front view, filling about 70 percent of the canvas with equal margins. Bold clean dark outline, rich cel shading with three tones, crisp highlights, dramatic rim light, polished premium materials, soft top-left light with a thin bright rim on the right. Only the listed glow color glows, kept tight to the emblem. Nothing outside the emblem. Readable as one bold shape at 64x64 pixels. No human faces.
[PORTRAIT] 768x960 portrait. Head-and-shoulders anime portrait of one original adventurer, facing three-quarters toward the viewer, friendly confident expression, simple charming Ghibli-style face, clean thin outlines and cel shading. Background: soft painted watercolor wash in the listed colors with a few loose brush strokes, no scenery details. The face sits in the upper middle so it still works when cropped to a square or a circle.
[VIGNETTE] 1024x1024. A small story illustration in a soft painted vignette: the scene sits in the middle and fades out to transparent at all edges with loose watercolor brush edges (transparent background around it). Simple composition, warm and charming, readable at 160x160 pixels.
[ICON] 1024x1024, transparent background. One icon for the named thing, centered, filling about 70 percent of the canvas, straight-on or slight three-quarter view. Same style as [EMBLEM]: bold clean dark outline, rich cel shading with three tones, crisp highlights, dramatic rim light, soft top-left light, thin bright rim on the right. A distinct silhouette with two or three small story details. Readable at 48x48 pixels. Nothing outside the icon.
[CREATURE] 1024x1024, transparent background. Full-body anime-style illustration of the named creature in a clear three-quarter pose, filling about 75 percent of the canvas, bold clean dark outline, rich cel shading, dramatic light, Ghibli-like charm but true to the creature, readable at 96x96 pixels. Nothing outside the creature.

Parts:
- part-01.md: G0 style keys (24 images). ALREADY DONE on branch art-g0. Skip part 01 completely.
- part-02.md: Class scenes (26 images)
- part-03.md: PHB species scenes (18 images)
- part-04.md: Background scenes (32 images)
- part-05.md: Subclass emblems (53 images)
- part-06.md: Preset portraits (20 images)
- part-07.md: Builder steps, sheet tabs and screens (44 images)
- part-08.md: Moments, empty states and system states (20 images)
- part-09.md: Small icon sheets (114 images)
- part-10.md: Weapon and armor icons (51 images)
- part-11.md: Spell icons (595) (595 images)
- part-12.md: Creatures, companions, familiars and bastion (63 images)
- part-13.md: Other species communities (61) (122 images)
- part-14.md: Magic item icons (1144) (1144 images)
- part-15.md: Feat icons (79 images)
- part-16.md: Rules icons: invocations, metamagic, maneuvers, weapon properties, languages, resources, actions (127 images)
- part-17.md: Class feature icons (137 images)
- part-18.md: Subclass feature icons (502 images)
- part-19.md: Extra subclass emblems (other sources and homebrew) (41 images)
- part-20.md: Species emblems (71 communities) (71 images)
- part-21.md: Background emblems (16) (16 images)
- part-22.md: Preset portraits for the other 61 communities (122 images)
- part-23.md: Creature art (116) (116 images)
- part-24.md: Adventuring gear, packs and tools icons (128 images)
- part-25.md: Environment scenes for music, combat and ambience (28 images)
- part-26.md: UI ornaments and animation sprites (12 images)

Total: 3705 images, 3681 still to make (part 02 to part 26).
