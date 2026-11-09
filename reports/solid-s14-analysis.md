# SOLID tahap 14: perekam efek fx hampir stabil (syarat tiga pasang tidak terpenuhi), fx tidak dipecah di PR ini

Basis: origin/main cdefc06f. Cabang: claude/solid-s14. Mulai 13:44 WIB, batas langkah 1 (60 menit) lewat pukul 14:44. PR ini hanya berisi perbaikan `tests/solid_fx_snapshot.py` dan laporan ini. `src/`, `index.html`, `sw.js` tidak berubah (build ulang menghasilkan sha256 0cb2eef0dbf05b42..., sama dengan main).

## Langkah 1: yang diperbaiki di perekam

Tiap perbaikan dicari dengan menjalankan dua run berpasangan, menyimpan jejak, daftar listener, nama `window` dan DOM per langkah (FXSNAP_DUMP), lalu membandingkan langkah yang beda.

| Sebab beda antar run | Bukti | Perbaikan |
|---|---|---|
| Skrip lazy dijalankan saat pertama diminta, bukan pada saat yang sama | pasangan awal beda sejak `home` | `ready()` menunggu `__gateDone`, lalu menjalankan semua skrip `data-lazy` lewat `__lazyRun` sebelum langkah pertama |
| Panjang jejak mentah (`n`) ikut dalam hash total | satu-satunya beda pada pasangan A pertama (`A home`, 2661 lawan 2667) | `n` tetap tampil, tidak ikut hash total |
| Urutan nama kelas (`home-art g0-art cls-emb` lawan `cls-emb home-art g0-art`) | `home` A, DOM beda di posisi 26 | nama kelas diurutkan di normalisasi DOM |
| Listener `DOMContentLoaded` pada document (4 lawan 1) dan `load` pada window | `lis` beda: skrip fx berjalan sebelum atau sesudah event itu (balapan jaringan), efeknya sama karena kode berjalan langsung bila `readyState` sudah selesai | dua kunci itu tidak dihitung di `lis` |
| `mi-hd`, `mi-lite` | sisa 13D, ternyata tersapu oleh pengurutan kelas | dibuang saat mengurutkan |
| Huruf judul Home (`mi-ch`) dan `mi-shine` pada tombol Create | fx/11 `homeFx` hanya jalan bila `#homeV` sudah ada saat fx/11 berjalan: balapan boot, murni dekorasi (aria-label memuat teks) | dibuang dari normalisasi DOM |
| Garis tepi notch tab (`nb-f`, `nb-l`, atribut `d`) | skenario C `builder`: path beda sesuai posisi tab aktif (fx/26) | atribut `d` dinormalkan |

Alat bantu baru: `FXSNAP_DUMP_DOM=regex` (DOM hanya untuk langkah yang cocok), `FXSNAP_STOP=langkah` (berhenti setelah langkah itu), dump nama `window` per langkah.

## Bukti stabilitas (basis main, perekam final)

| Pasangan | Hasil |
|---|---|
| 390x844 skenario A, dua run | identik (sebelum normalisasi notch, A dan B sudah identik dalam pasangan ABC) |
| 390x844 skenario B, dua run | identik |
| 390x844 skenario C, dua run | identik, total 253906ecf72a8463 |
| 1250x850 skenario ABC, dua run | identik, total 6c61be3869e2859b (154 langkah) |

Syarat "tiga pasang berturut-turut, ABC, dua viewport" TIDAK terpenuhi. Sebab utama: satu pasang ABC memakan sekitar 11 menit dengan dua proses, jadi enam pasang butuh sekitar 66 menit tanpa menghitung waktu mencari sebab beda (empat putaran perbaikan). Pasangan 390x844 ABC utuh yang terakhir (sebelum perbaikan notch) hanya beda di skenario C. Sesudah perbaikan notch, C dibuktikan terpisah (satu pasang), A dan B dari pasangan sebelumnya. Satu pasang 1250x850 selesai 14:54, sepuluh menit lewat batas. Sesuai aturan, fx tidak dipecah di PR ini.

Saran: jalankan tiga pasang ABC per viewport (dua proses, sekitar 66 menit) di tahap sendiri, tanpa perubahan perekam. Bila lulus, pasang patch di bawah.

## Langkah 2: pekerjaan yang sudah dibuat tetapi TIDAK dimasukkan ke PR

Pemecahan fx dikerjakan sebelum hasil stabilitas jelas, lalu dikeluarkan dari cabang. Hasilnya disimpan di `/home/claude/solid-s14-fx-wip/` (di luar repo):

| File | Isi |
|---|---|
| fx-split.patch | perubahan `src/fx` (24 file, dua file baru: fx/02b, fx/16b) |
| manifest-both.patch | dua entri manifest baru (fx/02b dan fx/16b) |
| fxsplit.js, apply.py, gs.py | alat: memecah IIFE di batas pernyataan, objek bersama `const FXSnnX` (bukan properti window), fungsi bersama dipindah ke depan, pelindung awal (`if(!MI...) return;`) diulang di tiap potongan, pelindung ukuran per file |
| dicegl.py | uji beda fisika dan gambar fx/25 lewat hash semua panggilan WebGL (belum dijalankan) |

Status patch: sintaks (`node --check`) dan `guard_size` saja. Belum dibangun, belum dijalankan terhadap perekam fx, golden, snapshot 2997 dan tes lain. Anggap belum terbukti.

| Hitungan guard_size | Sebelum | Patch fx |
|---|---|---|
| pelanggar total | 99 (2 file, 97 fungsi) | 61 (1 file, 60 fungsi) |
| pelanggar di fx | 38 | 0 |

Pemecahan manual di luar alat (perlu dibaca saat meninjau): fx/02 (klik toggle, scan, parts, state), fx/16 (hover card, bar, show, makeCard, tombol roll), fx/24 (`__bldArt`), fx/25 (`simulate`, `throwDice`), fx/14 (equip fly, lean), fx/15 (`splash`), fx/21 (`watchHome`), fx/07 (tip), fx/01 (inti MI dalam potongan `FXS01`). Satu penghapusan kode mati: fx/13 `hp()` punya kode yang tidak terjangkau sesudah `return;` (cincin persen sudah dibuang), ikut dihapus bersama `let g, gi`. Urutan panggilan `Math.random` dijaga pada `burst`, `simulate` dan lainnya.

## Langkah 3: builder/09 ditunda

`src/builder` adalah modul ES yang dibundel esbuild, bukan satu scope teks. Memotong file 09 menjadi dua gagal build (`featPicks`, `gxPicks`, `subAt`, `asiOf`, `dmXl` tidak lagi diekspor). Separuh kedua (dari `wxRows`, baris 167) dipakai balik oleh separuh pertama (`eaType` memakai `subAt`), jadi pemecahan butuh impor melingkar atau port baru, dan akan menambah back-edge di `guard_deps`. Perlu rancangan sendiri. `solid_builder_diff` tidak dijalankan karena `src/builder` tidak berubah.

## Tes

`src/` tidak berubah, jadi daftar tes penuh tidak dijalankan. Yang dijalankan: build ulang (hasil sama dengan main), `guard_size` (99 pelanggar, tidak ada yang baru), pasangan perekam seperti tabel di atas.
