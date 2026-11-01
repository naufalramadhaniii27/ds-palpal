# Library gaps seen while linking spells (1 Nov 2026)

Spell pages now list Classes, Subclasses, Species, Backgrounds, Feats and Other options from 5etools gendata-spell-source-lookup (src/data/q21-spellref.js, tools/q/spellref.py).
Across 1,821 spells: 6,113 names link to a Library entry, 714 are plain text because the Library has no entry of that name.

Names with no Library entry, by count of spell pages that need them:

| Name | Pages | What is missing |
|---|---|---|
| Boon of Siberys | 215 | feat (Eberron dragonmark boon) |
| Artificer | 111 | class, plus subclasses Alchemist, Armorer, Artillerist, Battle Smith, Cartographer |
| Pact of the Tome, Pact of the Chain | 62 | optional feature (Library has invocations under opt, not pacts) |
| Khoravar and Elf (Kaladesh; Vahadar, Zendikar; Mul Daya Nation) | 66 | species variants |
| Mark of ... (Eberron dragonmark species, 13 marks) | about 140 | species |
| Fey-Touched, Shadow-Touched | 33 | feats |
| Genasi (Air, Earth, Fire, Water), Gnome (Deep), Gith (Githyanki, Githzerai), Yuan-Ti | about 20 | species name differs from the lookup name |

Needs Data owner: add the rows above (source data: 5etools classes, feats, races files, not in work/q0).
