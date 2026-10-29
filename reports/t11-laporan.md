# T11 Teknologi terbaru dan teknologi baru, menuju rilis 0.0.3 (mulai 2026-10-29)

Rencana: claude/rencana-kerja-teknologi.md dan claude/rencana-kerja-learn.md. Branch t7-storage. Persetujuan otomatis dari user (2026-10-29 13.40 WIB).

## G0 Alat uji dan pengukuran (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| Gabung t10-tidy | 20 commit T10 masuk (merge 596f937), tanpa konflik. scenarios 24/24, version_label 9/9 |
| N6 Rules fuzzer | tests/fuzz_rules.py, hook `__bldLists`, `__bldFuzz` (builder) dan `__deriveFor` (sheet, tanpa menyimpan). Putaran pertama 400 karakter: 0 gagal keras, tapi 22 jenis pilihan tidak terisi oleh isi otomatis Quick Build di level tinggi |
| Temuan fuzzer, diperbaiki | Fighting Style kedua (Champion 7) mengulang yang pertama. Prepared spell hanya diambil dari level 1, kurang di level tinggi. Mystic Arcanum level 6 sampai 9 tidak dipilih. Spellbook Wizard hanya level 1. Magic Initiate kosong bila semua spell level 1 sudah dikenal. Sesudah perbaikan: 1.000 karakter (seed 1 dan 7), 0 gagal, 0 pilihan terbuka |
| N18 Laporan bug diputar ulang | Report a Problem memuat 10 tindakan terakhir dengan state sebelum dan sesudah tiap tindakan (potret, catatan, jurnal tetap dibuang). tests/replay_report.py memutar ulang langkah demi langkah. `--self` membuat laporan lewat ketukan nyata (damage, heal, Heroic Inspiration) lalu membandingkan state akhir: sama di 390x844 dan 1250x850 |
| A10 Pengukuran | Long Animation Frames dan Event Timing (ketukan 100 ms ke atas), 10 terburuk, hanya di memori, masuk ke laporan masalah. Pengukuran lab sudah ada sebelumnya (tests/inp.py, tests/measure.py dengan CPU 4x) |
| A11 zstd | live-check mencetak Content-Encoding saat zstd, Brotli dan gzip ditawarkan (notice di GitHub Actions) |

## G1 Keamanan dan ukuran (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| A3 PDF | jsPDF 4.2.1 dan html2canvas-pro 2.5.2 di vendor/pdf (MIT, lisensi disertakan), tidak lagi dari cdnjs. Temuan: Export PDF hanya membuat PDF di host artifact lama, di app publik langsung membuka print. Sekarang PDF dibuat dan diunduh di app. tests/pdf_export.py: PDF 4 halaman di dua ukuran, tanpa request keluar |
| A1 CSP | CSP sebagai meta tag dibuat build.py: semua script inline diizinkan lewat hash sha256, `require-trusted-types-for 'script'`. Satu handler inline (fallback gambar HD) diganti listener. Policy Trusted Types `default` (HTML berbahaya dibuang dan dicatat) dan `cs-loader` (bagian builder yang ditunda dan script yang ditahan store-gate). frame-ancestors masuk _headers |
| A1 hasil | Trusted Types juga mengizinkan policy milik html2canvas-pro, base-uri 'self' (klon dokumen PDF memakai base). tests/csp_check.py: Home, sheet (semua tab, detail, damage, heal), More, Library, laporan, Export PDF di dua ukuran: 0 pelanggaran CSP, 0 HTML yang dibersihkan, 0 error. Script inline yang tidak ada di policy tidak jalan (dites) |
| A7 minify | build.py menjalankan esbuild 0.28.2 (tools/build, versi dikunci) per blok script dan style, hanya spasi dan sintaks, nama fungsi tetap. index.html 7,65 MB menjadi 7,31 MB, gzip 2,36 MB menjadi 2,27 MB. Minify penuh dengan ganti nama hanya menambah 0,8 persen gzip, tidak dipakai supaya laporan masalah tetap terbaca |
| A7 font | Tidak diganti. Archivo sudah variable. Barlow dan Courier Prime tidak punya versi variable. Roboto variable (66,5 KB) bisa menggantikan 7 file Roboto dan Roboto Condensed (151,6 KB), tapi Roboto Condensed harus dibentuk dari sumbu lebar dan bentuk hurufnya berubah. Penghematan sekitar 1 persen tidak sebanding dengan risiko mengubah tampilan (aturan user: jangan ganti gaya) |
| Regresi G1 | scenarios 24/24, flow_home_sheet 16/16, storage_idb 39/39, version_label 9/9, pdf_export, replay_report, csp_check, fuzz 120, tidy 14/14, overflow 0, overlap 0, blank_new 9/9, campaign 14/14, lib_add. starting_style gagal juga di commit sebelum T11 karena memanggil builder sebelum dimuat. Tes diperbaiki (menunggu builder), lalu lolos |
