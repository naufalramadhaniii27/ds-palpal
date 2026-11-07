# SOLID guards (stage 4)

Lima skrip tanpa browser di `tests/`, satu runner `tests/guard_all.py` (sekitar 4 detik). Pustaka bersama: `tests/guard_lib.py` (pembersih komentar dan string JS, pencari fungsi, baseline). Baseline: `tests/guard_baseline/*.json`. Peta dependensi: `reports/solid-deps-map.md` dan `.json` (dibuat ulang tiap run).

## Mode (sama di semua guard)

| Flag | Perilaku |
|---|---|
| (tanpa flag) | Report mode. Cetak semua pelanggaran dan yang BARU terhadap baseline. Exit 0 |
| `--enforce` | Exit 1 hanya untuk pelanggaran yang tidak ada di baseline (atau yang naik). Ini mode CI nanti. Bisa juga `GUARD_MODE=enforce` |
| `--strict` | Exit 1 untuk pelanggaran apa pun, baseline diabaikan |
| `--update-baseline` | Tulis ulang baseline dari kondisi sekarang. Hanya dipakai sengaja sesudah ditinjau, untuk mengunci perbaikan (angka turun). Jangan dipakai untuk menutup pelanggaran baru |
| `--root DIR` | Periksa pohon lain (salinan scratch). Dipakai untuk bukti gagal |

CI: langkah `SOLID guards` di job A, `continue-on-error: true`, report mode. Setelah stage 2 dan 3 merge, ganti ke `python3 tests/guard_all.py --enforce` dan hapus `continue-on-error`.

## Isi tiap guard dan angka baseline (origin/main sesudah PR #9)

| Guard | Prinsip | Yang diperiksa | Baseline |
|---|---|---|---|
| `guard_window.py` | D | Pemakaian `window` (baca dan tulis) per file di `src/`, di luar modul env (file bernama `*env.js`, kini `builder/00-env.js`, nanti modul env UI otomatis ikut) | 191 file, 1952 pemakaian (baca 1449, tulis 503). File naik di atas baseline gagal |
| `guard_dispatch.py` | O | Di dalam orkestrator bertanda: `switch`, rantai if/else-if dengan 2+ pembanding string, pembanding `kind/type/field/phase/group/k/.t/.g` ke string, `["a","b"].includes(kind)` | 2 orkestrator (`abil`, `gfx0`), 1 pelanggaran (`abil`, baris 34, `k==="STR"` untuk batas Barbarian dan Monk) |
| `guard_deps.py` | D, I | Peta dependensi dari urutan `manifest.json`: import eksplisit dan pembacaan nama top-level unik milik file lain. Aturan arah data, logic, UI. Back-edge = file lapisan rendah membaca file lapisan lebih tinggi | 244 file, 1753 edge, 145 back-edge (terutama logic membaca ui). Pasangan baru atau jumlah nama naik gagal |
| `guard_size.py` | S | Anggaran: file lebih dari 300 baris, fungsi lebih dari 60 baris atau 20 cabang. Fungsi dihitung dengan fungsi dalamnya | 12 file dan 255 fungsi melewati anggaran. Yang baru atau membesar gagal. Top 20 dicetak tiap run (terbesar: `toSheet` 420 baris, 1389 cabang) |
| `guard_dup.py` | DRY | Blok 12+ baris ternormalisasi yang muncul dua kali (kode, bukan `src/data`). Opsi `--browser` menjalankan `tests/dup_check.py` (sekitar 30 detik, sudah ada di daftar tes CI) | 1 blok (`fx/16` dan `fx/18`, 12 baris). Blok baru gagal |

## Konvensi penanda orkestrator (harus ditambah oleh stage lain, bukan oleh stage 4)

Guard dispatch hanya memeriksa apa yang bertanda. Dua bentuk:

```js
/* solid:orchestrator NAMA */            // tepat sebelum fungsinya (deklarasi, name=function, atau arrow dengan blok)
function toSheet(){ ... }

/* solid:orchestrator-begin NAMA */      // atau wilayah, untuk loop di dalam fungsi besar
 ... 
/* solid:orchestrator-end NAMA */
```

Bentuk lama stage 1 `/*ORCH-BEGIN abil ...*/ ... /*ORCH-END abil*/` sudah dikenali, jadi `abil` dan `gfx0` sudah terjaga.

| Stage | Yang perlu ditambah |
|---|---|
| Stage 1 sisa | `toSheet` di `builder/12-logic-export-to-sheet.js` (fase `sheet`, hanya panggilan `runFxPhase`) |
| Stage 2 (`src/builder/*`) | Setiap dispatcher registry builder (langkah, kartu, sumber) diberi `solid:orchestrator`. Modul env baru dinamai `*env.js` agar dikecualikan dari guard_window. Jangan menambah `window` di luar env |
| Stage 3 (`src/app/*`) | Dispatcher UI (klik global, render tab, tile) diberi penanda sesudah registry ada. Modul env UI dinamai `*env.js` (misal `app/00-env.js`) |

Pakai nama file berpola `-logic-`, `-data-`, `-ui-` supaya guard_deps tahu lapisannya. Memecah atau mengganti nama file membuat entri baseline lama hilang dan file baru mulai dari 0. Setelah split, jalankan `--update-baseline` sekali sesudah memastikan total per guard tidak naik (lihat tabel di atas).

## Batas yang diketahui

Pembersih JS memakai heuristik (regex literal), jadi satu dua kesalahan hitung mungkin. Edge global di guard_deps berdasar nama unik, jadi nama yang sama di dua file dilewati dan bayangan variabel lokal bisa memberi edge palsu. Baseline menyerap keduanya. Hitungan baris memakai baris kode asli (kode di repo padat, satu baris bisa panjang), jadi anggaran cabang lebih jujur daripada baris.
