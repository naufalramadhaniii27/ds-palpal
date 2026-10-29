# T10 Rapikan tampilan dan pasang art terbaru (2026-10-28)

Branch: t10-tidy, dibuat dari origin/main (rilis 0.0.2). Tidak dirilis, main tidak disentuh.

## HTML terbaru
origin/main (6c9b52e) adalah yang terbaru. Isinya T7 sampai T9 dan sudah memuat art sampai d53f617. Branch t5-high-tech sudah masuk ke main lewat merge c1f9283, jadi tidak ada kerja yang hilang.

## Art
Pipeline dijalankan dari art-batch terbaru (batch-109). Yang baru masuk: 305 ikon item sihir (Library dan baris item). Batas kontras scene dihitung ulang (28 scene).

## Yang dirapikan
| Layar | Masalah | Perbaikan |
|---|---|---|
| Home lebar | Judul "My Characters" tidak terlihat (gradasi teks) dan terpotong dua baris. Tombol gear turun ke baris kedua | Judul warna biasa, satu baris. Tombol berbagi sisa baris. Dengan tombol Friends, tombol turun rapi satu baris di bawah judul |
| Home phone dengan Friends | Enam tombol, satu tombol sendirian di baris kedua | Tiga kolom, dua baris |
| Home phone | Kolom Sort By setengah lebar | Search dan Sort By sama lebar |
| Kartu hero Home | Siluet kosong hitam di kartu gelap, lencana kelas terpotong lingkaran | Siluet terang, lencana di dalam lingkaran |
| Header sheet phone | Tanda kuning Build menutup label | Pindah ke pojok kiri atas |
| Skin Record | Temporary HP biru pucat 2:1 | Biru gelap, kontras 4.5 atau lebih |
| Skin Record | Tombol Shop dan Manage Inventory hitam dengan teks biru | Gaya outline sama seperti tombol lain, lebar penuh di phone |
| Skin Record | Stempel menimpa emblem kelas saat belum ada potret | Stempel hanya tampil di atas potret asli |
| Skin Record | Saving throw: ikon di atas nama, nama terpotong | Ikon disembunyikan, satu baris |
| Hover kartu ability | "StealthDIS" menempel | Bendera DIS tidak ikut nama |
| Baris yang bisa digeser | Tab Extras dan bar bawah terpotong tanpa tanda | Pudar di tepi saat masih bisa digeser, semua skin |
| Dialog Cloud dan Friends | Tombol Versions tanpa padding, teks kosong menyempit, tab Sharing menempel ("Yudhi KelapaOnly meCHANGE") | Padding 16, baris kosong selebar kartu, baris daftar memakai tata letak yang sama dengan Cloud, tab Friends ikut pudar tepi |
| Builder Home | Quick Build kecil dan datar | Tombol utama merah, lebar penuh di phone |
| Sheet entri (spell, item, feat) | Header setinggi 277 px karena kilau bulat ikut masuk alur, judul dan tombol Close bertabrakan di phone | Kilau absolut, header 81 px, tiga kolom tanpa tabrakan |
| D&D Beyond Light | Teks Short Rest dan Long Rest cokelat gelap di header cokelat | Teks krem |
| Phone 320 | Tombol Print Cards terpotong, label Conditions terpotong | Tombol turun baris, label disembunyikan saat kosong |
| scale_audit | 2 nilai spasi dan 1 radius di luar skala (dari T8/T9 dan T6) | 0 di luar skala |

File baru: src/css/36-tidy.css (dimuat terakhir). Perubahan JS: pudar tepi di app/40, nama ability di fx/16.

## Tes
| Tes | Hasil |
|---|---|
| tidy (baru, 390 dan 1250) | 11 lolos |
| scenarios (sheet lama, sesudah Apply, karakter baru) | 24 lolos |
| flow_home_sheet, class_art, builder_art, vignettes, sub_art, portrait_pick, creature_icons, starting_style | lolos |
| storage_idb, blank_new, version_label, off_mode, home_hero, home_sum, home_cmd, home_settings | lolos |
| overflow_scan, overlap_scan (6 lebar) | 0 dan 0 |
| scale_audit | 0 di luar skala |
| axe | 0 pelanggaran, 0 kontrol di bawah 44 px |
| friends_ui, sync_banners, cloud_sync (wrangler lokal dengan D1) | 29, 9, 31 lolos |

## Sudah dipotret dan dicek
Karakter Wizard (daftar spell, slot, Manage Spells), skin D&D Beyond dan Record di mode Light dan Dark, teks 130 persen, High Contrast, lebar 320, 390 dan 1250, Library (Shop), detail spell, mode Edit, semua tab Friends dan Admin, semua langkah Builder.

## Catatan
Situs Cloudflare Pages yang sekarang tidak menyajikan folder img. Build baru memakai tools/pages_dist.sh yang menyalin img, jadi potret dan art tampil setelah deploy dari main atau dari branch ini. Belum dirilis atas permintaan Anda.


## Putaran terakhir (audit seluruh layar)
Diperbaiki: dialog konfirmasi (teks panjang membungkus, tombol 44 px), toolbar Spells (grid), tabel Keys (dua kolom), target ketuk Library di ponsel, hook uji `window.__ask`.
Dilihat di 390: xp, search, levelup, report, whatsnew, restore, backup dan storage. Tidak ada temuan baru.
Gate lulus: build --check, scenarios 24, flow_home_sheet 16, tidy 13, class_art, builder_art, vignettes, sub_art, starting_style, blank_new, home_hero, off_mode, overflow_scan, overlap_scan, scale_audit 0, axe 0 pelanggaran, friends_ui 29, sync_banners 9, cloud_sync 31.
Belum dicek: perangkat nyata, panel coins lewat harness, Print Cards di PDF, warna tema selain Forest dan Crimson, lebar 768 di semua dialog.

## Putaran 3
Tombol sekunder: border dan isi jelas di semua layar (kecuali Heal, Damage, tombol utama, peringatan, hapus, aktif).
Glass: dialog di layar mouse (skin DDB). Layar sentuh tetap solid demi GPU.
Potret: nilai "cloud:hash" (gambar belum diunduh) tampil sebagai Add portrait, bukan bingkai kosong. Data tidak diubah.
Detail identitas (species, class, subclass, background, size): ikon chip tampil sebagai watermark tengah di sheet detail.
Target ketuk ponsel: mi-rndr 44 px, abox 44 px, pip, bx, ichk (area ketuk diperluas di Record).
Kontras: Create di Record diperkuat. Heal dan Damage di Record kembali ke isi panel.
Audit: coins dibuka lewat `[data-coinopen]`, hasil rapi. Pindai kontras 3 palet x 4 skin, sisa temuan adalah false positive (latar gambar).
Belum: perangkat nyata, Print Cards PDF, lebar 768 di semua dialog, palet lain secara visual.

## Putaran 4 (matriks mode)
`tests/modes_matrix.py`: 14 konfigurasi dasar (skin, Color-blind, One-handed, teks 90 dan 130, backdrop, frame) + 14 palet + 4 High Contrast, di 390, 768, 1250. Hasil: bersih, kecuali satu temuan nyata yang sudah diperbaiki.
Temuan: di teks 130% pada layar lebar, label Saving Throws terpotong (STR jadi ST). Kolom minimum kini mengikuti ukuran teks.
Catatan: `.hcreate` di Home kadang ditandai clip. Itu animasi masuk, bukan cacat.
PDF Print Cards (6 kartu per halaman) dan PDF sheet (3 halaman) dibuat lewat Playwright dan dilihat per halaman: rapi.

## Ronde 5: Campaign

- Sheet: jika campaign kosong, tombol "Add campaign" muncul di bawah nama. Klik membuka kolom Campaign di Identity.
- Builder: kolom Campaign di bawah Character Name. Terisi dari sheet saat Builder dibuka. Apply membawa nilainya ke sheet (`S.camp`). Tidak ada key localStorage baru, tidak perlu migrasi (`camp` opsional di build).
- Akar masalah isi awal kosong: `fromSheet` membaca `st.S.camp`, padahal `__sheetState` tidak mengirim `S`. Sekarang `__sheetState` mengirim `camp`.
- Tes: `tests/campaign.py` (14 cek, 390 dan 1250), `scenarios`, `tidy`, `sub_art`, `blank_new`, `flow_home_sheet`, `builder_art` hijau. Screenshot sheet dan builder dicek di 390 dan 1250.
- Belum dites di perangkat asli.
