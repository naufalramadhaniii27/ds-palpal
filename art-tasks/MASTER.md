# Art production for the D&D character sheet app

RULE 1, HIGHEST PRIORITY: ZERO AI SLOP, MAXIMUM WOW, GORE AND DESPAIR IN A BRIGHT, COLORFUL WORLD.
TONE: GORE AND DESPAIR IN A BRIGHT, COLORFUL WORLD. The story is brutal: bloody gore, open wounds, blood splattered and pooled, fallen bodies, people in despair and grief, a world being destroyed. The environment around it is the opposite: bright, vivid and full of color, like a beautiful Studio Ghibli day (blue skies, white clouds, green fields, flowers, clear water, colorful autumn trees, cherry blossoms). The shocking contrast between the beautiful colorful world and the blood and despair is the whole point. Do NOT make the environment dark, orange-only, grey or gloomy. Every tragic image may still hold a small moment of human warmth (a friend carrying a wounded comrade, a hand on a shoulder). THEMES that must be felt in every scene, portrait and vignette: DESPAIR, A WORLD BEING DESTROYED, DEEP SORROW, pick only what fits each subject and Variation, never the same set of details twice in a row. Faces show grief, exhaustion and loss. Show BOTH kinds of wounds: wounds of the heart (heartbreak, mourning, guilt, loneliness, a hand on a grave, someone holding a lost friend's keepsake, tears) and wounds of the body (cuts, bandages soaked in blood, scars, broken armor, burns, limping, missing fingers or an eye patch where it fits). EXCEPTION: emblems, icons, ornaments, UI pieces and sprites get NO gore and no despair. The user loves the Part 00B class emblems exactly as they are (art/batch/emblems/class/ on art-batch, bright warm anime prop style). All emblems and icons must match those and art-tasks/ref/emblem-reference.png, with no blood, ash or cracks added. ENEMIES must be terrifying when they appear: bloodthirsty dragons, merciless demons and devils, horrors in fog. In scenes, an enemy appears only when the Variation threat names one, and then it is huge and overwhelming against small desperate heroes. Otherwise show the aftermath or other dangers. Beholders and beholder kin, mind flayers, aboleths and other horrors (part 27) are nightmares. Creatures in part 23 and part 27 that are monsters (dragons, fiends, undead, aberrations, monstrosities) look truly frightening and cruel, never cute. VARIETY: do not repeat the same formula. Change the light, the enemy (dragon, demon, undead army, giant, horror, plague, flood, or no enemy in sight, only the aftermath), and the enemy position and size from image to image. Not every scene has a dragon in the top-right corner and a sunset in the center. Keep the anime style and keep the calm card areas readable.
The user is extremely strict about AI slop and wants every image to be WOW. EVERY asset without exception (scenes, portraits, creatures, emblems, icons, vignettes, ornaments, frames, UI pieces, sprites) must be in the Studio Ghibli 2D anime film style. Nothing may look like a video game UI, a Western MMO icon, a 3D render or a photo. Follow the QUALITY BAR below for every image. Never lower quality to finish faster. If quota runs out, stop and report.

You are producing painted art with $imagegen for this repo. All task files are in the folder art-tasks/ on the branch art-tasks.

How to work:
0. Before any commit run: git config user.name "naufalramadhaniii27" and git config user.email "284653644+naufalramadhaniii27@users.noreply.github.com". Never commit with any other email (pushes with a private email are blocked).
1. Fetch the branch art-tasks and read this file and the part files art-tasks/part-01.md to art-tasks/part-27.md.
2. Work on the branch art-batch (create it from main if it does not exist, otherwise check it out and pull).
3. Read art/PROGRESS.md on art-batch if it exists. It lists finished images. Skip finished images and continue from the first unfinished one, part by part in order.
4. For each image: generate it with $imagegen using the rules below and the text in the part file, save it to EXACTLY the given path (create folders as needed). Keep the folder structure exactly as written. Do not rename files, do not put files anywhere else. art-tasks/index.json lists every path.
5. After every 5 images: update art/PROGRESS.md (one line per finished file path), commit and push to art-batch. Do not open a PR.
6. Never change any other file in the repo. Never touch main.
7. If you hit a usage limit or time limit, push what is done, update PROGRESS.md, and stop with a short report: last finished image and next one. When the user says continue, start again from step 1.
8. If an image comes out realistic, 3D or photo-like, regenerate it.
8b. If $imagegen refuses an image for safety (too graphic), do not stop and do not skip it: soften the gore one step and retry (for example a severed limb becomes a deep bleeding wound, bodies become wounded people lying down, pooled blood becomes blood stains), keep the bright colorful world and the despair, then note the change in art/REVIEW.md. Try at most three times, then mark it NEEDS REVIEW and move on.
9. When everything is finished, write "ALL DONE" at the end of art/PROGRESS.md and report the image model used.


PENDING FIRST: PART 00C. Parts 00 and 00B are done (keep them). Redo all 26 class scenes even though PROGRESS.md already lists them in art/batch/scenes/class/, each following the Variation line under its entry in part-02.md and the HOW TO WRITE EACH IMAGE PROMPT section. Overwrite the same paths. Also redo the part 03 scenes already made in the old orange tragic-warm tone (aasimar, dragonborn, dwarf, elf, goliath, PC and phone) with their Variation lines. Then continue with part 03.
Reference for emblems, icons, ornaments and UI: art-tasks/ref/emblem-reference.png and the approved class emblems in art/batch/emblems/class/. Scenes have no image reference: follow the text only.

Style lock (identical for every image): it must look like a still frame from a classic Studio Ghibli anime film, with original designs. Characters and props: classic 2D anime cel animation look, clean thin hand-drawn outlines, flat cel colors with two or three tones, expressive anime faces that can show fear, rage, pain and grim determination. Backgrounds: lush hand-painted gouache and watercolor exactly like Ghibli background art, with visible soft brush strokes and gentle color bleeds, which gives the fluid painted feel, bright, colorful, clear light taken from each image's Variation, vivid saturated environment colors. Tragic dark fantasy themes like Princess Mononoke, Nausicaa of the Valley of the Wind and Grave of the Fireflies: dangerous and heartbreaking, with blood, wounds, battle damage and cursed corruption shown openly where the scene calls for it, while the environment stays bright and colorful. Blood is vivid red. Avoid dark, gloomy, orange-only or grey palettes. Flat 2D look. NOT realistic, NOT a photo, NOT 3D, NOT digital concept art, NOT glossy.
Do not include: any text, letters, numbers, runes that look like writing, logos, watermark, signature, UI elements, photorealism, 3D render look, lens flare, chromatic aberration, oversaturated neon, copies of existing film characters or scenes.

QUALITY BAR: "WOW", NOT SLOP (applies to every image, read before each part):
- The target is WOW: striking, bold, epic and beautiful at first glance, the kind of art that makes people stop scrolling. It must always stay in the Studio Ghibli 2D anime film look: the WOW comes from wonder, vivid color, magical light and the shock of gore in a beautiful world, like magical objects and moments in Ghibli films. Never drift into Western video game icon style. NOT dull, NOT muddy, NOT rusty and faded.
- Emblems and icons: the approved reference is art-tasks/ref/emblem-reference.png (a Bard lute emblem the user loves). Match its look exactly: soft clean hand-drawn anime outline, gentle cel shading with two or three warm tones, natural materials (wood, brass, cloth, feather, glass, stone) in warm colors, magic as soft glowing light. Charming and magical, exactly like the approved Part 00B class emblems.
- NOT allowed for emblems and icons: chrome or polished steel armor plates, sharp spiky blades and spikes everywhere, hard metallic specular highlights, dark grimdark mood, heraldic video game badge or MMO class icon look (World of Warcraft, Diablo, mobile RPG style). The earlier Warlock and Paladin redos are examples of what NOT to do.
- Strong, readable silhouettes. Dynamic, confident composition with energy and movement (a swing, a burst, a twist), not stiff and flat.
- Rich vivid accent colors with clean value contrast (emblems and icons stay in their approved warm look), soft rim light and magical glow where it tells the story. Materials look alive and hand-painted.
- Details are purposeful and tell the story of the class or item. No filler decoration.
- What counts as AI SLOP and must be avoided: random ribbons, flowers or bows added for no reason; the same generic glowing star or orb as the whole idea; mushy or blurry details; broken anatomy, extra fingers, warped perspective; duplicated copy-paste objects; meaningless ornament spam; plastic skin; text-like squiggles; a bland stock-image composition.
- Portraits and creatures: Ghibli character design: soft round shapes, expressive simple faces, natural hair and clothes, bright colorful painted light. Monsters look like the boar gods and demons of Princess Mononoke, menacing and wild, still true to the D&D creature, never like a monster manual 3D render.
- UI pieces, frames, ribbons, sprites: hand-drawn props from a Ghibli film (wood, brass, paper, cloth, leaves), not shiny game UI.
- Scenes: rich, layered and alive, with specific characters doing specific things, varied faces and bodies, clear dramatic light. Still keep the calm center (PC) or calm bottom (phone) for the app cards.

HOW TO WRITE EACH IMAGE PROMPT (important, fixes the "all scenes look the same" problem):
- Do NOT compress the rules into one fixed formula and paste it into every prompt. Earlier scenes all came out the same (sunset, dragon top-right, wounded people, orange palette) because the same summary sentence was reused for every image.
- Build each prompt fresh, in this order: (1) the image's own subject text from the part file, (2) its Variation line (light, threat, camera) written out as concrete visual direction, (3) one short style line: for scenes, portraits, creatures and vignettes "Studio Ghibli 2D anime film look, bright colorful environment, bloody gore and despair", for emblems, icons, ornaments, UI and sprites "Studio Ghibli anime prop, exactly like the approved class emblems, no gore", (4) the size and composition rule of its tag. Keep (3) short so (1) and (2) lead.
- The environment is bright and full of color. Take the color key from the Variation light (blue sky, green meadow, cherry blossom pink, turquoise sea, autumn reds, rainbow, snow white and blue) and use a different color key than the previous scene. Never default to an orange sunset.
- Do not add a dragon or a sunset unless the subject or the Variation asks for it.
- The Variation line overrides any time of day, weather or light written in the subject text (for example a subject that says "at night" or "stormy sky" follows the Variation light instead). Keep the subject's place, people and actions.
- For scenes, do not pass earlier generated images as input references. Use references only for emblems and icons.
- Append the exact final prompt you sent for every image to art/PROMPTS.md (path, then the prompt), so it can be audited.

SIZE AND COMPOSITION RULES (apply by the tag in brackets after each image number):
[AS WRITTEN] follow the size and description in the image text exactly.
[PC] 2400x1344 landscape, desktop app background. The app puts cards over the middle of the image, so roughly the CENTER third (33 to 67 percent of the width) must stay low in detail and free of faces. Reach that in a DIFFERENT way each time, keeping it bright: open sky, a sunlit wall or cliff face, a calm lake or sea, a flower field or meadow, light mist, a snowfield, a large soft foreground branch of leaves or blossoms. Do NOT default to a symmetric road or river leading to a sun on the horizon in the middle. Vary the horizon height (high, low, or none), the vanishing point (left, right, or none), and where the light source is (left, right, behind the viewer, off-frame). Characters and busy details go to the sides, but not always mirrored left and right: sometimes one heavy side and one light side. Bright and colorful. All four outer edges fade softly into loose brush strokes and dark paper, no hard rectangular border.
[PHONE] 1088x1920 portrait, phone app background. Same place and Variation as its PC twin but closer and recomposed for portrait (not a crop). The characters and key details sit in the TOP 45 percent. The BOTTOM 55 percent is low in detail and slightly darker toward the very bottom (floor, ground, water, fog or shadow, chosen to fit the scene), with no faces.
[EMBLEM] 1024x1024, transparent background. One centered anime-style magic icon, straight-on front view, filling about 70 percent of the canvas with equal margins. Drawn exactly like art-tasks/ref/emblem-reference.png: a magical object as it would appear in a Studio Ghibli film close-up, soft clean hand-drawn anime outline, gentle cel shading with two or three warm tones, natural materials in warm colors, magic as soft glowing light, charming and full of wonder like the approved Part 00B class emblems, never a video game badge, soft top-left light with a thin bright rim on the right. Only the listed glow color glows, kept tight to the emblem. Nothing outside the emblem. Readable as one bold shape at 64x64 pixels. No human faces.
[PORTRAIT] 768x960 portrait. Head-and-shoulders anime portrait of one original adventurer, facing three-quarters toward the viewer, a Ghibli-style face whose emotion and condition change from portrait to portrait: grief, quiet resolve, exhaustion, anger, fragile hope, haunted calm; some with scars, bandages or grime, some unhurt but marked by loss; varied ages and builds. Never the same expression twice in a row, clean thin outlines and cel shading. Background: soft painted watercolor wash in the listed colors with a few loose brush strokes, no scenery details. The face sits in the upper middle so it still works when cropped to a square or a circle.
[VIGNETTE] 1024x1024. A small story illustration in a soft painted vignette: the scene sits in the middle and fades out to transparent at all edges with loose watercolor brush edges (transparent background around it). Simple composition, bright colorful setting with gore and despair, readable at 160x160 pixels.
[ICON] 1024x1024, transparent background. One icon for the named thing, centered, filling about 70 percent of the canvas, straight-on or slight three-quarter view. Same style as [EMBLEM]: drawn exactly like art-tasks/ref/emblem-reference.png: soft clean hand-drawn anime outline, gentle cel shading with two or three warm tones, natural materials in warm colors, magic as soft glowing light, exactly like the approved Part 00B class emblems, never a video game icon, soft top-left light, thin bright rim on the right. A distinct silhouette with two or three small story details. Readable at 48x48 pixels. Nothing outside the icon.
[CREATURE] 1024x1024, transparent background. Full-body anime-style illustration of the named creature in a clear three-quarter pose, filling about 75 percent of the canvas, soft clean hand-drawn anime outline, gentle cel shading, bright colorful light, Princess Mononoke creature design, true to the creature. Ordinary animals and familiars (cat, frog, horse, owl and similar) look natural and alive, they may be wounded or bloodied but not monstrous. Monsters (dragons, fiends, undead, aberrations, monstrosities) are menacing, wild and cruel, with blood on claws and fangs. Readable at 96x96 pixels. Nothing outside the creature.

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
- part-27.md: Horror monster gallery: beholder kin, mind flayers, dragons, demons, devils, undead, monstrosities (53 images)

Total: 3758 images, 3734 still to make (part 02 to part 27).
