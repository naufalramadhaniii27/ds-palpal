# SOLID tahap 7: src/data (D dan O)

## Masalah
`src/data` memakai `window` di 91 file, 691 kali (baca 540 lebih, tulis sisanya). Semuanya pola yang sama: tiap file buku mendaftar isinya ke registry global (`window.WX`, `WXI`, `WXSP`, `WXG`, `WXBG`, `WXW`, `WXS`, `WXE`, `WXWP`, `WXC`, `QREFS`, `QIMG`, `GX`, `FXO`, `DM_SP`, `THIRD_SUBS`) dan beberapa file menulis tabel sendiri (`EFA_*`, `ITEMFIX`, `HBIDX`, ...). Tidak ada pintu tunggal. 27 file `tp*`, `wotc*` mengulang hal yang sama.

## Rancangan
Satu modul env baru: `src/data/00-data-env.js` (nama `*env.js`, jadi dikecualikan guard_window seperti env builder dan app). Isinya global `DataEnv`:

| Anggota | Fungsi |
|---|---|
| `DataEnv.slot.NAMA` | Accessor ke `window[NAMA]`. Dipakai file data sebagai ganti `window.NAMA` (baca dan tulis) |
| `DataEnv.declare("A","B")` | Mendaftarkan slot baru. Idempotent |
| `DataEnv.get/set/has/reg(nama[,init])` | Akses dinamis. `reg` setara `window[n]=window[n]||init` |
| `DataEnv.names()` | Daftar slot terdaftar |

Slot bersama (dipakai banyak file) dan tabel aturan (`CLASSES`, `SPECIES`, `BACKGROUNDS`, `FEATS`, `WEAPONS`, `ARMOR`, `SKILLS`, `SPELLS`) dideklarasikan di env. Slot milik satu file dideklarasikan oleh file itu di baris pertama (`DataEnv.declare("ITEMFIX", ...)`). Env jalan pertama di part `db1` (file pertama di `manifest.json`).

Nama global lama tetap hidup: accessor menulis dan membaca `window[nama]`, jadi `window.WX`, `window.QREFS`, nama telanjang `GX`, `FXO`, dan semua pembaca di `src/builder`, `src/fx`, `src/app` tidak berubah. Urutan evaluasi, semantik `||`, dan nilai sama persis. Perubahan di file data hanya penggantian mekanis token `window` (689 tempat) ditambah satu kasus dinamis di `fx-L13.js` (`typeof window[n]` jadi `DataEnv.has/get`). Alias lokal `var W=window` di 5 file fx jadi `var W=DataEnv.slot`.

## O: menambah satu file data
File baru cukup: tambah ke `manifest.json` (seperti sebelumnya), lalu di file itu `DataEnv.declare("TABEL_BARU")` bila butuh slot baru dan tulis lewat `DataEnv.slot`. Env, guard, dan file lain tidak diubah. Tes kontrak menjalankan "file data" tiruan yang tidak dikenal env dan memeriksa hasilnya muncul di nama window lama.

## Tes dan guard
- Baru: `tests/solid_data_contract.py` (560 cek, masuk daftar CI): (1) tidak ada `window` atau `globalThis` di file data selain pintu, pintu file pertama di part pertama; (2) tiap slot yang dipakai file data terdeklarasi (inti di env atau `declare` di file itu sendiri); (3) tidak ada modul lain yang menyebut `DataEnv`; (4) bentuk data (registry objek atau array, `WX.src` punya id, tabel per buku berkunci id sumber, baris `QREFS` array, `SPELLS` baris `[nama, level, ...]`); (5) alias dua arah dengan `window`; (6) ekstensi tanpa mengubah env. Kontrol negatif sudah dicoba: `window` baru dan slot tak terdeklarasi gagal.
- `tests/guard_deps.py`: penyedia nama kini mengenali `DataEnv.slot.X=` seperti `window.X=`. Tanpa itu, 25 file data dapat edge palsu ke `builder/09` (nama `QREFS` tampak unik di sana). Edge sama seperti sebelumnya, baseline tidak berubah.
- `tests/fx_overlap_loader.js`: menjalankan env lebih dulu di vm (fx_overlap dan clause_gate memuat file fx tanpa browser).
- Baseline `guard_window`: bagian data dihapus (91 file, 691 pakai jadi 0). Total 1446 jadi 755. Kunci lain tidak berubah.

## Batas dan ditunda
- Nama telanjang tabel di dalam file data (`CLASSES[cn]`, `FEATS[n]`, `SUBLABEL`, ...) tidak lewat pintu. Itu referensi lexical global script, bukan `window`, dan tidak dihitung guard. Memindahkannya mengubah jutaan karakter tanpa nilai tambah.
- Generator di `tools/q/*.py` (`qbuild.py`, `textfix.py`, `qimg.py`, `hbbuild.py`, `hbnames.py`, `spellref.py`, `qfluff.py`, `crimg.py`, ...) masih menghasilkan `window.X`. Menjalankan ulang akan memunculkan pelanggaran baru dan CI menolak. Perlu tahap terpisah untuk memperbarui templat (di luar area ini).
- `DataEnv.slot.NAMA_TAK_DIDEKLARASI = v` menulis ke objek slot, bukan window, tanpa error. Dijaga oleh cek statis nomor 2, bukan runtime.
