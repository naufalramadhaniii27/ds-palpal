# Laporan clause gate (mode laporan, 2026-11-18)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9864 |
| Info (tag terdokumentasi) | 29133 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2682, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1569, FXO_NULL 1351, NUMONLY:ROLL 1224, NUMONLY:TABLE 1009, FORM:TABLE 979, ACTIVE:TRIGGER 937, ACTIVE:OTHERS 789, BY_DESIGN 670, REST:NONUM 607, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 232, NUMONLY:ZERO 194, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, SPELL:RIDER 13, SPELL:CANTRIP_DMG 13, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5252 |
| Uncovered dengan angka | 3345 |
| Uncovered dengan kelas kata kunci mekanik | 4860 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 392 |
| Angka yang tidak dijelaskan record mana pun | 3211 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4296 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 252 |
| Waktu | muat data 7 s, analisis 11 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 180 ditangkap (60.2%). Hapus semua atom kelas yang dibutuhkan: 189 ditangkap (63.2%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 279 ditangkap (93.0%), semua atom kelas dihapus: 299 ditangkap (99.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3410 |
| GX | 2321 |
| wxs | 1073 |
| LU_X | 767 |
| species | 545 |
| ITEM_SPELLS | 495 |
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

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 336, fx-L5.js 206, fx-L12.js 188, fx-L4.js 177, fx-L10.js 172, fx-L2.js 135, fx-L1.js 132, fx-N1.js 115, fx-L3.js 114, fx-L11.js 100, fx-L9.js 99, fx-Z2.js 71.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 867 | 11.7% |
| SPELL | 3255 | 700 | 21.5% |
| DMG | 4658 | 678 | 14.6% |
| SPEED | 1411 | 542 | 38.4% |
| PROF | 1124 | 405 | 36.0% |
| ADV | 1959 | 388 | 19.8% |
| RES | 1375 | 365 | 26.5% |
| CHOICE | 1663 | 356 | 21.4% |
| NUM | 8604 | 344 | 4.0% |
| IMM | 1004 | 318 | 31.7% |
| DC | 2903 | 282 | 9.7% |
| SLOT | 1425 | 280 | 19.6% |
| DIS | 1221 | 239 | 19.6% |
| ATK | 1056 | 203 | 19.2% |
| SENSE | 648 | 194 | 29.9% |
| AC | 677 | 162 | 23.9% |
| HP | 206 | 112 | 54.4% |
| SAVE | 278 | 86 | 30.9% |
| NUM-DICE | 1628 | 77 | 4.7% |
| INIT | 129 | 60 | 46.5% |
| ABIL | 383 | 45 | 11.7% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 36 | 1.0% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 296 | 657 | 0 | 233 |
| feat | 2812 | 866 | 1454 | 0 | 492 |
| item | 19265 | 4886 | 11687 | 0 | 2692 |
| species | 1638 | 919 | 492 | 0 | 227 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2619 | 5891 | 0 | 1608 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2676 | 6338 | 1446 | 13.8% |
| tvss | 2788 | 719 | 1639 | 430 | 15.4% |
| core | 1495 | 435 | 778 | 282 | 18.9% |
| ttoh | 1470 | 352 | 870 | 248 | 16.9% |
| tsgs | 1479 | 405 | 831 | 243 | 16.4% |
| tvss14 | 1201 | 245 | 743 | 213 | 17.7% |
| tkdm | 921 | 241 | 492 | 188 | 20.4% |
| tsdm | 1063 | 297 | 592 | 174 | 16.4% |
| tghp | 1116 | 395 | 553 | 168 | 15.1% |
| tdm14 | 643 | 151 | 381 | 111 | 17.3% |
| tua24 | 634 | 193 | 331 | 110 | 17.4% |
| tce | 730 | 170 | 453 | 107 | 14.7% |
| au | 535 | 165 | 279 | 91 | 17.0% |
| tgh14p | 490 | 119 | 283 | 88 | 18.0% |
| phb14 | 513 | 174 | 258 | 81 | 15.8% |
| twow | 542 | 153 | 314 | 75 | 13.8% |
| thhw | 395 | 93 | 232 | 70 | 17.7% |
| dmg14 | 540 | 183 | 291 | 66 | 12.2% |
| tee24 | 463 | 189 | 216 | 58 | 12.5% |
| egw | 365 | 98 | 214 | 53 | 14.5% |
| coa | 158 | 46 | 60 | 52 | 32.9% |
| xge | 375 | 120 | 206 | 49 | 13.1% |
| tghg | 288 | 77 | 162 | 49 | 17.0% |
| tssm | 275 | 79 | 148 | 48 | 17.5% |
| misc14 | 326 | 68 | 213 | 45 | 13.8% |
| oota | 87 | 22 | 21 | 44 | 50.6% |
| hof | 249 | 66 | 141 | 42 | 16.9% |
| tdcsr | 299 | 111 | 148 | 40 | 13.4% |
| rhw | 231 | 79 | 113 | 39 | 16.9% |
| mot | 292 | 99 | 159 | 34 | 11.6% |
| tsgeh | 183 | 65 | 89 | 29 | 15.8% |
| bgg | 207 | 67 | 119 | 21 | 10.1% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| ftd | 159 | 41 | 100 | 18 | 11.3% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| skt | 118 | 30 | 70 | 18 | 15.3% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| bmt | 489 | 93 | 379 | 17 | 3.5% |
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
| EFotA | 137 | 70 | 58 | 9 | 6.6% |
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
| DMG | 509 | 455 |
| SPELL | 487 | 88 |
| SPEED | 459 | 365 |
| ADV | 378 | 183 |
| PROF | 360 | 150 |
| NUM | 344 | 344 |
| RES | 297 | 138 |
| SLOT | 262 | 96 |
| CHOICE | 234 | 76 |
| IMM | 212 | 79 |
| DIS | 198 | 107 |
| SENSE | 168 | 142 |
| ATK | 162 | 125 |
| AC | 162 | 127 |
| DC | 129 | 123 |
| HP | 112 | 85 |
| SAVE | 80 | 61 |
| ABIL | 37 | 34 |
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

### DMG (509 uncovered)

- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | no record for DMG; number 2d8 unexplained
- `class|Craftsman|Masterwork Weapon#3` The weapon gets a bonus to attack and damage rolls equal to your Masterwork Bonus (+1 at level 1, and it grows as shown in the table). | no record for DMG; number 1 unexplained
- `feat|Coalition War Training|Coalition War Training#4` When you attack with a carbine held in two hands without firing it automatically, its damage becomes 2d8. | no record for DMG; number 2d8,2 unexplained
- `item|dmg|Arcane Warhead#9` Within a 10-mile-radius Sphere, each creature and object takes 10d10 + 200 Mega Radiant damage. | no record for DMG; number 10d10,10,200 unexplained
- `item|dmg|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Direstone Dwarven Pick#2` You gain +2 to attack and damage rolls, and stone creatures and objects it hits take an extra 1d8 Piercing. | number 1d8 no record explains
- `item|dmg|Ebonbane#13` When you hit a Celestial or a Humanoid with it, that attack also deals 3d6 Necrotic damage. | number 3d6 no record explains
- `item|dmg|Grovelthrash (Dormant)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Lash of Immolation#6` Doing so increases the extra fire damage dealt by the whip to 2d6. | number 2d6 no record explains
- `item|dmg|Lightbringer#5` While glowing, the mace deals an extra 1d6 radiant damage to Undead creatures. | no record for DMG; number 1d6 unexplained
- `item|dmg|Nether Scroll of Azumar#4` If this check fails, you take 16d10 psychic damage, and you can attempt the check again after another 30 days of concentrated study. | no record for DMG; number 16d10,30 unexplained
- `item|dmg|Oil of Defoliation#4` You can also apply it directly to a willing, helpless, or immobile plant or plant creature, which takes 4d6 Necrotic damage. | no record for DMG; number 4d6 unexplained
- `item|dmg|Ranseur of Torture#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 2d10 piercing damage instead of its regular damage. | number 2d10 no record explains
- `item|dmg|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | number 1d6 no record explains
- `item|dmg|Snicker-Snack#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `item|dmg|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `item|dmg|Stormheart Bow#7` The original target takes normal damage, and each chosen target takes 1d6 Cold damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|True-Ice Shards (Rapier)#21` If you attack with the rapier before the end of your next turn, you do not have its +3 bonus to attack and damage rolls. | no record for DMG; number 3 unexplained
- `item|dmg|Wand of Orcus#8` If it succeeds, it takes 10d6 Necrotic damage. | number 10d6 no record explains
- `item|misc14|Hazirawn#3` If you are not attuned to Hazirawn, you deal an extra 1d6 necrotic damage when you hit with the weapon. | no record for DMG; number 1d6 unexplained
- `item|scc|Catapult Munition#4` In addition, each object in that area that isn't being worn or carried takes 35 (10d6) fire damage. | no record for DMG; number 10d6,35 unexplained
- `item|tdcsr|Plate of the Dawnmartyr (Awakened)#5` The rebuke deals 2d6 fire damage. | no record for DMG; number 2d6 unexplained
- `item|tdm14|Thaumatonic Rifle, +3#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +3 bonus to attack and damage rolls. | number 2d6,80,320 no record explains
- `item|tghg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | no record for DMG; number 1,2 unexplained
- `item|thhw|Cloak of Spines#4` The attack's damage is reduced by 2d4 and the attacker takes 2d4 magical Piercing damage. | no record for DMG; number 2d4 unexplained
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Smash Potatoes#3` For that time, your Unarmed Strike with a hand can deal 1d4 instead of its normal damage. | no record for DMG; number 1d4 unexplained
- `item|tsgs|Tectonic Gauntlets#13` If it ends while you are burrowed, you are shunted to the nearest free space and take 1d10 Force damage. | no record for DMG; number 1d10 unexplained
- `item|wdmm|Tearulai#24` Note: According to the SRD, it is an extra 4d6 slashing damage, although this is incorrect. | no record for DMG; number 4d6 unexplained
- `species|Bhain Kwai Minotaur|Natural Attacks#1` Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `species|Boggart|Fury of the Small#1` Once per turn, when you damage a creature larger than you with an attack roll or a spell, you deal extra damage equal to your Proficiency Bonus. | no record for DMG; number pb unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Barbarian/Path of the Zealot|Divine Fury#2` During your Rage, on each of your turns, the first creature that a weapon or Unarmed Strike of yours hits takes extra damage equal to 1d6 + half your Barbarian level (rounded down). | number half no record explains
- `sub|Cleric/Mercy Domain|Divine Strike of Mercy#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d6 Radiant or Necrotic damage (your choice), 2d6 at level 14. | no record for DMG; number 1d6,2d6 unexplained
- `sub|Druid/Circle of the Blighted|Defile Ground (14th Level)#1` The extra damage becomes 1d8. | no record for DMG; number 1d8 unexplained
- `sub|Investigator/Inquisitor|Divine Strike#1` Once on each of your turns, when you take the Attack action and hit a creature with a weapon, it takes an extra 1d8 Necrotic or Radiant damage (your choice). | no record for DMG; number 1d8 unexplained
- `sub|Paladin/Oath of the Annihilator|Channel Divinity#4` A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. | no record for DMG; number 1 unexplained
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#42` Each of them takes 1d10 Necrotic damage. | no record for DMG; number 1d10 unexplained
- `sub|Summoner/Bond of the Shambling Plant|Absorb Nutrients#5` The damage becomes 3d8 at level 10 and 4d8 at level 14. | no record for DMG; number 3d8,1d8 unexplained

### SPELL (487 uncovered)

- `class|Artificer|Spellcasting#8` You know two Artificer cantrips. | no record for SPELL; number 2 unexplained
- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|dmg|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of the Rage Mage|Spellcasting#8` You know three 1st-level sorcerer spells, two of which are evocation or transmutation. | no record for SPELL; number 3,2 unexplained
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | number 2 no record explains
- `sub|Rogue/Sanguine Thief|Spellcasting#2` You know three cantrips from the Wizard list and the Sangromancy school. | no record for SPELL; number 3 unexplained
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Underfoot|Spellcasting#2` You learn shillelagh and two other druid cantrips, and another at level 10. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Warlock/Hexblade Patron|Hexblade's Curse#4` When you cast a spell with a slot that curses a target, you can apply this curse to that target as part of the cast, and its duration is 1 minute or the spell's duration, whichever is longer. | number 1 no record explains
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained

### SPEED (459 uncovered)

- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | no record for SPEED; number 0 unexplained
- `feat|Boon of Misty Escape|Boon of Misty Escape#5` When cast this way, you can target only yourself, your Fly Speed is 20 feet, you regain 10 Hit Points at the start of each of your turns for the spell's duration, and the spell's spellcasting ability is the ability this  | no record for SPEED
- `item|dmg14|Quaal's Feather Token, Fan#6` The fan floats and creates a wind strong enough to fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. | no record for SPEED; number 5,8 unexplained
- `item|dmg|Apparatus of Kwalish#20` Down: the legs retract, its Speed and Swim Speed drop to 0, and it can't benefit from bonuses to speed. | no record for SPEED; number 0 unexplained
- `item|dmg|Bead of Force#11` A trapped creature can take a Utilize action to push on the wall and move the sphere up to half that creature's Speed. | no record for SPEED; number half unexplained
- `item|dmg|Broom of Flying#4` It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Doomhammer#6` While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). | no record for SPEED; number double unexplained
- `item|dmg|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `item|dmg|Paper Bird#5` If the bird's hit points or speed is reduced to 0 or if it is otherwise immobilized, it turns into ash. | no record for SPEED; number 0 unexplained
- `item|dmg|Quaal's Feather Token (bird)#9` It can carry up to 500 pounds while it flies at its top speed, which is 16 miles per hour for no more than 144 miles per day, resting 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg|Wyrmskull Throne#18` The throne gains a flying speed of 30 feet and can hover and flies where the creature wills. | no record for SPEED; number 30 unexplained
- `item|egw|Grovelthrash (Exalted)#14` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | number 5,half no record explains
- `item|erlw|Wheel of Wind and Water#2` If a wheel of wind and water is mounted on a mundane sailing ship, a creature with the Mark of Storm who is using the wheel can create an area of ideal conditions around the vessel, increasing its speed by 5 miles per ho | no record for SPEED; number 5 unexplained
- `item|skt|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|tsgs|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|tsgs|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for SPEED; number 2d4,2,half unexplained
- `item|twow|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Artificer/Reanimator|Macabre Modifications#9` The companion's Speed becomes 45 feet, and it gains a Climb Speed equal to its Speed. | no record for SPEED; number 45 unexplained
- `sub|Barbarian/Path of the World Tree|Branches of the Tree#4` Once the target has teleported, you can lower its Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Captain/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Cleric/Pestilence Domain|Infection#4` Joint Lock: its Speed drops by 15 ft (minimum 5 ft). | no record for SPEED; number 15 unexplained
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
- `item|tgh14c|Full Moon Extract#2` For 1 hour after you take it, your Strength is 19 (if lower) and you have Advantage on Strength checks and saves. | number 1,19 no record explains
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|tghg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|ttoh|Emperor's Garlic#7` Eat a raw clove as an action to gain Resistance to Poison damage and Advantage on saves against Poisoned for 1 hour, but Disadvantage on all Deception and Persuasion checks for that time. | no record for ADV,DIS,RES; number 1 unexplained
- `species|Elf/Shadow Fey Heritage|Supernatural Senses#2` Proficiency in Perception, and Advantage on Perception checks to notice or find a creature within 30 feet that lacks some of its hit points. | no record for ADV,PROF
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
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
- `item|dmg|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|tdm14|Arm Cannon#2` An arm is replaced by a blaster cannon, 2d8 Radiant, Blaster property, range 30/120 ft. You are proficient with it and cannot be disarmed of it. | no record for PROF; number 2d8,120,30 unexplained
- `item|tee24|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tsgs|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|tvss14|Brawling Gloves (very rare)#2` You are proficient with all improvised weapons and gain +3 to attack and damage rolls made with them. | no record for DMG,PROF; number 3 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mechagnome|Specialized Design#1` Proficiency with two tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | number double no record explains
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
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#11` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|wdmm|Horn of the Endless Maze#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Cleric/Black Powder Domain|Channel Divinity: Imbue/Remove Explosivity#2` Either give the Gunpowder Blessing for 1 minute to one weapon of each creature you choose within 30 ft, or curse a number of weapons with Gunpowder Burst, up to your Proficiency Bonus, within 30 ft so they cannot Gunpowd | number 30,1,pb no record explains
- `sub|Fighter/Hell Knight|Advanced Wounds#5` Devil's Luck: creatures that take the Acid damage have -1 AC until the end of your next turn. | number 1 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | number 2 no record explains

### RES (297 uncovered)

- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|tsgs|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|twow|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
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
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|twow|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### CHOICE (234 uncovered)

- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | no record for CHOICE; number 2 unexplained
- `feat|Hedgecraft|Hedgecraft#5` You gain two magic plants of your choice, each kept in a small pot, pouch or similar container you carry. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
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

### feat (219)

- `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#15` The DC is 8 plus your Proficiency Bonus plus your Transformation Stage. | angka: 8,pb
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | angka: 20
- `feat|Inscription Adept|Inscription Adept#9` Journeyman (+3): Glyph of Warding. | angka: 3
- `feat|Telekinetic|Telekinetic#9` It makes a Strength saving throw against a DC of 8 + your Proficiency Bonus + the modifier of the ability this feat raised. | angka: 8,pb
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Mantle of the Sun|Mantle of the Sun#7` Shield: you gain +2 AC if you wield no shield, and Resistance to Fire, Necrotic and Radiant damage. | angka: 2
- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Latent Psionics|Latent Psionics#4` Your Psionic Blast deals an extra 1d10 Psychic damage. | angka: 1d10
- `feat|Hammer Rocketeer|Hammer Rocketeer#2` When you fire the thrusters of your rocket hammer, the extra damage is 2d4 instead of 1d4. | angka: 2d4,1d4
- `feat|Owlbearman|Owlbearman#2` Your hooked beak makes unarmed strikes that deal 1d6 + your Strength modifier piercing damage. | angka: 1d6
- `feat|Shadowsteel Ghoul Transformation: Stage 4|Shadowsteel Ghoul Transformation: Stage 4#5` The first time you are Bloodied or drop to 0 Hit Points after finishing a Short Rest or Long Rest, the Shadowsteel in your flesh lashes out. | angka: 0
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | angka: 4,2
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | angka: 30
- `feat|Void Scribe|Void Scribe#3` While the glyph is intact, the object is vulnerable to necrotic damage and takes 1d6 necrotic damage at the end of your turn. | angka: 1d6
- `feat|Boon of Fluid Forms|Boon of Fluid Forms#11` The Temporary Hit Points you gain from shape-shifting increase by 20. | angka: 20
- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 5,20
- `feat|Martial Weapon Training|Martial Weapon Training#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Skulker|Skulker#2` Your Dexterity rises by 1 (maximum 20). | angka: 1,20
- `feat|Lightly Armored|Lightly Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Iron Hero (2014)|Iron Hero (2014)#2` When a creature with a challenge rating above your level attacks you, you gain +2 AC. | angka: 2
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#10` Dexterity rises by 2 and Charisma by 1, to a maximum of 16 from this. | angka: 2
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | angka: 5
- `feat|Bloodlust|Bloodlust#7` You can use this a number of times equal to your Proficiency Bonus and regain all expended uses when you finish a Long Rest. | angka: pb
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#4` You have Disadvantage on all D20 Tests while in sunlight. | angka: 1d20
- `feat|Pyromaniac|Pyromaniac#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | angka: 2
- `feat|Inner Resilience|Inner Resilience#5` If you already have ki points, your ki point maximum rises by 3 instead. | angka: 3
- `feat|Troll-Blooded|Troll-Blooded#2` You regain 1 hit point each minute while you have no more than one quarter of your hit points (rounded down). | angka: 1
- `feat|Inscription Adept|Inscription Adept#10` Artisan (+5): Symbol. | angka: 5

### item (1840)

- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | angka: 1
- `item|dmg|Ranseur of Torture#6` When you hit a good aligned creature with it, that creature takes an extra 1d10 necrotic damage. | angka: 1d10
- `item|wbtw|Ornithopter of Flying#4` If the ornithopter loses its rider while airborne, it falls and can't fly again for 1d6 + 4 days. | angka: 1d6,4
- `item|tftyp|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | angka: double
- `item|dmg|Figurine of Wondrous Power (ebony fly)#19` Initiative +1 (11). | angka: 1,11
- `item|wdh|Blackstaff#26` 11 to 20 ft. away: 6 × the number of charges in the staff. | angka: 11
- `item|wbtw|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | angka: 1
- `item|tghg|Magebane Bomb#4` A struck weapon takes a -1 penalty to attacks and damage, and struck armor takes -1 to AC, both until the wielder or wearer finishes a Long Rest. | angka: 1
- `item|oota|Spell Gem (Star ruby)#10` Spells cast from the spell gem have a save DC of 18 and an attack bonus of +10. | angka: 18,10
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | angka: 9
- `item|dmg|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | angka: 2,22
- `item|tsdm|Ballistic Sledge#6` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|coa|True-Ice Shards (Dagger)#28` Additionally, you may cast Scrying (with a spell save DC of 20) and Find the Path. | angka: 20
- `item|oota|Spell Gem (Amber)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|tgh14c|Dreams Leaves#7` You must consume it every 24 hours or have Disadvantage on Intelligence, Wisdom and Charisma checks and saves. | angka: 24
- `item|dmg|Taser Net#2` You have +1 to attack rolls with it. | angka: 1
- `item|dmg|Ring of Warmth#1` If Cold damage hits you while this ring is on your finger, subtract 2d8 from the damage you take. | angka: 2d8
- `item|dmg|Wreath of the Prism (Exalted)#5` - The save DC of the wreath's spell increases to 17. | angka: 17
- `item|tsgs|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | angka: 15,1
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | angka: 1
- `item|dmg|Wand of the War Mage, +3#2` Also, Half Cover doesn't apply against your spell attack rolls. | angka: half
- `item|tsgs|Thwackstaff#2` You get +1 to Charisma (Performance) checks to entertain with it. | angka: 1
- `item|skt|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | angka: half
- `item|llk|Powered Armor#13` - Fire arm-mounted laser: Ranged Attack Roll: +8 to hit, range 120 feet, one target. | angka: 120,8
- `item|dmg|Deck of Oracles#2` When you finish a long rest, you can spend 10 minutes consulting the cards for an omen of the coming day. | angka: 10
- `item|dmg|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | angka: 1d4,1
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | angka: 2
- `item|toa|Bookmark#8` The range of the spell increases to 90 feet but it targets only spiders that are beasts. | angka: 90
- `item|dmg|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even bet | angka: 1,2
- `item|dmg|Deadbane Heartglow Lantern#10` Each charge beyond the first adds 30 minutes and 5 feet to the detection distance. | angka: 5,30

### species (136)

- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Tiefling Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Dwarf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | angka: pb
- `species|Orc (Ixalan)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Drow Heritage|Poison Bite#1` When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. | angka: 1d6,3d6
- `species|Raptor|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | angka: 2
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | angka: half
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Kobold Heritage|Devious Bite#1` When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage. | angka: 1d4
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | angka: 1
- `species|Halfling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Derro Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | angka: 2
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Dwarf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half

### sub (904)

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
- `sub|Dancer/Fey Ballerina|Swan Song#2` You regain Hit Points up to half your Hit Point maximum, and you have Advantage on the first D20 Test you make each turn until your Dance ends. | angka: 1d20,half
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#3` A creature cannot be raised above half its Hit Point maximum this way. | angka: half
- `sub|Monster Hunter/Carver Guild|Terrorize the Terrors#3` The DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `sub|Cleric/Void Domain (DM14)|Channel Divinity: Shape Void#4` Javelin: hurl a crackling spear at a creature you see within 60 ft. Make a ranged spell attack. | angka: 60
- `sub|Fighter/Banneret|Group Recovery#2` Each chosen ally regains Hit Points equal to 1d4 plus your Fighter level. | angka: 1d4
- `sub|Monk/Way of the Bow|Serenity of The Wind#2` From level 17 you always have blindsight out to 30 ft. | angka: 30
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | angka: 1d6,6
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | angka: 2d4

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `sub|Paladin/Oath of Heresy|Implacable Will#2` Long Rest to use again. -> covered
- class `sub|Paladin/Oath of Heresy|Implacable Will#2` Long Rest to use again. -> info:REST:NONUM
- record `item|dmg|Thassa's Votary#2` You can cast Blink once per long rest, using Intelligence as the spellcasting ability. -> covered
- class `item|dmg|Thassa's Votary#2` You can cast Blink once per long rest, using Intelligence as the spellcasting ability. -> info:REST:NONUM
- record `sub|Paladin/Oath of Revelry|Merrymaker#2` Three uses, all regained on a Long Rest. -> covered
- record `item|dmg|Needle, +2#1` Attack rolls and damage rolls you make with this magic needle get a +2 bonus. -> info:NUMONLY:ROLL
- class `item|dmg|Needle, +2#1` Attack rolls and damage rolls you make with this magic needle get a +2 bonus. -> info:NUMONLY:ROLL
- record `item|dmg|Stormstruck Staff#2` You gain a +1 bonus to attack and damage rolls, and it deals an extra 1 Lightning damage. -> covered
- record `sub|Ranger/Fey Wanderer|Misty Wanderer#2` The number of times you can do so equals your Wisdom modifier (minimum of once), and every expended use comes back when  -> info:REST:NONUM
- class `sub|Ranger/Fey Wanderer|Misty Wanderer#2` The number of times you can do so equals your Wisdom modifier (minimum of once), and every expended use comes back when  -> info:REST:NONUM
- record `item|dmg|Necronomicon#11` 2 minor beneficial, 1 major beneficial, 1 minor detrimental, and 2 major detrimental artifact properties. -> info:NUMONLY:TABLE
- class `item|dmg|Necronomicon#11` 2 minor beneficial, 1 major beneficial, 1 minor detrimental, and 2 major detrimental artifact properties. -> info:NUMONLY:TABLE
- record `item|dmg|Hide of the Feral Guardian (Exalted)#6` - When you cast the polymorph spell using this armor, you can transform into a guardian wolf. -> info:ACTIVE:TRIGGER
- class `item|dmg|Hide of the Feral Guardian (Exalted)#6` - When you cast the polymorph spell using this armor, you can transform into a guardian wolf. -> info:ACTIVE:TRIGGER
- record `item|dmg|Needle, +1#1` Attack rolls and damage rolls you make with this magic needle get a +1 bonus. -> info:NUMONLY:ROLL
- class `item|dmg|Needle, +1#1` Attack rolls and damage rolls you make with this magic needle get a +1 bonus. -> info:NUMONLY:ROLL
- record `feat|Hag Transformation: Stage 4|Hag Transformation: Stage 4#1` Stage 4. -> info:NUMONLY:TABLE
- class `feat|Hag Transformation: Stage 4|Hag Transformation: Stage 4#1` Stage 4. -> info:NUMONLY:TABLE
- record `sub|Bard/College of Wyrdsingers|Inspire Greatness#3` Uses: 1 at level 3, 2 at level 8, 3 at level 15. -> info:NUMONLY:TABLE
- class `sub|Bard/College of Wyrdsingers|Inspire Greatness#3` Uses: 1 at level 3, 2 at level 8, 3 at level 15. -> info:NUMONLY:TABLE
- record `sub|Cleric/Hunting Domain|Forest Master#1` You gain proficiency with longbows and heavy crossbows, and in Nature and Survival. -> covered
- record `item|dmg|Wings of Flying#5` Once the wings vanish, you can't use them again for 1d12 hours. -> info:NUMONLY:ROLL
- class `item|dmg|Wings of Flying#5` Once the wings vanish, you can't use them again for 1d12 hours. -> info:NUMONLY:ROLL
- record `sub|Paladin/Oath of Slaughter|Oath of Slaughter Spells#5` 17 Destructive Wave, Incite Riot. -> info:NUMONLY:TABLE
- class `sub|Paladin/Oath of Slaughter|Oath of Slaughter Spells#5` 17 Destructive Wave, Incite Riot. -> info:NUMONLY:TABLE
- record `item|dmg|Sanctified Cannon#1` A Cannon (3d10 Bludgeoning, range 120/240 ft, Artillery, Booming, Two-Handed, Push mastery, uses Cannonballs). -> info:NUMONLY:ROLL
- class `item|dmg|Sanctified Cannon#1` A Cannon (3d10 Bludgeoning, range 120/240 ft, Artillery, Booming, Two-Handed, Push mastery, uses Cannonballs). -> info:NUMONLY:ROLL
- record `item|dmg|Spire of Conflux (Awakened)#6` When you cast a spell that deals bludgeoning, cold, fire, lightning or thunder damage and roll a 1 on a damage die, you  -> info:ACTIVE:TRIGGER
- class `item|dmg|Spire of Conflux (Awakened)#6` When you cast a spell that deals bludgeoning, cold, fire, lightning or thunder damage and roll a 1 on a damage die, you  -> info:ACTIVE:TRIGGER
- record `feat|Seraph Transformation: Stage 3|Seraph Transformation: Stage 3#11` You remove Corrupted by finishing a Short Rest or Long Rest in which you pray for at least 1 hour and burn holy incense  -> info:REST:NONUM
