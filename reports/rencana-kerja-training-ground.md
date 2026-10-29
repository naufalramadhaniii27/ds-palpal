# Rencana kerja Training Ground (2026-10-29)

Referensi: video Oneon Training Ground (56 detik, dibaca dari cuplikan gambar). Permintaan user: app ini punya Training Ground, analisa teknologinya secara mendalam, catat di rencana kerja.
Keputusan user 2026-10-29 22.52 WIB: tanpa AI musuh. Pemain menggerakkan semua token (karakter, musuh, sekutu). Data musuh dicari di 5etools dan wiki (bagian 7).
Keputusan user 2026-10-29 23.02 WIB: sumber makhluk pilihan B, semua 503 makhluk Monster Manual 2024 dari 5etools. Keputusan lisensi untuk 173 makhluk di luar SRD ada di user dan dicatat di sini.
Status: analisa dan rencana. Belum ada kode. Keputusan di bagian 9.

Batas analisa: situs dan dokumentasi Oneon tidak ditemukan lewat pencarian. Teknologi yang dipakai Oneon tidak bisa dibuktikan dari video. Bagian 2 mencatat yang terlihat. Bagian 5 adalah pilihan teknologi untuk app ini, dengan status verifikasi tiap klaim.

## 1. Tujuan
Tempat latihan: pemain mencoba karakter sheet sendiri (atau kelas baru) melawan makhluk, tanpa risiko, untuk memahami aksi, gerak, spell, dan reaksi. Sheet asli tidak berubah.

## 2. Yang terlihat di video
| Layar | Isi |
|---|---|
| Masuk | Halaman "Training Ground". Tab "On your own" dan "With your party" |
| 1. Who goes in | Kartu karakter dari sheet (nama, level). Satu kartu "Try a class": dialog dengan class, subclass, level (multiclass sampai total level 20), tombol "Create the hero" |
| 2. What waits for you | Tingkat kesulitan: Easy (CR 1/4), Medium (CR 1/2 dan 1), Hard (CR 2 dan 3), Extreme (CR 3 sampai 6), Infernal (CR 7 sampai 10), Deadly (CR 11 sampai 16), Legendary (CR 17 sampai 21). Kartu makhluk berilustrasi (Orc, Bugbear, Ghoul, Giant Spider, Goblin, Skeleton, Wolf, Acolyte, Manticore, Wight) dengan CR, satu baris kemampuan, dan penghitung jumlah plus dan minus |
| 3. Who comes with you | Kartu sekutu (Priest, Bard, Knight, Archer, Apprentice Wizard, Dire Wolf), maksimal 3, masing-masing satu, dengan peran satu baris (misal Knight: memimpin di depan, Archer: menembak dari jauh) |
| 4. Where you train | Kartu arena berilustrasi (Sea Sunset, Mercurius Underground, dan lain-lain). Bar bawah: "5 creatures, 3 companions" dan tombol "Enter the field" |
| Medan | Peta kisi dengan ilustrasi latar. Token bulat: cincin merah musuh, hijau sekutu. Baris urutan giliran di atas. Garis bantu dan petak jangkauan gerak. Teks "15 ft moved, 15 ft left" dan tombol Undo |
| Panel aksi | Tab Actions, Bonus, Reaction. Daftar Attacks, Spells, Features, Other (Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an object, Grapple, Shove). Tooltip aturan saat diarahkan (contoh Disengage: tidak memicu opportunity attack). Spell reaksi (Shield, Feather Fall) di tab Reaction |
| Bar bawah | Penanda Action, Bonus, Reaction, batang sisa kecepatan (15 FT LEFT), tombol heksagon End Turn |
| Reaksi | Kartu keputusan: "Opportunity attack: musuh keluar dari jangkauanmu dan kamu menyerang. Atau yang lain: apa yang kamu lakukan?" |
| Lain | Panel The Fight dan The Log. Sheet karakter dengan skor heksagon dibuka dari medan |

## 3. Yang sudah ada di app ini
| Hal | Status |
|---|---|
| Mesin aturan (`derive`, aksi, slot spell, kondisi, resource, rest) | Ada di sheet. Basis untuk karakter pemain |
| Dadu fisika 3D (dice-box, Babylon 9.32, Havok) | Ada sejak T11. Hasil dari simulasi, tidak bisa ditentukan dulu |
| Stat block makhluk | 72 entri (`src/data/wotc13-creature-stat-blocks.js`), 56 dari Monster Manual 2024. Isinya makhluk dari item dan companion: Ape, Lion, Knight, Veteran, Skeleton, Zombie, Wraith, dll. Struktur sudah terpisah (AC, HP, ability, aksi, bonus, reaksi). Teks serangan seragam sehingga bisa diurai: `Melee Attack Roll: +5, reach 5 ft. Hit: 10 (2d6 + 3) Slashing damage` |
| Ikon makhluk | 16 ikon (`img/icon/creature`). Belum ada ilustrasi kartu atau token |
| Art arena | Ada scene art Species dan Class. Belum ada arena kisi |
| Log, undo, catatan kejadian | Undo di sheet. Mesin waktu N2 dan Game Log D3 ada di rencana G3, belum dibuat |
| Anchor Spotlight, top layer, Back, efek sesuai perangkat | Ada dari T11 |

## 4. Selisih yang harus dibuat
| Selisih | Besar |
|---|---|
| Daftar makhluk: Goblin, Orc, Bugbear, Ghoul, Giant Spider, Wight, Manticore, dan lainnya belum ada. Kisaran CR 1/4 sampai 21 butuh sekitar 100 sampai 150 stat block | Besar |
| Mesin pertarungan: urutan giliran, ekonomi aksi, gerak, opportunity attack, kondisi, cover, jangkauan | Besar |
| Efek spell dan fitur kelas otomatis: ratusan entri | Sangat besar. Dibatasi bertingkat (bagian 6) |
| Kontrol semua token oleh pemain (pilih token, aksi dari stat block, giliran) | Sedang |
| Papan kisi: gambar, token, gerak, sentuh di HP | Besar |
| Ilustrasi kartu makhluk, token, arena | Besar, dari Codex |
| Mode party (realtime) | Besar, ditunda |

## 5. Teknologi
| Kebutuhan | Pilihan | Status verifikasi | Catatan |
|---|---|---|---|
| Papan kisi | Canvas 2D di thread utama dengan lapisan DOM untuk panel. Cadangan layar kecil: zoom dengan Pointer Events | Pilihan saya, belum dicoba | 20 x 20 petak dengan puluhan token cukup untuk Canvas 2D. WebGL (Babylon sudah dimuat untuk dadu) tidak perlu dan menambah beban HP murah |
| Pencarian jalur dan jangkauan gerak | BFS dan A* di Web Worker | Algoritma standar | Peta berisi rintangan dan medan sulit (biaya gerak 2). Hasil: petak yang terjangkau dengan sisa kecepatan |
| Garis pandang dan cover | Bresenham atau shadowcasting di kisi | Algoritma standar | Cover setengah dan tiga perempat sesuai aturan |
| Keadaan pertarungan | Reducer murni dan log kejadian (event sourcing). Undo dan replay dari log | Pola sendiri. Sama dengan N2 dan N18 di rencana | Bisa dites tanpa tampilan: Node menjalankan ribuan pertarungan |
| Acak yang bisa diulang | PRNG seed (mulberry32 atau sejenis) untuk hasil dan AI. Dadu 3D hanya tampilan, nilai dari log | Pilihan saya. Catatan rencana teknologi: dice-box tidak punya opsi hasil yang ditentukan dulu | Menjaga tes dan replay stabil. Mode "I rolled myself" tetap ada |
| Pengurai stat block | Baca tag terstruktur dari data 5etools (`{@atkr m}`, `{@hit 4}`, `{@damage 1d6 + 2}`, `{@dc 11}`) | Diukur 2026-10-29 pada 330 makhluk SRD: dari 748 aksi, 423 serangan, 134 save, 178 Multiattack, 13 lain. Sekitar 98 persen aksi punya tag struktur. Koreksi 2026-10-29: pengurai nyata (`tools/tg-proto/statblock-parse.mjs`) membaca 90,2 persen aksi SRD dan 88,3 persen dari 503. Sisanya gerak, Shape-Shift, Parry, dan efek khusus, diselesaikan manual | 13 aksi lain dan efek khusus diselesaikan manual di papan (pemain lempar sendiri) |
| Kontrol musuh dan sekutu | Tanpa AI. Pemain memilih token mana saja pada giliran token itu. Aksi musuh diambil dari stat block, serangan dan save dihitung mesin, keputusan tetap dari pemain | Keputusan user 2026-10-29 | Peran sekutu (frontliner, penembak, penyembuh) hanya teks petunjuk di kartu, tidak mengatur gerakan |
| Sentuh di HP (390 x 844) | Zoom dan geser dengan Pointer Events, ketuk petak, panel aksi sebagai bottom sheet | Pilihan saya, belum dicoba | Petak sentuh minimal 44 px berarti kisi harus bisa di-zoom. Perlu uji di perangkat |
| Aksesibilitas | Navigasi papan dengan panah dan Enter, log sebagai `aria-live`, daftar aksi sebagai tombol | Standar WAI | Axe 0 pelanggaran dan tombol 44 px tetap jadi syarat |
| Suara | WebAudio dengan bunyi sintetis kecil, tanpa berkas | Pilihan saya | Mengikuti setelan suara dan Motion |
| Penyimpanan | IndexedDB, satu pertarungan aktif per karakter. Tidak menyentuh data sheet | Pola sama dengan penyimpanan sekarang | Tanpa key baru di localStorage |
| Offline | Service worker menyimpan aset yang pernah dibuka | Sudah ada | Seluruh mode solo jalan offline |
| Mode party (With your party) | Cloudflare Durable Objects dengan WebSocket | Diverifikasi 2026-10-29: tersedia di paket Workers Free hanya dengan backend SQLite. Batas harian gratis: 100.000 permintaan, 13.000 GB-s, 5 juta baris baca, 100.000 baris tulis, 5 GB data. Pesan WebSocket masuk dihitung 20 berbanding 1 | Butuh pindah ke Workers (G5), karena app sekarang di Pages. Ditunda sampai solo selesai |

### 5b. Teknologi terbaru untuk Training Ground (dicek di caniuse 2026-10-29)
Semua butuh cadangan. Fitur yang tidak ada di browser pemain tidak boleh merusak pertarungan.

| Kebutuhan | Teknologi | Dukungan global | Cadangan | Fase |
|---|---|---|---|---|
| Gambar papan tanpa menahan UI | OffscreenCanvas di Web Worker (render papan dan token di worker) | 96,76 persen (Chrome 69, Safari 17, Firefox 105). Safari 16.2 sampai 16.6 sebagian | Canvas 2D di thread utama | TG2 |
| Kerja berat tidak membekukan HP | Pencarian jalur dan muat 503 makhluk di Worker. `scheduler.yield()` hanya di loop utama | 73,79 persen. Safari belum mendukung | `setTimeout(0)` atau `MessageChannel` | TG0, TG2 |
| Ganti layar (pilih, papan, hasil) | View Transitions same-document | 92,91 persen (Chrome 111, Safari 18, Firefox 144). Dicek 2026-10-29 | Tanpa animasi | TG1 |
| Panel dan kartu muncul halus | `@starting-style` dengan top layer (`popover`, `dialog`) | 93,05 persen | Muncul langsung | TG1, TG3 |
| Kartu aksi menempel ke token | CSS Anchor Positioning, dipadukan dengan Anchor Spotlight dari T11 | 87,36 persen, di Chrome dan Firefox masih sebagian | Posisi manual lewat JS | TG3 |
| Animasi HP, giliran, dan hit | `@property` untuk bilah HP yang bergerak halus. `animation-timeline` untuk efek geser | `@property` 96,13 persen. `animation-timeline` 87,84 persen | Bilah tanpa animasi | TG3 |
| Judul kartu rapi | `text-wrap: balance` | 93,58 persen | Teks biasa | TG1 |
| Layar tetap menyala saat bertarung | Screen Wake Lock | 96 persen | Tidak ada, sesi bisa redup | TG2 |
| Bagikan susunan pertarungan | Compression Streams (gzip) lalu tautan atau Web Share | Compression 96,67 persen. Web Share 94,17 persen, tanpa Firefox desktop | Salin tautan ke papan klip | TG4 |
| Rekam pertarungan jadi video | `canvas.captureStream()` dengan MediaRecorder | captureStream 97,24 persen. MediaRecorder belum dicek | Tombol disembunyikan | TG7 |
| Kontrol pakai gamepad | Gamepad API | 97,24 persen | Papan tetap bisa dengan ketuk dan keyboard | TG2 |
| Mode party tanpa server game | WebRTC data channel antar pemain. Satu perantara kecil hanya untuk sambungan awal | 97,26 persen (Chrome 24, Safari 11, Firefox 22) | Durable Objects (TG7 lewat G5) | TG7 |
| Simpan 503 makhluk | Origin Private File System (OPFS) | 95,57 persen (Chrome 86, Safari 15.2, Firefox 111) | IndexedDB | TG0b |
| Daftar 503 makhluk ringan | `content-visibility: auto` dan daftar virtual | 94,85 persen (Chrome 85, Safari 18, Firefox 125) | Daftar virtual saja | TG1 |
| Getar saat kena serangan | Vibration API | 77,22 persen. Safari tidak mendukung, Firefox sudah melepas | Tanpa getar. Hanya tambahan | TG3 |
| Penggaris jarak | Buatan sendiri di kisi (lihat 5c) | Tanpa API baru | Tidak perlu | TG2 |
| Tombol Back | Navigation API dan hash (A6 dari T11) | Sudah ada di app | Hash | TG1 |
| Hasil lempar dari dadu 3D | dice-box (Babylon 9.32.1 dan Havok 1.3.14) | Sudah ada | Dadu 2D | TG3 |

Catatan fitur tanpa cadangan murah: `scheduler.yield()` (Safari nol) dan Anchor Positioning (sebagian) hanya dipakai bila cadangannya sudah ada di fase yang sama.

### 5c. Teknologi buatan sendiri (izin user: boleh bila mentok)
Syarat dari G6 berlaku: tanpa AI berbayar, tingkat gratis, ada tes, dicatat di rencana lebih dulu.

| Usulan | Masalah yang dijawab | Cara kerja | Tes |
|---|---|---|---|
| Replay pertarungan | Pemain ingin melihat ulang atau membagikan | Log kejadian plus seed dijalankan ulang oleh reducer. Tautan berisi log terkompresi (Compression Streams) | Replay menghasilkan HP dan posisi yang sama dengan aslinya | Status 2026-10-29: prototipe codec ada di `tools/tg-proto/replay-codec.mjs`, tes 2.000 log acak lolos (hasil sama persis). Tautan 300 kejadian realistis: 903 karakter. 400 kejadian acak penuh: sampai 2.374 karakter. Catatan: prototipe ditulis sebelum dicatat di rencana, urutan ini terbalik dari syarat |
| Papan tes headless | Memastikan aturan benar tanpa tampilan | Node menjalankan ribuan pertarungan seed tetap, mencatat NaN, loop, dan HP tidak konsisten | Bagian dari TG0 |
| Penggaris jarak | Pemain tidak tahu jarak antar token | Seret dari token, papan menghitung petak dan kaki dengan kisi dan biaya medan yang sama dengan pencarian jalur | Jarak diagonal dan medan sulit sama dengan hasil pencarian jalur |
| Pemuat makhluk bertahap | 503 makhluk membebani HP | Indeks kecil (nama, CR, tipe, SRD) dimuat dulu. Stat block penuh dimuat saat dipilih, disimpan di IndexedDB | Waktu muat Home tidak naik, 503 entri terbaca |

### 5e. Sprite sheet dan atlas (dari video user 2026-10-30, ditambahkan karena sebelumnya tidak ada di rencana)
Isi video: satu berkas per gerakan memaksa kartu grafis ganti tekstur puluhan kali per detik (texture thrashing). Solusinya satu atlas, lalu geser jendela UV. Pengukuran di app ini: ikon 989 berkas AVIF 128 x 128 (item 676, spell 199, sisanya kategori), rata-rata 3,5 KB, total 3,4 MB, dimuat satu per satu. Spell naik ke 455 bila 256 ikon Codex masuk.

| Tempat | Masalah di video berlaku? | Keputusan |
|---|---|---|
| Papan Training Ground (Canvas 2D) | Ya. Puluhan token dan lencana per kerangka. Satu gambar sumber lebih ringan dari puluhan | Pakai atlas. Satu atlas maksimal 2048 x 2048, sel 128, jarak antar sel dan tepi digandakan 2 piksel agar tidak bocor saat zoom |
| Lencana kondisi dan damage di token | Ya. 32 ikon yang sudah ada (condition 16, damage 16) | Satu atlas lencana, dibuat dari ikon yang ada tanpa gambar baru |
| Efek (kena, meleset, api, sembuh) dan animasi token | Ya. Video menyebut efek dan proyektil di sheet yang sama | Sheet bingkai: idle, kena, jatuh. Langkah bingkai lewat indeks, bukan berkas baru. Gambar dari Codex, risiko: konsistensi antar bingkai |
| Daftar ikon di sheet (DOM, `img`) | Tidak langsung. Kartu grafis tidak ganti tekstur untuk elemen DOM, browser menyusunnya sendiri | Jangan buat atlas dulu. Atlas penuh 1.000 ikon tidak muat. Satu atlas 2048 menampung 256 ikon dan didekode utuh (sekitar 16 MB) meski hanya satu ikon terlihat. Ukur dulu jumlah permintaan dan memori sebelum memutuskan |

Alat: `tools/atlas_pack.py` menyusun atlas dan berkas peta sel (`x, y, w, h`), tanpa pustaka berat. Lalu `createImageBitmap` sekali dan `drawImage` per sel.

Tes: (1) tidak ada piksel tetangga bocor pada zoom 1x sampai 4x, dibandingkan per piksel, (2) jumlah permintaan gambar papan turun, (3) waktu gambar per kerangka sebelum dan sesudah di HP lemah (throttle CPU), (4) data lama tidak berubah.
Fase: TG2 (papan) dan TG6 (efek dan bingkai dari Codex). Ukur ikon DOM di G6.

### 5f. N32 Atlas Hidup (rancangan 2026-10-30, belum dibuat, menunggu perintah user)
Angka ukuran di bawah adalah perkiraan, belum terukur.

| Bagian | Isi |
|---|---|
| Pengemas saat build | `tools/atlas_pack.py` menaruh ikon dan bingkai di grid sel, menulis satu AVIF dan satu berkas peta (`x, y, w, h`). Tepi tiap sel digandakan 2 piksel. Atlas dipisah per tujuan (lencana, efek, bingkai token), maksimal 2048 x 2048 |
| Gambar dari satu bitmap | `createImageBitmap` sekali per atlas, lalu `drawImage` per potongan. Koordinat tujuan dibulatkan ke piksel utuh agar tidak ada garis tipis |
| Zoom tanpa buram | Canvas 2D tidak punya mipmap. Atlas dibuat dua ukuran, penuh dan setengah. Papan memilih sesuai zoom |
| Animasi dari log | Bingkai = (waktu log / lama bingkai) mod jumlah bingkai. Replay (`tools/tg-proto/replay-codec.mjs`) dan tautan bagikan menampilkan animasi yang sama persis |
| Token 503 makhluk tanpa 503 gambar | Token dirakit dari atlas: ikon tipe makhluk (16 sudah ada), cincin warna sisi (pemain, musuh, sekutu), angka. Gambar per makhluk dari Codex masuk belakangan sebagai halaman atlas tambahan yang dimuat saat dibutuhkan. TG2 tidak menunggu art Codex |
| Buang bingkai kembar | Pengemas menghitung hash tiap sel. Bingkai identik disimpan sekali, tabel indeks menunjuk ke sel yang sama |

Perkiraan awal: atlas lencana dari 32 ikon yang ada sekitar 1056 x 528 px, memori terdekode sekitar 2,2 MB, berkas mungkin di bawah 120 KB. Satu atlas penuh 2048 x 2048 memakan sekitar 16 MB terdekode, jadi jumlahnya dibatasi.

Tidak dipakai: atlas untuk daftar ikon di sheet (elemen DOM tidak mengalami ganti tekstur, dan atlas penuh memaksa dekode 16 MB demi satu ikon). Ukur dulu di G6.

Tes nanti: (1) perbandingan piksel zoom 1x sampai 4x tanpa kebocoran warna, (2) waktu gambar per kerangka sebelum dan sesudah dengan CPU dilambatkan, (3) jumlah permintaan gambar turun, (4) replay menghasilkan animasi sama.

Keputusan user yang menunggu: ukuran sel. Saran: 128 px untuk token (tajam sampai zoom 2x di layar retina), 64 px untuk lencana (lebih ringan). Alternatif: 128 px untuk semua (tajam, atlas lebih besar), 64 px untuk semua (ringan, buram saat zoom).

### 5g. Hasil riset 10 video BONEBOXID GAME (2026-10-30)
Ringkasan dan analisa lengkap di `reports/riset-video-boneboxid-2026-10-30.md`. Usulan N33 sampai N41 (tabel fitur petak, mesin aturan bilangan bulat, sidik jari keadaan dan sambungan, arena dari seed, gambar hanya saat perlu, animasi berbasis waktu, glyph SDF, area sihir) menunggu perintah user. Yang paling menentukan untuk TG0: N34 dan N35.

## 6. Cakupan aturan (bertingkat)
| Tingkat | Isi | Perilaku |
|---|---|---|
| A otomatis penuh | Serangan senjata, damage dan jenis damage, save, kondisi dasar, gerak, Dash, Disengage, Dodge, Help, Hide, opportunity attack, End Turn, Hit Point, death save, resource Limited Use | Dihitung mesin |
| B otomatis sebagian | Spell damage dan save berbasis hit atau DC, penyembuhan, spell kondisi sederhana (Hold Person, Bless) | Mesin menghitung angka, durasi dan konsentrasi dilacak |
| C manual dibantu | Spell lain, fitur kelas rumit, efek area bentuk khusus | Kartu penjelasan aturan dan tombol "I resolved it" dengan input hasil |
Aturan dicek ke PHB dan DMG 2024 di `books/` (bila tidak ada, dicatat). Monster Manual tidak ada di `books/`. Angka stat block dari data yang sudah ada dan dari SRD (bagian 7).

## 7. Data makhluk (dicari 2026-10-29)
### 5etools (mirror GitHub 5etools-mirror-3/5etools-src, `data/bestiary/bestiary-xmm.json`)
Diunduh dan dianalisis dari shell.
| Hal | Hasil |
|---|---|
| Isi | Monster Manual 2024 (XMM): 503 makhluk, struktur JSON penuh |
| Bidang | AC, HP (rata-rata dan rumus), kecepatan, enam ability, save, skill, resist, immune, kondisi kebal, senses, bahasa, CR, aksi, aksi bonus, reaksi, trait, legendary action, spellcasting. Tanpa `_copy` (tidak perlu penggabungan) |
| Penanda SRD | Bidang `srd52: true` pada 330 dari 503 makhluk. Penanda ini dari 5etools. Saya belum mencocokkannya dengan PDF SRD 5.2.1 |
| Teks aksi | Memakai tag: `{@atkr m} {@hit 4}, reach 5 ft. {@h}5 ({@damage 1d6 + 2}) Slashing damage`. Mudah diurai |
| Gambar | `hasFluffImages` dan `hasToken` pada 330 SRD. Gambar itu ilustrasi WotC, tidak dipakai. Ilustrasi kita dari Codex |
| Lisensi repositori | MIT untuk kode proyek 5etools (README). Isi data adalah materi WotC. Bagian SRD berlisensi CC-BY-4.0 |
| Makhluk di video yang ada | Goblin Warrior, Goblin Boss, Goblin Minion, Bugbear Warrior, Ghoul, Giant Spider, Skeleton, Wolf, Dire Wolf, Manticore, Wight, Priest, Priest Acolyte, Knight, Mage: semua `srd52: true`. Nama "Orc" dan "Acolyte" persis tidak ada di XMM 2024 |

Sebaran CR (semua XMM dan yang berpenanda SRD) per tingkat kesulitan seperti di video:
| Tingkat | CR | Semua | SRD |
|---|---|---|---|
| Easy | 1/4 | 44 | 32 |
| Medium | 1/2 sampai 1 | 75 | 54 |
| Hard | 2 sampai 3 | 100 | 67 |
| Extreme | 3 sampai 6 | 127 | 77 |
| Infernal | 7 sampai 10 | 67 | 30 |
| Deadly | 11 sampai 16 | 45 | 27 |
| Legendary | 17 sampai 21 | 18 | 12 |
Setiap tingkat punya cukup makhluk bahkan hanya dari yang berpenanda SRD. Dari 330, 64 punya spellcasting dan 30 punya legendary action.

### Wiki
| Situs | Hasil |
|---|---|
| dnd5e.wikidot.com | Tidak bisa dibuka dari sesi ini (koneksi ditolak proxy, WebFetch gagal). Isinya terutama edisi 2014. Belum dicek |
| dnd-wiki.org (daftar monster 5e) | Memuat sekitar 1.790 makhluk resmi dan buatan penggemar dari banyak buku dan homebrew. Kolom: nama, tipe, subtipe, ukuran, HP, CR, XP, alignment, habitat, sumber. Tanpa catatan lisensi di halaman. Tidak memuat aksi per makhluk di daftar |
Kesimpulan: wiki berguna untuk mencari nama dan CR, tidak cocok sebagai sumber data pertarungan (tanpa aksi terstruktur, campur homebrew, tanpa lisensi). 5etools memberi data terstruktur 2024.

### Pilihan sumber data
| Pilihan | Isi | Catatan |
|---|---|---|
| A. 330 makhluk berpenanda SRD dari 5etools | Angka dan aksi dari data 5etools, hanya yang berpenanda SRD. Atribusi CC-BY-4.0 di Settings dan halaman lisensi | Aman secara lisensi bila penanda 5etools benar. Perlu dicocokkan dengan PDF SRD 5.2.1 sebelum rilis. Teks deskripsi ditulis ulang dengan kata sendiri sesuai aturan proyek |
| B. Semua 503 dari 5etools (DIPILIH user 2026-10-29) | Seperti data 72 stat block sekarang ("Text follows the 5e.tools data") | 173 makhluk di luar SRD adalah materi WotC berhak cipta. User memutuskan memakainya. Pengaman di bawah |
| C. Makhluk buatan sendiri | Daftar yang dirancang sendiri | Aman, butuh waktu menyeimbangkan |
Keputusan: B. Pengaman yang dicatat: (1) tiap entri menyimpan `src` dan penanda `srd` (330 berpenanda SRD, 173 bukan), supaya bisa disaring atau dibuang tanpa menyentuh yang lain. (2) Kartu dan log menampilkan sumber (XMM dan halaman). (3) Atribusi CC-BY-4.0 untuk bagian SRD di Settings dan halaman lisensi. (4) Teks deskripsi bebas (bukan angka dan aturan aksi) ditulis ulang dengan kata sendiri sesuai aturan proyek. (5) Data diubah ke format app lewat skrip `tools/` yang bisa diulang, dimuat sebagai blok `data-defer` sendiri supaya tidak memperbesar muat awal. (6) Makhluk Retromistika milik user ditambah bila diminta.

## 8. Fase kerja
| Fase | Isi | Selesai bila |
|---|---|---|
| TG0 | Mesin pertarungan tanpa tampilan (reducer, giliran, gerak, serangan, kondisi, seed). Pengurai stat block. Tes Node | 1.000 pertarungan seed tetap: tanpa NaN dan loop, total HP konsisten, hasil sama saat diulang |
| TG0b | Skrip `tools/` yang mengubah semua 503 makhluk 5etools ke format app, dengan penanda `srd` dan `src` per entri, tes 503 entri | 503 entri masuk, tanpa bidang kosong yang wajib, penanda `srd` benar (330 dan 173) |
| TG1 | Layar pemilihan (Who goes in, What waits, Who comes with you, Where you train) memakai data dan art yang ada, ikon sementara | Tiga skenario wajib di 390 x 844 dan 1250 x 850, axe 0 |
| TG2 | Papan kisi: render, token, gerak dengan jangkauan, urutan giliran, Undo, kamera zoom di HP | Tes layar di dua ukuran, gerak benar menurut pencarian jalur |
| TG3 | Panel aksi (tingkat A), kartu reaksi, log, End Turn | Setiap aksi tingkat A punya tes |
| TG4 | Kontrol semua token oleh pemain: pilih token, aksi dari stat block (serangan, save, Multiattack, legendary), tombol "Roll for enemy" yang menghitung serangan dari stat block, penghitung HP dan kondisi musuh | Tes skrip: urutan aksi tetap menghasilkan log yang sama dengan seed yang sama |
| TG5 | Spell dan fitur tingkat B, kartu manual tingkat C | Daftar spell per tingkat tercatat di laporan |
| TG6 | Ilustrasi dari Codex: kartu makhluk, token, arena | Tampil HD, tanpa pecah (aturan HD proyek) |
| TG7 | Mode party, rekam video pertarungan | Setelah G5 (Workers) dan keputusan user |

Penempatan: sesudah rilis 0.0.3 dan paket G6 builder, sebagai G7 di rencana teknologi. TG0 bisa mulai lebih awal karena tidak menyentuh tampilan.

## 9. Keputusan yang dibutuhkan dari user
| Pertanyaan | Opsi | Rekomendasi |
|---|---|---|
| Cakupan awal | Solo saja. Solo lalu party | Solo dulu |
| Sumber makhluk | Diputuskan 2026-10-29: B, semua 503 | Selesai |
| Cakupan spell | Tingkat A dan B dulu, C manual. Semua otomatis | A dan B dulu |
| Ilustrasi | Minta Codex setelah TG1. Pakai ikon sementara dulu | Ikon sementara dulu, minta Codex paralel |
| Tempat di app | Kartu di Home. Item di menu More | Kartu di Home bersama Learn |
| Waktu | Sesudah 0.0.3 dan G6 | Setuju seperti di bagian 8 |

## Risiko
| Risiko | Penanganan |
|---|---|
| Cakupan sangat besar | Fase kecil dengan tes di tiap fase. Rilis solo tingkat A dan B lebih dulu |
| Aturan salah | Cek ke buku di `books/`, tes simulasi, laporan tingkat A, B, C |
| Lisensi data makhluk | Pilihan A di bagian 7, cocokkan penanda SRD dengan PDF SRD 5.2.1, atribusi di Settings dan halaman lisensi |
| Papan sulit dipakai di HP | Zoom dan bottom sheet, uji di perangkat, targetnya 44 px |
| Mode party butuh Workers | Ditunda sampai G5 |

## Sumber
- Video referensi dari user (Oneon Training Ground), dibaca dari cuplikan gambar
- Can I use (dicek 2026-10-29): mdn-api_rtcdatachannel, mdn-api_filesystemdirectoryhandle, css-content-visibility, vibration, mdn-api_document_startviewtransition, offscreencanvas, css-anchor-positioning, mdn-api_htmlcanvaselement_capturestream, mdn-api_scheduler_yield, gamepad
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [D&D Beyond SRD v5.2.1](https://dndbeyond.com/srd)
- [D&D Beyond: SRD 5.2 dan lisensi CC-BY-4.0](https://www.dndbeyond.com/posts/1717-2024-core-rulebooks-to-expand-the-srd)
- Data app: `src/data/wotc13-creature-stat-blocks.js` (72 stat block)
- [5etools-mirror-3/5etools-src](https://github.com/5etools-mirror-3/5etools-src) (`data/bestiary/bestiary-xmm.json`, MIT untuk kode proyek)
- [dnd-wiki.org daftar monster 5e](https://new.dnd-wiki.org/wiki/5e_Monster_List)

### 5d. Teknologi buatan sendiri tahap berikutnya (diusulkan 2026-10-29, belum dibuat)
| Usulan | Masalah | Cara kerja | Tes |
|---|---|---|---|
| Dadu 3D yang menunjukkan nilai dari log | dice-box tidak bisa menetapkan hasil dulu | Biarkan fisika berjalan, baca sisi atas, lalu petakan ulang label sisi agar sama dengan nilai log. Pemain melihat dadu jatuh normal | Uji 1.000 lemparan d20 di browser, sisi atas selalu sama dengan nilai log |
| Pengurai stat block terstruktur | Aksi makhluk berupa teks | Ubah tag 5etools jadi objek serangan, save, dan Multiattack | Hitung terbaca mesin pada 330 SRD, target sekitar 98 persen | Status: prototipe jadi. 503 makhluk, 1.388 aksi: serangan 648, save 258, Multiattack 301, rujukan 39, cast 25, manual 168. Semua serangan lolos cek dadu dan bonus |
| Penempatan awal otomatis | Menaruh puluhan token satu per satu lambat | Susun kelompok dalam spiral di sekitar titik pilihan, hindari rintangan | Tidak ada token bertumpuk, semua di petak yang boleh dilalui |
