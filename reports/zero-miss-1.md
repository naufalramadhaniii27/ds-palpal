# Zero miss 1: Pact of the Blade dan senjata DMG 2024

Branch `claude/zero-miss-1`, basis `origin/main` 3c960c85. Tafsir aturan: `reports/rules-notes.md`. Permintaan ke bagian lain: `reports/zero-miss-1-requests.md`.

## clause_gate sebelum dan sesudah

Sebelum = `python3 tests/clause_gate.py` di origin/main (baseline yang ter-commit di main menulis 6146 dan 3493, hasil jalan ulang di main 6143 dan 3494).

| Ukuran | Sebelum | Sesudah | Selisih |
|---|---|---|---|
| Uncovered | 6143 | 6128 | -15 |
| Numbers unexplained | 3494 | 3479 | -15 |
| Covered | 7039 | 7055 | +16 |
| Info | 23599 | 23598 | -1 |

| Kelas | Sebelum | Sesudah |
|---|---|---|
| RESOURCE | 1305 | 1305 |
| SPELL | 838 | 838 |
| DMG | 785 | 770 |
| PROF | 562 | 562 |
| SPEED | 518 | 518 |
| ADV | 426 | 426 |
| RES | 408 | 408 |

Baseline `tests/clause_gate_baseline.json` dan `reports/clause-gate-report.md` diperbarui karena hitungan turun. clause_gate tidak punya opsi `--update-baseline`, alat ini selalu menulis ulang keduanya.

Efek Pact of the Blade tidak terlihat di angka ini: invocation Warlock tidak masuk semesta clause_gate (permintaan 4 ke Checker). Buktinya ada di `tests/zero_miss_fx.py`.

## Fitur yang ditutup

| Fitur | Sebelum | Sesudah | File |
|---|---|---|---|
| 2024 Pact of the Blade, jenis damage | Hanya catatan "can deal Necrotic, Psychic, or Radiant" | Pilihan builder `B.ch.pactDmg` (opsional, kunci baru di `B.ch`, data lama tidak berubah). Baris pact weapon memakai jenis yang dipilih, catatan menyebut jenis lain | 09b, 12h |
| 2024 Pact of the Blade, Spellcasting Focus | Tidak ada | Catatan di baris | 12h |
| 2024 Lifedrinker | "spend a Hit Point Die to heal" | Angka pulih: 1d8+2 (Hit Point Die + CON, minimal 1). Multiclass: "the die roll + CON" | 12i |
| 2024 Thirsting/Devouring Blade | Teks aksi Attack mengulang "Make one attack." | Diperbaiki | 12k |
| 2014 Pact of the Blade | Pact weapon memakai Charisma dan catatan jenis damage 2024 | Tanpa Charisma, kecuali subclass The Hexblade (Hex Warrior). Catatan 2014: magis untuk resistance | 12h |
| 2014 Improved Pact Weapon | +1 tidak dihitung | +1 to hit dan damage bila senjata tidak punya bonus magis, focus di catatan | 12h |
| 2014 Lifedrinker | Baris 2024 (1d6 N/P/R) ikut tampil | Necrotic sebesar CHA mod, minimal 1 | 12i |
| 2014 Eldritch Smite | Catatan 2024 | Catatan 2014 (warlock spell slot), rumus 1d8 + 1d8 per level slot sama | 12i |
| 16 baris senjata DMG 2024 (15 item) | Tidak ada catatan extra damage | `atkDice` di baris serangan item: Axe of the Dwarvish Lords (2), Dragon Slayer, Dwarven Thrower, Executioner's Axe, Flame Tongue, Holy Avenger, Mace of Smiting, Staff of Thunder and Lightning, Sun Blade, Sword of Kas, Sword of Life Stealing, Vorpal Sword, Wand of Orcus, Wave, Whelm | data/fx-Z1.js (baru, di blok fxd) |
| Varian item magis | Baris GX.item dengan nama item tidak aktif untuk varian ("Flame Tongue (Rapier)"), `when` nama item tidak cocok dengan baris varian | Varian membaca baris itemnya. Pencocokan baris lewat helper kecil `rowHit` | 03 (activeFx), 11b, 12l |

Perubahan engine: 4 handler baru kecil via `registerSheetRule` (`improved-pact-weapon-2014`, `pact-blade-damage-type`, `pact-blade-damage-rows`, dan `pact-blade-note` ditulis ulang), satu baris pilihan di `chWarlock`, satu ekspresi di `activeFx`, satu di sumber fx items, helper `rowHit` dikeluarkan dari `pickRowsOf` (agar `guard_size` tidak naik). Tidak ada fungsi besar yang diubah.

## Tes yang ditambah

`tests/zero_miss_fx.py` (21 kasus, satu halaman browser, sekitar 1 menit dengan `--base`):
- per efek: karakter minimal lewat `__bldTestB` dan `__bldSheetFor`, nilai yang diharapkan di `C.attacks`, `C.xdmg`, `C.actions`;
- dengan dan tanpa fitur: hanya path yang dinyatakan boleh berubah;
- `--base DIR`: build yang sama di origin/main, hanya path yang dinyatakan boleh berbeda;
- 4 contoh negatif (senjata kedua di samping pact weapon, Lifedrinker 2024 tidak ikut berubah, `Longsword, +1` tanpa catatan rider, Dwarven Thrower tanpa attunement);
- 4 tes varian item × Pact of the Blade (`Longsword, +1`, `Longsword, Masterwork`, `Flame Tongue (Longsword)`, Improved Pact Weapon 2014 pada senjata +1).

Hasil: 21 kasus, 0 gagal.

## Bukti

| Bukti | Hasil |
|---|---|
| Snapshot `tests/solid_snapshot.py` main vs branch | 2997 build, 3 berubah: `fx_L5_sword_of_kas`, `fx_L5_thunder_staff`, `fx_M1_sun_blade_finesse`. Ketiganya memakai item yang mendapat catatan rider baru. Tidak ada build Pact of the Blade di golden dan invariants |
| golden_builds | OK, 1479 cek. Tidak ada nilai emas yang diubah (yang berubah hanya catatan, golden tidak memeriksanya) |
| fx_engine, solid_contract, solid_data_contract, solid_ui_contract | OK (265, 4801, 563, 308 cek) |
| invariants | OK, 2220 build, 0 pelanggaran |
| scenarios | 24 cek lulus. localStorage tiga skenario di dua viewport identik dengan main (`compare_storage`: 6 file, 0 beda) |
| csp_check, names_lint, version_label, e2e_fx_toggle | Lulus |
| guard_all --enforce | exit 0, 0 pelanggaran baru |
| tsc_gate | 217 error, sama dengan main, tidak ada file WORSE |
| html_gate | 250, sama dengan baseline |
| Tampilan Warlock 12 Blade (Longsword pilihan Radiant, Flame Tongue (Rapier)) di 390x844 dan 1250x850 | Baris Longsword "Pact Weapon, 1d8+4 Radiant", Eldritch Smite 6d8 Force, Lifedrinker 1d6. Tidak ada overlap, lebar dokumen sama dengan viewport. Satu baris meluap: tipe Lifedrinker "Necrotic or Psychic or Radiant", sudah sama di main (bukan dari perubahan ini) |

## Triage Z0 kelas DMG (buku inti 2024)

| Kelompok | Jumlah | Tindakan |
|---|---|---|
| Rider senjata DMG 2024 yang bisa dihitung (catatan di baris) | 16 baris | Ditutup (fx-Z1.js) |
| Sudah dihitung sheet tetapi FDMG memakai nama sub-bagian fitur (Colossus Slayer di Hunter's Prey, Improved Lunar Radiance di Lunar Form, Dreadful Strike di Stalker's Flurry, Dreadful Strikes kalimat kedua) | sekitar 6 kalimat | False positive gate, permintaan 3 ke Checker |
| Efek ke makhluk lain atau keputusan meja (Wild Magic Surge, Bestial Fury, Create Thrall, Blackrazor, Sphere of Annihilation, Horn of Blasting) | sebagian besar sisa item | Tetap info, tidak dipaksa |
| Butuh model baru (Charger 1d8 setelah bergerak 10 ft, Unarmed Fighting 1d4 ke target yang di-grapple, Boon of Energy Resistance reaksi 2d12+CON dengan DC, Arcane Jolt 2d6 ke 4d6) | sekitar 6 | Putaran berikut. Bisa lewat FDMG (baris aksi damage) tanpa engine baru, belum dikerjakan karena waktu |

RESOURCE, PROF, SPEED, ADV, RES belum dikerjakan di putaran ini. Dari daftar RESOURCE buku inti (70 kalimat), sebagian besar adalah aturan istirahat dan tukar slot (Font of Magic, Wild Resurgence, Holy Nimbus pulih lewat slot level 5) yang sudah punya baris resource di sheet atau memang keputusan main.

## Dilewati, dengan alasan

| Hal | Alasan |
|---|---|
| Tombol ganti jenis damage per serangan di sheet | Milik UI (permintaan 1) |
| Pact weapon ranged untuk Improved Pact Weapon 2014 | Fungsi `pactList` dan rule active weapon, wilayah SOLID s16 (permintaan 2) |
| Halaman free rules D&D Beyond dan aidedd.org | Ditolak jaringan (izin URL tidak dijawab, robots). Tafsir mengikuti RAW teks data, tercatat "belum diputuskan resmi" bila ambigu |
| Folder `books/` | Tidak ada di repo dan mesin kerja |

## Catatan audit

- Paket homebrew `data/hb` (997 file): tidak dihitung clause_gate maupun mech_scan. Paket itu hanya baris teks rujukan (`n, s, sub, tl, p, tx`) yang dimuat lewat `fetch` saat sumbernya dinyalakan (`wxHbLoad`, `27b-ui-library.js`), bukan record efek. Bila dipindai, hampir semua kalimat berangkanya akan uncovered. Sumber pihak ketiga di `src/data/tp*.js` dan homebrew bawaan (`hbpack-builtin-homebrew.js`) sudah dihitung (tabel per buku: tvss, tsgs, tkdm, dan seterusnya).
- Kalimat info berangka yang menurut saya keliru: tidak diaudit sistematis di putaran ini. Satu temuan terkait: baris FDMG invocation (Eldritch Smite, Lifedrinker) dipakai juga untuk karakter 2014 tanpa pemisah edisi, jadi Lifedrinker 2014 tampil dengan angka 2024. Sudah diperbaiki lewat handler, FDMG belum punya kolom edisi.
- Skema `claude/skema-zero-miss-20261109.md` di Projects tidak bisa dibaca dari sesi ini (tidak ada alat project_read). Yang diikuti adalah ringkasan di pesan koordinator.
