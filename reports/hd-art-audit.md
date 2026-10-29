# Audit ketajaman art (T10)

Ukuran tampil diukur di browser (Playwright) pada 1250 px @2x dan 390 px @3x. "Perlu" = sisi terpanjang tampil (px CSS) x DPR. Cukup bila file >= 90% dari perlu.

| Art | Jumlah | Sumber | File sebelum | Tampil maks (css px) | Perlu @2x / @3x | Sebelum | Sesudah |
|---|---|---|---|---|---|---|---|
| Emblem subclass (chip, daftar) | 53 | 1024 | 256 | 36 | 72 / 108 | cukup | tidak berubah |
| Emblem subclass (watermark) | 53 | 1024 | 256 | 320 | 640 / 816 | pecah (2,5x s/d 3,2x diperbesar) | HD 768, cukup |
| Emblem class (hero) | 13 | 1024 | 384 | 106 | 212 / 318 | cukup | tidak berubah |
| Emblem class (watermark) | 13 | 1024 | 384 | 320 | 640 / 816 | pecah | HD 768, cukup |
| Ikon spell, item, kondisi, skill dan lain (daftar, chip) | 1055 | 1024 | 128 | 24 s/d 44 | 88 / 132 | cukup | tidak berubah |
| Ikon art (watermark) | 1055 | 1024 | 128 | 192 | 384 / 576 | pecah (3x s/d 4,5x) | HD 576, cukup |
| Scene latar PC | 70 | 2400 | 1600 | 1250 | 2500 | agak lembek (1,56x) | 2400, cukup (96%) |
| Scene latar ponsel | 70 | 1088 | 720 | 390 | 1170 | agak lembek (1,6x) | 1088, cukup (93%) |
| Potret art | 20 | 768x960 | 384x480 | 140 | 280 / 420 | cukup | tidak berubah |
| Bingkai potret (g0) | 1 | 768x960 | 384x480 | 140 | 280 / 420 | cukup | 768x960 |
| Vignette | 20 | 1024 | 512 | 128 | 256 / 384 | cukup | tidak berubah |
| Latar Home (home-inn-phone) | 1 | 1088x1920 | 720x1280 | 1250 (PC) | 2500 | pecah di PC | 1088x1920 (sumber asli). Di PC masih diperbesar 2,3x |

Cara kerja HD: file kecil di `img/` tetap dipakai untuk daftar dan chip. Watermark memuat salinan di `img/hd/` (emblem 768 px, ikon 576 px). Bila file HD tidak ada, watermark memakai file kecil. Dibuat oleh `tools/art_hd.py`.

Ukuran tambahan: img/hd 24 MB, scene 3,2 MB jadi 6,9 MB, scn 17 MB jadi 36 MB. Hanya yang dibuka yang diunduh.

Sisa: Latar Home di PC butuh versi lanskap (2400 x 1344). Sumber hanya potret 1088 x 1920. Masuk daftar tugas Codex.
