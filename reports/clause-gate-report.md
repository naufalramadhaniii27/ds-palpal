# Laporan clause gate (mode laporan, 2026-11-19)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 10262 |
| Info (tag terdokumentasi) | 29176 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2679, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1569, FXO_NULL 1351, NUMONLY:ROLL 1217, NUMONLY:TABLE 1009, FORM:TABLE 979, ACTIVE:TRIGGER 924, ACTIVE:OTHERS 781, BY_DESIGN 670, REST:NONUM 606, NUMONLY:FLAVOR 340, STD:ASI 245, COND:PLAY_STATE 244, NUMONLY:ZERO 193, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ITEM:ARTIFACT_PROPS 62, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, SPELL:RIDER 15, SPELL:CANTRIP_DMG 13, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 4811 |
| Uncovered dengan angka | 3130 |
| Uncovered dengan kelas kata kunci mekanik | 4496 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 315 |
| Angka yang tidak dijelaskan record mana pun | 2995 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 3914 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 247 |
| Waktu | muat data 8 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 194 ditangkap (64.9%). Hapus semua atom kelas yang dibutuhkan: 199 ditangkap (66.6%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 270 ditangkap (90.0%), semua atom kelas dihapus: 299 ditangkap (99.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3443 |
| GX | 2506 |
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

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 365, fx-L5.js 206, fx-L12.js 192, fx-L10.js 191, fx-L4.js 177, fx-L3.js 144, fx-L1.js 137, fx-L2.js 137, fx-N1.js 116, fx-L11.js 101, fx-L9.js 101, fx-B36-subfree2.js 75.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 844 | 11.4% |
| DMG | 4658 | 631 | 13.5% |
| SPEED | 1411 | 526 | 37.3% |
| SPELL | 3255 | 499 | 15.3% |
| PROF | 1124 | 404 | 35.9% |
| ADV | 1959 | 366 | 18.7% |
| RES | 1375 | 365 | 26.5% |
| IMM | 1004 | 318 | 31.7% |
| CHOICE | 1663 | 311 | 18.7% |
| SLOT | 1425 | 273 | 19.2% |
| NUM | 8604 | 267 | 3.1% |
| DIS | 1221 | 227 | 18.6% |
| DC | 2903 | 221 | 7.6% |
| SENSE | 648 | 194 | 29.9% |
| ATK | 1056 | 163 | 15.4% |
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
| item | 19265 | 5161 | 11727 | 0 | 2377 |
| species | 1638 | 953 | 492 | 0 | 193 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2664 | 5884 | 0 | 1570 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2821 | 6358 | 1281 | 12.2% |
| tvss | 2788 | 727 | 1639 | 422 | 15.1% |
| core | 1495 | 436 | 792 | 267 | 17.9% |
| tsgs | 1479 | 409 | 831 | 239 | 16.2% |
| ttoh | 1470 | 378 | 870 | 222 | 15.1% |
| tvss14 | 1201 | 258 | 740 | 203 | 16.9% |
| tkdm | 921 | 259 | 488 | 174 | 18.9% |
| tghp | 1116 | 395 | 553 | 168 | 15.1% |
| tsdm | 1063 | 304 | 592 | 167 | 15.7% |
| tdm14 | 643 | 154 | 382 | 107 | 16.6% |
| au | 535 | 165 | 279 | 91 | 17.0% |
| tgh14p | 490 | 122 | 281 | 87 | 17.8% |
| phb14 | 513 | 176 | 258 | 79 | 15.4% |
| tua24 | 634 | 225 | 330 | 79 | 12.5% |
| tce | 730 | 202 | 454 | 74 | 10.1% |
| twow | 542 | 154 | 314 | 74 | 13.7% |
| thhw | 395 | 95 | 232 | 68 | 17.2% |
| dmg14 | 540 | 188 | 289 | 63 | 11.7% |
| tee24 | 463 | 190 | 216 | 57 | 12.3% |
| xge | 375 | 120 | 206 | 49 | 13.1% |
| egw | 365 | 103 | 214 | 48 | 13.2% |
| tssm | 275 | 79 | 148 | 48 | 17.5% |
| tghg | 288 | 78 | 162 | 48 | 16.7% |
| hof | 249 | 66 | 141 | 42 | 16.9% |
| coa | 158 | 47 | 72 | 39 | 24.7% |
| rhw | 231 | 80 | 113 | 38 | 16.5% |
| tdcsr | 299 | 113 | 148 | 38 | 12.7% |
| misc14 | 326 | 68 | 222 | 36 | 11.0% |
| tsgeh | 183 | 65 | 89 | 29 | 15.8% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| bgg | 207 | 67 | 121 | 19 | 9.2% |
| wbtw | 92 | 19 | 54 | 19 | 20.7% |
| ftd | 159 | 41 | 100 | 18 | 11.3% |
| mot | 292 | 115 | 159 | 18 | 6.2% |
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
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| abh | 53 | 24 | 19 | 10 | 18.9% |
| pabtso | 69 | 27 | 32 | 10 | 14.5% |
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
| RESOURCE | 575 | 502 |
| DMG | 470 | 416 |
| SPEED | 443 | 352 |
| PROF | 359 | 150 |
| ADV | 356 | 176 |
| SPELL | 329 | 82 |
| RES | 297 | 138 |
| NUM | 267 | 267 |
| SLOT | 255 | 96 |
| IMM | 212 | 79 |
| CHOICE | 203 | 76 |
| DIS | 186 | 95 |
| SENSE | 168 | 142 |
| AC | 162 | 127 |
| ATK | 128 | 91 |
| HP | 112 | 85 |
| DC | 106 | 100 |
| SAVE | 80 | 61 |
| ABIL | 37 | 34 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (575 uncovered)

- `class|Monk|Superior Defense#1` At the start of your turn, you can spend 3 Focus Points to brace against harm. | number 3 no record explains
- `feat|Draconic Rune Casting|Draconic Rune Casting#5` You can have a number of empowered runes at once equal to 1 + your Proficiency Bonus, and use them to replicate spells as the book describes. | no record for RESOURCE; number 1,pb unexplained
- `feat|Tireless Reveler|Tireless Reveler#3` You can do this a number of times equal to your Proficiency Bonus, and regain all expended uses after a Short or Long Rest. | number pb no record explains
- `feat|Troll-Blooded|Troll-Blooded#2` You regain 1 hit point each minute while you have no more than one quarter of your hit points (rounded down). | no record for RESOURCE; number 1 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#20` - Its number of charges increases to 5. | number 5 no record explains
- `item|dmg|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|dmg|Bigby's Beneficent Bracelet#16` The bracelet can create up to three copies and regains all expended uses at dawn. | number 3 no record explains
- `item|dmg|Blackrazor#5` Each time you hit an Undead with it, you take 1d10 Necrotic damage and the Undead regains 1d10 Hit Points. | number 1d10 no record explains
- `item|dmg|Fire Fire!#2` While it has a charge it sheds Bright Light 20 ft and Dim Light 20 ft more, and nonmagical Bolts it fires deal an extra 1d6 Fire. | number 1d6,20 no record explains
- `item|dmg|Gauntlets of Rage#4` Each time you deal damage, you regain 2d8 hit points and may immediately remove a condition you currently suffer from or end this fury. | no record for DMG; number 2d8 unexplained
- `item|dmg|Icon of Ravenloft#14` The target regains 3d8 + 3 hit points, unless it is an undead, a construct, or a fiend. | number 3d8,3 no record explains
- `item|dmg|Iggwilv's Cauldron#43` - Tying a dead frog or toad to the end of an ordinary branch and dipping it in the water-filled cauldron transforms the branch into a wand of polymorph with 3 charges. | number 3 no record explains
- `item|dmg|Philosopher's Stone#4` Spend 1 hour (it can overlap a Short Rest) with resources of one kind (fish, gems, herbs, ore or stone, leather or hide, cloth) to turn them into another kind of equal value. | number 1 no record explains
- `item|dmg|Ring of Shooting Stars#18` For each charge spent, the ring hurls a shining speck of light toward a point in your view no more than 60 feet away. | number 60 no record explains
- `item|dmg|Ruin's Wake (Exalted)#15` - When you reduce a creature to 0 hit points with an attack from the spear, you can regain hit points equal to the damage you dealt with the attack. | number 0 no record explains
- `item|dmg|Sanctuary Charm#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | number 7 no record explains
- `item|dmg|Zafu of the Wandering Mind#5` Within 100 ft of a pillow, use a Bonus Action and command word to send them into a pocket dimension, and repeat to return them to an open space within 5 ft. The set has 3 charges and regains 1d3 at dawn. | number 100,5 no record explains
- `item|egw|Arcane Cannon#4` After the cannon has fired, it must recharge for 5 minutes before it can be fired again. | no record for RESOURCE; number 5 unexplained
- `item|misc14|Charm of Cozmioko's Glory#3` Light: regain 28 (8d6) Hit Points. | number 8d6,28 no record explains
- `item|misc14|Constantori's Portrait#27` If the painting has at least 1 hit point and is targeted by a mending spell, it regains 2d6 hit points. | number 2d6 no record explains
- `item|pabtso|Ring of the Orator#2` While you wear it, you can expend 1 of its charges to project your voice to be heard clearly by all creatures within 1 mile of yourself, regardless of intervening noise, for 1 minute. | number 1,1,1 no record explains
- `item|tce|Luba's Tarokka of Souls#26` The deck can be used in this way twice, and you regain all expended uses at the next dawn. | number double no record explains
- `item|tdm14|Gamma Pendant#9` On a 20 it regains 1d12 + 1. | number 1d12,1 no record explains
- `item|tee24|Blast Disk (Uncommon)#6` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tsgs|Cloak of the Boundless Spirit#5` An ally can gain the 1 Hit Point from a 19 only once per Long Rest. | number 1,19 no record explains
- `item|tsgs|Fire Dervish Cloak#4` On a failure they take 1d8 Fire per charge spent and cannot make Opportunity Attacks against you this turn. | number 1d8 no record explains
- `item|tsgs|Knight's Standard of Valor#5` Changing the flag takes 1 hour of focus, possible during a Short Rest. | no record for RESOURCE
- `item|tsgs|Seed of Rebirth#1` A fist-sized seed that up to 4 creatures can attune to during a Long Rest. | no record for RESOURCE; number 4 unexplained
- `item|ttoh|Beads of Contemplation#3` At the end of a rest, touch them and spend ki points equal to half your Proficiency Bonus to place ki in them. | no record for RESOURCE; number half,pb unexplained
- `item|ttoh|Deadbane Heartglow Lantern#8` While holding it, use an action and spend 1 or more charges to make it detect undead for 1 hour. | no record for RESOURCE; number 1,1 unexplained
- `item|wbtw|Pixie Dust#4` A small packet holds enough pixie dust for one use. | no record for RESOURCE; number 1 unexplained
- `item|wbtw|Scissors of Shadow Snipping#13` If a shadowless creature is subjected to any spell that ends a curse, or if its detached shadow is reduced to 0 hit points, the detached shadow disappears, and the creature regains its normal shadow instantly. | number 0 no record explains
- `sub|Bard/College of Dirges|Death's Friend#2` Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. | no record for RESOURCE; number 60 unexplained
- `sub|Craftsman/Calibarons' Guild|Exotic Ammunition#1` After a Long Rest, you can make up to twice your Craftsman level in pieces of ammunition. | no record for RESOURCE; number double unexplained
- `sub|Fighter/Banneret|Group Recovery#1` When you use Second Wind to regain Hit Points, you can pick a number of allies within a 30-foot Emanation from you, up to your Charisma modifier (minimum of one). | number 30 no record explains
- `sub|Ranger/Big Game Hunter|Game Hunter#2` Until your next Long Rest, your Ranged Attack Rolls against creatures of that size deal an extra 1d8 Piercing damage. | no record for DMG; number 1d8 unexplained
- `sub|Sorcerer/Mirrorkin|Reflect Magic#1` When a creature casts a spell that calls for a saving throw and targets you or includes you in its area, spend sorcery points equal to the spell's level (1 for a cantrip). | no record for RESOURCE,SPELL; number 1 unexplained
- `sub|Sorcerer/Shadow Magic|Eyes of the Dark#3` You can cast it by spending 2 Sorcery Points or a slot. | no record for RESOURCE; number 2 unexplained
- `sub|Sorcerer/Toon Magic|Madcap Magic#2` After a Short or Long Rest, roll 1d6 on the 1st-level column of the Madcap Spells table and learn that spell until you roll again. | no record for RESOURCE; number 1d6 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Summoner's Blast#4` After each Long Rest, pick one Summoner Evocation spell of a level up to half your Summoner level (round up, maximum 5). | no record for CHOICE; number 5,half unexplained

### DMG (470 uncovered)

- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | no record for DMG; number 2d8 unexplained
- `class|Investigator|Finisher#2` The extra damage is 1d8 at level 2, 2d8 at level 11, and 3d8 at level 17. | no record for DMG; number 1d8 unexplained
- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | no record for DMG; number 1d6 unexplained
- `item|bmt|Ruinous Flail#2` You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals double damage to objects and structures. | number double no record explains
- `item|coa|Ruby Rod of Asmodeus#6` If a creature uses the special abilities of the rod without Asmodeus's permission, they take 2d12 necrotic damage each use, doubled if they're good aligned. | no record for DMG; number 2d12,double unexplained
- `item|coa|True-Ice Shards (Rapier)#21` If you attack with the rapier before the end of your next turn, you do not have its +3 bonus to attack and damage rolls. | no record for DMG; number 3 unexplained
- `item|dmg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | no record for DMG; number 1,2 unexplained
- `item|dmg|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|dmg|Burning Knuckles#2` Your unarmed strikes deal 2d6 Fire damage instead of their usual damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Crosier of Divine Power#3` When you hit with it or heal with a spell or effect while holding it, spend 1 mote to add 2d6 to the damage (Radiant) or healing. | no record for DMG; number 2d6,1 unexplained
- `item|dmg|Grovelthrash (Dormant)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Helm of Brilliance#12` Any target you hit with an attack using the burning weapon takes 1d6 extra Fire damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Oil of Defoliation#4` You can also apply it directly to a willing, helpless, or immobile plant or plant creature, which takes 4d6 Necrotic damage. | no record for DMG; number 4d6 unexplained
- `item|dmg|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|dmg|Sling of the Tiny Giant#3` A ranged hit deals an extra 1d4 Force damage per size category the target is larger than you, up to 3d4. | number 3d4 no record explains
- `item|dmg|Snicker-Snack#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `item|dmg|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Telescoping Bladelance#3` Retracted, it is a Greatsword that deals 1d10 Slashing damage instead of 2d6. | no record for DMG; number 1d10,2d6 unexplained
- `item|dmg|Wand of Wonder#18` You take 1d6 Psychic damage instead. | no record for DMG; number 1d6 unexplained
- `item|pota|Tinderstrike#2` Its handle is always warm to the touch, and the blade smolders for 1d4 minutes after it is used to deal damage. | no record for DMG; number 1d4 unexplained
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Justiciar's Gavel#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Forgemaster's Might#10` It deals an extra 2d8 Bludgeoning damage to Constructs and structures. | no record for DMG; number 2d8 unexplained
- `item|tsgs|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | no record for DMG; number 3d8 unexplained
- `item|tsgs|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | number 1d6 no record explains
- `item|tsgs|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `item|tsgs|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | number 10 no record explains
- `item|tvss14|Weapon Charms#6` Blade (Uncommon): +1 to attack and damage rolls (not if the weapon already has a bonus). | no record for DMG; number 1 unexplained
- `item|twow|Sulfuras, Hand of Ragnaros#4` It takes 1d10 Fire damage at the start of each of its turns instead of the normal burning damage. | no record for DMG; number 1d10 unexplained
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | no record for DMG; number 1d6 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Barbarian/Path of the Zealot|Divine Fury#2` During your Rage, on each of your turns, the first creature that a weapon or Unarmed Strike of yours hits takes extra damage equal to 1d6 + half your Barbarian level (rounded down). | number half no record explains
- `sub|Captain/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | no record for DMG; number 1d6 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#31` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | no record for DMG; number 2d8 unexplained
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | no record for DMG; number 2d8 unexplained

### SPEED (443 uncovered)

- `class|Dancer|Fast Movement#1` Your Speed rises by 10 feet while you do not wear Heavy armor. | no record for SPEED; number 10 unexplained
- `class|Demon Hunter|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | no record for SPEED; number 10 unexplained
- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | no record for SPEED; number 1,4 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `item|dmg|Bloodspeed Elixir#2` When you drink it, your speed triples for 1 minute. | no record for SPEED; number 1 unexplained
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Grovelthrash (Exalted)#14` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | number 5,half no record explains
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for SPEED; number 2d4,2,half unexplained
- `item|dmg|Winged Boots#2` While you wear them, you can spend 1 charge as a Magic action to gain a Fly Speed of 30 feet for 1 hour. | number 1,1 no record explains
- `item|llk|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE; number 1,5 unexplained
- `item|skt|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|tgh14p|Zeal#4` As a bonus action you can let it hover in an open space within 5 ft. While you see it, a bonus action commands it to fly 50 ft and either attack once or return to your hands. | no record for SPEED; number 5,50 unexplained
- `item|tsgs|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | no record for SPEED; number 15,1 unexplained
- `item|tsgs|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#7` 5 Gold: Climb Speed equal to your Speed. | no record for SPEED; number 5 unexplained
- `item|twow|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
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

### PROF (359 uncovered)

- `class|Bard|Expertise#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | number pb no record explains
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | number pb no record explains
- `item|dmg|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|tdm14|Arm Cannon#2` An arm is replaced by a blaster cannon, 2d8 Radiant, Blaster property, range 30/120 ft. You are proficient with it and cannot be disarmed of it. | no record for PROF; number 2d8,120,30 unexplained
- `item|tdm14|Gamma Pendant#5` You are proficient with it, can use your spellcasting modifier for its attacks, gain +2 to attack and damage with it, and it deals Force damage. | no record for DMG,PROF; number 2 unexplained
- `item|tdm14|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tee24|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tvss14|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|tvss14|Brawling Gloves (very rare)#2` You are proficient with all improvised weapons and gain +3 to attack and damage rolls made with them. | no record for DMG,PROF; number 3 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Autumn Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | number pb no record explains
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `sub|Barbarian/Path of the Dragon|Wyrm Teeth#2` As a bonus action, make a melee bite attack against a creature you see within 5 ft. You are proficient with it. | no record for PROF; number 5 unexplained
- `sub|Captain/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Ranger/Grove Warden|Wrath of the Forest#1` When you take the Attack action, use a bonus action to have a rock, branch, root or similar small object strike a creature within 30 ft. You are proficient with it, it counts as magical, you add your Dexterity modifier t | no record for DMG,PROF; number 1d8,30 unexplained
- `sub|Wizard/Necrophage|Memory of Flesh#4` If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. | no record for CHOICE,PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|Lore of Life and Death#1` You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. | number double,pb no record explains

### ADV (356 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV
- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | no record for ADV,INIT; number 1 unexplained
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `item|au|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|coa|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | no record for ADV; number 1,12 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | number 1 no record explains
- `item|dmg|Emperor's Garlic#7` Eat a raw clove as an action to gain Resistance to Poison damage and Advantage on saves against Poisoned for 1 hour, but Disadvantage on all Deception and Persuasion checks for that time. | no record for ADV,DIS,RES; number 1 unexplained
- `item|dmg|Forgemaster's Might#8` You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil. | no record for ADV; number 5 unexplained
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Rope of Climbing#6` While knotted, the rope is only 50 feet long, and it gives Advantage on ability checks made to climb with it. | number 50 no record explains
- `item|egw|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|tee24|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|tgh14c|Full Moon Extract#2` For 1 hour after you take it, your Strength is 19 (if lower) and you have Advantage on Strength checks and saves. | number 1,19 no record explains
- `item|tghg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | number 1 no record explains
- `item|tsgs|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsgs|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | number 2,22 no record explains
- `item|ttoh|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `species|Elf/Shadow Fey Heritage|Supernatural Senses#2` Proficiency in Perception, and Advantage on Perception checks to notice or find a creature within 30 feet that lacks some of its hit points. | no record for ADV,PROF
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Rogue/Smuggler|Dab-handed Dealer#4` Cunning Action can fund a check to control a vehicle, or a Sleight of Hand check to conceal a light weapon on you, opposed by Perception of creatures within 5 ft. On a success you have Advantage on your next attack again | no record for ADV; number 5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Warlock/Wyrdweaver|Favored Soul#2` On a failure it has Disadvantage on that roll and you have Advantage on one d20 roll of your choice in the next minute. | no record for ADV,CHOICE,DIS; number 1d20 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | no record for ADV; number 8 unexplained

### SPELL (329 uncovered)

- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Ranger|Fighting Style#4` Pick two Druid cantrips to learn. | no record for SPELL
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Cantrip Specialist|Cantrip Specialist#1` You learn two Warmage tricks from this list: Blasting Cantrip, Corrosive Cantrip, Draining Cantrip, Explosive Cantrip, Icy Cantrip, Severe Cantrip, Silent Cantrip, Static Cantrip. | no record for SPELL; number 2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#3` You learn four chronomancy spells that you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spellblade (2014)|Spellblade (2014)#3` You learn two cantrips from Arc Blade, Burning Blade, Caustic Blade and Frigid Blade, using Intelligence. | no record for SPELL; number 2 unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|dmg|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tsdm|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | no record for SPELL; number 2 unexplained
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | number 2 no record explains
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Soulspy|Spellcasting#2` You learn three cantrips from the cleric list and a fourth at level 10. | no record for SPELL; number 3 unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | no record for SPELL; number 1d6 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### RES (297 uncovered)

- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | number 1 no record explains
- `feat|Seraph Transformation: Level 4|Seraph Transformation: Level 4#10` When you roll a natural 1 on a save against a magical spell or ability, you take 1d6 Force damage per two class levels, ignoring resistance and immunity. | no record for DMG,IMM,RES; number 1d6,1,2 unexplained
- `feat|Vampire Transformation: Stage 3|Vampire Transformation: Stage 3#5` If you start your turn in sunlight you take 1d10 Radiant damage, and nothing can give you Resistance or Immunity to it. | no record for DMG,IMM,RES; number 1d10 unexplained
- `feat|Void Scribe|Void Scribe#3` While the glyph is intact, the object is vulnerable to necrotic damage and takes 1d6 necrotic damage at the end of your turn. | no record for DMG,RES; number 1d6 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|dmg|Twin Blades of Azzinoth#3` Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. | no record for IMM,RES
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|tsgs|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|twow|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Cleric/War Domain|Avatar of Battle#1` You gain Resistance against three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | no record for RES,SLOT; number 1d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | no record for RES,RESOURCE; number 1,3 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | number 10,50,300 no record explains
- `sub|Paladin/Oath of Winter|Channel Divinity#4` Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. | no record for RES; number 0 unexplained
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | number 10 no record explains
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#1` Spells always prepared from the listed Sorcerer levels: 3 Command, Guidance, Locate Object, Protection from Evil and Good, Resistance, Spiritual Weapon. | no record for RES; number 3 unexplained
- `sub|Sorcerer/Apocalypse Sorcery|Forbidden Magic#4` Right after casting you take Force damage equal to four times the slot level, ignoring Resistance and Immunity. | no record for IMM,RES,SLOT; number 4 unexplained
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Warlock/The Legacy|Aura of Legend#1` While transformed, you and friendly creatures within 30 ft have Resistance to your Relic Force damage type. | no record for RES; number 30 unexplained
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | no record for RES; number 30 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Transmuter|Potent Stone#4` If you pick Resistance twice, you must choose different damage types. | no record for RES; number double unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | number 20 no record explains

### NUM (267 uncovered)

- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | number 2,3 no record explains
- `feat|Boon of Fluid Forms|Boon of Fluid Forms#11` The Temporary Hit Points you gain from shape-shifting increase by 20. | number 20 no record explains
- `feat|Crossbow Expert|Crossbow Expert#2` Your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `item|bgg|Prehistoric Figurine of Wondrous Power, Jasper Tyrannosaurus Rex#16` On a 1, you lose control of the figurine, and it becomes hostile to you and your companions until it is reduced to 0 hit points, at which point it reverts to figurine form. | number 0 no record explains
- `item|cos|Crusader's Shortsword#1` The Crusader's Shortsword is a sentient lawful good +1 shortsword (Intelligence 11, Wisdom 13, Charisma 13). | number 11,13 no record explains
- `item|dmg14|Horn of Valhalla, Silver#6` The silver horn summons 2d4 + 2 berserkers. | number 2d4,2 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | number 0,pb no record explains
- `item|dmg|Figurine of Wondrous Power, Ivory Goats#23` One horn becomes a +1 lance, and the other becomes a +2 longsword. | number 1,2 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Gloves of Swimming and Climbing#2` You also gain a +5 bonus to any Strength (Athletics) check you make to climb or to swim. | number 5 no record explains
- `item|dmg|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|dmg|Ioun Stone#61` While it circles your head, your Strength rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Jax#2` For 1 hour, your Strength and Dexterity each rise by 2, to a maximum of 22. | number 1,2 no record explains
- `item|dmg|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|dmg|Manual of Bodily Health#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Constitution, which can raise that score as high as 30 but not highe | number 48,6,2,30 no record explains
- `item|dmg|Manual of Quickness of Action#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Dexterity, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|dmg|Shard of the Ise Rune#12` The next time within the next minute that the target takes bludgeoning, slashing, or piercing damage, that damage is reduced to 0, and the mantle is destroyed. | number 0 no record explains
- `item|dmg|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|dmg|Sundersludge Net#3` Nonmagical metal armor it wears takes a cumulative -1 AC penalty with each Acid hit and is destroyed when the AC would reach 10. | number 1,10 no record explains
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|misc14|Winter's Dark Bite#5` While in the Upside Down, it works as a +4 greatsword. | number 4 no record explains
- `item|skt|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|tgh14p|Faerie Crown#2` It has 1d6 + 3 butterflies hovering around it. | number 1d6,3 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|tsgs|Firecracker Crystals#1` A bag of 1d4 + 8 festival crystals. | number 1d4,8 no record explains
- `item|tsgs|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | number 5 no record explains
- `item|tvss14|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|wdmm|Shield of the Uven Rune#19` The bonus increases to +3 when the weapon is used against one of the following creature types, chosen by you at the time of the magic weapon's creation: aberrations, celestials, constructs, dragons, elementals, fey, fien | number 3 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Craftsman/Arcane Maesters' Guild|Magic Item Crafting#13` Bag of Holding, Lantern of Revealing, Decanter of Endless Water, Rope of Climbing, Eyes of Minute Seeing, Sending Stones, Goggles of Night, Wand of Magic Detection, Helm of Comprehending Languages, +1 Wand of the War Mag | number 1 no record explains
- `sub|Martyr/Burden of Ascension|Demigod Ascendant#2` Your Strength and Dexterity scores gain +4 for 1 minute, up to a maximum of 24. | number 4 no record explains
- `sub|Monk/Way of Street Fighting|Combo#2` The bonus resets to 0 if you take damage on your turn. | number 0 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Warmage/Coalition Arcanist|Tactical Uplink#3` You also get +5 to your Passive Wisdom (Perception). | number 5 no record explains
- `sub|Witch/Blue Magic|Blue Magic Duplication#8` Your prepared count still cannot pass the table value, and it rises by 4 at Witch level 3, then by 2 at levels 5, 7, and 9. | number 4,2 no record explains
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | number 2 no record explains

### SLOT (255 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT; number 15 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### IMM (212 uncovered)

- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#11` At the start of your turn, if you see, hear or smell a hostile or helpless nonplayer creature, make a DC 10 Wisdom save or turn into hybrid form, and a success makes you immune until dawn. | no record for DC,IMM; number 10 unexplained
- `item|bgdia|Soul Coin#25` A soul coin has AC 19, 1 hit point for each charge it has remaining, and immunity to all damage except that which is dealt by a hellfire weapon or an infernal war machine's furnace (see "11"). | no record for IMM; number 19,1,11 unexplained
- `item|coa|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | no record for IMM; number 24,3 unexplained
- `item|dmg|Armor of Invulnerability#4` This Immunity lasts 10 minutes or until you stop wearing the armor. | no record for IMM; number 10 unexplained
- `item|dmg|Bliss#2` A Humanoid who swallows it feels calm and happy for 1d4 hours, gaining Immunity to the Frightened condition and 3d10 Temporary Hit Points. | no record for IMM; number 1d4,3d10 unexplained
- `item|dmg|Cure-All#2` As an action, drink a dose to cure any disease, end the Poisoned condition and become immune to it for 1 hour. | no record for IMM; number 1 unexplained
- `item|dmg|Hearthfire Breastplate (Master)#10` When a creature you see within 30 ft takes damage, use a Reaction to give it Immunity to all damage until the start of your next turn, once per Long Rest. | no record for IMM; number 30 unexplained
- `item|dmg|Hunter's Mutagen#2` When you drink it, you are immune to Poison damage and disease for 1 hour. | no record for IMM; number 1 unexplained
- `item|dmg|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | no record for IMM; number 1 unexplained
- `item|dmg|Joho's Charm#3` Joho is a Tiny construct with 1 hit point, speed 10 feet, and immunity to poison and the poisoned condition. | no record for IMM,SPEED; number 10,1 unexplained
- `item|dmg|Nightstalker's Kanabo#3` On a natural 20, the target makes a DC 16 Constitution save or is Unconscious until the end of your next turn (damage or a shake ends it, and creatures that do not sleep or are immune to Exhaustion pass). | no record for DC,IMM; number 20,16 unexplained
- `item|dmg|Oathbound Ring#10` The ring is immune to Psychic, Poison, Bludgeoning, Piercing, and Slashing damage, and has AC 20, a damage threshold of 30, and 50 hit points. | number 20,30,50 no record explains
- `item|dmg|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|dmg|Ring of Winter#27` - You can cast one of the following spells from the ring (spell save DC 17) by expending the necessary number of charges: Bigby's hand (2 charges; the hand is made of ice, is immune to cold damage, and deals bludgeoning  | no record for DC,IMM; number 17 unexplained
- `item|dmg|Rope of Climbing#7` The rope has Armor Class 20, 20 Hit Points, and Immunity to Poison and Psychic damage. | number 20 no record explains
- `item|dmg|Sandstone Solution#4` On mud, sand or quicksand, a 10-ft-deep, 10-ft-radius area turns to solid stone for 1 hour, with AC 17, 75 hit points and immunity to Psychic and Poison. | no record for IMM; number 10,1,17,75 unexplained
- `item|dmg|Strawbundle's Charm#3` The doll is a Tiny construct with 1 hit point, immune to poison and the poisoned condition. | no record for IMM; number 1 unexplained
- `item|frafi|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|tee24|Final Messenger#2` A Tiny Construct homunculus with AC 20, 6 Hit Points and a Fly Speed of 60 ft. It is immune to Poison and Psychic damage and to all conditions except Unconscious, treats ability scores as 10, has Darkvision 60 ft, and ca | no record for IMM,SENSE,SPEED; number 60,20,6,10 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#2` It has 2 minor beneficial and 1 minor detrimental random artifact properties (a goblinoid is immune to the detrimental one). | no record for IMM; number 2,1 unexplained
- `item|tgh14p|Hunter's Mutagen#2` When you drink it, you are immune to Poison damage and disease for 1 hour. | no record for IMM; number 1 unexplained
- `item|tkdm|Oathbound Ring#10` The ring is immune to Psychic, Poison, Bludgeoning, Piercing, and Slashing damage, and has AC 20, a damage threshold of 30, and 50 hit points. | number 20,30,50 no record explains
- `item|toa|Ring of Winter#27` - You can cast one of the following spells from the ring (spell save DC 17) by expending the necessary number of charges: Bigby's hand (2 charges; the hand is made of ice, is immune to cold damage, and deals bludgeoning  | no record for DC,IMM; number 17 unexplained
- `item|tsgs|Ferryman's Take#6` A conscious one enters a death-like state for 1 hour, with Immunity to Psychic damage (once per 24 hours). | no record for IMM,RESOURCE; number 1,24 unexplained
- `item|tsgs|Helm of Heroes#3` While it glimmers, you gain Temporary Hit Points equal to half your level (rounded down) at the start of each of your turns, and you and allies within 10 ft are Immune to Frightened. | no record for IMM; number 10,half unexplained
- `item|tsgs|Nightstalker's Kanabo#3` On a natural 20, the target makes a DC 16 Constitution save or is Unconscious until the end of your next turn (damage or a shake ends it, and creatures that do not sleep or are immune to Exhaustion pass). | no record for DC,IMM; number 20,16 unexplained
- `item|tsgs|Plaguebane Mask#5` Each creature makes a DC 15 Constitution save, taking 2d8 Poison and having its Speed halved until the end of its next turn on a fail (not if immune to Poisoned), or half damage only on a pass. | no record for DC,IMM,SPEED; number 2d8,15,half unexplained
- `item|tsgs|Winter's Embrace#3` You can cast the level 6 Ice Storm (save DC 16) from it, centered on a point within 5 ft of you, and you are immune to its effects. | no record for DC,IMM; number 5,16 unexplained
- `item|tvss14|Sandstone Solution#4` On mud, sand or quicksand, a 10-ft-deep, 10-ft-radius area turns to solid stone for 1 hour, with AC 17, 75 hit points and immunity to Psychic and Poison. | no record for IMM; number 10,1,17,75 unexplained
- `item|tvss|Liquid Courage#3` You gain Heroic Inspiration and Immunity to the Frightened condition for 10 minutes. | number 10 no record explains
- `item|wbtw|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | no record for IMM; number 1 unexplained
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | no record for IMM; number 3 unexplained
- `sub|Druid/Circle of Sand|Sandstorm#4` You are immune, and so are up to your Proficiency Bonus creatures you see within 120 ft. Rest to use again. | no record for IMM; number 120,pb unexplained
- `sub|Investigator/Decommissioner|Reprogrammer#6` Sleep Mode: it is Unconscious for 1 minute even if normally immune, ending early if it takes damage. | no record for IMM; number 1 unexplained
- `sub|Necromancer/Cyberghoul|Cyber Lich (Lichdom)#9` A Construct that passes the save is immune for 24 hours. | no record for IMM; number 24 unexplained
- `sub|Paladin/Oath of Thunder|Child of the Storm#9` A creature that succeeds is immune to the war cry for 24 hours. | number 24 no record explains
- `sub|Ranger/Green Reaper (2014)|3rd-Level Effects#3` Supernatural: a weapon hit with this toxin removes its immunity to Poisoned, and it stays Poisoned for 1 minute, saving at the end of each turn to end it. | no record for IMM; number 1 unexplained
- `sub|Rogue/Infiltrator (2014)|Hacking Spike#2` When you hit a construct with a melee Sneak Attack, it makes a Wisdom save (DC 8 + Proficiency Bonus + Intelligence modifier) or is Stunned until the start of your next turn, even if normally immune. | no record for DC,IMM; number 8,pb unexplained
- `sub|Summoner/Bond of the Dragon Herald|Draconic Realisation#1` Your Eidolon is Immune to the Frightened condition and has a Fly Speed of 60 feet. | no record for IMM,SPEED; number 60 unexplained
- `sub|Warlock/The Undying|Undying Nature#2` For every 10 years that pass you age only 1 year, and you are immune to magical aging. | no record for IMM; number 1 unexplained

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (112)

- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | angka: double,pb
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Captain|Cohort~4#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Captain|Cohort~3#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | angka: 0
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | angka: 2
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Warden|Sentinel's Strike#8` It takes Bludgeoning damage equal to 1d8 plus the Shield's AC bonus. | angka: 1d8
- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | angka: 4
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Vagabond|Battle Tactics#15` A maneuver's save DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Captain|Cohort~2#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0

### feat (204)

- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | angka: 2
- `feat|Skulker|Skulker#4` You gain Blindsight out to 10 feet. | angka: 10
- `feat|Pack Fighting|Pack Fighting#3` If an ally within 5 feet of the creature also has this feat and is not Incapacitated, the bonus becomes +2. | angka: 5,2
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#28` You gain darkvision 60 ft if you lack it. | angka: 60
- `feat|Part of the Pack|Part of the Pack#6` At 5th level or higher, your howl summons a number of wolves equal to your Proficiency Bonus, with a 50 percent chance that one is a dire wolf, and never more than one dire wolf. | angka: 50,pb
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | angka: 3
- `feat|Heavy Armor Master (2014)|Heavy Armor Master (2014)#6` While you wear Heavy armor, Bludgeoning, Piercing, and Slashing damage from nonmagical weapons is reduced by 3. | angka: 3
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | angka: 30
- `feat|Iron Hero|Iron Hero#1` When a creature with a Challenge Rating higher than your level attacks you, you have +2 AC. | angka: 2
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Inventor|Inventor#8` If a Gadget requires a saving throw, the DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `feat|Mantle of the Sun|Mantle of the Sun#7` Shield: you gain +2 AC if you wield no shield, and Resistance to Fire, Necrotic and Radiant damage. | angka: 2
- `feat|Iron Hero (2014)|Iron Hero (2014)#2` When a creature with a challenge rating above your level attacks you, you gain +2 AC. | angka: 2
- `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#15` The DC is 8 plus your Proficiency Bonus plus your Transformation Stage. | angka: 8,pb
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | angka: 5
- `feat|Spellblade (2014)|Spellblade (2014)#3` You learn two cantrips from Arc Blade, Burning Blade, Caustic Blade and Frigid Blade, using Intelligence. | angka: 2
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | angka: 4,2
- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | angka: 2
- `feat|Owlbearman|Owlbearman#2` Your hooked beak makes unarmed strikes that deal 1d6 + your Strength modifier piercing damage. | angka: 1d6
- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#5` Your bite deals 2d8 damage. | angka: 2d8
- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Troll-Blooded|Troll-Blooded#2` You regain 1 hit point each minute while you have no more than one quarter of your hit points (rounded down). | angka: 1
- `feat|Shadowsteel Master|Shadowsteel Master#6` If your Shadowsteel Focus is also a weapon, its bonus to attack rolls and damage rolls is +2. | angka: 2
- `feat|Circle Spellcaster|Circle Spellcaster#10` If both fail, you both lose concentration on all spells you maintain and each take 2d6 psychic damage. | angka: 2d6
- `feat|Chief Engineer (2014)|Chief Engineer (2014)#8` A repaired system or weapon regains 5 mega hit points instead of 1. | angka: 5,1
- `feat|Chronomancy Initiate|Chronomancy Initiate#3` You learn four chronomancy spells that you cast with this feat. | angka: 4
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20

### item (1685)

- `item|dmg|Ornithopter of Flying#2` The ornithopter has a flying speed of 30 feet, and it moves according to your spoken directions while you are riding it. | angka: 30
- `item|tsgs|War Standard of Battlecries#6` Change the emblem over 1 hour, even during a Short Rest. | angka: 1
- `item|coa|Ranseur of Torture#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 2d10 piercing damage instead of its regular damage. | angka: 2d10
- `item|dmg|Wand of Wonder#18` You take 1d6 Psychic damage instead. | angka: 1d6
- `item|tgh14p|Heaven's Herald#4` Each is immune to Frightened, has Advantage on Wisdom saves, and its hit point maximum and current hit points rise by 2d10. | angka: 2d10
- `item|tvss|Liquid Courage#3` You gain Heroic Inspiration and Immunity to the Frightened condition for 10 minutes. | angka: 10
- `item|tsgs|Fire Fire!#2` While it has a charge it sheds Bright Light 20 ft and Dim Light 20 ft more, and nonmagical Bolts it fires deal an extra 1d6 Fire. | angka: 1d6,20
- `item|dmg|Carpet of Flying, 6 ft. × 9 ft.#3` A 6 ft. × 9 ft. carpet can carry up to 800 lb. at a fly speed of 30 feet. | angka: 6,9
- `item|dmg|Winter's Embrace#3` You can cast the level 6 Ice Storm (save DC 16) from it, centered on a point within 5 ft of you, and you are immune to its effects. | angka: 5,16
- `item|frafi|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | angka: 30
- `item|au|Workshop Wrecker#1` When this 3-inch-diameter metal ball is activated as a Magic action, it moves at a rapid speed, bouncing off walls and defying any attempts to capture it. | angka: 3
- `item|dmg14|Carpet of Flying, 6 ft. × 9 ft.#3` A 6 ft. × 9 ft. carpet can carry up to 800 lb. at a fly speed of 30 feet. | angka: 6,9
- `item|dmg|Bracers of Defense#1` While wearing these bracers, you get a +2 bonus to your Armor Class, provided you wear no armor and carry no Shield. | angka: 2
- `item|dmg|Keoghtom's Ointment#1` This glass jar is 3 inches across and holds 1d4 + 1 doses of a thick mixture with a faint smell of aloe. | angka: 3
- `item|tdm14|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | angka: 2d6,80,320
- `item|ftd|+3 Dragonhide Belt#2` While wearing it, you gain a +3 bonus to the saving throw DCs of your ki features. | angka: 3
- `item|dmg|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | angka: 1
- `item|dmg|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | angka: double,pb
- `item|dmg|Scourge of Shadow#6` When you hit a good aligned creature with it, that creatures takes an extra 4d4 necrotic damage. | angka: 4d4
- `item|dmg|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a + | angka: 60,7
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from | angka: pb
- `item|tvss|Rogue's Brew#3` For 1 hour your Dexterity score rises by your Drunk level, to a maximum of 22. | angka: 1
- `item|dmg|Manual of Stone Golems#5` To create a stone golem, you must spend 90 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | angka: 90,8
- `item|dmg|Ring of Warmth#1` If Cold damage hits you while this ring is on your finger, subtract 2d8 from the damage you take. | angka: 2d8
- `item|hof|Thayan Spell Tattoo#3` If you have the Spellcasting or Pact Magic feature, the spell uses your spellcasting ability; otherwise, if the spell requires a saving throw or an attack roll, the spell save DC is 13 and the attack  | angka: 13,5
- `item|tsgs|Flesh of Dendallen#10` Removing it deals 4d10 Necrotic damage. | angka: 4d10
- `item|dmg|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | angka: 1,2
- `item|dmg|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | angka: 3d8
- `item|tsgs|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | angka: 3
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | angka: double,pb

### species (112)

- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | angka: 1
- `species|Human Chassis|Adaptable Acumen#2` Pick one of them, or another skill or tool you are proficient in, and your Proficiency Bonus is doubled on checks that use it. | angka: pb
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Kobold Heritage|Devious Bite#1` When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage. | angka: 1d4
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Geppettin|Geppettin Construction#2` Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. | angka: pb
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Gnome Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | angka: 0
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Minotaur (Amonkhet)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Skathári (DM14)|Gliding Wings#2` While falling, you can move up to 10 ft horizontally for every 5 ft you fall, up to your speed. | angka: 10,5
- `species|Bhain Kwai Minotaur|Natural Attacks#1` Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | angka: 2
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#2` You can change the choice after a Long Rest, and no score can pass 20 this way. | angka: 20
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage  | angka: 5
- `species|Wrothian (DM14)|Neural Lock#2` On a failure it is Incapacitated and its speed is 0 until the start of your next turn. | angka: 0
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of | angka: 10,5
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | angka: 3

### sub (882)

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
- `sub|Vagabond/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | angka: 1d6
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#5` 1 Can't speak or cast spells with Verbal components. | angka: 1
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#1` Spells always prepared from the listed Sorcerer levels: 3 Command, Guidance, Locate Object, Protection from Evil and Good, Resistance, Spiritual Weapon. | angka: 3
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | angka: 30
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | angka: pb
- `sub|Monk/Way of the Mask|Crowd Favorite#2` While you wear no armor and wield no shield, your AC equals 10 + your Strength modifier + your Charisma modifier. | angka: 10
- `sub|Martyr/Burden of Ascension|Relics of Legend#11` Right after you score a Critical Hit with it or reduce a creature to 0 Hit Points with it, you can move up to your Speed and make another melee weapon attack with it. | angka: 0
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | angka: 2d6,10
- `sub|Sorcerer/Aristocratic|Metamagic Mastery#1` Applying Metamagic to a spell from your school costs 1 less Sorcery Point. | angka: 1
- `sub|Alchemist/Mutagenist|Advanced Mutation#3` Your reach increases by 5 feet. | angka: 5
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | angka: 2
- `sub|Barbarian/Path of the Giant|Demiurgic Colossus#3` The extra damage from Elemental Cleaver becomes 2d6. | angka: 2d6
- `sub|Barbarian/Path of the Storm Herald|Raging Storm#9` It makes a Strength save or its Speed is 0 until the start of your next turn. | angka: 0
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | angka: 30
- `sub|Fighter/Buccaneer|Burst Maneuvers#2` Hobble: the target makes a Dexterity save or its speed drops by 10 ft until magical healing or a rest, cumulative but never below 5 ft. Penetrating Shot: against a Large or smaller target, the shot pa | angka: 10,5

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg14|Figurine of Wondrous Power, Bronze Griffon#14` Once it has been used, it can't be used again until 5 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg14|Figurine of Wondrous Power, Bronze Griffon#14` Once it has been used, it can't be used again until 5 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Shalamayne (Ellemayne)#4` A hit deals an extra 2d12 Force damage. -> info:ACTIVE:OTHERS
- record `item|dmg|Ephara's Disciple#3` Once you cast it this way, you cannot do so again until you finish a Long Rest. -> covered
- class `item|dmg|Ephara's Disciple#3` Once you cast it this way, you cannot do so again until you finish a Long Rest. -> info:REST:NONUM
- record `item|dmg|Eagle Whistle#3` A use of the whistle also ends if you land. -> info:REST:NONUM
- class `item|dmg|Eagle Whistle#3` A use of the whistle also ends if you land. -> info:REST:NONUM
- record `item|dmg|Spire of Conflux (Awakened)#6` When you cast a spell that deals bludgeoning, cold, fire, lightning or thunder damage and roll a 1 on a damage die, you  -> info:ACTIVE:TRIGGER
- class `item|dmg|Spire of Conflux (Awakened)#6` When you cast a spell that deals bludgeoning, cold, fire, lightning or thunder damage and roll a 1 on a damage die, you  -> info:ACTIVE:TRIGGER
- record `item|idrotf|Charm of Snowball Strike#9` When the last charge is spent, the Charm vanishes. -> info:REST:NONUM
- class `item|idrotf|Charm of Snowball Strike#9` When the last charge is spent, the Charm vanishes. -> info:REST:NONUM
- record `item|mot|Ephixis, Bow of Nylea#10` The bow has 1 randomly determined minor beneficial property. -> info:NUMONLY:TEXT
- class `item|mot|Ephixis, Bow of Nylea#10` The bow has 1 randomly determined minor beneficial property. -> info:NUMONLY:TEXT
- record `sub|Bard/College of Eloquence|Infectious Inspiration#2` You can do this a number of times equal to your Charisma modifier (minimum one) and regain all uses after a Long Rest. -> covered
- class `sub|Bard/College of Eloquence|Infectious Inspiration#2` You can do this a number of times equal to your Charisma modifier (minimum one) and regain all uses after a Long Rest. -> info:REST:NONUM
- record `item|dmg|Arm Cannon#5` Martial Ranged weapon, 2d8 Radiant, range 30/120, Blaster, Firearm and Recoil, Push mastery. -> info:NUMONLY:ROLL
- class `item|dmg|Arm Cannon#5` Martial Ranged weapon, 2d8 Radiant, range 30/120, Blaster, Firearm and Recoil, Push mastery. -> info:NUMONLY:ROLL
- record `item|dmg14|+1 Rod of the Pact Keeper#3` You can't use this property again until you finish a long rest. -> info:REST:NONUM
- class `item|dmg14|+1 Rod of the Pact Keeper#3` You can't use this property again until you finish a long rest. -> info:REST:NONUM
- record `sub|Death Knight/Oath of the Ebon Blade|Oath of the Ebon Blade Spells#18` 5 Ray of Enfeeblement. -> info:NUMONLY:TABLE
- class `sub|Death Knight/Oath of the Ebon Blade|Oath of the Ebon Blade Spells#18` 5 Ray of Enfeeblement. -> info:NUMONLY:TABLE
- record `item|dmg|Doomhammer#12` Cast Wind Walk from it once per dawn. -> covered
- class `item|dmg|Doomhammer#12` Cast Wind Walk from it once per dawn. -> info:REST:NONUM
- record `item|coa|Amulet of the Inferno#7` - 3 major beneficial properties -> info:ITEM:ARTIFACT_PROPS
- class `item|coa|Amulet of the Inferno#7` - 3 major beneficial properties -> info:ITEM:ARTIFACT_PROPS
- record `species|Air Genasi (2014)|Mingle with the Wind#1` You can cast Levitate once per Long Rest with no Material components. -> info:REST:NONUM
- class `species|Air Genasi (2014)|Mingle with the Wind#1` You can cast Levitate once per Long Rest with no Material components. -> info:REST:NONUM
- record `sub|Paladin/Oath of the Giving Grave|Improved Unholy Smite#3` When you hit with a melee weapon, the target takes an extra 1d8 Necrotic damage. -> info:ACTIVE:TRIGGER
- class `sub|Paladin/Oath of the Giving Grave|Improved Unholy Smite#3` When you hit with a melee weapon, the target takes an extra 1d8 Necrotic damage. -> info:ACTIVE:TRIGGER
- record `sub|Monster Hunter/Trapper Guild|Rapid Tinkerer#1` You can spend 1 minute to make a Trapper Gadget without spending GP or components. -> info:NUMONLY:GEOMETRY
