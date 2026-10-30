# Laporan tahap P5a: Exploring Eberron 2024 (EE24)

Branch: third-party-all. Tidak ada rilis. Buku mati secara bawaan dan terkunci seperti wxGate.

| Bagian | Jumlah | Catatan |
|---|---|---|
| Subclass | 6 | Circle of the Forged, College of the Dirge Singer, Forge Adept, Maverick (Artificer), Mind Domain, Warrior of the Living Weapon |
| Species | 10 | Dua Aasimar, tiga Dhakaani, Gnoll, Jhorgun'taal, Kalamer Landwalker, Ruinbound, Sahuagin |
| Background | 7 | Pilihan alat Malenti lewat kategori baru xee24 |
| Feat | 12 | Mantra gratis lewat dm, pelacak, aksi |
| Mantra | 4 | Muncul hanya saat buku aktif |
| Item | 104 | 96 item sumber, 8 varian ajaib (Tools of the Master, Bane, Byeshk, Hungry, Resistance Breaker, Silent). Wand, Channel, Reservoir tiap tanda naga satu baris |

Perubahan mesin: tools/tp_build.py menerima nama magicvariant sebagai item. Manifest memuat tp04-tee24.js. Tes baru tests/tp_ee24.py (55 cek) dan 6 kasus di tp-cases.json.

Tes: tp_sources 693 cek, tp_ee24 55, tp_spells 5, tp_ui 9, scenarios 24, golden 1001 karakter, fuzz 500, CSP bersih. Semua lolos di 390x844 dan 1250x850.

Belum masuk (tp-gap.md): 10 monster, 12 reward (tahap Q), 7 itemGroup (sudah satu baris per anggota).

Keterbatasan mesin: Aasimar Mabaran damage Celestial Revelation mengikuti sumber (kemungkinan salah ketik di sumber). Bonus AC feat Changeling Metamorphosis hanya catatan. Pilihan Martial Form dan Manifest Blow (Living Weapon) hanya teks. Arcane Prototype Maverick tanpa pelacak. Coat of Many Eyes: hanya AC dan Darkvision otomatis. Bentuk landwalker Kalamer hanya teks.
