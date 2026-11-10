# Uncovered 1: kalimat bermekanik tanpa status

Cabang `claude/uncovered-1`, dasar `main` a2ab0bd8. Tidak ada `books/`. Tidak ada klaim cocok ke buku. Level, jumlah, dan jenis damage dicocokkan ke teks fitur di app (`src/data`) dan ke hasil sheet lewat tes. Tidak ada file di `src/` yang berubah. Semua perubahan ada di `tests/` dan `reports/`, jadi sheet, builder, dan data fx tidak bergeser.

## Hasil

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Uncovered | 6129 | 5506 (turun 623) |
| Covered | 7080 | 7423 |
| Info | 23573 | 23853 |
| Uncovered dengan angka | 3681 | 3190 |
| Angka tidak dijelaskan | 3467 | 2979 |
| Kalimat yang berubah jadi uncovered | | 0 |
| Selftest gate | lulus | lulus (40 kasus baru, tiap kode info punya contoh positif dan negatif) |
| Miss zero_miss_measure 2024 dan 2014 | 0 | 0 |
| Uji mutasi data nyata, record dihapus | 170 dari 299 tertangkap | 178 dari 298 tertangkap |
| Uji mutasi kelas stat | 295 dari 300 | 293 dari 300 |

Angka sebelum 6129 diukur ulang di `main`. Brief menyebut 6128 (satu kalimat beda, bukan hasil kerja ini).

### Per kelas kata kunci (kalimat bisa masuk beberapa kelas)

| Kelas | Sebelum | Sesudah |
|---|---|---|
| RESOURCE | 1307 | 901 |
| SPELL | 838 | 829 |
| DMG | 771 | 763 |
| PROF | 562 | 457 |
| SPEED | 506 | 450 |
| ADV | 425 | 425 |
| RES | 408 | 378 |
| CHOICE | 401 | 377 |
| NUM | 324 | 322 |
| IMM | 322 | 315 |
| SLOT | 322 | 320 |
| DC | 282 | 282 |
| ATK | 229 | 227 |
| DIS | 214 | 214 |
| AC | 167 | 167 |
| SENSE | 165 | 156 |
| SAVE | 155 | 150 |
| HP | 86 | 86 |
| ABIL | 75 | 62 |
| INIT | 57 | 56 |

### Per jenis sumber

| Jenis | Uncovered sesudah |
|---|---|
| item | 3060 (dari 3471) |
| sub | 1472 (dari 1593) |
| feat | 565 |
| class | 240 |
| species | 169 |

### Per kelas pekerjaan

| Kelas | Isi | Uncovered turun |
|---|---|---|
| (a) tanpa efek angka, perlu kode alasan info | 7 kode baru dan 2 perluasan | 345 |
| (b) berangka dan sudah dihitung sheet, hanya belum terlihat gerbang | pool charges, rule sheet di kode, fx feat | 278 |
| (c) butuh model baru | tidak ada yang dikerjakan, lihat bagian "Dibiarkan" | 0 |

Tidak ada data fx baru. Dari sampel kelas SPEED, PROF, RES, IMM, AC, SENSE di buku inti 2024 dan PHB 2014, hampir semua kalimat yang tampak hilang ternyata sudah dihitung sheet lewat rule di kode (`registerSheetRule`, `defenses()`), tetapi gerbang hanya membaca record data. Menambah fx untuknya akan menghitung dua kali. Ini diperiksa dengan membangun karakter dengan dan tanpa fitur (lihat tes U1).

## (b) Yang dikerjakan di gerbang

| Perubahan | File | Kalimat turun | Bukti |
|---|---|---|---|
| Pool `ch` `[max, regain, reset]` dipecah jadi atom max dan atom regain. Jumlah yang diulang kalimat lain ("up to 6") menjelaskan angkanya, bukan kelasnya. Atom kedua untuk satu kalimat hanya untuk atom pool dan hanya bila membawa angka yang belum dijelaskan | `tests/clause_gate.py` | 211 | selftest 7d sampai 7g (7g: 8 charges melawan record 10 tetap uncovered) |
| Kode atom untuk fitur yang dihitung di kode: 24 entri, 21 fitur di `tests/clause_gate_code.json`. Tiap entri punya `rx` kalimat, kelas, angka, jangkar teks di source, level baris data, dan nama kasus tes. Jangkar hilang atau level baris data beda: atom dibuang dan gerbang memberi WARNING | `tests/clause_gate.py`, `tests/clause_gate_code.json` | 28 | selftest 11a sampai 11c, `tests/zero_miss_fx.py` kasus U1 (43) dan U2 (8), cek bahwa tiap entri punya kasus |
| `FEATS[n].fx` (senses, res, imm, cimm, skills, langs, exp) dan `armor`, `weapons`, `tools` feat dibaca sebagai record. Sheet membacanya di `09-logic-feats-and-choices.js` dan `12g-logic-sheet-handlers-profs.js` | `tests/clause_gate.py` | 56 | selftest 10r sampai 10t, kasus U2 Skulker, Dungeon Delver, Chef, Martial Weapon Training, Tavern Brawler |
| `STD:ASI` menerima angka 2, 20, 30 selain 1 (garis ASI standar) | `tests/clause_gate.py` | 13 | selftest 10u, 10v (batas 25 tetap uncovered) |

Kode atom (24 entri): Barbarian Fast Movement, Monk Unarmored Movement, Ranger Roving (dua kalimat), Paladin Aura of Protection dan Aura of Courage, Monk Disciplined Survivor (dua kalimat), Rogue Slippery Mind, Bard Jack of All Trades (aturan dan contoh), Valor Martial Training, Gloom Stalker Iron Mind dan Dread Ambusher, Berserker Mindless Rage, Great Old One Thought Shield, Psi Warrior Guarded Mind, Ancients Aura of Warding, War Avatar of Battle, Celestial Radiant Soul, Archfey Beguiling Defenses, Land Nature's Ward (dua kalimat), Fiend Fiendish Resilience, feat Tavern Brawler.

Tes U1 (selisih): untuk Fast Movement, Unarmored Movement, dan Roving tes memakai karakter yang sama dengan dan tanpa Heavy armor atau armor, hanya path speed, moves, ac, inv, dan teks fitur yang boleh beda. Untuk fitur yang hanya digerbang level, tes membandingkan level L dengan L-1 (atau subclass lain). Daftar `allow` tes itu lebih longgar (defenses, saveNotes, spells ikut naik level), jadi eksklusivitas path tidak dibuktikan kuat untuk fitur level. Yang dibuktikan: path yang dinyatakan berubah dan tidak ada sebelum levelnya (kasus NEG).

## (a) Kode alasan info baru

Tiap kode ada di `REASONS` dengan alasan, dan selftest memuat contoh positif dan contoh mirip yang tidak boleh tertutup.

| Kode | Arti | Kalimat | Contoh negatif |
|---|---|---|---|
| `ROLL:LAST_CHARGE` | d20 saat charge terakhir, item hancur pada 1. Item harus punya record charges, angka lain selain d20 tidak boleh ada | 136 | tanpa record charges tetap uncovered, d20 yang bukan soal charge terakhir tetap uncovered |
| `STD:PICK_TEXT` | Kalimat fitur yang punya pick expertise, skills, tools, languages di class | 65 | tanpa record pick tetap uncovered, kalimat dengan angka lain (+5) tetap uncovered |
| `FORM:ACTIVATE` (diperluas) | "expend 1 of its charges", "(Charge Cost 3)" | 60 | bonus AC dengan biaya charge tetap uncovered |
| `MOVE:SPEED_REF` | "move up to half your Speed" | 35 | "Speed increases by 10 feet" dan "gain a Fly Speed equal to your Speed" tetap uncovered |
| `TARGET:SPEED` | "that creature's Speed becomes 0" | 16 | "your Speed drops to 0" tetap uncovered, kalimat yang juga menaikkan Speed sendiri ("yours rises") tidak dipakai kode ini |
| `FOCUS:SPELLCASTING` | senjata atau alat sebagai Spellcasting Focus | 10 | kalimat yang juga memberi proficiency atau cast tanpa slot tetap uncovered |
| `KNOW:TARGET_DEFENSES` | "you learn whether it has Resistances" | 7 | "You have Resistance to Fire" tetap uncovered |

Kalimat yang lolos ke kode lama (`ACTIVE:TRIGGER` 8, `ACTIVE:OTHERS` 3) hanya karena angka pool kini dijelaskan, sehingga aturan lama bisa dibaca. Pasangan ini bukan kode baru. Sebagian bacaan lama itu longgar (Gamma Fragment "Their charges form one pool" dibaca ACTIVE:OTHERS). Tidak diubah.

Pemeriksaan sampel: tiap kode baru dilihat seluruhnya (di bawah 50 kalimat) atau 45 sampel acak (`ROLL:LAST_CHARGE`, `MOVE:SPEED_REF`). Tidak ada yang salah kecuali satu: Splitter ("target's Speed drops ... and yours rises") masuk `TARGET:SPEED`. Diperbaiki dengan menolak kata "yours". Kalimat itu kini jatuh ke `ACTIVE:OTHERS` lama.

## Dibiarkan sengaja

| Kalimat | Alasan |
|---|---|
| Iron Mind #2 (cabang Intelligence atau Charisma) | Tidak ada tes. Perlu multiclass dengan save Wisdom |
| Radiant Soul #3, Combat Superiority DC, Poisoner DC, Telekinetic DC, Boon of Energy Resistance #8 | Sheet menghitung sebagian (Radiant Soul menambah baris `db` di spell), tapi gerbang tidak mengaitkannya. Perlu entri kode atom dengan tes, belum sempat |
| Aura of Courage, Aura of Protection, Aura of Warding, bagian sekutu | Sheet melacak diri sendiri. Lihat `rules-notes.md` |

## Belum dikerjakan (sisa 5506)

Sisa tidak dianalisis kalimat per kalimat. Dari sampel acak sesi ini:

| Kelompok | Perkiraan | Catatan |
|---|---|---|
| item DMG 2024 (3060 kalimat) | sebagian besar | rider damage, bonus +N tahap Exalted dan Awakened, mode Fly atau Burrow dari item. Perlu cek per item apakah `GX.item` dan `atkBonus` sudah menghitungnya |
| fitur yang dihitung kode tapi belum terdaftar di `clause_gate_code.json` | puluhan | contoh: Draconic Resilience 2014 (AC 13 + Dex, HP), Medium Armor Master, Observant, Heavy Armor Master, Tough, Alert, Eyes of Night (darkvision 300) sudah terbukti di sheet lewat probe, tinggal entri dan tes |
| sub third party (tvss, tsdm, tkdm, tsgs, tghp) | ratusan | belum dibuka |

## Tes yang dijalankan

| Tes | Hasil |
|---|---|
| `tests/clause_gate.py --selftest` | lulus |
| `tests/clause_gate.py` (tulis baseline) | uncovered 6129 ke 5506, baseline turun |
| `tests/zero_miss_fx.py` | 258 kasus, 0 gagal (51 baru) |
| `tests/zero_miss_measure.py` | miss 0 (2024 dan 2014), 0 baru |
| `tools/tsc_gate.py` | SCORE 200, tidak memburuk |
| `tools/html_gate.py` | SCORE 250, sama dengan baseline |
| `tests/fx_overlap.py` | OK, 132 overlap terdokumentasi, tidak ada fx baru |
| `tests/guard_all.py --enforce` | exit 0 |

## Tes yang dilewati

`solid_snapshot`, `solid_builder_diff`, `solid_contract`, `golden_builds` dilewati. Alasan: tidak ada file di `src/` dan data fx yang berubah, jadi tidak ada area yang berubah. `build.py` tidak dijalankan ulang untuk hasil akhir karena `index.html` tidak berubah. `fx_overlap_allow.json` tidak berubah karena tidak ada entri fx baru.

## Sesi berikutnya

1. Perluas `clause_gate_code.json` untuk fitur yang sudah terbukti dihitung kode (daftar di atas), satu tes selisih per entri.
2. Buka item DMG 2024 per pola: bonus +N tahap Exalted, rider `atkDice`, mode gerak dari item. Di sini ada kandidat data fx yang benar-benar kurang.
3. Putuskan tafsir yang tertera "belum diputuskan" di `rules-notes.md`.
