# Laporan riset 0: status teknologi, dampak, dan penilaian (2026-10-30 07.40 WIB)

Sesi riset dan racik 2 jam. Laporan berikutnya: sekitar 08.40 (jam 1) dan 09.40 (akhir).
Dasar data: kode origin/main (rilis 0.0.4, commit eab1472), laporan t11, dan pencarian kode di src/. Angka diukur dari kode, bukan dari ingatan.

## 0. Koreksi
Daftar teknologi yang saya tulis pagi ini (daftar-teknologi.md) dibaca dari branch t10-tidy yang tertinggal dari main. Akibatnya N1 sampai N18 tertulis "rencana" padahal sebagian besar sudah jalan di 0.0.4. Dokumen itu diganti oleh laporan ini. Bagian engine (N48 sampai N89) tidak terpengaruh, karena memang rencana.

## 1. Ringkasan satu layar
| Hal | Angka |
|---|---|
| Teknologi buatan sendiri yang sudah jalan di main | 24 |
| Teknologi platform baru yang sudah jalan | 20 |
| Teknologi buatan sendiri yang masih rencana atau usulan | N7 (ditolak), N19 sampai N89 (sekitar 70 kode) |
| Fitur platform baru yang belum dipakai | sekitar 12 |
| Tes otomatis di main | 66 berkas, 38 tes lolos di regresi 0.0.4 |
| Ukuran | index.html 7.590.655 byte, gzip 2.354.100 byte |
| Belum diuji | Firefox dan Safari (workspace hanya punya Chromium), HP asli, orang awam di Learn |

## 2. Sudah diterapkan (jalan di main 0.0.4)
Dampak: Tinggi = mengubah apa yang pemain bisa lakukan atau melindungi data. Sedang = mempermudah. Rendah = di balik layar.

### 2a. Signature (buatan sendiri)
| No | Teknologi | Dampak | Manfaat untuk app | Bukti |
|---|---|---|---|---|
| 1 | Derivasi sheet yang mencatat asal tiap angka (B) | Tinggi | Dasar breakdown, struk angka, peta angka, label bicara | 06-logic-derivation.js |
| 2 | N3 Struk angka | Tinggi | Setelah app diperbarui, pemain melihat angka mana yang berubah dan sebabnya | tests/receipts.py, kunci cs-rcpt-v1 |
| 3 | N2 Mesin waktu (History) | Tinggi | Lihat, bandingkan, dan kembali ke titik mana pun (40 titik per karakter) | tests/time_machine.py |
| 4 | N12 Gabung per bagian | Tinggi | Dua perangkat mengubah karakter yang sama tanpa saling menimpa | cloud_sync 39 cek, sync_merge_ui |
| 5 | N6 Rules fuzzer | Tinggi | Menemukan 5 kesalahan nyata di builder (Fighting Style ganda, spell level tinggi, Mystic Arcanum, spellbook, Magic Initiate) | 1.000 karakter, 0 gagal |
| 6 | TG0 Mesin pertarungan murni | Tinggi | Training Ground: seed, replay sama persis, 503 makhluk, 1.000 pertarungan tanpa NaN | tests/tg_engine.js |
| 7 | Learn: Choreo, Cermin aturan, gerbang bahasa EN dan ID | Tinggi | Pelajaran memakai mesin sheet yang sama, build gagal bila teks melanggar panduan | learn_lint 314 pasang, learn_flow |
| 8 | Anchor Spotlight dengan cadangan JS | Sedang | Sorot elemen sheet dari Learn dan tur, jalan tanpa anchor positioning | tests/learn_flow |
| 9 | N1 Find a build | Sedang | Tujuan angka (AC, HP, skill) menjadi pilihan build yang sah. 384 percobaan, 8 sampai 14 detik | tests/g4_play.py |
| 10 | N11 Build DNA (tautan) | Sedang | Kirim build lewat satu tautan, data di bagian # tidak ke server. QR satu kode belum | g4_play |
| 11 | N16 dan N13 Pratinjau Apply dan restore | Sedang | Pemain melihat angka yang berubah sebelum menyetujui | receipts.py |
| 12 | N9 Rules check | Sedang | Peringatan saat main (armor berat tanpa Strength, attunement lebih, 0 HP) | g4_play |
| 13 | N10 Tabel peluang | Sedang | Peluang berhasil di samping bonus, dengan dan tanpa Advantage | g4_play |
| 14 | N15 Tanya aturan tanpa AI | Sedang | Library menjawab "how do I hide?" dari tabel niat 32 entri, tidak bisa mengarang | g4_play |
| 15 | N4 Rekap sesi dan N5 level sampai 20 | Sedang | Kartu rekap dari jurnal, grafik HP dan serangan sampai level 20 | g4_play |
| 16 | N17 Status ke grup chat | Rendah | Satu tombol, format terbaca balik oleh impor | g4_play |
| 17 | N14 Efek sesuai perangkat | Sedang | HP lemah otomatis memakai efek ringan | tests/fx_tier.py 4/4 |
| 18 | N18 Laporan bug yang bisa diputar ulang | Sedang (untuk Anda) | Laporan memuat 10 tindakan terakhir, skrip memutarnya lagi | tests/replay_report.py |
| 19 | N8 Migrator cascade layer | Rendah (pemeliharaan) | CSS masuk @layer, 44 !important dibuang, 74 layar 0 beda | snapshot gaya |
| 20 | Build satu file dengan CSP berhash | Sedang | Hash script otomatis, Trusted Types, 0 pelanggaran di semua alur | tests/csp_check.py |
| 21 | Game Log (D3) | Sedang | Riwayat 50 lemparan per karakter bertahan sesudah app ditutup | tests/game_log.py |
| 22 | Dadu glossy buatan kode | Rendah | Pantulan studio dibuat kode, tanpa berkas | dice_app.py |
| 23 | Pemuatan tunda (builder, Learn, Training Ground) | Sedang | App tidak lebih lambat dibuka | build.py data-defer |
| 24 | Generator QR dan bingkai berhash | Sedang | Kirim karakter tanpa pustaka QR | 42-logic-pwa-qr |

Catatan jujur: dadu 3D (dice-box di atas Babylon dan Havok) adalah pustaka pihak ketiga yang dibangun ulang, bukan penemuan kami. Masuk daftar ini hanya sebagai integrasi.

### 2b. Latest (teknologi platform baru)
| Teknologi | Dampak | Dipakai untuk | Dukungan (caniuse 2026-10-29) |
|---|---|---|---|
| CSP dengan Trusted Types | Tinggi | Mencegah script asing dan HTML berbahaya | Dukungan Trusted Types di Firefox dan Safari belum dicek di sini |
| Service worker, cache shell | Tinggi | Buka offline | Luas |
| IndexedDB dengan salinan localStorage | Tinggi | Data karakter | Luas |
| View Transitions | Sedang | Pindah langkah builder, pindah tab | 92,91 persen |
| Popover API (top layer) | Sedang | ask() dan toast di atas semua lapisan | Baseline |
| CSS anchor positioning | Sedang | Label Learn | 87,36 persen, cadangan JS ada |
| @starting-style, @property, field-sizing, text-wrap balance | Rendah sampai sedang | Dialog muncul, bar progres halus, kolom tumbuh, judul seimbang | 93 sampai 96 persen |
| Scroll-driven animations | Rendah | Gambar builder bergeser | 87,84 persen, hanya tambahan |
| @layer | Rendah | Pemeliharaan CSS | Baseline |
| Container queries, :has(), color-mix(), dvh | Sedang | Tata letak HP dan PC | Baseline |
| Long Animation Frames dan Event Timing | Sedang | Mengukur ketukan lambat di laporan masalah | Chromium saja, hanya pengukuran |
| Compression Streams | Sedang | Tautan Build DNA, replay | 96,67 persen |
| Wake Lock, Web Share, Vibration, Web Audio | Rendah sampai sedang | Layar menyala, kirim token, getar | Vibration 77,22 persen |
| AVIF | Sedang | 989 ikon | Luas |
| content-visibility | Rendah | Daftar makhluk | 94,85 persen |
| Canvas 2D | Sedang | Papan Training Ground | Luas |
| BarcodeDetector | Rendah | Terima QR | Chrome Android dan Mac, ada cadangan tempel |
| Workers + D1 + Access | Sedang | Sinkron cloud | Disiapkan, belum dideploy (menunggu secret Cloudflare dari Anda) |
| esbuild minify | Rendah | index.html 7,65 MB menjadi 7,31 MB sebelum Learn dan Training Ground | Alat build |
| zstd dan Brotli | Rendah | Dicek di live-check | Ditawarkan Cloudflare |

## 3. Belum diterapkan
| Kelompok | Kode | Dampak jika dibuat | Manfaat | Jenis | Status |
|---|---|---|---|---|---|
| Teknologi latest di Training Ground | Wake Lock, View Transitions, @property bar HP, anchor kartu aksi, bagikan susunan, getar, Gamepad | Sedang | Layar tidak redup di meja, transisi halus | Latest | Diterima, belum dikerjakan (grep: 0 di src/tg) |
| Training Ground inti | N33 sampai N41, N32 Atlas Hidup, replay codec, penggaris | Tinggi | Papan lebih ringan, pertarungan bisa dibagikan, 503 makhluk punya gambar | Signature | Prototipe replay dan pengurai ada di tools/tg-proto (bukan di app) |
| Mode party dan rekam video | WebRTC, captureStream | Tinggi untuk main bersama | Main bareng tanpa server | Latest + Signature (N24) | Menunggu keputusan |
| Kandidat Baseline 2026 | @scope, contrast-color(), Custom Highlight, shape(), CSS zoom, getAllRecords(), Reporting API, service worker modul, WebTransport, WebGPU dadu, invoker commands, dialog closedby | Rendah sampai sedang | Kontras otomatis, sorot hasil cari | Latest | Diterima, di antrean |
| Gelombang 2 | N19 Peta angka, N20 Lensa peluang, N21 Takaran pertarungan, N22 Duel build, N23 Dadu jujur, N25 Penyimpanan memperbaiki diri, N26 Pemutar ulang | Sedang sampai tinggi | Memahami dan melindungi build | Signature | Rencana |
| Penyederhanaan | N27 sampai N31 | Sedang | Unduhan lebih kecil, kode lebih ramping | Signature | Rencana |
| Seluruh app | N42 sampai N47 | Sedang | Kode Hero, efek hanya saat terlihat, cari memaafkan salah ketik | Signature | Rencana |
| Engine | N48 sampai N79 | Tinggi (N48, N49, N51, N59) | Satu inti hitung murni, master emas, rilis aman | Signature | Rencana |
| Gelombang 4 | N80 sampai N89 | Sedang (N80 PDF vektor, N82 cadangan bertanda) | Offline penuh untuk PDF, cadangan rusak ketahuan | Signature | Usulan |
| Ditolak | N7 Playbar sesuai situasi | | | | Ditolak user |
| Sengaja tidak dipakai | content-visibility di sheet, light-dark(), variable font Barlow, Web Worker untuk Find a build | | | | Dicatat di t11 |

## 4. Cabang pengembangan teknologi
Delapan jalur. Tiap jalur punya akar (yang sudah jalan) dan cabang (yang bisa tumbuh).
| Jalur | Akar yang sudah jalan | Cabang berikutnya | Kedewasaan |
|---|---|---|---|
| 1 Inti aturan | Derivasi dengan asal angka, fuzzer, builder | N48 inti murni, N49 master emas, N50 oracle, N83 toSheet murni, N19 peta angka | Tinggi |
| 2 Data dan sinkron | IndexedDB, N12 gabung, N2 mesin waktu, N3 struk | N25 memperbaiki diri, N51 migrasi bertipe, N52 selisih, N81 selisih ke cloud, N82 cadangan bertanda | Sedang |
| 3 Tampilan dan gerak | View Transitions, popover, @layer, anchor, fx tier | Baseline 2026, N42 sampai N47, atlas | Sedang |
| 4 Performa dan ukuran | Tunda muat, minify, LoAF, N14 | N53 pekerja mesin, N54 anggaran, N84 antrean, N87 anggaran waktu, N27 sampai N31 | Sedang |
| 5 Belajar | Learn, Choreo, gerbang bahasa, Cermin aturan | N76 pelajaran berpenilai, U40 Explain any number, U46 peta hubungan | Tinggi |
| 6 Pertarungan | TG0 sampai TG5, 503 makhluk, simpan, replay | N33 sampai N41, N20 sampai N23, N26, party WebRTC | Sedang |
| 7 Keamanan dan distribusi | CSP, Trusted Types, Workers disiapkan | N56 satu pintu HTML, N58 cache gambar, N59 rilis aman, N57 aturan meja | Sedang |
| 8 Alat dev dan kualitas | 66 tes, fuzzer, replay laporan, snapshot 74 layar | N60 uji mutasi, N74 monyet berseed, N73 peta cakupan, N89 kode mati | Tinggi |

## 5. Seberapa terkesan dev expert
Penilaian saya, bukan fakta terukur. Saya menilai seperti insinyur senior web yang membaca repo dan mencoba app 20 menit. Skala 1 sampai 10. Tidak ada pembanding yang dibaca langsung dari repo orang lain, jadi angka adalah perkiraan.

| Aspek | Nilai | Alasan | Yang membuat dev ragu |
|---|---|---|---|
| Disiplin tes | 8 | 66 berkas tes, fuzz 1.000 karakter, 1.000 pertarungan seed tetap, snapshot 74 layar, 3 skenario wajib di 2 ukuran | Hanya Chromium, belum Firefox dan WebKit, belum HP asli |
| Keamanan web | 8 | CSP berhash otomatis, Trusted Types wajib, 0 pelanggaran | Sekitar 199 innerHTML (dihitung di t10-tidy, belum dihitung ulang di main) berjalan di bawah kebijakan default yang membersihkan |
| Offline dan data pengguna | 8 | Service worker, IndexedDB dengan salinan, gabung tiga arah, mesin waktu, snapshot | Belum ada checksum slot (N25), uji hilang data di Safari belum |
| Determinisme | 8 | Mesin pertarungan murni, seed, replay sama persis | Mesin sheet (derive) masih global dan tidak murni |
| Orisinalitas | 6 | Kombinasi baru di domain ini: struk angka, mesin waktu, pertanyaan aturan tanpa AI, Rules check saat main | Banyak teknik dasarnya dikenal (event sourcing, 3-way merge, property testing). Kebaruan ada pada penerapan, bukan pada ilmunya |
| Arsitektur kode | 5 | Satu file 7,6 MB tanpa framework, build sendiri, 176 berkas JS | Satu closure global, 64 MutationObserver di fx, tanpa tipe, tanpa modul. Dev menyebut ini beban pemeliharaan |
| Kerapian rilis | 6 | Regresi 38 tes, live-check, versi | Rilis langsung ke main tanpa rilis aman (N59), cache shell tunggal |
| Bukti pengguna | 3 | Belum ada orang awam yang mencoba Learn | Klaim "15 menit" dan "paham 4 dari 5" belum terbukti |
| Jumlah rencana lawan jumlah jadi | 4 | Sekitar 24 jadi, lebih dari 70 rencana | Dev melihat daftar panjang tanpa bukti jalan sebagai risiko, bukan nilai |
| Nilai keseluruhan | 6,5 | Fondasi rekayasa kuat, kebaruan nyata tapi sempit | Kesan naik bila rencana inti (N48, N49, N59) dan uji pengguna selesai |

Hal yang paling membuat dev terkesan: struk angka dan mesin waktu (sheet yang bisa menjelaskan dan membatalkan dirinya), fuzzer yang menemukan 5 kesalahan, Training Ground yang deterministik dengan 503 makhluk, offline penuh dengan CSP ketat.
Hal yang paling mengurangi kesan: ukuran satu file, kode global, rencana yang jauh lebih banyak dari yang jadi, tidak ada data pengguna nyata.

## 6. Rencana 2 jam
| Jam | Isi | Hasil |
|---|---|---|
| 0 sampai 1 | Pembanding: cara sheet lain (D&D Beyond, Demiplane, Foundry dnd5e, Shard, Roll20) dan app local-first (Automerge, Yjs, Replicache) menangani hal yang sama. Cari celah. Cek asumsi N-series terhadap kode main (mana yang bentrok atau sudah ada) | Laporan 1: celah nyata, pembanding, koreksi rencana |
| 1 sampai 2 | Racik gelombang 5 dari celah yang ditemukan. Tiap usulan: masalah, cara kerja, tes, risiko, cek ide serupa. Susun urutan kerja berdasar dampak dan biaya | Laporan akhir: rencana terurut, daftar keputusan untuk Anda |
Aturan: hanya riset dan dokumen. Tidak mengubah kode app, tidak merge, tidak rilis.
