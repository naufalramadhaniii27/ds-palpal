# Laporan clause gate (mode laporan, 2026-11-17)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44265 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9114 |
| Info (tag terdokumentasi) | 29096 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2688, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1355, NUMONLY:ROLL 1230, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 953, ACTIVE:OTHERS 798, BY_DESIGN 670, REST:NONUM 621, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 79, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:AC10 9, STD:SUBCLASS_PICK 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 6055 |
| Uncovered dengan angka | 3633 |
| Uncovered dengan kelas kata kunci mekanik | 5661 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 394 |
| Angka yang tidak dijelaskan record mana pun | 3447 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 5069 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 266 |
| Waktu | muat data 0 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 171 ditangkap (57.4%). Hapus semua atom kelas yang dibutuhkan: 179 ditangkap (60.1%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 279 ditangkap (93.0%), semua atom kelas dihapus: 296 ditangkap (98.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| wxs | 1069 |
| LU_X | 721 |
| species | 525 |
| AUTO | 444 |
| ITEM_SPELLS | 354 |
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

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 291, fx-L5.js 201, fx-L4.js 173, fx-L12.js 169, fx-L10.js 143, fx-L2.js 133, fx-L1.js 116, fx-L3.js 113, fx-N1.js 104, fx-L9.js 99, fx-L11.js 90, fx-L6.js 69.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 970 | 13.1% |
| SPELL | 3255 | 961 | 29.5% |
| DMG | 4658 | 755 | 16.2% |
| SPEED | 1419 | 585 | 41.2% |
| PROF | 1124 | 493 | 43.9% |
| RES | 1377 | 441 | 32.0% |
| CHOICE | 1663 | 435 | 26.2% |
| ADV | 1959 | 431 | 22.0% |
| IMM | 1006 | 370 | 36.8% |
| NUM | 8606 | 346 | 4.0% |
| SLOT | 1425 | 312 | 21.9% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 263 | 24.9% |
| DIS | 1221 | 239 | 19.6% |
| SENSE | 650 | 210 | 32.3% |
| AC | 677 | 168 | 24.8% |
| SAVE | 278 | 150 | 54.0% |
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
| class | 1186 | 272 | 631 | 0 | 283 |
| feat | 2812 | 676 | 1475 | 0 | 661 |
| item | 19281 | 4547 | 11661 | 0 | 3073 |
| species | 1638 | 892 | 492 | 0 | 254 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2449 | 5885 | 0 | 1784 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10468 | 2496 | 6320 | 1652 | 15.8% |
| tvss | 2796 | 674 | 1631 | 491 | 17.6% |
| core | 1495 | 402 | 762 | 331 | 22.1% |
| ttoh | 1470 | 317 | 870 | 283 | 19.3% |
| tsgs | 1479 | 398 | 832 | 249 | 16.8% |
| tvss14 | 1201 | 222 | 741 | 238 | 19.8% |
| tkdm | 921 | 215 | 493 | 213 | 23.1% |
| tsdm | 1063 | 280 | 593 | 190 | 17.9% |
| tghp | 1116 | 383 | 554 | 179 | 16.0% |
| tce | 730 | 141 | 452 | 137 | 18.8% |
| au | 535 | 117 | 285 | 133 | 24.9% |
| tua24 | 634 | 179 | 327 | 128 | 20.2% |
| tdm14 | 643 | 148 | 380 | 115 | 17.9% |
| dmg14 | 540 | 155 | 288 | 97 | 18.0% |
| tgh14p | 490 | 114 | 282 | 94 | 19.2% |
| twow | 542 | 140 | 311 | 91 | 16.8% |
| phb14 | 513 | 173 | 256 | 84 | 16.4% |
| thhw | 395 | 88 | 232 | 75 | 19.0% |
| tee24 | 463 | 184 | 213 | 66 | 14.3% |
| hof | 249 | 45 | 142 | 62 | 24.9% |
| xge | 375 | 110 | 208 | 57 | 15.2% |
| egw | 365 | 94 | 214 | 57 | 15.6% |
| rhw | 231 | 60 | 115 | 56 | 24.2% |
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
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| bdd | 62 | 12 | 30 | 20 | 32.3% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| psa | 67 | 25 | 25 | 17 | 25.4% |
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
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psk | 38 | 22 | 11 | 5 | 13.2% |
| psx | 18 | 9 | 5 | 4 | 22.2% |
| nf | 25 | 9 | 12 | 4 | 16.0% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
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
| RESOURCE | 671 | 559 |
| DMG | 572 | 518 |
| SPEED | 502 | 393 |
| PROF | 443 | 164 |
| ADV | 421 | 184 |
| RES | 347 | 138 |
| NUM | 346 | 346 |
| SLOT | 294 | 101 |
| CHOICE | 268 | 77 |
| IMM | 235 | 79 |
| DIS | 198 | 107 |
| SENSE | 184 | 158 |
| AC | 168 | 133 |
| ATK | 165 | 128 |
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

### RESOURCE (671 uncovered)

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
- `item|ggr|Pyroconverger#6` If the total is 11 or higher, the Pyroconverger malfunctions: you take 4d6 fire damage, and you can't use the Pyroconverger again until you finish a long rest. | no record for DMG; number 4d6,11 unexplained
- `item|pota|Devastation Orb of Earth#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|tdcsr|Cabal's Ruin (Dormant)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG; number 1d6 unexplained
- `item|thhw|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|tsgs|Potion of Dragon's Breath (Very Rare)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|tsgs|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | no record for RESOURCE; number 12 unexplained
- `item|ttoh|Deadbane Heartglow Lantern#10` Each charge beyond the first adds 30 minutes and 5 feet to the detection distance. | no record for RESOURCE; number 5,30 unexplained
- `item|wbtw|Scissors of Shadow Snipping#13` If a shadowless creature is subjected to any spell that ends a curse, or if its detached shadow is reduced to 0 hit points, the detached shadow disappears, and the creature regains its normal shadow instantly. | number 0 no record explains
- `item|xge|Wand of Scowls#5` If you expend the wand's last charge, roll a d20. | number 1d20 no record explains
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | number 2 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Jaeger/Salvation Chapter|Savior's Focus#1` When an ally you can see or hear drops to 0 Hit Points, you regain 1 Adrenaline Point. | no record for RESOURCE; number 0,1 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | number 1d6,6 no record explains
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
- `item|misc14|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|tdm14|Thunder Rifle#1` A blaster (2d8 Thunder, range 150/600, Blaster, Sighted, Two-Handed) with +1 to attack and damage rolls. | number 2d8,150,600 no record explains
- `item|tee24|Quiver of Energy#2` The first time each turn you hit with a weapon attack using ammunition from this quiver, it deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
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
- `sub|Ranger/Bounty Hunter|Cornered Quarry#1` When you hit a creature with a weapon, it takes an extra 1d8 damage if none of its allies are within 5 ft of it. | no record for DMG; number 1d8,5 unexplained
- `sub|Ranger/Freerunner|Momentum#1` If you move through a hostile creature's space, leave a creature's reach, or move at least 15 ft, your next weapon attack this turn deals extra 1d6 damage. | no record for DMG; number 1d6 unexplained
- `sub|Sorcerer/Wild Magic Sorcery|Wild Magic Surge#45` Each takes 4d10 Lightning damage. | no record for DMG; number 4d10 unexplained
- `sub|Wizard/Transmuter|Wondrous Alteration#9` The damage of your new growth becomes 2d6 of the type that goes with the growth. | no record for DMG; number 2d6 unexplained

### SPEED (502 uncovered)

- `class|Barbarian|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | no record for SPEED; number half unexplained
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | no record for SPEED; number 0 unexplained
- `feat|Mantle of the Sun|Mantle of the Sun#8` Wings: luminous wings and a sunlike disk appear, giving you a flying speed of 30 ft. | no record for SPEED; number 30 unexplained
- `feat|Vampiric Exultation|Vampiric Exultation#4` While transformed you have a flying speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|au|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg14|Quaal's Feather Token, Swan Boat#6` The boat is self-propelled and moves across water at a speed of 6 miles per hour. | no record for SPEED; number 6 unexplained
- `item|dmg|Carpet of Flying, 6 ft. × 9 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Couatl Herald's Fang#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|dmg|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Experimental Goblin Jetpack#3` They give a Fly Speed of 60 feet. | no record for SPEED; number 60 unexplained
- `item|dmg|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|dmg|Soarsled#1` A crystal disk 5 ft across that carries up to 400 lb. In Sharn or another Syranian manifest zone, stand on it and use a Magic action to make it hover. | no record for SPEED; number 5 unexplained
- `item|dmg|Tectonic Gauntlets#12` You gain a 30 ft Burrow Speed through nonmagical, unworked earth and stone without disturbing it. | no record for SPEED; number 30 unexplained
- `item|dmg|Winged Boots#2` While you wear them, you can spend 1 charge as a Magic action to gain a Fly Speed of 30 feet for 1 hour. | no record for SPEED; number 30,1,1 unexplained
- `item|dmg|Wings of Flying#2` These wings give you a Fly Speed of 60 feet. | no record for SPEED; number 60 unexplained
- `item|dmg|Ythryn Mythallar#14` - While you're on the same plane of existence as the Ythryn mythallar, you can use an action to cause it to fly in any direction you choose at a speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|mot|Potion of Aqueous Form#5` You have a swimming speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|nf|Mythallar Cloak#5` While the cloak's magic is active, you gain a Fly Speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|tdcsr|Deathwalker's Ward (Exalted)#5` You gain a flying speed of 60 feet for 1 hour. | no record for SPEED; number 60 unexplained
- `item|tsgs|Couatl Herald's Radiance#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|tsgs|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|wdh|Paper Bird#5` If the bird's hit points or speed is reduced to 0 or if it is otherwise immobilized, it turns into ash. | no record for SPEED; number 0 unexplained
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | no record for SPEED; number 10,5 unexplained
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | no record for SPEED; number double unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Bard/College of the Cat|Inspired Pounce#1` When an ally you see uses your Bardic Inspiration die on a weapon attack roll against a creature, use your Reaction to move up to half your speed and make one melee weapon attack against it, adding the spent die result t | no record for ATK; number half unexplained
- `sub|Cleric/Speed Domain|Channel Divinity: Burst of Speed#2` Its base Speed rises by 10 ft. It also gains the benefit of the bless spell, but only on Dexterity-based attack rolls and saving throws. | no record for SPEED; number 10 unexplained
- `sub|Fighter/Gladiator|Mutilate#3` On a failure, until it regains Hit Points: Maimed, so it can make only one attack with the Attack action, and Sluggish, so its Speed is halved and it takes a -2 penalty to AC. | no record for SPEED; number 2 unexplained
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | no record for SPEED; number 0 unexplained
- `sub|Monk/Warrior of Intoxication|Leap to Your Feet#1` Standing up from Prone costs you 5 feet of movement instead of half your Speed. | no record for SPEED; number 5,half unexplained
- `sub|Paladin/Oath of the Sepulcher|Galactic Knight#3` Galactic Knight: used in open space outside an atmosphere or gravity field, for 1 minute you grow to 100 times your size inside a cosmic energy field, gain a 6,000 ft flying speed, your attacks deal mega damage and your  | no record for SPEED; number 6000,100 unexplained
- `sub|Ranger/Highwayman|Vantage Point#2` Climbing at half speed, you can scale difficult surfaces, such as slippery vertical walls, without an ability check. | number half no record explains
- `sub|Sorcerer/Wastelander|Advanced Transformation#4` Fell Sprinter (Digitigrade Legs): Dash or Disengage as a bonus action, and extra movement from Dash is double your speed. | no record for SPEED; number double unexplained
- `sub|Warden/Diabolist|Soul Broker#13` Your Speed rises by 15 feet. | no record for SPEED; number 15 unexplained
- `sub|Warmage/House of Rooks|Arcane Assassin#2` While you have the Invisible condition, your Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained

### PROF (443 uncovered)

- `class|Rogue|Expertise~2#4` When you reach Rogue level 6, choose two more skills you're proficient in, and you gain Expertise in those as well. | no record for PROF
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | number 1d4 no record explains
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Giant Foe|Giant Foe#5` On an Intelligence (History) check about the culture or origins of a giant, you count as proficient in History and add double your Proficiency Bonus instead of your normal one. | no record for PROF; number double,pb unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#1` You gain proficiency with four simple or martial firearms and can use them as spellcasting focuses. | no record for PROF; number 4 unexplained
- `feat|Reptiloid|Reptiloid#3` It is a ranged attack with range 30 feet, you are proficient with it, and you add your Dexterity modifier to its attack and damage rolls. | no record for PROF
- `item|bgdia|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Horn of Valhalla#14` 91-00, iron horn (Legendary): 5 spirits, and you must have proficiency with all Martial weapons. | no record for PROF; number 91,00,5 unexplained
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|idrotf|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|tdm14|Arm Cannon#2` An arm is replaced by a blaster cannon, 2d8 Radiant, Blaster property, range 30/120 ft. You are proficient with it and cannot be disarmed of it. | no record for PROF; number 2d8,120,30 unexplained
- `item|tsdm|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|tsgs|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `species|Dwarf Chassis|Remembered Training#1` Proficiency with two martial weapons of your choice and with Light and Medium armor. | no record for CHOICE,PROF; number 2 unexplained
- `species|Mechagnome|Specialized Design#1` Proficiency with two tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Vect (DM14)|Embedded Armor#4` Juggernaut Plating: AC 16, but you cannot wear conventional armor with it, and you need heavy armor proficiency to install it. | no record for PROF; number 16 unexplained
- `sub|Bard/College of Investigation|Bonus Proficiencies#1` Gain proficiency in Insight and two of Acrobatics, Deception, Investigation, Performance, Sleight of Hand or Stealth. | number 2 no record explains
- `sub|Cleric/Arcana Domain (2014)|Arcane Initiate#1` You gain proficiency in Arcana and learn two cantrips from the Wizard list. | number 2 no record explains
- `sub|Cleric/Dragon Domain|Bonus Proficiency#1` You gain proficiency in Arcana, and your Proficiency Bonus is doubled on its checks. | number double,pb no record explains
- `sub|Fighter/Living Crucible (2014)|Student of Alchemy#1` You gain proficiency with alchemist's supplies, with your Proficiency Bonus doubled for checks using them. | no record for PROF; number double,pb unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#1` You gain a Poisoner's Kit with proficiency, and your Proficiency Bonus is doubled on checks with it. | number double,pb no record explains
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | number double,pb no record explains
- `sub|Warmage/House of Bishops|Arcane Study#1` You gain proficiency in two skills of your choice from Arcana, History, Investigation, Medicine, and Religion. | no record for PROF

### ADV (421 uncovered)

- `class|Rogue|Sneak Attack#2` Once per turn, if you have Advantage on an attack roll that uses a Finesse or Ranged weapon and the attack hits a creature, you can deal an extra 1d6 damage to that creature. | no record for ADV
- `feat|Floriographer|Floriographer#5` You have Advantage on Intelligence (Investigation) and Wisdom (Insight) checks to notice and read hidden visual messages, such as the runes of a magic trap or subtle hand signals between two people. | no record for ADV; number 2 unexplained
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|Chameleon Concoction#1` Your skin matches the color and texture of your surroundings for 1 hour, giving you Advantage on Dexterity (Stealth) checks to avoid being seen. | no record for ADV; number 1 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Far Traveler's Freesia#11` Each has Advantage on ability checks and saves against Exhaustion and gains 1d6 temporary hit points for 8 hours. | no record for ADV; number 1d6,8 unexplained
- `item|dmg|Forgemaster's Might#8` You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil. | no record for ADV; number 5 unexplained
- `item|dmg|Greatsword of the Craven#2` While attuned you gain 5 ft of speed and Advantage on initiative. | no record for ADV,INIT,SPEED; number 5 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|pabtso|Potion of Psionic Fortitude#1` When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. | no record for ADV; number 1 unexplained
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|thhw|Whistle of Freedom#2` When blown, every creature within 100 ft that can hear it has Advantage on its next saving throw against a spell or effect currently affecting it. | no record for ADV; number 100 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|tvss14|Ankh of Anubis#2` While you have 10 hit points or fewer, you have Advantage on attack rolls, ability checks and saving throws. | no record for ADV; number 10 unexplained
- `species|Shade (ToH)|Ghostly Flesh#3` You gain a Fly Speed of 30 feet with hover, Resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks not made with silvered weapons, Advantage on checks and saves to escape a grapple or the Restrai | no record for ADV,RES
- `sub|Bard/College of Investigation|Quick Read#3` On a success pick one, lasting 1 minute: it has Disadvantage on attack rolls against you, you have Advantage on saves against its spells and magical effects, or you have Advantage on attack rolls against it. | no record for ADV,CHOICE,DIS; number 1 unexplained
- `sub|Cleric/Knowledge Domain|Divine Foreknowledge#2` For 1 hour, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `sub|Dancer/Shadow Dancer|Vengeful Shadow#2` You have Advantage on attacks against a creature covered this way, and when you hit one, you deal an extra 1d6 Necrotic damage. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Fighter/Scofflaw|Blindside#1` Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. | no record for ADV,DMG; number 5d6 unexplained
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#12` Acumen (Celestial, Fiend, Fey): 1 hour, Advantage on Wisdom (Insight) checks and on one chosen skill, Intimidation or Persuasion. | no record for ADV
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

- `feat|Primordial Transformation: Stage 3|Primordial Transformation: Stage 3#9` You gain Vulnerability to that instance of damage, even if you had Resistance or Immunity, and creatures within 5 feet of you take the same amount of damage as you took. | number 5 no record explains
- `item|coa|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|dmg|Armor of Vulnerability#8` While you are cursed, you have Vulnerability to the other two of the armor's three damage types (the two it doesn't give you Resistance to). | number 2,3 no record explains
- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|dmg|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|dmg|Vithrak, Gaze of the Deadman#2` Magic action, 1 charge: learn the Resistances, Vulnerabilities and Immunities of a creature you see within 120 feet. | no record for RES; number 120,1 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | no record for RES; number 1 unexplained
- `item|tsgs|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `species|Frostfell Elf|Ice Crafting#4` It has AC 13, hit points as a resilient object of its size, immunity to Cold damage and vulnerability to Fire damage. | no record for IMM,RES; number 13 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Warrior of Mystic Brews|Mystic Brew#9` Heavenly Spirit: Resistance to two of Cold, Necrotic, Psychic, Radiant. | no record for RES; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | number 10 no record explains
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | no record for RES; number 30 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Haunted|Become Death#3` While you have any, you have Resistance to all damage, a fly speed of 30 ft, and can move through creatures and objects if you end in an open space. | no record for RES,SPEED; number 30 unexplained
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | no record for RES,SPELL; number 30 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained

### NUM (346 uncovered)

- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | number 1 no record explains
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | number 1,20 no record explains
- `feat|Vampire Transformation: Level 1|Vampire Transformation: Level 1#10` Dexterity rises by 2 and Charisma by 1, to a maximum of 16 from this. | number 2 no record explains
- `item|bgg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|bgg|Prehistoric Figurine of Wondrous Power, Jasper Tyrannosaurus Rex#16` On a 1, you lose control of the figurine, and it becomes hostile to you and your companions until it is reduced to 0 hit points, at which point it reverts to figurine form. | number 0 no record explains
- `item|coa|Ruby Rod of Asmodeus#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#23` One horn becomes a +1 lance, and the other becomes a +2 longsword. | number 1,2 no record explains
- `item|dmg14|Horn of Valhalla, Bronze#6` A bronze horn summons 4d4 + 4 berserkers. | number 4d4,4 no record explains
- `item|dmg|Adze of Annam#6` - 2 minor detrimental properties | number 2 no record explains
- `item|dmg|Deck of Many Things#18` You can't lower a score that is 5 or less. | number 5 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Gloves of Missile Snaring#2` If this lowers the damage to 0 and the ammunition or weapon is small enough to hold in that hand, you can catch it. | number 0 no record explains
- `item|dmg|Ioun Stone#25` While it circles your head, your Constitution rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#32` While it circles your head, your Wisdom rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Ioun Stone#61` While it circles your head, your Strength rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Manual of Quickness of Action#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Dexterity, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Robe of Serpents#2` The robe is emblazoned with 1d4 + 3 stylized serpents, all brightly colored. | number 1d4,3 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|idrotf|Orc Stone#4` The spirit uses the orc war chief stat block in the Monster Manual and disappears after 10 minutes or when reduced to 0 hit points. | number 10,0 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#11` - 1 minor detrimental property | number 1 no record explains
- `item|misc14|Keystone of Creation#5` - 1 beneficial manifestation | number 1 no record explains
- `item|misc14|Keystone of Creation#6` - 1 detrimental manifestation | number 1 no record explains
- `item|misc14|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|tdm14|Terraforming Engine#4` It does nothing on a Tier 1 or Tier X world, and two engines cannot lower a planet's Tier by more than 1 (extra engines only add backup). | number 1,2 no record explains
- `item|tvss14|Aqua Fortis#5` On a weapon it gives a permanent, cumulative -1 to damage (at -5 it is destroyed). | number 1,5 no record explains
- `item|tvss14|Skitterlegs#4` They make Strength and Dexterity checks and saves at +5 and walk 30 ft. On each of your turns while you are down: Defend: they Dodge or Disengage (chosen when programming) and move toward the highest-priority conscious f | number 30,5 no record explains
- `sub|Barbarian/Path of the Wrecker (2014)|Crush, Smash, Bash#1` While raging, when you hit a construct or a creature wearing armor with a melee weapon attack, you can give the armor or construct a cumulative -1 penalty to the AC it gives, up to -4. | number 1,4 no record explains
- `sub|Bard/College of Graffiti|Street Art#5` Spend more uses to expand it, +1 each time, up to +3. | number 1 no record explains
- `sub|Bard/College of Wyrdsingers|Not This Day#3` If the attack would have been fatal, the ally still dies if those Temporary Hit Points run out, unless its Hit Points rise to 1 or higher first. | number 1 no record explains
- `sub|Captain/Star Wolf|Target Designation#2` It gains no benefit from Half or Three-Quarters Cover and has a -2 penalty to AC. | number 2,3,half no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#2` You and your allies inside get +5 on Dexterity (Stealth) and Wisdom (Perception) checks, and flames inside cannot be seen from outside. | number 5 no record explains
- `sub|Paladin/Oath of the Ancients (2014)|Undying Sentinel#1` When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Rogue/Sapper|Breach Defenses#1` Your attacks treat a structure or unattended object's damage threshold as 5 lower, 10 lower at level 13 and 15 lower at level 17. | number 5,10 no record explains

### SLOT (294 uncovered)

- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `feat|Downcaster|Downcaster#3` As an action you can split a spell slot of 5th level or lower into two or more lower slots whose combined level is no more than the original. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|dmg|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Golems#3` Only a spellcaster who has at least two level 5 spell slots can decipher and use the manual. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|skt|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | no record for SLOT; number 1,1 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|twow|Potion of Rejuvenation (Greater)#1` Drink: Regain 6d4 + 6 Hit Points and one expended spell slot of level 1 to 3, your choice. | no record for RESOURCE,SLOT; number 6d4,6 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
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
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
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
- `feat|Hedgecraft|Hedgecraft#5` You gain two magic plants of your choice, each kept in a small pot, pouch or similar container you carry. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
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
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Familiar Master (2014)|Arcane Evolution#2` Choose a beast with CR no higher than half the slot's level. | no record for CHOICE; number half unexplained
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (118)

- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | angka: 1d20,10
- `class|Rogue|Cunning Strike#16` Right after the attack, you move a distance of up to half your Speed, and this movement doesn't provoke Opportunity Attacks. | angka: half
- `class|Healer|Combat Supporter#3` The bonus becomes +2 at level 11 and +3 at level 17. | angka: 2,3
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Necromancer|Critical Spellcasting#5` The extra damage applies only to the creature that rolled the 1. | angka: 1
- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | angka: 1
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Martyr|Divine Respite~3#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Shaman|Instinctive Pounce#1` When you take the Bonus Action to enter your Rage, you can also move up to half your Speed as part of that same Bonus Action. | angka: half
- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | angka: 0
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | angka: 1
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Martyr|Divine Respite~2#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Investigator|Weapon Mastery#3` After a Long Rest you can change the two kinds. | angka: 2
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Captain|Cohort~3#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Shaman|Relentless Rage#5` The DC goes back to 10 once you finish a Short or Long Rest. | angka: 10
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | angka: 3
- `class|Necromancer|Thralls#4` Perform a 10 minute ritual, which can be done during a Short Rest. | angka: 10
- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | angka: 1d6
- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | angka: 4
- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | angka: 1,4
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Warden|Sentinel's Stand#9` While you hold a Shield, its AC bonus is +3 instead of +2. | angka: 3,2
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Alchemist|Bombs#9` To count them instead, you make 10 + twice your Alchemist level after each Short or Long Rest. | angka: 10,double

### feat (271)

- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 5,20
- `feat|Arcane Charger|Arcane Charger#4` If you moved at least 10 feet in a straight line and the cantrip hits, you can either add +5 to its damage roll or push the target 10 feet away from you. | angka: 10,5
- `feat|Infernal Dragoon|Infernal Dragoon#9` Once per Long Rest, after making a D20 Test roll, you can add +2 to it. | angka: 1d20,2
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | angka: 2
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#6` You gain Darkvision with a range of 60 feet. | angka: 60
- `feat|Boon of Truesight|Boon of Truesight#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | angka: 20
- `feat|Undead|Undead#3` You still spend 8 hours in light activity, such as keeping watch, to gain the benefit of a Long Rest. | angka: 8
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | angka: pb
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#26` If the vessel drops to 0 Hit Points, you must make a new one, which takes a Long Rest. | angka: 0
- `feat|Skill Expert|Skill Expert#2` Pick one ability score and raise it by 1 (maximum 20). | angka: 20
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | angka: 5
- `feat|Cohort of Chaos|Cohort of Chaos#11` 3, Unbound: when you move, you can use some or all of your Speed to teleport yourself and your gear that distance to an unoccupied space you can see. | angka: 3
- `feat|Seraph Transformation: Level 4|Seraph Transformation: Level 4#10` When you roll a natural 1 on a save against a magical spell or ability, you take 1d6 Force damage per two class levels, ignoring resistance and immunity. | angka: 1d6,1,2
- `feat|Ember of the Fire Giant|Ember of the Fire Giant#9` Each creature of your choice in a 15-foot-radius sphere centered on you makes a Dexterity saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 15,8,pb
- `feat|Blitzwarrior|Blitzwarrior#2` Also, having a hostile creature within 5 ft does not give you Disadvantage on ranged attack rolls. | angka: 5
- `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#4` You have Disadvantage on all D20 Tests while in sunlight. | angka: 1d20
- `feat|Depth Module|Depth Module#6` Your swimming speed rises to 60 ft. | angka: 60
- `feat|Great Weapon Master|Great Weapon Master#2` Your Strength score rises by 1, but not above 20. | angka: 1,20
- `feat|Lycanthrope Transformation: Level 4|Lycanthrope Transformation: Level 4#5` Your bite deals 2d8 damage. | angka: 2d8
- `feat|Archon (DM14)|Archon (DM14)#9` You gain +1 to it. | angka: 1
- `feat|Owlbearman|Owlbearman#2` Your hooked beak makes unarmed strikes that deal 1d6 + your Strength modifier piercing damage. | angka: 1d6
- `feat|Dragon Fear|Dragon Fear#7` Each creature of your choice within 30 feet makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + your Charisma modifier). | angka: 30,8,pb
- `feat|Void Channeler|Void Channeler#3` One creature of your choice within 10 feet that can hear you must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or be frightened of you for 1 minute. | angka: 10,1,8,pb
- `feat|Revenant Blade|Revenant Blade#6` While you hold a double-bladed scimitar in two hands, you gain a +1 bonus to AC. | angka: 1,2,double
- `feat|Fairy Trickster|Fairy Trickster#9` You can use this a number of times equal to your Proficiency Bonus and regain all uses when you finish a Long Rest. | angka: pb
- `feat|Boon of the Night Spirit|Boon of the Night Spirit#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Lightly Armored|Lightly Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20

### item (1967)

- `item|dmg|Treant's Bane#2` A plant creature you hit takes an extra 2d6 damage of the weapon's type. | angka: 2d6
- `item|dmg|Defender#4` For example, you could keep only +1 on your attack and damage rolls and take +2 to Armor Class. | angka: 1,2
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

### species (139)

- `species|Human Chassis|Adaptable Acumen#2` Pick one of them, or another skill or tool you are proficient in, and your Proficiency Bonus is doubled on checks that use it. | angka: pb
- `species|Mutated Derro|Athletic Training#1` Proficiency in Athletics and with two martial weapons of your choice. | angka: 2
- `species|Autumn Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|The Disembodied|Languages#1` You speak, read and write two languages of your choice. | angka: 2
- `species|Geppettin|Geppettin Construction#2` Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. | angka: pb
- `species|Gnoll (Eberron)|Rampage#1` When you use your Bite or reduce a creature to 0 Hit Points with an attack, take a Bonus Action to move up to half your Speed and make one attack with a weapon or an Unarmed Strike using your Bite. | angka: 0,half
- `species|Dwarf Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Cervan|Surge of Vigor#1` When one attack deals more than half of your current Hit Points in damage (even if it drops you to 0), you regain 1d12 + Constitution modifier Hit Points right away. | angka: 1d12,0,half
- `species|Drow Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Deep Imaskari|Aura of Unlight#4` Abjuring Unlight: you and allies in the aura gain a bonus to AC equal to half your Proficiency Bonus (round down). | angka: half,pb
- `species|Dwarf|Stonecunning#1` Bonus Action: Tremorsense 60 ft for 10 minutes while on or touching stone. | angka: 60,10
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Spindrift Dwarf|Shipwright#1` On Investigation checks about the seaworthiness or craftsmanship of a sailing vessel, you count as proficient in Investigation and add double your Proficiency Bonus. | angka: double
- `species|Vect|Embedded Armor#2` Your base AC is 13 + Dexterity modifier. | angka: 13
- `species|Mandrake|Entangling Vines#2` Its Speed is 0 and cannot increase until the end of its next turn. | angka: 0
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Pantheran Catfolk|Cat's Claws#1` Your claws are natural weapons for Unarmed Strikes and deal 1d4 + Strength modifier Slashing damage instead of Bludgeoning. | angka: 1d4
- `species|Aetherborn (Gifted)|Drain Life#1` Natural attack that deals 1d6 Necrotic damage and restores the same number of Hit Points to you. | angka: 1d6
- `species|Amoeboid (DM14)|Flexible Form#6` You can speak and understand its language, and if it has a burrowing, climbing or swimming speed you gain it, up to 40 ft. You can make the same actions that creature could, other than ones needing sp | angka: 40
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Gnome Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Dwarf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Gnome Chassis|Quick Fix#1` When you are below half your hit point maximum, use a bonus action to patch yourself up and gain temporary hit points equal to your Proficiency Bonus. | angka: half,pb
- `species|Ravenfolk Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Human Chassis|Construct Vitality#3` You have Disadvantage on Perception checks while dormant, and afterward gain what a human gets from 8 hours of sleep. | angka: 8
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | angka: 3
- `species|Dhampir|Vampiric Bite#2` The bite deals Piercing damage equal to 1d4 + your Constitution modifier in place of the normal damage. | angka: 1d4

### sub (952)

- `sub|Fighter/Rune Knight|Rune Carver#21` Advantage on Wisdom (Insight) checks and Darkvision 120 feet. | angka: 120
- `sub|Druid/Circle of Configuration (2014)|Construct Form#9` From level 6 you attack twice with the Attack action in any Configuration. | angka: double
- `sub|Paladin/Oath of the Watchers|Mortal Bulwark#2` Truesight to 120 feet. | angka: 120
- `sub|Alchemist/Ooze Rancher|Bottled Oozes#3` The Ooze uses your Intelligence modifier plus your Proficiency Bonus for attack rolls, and your Alchemist save DC for any save it forces. | angka: pb
- `sub|Cleric/Prophecy Domain|Channel Divinity: One Move Ahead#1` Use Channel Divinity to add 20 ft to your Speed for rounds equal to your cleric level. | angka: 20
- `sub|Necromancer/Pharaoh|Mummy Lord [Lichdom]#13` A creature reduced to 0 Hit Points by this attack dies and turns to dust. | angka: 0
- `sub|Bard/College of Echoes|Alter Sound#4` Enhance: raise the volume of a sound within 30 ft, doubling its range and giving creatures in range Advantage on Perception checks to detect it. | angka: 30
- `sub|Bard/College of Dirges|Death's Friend#2` Memento Mori: when a creature you see within 60 ft dies, regain one expended Bardic Inspiration use. | angka: 60
- `sub|Monster Hunter/Trapper Guild|Agile Response#2` Whether the attack hits or misses, you then move up to half your Speed without provoking Opportunity Attacks. | angka: half
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#2` Add your Proficiency Bonus to its AC, attack rolls, damage rolls, and to saves and skills it is proficient in. | angka: pb
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#9` As a Bonus Action, spend another slot to add 2d6 damage and 10 ft of line per slot level to your next breath. | angka: 2d6,10
- `sub|Ranger/Hunter|Hunter's Prey#4` If you hit a creature with a weapon while that creature is missing any of its Hit Points, the weapon deals an extra 1d8 damage to it. | angka: 1d8
- `sub|Druid/Circle of the Moon|Moonlight Step#5` Expending a level 2+ spell slot (no action required) also restores one use per slot. | angka: 1
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | angka: 10,half
- `sub|Monk/Warrior of Gravity|Plunging Strike#2` Once per turn when such a strike hits, it deals extra Bludgeoning damage of 1d6 per 10 ft fallen, up to 3d6. | angka: 1d6,3d6,10
- `sub|Captain/Skull Banner|Undead Cohort#1` Instead of initiating a normal Cohort, you can perform an 8-hour ritual, which can happen during a Long Rest, to animate an Undead Cohort. | angka: 8
- `sub|Paladin/Oath of the Sun|Oath of the Sun Spells#2` 5 Darkvision, Halo of Flame. | angka: 5
- `sub|Cleric/Forge Domain|Blessing of the Forge#3` Armor gives +1 AC and a weapon gives +1 to attack and damage rolls. | angka: 1
- `sub|Monk/Way of the Unerring Arrow|Improbable Shot#2` Or spend 5 Ki to hit a target seen in the past minute that is now on another plane or in an extradimensional space, such as through plane shift, rope trick or a phase spider's Ethereal Jaunt. | angka: 5
- `sub|Wizard/Plague Doctor|Medicinal Master#2` Bad Medicine deals an extra 2d8 Acid damage. | angka: 2d8
- `sub|Barbarian/Path of Hellfire|Hellish Aspect#2` While raging you have Resistance to Fire damage, and the first creature you hit on each of your turns with a weapon attack takes 1d6 extra Fire damage, 2d6 from level 10. | angka: 1d6,2d6
- `sub|Monk/Warrior of Gravity|Singularity Strike#2` Its Speed is 0 until the start of your next turn unless it takes the Disengage action. | angka: 0
- `sub|Wizard/School of Enchantment|Hypnotic Gaze#3` Its Speed drops to 0 and it is Incapacitated and visibly dazed. | angka: 0
- `sub|Sorcerer/Radiation Freak|Glow Cloud#2` This works like gaseous form, except your flying speed is half your speed, a creature that enters your space or starts its turn there takes 4d10 Radiant damage, and you can cast cantrips in this form. | angka: 4d10,half
- `sub|Fighter/Hell Knight|Infernal Wound#5` The wound lasts 1 minute, until the target regains Hit Points, or until the target or a creature within 5 feet takes an action to stanch it. | angka: 5,1
- `sub|Paladin/Oath of Winter|Channel Divinity#4` Fire damage reduces them as if you were vulnerable, but if Fire damage drops them to 0, the leftover Fire damage does not carry over to your hit points. | angka: 0
- `sub|Cleric/Winter Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Bard/College of Tactics|Song of Strategy#4` Distraction: take Disengage as a bonus action and gain speed of 5 ft times the roll. | angka: 5
- `sub|Ranger/Swarmkeeper|Swarming Dispersal#1` When you take damage, you can use your Reaction to gain Resistance to it, vanish into the swarm, and reappear in an open space you can see within 30 feet. | angka: 30
- `sub|Barbarian/Path of the Glacier|Frostbite#1` Once per turn while Raging, when you hit with a Strength-based attack, you can release cold into the target for an extra 1d6 Cold damage. | angka: 1d6

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg|Poison Soaked Kukri#2` The poison remains for 1 minute or until an attack using this weapon hits a creature. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Poison Soaked Kukri#2` The poison remains for 1 minute or until an attack using this weapon hits a creature. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Sapphire Buckler#5` If any Aberrations are within 1 mile of you, the shield emits a low humming tone for a moment, and you know the directio -> info:NUMONLY:GEOMETRY
- class `item|dmg|Sapphire Buckler#5` If any Aberrations are within 1 mile of you, the shield emits a low humming tone for a moment, and you know the directio -> info:NUMONLY:GEOMETRY
- record `sub|Psion/Psykinetic|Psykinetic Spells#2` 3 Cloud of Daggers, Levitate, Shield, Thunderwave. -> covered
- class `sub|Psion/Psykinetic|Psykinetic Spells#2` 3 Cloud of Daggers, Levitate, Shield, Thunderwave. -> covered
- record `sub|Bard/College of Tactics|Setting the Board#2` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- class `sub|Bard/College of Tactics|Setting the Board#2` Use it a number of times equal to your Proficiency Bonus. -> info:NUMONLY:TEXT
- record `sub|Fighter/Living Crucible (2014)|Compound Creator#9` You can benefit from several compounds at once but the same one twice adds nothing. -> info:NUMONLY:TEXT
- class `sub|Fighter/Living Crucible (2014)|Compound Creator#9` You can benefit from several compounds at once but the same one twice adds nothing. -> info:NUMONLY:TEXT
- record `sub|Bard/Entropy|Infusion of Fortune#2` Short or Long Rest to use this again. -> info:REST:NONUM
- class `sub|Bard/Entropy|Infusion of Fortune#2` Short or Long Rest to use this again. -> info:REST:NONUM
- record `sub|Fighter/Timeblade|Temporal Strike#6` Long Rest to regain all uses. -> covered
- class `sub|Fighter/Timeblade|Temporal Strike#6` Long Rest to regain all uses. -> info:REST:NONUM
- record `feat|Fey Tormentor|Fey Tormentor#7` Once used, you regain it after a Long Rest. -> info:REST:NONUM
- class `feat|Fey Tormentor|Fey Tormentor#7` Once used, you regain it after a Long Rest. -> info:REST:NONUM
- record `sub|Artificer/Portalweaver|Portal Device#8` Long Rest to use again. -> info:REST:NONUM
- class `sub|Artificer/Portalweaver|Portal Device#8` Long Rest to use again. -> info:REST:NONUM
- record `sub|Barbarian/Path of the Spiritual Guardian|Consult the Spirits#4` After casting either spell this way you cannot use the feature again until you finish a Short or Long Rest. -> covered
- class `sub|Barbarian/Path of the Spiritual Guardian|Consult the Spirits#4` After casting either spell this way you cannot use the feature again until you finish a Short or Long Rest. -> info:REST:NONUM
- record `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#1` Stage 2. -> info:NUMONLY:TABLE
- class `feat|Vampire Transformation: Stage 2|Vampire Transformation: Stage 2#1` Stage 2. -> info:NUMONLY:TABLE
- record `item|dmg|Nine Lives Stealer#9` Once it has no charges left, it loses this property. -> info:REST:NONUM
- class `item|dmg|Nine Lives Stealer#9` Once it has no charges left, it loses this property. -> info:REST:NONUM
- record `item|dmg|Necronomicon#5` No two copies are the same. -> info:NUMONLY:TABLE
- class `item|dmg|Necronomicon#5` No two copies are the same. -> info:NUMONLY:TABLE
- record `sub|Dancer/Cheerleader|Athletic Dexterity#2` After you use this, you cannot use it again until you finish a Short or Long Rest. -> covered
- class `sub|Dancer/Cheerleader|Athletic Dexterity#2` After you use this, you cannot use it again until you finish a Short or Long Rest. -> info:REST:NONUM
- record `feat|Boon of Fate|Boon of Fate#5` After using this benefit, you must roll Initiative or finish a Short or Long Rest before you can use it again. -> info:REST:NONUM
- class `feat|Boon of Fate|Boon of Fate#5` After using this benefit, you must roll Initiative or finish a Short or Long Rest before you can use it again. -> info:REST:NONUM
