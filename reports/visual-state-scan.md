# Pemindai visual kontrol berstatus

Skrip: `tests/visual_state_scan.py`. Cabang: `claude/visual-state-scan`.

## Cara kerja

- Memuat 8 karakter lewat `__bldQuickFor` dan `__bldSheetFor`: Warlock 3 dan 11, Wizard 5, Fighter 5, Cleric 5 (2024), Warlock 3, Wizard 5, Cleric 5 (2014).
- Menyimpan ke `phb24-builder-v1` dan `yudhi-kelapa-build-v3`, lalu Continue dan tujuh tab sheet, di 390x844 dan 1250x850.
- Mengumpulkan kontrol `.bx`, `.pip`, `.chip`, `.tog`, `[aria-pressed]`, `[aria-checked]` yang terlihat. Satu wakil per tanda tangan (kelas, data-k, induk) per karakter dan viewport.
- Tiap wakil diklik, dibaca, diklik balik. Yang dibaca: background-image, background-color, border, opacity, warna, shadow, filter, serta `::before`, `::after` dan anak langsung.
- Jika `::before` menggambar penuh, latar elemen dan cincin tepi tidak dihitung. Isi latar `::before` yang menentukan. Teks atau ikon yang berganti dihitung sebagai beda.
- Delapan proses paralel dibagi empat. Keluar dengan kode 1 jika ada kontrol yang dua keadaannya sama, kecuali ada di `tests/visual_state_allow.json` (belum ada).
- `--selftest` mematikan lagi syarat `:not([aria-pressed="true"])` pada aturan pact hijau. Skrip harus menemukannya.
- Lembar gaya disuntik lewat `adoptedStyleSheets`, karena CSP menolak tag `<style>` sisipan.

## Temuan

Tidak ada kontrol yang dua keadaannya tampak sama pada kode saat ini.

| Ukuran | Nilai |
|---|---|
| Tanda tangan kontrol teruji | 35 |
| Kontrol diperiksa (dua keadaan) | 222 |
| Dilewati (klik tidak mengubah status, atau dinonaktifkan) | 55 |
| Temuan | 0 |

Bukti skrip mendeteksi: dengan `--selftest`, `button.bx[k=pact]<spsl<.spsl` dilaporkan sama. Itu bug pact slot yang sudah diperbaiki di main.

Tidak ada perubahan CSS di `src/`, jadi `index.html` dan `sw.js` tidak dibangun ulang.

## Batas

- Halaman Home dan Builder belum dipindai. Skrip hanya memindai sheet.
- Dengan `--selftest`, `button.btn.ordb.press<ordbar` ikut dilaporkan sama pada Warlock 11 Inventory 1250. Tanpa selftest tidak muncul dan teks serta ikonnya berganti (Reorder dan Done). Dugaan: efek samping selftest. Belum diselidiki.
- Klik lewat `el.click()` di dalam halaman, bukan klik mouse. Kontrol yang butuh tahan lama (hold) tidak diuji.
- Waktu. Tes dijalankan saat beban mesin 15 sampai 36 karena sesi lain. Hasil 186 detik. Target 2 menit belum tercapai di kondisi itu. Tanpa beban belum diukur.
- Perbandingan memakai CSS bawaan skin ddb saja (skin default).
