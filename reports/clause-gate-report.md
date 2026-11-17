# Laporan clause gate (mode laporan, 2026-11-17)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9302 |
| Info (tag terdokumentasi) | 29144 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2686, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1351, NUMONLY:ROLL 1228, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 945, ACTIVE:OTHERS 797, BY_DESIGN 670, REST:NONUM 621, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5803 |
| Uncovered dengan angka | 3547 |
| Uncovered dengan kelas kata kunci mekanik | 5411 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 392 |
| Angka yang tidak dijelaskan record mana pun | 3362 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4819 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 263 |
| Waktu | muat data 0 s, analisis 11 s |

Uji mutasi pada data nyata (seed 7): 295 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 168 ditangkap (56.9%). Hapus semua atom kelas yang dibutuhkan: 176 ditangkap (59.7%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 265 ditangkap (88.3%), semua atom kelas dihapus: 295 ditangkap (98.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3361 |
| GX | 2066 |
| wxs | 1066 |
| LU_X | 724 |
| species | 545 |
| AUTO | 444 |
| ITEM_SPELLS | 356 |
| feat | 325 |
| SPELL_FX | 241 |
| cls | 169 |
| LASTCH | 145 |
| SAVE_NOTES | 88 |
| SUB_GRANT | 70 |
| FXO | 50 |
| SPELLS | 37 |
| sub | 26 |
| FDMG | 13 |
| SP_AUTO | 12 |
| DEF_SUB | 8 |
| CLS_AUTO | 7 |
| RULE | 7 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 314, fx-L5.js 201, fx-L12.js 174, fx-L4.js 173, fx-L10.js 158, fx-L2.js 135, fx-L1.js 123, fx-L3.js 113, fx-N1.js 112, fx-L9.js 99, fx-L11.js 93, fx-L6.js 71.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 962 | 13.0% |
| SPELL | 3255 | 932 | 28.6% |
| DMG | 4658 | 703 | 15.1% |
| SPEED | 1411 | 577 | 40.9% |
| PROF | 1124 | 416 | 37.0% |
| ADV | 1959 | 405 | 20.7% |
| RES | 1375 | 402 | 29.2% |
| CHOICE | 1663 | 389 | 23.4% |
| NUM | 8604 | 344 | 4.0% |
| IMM | 1004 | 342 | 34.1% |
| SLOT | 1425 | 312 | 21.9% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 261 | 24.7% |
| DIS | 1221 | 239 | 19.6% |
| SENSE | 648 | 206 | 31.8% |
| AC | 677 | 162 | 23.9% |
| SAVE | 278 | 150 | 54.0% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1628 | 77 | 4.7% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 62 | 48.1% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 36 | 1.0% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 276 | 664 | 0 | 246 |
| feat | 2812 | 707 | 1469 | 0 | 636 |
| item | 19265 | 4631 | 11690 | 0 | 2944 |
| species | 1638 | 914 | 492 | 0 | 232 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2496 | 5877 | 0 | 1745 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2539 | 6340 | 1581 | 15.1% |
| tvss | 2788 | 694 | 1637 | 457 | 16.4% |
| core | 1495 | 405 | 775 | 315 | 21.1% |
| ttoh | 1470 | 342 | 870 | 258 | 17.6% |
| tsgs | 1479 | 405 | 831 | 243 | 16.4% |
| tvss14 | 1201 | 228 | 740 | 233 | 19.4% |
| tkdm | 921 | 231 | 492 | 198 | 21.5% |
| tsdm | 1063 | 288 | 592 | 183 | 17.2% |
| tghp | 1116 | 387 | 554 | 175 | 15.7% |
| tce | 730 | 143 | 452 | 135 | 18.5% |
| tua24 | 634 | 179 | 327 | 128 | 20.2% |
| au | 535 | 124 | 283 | 128 | 23.9% |
| tdm14 | 643 | 148 | 380 | 115 | 17.9% |
| dmg14 | 540 | 155 | 291 | 94 | 17.4% |
| tgh14p | 490 | 116 | 282 | 92 | 18.8% |
| phb14 | 513 | 173 | 256 | 84 | 16.4% |
| twow | 542 | 142 | 316 | 84 | 15.5% |
| thhw | 395 | 92 | 232 | 71 | 18.0% |
| tee24 | 463 | 186 | 216 | 61 | 13.2% |
| hof | 249 | 49 | 143 | 57 | 22.9% |
| xge | 375 | 112 | 207 | 56 | 14.9% |
| egw | 365 | 96 | 214 | 55 | 15.1% |
| tssm | 275 | 73 | 148 | 54 | 19.6% |
| coa | 158 | 45 | 60 | 53 | 33.5% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| rhw | 231 | 64 | 116 | 51 | 22.1% |
| tghg | 288 | 76 | 162 | 50 | 17.4% |
| misc14 | 326 | 66 | 213 | 47 | 14.4% |
| oota | 87 | 22 | 21 | 44 | 50.6% |
| tdcsr | 299 | 110 | 148 | 41 | 13.7% |
| mot | 292 | 96 | 159 | 37 | 12.7% |
| tsgeh | 183 | 61 | 89 | 33 | 18.0% |
| bmt | 489 | 79 | 379 | 31 | 6.3% |
| bgg | 207 | 61 | 121 | 25 | 12.1% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| bdd | 62 | 12 | 30 | 20 | 32.3% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| skt | 118 | 30 | 70 | 18 | 15.3% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| dsotdq | 82 | 19 | 46 | 17 | 20.7% |
| psa | 67 | 27 | 24 | 16 | 23.9% |
| abh | 53 | 15 | 23 | 15 | 28.3% |
| wdh | 95 | 27 | 53 | 15 | 15.8% |
| wdmm | 79 | 14 | 50 | 15 | 19.0% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| idrotf | 134 | 33 | 87 | 14 | 10.4% |
| crcotn | 96 | 36 | 46 | 14 | 14.6% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
| ai | 164 | 24 | 127 | 13 | 7.9% |
| frafi | 81 | 22 | 46 | 13 | 16.0% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| vrgr | 86 | 23 | 52 | 11 | 12.8% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| pabtso | 69 | 26 | 32 | 11 | 15.9% |
| lfl | 33 | 18 | 5 | 10 | 30.3% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| vgm | 64 | 32 | 22 | 10 | 15.6% |
| bgdia | 114 | 29 | 75 | 10 | 8.8% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| tsdd | 69 | 27 | 34 | 8 | 11.6% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psk | 38 | 22 | 11 | 5 | 13.2% |
| psx | 18 | 9 | 5 | 4 | 22.2% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
| nf | 25 | 10 | 12 | 3 | 12.0% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
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
| SPELL | 698 | 92 |
| RESOURCE | 664 | 553 |
| DMG | 528 | 474 |
| SPEED | 494 | 389 |
| ADV | 395 | 184 |
| PROF | 366 | 150 |
| NUM | 344 | 344 |
| RES | 334 | 138 |
| SLOT | 294 | 101 |
| CHOICE | 235 | 77 |
| IMM | 231 | 79 |
| DIS | 198 | 107 |
| SENSE | 180 | 154 |
| ATK | 163 | 126 |
| AC | 162 | 127 |
| SAVE | 144 | 120 |
| DC | 129 | 123 |
| HP | 112 | 85 |
| ABIL | 66 | 63 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### SPELL (698 uncovered)

- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | number 2 no record explains
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Arcane Artist|Arcane Artist#5` When you cast an Illusion spell, you can grant Heroic Inspiration to one ally within 30 feet of you who can see you. | number 30 no record explains
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#4` You learn four renaissance spells you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Impaired Vision|Impaired Vision#7` You can cast spells that need you to see a target or area if it is within 30 feet, you have a direct line to it, and you can hear it if it is a creature. | no record for SPELL; number 30 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 3 no record explains
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Spirits|Channeler#3` You know the Guidance cantrip, and it has a range of 60 feet when you cast it. | number 60 no record explains
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Druid/Circle of Stars|Star Map#2` While you hold it you know Guidance, you always have Guiding Bolt prepared, and you can cast Guiding Bolt without a slot a number of times equal to your Proficiency Bonus. | number pb no record explains
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Abjuration or Evocation. | no record for SPELL; number 3,2 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Arcane Trickster|Spellcasting#2` You know three cantrips: Mage Hand and two more of your choice taken from the Wizard spell list (suggested picks are Mind Sliver and Minor Illusion). | number 2 no record explains
- `sub|Rogue/Soulspy|Spellcasting#2` You learn three cantrips from the cleric list and a fourth at level 10. | no record for SPELL; number 3 unexplained
- `sub|Rogue/Temporal Trickster|Chrono-Master#1` You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. | no record for SPELL; number double,pb unexplained
- `sub|Rogue/Underfoot|Spellcasting#2` You learn shillelagh and two other druid cantrips, and another at level 10. | no record for SPELL; number 2 unexplained
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/Cantrip Adept|Cantrip Polymath#1` Learn two cantrips from any spell list. | no record for SPELL; number 2 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained

### RESOURCE (664 uncovered)

- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | number 10 no record explains
- `class|Shaman|Relentless Rage#4` Every use of this feature after the first raises the DC by 5. | no record for DC,RESOURCE; number 5 unexplained
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | no record for DC,RESOURCE; number 10 unexplained
- `feat|Draconic Rune Casting|Draconic Rune Casting#5` You can have a number of empowered runes at once equal to 1 + your Proficiency Bonus, and use them to replicate spells as the book describes. | no record for RESOURCE; number 1,pb unexplained
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#26` If the vessel drops to 0 Hit Points, you must make a new one, which takes a Long Rest. | no record for RESOURCE; number 0 unexplained
- `item|coa|Amulet of Duplicity#3` After 24 hours, you regain 1 hit point and are returned to the location of your near-death. | no record for RESOURCE; number 24,1 unexplained
- `item|dmg14|Manual of Iron Golems#5` To create an iron golem, you must spend 120 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | no record for RESOURCE; number 120,8 unexplained
- `item|dmg|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | number 2 no record explains
- `item|dmg|Amulet of the Black Skull#4` While wearing the amulet, you can use an action to expend 1 of its charges to transport yourself and anything you are wearing or carrying to a location within 100 feet of you. | number 100,1 no record explains
- `item|dmg|Amulet of the Drunkard#2` While wearing it, you can regain 4d4 + 4 hit points when you drink a pint of beer, ale, mead, or wine. | number 4d4,4 no record explains
- `item|dmg|Balloon Pack#7` After the spirit departs, the backpack's property is unusable unless the backpack is recharged for 1 hour in an elemental air node, which binds another spirit to the backpack. | no record for RESOURCE
- `item|dmg|Blackstaff#27` 21 to 30 ft. away: 4 × the number of charges in the staff. | no record for RESOURCE; number 30,21,4 unexplained
- `item|dmg|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|dmg|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Deadbane Heartglow Lantern#8` While holding it, use an action and spend 1 or more charges to make it detect undead for 1 hour. | no record for RESOURCE; number 1,1 unexplained
- `item|dmg|Devastation Orb of Water#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Devotee's Censer#5` At the start of each of your turns, you and any other creatures in the incense each regain 1d4 hit points. | number 1d4 no record explains
- `item|dmg|Occultant Abacus#24` Also at rank 2, you regain the use of your Read the Kill feature after you finish a short or long rest. | number 2 no record explains
- `item|dmg|Smash Potatoes#5` You can eat up to three before a Long Rest. | no record for RESOURCE; number 3 unexplained
- `item|dmg|War Standard of Battlecries#6` Change the emblem over 1 hour, even during a Short Rest. | number 1 no record explains
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|frafi|Tome of the Dragon#8` During the ritual, you and any assistants must work without interruption, resting no more than 8 hours per day. | no record for RESOURCE; number 8 unexplained
- `item|pota|Devastation Orb of Water#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|tdcsr|Cabal's Ruin (Dormant)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG; number 1d6 unexplained
- `item|tee24|Ori Boots#4` After 10 total minutes of use, the boots stop working until you finish a Long Rest. | number 10 no record explains
- `item|tsdm|Gamma Pendant#13` The spell has no effect, its casting time is wasted, and the pendant regains charges equal to the spell's level, up to 20. | number 20 no record explains
- `item|tsgs|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | no record for RESOURCE; number 12 unexplained
- `item|ttoh|Tumblesafe Heartglow Lantern#9` Each charge beyond the first extends the lantern's light by 5 feet. | no record for RESOURCE; number 5 unexplained
- `item|tvss14|Coil of Strength Storing#5` Stored charges vanish 1 minute after being stored. | no record for RESOURCE; number 1 unexplained
- `item|tvss|Goodberry Wine#3` You regain 10 HP and the drink feeds you for one day. | no record for RESOURCE; number 10,1 unexplained
- `item|wbtw|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | number 3 no record explains
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | number 2 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Jaeger/Salvation Chapter|Savior's Focus#1` When an ally you can see or hear drops to 0 Hit Points, you regain 1 Adrenaline Point. | no record for RESOURCE; number 0,1 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | number 1d6,6 no record explains
- `sub|Sorcerer/Black Powder Sorcery|Ensuing Shot#2` Spend 6 sorcery points to attack with every pistol held by you and your mage hands instead. | no record for RESOURCE; number 6 unexplained
- `sub|Sorcerer/Nanite Host|Reboot#1` When you regain consciousness after dropping to 0 hit points, you immediately regain extra 4d6 + 4 hit points. | number 0 no record explains
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#3` After you use this, you must finish a Long Rest before using it again, unless you spend 6 Sorcery Points (no action required) to restore it. | number 6 no record explains
- `sub|Wizard/School of Evocation|Overchannel#3` Each use after that before a Long Rest deals 2d12 Necrotic damage per spell level to you right after the cast, and the damage per level rises by 1d12 for each further use. | no record for DMG; number 2d12,1d12 unexplained

### DMG (528 uncovered)

- `feat|Circle Spellcaster|Circle Spellcaster#10` If both fail, you both lose concentration on all spells you maintain and each take 2d6 psychic damage. | no record for DMG; number 2d6 unexplained
- `feat|Hulking Figure|Hulking Figure#3` Once per turn, you can deal an extra 1d4 Bludgeoning damage to a target you hit with an Unarmed Strike. | no record for DMG; number 1d4 unexplained
- `item|bgdia|Shatterstick#3` When the effects ends, the shatterstick breaks apart, becoming useless, and all structures within 20 feet of it take 35 (10d6) bludgeoning damage. | no record for DMG; number 10d6,20,35 unexplained
- `item|coa|Scourge of Shadow#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 3d4 slashing damage instead of its regular damage. | number 3d4 no record explains
- `item|dmg|Arcane Warhead#9` Within a 10-mile-radius Sphere, each creature and object takes 10d10 + 200 Mega Radiant damage. | no record for DMG; number 10d10,10,200 unexplained
- `item|dmg|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Dagger of Venom#6` If it fails, it takes 2d10 Poison damage and is Poisoned for 1 minute. | no record for DMG; number 2d10 unexplained
- `item|dmg|Deck of Many Things#92` Incorporeal Movement: it can pass through other creatures and objects as though they were Difficult Terrain, and if its turn ends while it is inside an object, it takes 5 (1d10) Force damage. | no record for DMG; number 1d10,5 unexplained
- `item|dmg|Glowing Ember#6` If you move more than 20 ft from the hovering crystal, it follows you by the shortest path, avoiding obstacles if it can, until it is within 20 ft. If it is lit and cannot reach the creature it follows within 3 rounds, i | no record for DMG; number 8d6,20,3 unexplained
- `item|dmg|Phase Axe#1` A near-transparent Battleaxe with +1 to attack and damage rolls and the Thrown property (20/60 ft). | number 60,20 no record explains
- `item|dmg|Ruby Rod of Asmodeus#6` If a creature uses the special abilities of the rod without Asmodeus's permission, they take 2d12 necrotic damage each use, doubled if they're good aligned. | no record for DMG; number 2d12,double unexplained
- `item|dmg|Scourge of Shadow#7` Whenever an unattuned creature attacks with the weapon, it deals 2d4 necrotic damage, ignoring resistances and immunities, to them, but otherwise functions normally. | no record for DMG; number 2d4 unexplained
- `item|dmg|Silver Eagle Weapon#4` Instead, when both damage dice show the same number, roll 1d6 and add it. | number 1d6 no record explains
- `item|dmg|Smash Potatoes#3` For that time, your Unarmed Strike with a hand can deal 1d4 instead of its normal damage. | no record for DMG; number 1d4 unexplained
- `item|misc14|Dragontooth Dagger#6` Against enemies of the Cult of the Dragon, the dagger's bonus to attack and damage rolls increases to 2, and the extra acid damage increases to 2d6. | number 2d6,2 no record explains
- `item|tghg|Iron Fangs#2` You gain a +2 bonus to attack and damage rolls with your Bite attacks, and they deal your choice of Force or Piercing damage. | no record for DMG; number 2 unexplained
- `item|thhw|Shroud of Ending#6` While attuned, you deal 1d6 necrotic damage to any plant you touch that is not a creature, plant and beast creatures within 30 ft become hostile to you, and you stop aging and need no food or sleep. | no record for DMG; number 1d6,30 unexplained
- `item|tsgs|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | no record for DMG; number 3d8 unexplained
- `item|tsgs|Starmetal Solar Axe#5` Each Battleaxe has +1 and an extra 1d6 Cold damage. | number 1 no record explains
- `item|tsgs|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|tsgs|Trident of the Hydra#4` Each deals 1d6 Piercing damage and gets no ability modifier unless it is negative. | no record for DMG; number 1d6 unexplained
- `item|tvss14|Treant's Bane#2` A plant creature you hit takes an extra 2d6 damage of the weapon's type. | no record for DMG; number 2d6 unexplained
- `item|twow|Sulfuras, Hand of Ragnaros#8` Boiling Point: water in a container or body within 1 mile boils for 1 minute, and a creature that enters or starts its turn there takes 2d10 Fire damage. | no record for DMG; number 2d10,1,1 unexplained
- `species|Gnome Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Halfling Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Raptor|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Artificer/Armorer|Improved Armorer#6` You get a +1 bonus to attack and damage rolls with the special weapon of your Arcane Armor model. | no record for DMG; number 1 unexplained
- `sub|Artificer/Forge Adept|Runes of War#7` While in it, you and your allies deal an extra 1d4 damage of that type with weapon attacks and Unarmed Strikes. | no record for DMG; number 1d4 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Cleric/Apocalypse Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Necrotic damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Black Powder Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Fire damage (2d8 at level 14). | no record for DMG; number 1d8,2d8 unexplained
- `sub|Cleric/Community Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 psychic damage, 2d8 from level 14. | no record for DMG; number 1d8,2d8 unexplained
- `sub|Cleric/Inquisition Domain (2014)|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Force damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Purification Domain|Cleanse with Fire#1` When you deal damage with a cantrip, or with a weapon or Unarmed Strike attack, add 1d8 Fire damage. | no record for DMG,SPELL; number 1d8 unexplained
- `sub|Craftsman/Scrappers' Guild|Overdesigned Scrap#3` When it would break, you can instead lower its damage die by one step (minimum 1d4). | no record for DMG; number 1d4 unexplained
- `sub|Druid/Circle of Mutation|Endless Evolution#9` +1 to attack and damage rolls with the form's attacks. | no record for DMG; number 1 unexplained
- `sub|Ranger/Vampire Slayer|Hunter's Prey#5` With a magic weapon, one successful attack per turn deals an extra 1d8 damage. | no record for DMG; number 1d8 unexplained
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#45` Each takes 4d10 Lightning damage. | no record for DMG; number 4d10 unexplained
- `sub|Wizard/Necromancer|Undead Thralls#8` When an Undead you control within 60 feet hits a creature with an attack roll, it deals extra Necrotic damage equal to your Intelligence modifier (minimum 1). | no record for DMG; number 60 unexplained

### SPEED (494 uncovered)

- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | no record for SPEED; number half unexplained
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | no record for SPEED; number 0 unexplained
- `feat|Vampiric Exultation|Vampiric Exultation#4` While transformed you have a flying speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|dmg|Carpet of Flying#9` A carpet can bear as much as double its listed capacity, but while its load exceeds the normal capacity, its Fly Speed is halved. | no record for SPEED; number double unexplained
- `item|dmg|Carpet of Flying, 6 ft. × 9 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Deathwalker's Ward (Exalted)#5` You gain a flying speed of 60 feet for 1 hour. | no record for SPEED; number 60 unexplained
- `item|dmg|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#7` 5 Gold: Climb Speed equal to your Speed. | no record for SPEED; number 5 unexplained
- `item|dmg|Greaves of Dendallen#9` Once removed, your Speed is 0 and rises by 5 ft every 24 hours until normal. | no record for SPEED; number 5,24,0 unexplained
- `item|dmg|Potion of Aqueous Form#5` You have a swimming speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Potion of Flying#1` Drinking this potion gives you a Fly Speed equal to your Speed for 1 hour, and you can hover. | no record for SPEED; number 1 unexplained
- `item|dmg|Quaal's Feather Token (bird)#10` Flying at half that speed, it can instead carry up to 1,000 pounds. | no record for SPEED; number half unexplained
- `item|dmg|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for SPEED; number 2d4,2,half unexplained
- `item|dmg|Wings of Flying#2` These wings give you a Fly Speed of 60 feet. | no record for SPEED; number 60 unexplained
- `item|dmg|Ythryn Mythallar#14` - While you're on the same plane of existence as the Ythryn mythallar, you can use an action to cause it to fly in any direction you choose at a speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|frafi|Mechanical Wonder (Gyrocopter)#11` The gyrocopter wonder is a Huge object that weighs 500 pounds and has the following statistics: AC 14, HP 50, Speed 5 ft., and Fly Speed 20 ft. The gyrocopter can bear up to 2,000 pounds of cargo; if it bears any more th | no record for SPEED; number 5,20,14,50 unexplained
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tftyp|Loadstone#6` Until the curse is broken with remove curse or similar magic, your speed is reduced by 5 feet, and your maximum load and maximum lift capacities are halved. | no record for SPEED; number 5 unexplained
- `item|tsdm|Hoverboard#3` While riding it, your Speed rises by 10 ft, you ignore Difficult Terrain, and you can cross liquids without sinking. | no record for SPEED; number 10 unexplained
- `item|tsgs|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Greaves of Dendallen#9` Once removed, your Speed is 0 and rises by 5 ft every 24 hours until normal. | no record for SPEED; number 5,24,0 unexplained
- `item|tsgs|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#3` In landwalker form your Speed rises by 20 feet and your Swim Speed is 0. | number 0 no record explains
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | no record for SPEED; number 10,5 unexplained
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | no record for SPEED; number double unexplained
- `species|Vect (DM14)|Embedded Armor#3` Velocity Plating: speed +5 ft and long jump +5 ft. Composite Plating: AC 13 + your Dexterity modifier. | no record for SPEED; number 5,13 unexplained
- `sub|Bard/College of Paint|Master Illustrator#1` Speed Painting: use a pot as a Magic action instead of over 10 minutes. | no record for SPEED; number 10 unexplained
- `sub|Cleric/Moon Domain|Channel Divinity: Blessing of the Full Moon#1` Action: bless a willing creature within 30 ft with one of several moon blessings, such as +10 ft Speed and tracking by smell for 1 hour, or a pack-tactics style bonus for 10 minutes. | no record for SPEED; number 30,10,1,10 unexplained
- `sub|Druid/Circle of Mutation|Mutate Shape#9` Fly Speed 30 ft. 2 more points make it 60 ft. Darkvision (1). | no record for SENSE,SPEED; number 30,60,2,1 unexplained
- `sub|Monk/Warrior of Intoxication|Leap to Your Feet#1` Standing up from Prone costs you 5 feet of movement instead of half your Speed. | no record for SPEED; number 5,half unexplained
- `sub|Rogue/Cat Burglar|Up, Over, and In#2` If one already equals or beats it, that speed rises by 5 ft. When you fall, use your Reaction to reduce the fall damage by your Proficiency Bonus + your rogue level. | no record for SPEED; number 5,pb unexplained
- `sub|Sorcerer/Wastelander|Advanced Transformation#4` Fell Sprinter (Digitigrade Legs): Dash or Disengage as a bonus action, and extra movement from Dash is double your speed. | no record for SPEED; number double unexplained
- `sub|Warlock/Hexblade Patron|Malign Brutality#3` Inescapable Hex: when the cursed target ends its turn 30 feet or more from you, you can move up to your Speed straight toward it. | no record for SPEED; number 30 unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | no record for SPEED; number 0 unexplained

### ADV (395 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV; number 10 unexplained
- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | no record for ADV,INIT; number 1 unexplained
- `feat|Deathbound|Deathbound#2` If you have two Death Saving Throw failures, you have Advantage on Death Saving Throws until you are no longer at 0 Hit Points. | no record for ADV; number 2 unexplained
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `feat|Stalker (ToH)|Stalker (ToH)#3` You have Advantage on Wisdom (Survival) checks to track a creature you have seen in the past 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | no record for ADV; number 1,12 unexplained
- `item|dmg|Candle of Invocation#5` While you are inside that light, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Potion of Possibility#5` If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tee24|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|tghg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|tkdm|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|tsgs|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|tvss14|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | no record for ADV,SENSE; number 60 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Rogue/Smuggler|Dab-handed Dealer#4` Cunning Action can fund a check to control a vehicle, or a Sleight of Hand check to conceal a light weapon on you, opposed by Perception of creatures within 5 ft. On a success you have Advantage on your next attack again | no record for ADV; number 5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#9` As a Bonus Action, spend another slot to add 1d8 per slot level to your next bite and gain Advantage on that attack. | no record for ADV,SLOT; number 1d8 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#5` Otherwise it gains 5 temporary hit points for 1 hour and Advantage on its next ability check, attack roll or save. | no record for ADV; number 1,5 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | no record for ADV; number 8 unexplained
- `sub|Wizard/Void Caster|Void Affinity#1` You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint. | no record for ADV; number double unexplained

### PROF (366 uncovered)

- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | number 1d4 no record explains
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#1` You gain proficiency with four simple or martial firearms and can use them as spellcasting focuses. | no record for PROF; number 4 unexplained
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|llk|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tdm14|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|thhw|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tvss14|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `item|tvss14|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#6` The animal has Intelligence 10 and speaks one language you know. | no record for PROF; number 10 unexplained
- `sub|Monk/Way of the Cobalt Soul|Mystical Erudition#1` Learn one language and gain proficiency in Arcana, History, Investigation, Nature or Religion (or double your bonus if you already have it). | number double no record explains
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#1` Gain proficiency with the poisoner's kit, with your Proficiency Bonus doubled, and gain a kit. | no record for PROF; number double,pb unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | number double,pb no record explains
- `sub|Wizard/Alkemancer|Skilled Alchemist#3` You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons. | no record for DMG,PROF; number pb unexplained

### NUM (344 uncovered)

- `feat|Crossbow Expert|Crossbow Expert#2` Your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Inscription Adept|Inscription Adept#9` Journeyman (+3): Glyph of Warding. | number 3 no record explains
- `feat|Lightly Armored|Lightly Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Medium Armor Master|Medium Armor Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Sentinel|Sentinel#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|coa|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|coa|Ranseur of Torture#9` - 1 minor beneficial property | number 1 no record explains
- `item|crcotn|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | number 2 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Accounting and Valuation of All Things#7` - 1 major detrimental property | number 1 no record explains
- `item|dmg|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Figurine of Wondrous Power#24` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Firecracker Crystals#1` A bag of 1d4 + 8 festival crystals. | number 1d4,8 no record explains
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | number 0 no record explains
- `item|dmg|Horn of Valhalla, Bronze#6` A bronze horn summons 4d4 + 4 berserkers. | number 4d4,4 no record explains
- `item|dmg|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|dmg|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | number 2d4,2 no record explains
- `item|dmg|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|llk|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|llk|Powered Armor#25` When the armor is reduced to 0 hit points, its defenses are rendered inert and it can be safely approached. | number 0 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Cleric/Black Powder Domain|Channel Divinity: Imbue/Remove Explosivity#2` Either give the Gunpowder Blessing for 1 minute to one weapon of each creature you choose within 30 ft, or curse a number of weapons with Gunpowder Burst, up to your Proficiency Bonus, within 30 ft so they cannot Gunpowd | number 30,1,pb no record explains
- `sub|Craftsman/Arcane Maesters' Guild|Magic Item Crafting#13` Bag of Holding, Lantern of Revealing, Decanter of Endless Water, Rope of Climbing, Eyes of Minute Seeing, Sending Stones, Goggles of Night, Wand of Magic Detection, Helm of Comprehending Languages, +1 Wand of the War Mag | number 1 no record explains
- `sub|Fighter/Hell Knight|Advanced Wounds#5` Devil's Luck: creatures that take the Acid damage have -1 AC until the end of your next turn. | number 1 no record explains
- `sub|Necromancer/Overlord|Charnel Aura#3` The bonus is +1 per 5 points spent, to a maximum of +3. | number 1,5 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | number 2 no record explains

### RES (334 uncovered)

- `feat|Primordial Transformation: Stage 3|Primordial Transformation: Stage 3#9` You gain Vulnerability to that instance of damage, even if you had Resistance or Immunity, and creatures within 5 feet of you take the same amount of damage as you took. | number 5 no record explains
- `item|coa|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Potion of Invulnerability#1` Drinking this potion gives you Resistance to all damage for 1 minute. | no record for RES; number 1 unexplained
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|dmg|Twin Blades of Azzinoth#3` Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. | no record for IMM,RES
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|tsgs|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|tsgs|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|ttoh|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|tvss14|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | no record for DMG,RES; number 1d6,2d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of the Hearth (ToH)|Roaring Fire#3` A cold creature that starts its turn within 20 ft takes 2d8 Fire damage, ignoring Fire resistance and immunity. | no record for DMG,IMM,RES; number 2d8 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | no record for DMG,RES,RESOURCE,SLOT; number 1d6,1 unexplained
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for SENSE; number 60,30 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained

### SLOT (294 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Evoker|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 3 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | no record for DMG,SLOT; number 2d6,10 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Wings#2` They last 2 rounds per slot level and end early if you are Incapacitated or dismiss or replace them with a Bonus Action. | no record for SLOT; number 2 unexplained

### CHOICE (235 uncovered)

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


### class (116)

- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | angka: 2
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | angka: 4
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Monk|Superior Defense#1` At the start of your turn, you can spend 3 Focus Points to brace against harm. | angka: 3
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Shaman|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Captain|Cohort~2#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Captain|Cohort~3#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Barbarian|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | angka: 2
- `class|Warden|Sentinel's Stand#9` While you hold a Shield, its AC bonus is +3 instead of +2. | angka: 3,2
- `class|Craftsman|Weapon Enchantment#8` The weapon deals an extra 1d6 damage of that type. | angka: 1d6
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | angka: half,pb
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | angka: 2
- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | angka: 2
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | angka: 3
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | angka: half
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3

### feat (270)

- `feat|Greater Mark of Scribing|Greater Mark of Scribing#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Durable|Durable#2` Your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Magitechnician (Dark Matter)|Magitechnician (Dark Matter)#3` If one of your magic items calls for a saving throw, it uses this DC when it is higher: 8 plus the modifier of the ability this feat raised plus your Proficiency Bonus. | angka: 8,pb
- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | angka: 20
- `feat|Symbiotic Being|Symbiotic Being#12` You make a Charisma saving throw against DC 13 plus your Proficiency Bonus. | angka: 13,pb
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#25` Deathly Horror (3 FP): as a bonus action, a creature within 30 ft makes a Wisdom save or is Frightened for 1 minute, repeating each turn, and a success makes it immune for 24 hours. | angka: 30,24,3
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | angka: 2
- `feat|Boon of Skill|Boon of Skill#2` Choose an ability score and add 1 to it (maximum 30). | angka: 30
- `feat|Insectoid|Insectoid#2` Your antennae give you blindsight 10 feet. | angka: 10
- `feat|Chief Engineer (2014)|Chief Engineer (2014)#10` When you repair the ship as a downtime activity, it regains mega hit points equal to three times your Proficiency Bonus + your Intelligence modifier for each day of repairs. | angka: 3,pb
- `feat|Simian (2014)|Simian (2014)#4` You have a climbing speed equal to half your speed. | angka: half
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | angka: 4
- `feat|Living Shadow|Living Shadow#8` Right after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Boon of Energy Resistance|Boon of Energy Resistance#8` That creature attempts a Dexterity saving throw against a DC of 8 plus your Proficiency Bonus plus your Constitution modifier, and on a failure it takes damage of that type equal to 2d12 plus your Con | angka: 2d12,8,pb
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | angka: 2
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Gathered Whispers|Gathered Whispers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Greater Mark of Healing|Greater Mark of Healing#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Fey Transformation: Stage 2|Fey Transformation: Stage 2#7` Until you do, you have Disadvantage on D20 Tests. | angka: 1d20
- `feat|Giant Foe|Giant Foe#5` On an Intelligence (History) check about the culture or origins of a giant, you count as proficient in History and add double your Proficiency Bonus instead of your normal one. | angka: double,pb
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Medium Armor Master (2014)|Medium Armor Master (2014)#4` When you wear Medium armor, you can add up to 3, rather than 2, to your AC from your Dexterity modifier. | angka: 3,2
- `feat|Vampire Transformation: Stage 4|Vampire Transformation: Stage 4#4` At the start of your turn you regain 15 Hit Points if you have at least 1 but fewer than 60 Hit Points. | angka: 15,60
- `feat|Infernal Dragoon|Infernal Dragoon#13` You can cast it once per Long Rest without a spell slot, and when you do its duration is 8 hours. | angka: 8
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | angka: 5
- `feat|Fists of Fury|Fists of Fury#5` When you deal damage to a creature with an Unarmed Strike, add +1 to the damage roll for each earlier melee attack roll that hit that creature in the same turn. | angka: 1

### item (1901)

- `item|wbtw|Scissors of Shadow Snipping#13` If a shadowless creature is subjected to any spell that ends a curse, or if its detached shadow is reduced to 0 hit points, the detached shadow disappears, and the creature regains its normal shadow i | angka: 0
- `item|idrotf|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | angka: 30
- `item|misc14|Dragontooth Dagger#6` Against enemies of the Cult of the Dragon, the dagger's bonus to attack and damage rolls increases to 2, and the extra acid damage increases to 2d6. | angka: 2d6,2
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affe | angka: 60,1,2
- `item|dmg|Wand of Wonder#18` You take 1d6 Psychic damage instead. | angka: 1d6
- `item|dmg|Scourge of Shadow#13` - 1 major detrimental property | angka: 1
- `item|tghg|Gristaline#2` For 1 hour your Strength score becomes 19 (if lower), but you have Disadvantage on Intelligence checks and saves. | angka: 1,19
- `item|dmg|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | angka: 12d6
- `item|dmg|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | angka: 3d4,3
- `item|dmg|Floodmote Heartglow Lantern#5` A creature touching it can use an action to infuse it, lowering that creature's hit point maximum by its Proficiency Bonus until it finishes a rest, and the lantern gains charges equal to that amount. | angka: pb
- `item|tdm14|Gamma Pendant#9` On a 20 it regains 1d12 + 1. | angka: 1d12,1
- `item|wbtw|Pixie Dust#4` A small packet holds enough pixie dust for one use. | angka: 1
- `item|twow|Judgment Armor#1` Plate Armor (AC 18, Strength 15, Stealth Disadvantage). | angka: 18,15
- `item|dmg|Shield of the Cavalier#5` Add your Proficiency Bonus and Strength modifier to that attack roll. | angka: pb
- `item|tdm14|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | angka: 1d4,2d4
- `item|tvss14|Aqua Fortis#4` On armor or a shield it gives a permanent, cumulative -1 to AC (armor at AC 10 or a shield at +0 is destroyed). | angka: 1,10,0
- `item|dmg|Gauntlet of the Grandmaster (very rare)#2` You gain +3 to spell attack rolls, spell damage rolls and the save DCs of your Warmage spells. | angka: 3
- `item|tsgs|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | angka: 5
- `item|dmg|Doom Gauntlet#4` When you hit with it you can spend the charge to deal an extra 1d4 mega (1d4 x 100) Force damage. | angka: 1d4,100
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | angka: 1
- `item|dmg|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | angka: 1d10
- `item|dmg|Diamond Staff#16` Maze (Charge Cost 8). | angka: 8
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | angka: 9d4,9
- `item|dmg|Defender#4` For example, you could keep only +1 on your attack and damage rolls and take +2 to Armor Class. | angka: 1,2
- `item|dmg|Boots of the Vigilant#2` After you roll initiative, you can roll a d8 and add it to your initiative. | angka: 1d8
- `item|ggr|Pyroconverger#6` If the total is 11 or higher, the Pyroconverger malfunctions: you take 4d6 fire damage, and you can't use the Pyroconverger again until you finish a long rest. | angka: 4d6,11
- `item|dmg|Manual of Iron Golems#5` To create an iron golem, you must spend 120 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | angka: 120,8
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | angka: 1d4,1
- `item|tsgs|Master Machinist's Marvelous Mallet#4` Or spend 3 charges as a Bonus Action and touch armor to give its wearer +1 AC for 1 minute (one such effect per creature). | angka: 3
- `item|dmg|Tearulai#24` Note: According to the SRD, it is an extra 4d6 slashing damage, although this is incorrect. | angka: 4d6

### species (139)

- `species|Harengon (WBtW)|Hare-Trigger#1` Add your Proficiency Bonus to your initiative rolls. | angka: pb
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | angka: double,pb
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | angka: pb
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | angka: 0
- `species|Halfling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Vect (DM14)|Embedded Armor#3` Velocity Plating: speed +5 ft and long jump +5 ft. Composite Plating: AC 13 + your Dexterity modifier. | angka: 5,13
- `species|Elf/Shadow Fey Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Kobold Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | angka: 2
- `species|Autumn Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Bhain Kwai Minotaur|Natural Attacks#1` Your horns are natural weapons for Unarmed Strikes and deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Gnoll (Eberron)|Rampage#1` When you use your Bite or reduce a creature to 0 Hit Points with an attack, take a Bonus Action to move up to half your Speed and make one attack with a weapon or an Unarmed Strike using your Bite. | angka: 0,half
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | angka: 3
- `species|Tiefling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Drow; Star Elf|Drow Subtlety#1` When you hide, conceal a weapon or take any action contested by a creature's passive Perception, you can subtract 5 from that score. | angka: 5
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Leonin|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Derro Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | angka: 16
- `species|Raptor|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | angka: half
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Human and Half-Elf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Dwarf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | angka: 1
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4

### sub (936)

- `sub|Barbarian/Path of the Giant|Demiurgic Colossus#3` The extra damage from Elemental Cleaver becomes 2d6. | angka: 2d6
- `sub|Barbarian/Path of the Storm Herald|Raging Storm#9` It makes a Strength save or its Speed is 0 until the start of your next turn. | angka: 0
- `sub|Monk/Way of the Dragon|Scales of the Wyrm#1` On your turn, spend 4 Ki to gain +2 AC, temporary hit points equal to your monk level, and immunity to Frightened for 10 minutes. | angka: 10,4,2
- `sub|Fighter/Banneret|Group Recovery#1` When you use Second Wind to regain Hit Points, you can pick a number of allies within a 30-foot Emanation from you, up to your Charisma modifier (minimum of one). | angka: 30
- `sub|Necromancer/Necrodancer|Backup Dancers#2` While at least one thrall dances, you gain a bonus to AC, damage rolls and D20 Tests that use Dexterity or Charisma, plus the benefits below. | angka: 1d20
- `sub|Warlock/The Genie|Elemental Gift#2` As a Bonus Action you gain a Fly Speed of 30 feet with hover for 10 minutes. | angka: 30,10
- `sub|Cleric/Travel Domain|Well-Traveled#1` You gain proficiency with four finesse or ranged weapons of your choice and learn two languages of your choice. | angka: 4,2
- `sub|Ranger/Freerunner|Nimble Dodge#1` When an area effect would make you take a saving throw, use your reaction to move up to half your speed, possibly out of the area. | angka: half
- `sub|Fighter/Hell Knight|Infernal Wound#6` You can do this a number of times equal to your Constitution modifier (min 1), regaining all uses after a Short or Long Rest. | angka: 1
- `sub|Wizard/Gastronomer|Monster Meal#11` Monstrosity: HP maximum and current +5. | angka: 5
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Monk/Way of the Humble Elephant|Unyielding Step#2` Your speed cannot drop below 15 ft. If grappled, the grappler can use its Reaction to move with you, otherwise the grapple ends. | angka: 15
- `sub|Fighter/Arcane Archer|Arcane Shot Options#31` Extra Psychic damage, 1 die. | angka: 1
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | angka: 10
- `sub|Barbarian/Path of Heavy Metal|Solo Shredding#1` When you damage an enemy with an Instrument Weapon while Raging, raise your Rage Damage bonus by 1 until the Rage ends, to a maximum of double the table value. | angka: 1,double
- `sub|Evoker/Draconic Sorcery|Draconic Resilience#2` Your Hit Point maximum goes up by 3, and it goes up by 1 more each time you gain another Sorcerer level. | angka: 3,1
- `sub|Sorcerer/Nanite Host|Reboot#1` When you regain consciousness after dropping to 0 hit points, you immediately regain extra 4d6 + 4 hit points. | angka: 0
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | angka: 30
- `sub|Fighter/Scofflaw|Blindside#1` Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. | angka: 5d6
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | angka: 10,half
- `sub|Paladin/Oath of the Giving Grave|Tenacious Life#2` If you start your turn with fewer than half your Hit Points, you regain 5 Hit Points. | angka: 5,half
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Cleric/Travel Domain|Godspeed#1` Your walking Speed doubles. | angka: double
- `sub|Paladin/Oath of Glory|Peerless Athlete#2` For 1 hour, you have Advantage on Dexterity (Acrobatics) and Strength (Athletics) checks, and your Long Jumps and High Jumps each reach 10 feet farther. | angka: 10,1
- `sub|Bard/College of Echoes|Alter Sound#6` Dampen: lower the volume of a sound within 30 ft, halving its range and giving creatures in range Disadvantage on Perception checks to detect it. | angka: 30
- `sub|Bard/College of Paint|Master Illustrator#1` Speed Painting: use a pot as a Magic action instead of over 10 minutes. | angka: 10
- `sub|Necromancer/Overlord|Charnel Aura#2` Undead you control inside it gain a bonus to D20 Tests, damage rolls and AC. | angka: 1d20
- `sub|Ranger/Green Reaper|Toxic Tradecraft#2` If you lose it, 1 hour of harvesting toxic plants and venomous creatures, during a Short or Long Rest, makes a new one and destroys the old. | angka: 1
- `sub|Wizard/White Necromancer|White Necromancy#5` The DC of each later check rises by 1, and you have Disadvantage if you were disrespectful to it in the last 24 hours. | angka: 24,1
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | angka: 30

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|bgdia|Shield of the Hidden Lord#14` - Anytime during your turn, the shield can choose to radiate an aura of dread for 1 minute. -> info:NUMONLY:GEOMETRY
- class `item|bgdia|Shield of the Hidden Lord#14` - Anytime during your turn, the shield can choose to radiate an aura of dread for 1 minute. -> info:NUMONLY:GEOMETRY
- record `sub|Sorcerer/Divine Soul|Favored by the Gods#2` You regain use after a Short or Long Rest. -> covered
- class `sub|Sorcerer/Divine Soul|Favored by the Gods#2` You regain use after a Short or Long Rest. -> info:REST:NONUM
- record `sub|Sorcerer/Resonant Body|Sound and Fury#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Sorcerer/Resonant Body|Sound and Fury#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- record `item|dmg|Love's Embrace#1` A greatsword made of two scimitars, one cold and one fire. -> info:NUMONLY:TABLE
- class `item|dmg|Love's Embrace#1` A greatsword made of two scimitars, one cold and one fire. -> info:NUMONLY:TABLE
- record `sub|Cleric/Life Domain (2014)|Divine Strike#2` It becomes 2d8 at Cleric level 14. -> info:NUMONLY:ROLL
- class `sub|Cleric/Life Domain (2014)|Divine Strike#2` It becomes 2d8 at Cleric level 14. -> info:NUMONLY:ROLL
- record `sub|Wizard/Cantrip Adept|Arcane Alacrity#2` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Wizard/Cantrip Adept|Arcane Alacrity#2` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- record `sub|Fighter/Gladiator|Mutilate#4` After a creature fails against this feature you can't use it again until a Long Rest. -> info:REST:NONUM
- class `sub|Fighter/Gladiator|Mutilate#4` After a creature fails against this feature you can't use it again until a Long Rest. -> info:REST:NONUM
- record `item|mot|Akmon, Hammer of Purphoros#12` The hammer has 1 randomly determined major beneficial property. -> info:NUMONLY:TEXT
- class `item|mot|Akmon, Hammer of Purphoros#12` The hammer has 1 randomly determined major beneficial property. -> info:NUMONLY:TEXT
- record `item|crcotn|Jewel of Three Prayers (Awakened)#4` The power of the other two deities waits to be reawakened by a hero—or heroes—who can follow in Alyxian's footsteps. -> info:NUMONLY:TEXT
- class `item|crcotn|Jewel of Three Prayers (Awakened)#4` The power of the other two deities waits to be reawakened by a hero—or heroes—who can follow in Alyxian's footsteps. -> info:NUMONLY:TEXT
- record `class|Necromancer|Undying Servitude#2` Once used, it returns after a Long Rest. -> info:REST:NONUM
- class `class|Necromancer|Undying Servitude#2` Once used, it returns after a Long Rest. -> info:REST:NONUM
- record `sub|Sorcerer/Divine Soul|Unearthly Recovery#2` You regain use after a Long Rest. -> covered
- class `sub|Sorcerer/Divine Soul|Unearthly Recovery#2` You regain use after a Long Rest. -> info:REST:NONUM
- record `item|bgg|Delver's Claws#8` You then regain a number of hit points equal to the total roll plus your Constitution modifier. -> info:REST:NONUM
- class `item|bgg|Delver's Claws#8` You then regain a number of hit points equal to the total roll plus your Constitution modifier. -> info:REST:NONUM
- record `item|dmg|Guardian Emblem#5` The emblem regains all expended charges daily at dawn. -> info:REST:NONUM
- class `item|dmg|Guardian Emblem#5` The emblem regains all expended charges daily at dawn. -> info:REST:NONUM
- record `sub|Martyr/Burden of Revolution|Burden of Revolution Spells#2` They do not count against your prepared spells. -> info:ACTIVE:OTHERS
- class `sub|Martyr/Burden of Revolution|Burden of Revolution Spells#2` They do not count against your prepared spells. -> info:ACTIVE:OTHERS
- record `sub|Druid/Circle of Crystals|Crystalline Skin#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Druid/Circle of Crystals|Crystalline Skin#3` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
