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

## Request ke bagian API (functions/api): guard DEV_USER dan concurrency (2026-11-01, dari audit teknis dan bantahan)
Bukti dan konteks ada di reports/bantahan-audit-teknis-20261101.md. Tidak ada perubahan di functions/ dari sesi ini.
1. Guard jalur tanpa ACCESS_TEAM. Sekarang `who()` di functions/api/[[path]].js menerima DEV_USER bila ACCESS_TEAM kosong, di host mana pun. Usul: bila ACCESS_TEAM kosong, hanya localhost dan 127.0.0.1 yang boleh memakai jalur itu, selain itu `return null`. Kode contoh ada di bagian 5 dokumen bantahan. Guard yang diusulkan audit awal (tolak bila DEV_USER dan ACCESS_TEAM sama-sama ada) terbalik, jangan dipakai.
2. Concurrency optimistis di sinkronisasi. Klien mengirim nomor revisi saat PUT, server menolak (409) bila revisi di server lebih baru, klien lalu menawarkan pilihan lewat ask(). Perkiraan 20 baris di API dan sebagian kecil di app/43-logic-cloud-sync.js. Butuh tes: tests/cloud_sync.py (perlu server lokal).
3. Backup D1 harian (di luar repo): `wrangler d1 export dnd-sheet --remote --output backup-DATE.sql`, simpan 14 hari, beri tahu bila gagal. Perlu cron di mesin Anda atau di VPS.
Status (2026-11-01, sesi yang sama):
1. Guard: dikerjakan di functions/api/[[path]].js dan diuji (tests/api_dev_guard.mjs, 8 pemeriksaan, 2 di antaranya gagal pada kode lama). api_social lulus (37) terhadap server lokal dengan guard baru. Produksi tidak berubah karena wrangler.toml dan workers/wrangler.jsonc mengisi ACCESS_TEAM.
2. Concurrency: tidak perlu. Sudah ada (base, 409, force, versi, gabung per bagian) dan sudah diuji di tests/cloud_sync.py. Usul audit keliru.
3. Backup D1: .github/workflows/d1-backup.yml. Perintah ekspor diuji lokal (--local). Belum jalan di GitHub: butuh secret CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID, dan jadwal GitHub hanya jalan dari main, jadi aktif setelah rilis berikutnya.

## Catatan untuk usulan "pisahkan data dari shell" (2026-11-01)
Bila data jadi berkas terpisah, sw.js perlu mengunduhnya di latar belakang atau memasukkannya ke daftar cache pasang. Tanpa itu aplikasi tidak lagi sepenuhnya offline sebelum tiap data dibuka sekali. Hasilnya lebih cepat pada tampilan pertama, bukan unduhan total yang lebih kecil. Keputusan belum diambil.

## Request ke bagian UI/UX: pilihan teks bebas `t:"text"` (fx engine v3a, 2026-11-04)
Engine sudah menyimpan dan menampilkan pilihan bertipe `text`. `choiceBody(c)` di src/builder/17-ui-step-builder.js belum punya cabang untuk `c.t==="text"`, jadi kartu pilihan tidak menampilkan kolom isian.
1. Tambah cabang `c.t==="text"` di `choiceBody`: satu `<input class="btx" type="text">` (atau textarea pendek) yang menulis string ke `B.ch[c.key]` (bukan array). Judul dari `c.title`. String kosong berarti belum dipilih (`isDone` memakai `!!v`).
2. Contoh nyata: Toymaker 20, Clockwork Lich, kunci `gx-spimm-sub-Toymaker` (tiga spell kebal).
3. Sheet: baris Defenses (Immunity, "Spells: ...") sudah dibuat engine lewat `defT`. Bagian "Your choice." di fitur memakai `ycOf` yang sudah menerima string.
4. Atribut baru di baris serangan `C.attacks[i]`, opsional: `xdice:[{d,t,s}]` (dadu damage tambahan) dan `abSrc`. Catatan teks sudah ikut di `note`, jadi UI tidak wajib berubah. Bila ingin kolom damage menampilkan dadu tambahan, baca `xdice`.
Status: UI belum dikerjakan. Tanpa langkah 1, pemain tidak bisa mengisi pilihan teks di builder (nilai bisa diisi lewat impor).
