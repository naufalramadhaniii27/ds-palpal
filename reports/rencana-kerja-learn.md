# Rencana kerja Learn: Hoot's Training Grounds (2026-10-29)

Satu dokumen berisi seluruh riset, keputusan, dan urutan kerja Learn. Log usulan U1 sampai U37 dan aturan "catat usulan baru" tetap di claude/rencana-menu-learn.md.

## Status (2026-10-29, rilis 0.0.3)
User 2026-10-29 17.22 WIB: Learn jadi prioritas dan dirilis secepatnya, kualitas tetap dijaga. Keputusan Claude untuk rilis 0.0.3:
| Bagian | Status |
|---|---|
| F0 Fondasi | Selesai. Data dua bahasa (src/learn/45), progres `cs-learn-v1` ikut PF_KEYS, band di Home, blok tunda `learn`, gerbang bahasa di build (tools/learn_lint.js, U43 dan U48) |
| F1 Mesin tantangan | Selesai: Tebak, Lihat (frame dari data, U38), Coba (pilih, lempar, nilai sendiri, grid, HP, dadu, dua d20), Kenapa, Find it on your sheet dengan Anchor Spotlight (U41), kamus popover, "I know this", XP yang tidak pernah turun |
| F2 Jalur Inti | Selesai: Tavern, Rooftops, Forest, Campsite, Market, cek akhir 5 soal |
| F4 Tempat Bonus | Meet Your Dice dan Windy Cliff ikut 0.0.3. Sisanya rilis berikutnya |
| F3, F5, recap, corong Admin | Rilis berikutnya |
| F6 Gambar Codex | Gambar sementara dari app (burung hantu di vig/empty/spells untuk Hoot). Diganti saat batch 234 sampai 236 jadi |
| F7 | Tes otomatis selesai (tests/learn_flow.py: 3 skenario wajib, 2 ukuran, EN dan ID, Back, Motion off, tanpa anchor positioning, 3D dice). Uji main dengan orang sungguhan dan cek Safari di iPhone tetap tugas user |

## Tujuan dan batas
| Hal | Keputusan |
|---|---|
| Pengguna | Orang awam, remaja dan dewasa, yang belum pernah main game peran |
| Patokan bahasa | Bacaan anak 10 tahun (jenjang B3 dan C Kemendikbudristek). Nada santai untuk dewasa, tidak kekanak-kanakan |
| Bahasa | English (bawaan) dan Bahasa Indonesia, khusus Learn |
| Aturan | D&D 2024 saja, dicocokkan ke Library app |
| Bentuk | Belajar interaktif, bukan komik. Tanpa suara. Visual dulu |
| Gambar | Claude jalan duluan dengan gambar sementara. Gambar Codex (batch 234 sampai 236) dipasang begitu jadi |
| Tidak dibuat | Komik, tombol "Read to me", Family Mode, track khusus DM, belajar bareng teman (U51), chat AI, dadu AR. Dadu fisika memakai dice-box (keputusan user 2026-10-29) |

## Ukuran berhasil
| Ukuran | Target | Cara ukur |
|---|---|---|
| Selesai Jalur Inti tanpa dibantu | Orang awam di uji main | U21 |
| Paham | 4 dari 5 pertanyaan inti benar | Kuis akhir Jalur Inti di uji main |
| Waktu Jalur Inti | Sekitar 15 menit, maksimal 20 | Uji main dan corong Admin |
| Berhenti di tengah | Kurang dari 20 persen per tempat | Corong Admin (angka total saja) |
| Teks | 100 persen kalimat lolos cek keterbacaan | Tes Checker U13 |

## 12 prinsip desain (ringkasan riset)
| No | Prinsip | Dasar riset | Usulan |
|---|---|---|---|
| 1 | Satu hal per tempat, Jalur Inti pendek, sisanya bonus | AERO, The Angry GM, GDevelop | U14 |
| 2 | Pola tetap: Tebak, Lihat, Coba bareng, Coba sendiri, Kenapa, Find it on your sheet | AERO, IES (kuis, pertanyaan kenapa), worked example | U33, U24 |
| 3 | Tunjukkan, jangan tulis. Hoot memperagakan, tangan bayangan menunjuk | READISTANCE, keputusan tanpa suara | U29, U17 |
| 4 | Maksimal 2 kalimat per langkah, kata menempel di gambar | Nielsen Norman Group, IES | U11, U35 |
| 5 | Hitungan konkret, gambar, lalu angka seperti di sheet | CPA Singapura, IES | U34, U16 |
| 6 | Nama ramah dulu, istilah buku di sampingnya, dicocokkan ke Library | Riset pemain baru, Library app | U6, U15 |
| 7 | Umpan balik menyebut langkah yang benar. Tidak ada "salah", petunjuk lalu coba lagi | EEF | U22, U36 |
| 8 | Ide kreatif dihargai, lebih dari satu jawaban benar | Ulasan Adventure Begins | U32 |
| 9 | Pakai karakter sendiri, selalu kembali ke sheet | Riset pemain baru (mencari angka di sheet) | U1, U24 |
| 10 | Ulang dengan jeda: recap paling cepat sehari setelahnya | IES (jeda dan kuis) | U26, U36 |
| 11 | Tanpa pancingan, tanpa nilai dan peringkat antarpemain | Finlandia, PP Tunas | U30, U37 |
| 12 | Jalan di semua kondisi app: offline, Motion off, Calm, kontras tinggi, pembaca layar, tombol 48 piksel | Aturan app | U23 |

## Teknologi interaktif (riset 2026-10-29)
Dasar: app sekarang 7,6 MB (2,36 MB gzip), satu file HTML, tanpa library animasi. Pola yang sudah ada di kode dipakai ulang.

| Bagian | Pilihan | Alasan | Dipakai ulang dari kode |
|---|---|---|---|
| Geser kepingan, token, dadu | Pointer Events: setPointerCapture, `touch-action:none` hanya di benda yang digeser, ambang gerak sebelum mulai geser, `overflow-anchor:none` di area gulir | Satu cara untuk jari dan mouse. Tidak bentrok dengan scroll dan swipe app | Geser di 13 (bottom sheet), 27 (Library), 37 (hold and slide), 39 (HP drag) |
| Pengganti geser (WCAG 2.2 SC 2.5.7, level AA) | Setiap geser punya cara ketuk: ketuk benda lalu ketuk tujuan, atau tombol + dan − | Wajib di WCAG 2.2. Juga membantu orang yang sulit menggeser | Library sudah punya tombol Add selain geser |
| Keyboard | Enter atau Spasi mengangkat, panah memindah, Enter menaruh, Esc batal | Pola papan permainan yang aksesibel | Tombol app sudah fokus dengan Tab |
| Animasi dadu | dice-box (D1 di claude/rencana-kerja-teknologi.md), sama dengan dadu di sheet. Keputusan user 2026-10-29 | Dadu 3D berfisika. Hasil tidak bisa ditentukan dulu, jadi peragaan Hoot yang butuh angka tertentu (misal contoh "Pas") memakai contoh tetap tanpa lempar, dan pelajaran menyesuaikan teks dengan hasil lemparan sungguhan | Dibuat di G2 |
| Peragaan Hoot dan tangan bayangan | CSS transform dan opacity, urutan langkah dengan Web Animations API | 0 KB, jalan di luar thread utama. Lottie (sekitar 50 KB runtime) dan Rive (sekitar 200 KB) tidak perlu karena gambar Codex berupa gambar diam | Pola gerak di 19 dan 23 sampai 27 (fx) |
| Motion off dan reduced motion | Peragaan berubah jadi langkah diam bernomor dengan panah. Dadu langsung menampilkan hasil | Aturan app | `REDUCE` di 07, 29-motion-off.css |
| Grid giliran (Forest) | Elemen HTML: `role="grid"`, tiap kotak tombol berlabel, ketuk kotak tujuan untuk jalan, hasil diumumkan lewat `aria-live="polite"` | Canvas tidak terbaca pembaca layar dan tidak ikut zoom | Live region `ordLive` di 40 |
| Sorot sheet | Pindah tab sheet bila perlu, gulir ke elemen, sorot, kembali ke Learn. Bila elemen tidak ada (misal karakter tanpa spell), tampil penjelasan pengganti | Angka bisa ada di tab lain atau di luar layar | `setTab` di 21, tour di 31 |
| Pindah tempat | View Transitions bila didukung, tanpa animasi bila tidak | Sudah dipakai app | Pindah tab di 21 |
| Getar dan suara | `buzz()` dan setelan suara app | Ikut pilihan pengguna | 09, setelan mi-bz dan mi-snd |
| Pemuatan | Blok `data-defer`, dimuat saat Learn dibuka | App tidak lebih lambat dibuka | build.py sudah mendukung `data-defer` |
| Batas ukuran | Kode dan data Learn maksimal 300 KB mentah. Screenshot AVIF sebagai file terpisah, bukan di dalam HTML | Menjaga app tetap cepat | |

### Fitur web terbaru (dicek ke Baseline dan Interop 2026)
Aturan: fitur Baseline dipakai langsung dengan cadangan `@supports` untuk HP lama (iPhone yang masih iOS 18 belum punya anchor positioning). Fitur yang belum Baseline hanya jadi tambahan. App sudah memakai View Transitions, `:has()`, container queries, `@starting-style` dan scroll-driven animations dengan `@supports`.

| Fitur | Status | Dipakai untuk | Cadangan |
|---|---|---|---|
| CSS anchor positioning | Baseline Januari 2026 (Firefox 147, Safari 26, Chrome 125) | Label yang menempel di gambar (U35), kotak Hoot di samping elemen yang disorot di sheet dan builder, tanpa menghitung posisi dengan JS | Posisi dihitung JS seperti tour lama |
| Popover API | Baseline Januari 2025 | Kartu kamus, "When you're stuck", "Playing together". Tampil di top layer, jadi tidak perlu trik z-index. Top layer tetap ikut inert: `homeInert()` di 31 membuat semua anak body inert saat Home terbuka, jadi akar Learn (`#learn`) dan popover-nya ditaruh di dalam akar Learn, lalu `#learn` ditambah ke daftar pengecualian | Tidak perlu |
| Invoker commands (`command`, `commandfor`) | Baseline 12 Desember 2025 (Chrome 135, Firefox 144, Safari dan iOS 26.2) | Tombol buka dan tutup popover tanpa JS | Delegasi klik app yang ada |
| View Transitions (satu dokumen) | Baseline Oktober 2025 | Pindah langkah dan pindah tempat, dadu "terbang" ke kotak hasil | Tanpa animasi |
| `@starting-style` | Baseline Agustus 2024 | Animasi muncul kartu dan kepingan tanpa JS | Muncul langsung |
| Container queries | Baseline | Layar tantangan menyesuaikan lebar panel, bukan lebar layar | Tidak perlu |
| Scroll snap | Interop 2026 | Peta lembah dan daftar tempat di HP | Gulir biasa |
| Navigation API | Baseline 2026 | Tombol Back HP mundur satu langkah di Learn, bukan keluar app | `hashchange` seperti sekarang |
| Custom Highlight API | Baseline 2026 | Tidak dipakai. Sorotannya tidak bisa diketuk dan belum terbaca pembaca layar (isu CSSWG 6498 masih terbuka Maret 2026). Kata kamus tetap tombol biasa | |
| Scroll-driven animations | Belum Baseline (Firefox belum) | Gerak parallax peta, hanya tambahan | Peta diam |
| Interest invokers, `popover="hint"` | Belum Baseline | Tidak dipakai | |
| WebGPU, WebGL, Lottie, Rive | Tersedia tapi berat untuk kebutuhan ini | Tidak dipakai | |

| Catatan | Isi | Penanganan |
|---|---|---|
| Teknologi lebih baru yang sengaja tidak jadi fitur utama | Customizable select (Chrome 135, Safari 27, belum Firefox), View Transitions antarhalaman (belum Firefox), interest invokers dan `popover="hint"` (belum Baseline). Learn satu halaman tanpa dropdown, jadi tidak perlu | Boleh jadi efek tambahan khusus Chrome bila user minta |
| Samsung Internet | Tidak dihitung di Baseline, versinya biasanya tertinggal dari Chrome, banyak dipakai di Android Indonesia | Jalur cadangan `@supports` yang sama |
| Laporan terbaru yang dicek | web.dev edisi September 2026. Edisi Oktober 2026 belum terbit saat dicek (29 Oktober 2026) | Cek ulang daftar Baseline sebelum F7 |

## Teknologi buatan sendiri (U38 sampai U50, diterima 2026-10-29)
| No | Nama | Isi singkat | Masuk tahap |
|---|---|---|---|
| U38 | Choreo | Peragaan sebagai data. Satu naskah menghasilkan animasi, versi Motion off, jalur keyboard, dan skrip tes | F1 |
| U39 | Cermin aturan hidup | Angka pelajaran dihitung mesin derivasi sheet (06). Checker mencocokkan klaim pelajaran dengan mesin | F1, F7 |
| U40 | Explain any number | Ketuk angka di sheet, angkanya disusun ulang dari kepingan asal (dari 11-ui-breakdown.js) | F5 |
| U41 | Anchor Spotlight | Satu mesin sorot untuk tour, Learn, What's New, builder. Menggantikan rencana "tour dijadikan mesin umum" di F3 | F1 (dibuat), F3 dan F5 (dipakai) |
| U42 | Penanda `data-learn` | Titik screenshot, sorotan, dan tes dibuat dari atribut di kode UI | F1, F3 |
| U43 | Gerbang bahasa sederhana | Build gagal bila teks Learn melanggar panduan. Menggantikan tes laporan saja di F0 | F0 |
| U44 | Petunjuk bertingkat tanpa profil | Tingkat petunjuk dari kesalahan di langkah ini saja, tidak disimpan | F1 |
| U45 | Dadu ber-seed | Diubah karena dice-box: tes logika memakai suspendSimulation atau angka masukan, peragaan dengan angka tertentu memakai contoh tetap. Riwayat lemparan dari Game Log | F1 |
| U46 | Peta hubungan angka | Ketuk score, garis SVG ke semua angka yang dipengaruhinya. Geser score, angka ikut berubah. Data dari mesin derivasi (U39) | F4 (Village Green), F5 (di sheet) |
| U47 | Coach mode di meja | Saklar opsional di sheet. Penggunaan pertama suatu aturan memunculkan satu kalimat dan tombol "Learn this", sekali saja | F5 |
| U48 | Cek fakta EN dan ID | Tes: tiap teks punya EN dan ID, angka, nama aturan dan istilah kamus sama di kedua versi | F0 (bagian dari gerbang U43) |
| U49 | Acak yang menjamin cakupan | Crumbling Bridge diacak dari potongan pelajaran, tiap putaran menguji semua aturan inti | F4 |
| U50 | Gerak menyesuaikan HP | Ukur kelancaran animasi pertama (requestAnimationFrame, Long Animation Frames API bila ada). Tersendat: gerak sederhana, setelan Motion tidak diubah | F1, F7 (tes CPU diperlambat) |

## Bahasa dan kamus
### Panduan bahasa (kedua bahasa)
| Aturan | English | Bahasa Indonesia |
|---|---|---|
| Panjang kalimat | Rata-rata 6 sampai 10 kata, maksimal 14 | Rata-rata 6 sampai 9 kata, maksimal 12 (jenjang B3 dan C Kemendikbudristek) |
| Per langkah | Maksimal 2 kalimat | Maksimal 2 kalimat |
| Kata | Kata sehari-hari, kebanyakan 1 sampai 2 suku kata, kalimat aktif | Kata sehari-hari, sapaan "kamu", tanpa bahasa gaul daerah (gue, lo) |
| Istilah aturan | Nama ramah, istilah buku kecil di sampingnya | Nama ramah Indonesia, istilah buku Inggris di sampingnya |
| Nada | Hangat, seru, tidak menggurui | Sama |

Contoh nada (Rooftops):
| Langkah | English | Bahasa Indonesia |
|---|---|---|
| 1 | "Want to jump to that roof? Let's roll!" | "Mau lompat ke atap itu? Ayo lempar dadu!" |
| 2 | "You rolled 12. Your bonus is +3. That makes 15!" | "Dadumu 12. Bonusmu +3. Jadi 15!" |
| 3 | "The Target Number is 13. You got 15. You made it!" | "Angka targetnya 13. Kamu dapat 15. Berhasil!" |
| Pas | "You got 13. Same as the target. That still counts!" | "Kamu dapat 13. Sama dengan target. Tetap berhasil!" |
| Gagal | "So close! Want to try again?" | "Hampir! Mau coba lagi?" |
| Sheet | "On your sheet, this bonus is next to Athletics." | "Di sheet-mu, bonus ini ada di samping Athletics." |

Kamus istilah tetap (U6, dua bahasa):
| Istilah buku | Nama ramah EN | Nama ramah ID | Arti satu kalimat (EN) |
|---|---|---|---|
| d20 | d20 | d20 (dadu 20 sisi) | The 20-sided die you roll the most |
| Modifier | Bonus | Bonus | The number you add to your roll |
| DC | Target Number | Angka target | The number you need to reach |
| AC | Armor Number | Angka armor | The number an attack needs to reach to hit you |
| Proficiency Bonus | Training Bonus | Bonus latihan | Extra bonus for things you trained for |
| Saving Throw | Save Roll | Lemparan bertahan | A roll to resist danger, like a trap, poison or a spell |
| Hit Points (HP) | HP | HP (darah) | How much more you can take before you fall |
| Advantage | Lucky Roll | Lemparan untung | Roll two big dice, keep the higher |
| Disadvantage | Unlucky Roll | Lemparan sial | Roll two big dice, keep the lower |
| Action | Main Action | Aksi utama | The one big thing you do on your turn |
| DM (Dungeon Master) | Story Guide | Pemandu cerita | The person who tells the story and plays everyone else |

### Bahasa Indonesia santai (U28)
Dasar: perjenjangan buku Kemendikbudristek. Anak 10 tahun ada di jenjang B3 (8 sampai 10 tahun) dan C (10 sampai 13 tahun): maksimal 12 kata per kalimat, maksimal 3 kalimat per paragraf, 100 sampai 300 kata yang sering dipakai. Gamer Indonesia sudah biasa dengan istilah game bahasa Inggris (HP, damage, skill, level), dijelaskan dengan bahasa Indonesia.

| Aturan | Isi |
|---|---|
| Sapaan | "Kamu" dan "-mu". Hoot menyebut dirinya "aku" |
| Ragam | Ragam cakap yang sopan (kata cakapan di KBBI). Boleh: yuk, ayo, nih, kok, dong, nggak. Tanpa gue, lo, anjay, atau bahasa daerah |
| Dua lapis | Dialog Hoot santai (boleh "nggak"). Kartu aturan dan kamus semi-baku ("tidak") supaya bisa dipakai mengajar |
| Panjang | Rata-rata 6 sampai 9 kata, maksimal 12. Maksimal 2 kalimat per langkah |
| Kata kerja | Kalimat aktif, kamu sebagai pelaku: "Lempar dadunya!" bukan "Dadu dilempar". Kata kerja Indonesia, bukan kata Inggris berimbuhan: "lempar", bukan "nge-roll" atau "di-roll" |
| Istilah game | Tetap Inggris bila gamer sudah kenal: HP, damage, bonus, level, d20. Istilah aturan lain pakai nama ramah dari kamus |
| Angka | Selalu angka, bukan huruf: "Dadumu 12" |
| Terjemahan | Tulis ulang dari makna, bukan kata per kata. Lelucon dan seruan boleh beda dari versi English asal artinya sama |

Kata kaku yang diganti (dicek otomatis oleh Checker, U13):
| Hindari | Pakai |
|---|---|
| apabila, jika | kalau |
| merupakan | adalah, itu |
| tersebut | itu, ini |
| dapat | bisa |
| memiliki | punya |
| melakukan (aksi) | kata kerjanya langsung: serang, lari, lempar |
| sehingga | jadi |
| namun | tapi |
| mengenai | soal, tentang |
| terlebih dahulu | dulu |
| yakni, yaitu | (pecah jadi dua kalimat) |
| maka | (hapus) |

Contoh sebelum dan sesudah:
| Kaku | Santai |
|---|---|
| "Apabila hasil lemparan Anda sama dengan atau melebihi DC, maka tindakan tersebut berhasil." | "Angkamu sampai ke angka target? Kamu berhasil!" |
| "Setiap giliran, Anda dapat melakukan satu Action." | "Di giliranmu, kamu bisa pilih satu aksi utama." |
| "Hit Points Anda berkurang sesuai damage yang diterima." | "Kena serang? HP-mu turun sebesar damage-nya." |

### Kamus dicocokkan ke Library app (2026-10-29)
Sumber: glossary sheet (src/app/03-data-glossary.js) dan Rules Glossary di Library (src/app/27), keduanya ditulis ulang dari PHB 2024.
| Istilah | Isi Library | Kamus Learn |
|---|---|---|
| Saving Throw | d20 untuk menahan atau menghindari efek, sama atau lebih dari DC berhasil | Cocok |
| Armor Class | Serangan yang sama atau lebih dari AC kena | Cocok |
| Difficulty Class | Angka target untuk ability check dan saving throw. Serangan memakai AC | Cocok. Learn menyebut AC sebagai target serangan |
| Hit Points | 0 HP: jatuh Unconscious, lalu death save | Cocok |
| Advantage, Disadvantage | Dua d20, ambil yang tinggi atau rendah, keduanya saling batal | Cocok. Aturan "saling batal" masuk Windy Cliff |
| Proficiency Bonus | Dari level, untuk serangan, skill, save yang dilatih dan DC fitur | Cocok |
| Action | Satu aksi per giliran: Attack, Dash, Disengage, Dodge, Help, Hide, Influence, Magic, Ready, Search, Study, Utilize | Cocok. Forest memakai nama aksi 2024 ini |
| Bonus Action | Hanya bila fitur atau aturan mengizinkan, satu per giliran | Cocok |
| Heroic Inspiration | Lempar ulang satu dadu, wajib pakai hasil baru, maksimal punya satu | Diperbaiki: Windy Cliff mengajarkan lempar ulang, bukan Advantage (Advantage itu Inspiration aturan 2014) |
| Critical Hit | 20 di d20 serangan selalu kena, dadu damage dilempar dua kali | Ditambah: 20 dan 1 hanya otomatis untuk serangan. Untuk check dan save tetap dihitung biasa |
| D20 Test | Ability check, attack roll, saving throw. DM yang menentukan kapan perlu | Dipakai untuk kartu "Which die do I roll?" (U7) |
Kata di kamus bisa diketuk dan membuka entri Library yang sama, jadi Learn dan Library tidak berbeda isi.

## Tahap kerja
Learn berjalan paralel dengan claude/rencana-kerja-teknologi.md: F0 dan F1 mulai setelah gelombang G2 (Anchor Spotlight dibuat sekali di G2 dan dipakai Learn), F5 setelah G3 (struk angka N3).
Setiap tahap selesai dengan tes. Rilis digabung dalam 0.0.3 bersama seluruh rencana teknologi, daftar rilis dikirim ke user sebelum push ke main.

### F0 Fondasi
| Isi | File |
|---|---|
| Struktur data dua bahasa: tiap teks punya kunci en dan id (U20) | src/app/45-data-learn.js (baru) |
| Penyimpanan progres, bahasa, waktu recap. Key baru `cs-learn-v1`, tidak mengubah key lama. Ikut sinkron cloud lewat daftar prefs (PF_KEYS) | src/app/46-logic-learn.js (baru), src/app/43-logic-cloud-sync.js (satu baris PF_KEYS) |
| Pintu masuk: tombol Learn di Home, rute #learn, tombol Back | src/app/47-ui-learn.js (baru), src/css/36-learn.css (baru) |
| Pilihan bahasa EN/ID di header Learn | 47 |
| Gambar sementara dari app, slot gambar Codex dengan fallback | 47, 36 |
| Learn dimuat belakangan, cara yang sama dengan builder (mekanisme tunda di 01-logic-boot-flags-builder-loader.js), supaya app tidak lebih lambat dibuka | 01, build.py |
| Offline: service worker hanya menyimpan gambar yang pernah dibuka. Saat Learn dibuka, gambar Learn diminta sekali supaya tersimpan. Gambar yang belum ada diganti kotak warna dengan label | 47, sw.js tidak diubah |
| Cek keterbacaan otomatis lebih dulu, supaya semua teks berikutnya langsung dicek: panjang kalimat, kata kaku Indonesia, istilah di luar kamus (U13, U28) | tests/learn_text.py (baru) |
| Selesai bila | Learn terbuka dan tertutup di 390x844 dan 1250x850, bahasa tersimpan setelah reload, tiga skenario wajib tidak berubah |

### F1 Mesin tantangan
Komponen dipakai ulang oleh semua tempat.
| Komponen | Isi | Usulan |
|---|---|---|
| Langkah Tebak | Satu soal sebelum belajar, jawaban apa pun lanjut | U33 |
| Langkah Lihat | Hoot memperagakan, tangan bayangan menunjuk, bisa diulang | U29 |
| Langkah Coba bareng dan Coba sendiri | Petunjuk muncul setelah salah satu kali, hilang di Coba sendiri. Tanpa batas waktu | U22, U33 |
| Langkah Kenapa | Pilih satu dari tiga alasan | U33 |
| Find it on your sheet | Buka sheet sendiri, sorot angkanya, tampilkan nama ramah dan label buku | U24 |
| Dadu dan bonus CPA | Dadu dilempar dan kepingan bonus digeser, lalu gambar batang, lalu "12 + 3 = 15". Hasil sama dengan target tetap berhasil | U34 |
| Label menempel | Label pendek di samping bagian gambar | U35 |
| Umpan balik | Kalimat menyebut langkah yang benar, XP tidak pernah berkurang | U36 |
| Kamus | Kata bergaris bisa diketuk, membuka entri Library yang sama | U6 |
| Tombol "I know this" | Lewati tempat, ditandai selesai tanpa XP penuh | U11 |
| Selesai bila | Satu tempat contoh jalan dari awal sampai akhir dengan semua komponen, di dua ukuran layar, dua bahasa, Motion off dan kontras tinggi |

### F2 Jalur Inti (5 tempat)
| Urutan | Tempat | Isi | Tambahan |
|---|---|---|---|
| 1 | Tavern | D&D itu cerita bersama. Story Guide bercerita, kamu bilang apa yang kamu lakukan | Kartu "Playing together" (U25). Beberapa jawaban benar (U32) |
| 2 | Rooftops | d20, tambah bonus, capai angka target | Contoh "Pas" |
| 3 | Forest | Giliranmu: jalan, lalu satu aksi utama (nama aksi 2024) | Grid besar, geser jalan |
| 4 | Campsite | HP turun saat kena, naik saat istirahat | 0 HP diarahkan ke Tempat Bonus |
| 5 | Market | Ngobrol dan melihat-lihat juga bagian main | Kartu "When you're stuck" (U10). Beberapa jawaban benar (U32) |
| Akhir | Kuis 5 pertanyaan inti, kartu "Take a break?", saran Forge Your Hero | | |
| Selesai bila | Jalur Inti selesai dalam satu sesi tes Playwright dengan karakter Yudhi, karakter dari Apply, dan karakter baru. Semua teks lolos cek F0 |

### F3 Forge Your Hero
| Isi | Usulan |
|---|---|
| Quick Hero: memakai Quick Build yang sudah ada, ditambah pilihan background, potret dan "Surprise me", kartu class bergambar | U31 (menggantikan 6 pahlawan jadi di U18) |
| Screenshot interaktif builder dengan titik bernomor, dibuat oleh Playwright untuk HP dan PC. Dijalankan di workspace Claude lalu file AVIF di-commit, karena build Cloudflare Pages hanya menyalin file | tools/learn_shots.py (baru), img/learn/shots/ |
| Try it for real: builder asli dengan mode panduan, karakter latihan bertanda Practice, Keep atau Discard di akhir (pakai ask()). Tour yang ada (31-ui-tour-and-focus.js) hanya daftar langkah tetap untuk Home, jadi dijadikan mesin sorot umum yang bisa dipakai di builder dan di "Find it on your sheet". Builder ada di dokumen yang sama, jadi bisa disorot langsung | U1, 31 |
| Selesai bila | Karakter Quick Hero bisa di-Apply ke sheet. Practice yang di-Discard tidak meninggalkan data. Tes gagal bila titik screenshot kehilangan elemennya |

### F4 Tempat Bonus (urut prioritas)
| Urutan | Tempat | Isi |
|---|---|---|
| 1 | Meet your dice | d4 sampai d20 dan cara membacanya (U27) |
| 2 | Windy Cliff | Advantage dan Disadvantage, saling batal. Heroic Inspiration = lempar ulang (aturan 2024) |
| 3 | Village Green | Score lawan bonus, Training Bonus, bonus minus dengan garis bilangan (U8, U16) |
| 4 | Training Yard | Kena lalu damage. Critical Hit hanya untuk serangan (U8) |
| 5 | Campsite 2 | 0 HP, death save, Hit Point Dice |
| 6 | Forest 2 | Bonus Action dan Reaction |
| 7 | Meadow | Conditions |
| 8 | Wizard Tower 1 | Cantrip dan spell slot (U9) |
| 9 | Wizard Tower 2 | Prepared spells dan concentration (U9) |
| 10 | Crumbling Bridge | Ujian akhir, bisa diulang, jalan cerita acak (U4) |
| Selesai bila | Tiap tempat lolos tes yang sama dengan F2. Urutan bebas |

### F5 Penghubung ke app
| Isi | Usulan |
|---|---|
| Tombol "Learn this" di penjelasan aturan sheet, langsung ke tempat yang cocok | U2 |
| Alat "Which die do I roll?" dari karakter sendiri, di Learn dan sheet | U7 |
| Contekan meja: satu halaman ringkas untuk sesi berjalan | U3 |
| Quick recap: 2 soal, muncul paling cepat sehari setelah belajar, opsional | U26, U36 |
| Corong di tab Admin: jumlah orang per tempat, angka total saja. Progres sudah ikut sinkron lewat prefs (batas 32 KB, progres jauh lebih kecil). Siklus harian server menghitung total dari prefs ke tabel kecil, Admin hanya membaca totalnya | U12, U30, functions/api/[[path]].js, tests/api_social.py |
| Selesai bila | Tiga skenario wajib lolos, sheet tidak berubah perilaku tanpa Learn dibuka |

### F6 Gambar Codex
| Isi |
|---|
| Ganti gambar sementara dengan batch 234 (scene, sampul, pose Hoot), 235 (ikon konsep, lencana track), 236 (peta, ujian akhir, lencana, pose Sela) begitu tersedia. Tanpa gambar, Learn tetap lengkap |
| Cek: gambar tanpa angka dan huruf, tanpa darah dan luka, versi AVIF ukuran HP dan PC |

### F7 Uji dan rilis
| Isi | Pelaku |
|---|---|
| Tes HP murah: Playwright dengan CPU diperlambat 4 kali, cek animasi dan geser tetap lancar | Claude |
| Tes cadangan: workspace hanya punya Chromium (WebKit dan Firefox tidak terpasang, dan Playwright tidak boleh dipasang ulang). Learn punya saklar uji yang memaksa jalur cadangan (tanpa anchor positioning, tanpa View Transitions, tanpa Navigation API), lalu dites di Chromium | Claude |
| Tes Safari sungguhan: buka Learn di iPhone saat uji main | User |
| Suite Checker: tiga skenario wajib, Learn dua bahasa, 390x844 dan 1250x850, offline, Motion off, Calm, kontras tinggi, cek keterbacaan, titik screenshot | Claude |
| Teks Indonesia dibaca ulang dengan panduan U28 | Claude |
| Uji main Jalur Inti: 1 anak (patokan bahasa) dan 2 orang awam, tanpa dibantu, catat waktu, tempat macet, ikon yang tidak dipahami | User mengatur orangnya, Claude menyiapkan lembar catatan |
| Perbaikan dari uji main | Claude |
| Rilis 0.0.3: daftar rilis dikirim dulu, push ke main setelah disetujui | Claude, persetujuan user |

## Gambar
Batch Codex: 234 (17 gambar: scene layar Learn, sampul track, 9 sampul tempat, 4 pose Hoot), 235 (18: 16 ikon konsep, 2 lencana track), 236 (13: peta lembah PC dan phone, scene ujian akhir PC dan phone, 4 lencana peringkat, 5 pose Sela). Gambar tanpa angka dan huruf, jadi angka, dadu, dan diagram dibuat HTML dan SVG.

## Pembagian bagian proyek
| Bagian | Tugas di Learn |
|---|---|
| Data | 45-data-learn.js: teks dua bahasa, kamus, soal Tebak, Kenapa, recap, kuis, kartu ringkasan, teks titik screenshot |
| Logic | 46-logic-learn.js: progres, XP, simulasi aturan, hitungan CPA, recap, practice character, bahasa |
| UI/UX | 47-ui-learn.js dan 36-learn.css: peta, layar tantangan, komponen F1, penampil screenshot, Which die, sorotan sheet |
| Build tools | tools/learn_shots.py, entri baru di build.py dan SOURCE-NOTES.md |
| API | Hitungan corong harian di functions/api/[[path]].js |
| Checker | tests/learn_text.py, tests/learn_flow.py, dan regresi tiga skenario |

## Risiko
| Risiko | Penanganan |
|---|---|
| Data tersimpan rusak | Key baru `cs-learn-v1` saja, key lama tidak diubah. Learn tidak menulis ke karakter kecuali Apply dari Quick Hero atau Keep pada Practice |
| Screenshot builder usang setelah builder berubah | Dibuat ulang tiap build, tes gagal bila elemen titik hilang |
| Ikon tidak dipahami tanpa teks | Dicek di uji main sebelum rilis |
| Waktu 15 menit meleset | Diukur di uji main, isi tempat dipangkas bila lewat 20 menit |
| Isi Learn berbeda dari Library | Kamus mengambil entri Library, tidak menyalin |
| Mengubah tour Home merusak tour lama | Tour Home tetap memakai daftar yang sama di atas mesin baru, tes tour lama ikut dijalankan |
| Ukuran app bertambah | Data Learn dimuat saat Learn dibuka, bukan saat app mulai |
| Safari dan Firefox tidak bisa dites otomatis di sini | Jalur cadangan dites dengan saklar paksa, Safari dicek manual di iPhone saat uji main |
| Geser tidak bisa dipakai sebagian orang | Setiap geser punya cara ketuk dan keyboard, dites otomatis |

## Dicocokkan ke kode (2026-10-29)
PF_KEYS (sinkron prefs), tour di 31, Quick Build di builder/21, pemuatan tunda di 01, service worker, build Pages, endpoint prefs dan admin di API, entri Library di 03 dan 27. Empat hal yang semula keliru di rencana sudah dibetulkan: tour bukan mesin umum, screenshot tidak bisa dibuat di server Pages, gambar offline tidak tersimpan otomatis, corong butuh kerja di API.

## Lampiran riset
### Celah yang ditutup (2026-10-29, setelah user bertanya "sudah yakin cukup?")
| Celah | Risiko | Perbaikan |
|---|---|---|
| Nama ramah berbeda dengan tulisan di sheet (sheet menulis AC, DC) | Anak paham "Armor Number" di Learn, lalu bingung saat melihat "AC" di sheet | Setiap tempat diakhiri langkah "Find it on your sheet": sheet karakter sendiri dibuka, angkanya disorot, label buku dan nama ramah tampil bersama (U24) |
| Nama ramah bisa mengajarkan hal salah | "Dodge Roll" menyiratkan saving throw selalu soal menghindar, padahal juga untuk menahan racun atau sihir. "Main Move" tertukar dengan Move. "Nyawa" mengesankan jumlah nyawa seperti game arkade | Kamus diganti: Save Roll / Lemparan bertahan, Main Action / Aksi utama, HP / HP (darah). Setiap nama ramah dicek agar tidak bertentangan dengan aturan 2024 |
| Main bersama orang lain tidak diajarkan | Anak dan pemula bisa memonopoli giliran atau bingung kapan bicara. Perlu juga cara bilang "berhenti" kalau cerita membuat tidak nyaman | Kartu "Playing together": gantian bicara, dengarkan teman, bantu teman, boleh bilang stop kapan saja (U25) |
| Lupa setelah beberapa hari | Belajar sekali cepat hilang | "Quick recap": 2 soal singkat dari tempat sebelumnya saat Learn dibuka lagi, opsional (U26) |
| Dadu sungguhan belum dikenalkan | Banyak meja memakai dadu fisik. Pemula sering salah mengenali d4, d8, d10, d12 dan cara membaca d4 | Tempat Bonus "Meet your dice": kenali bentuk tiap dadu dan cara membacanya (U27) |
| Terjemahan Indonesia belum dicek penutur yang mengenal D&D | Kalimat bisa kaku atau istilah keliru | Claude memakai panduan bahasa Indonesia santai hasil riset dan cek otomatis (U28) |
| Learn harus jalan di semua kondisi app | Offline, Motion off, Calm, kontras tinggi, pembaca layar | Learn ikut aturan app yang sama, tiap gambar punya teks alternatif, tes di mode-mode ini (masuk U23) |

### Pemeriksaan aturan dan pembaca (2026-10-29)
| Temuan | Hasil |
|---|---|
| Contoh "lebih besar dari angka target" salah aturan | Diperbaiki. Hasil yang sama dengan target juga berhasil. Contoh "Pas" ditambah supaya anak belajar ini sejak awal |
| "Big die" untuk d20 | Diganti "d20". Di meja ada dadu lain yang juga besar, dan anak perlu kenal nama d20 untuk Meet your dice |
| "Lucky Roll" bisa tertukar dengan feat Lucky | Tetap dipakai. Feat Lucky memang memberi Advantage, jadi artinya tidak bertentangan |
| Kemampuan baca anak Indonesia | Asesmen Nasional 2024: 70,03 persen siswa mencapai kompetensi minimum literasi, jadi sekitar 3 dari 10 belum. Ini memperkuat visual dulu. Keputusan user: atasi lewat visual, tanpa suara |
| Waktu 15 menit Jalur Inti | Masih perkiraan. Dibuktikan di uji main (U21) |

### Tanpa suara dan PP Tunas (2026-10-29, setelah "Read to me" dibatalkan)
| Temuan | Sumber | Akibat |
|---|---|---|
| Untuk anak yang belum lancar membaca, bantuan utama di riset adalah suara. Tanpa suara, ikon harus bisa dipahami sendiri, petunjuk harus menunjukkan langkah berikutnya, dan tokoh pemandu memperagakan | Daftar periksa game untuk anak pra-baca (Universitas Siprus, proyek READISTANCE) | U29 |
| PP Tunas (PP 17/2025, berlaku 28 Maret 2026) berlaku untuk PSE swasta, termasuk fitur yang kemungkinan diakses anak. Melarang profiling anak dan teknik nudge. Mewajibkan info usia minimum, verifikasi usia, persetujuan orang tua, privasi tinggi bawaan, dan saluran laporan. Akun media sosial dibatasi untuk anak di bawah 16 tahun | Bisnis.com, NU Online | U30. Friends adalah fitur sosial. Learn yang menyasar anak 10 tahun membuat app masuk kategori "kemungkinan diakses anak". Ini bukan nasihat hukum. Teks PP perlu dibaca langsung sebelum Learn dibuka untuk anak. Catatan 2026-10-29: Learn tidak menyasar anak, jadi risiko ini kecil. Tetap dibaca bila suatu saat app dibuka untuk anak |

### Pembanding (2026-10-29)
| Produk | Yang bagus | Yang kurang | Akibat |
|---|---|---|---|
| D&D Beyond Quick Build (Maret 2026) | 4 pilihan, sisanya otomatis, bisa acak, langsung main | Penjelasan class satu halaman, tanpa latihan | U31 |
| D&D Adventure Begins (board game keluarga) | Anak 10 tahun senang improvisasi dan memakai barang secara kreatif. Aturan sederhana, tanpa perlu tahu fantasy | Karakter terasa sama, ide kreatif tidak mengubah hasil, cepat bosan | U32 |

### Riset lembaga pendidikan negara maju (2026-10-29)
| Lembaga | Temuan | Usulan |
|---|---|---|
| IES What Works Clearinghouse (AS), panduan "Organizing Instruction and Study" | Jeda antar latihan (bukti sedang). Selang-seling contoh jadi dan soal (sedang). Gambar dipadu kata di dekat bagian yang dimaksud (sedang). Hubungkan konkret dan abstrak (sedang). Kuis ulang (kuat). Pertanyaan "kenapa" dan "bagaimana" (kuat) | U33, U34, U35, U36 |
| AERO (Australia), explicit teaching | Pecah materi jadi potongan kecil. Peragakan, latihan dibimbing, lalu latihan sendiri. Cek pemahaman sebelum lanjut. Bantuan dikurangi bertahap | U33 |
| Pendekatan CPA Singapura (dari Bruner) | Konkret, gambar, lalu simbol. Gambar menjadi model di kepala saat anak macet | U34 |
| EEF (Inggris), panduan umpan balik | Umpan balik diberi setelah pengajaran, tepat waktu, membahas tugasnya, dan anak diberi waktu memakainya | U36 |
| Sekolah dasar Finlandia (Sahlberg) | Bermain sebagai cara belajar utama. Anak boleh memilih. Tanpa nilai sebelum kelas 4. Istirahat rutin | U37. Tempat Bonus bebas urutan. Kartu "Take a break?" setelah Jalur Inti |

### Riset pemain baru dan cara belajar
| Temuan | Sumber | Akibat untuk desain |
|---|---|---|
| Hal yang paling membingungkan pemain baru: spell, action lawan bonus action, score lawan modifier, dadu mana, attack lawan damage, critical hit, mencari angka di sheet, conditions, rest, bingung harus berbuat apa | EN World (2024 dan 5e), Paizo | Masing-masing punya tempat (Inti atau Bonus) dan U7 sampai U10, U24 |
| Orang hanya membaca 20 sampai 28 persen teks. Yang berhasil: belajar sambil melakukan, satu mekanik sekali, petunjuk saat dibutuhkan, mentor dalam cerita, umpan balik langsung | GDevelop (mengutip Nielsen Norman Group) | Teks pendek, Hoot mentor, efek langsung |
| Ajarkan dari paling sederhana, optimasi menunggu | The Angry GM | Jalur Inti dan Tempat Bonus |
| Untuk anak: buat karakter lewat cerita dulu, class bela diri dulu, sihir belakangan, aturan disederhanakan, lulus ke aturan penuh nanti | D&D Beyond, Young Adventurers | Quick Hero, spell di Tempat Bonus |
| Bacaan anak 8 sampai 9 tahun: kalimat 6 sampai 8 kata, kata pendek, 70 sampai 80 persen kalimat aktif | Readability Formulas | Panduan bahasa |
| Anak yang baru bisa membaca dan yang belajar bahasa asing paling mengerti umpan balik visual | Studi umpan balik game belajar (UniversityXP, 2026) | Visual dulu |
| Anak kelas 4 bisa mulai paham angka negatif dengan garis bilangan dan bimbingan | Think Academy | Bonus minus ditunda |
| Contoh yang dikerjakan langkah demi langkah menurunkan beban pikiran | Riset worked-example effect | Hoot mengerjakan satu contoh dulu |
| Bahasa sederhana penting untuk pembaca non-native | Translators without Borders, W3C easy-to-read | Dua bahasa, kamus istilah |

## Keputusan yang masih terbuka
| Hal | Status |
|---|---|
| Kapan mulai coding | Menunggu "go" dari user |
| Siapa peserta uji main | Diatur user saat F7 |

## Sumber teknologi
- https://github.com/w3c/csswg-drafts/issues/6498
- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements
- https://dev.to/randomengy/from-scratch-drag-and-drop-pitfalls-with-scroll-anchoring-and-touch-gestures-3299
- https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026
- https://svilenkovic.com/3d/webgl-vs-css-3d
- https://www.abratabia.com/game-accessibility/web-game-aria.php
- https://web.dev/baseline/2026
- https://web.dev/blog/interop-2026
- https://web.dev/blog/web-platform-09-2026
- https://www.refontelearning.com/blog/css-anchor-positioning-reaches-baseline
- https://www.buildmvpfast.com/blog/web-platform-baseline-2026-new-features-browser-support
- https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/

## Sumber riset
- https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/20072004.pdf
- https://www.edresearch.edu.au/guides-resources/videos/teaching-how-students-learn-teach-explicitly
- https://blog.edshed.com/?p=397
- https://educationendowmentfoundation.org.uk/tools/guidance-reports/feedback
- https://researchschool.org.uk/derby/news/new-guidance-report-teacher-feedback-to-improve-pupil-learning
- https://pasisahlberg.com/wp-content/uploads/2020/08/ACEL-Play-C-2020.pdf
- https://www.pcgamer.com/games/d-and-d-beyonds-slick-new-online-character-creator-lets-you-make-a-hero-in-seconds
- https://gizmodo.com/dungeons-dragons-adventure-begins-doesnt-capture-the-1845240184
- https://enworld.org/threads/adventure-begins-first-impressions.675159
- https://cs.ucy.ac.cy/projects/readistance/?p=3499
- https://teknologi.bisnis.com/read/20260505/101/1971394/10-kewajiban-platform-dalam-pp-tunas-yang-perlu-diketahui-pse
- https://nu.or.id/nasional/pp-tunas-diberlakukan-anak-di-bawah-16-tahun-dibatasi-akses-medsos-dan-gim-ZBe2S
- https://www.medcom.id/pendidikan/news-pendidikan/Rkjr8lwk-
- https://textintoaudio-com.pages.dev/browser-support.html
- https://static.buku.kemdikbud.go.id/content/undang-undang/No_030_P_2022.pdf
- https://www.vcgamers.com/news/?p=61502
- https://www.enworld.org/goto/post?id=8837110
- https://www.enworld.org/goto/post?id=7405380
- https://gdevelop.io/blog/improve-game-tutorials
- https://theangrygm.com/knowing-how-to-play-dd
- https://awesomedice.com/blogs/news/how-to-teach-dnd-11-tips
- https://www.dndbeyond.com/posts/554-play-d-d-with-kids-using-the-young-adventurers
- https://readabilityformulas.com/writing-for-3rd-grade-readers/
- https://www.universityxp.com/research/2026/1/28/i-dont-usually-listen-i-read-how-different-learner-groups-process-game-feedback
- https://www.thethinkacademy.com/blog/edubriefs-can-fourth-graders-understand-negative-numbers
- https://researchportal.hw.ac.uk/en/publications/the-worked-example-effect-not-an-artefact-of-lousy-control-condit/
- https://translatorswithoutborders.org/wp-content/uploads/2020/04/Plain-Language_Write-Clearly.pdf
- https://www.w3.org/WAI/RD/2012/easy-to-read/paper11/
