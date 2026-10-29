# Rencana kerja Training Ground (2026-10-29)

Referensi: video Oneon Training Ground (56 detik, dibaca dari cuplikan gambar). Permintaan user: app ini punya Training Ground, analisa teknologinya secara mendalam, catat di rencana kerja.
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
| Kecerdasan musuh dan sekutu | Sedang |
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
| Pengurai stat block | Regex untuk pola serangan, save, dan multiattack di data yang ada | Pola teks terlihat di entri Knight dan Lion. Cakupan penuh belum diukur | Yang tidak terurai ditandai dan diselesaikan manual di papan (pemain lempar sendiri) |
| AI musuh dan sekutu | Penilaian utilitas dengan peran (frontliner, ranged, healer, caster) | Pilihan saya | Satu fungsi nilai per aksi: target, risiko, jangkauan. Mudah dites dengan seed |
| Sentuh di HP (390 x 844) | Zoom dan geser dengan Pointer Events, ketuk petak, panel aksi sebagai bottom sheet | Pilihan saya, belum dicoba | Petak sentuh minimal 44 px berarti kisi harus bisa di-zoom. Perlu uji di perangkat |
| Aksesibilitas | Navigasi papan dengan panah dan Enter, log sebagai `aria-live`, daftar aksi sebagai tombol | Standar WAI | Axe 0 pelanggaran dan tombol 44 px tetap jadi syarat |
| Suara | WebAudio dengan bunyi sintetis kecil, tanpa berkas | Pilihan saya | Mengikuti setelan suara dan Motion |
| Penyimpanan | IndexedDB, satu pertarungan aktif per karakter. Tidak menyentuh data sheet | Pola sama dengan penyimpanan sekarang | Tanpa key baru di localStorage |
| Offline | Service worker menyimpan aset yang pernah dibuka | Sudah ada | Seluruh mode solo jalan offline |
| Mode party (With your party) | Cloudflare Durable Objects dengan WebSocket | Diverifikasi 2026-10-29: tersedia di paket Workers Free hanya dengan backend SQLite. Batas harian gratis: 100.000 permintaan, 13.000 GB-s, 5 juta baris baca, 100.000 baris tulis, 5 GB data. Pesan WebSocket masuk dihitung 20 berbanding 1 | Butuh pindah ke Workers (G5), karena app sekarang di Pages. Ditunda sampai solo selesai |

## 6. Cakupan aturan (bertingkat)
| Tingkat | Isi | Perilaku |
|---|---|---|
| A otomatis penuh | Serangan senjata, damage dan jenis damage, save, kondisi dasar, gerak, Dash, Disengage, Dodge, Help, Hide, opportunity attack, End Turn, Hit Point, death save, resource Limited Use | Dihitung mesin |
| B otomatis sebagian | Spell damage dan save berbasis hit atau DC, penyembuhan, spell kondisi sederhana (Hold Person, Bless) | Mesin menghitung angka, durasi dan konsentrasi dilacak |
| C manual dibantu | Spell lain, fitur kelas rumit, efek area bentuk khusus | Kartu penjelasan aturan dan tombol "I resolved it" dengan input hasil |
Aturan dicek ke PHB dan DMG 2024 di `books/` (bila tidak ada, dicatat). Monster Manual tidak ada di `books/`. Angka stat block dari data yang sudah ada dan dari SRD (bagian 7).

## 7. Data makhluk
| Pilihan | Isi | Risiko |
|---|---|---|
| Perluas data yang ada | Tambah stat block dari SRD 5.2.1 | SRD 5.2.1 berlisensi CC-BY-4.0 dan memuat bagian Monsters (dicek 2026-10-29 di dndbeyond.com/srd). Jumlah stat block dan kata atribusi yang wajib belum saya baca dari PDF SRD. Dari halaman terlihat: tidak ada Beholder dan tidak ada nama seperti Strahd. Halaman itu tidak menyebut Goblin, Orc, atau Ghoul, jadi kartu seperti di video belum tentu ada di SRD |
| Tulis ulang dengan kata sendiri dari buku yang dimiliki user | Sesuai aturan proyek (teks app ditulis ulang) | Monster Manual tidak ada di `books/` |
| Makhluk buatan sendiri | Daftar makhluk Training Ground yang dirancang sendiri dengan nama dan gaya sendiri, mengikuti pola CR | Aman secara lisensi, butuh waktu menyeimbangkan |
Catatan: data 72 stat block yang ada ditulis "Text follows the 5e.tools data". Sebelum dipakai di mode yang lebih terbuka, status lisensinya perlu dicek dan dicatat. Keputusan ada di user.

## 8. Fase kerja
| Fase | Isi | Selesai bila |
|---|---|---|
| TG0 | Mesin pertarungan tanpa tampilan (reducer, giliran, gerak, serangan, kondisi, seed). Pengurai stat block. Tes Node | 1.000 pertarungan seed tetap: tanpa NaN dan loop, total HP konsisten, hasil sama saat diulang |
| TG1 | Layar pemilihan (Who goes in, What waits, Who comes with you, Where you train) memakai data dan art yang ada, ikon sementara | Tiga skenario wajib di 390 x 844 dan 1250 x 850, axe 0 |
| TG2 | Papan kisi: render, token, gerak dengan jangkauan, urutan giliran, Undo, kamera zoom di HP | Tes layar di dua ukuran, gerak benar menurut pencarian jalur |
| TG3 | Panel aksi (tingkat A), kartu reaksi, log, End Turn | Setiap aksi tingkat A punya tes |
| TG4 | AI musuh dan sekutu dengan peran, kesulitan per CR | Simulasi 1.000 pertarungan per tingkat kesulitan: hasil menang sesuai harapan yang ditetapkan |
| TG5 | Spell dan fitur tingkat B, kartu manual tingkat C | Daftar spell per tingkat tercatat di laporan |
| TG6 | Ilustrasi dari Codex: kartu makhluk, token, arena | Tampil HD, tanpa pecah (aturan HD proyek) |
| TG7 | Mode party | Setelah G5 (Workers) dan keputusan user |

Penempatan: sesudah rilis 0.0.3 dan paket G6 builder, sebagai G7 di rencana teknologi. TG0 bisa mulai lebih awal karena tidak menyentuh tampilan.

## 9. Keputusan yang dibutuhkan dari user
| Pertanyaan | Opsi | Rekomendasi |
|---|---|---|
| Cakupan awal | Solo saja. Solo lalu party | Solo dulu |
| Sumber makhluk | Perluas dari SRD 5.2.1. Makhluk buatan sendiri. Campuran | Campuran: SRD untuk yang ada, buatan sendiri untuk sisanya |
| Cakupan spell | Tingkat A dan B dulu, C manual. Semua otomatis | A dan B dulu |
| Ilustrasi | Minta Codex setelah TG1. Pakai ikon sementara dulu | Ikon sementara dulu, minta Codex paralel |
| Tempat di app | Kartu di Home. Item di menu More | Kartu di Home bersama Learn |
| Waktu | Sesudah 0.0.3 dan G6 | Setuju seperti di bagian 8 |

## Risiko
| Risiko | Penanganan |
|---|---|
| Cakupan sangat besar | Fase kecil dengan tes di tiap fase. Rilis solo tingkat A dan B lebih dulu |
| Aturan salah | Cek ke buku di `books/`, tes simulasi, laporan tingkat A, B, C |
| Lisensi data makhluk | Keputusan di bagian 7, atribusi di Settings dan halaman lisensi |
| Papan sulit dipakai di HP | Zoom dan bottom sheet, uji di perangkat, targetnya 44 px |
| Mode party butuh Workers | Ditunda sampai G5 |

## Sumber
- Video referensi dari user (Oneon Training Ground), dibaca dari cuplikan gambar
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [D&D Beyond SRD v5.2.1](https://dndbeyond.com/srd)
- [D&D Beyond: SRD 5.2 dan lisensi CC-BY-4.0](https://www.dndbeyond.com/posts/1717-2024-core-rulebooks-to-expand-the-srd)
- Data app: `src/data/wotc13-creature-stat-blocks.js` (72 stat block)
