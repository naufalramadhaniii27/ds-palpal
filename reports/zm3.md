# Zero miss 3: pengukur sheet dan kelas ADV, RES, SPELL

Cabang `claude/zm3`, dasar `claude/integrate-1109`. Tafsir aturan: `reports/rules-notes.md` bagian "Zero miss 3". Permintaan ke bagian lain: `reports/zm3-requests.md`.

## Bagian A: pengukur `tests/zero_miss_measure.py`

Pengukur membaca hasil sheet, bukan kalimat. Cara kerja:

- Daftar fitur dari data aplikasi: 12 kelas, 48 subclass 2024, 10 spesies, 79 feat 2024. Fitur 2014 belum diukur (butuh edisi per build, tidak murah).
- Tiap pemilik dibangun lewat `__bldFuzz` (kelas, subclass, spesies) atau `__bldFillFor` (feat) di level 20, lalu `__bldSheetFor` dengan semua toggle pemilik menyala.
- Sheet dipecah jadi baris bukti (AC, kecepatan, Defenses, saveNotes, skill, proficiency, resource, xdmg, serangan, spell, angka fitur, tabel Situations). Teks buku di `features` tidak dihitung.
- Satu fitur mendapat satu ukuran per kelas mekanik yang disebut teksnya: AC, SPEED, RES, ADV, PROF, RESOURCE, DICE, SPELL, NUM.
- Status: ok (baris terhitung menyebut fitur, atau ada baris baru di level fitur), card (hanya kartu aksi yang menyebut fitur), design (kalimat yang memang tidak bisa dihitung sheet, alasan di baseline), miss (hilang).
- Baseline `tests/zero_miss_baseline.json`: daftar miss dan card hanya boleh turun. Exit 1 bila ada miss baru. Waktu jalan 1 sampai 2 menit.
- Hook uji baru `window.__bldFillFor(b)` di `src/builder/25-logic-hooks-for-the-sheet.js` (mengisi pilihan build di salinan, tidak menyimpan apa pun).

Temuan saat membangun pengukur: tabel Situations (`window.__sit`, 68 baris) sudah memberi Advantage untuk banyak fitur. Pengukur membacanya.

## Hasil pengukur, sebelum dan sesudah

Sebelum = kode pengukur yang sama pada pohon tanpa `fx-Z3.js` dan tanpa edit tag resource. Kolom miss sebelum memuat juga 12 fitur yang kemudian ditandai design.

| Kelas | Terukur | Ok sebelum | Ok sesudah | Card sebelum | Card sesudah | Design | Miss sebelum | Miss sesudah |
|---|---|---|---|---|---|---|---|---|
| ADV | 51 | 29 | 48 | 3 | 0 | 3 | 19 | 0 |
| RES | 31 | 22 | 28 | 0 | 0 | 3 | 9 | 0 |
| SPELL | 146 | 131 | 140 | 1 | 0 | 6 | 14 | 0 |
| AC | 10 | 4 | 4 | 1 | 1 | 0 | 5 | 5 |
| SPEED | 22 | 19 | 19 | 0 | 0 | 0 | 3 | 3 |
| PROF | 40 | 29 | 29 | 1 | 1 | 0 | 10 | 10 |
| RESOURCE | 89 | 88 | 88 | 0 | 0 | 0 | 1 | 1 |
| DICE | 66 | 43 | 44 | 4 | 4 | 0 | 19 | 18 |
| NUM | 10 | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| Semua | 465 | 375 | 410 | 10 | 6 | 12 | 80 | 37 |

DICE naik satu (selisih dari baris angka fitur yang baru). Catatan: pengukur memakai kata dari teks fitur, jadi sebagian miss di kelas lain adalah salah baca (misalnya "proficiency" di Wild Shape, Weapon Mastery).

## Bagian B: isi celah ADV, RES, SPELL

Data baru `src/data/fx-Z3.js` (file baru, di manifest sesudah `fx-Z2.js`). Isi: 28 entri kelas, subclass, dan feat dengan toggle atau Note, ditambah 6 tag resource di `LU_X` (`src/data/db4/02-limited-uses-damage-rows-save-notes.js`) yang kini menyebut pemulihan lewat slot.

Perubahan engine (kecil, tak terhindarkan):

- Field entri baru `ed:"2024"` dan handler gerbang `gate-edition` di `src/builder/10b-logic-fx-handlers-entry.js`. Build 2014 membuang entri itu, termasuk baris toggle. Alasan: nama fitur sama di tabel kelas 2014 (Countercharm, Innate Sorcery, Steady Aim) dan toggle tidak tersaring oleh `cond`.
- Skema `ed:"string"` di `10e-logic-fx-schema.js`.
- Konteks entri membawa `rs` (edisi build) di `11-logic-derivation.js`.

Sengaja tidak diisi (design, alasan di baseline dan di rules-notes): Stunning Strike, Restore Balance, Wild Magic Surge (dua kelas), Elemental Adept, Poisoner, Oceanic Gift, Divine Order, Primal Order, Improved Blessed Strikes (ada di `fx-L1.js` di balik pilihan, diuji), Ranger Fighting Style, Ritual Adept.

Kasus tes baru di `tests/zero_miss_fx.py`: 53 (satu per kalimat, ditambah 6 kasus negatif: level di bawah syarat dan edisi 2014). Total file 118 kasus, 0 gagal.

## Fitur hilang yang tersisa (37, di luar kelas ADV, RES, SPELL)

| Kelas | Jumlah | Fitur |
|---|---|---|
| PROF | 10 | Wild Shape, Weapon Mastery (Paladin, Ranger, Rogue), Reliable Talent, feat Alert, Keen Mind, Martial Weapon Training, Observant, Weapon Master. Hampir semua salah baca kata proficiency di gate teks, perlu dicek satu per satu |
| DICE | 18 | Improved Brutal Strike, Improved Elemental Fury, Paladin's Smite, Foe Slayer, Tireless, Boon of Fate, Chef, Interception, Cosmic Omen, Star Map, Inspiring Smite, Fey Wanderer Spells, Clockwork Spells, Bend Luck, Wild Magic Surge, Steps of the Fey, Dark One's Own Luck, Overchannel |
| AC | 5 | Medium Armor Master, Dazzling Footwork, Combat Inspiration, Glorious Defense, Wild Magic Surge |
| SPEED | 3 | Wild Shape, Grappler, Aspect of the Wilds |
| RESOURCE | 1 | Pact Magic |

Kartu saja (6): Boon of Energy Resistance, Charger, Poisoner, Polearm Master (dadu), Defensive Duelist (AC), Psionic Power (PROF).

Daftar lengkap: `python3 tests/zero_miss_measure.py --list`.

## Bukti tes

| Tes | Hasil |
|---|---|
| zero_miss_measure | 0 miss baru terhadap baseline, 0 page error |
| zero_miss_fx | 118 kasus, 0 gagal |
| fx_engine | OK, 265 cek |
| solid_contract | OK, 4810 cek (sempat gagal dua cek karena handler mengimpor storage, diperbaiki dengan konteks `rs`) |
| guard_all --enforce | exit 0, 0 pelanggaran baru |
| scenarios | 24 cek lulus (tiga skenario, dua viewport) |
| golden_builds | OK, 1479 cek |
| solid_builder_diff --base | 3890 input, IDENTIK dengan dasar |
| solid_snapshot | 2997 build, 253 berubah dari dasar, lihat di bawah |

### Build yang berubah (253 dari 2997)

Semua perubahan datang dari pemilik yang mendapat entri baru, tidak ada yang lain.

| Kelompok | Jumlah kira-kira | Penyebab |
|---|---|---|
| Sorcerer semua level dan subclass | banyak | Toggle Innate Sorcery, Clockwork Trance of Order, Wild Magic Tides of Chaos |
| Rogue level 3 ke atas | banyak | Steady Aim, Elusive 18 |
| Bard level 7 ke atas | banyak | Countercharm |
| Monk level 20 | beberapa | Superior Defense, Shadow Step, Elemental Epitome |
| Warlock level 20 | banyak | Eldritch Master, Hurl Through Hell, Beguiling Defenses, Clairvoyant |
| Paladin Glory, Vengeance, Devotion, Ancients | 8 | Peerless Athlete, Vow, Living Legend, Avenging Angel, Elder Champion (toggle dan tag resource) |
| Barbarian Wild Heart dan Zealot, Cleric Trickery, Druid Moon dan Stars, Fighter Champion, Ranger Hunter | 14 | toggle atau Note baru |
| 40 build golden | 40 | semuanya berisi Sorcerer, Rogue, Bard, Paladin Glory, Wild Heart, atau Zealot. Nilai emas tidak berubah (golden_builds OK) |

Nama subclass bergaya 2014 di build invariants (misalnya `Thief (2014)`) ikut berubah karena build itu memakai tabel kelas 2024. Build 2014 sungguhan tidak berubah (diuji lewat kasus negatif ed 2024).

## Tidak dikerjakan

- Pengukur untuk fitur 2014 dan pihak ketiga.
- Baris Situations baru (file milik UI).
- Hasil tampilan di 390 px dan 1250 px dicek lewat `scenarios` (tiga skenario), tetapi daftar toggle yang makin panjang belum dilihat dengan mata. Lihat permintaan 4 dan 6.
