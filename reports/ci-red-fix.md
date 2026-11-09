# CI merah: perbaikan tes `tests`

Cabang: claude/ci-red-fix (dari main). Tidak ada perubahan JS, jadi snapshot SOLID tidak perlu dijalankan.

## Yang diperbaiki

| Tes | Penyebab | Perbaikan |
|---|---|---|
| overlap_scan (1250) | Di skin ddb, `.boxes` punya margin -4px. Kotak Action Surge naik ke bawah label `.lk`. | `src/css/11-v31-tabs-cards-panels.css`: `.fuse{padding-bottom:10px}` di skin ddb. |
| tidy, judul Home 390 | `min-height:48px` pada h1 (37-g0-art.css) lebih tinggi dari batas 1,8 x font 26px = 46,8px. | `src/css/37-g0-art.css`: `min-height:44px` pada lebar 480 ke bawah. |
| tidy, tinggi header sheet | Sheet entri dengan gambar kini memakai tampilan blend. Header menjadi lapisan di atas gambar hero, tingginya sama dengan hero (418 dan 446px). Itu disengaja. Tes lama belum tahu. | `tests/tidy.py`: header blend yang tidak compact boleh setinggi hero. Header biasa tetap harus di bawah 130px. |

## Tes lain yang gagal di main

| Tes | Hasil | Jenis | Tindakan |
|---|---|---|---|
| portrait_pick (20 vs 48) | Nyata, tes usang. Pemilih potret sekarang 48 per halaman (commit 369edca4). | Tes usang | `tests/portrait_pick.py` kini menunggu 48. |
| vignettes (natural 20 dan natural 1) | Nyata, tes usang. Dadu 3D menentukan nilai setelah panggilan kembali, jadi angka palsu sudah dilepas sebelum dadu dilempar. | Tes usang | `tests/vignettes.py`: angka palsu tetap aktif sampai overlay muncul. Menunggu gambar sampai 20 detik. |
| lazy_parts, "first search does not wait" | Gagal sekali dengan 1986 ms (batas 1500 ms). Mesin sedang berbeban berat (load average 15 sampai 32). | Kemungkinan flaky karena timing | Tidak diubah. Perlu dijalankan ulang di CI. Run kedua dan ketiga di sini kena timeout karena beban. |
| tidy, kontras Temporary HP | Nilai berubah antar run (2,04 lalu 3,28 lalu lulus). Tes mengukur warna saat transisi tema masih berjalan. | Flaky | Tidak diubah. Bukan bagian tugas. |

## Bukti tes (pada cabang ini)

- overlap_scan: 0 pasangan tumpang tindih di semua lebar, termasuk 1250.
- tidy: 14 cek, 0 gagal (satu run bersih setelah perbaikan). Run berikutnya timeout karena beban mesin, bukan karena cek.
- portrait_pick: 0 gagal.
- vignettes: 0 gagal.
- tests/guard_all.py --enforce: exit 0.
- tests/scenarios.py: 24 cek, 0 gagal.
