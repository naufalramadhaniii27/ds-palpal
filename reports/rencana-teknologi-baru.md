# Rencana teknologi baru untuk seluruh app (2026-10-29)

Teknologi buatan sendiri di atas fitur web terbaru (lihat claude/audit-teknologi-app.md). Kolom "Cek ide serupa" berisi hasil pencarian web 2026-10-29. "Tidak ditemukan" artinya tidak muncul di pencarian, bukan jaminan belum pernah ada di mana pun.

## Usulan
| No | Nama | Isi | Dibangun dari | Cek ide serupa | Status |
|---|---|---|---|---|---|
| N1 | Reverse Builder | Tulis tujuan ("AC minimal 18, Stealth minimal +7, level 5"), mesin mencari kombinasi species, background, score, feat dan armor yang sah, lalu menampilkan beberapa pilihan dengan untung-ruginya. Berjalan di Web Worker supaya layar tidak macet | Mesin derivasi builder, Web Worker | Tidak ditemukan untuk D&D 5e. Yang ada: kalkulator AC, planner Pathfinder Kingmaker, simulator | Diterima 2026-10-29 |
| N2 | Mesin waktu karakter | Setiap perubahan dicatat sebagai kejadian. Geser garis waktu untuk melihat sheet di titik mana pun, bandingkan dua titik, pulihkan. Tersimpan lokal di IndexedDB, ikut sinkron secara ringkas | Event log, IndexedDB, View Transitions | Pengguna D&D Beyond dan Demiplane meminta change log di forum, belum tersedia | Diterima 2026-10-29 |
| N3 | Struk angka dan diff pembaruan | Setiap angka di sheet membawa asal-usul (aturan, item, fitur, entri Library). Setelah app diperbarui, muncul daftar "angka yang berubah di karaktermu dan sebabnya" | Mesin derivasi, rincian di 11-ui-breakdown.js | D&D Beyond hanya memberi tooltip errata, tanpa diff per karakter | Diterima 2026-10-29 |
| N4 | Rekap sesi tanpa AI | Dari catatan kejadian N2: damage diterima, penyembuhan, spell dipakai, slot habis, rest, naik level. Kartu rekap bisa disimpan sebagai gambar. Jalan offline, tidak mengirim apa pun | N2, canvas | Alat yang ada membuat rekap dari rekaman suara memakai AI berbayar | Diterima 2026-10-29 |
| N5 | Sheet masa depan | Lihat karakter dari level sekarang sampai 20: grafik HP, AC, bonus serangan, slot spell. Rencanakan pilihan level berikutnya lebih dulu | Mesin derivasi builder, SVG | Planner ada di game lain (Pathfinder). Gabungan planner dengan sheet yang hidup tidak ditemukan | Diterima 2026-10-29 |
| N6 | Rules fuzzer | Alat Checker: membuat ribuan karakter sah secara acak lewat builder, lalu memeriksa aturan tetap (tidak ada NaN, slot sesuai tabel, ekspor lalu impor sama persis, AC masuk akal) | Builder, Node, tes | Teknik property testing sudah dikenal. Penerapan ke builder 5e tidak ditemukan | Diterima 2026-10-29 |
| N7 | Playbar sesuai situasi | Sheet mengenali situasi dari keadaannya sendiri: bertarung (tombol New turn, menerima damage, death save), lihat bagian N7 rinci, menjelajah, istirahat. Tombol yang relevan naik ke depan. Dihitung di HP, tidak disimpan (sejalan U30) | State sheet, View Transitions | Tidak ditemukan | Ditolak 2026-10-29 |
| N8 | Migrator cascade layer | Alat build: memindahkan 36 file patch CSS ke `@layer` secara otomatis. Playwright membandingkan gaya hasil di semua layar sebelum dan sesudah, harus sama persis, baru `!important` dibuang satu per satu | Playwright, `@layer` | Tidak ditemukan | Diterima 2026-10-29 |
| N9 | Rules lint saat main | Builder sudah punya ruleIssues saat membuat karakter. N9 memeriksa sheet saat main: dua spell Concentration sekaligus, Mage Armor bersama armor, armor berat tanpa Strength cukup, shield dengan dua senjata, attunement lebih dari 3. Muncul sebagai tanda kecil dengan alasan dan tombol perbaikan | Mesin derivasi, ruleIssues builder | D&D Beyond hanya punya sebagian peringatan dan ada laporan bug peringatan di forum. Pemeriksa lengkap saat main tidak ditemukan | Diterima 2026-10-29 |
| N10 | Chip peluang | Di samping setiap bonus (skill, save, serangan) ada chip peluang berhasil terhadap angka target umum (10, 15, 20), dengan dan tanpa Advantage. Dihitung pasti, bukan perkiraan | Matematika d20, mesin derivasi | Ada di Foundry VTT (modul Calculated Risk) dan kalkulator terpisah. Di sheet HP yang menempel ke tiap bonus tidak ditemukan | Diterima 2026-10-29 |
| N11 | Build DNA | Karakter dikodekan sebagai resep pilihan saja (class, species, background, score, feat, spell), bukan semua angka hasil. Hasilnya cukup satu kode QR atau satu link pendek. Penerima membangun ulang lewat builder. Sekarang kirim QR memakai banyak bingkai QR berganti berisi JSON penuh | Builder, CompressionStream, QR di 42 | Tidak ditemukan | Diterima 2026-10-29 |
| N12 | Gabung per bagian saat bentrok | Sekarang bila dua perangkat mengubah karakter yang sama, perangkat ini menang dan salinan lain disimpan sebagai versi. N12 membandingkan tiga salinan (dasar, sini, sana) seperti git. Bagian yang tidak bentrok digabung otomatis, yang bentrok ditanyakan per bagian (misal HP dari HP, catatan dari PC) | Revisi base di API sinkron, N2 | Teknik three-way merge sudah dikenal. Penerapan di sheet D&D belum dicek | Diterima 2026-10-29 |
| N13 | Pratinjau sebelum restore | Sebelum memulihkan backup atau versi lama, tampil daftar yang akan berubah (level, HP, item, spell) memakai struk angka N3. Restore bisa dibatalkan | N3, versi cloud | Belum dicek | Diterima 2026-10-29 |
| N14 | Tingkat efek sesuai perangkat | App mengukur kemampuan HP saat pertama dibuka (jumlah core, memori, kelancaran frame). HP lemah otomatis memakai efek ringan tanpa mengubah setelan Motion. Perluasan U50 ke seluruh app | navigator.hardwareConcurrency, deviceMemory, Long Animation Frames bila ada | Tekniknya dikenal di game. Belum dicek untuk sheet | Diterima 2026-10-29 |
| N15 | Tanya aturan tanpa AI | Library bisa menjawab pertanyaan biasa ("how do I hide?", "can I attack twice?"). Tabel niat yang ditulis tangan memetakan kata tanya ke entri Library, lalu jawabannya diambil dari entri itu. Jalan offline, tanpa AI, tidak bisa mengarang | Pencarian Library di 27, glossary di 03 | Belum dicek | Diterima 2026-10-29 |
| N16 | Pratinjau Apply | Sebelum Apply dari builder, sheet tampil dengan angka yang akan berubah menyala (AC 16 menjadi 17, spell baru, HP maksimum). Apply bisa dibatalkan | N3 struk angka, View Transitions | Belum dicek | Diterima 2026-10-29 |
| N17 | Status ke grup chat | Satu tombol menyalin status singkat ke clipboard untuk WhatsApp atau Discord: "Yudhi, HP 32/44, AC 18, Concentrating: Bless, Poisoned". Format bisa dibaca balik oleh fitur impor teks chat yang sudah ada di 16 | Clipboard, impor teks di 16 | Belum dicek | Diterima 2026-10-29 |
| N18 | Laporan bug yang bisa diputar ulang | Laporan masalah (#rep) sekarang memuat versi, browser, error, dan karakter. N18 menambah jejak tindakan terakhir dari catatan undo, sehingga bug bisa diputar ulang langkah demi langkah oleh skrip Playwright | Catatan undo di 32, laporan di 27 | Belum dicek | Diterima 2026-10-29 |

## Urutan yang disarankan
| Urutan | Usulan | Alasan |
|---|---|---|
| 1 | N6 Rules fuzzer | Menjaga kebenaran semua usulan lain |
| 2 | N3 Struk angka | Fondasi untuk N1, N5, dan U40 (Explain any number) di Learn |
| 3 | N2 Mesin waktu | Fondasi untuk N4 |
| 4 | N8 Migrator layer | Membuka jalan perbaikan CSS di audit (prioritas 4) |
| 5 | N1, N5, N4 | Fitur yang terlihat pengguna |
| 6 | N12, N13, N16 | Keamanan data saat bentrok, restore, dan Apply. N13 dan N16 memakai N3 |
| 7 | N9, N10, N11, N15, N17 | Fitur sheet dan Library |
| 8 | N14, N18 | Performa dan alat bug |

## Batas
- Semua jalan di paket gratis Cloudflare dan di HP, tanpa AI berbayar.
- Tidak mengubah key localStorage atau bentuk data lama tanpa migrasi.
- N2 menambah data per karakter. Perlu batas (misal ringkas kejadian lama) supaya kuota cloud tidak habis.

## Sumber cek ide serupa
- https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/15530-character-sheet-change-logs
- https://forums.demiplane.com/t/can-we-track-changes-character-sheets/6158
- https://www.dndbeyond.com/changelog/373-official-errata-extra-life-adventure-tooltip
- https://myarchivist.ai/dnd-session-recap
- https://github.com/AClaybrook/DAndDSimulator
- https://foundryvtt.com/packages/calculated-risk
- https://www.dndbeyond.com/forums/d-d-beyond-general/bugs-support/9173-armor-disadvantage-on-stealth

## N7 rinci: cara mengenali situasi (2026-10-29, ditolak user, disimpan sebagai catatan)
Bukan AI. Aturan sederhana dari tindakan yang sudah dicatat sheet (label undo di 32-logic-play-undo-actions.js dan panel Situations di 34-ui-situations.js). App tidak tahu lemparan dadu fisik, jadi yang dibaca hanya tindakan di sheet.

| Situasi | Sinyal yang menaikkan | Yang naik ke depan |
|---|---|---|
| Bertarung | Tombol New turn, menerima damage, Temporary HP, death save, condition tempur (Grappled, Prone, Restrained, Frightened), mulai Concentration, Rage, memakai slot spell, amunisi, Limited Use | Serangan, spell siap pakai, Bonus Action, Reaction, HP, Concentration |
| Istirahat | Dialog Short Rest atau Long Rest dibuka, HP di bawah maksimum dan tidak ada sinyal tempur selama beberapa menit | Short Rest, Long Rest, Hit Point Dice, fitur yang pulih |
| Menjelajah dan ngobrol | Bawaan bila tidak ada sinyal lain | Skill (Perception, Investigation, Stealth), passive score, Influence, Study |
| Di kota dan downtime | Membuka inventaris, koin, Bastion, naik level | Inventaris, koin, Bastion |

| Aturan | Isi |
|---|---|
| Skor dengan peluruhan | Tiap sinyal menambah skor situasinya. Skor turun setengah tiap sekitar 5 menit. Situasi dengan skor tertinggi yang menang |
| Keluar dari bertarung | Short Rest atau Long Rest, atau tidak ada sinyal tempur sekitar 10 menit |
| Pilihan manual menang | Chip "Combat, Exploring, Resting" selalu terlihat. Pilihan pengguna tidak ditimpa otomatis sampai ada sinyal kuat (misal Long Rest) |
| Terbuka | Chip menyebut alasannya, misal "Combat (you took damage)" |
| Privasi | Skor hanya di memori selama sesi, tidak disimpan, tidak dikirim (sejalan U30) |
| Gerak | Urutan tombol berubah dengan View Transitions, langsung tanpa animasi bila Motion off |
| Tes | Skrip Playwright memainkan urutan tindakan (damage, New turn, Long Rest) lalu memeriksa situasi dan urutan tombol |

## Ide yang dibuang karena sudah ada di app (2026-10-29)
| Ide | Sudah ada |
|---|---|
| Penjaga penyimpanan (Safari menghapus data situs yang tidak dipasang setelah 7 hari tanpa dibuka) | App sudah meminta storage.persist (15), menampilkan statusnya, punya banner "belum ter-backup lebih dari 3 hari", dan sinkron cloud |
