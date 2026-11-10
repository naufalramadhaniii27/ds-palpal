# Laporan clause gate (mode laporan, 2026-11-10)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73254 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36782 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 7423 |
| Info (tag terdokumentasi) | 23853 (SPELL_TEXT 6470, FORM:ACTIVATE 2644, NUMONLY:GEOMETRY 2233, FORM:ROLL 1879, FXO_NULL 1384, NUMONLY:TEXT 1348, ACTIVATE 1309, NUMONLY:ROLL 1003, FORM:TABLE 916, NUMONLY:TABLE 871, ACTIVE:TRIGGER 804, ACTIVE:OTHERS 645, REST:NONUM 588, NUMONLY:FLAVOR 305, STD:ASI 208, COND:PLAY_STATE 186, NUMONLY:ZERO 162, ROLL:LAST_CHARGE 136, OBJECT:STATS 106, BY_DESIGN 87, ITEM:SENSES 82, DC:REFERENCE 77, TABLE:CLASS 70, COND:ATTACK_ROLL_ADV 68, STD:PICK_TEXT 65, ACTIVE:REACTION 56, MOVE:SPEED_REF 50, ACTIVE:TIMED_IMM 43, TARGET:SPEED 30, FOCUS:SPELLCASTING 14, STD:AC10 7, KNOW:TARGET_DEFENSES 7) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5506 |
| Uncovered dengan angka | 3190 |
| Uncovered dengan kelas kata kunci mekanik | 5145 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 361 |
| Angka yang tidak dijelaskan record mana pun | 2979 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4692 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 320 |
| Waktu | muat data 6 s, analisis 7 s |

Uji mutasi pada data nyata (seed 7): 298 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 178 ditangkap (59.7%). Hapus semua atom kelas yang dibutuhkan: 184 ditangkap (61.7%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 293 ditangkap (97.7%), semua atom kelas dihapus: 298 ditangkap (99.3%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3097 |
| GX | 1607 |
| wxs | 664 |
| LU_X | 536 |
| species | 352 |
| ITEM_SPELLS | 349 |
| AUTO | 315 |
| SPELL_FX | 241 |
| feat | 234 |
| cls | 132 |
| SAVE_NOTES | 74 |
| FXO | 48 |
| SPELLS | 37 |
| CODE | 24 |
| FDMG | 15 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 206, fx-L4.js 166, fx-L12.js 145, fx-L2.js 130, fx-L3.js 129, fx-L10.js 126, fx-L1.js 113, fx-N1.js 99, fx-L9.js 94, fx-L11.js 89, fx-L6.js 86, fx-L8.js 64.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 901 | 13.5% |
| SPELL | 2882 | 829 | 28.8% |
| DMG | 3912 | 763 | 19.5% |
| PROF | 883 | 457 | 51.8% |
| SPEED | 1137 | 450 | 39.6% |
| ADV | 1516 | 425 | 28.0% |
| RES | 1123 | 378 | 33.7% |
| CHOICE | 1345 | 377 | 28.0% |
| NUM | 7110 | 322 | 4.5% |
| SLOT | 1121 | 320 | 28.5% |
| IMM | 852 | 315 | 37.0% |
| DC | 2624 | 282 | 10.7% |
| ATK | 860 | 227 | 26.4% |
| DIS | 932 | 214 | 23.0% |
| AC | 593 | 167 | 28.2% |
| SENSE | 515 | 156 | 30.3% |
| SAVE | 272 | 150 | 55.1% |
| HP | 143 | 86 | 60.1% |
| NUM-DICE | 1262 | 71 | 5.6% |
| ABIL | 357 | 62 | 17.4% |
| INIT | 111 | 56 | 50.5% |
| NUM-DUR | 2748 | 34 | 1.2% |
| NUM-DIST | 4404 | 30 | 0.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1028 | 229 | 559 | 0 | 240 |
| feat | 2101 | 487 | 1049 | 0 | 565 |
| item | 18391 | 4152 | 11179 | 0 | 3060 |
| species | 1037 | 570 | 298 | 0 | 169 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1707 | 4298 | 0 | 1472 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2302 | 6179 | 1670 | 16.5% |
| tvss | 2815 | 616 | 1655 | 544 | 19.3% |
| core | 1503 | 371 | 810 | 322 | 21.4% |
| tsgs | 1483 | 365 | 857 | 261 | 17.6% |
| tsdm | 1222 | 303 | 679 | 240 | 19.6% |
| tkdm | 919 | 177 | 502 | 240 | 26.1% |
| tghp | 1117 | 352 | 567 | 198 | 17.7% |
| tce | 736 | 120 | 464 | 152 | 20.7% |
| egw | 566 | 130 | 298 | 138 | 24.4% |
| au | 536 | 100 | 313 | 123 | 22.9% |
| phb14 | 516 | 144 | 263 | 109 | 21.1% |
| dmg14 | 540 | 147 | 285 | 108 | 20.0% |
| tdcsr | 416 | 123 | 191 | 102 | 24.5% |
| thhw | 395 | 79 | 235 | 81 | 20.5% |
| tee24 | 464 | 162 | 232 | 70 | 15.1% |
| rhw | 232 | 52 | 115 | 65 | 28.0% |
| xge | 375 | 92 | 219 | 64 | 17.1% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| hof | 253 | 37 | 155 | 61 | 24.1% |
| coa | 158 | 39 | 65 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 327 | 59 | 217 | 51 | 15.6% |
| tghg | 288 | 71 | 167 | 50 | 17.4% |
| oota | 87 | 20 | 23 | 44 | 50.6% |
| mot | 292 | 94 | 161 | 37 | 12.7% |
| tsgeh | 184 | 60 | 92 | 32 | 17.4% |
| bmt | 489 | 76 | 381 | 32 | 6.5% |
| bgg | 210 | 60 | 126 | 24 | 11.4% |
| ftd | 159 | 35 | 100 | 24 | 15.1% |
| psa | 67 | 19 | 27 | 21 | 31.3% |
| skt | 118 | 23 | 74 | 21 | 17.8% |
| tsae | 65 | 21 | 25 | 19 | 29.2% |
| dsotdq | 83 | 16 | 48 | 19 | 22.9% |
| wbtw | 92 | 17 | 56 | 19 | 20.7% |
| abh | 54 | 13 | 23 | 18 | 33.3% |
| bdd | 62 | 15 | 29 | 18 | 29.0% |
| idrotf | 134 | 28 | 88 | 18 | 13.4% |
| llk | 99 | 9 | 72 | 18 | 18.2% |
| scag | 67 | 22 | 29 | 16 | 23.9% |
| wdh | 95 | 22 | 57 | 16 | 16.8% |
| toa | 116 | 32 | 68 | 16 | 13.8% |
| wdmm | 79 | 13 | 50 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| ggr | 186 | 34 | 138 | 14 | 7.5% |
| frafi | 82 | 22 | 46 | 14 | 17.1% |
| ai | 164 | 22 | 129 | 13 | 7.9% |
| vrgr | 86 | 23 | 51 | 12 | 14.0% |
| tsdd | 69 | 23 | 34 | 12 | 17.4% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| erlw | 127 | 59 | 56 | 12 | 9.4% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 25 | 73 | 12 | 10.9% |
| bgdia | 114 | 27 | 75 | 12 | 10.5% |
| cos | 66 | 20 | 35 | 11 | 16.7% |
| pabtso | 69 | 23 | 35 | 11 | 15.9% |
| tshl | 69 | 20 | 39 | 10 | 14.5% |
| psk | 38 | 19 | 9 | 10 | 26.3% |
| aag | 40 | 18 | 12 | 10 | 25.0% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| cm | 60 | 12 | 41 | 7 | 11.7% |
| mtf | 64 | 48 | 10 | 6 | 9.4% |
| tftyp | 71 | 24 | 41 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| tdcg | 12 | 3 | 5 | 4 | 33.3% |
| efa | 28 | 9 | 15 | 4 | 14.3% |
| nf | 25 | 7 | 14 | 4 | 16.0% |
| imr | 186 | 2 | 181 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| gos | 12 | 6 | 4 | 2 | 16.7% |
| ttp | 5 | 2 | 2 | 1 | 20.0% |
| oga | 5 | 2 | 3 | 0 | 0.0% |
| lr | 5 | 4 | 1 | 0 | 0.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 6748 | 278 | 6470 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| RESOURCE | 640 | 524 |
| SPELL | 587 | 80 |
| DMG | 570 | 531 |
| PROF | 424 | 119 |
| ADV | 418 | 140 |
| SPEED | 385 | 294 |
| NUM | 322 | 322 |
| RES | 317 | 111 |
| SLOT | 303 | 92 |
| CHOICE | 235 | 67 |
| IMM | 211 | 64 |
| DIS | 179 | 65 |
| AC | 167 | 133 |
| SAVE | 144 | 123 |
| SENSE | 139 | 122 |
| ATK | 138 | 109 |
| DC | 135 | 133 |
| HP | 86 | 62 |
| ABIL | 50 | 47 |
| NUM-DIST | 19 | 19 |
| NUM-DICE | 19 | 19 |
| INIT | 17 | 13 |
| NUM-DUR | 1 | 1 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### RESOURCE (640 uncovered)

- `class|Gadgeteer|Overcharge#1` Once per turn, when you damage a creature with a weapon or a Gadget, you can deal 2 extra Lightning damage to it. | no record for DMG
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | no record for RESOURCE; number 6 unexplained
- `feat|Living Shadow|Living Shadow#6` You can do this a number of times equal to your Proficiency Bonus and regain all uses after a Long Rest. | number pb no record explains
- `feat|Portal Jumper|Portal Jumper#6` You can do this a number of times equal to your Proficiency Bonus, but only once per turn. | number pb no record explains
- `feat|Pyromaniac|Pyromaniac#4` You can cast each of those two spells once without a slot, and need a Long Rest to do so again. | no record for SPELL; number 2 unexplained
- `item|ai|Portfolio Keeper#1` At rank 2, you gain the use of a weathered leather pouch that is an uncommon magic item. | number 2 no record explains
- `item|dmg14|Manual of Iron Golems#5` To create an iron golem, you must spend 120 days, working without interruption with the manual at hand and resting no more than 8 hours per day. | no record for RESOURCE; number 120,8 unexplained
- `item|dmg|Cabal's Ruin (Exalted)#3` 4 charges, regains 1d4 at dawn. | no record for RESOURCE; number 1d4 unexplained
- `item|dmg|Cannith's Marvelous Miniatures#1` A feather-like token with one use. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Deck of Many Things#99` In addition, every day at dawn until you die, you gain 10 Temporary Hit Points. | no record for RESOURCE; number 10 unexplained
- `item|dmg|Eldritch Staff#7` For each charge you expend, the target takes an extra 1d8 lightning damage. | no record for DMG,RESOURCE; number 1d8 unexplained
- `item|dmg|Eye of Vecna#41` You regain 1d10 Hit Points when your turn starts, provided you have 1 Hit Point or more at that moment. | no record for RESOURCE; number 1d10,1 unexplained
- `item|dmg|Gloves of Soul Catching#3` After making a successful unarmed strike while wearing these gloves, you can use the gloves to deal an extra 2d10 force damage to the target, and you regain a number of hit points equal to the force damage dealt. | no record for DMG,RESOURCE; number 2d10 unexplained
- `item|dmg|Justiciar's Gavel#2` Once per turn, when you hit with a melee attack using it, fire its thrusters for an extra 1d4 Bludgeoning damage, or 1d6 if the target is Bloodied. | no record for RESOURCE
- `item|dmg|Reliquary Charm~2#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | number 7 no record explains
- `item|dmg|Starmetal Solar Axe#13` Each of these can be used only once per 12 hours. | no record for RESOURCE; number 12 unexplained
- `item|dmg|Ulmyr's Eye (Master)#11` While holding it, cast Foresight from it with no Material component and a 1 hour duration, once per Long Rest. | number 1 no record explains
- `item|dmg|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | no record for RESOURCE; number 30 unexplained
- `item|frafi|Tome of the Dragon#8` During the ritual, you and any assistants must work without interruption, resting no more than 8 hours per day. | no record for RESOURCE; number 8 unexplained
- `item|nf|Arcane Battery#3` If that magic item normally regains expended charges daily, it immediately regains 1d4 + 1 expended charges, and the battery loses its magic. | number 1d4 no record explains
- `item|tdcsr|Cabal's Ruin (Dormant)#4` When you hit with an attack, spend any number of charges for an extra 1d6 lightning damage per charge. | no record for DMG,RESOURCE; number 1d6 unexplained
- `item|tee24|Blast Disk (Common)#7` It has one charge, so the shards shatter on use. | no record for RESOURCE; number 1 unexplained
- `item|tsdm|Heart of Steel#4` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | no record for RESOURCE; number 4 unexplained
- `item|tsgs|Cinnabar Rapier#3` When you hit, spend 1 or more charges to deal an extra 1d4 Poison per charge. | no record for RESOURCE; number 1d4,1 unexplained
- `item|tsgs|Fragment of Elder Starlight#5` Chosen living allies regain 4d6 Hit Points. | number 4d6 no record explains
- `item|tsgs|Knight's Standard of Virtue#5` Changing the flag takes 1 hour of focus, possible during a Short Rest. | no record for RESOURCE
- `item|tsgs|Monocle of Clarity#1` A lens with three filters and 4 charges, regaining 1d3 + 1 at dawn. | number 3 no record explains
- `item|tsgs|Potion of Dragon's Breath (Very Rare)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | no record for RESOURCE; number 1d20,2 unexplained
- `item|wbtw|Pixie Dust#4` A small packet holds enough pixie dust for one use. | no record for RESOURCE; number 1 unexplained
- `species|Boggart|Fury of the Small#1` Once per turn, when you damage a creature larger than you with an attack roll or a spell, you deal extra damage equal to your Proficiency Bonus. | no record for DMG
- `species|Lizardfolk (2014)|Cunning Artisan#1` During a Short Rest you can harvest a slain Small or larger Beast, Construct, Dragon, Monstrosity, or Plant to craft a shield, club, javelin, or 1d4 darts or blowgun needles. | no record for RESOURCE; number 1d4 unexplained
- `species|Warforged|Sentry's Rest#2` You finish a Long Rest in 6 hours if you spend them inactive and motionless. | no record for RESOURCE; number 6 unexplained
- `sub|Cleric/Grave Domain|Circle of Mortality#3` Once per turn, when you hit a creature that is missing any Hit Points with a spell or an attack roll, it takes an extra 1d4 Necrotic damage. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Cleric/Nature Domain|Divine Strike#1` Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d8 Cold, Fire, or Lightning (your choice) damage. | no record for RESOURCE
- `sub|Dancer/Harlequin|Backflip#5` A Short Rest returns one use and a Long Rest returns all of them. | number 1 no record explains
- `sub|Druid/Circle of Dreams|Hearth of Moonlight and Shadow#1` During a Short or Long Rest you touch a point and an invisible 30-foot-radius sphere appears there, blocked by Cover. | no record for RESOURCE; number 30 unexplained
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | no record for DC,RESOURCE; number 10 unexplained
- `sub|Sorcerer/Aristocratic|Metamagic Mastery#1` Applying Metamagic to a spell from your school costs 1 less Sorcery Point. | no record for RESOURCE; number 1 unexplained
- `sub|Warden/Beastblood Guardian|Wild Pounce#1` Once per turn, when you hit a Large or smaller creature with a Melee weapon or an Unarmed Strike, it takes an extra 1d8 Slashing damage and has the Prone condition. | no record for DMG,RESOURCE; number 1d8 unexplained
- `sub|Warlock/Star Patron|Nova#1` Once per turn when you hit with a ranged attack roll, you can take 5 Radiant damage to deal an extra 1d8 Radiant damage to the target. | no record for DMG,RESOURCE; number 1d8,5 unexplained

### SPELL (587 uncovered)

- `class|Bard|Spellcasting#14` To begin, your list holds four level 1 spells that you pick from the Bard spell list. | no record for SPELL; number 4 unexplained
- `class|Healer|Spellcasting#3` You know two cantrips from the Healer spell list. | no record for SPELL; number 2 unexplained
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | no record for SPELL; number 3 unexplained
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | no record for SPELL; number 3 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Cleric)|Magic Initiate (Cleric)#2` Pick two cantrips on the Cleric spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Spell Sniper (2014)|Spell Sniper (2014)#3` When you cast a spell that requires an attack roll, its range is doubled. | no record for SPELL; number double unexplained
- `feat|Spellblade|Spellblade#3` You learn two of these cantrips: Arc Blade, Burning Blade, Frigid Blade or True Strike. | no record for SPELL; number 2 unexplained
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | no record for SPELL; number 2 unexplained
- `item|ai|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Gamma Pendant#9` You can also cast Greater Spells: Hardlight Frame 7, Orbital Hardlight Cannon 13, Wall of Force 7. | no record for SPELL; number 7,13 unexplained
- `item|dmg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Wand of Wonder#12` On 01 to 20, you cast a spell from the chosen point. | no record for SPELL; number 01,20 unexplained
- `item|dmg|Witchlight Vane#19` After the vane's polymorph spell is cast, roll a d8; on a roll of 3 or 8, the vane can't be used to cast this spell again until the next dawn. | number 1d8,8 no record explains
- `item|tce|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+3 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tee24|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `sub|Artificer/Mutagenist|Master Mutagenist#2` If you cast a third spell with Concoction Casting, you choose which of the two active spells ends. | no record for SPELL; number 2 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Arcana Domain|Magical Mastery#1` You learn four Wizard spells, one each of level 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | number 1 no record explains
- `sub|Dancer/Dramaturge|Spellcasting#3` You know two Bard cantrips. | number 2 no record explains
- `sub|Fighter/Prescient Knight|Spellcasting#7` You learn three level 1 spells at level 3 and more as you advance. | no record for SPELL; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | no record for SPELL; number 2 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#16` Invisibility (Fey, Fiend, Undead): 10 minutes of the Invisible condition, ending early if you dismiss it, attack, or cast a spell. | no record for SPELL; number 10 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#7` You know three 1st-level Wizard spells, two of which must be Enchantment or Illusion. | number 2 no record explains
- `sub|Sorcerer/Shadow Sorcery|Beasts of Ill Omen#5` If you do, the duration is 1 minute for that casting, and it ends early if you cast the spell again. | no record for SPELL; number 1 unexplained
- `sub|Wizard/Order of Scribes|One with the Word#6` You cannot cast the lost spells until you finish 1d6 Long Rests. | no record for SPELL; number 1d6 unexplained
- `sub|Wizard/White Necromancer|Life Bond#2` You can cast it once without a slot or its Material component, and its duration becomes 4 hours. | number 4 no record explains

### DMG (570 uncovered)

- `class|Craftsman|Weapon Enchantment#8` The weapon deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
- `feat|Arcane Charger|Arcane Charger#4` If you moved at least 10 feet in a straight line and the cantrip hits, you can either add +5 to its damage roll or push the target 10 feet away from you. | no record for DMG,SPELL; number 10,5 unexplained
- `feat|Perfect Landing|Perfect Landing#3` Your fall damage die is a d4 instead of a d6. | no record for DMG; number 1d4,1d6 unexplained
- `item|bgdia|Shatterstick#3` When the effects ends, the shatterstick breaks apart, becoming useless, and all structures within 20 feet of it take 35 (10d6) bludgeoning damage. | no record for DMG; number 10d6,20,35 unexplained
- `item|dmg|Agony (Awakened)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Festerwood Masher#6` When the hammer hits an affected target, it takes an extra 1d4 Acid damage per -1 of AC penalty. | no record for DMG; number 1d4,1 unexplained
- `item|dmg|Grovelthrash (Exalted)#14` When you hit with an attack using this warhammer, you can deal an extra 2d6 bludgeoning damage to the target. | no record for DMG; number 2d6 unexplained
- `item|dmg|Plate of the Dawnmartyr (Exalted)#8` The rebuke deals 2d6 fire damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Pyremaul (Awakened)#5` Hits deal an extra 1d6 fire damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Rod of Lordly Might#9` The blade works as a magic Longsword or Shortsword, whichever you choose, and deals an extra 2d6 Fire damage when it hits. | no record for DMG; number 2d6 unexplained
- `item|dmg|Shroud of Ending#6` While attuned, you deal 1d6 necrotic damage to any plant you touch that is not a creature, plant and beast creatures within 30 ft become hostile to you, and you stop aging and need no food or sleep. | no record for DMG; number 1d6,30 unexplained
- `item|dmg|Sword of Resonance#5` Your next hit with it before the end of your next turn deals an extra 1d6 Thunder damage. | number 1d6 no record explains
- `item|dmg|Will of the Talon (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Lash of Shadows (Exalted)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Mace of the Black Crown (Awakened)#31` - The weapon's bonus to attack and damage rolls increases to +2, and the extra fire damage dealt by the weapon when it is ignited increases to 2d6. | number 2d6 no record explains
- `item|egw|Ruin's Wake (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2, and the extra piercing damage dealt by the weapon increases to 2d8. | no record for DMG; number 2d8,2 unexplained
- `item|egw|Stormgirdle (Exalted)#15` - Your Storm Avatar's lightning strike deals 4d6 lightning damage (instead of 3d6). | no record for DMG; number 4d6,3d6 unexplained
- `item|egw|Verminshroud (Exalted)#24` If you hit with them, you deal piercing damage equal to 1d6 + your Strength modifier, instead of the bludgeoning damage normal for an unarmed strike. | no record for DMG; number 1d6 unexplained
- `item|frafi|Tome of the Dragon#10` When the ritual is complete, the tome explodes with violet light, dealing (12d6) Necrotic damage to you and each assistant. | no record for DMG; number 12d6 unexplained
- `item|misc14|Charm of the Creeping Hand#2` The attack deals an extra 1d10 Necrotic damage and you gain 5 temporary hit points. | no record for DMG; number 1d10,5 unexplained
- `item|misc14|Dragontooth Dagger#6` Against enemies of the Cult of the Dragon, the dagger's bonus to attack and damage rolls increases to 2, and the extra acid damage increases to 2d6. | number 2d6,2 no record explains
- `item|misc14|Hazirawn#3` If you are not attuned to Hazirawn, you deal an extra 1d6 necrotic damage when you hit with the weapon. | no record for DMG; number 1d6 unexplained
- `item|tce|Baba Yaga's Mortar and Pestle#29` At the start of each of your turns, whatever is in the mortar takes 4d10 force damage. | no record for DMG; number 4d10 unexplained
- `item|tdcsr|Pyremaul (Exalted)#16` When you kill a creature with it, you can take 10d10 fire damage (it cannot be reduced) to turn the corpse and its non-magic gear to ash. | no record for DMG; number 10d10 unexplained
- `item|tghg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | no record for DMG; number 8d6 unexplained
- `item|thhw|Shroud of Ending#6` While attuned, you deal 1d6 necrotic damage to any plant you touch that is not a creature, plant and beast creatures within 30 ft become hostile to you, and you stop aging and need no food or sleep. | no record for DMG; number 1d6,30 unexplained
- `item|tsdm|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Festerwood Masher#6` When the hammer hits an affected target, it takes an extra 1d4 Acid damage per -1 of AC penalty. | no record for DMG; number 1d4,1 unexplained
- `item|tsgs|The Rose Basket#7` A creature takes 2d4 Piercing damage per 5 ft it moves in the area. | no record for DMG; number 2d4,5 unexplained
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | no record for DMG; number 1d6 unexplained
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | no record for DMG; number 1d4 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Artificer/Magneticist|Metal Slinger#10` When you hit a creature, you can deal an extra 1d6 damage of the weapon's type and move a Medium or smaller target 10 ft directly toward or away from you. | no record for DMG; number 1d6,10 unexplained
- `sub|Barbarian/Path of the Drifter|Relentless Aggression#1` Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft. | no record for DMG; number 1d10,5 unexplained
- `sub|Cleric/Dragon Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Fire damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Prophecy Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Paladin/Oath of the Annihilator|Channel Divinity#4` A nonmagical weapon becomes magical with a +1 bonus to attack and damage rolls for that time. | no record for DMG; number 1 unexplained
- `sub|Ranger/Fey Wanderer|Dreadful Strikes#4` Once you reach Ranger level 11, the extra damage becomes 1d6. | no record for DMG; number 1d6 unexplained
- `sub|Rogue/Runetagger|Lead Paint#3` When you do, the Sneak Attack deals an extra 2d6 damage. | no record for DMG; number 2d6 unexplained

### PROF (424 uncovered)

- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Echoing Soul|Echoing Soul#2` You gain proficiency in two skills of your choice. | no record for PROF
- `feat|Gambler|Gambler#2` You gain proficiency with two gaming sets of your choice. | no record for PROF
- `item|au|Scholar's Anchoring Bangle#4` When you take the Study action and make an Intelligence check using a skill in which you have proficiency, you can treat a d20 roll of 9 or lower as a 10. | no record for PROF; number 1d20,10 unexplained
- `item|bgdia|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Basco's Handy Bangle#2` Magic action: touch a rune and say the command words to gain proficiency with that tool for 24 hours, or Expertise if already proficient. | no record for PROF; number 24 unexplained
- `item|dmg|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Rare)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|dmg|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|dmg|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|dmg|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|dmg|Torrent Taiaha#4` You are proficient with it, the reach is 10 ft, you can use Wisdom for attack and damage, and it deals 1d4 Bludgeoning damage. | no record for DMG,PROF; number 1d4,10 unexplained
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|llk|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|llk|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|tee24|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tsgs|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `species|Duergar (2014)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Barbarian/Path of Heavy Metal|Rocker#1` You gain proficiency with three Musical Instruments. | number 3 no record explains
- `sub|Captain/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains
- `sub|Cleric/Arcana Domain (2014)|Arcane Initiate#1` You gain proficiency in Arcana and learn two cantrips from the Wizard list. | no record for PROF; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Animal Sidekick#8` The familiar gains proficiency in any two skills or tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `sub|Wizard/Materializer|Arcane Artisan#5` You gain proficiency with three Artisan's Tools of your choice. | no record for PROF
- `sub|Wizard/White Necromancer|Lore of Life and Death#1` You gain proficiency in Medicine and Religion, and your Proficiency Bonus is doubled on Wisdom (Medicine) checks. | number double,pb no record explains

### ADV (418 uncovered)

- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | no record for ADV,DIS; number 1 unexplained
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | no record for ADV; number 1,12 unexplained
- `item|dmg|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|dmg|Candle of Invocation#5` While you are inside that light, you have Advantage on D20 Tests. | no record for ADV; number 1d20 unexplained
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|dmg|Deck of Many Things#22` If you are the one who drops that foe to 0 Hit Points in that fight, you gain Advantage on Death Saving Throws, which lasts 1 year. | no record for ADV; number 1,0 unexplained
- `item|dmg|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#9` 7 Green: Resistance to Poison and Advantage on checks to end Grappled or Restrained. | no record for ADV,RES; number 7 unexplained
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Pearl Elixir#8` The vessel gains a damage threshold of 20 against all environmental effects, and whoever pilots it has Advantage on ability checks tied to piloting. | no record for ADV; number 20 unexplained
- `item|dmg|Rope of Climbing#6` While knotted, the rope is only 50 feet long, and it gives Advantage on ability checks made to climb with it. | no record for ADV; number 50 unexplained
- `item|dmg|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tee24|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|tghg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|thhw|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|tsdm|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|tsgs|Forgemaster's Might#8` You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil. | no record for ADV; number 5 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|tsgs|Glove of the Grim Fandango#4` With them you have Advantage on Charisma (Performance) checks and +2 to your spell save DC for Enchantment spells on targets who can hear you. | no record for ADV,DC; number 2 unexplained
- `sub|Cleric/Mountain Domain|Channel Divinity: Ever Upward#1` Use Channel Divinity to give yourself and up to five other creatures Advantage on skill and ability checks made to climb, avoid falling, or avoid the Prone condition. | no record for ADV; number 5 unexplained
- `sub|Cleric/Trickery Domain (2014)|Channel Divinity: Invoke Duplicity#5` When you and the illusion are both within 5 feet of a creature that can see the illusion, you have Advantage on attack rolls against that creature. | number 5 no record explains
- `sub|Fighter/Scofflaw|Blindside#1` Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. | no record for ADV,DMG; number 5d6 unexplained
- `sub|Martyr/Burden of Mercy|Virtuous Blessings#7` Spend it to gain Advantage on a D20 Test using Wisdom or Charisma (no action). | no record for ADV; number 1d20 unexplained
- `sub|Sorcerer/Farseer|Sharing the Dream#1` Action: grant up to five creatures (you may be one) Advantage on attack rolls or saving throws for up to 1 minute, with Concentration. | no record for ADV; number 1,5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/Astral Griffon Patron|Extradimensional Mastery#2` Magic action: for 10 minutes you have Advantage on Wisdom (Perception) checks that rely on sight and you have Truesight to 30 ft. Uses equal your Charisma modifier (minimum 1) per Long Rest. | no record for ADV,SENSE; number 30 unexplained
- `sub|Warmage/House of Bishops|Siege Casting#2` You have Advantage on spell attack rolls against targets 100 feet or more away. | no record for ADV,ATK; number 100 unexplained
- `sub|Witch/Fragrant Magic|Aromamancy#8` For 1 hour you have Advantage on Charisma checks to influence a creature within 5 feet of you. | no record for ADV; number 5,1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Mask#9` As a Bonus Action, spend another slot to add 1d8 per slot level to your next bite and gain Advantage on that attack. | no record for ADV,SLOT; number 1d8 unexplained
- `sub|Wizard/Graviturgy Magic|Adjust Density#3` With doubled weight it loses 10 feet of Speed and has Advantage on Strength checks and saves. | no record for ADV,SPEED; number 10,double unexplained
- `sub|Wizard/School of Illumination|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### SPEED (385 uncovered)

- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | no record for SPEED; number 5 unexplained
- `feat|Greater Mark of Storm|Greater Mark of Storm#6` When you cast Gust of Wind with Storm Magic (no slot), you also gain a Fly Speed of 60 feet for the spell's duration. | no record for SPEED; number 60 unexplained
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#17` It has AC 18, Hit Points equal to 10 times your character level and Speed 0. | no record for SPEED; number 18,10,0 unexplained
- `feat|Shock Trooper|Shock Trooper#5` In the first round of each combat, your Speed is doubled. | no record for SPEED; number double unexplained
- `item|au|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg14|Carpet of Flying, 6 ft. × 9 ft.#3` A 6 ft. × 9 ft. carpet can carry up to 800 lb. at a fly speed of 30 feet. | no record for SPEED; number 6,9,30 unexplained
- `item|dmg14|Quaal's Feather Token, Fan#6` The fan floats and creates a wind strong enough to fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. | no record for SPEED; number 5,8 unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | no record for SPEED; number 5,7,40 unexplained
- `item|dmg|Clockwork Dog#4` The dog has AC 5, 1 hit point, and a walking speed of 30 feet. | no record for SPEED; number 30,5,1 unexplained
- `item|dmg|Deathwalker's Ward (Exalted)#12` You gain a flying speed of 60 feet for 1 hour. | no record for SPEED; number 60 unexplained
- `item|dmg|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | no record for SPEED; number double unexplained
- `item|dmg|Grovelthrash (Exalted)#42` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | no record for SPEED; number 5,half unexplained
- `item|dmg|Hasty Sugarbomb#1` A sweet eaten as a Magic action to raise your Speed by 5 ft for 1 hour. | no record for SPEED; number 5,1 unexplained
- `item|dmg|Precipit, the Formless#10` Resist Bludgeoning and Slashing, +10 ft Speed, Swim Speed equal to your Speed, walk on liquid, and redirect a melee miss against you. | no record for SPEED; number 10 unexplained
- `item|dmg|Quaal's Feather Token (bird)#9` It can carry up to 500 pounds while it flies at its top speed, which is 16 miles per hour for no more than 144 miles per day, resting 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|dmg|Soarsled#1` A crystal disk 5 ft across that carries up to 400 lb. In Sharn or another Syranian manifest zone, stand on it and use a Magic action to make it hover. | no record for SPEED; number 5 unexplained
- `item|dmg|Wave#14` While you carry the trident, you can spend 1 charge to target a Beast that has a Swim Speed with the Dominate Beast spell cast from the trident (save DC 20). | no record for RESOURCE,SPEED; number 1 unexplained
- `item|dmg|Winged Boots#2` While you wear them, you can spend 1 charge as a Magic action to gain a Fly Speed of 30 feet for 1 hour. | no record for RESOURCE,SPEED; number 30,1,1 unexplained
- `item|egw|Grovelthrash (Exalted)#42` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | no record for SPEED; number 5,half unexplained
- `item|egw|Stormgirdle (Awakened)#16` - While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover. | no record for SPEED; number 30 unexplained
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|tsgs|Couatl Herald's Lash#7` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Greaves of Dendallen#9` Once removed, your Speed is 0 and rises by 5 ft every 24 hours until normal. | no record for SPEED; number 5,24,0 unexplained
- `item|tsgs|Wavebender's Leiomano#4` Rowing a waterborne vehicle with it adds 5 ft Speed (1/2 mile per hour) for each such oar used. | no record for SPEED; number 5,2,1 unexplained
- `item|tvss|Sprinting Legs#1` Graft (donor: a creature with Speed 60+ ft). | no record for SPEED; number 60 unexplained
- `species|Disembodied|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Hadozee|Glide#1` Reaction when you fall 10 ft or more: glide horizontally up to your Speed and take no fall damage. | no record for SPEED; number 10 unexplained
- `species|Halfling (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | no record for SPEED; number 0 unexplained
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#1` You have a merfolk form (Speed 10 ft, Swim Speed 40 ft) and a landwalker form, where your tail splits into legs. | number 40 no record explains
- `species|Merfolk|Swim Speed#1` Swim Speed of 40 ft. | no record for SPEED; number 40 unexplained
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | no record for DMG,SPEED; number 1d4,20 unexplained
- `sub|Captain/Gourmand|Monster Meal#14` Speed increases by 10 feet. | no record for SPEED; number 10 unexplained
- `sub|Vagabond/Dragon Banner|Rampage [Maneuver]#1` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack roll, expend one Battle Die to move up to your Speed and make a melee attack (no action required). | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Warden/Grey Watchman|Maneuver Options#17` Once on each of your turns, right after you reduce an enemy to 0 Hit Points or score a Critical Hit with a melee attack, you can expend one die to move up to your Speed and make a melee attack with no action. | no record for RESOURCE,SPEED; number 0 unexplained
- `sub|Warlock/The Genie|Elemental Gift#2` As a Bonus Action you gain a Fly Speed of 30 feet with hover for 10 minutes. | no record for SPEED; number 30,10 unexplained
- `sub|Warmage/House of Rooks|Arcane Assassin#2` While you have the Invisible condition, your Speed is doubled. | no record for SPEED; number double unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained

### NUM (322 uncovered)

- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | number 2 no record explains
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | number 3 no record explains
- `feat|Actor|Actor#2` Your Charisma score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Poisoner|Poisoner#2` Pick Dexterity or Intelligence and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgdia|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|bgg|Adze of Annam#4` - 2 minor beneficial properties | number 2 no record explains
- `item|coa|Ruby Rod of Asmodeus#10` - 1 minor beneficial property | number 1 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Brass#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg14|Ioun Stone, Mastery#8` Your proficiency bonus increases by 1 while this pale green prism orbits your head. | number pb no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Crown of Lies#14` - 1 minor detrimental property | number 1 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Mace of Smiting#2` When you attack a Construct with it, that bonus is +3 instead. | number 3 no record explains
- `item|dmg|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|dmg|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | number 20,30 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|tdcsr|Magician's Judge#4` For any check with your spellcasting ability, use +3 or your own modifier, whichever is higher. | number 3 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|tsgs|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | number 1d4,1 no record explains
- `item|tsgs|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|tsgs|Staff of the Magpie#2` Holding it gives +1 to Wisdom (Perception) checks to find treasure or a specific item. | number 1 no record explains
- `sub|Cleric/Cat Domain|Channel Divinity: Feline Finesse#1` Add a +10 bonus to a Dexterity ability or skill check made by you or by a creature you designate within 30 ft. | number 30,10 no record explains
- `sub|Martyr/Burden of Discord|Coin of Chaos#3` It is +4 on heads and +1 on tails. | number 4 no record explains
- `sub|Necromancer/Overlord|Charnel Aura#3` The bonus is +1 per 5 points spent, to a maximum of +3. | number 1,5 no record explains

### RES (317 uncovered)

- `item|dmg|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|dmg|Puzzle Ring of Vitality, Life, and Power#5` Band two is DC 10 and gives you and allies Resistance to Necrotic, protects HP maximums, and brings an ally at 0 HP to 1 HP at the start of its turn. | no record for DC,RES; number 10,1,2 unexplained
- `item|dmg|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `item|dmg|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|egw|Stormgirdle (Awakened)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|egw|Stormgirdle (Dormant)#4` While wearing the Stormgirdle in its dormant state, you have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn't already 21 or higher. | no record for ABIL; number 21 unexplained
- `item|idrotf|Charm of Cold Resistance#1` As an action, give yourself resistance to Cold damage for 24 hours. | no record for RES; number 24 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|tdcsr|Coat of the Crest#5` When you are the target of an attack, spend 1 charge as a reaction to gain resistance to one damage type of that attack. | no record for RES,RESOURCE; number 1 unexplained
- `item|tdcsr|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|thhw|Glowing Ember#2` Speak its command word within 60 ft and the ember glows, shedding bright light and heat in a 20 ft radius and dim light for another 20 ft. Creatures within 20 ft feel the heat and have Resistance to cold damage while it  | no record for RES; number 60,20 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|tsgs|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `sub|Bard/College of Fools|Last Laugh#2` For 1 minute you have Resistance to all damage. | no record for RES
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Druid/Circle of the Warden|Reclamation#1` Reaction: when a creature within 30 ft takes cold, fire, lightning or thunder damage, it gains Resistance to that damage and you take an amount equal to what it took. | no record for RES; number 30 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#20` Resistance (Construct, Elemental, Undead): 1 minute of Resistance to Bludgeoning, Piercing, and Slashing damage. | no record for RES
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | no record for RES; number 30 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Wizard/Entropist|Master of Chaos#1` Whenever you cause a chaos magic surge, you regain one use of Long Odds, Twisted Arcana or Shifting Resistance with no rest. | no record for RES,RESOURCE; number 1 unexplained
- `sub|Wizard/Entropist|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained
- `sub|Wizard/Transmuter|Potent Stone#4` If you pick Resistance twice, you must choose different damage types. | no record for RES; number double unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### SLOT (303 uncovered)

- `class|Druid|Archdruid#7` For example, converting two uses of Wild Shape creates a level 4 spell slot. | no record for RESOURCE,SLOT; number 2 unexplained
- `class|Summoner|Conjuration Expert#1` You have two extra spell slots, one of level 1 and one of level 2, separate from your Spellcasting slots, and usable only for Conjuration spells. | no record for SLOT; number 2 unexplained
- `class|Witch|Hexmaster#3` You can also restore one use by expending a spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | no record for SLOT,SPELL; number 2 unexplained
- `feat|Shadowsteel Master|Shadowsteel Master#4` It also takes 1d4 Necrotic damage for each level of the spell slot used to cast the spell. | no record for DMG,SLOT,SPELL; number 1d4 unexplained
- `item|coa|Gauntlets of Rage#6` Doing so causes the attack to deal an extra 3 (1d6) necrotic damage per level of spell slot expended, if the attack hits. | no record for DMG,SLOT; number 1d6,3 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|dmg|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Charm of Restoration#2` Spend 1 charge to cast Lesser Restoration or 2 charges to cast Greater Restoration, with no spell slot and no components. | no record for SLOT; number 1,2 unexplained
- `item|dmg|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Manual of Stone Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Rod of Absorption#12` For instance, 3 stored levels can serve as one level 3 spell slot. | no record for SLOT; number 3 unexplained
- `item|dmg|Singularity Emitter#4` One charge casts it at level 3, and each extra charge raises the slot level by 1. | no record for RESOURCE,SLOT
- `item|dmg|Tome of the Dragon#4` To decipher and use the Tome of the Dragon, you must be either a spellcaster with at least two level 5 spell slots or a Dragon. | no record for SLOT; number 2 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ftd|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|skt|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tkdm|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Craftsman/Forgeknights' Guild|Fire Burst#1` While you hold your Portable Forge, you can cast Fireball centered on yourself with no spell slot and no components (DC 8 plus your Intelligence modifier plus your Proficiency Bonus). | no record for DC,SLOT; number 8,pb unexplained
- `sub|Druid/Circle of the Moon|Moonlight Step#5` Expending a level 2+ spell slot (no action required) also restores one use per slot. | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Ranger/Primordial Archer|Witching Arrows#2` Listed damage rises by 2d6 per slot level above 1. | no record for DMG,SLOT; number 2d6,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#5` Across uses you can regain slots equal to twice your Sorcerer level. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#1` Bonus Action and a spell slot: call a magical 15-ft dragon tail. | no record for SLOT; number 15 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained

### CHOICE (235 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Druid|Spellcasting#14` To begin, your list holds four level 1 Druid spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | no record for CHOICE; number 2 unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#7` Each creature of your choice within 30 feet is refreshed. | no record for CHOICE; number 30 unexplained
- `feat|Gun-Mage Adept|Gun-Mage Adept#9` Choose a number of Firearm spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Rune Knowledge|Rune Knowledge#6` Each time, you learn the benefit and powers of two more runes of your choice. | no record for CHOICE; number 2 unexplained
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage equal to your Charis | no record for CHOICE; number 5 unexplained
- `species|Simic Hybrid|Animal Enhancement#1` Choose one enhancement from the first three at level 1. | no record for CHOICE; number 3 unexplained
- `sub|Artificer/Alchemist|Experimental Elixir#17` 6 You choose any other row. | no record for CHOICE; number 6 unexplained
- `sub|Barbarian/Path of the Beast|Call the Hunt#1` When you enter your Rage, you can choose a number of willing creatures you can see within 30 feet, up to your Constitution modifier (minimum of one). | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Cleric/Life Domain (2014)|Channel Divinity: Preserve Life#2` Divide a pool of Hit Points equal to five times your Cleric level among creatures of your choice within 30 feet. | no record for CHOICE; number 5 unexplained
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#2` Or you can choose an ally within 30 feet who can see or hear you. | no record for CHOICE; number 30 unexplained
- `sub|Martyr/Burden of Ascension|Relics of Legend#1` Choose three pieces of your equipment as your Aegis, Oracle, and Xiphos. | no record for CHOICE; number 3 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Abjure Enemy#2` Choose a creature you can see within 60 feet. | no record for CHOICE; number 60 unexplained
- `sub|Rogue/Mastermind|Insightful Manipulator#1` If you spend 1 minute observing or talking with a creature outside combat, the DM tells you whether it is your equal, superior, or inferior in two traits of your choice: Intelligence, Wisdom, Charisma, or class levels. | no record for CHOICE; number 1,2 unexplained
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (101)

- `class|Warmage|Arcane Surge Improvement#1` You gain one additional use of Arcane Surge, for a total of three. | angka: 3
- `class|Druid|Wild Shape#11` Four Beast forms are known to you for this feature, picked from Beast stat blocks with a Challenge Rating of 1/4 or lower and no Fly Speed (appendix B has stat blocks to choose from). | angka: 1,4
- `class|Captain|Cohort~4#26` Orc: once per day, when reduced to 0 Hit Points it drops to 1 instead. | angka: 0,1
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | angka: 1
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | angka: 2
- `class|Warlock|Pact Magic#15` For example, a level 5 Warlock has two level 3 spell slots. | angka: 2
- `class|Martyr|Weapon Mastery#2` After a Long Rest, you can change those two choices. | angka: 2
- `class|Captain|Cohort~2#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Summoner|Shared Resilience#1` While you and your Eidolon are within 30 feet of each other, you both have proficiency in all saving throws. | angka: 30
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb
- `class|Alchemist|Potion Brewing#14` Level 16: Fire Giant Strength 7, Speed 9. | angka: 7,9
- `class|Paladin|Restoring Touch#2` Each condition you end costs 5 Hit Points from your Lay On Hands healing pool, and the creature regains no Hit Points from points spent this way. | angka: 5
- `class|Warlock|Pact Magic#24` For instance, at level 6 you learn a new Warlock spell, and it can be of level 1, 2, or 3. | angka: 3
- `class|Warden|Sentinel's Stand#9` While you hold a Shield, its AC bonus is +3 instead of +2. | angka: 3,2
- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Investigator|Weapon Mastery#3` After a Long Rest you can change the two kinds. | angka: 2
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Martyr|Divine Respite~2#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | angka: 3
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | angka: 2
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Witch|Hexes#2` You know two Hexes from the Witch spell list, and they do not count against your cantrips known. | angka: 2
- `class|Alchemist|Bombs#9` To count them instead, you make 10 + twice your Alchemist level after each Short or Long Rest. | angka: 10,double

### feat (198)

- `feat|Ability Score Improvement|Ability Score Improvement#1` Choose one ability score and raise it by 2, or choose two ability scores and raise each of them by 1. | angka: 2
- `feat|Initiate of High Sorcery|Initiate of High Sorcery#5` You learn one Wizard cantrip and two 1st-level spells, chosen from your moon's list. | angka: 2
- `feat|Linguist|Linguist#6` You can write codes that others can't read unless you teach them, they beat a DC (your Intelligence score + Proficiency Bonus) on an Intelligence check, or they use magic. | angka: pb
- `feat|Unarmed Fighting|Unarmed Fighting#3` When each of your turns begins, you can choose one creature you have Grappled and deal 1d4 Bludgeoning damage to it. | angka: 1d4
- `feat|Medium Armor Master|Medium Armor Master#4` If your Dexterity score is 16 or higher, you can add 3 instead of 2 to your Armor Class while you wear Medium armor. | angka: 3,2
- `feat|Great Weapon Master (2014)|Great Weapon Master (2014)#4` Before you make a melee attack with a Heavy weapon you are proficient with, you can take a -5 penalty to the attack roll. | angka: 5
- `feat|Greater Mark of Sentinel|Greater Mark of Sentinel#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#5` Whenever you regain Hit Points, you regain only half as many, rounded down. | angka: half
- `feat|Lightly Armored|Lightly Armored#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Charger|Charger#6` When a melee attack roll you make during the Attack action hits a target immediately after you move at least 10 feet straight toward it, pick one effect: the attack's damage roll gets a 1d8 bonus, or  | angka: 1d8
- `feat|Revenant Blade|Revenant Blade#6` While you hold a double-bladed scimitar in two hands, you gain a +1 bonus to AC. | angka: 1,2,double
- `feat|Gun-Mage Adept|Gun-Mage Adept#9` Choose a number of Firearm spells equal to your Proficiency Bonus. | angka: pb
- `feat|Watchers|Watchers#10` Immediately after you make a D20 Test and roll a 1 on the d20, you make a Wisdom saving throw against DC 13 plus your Proficiency Bonus. | angka: 1d20,13,pb
- `feat|Street Justice|Street Justice#6` When you bind a creature with Chain, Manacles, or Rope, add your Proficiency Bonus to the DC for the creature to escape or burst the restraint. | angka: pb
- `feat|Church of the Sun Above: Adherent|Church of the Sun Above: Adherent#4` When you damage a creature with a weapon, a spell or an Unarmed Strike, you can deal an extra 1d8 Radiant damage to it. | angka: 1d8
- `feat|Resolution of the Syndicate|Resolution of the Syndicate#3` The extra damage becomes 2d4 at character level 9 and 4d4 at character level 16. | angka: 2d4,1d4
- `feat|Primordial Transformation: Stage 2|Primordial Transformation: Stage 2#10` On a failure your Primordial nature shows, and you have Disadvantage on every D20 Test for 1 minute while you fight for control. | angka: 1d20
- `feat|Defensive Duelist|Defensive Duelist#4` When another creature hits you with a melee attack while you hold a Finesse weapon, you can use a Reaction to raise your Armor Class by an amount equal to your Proficiency Bonus, which might make the  | angka: pb
- `feat|Polearm Master|Polearm Master#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20
- `feat|Greater Mark of Storm|Greater Mark of Storm#6` When you cast Gust of Wind with Storm Magic (no slot), you also gain a Fly Speed of 60 feet for the spell's duration. | angka: 60
- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | angka: 1
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | angka: 2
- `feat|Psionic-Awakened|Psionic-Awakened#7` You can cast it without Verbal or Somatic components, make the hand Invisible, and its range increases by 30 feet. | angka: 30
- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Knight of the Sword|Knight of the Sword#7` It makes a Wisdom saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Fury of the Frost Giant|Fury of the Frost Giant#9` It makes a Constitution saving throw (DC 8 + your Proficiency Bonus + the modifier of the ability you raised). | angka: 8,pb
- `feat|Cloying Mists|Cloying Mists#10` Creatures other than you and your allies have their Speed reduced by 5 feet while in the area. | angka: 5
- `feat|Greater Mark of Handling|Greater Mark of Handling#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Durable|Durable#2` Your Constitution score rises by 1, but not above 20. | angka: 1,20
- `feat|Laser Swordsmaster|Laser Swordsmaster#8` The target must succeed on a Dexterity saving throw (DC 8 plus your Proficiency Bonus plus the modifier of the ability this feat raised) or take the damage the triggering attack would have dealt. | angka: 8,pb

### item (1933)

- `item|dmg|Defender#4` For example, you could keep only +1 on your attack and damage rolls and take +2 to Armor Class. | angka: 1,2
- `item|dmg|Spell Gem (Jade)#10` Spells cast from the spell gem have a save DC of 17 and an attack bonus of +9. | angka: 17,9
- `item|egw|Grovelthrash (Exalted)#41` - When you have fewer hit points than half your hit point maximum, the warhammer deals an extra 2d6 bludgeoning damage on a hit. | angka: 2d6,half
- `item|dmg|Ythryn Mythallar#17` - As an action, you can cause one magic item you are holding within 30 feet of the Ythryn mythallar to immediately regain all its expended charges or uses. | angka: 30
- `item|dmg|Shield of the Uven Rune#19` The bonus increases to +3 when the weapon is used against one of the following creature types, chosen by you at the time of the magic weapon's creation: aberrations, celestials, constructs, dragons, e | angka: 3
- `item|tvss|Barbarian's Brew#3` For 1 hour your Strength score rises by your Drunk level, to a maximum of 22. | angka: 1
- `item|dmg|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | angka: 6
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | angka: 18
- `item|tsgs|Plaguebane Mask#5` Each creature makes a DC 15 Constitution save, taking 2d8 Poison and having its Speed halved until the end of its next turn on a fail (not if immune to Poisoned), or half damage only on a pass. | angka: 2d8,15,half
- `item|frafi|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | angka: 30
- `item|dmg|Wrought-Iron Tower#21` The Wrought-Iron Tower also functions as a Rod of Rulership, with an increased save DC of 18. | angka: 18
- `item|dmg|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affe | angka: 60,1,2
- `item|cm|Charm of the Water Bearer#3` You can do this up to three times per day for 10 days, then the charm vanishes. | angka: 10
- `item|dmg|Amulet of the Drunkard#2` While wearing it, you can regain 4d4 + 4 hit points when you drink a pint of beer, ale, mead, or wine. | angka: 4d4,4
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | angka: 144,1,3,half
- `item|tvss|Heart of Steel#3` You can finish a Long Rest in 4 hours if you spend them motionless but conscious. | angka: 4
- `item|tsgs|Phase Axe#1` A near-transparent Battleaxe with +1 to attack and damage rolls and the Thrown property (20/60 ft). | angka: 60,20
- `item|egw|Grimoire Infinitus (Exalted)#14` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | angka: 1
- `item|dmg|Mythallar Cloak#3` While wearing the cloak, you can take a Bonus Action and expend 1 charge to activate the cloak's magic. | angka: 1
- `item|dmg|Blackstaff#27` 21 to 30 ft. away: 4 × the number of charges in the staff. | angka: 30,21
- `item|thhw|Glowing Ember#6` If you move more than 20 ft from the hovering crystal, it follows you by the shortest path, avoiding obstacles if it can, until it is within 20 ft. If it is lit and cannot reach the creature it follow | angka: 8d6,20,3
- `item|dmg|Precipit, the Formless#14` Resist Piercing and Slashing, Speed 5 ft, +3 AC, halved forced movement, and 10 Temporary HP at the start of each turn. | angka: 3,10
- `item|dmg|Ruin's Wake (Exalted)#12` - You gain a +1 bonus to attack and damage rolls made with this magic weapon, and it deals an extra 1d8 piercing damage to any target it hits. | angka: 1d8,1
- `item|dmg|Mirror of Reflected Pasts#3` It shatters and is destroyed if reduced to 0 hit points. | angka: 0
- `item|tsgs|Tectonic Gauntlets#17` Your Speed drops by 5 ft and your Intelligence drops by 4 (minimum 7). | angka: 4
- `item|dmg|Grass Whistle Blade#7` A second success deals 3d8 Psychic damage. | angka: 3d8
- `item|dmg|Smash Potatoes#3` For that time, your Unarmed Strike with a hand can deal 1d4 instead of its normal damage. | angka: 1d4
- `item|tsgs|Shield of Yggdrasil#5` While planted, your Speed is 5 ft and cannot rise, and you reduce Bludgeoning, Piercing and Slashing damage from weapons and Unarmed Strikes by 3. | angka: 5,3
- `item|egw|Grovelthrash (Exalted)#33` - The weapon's bonus to attack and damage rolls increases to +2. | angka: 2
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | angka: 1d4,2

### species (91)

- `species|Scourgeborne|Feral Limbs#1` Your horns, claws or fangs make Unarmed Strikes that deal 1d6 + Strength modifier Piercing damage instead of the normal damage. | angka: 1d6
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Eladrin (2014)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Kaladesh Elf (Bishatar and Tirahar)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Merfolk|Swim Speed#1` Swim Speed of 40 ft. | angka: 40
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Eladrin Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Gallus|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#1` You have a merfolk form (Speed 10 ft, Swim Speed 40 ft) and a landwalker form, where your tail splits into legs. | angka: 40
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Aven (Dominaria)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Minotaur (Amonkhet)|Natural Weapon#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Bludgeoning damage. | angka: 1d6
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Elf (Fey)|Trance#2` You finish a Long Rest in 4 hours of meditation, staying semiconscious. | angka: 4
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Reborn (VRGR)|Deathless Nature#4` You can finish a Long Rest in 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Dhampir|Vampiric Bite#2` The bite deals Piercing damage equal to 1d4 + your Constitution modifier in place of the normal damage. | angka: 1d4
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Satyr (2014)|Ram#1` Your unarmed strikes with head and horns deal 1d4 + Strength modifier Bludgeoning damage. | angka: 1d4
- `species|Vect|Embedded Armor#2` Your base AC is 13 + Dexterity modifier. | angka: 13

### sub (656)

- `sub|Druid/Circle of the Blighted|Blighted Shape#2` In Wild Shape your beast form gets +2 AC and 60 ft of Darkvision (or 60 ft more if it has some). | angka: 60,2
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | angka: 2
- `sub|Cleric/War Domain|War God's Blessing#3` It lasts for 1 minute instead, but ends sooner if you cast that same spell again, have the Incapacitated condition, or die. | angka: 1
- `sub|Captain/Gourmand|Gourmet Ingredients#6` One ability score of its choice increases by 2, to a maximum of 22. | angka: 2
- `sub|Summoner/Bond of the Symbiote|Empowered Wrap#3` The target takes 2d6 plus your Charisma modifier Necrotic damage and you regain Hit Points equal to the damage dealt. | angka: 2d6
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | angka: 2
- `sub|Monster Hunter/Carver Guild|Deadly Redirect#1` The extra damage of Close Quarters becomes 3d6. | angka: 3d6
- `sub|Wizard/Abjurer|Arcane Ward#3` The ward lasts until you finish a Long Rest, and its Hit Point maximum equals twice your Wizard level plus your Intelligence modifier. | angka: double
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | angka: 1
- `sub|Sorcerer/Shadow Magic|Eyes of the Dark#1` You have Darkvision to 120 feet. | angka: 120
- `sub|Cleric/Eldritch Domain|Sing the Song that Ends the World#2` It is then immune to this damage for 10 minutes. | angka: 10
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | angka: 1d8
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Sorcerer/Serophage|Blood Fuel#1` Instead of moving, you can deal 1d4 Slashing damage to yourself and regain Sorcery Points equal to that damage. | angka: 1d4
- `sub|Bard/College of Birdsong|Zephyr's Blessing#3` While a feather orbits it, the creature gets +2 to Dexterity saves, +10 ft Speed, and Opportunity Attacks against it have Disadvantage. | angka: 10,2
- `sub|Sorcerer/Aberrant Mind|Revelation in Flesh#8` A Swim Speed of twice your Speed and underwater breathing. | angka: double
- `sub|Ranger/Beast Master (2014)|Ranger's Companion#3` Its Hit Point maximum is its normal maximum or four times your Ranger level, whichever is higher. | angka: 4
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | angka: double,pb
- `sub|Druid/Circle of Mutation|Mutate Shape#7` 1 more point makes the Swim Speed double your Speed. | angka: 1,double
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | angka: 5,2
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | angka: 60
- `sub|Barbarian/Path of the Glacier|Frostbite#2` This rises to 2d6 at Barbarian level 9 and 3d6 at level 16. | angka: 2d6,1d6
- `sub|Cleric/Travel Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 lightning damage. | angka: 1d8
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Cleric/Dragon Domain|Bonus Proficiency#1` You gain proficiency in Arcana, and your Proficiency Bonus is doubled on its checks. | angka: double,pb
- `sub|Sorcerer/Spellfire Sorcery|Crown of Spellfire#3` After you alter Innate Sorcery this way, you must finish a Long Rest before doing it again, unless you spend 5 Sorcery Points (no action required) to restore it. | angka: 5
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | angka: 1,3
- `sub|Druid/Circle of the Forged|Skin of Steel#5` While in the form, your AC is 15 plus your Wisdom modifier if that beats the Beast's AC. | angka: 15
- `sub|Sorcerer/Frost Sorcery|Frozen Body#2` Your Hit Point maximum rises by 3, and by 1 more for every Sorcerer level you gain after this. | angka: 3
- `sub|Artificer/Forge Adept|Runes of War#7` While in it, you and your allies deal an extra 1d4 damage of that type with weapon attacks and Unarmed Strikes. | angka: 1d4

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg|Blackrazor#29` The sword's hunger must be fed often: if 3 or more days pass without it devouring a soul, it comes into conflict with it -> info:NUMONLY:TEXT
- class `item|dmg|Blackrazor#29` The sword's hunger must be fed often: if 3 or more days pass without it devouring a soul, it comes into conflict with it -> info:NUMONLY:TEXT
- record `sub|Warlock/Great Old One Patron|Clairvoyant Combatant#2` If it fails, then for as long as the bond lasts, its attack rolls against you are made with Disadvantage, while you make -> info:ACTIVE:OTHERS
- class `sub|Warlock/Great Old One Patron|Clairvoyant Combatant#2` If it fails, then for as long as the bond lasts, its attack rolls against you are made with Disadvantage, while you make -> info:ACTIVE:OTHERS
- record `feat|Second Chance|Second Chance#7` You then need to roll Initiative or finish a Short or Long Rest to use this again. -> info:REST:NONUM
- class `feat|Second Chance|Second Chance#7` You then need to roll Initiative or finish a Short or Long Rest to use this again. -> info:REST:NONUM
- record `item|dmg|Vorpal Sword#3` If you attack a creature that has at least one head with this weapon and the d20 for the attack roll shows a 20, you sev -> info:NUMONLY:ROLL
- class `item|dmg|Vorpal Sword#3` If you attack a creature that has at least one head with this weapon and the d20 for the attack roll shows a 20, you sev -> info:NUMONLY:ROLL
- record `item|idrotf|Orc Stone#6` After the stone is used three times, it turns to dust. -> info:NUMONLY:TEXT
- class `item|idrotf|Orc Stone#6` After the stone is used three times, it turns to dust. -> info:NUMONLY:TEXT
- record `item|dmg|Orc Stone#6` After the stone is used three times, it turns to dust. -> info:NUMONLY:TEXT
- class `item|dmg|Orc Stone#6` After the stone is used three times, it turns to dust. -> info:NUMONLY:TEXT
- record `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#1` Stage 2. -> info:NUMONLY:TABLE
- class `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#1` Stage 2. -> info:NUMONLY:TABLE
- record `item|tvss|Draconis Fundamentum#9` Once used, it returns after a Long Rest, or spend the listed Hit Point Dice (no action) to restore it. -> info:REST:NONUM
- class `item|tvss|Draconis Fundamentum#9` Once used, it returns after a Long Rest, or spend the listed Hit Point Dice (no action) to restore it. -> info:REST:NONUM
- record `item|dmg|Legendary Trophy#3` Once used, it returns after a Long Rest. -> info:REST:NONUM
- class `item|dmg|Legendary Trophy#3` Once used, it returns after a Long Rest. -> info:REST:NONUM
- record `sub|Vagabond/Gourmand|Monster Meal#5` You can add up to three monster ingredients to one meal and gain each benefit. -> covered
- class `sub|Vagabond/Gourmand|Monster Meal#5` You can add up to three monster ingredients to one meal and gain each benefit. -> covered
- record `item|tkdm|Oathbound Ring#7` When a creature directly tries to stop you from keeping your oath, you have Advantage on attack rolls, saving throws, an -> info:ACTIVE:OTHERS
- class `item|tkdm|Oathbound Ring#7` When a creature directly tries to stop you from keeping your oath, you have Advantage on attack rolls, saving throws, an -> info:ACTIVE:OTHERS
- record `item|mot|Karametra's Votary#2` You can cast create food and water once, then you must finish a long rest before doing so again. -> info:REST:NONUM
- class `item|mot|Karametra's Votary#2` You can cast create food and water once, then you must finish a long rest before doing so again. -> info:REST:NONUM
- record `sub|Investigator/Spy|Body Double#6` Afterward you cannot use this again until a Short or Long Rest. -> covered
- class `sub|Investigator/Spy|Body Double#6` Afterward you cannot use this again until a Short or Long Rest. -> info:REST:NONUM
- record `sub|Paladin/Oath of Glory|Glorious Defense#6` Finishing a Long Rest restores all expended uses. -> info:REST:NONUM
- class `sub|Paladin/Oath of Glory|Glorious Defense#6` Finishing a Long Rest restores all expended uses. -> info:REST:NONUM
- record `item|dmg|Axe of the Dwarvish Lords#12` The axe counts as having the Thrown property: its normal range is 20 feet and its long range is 60 feet. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Axe of the Dwarvish Lords#12` The axe counts as having the Thrown property: its normal range is 20 feet and its long range is 60 feet. -> info:NUMONLY:GEOMETRY
