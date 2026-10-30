# Riset: 10 video BONEBOXID GAME, dianalisa 2026-10-30

Permintaan user 2026-10-30 06.51 WIB: simpan semua informasi dan analisa dari 10 video.
Status: riset dan usulan. Tidak ada kode app yang diubah. Usulan teknologi baru masuk bagian 5 di bawah dan menunggu perintah user.

## 1. Batas riset (baca dulu)
| Hal | Fakta |
|---|---|
| Sumber | 10 video, masing-masing 176 sampai 358 detik, 1280 x 720, saluran BONEBOXID GAME |
| Cara baca | Gambar saja. Video 4 sampai 9 dibaca dari 24 cuplikan per video. Video 1, 2, 3, 10 dibaca dari 12 cuplikan |
| Suara | Tidak terbaca. Model transkripsi tidak bisa diunduh dari lingkungan ini (proxy menolak) |
| Akibat | Isi di bawah adalah apa yang tertulis di slide. Penjelasan lisan tidak ada. Angka dan rumus dikutip dari slide, tidak dihitung ulang |
| Kecocokan dengan app | Usulan di bagian 5 adalah pilihan saya, bukan klaim dari video |

## 2. Ringkasan per video
| No | Judul kerja | Isi yang terbaca di slide | Rujukan di slide |
|---|---|---|---|
| 1 | Air laut Sea of Thieves | Simulasi fluida penuh terlalu berat. Pengganti: gelombang sinus `y = A·sin(k·x − ω·t)`. Gelombang Gerstner: lembah datar, puncak tajam, titik bergeser horizontal (`x = x0 − Q·A·D·sin θ`, `y = A·cos θ`) di vertex shader. Pantulan Fresnel: `F(θ) = F0 + (1 − F0)(1 − cos θ)^5` (contoh 2 persen pantul, 98 persen tembus). Busa dari determinan Jacobian: nilai J di bawah 0 berarti gelombang terlipat, muncul busa. Kesimpulan: "ilusi sempurna" | Sea of Thieves, slide "Simulasi Fluida" |
| 2 | SSH dan kriptografi | 1994 telnet kirim kata sandi tanpa enkripsi (plaintext). 1995 SSH. Pertukaran kunci Diffie-Hellman dengan perumpamaan cat dan gelas: tiap pihak punya rahasia sendiri, hanya campuran yang lewat kabel publik. Serangan man-in-the-middle (server palsu). Kunci Ed25519: kunci privat tetap di laptop, kunci publik di server. Kurva eliptik. Penutup: privasi dan kebebasan digital | Slide "man-in-the-middle", "Ed25519" |
| 3 | GitHub dan Godot | Cabang (branch) sebagai lembar coretan dari salinan induk. Commit, fetch, pull, push. Studi kasus bentrok berkas `level1.tscn`. Penggabungan visual node di Godot. Pull request sebagai gerbang mutu dan surat izin. "3 aturan emas kolaborasi". Sponsor: aset game Stable Image | Slide "Pull Request #...", "Godot visual node merge" |
| 4 | The Door Problem | Pintu terlihat sederhana (satu papan dan dua engsel) tetapi menyentuh banyak sistem. AI dan NavMesh: jalan terputus bila pintu menutup, solusi dynamic navmesh carving, rute putus-sambung bila pintu bergerak. Rendering: portal occlusion culling, ruang di balik pintu tertutup tidak digambar (draw call turun dari 7 ke 4, lalu 0), risiko terlambat satu frame. Fisika: pintu bermassa, pemain terjepit di celah, pintu keluar dari batas dunia. Animasi: IK tangan tetap menempel gagang saat pintu berputar. Penutup: semesta game tidak runtuh | Liz England, "The Door Problem", 2014 |
| 5 | Signed Distance Field (SDF) | Poligon: segitiga datar, memori kartu grafis terpakai. SDF: tiap titik tahu jarak ke bentuk terdekat (`d` positif di luar, negatif di dalam). Bola 96.000 vertex dan 4,8 MB lawan `f(p) = ‖p‖ − r` (0 segitiga, 4 byte). Gabung bentuk dengan `d = min(dA, dB)`. Gabung halus dengan `smin(a, b, k)` (tetesan merkuri). Sphere tracing: lompat sebesar jarak terdekat, titik menyusut sampai 0,04 m. Normal dari gradien, pencahayaan. Contoh: Unreal Engine 5 (Lumen), font SDF Valve (huruf dari tekstur 64 x 64 yang tetap tajam) | J.C. Hart 1996, I. Quilez, Valve |
| 6 | Dunia Minecraft | Dunia 60.000 x 60.000 km (3,6 miliar km2), 384 blok tinggi, sekitar 1,38 x 10^18 blok. Tidak disimpan, dihitung: `blok = f(seed, x, y, z)`. Noise Perlin dengan oktaf (`H(x) = Σ 0,5^i · noise(2^i · x)`). Fungsi kerapatan 3D `D(x,y,z) = noise3D(x,y,z) − bias(y)`, `D ≥ 0` berarti batu, gua dari dua terowongan yang bertemu. Seed sama menghasilkan dunia sama untuk pemain berbeda. Chunk 16 x 16, hanya sekitar di pemain dimuat (contoh 30 chunk). Kompresi palet: 4.096 blok x 16 bit = 8 KB turun ke 2 bit = 1 KB (turun 87,5 persen). Far Lands: pada X sekitar 12.550.821 bilangan membeku atau meluap, dunia jadi dinding raksasa | Minecraft Wiki |
| 7 | Godot 60 FPS | Mitos "game 2D pasti ringan": 21 FPS bila tidak dioptimalkan. Tiga kunci: (1) memori dan objek, object pooling agar tidak ada instantiate dan queue_free tiap kali (lonjakan garbage collector), (2) fisika, bentuk tabrakan sederhana, collision layer dan mask agar hanya pasangan yang perlu dicek, sinyal berbasis kejadian menggantikan `_process` yang mengecek terus, (3) GPU, sprite sheet dan atlas dengan CanvasGroup (120 berkas PNG jadi satu tekstur, transparansi 3 pass jadi 1). Hasil: 60 FPS stabil | Slide "Object Pool", "Collision Mask", "Signals", "CanvasGroup" |
| 8 | Fisika terikat frame rate (Skyrim) | Skyrim memakai Havok. Pada 144 Hz tanpa v-sync, fisika berjalan 240 persen, karakter melesat 2,4x. Penyebab: `posisi += kecepatan` per frame. Perbaikan 1: kalikan dengan Δt. Masalah baru: Δt berubah bebas. Pada 5 FPS (Δt 0,2 s), peluru 100 m/s melompat 20 m dan menembus dinding setebal 0,5 m (tunneling). Perbaikan 2 (Glenn Fiedler): fixed timestep dengan akumulator. Fisika tetap 60 Hz (16,67 ms). Sisa waktu disimpan di akumulator. Tampilan di-interpolasi `lerp(prev, curr, α)` dengan `α = sisa / 16,67` agar mulus di 144 Hz | Glenn Fiedler, "Fix Your Timestep" |
| 9 | Determinisme dan rollback netcode | 1 frame = 16,67 ms. Jakarta ke Tokyo sekitar 5.800 km, cahaya di serat optik sekitar 200.000 km per detik, jadi ada batas fisika. Delay-based netcode menunda input. Rollback (GGPO, 2006): terapkan input sendiri langsung, tebak input lawan, bila tebakan salah mundur ke snapshot dan simulasi ulang (contoh 7 frame dalam 16,67 ms). Syarat: simulasi harus deterministik. Musuh terbesar: float. IEEE-754 32-bit. Contoh desinkronisasi: PC dengan FMA (satu pembulatan) dan konsol tanpa FMA (dua pembulatan) beda 1 ULP, satu mengenai dan satu meleset. Jawaban: fixed-point Q31.32 (int64), CORDIC untuk sin dan cos tanpa float (hanya geser bit dan tabel), ring buffer 64 snapshot tanpa alokasi baru. Determinisme saja tidak cukup, CPU harus cukup cepat untuk simulasi ulang | Slide "Rollback // Netcode", "GGPO 2006" |
| 10 | PHP2Shell | PHP dipakai 76 persen situs web. Bug 2024: argumen dari URL berubah menjadi perintah (PHP-CGI, Windows). Laravel dan WordPress ikut terpengaruh. Satu permintaan memberi akses root. Skala: ribuan server (angka di slide, tidak terbaca jelas). Tiga langkah: update PHP, restart penuh PHP-FPM dan server, aktifkan WAF | Slide "Update PHP", "Restart penuh", "Aktifkan WAF" |

## 3. Yang sudah ada di rencana (dicek)
| Topik video | Sudah di rencana? |
|---|---|
| Atlas dan sprite sheet | Ya, N32 Atlas Hidup (rencana Training Ground 5e dan 5f) |
| Seed dan hasil bisa diulang | Ya, PRNG seed dan codec replay (`tools/tg-proto/replay-codec.mjs`) |
| Log kejadian untuk Undo dan replay | Ya (reducer murni, event sourcing) |
| Papan berlapis | Ya, N28 di `rencana-teknologi-ciptaan` |
| Pintu, medan, garis pandang | Sebagian: Bresenham dan shadowcasting. Belum ada tabel fitur petak |
| Tebakan kunci dan keamanan sambungan | Sebagian: WebRTC (N24). Belum ada verifikasi sidik jari sambungan |
| Determinisme lintas perangkat | Belum |
| Animasi tidak terikat frame rate | Belum |
| Objek tanpa alokasi dan layar tanpa gambar saat diam | Belum |

## 4. Analisa per video terhadap app ini
| Video | Dipakai? | Alasan |
|---|---|---|
| 1 Air laut | Rendah | Efek air di arena (petak air) bisa memakai gelombang sinus di Canvas 2D. Fisika fluida tidak perlu. Tidak masuk fase awal |
| 2 SSH | Ya, untuk N24 dan berbagi | WebRTC sudah memakai pertukaran kunci. Risiko ada di pertukaran sinyal lewat QR atau tautan: pihak ketiga bisa menyisipkan diri. Pelajaran SSH: bandingkan sidik jari kedua ujung. Ed25519 untuk tanda tangan tautan karakter (dukungan WebCrypto belum dicek) |
| 3 GitHub dan Godot | Ya, untuk cara kerja | Dua sesi mengerjakan repo yang sama (`t10-tidy` dan `t7-storage`). `index.html` hasil build ada di git, berukuran 7,6 MB, dan itu yang paling rawan bentrok. Dicek 2026-10-30 dengan `git merge-tree`: penggabungan `t7-storage` dan `t10-tidy` bersih, tanpa bentrok. Aturan bila bentrok muncul: jangan gabung `index.html` dengan tangan, selesaikan `src/` lalu `python3 build.py` |
| 4 Door Problem | Ya, untuk Training Ground | Pintu, tembok, medan sulit, air, dan perangkap menyentuh empat sistem sekaligus: gerak (BFS), garis pandang, aturan cover dan serangan peluang, tampilan. Bila tiap fitur ditulis terpisah di tiap sistem, hasilnya banyak kasus khusus. Lihat N33 |
| 5 SDF | Ya, terbatas | Area sihir (bola, kubus, kerucut, garis, silinder) dapat dihitung pasti dengan jarak bertanda: token di dalam bila `d ≤ 0`. Gabungan area bertumpuk dengan `min`. Font SDF Valve menjawab masalah buram saat zoom pada glyph satu warna (tanda cover, panah, cincin jangkauan). Ikon berwarna lukisan dari Codex tidak cocok untuk SDF |
| 6 Minecraft | Ya | Peta arena dari seed: nol byte penyimpanan, tautan hanya memuat seed. Kompresi palet untuk menyimpan peta dan keadaan. Pelajaran Far Lands: koordinat pakai bilangan bulat |
| 7 Godot performa | Ya | Object pool untuk angka damage melayang dan partikel (menghindari lonjakan GC di HP murah). Mask sisi (pemain, musuh, sekutu) untuk pencarian target. Gambar hanya saat ada perubahan. Atlas sudah di N32, batching di N28 |
| 8 Skyrim dan fixed timestep | Ya, sebagian | Training Ground bergiliran, jadi aturan tidak bergantung frame. Animasi tetap bergantung: gerak token harus selesai dalam waktu sama di layar 60, 120, dan 144 Hz. Interpolasi `α` dipakai untuk gerak mulus |
| 9 Determinisme | Ya, penting | Mode party dan replay hanya aman bila semua perangkat menghitung hasil yang sama. Fungsi `Math.sin`, `Math.cos`, `Math.pow` tidak dijamin identik antar mesin JavaScript. Mesin aturan harus hanya memakai bilangan bulat. Detail di N34 dan N35 |
| 10 PHP2Shell | Tidak | App ini tidak memakai PHP (Cloudflare Pages dan JavaScript). Tidak ada tindakan |

## 5. Teknologi baru yang diusulkan (belum dibuat)
Syarat G6 berlaku: tanpa AI berbayar, paket gratis, ada tes, dicatat di rencana lebih dulu.

| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N33 | Tabel fitur petak | Setiap fitur peta (pintu, tembok, air, medan sulit, perangkap) menyentuh gerak, garis pandang, cover, dan gambar | Satu tabel data: tiap fitur menyatakan biaya gerak, apakah menghalangi pandang, tingkat cover, simbol gambar, dan aturan status (buka, tutup, kunci). Semua sistem membaca tabel yang sama. Perubahan status (pintu dibuka) masuk log kejadian lalu jangkauan gerak dihitung ulang di worker | Tiap fitur punya tes di keempat sistem. Pintu dibuka: jangkauan dan garis pandang berubah dan replay sama |
| N34 | Mesin aturan bilangan bulat | Hasil berbeda antar perangkat merusak party dan replay | Semua jarak dalam kaki (bilangan bulat), diagonal dengan aturan bilangan bulat, PRNG dengan `Math.imul`, damage dan peluang dalam bilangan bulat. Larangan di berkas mesin: `Math.sin`, `Math.cos`, `Math.pow`, `Math.random`, `Date.now`. Pemeriksa otomatis mencari kata-kata itu | Skrip memeriksa berkas mesin, gagal bila ada. Hasil Node dan Chromium sama (keduanya V8, jadi belum bukti lintas mesin. Firefox dan WebKit tidak terpasang di lingkungan ini) |
| N35 | Sidik jari keadaan | Perangkat tidak tahu bila hasilnya mulai berbeda | Setelah tiap kejadian, hitung hash keadaan (FNV atau sejenis, bilangan bulat). Party saling kirim hash tiap giliran. Beda berarti berhenti dan sinkron ulang dari snapshot. Dipakai juga di tes TG0: hash akhir pertarungan seed tetap tercatat | 1.000 pertarungan seed tetap, hash sama setiap dijalankan. Satu bit diubah di log, hash berubah |
| N36 | Sidik jari sambungan | Pertukaran sinyal lewat QR atau tautan bisa disisipi pihak ketiga | Tiap layar menampilkan beberapa kata pendek dari hash sidik jari DTLS WebRTC. Pemain mencocokkan kata di kedua layar sebelum bermain, seperti pengecekan host key di SSH | Dua browser di Playwright terhubung, kata sama di kedua sisi. Sisi ketiga yang menyisipkan sinyal menghasilkan kata berbeda |
| N37 | Peta arena dari seed | Membuat arena satu per satu lambat dan butuh penyimpanan | Fungsi `petak(seed, x, y)` memakai hash bilangan bulat dan noise nilai berlapis (oktaf) untuk rintangan, medan sulit, dan air di kisi 20 x 20. Tautan memuat seed. Peta disimpan dalam palet 2 sampai 4 bit per petak (400 petak = 100 sampai 200 byte) | Seed sama menghasilkan peta sama di Node dan Chromium. Tiap peta punya jalur dari sisi ke sisi (tidak terkurung) |
| N38 | Gambar hanya saat perlu | Loop gambar terus berjalan walau papan diam, boros baterai | `requestAnimationFrame` hanya berjalan selama ada animasi atau kamera bergerak. Diam berarti nol frame. Angka damage melayang memakai object pool | Hitung frame selama 10 detik papan diam: nol. Memori stabil setelah 1.000 angka damage |
| N39 | Animasi berbasis waktu | Di layar 120 atau 144 Hz gerak bisa terasa lebih cepat bila dihitung per frame | Posisi token = fungsi waktu log (mulai, lama, jalur), bukan penambahan per frame. Interpolasi `α` dari sisa waktu | Simulasikan jam 30, 60, 144 Hz: gerak selesai pada ms yang sama, posisi akhir sama |
| N40 | Glyph SDF untuk papan | Tanda satu warna (cover, panah, cincin jangkauan) buram saat zoom | Sel 64 x 64 berisi jarak bertanda. Gambar dengan ambang alfa memberi tepi tajam di zoom berapa pun. Canvas 2D tidak punya ambang alfa bawaan, jadi perlu filter SVG atau WebGL kecil. Perlu prototipe sebelum dipilih | Bandingkan tepi di zoom 1x sampai 4x dengan atlas biasa |
| N41 | Area sihir dari jarak bertanda | Menentukan token mana yang terkena area | Fungsi jarak per bentuk (bola, kubus, silinder, kerucut, garis) di kisi, hasil bilangan bulat. Gabungan area dengan `min` | Hasil sama dengan hitungan tangan untuk kasus di PHB 2024 (dicek ke buku di `books/`) |

Urutan saran: N34 dan N35 bersama TG0 (murah dan menentukan semuanya), lalu N33, N37, N38, N39 bersama TG2, N41 bersama TG3, N36 bersama TG7, N40 hanya bila N32 terbukti buram.

## 5b. Pengembangan untuk seluruh app (diusulkan 2026-10-30 06.59 WIB, belum dibuat)
Ditujukan ke sheet, builder, dan Library, bukan hanya Training Ground. Sudah dicek ke rencana yang ada supaya tidak dobel: N3 (struk angka), N11 (Build DNA), N12 (gabung per bagian), N19 (peta angka), N6 (fuzzer) sudah tercatat, jadi tidak diulang. Nomor N42 sampai N47 baru dari sesi ini, bisa perlu disesuaikan bila sesi lain memakai nomor yang sama.

Fakta app yang diukur dari kode hari ini:
| Temuan | Angka |
|---|---|
| Pencarian di Library, daftar spell, Manage Spells, perintah Home, dan Creatures | Semua memakai pencocokan potongan teks (`indexOf`). Tidak ada toleransi salah ketik dan tidak ada peringkat |
| Pemanggilan `requestAnimationFrame` | 21 di `src/fx`, 18 di `src/app` (jumlah titik panggil, bukan jumlah loop yang berjalan) |
| `setInterval` | 8 titik panggil |
| Ikon item | 676 berkas, spell 199 (menjadi 455 bila ikon Codex masuk) |

| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N42 | Kode Hero (isi nyata untuk N11) | Berbagi build lewat file terlalu berat, dan N11 belum punya format | Pilihan builder dipadatkan per palet (video Minecraft): versi 1 byte, class 4 bit, subclass 6, species 6, background 6, level 5, enam skor 5 bit, skill 18 bit, daftar spell dan perlengkapan sebagai indeks. Perkiraan 25 sampai 70 byte, ditulis Base32 tanpa huruf membingungkan, dikelompokkan lima karakter, juga jadi QR. Tabel id append-only dan dijaga alat build: id yang dihapus atau diurutkan ulang membuat build gagal, jadi kode lama tetap terbaca. CRC 8 bit mendeteksi salah ketik. Impor membuka pratinjau N16 sebelum Apply | 10.000 build acak dari fuzzer N6: encode lalu decode sama persis. Kode versi lama tetap terbaca setelah data bertambah. Satu karakter diubah: ditolak dengan pesan jelas |
| N43 | Efek terlihat | Pemain tidak tahu pilihan mana mengubah angka mana (pelajaran Door Problem: satu fitur menyentuh banyak sistem) | Saat build, jalankan mesin derivasi dengan dan tanpa tiap item, feat, dan fighting style pada karakter acuan. Selisih angka (AC, Speed, serangan, save, Initiative) disimpan sebagai berkas kecil. Library dan langkah builder menampilkan "Changes: AC, Stealth" di tiap entri. Cakupan awal hanya fitur yang bisa dinyalakan sendiri | Kasus tahu: Shield menambah AC, armor berat mengubah Speed dan Stealth. Sebuah entri yang teksnya menyebut angka tetapi selisihnya kosong dilaporkan sebagai kemungkinan bug data |
| N44 | Layar diam, nol kerja | 39 titik `requestAnimationFrame` dan 8 `setInterval` mungkin masih berjalan saat layar diam, boros baterai | Ukur dulu: Playwright dengan CDP (`Performance.getMetrics`) selama 10 detik diam di tiap layar utama, pada dua ukuran. Daftar setiap loop dan animasi yang masih hidup (`document.getAnimations()` dan pencacah rAF). Perbaikan: berhenti saat tab tersembunyi, di luar layar (`IntersectionObserver`), dan saat tidak ada perubahan. Target ditetapkan setelah ada angka | Waktu skrip 10 detik diam sebelum dan sesudah. Tampilan sama (snapshot 74 layar) |
| N45 | Cari yang memaafkan salah ketik | "firebal" tidak menemukan Fireball | Satu fungsi cari bersama: normalisasi huruf, pecah kata, peringkat (awalan kata, potongan teks, kemiripan trigram, jarak sunting 1 untuk kata 4 huruf ke atas dan 2 untuk 8 huruf ke atas). Indeks dibuat sekali saat muat. Penyorotan mengikuti hasil | 200 kueri salah ketik buatan dari nama asli: nama benar masuk tiga teratas minimal 95 persen. Kueri tepat tetap mengembalikan hasil yang sama di urutan atas |
| N46 | Ambient dari rumus | Efek suasana Home (kedip lilin, debu melayang, kilau air) lewat video atau gambar berat | Jumlah dua sampai tiga sinus dengan rasio frekuensi tak rasional, hampir tidak pernah tampak berulang (pelajaran gelombang Gerstner). Satu loop menulis satu variabel CSS. Berhenti di luar layar dan mengikuti `fx_tier`. Tanpa berkas gambar. Bergantung pada N44 | Biaya per frame dan perilaku per tingkat efek |
| N47 | Daftar panjang ringan | Library 676 item dan spell 455 membuat banyak elemen DOM di HP lemah | Ukur jumlah elemen dan waktu render pertama. Lalu `content-visibility: auto` dengan `contain-intrinsic-size`, dan render bertahap (50 baris, sisanya saat digulir). Dukungan `content-visibility` 94,85 persen. Cadangan: render semua | Jumlah elemen dan waktu render dengan CPU dilambatkan, sebelum dan sesudah |

Urutan saran: N44 dan N47 mulai dengan pengukuran saja (tanpa mengubah tampilan), N45 dan N42 memberi nilai terbesar bagi pemain, N43 paling banyak pekerjaan, N46 terakhir.

## 6. Risiko
| Risiko | Penanganan |
|---|---|
| Rumus dan angka dikutip dari slide | Dicek ke sumber asli sebelum dipakai (Fiedler, Quilez, Minecraft Wiki, PHB 2024) |
| Lintas mesin tidak bisa dites di sini | Hanya Chromium terpasang. Uji Firefox dan WebKit di perangkat atau CI sebelum mode party dirilis |
| N40 butuh WebGL atau filter | Tidak dipilih sebelum prototipe dan ukur |
| Dukungan Ed25519 di WebCrypto belum dicek | Cek caniuse sebelum dipakai untuk tanda tangan tautan |

## Sumber
- 10 video referensi dari user (BONEBOXID GAME), dibaca dari cuplikan gambar
- Liz England, The Door Problem (2014), disebut di slide video 4
- Glenn Fiedler, Fix Your Timestep, disebut di slide video 8
- Minecraft Wiki, disebut di slide video 6
- Pemeriksaan penggabungan cabang: `git merge-tree --write-tree origin/t7-storage t10-tidy` (2026-10-30), bersih
