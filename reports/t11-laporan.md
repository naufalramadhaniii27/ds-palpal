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

## G2 Tampilan dan dadu (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| N8 Cascade layers | Semua CSS app dan CSS tema runtime di `@layer app`, file L-*.css di layer sendiri (feat, learn, dice). Snapshot gaya 74 layar (dua ukuran, Record, light, kontras tinggi): 0 beda |
| N8 !important | tools/important_trim.py: 2.631 deklarasi dianalisis, 44 dibuang, sisanya memang dibutuhkan atau di file efek dan print. Percobaan pertama (114) gagal verifikasi dan dibatalkan. Hasil akhir: 0 beda di 74 layar |
| A5 Top layer | ask(), ask builder, dan toast tampil sebagai popover manual (`topLayer()`), di atas semua z-index. Default popover browser direset dengan `:where([popover])`. Snapshot overlay sama. Temuan: di skin DDB toast punya `position:relative` sehingga jatuh di bawah layar dan tidak terlihat. Diperbaiki, toast kini muncul. Bottom sheet dan menu More belum dipindah (risiko tinggi, tidak perlu untuk Learn) |
| A6 Back ke Home | Back di sheet menutup panel dulu, Back berikutnya ke Home. tests/back_home.py lolos di dua ukuran |
| A8 content-visibility | Tidak dipakai. Diukur: daftar sheet Yudhi 7 sampai 19 baris, Library sudah memecah 60 baris per halaman. Tidak ada yang bisa dipercepat, risikonya posisi gulir melompat |
| A9 light-dark() | Tidak dipakai. Sekitar 20 aturan app memasang `color-scheme` per elemen. light-dark() di token akan berganti warna di dalam elemen itu |
| N14 Efek sesuai perangkat | Bila efek belum pernah dipilih: 4 core ke bawah dan memori 2 GB ke bawah, atau 90 frame awal lebih lambat dari 28 ms, efek turun ke lite. Pilihan di Settings selalu menang. tests/fx_tier.py 4/4 |
| D1 dan D2 Dadu 3D | dice-box 1.1.4 dibangun ulang di BabylonJS 9.32.1 dan Havok 1.3.14 (src/dice ke vendor/dice), dimuat saat lemparan pertama. Tombol Roll di breakdown dan save konsentrasi memakai dadu fisika. Motion off dan Calm memakai crypto. Bug ditemukan dan diperbaiki: hasil roll() per dadu, bukan per grup. tests/dice_app.py: 3 lemparan 3D per ukuran di bawah CSP, nilai sesuai, Motion off tanpa 3D |
| Regresi G2 | scenarios 24/24, flow 16/16, csp, pdf, replay, starting_style, overflow 0, overlap 0, campaign 14/14, lib_add, off_mode, modes_matrix, storage_idb 39/39, tidy 14/14, dice_app, fx_tier, back_home, fuzz 500 (0 gagal). sync_banners butuh server wrangler di 8788, tidak jalan di sini |

## Perubahan urutan (user, 2026-10-29 17.22 WIB)
Learn jadi prioritas dan dirilis secepatnya dengan kualitas tetap dijaga. Keputusan Claude: sesudah G2, langsung Learn F0 sampai F7. Rilis 0.0.3 berisi G0, G1, G2, dan Learn. G3, G4, dan G5 (termasuk pindah ke Workers) masuk rilis sesudahnya.

## Learn untuk rilis 0.0.3 (2026-10-29)
| Kerja | Hasil |
|---|---|
| F0 | src/learn (blok tunda `learn`), data EN dan ID, key `cs-learn-v1` ikut PF_KEYS, band di Home, jembatan `window.__app` (app berjalan di satu closure), gerbang bahasa di build (tools/learn_lint.js: 314 pasangan teks lolos) |
| F1 dan F2 | Tavern, Rooftops, Forest, Campsite, Market, cek akhir 5 soal. Tebak, Lihat, Coba, Kenapa, kartu ringkas, kamus popover, Find it on your sheet (Anchor Spotlight dengan anchor positioning dan cadangan JS), "I know this", XP. Dadu memakai dadu 3D bila efek nyala |
| F4 sebagian | Meet Your Dice dan Windy Cliff (Advantage, Disadvantage, saling batal, Heroic Inspiration) |
| U52 Tur Aplikasi | Bagian dari Learn (revisi user 19.22 WIB): tempat "Tur Aplikasi" di peta Learn, 7 titik di sheet sendiri, dua langkah menunggu ketukan nyata, lemparan dibatalkan di akhir, teks EN dan ID, kembali ke peta dengan XP. Home hanya kartu Learn. Settings dan pencarian perintah membuka tur lewat Learn |
| Dadu glossy (user 19.34 WIB) | Warna garnet tetap di semua skin (warna aksen lama abu hijau menutupi angka), pantulan studio buatan kode (tanpa file), highlight tajam, peta specular lama yang membuat kusam dilepas |
| Temuan | Tidak ada data karakter yang diubah Learn (dites). Sheet sendiri menambah detail item (type, cost) ke inventory setelah data builder dimuat, dengan atau tanpa Learn. a11y_scan gagal sejak CSP G1 karena axe disuntik, sekarang memakai bypass_csp (hanya di tes) |
| Tes | learn_flow (3 skenario wajib x 2 ukuran, EN dan ID, Back, Escape, reload, Motion off, tanpa anchor positioning, dadu 3D), learn_a11y (axe 0 pelanggaran, tombol 44 px), tour_flow, version_label 0.0.3 |
| Belum | F3 Forge Your Hero, F5 penghubung (Learn this, Which die, recap, corong Admin), Tempat Bonus lain, gambar Codex. Uji main orang sungguhan dan Safari di iPhone: tugas user |
