# Riset pengujian mesin aturan D&D 5e 2024

Tanggal: 2026-10-31. Bahasa: Indonesia.

## 0. Cakupan bukti

- Halaman yang berhasil dibuka: 17. Dua halaman diblokir izin (github.com/bcoe/c8, stryker-mutator.io supported-mutators). Tidak dicoba ulang.
- Aturan: klaim di bawah hanya dari halaman yang dibuka. Sisanya ditandai **tidak terbukti**.
- Angka waktu dan biaya untuk proyek kami adalah perkiraan saya. Semuanya ditandai **perkiraan**.
- Tidak dibuka: dokumentasi mutmut, jqwik, Borealis, 5etools (hanya hasil pencarian). Klaim tentangnya **tidak terbukti**.
- Catatan: README c8 yang dibuka adalah fork (w3nl/c8), bukan repo bcoe/c8.

### Halaman yang dibuka

| # | URL | Dipakai untuk |
|---|-----|---------------|
| 1 | https://stryker-mutator.io/docs/stryker-js/incremental/ | Mode inkremental Stryker |
| 2 | https://playwright.dev/docs/test-snapshots | toHaveScreenshot, threshold, nama baseline |
| 3 | https://github.com/dubzzz/fast-check/blob/68a4c78741d23f068febe8b2816474726133882c/documentation/1-Guides/Tips.md | Seed, path, shrinking fast-check |
| 4 | https://fast-check.dev/llms-full.txt | Replay, model-based, opsi |
| 5 | https://fooqux.com/article/4249 | Model-based testing untuk D&D |
| 6 | https://hypothesis.readthedocs.io/en/latest/tutorial/replaying-failures.html | Replay Hypothesis |
| 7 | https://eprints.whiterose.ac.uk/110335/1/segura16-tse.pdf | Survei metamorphic testing |
| 8 | https://github.com/w3nl/c8/blob/main/README.md | c8 (fork) |
| 9 | https://github.com/schultzcole/FVTT-Quench | Quench untuk Foundry |
| 10 | https://worthe-it.co.za/blog/2018-11-08-property-based-testing.html | Tes properti pada aturan game |
| 11 | https://tyler274.github.io/rummage/formats/commander/game_mechanics/testing_guide.html | Panduan tes mesin game |
| 12 | https://pitest.org/quickstart/basic_concepts | Konsep mutasi PIT |
| 13 | https://pitest.org/quickstart/mutators | Mutator bawaan PIT |
| 14 | https://github.com/foundryvtt/dnd5e | Foundry dnd5e (repo) |
| 15 | https://github.com/jamesplotts/opencombatengine | Mesin tempur C# |
| 16 | https://helpmetest.com/blog/stryker-mutation-testing-javascript/ | Konfigurasi Stryker |
| 17 | https://pypi.org/project/dnd5e-engine/ | dnd5e-engine (Python, SRD 2024) |

## 1. Tabel teknik

Kolom "Cocok" menilai untuk proyek kami: satu file HTML, JS vanilla, tes lewat Playwright dan `window.__D()`.

| Teknik | Apa | Biaya (perkiraan) | Yang ditangkap | Cocok? | Alasan |
|---|---|---|---|---|---|
| Property-based, fast-check | Generator input acak, properti harus berlaku untuk semua. Gagal lalu shrinking ke contoh minimal. (#3, #4) | Rendah. Satu devDependency. Tulis generator sekali. | Kasus tepi yang tidak terpikir. Pelanggaran invarian. | **Ya** | JS murni. Mengganti sebagian fuzz_rules.py yang tidak punya shrinking. |
| Hypothesis, jqwik | Setara fast-check untuk Python dan Java. (#6 untuk Hypothesis) | Sedang. | Sama. | **Tidak** | Mesin kami JS. Harness Python hanya memanggil browser. Jqwik: tidak terbukti. |
| Mutation testing, Stryker | Ubah kode, jalankan tes, hitung mutan yang tewas. (#1, #16) | Sedang. Run pertama lama. | Tes lemah yang lulus walau kode salah. | **Ya, terbatas** | Cocok untuk logic.js. Tes kami berjalan lewat browser, jadi perlu runner Node (lihat bagian 2). |
| mutmut | Mutasi untuk Python. | - | - | **Tidak** | Tidak terbukti. Kode yang diuji adalah JS. |
| PIT | Mutasi bytecode Java. (#12, #13) | - | - | **Tidak** | Java. Berguna hanya sebagai daftar operator mutasi acuan. |
| Differential testing | Bandingkan hasil dengan implementasi lain. (#10, #15, #17) | Sedang sampai tinggi. | Salah baca aturan yang konsisten di oracle dan kode kami. | **Ya, selektif** | Lihat bagian 3. Oracle golden_rules ditulis tim sendiri, jadi bias yang sama mungkin ada. |
| Metamorphic testing | Ubah input dengan cara yang diketahui, cek hubungan output. (#7) | Rendah. | Bug tanpa perlu nilai benar. | **Ya** | Cocok untuk angka turunan. Lihat bagian 4. |
| Snapshot/golden | Simpan hash atau JSON hasil, bandingkan. (#11) | Rendah. | Perubahan tak sengaja. Tidak menilai benar atau salah. | **Sudah ada** | Pertahankan. Tambah aturan: ubah golden hanya dengan alasan tertulis di reports/. |
| Coverage V8, c8 | Pakai coverage bawaan V8, laporan format Istanbul. `--all` menghitung berkas yang tak dimuat sebagai 0%. `--check-coverage` memberi ambang. (#8) | Rendah. | Cabang yang tak pernah dijalankan tes. | **Ya** | Playwright Chromium dapat mengumpulkan coverage JS lewat API-nya (tidak terbukti, tidak dibuka). Jalur Node memakai c8. |
| Shrinking | Perkecil input gagal ke contoh minimal. fast-check melaporkan seed dan path. (#3, #4) | Gratis dengan fast-check. | Mempercepat diagnosis. | **Ya** | fuzz_rules.py hanya menyimpan seed. Karakter acak besar sulit dibaca. |
| Seed replay | Ulang kegagalan dengan seed. fast-check: `seed`, `path`. Hypothesis: database lokal dan `@reproduce_failure`. (#3, #4, #6) | Rendah. | Kegagalan CI yang sulit diulang. | **Ya** | Sudah ada `--seed`. Tambah catat seed ke log setiap run. |
| Kontrol flaky | Rendering dan waktu harus stabil. Playwright menyarankan lingkungan yang sama, mouse di luar elemen, stylesheet untuk menyembunyikan elemen volatil. (#2) | Rendah. | Hasil goyah. | **Ya** | Sumber flaky kami: animasi, font, jam. Kunci jam, matikan animasi, tunggu `__D()` siap. |
| Visual regression, toHaveScreenshot | Bandingkan tangkapan dengan baseline. Bawaan `threshold` 0.2, `maxDiffPixels` tidak diset. Nama baseline memuat browser dan platform. Perbarui dengan `--update-snapshots`. (#2) | Sedang. Baseline per platform. | Layout rusak, teks terpotong. | **Ya, terbatas** | Dua viewport sudah dipakai. Ambil hanya layar stabil. Jalankan di satu mesin yang sama. |
| Tes model/state machine | Perintah acak terhadap model sederhana (`fc.commands`). (#4, #5) | Sedang. | Urutan aksi UI yang merusak data. | **Mungkin** | Berguna untuk alur Apply, level up, undo. Bukan prioritas. |
| Quench (Foundry) | Runner tes di dalam Foundry. (#9) | - | - | **Tidak** | Untuk modul Foundry. Repo diarsipkan 2021 (#9). |

## 2. Rancangan tes mutasi untuk satu tabel data JS

**Target:** tabel feat di `src/data/db1-phb-skills-species-backgrounds-feats-weapons.js`. Tiap entri punya `cat`, `pre` (prasyarat), `asi` (daftar atribut) dan `d` (teks). Contoh di berkas: "Defensive Duelist" dengan `pre:"Level 4+, Dex 13+"` dan `asi:["DEX"]`. Alasan memilih: kecil, dipakai logika prasyarat dan kenaikan atribut, dan salah ketik di sini lolos tanpa error.

Stryker mengubah kode, bukan data. Untuk tabel data, mutasi dibuat sendiri. Alasan: mutator Stryker (string, array, object) tidak terbukti cocok dengan data yang dibaca oleh penguraian teks (`pre`). Daftar mutator Stryker tidak berhasil dibuka.

### Langkah

1. **Ekstrak.** Muat berkas tabel di Node (`vm.runInNewContext`) dan dapatkan objek feat. Tulis ulang ke satu fungsi `loadFeats()`. Berkas sumber tidak diubah.
2. **Tentukan tes target.** Pilih tes yang membaca tabel: golden_rules, fuzz_rules, tes prasyarat feat. Jalankan lewat harness yang memakai build mutan (lihat langkah 5).
3. **Bangkitkan mutan** (lihat daftar di bawah). Tiap mutan = satu salinan tabel dengan satu perubahan.
4. **Eksekusi.** Untuk tiap mutan: tulis tabel termutasi ke direktori sementara, jalankan `python3 build.py` ke luar `dist/` (atau suntikkan lewat `page.route`), jalankan tes target. Gagal = tewas. Lulus = selamat.
5. **Jalur kedua yang lebih murah.** Ekstrak fungsi murni (modifier, HP, prasyarat) ke modul yang bisa di-`import` di Node. Jalankan Stryker biasa dengan runner command atau Mocha/Vitest. Mode inkremental (`--incremental`) memakai ulang hasil bila berkas dan tes tidak berubah (#1). Catatan #1: perubahan di luar berkas termutasi dan berkas tes tidak terdeteksi.
6. **Laporkan.** Tulis daftar mutan selamat ke `reports/`. Tinjau satu per satu: tambah tes, atau tandai ekuivalen.

### Cara memilih mutasi

Dipinjam dari operator PIT (#13): batas kondisional (`<` ke `<=`), negasi kondisional (`==` ke `!=`), matematika (`+` ke `-`). Untuk data:

| Mutasi | Contoh | Sasaran |
|---|---|---|
| Geser angka prasyarat | `Dex 13+` ke `Dex 14+` dan `Dex 12+` | Batas |
| Geser level | `Level 4+` ke `Level 5+` | Batas |
| Ganti atribut | `asi:["DEX"]` ke `["STR"]` | Pemetaan |
| Hapus satu elemen `asi` | `["STR","DEX"]` ke `["STR"]` | Kelengkapan |
| Ganti `cat` | `"G"` ke `"O"` | Kategori |
| Hapus entri | buang satu feat | Cakupan |
| Tukar dua nilai antar entri | tukar `pre` dua feat | Salah salin |

Batasi: maksimal 3 mutan per entri per jenis. Hindari mutasi pada teks `d` (tidak dibaca logika, hampir semua selamat sebagai ekuivalen).

### Cara menghitung skor

- Skor = mutan tewas / (mutan total - ekuivalen - timeout - tak valid) x 100.
- Status mengikuti Stryker dan PIT: tewas, selamat, tanpa coverage, timeout (#12, #16). Rumus skor tidak tertulis di halaman yang dibuka (#12, #16). Rumus di atas adalah pilihan kami.
- Laporkan "tanpa coverage" terpisah. Halaman #16 menyebutnya lebih buruk daripada selamat.
- Ambang awal: gagalkan build jika skor di bawah 70 persen (angka kami, bukan standar). Stryker punya `thresholds.break` untuk itu (#16).

### Perkiraan waktu (perkiraan, tidak diukur)

| Pekerjaan | Perkiraan |
|---|---|
| Tulis ekstraktor dan generator mutan | 3 sampai 4 jam |
| Hitung mutan | sekitar 6 jenis x entri feat, mungkin 300 sampai 600 mutan |
| Waktu per mutan lewat build + Playwright | 10 sampai 30 detik, jadi 1 sampai 5 jam serial |
| Waktu per mutan bila tes pakai modul Node murni | di bawah 1 detik |
| Triase mutan selamat | 2 sampai 3 jam |

Saran: mulai dari jalur Node murni. Jalur Playwright hanya untuk mutan yang selamat di tahap pertama.

## 3. Rancangan differential testing

**Pilihan realistis: `dnd5e-engine` (PyPI, Python, MIT)** (#17).

Alasan memilih:
- Bundel SRD 2024 dan menyatakan hasil mengikuti korpus 2024 (#17).
- Bisa membuat karakter dari skor atribut, kelas, spesies lewat `make_build_spec` dan `build_party_member` (#17).
- Mesin tanpa I/O, mudah dipanggil dari skrip.

Batasan yang terbukti:
- Cara ia menghitung modifier, AC, dan HP tidak dijelaskan di halaman (#17). Perlu uji coba nyata.
- Cakupan kelas dan spesies tidak terbukti. Jika hanya sebagian, bandingkan itu saja.
- Foundry dnd5e: MIT, memuat materi SRD 5.1 dan 5.2 (#14). Dukungan 2024 penuh dan lokasi logika HP tidak terbukti. Jalankannya butuh Foundry, jadi mahal. Tidak dipilih.
- opencombatengine: SRD 5.1 saja, C# (#15). Tidak cocok untuk 2024.
- 5etools, Borealis, dnd_engine lain: tidak terbukti.

### Rancangan

1. **Pasang** di venv terpisah: `pip install dnd5e-engine`. Baca README paket untuk API karakter. Hentikan jika turunan HP dan AC tidak terbuka. (Mulai di sini, 1 jam.)
2. **Himpunan input bersama.** Ambil dari golden_rules: kelas, spesies, level, enam atribut. Batasi ke kombinasi yang ada di kedua sisi.
3. **Adaptor.** Skrip Python mengubah satu spesifikasi karakter ke panggilan engine dan ke JSON untuk `__sheetApply`. Keluaran ke satu bentuk: `{pb, mods, hp, ac, speed, initiative}`.
4. **Bandingkan.** Per karakter, bandingkan kolom yang kedua sisi hitung. Kolom yang hanya satu sisi punya: lewati.
5. **Klasifikasi selisih.** Tiga kotak: (a) bug kami, (b) bug engine, (c) beda tafsir aturan atau opsi. Tulis ke `reports/`. Jangan ubah kode diam-diam.
6. **Jadwal.** Jalankan manual tiap rilis. Jangan masuk gerbang CI (versi engine bisa berubah, 0.7.0 pada saat dibuka).
7. **Pelajaran dari proyek lain.** Penulis bot game memakai rekaman resmi runner sebagai acuan, dan menemukan bug urutan aturan serta kasus tepi yang akhirnya diubah oleh penyelenggara (#10). Pola ini cocok: selisih bisa berarti bug di oracle juga.

Perkiraan: 1 hari kerja sampai laporan selisih pertama (perkiraan, tidak terbukti).

## 4. Sepuluh metamorphic relation untuk D&D 2024

Survei: hubungan biasanya dibuat manual dengan pengetahuan domain. Kurang dari 10 relasi sering cukup untuk hasil positif (#7, survei menyebut angka 5 sampai 9 pada banyak studi). Pola umum: aditif, multiplikatif, permutatif, invertif, inklusif, eksklusif (#7, untuk aplikasi machine learning).

Notasi: karakter C, `D(C)` = angka turunan dari `window.__D()`. `C'` = karakter hasil perubahan. Semua relasi di bawah adalah usulan saya dari aturan 2024 yang saya ketahui. **Verifikasi tiap relasi ke PHB 2024 di books/ sebelum dipakai.** Tidak ada yang berasal dari halaman yang dibuka.

| # | Perubahan | Relasi yang diharapkan | Pola |
|---|---|---|---|
| 1 | Naikkan CON 2 poin (nilai dasar, tanpa batas 20) | HP maks C' >= HP maks C. Bila modifier naik 1, selisih = level (ditambah bonus per level dari sifat seperti Dwarven Toughness bila ada). | Monoton, aditif |
| 2 | Naikkan level 1 | Bonus proficiency C' >= C. HP maks C' > HP maks C bila CON tidak sangat rendah (HP minimal 1 per level, periksa aturan). | Monoton |
| 3 | Naikkan atribut X sebanyak 2 | Modifier X naik tepat 1. Save, skill, dan serangan yang memakai X naik 1 bila tidak dibatasi. Nilai yang memakai atribut lain tidak berubah. | Aditif, eksklusif |
| 4 | Tambah proficiency pada satu skill | Skill itu naik tepat PB. Skill lain, save, AC, HP tidak berubah. Dengan Expertise: naik 2x PB dari kondisi tanpa proficiency. | Aditif, eksklusif |
| 5 | Urutan penerapan: terapkan dua pilihan independen A lalu B, versus B lalu A | `D(C)` sama (komutatif). Contoh: pilih feat lalu spesies atau sebaliknya. | Permutatif |
| 6 | Apply, simpan, muat ulang, derive ulang | `D` sama persis (idempoten). Dua kali derive menghasilkan angka sama. | Invertif |
| 7 | Tambah item non-armor (barang gear, koin) | Semua angka turunan sama, kecuali beban atau slot bila ada. | Eksklusif |
| 8 | Pakai armor lebih berat dari kategori sama, tanpa kelas yang menambah AC | AC tidak turun saat armor dasar naik. Penalti Stealth tepat sesuai tabel armor. | Monoton |
| 9 | Naikkan DEX saat memakai armor medium | AC naik hanya sampai +2 dari DEX. Di atas itu AC tetap. Tanpa armor: AC naik penuh per modifier. | Monoton, jenuh |
| 10 | Naikkan level tepat satu kali pada kelas caster | Slot spell total tiap tingkat tidak turun. DC dan bonus serangan spell naik tepat 1 hanya bila PB naik (level 5, 9, 13, 17) atau modifier naik. | Monoton, aditif |

Catatan:
- Relasi 1 dan 3 menolak kasus saat nilai dibatasi 20 (atau 30). Properti harus membuang input itu (`fc.pre`, #3).
- Relasi 5 dan 6 sudah dekat dengan tes yang ada (sifat meta, "same result on a second derive" di golden_rules). Nilai tambah ada pada urutan pilihan builder.
- Relasi 8, 9, 10 bergantung pada aturan tepat. Cek di buku sebelum dipakai.
- Menurut survei, relasi yang jarak keluaran sumber dan ikutannya lebih besar cenderung lebih baik menemukan cacat pada beberapa studi (#7). Jadi sertakan perubahan besar, bukan hanya +1.

## 5. Rekomendasi urutan kerja

| Urutan | Pekerjaan | Perkiraan |
|---|---|---|
| 1 | Pindahkan fuzz_rules ke fast-check (seed + shrinking). Tambah 10 relasi di atas sebagai properti. Harness memanggil `__sheetApply` dan `__D()` di Playwright. | 1 sampai 2 hari |
| 2 | Coverage: kumpulkan coverage JS dari Playwright atau jalankan modul murni dengan c8 `--all` (#8). Lihat cabang `logic.js` yang tak tersentuh. | 0,5 hari |
| 3 | Mutasi tabel feat dan fungsi murni (bagian 2). | 1 sampai 2 hari |
| 4 | Differential testing manual terhadap `dnd5e-engine` (bagian 3). | 1 hari |
| 5 | Visual regression: toHaveScreenshot di 390x844 dan 1250x850, satu mesin, animasi dimatikan, `maxDiffPixels` kecil (#2). Hanya layar stabil. | 1 hari |

## 6. Hal yang tidak terbukti

- Perilaku c8 asli (bcoe/c8): halaman diblokir. Fakta c8 di atas dari fork w3nl/c8.
- Daftar mutator Stryker: halaman diblokir.
- Pengumpulan coverage JS lewat API Playwright: tidak dibuka.
- mutmut, jqwik, Borealis, 5etools, Foundry dnd5e (tes unit, logika HP, dukungan 2024), Quench untuk dnd5e: tidak terbukti.
- Waktu dan biaya proyek kami: perkiraan.
- Praktik "proyek kalkulator aturan nyata": terbukti hanya #10 (bot game), #11 (mesin kartu), #15 dan #17 (mesin D&D, tes dan seed dadu disebut di #15). Bukti kegagalan bug nyata di kalkulator karakter D&D: tidak ditemukan.
