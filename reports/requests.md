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
