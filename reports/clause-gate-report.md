# Laporan clause gate (mode laporan, 2026-11-16)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44281 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8511 |
| Info (tag terdokumentasi) | 29120 (SPELL_TEXT 8952, FORM:ACTIVATE 2841, NUMONLY:GEOMETRY 2689, FORM:ROLL 2081, ACTIVATE 1724, NUMONLY:TEXT 1573, FXO_NULL 1355, NUMONLY:ROLL 1230, NUMONLY:TABLE 1019, FORM:TABLE 979, ACTIVE:TRIGGER 958, ACTIVE:OTHERS 812, BY_DESIGN 670, REST:NONUM 622, NUMONLY:FLAVOR 340, COND:PLAY_STATE 250, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 88, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 73, ACTIVE:TIMED_IMM 38, REST:LENGTH 32, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6650 |
| Uncovered dengan angka | 3674 |
| Uncovered dengan kelas kata kunci mekanik | 6255 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 395 |
| Angka yang tidak dijelaskan record mana pun | 3475 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5690 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 280 |
| Waktu | muat data 0 s, analisis 11 s |

Uji mutasi pada data nyata (seed 7): 297 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 191 ditangkap (64.3%). Hapus semua atom kelas yang dibutuhkan: 192 ditangkap (64.6%). Selftest sintetis: lulus.

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
| item | 3344 |
| GX | 1599 |
| wxs | 904 |
| LU_X | 722 |
| species | 510 |
| AUTO | 440 |
| ITEM_SPELLS | 346 |
| SPELL_FX | 241 |
| feat | 212 |
| cls | 154 |
| LASTCH | 145 |
| SAVE_NOTES | 91 |
| SUB_GRANT | 66 |
| FXO | 50 |
| SPELLS | 37 |
| FDMG | 13 |
| SP_AUTO | 12 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 201, fx-L4.js 170, fx-L12.js 147, fx-L2.js 133, fx-L10.js 128, fx-L3.js 113, fx-L1.js 111, fx-N1.js 101, fx-L9.js 94, fx-L11.js 81, fx-L6.js 69, fx-Z2.js 66.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| SPELL | 3255 | 994 | 30.5% |
| RESOURCE | 7405 | 974 | 13.2% |
| DMG | 4658 | 755 | 16.2% |
| PROF | 1124 | 661 | 58.8% |
| ADV | 1959 | 620 | 31.6% |
| SPEED | 1419 | 615 | 43.3% |
| RES | 1377 | 519 | 37.7% |
| CHOICE | 1663 | 476 | 28.6% |
| IMM | 1006 | 403 | 40.1% |
| SLOT | 1486 | 373 | 25.1% |
| NUM | 8606 | 347 | 4.0% |
| DIS | 1221 | 297 | 24.3% |
| DC | 2903 | 289 | 10.0% |
| ATK | 1056 | 262 | 24.8% |
| SENSE | 650 | 211 | 32.5% |
| AC | 677 | 168 | 24.8% |
| SAVE | 278 | 153 | 55.0% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1628 | 77 | 4.7% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 64 | 49.6% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3525 | 38 | 1.1% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1187 | 247 | 632 | 0 | 308 |
| feat | 2812 | 511 | 1485 | 0 | 816 |
| item | 19290 | 4520 | 11654 | 0 | 3116 |
| species | 1638 | 824 | 492 | 0 | 322 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10124 | 2131 | 5905 | 0 | 2088 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10474 | 2480 | 6316 | 1678 | 16.0% |
| tvss | 2800 | 630 | 1632 | 538 | 19.2% |
| core | 1496 | 348 | 762 | 386 | 25.8% |
| ttoh | 1470 | 230 | 873 | 367 | 25.0% |
| tvss14 | 1206 | 169 | 745 | 292 | 24.2% |
| tsgs | 1479 | 385 | 834 | 260 | 17.6% |
| tkdm | 921 | 176 | 495 | 250 | 27.1% |
| tsdm | 1063 | 250 | 596 | 217 | 20.4% |
| tghp | 1116 | 354 | 555 | 207 | 18.5% |
| tdm14 | 643 | 109 | 380 | 154 | 24.0% |
| tce | 730 | 125 | 453 | 152 | 20.8% |
| tua24 | 634 | 152 | 331 | 151 | 23.8% |
| au | 535 | 107 | 285 | 143 | 26.7% |
| dmg14 | 540 | 150 | 285 | 105 | 19.4% |
| tgh14p | 490 | 105 | 282 | 103 | 21.0% |
| phb14 | 513 | 154 | 258 | 101 | 19.7% |
| twow | 542 | 134 | 311 | 97 | 17.9% |
| thhw | 395 | 82 | 232 | 81 | 20.5% |
| tee24 | 463 | 170 | 215 | 78 | 16.8% |
| hof | 249 | 32 | 143 | 74 | 29.7% |
| xge | 375 | 96 | 208 | 71 | 18.9% |
| rhw | 231 | 52 | 115 | 64 | 27.7% |
| tssm | 275 | 66 | 150 | 59 | 21.5% |
| egw | 365 | 94 | 214 | 57 | 15.6% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 326 | 63 | 212 | 51 | 15.6% |
| tghg | 288 | 75 | 162 | 51 | 17.7% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| tdcsr | 299 | 109 | 148 | 42 | 14.0% |
| mot | 292 | 96 | 159 | 37 | 12.7% |
| tsgeh | 183 | 59 | 88 | 36 | 19.7% |
| bmt | 489 | 78 | 379 | 32 | 6.5% |
| bgg | 207 | 59 | 121 | 27 | 13.0% |
| tgh14c | 242 | 30 | 185 | 27 | 11.2% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| bdd | 62 | 10 | 30 | 22 | 35.5% |
| psa | 67 | 21 | 25 | 21 | 31.3% |
| skt | 118 | 27 | 70 | 21 | 17.8% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| dsotdq | 82 | 16 | 47 | 19 | 23.2% |
| abh | 53 | 12 | 23 | 18 | 34.0% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| scag | 67 | 22 | 29 | 16 | 23.9% |
| idrotf | 134 | 32 | 86 | 16 | 11.9% |
| wdh | 95 | 26 | 53 | 16 | 16.8% |
| wdmm | 79 | 14 | 49 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| ai | 164 | 24 | 127 | 13 | 7.9% |
| frafi | 81 | 22 | 46 | 13 | 16.0% |
| lfl | 33 | 16 | 5 | 12 | 36.4% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| bgdia | 114 | 27 | 75 | 12 | 10.5% |
| pabtso | 69 | 25 | 32 | 12 | 17.4% |
| vrgr | 86 | 23 | 52 | 11 | 12.8% |
| tsdd | 69 | 23 | 35 | 11 | 15.9% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| psk | 38 | 19 | 11 | 8 | 21.1% |
| aag | 40 | 18 | 14 | 8 | 20.0% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| efa | 28 | 9 | 15 | 4 | 14.3% |
| nf | 25 | 9 | 12 | 4 | 16.0% |
| mtf | 64 | 48 | 13 | 3 | 4.7% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| tdcg | 9 | 3 | 4 | 2 | 22.2% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 9230 | 278 | 8952 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| SPELL | 721 | 102 |
| RESOURCE | 670 | 557 |
| ADV | 610 | 183 |
| PROF | 608 | 179 |
| DMG | 572 | 518 |
| SPEED | 531 | 410 |
| RES | 417 | 137 |
| SLOT | 354 | 110 |
| NUM | 347 | 347 |
| CHOICE | 268 | 77 |
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


### SPELL (721 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Death Knight|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Impaired Vision|Impaired Vision#7` You can cast spells that need you to see a target or area if it is within 30 feet, you have a direct line to it, and you can hear it if it is a creature. | no record for SPELL; number 30 unexplained
- `feat|Initiate of High Sorcery|Initiate of High Sorcery#5` You learn one Wizard cantrip and two 1st-level spells, chosen from your moon's list. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `feat|Spellblade (2014)|Spellblade (2014)#3` You learn two cantrips from Arc Blade, Burning Blade, Caustic Blade and Frigid Blade, using Intelligence. | no record for SPELL; number 2 unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|dmg|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|dmg|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|wbtw|Witchlight Watch#14` After the watch's invisibility spell is cast, roll a d8; on a roll of 3 or 8, the watch can't be used to cast this spell again until the next dawn. | no record for SPELL; number 1d8,8 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/Madness Domain|Channel Divinity: Temporary Insanity#3` Roll a d20: 1-5 Aphasia, it cannot speak, cast spells or understand others. | no record for SPELL; number 1d20,1,5 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained

### RESOURCE (670 uncovered)

- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | number 10 no record explains
- `class|Shaman|Relentless Rage#4` Every use of this feature after the first raises the DC by 5. | no record for DC,RESOURCE; number 5 unexplained
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | no record for DC,RESOURCE; number 10 unexplained
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#28` If you die while your charged vessel is on your plane, its charge is spent and you return as if by Resurrection within 5 feet of it after 1 day. | no record for RESOURCE; number 5 unexplained
- `item|cos|Icon of Ravenloft#14` The target regains 3d8 + 3 hit points, unless it is an undead, a construct, or a fiend. | number 3d8,3 no record explains
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#18` When it runs out of charges, it reverts to a figurine and can't be used again until 7 days have passed, when it regains all its charges. | number 7 no record explains
- `item|dmg|Amulet of the Black Skull#4` While wearing the amulet, you can use an action to expend 1 of its charges to transport yourself and anything you are wearing or carrying to a location within 100 feet of you. | number 100,1 no record explains
- `item|dmg|Amulet of the Drunkard#2` While wearing it, you can regain 4d4 + 4 hit points when you drink a pint of beer, ale, mead, or wine. | number 4d4,4 no record explains
- `item|dmg|Baba Yaga's Pestle#5` When you hit with a melee attack using the pestle, you can expend up to 3 of its charges to deal an extra 1d8 force damage for each charge expended. | no record for DMG; number 1d8,3 unexplained
- `item|dmg|Balloon Pack#7` After the spirit departs, the backpack's property is unusable unless the backpack is recharged for 1 hour in an elemental air node, which binds another spirit to the backpack. | no record for RESOURCE
- `item|dmg|Belt of Dwarvenkind#8` While you are attuned to the belt, each day at dawn there is a 50 percent chance that you grow a full beard if you are able to grow one, or that your existing beard grows thicker. | number 50 no record explains
- `item|dmg|Blackstaff#27` 21 to 30 ft. away: 4 × the number of charges in the staff. | no record for RESOURCE; number 30,21,4 unexplained
- `item|dmg|Blast Disk (Common)#7` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Chain Cilice#4` If you have the Ki feature, or ki points from another source such as the Inner Resilience feat, you regain 1 ki point for every 5 damage it causes. | no record for RESOURCE; number 1,5 unexplained
- `item|dmg|Devastation Orb of Water#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Devotee's Censer#5` At the start of each of your turns, you and any other creatures in the incense each regain 1d4 hit points. | number 1d4 no record explains
- `item|dmg|Obviator's Lenses#1` Also at rank 2, you gain the use of an uncommon magic item taking the form of a pair of spectacles, a spyglass, a monocle, or any other device with one or two lenses. | no record for RESOURCE; number 2 unexplained
- `item|dmg|Ori Boots#4` After 10 total minutes of use, the boots stop working until you finish a Long Rest. | number 10 no record explains
- `item|dmg|Ring of the Orator#2` While you wear it, you can expend 1 of its charges to project your voice to be heard clearly by all creatures within 1 mile of yourself, regardless of intervening noise, for 1 minute. | number 1,1,1 no record explains
- `item|dmg|Signet Rings of the Fey Court#4` Each ring has 2 charges and regains all on a Long Rest. | number 2 no record explains
- `item|dmg|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|idrotf|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | no record for RESOURCE; number 30 unexplained
- `item|pabtso|Mudslick Tower#19` Each casting of wish causes the roof, the door, or one wall to regain 50 hit points. | no record for RESOURCE; number 50 unexplained
- `item|pota|Balloon Pack#7` After the spirit departs, the backpack's property is unusable unless the backpack is recharged for 1 hour in an elemental air node, which binds another spirit to the backpack. | no record for RESOURCE
- `item|pota|Devastation Orb of Air#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|pota|Devastation Orb of Water#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|thhw|Potion of Rest#2` Drink it before a short or long rest and you wake with 1d10 + 5 Temporary Hit Points and with one level of exhaustion removed. | no record for RESOURCE; number 1d10,5 unexplained
- `item|tsgs|Signet Rings of Blindness, Deafness, and Silence#2` Each ring has 1 charge and regains it at dawn. | number 1 no record explains
- `item|tsgs|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|ttoh|Fletcher's Retort Gloves#2` If that reduces it to 0 and you spend 1 ki point to throw the missile, the attack has a normal range of 30 feet and a long range of 120 feet. | no record for RESOURCE; number 30,120,0,1 unexplained
- `item|xge|Wand of Scowls#5` If you expend the wand's last charge, roll a d20. | number 1d20 no record explains
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | number 2 no record explains
- `species|Elf (Fey)|Elven Lineage (Fey)#5` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | number 2 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Jaeger/Salvation Chapter|Savior's Focus#1` When an ally you can see or hear drops to 0 Hit Points, you regain 1 Adrenaline Point. | no record for RESOURCE; number 0,1 unexplained
- `sub|Sorcerer/Hungering|Feast of Arcana#1` When one spell of 1st level or higher reduces one or more hostile creatures to 0 hit points, you regain 1 spent sorcery point. | no record for RESOURCE; number 0,1 unexplained
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#3` After you use this, you must finish a Long Rest before using it again, unless you spend 6 Sorcery Points (no action required) to restore it. | number 6 no record explains
- `sub|Sorcerer/Wretched Bloodline|Share the Burden#2` You can cast it by spending 3 sorcery points instead of a slot. | no record for RESOURCE; number 3 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#3` Add one monster ingredient (a whole corpse slain in the last 24 hours or kept by Gentle Repose) for a benefit until a Long Rest by type. | no record for RESOURCE; number 24 unexplained

### ADV (610 uncovered)

- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | no record for ADV,INIT; number 1 unexplained
- `feat|Floriographer|Floriographer#5` You have Advantage on Intelligence (Investigation) and Wisdom (Insight) checks to notice and read hidden visual messages, such as the runes of a magic trap or subtle hand signals between two people. | no record for ADV; number 2 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|dmg|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|dmg|Chattering Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tee24|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|tgh14p|Stalk Symbiote#3` While attuned you have Advantage on Wisdom (Perception) checks, and you and allies within 30 ft cannot be surprised unless incapacitated by something other than nonmagical sleep. | no record for ADV; number 30 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tkdm|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|tsgs|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|ttoh|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `species|Avia-Ra (DM14)|Blessings of the Sun#3` While it lasts, if you roll a 4 on the d4 you add to an attack roll or save, you have Advantage on that roll. | no record for ADV,ATK; number 1d4 unexplained
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | no record for ADV; number 24 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | no record for ADV,SPEED; number 30 unexplained
- `sub|Fighter/Corsair|Surprise Attack#1` Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Fighter/Rune Knight|Rune Carver#21` Advantage on Wisdom (Insight) checks and Darkvision 120 feet. | no record for ADV,SENSE; number 120 unexplained
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Hearth (ToH)|Aura of the Hearth#1` You and friendly creatures within 10 ft have Advantage on saves against spells and effects that deal Cold damage. | no record for ADV; number 10 unexplained
- `sub|Warlock/The GM|OP Class Feature#2` You have Advantage on all attack rolls, ability checks and saving throws, and you roll three d20s and take the highest instead of two. | no record for ADV; number 3,2 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### PROF (608 uncovered)

- `class|Bard|Expertise~2#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | no record for PROF; number pb unexplained
- `class|Bard|Expertise~2#2` If you have proficiency in Performance and Persuasion, those two are suggested. | no record for PROF; number 2 unexplained
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | no record for PROF; number half,pb unexplained
- `class|Investigator|Expertise~2#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Rogue|Expertise~2#1` Choose two skills you're proficient in. | no record for PROF
- `class|Rogue|Expertise~2#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | no record for PROF; number 2 unexplained
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
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|tdm14|Arm Cannon#2` An arm is replaced by a blaster cannon, 2d8 Radiant, Blaster property, range 30/120 ft. You are proficient with it and cannot be disarmed of it. | no record for PROF; number 2d8,120,30 unexplained
- `item|tsdm|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | no record for PROF; number 2 unexplained
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tvss14|Brawling Gloves (rare)#2` You are proficient with all improvised weapons and gain +2 to attack and damage rolls made with them. | no record for DMG,PROF; number 2 unexplained
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Human Chassis|Adaptable Acumen#2` Pick one of them, or another skill or tool you are proficient in, and your Proficiency Bonus is doubled on checks that use it. | number pb no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `sub|Barbarian/Path of the Dad|Paternal Proficiencies#1` You gain proficiency with two sets of Artisan's Tools of your choice. | no record for PROF
- `sub|Barbarian/Path of the Dragon|Wyrm Teeth#2` As a bonus action, make a melee bite attack against a creature you see within 5 ft. You are proficient with it. | no record for PROF; number 5 unexplained
- `sub|Bard/College of Investigation|Bonus Proficiencies#1` Gain proficiency in Insight and two of Acrobatics, Deception, Investigation, Performance, Sleight of Hand or Stealth. | no record for PROF; number 2 unexplained
- `sub|Bard/College of Lore (2014)|Bonus Proficiencies#1` You gain proficiency in three skills of your choice. | no record for PROF
- `sub|Fighter/Nightwatcher|Skilled Guardian#2` You also gain proficiency in two skills from Deception, History, Insight, Intimidation, Investigation, Perception and Stealth. | no record for PROF; number 2 unexplained
- `sub|Ranger/Grove Warden|Wrath of the Forest#1` When you take the Attack action, use a bonus action to have a rock, branch, root or similar small object strike a creature within 30 ft. You are proficient with it, it counts as magical, you add your Dexterity modifier t | no record for DMG,PROF; number 1d8,30 unexplained
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#3` You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons. | no record for DMG,PROF; number pb unexplained

### DMG (572 uncovered)

- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | no record for DMG; number 1d6 unexplained
- `feat|Beastman|Beastman#2` Your claws make unarmed strikes that deal 1d6 + your Strength modifier slashing damage. | no record for DMG; number 1d6 unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#7` Also, once on each of your turns when you hit with a weapon attack using your Focus, you can deal an extra 2d8 Necrotic damage to the target. | no record for DMG; number 2d8 unexplained
- `item|bgg|Lash of Immolation#6` Doing so increases the extra fire damage dealt by the whip to 2d6. | number 2d6 no record explains
- `item|dmg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | no record for DMG; number 1,2 unexplained
- `item|dmg|Bag of Beans#12` A failure means it takes 5d6 Poison damage and gains the Poisoned condition, which lasts 1 hour. | no record for DMG; number 5d6,1 unexplained
- `item|dmg|Bolt#4` It also draws bolts: if another creature within 10 ft takes Lightning damage while you hold it, you take 1d6 Lightning per 10 damage that creature took. | no record for DMG; number 1d6,10,10 unexplained
- `item|dmg|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Crosier of Divine Power#3` When you hit with it or heal with a spell or effect while holding it, spend 1 mote to add 2d6 to the damage (Radiant) or healing. | no record for DMG; number 2d6,1 unexplained
- `item|dmg|Flayer Slayer#3` An Aberration hit with this greataxe takes an extra 1d12 slashing damage. | no record for DMG; number 1d12 unexplained
- `item|dmg|Grovelthrash (Dormant)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|dmg|Hazirawn#3` If you are not attuned to Hazirawn, you deal an extra 1d6 necrotic damage when you hit with the weapon. | no record for DMG; number 1d6 unexplained
- `item|dmg|Iron Fangs#2` You gain a +2 bonus to attack and damage rolls with your Bite attacks, and they deal your choice of Force or Piercing damage. | no record for DMG; number 2 unexplained
- `item|dmg|Lance of the Hungering Dead#2` The first time each turn you hit a living enemy in melee with it, it takes an extra 1d12 Necrotic damage and you gain Temporary Hit Points equal to half that damage (rounded up). | number half no record explains
- `item|dmg|Lightbringer#5` While glowing, the mace deals an extra 1d6 radiant damage to Undead creatures. | no record for DMG; number 1d6 unexplained
- `item|dmg|Ranseur of Torture#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 2d10 piercing damage instead of its regular damage. | number 2d10 no record explains
- `item|dmg|Scourge of Shadow#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 3d4 slashing damage instead of its regular damage. | number 3d4 no record explains
- `item|dmg|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `item|dmg|Sword of Resonance#5` Your next hit with it before the end of your next turn deals an extra 1d6 Thunder damage. | number 1d6 no record explains
- `item|dmg|Thunderous Greatclub#8` Each nonmagical object in the Cone that nobody is wearing or carrying takes 3d8 Thunder damage. | no record for DMG; number 3d8 unexplained
- `item|dmg|Treant's Bane#2` A plant creature you hit takes an extra 2d6 damage of the weapon's type. | no record for DMG; number 2d6 unexplained
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|imr|Ruinblade#7` When you hit an undead creature with it, the attack deals an extra 1d8 force damage. | no record for DMG; number 1d8 unexplained
- `item|misc14|Rod of Seven Parts#27` The Rod of Seven Parts functions for you as a magic quarterstaff that grants a +3 bonus to attack and damage rolls made with it. | number 7 no record explains
- `item|misc14|Talarith#2` While the reigar wears the talarith, any weapon wielded by the reigar deals an extra 1d6 force damage when it hits. | no record for DMG; number 1d6 unexplained
- `item|tghg|Iron Fangs#2` You gain a +2 bonus to attack and damage rolls with your Bite attacks, and they deal your choice of Force or Piercing damage. | no record for DMG; number 2 unexplained
- `item|tsgs|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|tsgs|Direstone Dwarven Pick#2` You gain +2 to attack and damage rolls, and stone creatures and objects it hits take an extra 1d8 Piercing. | number 1d8 no record explains
- `item|tsgs|Phase Axe#1` A near-transparent Battleaxe with +1 to attack and damage rolls and the Thrown property (20/60 ft). | number 60,20 no record explains
- `item|tsgs|Telescoping Bladelance#3` Retracted, it is a Greatsword that deals 1d10 Slashing damage instead of 2d6. | no record for DMG; number 1d10,2d6 unexplained
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | number 10 no record explains
- `item|tvss14|Treant's Bane#2` A plant creature you hit takes an extra 2d6 damage of the weapon's type. | no record for DMG; number 2d6 unexplained
- `species|Dragonborn Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | no record for DMG; number 1d4 unexplained
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Cleric/Serpent Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Poison damage (2d8 at level 14). | no record for DMG; number 1d8,2d8 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Ranger/Green Reaper (2014)|2nd-Level Effects#4` Suffer: for 1 minute the first time it takes Poison damage each turn it takes an extra 1d6. | no record for DMG; number 1d6,1 unexplained
- `sub|Ranger/Swarmkeeper|Mighty Swarm#1` Gathered Swarm damage becomes 1d8. | no record for DMG; number 1d8 unexplained
- `sub|Warlock/Undead Patron|Superior Dread#6` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained

### SPEED (531 uncovered)

- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | no record for SPEED; number 1,4 unexplained
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | no record for SPEED; number 3 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | no record for SPEED; number 5,7,40 unexplained
- `item|dmg|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|dmg|Couatl Herald's Fang#4` On a failure it is Incapacitated with Speed 0 until it takes damage or another creature uses an action to shake it out of the stupor. | no record for SPEED; number 0 unexplained
- `item|dmg|Doomhammer#6` While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). | no record for SPEED; number double unexplained
- `item|dmg|Figurine of Wondrous Power (ebony fly)#18` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `item|dmg|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|dmg|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|dmg|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|dmg|Tectonic Gauntlets#17` Your Speed drops by 5 ft and your Intelligence drops by 4 (minimum 7). | number 4 no record explains
- `item|tftyp|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | no record for SPEED; number double unexplained
- `item|tgh14p|Iridescent Armor#4` They give you a fly speed of 60 ft for 1 hour. | no record for SPEED; number 60 unexplained
- `item|tsgs|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | no record for SPEED; number 15,1 unexplained
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#7` 5 Gold: Climb Speed equal to your Speed. | no record for SPEED; number 5 unexplained
- `species|Mandrake|Entangling Vines#2` Its Speed is 0 and cannot increase until the end of its next turn. | no record for SPEED; number 0 unexplained
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | no record for SPEED; number double unexplained
- `species|Wulven|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Bard/College of Dance|Inspiring Movement#2` You then move a distance of up to half your Speed. | no record for SPEED; number half unexplained
- `sub|Bard/College of Tactics|Setting the Board#1` As a bonus action, command up to three willing allies who see or hear you to use their Reactions to move up to half their speed without provoking opportunity attacks. | no record for SPEED; number 3,half unexplained
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | no record for SPEED; number 5 unexplained
- `sub|Cleric/Pestilence Domain|Infection#4` Joint Lock: its Speed drops by 15 ft (minimum 5 ft). | no record for SPEED; number 15 unexplained
- `sub|Druid/Circle of Mutation|Endless Evolution#4` Tremorsense 30 ft. 2 more points give a Burrow Speed equal to your Speed. | no record for SENSE,SPEED; number 30,2 unexplained
- `sub|Druid/Circle of the Titan|Dire Impact#2` Shock Wave: once per turn, right after you move at least half your Speed, send a shock wave through a 10-foot Emanation. | no record for SPEED; number 10,half unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | number double no record explains
- `sub|Monk/Way of Concordant Motion|Cooperative Ki#4` Step of the Wind: spend 1 extra Ki so one ally you see within 30 ft can use a Reaction to move up to half its speed without opportunity attacks. | no record for SPEED; number 30,1,half unexplained
- `sub|Monk/Way of Concordant Motion|Deflect Strike#1` When an ally you see within 30 ft is hit by a melee attack, spend 2 Ki and use your Reaction to move up to half your speed toward it. | no record for SPEED; number 30,2,half unexplained
- `sub|Monk/Way of the Four Fists|Grasp of The Monkey#2` You have a climbing speed equal to your walking speed and double your jump distance. | no record for SPEED; number double unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Paladin/Oath of Vengeance|Relentless Avenger#3` As part of that same Reaction, you can then move a distance of up to half your Speed without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Paladin/Oath of Winter|Channel Divinity#7` On a failure it takes 2d6 Cold damage per point of your Proficiency Bonus and its speed is halved until the start of your next turn. | no record for DMG,SPEED; number 2d6,pb unexplained
- `sub|Rogue/Grifter|Cut And Run#2` When you take the Disengage action, you can move up to half your speed. | no record for SPEED; number half unexplained
- `sub|Sorcerer/Storm Sorcery|Wind Soul#2` As an action you can lower your Fly Speed to 30 feet for 1 hour and give creatures within 30 feet, up to 3 plus your Charisma modifier, a magical Fly Speed of 30 feet for 1 hour. | no record for SPEED; number 30,3 unexplained
- `sub|Warlock/The Parasite|Physical Specimen#5` Your jumps triple and you gain a climb speed equal to your walking speed. | no record for SPEED; number 3 unexplained
- `sub|Wizard/Cantrip Adept|Adroit Caster#1` A cantrip you cast that deals no damage, or an added effect of a damaging cantrip such as the speed reduction of ray of frost, lasts twice as long. | no record for SPEED,SPELL; number double unexplained

### RES (417 uncovered)

- `feat|Primordial Transformation: Stage 3|Primordial Transformation: Stage 3#9` You gain Vulnerability to that instance of damage, even if you had Resistance or Immunity, and creatures within 5 feet of you take the same amount of damage as you took. | number 5 no record explains
- `feat|Vampire Transformation: Stage 3|Vampire Transformation: Stage 3#5` If you start your turn in sunlight you take 1d10 Radiant damage, and nothing can give you Resistance or Immunity to it. | no record for DMG,IMM,RES; number 1d10 unexplained
- `item|coa|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|coa|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|dmg|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|tdcsr|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tsgs|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|ttoh|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|tvss14|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `item|twow|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Jaeger/Heretic Chapter|Darkness Within#3` You are Heavily Obscured, gain a Fly Speed of 30 feet, and have Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES,SPEED; number 30 unexplained
- `sub|Monk/Way of the Humble Elephant|Thick Hide#1` As a bonus action, spend 5 Ki to gain Resistance to Bludgeoning, Piercing and Slashing damage for 10 minutes. | no record for RES; number 10,5 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Paladin/Oath of Safeguarding|Aura of Preservation#4` At level 18 the range is 30 ft, and friendly creatures within 10 ft have Resistance to all Bludgeoning, Piercing and Slashing damage. | no record for RES; number 30,10 unexplained
- `sub|Paladin/Oath of the Ancients (2014)|Aura of Warding#1` You and friendly creatures within 10 feet have Resistance to damage from spells. | no record for RES; number 10 unexplained
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | no record for RES; number 30 unexplained
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for RES,SENSE; number 60,30 unexplained
- `sub|Sorcerer/Shadow Magic|Umbral Form#2` You have Resistance to all damage except Force and Radiant, and you move through creatures and objects as Difficult Terrain, taking 5 Force damage if you end your turn inside an object. | no record for RES; number 5 unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained

### SLOT (354 uncovered)

- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|twow|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|twow|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Sorcerer/Mirrorkin|Copycat#1` As an action, perform any action a humanoid other than you performed within the last minute, if you see it within 60 ft. You ignore the usual prerequisites, such as a holy symbol, ki points or consumed items, but a spell | no record for SLOT; number 60 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### NUM (347 uncovered)

- `feat|Athlete|Athlete#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Durable|Durable#2` Your Constitution score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Martial Weapon Training|Martial Weapon Training#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Part of the Pack|Part of the Pack#6` At 5th level or higher, your howl summons a number of wolves equal to your Proficiency Bonus, with a 50 percent chance that one is a dire wolf, and never more than one dire wolf. | number 50,pb no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgdia|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|coa|Accounting and Valuation of All Things#6` - 1 major beneficial property | number 1 no record explains
- `item|coa|Ranseur of Torture#9` - 1 minor beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#12` - 2 minor detrimental properties | number 2 no record explains
- `item|crcotn|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | number 2 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Deck of Many Things#18` You can't lower a score that is 5 or less. | number 5 no record explains
- `item|dmg|Deck of Many Things#60` Your Intelligence or Wisdom score drops permanently by 1d4 + 1, to a minimum of 1. | number 1d4,1 no record explains
- `item|dmg|Deck of Several Things#45` You take a -1 penalty on saving throws for the duration of the adventure. | number 1 no record explains
- `item|dmg|Figurine of Wondrous Power#29` Challenge Rating 0 (0 experience points, Proficiency Bonus +2). | number 0,2,pb no record explains
- `item|dmg|Flying Citadel Helm#3` It is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | number 0 no record explains
- `item|dmg|Gloves of Swimming and Climbing#2` You also gain a +5 bonus to any Strength (Athletics) check you make to climb or to swim. | number 5 no record explains
- `item|dmg|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|dmg|Ioun Stone#35` While it circles your head, your Intelligence rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Moonblade#15` The blade bears one rune for each bearer it has served willingly, typically 1d6 + 1 runes. | number 1d6 no record explains
- `item|dmg|Prehistoric Figurine of Wondrous Power, Jasper Tyrannosaurus Rex#16` On a 1, you lose control of the figurine, and it becomes hostile to you and your companions until it is reduced to 0 hit points, at which point it reverts to figurine form. | number 0 no record explains
- `item|dmg|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | number 2 no record explains
- `item|dmg|Scalehide Cream#4` A jar holds 1d6 + 1 doses. | number 1d6,1 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|idrotf|Hook of Fisher's Delight#14` It disappears after 2d4 hours or when reduced to 0 hit points. | number 2d4,0 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#7` - 2 minor beneficial properties | number 2 no record explains
- `item|tee24|Grieving Tree#4` When a prisoner would be left at 0 Hit Points alive, it heals 1d4 + 1 from the pool. | number 1d4,1 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Craftsman/Arcane Maesters' Guild|Magic Item Crafting#13` Bag of Holding, Lantern of Revealing, Decanter of Endless Water, Rope of Climbing, Eyes of Minute Seeing, Sending Stones, Goggles of Night, Wand of Magic Detection, Helm of Comprehending Languages, +1 Wand of the War Mag | number 1 no record explains
- `sub|Monk/Way of Concordant Motion|Coordinated Maneuvers#1` When you share Patient Defense or Step of the Wind, target a number of allies up to your Proficiency Bonus, spending 1 Ki for each. | number 1,pb no record explains
- `sub|Monk/Way of the Sun Soul|Searing Arc Strike#2` You can spend more points to raise its level by 1 each. | number 1 no record explains
- `sub|Sorcerer/Nanite Magic|Nano Touch#3` Nano-Degradation (1 or 2 points): a creature within 5 ft takes a -2 AC penalty per point until the start of your next turn. | number 5,1,2 no record explains
- `sub|Warmage/Coalition Arcanist|Tactical Uplink#3` You also get +5 to your Passive Wisdom (Perception). | number 5 no record explains

### CHOICE (268 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | number 9 no record explains
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | no record for CHOICE; number double,pb unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Druid/Circle of the Obelisk|Evolutionary#3` One ability score of your choice on that creature rises by the roll, to a maximum of 20, for 1 minute. | no record for CHOICE; number 1 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | no record for CHOICE; number 3 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Familiar Master (2014)|Arcane Evolution#2` Choose a beast with CR no higher than half the slot's level. | no record for CHOICE; number half unexplained
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | angka: half,pb
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Necromancer|Critical Spellcasting#5` The extra damage applies only to the creature that rolled the 1. | angka: 1
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | angka: 3
- `class|Demon Hunter|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Necromancer|Thralls#25` You still cannot raise Undead that dropped to 0 Hit Points. | angka: 0
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | angka: 2
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Captain|Cohort~2#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | angka: 3
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | angka: 1
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Demon Hunter|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Warden|Sentinel's Stand#9` While you hold a Shield, its AC bonus is +3 instead of +2. | angka: 3,2
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3

### feat (277)

- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | angka: 2
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | angka: 1
- `feat|Shock Trooper (Dark Matter)|Shock Trooper (Dark Matter)#5` In the first round of each combat, your Speed is doubled. | angka: double
- `feat|Boon of Looming Shadows|Boon of Looming Shadows#4` When you take the Attack action, your reach with melee weapon attacks increases by 10 feet until the end of your turn. | angka: 10
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | angka: 30
- `feat|Psionic-Awakened|Psionic-Awakened#7` You can cast it without Verbal or Somatic components, make the hand Invisible, and its range increases by 30 feet. | angka: 30
- `feat|Revenant Blade|Revenant Blade#6` While you hold a double-bladed scimitar in two hands, you gain a +1 bonus to AC. | angka: 1,2,double
- `feat|Boon of Recovery|Boon of Recovery#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Mage Slayer|Mage Slayer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 20
- `feat|Hunted|Hunted#2` The constant paranoia gives you +5 to your passive Wisdom (Perception) and wakes you at once when a creature moves within 30 feet. | angka: 30,5
- `feat|Iron Hero|Iron Hero#1` When a creature with a Challenge Rating higher than your level attacks you, you have +2 AC. | angka: 2
- `feat|Shadowsteel Adept|Shadowsteel Adept#7` If your Shadowsteel Focus is also a weapon, it has a +1 bonus to attack rolls and damage rolls. | angka: 1
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | angka: 20
- `feat|Greater Mark of Storm|Greater Mark of Storm#6` When you cast Gust of Wind with Storm Magic (no slot), you also gain a Fly Speed of 60 feet for the spell's duration. | angka: 60
- `feat|Knight of the Sword|Knight of the Sword#7` It makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Laser Swordmaster|Laser Swordmaster#2` While you wield an antimatter dagger, laser halfsword or laser sword you are proficient with, and a creature hits you with a ranged blaster attack or one of those weapons, you can use your reaction to | angka: pb
- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#5` Your bite deals 2d8 damage. | angka: 2d8
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Survivor (Grim Hollow)|Survivor (Grim Hollow)#2` You need only half the food per day that your size normally requires. | angka: half
- `feat|Nocturnal (GH14C)|Nocturnal (GH14C)#2` You gain darkvision out to 60 ft. If you already have it, its range rises by 30 ft, to a maximum of 120 ft. | angka: 60,30
- `feat|Boon of Irresistible Offense|Boon of Irresistible Offense#2` Add 1 to your Strength or Dexterity score (maximum 30). | angka: 1,30
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Sharpshooter (2014)|Sharpshooter (2014)#6` Before you make an attack with a ranged weapon you are proficient with, you can take a -5 penalty to the attack roll. | angka: 5
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | angka: 2
- `feat|Greater Mark of Shadow|Greater Mark of Shadow#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#28` You gain darkvision 60 ft if you lack it. | angka: 60

### item (1968)

- `item|dmg|Spell Gem (Bloodstone)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|tsgs|Cinnabar Rapier#3` When you hit, spend 1 or more charges to deal an extra 1d4 Poison per charge. | angka: 1d4,1
- `item|dmg|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | angka: 3
- `item|coa|Wrought-Iron Tower#22` This property costs 3 charges to use, though a creature that successfully saves against one of its uses is immune to future uses for 24 hours. | angka: 24,3
- `item|tsdm|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|llk|Deck of Several Things#87` Increase one of your ability scores by 1 for the duration of the adventure. | angka: 1
- `item|dmg|Ruby Rod of Asmodeus#6` If a creature uses the special abilities of the rod without Asmodeus's permission, they take 2d12 necrotic damage each use, doubled if they're good aligned. | angka: 2d12,double
- `item|ttoh|Soulbound Wraps#4` Once you have regained ki points equal to half your Proficiency Bonus this way, the wraps unravel and cannot be worn again until the next dawn. | angka: half,pb
- `item|dmg|Ashbringer (True State)#5` The sword is sentient (Int 14, Wis 17, Cha 17, hearing and Darkvision 120 ft, speaks Common and Dwarvish, telepathy with its wielder). | angka: 120,14,17
- `item|bgg|Wyrmreaver Gauntlets#9` While the spectral fists are active, unarmed strikes you make on your turn have a reach of 30 feet, and when you hit a creature with an opportunity attack made with your unarmed strike, the creature m | angka: 30,8,pb
- `item|dmg|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | angka: 1d4,3,1
- `item|tsgs|Dragon's Call#2` You also get +1 to Intelligence, Wisdom and Charisma checks about dragon lore. | angka: 1
- `item|tsgs|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | angka: 2
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | angka: 1
- `item|dmg|Bobbing Lily Pad#3` It has a walking, flying, and swimming speed of 20 feet, and it can hover. | angka: 20
- `item|dmg|Scourge of Shadow#12` - 2 minor detrimental properties | angka: 2
- `item|twow|Experimental Goblin Jetpack#3` They give a Fly Speed of 60 feet. | angka: 60
- `item|dmg|Gamma Pendant#13` The spell has no effect, its casting time is wasted, and the pendant regains charges equal to the spell's level, up to 20. | angka: 20
- `item|dmg|Stormgirdle (Awakened)#7` - While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover. | angka: 30
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | angka: 90
- `item|thhw|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | angka: 1
- `item|dmg|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | angka: 1d8,60,20
- `item|dmg|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | angka: 20
- `item|tsdm|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | angka: 60
- `item|egw|Arcane Cannon#4` After the cannon has fired, it must recharge for 5 minutes before it can be fired again. | angka: 5
- `item|tsgs|Wavebender's Leiomano#4` Rowing a waterborne vehicle with it adds 5 ft Speed (1/2 mile per hour) for each such oar used. | angka: 5,2,1
- `item|rhw|Charm of the Black Rose#1` Expend this Charm for one of two effects. | angka: 2
- `item|crcotn|Jewel of Three Prayers (Exalted)#44` - Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed. | angka: 30
- `item|dmg|Taser Net#2` You have +1 to attack rolls with it. | angka: 1

### species (153)

- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Skathári (DM14)|Gliding Wings#2` While falling, you can move up to 10 ft horizontally for every 5 ft you fall, up to your speed. | angka: 10,5
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Ravenfolk Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Feathren|Talons#1` When your Unarmed Strike uses your talons to deal damage, it deals 1d6 Piercing damage instead of Bludgeoning. | angka: 1d6
- `species|Mechagnome|Specialized Design#1` Proficiency with two tools of your choice. | angka: 2
- `species|Wrothian (DM14)|Neural Lock#2` On a failure it is Incapacitated and its speed is 0 until the start of your next turn. | angka: 0
- `species|Dwarf|Stonecunning#1` Bonus Action: Tremorsense 60 ft for 10 minutes while on or touching stone. | angka: 60,10
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Aarakocra (Monster)|Flight#1` Fly Speed of 50 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 50
- `species|Drow Heritage|Poison Bite#1` When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. | angka: 1d6,3d6
- `species|Nautilid (DM14)|Aqua Suit#6` While you wear it, your AC is 13 + your Dexterity modifier, and other armor can be fitted around it at no cost. | angka: 13
- `species|Halfling Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Dwarf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Bhain Kwai Minotaur|Wetland Dweller#2` Swim Speed 25 feet. | angka: 25
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Amoeboid (DM14)|Flexible Form#6` You can speak and understand its language, and if it has a burrowing, climbing or swimming speed you gain it, up to 40 ft. You can make the same actions that creature could, other than ones needing sp | angka: 40
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Vect (DM14)|Embedded Armor#3` Velocity Plating: speed +5 ft and long jump +5 ft. Composite Plating: AC 13 + your Dexterity modifier. | angka: 5,13
- `species|Spring Mandrake|Sprightly Movement#1` Your walking Speed rises by 5 feet. | angka: 5
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | angka: 2
- `species|Pluvenn|Nocturnal/Diurnal#1` You have Darkvision 60 ft. A Long Rest takes you only 4 hours. | angka: 4
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | angka: 1,2
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Hinterfolk Halfling|Highly Mobile#2` In Light armor or none, you have a Climb Speed and a Swim Speed of 20 feet. | angka: 20
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2

### sub (952)

- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | angka: 30
- `sub|Druid/Circle of Configuration (2014)|Construct Form#7` Turret: speed 0, and when you take the Attack action you get one extra attack as a bonus action. | angka: 0
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | angka: 2d6,10
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | angka: 2d8
- `sub|Druid/Circle of the Moon|Circle Forms#5` Until you leave the form, your Armor Class is 13 + your Wisdom modifier whenever that total beats the Beast's Armor Class. | angka: 13
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#5` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | angka: 1d10
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | angka: 0
- `sub|Captain/Star-Spangled Banner|Wings of Liberty#6` You have a Fly Speed of 30 feet and can hover. | angka: 30
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | angka: 60
- `sub|Cleric/Forge Domain|Blessing of the Forge#3` Armor gives +1 AC and a weapon gives +1 to attack and damage rolls. | angka: 1
- `sub|Monk/Way of the Tipsy Monkey|Adaptive Fighting#2` Using a magic item as an improvised weapon gives a bonus to attack and damage by rarity: +1 uncommon, +2 rare, +3 very rare. | angka: 1,2,3
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | angka: 2d8
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | angka: 1d6,2d6
- `sub|Monk/Warrior of the Celestial|Stabilizing Focus#2` It regains 5 Hit Points per point spent, up to half its Hit Point maximum. | angka: 5,half
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | angka: 0
- `sub|Sorcerer/Radiation Freak|Glow Cloud#2` This works like gaseous form, except your flying speed is half your speed, a creature that enters your space or starts its turn there takes 4d10 Radiant damage, and you can cast cantrips in this form. | angka: 4d10,half
- `sub|Fighter/Hell Knight|Diabolical Gift#1` Devil's Sight: you see normally in Dim Light and Darkness, magical or not, within 120 feet. | angka: 120
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | angka: 10,50,300
- `sub|Cleric/Winter Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | angka: 5
- `sub|Ranger/Swarmkeeper|Mighty Swarm#1` Gathered Swarm damage becomes 1d8. | angka: 1d8
- `sub|Barbarian/Path of the Glacier|Frostbite#1` Once per turn while Raging, when you hit with a Strength-based attack, you can release cold into the target for an extra 1d6 Cold damage. | angka: 1d6
- `sub|Cleric/Eldritch Domain|Sing the Song that Ends the World#2` It is then immune to this damage for 10 minutes. | angka: 10
- `sub|Warmage/House of Dice|Dice of Fate#3` An expended die goes to the GM, who can spend it on a D20 Test or damage roll for an NPC or monster. | angka: 1d20
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#3` A creature cannot be raised above half its Hit Point maximum this way. | angka: half
- `sub|Monk/Way of the Ascendant Dragon|Ascendant Aspect#4` You have Blindsight out to 10 feet. | angka: 10
- `sub|Druid/Circle of the Deep|Davy Jones' Locker#1` When you hit with a melee weapon attack, you can deal extra 1d8 damage. | angka: 1d8
- `sub|Wizard/Somnomancer|Somnambulist#2` Instead your Speed is halved and you have Disadvantage on D20 Tests. | angka: 1d20
- `sub|Cleric/Time Domain|Prescient Glimpses#1` You gain proficiency in Insight and Perception, and your proficiency bonus is doubled for any ability check that uses either skill. | angka: double,pb

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- class `item|dmg|Windvane#5` When you hit with it, the target takes an extra 1d6 lightning damage. -> info:ACTIVE:TRIGGER
- record `item|dmg|Jewel of Three Prayers (Exalted)#2` In ancient times, Alyxian the Apotheon bore this amulet as a symbol of his covenant with three Prime Deities: Sehanine t -> info:NUMONLY:TABLE
- class `item|dmg|Jewel of Three Prayers (Exalted)#2` In ancient times, Alyxian the Apotheon bore this amulet as a symbol of his covenant with three Prime Deities: Sehanine t -> info:NUMONLY:TABLE
- record `sub|Barbarian/Path of the Beast|Call the Hunt#4` You can use this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest. -> covered
- record `item|frafi|Orb of Damara#32` See Invisibility: 1. -> info:NUMONLY:TABLE
- class `item|frafi|Orb of Damara#32` See Invisibility: 1. -> info:NUMONLY:TABLE
- record `item|dmg|Figurine of Wondrous Power (obsidian steed)#15` After a use, you must wait 5 days before using it again. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Figurine of Wondrous Power (obsidian steed)#15` After a use, you must wait 5 days before using it again. -> info:NUMONLY:GEOMETRY
- record `sub|Warlock/Sorcerer-King Patron|Decisive Edict#3` After using this you can't use it again until a Short or Long Rest, or when you use Magical Cunning. -> covered
- class `sub|Warlock/Sorcerer-King Patron|Decisive Edict#3` After using this you can't use it again until a Short or Long Rest, or when you use Magical Cunning. -> info:REST:NONUM
- record `sub|Martyr/Burden of Ascension|Demigod Ascendant#6` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- class `sub|Martyr/Burden of Ascension|Demigod Ascendant#6` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `class|Martyr|Undying#2` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- class `class|Martyr|Undying#2` After you use this, you cannot use it again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Artificer/Magneticist|Magnetic Manipulator#6` The hand is invisible, can only handle metal objects, and can carry triple the weight. -> covered
- class `sub|Artificer/Magneticist|Magnetic Manipulator#6` The hand is invisible, can only handle metal objects, and can carry triple the weight. -> covered
- class `item|dmg|Heretic#6` Once per turn when you hit a creature with this weapon, you can expend 1 of its charges to attempt to render the target  -> info:ACTIVE:TRIGGER
- record `sub|Wizard/White Necromancer|Life Bond#3` Long Rest to use again. -> covered
- class `sub|Wizard/White Necromancer|Life Bond#3` Long Rest to use again. -> info:REST:NONUM
- record `sub|Rogue/Arcane Trickster (2014)|Spell Thief#7` You regain use after a Long Rest. -> covered
- class `sub|Rogue/Arcane Trickster (2014)|Spell Thief#7` You regain use after a Long Rest. -> info:REST:NONUM
- record `item|dmg|Devlin's Staff of Striking#8` If you attune to this staff, you transform into a goat-humanoid hybrid over the course of 3 days. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Devlin's Staff of Striking#8` If you attune to this staff, you transform into a goat-humanoid hybrid over the course of 3 days. -> info:NUMONLY:GEOMETRY
- record `species|Mandrake|Entangling Vines#6` Spring lets you target a flying creature within 30 feet of the ground and pulls it safely down. -> info:NUMONLY:GEOMETRY
- class `species|Mandrake|Entangling Vines#6` Spring lets you target a flying creature within 30 feet of the ground and pulls it safely down. -> info:NUMONLY:GEOMETRY
- record `class|Warmage|Spellcasting#3` You know four Warmage cantrips and learn more as shown in the Cantrips column. -> info:TABLE:CLASS
- class `class|Warmage|Spellcasting#3` You know four Warmage cantrips and learn more as shown in the Cantrips column. -> info:TABLE:CLASS
- record `item|dmg|Amulet of the Inferno#15` The cantrips scale based on your total character level and use Intelligence as a spellcasting modifier if you're normall -> covered
- record `species|Dragonborn (Gem)|Psionic Mind#1` You can send telepathic messages to any creature you see within 30 ft. It must understand at least one language. -> info:NUMONLY:GEOMETRY
- class `species|Dragonborn (Gem)|Psionic Mind#1` You can send telepathic messages to any creature you see within 30 ft. It must understand at least one language. -> info:NUMONLY:GEOMETRY
