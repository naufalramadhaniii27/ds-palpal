# Modul, langkah 1 dan 2: pengukuran dan pemeriksa nama (2026-11-01)

## Alat
- `tools/lint_names.js` (Node, memakai espree dan eslint-scope dari `tools/build`, ESLint 9.39.4 dan globals 16.4.0 sebagai devDependency). Hanya membaca `src/`, tidak mengubah hasil build.
- `tests/names_lint.py`: semua blok script harus bisa di-parse, tidak ada nama yang dipakai tanpa deklarasi (kecuali daftar izin `__miT`, `TGE`), dan pengaturan pengingat backup tersimpan tanpa error.
- Jalankan: `npm ci --prefix tools/build` lalu `node tools/lint_names.js --json out.json`.

## Hasil pengukuran (per blok script)
| Blok | File | Nama tingkat atas | Dipakai lintas file | Nama dari blok lain (tabel data) |
|---|---|---|---|---|
| app (blok 12, bersama fx/23) | 58 | 1.273 | 547 | 15 |
| builder | 27 | 489 | 299 | 57 |
| learn | 5 | 39 | 33 | 0 |
| tg (Training Ground) | 5 | 85 | 3 | 0 |
| fx (blok 14) | 24 | 675 | 0 | 3 |
| data (banyak blok) | 1 sampai 20 | kecil | 0 | 257 nama total dari blok lain |

Arti: sekitar 43% nama di blok app dan 61% di builder dipakai oleh file lain. Itu ukuran kerja modul untuk dua blok itu. `tg` hampir mandiri, `learn` terikat erat di dalam bloknya. Blok builder dan data bergantung pada tabel global dari blok data (`CLASSES`, `SPELLS`, `WEAPONS`, `FEATS`, dan lainnya, total 257 rujukan nama).

## Bug nyata yang ditemukan dan diperbaiki
`src/app/99-ui-backup-reminder-handlers.js` berada sesudah `98-close.wrap.js`, di luar lingkup IIFE app. Dua pengaturan Home (pengingat backup berapa hari dan pembaruan file otomatis) memanggil `uiGet`, `uiSet`, `updUnsaved`, `toast` dan melempar `ReferenceError: uiGet is not defined`, jadi pengaturan itu tidak tersimpan. Perbaikan: urutan di `src/manifest.json` (99 sebelum 98). Tes baru memeriksa pengaturan tersimpan (`cs-ui-remind`).

## Yang ditandai tapi disengaja
- `__miT` di `builder/22-ui-shell.js` dijaga `window.__miT?`.
- `TGE` di `tg/30-ui-tg.js` diekspor file engine lewat `root.TGE`.
- `C`, `MAN_SUM`, `module`, `require` dijaga `typeof`.

## Batas
- Pengukuran memakai analisis lingkup statis. Nama yang dibuat lewat `window[...]` dinamis atau `eval` tidak terlihat.
- Angka ini belum menentukan lama pengerjaan langkah 3 (modul bertahap). Itu perlu uji coba pada `tg` dan `learn`.
