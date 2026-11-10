# Uncovered 2: daftar fitur yang dihitung kode, audit label info, Extra Attack pihak ketiga

Cabang `claude/uncovered-1`, lanjutan dari `reports/uncovered-1.md`. Tidak ada `books/`, jadi tidak ada klaim cocok ke buku. Level, jumlah, dan jenis damage dicocokkan ke teks fitur di app (`src/data`) dan ke hasil sheet lewat tes. Satu file `src/` berubah: `src/data/fx-Z3.js` (16 baris data Extra Attack). `index.html` dan `sw.js` dibangun ulang dengan `python3 build.py`.

## Hasil

| Ukuran | Awal putaran 2 | Akhir |
|---|---|---|
| Uncovered | 5506 | 5460 (turun 46) |
| Covered | 7423 | 7685 |
| Info | 23853 | 23637 |
| Angka tidak dijelaskan | 2979 | 2975 |
| Kalimat yang berubah jadi uncovered | | 0 |
| Miss zero_miss_measure 2024 dan 2014 | 0 | 0 (0 baru) |
| zero_miss_fx | 258 kasus | 341 kasus, 0 gagal |
| Uji mutasi data nyata, kelas stat | 291 dari 300 | 293 dari 300 |

Covered naik 262 dan info turun 216. Selisih terbesar bukan uncovered: kalimat berpindah dari info ke covered ketika sebuah record memang menjelaskannya (182 dari FXO_NULL, 46 dari kode atom, 32 dari SUB_GRANT, selebihnya BY_DESIGN dan Extra Attack).

## Kotak 1: fitur yang dihitung kode

Ada 26 entri kode baru di `tests/clause_gate_code.json` (jadi 50 entri), ditambah satu mekanisme data baru.

| Kelompok | Entri | Kalimat covered | Tes selisih |
|---|---|---|---|
| Feat 2024 dan 2014 | Tough (HP 2 per level), Medium Armor Master (2024: batas Dex 3 bila Dex 16, 2014: batas 3 dan tanpa Disadvantage Stealth), Observant, Keen Mind, Resilient (dua kalimat), Resilient (2014), Tavern Brawler (2014), Unarmed Fighting (d6 dan d8) | 13 | U3: dengan dan tanpa feat, satu kasus NEG tiap pola |
| Initiative | Gloom Stalker (2014) Dread Ambusher, Swashbuckler Rakish Audacity, War Magic Tactical Wit, Chronurgy Temporal Awareness, Watchers Aura of the Sentinel | 5 | level L melawan L-1, NEG di L-1 |
| Defense 2014 | Psi Warrior, Archfey, Land, Great Old One, Fiend | 5 | level 10 melawan 9 |
| Speed | Oath of Glory (2014) Aura of Alacrity | 1 | Speed 40 melawan 30 |
| Battle Master | Combat Superiority: empat dadu d8, lalu satu dadu lagi di level 7 dan 15 | 2 | res max 4, 5, 6 dan dadu d10 (10), d12 (18) |

Mekanisme baru: `SUB_GRANT[sub]` (`armor`, `weapons`, `tools`, `skills` per baris `[level, teks]`, nama fitur di `f`) dibaca sheet di `13` dan `12g`. Gerbang tidak membacanya. Kini baris dengan level yang sama dengan level fitur menjadi atom PROF untuk kalimat polos "You gain proficiency with ...". Kalimat dengan modifier, focus, bahasa, pilihan, atau "if you lack it" tidak ditutup. Hasil: 32 kalimat covered, tes selisih untuk Hexblade (armor dan weapons), Assassin (tools), Way of Mercy (skills dan tools). Selftest 12a sampai 12c, tiap kunci (armor, weapons, tools, skills) tercakup tiga tes ini lewat sheet nyata.

Level dan angka dicek ke teks app, bukan ke data tes: Medium Armor Master 16 dan 3 melawan 2 sama dengan teks fitur dan `med3:16`, Tough 2 per level sama dengan `hp:2` dan teks "twice your character level, and 2 more each level after". Level 2014 (Psi Warrior 10, Archfey 10, Glory 7, Gloom Stalker 3) dibaca dari baris `wotc09-subclasses-2014.js`.

Tidak didaftarkan karena sheet tidak menghitungnya, ada di `reports/requests.md`:

| Fitur | Temuan |
|---|---|
| Iron Mind (2014) | Sheet menulis Note teks 2024 dan tidak memberi save Wisdom. Aturan memeriksa sub tanpa `(2014)` |
| Roving (2014) | Ranger 6 build 2014 mendapat Climb dan Swim. Aturan berlabel "2024 only" |
| Draconic Bloodline (2014) | Kode memberi HP dan AC dari level 1, baris data bertulis level 3 |
| Aura of Warding (2014) | Hanya Note, bukan Resistance |
| Extra Attack kelas resmi | Teks aksi "Make one attack per Extra Attack" tanpa jumlah |

## Kotak 2: audit label info

Sampel acak berstrata (seed tetap) dari 23.853 info, per kode alasan dan jenis sumber, dibaca satu per satu. Info berangka dengan kelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, INIT, ABIL, RES, IMM) diutamakan. Total sampel 418 kalimat dari 27 dari 33 kode. Enam kode lain (`ROLL:LAST_CHARGE`, `MOVE:SPEED_REF`, `TARGET:SPEED`, `FOCUS:SPELLCASTING`, `KNOW:TARGET_DEFENSES`, `POOL:SHARED`) kecil atau sudah diperiksa di putaran 1.

| Kode | Pool | Sampel | Salah: sheet sudah menghitung | Kandidat: model yang ada cukup | Kandidat: perlu model baru | Keterangan |
|---|---|---|---|---|---|---|
| SPELL_TEXT (stat dan angka) | 355 | 30 | 0 | 0 | 3 (10 persen) | Spell buff diri (Hardlight Frame AC 17, Cloak of Vermin +1 AC, Alchemical Form Speed 20). Model buff spell belum ada |
| FXO_NULL (stat dan angka) | 202 | 30, ditambah pemeriksaan seluruh pool dengan kode | 182 kalimat di seluruh pool (kini covered) | 436 kalimat tersisa | 0 | Lihat di bawah |
| ACTIVE:OTHERS (stat dan angka) | 78 | 31 | 0 | 0 | 0 | |
| ACTIVE:TRIGGER | 804 | 38 | 1 (Unarmed Fighting) | 3 (Extra Attack Ranger dan Gadgeteer, Field Medic advOn) | 0 | Sudah diperbaiki: Unarmed Fighting masuk kotak 1, Extra Attack kotak 3 |
| STD:ASI | 208 | 10 | 0 | 0 | 0 | Sheet memang menghitung +1 dan batas 20. Label info benar tetapi bisa covered |
| ITEM:SENSES | 82 | 12 | 0 | 0 | 0 | Sense item berakal |
| OBJECT:STATS | 106 | 10 | 0 | 0 | 0 | |
| COND:PLAY_STATE | 185 | 17 | 0 | 3 (Anticipatory Strike +2 AC, Drunken Technique Speed +10, Kruphix +2 AC) | 0 | Sesuai kebijakan, toggle dengan `acAdd` atau `speedAdd` cukup |
| ACTIVE:REACTION | 56 | 12 | 0 | 0 | 0 | |
| ACTIVE:TIMED_IMM | 43 | 9 | 0 | 0 | 0 | |
| FORM:TABLE (stat) | 37 | 14 | 0 | 0 | 0 | |
| BY_DESIGN (stat) | 17 | 17 | 4 (Ooze Transformation: Blindsight 30, Speed -5) | 0 | 0 | Tag menimpa record. Diperbaiki |
| STD:AC10 | 7 | 7 | 7 (sheet menghitung AC dasar) | 0 | 0 | Label info, tetapi dihitung sheet. Tidak diubah |
| STD:PICK_TEXT | 20 | 12 | 0 | 0 | 0 | |
| FORM:ACTIVATE | 2723 | 14 | 0 | 0 | 0 | |
| FORM:ROLL | 1938 | 15 | 0 | 0 | 0 | |
| ACTIVATE | 1309 | 12 | 0 | 0 | 0 | |
| NUMONLY:ROLL | 1003 | 14 | 1 di sampel (Combat Superiority), 3 kalimat setelah dicari di pool | 0 | 0 | Kotak 1 |
| NUMONLY:TABLE | 871 | 14 | 0 | 0 | 0 | |
| NUMONLY:GEOMETRY | 2232 | 20 | 0 | 0 | 0 | |
| NUMONLY:TEXT | 1348 | 20 | 0 | 4 (Extra Attack Barbarian, Fighter, Monk dan Dancer) | 0 | Kelas resmi menunggu keputusan |
| NUMONLY:FLAVOR, NUMONLY:ZERO | 305, 162 | 11, 10 | 0 | 0 | 0 | |
| COND:ATTACK_ROLL_ADV | 68 | 10 | 0 | 3 (advOn: Precise Hunter, Treacherous Allure, Iron Hero) | 0 | Sesuai kebijakan, bukan salah label |
| TABLE:CLASS, DC:REFERENCE, REST:NONUM | 70, 77, 588 | 9, 10, 10 | 0 | 0 | 0 | |
| ROLL:LAST_CHARGE, MOVE:SPEED_REF, TARGET:SPEED, FOCUS, KNOW | 136, 50, 30, 14, 7 | diperiksa putaran 1 | 0 | 0 | 0 | |

Tingkat salah label, yaitu kalimat berlabel info padahal sheet sudah menghitungnya. Batas atas 95 persen Clopper-Pearson, dihitung dari sampel acak per kelompok:

| Kelompok | Salah per sampel | Batas atas 95 persen |
|---|---|---|
| Kode tanpa kelas stat (12 kode: FORM, ACTIVATE, NUMONLY, TABLE, DC, REST) | 1 dari 159 (Combat Superiority) | 3,5 persen |
| Kode berkelas stat (11 kode: ACTIVE, COND, ITEM, OBJECT, STD:ASI, FORM:TABLE) | 1 dari 175 (Unarmed Fighting) | 3,1 persen |
| SPELL_TEXT stat dan angka | 0 dari 30 | 11,6 persen |
| BY_DESIGN stat | 4 dari 17 | 49,9 persen (pool kecil, 17 kalimat, semuanya dibaca) |
| STD:AC10 | 7 dari 7 dihitung sheet, label info "standar" | seluruh pool dibaca |
| FXO_NULL | 182 dari 1384 kalimat (116 item, dicek lewat kode, bukan sampel) | tidak berupa sampel |

Batas atas hanya berlaku untuk sel yang disampel. Pool NUMONLY:ROLL, FORM:ROLL, dan FORM:ACTIVATE besar (di atas 1000) dan tidak dibaca penuh. Kalimat di luar sampel bisa saja salah label, tingkat nyatanya diperkirakan di bawah batas tadi.

Kandidat bukan salah label: kalimat yang model efek yang ada (toggle dengan `acAdd` atau `speedAdd`, `advOn`, `extraAttack`) bisa menghitung, tetapi kebijakan proyek (COND:PLAY_STATE, COND:ATTACK_ROLL_ADV) menyebutnya sengaja tidak dihitung. Dari sampel: 3 dari 17 di COND:PLAY_STATE, 3 dari 10 di COND:ATTACK_ROLL_ADV, 3 dari 38 di ACTIVE:TRIGGER (dua Extra Attack, satu Field Medic advOn), 4 dari 20 di NUMONLY:TEXT (Extra Attack kelas resmi dan Dancer). Estimasi jumlah di seluruh pool tidak dihitung karena sampelnya kecil.

### Koreksi yang dikerjakan

| Temuan | Perbaikan | Efek |
|---|---|---|
| FXO_NULL menandai seluruh item info walaupun ada entri pengganti (`addI`, GX) yang menghitung efeknya | FXO_NULL menyentuh 116 item (1384 kalimat). Di 108 item ada entri pengganti, 182 kalimatnya kini covered, 436 kalimat berkelas stat yang tak dijelaskan entri tetap info FXO_NULL dan dihitung terpisah di 92 item (`fxo_repl`), 374 tak berkelas stat tetap info. 8 item tanpa pengganti (392 kalimat) tetap FXO_NULL | covered naik, uncovered tetap. Uji mutasi menghitung 436 kalimat itu sebagai terdeteksi |
| `BY_DESIGN` menimpa record yang menjelaskan kalimat | Record menang, tag hanya berlaku tanpa record | 11 kalimat covered (Ooze Transformation dan lain-lain) |
| Gamma Fragment "Their charges form one pool ..." berlabel ACTIVE:OTHERS | Kode baru `POOL:SHARED` | 2 kalimat |
| Flesh of Dendallen "While Bloodied you regain ..." berlabel ACTIVE:TRIGGER | Masuk `COND:PLAY_STATE` | 3 kalimat |
| Wildcard `*` dari penanda FXO_NULL menjelaskan semua angka | Penanda tidak ikut menjelaskan angka | 22 kalimat tidak lagi covered keliru |
| Unarmed Fighting dan Combat Superiority berlabel info padahal dihitung kode | Kotak 1 | 4 kalimat covered |

Tiap perbaikan punya selftest dengan contoh positif dan contoh negatif (12d sampai 12g, 13a sampai 13e).

## Kotak 3: sub pihak ketiga dan item

Satu pola dikerjakan: Extra Attack. Teks "attack twice" ada di 16 kelas dan sub tanpa fx, sheet menulis "Make one attack". `extraAttack:2` (field yang ada, handler `12l`) diisi di `src/data/fx-Z3.js` dengan level dari baris data aplikasi:

| Jenis | Daftar (level) |
|---|---|
| Kelas | Craftsman 5, Dancer 5, Gadgeteer 5, Jaeger 5, Martyr 5, Monster Hunter 11, Vagabond 5, Warden 5 |
| Subclass | Mutagenist 5, College of Valor 6, College of Valor (2014) 6, College of Swords 6, Star-Spangled Banner 6, Black Rider 6, Death Knight 6, Lumimancer 6 |

Hasil sheet: aksi Attack menjadi "Make two attacks (Extra Attack (nama level))" di level baris, satu level sebelumnya "Make one attack". Tes U4: 32 kasus selisih ditambah 2 NEG (Fighter tetap memakai teks "per Extra Attack", Fighter 5 dengan Bard Valor 6 tidak dijumlahkan karena `12l` mengambil nilai terbesar). Kalimat kedua (ganti satu serangan dengan cantrip) tetap uncovered karena belum ada model.

Hitung ganda: `tests/fx_overlap.py` melaporkan 12 nama yang kini didefinisikan di lebih dari satu file. Tiap nama dimasukkan ke `tests/fx_overlap_allow.json` dengan alasan. Hanya `fx-Z3.js` yang mengisi `extraAttack` untuk nama itu (dicek dengan grep).

Berhenti dan dilaporkan, tidak dikerjakan:

| Kelompok | Alasan |
|---|---|
| Item DMG 2024 (3060 kalimat) | Dari sampel kotak 2, kalimat item berangka adalah efek aktif, efek pada target, atau kondisi bermain. Yang bisa diisi dengan model yang ada (misalnya bonus tetap) sudah punya fx dan terlihat covered. Sisa memerlukan toggle per item atau field baru, jadi tidak dibangun tanpa persetujuan |
| Spell buff diri (SPELL_TEXT) | Perlu model toggle spell di sheet. Field baru |
| Dancer Three-, Four-, Five-Target Extra Attack | `extraAttack` tidak punya syarat target. Lihat `rules-notes.md` |
| Extra Attack kelas resmi | Mengubah teks aksi semua karakter resmi. Perlu keputusan |
| Sub pihak ketiga lain (tvss, tsdm, tkdm, tsgs, tghp, sisa sekitar 1400 kalimat) | Dari pembacaan nama dan teks, kebanyakan efek pada target, resource, atau pilihan. Satu pola saja yang cocok dengan model yang ada (Extra Attack). Pola lain (Speed Domain: proficiency Acrobatics dan Insight, Twilight Eyes of Night darkvision 300) perlu dicek apakah sheet menghitungnya sebelum fx ditambah. Tidak sempat dalam sesi ini |

## Tes yang dijalankan

| Tes | Hasil |
|---|---|
| `tests/clause_gate.py --selftest` (via run biasa) | lulus, termasuk 12a sampai 12g dan 13a sampai 13e |
| `tests/clause_gate.py` (tulis baseline) | uncovered 5506 ke 5460, baseline turun |
| `tests/zero_miss_fx.py` | 341 kasus, 0 gagal |
| `tests/zero_miss_measure.py` | miss 0 di 2024 dan 2014, 0 baru dibanding baseline |
| `tools/tsc_gate.py` | SCORE 200, tidak memburuk |
| `tools/html_gate.py` | SCORE 250, sama dengan baseline |
| `tests/fx_overlap.py` | OK, 140 overlap terdokumentasi |
| `tests/guard_all.py --enforce` | exit 0 |
| `tests/solid_contract.py` | OK, 4810 pemeriksaan |
| `tests/golden_builds.py` | OK, 1479 pemeriksaan |

## Tes yang dilewati

`solid_snapshot` dan `solid_builder_diff` dilewati: perubahan `src/` hanya data fx Extra Attack, yang diperiksa oleh tes U4 untuk tiap entri dan oleh `solid_contract` dan `golden_builds` sekali di akhir.
