# Laporan tahap P4: 11 kelas Valda's Spire of Secrets 2024

Branch: third-party-all. Tidak ada rilis. Buku mati secara bawaan. Kelas muncul hanya saat buku aktif atau saat build memakai kelas itu.

## Isi yang masuk

| Kelas | Subclass | Fitur pilihan | Catatan mesin |
|---|---|---|---|
| Alchemist | 10 | 18 Bomb Formula, 12 Discovery | Pelacak Reagents dari tabel |
| Captain | 12 | 5 maneuver | Battle Dice, subclass lintas kelas |
| Craftsman | 11 | 26 mastery property | Pelacak Instant Crafting |
| Investigator | 13 | tidak ada | Pelacak Rushed Incantation dan Trinkets |
| Martyr | 14 | tidak ada | Tanpa slot: mantra siap dan level maksimum dari tabel, Spell Uses |
| Necromancer | 14 | tidak ada | Penyihir penuh, Charnel Touch Points |
| Vagabond | 11 | 9 Secret, 24 maneuver | Battle Dice |
| Warden | 12 | tidak ada | Interrupt, Guardian Tactics |
| Warmage | 10 | 42 Trick, 8 Arcane Initiation | Hanya cantrip, jumlah naik per level |
| Witch | 13 | 11 Curse, 10 Grand Hex | Penyihir penuh |
| Dancer | 14 | tidak ada | Pelacak Dances |

Total 134 subclass unik. Subclass lintas kelas (Captain dan Vagabond) dibuat satu kali dan tampil di kedua kelas dengan catatan GM.

## Perubahan mesin

| File | Perubahan |
|---|---|
| src/builder/09-logic-feats-and-choices.js | wxClasses: kelas buku ketiga masuk dan keluar dari CLASSES. Subclass alt |
| src/builder/13-logic-sources-and-packs.js | Reset paket tidak menghapus fitur kelas buku ketiga |
| src/builder/18-ui-spells.js, 11-logic-derivation.js | Kelas tanpa slot (nslot, smax). Cantrip dengan jumlah langkah bebas |
| src/builder/19-ui-steps-sources-class-bg-species-abilities.js | Teks Primary Ability untuk dua kemampuan |
| tools/tp_class.py, tools/tp_build.py | Pembuat kelas, daftar pilihan, subclass lintas kelas |
| tools/tp/dump.py, gapcheck.py | Alat baca sumber dan cek gaya untuk penulis |
| tests/tp_class.py | Tes baru: 179 cek |

## Belum masuk (di tp-gap.md)

| Hal | Tahap |
|---|---|
| 6 subclass Gunslinger (kelasnya ada di buku Middle Finger of Vecna) | P5 |
| Pemulihan pemakaian lewat sumber daya lain, pelatihan armor dari subclass, pelacak per pilihan | catatan mesin |
| Monster, dewa, aturan varian, hadiah | Q6 sampai Q8 |
