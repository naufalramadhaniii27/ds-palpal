# Laporan clause gate (mode laporan, 2026-11-18)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 86295 |
| Kalimat mekanik (kelas kata kunci atau angka) | 44249 (51.3%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 9479 |
| Info (tag terdokumentasi) | 29149 (SPELL_TEXT 8952, FORM:ACTIVATE 2848, NUMONLY:GEOMETRY 2685, FORM:ROLL 2085, ACTIVATE 1725, NUMONLY:TEXT 1573, FXO_NULL 1351, NUMONLY:ROLL 1228, NUMONLY:TABLE 1018, FORM:TABLE 979, ACTIVE:TRIGGER 945, ACTIVE:OTHERS 790, BY_DESIGN 670, REST:NONUM 619, NUMONLY:FLAVOR 340, COND:PLAY_STATE 245, STD:ASI 216, NUMONLY:ZERO 196, OBJECT:STATS 111, DC:REFERENCE 94, COND:ATTACK_ROLL_ADV 83, ITEM:SENSES 82, TABLE:CLASS 74, ACTIVE:REACTION 71, ACTIVE:TIMED_IMM 37, REST:LENGTH 31, STD:SUBCLASS_PICK 20, STD:FEAT_PICK 20, ITEM:REQUIREMENT 19, ITEM:SENTIENT 18, SPELL:RIDER 15, STD:AC10 9) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5621 |
| Uncovered dengan angka | 3452 |
| Uncovered dengan kelas kata kunci mekanik | 5229 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 392 |
| Angka yang tidak dijelaskan record mana pun | 3263 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4643 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 254 |
| Waktu | muat data 0 s, analisis 10 s |

Uji mutasi pada data nyata (seed 7): 297 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 175 ditangkap (58.9%). Hapus semua atom kelas yang dibutuhkan: 175 ditangkap (58.9%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 269 ditangkap (89.7%), semua atom kelas dihapus: 297 ditangkap (99.0%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3357 |
| GX | 2198 |
| wxs | 1066 |
| LU_X | 730 |
| species | 545 |
| AUTO | 444 |
| ITEM_SPELLS | 403 |
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

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-B9-advnotes.js 326, fx-L5.js 201, fx-L12.js 179, fx-L4.js 173, fx-L10.js 167, fx-L2.js 135, fx-L1.js 124, fx-L3.js 113, fx-N1.js 112, fx-L11.js 99, fx-L9.js 99, fx-L6.js 71.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 7405 | 911 | 12.3% |
| SPELL | 3255 | 893 | 27.4% |
| DMG | 4658 | 684 | 14.7% |
| SPEED | 1411 | 548 | 38.8% |
| PROF | 1124 | 409 | 36.4% |
| RES | 1375 | 398 | 28.9% |
| ADV | 1959 | 390 | 19.9% |
| CHOICE | 1663 | 389 | 23.4% |
| NUM | 8604 | 344 | 4.0% |
| IMM | 1004 | 326 | 32.5% |
| SLOT | 1425 | 312 | 21.9% |
| DC | 2903 | 284 | 9.8% |
| ATK | 1056 | 260 | 24.6% |
| DIS | 1221 | 239 | 19.6% |
| SENSE | 648 | 194 | 29.9% |
| AC | 677 | 162 | 23.9% |
| SAVE | 278 | 145 | 52.2% |
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
| class | 1186 | 276 | 666 | 0 | 244 |
| feat | 2812 | 743 | 1473 | 0 | 596 |
| item | 19265 | 4705 | 11687 | 0 | 2873 |
| species | 1638 | 914 | 492 | 0 | 232 |
| spell | 9230 | 278 | 8952 | 0 | 0 |
| sub | 10118 | 2563 | 5879 | 0 | 1676 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10460 | 2577 | 6338 | 1545 | 14.8% |
| tvss | 2788 | 702 | 1639 | 447 | 16.0% |
| core | 1495 | 406 | 776 | 313 | 20.9% |
| ttoh | 1470 | 351 | 869 | 250 | 17.0% |
| tsgs | 1479 | 405 | 831 | 243 | 16.4% |
| tvss14 | 1201 | 240 | 740 | 221 | 18.4% |
| tkdm | 921 | 241 | 492 | 188 | 20.4% |
| tsdm | 1063 | 296 | 592 | 175 | 16.5% |
| tghp | 1116 | 390 | 554 | 172 | 15.4% |
| tce | 730 | 147 | 452 | 131 | 17.9% |
| tua24 | 634 | 189 | 327 | 118 | 18.6% |
| tdm14 | 643 | 150 | 380 | 113 | 17.6% |
| au | 535 | 141 | 284 | 110 | 20.6% |
| dmg14 | 540 | 156 | 291 | 93 | 17.2% |
| tgh14p | 490 | 118 | 282 | 90 | 18.4% |
| phb14 | 513 | 173 | 256 | 84 | 16.4% |
| twow | 542 | 144 | 316 | 82 | 15.1% |
| thhw | 395 | 93 | 232 | 70 | 17.7% |
| tee24 | 463 | 188 | 216 | 59 | 12.7% |
| egw | 365 | 97 | 214 | 54 | 14.8% |
| tssm | 275 | 73 | 148 | 54 | 19.6% |
| xge | 375 | 115 | 208 | 52 | 13.9% |
| coa | 158 | 46 | 60 | 52 | 32.9% |
| tghg | 288 | 77 | 162 | 49 | 17.0% |
| hof | 249 | 56 | 145 | 48 | 19.3% |
| EFotA | 137 | 40 | 50 | 47 | 34.3% |
| misc14 | 326 | 66 | 213 | 47 | 14.4% |
| rhw | 231 | 68 | 117 | 46 | 19.9% |
| oota | 87 | 22 | 21 | 44 | 50.6% |
| tdcsr | 299 | 111 | 148 | 40 | 13.4% |
| mot | 292 | 98 | 159 | 35 | 12.0% |
| tsgeh | 183 | 61 | 89 | 33 | 18.0% |
| bmt | 489 | 79 | 379 | 31 | 6.3% |
| bgg | 207 | 62 | 121 | 24 | 11.6% |
| ftd | 159 | 37 | 100 | 22 | 13.8% |
| tgh14c | 242 | 39 | 182 | 21 | 8.7% |
| wbtw | 92 | 18 | 54 | 20 | 21.7% |
| toa | 116 | 33 | 65 | 18 | 15.5% |
| skt | 118 | 30 | 70 | 18 | 15.3% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| tsae | 63 | 21 | 25 | 17 | 27.0% |
| bdd | 62 | 15 | 30 | 17 | 27.4% |
| psa | 67 | 27 | 24 | 16 | 23.9% |
| dsotdq | 82 | 20 | 46 | 16 | 19.5% |
| wdh | 95 | 28 | 52 | 15 | 15.8% |
| wdmm | 79 | 14 | 50 | 15 | 19.0% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| idrotf | 134 | 33 | 87 | 14 | 10.4% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
| ai | 164 | 25 | 127 | 12 | 7.3% |
| abh | 53 | 17 | 24 | 12 | 22.6% |
| frafi | 81 | 23 | 46 | 12 | 14.8% |
| crcotn | 96 | 38 | 46 | 12 | 12.5% |
| pota | 110 | 26 | 73 | 11 | 10.0% |
| cos | 66 | 21 | 34 | 11 | 16.7% |
| pabtso | 69 | 26 | 32 | 11 | 15.9% |
| erlw | 127 | 59 | 58 | 10 | 7.9% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| vgm | 64 | 32 | 22 | 10 | 15.6% |
| bgdia | 114 | 29 | 75 | 10 | 8.8% |
| tshl | 68 | 19 | 40 | 9 | 13.2% |
| vrgr | 86 | 26 | 52 | 8 | 9.3% |
| tsdd | 69 | 27 | 34 | 8 | 11.6% |
| lfl | 33 | 20 | 5 | 8 | 24.2% |
| cm | 60 | 12 | 40 | 8 | 13.3% |
| aag | 40 | 19 | 14 | 7 | 17.5% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| tftyp | 71 | 26 | 39 | 6 | 8.5% |
| psk | 38 | 22 | 11 | 5 | 13.2% |
| psx | 18 | 10 | 5 | 3 | 16.7% |
| psz | 38 | 33 | 2 | 3 | 7.9% |
| efa | 28 | 10 | 15 | 3 | 10.7% |
| mtf | 64 | 49 | 13 | 2 | 3.1% |
| nf | 25 | 11 | 12 | 2 | 8.0% |
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
| SPELL | 666 | 92 |
| RESOURCE | 613 | 509 |
| DMG | 509 | 455 |
| SPEED | 465 | 371 |
| ADV | 380 | 183 |
| PROF | 364 | 150 |
| NUM | 344 | 344 |
| RES | 330 | 138 |
| SLOT | 294 | 101 |
| CHOICE | 235 | 77 |
| IMM | 219 | 79 |
| DIS | 198 | 107 |
| SENSE | 168 | 142 |
| ATK | 162 | 125 |
| AC | 162 | 127 |
| SAVE | 139 | 120 |
| DC | 129 | 123 |
| HP | 112 | 85 |
| ABIL | 66 | 63 |
| NUM-DIST | 25 | 25 |
| NUM-DICE | 22 | 22 |
| INIT | 18 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### SPELL (666 uncovered)

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

### RESOURCE (613 uncovered)

- `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#5` Whenever you regain Hit Points, you regain only half as many, rounded down. | number half no record explains
- `item|cm|Staff of Fate#9` On a roll of 10 or higher, the staff regains 1d6 of its expended charges. | number 1d6 no record explains
- `item|cos|Gulthias Staff#8` On a hit, it deals damage as a normal quarterstaff, and you can expend 1 charge to regain a number of hit points equal to the damage dealt by the weapon. | number 1 no record explains
- `item|crcotn|Jewel of Three Prayers (Exalted)#20` - Its number of charges increases to 5. | number 5 no record explains
- `item|dmg14|Figurine of Wondrous Power, Ivory Goats#18` When it runs out of charges, it reverts to a figurine and can't be used again until 7 days have passed, when it regains all its charges. | number 7 no record explains
- `item|dmg|Amulet of the Black Skull#4` While wearing the amulet, you can use an action to expend 1 of its charges to transport yourself and anything you are wearing or carrying to a location within 100 feet of you. | number 100,1 no record explains
- `item|dmg|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | number 10 no record explains
- `item|dmg|Charm of the Sun#4` After one use the charm vanishes, and you unlearn the Light cantrip gained from it. | no record for SPELL
- `item|dmg|Cloak of the Boundless Spirit#5` An ally can gain the 1 Hit Point from a 19 only once per Long Rest. | number 1,19 no record explains
- `item|dmg|Devastation Orb of Air#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Devastation Orb of Fire#18` The orb is destroyed after one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Floodmote Heartglow Lantern#9` Each charge beyond the first adds 1 hour and lets you protect one more creature within 30 feet. | no record for RESOURCE; number 30,1 unexplained
- `item|dmg|Manual of Flesh Golems#5` To create a flesh golem, you must spend 60 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | no record for RESOURCE; number 60,8 unexplained
- `item|dmg|Occultant Abacus#24` Also at rank 2, you regain the use of your Read the Kill feature after you finish a short or long rest. | number 2 no record explains
- `item|dmg|Rope of Climbing#8` Every 5 minutes, provided it still has 1 Hit Point or more, it regains 1 Hit Point. | no record for RESOURCE; number 5,1 unexplained
- `item|dmg|Sanctuary Charm~2#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | number 7 no record explains
- `item|dmg|Seed of Rebirth#1` A fist-sized seed that up to 4 creatures can attune to during a Long Rest. | no record for RESOURCE; number 4 unexplained
- `item|dmg|Staff of Fate#7` If you expend the staff's last charge, roll a d20. | number 1d20 no record explains
- `item|dmg|Tome of Dreams#3` After your next Long Rest, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Tome of the Dragon#8` During the ritual, you and any assistants must work without interruption, resting no more than 8 hours per day. | no record for RESOURCE; number 8 unexplained
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | number 2d6,2 no record explains
- `item|idrotf|Blessing of the Morninglord#1` You gain 10 Temporary Hit Points each day at dawn. | no record for RESOURCE; number 10 unexplained
- `item|idrotf|Ythryn Mythallar#8` To attune to this mythallar, a creature must finish a short rest within 30 feet of it, meditating on the mythallar. | number 30 no record explains
- `item|misc14|Charm of Cozmioko's Glory#3` Light: regain 28 (8d6) Hit Points. | number 8d6,28 no record explains
- `item|mot|Mastix, Whip of Erebos#7` When you hit with an attack using this whip, the target takes an extra 2d8 necrotic damage and you regain hit points equal to half the amount of necrotic damage dealt. | number half no record explains
- `item|tdcsr|Wraps of Dyamak (Exalted)#4` When you hit with an unarmed strike, you can make it a ravenous strike: the target takes an extra 6d6 necrotic damage and you regain hit points equal to the necrotic damage dealt. | number 6d6 no record explains
- `item|toa|Charm of the Ghoul#2` You regain 3d8 + 3 hit points. | number 3d8 no record explains
- `item|tsgs|Necrolace#4` If this drops you to 0 HP you are Unconscious but Stable, and the target regains twice your remaining HP instead. | number double no record explains
- `item|ttoh|Tumblesafe Heartglow Lantern#9` Each charge beyond the first extends the lantern's light by 5 feet. | no record for RESOURCE; number 5 unexplained
- `item|ttoh|Victory Banner#5` You must be within 5 feet of the banner to spend its charges. | number 5 no record explains
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of the Road|Favorite Trick#2` If you roll Initiative with no Bardic Inspiration left, you regain one use, which only fuels that trick. | no record for RESOURCE; number 1 unexplained
- `sub|Captain/Skull Banner|Undead Cohort#1` Instead of initiating a normal Cohort, you can perform an 8-hour ritual, which can happen during a Long Rest, to animate an Undead Cohort. | no record for RESOURCE; number 8 unexplained
- `sub|Craftsman/Thunderlords' Guild|Power Cell#9` It is 1d6 per Charge Point spent plus your Intelligence modifier. | no record for RESOURCE; number 1d6 unexplained
- `sub|Craftsman/Wintercarvers' Guild|Winter Core#2` If it is lost or damaged, you can repair or replace it during a Long Rest with materials worth 100+ GP. | number 100 no record explains
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | no record for DC,RESOURCE; number 10 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#7` Elemental Charge: pick one of those six types, and your hits can deal it and deal an extra 1d6 of it. | number 1d6,6 no record explains
- `sub|Ranger/Big Game Hunter|Game Hunter#2` Until your next Long Rest, your Ranged Attack Rolls against creatures of that size deal an extra 1d8 Piercing damage. | no record for DMG; number 1d8 unexplained
- `sub|Warlock/The Future You|It Happened Like This#1` After a Short or Long Rest, the GM secretly rolls a d20 and a d4 and notes the d20 result. | no record for RESOURCE; number 1d20,1d4 unexplained
- `sub|Wizard/Ring Warden|Ring Bond#1` With 1 hour of work, which can be a Short Rest, you can embed one magic ring you own into your ring-staff. | no record for RESOURCE; number 1 unexplained

### DMG (509 uncovered)

- `item|coa|Ranseur of Torture#6` When you hit a good aligned creature with it, that creature takes an extra 1d10 necrotic damage. | number 1d10 no record explains
- `item|coa|Scourge of Shadow#5` You have a +3 bonus to attack and damage rolls made with this weapon, and it does 3d4 slashing damage instead of its regular damage. | number 3d4 no record explains
- `item|coa|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Arcane Oil#3` For 1 minute, nonmagical coated items grant +2 to attack and damage rolls. | no record for DMG; number 1,2 unexplained
- `item|dmg|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Helm of Brilliance#8` Each Undead that begins its turn there takes 1d6 Radiant damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Hivemaster Pistol#4` Each hit then deals 1d4 Radiant damage instead of 2d4. | no record for DMG; number 1d4,2d4 unexplained
- `item|dmg|Psionic Piercing#22` Fail: 6d8 Psychic damage and Stunned for 1 minute. | no record for DMG; number 6d8,1 unexplained
- `item|dmg|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even between attacks. | no record for DMG; number 1,2 unexplained
- `item|dmg|Telescoping Bladelance#3` Retracted, it is a Greatsword that deals 1d10 Slashing damage instead of 2d6. | no record for DMG; number 1d10,2d6 unexplained
- `item|dmg|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|dmg|True-Ice Shards (Rapier)#5` You gain a +3 bonus to attack and damage rolls made with the magical rapier and it does 1d8 cold damage instead of its regular damage. | number 1d8 no record explains
- `item|dmg|Un's Codex#11` Fail: 4d6 Force damage and it is pushed to the nearest free space. | no record for DMG; number 4d6 unexplained
- `item|dmg|Wand of Orcus#12` Attack rolls and damage rolls you make with it gain a +3 bonus, and each hit deals an extra 2d12 Necrotic damage. | number 2d12 no record explains
- `item|egw|Stormgirdle (Exalted)#6` - Your Storm Avatar's lightning strike deals 5d6 lightning damage (instead of 3d6). | no record for DMG; number 5d6,3d6 unexplained
- `item|misc14|Dragontooth Dagger#6` Against enemies of the Cult of the Dragon, the dagger's bonus to attack and damage rolls increases to 2, and the extra acid damage increases to 2d6. | number 2d6,2 no record explains
- `item|thhw|Glowing Ember#6` If you move more than 20 ft from the hovering crystal, it follows you by the shortest path, avoiding obstacles if it can, until it is within 20 ft. If it is lit and cannot reach the creature it follows within 3 rounds, i | no record for DMG; number 8d6,20,3 unexplained
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Contractor Nail#2` When a d6 of its damage shows a 6, you can roll another d6 and add it. | no record for DMG; number 1d6,6 unexplained
- `item|tsgs|Tome of Dreams#4` On 10 or lower, you take 2d4 Psychic damage from terrors. | no record for DMG; number 2d4,10 unexplained
- `item|tsgs|Visage of Delight and Disaster#9` When it hits with a weapon or Unarmed Strike, it can spend the die to deal extra Psychic damage equal to twice the roll. | no record for DMG; number double unexplained
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Boggart|Fury of the Small#1` Once per turn, when you damage a creature larger than you with an attack roll or a spell, you deal extra damage equal to your Proficiency Bonus. | no record for DMG; number pb unexplained
- `species|Dragonborn Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | no record for DMG; number 1d4 unexplained
- `species|Drow Heritage|Poison Bite#1` When you hit with your bite, you can release venom to deal an extra 1d6 Poison damage, rising to 3d6 at level 11. | no record for DMG; number 1d6,3d6 unexplained
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `sub|Barbarian/Path of Heavy Metal (2014)|Smash Hit#1` When you hit with your instrument weapon while raging, you can smash it on the target for 4d12 extra damage. | no record for DMG; number 4d12 unexplained
- `sub|Barbarian/Path of the Wrecker|Disarm Foe#3` The limb is a Martial Melee weapon dealing 1d8 Bludgeoning damage, with the Versatile property (1d10) and Sap mastery. | no record for DMG; number 1d8,1d10 unexplained
- `sub|Cleric/Apocalypse Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | no record for DMG; number 2d8 unexplained
- `sub|Cleric/Inquisition Domain|Rebuke Invoker#2` Fail: Force damage of 1d8 plus 1d8 per level of the slot it spent (cantrips count as level 1). | no record for DMG,SPELL; number 1d8 unexplained
- `sub|Cleric/Labyrinth Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Prophecy Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Druid/Circle of the Blighted|Defile Ground (10th Level)#1` The defiled area becomes a 20-ft radius and the extra damage 1d6. | no record for DMG; number 1d6,20 unexplained
- `sub|Fighter/Arcane Archer|Arcane Shot Options#31` Extra Psychic damage, 1 die. | no record for DMG; number 1 unexplained
- `sub|Fighter/The Bulwark Warrior|Aggressive Defence#1` Once per turn, when you have temporary hit points and hit with a melee weapon attack, spend up to half your fighter level in temporary hit points to deal that much extra damage. | no record for DMG; number half unexplained
- `sub|Ranger/Winter Walker|Frozen Haunt#9` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained
- `sub|Summoner/Bond of the Dragon Herald|Dragon Eidolon#23` The base damage becomes 3d6 at level 6 and 4d6 at level 14. | no record for DMG; number 3d6,1d6 unexplained
- `sub|Warlock/Star Patron|Nova#1` Once per turn when you hit with a ranged attack roll, you can take 5 Radiant damage to deal an extra 1d8 Radiant damage to the target. | no record for DMG; number 1d8,5 unexplained
- `sub|Warlock/Undead Patron|Superior Dread#6` You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 Force damage if you end your turn inside one. | no record for DMG; number 1d10 unexplained

### SPEED (465 uncovered)

- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | no record for SPEED; number 0 unexplained
- `class|Dancer|Fast Movement#1` Your Speed rises by 10 feet while you do not wear Heavy armor. | no record for SPEED; number 10 unexplained
- `feat|Depth Module|Depth Module#6` Your swimming speed rises to 60 ft. | no record for SPEED; number 60 unexplained
- `feat|Mantle of the Sun|Mantle of the Sun#8` Wings: luminous wings and a sunlike disk appear, giving you a flying speed of 30 ft. | no record for SPEED; number 30 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `feat|Transmutation Adept|Transmutation Adept#7` On your turn, when you cast a Transmutation spell using a spell slot, your Speed rises by 5 feet for each level of the slot spent. | no record for SLOT,SPEED,SPELL; number 5 unexplained
- `item|coa|Ranseur of Torture#22` This penalty stacks, though movement speed can't be reduced below 0. | no record for SPEED; number 0 unexplained
- `item|crcotn|Jewel of Three Prayers (Exalted)#44` - Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed. | no record for SPEED; number 30 unexplained
- `item|dmg14|Carpet of Flying, 4 ft. × 6 ft.#3` A 4 ft. × 6 ft. carpet can carry up to 400 lb. at a fly speed of 60 feet. | no record for SPEED; number 4,6,60 unexplained
- `item|dmg|Axe Beak Tomahawk#2` The first time each turn you hit a creature with a Fly Speed, it makes a DC 13 Strength save. | no record for DC,SPEED; number 13 unexplained
- `item|dmg|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|dmg|Carpet of Flying, 6 ft. × 9 ft.#4` A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity. | no record for SPEED; number half,double unexplained
- `item|dmg|Figurine of Wondrous Power#25` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Horseshoes of Speed#4` When all four horseshoes are attached to one creature, that creature's Speed increases by 30 feet. | no record for SPEED; number 30,4 unexplained
- `item|dmg|Loadstone#6` Until the curse is broken with remove curse or similar magic, your speed is reduced by 5 feet, and your maximum load and maximum lift capacities are halved. | no record for SPEED; number 5 unexplained
- `item|dmg|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|dmg|Quaal's Feather Token (bird)#9` It can carry up to 500 pounds while it flies at its top speed, which is 16 miles per hour for no more than 144 miles per day, resting 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Warmind Wand#9` Magic action, 1 charge: an ally who sees or hears you gains 2d4 + 2 Temporary Hit Points and can use its Reaction to move half its Speed without provoking Opportunity Attacks. | no record for SPEED; number 2d4,2,half unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for SPEED
- `item|dmg|Workshop Wrecker#1` When this 3-inch-diameter metal ball is activated as a Magic action, it moves at a rapid speed, bouncing off walls and defying any attempts to capture it. | no record for SPEED; number 3 unexplained
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it mu | no record for DC,DMG; number 3d8,5,15 unexplained
- `item|tgh14p|Ardor#4` As a bonus action you can let it hover in an open space within 5 ft. While you see it, a bonus action commands it to fly 50 ft and either attack once or return to your hands. | no record for SPEED; number 5,50 unexplained
- `item|tsgs|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Ring of Anchoring#6` On a fail the arm is immobile for 1 minute, your Speed is 0, and you are dragged 30 ft down at the start of each turn. | no record for SPEED; number 30,1,0 unexplained
- `item|twow|Figurine of Wondrous Power (Jeweled Panther)#2` Magic action: throw it at a point on the ground within 60 feet and it becomes a Large Panther with a Fly Speed of 30 feet for up to 12 hours. | no record for SPEED; number 60,30,12 unexplained
- `item|wdh|Paper Bird#5` If the bird's hit points or speed is reduced to 0 or if it is otherwise immobilized, it turns into ash. | no record for SPEED; number 0 unexplained
- `species|Disembodied|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `sub|Artificer/Reanimator|Macabre Modifications#9` The companion's Speed becomes 45 feet, and it gains a Climb Speed equal to its Speed. | no record for SPEED; number 45 unexplained
- `sub|Barbarian/Path of the World Tree|Branches of the Tree#4` Once the target has teleported, you can lower its Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Captain/Siegeball Jersey|Game Plan#3` Go Long: move up to twice its Speed. | no record for SPEED; number double unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Jaeger/Sanguine Chapter|Blood Frenzy#1` While Bloodied, your Speed increases by 20 feet, the Attack action gives you three attacks, and all Hit Points you regain from Jaeger abilities are doubled. | no record for RESOURCE; number 3,double unexplained
- `sub|Monk/Way of Concordant Motion|Deflect Strike#1` When an ally you see within 30 ft is hit by a melee attack, spend 2 Ki and use your Reaction to move up to half your speed toward it. | no record for SPEED; number 30,2,half unexplained
- `sub|Necromancer/Reanimator|Spell-Stitching#8` The thrall's Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Wizard/Enchanter|Hypnotic Presence#4` While Charmed this way, the target is Incapacitated and has a Speed of 0. | no record for SPEED; number 0 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | no record for SPEED; number 10 unexplained
- `sub|Wizard/Transmuter|Transmuter's Stone#10` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained

### ADV (380 uncovered)

- `feat|Child of the Sun|Child of the Sun#2` You and allies within 10 feet of you have Advantage on saving throws made to avoid or end the Blinded condition. | no record for ADV; number 10 unexplained
- `feat|Familiar Friend|Familiar Friend#9` While your familiar is within 5 feet of you, you have Advantage on ability checks that use skills you're proficient in. | no record for ADV,PROF
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
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
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsdm|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|tsgs|Dragon Tamer Lance#9` Moving 20 ft in a line toward a Medium or smaller target within 5 ft gives Advantage on the melee attack, and a hit allows an extra attack against a different target directly behind it within 5 ft and not behind Cover. | no record for ADV; number 20,5 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|tsgs|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `species|Elf/Shadow Fey Heritage|Supernatural Senses#2` Proficiency in Perception, and Advantage on Perception checks to notice or find a creature within 30 feet that lacks some of its hit points. | no record for ADV,PROF
- `sub|Artificer/Armorer|Perfected Armor#4` Giant Stature adds 10 feet of reach, can make you Large or Huge, and gives Advantage on Strength checks and saves while it lasts. | no record for ADV; number 10 unexplained
- `sub|Bard/College of Cantors|Minor Miracles#3` Divine Insight: a creature in range has Advantage on attack rolls for 1 minute, ending when it hits. | no record for ADV; number 1 unexplained
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Blessing of the Trickster#2` It has Advantage on Dexterity (Stealth) checks for 1 hour or until you use this again. | number 1 no record explains
- `sub|Cleric/Trickery Domain|Improved Duplicity#3` Attack rolls made by you and your allies against any creature within 5 feet of the illusion have Advantage. | number 5 no record explains
- `sub|Fighter/Corsair|Surprise Attack#1` Once per turn, deal an extra 1d6 damage to a creature you hit if you have Advantage on the attack. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of Safeguarding|Channel Divinity#3` For 1 minute each friendly creature within 30 ft that sees or hears you has Advantage on saves against spells and abilities that deal damage. | no record for ADV; number 30,1 unexplained
- `sub|Paladin/Oath of the Crown|Exalted Champion#4` You and your allies within 30 feet have Advantage on Wisdom saves. | no record for ADV; number 30 unexplained
- `sub|Rogue/Smuggler|Dab-handed Dealer#4` Cunning Action can fund a check to control a vehicle, or a Sleight of Hand check to conceal a light weapon on you, opposed by Perception of creatures within 5 ft. On a success you have Advantage on your next attack again | no record for ADV; number 5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Warlock/Wyrdweaver|Favored Soul#2` On a failure it has Disadvantage on that roll and you have Advantage on one d20 roll of your choice in the next minute. | no record for ADV,CHOICE,DIS; number 1d20 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#2` For 1 minute (or until you use this again) you have Advantage on saves against its spells and magical effects. | no record for ADV; number 1 unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### PROF (364 uncovered)

- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Focused Personas|Focused Personas#4` When you use Shape-Shifter to take that persona, you gain proficiency with the tool and can roll 1d4 and add it to ability checks with it. | number 1d4 no record explains
- `feat|Genius|Genius#2` You gain proficiency in four of these skills: Arcana, Data, History, Nature, Religion, Technology. | no record for PROF; number 4 unexplained
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | no record for PROF; number 5 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | number pb no record explains
- `item|bmt|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|dmg|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|dmg|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|dmg|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|dmg|Warrior's Passkey#5` You are considered proficient with the sword, and you have a +1 bonus to attack and damage rolls made with it. | no record for PROF
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|ftd|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|thhw|Chronicle of Fools#6` The target also adds double its Proficiency Bonus to that check unless it already has Expertise in the skill. | no record for PROF; number double,pb unexplained
- `item|tsgs|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|tsgs|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tvss14|Brawling Gloves (uncommon)#2` You are proficient with all improvised weapons and gain +1 to attack and damage rolls made with them. | no record for DMG,PROF; number 1 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Spring Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `species|Summer Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | no record for PROF; number pb unexplained
- `sub|Bard/College of Investigation|Bonus Proficiencies#1` Gain proficiency in Insight and two of Acrobatics, Deception, Investigation, Performance, Sleight of Hand or Stealth. | number 2 no record explains
- `sub|Captain/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Cleric/Dragon Domain|Bonus Proficiency#1` You gain proficiency in Arcana, and your Proficiency Bonus is doubled on its checks. | number double,pb no record explains
- `sub|Cleric/Travel Domain|Well-Traveled#1` You gain proficiency with four finesse or ranged weapons of your choice and learn two languages of your choice. | no record for CHOICE,PROF; number 4,2 unexplained
- `sub|Fighter/Brawler|Brawling#1` You are proficient with improvised weapons and treat one-handed improvised weapons as Thrown (range 20/60). | no record for PROF; number 20,60 unexplained
- `sub|Investigator/Kid Sleuth|Animal Sidekick#6` The animal has Intelligence 10 and speaks one language you know. | no record for PROF; number 10 unexplained
- `sub|Sorcerer/Reincarnated Hero|Armored Sorcery#1` You gain proficiency with light armor, medium armor, shields and four martial weapons of your choice. | no record for CHOICE,PROF; number 4 unexplained
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF

### NUM (344 uncovered)

- `feat|Charger|Charger#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Heavily Armored|Heavily Armored#2` Pick Constitution or Strength and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Inspiring Leader|Inspiring Leader#2` Pick Wisdom or Charisma and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Observant (2014)|Observant (2014)#6` You get a +5 bonus to passive Wisdom (Perception) and passive Intelligence (Investigation). | number 5 no record explains
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Resilient|Resilient#3` That score increases by 1 (maximum 20). | number 20 no record explains
- `feat|Roguean|Roguean#7` You can endure temperatures from -100 to 300 degrees Fahrenheit. | number 100,300 no record explains
- `feat|Sentinel|Sentinel#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | number 1,20 no record explains
- `item|coa|Ranseur of Torture#11` - 1 minor detrimental property | number 1 no record explains
- `item|coa|Ranseur of Torture#9` - 1 minor beneficial property | number 1 no record explains
- `item|coa|Scourge of Shadow#13` - 1 major detrimental property | number 1 no record explains
- `item|crcotn|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | number 2d4,2 no record explains
- `item|dmg|Accounting and Valuation of All Things#7` - 1 major detrimental property | number 1 no record explains
- `item|dmg|Amulet of the Inferno#8` - 2 major detrimental properties | number 2 no record explains
- `item|dmg|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Deck of Many Things#18` You can't lower a score that is 5 or less. | number 5 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Figurine of Wondrous Power (ivory goats)#15` You can pull off its horns without hurting it and use them as weapons: one horn turns into a +1 Lance, and the other turns into a +2 Longsword. | number 2 no record explains
- `item|dmg|Figurine of Wondrous Power#24` Hit Points 19 (3d10 + 3). | number 3d10,19,3 no record explains
- `item|dmg|Flashback Polaroid#1` An antique camera loaded with 1d6 + 2 blank photos. | number 1d6,2 no record explains
- `item|dmg|Folding Boat#13` The Folding Boat is destroyed if either boat is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Frostmourne#4` A creature reduced to 0 Hit Points by it dies and its soul is trapped in the sword, so it cannot be raised until the sword is destroyed. | number 0 no record explains
- `item|dmg|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|dmg|Luba's Tarokka of Souls#13` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Manual of Gainful Exercise#2` If you spend a total of 48 hours studying what the book teaches and practicing its guidelines, over a span of no more than 6 days, you gain 2 points of Strength, which can raise that score as high as 30 but not higher. | number 48,6,2,30 no record explains
- `item|dmg|Medal of the Meat Pie#1` You gain 2d4 + 2 temporary hit points when you use an action to press this medal to your mouth. | number 2d4,2 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Scourge of Shadow#11` - 1 major beneficial property | number 1 no record explains
- `item|dmg|Skitterlegs#5` Eliminate: they move to the nearest hostile and make two melee attacks at +7, dealing 1d8 + 2 Piercing each. | number 1d8,7,2 no record explains
- `item|dmg|Weapon of Spite#3` Against a creature that has damaged you since the end of your last turn, the bonus is +2. | number 2 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#6` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#11` - 1 minor detrimental property | number 1 no record explains
- `item|tdm14|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsdm|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|wdmm|Horn of the Endless Maze#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#1` When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. | number 0 no record explains
- `sub|Bard/College of Sincerity|Entourage#8` The GM may allow a humanoid of Challenge Rating 1/8 or lower for the guard, 1 or lower for the spy, or 3 or lower for the veteran. | number 1 no record explains
- `sub|Warmage/House of Cards|Deck of Fate#16` Clubs (any two): +1 to saving throws until the start of your next turn. | number 1,2 no record explains
- `sub|Wizard/Timekeeper|Temporal Points#5` Option two: your AC rises by 2. | number 2 no record explains

### RES (330 uncovered)

- `item|dmg|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|dmg|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot. | no record for DC; number 16 unexplained
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|dmg|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES; number 1 unexplained
- `item|tdcsr|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|tkdm|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|tsdm|Psionic Piercing#26` Psychic Resistance (1). | number 1 no record explains
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|tsgs|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|tsgs|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|tvss14|Lady and Lord Rings#3` While within 30 ft of each other both have resistance to all damage, and each time one takes damage the other loses the same number of hit points. | no record for RES; number 30 unexplained
- `species|Worgen|Darkflight#3` In the form your Speed rises by 10 feet, you have Resistance to Necrotic damage, and as a Reaction you can move up to 10 feet without Opportunity Attacks when a creature ends its turn within 5 feet of you. | no record for RES,SPEED; number 10,5 unexplained
- `sub|Cleric/Shadow Domain|Dispersion#1` Reaction when an attack roll hits you: until the end of your next turn you have Resistance to all damage (including the triggering hit), a 40-foot Fly Speed, and you cannot take actions, Bonus Actions, or Reactions. | no record for RES,SPEED; number 40 unexplained
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Fighter/Rune Knight|Rune Carver#19` As a Bonus Action gain Resistance to Bludgeoning, Piercing, and Slashing damage for 1 minute. | number 1 no record explains
- `sub|Investigator/Exterminator|Trinkets#5` You have Resistance to that type for 1 minute. | no record for RES; number 1 unexplained
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | no record for RES,RESOURCE; number 1,3 unexplained
- `sub|Monk/Way of the Humble Elephant|Thick Hide#1` As a bonus action, spend 5 Ki to gain Resistance to Bludgeoning, Piercing and Slashing damage for 10 minutes. | no record for RES; number 10,5 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Paladin/Oath of The Sun|Sun's Warmth#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage and tolerate temperatures from -50 to 300 degrees Fahrenheit. | no record for RES; number 10,50,300 unexplained
- `sub|Paladin/Oath of Winter|Frigid Aura#1` You and friendly creatures within 10 ft have Resistance to Cold and Fire damage. | number 10 no record explains
- `sub|Paladin/Oath of the Elements|Aura of Resistance#2` You and friendly creatures within 10 ft have Resistance to that damage. | no record for RES; number 10 unexplained
- `sub|Paladin/Oath of the Plaguetouched|Aura of Radiant Energy#1` You and allies within 10 ft have Resistance to Necrotic damage. | number 10 no record explains
- `sub|Sorcerer/Wretched Bloodline|Terrifying Visage#4` Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. | no record for RES; number 30 unexplained
- `sub|Warlock/Primordial|Adaptive Shroud#2` If you also spend a spell slot, the Resistance lasts a number of rounds equal to your Proficiency Bonus. | no record for RES,SLOT; number pb unexplained
- `sub|Wizard/Chaos|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### SLOT (294 uncovered)

- `class|Evoker|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Sorcerer|Font of Magic#13` The highest slot level you can create is 5. | no record for SLOT; number 5 unexplained
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | no record for SLOT; number half unexplained
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | no record for SLOT; number 2 unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | no record for DMG,SLOT,SPELL; number 1d4 unexplained
- `item|dmg14|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Flame of Ingenuity#10` By meditating on the flame for 1 minute, you regain spell slots totaling up to 5 levels, divided as you like. | no record for SLOT; number 5 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|twow|Potion of Rejuvenation (Superior)#1` Drink: Regain 9d4 + 9 Hit Points and one expended spell slot of level 1 to 5, your choice. | no record for RESOURCE,SLOT; number 9d4,9 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Ranger/Green Reaper (2014)|Toxic Tradecraft#3` Once per turn when you hit with a weapon or ammunition coated by Envenomed Attack, spend a spell slot to add a magical toxin: an extra 1d6 Poison damage, and the target is Poisoned until the end of your next turn. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Ranger/Green Reaper|Toxic Tradecraft#10` Slot level 5: Enhanced (one level 4 effect and one more from level 1 or 2), Stinging Application (for 1 minute, once per turn a hit with a poisoned item deals extra 5d6 Acid, Necrotic or Poison damage, your choice). | no record for DMG,SLOT; number 5d6,1 unexplained
- `sub|Warlock/The Coven|Hag's Craft#1` Expend a spell slot to turn a vessel into a Hag's Cauldron for 10 minutes. | no record for SLOT; number 10 unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Warlock/The First Vampire|Eldritch Appetite#1` When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#1` As a bonus action, spend a 1st-level spell slot so your next arrow from a longbow or shortbow deals an extra 2d4 Force damage on a hit. | no record for DMG,SLOT; number 2d4 unexplained
- `sub|Wizard/Courser Mage|Spell Arrow#2` A higher slot adds 1d4 per slot level above 1st. | no record for SLOT; number 1d4 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Heart#2` It lasts 3 rounds per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 3 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained

### CHOICE (235 uncovered)

- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | no record for CHOICE; number 2 unexplained
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | no record for CHOICE; number 2 unexplained
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | no record for CHOICE; number 6 unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|dmg|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tdm14|Un's Codex#3` Spending 10 hours of experiment unlocks one trait of your choice. | no record for CHOICE; number 10 unexplained
- `item|tgh14p|Rod of the Pack Master#2` While holding it, choose any number of willing creatures you see within 30 ft. You can hold it in your teeth, and it works in hybrid or kindred form. | no record for CHOICE; number 30 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Fireforge Dwarf|Expert Artisan#2` Pick one, and your Proficiency Bonus is doubled on ability checks that use it. | no record for CHOICE; number double,pb unexplained
- `species|Near-Human (DM14)|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Near-Human|Ability Score Increase#1` Two different ability scores of your choice rise by 1. | no record for CHOICE; number 1,2 unexplained
- `species|Ogresh (GH14)|Languages#1` You speak, read and write three languages of your choice. | no record for CHOICE; number 3 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Druid/Circle of the Obelisk|Evolutionary#3` One ability score of your choice on that creature rises by the roll, to a maximum of 20, for 1 minute. | no record for CHOICE; number 1 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#2` Or you can choose an ally within 30 feet who can see or hear you. | no record for CHOICE; number 30 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Elemental Spirit|Twin Eidolons#7` Your magic sustains both for 10 minutes, then one of your choice dissipates. | no record for CHOICE
- `sub|Warmage/House of Dice|Chaos Roll#23` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (116)

- `class|Sorcerer|Spellcasting#13` To begin, pick two level 1 Sorcerer spells. | angka: 2
- `class|Jaeger|Flexible Combatant#3` If you wield a weapon in one hand and a one-handed ranged weapon in the other, you take no Disadvantage from enemies within 5 feet on attacks with that ranged weapon. | angka: 5
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | angka: half
- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Martyr|Divine Respite~2#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Captain|Coordinated Strike#1` Once per turn, when you take the Attack action and hit with a weapon, you deal an extra 2d8 damage if your Cohort has damaged that target since the end of your last turn. | angka: 2d8
- `class|Captain|Cohort~3#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Investigator|Finisher#2` The extra damage is 1d8 at level 2, 2d8 at level 11, and 3d8 at level 17. | angka: 1d8
- `class|Demon Hunter|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | angka: 1d10,1d6
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | angka: 3
- `class|Rogue|Cunning Strike#5` For example, to add the Poison effect, you take 1d6 away from the Sneak Attack damage before you roll. | angka: 1d6
- `class|Captain|Cohort~4#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Wizard|Spellcasting#13` At first, it has six level 1 Wizard spells of your choice. | angka: 6
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | angka: 0
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Warlock|Magical Cunning#2` When it ends, you regain expended Pact Magic spell slots, up to half your maximum number of slots (round up). | angka: half
- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | angka: 2
- `class|Shaman|Fast Movement#1` As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. | angka: 10
- `class|Fighter|Tactical Shift#1` Each time your Bonus Action activates Second Wind, you can also move a distance of up to half your Speed. | angka: half
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Evoker|Font of Magic#13` The highest slot level you can create is 5. | angka: 5
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb

### feat (260)

- `feat|Tadpole's Safeguard|Tadpole's Safeguard#5` You have Telepathy with a range of 10 feet, or +10 feet if you already have it. | angka: 10
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Tireless Reveler|Tireless Reveler#3` You can do this a number of times equal to your Proficiency Bonus, and regain all expended uses after a Short or Long Rest. | angka: pb
- `feat|Boon of Recovery|Boon of Recovery#4` If you would be brought to 0 Hit Points, you have the option to go to 1 Hit Point instead and then regain Hit Points equal to half your Hit Point maximum. | angka: half
- `feat|Dual Wielder|Dual Wielder#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Grappler|Grappler#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 20
- `feat|Depth Module|Depth Module#8` You gain blindsight 5 ft, which extends to 20 ft underwater. | angka: 5,20
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#2` On your first turn after an Initiative roll, add 1d4 to the first damage roll you make. | angka: 1d4
- `feat|Upgraded|Upgraded#4` As a Magic action, you can swap your Thermalsight for Blindsight with a range of 10 feet or Darkvision with a range of 120 feet. | angka: 10,120
- `feat|Insectoid|Insectoid#2` Your antennae give you blindsight 10 feet. | angka: 10
- `feat|Knight of the Sword|Knight of the Sword#7` It makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Cannoneer|Cannoneer#4` You can do this only if you have not moved this turn, and your Speed is 0 until the end of the turn afterward. | angka: 0
- `feat|Configuration Upgrade|Configuration Upgrade#1` When you use Reconfigurable Ability Score Increase, you can raise one ability score by 3, or three different scores by 1, to a maximum of 20. | angka: 3,1
- `feat|Boon of Energy Resistance|Boon of Energy Resistance#8` That creature attempts a Dexterity saving throw against a DC of 8 plus your Proficiency Bonus plus your Constitution modifier, and on a failure it takes damage of that type equal to 2d12 plus your Con | angka: 2d12,8,pb
- `feat|Shadowsteel Ghoul Transformation: Stage 4|Shadowsteel Ghoul Transformation: Stage 4#5` The first time you are Bloodied or drop to 0 Hit Points after finishing a Short Rest or Long Rest, the Shadowsteel in your flesh lashes out. | angka: 0
- `feat|Boon of Truesight|Boon of Truesight#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Pyromaniac (Dark Matter)|Pyromaniac (Dark Matter)#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | angka: 2
- `feat|Mage Slayer|Mage Slayer#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 20
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | angka: 0
- `feat|Keen Mind|Keen Mind#2` Raise your Intelligence by 1 (maximum 20). | angka: 1,20
- `feat|Downcaster|Downcaster#1` If you learn spells, you learn four spells of 3rd level or lower from your class list, of levels you have slots for. | angka: 4
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | angka: 0
- `feat|Fists of Fury|Fists of Fury#5` When you deal damage to a creature with an Unarmed Strike, add +1 to the damage roll for each earlier melee attack roll that hit that creature in the same turn. | angka: 1
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | angka: 30
- `feat|Boon of the Night Spirit|Boon of the Night Spirit#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Poisoner|Poisoner#10` A creature that takes damage from the coated item makes a Constitution saving throw against a DC of 8 plus your Proficiency Bonus plus the modifier of the ability this feat increased. | angka: 8,pb
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#10` On a hit it deals 1d10 Force damage, and the target must succeed on a Strength saving throw (DC 8 + your Proficiency Bonus + that ability modifier) or be knocked Prone. | angka: 1d10,8,pb
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | angka: 2
- `feat|Echoing Soul|Echoing Soul#8` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Boon of the Bandit King|Boon of the Bandit King#2` Pick one ability score and raise it by 1 (maximum 30). | angka: 1,30

### item (1843)

- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | angka: 2
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a ho | angka: 3d8,5,15
- `item|dmg|Luma Feather Robe#3` While you wear it, your Intelligence or Charisma becomes 22 (choose when you first attune) and you gain a +1 bonus to saving throws. | angka: 22
- `item|dmg|Gauntlets of Rage#4` Each time you deal damage, you regain 2d8 hit points and may immediately remove a condition you currently suffer from or end this fury. | angka: 2d8
- `item|wbtw|Iggwilv's Cauldron#39` At the same time, all Humanoid creatures within a certain radius of the cauldron fall unconscious for 1 hour, except those that are attuned to the cauldron or immune to being charmed. | angka: 1
- `item|misc14|Charm of Cozmioko's Glory#3` Light: regain 28 (8d6) Hit Points. | angka: 8d6,28
- `item|dmg|Figurine of Wondrous Power (ebony fly)#17` Hit Points 19 (3d10 + 3). | angka: 3d10,19,3
- `item|wdh|Blackstaff#11` On a 20, the staff regain 1d8 + 2 charges. | angka: 1d8
- `item|wbtw|Eldritch Staff#6` When you hit with a melee attack using the staff, you can expend up to 3 of its charges. | angka: 3
- `item|tghg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | angka: 8d6
- `item|oota|Spell Gem (Ruby)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|wdmm|Blast Scepter#2` Whoever is attuned to the Blast Scepter gains resistance to fire and lightning damage and can, as an action, use it to cast thunderwave as a 4th-level spell (save DC 16) without expending a spell slot | angka: 16
- `item|dmg|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | angka: 40
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | angka: double,pb
- `item|coa|Scourge of Shadow#17` If attacking a good aligned creature, or attacking with the weapon unattuned, the necrotic damage dice are also increased to a d6 instead of a d4. | angka: 1d6,1d4
- `item|ai|Orrery of the Wanderer#31` As long as the orrery is within 30 feet of you, you gain a +1 bonus to AC. | angka: 30
- `item|tgh14c|Aether Blood#2` For 1 hour after you drink it, a spell slot you use counts as 1 level higher when setting the level the spell is cast at. | angka: 1,1
- `item|dmg|Hivemaster Pistol#3` Once per turn when you fire it automatically, you can fire 6 times with Disadvantage instead of twice. | angka: 6,double
- `item|dmg|Ring of Shooting Stars#18` For each charge spent, the ring hurls a shining speck of light toward a point in your view no more than 60 feet away. | angka: 60
- `item|dmg|Will of the Talon (Awakened)#14` - The saving throw DC for the war pick's Frightful Presence property increases to 15. | angka: 15
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | angka: 20
- `item|rhw|Ebonbane#13` When you hit a Celestial or a Humanoid with it, that attack also deals 3d6 Necrotic damage. | angka: 3d6
- `item|dmg|Wand of the War Mage, +1#2` Also, Half Cover doesn't apply against your spell attack rolls. | angka: half
- `item|tsgs|Thornpiercer#9` On a roll of 20, the target takes an extra 10 Piercing damage. | angka: 10
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | angka: 15
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | angka: 1
- `item|dmg|+2 Fate Dealer's Deck#4` One creature you can see within 30 feet of you either takes radiant damage or regains hit points (your choice) equal to the total. | angka: 30
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | angka: 1d8,30,double
- `item|tvss14|Switch Amalgam#4` Once on two weapons, both become magical with +1 to attack and damage rolls (not if already magical with a bonus), and both gain the Switch property: two forms, swap between them at any time, even bet | angka: 1,2
- `item|tftyp|Loadstone#6` Until the curse is broken with remove curse or similar magic, your speed is reduced by 5 feet, and your maximum load and maximum lift capacities are halved. | angka: 5

### species (139)

- `species|Kobold Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Tiefling Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Elf|Trance#2` A Long Rest takes 4 hours of meditation. | angka: 4
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Kobold Heritage|Devious Bite#1` When you hit with your bite while you have Advantage on the attack roll, it deals an extra 1d4 Piercing damage. | angka: 1d4
- `species|Drow Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Naga|Speed Burst#1` Bonus Action with both hands free: your walking Speed rises by 5 ft until the end of your turn. | angka: 5
- `species|Dragonborn Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Gnoll|Bite#2` Your unarmed strikes with it deal 1d4 + Strength modifier Piercing damage. | angka: 1d4
- `species|Skathári|Gliding Wings#2` While falling you can move 10 feet sideways for every 5 feet you fall, up to your Speed. | angka: 10,5
- `species|Drow; Star Elf|Drow Subtlety#1` When you hide, conceal a weapon or take any action contested by a creature's passive Perception, you can subtract 5 from that score. | angka: 5
- `species|Pluvenn|Nocturnal/Diurnal#1` You have Darkvision 60 ft. A Long Rest takes you only 4 hours. | angka: 4
- `species|Harengon (WBtW)|Hare-Trigger#1` Add your Proficiency Bonus to your initiative rolls. | angka: pb
- `species|Human and Half-Elf Heritage|Undead Vitality#2` Instead you go dormant, like a corpse but semiconscious, for 6 hours a day, with Disadvantage on Perception checks while dormant. | angka: 6
- `species|Star Dwarf|Stonecunning#1` On an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Spring Mandrake|Plant Nature#3` Even without Stealth proficiency, you add your Proficiency Bonus to Dexterity (Stealth) checks to hide in natural places such as forests. | angka: pb
- `species|Nautilid (DM14)|Aqua Suit#6` While you wear it, your AC is 13 + your Dexterity modifier, and other armor can be fitted around it at no cost. | angka: 13
- `species|Gnome Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Malkin Catfolk|Cat's Claws#1` Your claws are natural weapons for Unarmed Strikes and deal 1d4 + Strength modifier Slashing damage instead of Bludgeoning. | angka: 1d4
- `species|Orc (Ixalan)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | angka: double,pb
- `species|Trollkin Heritage|Powerful Jaw#1` Your bite is a natural weapon for Unarmed Strikes and deals 1d4 + Strength modifier Piercing damage instead of Bludgeoning. | angka: 1d4
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10

### sub (905)

- `sub|Wizard/Illusionist|Phantasmal Creatures#3` You can cast the Illusion version of each of these spells without expending a spell slot, but doing so cuts the creature's Hit Points in half. | angka: half
- `sub|Necromancer/Reaper|Wraith Flight#2` A thrall that already flies has its Fly Speed doubled. | angka: double
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | angka: double
- `sub|Cleric/Inquisition Domain (2014)|Witch Hunter's Strike#1` When you hit with a weapon attack, deal an extra 1d8 Force damage, or 2d8 if the target is concentrating on a spell. | angka: 1d8,2d8
- `sub|Bard/College of Dance|Inspiring Movement#2` You then move a distance of up to half your Speed. | angka: half
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | angka: 1,0
- `sub|Artificer/Artillerist|Eldritch Cannon#21` The cannon and each creature you choose within 10 feet of it gain Temporary Hit Points equal to 1d8 + your Int modifier (minimum +1). | angka: 1d8,10
- `sub|Druid/Circle of the Titan|Titan Form#16` Energizing Pollen: spend a level 1+ slot and move up to half Speed without Opportunity Attacks, healing each creature you pass within 5 feet for 2d6 per slot level, once per creature per turn. | angka: 2d6,5,half
- `sub|Sorcerer/Nanite Magic|Nano Touch#3` Nano-Degradation (1 or 2 points): a creature within 5 ft takes a -2 AC penalty per point until the start of your next turn. | angka: 5,1,2
- `sub|Captain/Eagle Banner|Close-Quarters Shooting#1` Being within 5 feet of an enemy does not give Disadvantage on your attack rolls with Ranged weapons. | angka: 5
- `sub|Druid/Circle of Mutation|Endless Evolution#4` Tremorsense 30 ft. 2 more points give a Burrow Speed equal to your Speed. | angka: 30,2
- `sub|Wizard/Abjurer|Arcane Ward#3` The ward lasts until you finish a Long Rest, and its Hit Point maximum equals twice your Wizard level plus your Intelligence modifier. | angka: double
- `sub|Dancer/Fey Ballerina|Swan Song#2` You regain Hit Points up to half your Hit Point maximum, and you have Advantage on the first D20 Test you make each turn until your Dance ends. | angka: 1d20,half
- `sub|Rogue/Infiltrator (2014)|Infiltration Rig#3` You have Darkvision to 60 ft, or +30 ft if you already have it. | angka: 60,30
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | angka: 2
- `sub|Warlock/Vestige Patron|Vestige Companion#12` You can spend 1 minute on a magical ceremony to bring it back at its maximum Hit Points in an unoccupied space within 5 feet of you. | angka: 5,1
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | angka: 1d4
- `sub|Paladin/Oath of the Hearth|Burning Spirit#6` Your Speed rises by 10 ft. You can move through and stop in spaces held by other creatures as if empty, and ending your turn in a shared space does not knock you or the other creature Prone. | angka: 10
- `sub|Rogue/Dawn Blade|Radiant Beam#1` When you deal Radiant damage to a creature with a melee weapon attack, use a bonus action to hurl some of it at a different creature you see within 30 ft. Make a ranged weapon attack you are proficien | angka: 30,5
- `sub|Cleric/Hunting Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | angka: 2d8
- `sub|Wizard/Enchanter|Enchantment Savant#1` Choose two Wizard spells from the Enchantment school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Witch/Lunar Magic|Moonsight#1` You gain Darkvision with a range of 60 ft. If you already have Darkvision, its range grows by 60 ft. | angka: 60
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | angka: 20
- `sub|Sorcerer/Storm Sorcery|Wind Soul#2` As an action you can lower your Fly Speed to 30 feet for 1 hour and give creatures within 30 feet, up to 3 plus your Charisma modifier, a magical Fly Speed of 30 feet for 1 hour. | angka: 30,3
- `sub|Dancer/Fey Ballerina|Sublime Start#1` On the first round of combat, your Speed is doubled and you automatically succeed on saving throws. | angka: double
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | angka: 5
- `sub|Monk/Way of the Wild Cat|Improved Feline Reflexes#1` When you take no damage after succeeding on a Dexterity save thanks to Evasion, use your Reaction to move up to half your speed toward the source of the effect. | angka: half
- `sub|Cleric/Void Domain (DM14)|Darkvision#2` If you already have Darkvision, its range increases by 30 ft. From level 8 you see through magical darkness as well as nonmagical. | angka: 30
- `sub|Fighter/Banneret|Group Recovery#1` When you use Second Wind to regain Hit Points, you can pick a number of allies within a 30-foot Emanation from you, up to your Charisma modifier (minimum of one). | angka: 30
- `sub|Monk/Way of the Bow|Serenity of The Wind#1` As a bonus action, spend 1 ki to gain blindsight out to 120 ft until the end of your next turn. | angka: 120,1

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `species|Earth Genasi (2014)|Merge with Stone#1` You can cast Pass without Trace once per Long Rest with no Material components. -> info:REST:NONUM
- class `species|Earth Genasi (2014)|Merge with Stone#1` You can cast Pass without Trace once per Long Rest with no Material components. -> info:REST:NONUM
- record `sub|Warlock/The Star|Solar Flare#4` Short or Long Rest to use again. -> covered
- class `sub|Warlock/The Star|Solar Flare#4` Short or Long Rest to use again. -> info:REST:NONUM
- record `sub|Artificer/Forge Adept|Perfect Weapon#1` While you wield your Ghaal'Shaarat you gain three benefits. -> info:NUMONLY:TEXT
- class `sub|Artificer/Forge Adept|Perfect Weapon#1` While you wield your Ghaal'Shaarat you gain three benefits. -> info:NUMONLY:TEXT
- record `sub|Vagabond/Pugilist|Desperate Endurance#2` You can do this once, then you must finish a Long Rest to do it again. -> covered
- class `sub|Vagabond/Pugilist|Desperate Endurance#2` You can do this once, then you must finish a Long Rest to do it again. -> info:REST:NONUM
- record `item|cos|Crusader's Shortsword#8` - A lawful good creature can attune itself to the sword in 1 minute. -> info:NUMONLY:GEOMETRY
- class `item|cos|Crusader's Shortsword#8` - A lawful good creature can attune itself to the sword in 1 minute. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Hurricane Lance#4` Spend a second charge (no action) to extend this to your mount. -> info:REST:NONUM
- class `item|dmg|Hurricane Lance#4` Spend a second charge (no action) to extend this to your mount. -> info:REST:NONUM
- record `class|Warden|Font of Life#3` A Short Rest regains one expended use. -> info:REST:NONUM
- class `class|Warden|Font of Life#3` A Short Rest regains one expended use. -> info:REST:NONUM
- record `sub|Rogue/Phantom (2014)|Ghost Walk#4` To use it again, finish a Long Rest or destroy a soul trinket as part of activating it. -> covered
- class `sub|Rogue/Phantom (2014)|Ghost Walk#4` To use it again, finish a Long Rest or destroy a soul trinket as part of activating it. -> info:REST:NONUM
- record `sub|Witch/Steel Magic|Steel Spells#4` 7 Death Ward, Freedom of Movement. -> info:NUMONLY:TABLE
- class `sub|Witch/Steel Magic|Steel Spells#4` 7 Death Ward, Freedom of Movement. -> info:NUMONLY:TABLE
- record `sub|Alchemist/Amorist|Alchemical Romance#6` One creature with the Bomb's Charmed condition stays Charmed for 1 minute or until it takes damage. -> info:NUMONLY:GEOMETRY
- class `sub|Alchemist/Amorist|Alchemical Romance#6` One creature with the Bomb's Charmed condition stays Charmed for 1 minute or until it takes damage. -> info:NUMONLY:GEOMETRY
- record `item|mot|Ephara's Votary#4` After using this reroll, you cannot do so again until you finish a Long Rest. -> info:REST:NONUM
- class `item|mot|Ephara's Votary#4` After using this reroll, you cannot do so again until you finish a Long Rest. -> info:REST:NONUM
- record `sub|Artificer/Forge Adept|Variant Capstone: Weapon of Legend#2` While you wield your Ghaal'Shaarat you gain three benefits. -> info:NUMONLY:TEXT
- class `sub|Artificer/Forge Adept|Variant Capstone: Weapon of Legend#2` While you wield your Ghaal'Shaarat you gain three benefits. -> info:NUMONLY:TEXT
- record `item|dmg|Belt of Fire Giant Strength#1` While wearing this belt, your Strength score changes to 25. -> info:NUMONLY:TABLE
- class `item|dmg|Belt of Fire Giant Strength#1` While wearing this belt, your Strength score changes to 25. -> info:NUMONLY:TABLE
- record `item|ggr|Sunforger#5` You can't cause it to explode again until you finish a short or long rest. -> info:REST:NONUM
- class `item|ggr|Sunforger#5` You can't cause it to explode again until you finish a short or long rest. -> info:REST:NONUM
- record `sub|Warden/Diabolist|Infernal Command#4` A Short Rest regains one expended use. -> covered
- class `sub|Warden/Diabolist|Infernal Command#4` A Short Rest regains one expended use. -> info:REST:NONUM
