# Laporan riset 1: bukti terukur (2026-10-30, jam 1)

Semua angka di bawah diukur hari ini pada build main (rilis 0.0.4, commit eab1472) dengan Playwright dan Chromium. Tidak ada kode app yang diubah. Skrip ada di tools/research/ (meta.py, timing.py, load.py, trace.py, tt_bug.py).
Batas: hanya Chromium, CPU diperlambat lewat emulasi (bukan HP asli), karakter berasal dari builder.

## 1. Ringkasan
| No | Temuan | Arti |
|---|---|---|
| 1 | 400 karakter acak lolos 6 sifat metamorfik baru, 0 temuan | Mesin derive konsisten. Ini bukti yang bisa ditunjukkan ke dev |
| 2 | derive() memakan 0,5 sampai 0,85 ms (CPU normal), 2 sampai 8 ms (CPU 6x lebih pelan) | N53 (pekerja untuk derive) tidak perlu. Rencana dikoreksi |
| 3 | Muat app di HP lambat (CPU 4x): Home terlihat 1,5 detik, DOM siap 2,7 detik, terblokir 1,8 detik, tugas terpanjang 611 ms | Kelemahan terukur. Home muncul sebelum semua selesai (koreksi: versi awal menyebutnya terbesar) |
| 4 | Memindahkan 5,2 MB blok data tunda keluar dari HTML: DOM siap 2,7 detik menjadi 0,8 detik | Batas atas manfaat memecah build. Bukan perbaikan jadi |
| 5 | 262 string diracuni payload XSS: 0 jalan, 0 pelanggaran CSP, 0 error | Pertahanan berlapis (escape, Trusted Types, CSP) bekerja |
| 6 | Bug nyata: kebijakan Trusted Types memotong teks pemain yang sah | Ditulis di reports/requests.md untuk bagian Logic |

## 2. Uji metamorfik pada derive (400 karakter, seed 5, level 1 sampai 20, semua class)
Uji metamorfik tidak memeriksa jawaban benar, tetapi hubungan antara dua jawaban. Cocok untuk aturan yang jawaban tepatnya sulit diketahui.
| Sifat | Cara uji | Hasil |
|---|---|---|
| M1 Skor naik | Tambah 2 ke satu ability. Modifier naik tepat 1, skor naik tepat 2, ability lain dan save lain tidak berubah. HP naik hanya lewat CON, AC tidak turun lewat DEX | 0 pelanggaran |
| M2 Proficiency | Jadikan skill terlatih. Bonus skill naik tepat sebesar Proficiency Bonus dan skill lain tidak berubah | 0 pelanggaran |
| M2b Expertise | Jadikan skill ber-expertise. Naik lagi tepat sebesar Proficiency Bonus | 0 pelanggaran |
| M3 Urutan | Balik urutan skill dan daftar bonus ability. Hasil sama | 0 pelanggaran |
| M4 Murni | derive tidak mengubah objek karakter yang diberikan | 0 pelanggaran |
| M5 Batas skor | Karakter builder tidak melewati skor 20 | 0 pelanggaran |
Catatan jujur: 300 karakter pertama menghasilkan 300 temuan palsu karena kesalahan skrip saya (kunci expertise salah, indeks skill terbalik). Setelah diperbaiki 400 karakter bersih. Skrip ditulis ulang, bukan angka disesuaikan.
Tentang pembanding: kerangka ini dikenal sebagai metamorphic testing (Chen dkk., dan penerapannya dengan alat property-based). Penerapan pada sheet karakter tidak ditemukan di pencarian.

## 3. Waktu derive() (CPU diperlambat lewat Chrome DevTools Protocol)
| CPU | Level 1 | Level 10 | Level 20 | Terburuk |
|---|---|---|---|---|
| Normal | 0,53 ms | 0,85 ms | 0,79 ms | 1,26 ms |
| 4x lebih pelan | 1,46 ms | 2,18 ms | 2,71 ms | 3,78 ms |
| 6x lebih pelan | 2,08 ms | 4,46 ms | 4,58 ms | 7,71 ms |
Salin objek karakter (JSON) memakan 0,13 sampai 0,29 ms normal. Akibat untuk rencana:
| Item rencana | Sebelumnya | Sekarang |
|---|---|---|
| N53 pekerja mesin untuk derive | Disarankan | Tidak perlu. 8 ms di HP lambat jauh di bawah satu frame berat. Pekerja tetap masuk akal untuk Find a build (8 sampai 14 detik) dan pencarian jalur Training Ground |
| N29 Find a build lebih hemat | Disarankan | Tetap. Biaya ada di jumlah percobaan (384), bukan di satu derive |

## 4. Beban muat
Median 3 muat dingin, viewport 390 x 844.
| CPU | DOM siap | Cat pertama | Waktu terblokir | Tugas terpanjang | Memori JS |
|---|---|---|---|---|---|
| Normal | 281 ms | 684 ms | 120 ms | 131 ms | 18,2 MB |
| 4x lebih pelan | 2.658 ms | 2.628 ms | 1.820 ms | 611 ms | 18,2 MB |
Rincian kerja main thread di CPU 4x (jejak Chrome, termasuk beban pelacakan):
| Pekerjaan | Waktu |
|---|---|
| Menjalankan script (kompilasi 444 ms, eksekusi 977 ms) | 1.429 ms |
| Memanggil fungsi (fx, timer) | 1.317 ms |
| Gaya dan tata letak | 1.084 ms |
| Mengurai HTML | 618 ms |
Isi file: 40 blok script (6,39 juta karakter dari 7,59 juta), CSS 1,17 MB, 12 blok bertipe text/x-defer berukuran 114 KB sampai 998 KB (total sekitar 5,25 MB).

Percobaan batas atas: salinan index.html tanpa isi blok tunda (bukan perbaikan, sebagian fitur tidak jalan di salinan itu).
| Ukuran | Asli | Tanpa isi blok tunda |
|---|---|---|
| Ukuran HTML | 7.589.350 byte | 2.340.346 byte |
| DOM siap, CPU 4x | 2.658 ms | 832 ms |
| Cat pertama, CPU 4x | 2.628 ms | 2.284 ms |
| Terblokir, CPU 4x | 1.820 ms | 1.251 ms |
| Memori JS | 18,2 MB | 10 MB |
Pelajaran: memecah blok tunda ke berkas terpisah mempercepat DOM siap sekitar 3 kali, tetapi cat pertama hampir tidak berubah. Cat pertama dibatasi oleh 1,1 MB script yang langsung jalan dan 1,17 MB CSS. Ini mengubah isi keputusan A atau B untuk N58: manfaat B (memecah build) nyata untuk DOM siap, tetapi tidak menyelesaikan cat pertama. Perlu langkah terpisah (lihat N91 di bawah).

Tambahan (diukur setelah versi pertama laporan ini): waktu sampai Home terlihat, tiga muat dingin dengan karakter tersimpan.
| CPU | Home terlihat |
|---|---|
| Normal | 387 sampai 423 ms |
| 4x lebih pelan | 1.513 sampai 1.586 ms |
Pengguna HP lambat melihat Home sekitar 1,5 detik. Yang berat sesudahnya: thread terblokir total 1,8 detik, jadi ketukan pertama bisa tertunda. Tundaan ketukan belum saya ukur langsung.

## 5. Uji injeksi teks
262 string di karakter uji diganti atau diberi akhiran payload `"><img src=x onerror=...><svg onload=...>`. Seluruh tab, detail, Library, laporan masalah, dan Export PDF dijalankan di dua ukuran.
| Ukuran | Payload jalan | Pelanggaran CSP | Error halaman |
|---|---|---|---|
| 390 x 844 | 0 | 0 | 0 |
| 1250 x 850 | 0 | 0 | 0 |
Payload sampai ke HTML sebagai teks yang sudah di-escape (contoh: `&quot;&gt;&lt;img src=x onerror=`), jadi lapisan pertama (esc) bekerja. Kebijakan Trusted Types mencatat 2 (HP) dan 6 (PC) string sebagai "dibersihkan", padahal isinya sudah aman. Itu pertanda bug di bagian 6 (kebijakan membaca teks, bukan tag). CSP belum diuji terpisah karena tidak ada payload yang lolos sampai ke sana.

## 6. Bug nyata: Trusted Types memotong teks sah
Berkas src/boot/trusted-types.js. Ekspresi `\son[a-z]+\s*=` dicek pada string HTML penuh. Teks pemain biasa yang memuat " once =" ikut dibuang. Bukti:
| Teks pemain | Tampil |
|---|---|
| Rage: once = 1 per rest | Rage: per rest |
| Spell slots: one = 1st level | Spell slots: level |
| Javascript: a language | blocked: a language |
| Nama fitur "Darkvision once = 1" di tab Features | "Darkvision>" (tag penutup ikut hilang) |
Bukan celah keamanan. CSP memblokir script inline. Dampaknya: teks hilang dan markup bisa rusak di tab Features, detail, dan lembar cetak. Sudah ditulis di reports/requests.md untuk bagian Logic dengan usul perbaikan dan korpus tes. Saya tidak mengubah kodenya.

## 7. Pembanding eksternal (dicek hari ini)
| Hal | Temuan | Arti bagi kita |
|---|---|---|
| Trusted Types | Firefox 148 merilisnya secara bawaan (bugzilla 1994690). Status Safari tidak dicek | Kebijakan kita punya jangkauan lebih luas dari dugaan saya sebelumnya. Dukungan Safari masih perlu dicek |
| Change log karakter | Pengguna D&D Beyond dan Demiplane meminta riwayat perubahan karakter di forum (thread 15530, tanpa fitur setara) | N2 Mesin waktu mengisi celah yang diminta pengguna |
| CRDT | Ukuran min+gzip: Yjs sekitar 18 KB, Loro sekitar 180 KB, Automerge sekitar 320 KB (angka artikel pkgpulse, belum diverifikasi). Perbedaan kinerja baru terasa di 50 editor atau 500 ribu operasi | Data sheet berbentuk bagian-bagian kecil dengan satu atau dua perangkat. Gabung tiga arah per bagian (N12) menambah 0 KB. Memilih tidak memakai CRDT tepat untuk skala ini |

## 8. Gelombang 5, benih (rancangan, belum dikerjakan)
Setiap benih lahir dari temuan hari ini, bukan dari daftar keinginan.
| Kode | Nama | Masalah yang terukur | Cara kerja | Tes |
|---|---|---|---|---|
| N90 | Penyaring teks berbasis DOM | Bug Trusted Types (bagian 6) | Urai string dengan template, buang elemen dan atribut on* dari DOM hasil urai, serahkan sisanya apa adanya. Nilai balik sama untuk HTML sah | Korpus XSS (262 string) dan korpus teks sah harus lolos. Uji beda antara kebijakan lama dan baru |
| N91 | Cat pertama dari cangkang kecil | Cat pertama 2,6 detik di CPU 4x padahal DOM siap bisa 0,8 detik (bagian 4) | Cangkang Home kecil dengan CSS kritis dicat lebih dulu, script berat menyusul. Gerbang boot tetap | Cat pertama dan terblokir diukur di CPU 4x dengan anggaran N87 |
| N92 | Tes metamorfik resmi | Sifat M1 sampai M5 baru berupa skrip riset | Pindahkan ke tests/metamorphic.py dengan 6 sifat, tambah: level naik tidak menurunkan HP, ganti armor memengaruhi AC saja | 400 karakter per putaran, masuk regresi |
| N93 | Anggaran muat di CPU 4x | Tidak ada angka yang dikunci | tests/load_budget.py menjalankan load.py dengan batas (DOM siap, terblokir, tugas terpanjang) yang diambil dari angka hari ini lalu hanya boleh turun | Gagal bila melewati batas |
| N94 | Korpus teks sah | Tidak ada uji bahwa teks pemain tampil utuh | 100 teks (D&D, simbol, kutip, tanda sama dengan, bahasa Indonesia) dimasukkan ke tiap kolom teks, tampil harus sama persis | Berjalan di dua ukuran |

## 9. Dugaan yang belum terbukti
- Cat pertama 2,3 detik tanpa blok tunda tampaknya dibatasi script awal dan CSS. Belum diuraikan lebih jauh.
- Pembanding D&D Beyond dan Foundry baru dibaca dari forum dan pencarian, bukan dicoba langsung.
- Safari: dukungan Trusted Types, View Transitions, anchor positioning belum diuji di sini.
Rencana jam 2: uji pembanding lebih dalam (fitur sheet lain), rancang N91 dengan percobaan nyata (cangkang kecil di salinan), racik gelombang 5 sampai matang, susun urutan kerja dan daftar keputusan.
