# Laporan clause gate (mode laporan, 2026-11-17)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44265 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9021 |
| Info (tag terdokumentasi) | 29098 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2689, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1355, NUMONLY:ROLL 1230, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 954, ACTIVE:OTHERS 798, BY_DESIGN 670, REST:NONUM 621, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6146 |
| Uncovered dengan angka | 3671 |
| Uncovered dengan kelas kata kunci mekanik | 5752 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 394 |
| Angka yang tidak dijelaskan record mana pun | 3477 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5160 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 268 |
| Waktu | muat data 7 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 294 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 162 ditangkap (55.1%). Hapus semua atom kelas yang dibutuhkan: 163 ditangkap (55.4%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 280 ditangkap (93.3%), semua atom kelas dihapus: 296 ditangkap (98.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3346 |
| GX | 1875 |
| wxs | 1060 |
| LU_X | 717 |
| species | 511 |
| AUTO | 444 |
| ITEM_SPELLS | 354 |
| feat | 287 |
| SPELL_FX | 241 |
| cls | 155 |
| LASTCH | 145 |
| SAVE_NOTES | 88 |
| SUB_GRANT | 73 |
| FXO | 50 |
| SPELLS | 37 |
| FDMG | 13 |
| SP_AUTO | 12 |
| DEF_SUB | 8 |
| CLS_AUTO | 7 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 291, fx-L5.js 201, fx-L4.js 173, fx-L12.js 169, fx-L10.js 143, fx-L2.js 133, fx-L1.js 115, fx-L3.js 113, fx-N1.js 104, fx-L9.js 99, fx-L11.js 90, fx-L6.js 69.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 973 | 13.1% |
| SPELL | 3255 | 972 | 29.9% |
| DMG | 4658 | 755 | 16.2% |
| SPEED | 1419 | 602 | 42.4% |
| PROF | 1124 | 553 | 49.2% |
| CHOICE | 1663 | 470 | 28.3% |
| RES | 1377 | 441 | 32.0% |
| ADV | 1959 | 431 | 22.0% |
| IMM | 1006 | 370 | 36.8% |
| NUM | 8606 | 346 | 4.0% |
| SLOT | 1425 | 315 | 22.1% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 263 | 24.9% |
| DIS | 1221 | 239 | 19.6% |
| SENSE | 650 | 210 | 32.3% |
| AC | 677 | 168 | 24.8% |
| SAVE | 278 | 153 | 55.0% |
| HP | 206 | 112 | 54.4% |
| NUM-DICE | 1628 | 77 | 4.7% |
| ABIL | 383 | 74 | 19.3% |
| INIT | 129 | 62 | 48.1% |
| NUM-DIST | 5577 | 43 | 0.8% |
| NUM-DUR | 3526 | 38 | 1.1% |
| NUM-PCT | 74 | 1 | 1.4% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1186 | 249 | 632 | 0 | 305 |
| feat | 2812 | 641 | 1476 | 0 | 695 |
| item | 19281 | 4547 | 11661 | 0 | 3073 |
| species | 1638 | 879 | 492 | 0 | 267 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2427 | 5885 | 0 | 1806 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10468 | 2496 | 6320 | 1652 | 15.8% |
| tvss | 2796 | 674 | 1631 | 491 | 17.6% |
| core | 1495 | 363 | 763 | 369 | 24.7% |
| ttoh | 1470 | 314 | 870 | 286 | 19.5% |
| tsgs | 1479 | 398 | 832 | 249 | 16.8% |
| tvss14 | 1201 | 222 | 741 | 238 | 19.8% |
| tkdm | 921 | 214 | 493 | 214 | 23.2% |
| tsdm | 1063 | 279 | 593 | 191 | 18.0% |
| tghp | 1116 | 380 | 554 | 182 | 16.3% |
| tce | 730 | 137 | 452 | 141 | 19.3% |
| au | 535 | 114 | 285 | 136 | 25.4% |
| tua24 | 634 | 179 | 327 | 128 | 20.2% |
| tdm14 | 643 | 147 | 380 | 116 | 18.0% |
| dmg14 | 540 | 153 | 288 | 99 | 18.3% |
| tgh14p | 490 | 114 | 282 | 94 | 19.2% |
| twow | 542 | 137 | 311 | 94 | 17.3% |
| phb14 | 513 | 168 | 257 | 88 | 17.2% |
| thhw | 395 | 85 | 232 | 78 | 19.7% |
| tee24 | 463 | 180 | 213 | 70 | 15.1% |
| hof | 249 | 40 | 142 | 67 | 26.9% |
| xge | 375 | 104 | 208 | 63 | 16.8% |
| rhw | 231 | 57 | 115 | 59 | 25.5% |
| egw | 365 | 94 | 214 | 57 | 15.6% |
| tssm | 275 | 71 | 150 | 54 | 19.6% |
| coa | 158 | 44 | 60 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 326 | 64 | 212 | 50 | 15.3% |
| tghg | 288 | 76 | 162 | 50 | 17.4% |
| oota | 87 | 21 | 20 | 46 | 52.9% |
| tdcsr | 299 | 110 | 148 | 41 | 13.7% |
| mot | 292 | 96 | 159 | 37 | 12.7% |
| tsgeh | 183 | 61 | 88 | 34 | 18.6% |
| bmt | 489 | 78 | 379 | 32 | 6.5% |
| bgg | 207 | 61 | 121 | 25 | 12.1% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| skt | 118 | 27 | 70 | 21 | 17.8% |
| psa | 67 | 22 | 25 | 20 | 29.9% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| bdd | 62 | 12 | 30 | 20 | 32.3% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| dsotdq | 82 | 19 | 46 | 17 | 20.7% |
| abh | 53 | 13 | 23 | 17 | 32.1% |
| idrotf | 134 | 32 | 86 | 16 | 11.9% |
| wdmm | 79 | 14 | 49 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| wdh | 95 | 27 | 53 | 15 | 15.8% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
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
| tsdd | 69 | 27 | 34 | 8 | 11.6% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| psk | 38 | 21 | 11 | 6 | 15.8% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| nf | 25 | 9 | 12 | 4 | 16.0% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
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
| SPEED | 519 | 409 |
| PROF | 501 | 179 |
| ADV | 421 | 184 |
| RES | 347 | 138 |
| NUM | 346 | 346 |
| SLOT | 297 | 101 |
| CHOICE | 268 | 77 |
| IMM | 235 | 79 |
| DIS | 198 | 107 |
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

### SPEED (519 uncovered)

- `class|Barbarian|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | no record for SPEED; number 10 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#44` - Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed. | no record for SPEED; number 30 unexplained
- `item|dmg14|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Bobbing Lily Pad#6` It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Broom of Flying#4` It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Couatl Herald's Scales#8` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Doomhammer#6` While your Rage is active your Speed doubles and you can take one extra Attack action on each turn (one attack only). | no record for SPEED; number double unexplained
- `item|dmg|Mechanical Wonder (Gyrocopter)#11` The gyrocopter wonder is a Huge object that weighs 500 pounds and has the following statistics: AC 14, HP 50, Speed 5 ft., and Fly Speed 20 ft. The gyrocopter can bear up to 2,000 pounds of cargo; if it bears any more th | no record for SPEED; number 5,20,14,50 unexplained
- `item|dmg|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|dmg|Precipit, the Formless#10` Resist Bludgeoning and Slashing, +10 ft Speed, Swim Speed equal to your Speed, walk on liquid, and redirect a melee miss against you. | no record for SPEED; number 10 unexplained
- `item|dmg|Quaal's Feather Token#24` That wind can fill the sails of a single ship and add 5 miles per hour to that ship's speed for 8 hours. | no record for SPEED; number 5,8 unexplained
- `item|dmg|Shield of Yggdrasil#5` While planted, your Speed is 5 ft and cannot rise, and you reduce Bludgeoning, Piercing and Slashing damage from weapons and Unarmed Strikes by 3. | no record for SPEED; number 5,3 unexplained
- `item|dmg|Sprinting Legs#1` Graft (donor: a creature with Speed 60+ ft). | no record for SPEED; number 60 unexplained
- `item|dmg|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it mu | no record for DC,DMG,SPEED; number 3d8,90,5,15 unexplained
- `item|dmg|Victory Banner#4` When you roll a 20 on a weapon attack, you can spend 1 charge to move up to your Speed without provoking Opportunity Attacks. | no record for SPEED; number 1 unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for SPEED; number 1 unexplained
- `item|egw|Stormgirdle (Awakened)#7` - While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|tgh14p|Ardor#4` As a bonus action you can let it hover in an open space within 5 ft. While you see it, a bonus action commands it to fly 50 ft and either attack once or return to your hands. | no record for SPEED; number 5,50 unexplained
- `item|tsdm|Hoverboard#3` While riding it, your Speed rises by 10 ft, you ignore Difficult Terrain, and you can cross liquids without sinking. | no record for SPEED; number 10 unexplained
- `item|tsdm|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | no record for SPEED; number 60 unexplained
- `item|tsgs|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tvss|Sprinting Legs#1` Graft (donor: a creature with Speed 60+ ft). | no record for SPEED; number 60 unexplained
- `species|Aarakocra (Monster)|Flight#1` Fly Speed of 50 ft. You cannot use it while wearing Medium or Heavy armor. | no record for SPEED; number 50 unexplained
- `species|Accursed|Heritage Traits#4` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Arisen|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Gnoll|Rampage#1` When you reduce a creature to 0 Hit Points with a melee attack on your turn, you can use a Bonus Action to move up to half your Speed and make a bite attack. | no record for SPEED; number 0,half unexplained
- `species|Skathári (DM14)|Gliding Wings#2` While falling, you can move up to 10 ft horizontally for every 5 ft you fall, up to your speed. | no record for SPEED; number 10,5 unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | no record for SPEED; number 5 unexplained
- `sub|Cleric/Prophecy Domain|Channel Divinity: One Move Ahead#1` Use Channel Divinity to add 20 ft to your Speed for rounds equal to your cleric level. | no record for SPEED; number 20 unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Martyr/Burden of Odyssey|Argonaut#3` When it ends, you are not Incapacitated and your Speed is not 0. | no record for SPEED; number 0 unexplained
- `sub|Paladin/Oath of Winter|Channel Divinity#7` On a failure it takes 2d6 Cold damage per point of your Proficiency Bonus and its speed is halved until the start of your next turn. | no record for DMG,SPEED; number 2d6,pb unexplained
- `sub|Ranger/Freerunner|Nimble Dodge#1` When an area effect would make you take a saving throw, use your reaction to move up to half your speed, possibly out of the area. | no record for SPEED; number half unexplained
- `sub|Ranger/Winter Trapper|Tripped Defenses#4` Right after, you can either make one weapon or Unarmed Strike attack against it or move up to half your Speed without provoking Opportunity Attacks from it. | no record for SPEED; number half unexplained
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#7` Your only movement is a 60 ft Fly Speed, and you can hover. | no record for SPEED; number 60 unexplained
- `sub|Vagabond/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Warlock/The Parasite|Physical Specimen#5` Your jumps triple and you gain a climb speed equal to your walking speed. | no record for SPEED; number 3 unexplained
- `sub|Wizard/Fumaturge|Smoke Animals#3` The smoke familiar has 1 HP and a Fly Speed of 60 ft whatever the Beast form. | no record for SPEED; number 60,1 unexplained

### PROF (501 uncovered)

- `class|Bard|Expertise~2#2` If you have proficiency in Performance and Persuasion, those two are suggested. | no record for PROF; number 2 unexplained
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Ranger|Expertise#1` Pick two skills you're proficient in but don't yet have Expertise in. | no record for PROF
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Reptiloid|Reptiloid#3` It is a ranged attack with range 30 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|dmg|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|llk|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|tdm14|Finger Picks#4` If you are proficient with Thieves' Tools, you add +2 to ability checks made with them. | number 2 no record explains
- `item|tsgs|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | no record for CHOICE,PROF; number 2 unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Mechagnome|Specialized Design#1` Proficiency with two tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Spring Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `sub|Captain/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Cleric/Knowledge Domain (PSA)|Blessings of Knowledge#2` You gain proficiency in two of these skills: Arcana, History, Nature, or Religion. | number 2 no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#8` The familiar gains proficiency in any two skills or tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `sub|Ranger/Grove Warden|Wrath of the Forest#1` When you take the Attack action, use a bonus action to have a rock, branch, root or similar small object strike a creature within 30 ft. You are proficient with it, it counts as magical, you add your Dexterity modifier t | no record for DMG,PROF; number 1d8,30 unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | number double,pb no record explains
- `sub|Wizard/Necrophage|Memory of Flesh#4` If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. | no record for CHOICE,PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|Lore of Life and Death#1` You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. | number double,pb no record explains
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | no record for PROF; number 5,6 unexplained

### ADV (421 uncovered)

- `class|Rogue|Sneak Attack#2` Once per turn, if you have Advantage on an attack roll that uses a Finesse or Ranged weapon and the attack hits a creature, you can deal an extra 1d6 damage to that creature. | no record for ADV
- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | number 1 no record explains
- `feat|Floriographer|Floriographer#5` You have Advantage on Intelligence (Investigation) and Wisdom (Insight) checks to notice and read hidden visual messages, such as the runes of a magic trap or subtle hand signals between two people. | no record for ADV; number 2 unexplained
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `item|dmg|Greatsword of the Craven#2` While attuned you gain 5 ft of speed and Advantage on initiative. | no record for ADV,INIT,SPEED; number 5 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `species|Shade (ToH)|Ghostly Flesh#3` You gain a Fly Speed of 30 feet with hover, Resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks not made with silvered weapons, Advantage on checks and saves to escape a grapple or the Restrai | no record for ADV,RES
- `sub|Bard/College of Investigation|Quick Read#3` On a success pick one, lasting 1 minute: it has Disadvantage on attack rolls against you, you have Advantage on saves against its spells and magical effects, or you have Advantage on attack rolls against it. | no record for ADV,CHOICE,DIS; number 1 unexplained
- `sub|Cleric/Knowledge Domain|Divine Foreknowledge#2` For 1 hour, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `sub|Dancer/Shadow Dancer|Vengeful Shadow#2` You have Advantage on attacks against a creature covered this way, and when you hit one, you deal an extra 1d6 Necrotic damage. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Fighter/Scofflaw|Blindside#1` Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. | no record for ADV,DMG; number 5d6 unexplained
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#12` Acumen (Celestial, Fiend, Fey): 1 hour, Advantage on Wisdom (Insight) checks and on one chosen skill, Intimidation or Persuasion. | no record for ADV
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of Safeguarding|Redoubtable Defender#5` A creature charge within 5 ft is immune to nonmagical Bludgeoning, Piercing and Slashing damage and has Advantage on all saves. | no record for ADV,IMM; number 5 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Rogue/Inquisitive|Steady Eye#1` You have Advantage on Wisdom (Perception) and Intelligence (Investigation) checks if you move no more than half your Speed on the same turn. | no record for ADV,SPEED; number half unexplained
- `sub|Rogue/Smuggler|Dab-handed Dealer#4` Cunning Action can fund a check to control a vehicle, or a Sleight of Hand check to conceal a light weapon on you, opposed by Perception of creatures within 5 ft. On a success you have Advantage on your next attack again | no record for ADV; number 5 unexplained
- `sub|Rogue/Thief (2014)|Supreme Sneak#1` You have Advantage on a Dexterity (Stealth) check if you move no more than half your Speed on the same turn. | no record for ADV,SPEED; number half unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/Ancient Dragons|Ascended Blessing#7` Draconic Senses: Blindsight 15 ft and Advantage on Perception checks. | no record for ADV,SENSE; number 15 unexplained
- `sub|Warlock/The GM|OP Class Feature#2` You have Advantage on all attack rolls, ability checks and saving throws, and you roll three d20s and take the highest instead of two. | no record for ADV; number 3,2 unexplained
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/Void Caster|Void Affinity#1` You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint. | no record for ADV; number double unexplained

### RES (347 uncovered)

- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | number 10 no record explains
- `sub|Paladin/Oath of the Elements|Aura of Resistance#2` You and friendly creatures within 10 ft have Resistance to that damage. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Haunted|Become Death#3` While you have any, you have Resistance to all damage, a fly speed of 30 ft, and can move through creatures and objects if you end in an open space. | no record for RES,SPEED; number 30 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warlock/Primordial|Adaptive Shroud#2` If you also spend a spell slot, the Resistance lasts a number of rounds equal to your Proficiency Bonus. | no record for RES,SLOT; number pb unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | no record for RES,SPELL; number 30 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained

### NUM (346 uncovered)

- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | number 1 no record explains
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#10` Dexterity rises by 2 and Charisma by 1, to a maximum of 16 from this. | number 2 no record explains
- `item|bgg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|coa|Ruby Rod of Asmodeus#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#23` One horn becomes a +1 lance, and the other becomes a +2 longsword. | number 1,2 no record explains
- `item|dmg14|Horn of Valhalla, Bronze#6` A bronze horn summons 4d4 + 4 berserkers. | number 4d4,4 no record explains
- `item|dmg|Adze of Annam#6` - 2 minor detrimental properties | number 2 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Deck of Many Things#18` You can't lower a score that is 5 or less. | number 5 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Gloves of Missile Snaring#2` If this lowers the damage to 0 and the ammunition or weapon is small enough to hold in that hand, you can catch it. | number 0 no record explains
- `item|dmg|Ioun Stone#25` While it circles your head, your Constitution rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#32` While it circles your head, your Wisdom rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#61` While it circles your head, your Strength rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Jax#2` For 1 hour, your Strength and Dexterity each rise by 2, to a maximum of 22. | number 1,2 no record explains
- `item|dmg|Manual of Quickness of Action#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Dexterity, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Robe of Serpents#2` The robe is emblazoned with 1d4 + 3 stylized serpents, all brightly colored. | number 1d4,3 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#11` - 1 minor detrimental property | number 1 no record explains
- `item|misc14|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|misc14|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|tsgs|Dragon's Call#2` You also get +1 to Intelligence, Wisdom and Charisma checks about dragon lore. | number 1 no record explains
- `item|tvss14|Aqua Fortis#5` On a weapon it gives a permanent, cumulative -1 to damage (at -5 it is destroyed). | number 1,5 no record explains
- `item|tvss14|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `sub|Barbarian/Path of the Wrecker (2014)|Crush, Smash, Bash#1` While raging, when you hit a construct or a creature wearing armor with a melee weapon attack, you can give the armor or construct a cumulative -1 penalty to the AC it gives, up to -4. | number 1,4 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Captain/Star Wolf|Target Designation#2` It gains no benefit from Half or Three-Quarters Cover and has a -2 penalty to AC. | number 2,3,half no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#2` You and your allies inside get +5 on Dexterity (Stealth) and Wisdom (Perception) checks, and flames inside cannot be seen from outside. | number 5 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains

### SLOT (297 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|thhw|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|twow|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|twow|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `sub|Druid/Circle of Entropy|Catastrophic Power#3` Magic action and a spell slot: burst in a 10-ft-radius Sphere at a point within 60 ft. Pick Acid, Cold, Fire or Lightning. | no record for SLOT
- `sub|Druid/Circle of the Titan|Titan Form#12` If already Prone it takes 1d10 Bludgeoning per slot level. | no record for SLOT; number 1d10 unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/School of Black Powder|Improved Arcane Arms#1` Arcane Arms gains new options, and you can spend a spell slot of 2nd level or higher to regain Arcane Arms uses equal to half the slot level. | no record for RESOURCE,SLOT; number half unexplained

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
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#2` Choose a second at level 5, from the ones left or from the three marked level 5. | no record for CHOICE; number 3 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#4` Choose three maneuvers to learn from the Maneuver Options section of this subclass. | no record for CHOICE; number 3 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (125)

- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Ranger|Roving#1` Your Speed goes up by 10 feet as long as you aren't wearing Heavy armor. | angka: 10
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Bard|Jack of All Trades#1` When you make an ability check that uses a skill proficiency you don't have and that doesn't already use your Proficiency Bonus, you can add half your Proficiency Bonus to it, rounded down. | angka: half,pb
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | angka: double,pb
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Martyr|Divine Respite#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
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
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | angka: 2
- `class|Vagabond|Last Stand#1` When damage drops you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Vagabond level. | angka: 0,double

### feat (278)

- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 5,20
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | angka: 2
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | angka: 1
- `feat|Upgraded|Upgraded#4` As a Magic action, you can swap your Thermalsight for Blindsight with a range of 10 feet or Darkvision with a range of 120 feet. | angka: 10,120
- `feat|Boon of Looming Shadows|Boon of Looming Shadows#4` When you take the Attack action, your reach with melee weapon attacks increases by 10 feet until the end of your turn. | angka: 10
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | angka: 30
- `feat|Pyromaniac (Dark Matter)|Pyromaniac (Dark Matter)#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | angka: 2
- `feat|Gift of the Gem Dragon|Gift of the Gem Dragon#5` It makes a Strength saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Boon of Recovery|Boon of Recovery#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Mage Slayer|Mage Slayer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 20
- `feat|Impaired Vision|Impaired Vision#5` You have blindsight 10 feet. | angka: 10
- `feat|Lakshay: Oni|Lakshay: Oni#8` You can add your Proficiency Bonus to one damage roll or saving throw you make, or to your AC against one attack that hits you, which may turn the hit into a miss. | angka: pb
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | angka: 1d4
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | angka: 20
- `feat|Greater Mark of Storm|Greater Mark of Storm#6` When you cast Gust of Wind with Storm Magic (no slot), you also gain a Fly Speed of 60 feet for the spell's duration. | angka: 60
- `feat|Ember of the Fire Giant|Ember of the Fire Giant#9` Each creature of your choice in a 15-foot-radius sphere centered on you makes a Dexterity saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 15,8,pb
- `feat|Laser Swordmaster|Laser Swordmaster#2` While you wield an antimatter dagger, laser halfsword or laser sword you are proficient with, and a creature hits you with a ranged blaster attack or one of those weapons, you can use your reaction to | angka: pb
- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#5` Your bite deals 2d8 damage. | angka: 2d8
- `feat|Mounted Combatant|Mounted Combatant#2` Pick Strength, Dexterity, or Wisdom and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | angka: 10
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | angka: 5
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Convincing Inquisitor|Convincing Inquisitor#6` When you succeed on a Wisdom (Insight) check made with the Search action to detect lies or evasion, you have Advantage on Initiative rolls for combat against that creature for 1 hour. | angka: 1
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | angka: 30
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | angka: 4,3
- `feat|Revenant Blade|Revenant Blade#6` While you hold a double-bladed scimitar in two hands, you gain a +1 bonus to AC. | angka: 1,2,double

### item (1967)

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
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | angka: 8
- `item|crcotn|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | angka: 2d4,2
- `item|dmg|Thaumatonic Rifle, +1#1` A standard carbine (2d6 Radiant, range 80/320, Blaster, Automatic, Two-Handed) with a +1 bonus to attack and damage rolls. | angka: 2d6,80,320
- `item|dmg|Portfolio Keeper#1` At rank 2, you gain the use of a weathered leather pouch that is an uncommon magic item. | angka: 2
- `item|dmg|Indorius's Crown (Master)#14` Curse: with no Friendly creature within 10 ft, you have Disadvantage on attack rolls and cannot concentrate. | angka: 10
- `item|dmg|Blackstaff#20` If you fail to avoid the effect, you take force damage equal to 16 × the number of charges in the staff. | angka: 16

### species (152)

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
- `species|Skathári (DM14)|Hooked Claws#2` You have a climbing speed of 20 ft, and your unarmed strikes can deal Slashing damage instead of Bludgeoning. | angka: 20
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Avia-Ra (DM14)|Blessings of the Sun#3` While it lasts, if you roll a 4 on the d4 you add to an attack roll or save, you have Advantage on that roll. | angka: 1d4
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | angka: 10
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | angka: 16
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Human Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Pluvenn|Nocturnal/Diurnal#1` You have Darkvision 60 ft. A Long Rest takes you only 4 hours. | angka: 4
- `species|Kobold Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Aetherborn (Gifted)|Drain Life#1` Natural attack that deals 1d6 Necrotic damage and restores the same number of Hit Points to you. | angka: 1d6
- `species|Gnome Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Elf (Fey)|Elven Lineage (Fey)#5` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Mapach|Expert Climbers#1` Climb Speed 20 feet. | angka: 20
- `species|Bugbear (2014)|Surprise Attack#1` Once per combat, if you surprise a creature and hit it on your first turn, the attack deals an extra 2d6 damage. | angka: 2d6
- `species|Drow Heritage|Poison Bite#1` When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. | angka: 1d6,3d6

### sub (955)

- `sub|Psion/Psykinetic|Heightened Telekinesis#1` You can cast Telekinesis without a spell slot by spending four Psionic Energy Dice. | angka: 4
- `sub|Demon Hunter/Demon Hunter|Spectral Sight#1` You have Blindsight out to 10 feet. | angka: 10
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | angka: 1
- `sub|Monk/Warrior of the Celestial|Soul-Searching Strike#1` When you touch a creature or hit it with an Unarmed Strike, spend 1 Focus Point (no action) to look into its soul. | angka: 1
- `sub|Captain/Skull Banner|Undead Cohort#1` Instead of initiating a normal Cohort, you can perform an 8-hour ritual, which can happen during a Long Rest, to animate an Undead Cohort. | angka: 8
- `sub|Paladin/Oath of the Watchers|Mortal Bulwark#2` Truesight to 120 feet. | angka: 120
- `sub|Cleric/Twilight Domain|Eyes of Night#1` You have Darkvision with a range of 300 feet. | angka: 300
- `sub|Monk/Way of the Humble Elephant|Unyielding Step#2` Your speed cannot drop below 15 ft. If grappled, the grappler can use its Reaction to move with you, otherwise the grapple ends. | angka: 15
- `sub|Wizard/Wand Wizard|Craft Wands#4` Charges equal the slot levels spent divided by the spell's level, plus 1. | angka: 1
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | angka: 1d6,2d6
- `sub|Monk/Warrior of Pride|Ever Prideful#2` In it, you cannot be made Unconscious, you can't speak, you can't cast or concentrate on spells, and a Critical Hit adds only 1 Death Saving Throw failure instead of 2. | angka: 1,2
- `sub|Wizard/School of Abjuration|Arcane Ward#2` Its Hit Point maximum is twice your Wizard level plus your Intelligence modifier. | angka: double
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | angka: 2
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | angka: double,pb
- `sub|Paladin/Oath of Revelry|Aura of Fraternity#1` While at least one ally is adjacent to you, you and each ally within 5 ft deal extra 1d4 damage on melee attacks. | angka: 1d4,5
- `sub|Cleric/Void Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | angka: 5
- `sub|Ranger/Beast Master (2014)|Bestial Fury#1` When you command your beast to take the Attack action, it can make two attacks, or use Multiattack if it has that action. | angka: 2
- `sub|Barbarian/Path of the Glacier|Frostbite#1` Once per turn while Raging, when you hit with a Strength-based attack, you can release cold into the target for an extra 1d6 Cold damage. | angka: 1d6
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#5` 1 Can't speak or cast spells with Verbal components. | angka: 1
- `sub|Warmage/House of Darts|Dagger Climb#2` You gain a Climb Speed equal to your Speed for 10 minutes. | angka: 10
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Knowledge Domain (2014)|Blessings of Knowledge#2` You gain proficiency in two of these skills: Arcana, History, Nature, or Religion. | angka: 2
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | angka: 2
- `sub|Druid/Circle of the City|City Shape#5` On each of your turns you can raise up to three low walls (2.5 ft high, 5 ft wide, 1 ft deep, giving a Medium creature cover). | angka: 5,2
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | angka: 30
- `sub|Cleric/Speed Domain|Quickness of the Gods#1` Your Speed rises by another 5 ft. As a reaction or bonus action, you can raise your Dexterity score by 10 until the end of the current turn. | angka: 10
- `sub|Monk/Way of the Bow|Serenity of The Wind#1` As a bonus action, spend 1 ki to gain blindsight out to 120 ft until the end of your next turn. | angka: 120,1
- `sub|Rogue/Underfoot|Spellcasting#2` You learn shillelagh and two other druid cantrips, and another at level 10. | angka: 2
- `sub|Vagabond/Yellow Sign|Nightmarish Glow#1` While your Pallid Aura is active, you and your allies in its Emanation deal an extra 1d6 Psychic damage when hitting an enemy with a weapon or an Unarmed Strike. | angka: 1d6

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `sub|Rogue/Soulknife|Psychic Veil#5` After using this feature, you regain the use when you finish a Long Rest, or earlier by expending one Psionic Energy Die -> info:REST:NONUM
- class `sub|Rogue/Soulknife|Psychic Veil#5` After using this feature, you regain the use when you finish a Long Rest, or earlier by expending one Psionic Energy Die -> info:REST:NONUM
- record `sub|Cleric/Machine Domain|Machine Domain Spells#4` 9 Animate Objects, Simulation. -> info:NUMONLY:TABLE
- class `sub|Cleric/Machine Domain|Machine Domain Spells#4` 9 Animate Objects, Simulation. -> info:NUMONLY:TABLE
- record `item|tdcsr|Titanstone Knuckles (Awakened)#5` Finish a long rest to use that again. -> info:REST:NONUM
- class `item|tdcsr|Titanstone Knuckles (Awakened)#5` Finish a long rest to use that again. -> info:REST:NONUM
- record `item|dmg|Rod of the Pack Master#4` With Stage 1 of the Lycanthrope you can use it in your teeth in hybrid or kindred form. -> info:NUMONLY:TEXT
- class `item|dmg|Rod of the Pack Master#4` With Stage 1 of the Lycanthrope you can use it in your teeth in hybrid or kindred form. -> info:NUMONLY:TEXT
- record `item|dmg|Amulet of Equilibrium#3` When you deal Cold, Fire or Lightning damage to only one creature, spend any number of charges to reroll that many damag -> info:REST:NONUM
- class `item|dmg|Amulet of Equilibrium#3` When you deal Cold, Fire or Lightning damage to only one creature, spend any number of charges to reroll that many damag -> info:REST:NONUM
- record `item|skt|Pennant of the Vind Rune#11` Once you use this property, you can't use it again until you finish a short or long rest. -> info:REST:NONUM
- class `item|skt|Pennant of the Vind Rune#11` Once you use this property, you can't use it again until you finish a short or long rest. -> info:REST:NONUM
- record `item|oota|Spell Gem (Amber)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- class `item|oota|Spell Gem (Amber)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- record `species|Khoravar|Lethargy Resilience#2` After using this, you can't do so again until you finish 1d4 Long Rests. -> info:NUMONLY:ROLL
- class `species|Khoravar|Lethargy Resilience#2` After using this, you can't do so again until you finish 1d4 Long Rests. -> info:NUMONLY:ROLL
- record `item|dmg|Memento of the Shapeless#14` After 12 hours you can use this again. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Memento of the Shapeless#14` After 12 hours you can use this again. -> info:NUMONLY:GEOMETRY
- record `sub|Bard/College of Glamour (2014)|Unbreakable Majesty#6` You regain use after a Short or Long Rest. -> covered
- class `sub|Bard/College of Glamour (2014)|Unbreakable Majesty#6` You regain use after a Short or Long Rest. -> info:REST:NONUM
- record `item|tvss|Draconis Fundamentum#9` Once used, it returns after a Long Rest, or spend the listed Hit Point Dice (no action) to restore it. -> info:REST:NONUM
- class `item|tvss|Draconis Fundamentum#9` Once used, it returns after a Long Rest, or spend the listed Hit Point Dice (no action) to restore it. -> info:REST:NONUM
- record `sub|Warlock/The Great Machine|Indestructible Life#4` Short or Long Rest to use again. -> covered
- class `sub|Warlock/The Great Machine|Indestructible Life#4` Short or Long Rest to use again. -> info:REST:NONUM
- record `sub|Rogue/House Agent|House Insignia#8` If you lose the insignia, your house delivers a new one by the time you finish a Long Rest. -> covered
- class `sub|Rogue/House Agent|House Insignia#8` If you lose the insignia, your house delivers a new one by the time you finish a Long Rest. -> info:REST:NONUM
- record `class|Monk|Uncanny Metabolism#1` As you roll Initiative, you can choose to regain every expended Focus Point. -> info:REST:NONUM
- class `class|Monk|Uncanny Metabolism#1` As you roll Initiative, you can choose to regain every expended Focus Point. -> info:REST:NONUM
- record `item|tftyp|Bracelet of Rock Magic#2` Once the spell has been cast three times, the bracelet can no longer cast it. -> info:NUMONLY:TEXT
- class `item|tftyp|Bracelet of Rock Magic#2` Once the spell has been cast three times, the bracelet can no longer cast it. -> info:NUMONLY:TEXT
