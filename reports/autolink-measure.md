# Ukur auto link (presisi dan recall)

Tanggal 2026-11-09. Cabang `claude/autolink-measure`. Mesin yang diukur: `xlink` di `src/app/13-ui-detail-cards.js` (mode sheet).

## Cara ukur

- Skrip: `python3 tests/autolink_measure.py` (sekitar 10 detik). Opsi `--top N` untuk daftar kesalahan, `--json OUT`, `--root DIR` untuk build lain, `--sample OUT` untuk membuat kalimat calon.
- Sampel emas: `tests/autolink_gold.json`. Dua set.
  - `dev`: 300 kalimat, seed 20261109. Dipakai untuk mencari kesalahan.
  - `holdout`: 104 kalimat, seed 777. Dilabeli sesudah perbaikan dipilih. Dipakai untuk melihat apakah perbaikan berlaku umum.
- Sebaran dev: 2024 spell 40, item 40, feat 40, class feature 45. 2014 spell 40, item 40, class feature 55. Kalimat diambil acak dari teks lengkap (`SPELL_FULL`, `DMGI`, `FEAT_FULL`, `CF_FULL`, `CLS14`). Edisi 2014 dipasang lewat `__sp14Set(true)`.
- Label dibuat tangan, kalimat demi kalimat. Aturan label:
  - Harus ada: istilah yang punya entri di app (kondisi, kemampuan, skill, Hit Points, saving throw, Reaction, Advantage, bentuk area, properti senjata, nama spell, item, creature, class, subclass) dan dipakai dalam arti aturan.
  - Tidak diberi label: kata benda umum (spell, creature, damage, weapon, target) dan istilah yang tidak punya entri (Concentration, Dungeon Master, Half Cover sebagai alias belum ada, kecuali dicatat sebagai miss kamus).
  - Huruf kecil dihitung. Tabel memisahkan recall huruf awal besar.
- Presisi = tautan mesin yang cocok dengan label / semua tautan mesin. Recall = label yang cocok / semua label. Tautan mesin di luar label dan di luar daftar `no` dihitung salah dan dilaporkan sebagai "belum ditinjau".
- Batas: kalimat diambil dari data app, bukan dari buku di `books/` (folder itu tidak ada di worktree ini). Keraguan aturan saya putuskan dari konteks kalimat. Mode builder (`mode b`) tidak diukur. Tautan yang dibuat `xlDom` dan tautan eksplisit `[[...]]` tidak diukur.

## Hasil

| Set | Kalimat | Presisi sebelum | Presisi sesudah | Recall sebelum | Recall sesudah |
|---|---|---|---|---|---|
| dev | 300 | 98,9% (186 dari 188) | 100% (235 dari 235) | 69,1% (186 dari 269) | 87,4% (235 dari 269) |
| holdout | 104 | 98,1% (52 dari 53) | 100% (63 dari 63) | 67,5% (52 dari 77) | 81,8% (63 dari 77) |
| gabungan | 404 | 98,8% | 100% | 68,8% | 86,1% |

Recall khusus istilah berhuruf awal besar: 87,8% sebelum, 94,1% sesudah.

Per jenis (dev, sesudah): 2024 class feature R 97,6%, feat R 98,3%, item R 85,3%, spell R 90,2%. 2014 class feature R 93,6%, spell R 64,7%, item R 54,8%. Item 2014 paling rendah karena banyak nama spell dan creature ditulis huruf kecil di teks 2014.

Catatan presisi: sampel hanya punya 188 tautan sebelum perbaikan, jadi selisih 1 sampai 2 tautan besar secara persentase. Untuk melihat lebih luas, mesin dijalankan pada 13.433 kalimat tanpa label (semua teks yang sama). Jumlah tautan 5.813 sebelum dan 7.313 sesudah. Saya memeriksa semua permukaan tautan dan contohnya. Sebelum: sekitar 65 tautan jelas salah (Acid, Celestial, Giant). Sesudah: sekitar 6 (Knight pada kartu Deck of Many Things 2 kali, The Fiend 1, Winter Wolf sebagai bahasa 1, Slaad sebagai tipe 2). Ini perkiraan dari pemeriksaan permukaan, bukan label penuh.

## 20 kesalahan terbanyak (sebelum perbaikan)

Jumlah dari sampel emas (404 kalimat). Kolom "luas" adalah jumlah di 13.433 kalimat bila relevan.

| No | Jenis | Istilah | Jumlah | Sebab | Status |
|---|---|---|---|---|---|
| 1 | Terlewat | saving throw(s) | 29 | Mesin hanya mencocokkan kata berhuruf awal besar. Teks aturan menulis huruf kecil | Diperbaiki (kamus huruf kecil) |
| 2 | Terlewat | attack roll(s) | 10 | Sama dengan 1 | Diperbaiki |
| 3 | Terlewat | Reaction, Reactions | 8 | Kata level 2 (kata umum). Hanya jadi tautan bila diikuti "action" dan sejenisnya | Diperbaiki (Reaction masuk daftar tegas) |
| 4 | Salah | Acid (item) | 2 (luas 30) | Nama item sama dengan jenis damage. "Acid damage" dan daftar jenis damage ikut tertaut | Diperbaiki |
| 5 | Salah | Celestial, Giant (bahasa) | 1 (luas 39) | Nama bahasa sama dengan tipe creature ("Aberration, Celestial, Fey") | Diperbaiki (jadi tautan hanya bila "language" mengikuti) |
| 6 | Terlewat | Cube, Cubes, Sphere, Cone, Emanation, Cylinder | 9 | Kata level 2. Bentuk area tidak punya kata pemicu | Diperbaiki sebagian (ukuran "-foot" di depan). Sisa 3: "the Cube", "Cubes" |
| 7 | Terlewat | Friendly | 3 | Kata level 2 sikap. Tanpa pemicu | Belum. Berisiko, "friendly creatures" bukan sikap |
| 8 | Terlewat | Half Cover, Three-Quarters Cover | 4 | Tidak ada alias di kamus. Entri hanya "Cover" | Belum. Perlu entri baru di data |
| 9 | Terlewat | Finesse, Heavy, Versatile, Two-Handed | 5 | Properti senjata level 2. Tertaut hanya bila "property" mengikuti | Diperbaiki ("Finesse weapon", "Versatile or Two-Handed property"). Sisa 1 |
| 10 | Terlewat | spell attack, ability check(s), damage roll | 6 | Huruf kecil | Diperbaiki sebagian. "damage roll" belum |
| 11 | Terlewat | Speed | 3 | Kata level 2. "your Speed" tanpa pemicu | Belum. Terlalu umum |
| 12 | Terlewat | invisible, restrained, frightened, unconscious, deafened | 7 | Kondisi huruf kecil (teks 2014) | Belum. Kata sifat biasa, risiko salah tinggi |
| 13 | Terlewat | disadvantage, advantage | 3 | Huruf kecil | Belum. Bisa ditambah ke kamus huruf kecil, tapi label kecil di UI ikut berubah |
| 14 | Terlewat | nama spell huruf kecil (raise dead, lightning bolt, fireball, dll) | 9 | Teks 2014 menulis nama spell huruf kecil | Belum. Perlu konteks "spell" agar aman |
| 15 | Terlewat | nama creature huruf kecil (rhinoceros, elephant, rat, shadow) | 4 | Huruf kecil | Belum |
| 16 | Terlewat | darkvision, hit points, bonus action, Hit Point | 4 | Huruf kecil atau bentuk tunggal | Belum. Sengaja tidak dilebarkan ke label pendek |
| 17 | Terlewat | bright light, dim light | 2 | Huruf kecil | Belum |
| 18 | Terlewat | Bless, light, daylight | 3 | Nama spell tanpa kata "spell", "cast" sebelum nama. Aturan aman mesin | Belum. Aturan sengaja |
| 19 | Terlewat | Dexterity | 1 | "Pick Dexterity": "Pick" tidak ada di daftar stopword, dianggap awal nama panjang | Diperbaiki (stopword kata kerja pembuka) |
| 20 | Salah | Knight, The Fiend, Winter Wolf, Slaad | 6 (luas) | Nama kartu, tipe, atau bahasa yang sama dengan entri | Belum. Jarang |

## Perbaikan di `src/app/13-ui-detail-cards.js`

Semua kecil. Tidak ada key localStorage yang berubah. Tidak ada `confirm()` atau `alert()`.

1. `XL_STOP`: tambah kata kerja pembuka kalimat (Pick, Add, Take, Make, Use, Using, Rolling, Gain, Spend, Expend, Select, Learn, Swap, Replace, Treat, Apply, Regain, Picks).
2. `XL_FIRM`: tambah Reaction.
3. Bahasa Celestial dan Giant jadi level 2 dengan pemicu " language".
4. Bentuk area (Cone, Cube, Sphere, Cylinder, Emanation, Line) jadi tautan bila didahului ukuran "N-foot" (`xlTrig2`).
5. Properti senjata (Finesse, Heavy, Light, Thrown, Versatile, Reach, Two-Handed) jadi tautan bila diikuti " weapon" atau "or X property".
6. Item Acid tidak tertaut bila diikuti " damage" atau berada di daftar jenis damage (`xlDmgList`).
7. Kamus huruf kecil `XL_LC` untuk 11 frasa: saving throw(s), death saving throw(s), attack roll(s), ability check(s), spell attack, opportunity attack(s). Dipakai fungsi `xlScanLc`. Sengaja tidak memasukkan frasa label pendek (long rest, short rest, hit points, bonus action) agar label use-box tidak melebar. Label use-box tidak disentuh.

Dampak di 13.433 kalimat: tautan naik 5.813 ke 7.313. Tambahan terbesar: saving throw 768, attack roll 150, spell attack 116, attack rolls 110, saving throws 106, Reaction 82, Emanation 44, Cube 32. Semua tambahan yang saya periksa benar. Tautan hilang: Acid 26, Celestial 24, Giant 15. Semuanya memang salah.

Catatan untuk UI: kalimat seperti "Dexterity saving throw" sekarang punya dua tombol bersebelahan. Ini lebih padat tapi sesuai D&D Beyond.

Catatan teknis: `xlDom` melewati teks tanpa huruf besar (`/[A-Z]/` di `acceptNode`). Frasa huruf kecil hanya tertaut di node teks yang punya minimal satu huruf besar. Pada kalimat utuh ini hampir selalu terjadi.

## Bukti tes

| Tes | Hasil |
|---|---|
| `python3 build.py` lalu `--check` | index.html dan sw.js sama, lint 0 gagal |
| `python3 tests/guard_all.py --enforce` | exit 0. Sempat 1 pelanggaran baru (`xlScan` 21 cabang), diperbaiki dengan memindah cabang ke `xlScanLc` |
| `python3 tests/scenarios.py` | 24 cek, 0 gagal (390x844 dan 1250x850) |
| `python3 tests/autolink_measure.py` | dev P 100% R 87,4%, holdout P 100% R 81,8% |
| `python3 tests/solid_ui_snapshot.py` sebelum dan sesudah | 280 langkah, 0 error halaman. Hash DOM beda di 94 langkah (wajar, ada tautan tambahan). Tidak ada langkah dengan localStorage yang beda. Saya tidak menelaah isi tiap selisih DOM satu per satu |

## Sisa pekerjaan yang disarankan

- Entri kamus "Half Cover" dan "Three-Quarters Cover" (alias ke Cover). Perlu perubahan data, bagian Data.
- Kamus huruf kecil untuk kondisi di teks 2014 hanya pada edisi 2014 dan hanya sesudah kata "is", "become", "has the". Perlu uji lebih luas.
- Nama spell huruf kecil di teks item 2014 bila didahului "cast" atau diikuti "spell".
- Pilihan: memperluas sampel emas ke teks builder (mode b) dan teks Library.
