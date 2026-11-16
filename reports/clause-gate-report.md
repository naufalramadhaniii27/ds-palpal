# Laporan clause gate (mode laporan, 2026-11-16)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44421 (51.5%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8454 |
| Info (tag terdokumentasi) | 29181 (SPELL_TEXT 9002, FORM:ACTIVATE 2847, NUMONLY:GEOMETRY 2670, FORM:ROLL 2085, ACTIVATE 1734, NUMONLY:TEXT 1569, FXO_NULL 1357, NUMONLY:ROLL 1219, NUMONLY:TABLE 1016, ACTIVE:TRIGGER 991, FORM:TABLE 979, ACTIVE:OTHERS 815, BY_DESIGN 672, REST:NONUM 641, NUMONLY:FLAVOR 338, COND:PLAY_STATE 258, STD:ASI 216, NUMONLY:ZERO 194, OBJECT:STATS 111, DC:REFERENCE 93, COND:ATTACK_ROLL_ADV 86, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 73, ACTIVE:TIMED_IMM 38, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6786 |
| Uncovered dengan angka | 3738 |
| Uncovered dengan kelas kata kunci mekanik | 6391 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 395 |
| Angka yang tidak dijelaskan record mana pun | 3522 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5818 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 280 |
| Waktu | muat data 0 s, analisis 9 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 166 ditangkap (55.7%). Hapus semua atom kelas yang dibutuhkan: 169 ditangkap (56.7%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 294 ditangkap (98.0%), semua atom kelas dihapus: 299 ditangkap (99.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3348 |
| GX | 1587 |
| wxs | 903 |
| LU_X | 730 |
| species | 510 |
| AUTO | 439 |
| ITEM_SPELLS | 346 |
| SPELL_FX | 241 |
| feat | 211 |
| cls | 153 |
| LASTCH | 145 |
| SAVE_NOTES | 91 |
| FXO | 50 |
| SPELLS | 37 |
| FDMG | 15 |
| SP_AUTO | 12 |
| SUB_GRANT | 9 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 201, fx-L4.js 168, fx-L12.js 147, fx-L2.js 133, fx-L10.js 125, fx-L3.js 113, fx-L1.js 111, fx-N1.js 99, fx-L9.js 94, fx-L11.js 82, fx-L6.js 69, fx-L8.js 63.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7763 | 1101 | 14.2% |
| SPELL | 3255 | 994 | 30.5% |
| DMG | 4658 | 769 | 16.5% |
| PROF | 1124 | 718 | 63.9% |
| ADV | 1959 | 620 | 31.6% |
| SPEED | 1419 | 615 | 43.3% |
| RES | 1377 | 519 | 37.7% |
| CHOICE | 1663 | 477 | 28.7% |
| IMM | 1006 | 403 | 40.1% |
| SLOT | 1486 | 373 | 25.1% |
| NUM | 8587 | 347 | 4.0% |
| DIS | 1221 | 297 | 24.3% |
| DC | 2903 | 290 | 10.0% |
| ATK | 1056 | 262 | 24.8% |
| SENSE | 650 | 211 | 32.5% |
| AC | 677 | 168 | 24.8% |
| SAVE | 278 | 153 | 55.0% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1616 | 77 | 4.8% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 64 | 49.6% |
| NUM-DIST | 5543 | 43 | 0.8% |
| NUM-DUR | 3523 | 38 | 1.1% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1191 | 246 | 637 | 0 | 308 |
| feat | 2825 | 510 | 1492 | 0 | 823 |
| item | 19308 | 4522 | 11649 | 0 | 3137 |
| species | 1640 | 822 | 470 | 0 | 348 |
| spell | 9280 | 278 | 9002 | 0 | 0 |
| sub | 10177 | 2076 | 5931 | 0 | 2170 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10483 | 2481 | 6314 | 1688 | 16.1% |
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
| phb14 | 516 | 143 | 257 | 116 | 22.5% |
| dmg14 | 540 | 147 | 284 | 109 | 20.2% |
| tgh14p | 491 | 105 | 283 | 103 | 21.0% |
| twow | 544 | 134 | 310 | 100 | 18.4% |
| thhw | 395 | 81 | 232 | 82 | 20.8% |
| tee24 | 464 | 170 | 216 | 78 | 16.8% |
| xge | 378 | 90 | 210 | 78 | 20.6% |
| hof | 253 | 31 | 147 | 75 | 29.6% |
| rhw | 232 | 50 | 115 | 67 | 28.9% |
| tssm | 275 | 66 | 148 | 61 | 22.2% |
| egw | 366 | 94 | 214 | 58 | 15.8% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 327 | 64 | 212 | 51 | 15.6% |
| tghg | 288 | 75 | 162 | 51 | 17.7% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| tdcsr | 299 | 107 | 148 | 44 | 14.7% |
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
| RESOURCE | 782 | 648 |
| SPELL | 721 | 102 |
| PROF | 665 | 179 |
| ADV | 610 | 183 |
| DMG | 541 | 491 |
| SPEED | 531 | 410 |
| RES | 417 | 137 |
| SLOT | 354 | 110 |
| NUM | 347 | 347 |
| CHOICE | 266 | 77 |
| IMM | 259 | 78 |
| DIS | 256 | 105 |
| SENSE | 184 | 158 |
| AC | 168 | 133 |
| ATK | 165 | 128 |
| SAVE | 147 | 120 |
| DC | 129 | 123 |
| HP | 112 | 85 |
| ABIL | 66 | 63 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (782 uncovered)

- `item|au|Queen Ehlissa's Marvelous Nightingale#27` Detect Evil and Good (Charge Cost 0). | no record for RESOURCE; number 0 unexplained
- `item|bmt|Fate Cutter Shears#8` Until the target finishes a long rest, attack rolls against it score a critical hit on a roll of 19 or 20 on the d20. | number 1d20,20 no record explains
- `item|cm|Charm of the Water Bearer#3` You can do this up to three times per day for 10 days, then the charm vanishes. | number 10 no record explains
- `item|crcotn|Jewel of Three Prayers (Exalted)#33` - You can expend 1 of the jewel's charges (no action required) to end one of the following conditions on yourself: grappled, paralyzed, or restrained. | no record for RESOURCE; number 1 unexplained
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#18` When it runs out of charges, it reverts to a figurine and can't be used again until 7 days have passed, when it regains all its charges. | number 7 no record explains
- `item|dmg14|Ring of Water Elemental Command#6` You can expend 2 of the ring's charges to cast dominate monster on a water elemental. | number 2 no record explains
- `item|dmg|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | number 2 no record explains
- `item|dmg|Amulet of the Spirit Caller#4` Each charge buys one benefit from this list, and you cannot pick the same benefit twice. | number double no record explains
- `item|dmg|Beads of Contemplation#2` The beads store ki energy for later use, up to 8 ki points. | number 8 no record explains
- `item|dmg|Blackstaff#25` (Distance from Origin / Effect) 10 ft. away or closer: 8 × the number of charges in the staff. | no record for RESOURCE; number 10,8 unexplained
- `item|dmg|Charm of the Water Bearer#3` You can do this up to three times per day for 10 days, then the charm vanishes. | number 10 no record explains
- `item|dmg|Dark Gift of Tarakamedes, the Grave Wyrm#3` At dawn, if you have not eaten at least 1 pound of them in the past 24 hours, you die. | no record for RESOURCE; number 24 unexplained
- `item|dmg|Devlin's Staff of Striking#3` When you hit with a melee attack using it, you can expend up to 3 of its charges. | number 3 no record explains
- `item|dmg|Justiciar's Gavel#2` Once per turn, when you hit with a melee attack using it, fire its thrusters for an extra 1d4 Bludgeoning damage, or 1d6 if the target is Bloodied. | no record for RESOURCE
- `item|dmg|Reliquary Charm#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | number 7 no record explains
- `item|dmg|Soulbound Wraps#3` You regain 1 ki point for every 10 damage you choose not to deal. | number 1,10 no record explains
- `item|idrotf|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | no record for RESOURCE; number 30 unexplained
- `item|pota|Devastation Orb of Fire#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|tce|+2 Bloodwell Vial#5` In addition, when you roll any Hit Dice to recover hit points while you are carrying the vial, you can regain 5 sorcery points. | number 5 no record explains
- `item|tee24|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | no record for RESOURCE; number 1 unexplained
- `item|tgh14p|Crimson Mist#1` A tiny bottle of prey pheromones, enough for one use. | no record for RESOURCE; number 1 unexplained
- `item|tghg|Staff of Briars#4` It regains 1d6 + 4 charges at dawn, and if you spend the last one, roll a d20 and on a 1 the staff turns to rose petals. | number 1d20 no record explains
- `item|thhw|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|tssm|Bands of Synergy#5` Once per turn, when your Eidolon uses an action that costs Action Points while within 30 ft of you, it can lower the AP cost by 1. | number 30,1 no record explains
- `item|ttoh|Fletcher's Retort Gloves#2` If that reduces it to 0 and you spend 1 ki point to throw the missile, the attack has a normal range of 30 feet and a long range of 120 feet. | no record for RESOURCE; number 30,120,0,1 unexplained
- `item|wdh|Blackstaff#11` On a 20, the staff regain 1d8 + 2 charges. | number 1d8,2 no record explains
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
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#3` You learn four chronomancy spells that you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
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

### PROF (665 uncovered)

- `class|Bard|Expertise~2#2` If you have proficiency in Performance and Persuasion, those two are suggested. | no record for PROF; number 2 unexplained
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Sharpshooter (2014)|Sharpshooter (2014)#6` Before you make an attack with a ranged weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tdm14|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|thhw|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsgs|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|tvss|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Spring Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Heavy Metal Axe#1` Spend 8 hours of work to turn a two-handed weapon into an instrument you are proficient with. | no record for PROF; number 8 unexplained
- `sub|Barbarian/Path of the Dragon|Wyrm Teeth#2` As a bonus action, make a melee bite attack against a creature you see within 5 ft. You are proficient with it. | no record for PROF; number 5 unexplained
- `sub|Captain/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Cleric/Knowledge Domain|Blessings of Knowledge#2` You also gain proficiency in two skills of your choice from Arcana, History, Nature, and Religion, and you have Expertise in both. | no record for PROF
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | no record for PROF; number double,pb unexplained
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Monk/Way of the Cobalt Soul|Mystical Erudition#1` Learn one language and gain proficiency in Arcana, History, Investigation, Nature or Religion (or double your bonus if you already have it). | no record for PROF; number double unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | no record for PROF; number double,pb unexplained

### ADV (610 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV; number 10 unexplained
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
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
- `item|dmg|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|tsgs|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|tvss14|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `species|Kobold Heritage|Devious Bite#1` When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage. | no record for ADV,DMG; number 1d4 unexplained
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain|Improved Duplicity#3` Attack rolls made by you and your allies against any creature within 5 feet of the illusion have Advantage. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Fighter/Corsair|Surprise Attack#1` Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. | no record for ADV,DMG,RESOURCE; number 1d6 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE; number 30 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Warmage/House of Bishops|Siege Casting#2` You have Advantage on spell attack rolls against targets 100 feet or more away. | no record for ADV,ATK; number 100 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#9` As a Bonus Action, spend another slot to add 1d8 per slot level to your next bite and gain Advantage on that attack. | no record for ADV,SLOT; number 1d8 unexplained
- `sub|Wizard/Imaskarcanist|Unlight Invigoration#3` While it has any of those, it has Advantage on Strength checks and sheds Bright Light in a 10-foot radius. | no record for ADV; number 10 unexplained

### DMG (541 uncovered)

- `feat|Perfect Landing|Perfect Landing#3` Your fall damage die is a d4 instead of a d6. | no record for DMG; number 1d4,1d6 unexplained
- `feat|Unarmed Fighting|Unarmed Fighting#3` When each of your turns begins, you can choose one creature you have Grappled and deal 1d4 Bludgeoning damage to it. | no record for CHOICE,DMG; number 1d4 unexplained
- `item|coa|Ruby Rod of Asmodeus#3` All damage dealt with it is converted to necrotic, and when you hit a good aligned creature, that creature takes an extra 2d12 necrotic damage. | no record for DMG; number 2d12 unexplained
- `item|coa|True-Ice Shards (Rapier)#21` If you attack with the rapier before the end of your next turn, you do not have its +3 bonus to attack and damage rolls. | no record for DMG; number 3 unexplained
- `item|dmg|Baba Yaga's Mortar and Pestle#29` At the start of each of your turns, whatever is in the mortar takes 4d10 force damage. | no record for DMG; number 4d10 unexplained
- `item|dmg|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Catapult Munition#4` In addition, each object in that area that isn't being worn or carried takes 35 (10d6) fire damage. | no record for DMG; number 10d6,35 unexplained
- `item|dmg|Charm of the Creeping Hand#2` The attack deals an extra 1d10 Necrotic damage and you gain 5 temporary hit points. | no record for DMG; number 1d10,5 unexplained
- `item|dmg|Dagger of Venom#6` If it fails, it takes 2d10 Poison damage and is Poisoned for 1 minute. | no record for DMG; number 2d10 unexplained
- `item|dmg|Deck of Many Things#92` Incorporeal Movement: it can pass through other creatures and objects as though they were Difficult Terrain, and if its turn ends while it is inside an object, it takes 5 (1d10) Force damage. | no record for DMG; number 1d10,5 unexplained
- `item|dmg|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | no record for DMG; number 3d8 unexplained
- `item|dmg|Hazirawn#5` While you are attuned to this weapon, its bonus on attack and damage rolls increases to +2, and a hit deals an extra 2d6 necrotic damage (instead of 1d6). | number 2d6,1d6 no record explains
- `item|dmg|Quiver of Energy#2` The first time each turn you hit with a weapon attack using ammunition from this quiver, it deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
- `item|dmg|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | number 1d6 no record explains
- `item|dmg|Sword of Kas#11` Your attacks with it score a Critical Hit when the d20 shows a 19 or a 20, and it deals an extra 2d10 Slashing damage to Undead. | number 1d20,19,20 no record explains
- `item|dmg|Tectonic Gauntlets#13` If it ends while you are burrowed, you are shunted to the nearest free space and take 1d10 Force damage. | no record for DMG; number 1d10 unexplained
- `item|dmg|Tentacle Rod#9` A target Restrained this way takes 3d6 Psychic damage when each of its turns starts. | no record for DMG; number 3d6 unexplained
- `item|dmg|The Rose Basket#7` A creature takes 2d4 Piercing damage per 5 ft it moves in the area. | no record for DMG; number 2d4,5 unexplained
- `item|dmg|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | number 10 no record explains
- `item|idrotf|Charm of Biting Cold#3` While it lasts, each hit with a melee or ranged weapon attack deals an extra 1d6 Cold damage. | no record for DMG; number 1d6 unexplained
- `item|tdm14|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | no record for DMG; number 1d4,2d4 unexplained
- `item|tee24|Grieving Tree#10` All Stunned creatures take 8d6 Piercing damage and half the total goes to the pool. | no record for DMG; number 8d6,half unexplained
- `item|tsdm|Heretical Sunstaff of Ra#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tvss14|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `species|Pantheran Catfolk|Cat's Claws#1` Your claws are natural weapons for Unarmed Strikes and deal 1d4 + Strength modifier Slashing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Raptor|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | no record for DMG; number 1d4 unexplained
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | no record for DMG; number 1d6 unexplained
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | no record for DMG; number 2d10,1d10 unexplained
- `sub|Barbarian/Path of Thorns|Thorned Grasp#2` The damage is 2d4 from level 10. | no record for DMG; number 2d4 unexplained
- `sub|Cleric/Dragon Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Fire damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Moon Domain (Deep Magic)|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Craftsman/Scrappers' Guild|Overdesigned Scrap#3` When it would break, you can instead lower its damage die by one step (minimum 1d4). | no record for DMG; number 1d4 unexplained
- `sub|Investigator/Inquisitor|Divine Strike#1` Once on each of your turns, when you take the Attack action and hit a creature with a weapon, it takes an extra 1d8 Necrotic or Radiant damage (your choice). | no record for DMG; number 1d8 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Form#7` You can move through creatures and objects as Difficult Terrain, and take 1d10 Force damage if you end your turn inside an object. | no record for DMG; number 1d10 unexplained
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#42` Each of them takes 1d10 Necrotic damage. | no record for DMG; number 1d10 unexplained
- `sub|Warlock/Undead Patron|Superior Dread#6` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | no record for DMG; number 2d8 unexplained

### SPEED (531 uncovered)

- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | no record for SPEED; number 0 unexplained
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | no record for SPEED; number 3 unexplained
- `feat|Sentinel (2014)|Sentinel (2014)#2` When you hit a creature with an opportunity attack, its Speed becomes 0 for the rest of the turn. | no record for SPEED; number 0 unexplained
- `item|dmg14|Carpet of Flying, 4 ft. × 6 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Boots of Striding and Springing#1` Wearing these boots raises your Speed to 30 feet if it was lower than that. | no record for SPEED; number 30 unexplained
- `item|dmg|Figurine of Wondrous Power (ebony fly)#18` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `item|dmg|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|dmg|Potion of Climbing#1` Drinking this potion gives you a Climb Speed equal to your Speed for 1 hour. | no record for SPEED; number 1 unexplained
- `item|dmg|Potion of Quantum Effect#2` You gain a flying speed of 5 ft and can move through creatures and objects as difficult terrain. | no record for SPEED; number 5 unexplained
- `item|dmg|Tectonic Gauntlets#12` You gain a 30 ft Burrow Speed through nonmagical, unworked earth and stone without disturbing it. | no record for SPEED; number 30 unexplained
- `item|dmg|Thuranni Cloak#3` The effect pauses until your next turn starts when you take damage, and while your Speed is 0. | no record for SPEED; number 0 unexplained
- `item|dmg|Workshop Wrecker#1` When this 3-inch-diameter metal ball is activated as a Magic action, it moves at a rapid speed, bouncing off walls and defying any attempts to capture it. | no record for SPEED; number 3 unexplained
- `item|frafi|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|tgh14p|Iridescent Armor#4` They give you a fly speed of 60 ft for 1 hour. | no record for SPEED; number 60 unexplained
- `item|tsgs|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#7` 5 Gold: Climb Speed equal to your Speed. | no record for SPEED; number 5 unexplained
- `item|tsgs|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|tsgs|Precipit, the Formless#10` Resist Bludgeoning and Slashing, +10 ft Speed, Swim Speed equal to your Speed, walk on liquid, and redirect a melee miss against you. | no record for SPEED; number 10 unexplained
- `item|tsgs|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|ttoh|Bloodspeed Elixir#2` When you drink it, your speed triples for 1 minute. | no record for SPEED; number 1 unexplained
- `species|Aven (Dominaria)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Spring Mandrake|Sprightly Movement#1` Your walking Speed rises by 5 feet. | no record for SPEED; number 5 unexplained
- `sub|Fighter/Buccaneer|Burst Maneuvers#8` Sudden Advance: move up to half your speed without provoking opportunity attacks. | no record for SPEED; number half unexplained
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | number double no record explains
- `sub|Monk/Way of Concordant Motion|Cooperative Ki#4` Step of the Wind: spend 1 extra Ki so one ally you see within 30 ft can use a Reaction to move up to half its speed without opportunity attacks. | no record for SPEED; number 30,1,half unexplained
- `sub|Monk/Way of the Humble Elephant|Unyielding Step#2` Your speed cannot drop below 15 ft. If grappled, the grappler can use its Reaction to move with you, otherwise the grapple ends. | no record for SPEED; number 15 unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Necromancer/Reaper|Wraith Flight#2` A thrall that already flies has its Fly Speed doubled. | no record for SPEED; number double unexplained
- `sub|Paladin/Oath of the Elements|Elemental Champion#2` You gain the air elemental's flying speed (90 ft, hover), or the earth elemental's Earth Glide and 30-ft climbing, swimming and crawling speeds, or the water elemental's 90-ft climbing, swimming and crawling speeds. | no record for SPEED; number 90,30 unexplained
- `sub|Rogue/Grifter|Cut And Run#2` When you take the Disengage action, you can move up to half your speed. | no record for SPEED; number half unexplained
- `sub|Sorcerer/Aberrant Mind|Revelation in Flesh#8` A Swim Speed of twice your Speed and underwater breathing. | no record for SPEED; number double unexplained
- `sub|Sorcerer/Storm Sorcery|Wind Soul#2` As an action you can lower your Fly Speed to 30 feet for 1 hour and give creatures within 30 feet, up to 3 plus your Charisma modifier, a magical Fly Speed of 30 feet for 1 hour. | no record for SPEED; number 30,3 unexplained
- `sub|Warden/Diabolist|Hellbent Survival#1` When you use Survive, you can immediately move up to your Speed without provoking Opportunity Attacks and make two attacks with a weapon or Unarmed Strike. | no record for ATK,SPEED; number 2 unexplained
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | no record for SPEED; number 0 unexplained

### RES (417 uncovered)

- `feat|Bandit Cunning|Bandit Cunning#6` If you meet DC 10 plus its challenge rating, you learn one fact of your choice about its combat abilities: a damage resistance or immunity, a condition immunity, a special ability that deals or prevents damage, an attack | no record for CHOICE,DC,IMM,RES; number 10 unexplained
- `item|coa|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|dmg|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|dmg|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tdcsr|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Cleric/War Domain|Avatar of Battle#1` You gain Resistance against three damage types: Bludgeoning, Piercing, and Slashing. | no record for RES; number 3 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | no record for RES,SLOT; number 1d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Jaeger/Heretic Chapter|Darkness Within#3` You are Heavily Obscured, gain a Fly Speed of 30 feet, and have Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES,SPEED; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Ancients (2014)|Aura of Warding#1` You and friendly creatures within 10 feet have Resistance to damage from spells. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | no record for RES; number 10 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | no record for DMG,RES,RESOURCE,SLOT; number 1d6,1 unexplained
- `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#1` Spells always prepared from the listed Sorcerer levels: 3 Command, Guidance, Locate Object, Protection from Evil and Good, Resistance, Spiritual Weapon. | no record for RES; number 3 unexplained
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for RES,SENSE; number 60,30 unexplained
- `sub|Sorcerer/Haunted|Become Death#3` While you have any, you have Resistance to all damage, a fly speed of 30 ft, and can move through creatures and objects if you end in an open space. | no record for RES,SPEED; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained

### SLOT (354 uncovered)

- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Charm of Restoration#2` Spend 1 charge to cast Lesser Restoration or 2 charges to cast Greater Restoration, with no spell slot and no components. | no record for SLOT; number 1,2 unexplained
- `item|dmg|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,RESOURCE,SLOT; number 1d6 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,RESOURCE,SLOT; number 5d6,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#2` A higher slot adds 1d4 per slot level above 1st. | no record for SLOT; number 1d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained

### NUM (347 uncovered)

- `feat|Athlete|Athlete#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | number 2,1 no record explains
- `feat|Hunted|Hunted#2` The constant paranoia gives you +5 to your passive Wisdom (Perception) and wakes you at once when a creature moves within 30 feet. | number 30,5 no record explains
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgdia|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|bgg|Glowrune Pigment#1` This set of 1d4 + 2 small paint pots contains pigments mixed from crushed luminescent gemstones. | number 1d4,2 no record explains
- `item|coa|Accounting and Valuation of All Things#6` - 1 major beneficial property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Brass#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Deck of Several Things#45` You take a -1 penalty on saving throws for the duration of the adventure. | number 1 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | number 0,pb no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power#29` Challenge Rating 0 (0 experience points, Proficiency Bonus +2). | number 0,2,pb no record explains
- `item|dmg|Flying Citadel Helm#3` It is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | number 0 no record explains
- `item|dmg|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Moonblade#15` The blade bears one rune for each bearer it has served willingly, typically 1d6 + 1 runes. | number 1d6 no record explains
- `item|dmg|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +1#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2,3 no record explains
- `item|dmg|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | number 2 no record explains
- `item|dmg|Scourge of Shadow#10` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `item|idrotf|Hook of Fisher's Delight#14` It disappears after 2d4 hours or when reduced to 0 hit points. | number 2d4,0 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#9` - 2 minor beneficial properties | number 2 no record explains
- `item|misc14|Keystone of Creation#4` - 1 minor beneficial property | number 1 no record explains
- `item|misc14|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|misc14|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tvss14|Jax#2` For 1 hour your Strength, Dexterity and Constitution each rise by 4, and their maximum becomes 24. | number 1,4,24 no record explains
- `sub|Barbarian/Path of the Wrecker (2014)|Crush, Smash, Bash#1` While raging, when you hit a construct or a creature wearing armor with a melee weapon attack, you can give the armor or construct a cumulative -1 penalty to the AC it gives, up to -4. | number 1,4 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Captain/Star Wolf|Target Designation#2` It gains no benefit from Half or Three-Quarters Cover and has a -2 penalty to AC. | number 2,3,half no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#2` You and your allies inside get +5 on Dexterity (Stealth) and Wisdom (Perception) checks, and flames inside cannot be seen from outside. | number 5 no record explains

### CHOICE (266 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage equal to your Charis | no record for CHOICE; number 5 unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | no record for CHOICE; number 3 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Summoner/Bond of the Elemental Spirit|Twin Eidolons#7` Your magic sustains both for 10 minutes, then one of your choice dissipates. | no record for CHOICE
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Bard|Expertise#2` If you have proficiency in Performance and Persuasion, those two are suggested. | angka: 2
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | angka: 1
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Warmage|Arcane Surge Improvement#1` You gain one additional use of Arcane Surge, for a total of three. | angka: 3
- `class|Shaman|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Vagabond|Last Stand#1` When damage drops you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Vagabond level. | angka: 0,double
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Rogue|Expertise~2#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | angka: 2
- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | angka: 10
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Monk|Body and Mind#2` Your Dexterity and Wisdom scores each increase by 4, to a maximum of 25. | angka: 4
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | angka: half,pb
- `class|Barbarian|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | angka: 4
- `class|Vagabond|Battle Tactics#15` A maneuver's save DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | angka: 4

### feat (282)

- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | angka: 1d6
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | angka: 30
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

### item (1981)

- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | angka: 1
- `item|dmg|Sunsword#14` When you hit an undead with it, that target takes an extra 1d8 radiant damage. | angka: 1d8
- `item|dmg|Pentacle of Woe (rare)#1` A medallion that gives +2 to spell attack rolls and the save DCs of your Witch hexes and spells. | angka: 2
- `item|dmg|Hunter's Mutagen#2` When you drink it, you are immune to Poison damage and disease for 1 hour. | angka: 1
- `item|thhw|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | angka: 24,2
- `item|egw|Wreath of the Prism (Exalted)#5` - The save DC of the wreath's spell increases to 17. | angka: 17
- `item|tvss14|Burning Knuckles#2` Your unarmed strikes deal 2d6 Fire damage instead of their usual damage. | angka: 2d6
- `item|dmg|Rope of Climbing#7` The rope has Armor Class 20, 20 Hit Points, and Immunity to Poison and Psychic damage. | angka: 20
- `item|ttoh|Beads of Contemplation#2` The beads store ki energy for later use, up to 8 ki points. | angka: 8
- `item|tsdm|Un's Codex#11` Fail: 4d6 Force damage and it is pushed to the nearest free space. | angka: 4d6
- `item|tsdm|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|dmg|Corvum Feather Robe#3` While you wear it, your Intelligence or Charisma becomes 22 (choose when you first attune) and you gain a +1 bonus to saving throws. | angka: 22
- `item|tsgs|Coldsnap#3` When you hit a creature without Cold Immunity, spend 1 charge to force a DC 15 Constitution save. | angka: 1,15
- `item|dmg|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | angka: 2d4,10,2
- `item|dmg|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | angka: 5
- `item|dmg|The Bloody End (Exalted)#14` - The saving throw DC for spells cast from the morningstar, as well as for creatures to avoid being frightened by it, increases to 17. | angka: 17
- `item|dmg|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | angka: 5
- `item|dmg|Portal Chalk#1` Two pieces of chalk, one glowing orange and one blue, each with 10 uses. | angka: 2
- `item|dmg|Defender#4` For example, you could keep only +1 on your attack and damage rolls and take +2 to Armor Class. | angka: 1,2
- `item|dmg|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | angka: 2
- `item|toa|Charm of the Ghoul#2` You regain 3d8 + 3 hit points. | angka: 3d8
- `item|dmg|Horn of Valhalla, Iron#6` The iron horn summons 5d4 + 5 berserkers. | angka: 5d4,5
- `item|dmg|Spell Gem (Bloodstone)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|tsgs|Battlechef's Splendid Saucepan#2` It works as a Mace with +1 to attack and damage rolls and deals an extra 1d4 Thunder to a target in metal armor or made of metal or stone. | angka: 1
- `item|dmg|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | angka: 3
- `item|coa|True-Ice Shards (Dagger)#28` Additionally, you may cast Scrying (with a spell save DC of 20) and Find the Path. | angka: 20
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | angka: double,pb
- `item|oota|Spell Gem (Topaz)#10` Spells cast from the spell gem have a save DC of 17 and an attack bonus of +10. | angka: 17,10
- `item|dmg|Ruby Rod of Asmodeus#3` All damage dealt with it is converted to necrotic, and when you hit a good aligned creature, that creature takes an extra 2d12 necrotic damage. | angka: 2d12
- `item|ttoh|Deadbane Heartglow Lantern#8` While holding it, use an action and spend 1 or more charges to make it detect undead for 1 hour. | angka: 1,1

### species (177)

- `species|Mechagnome|Sentry's Rest#2` You finish a Long Rest in 6 hours of inactive, motionless rest while staying conscious. | angka: 6
- `species|Ravenfolk Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Minotaur (Amonkhet)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | angka: double,pb
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Pallid Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | angka: 16
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Skathári (DM14)|Gliding Wings#2` While falling, you can move up to 10 ft horizontally for every 5 ft you fall, up to your speed. | angka: 10,5
- `species|Drow; Star Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | angka: double
- `species|Dragonborn Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Forsaken|Everlasting#3` You finish a Long Rest in 4 hours of inactive, motionless rest while staying conscious. | angka: 4
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#3` In landwalker form your Speed rises by 20 feet and your Swim Speed is 0. | angka: 0
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Aetherborn (Gifted)|Drain Life#1` Natural attack that deals 1d6 Necrotic damage and restores the same number of Hit Points to you. | angka: 1d6
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Erina|Digger#1` Burrow Speed 20 feet, through earth and sand only, not mud, ice or rock. | angka: 20
- `species|Reborn (VRGR)|Deathless Nature#4` You can finish a Long Rest in 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Dwarf|Stonecunning#1` Bonus Action: Tremorsense 60 ft for 10 minutes while on or touching stone. | angka: 60,10
- `species|Centaur (2014)|Hooves#1` Your unarmed strikes with hooves deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Astral Elf|Astral Trance#2` You finish a Long Rest in 4 hours of trance. | angka: 4
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Drow; Star Elf|Drow Subtlety#1` When you hide, conceal a weapon or take any action contested by a creature's passive Perception, you can subtract 5 from that score. | angka: 5
- `species|Corvum|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Elf (WoW)|Trance#2` You finish a Long Rest in 4 hours of light trance while staying aware. | angka: 4
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6

### sub (957)

- `sub|Ranger/Green Reaper|Toxic Tradecraft#2` If you lose it, 1 hour of harvesting toxic plants and venomous creatures, during a Short or Long Rest, makes a new one and destroys the old. | angka: 1
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | angka: 3
- `sub|Wizard/Transmuter|Potent Stone#4` If you pick Resistance twice, you must choose different damage types. | angka: double
- `sub|Warmage/House of Rooks|Arcane Assassin#2` While you have the Invisible condition, your Speed is doubled. | angka: double
- `sub|Monk/Way of Street Fighting|Combo#2` The bonus resets to 0 if you take damage on your turn. | angka: 0
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | angka: 3
- `sub|Wizard/Transmuter|Wondrous Alteration#9` The damage of your new growth becomes 2d6 of the type that goes with the growth. | angka: 2d6
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | angka: 24
- `sub|Druid/Circle of Preservation|Improved Preservation#1` Fortify Protectors: while in the Cube you and your allies add your Wisdom modifier (min +1) to Constitution saving throws. | angka: 1
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#7` Your only movement is a 60 ft Fly Speed, and you can hover. | angka: 60
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | angka: 30
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | angka: 3,2
- `sub|Druid/Circle of Configuration (2014)|Construct Form#6` Mobile: speed 40 ft, opportunity attacks against you have Disadvantage, and you gain 40 ft climbing and swimming speeds (40 ft flying from level 8). | angka: 40
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | angka: 1,0
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Necromancer/Death Knight|Overcharged Thralls#1` When a thrall drops to 0 Hit Points or you release it, you regain expended Charnel Touch points equal to your Necromancer level. | angka: 0
- `sub|Bard/College of Requiems (2014)|Chilling Melody#1` Learn two necromancy cantrips from any class list. | angka: 2
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | angka: 2
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#14` Flight (Celestial, Dragon, Elemental): 10 minutes, Fly Speed equal to your Speed, not in Heavy armor. | angka: 10
- `sub|Ranger/Winter Walker|Frigid Explorer#6` When you hit a creature with a weapon attack roll, you can deal an extra 1d4 Cold damage to it. | angka: 1d4
- `sub|Wizard/Alkemancer|Skilled Alchemist#3` You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons. | angka: pb
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | angka: 10
- `sub|Demon Hunter/Demon Hunter|Spectral Sight#1` You have Blindsight out to 10 feet. | angka: 10
- `sub|Sorcerer/Shadow Sorcery|Power of Shadow#2` You have Darkvision with a range of 120 feet and Blindsight with a range of 10 feet. | angka: 120,10
- `sub|Monk/Warrior of the Living Weapon|Reflexive Adaptation#2` After a Short Rest you can remove 1 Exhaustion level. | angka: 1
- `sub|Captain/Star-Spangled Banner|Shield Fighter#4` Damage: 1d8 Bludgeoning plus the ability modifier used for the attack roll. | angka: 1d8
- `sub|Paladin/Oath of Glory (2014)|Aura of Alacrity#1` Your Speed increases by 10 feet. | angka: 10
- `sub|Cleric/Twilight Domain|Eyes of Night#3` As a Magic action you can share this Darkvision for 1 hour with willing creatures you can see within 10 feet, up to your Wisdom modifier (minimum one). | angka: 10
- `sub|Monk/Way of the Dragon|Draconic Onslaught#1` When you use Step of the Wind and then hit with an attack, it deals an extra 2d6 damage of your affiliation's type. | angka: 2d6

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg|Detection Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> covered
- class `item|dmg|Detection Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Vagabond/Mage Brand|Spellbranding#4` When you gain a Vagabond level, you can swap one for another Sorcerer cantrip. -> info:ACTIVE:TRIGGER
- class `sub|Vagabond/Mage Brand|Spellbranding#4` When you gain a Vagabond level, you can swap one for another Sorcerer cantrip. -> info:ACTIVE:TRIGGER
- record `item|idrotf|Charm of the Traveler's Haven#4` When the last charge is spent, the charm vanishes. -> info:REST:NONUM
- class `item|idrotf|Charm of the Traveler's Haven#4` When the last charge is spent, the charm vanishes. -> info:REST:NONUM
- record `sub|Witch/Technicolor Magic|Technicolor Spells#3` 5 Fly, Sending. -> info:NUMONLY:TABLE
- class `sub|Witch/Technicolor Magic|Technicolor Spells#3` 5 Fly, Sending. -> info:NUMONLY:TABLE
- record `species|Arisen|Age#3` They may live into their second or third century or fade before 60. -> info:NUMONLY:FLAVOR
- class `species|Arisen|Age#3` They may live into their second or third century or fade before 60. -> info:NUMONLY:FLAVOR
- record `feat|Alert (2014)|Alert (2014)#6` Other creatures don't gain Advantage on attack rolls against you just because they are hidden from you. -> info:ACTIVE:OTHERS
- class `feat|Alert (2014)|Alert (2014)#6` Other creatures don't gain Advantage on attack rolls against you just because they are hidden from you. -> info:ACTIVE:OTHERS
- record `item|tgh14p|Straitjacket#4` A creature wearing it has Disadvantage on attack rolls. -> info:ACTIVE:OTHERS
- class `item|tgh14p|Straitjacket#4` A creature wearing it has Disadvantage on attack rolls. -> info:ACTIVE:OTHERS
- record `item|tee24|Sentinel Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> covered
- class `item|tee24|Sentinel Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Wizard/Ring Warden|Bonded Ring-Staff#4` When you roll damage for a spell while holding it, you can add your Proficiency Bonus to the result. -> info:NUMONLY:ROLL
- class `sub|Wizard/Ring Warden|Bonded Ring-Staff#4` When you roll damage for a spell while holding it, you can add your Proficiency Bonus to the result. -> info:NUMONLY:ROLL
- record `sub|Martyr/Burden of Mercy|Censuring Light#4` A creature takes this damage only once per turn. -> covered
- class `sub|Martyr/Burden of Mercy|Censuring Light#4` A creature takes this damage only once per turn. -> info:ACTIVE:OTHERS
- record `item|dmg|Kruphix's Devotee#2` You can cast Detect Magic a number of times equal to your Intelligence modifier (minimum once), and you regain all uses  -> info:REST:NONUM
- class `item|dmg|Kruphix's Devotee#2` You can cast Detect Magic a number of times equal to your Intelligence modifier (minimum once), and you regain all uses  -> info:REST:NONUM
- record `sub|Wizard/Tyromancer|Ferment Spell#3` Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest. -> covered
- class `sub|Wizard/Tyromancer|Ferment Spell#3` Uses equal your Intelligence modifier (minimum 1), regained on a Long Rest. -> info:REST:NONUM
- record `item|oota|Spell Gem (Obsidian)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- class `item|oota|Spell Gem (Obsidian)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- record `item|dmg|Charm of the Snow Walker#7` When the last charge is spent, the charm vanishes. -> info:REST:NONUM
- class `item|dmg|Charm of the Snow Walker#7` When the last charge is spent, the charm vanishes. -> info:REST:NONUM
- record `sub|Wizard/War Magic|Power Surge#4` If you end a Short Rest with none, you gain one. -> info:REST:NONUM
- class `sub|Wizard/War Magic|Power Surge#4` If you end a Short Rest with none, you gain one. -> info:REST:NONUM
