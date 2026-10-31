# Riset kompetitor: character sheet dan builder D&D 2024

Tanggal riset: 2026-10-31. Bahasa: Indonesia.

## Cakupan dan batas

- Halaman unik yang berhasil dibuka dan dibaca: 22 (daftar di bagian akhir).
- Hanya klaim dari halaman yang dibuka yang ditulis. Sisanya ditandai **tidak terbukti**.
- Satu halaman diblokir (github.com/aurorabuilder/elements). Aurora tidak punya bukti dari halaman terbuka.
- Beberapa bukti lama (2019 sampai 2023). Tahun ditulis di tiap baris. Bukti 2025 sampai 2026 ditandai.
- Tidak ada teks buku atau kode berlisensi yang disalin. Semua ringkasan memakai kata sendiri.
- Frekuensi keluhan bersifat kualitatif. Sampelnya kecil dan tidak mewakili seluruh pengguna.

## 1. Efek bersyarat dan advantage/disadvantage

| Pesaing | Perilaku | URL |
|---|---|---|
| D&D Beyond | Pengguna sejak 2020 sampai 2024 minta advantage otomatis, penanda advantage di skill, dan disadvantage dari armor. Staf (2022) menolak otomatis karena advantage dan disadvantage saling batal dan sumber lain tidak terlacak. Sheet hanya menampilkan pengingat. Jalan keluar: buat feat/item homebrew dengan modifier Advantage/Disadvantage pada subtipe skill. Sheet menampilkan huruf "A" hijau di skill yang punya advantage. | https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/149024-rolls-improvement-advantage-disadvantage-and ; https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/20575-manually-adding-advantage-to-skill-checks?comment=46 |
| Roll20 (sheet 2024) | Efek bisa di-toggle. Kondisi seperti poisoned menyalakan efek. Ada ikon kilau saat efek aktif. Roll memakai advantage/disadvantage otomatis. Laporan 2026: toggle Great Weapon Master menambah bonus ke semua senjata dan harus dinyalakan manual. Elven Accuracy tampil tanpa toggle jelas. | https://blog.roll20.net/posts/game-changing-features-on-roll20s-2024-dd-character-sheets ; https://app.roll20.net/forum/permalink/12691393 |
| Foundry dnd5e | Active Effects memakai rumus yang merujuk data aktor (mod, proficiency, level kelas). Bonus rumus baru dihitung saat roll, tidak tampil di sheet. Resistance/immunity hanya penanda, tidak otomatis. Halaman tidak menyebut kunci advantage. | https://hackmd.io/@foundryvtt-dnd5e/active-effects |
| Foundry (modul Automated Conditions 5e) | Modul pihak ketiga. Kondisi (blinded, poisoned, prone, restrained, dan lain-lain) mengubah advantage/disadvantage pada attack, save, check. Ada cek jarak (long range, out of range). Efek punya flag kondisi. Auras bisa memberi bonus ke sekutu/musuh dekat. | https://foundryvtt.com/packages/automated-conditions-5e |
| Fantasy Grounds | Efek ditulis sebagai teks berkode: label, modifier huruf besar, nilai, kualifier jarak, rantai dengan titik koma. Ada modifier DISATK (disadvantage serangan). Advantage datang tidak langsung lewat kondisi. IF/IFT: tidak terbukti (halaman tidak membahas). | https://fantasygroundsunity.atlassian.net/wiki/spaces/FGCP/pages/996642031/5E+Effects+for+Advanced+Automation |
| Shard | Fitur dengan efek terstruktur (bonus, AC, resistance, spell). Advantage tidak dimodelkan, hanya teks pengingat. Update "Powers" (tahun 2022, dari metadata gambar): kondisi punya durasi, bardic inspiration terhapus saat dipakai, sneak attack bisa di-toggle. | https://shardtabletop.com/feature-modeling ; https://www.shardtabletop.com/blog/massive-update-shard-powers-activate |
| Demiplane/Nexus | Tidak terbukti. Halaman peluncuran Nexus tidak membahas alat karakter. | https://forums.demiplane.com/t/announcing-d-d-nexus-part-of-the-connected-d-d-experience-on-roll20/5629 |
| Pathbuilder 2e, Lorefire, Aurora, Hero Lab (5e 2024), Roll20 lainnya | Tidak terbukti. | - |

## 2. Custom modifier dan homebrew

| Pesaing | Perilaku | URL |
|---|---|---|
| D&D Beyond | Homebrew lewat feat, ras, subclass, item dengan modifier. Homebrew harus diaktifkan di sheet. Permintaan (2025/2026) tentang invocation homebrew dan pilihan versi 2014/2024: ada di thread PHB (Des 2024). | https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/20575-manually-adding-advantage-to-skill-checks?comment=46 ; https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |
| Roll20 (2024) | Ubah bonus item atau stat tanpa merusak otomasi. Laporan Feb 2026: tambah species/background/subclass kustom terasa sulit. Resource kustom bisa ditambah ke item/fitur, tapi pengurangan otomatis belum ada (Mar 2026). | https://blog.roll20.net/posts/game-changing-features-on-roll20s-2024-dd-character-sheets ; https://app.roll20.net/forum/permalink/12670162 ; https://app.roll20.net/forum/permalink/12691393 |
| Shard | Satu dialog fitur untuk semua sumber, termasuk kustom. Tiga mode tampil: sembunyi, teks, daftar pilihan. Ada "User Pick Custom", "Create Item", "Text Attribute". | https://shardtabletop.com/feature-modeling |
| Foundry dnd5e | AC kustom dengan rumus, bonus per tipe serangan, gerak dengan multiply/override. Cara cari jalur data: lewat konsol atau ekspor JSON. | https://hackmd.io/@foundryvtt-dnd5e/active-effects |
| Demiplane | Permintaan pengguna (Feb 2023): alat homebrew lebih kuat dari DDB. Ini opini pengguna, bukan kebijakan Demiplane. | https://forums.demiplane.com/t/5e-homebrew-support/1495 |
| Pathbuilder 2e | Paket berbayar: toggle aturan varian (Free Archetype, Ancestry Paragon, Gradual Ability Boosts). Item kustom: tidak terbukti. | https://groupfinder.eu/library/pathbuilder-2e |
| Aurora, Hero Lab, Fantasy Grounds | Aurora: tidak terbukti. Hero Lab: catatan rilis Feb 2024 menyebut alat konten kustom "sedang dikembangkan" (bukan 5e). FG: efek teks (lihat bagian 1). | https://info.wolflair.com/xwiki/bin/view/Hero%20Lab%20Online/Release%20Notes/2024-02-07/ |
| ENWorld | Satu pengguna (Okt 2023) minta builder pihak ketiga yang bisa tambah kelas homebrew tanpa belajar bahasa kode. Tidak ada balasan di halaman. | https://www.enworld.org/threads/character-builders-user-friendly-allow-adding-a-new-class.700246/ |

## 3. Level up dan multiclass

| Pesaing | Perilaku | URL |
|---|---|---|
| D&D Beyond | Laporan Des 2024: bug Weapon Mastery saat multiclass ke Fighter (pilihan level 1 tidak muncul bila sudah ada mastery). Fighting Style Ranger/Paladin tidak bisa dipilih. Agonizing Blast tidak memilih cantrip. Ritual Caster feat bermasalah. Tidak ada tanda level fitur di daftar kelas. Sebagian sudah diperbaiki. | https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |
| Roll20 (2024) | Maret 2026: pengguna minta input hit die manual saat level up. Roll20 menjawab tidak ada di daftar kerja. Builder dilaporkan menimpa pekerjaan sheet lama (Mar 2026), Roll20 bilang hanya menambah. | https://app.roll20.net/forum/permalink/12691393 |
| Foundry dnd5e | Daftar isu GitHub (Agu sampai Sep 2026) yang saya lihat tidak berisi isu advancement terbuka. Mekanisme advancement itu sendiri: tidak terbukti dari halaman ini. | https://github.com/foundryvtt/dnd5e/issues |
| Shard | Ability Score Improvement sudah dibangun sebagai pilihan antara dua kenaikan atau feat. | https://shardtabletop.com/feature-modeling |
| Pathbuilder 2e | Bisa merencanakan progres karakter lebih dulu (paket berbayar). | https://groupfinder.eu/library/pathbuilder-2e |
| Lainnya | Tidak terbukti. | - |

## 4. Validasi pilihan

| Pesaing | Perilaku | URL |
|---|---|---|
| D&D Beyond | Bukti hanya lewat bug: Ritual Caster menampilkan jumlah dropdown spell yang salah (3 dropdown, yang ketiga kosong; 6 pilihan di proficiency 3). Draconic Sorcery menambah Dex dua kali ke AC (AC 16 seharusnya 14). Ini kegagalan validasi/hitung, bukan fitur. | https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |
| Roll20 (2024) | Dropdown waktu cast tidak menerima nilai bebas yang tersimpan (Feb 2026). Satu pengguna bilang field proficiency hanya satu entri, pengguna lain membantah. Hasil akhir tidak jelas. | https://app.roll20.net/forum/permalink/12670162 |
| Shard | Skor kemampuan dibatasi 20 kecuali diedit langsung di sheet. | https://shardtabletop.com/feature-modeling |
| Foundry | Skor yang di-override bisa diedit di sheet tapi kembali setelah sheet ditutup. | https://hackmd.io/@foundryvtt-dnd5e/active-effects |
| Lainnya | Tidak terbukti. | - |

## 5. Tombol roll dan log

| Pesaing | Perilaku | URL |
|---|---|---|
| Roll20 (2024) | Tombol roll di sheet, template roll untuk weapon mastery, upcast dengan prompt. Query-mode action roll rusak lalu dilaporkan diperbaiki (Mar 2026). Efek tidak terkirim ke chat (dilaporkan Mar 2026). Permintaan: reroll crit dice, ambang crit per senjata (Roll20 bilang sedang dikerjakan). | https://blog.roll20.net/posts/game-changing-features-on-roll20s-2024-dd-character-sheets ; https://app.roll20.net/forum/permalink/12691393 |
| D&D Beyond | Pengguna bilang Ctrl/Shift saat klik menerapkan advantage/disadvantage (2021, lewat ekstensi Beyond 20 yang disebut pengguna). Usul 2022: tampilkan hasil roll biasa dan hasil adv/dis sekaligus bila ada sumber. | https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/20575-manually-adding-advantage-to-skill-checks?comment=46 ; https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/149024-rolls-improvement-advantage-disadvantage-and |
| Shard | Chat membawa aksi. GM bisa minta save dari chat. Damage dicatat per tipe. Full/half damage berdasar hasil save (2022). | https://www.shardtabletop.com/blog/massive-update-shard-powers-activate |
| Foundry dnd5e | Isu terbuka Sep 2026: dialog save multi-kemampuan langsung memilih kemampuan pertama. Tooltip skill menimpa area klik di resolusi kecil. | https://github.com/foundryvtt/dnd5e/issues |
| Lainnya | Tidak terbukti. | - |

## 6. Mode offline dan sinkron

| Pesaing | Perilaku | URL |
|---|---|---|
| D&D Beyond | Thread 2019: pengguna minta akses offline dan sinkron saat tersambung kembali. Satu pengguna menyarankan cetak sheet sebagai opsi offline. Status offline 2025/2026: **tidak terbukti**. Changelog 2020 tidak membahas sync/offline. | https://www.dndbeyond.com/forums/d-d-beyond-general/news-announcements/19546-the-character-sheet-revamp-is-here?page=11 ; https://www.dndbeyond.com/old-changelog/788-character-service-migration-update?comment=22 |
| Pathbuilder 2e | Sinkron lewat Google Drive (paket berbayar). Ekspor PDF dan JSON untuk Foundry/Roll20. Offline: tidak terbukti. | https://groupfinder.eu/library/pathbuilder-2e |
| Lorefire | Aplikasi desktop "local-first" untuk kampanye. Transkripsi lokal tanpa cloud. Offline penuh dan dukungan aturan 2024: tidak terbukti. | https://www.producthunt.com/products/lorefire/reviews |
| Roll20 | Sheet berjalan online di VTT. Mode offline: tidak terbukti. | https://blog.roll20.net/posts/game-changing-features-on-roll20s-2024-dd-character-sheets |
| Lainnya (Demiplane, Shard, FG, Hero Lab, Aurora) | Tidak terbukti. | - |

## 7. Isu lain yang terbukti dari halaman

- Foundry: komunitas khawatir terpaksa pindah ke aturan 2024 (Sep 2024). Jawaban: ada toggle 2014/2024. Modul otomasi bisa tertinggal. https://lr.sudovanilla.org/r/FoundryVTT/comments/1fif361/i_dont_want_to_2024_dnd5e
- D&D Beyond: PHB dan DMG dilaporkan hilang dari kepemilikan tiap beberapa hari. Epic boon hilang, selesai setelah sinkron lisensi akun (Des 2024). https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86
- Roll20 (Mar 2026): performa buka sheet lambat, nilai `@{npc}` terbalik dibanding 2014 (akan dikoreksi). https://app.roll20.net/forum/permalink/12691393

## 10 keluhan pengguna

Frekuensi kualitatif: tinggi = muncul di beberapa halaman atau banyak pos. sedang = muncul di dua halaman. rendah = satu halaman atau satu pos.

| # | Keluhan | Frekuensi | Sumber |
|---|---|---|---|
| 1 | Advantage/disadvantage tidak otomatis atau tidak terlihat. Pemain lupa menerapkannya. | Tinggi (D&D Beyond 2020 sampai 2024, Roll20 2026, Shard hanya teks) | https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/20575-manually-adding-advantage-to-skill-checks?comment=46 ; https://app.roll20.net/forum/permalink/12691393 |
| 2 | Bug builder: pilihan fitur salah atau tidak muncul (Fighting Style, Agonizing Blast, Ritual Caster, Weapon Mastery multiclass). | Tinggi (banyak pos Des 2024) | https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |
| 3 | Hitungan AC salah (Dex ganda pada Draconic Sorcery). | Rendah | halaman yang sama |
| 4 | Upcast dan scaling cantrip tidak otomatis di sheet 2024 Roll20. Pengguna ingin kembali ke sheet 2014. | Sedang (Feb dan Mar 2026) | https://app.roll20.net/forum/permalink/12670162 ; https://app.roll20.net/forum/permalink/12691393 |
| 5 | Resource kustom tidak berkurang otomatis saat aksi dipakai. | Rendah | https://app.roll20.net/forum/permalink/12691393 |
| 6 | Homebrew sulit: spesies/background/subclass kustom, invocation kustom. | Sedang | https://app.roll20.net/forum/permalink/12670162 ; https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 ; https://www.enworld.org/threads/character-builders-user-friendly-allow-adding-a-new-class.700246/ |
| 7 | Toggle efek kasar: Great Weapon Master berlaku ke semua senjata, harus manual. | Rendah | https://app.roll20.net/forum/permalink/12691393 |
| 8 | Tidak ada akses offline dan sinkron saat tersambung kembali (D&D Beyond, 2019; belum terbukti sudah diatasi). | Rendah (usia bukti tua) | https://www.dndbeyond.com/forums/d-d-beyond-general/news-announcements/19546-the-character-sheet-revamp-is-here?page=11 |
| 9 | Kepemilikan konten hilang atau tidak sinkron (butuh sinkron lisensi). | Rendah | https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |
| 10 | Level up kurang fleksibel (tidak bisa input hit die manual), fitur kelas tanpa tanda level, builder dituduh menimpa data. | Rendah sampai sedang | https://app.roll20.net/forum/permalink/12691393 ; https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86 |

Catatan: GitHub Foundry (Agu sampai Sep 2026) menunjukkan isu kecil di roll, efek, dan status. Tidak ada keluhan advancement terbuka di daftar itu. Reddit dan ENWorld: hanya dua halaman terbuka (Reddit Foundry 2024, ENWorld 2023), jadi sinyalnya tipis.

## 10 ide untuk kami

| # | Ide | Alasan (dasar bukti) |
|---|---|---|
| 1 | Chip advantage/disadvantage per roll dengan sumbernya, tanpa pembatalan diam-diam. Tampilkan semua sumber, hitung hasil bersih, dan sediakan override manual. | Staf DDB menolak otomatis karena sumber saling batal (2022). Pengguna tetap minta penanda. Kami bisa menang di transparansi. |
| 2 | Tampilkan hasil roll biasa dan hasil adv/dis berdampingan bila ada sumber tak pasti. | Usul pengguna DDB 2022. Murah dibuat. |
| 3 | Penanda "A" atau "D" di baris skill dan save. | Pengguna DDB minta penanda visual (2024). Ada penanda hijau di sheet DDB. |
| 4 | Efek sebagai data: kondisi, durasi, target roll, rumus berbasis stat (mod, proficiency, level). Toggle per efek, dengan ikon aktif. | Pola Foundry (rumus) dan Roll20 (toggle, ikon kilau). |
| 5 | Toggle efek yang sadar jenis senjata dan jenis roll (GWM hanya senjata heavy). | Keluhan GWM Roll20 Mar 2026. |
| 6 | Resource kustom terhubung ke aksi dan mengurang otomatis, dengan tombol rest yang mereset dan merangkum. | Roll20 belum punya pengurangan otomatis (Mar 2026). Rest summary ada di Roll20. |
| 7 | Satu model "fitur" untuk semua sumber (bawaan dan homebrew) dengan mode tampil: sembunyi, teks, daftar pilihan. | Pola Shard. Menyederhanakan homebrew tanpa kode. |
| 8 | Builder tanpa kode untuk elemen homebrew (spesies, background, feat, invocation). | Keluhan homebrew di Roll20, DDB, ENWorld. |
| 9 | Validator pilihan: jumlah slot pilihan dihitung dari data (Ritual Caster, Fighting Style, Weapon Mastery multiclass), dengan uji otomatis untuk tiap kasus bug DDB Des 2024. Ditambah tanda level pada fitur kelas. | Bug DDB berulang pada kelas dan multiclass. Daftar bug jadi daftar tes regresi kami. |
| 10 | Offline penuh (PWA), ekspor/impor JSON, sinkron opsional saat tersambung. Level up dengan opsi hit die manual. | Permintaan offline DDB (2019). Ekspor JSON ada di Pathbuilder. Permintaan hit die manual Roll20 (Mar 2026). Kami sudah satu file offline, jadi ini keunggulan nyata. |

## Halaman yang dibuka (22)

1. https://blog.roll20.net/posts/game-changing-features-on-roll20s-2024-dd-character-sheets
2. https://hackmd.io/@foundryvtt-dnd5e/active-effects
3. https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/149024-rolls-improvement-advantage-disadvantage-and
4. https://forums.demiplane.com/t/5e-homebrew-support/1495
5. https://forums.demiplane.com/t/announcing-d-d-nexus-part-of-the-connected-d-d-experience-on-roll20/5629 (tanpa isi alat karakter)
6. https://foundryvtt.com/packages/automated-conditions-5e
7. https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/204813-players-handbook-issues-and-support-thread?page=86
8. https://www.shardtabletop.com/blog/massive-update-shard-powers-activate
9. https://shardtabletop.com/feature-modeling
10. https://www.producthunt.com/products/lorefire/reviews
11. https://fantasygroundsunity.atlassian.net/wiki/spaces/FGCP/pages/996642031/5E+Effects+for+Advanced+Automation
12. https://www.enworld.org/threads/character-builders-user-friendly-allow-adding-a-new-class.700246/
13. https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/20575-manually-adding-advantage-to-skill-checks?comment=46
14. https://info.wolflair.com/xwiki/bin/view/Hero%20Lab%20Online/Release%20Notes/2024-02-07/ (bukan 5e)
15. https://www.enworld.org/posts/8789621 (tidak relevan)
16. https://groupfinder.eu/library/pathbuilder-2e
17. https://www.dndbeyond.com/old-changelog/788-character-service-migration-update?comment=22
18. https://github.com/foundryvtt/dnd5e/issues
19. https://app.roll20.net/forum/permalink/12670162
20. https://app.roll20.net/forum/permalink/12691393
21. https://lr.sudovanilla.org/r/FoundryVTT/comments/1fif361/i_dont_want_to_2024_dnd5e
22. https://www.dndbeyond.com/forums/d-d-beyond-general/news-announcements/19546-the-character-sheet-revamp-is-here?page=11

Dari 22 halaman, 4 lemah atau tidak relevan (butir 5, 14, 15, 17). Ambang minimal 15 tercapai.

## Celah bukti

- Demiplane/Nexus 2024: tidak ada bukti fitur sheet.
- Aurora Builder: tidak ada bukti (halaman GitHub diblokir).
- Hero Lab untuk 5e 2024: tidak terbukti.
- Pathbuilder offline dan item kustom: tidak terbukti.
- Fantasy Grounds multiclass dan level up: tidak terbukti.
- Foundry advancement dan multiclass: tidak terbukti.
- Offline D&D Beyond 2025/2026: tidak terbukti.
- Reddit 2025/2026 tentang D&D Beyond dan Demiplane: belum dibuka.
