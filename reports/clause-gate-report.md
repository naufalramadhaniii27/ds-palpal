# Laporan clause gate (mode laporan, 2026-11-17)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44265 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 8870 |
| Info (tag terdokumentasi) | 29120 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2689, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1355, NUMONLY:ROLL 1230, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 955, ACTIVE:OTHERS 810, BY_DESIGN 670, REST:NONUM 621, NUMONLY:FLAVOR 340, COND:PLAY_STATE 248, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 87, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 72, ACTIVE:TIMED_IMM 38, REST:LENGTH 31, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6275 |
| Uncovered dengan angka | 3666 |
| Uncovered dengan kelas kata kunci mekanik | 5880 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 395 |
| Angka yang tidak dijelaskan record mana pun | 3474 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5296 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 277 |
| Waktu | muat data 0 s, analisis 9 s |

Uji mutasi pada data nyata (seed 7): 296 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 174 ditangkap (58.8%). Hapus semua atom kelas yang dibutuhkan: 176 ditangkap (59.5%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 283 ditangkap (94.3%), semua atom kelas dihapus: 299 ditangkap (99.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| GX | 1762 |
| wxs | 1034 |
| LU_X | 717 |
| species | 511 |
| AUTO | 444 |
| ITEM_SPELLS | 354 |
| feat | 271 |
| SPELL_FX | 241 |
| cls | 155 |
| LASTCH | 145 |
| SAVE_NOTES | 91 |
| SUB_GRANT | 73 |
| FXO | 50 |
| SPELLS | 37 |
| FDMG | 13 |
| SP_AUTO | 12 |
| DEF_SUB | 8 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 201, fx-L4.js 170, fx-L12.js 150, fx-B9-advnotes.js 145, fx-L10.js 135, fx-L2.js 133, fx-L1.js 116, fx-L3.js 113, fx-N1.js 102, fx-L9.js 99, fx-L11.js 84, fx-L6.js 69.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 973 | 13.1% |
| SPELL | 3255 | 972 | 29.9% |
| DMG | 4658 | 755 | 16.2% |
| SPEED | 1419 | 602 | 42.4% |
| PROF | 1124 | 553 | 49.2% |
| ADV | 1959 | 542 | 27.7% |
| CHOICE | 1663 | 470 | 28.3% |
| RES | 1377 | 450 | 32.7% |
| IMM | 1006 | 374 | 37.2% |
| NUM | 8606 | 347 | 4.0% |
| SLOT | 1425 | 315 | 22.1% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 263 | 24.9% |
| DIS | 1221 | 252 | 20.6% |
| SENSE | 650 | 210 | 32.3% |
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
| feat | 2812 | 637 | 1479 | 0 | 696 |
| item | 19281 | 4528 | 11661 | 0 | 3092 |
| species | 1638 | 879 | 492 | 0 | 267 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2299 | 5904 | 0 | 1915 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10468 | 2487 | 6320 | 1661 | 15.9% |
| tvss | 2796 | 648 | 1635 | 513 | 18.3% |
| core | 1495 | 363 | 763 | 369 | 24.7% |
| ttoh | 1470 | 305 | 872 | 293 | 19.9% |
| tvss14 | 1201 | 202 | 744 | 255 | 21.2% |
| tsgs | 1479 | 392 | 833 | 254 | 17.2% |
| tkdm | 921 | 198 | 494 | 229 | 24.9% |
| tsdm | 1063 | 268 | 596 | 199 | 18.7% |
| tghp | 1116 | 373 | 555 | 188 | 16.8% |
| tce | 730 | 128 | 453 | 149 | 20.4% |
| au | 535 | 110 | 285 | 140 | 26.2% |
| tua24 | 634 | 172 | 330 | 132 | 20.8% |
| tdm14 | 643 | 144 | 380 | 119 | 18.5% |
| dmg14 | 540 | 153 | 288 | 99 | 18.3% |
| tgh14p | 490 | 111 | 282 | 97 | 19.8% |
| twow | 542 | 137 | 311 | 94 | 17.3% |
| phb14 | 513 | 165 | 258 | 90 | 17.5% |
| thhw | 395 | 84 | 232 | 79 | 20.0% |
| tee24 | 463 | 179 | 213 | 71 | 15.3% |
| hof | 249 | 40 | 142 | 67 | 26.9% |
| xge | 375 | 104 | 208 | 63 | 16.8% |
| rhw | 231 | 56 | 115 | 60 | 26.0% |
| tssm | 275 | 67 | 150 | 58 | 21.1% |
| egw | 365 | 94 | 214 | 57 | 15.6% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 326 | 63 | 212 | 51 | 15.6% |
| tghg | 288 | 75 | 162 | 51 | 17.7% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| tdcsr | 299 | 110 | 148 | 41 | 13.7% |
| mot | 292 | 96 | 159 | 37 | 12.7% |
| tsgeh | 183 | 60 | 88 | 35 | 19.1% |
| bmt | 489 | 78 | 379 | 32 | 6.5% |
| bgg | 207 | 61 | 121 | 25 | 12.1% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| skt | 118 | 27 | 70 | 21 | 17.8% |
| psa | 67 | 22 | 25 | 20 | 29.9% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| bdd | 62 | 12 | 30 | 20 | 32.3% |
| dsotdq | 82 | 16 | 47 | 19 | 23.2% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| abh | 53 | 13 | 23 | 17 | 32.1% |
| idrotf | 134 | 32 | 86 | 16 | 11.9% |
| wdh | 95 | 26 | 53 | 16 | 16.8% |
| wdmm | 79 | 14 | 49 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| scag | 67 | 23 | 29 | 15 | 22.4% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| ai | 164 | 24 | 127 | 13 | 7.9% |
| frafi | 81 | 22 | 46 | 13 | 16.0% |
| lfl | 33 | 16 | 5 | 12 | 36.4% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| bgdia | 114 | 27 | 75 | 12 | 10.5% |
| pabtso | 69 | 25 | 32 | 12 | 17.4% |
| vrgr | 86 | 23 | 52 | 11 | 12.8% |
| vgm | 64 | 31 | 22 | 11 | 17.2% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| tsdd | 69 | 26 | 35 | 8 | 11.6% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| psk | 38 | 21 | 11 | 6 | 15.8% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| efa | 28 | 9 | 15 | 4 | 14.3% |
| nf | 25 | 9 | 12 | 4 | 16.0% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| tdcg | 9 | 4 | 4 | 1 | 11.1% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 9230 | 278 | 8952 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| SPELL | 731 | 103 |
| RESOURCE | 674 | 559 |
| DMG | 572 | 518 |
| ADV | 532 | 182 |
| SPEED | 519 | 409 |
| PROF | 501 | 179 |
| RES | 349 | 137 |
| NUM | 347 | 347 |
| SLOT | 297 | 101 |
| CHOICE | 268 | 77 |
| IMM | 237 | 78 |
| DIS | 211 | 105 |
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


### SPELL (731 uncovered)

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

### RESOURCE (674 uncovered)

- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | number 10 no record explains
- `class|Shaman|Relentless Rage#4` Every use of this feature after the first raises the DC by 5. | no record for DC,RESOURCE; number 5 unexplained
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | no record for DC,RESOURCE; number 10 unexplained
- `feat|Draconic Rune Casting|Draconic Rune Casting#5` You can have a number of empowered runes at once equal to 1 + your Proficiency Bonus, and use them to replicate spells as the book describes. | no record for RESOURCE; number 1,pb unexplained
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#26` If the vessel drops to 0 Hit Points, you must make a new one, which takes a Long Rest. | no record for RESOURCE; number 0 unexplained
- `item|bmt|Charm of the Sun#4` After one use the charm vanishes, and you unlearn the Light cantrip gained from it. | no record for SPELL
- `item|cos|Icon of Ravenloft#14` The target regains 3d8 + 3 hit points, unless it is an undead, a construct, or a fiend. | number 3d8,3 no record explains
- `item|crcotn|Jewel of Three Prayers (Exalted)#33` - You can expend 1 of the jewel's charges (no action required) to end one of the following conditions on yourself: grappled, paralyzed, or restrained. | no record for RESOURCE; number 1 unexplained
- `item|dmg14|Ring of Water Elemental Command#6` You can expend 2 of the ring's charges to cast dominate monster on a water elemental. | number 2 no record explains
- `item|dmg|Alchemical Compendium#12` You can spend additional charges to increase the maximum dimensions by 2 feet per charge. | number 2 no record explains
- `item|dmg|Baba Yaga's Mortar and Pestle#18` When you hit with a melee attack using the pestle, you can expend up to 3 of its charges to deal an extra 1d8 force damage for each charge expended. | no record for DMG; number 1d8,3 unexplained
- `item|dmg|Beads of Contemplation#2` The beads store ki energy for later use, up to 8 ki points. | number 8 no record explains
- `item|dmg|Blackstaff#25` (Distance from Origin / Effect) 10 ft. away or closer: 8 × the number of charges in the staff. | no record for RESOURCE; number 10,8 unexplained
- `item|dmg|Blast Disk (Uncommon)#6` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Constantori's Portrait#27` If the painting has at least 1 hit point and is targeted by a mending spell, it regains 2d6 hit points. | number 2d6 no record explains
- `item|dmg|Dark Gift of Tarakamedes, the Grave Wyrm#3` At dawn, if you have not eaten at least 1 pound of them in the past 24 hours, you die. | no record for RESOURCE; number 24 unexplained
- `item|dmg|Devastation Orb of Earth#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | number 1d10 no record explains
- `item|dmg|Seed of Rebirth#1` A fist-sized seed that up to 4 creatures can attune to during a Long Rest. | no record for RESOURCE; number 4 unexplained
- `item|dmg|Staff of the Forgotten One#18` Each time a creature other than Acererak expends any of the staff's charges, there is a 50 percent chance that the life force tries to possess the staff wielder. | number 50 no record explains
- `item|dmg|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | no record for RESOURCE; number 12 unexplained
- `item|dmg|Tome of the Dragon#8` During the ritual, you and any assistants must work without interruption, resting no more than 8 hours per day. | no record for RESOURCE; number 8 unexplained
- `item|ggr|Pyroconverger#5` Each time you use the Pyroconverger, roll a d10 and add the number of times you have used it since your last long rest. | number 1d10 no record explains
- `item|ggr|Pyroconverger#6` If the total is 11 or higher, the Pyroconverger malfunctions: you take 4d6 fire damage, and you can't use the Pyroconverger again until you finish a long rest. | no record for DMG; number 4d6,11 unexplained
- `item|pota|Devastation Orb of Earth#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|tdcsr|Cabal's Ruin (Dormant)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG; number 1d6 unexplained
- `item|thhw|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|tsgs|Potion of Dragon's Breath (Very Rare)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|tsgs|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | no record for RESOURCE; number 12 unexplained
- `item|ttoh|Deadbane Heartglow Lantern#10` Each charge beyond the first adds 30 minutes and 5 feet to the detection distance. | no record for RESOURCE; number 5,30 unexplained
- `item|wbtw|Scissors of Shadow Snipping#13` If a shadowless creature is subjected to any spell that ends a curse, or if its detached shadow is reduced to 0 hit points, the detached shadow disappears, and the creature regains its normal shadow instantly. | number 0 no record explains
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | number 2 no record explains
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | no record for RESOURCE; number 1d4 unexplained
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Jaeger/Salvation Chapter|Savior's Focus#1` When an ally you can see or hear drops to 0 Hit Points, you regain 1 Adrenaline Point. | no record for RESOURCE; number 0,1 unexplained
- `sub|Sorcerer/Black Powder Sorcery|Ensuing Shot#2` Spend 6 sorcery points to attack with every pistol held by you and your mage hands instead. | no record for RESOURCE; number 6 unexplained
- `sub|Sorcerer/Nanite Host|Reboot#1` When you regain consciousness after dropping to 0 hit points, you immediately regain extra 4d6 + 4 hit points. | number 0 no record explains
- `sub|Sorcerer/Shadow Sorcery|Umbral Form#3` After you use this, you must finish a Long Rest before using it again, unless you spend 6 Sorcery Points (no action required) to restore it. | number 6 no record explains
- `sub|Wizard/School of Evocation|Overchannel#3` Each use after that before a Long Rest deals 2d12 Necrotic damage per spell level to you right after the cast, and the damage per level rises by 1d12 for each further use. | no record for DMG; number 2d12,1d12 unexplained

### DMG (572 uncovered)

- `class|Craftsman|Masterwork Weapon#3` The weapon gets a bonus to attack and damage rolls equal to your Masterwork Bonus (+1 at level 1, and it grows as shown in the table). | no record for DMG; number 1 unexplained
- `feat|Latent Psionics|Latent Psionics#4` Your Psionic Blast deals an extra 1d10 Psychic damage. | no record for DMG; number 1d10 unexplained
- `item|bgdia|Blade of Avernus#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `item|coa|Scourge of Shadow#16` When it scores a critical, its damage dice are upgraded to 3d6 instead of 3d4 for the duration of the attack. | number 3d6 no record explains
- `item|dmg|Arcane Warhead#9` Within a 10-mile-radius Sphere, each creature and object takes 10d10 + 200 Mega Radiant damage. | no record for DMG; number 10d10,10,200 unexplained
- `item|dmg|Brambleheart Quiver#2` While you are attuned, you gain +2 to attack and damage rolls with them. | no record for DMG; number 2 unexplained
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Ruinblade#7` When you hit an undead creature with it, the attack deals an extra 1d8 force damage. | no record for DMG; number 1d8 unexplained
- `item|dmg|Scourge of Shadow#17` If attacking a good aligned creature, or attacking with the weapon unattuned, the necrotic damage dice are also increased to a d6 instead of a d4. | no record for DMG; number 1d6,1d4 unexplained
- `item|dmg|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|dmg|Sling of the Tiny Giant#3` A ranged hit deals an extra 1d4 Force damage per size category the target is larger than you, up to 3d4. | number 3d4 no record explains
- `item|dmg|Stormheart Bow#7` The original target takes normal damage, and each chosen target takes 1d6 Cold damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Sulfuras, Hand of Ragnaros#4` It takes 1d10 Fire damage at the start of each of its turns instead of the normal burning damage. | no record for DMG; number 1d10 unexplained
- `item|dmg|Thaumatonic Rifle, +2#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +2 bonus to attack and damage rolls. | number 2d6,80,320 no record explains
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Wand of Wonder#18` You take 1d6 Psychic damage instead. | no record for DMG; number 1d6 unexplained
- `item|egw|Grovelthrash (Dormant)#15` If you do, you take 1d6 psychic damage. | no record for DMG; number 1d6 unexplained
- `item|frafi|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|misc14|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|tdm14|Thunder Rifle#1` A blaster (2d8 Thunder, range 150/600, Blaster, Sighted, Two-Handed) with +1 to attack and damage rolls. | number 2d8,150,600 no record explains
- `item|tghg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | no record for DMG; number 8d6 unexplained
- `item|tsgs|Starmetal Solar Axe#3` +1 to attack and damage, an extra 2d6 Fire damage, and flames shed Bright Light in a 20 ft radius and Dim Light for 20 ft more, as sunlight. | number 20 no record explains
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | number 10 no record explains
- `item|ttoh|Bloodspeed Elixir#3` If you take the Dash action while it lasts, you take 2d6 Poison damage as your body is pushed past its limits. | no record for DMG; number 2d6 unexplained
- `item|tvss14|Treant's Bane#2` A plant creature you hit takes an extra 2d6 damage of the weapon's type. | no record for DMG; number 2d6 unexplained
- `item|wdh|Blackstaff#10` On a 1, the staff retains its +2 bonus to attack and damage roll but loses all other properties. | no record for DMG; number 2 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#3` On a fail it takes 1d6 Force damage and is pushed 10 ft in a horizontal direction you choose. | no record for DMG; number 1d6,10 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Barbarian/Path of the Giant|Demiurgic Colossus#3` The extra damage from Elemental Cleaver becomes 2d6. | no record for DMG; number 2d6 unexplained
- `sub|Cleric/Dragon Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | no record for DMG; number 2d8 unexplained
- `sub|Cleric/Hunger Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Necrotic damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Lust Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Psychic damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Vermin Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 Poison damage (2d8 at level 14). | no record for DMG; number 1d8,2d8 unexplained
- `sub|Cleric/Zeal Domain (PSA)|Divine Strike#1` Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d8 damage of the same type as the weapon damage. | no record for DMG; number 1d8 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#4` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Paladin/Oath of the Annihilator|Channel Divinity#4` A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. | no record for DMG; number 1 unexplained
- `sub|Ranger/Freerunner|Momentum#1` If you move through a hostile creature's space, leave a creature's reach, or move at least 15 ft, your next weapon attack this turn deals extra 1d6 damage. | no record for DMG; number 1d6 unexplained
- `sub|Sorcerer/Spellfire Sorcery|Spellfire Burst#5` One creature you can see within 30 feet takes 1d4 Fire or Radiant damage, your choice. | no record for DMG; number 1d4,30 unexplained
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#45` Each takes 4d10 Lightning damage. | no record for DMG; number 4d10 unexplained
- `sub|Wizard/Transmuter|Wondrous Alteration#9` The damage of your new growth becomes 2d6 of the type that goes with the growth. | no record for DMG; number 2d6 unexplained

### ADV (532 uncovered)

- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | number 1 no record explains
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `item|au|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|au|Pulverizing Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|coa|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | no record for ADV; number 1,12 unexplained
- `item|crcotn|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|dmg|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Medal of Muscle#2` Doing so gives you advantage on Strength checks and Strength saving throws for 1 hour. | no record for ADV
- `item|dmg|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Rope of Climbing#6` While knotted, the rope is only 50 feet long, and it gives Advantage on ability checks made to climb with it. | no record for ADV; number 50 unexplained
- `item|dmg|Septum Ring of the Great Minotaur#2` Your Strength rises by 2 (maximum 22) and you have Advantage on Strength checks. | number 2,22 no record explains
- `item|scc|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tgh14c|Full Moon Extract#2` For 1 hour after you take it, your Strength is 19 (if lower) and you have Advantage on Strength checks and saves. | number 1,19 no record explains
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|tghg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsgs|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#6` 4 Gray: Advantage on saves against Charmed and Frightened. | no record for ADV; number 4 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|ttoh|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Druid/Circle of Blood (2014)|Rite of the Blood Moon#2` It gains Resistance to nonmagical Bludgeoning, Piercing and Slashing damage, darkvision 60 ft, Advantage on Wisdom (Perception) checks, a d8 for unarmed strike damage, a bonus-action unarmed strike after taking the Attac | no record for ADV,DMG,RES,SENSE,SPEED; number 1d8,60,10 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE; number 30 unexplained
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Witch/Fragrant Magic|Aromamancy#8` For 1 hour you have Advantage on Charisma checks to influence a creature within 5 feet of you. | no record for ADV; number 5,1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#9` As a Bonus Action, spend another slot to add 1d8 per slot level to your next bite and gain Advantage on that attack. | no record for ADV,SLOT; number 1d8 unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#5` Otherwise it gains 5 temporary hit points for 1 hour and Advantage on its next ability check, attack roll or save. | no record for ADV; number 1,5 unexplained

### SPEED (519 uncovered)

- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | no record for SPEED; number 0 unexplained
- `feat|Shock Trooper (Dark Matter)|Shock Trooper (Dark Matter)#5` In the first round of each combat, your Speed is doubled. | no record for SPEED; number double unexplained
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Aviana's Feather#2` Magic action: grow golden wings that give a Fly Speed of 80 feet. | no record for SPEED; number 80 unexplained
- `item|dmg|Bloodspeed Elixir#2` When you drink it, your speed triples for 1 minute. | no record for SPEED; number 1 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|dmg|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|dmg|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|dmg|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
- `item|dmg|Figurine of Wondrous Power (ebony fly)#18` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Horseshoes of Speed#4` When all four horseshoes are attached to one creature, that creature's Speed increases by 30 feet. | no record for SPEED; number 30,4 unexplained
- `item|dmg|Ionbreaker, the Tempest's Reach#15` Fly Speed equal to Speed, hovering within 20 ft of the ground. | number 20 no record explains
- `item|dmg|Potion of Flying#1` Drinking this potion gives you a Fly Speed equal to your Speed for 1 hour, and you can hover. | no record for SPEED; number 1 unexplained
- `item|dmg|Quaal's Feather Token (bird)#10` Flying at half that speed, it can instead carry up to 1,000 pounds. | no record for SPEED; number half unexplained
- `item|dmg|Shield of Yggdrasil#5` While planted, your Speed is 5 ft and cannot rise, and you reduce Bludgeoning, Piercing and Slashing damage from weapons and Unarmed Strikes by 3. | no record for SPEED; number 5,3 unexplained
- `item|llk|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|tee24|Thuranni Cloak#3` The effect pauses until your next turn starts when you take damage, and while your Speed is 0. | no record for SPEED; number 0 unexplained
- `item|tsgs|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|tsgs|Festerwood Claymore#3` On a natural 20, beetles swarm the target for 1d4 turns, dealing 1d6 Piercing at the start of each of its turns and halving its Speed. | no record for SPEED; number 1d4,1d6,20 unexplained
- `item|tsgs|Ring of Anchoring#6` On a fail the arm is immobile for 1 minute, your Speed is 0, and you are dragged 30 ft down at the start of each turn. | no record for SPEED; number 30,1,0 unexplained
- `item|ttoh|Victory Banner#4` When you roll a 20 on a weapon attack, you can spend 1 charge to move up to your Speed without provoking Opportunity Attacks. | no record for SPEED; number 1 unexplained
- `species|Amoeboid (DM14)|Flexible Form#6` You can speak and understand its language, and if it has a burrowing, climbing or swimming speed you gain it, up to 40 ft. You can make the same actions that creature could, other than ones needing special features. | no record for SPEED; number 40 unexplained
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | number 10 no record explains
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | no record for SPEED; number 10 unexplained
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#1` You have a merfolk form (Speed 10 ft, Swim Speed 40 ft) and a landwalker form, where your tail splits into legs. | number 40 no record explains
- `species|Siren|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 30 unexplained
- `species|Spring Mandrake|Sprightly Movement#1` Your walking Speed rises by 5 feet. | no record for SPEED; number 5 unexplained
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | no record for SPEED; number double unexplained
- `sub|Craftsman/Mechanauts' Guild|Mechanaut's Apparatus#5` Doing so costs movement equal to half its Speed, rounded down. | no record for SPEED; number half unexplained
- `sub|Druid/Circle of Mutation|Endless Evolution#4` Tremorsense 30 ft. 2 more points give a Burrow Speed equal to your Speed. | no record for SENSE,SPEED; number 30,2 unexplained
- `sub|Jaeger/Sanguine Chapter|Blood Frenzy#1` While Bloodied, your Speed increases by 20 feet, the Attack action gives you three attacks, and all Hit Points you regain from Jaeger abilities are doubled. | no record for RESOURCE; number 3,double unexplained
- `sub|Monk/Way of the Humble Elephant|Unyielding Step#2` Your speed cannot drop below 15 ft. If grappled, the grappler can use its Reaction to move with you, otherwise the grapple ends. | no record for SPEED; number 15 unexplained
- `sub|Necromancer/Reaper|Wraith Flight#2` A thrall that already flies has its Fly Speed doubled. | no record for SPEED; number double unexplained
- `sub|Paladin/Oath of Storms|Channel Divinity#6` For 1 hour you gain the benefits of water walk, and your speed doubles while you walk on water. | no record for SPEED; number 1,double unexplained
- `sub|Warden/Diabolist|Soul Broker#13` Your Speed rises by 15 feet. | no record for SPEED; number 15 unexplained
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#6` Triple jump distance and a Climb Speed equal to your Speed. | no record for SPEED; number 3 unexplained
- `sub|Witch/Sky Magic|Corvid Familiar#3` It has a Fly Speed of 50 feet, unless it already has a faster one. | no record for SPEED; number 50 unexplained

### PROF (501 uncovered)

- `class|Bard|Expertise#2` If you have proficiency in Performance and Persuasion, those two are suggested. | no record for PROF; number 2 unexplained
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | no record for PROF; number half,pb unexplained
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `class|Ranger|Expertise#1` Pick two skills you're proficient in but don't yet have Expertise in. | no record for PROF
- `class|Rogue|Expertise#3` If you're proficient in Sleight of Hand and Stealth, those two are recommended. | no record for PROF; number 2 unexplained
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | no record for PROF; number pb unexplained
- `item|bgdia|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|dmg|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|llk|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|tee24|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | number double no record explains
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `sub|Bard/College of Eloquence|Universal Speech#2` For 1 hour they magically understand you whatever language you speak. | no record for PROF
- `sub|Cleric/Time Domain|Prescient Glimpses#1` You gain proficiency in Insight and Perception, and your proficiency bonus is doubled for any ability check that uses either skill. | number double,pb no record explains
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | no record for PROF; number double,pb unexplained
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Fighter/Nightwatcher|Skilled Guardian#2` You also gain proficiency in two skills from Deception, History, Insight, Intimidation, Investigation, Perception and Stealth. | no record for PROF; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Animal Sidekick#6` The animal has Intelligence 10 and speaks one language you know. | no record for PROF; number 10 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Ranger/Grove Warden|Wrath of the Forest#1` When you take the Attack action, use a bonus action to have a rock, branch, root or similar small object strike a creature within 30 ft. You are proficient with it, it counts as magical, you add your Dexterity modifier t | no record for DMG,PROF; number 1d8,30 unexplained
- `sub|Sorcerer/Reincarnated Hero|Armored Sorcery#1` You gain proficiency with light armor, medium armor, shields and four martial weapons of your choice. | no record for CHOICE,PROF; number 4 unexplained
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | number double,pb no record explains
- `sub|Wizard/White Necromancer|Lore of Life and Death#1` You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. | number double,pb no record explains

### RES (349 uncovered)

- `item|dmg|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Campaign Field Tent#7` The tent has 50 hit points, immunity to nonmagical attacks (siege weapons excluded) and Resistance to all other damage. | no record for IMM,RES; number 50 unexplained
- `item|dmg|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `item|dmg|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|dmg|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tdcsr|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|tsgs|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|twow|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Monk/Way of the Humble Elephant|Thick Hide#1` As a bonus action, spend 5 Ki to gain Resistance to Bludgeoning, Piercing and Slashing damage for 10 minutes. | no record for RES; number 10,5 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Paladin/Oath of Safeguarding|Aura of Preservation#4` At level 18 the range is 30 ft, and friendly creatures within 10 ft have Resistance to all Bludgeoning, Piercing and Slashing damage. | no record for RES; number 30,10 unexplained
- `sub|Paladin/Oath of Winter|Channel Divinity#4` Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. | no record for RES; number 0 unexplained
- `sub|Paladin/Oath of the Ancients (2014)|Aura of Warding#1` You and friendly creatures within 10 feet have Resistance to damage from spells. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Hearth (ToH)|Roaring Fire#3` A cold creature that starts its turn within 20 ft takes 2d8 Fire damage, ignoring Fire resistance and immunity. | no record for DMG,IMM,RES; number 2d8 unexplained
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for SENSE; number 60,30 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### NUM (347 uncovered)

- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Fiend Transformation: Level 1|Fiend Transformation: Level 1#14` Charisma rises by 2 and Intelligence by 1, to a maximum of 16 from this. | number 2 no record explains
- `feat|Heavy Armor Master (2014)|Heavy Armor Master (2014)#6` While you wear Heavy armor, Bludgeoning, Piercing, and Slashing damage from nonmagical weapons is reduced by 3. | number 3 no record explains
- `feat|Hunted|Hunted#2` The constant paranoia gives you +5 to your passive Wisdom (Perception) and wakes you at once when a creature moves within 30 feet. | number 30,5 no record explains
- `feat|Martial Weapon Training|Martial Weapon Training#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|coa|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#13` - 1 major detrimental property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Brass#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Blade of Avernus#9` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power (ebony fly)#23` Challenge Rating 0 (0 experience points), Proficiency Bonus +2. | number 0,pb no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power#24` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Flashback Polaroid#1` An antique camera loaded with 1d6 + 2 blank photos. | number 1d6,2 no record explains
- `item|dmg|Hammer of Thunderbolts#13` Might of Giants: the Strength score that your Belt of Giant Strength or Gauntlets of Ogre Power gives you rises by 4, up to a maximum of 30. | number 4 no record explains
- `item|dmg|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#25` While it circles your head, your Constitution rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#41` While it circles your head, your Proficiency Bonus is 1 higher. | number 1,pb no record explains
- `item|dmg|Manual of Gainful Exercise#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Strength, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Ranseur of Torture#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +1#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2,3 no record explains
- `item|dmg|Scalehide Cream#4` A jar holds 1d6 + 1 doses. | number 1d6,1 no record explains
- `item|dmg|Shield of the Uven Rune#19` The bonus increases to +3 when the weapon is used against one of the following creature types, chosen by you at the time of the magic weapon's creation: aberrations, celestials, constructs, dragons, elementals, fey, fien | number 3 no record explains
- `item|dmg|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|idrotf|Hook of Fisher's Delight#14` It disappears after 2d4 hours or when reduced to 0 hit points. | number 2d4,0 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#9` - 2 minor beneficial properties | number 2 no record explains
- `item|misc14|Keystone of Creation#4` - 1 minor beneficial property | number 1 no record explains
- `item|misc14|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|skt|Ingot of the Skold Rune#8` Until the end of your next turn, any damage the target takes is reduced to 1, but you take half the damage prevented in this way. | number half no record explains
- `item|thhw|Kwark's Wondrous Kernels, Tossable#12` Each creature within 10 ft gains 2d4 + 2 Temporary Hit Points. | number 2d4,10,2 no record explains
- `item|tsgs|Bag of Sundrops#1` A bag holding 1d6 + 4 glowing golden orbs. | number 1d6,4 no record explains
- `item|tvss14|Jax#2` For 1 hour your Strength, Dexterity and Constitution each rise by 4, and their maximum becomes 24. | number 1,4,24 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains

### SLOT (297 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|frafi|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Druid/Circle of the Titan|Titan Form#12` If already Prone it takes 1d10 Bludgeoning per slot level. | no record for SLOT; number 1d10 unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | no record for DMG,SLOT; number 2d6,10 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Wings#2` They last 2 rounds per slot level and end early if you are Incapacitated or dismiss or replace them with a Bonus Action. | no record for SLOT; number 2 unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained

### CHOICE (268 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | number 9 no record explains
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Skilled|Skilled#1` Pick three skills or tools, in any mix. | no record for CHOICE; number 3 unexplained
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `item|tgh14p|Rod of the Pack Master#2` While holding it, choose any number of willing creatures you see within 30 ft. You can hold it in your teeth, and it works in hybrid or kindred form. | no record for CHOICE; number 30 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | no record for CHOICE; number 2 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Barbarian|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | angka: 4
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Bard|Expertise#1` Pick two of your skill proficiencies and gain Expertise in them, which doubles your Proficiency Bonus for ability checks that use those skills. | angka: pb
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Shaman|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | angka: 4
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | angka: half,pb
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Necromancer|Critical Spellcasting#5` The extra damage applies only to the creature that rolled the 1. | angka: 1
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | angka: 3
- `class|Demon Hunter|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Necromancer|Thralls#25` You still cannot raise Undead that dropped to 0 Hit Points. | angka: 0
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | angka: 2
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Captain|Cohort~2#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb

### feat (279)

- `feat|Thick-Shelled|Thick-Shelled#3` While you wear no armor, your AC is 13 + your Dexterity modifier. | angka: 13
- `feat|Poisoner|Poisoner#10` A creature that takes damage from the coated item makes a Constitution saving throw against a DC of 8 plus your Proficiency Bonus plus the modifier of the ability this feat increased. | angka: 8,pb
- `feat|Boon of Energy Resistance|Boon of Energy Resistance#8` That creature attempts a Dexterity saving throw against a DC of 8 plus your Proficiency Bonus plus your Constitution modifier, and on a failure it takes damage of that type equal to 2d12 plus your Con | angka: 2d12,8,pb
- `feat|Church of the Sun Above: Adherent|Church of the Sun Above: Adherent#4` When you damage a creature with a weapon, a spell or an Unarmed Strike, you can deal an extra 1d8 Radiant damage to it. | angka: 1d8
- `feat|Mul|Mul#7` Your hit point maximum rises by 1, and by 1 more each time you gain a level. | angka: 1
- `feat|Depth Module|Depth Module#6` Your swimming speed rises to 60 ft. | angka: 60
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | angka: 2
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Undead|Undead#3` You still spend 8 hours in light activity, such as keeping watch, to gain the benefit of a Long Rest. | angka: 8
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
- `feat|Iron Hero (2014)|Iron Hero (2014)#2` When a creature with a challenge rating above your level attacks you, you gain +2 AC. | angka: 2
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | angka: 1
- `feat|Coalition War Training|Coalition War Training#4` When you attack with a carbine held in two hands without firing it automatically, its damage becomes 2d8. | angka: 2d8,2
- `feat|Survivor (Grim Hollow)|Survivor (Grim Hollow)#2` You need only half the food per day that your size normally requires. | angka: half
- `feat|Dungeon Delver|Dungeon Delver#8` Traveling at a fast pace doesn't give the usual -5 penalty to your passive Wisdom (Perception). | angka: 5
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20

### item (1967)

- `item|dmg|Mind Lash#2` In the hands of an illithid, this magic weapon strips away a creature's will to survive as it also strips away flesh, dealing an extra 2d4 psychic damage to any target it hits. | angka: 2d4
- `item|egw|Blade of Broken Mirrors (Exalted)#14` - The saving throw DC for spells cast from the dagger increases to 17. | angka: 17
- `item|dmg|Ioun Stone, Mastery#8` Your proficiency bonus increases by 1 while this pale green prism orbits your head. | angka: pb
- `item|dmg|Spell Gem (Bloodstone)#10` Spells cast from the spell gem have a save DC of 15 and an attack bonus of +7. | angka: 15,7
- `item|tsgs|Circlet of the Huntsman's Third Eye#5` Spend 1 charge as a Bonus Action (or 1 more when casting Hunter's Mark) for Truesight 120 ft for 1 minute. | angka: 120,1
- `item|dmg|Eldritch Staff#7` For each charge you expend, the target takes an extra 1d8 lightning damage. | angka: 1d8
- `item|coa|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | angka: 20d10
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | angka: pb
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

### species (152)

- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | angka: double,pb
- `species|Human and Half-Elf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Skathári (DM14)|Hooked Claws#2` You have a climbing speed of 20 ft, and your unarmed strikes can deal Slashing damage instead of Bludgeoning. | angka: 20
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | angka: 1d4
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Tiefling Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Amoeboid|Biomimicry#3` If the target has a Burrow, Climb or Swim Speed, you gain that Speed, up to 40 feet. | angka: 40
- `species|Tauren|Horns#1` Your Unarmed Strike can deal Piercing damage equal to 1d6 plus Strength modifier instead of its normal damage. | angka: 1d6
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Dwarf|Stonecunning#1` Bonus Action: Tremorsense 60 ft for 10 minutes while on or touching stone. | angka: 60,10
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Aarakocra (Monster)|Flight#1` Fly Speed of 50 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 50
- `species|Dwarf Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | angka: 1,2
- `species|Halfling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Drow; Star Elf|Drow Subtlety#1` When you hide, conceal a weapon or take any action contested by a creature's passive Perception, you can subtract 5 from that score. | angka: 5
- `species|Dwarf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Kobold Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Avia-Ra (DM14)|Blessings of the Sun#3` While it lasts, if you roll a 4 on the d4 you add to an attack roll or save, you have Advantage on that roll. | angka: 1d4
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | angka: 16
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Cervan|Surge of Vigor#1` When one attack deals more than half of your current Hit Points in damage (even if it drops you to 0), you regain 1d12 + Constitution modifier Hit Points right away. | angka: 1d12,0,half
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage  | angka: 5
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5

### sub (951)

- `sub|Bard/College of Echoes|Alter Sound#4` Enhance: raise the volume of a sound within 30 ft, doubling its range and giving creatures in range Advantage on Perception checks to detect it. | angka: 30
- `sub|Bard/College of Dirges|Death's Friend#2` Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. | angka: 60
- `sub|Monster Hunter/Trapper Guild|Trapper Gadgets#3` Your Trapper Gadget save DC is 8 plus your Intelligence modifier plus your Proficiency Bonus. | angka: 8,pb
- `sub|Ranger/Drakewarden|Perfected Bond#7` When you or the drake take damage and are within 30 feet of each other, you can use your Reaction to give one of you Resistance to that damage. | angka: 30
- `sub|Druid/Circle of Configuration (2014)|Construct Form#7` Turret: speed 0, and when you take the Attack action you get one extra attack as a bonus action. | angka: 0
- `sub|Wizard/Dragon Mage|Invoke Dragon Wings#2` They last 2 rounds per slot level and end early if you are Incapacitated or dismiss or replace them with a Bonus Action. | angka: 2
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | angka: 2d8
- `sub|Druid/Circle of the Moon|Circle Forms#5` Until you leave the form, your Armor Class is 13 + your Wisdom modifier whenever that total beats the Beast's Armor Class. | angka: 13
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | angka: 10,half
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | angka: 0
- `sub|Captain/Star-Spangled Banner|Shield Fighter#4` Damage: 1d8 Bludgeoning plus the ability modifier used for the attack roll. | angka: 1d8
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | angka: 60
- `sub|Cleric/Twilight Domain|Eyes of Night#3` As a Magic action you can share this Darkvision for 1 hour with willing creatures you can see within 10 feet, up to your Wisdom modifier (minimum one). | angka: 10
- `sub|Monk/Way of the Tipsy Monkey|Adaptive Fighting#2` Using a magic item as an improvised weapon gives a bonus to attack and damage by rarity: +1 uncommon, +2 rare, +3 very rare. | angka: 1,2,3
- `sub|Wizard/Sangromancer|Red Renewal#1` After a Short Rest, regain expended Hit Point Dice and Sangromancy Dice equal to half your Wizard level. | angka: half
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | angka: 1d6,2d6
- `sub|Monk/Warrior of the Celestial|Stabilizing Focus#2` It regains 5 Hit Points per point spent, up to half its Hit Point maximum. | angka: 5,half
- `sub|Wizard/School of Evocation|Overchannel#3` Each use after that before a Long Rest deals 2d12 Necrotic damage per spell level to you right after the cast, and the damage per level rises by 1d12 for each further use. | angka: 2d12,1d12
- `sub|Sorcerer/Radiation Freak|Glow Cloud#2` This works like gaseous form, except your flying speed is half your speed, a creature that enters your space or starts its turn there takes 4d10 Radiant damage, and you can cast cantrips in this form. | angka: 4d10,half
- `sub|Fighter/Hell Knight|Diabolical Gift#1` Devil's Sight: you see normally in Dim Light and Darkness, magical or not, within 120 feet. | angka: 120
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | angka: 10,50,300
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | angka: 3
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | angka: 5
- `sub|Ranger/Swarmkeeper|Mighty Swarm#1` Gathered Swarm damage becomes 1d8. | angka: 1d8
- `sub|Barbarian/Path of the Glacier|Frostbite#1` Once per turn while Raging, when you hit with a Strength-based attack, you can release cold into the target for an extra 1d6 Cold damage. | angka: 1d6
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#8` 4 Disadvantage on attack rolls and Wisdom (Perception) checks. | angka: 4
- `sub|Warmage/House of Pawns|Multidiscipline#1` You add half your Proficiency Bonus, rounded down, to any saving throw that does not already use your Proficiency Bonus. | angka: pb
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | angka: 5
- `sub|Monk/Way of the Ascendant Dragon|Ascendant Aspect#4` You have Blindsight out to 10 feet. | angka: 10

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|mot|Iroas's Votary#2` You can cast crusader's mantle once, then you must finish a long rest before doing so again. -> info:REST:NONUM
- class `item|mot|Iroas's Votary#2` You can cast crusader's mantle once, then you must finish a long rest before doing so again. -> info:REST:NONUM
- record `feat|Greater Mark of Scribing|Greater Mark of Scribing#9` Once used this way, you can't again until a Long Rest. -> info:REST:NONUM
- class `feat|Greater Mark of Scribing|Greater Mark of Scribing#9` Once used this way, you can't again until a Long Rest. -> info:REST:NONUM
- record `item|tsgs|Sheer Cold#4` It turns to slick ice for 1 minute and counts as Difficult Terrain. -> info:NUMONLY:GEOMETRY
- class `item|tsgs|Sheer Cold#4` It turns to slick ice for 1 minute and counts as Difficult Terrain. -> info:NUMONLY:GEOMETRY
- record `sub|Cleric/Inquisition Domain|Inquisition Domain Spells#4` 9 Creation, Hallow. -> info:NUMONLY:TABLE
- class `sub|Cleric/Inquisition Domain|Inquisition Domain Spells#4` 9 Creation, Hallow. -> info:NUMONLY:TABLE
- record `sub|Artificer/Maverick|Arcane Prototype#15` Level 3: 1, 1, 1. -> info:NUMONLY:TABLE
- class `sub|Artificer/Maverick|Arcane Prototype#15` Level 3: 1, 1, 1. -> info:NUMONLY:TABLE
- record `sub|Martyr/Burden of Anonymity|Burden of Anonymity Spells#2` They do not count against your prepared spells. -> info:ACTIVE:OTHERS
- class `sub|Martyr/Burden of Anonymity|Burden of Anonymity Spells#2` They do not count against your prepared spells. -> info:ACTIVE:OTHERS
- record `item|dmg|Wyrmreaver Gauntlets#8` The fists last for 1 minute or until you are incapacitated. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Wyrmreaver Gauntlets#8` The fists last for 1 minute or until you are incapacitated. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Firearm Bullet, +3#2` A piece of magic ammunition of this kind takes its bonus from its rarity, and this Very Rare firearm bullet carries the  -> info:NUMONLY:FLAVOR
- class `item|dmg|Firearm Bullet, +3#2` A piece of magic ammunition of this kind takes its bonus from its rarity, and this Very Rare firearm bullet carries the  -> info:NUMONLY:FLAVOR
- record `feat|Forest Sage|Forest Sage#4` Two Spells. -> info:NUMONLY:TABLE
- class `feat|Forest Sage|Forest Sage#4` Two Spells. -> info:NUMONLY:TABLE
- record `sub|Fighter/Samurai|Strength before Death#4` You regain use after a Long Rest. -> covered
- class `sub|Fighter/Samurai|Strength before Death#4` You regain use after a Long Rest. -> info:REST:NONUM
- record `item|egw|Hide of the Feral Guardian (Awakened)#6` - When you cast the polymorph spell using this armor, you can transform into a cave bear. -> info:ACTIVE:TRIGGER
- class `item|egw|Hide of the Feral Guardian (Awakened)#6` - When you cast the polymorph spell using this armor, you can transform into a cave bear. -> info:ACTIVE:TRIGGER
- record `sub|Paladin/Oath of Zeal|Oath of Zeal Spells#4` 13 Divination, Locate Creature. -> info:NUMONLY:TABLE
- class `sub|Paladin/Oath of Zeal|Oath of Zeal Spells#4` 13 Divination, Locate Creature. -> info:NUMONLY:TABLE
- record `sub|Bard/College of Bartending|Bartender#2` You gain Insight proficiency and add your Charisma modifier (minimum +1) to Insight checks. -> covered
- record `feat|Firebrand|Firebrand#6` A Long Rest restores each. -> covered
- class `feat|Firebrand|Firebrand#6` A Long Rest restores each. -> info:REST:NONUM
- record `sub|Wizard/Materializer|Minor Creation#14` You can detonate a number of Cubes equal to your Intelligence modifier (minimum 1) per Long Rest, across any number of B -> covered
- class `sub|Wizard/Materializer|Minor Creation#14` You can detonate a number of Cubes equal to your Intelligence modifier (minimum 1) per Long Rest, across any number of B -> info:REST:NONUM
- record `item|dmg|Shield Emitter#4` Then it must recharge and cannot be used again until the next dawn. -> info:REST:NONUM
