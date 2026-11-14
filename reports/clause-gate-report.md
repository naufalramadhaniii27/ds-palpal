# Laporan clause gate (mode laporan, 2026-11-14)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 82585 |
| Kalimat mekanik (kelas kata kunci atau angka) | 42112 (51.0%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9115 |
| Info (tag terdokumentasi) | 27245 (SPELL_TEXT 7740, FORM:ACTIVATE 2973, NUMONLY:GEOMETRY 2530, FORM:ROLL 2146, ACTIVATE 1556, NUMONLY:TEXT 1482, FORM:TABLE 1214, NUMONLY:ROLL 1153, NUMONLY:TABLE 975, ACTIVE:TRIGGER 941, FXO_NULL 834, ACTIVE:OTHERS 761, REST:NONUM 668, BY_DESIGN 430, NUMONLY:FLAVOR 329, COND:PLAY_STATE 229, STD:ASI 225, NUMONLY:ZERO 175, ROLL:LAST_CHARGE 142, OBJECT:STATS 110, DC:REFERENCE 89, ITEM:SENSES 82, TABLE:CLASS 77, COND:ATTACK_ROLL_ADV 76, STD:PICK_TEXT 65, ACTIVE:REACTION 64, MOVE:SPEED_REF 62, ACTIVE:TIMED_IMM 44, TARGET:SPEED 36, FOCUS:SPELLCASTING 14, STD:AC10 9, KNOW:TARGET_DEFENSES 7, STD:SUBCLASS_PICK 5, POOL:SHARED 2) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5752 |
| Uncovered dengan angka | 3365 |
| Uncovered dengan kelas kata kunci mekanik | 5372 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 380 |
| Angka yang tidak dijelaskan record mana pun | 3158 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4908 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 263 |
| Waktu | muat data 14 s, analisis 15 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 188 ditangkap (62.9%). Hapus semua atom kelas yang dibutuhkan: 190 ditangkap (63.5%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 288 ditangkap (96.0%), semua atom kelas dihapus: 295 ditangkap (98.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3357 |
| GX | 1940 |
| wxs | 849 |
| LU_X | 652 |
| AUTO | 467 |
| CODE | 453 |
| species | 440 |
| ITEM_SPELLS | 370 |
| feat | 327 |
| SPELL_FX | 241 |
| cls | 154 |
| SAVE_NOTES | 81 |
| FXO | 56 |
| SPELLS | 37 |
| sub | 31 |
| FDMG | 17 |
| SP_AUTO | 12 |
| SUB_GRANT | 9 |
| CLS_AUTO | 7 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 242, fx-L4.js 195, fx-L12.js 154, fx-L2.js 142, fx-L1.js 137, fx-L3.js 135, fx-L10.js 127, fx-Z5.js 121, fx-L9.js 101, fx-N1.js 100, fx-L11.js 90, fx-Z3.js 87.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7506 | 975 | 13.0% |
| SPELL | 3208 | 868 | 27.1% |
| DMG | 4548 | 742 | 16.3% |
| SPEED | 1321 | 477 | 36.1% |
| ADV | 1750 | 454 | 25.9% |
| PROF | 1048 | 433 | 41.3% |
| CHOICE | 1598 | 401 | 25.1% |
| RES | 1294 | 388 | 30.0% |
| IMM | 953 | 347 | 36.4% |
| SLOT | 1330 | 341 | 25.6% |
| NUM | 8063 | 337 | 4.2% |
| DC | 2887 | 248 | 8.6% |
| DIS | 1073 | 247 | 23.0% |
| ATK | 1013 | 220 | 21.7% |
| SENSE | 599 | 194 | 32.4% |
| AC | 672 | 191 | 28.4% |
| SAVE | 280 | 142 | 50.7% |
| HP | 178 | 98 | 55.1% |
| NUM-DICE | 1446 | 69 | 4.8% |
| ABIL | 382 | 65 | 17.0% |
| INIT | 119 | 54 | 45.4% |
| NUM-DIST | 5100 | 38 | 0.7% |
| NUM-DUR | 3250 | 32 | 1.0% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1191 | 269 | 654 | 0 | 268 |
| feat | 2790 | 654 | 1455 | 0 | 681 |
| item | 19507 | 4954 | 11643 | 0 | 2910 |
| species | 1320 | 726 | 365 | 0 | 229 |
| spell | 8018 | 278 | 7740 | 0 | 0 |
| sub | 9286 | 2234 | 5388 | 0 | 1664 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10583 | 2715 | 6315 | 1553 | 14.7% |
| tvss | 2815 | 664 | 1643 | 508 | 18.0% |
| core | 1503 | 393 | 801 | 309 | 20.6% |
| tvss14 | 1211 | 180 | 749 | 282 | 23.3% |
| tsgs | 1483 | 379 | 857 | 247 | 16.7% |
| tsdm | 1074 | 281 | 600 | 193 | 18.0% |
| tkdm | 922 | 235 | 494 | 193 | 20.9% |
| tghp | 1117 | 374 | 560 | 183 | 16.4% |
| tdm14 | 645 | 127 | 378 | 140 | 21.7% |
| tua24 | 637 | 159 | 341 | 137 | 21.5% |
| egw | 566 | 141 | 289 | 136 | 24.0% |
| au | 536 | 107 | 311 | 118 | 22.0% |
| tce | 736 | 169 | 459 | 108 | 14.7% |
| tgh14p | 491 | 107 | 282 | 102 | 20.8% |
| tdcsr | 416 | 134 | 185 | 97 | 23.3% |
| twow | 544 | 167 | 283 | 94 | 17.3% |
| phb14 | 516 | 170 | 261 | 85 | 16.5% |
| thhw | 395 | 87 | 231 | 77 | 19.5% |
| dmg14 | 540 | 203 | 269 | 68 | 12.6% |
| tee24 | 464 | 166 | 232 | 66 | 14.2% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| rhw | 232 | 57 | 115 | 60 | 25.9% |
| hof | 253 | 40 | 155 | 58 | 22.9% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| tghg | 288 | 75 | 165 | 48 | 16.7% |
| misc14 | 327 | 80 | 200 | 47 | 14.4% |
| xge | 378 | 111 | 221 | 46 | 12.2% |
| coa | 158 | 49 | 65 | 44 | 27.8% |
| mot | 292 | 97 | 159 | 36 | 12.3% |
| tsgeh | 184 | 62 | 91 | 31 | 16.8% |
| bmt | 489 | 83 | 375 | 31 | 6.3% |
| tgh14c | 242 | 46 | 169 | 27 | 11.2% |
| bgg | 210 | 64 | 122 | 24 | 11.4% |
| ftd | 159 | 40 | 96 | 23 | 14.5% |
| skt | 118 | 25 | 73 | 20 | 16.9% |
| tsae | 65 | 22 | 24 | 19 | 29.2% |
| dsotdq | 83 | 17 | 48 | 18 | 21.7% |
| abh | 54 | 13 | 23 | 18 | 33.3% |
| bdd | 62 | 15 | 29 | 18 | 29.0% |
| idrotf | 134 | 28 | 88 | 18 | 13.4% |
| llk | 99 | 10 | 71 | 18 | 18.2% |
| wbtw | 92 | 20 | 56 | 16 | 17.4% |
| wdh | 95 | 23 | 56 | 16 | 16.8% |
| toa | 116 | 32 | 68 | 16 | 13.8% |
| wdmm | 79 | 13 | 50 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| psa | 67 | 28 | 24 | 15 | 22.4% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| frafi | 82 | 22 | 46 | 14 | 17.1% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
| vrgr | 86 | 23 | 51 | 12 | 14.0% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| erlw | 127 | 60 | 55 | 12 | 9.4% |
| ai | 164 | 32 | 120 | 12 | 7.3% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 27 | 71 | 12 | 10.9% |
| tsdd | 69 | 24 | 34 | 11 | 15.9% |
| bgdia | 114 | 28 | 75 | 11 | 9.6% |
| tshl | 69 | 20 | 39 | 10 | 14.5% |
| aag | 40 | 18 | 12 | 10 | 25.0% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| cos | 66 | 22 | 35 | 9 | 13.6% |
| pabtso | 69 | 25 | 35 | 9 | 13.0% |
| psk | 38 | 22 | 9 | 7 | 18.4% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| cm | 60 | 12 | 41 | 7 | 11.7% |
| mtf | 64 | 48 | 10 | 6 | 9.4% |
| tftyp | 71 | 24 | 41 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| tdcg | 12 | 4 | 5 | 3 | 25.0% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| efa | 28 | 11 | 15 | 2 | 7.1% |
| nf | 25 | 9 | 14 | 2 | 8.0% |
| imr | 186 | 6 | 178 | 2 | 1.1% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oota | 87 | 63 | 23 | 1 | 1.1% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 8018 | 278 | 7740 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 692 | 556 |
| SPELL | 620 | 90 |
| DMG | 547 | 502 |
| ADV | 447 | 152 |
| SPEED | 399 | 312 |
| PROF | 395 | 134 |
| NUM | 337 | 337 |
| SLOT | 323 | 106 |
| RES | 314 | 128 |
| CHOICE | 267 | 75 |
| IMM | 235 | 77 |
| DIS | 210 | 81 |
| AC | 191 | 158 |
| SENSE | 171 | 146 |
| ATK | 137 | 97 |
| SAVE | 136 | 118 |
| DC | 124 | 119 |
| HP | 98 | 72 |
| ABIL | 53 | 50 |
| NUM-DIST | 22 | 22 |
| NUM-DICE | 20 | 20 |
| INIT | 13 | 12 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (692 uncovered)

- `feat|Bloodlust|Bloodlust#7` You can use this a number of times equal to your Proficiency Bonus and regain all expended uses when you finish a Long Rest. | no record for RESOURCE; number pb unexplained
- `feat|Infernal Dragoon|Infernal Dragoon#13` You can cast it once per Long Rest without a spell slot, and when you do its duration is 8 hours. | no record for RESOURCE,SPELL; number 8 unexplained
- `item|ai|Living Loot Satchel#1` As a rank 2 hoardsperson, you are granted the use of a living loot satchel, which is an uncommon magic item. | number 2 no record explains
- `item|cm|Gloves of Soul Catching#3` After making a successful unarmed strike while wearing these gloves, you can use the gloves to deal an extra 2d10 force damage to the target, and you regain a number of hit points equal to the force damage dealt. | no record for DMG,RESOURCE; number 2d10 unexplained
- `item|dmg|+3 Bloodwell Vial#5` In addition, when you roll any Hit Dice to recover hit points while you are carrying the vial, you can regain 5 sorcery points. | number 5 no record explains
- `item|dmg|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|dmg|Fragment of Elder Starlight#5` Chosen living allies regain 4d6 Hit Points. | number 4d6 no record explains
- `item|dmg|Jewel of Three Prayers (Exalted)#12` - The jewel has 3 charges and regains all its expended charges daily at dawn. | no record for RESOURCE; number 3 unexplained
- `item|dmg|Manual of Clay Golems#5` To create a clay golem, you must spend 30 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | no record for RESOURCE; number 30,8 unexplained
- `item|dmg|Philosopher's Stone#4` Spend 1 hour (it can overlap a Short Rest) with resources of one kind (fish, gems, herbs, ore or stone, leather or hide, cloth) to turn them into another kind of equal value. | number 1 no record explains
- `item|dmg|Potion of Dragon's Breath (Uncommon)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|dmg|Spire of Conflux (Awakened)#4` 8 charges, regains 1d4 + 2 at dawn. | number 1d4,8 no record explains
- `item|dmg|Staff of Fate#9` On a roll of 10 or higher, the staff regains 1d6 of its expended charges. | no record for RESOURCE; number 1d6 unexplained
- `item|idrotf|Charm of the Ice Troll#2` You then regain Hit Points equal to half the cold damage you would have taken. | number half no record explains
- `item|nf|Arcane Battery#3` If that magic item normally regains expended charges daily, it immediately regains 1d4 + 1 expended charges, and the battery loses its magic. | number 1d4 no record explains
- `item|tdcsr|Cabal's Ruin (Exalted)#3` 4 charges, regains 1d4 at dawn. | number 1d4 no record explains
- `item|tdcsr|Spire of Conflux (Awakened)#4` 8 charges, regains 1d4 + 2 at dawn. | number 1d4,8 no record explains
- `item|tee24|Blast Disk (Common)#7` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tee24|Blast Disk (Rare)#6` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tghg|Dämglesvir (Adept)#8` When you take the Attack action, you can make one attack a sweeping strike against each creature of your choice in reach, a number of times equal to your Proficiency Bonus per Long Rest. | no record for CHOICE
- `item|toa|Charm of the Ghoul#2` You regain 3d8 + 3 hit points. | number 3d8 no record explains
- `item|tsgs|Knight's Standard of Vigor#5` Changing the flag takes 1 hour of focus, possible during a Short Rest. | no record for RESOURCE
- `item|tsgs|Signet Rings of the Fey Court#4` Each ring has 2 charges and regains all on a Long Rest. | number 2 no record explains
- `item|tsgs|Wildman's Spinning Cleaver#4` Once per turn when you make a ranged attack with it while Raging, make a second ranged attack as part of it against a different target within 10 ft of the first, even beyond long range, treated as the first target's rang | number 10 no record explains
- `item|wbtw|Pixie Dust#4` A small packet holds enough pixie dust for one use. | no record for RESOURCE; number 1 unexplained
- `species|Drow; Star Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | no record for RESOURCE; number 4 unexplained
- `species|Geppettin|Construct Nature#3` You finish a Long Rest in 4 hours of motionless rest while awake. | no record for RESOURCE; number 4 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#2` You can change the choice after a Long Rest, and no score can pass 20 this way. | no record for RESOURCE; number 20 unexplained
- `species|Vedalken|Partially Amphibious#1` You can breathe underwater for up to 1 hour, then not again until a Long Rest. | no record for RESOURCE
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Cleric/Pestilence Domain (2014)|Divine Strike#1` Once per turn when you hit with a weapon attack, you can deal extra 1d8 Poison damage (2d8 from level 14). | no record for DMG,RESOURCE; number 1d8,2d8 unexplained
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | no record for DC,RESOURCE; number 10 unexplained
- `sub|Fighter/Hell Knight|Infernal Wound#5` The wound lasts 1 minute, until the target regains Hit Points, or until the target or a creature within 5 feet takes an action to stanch it. | number 5,1 no record explains
- `sub|Jaeger/Marauder Chapter|Leap Attack#1` Once per turn, if you move more than 15 feet toward a creature, or fall 10 feet or more, right before a weapon attack against it, a hit deals extra damage equal to your Momentum die. | no record for DMG,RESOURCE; number 15,10 unexplained
- `sub|Monk/Warrior of Gravity|Plunging Strike#2` Once per turn when such a strike hits, it deals extra Bludgeoning damage of 1d6 per 10 ft fallen, up to 3d6. | no record for DMG,RESOURCE; number 1d6,3d6,10 unexplained
- `sub|Sorcerer/Serophage|Blood Fuel#1` Instead of moving, you can deal 1d4 Slashing damage to yourself and regain Sorcery Points equal to that damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Summoner/Bond of the Living Armament|Armament Eidolon#1` In a 1-hour ritual, which you can do during a Short or Long Rest, you bind your Eidolon to one Simple or Martial melee weapon and one suit of armor. | no record for RESOURCE; number 1 unexplained
- `sub|Vagabond/Digital Nomad|High Score#7` 15 points, Power-Up: regain a spent Battle Die, once per turn. | no record for RESOURCE; number 15 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#3` Add one monster ingredient (a whole corpse slain in the last 24 hours or kept by Gentle Repose) for a benefit until a Long Rest by type. | no record for RESOURCE; number 24 unexplained
- `sub|Wizard/Wand Wizard|Craft Wands#4` Charges equal the slot levels spent divided by the spell's level, plus 1. | no record for RESOURCE; number 1 unexplained

### SPELL (620 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Death Knight|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `feat|Cantrip Specialist|Cantrip Specialist#1` You learn two Warmage tricks from this list: Blasting Cantrip, Corrosive Cantrip, Draining Cantrip, Explosive Cantrip, Icy Cantrip, Severe Cantrip, Silent Cantrip, Static Cantrip. | no record for SPELL; number 2 unexplained
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spellblade (2014)|Spellblade (2014)#3` You learn two cantrips from Arc Blade, Burning Blade, Caustic Blade and Frigid Blade, using Intelligence. | no record for SPELL; number 2 unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|dmg|Helm of Telepathy#3` After you cast one of these two spells from the helm, that same spell can't be cast from the helm again until the next dawn. | number 2 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of the Rage Mage|Spellcasting#8` You know three 1st-level sorcerer spells, two of which are evocation or transmutation. | no record for SPELL; number 3,2 unexplained
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Temporal Trickster|Chrono-Master#1` You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. | no record for SPELL; number double,pb unexplained
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained
- `sub|Warden/Drake-Blooded|Spellcasting#3` You know two cantrips from the Sorcerer list. | number 2 no record explains
- `sub|Warlock/Hexblade Patron|Hexblade's Curse#4` When you cast a spell with a slot that curses a target, you can apply this curse to that target as part of the cast, and its duration is 1 minute or the spell's duration, whichever is longer. | number 1 no record explains
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained

### DMG (547 uncovered)

- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | no record for DMG; number 1d6 unexplained
- `feat|Beastman|Beastman#2` Your claws make unarmed strikes that deal 1d6 + your Strength modifier slashing damage. | no record for DMG; number 1d6 unexplained
- `feat|Beastperson|Beastperson#7` When you deal damage with it, you can deal Slashing damage equal to 1d6 plus your Strength or Dexterity modifier instead of the normal damage. | no record for DMG; number 1d6 unexplained
- `item|coa|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Ballistic Sledge#6` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Charm of the Creeping Hand#2` The attack deals an extra 1d10 Necrotic damage and you gain 5 temporary hit points. | no record for DMG; number 1d10,5 unexplained
- `item|dmg|Condemner (Awakened)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|dmg|Crosier of Divine Power#3` When you hit with it or heal with a spell or effect while holding it, spend 1 mote to add 2d6 to the damage (Radiant) or healing. | no record for DMG; number 2d6,1 unexplained
- `item|dmg|Fenthras (Awakened)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|dmg|Festerwood Masher#6` When the hammer hits an affected target, it takes an extra 1d4 Acid damage per -1 of AC penalty. | no record for DMG; number 1d4,1 unexplained
- `item|dmg|Grovelthrash (Exalted)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|dmg|Lash of Shadows (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Mace of the Black Crown (Exalted)#36` - The weapon's bonus to attack and damage rolls increases to +2, and the extra fire damage dealt by the weapon when it is ignited increases to 2d6. | no record for DMG; number 2d6,2 unexplained
- `item|dmg|Necklace of Fireballs#5` If you do, the Fireball's damage increases by 1d6 for every bead beyond the first, to a maximum of 12d6. | no record for DMG; number 1d6 unexplained
- `item|dmg|Silken Spite (Exalted)#15` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `item|dmg|Sword of Resonance#5` Your next hit with it before the end of your next turn deals an extra 1d6 Thunder damage. | number 1d6 no record explains
- `item|dmg|Talarith#2` While the reigar wears the talarith, any weapon wielded by the reigar deals an extra 1d6 force damage when it hits. | no record for DMG; number 1d6 unexplained
- `item|dmg|Visage of Delight and Disaster#9` When it hits with a weapon or Unarmed Strike, it can spend the die to deal extra Psychic damage equal to twice the roll. | no record for DMG; number double unexplained
- `item|dmg|Will of the Talon (Exalted)#43` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Grovelthrash (Awakened)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|egw|Lash of Shadows (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Ruin's Wake (Awakened)#12` - You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals an extra 1d8 piercing damage to any target it hits. | number 1d8,1 no record explains
- `item|egw|The Bloody End (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|tdcsr|Agony (Exalted)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | no record for DMG; number 1d6 unexplained
- `item|tdcsr|Fenthras (Awakened)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|tdcsr|Pyremaul (Exalted)#16` When you kill a creature with it, you can take 10d10 fire damage (it cannot be reduced) to turn the corpse and its non-magic gear to ash. | no record for DMG; number 10d10 unexplained
- `item|tee24|Grieving Tree#10` All Stunned creatures take 8d6 Piercing damage and half the total goes to the pool. | no record for DMG; number 8d6,half unexplained
- `item|tsdm|Arcane Warhead#9` Within a 10-mile-radius Sphere, each creature and object takes 10d10 + 200 Mega Radiant damage. | no record for DMG; number 10d10,10,200 unexplained
- `item|tsdm|Un's Codex#11` Fail: 4d6 Force damage and it is pushed to the nearest free space. | no record for DMG; number 4d6 unexplained
- `item|tsgs|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|tvss14|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `item|wdmm|Tearulai#24` Note: According to the SRD, it is an extra 4d6 slashing damage, although this is incorrect. | no record for DMG; number 4d6 unexplained
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | no record for DMG; number 1d6 unexplained
- `sub|Artificer/Battle Smith|Improved Defender#2` The extra damage and the healing of Arcane Jolt both rise to 4d6. | no record for DMG; number 4d6 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#3` On a fail it takes 1d6 Force damage and is pushed 10 ft in a horizontal direction you choose. | no record for DMG; number 1d6,10 unexplained
- `sub|Captain/Feylost|Fey Moods#18` When a creature damages you, the next time you hit it before the end of your next turn, it takes an extra 1d8 Force damage. | no record for DMG; number 1d8 unexplained
- `sub|Craftsman/Scrappers' Guild|Overdesigned Scrap#3` When it would break, you can instead lower its damage die by one step (minimum 1d4). | no record for DMG; number 1d4 unexplained
- `sub|Investigator/Inquisitor|Divine Strike#1` Once on each of your turns, when you take the Attack action and hit a creature with a weapon, it takes an extra 1d8 Necrotic or Radiant damage (your choice). | no record for DMG; number 1d8 unexplained
- `sub|Paladin/Oath of Revelry|Aura of Fraternity#1` While at least one ally is adjacent to you, you and each ally within 5 ft deal extra 1d4 damage on melee attacks. | no record for DMG; number 1d4,5 unexplained

### ADV (447 uncovered)

- `class|Rogue|Sneak Attack#2` Once per turn, if you have Advantage on an attack roll that uses a Finesse or Ranged weapon and the attack hits a creature, you can deal an extra 1d6 damage to that creature. | no record for ADV
- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | no record for ADV,INIT; number 1 unexplained
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `item|au|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|au|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|Medal of Wit#2` Doing so gives you advantage on Intelligence checks and Intelligence saving throws for 1 hour. | no record for ADV
- `item|dmg|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,RESOURCE,SPEED; number 30,1 unexplained
- `item|egw|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tgh14p|Stalk Symbiote#3` While attuned you have Advantage on Wisdom (Perception) checks, and you and allies within 30 ft cannot be surprised unless incapacitated by something other than nonmagical sleep. | no record for ADV; number 30 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tghg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|tvss14|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain|Invoke Duplicity#10` If you and your illusion are both within 5 feet of a creature able to see the illusion, the illusion distracts that creature so much that you have Advantage on attack rolls against it. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Fighter/Corsair|Surprise Attack#1` Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. | no record for ADV,DMG,RESOURCE; number 1d6 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | number 1,0 no record explains
- `sub|Paladin/Oath of Vengeance|Vow of Enmity#2` Your attack rolls against that creature have Advantage, which lasts 1 minute or ends sooner if you use this feature again. | number 1 no record explains
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE
- `sub|Witch/Fragrant Magic|Aromamancy#8` For 1 hour you have Advantage on Charisma checks to influence a creature within 5 feet of you. | no record for ADV; number 5,1 unexplained

### SPEED (399 uncovered)

- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | no record for SPEED; number 0 unexplained
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | no record for SPEED; number 0 unexplained
- `feat|Fey Sentinel|Fey Sentinel#8` When you take the Dash action, you can forgo the extra movement and instead teleport to an unoccupied space you can see within half your Speed. | no record for SPEED; number half unexplained
- `feat|Lordly Resolve|Lordly Resolve#5` Each target can immediately use a Reaction to right itself and end the Prone condition, provided its Speed isn't 0. | no record for SPEED; number 0 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `item|dmg14|Quaal's Feather Token, Fan#6` The fan floats and creates a wind strong enough to fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. | no record for SPEED; number 5,8 unexplained
- `item|dmg|Aviana's Feather#2` Magic action: grow golden wings that give a Fly Speed of 80 feet. | no record for SPEED; number 80 unexplained
- `item|dmg|Couatl Herald's Fang#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Dekella, Bident of Thassa#22` Additionally, you can cast the dominate monster spell (save DC 18) from the bident, but only on beasts and monstrosities that have an innate swimming speed. | no record for SPEED
- `item|dmg|Figurine of Wondrous Power (ebony fly)#18` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Mechanical Wonder (Gyrocopter)#11` The gyrocopter wonder is a Huge object that weighs 500 pounds and has the following statistics: AC 14, HP 50, Speed 5 ft., and Fly Speed 20 ft. The gyrocopter can bear up to 2,000 pounds of cargo; if it bears any more th | no record for SPEED; number 5,20,14,50 unexplained
- `item|dmg|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Potion of Aqueous Form#5` You have a swimming speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Quaal's Feather Token, Fan#6` The fan floats and creates a wind strong enough to fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. | no record for SPEED; number 5,8 unexplained
- `item|dmg|Ring of Anchoring#6` On a fail the arm is immobile for 1 minute, your Speed is 0, and you are dragged 30 ft down at the start of each turn. | no record for SPEED; number 30,1,0 unexplained
- `item|dmg|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg|Thuranni Cloak#3` The effect pauses until your next turn starts when you take damage, and while your Speed is 0. | no record for SPEED; number 0 unexplained
- `item|dmg|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for RESOURCE,SPEED; number 2d4,2,half unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for RESOURCE,SPEED; number 1 unexplained
- `item|dmg|Wavebender's Leiomano#4` Rowing a waterborne vehicle with it adds 5 ft Speed (1/2 mile per hour) for each such oar used. | no record for SPEED; number 5,2,1 unexplained
- `item|llk|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|pota|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|tdm14|Ring of Spacewalking#2` In zero gravity you can fly at a speed of 15 ft. | number 15 no record explains
- `item|tsdm|Hoverboard#3` While riding it, your Speed rises by 10 ft, you ignore Difficult Terrain, and you can cross liquids without sinking. | no record for SPEED; number 10 unexplained
- `item|tsgs|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `item|wbtw|Pixie Dust#2` The recipient gains a flying speed of 30 feet and the ability to hover for 1 minute. | no record for SPEED; number 30,1 unexplained
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | number 10 no record explains
- `species|Siren|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Spring Mandrake|Sprightly Movement#1` Your walking Speed rises by 5 feet. | no record for SPEED; number 5 unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Craftsman/Mechanauts' Guild|Magitech Upgrade#14` Until the end of your turn, the apparatus's Speed doubles, it has a Fly Speed equal to its Speed, and you can attack three times when you take the Attack action with it. | no record for SPEED; number 3,double unexplained
- `sub|Druid/Circle of Mutation|Mutate Shape#9` Fly Speed 30 ft. 2 more points make it 60 ft. Darkvision (1). | no record for SENSE,SPEED; number 30,60,2,1 unexplained
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | no record for RESOURCE,SPEED; number 10,half unexplained
- `sub|Necromancer/Black Rider|Gruesome Charge#2` Each of those thralls has a Speed of 60 feet for 10 minutes. | no record for SPEED; number 60 unexplained
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#7` Your only movement is a 60 ft Fly Speed, and you can hover. | no record for SPEED; number 60 unexplained
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained
- `sub|Wizard/Transmuter|Transmuter's Stone#10` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained

### PROF (395 uncovered)

- `class|Investigator|Expertise~2#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#1` You gain proficiency with four simple or martial firearms and can use them as spellcasting focuses. | number 4 no record explains
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tdm14|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tee24|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|thhw|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Sorcerer/Reincarnated Hero|Armored Sorcery#1` You gain proficiency with light armor, medium armor, shields and four martial weapons of your choice. | no record for CHOICE,PROF; number 4 unexplained
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | no record for PROF; number 5,6 unexplained

### NUM (337 uncovered)

- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | number 2 no record explains
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | number 2 no record explains
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | number 2,1 no record explains
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Poisoner|Poisoner#2` Pick Dexterity or Intelligence and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | number 20 no record explains
- `feat|Ritual Caster|Ritual Caster#2` Pick Intelligence, Wisdom, or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `item|bgg|Prehistoric Figurine of Wondrous Power, Jasper Tyrannosaurus Rex#16` On a 1, you lose control of the figurine, and it becomes hostile to you and your companions until it is reduced to 0 hit points, at which point it reverts to figurine form. | number 0 no record explains
- `item|coa|Accounting and Valuation of All Things#7` - 1 major detrimental property | number 1 no record explains
- `item|coa|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | number 1 no record explains
- `item|dmg14|Ioun Stone, Mastery#8` Your proficiency bonus increases by 1 while this pale green prism orbits your head. | number pb no record explains
- `item|dmg|Blade of Avernus#9` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Crown of Lies#13` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Crown of Lies#14` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Figurine of Wondrous Power#29` Challenge Rating 0 (0 experience points, Proficiency Bonus +2). | number 0,2,pb no record explains
- `item|dmg|Gloves of Swimming and Climbing#2` You also gain a +5 bonus to any Strength (Athletics) check you make to climb or to swim. | number 5 no record explains
- `item|dmg|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|dmg|Keystone of Creation#4` - 1 minor beneficial property | number 1 no record explains
- `item|dmg|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | number 2d4,10,2 no record explains
- `item|dmg|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|dmg|Scourge of Shadow#13` - 1 major detrimental property | number 1 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | number 1,2 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|llk|Deck of Several Things#45` You take a -1 penalty on saving throws for the duration of the adventure. | number 1 no record explains
- `item|misc14|Crown of Lies#14` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tee24|Grieving Tree#4` When a prisoner would be left at 0 Hit Points alive, it heals 1d4 + 1 from the pool. | number 1d4,1 no record explains
- `item|tsgs|Bag of Sundrops#1` A bag holding 1d6 + 4 glowing golden orbs. | number 1d6,4 no record explains
- `item|tsgs|Dragon's Call#2` You also get +1 to Intelligence, Wisdom and Charisma checks about dragon lore. | number 1 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|tsgs|Tote of Tricky Treat Sugarbombs#1` A canvas bag holding 5d8 + 10 clove and pumpkin candies, with an illusory face on its pumpkin at night. | number 5d8,10 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#2` You and your allies inside get +5 on Dexterity (Stealth) and Wisdom (Perception) checks, and flames inside cannot be seen from outside. | number 5 no record explains
- `sub|Druid/Circle of Mutation (2014)|Mutate Shape#7` Multiattack: 2 + 2 x the form's CR points, to make two natural weapon attacks with an action. | number 2 no record explains
- `sub|Druid/Circle of the Shepherd|Faithful Summons#2` It summons four beasts of CR 2 or lower within 20 feet. | number 20,4 no record explains
- `sub|Sorcerer/Ancestral Sorcery|Ancestor's Lore#1` Add your Charisma modifier (min +1) to your Intelligence checks. | number 1 no record explains
- `sub|Warmage/Coalition Arcanist|Tactical Uplink#3` You also get +5 to your Passive Wisdom (Perception). | number 5 no record explains

### SLOT (323 uncovered)

- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | no record for DMG,SLOT,SPELL; number 1d4 unexplained
- `item|dmg14|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Druid/Circle of the Titan|Titan Form#12` If already Prone it takes 1d10 Bludgeoning per slot level. | no record for SLOT; number 1d10 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Primordial Archer|Witching Arrows#2` Listed damage rises by 2d6 per slot level above 1. | no record for DMG,SLOT; number 2d6,1 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Sorcerer/Mirrorkin|Copycat#1` As an action, perform any action a humanoid other than you performed within the last minute, if you see it within 60 ft. You ignore the usual prerequisites, such as a holy symbol, ki points or consumed items, but a spell | no record for SLOT; number 60 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### RES (314 uncovered)

- `feat|Bandit Cunning|Bandit Cunning#6` If you meet DC 10 plus its challenge rating, you learn one fact of your choice about its combat abilities: a damage resistance or immunity, a condition immunity, a special ability that deals or prevents damage, an attack | no record for CHOICE,DC,IMM,RES; number 10 unexplained
- `feat|Seraph Transformation: Level 4|Seraph Transformation: Level 4#10` When you roll a natural 1 on a save against a magical spell or ability, you take 1d6 Force damage per two class levels, ignoring resistance and immunity. | no record for DMG,IMM,RES; number 1d6,1,2 unexplained
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES,RESOURCE; number 1 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|dmg|Stormgirdle (Awakened)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|egw|Stormgirdle (Awakened)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES,RESOURCE; number 1 unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|tsgs|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|tvss14|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | no record for RES,SLOT; number 1d6 unexplained
- `sub|Jaeger/Heretic Chapter|Darkness Within#3` You are Heavily Obscured, gain a Fly Speed of 30 feet, and have Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES,SPEED; number 30 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of Winter|Channel Divinity#4` Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. | no record for RES; number 0 unexplained
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | no record for RES; number 10 unexplained
- `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#1` Spells always prepared from the listed Sorcerer levels: 3 Command, Guidance, Locate Object, Protection from Evil and Good, Resistance, Spiritual Weapon. | no record for RES; number 3 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Elemental Essence|Elemental Soul#5` You can enter hostile creatures' spaces, move through gaps 1 inch wide, ignore Strong Wind and have Resistance to nonmagical Bludgeoning, Piercing and Slashing damage. | number 1 no record explains
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Sorcerer/Haunted Sorcery|Become Death#3` While you hold them: Resistance to all damage, Fly Speed 30 ft with Hover, and you move through occupied spaces as Difficult Terrain (if your turn ends in one, you are moved to the last free space). | no record for RES,SPEED; number 30 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained

### CHOICE (267 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Skilled|Skilled#1` Pick three skills or tools, in any mix. | no record for CHOICE; number 3 unexplained
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (110)

- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | angka: 10
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Shaman|Relentless Rage#4` Every use of this feature after the first raises the DC by 5. | angka: 5
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb
- `class|Captain|Cohort~4#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Warden|Sentinel's Stand#9` While you hold a Shield, its AC bonus is +3 instead of +2. | angka: 3,2
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Captain|Cohort~2#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Barbarian|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Warden|Sentinel's Strike#8` It takes Bludgeoning damage equal to 1d8 plus the Shield's AC bonus. | angka: 1d8
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Demon Hunter|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Warmage|Arcane Surge Improvement#1` You gain one additional use of Arcane Surge, for a total of three. | angka: 3
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Martyr|Divine Respite~2#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | angka: 2
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | angka: 1
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | angka: 2
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | angka: 6
- `class|Investigator|Finisher#2` The extra damage is 1d8 at level 2, 2d8 at level 11, and 3d8 at level 17. | angka: 1d8
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | angka: 3
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Evoker|Font of Magic#13` The highest slot level you can create is 5. | angka: 5

### feat (244)

- `feat|Mul|Mul#7` Your hit point maximum rises by 1, and by 1 more each time you gain a level. | angka: 1
- `feat|Shadowsteel Master|Shadowsteel Master#6` If your Shadowsteel Focus is also a weapon, its bonus to attack rolls and damage rolls is +2. | angka: 2
- `feat|Exomorph|Exomorph#2` While you have all your Hit Points, you gain a +2 bonus to AC. | angka: 2
- `feat|Laser Swordmaster|Laser Swordmaster#2` While you wield an antimatter dagger, laser halfsword or laser sword you are proficient with, and a creature hits you with a ranged blaster attack or one of those weapons, you can use your reaction to | angka: pb
- `feat|Fists of Fury|Fists of Fury#5` When you deal damage to a creature with an Unarmed Strike, add +1 to the damage roll for each earlier melee attack roll that hit that creature in the same turn. | angka: 1
- `feat|Ember of the Fire Giant|Ember of the Fire Giant#9` Each creature of your choice in a 15-foot-radius sphere centered on you makes a Dexterity saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 15,8,pb
- `feat|Crossbow Expert|Crossbow Expert#2` Your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | angka: 30
- `feat|Upgraded|Upgraded#4` As a Magic action, you can swap your Thermalsight for Blindsight with a range of 10 feet or Darkvision with a range of 120 feet. | angka: 10,120
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | angka: pb
- `feat|Defensive Duelist|Defensive Duelist#4` When another creature hits you with a melee attack while you hold a Finesse weapon, you can use a Reaction to raise your Armor Class by an amount equal to your Proficiency Bonus, which might make the  | angka: pb
- `feat|Grendel|Grendel#9` On your first turn in combat, you add your Proficiency Bonus to attack rolls, ability checks and saving throws. | angka: pb
- `feat|Vampire Transformation: Stage 4|Vampire Transformation: Stage 4#4` At the start of your turn you regain 15 Hit Points if you have at least 1 but fewer than 60 Hit Points. | angka: 15,60
- `feat|Inventor|Inventor#8` If a Gadget requires a saving throw, the DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | angka: 20
- `feat|Living Shadow|Living Shadow#8` Right after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 20
- `feat|Primordial Transformation: Stage 2|Primordial Transformation: Stage 2#10` On a failure your Primordial nature shows, and you have Disadvantage on every D20 Test for 1 minute while you fight for control. | angka: 1d20
- `feat|Knight of the Sword|Knight of the Sword#7` It makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | angka: 3
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | angka: 2
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | angka: 4
- `feat|Fury of the Frost Giant|Fury of the Frost Giant#9` It makes a Constitution saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Martial Adept|Martial Adept#2` A maneuver that forces a saving throw has a DC of 8 + your Proficiency Bonus + your Strength or Dexterity modifier (your choice). | angka: 8,pb
- `feat|Boon of Irresistible Offense|Boon of Irresistible Offense#2` Add 1 to your Strength or Dexterity score (maximum 30). | angka: 1,30
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Greater Mark of Storm|Greater Mark of Storm#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Hulking Figure (GH14C)|Hulking Figure (GH14C)#4` When you hit with a melee attack made with your Strength modifier, you deal 1d4 extra damage of the weapon's type. | angka: 1d4

### item (1917)

- `item|dmg|Charm of Cold Resistance#1` As an action, give yourself resistance to Cold damage for 24 hours. | angka: 24
- `item|dmg|Rod of Lordly Might#11` Button 3: the flanged head folds away, a spearhead springs from the tip, and the handle extends into a haft 6 feet long, turning the rod into a magic Spear; attack rolls and damage rolls made with it  | angka: 6,3
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affe | angka: 60,1,2
- `item|cos|Blood Spear#6` Any creature can wield the spear, but only the character 15 to wield it gains a +2 bonus to attack and damage rolls made with this magic weapon. | angka: 15
- `item|dmg|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | angka: 10,pb
- `item|dmg|Heart of Steel#3` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | angka: 4
- `item|thhw|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a + | angka: 60,7
- `item|bgdia|Shatterstick#3` When the effects ends, the shatterstick breaks apart, becoming useless, and all structures within 20 feet of it take 35 (10d6) bludgeoning damage. | angka: 10d6,20,35
- `item|coa|Wrought-Iron Tower#15` When you make an attack, you may spend 1 or more charges. | angka: 1
- `item|egw|Grovelthrash (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | angka: 1
- `item|tsgs|Wavebender's Leiomano#4` Rowing a waterborne vehicle with it adds 5 ft Speed (1/2 mile per hour) for each such oar used. | angka: 5,2,1
- `item|dmg|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | angka: 1d20,10
- `item|dmg|Keystone of Creation#5` - 1 beneficial manifestation | angka: 1
- `item|tee24|Quiver of Energy#2` The first time each turn you hit with a weapon attack using ammunition from this quiver, it deals an extra 1d6 damage of that type. | angka: 1d6
- `item|dmg|Orrery of the Wanderer#31` As long as the orrery is within 30 feet of you, you gain a +1 bonus to AC. | angka: 30
- `item|dmg|Doom Gauntlet#4` When you hit with it you can spend the charge to deal an extra 1d4 mega (1d4 x 100) Force damage. | angka: 1d4,100
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | angka: 0
- `item|tvss14|Bedroll of Rest#3` After sleeping in it you need no rest for 48 hours, though you can still take a Long Rest in that time. | angka: 48
- `item|bgdia|Helm of Devil Command#10` The helm regains all its charges 24 hours after its last charge is expended. | angka: 24
- `item|tdm14|Thaumatonic Rifle, +3#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +3 bonus to attack and damage rolls. | angka: 2d6,80,320
- `item|dmg|Trident of Fish Command#3` While you carry the trident, spending 1 charge lets you cast Dominate Beast (save DC 15) from it, and the target must be a Beast that has a Swim Speed. | angka: 1
- `item|thhw|Potion of Rest#2` Drink it before a short or long rest and you wake with 1d10 + 5 Temporary Hit Points and with one level of exhaustion removed. | angka: 1d10,5
- `item|tsdm|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | angka: 1,2
- `item|dmg|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | angka: 5
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | angka: 8
- `item|dmg|Arrow of Glue#2` Fire it at any point you can see in range to cover a 1-ft square with hardened glue (the GM may give Disadvantage on hard shots). | angka: 1
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | angka: 2
- `item|dmg|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | angka: 1d10
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | angka: 1
- `item|dmg|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | angka: 1d4,2d4

### species (124)

- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Cervan|Surge of Vigor#1` When one attack deals more than half of your current Hit Points in damage (even if it drops you to 0), you regain 1d12 + Constitution modifier Hit Points right away. | angka: 1d12,0,half
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage  | angka: 5
- `species|Nautilid (DM14)|Aqua Suit#6` While you wear it, your AC is 13 + your Dexterity modifier, and other armor can be fitted around it at no cost. | angka: 13
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | angka: 3
- `species|Elf (Fey)|Elven Lineage (Fey)#5` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Fey; Star Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | angka: 1d6
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Geppettin|Construct Nature#3` You finish a Long Rest in 4 hours of motionless rest while awake. | angka: 4
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | angka: 1,2
- `species|Elf (Mark of Shadow)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | angka: 1,2
- `species|Mechagnome|Sentry's Rest#2` You finish a Long Rest in 6 hours of inactive, motionless rest while staying conscious. | angka: 6
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Forsaken|Everlasting#3` You finish a Long Rest in 4 hours of inactive, motionless rest while staying conscious. | angka: 4
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Tauren|Tauren Lineage#2` Any save DC from it equals 8 + Proficiency Bonus + your Strength, Constitution or Wisdom modifier, chosen with the lineage. | angka: 8,pb
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Autumn Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Eladrin (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Kaladesh Elf (Bishatar and Tirahar)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4

### sub (763)

- `sub|Cleric/Speed Domain|Channel Divinity: Burst of Speed#2` Its base Speed rises by 10 ft. It also gains the benefit of the bless spell, but only on Dexterity-based attack rolls and saving throws. | angka: 10
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Wizard/Chronurgy Magic|Momentary Stasis#4` While encased it is Incapacitated with Speed 0. | angka: 0
- `sub|Cleric/Community Domain|Paragon of the People#1` Community Watch adds another 1d6 and also gives immunity to fear while it lasts. | angka: 1d6
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | angka: 5,2
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | angka: 1
- `sub|Druid/Circle of Mutation|Mutate Shape#14` Blindsight 30 ft while not Deafened. | angka: 30
- `sub|Paladin/Oath of Glory|Peerless Athlete#2` For 1 hour, you have Advantage on Dexterity (Acrobatics) and Strength (Athletics) checks, and your Long Jumps and High Jumps each reach 10 feet farther. | angka: 10,1
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | angka: 10
- `sub|Warlock/Star Patron|Supernova#3` Searing Radiance: treat any 1, 2 or 3 on the Nova extra-damage dice as a 4. | angka: 1,2,3,4
- `sub|Alchemist/Mutagenist|Mutated Blood#2` That score increases by 2, to a maximum of 22. | angka: 2
- `sub|Captain/Gourmand|Gourmet Ingredients#6` One ability score of its choice increases by 2, to a maximum of 22. | angka: 2
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | angka: 24
- `sub|Barbarian/Path of the Juggernaut|Demolishing Might#1` Your melee weapon attacks deal an extra 1d8 to constructs and double damage to objects and structures. | angka: 1d8,double
- `sub|Ranger/Green Reaper|Toxic Tradecraft#9` Slot level 4+: Flesh Eating (Poisoned for 1 minute and takes 2d6 Acid damage at the start of each turn), Insensate (also Blinded and Deafened), Paraplegia (Speed 0 and Disadvantage on Dexterity saves) | angka: 2d6,1,0
- `sub|Martyr/Burden of Awakening|Prescient Strike#1` Once per turn, when you roll an 18 or 19 on the d20 for an attack, treat it as a 20. | angka: 1d20,19,20
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | angka: 2
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | angka: 30
- `sub|Vagabond/Gourmand|Monster Meal#24` Blindsight with a range of 10 feet. | angka: 10
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | angka: 1d6,6
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage | angka: 5d6,1
- `sub|Monk/Way of the Astral Self|Awakened Astral Self#5` When you would attack twice with Extra Attack, you can attack three times if all attacks use the astral arms. | angka: 3,double
- `sub|Barbarian/Path of the Muscle Wizard|"Spells"#4` Magic Missile: action, three ranged attacks with Dart, Dagger or similar Thrown weapons using Strength, with Advantage. | angka: 3
- `sub|Martyr/Burden of Discord|Coin of Chaos#3` It is +4 on heads and +1 on tails. | angka: 4
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | angka: 8
- `sub|Barbarian/Path of Wild Magic|Bolstering Magic#3` For 10 minutes the creature rolls 1d3 and adds it to every attack roll and ability check. | angka: 1d3,10
- `sub|Monk/Warrior of Venom|Toxic Blood#1` When a creature hits you with a melee attack roll, the attacker takes 1d6 Poison damage. | angka: 1d6
- `sub|Investigator/Decommissioner|Reprogrammer#6` Sleep Mode: it is Unconscious for 1 minute even if normally immune, ending early if it takes damage. | angka: 1
- `sub|Sorcerer/Shadow Magic|Umbral Form#2` You have Resistance to all damage except Force and Radiant, and you move through creatures and objects as Difficult Terrain, taking 5 Force damage if you end your turn inside an object. | angka: 5
- `sub|Alchemist/Pigmentist|Splatter Bombs#5` The extra damage of your Magical Pigments becomes 1d8. | angka: 1d8

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `feat|Fey Transformation: Stage 2|Fey Transformation: Stage 2#3` You also gain the Stage 2 Flaw. -> info:NUMONLY:TABLE
- class `feat|Fey Transformation: Stage 2|Fey Transformation: Stage 2#3` You also gain the Stage 2 Flaw. -> info:NUMONLY:TABLE
- class `item|dmg|Ruby Rod of Asmodeus#3` All damage dealt with it is converted to necrotic, and when you hit a good aligned creature, that creature takes an extr -> info:ACTIVE:TRIGGER
- record `sub|Captain/Holy Icon|Raise Cohort#3` After you use this, you cannot use it again until you finish a Long Rest. -> covered
- class `sub|Captain/Holy Icon|Raise Cohort#3` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Investigator/Time Operative|Borrowed Time#3` You have 2 uses. -> covered
- record `feat|Fey Transformation: Level 4|Fey Transformation: Level 4#2` Choose one Boon from the list. -> info:BY_DESIGN
- class `feat|Fey Transformation: Level 4|Fey Transformation: Level 4#2` Choose one Boon from the list. -> info:BY_DESIGN
- record `class|Barbarian|Rage#4` Finishing a Short Rest restores one expended use, and finishing a Long Rest restores all of them. -> covered
- class `class|Barbarian|Rage#4` Finishing a Short Rest restores one expended use, and finishing a Long Rest restores all of them. -> info:REST:NONUM
- record `item|dmg|Horn of the Endless Maze#5` Once you use the horn, it can't be used again until 7 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Horn of the Endless Maze#5` Once you use the horn, it can't be used again until 7 days have passed. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Gauntlets of Ogre Power#1` While you wear these gauntlets, your Strength score is 19. -> info:NUMONLY:TEXT
- class `item|dmg|Gauntlets of Ogre Power#1` While you wear these gauntlets, your Strength score is 19. -> info:NUMONLY:TEXT
- record `item|dmg|Keranos's Votary#3` After using this, you must finish a long rest to use it again. -> info:REST:NONUM
- class `item|dmg|Keranos's Votary#3` After using this, you must finish a long rest to use it again. -> info:REST:NONUM
- record `sub|Wizard/Necromancer|Death's Master#5` After you use this, you must finish a Long Rest before using it again. -> covered
- class `sub|Wizard/Necromancer|Death's Master#5` After you use this, you must finish a Long Rest before using it again. -> info:REST:NONUM
- record `sub|Summoner/Bond of the Dragon Herald|Dragon Eidolon#25` A Short Rest restores one use and a Long Rest restores all. -> covered
- record `item|dmg|Scourge of Shadow#22` You're protected by a field of shadow that makes you resistant to radiant and necrotic damage. -> covered
- record `item|bgg|Ring of Amity#4` You can bond with a different creature whenever you finish a long rest, provided that you can touch the creature and the -> info:REST:NONUM
- class `item|bgg|Ring of Amity#4` You can bond with a different creature whenever you finish a long rest, provided that you can touch the creature and the -> info:REST:NONUM
- record `item|dmg|Storm Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- class `item|dmg|Storm Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- record `item|tee24|Houseward (Legendary)#2` A 1-cubic-foot lead block with a Siberys dragonshard, usually set into a floor. -> info:NUMONLY:FLAVOR
- class `item|tee24|Houseward (Legendary)#2` A 1-cubic-foot lead block with a Siberys dragonshard, usually set into a floor. -> info:NUMONLY:FLAVOR
- record `sub|Barbarian/Path of the Swamp|Primal Magic#4` Each returns on a Long Rest. -> covered
- class `sub|Barbarian/Path of the Swamp|Primal Magic#4` Each returns on a Long Rest. -> info:REST:NONUM
- record `sub|Craftsman/Mechanauts' Guild|Magitech Upgrade#2` After a Long Rest, you can swap it for another. -> covered
- class `sub|Craftsman/Mechanauts' Guild|Magitech Upgrade#2` After a Long Rest, you can swap it for another. -> info:REST:NONUM
