# HD icon sheets H01 to H24 (94 icons)

These icons only exist at 128 px in the app and show blurry in the detail sheet. Redraw them large, in the same quality as the art-batch icons (rations, potion of healing and the rest).

## Rules

1. Work only on branch art-tasks. Never touch main.
2. Claim a sheet in the Status table ("claimed by <session> <time>"), commit, git pull --rebase, push. If the push fails, pull and continue.
3. Each sheet = ONE image: 1254x1254 PNG RGBA, real transparent background (alpha 0). 2x2 layout: cell 1 top-left, 2 top-right, 3 bottom-left, 4 bottom-right. Each icon centered in its quarter, about 70% of the quarter, with a wide empty transparent gap between icons. No grid lines, borders, numbers or labels. H24 has two icons: cells 1 and 2 in the top quarters, the bottom half stays empty and transparent.
4. Attach art-tasks/hd/style-ref.png (8 approved art-batch icons, 1024 px originals) as the ONLY style reference. Every icon must look like it belongs in that set at full size: same painterly detail, same soft clean outline, same material rendering and lighting.
5. Before saving, check with Python: background alpha 0, at least 20% of pixels alpha 250 or more (the image tool writes 252 or 253 for solid pixels, that counts as opaque, never mark a sheet for review only because of 252 or 253), no icon touches another quarter. Do not upscale and do not cut. Claude cuts and names the icons.
6. Save art-tasks/hd-out/H0N.png (H01..H24). Mark the sheet "done" or "needs review: cells ...", commit "hd: H0N", git pull --rebase, push.
7. If a cell is wrong, redo the whole image once. If still wrong, mark needs review.

## Lanes

| Session | Sheets |
|---|---|
| 1 | H01 to H05 |
| 2 | H06 to H10 |
| 3 | H11 to H15 |
| 4 | H16 to H20 |
| 5 | H21 to H24 |

## Status

| Sheet | Icons | Status |
|---|---|---|
| H01 | species/aarakocra, species/aasimar, species/air-genasi, species/bugbear | needs review: cells 1–4; regenerated once; rule 5 alpha fails (0.038% opaque, edge/gap residue) |
| H02 | species/centaur, species/changeling, species/custom, species/dhampir | needs review: cells 1–4; regenerated once; rule 5 alpha fails (opacity and edge/gap residue) |
| H03 | species/dragonborn, species/dwarf, species/earth-genasi, species/elf | needs review: cells 1–4; regenerated once; rule 5 alpha fails; cell 4 includes face profile |
| H04 | species/fairy, species/firbolg, species/fire-genasi, species/githyanki | needs review: cells 1–4; regenerated once; rule 5 alpha fails (opacity and gap residue) |
| H05 | species/githzerai, species/gnome, species/goblin, species/goliath | open |
| H06 | species/halfling, species/harengon, species/hexblood, species/hobgoblin | needs review: cells 1-4 alpha 255 coverage 0.07%; stray alpha at edges and quarter gaps after whole-sheet redo |
| H07 | species/human, species/kalashtar, species/kenku, species/kobold | needs review: cells 1-4 alpha 255 coverage below 20%; stray alpha at edges and quarter gaps after whole-sheet redo |
| H08 | species/leonin, species/lizardfolk, species/loxodon, species/lupin | needs review: cells 1-4 alpha 255 coverage below 20%; stray alpha at edges and quarter gaps after whole-sheet redo |
| H09 | species/minotaur, species/orc, species/owlin, species/reborn | claimed by codex-session-2 2026-11-03T01:41:14+00:00 |
| H10 | species/satyr, species/shifter, species/tiefling, species/water-genasi | open |
| H11 | background/acolyte, background/artisan, background/charlatan, background/criminal | needs review: cells 1–4 alpha below 255 after whole-sheet retry |
| H12 | background/custom, background/entertainer, background/farmer, background/guard | claimed by codex-session-3 2026-11-03T01:35:31+00:00 |
| H13 | background/guide, background/hermit, background/merchant, background/noble | open |
| H14 | background/sage, background/sailor, background/scribe, background/soldier | open |
| H15 | background/wayfarer, cat/background, cat/charopt, cat/class | open |
| H16 | cat/condition, cat/creature, cat/cult, cat/deck | needs review: cells 1–4 (rule 5: alpha 255 coverage 0.077%, below 20%; faint alpha residue in background/gaps; whole-sheet retry used) |
| H17 | cat/deity, cat/disease, cat/facility, cat/feat | needs review: cells 1–4 (rule 5: alpha 255 coverage 0.030%, below 20%; faint alpha residue in background/gaps; whole-sheet retry used) |
| H18 | cat/feature, cat/gear, cat/hazard, cat/homebrew | needs review: cells 1–4 (rule 5: alpha 255 coverage 0.054%, below 20%; faint alpha residue in background/gaps); cell 3 warning flame unclear; whole-sheet retry used |
| H19 | cat/item, cat/language, cat/monster, cat/object | claimed by codex-session-4 2026-11-03T01:41:40+00:00 |
| H20 | cat/optfeat, cat/option, cat/psionic, cat/recipe | open |
| H21 | cat/rule, cat/skill, cat/species, cat/spell | needs review: cells 1–4 (background edge alpha; opaque coverage below 20%; central gutter alpha) |
| H22 | cat/subclass, cat/table, cat/vehicle, size/tiny | needs review: cells 1–4 (background edge alpha; opaque coverage below 20%; central gutter alpha) |
| H23 | size/small, size/medium, size/large, size/huge | needs review: cells 1–4 (background edge alpha; opaque coverage below 20%; central gutter alpha) |
| H24 | size/gargantuan, cat/book | claimed by codex-session-5 2026-11-03T01:41:27+00:00 |

## Prompt per sheet

```
Make ONE image: 1254x1254 PNG with a fully transparent background (alpha 0, nothing painted behind the icons). 2x2 layout, one icon per quarter, centered, about 70% of the quarter, wide empty gap between icons. No grid lines, borders, numbers or labels.
CELLS (from the sheet list below, in order: top-left, top-right, bottom-left, bottom-right; the path is only a name, never draw it):
<the 4 cell lines>
Style: exactly like the 8 icons in the attached style-ref.png (approved app icons): Studio Ghibli anime prop, bright and warm, no gore. Soft clean hand-drawn anime outline, cel shading with two or three warm tones and fine painted detail, natural wood, brass, cloth, leather, glass or stone materials, magic as soft glowing light. One compact silhouette per icon, readable at 48x48 pixels. All 4 icons share one line weight, palette logic and lighting. Fully opaque icons, no glow haze over the background.
Every person is an adult. No video game badge, heraldic crest, chrome or spikes everywhere. Never include text, letters, numbers, writing-like runes, logos, watermarks, photorealism, 3D render look, neon colors, or copies of official D&D or Magic: The Gathering art. Book pages, scrolls, maps, signs, cards and dice faces stay blank.
```

## Sheet list

### H01
1. species/aarakocra | Aarakocra species emblem: a large bird-person wing feather crossed with a slim javelin, a wisp of sky wind around it
2. species/aasimar | Aasimar species emblem: a small glowing halo ring above a pair of soft feathered wings, warm gold light
3. species/air-genasi | Air Genasi species emblem: a swirling knot of pale blue wind around a small smooth sky-stone
4. species/bugbear | Bugbear species emblem: a long-armed furry fist gripping a spiked morningstar handle, coarse brown fur

### H02
1. species/centaur | Centaur species emblem: a horseshoe wrapped in a braided leather cord with a fletched arrow through it
2. species/changeling | Changeling species emblem: a pale blank porcelain mask with a second face mask half peeling behind it, silver shimmer
3. species/custom | Custom lineage emblem: a blank carved wooden figurine with a carving knife beside it, wood shavings curling
4. species/dhampir | Dhampir species emblem: a silver goblet of dark red wine with a small bat wing shaped handle, moonlight sheen

### H03
1. species/dragonborn | Dragonborn species emblem: a single large dragon scale shield-shaped, bronze with a small breath of flame at its edge
2. species/dwarf | Dwarf species emblem: a forge hammer resting on a small iron anvil, braided beard ring hanging from the handle
3. species/earth-genasi | Earth Genasi species emblem: a rough geode split open showing amber crystals, small pebbles floating around
4. species/elf | Elf species emblem: a slender leaf-shaped silver brooch with a pointed ear profile in its curve, green leaves

### H04
1. species/fairy | Fairy species emblem: a pair of iridescent insect-like wings above a foxglove flower, tiny sparkles
2. species/firbolg | Firbolg species emblem: a large mossy walking staff with a small mushroom cluster and a blue bird perched on it
3. species/fire-genasi | Fire Genasi species emblem: a smooth ember stone with calm flames rising from it, no face
4. species/githyanki | Githyanki species emblem: a silver greatsword with a ridged crest-like hilt, faint violet psychic glow

### H05
1. species/githzerai | Githzerai species emblem: a monk's prayer bead loop around a calm floating river stone, soft teal psychic glow
2. species/gnome | Gnome species emblem: a small brass tinker's gear with a pair of tiny round spectacles resting on it
3. species/goblin | Goblin species emblem: a small curved dagger stuck through a stolen coin pouch, green leather wrap
4. species/goliath | Goliath species emblem: a large mountain stone with a giant's carved tribal line pattern, small snow cap

### H06
1. species/halfling | Halfling species emblem: a round clay pipe beside a small cozy loaf and a sprig of herbs
2. species/harengon | Harengon species emblem: a pair of long rabbit ears tied with a ribbon of clover, springy leaf
3. species/hexblood | Hexblood species emblem: a twisted hag's crown of thorny twigs with a single violet eye-shaped gem
4. species/hobgoblin | Hobgoblin species emblem: a disciplined red lacquered war banner pole tip with a small iron spearhead

### H07
1. species/human | Human species emblem: an open hand holding a small sprouting seedling and a tool, warm light
2. species/kalashtar | Kalashtar species emblem: a crescent moon pendant with a calm closed eye carved in it, soft purple dream glow
3. species/kenku | Kenku species emblem: a black crow feather crossed with a small brass bell, echoing ripple lines of light
4. species/kobold | Kobold species emblem: a tiny clawed hand holding a sling and a glowing dragon egg shard

### H08
1. species/leonin | Leonin species emblem: a lion mane-shaped golden sun disc with a hunting spear behind it
2. species/lizardfolk | Lizardfolk species emblem: a green scaled shield made from a turtle shell with a bone club
3. species/loxodon | Loxodon species emblem: a carved stone elephant trunk curling around a monk's bell
4. species/lupin | Lupin species emblem: a wolf paw print on a round wooden token with a fur tassel

### H09
1. species/minotaur | Minotaur species emblem: a pair of curved bull horns over a labyrinth-shaped bronze ring, no letters
2. species/orc | Orc species emblem: a heavy tusk carved into a pendant on a leather cord, small war axe behind it
3. species/owlin | Owlin species emblem: a large soft owl wing feather with a small crescent moon charm
4. species/reborn | Reborn species emblem: a stitched cloth heart with a small sprouting flower growing from the seam

### H10
1. species/satyr | Satyr species emblem: a set of reed pan pipes tied with ivy beside a curled ram horn
2. species/shifter | Shifter species emblem: a beast claw necklace with three claws and a tuft of wild fur
3. species/tiefling | Tiefling species emblem: a pair of curled horns around a small infernal flame, no face
4. species/water-genasi | Water Genasi species emblem: a swirling sphere of clear sea water with a small seashell inside

### H11
1. background/acolyte | Acolyte background emblem: a simple temple prayer book with a holy symbol pendant resting on it, candle glow
2. background/artisan | Artisan background emblem: a wooden mallet and chisel crossed over a half-carved wooden block
3. background/charlatan | Charlatan background emblem: a fancy mask with a pair of loaded dice and a fake signet ring
4. background/criminal | Criminal background emblem: a set of lockpicks on a leather roll beside a small black hood

### H12
1. background/custom | Custom background emblem: an empty traveler's satchel open with a blank tag tied to it
2. background/entertainer | Entertainer background emblem: a lute with a jester's ribbon wrapped around its neck
3. background/farmer | Farmer background emblem: a bundle of wheat sheaves tied with twine leaning on a pitchfork
4. background/guard | Guard background emblem: a lantern hanging from a spear haft with a round watch shield

### H13
1. background/guide | Guide background emblem: a coil of rope with a brass compass and a walking stick
2. background/hermit | Hermit background emblem: a small herbal mortar and pestle with dried herbs and a single candle
3. background/merchant | Merchant background emblem: a brass balance scale with a small sack of coins on one pan
4. background/noble | Noble background emblem: a signet ring on a velvet cushion with a small gold circlet

### H14
1. background/sage | Sage background emblem: a stack of old books with a quill and a pair of reading spectacles, pages blank
2. background/sailor | Sailor background emblem: a ship anchor wrapped in rope with a small spyglass
3. background/scribe | Scribe background emblem: an ink pot with two quills and a rolled blank parchment
4. background/soldier | Soldier background emblem: a dented helmet with a short sword and a campaign medal ribbon

### H15
1. background/wayfarer | Wayfarer background emblem: a worn traveling boot beside a bedroll and a walking staff
2. cat/background | Library category Backgrounds: a traveler's satchel with a scroll, a tool and a small trinket peeking out
3. cat/charopt | Library category Character Options: a small wooden character figurine on a round base with a choice of two tiny banners
4. cat/class | Library category Classes: a sword, a staff and a lute fanned together, bound with one ribbon

### H16
1. cat/condition | Library category Conditions: a spiral-eyed dizzy charm pendant with a small chain shackle
2. cat/creature | Library category Creatures: a beast paw print pressed into a round clay tablet with a feather
3. cat/cult | Library category Cults: a hooded robe with a dark candle and a sinister amulet, no symbols with letters
4. cat/deck | Library category Decks: a fan of three blank tarot-style cards with gilded edges

### H17
1. cat/deity | Library category Deities: a radiant temple altar with a glowing sun disc above it
2. cat/disease | Library category Diseases: a cracked medicine bottle with a sickly green mist and a plague doctor mask
3. cat/facility | Library category Bastion Facilities: a small stone tower with a wooden door and a banner, compact
4. cat/feat | Library category Feats: a laurel wreath around a small star-shaped medal

### H18
1. cat/feature | Library category Features: a gem-studded badge with three small radiating sparks
2. cat/gear | Library category Gear: a backpack with rope, torch and bedroll strapped on
3. cat/hazard | Library category Hazards: a cracked stone slab with a hidden spike trap and a small warning flame
4. cat/homebrew | Library category Homebrew: a bubbling cauldron with a wooden ladle and sparkling steam

### H19
1. cat/item | Library category Items: an open treasure chest with a ring, a potion and a dagger inside
2. cat/language | Library category Languages: an open blank book with two speech-scroll ribbons floating out, no writing
3. cat/monster | Library category Monsters: a dragon claw gripping a broken shield
4. cat/object | Library category Objects: a wooden barrel with a crate and a clay jar stacked

### H20
1. cat/optfeat | Library category Optional Features: a key ring with three ornate keys of different metals
2. cat/option | Library category Options: a branching wooden signpost with two blank arrow-shaped planks
3. cat/psionic | Library category Psionics: a crystal brain-shaped gem with soft violet waves around it
4. cat/recipe | Library category Recipes: a cooking pot with a wooden spoon and herbs on a cutting board

### H21
1. cat/rule | Library category Rules: a heavy blank tome with a brass corner and a balance scale bookmark
2. cat/skill | Library category Skills: a toolbelt with a lockpick, a magnifying glass and a small rope coil
3. cat/species | Library category Species: three small carved busts in a row: elf, dwarf and orc profiles, wooden
4. cat/spell | Library category Spells: a spellbook with a glowing star-shaped spark rising from it, pages blank

### H22
1. cat/subclass | Library category Subclasses: a branching tree of three small glowing gem fruits on one stem
2. cat/table | Library category Tables: a twenty-sided die resting on a blank parchment table sheet, faces blank
3. cat/vehicle | Library category Vehicles: a small wooden cart wheel with a ship rudder crossed behind it
4. size/tiny | Size Tiny: a small field mouse sitting on a single acorn

### H23
1. size/small | Size Small: a fox sitting beside a little lantern
2. size/medium | Size Medium: a traveler's hooded cloak on a coat stand with a sword at its side
3. size/large | Size Large: a draft horse head with a saddle and bridle
4. size/huge | Size Huge: a giant's large stone fist resting on a broken tree trunk

### H24
1. size/gargantuan | Size Gargantuan: a massive dragon head rising from a mountain peak
2. cat/book | Library category Books: a closed leather-bound book with brass corners and a ribbon bookmark, cover blank
