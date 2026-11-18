# Laporan clause gate (mode laporan, 2026-11-18)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9748 |
| Info (tag terdokumentasi) | 29104 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2682, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1569, FXO_NULL 1351, NUMONLY:ROLL 1224, NUMONLY:TABLE 1009, FORM:TABLE 979, ACTIVE:TRIGGER 937, ACTIVE:OTHERS 789, BY_DESIGN 670, REST:NONUM 607, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 203, NUMONLY:ZERO 194, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, SPELL:RIDER 13, SPELL:CANTRIP_DMG 13, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5397 |
| Uncovered dengan angka | 3436 |
| Uncovered dengan kelas kata kunci mekanik | 5005 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 392 |
| Angka yang tidak dijelaskan record mana pun | 3243 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4414 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 254 |
| Waktu | muat data 7 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 184 ditangkap (61.7%). Hapus semua atom kelas yang dibutuhkan: 198 ditangkap (66.4%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 277 ditangkap (92.3%), semua atom kelas dihapus: 297 ditangkap (99.0%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

Batas: kalimat tanpa angka dan tanpa kata kunci kelas dianggap inert (tidak dilaporkan). Kalimat seperti "treat the Shield as part of your armor" lolos. Atom yang menjelaskan angka mencocokkan nilai, bukan makna.

## Cara membaca, dan pemeriksaan manual (2026-11-05)

- Info `SPELL_TEXT`: teks spell hanya dibaca sheet lewat SPELL_FX, jadi spell tanpa record dihitung info, bukan uncovered. `FORM:*` adalah heuristik bentuk kalimat (aksi atau charges, lemparan save atau DC, tabel). Keduanya bisa menyembunyikan kalimat yang sebenarnya perlu record.
- `FXO_NULL`: item yang `FXO[nama]={fx:null}` (efek lama dibuang dengan sengaja, tercatat di SOURCE-NOTES).
- Pemeriksaan manual 60 kalimat uncovered acak (berstrata per jenis sumber, seed 20261108): sekitar 12 benar-benar celah record (20 persen), jadi sekitar 80 persen false positive. Kalimat berkelas kata kunci: 11 dari 41 benar (27 persen). Kalimat hanya angka: 1 dari 19 benar (5 persen), hampir semuanya flavor, tabel, atau efek aktif.
- Sumber false positive terbanyak: efek aktif tanpa kata aksi (rider damage, reroll), tabel kelas (slot, invocations), aturan istirahat tanpa angka, durasi dan jarak cerita, dan bonus kondisional yang memang tidak dihitung sheet.
- Pemeriksaan manual 58 kalimat tidak ditandai (covered atau info), seed sama: 2 yang mencurigakan (3 persen), yaitu angka yang hanya cocok longgar dengan atom lain (Agent of Order, Circle Forms). Pada putaran audit sebelumnya (sebelum POOL_RX dan aturan ACTS diperketat) 6 dari 60 lolos salah, terutama jumlah charges item yang tersembunyi di bawah FORM:ACTIVATE. Kalimat inert tidak diambil sampelnya.

## Sumber atom yang menutup kalimat covered

| Sumber | Kalimat covered |
|---|---|
| item | 3358 |
| GX | 2291 |
| wxs | 1073 |
| LU_X | 767 |
| species | 545 |
| ITEM_SPELLS | 461 |
| AUTO | 444 |
| feat | 419 |
| SPELL_FX | 241 |
| cls | 177 |
| LASTCH | 145 |
| SAVE_NOTES | 88 |
| SUB_GRANT | 70 |
| FXO | 50 |
| SPELLS | 37 |
| sub | 25 |
| FDMG | 13 |
| SP_AUTO | 12 |
| DEF_SUB | 8 |
| CLS_AUTO | 7 |
| RULE | 7 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 336, fx-L5.js 206, fx-L12.js 188, fx-L4.js 177, fx-L10.js 172, fx-L2.js 135, fx-L1.js 131, fx-N1.js 115, fx-L3.js 114, fx-L11.js 100, fx-L9.js 99, fx-Z2.js 71.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 867 | 11.7% |
| SPELL | 3255 | 734 | 22.5% |
| DMG | 4658 | 684 | 14.7% |
| SPEED | 1411 | 545 | 38.6% |
| PROF | 1124 | 405 | 36.0% |
| ADV | 1959 | 388 | 19.8% |
| RES | 1375 | 385 | 28.0% |
| CHOICE | 1663 | 383 | 23.0% |
| NUM | 8604 | 344 | 4.0% |
| IMM | 1004 | 318 | 31.7% |
| DC | 2903 | 284 | 9.8% |
| SLOT | 1425 | 280 | 19.6% |
| ATK | 1056 | 260 | 24.6% |
| DIS | 1221 | 239 | 19.6% |
| SENSE | 648 | 194 | 29.9% |
| AC | 677 | 162 | 23.9% |
| SAVE | 278 | 145 | 52.2% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1628 | 77 | 4.7% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 60 | 46.5% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 36 | 1.0% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 296 | 657 | 0 | 233 |
| feat | 2812 | 865 | 1425 | 0 | 522 |
| item | 19265 | 4771 | 11687 | 0 | 2807 |
| species | 1638 | 919 | 492 | 0 | 227 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2619 | 5891 | 0 | 1608 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2617 | 6338 | 1505 | 14.4% |
| tvss | 2788 | 719 | 1639 | 430 | 15.4% |
| core | 1495 | 435 | 765 | 295 | 19.7% |
| ttoh | 1470 | 352 | 870 | 248 | 16.9% |
| tsgs | 1479 | 405 | 831 | 243 | 16.4% |
| tvss14 | 1201 | 245 | 743 | 213 | 17.7% |
| tkdm | 921 | 241 | 492 | 188 | 20.4% |
| tsdm | 1063 | 297 | 592 | 174 | 16.4% |
| tghp | 1116 | 394 | 553 | 169 | 15.1% |
| tce | 730 | 151 | 453 | 126 | 17.3% |
| tua24 | 634 | 193 | 327 | 114 | 18.0% |
| tdm14 | 643 | 151 | 381 | 111 | 17.3% |
| au | 535 | 160 | 279 | 96 | 17.9% |
| tgh14p | 490 | 119 | 283 | 88 | 18.0% |
| dmg14 | 540 | 163 | 291 | 86 | 15.9% |
| phb14 | 513 | 174 | 258 | 81 | 15.8% |
| twow | 542 | 153 | 314 | 75 | 13.8% |
| thhw | 395 | 93 | 232 | 70 | 17.7% |
| tee24 | 463 | 189 | 216 | 58 | 12.5% |
| egw | 365 | 98 | 214 | 53 | 14.5% |
| coa | 158 | 46 | 60 | 52 | 32.9% |
| tssm | 275 | 76 | 148 | 51 | 18.5% |
| xge | 375 | 120 | 206 | 49 | 13.1% |
| tghg | 288 | 77 | 162 | 49 | 17.0% |
| misc14 | 326 | 68 | 213 | 45 | 13.8% |
| oota | 87 | 22 | 21 | 44 | 50.6% |
| hof | 249 | 66 | 141 | 42 | 16.9% |
| tdcsr | 299 | 111 | 148 | 40 | 13.4% |
| rhw | 231 | 79 | 113 | 39 | 16.9% |
| mot | 292 | 99 | 159 | 34 | 11.6% |
| tsgeh | 183 | 65 | 89 | 29 | 15.8% |
| bmt | 489 | 86 | 379 | 24 | 4.9% |
| bgg | 207 | 67 | 119 | 21 | 10.1% |
| EFotA | 137 | 70 | 46 | 21 | 15.3% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| ftd | 159 | 39 | 100 | 20 | 12.6% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| skt | 118 | 30 | 70 | 18 | 15.3% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| wdh | 95 | 28 | 52 | 15 | 15.8% |
| wdmm | 79 | 14 | 50 | 15 | 19.0% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| idrotf | 134 | 33 | 87 | 14 | 10.4% |
| psa | 67 | 28 | 26 | 13 | 19.4% |
| scag | 67 | 25 | 30 | 12 | 17.9% |
| dsotdq | 82 | 26 | 44 | 12 | 14.6% |
| ai | 164 | 25 | 127 | 12 | 7.3% |
| frafi | 81 | 23 | 46 | 12 | 14.8% |
| crcotn | 96 | 38 | 46 | 12 | 12.5% |
| pota | 110 | 26 | 73 | 11 | 10.0% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| pabtso | 69 | 26 | 32 | 11 | 15.9% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| abh | 53 | 24 | 19 | 10 | 18.9% |
| bgdia | 114 | 29 | 75 | 10 | 8.8% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| vgm | 64 | 33 | 22 | 9 | 14.1% |
| vrgr | 86 | 26 | 52 | 8 | 9.3% |
| tsdd | 69 | 27 | 34 | 8 | 11.6% |
| lfl | 33 | 22 | 3 | 8 | 24.2% |
| scc | 57 | 19 | 30 | 8 | 14.0% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| bdd | 62 | 31 | 24 | 7 | 11.3% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psk | 38 | 22 | 11 | 5 | 13.2% |
| sato | 38 | 12 | 21 | 5 | 13.2% |
| psx | 18 | 10 | 5 | 3 | 16.7% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
| nf | 25 | 11 | 12 | 2 | 8.0% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| eepc | 9 | 8 | 0 | 1 | 11.1% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| psd | 5 | 4 | 0 | 1 | 20.0% |
| tdcg | 9 | 4 | 4 | 1 | 11.1% |
| imr | 186 | 3 | 182 | 1 | 0.5% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 9230 | 278 | 8952 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 596 | 506 |
| SPELL | 521 | 88 |
| DMG | 509 | 455 |
| SPEED | 462 | 368 |
| ADV | 378 | 183 |
| PROF | 360 | 150 |
| NUM | 344 | 344 |
| RES | 317 | 138 |
| SLOT | 262 | 96 |
| CHOICE | 234 | 76 |
| IMM | 212 | 79 |
| DIS | 198 | 107 |
| SENSE | 168 | 142 |
| ATK | 162 | 125 |
| AC | 162 | 127 |
| SAVE | 139 | 120 |
| DC | 129 | 123 |
| HP | 112 | 85 |
| ABIL | 66 | 63 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (596 uncovered)

- `class|Monk|Superior Defense#1` At the start of your turn, you can spend 3 Focus Points to brace against harm. | number 3 no record explains
- `feat|Draconic Rune Casting|Draconic Rune Casting#5` You can have a number of empowered runes at once equal to 1 + your Proficiency Bonus, and use them to replicate spells as the book describes. | no record for RESOURCE; number 1,pb unexplained
- `feat|Tireless Reveler|Tireless Reveler#3` You can do this a number of times equal to your Proficiency Bonus, and regain all expended uses after a Short or Long Rest. | number pb no record explains
- `feat|Troll-Blooded|Troll-Blooded#2` You regain 1 hit point each minute while you have no more than one quarter of your hit points (rounded down). | no record for RESOURCE; number 1 unexplained
- `item|cm|Charm of the Water Bearer#3` You can do this up to three times per day for 10 days, then the charm vanishes. | number 10 no record explains
- `item|cos|Icon of Ravenloft#14` The target regains 3d8 + 3 hit points, unless it is an undead, a construct, or a fiend. | number 3d8,3 no record explains
- `item|dmg|Bigby's Beneficent Bracelet#16` The bracelet can create up to three copies and regains all expended uses at dawn. | number 3 no record explains
- `item|dmg|Blackrazor#5` Each time you hit an Undead with it, you take 1d10 Necrotic damage and the Undead regains 1d10 Hit Points. | number 1d10 no record explains
- `item|dmg|Cloak of the Boundless Spirit#5` An ally can gain the 1 Hit Point from a 19 only once per Long Rest. | number 1,19 no record explains
- `item|dmg|Doom Gauntlet#4` When you hit with it you can spend the charge to deal an extra 1d4 mega (1d4 x 100) Force damage. | no record for DMG; number 1d4,100 unexplained
- `item|dmg|Eldritch Staff#7` For each charge you expend, the target takes an extra 1d8 lightning damage. | no record for DMG; number 1d8 unexplained
- `item|dmg|Gauntlets of Rage#4` Each time you deal damage, you regain 2d8 hit points and may immediately remove a condition you currently suffer from or end this fury. | no record for DMG; number 2d8 unexplained
- `item|dmg|Greater Shipmending Spray#3` The ship regains 6d6 Mega Hit Points. | no record for RESOURCE; number 6d6 unexplained
- `item|dmg|Gulthias Staff#8` On a hit, it deals damage as a normal quarterstaff, and you can expend 1 charge to regain a number of hit points equal to the damage dealt by the weapon. | number 1 no record explains
- `item|dmg|Observatory Charm#1` After a Long Rest in your Observatory, you gain a magical Charm that lasts 7 days or until you use it. | number 7 no record explains
- `item|dmg|Ring of Shooting Stars#18` For each charge spent, the ring hurls a shining speck of light toward a point in your view no more than 60 feet away. | number 60 no record explains
- `item|dmg|Ruin's Wake (Exalted)#15` - When you reduce a creature to 0 hit points with an attack from the spear, you can regain hit points equal to the damage you dealt with the attack. | number 0 no record explains
- `item|dmg|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|misc14|Constantori's Portrait#23` When a creature the painting identifies as its enemy starts its turn in a space the painting can see, the painting expends 1 of its charges to cast magic missile (3 missiles), targeting that creature. | number 1 no record explains
- `item|oota|Wand of Viscid Globs#10` If you expend the wands last charge, roll a d20. | number 1d20 no record explains
- `item|tce|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | number 2 no record explains
- `item|tdcsr|Cabal's Ruin (Dormant)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG; number 1d6 unexplained
- `item|tgh14p|Crimson Mist#1` A tiny bottle of prey pheromones, enough for one use. | no record for RESOURCE; number 1 unexplained
- `item|tghg|Dämglesvir (Master)#8` When you take the Attack action, you can make one attack a sweeping strike against each creature of your choice in reach, a number of times equal to your Proficiency Bonus per Long Rest. | no record for CHOICE
- `item|tghg|Ulmyr's Eye (Master)#11` While holding it, cast Foresight from it with no Material component and a 1 hour duration, once per Long Rest. | number 1 no record explains
- `item|toa|Charm of the Ghoul#2` You regain 3d8 + 3 hit points. | number 3d8 no record explains
- `item|tsgs|Cloak of the Boundless Spirit#5` An ally can gain the 1 Hit Point from a 19 only once per Long Rest. | number 1,19 no record explains
- `item|tsgs|Potion of Dragon's Breath#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|tvss14|Bedroll of Rest#3` After sleeping in it you need no rest for 48 hours, though you can still take a Long Rest in that time. | no record for RESOURCE; number 48 unexplained
- `item|twow|Philosopher's Stone#4` Spend 1 hour (it can overlap a Short Rest) with resources of one kind (fish, gems, herbs, ore or stone, leather or hide, cloth) to turn them into another kind of equal value. | number 1 no record explains
- `item|wbtw|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | number 3 no record explains
- `item|wbtw|Eldritch Staff#7` For each charge you expend, the target takes an extra 1d8 lightning damage. | no record for DMG; number 1d8 unexplained
- `sub|Bard/College of Dirges|Death's Friend#2` Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. | no record for RESOURCE; number 60 unexplained
- `sub|Craftsman/Calibarons' Guild|Exotic Ammunition#1` After a Long Rest, you can make up to twice your Craftsman level in pieces of ammunition. | no record for RESOURCE; number double unexplained
- `sub|Fighter/Banneret|Group Recovery#1` When you use Second Wind to regain Hit Points, you can pick a number of allies within a 30-foot Emanation from you, up to your Charisma modifier (minimum of one). | number 30 no record explains
- `sub|Ranger/Big Game Hunter|Game Hunter#2` Until your next Long Rest, your Ranged Attack Rolls against creatures of that size deal an extra 1d8 Piercing damage. | no record for DMG; number 1d8 unexplained
- `sub|Sorcerer/Mirrorkin|Reflect Magic#1` When a creature casts a spell that calls for a saving throw and targets you or includes you in its area, spend sorcery points equal to the spell's level (1 for a cantrip). | no record for RESOURCE,SPELL; number 1 unexplained
- `sub|Sorcerer/Shadow Magic|Eyes of the Dark#3` You can cast it by spending 2 Sorcery Points or a slot. | no record for RESOURCE; number 2 unexplained
- `sub|Sorcerer/Toon Magic|Madcap Magic#2` After a Short or Long Rest, roll 1d6 on the 1st-level column of the Madcap Spells table and learn that spell until you roll again. | no record for RESOURCE; number 1d6 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Summoner's Blast#4` After each Long Rest, pick one Summoner Evocation spell of a level up to half your Summoner level (round up, maximum 5). | no record for CHOICE; number 5,half unexplained

### SPELL (521 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#4` You learn four renaissance spells you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | number double no record explains
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Helm of Telepathy#3` After you cast one of these two spells from the helm, that same spell can't be cast from the helm again until the next dawn. | number 2 no record explains
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 3 no record explains
- `sub|Barbarian/Path of the Rage Mage|Spellcasting#8` You know three 1st-level sorcerer spells, two of which are evocation or transmutation. | no record for SPELL; number 3,2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#5` 1 Can't speak or cast spells with Verbal components. | no record for SPELL; number 1 unexplained
- `sub|Cleric/Madness Domain|Channel Divinity: Temporary Insanity#3` Roll a d20: 1-5 Aphasia, it cannot speak, cast spells or understand others. | no record for SPELL; number 1d20,1,5 unexplained
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Temporal Trickster|Chrono-Master#1` You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. | no record for SPELL; number double,pb unexplained
- `sub|Rogue/Underfoot|Spellcasting#2` You learn shillelagh and two other druid cantrips, and another at level 10. | no record for SPELL; number 2 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### DMG (509 uncovered)

- `item|coa|Ranseur of Torture#6` When you hit a good aligned creature with it, that creature takes an extra 1d10 necrotic damage. | number 1d10 no record explains
- `item|coa|Scourge of Shadow#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 3d4 slashing damage instead of its regular damage. | number 3d4 no record explains
- `item|coa|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Burning Knuckles#2` Your unarmed strikes deal 2d6 Fire damage instead of their usual damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Helm of Brilliance#8` Each Undead that begins its turn there takes 1d6 Radiant damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | no record for DMG; number 1d4,2d4 unexplained
- `item|dmg|Psionic Piercing#22` Fail: 6d8 Psychic damage and Stunned for 1 minute. | no record for DMG; number 6d8,1 unexplained
- `item|dmg|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `item|dmg|Telescoping Bladelance#3` Retracted, it is a Greatsword that deals 1d10 Slashing damage instead of 2d6. | no record for DMG; number 1d10,2d6 unexplained
- `item|dmg|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Un's Codex#11` Fail: 4d6 Force damage and it is pushed to the nearest free space. | no record for DMG; number 4d6 unexplained
- `item|dmg|Wand of Orcus#12` Attack rolls and damage rolls you make with it gain a +3 bonus, and each hit deals an extra 2d12 Necrotic damage. | number 2d12 no record explains
- `item|egw|Stormgirdle (Exalted)#6` - Your Storm Avatar's lightning strike deals 5d6 lightning damage (instead of 3d6). | no record for DMG; number 5d6,3d6 unexplained
- `item|misc14|Dragontooth Dagger#6` Against enemies of the Cult of the Dragon, the dagger's bonus to attack and damage rolls increases to 2, and the extra acid damage increases to 2d6. | number 2d6,2 no record explains
- `item|thhw|Glowing Ember#6` If you move more than 20 ft from the hovering crystal, it follows you by the shortest path, avoiding obstacles if it can, until it is within 20 ft. If it is lit and cannot reach the creature it follows within 3 rounds, i | no record for DMG; number 8d6,20,3 unexplained
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Contractor Nail#2` When a d6 of its damage shows a 6, you can roll another d6 and add it. | no record for DMG; number 1d6,6 unexplained
- `item|tsgs|Tome of Dreams#4` On 10 or lower, you take 2d4 Psychic damage from terrors. | no record for DMG; number 2d4,10 unexplained
- `item|tsgs|Visage of Delight and Disaster#9` When it hits with a weapon or Unarmed Strike, it can spend the die to deal extra Psychic damage equal to twice the roll. | no record for DMG; number double unexplained
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Boggart|Fury of the Small#1` Once per turn, when you damage a creature larger than you with an attack roll or a spell, you deal extra damage equal to your Proficiency Bonus. | no record for DMG; number pb unexplained
- `species|Dragonborn Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Drow Heritage|Poison Bite#1` When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. | no record for DMG; number 1d6,3d6 unexplained
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Barbarian/Path of the Wrecker|Disarm Foe#3` The limb is a Martial Melee weapon dealing 1d8 Bludgeoning damage, with the Versatile property (1d10) and Sap mastery. | no record for DMG; number 1d8,1d10 unexplained
- `sub|Cleric/Apocalypse Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | no record for DMG; number 2d8 unexplained
- `sub|Cleric/Beer Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | no record for DMG; number 2d8 unexplained
- `sub|Cleric/Inquisition Domain|Rebuke Invoker#2` Fail: Force damage of 1d8 plus 1d8 per level of the slot it spent (cantrips count as level 1). | no record for DMG,SPELL; number 1d8 unexplained
- `sub|Cleric/Labyrinth Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Prophecy Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Druid/Circle of the Blighted|Defile Ground (10th Level)#1` The defiled area becomes a 20-ft radius and the extra damage 1d6. | no record for DMG; number 1d6,20 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#31` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Ranger/Winter Walker|Frozen Haunt#9` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Dragon Eidolon#23` The base damage becomes 3d6 at level 6 and 4d6 at level 14. | no record for DMG; number 3d6,1d6 unexplained
- `sub|Warlock/Star Patron|Nova#1` Once per turn when you hit with a ranged attack roll, you can take 5 Radiant damage to deal an extra 1d8 Radiant damage to the target. | no record for DMG; number 1d8,5 unexplained
- `sub|Warlock/Undead Patron|Superior Dread#6` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained

### SPEED (462 uncovered)

- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | no record for SPEED; number 0 unexplained
- `feat|Boon of Misty Escape|Boon of Misty Escape#5` When cast this way, you can target only yourself, your Fly Speed is 20 feet, you regain 10 Hit Points at the start of each of your turns for the spell's duration, and the spell's spellcasting ability is the ability this  | no record for SPEED
- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | no record for SPEED
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Apparatus of Kwalish#20` Down: the legs retract, its Speed and Swim Speed drop to 0, and it can't benefit from bonuses to speed. | no record for SPEED; number 0 unexplained
- `item|dmg|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|dmg|Bead of Force#11` A trapped creature can take a Utilize action to push on the wall and move the sphere up to half that creature's Speed. | no record for SPEED; number half unexplained
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Broom of Flying#3` Its Fly Speed is 50 feet. | no record for SPEED; number 50 unexplained
- `item|dmg|Carpet of Flying, 4 ft. × 6 ft.#3` A 4 ft. × 6 ft. carpet can carry up to 400 lb. at a fly speed of 60 feet. | no record for SPEED; number 4,6,60 unexplained
- `item|dmg|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|dmg|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|dmg|Marvelous Painted World#7` Time passes at half speed there and you need no food or drink. | no record for SPEED; number half unexplained
- `item|dmg|Potion of Climbing#1` Drinking this potion gives you a Climb Speed equal to your Speed for 1 hour. | no record for SPEED; number 1 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for SPEED
- `item|egw|Grovelthrash (Exalted)#14` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | number 5,half no record explains
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|tftyp|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | no record for SPEED; number double unexplained
- `item|tsgs|Couatl Herald's Fang#4` On a failure it is Incapacitated with Speed 0 until it takes damage or another creature uses an action to shake it out of the stupor. | no record for SPEED; number 0 unexplained
- `item|tsgs|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `item|tsgs|Shield of Yggdrasil#5` While planted, your Speed is 5 ft and cannot rise, and you reduce Bludgeoning, Piercing and Slashing damage from weapons and Unarmed Strikes by 3. | no record for SPEED; number 5,3 unexplained
- `item|twow|Aviana's Feather#2` Magic action: grow golden wings that give a Fly Speed of 80 feet. | no record for SPEED; number 80 unexplained
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Artificer/Reanimator|Macabre Modifications#9` The companion's Speed becomes 45 feet, and it gains a Climb Speed equal to its Speed. | no record for SPEED; number 45 unexplained
- `sub|Barbarian/Path of the World Tree|Branches of the Tree#4` Once the target has teleported, you can lower its Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Captain/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Druid/Circle of the Fist|Primal Infusion#3` While you have them, your walking Speed rises by 10 ft. | no record for SPEED; number 10 unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Jaeger/Sanguine Chapter|Blood Frenzy#1` While Bloodied, your Speed increases by 20 feet, the Attack action gives you three attacks, and all Hit Points you regain from Jaeger abilities are doubled. | no record for RESOURCE; number 3,double unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Sorcerer/Aberrant Sorcery|Revelation in Flesh#5` You gain a Swim Speed of twice your Speed, and you can breathe underwater. | number double no record explains
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Wizard/Enchanter|Hypnotic Presence#4` While Charmed this way, the target is Incapacitated and has a Speed of 0. | no record for SPEED; number 0 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | no record for SPEED; number 10 unexplained
- `sub|Wizard/Transmuter|Transmuter's Stone#10` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained

### ADV (378 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `item|au|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|au|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|bmt|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,SPEED; number 30,1 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `item|dmg|Deck of Many Things#22` If you are the one who drops that foe to 0 Hit Points in that fight, you gain Advantage on Death Saving Throws, which lasts 1 year. | no record for ADV; number 1,0 unexplained
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|dmg|Emperor's Garlic#7` Eat a raw clove as an action to gain Resistance to Poison damage and Advantage on saves against Poisoned for 1 hour, but Disadvantage on all Deception and Persuasion checks for that time. | no record for ADV,DIS,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tgh14p|Stalk Symbiote#3` While attuned you have Advantage on Wisdom (Perception) checks, and you and allies within 30 ft cannot be surprised unless incapacitated by something other than nonmagical sleep. | no record for ADV; number 30 unexplained
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|tghg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Forgemaster's Might#8` You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil. | no record for ADV; number 5 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `species|Elf/Shadow Fey Heritage|Supernatural Senses#2` Proficiency in Perception, and Advantage on Perception checks to notice or find a creature within 30 feet that lacks some of its hit points. | no record for ADV,PROF
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Cleric/Trickery Domain|Improved Duplicity#3` Attack rolls made by you and your allies against any creature within 5 feet of the illusion have Advantage. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Rogue/Smuggler|Dab-handed Dealer#4` Cunning Action can fund a check to control a vehicle, or a Sleight of Hand check to conceal a light weapon on you, opposed by Perception of creatures within 5 ft. On a success you have Advantage on your next attack again | no record for ADV; number 5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Warlock/Wyrdweaver|Favored Soul#2` On a failure it has Disadvantage on that roll and you have Advantage on one d20 roll of your choice in the next minute. | no record for ADV,CHOICE,DIS; number 1d20 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### PROF (360 uncovered)

- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | number 1d4 no record explains
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | number pb no record explains
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tvss14|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mechagnome|Specialized Design#1` Proficiency with two tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `sub|Fighter/Brawler|Brawling#1` You are proficient with improvised weapons and treat one-handed improvised weapons as Thrown (range 20/60). | no record for PROF; number 20,60 unexplained
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#6` The animal has Intelligence 10 and speaks one language you know. | no record for PROF; number 10 unexplained
- `sub|Sorcerer/Reincarnated Hero|Armored Sorcery#1` You gain proficiency with light armor, medium armor, shields and four martial weapons of your choice. | no record for CHOICE,PROF; number 4 unexplained
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF

### NUM (344 uncovered)

- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | number 20 no record explains
- `feat|Roguean|Roguean#7` You can endure temperatures from -100 to 300 degrees Fahrenheit. | number 100,300 no record explains
- `feat|Sentinel|Sentinel#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|coa|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|coa|Ranseur of Torture#9` - 1 minor beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#13` - 1 major detrimental property | number 1 no record explains
- `item|crcotn|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | number 2d4,2 no record explains
- `item|dmg|Accounting and Valuation of All Things#7` - 1 major detrimental property | number 1 no record explains
- `item|dmg|Amulet of the Inferno#8` - 2 major detrimental properties | number 2 no record explains
- `item|dmg|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Deck of Many Things#18` You can't lower a score that is 5 or less. | number 5 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power#24` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | number 0 no record explains
- `item|dmg|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|dmg|Luba's Tarokka of Souls#13` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Manual of Gainful Exercise#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Strength, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | number 2d4,2 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#11` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|wdmm|Horn of the Endless Maze#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Fighter/Hell Knight|Advanced Wounds#5` Devil's Luck: creatures that take the Acid damage have -1 AC until the end of your next turn. | number 1 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | number 2 no record explains

### RES (317 uncovered)

- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|twow|Twin Blades of Azzinoth#3` Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. | no record for IMM,RES
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Fighter/Rune Knight|Rune Carver#19` As a Bonus Action gain Resistance to Bludgeoning, Piercing, and Slashing damage for 1 minute. | number 1 no record explains
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monk/Way of the Humble Elephant|Thick Hide#1` As a bonus action, spend 5 Ki to gain Resistance to Bludgeoning, Piercing and Slashing damage for 10 minutes. | number 10,5 no record explains
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | number 10,50,300 no record explains
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | number 10 no record explains
- `sub|Paladin/Oath of the Elements|Aura of Resistance#2` You and friendly creatures within 10 ft have Resistance to that damage. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Sorcerer/Haunted|Become Death#3` While you have any, you have Resistance to all damage, a fly speed of 30 ft, and can move through creatures and objects if you end in an open space. | no record for RES,SPEED; number 30 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warlock/Primordial|Adaptive Shroud#2` If you also spend a spell slot, the Resistance lasts a number of rounds equal to your Proficiency Bonus. | no record for RES,SLOT; number pb unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | number 20 no record explains

### SLOT (262 uncovered)

- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | no record for DMG,SLOT,SPELL; number 1d4 unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 3 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### CHOICE (234 uncovered)

- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tgh14p|Rod of the Pack Master#2` While holding it, choose any number of willing creatures you see within 30 ft. You can hold it in your teeth, and it works in hybrid or kindred form. | no record for CHOICE; number 30 unexplained
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | no record for CHOICE; number double,pb unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Druid/Circle of the Obelisk|Evolutionary#3` One ability score of your choice on that creature rises by the roll, to a maximum of 20, for 1 minute. | no record for CHOICE; number 1 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Elemental Spirit|Twin Eidolons#7` Your magic sustains both for 10 minutes, then one of your choice dissipates. | no record for CHOICE
- `sub|Summoner/Bond of the Fiendish Chain|Dark Versatility#1` Your Eidolon gains two Evolutions of your choice that it qualifies for. | no record for CHOICE; number 2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (112)

- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Monk|Disciplined Survivor#2` In addition, whenever you fail a saving throw, you can spend 1 Focus Point to roll the save again. | angka: 1
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Captain|Cohort~3#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Jaeger|Hunter's Pursuit#1` At the start of your turn, you can spend 1 Adrenaline Point to move up to half your Speed without using any of your movement and without provoking Opportunity Attacks. | angka: 1,half
- `class|Demon Hunter|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | angka: double,pb
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Captain|Cohort~4#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | angka: 0
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | angka: half
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | angka: 2
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half

### feat (248)

- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | angka: 2
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Chief Engineer (2014)|Chief Engineer (2014)#10` When you repair the ship as a downtime activity, it regains mega hit points equal to three times your Proficiency Bonus + your Intelligence modifier for each day of repairs. | angka: 3,pb
- `feat|Skill Expert|Skill Expert#2` Pick one ability score and raise it by 1 (maximum 20). | angka: 20
- `feat|Draconic Rune Casting|Draconic Rune Casting#5` You can have a number of empowered runes at once equal to 1 + your Proficiency Bonus, and use them to replicate spells as the book describes. | angka: 1,pb
- `feat|Moderately Armored|Moderately Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Illithid Thrallmaker|Illithid Thrallmaker#5` You have Telepathy with a range of 10 feet, or +10 feet if you already have it. | angka: 10
- `feat|Cantrip Specialist|Cantrip Specialist#1` You learn two Warmage tricks from this list: Blasting Cantrip, Corrosive Cantrip, Draining Cantrip, Explosive Cantrip, Icy Cantrip, Severe Cantrip, Silent Cantrip, Static Cantrip. | angka: 2
- `feat|Iron Hero (2014)|Iron Hero (2014)#2` When a creature with a challenge rating above your level attacks you, you gain +2 AC. | angka: 2
- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Seraph Transformation: Level 4|Seraph Transformation: Level 4#10` When you roll a natural 1 on a save against a magical spell or ability, you take 1d6 Force damage per two class levels, ignoring resistance and immunity. | angka: 1d6,1,2
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | angka: 1
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | angka: 4,2
- `feat|Roguean|Roguean#7` You can endure temperatures from -100 to 300 degrees Fahrenheit. | angka: 100,300
- `feat|Pyromaniac|Pyromaniac#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | angka: 2
- `feat|Iron Hero|Iron Hero#1` When a creature with a Challenge Rating higher than your level attacks you, you have +2 AC. | angka: 2
- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#5` Your bite deals 2d8 damage. | angka: 2d8
- `feat|Boon of Fate|Boon of Fate#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Gun-Mage Adept|Gun-Mage Adept#1` You gain proficiency with four simple or martial firearms and can use them as spellcasting focuses. | angka: 4
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | angka: 30
- `feat|Arcane Prescience|Arcane Prescience#6` After identifying the spell, you can move up to 10 feet or half your speed, whichever is less. | angka: 10,half
- `feat|Mage Slayer|Mage Slayer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 20
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Battle Adept|Battle Adept#5` If a maneuver forces a save, the DC is 8 + your Proficiency Bonus + your Strength or Dexterity modifier. | angka: 8,pb
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | angka: 2
- `feat|Spell Resistant|Spell Resistant#7` You can do this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | angka: pb
- `feat|Boon of Truesight|Boon of Truesight#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30

### item (1843)

- `item|dmg|Manual of Stone Golems#5` To create a stone golem, you must spend 90 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | angka: 90,8
- `item|au|Thief's Thimble#4` If the thimble is reduced to 0 Hit Points, it breaks, and you take any remaining damage. | angka: 0
- `item|tsgs|Mammoth Boots#3` Forced movement (push, pull, or similar) is reduced by 5 ft. | angka: 5
- `item|dmg|Smash Potatoes#3` For that time, your Unarmed Strike with a hand can deal 1d4 instead of its normal damage. | angka: 1d4
- `item|dmg|Tumblesafe Heartglow Lantern#5` A creature touching it can use an action to infuse it, lowering that creature's hit point maximum by its Proficiency Bonus until it finishes a rest, and the lantern gains charges equal to that amount. | angka: pb
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | angka: 2
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a ho | angka: 3d8,5,15
- `item|dmg|Luma Feather Robe#3` While you wear it, your Intelligence or Charisma becomes 22 (choose when you first attune) and you gain a +1 bonus to saving throws. | angka: 22
- `item|dmg|Gauntlets of Rage#4` Each time you deal damage, you regain 2d8 hit points and may immediately remove a condition you currently suffer from or end this fury. | angka: 2d8
- `item|wbtw|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | angka: 1
- `item|misc14|Charm of Cozmioko's Glory#3` Light: regain 28 (8d6) Hit Points. | angka: 8d6,28
- `item|dmg|Figurine of Wondrous Power (ebony fly)#17` Hit Points 19 (3d10 + 3). | angka: 3d10,19,3
- `item|wdh|Blackstaff#11` On a 20, the staff regain 1d8 + 2 charges. | angka: 1d8
- `item|wbtw|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | angka: 3
- `item|tghg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | angka: 8d6
- `item|oota|Spell Gem (Ruby)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot | angka: 16
- `item|dmg|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | angka: 40
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | angka: double,pb
- `item|coa|Scourge of Shadow#17` If attacking a good aligned creature, or attacking with the weapon unattuned, the necrotic damage dice are also increased to a d6 instead of a d4. | angka: 1d6,1d4
- `item|ai|Orrery of the Wanderer#31` As long as the orrery is within 30 feet of you, you gain a +1 bonus to AC. | angka: 30
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | angka: 1,1
- `item|dmg|Hivemaster Pistol#3` Once per turn when you fire it automatically, you can fire 6 times with Disadvantage instead of twice. | angka: 6,double
- `item|dmg|Ring of Shooting Stars#18` For each charge spent, the ring hurls a shining speck of light toward a point in your view no more than 60 feet away. | angka: 60
- `item|dmg|Will of the Talon (Awakened)#14` - The saving throw DC for the war pick's Frightful Presence property increases to 15. | angka: 15
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | angka: 20
- `item|rhw|Ebonbane#13` When you hit a Celestial or a Humanoid with it, that attack also deals 3d6 Necrotic damage. | angka: 3d6
- `item|dmg|Wand of the War Mage, +1#2` Also, Half Cover doesn't apply against your spell attack rolls. | angka: half
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | angka: 10
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | angka: 15

### species (136)

- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Deep Imaskari|Aura of Unlight#4` Abjuring Unlight: you and allies in the aura gain a bonus to AC equal to half your Proficiency Bonus (round down). | angka: half,pb
- `species|Ravenfolk Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | angka: 2
- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Tiefling Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Dwarf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | angka: pb
- `species|Kobold Heritage|Devious Bite#1` When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage. | angka: 1d4
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | angka: double
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Amoeboid|Biomimicry#3` If the target has a Burrow, Climb or Swim Speed, you gain that Speed, up to 40 feet. | angka: 40
- `species|Minotaur (Amonkhet)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Vect (DM14)|Embedded Armor#3` Velocity Plating: speed +5 ft and long jump +5 ft. Composite Plating: AC 13 + your Dexterity modifier. | angka: 5,13
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | angka: 2
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | angka: half
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Courtfolk Halfling|Boon Companion#1` When you help an ally with a task or take the Help action in combat, the ally adds a d4 to the check or attack roll. | angka: 1d4
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | angka: 1
- `species|Halfling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Derro Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6

### sub (904)

- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | angka: 1,0
- `sub|Paladin/Oath of the Sun|Incandescent Strikes#1` The extra damage of your Radiant Strikes becomes 1d10 Radiant damage. | angka: 1d10
- `sub|Sorcerer/Toon Magic|Madcap Magic#2` After a Short or Long Rest, roll 1d6 on the 1st-level column of the Madcap Spells table and learn that spell until you roll again. | angka: 1d6
- `sub|Barbarian/Path of the Wrecker|Disarm Foe#3` The limb is a Martial Melee weapon dealing 1d8 Bludgeoning damage, with the Versatile property (1d10) and Sap mastery. | angka: 1d8,1d10
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | angka: 1
- `sub|Necromancer/Pharaoh|Mummy Lord [Lichdom]#12` A cursed target cannot regain Hit Points, its Hit Point maximum does not return to normal after a Long Rest, and the maximum drops by 3d6 every 24 hours. | angka: 3d6,24
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Necromancer/Toymaker|Miniature Minions#2` A Tiny thrall has a +3 bonus to AC. | angka: 3
- `sub|Fighter/Banneret|Group Recovery#1` When you use Second Wind to regain Hit Points, you can pick a number of allies within a 30-foot Emanation from you, up to your Charisma modifier (minimum of one). | angka: 30
- `sub|Cleric/Inquisition Domain (2014)|Witch Hunter's Strike#4` At level 14 the damage becomes 2d8, or 3d8 against a concentrating target. | angka: 2d8,3d8
- `sub|Bard/College of Dance|Inspiring Movement#2` You then move a distance of up to half your Speed. | angka: half
- `sub|Paladin/Oath of Vengeance (2014)|Relentless Avenger#1` When you hit a creature with an Opportunity Attack, you can move up to half your Speed right after, as part of the same Reaction. | angka: half
- `sub|Artificer/Artillerist|Eldritch Cannon#21` The cannon and each creature you choose within 10 feet of it gain Temporary Hit Points equal to 1d8 + your Int modifier (minimum +1). | angka: 1d8,10
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | angka: 10,half
- `sub|Sorcerer/Nanite Magic|Recycling Protocol#1` When you reduce an enemy to 0 HP, or someone else does within 10 ft of you, regain 2 Sorcery Points. | angka: 10,0
- `sub|Captain/Feylost|Fey Moods#4` Enemies within 5 feet of you have Disadvantage on attacks against anyone but you. | angka: 5
- `sub|Druid/Circle of Mutation|Endless Evolution#9` +1 to attack and damage rolls with the form's attacks. | angka: 1
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | angka: double
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | angka: 1
- `sub|Rogue/Infiltrator (2014)|Hacking Spike#2` When you hit a construct with a melee Sneak Attack, it makes a Wisdom save (DC 8 + Proficiency Bonus + Intelligence modifier) or is Stunned until the start of your next turn, even if normally immune. | angka: 8,pb
- `sub|Wizard/Geomancy|Channel Ley Line#2` After a Short or Long Rest within 1 mile of a weak ley line, you can bind yourself to it. | angka: 1
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | angka: 30
- `sub|Cleric/Grave Domain|Circle of Mortality#4` At Cleric level 11 the extra damage becomes 1d6. | angka: 1d6
- `sub|Paladin/Oath of the Sun|Oath of the Sun Spells#2` 5 Darkvision, Halo of Flame. | angka: 5
- `sub|Rogue/Dawn Blade|Sudden Illumination#2` The save DC is 8 + Dexterity modifier + Proficiency Bonus. | angka: 8,pb
- `sub|Cleric/Justice Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | angka: 2d8
- `sub|Wizard/Enchanter|Hypnotic Presence#4` While Charmed this way, the target is Incapacitated and has a Speed of 0. | angka: 0
- `sub|Wizard/Abjurer|Arcane Ward#3` The ward lasts until you finish a Long Rest, and its Hit Point maximum equals twice your Wizard level plus your Intelligence modifier. | angka: double
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | angka: 2
- `sub|Sorcerer/Apocalypse Sorcery|Forbidden Magic#4` Right after casting you take Force damage equal to four times the slot level, ignoring Resistance and Immunity. | angka: 4

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `feat|Light Bringer|Light Bringer#12` You can do this once and regain the use after a Short or Long Rest. -> info:REST:NONUM
- class `feat|Light Bringer|Light Bringer#12` You can do this once and regain the use after a Short or Long Rest. -> info:REST:NONUM
- record `item|dmg|Ring of Water Elemental Command#1` While wearing this ring, you have advantage on attack rolls against elementals from the Elemental Plane of Water and the -> info:ACTIVE:OTHERS
- class `item|dmg|Ring of Water Elemental Command#1` While wearing this ring, you have advantage on attack rolls against elementals from the Elemental Plane of Water and the -> info:ACTIVE:OTHERS
- record `sub|Warlock/Vestige Patron|Vestige Recovery#3` After you use this, you must finish a Long Rest before using it again. -> covered
- class `sub|Warlock/Vestige Patron|Vestige Recovery#3` After you use this, you must finish a Long Rest before using it again. -> info:REST:NONUM
- record `sub|Warmage/House of Cards|Dealer's Choice#2` Once you use this, you cannot use it again until you finish a Short or Long Rest. -> covered
- class `sub|Warmage/House of Cards|Dealer's Choice#2` Once you use this, you cannot use it again until you finish a Short or Long Rest. -> info:REST:NONUM
- record `sub|Martyr/Burden of Ascension|Demigod Ascendant#6` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- class `sub|Martyr/Burden of Ascension|Demigod Ascendant#6` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `item|dmg|Holy Symbol of Ravenkind#19` The light is sunlight and lasts for 10 minutes or until you end the effect (no action required). -> info:NUMONLY:GEOMETRY
- class `item|dmg|Holy Symbol of Ravenkind#19` The light is sunlight and lasts for 10 minutes or until you end the effect (no action required). -> info:NUMONLY:GEOMETRY
- record `sub|Warlock/The Future You|Grandfather Paradox#4` Long Rest to use again. -> covered
- class `sub|Warlock/The Future You|Grandfather Paradox#4` Long Rest to use again. -> info:REST:NONUM
- record `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#3` From Stage 1 on, only Wish level magic can cure it. -> info:NUMONLY:TEXT
- class `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#3` From Stage 1 on, only Wish level magic can cure it. -> info:NUMONLY:TEXT
- record `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell lev -> covered
- record `item|dmg|Fragment of Melancholy#2` Once you do this, you can't do it again until you finish a long rest. -> info:REST:NONUM
- class `item|dmg|Fragment of Melancholy#2` Once you do this, you can't do it again until you finish a long rest. -> info:REST:NONUM
- record `item|au|Arcane Chatelaine#4` When all six keys have disappeared, the chatelaine disappears. -> info:NUMONLY:TEXT
- class `item|au|Arcane Chatelaine#4` When all six keys have disappeared, the chatelaine disappears. -> info:NUMONLY:TEXT
- record `item|dmg|Prehistoric Figurine of Wondrous Power, Pyrite Plesiosaurus#14` Once it has been used, it can't be used again until 4 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Prehistoric Figurine of Wondrous Power, Pyrite Plesiosaurus#14` Once it has been used, it can't be used again until 4 days have passed. -> info:NUMONLY:GEOMETRY
- record `species|Tiefling (Mephistopheles)|Legacy of Cania#2` At level 3 you can cast Burning Hands as a level 2 spell and at level 5 Flame Blade, each once per Long Rest. -> info:REST:NONUM
- class `species|Tiefling (Mephistopheles)|Legacy of Cania#2` At level 3 you can cast Burning Hands as a level 2 spell and at level 5 Flame Blade, each once per Long Rest. -> info:REST:NONUM
- record `sub|Paladin/Oath of Pestilence|Oath of Pestilence Spells#5` 17 Contagion, Insect Plague. -> info:NUMONLY:TABLE
- class `sub|Paladin/Oath of Pestilence|Oath of Pestilence Spells#5` 17 Contagion, Insect Plague. -> info:NUMONLY:TABLE
- record `class|Wizard|Spellcasting#14` For these six, the suggested picks are Mage Armor, Magic Missile, Sleep, Thunderwave, Detect Magic, and Feather Fall. -> info:NUMONLY:TEXT
- class `class|Wizard|Spellcasting#14` For these six, the suggested picks are Mage Armor, Magic Missile, Sleep, Thunderwave, Detect Magic, and Feather Fall. -> info:NUMONLY:TEXT
- record `sub|Rogue/Mastermind|Master of Intrigue#3` You can mimic the speech patterns and accent of a creature after hearing it for 1 minute, if you know its language. -> info:NUMONLY:GEOMETRY
