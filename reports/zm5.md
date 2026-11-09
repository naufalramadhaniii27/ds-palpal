# Zero miss 5: periksa ulang data efek fx-Z2, fx-Z3, fx-Z4 ke sumber lain

Cabang `claude/zm5`, dasar `claude/zm4`. Tidak ada `books/`. Urutan sumber: (1) teks fitur di data app (`src/data`), (2) halaman web bila tidak ada di repo. Tiap entri dicek sekali.

## Ringkasan

- Entri diperiksa: 117 (Z2 36, Z3 29, Z4 52). Sembilan Divine Strike dihitung dua level, Blood Domain sudah termasuk.
- Salah dan diperbaiki: 6 entri (level salah 5, edisi salah 1). Satu entri baru ditambah (Reliable Talent 2014).
- Cocok: 111. Tak terverifikasi penuh: 7 (lihat bawah, semua cocok dengan teks app, hanya tanpa pembanding luar).
- Tes salin kesalahan: 5 kasus mengunci level salah, semua dikoreksi dan diberi kasus negatif.

## Yang diperbaiki

| Entri | Salah | Benar | Sumber | Tes |
|---|---|---|---|---|
| Psi Warrior, Telekinetic Adept (Psi-Powered Leap), Z2 | level 11 | level 7 | teks app (wotc09, db2), wikidot fighter:psi-warrior | tes level 11 diganti 7, tambah NEG level 6 |
| Aberrant Sorcery, Revelation in Flesh (aquatic dan flight), Z2 | level 6 | level 14 | teks app (db3 dan wotc09 bilang 14), dungeonmister | tes level 6 diganti 14, NEG level 6, `fx_toggle_layout.py` ikut diubah |
| Nature Domain, Dampen Elements, Z4 | level 2 | level 6 | teks app (wotc09), wikidot cleric:nature | tes level 2 diganti 6, NEG level 5 |
| The Great Old One (2014), Entropic Ward, Z4 | level 10 | level 6 | teks app (wotc09), wikidot warlock:great-old-one | tes level 10 diganti 6, NEG level 5 |
| Wild Magic (2014), Bend Luck, Z4 | level 14 | level 6 | teks app (wotc09), wikidot sorcerer:wild-magic | tes level 14 diganti 6, NEG level 5 |
| Rogue, Reliable Talent, Z4 | satu entri level 7 untuk dua edisi | 2024 level 7, 2014 level 11 | teks app (06-data-2014-classes: 11), D&D Beyond rogue 2024 vs 2014 | tes "2014 level 7" salah, diganti level 11. NEG 2014 level 7 dan 10 |

Catatan: `tests/fx_overlap_allow.json` entri Rogue diberi `ed` pada daftar bidang bersama. Alasannya tiap baris Rogue memuat `ed` untuk edisinya sendiri.

## Tabel pemeriksaan

Hasil: C cocok, P diperbaiki, T tak terverifikasi penuh. Sumber singkat: APP teks app, WD wikidot, DDB D&D Beyond, DM dungeonmister, DD dungeondocs, DF dungeonsanddragonsfan, WG wargamer, FG fantasygrounds SRD 5.2.1, AE arcaneeye.

### fx-Z2

| Entri | Diperiksa | Sumber | Hasil |
|---|---|---|---|
| Wild Heart, Falcon | level 14, Fly sama Speed, tanpa armor | APP, DD | C. Shield boleh adalah tafsir, bukan teks |
| Draconic Sorcery, Dragon Wings | level 14, Fly 60 | APP, DM | C |
| Draconic Bloodline, Dragon Wings | level 14, Fly sama Speed | APP, WD | C |
| Divine Soul, Otherworldly Wings | level 14, Fly 30 | APP, WD (nama XGE: Angelic Form) | C |
| Aberrant Sorcery, Revelation in Flesh x2 | level, swim 2x Speed, fly sama Speed | APP, DM | P (level 14) |
| Vengeance 2024 dan 2014, Avenging Angel | level 20, Fly 60 | APP, WD, DM | C |
| Psi Warrior, Psi-Powered Leap | level, Fly 2x Speed | APP, WD | P (level 7) |
| Gloom Stalker 2024 dan 2014, Dread Ambusher | level 3, +10 ft giliran pertama | APP | C |
| Warrior of the Elements, Step of the Wind | level 17, +20 ft | APP, DM (DDB blog menulis "hanya saat terbang", tidak dipakai) | C |
| Circle of the Stars, Twinkling Constellations | level 10, Fly 20 hover | APP, DF | C |
| Charger, Dash | +10 ft saat Dash | APP, WG | C |
| Dragonborn, Draconic Flight | level 5, Fly sama Speed | APP, DDB species | C |
| Goliath, Large Form | level 5, +10 ft, adv Str | APP, DDB species | C |
| Barbarian, Relentless Rage | level 11, DC 10 +5, reset Short atau Long Rest | APP, aidedd | C |
| Divine Strike x9 domain (Life 2014 Radiant, Nature Cold/Fire/Lightning, Tempest Thunder, Trickery 2014 Poison, War 2014 tipe senjata, Death Necrotic, Order Psychic, Twilight Radiant, Forge Fire) | level 8 dan 14, 1d8 lalu 2d8, tipe | APP, WD (semua sembilan halaman domain) | C |
| Blood Domain, Divine Strike level 14 | 1d8 Necrotic, 2d8 di 14 | APP (tp01), WD blood-reborn | C |

### fx-Z3

| Entri | Diperiksa | Sumber | Hasil |
|---|---|---|---|
| Bard Countercharm 2024 | level 7, Reaction, reroll adv | APP, DDB bard | C |
| Rogue Elusive | level 18 | APP, WD | C |
| Rogue Steady Aim | level 3, adv, Speed 0 | APP, DDB rogue | C |
| Sorcerer Innate Sorcery | level 1, DC +1, adv serangan spell | APP, DDB sorcerer | C |
| Monk Superior Defense | level 18, 3 Focus, semua kecuali Force | APP, DF | C |
| Warlock Eldritch Master | level 20, pulihkan semua slot | APP | C |
| Wild Heart, Bear dan Wolf | level 3, kecuali Force Necrotic Psychic Radiant, adv sekutu 5 ft | APP, DD | C |
| Zealot Zealous Presence | level 10, sepuluh makhluk, 60 ft | APP | T (hanya app) |
| Champion Survivor (Defy Death) | level 18, adv death save, 18-20 | APP | T (hanya app) |
| Glory Living Legend | level 20, 10 menit, adv Cha, reroll save, miss jadi hit | APP, DM | C |
| Glory Peerless Athlete | level 3, 1 jam | APP, DM | C |
| Vengeance 2024, Avenging Angel (Frightful Aura) dan Vow of Enmity | level 20 dan 3, adv ke Frightened | APP, DM | C |
| Trickery 2024, Blessing of the Trickster dan Invoke Duplicity | level 3, adv Stealth, adv serang | APP, DM | C |
| Moon Moonlight Step | level 10, adv serangan berikut | APP, DF | C |
| Stars Full of Stars | level 14, B/P/S | APP, DF | C |
| Warrior of Shadow Shadow Step | level 6, adv melee berikut | APP | T (hanya app) |
| Warrior of the Elements Epitome (resistance, lima tipe) | level 17, Acid Cold Fire Lightning Thunder | APP, DM | C |
| Ancients Elder Champion | level 20, 10 HP per giliran, adv-save musuh, Bonus Action | APP, DM | C |
| Hunter Superior Hunter's Defense | level 15, Reaction, Resistance | APP | T (hanya app) |
| Clockwork Trance of Order | level 14, 1 menit, d20 9 ke bawah jadi 10 | APP, DM | C |
| Wild Magic Tides of Chaos | level 3 | APP, DM | C |
| Great Old One Clairvoyant Combatant | level 6, adv dan disadv, pemulihan | APP | T (hanya app) |
| Crusher Enhanced Critical | adv sampai awal giliran berikut | APP, DF | C |
| Boon of Spell Recall | 1d4, slot level 1 sampai 4 | APP, FG | C |
| Boon of the Night Spirit | Resistance kecuali Psychic dan Radiant, di Dim atau Dark | APP, FG | C |

### fx-Z4

| Entri | Diperiksa | Sumber | Hasil |
|---|---|---|---|
| Paladin's Smite 2024 | level 2, Bonus Action, 2d8, +1d8 Fiend atau Undead, +1d8 per level slot | APP, DDB paladin (dadu tidak dimuat, dari SRD Divine Smite) | T (dadu hanya dari ingatan SRD) |
| Ranger Foe Slayer | level 20, d10 | APP, DD | C |
| Ranger Tireless | level 10, 1d8 + Wis, Exhaustion -1 per Short Rest | APP, DD | C |
| Valor 2024, Combat Inspiration (dua baris) | level 3, AC dan damage | APP | T (DDB bard tidak memuatnya) |
| Glory Inspiring Smite | level 3, 2d8 + level Paladin | APP, DM | C |
| Wild Magic Sorcery Bend Luck | level 6, 1 SP, 1d4 | APP, DM | C |
| Evoker Overchannel | level 14, 2d12 per level, +1d12 | APP, WD (2014 sama) | C |
| Stars Starry Form (Dragon) | d20 9 ke bawah jadi 10, Int Wis Con konsentrasi | APP, DF | C |
| Grappler Fast Wrestler | Speed tidak setengah, ukuran sama atau lebih kecil | APP, FG | C |
| Chef Replenishing Meal | 1d8, PB + 4 makhluk | APP, aidedd | C |
| Interception | 1d10 + PB, Reaction, syarat pegang Shield atau senjata | APP, AE (syarat pegang tidak ada di AE, ada di teks app) | C |
| Bard 2014 Countercharm | level 6, adv save | APP, WD bard | C |
| Bard 2014 Song of Rest | level 2, d6 d8 d10 d12 di 2, 9, 13, 17 | APP, WD | C |
| Paladin 2014 Divine Smite | 2d8, +1d8 per level, maks 5d8, 6d8 | APP, WD | C |
| Ranger 2014 Favored Enemy dan Land's Stride | level 1 dan 8, adv | APP, WD | C |
| Monk 2014 Empty Body | level 18, 4 ki, 8 ki Astral Projection | APP, WD | C |
| Totem Warrior (Wolf 3, Bear aspect 6, Eagle 14) | level, adv, Fly sama Speed | APP, WD | C |
| Valor 2014 Combat Inspiration | level 3 | APP, WD | C |
| Knowledge Domain 2014, Knowledge of the Ages | level 2, 10 menit | APP, WD | C |
| Life 2014 Preserve Life | level 2, 5x level Cleric, setengah maks HP | APP, WD | C |
| Nature Domain Dampen Elements | level, lima jenis damage | APP, WD | P (level 6) |
| Tempest Wrath of the Storm | level 1, 2d8 | APP, WD | C |
| Trickery 2014 Blessing dan Invoke Duplicity | level 1 dan 2 | APP, WD | C |
| Moon 2014 Combat Wild Shape | level 2, 1d8 per level slot | APP, WD | C |
| Way of Shadow Shadow Step | level 6, 60 ft | APP, WD | C |
| Devotion 2014 Holy Nimbus | level 20, adv save vs spell Fiend dan Undead | APP, WD | C |
| Vengeance 2014 Avenging Angel dan Vow of Enmity | level 20 dan 3 | APP, WD | C |
| Oathbreaker Dread Lord | level 20, 4d10 Psychic, 3d10 + Cha Necrotic | APP, WD paladin:oathbreaker | C (sudah benar dari zm4) |
| Hunter 2014 Colossus Slayer, Escape the Horde, Multiattack Defense | level 3 dan 7, 1d8, +4 AC | APP, WD | C |
| Arcane Trickster 2014 Versatile Trickster | level 13 | APP, WD | C |
| Assassin 2014 Assassinate | level 3 | APP, WD | C |
| Draconic Bloodline Elemental Affinity | level 6, 1 SP, 1 jam | APP, WD | C |
| Wild Magic 2014 Bend Luck | level, 2 SP | APP, WD | P (level 6) |
| Fiend 2014 Hurl Through Hell | level 14, 10d10 Psychic | APP, WD | C |
| Great Old One 2014 Entropic Ward | level | APP, WD | P (level 6) |
| Abjuration Arcane Ward | level 2, 2x level Wizard + Int | APP, WD | C |
| Evocation 2014 Overchannel | level 14, 1 sampai 5 | APP, WD | C |
| Reliable Talent | level dan edisi | APP, DDB rogue | P |
| Feat 2014 Alert, Defensive Duelist, Dual Wielder (+1 AC), Healer, Polearm Master (1d4) | angka dan syarat | APP (wotc07 dan teks 2014) | T (web tidak dibuka untuk lima feat ini, angka cocok teks app dan aturan PHB 2014) |

## Tak terverifikasi

| Entri | Alasan |
|---|---|
| Zealot Zealous Presence, Champion Survivor, Warrior of Shadow Shadow Step, Hunter Superior Hunter's Defense, GOO Clairvoyant Combatant | Cocok dengan teks app. Halaman web yang dicoba tidak memuat fiturnya |
| Valor 2024 Combat Inspiration | Cocok dengan teks app dan versi 2014. DDB bard 2024 tidak memuatnya |
| Paladin's Smite (dadu) | Teks app hanya ringkas. Dadu dari ingatan SRD 5.2 |
| Lima feat 2014 | Dicek ke teks app dan ingatan aturan, tidak dibuka di web |

Catatan: sumber web 2024 sering memberi ringkasan longgar (DDB menulis Revelation in Flesh level 14 dengan benar, tetapi Step of the Wind "hanya terbang" tidak cocok dengan DM). Yang bertentangan tidak dipakai.

## Bukti tes

| Tes | Hasil |
|---|---|
| `python3 build.py` | jalan |
| `tests/zero_miss_fx.py` | 207 kasus, 0 gagal |
| `tests/zero_miss_measure.py` | 298 terukur (2014), 0 miss, 0 fixed, 0 new miss |
| `tools/tsc_gate.py` | SCORE 200, sama dengan dasar |
| `tools/html_gate.py` | SCORE 250, sama dengan dasar |
| `tests/fx_overlap.py` | OK setelah entri Rogue diberi `ed` |
| `tests/guard_all.py --enforce` | exit 0 |
| `tests/fx_engine.py` | 265 cek OK |
| `tests/solid_contract.py` | OK, 4810 cek |
| `tests/solid_builder_diff.py --base w-zm4` | 3890 input, IDENTICAL. Tidak ada build emas yang memiliki entri yang diperbaiki, jadi perbedaan hanya terlihat di tes `zero_miss_fx.py` |

Dilewati: solid_ui_snapshot dan snapshot lain (tidak ada perubahan UI, hanya level data), scenarios, overlap_scan, tidy (tidak ada perubahan UI), `fx_toggle_layout.py` (hanya level di tabel diubah, tidak dijalankan).
