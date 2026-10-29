# Rencana menu Learn: Hoot's Training Grounds (2026-10-28, diperbarui 2026-10-29)

Dokumen utama: claude/rencana-kerja-learn.md (seluruh riset, keputusan dan urutan kerja). File ini menjadi log usulan U dan riset rinci.

Status: disetujui user (interactive learning, bukan komik). Kode belum dikerjakan. Saat dikerjakan, Claude jalan duluan dengan gambar sementara. Ilustrasi Codex hanya pelengkap, dipasang begitu jadi (keputusan user 2026-10-29). Gambar Codex: batch-234, 235, 236 (48 gambar).

## Tujuan
Orang awam (remaja dan dewasa) yang belum pernah main game peran paham D&D 2024, lalu bisa main dan membuat karakter pertamanya, dengan cara bermain, bukan membaca. "Anak 10 tahun" hanya patokan kemudahan bahasa dan penjelasan, bukan target pengguna (keputusan user 2026-10-29). Nada tetap santai untuk orang dewasa, tidak kekanak-kanakan. Bahasa casual dan sangat mudah. Learn tersedia dalam dua bahasa: English (bawaan) dan Bahasa Indonesia (keputusan user 2026-10-29). Ini pengecualian dari aturan proyek "teks app bahasa Inggris", hanya untuk Learn.

## Ukuran berhasil
| Ukuran | Target |
|---|---|
| Jalur Inti selesai tanpa dibantu | Orang awam dalam uji main (U21). Teks lolos patokan bacaan anak 10 tahun |
| Pemahaman | Bisa menjawab 4 dari 5 pertanyaan inti setelah Jalur Inti: dadu mana yang dilempar, apa yang ditambah, apa artinya berhasil, apa yang dilakukan di giliranmu, apa yang terjadi saat Health habis |
| Berhenti di tengah | Kurang dari 20 persen per tempat di corong Admin (U12) |
| Waktu Jalur Inti | Sekitar 15 menit, tidak lebih dari 20 |

## Analisa kritis rencana sebelumnya (2026-10-29)
| Masalah di rencana lama | Kenapa masalah untuk anak 10 tahun dan orang awam | Perbaikan |
|---|---|---|
| 12 tempat berurutan sebelum bisa main | Terlalu panjang. Perhatian anak habis sebelum sampai ke bagian yang dipakai di meja | Jalur Inti 5 tempat, sekitar 15 menit total, cukup untuk main sesi pertama. Sisanya Tempat Bonus (U14) |
| Istilah buku dipakai langsung (DC, AC, modifier, proficiency, saving throw) | Kata asing tanpa gambaran | Nama ramah dulu, istilah buku kecil di sampingnya (U15) |
| Hitungan dikerjakan pengguna | Anak 10 tahun baru mulai belajar angka negatif. Menjumlah di kepala sambil membaca aturan = beban ganda | App menghitung dengan animasi kepingan bonus. Bonus positif dulu, minus belakangan dengan garis bilangan (U16) |
| Penjelasan lewat teks Hoot | Anak paling bisa membaca umpan balik visual | Visual dulu, teks maksimal 2 kalimat (U17) |
| Build track langsung memakai builder lengkap | Builder punya puluhan pilihan | Quick Hero (U18) |
| Salah pilihan dianggap gagal | Anak cepat menyerah | Tidak ada "wrong", petunjuk lalu coba lagi (U22) |
| App di luar Learn | Gambar berdarah dan fitur Friends | Family Mode ditolak user (U19). Gambar Learn sendiri tetap tanpa darah dan luka |
| Belum pernah dites ke orang sungguhan | Semua rencana masih tebakan | Uji main (U21) dan corong Admin (U12) |

## Pemeriksaan kedua (2026-10-29, setelah user bertanya "sudah yakin cukup?")
| Celah | Risiko | Perbaikan |
|---|---|---|
| Nama ramah berbeda dengan tulisan di sheet (sheet menulis AC, DC) | Anak paham "Armor Number" di Learn, lalu bingung saat melihat "AC" di sheet | Setiap tempat diakhiri langkah "Find it on your sheet": sheet karakter sendiri dibuka, angkanya disorot, label buku dan nama ramah tampil bersama (U24) |
| Nama ramah bisa mengajarkan hal salah | "Dodge Roll" menyiratkan saving throw selalu soal menghindar, padahal juga untuk menahan racun atau sihir. "Main Move" tertukar dengan Move. "Nyawa" mengesankan jumlah nyawa seperti game arkade | Kamus diganti: Save Roll / Lemparan bertahan, Main Action / Aksi utama, HP / HP (darah). Setiap nama ramah dicek agar tidak bertentangan dengan aturan 2024 |
| Main bersama orang lain tidak diajarkan | Anak dan pemula bisa memonopoli giliran atau bingung kapan bicara. Perlu juga cara bilang "berhenti" kalau cerita membuat tidak nyaman | Kartu "Playing together": gantian bicara, dengarkan teman, bantu teman, boleh bilang stop kapan saja (U25) |
| Lupa setelah beberapa hari | Belajar sekali cepat hilang | "Quick recap": 2 soal singkat dari tempat sebelumnya saat Learn dibuka lagi, opsional (U26) |
| Dadu sungguhan belum dikenalkan | Banyak meja memakai dadu fisik. Pemula sering salah mengenali d4, d8, d10, d12 dan cara membaca d4 | Tempat Bonus "Meet your dice": kenali bentuk tiap dadu dan cara membacanya (U27) |
| Terjemahan Indonesia belum dicek penutur yang mengenal D&D | Kalimat bisa kaku atau istilah keliru | Claude memakai panduan bahasa Indonesia santai hasil riset dan cek otomatis (U28) |
| Learn harus jalan di semua kondisi app | Offline, Motion off, Calm, kontras tinggi, pembaca layar | Learn ikut aturan app yang sama, tiap gambar punya teks alternatif, tes di mode-mode ini (masuk U23) |

## Pemeriksaan ketiga (2026-10-29)
| Temuan | Hasil |
|---|---|
| Contoh "lebih besar dari angka target" salah aturan | Diperbaiki. Hasil yang sama dengan target juga berhasil. Contoh "Pas" ditambah supaya anak belajar ini sejak awal |
| "Big die" untuk d20 | Diganti "d20". Di meja ada dadu lain yang juga besar, dan anak perlu kenal nama d20 untuk Meet your dice |
| "Lucky Roll" bisa tertukar dengan feat Lucky | Tetap dipakai. Feat Lucky memang memberi Advantage, jadi artinya tidak bertentangan |
| Kemampuan baca anak Indonesia | Asesmen Nasional 2024: 70,03 persen siswa mencapai kompetensi minimum literasi, jadi sekitar 3 dari 10 belum. Ini memperkuat visual dulu. Keputusan user: atasi lewat visual, tanpa suara |
| Waktu 15 menit Jalur Inti | Masih perkiraan. Dibuktikan di uji main (U21) |

## Pemeriksaan keempat (2026-10-29, setelah "Read to me" dibatalkan)
| Temuan | Sumber | Akibat |
|---|---|---|
| Untuk anak yang belum lancar membaca, bantuan utama di riset adalah suara. Tanpa suara, ikon harus bisa dipahami sendiri, petunjuk harus menunjukkan langkah berikutnya, dan tokoh pemandu memperagakan | Daftar periksa game untuk anak pra-baca (Universitas Siprus, proyek READISTANCE) | U29 |
| PP Tunas (PP 17/2025, berlaku 28 Maret 2026) berlaku untuk PSE swasta, termasuk fitur yang kemungkinan diakses anak. Melarang profiling anak dan teknik nudge. Mewajibkan info usia minimum, verifikasi usia, persetujuan orang tua, privasi tinggi bawaan, dan saluran laporan. Akun media sosial dibatasi untuk anak di bawah 16 tahun | Bisnis.com, NU Online | U30. Friends adalah fitur sosial. Learn yang menyasar anak 10 tahun membuat app masuk kategori "kemungkinan diakses anak". Ini bukan nasihat hukum. Teks PP perlu dibaca langsung sebelum Learn dibuka untuk anak. Catatan 2026-10-29: Learn tidak menyasar anak, jadi risiko ini kecil. Tetap dibaca bila suatu saat app dibuka untuk anak |

## Pembanding (2026-10-29)
| Produk | Yang bagus | Yang kurang | Akibat |
|---|---|---|---|
| D&D Beyond Quick Build (Maret 2026) | 4 pilihan, sisanya otomatis, bisa acak, langsung main | Penjelasan class satu halaman, tanpa latihan | U31 |
| D&D Adventure Begins (board game keluarga) | Anak 10 tahun senang improvisasi dan memakai barang secara kreatif. Aturan sederhana, tanpa perlu tahu fantasy | Karakter terasa sama, ide kreatif tidak mengubah hasil, cepat bosan | U32 |

## Riset lembaga pendidikan negara maju (2026-10-29)
| Lembaga | Temuan | Usulan |
|---|---|---|
| IES What Works Clearinghouse (AS), panduan "Organizing Instruction and Study" | Jeda antar latihan (bukti sedang). Selang-seling contoh jadi dan soal (sedang). Gambar dipadu kata di dekat bagian yang dimaksud (sedang). Hubungkan konkret dan abstrak (sedang). Kuis ulang (kuat). Pertanyaan "kenapa" dan "bagaimana" (kuat) | U33, U34, U35, U36 |
| AERO (Australia), explicit teaching | Pecah materi jadi potongan kecil. Peragakan, latihan dibimbing, lalu latihan sendiri. Cek pemahaman sebelum lanjut. Bantuan dikurangi bertahap | U33 |
| Pendekatan CPA Singapura (dari Bruner) | Konkret, gambar, lalu simbol. Gambar menjadi model di kepala saat anak macet | U34 |
| EEF (Inggris), panduan umpan balik | Umpan balik diberi setelah pengajaran, tepat waktu, membahas tugasnya, dan anak diberi waktu memakainya | U36 |
| Sekolah dasar Finlandia (Sahlberg) | Bermain sebagai cara belajar utama. Anak boleh memilih. Tanpa nilai sebelum kelas 4. Istirahat rutin | U37. Tempat Bonus bebas urutan. Kartu "Take a break?" setelah Jalur Inti |

## Kamus dicocokkan ke Library app (2026-10-29)
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

## Jalur Inti (sekitar 15 menit, cukup untuk sesi pertama)
| Tempat | Satu hal yang dipelajari | Tantangan |
|---|---|---|
| Tavern | D&D itu cerita bersama. Story Guide (DM) bercerita, kamu bilang apa yang kamu lakukan | Pilih satu dari tiga aksi untuk menjawab "What do you do?". Kartu "Playing together" |
| Rooftops | Lempar d20, tambah bonus, capai Target Number | Lompat antar atap. App menghitung dengan animasi. Find it on your sheet |
| Forest | Giliranmu: jalan, lalu satu Main Action | Satu giliran di grid besar: geser jalan, pilih satu aksi |
| Campsite | HP turun kalau kena, naik kalau istirahat | Kena, istirahat, HP penuh lagi. 0 HP dan death save di Tempat Bonus |
| Market | Ngobrol dan melihat-lihat juga bagian main | Membujuk pedagang, kartu "When you're stuck" |

## Tempat Bonus (buka kapan saja, juga dari tombol "Learn this" di sheet)
Meet your dice, Windy Cliff (Advantage, Heroic Inspiration), Village Green (score dan bonus, Training Bonus, bonus minus), Training Yard (kena lalu damage, critical hit), Forest 2 (Bonus Action dan Reaction), Campsite 2 (0 HP, death save, Hit Point Dice), Meadow (conditions), Wizard Tower 1 (cantrip, spell slot), Wizard Tower 2 (prepared spells, concentration), Crumbling Bridge (ujian akhir).

## Panduan bahasa (untuk kedua bahasa)
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

## Bahasa Indonesia santai (U28, riset 2026-10-29)
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

## Forge Your Hero: screenshot builder interaktif (permintaan user 2026-10-28)
Untuk pemula disarankan mulai dari Quick Hero (U18). Builder lengkap diajarkan dalam tiga lapis:
1. Screenshot interaktif: gambar layar builder asli dengan titik bernomor. Ketuk titik: bagian itu disorot, Hoot menjelaskan fungsinya. Label titik mengikuti bahasa Learn yang dipilih.
2. Coba di screenshot: beberapa titik bisa dipilih langsung, lalu Hoot menjelaskan akibatnya.
3. Try it for real: tombol membuka builder asli di langkah yang sama dengan mode panduan (mesin tour yang sudah ada). Karakter latihan bertanda "Practice", di akhir Keep atau Discard.

Screenshot dibuat otomatis oleh skrip Playwright (tools/learn_shots.py) saat build, untuk ukuran HP dan PC, disimpan sebagai AVIF di img/learn/shots/. Posisi titik diambil dari posisi elemen asli. Tes Checker gagal bila elemen yang dirujuk titik tidak ditemukan.

## Riset (2026-10-29)
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

## Usulan tambahan
Aturan: setiap usulan baru terkait Learn dicatat di tabel ini, dengan tanggal dan status.

| No | Tanggal | Usulan | Isi | Status |
|---|---|---|---|---|
| U1 | 2026-10-28 | Pakai karakter sendiri | Tantangan memakai angka karakter user. Tanpa karakter: Quick Hero atau karakter contoh | Diterima 2026-10-29 |
| U2 | 2026-10-28 | Link dari sheet ke Learn | Tombol "Learn this" di penjelasan aturan sheet | Diterima 2026-10-29 |
| U3 | 2026-10-28 | Contekan di meja | Halaman ringkas untuk sesi berjalan | Diterima 2026-10-29 |
| U4 | 2026-10-28 | Ujian ulang dan rekor | Crumbling Bridge bisa diulang, jalan cerita acak | Diterima 2026-10-29 |
| U5 | 2026-10-29 | Learn dua bahasa | English (bawaan) dan Bahasa Indonesia, pilihan di header Learn, ikut sinkron cloud | Diterima 2026-10-29 |
| U6 | 2026-10-29 | Kamus istilah tetap | Nama ramah dan arti satu kalimat, dua bahasa, bisa diketuk ke glossary | Diterima 2026-10-29 |
| U7 | 2026-10-29 | "Which die do I roll?" | Alat pilih dadu dan bonus dari karakter sendiri, di Learn dan sheet | Diterima 2026-10-29 |
| U8 | 2026-10-29 | Score lawan bonus, kena lawan damage | Tantangan khusus di Tempat Bonus | Diterima 2026-10-29 |
| U9 | 2026-10-29 | Spell dua pelajaran | Wizard Tower 1 dan 2 | Diterima 2026-10-29 |
| U10 | 2026-10-29 | "When you're stuck" | Ask, look around, help a friend, describe what you try | Diterima 2026-10-29 |
| U11 | 2026-10-29 | Batas teks dan lewati | Maksimal 2 kalimat per langkah, tombol "I know this" | Diterima 2026-10-29 |
| U12 | 2026-10-29 | Corong belajar di Admin | Berapa orang selesai tiap tempat | Diterima 2026-10-29 |
| U13 | 2026-10-29 | Cek keterbacaan otomatis | Tes Checker: panjang kalimat sesuai panduan bahasa, istilah yang belum ada di kamus | Diterima 2026-10-29 |
| U14 | 2026-10-29 | Jalur Inti dan Tempat Bonus | 5 tempat inti sekitar 15 menit, sisanya bonus | Diterima 2026-10-29 |
| U15 | 2026-10-29 | Nama ramah untuk istilah | Lihat kamus. Diperbaiki di pemeriksaan kedua (Save Roll, Main Action, HP) | Diterima 2026-10-29 |
| U16 | 2026-10-29 | Hitungan visual | Animasi kepingan bonus. Bonus positif dulu, minus belakangan dengan garis bilangan | Diterima 2026-10-29 |
| U17 | 2026-10-29 | Visual dulu | Hasil selalu visual: angka, dadu, gerak dan ikon menjelaskan sebelum teks. Tombol "Read to me" dibatalkan user, kemampuan baca diatasi lewat visual | Diterima 2026-10-29, diubah |
| U18 | 2026-10-29 | Quick Hero | 6 pahlawan siap pakai, ganti nama dan tampilan, builder lengkap belakangan | Diterima 2026-10-29, diganti U31 |
| U19 | 2026-10-29 | Family Mode | Saklar yang menyembunyikan gambar berdarah di seluruh app dan mematikan Friends | Ditolak 2026-10-29 |
| U20 | 2026-10-29 | Struktur dua bahasa | Semua teks Learn di satu file data dengan kunci en dan id. Terjemahan ditulis tangan. Label titik screenshot ikut bahasa | Diterima 2026-10-29 |
| U21 | 2026-10-29 | Uji main nyata | 1 anak dan 2 orang awam mencoba Jalur Inti tanpa dibantu, diukur dengan tabel Ukuran berhasil | Diterima 2026-10-29 |
| U22 | 2026-10-29 | Tidak ada "salah" | Petunjuk dan coba lagi, XP tidak berkurang, tanpa batas waktu | Diterima 2026-10-29 |
| U23 | 2026-10-29 | Ramah jari dan mata | Tombol minimal 48 piksel, sedikit geser-tarik, tanpa batas waktu, teks ikut setelan ukuran app, jalan saat offline, Motion off, Calm, kontras tinggi, teks alternatif gambar | Diterima 2026-10-29 |
| U24 | 2026-10-29 | "Find it on your sheet" | Akhir tiap tempat: sheet sendiri dibuka, angka disorot, label buku dan nama ramah tampil bersama | Diterima 2026-10-29 |
| U25 | 2026-10-29 | "Playing together" | Gantian bicara, dengarkan teman, bantu teman, boleh bilang stop kapan saja | Diterima 2026-10-29 |
| U26 | 2026-10-29 | Quick recap | 2 soal singkat dari tempat sebelumnya saat Learn dibuka lagi, opsional | Diterima 2026-10-29 |
| U27 | 2026-10-29 | Meet your dice | Kenali bentuk d4 sampai d20 dan cara membacanya | Diterima 2026-10-29 |
| U28 | 2026-10-29 | Panduan bahasa Indonesia santai | Diubah user: Claude riset sendiri cara menulis bahasa Indonesia santai, hasilnya bagian "Bahasa Indonesia santai" dan cek otomatis | Diterima 2026-10-29 |
| U29 | 2026-10-29 | Tunjukkan, jangan tulis | Karena tanpa suara: tiap tantangan dimulai dengan Hoot memperagakan langkahnya. Tangan bayangan menunjuk yang harus diketuk. Petunjuk menunjukkan langkah berikutnya, bukan menjelaskannya. Ikon dari benda yang anak kenal. Uji main (U21) mengecek anak paham ikon tanpa membaca | Diterima 2026-10-29 |
| U30 | 2026-10-29 | Tanpa pancingan | Tanpa streak, hitung mundur, notifikasi atau hadiah yang memancing kembali (praktik baik, sejalan dengan larangan nudge di PP Tunas). Corong Admin (U12) hanya angka total, tanpa data per orang (larangan profiling). Progres Learn tidak dipakai untuk hal lain | Diterima 2026-10-29 |
| U31 | 2026-10-29 | Quick Hero memakai Quick Build yang sudah ada | Builder sudah punya Quick Build (pilih class dan species, sisanya diisi otomatis, v27 RU65). D&D Beyond (Maret 2026) memakai 4 pilihan: class, species, background, potret, plus tombol acak. Quick Hero di Learn = Quick Build ditambah pilihan background, potret dan tombol "Surprise me", dengan kartu class bergambar. Menggantikan rencana 6 pahlawan jadi di U18 | Diterima 2026-10-29 (masuk rencana kerja) |
| U32 | 2026-10-29 | Ide kreatif dihargai | Di Tavern dan Market ada lebih dari satu jawaban benar, dan tiap jawaban berujung beda. Pilihan "Try something else" membuka ide tak terduga yang tetap diterima Hoot | Diterima 2026-10-29 (masuk rencana kerja) |
| U33 | 2026-10-29 | Pola tetap tiap tempat | 1 Tebak dulu (satu soal sebelum belajar). 2 Lihat: Hoot memperagakan. 3 Coba bareng: petunjuk masih ada. 4 Coba sendiri: petunjuk hilang. 5 Kenapa berhasil? (pilih satu dari tiga alasan). 6 Find it on your sheet. Pindah ke bagian berikut hanya setelah langkah sebelumnya benar | Diterima 2026-10-29 (masuk rencana kerja) |
| U34 | 2026-10-29 | Hitungan konkret, gambar, angka | Bonus dan dadu diajarkan tiga tahap: dadu dan kepingan bonus yang bisa digeser, lalu gambar batang, lalu angka seperti di sheet ("12 + 3 = 15"). Bentuk detail dari U16 | Diterima 2026-10-29 (masuk rencana kerja) |
| U35 | 2026-10-29 | Kata menempel di gambar | Label pendek ditaruh tepat di samping bagian gambar yang dimaksud, bukan di panel terpisah | Diterima 2026-10-29 (masuk rencana kerja) |
| U36 | 2026-10-29 | Umpan balik soal langkahnya | Pujian menyebut apa yang benar ("You added your bonus!"), bukan "You're smart". Recap (U26) muncul paling cepat sehari setelah belajar, supaya jedanya cukup | Diterima 2026-10-29 (masuk rencana kerja) |
| U37 | 2026-10-29 | Tanpa nilai dan peringkat antarpemain | Progres pribadi saja. Tidak ada skor, papan peringkat, atau perbandingan dengan teman. Lencana peringkat (batch-236) hanya menandai tempat yang sudah selesai | Diterima 2026-10-29 (masuk rencana kerja) |
| U38 | 2026-10-29 | Choreo: satu naskah, empat hasil | Peragaan Hoot ditulis sebagai data langkah (sorot apa, gerak ke mana, kata apa). Dari satu naskah itu mesin membuat: animasi (Web Animations API dan View Transitions), versi Motion off (gambar diam bernomor), jalur keyboard, dan skrip tes Playwright. Peragaan dan tesnya tidak bisa berbeda | Diterima 2026-10-29 (masuk rencana kerja) |
| U39 | 2026-10-29 | Cermin aturan hidup | Angka di pelajaran dihitung oleh mesin derivasi app yang sama dengan sheet (06-logic-derivation.js) memakai karakter sendiri. Checker membandingkan klaim tiap pelajaran dengan hasil mesin, jadi pelajaran tidak bisa basi saat aturan app berubah | Diterima 2026-10-29 (masuk rencana kerja) |
| U40 | 2026-10-29 | Explain any number | Ketuk angka mana pun di sheet (AC, bonus skill, save DC), angka itu dibangun ulang di depan mata: kepingan asal (score, Training Bonus, item) terbang dan menyusun angkanya, tahap konkret, gambar, angka (U34). Memakai rincian yang sudah ada di 11-ui-breakdown.js | Diterima 2026-10-29 (masuk rencana kerja) |
| U41 | 2026-10-29 | Anchor Spotlight | Satu mesin sorot untuk tour, Learn, What's New dan builder. Anchor positioning, Popover dan inert dikelola otomatis. Bisa menunjuk elemen di tab lain (pindah tab dulu), dengan cadangan JS untuk browser lama | Diterima 2026-10-29 (masuk rencana kerja) |
| U42 | 2026-10-29 | Penanda pelajaran di kode UI | Elemen UI diberi atribut `data-learn="kunci"`. Titik screenshot, sorotan, dan tes dibuat dari atribut itu. Saat UI berubah, pelajaran ikut pindah, dan build gagal bila kunci hilang | Diterima 2026-10-29 (masuk rencana kerja) |
| U43 | 2026-10-29 | Gerbang bahasa sederhana | Build gagal bila ada teks Learn (EN atau ID) yang melanggar panduan bahasa atau memakai istilah yang tidak ada di kamus dan Library. Lebih ketat dari U13 yang hanya melapor | Diterima 2026-10-29 (masuk rencana kerja) |
| U44 | 2026-10-29 | Petunjuk bertingkat tanpa profil | Tingkat petunjuk naik dari kesalahan di langkah yang sedang dikerjakan saja, dihitung di HP, tidak disimpan dan tidak dikirim ke server (sejalan U30) | Diterima 2026-10-29 (masuk rencana kerja) |
| U45 | 2026-10-29 | Dadu ber-seed | Peragaan dan tes memakai dadu dengan seed, hasilnya selalu sama, jadi tes stabil. Latihan memakai dadu acak sungguhan (crypto.getRandomValues). Riwayat lemparan bisa dilihat ulang | Diterima 2026-10-29 (masuk rencana kerja) |
| U46 | 2026-10-29 | Peta hubungan angka | Ketuk Strength, muncul garis ke semua angka yang dipengaruhinya (skill, serangan, save, daya angkut). Geser score, semua angka ikut berubah langsung. Garis memakai SVG di antara elemen yang dijangkar. Data hubungan diambil dari mesin derivasi (U39) | Diterima 2026-10-29 (masuk rencana kerja) |
| U47 | 2026-10-29 | Coach mode di meja | Saklar opsional di sheet. Saat main sungguhan, pertama kali kamu memakai sesuatu (misal saving throw pertama), muncul satu kalimat penjelasan dan tombol "Learn this". Tiap kalimat hanya muncul sekali. Bukan pancingan, karena hanya muncul saat kamu sedang memakai fiturnya | Diterima 2026-10-29 (masuk rencana kerja) |
| U48 | 2026-10-29 | Cek fakta EN dan ID | Tes memastikan setiap teks punya versi EN dan ID, dan angka, nama aturan serta istilah kamus di kedua versi sama. Terjemahan tidak bisa diam-diam mengubah fakta | Diterima 2026-10-29 (masuk rencana kerja) |
| U49 | 2026-10-29 | Acak yang menjamin cakupan | Jalan cerita Crumbling Bridge diacak dari potongan pelajaran, tapi tiap putaran dijamin menguji semua aturan inti Jalur Inti | Diterima 2026-10-29 (masuk rencana kerja) |
| U50 | 2026-10-29 | Gerak menyesuaikan HP | Learn mengukur kelancaran animasi pertama (requestAnimationFrame, plus Long Animation Frames API bila ada). Bila HP tersendat, otomatis pindah ke gerak sederhana tanpa mengubah setelan Motion pengguna | Diterima 2026-10-29 (masuk rencana kerja) |
| U51 | 2026-10-29 | Belajar bareng teman | Kirim satu tempat ke teman mutual lewat Friends. Teman membukanya di Learn miliknya. Tanpa skor dan tanpa perbandingan (U37) | Ditolak 2026-10-29 |
| U52 | 2026-10-29 | Tour di sheet sendiri | Usul user ("take the tour bisa lebih bermanfaat?"). Tour lama 5 langkah hanya menunjuk tombol Home. Baru: satu kartu "New here?" (Learn atau Tour), tour 7 titik di sheet karakter sendiri dengan Anchor Spotlight, dua langkah menunggu ketukan nyata (ketuk angka, lalu Roll), lemparan dibatalkan di akhir, bisa dibuka lagi dari Settings dan pencarian perintah. Tanpa karakter: menunjuk Create. Revisi user 19.22 WIB: tour jadi satu kesatuan dengan Learn, tempat "Tur Aplikasi" di bagian "Kenali aplikasi" peta Learn, teks EN dan ID, selesai kembali ke peta dengan XP. Home hanya kartu Learn | Diterima dan dikerjakan 2026-10-29, rilis 0.0.3 |

Sengaja tidak dimasukkan: track khusus DM (keputusan user: tanpa fitur DM).

## Pembagian kerja
| Bagian | Isi |
|---|---|
| Data | Teks tantangan dua bahasa, kamus istilah, kartu ringkasan, Quick Hero, teks titik screenshot, soal recap |
| Logic | Progres dan XP, simulasi aturan, hitungan visual, mode panduan builder, karakter latihan, pilihan bahasa, recap |
| UI/UX | Peta, layar tantangan, panel Hoot, kartu, penampil screenshot bertitik, alat "Which die", sorotan "Find it on your sheet" |
| Build tools | tools/learn_shots.py |
| Checker | 3 skenario wajib, tes Learn dua bahasa dan titik screenshot di 390x844 dan 1250x850, cek keterbacaan, tes di offline, Motion off, Calm, kontras tinggi |

## Gambar (Codex, pelengkap)
| Batch | Isi |
|---|---|
| 234 (17) | Scene layar Learn, sampul track, 9 sampul tempat, 4 pose Hoot |
| 235 (18) | 16 ikon konsep, 2 lencana track |
| 236 (13) | Peta lembah (PC, phone), scene ujian akhir (PC, phone), 4 lencana peringkat, 5 pose Sela |
Selama gambar belum ada, Learn memakai gambar sementara dari app. Gambar tidak boleh memuat angka atau huruf, jadi semua angka, dadu dan diagram dibuat HTML.

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
