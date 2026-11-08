# SOLID tahap 13C: sisa builder dan perekam efek fx

Basis: origin/main a01bcd20. Cabang: claude/solid-s13c.

## Bagian 1: src/builder

| Blok | Sebelum | Sesudah |
|---|---|---|
| IIFE subclass di `fromSheet` (15) | 81 cabang | `fsSubPicks(C)` + 13 fungsi kecil (`fsSubOf`, `fsSubFits`, `fsSubPick`, `fsGot*`, dst) |
| blok byName di `__bldNorm` (23) | sekitar 100 cabang | `normByName` + tahap `bnCands`, `bnOne`, `bnStore`, `bnPut`, `bnMiPicks`, `bnLabels`, `bnMatch`, `bnDeal`, `bnPass` |
| `choices` (09) | satu fungsi besar | tahap di file baru `09b-logic-choice-stages.js`, `choices` memanggil `choicesBuild` lewat late port |
| `pk`, `luRows` (10) | besar | tabel `PK_KINDS` dan `LU_OWNER` dengan fungsi per tipe |
| `defenses` (16) | besar | `defSpecies`, `defClassBase`, `defSub`, `defClass`, `defFiend`, `defItems`, `defFeats`, `defFx` |
| `choiceBody` (17) | besar | tabel `CB_TYPES` |
| `renderEquip` (20) | besar | `eq*` per tahap |
| file builder/09 | 353 baris | 312 baris (09b menampung tahapnya). Masih di atas 300, ditunda |

Tes tetap baru: `tests/solid_builder_diff.py` (output `__bldNorm` atas 3113 input dan `__bldRound(__bldSheetFor)` atas 777 build golden, hash per input, mode `--root`, `--diff`, `--base`). Rekaman basis a01bcd20: total a0bc6aefaeb4f3d9.

## Bagian 2: src/fx

Perekam efek: `tests/solid_fx_snapshot.py` (`--root`, `--diff`, `--ignore-ord`, `--stable-with`). Merekam 3 skenario di 390x844 dan 1250x850: DOM ternormalisasi, kelas, style inline, pendengar, mutasi, panggilan WAAPI, global window baru. Waktu, acak, dan timer dikunci.

Stabilitas di main: dua rekaman basis sama pada 873 dari 934 pasangan (langkah, jenis), sekitar 93%. Sisanya noise balapan saat boot, builder, dan hover. Tes ini belum stabil 100%, jadi buktinya sebagian. `--stable-with` hanya membandingkan pasangan yang stabil di dua rekaman.

Yang dipecah: fx/02 (361 baris) menjadi 02 (74), 02a reaksi, 02b home, 02c ronde, 02d ambience, 02e peek. Perekam menangkap 4 global window baru dari 02d (deklarasi `function` tingkat atas bocor lewat Annex B). Sudah diperbaiki dengan `const fn=function`.

Perbandingan akhir fx (tree ini lawan basis, pasangan stabil): 308 langkah, 4 beda, semuanya di 1250x850 (`B sheet set`, `C detail action`, `C detail item`, `C builder`). Ulang berpasangan untuk C menunjukkan jejak ketat detail identik, jadi diduga noise balapan. `B sheet set` belum terselesaikan.

## Ditunda

| Item | Alasan |
|---|---|
| fx/16 (196/351), fx/18, 19, 24, 25, 14, 15, 08, 03, 09, 10, 21, sisa 02c | Kode padat. Tiap potongan harus 20 cabang atau kurang, kalau tidak jumlah pelanggar naik. Percobaan memecah fx/16 jadi 6 IIFE menaikkan pelanggar, dibatalkan. Bukti perekam juga belum penuh |
| builder/09 di bawah 300 baris | 312 baris |

## Guard

| Guard | Sebelum | Sesudah |
|---|---|---|
| guard_size | 171 | 164 |
| guard_deps | 48 | 47 |
| guard_window | 0 baru dari tahap ini | 1 baru, berasal dari origin/main (`app/20-ui-portrait.js`, area app, tidak disentuh) |

## Catatan

Disk host hampir penuh (di bawah 100 MB bebas). Satu kali tes gagal karena "No space left on device" dan diulang setelah membersihkan berkas sendiri. Mesin juga sibuk (load 10), sehingga dua lane tes terbunuh oleh batas waktu dan dijalankan ulang.

## Hasil tes

| Tes | Hasil |
|---|---|
| solid_snapshot penuh | 2997 build, total a893fba7ab867bb0 (sama) |
| solid_builder_diff lawan a01bcd20 | 3890 input, IDENTICAL (a0bc6aefaeb4f3d9) |
| golden_builds / fx_engine | 1479 / 265 lulus |
| solid_contract, solid_data_contract, solid_ui_contract | lulus |
| invariants | 2220 build, 0 pelanggaran |
| scenarios | 24 cek, 0 gagal |
| perf_budget | budget ok (heap raw 33.35 dan 34.59, batas 35 tidak diubah) |
| e2e_fx_toggle, csp_check, lazy_parts, split_dist, names_lint | lulus |
| guard_all | tidak ada pelanggaran baru dari tahap ini (kecuali guard_window dari main, lihat atas) |
| solid_ui_snapshot lawan origin/main 04f3141a | Skenario C 1250 dijalankan sendiri: identik (a749e498391181af). Run penuh: 390x844 identik, 1250x850 skenario A beda 24 langkah antar dua run basis yang sama (noise), skenario C beda 5 overlay di run penuh yang tidak muncul saat C dijalankan sendiri. Diduga noise urutan, belum terbukti |
