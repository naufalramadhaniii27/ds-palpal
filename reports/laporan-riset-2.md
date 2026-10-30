# Laporan riset 2 (akhir): hasil, urutan kerja, keputusan (2026-10-30, jam 2)

Semua angka diukur hari ini pada build main 0.0.4 (commit eab1472) dengan Chromium. Tidak ada kode app yang diubah. Skrip dan prototipe ada di tools/research/. Ringkasan untuk developer: reports/ringkasan-teknis-dev.md.
Batas: hanya Chromium, CPU diperlambat lewat emulasi, karakter uji dari builder, tidak ada orang nyata yang mencoba.

## 1. Apa yang berubah sejak laporan 0
| Hal | Laporan 0 | Sekarang |
|---|---|---|
| Daftar teknologi | Salah baca (branch lama) | Dikoreksi memakai main |
| Bukti mesin aturan | Klaim | 800 karakter uji metamorfik + uji kejujuran struk angka |
| Muat awal | Tidak diukur | Diukur, dan kesimpulan awal saya dikoreksi |
| Keamanan teks | Klaim | Diuji, ditemukan 1 bug nyata dan dibuat prototipe perbaikan |
| Data | Klaim | Ditemukan 1 jalur yang bisa menghilangkan data |
| PDF | Klaim | Diukur dan dibuat prototipe |

## 2. Temuan terukur
### 2a. Kuat
| No | Temuan | Angka | Cara mengulang |
|---|---|---|---|
| 1 | Build bisa direproduksi bit demi bit | Dua build dari sumber dan berkas di repo: sha256 sama (f9c70004cebd5f74...), 7.590.655 byte | `npm ci --prefix tools/build && python3 build.py` |
| 2 | Struk angka jujur | 60 karakter acak x 6 ability dinaikkan 2: 2.134 angka berubah, 2.134 dijelaskan breakdown, 0 terlewat. 32 dijelaskan tapi tidak berubah (batas, misal DEX maksimal 2) | tools/research/truth2.py |
| 3 | Mesin konsisten | 800 karakter, 0 pelanggaran: skor naik hanya memengaruhi yang seharusnya, proficiency menambah tepat sebesar Proficiency Bonus, urutan data tidak berpengaruh, derive tidak mengubah input, level naik menambah HP dan tidak menghilangkan fitur | tools/research/meta.py, meta2.py |
| 4 | derive() cepat | 0,5 sampai 0,85 ms. CPU 6x lebih pelan: maksimum 7,7 ms | tools/research/timing.py |
| 5 | Tidak ada kebocoran memori | 10 putaran penuh: node 5,3 sampai 5,7 ribu, heap 15 sampai 17 MB. Pindah tab 30 sampai 60 ms sebelum dan sesudah 20 kali damage dan heal | leak2.py, leak3.py |
| 6 | Tidak ada permintaan jaringan keluar | 34 same-origin, 0 eksternal pada alur sheet | netcheck.py |
| 7 | Payload XSS tidak jalan | 262 string diracuni, semua tab dan Export PDF, 0 jalan, 0 pelanggaran CSP | xss_check (salinan csp_check) |
Catatan kejujuran: dua skrip pertama saya salah (kunci expertise keliru, indeks skill terbalik) dan memberi temuan palsu. Saya memperbaiki skripnya, bukan menyesuaikan angka.

### 2b. Lemah, dengan bukti
| No | Temuan | Angka | Tindakan |
|---|---|---|---|
| 1 | Kebijakan Trusted Types memotong teks sah | "Rage: once = 1 per rest" tampil "Rage: per rest". 5 dari 21 teks sah rusak. Nama fitur dengan " once = 1" menjadi "Darkvision>" (markup rusak) | requests.md (Logic). Prototipe perbaikan: 0 teks rusak, 0 dari 25 payload jalan |
| 2 | Salinan localStorage rusak menimpa IndexedDB sehat | 11.747 karakter sah menjadi 5.873 karakter rusak setelah satu muat ulang. Layar kosong tanpa pesan. Level berisi teks menjadi level 1 tanpa pesan | requests.md (Logic). Usul: cek bentuk sebelum menimpa (bagian dari N25) |
| 3 | Muat awal di HP lambat (CPU 4x) | Home terlihat 1,5 detik, DOM siap 2,7 detik, terblokir 1,8 detik, tugas terpanjang 611 ms | N91 dan N93, menunggu keputusan A atau B |
| 4 | PDF berupa gambar | 1,38 MB, 6,8 detik, 4 halaman, 0 karakter bisa dipilih | N80, prototipe di bawah |
Batas temuan 2: saya menulis kerusakannya sendiri lewat localStorage. Seberapa sering hal ini terjadi di perangkat nyata tidak diukur. Kode sumber menjelaskan aturannya sengaja (nilai yang berbeda dianggap ditulis alat lain), tetapi tidak ada pemeriksaan keabsahan.

## 3. Prototipe (di luar app, bisa dijalankan)
| Prototipe | Hasil | Berkas |
|---|---|---|
| Pembersih HTML berbasis DOM (N90) | 0 dari 21 teks sah rusak (kebijakan sekarang 5), 0 dari 25 payload jalan (sekarang 1 bila diklik) | sanitize-proto.py |
| PDF vektor (N80) | 4.515 byte, 8,1 ms, 3 halaman, 4.764 karakter bisa dipilih. Tata letak sederhana, belum sama dengan sheet cetak. File contoh sudah saya kirim | pdf-proto.mjs |
| Graf pengaruh angka dari breakdown (N19) | Dari data B yang sudah ada: STR memengaruhi 16 angka milik Yudhi, DEX 7, CON 2, bonus latihan 15. AC tidak dipengaruhi DEX (armor berat), sesuai teks "Heavy armor ignores your Dexterity modifier" | truth2.py, hasil di laporan |
| Uji metamorfik (N92) | 800 karakter, 0 pelanggaran, kanari aktif (fitur bertambah di 244 dari 400 kenaikan level) | meta.py, meta2.py |

## 4. Koreksi rencana lama
| Item | Koreksi | Alasan |
|---|---|---|
| N53 pekerja untuk derive | Dibatalkan | derive 0,5 sampai 8 ms |
| "Muat awal kelemahan terbesar" | Diturunkan | Home 1,5 detik di CPU 4x. Yang berat thread terblokir |
| Daftar teknologi pagi ini | Diganti laporan 0 dan 2 | Salah baca branch |

## 5. Urutan kerja yang saya sarankan
Ukuran dampak: T tinggi, S sedang, R rendah. Biaya: kecil (hari ini), sedang (beberapa hari), besar (minggu).
| Urutan | Kerja | Dampak | Biaya | Alasan |
|---|---|---|---|---|
| 1 | Pemeriksaan keabsahan sebelum localStorage menimpa IndexedDB (N25 bagian awal) | T | kecil | Satu-satunya jalur kehilangan data yang saya temukan |
| 2 | Pembersih teks DOM (N90) dan tes korpus teks sah (N94) | S | kecil | Bug tampilan nyata, prototipe siap |
| 3 | Tes baru ke regresi: N92 metamorfik, N95 kejujuran struk, N96 build reproduksibel, N97 nol jaringan | S | kecil | Skrip sudah ada. Menjaga kualitas yang sekarang sudah benar |
| 4 | N93 anggaran muat CPU 4x | S | kecil | Mengunci angka sebelum perubahan muat |
| 5 | N80 PDF vektor | S | sedang | Offline penuh, 300 kali lebih kecil, teks bisa dicari. Perlu tata letak sama dengan sheet cetak |
| 6 | N91 muat berlapis (menunggu keputusan A atau B) | S | besar | DOM siap 3 kali lebih cepat, cat pertama butuh cangkang kecil |
| 7 | N19 peta angka | S | sedang | Data sudah ada di breakdown. Nilai bagi pemain |
| 8 | Engine N48, N49, N51, N59 | T | besar | Fondasi jangka panjang. Baru dikerjakan setelah 1 sampai 4 |
| 9 | Training Ground: teknologi latest (Wake Lock, transisi, bar HP), lalu N33 sampai N41 | S | sedang | Menunggu pilihan Anda |
Tidak disarankan sekarang: N53, N56 sampai N58 sebelum keputusan A atau B, N63 sampai N79 sebelum fondasi (urutan 8).

## 6. Keputusan yang saya butuhkan dari Anda
| No | Keputusan | Pilihan | Saran |
|---|---|---|---|
| 1 | Boleh saya mengerjakan urutan 1 sampai 4 (kode kecil, ada tes) | Ya, mulai / tunda | Ya. Kode kecil, bukti sudah ada |
| 2 | Bagian Logic memegang requests.md terbaru (Trusted Types, penimpaan IndexedDB). Saya yang mengerjakan atau Anda tugaskan ke sesi lain | Saya / sesi lain | Sesi lain bila ada. Saya tidak mengubah bagian Logic tanpa izin |
| 3 | Pecah build untuk N58 | A tetap satu berkas / B pecah | B bila tujuan DOM siap. Ukur dulu dengan N93 |
| 4 | Uji Safari dan Firefox | Anda coba di iPhone / saya cari alat | Anda coba. Workspace saya hanya punya Chromium |
| 5 | Uji main Learn dengan orang awam | Jadwal Anda | Belum ada bukti sama sekali |

## 7. Penilaian dev expert, diperbarui
Penilaian saya setelah bukti hari ini. Bukan fakta terukur. Skala 1 sampai 10.
| Aspek | Laporan 0 | Sekarang | Alasan perubahan |
|---|---|---|---|
| Disiplin tes | 8 | 8,5 | Uji metamorfik dan uji kejujuran struk angka menambah bukti. Penerapan serupa pada sheet karakter tidak saya temukan di pencarian |
| Keamanan web | 8 | 7,5 | CSP dan escape bekerja, tapi kebijakan Trusted Types punya bug teks |
| Offline dan data | 8 | 7 | Temuan penimpaan IndexedDB. Rancangan sudah ada, belum dipasang |
| Determinisme | 8 | 8 | Tidak berubah |
| Orisinalitas | 6 | 6,5 | Uji kejujuran penjelasan angka adalah pendekatan yang tidak saya temukan di tempat lain |
| Arsitektur kode | 5 | 5 | Tidak berubah |
| Kerapian rilis | 6 | 7 | Build reproduksibel, 0 jaringan keluar |
| Bukti pengguna | 3 | 3 | Tidak ada uji orang |
| Rencana lawan jadi | 4 | 4,5 | Rencana dipangkas dan diurutkan berbasis bukti |
| Keseluruhan | 6,5 | 7 | Naik karena bukti terukur. Batas atas tanpa uji pengguna dan lintas browser kira-kira 7,5 |
Yang paling membuat expert terkesan, berurutan: (1) build bit demi bit, (2) uji kejujuran struk angka 2.134 dari 2.134, (3) mesin yang menjelaskan dan membatalkan dirinya (struk angka, mesin waktu), (4) satu berkas offline tanpa jaringan keluar dengan CSP dan Trusted Types, (5) mesin pertarungan deterministik.
Yang paling membuat expert ragu: kode global dalam satu closure, belum ada uji orang, belum lintas browser, dan jalur kehilangan data di bagian 2b nomor 2.

## 8. Yang belum terbukti
- Lintas browser (Safari dan Firefox).
- HP asli (CPU diperlambat lewat emulasi).
- Frekuensi nyata kerusakan localStorage.
- Isi suara video BONEBOXID dan angka dari slide (dari sesi sebelumnya).
- Layar pemulihan: BAD ada di kode, tapi tidak muncul pada jalur uji saya. Perlu penjelasan pemilik bagian Logic.
- PDF vektor belum sama dengan tata letak sheet cetak (prototipe).
