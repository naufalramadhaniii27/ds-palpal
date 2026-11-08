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

## Bagian 2: src/fx (ditunda)

Pecahan fx/02 dibatalkan atas permintaan koordinator dan `src/fx` dikembalikan persis ke origin/main. Alasan: perekam efek baru (`tests/solid_fx_snapshot.py`) baru sekitar 93 persen stabil (873 dari 934 pasangan sama di dua rekaman basis), sehingga belum cukup sebagai bukti identik. Perbandingan terakhir masih memberi 4 langkah beda di 1250x850 (`B sheet set`, `C detail action`, `C detail item`, `C builder`) dan `B sheet set` belum terselesaikan.

Perekam tetap dikirim sebagai alat (tidak masuk CI). Ia menangkap satu cacat nyata saat pengembangan: deklarasi `function` tingkat atas di blok fx yang digabung bocor ke `window` (Annex B). Pecahan berikutnya harus memakai `const fn=function` atau IIFE.

Syarat membuka lagi: perekam harus stabil 100 persen dua kali jalan di main (sumber noise: balapan boot, langkah builder, hover).

## Ditunda

| Item | Alasan |
|---|---|
| Semua pecahan fx (fx/02, 16, 18, 19, 24, 25, 14, 15, 08, 03, 09, 10, 21) | Perekam efek belum 100 persen stabil. Selain itu kode padat: tiap potongan harus 20 cabang atau kurang, kalau tidak pelanggar naik (percobaan fx/16 jadi 6 IIFE menaikkan pelanggar) |
| builder/09 di bawah 300 baris | 312 baris |

## Guard

Dihitung ulang terhadap origin/main caf121c9.

| Guard | Hasil |
|---|---|
| guard_size | 120 pelanggar, 0 baru, baseline hanya turun |
| guard_deps | 47, 0 baru |
| guard_window | 0 |
| guard_dispatch | 1, 0 baru |
| guard_dup | 0 |

## Catatan

Disk host hampir penuh (di bawah 100 MB bebas). Satu kali tes gagal karena "No space left on device" dan diulang setelah membersihkan berkas sendiri. Mesin juga sibuk (load 10), sehingga dua lane tes terbunuh oleh batas waktu dan dijalankan ulang.

## Hasil tes

Pohon akhir setelah merge origin/main caf121c9, basis pembanding origin/main yang sama.

| Tes | Hasil |
|---|---|
| solid_snapshot penuh | 2997 build, a893fba7ab867bb0 (sama) |
| solid_builder_diff | 3890 input, IDENTICAL (a0bc6aefaeb4f3d9) |
| solid_ui_snapshot per skenario sendiri | A 96 langkah IDENTICAL, B 92 IDENTICAL, C 92 IDENTICAL (390x844 dan 1250x850) |
| golden_builds, fx_engine | 1479, 265 |
| solid_contract, solid_data_contract, solid_ui_contract | lulus |
| invariants | 2220 build, 0 pelanggaran |
| scenarios | 24 cek, 0 gagal |
| perf_budget | budget ok |
| names_lint, csp_check | lulus |
| guard_all --enforce | exit 0, tanpa pelanggar baru |

Run UI snapshot penuh (A, B, C sekaligus) tidak dipakai lagi sebagai bukti karena basisnya sendiri tidak stabil di 1250x850 skenario A. Per skenario terbukti identik.
