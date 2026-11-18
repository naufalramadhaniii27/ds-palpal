# Laporan clause gate (mode laporan, 2026-11-19)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 10226 |
| Info (tag terdokumentasi) | 29177 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2679, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1569, FXO_NULL 1351, NUMONLY:ROLL 1217, NUMONLY:TABLE 1009, FORM:TABLE 979, ACTIVE:TRIGGER 924, ACTIVE:OTHERS 781, BY_DESIGN 670, REST:NONUM 606, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 245, NUMONLY:ZERO 193, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ITEM:ARTIFACT_PROPS 62, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, SPELL:RIDER 15, SPELL:CANTRIP_DMG 13, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 4846 |
| Uncovered dengan angka | 3155 |
| Uncovered dengan kelas kata kunci mekanik | 4531 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 315 |
| Angka yang tidak dijelaskan record mana pun | 3018 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 3953 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 247 |
| Waktu | muat data 8 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 297 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 199 ditangkap (67.0%). Hapus semua atom kelas yang dibutuhkan: 205 ditangkap (69.0%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 275 ditangkap (91.7%), semua atom kelas dihapus: 298 ditangkap (99.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3435 |
| GX | 2470 |
| wxs | 1073 |
| LU_X | 769 |
| species | 555 |
| ITEM_SPELLS | 498 |
| AUTO | 443 |
| feat | 440 |
| SPELL_FX | 241 |
| ITEM_PICK | 185 |
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

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 365, fx-L5.js 206, fx-L12.js 192, fx-L10.js 191, fx-L4.js 177, fx-L3.js 144, fx-L1.js 137, fx-L2.js 135, fx-N1.js 116, fx-L11.js 101, fx-L9.js 101, fx-B36-subfree2.js 75.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 850 | 11.5% |
| DMG | 4658 | 649 | 13.9% |
| SPEED | 1411 | 528 | 37.4% |
| SPELL | 3255 | 499 | 15.3% |
| PROF | 1124 | 404 | 35.9% |
| ADV | 1959 | 383 | 19.6% |
| RES | 1375 | 365 | 26.5% |
| IMM | 1004 | 318 | 31.7% |
| CHOICE | 1663 | 311 | 18.7% |
| SLOT | 1425 | 273 | 19.2% |
| NUM | 8604 | 267 | 3.1% |
| DIS | 1221 | 227 | 18.6% |
| DC | 2903 | 221 | 7.6% |
| SENSE | 648 | 194 | 29.9% |
| ATK | 1056 | 165 | 15.6% |
| AC | 677 | 162 | 23.9% |
| HP | 206 | 112 | 54.4% |
| SAVE | 278 | 86 | 30.9% |
| NUM-DICE | 1628 | 77 | 4.7% |
| INIT | 129 | 55 | 42.6% |
| ABIL | 383 | 45 | 11.7% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 36 | 1.0% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 296 | 657 | 0 | 233 |
| feat | 2812 | 910 | 1464 | 0 | 438 |
| item | 19265 | 5125 | 11728 | 0 | 2412 |
| species | 1638 | 953 | 492 | 0 | 193 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2664 | 5884 | 0 | 1570 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2803 | 6358 | 1299 | 12.4% |
| tvss | 2788 | 727 | 1639 | 422 | 15.1% |
| core | 1495 | 436 | 792 | 267 | 17.9% |
| tsgs | 1479 | 406 | 831 | 242 | 16.4% |
| ttoh | 1470 | 378 | 870 | 222 | 15.1% |
| tvss14 | 1201 | 256 | 740 | 205 | 17.1% |
| tkdm | 921 | 259 | 488 | 174 | 18.9% |
| tsdm | 1063 | 303 | 592 | 168 | 15.8% |
| tghp | 1116 | 395 | 553 | 168 | 15.1% |
| tdm14 | 643 | 153 | 382 | 108 | 16.8% |
| au | 535 | 165 | 279 | 91 | 17.0% |
| tgh14p | 490 | 121 | 282 | 87 | 17.8% |
| phb14 | 513 | 176 | 258 | 79 | 15.4% |
| tua24 | 634 | 225 | 330 | 79 | 12.5% |
| twow | 542 | 153 | 314 | 75 | 13.8% |
| tce | 730 | 202 | 454 | 74 | 10.1% |
| thhw | 395 | 95 | 232 | 68 | 17.2% |
| dmg14 | 540 | 188 | 289 | 63 | 11.7% |
| tee24 | 463 | 189 | 216 | 58 | 12.5% |
| xge | 375 | 120 | 206 | 49 | 13.1% |
| egw | 365 | 102 | 214 | 49 | 13.4% |
| tghg | 288 | 77 | 162 | 49 | 17.0% |
| tssm | 275 | 79 | 148 | 48 | 17.5% |
| hof | 249 | 66 | 141 | 42 | 16.9% |
| coa | 158 | 46 | 72 | 40 | 25.3% |
| rhw | 231 | 79 | 113 | 39 | 16.9% |
| tdcsr | 299 | 112 | 148 | 39 | 13.0% |
| misc14 | 326 | 68 | 222 | 36 | 11.0% |
| tsgeh | 183 | 65 | 89 | 29 | 15.8% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| bgg | 207 | 67 | 121 | 19 | 9.2% |
| mot | 292 | 114 | 159 | 19 | 6.5% |
| ftd | 159 | 41 | 100 | 18 | 11.3% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| skt | 118 | 30 | 70 | 18 | 15.3% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 22 | 25 | 16 | 25.4% |
| bmt | 489 | 94 | 379 | 16 | 3.3% |
| wdh | 95 | 28 | 52 | 15 | 15.8% |
| wdmm | 79 | 14 | 50 | 15 | 19.0% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| idrotf | 134 | 33 | 87 | 14 | 10.4% |
| dsotdq | 82 | 26 | 44 | 12 | 14.6% |
| crcotn | 96 | 38 | 46 | 12 | 12.5% |
| scag | 67 | 26 | 30 | 11 | 16.4% |
| psa | 67 | 32 | 24 | 11 | 16.4% |
| ai | 164 | 25 | 128 | 11 | 6.7% |
| pota | 110 | 26 | 73 | 11 | 10.0% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| pabtso | 69 | 26 | 32 | 11 | 15.9% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| abh | 53 | 24 | 19 | 10 | 18.9% |
| frafi | 81 | 25 | 46 | 10 | 12.3% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| vgm | 64 | 33 | 22 | 9 | 14.1% |
| EFotA | 137 | 70 | 58 | 9 | 6.6% |
| vrgr | 86 | 26 | 52 | 8 | 9.3% |
| tsdd | 69 | 27 | 34 | 8 | 11.6% |
| lfl | 33 | 22 | 3 | 8 | 24.2% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| bgdia | 114 | 29 | 77 | 8 | 7.0% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| bdd | 62 | 31 | 24 | 7 | 11.3% |
| sato | 38 | 12 | 21 | 5 | 13.2% |
| tftyp | 71 | 27 | 39 | 5 | 7.0% |
| psk | 38 | 23 | 11 | 4 | 10.5% |
| scc | 57 | 29 | 25 | 3 | 5.3% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
| oota | 87 | 63 | 21 | 3 | 3.4% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
| nf | 25 | 11 | 12 | 2 | 8.0% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| eepc | 9 | 8 | 0 | 1 | 11.1% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| psd | 5 | 4 | 0 | 1 | 20.0% |
| psx | 18 | 12 | 5 | 1 | 5.6% |
| tdcg | 9 | 4 | 4 | 1 | 11.1% |
| imr | 186 | 3 | 182 | 1 | 0.5% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| psz | 38 | 36 | 2 | 0 | 0.0% |
| spells | 9230 | 278 | 8952 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 579 | 506 |
| DMG | 480 | 426 |
| SPEED | 445 | 354 |
| ADV | 373 | 183 |
| PROF | 359 | 150 |
| SPELL | 329 | 82 |
| RES | 297 | 138 |
| NUM | 267 | 267 |
| SLOT | 255 | 96 |
| IMM | 212 | 79 |
| CHOICE | 203 | 76 |
| DIS | 186 | 95 |
| SENSE | 168 | 142 |
| AC | 162 | 127 |
| ATK | 130 | 93 |
| HP | 112 | 85 |
| DC | 106 | 100 |
| SAVE | 80 | 61 |
| ABIL | 37 | 34 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (579 uncovered)

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

### DMG (480 uncovered)

- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | no record for DMG; number 2d8 unexplained
- `class|Investigator|Finisher#2` The extra damage is 1d8 at level 2, 2d8 at level 11, and 3d8 at level 17. | no record for DMG; number 1d8 unexplained
- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | no record for DMG; number 1d6 unexplained
- `item|bmt|Ruinous Flail#5` The poisoned creature takes 2d4 necrotic damage at the start of each of its turns. | no record for DMG; number 2d4 unexplained
- `item|coa|Ruby Rod of Asmodeus#6` If a creature uses the special abilities of the rod without Asmodeus's permission, they take 2d12 necrotic damage each use, doubled if they're good aligned. | no record for DMG; number 2d12,double unexplained
- `item|dmg|Battlechef's Splendid Saucepan#2` It works as a Mace with +1 to attack and damage rolls and deals an extra 1d4 Thunder to a target in metal armor or made of metal or stone. | number 1 no record explains
- `item|dmg|Charm of Cozmioko's Glory#4` Revenge: a melee weapon you hold is empowered for 1 minute or until you let go of it, and once per turn when it hits a Dragon, that Dragon takes an extra 3d6 damage of the weapon's type. | no record for DMG; number 3d6 unexplained
- `item|dmg|Cloak of Spines#4` The attack's damage is reduced by 2d4 and the attacker takes 2d4 magical Piercing damage. | no record for DMG; number 2d4 unexplained
- `item|dmg|Concussion Grenade#5` On a fail it takes 6d6 Thunder damage and is Deafened for 1 minute. | no record for DMG; number 6d6,1 unexplained
- `item|dmg|Grieving Tree#10` All Stunned creatures take 8d6 Piercing damage and half the total goes to the pool. | no record for DMG; number 8d6,half unexplained
- `item|dmg|Hazirawn#5` While you are attuned to this weapon, its bonus on attack and damage rolls increases to +2, and a hit deals an extra 2d6 necrotic damage (instead of 1d6). | number 2d6,1d6 no record explains
- `item|dmg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | no record for DMG; number 8d6 unexplained
- `item|dmg|Helm of Brilliance#12` Any target you hit with an attack using the burning weapon takes 1d6 extra Fire damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Justiciar's Gavel#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Ouroboros Rapier#2` Each 8 on a damage die adds 1d8 Poison damage. | no record for DMG; number 1d8,8 unexplained
- `item|dmg|Splitter#4` You gain +3 to attack and damage rolls with the Halberd, or +1 with each part when split. | number 1 no record explains
- `item|dmg|Sulfuras, Hand of Ragnaros#8` Boiling Point: water in a container or body within 1 mile boils for 1 minute, and a creature that enters or starts its turn there takes 2d10 Fire damage. | no record for DMG; number 2d10,1,1 unexplained
- `item|dmg|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Tinderstrike#2` Its handle is always warm to the touch, and the blade smolders for 1d4 minutes after it is used to deal damage. | no record for DMG; number 1d4 unexplained
- `item|dmg|Wand of Wonder#18` You take 1d6 Psychic damage instead. | no record for DMG; number 1d6 unexplained
- `item|misc14|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|tdm14|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | number 2d6,80,320 no record explains
- `item|tghg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | no record for DMG; number 1,2 unexplained
- `item|tsdm|Spiked Skin#4` The damage becomes 2d4 at level 5, 3d4 at level 11 and 4d4 at level 17. | no record for DMG; number 2d4,1d4 unexplained
- `item|tsgs|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | no record for DMG; number 2 unexplained
- `item|tsgs|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | no record for DMG; number 3d8 unexplained
- `item|tsgs|Peppermince Sugarbomb#3` For 1 minute, your weapon and Unarmed Strike hits that deal Piercing or Slashing damage deal 2 extra damage. | no record for DMG; number 1,2 unexplained
- `item|tsgs|Starmetal Solar Axe#3` +1 to attack and damage, an extra 2d6 Fire damage, and flames shed Bright Light in a 20 ft radius and Dim Light for 20 ft more, as sunlight. | number 20 no record explains
- `item|tsgs|Tectonic Gauntlets#2` Your fist Unarmed Strikes deal 1d8 Bludgeoning damage (unless already higher) and double damage to objects and structures. | number double no record explains
- `item|tsgs|Vancian Helm#7` A level 5+ spell cast into it while worn is lost, the slot is spent, and you take 2d6 Psychic damage. | no record for DMG; number 2d6 unexplained
- `item|tvss14|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | no record for DMG; number 1d6 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Barbarian/Path of the Zealot|Divine Fury#2` During your Rage, on each of your turns, the first creature that a weapon or Unarmed Strike of yours hits takes extra damage equal to 1d6 + half your Barbarian level (rounded down). | number half no record explains
- `sub|Captain/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | no record for DMG; number 1d6 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#31` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | no record for DMG; number 2d8 unexplained
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | no record for DMG; number 2d8 unexplained

### SPEED (445 uncovered)

- `class|Dancer|Fast Movement#1` Your Speed rises by 10 feet while you do not wear Heavy armor. | no record for SPEED; number 10 unexplained
- `class|Demon Hunter|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | no record for SPEED; number 10 unexplained
- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | no record for SPEED; number 1,4 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
- `item|dmg|Grovelthrash (Exalted)#14` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | number 5,half no record explains
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for SPEED; number 2d4,2,half unexplained
- `item|dmg|Winged Boots#2` While you wear them, you can spend 1 charge as a Magic action to gain a Fly Speed of 30 feet for 1 hour. | number 1,1 no record explains
- `item|frafi|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|pota|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|tgh14p|Ardor#4` As a bonus action you can let it hover in an open space within 5 ft. While you see it, a bonus action commands it to fly 50 ft and either attack once or return to your hands. | no record for SPEED; number 5,50 unexplained
- `item|tsgs|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|tsgs|Couatl Herald's Fang#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `item|twow|Doomhammer#6` While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). | no record for SPEED; number double unexplained
- `species|Arisen|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Dhampir (Grim Hollow)|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | number 10 no record explains
- `species|Wrothian (DM14)|Neural Lock#2` On a failure it is Incapacitated and its speed is 0 until the start of your next turn. | no record for SPEED; number 0 unexplained
- `sub|Captain/Dragon Banner|Rampage [Maneuver]#1` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack roll, expend one Battle Die to move up to your Speed and make a melee attack (no action required). | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Captain/Gourmand|Monster Meal#14` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained
- `sub|Captain/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Druid/Circle of Mutation|Mutate Shape#7` 1 more point makes the Swim Speed double your Speed. | no record for SPEED; number 1,double unexplained
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | no record for SPEED; number 10,half unexplained
- `sub|Druid/Circle of the Titan|Titan Form#10` Rampager (level 10): Bonus Action, spend a level 1+ slot, move up to half Speed without Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Monk/Way of the Four Fists|Grasp of The Monkey#2` You have a climbing speed equal to your walking speed and double your jump distance. | number double no record explains
- `sub|Monster Hunter/Trapper Guild|Agile Response#2` Whether the attack hits or misses, you then move up to half your Speed without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Necromancer/Black Rider|Gruesome Charge#2` Each of those thralls has a Speed of 60 feet for 10 minutes. | no record for SPEED; number 60 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Relentless Avenger#1` When you hit a creature with an Opportunity Attack, you can move up to half your Speed right after, as part of the same Reaction. | no record for SPEED; number half unexplained
- `sub|Sorcerer/Aberrant Mind|Revelation in Flesh#8` A Swim Speed of twice your Speed and underwater breathing. | no record for SPEED; number double unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Witch/Sky Magic|Corvid Familiar#3` It has a Fly Speed of 50 feet, unless it already has a faster one. | no record for SPEED; number 50 unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained
- `sub|Wizard/Transmuter|Transmuter's Stone#10` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained

### ADV (373 uncovered)

- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | number 1 no record explains
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|dmg|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|dmg|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE; number 120 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tee24|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|tgh14p|Stalk Symbiote#3` While attuned you have Advantage on Wisdom (Perception) checks, and you and allies within 30 ft cannot be surprised unless incapacitated by something other than nonmagical sleep. | no record for ADV; number 30 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE; number 120 unexplained
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tkdm|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#6` 4 Gray: Advantage on saves against Charmed and Frightened. | no record for ADV; number 4 unexplained
- `item|tsgs|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|ttoh|Emperor's Garlic#7` Eat a raw clove as an action to gain Resistance to Poison damage and Advantage on saves against Poisoned for 1 hour, but Disadvantage on all Deception and Persuasion checks for that time. | no record for ADV,DIS,RES; number 1 unexplained
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | no record for ADV; number 24 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Cleric/Trickery Domain|Improved Duplicity#3` Attack rolls made by you and your allies against any creature within 5 feet of the illusion have Advantage. | number 5 no record explains
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | no record for ADV,SPEED; number 30 unexplained
- `sub|Fighter/Corsair|Surprise Attack#1` Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Hearth (ToH)|Aura of the Hearth#1` You and friendly creatures within 10 ft have Advantage on saves against spells and effects that deal Cold damage. | number 10 no record explains
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#5` Otherwise it gains 5 temporary hit points for 1 hour and Advantage on its next ability check, attack roll or save. | no record for ADV; number 1,5 unexplained
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | no record for ADV; number 8 unexplained
- `sub|Wizard/Void Caster|Void Affinity#1` You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint. | no record for ADV; number double unexplained

### PROF (359 uncovered)

- `class|Bard|Expertise#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Bard|Expertise~2#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | no record for PROF; number half,pb unexplained
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `feat|Reptiloid|Reptiloid#3` It is a ranged attack with range 30 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF
- `feat|Sharpshooter (2014)|Sharpshooter (2014)#6` Before you make an attack with a ranged weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|dmg|Brawling Gloves (very rare)#2` You are proficient with all improvised weapons and gain +3 to attack and damage rolls made with them. | no record for DMG,PROF; number 3 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|llk|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|tdm14|Arm Cannon#2` An arm is replaced by a blaster cannon, 2d8 Radiant, Blaster property, range 30/120 ft. You are proficient with it and cannot be disarmed of it. | no record for PROF; number 2d8,120,30 unexplained
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tsgs|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|tvss14|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|tvss|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Heavy Metal Axe#1` Spend 8 hours of work to turn a two-handed weapon into an instrument you are proficient with. | no record for PROF; number 8 unexplained
- `sub|Bard/College of Shadows|Bonus Proficiencies#1` Gain proficiency in Stealth and two other skills of your choice. | number 2 no record explains
- `sub|Cleric/Dragon Domain|Bonus Proficiency#1` You gain proficiency in Arcana, and your Proficiency Bonus is doubled on its checks. | number double,pb no record explains
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#6` Dexterity save against 8 + Wisdom modifier + Proficiency. | no record for PROF; number 8 unexplained
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | number double,pb no record explains
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | no record for PROF; number 5,6 unexplained

### SPELL (329 uncovered)

- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Cantrip Specialist|Cantrip Specialist#1` You learn two Warmage tricks from this list: Blasting Cantrip, Corrosive Cantrip, Draining Cantrip, Explosive Cantrip, Icy Cantrip, Severe Cantrip, Silent Cantrip, Static Cantrip. | no record for SPELL; number 2 unexplained
- `feat|Spellblade (2014)|Spellblade (2014)#3` You learn two cantrips from Arc Blade, Burning Blade, Caustic Blade and Frigid Blade, using Intelligence. | no record for SPELL; number 2 unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `item|ai|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Helm of Telepathy#3` After you cast one of these two spells from the helm, that same spell can't be cast from the helm again until the next dawn. | number 2 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|dmg|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsdm|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Barbarian/Path of the Rage Mage|Spellcasting#8` You know three 1st-level sorcerer spells, two of which are evocation or transmutation. | no record for SPELL; number 3,2 unexplained
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Ranger/Wasteland Strider|Dimensional Step#1` Cast dimension door without a spell slot, a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Soulspy|Spellcasting#2` You learn three cantrips from the cleric list and a fourth at level 10. | no record for SPELL; number 3 unexplained
- `sub|Rogue/Temporal Trickster|Chrono-Master#1` You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. | no record for SPELL; number double,pb unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/Cantrip Adept|Cantrip Polymath#1` Learn two cantrips from any spell list. | no record for SPELL; number 2 unexplained
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | no record for SPELL; number 1d6 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### RES (297 uncovered)

- `feat|Vampire Transformation: Stage 3|Vampire Transformation: Stage 3#5` If you start your turn in sunlight you take 1d10 Radiant damage, and nothing can give you Resistance or Immunity to it. | no record for DMG,IMM,RES; number 1d10 unexplained
- `item|coa|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Twin Blades of Azzinoth#3` Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. | no record for IMM,RES
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|idrotf|Charm of Cold Resistance#1` As an action, give yourself resistance to Cold damage for 24 hours. | no record for RES; number 24 unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | no record for RES,RESOURCE; number 1,3 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | number 10,50,300 no record explains
- `sub|Paladin/Oath of the Hearth (ToH)|Roaring Fire#3` A cold creature that starts its turn within 20 ft takes 2d8 Fire damage, ignoring Fire resistance and immunity. | no record for DMG,IMM,RES; number 2d8 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#1` Spells always prepared from the listed Sorcerer levels: 3 Command, Guidance, Locate Object, Protection from Evil and Good, Resistance, Spiritual Weapon. | no record for RES; number 3 unexplained
- `sub|Sorcerer/Apocalypse Sorcery|Forbidden Magic#4` Right after casting you take Force damage equal to four times the slot level, ignoring Resistance and Immunity. | no record for IMM,RES,SLOT; number 4 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Warlock/The Legacy|Aura of Legend#1` While transformed, you and friendly creatures within 30 ft have Resistance to your Relic Force damage type. | no record for RES; number 30 unexplained
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | no record for RES; number 30 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Transmuter|Potent Stone#4` If you pick Resistance twice, you must choose different damage types. | no record for RES; number double unexplained

### NUM (267 uncovered)

- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | number 2 no record explains
- `feat|Inscription Adept|Inscription Adept#10` Artisan (+5): Symbol. | number 5 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Roguean|Roguean#7` You can endure temperatures from -100 to 300 degrees Fahrenheit. | number 100,300 no record explains
- `item|au|Thief's Thimble#4` If the thimble is reduced to 0 Hit Points, it breaks, and you take any remaining damage. | number 0 no record explains
- `item|cos|Crusader's Shortsword#1` The Crusader's Shortsword is a sentient lawful good +1 shortsword (Intelligence 11, Wisdom 13, Charisma 13). | number 11,13 no record explains
- `item|dmg14|Bag of Tricks, Rust#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Bag of Sundrops#1` A bag holding 1d6 + 4 glowing golden orbs. | number 1d6,4 no record explains
- `item|dmg|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|dmg|Deck of Many Things#60` Your Intelligence or Wisdom score drops permanently by 1d4 + 1, to a minimum of 1. | number 1d4,1 no record explains
- `item|dmg|Horn of the Endless Maze#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#35` While it circles your head, your Intelligence rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Keoghtom's Ointment#1` This glass jar is 3 inches across and holds 1d4 + 1 doses of a thick mixture with a faint smell of aloe. | number 3 no record explains
- `item|dmg|Lifewell Tattoo#9` When you would be reduced to 0 hit points, you drop to 1 hit point instead. | number 0 no record explains
- `item|dmg|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | number 1d4,1 no record explains
- `item|dmg|Powered Armor#25` When the armor is reduced to 0 hit points, its defenses are rendered inert and it can be safely approached. | number 0 no record explains
- `item|dmg|Robe of Serpents#2` The robe is emblazoned with 1d4 + 3 stylized serpents, all brightly colored. | number 1d4,3 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|tdm14|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | number 1,2 no record explains
- `item|tghg|Faerie Crown#2` When you first don it after attuning, 1d6 + 3 butterflies flutter around it. | number 1d6,3 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|tsdm|Flashback Polaroid#1` An antique camera loaded with 1d6 + 2 blank photos. | number 1d6,2 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | number 1d4,1 no record explains
- `item|tvss14|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `item|wdmm|Horn of the Endless Maze#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `sub|Bard/College of Calligraphy|Quill and Ink#1` Arcane Flourish: when you cast a level 1-5 Bard spell that deals no damage, spend one Bardic Inspiration use to raise its effective level by 1. | number 1 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Cleric/Black Powder Domain|Channel Divinity: Imbue/Remove Explosivity#2` Either give the Gunpowder Blessing for 1 minute to one weapon of each creature you choose within 30 ft, or curse a number of weapons with Gunpowder Burst, up to your Proficiency Bonus, within 30 ft so they cannot Gunpowd | number 30,1,pb no record explains
- `sub|Fighter/Hell Knight|Advanced Wounds#5` Devil's Luck: creatures that take the Acid damage have -1 AC until the end of your next turn. | number 1 no record explains
- `sub|Monk/Way of Street Fighting|Combo#2` The bonus resets to 0 if you take damage on your turn. | number 0 no record explains
- `sub|Monk/Way of the Sun Soul|Searing Arc Strike#2` You can spend more points to raise its level by 1 each. | number 1 no record explains
- `sub|Necromancer/Overlord|Charnel Aura#3` The bonus is +1 per 5 points spent, to a maximum of +3. | number 1,5 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains
- `sub|Warden/Stoneheart Defender|Stoneforged Champion#7` Your Strength increases by 4, to a maximum of 25. | number 4 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains

### SLOT (255 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|skt|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|tsgs|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|twow|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 3 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### IMM (212 uncovered)

- `item|coa|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | no record for IMM; number 24,3 unexplained
- `item|dmg|Armor of Invulnerability#4` This Immunity lasts 10 minutes or until you stop wearing the armor. | no record for IMM; number 10 unexplained
- `item|dmg|Bliss#2` A Humanoid who swallows it feels calm and happy for 1d4 hours, gaining Immunity to the Frightened condition and 3d10 Temporary Hit Points. | no record for IMM; number 1d4,3d10 unexplained
- `item|dmg|Bracelet of Rock Magic#1` While you wear this gold bracelet, it grants you immunity to being petrified, and it allows you to cast flesh to stone (save DC 15) as an action. | no record for DC; number 15 unexplained
- `item|dmg|Clay No-Face's Charm#3` The doll is a Tiny Construct with 1 Hit Point, Speed 10 feet, and immunity to Poison damage and the Poisoned condition. | no record for IMM,SPEED; number 10,1 unexplained
- `item|dmg|Coldsnap#3` When you hit a creature without Cold Immunity, spend 1 charge to force a DC 15 Constitution save. | no record for DC,IMM; number 1,15 unexplained
- `item|dmg|Cure-All#2` As an action, drink a dose to cure any disease, end the Poisoned condition and become immune to it for 1 hour. | no record for IMM; number 1 unexplained
- `item|dmg|Ferryman's Take#6` A conscious one enters a death-like state for 1 hour, with Immunity to Psychic damage (once per 24 hours). | no record for IMM,RESOURCE; number 1,24 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#2` It has 2 minor beneficial and 1 minor detrimental random artifact properties (a goblinoid is immune to the detrimental one). | no record for IMM; number 2,1 unexplained
- `item|dmg|Hearthfire Breastplate (Master)#10` When a creature you see within 30 ft takes damage, use a Reaction to give it Immunity to all damage until the start of your next turn, once per Long Rest. | no record for IMM; number 30 unexplained
- `item|dmg|Helm of Heroes#3` While it glimmers, you gain Temporary Hit Points equal to half your level (rounded down) at the start of each of your turns, and you and allies within 10 ft are Immune to Frightened. | no record for IMM; number 10,half unexplained
- `item|dmg|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | no record for IMM; number 1 unexplained
- `item|dmg|Joho's Charm#3` Joho is a Tiny construct with 1 hit point, speed 10 feet, and immunity to poison and the poisoned condition. | no record for IMM,SPEED; number 10,1 unexplained
- `item|dmg|Nightstalker's Kanabo#3` On a natural 20, the target makes a DC 16 Constitution save or is Unconscious until the end of your next turn (damage or a shake ends it, and creatures that do not sleep or are immune to Exhaustion pass). | no record for DC,IMM; number 20,16 unexplained
- `item|dmg|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|dmg|Potion of Mirrored Eyes#1` For 1 minute you are immune to any effect that can be avoided by looking away, such as a medusa's petrifying gaze, and can look at such creatures safely. | no record for IMM; number 1 unexplained
- `item|dmg|Rope of Climbing#7` The rope has Armor Class 20, 20 Hit Points, and Immunity to Poison and Psychic damage. | no record for IMM; number 20 unexplained
- `item|dmg|Sandstone Solution#4` On mud, sand or quicksand, a 10-ft-deep, 10-ft-radius area turns to solid stone for 1 hour, with AC 17, 75 hit points and immunity to Psychic and Poison. | no record for IMM; number 10,1,17,75 unexplained
- `item|dmg|Soul Coin#25` A soul coin has AC 19, 1 hit point for each charge it has remaining, and immunity to all damage except that which is dealt by a hellfire weapon or an infernal war machine's furnace (see "11"). | no record for IMM; number 19,1,11 unexplained
- `item|dmg|Strawbundle's Charm#3` The doll is a Tiny construct with 1 hit point, immune to poison and the poisoned condition. | no record for IMM; number 1 unexplained
- `item|dmg|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | no record for IMM; number 24,3 unexplained
- `item|frafi|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|tftyp|Bracelet of Rock Magic#1` While you wear this gold bracelet, it grants you immunity to being petrified, and it allows you to cast flesh to stone (save DC 15) as an action. | no record for DC; number 15 unexplained
- `item|tghg|Hearthfire Breastplate (Master)#10` When a creature you see within 30 ft takes damage, use a Reaction to give it Immunity to all damage until the start of your next turn, once per Long Rest. | no record for IMM; number 30 unexplained
- `item|toa|Ring of Winter#27` - You can cast one of the following spells from the ring (spell save DC 17) by expending the necessary number of charges: Bigby's hand (2 charges; the hand is made of ice, is immune to cold damage, and deals bludgeoning  | no record for DC,IMM; number 17 unexplained
- `item|tsgs|Coldsnap#3` When you hit a creature without Cold Immunity, spend 1 charge to force a DC 15 Constitution save. | no record for DC,IMM; number 1,15 unexplained
- `item|tsgs|Ferryman's Take#6` A conscious one enters a death-like state for 1 hour, with Immunity to Psychic damage (once per 24 hours). | no record for IMM,RESOURCE; number 1,24 unexplained
- `item|tsgs|Nightstalker's Kanabo#3` On a natural 20, the target makes a DC 16 Constitution save or is Unconscious until the end of your next turn (damage or a shake ends it, and creatures that do not sleep or are immune to Exhaustion pass). | no record for DC,IMM; number 20,16 unexplained
- `item|tsgs|Plaguebane Mask#5` Each creature makes a DC 15 Constitution save, taking 2d8 Poison and having its Speed halved until the end of its next turn on a fail (not if immune to Poisoned), or half damage only on a pass. | no record for DC,IMM,SPEED; number 2d8,15,half unexplained
- `item|tvss14|Cure-All#2` As an action, drink a dose to cure any disease, end the Poisoned condition and become immune to it for 1 hour. | no record for IMM; number 1 unexplained
- `item|tvss|Liquid Courage#3` You gain Heroic Inspiration and Immunity to the Frightened condition for 10 minutes. | number 10 no record explains
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | no record for IMM; number 3 unexplained
- `sub|Druid/Circle of Sand|Sandstorm#4` You are immune, and so are up to your Proficiency Bonus creatures you see within 120 ft. Rest to use again. | no record for IMM; number 120,pb unexplained
- `sub|Druid/Circle of the Blighted|Foul Conjuration#1` Beasts, fey and plants you summon or create (including saplings) are immune to Necrotic, Poison and the Poisoned condition, and burst when they drop to 0 HP: creatures within 5 ft make a Constitution save or take Necroti | no record for DMG,IMM; number 1d4,1d6,5,0 unexplained
- `sub|Investigator/Decommissioner|Reprogrammer#6` Sleep Mode: it is Unconscious for 1 minute even if normally immune, ending early if it takes damage. | no record for IMM; number 1 unexplained
- `sub|Paladin/Oath of Thunder|Child of the Storm#9` A creature that succeeds is immune to the war cry for 24 hours. | number 24 no record explains
- `sub|Ranger/Green Reaper (2014)|3rd-Level Effects#3` Supernatural: a weapon hit with this toxin removes its immunity to Poisoned, and it stays Poisoned for 1 minute, saving at the end of each turn to end it. | no record for IMM; number 1 unexplained
- `sub|Rogue/Infiltrator (2014)|Hacking Spike#2` When you hit a construct with a melee Sneak Attack, it makes a Wisdom save (DC 8 + Proficiency Bonus + Intelligence modifier) or is Stunned until the start of your next turn, even if normally immune. | no record for DC,IMM; number 8,pb unexplained
- `sub|Summoner/Bond of the Dragon Herald|Draconic Realisation#1` Your Eidolon is Immune to the Frightened condition and has a Fly Speed of 60 feet. | no record for IMM,SPEED; number 60 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Draconic Realisation#2` It becomes Immune to its Draconic Type damage, and its Conjured Strike deals an extra 1d6 of that type on a hit. | no record for IMM; number 1d6 unexplained

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (112)

- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
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
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | angka: 3
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | angka: 2
- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | angka: 0
- `class|Warmage|Arcane Surge Improvement#1` You gain one additional use of Arcane Surge, for a total of three. | angka: 3
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | angka: 2
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | angka: 2
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | angka: 1
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3

### feat (204)

- `feat|Fairy Trickster|Fairy Trickster#9` You can use this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | angka: pb
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Insectoid|Insectoid#2` Your antennae give you blindsight 10 feet. | angka: 10
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | angka: 30
- `feat|Lordly Resolve|Lordly Resolve#5` Each target can immediately use a Reaction to right itself and end the Prone condition, provided its Speed isn't 0. | angka: 0
- `feat|Boon of Irresistible Offense|Boon of Irresistible Offense#2` Add 1 to your Strength or Dexterity score (maximum 30). | angka: 1,30
- `feat|Inscription Adept|Inscription Adept#9` Journeyman (+3): Glyph of Warding. | angka: 3
- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Void Channeler|Void Channeler#3` One creature of your choice within 10 feet that can hear you must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or be frightened of you for 1 minute. | angka: 10,1,8,pb
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#25` Deathly Horror (3 FP): as a bonus action, a creature within 30 ft makes a Wisdom save or is Frightened for 1 minute, repeating each turn, and a success makes it immune for 24 hours. | angka: 30,24,3
- `feat|Iron Hero (2014)|Iron Hero (2014)#2` When a creature with a challenge rating above your level attacks you, you gain +2 AC. | angka: 2
- `feat|Inventor|Inventor#8` If a Gadget requires a saving throw, the DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | angka: 1
- `feat|Aberrant Anatomy|Aberrant Anatomy#7` Right after you make a D20 Test and roll a 1 on the d20, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Impaired Vision|Impaired Vision#7` You can cast spells that need you to see a target or area if it is within 30 feet, you have a direct line to it, and you can hear it if it is a creature. | angka: 30
- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | angka: 2
- `feat|Skulker|Skulker#4` You gain Blindsight out to 10 feet. | angka: 10
- `feat|Pack Fighting|Pack Fighting#3` If an ally within 5 feet of the creature also has this feat and is not Incapacitated, the bonus becomes +2. | angka: 5,2
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | angka: 3
- `feat|Heavy Armor Master (2014)|Heavy Armor Master (2014)#6` While you wear Heavy armor, Bludgeoning, Piercing, and Slashing damage from nonmagical weapons is reduced by 3. | angka: 3
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | angka: 30
- `feat|Iron Hero|Iron Hero#1` When a creature with a Challenge Rating higher than your level attacks you, you have +2 AC. | angka: 2
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Fists of Fury|Fists of Fury#5` When you deal damage to a creature with an Unarmed Strike, add +1 to the damage roll for each earlier melee attack roll that hit that creature in the same turn. | angka: 1
- `feat|Boon of the Cleansed Heart|Boon of the Cleansed Heart#7` When you would take Necrotic damage and aren't Incapacitated, you deal 2d8 Radiant damage to each creature of your choice within a 10-foot Emanation. | angka: 2d8,10
- `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#15` The DC is 8 plus your Proficiency Bonus plus your Transformation Stage. | angka: 8,pb
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | angka: 5

### item (1708)

- `item|tee24|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | angka: 1
- `item|wdmm|Tearulai#24` Note: According to the SRD, it is an extra 4d6 slashing damage, although this is incorrect. | angka: 4d6
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | angka: 0,pb
- `item|egw|The Bloody End (Exalted)#14` - The saving throw DC for spells cast from the morningstar, as well as for creatures to avoid being frightened by it, increases to 17. | angka: 17
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | angka: 2
- `item|tsgs|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | angka: 20,10
- `item|tsgs|Battlechef's Splendid Saucepan#2` It works as a Mace with +1 to attack and damage rolls and deals an extra 1d4 Thunder to a target in metal armor or made of metal or stone. | angka: 1
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | angka: 4
- `item|dmg|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|tgh14p|Heaven's Herald#4` Each is immune to Frightened, has Advantage on Wisdom saves, and its hit point maximum and current hit points rise by 2d10. | angka: 2d10
- `item|egw|Silken Spite (Dormant)#5` It has hearing and darkvision out to a range of 120 feet. | angka: 120
- `item|tghg|Staff of the Sorcerer King#6` Each midnight, a DC 17 Constitution save failure cuts your Hit Point maximum by 10 (not Undead), only a Wish restores it, and at 0 you die and rise as a Wight. | angka: 17,10
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | angka: 1d20,10
- `item|dmg|Rival Coin#14` You take 1d4 Psychic damage. | angka: 1d4
- `item|dmg|Eldritch Staff#7` For each charge you expend, the target takes an extra 1d8 lightning damage. | angka: 1d8
- `item|tsgs|Tectonic Gauntlets#10` As a Magic action, for 1 hour you have Resistance to Bludgeoning, Piercing and Slashing, half Speed, and Disadvantage on Dexterity checks and saves. | angka: 1,half
- `item|idrotf|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | angka: 30
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | angka: 01,20
- `item|tdm14|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | angka: 1d4,2d4
- `item|tdcsr|Fenthras (Exalted)#7` You can use bramble shot twice between rests and its save DC is 17. | angka: 17,double
- `item|tsgs|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | angka: 3
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | angka: 5,7
- `item|dmg|Trident of the Hydra#4` Each deals 1d6 Piercing damage and gets no ability modifier unless it is negative. | angka: 1d6
- `item|cos|Icon of Ravenloft#11` If you do so, increase the save DC by 2. | angka: 2
- `item|hof|Thayan Spell Tattoo#3` If you have the Spellcasting or Pact Magic feature, the spell uses your spellcasting ability; otherwise, if the spell requires a saving throw or an attack roll, the spell save DC is 13 and the attack  | angka: 13,5
- `item|bmt|Spindle of Fate#4` When you roll initiative, you can expend 1 charge to add or subtract your proficiency bonus from the total roll. | angka: 1,pb
- `item|dmg|Bracers of Defense#1` While wearing these bracers, you get a +2 bonus to your Armor Class, provided you wear no armor and carry no Shield. | angka: 2
- `item|dmg|Iron Bands of Bilarro#4` You then make a ranged attack roll, using an attack bonus equal to your Proficiency Bonus plus your Dexterity modifier. | angka: pb
- `item|tvss14|Jax#2` For 1 hour your Strength, Dexterity and Constitution each rise by 4, and their maximum becomes 24. | angka: 1,4,24
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | angka: 1

### species (112)

- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
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
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | angka: 1
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | angka: double
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Geppettin|Geppettin Construction#2` Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. | angka: pb
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Pantheran Catfolk|Cat's Claws#1` Your claws are natural weapons for Unarmed Strikes and deal 1d4 + Strength modifier Slashing damage instead of Bludgeoning. | angka: 1d4
- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | angka: 0

### sub (882)

- `sub|Sorcerer/Nanite Host|Reboot#1` When you regain consciousness after dropping to 0 hit points, you immediately regain extra 4d6 + 4 hit points. | angka: 0
- `sub|Captain/Feylost|Fey Moods#4` Enemies within 5 feet of you have Disadvantage on attacks against anyone but you. | angka: 5
- `sub|Druid/Circle of the Titan|Titan Form#16` Energizing Pollen: spend a level 1+ slot and move up to half Speed without Opportunity Attacks, healing each creature you pass within 5 feet for 2d6 per slot level, once per creature per turn. | angka: 2d6,5,half
- `sub|Wizard/Graviturgy Magic|Adjust Density#3` With doubled weight it loses 10 feet of Speed and has Advantage on Strength checks and saves. | angka: 10,double
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | angka: 1d6
- `sub|Sorcerer/Spellfire Sorcery|Spellfire Burst#5` One creature you can see within 30 feet takes 1d4 Fire or Radiant damage, your choice. | angka: 1d4,30
- `sub|Warlock/The Sibyl|The Sybil and your Pact Boons#10` While it is on you, your passive Perception rises by 1 when compared against enemy Stealth results. | angka: 1
- `sub|Cleric/Grave Domain|Circle of Mortality#4` At Cleric level 11 the extra damage becomes 1d6. | angka: 1d6
- `sub|Paladin/Oath of Safeguarding|Aura of Preservation#4` At level 18 the range is 30 ft, and friendly creatures within 10 ft have Resistance to all Bludgeoning, Piercing and Slashing damage. | angka: 30,10
- `sub|Sorcerer/Lunar Sorcery|Lunar Boons#8` When you use Metamagic on a spell of a school linked to your current phase, you can reduce the sorcery points spent by 1 (minimum 0). | angka: 1
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | angka: 3
- `sub|Wizard/School of Transmutation|Transmuter's Stone#6` +10 feet while unencumbered. | angka: 10
- `sub|Wizard/Chronurgy Magic|Momentary Stasis#4` While encased it is Incapacitated with Speed 0. | angka: 0
- `sub|Sorcerer/Emotion Lord|Vibrant Soul#3` You can cast it by spending 10 sorcery points instead of a spell slot. | angka: 10
- `sub|Druid/Circle of Blood|Exsanguinate#1` When you use Blood Boon, regain spent Hit Point Dice equal to half your Druid level and give Temporary HP equal to twice your Druid level to up to your Wisdom modifier (minimum 1) creatures you see wi | angka: 60,half,double
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#3` A creature cannot be raised above half its Hit Point maximum this way. | angka: half
- `sub|Necromancer/Pharaoh|Mummy Lord [Lichdom]#13` A creature reduced to 0 Hit Points by this attack dies and turns to dust. | angka: 0
- `sub|Craftsman/Mechanauts' Guild|Mechanaut's Apparatus#5` Doing so costs movement equal to half its Speed, rounded down. | angka: half
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | angka: 3
- `sub|Monster Hunter/Carver Guild|Deadly Redirect#1` The extra damage of Close Quarters becomes 3d6. | angka: 3d6
- `sub|Necromancer/Cyberghoul|Cyber Lich (Lichdom)#9` A Construct that passes the save is immune for 24 hours. | angka: 24
- `sub|Sorcerer/Toon Magic|Madcap Magic#2` After a Short or Long Rest, roll 1d6 on the 1st-level column of the Madcap Spells table and learn that spell until you roll again. | angka: 1d6
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | angka: 2d4
- `sub|Ranger/Winter Trapper|Tripped Defenses#4` Right after, you can either make one weapon or Unarmed Strike attack against it or move up to half your Speed without provoking Opportunity Attacks from it. | angka: half
- `sub|Warlock/The Parasite|Physical Specimen#2` Your hit point maximum rises by 1 per warlock level. | angka: 1
- `sub|Paladin/Oath of the Sepulcher|Galactic Knight#3` Galactic Knight: used in open space outside an atmosphere or gravity field, for 1 minute you grow to 100 times your size inside a cosmic energy field, gain a 6,000 ft flying speed, your attacks deal m | angka: 6000,100
- `sub|Druid/Circle of the Titan|Titan Form#4` Titan forms (Large, Huge, or Gargantuan, your creature type does not change): AC 13 + your Wisdom modifier, Temporary Hit Points equal to 4 times your Druid level, Speed 40 ft, Darkvision 60 ft. Your  | angka: 40,60,13,4
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | angka: 1d20
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#3` A creature cannot be raised above half its Hit Point maximum this way. | angka: half
- `sub|Summoner/Bond of the Wrathful Giant|Giant Eidolon#4` Strength 17 (+3), Constitution 14 (+2). | angka: 17,14,2

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg|Big Bertha#1` A Cannon inlaid with moongold (3d10 Bludgeoning, range 120/240 ft, Artillery, Booming, Two-Handed, Push mastery, uses Ca -> info:NUMONLY:ROLL
- class `item|dmg|Big Bertha#1` A Cannon inlaid with moongold (3d10 Bludgeoning, range 120/240 ft, Artillery, Booming, Two-Handed, Push mastery, uses Ca -> info:NUMONLY:ROLL
- record `item|tsdm|Finger Gun Glove#2` A fingerless glove that lets you cast the Finger Guns cantrip with your spellcasting ability. -> covered
- record `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#7` Stage 1. -> info:NUMONLY:TABLE
- class `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#7` Stage 1. -> info:NUMONLY:TABLE
- record `feat|Aberrant Horror Transformation: Stage 4|Aberrant Horror Transformation: Stage 4#1` Stage 4. -> info:NUMONLY:TABLE
- class `feat|Aberrant Horror Transformation: Stage 4|Aberrant Horror Transformation: Stage 4#1` Stage 4. -> info:NUMONLY:TABLE
- class `item|dmg|Shalamayne (Ellemayne)#4` A hit deals an extra 2d12 Force damage. -> info:ACTIVE:OTHERS
- record `sub|Sorcerer/Resonant Body|Sound and Fury#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Sorcerer/Resonant Body|Sound and Fury#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- record `item|dmg|Helm of Perfect Potential#6` - 1 major beneficial property -> info:ITEM:ARTIFACT_PROPS
- class `item|dmg|Helm of Perfect Potential#6` - 1 major beneficial property -> info:ITEM:ARTIFACT_PROPS
- record `species|Wrothian (DM14)|Neural Lock#3` Long Rest to use again. -> info:REST:NONUM
- class `species|Wrothian (DM14)|Neural Lock#3` Long Rest to use again. -> info:REST:NONUM
- record `item|dmg|Rod of Resurrection#3` Each day at dawn, the rod recovers 1 spent charge. -> covered
- record `sub|Summoner/Bond of the Shambling Plant|Natural Spellcasting#3` You learn the cantrip without it counting against your cantrips known, and you always have the level 1 spell prepared. -> info:TABLE:CLASS
- class `sub|Summoner/Bond of the Shambling Plant|Natural Spellcasting#3` You learn the cantrip without it counting against your cantrips known, and you always have the level 1 spell prepared. -> info:TABLE:CLASS
- record `item|dmg|Helm of the Gods#2` Whenever you finish a long rest while wearing the helm, you can pray to one of the gods listed on the Helm of the Gods t -> info:REST:NONUM
- class `item|dmg|Helm of the Gods#2` Whenever you finish a long rest while wearing the helm, you can pray to one of the gods listed on the Helm of the Gods t -> info:REST:NONUM
- record `item|dmg|Leather Golem Armor#14` If you take fire damage, you have disadvantage on attack rolls and ability checks until the end of your next turn. -> info:ACTIVE:TRIGGER
- class `item|dmg|Leather Golem Armor#14` If you take fire damage, you have disadvantage on attack rolls and ability checks until the end of your next turn. -> info:ACTIVE:TRIGGER
- record `sub|Barbarian/Path of Spellfury|Spellcasting#2` Casting a spell extends your Rage by 1 round. -> info:NUMONLY:GEOMETRY
- class `sub|Barbarian/Path of Spellfury|Spellcasting#2` Casting a spell extends your Rage by 1 round. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Horn of Valhalla (iron)#6` Once the horn has been blown, 7 days must pass before it works again. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Horn of Valhalla (iron)#6` Once the horn has been blown, 7 days must pass before it works again. -> info:NUMONLY:GEOMETRY
- record `sub|Cleric/Purification Domain|Purification Domain Spells#2` 5 Fear, Flash Fever. -> info:NUMONLY:TABLE
- class `sub|Cleric/Purification Domain|Purification Domain Spells#2` 5 Fear, Flash Fever. -> info:NUMONLY:TABLE
- record `item|tdcsr|Titanstone Knuckles (Awakened)#5` Finish a long rest to use that again. -> covered
- class `item|tdcsr|Titanstone Knuckles (Awakened)#5` Finish a long rest to use that again. -> info:REST:NONUM
- record `item|wdmm|Tearulai#4` The weapon's emerald blade can't be damaged or dulled, and the sword can't be teleported anywhere without its wielder wh -> info:NUMONLY:TEXT
