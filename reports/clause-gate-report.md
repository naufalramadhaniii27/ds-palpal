# Laporan clause gate (mode laporan, 2026-11-12)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73254 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36782 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8225 |
| Info (tag terdokumentasi) | 23601 (SPELL_TEXT 6470, FORM:ACTIVATE 2723, NUMONLY:GEOMETRY 2232, FORM:ROLL 1938, NUMONLY:TEXT 1341, ACTIVATE 1309, FORM:TABLE 1156, NUMONLY:ROLL 984, NUMONLY:TABLE 862, FXO_NULL 828, ACTIVE:TRIGGER 784, ACTIVE:OTHERS 642, REST:NONUM 586, NUMONLY:FLAVOR 305, STD:ASI 208, COND:PLAY_STATE 188, NUMONLY:ZERO 162, ROLL:LAST_CHARGE 136, OBJECT:STATS 106, ITEM:SENSES 82, DC:REFERENCE 77, BY_DESIGN 72, TABLE:CLASS 70, COND:ATTACK_ROLL_ADV 68, STD:PICK_TEXT 63, ACTIVE:REACTION 56, MOVE:SPEED_REF 50, ACTIVE:TIMED_IMM 43, TARGET:SPEED 30, FOCUS:SPELLCASTING 14, STD:AC10 7, KNOW:TARGET_DEFENSES 7, POOL:SHARED 2) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 4956 |
| Uncovered dengan angka | 2962 |
| Uncovered dengan kelas kata kunci mekanik | 4596 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 360 |
| Angka yang tidak dijelaskan record mana pun | 2768 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4165 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 306 |
| Waktu | muat data 1 s, analisis 13 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 185 ditangkap (62.1%). Hapus semua atom kelas yang dibutuhkan: 186 ditangkap (62.4%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 294 ditangkap (98.0%), semua atom kelas dihapus: 297 ditangkap (99.0%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3153 |
| GX | 1924 |
| wxs | 707 |
| LU_X | 536 |
| CODE | 375 |
| ITEM_SPELLS | 363 |
| species | 352 |
| AUTO | 315 |
| feat | 246 |
| SPELL_FX | 241 |
| cls | 132 |
| SAVE_NOTES | 75 |
| FXO | 56 |
| SPELLS | 37 |
| sub | 28 |
| FDMG | 17 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 236, fx-L4.js 192, fx-L12.js 152, fx-L2.js 142, fx-L1.js 139, fx-L3.js 135, fx-L10.js 128, fx-Z5.js 123, fx-L9.js 101, fx-N1.js 100, fx-L11.js 97, fx-Z3.js 90.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 876 | 13.2% |
| SPELL | 2882 | 720 | 25.0% |
| DMG | 3912 | 658 | 16.8% |
| SPEED | 1135 | 404 | 35.6% |
| CHOICE | 1345 | 357 | 26.5% |
| PROF | 883 | 354 | 40.1% |
| ADV | 1516 | 353 | 23.3% |
| RES | 1123 | 329 | 29.3% |
| NUM | 7110 | 322 | 4.5% |
| SLOT | 1121 | 314 | 28.0% |
| IMM | 852 | 308 | 36.2% |
| DC | 2624 | 225 | 8.6% |
| DIS | 932 | 213 | 22.9% |
| ATK | 860 | 182 | 21.2% |
| AC | 593 | 165 | 27.8% |
| SENSE | 515 | 148 | 28.7% |
| SAVE | 272 | 139 | 51.1% |
| HP | 142 | 82 | 57.7% |
| NUM-DICE | 1262 | 71 | 5.6% |
| ABIL | 357 | 62 | 17.4% |
| INIT | 111 | 49 | 44.1% |
| NUM-DUR | 2748 | 34 | 1.2% |
| NUM-DIST | 4404 | 29 | 0.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1028 | 243 | 548 | 0 | 237 |
| feat | 2101 | 535 | 1042 | 0 | 524 |
| item | 18391 | 4677 | 10978 | 0 | 2736 |
| species | 1037 | 571 | 297 | 0 | 169 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1921 | 4266 | 0 | 1290 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2583 | 6071 | 1497 | 14.7% |
| tvss | 2815 | 664 | 1643 | 508 | 18.0% |
| core | 1503 | 393 | 801 | 309 | 20.6% |
| tsgs | 1483 | 379 | 857 | 247 | 16.7% |
| tsdm | 1222 | 326 | 675 | 221 | 18.1% |
| tkdm | 919 | 238 | 491 | 190 | 20.7% |
| tghp | 1117 | 374 | 560 | 183 | 16.4% |
| egw | 566 | 141 | 289 | 136 | 24.0% |
| au | 536 | 104 | 311 | 121 | 22.6% |
| tce | 736 | 169 | 459 | 108 | 14.7% |
| tdcsr | 416 | 134 | 185 | 97 | 23.3% |
| phb14 | 516 | 170 | 261 | 85 | 16.5% |
| dmg14 | 540 | 186 | 273 | 81 | 15.0% |
| thhw | 395 | 87 | 231 | 77 | 19.5% |
| tee24 | 464 | 166 | 232 | 66 | 14.2% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| rhw | 232 | 57 | 115 | 60 | 25.9% |
| hof | 253 | 40 | 155 | 58 | 22.9% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| tghg | 288 | 75 | 165 | 48 | 16.7% |
| misc14 | 327 | 80 | 200 | 47 | 14.4% |
| xge | 375 | 113 | 217 | 45 | 12.0% |
| coa | 158 | 49 | 65 | 44 | 27.8% |
| mot | 292 | 97 | 159 | 36 | 12.3% |
| tsgeh | 184 | 62 | 91 | 31 | 16.8% |
| bmt | 489 | 83 | 375 | 31 | 6.3% |
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
| tsdd | 69 | 23 | 34 | 12 | 17.4% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| erlw | 127 | 60 | 55 | 12 | 9.4% |
| ai | 164 | 32 | 120 | 12 | 7.3% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 27 | 71 | 12 | 10.9% |
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
| efa | 28 | 10 | 15 | 3 | 10.7% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| nf | 25 | 9 | 14 | 2 | 8.0% |
| imr | 186 | 6 | 178 | 2 | 1.1% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oota | 87 | 63 | 23 | 1 | 1.1% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 6748 | 278 | 6470 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 617 | 501 |
| SPELL | 500 | 74 |
| DMG | 488 | 449 |
| ADV | 347 | 136 |
| SPEED | 341 | 265 |
| PROF | 327 | 109 |
| NUM | 322 | 322 |
| SLOT | 297 | 92 |
| RES | 268 | 110 |
| CHOICE | 235 | 67 |
| IMM | 204 | 64 |
| DIS | 178 | 65 |
| AC | 165 | 131 |
| SAVE | 133 | 117 |
| SENSE | 131 | 114 |
| DC | 115 | 113 |
| ATK | 106 | 77 |
| HP | 82 | 59 |
| ABIL | 50 | 47 |
| NUM-DICE | 19 | 19 |
| NUM-DIST | 18 | 18 |
| INIT | 12 | 12 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (617 uncovered)

- `class|Captain|Cohort~3#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | no record for RESOURCE; number 0,1 unexplained
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | no record for RESOURCE; number 2 unexplained
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | number 10 no record explains
- `feat|Bloodlust|Bloodlust#7` You can use this a number of times equal to your Proficiency Bonus and regain all expended uses when you finish a Long Rest. | no record for RESOURCE; number pb unexplained
- `feat|Familiar Friend|Familiar Friend#10` You can use this a number of times equal to your Proficiency Bonus, and regain all uses after a Long Rest. | number pb no record explains
- `feat|Living Shadow|Living Shadow#6` You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest. | number pb no record explains
- `feat|Pyromaniac (Dark Matter)|Pyromaniac (Dark Matter)#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | no record for SPELL; number 2 unexplained
- `item|cm|Gloves of Soul Catching#3` After making a successful unarmed strike while wearing these gloves, you can use the gloves to deal an extra 2d10 force damage to the target, and you regain a number of hit points equal to the force damage dealt. | no record for DMG,RESOURCE; number 2d10 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#20` - Its number of charges increases to 5. | no record for RESOURCE; number 5 unexplained
- `item|dmg|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|dmg|Bigby's Beneficent Bracelet#16` The bracelet can create up to three copies and regains all expended uses at dawn. | number 3 no record explains
- `item|dmg|Cabal's Ruin (Exalted)#3` 4 charges, regains 1d4 at dawn. | number 1d4 no record explains
- `item|dmg|Fragment of Elder Starlight#5` Chosen living allies regain 4d6 Hit Points. | number 4d6 no record explains
- `item|dmg|Knight's Standard of Virtue#5` Changing the flag takes 1 hour of focus, possible during a Short Rest. | no record for RESOURCE
- `item|dmg|Luxon Beacon#9` Alternatively, when an attack roll is made against the creature, it can expend its fragment to roll a d20 and choose which of the d20s to use, the one it rolled or the one the attacker rolled. | number 1d20 no record explains
- `item|dmg|Manual of Iron Golems#5` To create an iron golem, you must spend 120 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | no record for RESOURCE; number 120,8 unexplained
- `item|dmg|Signet Rings of the Fey Court#4` Each ring has 2 charges and regains all on a Long Rest. | number 2 no record explains
- `item|dmg|Spindle of Fate#12` The wand regains 1d6 expended charges daily at dawn. | no record for RESOURCE
- `item|dmg|Staff of the Forgotten One#18` Each time a creature other than Acererak expends any of the staff's charges, there is a 50 percent chance that the life force tries to possess the staff wielder. | no record for RESOURCE; number 50 unexplained
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|ggr|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | number 1d10 no record explains
- `item|ggr|Pyroconverger#6` If the total is 11 or higher, the Pyroconverger malfunctions: you take 4d6 fire damage, and you can't use the Pyroconverger again until you finish a long rest. | no record for DMG; number 4d6,11 unexplained
- `item|pota|Devastation Orb of Water#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|rhw|Charm of the Black Rose#1` Expend this Charm for one of two effects. | number 2 no record explains
- `item|tee24|Blast Disk (Common)#7` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tee24|Ori Boots#4` After 10 total minutes of use, the boots stop working until you finish a Long Rest. | number 10 no record explains
- `item|tsdm|Gamma Pendant#13` The spell has no effect, its casting time is wasted, and the pendant regains charges equal to the spell's level, up to 20. | no record for RESOURCE; number 20 unexplained
- `item|tsdm|Impulse Unit#3` Once per turn, after you move at least 15 ft in a straight line, you can move up to 10 ft more in that direction without spending movement. | no record for RESOURCE; number 10 unexplained
- `item|tsgs|Fire Dervish Cloak#4` On a failure they take 1d8 Fire per charge spent and cannot make Opportunity Attacks against you this turn. | no record for RESOURCE; number 1d8 unexplained
- `item|tsgs|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|tvss|Goodberry Wine#3` You regain 10 HP and the drink feeds you for one day. | no record for RESOURCE; number 10,1 unexplained
- `item|wdh|Blackstaff#25` (Distance from Origin / Effect) 10 ft. away or closer: 8 × the number of charges in the staff. | no record for RESOURCE; number 10,8 unexplained
- `item|wdh|Blackstaff#26` 11 to 20 ft. away: 6 × the number of charges in the staff. | no record for RESOURCE; number 11,6 unexplained
- `species|Kaladesh Elf (Vahadar)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | no record for RESOURCE; number 4 unexplained
- `sub|Bard/College of the Moon|Blessing of Moonlight#3` While you glow, each time a creature fails its saving throw against this Moonbeam, another creature of your choice within 60 feet that you can see regains 2d4 Hit Points. | no record for CHOICE; number 2d4,60 unexplained
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | number 1 no record explains
- `sub|Ranger/Freerunner|Freerunning#3` Once per turn, move up to 15 ft horizontally without provoking Opportunity Attacks (no action). | number 15 no record explains
- `sub|Sorcerer/Aristocratic|Metamagic Mastery#1` Applying Metamagic to a spell from your school costs 1 less Sorcery Point. | no record for RESOURCE; number 1 unexplained
- `sub|Sorcerer/Nanite Magic|Recycling Protocol#1` When you reduce an enemy to 0 HP, or someone else does within 10 ft of you, regain 2 Sorcery Points. | number 10,0 no record explains
- `sub|Summoner/Bond of the Living Armament|Armament Eidolon#1` In a 1-hour ritual, which you can do during a Short or Long Rest, you bind your Eidolon to one Simple or Martial melee weapon and one suit of armor. | no record for RESOURCE; number 1 unexplained

### SPELL (500 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | no record for SPELL; number 3 unexplained
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Initiate of High Sorcery|Initiate of High Sorcery#5` You learn one Wizard cantrip and two 1st-level spells, chosen from your moon's list. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `item|ai|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `sub|Artificer/Artillerist|Arcane Firearm#4` When you cast an Artificer spell through it, roll 1d8 and add the result to one of the spell's damage rolls. | number 1d8 no record explains
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Dancer/Dramaturge|Spellcasting#3` You know two Bard cantrips. | number 2 no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | number 2 no record explains
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained
- `sub|Warden/Drake-Blooded|Spellcasting#3` You know two cantrips from the Sorcerer list. | number 2 no record explains
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### DMG (488 uncovered)

- `class|Investigator|Finisher#2` The extra damage is 1d8 at level 2, 2d8 at level 11, and 3d8 at level 17. | no record for DMG; number 1d8 unexplained
- `item|bmt|Ruinous Flail#2` You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals double damage to objects and structures. | number double no record explains
- `item|dmg|Agony (Exalted)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Dagger of Venom#6` If it fails, it takes 2d10 Poison damage and is Poisoned for 1 minute. | no record for DMG; number 2d10 unexplained
- `item|dmg|Grovelthrash (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Grovelthrash (Dormant)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|dmg|Lash of Shadows (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Necklace of Fireballs#5` If you do, the Fireball's damage increases by 1d6 for every bead beyond the first, to a maximum of 12d6. | no record for DMG; number 1d6 unexplained
- `item|dmg|Staff of Thunder and Lightning#20` A creature that fails has the Deafened condition for 1 minute and takes 2d6 Thunder damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|The Bloody End (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Thunderous Greatclub#8` Each nonmagical object in the Cone that nobody is wearing or carrying takes 3d8 Thunder damage. | no record for DMG; number 3d8 unexplained
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Will of the Talon (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Wraps of Dyamak (Awakened)#3` +1 to attack and damage rolls with your unarmed strike while you wear them. | number 1 no record explains
- `item|egw|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Grovelthrash (Dormant)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|egw|Grovelthrash (Exalted)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|egw|Grovelthrash (Exalted)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|egw|Lash of Shadows (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Silken Spite (Awakened)#15` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Stormgirdle (Awakened)#15` - Your Storm Avatar's lightning strike deals 4d6 lightning damage (instead of 3d6). | no record for DMG; number 4d6,3d6 unexplained
- `item|egw|Will of the Talon (Exalted)#43` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|scc|Catapult Munition#4` In addition, each object in that area that isn't being worn or carried takes 35 (10d6) fire damage. | no record for DMG; number 10d6,35 unexplained
- `item|tdcsr|Plate of the Dawnmartyr (Exalted)#8` The rebuke deals 2d6 fire damage. | no record for DMG; number 2d6 unexplained
- `item|tsdm|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `item|tsgs|Sword of Resonance#5` Your next hit with it before the end of your next turn deals an extra 1d6 Thunder damage. | number 1d6 no record explains
- `item|tsgs|Tome of Dreams#4` On 10 or lower, you take 2d4 Psychic damage from terrors. | no record for DMG; number 2d4,10 unexplained
- `item|tsgs|Trident of the Hydra#4` Each deals 1d6 Piercing damage and gets no ability modifier unless it is negative. | no record for DMG; number 1d6 unexplained
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Artificer/Battle Smith|Improved Defender#2` The extra damage and the healing of Arcane Jolt both rise to 4d6. | no record for DMG; number 4d6 unexplained
- `sub|Captain/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | no record for DMG; number 1d6 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#4` At Cleric level 11 the extra damage becomes 1d6. | no record for DMG; number 1d6 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#13` Extra Necrotic damage, 2 dice. | no record for DMG; number 2 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#4` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Martyr/Burden of Tyranny|Totalitarian Control#7` When the spell ends, you can deal 6d8 Psychic damage to the target. | no record for DMG; number 6d8 unexplained
- `sub|Rogue/Inquisitive|Eye for Weakness#1` While Insightful Fighting applies to a creature, your Sneak Attack damage against it increases by 3d6. | no record for DMG; number 3d6 unexplained
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#5` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Dragon Eidolon#23` The base damage becomes 3d6 at level 6 and 4d6 at level 14. | no record for DMG; number 3d6,1d6 unexplained

### ADV (347 uncovered)

- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | no record for ADV,INIT; number 1 unexplained
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|crcotn|Medal of Wit#2` Doing so gives you advantage on Intelligence checks and Intelligence saving throws for 1 hour. | no record for ADV
- `item|dmg|Candle of Invocation#5` While you are inside that light, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `item|dmg|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,RESOURCE,SPEED; number 30,1 unexplained
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tee24|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|tsgs|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsgs|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|tsgs|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | number 2,22 no record explains
- `sub|Barbarian/Path of the Totem Warrior|Aspect of the Beast#3` Your carrying capacity doubles, and you have Advantage on Strength checks to push, pull, lift, or break objects. | number double no record explains
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Paladin/Oath of Vengeance|Vow of Enmity#2` Your attack rolls against that creature have Advantage, which lasts 1 minute or ends sooner if you use this feature again. | number 1 no record explains
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | no record for ADV,SENSE; number 60 unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE
- `sub|Warmage/House of Bishops|Siege Casting#2` You have Advantage on spell attack rolls against targets 100 feet or more away. | no record for ADV,ATK; number 100 unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### SPEED (341 uncovered)

- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | no record for SPEED; number 7,9 unexplained
- `item|dmg|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | no record for SPEED; number 15,1 unexplained
- `item|dmg|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|dmg|Couatl Herald's Fang#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Doublet of Dramatic Demise#3` You are incapacitated and your speed is 0, but you can speak and communicate. | no record for SPEED; number 0 unexplained
- `item|dmg|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|dmg|Jewel of Three Prayers (Exalted)#44` - Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed. | no record for SPEED; number 30 unexplained
- `item|dmg|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Quaal's Feather Token, Swan Boat#6` The boat is self-propelled and moves across water at a speed of 6 miles per hour. | no record for SPEED; number 6 unexplained
- `item|dmg|Shield of Yggdrasil#5` While planted, your Speed is 5 ft and cannot rise, and you reduce Bludgeoning, Piercing and Slashing damage from weapons and Unarmed Strikes by 3. | no record for SPEED; number 5,3 unexplained
- `item|dmg|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | no record for SPEED; number 60 unexplained
- `item|dmg|Stormgirdle (Exalted)#16` - While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|egw|Grovelthrash (Exalted)#42` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | no record for SPEED; number 5,half unexplained
- `item|egw|Stormgirdle (Exalted)#21` - While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|llk|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|skt|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|skt|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|tdcsr|Skysail#2` While the wings are open and you ride it, you glide with a flying speed of 60 feet, but you must descend at least 10 feet by the end of each of your turns and cannot gain height. | no record for SPEED; number 60 unexplained
- `item|tsgs|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Ionbreaker, the Tempest's Reach#15` Fly Speed equal to Speed, hovering within 20 ft of the ground. | number 20 no record explains
- `item|tsgs|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|tsgs|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|tvss|Sprinting Legs#1` Graft (donor: a creature with Speed 60+ ft). | no record for SPEED; number 60 unexplained
- `species|Aarakocra (2014)|Flight#1` Fly Speed of 50 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 50 unexplained
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | number 10 no record explains
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | no record for SPEED; number 0 unexplained
- `sub|Artificer/Cartographer|Mapping Magic#7` You can't do this if your Speed is 0. | no record for SPEED; number 0 unexplained
- `sub|Bard/College of Birdsong|Chorus of the Sky#1` Birdsong's Fly Speed lasts 1 minute and ends at the end of the creature's turn if it spends its Bardic Inspiration die. | no record for SPEED; number 1 unexplained
- `sub|Cleric/Speed Domain|Celerity in Thought and Action#1` Your Speed rises by 5 ft. You gain proficiency in Acrobatics and Insight. | no record for PROF
- `sub|Druid/Circle of Mutation|Mutate Shape#7` 1 more point makes the Swim Speed double your Speed. | no record for SPEED; number 1,double unexplained
- `sub|Necromancer/Black Rider|Gruesome Charge#2` Each of those thralls has a Speed of 60 feet for 10 minutes. | no record for SPEED; number 60 unexplained
- `sub|Sorcerer/Aberrant Sorcery|Revelation in Flesh#5` You gain a Swim Speed of twice your Speed, and you can breathe underwater. | number double no record explains
- `sub|Summoner/Bond of the Elemental Spirit|Elemental Remodement#2` Air: Fly Speed 60 feet, and it can Grapple and be mounted while flying. | no record for SPEED; number 60 unexplained
- `sub|Warlock/The Undead|Spirit Projection#8` You have a Fly Speed equal to your Speed and can hover, and you move through creatures and objects as difficult terrain, taking 1d10 Force damage if you end a turn inside one. | no record for DMG,SPEED; number 1d10 unexplained
- `sub|Witch/Sky Magic|Corvid Familiar#3` It has a Fly Speed of 50 feet, unless it already has a faster one. | no record for SPEED; number 50 unexplained
- `sub|Wizard/Fumaturge|Smoke Animals#3` The smoke familiar has 1 HP and a Fly Speed of 60 ft whatever the Beast form. | no record for SPEED; number 60,1 unexplained

### PROF (327 uncovered)

- `class|Investigator|Expertise#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `class|Investigator|Expertise~2#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | number 1d4 no record explains
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Reptiloid|Reptiloid#4` It is a ranged attack with a range of 60 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF; number 60 unexplained
- `feat|Sharpshooter (2014)|Sharpshooter (2014)#6` Before you make an attack with a ranged weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|dmg|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Horn of Valhalla#12` 41-75, brass horn (Rare): 3 spirits, and you must have proficiency with all Simple weapons. | no record for PROF; number 41,75,3 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|dmg|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|dmg|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|dmg|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Cleric/Knowledge Domain (PSA)|Channel Divinity: Knowledge of the Ages#2` You have proficiency with it for 10 minutes. | no record for PROF; number 10 unexplained
- `sub|Investigator/Kid Sleuth|Animal Sidekick#6` The animal has Intelligence 10 and speaks one language you know. | no record for PROF; number 10 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | no record for PROF; number double,pb unexplained
- `sub|Wizard/Necrophage|Memory of Flesh#4` If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. | no record for CHOICE,PROF; number double,pb unexplained

### NUM (322 uncovered)

- `feat|Dungeon Delver|Dungeon Delver#8` Traveling at a fast pace doesn't give the usual -5 penalty to your passive Wisdom (Perception). | number 5 no record explains
- `feat|Great Weapon Master|Great Weapon Master#2` Your Strength score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Martial Weapon Training|Martial Weapon Training#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Moderately Armored|Moderately Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Piercer|Piercer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|bgdia|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|coa|Accounting and Valuation of All Things#21` You gain a passive +5 to Charisma (Persuasion) checks made to barter. | number 5 no record explains
- `item|coa|Amulet of the Inferno#8` - 2 major detrimental properties | number 2 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Accounting and Valuation of All Things#21` You gain a passive +5 to Charisma (Persuasion) checks made to barter. | number 5 no record explains
- `item|dmg|Accounting and Valuation of All Things#6` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Adze of Annam#6` - 2 minor detrimental properties | number 2 no record explains
- `item|dmg|Baba Yaga's Mortar and Pestle#8` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Crusader's Shortsword#1` The Crusader's Shortsword is a sentient lawful good +1 shortsword (Intelligence 11, Wisdom 13, Charisma 13). | number 11,13 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#17` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Figurine of Wondrous Power#40` One horn turns into a +1 Lance and the other into a +2 Longsword. | number 1,2 no record explains
- `item|dmg|Grimoire Infinitus (Exalted)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#35` While it circles your head, your Intelligence rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | number 2d4,10,2 no record explains
- `item|dmg|Moonblade#15` The blade bears one rune for each bearer it has served willingly, typically 1d6 + 1 runes. | number 1d6 no record explains
- `item|dmg|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Sundersludge Net#3` Nonmagical metal armor it wears takes a cumulative -1 AC penalty with each Acid hit and is destroyed when the AC would reach 10. | number 1,10 no record explains
- `item|dmg|Talarith#5` The golem vanishes after 1 hour, or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Tote of Tricky Treat Sugarbombs#1` A canvas bag holding 5d8 + 10 clove and pumpkin candies, with an illusory face on its pumpkin at night. | number 5d8,10 no record explains
- `item|dsotdq|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|egw|Grimoire Infinitus (Awakened)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|misc14|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|tsdm|Flashback Polaroid#1` An antique camera loaded with 1d6 + 2 blank photos. | number 1d6,2 no record explains
- `item|tsgs|Dragon's Call#2` You also get +1 to Intelligence, Wisdom and Charisma checks about dragon lore. | number 1 no record explains
- `item|tsgs|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | number 5 no record explains
- `sub|Cleric/Cat Domain|Channel Divinity: Feline Finesse#1` Add a +10 bonus to a Dexterity ability or skill check made by you or by a creature you designate within 30 ft. | number 30,10 no record explains

### SLOT (297 uncovered)

- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | no record for SLOT; number 2 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | no record for DMG,SLOT,SPELL; number 1d4 unexplained
- `item|dmg14|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|dmg|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Craftsman/Forgeknights' Guild|Fire Burst#1` While you hold your Portable Forge, you can cast Fireball centered on yourself with no spell slot and no components (DC 8 plus your Intelligence modifier plus your Proficiency Bonus). | no record for DC,SLOT; number 8,pb unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | no record for DMG,SLOT; number 2d6,10 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained

### RES (268 uncovered)

- `item|coa|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|dmg|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|egw|Stormgirdle (Exalted)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | no record for RES,SPELL; number 30 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained
- `sub|Wizard/Transmuter|Potent Stone#4` If you pick Resistance twice, you must choose different damage types. | no record for RES; number double unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### CHOICE (235 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | number 9 no record explains
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | no record for CHOICE; number 2 unexplained
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Gun-Mage Adept|Gun-Mage Adept#9` Choose a number of Firearm spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | no record for CHOICE; number 3 unexplained
- `sub|Investigator/Infernum|Infernal Bargain#11` Choose two of Acid, Cold, Fire, Lightning, Poison, Psychic, and Thunder. | no record for CHOICE; number 2 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Elemental Spirit|Twin Eidolons#7` Your magic sustains both for 10 minutes, then one of your choice dissipates. | no record for CHOICE
- `sub|Summoner/Bond of the Fiendish Chain|Dark Versatility#1` Your Eidolon gains two Evolutions of your choice that it qualifies for. | no record for CHOICE; number 2 unexplained
- `sub|Warden/Drake-Blooded|Spellcasting#11` Choose three level 1 Sorcerer spells to start. | number 3 no record explains
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (101)

- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | angka: 3
- `class|Craftsman|Masterwork Weapon#3` The weapon gets a bonus to attack and damage rolls equal to your Masterwork Bonus (+1 at level 1, and it grows as shown in the table). | angka: 1
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | angka: 2
- `class|Necromancer|Thralls#25` You still cannot raise Undead that dropped to 0 Hit Points. | angka: 0
- `class|Captain|Cohort~3#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Martyr|Divine Respite~2#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | angka: 2
- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Vagabond|Last Stand#1` When damage drops you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Vagabond level. | angka: 0,double
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | angka: 4
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Druid|Wild Shape#23` You also keep your skill and saving throw proficiencies, using your Proficiency Bonus for them, and you gain the creature's proficiencies as well. | angka: pb
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | angka: 2
- `class|Captain|Cohort~3#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | angka: 2
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Captain|Cohort~2#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Captain|Cohort~4#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | angka: double,pb
- `class|Captain|Cohort~2#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Monk|Superior Defense#1` At the start of your turn, you can spend 3 Focus Points to brace against harm. | angka: 3
- `class|Captain|Cohort~2#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | angka: 6
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | angka: 2

### feat (194)

- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Void Scribe|Void Scribe#3` While the glyph is intact, the object is vulnerable to necrotic damage and takes 1d6 necrotic damage at the end of your turn. | angka: 1d6
- `feat|Magitechnician (Dark Matter)|Magitechnician (Dark Matter)#3` If one of your magic items calls for a saving throw, it uses this DC when it is higher: 8 plus the modifier of the ability this feat raised plus your Proficiency Bonus. | angka: 8,pb
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | angka: 4,3
- `feat|Church of the Sun Above: Adherent|Church of the Sun Above: Adherent#4` When you damage a creature with a weapon, a spell or an Unarmed Strike, you can deal an extra 1d8 Radiant damage to it. | angka: 1d8
- `feat|Boon of Irresistible Offense|Boon of Irresistible Offense#2` Add 1 to your Strength or Dexterity score (maximum 30). | angka: 1,30
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | angka: 0
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | angka: 30
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Poisoner|Poisoner#10` A creature that takes damage from the coated item makes a Constitution saving throw against a DC of 8 plus your Proficiency Bonus plus the modifier of the ability this feat increased. | angka: 8,pb
- `feat|Durable|Durable#2` Your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Lordly Resolve|Lordly Resolve#5` Each target can immediately use a Reaction to right itself and end the Prone condition, provided its Speed isn't 0. | angka: 0
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Moderately Armored|Moderately Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | angka: 2
- `feat|Defensive Duelist (2014)|Defensive Duelist (2014)#3` While you hold a Finesse weapon you are proficient with and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack, which can | angka: pb
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | angka: 1d6
- `feat|Arcane Charger|Arcane Charger#4` If you moved at least 10 feet in a straight line and the cantrip hits, you can either add +5 to its damage roll or push the target 10 feet away from you. | angka: 10,5
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | angka: pb
- `feat|Piercer|Piercer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Android|Android#6` You can finish a Long Rest in 4 hours if you spend them motionless and conscious. | angka: 4
- `feat|Primordial Transformation: Stage 2|Primordial Transformation: Stage 2#10` On a failure your Primordial nature shows, and you have Disadvantage on every D20 Test for 1 minute while you fight for control. | angka: 1d20
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | angka: 2
- `feat|Survivor (Grim Hollow)|Survivor (Grim Hollow)#2` You need only half the food per day that your size normally requires. | angka: half
- `feat|Aberrant Spawn|Aberrant Spawn#8` When you deal damage with it, you can deal Bludgeoning damage equal to 1d6 plus your Strength or Dexterity modifier instead of the normal damage. | angka: 1d6
- `feat|Beastperson|Beastperson#7` When you deal damage with it, you can deal Slashing damage equal to 1d6 plus your Strength or Dexterity modifier instead of the normal damage. | angka: 1d6
- `feat|Watchers|Watchers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Shadowsteel Master|Shadowsteel Master#6` If your Shadowsteel Focus is also a weapon, its bonus to attack rolls and damage rolls is +2. | angka: 2
- `feat|Ember of the Fire Giant|Ember of the Fire Giant#9` Each creature of your choice in a 15-foot-radius sphere centered on you makes a Dexterity saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 15,8,pb

### item (1776)

- `item|dmg|Rod of Alertness#9` While in that Bright Light, you and your allies each add 1 to your Armor Class and to your saving throws, and you can sense where any Invisible creature in the same Bright Light is. | angka: 1
- `item|dmg|Silken Spite (Exalted)#38` - The weapon's bonus to attack and damage rolls increases to +2. | angka: 2
- `item|tee24|Battle Rod#3` For example, Fire Bolt reaches 240 ft but attacks past 120 ft have Disadvantage. | angka: 240,120
- `item|ftd|+3 Dragonhide Belt#2` While wearing it, you gain a +3 bonus to the saving throw DCs of your ki features. | angka: 3
- `item|dmg|Wind Fan#2` Every further use of the fan before the next dawn carries a cumulative 20 percent chance that it fails to work. | angka: 20
- `item|tsgs|Potion of Dragon's Breath (Uncommon)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | angka: 1d20,2
- `item|egw|Will of the Talon (Exalted)#43` - The weapon's bonus to attack and damage rolls increases to +2. | angka: 2
- `item|llk|Powered Armor#17` - Gain darkvision to a range of 60 feet for up to 1 hour (1 charge or 5 hit points). | angka: 60,1,5
- `item|dmg|Figurine of Wondrous Power, Ivory Goats#16` It has 24 charges, and each hour or portion thereof it spends in beast form costs 1 charge. | angka: 1
- `item|dmg|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | angka: 2
- `item|thhw|Alluring Dye#5` On a 1 the dyes clash, your coloring turns a shocking yellow, and you have Disadvantage on Charisma checks for 1d6 days until it fades. | angka: 1d6
- `item|egw|Lash of Shadows (Exalted)#30` - The saving throw DC for the weapon's poisons increases to 15. | angka: 15
- `item|dmg|Psionic Piercing#33` Blindsight with a range of 20 ft. | angka: 20
- `item|dmg|Saber of Unity#3` You and any allies within 10 ft of you are immune to the Frightened condition while you wield it. | angka: 10
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | angka: 2
- `item|dmg|Ioun Stone (mastery)#13` While it circles your head, your Proficiency Bonus increases by 1. | angka: pb
- `item|tsgs|Locksmith's Bane#2` You get +3 to Dexterity (Sleight of Hand) checks to pick a lock with it. | angka: 3
- `item|dmg|Warden's Link#5` Attaching it to a nonmagical suit of armor, shield, or weapon of the right type takes 1 hour of work with suitable tools, usually leatherworker's or smith's tools, and can be done during a Short Rest. | angka: 1
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as | angka: 0,2,22
- `item|dmg|Grovelthrash (Exalted)#33` - The weapon's bonus to attack and damage rolls increases to +2. | angka: 2
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | angka: 1
- `item|dmg|Pomade of Ten Thousand Styles#3` The change fades after a Long Rest unless you repeat it for 7 days, which makes it permanent. | angka: 7
- `item|dmg|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | angka: 1d8,8
- `item|egw|Will of the Talon (Exalted)#45` - The saving throw DC for the war pick's Frightful Presence property increases to 15. | angka: 15
- `item|dmg|Quaal's Feather Token, Swan Boat#6` The boat is self-propelled and moves across water at a speed of 6 miles per hour. | angka: 6
- `item|dmg|Rival Coin#14` You take 1d4 Psychic damage. | angka: 1d4
- `item|dmg|Gamma Pendant#13` The spell has no effect, its casting time is wasted, and the pendant regains charges equal to the spell's level, up to 20. | angka: 20
- `item|crcotn|Jewel of Three Prayers (Awakened)#12` - The jewel has 3 charges and regains all its expended charges daily at dawn. | angka: 3
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | angka: 2
- `item|dmg|Kiss of the Changebringer (Exalted)#3` +1 to saving throws. | angka: 1

### species (91)

- `species|Hedge|Natural Burrowers#1` Burrow Speed 15 feet. | angka: 15
- `species|Child of Seth|Flight#1` You have a Fly Speed of 30 ft. It drops to 20 ft while you wear Medium or Heavy armor. | angka: 20
- `species|Elf (Fey)|Trance#2` You finish a Long Rest in 4 hours of meditation, staying semiconscious. | angka: 4
- `species|High Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Geppettin|Construct Nature#3` You finish a Long Rest in 4 hours of motionless rest while awake. | angka: 4
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Reborn (VRGR)|Deathless Nature#4` You can finish a Long Rest in 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Harengon (WBtW)|Hare-Trigger#1` Add your Proficiency Bonus to your initiative rolls. | angka: pb
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Wood Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | angka: 1d6
- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage  | angka: 5
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | angka: 3
- `species|Mapach|Expert Climbers#1` Climb Speed 20 feet. | angka: 20
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Elf (Mark of Shadow)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | angka: half
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Vect|Embedded Armor#2` Your base AC is 13 + Dexterity modifier. | angka: 13
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | angka: double
- `species|Aarakocra (2014)|Flight#1` Fly Speed of 50 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 50

### sub (606)

- `sub|Vagabond/Gourmand|Monster Meal#14` Speed increases by 10 feet. | angka: 10
- `sub|Wizard/Transmuter|Wondrous Alteration#9` The damage of your new growth becomes 2d6 of the type that goes with the growth. | angka: 2d6
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | angka: 3
- `sub|Monk/Way of the Open Hand|Tranquility#2` The save DC is 8 + your Wisdom modifier + your Proficiency Bonus. | angka: 8,pb
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#3` Its Hit Point maximum is its normal maximum or four times your Ranger level, whichever is higher. | angka: 4
- `sub|Craftsman/Mechanauts' Guild|Magitech Upgrade#14` Until the end of your turn, the apparatus's Speed doubles, it has a Fly Speed equal to its Speed, and you can attack three times when you take the Attack action with it. | angka: 3,double
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | angka: 1
- `sub|Witch/White Magic|Talisman of Protection#4` A creature wearing the talisman adds a d4 to all its saving throws. | angka: 1d4
- `sub|Fighter/Scofflaw|Blindside#2` The damage becomes 7d6 at level 15 and 9d6 at level 18. | angka: 7d6,1d6
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | angka: 1
- `sub|Ranger/Freerunner|Freerunning#3` Once per turn, move up to 15 ft horizontally without provoking Opportunity Attacks (no action). | angka: 15
- `sub|Alchemist/Mutagenist|Mutated Blood#2` That score increases by 2, to a maximum of 22. | angka: 2
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | angka: 1
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | angka: 24
- `sub|Barbarian/Path of the Juggernaut|Demolishing Might#1` Your melee weapon attacks deal an extra 1d8 to constructs and double damage to objects and structures. | angka: 1d8,double
- `sub|Vagabond/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | angka: 1d6
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | angka: 2d8
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | angka: 1d8
- `sub|Fighter/Arcane Archer|Arcane Shot Options#13` Extra Necrotic damage, 2 dice. | angka: 2
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | angka: 2
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | angka: 2
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | angka: 10
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#2` Add your Proficiency Bonus to its AC, attack rolls, damage rolls, and to saves and skills it is proficient in. | angka: pb
- `sub|Barbarian/Path of the Muscle Wizard|"Spells"#4` Magic Missile: action, three ranged attacks with Dart, Dagger or similar Thrown weapons using Strength, with Advantage. | angka: 3
- `sub|Paladin/Oath of the Annihilator|Channel Divinity#4` A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. | angka: 1
- `sub|Barbarian/Path of Wild Magic|Bolstering Magic#3` For 10 minutes the creature rolls 1d3 and adds it to every attack roll and ability check. | angka: 1d3,10
- `sub|Ranger/Big Game Hunter|Bolas#5` The save DC is 8 + your Wisdom modifier + your Proficiency Bonus. | angka: 8,pb
- `sub|Paladin/Oath of the Ancients (2014)|Aura of Warding#1` You and friendly creatures within 10 feet have Resistance to damage from spells. | angka: 10
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Alchemist/Pigmentist|Splatter Bombs#5` The extra damage of your Magical Pigments becomes 1d8. | angka: 1d8

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|idrotf|Cauldron of Plenty#9` The cauldron can create stew three times. -> info:NUMONLY:TEXT
- class `item|idrotf|Cauldron of Plenty#9` The cauldron can create stew three times. -> info:NUMONLY:TEXT
- record `sub|Warden/Rimekeeper|Hoarfrost Herald#3` After you use this, you cannot use it again until you finish a Short or Long Rest. -> covered
- class `sub|Warden/Rimekeeper|Hoarfrost Herald#3` After you use this, you cannot use it again until you finish a Short or Long Rest. -> info:REST:NONUM
- record `item|tkdm|Girdle of Traveling Alchemy#2` Once you attune to it, the containers fill with 2 flasks of Alchemist's Fire, 2 flasks of alchemist's ice, 2 vials of Ac -> info:NUMONLY:TABLE
- class `item|tkdm|Girdle of Traveling Alchemy#2` Once you attune to it, the containers fill with 2 flasks of Alchemist's Fire, 2 flasks of alchemist's ice, 2 vials of Ac -> info:NUMONLY:TABLE
- record `sub|Wizard/Magic Missile Mage|Magic Missile Savant#4` Short Rest regains one use, Long Rest all. -> covered
- record `sub|Captain/Knight Errant|Inspiring Battlecry#2` You can do this once, then you must finish a Long Rest to do it again. -> info:REST:NONUM
- class `sub|Captain/Knight Errant|Inspiring Battlecry#2` You can do this once, then you must finish a Long Rest to do it again. -> info:REST:NONUM
- record `item|dmg|Blaster Mod (+3 Enchanted Battery)#2` While installed, you have a +3 bonus to ranged attack and damage rolls with this blaster, which counts as a magic weapon -> info:NUMONLY:ROLL
- class `item|dmg|Blaster Mod (+3 Enchanted Battery)#2` While installed, you have a +3 bonus to ranged attack and damage rolls with this blaster, which counts as a magic weapon -> info:NUMONLY:ROLL
- record `item|dmg|Spell Gem (Diamond)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- class `item|dmg|Spell Gem (Diamond)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- record `sub|Vagabond/Siegeball Jersey|Game-Winning Play#5` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- class `sub|Vagabond/Siegeball Jersey|Game-Winning Play#5` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `item|dmg|Yuan-Ti Pureblood Transformation#5` Innate Spellcasting: you know Poison Spray, can cast Animal Friendship at will (snakes only), and from 3rd level can cas -> info:REST:NONUM
- class `item|dmg|Yuan-Ti Pureblood Transformation#5` Innate Spellcasting: you know Poison Spray, can cast Animal Friendship at will (snakes only), and from 3rd level can cas -> info:REST:NONUM
- record `sub|Dancer/Courtesan|Honeyed Words#4` You learn two languages of your choice. -> info:STD:PICK_TEXT
- class `sub|Dancer/Courtesan|Honeyed Words#4` You learn two languages of your choice. -> info:STD:PICK_TEXT
- record `item|egw|Danoth's Visor (Dormant)#3` While wearing the goggles in their dormant state, you can see normally in darkness, both magical and nonmagical, to a di -> info:NUMONLY:GEOMETRY
- class `item|egw|Danoth's Visor (Dormant)#3` While wearing the goggles in their dormant state, you can see normally in darkness, both magical and nonmagical, to a di -> info:NUMONLY:GEOMETRY
- record `item|dmg|Mask of the Beast#3` The mask regains all expended charges at dawn. -> info:REST:NONUM
- class `item|dmg|Mask of the Beast#3` The mask regains all expended charges at dawn. -> info:REST:NONUM
- record `class|Wizard|Spellcasting#10` It is a Tiny object that weighs 3 pounds and has 100 pages, and only you or someone casting Identify can read it. -> info:NUMONLY:FLAVOR
- class `class|Wizard|Spellcasting#10` It is a Tiny object that weighs 3 pounds and has 100 pages, and only you or someone casting Identify can read it. -> info:NUMONLY:FLAVOR
- record `feat|Aberrant Horror Transformation: Stage 2|Aberrant Horror Transformation: Stage 2#3` You also gain the Stage 2 Flaw. -> info:NUMONLY:TABLE
- class `feat|Aberrant Horror Transformation: Stage 2|Aberrant Horror Transformation: Stage 2#3` You also gain the Stage 2 Flaw. -> info:NUMONLY:TABLE
- record `item|tkdm|Oathbound Ring#7` When a creature directly tries to stop you from keeping your oath, you have Advantage on attack rolls, saving throws, an -> info:ACTIVE:OTHERS
- class `item|tkdm|Oathbound Ring#7` When a creature directly tries to stop you from keeping your oath, you have Advantage on attack rolls, saving throws, an -> info:ACTIVE:OTHERS
- record `sub|Warden/Godsworn|Benediction#3` A Long Rest regains your ability to cast each one this way. -> covered
