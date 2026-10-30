# Rencana kerja third party

Tanggal: 2026-10-30. Status: berjalan (P0 selesai, P1 sebagian). Salinan di Project: claude/rencana-kerja-third-party.md.

## Aturan tetap user (2026-10-30 15.24 WIB)
Saat memasukkan resource book, builder dan sheet harus terintegrasi tanpa terkecuali. Jangan hanya teks. Tiap entri harus bekerja di builder (pilihan, prasyarat, hasil) dan di sheet (angka, proficiency, pertahanan, spell, pemakaian, aksi). Yang belum bisa dikerjakan mesin dicatat di `reports/tp-gap.md` lalu mesinnya ditambah.

Cek integrasi per jenis entri (dites di `tests/tp_sources.py`):
| Jenis | Builder | Sheet |
|---|---|---|
| Subclass | muncul di daftar bila buku aktif, fitur per level, pilihan (bahasa, skill, spell) | fitur, pemakaian terhitung (lu), aksi (acts), spell otomatis (auto), proficiency, resistensi, imunitas, indra, AC, HP |
| Background | skill, tool, bahasa, feat asal, skor | semua masuk sheet, fitur background |
| Feat | prasyarat, +1 skor, pilihan | efek, pemakaian, aksi |
| Spell | daftar class, level, komponen | muncul di spellbook, DC, damage |
| Item | toko dan inventori, harga | bonus AC, serangan, attunement, pemakaian |
| Species, class | pilihan lengkap | sifat, tabel level, slot |

## Keputusan user
- Batas "hanya WotC" dicabut. Buku third party ikut dimasukkan.
- Third party tidak butuh art.

## Sumber data
- Repo TheGiddyLimit/homebrew, clone di /home/claude/thegiddylimit/homebrew (HB_DIR). 284 koleksi, 169 penerbit. Daftar: claude/daftar-third-party.txt.
- Hasil konversi komunitas. Teks sumbernya rusak di beberapa tempat ("Advantage and Disadvantage", "a resting"), dicatat di GAP.

## Alat
`python3 tools/tp_build.py` membuat `src/data/tp*.js` dari sumber plus teks tulisan sendiri di `tools/tp/overlay/`. `--check` gagal bila hasil beda.

## Aturan
1. Semua sumber third party mati secara default, grup "Third Party Books" di Sources, tidak ikut tombol All.
2. Gating seperti wxGate. Karakter yang memakai satu entri memaksa sumbernya aktif.
3. Audit data baru pada rilis yang sama.
4. Efek masuk sheet otomatis (lihat aturan tetap di atas).
5. Teks bahasa Inggris, kata sendiri, kredit penerbit.
6. Tanpa art, cek 390 x 844.
7. Tes tiga skenario di dua ukuran, suite penuh sebelum rilis.
8. Buku edisi 2014 berjalan di jalur yang ada (legacy), label "(2014 rules)".

## Tahap
| Tahap | Isi | Status |
|---|---|---|
| P0 | tp_build.py, grup Sources, kredit, blok defer tp1, tes | Selesai |
| P1 TDCSR | 9 subclass (jadi), 5 background + 2 varian (jadi), 7 feat (jadi, tes menyusul), 2 spell, 91 item, 9 variant rule, monster 50, deity 30 | Berjalan |
| P2 TalDorei Campaign Guide | 4 subclass, 6 background, 1 race, 9 feat, 26 item, 7 variant rule | Belum |
| P3 Valda 2024 class yang ada | 181 spell, 9 feat, 2 species, 129 item, 182 optional feature, 45 monster, subclass 12 class | Belum |
| P4 Valda 2024 11 class baru | mesin class baru | Belum |
| P5 buku berikutnya | Exploring Eberron 2024, Grim Hollow 2024, dan lain-lain | Belum |

## Risiko
- Valda membawa 11 class baru (P4). Grim Hollow dan Iron Kingdoms membawa sistem aturan sendiri.
- Tag homebrew yang belum dikenal dicatat, tidak dilewati diam-diam.
- Lisensi: konten pihak ketiga dipakai atas keputusan user, kredit penerbit tampil.

## Status 2026-10-30 (P1 TDCSR selesai)
- Data: 9 subclass, 5 background, 7 feat, 2 spell, 75 baris item magis, 15 gear. Semua kata sendiri, mekanik ke builder dan sheet.
- Mesin: penalti skor kemampuan (fx.abil negatif), Wraps of Dyamak pada Unarmed Strike, jangkauan 20 ft, catatan xd (extra damage) di baris senjata, hook tes __bldHasSpell dan __bldFeats.
- Tes: tests/tp_items.py (21 item + spell + penalti), tp_sources 153, tp_ui 9, golden_rules, fuzz, csp_check, scenarios 24. Semua lolos.
- Belum: monster, dewa, variant rule, reward (hanya referensi, daftar di tp-gap.md). Pengganda engine (rider damage nyata, efek bersyarat) tercatat di tp-gap.md.
- Berikutnya: P2 TalDorei Campaign Guide (cek tumpang tindih dengan TDCSR dulu).

## Status 2026-10-30 (P2 TalDorei Campaign Guide selesai)
- Dibangun: 3 background (Lyceum Student, Myriad Operative, Recovered Cultist), 5 feat (Dual-focused, Gambler, Mending Affinity, Rapid Drinker, Fate-Touched), spesies Dragonborn (Ravenite), gear Wind glider.
- Fate-Touched dibangun sebagai feat karena menumpuk di atas background lain. Luck point-nya terlacak (mesin baru: LU_X src "bg").
- 4 subclass dan 25 item adalah versi lama dari entri Reborn bernama sama. Tidak dibangun dua kali (lihat tp-gap.md).
- Tes: tp_items (feat dua buku, Ravenite, Fate-Touched), tp_sources 177, tp_ui 9, golden_rules, fuzz, csp_check, scenarios 24. Semua lolos.
- Berikutnya: P3 Valda's Spire of Secrets (2024) untuk kelas yang sudah ada.
