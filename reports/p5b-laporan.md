# Laporan tahap P5b: Grim Hollow Player's Guide 2024 (GHPG24)

Branch: third-party-all. Tidak ada rilis. Buku mati secara bawaan dan terkunci seperti wxGate. Kelas Monster Hunter menyalakan buku sendiri bila dipakai.

| Bagian | Jumlah | Catatan |
|---|---|---|
| Kelas | 1 | Monster Hunter. Monster Grimoire (13 tipe makhluk) sebagai pilihan 2, 3, 4 di level 1, 6, 13. Grave Strike dengan pelacak |
| Subclass | 40 | 4 Guild Monster Hunter dan 36 subclass kelas 2024. Pilihan: Talenta College of Adventurers, Senyawa Living Crucible, Kutukan Misfortune Bringer, Final Night Catharsis, Catastrophic Power, dll |
| Species | 17 | Tiap species memilih 8 dari 107 Heritage Traits. Efek otomatis: Darkvision, Speed, Climb, Swim |
| Background | 25 | |
| Feat | 42 | 7 Fighting Style, 14 General, 9 Origin, 12 Boon |
| Mantra | 101 | Muncul hanya saat buku aktif |
| Senjata | 42 | 9 mastery baru (Brutal, Defending, Disarming, Entangling, Returning, Scatter, Set, Strong-Draw, Swift). Properti AP, BP, CS, D, Dam, Haft, Mag, Mom, Rep ditampilkan |
| Gear | 64 | 43 amunisi khusus, 17 perlengkapan, Magazine. Hunter's Armor |

## Perubahan mesin
| File | Perubahan |
|---|---|
| src/builder/13-logic-sources-and-packs.js | Efek beberapa pilihan species digabung (daftar dan peta), bukan ditimpa |
| tools/tp_build.py | Kelas dengan spasi (prefix tghc_), alias nama bentrok (misal Elf menjadi Elf (Grim Hollow)), blok "daily" additionalSpells tidak lagi dibaca sebagai mantra, properti senjata baru |
| tests/tp_ghpg.py | 115 cek: daftar saat buku mati dan hidup, sheet tiap species, background, item, kelas level 1, 5, 20 |
| tests/fixtures/tp-cases.json | 40 kasus subclass |

Alias dipasang juga untuk Exploring Eberron (Gnoll menjadi Gnoll (Eberron)).

## Belum masuk (tp-gap.md)
| Hal | Rencana |
|---|---|
| 12 Transformation dan 103 Boon/Flaw bertahap | P5c, perlu opsi karakter bertahap di mesin |
| 9 Gift of Dread, Gadget dan modifikasi armor Trapper, mutasi Devourer | P5c |
| Trait Heritage diambil dua kali, skill/resistensi/tool tetap dari trait | Teks saja |
| AC Buckler, Tower Shield, Retractable Shield, Hunter's Armor | Teks saja |
| Slot mantra Occultist Guild | Teks saja |
| 7 monster | Tahap Q |
