# Gambar yang perlu dibuat Codex

Tanggal: 1 November 2026. Daftar nama lengkap per kategori ada di `reports/gambar-codex/<kategori>.txt` (kolom: nama, tab, keterangan sumber).

## Keadaan sekarang

Library memakai gambar 5etools bila ada. Bila tidak ada, aplikasi memakai ikon Codex. Ikon Codex yang sudah ada hanya untuk 12 kelompok: spell (199), item (676), ability, coin, condition, creature, damage, featcat, itemcat, mastery, school, skill. Kategori lain tidak punya ikon, jadi tampil kosong.

## Entri yang belum punya gambar sama sekali

Hitungan setelah semua gambar 5etools dipasang (7.200 file) dan setelah ikon Codex yang ada dikurangi.

| Kategori | Entri tanpa gambar | Saran jenis gambar | Prioritas |
|---|---|---|---|
| Spell | 1.572 | Ikon per sekolah sihir dengan variasi per spell inti 2024, atau ikon per spell | 1 |
| Item (magis) | 2.084 | Ikon per jenis item (senjata, armor, jubah, cincin, tongkat, ramuan, gulungan, ajaib) lalu ikon per item inti DMG 2024 | 1 |
| Gear | 726 | Ikon per jenis perlengkapan (alat, makanan, kendaraan, hewan tunggang, amunisi) | 2 |
| Feat | 526 | Satu ikon per kelompok feat (origin, general, fighting style, epic boon) ditambah ikon per feat inti 2024 | 2 |
| Subclass | 430 | Lambang per subclass inti 2024, lainnya satu ikon per kelas | 2 |
| Deity | 283 | Simbol suci per dewa | 3 |
| Recipe | 257 | Ilustrasi makanan per kelompok | 3 |
| Background | 141 | Satu ikon per latar inti 2024 | 2 |
| Species | 99 | Potret per species inti 2024 yang belum ada | 2 |
| Creature | 36 | Potret makhluk panggilan atau pendamping | 2 |
| Monster | 18 | Token sederhana | 3 |
| Vehicle | 43, Object 22, Hazard 85, Facility 35 | Ilustrasi kecil per entri | 3 |
| Lainnya (language 109, optfeat 106, opt 58, psionic 52, cult 40, charopt 39, disease 29, deck 27, rule 336, table 101, book 169, feature 3.467) | 4.600 | Satu ikon per kategori dan per subjenis, bukan per entri | 1 |

## Yang paling berguna lebih dulu

1. Satu ikon per kategori (sekitar 28) dan per subjenis (sekitar 60). Ini menutup lebih dari 4.600 entri yang tidak mungkin punya gambar sendiri (feature, rule, table, book, language, dan sejenisnya).
2. Ikon per jenis item dan per sekolah spell. Ini menutup sebagian besar 3.600 item dan spell tanpa gambar.
3. Ikon per entri untuk konten inti 2024: spell PHB 2024, item DMG 2024, feat, subclass, species, background.
4. Sisanya, per entri, hanya jika waktu cukup.

## Ketentuan gambar

Mengikuti set ikon Codex yang ada di `img/icon/`: format AVIF, persegi, sekitar 256 px, latar transparan, gaya sama dengan ikon item dan spell yang sudah ada. Nama file memakai slug nama entri (huruf kecil, tanda hubung), misalnya `img/icon/feat/great-weapon-master.avif`. Setelah file jadi, saya daftarkan di `src/fx/23-class-art-data.js` dan tampilkan di baris dan detail Library.
