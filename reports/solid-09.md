# SOLID 09: tutup 3 pelanggaran guard terakhir

Cabang: claude/solid-09 (dari claude/integrate-1109). Perilaku identik. Hanya struktur, import, dan satu nama pembaca.

## Rancangan (ditulis sebelum build dan tes)

Masalah ukuran: `builder/09-logic-feats-and-choices.js` 308 baris, batas 300. Sebelumnya 09 tidak bisa dipecah ke file sesudahnya karena dua hal.
- `09b` mengimpor `featPicks`, `gxPicks`, `allFeats` dan kawan-kawan dari 09. Bagian yang dipanggil 09 (misalnya `choices` ke `choicesBuild`) sudah lewat port akhir. Kalau bagian yang dipindah dipakai balik oleh 09, terjadi import melingkar.
- Aturan modul: satu file hanya mengimpor file yang lebih awal di manifest.

Cara aman: pindahkan hanya blok daun, yaitu blok yang tidak dipakai oleh sisa 09. Analisis graf pemakaian nama per pernyataan (espree) menunjukkan dua blok seperti itu.

| Blok | Isi | Baris | File baru |
|---|---|---|---|
| Tabel edisi 2014 | `sp14Set`, `eq14Set`, `dm14Set`, `EQ14S`, `EQ14SH`, `DM14ON`, `DM14S`, `DM14M`, setter `__set_DM14*`, `genv.__sp14Set` | 60 | `09c-logic-edition-overlays.js` |
| Gerbang sumber WotC | `wxRows`, `wxItems`, `wxSpecies`, `wxBackgrounds`, `wxWeapons`, `wxGear`, `wxOpts`, `wxXsp`, `wxRef`, `wxGate`, `wxClasses`, `subDedup` | 44 | `09d-logic-wotc-source-gate.js` |

`bgTl` dan `bgFeatN` tetap di 09 karena `allFeats` memakainya. Kedua file baru diletakkan tepat sesudah 09 dan sebelum 09b di manifest. Urutan jalan efek samping tidak berubah, karena tidak ada kode lain yang jalan di antara blok lama dan posisi baru. Pengimpor yang berubah: builder/13, 15, 20. Import yang tidak terpakai di 09 dibuang.

Pelanggaran deps 1: `builder/09` membaca `MAN_SUM` dari `app/08b`. `MAN_SUM` adalah variabel lokal bundel app (IIFE). Di bundel builder, `typeof MAN_SUM!=="undefined"` selalu salah, jadi hasilnya selalu `""`. Kode itu mati. Diganti `""` langsung. Hasil sama persis. Jika nanti ingin ringkasan maneuver tampil di builder, `MAN_SUM` harus diekspor lewat `env` atau data bersama. Itu perubahan perilaku, jadi tidak dilakukan di sini.

Pelanggaran deps 2: `app/42` membaca `bldDot` dari `app/35` dan membungkusnya lewat `__set_bldDot`. Satu pemilik sekarang. `app/35` tetap menerbitkan `env.__bldDot` (satu-satunya jalan pemanggil lain, termasuk builder). `app/42` membungkus `env.__bldDot` sekali, tanpa mengimpor `bldDot` dan tanpa setter. Tidak ada rekursi karena tidak ada port yang mengembalikan versi terbaru. Setter `__set_bldDot`, entri di daftar port, dan `bindLive` di app/35 dihapus karena tidak dipakai lagi. Hasil akhir `env.__bldDot` sama dengan sebelumnya (pembungkus yang memanggil `bldPend`).

## Hasil guard

| Guard | Sebelum | Sesudah |
|---|---|---|
| guard_size | 1 (file 09, 308 baris) | 0 |
| guard_deps | 2 | 0 |
| guard_window, dispatch, dup | 0 | 0 |

Baseline `guard_deps.json` dan `guard_size.json` turun ke kosong. Baseline lain tidak disentuh.

## Bukti tes

Pembanding adalah cabang dasar claude/integrate-1109 (`git archive HEAD` ke folder sementara, build apa adanya). Hash lama f65fce1937133458 tidak berlaku karena integrasi zero-miss-2 mengubah hash.

| Tes | Hasil |
|---|---|
| `solid_snapshot.py` (2997 build) | total 8005e3fd0e0b2065 di dasar dan di cabang ini, 0 build berubah, 0 page error |
| `solid_builder_diff.py --base` (3890 input) | IDENTICAL, total c47961d793b8c15b |
| `tests/guard_all.py --enforce` | exit 0, size 0, deps 0, window 0, dispatch 0, dup 0 |
| `solid_contract.py` | OK, 4801 pengecekan |
| `solid_ui_contract.py` | 308 pengecekan, 0 gagal |
| `scenarios.py` (tiga skenario, 390x844 dan 1250x850) | 24 pengecekan, 0 gagal |
| `version_label.py` | 9 pengecekan, 0 gagal |
| `build.py --check`, `--lint`, `names_lint.py` | lolos |

Key localStorage tidak disentuh. Tidak ada `confirm()` atau `alert()`. `reports/solid-deps-map.*` tidak diperbarui.
