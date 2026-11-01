# Library audit: 5etools against the app (2026-11-01)

Requirement from the owner: everything that exists on 5etools, the wikis and other D&D resources must be in the Library, as complete and tidy as possible, and searchable.
Decision on text (2026-11-01): the owner chose to copy full text. Claude does not copy book prose in bulk. Facts (names, numbers, tables, lists, stat blocks, sources) are filled completely. Descriptive prose is written again in short own wording. This note stays until the owner and Claude settle it.

Source of the counts: 5etools-src, folder data (shallow clone, 2026-11-01). App counts: `__libIndex()` on the Yudhi sheet (Library after the change that reads every book).

| Category | 5etools | Visible in Library | Gap | Note |
|---|---|---|---|---|
| Spells | 969 | 392 | 577 | `SPELL_FULL` already holds 1,821 records, the Library lists only the 2024 list |
| Magic items and gear | 2,512 + 230 base + 230 variants + 119 groups | 447 + 356 | about 2,000 | variants and groups are not listed |
| Feats | 305 | 79 | 226 | |
| Species | 160 + 98 subraces | 10 | 248 | |
| Backgrounds | 175 | 16 | 159 | |
| Classes and subclasses | 30 + 330 | 12 + 48 | 18 + 282 | |
| Class and subclass features | 677 + 1,499 | 432 | about 1,700 | |
| Optional features | 221 | 58 | 163 | invocations, maneuvers, metamagic and more |
| Monsters | 4,574 | 4,567 | 7 | trait and action text still empty |
| Rules (variant rules) | 231 | 338 | 0 | the count also includes the glossary |
| Actions | 48 | 0 | 48 | not a category yet |
| Senses and skills | 8 + 36 | 0 | 44 | not a category yet |
| Conditions, diseases, statuses | 30 + 29 + 5 | 29 | 35 | conditions are in the rules glossary, not separate |
| Deities | 563 | 418 | 145 | |
| Languages | 201 | 112 | 89 | |
| Life events and trinkets | 100 | 0 | 100 | |
| Rewards (boons, charms) | 278 | in Items | check | |
| Bastion facilities | 70 | 47 | 23 | |
| Objects, vehicles, hazards, tables, decks | 37, 39, 110, 13 (more in book files), 35 | 30, 69, 93, 75, 27 | small | |
| Cults and boons | 42 | 40 | 2 | |
| Recipes, character options, psionics | 316, 44, 52 | 316, 44, 52 | 0 | |
| Books and adventures | 67 + 102 files, 72 MB of text | 0 | all | prose, not copied. Index of chapters and names only |
| Wikis (lore, places, people) | not in 5etools | 0 | all | needs a source list and licence check first |

## Order of work
1. Show what the app already holds: all 1,821 spell records, every item variant, every species, background, feat and subclass in the data blocks. No new data needed.
2. New categories from structured data: actions, senses, skills, conditions, life, item groups, magic variants, base items.
3. Missing rows: spells, items, feats, species, backgrounds, class features and optional features from all books, as facts plus short own wording.
4. Search: one box over every category, filter by category and by book, group by book, results with the book tag.
5. Books and adventures: chapter and entity index (names, places, people) with the book and page, no prose.
6. Wikis: choose sources (for example the Forgotten Realms wiki, CC BY-SA, with credit), then lore index.
7. Monster traits and actions: own wording, in batches of about 300.

Each step ends with `tests/q_lib.py` and the three scenarios at 390x844 and 1250x850.

## Progress (2026-11-01, same day)
| Step | Result |
|---|---|
| Library reads every book as reference | monsters 520 to 4,567 |
| Spells of all books | 392 to 1,821 |
| Items, gear, species, backgrounds of all books | items 447 to 2,657, gear 356 to 802, species 10 to 247, backgrounds 16 to 231 |
| Feats of all books | 79 to 553 (copy kept in `WXF_ALL` before the builder drops them) |
| Rules missing from the Library | 11 added in own wording (`tools/q/rule_gaps.py`). Conditions, actions and skills were already there under rules and statuses |
| Entries in the Library | 8,228 to 13,700. `tests/q_fluff.py` opens every entry: 0 bad |
| Subclasses of all books and their features | subclasses 48 to 571, features 1,340 to 4,169, entries in the Library 13,700 to 17,510. `tests/q_fluff.py`: 0 bad |
| Still open | class features of base classes, optional features, item variants and groups, life tables, deities, languages, books and adventures index, wikis, monster trait text |

## Pembaruan 1 November 2026 (sesi lanjutan)

Koreksi audit: deity, bahasa, aksi, skill, dan kondisi sudah ada di Library. Itu bukan celah.

| Kategori | Hasil | Berkas |
|---|---|---|
| Fitur opsional | 107 entri | src/data/q14-optfeat.js |
| Buku dan petualangan | 169 baris (judul dan nama bab) | src/data/q15-books.js |
| Item (varian magis, grup, item dasar, item lain) | 348 baris | src/data/q16-items-gap.js |
| Fitur kelas dan subkelas | 350 entri | src/data/q17-class-gap.js |
| Tabel Life (trinket, alasan kelas, alasan latar) | 26 tabel | src/data/q18-life.js |
| Aturan yang kurang | 11 baris | src/data/q13-rule-gaps.js |
| Teks sifat dan aksi monster, Monster Manual 2024 dan 2014 | 3.170 blok unik | tools/q/overlay/monster_txt.json |

Semua teks ditulis ulang dengan kata sendiri. Gerbang kemiripan: 93 blok monster ditolak karena terlalu dekat dengan sumber, jadi tetap tampil sebagai baris serangan atau nama saja.

Belum dikerjakan:
- Teks sifat dan aksi monster dari Monster Manual 2014 (1.563 blok unik) dan buku lain (sekitar 11.000 blok unik).
- Konten wiki (Forgotten Realms wiki berlisensi CC BY-SA, perlu kredit dan cek lisensi).
- 93 blok monster yang ditolak gerbang.
