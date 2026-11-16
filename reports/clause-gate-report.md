# Laporan clause gate (mode laporan, 2026-11-16)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 87785 |
| Kalimat mekanik (kelas kata kunci atau angka) | 45055 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8562 |
| Info (tag terdokumentasi) | 29427 (SPELL_TEXT 9002, FORM:ACTIVATE 2891, NUMONLY:GEOMETRY 2702, FORM:ROLL 2157, ACTIVATE 1734, NUMONLY:TEXT 1589, FXO_NULL 1391, NUMONLY:ROLL 1219, NUMONLY:TABLE 1022, ACTIVE:TRIGGER 1003, FORM:TABLE 979, ACTIVE:OTHERS 825, BY_DESIGN 672, REST:NONUM 641, NUMONLY:FLAVOR 342, COND:PLAY_STATE 262, STD:ASI 216, NUMONLY:ZERO 194, OBJECT:STATS 111, DC:REFERENCE 93, COND:ATTACK_ROLL_ADV 86, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 73, ACTIVE:TIMED_IMM 46, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 7066 |
| Uncovered dengan angka | 3984 |
| Uncovered dengan kelas kata kunci mekanik | 6657 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 409 |
| Angka yang tidak dijelaskan record mana pun | 3760 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 6038 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 280 |
| Waktu | muat data 0 s, analisis 9 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 181 ditangkap (60.7%). Hapus semua atom kelas yang dibutuhkan: 181 ditangkap (60.7%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 294 ditangkap (98.0%), semua atom kelas dihapus: 298 ditangkap (99.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3422 |
| GX | 1631 |
| wxs | 903 |
| LU_X | 730 |
| species | 510 |
| AUTO | 439 |
| ITEM_SPELLS | 364 |
| SPELL_FX | 241 |
| feat | 211 |
| cls | 153 |
| LASTCH | 145 |
| SAVE_NOTES | 91 |
| FXO | 48 |
| SPELLS | 37 |
| FDMG | 15 |
| SP_AUTO | 12 |
| SUB_GRANT | 9 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 211, fx-L4.js 166, fx-L12.js 147, fx-L2.js 133, fx-L3.js 129, fx-L10.js 125, fx-L1.js 111, fx-N1.js 99, fx-L9.js 94, fx-L6.js 87, fx-L11.js 82, fx-L8.js 63.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7797 | 1117 | 14.3% |
| SPELL | 3289 | 994 | 30.2% |
| DMG | 4840 | 905 | 18.7% |
| PROF | 1128 | 718 | 63.7% |
| SPEED | 1435 | 625 | 43.6% |
| ADV | 1991 | 622 | 31.2% |
| RES | 1399 | 527 | 37.7% |
| CHOICE | 1685 | 483 | 28.7% |
| IMM | 1038 | 413 | 39.8% |
| SLOT | 1486 | 373 | 25.1% |
| NUM | 8655 | 361 | 4.2% |
| DC | 3009 | 312 | 10.4% |
| DIS | 1221 | 297 | 24.3% |
| ATK | 1072 | 272 | 25.4% |
| SENSE | 674 | 221 | 32.8% |
| AC | 709 | 200 | 28.2% |
| SAVE | 282 | 157 | 55.7% |
| HP | 206 | 112 | 54.4% |
| ABIL | 395 | 86 | 21.8% |
| NUM-DICE | 1618 | 79 | 4.9% |
| INIT | 129 | 64 | 49.6% |
| NUM-DIST | 5597 | 43 | 0.8% |
| NUM-DUR | 3557 | 38 | 1.1% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1191 | 246 | 637 | 0 | 308 |
| feat | 2825 | 510 | 1492 | 0 | 823 |
| item | 19942 | 4630 | 11895 | 0 | 3417 |
| species | 1640 | 822 | 470 | 0 | 348 |
| spell | 9280 | 278 | 9002 | 0 | 0 |
| sub | 10177 | 2076 | 5931 | 0 | 2170 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10800 | 2535 | 6437 | 1828 | 16.9% |
| tvss | 2815 | 616 | 1640 | 559 | 19.9% |
| core | 1503 | 343 | 763 | 397 | 26.4% |
| ttoh | 1472 | 230 | 874 | 368 | 25.0% |
| tvss14 | 1211 | 166 | 748 | 297 | 24.5% |
| tsgs | 1483 | 386 | 833 | 264 | 17.8% |
| tkdm | 922 | 176 | 496 | 250 | 27.1% |
| tsdm | 1069 | 250 | 594 | 225 | 21.0% |
| tghp | 1117 | 349 | 556 | 212 | 19.0% |
| tce | 736 | 119 | 456 | 161 | 21.9% |
| tdm14 | 645 | 109 | 378 | 158 | 24.5% |
| tua24 | 637 | 153 | 332 | 152 | 23.9% |
| au | 536 | 108 | 284 | 144 | 26.9% |
| egw | 566 | 131 | 297 | 138 | 24.4% |
| phb14 | 516 | 143 | 257 | 116 | 22.5% |
| dmg14 | 540 | 147 | 284 | 109 | 20.2% |
| tdcsr | 416 | 124 | 188 | 104 | 25.0% |
| tgh14p | 491 | 105 | 283 | 103 | 21.0% |
| twow | 544 | 134 | 310 | 100 | 18.4% |
| thhw | 395 | 81 | 232 | 82 | 20.8% |
| tee24 | 464 | 170 | 216 | 78 | 16.8% |
| xge | 378 | 90 | 210 | 78 | 20.6% |
| hof | 253 | 31 | 147 | 75 | 29.6% |
| rhw | 232 | 50 | 115 | 67 | 28.9% |
| tssm | 275 | 66 | 148 | 61 | 22.2% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 327 | 64 | 212 | 51 | 15.6% |
| tghg | 288 | 75 | 162 | 51 | 17.7% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| mot | 292 | 95 | 160 | 37 | 12.7% |
| tsgeh | 184 | 59 | 89 | 36 | 19.6% |
| bmt | 489 | 78 | 379 | 32 | 6.5% |
| bgg | 210 | 59 | 124 | 27 | 12.9% |
| tgh14c | 242 | 30 | 185 | 27 | 11.2% |
| psa | 67 | 18 | 25 | 24 | 35.8% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| bdd | 62 | 10 | 30 | 22 | 35.5% |
| skt | 118 | 27 | 70 | 21 | 17.8% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| tsae | 65 | 21 | 25 | 19 | 29.2% |
| dsotdq | 83 | 16 | 48 | 19 | 22.9% |
| abh | 54 | 12 | 23 | 19 | 35.2% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| scag | 67 | 22 | 29 | 16 | 23.9% |
| idrotf | 134 | 32 | 86 | 16 | 11.9% |
| wdh | 95 | 26 | 53 | 16 | 16.8% |
| wdmm | 79 | 14 | 49 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| ai | 164 | 24 | 127 | 13 | 7.9% |
| frafi | 82 | 23 | 46 | 13 | 15.9% |
| vrgr | 86 | 23 | 51 | 12 | 14.0% |
| tsdd | 69 | 23 | 34 | 12 | 17.4% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| erlw | 127 | 59 | 56 | 12 | 9.4% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| bgdia | 114 | 27 | 75 | 12 | 10.5% |
| pabtso | 69 | 25 | 32 | 12 | 17.4% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| psk | 38 | 19 | 9 | 10 | 26.3% |
| aag | 40 | 18 | 12 | 10 | 25.0% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| tshl | 69 | 20 | 40 | 9 | 13.0% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| mtf | 64 | 48 | 10 | 6 | 9.4% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| efa | 28 | 9 | 15 | 4 | 14.3% |
| nf | 25 | 9 | 12 | 4 | 16.0% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| tdcg | 9 | 3 | 4 | 2 | 22.2% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 9280 | 278 | 9002 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 798 | 664 |
| SPELL | 721 | 102 |
| DMG | 671 | 621 |
| PROF | 665 | 179 |
| ADV | 612 | 183 |
| SPEED | 541 | 414 |
| RES | 425 | 141 |
| NUM | 361 | 361 |
| SLOT | 354 | 110 |
| CHOICE | 272 | 77 |
| IMM | 269 | 78 |
| DIS | 256 | 105 |
| AC | 200 | 165 |
| SENSE | 194 | 166 |
| ATK | 175 | 134 |
| SAVE | 151 | 124 |
| DC | 149 | 143 |
| HP | 112 | 85 |
| ABIL | 74 | 71 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (798 uncovered)

- `item|au|Diamond Staff#14` Light (Charge Cost 0). | number 0 no record explains
- `item|au|Queen Ehlissa's Marvelous Nightingale#28` Greater Restoration (Charge Cost 4). | no record for RESOURCE; number 4 unexplained
- `item|bmt|+2 Fate Dealer's Deck#4` One creature you can see within 30 feet of you either takes radiant damage or regains hit points (your choice) equal to the total. | number 30 no record explains
- `item|bmt|Spindle of Fate#4` When you roll initiative, you can expend 1 charge to add or subtract your proficiency bonus from the total roll. | no record for INIT; number 1,pb unexplained
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#16` It has 24 charges, and each hour or portion thereof it spends in beast form costs 1 charge. | number 1 no record explains
- `item|dmg14|Ring of Water Elemental Command#6` You can expend 2 of the ring's charges to cast dominate monster on a water elemental. | number 2 no record explains
- `item|dmg|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | number 2 no record explains
- `item|dmg|Beads of Contemplation#2` The beads store ki energy for later use, up to 8 ki points. | number 8 no record explains
- `item|dmg|Blackstaff#25` (Distance from Origin / Effect) 10 ft. away or closer: 8 × the number of charges in the staff. | no record for RESOURCE; number 10,8 unexplained
- `item|dmg|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Charm of the Water Bearer#3` You can do this up to three times per day for 10 days, then the charm vanishes. | number 10 no record explains
- `item|dmg|Dark Gift of Tarakamedes, the Grave Wyrm#3` At dawn, if you have not eaten at least 1 pound of them in the past 24 hours, you die. | no record for RESOURCE; number 24 unexplained
- `item|dmg|Devlin's Staff of Striking#3` When you hit with a melee attack using it, you can expend up to 3 of its charges. | number 3 no record explains
- `item|dmg|Fletcher's Retort Gloves#1` While wearing these gloves and using Deflect Missiles, you can spend 1 ki point to reduce the damage by 1d10 + your Dexterity modifier + twice your monk level instead. | no record for DMG; number 1d10,1,double unexplained
- `item|dmg|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a +7 bonus. | no record for ATK; number 60,7 unexplained
- `item|dmg|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|egw|Luxon Beacon#9` Alternatively, when an attack roll is made against the creature, it can expend its fragment to roll a d20 and choose which of the d20s to use, the one it rolled or the one the attacker rolled. | number 1d20 no record explains
- `item|oota|Wand of Viscid Globs#2` While holding it, you can use an action to expend 1 of its charges to cause a small glob of viscous material to launch from the tip at one creature within 60 feet of you. | number 60 no record explains
- `item|tce|Crook of Rao#29` The gate then, once per round on initiative count 20, audibly speaks a fiend's name in Iggwilv's voice, doing so until the gate calls on every fiend ever banished by the Crook of Rao. | number 20 no record explains
- `item|tdcsr|Cabal's Ruin (Awakened)#3` 4 charges, regains 1d4 at dawn. | number 4 no record explains
- `item|tdcsr|Spire of Conflux (Awakened)#4` 8 charges, regains 1d4 + 2 at dawn. | number 1d4,8 no record explains
- `item|tdcsr|Wraps of Dyamak (Exalted)#11` When you hit with an unarmed strike, you can make it a ravenous strike: the target takes an extra 6d6 necrotic damage and you regain hit points equal to the necrotic damage dealt. | no record for DMG; number 6d6 unexplained
- `item|tsdm|Impulse Unit#3` Once per turn, after you move at least 15 ft in a straight line, you can move up to 10 ft more in that direction without spending movement. | no record for RESOURCE; number 10 unexplained
- `item|tsgs|Signet Rings of the Fey Court#4` Each ring has 2 charges and regains all on a Long Rest. | number 2 no record explains
- `item|ttoh|Beads of Contemplation#2` The beads store ki energy for later use, up to 8 ki points. | number 8 no record explains
- `item|wdh|Blackstaff#27` 21 to 30 ft. away: 4 × the number of charges in the staff. | no record for RESOURCE; number 30,21,4 unexplained
- `species|Astral Elf|Astral Trance#2` You finish a Long Rest in 4 hours of trance. | no record for RESOURCE; number 4 unexplained
- `species|Eladrin (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | no record for RESOURCE; number 4 unexplained
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | no record for RESOURCE; number 1 unexplained
- `species|Sea Elf (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | no record for RESOURCE; number 4 unexplained
- `species|Vect|Construct Anatomy#3` You can finish a Long Rest in 4 hours if you stay motionless and conscious for them. | no record for RESOURCE; number 4 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Craftsman/Forgeknights' Guild|Portable Forge#2` If it is lost or damaged, you can repair or replace it during a Long Rest with materials worth 100+ GP. | number 100 no record explains
- `sub|Craftsman/Thunderlords' Guild|Power Cell#9` It is 1d6 per Charge Point spent plus your Intelligence modifier. | no record for RESOURCE; number 1d6 unexplained
- `sub|Druid/Circle of Preservation|Facilitated Restoration#2` You can do this a number of times equal to your Wisdom modifier (min 1), and regain all uses after a Long Rest. | number 1 no record explains
- `sub|Jaeger/Marauder Chapter|Leap Attack#1` Once per turn, if you move more than 15 feet toward a creature, or fall 10 feet or more, right before a weapon attack against it, a hit deals extra damage equal to your Momentum die. | no record for DMG,RESOURCE; number 15,10 unexplained
- `sub|Rogue/Sanguine Thief|Bloody Blades#1` After a Long Rest, spend up to 2 Hit Point Dice or Sangromancy Dice to create that many Daggers. | no record for RESOURCE; number 2 unexplained
- `sub|Sorcerer/Aristocratic|Metamagic Mastery#1` Applying Metamagic to a spell from your school costs 1 less Sorcery Point. | no record for RESOURCE; number 1 unexplained
- `sub|Vagabond/Digital Nomad|High Score#7` 15 points, Power-Up: regain a spent Battle Die, once per turn. | no record for RESOURCE; number 15 unexplained
- `sub|Wizard/School of Gastronomy|Monster Dish#5` A creature eating it at the end of a Short or Long Rest rolls d6s equal to the ingredient's challenge rating (1d6 for CR 1/2 or lower) and gains that many temporary hit points. | number 1d6 no record explains

### SPELL (721 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Death Knight|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#3` You learn four chronomancy spells that you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tsdm|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#5` 1 Can't speak or cast spells with Verbal components. | no record for SPELL; number 1 unexplained
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | number 2 no record explains
- `sub|Rogue/Sanguine Thief|Spellcasting#2` You know three cantrips from the Wizard list and the Sangromancy school. | no record for SPELL; number 3 unexplained
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Warden/Drake-Blooded|Spellcasting#3` You know two cantrips from the Sorcerer list. | number 2 no record explains
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/Cantrip Adept|Cantrip Polymath#1` Learn two cantrips from any spell list. | no record for SPELL; number 2 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### DMG (671 uncovered)

- `item|bgdia|Shatterstick#3` When the effects ends, the shatterstick breaks apart, becoming useless, and all structures within 20 feet of it take 35 (10d6) bludgeoning damage. | no record for DMG; number 10d6,20,35 unexplained
- `item|bmt|Ruinous Flail#5` The poisoned creature takes 2d4 necrotic damage at the start of each of its turns. | no record for DMG; number 2d4 unexplained
- `item|coa|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Agony (Exalted)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Blood Spear#6` Any creature can wield the spear, but only the character 15 to wield it gains a +2 bonus to attack and damage rolls made with this magic weapon. | number 15 no record explains
- `item|dmg|Cloak of Spines#4` The attack's damage is reduced by 2d4 and the attacker takes 2d4 magical Piercing damage. | no record for DMG; number 2d4 unexplained
- `item|dmg|Grovelthrash (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Grovelthrash (Awakened)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|dmg|Hungry Weapon#3` If you are attuned and another creature tries to wield it, thorns deal it 1d4 Piercing damage each turn. | no record for DMG; number 1d4 unexplained
- `item|dmg|Justiciar's Gavel#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Lash of Immolation#6` Doing so increases the extra fire damage dealt by the whip to 2d6. | number 2d6 no record explains
- `item|dmg|Mace of the Black Crown (Awakened)#31` - The weapon's bonus to attack and damage rolls increases to +2, and the extra fire damage dealt by the weapon when it is ignited increases to 2d6. | number 2d6 no record explains
- `item|dmg|Old Elvish Rose#8` While thorny, the weapon deals an extra 1d6 Piercing damage to any target it hits. | no record for DMG; number 1d6 unexplained
- `item|dmg|Potion of Pugilism#1` For 10 minutes after you drink this potion, your Unarmed Strikes each add 1d6 Force damage when they hit. | no record for DMG; number 1d6,10 unexplained
- `item|dmg|Quiver of Energy#2` The first time each turn you hit with a weapon attack using ammunition from this quiver, it deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
- `item|dmg|Stormgirdle (Exalted)#20` - Your Storm Avatar's lightning strike deals 4d6 lightning damage (instead of 3d6). | no record for DMG; number 4d6,3d6 unexplained
- `item|dmg|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Tectonic Gauntlets#2` Your fist Unarmed Strikes deal 1d8 Bludgeoning damage (unless already higher) and double damage to objects and structures. | number double no record explains
- `item|dmg|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | number 2d6,80,320 no record explains
- `item|egw|Grovelthrash (Awakened)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|egw|Lash of Shadows (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Will of the Talon (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|tdm14|Blaster Prototype#6` Lock-On: use an action to deal 2d6 Radiant damage to a creature you see within 30 ft with no attack roll. | no record for DMG; number 2d6,30 unexplained
- `item|tdm14|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | no record for DMG; number 1d4,2d4 unexplained
- `item|tdm14|Thaumatonic Rifle, +2#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +2 bonus to attack and damage rolls. | number 2d6,80,320 no record explains
- `item|tsdm|Concussion Grenade#9` The Thunder damage rises by 1d6 and the radius by 5 ft for each grenade, up to 10d6 and a 30-ft-radius Sphere. | no record for DMG; number 1d6,10d6,5,30 unexplained
- `item|tsgs|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | no record for DMG; number 3d8 unexplained
- `item|wdh|Blackstaff#10` On a 1, the staff retains its +2 bonus to attack and damage roll but loses all other properties. | no record for DMG; number 2 unexplained
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | no record for DMG; number 2d10,1d10 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Artificer/Magneticist|Metal Slinger#10` When you hit a creature, you can deal an extra 1d6 damage of the weapon's type and move a Medium or smaller target 10 ft directly toward or away from you. | no record for DMG; number 1d6,10 unexplained
- `sub|Barbarian/Path of the Drifter|Relentless Aggression#1` Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft. | no record for DMG; number 1d10,5 unexplained
- `sub|Cleric/Lust Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Psychic damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Moon Domain (Deep Magic)|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Druid/Circle of Configuration|Mecha Configuration#7` Your melee hits deal an extra 1d6 Force damage. | no record for DMG; number 1d6 unexplained
- `sub|Druid/Circle of Mutation|Endless Evolution#9` +1 to attack and damage rolls with the form's attacks. | no record for DMG; number 1 unexplained
- `sub|Ranger/Green Reaper (2014)|2nd-Level Effects#4` Suffer: for 1 minute the first time it takes Poison damage each turn it takes an extra 1d6. | no record for DMG; number 1d6,1 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Form#7` You can move through creatures and objects as Difficult Terrain, and take 1d10 Force damage if you end your turn inside an object. | no record for DMG; number 1d10 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Empowered Breath Weapon#2` The area becomes a 30-foot Cone or a 60-foot Line, and it adds your Charisma modifier (minimum +1) to the damage. | no record for DMG; number 30,60 unexplained

### PROF (665 uncovered)

- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | no record for PROF; number pb unexplained
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | no record for PROF; number half,pb unexplained
- `class|Investigator|Expertise~2#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Rogue|Expertise~2#1` Choose two skills you're proficient in. | no record for PROF
- `class|Rogue|Expertise~2#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | no record for PROF; number 2 unexplained
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Reptiloid|Reptiloid#3` It is a ranged attack with range 30 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|dmg|Brawling Gloves (very rare)#2` You are proficient with all improvised weapons and gain +3 to attack and damage rolls made with them. | no record for DMG,PROF; number 3 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | no record for PROF; number 2 unexplained
- `item|dmg|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|thhw|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Human Chassis|Adaptable Acumen#2` Pick one of them, or another skill or tool you are proficient in, and your Proficiency Bonus is doubled on checks that use it. | number pb no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `sub|Barbarian/Path of the Dad|Paternal Proficiencies#1` You gain proficiency with two sets of Artisan's Tools of your choice. | no record for PROF
- `sub|Barbarian/Path of the Dragon|Wyrm Teeth#2` As a bonus action, make a melee bite attack against a creature you see within 5 ft. You are proficient with it. | no record for PROF; number 5 unexplained
- `sub|Bard/College of Investigation|Bonus Proficiencies#1` Gain proficiency in Insight and two of Acrobatics, Deception, Investigation, Performance, Sleight of Hand or Stealth. | no record for PROF; number 2 unexplained
- `sub|Bard/College of Lore (2014)|Bonus Proficiencies#1` You gain proficiency in three skills of your choice. | no record for PROF
- `sub|Cleric/Arcana Domain (2014)|Arcane Initiate#1` You gain proficiency in Arcana and learn two cantrips from the Wizard list. | no record for PROF; number 2 unexplained
- `sub|Fighter/Nightwatcher|Skilled Guardian#2` You also gain proficiency in two skills from Deception, History, Insight, Intimidation, Investigation, Perception and Stealth. | no record for PROF; number 2 unexplained
- `sub|Ranger/Grove Warden|Wrath of the Forest#1` When you take the Attack action, use a bonus action to have a rock, branch, root or similar small object strike a creature within 30 ft. You are proficient with it, it counts as magical, you add your Dexterity modifier t | no record for DMG,PROF; number 1d8,30 unexplained
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#3` You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons. | no record for DMG,PROF; number pb unexplained

### ADV (612 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV; number 10 unexplained
- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | no record for ADV,DIS; number 1 unexplained
- `feat|Deathbound|Deathbound#2` If you have two Death Saving Throw failures, you have Advantage on Death Saving Throws until you are no longer at 0 Hit Points. | no record for ADV; number 2 unexplained
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|dmg|Candle of Invocation#5` While you are inside that light, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `item|dmg|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|dmg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#6` 4 Gray: Advantage on saves against Charmed and Frightened. | no record for ADV; number 4 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Greatsword of the Craven#2` While attuned you gain 5 ft of speed and Advantage on initiative. | no record for ADV,INIT,SPEED; number 5 unexplained
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tee24|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsgs|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|ttoh|Asphodel#10` Bury a prized possession of at least uncommon rarity beside the plant (1 minute of work) to have Advantage on death saving throws for 4 hours. | no record for ADV; number 1,4 unexplained
- `species|Avia-Ra (DM14)|Blessings of the Sun#3` While it lasts, if you roll a 4 on the d4 you add to an attack roll or save, you have Advantage on that roll. | no record for ADV,ATK; number 1d4 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | no record for ADV,SPEED; number 30 unexplained
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | no record for ADV,SENSE; number 60 unexplained
- `sub|Paladin/Oath of the Guardian|Channel Divinity#2` For 1 minute each has Advantage on Strength, Constitution and Charisma saves. | no record for ADV; number 1 unexplained
- `sub|Rogue/Thief (2014)|Supreme Sneak#1` You have Advantage on a Dexterity (Stealth) check if you move no more than half your Speed on the same turn. | no record for ADV,SPEED; number half unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/Timekeeper|Temporal Points#6` Option three: Advantage on your next Dexterity check. | no record for ADV; number 3 unexplained
- `sub|Wizard/Void Caster|Void Affinity#1` You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint. | no record for ADV; number double unexplained

### SPEED (541 uncovered)

- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | no record for SPEED; number 0 unexplained
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | no record for SPEED; number 3 unexplained
- `feat|Sentinel (2014)|Sentinel (2014)#2` When you hit a creature with an opportunity attack, its Speed becomes 0 for the rest of the turn. | no record for SPEED; number 0 unexplained
- `item|dmg14|Carpet of Flying, 3 ft. × 5 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Burrowing Adaptation#1` Graft (donor: a creature with a Burrow Speed of 10+ ft). | no record for SPEED; number 10 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|dmg|Couatl Herald's Radiance#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#7` 5 Gold: Climb Speed equal to your Speed. | no record for SPEED; number 5 unexplained
- `item|dmg|Mythallar Cloak#5` While the cloak's magic is active, you gain a Fly Speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|dmg|Ornithopter of Flying#2` The ornithopter has a flying speed of 30 feet, and it moves according to your spoken directions while you are riding it. | no record for SPEED; number 30 unexplained
- `item|dmg|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tdm14|Wings#4` Deployed, you have a flying speed equal to your walking speed, for 10 minutes total until you finish a short or long rest. | no record for RESOURCE,SPEED; number 10 unexplained
- `item|tee24|Soarsled#1` A crystal disk 5 ft across that carries up to 400 lb. In Sharn or another Syranian manifest zone, stand on it and use a Magic action to make it hover. | no record for SPEED; number 5 unexplained
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|tsgs|Ionbreaker, the Tempest's Reach#15` Fly Speed equal to Speed, hovering within 20 ft of the ground. | number 20 no record explains
- `item|ttoh|Victory Banner#4` When you roll a 20 on a weapon attack, you can spend 1 charge to move up to your Speed without provoking Opportunity Attacks. | no record for SPEED; number 1 unexplained
- `item|twow|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
- `species|Aven (Dominaria)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Mandrake|Entangling Vines#2` Its Speed is 0 and cannot increase until the end of its next turn. | no record for SPEED; number 0 unexplained
- `species|Wulven|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | no record for RESOURCE,SPEED; number 10,half unexplained
- `sub|Fighter/Buccaneer|Burst Maneuvers#8` Sudden Advance: move up to half your speed without provoking opportunity attacks. | no record for SPEED; number half unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | number double no record explains
- `sub|Monk/Way of Concordant Motion|Cooperative Ki#4` Step of the Wind: spend 1 extra Ki so one ally you see within 30 ft can use a Reaction to move up to half its speed without opportunity attacks. | no record for SPEED; number 30,1,half unexplained
- `sub|Monk/Way of the Four Fists|Grasp of The Monkey#2` You have a climbing speed equal to your walking speed and double your jump distance. | no record for SPEED; number double unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Necromancer/Reaper|Wraith Flight#2` A thrall that already flies has its Fly Speed doubled. | no record for SPEED; number double unexplained
- `sub|Paladin/Oath of the Elements|Elemental Champion#2` You gain the air elemental's flying speed (90 ft, hover), or the earth elemental's Earth Glide and 30-ft climbing, swimming and crawling speeds, or the water elemental's 90-ft climbing, swimming and crawling speeds. | no record for SPEED; number 90,30 unexplained
- `sub|Rogue/Grifter|Cut And Run#2` When you take the Disengage action, you can move up to half your speed. | no record for SPEED; number half unexplained
- `sub|Sorcerer/Aberrant Mind|Revelation in Flesh#8` A Swim Speed of twice your Speed and underwater breathing. | no record for SPEED; number double unexplained
- `sub|Sorcerer/Storm Sorcery|Wind Soul#2` As an action you can lower your Fly Speed to 30 feet for 1 hour and give creatures within 30 feet, up to 3 plus your Charisma modifier, a magical Fly Speed of 30 feet for 1 hour. | no record for SPEED; number 30,3 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Warlock/The Parasite|Physical Specimen#5` Your jumps triple and you gain a climb speed equal to your walking speed. | no record for SPEED; number 3 unexplained
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | no record for SPEED; number 0 unexplained

### RES (425 uncovered)

- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|egw|Stormgirdle (Exalted)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|ttoh|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Paladin/Oath of Safeguarding|Aura of Preservation#4` At level 18 the range is 30 ft, and friendly creatures within 10 ft have Resistance to all Bludgeoning, Piercing and Slashing damage. | no record for RES; number 30,10 unexplained
- `sub|Paladin/Oath of Winter|Channel Divinity#4` Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. | no record for RES; number 0 unexplained
- `sub|Paladin/Oath of the Ancients (2014)|Aura of Warding#1` You and friendly creatures within 10 feet have Resistance to damage from spells. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Hearth (ToH)|Roaring Fire#3` A cold creature that starts its turn within 20 ft takes 2d8 Fire damage, ignoring Fire resistance and immunity. | no record for DMG,IMM,RES; number 2d8 unexplained
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for RES,SENSE; number 60,30 unexplained
- `sub|Warlock/Primordial|Adaptive Shroud#2` If you also spend a spell slot, the Resistance lasts a number of rounds equal to your Proficiency Bonus. | no record for RES,SLOT; number pb unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### NUM (361 uncovered)

- `feat|Athlete|Athlete#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Heavy Armor Master (2014)|Heavy Armor Master (2014)#6` While you wear Heavy armor, Bludgeoning, Piercing, and Slashing damage from nonmagical weapons is reduced by 3. | number 3 no record explains
- `feat|Martial Weapon Training|Martial Weapon Training#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|ai|Orrery of the Wanderer#12` - 2 minor beneficial properties | number 2 no record explains
- `item|bgg|Adze of Annam#6` - 2 minor detrimental properties | number 2 no record explains
- `item|bgg|Glowrune Pigment#1` This set of 1d4 + 2 small paint pots contains pigments mixed from crushed luminescent gemstones. | number 1d4,2 no record explains
- `item|cm|Orcus Figurine#11` It attacks all non-undead creatures it encounters, and it disappears after 1 hour or when reduced to 0 hit points. | number 1,0 no record explains
- `item|coa|Accounting and Valuation of All Things#6` - 1 major beneficial property | number 1 no record explains
- `item|coa|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Blade of Avernus#9` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | number 0,pb no record explains
- `item|dmg|Figurine of Wondrous Power#24` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Grimoire Infinitus (Exalted)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|dmg|Hammer of Thunderbolts#13` Might of Giants: the Strength score that your Belt of Giant Strength or Gauntlets of Ogre Power gives you rises by 4, up to a maximum of 30. | number 4 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#25` While it circles your head, your Constitution rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#41` While it circles your head, your Proficiency Bonus is 1 higher. | number 1,pb no record explains
- `item|dmg|Manual of Gainful Exercise#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Strength, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | number 5 no record explains
- `item|dmg|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +1#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2,3 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | number 1,2 no record explains
- `item|dmg|Vox Seeker#5` A vox seeker reduced to 0 hit points is destroyed. | number 0 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Talarith#5` The golem vanishes after 1 hour, or when it is reduced to 0 hit points. | number 0 no record explains
- `item|tce|Lifewell Tattoo#9` When you would be reduced to 0 hit points, you drop to 1 hit point instead. | number 0 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|thhw|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | number 2d4,10,2 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | number 5 no record explains
- `item|tvss14|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains

### SLOT (354 uncovered)

- `class|Druid|Archdruid#7` For example, converting two uses of Wild Shape creates a level 4 spell slot. | no record for RESOURCE,SLOT; number 2 unexplained
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | no record for SLOT,SPELL; number 2 unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Charm of Restoration#2` Spend 1 charge to cast Lesser Restoration or 2 charges to cast Greater Restoration, with no spell slot and no components. | no record for SLOT; number 1,2 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|twow|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Druid/Circle of the Titan|Titan Form#12` If already Prone it takes 1d10 Bludgeoning per slot level. | no record for SLOT; number 1d10 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,RESOURCE,SLOT; number 1d6 unexplained
- `sub|Ranger/Primordial Archer|Witching Arrows#2` Listed damage rises by 2d6 per slot level above 1. | no record for DMG,SLOT; number 2d6,1 unexplained
- `sub|Sorcerer/Mirrorkin|Copycat#1` As an action, perform any action a humanoid other than you performed within the last minute, if you see it within 60 ft. You ignore the usual prerequisites, such as a holy symbol, ki points or consumed items, but a spell | no record for SLOT; number 60 unexplained
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### CHOICE (272 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Hedgecraft|Hedgecraft#5` You gain two magic plants of your choice, each kept in a small pot, pouch or similar container you carry. | no record for CHOICE; number 2 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Skilled|Skilled#1` Pick three skills or tools, in any mix. | no record for CHOICE; number 3 unexplained
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `item|tgh14p|Rod of the Pack Master#2` While holding it, choose any number of willing creatures you see within 30 ft. You can hold it in your teeth, and it works in hybrid or kindred form. | no record for CHOICE; number 30 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | no record for CHOICE; number double,pb unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Rogue|Expertise~2#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | angka: 2
- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | angka: 10
- `class|Warden|Sentinel's Strike#8` It takes Bludgeoning damage equal to 1d8 plus the Shield's AC bonus. | angka: 1d8
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Monk|Body and Mind#2` Your Dexterity and Wisdom scores each increase by 4, to a maximum of 25. | angka: 4
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | angka: half,pb
- `class|Barbarian|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | angka: half
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | angka: 4
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | angka: half
- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Shaman|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | angka: 4
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | angka: 1
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | angka: half,pb
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3

### feat (282)

- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Exomorph|Exomorph#2` While you have all your Hit Points, you gain a +2 bonus to AC. | angka: 2
- `feat|Inner Resilience|Inner Resilience#5` If you already have ki points, your ki point maximum rises by 3 instead. | angka: 3
- `feat|Impaired Vision|Impaired Vision#5` You have blindsight 10 feet. | angka: 10
- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Infernal Dragoon|Infernal Dragoon#13` You can cast it once per Long Rest without a spell slot, and when you do its duration is 8 hours. | angka: 8
- `feat|Laser Swordmaster|Laser Swordmaster#2` While you wield an antimatter dagger, laser halfsword or laser sword you are proficient with, and a creature hits you with a ranged blaster attack or one of those weapons, you can use your reaction to | angka: pb
- `feat|Piercer|Piercer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Boon of Dimensional Travel|Boon of Dimensional Travel#2` Pick one ability score and raise it by 1 (maximum 30). | angka: 1,30
- `feat|Marksman|Marksman#6` A hostile creature within 5 feet does not give you Disadvantage on ranged attack rolls, and neither does a Prone creature within 30 feet. | angka: 5,30
- `feat|Grendel|Grendel#9` On your first turn in combat, you add your Proficiency Bonus to attack rolls, ability checks and saving throws. | angka: pb
- `feat|Chief Engineer (2014)|Chief Engineer (2014)#8` A repaired system or weapon regains 5 mega hit points instead of 1. | angka: 5,1
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | angka: 2
- `feat|Dual Wielder|Dual Wielder#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Owlbearman|Owlbearman#2` Your hooked beak makes unarmed strikes that deal 1d6 + your Strength modifier piercing damage. | angka: 1d6
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | angka: pb
- `feat|Bloodlust|Bloodlust#7` You can use this a number of times equal to your Proficiency Bonus and regain all expended uses when you finish a Long Rest. | angka: pb
- `feat|Boon of the Night Spirit|Boon of the Night Spirit#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Magitechnician (Dark Matter)|Magitechnician (Dark Matter)#3` If one of your magic items calls for a saving throw, it uses this DC when it is higher: 8 plus the modifier of the ability this feat raised plus your Proficiency Bonus. | angka: 8,pb
- `feat|Telekinetic (2014)|Telekinetic (2014)#10` It must succeed on a Strength saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised) or move 5 feet toward you or away from you. | angka: 5,8,pb
- `feat|Boon of Fortitude|Boon of Fortitude#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | angka: 4
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | angka: 2
- `feat|Hulking Figure|Hulking Figure#3` Once per turn, you can deal an extra 1d4 Bludgeoning damage to a target you hit with an Unarmed Strike. | angka: 1d4
- `feat|Stalker (ToH)|Stalker (ToH)#3` You have Advantage on Wisdom (Survival) checks to track a creature you have seen in the past 24 hours. | angka: 24
- `feat|Poisoner|Poisoner#10` A creature that takes damage from the coated item makes a Constitution saving throw against a DC of 8 plus your Proficiency Bonus plus the modifier of the ability this feat increased. | angka: 8,pb
- `feat|Greater Mark of Shadow|Greater Mark of Shadow#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | angka: 2
- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 5,20
- `feat|Medium Armor Master|Medium Armor Master#4` If your Dexterity score is 16 or higher, you can add 3 instead of 2 to your Armor Class while you wear Medium armor. | angka: 3,2

### item (2219)

- `item|tsgs|Ferryman's Take#6` A conscious one enters a death-like state for 1 hour, with Immunity to Psychic damage (once per 24 hours). | angka: 1,24
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | angka: 1,50
- `item|idrotf|Blessing of the Morninglord#1` You gain 10 Temporary Hit Points each day at dawn. | angka: 10
- `item|dmg|Locksmith's Bane#2` You get +3 to Dexterity (Sleight of Hand) checks to pick a lock with it. | angka: 3
- `item|dmg|Blackstaff#26` 11 to 20 ft. away: 6 × the number of charges in the staff. | angka: 11,6
- `item|tsgs|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | angka: 12
- `item|dmg|Ioun Stone#35` While it circles your head, your Intelligence rises by 2, up to a maximum of 20. | angka: 2
- `item|tce|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | angka: 2
- `item|dmg|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | angka: 1d10
- `item|dmg|Doomhammer#6` While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). | angka: double
- `item|dmg|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|dmg|Portfolio Keeper#1` At rank 2, you gain the use of a weathered leather pouch that is an uncommon magic item. | angka: 2
- `item|tsgs|Wildman's Spinning Cleaver#4` Once per turn when you make a ranged attack with it while Raging, make a second ranged attack as part of it against a different target within 10 ft of the first, even beyond long range, treated as the | angka: 10
- `item|dmg|Sanctified Cannon#5` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn after you do. | angka: 0
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|dmg|Spell Gem (Quartz)#10` Spells cast from the spell gem have a save DC of 13 and an attack bonus of +5. | angka: 13,5
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | angka: 5,double
- `item|dmg|Ironleaf Oaken Shield#3` It reshapes onto you when you transform into a Beast, still giving +1 AC, and returns to your arm when you revert. | angka: 1
- `item|coa|Accounting and Valuation of All Things#7` - 1 major detrimental property | angka: 1
- `item|tdcsr|Honor's Last Stand (Exalted)#4` +1 AC while you hold it, on top of the shield's normal bonus. | angka: 1
- `item|tghg|Dämglesvir (Master)#9` Curse: each time you hit with it, your Hit Point maximum drops by 1 until a Long Rest. | angka: 1
- `item|tgh14c|Greatsword of the Craven#2` While attuned you gain 5 ft of speed and Advantage on initiative. | angka: 5
- `item|tsgs|Tether Tearer#2` When you hit a creature with Incorporeal Movement, it takes an extra 1d6 Force damage and cannot use that trait until the end of its next turn. | angka: 1d6
- `item|dmg|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | angka: 2d6,80,320
- `item|misc14|Charm of the Creeping Hand#2` The attack deals an extra 1d10 Necrotic damage and you gain 5 temporary hit points. | angka: 1d10,5
- `item|dmg|Jewel of Three Prayers (Exalted)#44` - Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed. | angka: 30
- `item|dmg|Agony (Exalted)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | angka: 1d6
- `item|tvss14|Blindfold of True Darkness#1` You have blindsight to 10 ft, which lets you see anything not behind cover, including invisible creatures that fail to hide from you. | angka: 10
- `item|dmg|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | angka: 1d6
- `item|frafi|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | angka: 12d6

### species (177)

- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Trollkin Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Dwarf|Stonecunning#1` Bonus Action: Tremorsense 60 ft for 10 minutes while on or touching stone. | angka: 60,10
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Astral Elf|Astral Trance#2` You finish a Long Rest in 4 hours of trance. | angka: 4
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Drow; Star Elf|Drow Subtlety#1` When you hide, conceal a weapon or take any action contested by a creature's passive Perception, you can subtract 5 from that score. | angka: 5
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Elf (WoW)|Trance#2` You finish a Long Rest in 4 hours of light trance while staying aware. | angka: 4
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Human and Half-Elf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | angka: 1d6
- `species|Fey; Star Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Drow|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Derro Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Bhain Kwai Minotaur|Natural Attacks#1` Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Tauren|Horns#1` Your Unarmed Strike can deal Piercing damage equal to 1d6 plus Strength modifier instead of its normal damage. | angka: 1d6
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Warforged (2014)|Sentry's Rest#1` You finish a Long Rest after 6 hours inactive and motionless. | angka: 6
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | angka: 2
- `species|Gnome Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Bhain Kwai Minotaur|Wetland Dweller#2` Swim Speed 25 feet. | angka: 25
- `species|Elf/Shadow Fey Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Pluvenn|Nocturnal/Diurnal#1` You have Darkvision 60 ft. A Long Rest takes you only 4 hours. | angka: 4

### sub (957)

- `sub|Sorcerer/Shadow Sorcery|Power of Shadow#2` You have Darkvision with a range of 120 feet and Blindsight with a range of 10 feet. | angka: 120,10
- `sub|Monk/Warrior of the Living Weapon|Reflexive Adaptation#2` After a Short Rest you can remove 1 Exhaustion level. | angka: 1
- `sub|Captain/Star-Spangled Banner|Shield Fighter#4` Damage: 1d8 Bludgeoning plus the ability modifier used for the attack roll. | angka: 1d8
- `sub|Paladin/Oath of Glory (2014)|Aura of Alacrity#1` Your Speed increases by 10 feet. | angka: 10
- `sub|Cleric/Twilight Domain|Eyes of Night#3` As a Magic action you can share this Darkvision for 1 hour with willing creatures you can see within 10 feet, up to your Wisdom modifier (minimum one). | angka: 10
- `sub|Monk/Way of the Dragon|Draconic Onslaught#1` When you use Step of the Wind and then hit with an attack, it deals an extra 2d6 damage of your affiliation's type. | angka: 2d6
- `sub|Wizard/Somnomancer|Somnambulist#2` Instead your Speed is halved and you have Disadvantage on D20 Tests. | angka: 1d20
- `sub|Barbarian/Path of Booming Magnificence|Resonant Bellow#2` Each creature freed gains 1d12 + Charisma modifier (minimum +1) temporary hit points for 1 hour. | angka: 1d12
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | angka: 1,3
- `sub|Wizard/Chronurgy Magic|Momentary Stasis#4` While encased it is Incapacitated with Speed 0. | angka: 0
- `sub|Sorcerer/Reincarnated Hero|Armored Sorcery#1` You gain proficiency with light armor, medium armor, shields and four martial weapons of your choice. | angka: 4
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | angka: double,pb
- `sub|Paladin/Oath of the Giving Grave|Tenacious Life#2` If you start your turn with fewer than half your Hit Points, you regain 5 Hit Points. | angka: 5,half
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | angka: 3
- `sub|Bard/College of Tactics|Setting the Board#1` As a bonus action, command up to three willing allies who see or hear you to use their Reactions to move up to half their speed without provoking opportunity attacks. | angka: 3,half
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#2` Add your Proficiency Bonus to its AC, attack rolls, damage rolls, and to saves and skills it is proficient in. | angka: pb
- `sub|Barbarian/Path of the Wrathful Dead|Dark Doom Revisited#10` Fail: Cold damage and Speed halved for 1 minute. | angka: 1
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#8` 4 Disadvantage on attack rolls and Wisdom (Perception) checks. | angka: 4
- `sub|Warmage/House of Bishops|Siege Casting#2` You have Advantage on spell attack rolls against targets 100 feet or more away. | angka: 100
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | angka: 5
- `sub|Martyr/Burden of Awakening|Prescient Strike#1` Once per turn, when you roll an 18 or 19 on the d20 for an attack, treat it as a 20. | angka: 1d20,19,20
- `sub|Druid/Circle of the City|City Shape#5` On each of your turns you can raise up to three low walls (2.5 ft high, 5 ft wide, 1 ft deep, giving a Medium creature cover). | angka: 5,2
- `sub|Wizard/Magic Missile Mage|Versatile Missiles#2` Trip, 1 dart: Strength save against your DC or Prone. | angka: 1
- `sub|Cleric/Speed Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | angka: 1d8
- `sub|Monk/Way of Street Fighting|Combo#2` The bonus resets to 0 if you take damage on your turn. | angka: 0
- `sub|Rogue/Soulspy|Spellcasting#2` You learn three cantrips from the cleric list and a fourth at level 10. | angka: 3
- `sub|Vagabond/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | angka: double
- `sub|Artificer/Forge Adept|Runes of War#7` While in it, you and your allies deal an extra 1d4 damage of that type with weapon attacks and Unarmed Strikes. | angka: 1d4
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | angka: 1d6

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|tsgs|Monsterbane Lasher#3` On a melee hit, channel one or more runes to add 2d4 of each chosen type. -> info:NUMONLY:ROLL
- class `item|tsgs|Monsterbane Lasher#3` On a melee hit, channel one or more runes to add 2d4 of each chosen type. -> info:NUMONLY:ROLL
- record `sub|Witch/Purple Magic|Deceitful Transposition#8` You can use this a number of times equal to your Charisma modifier (minimum once) and regain all uses after a Long Rest. -> covered
- class `sub|Witch/Purple Magic|Deceitful Transposition#8` You can use this a number of times equal to your Charisma modifier (minimum once) and regain all uses after a Long Rest. -> info:REST:NONUM
- record `class|Ranger|Tireless#4` The number of times you can take this action equals your Wisdom modifier (minimum of once), and finishing a Long Rest re -> info:REST:NONUM
- class `class|Ranger|Tireless#4` The number of times you can take this action equals your Wisdom modifier (minimum of once), and finishing a Long Rest re -> info:REST:NONUM
- record `sub|Druid/Circle of Configuration|Mecha Configuration#10` Long Rest to use again. -> covered
- class `sub|Druid/Circle of Configuration|Mecha Configuration#10` Long Rest to use again. -> info:REST:NONUM
- record `item|dmg|Stormgirdle (Awakened)#5` In addition, you can use an action to become a Storm Avatar for 1 minute, gaining the following benefits for the duratio -> info:NUMONLY:GEOMETRY
- class `item|dmg|Stormgirdle (Awakened)#5` In addition, you can use an action to become a Storm Avatar for 1 minute, gaining the following benefits for the duratio -> info:NUMONLY:GEOMETRY
- record `class|Fighter|Action Surge#4` From level 17, you can use it twice between rests, but no more than once on the same turn. -> info:NUMONLY:TEXT
- class `class|Fighter|Action Surge#4` From level 17, you can use it twice between rests, but no more than once on the same turn. -> info:NUMONLY:TEXT
- record `sub|Witch/Black Magic|Black Magic Spells#3` 5 Animate Dead, Vampiric Touch. -> info:NUMONLY:TABLE
- class `sub|Witch/Black Magic|Black Magic Spells#3` 5 Animate Dead, Vampiric Touch. -> info:NUMONLY:TABLE
- record `item|dmg14|Figurine of Wondrous Power, Silver Raven#13` Once it has been used, it can't be used again until 2 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg14|Figurine of Wondrous Power, Silver Raven#13` Once it has been used, it can't be used again until 2 days have passed. -> info:NUMONLY:GEOMETRY
- record `item|pota|Ironfang#12` - You can sense the presence of precious metals and stones within 60 feet of you, but not their exact location. -> info:NUMONLY:GEOMETRY
- class `item|pota|Ironfang#12` - You can sense the presence of precious metals and stones within 60 feet of you, but not their exact location. -> info:NUMONLY:GEOMETRY
- record `sub|Artificer/Portalweaver|Portal Device#1` With a Long Rest and Weaver's Tools, you turn a Tiny nonmagical object you touch, such as a Light Crossbow, into your Po -> covered
- class `sub|Artificer/Portalweaver|Portal Device#1` With a Long Rest and Weaver's Tools, you turn a Tiny nonmagical object you touch, such as a Light Crossbow, into your Po -> info:REST:NONUM
- record `item|dmg|Houseward (Uncommon)#2` A 1-cubic-foot lead block with a Siberys dragonshard, usually set into a floor. -> info:NUMONLY:FLAVOR
- class `item|dmg|Houseward (Uncommon)#2` A 1-cubic-foot lead block with a Siberys dragonshard, usually set into a floor. -> info:NUMONLY:FLAVOR
- record `sub|Fighter/Samurai|Strength before Death#4` You regain use after a Long Rest. -> covered
- class `sub|Fighter/Samurai|Strength before Death#4` You regain use after a Long Rest. -> info:REST:NONUM
- record `item|dmg|Scribing Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> covered
- class `item|dmg|Scribing Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Witch/Green Magic|Green Magic Spells#3` 5 Plant Growth, Speak with Plants. -> info:NUMONLY:TABLE
- class `sub|Witch/Green Magic|Green Magic Spells#3` 5 Plant Growth, Speak with Plants. -> info:NUMONLY:TABLE
- record `sub|Necromancer/Pharaoh|Channel Divinity#5` A Short Rest returns one and a Long Rest returns all. -> covered
- class `sub|Necromancer/Pharaoh|Channel Divinity#5` A Short Rest returns one and a Long Rest returns all. -> info:REST:NONUM
