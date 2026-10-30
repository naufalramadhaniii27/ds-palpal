# Requests to other parts

## Logic: Builder Apply drops Library additions (from UI/UX, T4)
- Library "Add" and "Buy" write entries to the sheet with `lib:1` (items in `C.inv`, spells in the spell list).
- Builder Apply replaces `C`. `manualLost` lists only attacks and resources, so `lib:1` entries vanish without a warning.
- Ask: carry `lib:1` entries over in Apply, or list them in `manualLost` so the user sees what is lost.
- Not changed here because Apply belongs to Logic.

## Art: latar Home versi lanskap (dari T10)
Latar Home di PC memakai `home-inn-phone` (potret, 1088 x 1920) dengan cover. Di layar 2x ia diperbesar sekitar 2,3x. Perlu `home-inn-pc` lanskap 2400 x 1344, gaya sama. Setelah ada, tambah ke `tools/art_pipeline.py` (blok g0) dan pakai di CSS Home untuk lebar di atas 760 px.

## Art: ikon Species, Background, Size (dari T10)
Baris Identity di sheet memakai art untuk Class (`emblem`) dan Subclass (`esub`). Species, Background, dan Size masih ikon garis umum karena belum ada asset. Gaya dan ukuran sama dengan `icon` (576 px HD, tampil 22 px).

| Kategori | Jumlah | Nama file (slug) |
|---|---|---|
| species | 10 | aasimar, dragonborn, dwarf, elf, gnome, goliath, halfling, human, orc, tiefling |
| background | 16 | acolyte, artisan, charlatan, criminal, entertainer, farmer, guard, guide, hermit, merchant, noble, sage, sailor, scribe, soldier, wayfarer |
| size | 6 | tiny, small, medium, large, huge, gargantuan |

Setelah ada: tambah kategori ke `tools/art_pipeline.py` dan `img/manifest.json`, lalu UI/UX memakai `__artIc` di `renderIdentity`. Species kustom (misal Retron) dan background kustom tetap memakai ikon garis.

## Logic/Boot: kebijakan Trusted Types memotong teks pemain yang sah (dari riset 2026-10-30)
Berkas: src/boot/trusted-types.js, kebijakan `default`, ekspresi `BAD` dan `strip`.
Masalah: `\son[a-z]+\s*=` dicek pada seluruh string HTML, termasuk teks biasa yang sudah di-escape. Teks pemain yang memuat " on..." lalu "=" ikut dipotong.
Bukti (Chromium, build main eab1472, tools/research/tt_bug.py dan tt_real2 di scratchpad):
| Teks pemain | Tampil |
|---|---|
| Rage: once = 1 per rest | Rage: per rest |
| Spell slots: one = 1st level | Spell slots: level |
| Javascript: a language | blocked: a language |
| Nama fitur "Darkvision once = 1" di tab Features | Darkvision> (penutup tag ikut hilang, markup rusak) |
Dampak: teks hilang di tab Features, detail, dan lembar cetak. Bukan celah keamanan (CSP tetap memblokir). Tidak ada data yang berubah, hanya tampilan.
Usul perbaikan (bagian Logic): cek hanya di dalam tag, bukan di teks: `/<[^>]*\son[a-z]+\s*=/i`, atau urai dengan `<template>` dan buang atribut `on*` dan elemen berbahaya dari DOM hasil urai. Tes: korpus XSS (262 string diuji, 0 jalan) dan korpus teks sah di atas harus lolos keduanya.
Tidak diubah di sini.

Tambahan 2026-10-30 (bukti untuk permintaan di atas): prototipe pembersih berbasis DOM ada di tools/research/sanitize-proto.py (di luar app).
| Ukuran | Kebijakan sekarang | Pembersih DOM |
|---|---|---|
| 21 teks sah (termasuk "once = 1", tombol dengan teks itu) | 5 diubah | 0 diubah |
| 25 payload XSS (script, onerror, onload, javascript:, entitas tersamar, form, object, embed, meta, base, svg, template, math) | 1 jalan (link `jav&#x09;ascript:` bila diklik) | 0 jalan |
Catatan: pada app, CSP tetap memblokir javascript:, jadi satu payload itu bukan celah nyata saat ini. Kebijakan Trusted Types `default` tidak boleh memanggil `innerHTML` biasa untuk mengurai (rekursi). Perlu satu kebijakan bernama kedua (misal `cs-parse`, hanya mengembalikan string) yang harus ditambahkan ke daftar `trusted-types` di CSP buatan build.py. Tidak diubah di sini.

## Logic/Boot: salinan localStorage yang rusak menimpa salinan IndexedDB yang sehat (dari riset 2026-10-30)
Berkas: src/boot/store-gate.js, bagian "Slow start" dan rekonsiliasi per kunci. Komentar kode: nilai localStorage yang berbeda dari IndexedDB dianggap ditulis di luar versi app ini dan menang.
Bukti (Chromium, build main eab1472, tools/research/idbcheck.py):
| Langkah | Hasil |
|---|---|
| 1 Buka app dengan karakter Yudhi | IndexedDB menyimpan 11.747 karakter, JSON sah, nama "Yudhi Kelapa" |
| 2 Potong nilai localStorage `yudhi-kelapa-build-v3` jadi separuh, muat ulang | Layar menampilkan "New Character". Tidak ada layar pemulihan. IndexedDB sekarang menyimpan 5.873 karakter, bukan JSON sah |
| 3 Lakukan satu edit | IndexedDB tetap rusak |
Artinya satu salinan cermin yang rusak menggantikan salinan sehat di IndexedDB pada pemuatan berikutnya. Dalam uji ini saya menulis kerusakannya sendiri lewat localStorage. Seberapa sering rusak seperti ini terjadi di perangkat nyata tidak saya ukur.
Enam jenis kerusakan dicoba: potong separuh, string kosong, JSON bentuk salah (array), `null`, satu byte diubah, level berisi teks. Lima menghasilkan karakter kosong. Level berisi teks menampilkan "Fighter 1" (level 4 berubah jadi 1 tanpa pesan).
Usul (bagian Logic): sebelum nilai localStorage boleh menang, cek bisa di-parse dan bentuknya benar untuk kunci yang dikenal (misal `v===3` dan `abilities` untuk sheet). Bila tidak sah dan IndexedDB sah, pakai IndexedDB, simpan nilai rusak di meta untuk diagnosis, dan beri tahu pengguna. Ini bagian dari N25. Pertanyaan: mengapa layar pemulihan (BAD) tidak muncul pada jalur ini? Tidak diubah di sini.

## Request ke UI/UX: anggaran 60 fps pada CPU 4x (2026-10-30, dari sesi riset)
Syarat user: minimum 60 fps, dipilih pada kondisi CPU 4x. Bukti dan angka ada di reports/rencana-kerja-engine.md bagian 3g. Usul F1 sampai F3:
1. Tier lemah (N14) memaksa mi-fx = off pada frame lambat berulang. Ukuran: pindah tab 44 ke 51 fps, damage 44 ke 55 fps.
2. Batasi animasi dan transisi CSS global pada tier lemah. Ukuran: pindah tab 44 ke 53 fps.
3. Telusuri pemicu layout pada klik pindah tab.
Status: belum dikerjakan. Tidak ada perubahan di src/.
