# Laporan tahap P5c dan P5d

Branch: third-party-all. Tidak ada rilis. Semua buku mati secara bawaan.

## P5c: Transformation Grim Hollow PG 2024
| Bagian | Jumlah | Catatan |
|---|---|---|
| Transformation | 12 | Aberrant Horror, Fey, Fiend, Hag, Lich, Lycanthrope, Ooze, Primordial, Seraph, Shadowsteel Ghoul, Specter, Vampire |
| Feat stage | 48 | "<Nama> Transformation: Stage N". Pemain memilih Boon stage itu. Boon wajib dan Flaw tertulis di teks feat |
| Boon dan Flaw | sekitar 200 teks | Teks sendiri, angka sama dengan sumber |
| Gift of Dread | 9 | Satu feat dengan pilihan 1 dari 9 |

Mesin: tools/tp_build.py `trans_records` membuat feat dari optionalfeature tiap stage. Tes tests/tp_trans.py.
Belum otomatis: prasyarat antar Boon, efek Boon pada AC, speed, indera, resistensi, pelacak pakai, pilihan di dalam Boon. Semua teks.

## P5d: Steinhardt's Guide to the Eldritch Hunt 2024 (SGEH24)
| Bagian | Jumlah | Catatan |
|---|---|---|
| Kelas | 1 | Jaeger. Adrenaline Arts (1 pilihan di level 2, 7, 13, 17) dan Finishers (level 4, 6, 8, 12). Pelacak Adrenaline Points |
| Subclass | 5 | Absolute, Heretic, Marauder, Salvation, Sanguine Chapter |
| Species | 6 | Manikin, Accursed, Cursed-Blood, Demidritch, Scourgeborne, Deep One Dwarf |
| Background | 9 | |
| Feat | 12 | |
| Mantra | 64 | |
| Item dan senjata | 4 item ajaib, Big Bertha, 2 varian Moongold, 6 senjata, 8 amunisi | Properti Artillery, Barrel, Blaring, Booming, Fan Fire, Steady, Spread Fire, Twinned Barrel, Trick Weapon ditampilkan |

Perbaikan mesin: nama item dengan spasi ganda di sumber (Hand of  Glory) dicocokkan setelah spasi dirapikan. Nama yang bentrok antar buku (Accursed, Beast Hunter) diberi alias "(Steinhardt)". Tes tests/tp_sgeh.py.
Belum otomatis: pilihan Art dan Finisher yang diberikan chapter, invocation Heretic dari daftar Warlock inti, slot mantra Heretic, Momentum dice, bonus HP Marauder.
