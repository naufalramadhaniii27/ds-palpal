# Species scene queue (art-scenes)

Goal: 50 new species scenes, PC and phone. 13 PC sheets and 25 phone sheets, 38 generates total.
Subjects and file names: art/scenes-src/species-manifest.json. This file holds the rules and the templates.

## Rules

1. Work only on branch art-scenes. Never touch main or other art-* branches.
2. Claim a sheet before you start: set its status to `claimed by <session> <time>` in the table, commit, `git pull --rebase`, push. If the push fails, pull and pick another sheet.
3. One generate per sheet file. Save only the whole sheet at the path in the table. Do not crop, resize or upscale. Claude cuts and upscales later with tools/art/sheet_cut.py.
4. After saving: set status to `done`, commit with message `scenes: <sheet id>`, `git pull --rebase`, push.
5. If a panel breaks a rule (text, child, wrong species, copy of another panel), redo the whole sheet once. If it still fails, set status `needs review: <reason>` and move on.
6. Do the PC sheet of a group before its phone sheets, and attach the PC sheet as reference when making the phone sheets.
7. Always attach art/test/scene-sheet-test-01.png as style reference.

## Status

| Sheet | File | Panels | Status |
|---|---|---|---|
| S01 PC | art/scenes-src/species/S01-pc.png | faerie, eladrin-2014, drow, shadar-kai-2014 | done |
| S01 phone a | art/scenes-src/species/S01a-phone.png | faerie, eladrin-2014 | done |
| S01 phone b | art/scenes-src/species/S01b-phone.png | drow, shadar-kai-2014 | done |
| S02 PC | art/scenes-src/species/S02-pc.png | duergar-2014, yuan-ti-pureblood, dreamer, downcast | done |
| S02 phone a | art/scenes-src/species/S02a-phone.png | duergar-2014, yuan-ti-pureblood | done |
| S02 phone b | art/scenes-src/species/S02b-phone.png | dreamer, downcast | done |
| S03 PC | art/scenes-src/species/S03-pc.png | dhakaani-ghaaldar, dhakaani-golindar, dhakaani-guuldar, jhorguntaal | done |
| S03 phone a | art/scenes-src/species/S03a-phone.png | dhakaani-ghaaldar, dhakaani-golindar | done |
| S03 phone b | art/scenes-src/species/S03b-phone.png | dhakaani-guuldar, jhorguntaal | done |
| S04 PC | art/scenes-src/species/S04-pc.png | kalamer-landwalker, ruinbound, nautilid, amoeboid | done |
| S04 phone a | art/scenes-src/species/S04a-phone.png | kalamer-landwalker, ruinbound | done |
| S04 phone b | art/scenes-src/species/S04b-phone.png | nautilid, amoeboid | done |
| S05 PC | art/scenes-src/species/S05-pc.png | geppettin, manikin, wechselkind, vect | done |
| S05 phone a | art/scenes-src/species/S05a-phone.png | geppettin, manikin | done |
| S05 phone b | art/scenes-src/species/S05b-phone.png | wechselkind, vect | done |
| S06 PC | art/scenes-src/species/S06-pc.png | mandrake, accursed, arisen, disembodied | done |
| S06 phone a | art/scenes-src/species/S06a-phone.png | mandrake, accursed | done |
| S06 phone b | art/scenes-src/species/S06b-phone.png | arisen, disembodied | done |
| S07 PC | art/scenes-src/species/S07-pc.png | grudgel, laneshi, ogresh, wulven | done |
| S07 phone a | art/scenes-src/species/S07a-phone.png | grudgel, laneshi | done |
| S07 phone b | art/scenes-src/species/S07b-phone.png | ogresh, wulven | done |
| S08 PC | art/scenes-src/species/S08-pc.png | cursed-blood, demidritch, scourgeborne, wrothian | done |
| S08 phone a | art/scenes-src/species/S08a-phone.png | cursed-blood, demidritch | done |
| S08 phone b | art/scenes-src/species/S08b-phone.png | scourgeborne, wrothian | needs review: redo lacks cream paper edge fade |
| S09 PC | art/scenes-src/species/S09-pc.png | pluvenn, manyhorn, jeholrak, ankylier | done |
| S09 phone a | art/scenes-src/species/S09a-phone.png | pluvenn, manyhorn | done |
| S09 phone b | art/scenes-src/species/S09b-phone.png | jeholrak, ankylier | done |
| S10 PC | art/scenes-src/species/S10-pc.png | limukin, child-of-seth, avia-ra, skathari | done |
| S10 phone a | art/scenes-src/species/S10a-phone.png | limukin, child-of-seth | needs review: redo retains detailed forest in lower 55% |
| S10 phone b | art/scenes-src/species/S10b-phone.png | avia-ra, skathari | done |
| S11 PC | art/scenes-src/species/S11-pc.png | cervan, gallus, hedge, jerbeen | done |
| S11 phone a | art/scenes-src/species/S11a-phone.png | cervan, gallus | done |
| S11 phone b | art/scenes-src/species/S11b-phone.png | hedge, jerbeen | claimed by codex-scenes 2026-11-02T09:48:15+00:00 |
| S12 PC | art/scenes-src/species/S12-pc.png | luma, mapach, raptor, strig | open |
| S12 phone a | art/scenes-src/species/S12a-phone.png | luma, mapach | open |
| S12 phone b | art/scenes-src/species/S12b-phone.png | raptor, strig | open |
| S13 PC | art/scenes-src/species/S13-pc.png | vulpin, feathren | open |
| S13 phone a | art/scenes-src/species/S13a-phone.png | vulpin, feathren | open |

## PC template (2x2)

Fill PANEL 1 to 4 from the manifest subjects, in table order (top-left, top-right, bottom-left, bottom-right).
For S13 PC use two landscape panels stacked one above the other (top, bottom) with one horizontal 16 px cream gutter, total about 2400x2688.

```
Make ONE image: a 2x2 scene sheet, 2400x1344 total, four landscape panels separated by a plain 16 px light cream gutter (one vertical, one horizontal). No borders, frames, numbers or labels. Each panel is a separate, complete app background scene for a fantasy species. All four share one identical art style, line weight, palette logic and paper texture, matching the attached reference. Each panel must look clearly different in place, color key, camera and story.

Panel 1 (top-left): PANEL 1
Panel 2 (top-right): PANEL 2
Panel 3 (bottom-left): PANEL 3
Panel 4 (bottom-right): PANEL 4

Composition rule for every panel: the middle third of the panel width is low-detail and free of faces, people and objects (open sky, water, snow, field or plain ground). Characters and busy details sit on the left and right thirds, asymmetrically. Keep figures inside the middle 80% of panel height. All four outer edges of each panel fade softly into loose brush strokes on light cream paper.

STYLE BLOCK
```

## Phone template (1x2)

Fill PANEL A and PANEL B from the manifest, in table order (left, right). Attach the group's PC sheet.

```
Make ONE image: a 1x2 scene sheet, two portrait panels side by side, each about 9:16, separated by one plain 16 px light cream vertical gutter. No borders, frames, numbers or labels. Each panel is a complete phone app background, the portrait twin of the same species panel in the attached PC sheet: same place, same character, same palette, newly recomposed for portrait, not a crop. Both share one identical art style, line weight and paper texture. Each panel stays clearly different in place, color key and story.

Panel A (left): PANEL A
Panel B (right): PANEL B

Composition rule for every panel: all people, buildings and key details entirely in the top 45% of the panel, inside the middle 80% of the panel width. Bottom 55% is broad quiet ground (paving, water, sand, snow, grass or sky) with no faces, no people, no objects, slightly deeper color in the lowest 15%. All outer edges of each panel fade softly into loose brush strokes on light cream paper.

STYLE BLOCK
```

## STYLE BLOCK (paste unchanged into both templates)

```
Style: Loose, energetic hand-drawn digital sketch illustration with confident black ink lines with some visible rough construction strokes, slightly exaggerated cartoon proportions and very expressive faces, flat color fills with dry-brush and pencil texture, hard-edged cel shadows with thin red-brown accent strokes in the shading, like one finished frame of modern Western animation concept art. Not anime, not Studio Ghibli, not painterly realism.

Every person and every creature with a face is an adult. Bloody gore and despair in a bright vivid colorful world, never dark, gloomy, grey or orange-only. Vivid red blood, bodily wounds, grief and a world being destroyed must be clearly visible in every panel. Any warm moment stays small and to one side. No enemy unless named in the panel text.

WOW at first glance: striking, vivid color, clear silhouettes, confident gesture. The species must be instantly recognizable from its body, not from props. Varied adult ages, bodies and clothes, natural anatomy and hands. Avoid random ribbons, a generic glowing orb as the idea, mushy details, broken anatomy, extra fingers, warped perspective, copy-paste duplicates between panels, plastic skin.

Never include text, letters, numbers, writing-like runes, logos, watermarks, signatures, photorealism, 3D render look, lens flare, neon colors, UI overlays, or copies of existing film characters, official D&D art, Magic: The Gathering art, or any published book's illustrations.
```
