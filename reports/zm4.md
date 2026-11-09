# Zero miss 4: triase 37 fitur hilang dan pengukur edisi 2014

Cabang `claude/zm4`, dasar `claude/all-1109`. Tafsir aturan: `reports/rules-notes.md` bagian "Zero miss 4". Permintaan ke bagian lain: `reports/zm4-requests.md`.

## Hasil singkat

- Fitur hilang 2024: 37 menjadi 0. Fitur hilang 2014: 81 pada ukuran pertama menjadi 0. Dua edisi nol miss.
- Dari 37: 18 salah baca atau efek sudah ada di balik pilihan dan gear (pengukur diperbaiki dengan aturan klasifikasi dan varian build), 15 benar hilang dan diisi, 4 design (Wild Shape PROF dan SPEED, Wild Magic Surge AC dan DICE).
- Pengukur baru memuat kelas MASTERY dan D20, jadi angka "terukur" 2024 berubah dari 465 ke 454.

## Angka pengukur, 2024

Sebelum = baseline zm3. Sesudah = pengukur zm4 pada kode zm4. Kolom miss adalah yang penting.

| Kelas | Terukur sebelum | Miss sebelum | Terukur sesudah | Ok | Card | Design | Miss sesudah |
|---|---|---|---|---|---|---|---|
| AC | 10 | 5 | 10 | 8 | 1 | 1 | 0 |
| SPEED | 22 | 3 | 22 | 21 | 0 | 1 | 0 |
| RES | 31 | 0 | 30 | 28 | 0 | 2 | 0 |
| ADV | 51 | 0 | 51 | 48 | 0 | 3 | 0 |
| PROF | 40 | 10 | 33 | 32 | 0 | 1 | 0 |
| RESOURCE | 89 | 1 | 89 | 89 | 0 | 0 | 0 |
| DICE | 66 | 18 | 63 | 58 | 4 | 1 | 0 |
| SPELL | 146 | 0 | 139 | 133 | 0 | 6 | 0 |
| NUM | 10 | 0 | 10 | 10 | 0 | 0 | 0 |
| MASTERY (baru) | - | - | 4 | 4 | 0 | 0 | 0 |
| D20 (baru) | - | - | 3 | 3 | 0 | 0 | 0 |
| Semua | 465 | 37 | 454 | 434 | 5 | 15 | 0 |

Per pemilik 2024: kelas 131 (123 ok, 8 design), subclass 238 (232 ok, 6 design), spesies 28 (28 ok), feat 57 (51 ok, 5 card, 1 design).

Unit yang keluar dari semesta karena aturan baca baru (bukan diperbaiki): PROF 7 (syarat "proficient with" dan Initiative Proficiency), DICE 3 (tabel tampilan), SPELL 7 dan RES 1 (rujukan seperti "against your spell save DC", "such as ... spell", "overcoming Resistance"). Semua yang keluar tadinya ok atau salah baca, tidak ada miss yang disembunyikan.

## Angka pengukur, 2014 (baru)

Semesta 2014: 12 kelas PHB 2014, 40 subclass PHB dan DMG 2014, 15 spesies PHB, 38 feat PHB 2014. Teks fitur dibaca dari sheet build 2014.

| Kelas | Terukur | Miss pertama | Ok akhir | Card | Design | Miss akhir |
|---|---|---|---|---|---|---|
| AC | 14 | 6 | 12 | 1 | 1 | 0 |
| SPEED | 10 | 2 | 9 | 0 | 1 | 0 |
| RES | 19 | 4 | 18 | 0 | 1 | 0 |
| ADV | 46 | 17 | 45 | 0 | 1 | 0 |
| PROF | 40 | 4 | 37 | 0 | 3 | 0 |
| RESOURCE | 44 | 0 | 44 | 0 | 0 | 0 |
| DICE | 36 | 13 | 33 | 0 | 3 | 0 |
| SPELL | 78 | 6 | 76 | 0 | 2 | 0 |
| NUM | 9 | 5 | 7 | 0 | 2 | 0 |
| D20 | 2 | 0 | 2 | 0 | 0 | 0 |
| Semua | 298 | 57 | 283 | 1 | 14 | 0 |

Ukuran pertama 2014 (sebelum aturan baca): 327 terukur, 81 miss. Setelah aturan baca yang sama dengan 2024 dan sub-fitur level 1 dibandingkan dengan build tanpa subclass: 298 terukur, 57 miss. Kolom "Miss pertama" memakai angka 57 itu. Dari 57: 43 diisi di `fx-Z4.js` atau diperbaiki di pengukur, 14 design.

Per pemilik 2014: kelas 78 (74 ok, 4 design), subclass 155 (144 ok, 1 card, 10 design), spesies 38 (38 ok), feat 27 (27 ok).

## Perubahan

| Berkas | Isi |
|---|---|
| `tests/zero_miss_measure.py` | Edisi 2014, kelas MASTERY dan D20, aturan baca, varian build (pilihan, gear, build lain), pilihan feat terisi, alias baris, uji di tiap level fitur |
| `tests/zero_miss_baseline.json` | Kunci `measured14`, miss 0, entri design baru (2024 empat, 2014 empat belas) dengan alasan |
| `src/data/fx-Z4.js` (baru, di manifest sesudah fx-Z3) | Entri 2024 dan 2014 (Note, toggle, `when` pada pilihan) |
| `src/data/db4/02-limited-uses-damage-rows-save-notes.js` | 7 tag baris resource memuat dadu atau bonus |
| `src/builder/10b-logic-fx-handlers-entry.js` | Engine, satu baris: `gate-edition` juga membuang entri `ed:"2014"` pada build 2024 |
| `tests/zero_miss_fx.py` | 81 kasus baru (satu per kalimat, ditambah kasus negatif edisi dan level) |
| `tests/fx_overlap_allow.json` | 20 lapisan sah baru, alasan per entri |

Lapisan fx_overlap: diperiksa satu per satu. Satu hitung ganda ditemukan dan dibuang (Steel Will Hunter 2014 sudah ada di `fx-L12.js`). Sisanya fitur berbeda dalam subclass yang sama, atau Countercharm dan Superior Defense yang dipisah gerbang edisi.

## Bukti tes

| Tes | Hasil |
|---|---|
| zero_miss_measure | 0 miss, 0 miss baru, 0 page error, dua edisi |
| zero_miss_fx | 199 kasus, 0 gagal |
| fx_engine | OK, 265 cek |
| fx_overlap | OK, 132 lapisan terdokumentasi |
| solid_contract | OK, 4810 cek |
| golden_builds | OK, 1479 cek |
| solid_builder_diff --base | 3890 input, IDENTIK dengan dasar |
| solid_snapshot | 2997 build, 157 berubah dari dasar, daftar di bawah |
| tsc_gate, html_gate, guard_all --enforce | lulus (lihat catatan akhir di balasan) |

### Build yang berubah (157 dari 2997)

Semua pemilik fitur baru, tidak ada yang lain.

| Kelompok | Jumlah | Penyebab |
|---|---|---|
| Invariant Paladin semua level 2 ke atas dan semua subclass | sekitar 60 | Paladin's Smite (2024) dan Divine Smite (2014), serta Note subclass |
| Invariant Ranger level 10 ke atas, semua subclass | sekitar 25 | Tireless, Foe Slayer, Hunter 2014 |
| Invariant Rogue level 7 ke atas, semua subclass | sekitar 20 | Reliable Talent (dua edisi), Assassinate |
| Valor, Knowledge, Life, Nature, Trickery 2014, Moon 2014, Stars, Way of Shadow, Totem Warrior, Draconic, Wild Magic, Archfey, Fiend, Great Old One, Abjuration, Evoker | sekitar 25 | Note, toggle, atau tag baris baru |
| Golden dengan Paladin, Rogue, Ranger, Evoker, Nature Domain, multiclass Fighter dengan kelas itu | 24 | nilai emas tidak berubah (golden_builds OK) |

Catatan: `Nature Domain` adalah satu kunci untuk 2014 dan 2024 (Xanathar), jadi Dampen Elements ikut tampil di build 2024-nya. Teks efeknya sama.

## Tes yang sengaja dilewati

| Tes | Alasan |
|---|---|
| scenarios, solid_ui_contract, overlap_scan, tidy | Tidak ada perubahan UI atau tampilan. Perubahan hanya data fx, satu baris handler engine, pengukur, dan tes |
| Pengukuran ulang tiap iterasi selain zero_miss_measure dan zero_miss_fx | Aturan tes yang diperketat |

## Belum dikerjakan

- Kartu aksi (card) tersisa 6, lihat permintaan 5.
- Magical Secrets baris kedua (2014) ditandai design tanpa cek ke buku. Dread Lord (Oathbreaker) memakai angka dari teks data yang terpotong.
- Tafsir belum dicocokkan ke halaman buku karena folder `books/` tidak ada. Penandanya ada di rules-notes.
