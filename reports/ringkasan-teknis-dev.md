# Ringkasan teknis untuk developer (draf 2026-10-30)

Untuk pembaca teknis yang ingin menilai proyek ini dalam 10 menit. Semua angka diukur dari build main 0.0.4 (commit eab1472) pada 2026-10-30 dan bisa diulang dengan skrip di tools/research/ dan tests/. Batas ada di bagian 7.

## 1. Apa ini
Character sheet dan builder D&D 5e edisi 2024. PWA, satu berkas HTML yang bisa dibuka offline. Tanpa framework, tanpa langkah bundler selain build.py. Data karakter tinggal di perangkat (IndexedDB dengan salinan localStorage). Server hanya untuk sinkron opsional.

## 2. Bukti yang bisa diperiksa sendiri
| Klaim | Cara memeriksa | Hasil 2026-10-30 |
|---|---|---|
| Build bisa direproduksi bit demi bit | `npm ci --prefix tools/build && python3 build.py` dua kali, bandingkan sha256 dengan index.html di repo | Ketiganya sama: f9c70004cebd5f74... (7.590.655 byte) |
| Tidak ada permintaan jaringan keluar saat dipakai | Playwright merekam semua request pada alur sheet (tab, Library) | 34 permintaan same-origin, 0 eksternal |
| Mesin aturan konsisten | tools/research/meta.py (6 sifat) dan meta2.py (relasi level dan bonus), karakter acak lewat builder asli | 800 karakter, 0 pelanggaran. Ada kanari: fitur bertambah di 244 dari 400 kenaikan level |
| derive() cepat | tools/research/timing.py | 0,5 sampai 0,85 ms normal, maksimum 7,7 ms dengan CPU 6x lebih pelan |
| Teks pengguna tidak bisa menjalankan kode | 262 string diracuni payload XSS, semua tab dan Export PDF dijalankan | 0 jalan, 0 pelanggaran CSP |
| Pertarungan deterministik | tests/tg_engine.js | 1.000 pertarungan seed tetap, replay sama persis, tanpa NaN |
| Builder sah | tests/fuzz_rules.py | 1.000 karakter, 0 gagal keras |
| Sinkron aman | tests/cloud_sync.py | 39 cek, wrangler lokal dengan D1 |
| Regresi | 38 tes pada rilis 0.0.4, 66 berkas tes di tests/ | Lolos (laporan t11) |

## 3. Arsitektur dalam enam kalimat
1. 176 berkas JS dan CSS di src/ dirakit build.py menjadi satu index.html (7,59 MB, gzip 2,35 MB).
2. Blok besar (builder, data buku) bertipe text/x-defer dan baru dieksekusi saat dibutuhkan, lewat kebijakan Trusted Types cs-loader.
3. CSP dibuat build.py dari hash sha256 tiap script, ditambah Trusted Types wajib. Script inline lain tidak jalan (dites).
4. Mesin derive() mengubah karakter menjadi angka dan mencatat asal tiap angka. Sheet, breakdown, struk angka, pratinjau Apply, dan Learn memakai mesin yang sama.
5. Data: sheet, state main, roster, snapshot, mesin waktu (40 titik), jurnal, semua bisa dipulihkan. Gabung tiga arah per bagian untuk dua perangkat.
6. Training Ground adalah reducer murni dengan seed dan log kejadian, 503 makhluk dari data statis, tanpa AI musuh.

## 4. Keputusan dan alasannya (dengan bukti)
| Keputusan | Alasan | Bukti |
|---|---|---|
| Tidak memakai CRDT | Data berbentuk bagian-bagian kecil, satu atau dua perangkat. CRDT 18 sampai 320 KB (angka artikel pkgpulse) dan baru unggul di puluhan editor | Gabung tiga arah per bagian: 0 KB, 39 cek sinkron |
| Tidak memakai Web Worker untuk derive | derive 0,5 sampai 8 ms | Pengukuran bagian 2 |
| Satu berkas HTML | Distribusi sederhana, offline, build reproduksibel | Hash sama dua kali |
| Teks aplikasi ditulis ulang, bukan salinan buku | Lisensi | Aturan proyek |
| Tanpa AI berbayar, tanpa AI musuh | Biaya nol, hasil bisa diuji | Semua fitur "Tanya aturan", Find a build, rekap berjalan lokal |
| Fuzzer dan uji metamorfik bukan contoh tetap | Menangkap kasus yang tidak terpikir | Fuzzer menemukan 5 kesalahan nyata di builder sebelum rilis |

## 5. Yang sengaja tidak dibuat
Backend wajib, akun wajib, AI generatif, framework UI, pelacak, iklan. Content-visibility di sheet, light-dark(), dan variable font dicoba atau dipertimbangkan lalu ditolak dengan alasan tertulis (t11-laporan).

## 6. Kelemahan yang sudah diketahui (ditulis sendiri)
| Kelemahan | Ukuran | Rencana |
|---|---|---|
| Muat awal berat di HP lambat | CPU 4x: DOM siap 2,7 detik, terblokir 1,8 detik, tugas terpanjang 611 ms. HTML tanpa blok tunda: 0,8 detik | N91, N93 |
| Kebijakan Trusted Types memotong teks sah ("once = 1") | Teks hilang di tab Features dan lembar cetak | requests.md, N90 |
| Kode global dalam satu closure | 64 MutationObserver di lapisan efek, 199 innerHTML di bawah kebijakan | N48, N63 sampai N65 |
| Hanya diuji di Chromium | Firefox dan WebKit belum | Perlu HP dan browser nyata |
| Belum ada uji dengan orang awam | Klaim Learn "15 menit" belum terbukti | Uji main oleh user |
| Rencana jauh melebihi yang jadi | Sekitar 24 jadi, lebih dari 70 rencana | Urutan kerja berbasis bukti, laporan 2 |

## 7. Batas pengukuran
Chromium saja. CPU diperlambat lewat emulasi, bukan HP asli. Karakter uji berasal dari builder, bukan dari pemain. Jejak CPU memuat beban pelacakan. Percobaan "tanpa blok tunda" adalah batas atas, bukan perbaikan yang sudah berjalan.
