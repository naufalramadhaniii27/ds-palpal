# Laporan clause gate (mode laporan, 2026-11-10)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73254 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36782 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 7833 |
| Info (tag terdokumentasi) | 23624 (SPELL_TEXT 6470, FORM:ACTIVATE 2723, NUMONLY:GEOMETRY 2232, FORM:ROLL 1938, NUMONLY:TEXT 1341, ACTIVATE 1309, FORM:TABLE 1156, NUMONLY:ROLL 1001, NUMONLY:TABLE 864, FXO_NULL 828, ACTIVE:TRIGGER 785, ACTIVE:OTHERS 643, REST:NONUM 588, NUMONLY:FLAVOR 305, STD:ASI 208, COND:PLAY_STATE 188, NUMONLY:ZERO 162, ROLL:LAST_CHARGE 136, OBJECT:STATS 106, ITEM:SENSES 82, DC:REFERENCE 77, BY_DESIGN 72, TABLE:CLASS 70, COND:ATTACK_ROLL_ADV 68, STD:PICK_TEXT 63, ACTIVE:REACTION 56, MOVE:SPEED_REF 50, ACTIVE:TIMED_IMM 43, TARGET:SPEED 30, FOCUS:SPELLCASTING 14, STD:AC10 7, KNOW:TARGET_DEFENSES 7, POOL:SHARED 2) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 5325 |
| Uncovered dengan angka | 3163 |
| Uncovered dengan kelas kata kunci mekanik | 4965 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 360 |
| Angka yang tidak dijelaskan record mana pun | 2947 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 4515 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 308 |
| Waktu | muat data 2 s, analisis 52 s |

Uji mutasi pada data nyata (seed 7): 299 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 191 ditangkap (63.9%). Hapus semua atom kelas yang dibutuhkan: 192 ditangkap (64.2%). Selftest sintetis: lulus.

Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): 300 diuji, record dihapus: 292 ditangkap (97.3%), semua atom kelas dihapus: 296 ditangkap (98.7%). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.

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
| item | 3143 |
| GX | 1816 |
| wxs | 707 |
| LU_X | 536 |
| ITEM_SPELLS | 363 |
| species | 352 |
| AUTO | 315 |
| feat | 246 |
| SPELL_FX | 241 |
| cls | 133 |
| CODE | 96 |
| SAVE_NOTES | 75 |
| FXO | 48 |
| SPELLS | 37 |
| sub | 28 |
| FDMG | 17 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 234, fx-L4.js 188, fx-L12.js 151, fx-L2.js 140, fx-L1.js 139, fx-L3.js 135, fx-L10.js 128, fx-N1.js 101, fx-L9.js 101, fx-L11.js 96, fx-Z3.js 86, fx-L6.js 86.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| RESOURCE | 6659 | 901 | 13.5% |
| SPELL | 2882 | 829 | 28.8% |
| DMG | 3912 | 759 | 19.4% |
| SPEED | 1137 | 440 | 38.7% |
| PROF | 883 | 384 | 43.5% |
| ADV | 1516 | 381 | 25.1% |
| CHOICE | 1345 | 367 | 27.3% |
| RES | 1123 | 350 | 31.2% |
| NUM | 7110 | 322 | 4.5% |
| SLOT | 1121 | 320 | 28.5% |
| IMM | 852 | 308 | 36.2% |
| DC | 2624 | 282 | 10.7% |
| ATK | 860 | 225 | 26.2% |
| DIS | 932 | 213 | 22.9% |
| AC | 593 | 165 | 27.8% |
| SENSE | 515 | 150 | 29.1% |
| SAVE | 272 | 146 | 53.7% |
| HP | 143 | 85 | 59.4% |
| NUM-DICE | 1262 | 71 | 5.6% |
| ABIL | 357 | 62 | 17.4% |
| INIT | 111 | 49 | 44.1% |
| NUM-DUR | 2748 | 34 | 1.2% |
| NUM-DIST | 4404 | 29 | 0.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1028 | 240 | 549 | 0 | 239 |
| feat | 2101 | 534 | 1042 | 0 | 525 |
| item | 18391 | 4359 | 10985 | 0 | 3047 |
| species | 1037 | 571 | 297 | 0 | 169 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7477 | 1851 | 4281 | 0 | 1345 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10151 | 2414 | 6076 | 1661 | 16.4% |
| tvss | 2815 | 656 | 1643 | 516 | 18.3% |
| core | 1503 | 391 | 803 | 309 | 20.6% |
| tsgs | 1483 | 369 | 857 | 257 | 17.3% |
| tsdm | 1222 | 323 | 675 | 224 | 18.3% |
| tkdm | 919 | 199 | 501 | 219 | 23.8% |
| tghp | 1117 | 374 | 560 | 183 | 16.4% |
| tce | 736 | 135 | 459 | 142 | 19.3% |
| egw | 566 | 140 | 289 | 137 | 24.2% |
| au | 536 | 104 | 311 | 121 | 22.6% |
| dmg14 | 540 | 160 | 273 | 107 | 19.8% |
| tdcsr | 416 | 129 | 186 | 101 | 24.3% |
| phb14 | 516 | 163 | 262 | 91 | 17.6% |
| thhw | 395 | 86 | 231 | 78 | 19.7% |
| tee24 | 464 | 165 | 232 | 67 | 14.4% |
| tssm | 275 | 66 | 147 | 62 | 22.5% |
| rhw | 232 | 56 | 115 | 61 | 26.3% |
| hof | 253 | 40 | 155 | 58 | 22.9% |
| coa | 158 | 39 | 65 | 54 | 34.2% |
| EFotA | 137 | 35 | 50 | 52 | 38.0% |
| misc14 | 327 | 76 | 200 | 51 | 15.6% |
| tghg | 288 | 73 | 165 | 50 | 17.4% |
| xge | 375 | 110 | 217 | 48 | 12.8% |
| oota | 87 | 20 | 23 | 44 | 50.6% |
| mot | 292 | 95 | 160 | 37 | 12.7% |
| tsgeh | 184 | 61 | 91 | 32 | 17.4% |
| bmt | 489 | 82 | 375 | 32 | 6.5% |
| bgg | 210 | 64 | 122 | 24 | 11.4% |
| ftd | 159 | 40 | 96 | 23 | 14.5% |
| skt | 118 | 24 | 73 | 21 | 17.8% |
| tsae | 65 | 22 | 24 | 19 | 29.2% |
| dsotdq | 83 | 16 | 48 | 19 | 22.9% |
| wbtw | 92 | 17 | 56 | 19 | 20.7% |
| psa | 67 | 22 | 27 | 18 | 26.9% |
| abh | 54 | 13 | 23 | 18 | 33.3% |
| bdd | 62 | 15 | 29 | 18 | 29.0% |
| idrotf | 134 | 28 | 88 | 18 | 13.4% |
| llk | 99 | 10 | 71 | 18 | 18.2% |
| wdh | 95 | 23 | 56 | 16 | 16.8% |
| toa | 116 | 32 | 68 | 16 | 13.8% |
| wdmm | 79 | 13 | 50 | 16 | 20.3% |
| crcotn | 96 | 34 | 46 | 16 | 16.7% |
| ggr | 186 | 35 | 137 | 14 | 7.5% |
| frafi | 82 | 22 | 46 | 14 | 17.1% |
| scag | 67 | 25 | 29 | 13 | 19.4% |
| ai | 164 | 31 | 120 | 13 | 7.9% |
| vrgr | 86 | 23 | 51 | 12 | 14.0% |
| tsdd | 69 | 23 | 34 | 12 | 17.4% |
| lfl | 34 | 15 | 7 | 12 | 35.3% |
| erlw | 127 | 60 | 55 | 12 | 9.4% |
| vgm | 64 | 30 | 22 | 12 | 18.8% |
| pota | 110 | 27 | 71 | 12 | 10.9% |
| bgdia | 114 | 27 | 75 | 12 | 10.5% |
| cos | 66 | 20 | 35 | 11 | 16.7% |
| pabtso | 69 | 23 | 35 | 11 | 15.9% |
| tshl | 69 | 20 | 39 | 10 | 14.5% |
| aag | 40 | 18 | 12 | 10 | 25.0% |
| scc | 57 | 11 | 36 | 10 | 17.5% |
| psk | 38 | 22 | 9 | 7 | 18.4% |
| sato | 38 | 9 | 22 | 7 | 18.4% |
| cm | 60 | 12 | 41 | 7 | 11.7% |
| mtf | 64 | 48 | 10 | 6 | 9.4% |
| tftyp | 71 | 24 | 41 | 6 | 8.5% |
| psx | 18 | 8 | 5 | 5 | 27.8% |
| psz | 38 | 31 | 2 | 5 | 13.2% |
| efa | 28 | 9 | 15 | 4 | 14.3% |
| tdcg | 12 | 4 | 5 | 3 | 25.0% |
| imr | 186 | 5 | 178 | 3 | 1.6% |
| eepc | 9 | 7 | 0 | 2 | 22.2% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| nf | 25 | 9 | 14 | 2 | 8.0% |
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
| DMG | 566 | 527 |
| SPEED | 375 | 288 |
| ADV | 374 | 140 |
| PROF | 356 | 114 |
| NUM | 322 | 322 |
| SLOT | 303 | 92 |
| RES | 289 | 110 |
| CHOICE | 235 | 67 |
| IMM | 204 | 64 |
| DIS | 178 | 65 |
| AC | 165 | 131 |
| SAVE | 140 | 123 |
| ATK | 138 | 109 |
| DC | 135 | 133 |
| SENSE | 133 | 116 |
| HP | 85 | 61 |
| ABIL | 50 | 47 |
| NUM-DICE | 19 | 19 |
| NUM-DIST | 18 | 18 |
| INIT | 12 | 12 |
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

### DMG (566 uncovered)

- `class|Craftsman|Weapon Enchantment#8` The weapon deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
- `class|Ranger|Foe Slayer#1` Your Hunter's Mark now uses a d10 for its damage die instead of a d6. | no record for DMG; number 1d10,1d6 unexplained
- `feat|Perfect Landing|Perfect Landing#3` Your fall damage die is a d4 instead of a d6. | no record for DMG; number 1d4,1d6 unexplained
- `item|bmt|Rogue Card#1` When you hit a target with a weapon attack while holding this card, you can deal an extra 6d6 force damage to that target. | no record for DMG; number 6d6 unexplained
- `item|bmt|Ruinous Flail#5` The poisoned creature takes 2d4 necrotic damage at the start of each of its turns. | no record for DMG; number 2d4 unexplained
- `item|cos|Blood Spear#6` Any creature can wield the spear, but only the character 15 to wield it gains a +2 bonus to attack and damage rolls made with this magic weapon. | number 15 no record explains
- `item|dmg|Agony (Exalted)#6` Hitting a marked creature deals an extra 1d6 piercing damage. | no record for DMG; number 1d6 unexplained
- `item|dmg|Agony (Exalted)#8` Extra damage on a marked target becomes 1d8. | no record for DMG; number 1d8 unexplained
- `item|dmg|Apparatus of Kwalish#14` Deeper than that, water pressure deals 2d6 Bludgeoning damage to the vehicle each minute. | no record for DMG; number 2d6 unexplained
- `item|dmg|Ballistic Sledge#6` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|dmg|Grovelthrash (Exalted)#26` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|dmg|Heaven's Herald#4` A Fiend or Undead who blows it takes 8d6 Radiant damage. | no record for DMG; number 8d6 unexplained
- `item|dmg|Sphere of Annihilation#5` Anything else that touches the sphere without being fully engulfed and obliterated takes 8d10 Force damage. | no record for DMG; number 8d10 unexplained
- `item|dmg|Telescoping Bladelance#3` Retracted, it is a Greatsword that deals 1d10 Slashing damage instead of 2d6. | no record for DMG; number 1d10,2d6 unexplained
- `item|dmg|Tinderstrike#2` Its handle is always warm to the touch, and the blade smolders for 1d4 minutes after it is used to deal damage. | no record for DMG; number 1d4 unexplained
- `item|dmg|Whisper (Awakened)#3` +1 to attack and damage rolls. | number 1 no record explains
- `item|egw|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Mace of the Black Crown (Awakened)#14` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | number 1 no record explains
- `item|egw|Mace of the Black Crown (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2, and the extra fire damage dealt by the weapon when it is ignited increases to 2d6. | no record for DMG; number 2d6,2 unexplained
- `item|egw|Silken Spite (Exalted)#32` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|The Bloody End (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|egw|Will of the Talon (Exalted)#37` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|misc14|Hazirawn#5` While you are attuned to this weapon, its bonus on attack and damage rolls increases to +2, and a hit deals an extra 2d6 necrotic damage (instead of 1d6). | number 2d6,1d6 no record explains
- `item|misc14|Shard of Xeluan#20` Each dart hits automatically and deals 3 (1d4 + 1) force damage to the target.. | no record for DMG; number 1d4,3,1 unexplained
- `item|tdcsr|Plate of the Dawnmartyr (Exalted)#8` The rebuke deals 2d6 fire damage. | no record for DMG; number 2d6 unexplained
- `item|tdcsr|Whisper (Exalted)#11` The bonus becomes +3 and the psychic damage becomes 1d8. | number 1d8 no record explains
- `item|tsdm|Ancestral Laser Sword#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Brass Repeater#4` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsgs|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|tsgs|Vancian Helm#7` A level 5+ spell cast into it while worn is lost, the slot is spent, and you take 2d6 Psychic damage. | no record for DMG; number 2d6 unexplained
- `species|Leonin|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | no record for DMG; number 1d4 unexplained
- `species|Vulpin|Bite#1` Your fangs make Unarmed Strikes that deal 1d6 Piercing damage. | no record for DMG; number 1d6 unexplained
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | no record for DMG; number 2d6 unexplained
- `sub|Artificer/Magneticist|Metal Slinger#10` When you hit a creature, you can deal an extra 1d6 damage of the weapon's type and move a Medium or smaller target 10 ft directly toward or away from you. | no record for DMG; number 1d6,10 unexplained
- `sub|Barbarian/Path of the Drifter|Relentless Aggression#1` Your Brutal Strike extra damage rises by 1d10 while you Rage and no ally is within 5 ft. | no record for DMG; number 1d10,5 unexplained
- `sub|Cleric/Dragon Domain|Divine Strike#1` Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Fire damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Ocean Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | no record for DMG; number 1d8 unexplained
- `sub|Cleric/Prophecy Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Ranger/Gloom Stalker|Stalker's Flurry#1` Your Dreadful Strike's Psychic damage increases to 2d8. | no record for DMG; number 2d8 unexplained
- `sub|Rogue/Cyber Ninja|Cyber Katana#5` You get +1 to attack and damage rolls with it, rising to +2 at Rogue level 9 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained

### SPEED (375 uncovered)

- `class|Dancer|Dance#3` It ends early if you are Incapacitated, your Speed is 0, or you choose to stop (no action). | no record for SPEED; number 0 unexplained
- `feat|Sentinel|Sentinel#6` If an Opportunity Attack of yours hits a creature, that creature's Speed becomes 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `item|dmg14|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | no record for SPEED; number 5,7,40 unexplained
- `item|dmg|Boots of Striding and Springing#1` Wearing these boots raises your Speed to 30 feet if it was lower than that. | no record for SPEED; number 30 unexplained
- `item|dmg|Carpet of Flying, 3 ft. × 5 ft.#3` A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet. | no record for SPEED; number 3,5,80 unexplained
- `item|dmg|Carpet of Flying, 5 ft. × 7 ft.#3` A 5 ft. × 7 ft. carpet can carry up to 600 lb. at a fly speed of 40 feet. | no record for SPEED; number 5,7,40 unexplained
- `item|dmg|Claws of the Umber Hulk#2` While wearing both claws, you gain a burrowing speed of 20 feet, and you can tunnel through solid rock at a rate of 1 foot per round. | number 1 no record explains
- `item|dmg|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|dmg|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Eagle Whistle#1` While you blow an eagle whistle continuously, you can fly twice as fast as your walking speed. | no record for SPEED; number double unexplained
- `item|dmg|Festerwood's Light#5` Magic action with a command word: spores hit all other creatures within 30 ft. An ally can use a Reaction to attack or move up to half Speed without Opportunity Attacks. | no record for SPEED; number 30,half unexplained
- `item|dmg|Figurine of Wondrous Power#25` Speed 30 feet, Fly 60 feet. | no record for SPEED; number 30,60 unexplained
- `item|dmg|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `item|dmg|Loadstone#6` Until the curse is broken with remove curse or similar magic, your speed is reduced by 5 feet, and your maximum load and maximum lift capacities are halved. | no record for SPEED; number 5 unexplained
- `item|dmg|Mechanical Wonder (Mobility)#10` While active, the mobility wonder increases your Speed to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Navigation Orb#5` The castle moves at a speed of 1 mph in a straight line, in a direction of your choice, until the castle stops or is made to stop, or until another action is used to change its direction. | no record for CHOICE,SPEED; number 1 unexplained
- `item|dmg|Potion of Aqueous Form#5` You have a swimming speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Powered Armor#12` - Activate boosters to gain a flying speed of 15 feet for 1 minute (1 charge or 5 hit points). | no record for RESOURCE,SPEED; number 15,1,5 unexplained
- `item|dmg|Quaal's Feather Token#17` That top speed is 16 miles per hour, for no more than 144 miles per day, and it must rest 1 hour after every 3 hours of flight. | no record for RESOURCE,SPEED; number 16,144,1,3 unexplained
- `item|dmg|Workshop Wrecker#1` When this 3-inch-diameter metal ball is activated as a Magic action, it moves at a rapid speed, bouncing off walls and defying any attempts to capture it. | no record for SPEED; number 3 unexplained
- `item|egw|Grovelthrash (Exalted)#42` You can burrow through solid rock at half your burrowing speed and leave a 5-foot-diameter tunnel in your wake. | no record for SPEED; number 5,half unexplained
- `item|erlw|Wheel of Wind and Water#2` If a wheel of wind and water is mounted on a mundane sailing ship, a creature with the Mark of Storm who is using the wheel can create an area of ideal conditions around the vessel, increasing its speed by 5 miles per ho | no record for SPEED; number 5 unexplained
- `item|idrotf|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|idrotf|Ythryn Mythallar#14` - While you're on the same plane of existence as the Ythryn mythallar, you can use an action to cause it to fly in any direction you choose at a speed of 30 feet. | no record for SPEED; number 30 unexplained
- `item|mot|Dekella, Bident of Thassa#25` You can cast the true polymorph spell (save DC 18) from the bident, but you must cast it on a creature to turn it into a kind of creature that has an innate swimming speed. | no record for DC,SPEED,SPELL; number 18 unexplained
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it mu | no record for DC,DMG,SPEED; number 3d8,90,5,15 unexplained
- `item|tee24|Cannith's Marvelous Miniatures#3` It follows simple commands and carries 500 lb at 16 mph (144 miles per day, resting 1 hour per 3 of flight) or 1,000 lb at half speed. | no record for RESOURCE,SPEED; number 144,1,3,half unexplained
- `item|tsgs|Couatl Herald's Radiance#6` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|tsgs|Festerwood Vizard#2` You have Blindsight 10 ft. As a Magic action, beetles pour out as a Swarm of Insects (Fly Speed) that you command, moving and attacking on summoning and then as a Bonus Action each turn. | no record for SPEED
- `item|tsgs|Ring of Anchoring#6` On a fail the arm is immobile for 1 minute, your Speed is 0, and you are dragged 30 ft down at the start of each turn. | no record for SPEED; number 30,1,0 unexplained
- `species|Dwarf (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Gnome (Grim Hollow)|Heritage Traits#6` You can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | no record for SPEED; number half unexplained
- `sub|Alchemist/Mutagenist|Mutagens#8` Your Dexterity increases by 3, to a maximum of 23, and your Speed increases by 10 feet. | no record for SPEED; number 10,3 unexplained
- `sub|Barbarian/Path of the Wrathful Dead|Dark Doom Revisited#10` Fail: Cold damage and Speed halved for 1 minute. | no record for SPEED; number 1 unexplained
- `sub|Craftsman/Mechanauts' Guild|Mechanaut's Apparatus#5` Doing so costs movement equal to half its Speed, rounded down. | no record for SPEED; number half unexplained
- `sub|Fighter/Psi Warrior|Telekinetic Adept#3` You can take a Bonus Action to gain a Fly Speed that is twice your Speed, lasting until the current turn ends. | number double no record explains
- `sub|Warmage/House of Darts|Dagger Climb#2` You gain a Climb Speed equal to your Speed for 10 minutes. | no record for SPEED; number 10 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | no record for SPEED; number 10 unexplained

### ADV (374 uncovered)

- `class|Rogue|Sneak Attack#2` Once per turn, if you have Advantage on an attack roll that uses a Finesse or Ranged weapon and the attack hits a creature, you can deal an extra 1d6 damage to that creature. | no record for ADV
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | no record for ADV; number 5 unexplained
- `feat|Witch Hunter|Witch Hunter#10` You have Advantage on saving throws against all Shadowsteel curses and against spells with a duration longer than 10 minutes. | no record for ADV; number 10 unexplained
- `item|bmt|Shrieking Greaves#3` While wearing these greaves, you can use a bonus action to expend 1 charge to increase your walking speed by 30 feet, and you have advantage on Dexterity saving throws. | no record for ADV,RESOURCE,SPEED; number 30,1 unexplained
- `item|coa|Accounting and Valuation of All Things#23` For 1 minute, the Accounting and Valuation of All Things speaks for you, using a +12 Charisma (Persuasion) skill and gaining advantage on your rolls. | no record for ADV; number 1,12 unexplained
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|dmg|Cloak of the Stygian Bat#3` As an action, gain a Fly Speed of 30 ft and Blindsight 120 ft for 1 minute, with Advantage on Dexterity saves while in the air. | no record for ADV,SENSE,SPEED; number 30,120 unexplained
- `item|dmg|Deck of Many Things#22` If you are the one who drops that foe to 0 Hit Points in that fight, you gain Advantage on Death Saving Throws, which lasts 1 year. | no record for ADV; number 1,0 unexplained
- `item|dmg|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|dmg|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Hunter's Zeal#2` For 1 hour you have Immunity to Poison damage and the Poisoned condition and Advantage on saves to avoid being cursed. | no record for ADV; number 1 unexplained
- `item|dmg|Medal of Wit#2` Doing so gives you advantage on Intelligence checks and Intelligence saving throws for 1 hour. | no record for ADV
- `item|dmg|Murgaxor's Elixir of Life#1` Whoever drinks this concoction gains advantage on death saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|dmg|Talon Tincture#2` Apply it to your talons, claws, or other limbs and you have Advantage on Dexterity ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|egw|Luxon Beacon#10` If the original d20 roll has advantage or disadvantage, the creature rolls its d20 after advantage or disadvantage has been applied to the original roll. | no record for ADV,DIS; number 1d20 unexplained
- `item|tee24|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|tghg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | no record for ADV,DIS,SPEED; number 1d20,15 unexplained
- `item|thhw|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|thhw|Draught of Slime Curse Cure#2` Drinking it gives you the benefit of remove curse as if cast on you, and Advantage on saves against being cursed for 1 hour afterward. | no record for ADV; number 1 unexplained
- `item|tsgs|+2 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `sub|Investigator/Conspiracy Theorist|Trinkets#5` Give yourself Advantage on one D20 Test before you roll. | no record for ADV; number 1d20 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#12` Acumen (Celestial, Fiend, Fey): 1 hour, Advantage on Wisdom (Insight) checks and on one chosen skill, Intimidation or Persuasion. | no record for ADV
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Radiance|Aura of Resolve#1` You and allies within 10 ft have Advantage on saves against spells and effects from undead and from creatures native to the Shadow Realm or with levels of shadow corruption. | no record for ADV; number 10 unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | number 1,0 no record explains
- `sub|Paladin/Oath of the Crown|Exalted Champion#3` Allies within 30 feet have Advantage on death saving throws. | number 30 no record explains
- `sub|Sorcerer/Farseer|Sharing the Dream#1` Action: grant up to five creatures (you may be one) Advantage on attack rolls or saving throws for up to 1 minute, with Concentration. | no record for ADV; number 1,5 unexplained
- `sub|Vagabond/Digital Nomad|High Score#6` 10 points, Aimbot: Advantage on an attack roll. | no record for ADV; number 10 unexplained
- `sub|Warlock/The Genie Lord|Herald's Aspect#3` You gain a 60 ft Fly Speed and Advantage on saves against spells and magical effects. | no record for ADV,SPEED; number 60 unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Witch/Fragrant Magic|Aromamancy#8` For 1 hour you have Advantage on Charisma checks to influence a creature within 5 feet of you. | no record for ADV; number 5,1 unexplained
- `sub|Wizard/Graviturgy Magic|Adjust Density#3` With doubled weight it loses 10 feet of Speed and has Advantage on Strength checks and saves. | no record for ADV,SPEED; number 10,double unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained

### PROF (356 uncovered)

- `class|Investigator|Expertise~2#1` Choose two of your skill proficiencies and gain Expertise in them. | no record for PROF
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | no record for PROF; number double,pb unexplained
- `class|Monster Hunter|Monster Grimoire#8` If you are already proficient in the skill, add double your Proficiency Bonus. | number double,pb no record explains
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `feat|Prodigy|Prodigy#5` You gain Expertise with it, doubling your Proficiency Bonus for checks with that skill. | no record for PROF; number pb unexplained
- `item|bgdia|Charm of Many Tongues#2` You gain proficiency in Deception and Persuasion, and you add double your proficiency bonus to checks with those skills. | number double,pb no record explains
- `item|dmg|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|dmg|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|dmg|Diode Beam#5` If you are proficient with Martial weapons, the save DC rises to 15 at level 5, 17 at level 11 and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|dmg|Exo-Frame#10` It holds two Battlefists, and you are proficient with them. | number 2 no record explains
- `item|dmg|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|dmg|Horn of Valhalla#14` 91-00, iron horn (Legendary): 5 spirits, and you must have proficiency with all Martial weapons. | no record for PROF; number 91,00,5 unexplained
- `item|dmg|Ioun Stone, Religious Knowledge#8` You gain proficiency in the Religion skill, or a +1 bonus to checks with that skill if already proficient, while this tiny golden gem orbits your head. | number 1 no record explains
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|erlw|Living Gloves#8` When you make an ability check using the chosen proficiency, you add double your proficiency bonus to the check, instead of your normal proficiency bonus. | number double,pb no record explains
- `item|tee24|Blast Disk (Common)#10` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tee24|Blast Disk (Uncommon)#9` Disarming needs proficiency in Arcana and a Dexterity check with Thieves' Tools against the save DC, and failing by 5 or more sets it off. | no record for DC,PROF; number 5 unexplained
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Gravity Gun#8` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for PROF; number 15 unexplained
- `item|tsdm|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | no record for PROF; number 2 unexplained
- `item|tsgs|Knight's Standard of Vigor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Poisoned if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|tsgs|Memento of the Shapeless#17` You add your Proficiency Bonus to Strength (Athletics) checks with that limb, doubled if you are already proficient in Athletics. | no record for PROF; number double,pb unexplained
- `item|tsgs|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|tvss|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `species|Gallus|Communal#1` On an Intelligence (History) check about the history of your people, culture or community, you count as proficient and add double your Proficiency Bonus. | no record for PROF; number double,pb unexplained
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `sub|Captain/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Cleric/Knowledge Domain (2014)|Channel Divinity: Knowledge of the Ages#2` You have proficiency with it for 10 minutes. | no record for PROF
- `sub|Fighter/Living Crucible|Student of Alchemy#1` You gain Alchemist's Supplies with proficiency, and your Proficiency Bonus is doubled on ability checks made with them. | number double,pb no record explains
- `sub|Investigator/Kid Sleuth|Animal Sidekick#8` The familiar gains proficiency in any two skills or tools of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `sub|Vagabond/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains
- `sub|Warlock/The Sibyl|Touched by the Sybil#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | no record for PROF; number double,pb unexplained
- `sub|Warmage/House of Bishops|Arcane Study#1` You gain proficiency in two skills of your choice from Arcana, History, Investigation, Medicine, and Religion. | no record for PROF
- `sub|Wizard/Materializer|Arcane Artisan#5` You gain proficiency with three Artisan's Tools of your choice. | no record for PROF
- `sub|Wizard/Necrophage|Memory of Flesh#4` If the target was proficient in any Intelligence skill, you pick one of them and gain proficiency in it, or double your Proficiency Bonus with it if you already have it. | no record for CHOICE,PROF; number double,pb unexplained
- `sub|Wizard/White Necromancer|White Necromancy#2` When you cast it, an undead with Intelligence 5 or lower gets Intelligence 6 and understands and speaks one language you speak. | no record for PROF; number 5,6 unexplained

### NUM (322 uncovered)

- `class|Captain|Cohort~4#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | number 2 no record explains
- `class|Healer|Combat Supporter (+3)#1` Your Combat Supporter bonus is +3. | number 3 no record explains
- `feat|Crusher|Crusher#2` Either your Strength or your Constitution score rises by 1, but not above 20. | number 1,20 no record explains
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | number 2 no record explains
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | number 20 no record explains
- `feat|Poisoner|Poisoner#2` Pick Dexterity or Intelligence and raise it by 1 (maximum 20). | number 1,20 no record explains
- `feat|Skulker|Skulker#2` Your Dexterity rises by 1 (maximum 20). | number 1,20 no record explains
- `feat|Warzone Nomad|Warzone Nomad#6` When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. | number 0 no record explains
- `item|bgdia|Blade of Avernus#11` - 1 major detrimental property, which is suppressed while the sword is attuned to an archdevil | number 1 no record explains
- `item|dmg14|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg14|Horn of Valhalla, Brass#6` A brass horn summons 3d4 + 3 berserkers. | number 3d4,3 no record explains
- `item|dmg14|Ioun Stone, Mastery#8` Your proficiency bonus increases by 1 while this pale green prism orbits your head. | number pb no record explains
- `item|dmg|Accounting and Valuation of All Things#7` - 1 major detrimental property | number 1 no record explains
- `item|dmg|Alluring Dye#3` For 24 hours after the first use you have +2 to Charisma saves, and you cannot gain this again unless you use a dye of a different color. | number 24,2 no record explains
- `item|dmg|Arcane Warhead#6` Impact leaves it dormant until it is reduced to 0 Hit Points. | number 0 no record explains
- `item|dmg|Baba Yaga's Dancing Broom#7` A broom reduced to 0 Hit Points breaks apart and is destroyed. | number 0 no record explains
- `item|dmg|Bag of Tricks, Gray#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Bag of Tricks, Tan#5` The creature vanishes at the next dawn or when it is reduced to 0 hit points. | number 0 no record explains
- `item|dmg|Deck of Several Things#60` Reduce your Intelligence by 1d4 + 1 (to a minimum score of 1) for the duration of the adventure. | number 1d4,1 no record explains
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#8` 6 Red: 1d8 + 4 Temporary Hit Points. | number 1d8,6,4 no record explains
- `item|dmg|Ioun Stone#19` While it circles your head, your Dexterity rises by 2, up to a maximum of 20. | number 2 no record explains
- `item|dmg|Mace of Smiting#2` When you attack a Construct with it, that bonus is +3 instead. | number 3 no record explains
- `item|dmg|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|dmg|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | number 20,30 no record explains
- `item|dmg|Rod of the Pact Keeper, +2#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 3 no record explains
- `item|dmg|Rod of the Pact Keeper, +3#1` This rod comes in three versions: +1 (Uncommon), +2 (Rare), and +3 (Very Rare). | number 2 no record explains
- `item|dmg|Ruidium Shield#14` If the Apotheon is killed or redeemed, all the ruidium in Exandria is destroyed instantly, and a ruidium shield becomes a +2 shield. | number 2 no record explains
- `item|dmg|Stone of Creation#8` - 2 minor beneficial properties | number 2 no record explains
- `item|dmg|Stone of Creation#9` - 1 major beneficial property | number 1 no record explains
- `item|egw|Grimoire Infinitus (Exalted)#10` - When you prepare wizard spells using the grimoire as your spellbook, the number of spells you can prepare increases by 1 again. | number 1 no record explains
- `item|misc14|Daoud's Wondrous Lanthorn#10` - 1 major beneficial property | number 1 no record explains
- `item|tce|Baba Yaga's Mortar and Pestle#9` - 1 minor detrimental property | number 1 no record explains
- `item|tdcsr|Magician's Judge#4` For any check with your spellcasting ability, use +3 or your own modifier, whichever is higher. | number 3 no record explains
- `item|tsdm|Jax#2` For 1 hour, your Strength and Dexterity each rise by 2, to a maximum of 22. | number 1,2 no record explains
- `item|tsdm|Terraforming Engine#3` Set on a Tier 4 or higher planet and left running for a year to process its water, air and soil, it lowers the planet's Tier by 1. | number 4,1 no record explains
- `item|tsgs|Kraken's Whip#3` On a failure it is Grappled and takes 1d4 + 2 Bludgeoning, and again at the end of each of its turns. | number 1d4,2 no record explains
- `item|tsgs|Null Chalk#1` A pouch with 1d4 + 1 chalk sticks. | number 1d4,1 no record explains
- `item|tsgs|Overshield#2` The bonus is +2 while you have any Temporary HP, and the Shield glows blue. | number 2 no record explains
- `item|tsgs|Staff of the Magpie#2` Holding it gives +1 to Wisdom (Perception) checks to find treasure or a specific item. | number 1 no record explains
- `sub|Martyr/Burden of Discord|Coin of Chaos#3` It is +4 on heads and +1 on tails. | number 4 no record explains

### SLOT (303 uncovered)

- `class|Druid|Archdruid#6` Pick some of your unexpended Wild Shape uses and convert them into one spell slot, where each use counts for 2 spell levels. | no record for SLOT; number 2 unexplained
- `class|Witch|Familiar#2` You can cast it in 10 minutes with no spell slot and no components, and it gains these upgrades. | no record for SLOT
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | no record for SLOT; number 2 unexplained
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | no record for SLOT; number pb unexplained
- `feat|Shadow Touched|Shadow Touched#6` You can cast each of the two once with no spell slot. | no record for SLOT,SPELL; number 2 unexplained
- `item|dmg14|Boon of the Stormborn#2` You can also cast Thunderwave (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg14|Manual of Flesh Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg14|Manual of Iron Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|+3 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|dmg|Ascendant Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Boon of the Fire Soul#2` You can also cast Burning Hands (save DC 15) at will, with no spell slot and no components. | no record for SLOT
- `item|dmg|Brain Juice#4` You regain 1d6 + 4 expended spell slots. | no record for RESOURCE,SLOT; number 1d6,4 unexplained
- `item|dmg|Manual of Clay Golems#3` To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. | no record for SLOT; number 2 unexplained
- `item|dmg|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|dmg|Potion of Spell Recovery#1` Drinking it restores expended spell slots of your choice, each of level 1 to 5, with a combined level of 1d3 + 3 or less. | no record for CHOICE,RESOURCE,SLOT; number 1d3,3 unexplained
- `item|dmg|Wakened Dragon-Touched Focus#7` Whenever you use a spell slot to cast a spell that deals acid, cold, fire, lightning, or poison damage, roll a d6, and you gain a bonus equal to the number rolled to one of the spell's damage rolls. | no record for DMG,SLOT; number 1d6 unexplained
- `item|dmg|Wyrmskull Throne#23` The spell is cast as though using a 9th-level spell slot and deals 49 (14d6) lightning damage. | no record for DMG,SLOT; number 14d6,49 unexplained
- `item|ftd|Ascendant Dragon-Touched Focus#9` Whenever you use a spell slot to cast a spell, you can immediately teleport to an unoccupied space you can see within 15 feet of you. | no record for SLOT,SPELL; number 15 unexplained
- `item|ggr|Mizzium Apparatus#9` The DC is 10 + twice the level of the spell slot you expend to cast the spell. | no record for DC,RESOURCE,SLOT,SPELL; number 10,double unexplained
- `item|tce|+1 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tce|+2 Arcane Grimoire#3` In addition, when you use your Arcane Recovery feature, you can increase the number of spell slot levels you regain by 1. | no record for SLOT; number 1 unexplained
- `item|tee24|Ghaal'duur, the Mighty Dirge#6` Held in both hands as a Spellcasting Focus, your Bard spells have doubled duration if 1 minute or longer (max 24 hours), doubled range if 5 ft or more, and are cast as one slot level higher. | no record for SLOT; number 5,double unexplained
- `sub|Bard/College of Spirits|Empowered Channeling#2` Once per turn, when you cast a Bard spell with a spell slot that deals damage or restores Hit Points, roll 1d6 and add the result to one of the spell's damage rolls or to the total Hit Points it restores. | no record for DMG,SLOT; number 1d6 unexplained
- `sub|Cleric/Blood Domain|Sanguine Recall#1` Action: recover spell slots with a combined level up to half your Cleric level (rounded up, none above 5th), taking 1d8 Necrotic per slot level. | no record for SLOT; number 1d8,half unexplained
- `sub|Cleric/Life Domain|Disciple of Life#2` The extra amount is 2 + the spell slot's level. | no record for SLOT; number 2 unexplained
- `sub|Craftsman/Forgeknights' Guild|Fire Burst#1` While you hold your Portable Forge, you can cast Fireball centered on yourself with no spell slot and no components (DC 8 plus your Intelligence modifier plus your Proficiency Bonus). | no record for DC,SLOT; number 8,pb unexplained
- `sub|Investigator/Occultist|Pact Magic#9` Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. | no record for SLOT; number 1 unexplained
- `sub|Necromancer/Pale Master|Archlich [Lichdom]#5` Roll a d8 and regain expended spell slots of your choice whose combined level is no more than the roll. | no record for CHOICE,SLOT; number 1d8 unexplained
- `sub|Paladin/Oath of the Giving Grave|Unholy Smite#3` It is 2d8 for a level 1 slot, plus 1d8 per slot level above 1, to a maximum of 5d8. | no record for SLOT; number 2d8,1d8,1 unexplained
- `sub|Sorcerer/Aristocratic|Channel Energy#4` Example: a level 3 Sorcerer who saves against a level 2 spell may regain two level 1 slots or one level 2 slot. | no record for SLOT
- `sub|Warlock/The First Vampire Patron|Drain Life#3` When it hits, you can expend a Pact Magic slot for an extra 1d8 Necrotic damage plus 1d8 per slot level. | no record for DMG,RESOURCE,SLOT; number 1d8 unexplained
- `sub|Warlock/The First Vampire Patron|Eldritch Appetite#1` Reaction when Drain Life drops an enemy to 0 HP: regain one expended Pact Magic slot. | no record for SLOT; number 0 unexplained
- `sub|Wizard/Abjurer|Arcane Ward#8` Each time you cast an Abjuration spell using a spell slot, the ward regains Hit Points equal to twice the slot's level. | no record for RESOURCE,SLOT,SPELL; number double unexplained
- `sub|Wizard/Abjurer|Arcane Ward#9` As an alternative, you can take a Bonus Action to expend a spell slot, and the ward regains Hit Points equal to twice the level of the expended slot. | no record for RESOURCE,SLOT; number double unexplained
- `sub|Wizard/Conjurer|Distant Transposition#2` You can also restore one use of it by spending a level 3 or higher spell slot (no action required). | no record for RESOURCE,SLOT; number 1 unexplained
- `sub|Wizard/Dragon Mage|Invoke Dragon Tail#2` It lasts 1 round per slot level and ends early if you are Incapacitated or dismiss or replace it with a Bonus Action. | no record for SLOT; number 1 unexplained
- `sub|Wizard/Evoker|Overchannel#4` A second use before you finish a Long Rest deals 2d12 Necrotic damage to you per level of the spell slot, right after you cast the spell. | no record for DMG,RESOURCE,SLOT,SPELL; number 2d12 unexplained
- `sub|Wizard/Necromancer|Necromancy Spellbook#10` When you cast a Necromancy spell with a spell slot, you can pick an Undead creature you can see within 60 feet. | no record for SLOT; number 60 unexplained
- `sub|Wizard/Somnomancer|Deep Sleep#4` With a level 2+ slot, the Sphere radius grows 5 ft per slot level above 1. | no record for SLOT; number 5,1 unexplained

### RES (289 uncovered)

- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | number 1 no record explains
- `feat|Void Scribe|Void Scribe#3` While the glyph is intact, the object is vulnerable to necrotic damage and takes 1d6 necrotic damage at the end of your turn. | no record for DMG,RES; number 1d6 unexplained
- `item|coa|Amulet of the Inferno#11` Hellfire ignores resistances and immunities to fire damage and deals double damage to creatures vulnerable to either fire or necrotic damage. | number double no record explains
- `item|coa|Canian Fork#5` You're also vulnerable to radiant damage and each time you receive magical healing, you must make a DC 15 Constitution saving throw. | no record for DC; number 15 unexplained
- `item|dmg|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|dmg|Dragon-Kindled Edge#6` If the breath dealt damage, the blade glows for 1 minute (Bright Light 10 ft, Dim 10 ft more) and the first hit you land with it deals an extra 6d6 of the breath's damage type, ignoring Resistance and Immunity. | no record for DMG,IMM,RES; number 6d6,10 unexplained
- `item|dmg|Flamefriend Lantern#7` As an action, gain one benefit for 1 hour: resistance to fire damage, or creatures that hit you with a melee attack take fire damage equal to your proficiency bonus, or you can cast Burning Hands from it at 3rd level (sa | no record for RES; number pb unexplained
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|dmg|Kindle Egg Sugarbomb#2` For 1 hour you have Resistance to Fire and can endure temperatures down to -50 degrees Fahrenheit without protection. | no record for RES; number 1,50 unexplained
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Warden's Link#4` For example, a link with the effects of Armor of Resistance or a +2 weapon is Very Rare. | no record for RES; number 2 unexplained
- `item|dmg|Wrought-Iron Tower#31` They then take 20d10 fire damage, which ignores resistance and immunities. | no record for DMG,RES; number 20d10 unexplained
- `item|idrotf|Charm of Cold Resistance#1` As an action, give yourself resistance to Cold damage for 24 hours. | no record for RES; number 24 unexplained
- `item|misc14|Mask of the Dragon Queen#6` Additionally, you gain the Damage Absorption from each of the five dragon masks, and you gain five uses of the Legendary Resistance property. | no record for DMG
- `item|pabtso|Mudslick Tower#16` The roof, the door, and the walls each have 100 hit points, immunity to damage from nonmagical weapons excluding siege weapons, and resistance to all other damage. | no record for IMM,RES; number 100 unexplained
- `item|skt|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|tsdm|Scout Scanner#2` As a Bonus Action, spend 1 charge to analyze a creature you see within 60 ft. You learn two of these: its AC, current Hit Points, Immunities, Resistances, Vulnerabilities, or the spells currently affecting it. | no record for RES; number 60,1,2 unexplained
- `item|tsgs|Band of Mirrored Essence#7` Gain one skill or save proficiency, Damage Resistance, Condition Immunity, special sense, language, or water breathing it had, for 8 hours. | no record for IMM,PROF,RES; number 8 unexplained
- `item|tsgs|Forgemaster's Might#3` As a Bonus Action, speak "light the forge" to wreathe the head in flames: Bright Light in 20 ft and Dim Light for 20 ft more, an extra 1d8 Fire damage on a hit, and it ignores Fire Resistance. | no record for DMG,RES; number 1d8,20 unexplained
- `item|tsgs|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `sub|Druid/Circle of Blood|Blood Lust#1` While your Blood Moon is active: Violent Strikes deal 2d6 Necrotic damage, and you have Resistance to Bludgeoning, Piercing and Slashing damage. | no record for DMG; number 2d6 unexplained
- `sub|Druid/Circle of the Warden|Reclamation#1` Reaction: when a creature within 30 ft takes cold, fire, lightning or thunder damage, it gains Resistance to that damage and you take an amount equal to what it took. | no record for RES; number 30 unexplained
- `sub|Monk/Way of the Cobalt Soul|Debilitating Barrage#1` When you hit with an unarmed strike, spend 3 ki points so the creature gains vulnerability to a damage type you choose for 1 minute or until it takes that damage. | no record for RES,RESOURCE; number 1,3 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Monster Hunter/Trapper Guild|Monster-Hide Armor#6` Damage Resistance: Resistance to two of Acid, Cold, Fire, Lightning, Poison, or Thunder. | number 2 no record explains
- `sub|Ranger/Green Reaper|Toxic Tradecraft#7` Slot level 2+: Debilitate (can't regain HP for 1 minute), Potent (loses Resistance to Poison damage for 1 minute), Suffer (for 1 minute, the first Poison damage it takes each turn is 1d6 higher). | no record for DMG,RES,RESOURCE,SLOT; number 1d6,1 unexplained
- `sub|Ranger/Monster Slayer|Hunter's Sense#1` As an action you choose a creature you can see within 60 feet and learn any damage Immunities, Resistances, and Vulnerabilities it has. | no record for CHOICE,RES; number 60 unexplained
- `sub|Sorcerer/Apocalypse Sorcery|Forbidden Magic#4` Right after casting you take Force damage equal to four times the slot level, ignoring Resistance and Immunity. | no record for IMM,RES,SLOT; number 4 unexplained
- `sub|Sorcerer/Draconic Bloodline|Elemental Affinity#2` At the same time you can spend 1 sorcery point to gain Resistance to that damage type for 1 hour. | no record for RESOURCE
- `sub|Sorcerer/Elemental Essence|Elemental Soul#8` You can spend 1 Sorcery Point to turn stony until the start of your next turn, gaining Resistance to Piercing and Slashing damage, Immunity to Poison damage, and immunity to being Petrified or Poisoned. | no record for RESOURCE; number 1 unexplained
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | no record for RES,SPELL; number 5,2 unexplained
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Mystic Strategist|Arcane Assessment#1` Bonus Action: study a creature within 30 ft. You learn whether it casts spells, its highest spell level, and whether it has Magic Resistance or Legendary Resistance. | no record for RES,SPELL; number 30 unexplained
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | no record for RES; number 2 unexplained
- `sub|Wizard/White Necromancer|Protect Life#1` Action: you and friendly creatures within 20 ft have Resistance to Necrotic damage for 1 minute. | no record for RES; number 20 unexplained

### CHOICE (235 uncovered)

- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | no record for CHOICE; number 3 unexplained
- `class|Cleric|Spellcasting#14` To begin, your list holds four level 1 Cleric spells of your choice. | no record for CHOICE; number 4 unexplained
- `class|Craftsman|Masterwork Armor#4` If the armor already gives such a bonus, such as +2 Half Plate Armor, you pick one bonus and cannot combine them. | no record for CHOICE; number 2,half unexplained
- `class|Martyr|Armor of Faith#1` Choose one of two benefits. | number 2 no record explains
- `class|Warlock|Pact Magic#19` To begin, pick two level 1 Warlock spells. | no record for CHOICE; number 2 unexplained
- `feat|Chronomancy Initiate|Chronomancy Initiate#8` Choose a number of Chronomancy spells equal to your Proficiency Bonus. | no record for CHOICE; number pb unexplained
- `feat|Greater Aberrant Mark|Greater Aberrant Mark#9` One other creature of your choice within 30 feet takes Force damage equal to the total rolled. | number 30 no record explains
- `feat|Greater Mark of Detection|Greater Mark of Detection#6` When you cast See Invisibility with Magical Detection (no slot), pick one creature you can see within 30 feet. | no record for CHOICE; number 30 unexplained
- `feat|Inventor|Inventor#3` You gain two Gadgets of your choice from the Gadget Options of the Gadgeteer class. | no record for CHOICE; number 2 unexplained
- `feat|Lycanthrope Transformation: Stage 1|Lycanthrope Transformation: Stage 1#7` Choose one Stage 1 Boon (your hybrid form) and gain the Stage 1 Flaw. | no record for CHOICE; number 1 unexplained
- `feat|Purple Dragon Rook|Purple Dragon Rook#4` When you roll Initiative and don't have the Incapacitated condition, you choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of you. | number 30 no record explains
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | number 2 no record explains
- `feat|Skilled|Skilled#1` Pick three skills or tools, in any mix. | no record for CHOICE; number 3 unexplained
- `item|dmg|Daern's Instant Fortress#6` Inside are two floors, joined by a ladder, staircase, or ramp of your choice, which ends at a trapdoor to the roof. | no record for CHOICE; number 2 unexplained
- `item|dmg|Rival Coin#9` Pick one creature in your view no more than 60 feet away. | no record for CHOICE; number 60 unexplained
- `item|dmg|Robe of Useful Items#16` 76 to 83: a Spell Scroll holding one spell of level 1, 2, or 3, of your choice. | no record for CHOICE; number 76,83,3 unexplained
- `item|frafi|Harper Pin#1` When you attune to this pin, choose a Harper persona (see the 6 for examples), including an alignment and a creature type. | no record for CHOICE; number 6 unexplained
- `item|tsdm|Un's Codex#5` Spend 8 hours attuned to solve part of it and unlock one property of your choice. | no record for CHOICE; number 8 unexplained
- `item|tsgs|Sheer Cold#3` On a roll of 20 on the attack, choose a 15 ft Cone or a 30 ft long, 5 ft wide Line toward the target. | no record for CHOICE; number 15,30,5 unexplained
- `sub|Barbarian/Path of the Berserker|Intimidating Presence#2` Choose any creatures you like in a 30-foot Emanation from you. | no record for CHOICE; number 30 unexplained
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#11` Creatures of your choice in the aura gain 2 Temporary Hit Points, rising to 3 at level 5, 4 at 10, 5 at 15, and 6 at 20. | number 2,5,6 no record explains
- `sub|Bard/College of Chronology (Dark Matter)|Chronomantic Secrets#9` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Chronology|Chronomantic Secrets#4` Pick two Chronomancy spells you have slots for. | no record for CHOICE; number 2 unexplained
- `sub|Bard/College of Lore|Bonus Proficiencies#1` Choose any three skills. | no record for CHOICE; number 3 unexplained
- `sub|Cleric/Angelic Scribe|Seal Scribe#1` You learn Celestial if you do not know it, and you learn two angelic seals of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | number 4 no record explains
- `sub|Fighter/Battle Master (2014)|Know Your Enemy#1` If you spend at least 1 minute watching or interacting with another creature outside combat, the Dungeon Master tells you whether it is your equal, superior, or inferior in two characteristics of your choice: Strength, D | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Battle Master|Combat Superiority#7` When you reach Fighter levels 7, 10, and 15, you learn two more maneuvers of your choice. | no record for CHOICE; number 2 unexplained
- `sub|Fighter/Purple Dragon Knight (Banneret)|Inspiring Surge#3` From level 18 you can choose two allies. | no record for CHOICE; number 2 unexplained
- `sub|Investigator/Infernum|Infernal Bargain#11` Choose two of Acid, Cold, Fire, Lightning, Poison, Psychic, and Thunder. | no record for CHOICE; number 2 unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#2` Or you can choose an ally within 30 feet who can see or hear you. | no record for CHOICE; number 30 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#12` At first you choose three level 1 spells (Jump, Magic Missile, and Shield are good picks). | number 3 no record explains
- `sub|Necromancer/Plague Lord|Corpulent Lich [Lichdom]#10` Choose two effects below to afflict it while cursed. | no record for CHOICE; number 2 unexplained
- `sub|Paladin/Oath of the Annihilator|Harbinger of the End#1` Action: take the form of a harbinger of the apocalypse for 1 minute, with a frightening look of your choice such as stony skin, flaming hair or demonic horns. | no record for CHOICE
- `sub|Sorcerer/Pyromancer (PSK)|Heart of Fire#2` Creatures of your choice that you can see within 10 feet take Fire damage equal to half your Sorcerer level, with a minimum of 1. | no record for CHOICE; number 10,half unexplained
- `sub|Summoner/Bond of the Elemental Spirit|Twin Eidolons#7` Your magic sustains both for 10 minutes, then one of your choice dissipates. | no record for CHOICE
- `sub|Wizard/Alkemancer|Craft Minor Elixir#1` You automatically learn the formulas for 1 plus your Intelligence modifier (minimum 1) elixirs, oils, philters or potions of your choice, with no research time or gold. | no record for CHOICE; number 1 unexplained
- `sub|Wizard/Conjurer|Conjuration Savant#1` Choose two Wizard spells from the Conjuration school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Necromancer|Necromancy Savant#1` Choose two Wizard spells from the Necromancy school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains
- `sub|Wizard/Transmuter|Transmutation Savant#1` Choose two Wizard spells from the Transmutation school, each of level 2 or lower, and add them to your spellbook for free. | number 2 no record explains

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (101)

- `class|Vagabond|Secret#2` Choose one Secret from the nine options. | angka: 9
- `class|Investigator|Weapon Mastery#3` After a Long Rest you can change the two kinds. | angka: 2
- `class|Necromancer|Lichdom#6` If you drop to 0 Hit Points, your body crumbles and you reform after 1d4 + 1 days with full Hit Points. | angka: 1d4,1,0
- `class|Vagabond|Last Stand#1` When damage drops you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Vagabond level. | angka: 0,double
- `class|Martyr|Divine Respite~2#1` When you finish a Short Rest, you can regain up to 3 spent Hit Point Dice. | angka: 3
- `class|Alchemist|Nuclear Bomb#3` The Bomb deals 10d10 + 100 Force damage instead of Fire, in a sphere with a 1 mile radius. | angka: 10d10,1,100
- `class|Captain|Cohort~4#15` Your Cohort is proficient in the skills and saving throws in its stat block and uses your Proficiency Bonus. | angka: pb
- `class|Warmage|Arcane Initiation#2` Each Initiation gives you two cantrips and a skill, as listed in its entry. | angka: 2
- `class|Monk|Superior Defense#2` Until 1 minute passes or you have the Incapacitated condition, you have Resistance to every type of damage except Force damage. | angka: 1
- `class|Artificer|Spell-Storing Item#2` Choose a level 1, 2, or 3 Artificer spell with an action casting time and no consumed Material component. | angka: 3
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | angka: 2
- `class|Warden|Survive#1` When you drop to 0 Hit Points and are not killed outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Warden level. | angka: 0,double
- `class|Bard|Superior Inspiration#1` When you roll Initiative and have fewer than two uses of Bardic Inspiration left, you regain expended uses until you have two. | angka: 2
- `class|Healer|Combat Supporter (+2)#1` Your Combat Supporter bonus is +2. | angka: 2
- `class|Rogue|Cunning Strike#6` When a Cunning Strike effect calls for a saving throw, the DC is 8 plus your Proficiency Bonus and Dexterity modifier. | angka: 8,pb
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Martyr|Divine Respite~3#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Alchemist|Bombs#9` To count them instead, you make 10 + twice your Alchemist level after each Short or Long Rest. | angka: 10,double
- `class|Alchemist|Prime Bomb#2` At higher levels you can expend more, up to the Prime Bomb column, and each Reagent adds 1d10. | angka: 1d10
- `class|Martyr|Divine Respite~2#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Jaeger|Eldritch Hunter#2` If you are already proficient in the check, add double your Proficiency Bonus instead. | angka: double,pb
- `class|Captain|Cohort~3#16` The stat blocks already include a +2 bonus, so you only adjust skill and save proficiencies from level 5. | angka: 2
- `class|Captain|Cohort~2#11` If your Cohort forces a saving throw, the DC is 8 + your Charisma modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Craftsman|Masterwork Armor#2` While you wear it, you gain a bonus to AC equal to half your Masterwork Bonus, rounded up. | angka: half
- `class|Captain|Battle Tactics#12` When a maneuver calls for a saving throw, the DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Witch|Familiar#14` Add twice your Witch level to its Hit Points maximum. | angka: double
- `class|Martyr|Divine Respite#3` The number of dice you regain becomes 6 at level 13 and 10 at level 17. | angka: 6
- `class|Investigator|Expertise#3` At level 9 you gain Expertise in two more skills. | angka: 2
- `class|Druid|Wild Companion#2` As a Magic action, you can cast Find Familiar without Material components by expending either a spell slot or one use of Wild Shape. | angka: 1

### feat (195)

- `feat|Gun-Mage Adept|Gun-Mage Adept#9` Choose a number of Firearm spells equal to your Proficiency Bonus. | angka: pb
- `feat|Shadowsteel Master|Shadowsteel Master#6` If your Shadowsteel Focus is also a weapon, its bonus to attack rolls and damage rolls is +2. | angka: 2
- `feat|Shadowsteel Ghoul Transformation: Stage 4|Shadowsteel Ghoul Transformation: Stage 4#5` The first time you are Bloodied or drop to 0 Hit Points after finishing a Short Rest or Long Rest, the Shadowsteel in your flesh lashes out. | angka: 0
- `feat|Dual Wielder|Dual Wielder#2` Either your Strength or your Dexterity score rises by 1, but not above 20. | angka: 1,20
- `feat|Ritual Caster|Ritual Caster#2` Pick Intelligence, Wisdom, or Charisma and raise it by 1 (maximum 20). | angka: 20
- `feat|Familiar Friend|Familiar Friend#10` You can use this a number of times equal to your Proficiency Bonus, and regain all uses after a Long Rest. | angka: pb
- `feat|Spelldriver|Spelldriver#2` If you cast two or more spells in one turn, only one of them can be level 3 or higher. | angka: 2
- `feat|Metabolistic Magic|Metabolistic Magic#6` When you finish a Short Rest, you can spend Hit Point Dice up to your Proficiency Bonus to regain spell slots. | angka: pb
- `feat|Perfect Landing|Perfect Landing#3` Your fall damage die is a d4 instead of a d6. | angka: 1d4,1d6
- `feat|Crusher|Crusher#4` Once per turn, when an attack of yours hits a creature and deals Bludgeoning damage, you can move that creature 5 feet into an unoccupied space, as long as its size is at most one size above yours. | angka: 5
- `feat|Keenness of the Stone Giant|Keenness of the Stone Giant#10` On a hit it deals 1d10 Force damage, and the target must succeed on a Strength saving throw (DC 8 + your Proficiency Bonus + that ability modifier) or be knocked Prone. | angka: 1d10,8,pb
- `feat|Cohort of Chaos|Cohort of Chaos#9` 1, Battle Fury: a creature you can see has Advantage on attack rolls and Disadvantage on ability checks. | angka: 1
- `feat|Boon of Looming Shadows|Boon of Looming Shadows#4` When you take the Attack action, your reach with melee weapon attacks increases by 10 feet until the end of your turn. | angka: 10
- `feat|Greater Mark of Hospitality|Greater Mark of Hospitality#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Elemental Adept|Elemental Adept#2` Choose Intelligence, Wisdom, or Charisma and raise that score by 1, but not above 20. | angka: 1,20
- `feat|Script Carver|Script Carver#6` Each time, learn the benefit and powers of two more hieroglyphs of your choice. | angka: 2
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | angka: 2
- `feat|Order's Resilience|Order's Resilience#6` If you are within 5 feet of an ally who isn't Incapacitated, you and that ally have Advantage on Strength saving throws. | angka: 5
- `feat|Beastperson|Beastperson#7` When you deal damage with it, you can deal Slashing damage equal to 1d6 plus your Strength or Dexterity modifier instead of the normal damage. | angka: 1d6
- `feat|Observant|Observant#2` Pick Intelligence or Wisdom and raise it by 1 (maximum 20). | angka: 20
- `feat|Tireless Reveler|Tireless Reveler#3` You can do this a number of times equal to your Proficiency Bonus, and regain all expended uses after a Short or Long Rest. | angka: pb
- `feat|Greater Mark of Storm|Greater Mark of Storm#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Primordial Transformation: Stage 3|Primordial Transformation: Stage 3#9` You gain Vulnerability to that instance of damage, even if you had Resistance or Immunity, and creatures within 5 feet of you take the same amount of damage as you took. | angka: 5
- `feat|Void Scribe|Void Scribe#3` While the glyph is intact, the object is vulnerable to necrotic damage and takes 1d6 necrotic damage at the end of your turn. | angka: 1d6
- `feat|Metabolistic Magic|Metabolistic Magic#4` The bonus is 2 plus the level of the slot. | angka: 2
- `feat|Specter Transformation: Stage 2|Specter Transformation: Stage 2#5` Whenever you regain Hit Points, you regain only half as many, rounded down. | angka: half
- `feat|Boon of Spell Recall|Boon of Spell Recall#2` Add 1 to your Intelligence, Wisdom, or Charisma score (maximum 30). | angka: 1,30
- `feat|Aberrant Spawn|Aberrant Spawn#8` When you deal damage with it, you can deal Bludgeoning damage equal to 1d6 plus your Strength or Dexterity modifier instead of the normal damage. | angka: 1d6
- `feat|Greater Mark of Shadow|Greater Mark of Shadow#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Sentinel|Sentinel#2` Pick Strength or Dexterity and raise it by 1 (maximum 20). | angka: 1,20

### item (1925)

- `item|thhw|Saber of Unity#3` You and any allies within 10 ft of you are immune to the Frightened condition while you wield it. | angka: 10
- `item|dmg|Ring of Eldritch Ire#4` You gain +1 to attack and damage rolls against it, it has -1 on saves against your spells, you know its distance and direction on the same plane, and within 60 ft you perceive it as if with Truesight, | angka: 60,1
- `item|dmg|Silken Spite (Dormant)#5` It has hearing and darkvision out to a range of 120 feet. | angka: 120
- `item|dmg|Deathwalker's Ward (Exalted)#3` +1 AC while you wear it. | angka: 1
- `item|tsgs|Thwackstaff#2` You get +1 to Charisma (Performance) checks to entertain with it. | angka: 1
- `item|dmg|Ionbreaker, the Tempest's Reach#8` After a ranged hit on your turn, the target and creatures within 5 ft take 1d8 Lightning (once per creature per round). | angka: 1d8,5
- `item|dmg|Starmetal Solar Axe#3` +1 to attack and damage, an extra 2d6 Fire damage, and flames shed Bright Light in a 20 ft radius and Dim Light for 20 ft more, as sunlight. | angka: 20
- `item|tsgs|Smash Potatoes#5` You can eat up to three before a Long Rest. | angka: 3
- `item|egw|Hide of the Feral Guardian (Exalted)#15` - The AC bonus of the armor increases to +2. | angka: 2
- `item|tsgs|Merry Berry#2` When cooked properly, the eater has Advantage on Intelligence and Wisdom checks that rely on smell or taste, and on checks with Cook's Utensils, for 24 hours. | angka: 24
- `item|tce|Spellwrought Tattoo (4th Level)#7` The Ability modifier for this spell is +4; the Save DC is 15 and the attack bonus is +7. | angka: 4,15,7
- `item|oota|Spell Gem (Quartz)#7` The DC equals 10 + the spell's level. | angka: 10
- `item|dmg|Personality Module#3` While it is installed you are proficient in two skills, know two languages and have one personality trait of the original. | angka: 2
- `item|dmg|Shield of the Uven Rune#19` The bonus increases to +3 when the weapon is used against one of the following creature types, chosen by you at the time of the magic weapon's creation: aberrations, celestials, constructs, dragons, e | angka: 3
- `item|dmg|Titanstone Knuckles (Awakened)#3` Your Strength score becomes 22 while you wear them. | angka: 22
- `item|dmg|Pyxis of Pandemonium#5` Any spells cast by the vessel have a spell save DC of 17. | angka: 17
- `item|dmg|Sanctuary Charm~2#1` After a Long Rest in your Bastion, you gain a magical Charm that lasts 7 days or until used. | angka: 7
- `item|egw|Vox Seeker#5` A vox seeker reduced to 0 hit points is destroyed. | angka: 0
- `item|pota|Tinderstrike#2` Its handle is always warm to the touch, and the blade smolders for 1d4 minutes after it is used to deal damage. | angka: 1d4
- `item|dmg|Crown of Lies#14` - 1 minor detrimental property | angka: 1
- `item|tdcsr|Spire of Conflux (Exalted)#8` 12 charges, regains 1d6 + 2 at dawn. | angka: 12,2
- `item|egw|Ruin's Wake (Awakened)#24` - The weapon's bonus to attack and damage rolls increases to +2, and the extra piercing damage dealt by the weapon increases to 2d8. | angka: 2d8
- `item|au|Heliacal Wand of Celestial Prowess#2` In addition, you ignore Half Cover when making a spell attack roll. | angka: half
- `item|dmg|Stormgirdle (Exalted)#25` - Your Storm Avatar's lightning strike deals 5d6 lightning damage (instead of 3d6). | angka: 5d6,3d6
- `item|dmg|Couatl Herald's Mantle#4` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | angka: 3
- `item|dmg|Bliss#3` Your Speed drops by 15 ft, you have Disadvantage on D20 Tests, and creatures you force to save have Advantage. | angka: 1d20,15
- `item|tsgs|Stormstruck Staff#5` While glowing it sheds Bright Light in a 10 ft radius and Dim Light for 10 ft more, and the extra Lightning damage becomes 1d6. | angka: 1d6,10
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnera | angka: 0,12,20
- `item|toa|Ring of Winter#24` The temperature in that area drops 20 degrees per minute, to a minimum of -30 degrees Fahrenheit. | angka: 20,30
- `item|dmg|Blackrazor#5` Each time you hit an Undead with it, you take 1d10 Necrotic damage and the Undead regains 1d10 Hit Points. | angka: 1d10

### species (91)

- `species|Autognome|Built for Success#1` Add a d4 to one attack roll, ability check, or saving throw after you see the d20 roll. | angka: 1d4,1d20
- `species|Reborn|Everlasting#3` A Long Rest takes 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Strig|Talons#1` Your claws make Unarmed Strikes that deal 1d4 Piercing damage. | angka: 1d4
- `species|Tabaxi (2014)|Cat's Claws#1` Climb Speed of 20 ft. Your claws are unarmed strikes that deal 1d4 + Strength modifier Slashing damage. | angka: 1d4,20
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | angka: pb
- `species|Harengon (WBtW)|Rabbit Hop#2` Needs Speed above 0. | angka: 0
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Avia-Ra|Blessings of the Sun#3` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Minotaur (Amonkhet)|Natural Weapon#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Bludgeoning damage. | angka: 1d6
- `species|Reborn (VRGR)|Deathless Nature#4` You can finish a Long Rest in 4 hours if you spend them motionless and inactive but conscious. | angka: 4
- `species|Kaladesh Elf (Bishatar and Tirahar)|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Hill Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Aetherborn (Gifted)|Drain Life#2` If 7 days pass without dealing this damage, your Hit Point maximum drops by 1d6 each week until you use Drain Life and finish a Long Rest. | angka: 1d6,7
- `species|Dhampir|Vampiric Bite#2` The bite deals Piercing damage equal to 1d4 + your Constitution modifier in place of the normal damage. | angka: 1d4
- `species|Aven (Ibis-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Tortle (2014)|Claws#1` Your unarmed strikes with claws deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Kalamer Landwalker (Merfolk)|Blessing of the Sea#3` In landwalker form your Speed rises by 20 feet and your Swim Speed is 0. | angka: 0
- `species|Dragonborn|Draconic Flight#1` From level 5, Bonus Action once per Long Rest: fly Speed equal to walking Speed for 10 minutes. | angka: 10
- `species|Hedge|Natural Burrowers#1` Burrow Speed 15 feet. | angka: 15
- `species|Geppettin|Geppettin Construction#2` Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. | angka: pb
- `species|Autognome|Sentry's Rest#1` You finish a Long Rest after 6 hours inactive and motionless, staying conscious. | angka: 6
- `species|Astral Elf|Astral Trance#2` You finish a Long Rest in 4 hours of trance. | angka: 4
- `species|Luma|Wing Flap#1` As a Bonus Action you launch yourself upward a distance equal to half your Speed. | angka: half
- `species|Elf (Fey)|Elven Lineage (Fey)#5` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Eladrin (2014)|Fey Step#5` Spring: you can touch a willing creature within 5 ft and it teleports instead of you, to a space you choose within 30 ft. Summer: after Fey Step, creatures of your choice within 5 ft take Fire damage  | angka: 5
- `species|Mapach|Scroungecraft#3` Tools and anything that would break on first use, such as caltrops or arrows, are useless after one use. | angka: 1
- `species|Aarakocra (Monster)|Talons#2` Your unarmed strikes deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Eladrin Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Minotaur (2014)|Horns#1` Your unarmed strikes with horns deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Tabaxi (2014)|Feline Agility#1` When you move on your turn in combat, you can double your Speed until the end of that turn. | angka: double

### sub (635)

- `sub|Bard/College of Calligraphy|Quill and Ink#1` Arcane Flourish: when you cast a level 1-5 Bard spell that deals no damage, spend one Bardic Inspiration use to raise its effective level by 1. | angka: 1
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | angka: double,pb
- `sub|Ranger/Green Reaper|Toxic Tradecraft#2` If you lose it, 1 hour of harvesting toxic plants and venomous creatures, during a Short or Long Rest, makes a new one and destroys the old. | angka: 1
- `sub|Witch/Sky Magic|Corvid Familiar#3` It has a Fly Speed of 50 feet, unless it already has a faster one. | angka: 50
- `sub|Druid/Circle of Mutation|Endless Evolution#4` Tremorsense 30 ft. 2 more points give a Burrow Speed equal to your Speed. | angka: 30,2
- `sub|Cleric/Arcana Domain (2014)|Arcane Mastery#1` You choose four Wizard spells, one each of levels 6, 7, 8, and 9. | angka: 4
- `sub|Wizard/Order of Scribes|Manifest Mind#2` It sheds Dim Light in 10 feet, sees and hears, has Darkvision 60 feet, and shares what it senses. | angka: 10,60
- `sub|Barbarian/Path of the Dreadnought|Ultraviolence#7` Until the start of your next turn, your Rage Damage bonus is +8. | angka: 8
- `sub|Cleric/Community Domain|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 psychic damage, 2d8 from level 14. | angka: 1d8,2d8
- `sub|Artificer/Alchemist|Experimental Elixir#15` 4 Boldness: add 1d4 to attack rolls and saves for 1 minute, then 10 minutes at level 9 and 1 hour at level 15. | angka: 1d4,1,10,4
- `sub|Cleric/Hunger Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | angka: 2d8
- `sub|Sorcerer/Shadow Magic|Umbral Form#2` You have Resistance to all damage except Force and Radiant, and you move through creatures and objects as Difficult Terrain, taking 5 Force damage if you end your turn inside an object. | angka: 5
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#14` Flight (Celestial, Dragon, Elemental): 10 minutes, Fly Speed equal to your Speed, not in Heavy armor. | angka: 10
- `sub|Druid/Circle of Entropy|Catastrophic Power#5` Fail: 1d6 of that type per slot level and Vulnerability to that type for 1 minute (save again at each turn end to end it). | angka: 1d6
- `sub|Sorcerer/Serophage|Blood Fuel#1` Instead of moving, you can deal 1d4 Slashing damage to yourself and regain Sorcery Points equal to that damage. | angka: 1d4
- `sub|Artificer/Forceforger|Forceful Shove#4` The damage is 2d6 from Artificer level 15. | angka: 2d6
- `sub|Monk/Way of Shadow|Shadow Arts#1` As an action you can spend 2 ki points to cast Darkness, Darkvision, Pass without Trace, or Silence, with no Material components. | angka: 2
- `sub|Cleric/Knowledge Domain (PSA)|Channel Divinity: Knowledge of the Ages#2` You have proficiency with it for 10 minutes. | angka: 10
- `sub|Wizard/School of Transmutation|Transmuter's Stone#6` +10 feet while unencumbered. | angka: 10
- `sub|Monster Hunter/Trapper Guild|Trapper Gadgets#13` One use. | angka: 1
- `sub|Wizard/Mystic Strategist|Supreme Stratagems#3` Sanguine Spell: when a creature fails a save against your spell, Bonus Action and 2 Battle Dice make it vulnerable. | angka: 2
- `sub|Necromancer/Crone|Baba Yaga [Lichdom]#7` While you hold it, you have a Fly Speed of 60 feet unless you wear Medium or Heavy armor. | angka: 60
- `sub|Wizard/Transmuter|Transmuter's Stone#6` Darkvision with a range of 60 feet, or +60 feet to an existing Darkvision. | angka: 60
- `sub|Warmage/House of Pawns|Pawn Wall#1` When a Warmage cantrip deals damage, you and up to two Allies within 5 feet of you have Resistance to that damage type until the end of your next turn. | angka: 5,2
- `sub|Cleric/Dragon Domain|Divine Strike#2` The extra damage becomes 2d8 at level 14. | angka: 2d8
- `sub|Alchemist/Ionizer|Charged Core#3` When a charged creature deals damage, it can spend the charge to add 1d10 Radiant damage to one target. | angka: 1d10
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | angka: 1d20,20
- `sub|Druid/Circle of Xenobiology|Adaptive Resilience#2` The bonus lasts 10 minutes or until you use this feature for a different save. | angka: 10
- `sub|Paladin/Oath of the Giving Grave|Undying Sentinel#2` If you are killed, you rise from the grave within 1d4 days as a death knight. | angka: 1d4
- `sub|Warlock/The Sibyl|Touched by the Sibyl#4` You are also proficient in Performance and double your proficiency bonus on Performance checks. | angka: double,pb

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `item|dmg|Crown of Deep Winter#6` Usable once per Short or Long Rest. -> covered
- class `item|dmg|Crown of Deep Winter#6` Usable once per Short or Long Rest. -> info:REST:NONUM
- record `item|ggr|Boros Charm#2` You can instead cast Guiding Bolt, and if it hits you regain Hit Points equal to the damage it deals. -> info:REST:NONUM
- class `item|ggr|Boros Charm#2` You can instead cast Guiding Bolt, and if it hits you regain Hit Points equal to the damage it deals. -> info:REST:NONUM
- record `sub|Investigator/Time Operative|Rewind#4` A Long Rest returns all uses. -> covered
- class `sub|Investigator/Time Operative|Rewind#4` A Long Rest returns all uses. -> info:REST:NONUM
- record `item|dmg|Starmetal Shield#9` A hit deals 2d8 Slashing damage. -> info:ACTIVE:OTHERS
- class `item|dmg|Starmetal Shield#9` A hit deals 2d8 Slashing damage. -> info:ACTIVE:OTHERS
- record `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#2` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
- class `species|Jhorgun'taal (Half-Orc)|Relentless Endurance#2` After you use this, finish a Long Rest to do so again. -> info:REST:NONUM
- record `sub|Ranger/Horizon Walker|Ethereal Step#2` You regain use after a Short or Long Rest. -> covered
- class `sub|Ranger/Horizon Walker|Ethereal Step#2` You regain use after a Short or Long Rest. -> info:REST:NONUM
- record `item|dmg|Talons Card#2` If the item isn't an artifact, its magical properties are suppressed for 1 minute. -> info:NUMONLY:GEOMETRY
- class `item|dmg|Talons Card#2` If the item isn't an artifact, its magical properties are suppressed for 1 minute. -> info:NUMONLY:GEOMETRY
- record `item|dmg|Spell Gem (Jade)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- class `item|dmg|Spell Gem (Jade)#14` Casting the spell must require either 1 action or 1 minute or longer, and the spell's level must be no higher than the g -> info:NUMONLY:GEOMETRY
- record `sub|Bard/College of Requiems|Dual Death#2` Long Rest to use again, or spend one Bardic Inspiration die (no action). -> covered
- class `sub|Bard/College of Requiems|Dual Death#2` Long Rest to use again, or spend one Bardic Inspiration die (no action). -> info:REST:NONUM
- record `item|dmg|Danoth's Visor (Dormant)#3` While wearing the goggles in their dormant state, you can see normally in darkness, both magical and nonmagical, to a di -> info:NUMONLY:GEOMETRY
- class `item|dmg|Danoth's Visor (Dormant)#3` While wearing the goggles in their dormant state, you can see normally in darkness, both magical and nonmagical, to a di -> info:NUMONLY:GEOMETRY
- record `item|crcotn|Fragment of Rancor#2` After using this, you must finish a short or long rest before using it again. -> info:REST:NONUM
- class `item|crcotn|Fragment of Rancor#2` After using this, you must finish a short or long rest before using it again. -> info:REST:NONUM
- record `item|dmg|Luma Feather Robe#5` You can do this up to three times a day. -> info:NUMONLY:TEXT
- class `item|dmg|Luma Feather Robe#5` You can do this up to three times a day. -> info:NUMONLY:TEXT
- record `sub|Wizard/School of Transmutation|Shapechanger#2` You can cast it without a slot, but only on yourself, and only into a beast of Challenge Rating 1 or lower. -> covered
- record `item|dmg|Jewel of Three Prayers (Dormant)#2` In ancient times, Alyxian the Apotheon bore this amulet as a symbol of his covenant with three Prime Deities: Sehanine t -> info:NUMONLY:TABLE
- class `item|dmg|Jewel of Three Prayers (Dormant)#2` In ancient times, Alyxian the Apotheon bore this amulet as a symbol of his covenant with three Prime Deities: Sehanine t -> info:NUMONLY:TABLE
- record `item|dmg|Dark Gift of Delban, the Star of Ice and Hate#3` After seven uses the gift vanishes. -> info:NUMONLY:TABLE
- class `item|dmg|Dark Gift of Delban, the Star of Ice and Hate#3` After seven uses the gift vanishes. -> info:NUMONLY:TABLE
- record `item|dmg|Circlet of Barbed Vision (Dormant)#4` Your Charisma score is lowered by 2. -> info:NUMONLY:TABLE
