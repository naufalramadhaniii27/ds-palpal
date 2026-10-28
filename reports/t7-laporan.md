# T7 Storage IndexedDB dan default bersih (2026-10-28)

Branch t7-storage, dari t5-high-tech (0542ac5). Tahap 1 dari rencana claude/rencana-login-sinkron.md.

## Hasil
| Butir | Isi |
|---|---|
| Penyimpanan utama | IndexedDB, database `dnd-sheet`, store `kv` dan `meta`. Batas 5 MB hilang, batasnya kuota browser |
| API | `window.__store` meniru localStorage. Semua 76 pemakaian `localStorage` di app, fx, builder diganti `__store` |
| Mulai app | Blok app, fx dan deferred-loader bertipe `text/x-gate`. `boot/store-gate.js` memuat isi IndexedDB ke memori, lalu menjalankan blok itu satu per task (urutan dan timer sama seperti inline) |
| Cermin | Tiap tulis juga ke localStorage selama muat. Yang gagal dicatat di meta `lsFail` dalam transaksi yang sama dengan nilainya |
| Rekonsiliasi saat mulai | Kunci `lsFail` pakai IndexedDB. Nilai localStorage yang beda menang (versi lama, tes, alat). localStorage kosong total: IndexedDB dipakai apa adanya |
| Migrasi pertama | Salinan penuh localStorage di meta `__legacy-backup`, tiap nilai dibaca balik. localStorage lama tidak dihapus |
| Cadangan | Tanpa IndexedDB atau tanpa jawaban 2,5 detik: app jalan di localStorage seperti dulu |
| Tab lain | Event storage dan BroadcastChannel `cs-store` memperbarui salinan memori sebelum listener app jalan |
| Gagal tulis | Event `cs-store-fail` memunculkan bar "Changes are not being saved" yang sama |
| Indikator | "Storage used on this device: X of about N GB" dari navigator.storage.estimate. Sebelum browser menjawab, tanpa peringatan penuh |
| Default bersih | DEFAULT jadi karakter kosong. Teks Yudhi, Retron, Pencak Silat dihapus dari placeholder header, glossary (Dagger, Sickle, Unarmed Strike, Frightened), dan menu Reset |
| Reset | "Reset to original build" (ke Yudhi) diganti "Clear Build": mengosongkan build, nama, catatan, HP, kondisi tetap |

## Tes
| Tes | Hasil |
|---|---|
| storage_idb (baru): migrasi, 6 MB, reload, simpan dari app, dua tab, offline, tanpa IndexedDB, mulai bersih, di 390x844 dan 1250x850 | 37 lolos |
| scenarios (Yudhi lama, Apply, karakter baru) | 24 lolos |
| flow_home_sheet 16, class_art, vignettes, sub_art, home_settings, portrait_pick, home_hero, coin_buy, lib_add, fav_bar, offline_note, pwa_note, home_sum, off_mode | lolos |
| build --check, lint | lolos |

Perubahan tes: pembacaan storage di scenarios, fav_bar, lib_add, measure memakai `window.__store`. vignettes mensimulasikan perangkat hampir penuh lewat navigator.storage.estimate (batas 5 MB tidak ada lagi). sub_art menulis mi-clsart lewat `__store`.

## Catatan
- Kunci lama `yudhi-kelapa-build-v3` dan `yudhi-kelapa-sheet-v1` tetap dipakai sebagai nama kunci di IndexedDB supaya backup dan restore file lama tetap jalan. Nama ini tidak terlihat pengguna. Ganti nama menunggu tahap sinkron server.
- Karakter sampel Yudhi sekarang hanya di tests/fixtures/yudhi-v3.json.
- Temuan di luar tugas (belum diubah): karakter kosong dari builder masih membawa profSrc Fighter dan aksi Second Wind (lihat blankC di builder). Gambar vignette offline tidak ikut cache service worker bila belum pernah dimuat saat online.
