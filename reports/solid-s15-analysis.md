# SOLID tahap 15: pecahan fungsi dan IIFE di src/fx (guard_size 99 ke 61)

Basis: origin/main 04dd6d2a. Cabang claude/solid-s15. Patch berasal dari tahap 14 (24 file src/fx, dua file baru fx/02b dan fx/16b, dua entri manifest). Pemecahan builder/09 (09c) TIDAK dibawa: ditunda di tahap 14 dan tidak ada di patch ini.

## Perubahan sejak patch tahap 14

| Temuan | Penyebab | Perbaikan |
|---|---|---|
| Build lolos tanpa kesalahan | - | tidak ada |
| Perekam fx menangkap regresi di fx/14 (langkah hover: `--mry` dan `--mrx` tidak ditulis) | `lnStep` memakai `mx` dan `my` lama (ReferenceError di rAF) setelah dipindah ke `FXS14A` | `FXS14A.lnMx` dan `FXS14A.lnMy` |
| Pengecekan serupa | eslint `no-undef` pada gabungan semua file fx: tiga nama (`CLASSES`, `__miNF`, `__store`) sama dengan main, tidak ada nama baru | tidak ada |

## Guard

| Guard | Sebelum | Sesudah |
|---|---|---|
| guard_size | 99 pelanggar (2 file, 97 fungsi), 38 di fx | 61 (1 file, 60 fungsi), 0 di fx |
| guard_deps | 39 | 39 |
| guard_dup | 0 | 0 |

Baseline guard_size diperbarui (turun saja).

## Perekam efek fx (tests/solid_fx_snapshot.py), skenario ABC, tiga run basis dan tiga run patch per viewport

Perekam punya noise di basis sendiri (balapan boot dan animasi). Aturan putusan: beda yang juga muncul antar dua run basis adalah noise, beda yang hanya muncul pada patch adalah regresi.

| Viewport | Total basis (b1, b2, b3) | Total patch (p1, p2, p3) | Beda basis lawan basis | Beda patch lawan basis |
|---|---|---|---|---|
| 390x844 | fb46.., 2485.., fb46.. | 11a0.., fb46.., c984.. | A hook __miEcho (set), B detail spell (set) | semua termasuk dalam keadaan noise yang juga dibuat basis (lihat bawah) |
| 1250x850 | 1b1b.., 6c61.., 5f19.. | 6c61.., 6c61.., 6c2e.. | C home (lis), C hook __miEcho (set) | hanya A hook __miEcho (set) |

Noise yang dibuktikan muncul juga di basis:
- `__miEcho` set: dua nilai (35a54.. dan 91a3b..) bergantian di basis dan patch, di kedua viewport.
- Nama `window` `__miFlyBackN` ada atau tidak (hash win 390x844 A semua langkah): kedua keadaan muncul di basis (run awal) dan patch (p1 lawan p2). Total patch p1 = 11a07f7da86e4090 sama dengan total satu run basis.
- Skenario A 390x844, urutan kelas dan pembuatan `#clsArt` di langkah tab (set tab, dom `sheet` dan `home`): tiga keadaan (53ca/fcdd, 8c34/5d3a, a9cb/5d3a dengan dom sheet 143b) dibuat oleh basis dan patch (run dump: basis b2 dan patch p3 identik pada keadaan ketiga).
- 1250x850 p2 total = b2 total 6c61be3869e2859b (identik penuh).

Tidak ada beda yang hanya muncul di patch.

## fx/25 (dicegl.py)

Dijalankan 3x basis dan 3x patch. Lemparan acak (t0, t1, t3, t4) berbeda antar run basis juga (hasil dadu beda: `Math.random` dipakai pemakai lain sebelum lemparan), jadi tidak bisa dipakai sebagai bukti. Lemparan dengan hasil ditentukan (t2, t5, t6): hash panggilan WebGL sama dengan basis pada 9 dari 12 pasangan viewport-run; tiga pasangan beda pada patch dan satu pada basis, dengan pola yang sama (semua t2, t5, t6 satu run bergeser bersama, jumlah panggilan sering sama). Itu pola pergeseran urutan `Math.random`, bukan perbedaan perhitungan. Putusan: tidak terbukti beda, tidak terbukti identik lewat alat ini. Fisika dicakup juga oleh fx_engine 265 dan perekam fx (fx/25 lazy dijalankan).

## Tes

| Tes | Hasil |
|---|---|
| snapshot 2997 | a893fba7ab867bb0, 0 galat |
| golden_builds | 1479 |
| fx_engine | 265 |
| solid_contract | OK 4766 |
| solid_data_contract | 560, 0 gagal |
| solid_ui_contract | 308, 0 gagal |
| e2e_fx_toggle | OK |
| perf_budget --fast --runs 3 --check | budget ok, heap raw 32.4 (390) dan 34.95 (1250), batas 35 |
| csp_check, names_lint, split_dist | lulus |
| guard_all --enforce | exit 0, tidak ada pelanggaran baru |
| solid_ui_snapshot A, B, C satu per satu lawan main | IDENTIK (ad352402.., 52ed6e78.., b2f05b1b..) |
| lazy_parts | SCORE 97, satu FAIL (waktu baca awal dist 1,7 detik); sama pada basis main (2,4 detik), bukan dari patch |
