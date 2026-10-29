# Rencana kerja teknologi seluruh app (2026-10-29)

Tujuan: seluruh app memakai teknologi web terbaru yang aman (Baseline) dan punya teknologi buatan sendiri yang belum ditemukan di app sejenis.

Dokumen sumber:
| Dokumen | Isi |
|---|---|
| claude/audit-teknologi-app.md | Audit 60 fitur web, hosting, build, keamanan, library. 10 prioritas teknologi terbaru (A1 sampai A10 di bawah) |
| claude/rencana-teknologi-baru.md | 17 teknologi buatan sendiri (N1 sampai N18, N7 ditolak) |
| claude/rencana-kerja-learn.md | Menu Learn F0 sampai F7, termasuk teknologi buatan sendiri U38 sampai U50 |

## Aturan yang berlaku di semua gelombang
| Aturan | Isi |
|---|---|
| Fitur web | Fitur Baseline dipakai langsung dengan cadangan `@supports` atau cek dukungan. Fitur belum Baseline hanya tambahan |
| Data | Key localStorage dan bentuk data lama tidak diubah tanpa migrasi. Skema D1 naik versi lewat `ensure()` seperti skema 2 dan 3 |
| Biaya | Semua di paket gratis Cloudflare, tanpa AI berbayar |
| Tes | Tiga skenario wajib (sheet lama Yudhi, sesudah Apply, karakter baru) di 390x844 dan 1250x850, lewat localStorage dan screenshot. Regresi lengkap sebelum tiap rilis |
| Rilis | Satu rilis 0.0.3 untuk semua gelombang. Daftar rilis dikirim ke user dulu, push ke main setelah disetujui |
| Kode | Edit di src/, build dengan build.py, `node --check` sesudah edit JS, ask() bukan confirm() |

## Daftar pekerjaan
Teknologi terbaru (dari audit):
| Kode | Pekerjaan |
|---|---|
| A1 | CSP dan Trusted Types |
| A2 | Pindah dari Cloudflare Pages ke Workers (Cron, Workers Logs, rate limit), dikerjakan paling akhir di G5 |
| A3 | jsPDF 4.2 ke atas dan pengganti html2canvas, dibawa di dalam app supaya jalan offline |
| A4 | CSS `@layer` (lewat N8) |
| A5 | Popover, `<dialog>`, anchor positioning, invoker commands |
| A6 | Navigation API untuk tombol Back |
| A7 | Minify JS dan CSS (esbuild atau Lightning CSS), variable font |
| A8 | `content-visibility` untuk daftar panjang |
| A9 | `light-dark()` dan `oklch()` untuk tema |
| A10 | Pengukuran Long Animation Frames dan INP |
| A11 | Cek kompresi zstd di live lewat GitHub Actions |

Teknologi buatan sendiri: N1 Reverse Builder, N2 Mesin waktu, N3 Struk angka, N4 Rekap sesi, N5 Sheet masa depan, N6 Rules fuzzer, N8 Migrator layer, N9 Rules lint, N10 Chip peluang, N11 Build DNA, N12 Gabung per bagian, N13 Pratinjau restore, N14 Tingkat efek, N15 Tanya aturan, N16 Pratinjau Apply, N17 Status ke chat, N18 Laporan bug diputar ulang.

## Gelombang kerja
Urutan mengikuti ketergantungan. Satu gelombang selesai dan dites sebelum gelombang berikutnya.

### G0 Alat uji dan pengukuran
Dasar untuk semua gelombang: tanpa ini, perubahan besar di G1 sampai G3 tidak bisa dibuktikan aman.
| Kerja | Isi | File |
|---|---|---|
| N6 Rules fuzzer | Ribuan karakter sah acak lewat builder. Cek: tidak ada NaN, slot sesuai tabel, ekspor lalu impor sama persis, AC dan HP masuk akal. Seed tetap supaya hasil bisa diulang | tests/fuzz_rules.mjs (baru) |
| N18 Laporan bug diputar ulang | Jejak tindakan dari catatan undo masuk ke laporan masalah. Skrip memutar ulang jejak itu di Playwright | src/app/27, src/app/32, tests/replay_report.py (baru) |
| A10 Pengukuran | Long Animation Frames dan INP dicatat lokal, tampil di laporan masalah dan di tes HP lambat (CPU 4 kali lebih lambat). Tidak dikirim ke server | src/app (file baru), tests |
| A11 Cek zstd | live-check di GitHub Actions mencatat header Content-Encoding | tests/live_check.py |
| Selesai bila | Fuzzer jalan di CI lokal tanpa temuan baru, atau temuannya dilaporkan di reports/. Rekaman ukuran performa sebelum G1 tersimpan sebagai pembanding |

### G1 Keamanan dan ukuran
| Kerja | Isi | Risiko dan penanganan |
|---|---|---|
| A1 CSP dan Trusted Types | Tahap 1: CSP report-only di preview deployment, script inline diberi hash otomatis oleh build.py. Tahap 2: Trusted Types dengan satu policy yang melewati esc(), 198 pemakaian innerHTML dipindah ke policy itu. Tahap 3: CSP ditegakkan | CSP salah bisa membuat app tidak jalan. Report-only dulu di preview deployment sampai bersih. Library PDF dari CDN dibawa ke dalam app (A3) supaya CSP tidak perlu membuka domain luar |
| A3 PDF | jsPDF 4.2 ke atas dibawa di dalam app sebagai blok `data-defer`. html2canvas diganti gambar langsung dari halaman cetak (36) atau PDF teks vektor bila ternyata lebih ringan | Hasil PDF dibandingkan dengan versi lama di tiga skenario |
| A7 Ukuran | build.py menjalankan minify (esbuild untuk JS, Lightning CSS untuk CSS). Font statis 22 file diganti variable font untuk keluarga yang punya versi variable dengan lisensi SIL Open Font yang sama | Minify bisa mengubah perilaku. Regresi lengkap dan fuzzer G0 harus sama sebelum dan sesudah |
| Selesai bila | Live-check lolos, CSP tanpa pelanggaran di laporan, ukuran gzip turun dan dicatat. CSP dipasang lewat _headers yang sudah dipakai Pages |

### G2 CSS dan UI dasar
| Kerja | Isi | Catatan |
|---|---|---|
| N8 lalu A4 | Migrator memindahkan 36 file patch ke `@layer` sesuai urutan menang sekarang. Playwright membandingkan gaya hasil di semua layar, harus sama. Lalu `!important` dibuang bertahap | Pembanding screenshot dan computed style per layar |
| A5 Anchor Spotlight | Satu mesin untuk popover, dialog, menu, tooltip, tour, dan sorotan (sama dengan U41 di Learn, dibuat sekali). ask(), bottom sheet, menu More, dan banner pindah ke top layer. Daftar pengecualian `homeInert()` makin pendek | ask() tetap nama yang sama untuk semua pemanggil |
| A6 Navigation API | Back di HP menutup dialog atau kembali ke tab sebelumnya. Cadangan `hashchange` | Tes tombol Back di 390x844 |
| A8 | `content-visibility:auto` di daftar spell, item, Library | Tes posisi gulir tetap benar |
| A9 | Token warna tema dipindah ke `light-dark()` dan `oklch()` | Screenshot tiap tema harus sama atau lebih baik, kontras tinggi tetap lolos a11y_scan |
| N14 Tingkat efek | Ukur perangkat sekali (core, memori, kelancaran frame). HP lemah memakai efek ringan, setelan Motion tidak diubah | Dari pengukuran A10 |
| Selesai bila | a11y_scan tanpa pelanggaran baru, tiga skenario sama, tes Back lolos |

### G3 Inti data
| Kerja | Isi | Catatan |
|---|---|---|
| N3 Struk angka | Mesin derivasi mencatat asal tiap angka. Rincian di 11-ui-breakdown.js memakai catatan ini. Setelah app diperbarui, daftar "angka yang berubah dan sebabnya" | Dasar N1, N5, N13, N16, dan U39 dan U40 di Learn |
| N2 Mesin waktu | Kejadian disimpan di IndexedDB per karakter, kejadian lama diringkas. Garis waktu, banding dua titik, pulihkan | Ada batas ukuran supaya kuota cloud tidak habis. Bentuk data karakter tidak berubah, kejadian disimpan terpisah |
| N12 Gabung per bagian | Saat bentrok sinkron, bandingkan dasar, sini, dan sana. Bagian yang tidak bentrok digabung otomatis, sisanya ditanyakan per bagian | API sinkron sudah punya revisi dasar. Versi "other-device" tetap disimpan sebagai cadangan |
| N13 Pratinjau restore | Daftar perubahan sebelum restore backup atau versi cloud | Memakai N3 |
| N16 Pratinjau Apply | Angka yang akan berubah menyala sebelum Apply | Memakai N3 |
| Selesai bila | Fuzzer G0 tetap bersih, tes sinkron (cloud_sync.py) ditambah kasus bentrok, tiga skenario sama |

### G4 Fitur baru untuk pengguna
| Kerja | Isi |
|---|---|
| N1 Reverse Builder | Tujuan angka masuk, Web Worker mencari kombinasi sah, hasil memakai N3 untuk menjelaskan untung-rugi |
| N5 Sheet masa depan | Grafik level sampai 20 dan rencana pilihan level berikutnya |
| N4 Rekap sesi | Kartu rekap dari kejadian N2, bisa disimpan sebagai gambar |
| N9 Rules lint saat main | Tanda kecil dengan alasan dan tombol perbaikan |
| N10 Chip peluang | Peluang berhasil di samping tiap bonus |
| N11 Build DNA | Resep pilihan, satu QR atau link pendek |
| N15 Tanya aturan | Tabel niat ke entri Library, offline |
| N17 Status ke chat | Salin status singkat, bisa dibaca balik oleh impor teks chat |
| Selesai bila | Tiap fitur punya tes Playwright di dua ukuran layar, Motion off, kontras tinggi |

### G5 Pindah ke Workers (paling akhir, keputusan user 2026-10-29)
| Kerja | Isi | Risiko dan penanganan |
|---|---|---|
| A2 Pages ke Workers | wrangler.jsonc dengan static assets dan Functions yang dikompilasi (`wrangler pages functions build`). Cron harian menggantikan siklus "request pertama tiap hari". Workers Logs dan rate limit untuk /api | Alamat app bisa berubah dari pages.dev. Aplikasi Cloudflare Access, policy Teman dan GitHub check, ACCESS_AUD, dan BASE di live-check harus ikut. Pages lama tetap hidup sampai Workers lolos live-check. Pengguna diberi tahu alamat baru lewat banner |
| Selesai bila | Live-check lolos di alamat Workers, Cron harian jalan, Workers Logs terisi |
Sampai G5, app tetap di Pages dan siklus harian tetap memakai request pertama tiap hari.

### Learn (jalur paralel)
| Tahap Learn | Bisa mulai setelah |
|---|---|
| F0 dan F1 | G2 (memakai Anchor Spotlight, Popover, `@layer`) |
| F2 sampai F4 | F1 |
| F5 (Explain any number, peta hubungan angka, Coach mode) | G3 (N3) |
| F7 rilis | Ikut rilis 0.0.3 |

## Rilis
Satu rilis saja: 0.0.3 berisi G0 sampai G5 dan Learn F0 sampai F7 (keputusan user 2026-10-29). Daftar rilis dikirim dulu, push ke main setelah disetujui.
| Pengaman karena rilisnya besar | Isi |
|---|---|
| Uji sebelum rilis | Tiap gelombang tetap dites sendiri saat selesai di branch kerja. Regresi lengkap, fuzzer, tiga skenario, Learn dua bahasa, dan tes HP lambat dijalankan sekali lagi di akhir |
| CSP | Mode report-only dijalankan di preview deployment branch kerja (bukan di rilis). Setelah tidak ada pelanggaran, CSP ditegakkan di 0.0.3 |
| Workers | Pages lama tetap hidup sampai alamat Workers lolos live-check. Bila Workers gagal, rilis tetap jalan di Pages |
| Data | Migrasi skema D1 dan data lokal dites dari salinan data produksi seperti di T9 |

## Keputusan yang perlu dari user
| Hal | Kapan |
|---|---|
| Alamat baru setelah pindah ke Workers (workers.dev atau domain sendiri) | Awal G5 |
| Setelan Cloudflare Access untuk alamat baru (user yang mengubah di dashboard, Claude memberi langkahnya) | G5 |
| Mulai kerja | Menunggu "go" |
