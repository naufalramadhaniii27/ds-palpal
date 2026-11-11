# Laporan clause gate (mode laporan, 2026-11-11)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73254 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36782 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 7980 |
| Info (tag terdokumentasi) | 23617 (SPELL_TEXT 6470, FORM:ACTIVATE 2723, NUMONLY:GEOMETRY 2232, FORM:ROLL 1938, NUMONLY:TEXT 1341, ACTIVATE 1309, FORM:TABLE 1156, NUMONLY:ROLL 1000, NUMONLY:TABLE 862, FXO_NULL 828, ACTIVE:TRIGGER 784, ACTIVE:OTHERS 642, REST:NONUM 586, NUMONLY:FLAVOR 305, STD:ASI 208, COND:PLAY_STATE 188, NUMONLY:ZERO 162, ROLL:LAST_CHARGE 136, OBJECT:STATS 106, ITEM:SENSES 82, DC:REFERENCE 77, BY_DESIGN 72, TABLE:CLASS 70, COND:ATTACK_ROLL_ADV 68, STD:PICK_TEXT 63, ACTIVE:REACTION 56, MOVE:SPEED_REF 50, ACTIVE:TIMED_IMM 43, TARGET:SPEED 30, FOCUS:SPELLCASTING 14, STD:AC10 7, KNOW:TARGET_DEFENSES 7, POOL:SHARED 2) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5185 |
| Uncovered dengan angka | 3087 |
| Uncovered dengan kelas kata kunci mekanik | 4825 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 360 |
| Angka yang tidak dijelaskan record mana pun | 2877 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4394 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 306 |
| Waktu | muat data 1 s, analisis 13 s |

Uji mutasi pada data nyata (seed 7): 300 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 185 ditangkap (61.7%). Hapus semua atom kelas yang dibutuhkan: 183 ditangkap (61.0%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 293 ditangkap (97.7%), semua atom kelas dihapus: 296 ditangkap (98.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| GX | 1937 |
| wxs | 707 |
| LU_X | 536 |
| ITEM_SPELLS | 363 |
| species | 352 |
| AUTO | 315 |
| feat | 246 |
| SPELL_FX | 241 |
| cls | 132 |
| CODE | 117 |
| SAVE_NOTES | 75 |
| FXO | 50 |
| SPELLS | 37 |
| sub | 28 |
| FDMG | 17 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 236, fx-L4.js 192, fx-L12.js 152, fx-L2.js 142, fx-L1.js 141, fx-L3.js 135, fx-L10.js 131, fx-Z5.js 123, fx-N1.js 101, fx-L9.js 101, fx-L11.js 97, fx-Z3.js 90.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 889 | 13.4% |
| SPELL | 2882 | 829 | 28.8% |
| DMG | 3912 | 696 | 17.8% |
| SPEED | 1135 | 436 | 38.4% |
| CHOICE | 1345 | 363 | 27.0% |
| PROF | 883 | 362 | 41.0% |
| ADV | 1516 | 353 | 23.3% |
| RES | 1123 | 329 | 29.3% |
| NUM | 7110 | 322 | 4.5% |
| SLOT | 1121 | 320 | 28.5% |
| IMM | 852 | 308 | 36.2% |
| DC | 2624 | 282 | 10.7% |
| ATK | 860 | 225 | 26.2% |
| DIS | 932 | 213 | 22.9% |
| AC | 593 | 165 | 27.8% |
| SENSE | 515 | 148 | 28.7% |
| SAVE | 272 | 145 | 53.3% |
| HP | 142 | 82 | 57.7% |
| NUM-DICE | 1262 | 71 | 5.6% |
| ABIL | 357 | 62 | 17.4% |
| INIT | 111 | 49 | 44.1% |
| NUM-DUR | 2748 | 34 | 1.2% |
| NUM-DIST | 4404 | 29 | 0.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1028 | 242 | 549 | 0 | 237 |
| feat | 2101 | 535 | 1042 | 0 | 524 |
| item | 18391 | 4486 | 10978 | 0 | 2927 |
| species | 1037 | 571 | 297 | 0 | 169 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1868 | 4281 | 0 | 1328 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2482 | 6071 | 1598 | 15.7% |
| tvss | 2815 | 664 | 1643 | 508 | 18.0% |
| core | 1503 | 391 | 803 | 309 | 20.6% |
| tsgs | 1483 | 379 | 857 | 247 | 16.7% |
| tsdm | 1222 | 326 | 675 | 221 | 18.1% |
| tkdm | 919 | 204 | 501 | 214 | 23.3% |
| tghp | 1117 | 374 | 560 | 183 | 16.4% |
| tce | 736 | 136 | 459 | 141 | 19.2% |
| egw | 566 | 141 | 289 | 136 | 24.0% |
| au | 536 | 104 | 311 | 121 | 22.6% |
| tdcsr | 416 | 133 | 185 | 98 | 23.6% |
| dmg14 | 540 | 170 | 273 | 97 | 18.0% |
| phb14 | 516 | 164 | 262 | 90 | 17.4% |
| thhw | 395 | 86 | 231 | 78 | 19.7% |
| tee24 | 464 | 166 | 232 | 66 | 14.2% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| rhw | 232 | 57 | 115 | 60 | 25.9% |
| hof | 253 | 40 | 155 | 58 | 22.9% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| tghg | 288 | 75 | 165 | 48 | 16.7% |
| misc14 | 327 | 80 | 200 | 47 | 14.4% |
| xge | 375 | 112 | 217 | 46 | 12.3% |
| coa | 158 | 49 | 65 | 44 | 27.8% |
| oota | 87 | 22 | 23 | 42 | 48.3% |
| mot | 292 | 97 | 159 | 36 | 12.3% |
| tsgeh | 184 | 62 | 91 | 31 | 16.8% |
| bmt | 489 | 83 | 375 | 31 | 6.3% |
| bgg | 210 | 64 | 122 | 24 | 11.4% |
| ftd | 159 | 40 | 96 | 23 | 14.5% |
| skt | 118 | 25 | 73 | 20 | 16.9% |
| tsae | 65 | 22 | 24 | 19 | 29.2% |
| psa | 67 | 22 | 27 | 18 | 26.9% |
| dsotdq | 83 | 17 | 48 | 18 | 21.7% |
| wbtw | 92 | 18 | 56 | 18 | 19.6% |
| abh | 54 | 13 | 23 | 18 | 33.3% |
| bdd | 62 | 15 | 29 | 18 | 29.0% |
| idrotf | 134 | 28 | 88 | 18 | 13.4% |
| llk | 99 | 10 | 71 | 18 | 18.2% |
| wdh | 95 | 23 | 56 | 16 | 16.8% |
| toa | 116 | 32 | 68 | 16 | 13.8% |
| wdmm | 79 | 13 | 50 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
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
| efa | 28 | 9 | 15 | 4 | 14.3% |
| tdcg | 12 | 4 | 5 | 3 | 25.0% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| nf | 25 | 9 | 14 | 2 | 8.0% |
| imr | 186 | 6 | 178 | 2 | 1.1% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 6748 | 278 | 6470 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 630 | 514 |
| SPELL | 587 | 80 |
| DMG | 513 | 474 |
| SPEED | 373 | 288 |
| ADV | 347 | 136 |
| PROF | 335 | 109 |
| NUM | 322 | 322 |
| SLOT | 303 | 92 |
| RES | 268 | 110 |
| CHOICE | 235 | 67 |
| IMM | 204 | 64 |
| DIS | 178 | 65 |
| AC | 165 | 131 |
| SAVE | 139 | 123 |
| ATK | 138 | 109 |
| DC | 135 | 133 |
| SENSE | 131 | 114 |
| HP | 82 | 59 |
| ABIL | 50 | 47 |
| NUM-DICE | 19 | 19 |
| NUM-DIST | 18 | 18 |
| INIT | 12 | 12 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (630 uncovered)

- `class|Gadgeteer|Overcharge#1` Once per turn, when you damage a creature with a weapon or a Gadget, you can deal 2 extra Lightning damage to it. | no record for DMG
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `feat|Living Shadow|Living Shadow#6` You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest. | number pb no record explains
- `feat|Portal Jumper|Portal Jumper#6` You can do this a number of times equal to your Proficiency Bonus, but only once per turn. | number pb no record explains
- `feat|Pyromaniac|Pyromaniac#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | no record for SPELL; number 2 unexplained
- `item|crcotn|Jewel of Three Prayers (Awakened)#12` - The jewel has 3 charges and regains all its expended charges daily at dawn. | no record for RESOURCE; number 3 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#31` - Its number of charges increases to 5. | no record for RESOURCE; number 5 unexplained
- `item|dmg|Deck of Many Things#99` In addition, every day at dawn until you die, you gain 10 Temporary Hit Points. | no record for RESOURCE; number 10 unexplained
- `item|dmg|Dämglesvir (Adept)#8` When you take the Attack action, you can make one attack a sweeping strike against each creature of your choice in reach, a number of times equal to your Proficiency Bonus per Long Rest. | no record for CHOICE
- `item|dmg|Eye of Vecna#41` You regain 1d10 Hit Points when your turn starts, provided you have 1 Hit Point or more at that moment. | no record for RESOURCE; number 1d10,1 unexplained
- `item|dmg|Fire Dervish Cloak#4` On a failure they take 1d8 Fire per charge spent and cannot make Opportunity Attacks against you this turn. | no record for RESOURCE; number 1d8 unexplained
- `item|dmg|Gloves of Soul Catching#3` After making a successful unarmed strike while wearing these gloves, you can use the gloves to deal an extra 2d10 force damage to the target, and you regain a number of hit points equal to the force damage dealt. | no record for DMG,RESOURCE; number 2d10 unexplained
- `item|dmg|Heart of Steel#3` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | no record for RESOURCE; number 4 unexplained
- `item|dmg|Iggwilv's Cauldron#43` - Tying a dead frog or toad to the end of an ordinary branch and dipping it in the water-filled cauldron transforms the branch into a wand of polymorph with 3 charges. | number 3 no record explains
- `item|dmg|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a +7 bonus. | no record for ATK,RESOURCE; number 60,7 unexplained
- `item|dmg|Wind Fan#2` Every further use of the fan before the next dawn carries a cumulative 20 percent chance that it fails to work. | no record for RESOURCE; number 20 unexplained
- `item|dmg|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | no record for RESOURCE; number 30 unexplained
- `item|dmg|Zafu of the Wandering Mind#5` Within 100 ft of a pillow, use a Bonus Action and command word to send them into a pocket dimension, and repeat to return them to an open space within 5 ft. The set has 3 charges and regains 1d3 at dawn. | number 100,5 no record explains
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|idrotf|Ythryn Mythallar#8` To attune to this mythallar, a creature must finish a short rest within 30 feet of it, meditating on the mythallar. | number 30 no record explains
- `item|pota|Devastation Orb of Earth#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|tee24|Blast Disk (Common)#7` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tghg|Dämglesvir (Master)#8` When you take the Attack action, you can make one attack a sweeping strike against each creature of your choice in reach, a number of times equal to your Proficiency Bonus per Long Rest. | no record for CHOICE
- `item|thhw|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a +7 bonus. | no record for ATK,RESOURCE; number 60,7 unexplained
- `item|tsgs|Lightning Pylons#10` At 0 HP it falls, loses its charge and cannot be used for 2 days, then it heals fully. | no record for RESOURCE; number 2 unexplained
- `item|tsgs|Potion of Dragon's Breath#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|tsgs|Signet Rings of Blindness, Deafness, and Silence#2` Each ring has 1 charge and regains it at dawn. | number 1 no record explains
- `item|tsgs|Smash Potatoes#5` You can eat up to three before a Long Rest. | no record for RESOURCE; number 3 unexplained
- `item|tsgs|Wildman's Spinning Cleaver#4` Once per turn when you make a ranged attack with it while Raging, make a second ranged attack as part of it against a different target within 10 ft of the first, even beyond long range, treated as the first target's rang | number 10 no record explains
- `species|Boggart|Fury of the Small#1` Once per turn, when you damage a creature larger than you with an attack roll or a spell, you deal extra damage equal to your Proficiency Bonus. | no record for DMG
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | no record for RESOURCE; number 1d4 unexplained
- `species|Warforged|Sentry's Rest#2` You finish a Long Rest in 6 hours if you spend them inactive and motionless. | no record for RESOURCE; number 6 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Cleric/Nature Domain|Divine Strike#1` Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d8 Cold, Fire, or Lightning (your choice) damage. | no record for RESOURCE
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | number 1 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | no record for DC,RESOURCE; number 10 unexplained
- `sub|Sorcerer/Aristocratic|Metamagic Mastery#1` Applying Metamagic to a spell from your school costs 1 less Sorcery Point. | no record for RESOURCE; number 1 unexplained
- `sub|Warden/Beastblood Guardian|Wild Pounce#1` Once per turn, when you hit a Large or smaller creature with a Melee weapon or an Unarmed Strike, it takes an extra 1d8 Slashing damage and has the Prone condition. | no record for DMG,RESOURCE; number 1d8 unexplained
- `sub|Warlock/Star Patron|Nova#1` Once per turn when you hit with a ranged attack roll, you can take 5 Radiant damage to deal an extra 1d8 Radiant damage to the target. | no record for DMG,RESOURCE; number 1d8,5 unexplained

### SPELL (587 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | no record for SPELL; number 3 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Dancer/Dramaturge|Spellcasting#3` You know two Bard cantrips. | number 2 no record explains
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | no record for SPELL; number 1d6 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### DMG (513 uncovered)

- `feat|Latent Psionics|Latent Psionics#4` Your Psionic Blast deals an extra 1d10 Psychic damage. | no record for DMG; number 1d10 unexplained
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#2` On your first turn after an Initiative roll, add 1d4 to the first damage roll you make. | no record for DMG,INIT; number 1d4 unexplained
- `item|coa|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Blade of Broken Mirrors (Exalted)#36` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Concussion Grenade#5` On a fail it takes 6d6 Thunder damage and is Deafened for 1 minute. | no record for DMG; number 6d6,1 unexplained
- `item|dmg|Condemner (Awakened)#6` Hits deal an extra 1d4 poison damage. | number 1d4 no record explains
- `item|dmg|Contractor Nail#5` Once on each of your turns, if you hit a target that was already hit by a Contractor Needle this turn, it takes an extra 2d6 Radiant damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Lash of Shadows (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|dmg|Mace of the Black Crown (Exalted)#14` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | number 1 no record explains
- `item|dmg|Mythcarver (Awakened)#4` +1 to attack and damage rolls. | number 1 no record explains
- `item|dmg|Ouroboros Rapier#2` Each 8 on a damage die adds 1d8 Poison damage. | no record for DMG; number 1d8,8 unexplained
- `item|dmg|Rod of Lordly Might#22` If it fails, it takes 4d6 extra Necrotic damage, and you heal by half the Necrotic damage it took. | no record for DMG; number 4d6,half unexplained
- `item|dmg|Ruin's Wake (Exalted)#12` - You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals an extra 1d8 piercing damage to any target it hits. | no record for DMG; number 1d8,1 unexplained
- `item|dmg|Snicker-Snack#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `item|dmg|Stormgirdle (Exalted)#15` - Your Storm Avatar's lightning strike deals 4d6 lightning damage (instead of 3d6). | no record for DMG; number 4d6,3d6 unexplained
- `item|dmg|Tether Tearer#2` When you hit a creature with Incorporeal Movement, it takes an extra 1d6 Force damage and cannot use that trait until the end of its next turn. | no record for DMG; number 1d6 unexplained
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|egw|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Mace of the Black Crown (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2, and the extra fire damage dealt by the weapon when it is ignited increases to 2d6. | no record for DMG; number 2d6,2 unexplained
- `item|egw|Ruin's Wake (Exalted)#24` - The weapon's bonus to attack and damage rolls increases to +2, and the extra piercing damage dealt by the weapon increases to 2d8. | number 2 no record explains
- `item|egw|The Bloody End (Exalted)#25` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|frafi|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|idrotf|Charm of Biting Cold#3` While it lasts, each hit with a melee or ranged weapon attack deals an extra 1d6 Cold damage. | no record for DMG; number 1d6 unexplained
- `item|tdcsr|Condemner (Exalted)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|tdcsr|Whisper (Exalted)#11` The bonus becomes +3 and the psychic damage becomes 1d8. | number 1d8 no record explains
- `item|tdcsr|Whisper (Exalted)#3` +1 to attack and damage rolls. | number 1 no record explains
- `item|thhw|Cloak of Spines#4` The attack's damage is reduced by 2d4 and the attacker takes 2d4 magical Piercing damage. | no record for DMG; number 2d4 unexplained
- `item|tsdm|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | no record for DMG; number 2 unexplained
- `item|tsgs|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | number 1d6 no record explains
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | no record for DMG; number pb unexplained
- `sub|Artificer/Battle Smith|Improved Defender#2` The extra damage and the healing of Arcane Jolt both rise to 4d6. | no record for DMG; number 4d6 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#3` On a fail it takes 1d6 Force damage and is pushed 10 ft in a horizontal direction you choose. | no record for DMG; number 1d6,10 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#4` At Cleric level 11 the extra damage becomes 1d6. | no record for DMG; number 1d6 unexplained
- `sub|Cleric/Hunger Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | no record for DMG; number 2d8 unexplained
- `sub|Druid/Circle of Mutation|Endless Evolution#9` +1 to attack and damage rolls with the form's attacks. | no record for DMG; number 1 unexplained
- `sub|Fighter/Rune Knight|Great Stature#2` The extra damage from Giant's Might becomes 1d8. | no record for DMG; number 1d8 unexplained
- `sub|Ranger/Winter Walker|Frigid Explorer#8` At Ranger level 11 the extra damage becomes 1d6. | no record for DMG; number 1d6 unexplained

### SPEED (373 uncovered)

- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | no record for SPEED; number 5 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | no record for SPEED; number 5,7,40 unexplained
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Boots of Striding and Springing#1` Wearing these boots raises your Speed to 30 feet if it was lower than that. | no record for SPEED; number 30 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg|Couatl Herald's Fang#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Doublet of Dramatic Demise#3` You are incapacitated and your speed is 0, but you can speak and communicate. | no record for SPEED; number 0 unexplained
- `item|dmg|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | no record for SPEED; number double unexplained
- `item|dmg|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `item|dmg|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|dmg|Loadstone#6` Until the curse is broken with remove curse or similar magic, your speed is reduced by 5 feet, and your maximum load and maximum lift capacities are halved. | no record for SPEED; number 5 unexplained
- `item|dmg|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|dmg|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | no record for SPEED; number 60 unexplained
- `item|dmg|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|egw|Grovelthrash (Exalted)#42` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | no record for SPEED; number 5,half unexplained
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|tsgs|Couatl Herald's Radiance#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|tsgs|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|tsgs|Ring of Anchoring#6` On a fail the arm is immobile for 1 minute, your Speed is 0, and you are dragged 30 ft down at the start of each turn. | no record for SPEED; number 30,1,0 unexplained
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | number 10 no record explains
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Barbarian/Path of the Wrathful Dead|Dark Doom Revisited#10` Fail: Cold damage and Speed halved for 1 minute. | no record for SPEED; number 1 unexplained
- `sub|Cleric/Speed Domain|Celerity in Thought and Action#1` Your Speed rises by 5 ft. You gain proficiency in Acrobatics and Insight. | no record for PROF
- `sub|Craftsman/Mechanauts' Guild|Mechanaut's Apparatus#5` Doing so costs movement equal to half its Speed, rounded down. | no record for SPEED; number half unexplained
- `sub|Druid/Circle of Mutation|Mutate Shape#7` 1 more point makes the Swim Speed double your Speed. | no record for SPEED; number 1,double unexplained
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | number double no record explains
- `sub|Sorcerer/Aberrant Sorcery|Revelation in Flesh#5` You gain a Swim Speed of twice your Speed, and you can breathe underwater. | number double no record explains
- `sub|Warmage/House of Darts|Dagger Climb#2` You gain a Climb Speed equal to your Speed for 10 minutes. | no record for SPEED; number 10 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | no record for SPEED; number 10 unexplained

### ADV (347 uncovered)

- `feat|Deathbound|Deathbound#2` If you have two Death Saving Throw failures, you have Advantage on Death Saving Throws until you are no longer at 0 Hit Points. | no record for ADV; number 2 unexplained
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|dmg|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|dmg|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|dmg|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Rope of Climbing#6` While knotted, the rope is only 50 feet long, and it gives Advantage on ability checks made to climb with it. | no record for ADV; number 50 unexplained
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tghg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|tsgs|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | number 2,22 no record explains
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Martyr/Burden of Mercy|Virtuous Blessings#7` Spend it to gain Advantage on a D20 Test using Wisdom or Charisma (no action). | no record for ADV; number 1d20 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Wizard/Graviturgy Magic|Adjust Density#3` With doubled weight it loses 10 feet of Speed and has Advantage on Strength checks and saves. | no record for ADV,SPEED; number 10,double unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | no record for ADV; number 8 unexplained
- `sub|Wizard/Timekeeper|Temporal Points#6` Option three: Advantage on your next Dexterity check. | no record for ADV; number 3 unexplained

### PROF (335 uncovered)

- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | no record for PROF; number pb unexplained
- `feat|Sharpshooter (2014)|Sharpshooter (2014)#6` Before you make an attack with a ranged weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|dmg|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|dmg|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|dmg|Horn of Valhalla#14` 91-00, iron horn (Legendary): 5 spirits, and you must have proficiency with all Martial weapons. | no record for PROF; number 91,00,5 unexplained
- `item|dmg|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|tee24|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tsgs|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tvss|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | no record for PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | no record for PROF; number 5,6 unexplained

### NUM (322 uncovered)

- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | number 2 no record explains
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | number 3 no record explains
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Dungeon Delver|Dungeon Delver#8` Traveling at a fast pace doesn't give the usual -5 penalty to your passive Wisdom (Perception). | number 5 no record explains
- `feat|Great Weapon Master|Great Weapon Master#2` Your Strength score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Poisoner|Poisoner#2` Pick Dexterity or Intelligence and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|coa|Amulet of the Inferno#8` - 2 major detrimental properties | number 2 no record explains
- `item|coa|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Crown of Lies#14` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Crusader's Shortsword#1` The Crusader's Shortsword is a sentient lawful good +1 shortsword (Intelligence 11, Wisdom 13, Charisma 13). | number 11,13 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Mace of Smiting#2` When you attack a Construct with it, that bonus is +3 instead. | number 3 no record explains
- `item|dmg|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | number 20,30 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|dsotdq|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|tsgs|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | number 1d4,1 no record explains
- `item|tsgs|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|tsgs|Staff of the Magpie#2` Holding it gives +1 to Wisdom (Perception) checks to find treasure or a specific item. | number 1 no record explains
- `sub|Cleric/Cat Domain|Channel Divinity: Feline Finesse#1` Add a +10 bonus to a Dexterity ability or skill check made by you or by a creature you designate within 30 ft. | number 30,10 no record explains
- `sub|Martyr/Burden of Discord|Coin of Chaos#3` It is +4 on heads and +1 on tails. | number 4 no record explains
- `sub|Necromancer/Overlord|Charnel Aura#3` The bonus is +1 per 5 points spent, to a maximum of +3. | number 1,5 no record explains

### SLOT (303 uncovered)

- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|dmg14|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for RESOURCE,SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tsgs|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,RESOURCE,SLOT; number 5d6,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#4` Example: a level 3 Sorcerer who saves against a level 2 spell may regain two level 1 slots or one level 2 slot. | no record for SLOT
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained

### RES (268 uncovered)

- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | number 1 no record explains
- `item|coa|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Stormgirdle (Awakened)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|dmg|Stormgirdle (Exalted)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|dmg|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|dmg|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|egw|Stormgirdle (Awakened)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | no record for RES,SLOT; number 1d6 unexplained
- `sub|Druid/Circle of the Warden|Reclamation#1` Reaction: when a creature within 30 ft takes cold, fire, lightning or thunder damage, it gains Resistance to that damage and you take an amount equal to what it took. | no record for RES; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | no record for RES; number 30 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | no record for DMG,RES,RESOURCE,SLOT; number 1d6,1 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | no record for RES,SPELL; number 30 unexplained
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
- `class|Wizard|Spellcasting#15` With every Wizard level you gain after level 1, you write two more Wizard spells of your choice into your spellbook. | no record for CHOICE; number 2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#8` Choose a number of Chronomancy spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#9` Choose a number of Firearm spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage equal to your Charis | no record for CHOICE; number 5 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `sub|Alchemist/Mad Bomber|Timed Demolition#2` Choose any number of rounds, up to 10 minutes. | no record for CHOICE; number 10 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#2` Or you can choose an ally within 30 feet who can see or hear you. | no record for CHOICE; number 30 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Fiendish Chain|Dark Versatility#1` Your Eidolon gains two Evolutions of your choice that it qualifies for. | no record for CHOICE; number 2 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (101)

- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | angka: 2
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Vagabond|Battle Tactics#15` A maneuver's save DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | angka: 2
- `class|Captain|Cohort~4#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Captain|Cohort~2#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Barbarian|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | angka: 1,4
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | angka: 1
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Summoner|Shared Resilience#1` While you and your Eidolon are within 30 feet of each other, you both have proficiency in all saving throws. | angka: 30
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Paladin|Restoring Touch#2` Each condition you end costs 5 Hit Points from your Lay On Hands healing pool, and the creature regains no Hit Points from points spent this way. | angka: 5
- `class|Investigator|Weapon Mastery#3` After a Long Rest you can change the two kinds. | angka: 2
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Martyr|Divine Respite~2#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | angka: 2
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double

### feat (194)

- `feat|Defensive Duelist|Defensive Duelist#4` When another creature hits you with a melee attack while you hold a Finesse weapon, you can use a Reaction to raise your Armor Class by an amount equal to your Proficiency Bonus, which might make the  | angka: pb
- `feat|Vampire Transformation: Stage 4|Vampire Transformation: Stage 4#4` At the start of your turn you regain 15 Hit Points if you have at least 1 but fewer than 60 Hit Points. | angka: 15,60
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | angka: 2
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | angka: 20
- `feat|Living Shadow|Living Shadow#8` Right after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Primordial Transformation: Stage 2|Primordial Transformation: Stage 2#10` On a failure your Primordial nature shows, and you have Disadvantage on every D20 Test for 1 minute while you fight for control. | angka: 1d20
- `feat|Knight of the Sword|Knight of the Sword#7` It makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | angka: 3
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | angka: 2
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Fury of the Frost Giant|Fury of the Frost Giant#9` It makes a Constitution saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Martial Adept|Martial Adept#2` A maneuver that forces a saving throw has a DC of 8 + your Proficiency Bonus + your Strength or Dexterity modifier (your choice). | angka: 8,pb
- `feat|Boon of Irresistible Offense|Boon of Irresistible Offense#2` Add 1 to your Strength or Dexterity score (maximum 30). | angka: 1,30
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Greater Mark of Storm|Greater Mark of Storm#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Bandit Cunning|Bandit Cunning#6` If you meet DC 10 plus its challenge rating, you learn one fact of your choice about its combat abilities: a damage resistance or immunity, a condition immunity, a special ability that deals or preven | angka: 10
- `feat|Mage Slayer|Mage Slayer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 20
- `feat|Crossbow Expert|Crossbow Expert#2` Your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Vampiric Exultation|Vampiric Exultation#4` While transformed you have a flying speed of 30 feet. | angka: 30
- `feat|Iron Hero|Iron Hero#3` When a creature whose CR is higher than your level attacks you, you gain a +2 bonus to AC against that attack. | angka: 2
- `feat|Defensive Duelist (2014)|Defensive Duelist (2014)#3` While you hold a Finesse weapon you are proficient with and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack, which can | angka: pb
- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | angka: 5
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | angka: 2
- `feat|Shadowsteel Master|Shadowsteel Master#7` Also, once on each of your turns when you hit with a weapon attack using your Focus, you can deal an extra 2d8 Necrotic damage to the target. | angka: 2d8
- `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#5` Whenever you regain Hit Points, you regain only half as many, rounded down. | angka: half
- `feat|Dual Wielder|Dual Wielder#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Ritual Caster|Ritual Caster#2` Pick Intelligence, Wisdom, or Charisma and raise it by 1 (maximum 20). | angka: 20
- `feat|Familiar Friend|Familiar Friend#10` You can use this a number of times equal to your Proficiency Bonus, and regain all uses after a Long Rest. | angka: pb
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | angka: 2

### item (1857)

- `item|dmg|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | angka: 100
- `item|tkdm|Necronomicon#32` Casting it into the fire of a dying star wipes its pages and leaves it powerless for 6d6 + 6 years. | angka: 6d6,6
- `item|skt|Ingot of the Skold Rune#17` Its magic gives you a +1 bonus to AC, and the first time after each of your long rests that damage reduces you to 0 hit points, you are instead reduced to 1 hit point. | angka: 1,0
- `item|dmg|Staff of Power#17` A creature that fails takes Force damage equal to 4 times the staff's remaining charges, and one that succeeds takes half that damage. | angka: half
- `item|tsdm|Spiked Skin#4` The damage becomes 2d4 at level 5, 3d4 at level 11 and 4d4 at level 17. | angka: 2d4,1d4
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | angka: 0
- `item|dmg|Impulse Unit#3` Once per turn, after you move at least 15 ft in a straight line, you can move up to 10 ft more in that direction without spending movement. | angka: 10
- `item|tsgs|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | angka: 1d12,1d10
- `item|dmg|Justiciar's Gavel#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | angka: 1,2,3
- `item|dmg|Condemner (Exalted)#6` Hits deal an extra 1d4 poison damage. | angka: 1d4
- `item|dmg|Stormgirdle (Exalted)#19` - Your Strength score becomes 23 if it isn't already 23 or higher. | angka: 23
- `item|dmg|Thief's Thimble#4` If the thimble is reduced to 0 Hit Points, it breaks, and you take any remaining damage. | angka: 0
- `item|dmg|Gallus Feather Robe#3` While you wear it, your Intelligence or Charisma becomes 22 (choose when you first attune) and you gain a +1 bonus to saving throws. | angka: 22
- `item|dmg|Dust of Sneezing and Choking#3` The container holds enough for one use. | angka: 1
- `item|dmg|Jewel of Three Prayers (Exalted)#22` - You can expend 1 of the jewel's charges (no action required) to end one of the following conditions on yourself: grappled, paralyzed, or restrained. | angka: 1
- `item|egw|Stormgirdle (Exalted)#25` - Your Storm Avatar's lightning strike deals 5d6 lightning damage (instead of 3d6). | angka: 5d6,3d6
- `item|dmg|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | angka: 1,12
- `item|dmg|Occultant Abacus#24` Also at rank 2, you regain the use of your Read the Kill feature after you finish a short or long rest. | angka: 2
- `item|tssm|Amulet of the Spirit Caller#4` Each charge buys one benefit from this list, and you cannot pick the same benefit twice. | angka: double
- `item|dmg|Shard of the Ise Rune#12` The next time within the next minute that the target takes bludgeoning, slashing, or piercing damage, that damage is reduced to 0, and the mantle is destroyed. | angka: 0
- `item|toa|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | angka: 20,30
- `item|tsgs|Festerwood Masher#4` A Large or smaller target takes a cumulative -1 penalty to AC for 1 minute. | angka: 1,1
- `item|tdcsr|Armor of the Valiant Soul (Exalted)#5` +1 AC while you wear it. | angka: 1
- `item|dmg|Prehistoric Figurine of Wondrous Power, Jasper Tyrannosaurus Rex#16` On a 1, you lose control of the figurine, and it becomes hostile to you and your companions until it is reduced to 0 hit points, at which point it reverts to figurine form. | angka: 0
- `item|dmg|Shroud of Ending#6` While attuned, you deal 1d6 necrotic damage to any plant you touch that is not a creature, plant and beast creatures within 30 ft become hostile to you, and you stop aging and need no food or sleep. | angka: 1d6,30
- `item|egw|Grimoire Infinitus (Exalted)#6` When you prepare wizard spells using the grimoire, the number of wizard spells you can prepare increases by 1. | angka: 1
- `item|dmg|Grovelthrash (Exalted)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | angka: 2d6
- `item|tsgs|Cloak of the Boundless Spirit#5` An ally can gain the 1 Hit Point from a 19 only once per Long Rest. | angka: 1,19
- `item|tghg|Ulmyr's Eye (Master)#11` While holding it, cast Foresight from it with no Material component and a 1 hour duration, once per Long Rest. | angka: 1
- `item|tsgs|Zafu of the Wandering Mind#5` Within 100 ft of a pillow, use a Bonus Action and command word to send them into a pocket dimension, and repeat to return them to an open space within 5 ft. The set has 3 charges and regains 1d3 at da | angka: 100,5

### species (91)

- `species|Cervan|Surge of Vigor#1` When one attack deals more than half of your current Hit Points in damage (even if it drops you to 0), you regain 1d12 + Constitution modifier Hit Points right away. | angka: 1d12,0,half
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | angka: 3
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Eladrin (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Kaladesh Elf (Bishatar and Tirahar)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Merfolk|Swim Speed#1` Swim Speed of 40 ft. | angka: 40
- `species|Eladrin Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#1` You have a merfolk form (Speed 10 ft, Swim Speed 40 ft) and a landwalker form, where your tail splits into legs. | angka: 40
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Aven (Dominaria)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Minotaur (Amonkhet)|Natural Weapon#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Bludgeoning damage. | angka: 1d6
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | angka: pb
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | angka: 1d6
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | angka: 1d6
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Siren|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30

### sub (634)

- `sub|Sorcerer/Serophage|Blood Barrier#4` Action: turn one ring into a magic spear and send it at a target within 60 ft. Make a ranged spell attack. | angka: 60
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | angka: 30
- `sub|Barbarian/Path of the Muscle Wizard|"Spells"#4` Magic Missile: action, three ranged attacks with Dart, Dagger or similar Thrown weapons using Strength, with Advantage. | angka: 3
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | angka: 2
- `sub|Barbarian/Path of Wild Magic|Bolstering Magic#3` For 10 minutes the creature rolls 1d3 and adds it to every attack roll and ability check. | angka: 1d3,10
- `sub|Paladin/Oath of the Giving Grave|Overawe Enemy#2` Pick a creature you see within 60 ft. It makes a Wisdom save, unless it is immune to being Stunned. | angka: 60
- `sub|Necromancer/Black Rider|Gruesome Charge#2` Each of those thralls has a Speed of 60 feet for 10 minutes. | angka: 60
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | angka: 1,2
- `sub|Alchemist/Pigmentist|Splatter Bombs#5` The extra damage of your Magical Pigments becomes 1d8. | angka: 1d8
- `sub|Druid/Circle of the Forged|Elementally Imbued#10` Cold: its Speed is 0 and it has Disadvantage on Strength and Dexterity checks. | angka: 0
- `sub|Warlock/Undead Patron|Superior Dread#6` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | angka: 1d10
- `sub|Cleric/Grave Domain|Circle of Mortality#4` At Cleric level 11 the extra damage becomes 1d6. | angka: 1d6
- `sub|Captain/Skull Banner|Undead Cohort#1` Instead of initiating a normal Cohort, you can perform an 8-hour ritual, which can happen during a Long Rest, to animate an Undead Cohort. | angka: 8
- `sub|Vagabond/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | angka: 1d6
- `sub|Wizard/School of Evocation|Overchannel#3` Each use after that before a Long Rest deals 2d12 Necrotic damage per spell level to you right after the cast, and the damage per level rises by 1d12 for each further use. | angka: 2d12,1d12
- `sub|Wizard/Transmuter|Master Transmuter#9` It regains Hit Points equal to half its Hit Point maximum (round down), is cured of all magical contagions, and loses any curses on it, including its Attunement to a cursed item. | angka: half
- `sub|Jaeger/Marauder Chapter|Unbreakable#1` Your Hit Points maximum increases by 3, and by 1 more for each Jaeger level you gain after this. | angka: 3
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#12` You gain Immunity to Cold damage, Resistance to nonmagical Bludgeoning damage and Vulnerability to Fire damage, and your AC is never lower than 15 plus your Dexterity modifier. | angka: 15
- `sub|Cleric/Evolution Domain|Evolution Domain Spells#1` Always prepared from the listed Cleric levels: 3 Darkvision, Enlarge/Reduce, Jump, Longstrider. | angka: 3
- `sub|Warmage/House of Dice|Dice of Fate#2` When you fail a D20 Test or make a damage roll, you can expend a Die of Fate and add it to the roll, which may turn a failed D20 Test into a success. | angka: 1d20
- `sub|Cleric/Speed Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | angka: 1d8
- `sub|Summoner/Bond of the Wrathful Giant|Giant Eidolon#4` Strength 17 (+3), Constitution 14 (+2). | angka: 17,14,2
- `sub|Bard/College of Calligraphy|Illuminated Spells#1` After a Long Rest, add one prepared Bard spell of each level up to 5 to your manuscript as an Illuminated Spell. | angka: 5
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#7` Your only movement is a 60 ft Fly Speed, and you can hover. | angka: 60
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | angka: 1d6,1
- `sub|Witch/Tea Magic|Tea Ceremony#2` A creature that drinks it lowers its Exhaustion level by 1. | angka: 1
- `sub|Druid/Circle of Mutation|Endless Evolution#9` +1 to attack and damage rolls with the form's attacks. | angka: 1
- `sub|Cleric/Knowledge Domain (PSA)|Channel Divinity: Knowledge of the Ages#2` You have proficiency with it for 10 minutes. | angka: 10
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | angka: 1d6
- `sub|Barbarian/Path of the Wrecker|Disarm Foe#3` The limb is a Martial Melee weapon dealing 1d8 Bludgeoning damage, with the Versatile property (1d10) and Sap mastery. | angka: 1d8,1d10

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `sub|Martyr/Burden of Ascension|Demigod Ascendant#3` You regain your use of Herculean Surge whenever you roll Initiative. -> covered
- class `sub|Martyr/Burden of Ascension|Demigod Ascendant#3` You regain your use of Herculean Surge whenever you roll Initiative. -> info:REST:NONUM
- record `sub|Ranger/Primordial Archer|Primordial Archer Spells#5` 17 Wall of Stone. -> info:NUMONLY:TABLE
- class `sub|Ranger/Primordial Archer|Primordial Archer Spells#5` 17 Wall of Stone. -> info:NUMONLY:TABLE
- record `item|tsgs|Starmetal Shield#9` A hit deals 2d8 Slashing damage. -> info:ACTIVE:OTHERS
- class `item|tsgs|Starmetal Shield#9` A hit deals 2d8 Slashing damage. -> info:ACTIVE:OTHERS
- record `feat|Exomorph|Exomorph#8` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
- class `feat|Exomorph|Exomorph#8` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
- record `sub|Bard/College of Masks|Virtuoso Skill#1` Once per turn when you make a D20 Test, use Charisma instead if it does not already use it. -> covered
- class `sub|Bard/College of Masks|Virtuoso Skill#1` Once per turn when you make a D20 Test, use Charisma instead if it does not already use it. -> info:ACTIVE:TRIGGER
- record `item|dmg|Inescapable Lash#1` A bronze braided whip with three barbs. -> info:NUMONLY:TABLE
- class `item|dmg|Inescapable Lash#1` A bronze braided whip with three barbs. -> info:NUMONLY:TABLE
- record `sub|Witch/Lunar Magic|Blessing of the Moon#1` After a Long Rest, you gain a blessing of a moon phase you pick, and it is empowered if it matches the current phase. -> covered
- class `sub|Witch/Lunar Magic|Blessing of the Moon#1` After a Long Rest, you gain a blessing of a moon phase you pick, and it is empowered if it matches the current phase. -> info:REST:NONUM
- record `feat|Eldritch Lifesaver|Eldritch Lifesaver#3` The target regains hit points equal to the level of the slot and gains temporary hit points equal to your spellcasting a -> info:REST:NONUM
- class `feat|Eldritch Lifesaver|Eldritch Lifesaver#3` The target regains hit points equal to the level of the slot and gains temporary hit points equal to your spellcasting a -> info:REST:NONUM
- record `sub|Warmage/House of Darts|Dart Burst#4` Once you use this, you cannot use it again until you finish a Long Rest. -> covered
- class `sub|Warmage/House of Darts|Dart Burst#4` Once you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `feat|Specter Transformation: Stage 3|Specter Transformation: Stage 3#6` On a failure you act as if under the Confusion spell for 1 minute. -> info:NUMONLY:GEOMETRY
- class `feat|Specter Transformation: Stage 3|Specter Transformation: Stage 3#6` On a failure you act as if under the Confusion spell for 1 minute. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Boon of Planar Travel#3` After you use this boon, you can't use it again until you finish a Short Rest. -> info:REST:NONUM
- class `item|dmg|Boon of Planar Travel#3` After you use this boon, you can't use it again until you finish a Short Rest. -> info:REST:NONUM
- record `feat|Mark of Hospitality|Mark of Hospitality#9` Each free cast returns after a Long Rest. -> info:REST:NONUM
- class `feat|Mark of Hospitality|Mark of Hospitality#9` Each free cast returns after a Long Rest. -> info:REST:NONUM
- record `sub|Warlock/The Great Old One (2014)|Entropic Ward#2` If the attack misses, you have Advantage on your next attack roll against that creature if you make it before the end of -> info:ACTIVE:OTHERS
- class `sub|Warlock/The Great Old One (2014)|Entropic Ward#2` If the attack misses, you have Advantage on your next attack roll against that creature if you make it before the end of -> info:ACTIVE:OTHERS
- record `sub|Sorcerer/Frost Sorcery|Frozen Soul#5` Long Rest to cast it this way again. -> covered
- class `sub|Sorcerer/Frost Sorcery|Frozen Soul#5` Long Rest to cast it this way again. -> info:REST:NONUM
- record `sub|Summoner/Bond of the Fiendish Chain|Protection of the Lower Planes#10` A Long Rest restores all. -> covered
- class `sub|Summoner/Bond of the Fiendish Chain|Protection of the Lower Planes#10` A Long Rest restores all. -> info:REST:NONUM
