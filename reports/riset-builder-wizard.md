# Riset: builder bergaya wizard (referensi video Oneon), 2026-10-29

Permintaan user: builder seperti di video, dengan penyesuaian, plus riset teknologinya.
Keputusan user 2026-10-29: potret AI diabaikan, tidak dikerjakan.
Status: riset dan usulan. Belum ada kode diubah. Menunggu keputusan di bagian 6.

## 1. Yang terlihat di video (Oneon, 64 detik, 10 layar)
Dibaca dari 32 cuplikan gambar dan teks subtitle. Video buram di beberapa bagian, jadi daftar ini adalah yang jelas terlihat.

| Layar | Isi |
|---|---|
| Rangka | Panel kiri: tangga vertikal Race, Class, Background, Abilities, Skills, Magic, Equipment, Identity, Appearance, Summary. Penanda berbentuk belah ketupat emas dan garis penghubung. Latar gelap dengan pola heksagon |
| Race dan Class | Daftar pilihan di kiri. Di kanan ilustrasi karakter besar yang memenuhi layar (tiap race dan class punya art sendiri, ada pasangan pria dan wanita) |
| Abilities | Pilih cara menentukan skor, lalu enam skor berbentuk heksagon dengan tombol plus dan minus. Penghitung "2/27 points left" (point buy). Bonus race tampil sebagai teks di bawah |
| Skills | Daftar skill per kelompok ability |
| Equipment | Pilihan paket kiri. Kanan: toko berbentuk grid kartu item dengan ikon. Sisa uang tampil besar (contoh 13 GP 2 SP) |
| Identity | Grid alignment 3 x 3, lalu Traits, Ideals, Bonds, Flaws, Backstory |
| Appearance | Jenis kelamin, deskripsi penampilan, tombol Generate portrait (potret AI, diabaikan di rencana kita), Upload your own image (JPG, PNG, WebP, dipotong 4:5), Token bulat, sisa jatah generate |
| Summary | Nama karakter dan ringkasan |

Batas riset: pencarian web tidak menemukan situs atau dokumentasi Oneon. Teknologi di balik Oneon tidak terverifikasi. Semua teknologi di bagian 4 dipilih dari kebutuhan app ini, bukan dari yang dipakai Oneon.

## 2. Perbandingan dengan builder sekarang
Langkah builder sekarang: Home, Class, Background, Species, Abilities, Equipment, What's Next, Rules (`STEPS` di `src/builder/17-ui-step-builder.js`).

| Hal | Oneon | Builder kita |
|---|---|---|
| Navigasi | Tangga vertikal dengan progres | Tab langkah di atas, centang hijau per langkah |
| Art pilihan | Ilustrasi besar penuh layar | Sudah ada scene art Species dan emblem Class (`img/scene`, `img/emblem`). Tidak ada pasangan pria dan wanita |
| Ability | Skor heksagon, point buy dengan penghitung | Point Buy, Standard Array, Rolled sudah ada. Tampilan bukan heksagon |
| Skills dan Magic | Langkah sendiri | Digabung di Class dan Background |
| Equipment | Paket plus toko grid | Paket dan toko (Buy) sudah ada |
| Identity | Alignment, traits, ideals, bonds, flaws, backstory di builder | Tidak ada di builder. Ada di sheet (Alignment, Personality, Ideals, Bonds, Flaws, Backstory) |
| Appearance | Deskripsi, upload, token | Hanya upload potret di sheet. Tidak ada deskripsi terstruktur atau token |
| Summary | Langkah akhir | Ada ringkasan dan tombol Apply to Sheet |

## 3. Penyesuaian yang diusulkan
| Penyesuaian | Alasan |
|---|---|
| Pakai alur saja, bukan tampilan atau aset Oneon | Aset, merek, dan tata letak persis milik Oneon. Art kita dari Codex, teks ditulis sendiri |
| Wizard menjadi mode tambahan, builder lama tetap | Logika (`B`, `derive`, `toSheet`, `fromSheet`) dipakai bersama. Hanya tampilan baru. Pemain lama dan Level Up tetap jalan |
| HP (390 x 844): tangga jadi baris horizontal di atas dengan satu layar per langkah. PC: tangga vertikal di kiri | Tangga kiri tidak muat di HP |
| Langkah baru Identity dan Appearance di builder, field disimpan opsional di `B` lalu ke sheet saat Apply | Pola sama dengan field `camp`: tanpa key baru, data lama terbaca tanpa migrasi. Permintaan RU38 sudah mencatat sheet butuh Gender, Eyes, Hair, Skin, Height, Weight, Age, Faith |
| Skor ability heksagon dengan Roll 4d6 memakai dadu 3D | Dadu fisika dice-box sudah ada sejak T11 |
| Art pilihan besar per Species dan Class, tampil di belakang daftar | Pakai art Codex yang sudah ada. Versi pria dan wanita butuh gambar baru dari Codex |
| Token bulat dan potong 4:5 di klien | Murah, tanpa server |
| Learn F3 Forge Your Hero memakai kerangka wizard yang sama | Hindari dua alur membuat karakter yang terpisah |

## 4. Teknologi
| Kebutuhan | Pilihan | Fakta terukur | Catatan |
|---|---|---|---|
| Potret | Upload sendiri (sudah ada) dan galeri potret siap pakai (manifest punya 20 potret) | Tanpa biaya, offline | Potret AI tidak dikerjakan (keputusan user 2026-10-29) |
| Transisi antar langkah | View Transitions API, same-document | Didukung Chrome 111, Edge 111, Safari 18, Firefox 144. Baseline | Pakai dengan cadangan tanpa animasi. Nested groups hanya Chrome 140 ke atas dan scoped hanya Chrome 147 ke atas, jadi tidak dipakai |
| Pindah halaman penuh | Cross-document view transitions | 88,81 persen pengguna global (Chrome 126, Safari 18.2, Firefox sebagian) | Tidak perlu, app ini satu halaman |
| Tombol Back antar langkah | Navigation API dan hash (A6 dari T11, sudah ada) | Back menutup panel lalu ke Home | Perlu ditambah: Back menuju langkah sebelumnya |
| Tooltip dan sorotan | Anchor Spotlight dan popover (A5 dari T11) | Sudah ada | Dipakai ulang |
| Skor heksagon | SVG atau CSS `clip-path` | Tanpa library | Kontras tinggi dan target sentuh 44 px tetap lolos axe |
| Token dan potong 4:5 | Canvas di klien, simpan data URL | Potret sekarang `S.portrait` data URL | Tidak ada key baru |
| Art besar | AVIF HD yang sudah ada (`img/hd`, scene 2400 px PC dan 1088 px HP) | Layanan lewat service worker | Pasangan pria dan wanita perlu batch Codex baru |

## 5. Risiko
| Risiko | Penanganan |
|---|---|
| Builder punya 25 file dan banyak hook ke sheet | Wizard hanya lapisan tampilan di atas `B`. Tiga skenario wajib dan fuzzer N6 menjaga logika |
| Tampilan wizard bentrok dengan Learn F3 | Satu kerangka, dikerjakan bersama |
| Art pria dan wanita belum ada | Fase 1 memakai art yang ada. Gambar baru diminta ke Codex di `reports/requests.md` |

## 6. Keputusan yang dibutuhkan dari user
| Pertanyaan | Opsi | Rekomendasi |
|---|---|---|
| Bentuk | A: ganti builder lama dengan wizard. B: wizard sebagai mode tambahan. C: hanya percantik langkah yang ada | B |
| Pasangan art pria dan wanita | Minta Codex. Pakai art sekarang dulu | Pakai art sekarang dulu, minta Codex paralel |
| Waktu | Sebelum atau sesudah rilis 0.0.3 | Sesudah 0.0.3, bersama Learn F3 |

## 7. Fase bila opsi B
| Fase | Isi | Selesai bila |
|---|---|---|
| P0 | Kerangka tangga, satu layar per langkah, Back antar langkah, transisi | Tiga skenario di dua ukuran, axe 0 |
| P1 | Species, Class, Background dengan art besar | Pilihan sama persis dengan builder lama |
| P2 | Abilities heksagon dan Roll 4d6 dengan dadu 3D | Fuzzer N6 bersih |
| P3 | Skills, Magic, Equipment dan toko | Apply menghasilkan sheet yang sama |
| P4 | Identity, Appearance, Summary, token, field baru ke sheet | Data lama Yudhi tetap terbaca |

## Sumber
- [Can I use: cross-document view transitions](https://caniuse.com/cross-document-view-transitions)
- [Chrome: what's new in view transitions (2025)](https://developer.chrome.com/blog/view-transitions-in-2025)
- Video referensi dari user (Oneon), dibaca dari cuplikan gambar
