# Laporan clause gate (mode laporan, 2026-11-05)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73237 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36781 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 7021 |
| Info (tag terdokumentasi) | 23614 (SPELL_TEXT 6470, FORM:ACTIVATE 2576, NUMONLY:GEOMETRY 2234, FORM:ROLL 1885, FXO_NULL 1384, NUMONLY:TEXT 1352, ACTIVATE 1309, NUMONLY:ROLL 1007, FORM:TABLE 916, NUMONLY:TABLE 868, ACTIVE:TRIGGER 806, ACTIVE:OTHERS 674, REST:NONUM 646, NUMONLY:FLAVOR 305, COND:PLAY_STATE 205, STD:ASI 195, NUMONLY:ZERO 162, OBJECT:STATS 106, BY_DESIGN 87, ITEM:SENSES 82, COND:ATTACK_ROLL_ADV 80, DC:REFERENCE 73, TABLE:CLASS 70, ACTIVE:REACTION 56, ACTIVE:TIMED_IMM 43, STD:SUBCLASS_PICK 16, STD:AC10 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6146 |
| Uncovered dengan angka | 3698 |
| Uncovered dengan kelas kata kunci mekanik | 5783 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 363 |
| Angka yang tidak dijelaskan record mana pun | 3493 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5217 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 329 |
| Waktu | muat data 7 s, analisis 9 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 163 ditangkap (54.7%). Hapus semua atom kelas yang dibutuhkan: 165 ditangkap (55.4%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 298 ditangkap (99.3%), semua atom kelas dihapus: 300 ditangkap (100.0%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 2832 |
| GX | 1509 |
| wxs | 658 |
| LU_X | 535 |
| species | 355 |
| ITEM_SPELLS | 343 |
| AUTO | 315 |
| SPELL_FX | 241 |
| feat | 178 |
| cls | 133 |
| SAVE_NOTES | 74 |
| FXO | 48 |
| SPELLS | 37 |
| FDMG | 15 |
| calcNote | 15 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 207, fx-L4.js 165, fx-L12.js 138, fx-L3.js 129, fx-L2.js 127, fx-L10.js 117, fx-L1.js 111, fx-N1.js 97, fx-L9.js 94, fx-L6.js 86, fx-L11.js 83, fx-L8.js 64.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 1305 | 19.6% |
| SPELL | 2882 | 841 | 29.2% |
| DMG | 3912 | 785 | 20.1% |
| PROF | 883 | 562 | 63.6% |
| SPEED | 1137 | 518 | 45.6% |
| ADV | 1516 | 426 | 28.1% |
| RES | 1123 | 408 | 36.3% |
| CHOICE | 1344 | 403 | 30.0% |
| NUM | 7110 | 324 | 4.6% |
| IMM | 852 | 322 | 37.8% |
| SLOT | 1121 | 322 | 28.7% |
| DC | 2624 | 282 | 10.7% |
| ATK | 860 | 229 | 26.6% |
| DIS | 932 | 214 | 23.0% |
| AC | 593 | 166 | 28.0% |
| SENSE | 515 | 165 | 32.0% |
| SAVE | 272 | 155 | 57.0% |
| HP | 143 | 86 | 60.1% |
| ABIL | 357 | 75 | 21.0% |
| NUM-DICE | 1262 | 71 | 5.6% |
| INIT | 111 | 57 | 51.4% |
| NUM-DUR | 2748 | 34 | 1.2% |
| NUM-DIST | 4404 | 30 | 0.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1027 | 237 | 533 | 0 | 257 |
| feat | 2101 | 418 | 1046 | 0 | 637 |
| item | 18391 | 3872 | 11034 | 0 | 3485 |
| species | 1037 | 572 | 291 | 0 | 174 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1644 | 4240 | 0 | 1593 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2131 | 6097 | 1923 | 18.9% |
| tvss | 2815 | 618 | 1651 | 546 | 19.4% |
| core | 1502 | 332 | 760 | 410 | 27.3% |
| tsgs | 1483 | 362 | 837 | 284 | 19.2% |
| tsdm | 1222 | 284 | 673 | 265 | 21.7% |
| tkdm | 919 | 179 | 493 | 247 | 26.9% |
| tghp | 1117 | 347 | 558 | 212 | 19.0% |
| tce | 736 | 113 | 461 | 162 | 22.0% |
| au | 536 | 94 | 286 | 156 | 29.1% |
| egw | 566 | 131 | 295 | 140 | 24.7% |
| phb14 | 516 | 121 | 274 | 121 | 23.4% |
| tee24 | 464 | 130 | 217 | 117 | 25.2% |
| dmg14 | 540 | 143 | 287 | 110 | 20.4% |
| tdcsr | 416 | 121 | 190 | 105 | 25.2% |
| thhw | 395 | 74 | 236 | 85 | 21.5% |
| xge | 375 | 85 | 211 | 79 | 21.1% |
| hof | 253 | 31 | 147 | 75 | 29.6% |
| rhw | 232 | 49 | 116 | 67 | 28.9% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| misc14 | 327 | 52 | 218 | 57 | 17.4% |
| tghg | 288 | 69 | 163 | 56 | 19.4% |
| coa | 158 | 36 | 67 | 55 | 34.8% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| oota | 87 | 18 | 20 | 49 | 56.3% |
| bmt | 489 | 71 | 379 | 39 | 8.0% |
| mot | 292 | 93 | 161 | 38 | 13.0% |
| tsgeh | 184 | 56 | 93 | 35 | 19.0% |
| bgg | 210 | 56 | 126 | 28 | 13.3% |
| psa | 67 | 18 | 25 | 24 | 35.8% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| bdd | 62 | 9 | 30 | 23 | 37.1% |
| wdh | 95 | 18 | 55 | 22 | 23.2% |
| toa | 116 | 29 | 65 | 22 | 19.0% |
| wbtw | 92 | 17 | 54 | 21 | 22.8% |
| skt | 118 | 22 | 75 | 21 | 17.8% |
| tsae | 65 | 21 | 25 | 19 | 29.2% |
| dsotdq | 83 | 16 | 48 | 19 | 22.9% |
| abh | 54 | 12 | 23 | 19 | 35.2% |
| idrotf | 134 | 22 | 93 | 19 | 14.2% |
| wdmm | 79 | 12 | 49 | 18 | 22.8% |
| pabtso | 69 | 19 | 32 | 18 | 26.1% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| ggr | 186 | 32 | 137 | 17 | 9.1% |
| crcotn | 96 | 33 | 46 | 17 | 17.7% |
| scag | 67 | 22 | 29 | 16 | 23.9% |
| ai | 164 | 20 | 129 | 15 | 9.1% |
| erlw | 127 | 57 | 56 | 14 | 11.0% |
| cos | 66 | 18 | 34 | 14 | 21.2% |
| frafi | 82 | 22 | 46 | 14 | 17.1% |
| pota | 110 | 24 | 73 | 13 | 11.8% |
| vrgr | 86 | 23 | 51 | 12 | 14.0% |
| tsdd | 69 | 23 | 34 | 12 | 17.4% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| bgdia | 114 | 25 | 77 | 12 | 10.5% |
| psk | 38 | 17 | 11 | 10 | 26.3% |
| aag | 40 | 18 | 12 | 10 | 25.0% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| tshl | 69 | 20 | 40 | 9 | 13.0% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| tftyp | 71 | 22 | 41 | 8 | 11.3% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| mtf | 64 | 48 | 10 | 6 | 9.4% |
| efa | 28 | 7 | 15 | 6 | 21.4% |
| nf | 25 | 6 | 13 | 6 | 24.0% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| tdcg | 12 | 3 | 5 | 4 | 33.3% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| gos | 12 | 5 | 5 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 6748 | 278 | 6470 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 1040 | 923 |
| SPELL | 592 | 79 |
| DMG | 583 | 545 |
| PROF | 526 | 141 |
| SPEED | 452 | 344 |
| ADV | 419 | 136 |
| RES | 347 | 113 |
| NUM | 324 | 324 |
| SLOT | 305 | 94 |
| CHOICE | 219 | 68 |
| IMM | 218 | 64 |
| DIS | 179 | 64 |
| AC | 166 | 132 |
| SAVE | 149 | 124 |
| SENSE | 148 | 131 |
| ATK | 138 | 109 |
| DC | 135 | 133 |
| HP | 86 | 62 |
| ABIL | 63 | 60 |
| NUM-DIST | 19 | 19 |
| NUM-DICE | 19 | 19 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (1040 uncovered)

- `feat|Hulking Figure|Hulking Figure#3` Once per turn, you can deal an extra 1d4 Bludgeoning damage to a target you hit with an Unarmed Strike. | no record for DMG,RESOURCE; number 1d4 unexplained
- `feat|Spell Resistant|Spell Resistant#7` You can do this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | number pb no record explains
- `feat|Superior Shifting|Superior Shifting#7` You regain 1 expended use on a Short Rest and all expended uses on a Long Rest. | no record for RESOURCE; number 1 unexplained
- `item|ai|Occultant Abacus#24` Also at rank 2, you regain the use of your Read the Kill feature after you finish a short or long rest. | no record for RESOURCE; number 2 unexplained
- `item|ai|Portfolio Keeper#1` At rank 2, you gain the use of a weathered leather pouch that is an uncommon magic item. | number 2 no record explains
- `item|au|Wand of Slumber#9` Catnap (Charge Cost 3). | no record for RESOURCE; number 3 unexplained
- `item|bmt|Spindle of Fate#12` The wand regains 1d6 expended charges daily at dawn. | no record for RESOURCE; number 1d6 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#22` - You can expend 1 of the jewel's charges (no action required) to end one of the following conditions on yourself: grappled, paralyzed, or restrained. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | no record for RESOURCE; number 2 unexplained
- `item|dmg|Blackstaff#7` The staff has 20 charges for the following properties. | number 20 no record explains
- `item|dmg|Blasted Goggles#4` The goggles regain 1d3 expended charges daily at dawn. | no record for RESOURCE; number 1d3 unexplained
- `item|dmg|Cabal's Ruin (Exalted)#3` 4 charges, regains 1d4 at dawn. | no record for RESOURCE; number 1d4,4 unexplained
- `item|dmg|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | no record for RESOURCE; number 2d6,2 unexplained
- `item|dmg|Diamond Staff#13` Detect Magic (Charge Cost 0). | no record for RESOURCE; number 0 unexplained
- `item|dmg|Enspelled Armor#5` Each day at dawn, it regains 1d6 of its expended charges. | no record for RESOURCE; number 1d6 unexplained
- `item|dmg|Enspelled Staff#6` When you use up its final charge, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Holy Symbol of Ravenkind#7` The holy symbol has 10 charges for the following properties. | number 10 no record explains
- `item|dmg|Impulse Unit#3` Once per turn, after you move at least 15 ft in a straight line, you can move up to 10 ft more in that direction without spending movement. | no record for RESOURCE; number 10 unexplained
- `item|dmg|Making Channeling Wand#6` If you spend the last charge, roll 1d20 and on a 1 the wand turns to ash. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Observatory Charm~2#1` After a Long Rest in your Observatory, you gain a magical Charm that lasts 7 days or until you use it. | number 7 no record explains
- `item|dmg|Passage Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|dmg|Sentinel Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|dmg|Shrieking Greaves#5` The greaves regain 1d3 expended charges daily at dawn. | no record for RESOURCE; number 1d3 unexplained
- `item|misc14|Wand of Winter#7` If you expend the wand's last charge, roll a d20. | no record for RESOURCE; number 1d20 unexplained
- `item|tce|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | no record for RESOURCE; number 2 unexplained
- `item|tee24|Bane Weapon#6` It regains 1d4 charges at dawn. | no record for RESOURCE; number 1d4 unexplained
- `item|tee24|Healing Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|tee24|Healing Channeling Wand#6` If you spend the last charge, roll 1d20 and on a 1 the wand turns to ash. | no record for RESOURCE; number 1d20 unexplained
- `item|tee24|Scribing Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|tsgs|Fire Fire!#2` While it has a charge it sheds Bright Light 20 ft and Dim Light 20 ft more, and nonmagical Bolts it fires deal an extra 1d6 Fire. | no record for RESOURCE; number 1d6,20 unexplained
- `item|tsgs|Staff of Favorable Winds#5` If you spend the last charge, roll 1d20. | number 1d20 no record explains
- `item|tsgs|Staff of the Mirage#3` If you spend the last charge, roll 1d20. | number 1d20 no record explains
- `item|tsgs|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|wdh|Charred Wand of Magic Missiles#2` While holding it, you can use an action to expend 1 or more of its charges to cast the magic missile spell from it. | no record for RESOURCE
- `species|Geppettin|Construct Nature#3` You finish a Long Rest in 4 hours of motionless rest while awake. | no record for RESOURCE; number 4 unexplained
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | no record for RESOURCE; number 4 unexplained
- `sub|Cleric/Grave Domain|Divine Reaper#5` When an enemy dies within 60 feet of you, you or one creature you can see within 60 feet regains Hit Points equal to twice your Cleric level. | number 60,double no record explains
- `sub|Druid/Circle of Blood|Exsanguinate#1` When you use Blood Boon, regain spent Hit Point Dice equal to half your Druid level and give Temporary HP equal to twice your Druid level to up to your Wisdom modifier (minimum 1) creatures you see within 60 ft. Long Res | number 60,half,double no record explains
- `sub|Martyr/Burden of Awakening|Prescient Strike#1` Once per turn, when you roll an 18 or 19 on the d20 for an attack, treat it as a 20. | number 1d20,19,20 no record explains
- `sub|Sorcerer/Serophage|Blood Fuel#1` Instead of moving, you can deal 1d4 Slashing damage to yourself and regain Sorcery Points equal to that damage. | no record for DMG,RESOURCE; number 1d4 unexplained

### SPELL (592 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|ai|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Helm of Telepathy#3` After you cast one of these two spells from the helm, that same spell can't be cast from the helm again until the next dawn. | number 2 no record explains
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tsgs|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Artificer/Artillerist|Arcane Firearm#4` When you cast an Artificer spell through it, roll 1d8 and add the result to one of the spell's damage rolls. | number 1d8 no record explains
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Dancer/Dramaturge|Spellcasting#3` You know two Bard cantrips. | number 2 no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained

### DMG (583 uncovered)

- `class|Necromancer|Critical Spellcasting#5` The extra damage applies only to the creature that rolled the 1. | no record for DMG; number 1 unexplained
- `feat|Arcane Charger|Arcane Charger#4` If you moved at least 10 feet in a straight line and the cantrip hits, you can either add +5 to its damage roll or push the target 10 feet away from you. | no record for DMG,SPELL; number 10,5 unexplained
- `item|coa|Ruby Rod of Asmodeus#3` All damage dealt with it is converted to necrotic, and when you hit a good aligned creature, that creature takes an extra 2d12 necrotic damage. | no record for DMG; number 2d12 unexplained
- `item|coa|Scourge of Shadow#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 3d4 slashing damage instead of its regular damage. | number 3d4 no record explains
- `item|dmg|Axe of the Dwarvish Lords#11` Against a creature, an attack roll with the axe whose d20 shows a 20 deals an extra 20 Slashing damage. | number 1d20,20 no record explains
- `item|dmg|Blackstaff#10` On a 1, the staff retains its +2 bonus to attack and damage roll but loses all other properties. | no record for DMG; number 2 unexplained
- `item|dmg|Concussion Grenade#9` The Thunder damage rises by 1d6 and the radius by 5 ft for each grenade, up to 10d6 and a 30-ft-radius Sphere. | no record for DMG; number 1d6,10d6,5,30 unexplained
- `item|dmg|Ruin's Wake (Awakened)#24` - The weapon's bonus to attack and damage rolls increases to +2, and the extra piercing damage dealt by the weapon increases to 2d8. | number 2d8 no record explains
- `item|dmg|Ruinblade#7` When you hit an undead creature with it, the attack deals an extra 1d8 force damage. | no record for DMG; number 1d8 unexplained
- `item|dmg|Silken Spite (Exalted)#15` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `item|dmg|Stormgirdle (Exalted)#25` - Your Storm Avatar's lightning strike deals 5d6 lightning damage (instead of 3d6). | no record for DMG; number 5d6,3d6 unexplained
- `item|dmg|Tectonic Gauntlets#13` If it ends while you are burrowed, you are shunted to the nearest free space and take 1d10 Force damage. | no record for DMG; number 1d10 unexplained
- `item|dmg|The Bloody End (Exalted)#32` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|dmg|Whisper (Awakened)#3` +1 to attack and damage rolls. | number 1 no record explains
- `item|egw|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Grovelthrash (Exalted)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|egw|Lash of Shadows (Exalted)#29` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Verminshroud (Exalted)#24` If you hit with them, you deal piercing damage equal to 1d6 + your Strength modifier, instead of the bludgeoning damage normal for an unarmed strike. | no record for DMG; number 1d6 unexplained
- `item|egw|Will of the Talon (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Will of the Talon (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|tdcsr|Pyremaul (Exalted)#5` Hits deal an extra 1d6 fire damage. | no record for DMG; number 1d6 unexplained
- `item|tsdm|Concussion Grenade#9` The Thunder damage rises by 1d6 and the radius by 5 ft for each grenade, up to 10d6 and a 30-ft-radius Sphere. | no record for DMG; number 1d6,10d6,5,30 unexplained
- `item|tsgs|Phase Axe#1` A near-transparent Battleaxe with +1 to attack and damage rolls and the Thrown property (20/60 ft). | number 60,20 no record explains
- `item|tsgs|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Artificer/Magneticist|Metal Slinger#10` When you hit a creature, you can deal an extra 1d6 damage of the weapon's type and move a Medium or smaller target 10 ft directly toward or away from you. | no record for DMG; number 1d6,10 unexplained
- `sub|Barbarian/Path of the Drifter|Relentless Aggression#1` Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft. | no record for DMG; number 1d10,5 unexplained
- `sub|Cleric/Moon Domain (Deep Magic)|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Mountain Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Investigator/Inquisitor|Divine Strike#1` Once on each of your turns, when you take the Attack action and hit a creature with a weapon, it takes an extra 1d8 Necrotic or Radiant damage (your choice). | no record for DMG; number 1d8 unexplained
- `sub|Paladin/Oath of the Sun|Incandescent Strikes#1` The extra damage of your Radiant Strikes becomes 1d10 Radiant damage. | no record for DMG; number 1d10 unexplained
- `sub|Ranger/Fey Wanderer|Dreadful Strikes#4` Once you reach Ranger level 11, the extra damage becomes 1d6. | no record for DMG; number 1d6 unexplained
- `sub|Ranger/Griffon Scout|Skirmisher's Step#1` If you move at least 20 ft straight toward a creature and hit it with a melee weapon attack on the same turn, the attack deals an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Rogue/Runetagger|Lead Paint#3` When you do, the Sneak Attack deals an extra 2d6 damage. | no record for DMG; number 2d6 unexplained

### PROF (526 uncovered)

- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | no record for PROF; number pb unexplained
- `class|Bard|Expertise#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | no record for PROF; number half,pb unexplained
- `class|Rogue|Expertise#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | no record for PROF; number 2 unexplained
- `class|Rogue|Expertise~2#4` When you reach Rogue level 6, choose two more skills you're proficient in, and you gain Expertise in those as well. | no record for PROF
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Gambler|Gambler#2` You gain proficiency with two gaming sets of your choice. | no record for PROF
- `feat|Reptiloid|Reptiloid#4` It is a ranged attack with a range of 60 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF; number 60 unexplained
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|dmg|Horn of Valhalla#12` 41-75, brass horn (Rare): 3 spirits, and you must have proficiency with all Simple weapons. | no record for PROF; number 41,75,3 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|thhw|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|tsdm|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | number pb no record explains
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Bard/College of Eloquence|Universal Speech#2` For 1 hour they magically understand you whatever language you speak. | no record for PROF
- `sub|Cleric/Knowledge Domain (PSA)|Blessings of Knowledge#2` You gain proficiency in two of these skills: Arcana, History, Nature, or Religion. | number 2 no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#8` The familiar gains proficiency in any two skills or tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains

### SPEED (452 uncovered)

- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | number 10 no record explains
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | no record for SPEED; number 0 unexplained
- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | no record for SPEED; number 5 unexplained
- `feat|Lordly Resolve|Lordly Resolve#5` Each target can immediately use a Reaction to right itself and end the Prone condition, provided its Speed isn't 0. | no record for SPEED; number 0 unexplained
- `feat|Shock Trooper|Shock Trooper#5` In the first round of each combat, your Speed is doubled. | no record for SPEED; number double unexplained
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | no record for SLOT,SPEED,SPELL; number 5 unexplained
- `item|dmg14|Carpet of Flying, 4 ft. × 6 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Boots of Striding and Springing#1` Wearing these boots raises your Speed to 30 feet if it was lower than that. | no record for SPEED; number 30 unexplained
- `item|dmg|Broom of Flying#4` It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Carpet of Flying#9` A carpet can bear as much as double its listed capacity, but while its load exceeds the normal capacity, its Fly Speed is halved. | no record for SPEED; number double unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Greaves of Dendallen#9` Once removed, your Speed is 0 and rises by 5 ft every 24 hours until normal. | no record for SPEED; number 5,24,0 unexplained
- `item|dmg|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `item|dmg|Mechanical Wonder (Gyrocopter)#11` The gyrocopter wonder is a Huge object that weighs 500 pounds and has the following statistics: AC 14, HP 50, Speed 5 ft., and Fly Speed 20 ft. The gyrocopter can bear up to 2,000 pounds of cargo; if it bears any more th | no record for SPEED; number 5,20,14,50 unexplained
- `item|dmg|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|dmg|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|dmg|Soarsled#1` A crystal disk 5 ft across that carries up to 400 lb. In Sharn or another Syranian manifest zone, stand on it and use a Magic action to make it hover. | no record for SPEED; number 5 unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for RESOURCE,SPEED; number 1 unexplained
- `item|dmg|Wings of Flying#2` These wings give you a Fly Speed of 60 feet. | no record for SPEED; number 60 unexplained
- `item|llk|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|tsdm|Hoverboard#3` While riding it, your Speed rises by 10 ft, you ignore Difficult Terrain, and you can cross liquids without sinking. | no record for SPEED; number 10 unexplained
- `item|tsgeh|Sanctified Cannon#5` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn after you do. | no record for SPEED; number 0 unexplained
- `item|tsgs|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|wbtw|Pixie Dust#2` The recipient gains a flying speed of 30 feet and the ability to hover for 1 minute. | no record for SPEED; number 30,1 unexplained
- `species|Aasimar (Protector)|Radiant Soul#1` From level 3, Action, once per Long Rest: for 1 minute you gain a Fly Speed of 30 ft. Once on each of your turns you deal extra Radiant damage equal to your level to one target you damage with an attack or a spell. | no record for DMG
- `species|Dhampir (Grim Hollow)|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Disembodied|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | no record for DMG,SPEED; number 1d4,20 unexplained
- `species|Wechselkind|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Captain/Gourmand|Monster Meal#14` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained
- `sub|Captain/Siegeball Jersey|Game-Winning Play#2` You immediately move up to twice your Speed without provoking Opportunity Attacks and take an action and a Bonus Action. | no record for SPEED; number double unexplained
- `sub|Cleric/Speed Domain|Quickness of the Gods#1` Your Speed rises by another 5 ft. As a reaction or bonus action, you can raise your Dexterity score by 10 until the end of the current turn. | no record for ABIL; number 10 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#1` When you use Exploit Weakness, you can move up to half your Speed without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Vagabond/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Vagabond/Siegeball Jersey|Game-Winning Play#2` You immediately move up to twice your Speed without provoking Opportunity Attacks and take an action and a Bonus Action. | no record for SPEED; number double unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Warmage/House of Rooks|Arcane Assassin#2` While you have the Invisible condition, your Speed is doubled. | no record for SPEED; number double unexplained

### ADV (419 uncovered)

- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|au|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|au|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|crcotn|Medal of Wit#2` Doing so gives you advantage on Intelligence checks and Intelligence saving throws for 1 hour. | no record for ADV
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|dmg|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|dmg|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|dmg|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|egw|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tghg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|tghg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|tsgs|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsgs|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | number 2,22 no record explains
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Watchers|Channel Divinity: Watcher's Will#2` For 1 minute you and they have Advantage on Intelligence, Wisdom, and Charisma saving throws. | no record for ADV; number 1 unexplained
- `sub|Rogue/Inquisitive|Steady Eye#1` You have Advantage on Wisdom (Perception) and Intelligence (Investigation) checks if you move no more than half your Speed on the same turn. | no record for ADV,SPEED; number half unexplained
- `sub|Warmage/House of Bishops|Siege Casting#2` You have Advantage on spell attack rolls against targets 100 feet or more away. | no record for ADV,ATK; number 100 unexplained
- `sub|Witch/Fragrant Magic|Aromamancy#8` For 1 hour you have Advantage on Charisma checks to influence a creature within 5 feet of you. | no record for ADV; number 5,1 unexplained
- `sub|Wizard/Graviturgy Magic|Adjust Density#3` With doubled weight it loses 10 feet of Speed and has Advantage on Strength checks and saves. | no record for ADV,SPEED; number 10,double unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/Timekeeper|Temporal Points#6` Option three: Advantage on your next Dexterity check. | no record for ADV; number 3 unexplained

### RES (347 uncovered)

- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | no record for RES; number 1 unexplained
- `feat|Bandit Cunning|Bandit Cunning#6` If you meet DC 10 plus its challenge rating, you learn one fact of your choice about its combat abilities: a damage resistance or immunity, a condition immunity, a special ability that deals or prevents damage, an attack | no record for CHOICE,DC,IMM,RES; number 10 unexplained
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES,RESOURCE; number 60,1,2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|tsgs|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `sub|Cleric/Nature Domain|Dampen Elements#1` When you or a creature within 30 feet takes acid, cold, fire, lightning, or thunder damage, you can use your Reaction to give that creature Resistance against that instance of damage. | no record for RES; number 30 unexplained
- `sub|Cleric/War Domain|Avatar of Battle#1` You gain Resistance against three damage types: Bludgeoning, Piercing, and Slashing. | no record for RES; number 3 unexplained
- `sub|Druid/Circle of the Warden|Reclamation#1` Reaction: when a creature within 30 ft takes cold, fire, lightning or thunder damage, it gains Resistance to that damage and you take an amount equal to what it took. | no record for RES; number 30 unexplained
- `sub|Jaeger/Heretic Chapter|Darkness Within#3` You are Heavily Obscured, gain a Fly Speed of 30 feet, and have Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES,SPEED; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Apocalypse Sorcery|Forbidden Magic#4` Right after casting you take Force damage equal to four times the slot level, ignoring Resistance and Immunity. | no record for IMM,RES,SLOT; number 4 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RES,RESOURCE; number 1,1 unexplained
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Sorcerer/Shadow Magic|Umbral Form#2` You have Resistance to all damage except Force and Radiant, and you move through creatures and objects as Difficult Terrain, taking 5 Force damage if you end your turn inside an object. | no record for RES; number 5 unexplained
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained

### NUM (324 uncovered)

- `class|Captain|Cohort~4#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | number 2 no record explains
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | number 3 no record explains
- `feat|Chef|Chef#7` The batch feeds a number of creatures equal to your Proficiency Bonus plus 4. | number 4 no record explains
- `feat|Heavy Armor Master (2014)|Heavy Armor Master (2014)#6` While you wear Heavy armor, Bludgeoning, Piercing, and Slashing damage from nonmagical weapons is reduced by 3. | number 3 no record explains
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Moderately Armored|Moderately Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Ritual Caster|Ritual Caster#2` Pick Intelligence, Wisdom, or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `item|bgdia|Blade of Avernus#9` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Iron#6` The iron horn summons 5d4 + 5 berserkers. | number 5d4,5 no record explains
- `item|dmg|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Dragon's Call#2` You also get +1 to Intelligence, Wisdom and Charisma checks about dragon lore. | number 1 no record explains
- `item|dmg|Gloves of Swimming and Climbing#2` You also gain a +5 bonus to any Strength (Athletics) check you make to climb or to swim. | number 5 no record explains
- `item|dmg|Ioun Stone (mastery)#13` While it circles your head, your Proficiency Bonus increases by 1. | number pb no record explains
- `item|dmg|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|dmg|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|dmg|Locksmith's Bane#2` You get +3 to Dexterity (Sleight of Hand) checks to pick a lock with it. | number 3 no record explains
- `item|dmg|Luba's Tarokka of Souls#12` - 2 minor detrimental properties | number 2 no record explains
- `item|dmg|Oil of Sharpness#4` After that, the oil sinks magically into what it covers: a coated weapon becomes a +3 Weapon, and coated ammunition becomes +3 Ammunition. | number 3 no record explains
- `item|dmg|Orc Stone#4` The spirit uses the orc war chief stat block in the Monster Manual and disappears after 10 minutes or when reduced to 0 hit points. | number 10,0 no record explains
- `item|dmg|Orrery of the Wanderer#12` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Powered Armor#25` When the armor is reduced to 0 hit points, its defenses are rendered inert and it can be safely approached. | number 0 no record explains
- `item|dmg|Rod of the Pact Keeper, +1#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2,3 no record explains
- `item|dmg|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | number 1,2 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|dmg|Winter's Dark Bite#4` But when used against a thessalhydra, it works as a +3 greatsword. | number 3 no record explains
- `item|egw|Grimoire Infinitus (Awakened)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Crown of Lies#14` - 1 minor detrimental property | number 1 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#7` - 2 minor beneficial properties | number 2 no record explains
- `item|tce|Luba's Tarokka of Souls#12` - 2 minor detrimental properties | number 2 no record explains
- `item|tdcsr|Mythcarver (Exalted)#7` The bonus becomes +2. | number 2 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|tsdm|Flashback Polaroid#1` An antique camera loaded with 1d6 + 2 blank photos. | number 1d6,2 no record explains
- `item|tsgs|Firecracker Crystals#1` A bag of 1d4 + 8 festival crystals. | number 1d4,8 no record explains
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|tsgs|Locksmith's Bane#2` You get +3 to Dexterity (Sleight of Hand) checks to pick a lock with it. | number 3 no record explains
- `item|tsgs|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `sub|Martyr/Burden of Discord|Coin of Chaos#3` It is +4 on heads and +1 on tails. | number 4 no record explains

### SLOT (305 uncovered)

- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | no record for SLOT,SPELL; number 2 unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|tsgs|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Craftsman/Forgeknights' Guild|Fire Burst#1` While you hold your Portable Forge, you can cast Fireball centered on yourself with no spell slot and no components (DC 8 plus your Intelligence modifier plus your Proficiency Bonus). | no record for DC,SLOT; number 8,pb unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Primordial Archer|Witching Arrows#2` Listed damage rises by 2d6 per slot level above 1. | no record for DMG,SLOT; number 2d6,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#4` Example: a level 3 Sorcerer who saves against a level 2 spell may regain two level 1 slots or one level 2 slot. | no record for SLOT
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained

### CHOICE (219 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | number 9 no record explains
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | no record for CHOICE; number 2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#8` Choose a number of Chronomancy spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Ritual Caster (2014)|Ritual Caster (2014)#4` You gain a ritual book holding two 1st-level spells of your choice from that class's list that have the Ritual tag. | no record for CHOICE; number 2 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage equal to your Charis | no record for CHOICE; number 5 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Purple Dragon Knight (Banneret)|Inspiring Surge#3` From level 18 you can choose two allies. | no record for CHOICE; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#2` Or you can choose an ally within 30 feet who can see or hear you. | no record for CHOICE; number 30 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Fiendish Chain|Dark Versatility#1` Your Eidolon gains two Evolutions of your choice that it qualifies for. | no record for CHOICE; number 2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (114)

- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | angka: 2
- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Captain|Cohort~2#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Gadgeteer|Gadgets#12` The Gadget save DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | angka: half,pb
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Bard|Expertise#2` If you have proficiency in Performance and Persuasion, those two are suggested. | angka: 2
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | angka: 3
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | angka: 2
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Vagabond|Battle Tactics#15` A maneuver's save DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Monk|Disciplined Survivor#2` In addition, whenever you fail a saving throw, you can spend 1 Focus Point to roll the save again. | angka: 1
- `class|Summoner|Shared Resilience#1` While you and your Eidolon are within 30 feet of each other, you both have proficiency in all saving throws. | angka: 30
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | angka: double,pb
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Barbarian|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | angka: 4
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Jaeger|Hunter's Pursuit#1` At the start of your turn, you can spend 1 Adrenaline Point to move up to half your Speed without using any of your movement and without provoking Opportunity Attacks. | angka: 1,half
- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | angka: 2

### feat (226)

- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Shadowsteel Ghoul Transformation: Stage 3|Shadowsteel Ghoul Transformation: Stage 3#8` The DC is 8 plus your Constitution modifier plus your Proficiency Bonus. | angka: 8,pb
- `feat|Primordial Transformation: Stage 2|Primordial Transformation: Stage 2#10` On a failure your Primordial nature shows, and you have Disadvantage on every D20 Test for 1 minute while you fight for control. | angka: 1d20
- `feat|Aberrant Anatomy|Aberrant Anatomy#7` Right after you make a D20 Test and roll a 1 on the d20, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Medium Armor Master|Medium Armor Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#2` On your first turn after an Initiative roll, add 1d4 to the first damage roll you make. | angka: 1d4
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | angka: 2
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | angka: 2
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#7` If you already have Darkvision, its range increases by 60 feet. | angka: 60
- `feat|Hulking Figure|Hulking Figure#3` Once per turn, you can deal an extra 1d4 Bludgeoning damage to a target you hit with an Unarmed Strike. | angka: 1d4
- `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#4` You have Disadvantage on all D20 Tests while in sunlight. | angka: 1d20
- `feat|Fey Transformation: Stage 2|Fey Transformation: Stage 2#7` Until you do, you have Disadvantage on D20 Tests. | angka: 1d20
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#3` The extra damage becomes 2d4 at character level 9 and 4d4 at character level 16. | angka: 2d4,1d4
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | angka: 5
- `feat|Marksman's Luck|Marksman's Luck#7` When you score a Critical Hit with a Ranged weapon, the target's Speed is 0 until the end of its next turn. | angka: 0
- `feat|Fury of the Frost Giant|Fury of the Frost Giant#9` It makes a Constitution saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Shadowsteel Master|Shadowsteel Master#7` Also, once on each of your turns when you hit with a weapon attack using your Focus, you can deal an extra 2d8 Necrotic damage to the target. | angka: 2d8
- `feat|Watchers|Watchers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Charger|Charger#4` Whenever you take the Dash action, your Speed rises by 10 feet for that action. | angka: 10
- `feat|Telekinetic|Telekinetic#9` It makes a Strength saving throw against a DC of 8 + your Proficiency Bonus + the modifier of the ability this feat raised. | angka: 8,pb
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | angka: 0
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | angka: 5
- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Latent Psionics|Latent Psionics#4` Your Psionic Blast deals an extra 1d10 Psychic damage. | angka: 1d10
- `feat|Superior Shifting|Superior Shifting#7` You regain 1 expended use on a Short Rest and all expended uses on a Long Rest. | angka: 1
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#17` It has AC 18, Hit Points equal to 10 times your character level and Speed 0. | angka: 18,10,0
- `feat|Great Weapon Master|Great Weapon Master#2` Your Strength score rises by 1, but not above 20. | angka: 1,20
- `feat|Pack Fighting|Pack Fighting#3` If an ally within 5 feet of the creature also has this feat and is not Incapacitated, the bonus becomes +2. | angka: 5,2
- `feat|Void Channeler|Void Channeler#3` One creature of your choice within 10 feet that can hear you must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or be frightened of you for 1 minute. | angka: 10,1,8,pb
- `feat|Symbiotic Being|Symbiotic Being#12` You make a Charisma saving throw against DC 13 plus your Proficiency Bonus. | angka: 13,pb

### item (2359)

- `item|tdcsr|Mythcarver (Exalted)#4` +1 to attack and damage rolls. | angka: 1
- `item|dmg|Deck of Many Things#32` While cursed this way, you take a -2 penalty to saving throws. | angka: 2
- `item|dmg|Staff of Charming#12` When its final charge is used, roll 1d20. | angka: 1d20
- `item|llk|Powered Armor#25` When the armor is reduced to 0 hit points, its defenses are rendered inert and it can be safely approached. | angka: 0
- `item|egw|Lash of Shadows (Exalted)#38` - The saving throw DC for the weapon's poisons increases to 15. | angka: 15
- `item|dmg|Orb of Damara#29` (Spell / Charge Cost) Disguise Self: 0. | angka: 0
- `item|dmg|Charm of Cozmioko's Glory#4` Revenge: a melee weapon you hold is empowered for 1 minute or until you let go of it, and once per turn when it hits a Dragon, that Dragon takes an extra 3d6 damage of the weapon's type. | angka: 3d6
- `item|egw|Grovelthrash (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | angka: 1
- `item|dmg|Indorius's Crown (Master)#9` Friendly creatures within 10 ft add 1d4 to attack rolls and saves. | angka: 1d4,10
- `item|dmg|Wyrmreaver Gauntlets#9` While the spectral fists are active, unarmed strikes you make on your turn have a reach of 30 feet, and when you hit a creature with an opportunity attack made with your unarmed strike, the creature m | angka: 30,8,pb
- `item|dmg|Wand of Polymorph#5` When you expend its last charge, roll 1d20. | angka: 1d20
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | angka: 2d6,2
- `item|misc14|Crown of Lies#13` - 1 major beneficial property | angka: 1
- `item|dmg|Alluring Dye#5` On a 1 the dyes clash, your coloring turns a shocking yellow, and you have Disadvantage on Charisma checks for 1d6 days until it fades. | angka: 1d6
- `item|tsgs|Wand of Whispers#6` When you cast a level 0 to 5 spell while holding it, spend 1 charge per slot level to ignore its Verbal components. | angka: 1
- `item|dmg|Spellwrought Tattoo (5th Level)#7` The Ability modifier for this spell is +5; the Save DC is 17 and the attack bonus is +9. | angka: 5,17,9
- `item|dmg|The Bloody End (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | angka: 1
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and | angka: 6d6,10
- `item|tvss|Heart of Steel#3` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | angka: 4
- `item|tee24|Warding Channeling Wand#6` If you spend the last charge, roll 1d20 and on a 1 the wand turns to ash. | angka: 1d20
- `item|dmg|Queen Ehlissa's Marvelous Nightingale#27` Detect Evil and Good (Charge Cost 0). | angka: 0
- `item|crcotn|Jewel of Three Prayers (Exalted)#31` - Its number of charges increases to 5. | angka: 5
- `item|tdcsr|Honor's Last Stand (Exalted)#7` The AC bonus becomes +2. | angka: 2
- `item|dmg|Saber of Unity#3` You and any allies within 10 ft of you are immune to the Frightened condition while you wield it. | angka: 10
- `item|dmg|Heart of Steel#3` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | angka: 4
- `item|dmg|Shrieking Greaves#5` The greaves regain 1d3 expended charges daily at dawn. | angka: 1d3
- `item|tvss|Goodberry Wine#3` You regain 10 HP and the drink feeds you for one day. | angka: 10,1
- `item|dmg|Helm of Brilliance#8` Each Undead that begins its turn there takes 1d6 Radiant damage. | angka: 1d6
- `item|dmg|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | angka: 10,2
- `item|dmg|Staff of the Forgotten One#18` Each time a creature other than Acererak expends any of the staff's charges, there is a 50 percent chance that the life force tries to possess the staff wielder. | angka: 50

### species (95)

- `species|Eladrin (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | angka: 3
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | angka: 1d6
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Pallid Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Siren|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | angka: double
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | angka: 0
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | angka: 0
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Gnoll|Rampage#1` When you reduce a creature to 0 Hit Points with a melee attack on your turn, you can use a Bonus Action to move up to half your Speed and make a bite attack. | angka: 0,half
- `species|Merfolk|Swim Speed#1` Swim Speed of 40 ft. | angka: 40
- `species|Mandrake|Entangling Vines#2` Its Speed is 0 and cannot increase until the end of its next turn. | angka: 0
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Naga|Speed Burst#1` Bonus Action with both hands free: your walking Speed rises by 5 ft until the end of your turn. | angka: 5
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Gnoll (Eberron)|Rampage#1` When you use your Bite or reduce a creature to 0 Hit Points with an attack, take a Bonus Action to move up to half your Speed and make one attack with a weapon or an Unarmed Strike using your Bite. | angka: 0,half

### sub (699)

- `sub|Rogue/Inquisitive|Steady Eye#1` You have Advantage on Wisdom (Perception) and Intelligence (Investigation) checks if you move no more than half your Speed on the same turn. | angka: half
- `sub|Monk/Warrior of Pride|Ever Prideful#2` In it, you cannot be made Unconscious, you can't speak, you can't cast or concentrate on spells, and a Critical Hit adds only 1 Death Saving Throw failure instead of 2. | angka: 1,2
- `sub|Sorcerer/Draconic Bloodline|Draconic Resilience#1` Your Hit Point maximum increases by 1 and again by 1 whenever you gain a Sorcerer level. | angka: 1
- `sub|Craftsman/Mechanauts' Guild|Magitech Upgrade#14` Until the end of your turn, the apparatus's Speed doubles, it has a Fly Speed equal to its Speed, and you can attack three times when you take the Attack action with it. | angka: 3,double
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | angka: 1,2
- `sub|Necromancer/Cyberghoul|Charnel Blaster#1` You can make Charnel Touch as a ranged spell attack with a 30-ft range instead of a melee one. | angka: 30
- `sub|Rogue/Inquisitive|Eye for Weakness#1` While Insightful Fighting applies to a creature, your Sneak Attack damage against it increases by 3d6. | angka: 3d6
- `sub|Monster Hunter/Carver Guild|Deadly Redirect#1` The extra damage of Close Quarters becomes 3d6. | angka: 3d6
- `sub|Barbarian/Path of Heavy Metal|Solo Shredding#1` When you damage an enemy with an Instrument Weapon while Raging, raise your Rage Damage bonus by 1 until the Rage ends, to a maximum of double the table value. | angka: 1,double
- `sub|Monk/Way of the Open Hand|Tranquility#2` The save DC is 8 + your Wisdom modifier + your Proficiency Bonus. | angka: 8,pb
- `sub|Barbarian/Path of the Beast|Call the Hunt#3` Until the Rage ends, each chosen creature can, once per turn when it hits a target and deals damage, roll 1d6 and add it to the damage. | angka: 1d6
- `sub|Necromancer/Overlord|Charnel Aura#2` Undead you control inside it gain a bonus to D20 Tests, damage rolls and AC. | angka: 1d20
- `sub|Martyr/Burden of Mercy|Virtuous Blessings#7` Spend it to gain Advantage on a D20 Test using Wisdom or Charisma (no action). | angka: 1d20
- `sub|Summoner/Bond of the Shambling Plant|Absorb Nutrients#5` The damage becomes 3d8 at level 10 and 4d8 at level 14. | angka: 3d8,1d8
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Craftsman/Thunderlords' Guild|Power Cell#9` It is 1d6 per Charge Point spent plus your Intelligence modifier. | angka: 1d6
- `sub|Sorcerer/Nanite Magic|Recycling Protocol#1` When you reduce an enemy to 0 HP, or someone else does within 10 ft of you, regain 2 Sorcery Points. | angka: 10,0
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | angka: 2
- `sub|Captain/Gourmand|Monster Meal#22` Hit Points maximum and current Hit Points increase by 5. | angka: 5
- `sub|Sorcerer/Draconic Bloodline|Draconic Resilience#2` Scales cover parts of your skin, so when you wear no armor your AC equals 13 plus your Dexterity modifier. | angka: 13
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | angka: 1d8
- `sub|Warlock/The Undead|Spirit Projection#8` You have a Fly Speed equal to your Speed and can hover, and you move through creatures and objects as difficult terrain, taking 1d10 Force damage if you end a turn inside one. | angka: 1d10
- `sub|Fighter/Nightwatcher|Ever Vigilant#3` Each can use a Reaction to gain Advantage on its Initiative roll and move up to half its Speed without Opportunity Attacks. | angka: half
- `sub|Wizard/Dragon Mage|Invoke Dragon Wings#7` You gain 5 ft of Speed per slot level, and you pick one creature per slot level within 10 ft, and ranged attacks against them have Disadvantage. | angka: 5
- `sub|Rogue/Assassin|Infiltration Expertise#4` Using Steady Aim doesn't reduce your Speed to 0. | angka: 0
- `sub|Cleric/Solidarity Domain (PSA)|Divine Strike#1` Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d8 damage of the same type as the weapon damage. | angka: 1d8
- `sub|Vagabond/Dragon Banner|Rampage [Maneuver]#1` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack roll, expend one Battle Die to move up to your Speed and make a melee attack (no | angka: 0
- `sub|Cleric/Darkness Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | angka: 2d8
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#45` Each takes 4d10 Lightning damage. | angka: 4d10
- `sub|Bard/College of Swords|Blade Flourish#7` Also push the target 5 feet plus the roll, then use your Reaction to move up to your Speed next to it. | angka: 5

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|mot|Ephara's Votary#4` After using this reroll, you cannot do so again until you finish a Long Rest. -> info:REST:NONUM
- class `item|mot|Ephara's Votary#4` After using this reroll, you cannot do so again until you finish a Long Rest. -> info:REST:NONUM
- record `item|bgg|Delver's Claws#8` You then regain a number of hit points equal to the total roll plus your Constitution modifier. -> info:REST:NONUM
- class `item|bgg|Delver's Claws#8` You then regain a number of hit points equal to the total roll plus your Constitution modifier. -> info:REST:NONUM
- record `sub|Artificer/Magneticist|Extra Attack#1` You can attack twice, instead of once, whenever you take the Attack action on your turn. -> info:ACTIVE:TRIGGER
- class `sub|Artificer/Magneticist|Extra Attack#1` You can attack twice, instead of once, whenever you take the Attack action on your turn. -> info:ACTIVE:TRIGGER
- record `class|Wizard|Spellcasting#10` It is a Tiny object that weighs 3 pounds and has 100 pages, and only you or someone casting Identify can read it. -> info:NUMONLY:FLAVOR
- class `class|Wizard|Spellcasting#10` It is a Tiny object that weighs 3 pounds and has 100 pages, and only you or someone casting Identify can read it. -> info:NUMONLY:FLAVOR
- record `item|dmg|Akmon, Hammer of Purphoros#10` The hammer has 1 randomly determined minor beneficial property. -> info:NUMONLY:TEXT
- class `item|dmg|Akmon, Hammer of Purphoros#10` The hammer has 1 randomly determined minor beneficial property. -> info:NUMONLY:TEXT
- record `item|tsgs|Visage of Delight and Disaster#3` You regain them after a Short or Long Rest. -> covered
- class `item|tsgs|Visage of Delight and Disaster#3` You regain them after a Short or Long Rest. -> info:REST:NONUM
- record `sub|Witch/Green Magic|Green Magic Spells#4` 7 Dominate Beast, Stoneskin. -> info:NUMONLY:TABLE
- class `sub|Witch/Green Magic|Green Magic Spells#4` 7 Dominate Beast, Stoneskin. -> info:NUMONLY:TABLE
- record `item|dmg14|+3 Rod of the Pact Keeper#3` You can't use this property again until you finish a long rest. -> info:REST:NONUM
- class `item|dmg14|+3 Rod of the Pact Keeper#3` You can't use this property again until you finish a long rest. -> info:REST:NONUM
- record `sub|Ranger/Freerunner|Freerunning#1` You can use the techniques below a number of times equal to your Dexterity modifier, regaining all uses on a Short or Lo -> covered
- class `sub|Ranger/Freerunner|Freerunning#1` You can use the techniques below a number of times equal to your Dexterity modifier, regaining all uses on a Short or Lo -> info:REST:NONUM
- record `item|dmg|Instrument of the Bards, Canaith Mandolin#2` Seven types of these instruments exist, each named after a legendary bard college. -> info:NUMONLY:FLAVOR
- class `item|dmg|Instrument of the Bards, Canaith Mandolin#2` Seven types of these instruments exist, each named after a legendary bard college. -> info:NUMONLY:FLAVOR
- record `sub|Warlock/The Archfey (2014)|Misty Escape#3` You regain use after a Short or Long Rest. -> covered
- class `sub|Warlock/The Archfey (2014)|Misty Escape#3` You regain use after a Short or Long Rest. -> info:REST:NONUM
- record `class|Fighter|Action Surge#4` From level 17, you can use it twice between rests, but no more than once on the same turn. -> info:NUMONLY:TEXT
- class `class|Fighter|Action Surge#4` From level 17, you can use it twice between rests, but no more than once on the same turn. -> info:NUMONLY:TEXT
- record `item|tsgs|Hat Trick#3` It lasts 1 minute and cannot deliver spells. -> info:NUMONLY:GEOMETRY
- class `item|tsgs|Hat Trick#3` It lasts 1 minute and cannot deliver spells. -> info:NUMONLY:GEOMETRY
- record `sub|Ranger/Horizon Walker|Detect Portal#2` You regain use after a Short or Long Rest. -> covered
- class `sub|Ranger/Horizon Walker|Detect Portal#2` You regain use after a Short or Long Rest. -> info:REST:NONUM
- record `sub|Artificer/Maverick|Maverick Spells#3` When you prepare Artificer spells, you can prepare extra spells equal to your Proficiency Bonus, chosen from the Artific -> info:NUMONLY:TEXT
- class `sub|Artificer/Maverick|Maverick Spells#3` When you prepare Artificer spells, you can prepare extra spells equal to your Proficiency Bonus, chosen from the Artific -> info:NUMONLY:TEXT
