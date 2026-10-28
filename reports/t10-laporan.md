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
| Dialog Cloud dan Friends | Tombol Versions tanpa padding, teks kosong menyempit | Padding 16, baris kosong selebar kartu |
| Builder Home | Quick Build kecil dan datar | Tombol utama merah, lebar penuh di phone |
| scale_audit | 2 nilai spasi dan 1 radius di luar skala (dari T8/T9 dan T6) | 0 di luar skala |

File baru: src/css/36-tidy.css (dimuat terakhir). Perubahan JS: pudar tepi di app/40, nama ability di fx/16.

## Tes
| Tes | Hasil |
|---|---|
| tidy (baru, 390 dan 1250) | 9 lolos |
| scenarios (sheet lama, sesudah Apply, karakter baru) | 24 lolos |
| flow_home_sheet, class_art, builder_art, vignettes, sub_art, portrait_pick, creature_icons, starting_style | lolos |
| storage_idb, blank_new, version_label, off_mode, home_hero, home_sum, home_cmd, home_settings | lolos |
| overflow_scan, overlap_scan (6 lebar) | 0 dan 0 |
| scale_audit | 0 di luar skala |
| axe | 0 pelanggaran, 0 kontrol di bawah 44 px |
| friends_ui, sync_banners, cloud_sync (wrangler lokal dengan D1) | 29, 9, 31 lolos |

## Belum dikerjakan
- Dialog yang belum dipotret ulang setelah perubahan: Manage Spells, Shop, mode Edit, dan layar Admin.
- Situs Cloudflare Pages yang sekarang tidak menyajikan folder img. Build baru memakai tools/pages_dist.sh yang menyalin img, jadi potret dan art tampil setelah deploy dari main atau dari branch ini.
