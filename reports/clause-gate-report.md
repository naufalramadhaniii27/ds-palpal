# Laporan clause gate (mode laporan, 2026-11-17)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9201 |
| Info (tag terdokumentasi) | 29086 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2686, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1351, NUMONLY:ROLL 1228, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 951, ACTIVE:OTHERS 798, BY_DESIGN 670, REST:NONUM 621, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5962 |
| Uncovered dengan angka | 3565 |
| Uncovered dengan kelas kata kunci mekanik | 5570 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 392 |
| Angka yang tidak dijelaskan record mana pun | 3374 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4974 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 264 |
| Waktu | muat data 0 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 169 ditangkap (56.5%). Hapus semua atom kelas yang dibutuhkan: 167 ditangkap (55.9%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 269 ditangkap (89.7%), semua atom kelas dihapus: 296 ditangkap (98.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| GX | 1966 |
| wxs | 1069 |
| LU_X | 721 |
| species | 525 |
| AUTO | 444 |
| ITEM_SPELLS | 356 |
| feat | 322 |
| SPELL_FX | 241 |
| cls | 169 |
| LASTCH | 145 |
| SAVE_NOTES | 88 |
| SUB_GRANT | 71 |
| FXO | 50 |
| SPELLS | 37 |
| sub | 26 |
| FDMG | 13 |
| SP_AUTO | 12 |
| DEF_SUB | 8 |
| CLS_AUTO | 7 |
| RULE | 7 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 294, fx-L5.js 201, fx-L4.js 173, fx-L12.js 169, fx-L10.js 147, fx-L2.js 133, fx-L1.js 116, fx-L3.js 113, fx-N1.js 104, fx-L9.js 99, fx-L11.js 90, fx-L6.js 69.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 964 | 13.0% |
| SPELL | 3255 | 959 | 29.5% |
| DMG | 4658 | 703 | 15.1% |
| SPEED | 1411 | 577 | 40.9% |
| PROF | 1124 | 493 | 43.9% |
| CHOICE | 1663 | 435 | 26.2% |
| ADV | 1959 | 425 | 21.7% |
| RES | 1375 | 422 | 30.7% |
| IMM | 1004 | 363 | 36.2% |
| NUM | 8604 | 344 | 4.0% |
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
| class | 1186 | 272 | 631 | 0 | 283 |
| feat | 2812 | 678 | 1475 | 0 | 659 |
| item | 19265 | 4621 | 11653 | 0 | 2991 |
| species | 1638 | 892 | 492 | 0 | 254 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2460 | 5883 | 0 | 1775 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2534 | 6316 | 1610 | 15.4% |
| tvss | 2788 | 674 | 1629 | 485 | 17.4% |
| core | 1495 | 402 | 762 | 331 | 22.1% |
| ttoh | 1470 | 320 | 870 | 280 | 19.0% |
| tsgs | 1479 | 404 | 831 | 244 | 16.5% |
| tvss14 | 1201 | 224 | 741 | 236 | 19.7% |
| tkdm | 921 | 221 | 492 | 208 | 22.6% |
| tsdm | 1063 | 284 | 592 | 187 | 17.6% |
| tghp | 1116 | 383 | 554 | 179 | 16.0% |
| tce | 730 | 143 | 452 | 135 | 18.5% |
| au | 535 | 117 | 285 | 133 | 24.9% |
| tua24 | 634 | 179 | 327 | 128 | 20.2% |
| tdm14 | 643 | 148 | 380 | 115 | 17.9% |
| dmg14 | 540 | 155 | 288 | 97 | 18.0% |
| tgh14p | 490 | 114 | 282 | 94 | 19.2% |
| twow | 542 | 141 | 311 | 90 | 16.6% |
| phb14 | 513 | 173 | 256 | 84 | 16.4% |
| thhw | 395 | 91 | 232 | 72 | 18.2% |
| tee24 | 463 | 185 | 213 | 65 | 14.0% |
| hof | 249 | 45 | 142 | 62 | 24.9% |
| xge | 375 | 110 | 208 | 57 | 15.2% |
| rhw | 231 | 60 | 115 | 56 | 24.2% |
| egw | 365 | 96 | 214 | 55 | 15.1% |
| tssm | 275 | 71 | 150 | 54 | 19.6% |
| coa | 158 | 45 | 60 | 53 | 33.5% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| tghg | 288 | 76 | 162 | 50 | 17.4% |
| misc14 | 326 | 66 | 212 | 48 | 14.7% |
| oota | 87 | 22 | 20 | 45 | 51.7% |
| tdcsr | 299 | 110 | 148 | 41 | 13.7% |
| mot | 292 | 96 | 159 | 37 | 12.7% |
| tsgeh | 183 | 61 | 88 | 34 | 18.6% |
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
| abh | 53 | 13 | 23 | 17 | 32.1% |
| psa | 67 | 27 | 24 | 16 | 23.9% |
| wdmm | 79 | 14 | 49 | 16 | 20.3% |
| idrotf | 134 | 33 | 86 | 15 | 11.2% |
| wdh | 95 | 27 | 53 | 15 | 15.8% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| crcotn | 96 | 36 | 46 | 14 | 14.6% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
| ai | 164 | 24 | 127 | 13 | 7.9% |
| frafi | 81 | 22 | 46 | 13 | 16.0% |
| lfl | 33 | 16 | 5 | 12 | 36.4% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| vrgr | 86 | 23 | 52 | 11 | 12.8% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| pabtso | 69 | 26 | 32 | 11 | 15.9% |
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
| imr | 186 | 3 | 181 | 2 | 1.1% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| eepc | 9 | 8 | 0 | 1 | 11.1% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| psd | 5 | 4 | 0 | 1 | 20.0% |
| tdcg | 9 | 4 | 4 | 1 | 11.1% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 9230 | 278 | 8952 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| SPELL | 724 | 96 |
| RESOURCE | 665 | 553 |
| DMG | 528 | 474 |
| SPEED | 494 | 389 |
| PROF | 443 | 164 |
| ADV | 415 | 184 |
| NUM | 344 | 344 |
| RES | 334 | 138 |
| SLOT | 294 | 101 |
| CHOICE | 268 | 77 |
| IMM | 233 | 79 |
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


### SPELL (724 uncovered)

- `class|Death Knight|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | number 2 no record explains
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | no record for SPELL; number 2 unexplained
- `feat|Arcane Preparation|Arcane Preparation#4` For example, a level 3 wizard assigns four 1st-level slots and two 2nd-level slots, and also has one bonus 1st-level and one bonus 2nd-level slot that can cast any spell in the spellbook. | no record for SPELL; number 4,2 unexplained
- `feat|Cantrip Specialist|Cantrip Specialist#1` You learn two Warmage tricks from this list: Blasting Cantrip, Corrosive Cantrip, Draining Cantrip, Explosive Cantrip, Icy Cantrip, Severe Cantrip, Silent Cantrip, Static Cantrip. | no record for SPELL; number 2 unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#4` You learn four renaissance spells you cast with this feat. | no record for SPELL; number 4 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `feat|Strixhaven Initiate|Strixhaven Initiate#3` You learn two cantrips and one 1st-level spell from the lists for that college: | no record for SPELL; number 2 unexplained
- `item|dmg|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|wbtw|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | number 2,3 no record explains
- `sub|Bard/College of Lore (2014)|Additional Magical Secrets#1` You learn two spells of your choice from any class. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/Madness Domain|Channel Divinity: Temporary Insanity#3` Roll a d20: 1-5 Aphasia, it cannot speak, cast spells or understand others. | no record for SPELL; number 1d20,1,5 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Jaeger/Heretic Chapter|Heretic Magic#3` Learn two Warlock cantrips, and a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Smuggler|Smuggler's Legerdemain#1` Learn two cantrips, and a 1st-level spell at level 7, all illusion or transmutation spells from the wizard list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Temporal Trickster|Chrono-Master#1` You cast chronomancy spells using a pool of chronomancy points equal to twice your Proficiency Bonus. | no record for SPELL; number double,pb unexplained
- `sub|Sorcerer/Reincarnated Hero|Heroic Magic#1` You learn two cantrips from this list: arc blade, burning blade, caustic blade, force weapon, frigid blade. | no record for SPELL; number 2 unexplained
- `sub|Sorcerer/Wild Magic|Wild Magic Surge#1` Right after you cast a Sorcerer spell of level 1 or higher, the Dungeon Master can have you roll a d20. | no record for SPELL; number 1d20 unexplained
- `sub|Warlock/The Parasite Patron|Spell Siphon#2` On a fail it cannot cast a spell for 8 hours, and if the spell was level 1+ and of a level you can cast, you have it prepared for that time. | no record for SPELL; number 8 unexplained
- `sub|Wizard/Gravebinding|Restriction: The Dead Must Rest#1` You can no longer cast spells that animate, conjure or create undead, and copies of them in your spellbook fade within 24 hours. | no record for SPELL; number 24 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### RESOURCE (665 uncovered)

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

### PROF (443 uncovered)

- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Giant Foe|Giant Foe#5` On an Intelligence (History) check about the culture or origins of a giant, you count as proficient in History and add double your Proficiency Bonus instead of your normal one. | no record for PROF; number double,pb unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#1` You gain proficiency with four simple or martial firearms and can use them as spellcasting focuses. | no record for PROF; number 4 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | number pb no record explains
- `feat|Reptiloid|Reptiloid#3` It is a ranged attack with range 30 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF
- `item|dmg|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Horn of Valhalla#14` 91-00, iron horn (Legendary): 5 spirits, and you must have proficiency with all Martial weapons. | no record for PROF; number 91,00,5 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|tsdm|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tvss14|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|tvss14|Brawling Gloves (very rare)#2` You are proficient with all improvised weapons and gain +3 to attack and damage rolls made with them. | no record for DMG,PROF; number 3 unexplained
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | no record for CHOICE,PROF; number 2 unexplained
- `species|Fireforge Dwarf|Stonecunning#1` On History checks about the origin of stonework, you count as proficient in History and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `species|Winter Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `sub|Barbarian/Path of the Dad|Paternal Proficiencies#1` You gain proficiency with two sets of Artisan's Tools of your choice. | no record for PROF
- `sub|Bard/College of Eloquence|Universal Speech#2` For 1 hour they magically understand you whatever language you speak. | no record for PROF
- `sub|Bard/College of Investigation|Bonus Proficiencies#1` Gain proficiency in Insight and two of Acrobatics, Deception, Investigation, Performance, Sleight of Hand or Stealth. | number 2 no record explains
- `sub|Cleric/Knowledge Domain (2014)|Channel Divinity: Knowledge of the Ages#2` You have proficiency with it for 10 minutes. | no record for PROF
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | no record for PROF; number double,pb unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#1` Gain proficiency with the poisoner's kit, with your Proficiency Bonus doubled, and gain a kit. | no record for PROF; number double,pb unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Warmage/House of Bishops|Arcane Study#1` You gain proficiency in two skills of your choice from Arcana, History, Investigation, Medicine, and Religion. | no record for PROF
- `sub|Wizard/Necrophage|Memory of Flesh#4` If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. | no record for CHOICE,PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|Lore of Life and Death#1` You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. | number double,pb no record explains

### ADV (415 uncovered)

- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | number 1 no record explains
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|dmg|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `item|dmg|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Greatsword of the Craven#2` While attuned you gain 5 ft of speed and Advantage on initiative. | no record for ADV,INIT,SPEED; number 5 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|War Staff#3` Beyond twice the normal range, your attack rolls have Disadvantage and targets have Advantage on saves. | no record for ADV,DIS; number double unexplained
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|tghg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|tghg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|toa|Bob#1` This +1 battleaxe floats on water and other liquids, and grants its bearer advantage on Strength (Athletics) checks made to swim. | no record for ADV; number 1 unexplained
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|tvss14|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `species|Shade (ToH)|Ghostly Flesh#3` You gain a Fly Speed of 30 feet with hover, Resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks not made with silvered weapons, Advantage on checks and saves to escape a grapple or the Restrai | no record for ADV,RES
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | no record for ADV,SPEED; number 30 unexplained
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Safeguarding|Redoubtable Defender#5` A creature charge within 5 ft is immune to nonmagical Bludgeoning, Piercing and Slashing damage and has Advantage on all saves. | no record for ADV,IMM; number 5 unexplained
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | no record for ADV,SENSE; number 60 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Paladin/Oath of the Guardian|Channel Divinity#2` For 1 minute each has Advantage on Strength, Constitution and Charisma saves. | no record for ADV; number 1 unexplained
- `sub|Rogue/Thief (2014)|Supreme Sneak#1` You have Advantage on a Dexterity (Stealth) check if you move no more than half your Speed on the same turn. | no record for ADV,SPEED; number half unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/Ancient Dragons|Ascended Blessing#7` Draconic Senses: Blindsight 15 ft and Advantage on Perception checks. | no record for ADV,SENSE; number 15 unexplained
- `sub|Warlock/The GM|OP Class Feature#2` You have Advantage on all attack rolls, ability checks and saving throws, and you roll three d20s and take the highest instead of two. | no record for ADV; number 3,2 unexplained
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/Timekeeper|Temporal Points#6` Option three: Advantage on your next Dexterity check. | no record for ADV; number 3 unexplained
- `sub|Wizard/Void Caster|Void Affinity#1` You can gather twice the normal amount of Void Taint before it affects you, and you have Advantage on saves against gaining Void Taint. | no record for ADV; number double unexplained

### NUM (344 uncovered)

- `feat|Crossbow Expert|Crossbow Expert#2` Your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Inscription Adept|Inscription Adept#9` Journeyman (+3): Glyph of Warding. | number 3 no record explains
- `feat|Lightly Armored|Lightly Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Medium Armor Master|Medium Armor Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Sentinel|Sentinel#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
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
- `item|dmg|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Pendant of Thieves' Sight#2` You also gain a +5 bonus to Intelligence checks to understand a written or spoken cipher. | number 5 no record explains
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|llk|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|llk|Powered Armor#25` When the armor is reduced to 0 hit points, its defenses are rendered inert and it can be safely approached. | number 0 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|thhw|Kwark's Wondrous Kernels, Planter#15` 3, Teardrop Brown: A small tree grows with 1d4 + 1 red fruits. | number 1d4,3,1 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Cleric/Black Powder Domain|Channel Divinity: Imbue/Remove Explosivity#2` Either give the Gunpowder Blessing for 1 minute to one weapon of each creature you choose within 30 ft, or curse a number of weapons with Gunpowder Burst, up to your Proficiency Bonus, within 30 ft so they cannot Gunpowd | number 30,1,pb no record explains
- `sub|Craftsman/Arcane Maesters' Guild|Magic Item Crafting#13` Bag of Holding, Lantern of Revealing, Decanter of Endless Water, Rope of Climbing, Eyes of Minute Seeing, Sending Stones, Goggles of Night, Wand of Magic Detection, Helm of Comprehending Languages, +1 Wand of the War Mag | number 1 no record explains
- `sub|Druid/Circle of the Shepherd|Faithful Summons#2` It summons four beasts of CR 2 or lower within 20 feet. | number 20,4 no record explains
- `sub|Fighter/Hell Knight|Advanced Wounds#5` Devil's Luck: creatures that take the Acid damage have -1 AC until the end of your next turn. | number 1 no record explains
- `sub|Necromancer/Overlord|Charnel Aura#3` The bonus is +1 per 5 points spent, to a maximum of +3. | number 1,5 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains

### RES (334 uncovered)

- `feat|Vampire Transformation: Stage 3|Vampire Transformation: Stage 3#5` If you start your turn in sunlight you take 1d10 Radiant damage, and nothing can give you Resistance or Immunity to it. | no record for DMG,IMM,RES; number 1d10 unexplained
- `item|coa|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Potion of Invulnerability#1` Drinking this potion gives you Resistance to all damage for 1 minute. | no record for RES; number 1 unexplained
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Twin Blades of Azzinoth#3` Each deals an extra 2d8 Psychic damage to a Fiend, ignoring Resistance and Immunity. | no record for IMM,RES
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|tsgs|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|tvss14|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `item|twow|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | no record for DMG,RES; number 1d6,2d6 unexplained
- `sub|Investigator/Decommissioner|Trinkets#1` Biodynamic Quadcorder: Bonus Action, point it at a creature you see within 30 ft to learn its type and any Resistance it has. | no record for RES; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Paladin/Oath of the Hearth (ToH)|Roaring Fire#3` A cold creature that starts its turn within 20 ft takes 2d8 Fire damage, ignoring Fire resistance and immunity. | no record for DMG,IMM,RES; number 2d8 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | no record for DMG,RES,RESOURCE,SLOT; number 1d6,1 unexplained
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Faerzress Sorcery|Faerzress Affinity#1` You have Resistance to Lightning damage and Darkvision 60 feet (or +30 feet if you have it). | no record for SENSE; number 60,30 unexplained
- `sub|Sorcerer/Shadow Magic|Umbral Form#2` You have Resistance to all damage except Force and Radiant, and you move through creatures and objects as Difficult Terrain, taking 5 Force damage if you end your turn inside an object. | no record for RES; number 5 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained

### SLOT (294 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `item|tsdm|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for SLOT
- `item|tsgs|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|twow|Potion of Rejuvenation#1` Drink: Regain 3d4 + 3 Hit Points and one expended level 1 spell slot. | no record for RESOURCE,SLOT; number 3d4,3 unexplained
- `sub|Cleric/Black Powder Domain|Explosive Infusion#4` A slot of 2nd level or higher adds 1d6 per slot level above 1st. | no record for SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Ranger/Vermin Lord (2014)|Verminkin#2` As an action, spend a spell slot to summon a number of swarms of vermin equal to the slot level, each in a space you see within 30 ft. Short or Long Rest to use again. | no record for SLOT; number 30 unexplained
- `sub|Summoner/Bond of the Aberrant Psion|Mind Blast#5` After one use, it cannot be used again until a Short or Long Rest, unless you expend a level 3+ spell slot (no action) to restore it. | no record for SLOT
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 3 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | no record for DMG,SLOT; number 2d6,10 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Wings#2` They last 2 rounds per slot level and end early if you are Incapacitated or dismiss or replace them with a Bonus Action. | no record for SLOT; number 2 unexplained

### CHOICE (268 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Evoker|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Hedgecraft|Hedgecraft#5` You gain two magic plants of your choice, each kept in a small pot, pouch or similar container you carry. | no record for CHOICE; number 2 unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `feat|Skilled|Skilled#1` Pick three skills or tools, in any mix. | no record for CHOICE; number 3 unexplained
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `species|Vect (DM14)|Reconfigurable Ability Score Increase#1` One ability score of your choice other than Constitution rises by 1. | no record for CHOICE; number 1 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Cleric/Solidarity Domain (PSA)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 30,5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (118)

- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | angka: 2
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | angka: half
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | angka: 2
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Paladin|Restoring Touch#2` Each condition you end costs 5 Hit Points from your Lay On Hands healing pool, and the creature regains no Hit Points from points spent this way. | angka: 5
- `class|Captain|Cohort~2#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Necromancer|Thralls#25` You still cannot raise Undead that dropped to 0 Hit Points. | angka: 0
- `class|Captain|Cohort~3#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Shaman|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Barbarian|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Warden|Sentinel's Strike#8` It takes Bludgeoning damage equal to 1d8 plus the Shield's AC bonus. | angka: 1d8
- `class|Craftsman|Weapon Enchantment#8` The weapon deals an extra 1d6 damage of that type. | angka: 1d6
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
- `class|Bard|Jack of All Trades#2` For instance, if you make a Strength (Athletics) check without proficiency in Athletics, half your Proficiency Bonus can be added to that check. | angka: half,pb
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | angka: 2
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | angka: half
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2

### feat (269)

- `feat|Durable|Durable#2` Your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Mechanic|Mechanic#4` When you use it through this feat, the extra damage equals twice your Proficiency Bonus and the weapon stays Overheated until you finish a Short Rest or Long Rest. | angka: double,pb
- `feat|Depth Module|Depth Module#6` Your swimming speed rises to 60 ft. | angka: 60
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | angka: 20
- `feat|Watchers|Watchers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#28` You gain darkvision 60 ft if you lack it. | angka: 60
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | angka: 2
- `feat|Boon of Skill|Boon of Skill#2` Choose an ability score and add 1 to it (maximum 30). | angka: 30
- `feat|Iron Hero|Iron Hero#1` When a creature with a Challenge Rating higher than your level attacks you, you have +2 AC. | angka: 2
- `feat|Coalition War Training|Coalition War Training#4` When you attack with a carbine held in two hands without firing it automatically, its damage becomes 2d8. | angka: 2d8,2
- `feat|Thick-Shelled|Thick-Shelled#3` While you wear no armor, your AC is 13 + your Dexterity modifier. | angka: 13
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | angka: 1,20
- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Green Skin|Green Skin#5` While you wear no armor, your AC is 12 + your Dexterity modifier. | angka: 12
- `feat|Mist Walker|Mist Walker#10` Each time you finish a Short Rest there, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 13,pb
- `feat|Boon of Energy Resistance|Boon of Energy Resistance#8` That creature attempts a Dexterity saving throw against a DC of 8 plus your Proficiency Bonus plus your Constitution modifier, and on a failure it takes damage of that type equal to 2d12 plus your Con | angka: 2d12,8,pb
- `feat|Chief Engineer (2014)|Chief Engineer (2014)#8` A repaired system or weapon regains 5 mega hit points instead of 1. | angka: 5,1
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#10` Dexterity rises by 2 and Charisma by 1, to a maximum of 16 from this. | angka: 2
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Living Shadow|Living Shadow#6` You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest. | angka: pb
- `feat|Greater Mark of Healing|Greater Mark of Healing#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#17` It has AC 18, Hit Points equal to 10 times your character level and Speed 0. | angka: 18,10,0
- `feat|Hedgecraft|Hedgecraft#5` You gain two magic plants of your choice, each kept in a small pot, pouch or similar container you carry. | angka: 2
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | angka: 5
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | angka: 0
- `feat|Aberrant Anatomy|Aberrant Anatomy#5` You also gain Blindsight with a range of 15 feet. | angka: 15
- `feat|Spell Resistant|Spell Resistant#7` You can do this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | angka: pb
- `feat|Inscription Adept|Inscription Adept#9` Journeyman (+3): Glyph of Warding. | angka: 3
- `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#4` You have Disadvantage on all D20 Tests while in sunlight. | angka: 1d20

### item (1905)

- `item|dmg14|Ring of Water Elemental Command#5` Spells cast from the ring have a save DC of 17. | angka: 17
- `item|misc14|Daoud's Wondrous Lanthorn#9` - 2 minor beneficial properties | angka: 2
- `item|tsdm|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | angka: 2
- `item|dmg|Wand of Wonder#9` Roll 1d20 whenever you expend the final charge. | angka: 1d20
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | angka: 1
- `item|tghg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | angka: 1,2
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | angka: 2
- `item|dmg|Sulfuras, Hand of Ragnaros#4` It takes 1d10 Fire damage at the start of each of its turns instead of the normal burning damage. | angka: 1d10
- `item|dmg|Fiery Snapdragon#13` You and the target stay in the heat for 10 minutes, and at the end the target's Strength score becomes 25 for 1 hour. | angka: 10,1,25
- `item|tdm14|Blaster Prototype#6` Lock-On: use an action to deal 2d6 Radiant damage to a creature you see within 30 ft with no attack roll. | angka: 2d6,30
- `item|wbtw|Ornithopter of Flying#2` The ornithopter has a flying speed of 30 feet, and it moves according to your spoken directions while you are riding it. | angka: 30
- `item|twow|Experimental Goblin Jetpack#3` They give a Fly Speed of 60 feet. | angka: 60
- `item|dmg|Rope of Climbing#8` Every 5 minutes, provided it still has 1 Hit Point or more, it regains 1 Hit Point. | angka: 5,1
- `item|tdm14|Wings#4` Deployed, you have a flying speed equal to your walking speed, for 10 minutes total until you finish a short or long rest. | angka: 10
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | angka: 100
- `item|dmg|Cure-All#2` As an action, drink a dose to cure any disease, end the Poisoned condition and become immune to it for 1 hour. | angka: 1
- `item|tsgs|Otyugh Cloak#4` As a Bonus Action with eyes closed, you see through it and gain Darkvision 60 ft. | angka: 60
- `item|dmg|Weapon Charms#6` Blade (Uncommon): +1 to attack and damage rolls (not if the weapon already has a bonus). | angka: 1
- `item|dmg|Bliss#2` A Humanoid who swallows it feels calm and happy for 1d4 hours, gaining Immunity to the Frightened condition and 3d10 Temporary Hit Points. | angka: 1d4,3d10
- `item|dmg|Wheel of Wind and Water#2` If a wheel of wind and water is mounted on a mundane sailing ship, a creature with the Mark of Storm who is using the wheel can create an area of ideal conditions around the vessel, increasing its spe | angka: 5
- `item|dmg|Diamond Staff#13` Detect Magic (Charge Cost 0). | angka: 0
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | angka: 120,1
- `item|dmg|Defender#4` For example, you could keep only +1 on your attack and damage rolls and take +2 to Armor Class. | angka: 1,2
- `item|dmg|Titanstone Knuckles (Dormant)#3` Your Strength score becomes 22 while you wear them. | angka: 22
- `item|erlw|Wheel of Wind and Water#2` If a wheel of wind and water is mounted on a mundane sailing ship, a creature with the Mark of Storm who is using the wheel can create an area of ideal conditions around the vessel, increasing its spe | angka: 5
- `item|dmg|Manual of Flesh Golems#5` To create a flesh golem, you must spend 60 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | angka: 60,8
- `item|dmg|Wand of Viscid Globs#10` If you expend the wands last charge, roll a d20. | angka: 1d20
- `item|tsgs|Locksmith's Bane#2` You get +3 to Dexterity (Sleight of Hand) checks to pick a lock with it. | angka: 3
- `item|dmg|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | angka: 9
- `item|cm|Staff of Fate#9` On a roll of 10 or higher, the staff regains 1d6 of its expended charges. | angka: 1d6

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

### sub (943)

- `sub|Barbarian/Path of the Giant|Demiurgic Colossus#3` The extra damage from Elemental Cleaver becomes 2d6. | angka: 2d6
- `sub|Barbarian/Path of the Storm Herald|Raging Storm#9` It makes a Strength save or its Speed is 0 until the start of your next turn. | angka: 0
- `sub|Monk/Way of Concordant Motion|Cooperative Ki#4` Step of the Wind: spend 1 extra Ki so one ally you see within 30 ft can use a Reaction to move up to half its speed without opportunity attacks. | angka: 30,1,half
- `sub|Fighter/Battle Master|Relentless#2` Roll the 1d8 and use its result in place of the die, and no Superiority Die is expended. | angka: 1d8
- `sub|Necromancer/Corpse Florist|Garden of the Grave#6` After a Short or Long Rest, it takes root and regains 1d8 plus your Intelligence modifier in Hit Points. | angka: 1d8
- `sub|Warlock/Vestige Patron|Vestige Companion#12` You can spend 1 minute on a magical ceremony to bring it back at its maximum Hit Points in an unoccupied space within 5 feet of you. | angka: 5,1
- `sub|Cleric/Speed Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | angka: 1d8
- `sub|Ranger/Winter Trapper|Tripped Defenses#4` Right after, you can either make one weapon or Unarmed Strike attack against it or move up to half your Speed without provoking Opportunity Attacks from it. | angka: half
- `sub|Fighter/The Bulwark Warrior|Aggressive Defence#1` Once per turn, when you have temporary hit points and hit with a melee weapon attack, spend up to half your fighter level in temporary hit points to deal that much extra damage. | angka: half
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | angka: 1d6
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | angka: double
- `sub|Monk/Way of Concordant Motion|Deflect Strike#1` When an ally you see within 30 ft is hit by a melee attack, spend 2 Ki and use your Reaction to move up to half your speed toward it. | angka: 30,2,half
- `sub|Fighter/Arcane Archer|Arcane Shot Options#7` Extra Psychic damage, 2 dice. | angka: 2
- `sub|Wizard/Order of Scribes|Manifest Mind#2` It sheds Dim Light in 10 feet, sees and hears, has Darkvision 60 feet, and shares what it senses. | angka: 10,60
- `sub|Barbarian/Path of Heavy Metal|Rocker#1` You gain proficiency with three Musical Instruments. | angka: 3
- `sub|Druid/Circle of the Green|Spirit Symbiosis#2` You gain temporary hit points equal to its current hit points, a 30-ft climbing speed, and Advantage on Constitution saves. | angka: 30
- `sub|Sorcerer/Mirrorkin|Copycat#1` As an action, perform any action a humanoid other than you performed within the last minute, if you see it within 60 ft. You ignore the usual prerequisites, such as a holy symbol, ki points or consume | angka: 60
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | angka: 30
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | angka: 10
- `sub|Druid/Circle of the Titan|Titan Form#10` Rampager (level 10): Bonus Action, spend a level 1+ slot, move up to half Speed without Opportunity Attacks. | angka: half
- `sub|Paladin/Oath of Thunder|Aura of Alacrity#1` You and allies within 10 ft add your proficiency bonus to Initiative rolls. | angka: 10
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Cleric/Travel Domain|Well-Traveled#1` You gain proficiency with four finesse or ranged weapons of your choice and learn two languages of your choice. | angka: 4,2
- `sub|Necromancer/Toymaker|Miniature Minions#2` A Tiny thrall has a +3 bonus to AC. | angka: 3
- `sub|Bard/College of Echoes|Alter Sound#4` Enhance: raise the volume of a sound within 30 ft, doubling its range and giving creatures in range Advantage on Perception checks to detect it. | angka: 30
- `sub|Bard/College of Dirges|Death's Friend#2` Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. | angka: 60
- `sub|Necromancer/Crone|Baba Yaga [Lichdom]#7` While you hold it, you have a Fly Speed of 60 feet unless you wear Medium or Heavy armor. | angka: 60
- `sub|Ranger/Gloom Stalker (2014)|Umbral Sight#2` If you already have it, its range increases by 30 feet. | angka: 30
- `sub|Wizard/Ring Warden|Ring Bond#1` With 1 hour of work, which can be a Short Rest, you can embed one magic ring you own into your ring-staff. | angka: 1
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#3` Its Hit Point maximum is its normal maximum or four times your Ranger level, whichever is higher. | angka: 4

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `sub|Sorcerer/Apocalypse Sorcery|Arcane Apocrypha#1` After a Long Rest you can create one Spell Scroll for free, of a level 5 or lower spell you can cast. -> covered
- class `sub|Sorcerer/Apocalypse Sorcery|Arcane Apocrypha#1` After a Long Rest you can create one Spell Scroll for free, of a level 5 or lower spell you can cast. -> info:REST:NONUM
- record `sub|Wizard/School of Liminality|Otherworldly Sense#4` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Wizard/School of Liminality|Otherworldly Sense#4` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- record `feat|Mark of Hospitality|Mark of Hospitality#6` Each is free once per Long Rest. -> info:REST:NONUM
- class `feat|Mark of Hospitality|Mark of Hospitality#6` Each is free once per Long Rest. -> info:REST:NONUM
- record `item|tsgs|Gibberbox#6` Then wait 24 hours. -> info:NUMONLY:GEOMETRY
- class `item|tsgs|Gibberbox#6` Then wait 24 hours. -> info:NUMONLY:GEOMETRY
- record `sub|Wizard/Blood Magic|Bond of Mutual Suffering#3` Once, recharging on a rest; twice from level 14. -> info:NUMONLY:TABLE
- class `sub|Wizard/Blood Magic|Bond of Mutual Suffering#3` Once, recharging on a rest; twice from level 14. -> info:NUMONLY:TABLE
- record `sub|Paladin/Oath of Revelry|Party Animal#4` Long Rest to use again. -> covered
- class `sub|Paladin/Oath of Revelry|Party Animal#4` Long Rest to use again. -> info:REST:NONUM
- record `item|tce|Crystalline Chronicle#7` You can use the charges in the following ways while holding it: -> info:REST:NONUM
- class `item|tce|Crystalline Chronicle#7` You can use the charges in the following ways while holding it: -> info:REST:NONUM
- record `item|pabtso|Blessing of the Solipsistic Mind#5` You regain the ability to focus after a Long Rest. -> info:REST:NONUM
- class `item|pabtso|Blessing of the Solipsistic Mind#5` You regain the ability to focus after a Long Rest. -> info:REST:NONUM
- record `item|dmg|Figurine of Wondrous Power, Ebony Fly#14` Once it has been used, it can't be used again until 2 days have passed. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Figurine of Wondrous Power, Ebony Fly#14` Once it has been used, it can't be used again until 2 days have passed. -> info:NUMONLY:GEOMETRY
- record `sub|Warden/Diabolist|Infernal Command#4` A Short Rest regains one expended use. -> covered
- class `sub|Warden/Diabolist|Infernal Command#4` A Short Rest regains one expended use. -> info:REST:NONUM
- record `sub|Druid/Circle of the Stars|Starry Form#17` On an Intelligence check, a Wisdom check, or a Constitution saving throw made to keep Concentration, you can count any d -> info:NUMONLY:ROLL
- class `sub|Druid/Circle of the Stars|Starry Form#17` On an Intelligence check, a Wisdom check, or a Constitution saving throw made to keep Concentration, you can count any d -> info:NUMONLY:ROLL
- record `sub|Warlock/Primordial Patron|Elemental Spells#21` 9 Cone of Cold. -> info:NUMONLY:TABLE
- class `sub|Warlock/Primordial Patron|Elemental Spells#21` 9 Cone of Cold. -> info:NUMONLY:TABLE
- record `feat|Fey Teleportation|Fey Teleportation#9` You regain the use when you finish a Short or Long Rest. -> info:REST:NONUM
- class `feat|Fey Teleportation|Fey Teleportation#9` You regain the use when you finish a Short or Long Rest. -> info:REST:NONUM
- record `sub|Craftsman/Luminaries' Guild|Hardlight Wall#3` The wall is translucent and lasts 1 minute or until you dismiss it (no action). -> info:NUMONLY:GEOMETRY
- class `sub|Craftsman/Luminaries' Guild|Hardlight Wall#3` The wall is translucent and lasts 1 minute or until you dismiss it (no action). -> info:NUMONLY:GEOMETRY
- record `item|egw|Verminshroud (Exalted)#10` - When you cast the polymorph spell using the Verminshroud, you can transform into a giant scorpion. -> info:ACTIVE:TRIGGER
- class `item|egw|Verminshroud (Exalted)#10` - When you cast the polymorph spell using the Verminshroud, you can transform into a giant scorpion. -> info:ACTIVE:TRIGGER
