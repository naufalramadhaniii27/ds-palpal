# Laporan clause gate (mode laporan, 2026-11-09)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73237 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36781 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 7037 |
| Info (tag terdokumentasi) | 23624 (SPELL_TEXT 6470, FORM:ACTIVATE 2576, NUMONLY:GEOMETRY 2237, FORM:ROLL 1885, FXO_NULL 1384, NUMONLY:TEXT 1354, ACTIVATE 1309, NUMONLY:ROLL 1008, FORM:TABLE 916, NUMONLY:TABLE 871, ACTIVE:TRIGGER 806, ACTIVE:OTHERS 671, REST:NONUM 650, NUMONLY:FLAVOR 305, COND:PLAY_STATE 201, STD:ASI 195, NUMONLY:ZERO 162, OBJECT:STATS 106, BY_DESIGN 87, ITEM:SENSES 82, COND:ATTACK_ROLL_ADV 80, DC:REFERENCE 77, TABLE:CLASS 70, ACTIVE:REACTION 56, ACTIVE:TIMED_IMM 43, STD:SUBCLASS_PICK 16, STD:AC10 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6120 |
| Uncovered dengan angka | 3676 |
| Uncovered dengan kelas kata kunci mekanik | 5757 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 363 |
| Angka yang tidak dijelaskan record mana pun | 3465 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5194 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 327 |
| Waktu | muat data 6 s, analisis 8 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 169 ditangkap (56.7%). Hapus semua atom kelas yang dibutuhkan: 167 ditangkap (56.0%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 295 ditangkap (98.3%), semua atom kelas dihapus: 298 ditangkap (99.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 2833 |
| GX | 1567 |
| wxs | 660 |
| LU_X | 535 |
| species | 352 |
| ITEM_SPELLS | 343 |
| AUTO | 315 |
| SPELL_FX | 241 |
| feat | 179 |
| cls | 132 |
| SAVE_NOTES | 74 |
| FXO | 48 |
| SPELLS | 37 |
| FDMG | 15 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 208, fx-L4.js 166, fx-L12.js 142, fx-L2.js 130, fx-L3.js 129, fx-L10.js 121, fx-L1.js 113, fx-N1.js 95, fx-L9.js 94, fx-L11.js 86, fx-L6.js 86, fx-L8.js 64.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 1307 | 19.6% |
| SPELL | 2882 | 838 | 29.1% |
| DMG | 3912 | 771 | 19.7% |
| PROF | 883 | 562 | 63.6% |
| SPEED | 1137 | 506 | 44.5% |
| ADV | 1516 | 425 | 28.0% |
| RES | 1123 | 408 | 36.3% |
| CHOICE | 1344 | 401 | 29.8% |
| NUM | 7110 | 324 | 4.6% |
| IMM | 852 | 322 | 37.8% |
| SLOT | 1121 | 322 | 28.7% |
| DC | 2624 | 282 | 10.7% |
| ATK | 860 | 229 | 26.6% |
| DIS | 932 | 214 | 23.0% |
| AC | 593 | 167 | 28.2% |
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
| class | 1027 | 217 | 551 | 0 | 259 |
| feat | 2101 | 431 | 1037 | 0 | 633 |
| item | 18391 | 3890 | 11031 | 0 | 3470 |
| species | 1037 | 570 | 294 | 0 | 173 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1651 | 4241 | 0 | 1585 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2148 | 6095 | 1908 | 18.8% |
| tvss | 2815 | 616 | 1651 | 548 | 19.5% |
| core | 1502 | 313 | 785 | 404 | 26.9% |
| tsgs | 1483 | 362 | 837 | 284 | 19.2% |
| tsdm | 1222 | 286 | 671 | 265 | 21.7% |
| tkdm | 919 | 176 | 495 | 248 | 27.0% |
| tghp | 1117 | 349 | 557 | 211 | 18.9% |
| tce | 736 | 114 | 460 | 162 | 22.0% |
| au | 536 | 92 | 288 | 156 | 29.1% |
| egw | 566 | 129 | 297 | 140 | 24.7% |
| tee24 | 464 | 130 | 217 | 117 | 25.2% |
| phb14 | 516 | 130 | 269 | 117 | 22.7% |
| dmg14 | 540 | 144 | 286 | 110 | 20.4% |
| tdcsr | 416 | 121 | 191 | 104 | 25.0% |
| thhw | 395 | 76 | 234 | 85 | 21.5% |
| xge | 375 | 89 | 208 | 78 | 20.8% |
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
| tsgeh | 184 | 59 | 90 | 35 | 19.0% |
| bgg | 210 | 56 | 126 | 28 | 13.3% |
| psa | 67 | 18 | 25 | 24 | 35.8% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| bdd | 62 | 10 | 30 | 22 | 35.5% |
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
| psk | 38 | 19 | 9 | 10 | 26.3% |
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
| RESOURCE | 1043 | 924 |
| SPELL | 589 | 80 |
| DMG | 569 | 530 |
| PROF | 526 | 141 |
| SPEED | 441 | 336 |
| ADV | 418 | 135 |
| RES | 347 | 113 |
| NUM | 324 | 324 |
| SLOT | 305 | 94 |
| IMM | 218 | 64 |
| CHOICE | 218 | 67 |
| DIS | 179 | 64 |
| AC | 167 | 133 |
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


### RESOURCE (1043 uncovered)

- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `feat|Pyromaniac|Pyromaniac#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | no record for SPELL; number 2 unexplained
- `feat|Superior Shifting|Superior Shifting#7` You regain 1 expended use on a Short Rest and all expended uses on a Long Rest. | no record for RESOURCE; number 1 unexplained
- `feat|Tireless Reveler|Tireless Reveler#3` You can do this a number of times equal to your Proficiency Bonus, and regain all expended uses after a Short or Long Rest. | number pb no record explains
- `item|ai|Obviator's Lenses#1` Also at rank 2, you gain the use of an uncommon magic item taking the form of a pair of spectacles, a spyglass, a monocle, or any other device with one or two lenses. | no record for RESOURCE; number 2 unexplained
- `item|ai|Orrery of the Wanderer#36` While all six components of the Orrery of the Wanderer are installed, the artifact has 7 charges. | no record for RESOURCE; number 7,6 unexplained
- `item|au|Wand of Slumber#6` If you expend the wand's last charge, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|bmt|Spindle of Fate#8` Additionally, once per turn when you deal damage to the doomed creature, you can roll 1d6 and add the number rolled to the damage roll. | no record for DMG,RESOURCE; number 1d6 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#20` - Its number of charges increases to 5. | no record for RESOURCE; number 5 unexplained
- `item|dmg|+3 Bloodwell Vial#5` In addition, when you roll any Hit Dice to recover hit points while you are carrying the vial, you can regain 5 sorcery points. | number 5 no record explains
- `item|dmg|+3 Fate Dealer's Deck#4` One creature you can see within 30 feet of you either takes radiant damage or regains hit points (your choice) equal to the total. | number 30 no record explains
- `item|dmg|Cabal's Ruin (Awakened)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG,RESOURCE; number 1d6 unexplained
- `item|dmg|Diamond Staff#2` This staff has 20 charges and can be wielded as a magic Quarterstaff that grants a +3 bonus to attack rolls and damage rolls made with it. | number 20 no record explains
- `item|dmg|Dust of Sneezing and Choking#3` The container holds enough for one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Enspelled Staff#4` Each day at dawn, it regains 1d6 of its expended charges. | number 1d6 no record explains
- `item|dmg|Fate Cutter Shears#8` Until the target finishes a long rest, attack rolls against it score a critical hit on a roll of 19 or 20 on the d20. | number 1d20,20 no record explains
- `item|dmg|Gulthias Staff#8` On a hit, it deals damage as a normal quarterstaff, and you can expend 1 charge to regain a number of hit points equal to the damage dealt by the weapon. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Making Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|dmg|Making Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | number 7 no record explains
- `item|dmg|Scribing Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | number 7 no record explains
- `item|dmg|Staff of Defense#8` If you expend the staff's last charge, roll a d20. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Wrought-Iron Tower#15` When you make an attack, you may spend 1 or more charges. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Zafu of the Wandering Mind#5` Within 100 ft of a pillow, use a Bonus Action and command word to send them into a pocket dimension, and repeat to return them to an open space within 5 ft. The set has 3 charges and regains 1d3 at dawn. | number 100,5 no record explains
- `item|misc14|Wand of Winter#3` The wand has 7 charges, which are used to fuel the spells within it. | no record for RESOURCE; number 7 unexplained
- `item|tce|+3 Bloodwell Vial#5` In addition, when you roll any Hit Dice to recover hit points while you are carrying the vial, you can regain 5 sorcery points. | number 5 no record explains
- `item|tee24|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | no record for RESOURCE; number 1 unexplained
- `item|tee24|Handling Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | number 7 no record explains
- `item|tee24|Healing Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|tee24|Passage Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | number 7 no record explains
- `item|thhw|Ring of the Sky Hunter#4` While you wear it, you can use an action and spend any number of charges to attack one creature you can see within 60 ft. A pair of spectral talons dives from the sky and makes an attack roll with a +7 bonus. | no record for ATK,RESOURCE; number 60,7 unexplained
- `item|tsgs|Fire Dervish Cloak#4` On a failure they take 1d8 Fire per charge spent and cannot make Opportunity Attacks against you this turn. | no record for RESOURCE; number 1d8 unexplained
- `item|tsgs|Spire Seed#9` The tree regains 1d6 HP at dawn, and lost parts regrow in 7 days. | no record for RESOURCE; number 1d6,7 unexplained
- `item|tsgs|Staff of the Magpie#5` If you spend the last charge, roll 1d20. | number 1d20 no record explains
- `item|tsgs|Timber#5` You can also push a target up to one size larger than you 10 ft. Charges last up to 1 minute and are lost if you miss, attack a different target, or attack with another weapon. | no record for RESOURCE; number 10,1 unexplained
- `item|wdh|Charred Wand of Magic Missiles#1` This wand has 7 charges. | no record for RESOURCE; number 7 unexplained
- `species|Lorwyn Elf|Trance#2` A Long Rest takes 4 hours of meditation, during which you stay conscious. | no record for RESOURCE; number 4 unexplained
- `species|Reborn (VRGR)|Deathless Nature#4` You can finish a Long Rest in 4 hours if you spend them motionless and inactive but conscious. | no record for RESOURCE; number 4 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Sorcerer/Elemental Essence|Infuse Elements#2` When you damage a creature with a spell, spend 1 Sorcery Point to add an effect by heritage. | number 1 no record explains

### SPELL (589 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Initiate of High Sorcery|Initiate of High Sorcery#5` You learn one Wizard cantrip and two 1st-level spells, chosen from your moon's list. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `item|ai|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Helm of Telepathy#3` After you cast one of these two spells from the helm, that same spell can't be cast from the helm again until the next dawn. | number 2 no record explains
- `item|dmg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tce|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tsdm|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
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

### DMG (569 uncovered)

- `feat|Arcane Charger|Arcane Charger#4` If you moved at least 10 feet in a straight line and the cantrip hits, you can either add +5 to its damage roll or push the target 10 feet away from you. | no record for DMG,SPELL; number 10,5 unexplained
- `item|dmg|Agony (Exalted)#4` +2 to attack and damage rolls. | number 2 no record explains
- `item|dmg|Bag of Beans#12` A failure means it takes 5d6 Poison damage and gains the Poisoned condition, which lasts 1 hour. | no record for DMG; number 5d6,1 unexplained
- `item|dmg|Blade of Broken Mirrors (Exalted)#36` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | no record for DMG; number 2 unexplained
- `item|dmg|Concussion Grenade#9` The Thunder damage rises by 1d6 and the radius by 5 ft for each grenade, up to 10d6 and a 30-ft-radius Sphere. | no record for DMG; number 1d6,10d6,5,30 unexplained
- `item|dmg|Condemner (Exalted)#6` Hits deal an extra 1d4 poison damage. | number 1d4 no record explains
- `item|dmg|Fenthras (Exalted)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|dmg|Forgemaster's Might#10` It deals an extra 2d8 Bludgeoning damage to Constructs and structures. | no record for DMG; number 2d8 unexplained
- `item|dmg|Snicker-Snack#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `item|dmg|Sunsword#14` When you hit an undead with it, that target takes an extra 1d8 radiant damage. | number 1d8 no record explains
- `item|dmg|The Bloody End (Exalted)#32` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Will of the Talon (Exalted)#43` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Lash of Shadows (Exalted)#29` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Ruin's Wake (Awakened)#12` - You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals an extra 1d8 piercing damage to any target it hits. | number 1d8,1 no record explains
- `item|egw|Silken Spite (Awakened)#15` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|misc14|Hazirawn#2` Even if you aren't attuned to the sword, you gain a +1 bonus to attack and damage rolls made with this weapon. | number 1 no record explains
- `item|misc14|Hazirawn#5` While you are attuned to this weapon, its bonus on attack and damage rolls increases to +2, and a hit deals an extra 2d6 necrotic damage (instead of 1d6). | number 2d6,1d6 no record explains
- `item|oota|Dawnbringer#6` When you hit an undead with it, that target takes an extra 1d8 radiant damage. | no record for DMG; number 1d8 unexplained
- `item|pabtso|Flayer Slayer#3` An Aberration hit with this greataxe takes an extra 1d12 slashing damage. | no record for DMG; number 1d12 unexplained
- `item|pabtso|Lightbringer#5` While glowing, the mace deals an extra 1d6 radiant damage to Undead creatures. | no record for DMG; number 1d6 unexplained
- `item|rhw|Ebonbane#13` When you hit a Celestial or a Humanoid with it, that attack also deals 3d6 Necrotic damage. | number 3d6 no record explains
- `item|tsgs|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|tsgs|Forgemaster's Might#10` It deals an extra 2d8 Bludgeoning damage to Constructs and structures. | no record for DMG; number 2d8 unexplained
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | number 10 no record explains
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Artificer/Magneticist|Metal Slinger#10` When you hit a creature, you can deal an extra 1d6 damage of the weapon's type and move a Medium or smaller target 10 ft directly toward or away from you. | no record for DMG; number 1d6,10 unexplained
- `sub|Barbarian/Path of the Drifter|Relentless Aggression#1` Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft. | no record for DMG; number 1d10,5 unexplained
- `sub|Cleric/Mountain Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Prophecy Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Martyr/Burden of Tyranny|Totalitarian Control#7` When the spell ends, you can deal 6d8 Psychic damage to the target. | no record for DMG; number 6d8 unexplained
- `sub|Paladin/Oath of the Annihilator|Channel Divinity#4` A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. | no record for DMG; number 1 unexplained
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
- `item|llk|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsdm|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | no record for PROF; number 2 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | number pb no record explains
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Cleric/Knowledge Domain (PSA)|Blessings of Knowledge#2` You gain proficiency in two of these skills: Arcana, History, Nature, or Religion. | number 2 no record explains
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#8` The familiar gains proficiency in any two skills or tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains

### SPEED (441 uncovered)

- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | no record for SPEED; number 0 unexplained
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#17` It has AC 18, Hit Points equal to 10 times your character level and Speed 0. | no record for SPEED; number 18,10,0 unexplained
- `feat|Shock Trooper|Shock Trooper#5` In the first round of each combat, your Speed is doubled. | no record for SPEED; number double unexplained
- `item|dmg|Boots of Striding and Springing#1` Wearing these boots raises your Speed to 30 feet if it was lower than that. | no record for SPEED; number 30 unexplained
- `item|dmg|Broom of Flying#4` It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Burrowing Adaptation#1` Graft (donor: a creature with a Burrow Speed of 10+ ft). | no record for SPEED; number 10 unexplained
- `item|dmg|Carpet of Flying, 4 ft. × 6 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Doublet of Dramatic Demise#3` You are incapacitated and your speed is 0, but you can speak and communicate. | no record for SPEED; number 0 unexplained
- `item|dmg|Figurine of Wondrous Power (ebony fly)#18` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Paper Bird#5` If the bird's hit points or speed is reduced to 0 or if it is otherwise immobilized, it turns into ash. | no record for SPEED; number 0 unexplained
- `item|dmg|Potion of Climbing#1` Drinking this potion gives you a Climb Speed equal to your Speed for 1 hour. | no record for SPEED; number 1 unexplained
- `item|dmg|Potion of Flying#1` Drinking this potion gives you a Fly Speed equal to your Speed for 1 hour, and you can hover. | no record for SPEED; number 1 unexplained
- `item|dmg|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | no record for SPEED; number 60 unexplained
- `item|dmg|Tectonic Gauntlets#12` You gain a 30 ft Burrow Speed through nonmagical, unworked earth and stone without disturbing it. | no record for SPEED; number 30 unexplained
- `item|idrotf|Ythryn Mythallar#14` - While you're on the same plane of existence as the Ythryn mythallar, you can use an action to cause it to fly in any direction you choose at a speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it mu | no record for DC,DMG,SPEED; number 3d8,90,5,15 unexplained
- `item|tee24|Thuranni Cloak#3` The effect pauses until your next turn starts when you take damage, and while your Speed is 0. | no record for SPEED; number 0 unexplained
- `item|tsgs|Couatl Herald's Fang#4` On a failure it is Incapacitated with Speed 0 until it takes damage or another creature uses an action to shake it out of the stupor. | no record for SPEED; number 0 unexplained
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `species|Accursed|Heritage Traits#4` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Amoeboid|Biomimicry#3` If the target has a Burrow, Climb or Swim Speed, you gain that Speed, up to 40 feet. | no record for SPEED; number 40 unexplained
- `species|Child of Seth|Flight#1` You have a Fly Speed of 30 ft. It drops to 20 ft while you wear Medium or Heavy armor. | number 20 no record explains
- `species|Disembodied|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#1` You have a merfolk form (Speed 10 ft, Swim Speed 40 ft) and a landwalker form, where your tail splits into legs. | number 40 no record explains
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Captain/Gourmand|Monster Meal#14` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained
- `sub|Captain/Siegeball Jersey|Game-Winning Play#2` You immediately move up to twice your Speed without provoking Opportunity Attacks and take an action and a Bonus Action. | no record for SPEED; number double unexplained
- `sub|Cleric/Speed Domain|Quickness of the Gods#1` Your Speed rises by another 5 ft. As a reaction or bonus action, you can raise your Dexterity score by 10 until the end of the current turn. | no record for ABIL; number 10 unexplained
- `sub|Investigator/Medium|Trinkets#8` You have a Fly Speed of 10 feet and can move through occupied spaces as Difficult Terrain. | no record for SPEED; number 10 unexplained
- `sub|Paladin/Oath of Vengeance|Relentless Avenger#2` When your Opportunity Attack hits a creature, you can reduce that creature's Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Ranger/Bounty Hunter|Takedown Tactics#7` Its Speed is 0 until the start of your next turn. | no record for SPEED; number 0 unexplained
- `sub|Warlock/The Genie|Elemental Gift#2` As a Bonus Action you gain a Fly Speed of 30 feet with hover for 10 minutes. | no record for SPEED; number 30,10 unexplained
- `sub|Warlock/The Undead|Spirit Projection#8` You have a Fly Speed equal to your Speed and can hover, and you move through creatures and objects as difficult terrain, taking 1d10 Force damage if you end a turn inside one. | no record for DMG,SPEED; number 1d10 unexplained
- `sub|Wizard/Fumaturge|Smoke Animals#3` The smoke familiar has 1 HP and a Fly Speed of 60 ft whatever the Beast form. | no record for SPEED; number 60,1 unexplained
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | no record for SPEED; number 0 unexplained

### ADV (418 uncovered)

- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | no record for ADV,DIS; number 1 unexplained
- `item|au|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|bmt|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,RESOURCE,SPEED; number 30,1 unexplained
- `item|crcotn|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Candle of Invocation#5` While you are inside that light, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Medal of Wit#2` Doing so gives you advantage on Intelligence checks and Intelligence saving throws for 1 hour. | no record for ADV
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|dmg|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,RESOURCE,SPEED; number 30,1 unexplained
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|egw|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tee24|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|tghg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|tghg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Forgemaster's Might#8` You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil. | no record for ADV; number 5 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|tsgs|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
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
- `item|dmg|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
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

### IMM (218 uncovered)

- `item|coa|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | no record for IMM,RESOURCE; number 24,3 unexplained
- `item|dmg|Clay No-Face's Charm#3` The doll is a Tiny Construct with 1 Hit Point, Speed 10 feet, and immunity to Poison damage and the Poisoned condition. | no record for IMM,SPEED; number 10,1 unexplained
- `item|dmg|Coldsnap#3` When you hit a creature without Cold Immunity, spend 1 charge to force a DC 15 Constitution save. | no record for DC,IMM,RESOURCE; number 1,15 unexplained
- `item|dmg|Final Messenger#2` A Tiny Construct homunculus with AC 20, 6 Hit Points and a Fly Speed of 60 ft. It is immune to Poison and Psychic damage and to all conditions except Unconscious, treats ability scores as 10, has Darkvision 60 ft, and ca | no record for IMM,SENSE,SPEED; number 60,20,6,10 unexplained
- `item|dmg|Ghaal'duur, the Mighty Dirge#2` It has 2 minor beneficial and 1 minor detrimental random artifact properties (a goblinoid is immune to the detrimental one). | no record for IMM; number 2,1 unexplained
- `item|dmg|Hearthfire Breastplate (Master)#10` When a creature you see within 30 ft takes damage, use a Reaction to give it Immunity to all damage until the start of your next turn, once per Long Rest. | no record for IMM; number 30 unexplained
- `item|dmg|Helm of Heroes#3` While it glimmers, you gain Temporary Hit Points equal to half your level (rounded down) at the start of each of your turns, and you and allies within 10 ft are Immune to Frightened. | no record for IMM; number 10,half unexplained
- `item|dmg|Liquid Courage#3` You gain Heroic Inspiration and Immunity to the Frightened condition for 10 minutes. | no record for IMM; number 10 unexplained
- `item|dmg|Oathbound Ring#10` The ring is immune to Psychic, Poison, Bludgeoning, Piercing, and Slashing damage, and has AC 20, a damage threshold of 30, and 50 hit points. | number 20,30,50 no record explains
- `item|dmg|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|dmg|Strawbundle's Charm#3` The doll is a Tiny construct with 1 hit point, immune to poison and the poisoned condition. | no record for IMM; number 1 unexplained
- `item|dmg|Winter's Embrace#3` You can cast the level 6 Ice Storm (save DC 16) from it, centered on a point within 5 ft of you, and you are immune to its effects. | no record for DC,IMM; number 5,16 unexplained
- `item|dmg|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | no record for IMM,RESOURCE; number 24,3 unexplained
- `item|frafi|Orb of Damara#17` A creature that succeeds on this save is immune to the aura's effects for 24 hours. | number 24 no record explains
- `item|tee24|Final Messenger#2` A Tiny Construct homunculus with AC 20, 6 Hit Points and a Fly Speed of 60 ft. It is immune to Poison and Psychic damage and to all conditions except Unconscious, treats ability scores as 10, has Darkvision 60 ft, and ca | no record for IMM,SENSE,SPEED; number 60,20,6,10 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#2` It has 2 minor beneficial and 1 minor detrimental random artifact properties (a goblinoid is immune to the detrimental one). | no record for IMM; number 2,1 unexplained
- `item|tghg|Bliss#2` A Humanoid who swallows it feels calm and happy for 1d4 hours, gaining Immunity to the Frightened condition and 3d10 Temporary Hit Points. | no record for IMM; number 1d4,3d10 unexplained
- `item|tghg|Hearthfire Breastplate (Master)#10` When a creature you see within 30 ft takes damage, use a Reaction to give it Immunity to all damage until the start of your next turn, once per Long Rest. | no record for IMM; number 30 unexplained
- `item|toa|Joho's Charm#3` Joho is a Tiny construct with 1 hit point, speed 10 feet, and immunity to poison and the poisoned condition. | no record for IMM,SPEED; number 10,1 unexplained
- `item|toa|Ring of Winter#27` - You can cast one of the following spells from the ring (spell save DC 17) by expending the necessary number of charges: Bigby's hand (2 charges; the hand is made of ice, is immune to cold damage, and deals bludgeoning  | no record for DC,IMM,RESOURCE; number 17 unexplained
- `item|toa|Strawbundle's Charm#3` The doll is a Tiny construct with 1 hit point, immune to poison and the poisoned condition. | no record for IMM; number 1 unexplained
- `item|tsgs|Coldsnap#3` When you hit a creature without Cold Immunity, spend 1 charge to force a DC 15 Constitution save. | no record for DC,IMM,RESOURCE; number 1,15 unexplained
- `item|tsgs|Ferryman's Take#6` A conscious one enters a death-like state for 1 hour, with Immunity to Psychic damage (once per 24 hours). | no record for IMM,RESOURCE; number 1,24 unexplained
- `item|tsgs|Helm of Heroes#3` While it glimmers, you gain Temporary Hit Points equal to half your level (rounded down) at the start of each of your turns, and you and allies within 10 ft are Immune to Frightened. | no record for IMM; number 10,half unexplained
- `item|tsgs|Nightstalker's Kanabo#3` On a natural 20, the target makes a DC 16 Constitution save or is Unconscious until the end of your next turn (damage or a shake ends it, and creatures that do not sleep or are immune to Exhaustion pass). | no record for DC,IMM; number 20,16 unexplained
- `item|tsgs|Plaguebane Mask#5` Each creature makes a DC 15 Constitution save, taking 2d8 Poison and having its Speed halved until the end of its next turn on a fail (not if immune to Poisoned), or half damage only on a pass. | no record for DC,IMM,SPEED; number 2d8,15,half unexplained
- `item|tsgs|Winter's Embrace#3` You can cast the level 6 Ice Storm (save DC 16) from it, centered on a point within 5 ft of you, and you are immune to its effects. | no record for DC,IMM; number 5,16 unexplained
- `item|wbtw|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | no record for IMM; number 1 unexplained
- `species|Dragonborn (Chromatic)|Chromatic Warding#1` From level 5, Action, once per Long Rest: for 1 minute you are immune to the damage type of your ancestry. | no record for IMM
- `sub|Cleric/Eldritch Domain|Sing the Song that Ends the World#2` It is then immune to this damage for 10 minutes. | no record for IMM; number 10 unexplained
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | no record for IMM; number 3 unexplained
- `sub|Druid/Circle of the Blighted|Foul Conjuration#1` Beasts, fey and plants you summon or create (including saplings) are immune to Necrotic, Poison and the Poisoned condition, and burst when they drop to 0 HP: creatures within 5 ft make a Constitution save or take Necroti | no record for DMG,IMM; number 1d4,1d6,5,0 unexplained
- `sub|Investigator/Decommissioner|Reprogrammer#6` Sleep Mode: it is Unconscious for 1 minute even if normally immune, ending early if it takes damage. | no record for IMM; number 1 unexplained
- `sub|Martyr/Burden of Rebirth|Surefooted#2` You and allies within 30 feet are immune to the spells Entangle, Spike Growth, and Plant Growth. | no record for IMM; number 30 unexplained
- `sub|Necromancer/Cyberghoul|Cyber Lich (Lichdom)#9` A Construct that passes the save is immune for 24 hours. | no record for IMM; number 24 unexplained
- `sub|Paladin/Oath of the Giving Grave|Overawe Enemy#2` Pick a creature you see within 60 ft. It makes a Wisdom save, unless it is immune to being Stunned. | no record for IMM; number 60 unexplained
- `sub|Sorcerer/Storm Sorcery|Wind Soul#1` You have Immunity to Lightning and Thunder damage and a magical Fly Speed of 60 feet. | no record for IMM
- `sub|Warlock/The Undying|Among the Dead#6` An undead is also immune for 24 hours if you target it with an attack or harmful spell. | no record for IMM; number 24 unexplained
- `sub|Warlock/The Undying|Undying Nature#2` For every 10 years that pass you age only 1 year, and you are immune to magical aging. | no record for IMM; number 1 unexplained
- `sub|Wizard/Fumaturge|Fogcrafting#2` When you cast Cloudkill, Fog Cloud, Incendiary Cloud or Stinking Cloud you can: make the area Difficult Terrain for creatures you choose, make the cloud not Heavily Obscured for you, remove any number of 5-ft Cubes from  | no record for IMM; number 5 unexplained

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (115)

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
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | angka: 2
- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Jaeger|Hunter's Pursuit#1` At the start of your turn, you can spend 1 Adrenaline Point to move up to half your Speed without using any of your movement and without provoking Opportunity Attacks. | angka: 1,half
- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | angka: 2

### feat (225)

- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | angka: 2
- `feat|Shadowsteel Ghoul Transformation: Stage 4|Shadowsteel Ghoul Transformation: Stage 4#5` The first time you are Bloodied or drop to 0 Hit Points after finishing a Short Rest or Long Rest, the Shadowsteel in your flesh lashes out. | angka: 0
- `feat|Primordial Transformation: Stage 3|Primordial Transformation: Stage 3#9` You gain Vulnerability to that instance of damage, even if you had Resistance or Immunity, and creatures within 5 feet of you take the same amount of damage as you took. | angka: 5
- `feat|Echoing Soul|Echoing Soul#8` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Medium Armor Master|Medium Armor Master#4` If your Dexterity score is 16 or higher, you can add 3 instead of 2 to your Armor Class while you wear Medium armor. | angka: 3,2
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#3` The extra damage becomes 2d4 at character level 9 and 4d4 at character level 16. | angka: 2d4,1d4
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | angka: pb
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | angka: 2
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#10` On a hit it deals 1d10 Force damage, and the target must succeed on a Strength saving throw (DC 8 + your Proficiency Bonus + that ability modifier) or be knocked Prone. | angka: 1d10,8,pb
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#2` On your first turn after an Initiative roll, add 1d4 to the first damage roll you make. | angka: 1d4
- `feat|Vampire Transformation: Stage 3|Vampire Transformation: Stage 3#5` If you start your turn in sunlight you take 1d10 Radiant damage, and nothing can give you Resistance or Immunity to it. | angka: 1d10
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#17` It has AC 18, Hit Points equal to 10 times your character level and Speed 0. | angka: 18,10,0
- `feat|Shadowsteel Adept|Shadowsteel Adept#7` If your Shadowsteel Focus is also a weapon, it has a +1 bonus to attack rolls and damage rolls. | angka: 1
- `feat|Street Justice|Street Justice#6` When you bind a creature with Chain, Manacles, or Rope, add your Proficiency Bonus to the DC for the creature to escape or burst the restraint. | angka: pb
- `feat|Mechanic|Mechanic#4` When you use it through this feat, the extra damage equals twice your Proficiency Bonus and the weapon stays Overheated until you finish a Short Rest or Long Rest. | angka: double,pb
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#6` You gain Darkvision with a range of 60 feet. | angka: 60
- `feat|Survivor (Grim Hollow)|Survivor (Grim Hollow)#2` You need only half the food per day that your size normally requires. | angka: half
- `feat|Watchers|Watchers#11` On a failure, you have Disadvantage on D20 Tests for 1 minute. | angka: 1d20
- `feat|Charger|Charger#6` When a melee attack roll you make during the Attack action hits a target immediately after you move at least 10 feet straight toward it, pick one effect: the attack's damage roll gets a 1d8 bonus, or  | angka: 1d8
- `feat|Unarmed Fighting|Unarmed Fighting#3` When each of your turns begins, you can choose one creature you have Grappled and deal 1d4 Bludgeoning damage to it. | angka: 1d4
- `feat|Marksman|Marksman#6` A hostile creature within 5 feet does not give you Disadvantage on ranged attack rolls, and neither does a Prone creature within 30 feet. | angka: 5,30
- `feat|Sentinel (2014)|Sentinel (2014)#2` When you hit a creature with an opportunity attack, its Speed becomes 0 for the rest of the turn. | angka: 0
- `feat|Crusher|Crusher#4` Once per turn, when an attack of yours hits a creature and deals Bludgeoning damage, you can move that creature 5 feet into an unoccupied space, as long as its size is at most one size above yours. | angka: 5
- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | angka: 1
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#26` If the vessel drops to 0 Hit Points, you must make a new one, which takes a Long Rest. | angka: 0
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Fairy Trickster|Fairy Trickster#9` You can use this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | angka: pb
- `feat|Void Channeler|Void Channeler#3` One creature of your choice within 10 feet that can hear you must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or be frightened of you for 1 minute. | angka: 10,1,8,pb
- `feat|Watchers|Watchers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb

### item (2344)

- `item|dmg|Deck of Many Things#84` Initiative +3 (13). | angka: 3,13
- `item|dmg|Staff of Healing#5` When its final charge is used, roll 1d20. | angka: 1d20
- `item|crcotn|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | angka: 2
- `item|egw|Ruin's Wake (Exalted)#12` - You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals an extra 1d8 piercing damage to any target it hits. | angka: 1d8,1
- `item|dmg|Dawnbringer#6` When you hit an undead with it, that target takes an extra 1d8 radiant damage. | angka: 1d8
- `item|dmg|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | angka: 20,30
- `item|egw|Lash of Shadows (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | angka: 1
- `item|dmg|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damag | angka: 1
- `item|dmg|Gloves of Soul Catching#3` After making a successful unarmed strike while wearing these gloves, you can use the gloves to deal an extra 2d10 force damage to the target, and you regain a number of hit points equal to the force d | angka: 2d10
- `item|dmg|Wind Fan#2` Every further use of the fan before the next dawn carries a cumulative 20 percent chance that it fails to work. | angka: 20
- `item|ai|Orrery of the Wanderer#12` - 2 minor beneficial properties | angka: 2
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | angka: 1
- `item|dmg|Eye of Starsight#10` The orb has truesight to 30 ft, is blind beyond that, and sees in all directions at once. | angka: 30
- `item|tsgs|Forgemaster's Might#10` It deals an extra 2d8 Bludgeoning damage to Constructs and structures. | angka: 2d8
- `item|dmg|Deck of Dimensions#3` While holding it, you can expend 1 or more of its charges to use the following properties: | angka: 1
- `item|dmg|Will of the Talon (Exalted)#43` - The weapon's bonus to attack and damage rolls increases to +2. | angka: 2
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | angka: 2
- `item|tee24|Handling Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | angka: 7
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | angka: 144,1,3,half
- `item|dmg|Traveling Snacks#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | angka: 7
- `item|tdcsr|Armor of the Valiant Soul (Exalted)#9` The AC bonus becomes +2. | angka: 2
- `item|tdcsr|Mythcarver (Awakened)#4` +1 to attack and damage rolls. | angka: 1
- `item|au|Diamond Staff#17` Knock (Charge Cost 2). | angka: 2
- `item|dmg|Handling Dragonmark Reservoir#2` A dragonshard amulet or bracelet with 7 charges. | angka: 7
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | angka: 5,7,40
- `item|tee24|Hospitality Channeling Wand#2` The wand has 7 charges. | angka: 7
- `item|dmg|Horn of Blasting#6` Glass or crystal objects in the Cone take 10d8 Thunder damage if no one is wearing or carrying them. | angka: 10d8
- `item|dmg|Gamma Pendant#8` With 3 or more Gamma Fragments unified with it, it gains the benefits of all of them, 20 charges, and regains 1d10 + 10 at dawn. | angka: 1d10,3,20,10
- `item|dmg|Dust of Deliciousness#2` The dust also dulls the eater's senses: anyone eating food treated with this dust has disadvantage on Wisdom ability checks and Wisdom saving throws for 1 hour. | angka: 1
- `item|dmg|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | angka: 2,22

### species (95)

- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | angka: 3
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | angka: 1d6
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | angka: 1d6
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
- `species|Elf (Fey)|Trance#2` You finish a Long Rest in 4 hours of meditation, staying semiconscious. | angka: 4
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb

### sub (686)

- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | angka: 60
- `sub|Sorcerer/Frost Sorcery|Frozen Body#2` Your Hit Point maximum rises by 3, and by 1 more for every Sorcerer level you gain after this. | angka: 3
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | angka: 1
- `sub|Witch/Gingerbread Magic|Gingerbread Familiar#8` It adds only your Witch level, not twice, to its Hit Points maximum. | angka: double
- `sub|Paladin/Oath of Devotion (2014)|Channel Divinity: Sacred Weapon#2` For 1 minute you add your Charisma modifier (minimum +1) to attack rolls with it. | angka: 1
- `sub|Sorcerer/Draconic Sorcery|Draconic Resilience#2` Your Hit Point maximum goes up by 3, and it goes up by 1 more each time you gain another Sorcerer level. | angka: 3,1
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | angka: 1d6,6
- `sub|Barbarian/Path of Heavy Metal|Rocker#1` You gain proficiency with three Musical Instruments. | angka: 3
- `sub|Monk/Warrior of the Celestial|Stabilizing Focus#2` It regains 5 Hit Points per point spent, up to half its Hit Point maximum. | angka: 5,half
- `sub|Barbarian/Path of the Beast|Call the Hunt#3` Until the Rage ends, each chosen creature can, once per turn when it hits a target and deals damage, roll 1d6 and add it to the damage. | angka: 1d6
- `sub|Necromancer/Reanimator|Spell-Stitching#12` The thrall's Hit Point maximum and current Hit Points increase by twice your Necromancer level. | angka: double
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | angka: 2
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | angka: 2
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Druid/Circle of the Moon|Circle Forms#5` Until you leave the form, your Armor Class is 13 + your Wisdom modifier whenever that total beats the Beast's Armor Class. | angka: 13
- `sub|Sorcerer/Shadow Bloodline|Taint of Shadow#2` You gain Darkvision out to 60 ft, and within that range you see through magical darkness as if it were dim light. | angka: 60
- `sub|Captain/Star Wolf|Squadron Leader#2` They stay in it while within 10,000 ft. Barrel Roll: each gains +2 AC. | angka: 10000,2
- `sub|Captain/Gourmand|Monster Meal#12` +2 bonus to AC. | angka: 2
- `sub|Sorcerer/Frost Sorcery|Cold-Hearted#4` If this brings its Speed to 0, it takes 2d6 Cold damage. | angka: 2d6,0
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | angka: double,pb
- `sub|Warlock/Star Patron|Nova#1` Once per turn when you hit with a ranged attack roll, you can take 5 Radiant damage to deal an extra 1d8 Radiant damage to the target. | angka: 1d8,5
- `sub|Gadgeteer/Drone Jockey|Drone Commander#10` If you lose a drone, you can build a free replacement and link it to the controller over 1 hour, during a Short Rest or Long Rest. | angka: 1
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | angka: 5,6
- `sub|Rogue/Sanguine Thief|Bloody Blades#1` After a Long Rest, spend up to 2 Hit Point Dice or Sangromancy Dice to create that many Daggers. | angka: 2
- `sub|Cleric/Twilight Domain|Eyes of Night#1` You have Darkvision with a range of 300 feet. | angka: 300
- `sub|Vagabond/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | angka: 1d6
- `sub|Cleric/Justice Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Radiant damage. | angka: 1d8
- `sub|Sorcerer/Draconic Bloodline|Draconic Resilience#1` Your Hit Point maximum increases by 1 and again by 1 whenever you gain a Sorcerer level. | angka: 1
- `sub|Bard/College of Glamour (2014)|Mantle of Inspiration#2` Each gains 5 Temporary Hit Points and can use its Reaction to move up to its Speed without provoking Opportunity Attacks. | angka: 5
- `sub|Rogue/Sanguine Thief|Spellcasting#2` You know three cantrips from the Wizard list and the Sangromancy school. | angka: 3

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|mot|Iroas's Devotee#2` You can cast compelled duel a number of times equal to your Charisma modifier (minimum once) and regain all uses after a -> info:REST:NONUM
- class `item|mot|Iroas's Devotee#2` You can cast compelled duel a number of times equal to your Charisma modifier (minimum once) and regain all uses after a -> info:REST:NONUM
- record `item|dmg|Lazarus Unit#5` After it works, it cannot work again until you finish a Long Rest. -> info:REST:NONUM
- class `item|dmg|Lazarus Unit#5` After it works, it cannot work again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Captain/Tower Banner|Armored Redirection#4` After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no  -> covered
- class `sub|Captain/Tower Banner|Armored Redirection#4` After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no  -> info:REST:NONUM
- record `sub|Rogue/Soulknife (2014)|Psionic Power#3` You regain all expended dice after a Long Rest. -> covered
- class `sub|Rogue/Soulknife (2014)|Psionic Power#3` You regain all expended dice after a Long Rest. -> info:REST:NONUM
- record `item|dmg|Belt of Giant Strength (storm)#1` While you wear this belt, your Strength score changes to 29, the score granted by a belt tied to storm giants. -> info:NUMONLY:TABLE
- class `item|dmg|Belt of Giant Strength (storm)#1` While you wear this belt, your Strength score changes to 29, the score granted by a belt tied to storm giants. -> info:NUMONLY:TABLE
- record `sub|Captain/Siegeball Jersey|Game-Winning Play#5` After you use this, you cannot use it again until you finish a Long Rest. -> covered
- class `sub|Captain/Siegeball Jersey|Game-Winning Play#5` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `item|tce|Duplicitous Manuscript#8` You can use the charges in the following ways while holding it: -> info:REST:NONUM
- class `item|tce|Duplicitous Manuscript#8` You can use the charges in the following ways while holding it: -> info:REST:NONUM
- record `item|tghg|Blessed Reliquary#3` Once, when you use Turn Undead, you can give the targets Disadvantage on their saves, and you regain that use after a Lo -> info:ACTIVE:TRIGGER
- class `item|tghg|Blessed Reliquary#3` Once, when you use Turn Undead, you can give the targets Disadvantage on their saves, and you regain that use after a Lo -> info:ACTIVE:TRIGGER
- record `feat|Light Bringer|Light Bringer#12` You can do this once and regain the use after a Short or Long Rest. -> info:REST:NONUM
- class `feat|Light Bringer|Light Bringer#12` You can do this once and regain the use after a Short or Long Rest. -> info:REST:NONUM
- record `sub|Witch/Fragrant Magic|Fragrant Spells#2` 3 Calm Emotions, Color Spray, Enhance Ability, Fog Cloud, Prestidigitation. -> covered
- class `sub|Witch/Fragrant Magic|Fragrant Spells#2` 3 Calm Emotions, Color Spray, Enhance Ability, Fog Cloud, Prestidigitation. -> covered
- record `item|tsgs|Ring of Eldritch Ire#1` A warped ring with three swiveling gems. -> info:NUMONLY:TABLE
- class `item|tsgs|Ring of Eldritch Ire#1` A warped ring with three swiveling gems. -> info:NUMONLY:TABLE
- record `sub|Ranger/Vermin Lord|Vermin Lord Spells#5` 17 Contagion. -> info:NUMONLY:TABLE
- class `sub|Ranger/Vermin Lord|Vermin Lord Spells#5` 17 Contagion. -> info:NUMONLY:TABLE
- record `sub|Warden/Witchbane Hunter|Arcane Rebuke#4` After you use this, you cannot use it again until you finish a Short or Long Rest. -> covered
- class `sub|Warden/Witchbane Hunter|Arcane Rebuke#4` After you use this, you cannot use it again until you finish a Short or Long Rest. -> info:REST:NONUM
- record `species|Dhakaani Ghaal'dar (Hobgoblin)|Strength in Unity#2` After you use this, finish a Short or Long Rest to do so again. -> info:REST:NONUM
- class `species|Dhakaani Ghaal'dar (Hobgoblin)|Strength in Unity#2` After you use this, finish a Short or Long Rest to do so again. -> info:REST:NONUM
- record `feat|Warzone Nomad|Warzone Nomad#7` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
- class `feat|Warzone Nomad|Warzone Nomad#7` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
