# Zero miss 2: kelas RESOURCE, PROF, SPEED

Cabang `claude/zero-miss-2`, basis `origin/main` 0a708f50. Tafsir aturan: `reports/rules-notes.md` bagian "Zero miss 2". Permintaan ke bagian lain: `reports/zero-miss-2-requests.md`. Data baru: `src/data/fx-Z2.js` (file baru, di manifest sesudah `fx-Z1.js`). Perubahan lain: `src/data/fx-N1.js` (hapus pilihan skill dobel), 11 file golden, `tests/zero_miss_fx.py`.

## Hasil singkat

| Hal | Jumlah |
|---|---|
| Kalimat SPEED yang kini punya model (toggle) | 15 |
| Kalimat RESOURCE yang kini punya model | 12 (Relentless Rage 2, Divine Strike 9 domain, Blood Domain level 14 satu) |
| Kalimat PROF yang kini punya model baru | 0 |
| Cacat PROF diperbaiki (dua proficiency untuk aturan satu skill) | 11 sumber (9 subclass, 2 feat) |
| Kasus baru di `tests/zero_miss_fx.py` | 44 (satu per kalimat, ditambah 4 contoh negatif) |

Total kalimat ditutup dengan model baru: 27. Pada PROF tidak ada celah model baru. Sebelas subclass dicek langsung di sheet (Alchemist, Armorer, Artillerist, Battle Smith, Cartographer, Swords, Mercy, Drunken Master, Mastermind, Scout, Kensei) dan semua proficiency sudah dihitung lewat data kelas. Kalimat PROF di gate hampir seluruhnya false positive (permintaan 1 ke Checker).

## Z0: pilah

Sumber: `tests/clause_gate.py` (cache data lokal), kalimat uncovered kelas RESOURCE, PROF, SPEED di buku inti 2024 (`core`), PHB 2014, XGE. Hasil pilah:

| Kelompok | Jumlah kira-kira | Tindakan |
|---|---|---|
| Sudah dihitung sheet lewat mekanisme lain (data kelas, SUB_GRANT, pilihan builder, handler sheet, baris item dengan `rg`) | sebagian besar PROF dan RESOURCE item | False positive gate, permintaan 1 sampai 4 |
| Bentuk sementara yang memberi Speed atau mode gerak | 15 | Diisi, toggle |
| Muatan dan penghitung yang hilang | 3 (Relentless Rage x2, Blood Domain) | Diisi |
| Extra damage domain Cleric yang hilang | 9 domain | Diisi |
| Dua pilihan skill untuk satu aturan | 11 sumber | Dibetulkan |
| Aturan tukar slot dan Sorcery Points, gerak setengah Speed, keputusan meja | puluhan | Tetap info, tidak dipaksa |
| Butuh model baru (Elixir of Flight menurut level, Totem Eagle 2014 butuh kunci pilihan) | 2 | Putaran berikut |

## Perubahan

| Fitur | Sebelum | Sesudah |
|---|---|---|
| 15 bentuk Speed (Falcon, Dragon Wings 2024 dan 2014, Otherworldly Wings, Revelation in Flesh dua toggle, Avenging Angel 2024 dan 2014, Telekinetic Adept, Dread Ambusher, Elemental Epitome, Dragon konstelasi, Charger, Draconic Flight, Large Form) | Tidak ada di sheet | Toggle mati bawaan. Menyala: Fly, Swim, atau tambahan Speed muncul di `speedSrc` dan `moves` |
| Relentless Rage (Barbarian 11) | Hanya catatan | Baris resource 4 kotak, DC 10 plus 5 per pakai |
| Divine Strike domain Cleric (Life, Nature, Tempest, Trickery, War, Death, Order, Twilight, Forge) | Tidak ada di baris senjata | Catatan 1d8 di baris senjata, level 14 dua dadu 1d8 |
| Blood Domain level 14 | Hanya satu dadu | Dua dadu |
| Pilihan skill dobel (Nature, Order, Peace, Apocalypse, Darkness, Mountain, Travel, Cavalier, Samurai, Squat Nimbleness, Inspirational Caster) | Pemain memilih dua, sheet memberi dua proficiency | Satu pilihan |

Tanpa perubahan engine. Hanya data (`fx-Z2.js`, `fx-N1.js`) dan field yang sudah ada di skema (toggle, mv, speedAdd, advOn, defs, lu, atkDice, cond).

Sheet lama dengan dua pilihan skill: nilai pilihan kedua tetap tersimpan di `B.ch` (kunci `gx-sk-...`), tidak dipakai lagi, tidak dihapus. Tidak ada kunci localStorage atau bentuk data tersimpan yang diubah. Konsekuensinya satu skill proficiency hilang dari sheet lama itu, dan itu memang yang aturan minta.

## clause_gate sebelum dan sesudah

Sebelum = jalan ulang di cabang sebelum perubahan (baseline yang ter-commit di main sudah lama: 6128 dan 3479).

| Ukuran | Sebelum | Sesudah | Selisih |
|---|---|---|---|
| Uncovered | 6133 | 6120 | -13 |
| Numbers unexplained | 3484 | 3465 | -19 |
| Covered | 7011 | 7037 | +26 |
| RESOURCE | 1308 | 1307 | -1 |
| PROF | 562 | 562 | 0 |
| SPEED | 518 | 506 | -12 |

Hitungan kecil karena gate tidak membaca sheet. Contoh: Divine Strike dan Relentless Rage tertutup di sheet tetapi gate tidak melihat `atkDice` pada kelas RESOURCE dan tabel `calcNote` (permintaan 2 ke Checker). `tests/clause_gate_baseline.json` dan `reports/clause-gate-report.md` ditulis ulang karena hitungan turun.

## Bukti tes

| Tes | Hasil |
|---|---|
| zero_miss_fx --base (build origin/main) | 65 kasus (21 putaran 1, 44 baru), 0 gagal. Baru: 17 SPEED (15 kalimat, negatif Plate Armor, negatif Goliath level 4), 3 Relentless Rage (dua kalimat, negatif level 10), 12 Divine Strike (9 domain, level 14 Life, Blood level 14, negatif level 7), 12 skill dobel (9 subclass, 2 feat, 1 sheet lama dengan dua pilihan Samurai). Tiap kasus mengecek nilai, lalu mengecek bahwa hanya path yang dinyatakan boleh berubah dibanding build yang sama tanpa toggle dan dibanding origin/main |
| fx_engine | OK, 265 cek |
| guard_all --enforce | exit 0, 0 pelanggaran baru |
| scenarios | 24 cek lulus, tiga skenario di 390x844 dan 1250x850 |
| golden_builds | OK, 1479 cek. Dua belas golden gagal sesudah penghapusan pilihan dobel, sebelas diubah (kunci pilihan `gx-sk-...` diganti kunci pilihan yang tetap ada, nilai harapan sama). Woodwise dikembalikan, lihat catatan |
| solid_contract | Tidak selesai (dihentikan, jalan lebih dari 15 menit karena mesin dipakai agen lain). Skema entri dijaga tangan: semua field di `fx-Z2.js` ada di `10e-logic-fx-schema.js` |
| Tampilan 390x844 dan 1250x850 dengan toggle baru | Tidak dites. Sheet hanya mendapat baris toggle dan baris catatan. Permintaan 5 ke UI/UX |

Catatan Woodwise: pilihan bawaan di data feat (`tp15-thhw.js`) tidak memberi proficiency, pilihan di `fx-N1.js` satu-satunya yang bekerja. Penghapusan pertama merusak golden Woodwise, jadi pilihan N1 Woodwise dikembalikan dan cacat data dicatat (permintaan 8).

## Build yang berubah (tests/solid_snapshot.py, jalan satu kali, main vs cabang)

2997 build, total hash berbeda. Snapshot jalan sebelum pilihan Woodwise dikembalikan, jadi hasil akhir satu lebih sedikit (golden `fx_N1_feat_woodwise_skill_pick` kembali sama dengan main, dicek lewat golden_builds). Jumlah yang berbeda saat snapshot: 85.

| Kelompok | Jumlah | Penyebab | Diharapkan |
|---|---|---|---|
| Invariants Barbarian level 20 (semua subclass dan Path) | 33 | Baris resource Relentless Rage | Ya |
| Invariants Cleric (level 20 dan level 3) | 19 | Divine Strike di baris senjata (level 20), pilihan skill dobel hilang (level 3: Apocalypse, Darkness, Mountain, Nature, Travel) | Ya |
| Invariants Ranger, Sorcerer, Paladin, Druid, Fighter, Monk | 13 | Toggle baru (daftar `fxToggles` berubah) | Ya |
| Invariants species Dragonborn dan Goliath level 10 | 2 | Toggle baru | Ya |
| Golden: 11 file `fx_N1_*_pick` | 11 | Kunci pilihan dobel dihapus, golden diubah ke kunci yang tetap ada | Ya |
| Golden: `fx_C_multiscale_second_resistance`, `fx_v3a_multiscale_breath_dice`, `fx_N1_sub_zealot_rage_of_gods` (dan `_off`) | 4 | Barbarian level 11 atau lebih: baris Relentless Rage | Ya |
| Golden: `fx_L11_spell_psi_warrior24` | 1 | Toggle Psi-Powered Leap | Ya |
| Golden: `fx_N1_sp_goliath_build_adv` | 1 | Toggle Large Form | Ya |
| Golden: `fx_N1_feat_woodwise_skill_pick` | 1 | Tercatat di snapshot, kini sama dengan main | Ya (dikembalikan) |

## Dilewati, dengan alasan

| Hal | Alasan |
|---|---|
| Folder `books/` | Tidak ada di repo dan mesin kerja. Halaman PHB 2024 dari `BOOKPG`, 2014 dan XGE dari teks data |
| Skema dan rancangan di Project (`project_read`) | `project_read` tidak tersedia di sesi ini. Dibaca: salinan `rancangan-effect-record-ci-gate-20261105.md` di scratchpad. `skema-zero-miss-20261109.md` tidak ditemukan. Yang diikuti: skema fx yang ada di `10e-logic-fx-schema.js` dan pola putaran 1 |
| Toggle di UI | Milik UI (permintaan 5) |
| Elixir of Flight (Alchemist), Totem Eagle 2014, ukuran Large di Large Form | Butuh pilihan atau aturan sheet baru. Putaran berikut |
