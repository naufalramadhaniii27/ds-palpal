# Rencana kerja engine seluruh app (2026-10-30)

Permintaan user 2026-10-30 07.03 WIB: jangan mulai apa pun, masukkan ke rancangan kerja. Analisa dan racik untuk mengembangkan engine keseluruhan app, mode developer, ciptakan sesuatu yang baru dan bermanfaat.
Status: rancangan. Tidak ada kode app yang diubah. Teknologi buatan sendiri ini memakai izin user 2026-10-29 22.45 WIB (tanpa AI berbayar, paket gratis, tes tiga skenario, dicatat lebih dulu di rencana).
Nomor N48 sampai N55. Nomor lain sudah dipakai: N1 sampai N18 (rencana teknologi), N19 sampai N31 (sesi lain, `rencana-teknologi-ciptaan`), N32 sampai N47 (Training Ground, riset video).

## 1. Hasil analisa engine hari ini (dari membaca kode, belum ada yang dijalankan)
| Temuan | Bukti |
|---|---|
| Satu fungsi `derive()` menghitung semua angka (level, Proficiency Bonus, skor, save, skill, passive, AC, Initiative, Speed, HP, DC, serangan, sumber daya). Sekitar 120 baris di `src/app/06-logic-derivation.js` | Membaca berkas |
| `derive()` sudah mencatat asal tiap angka. Tiap angka punya daftar bagian `{l, v, note}` di objek `B` (contoh `B.ac`, `B["save-STR"]`, `B["ah-0"]`). Rincian di `11-ui-breakdown.js` memakai `B` | Membaca berkas |
| Semua keadaan global yang bisa diubah: `C` (karakter, bentuk `v:3`), `S` (keadaan main), `D` (angka hasil), `B` (rincian), `CU0` | `var D = {}, B = {}` di `06`, `var C`, `var S` di `04` |
| Cara memakai `derive()` untuk karakter lain: tukar `C` dan `S` global, panggil `derive()`, kembalikan lagi. Ada di 3 tempat: ringkasan karakter dan `foundryOf` (`27`, baris 4 dan 330) dan `__actProbe` (`17`, baris 49) | Membaca berkas |
| Sumber angka lain di luar `C`: `cuApply` (angka yang diubah user lewat Customize), `sitNum` (Situations), `cfx()` (kondisi), `scAdj` (spellcasting) | Membaca berkas |
| Penyimpanan: `loadC` memeriksa `p.v===3 && p.abilities`, kunci diberi cap `_app` (versi tertinggi yang menulis), bidang yang tidak dikenal dipertahankan, data rusak masuk daftar `BAD` lalu layar pemulihan | `04-logic-storage.js` |
| Gabung antar tab (`mergeS`): bidang yang berubah di tab ini sejak `S_BASE` menimpa tab lain. Angka yang sama diubah di dua tempat: yang menyimpan terakhir menang. Contoh: HP 20, tab A jadi 15, tab B jadi 18, hasil 15 atau 18, bukan 13 | `04-logic-storage.js`, fungsi `mergeS` |
| Rencana N3 sudah mengira `derive` perlu dibuat mencatat asal angka. Pada kenyataannya `B` sudah melakukannya | Lihat 6 (koreksi N3) |

Belum diukur: waktu satu panggilan `derive()` di HP lambat. Itu menentukan apakah perlu pembaruan bertahap. Dugaan saya sangat kecil, tetapi ini dugaan.

## 2. Gelombang kerja engine (urutan)
| Fase | Isi | Selesai bila |
|---|---|---|
| E0 Kunci dan ukur | N49 master emas, N50 oracle aturan, ukur waktu `derive()` di CPU 1x dan 4x. Tidak mengubah perilaku | Master emas tersimpan dan stabil dua kali jalan. Selisih oracle dilaporkan di `reports/` |
| E1 Inti hitung murni | N48. Pindahkan angka satu per satu ke fungsi murni, `derive()` memanggilnya | Master emas sama persis setelah tiap angka dipindah |
| E2 Skema dan migrasi | N51 | Korpus simpanan lama terbaca, Pages Functions memakai pemeriksa yang sama |
| E3 Gabung angka | N52, di dalam N12 | Kasus bentrok di `cloud_sync.py`, tes dua tab |
| E4 Pekerja mesin | N53. Dipakai N1, N22, N29, N45, Training Ground | Satu pekerja, data dimuat sekali |
| E5 Anggaran ukuran | N54. Boleh mulai kapan saja | Build mencetak peta ukuran dan gagal bila melewati anggaran |
| E6 Satu bentuk efek | N55. Hanya setelah E0 dan E1, dan hanya bila user setuju | Master emas sama persis |

## 3. Teknologi baru
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N49 | Master emas angka | Perubahan di `derive()` bisa menggeser angka tanpa ketahuan. Fuzzer N6 hanya memeriksa kewajaran (tanpa NaN, AC dan HP masuk akal), bukan kesamaan | Sebelum ada perubahan, jalankan `derive()` pada 10.000 karakter fuzzer berseed tetap ditambah sheet Yudhi lama. Simpan `D` dan `B` sebagai hash per karakter plus berkas penuh untuk 200 karakter contoh. Skrip pembanding menunjukkan angka mana yang berubah, di karakter mana, dan sebabnya dari `B`. Selisih harus dijelaskan di `reports/` sebelum diterima | Dua kali jalan menghasilkan hash sama. Satu angka sengaja diubah: terdeteksi dan menunjuk bagian yang benar |
| N50 | Oracle aturan terpisah | Satu implementasi yang salah akan selalu cocok dengan dirinya sendiri | Kalkulator kecil ditulis terpisah dari buku PHB 2024 di `books/` (bukan dari `derive()`): Proficiency Bonus, modifier, save, skill, passive, Initiative, HP opsi tetap, spell slot per class dan level, DC dan bonus serang sihir, AC untuk set zirah standar. Pada karakter fuzzer, hasil oracle dan `derive()` dibandingkan. Selisih dilaporkan, tidak diperbaiki otomatis (peran Checker hanya melapor) | Kasus tahu: level 5 memberi +3, Con 14 memberi +2 per level. Selisih pada 10.000 karakter tercatat per jenis angka |
| N48 | Inti hitung murni | Mesin hanya bisa jalan di halaman karena membaca `C`, `S`, `D`, `B` global. Tidak bisa dites di Node, tidak bisa di worker, dan cara menukar global rawan | Pola strangler: tiap angka (save, skill, Initiative, Speed, HP, dan seterusnya) dipindah satu per satu ke fungsi murni `hitung(konteks)` yang mengembalikan `{bagian, total}`, di berkas `src/engine/` yang bisa dimuat Node dan browser. `derive()` memanggil fungsi itu dan menulis ke `D` dan `B` seperti dulu, jadi bentuk keluaran sama. Setelah selesai, tersedia `deriveFor(C,S)` yang mengembalikan `{D,B}` tanpa mengubah global. Tiga tempat tukar global di bagian 1 diganti `deriveFor` | Master emas (N49) sama persis setelah tiap angka dipindah. Fungsi murni dites di Node tanpa DOM. Tiga skenario wajib sama |
| N51 | Skema, validator, dan migrasi terdaftar | Pemeriksaan sekarang `p.v===3 && p.abilities`. Data rusak sebagian membuat seluruh sheet masuk layar pemulihan. Pemeriksaan di klien dan server bisa berbeda | Satu berkas skema kecil (tanpa library) mendeskripsikan `C`, `S`, ringkasan roster, dan muatan sinkron: bidang wajib, tipe, rentang. Satu daftar migrasi bernomor (3 ke 4 dan seterusnya) dengan korpus simpanan tiap versi sebagai contoh. Kesalahan menyebut bidang yang bermasalah dan, bila aman, memperbaiki bidang itu saja. Berkas yang sama dimuat Pages Functions untuk menolak muatan rusak di server | Korpus: sheet Yudhi lama dan satu simpanan per versi app terbaca. Bidang diubah jadi tipe salah: dilaporkan dengan nama bidang. Aturan proyek tetap: bentuk data tersimpan tidak berubah tanpa migrasi |
| N52 | Gabung angka dengan selisih | Dua perangkat mengubah angka yang sama dan satu perubahan hilang (HP, slot sihir, koin, hitungan sumber daya) | Untuk bidang angka penghitung, gabungan = `dasar + (milikku − dasar) + (miliknya − dasar)`, lalu dibatasi rentangnya (HP antara 0 dan maksimum). Tidak perlu log kejadian dan tidak mengubah bentuk data. Dipakai di N12 (bentrok sinkron) dan di `mergeS` (antar tab). Bidang bukan angka tetap ditanyakan per bagian oleh N12 | HP 20, A jadi 15, B jadi 18, hasil 13. Hasil sama bila urutan gabung dibalik. Dibatasi di maksimum dan nol |
| N53 | Pekerja mesin tunggal | N1, N22, N29, N45, dan jalur Training Ground masing-masing butuh worker. Tiap worker memuat salinan data sendiri (data app sekitar 3,9 MB), memori naik berlipat | Satu Web Worker dimulai saat pertama dibutuhkan, memuat data dan inti hitung (N48) sekali, menerima pesan `{nama, argumen, id}`, mendukung pembatalan. Cadangan tanpa worker: jalankan di thread utama dalam potongan kecil (bukan `scheduler.yield()`, Safari belum mendukung) | Memori dengan tiga pekerjaan berurutan dibanding tiga worker. Pembatalan menghentikan kerja. Hasil sama dengan thread utama |
| N54 | Anggaran dan peta ukuran otomatis | `index.html` 7,6 MB. Pertumbuhan tidak terlihat sampai terlambat | `build.py` mencetak tabel ukuran per blok (CSS, data, app, fx, builder) dan menulis `reports/ukuran.json`. Berkas `budget.json` menyimpan batas per blok. Build gagal bila melewati batas, kecuali batas dinaikkan dengan catatan alasan | Sengaja menambah berkas besar: build gagal dengan nama blok. Tanpa perubahan: build lolos |
| N55 | Satu bentuk efek (opsional, berisiko) | Efek ke angka tersebar di banyak tempat: `C.ac.bonus`, `saveBonus`, `initBonus`, `hpBonus`, `cuApply`, `sitNum`, `cfx` (seperti pintu di video Door Problem yang menyentuh banyak sistem) | Satu bentuk `{target, operasi, nilai, sumber, syarat}` yang dibaca semua angka. Syarat (Rage aktif, Shield dipasang) dinyalakan oleh `S`. Dikerjakan hanya setelah E0 dan E1 ada, dan hanya bila user setuju, karena menyentuh banyak berkas | Master emas sama persis. Efek yang sama dari builder dan dari Situations menghasilkan rincian sama |

## 4. Ketergantungan dengan rencana yang ada
| Rencana | Hubungan |
|---|---|
| N3 Struk angka (G3) | Lihat 6. N48 dan N49 harus ada lebih dulu supaya N3 bisa dibuktikan aman |
| N6 Rules fuzzer (G0) | N49 dan N50 memakai karakter dari fuzzer yang sama |
| N12 Gabung per bagian (G3) | N52 menjadi aturan gabung untuk bidang angka |
| N2 Mesin waktu dan N18 (G0 dan G3) | Tidak berubah. N52 sengaja tidak memakai log kejadian |
| N1, N22, N29, N45, TG | Memakai N53 |
| Training Ground (`rencana-kerja-training-ground`) | Mesin pertarungan memakai N48 untuk menghitung angka tiap peserta tanpa halaman |

## 5. Yang sengaja tidak dikembangkan
| Gagasan | Alasan |
|---|---|
| Grafik ketergantungan dan penghitungan ulang bertahap di `derive()` | Belum ada bukti `derive()` lambat. Ukur dulu di E0. Bila di bawah 1 ms di CPU 4x, tidak perlu |
| Event sourcing untuk keadaan main (`S`) | Gabung dengan selisih (N52) menjawab masalah nyata dengan perubahan jauh lebih kecil. Event sourcing tetap dipakai di Training Ground dan N2 |
| Enkripsi ujung ke ujung data karakter | Bertentangan dengan share, profil, dan follow di `rencana-login-sinkron` yang membutuhkan server membaca data |

## 6. Koreksi untuk rencana yang ada
N3 di `rencana-kerja-teknologi` berbunyi "Mesin derivasi mencatat asal tiap angka". `derive()` sudah melakukannya lewat `B`. Bagian N3 yang benar-benar baru adalah daftar "angka yang berubah dan sebabnya" setelah app diperbarui, yaitu perbandingan `B` antar versi, dan itu dibangun di atas N49. Rencana induk dicatat ulang di G7.

## 7. Risiko
| Risiko | Penanganan |
|---|---|
| Memindah angka ke fungsi murni mengubah hasil diam-diam | N49 dijalankan setelah tiap angka. Satu angka per langkah |
| `derive()` punya banyak sumber luar (`cuApply`, `sitNum`, `cfx`) | Sumber itu dilewatkan lewat `konteks`, bukan dibaca global di fungsi murni |
| Berkas `src/engine/` perlu urutan muat di `manifest.json` | Mengikuti aturan SOURCE-NOTES: tambah di blok dan posisi yang benar, build `--check` dan `node --check` |
| Oracle ikut salah baca buku | Oracle hanya melaporkan. Perbedaan dicek ke `books/` sebelum ada yang diubah |
| N55 menyentuh banyak berkas | Opsional, setelah E0 dan E1, butuh persetujuan user |
| Belum ada pengukuran `derive()` | E0 mengukur lebih dulu |

## Sumber
- Kode app: `src/app/06-logic-derivation.js`, `04-logic-storage.js`, `27-ui-party-search-commands-library.js`, `17-logic-tab-sync-and-test-hooks.js`
- Rencana: `rencana-kerja-teknologi`, `rencana-teknologi-ciptaan`, `rencana-login-sinkron`, `rencana-kerja-training-ground`
- `reports/riset-video-boneboxid-2026-10-30.md` (pelajaran determinisme, strangler tidak dari video: pola umum rekayasa perangkat lunak)
