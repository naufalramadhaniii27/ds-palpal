# Riset logic komunitas dan penilaian logic aplikasi (2026-10-31)

## Yang diperiksa
Proyek open source yang membuka isi mesinnya: Borealis (Rust), electro-saiyan/dnd-character-builder-2024 (vanilla JS), furlat/dnd_engine (Python), KirkDiggler/rpg-toolkit (Go), Foundry VTT dnd5e 5.0 dan modul adv-reminder, automated-conditions-5e, serta skema homebrew 5etools. Hanya halaman yang bisa dibuka yang dipakai. Dokumen arsitektur dalam Foundry dnd5e tidak bisa dibuka, jadi bagian itu tidak dinilai.

## Pola yang dipakai komunitas
| Pola | Dipakai oleh | Isi |
|---|---|---|
| Simpan pilihan, hitung sisanya | dnd-character-builder-2024, Borealis | Nilai sheet tidak disimpan. `derive(character, registry)` menghitung ulang dari pilihan |
| Efek deklaratif di data | dnd-character-builder-2024 | Fitur memuat objek efek (`acFormula`, `bonus`, `choose`, `resource`, `spell`), satu mesin generik menerapkannya |
| Registry per id, konten pengguna menimpa bawaan | dnd-character-builder-2024 | Entri custom menyimpan nilai form mentah agar bisa diedit lagi |
| Validasi per langkah: error memblokir, warning tidak | dnd-character-builder-2024 | Opsi tidak sah tidak pernah ditawarkan |
| Profil ruleset per edisi | Borealis | 2014 dan 2024 dipilih per karakter, konten difilter per edisi, skema JSON divalidasi |
| Modifier berkanal dan bersumber | dnd_engine | Nilai punya kanal modifier (angka, advantage, resistance), efek bersyarat berupa fungsi yang menjawab saat dihitung |
| Event bus untuk efek berdurasi | dnd_engine, rpg-toolkit | Kondisi mendaftarkan handler, dilepas saat kondisi berakhir. Berguna untuk combat, bukan untuk sheet statis |
| Advantage dan disadvantage dari banyak sumber, tampil alasannya | adv-reminder | Sumber yang berlawanan saling batal, tiap sumber ditampilkan sebagai pesan |
| Efek bersyarat sebagai flag dengan kondisi | automated-conditions-5e | Kondisi dievaluasi terhadap pelaku, target, dan aura |
| Skema JSON resmi dengan validator | 5etools homebrew | `_schema-fast/homebrew.json` dan `test-json.js` |

## Penilaian logic aplikasi
| Aspek | Status | Dasar |
|---|---|---|
| Simpan pilihan, hitung sisanya | Sudah | `derive()` mengubah karakter menjadi angka dan mencatat asal tiap angka. Struk angka dan number map memakai mesin yang sama |
| Validasi dan opsi tidak sah | Sudah | Builder tidak menawarkan opsi yang gagal syarat. Uji acak 1.000 karakter, 0 gagal keras |
| Pengujian | Kuat (perbandingan dikoreksi: saya hanya membaca README proyek lain, Borealis juga punya tes engine, e2e, dan regression gate) | golden_rules 1.001 karakter dengan oracle, fuzz_rules 500, tes sifat meta (relasi level dan bonus), tiga skenario di dua viewport |
| Profil edisi | Sebagian | 2024 penuh, 2014 ditunda |
| Efek deklaratif | Sebagian | Item punya kunci fx (ac, save, res, imm, adv, dan lain-lain). Banyak fitur class masih lewat tabel berkunci nama fitur (LU_X, ACTS, CLS_AUTO, SAVE_NOTES, calcNote, FATK) |
| Efek bersyarat | Lemah | Hanya catatan teks (saveNotes, defenses bertipe Note). Tidak ada evaluasi kondisi |
| Advantage dari banyak sumber | Sebagian (dikoreksi) | Kondisi sudah digabung per jenis roll: Advantage dan Disadvantage saling batal dan sumbernya tampil (`cfFlags`, src/app/34-ui-situations.js). Advantage dari item dan fitur class belum ikut digabung. Untuk save mereka masuk sebagai catatan teks |
| Dua model state | Risiko | Builder (B) dan sheet (C) dikonversi lewat toSheet dan fromSheet. Tes bolak-balik ada, tetapi dua model tetap menambah celah |
| Tabel global yang diubah applyPacks | Risiko kecil (dikoreksi) | `applyPacks` memulihkan tabel dari salinan BASE (sp, bg, ft, subs) sebelum menerapkan sumber, jadi sisa keadaan tidak menumpuk pada tabel itu. Belum ada tes nyala-mati khusus dan tabel di luar BASE belum diperiksa |
| Skema data formal | Belum | Data buku berupa file JS tanpa skema JSON dan validator terpisah |

## Rekomendasi, berurutan menurut manfaat
1. Perluas penggabungan advantage dan disadvantage yang sudah ada untuk kondisi, agar mencakup item dan fitur class, per jenis roll, dengan alasan tiap sumber (pola adv-reminder). Isinya: kumpulkan sumber dari fitur, item, kondisi, lalu hitung hasil bersih dan tampilkan alasannya di breakdown. Cakupan: save, skill, attack, initiative.
2. Efek bersyarat sebagai data: tiap efek memuat `when` (misalnya vs spell, vs poison, saat Raging). Mesin menampilkannya sebagai baris bersyarat, bukan teks bebas. Ini menutup sisa temuan audit item (Save advantage 48, sebagian besar bersyarat).
3. Pindahkan tabel berkunci nama fitur ke efek deklaratif di data fitur, bertahap per class, dengan golden_rules sebagai penjaga. Tujuannya mengurangi salah ketik nama dan mempermudah menambah buku third party.
4. Skema JSON untuk blok data buku dan validator di tools/ (pola 5etools). Hasilnya: kesalahan data tertangkap saat build, bukan saat dipakai.
5. Uji bahwa menyalakan lalu mematikan sumber mengembalikan tabel global seperti semula (tes idempoten applyPacks).
6. Event bus tidak perlu untuk sheet. Pertimbangkan hanya untuk Training Ground bila efek berdurasi bertambah.

## Hitungan nyata (2026-10-31)
Tabel berkunci nama fitur dirujuk di src/builder dan src/app dengan jumlah kemunculan: LU_X 13, ACTS 13, CLS_AUTO 9, SAVE_NOTES 4, FATK 3. Jumlah entri di dalam tiap tabel belum dihitung.

## Batas riset
Penilaian aplikasi memakai ringkasan teknis, dokumen Logic, dan hasil tes di Project, bukan audit kode baris demi baris. Hitungan jumlah fitur yang masih lewat tabel berkunci nama belum dilakukan.

## Sumber
- https://github.com/TeamBorealis/borealis
- https://github.com/electro-saiyan/dnd-character-builder-2024
- https://github.com/furlat/dnd_engine
- https://pkg.go.dev/github.com/KirkDiggler/rpg-toolkit/rulebooks/dnd5e
- https://newreleases.io/project/github/foundryvtt/dnd5e/release/release-5.0.0
- https://gh.hhj520.top/kaelad02/adv-reminder
- https://www.foundryvtt-hub.com/package/automated-conditions-5e
- https://github.com/revilowaldow/5eSchema
