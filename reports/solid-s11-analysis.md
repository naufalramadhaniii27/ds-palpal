# SOLID tahap 11: builder dan fx, huruf S dan DRY

Cabang `claude/solid-s11`, dasar origin/main 055ace96 (PR #17).

## Yang dikerjakan

| Fungsi | Sebelum (baris, cabang) | Sesudah | Cara |
|---|---|---|---|
| `builder/23::__bldNorm` | 121, 313 | 80, 162 | Pembantu murni (`bnNk`, `bnLev`, `bnPick`, `bnQ`, `bnAbl`, `bnNum`, `bnArr`, `saidIn`) naik ke tingkat modul. Lima bagian jadi fungsi bernama: `normScores`, `normBgBonus`, `normSpells`, `normChoiceLists`, `normItems`. `item` dipecah jadi `itemName`, `itemSpecial`, `normInvRow`, `normInvEquip` |
| `builder/15::fromSheet` | 70, 309 | 62, 202 | `fsBestSpecies`, `fsSrcSpecies`, `fsSrcOptions`, `fsSpOpts`, `fsSpLin`, `fsSpAsiFlex`, `fsSpAsiPick`, `fsBgPicks`, `fsClassTool`, `fsInvRow`, `fsSpellPicks` |
| `builder/23::item` | 5, 21 | hilang | Diganti `itemName` dan `itemSpecial`, masing-masing di bawah batas |

Urutan pemanggilan, teks keluaran, dan isi tiap ekspresi tidak diubah. Fungsi baru semuanya di bawah batas 60 baris dan 20 cabang, jadi tidak ada pelanggaran baru. Nama pembantu diberi awalan (`bn`, `fs`, `norm`) supaya guard_deps tidak menghitung data yang memakai nama umum seperti `pick`, `q`, `num` sebagai ketergantungan baru ke file 23.

Satu catatan baseline: IIFE pilihan subclass di dalam `fromSheet` bernama `(anon)#4` sebelumnya, sekarang `(anon)` (urutan anonim bergeser). Ukurannya sama (17 baris, 81 cabang). Baseline diperbarui lewat `--update-baseline` hanya dengan angka yang turun atau sama.

## Yang ditunda

| Target | Alasan |
|---|---|
| IIFE paket fx (fx/02, 03 sampai 11, 14 sampai 21, 24, 25) | Tiap IIFE memakai puluhan konstanta dan fungsi bersama lewat closure, dan memasang pendengar dengan urutan yang menentukan efek. Memecahnya tanpa mengubah urutan efek perlu pengujian visual per paket yang tidak dicakup golden dan snapshot 2997. Risiko lebih besar dari nilainya di tahap ini |
| `fromSheet` IIFE pilihan subclass (81 cabang) | Satu blok utuh dengan banyak status bersama (`by`, `seen`, `got`). Jika dipindah utuh, jadi pelanggaran baru (lebih dari 20 cabang). Perlu dipecah per tipe pilihan (`tool`, `skills`, `opt`, `multi`) di tahap lanjutan |
| Blok `byName` di `__bldNorm` (sekitar 100 cabang) | Sama: saling bergantung lewat `left`, `CLx`, `ch0`. Perlu pemecahan per tahap |
| `choices`, `luRows`, `pk`, `defenses`, `choiceBody`, `renderEquip` | Setiap blok dalam fungsi itu lebih dari 20 cabang, sehingga pemindahan utuh jadi pelanggaran baru. Perlu dipecah lebih halus, tidak cocok untuk satu sesi |
| File besar `fx/02` (361 baris) dan `builder/09` (353 baris) | Terikat ke pemecahan IIFE dan fungsi `choices` di atas |

## Bukti

Lihat laporan akhir di PR untuk angka tes. Selain tes wajib, `__bldNorm` dan `__bldRound` (jalur `fromSheet`) tidak punya tes di repo, jadi dibuat pembanding diferensial sementara: 3113 masukan `__bldNorm` (777 build emas, tiga varian berantakan tiap build, kasus tepi) dan 777 hasil `__bldRound` dibandingkan byte per byte antara main dan cabang ini.
