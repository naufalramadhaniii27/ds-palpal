# T7 Storage IndexedDB dan default bersih (2026-10-28)

Branch t7-storage, dari t5-high-tech (0542ac5). Tahap 1 dari rencana claude/rencana-login-sinkron.md.

## Hasil
| Butir | Isi |
|---|---|
| Penyimpanan utama | IndexedDB, database `dnd-sheet`, store `kv` dan `meta`. Batas 5 MB hilang, batasnya kuota browser |
| API | `window.__store` meniru localStorage. Semua pemakaian `localStorage` di app, fx, builder diganti `__store` |
| Cermin | Tiap tulis juga ke localStorage selama muat. Kunci yang gagal dicatat di meta `lsFail` (satu transaksi dengan nilainya) dan di localStorage `cs-store-v1` |
| Mulai cepat (biasa) | `cs-store-v1` tanpa kunci gagal: memori diisi dari localStorage seketika, app jalan inline seperti dulu. IndexedDB disamakan di latar belakang |
| Mulai lambat | Pertama kali, data melebihi localStorage, atau `cs-store-v1` hilang: blok app dan fx menunggu IndexedDB, lalu jalan berurutan. Markup disembunyikan sampai siap (maks 4 detik) |
| Rekonsiliasi | Kunci `lsFail` pakai IndexedDB. Nilai localStorage yang beda menang (versi lama, tes, alat). localStorage kosong total: IndexedDB dipakai apa adanya |
| Migrasi pertama | Salinan penuh localStorage di meta `__legacy-backup`, tiap nilai dibaca balik. localStorage lama tidak dihapus |
| Cadangan | Tanpa IndexedDB atau tanpa jawaban 2,5 detik: app jalan di localStorage seperti dulu |
| Tab lain | Event storage dan BroadcastChannel `cs-store` memperbarui salinan memori sebelum listener app jalan |
| Gagal tulis | Event `cs-store-fail` memunculkan bar "Changes are not being saved" yang sama |
| Indikator | "Storage used on this device: X of about N GB" dari navigator.storage.estimate. Sebelum browser menjawab, tanpa peringatan penuh |
| Default bersih | DEFAULT jadi karakter kosong. Teks Yudhi, Retron, Pencak Silat dihapus dari placeholder header, glossary (Dagger, Sickle, Unarmed Strike, Frightened), dan menu Reset |
| Reset | "Reset to original build" (ke Yudhi) diganti "Clear Build": mengosongkan build. Nama, catatan, HP, kondisi tetap |
| Versi | Label yang terlihat jadi 0.0.1 (APP_LABEL, 2026-10-28). Nomor internal untuk cap data naik ke 103 (APP_VER), supaya data lama tidak dianggap dari versi lebih baru. What's New hanya menampilkan versi berlabel (0.0.1 ke atas). Tes: version_label (9 lolos) |

## Waktu muat (HP 390x844, CPU 4x, data Yudhi, median 8 kali)
| Versi | Siap tampil |
|---|---|
| t5-high-tech | 920 ms |
| T7 mulai cepat | 909 sampai 925 ms |
Mulai lambat hanya terjadi sekali saat migrasi, atau setiap kali bila data lebih besar dari localStorage. Di kasus itu app menunggu IndexedDB dulu (sekitar 1 sampai 2 detik di HP lambat).

## Tes
| Tes | Hasil |
|---|---|
| storage_idb (baru): migrasi, 6 MB, reload, simpan dari app, mulai cepat, dua tab, offline, tanpa IndexedDB, mulai bersih, di 390x844 dan 1250x850 | 39 lolos |
| scenarios (Yudhi lama, Apply, karakter baru) | 24 lolos |
| flow_home_sheet | 16 lolos |
| class_art, vignettes, sub_art, builder_art, home_settings, portrait_pick, home_hero, coin_buy, lib_add, fav_bar, offline_note, pwa_note, home_sum, home_cmd, starting_style, audio_ctx, lib_drag, builder_buy, builder_pal, creature_icons, off_mode, overflow_scan, overlap_scan | semua lolos |
| a11y_scan | tidak dijalankan (butuh axe-core di luar repo) |
| build --check, lint | lolos |

Perubahan tes: pembacaan storage di scenarios, fav_bar, lib_add, measure memakai `window.__store`. vignettes mensimulasikan perangkat hampir penuh lewat navigator.storage.estimate. sub_art dan builder_art menulis mi-clsart lewat `__store`. measure menunggu kelas `st-wait` hilang.

## Catatan
- Kunci lama `yudhi-kelapa-build-v3` dan `yudhi-kelapa-sheet-v1` tetap dipakai sebagai nama kunci supaya backup dan restore file lama tetap jalan. Nama ini tidak terlihat pengguna.
- Karakter sampel Yudhi sekarang hanya di tests/fixtures/yudhi-v3.json.
- Temuan di luar tugas (belum diubah): karakter kosong dari builder masih membawa profSrc Fighter dan aksi Second Wind (blankC di builder). Gambar vignette offline tidak ikut cache service worker bila belum pernah dimuat saat online.

## Cloudflare Access (2026-10-28)
- App di dnd-sheets-palpale.pages.dev dikunci Cloudflare Access: policy Teman (Allow, email, sesi 1 bulan, One-time PIN) dan GitHub check (Service Auth, token github-live-check).
- live-check memakai secret CF_ACCESS_CLIENT_ID dan CF_ACCESS_CLIENT_SECRET. Token ditambahkan lewat route Playwright, dan env PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1 supaya permintaan dari service worker ikut membawa token. Access tidak memberi cookie untuk service token.
- Hasil run 40660140315: 21 cek, 0 gagal.
