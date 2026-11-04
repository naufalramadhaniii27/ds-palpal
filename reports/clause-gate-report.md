# Laporan clause gate (mode laporan, 2026-11-05)

Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.

## Ringkasan

| Ukuran | Jumlah |
|---|---|
| Kalimat di seluruh teks | 73237 |
| Kalimat mekanik (kelas kata kunci atau angka) | 36775 (50.2%) |
| Covered (atom engine per kelas dan semua angka terjelaskan) | 6909 |
| Info (tag terdokumentasi) | 14621 (SPELL_TEXT 6470, FORM:ACTIVATE 2576, FORM:ROLL 1885, FXO_NULL 1380, ACTIVATE 1309, FORM:TABLE 914, BY_DESIGN 87) |
| Allow (tests/clause_gate_allow.json) | 0 |
| Uncovered | 15245 |
| Uncovered dengan angka | 10998 |
| Uncovered dengan kelas kata kunci mekanik | 8964 |
| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | 6281 |
| Angka yang tidak dijelaskan record mana pun | 10727 kalimat |
| Kelas tanpa atom (record tidak ada untuk kelas itu) | 8199 kalimat |
| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | 688 |
| Waktu | muat data 24 s, analisis 9 s |

Uji mutasi pada data nyata (seed 7): 300 kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): 275 ditangkap (91.7%). Hapus semua atom kelas yang dibutuhkan: 298 ditangkap (99.3%). Selftest sintetis: lulus.

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
| item | 2851 |
| GX | 1438 |
| wxs | 660 |
| LU_X | 536 |
| ITEM_SPELLS | 343 |
| AUTO | 315 |
| species | 298 |
| SPELL_FX | 241 |
| feat | 178 |
| cls | 124 |
| SAVE_NOTES | 67 |
| FXO | 48 |
| SPELLS | 37 |
| FDMG | 15 |
| calcNote | 15 |
| SUB_GRANT | 9 |
| SP_AUTO | 6 |
| CLS_AUTO | 4 |
| sub | 1 |

Berkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: fx-L5.js 207, fx-L4.js 165, fx-L12.js 130, fx-L3.js 129, fx-L2.js 127, fx-L10.js 114, fx-L1.js 109, fx-L6.js 86, fx-L9.js 83, fx-L11.js 82, fx-L8.js 64, fx-L7.js 50.

## Hitungan per kelas (kalimat bisa masuk beberapa kelas)

| Kelas | Mekanik | Uncovered | Uncovered % |
|---|---|---|---|
| NUM | 7110 | 3417 | 48.1% |
| RESOURCE | 6659 | 2312 | 34.7% |
| NUM-DIST | 4463 | 1679 | 37.6% |
| NUM-DUR | 2748 | 1269 | 46.2% |
| SPELL | 2882 | 1243 | 43.1% |
| DMG | 3912 | 1093 | 27.9% |
| NUM-DICE | 1194 | 728 | 61.0% |
| ADV | 1516 | 705 | 46.5% |
| SPEED | 1137 | 668 | 58.8% |
| RES | 1123 | 645 | 57.4% |
| CHOICE | 1344 | 621 | 46.2% |
| PROF | 883 | 574 | 65.0% |
| IMM | 852 | 510 | 59.9% |
| SLOT | 1121 | 485 | 43.3% |
| DIS | 932 | 478 | 51.3% |
| DC | 2624 | 398 | 15.2% |
| ATK | 860 | 326 | 37.9% |
| ABIL | 357 | 270 | 75.6% |
| SENSE | 515 | 252 | 48.9% |
| AC | 593 | 237 | 40.0% |
| SAVE | 272 | 167 | 61.4% |
| HP | 143 | 86 | 60.1% |
| INIT | 111 | 57 | 51.4% |
| NUM-PCT | 67 | 34 | 50.7% |

## Per jenis sumber

| Jenis | Mekanik | Covered | Info | Allow | Uncovered |
|---|---|---|---|---|---|
| class | 1027 | 226 | 198 | 0 | 603 |
| feat | 2101 | 412 | 310 | 0 | 1379 |
| item | 18386 | 3885 | 5765 | 0 | 8736 |
| species | 1037 | 496 | 131 | 0 | 410 |
| spell | 6748 | 278 | 6470 | 0 | 0 |
| sub | 7476 | 1612 | 1747 | 0 | 4117 |

## Per buku

| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |
|---|---|---|---|---|---|
| dmg | 10148 | 2139 | 3100 | 4909 | 48.4% |
| tvss | 2815 | 603 | 663 | 1549 | 55.0% |
| core | 1502 | 318 | 309 | 875 | 58.3% |
| tsdm | 1222 | 279 | 236 | 707 | 57.9% |
| tsgs | 1483 | 362 | 441 | 680 | 45.9% |
| tghp | 1117 | 346 | 221 | 550 | 49.2% |
| tkdm | 919 | 175 | 196 | 548 | 59.6% |
| tce | 735 | 110 | 249 | 376 | 51.2% |
| au | 536 | 94 | 124 | 318 | 59.3% |
| phb14 | 516 | 117 | 92 | 307 | 59.5% |
| egw | 566 | 131 | 134 | 301 | 53.2% |
| dmg14 | 540 | 138 | 126 | 276 | 51.1% |
| tee24 | 464 | 129 | 101 | 234 | 50.4% |
| xge | 375 | 82 | 82 | 211 | 56.3% |
| thhw | 395 | 69 | 123 | 203 | 51.4% |
| tdcsr | 416 | 121 | 111 | 184 | 44.2% |
| hof | 253 | 27 | 48 | 178 | 70.4% |
| mot | 292 | 93 | 43 | 156 | 53.4% |
| tssm | 275 | 66 | 61 | 148 | 53.8% |
| misc14 | 327 | 52 | 128 | 147 | 45.0% |
| rhw | 232 | 43 | 53 | 136 | 58.6% |
| tghg | 288 | 69 | 93 | 126 | 43.8% |
| tsgeh | 184 | 55 | 29 | 100 | 54.3% |
| coa | 158 | 36 | 23 | 99 | 62.7% |
| idrotf | 134 | 22 | 24 | 88 | 65.7% |
| bmt | 487 | 72 | 328 | 87 | 17.9% |
| bgg | 210 | 56 | 74 | 80 | 38.1% |
| EFotA | 137 | 33 | 24 | 80 | 58.4% |
| ggr | 186 | 31 | 85 | 70 | 37.6% |
| pota | 110 | 25 | 19 | 66 | 60.0% |
| wbtw | 92 | 17 | 11 | 64 | 69.6% |
| ai | 164 | 20 | 82 | 62 | 37.8% |
| toa | 116 | 29 | 26 | 61 | 52.6% |
| skt | 118 | 22 | 38 | 58 | 49.2% |
| ftd | 159 | 35 | 68 | 56 | 35.2% |
| oota | 87 | 18 | 13 | 56 | 64.4% |
| wdh | 95 | 18 | 23 | 54 | 56.8% |
| erlw | 127 | 54 | 21 | 52 | 40.9% |
| wdmm | 79 | 12 | 16 | 51 | 64.6% |
| bgdia | 114 | 25 | 39 | 50 | 43.9% |
| vrgr | 86 | 22 | 15 | 49 | 57.0% |
| llk | 99 | 9 | 41 | 49 | 49.5% |
| dsotdq | 83 | 16 | 20 | 47 | 56.6% |
| frafi | 82 | 22 | 16 | 44 | 53.7% |
| bdd | 62 | 9 | 11 | 42 | 67.7% |
| crcotn | 96 | 33 | 21 | 42 | 43.8% |
| psa | 67 | 16 | 10 | 41 | 61.2% |
| abh | 54 | 12 | 2 | 40 | 74.1% |
| cm | 60 | 12 | 8 | 40 | 66.7% |
| tshl | 69 | 20 | 10 | 39 | 56.5% |
| cos | 66 | 18 | 11 | 37 | 56.1% |
| tsae | 65 | 21 | 8 | 36 | 55.4% |
| scag | 67 | 18 | 13 | 36 | 53.7% |
| pabtso | 69 | 19 | 15 | 35 | 50.7% |
| tsdd | 69 | 22 | 13 | 34 | 49.3% |
| tftyp | 71 | 22 | 15 | 34 | 47.9% |
| scc | 57 | 11 | 14 | 32 | 56.1% |
| vgm | 64 | 22 | 10 | 32 | 50.0% |
| psk | 38 | 14 | 0 | 24 | 63.2% |
| mtf | 64 | 35 | 6 | 23 | 35.9% |
| lfl | 34 | 13 | 1 | 20 | 58.8% |
| aag | 40 | 16 | 5 | 19 | 47.5% |
| sato | 38 | 9 | 11 | 18 | 47.4% |
| efa | 28 | 7 | 5 | 16 | 57.1% |
| nf | 25 | 7 | 7 | 11 | 44.0% |
| psz | 38 | 26 | 2 | 10 | 26.3% |
| tdcg | 12 | 2 | 1 | 9 | 75.0% |
| imr | 186 | 2 | 176 | 8 | 4.3% |
| psx | 18 | 7 | 4 | 7 | 38.9% |
| gos | 12 | 5 | 1 | 6 | 50.0% |
| eepc | 9 | 5 | 0 | 4 | 44.4% |
| ttp | 5 | 2 | 0 | 3 | 60.0% |
| oga | 5 | 1 | 2 | 2 | 40.0% |
| psd | 5 | 3 | 0 | 2 | 40.0% |
| lr | 5 | 4 | 0 | 1 | 20.0% |
| psi | 6 | 6 | 0 | 0 | 0.0% |
| spells | 6748 | 278 | 6470 | 0 | 0.0% |

## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)

| Kelas utama | Uncovered | Dengan angka |
|---|---|---|
| NUM | 3417 | 3417 |
| RESOURCE | 1947 | 1064 |
| NUM-DIST | 1412 | 1412 |
| NUM-DUR | 940 | 940 |
| SPELL | 833 | 130 |
| DMG | 821 | 754 |
| ADV | 695 | 215 |
| SPEED | 586 | 449 |
| RES | 569 | 213 |
| PROF | 538 | 150 |
| NUM-DICE | 485 | 485 |
| SLOT | 468 | 154 |
| DIS | 420 | 138 |
| IMM | 333 | 156 |
| CHOICE | 319 | 113 |
| ABIL | 258 | 255 |
| AC | 237 | 194 |
| SENSE | 235 | 214 |
| ATK | 222 | 170 |
| DC | 219 | 143 |
| SAVE | 160 | 130 |
| HP | 86 | 62 |
| NUM-PCT | 27 | 27 |
| INIT | 18 | 13 |

## Contoh 40 kalimat per kelas teratas (seed tetap)


### NUM (3417 uncovered)

- `item|bmt|Blessing of Unearned Riches#1` The next time you search through or take something from your belongings, you find an unmarked pouch holding five gemstones worth 1,000 gp each. | number 5 no record explains
- `item|cm|Alchemy Jug (Blue)#15` Water, salt: 12 gallons. | number 12 no record explains
- `item|coa|Vial of Greed#11` No more than 2 duplicate potions can be stored at a time. | number 2 no record explains
- `item|crcotn|Jewel of Three Prayers (Awakened)#16` Three delicate spires unfurl from the jewel's center, like the buds of flowers opening in the spring. | number 3 no record explains
- `item|dmg14|Sword of Answering (Last Quip)#3` Each of the nine swords has its own name and alignment, and each bears a different gem in its pommel. | number 9 no record explains
- `item|dmg|Alchemy Jug (Orange)#16` Wine: 1 gallon. | number 1 no record explains
- `item|dmg|Amulet of the Planes#5` On 01-60, you land somewhere random on the plane you named. | number 01,60 no record explains
- `item|dmg|Erebos's Votary#1` Requires Piety 10 or higher with Erebos. | number 10 no record explains
- `item|dmg|Hammer of Thunderbolts#13` Might of Giants: the Strength score that your Belt of Giant Strength or Gauntlets of Ogre Power gives you rises by 4, up to a maximum of 30. | number 4 no record explains
- `item|dmg|Iggwilv's Cauldron#25` Any creature that imbibes the elixir gains 10 temporary hit points. | number 10 no record explains
- `item|dmg|Iggwilv's Cauldron#5` In its second form, the cauldron is made of iron and embossed on the outside with images of bats, toads, cats, lizards, and snakes—eight of each animal. | number 8 no record explains
- `item|dmg|Ioun Stone (awareness)#5` Up to three Ioun Stones can circle your head at once. | number 3 no record explains
- `item|dmg|Iron Ball#1` This ball is used to play a game of 17. | number 17 no record explains
- `item|dmg|Manual of Golems#16` On a 19-20, it makes a Stone Golem, which takes 90 days and costs 80,000 GP. | number 90,20 no record explains
- `item|dmg|Professor Orb#1` Each professor orb takes the form of a smooth, solid, 5-pound sphere of smoky gray quartz about the size of a grapefruit. | number 5 no record explains
- `item|dmg|Sling Bullet, +3#5` A set of ten such sling bullets is worth as much as one Very Rare potion. | number 10 no record explains
- `item|dmg|Staff of the Magpie#2` Holding it gives +1 to Wisdom (Perception) checks to find treasure or a specific item. | number 1 no record explains
- `item|dmg|Trident of the Hydra#5` Afterward it regrows its prongs from one spear and the other two dissolve. | number 2 no record explains
- `item|dmg|Will of the Talon (Dormant)#3` Will of the Talon is a sentient lawful evil weapon with an Intelligence of 14, a Wisdom of 15, and a Charisma of 19. | number 14,15,19 no record explains
- `item|llk|Heward's Hireling Armor#5` Each pocket can hold up to 20 pounds of material, not exceeding a volume of 2 cubic feet. | number 2 no record explains
- `item|thhw|Staff of Climbing Ivy#14` If the vines reach 0 hit points, the staff is destroyed. | number 0 no record explains
- `item|toa|Ring of Winter#34` It melts into a pool of normal water after 24 hours or when it drops to 0 hit points. | number 24,0 no record explains
- `item|tsdm|Psionic Piercing#16` Prescience (2). | number 2 no record explains
- `item|tsgs|Frost Giant Fork#1` A giant's table trident with the Thrown property (20/60). | number 20,60 no record explains
- `item|tsgs|Give and Take#1` Two scimitars joined by a chain, Give (mithral) and Take (obsidian). | number 2 no record explains
- `item|tsgs|Spire Seed#6` Inside are ten floors you lay out, hidden from Divination and teleportation. | number 10 no record explains
- `item|tvss|Aura Lenses (Incomplete)#1` As the complete set, but it holds only 1d8 of the eight lenses. | number 1d8,8 no record explains
- `sub|Bard/College of Valor|Extra Attack#1` Taking the Attack action on your turn lets you attack two times instead of once. | number 2 no record explains
- `sub|Cleric/Knowledge Domain (PSA)|Blessings of Knowledge#3` Your Proficiency Bonus is doubled on checks that use either of those skills. | number pb no record explains
- `sub|Druid/Circle of Wildfire|Summon Wildfire Spirit#4` It lasts 1 hour, until it drops to 0 Hit Points, until you summon it again, or until you die. | number 1,0 no record explains
- `sub|Martyr/Burden of Discord|Pandemonium#2` Whenever you roll on the Havoc! table, you can roll twice and use either result. | number double no record explains
- `sub|Monster Hunter/Occultist Guild|Spellcasting#7` You have two 1st level slots at level 3, three at level 4, then 4/2 (1st/2nd) at level 7, 4/3 at level 10, 4/3/2 at level 13, 4/3/3 at level 16, and 4/3/3/1 at level 19. | number 4,2,1 no record explains
- `sub|Ranger/Drakewarden|Drake Companion#7` It remains until it reaches 0 Hit Points, you summon it again, or you die. | number 0 no record explains
- `sub|Vagabond/Dragon Banner|Bloody Spectacle#1` When you reduce an enemy to 0 Hit Points or score a Critical Hit against one, you can terrify nearby foes. | number 0 no record explains
- `sub|Warlock/Astral Griffon Patron|Extradimensional Acuity#2` It holds up to 50 lb of nonliving material, with a volume of at most 1 cubic foot. | number 1 no record explains
- `sub|Warmage/House of Dice|Chaos Roll#17` 9. | number 9 no record explains
- `sub|Warmage/House of Dice|Chaos Roll#19` 10. | number 10 no record explains
- `sub|Warmage/House of Dice|Chaos Roll#22` 11. | number 11 no record explains
- `sub|Wizard/Materializer|Minor Creation#5` It holds up to 10 times its weight, so it can serve as a bridge, and it gives cover to creatures behind it. | number 10 no record explains
- `sub|Wizard/Universalist|Universal Savant#1` Add two Wizard spells of level 2 or lower to your spellbook free. | number 2 no record explains

### RESOURCE (1947 uncovered)

- `class|Monk|Heightened Focus#2` When you spend 1 Focus Point to use Flurry of Blows, it lets you make three Unarmed Strikes rather than two. | no record for RESOURCE; number 1,3,2 unexplained
- `class|Monk|Perfect Focus#1` If you hold 3 or fewer Focus Points when you roll Initiative without using Uncanny Metabolism, your expended Focus Points are restored until you have 4. | no record for RESOURCE; number 3,4 unexplained
- `class|Vagabond|Last Stand#1` When damage drops you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead and regain Hit Points equal to twice your Vagabond level. | number 0,double no record explains
- `feat|Boon of Bloodshed|Boon of Bloodshed#6` While you are Bloodied, once per turn when you make an attack roll, you can deal extra damage to the target equal to your Proficiency Bonus. | no record for DMG,RESOURCE; number pb unexplained
- `item|ai|Failed Experiment Wand#6` If you expend the wand's last charge, roll a d20. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Arcane Battery#3` If that magic item normally regains expended charges daily, it immediately regains 1d4 + 1 expended charges, and the battery loses its magic. | number 1d4 no record explains
- `item|dmg|Band of Fruitfulness#5` Each charge spent means 10 minutes of feasting, and everyone who feasts the whole time gains the benefits by charge count. | no record for RESOURCE; number 10 unexplained
- `item|dmg|Charm of the Ghoul#3` After 3 uses, the Charm goes away. | no record for RESOURCE; number 3 unexplained
- `item|dmg|Crook of Rao#29` The gate then, once per round on initiative count 20, audibly speaks a fiend's name in Iggwilv's voice, doing so until the gate calls on every fiend ever banished by the Crook of Rao. | no record for RESOURCE; number 20 unexplained
- `item|dmg|Helm of Devil Command#10` The helm regains all its charges 24 hours after its last charge is expended. | no record for RESOURCE; number 24 unexplained
- `item|dmg|Jewel of Three Prayers (Exalted)#12` - The jewel has 3 charges and regains all its expended charges daily at dawn. | no record for RESOURCE; number 3 unexplained
- `item|dmg|Luba's Tarokka of Souls#26` The deck can be used in this way twice, and you regain all expended uses at the next dawn. | number double no record explains
- `item|dmg|Observatory Charm~2#1` After a Long Rest in your Observatory, you gain a magical Charm that lasts 7 days or until you use it. | number 7 no record explains
- `item|dmg|Potion of Watchful Rest#1` When you drink this potion, you gain the following benefits for the next 8 hours: magic can't put you to sleep, and you can remain awake during a long rest and still gain its benefits. | no record for RESOURCE; number 8 unexplained
- `item|dmg|Quagmire Maul#4` If you spend the last charge, roll 1d20, and on a 1 the maul turns to muck and is destroyed. | no record for RESOURCE; number 1d20 unexplained
- `item|dmg|Scribing Channeling Wand#2` The wand has 7 charges. | number 7 no record explains
- `item|dmg|Spirit Board#5` Each day at dawn, it gets back 1 spent charge. | no record for RESOURCE; number 1 unexplained
- `item|dmg|Staff of Fate#9` On a roll of 10 or higher, the staff regains 1d6 of its expended charges. | no record for RESOURCE; number 1d6 unexplained
- `item|dmg|Stonespeaker Crystal#2` The crystal has 10 charges. | no record for RESOURCE; number 10 unexplained
- `item|frafi|Calimemnon Crystal#25` The target regains 2d6 + 2 Hit Points. | no record for RESOURCE; number 2d6,2 unexplained
- `item|misc14|Heretic#6` Once per turn when you hit a creature with this weapon, you can expend 1 of its charges to attempt to render the target powerless. | number 1 no record explains
- `item|misc14|Nightbringer#15` The weapon regains 1d6 expended charges daily at dawn. | no record for RESOURCE; number 1d6 unexplained
- `item|mot|Khrusor, Spear of Heliod#27` The spear has 10 charges. | no record for RESOURCE; number 10 unexplained
- `item|oota|Stonespeaker Crystal#2` The crystal has 10 charges. | no record for RESOURCE; number 10 unexplained
- `item|tdcsr|Spire of Conflux (Awakened)#4` 8 charges, regains 1d4 + 2 at dawn. | number 1d4,8,2 no record explains
- `item|tee24|Prospector's Wand#9` If you spend the last charge, roll 1d20 and on a 1 the wand turns to ash. | number 1d20 no record explains
- `item|tee24|Storm Channeling Wand#6` If you spend the last charge, roll 1d20 and on a 1 the wand turns to ash. | no record for RESOURCE; number 1d20 unexplained
- `item|thhw|Fangs of Guile#7` If the necklace has no charges at dusk, roll 1d6. | no record for RESOURCE; number 1d6 unexplained
- `item|tsgs|Healing Ammunition#3` If the target is a creature other than you, it regains 2d4 Hit Points plus your Dexterity and Wisdom modifiers (minimum +1). | no record for RESOURCE; number 2d4 unexplained
- `item|tsgs|Signet Rings of the Fey Court#4` Each ring has 2 charges and regains all on a Long Rest. | number 2 no record explains
- `item|tsgs|Staff of the Mustang#5` If you spend the last charge, roll 1d20. | no record for RESOURCE; number 1d20 unexplained
- `item|xge|Wand of Smiles#2` While holding it, you can use an action to expend 1 of its charges and target a humanoid you can see within 30 feet of you. | no record for RESOURCE; number 30,1 unexplained
- `species|Astral Elf|Astral Trance#2` You finish a Long Rest in 4 hours of trance. | no record for RESOURCE; number 4 unexplained
- `sub|Cleric/Blood Domain|Divine Strike#1` Once per turn, a weapon hit deals an extra 1d8 Necrotic damage. | no record for DMG,RESOURCE; number 1d8 unexplained
- `sub|Fighter/Couatl Herald|One of the People#4` It stays Unconscious until it regains any Hit Points or someone uses an action to give first aid with a successful DC 10 Wisdom (Medicine) check. | no record for DC,RESOURCE; number 10 unexplained
- `sub|Healer/Vow of the Protector|Warding Essence#1` After a Short Rest or Long Rest, you can pick two damage types, two conditions, or one of each from the lists below. | no record for CHOICE,RESOURCE; number 2 unexplained
- `sub|Jaeger/Absolute Chapter|Encircling Strike#1` Once per turn, you deal extra damage equal to one roll of your Momentum die the first time you hit a target with a melee weapon attack, and you gain 1 Momentum die. | no record for DMG,RESOURCE; number 1 unexplained
- `sub|Ranger/Bounty Hunter|Takedown Tactics#1` Once per turn when you damage a creature marked by your Hunter's Mark, you can deal an extra 2d6 Force damage and pick one effect. | no record for CHOICE,DMG
- `sub|Ranger/Fey Wanderer (2014)|Dreadful Strikes#1` When you hit a creature with a weapon, you can deal an extra 1d4 Psychic damage, once per turn. | no record for DMG,RESOURCE; number 1d4 unexplained
- `sub|Warlock/Vestige Patron|Vestige Companion#16` After each Long Rest you can summon the vestige in a new form within 5 feet of you. | no record for RESOURCE; number 5 unexplained

### NUM-DIST (1412 uncovered)

- `item|bgdia|Blade of Avernus#19` Creatures transported by this spell appear in an unoccupied space within 30 feet of the current ruler of Avernus, or a sanctuary you designate if you rule Avernus. | number 30 no record explains
- `item|bgdia|Soul Coin#1` Soul coins are about 5 inches across and about an inch thick, minted from infernal iron. | number 5 no record explains
- `item|bmt|House of Cards#3` The shelter can be shaped however you desire, but it must fit in a 40-foot cube centered on a point within 30 feet of you. | number 40,30 no record explains
- `item|dmg14|Horn of Valhalla, Brass#2` In response, warrior spirits from the plane of Ysgard appear within 60 feet of you. | number 60 no record explains
- `item|dmg|Dawnbringer#9` While the blade persists, you can use an action to expand or reduce its radius of bright and dim light by 5 feet each, to a maximum of 30 feet each or a minimum of 10 feet each. | number 5 no record explains
- `item|dmg|Deck of Holding (Password Protected)#6` Every creature within 10 ft is pulled through to a random place on the Astral Plane, and the gate then closes for good. | number 10 no record explains
- `item|dmg|Elven Thrower#2` It has the thrown property with a normal range of 20 feet and a long range of 60 feet. | number 20,60 no record explains
- `item|dmg|Everbright Lantern#2` An everbright lantern sheds light in a 120-foot cone; the closest 60 feet is bright light, and the farthest 60 feet is dim light. | number 120,60 no record explains
- `item|dmg|Festerwood's Light#4` It sheds Bright Light 10 ft and Dim Light 10 ft more. | number 10 no record explains
- `item|dmg|Flashbang#1` Utilize action: throw it up to 30 ft. A moment after impact it bursts in a 10-ft-radius Sphere. | number 30,10 no record explains
- `item|dmg|Funeral Marchers#3` While Unconscious and standing this way, you can walk up to 10 ft on your turn after making a Death Saving Throw. | number 10 no record explains
- `item|dmg|Ioun Stone, Intellect#3` When you use an action to toss one of these stones into the air, the stone orbits your head at a distance of 1d3 feet and confers a benefit to you. | number 3 no record explains
- `item|dmg|Mizzium Mortar#1` This short tube, about 2 feet long and 6 inches in diameter, is made from mizzium, a magically enhanced metal alloy forged by the Izzet League. | number 2,6 no record explains
- `item|dmg|Ornithopter of Flying#5` The ornithopter is 8 feet long, has a 14-foot wingspan, and weighs 25 pounds. | number 8,14 no record explains
- `item|dmg|Quarterstaff of the Acrobat#7` Acrobatic Assist (Quarterstaff or 10-Foot Pole Forms Only). | number 10 no record explains
- `item|dmg|Sphere of Annihilation#1` This black sphere, 2 feet in diameter, is a hole in the multiverse. | number 2 no record explains
- `item|dmg|Staff of Ruling#13` On your turn, you can mentally command the snake if it is within 60 feet of you and you don't have the incapacitated condition. | number 60 no record explains
- `item|dmg|Wand of Orcus#24` They rise from the ground by magic or otherwise take shape in unoccupied spaces within 300 feet of you. | number 300 no record explains
- `item|dmg|Ythryn Mythallar#6` The largest mythallars are 150 feet in diameter. | number 150 no record explains
- `item|egw|Will of the Talon (Exalted)#28` Poison: Area 15 ft. cone, Saving Throw Constitution. | number 15 no record explains
- `item|misc14|Gnomengarde Grenade#7` All creatures within 60 feet of the grenade when it explodes suffer the following effects: | number 60 no record explains
- `item|pota|Balloon Pack#5` As the balloon deflates, you descend gently toward the ground for up to 60 feet. | number 60 no record explains
- `item|tghg|Gold Boar Ring#2` It sheds Bright Light in a 20-ft radius and Dim Light for 20 ft beyond. | number 20 no record explains
- `item|tsgs|Acidlight Ammunition#1` Any ammunition coated in an alchemical mix that ignites on impact, shedding Bright Light in the target's space and Dim Light in a 5-ft Emanation for 1 minute. | number 5,1 no record explains
- `item|tsgs|Wisplight Lantern#8` If any Undead within 60 ft is not behind Cover, the light flashes red. | number 60 no record explains
- `item|wbtw|Iggwilv's Cauldron#40` The radius of the effect is 100 feet per gallon of blood used. | number 100 no record explains
- `sub|Barbarian/Path of the Giant|Demiurgic Colossus#1` When you Rage, your reach grows by 10 feet and your size can become Large or Huge, your choice. | number 10 no record explains
- `sub|Barbarian/Path of the Storm Herald|Storm Aura#1` While you Rage you emanate a 10-foot aura, blocked by Cover. | number 10 no record explains
- `sub|Bard/College of the Moon|Blessing of Moonlight#2` When you cast it, you can make yourself glow faintly for as long as the spell lasts, shedding Dim Light out to 5 feet. | number 5 no record explains
- `sub|Craftsman/Armigers' Guild|Shining Steel#1` When you roll Initiative, you can challenge any number of creatures within 30 feet that can see you. | number 30 no record explains
- `sub|Craftsman/Calibarons' Guild|Exotic Ammunition#9` When it hits a Large or smaller creature, fragments continue in a Line 15 feet long and 5 feet wide. | number 15,5 no record explains
- `sub|Fighter/Echo Knight|Manifest Echo#7` If it ends your turn more than 30 feet from you, it is destroyed. | number 30 no record explains
- `sub|Fighter/Prescient Knight|Constant Vigilance#3` Allies within 15 ft are warned too, so they can take Reactions after your turn. | number 15 no record explains
- `sub|Gadgeteer/Quantum Mechanic|Entanglement#5` The link ends early if you have the Incapacitated condition, if the creature dies, if it is ever more than 30 feet from you, or if you dismiss it (no action). | number 30 no record explains
- `sub|Ranger/Swarmkeeper|Gathered Swarm#5` Or the swarm moves you up to 5 feet horizontally. | number 5 no record explains
- `sub|Sorcerer/Boreal Bloodline|Winter'S Form#13` A creature within 5 ft that hits you with a melee weapon attack or touch attack takes Cold damage equal to your Charisma modifier. | number 5 no record explains
- `sub|Sorcerer/Wretched Bloodline Sorcery|Vengeful Summons#5` It appears in a free space you see within 60 ft, is your ally, shares your Initiative and acts right after you, and obeys spoken commands with no action. | number 60 no record explains
- `sub|Vagabond/Pugilist|Intimidating Blow#3` When you use Horrific Strike, you can add a frightening display in a 10-foot Emanation from you. | number 10 no record explains
- `sub|Warden/Carrion King|Versatile Vermin#2` For example, they can open an unlocked door or container, store or fetch an item in an open container, carry a Tiny item up to 15 feet, or pour out a vial. | number 15 no record explains
- `sub|Warmage/House of Kings|Lead from the Front#2` Allies within 120 feet who can see you gain this benefit too. | number 120 no record explains

### NUM-DUR (940 uncovered)

- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#29` If it is not charged, you return after 7 days. | number 7 no record explains
- `item|au|Secret Keeper's Circlet#3` For the next 24 hours, if that trigger occurs, the circlet erases your memories of everything from the time you chose the trigger until the trigger occurred. | number 24 no record explains
- `item|bgg|Horizon Puzzle Cube#4` The portal is two-way and remains open for 10 minutes or until a creature uses an action to change the puzzle's configuration. | number 10 no record explains
- `item|cos|Dark Gift of Great Taar Haak, the Five-Headed Destroyer#1` You gain the strength of a Belt of Fire Giant Strength for 10 days, then the gift is gone. | number 10 no record explains
- `item|dmg14|Figurine of Wondrous Power, Onyx Dog#12` This onyx statuette of a dog can become a mastiff for up to 6 hours. | number 6 no record explains
- `item|dmg|Amulet of Harmony#9` On a 1, the well is restored but you fall into a deep, magical slumber for 1 year and cannot be roused except by a remove curse spell or similar magic. | number 1 no record explains
- `item|dmg|Book of Vile Darkness#14` A creature attuned to the book has to read and study it for 80 hours to absorb its contents before it can use these properties: Spells, Tireless Form, Vile Lore, Vile Speech, and Adjusted Ability Scores. | number 80 no record explains
- `item|dmg|Bottled Abyss#4` It repeats the save every 24 hours. | number 24 no record explains
- `item|dmg|Bottled Ooze (Ochre Jelly)#3` It dissolves into sludge after 1 hour or when you release another Bottled Ooze. | number 1 no record explains
- `item|dmg|Devastation Orb of Air#20` When this orb detonates, it creates a powerful windstorm that lasts for 1 hour. | number 1 no record explains
- `item|dmg|Dryadleaf#3` A picked leaf lasts 7 days. | number 7 no record explains
- `item|dmg|Figurine of Wondrous Power#74` After a use, you must wait 2 days before using it again. | number 2 no record explains
- `item|dmg|Illuminator's Tattoo#9` The writing becomes invisible to everyone other than you and the named creature for the next 24 hours. | number 24 no record explains
- `item|dmg|Instrument of Scribing#6` If that doesn't happen, the message fades after 24 hours. | number 24 no record explains
- `item|dmg|Knife of Stolen Resistance#2` Over the next 10 minutes the creature dies an agonizing death that can't be prevented short of the Wish spell. | number 10 no record explains
- `item|dmg|Moongold Ammunition#5` The coating wears off if the ammunition is not recoated within 3 months, ending its effects. | number 3 no record explains
- `item|dmg|Moongold Ammunition#6` Recoating before then costs 500 gp and resets the 3 months. | number 3 no record explains
- `item|dmg|Oil of Etherealness#4` Once it is applied, the creature is affected by the Etherealness spell for 1 hour. | number 1 no record explains
- `item|dmg|Potion of Mind Control (beast)#4` If the target's initial saving throw fails, the effect lasts for 1 hour, with no concentration required on your part. | number 1 no record explains
- `item|dmg|Potion of Possibility#2` Each fragment lasts for 8 hours or until used. | number 8 no record explains
- `item|dmg|Rakdos Keyrune#10` When the creature reverts to its keyrune form, it can't transform again until 36 hours have passed. | number 36 no record explains
- `item|dmg|Seed of Rebirth#5` When an attuned creature has been dead for 1 minute, its soul goes to the tree and its body becomes rich soil like the Plant Growth enrichment. | number 1 no record explains
- `item|dmg|Spindle of Fate#9` These benefits persist for 1 hour or until you target another creature with this effect. | number 1 no record explains
- `item|dmg|Thought Talker Orbs#4` On a fail, the Receiver's holder learns its surface thoughts for 1 minute, even if it leaves. | number 1 no record explains
- `item|dmg|Universal Pantograph#9` After the spell's casting time is finished, the creature is harmlessly shunted from the pantograph, and the pantograph's lid then can't be opened for 120 days, during which time the duplicate from the spell grows within. | number 120 no record explains
- `item|dmg|Wukka Nut#3` This magical light fades after 1 minute, but shaking the nut again causes the light to reappear. | number 1 no record explains
- `item|erlw|Scribe's Pen#4` If you use the pen to write on a creature that isn't a construct, the writing fades after 7 days. | number 7 no record explains
- `item|frafi|Mechanical Wonder (Mobility)#9` Once wound, the mobility wonder transforms into a personal transport device and remains active for 24 hours. | number 24 no record explains
- `item|misc14|Time of the Dragon#2` It helps you for 10 minutes, then vanishes and the scale crumbles. | number 10 no record explains
- `item|misc14|Vial of Thought Capture#3` The strands can be stored in the vial for up to 24 hours or until the vial reaches capacity, in which case the oldest strands dissipate. | number 24 no record explains
- `item|tce|Crook of Rao#20` Each banished fiend is sent back to its home plane and can't return to the plane the Crook of Rao banished it from for 100 years. | number 100 no record explains
- `item|tsdm|Potion of Liquid Air#1` For 8 hours after you drink it, you can breathe underwater and in the vacuum of space. | number 8 no record explains
- `item|tsgs|Battle Tax#4` It then cannot create coins for 12 hours. | number 12 no record explains
- `item|tsgs|Quickdraw#4` Reloading and resetting takes 1 minute. | number 1 no record explains
- `item|tssm|Evolution Stone (Very Rare)#1` If a Summoner's Eidolon holds this stone for 24 hours, it permanently gains one Evolution, even if it does not meet the prerequisites. | number 24 no record explains
- `sub|Bard/College of Origami|Paper Trinket#3` It turns mundane after 1 hour or one round trip. | number 1 no record explains
- `sub|Cleric/Angelic Scribe|Seal Scribe#2` Scribing a seal takes 10 minutes on a carryable surface such as paper, canvas, or stone tiles, or 8 hours with proper artisan tools to carve or etch a lasting version into hard material. | number 10,8 no record explains
- `sub|Druid/Circle of the Stars|Starry Form#4` The form lasts 10 minutes. | number 10 no record explains
- `sub|Monster Hunter/Trapper Guild|Trapper Gadgets#2` At any other time, 1 hour of work and 20 GP of materials makes one. | number 1 no record explains
- `sub|Warlock/The Fathomless|Tentacle of the Deeps#2` It lasts 1 minute or until you make another. | number 1 no record explains

### SPELL (833 uncovered)

- `class|Artificer|Spellcasting#8` You know two Artificer cantrips. | no record for SPELL; number 2 unexplained
- `class|Bard|Spellcasting#5` Choose two cantrips from the Bard spell list to know. | no record for SPELL
- `class|Necromancer|Spellcasting#3` You know three Necromancer cantrips, with a fourth at level 4 and a fifth at level 10. | no record for SPELL; number 3 unexplained
- `class|Paladin|Fighting Style#4` Pick two Cleric cantrips to learn. | no record for SPELL
- `class|Summoner|Spellcasting#3` You know 2 cantrips, such as Fire Bolt and Mage Hand. | no record for SPELL; number 2 unexplained
- `class|Warmage|Spellcasting#13` For Dispel Magic, a Warmage cantrip counts as a spell whose level is half your Warmage level, to a maximum of 9. | no record for SPELL; number half unexplained
- `class|Wizard|Spellcasting#4` You know three Wizard cantrips of your choice. | no record for SPELL
- `class|Wizard|Spellcasting#45` The process works like adding a new spell to your spellbook, but it is quicker since you already know how to cast the spell: each level of the copied spell needs just 1 hour and 10 GP. | no record for SPELL
- `feat|Magic Initiate (2014)|Magic Initiate (2014)#2` You learn two cantrips of your choice from that class's spell list. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Druid)|Magic Initiate (Druid)#2` Pick two cantrips on the Druid spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#1` Two Cantrips. | no record for SPELL; number 2 unexplained
- `feat|Magic Initiate (Wizard)|Magic Initiate (Wizard)#2` Pick two cantrips on the Wizard spell list, and you learn them. | no record for CHOICE,SPELL; number 2 unexplained
- `feat|Mystic Conflux|Mystic Conflux#1` You attune to up to four magic items at once instead of three, and you can cast Identify without a spell slot or material components. | no record for SPELL; number 4,3 unexplained
- `item|bgg|Mistral Mantle#9` When you use the mantle to cast the spell, the area of the spell isn't 3 for you, and you can see through the storm, ignoring the normal penalties of a 2 area. | number 3,2 no record explains
- `item|dmg|+1 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|dmg|+1 Moon Sickle#4` When you cast a spell that restores hit points, you can roll a d4 and add the number rolled to the amount of hit points restored, provided you are holding the sickle. | no record for SPELL; number 1d4 unexplained
- `item|dmg|+2 Moon Sickle#4` When you cast a spell that restores hit points, you can roll a d4 and add the number rolled to the amount of hit points restored, provided you are holding the sickle. | no record for SPELL; number 1d4 unexplained
- `item|dmg|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|dmg|Dagger of the Ogre Mage#6` When a damage cantrip is cast this way, the sword's damage type becomes the cantrip's for 1 minute or until you end it. | no record for SPELL
- `item|dmg|Occultant Abacus#20` While holding your occultant abacus within 5 feet of a creature killed within the past 24 hours, you can cast the augury spell. | number 5,24 no record explains
- `item|dmg|Spellburrow#4` If you have Spellcasting or Pact Magic, you cast the other two as if prepared, without counting against your prepared spells. | no record for SPELL; number 2 unexplained
- `item|dmg|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `item|misc14|Vial of Thought Capture#6` It does not extend the duration of those strands beyond 8 hours, but stored strands do not disappear if you cast encode thoughts again during the duration of the cantrip. | no record for SPELL; number 8 unexplained
- `item|tce|+1 Moon Sickle#4` When you cast a spell that restores hit points, you can roll a d4 and add the number rolled to the amount of hit points restored, provided you are holding the sickle. | no record for SPELL; number 1d4 unexplained
- `item|tce|+2 All-Purpose Tool#6` For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you. | no record for SPELL; number 8 unexplained
- `item|tce|+2 Moon Sickle#4` When you cast a spell that restores hit points, you can roll a d4 and add the number rolled to the amount of hit points restored, provided you are holding the sickle. | no record for SPELL; number 1d4 unexplained
- `item|tee24|Battle Rod#1` Held in two hands, it lets you cast cantrips at up to twice their range. | no record for SPELL; number 2,double unexplained
- `item|tee24|War Staff#2` Cantrips cast through it have up to four times their normal range. | no record for SPELL; number 4 unexplained
- `item|tsgs|Sword of the Spelldrinker#5` Spend 1 to cast Counterspell. | no record for SPELL; number 1 unexplained
- `sub|Bard/College of Lore|Magical Discoveries#1` You learn two spells of your choice, taken from the Cleric, Druid, or Wizard spell list in any combination. | no record for CHOICE,SPELL; number 2 unexplained
- `sub|Cleric/Death Domain|Reaper#3` When you cast a Necromancy cantrip that normally targets one creature, it can instead target two creatures that are within range and within 5 feet of each other. | no record for SPELL; number 5,2 unexplained
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#5` 1 Can't speak or cast spells with Verbal components. | no record for SPELL; number 1 unexplained
- `sub|Fighter/Eldritch Knight (2014)|Spellcasting#3` You know two Wizard cantrips and learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Fighter/Prescient Knight|Spellcasting#3` You know two Wizard cantrips and learn one more at Fighter level 10. | no record for SPELL; number 2 unexplained
- `sub|Monk/Warrior of the Mystic Arts|Spellcasting#3` You know two cantrips from the Sorcerer spell list. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Arcane Trickster (2014)|Spellcasting#3` You know Mage Hand and two other Wizard cantrips, and you learn a third at level 10. | no record for SPELL; number 2 unexplained
- `sub|Rogue/Sanguine Thief|Spellcasting#2` You know three cantrips from the Wizard list and the Sangromancy school. | no record for SPELL; number 3 unexplained
- `sub|Vagabond/Mage Brand|Arcane Synesthesia#2` You instantly know whether a creature has cast a spell in the last 24 hours. | no record for SPELL; number 24 unexplained
- `sub|Warmage/House of Dice|Chaos Roll#9` Until the start of your next turn, each creature in a 60-foot Emanation from you can speak only babbling nonsense and cannot cast spells with a Verbal component. | no record for SPELL; number 60 unexplained

### DMG (821 uncovered)

- `class|Dancer|Dervish Fighting#3` When you roll damage with a weapon that deals 1d4 or 1d6, you can roll 2d4 instead. | no record for DMG; number 1d4,1d6,2d4 unexplained
- `class|Healer|Empowering Tether#3` Each time it hits with an attack, it can add 1d8 to the damage roll. | no record for DMG; number 1d8 unexplained
- `item|bgdia|Shatterstick#3` When the effects ends, the shatterstick breaks apart, becoming useless, and all structures within 20 feet of it take 35 (10d6) bludgeoning damage. | no record for DMG; number 10d6,20,35 unexplained
- `item|cos|Saint Markovia's Thighbone#15` When you hit a fiend or an undead with this magic weapon, that creature takes an extra 2d6 radiant damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Bolt#2` You gain +1 to attack and damage rolls, and it deals 1d12 Lightning instead of 1d10 Piercing. | number 1d12,1d10 no record explains
- `item|dmg|Bracers of Asmodeus#5` If you ever decline an opportunity to better yourself financially at another's expense, you immediately take 3d10 necrotic damage. | no record for DMG; number 3d10 unexplained
- `item|dmg|Circlet of Barbed Vision (Exalted)#5` It returns when you take the circlet off, but you take 4d6 psychic damage when you do. | no record for DMG; number 4d6 unexplained
- `item|dmg|Cloak of Spines#4` The attack's damage is reduced by 2d4 and the attacker takes 2d4 magical Piercing damage. | no record for DMG; number 2d4 unexplained
- `item|dmg|Condemner (Exalted)#5` +1 to attack and damage rolls. | number 1 no record explains
- `item|dmg|Dawnbringer#6` When you hit an undead with it, that target takes an extra 1d8 radiant damage. | no record for DMG; number 1d8 unexplained
- `item|dmg|Flail of Tiamat#3` When you hit with an attack roll using it, the target takes an extra 5d4 damage of your choice of one of the following damage types: acid, cold, fire, lightning, or poison. | no record for CHOICE
- `item|dmg|Fragment of Abhorrence#3` Drawback: if your turn starts while you are frightened, you take 2d6 psychic damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Instrument of the Bards (Cli lyre)#4` If it fails, it takes 2d4 Psychic damage. | no record for DMG; number 2d4 unexplained
- `item|dmg|Instrument of the Bards (Doss lute)#4` If it fails, it takes 2d4 Psychic damage. | no record for DMG; number 2d4 unexplained
- `item|dmg|Iron Fangs#2` You gain a +2 bonus to attack and damage rolls with your Bite attacks, and they deal your choice of Force or Piercing damage. | no record for DMG; number 2 unexplained
- `item|dmg|Mace of Smiting#3` If you roll a 20 on an attack roll with the mace, the target takes an extra 7 Bludgeoning damage, or an extra 14 Bludgeoning damage if the target is a Construct. | number 7,14 no record explains
- `item|dmg|Quiver of Energy#2` The first time each turn you hit with a weapon attack using ammunition from this quiver, it deals an extra 1d6 damage of that type. | no record for DMG; number 1d6 unexplained
- `item|dmg|Ring of Shooting Stars#20` A creature takes 5d4 Radiant damage if it fails, or half that damage if it succeeds. | no record for DMG; number 5d4,half unexplained
- `item|dmg|Rogue Card#1` When you hit a target with a weapon attack while holding this card, you can deal an extra 6d6 force damage to that target. | no record for DMG; number 6d6 unexplained
- `item|dmg|Ruby Rod of Asmodeus#3` All damage dealt with it is converted to necrotic, and when you hit a good aligned creature, that creature takes an extra 2d12 necrotic damage. | no record for DMG; number 2d12 unexplained
- `item|dmg|Ruin's Wake (Awakened)#24` - The weapon's bonus to attack and damage rolls increases to +2, and the extra piercing damage dealt by the weapon increases to 2d8. | number 2d8 no record explains
- `item|dmg|Saint Markovia's Thighbone#15` When you hit a fiend or an undead with this magic weapon, that creature takes an extra 2d6 radiant damage. | no record for DMG; number 2d6 unexplained
- `item|dmg|Sharkrazor Mantle#2` A creature that grapples or Restrains you while touching you takes 1d6 Piercing damage, and again at the start of each of its turns until the condition ends or it stops touching you. | no record for DMG; number 1d6 unexplained
- `item|dmg|Talisman of Ultimate Evil#11` If it succeeds, it doesn't fall in but takes 4d6 Psychic damage from the ordeal. | no record for DMG; number 4d6 unexplained
- `item|egw|Blade of Broken Mirrors (Exalted)#31` - The weapon's bonus to attack and damage rolls increases to +2. | no record for DMG; number 2 unexplained
- `item|egw|Mace of the Black Crown (Exalted)#41` - The weapon's bonus to attack and damage rolls increases to +3, and the extra fire damage dealt by the weapon when it is ignited increases to 3d6. | number 3d6 no record explains
- `item|egw|Stormgirdle (Exalted)#15` - Your Storm Avatar's lightning strike deals 4d6 lightning damage (instead of 3d6). | no record for DMG; number 4d6,3d6 unexplained
- `item|egw|The Bloody End (Awakened)#13` - You gain a +1 bonus to attack and damage rolls made with this magic weapon. | no record for DMG; number 1 unexplained
- `item|pabtso|Cape of Enlargement#7` - When you hit with an attack roll using a weapon or an unarmed strike, you can add your proficiency bonus to the attack's damage. | no record for DMG; number pb unexplained
- `item|tdcsr|Agony (Exalted)#8` Extra damage on a marked target becomes 1d8. | no record for DMG; number 1d8 unexplained
- `item|tsdm|Ballistic Sledge#6` At character level 5 you gain a +1 bonus to attack and damage rolls with it, rising to +2 at level 11 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Justiciar's Gavel#4` You gain +1 to attack and damage with it at level 5, +2 at level 11, and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `item|tsdm|Spiked Skin#4` The damage becomes 2d4 at level 5, 3d4 at level 11 and 4d4 at level 17. | no record for DMG; number 2d4,1d4 unexplained
- `item|tsgs|Sundersludge Net#5` Another creature that touches the Net takes 1d6 Acid damage. | no record for DMG; number 1d6 unexplained
- `item|wbtw|Snicker-Snack#6` Such a creature instead takes an extra 6d8 slashing damage from the hit. | no record for DMG; number 6d8 unexplained
- `sub|Ranger/Griffon Scout|Skirmisher's Step#1` If you move at least 20 ft straight toward a creature and hit it with a melee weapon attack on the same turn, the attack deals an extra 1d8 damage of the weapon's type. | no record for DMG; number 1d8 unexplained
- `sub|Rogue/Cyber Ninja|Cyber Katana#5` You get +1 to attack and damage rolls with it, rising to +2 at Rogue level 9 and +3 at level 17. | no record for DMG; number 1,2,3 unexplained
- `sub|Rogue/Infiltrator|Cyberattack#3` When you cast it and a creature carries the affected Magical Technology, that creature takes 2d6 Lightning damage and cannot make Opportunity Attacks until the start of its next turn. | no record for DMG; number 2d6 unexplained
- `sub|Vagabond/Feylost|Fey Moods#18` When a creature damages you, the next time you hit it before the end of your next turn, it takes an extra 1d8 Force damage. | no record for DMG; number 1d8 unexplained
- `sub|Wizard/Materializer|Dematerialize#2` Whenever you deal damage to a Construct, it takes an extra 1d8 Force damage. | no record for DMG; number 1d8 unexplained

### ADV (695 uncovered)

- `class|Rogue|Sneak Attack#2` Once per turn, if you have Advantage on an attack roll that uses a Finesse or Ranged weapon and the attack hits a creature, you can deal an extra 1d6 damage to that creature. | no record for ADV
- `feat|Iron Hero|Iron Hero#5` You have Advantage on attack rolls against a creature that has dropped one of your allies to 0 Hit Points since the end of your last turn. | no record for ADV; number 0 unexplained
- `feat|Lucky|Lucky#5` You can spend 1 Luck Point on any d20 you roll for a D20 Test, which gives you Advantage on that roll. | number 1d20,1 no record explains
- `item|au|Ominous Staff of Skulls#4` Additionally, you have Advantage on Charisma (Intimidation) checks made while holding the staff, and the staff's eye sockets glow a disquieting green, shedding Dim Light in a 5-foot radius. | number 5 no record explains
- `item|coa|Scourge of Shadow#23` While in 2 or darkness you gain blindsight out to 60 feet and Dexterity (Stealth) checks are made with advantage. | no record for ADV,SENSE; number 60,2 unexplained
- `item|dmg|+1 Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|dmg|Draught of Feather Shine#2` When you drink it, you have Advantage on Charisma ability checks and saving throws for 24 hours. | no record for ADV; number 24 unexplained
- `item|dmg|Eyes of the Dragonne#2` You have Advantage on sight-based Wisdom (Perception) checks, and in clear visibility you can pick out details as small as 2 ft across at great distance. | number 2 no record explains
- `item|dmg|Galea of the Soulfire Phoenix#5` You and allies in its Bright Light have Advantage on saves against Charmed and Frightened, and a 19 or 20 on a Death Saving Throw restores 1 Hit Point. | no record for ADV; number 19,20,1 unexplained
- `item|dmg|Ghallanda Cauldron#3` Cooking in it takes 90 percent less time, and you have Advantage on ability checks with Cook's Utensils. | number 90 no record explains
- `item|dmg|Humble Frock#2` If you have reached at least Stage 2 of the Seraph, you also have Advantage on saving throws to avoid revealing your true nature. | no record for ADV; number 2 unexplained
- `item|dmg|Iroas's Disciple#3` During that time, creatures within 30 feet of you can't gain advantage on attack rolls against you. | no record for ADV; number 30 unexplained
- `item|dmg|Red Claw's Regalia#2` You tolerate temperatures of 0 degrees F or lower, your Constitution rises by 2 (maximum 22), you have Advantage on Constitution saves and Resistance to Fire damage, and you can walk on molten rock as if solid. | number 0,2,22 no record explains
- `item|tghg|Ectoplasmic Whip#2` You gain a +1 bonus to attack and damage rolls with it, and attack rolls with it against non-Undead creatures have Advantage. | no record for ADV
- `item|tghg|Full Moon Extract#2` For 1 hour your Strength score becomes 19 (if lower), and you have Advantage on Strength checks and saves. | no record for ABIL; number 1,19 unexplained
- `item|tsdm|Blaster Mod (Aimbot)#5` With Advantage or Disadvantage, the 10 replaces only one of the two dice and you roll the other normally. | no record for ADV,DIS; number 10,2 unexplained
- `item|tsdm|Ghost Suit#3` If you moved 15 ft or less on your turn, you have Advantage on Dexterity (Stealth) checks made for the Hide action. | no record for ADV; number 15 unexplained
- `item|tsgs|Dragon Edge Weapon#2` The first time each turn you hit with an attack roll you had Advantage on, it deals an extra 1d6 damage of the type of the dragon's breath weapon. | no record for ADV
- `item|tsgs|Staff of the Reverent Warrior#6` Spend 1 to give the next attack roll against the target Advantage until the end of your next turn. | no record for ADV; number 1 unexplained
- `species|Goliath|Large Form#1` From level 5, Bonus Action once per Long Rest: become Large for 10 minutes, Advantage on Strength checks, +10 ft Speed. | no record for ADV,SPEED
- `sub|Barbarian/Path of the Drifter|Lone Wolf#2` Stand Alone: while Raging with no ally within 5 ft, enemies cannot have Advantage on attacks against you. | no record for ADV; number 5 unexplained
- `sub|Bard/College of Spirits|Spirits from Beyond#16` 5 Fortune Teller: the target has Advantage on D20 Tests until the start of your next turn. | no record for ADV; number 1d20,5 unexplained
- `sub|Captain/Rōnin|Lone Wolf#4` While no ally is within 5 feet of you and you are not Incapacitated, enemies cannot have Advantage on attack rolls against you. | no record for ADV; number 5 unexplained
- `sub|Cleric/Eldritch Domain|Eldritch Contagion#10` 6 Has Advantage on attack rolls, and attack rolls against it have Advantage. | no record for ADV; number 6 unexplained
- `sub|Cleric/Labyrinth Domain|Channel Divinity: Wisdom of the Winding Way#1` Use Channel Divinity to gain Advantage on Wisdom (Survival) checks made to track, for 1 hour. | no record for ADV; number 1 unexplained
- `sub|Dancer/Shadow Dancer|Vengeful Shadow#2` You have Advantage on attacks against a creature covered this way, and when you hit one, you deal an extra 1d6 Necrotic damage. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Fighter/Nightwatcher|Ever Vigilant#3` Each can use a Reaction to gain Advantage on its Initiative roll and move up to half its Speed without Opportunity Attacks. | no record for INIT,SPEED; number half unexplained
- `sub|Fighter/Scofflaw|Blindside#1` Level 10: once per Short or Long Rest, deal an extra 5d6 damage when you hit a creature that has not yet taken a turn in combat, one you misdirected this turn, or any target you attack with Advantage. | no record for ADV,DMG; number 5d6 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#12` Acumen (Celestial, Fiend, Fey): 1 hour, Advantage on Wisdom (Insight) checks and on one chosen skill, Intimidation or Persuasion. | no record for ADV
- `sub|Necromancer/Crone|Baba Yaga [Lichdom]#4` When Charnel Touch deals 25 or more damage, the target has Disadvantage on saving throws until the start of your next turn, and your thralls have Advantage on attack rolls against it. | no record for ADV,DIS; number 25 unexplained
- `sub|Paladin/Oath of Glory (2014)|Channel Divinity: Peerless Athlete#2` For 10 minutes you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, carry and lift twice the normal weight, and jump 10 feet farther. | no record for ADV; number 10,10,double unexplained
- `sub|Paladin/Oath of Vengeance (2014)|Channel Divinity: Vow of Enmity#2` You have Advantage on attack rolls against it for 1 minute or until it drops to 0 Hit Points or falls Unconscious. | no record for ADV; number 1,0 unexplained
- `sub|Paladin/Oath of Zeal|Apocalyptic Revelation#4` See the Truth: Truesight 60 ft. Smite the Heretic: Bonus Action to pick a creature within 60 ft and expose its weaknesses, so you and your allies have Advantage on attack rolls against it. | no record for ADV,SENSE; number 60 unexplained
- `sub|Paladin/Oath of the Watchers|Channel Divinity: Watcher's Will#2` For 1 minute you and they have Advantage on Intelligence, Wisdom, and Charisma saving throws. | no record for ADV; number 1 unexplained
- `sub|Rogue/Runetagger|Lead Paint#1` When you hit a creature that bears one of your runes, or spend a Rune Point to rune it as part of that attack, you can use Sneak Attack on it without Advantage or an ally within 5 ft of it. | no record for ADV; number 5 unexplained
- `sub|Rogue/Runetagger|Runes#12` The next attack roll against the marked creature has Advantage, and if it hits it deals extra 1d6 Acid damage. | no record for ADV,DMG; number 1d6 unexplained
- `sub|Sorcerer/Aristocratic|Power of the Elite#2` You double your proficiency bonus on Charisma checks against others of your race and have Advantage on them. | no record for ADV; number double,pb unexplained
- `sub|Warlock/The Parasite Patron|Physical Specimen#5` Speed +5 ft. Advantage on saves to avoid or end Poisoned. | no record for ADV,SPEED; number 5 unexplained
- `sub|Wizard/Illuminator|Omen of Warning#3` You gain Advantage on up to two Initiative rolls. | no record for ADV,INIT; number 2 unexplained
- `sub|Wizard/School of Necromancy|Command Undead#5` An undead with Intelligence 8 or higher has Advantage on the save. | no record for ADV; number 8 unexplained

### SPEED (586 uncovered)

- `class|Rogue|Steady Aim#3` Using it also drops your Speed to 0 for the rest of the current turn. | no record for SPEED; number 0 unexplained
- `feat|Charger|Charger#4` Whenever you take the Dash action, your Speed rises by 10 feet for that action. | no record for SPEED; number 10 unexplained
- `feat|Slasher (2014)|Slasher (2014)#4` Once per turn, when you hit a creature with an attack that deals Slashing damage, you can reduce its Speed by 10 feet until the start of your next turn. | no record for RESOURCE,SPEED; number 10 unexplained
- `feat|Witch Hunter|Witch Hunter#8` When you hit a creature that can cast spells with a melee weapon attack or an Unarmed Strike, you can reduce its Speed by 15 feet until the start of your next turn. | no record for SPEED,SPELL; number 15 unexplained
- `item|au|Spell-Slinger's Puppet#1` As a Bonus Action while holding this ventriloquist's doll, you can pull the cord on the doll's back to cause the doll to levitate to an unoccupied space you can see within 30 feet of yourself and hover there. | no record for SPEED; number 30 unexplained
- `item|dmg14|Carpet of Flying, 4 ft. × 6 ft.#3` A 4 ft. × 6 ft. carpet can carry up to 400 lb. at a fly speed of 60 feet. | no record for SPEED; number 4,6,60 unexplained
- `item|dmg|Apparatus of Kwalish#20` Down: the legs retract, its Speed and Swim Speed drop to 0, and it can't benefit from bonuses to speed. | no record for SPEED; number 0 unexplained
- `item|dmg|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | no record for SPEED; number 15,1 unexplained
- `item|dmg|Bird of a Feather (Uncommon)#2` Magic action: gain a Fly Speed of 20 ft for 1 minute or until your Concentration ends. | no record for SPEED; number 20 unexplained
- `item|dmg|Blizzard Sphere#3` A creature that first enters it on a turn or starts its turn there makes a DC 15 Constitution save, taking 4d8 Cold and having its Speed halved until the start of its next turn on a failure (half damage only on a success | no record for DC,SPEED; number 4d8,15,half unexplained
- `item|dmg|Brooch of Many Sizes#3` When you return to normal size after overloading, you are Incapacitated with Speed 0 until the end of your next turn, and its properties cannot be used again for 7 days. | no record for SPEED; number 7,0 unexplained
- `item|dmg|Broom of Flying#4` It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet. | no record for SPEED; number 30 unexplained
- `item|dmg|Carpet of Flying, 4 ft. × 6 ft.#3` A 4 ft. × 6 ft. carpet can carry up to 400 lb. at a fly speed of 60 feet. | no record for SPEED; number 4,6,60 unexplained
- `item|dmg|Couatl Herald's Reach#9` Attuned to three such items, you gain a Fly Speed of 30 ft (or +30 ft). | number 3 no record explains
- `item|dmg|Hook of Fisher's Delight#15` The fish uses the quipper stat block, except that it can breathe air and has a flying speed of 30 feet.. | no record for SPEED; number 30 unexplained
- `item|dmg|Servitude Choker#3` It becomes a mindless servant under your control (AC 10, Speed 20 ft) until you remove the necklace or it takes damage. | no record for SPEED; number 20,10 unexplained
- `item|dmg|Solar Wings of Ra#3` You gain a Fly Speed of 60 ft, which you lose if you leave Bright Light. | no record for SPEED; number 60 unexplained
- `item|dmg|Wings of Flying#2` These wings give you a Fly Speed of 60 feet. | no record for SPEED; number 60 unexplained
- `item|egw|Arcane Cannon#18` On a failed save, a creature takes 22 (4d10) cold damage, and its speed is reduced by 10 feet for 1 minute. | no record for DMG,SPEED; number 4d10,10,1,22 unexplained
- `item|tdcsr|Deathwalker's Ward (Exalted)#12` You gain a flying speed of 60 feet for 1 hour. | no record for SPEED; number 60 unexplained
- `item|tdcsr|Stormrider Boots#3` Until the end of your turn: you have a flying speed of 90 feet, opportunity attacks against you have an adjusted roll (garbled in the source, see the book), and whenever you move within 5 feet of a hostile creature it mu | no record for DC,DMG,SPEED; number 3d8,90,5,15 unexplained
- `item|tsdm|Hoverboard#3` While riding it, your Speed rises by 10 ft, you ignore Difficult Terrain, and you can cross liquids without sinking. | no record for SPEED; number 10 unexplained
- `item|tsgs|Axe Beak Tomahawk#3` Each failure reduces its Fly Speed by 15 ft for 1 minute. | no record for SPEED; number 15,1 unexplained
- `item|tsgs|Couatl Herald's Guard#5` While you are attuned to three items with this property, you gain a Fly Speed of 30 ft, or 30 ft more if you already have one. | number 3 no record explains
- `item|tsgs|Rocborne Rod#3` You can move as if you had a 40 ft Fly Speed but not upward, and you take no fall damage. | no record for SPEED; number 40 unexplained
- `item|tsgs|Shielding Turtle Sugarbombs#2` As a Magic action, eat one to lower your Speed by 10 ft for 1 minute. | no record for SPEED; number 10,1 unexplained
- `item|wdmm|Helm of the Scavenger#13` - You can use the helm to propel the vessel through air or space at a maximum speed in miles per hour equal to your highest-level unexpended spell slot × 10. | no record for SLOT,SPEED; number 10 unexplained
- `species|Arisen|Heritage Traits#6` If you are Small, you can lower your Speed by 5 feet to gain one extra trait. | no record for SPEED
- `species|Gnoll|Rampage#1` When you reduce a creature to 0 Hit Points with a melee attack on your turn, you can use a Bonus Action to move up to half your Speed and make a bite attack. | no record for SPEED; number 0,half unexplained
- `sub|Barbarian/Path of the World Tree|Branches of the Tree#4` Once the target has teleported, you can lower its Speed to 0 until the current turn ends. | no record for SPEED; number 0 unexplained
- `sub|Bard/College of Swords|Blade Flourish#1` When you take the Attack action, your Speed rises by 10 feet until the end of the turn. | no record for SPEED; number 10 unexplained
- `sub|Bard/College of the Moon|Moon's Inspiration#7` That creature's Speed also goes up by 10 feet until the end of its next turn. | no record for SPEED; number 10 unexplained
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one weapon or Unarmed Stri | no record for SPEED; number half unexplained
- `sub|Investigator/Kid Sleuth|Split Up, Gang#1` When you use Exploit Weakness, you can move up to half your Speed without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Monk/Way of the Drunken Master|Drunken Technique#1` When you use Flurry of Blows, you also gain the benefit of the Disengage action and your Speed rises by 10 feet until the end of the turn. | no record for SPEED; number 10 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#14` Flight (Celestial, Dragon, Elemental): 10 minutes, Fly Speed equal to your Speed, not in Heavy armor. | no record for SPEED; number 10 unexplained
- `sub|Monster Hunter/Trapper Guild|Agile Response#2` Whether the attack hits or misses, you then move up to half your Speed without provoking Opportunity Attacks. | no record for SPEED; number half unexplained
- `sub|Ranger/Winter Walker|Chilling Retribution#2` On a failure it has the Stunned condition until the end of your next turn, and its Speed is 0 while Stunned. | no record for SPEED; number 0 unexplained
- `sub|Wizard/Daemonologist|Unearthly Countenance#7` Fly Speed 60 ft. Long Rest to use again, or expend a level 5+ slot (no action). | no record for SPEED; number 60 unexplained
- `sub|Wizard/Gastronomer|Monster Meal#7` Elemental: +10 ft Speed. | no record for SPEED; number 10 unexplained

### RES (569 uncovered)

- `item|coa|True-Ice Shards (Dagger)#15` Creatures vulnerable to cold damage take triple damage from the True-Ice Shards, rather than double. | no record for RES; number double,3 unexplained
- `item|dmg14|Ioun Stone, Absorption#6` A stone has AC 24, 10 hit points, and resistance to all damage. | no record for RES; number 24,10 unexplained
- `item|dmg14|Ioun Stone, Agility#6` A stone has AC 24, 10 hit points, and resistance to all damage. | no record for RES; number 24,10 unexplained
- `item|dmg14|Ioun Stone, Leadership#6` A stone has AC 24, 10 hit points, and resistance to all damage. | no record for RES; number 24,10 unexplained
- `item|dmg|+1 Wraps of Unarmed Prowess#1` While you're wearing these cloth wraps, your unarmed strikes are considered magical for the purpose of overcoming immunity and resistance to nonmagical attacks and damage, and you gain a +1 bonus to the attack and damage | no record for IMM,RES
- `item|dmg|+3 Wraps of Unarmed Prowess#1` While you're wearing these cloth wraps, your unarmed strikes are considered magical for the purpose of overcoming immunity and resistance to nonmagical attacks and damage, and you gain a +3 bonus to the attack and damage | no record for IMM,RES
- `item|dmg|Armor of Invulnerability#1` While wearing this suit of Plate Armor, you have Resistance to three damage types: Bludgeoning, Piercing, and Slashing. | number 3 no record explains
- `item|dmg|Boots of the Winterlands#4` You have Resistance to Cold damage, and you can endure temperatures of 0 degrees Fahrenheit or lower with no extra protection. | number 0 no record explains
- `item|dmg|Claw of the Wyrm Rune#5` The dragon must then succeed on a DC 15 Constitution saving throw or gain vulnerability to all damage types until the end of your next turn. | no record for DC; number 15 unexplained
- `item|dmg|Eldritch Claw Tattoo#7` While the tattoo is on your skin, your unarmed strikes are considered magical for the purpose of overcoming immunity and resistance to nonmagical attacks, and you gain a +1 bonus to attack and damage rolls with unarmed s | no record for IMM,RES
- `item|dmg|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|dmg|Galvanic Steelsnare#6` Destroying the Net (AC 12, 15 HP, Resistance to Slashing, Immunity to other damage) also frees it. | no record for IMM,RES; number 12,15 unexplained
- `item|dmg|Glowing Ember#9` It is a Tiny object with 30 hit points, AC 16, Resistance to nonmagical slashing and piercing damage, and Immunity to fire damage. | no record for IMM,RES; number 30,16 unexplained
- `item|dmg|Ioun Stone, Awareness#6` A stone has AC 24, 10 hit points, and resistance to all damage. | no record for RES; number 24,10 unexplained
- `item|dmg|Ioun Stone, Greater Absorption#6` A stone has AC 24, 10 hit points, and resistance to all damage. | no record for RES; number 24,10 unexplained
- `item|dmg|Mirror of Reflected Pasts#2` The 3-foot-tall mirror weighs 25 pounds, and it has AC 11, 10 hit points, and vulnerability to bludgeoning damage. | no record for RES; number 3,11,10 unexplained
- `item|dmg|Nanobot Canister (Deconstructive)#6` At the start of each of its turns, it takes 1d10 Necrotic damage that ignores Resistance and Immunity. | no record for DMG,IMM,RES; number 1d10 unexplained
- `item|dmg|Necrolace#3` As a Bonus Action, spend charges to take 1d8 Necrotic damage each (ignores Resistance and Immunity), and a creature you see within 30 ft regains twice that in HP. | no record for DMG,IMM,RES; number 1d8,30,double unexplained
- `item|dmg|Potion of Resistance#1` Drinking this potion gives you Resistance to one damage type for 1 hour. | no record for RES; number 1 unexplained
- `item|dmg|Staff of Climbing Ivy#13` They have AC 14, 45 hit points, Vulnerability to fire and slashing damage, Strength 16, and can bear 240 lb. More weight starts to tear them, dealing 10 damage to them each round. | no record for RES; number 14,45,16,10 unexplained
- `item|dmg|Sundersludge Net#7` The Net (AC 10, 5 HP, Immunity to Bludgeoning, Poison and Psychic, Resistance to all other damage) frees the target if destroyed and is then harmless. | no record for IMM,RES; number 10,5 unexplained
- `item|dmg|True-Ice Shards (Dagger)#17` On a failed save, the creature that took the damage becomes vulnerable to cold damage for 24 hours. | no record for RES; number 24 unexplained
- `item|pota|Weird Tank#9` The tank has AC 15, 50 hit points, vulnerability to bludgeoning damage, and immunity to poison and psychic damage. | no record for IMM,RES; number 15,50 unexplained
- `item|sato|Mimir#6` The device has AC 22, 25 hit points, immunity to poison and psychic damage, and resistance to all other damage. | no record for IMM,RES; number 22,25 unexplained
- `item|tghg|Crown of the Keppmir King#2` While you wear it, you have Resistance to Cold damage, can breathe underwater, and your Constitution is 20 unless it is already higher. | number 20 no record explains
- `item|tghg|Flammable Tincture#3` For 1 minute the creature loses any Immunity or Resistance to Fire damage and has Vulnerability to Fire damage instead. | no record for IMM,RES; number 1 unexplained
- `item|thhw|Kwark's Wondrous Kernels, Tossable#18` Each creature within 10 ft is coated and has Vulnerability to fire damage for 1 minute. | no record for RES; number 10,1 unexplained
- `item|tsgs|Bloodmage Dagger#7` When you cast a level 1 to 3 spell on yourself or one creature, spend charges to raise the slot level by 1 each (max 5), and spend and roll that many Hit Point Dice, taking the total as Necrotic damage that ignores Resis | no record for IMM,RES,SLOT; number 1 unexplained
- `item|tsgs|Chillspike#4` When you reduce a Large or smaller creature to 0 Hit Points, you can entomb it in ice for 1 minute (it cannot be Prone and makes no Death Saves, ice AC 12, HP 20, immune to Poison and Psychic, vulnerable to Fire, and it  | no record for IMM,RES; number 0,12,20 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#10` 8 Yellow: Resistance to Lightning and Immunity to Magic Missile damage. | no record for IMM,RES; number 8 unexplained
- `item|tsgs|Frefil's Jolly Oozebean Sugarbombs#4` 2 Black: Resistance to Acid and can eat inedible, nonpoisonous organics. | no record for RES; number 2 unexplained
- `item|tsgs|Galea of the Soulfire Phoenix#2` You have Resistance to Fire, and in combat harmless flames shed Bright Light 20 ft and Dim Light 20 ft more. | number 20 no record explains
- `item|tsgs|Omenbringer's Mantle#2` You have Resistance to Necrotic damage and fall at 60 ft per round without taking fall damage. | number 60 no record explains
- `item|tsgs|Signet Rings of the Fey Court#6` As a Reaction when you take the matching damage, spend 1 charge for Resistance to it until your next turn starts, including against the triggering hit. | number 1 no record explains
- `sub|Cleric/Nature Domain|Dampen Elements#1` When you or a creature within 30 feet takes acid, cold, fire, lightning, or thunder damage, you can use your Reaction to give that creature Resistance against that instance of damage. | no record for RES; number 30 unexplained
- `sub|Cleric/Purification Domain|Sear Imperfections#2` Right after, the target takes 1d6 Fire damage per level of the slot (ignores Resistance and Immunity). | no record for DMG,IMM,RES; number 1d6 unexplained
- `sub|Monster Hunter/Devourer Guild|Transmuting Metabolism#21` Telepathy (Aberration, Fiend, Plant): 1 hour, speak telepathically to a creature you see within 60 feet in a language you know, and Resistance to Psychic damage. | no record for PROF,RES; number 60 unexplained
- `sub|Sorcerer/Elemental Essence|Elemental Soul#5` You can enter hostile creatures' spaces, move through gaps 1 inch wide, ignore Strong Wind and have Resistance to nonmagical Bludgeoning, Piercing and Slashing damage. | number 1 no record explains
- `sub|Warmage/House of Roulette|Spin the Wheel#16` Single (guess the exact number): until the start of your next turn you have Resistance to all damage and treat any d20 roll you make as a 20. | no record for DMG,RES; number 1d20,20 unexplained
- `sub|Wizard/Chaos|Shifting Resistance#1` When you cast a chaos spell, you gain Resistance to a random damage type for 1 plus your Intelligence modifier (minimum 1) rounds. | no record for RES,SPELL; number 1 unexplained

### PROF (538 uncovered)

- `class|Bard|Expertise#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Bard|Expertise~2#2` If you have proficiency in Performance and Persuasion, those two are suggested. | no record for PROF; number 2 unexplained
- `class|Bard|Expertise~2#3` When you reach Bard level 9, pick two more of your skill proficiencies to gain Expertise in. | no record for PROF
- `class|Captain|Weapon Mastery#1` You can use the mastery property of two kinds of weapons you are proficient with, such as Lance and Longsword. | no record for PROF; number 2 unexplained
- `class|Investigator|Expertise~2#3` At level 9 you gain Expertise in two more skills. | no record for PROF; number 2 unexplained
- `class|Rogue|Expertise~2#1` Choose two skills you're proficient in. | no record for PROF
- `class|Rogue|Expertise~2#4` When you reach Rogue level 6, choose two more skills you're proficient in, and you gain Expertise in those as well. | no record for PROF
- `class|Rogue|Reliable Talent#1` If you make an ability check that draws on a skill or tool you're proficient with, any d20 roll of 9 or lower can count as a 10 for you. | no record for PROF; number 1d20,10 unexplained
- `feat|Artillerist (Dark Matter)|Artillerist (Dark Matter)#2` You can use the mastery property of two kinds of ship weapons of your choice, provided you are proficient with them. | no record for CHOICE,PROF; number 2 unexplained
- `feat|Dragonsmith|Dragonsmith#8` In the hands of a proficient wielder it deals an extra 1d6 damage of a type fitting the dragon. | no record for DMG,PROF; number 1d6 unexplained
- `item|dmg|Bracers of Archery#1` While you wear these bracers, you have proficiency with the Longbow and the Shortbow, and your damage rolls with either of those weapons get a +2 bonus. | number 2 no record explains
- `item|dmg|Draconic Rebirth#3` You may keep the skill proficiencies from your old race, or gain proficiency in two skills of your choice. | no record for CHOICE,PROF; number 2 unexplained
- `item|dmg|Expert's Espresso#3` For 1 minute you have proficiency and Expertise in all skills. | no record for PROF; number 1 unexplained
- `item|dmg|Instrument of Scribing#3` The message is in a language you know and can be no longer than six words. | no record for PROF; number 6 unexplained
- `item|dmg|Knight's Standard of Valor#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Frightened if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Knight's Standard of Virtue#3` You and allies within 10 ft add Proficiency Bonus to saves against or to end Charmed if not already proficient. | no record for PROF; number 10,pb unexplained
- `item|dmg|Professor Skant#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `item|erlw|Docent#14` If a docent knows fewer than six languages, it can learn a new language after it hears or reads the language through your senses. | no record for PROF; number 6 unexplained
- `item|llk|Deck of Several Things#63` You gain proficiency in a skill of your choice for the duration of the adventure, or you can draw two additional cards beyond your declared draws. | no record for CHOICE,PROF; number 2 unexplained
- `item|llk|Deck of Several Things#97` You gain proficiency in the Persuasion skill and you double your proficiency bonus on checks made with that skill for the duration of the adventure. | no record for PROF; number double,pb unexplained
- `item|llk|Ioun Stone, Historical Knowledge#8` You gain proficiency in the History skill, or a +1 bonus to checks with that skill if already proficient, while this polished, steely sphere orbits your head. | number 1 no record explains
- `item|llk|Ioun Stone, Natural Knowledge#8` You gain proficiency in the Nature skill, or a +1 bonus to checks with that skill if already proficient, while this burnished, brassy stone orbits your head. | number 1 no record explains
- `item|pota|Claws of the Umber Hulk#4` You have proficiency with it, and it deals 1d8 slashing damage on a hit (your Strength modifier applies to the attack and damage rolls, as normal). | no record for PROF
- `item|thhw|Crown of Daffodils#4` While holding a fresh daffodil, that creature also gets +1 to ability checks and saving throws. | no record for PROF; number 1 unexplained
- `item|tsdm|Flamethrower#6` With Martial weapon proficiency, the DC rises to 15 at level 5, 17 at level 11, and 18 at level 17. | no record for DC,PROF; number 15 unexplained
- `item|tsdm|Logic Unit#3` Add half your Proficiency Bonus (round down) to Intelligence checks that use a skill you lack proficiency in, if your Proficiency Bonus is not already included. | number pb no record explains
- `item|tsgs|Thornpiercer#4` You gain a +2 bonus to attack and damage rolls, an extra 1d4 Piercing damage on a hit, and proficiency with the grown weapons. | number 1d4 no record explains
- `item|tsgs|Thunderous Flail#5` You are proficient, the range is 20/60 ft, it uses Strength and deals 1d8 Bludgeoning damage. | no record for PROF; number 1d8,60,20 unexplained
- `item|wdmm|Professor Orb#9` When making an Intelligence check to recall lore from any of its areas of expertise, the orb has a +9 bonus to its roll (including its Intelligence modifier). | no record for PROF; number 9 unexplained
- `species|Dwarf (Kaladesh)|Artisan's Expertise#3` On Intelligence (History) checks about the origin of architecture you count as proficient and add double your Proficiency Bonus. | number pb no record explains
- `species|Dwarf (Mark of Warding)|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | number double no record explains
- `species|Feathren|Natural Creator#3` You can gain proficiency with a new tool in half the normal time. | no record for PROF; number half unexplained
- `sub|Bard/College of Eloquence|Universal Speech#2` For 1 hour they magically understand you whatever language you speak. | no record for PROF
- `sub|Captain/Knight Errant|Chivalrous Oath#2` You gain proficiency in two of these skills: Animal Handling, History, Insight, or Persuasion. | number 2 no record explains
- `sub|Cleric/Arcana Domain (2014)|Arcane Initiate#1` You gain proficiency in Arcana and learn two cantrips from the Wizard list. | no record for PROF; number 2 unexplained
- `sub|Cleric/Knowledge Domain (PSA)|Blessings of Knowledge#2` You gain proficiency in two of these skills: Arcana, History, Nature, or Religion. | number 2 no record explains
- `sub|Vagabond/Experiment X|Mutations#3` Acid Spit: when you take the Attack action, replace one attack with a special ranged attack with a 60-ft range that you are proficient with and make using Dexterity. | no record for PROF
- `sub|Warmage/House of Bishops|Arcane Study#1` You gain proficiency in two skills of your choice from Arcana, History, Investigation, Medicine, and Religion. | no record for PROF
- `sub|Wizard/Alkemancer|Skilled Alchemist#1` You gain proficiency with Alchemist's Supplies, and your Proficiency Bonus is doubled for them. | no record for PROF; number double,pb unexplained
- `sub|Wizard/Alkemancer|Skilled Alchemist#3` You also gain proficiency with alchemical weapons and add your Proficiency Bonus to their damage rolls when you use them as weapons. | no record for DMG,PROF; number pb unexplained

## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)


### class (275)

- `class|Captain|Cohort~4#4` After an 8-hour initiation, which can happen during a Long Rest, that creature becomes your Cohort until you replace it. | angka: 8
- `class|Barbarian|Primal Champion#2` Your Strength score and your Constitution score each increase by 4, up to a maximum of 25. | angka: 4
- `class|Fighter|Three Extra Attacks#1` On your turn, taking the Attack action lets you attack four times rather than once. | angka: 4
- `class|Vagabond|Battle Tactics#15` A maneuver's save DC is 8 + your Strength or Dexterity modifier + your Proficiency Bonus. | angka: 8,pb
- `class|Warmage|Arcane Surge#1` Once on each of your turns, when you deal damage with a Warmage cantrip, you can double its damage dice, as if it were a Critical Hit. | angka: double
- `class|Healer|Empowering Tether#1` The range of your Life Tether becomes 90 feet. | angka: 90
- `class|Dancer|Four-Target Extra Attack#1` When you take the Attack action, you can attack four times if every attack targets a different creature. | angka: 4
- `class|Fighter|Tactical Mind#4` Instead, roll 1d10 and add the number to the check, which might make it succeed. | angka: 1d10
- `class|Artificer|Spellcasting#8` You know two Artificer cantrips. | angka: 2
- `class|Summoner|Eidolon#6` It also dissipates if you drop to 0 Hit Points or it ends up farther from you than 50 feet times your Summoner level. | angka: 50
- `class|Monk|Heightened Focus#2` When you spend 1 Focus Point to use Flurry of Blows, it lets you make three Unarmed Strikes rather than two. | angka: 1,3,2
- `class|Rogue|Devious Strikes#3` Daze (Cost: 2d6). | angka: 2d6
- `class|Healer|Life Tether#4` You have a pool of four d8s. | angka: 4
- `class|Alchemist|Discovery~3#4` You cannot take the same Discovery twice. | angka: double
- `class|Fighter|Tactical Shift#1` Each time your Bonus Action activates Second Wind, you can also move a distance of up to half your Speed. | angka: half
- `class|Wizard|Arcane Recovery#4` For example, a level 4 Wizard can recover up to two levels' worth of slots, regaining either one level 2 slot or two level 1 slots. | angka: 2
- `class|Martyr|Sacrifice Foe#1` When an attack or damage roll improved by Sacrifice reduces an enemy to 0 Hit Points, you take no Radiant damage from using that feature. | angka: 0
- `class|Healer|Restoring Tether#1` When you use your Life Tether on a creature, you can skip the healing and instead spend two Healer's Dice to end one of these conditions on it: Blinded, Deafened, Frightened, or Poisoned. | angka: 2
- `class|Craftsman|Fortify Arsenal#4` Up to five weapons become honed. | angka: 5
- `class|Artificer|Replicate Magic Item#14` When you die it vanishes after 1d4 days. | angka: 1d4
- `class|Witch|Familiar#16` It adds your Proficiency Bonus to its AC, saving throws, and damage rolls. | angka: pb
- `class|Monk|Heightened Focus#7` If you spend a Focus Point on Step of the Wind, you can pick a willing creature that is Large or smaller and within 5 feet of you. | angka: 5
- `class|Druid|Archdruid#11` Your body ages just one year for every ten years that go by. | angka: 10
- `class|Warden|Interrupt#2` You do this before any D20 Test is rolled for that action. | angka: 1d20
- `class|Barbarian|Improved Brutal Strike~2#7` The next attack roll another creature makes against the target before your next turn starts gains a +5 bonus. | angka: 5
- `class|Captain|Weapon Mastery#2` After a Long Rest you can change which two kinds you picked. | angka: 2
- `class|Druid|Archdruid#7` For example, converting two uses of Wild Shape creates a level 4 spell slot. | angka: 2
- `class|Barbarian|Improved Brutal Strike~2#2` At Barbarian level 13, the two effects below join your Brutal Strike options. | angka: 2
- `class|Martyr|Final Martyrdom#6` You have Advantage on all D20 Tests. | angka: 1d20
- `class|Witch|Improved Familiar#1` Your Find Familiar gets two more upgrades. | angka: 2

### feat (771)

- `feat|Greater Mark of Healing|Greater Mark of Healing#2` One ability score of your choice +1 (max 20). | angka: 1
- `feat|Arcane Undertaker|Arcane Undertaker#7` When you use the Help action to stabilize a creature with 0 Hit Points, you gain Heroic Inspiration. | angka: 0
- `feat|Boon of Fortitude|Boon of Fortitude#2` Choose an ability score and add 1 to it (maximum 30). | angka: 1,30
- `feat|Charger|Charger#6` When a melee attack roll you make during the Attack action hits a target immediately after you move at least 10 feet straight toward it, pick one effect: the attack's damage roll gets a 1d8 bonus, or  | angka: 1d8,10
- `feat|Poisoner|Poisoner#10` A creature that takes damage from the coated item makes a Constitution saving throw against a DC of 8 plus your Proficiency Bonus plus the modifier of the ability this feat increased. | angka: 8,pb
- `feat|Lich Transformation: Stage 1|Lich Transformation: Stage 1#21` That soul must come from a creature with a Challenge Rating of at least half your character level, and the vessel holds one soul at a time. | angka: half
- `feat|Aerial Expert|Aerial Expert#7` While gliding you can change direction at will, and once before you land you can gain up to 10 ft of altitude. | angka: 10
- `feat|Metabolistic Magic (Dark Matter)|Metabolistic Magic (Dark Matter)#4` The bonus is 2 plus the level of the slot. | angka: 2
- `feat|Spellblade|Spellblade#1` Raise Intelligence, Wisdom or Charisma by 1, to a maximum of 20. | angka: 1
- `feat|Gambler (Dark Matter)|Gambler (Dark Matter)#6` After three or more such rolls in a row, you can change a d20 roll to a 20. | angka: 1d20,20,3
- `feat|Soothing Familiar|Soothing Familiar#4` Positive energy fills a 5-foot Emanation originating from your familiar as long as it is within 120 feet of you. | angka: 5,120
- `feat|Clown|Clown#10` When a creature fails its save against this spell and rolls a 5 or lower on the d20, it has the Prone condition. | angka: 1d20
- `feat|Bloodlust|Bloodlust#2` Raise Strength, Dexterity, or Constitution by 1, to a maximum of 20. | angka: 1
- `feat|Dual Dragon Aspect|Dual Dragon Aspect#2` You can wear two different dragon aspects at once. | angka: 2
- `feat|Telepathic|Telepathic#2` Add 1 to your Intelligence, Wisdom, or Charisma (maximum 20). | angka: 20
- `feat|Greater Mark of Shadow|Greater Mark of Shadow#4` The die from your mark's Intuition benefit becomes a d6 instead of a d4. | angka: 1d6,1d4
- `feat|Speedy|Speedy#2` Add 1 to your Dexterity or Constitution (maximum 20). | angka: 1,20
- `feat|Heavy Glider|Heavy Glider#6` On a success you push it 10 ft away and knock it Prone. | angka: 10
- `feat|Dual Dragon Aspect|Dual Dragon Aspect#1` Two Aspects. | angka: 2
- `feat|Mist Walker|Mist Walker#10` Each time you finish a Short Rest there, you make a Constitution saving throw against DC 13 plus your Proficiency Bonus. | angka: 13,pb
- `feat|Spellfire Adept|Spellfire Adept#4` Once per turn, when a spell you cast deals Radiant damage, you can expend up to two Hit Point Dice, roll them, and add the total to one damage roll of that spell. | angka: 2
- `feat|Greater Mark of Finding|Greater Mark of Finding#6` When you cast Hunter's Mark with Finder's Magic (no slot), its range doubles. | angka: double
- `feat|Superior Shifting|Superior Shifting#1` Raise Strength, Dexterity or Wisdom by 1, to a maximum of 20. | angka: 1
- `feat|Fade Away|Fade Away#4` Raise Dexterity or Intelligence by 1, to a maximum of 20. | angka: 1
- `feat|Two-Headed|Two-Headed#5` Two Heads. | angka: 2
- `feat|Strike of the Giants|Strike of the Giants#10` A creature must succeed on a Constitution saving throw or its Speed becomes 0 until the start of your next turn. | angka: 0
- `feat|Greater Mark of Passage|Greater Mark of Passage#4` The die from your mark's Intuition benefit becomes a d6 instead of a d4. | angka: 1d6,1d4
- `feat|Demolitionist|Demolitionist#6` Your Bomb, Bottled Lightning, Concussion Grenade, Flashbang and Freeze Bomb use this save DC if it is higher: 8 plus the modifier of the ability this feat raised plus your Proficiency Bonus. | angka: 8,pb
- `feat|Vampire Transformation: Stage 1|Vampire Transformation: Stage 1#13` It deals 1d6 plus the ability modifier Piercing damage and is neither a weapon nor an Unarmed Strike. | angka: 1d6
- `feat|Chef|Chef#7` The batch feeds a number of creatures equal to your Proficiency Bonus plus 4. | angka: 4

### item (6999)

- `item|wdh|Blackstaff#7` The staff has 20 charges for the following properties. | angka: 20
- `item|egw|Will of the Talon (Dormant)#28` Poison: Area 15 ft. cone, Saving Throw Constitution. | angka: 15
- `item|sato|Mimir#6` The device has AC 22, 25 hit points, immunity to poison and psychic damage, and resistance to all other damage. | angka: 22,25
- `item|bgdia|Sword of Zariel#73` The sword sheds bright light in a 5-foot radius and dim light for an additional 5 feet. | angka: 5
- `item|erlw|Earworm#7` The earworm regains 1d4 expended charges daily at dawn. | angka: 1d4
- `item|dmg|Bane Weapon#6` It regains 1d4 charges at dawn. | angka: 1d4
- `item|tsgs|Snugglebeast (Unicorn)#2` A creature that spends a Short Rest snuggling it and also spends Hit Point Dice at the end of that rest regains an extra 2d6 Hit Points. | angka: 2d6
- `item|coa|Sage's Mirror#5` With each use, it is apparent that the information gleaned from the mirror comes from a chamber in the Nine Hells where sages and scholars are tortured for the answers to each question. | angka: 9
- `item|skt|Gurt's Greataxe#7` The axe sheds light as a torch when the temperature around it drops below 0 degrees Fahrenheit. | angka: 0
- `item|dmg|Contractor Nail#5` Once on each of your turns, if you hit a target that was already hit by a Contractor Needle this turn, it takes an extra 2d6 Radiant damage. | angka: 2d6
- `item|dmg|Mace of Smiting#4` A Construct left with 25 Hit Points or fewer by that damage is destroyed. | angka: 25
- `item|dmg|Alchemy Jug (Blue)#15` Water, salt: 12 gallons. | angka: 12
- `item|tdcsr|Kiss of the Changebringer (Awakened)#3` +1 to saving throws. | angka: 1
- `item|au|Ten Keyholes Dagger#1` Three. | angka: 3
- `item|dmg|Ring of Resistance#6` 2, a tourmaline for Cold. | angka: 2
- `item|tsgs|Potion of Dragon's Breath (Rare)#5` Crafting needs 2 hours of work per day or you roll 1d20, and on a 1 the materials are ruined. | angka: 1d20,2
- `item|egw|Mace of the Black Crown (Dormant)#2` Carrying the boon of Asmodeus, it is fit for the most powerful servants of the Nine Hells. | angka: 9
- `item|wbtw|Steel#8` It can see and hear out to a range of 60 feet. | angka: 60
- `item|dmg|Wand of Wonder#26` You don't control it, it behaves as it normally would, and it vanishes when it drops to 0 Hit Points or after 1 hour passes. | angka: 0
- `item|dmg|Rogue's Brew#2` You gain 2 Drunk levels on a fail, 1 on a success. | angka: 2,1
- `item|thhw|Shroud of Ending#3` On a fail the shroud ages you 5d10 years. | angka: 5d10
- `item|misc14|Gnomengarde Grenade#12` - The wielder rolls on the chart* for the wand of wonder three times, rerolling any duplicate results. | angka: 3
- `item|dmg|Attractor Mine#2` When you take the Attack action, you can swap one attack for throwing it at a space you see within 30 ft. It sticks firmly to any surface it touches. | angka: 30
- `item|dmg|Nithing Pole#4` When the target comes within 60 ft, the pole casts Bestow Curse on them at a range of 60 ft, with a Wisdom save DC of 15. | angka: 60,15
- `item|dmg|Bag of Beans#17` Roll 21-30: A stone statue that looks like you rises from the ground. | angka: 21,30
- `item|dmg|Hat of Vermin#5` It acts like a normal creature of its kind, and it vanishes once it drops to 0 Hit Points or 1 hour passes. | angka: 1,0
- `item|tsgs|Grip of Dendallen#10` After removal, the rot takes 1d4 days to heal. | angka: 1d4
- `item|dmg|Etheradio#5` Any message takes 10 minutes to arrive. | angka: 10
- `item|dmg|Eldritch Scarf#1` A wrinkled scarf with an extradimensional space (60 lb, 6 cubic feet) reachable only while worn. | angka: 6
- `item|dmg|Harp of Gilded Plenty#17` It has hearing and darkvision to a range of 120 feet. | angka: 120

### species (235)

- `species|Mapach|Expert Climbers#1` Climb Speed 20 feet. | angka: 20
- `species|Aarakocra (Monster)|Dive Attack#1` If you fly and dive at least 30 ft straight toward a target, then hit it with a melee weapon attack, the attack deals an extra 1d6 damage. | angka: 1d6
- `species|Minotaur (Amonkhet)|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Aarakocra (2014)|Talons#1` Your unarmed strikes with talons deal 1d4 + Strength modifier Slashing damage. | angka: 1d4
- `species|Dreamer|Age#2` They mature at 18 and live to 250. | angka: 250
- `species|Thri-kreen|Secondary Arms#1` Two smaller arms handle objects, open doors or containers, pick up Tiny objects, or wield a Light weapon. | angka: 2
- `species|Mountain Dwarf|Stonecunning#1` When you make an Intelligence (History) check about the origin of stonework, you count as proficient and add double your Proficiency Bonus. | angka: double
- `species|Lizardfolk (2014)|Bite#1` Your unarmed strikes with your bite deal 1d6 + Strength modifier Piercing damage. | angka: 1d6
- `species|Laneshi|Age#1` Laneshi mature fast, reaching adulthood around 14, and live up to 150 years. | angka: 150,14
- `species|Aven (Hawk-Headed)|Flight#1` Fly Speed of 30 ft. You cannot use it while wearing Medium or Heavy armor. | angka: 30
- `species|Ghostwise Halfling|Silent Speech#1` You can speak telepathically to one creature within 30 ft at a time. | angka: 30
- `species|Grudgel|Heritage Traits#5` You can swap any traditional trait for another from the pool, take a trait twice for its second effect, or use the traditional traits of another heritage. | angka: double
- `species|Ruinbound|Ruinbound Mutations#2` 1 Unnatural Hair. | angka: 1
- `species|Downcast|Age#2` They mature in their late teens and can reach 800 years. | angka: 800
- `species|Wrothian|Psionic Blast#4` The damage rises to 2d10 at level 5, 3d10 at level 11 and 4d10 at level 17. | angka: 2d10,1d10
- `species|Rock Gnome|Tinker#2` With 1 hour and 10 GP of materials you build a Tiny clockwork device (AC 5, 1 HP) that lasts 24 hours. | angka: 1,24,5,1
- `species|Lizardfolk (Monster)|Hold Breath#1` You can hold your breath for up to 15 minutes. | angka: 15
- `species|Ankylier|Clubbed Tail#4` From level 10, add your Proficiency Bonus to the damage. | angka: pb
- `species|Loxodon|Trunk#2` Reach 5 ft, lifts five times your Strength score in pounds. | angka: 5,5
- `species|Harengon (WBtW)|Lucky Footwork#2` You cannot use this while prone or with Speed 0. | angka: 0
- `species|Geppettin|Geppettin Construction#2` Bisque (porcelain): on your first turn in combat, a weapon attack that damages a creature deals extra damage equal to your Proficiency Bonus, of the weapon's type. | angka: pb
- `species|Jerbeen|Standing Leap#1` Your long jump is 30 feet and your high jump is 15 feet, with or without a running start. | angka: 15
- `species|Wood Elf|Trance#2` You meditate for 4 hours instead, and finish a Long Rest after that time. | angka: 4
- `species|Dhampir (VRGR)|Vampiric Bite#3` You have Advantage on the attack while you are missing half or more of your Hit Points. | angka: half
- `species|Elf (Fey)|Elven Lineage (Fey)#5` You can cast each of those two once per Long Rest without a spell slot, or with a slot of the right level. | angka: 2
- `species|Hexblood (VRGR)|Eerie Token#3` Action: enter a 1 minute trance within 10 miles to see and hear through the token, during which you are Blinded and Deafened to your own surroundings. | angka: 10
- `species|Draconblood Dragonborn|Draconic Ancestry#3` Lines (5 by 30 ft, Dexterity save): Black (Acid), Blue (Lightning), Brass (Fire), Bronze (Lightning), Copper (Acid). | angka: 5
- `species|Human (Mark of Making)|Artisan's Intuition#1` You can add a d4 to an Arcana check or an ability check with Artisan's Tools. | angka: 1d4
- `species|Half-Orc|Relentless Endurance#1` Once per Long Rest, when damage drops you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. | angka: 0
- `species|Wrothian|Psionic Blast#3` It takes 1d10 Psychic damage on a failure, or half on a success. | angka: 1d10,half

### sub (2447)

- `sub|Artificer/Reanimator|Macabre Modifications#9` The companion's Speed becomes 45 feet, and it gains a Climb Speed equal to its Speed. | angka: 45
- `sub|Monk/Warrior of the Living Weapon|Martial Form#12` When you reduce an enemy within 5 feet to 0 Hit Points, you gain Temporary Hit Points equal to one Martial Arts die roll plus your Monk level. | angka: 5,0
- `sub|Cleric/Zeal Domain (PSA)|Divine Strike#1` Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d8 damage of the same type as the weapon damage. | angka: 1d8
- `sub|Martyr/Burden of Calamity|Aura of Calamity#6` On a success it takes half damage only. | angka: half
- `sub|Fighter/Couatl Herald|Paragon#2` It gains Temporary Hit Points equal to the roll + your Charisma modifier (minimum 1) and can at once use its Reaction to move up to half its Speed without provoking Opportunity Attacks and make one we | angka: half
- `sub|Wizard/School of Illumination|Illusions of Permanence#1` Illusion spells you cast that need Concentration last 1 more round after you stop concentrating, if their full duration has not run out. | angka: 1
- `sub|Cleric/Hunger Domain|Ravening Horde#4` This lasts 3 + your Wisdom modifier rounds. | angka: 3
- `sub|Warlock/The Genie|Sanctuary Vessel#1` When you enter via Bottled Respite you can draw up to five willing creatures you can see within 30 feet in with you. | angka: 30,5
- `sub|Druid/Circle of the Land|Nature's Sanctuary#2` Choose a spot on the ground within 120 feet of you. | angka: 120
- `sub|Fighter/Nightwatcher|Skilled Guardian#2` You also gain proficiency in two skills from Deception, History, Insight, Intimidation, Investigation, Perception and Stealth. | angka: 2
- `sub|Cleric/Moon Domain (Deep Magic)|Divine Strike#1` Once on each of your turns when you hit with a weapon attack, deal an extra 1d8 cold damage. | angka: 1d8
- `sub|Summoner/Bond of the Faerie Trickster|Fey Suggestion#4` At the end of that turn the Charmed condition ends on it and it is immune to this effect for 24 hours. | angka: 24
- `sub|Druid/Circle of Oaks|Tree Walking#5` At Druid level 14 the second tree can be up to 100 ft away. | angka: 100
- `sub|Necromancer/Necrodancer|Backup Dancers#2` While at least one thrall dances, you gain a bonus to AC, damage rolls and D20 Tests that use Dexterity or Charisma, plus the benefits below. | angka: 1d20
- `sub|Sorcerer/Shadow Magic|Hound of Ill Omen#4` While it is within 5 feet of the target, the target has Disadvantage on saves against your spells. | angka: 5
- `sub|Summoner/Bond of the Shambling Plant|Absorb Nutrients#5` The damage becomes 3d8 at level 10 and 4d8 at level 14. | angka: 3d8,1d8
- `sub|Wizard/Abjurer|Abjuration Savant#1` Pick two Wizard spells of the Abjuration school, each of level 2 or lower, and add them to your spellbook at no cost. | angka: 2
- `sub|Warlock/Vestige Patron|Vestige Power#2` While you are within 30 feet of it, you have Resistance to the same damage types the vestige has. | angka: 30
- `sub|Jaeger/Sanguine Chapter|Blood Frenzy#1` While Bloodied, your Speed increases by 20 feet, the Attack action gives you three attacks, and all Hit Points you regain from Jaeger abilities are doubled. | angka: 3,double
- `sub|Paladin/Oath of the Ancients (2014)|Elder Champion#4` Enemies within 10 feet have Disadvantage on saves against your Paladin spells and Channel Divinity options. | angka: 10
- `sub|Cleric/Void Domain|Black Star#5` You and up to three creatures you choose are immune. | angka: 3
- `sub|Craftsman/Calibarons' Guild|Exotic Ammunition#9` When it hits a Large or smaller creature, fragments continue in a Line 15 feet long and 5 feet wide. | angka: 15,5
- `sub|Warmage/House of Dice|Loaded Dice#2` On a d6, the top and bottom faces add to 7. | angka: 1d6
- `sub|Fighter/Arcane Archer|Arcane Shot Options#16` Extra Slashing damage, 1 die. | angka: 1
- `sub|Rogue/Swashbuckler|Panache#4` If it is not hostile it is Charmed by you for 1 minute and regards you as a friendly acquaintance, ending if you or your allies harm it. | angka: 1
- `sub|Ranger/Drakewarden|Drake Companion#7` It remains until it reaches 0 Hit Points, you summon it again, or you die. | angka: 0
- `sub|Alchemist/Ooze Rancher|Elemental Oozes#3` When it would take that damage, it takes none and instead regains Hit Points equal to half the damage dealt. | angka: half
- `sub|Cleric/War Domain|Avatar of Battle#1` You gain Resistance against three damage types: Bludgeoning, Piercing, and Slashing. | angka: 3
- `sub|Barbarian/Path of the Fractured|Face of Rage#2` While Raging: your Unarmed Strike can use 1d8 for damage and deal Force or its normal type. | angka: 1d8
- `sub|Barbarian/Path of Spellfury|Spellcasting#3` You know two Sorcerer cantrips (a third at level 10) and prepare level 1+ Sorcerer spells, starting with three of level 1. | angka: 2,3

## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)

- record `sub|Ranger/Bounty Hunter|Perilous Dodge#2` Short or Long Rest to use again. -> covered
- record `sub|Fighter/Arcane Archer|Arcane Shot#4` Once per turn, when you make a ranged attack with a weapon that has the Ammunition property, you can apply one Arcane Sh -> covered
- record `sub|Bard/College of Glamour (2014)|Enthralling Performance#6` You regain use after a Short or Long Rest. -> covered
- record `sub|Vagabond/Adrenaline Junkie|Stim Potion#1` After a Long Rest, you can brew Stim Potions equal to your Constitution modifier. -> covered
- record `sub|Warmage/House of Roulette|Spinning Shield#4` You cannot use this again until you finish a Short or Long Rest. -> covered
- record `sub|Warden/Verdant Protector|Nature's Emissary#3` A Long Rest regains your ability to cast each one this way. -> covered
- record `sub|Fighter/Arcane Archer (2014)|Arcane Shot#2` Once per turn when you fire an arrow from a shortbow or longbow as part of the Attack action, you can apply one option. -> covered
- record `sub|Warden/Diabolist|Infernal Command#4` A Short Rest regains one expended use. -> covered
- record `sub|Warmage/House of Lancers|Flurry of Spells#3` Long Rest to use again. -> covered
- record `sub|Barbarian/Path of the Battlemind|Psionic Power#2` Regain one on a Short Rest and all on a Long Rest. -> covered
- record `sub|Investigator/Time Operative|Borrowed Time#3` You have 2 uses. -> covered
- record `sub|Ranger/Green Reaper|Envenomed Attack#3` Uses equal your Wisdom modifier (minimum 1) per Long Rest. -> covered
- record `sub|Monk/Way of Mercy|Hand of Ultimate Mercy#3` You regain use after a Long Rest. -> covered
- record `sub|Monk/Way of the Four Elements|Disciple of the Elements#8` The most ki you can spend on one spell is 3 at level 5, 4 at level 9, 5 at level 13, and 6 at level 17, counting the bas -> covered
- class `sub|Monk/Way of the Four Elements|Disciple of the Elements#8` The most ki you can spend on one spell is 3 at level 5, 4 at level 9, 5 at level 13, and 6 at level 17, counting the bas -> covered
- record `sub|Wizard/School of Transmutation|Shapechanger#2` You can cast it without a slot, but only on yourself, and only into a beast of Challenge Rating 1 or lower. -> covered
- record `sub|Dancer/Fire Dancer|Fire Breather#5` After you use this, you cannot use it again until you finish a Short or Long Rest. -> covered
- record `sub|Rogue/Infiltrator|Electromagical Burst#2` Long Rest to use again. -> covered
- record `sub|Paladin/Oath of the Ancients (2014)|Elder Champion#5` You regain use after a Long Rest. -> covered
- record `sub|Captain/Skull Banner|Sacrificial Thralls#2` After you use this, you cannot use it again until you finish a Short or Long Rest, unless you expend one Battle Die (no  -> covered
- record `sub|Witch/Fragrant Magic|Fragrant Aura#2` Once you use this, you cannot use it again until you finish a Short Rest or Long Rest. -> covered
- record `sub|Druid/Circle of the Spirits|Spirit Walk#7` Short or Long Rest to use again. -> covered
- record `sub|Ranger/Vermin Lord|Vermin Lord Spells#1` Always prepared from the listed Ranger levels: 3 Consumption. -> covered
- class `sub|Ranger/Vermin Lord|Vermin Lord Spells#1` Always prepared from the listed Ranger levels: 3 Consumption. -> covered
- record `sub|Wizard/Gastronomer|Heroic Snacks#4` Long Rest to use again. -> covered
- record `sub|Rogue/Highway Rider|Trusty Mount#3` Long Rest to use again. -> covered
- record `sub|Investigator/Antiquarian|Arcane Relics#1` Once you use a relic, you cannot use this feature again until a Short or Long Rest. -> covered
