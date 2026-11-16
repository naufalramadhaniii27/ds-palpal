# Laporan clause gate (mode laporan, 2026-11-16)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44265 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8551 |
| Info (tag terdokumentasi) | 29132 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2689, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1355, NUMONLY:ROLL 1230, NUMONLY:TABLE 1019, FORM:TABLE 979, ACTIVE:TRIGGER 957, ACTIVE:OTHERS 814, BY_DESIGN 670, REST:NONUM 622, NUMONLY:FLAVOR 340, COND:PLAY_STATE 249, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 88, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 73, ACTIVE:TIMED_IMM 38, REST:LENGTH 32, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6582 |
| Uncovered dengan angka | 3667 |
| Uncovered dengan kelas kata kunci mekanik | 6187 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 395 |
| Angka yang tidak dijelaskan record mana pun | 3474 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5622 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 280 |
| Waktu | muat data 8 s, analisis 11 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 175 ditangkap (58.5%). Hapus semua atom kelas yang dibutuhkan: 178 ditangkap (59.5%). Selftest sintetis: lulus.

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
| item | 3344 |
| GX | 1627 |
| wxs | 905 |
| LU_X | 722 |
| species | 510 |
| AUTO | 442 |
| ITEM_SPELLS | 354 |
| SPELL_FX | 241 |
| feat | 212 |
| cls | 155 |
| LASTCH | 145 |
| SAVE_NOTES | 91 |
| SUB_GRANT | 66 |
| FXO | 50 |
| SPELLS | 37 |
| FDMG | 13 |
| SP_AUTO | 12 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 201, fx-L4.js 170, fx-L12.js 148, fx-L2.js 133, fx-L10.js 132, fx-L3.js 113, fx-L1.js 112, fx-N1.js 101, fx-L9.js 94, fx-L11.js 84, fx-L6.js 69, fx-Z2.js 67.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| SPELL | 3255 | 975 | 30.0% |
| RESOURCE | 7405 | 972 | 13.1% |
| DMG | 4658 | 755 | 16.2% |
| PROF | 1124 | 644 | 57.3% |
| ADV | 1959 | 620 | 31.6% |
| SPEED | 1419 | 607 | 42.8% |
| RES | 1377 | 519 | 37.7% |
| CHOICE | 1663 | 476 | 28.6% |
| IMM | 1006 | 403 | 40.1% |
| NUM | 8606 | 347 | 4.0% |
| SLOT | 1425 | 315 | 22.1% |
| DIS | 1221 | 297 | 24.3% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 263 | 24.9% |
| SENSE | 650 | 211 | 32.5% |
| AC | 677 | 168 | 24.8% |
| SAVE | 278 | 153 | 55.0% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1628 | 77 | 4.7% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 64 | 49.6% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 38 | 1.1% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 249 | 632 | 0 | 305 |
| feat | 2812 | 514 | 1485 | 0 | 813 |
| item | 19281 | 4528 | 11661 | 0 | 3092 |
| species | 1638 | 824 | 492 | 0 | 322 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2158 | 5910 | 0 | 2050 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10468 | 2487 | 6320 | 1661 | 15.9% |
| tvss | 2796 | 635 | 1636 | 525 | 18.8% |
| core | 1495 | 350 | 763 | 382 | 25.6% |
| ttoh | 1470 | 233 | 872 | 365 | 24.8% |
| tvss14 | 1201 | 174 | 746 | 281 | 23.4% |
| tsgs | 1479 | 386 | 834 | 259 | 17.5% |
| tkdm | 921 | 181 | 495 | 245 | 26.6% |
| tsdm | 1063 | 251 | 596 | 216 | 20.3% |
| tghp | 1116 | 355 | 555 | 206 | 18.5% |
| tce | 730 | 125 | 453 | 152 | 20.8% |
| tdm14 | 643 | 111 | 380 | 152 | 23.6% |
| tua24 | 634 | 154 | 331 | 149 | 23.5% |
| au | 535 | 109 | 285 | 141 | 26.4% |
| tgh14p | 490 | 105 | 282 | 103 | 21.0% |
| dmg14 | 540 | 150 | 288 | 102 | 18.9% |
| phb14 | 513 | 154 | 258 | 101 | 19.7% |
| twow | 542 | 136 | 311 | 95 | 17.5% |
| thhw | 395 | 82 | 232 | 81 | 20.5% |
| tee24 | 463 | 170 | 215 | 78 | 16.8% |
| hof | 249 | 32 | 143 | 74 | 29.7% |
| xge | 375 | 97 | 208 | 70 | 18.7% |
| rhw | 231 | 52 | 115 | 64 | 27.7% |
| tssm | 275 | 66 | 150 | 59 | 21.5% |
| egw | 365 | 94 | 214 | 57 | 15.6% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 326 | 63 | 212 | 51 | 15.6% |
| tghg | 288 | 75 | 162 | 51 | 17.7% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| tdcsr | 299 | 110 | 148 | 41 | 13.7% |
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
| SPELL | 732 | 103 |
| RESOURCE | 673 | 557 |
| ADV | 610 | 183 |
| PROF | 591 | 179 |
| DMG | 572 | 518 |
| SPEED | 523 | 411 |
| RES | 417 | 137 |
| NUM | 347 | 347 |
| SLOT | 297 | 101 |
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


### SPELL (732 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Death Knight|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | no record for SPELL; number 4 unexplained
- `feat|Impaired Vision|Impaired Vision#7` You can cast spells that need you to see a target or area if it is within 30 feet, you have a direct line to it, and you can hear it if it is a creature. | no record for SPELL; number 30 unexplained
- `feat|Initiate of High Sorcery|Initiate of High Sorcery#5` You learn one Wizard cantrip and two 1st-level spells, chosen from your moon's list. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tsgs|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/Madness Domain|Channel Divinity: Temporary Insanity#3` Roll a d20: 1-5 Aphasia, it cannot speak, cast spells or understand others. | no record for SPELL; number 1d20,1,5 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained

### RESOURCE (673 uncovered)

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
- `item|tvss|Goodberry Wine#3` You regain 10 HP and the drink feeds you for one day. | no record for RESOURCE; number 10,1 unexplained
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
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
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
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|tsdm|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|tsgs|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|ttoh|Emperor's Garlic#7` Eat a raw clove as an action to gain Resistance to Poison damage and Advantage on saves against Poisoned for 1 hour, but Disadvantage on all Deception and Persuasion checks for that time. | no record for ADV,DIS,RES; number 1 unexplained
- `item|tvss14|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `species|Avia-Ra (DM14)|Blessings of the Sun#3` While it lasts, if you roll a 4 on the d4 you add to an attack roll or save, you have Advantage on that roll. | no record for ADV,ATK; number 1d4 unexplained
- `sub|Barbarian/Path of the Fin|Blood Sense#2` You have Advantage on checks to track a creature you damaged in the last 24 hours. | no record for ADV; number 24 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | no record for ADV,SPEED; number 30 unexplained
- `sub|Fighter/Rune Knight|Rune Carver#21` Advantage on Wisdom (Insight) checks and Darkvision 120 feet. | no record for ADV,SENSE; number 120 unexplained
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Hearth (ToH)|Aura of the Hearth#1` You and friendly creatures within 10 ft have Advantage on saves against spells and effects that deal Cold damage. | no record for ADV; number 10 unexplained
- `sub|Warlock/The GM|OP Class Feature#2` You have Advantage on all attack rolls, ability checks and saving throws, and you roll three d20s and take the highest instead of two. | no record for ADV; number 3,2 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### PROF (591 uncovered)

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
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tsgs|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|tvss14|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
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

### SPEED (523 uncovered)

- `class|Demon Hunter|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | no record for SPEED; number 10 unexplained
- `feat|Vampiric Exultation|Vampiric Exultation#4` While transformed you have a flying speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Aviana's Feather#2` Magic action: grow golden wings that give a Fly Speed of 80 feet. | no record for SPEED; number 80 unexplained
- `item|dmg|Carpet of Flying, 4 ft. × 6 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|dmg|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Figurine of Wondrous Power#25` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Greaves of Dendallen#9` Once removed, your Speed is 0 and rises by 5 ft every 24 hours until normal. | no record for SPEED; number 5,24,0 unexplained
- `item|dmg|Pixie Dust#2` The recipient gains a flying speed of 30 feet and the ability to hover for 1 minute. | no record for SPEED; number 30,1 unexplained
- `item|dmg|Quaal's Feather Token, Swan Boat#6` The boat is self-propelled and moves across water at a speed of 6 miles per hour. | no record for SPEED; number 6 unexplained
- `item|dmg|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|dmg|Tectonic Gauntlets#12` You gain a 30 ft Burrow Speed through nonmagical, unworked earth and stone without disturbing it. | no record for SPEED; number 30 unexplained
- `item|dmg|Wheel of Wind and Water#2` If a wheel of wind and water is mounted on a mundane sailing ship, a creature with the Mark of Storm who is using the wheel can create an area of ideal conditions around the vessel, increasing its speed by 5 miles per ho | no record for SPEED; number 5 unexplained
- `item|dmg|Workshop Wrecker#1` When this 3-inch-diameter metal ball is activated as a Magic action, it moves at a rapid speed, bouncing off walls and defying any attempts to capture it. | no record for SPEED; number 3 unexplained
- `item|mot|Potion of Aqueous Form#5` You have a swimming speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|tgh14p|Ardor#4` As a bonus action you can let it hover in an open space within 5 ft. While you see it, a bonus action commands it to fly 50 ft and either attack once or return to your hands. | no record for SPEED; number 5,50 unexplained
- `item|tsgs|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `species|Aasimar (Protector)|Radiant Soul#1` From level 3, Action, once per Long Rest: for 1 minute you gain a Fly Speed of 30 ft. Once on each of your turns you deal extra Radiant damage equal to your level to one target you damage with an attack or a spell. | no record for DMG
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | no record for SPEED; number 0 unexplained
- `species|Wechselkind|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Bard/College of Dance|Inspiring Movement#2` You then move a distance of up to half your Speed. | no record for SPEED; number half unexplained
- `sub|Bard/College of Tactics|Setting the Board#1` As a bonus action, command up to three willing allies who see or hear you to use their Reactions to move up to half their speed without provoking opportunity attacks. | no record for SPEED; number 3,half unexplained
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | no record for SPEED; number 5 unexplained
- `sub|Cleric/Moon Domain|Channel Divinity: Blessing of the Full Moon#1` Action: bless a willing creature within 30 ft with one of several moon blessings, such as +10 ft Speed and tracking by smell for 1 hour, or a pack-tactics style bonus for 10 minutes. | no record for SPEED; number 30,10,1,10 unexplained
- `sub|Druid/Circle of Mutation|Mutate Shape#9` Fly Speed 30 ft. 2 more points make it 60 ft. Darkvision (1). | no record for SENSE,SPEED; number 30,60,2,1 unexplained
- `sub|Druid/Circle of the Titan|Titan Form#16` Energizing Pollen: spend a level 1+ slot and move up to half Speed without Opportunity Attacks, healing each creature you pass within 5 feet for 2d6 per slot level, once per creature per turn. | no record for SLOT,SPEED; number 2d6,5,half unexplained
- `sub|Fighter/Arcane Archer|Masterful Shots#1` When a creature you can see misses you with an attack roll, you can use your Reaction to move up to half your Speed away from the attacker without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Fighter/Champion|Remarkable Athlete#2` Also, right after you score a Critical Hit, you can move a distance up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | no record for SPEED; number 0 unexplained
- `sub|Monk/Warrior of Intoxication|Leap to Your Feet#1` Standing up from Prone costs you 5 feet of movement instead of half your Speed. | no record for SPEED; number 5,half unexplained
- `sub|Monk/Way of Concordant Motion|Cooperative Ki#4` Step of the Wind: spend 1 extra Ki so one ally you see within 30 ft can use a Reaction to move up to half its speed without opportunity attacks. | no record for SPEED; number 30,1,half unexplained
- `sub|Necromancer/Crone|Baba Yaga [Lichdom]#7` While you hold it, you have a Fly Speed of 60 feet unless you wear Medium or Heavy armor. | no record for SPEED; number 60 unexplained
- `sub|Paladin/Oath of Storms|Channel Divinity#6` For 1 hour you gain the benefits of water walk, and your speed doubles while you walk on water. | no record for SPEED; number 1,double unexplained
- `sub|Paladin/Oath of Vengeance|Relentless Avenger#2` When your Opportunity Attack hits a creature, you can reduce that creature's Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Rogue/Assassin|Infiltration Expertise#4` Using Steady Aim doesn't reduce your Speed to 0. | no record for SPEED; number 0 unexplained
- `sub|Sorcerer/Aberrant Mind|Revelation in Flesh#8` A Swim Speed of twice your Speed and underwater breathing. | no record for SPEED; number double unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained

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

### NUM (347 uncovered)

- `feat|Athlete|Athlete#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | number 2,1 no record explains
- `feat|Hunted|Hunted#2` The constant paranoia gives you +5 to your passive Wisdom (Perception) and wakes you at once when a creature moves within 30 feet. | number 30,5 no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgg|Glowrune Pigment#1` This set of 1d4 + 2 small paint pots contains pigments mixed from crushed luminescent gemstones. | number 1d4,2 no record explains
- `item|coa|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#13` - 1 major detrimental property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Brass#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Deck of Several Things#45` You take a -1 penalty on saving throws for the duration of the adventure. | number 1 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | number 0,pb no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#25` While it circles your head, your Constitution rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#41` While it circles your head, your Proficiency Bonus is 1 higher. | number 1,pb no record explains
- `item|dmg|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +1#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2,3 no record explains
- `item|dmg|Scourge of Shadow#10` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|idrotf|Hook of Fisher's Delight#14` It disappears after 2d4 hours or when reduced to 0 hit points. | number 2d4,0 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#9` - 2 minor beneficial properties | number 2 no record explains
- `item|misc14|Keystone of Creation#4` - 1 minor beneficial property | number 1 no record explains
- `item|misc14|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|misc14|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|thhw|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | number 2d4,10,2 no record explains
- `item|tvss14|Jax#2` For 1 hour your Strength, Dexterity and Constitution each rise by 4, and their maximum becomes 24. | number 1,4,24 no record explains
- `sub|Barbarian/Path of the Wrecker (2014)|Crush, Smash, Bash#1` While raging, when you hit a construct or a creature wearing armor with a melee weapon attack, you can give the armor or construct a cumulative -1 penalty to the AC it gives, up to -4. | number 1,4 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Captain/Star Wolf|Target Designation#2` It gains no benefit from Half or Three-Quarters Cover and has a -2 penalty to AC. | number 2,3,half no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#2` You and your allies inside get +5 on Dexterity (Stealth) and Wisdom (Perception) checks, and flames inside cannot be seen from outside. | number 5 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains

### SLOT (297 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|skt|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|twow|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Druid/Circle of the Moon|Moonlight Step#5` Expending a level 2+ spell slot (no action required) also restores one use per slot. | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Druid/Circle of the Titan|Titan Form#12` If already Prone it takes 1d10 Bludgeoning per slot level. | no record for SLOT; number 1d10 unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained

### CHOICE (268 uncovered)

- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | number 9 no record explains
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | no record for CHOICE; number 2 unexplained
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tgh14p|Rod of the Pack Master#2` While holding it, choose any number of willing creatures you see within 30 ft. You can hold it in your teeth, and it works in hybrid or kindred form. | no record for CHOICE; number 30 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | no record for CHOICE; number double,pb unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Druid/Circle of the Obelisk|Evolutionary#3` One ability score of your choice on that creature rises by the roll, to a maximum of 20, for 1 minute. | no record for CHOICE; number 1 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | no record for CHOICE; number 3 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Familiar Master (2014)|Arcane Evolution#2` Choose a beast with CR no higher than half the slot's level. | no record for CHOICE; number half unexplained
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Warmage|Arcane Surge Improvement#1` You gain one additional use of Arcane Surge, for a total of three. | angka: 3
- `class|Necromancer|Critical Spellcasting#5` The extra damage applies only to the creature that rolled the 1. | angka: 1
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | angka: 3
- `class|Demon Hunter|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Necromancer|Thralls#25` You still cannot raise Undead that dropped to 0 Hit Points. | angka: 0
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
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
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | angka: 2
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Alchemist|Bombs#9` To count them instead, you make 10 + twice your Alchemist level after each Short or Long Rest. | angka: 10,double
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3
- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | angka: 1

### feat (277)

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
- `feat|Dungeon Delver|Dungeon Delver#8` Traveling at a fast pace doesn't give the usual -5 penalty to your passive Wisdom (Perception). | angka: 5
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Ulitharid's Might|Ulitharid's Might#5` You have Telepathy with a range of 10 feet, or +10 feet if you already have it. | angka: 10
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Greater Mark of Shadow|Greater Mark of Shadow#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Illithid Thrallmaker|Illithid Thrallmaker#5` You have Telepathy with a range of 10 feet, or +10 feet if you already have it. | angka: 10
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Inner Resilience|Inner Resilience#5` If you already have ki points, your ki point maximum rises by 3 instead. | angka: 3
- `feat|Boon of Truesight|Boon of Truesight#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | angka: 1d4
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | angka: 4

### item (1967)

- `item|llk|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | angka: double,pb
- `item|dmg|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | angka: 1
- `item|ttoh|Tumblesafe Heartglow Lantern#5` A creature touching it can use an action to infuse it, lowering that creature's hit point maximum by its Proficiency Bonus until it finishes a rest, and the lantern gains charges equal to that amount. | angka: pb
- `item|dmg|Corrupted Ashbringer#5` The sword is sentient (Int 14, Wis 17, Cha 17, hearing and Darkvision 120 ft, speaks Common and Dwarvish, telepathy with its wielder). | angka: 120,14,17
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | angka: 18
- `item|dmg|Spiked Shield#5` Apply your Proficiency Bonus and Strength modifier to the attack roll. | angka: pb
- `item|tsgs|Dragon-Kindled Edge#2` +3 to attack and damage rolls, +2d6 damage against Dragons, and you know Draconic. | angka: 2d6
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnera | angka: 0,12,20
- `item|tsdm|Axe of the Mother Tree#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | angka: 1,2,3
- `item|toa|Bookmark#8` The range of the spell increases to 90 feet but it targets only spiders that are beasts. | angka: 90
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | angka: half,double
- `item|dmg|Scourge of Shadow#13` - 1 major detrimental property | angka: 1
- `item|twow|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | angka: 60,30,12
- `item|dmg|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | angka: 15
- `item|dmg|Stormgirdle (Exalted)#5` - Your Strength score becomes 25 if it isn't already 25 or higher. | angka: 25
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | angka: 2
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | angka: 24
- `item|dmg|Thwackstaff#2` You get +1 to Charisma (Performance) checks to entertain with it. | angka: 1
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | angka: 1d6,4
- `item|tsdm|Spiked Skin#4` The damage becomes 2d4 at level 5, 3d4 at level 11 and 4d4 at level 17. | angka: 2d4,1d4
- `item|egw|Arcane Cannon#9` In addition, a creature that fails its saving throw takes 11 (2d10) acid damage at the start of each of its turns; a creature can end this damage by using its action to wash off the acid with a pint o | angka: 2d10,11
- `item|tsgs|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | angka: 2
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | angka: 8
- `item|crcotn|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | angka: 2d4,2
- `item|dmg|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | angka: 2d6,80,320
- `item|dmg|Portfolio Keeper#1` At rank 2, you gain the use of a weathered leather pouch that is an uncommon magic item. | angka: 2
- `item|dmg|Indorius's Crown (Master)#14` Curse: with no Friendly creature within 10 ft, you have Disadvantage on attack rolls and cannot concentrate. | angka: 10
- `item|dmg|Blackstaff#20` If you fail to avoid the effect, you take force damage equal to 16 × the number of charges in the staff. | angka: 16
- `item|twow|Helm of Domination#10` Truesight 120 feet. | angka: 120
- `item|skt|Pennant of the Vind Rune#21` You gain a bonus to speed of 5 feet while you wear the armor, and if it normally imposes disadvantage on Stealth checks, it no longer does so. | angka: 5

### species (153)

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
- `species|Skathári (DM14)|Gliding Wings#2` While falling, you can move up to 10 ft horizontally for every 5 ft you fall, up to your speed. | angka: 10,5
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Amoeboid (DM14)|Flexible Form#6` You can speak and understand its language, and if it has a burrowing, climbing or swimming speed you gain it, up to 40 ft. You can make the same actions that creature could, other than ones needing sp | angka: 40
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Vect (DM14)|Embedded Armor#3` Velocity Plating: speed +5 ft and long jump +5 ft. Composite Plating: AC 13 + your Dexterity modifier. | angka: 5,13
- `species|Spring Mandrake|Sprightly Movement#1` Your walking Speed rises by 5 feet. | angka: 5
- `species|Human Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Pluvenn|Nocturnal/Diurnal#1` You have Darkvision 60 ft. A Long Rest takes you only 4 hours. | angka: 4
- `species|Kobold Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Aetherborn (Gifted)|Drain Life#1` Natural attack that deals 1d6 Necrotic damage and restores the same number of Hit Points to you. | angka: 1d6
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Drow Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6

### sub (952)

- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | angka: 2d8
- `sub|Druid/Circle of the Moon|Circle Forms#5` Until you leave the form, your Armor Class is 13 + your Wisdom modifier whenever that total beats the Beast's Armor Class. | angka: 13
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#5` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | angka: 1d10
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | angka: 0
- `sub|Captain/Star-Spangled Banner|Shield Fighter#4` Damage: 1d8 Bludgeoning plus the ability modifier used for the attack roll. | angka: 1d8
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | angka: 60
- `sub|Cleric/Twilight Domain|Eyes of Night#3` As a Magic action you can share this Darkvision for 1 hour with willing creatures you can see within 10 feet, up to your Wisdom modifier (minimum one). | angka: 10
- `sub|Monk/Way of the Tipsy Monkey|Adaptive Fighting#2` Using a magic item as an improvised weapon gives a bonus to attack and damage by rarity: +1 uncommon, +2 rare, +3 very rare. | angka: 1,2,3
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | angka: 2d8
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | angka: 1d6,2d6
- `sub|Monk/Warrior of the Celestial|Stabilizing Focus#2` It regains 5 Hit Points per point spent, up to half its Hit Point maximum. | angka: 5,half
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | angka: 0
- `sub|Sorcerer/Radiation Freak|Glow Cloud#2` This works like gaseous form, except your flying speed is half your speed, a creature that enters your space or starts its turn there takes 4d10 Radiant damage, and you can cast cantrips in this form. | angka: 4d10,half
- `sub|Fighter/Hell Knight|Diabolical Gift#1` Devil's Sight: you see normally in Dim Light and Darkness, magical or not, within 120 feet. | angka: 120
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | angka: 10,50,300
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | angka: 3
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | angka: 5
- `sub|Ranger/Swarmkeeper|Mighty Swarm#1` Gathered Swarm damage becomes 1d8. | angka: 1d8
- `sub|Barbarian/Path of the Glacier|Frostbite#1` Once per turn while Raging, when you hit with a Strength-based attack, you can release cold into the target for an extra 1d6 Cold damage. | angka: 1d6
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#8` 4 Disadvantage on attack rolls and Wisdom (Perception) checks. | angka: 4
- `sub|Warmage/House of Dice|Dice of Fate#3` An expended die goes to the GM, who can spend it on a D20 Test or damage roll for an NPC or monster. | angka: 1d20
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | angka: 5
- `sub|Monk/Way of the Ascendant Dragon|Ascendant Aspect#4` You have Blindsight out to 10 feet. | angka: 10
- `sub|Druid/Circle of the Deep|Davy Jones' Locker#1` When you hit with a melee weapon attack, you can deal extra 1d8 damage. | angka: 1d8
- `sub|Wizard/Somnomancer|Somnambulist#2` Instead your Speed is halved and you have Disadvantage on D20 Tests. | angka: 1d20
- `sub|Cleric/Speed Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | angka: 1d8
- `sub|Monk/Way of the Four Fists|Grasp of The Monkey#2` You have a climbing speed equal to your walking speed and double your jump distance. | angka: double
- `sub|Sorcerer/Draconic Sorcery|Draconic Resilience#2` Your Hit Point maximum goes up by 3, and it goes up by 1 more each time you gain another Sorcerer level. | angka: 3,1
- `sub|Warden/Beastblood Guardian|Wild Pounce#1` Once per turn, when you hit a Large or smaller creature with a Melee weapon or an Unarmed Strike, it takes an extra 1d8 Slashing damage and has the Prone condition. | angka: 1d8

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|idrotf|Cauldron of Plenty#10` It then ceases to function until the next dawn, when it regains all its uses. -> info:REST:NONUM
- class `item|idrotf|Cauldron of Plenty#10` It then ceases to function until the next dawn, when it regains all its uses. -> info:REST:NONUM
- record `sub|Psion/Psykinetic|Psykinetic Spells#4` 7 Otiluke's Resilient Sphere, Stone Shape. -> info:NUMONLY:TABLE
- class `sub|Psion/Psykinetic|Psykinetic Spells#4` 7 Otiluke's Resilient Sphere, Stone Shape. -> info:NUMONLY:TABLE
- record `item|crcotn|Jewel of Three Prayers (Exalted)#27` Three delicate spires unfurl from the jewel's center, like the buds of flowers opening in the spring. -> info:NUMONLY:TABLE
- class `item|crcotn|Jewel of Three Prayers (Exalted)#27` Three delicate spires unfurl from the jewel's center, like the buds of flowers opening in the spring. -> info:NUMONLY:TABLE
- record `sub|Artificer/Magneticist|Magnetic Manipulator#6` The hand is invisible, can only handle metal objects, and can carry triple the weight. -> covered
- class `sub|Artificer/Magneticist|Magnetic Manipulator#6` The hand is invisible, can only handle metal objects, and can carry triple the weight. -> covered
- record `item|dmg|Pennant of the Vind Rune#26` You can also cast feather fall once from the item, and you regain the ability to do so when you finish a short or long r -> info:REST:NONUM
- class `item|dmg|Pennant of the Vind Rune#26` You can also cast feather fall once from the item, and you regain the ability to do so when you finish a short or long r -> info:REST:NONUM
- record `sub|Warlock/Astral Griffon Patron|Astral Missile#1` You can cast Magic Missile with no slot a number of times equal to your Charisma modifier (minimum 1) per Long Rest. -> covered
- class `sub|Warlock/Astral Griffon Patron|Astral Missile#1` You can cast Magic Missile with no slot a number of times equal to your Charisma modifier (minimum 1) per Long Rest. -> info:REST:NONUM
- record `sub|Dancer/Dramaturge|Spellcasting#1` You cast Bard spells using Charisma. -> covered
- record `item|dmg|Whelm#3` Attack rolls and damage rolls you make with this magic warhammer gain a +3 bonus. -> info:NUMONLY:ROLL
- class `item|dmg|Whelm#3` Attack rolls and damage rolls you make with this magic warhammer gain a +3 bonus. -> info:NUMONLY:ROLL
- record `sub|Ranger/Fey Wanderer (2014)|Fey Reinforcements#4` When you start casting it you can drop the Concentration requirement, making the duration 1 minute. -> info:NUMONLY:GEOMETRY
- class `sub|Ranger/Fey Wanderer (2014)|Fey Reinforcements#4` When you start casting it you can drop the Concentration requirement, making the duration 1 minute. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Eyes of Charming#4` Each day at dawn, the lenses regain all their expended charges. -> info:REST:NONUM
- class `item|dmg|Eyes of Charming#4` Each day at dawn, the lenses regain all their expended charges. -> info:REST:NONUM
- record `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#3` 7 Divination, Locate Creature. -> info:NUMONLY:TABLE
- class `sub|Sorcerer/Ancestral Sorcery|Ancestral Spells#3` 7 Divination, Locate Creature. -> info:NUMONLY:TABLE
- record `sub|Artificer/Maverick|Arcane Prototype#8` You regain all spent charges on a Long Rest. -> info:REST:NONUM
- class `sub|Artificer/Maverick|Arcane Prototype#8` You regain all spent charges on a Long Rest. -> info:REST:NONUM
- record `item|dmg|Eye of the Bookwurm#4` After the first use you can change the phrase freely for 1 hour. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Eye of the Bookwurm#4` After the first use you can change the phrase freely for 1 hour. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Sentinel Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> covered
- class `item|dmg|Sentinel Dragonmark Channel#4` It cannot be used again until you finish a Long Rest. -> info:REST:NONUM
- record `feat|Ooze Transformation: Stage 3|Ooze Transformation: Stage 3#1` Stage 3. -> info:NUMONLY:TABLE
- class `feat|Ooze Transformation: Stage 3|Ooze Transformation: Stage 3#1` Stage 3. -> info:NUMONLY:TABLE
- record `species|Hexblood|Eerie Token#5` The token lasts until you finish a Long Rest. -> info:REST:NONUM
