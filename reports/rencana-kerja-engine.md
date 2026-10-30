# Rencana kerja engine seluruh app (2026-10-30)

Permintaan user 2026-10-30 07.03 WIB: jangan mulai apa pun, masukkan ke rancangan kerja. Analisa dan racik untuk mengembangkan engine keseluruhan app, mode developer, ciptakan sesuatu yang baru dan bermanfaat.
Status: rancangan. Tidak ada kode app yang diubah. Teknologi buatan sendiri ini memakai izin user 2026-10-29 22.45 WIB (tanpa AI berbayar, paket gratis, tes tiga skenario, dicatat lebih dulu di rencana).
Nomor N48 sampai N79 (N56 sampai N62 di bagian 3b, N63 sampai N79 di bagian 3c). Nomor lain sudah dipakai: N1 sampai N18 (rencana teknologi), N19 sampai N31 (sesi lain, `rencana-teknologi-ciptaan`), N32 sampai N47 (Training Ground, riset video).

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

### 3b. Gelombang kedua (diusulkan 2026-10-30 07.07 WIB, N56 sampai N62)
Fakta tambahan dari kode dan berkas hari ini:
| Temuan | Bukti |
|---|---|
| `index.html` 7.634.517 byte, gzip 2.362.704 byte. Satu berkas, jadi tiap rilis mengunduh ulang seluruhnya | Diukur |
| Cache service worker diberi nama `dnd-sheet-<hash index.html>`. Saat versi baru aktif, semua cache `dnd-sheet-` lain dihapus. Gambar disimpan di cache yang sama (cache pertama, simpan saat diambil). Akibatnya tiap rilis menghapus semua gambar yang sudah diunduh pengguna, padahal gambar jarang berubah | `sw.js` (1.894 byte) |
| `_headers`: `Cache-Control: no-cache` untuk semua berkas termasuk `img/`. Tidak ada `immutable` | `_headers` |
| Tidak ada cache versi sebelumnya yang disimpan. Bila rilis rusak, tidak ada yang bisa dikembalikan | `sw.js`, bagian `activate` |
| 199 pemakaian `innerHTML` di `app`, `builder`, `fx` | Dihitung |
| Perintah Home (`HCMD`) berupa daftar `[judul, kata kunci, selektor CSS]`. Menjalankan perintah berarti mengeklik elemen lewat selektor, jadi rapuh bila tampilan berubah | `15-logic-roster-backup-files-snapshots.js` baris 34 |
| Kampanye tersimpan sebagai teks di `S.camp` | `08-ui-render-sheet-and-actions.js` baris 2 |

| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N56 | Satu pintu HTML | 199 titik `innerHTML` menulis ulang node tiap render. Fokus, gulir, dan animasi terputus, dan INP naik di HP lemah. Rencana A1 (Trusted Types) sudah akan memindahkan semuanya ke satu kebijakan | Satu fungsi `setHTML(elemen, html)` menjadi pintu tunggal. Tugasnya: lewat kebijakan Trusted Types (A1), lewati penulisan bila HTML sama dengan penulisan terakhir, dan opsional ganti node yang berubah saja untuk daftar. Mulai dari elemen yang dipilih, bukan semua | INP dan Long Animation Frames (A10) sebelum dan sesudah di CPU 4x. Fokus dan posisi gulir tetap setelah render ulang. Tiga skenario sama. Risiko: elemen yang diubah kode lain di antara render tidak boleh dilewati, jadi tiap elemen didaftarkan dengan sengaja |
| N57 | Aturan meja per kampanye | Meja punya aturan rumah dan buku yang diizinkan. Sekarang kampanye hanya nama | Tabel pengaturan per kampanye dengan nilai awal sama dengan PHB 2024: cara HP (tetap atau lempar), buku yang diizinkan (mengisi langkah Sources di builder), cara menentukan skor, beban (varian), aturan critical, aturan diagonal dan flanking (untuk Training Ground). Disimpan di key baru `cs-camp-rules-v1` yang berisi nama kampanye ke aturan. `S.camp` tetap teks, jadi data lama tidak berubah. Mesin membaca lewat konteks N48 | Tanpa aturan, hasil sama persis dengan hari ini (master emas N49). Tiap aturan hanya mengubah angka yang dimaksud |
| N58 | Cache gambar tahan rilis | Tiap rilis menghapus semua gambar di perangkat pengguna dan mengunduhnya lagi | Cache gambar terpisah `dnd-art-v1` yang tidak ikut dihapus. `img/manifest.json` mendapat hash per berkas. Saat versi baru aktif, hanya gambar yang hash-nya berubah atau hilang yang dihapus dan diunduh. Fitur "Unduh gambar untuk offline" (rencana login) memakai selisih yang sama dan menampilkan progres. `_headers` boleh memberi `immutable` bila nama berkas membawa hash | Ukur byte yang diunduh ulang setelah satu rilis, sebelum dan sesudah (Playwright dengan service worker). Offline tetap jalan. Satu gambar diubah: hanya gambar itu yang diunduh |
| N59 | Rilis aman | 0.0.3 adalah rilis besar (CSP, IndexedDB, Workers). Bila rusak saat dibuka, pengguna terkunci dan tidak bisa kembali | Penjaga boot: penghitung percobaan boot di penyimpanan, dihapus setelah render pertama berhasil. Dua kali gagal berturut-turut: mode aman (efek dimatikan, sheet dasar tetap jalan) dengan tombol Back Up. Service worker menyimpan cache shell rilis sebelumnya satu versi dan bisa melayani itu bila penjaga memicu. Data lebih baru dari app lama dibekukan oleh `newerApp` dan `FROZEN` yang sudah ada | Sengaja membuat boot gagal dua kali di build uji: mode aman muncul, data utuh, Back Up jalan. Tes kembali ke shell sebelumnya. Tes app lama membaca data cap `_app` lebih baru: tidak menimpa |
| N60 | Uji mutasi dan pengecil kasus | Tes yang lolos belum tentu menangkap bug | Skrip membuat salinan sementara `src/` lalu menerapkan sekitar 40 mutasi kecil pada `derive()` dan builder (ubah `+` jadi `-`, ubah konstanta). Tiap mutasi harus ditangkap N49, N50, atau fuzzer. Yang lolos tanpa terdeteksi dilaporkan sebagai celah tes. Bila fuzzer menemukan karakter gagal, pengecil menghapus pilihan satu per satu sampai kasus terkecil yang masih gagal, lalu dilampirkan ke laporan bug (N18) | Mutasi yang ditanam sengaja terdeteksi minimal 90 persen. Pengecil menghasilkan kasus lebih kecil dan masih gagal |
| N61 | Daftar perintah tunggal | Perintah Home mengeklik elemen lewat selektor CSS, rapuh bila tampilan berubah. Learn dan tour butuh cara menunjuk fitur | Satu pendaftaran `{id, judul, kata kunci, jalankan, aktif}`. Dipakai pencarian Home, hasil Library, N45 peringkat, pintasan keyboard, Learn dan Anchor Spotlight (tunjuk lewat id), dan tautan dalam `#/c/<id>` lewat Navigation API | Semua entri `HCMD` dipindah dan tetap jalan. Perintah yang targetnya tidak ada disembunyikan. Tombol Back benar |
| N62 | Data terparse lebih cepat (ukur dulu) | Sekitar 3,9 MB data aturan dimuat sebagai kode JavaScript | Ukur dulu: waktu evaluasi objek literal lawan `JSON.parse` untuk blok terbesar (`wotc11` 1 MB, `dmgi` 600 KB) di CPU 4x lewat `tests/measure.py`. Bila `JSON.parse` lebih cepat lebih dari 30 persen, `build.py` mengubah blok besar menjadi string JSON. Klaim bahwa `JSON.parse` lebih cepat untuk data besar berasal dari pengetahuan umum, bukan dari pengukuran app ini | Angka sebelum dan sesudah, data hasil parse sama persis |

Keputusan user yang menunggu (N58): memecah build untuk hosting.
| Pilihan | Isi | Dampak |
|---|---|---|
| A: tetap satu berkas | Hanya N58 (cache gambar). Tiap rilis tetap mengunduh `index.html` 2,36 MB gzip | Sederhana, sesuai pernyataan proyek "satu file HTML" |
| B: satu berkas tetap utama, build kedua terpecah untuk hosting (`dist/`) | Blok data dan fx jadi berkas ber-hash yang di-cache lama. Rilis yang hanya mengubah kode app mengunduh jauh lebih sedikit | Dua bentuk harus dites. Berkas tunggal tetap jadi hasil akhir proyek |
| Saran | A dulu, ukur byte unduhan per rilis, lalu putuskan B | |

Urutan saran gelombang kedua: N58 dan N59 menjawab risiko rilis 0.0.3 (nilai terbesar), N56 bersama A1, N60 setelah N49, N57 dan N61 fitur untuk pemain, N62 hanya pengukuran.

### 3c. Gelombang ketiga (diusulkan 2026-10-30 07.12 WIB, N63 sampai N79)
Permintaan user: racik sebanyak-banyaknya, jangan membatasi kemampuan. Gelombang ini bertumpu pada pembacaan kode lebih dalam.

Fakta tambahan (dihitung dari `src/` hari ini):
| Temuan | Angka dan bukti |
|---|---|
| Tidak ada lapisan aksi. Penangan klik global (`19-ui-global-click-delegation.js`) mencampur tampilan dan logika. Tiap cabang memanggil `undoMark(label)`, mengubah `S`, memanggil `save()`, lalu `renderAll()` | 75 `undoMark`, 89 `save()`, 53 `renderAll`, 87 kunci `data-*` yang ditangani |
| Paket efek (`src/fx`, 24 berkas) membaca keadaan dari tampilan, bukan dari data. Ia memasang `MutationObserver` lalu membaca teks elemen | 64 `MutationObserver`, 213 `querySelector(All)`, 123 `getElementById`, 7 `parseInt(...textContent)` (contoh: bonus save Con dibaca dari teks `#saves [data-bd="save-CON"]`) |
| Antar bagian app hanya ada 1 kejadian kustom (`mi:rest`). Selebihnya lewat 119 pengait `window.__...` yang tidak terdaftar | Dihitung |
| Jurnal (`fx/18`) disimpan dengan kunci `"mi-jr-"+C.name`. Mengganti nama karakter membuat jurnal lama tidak terbaca, dan dua karakter bernama sama memakai satu jurnal. Isi dipotong 400 entri | `18-m-pack-rolls-concentration.js`, fungsi `who()` dan `J.key` |
| Rumus dadu ditulis ulang di beberapa tempat: `dieAvg` di builder, regex dadu di `08` (baris 96 dan 99) dan `21` (baris 58), `d6()` dengan `Math.random` di fx | Dicari |
| Prasyarat feat dicek lewat `preFail(nama, level, kunci)` yang mengembalikan teks, bukan data yang bisa dijelaskan | `09-logic-feats-and-choices.js` baris 225 |
| Data spell berupa baris larik posisi (`x[0]` nama, `x[1]` level, `x[3]` daftar class) | `spells-spell-list.js`, `24-ui-manage-spells.js` |
| Percabangan edisi 2014 tersebar | 21 `x14()` di `app` dan `builder` |
| Potret: ukuran dikecilkan lewat canvas ke JPEG 320 x 400. Metadata EXIF ikut hilang. Tidak perlu pembersih tambahan | `20-ui-portrait.js` |
| Meminta penyimpanan permanen sudah ada (`askPersist`) | `15-logic-roster-backup-files-snapshots.js` baris 156 |
| Konsentrasi: perintah save muncul dari fx (`conPrompt`) dan hitungan ronde ada. Jadi pelacak konsentrasi tidak dibuat ulang | `fx/18` baris 66 dan 76 |

Kelompok A: lapisan inti
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N63 | Aksi bernama dan bus kejadian | Logika tersebar di penangan klik dan tidak bisa dipanggil tanpa tampilan. Paket efek menebak keadaan dari tampilan | Pendaftaran aksi `act("cond.toggle", {k})`. Pembungkus tiap aksi mengurus `undoMark`, `save`, `renderAll`, dan memancarkan kejadian bertipe (`hp`, `cond`, `slot`, `roll`, `rest`, `level`). Dipindah bertahap (strangler): satu cabang klik satu langkah. Efek berlangganan kejadian, bukan lagi membaca teks tampilan. Antarmuka `__sheet` hanya baca untuk `D`, `S`, dan kejadian. Jurnal, Game Log (D3), N2, N4, N18, Training Ground, dan Learn berlangganan bus yang sama | Aksi dipanggil tanpa DOM dan menghasilkan `S` yang sama dengan klik. Tiap perubahan memancarkan satu kejadian. Screenshot efek tidak berubah. Jumlah `MutationObserver` turun, dicatat |
| N64 | Jurnal per ID karakter | Jurnal terputus saat nama diganti dan tercampur untuk nama sama | Kunci jurnal memakai ID karakter (`MYID`), bukan nama. Migrasi menyalin jurnal lama berkunci nama ke ID saat pertama dibuka, jurnal lama dibiarkan. Berlangganan bus N63. Kelak menjadi bagian N2 | Ganti nama: jurnal tetap. Dua karakter bernama sama: jurnal terpisah. Data Yudhi lama terbaca |
| N65 | Kontrak pengait | 119 pengait `window.__` tidak terdaftar, mudah putus tanpa ketahuan | Berkas `hooks.json` mendaftar tiap pengait, pemakainya, dan jenisnya (tes, efek, builder). Pemeriksaan di `build.py`: pengait baru tanpa pendaftaran gagal, pengait terdaftar yang hilang gagal. Tes kontrak memanggil tiap pengait yang dipakai tes | Menambah `window.__x` tanpa daftar membuat build gagal |

Kelompok B: aturan dan data
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N66 | Mesin ekspresi dadu | Rumus dadu ditulis ulang di banyak tempat dan tidak ada distribusi peluang | Satu berkas `src/engine/dice.js` bilangan bulat (N34): urai `2d6+3`, `4d6kh3`, kritis menggandakan dadu, Advantage dan Disadvantage, hitung rata-rata, ragam, dan distribusi pasti lewat konvolusi. Dipakai N10 chip peluang, N20 lensa peluang, Game Log, penskalaan spell, damage di Training Ground | Distribusi sama dengan hitungan semua kemungkinan untuk ekspresi sampai 4 dadu. Rata-rata sama dengan `dieAvg` lama |
| N67 | Prasyarat deklaratif | Pemain hanya melihat "prasyarat belum terpenuhi" tanpa tahu apa yang kurang | Prasyarat diurai dari teks data saat build menjadi bentuk data `{abilitas, level, class, feat}`. Yang tidak bisa diurai ditandai manual. Dipakai untuk "Terkunci karena: Strength 13 (kamu 12)" dan "buka dengan: naikkan Strength +1", juga oleh N1 Reverse Builder | Hasil lolos sama dengan `preFail` untuk semua feat. Jumlah prasyarat yang bisa diurai dilaporkan |
| N68 | Akses bertipe untuk data berbaris | Baris spell berupa larik posisi, rawan salah indeks | Berkas data memuat daftar kolom di kepala. Pengakses `spell(x).level` dibuat dari daftar itu. Build memeriksa panjang tiap baris sama dengan jumlah kolom | Baris dengan kolom kurang membuat build gagal. Hasil tampilan sama |
| N69 | Paket konten pengguna | Pemain ingin menambah item, spell, feat buatan sendiri tanpa mengubah kode | Format paket JSON berversi dengan skema N51. Impor dari berkas atau kode. Paket digabung ke data saat berjalan, diberi tanda "Homebrew" dan sumbernya. Tahap awal: item, spell, feat. Id paket diberi awalan agar tidak bentrok dengan N42 | Paket sah masuk dan muncul di Library dan builder. Paket rusak ditolak dengan nama bidang. Hapus paket: sheet yang memakainya tetap terbaca |
| N70 | Paket aturan berparameter | 21 percabangan `x14()` tersebar. Edisi 2014 ditunda user, tetapi akan menambah cabang | Aturan yang berbeda antar edisi (Exhaustion, dan seterusnya) dibaca dari objek `aturan` di konteks N48, bukan dari `x14()` di tengah rumus | Master emas sama persis untuk 2024. Satu aturan 2014 dites lewat konteks |
| N71 | Sidik jari isi | Perubahan terdeteksi dengan membandingkan JSON penuh. Salinan identik bisa menggeser salinan yang berguna | Hash bilangan bulat (sama dengan N35) dari `C` dan `S` per karakter. Dipakai untuk "ada perubahan belum disimpan", melewati snapshot yang isinya sama, dan mendeteksi apakah sinkron perlu menulis. Periksa dulu apakah `snTake` sudah melewati salinan identik | Snapshot tanpa perubahan tidak menambah slot. Satu perubahan kecil mengubah hash |

Kelompok C: pengiriman dan pengukuran
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N72 | Muat prediktif (ukur dulu) | Data builder dimuat saat dibutuhkan dan menunda kemunculan pertama | Ukur waktu Builder pertama dari `tests/measure.py`. Bila lambat: muat saat Home diam atau saat pemain mengarahkan atau memfokuskan tombol Build, hanya di luar mode hemat data | Waktu Builder pertama sebelum dan sesudah, tidak menambah waktu siap Home |

Kelompok D: mutu dan tes
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N73 | Peta cakupan aksi | 87 kunci `data-*` ditangani, tidak diketahui mana yang belum dites | Skrip mendaftar tiap kunci dari kode, membandingkan dengan kunci yang disentuh `tests/*.py` (lewat log klik), dan melaporkan yang belum dites | Laporan berisi jumlah dan daftar. Kunci baru tanpa tes muncul di laporan |
| N74 | Monyet berseed | Penguji manual tidak mengetuk kombinasi aneh | Dengan N63, ribuan urutan aksi acak berseed dijalankan tanpa tampilan, lalu sebagian dengan tampilan. Pemeriksa: HP antara 0 dan maksimum, angka `D` tidak NaN, tanpa galat di konsol, penyimpanan masih terbaca. Kegagalan dikecilkan oleh N60 dan masuk ke N18 | Seed sama menghasilkan urutan sama. Bug yang ditanam sengaja ditemukan |
| N75 | Kunci data | Data aturan bisa berubah diam-diam saat penyuntingan | `data.lock` menyimpan jumlah baris dan hash per blok data. Perubahan data tanpa memperbarui kunci membuat build gagal. Pembaruan kunci wajib disertai catatan sumber buku di `reports/` | Mengubah satu baris data: build gagal menunjuk blok. Tanpa perubahan: lolos |
| N79 | Indeks simbol | 40 lebih berkas berbagi satu ruang lingkup (IIFE). Hubungan fungsi tersirat dari urutan muat, sehingga sesi baru butuh waktu lama untuk paham | `tools/symbols.py` menghasilkan `reports/symbols.json`: nama, berkas dan baris definisi, berkas pemakai. Menandai fungsi yang tidak pernah dipanggil (bahan N31) | Daftar sama dengan hasil `grep` untuk sampel acak. Fungsi sengaja dihapus: pemakai yang tersisa terdeteksi |

Kelompok E: fitur pemain yang dimungkinkan engine
| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N76 | Pelajaran berpenilai otomatis | Learn menjelaskan, tetapi tidak menilai apakah pemain benar-benar bisa | Pelajaran memuat peta kecil lewat tautan replay (seed dan keadaan awal) di Training Ground. Tujuan ditulis sebagai pernyataan atas log kejadian ("serang tanpa memicu Opportunity Attack"). Reducer memeriksa log pemain dan memberi tanda selesai | Pelajaran dengan log benar lulus, log salah gagal dan menunjuk kejadian penyebab |
| N77 | Perbandingan berdampingan | Pemain sulit membandingkan dua build atau satu karakter sebelum dan sesudah level | Dengan `deriveFor` (N48), dua karakter atau dua titik N2 dihitung dan angka yang beda disorot (AC, HP, save, skill, serangan). Cocok untuk memilih antara dua build N22 | Selisih sama dengan hitungan tangan untuk dua karakter contoh |
| N78 | Impor dari PDF sheet berformulir (riset, lisensi dicek) | Pemain yang pindah dari PDF kehilangan data | Baca kolom formulir PDF di klien (pustaka seperti pdf-lib, dimuat belakangan) lalu isi builder. Nama kolom beda per sumber PDF, jadi dites dengan PDF milik user. Lisensi pustaka dan PDF dicek sebelum dipakai. Tidak mengirim berkas ke server | Impor PDF contoh menghasilkan angka sama dengan isi PDF |

Dicek dan sengaja tidak dibuat ulang: pembersih EXIF potret (sudah hilang lewat canvas), permintaan penyimpanan permanen (sudah ada), pelacak konsentrasi (sudah ada di fx).

Urutan saran gelombang ketiga:
| Urutan | Isi | Alasan |
|---|---|---|
| 1 | N63 dan N64 | Menghapus kerapuhan terbesar (efek membaca tampilan, jurnal terputus saat ganti nama). N63 membuka N74, N76, dan jalur Training Ground |
| 2 | N66, N75, N65, N68 | Murah, pengaman, tanpa perubahan tampilan |
| 3 | N67, N77, N71 | Nilai langsung untuk pemain |
| 4 | N73, N74, N79 | Mutu dan kecepatan kerja |
| 5 | N69, N70, N72, N76, N78 | Lebih besar atau bergantung pada keputusan lain |

## 4. Ketergantungan dengan rencana yang ada
| Rencana | Hubungan |
|---|---|
| N3 Struk angka (G3) | Lihat 6. N48 dan N49 harus ada lebih dulu supaya N3 bisa dibuktikan aman |
| N6 Rules fuzzer (G0) | N49 dan N50 memakai karakter dari fuzzer yang sama |
| N12 Gabung per bagian (G3) | N52 menjadi aturan gabung untuk bidang angka |
| N2 Mesin waktu dan N18 (G0 dan G3) | Tidak berubah. N52 sengaja tidak memakai log kejadian |
| N1, N22, N29, N45, TG | Memakai N53 |
| A1 CSP dan Trusted Types (G1) | N56 memakai kebijakan A1 sebagai pintu tunggal |
| A10 pengukuran (G0) | N56 dan N62 diukur dengan INP, Long Animation Frames, dan `tests/measure.py` |
| Rencana login, tombol Unduh gambar offline | Memakai selisih hash N58 |
| Navigation API (A6) | N61 |
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

## 3d. Gelombang keempat: N80 sampai N89 (2026-10-30, rancangan)
Status: rancangan. Belum ada kode. Semua mengikuti syarat tetap: tanpa AI berbayar, paket gratis, data karakter tidak berubah bentuk tanpa migrasi, tes Playwright di 390 x 844 dan 1250 x 850 dengan tiga skenario wajib.
Dasar temuan kode (dicek 2026-10-30): PDF dibuat dari tangkapan layar html2canvas 1.4.1 dan jsPDF 2.5.1 yang dimuat dari cdnjs (src/app/37, baris 3 dan 4). Artinya PDF butuh internet saat pertama kali dan teksnya berupa gambar. Generator QR dan pembagi bingkai QR sudah buatan sendiri (src/app/42, QRG, qrFrames, qrHash).

| Kode | Nama | Masalah | Cara kerja | Tes |
|---|---|---|---|---|
| N80 | PDF vektor dari data | PDF sekarang berupa gambar dan bergantung pada dua pustaka dari CDN. Offline pertama kali gagal. Teks tidak bisa dipilih atau dicari | Penulis PDF kecil buatan sendiri (objek, font standar, teks, garis, kotak) yang membaca hasil derive() dan tata letak sheet cetak. Satu sampai dua halaman, ukuran puluhan KB. Pustaka CDN dilepas bila hasil setara | Teks bisa dipilih. Ukuran file turun. Isi sama dengan sheet untuk tiga skenario wajib. Tampilan dibandingkan dengan PDF lama |
| N81 | Selisih ke cloud | Sinkron mengirim blob penuh dan dibatasi 32 KB untuk prefs | Pakai selisih per bagian dari N52. Kirim hanya bagian yang berubah beserta versi bagian | Dua perangkat mengubah bagian berbeda, hasil gabungan benar. Ukuran kiriman turun |
| N82 | Berkas cadangan bertanda | Berkas cadangan terpotong atau rusak baru ketahuan saat dipulihkan | Setiap berkas cadangan memuat hash isi (SHA-256 lewat WebCrypto). Pulihkan menolak berkas yang hash-nya tidak cocok dan menunjukkan bagian yang rusak | Potong atau ubah satu byte, pulihkan ditolak dengan pesan jelas |
| N83 | toSheet murni | Builder menulis ke sheet lewat jalur yang sulit diuji | toSheet jadi fungsi murni (pilihan builder masuk, karakter keluar). Hasilnya dibandingkan dengan master emas N49 | 3 skenario wajib dan 20 build acak menghasilkan karakter yang sama persis dengan master |
| N84 | Antrean kerja saat diam | Kerja non-kritis (render panel tersembunyi, menyiapkan ikon, indeks pencarian) berebut dengan input pengguna | Satu antrean dengan prioritas. Berjalan di requestIdleCallback, tiap tugas dipecah kecil. scheduler.yield dipakai bila ada, setTimeout bila tidak | Waktu tunggu input (INP) di HP lambat (CPU diperlambat 4x) sebelum dan sesudah |
| N85 | Ringkasan sejak sesi lalu | Pemain lupa apa yang berubah di sheet sejak sesi sebelumnya | Dari jejak selisih N52 dan jurnal N64, tampilkan satu kartu di Home: HP, slot, item, level yang berubah. Bisa ditutup | Ubah lima hal, tutup app, buka lagi. Kartu menyebut kelimanya |
| N86 | Label bicara dari struk angka | Pembaca layar hanya mendengar angka tanpa asal | Pakai catatan asal angka di B (part(l,v,note)) untuk aria-label: "AC 17: armor 13, Dexterity 4". Dibuat otomatis, tanpa teks tulis tangan | Tes a11y_scan.py ditambah: tiap angka utama punya label asal. Dicek di tiga skenario |
| N87 | Anggaran kelancaran per layar | Ada anggaran ukuran (N54) tapi belum ada anggaran waktu | Playwright merekam Long Animation Frames dan waktu respons ketuk per layar. Build gagal bila melewati batas yang ditulis di berkas | Batas awal diukur dari rilis sekarang, lalu dikunci |
| N88 | Penjaga kuota | Gambar bisa mencapai 74 MB di cache dan penyimpanan penuh membuat simpan gagal diam-diam | navigator.storage.estimate dibaca saat boot dan sesudah cache gambar bertambah. Di atas 80 persen: kartu peringatan, tombol bersihkan cache gambar saja. Data karakter tidak disentuh | Kuota dipalsukan di Playwright, kartu muncul, cache gambar terhapus, karakter utuh |
| N89 | Pemburu kode mati | index.html 7,6 MB, sebagian kode dan CSS mungkin tidak pernah jalan (melanjutkan N31) | Tes jalankan seluruh alur dengan cakupan kode Chromium (JS dan CSS coverage), keluarkan daftar fungsi dan aturan yang tidak pernah disentuh. Hanya melapor, penghapusan lewat izin | Daftar dihasilkan untuk tiga skenario wajib. Tiap kandidat dicek manual sebelum dibuang |

Urutan saran: N88 dan N82 (kecil, lindungi data), N86 dan N87 (ukur dan aksesibilitas), N84, N85, N83, N81, N80, N89.
Belum terverifikasi: apakah html2canvas bisa dilepas tanpa selisih tampilan (N80 perlu uji banding), dan apakah SHA-256 WebCrypto jalan di semua HP target (dukungan luas, belum diukur di sini).

## 3e. Gelombang kelima: N90 sampai N98 (2026-10-30, dari riset jam 1 dan 2)
Status: rancangan, dengan prototipe di tools/research/ (di luar app). Tidak ada kode app diubah. Bukti ada di reports/laporan-riset-1.md dan laporan-riset-2.md.

| Kode | Nama | Masalah yang terukur | Cara kerja | Prototipe atau bukti | Status |
|---|---|---|---|---|---|
| N90 | Pembersih teks berbasis DOM | Kebijakan Trusted Types memotong teks sah ("once = 1" menjadi hilang). 5 dari 21 teks sah rusak, 1 dari 25 payload lolos ke eksekusi | Urai dengan template, buang elemen dan atribut berbahaya dari DOM. Butuh satu kebijakan bernama kedua (hanya mengembalikan string) di daftar trusted-types CSP | tools/research/sanitize-proto.py: 0 teks sah rusak, 0 payload jalan | Permintaan di requests.md (Logic) |
| N80 | PDF vektor dari data | PDF sekarang 1,38 MB, 6,8 detik, 0 teks bisa dipilih | Penulis PDF kecil membaca hasil derive(). Font bawaan PDF | tools/research/pdf-proto.mjs: 4.515 byte, 8 ms, 4.764 karakter bisa dipilih. Tata letak sederhana, belum sama dengan sheet cetak | Rancangan, siap dikerjakan |
| N19 | Peta angka dari catatan asal | Pemain tidak tahu ability mana memengaruhi angka mana | Graf dari breakdown B yang sudah ada. Kode derive tidak berubah | Uji kejujuran: 60 karakter acak x 6 ability, 2.134 angka berubah, 2.134 dijelaskan breakdown (0 terlewat), 32 dijelaskan tapi tidak berubah (batas seperti DEX maksimal 2) | Rancangan, data siap |
| N92 | Tes metamorfik resmi | Sifat baru baru berupa skrip riset | tests/metamorphic.py dari meta.py dan meta2.py | 800 karakter, 0 pelanggaran, kanari aktif | Siap dikerjakan |
| N93 | Anggaran muat di CPU 4x | Tidak ada angka muat yang dikunci | Batas dari angka 2026-10-30: Home terlihat 1,5 detik, DOM siap 2,7 detik, terblokir 1,8 detik | tools/research/load.py, tti.py, trace.py | Rancangan |
| N91 | Muat berlapis | Memisahkan 5,2 MB blok tunda mempercepat DOM siap 3 kali, tapi cat pertama hampir sama | Pecah build (pilihan B di N58) dan cangkang Home kecil. Ukur lagi dengan N93 | Percobaan batas atas di laporan 1 | Menunggu keputusan A atau B |
| N94 | Korpus teks sah | Tidak ada uji bahwa teks pemain tampil utuh | 100 teks di tiap kolom, tampil harus sama | 21 teks di prototipe N90 sebagai awal | Rancangan |
| N95 | Uji kejujuran struk angka | Penjelasan bisa tertinggal dari perhitungan saat aturan baru ditambah | tests/explain_truth.py dari truth2.py, masuk regresi. Gagal bila angka berubah tanpa penjelasan | 2.134 dari 2.134 | Siap dikerjakan |
| N96 | Build direproduksi | Tidak ada tes yang menjaga hash build | tests/repro_build.py: build dua kali, hash harus sama dan sama dengan index.html di repo | Sudah benar hari ini (f9c70004cebd5f74 tiga kali) | Siap dikerjakan |
| N97 | Peta batas jaringan | Tidak ada tes bahwa sheet tidak memanggil jaringan | tests/net_zero.py: 0 permintaan eksternal di alur sheet, builder, Learn, Training Ground | 34 same-origin, 0 eksternal di alur sheet | Siap dikerjakan |
| N98 | Layar pemulihan teruji | Bila kunci penyimpanan rusak, app membuka karakter kosong tanpa layar pemulihan di uji saya | Perlu penjelasan pemilik bagian Logic: apakah BAD seharusnya memunculkan layar pemulihan di jalur ini | tools/research/corrupt.py, hasil belum pasti | Pertanyaan terbuka |

Dikoreksi oleh bukti:
| Item | Koreksi |
|---|---|
| N53 pekerja untuk derive | Tidak perlu. derive 0,5 sampai 0,85 ms, maksimum 7,7 ms di CPU 6x pelan |
| Klaim "muat awal kelemahan terbesar" | Home terlihat 1,5 detik di CPU 4x. Yang berat adalah thread terblokir 1,8 detik sesudahnya |
| Kebocoran memori | Tidak ditemukan. 10 putaran: node 5,3 sampai 5,7 ribu, heap 15 sampai 17 MB, pindah tab 30 sampai 60 ms |

## 3f. Syarat kinerja: minimum 60 fps di keadaan normal (dari user, 2026-10-30 08.29 WIB)
Syarat berlaku untuk semua fitur baru dan perubahan. Rilis tidak boleh menurunkan angka di bawah ini.
| Hal | Ketentuan (usul, menunggu persetujuan) |
|---|---|
| Keadaan normal | Layar 60 Hz, HP kelas menengah. Proksi uji: Chromium dengan CPU 4x lebih pelan, viewport 390 x 844 dan 1250 x 850 |
| Lulus | Rata-rata 58 fps atau lebih per skenario, paling banyak 5 persen frame lebih dari 16,7 ms, tidak ada frame lebih dari 100 ms |
| Skenario | Home diam, sheet diam, gulir sheet, pindah tab, damage dan heal, buka Learn dan satu tempat, Training Ground (gerak token, serangan), dadu 3D, builder (pindah langkah) |
| Efek | Bila tidak lulus, N14 menurunkan tingkat efek otomatis. Setelan pengguna menang |
| Penjaga | N99: tests/fps_budget.py, masuk regresi. N93 dan N87 memakai skrip yang sama |

### Ukuran awal (build main 0.0.4, Chromium headless, 390 x 844)
| Skenario | CPU 1x | CPU 4x |
|---|---|---|
| Home diam 3 detik | 60,0 fps, 0 persen lambat | 60,0 fps, 0 persen |
| Sheet diam 3 detik | 60,0 fps, 0 persen | 60,0 fps, 0 persen |
| Gulir sheet | 57,5 fps, 1 frame 133 ms | 60,0 fps, 0 persen |
| Pindah tab x18 | 58,9 fps, terburuk 50 ms | 46,5 fps, 18 persen frame lebih dari 16,7 ms, 8 persen lebih dari 33 ms, terburuk 133 ms |
| Damage dan heal x4 | 58,5 fps, terburuk 50 ms | 47,7 fps, 12 persen lambat, terburuk 183 ms |
Hasil: lulus untuk diam dan gulir. Gagal di CPU 4x untuk pindah tab dan damage atau heal. Di CPU 1x ada satu hentakan 133 ms saat gulir.
Belum diukur: Learn, Training Ground, dadu 3D, builder, layar 90 atau 120 Hz. Batas: Chromium headless (rasterisasi perangkat lunak), bukan HP asli, dan 4x adalah tebakan untuk HP menengah.
Akibat untuk rencana: N84 (antrean kerja saat diam), N14, dan N87 naik prioritas. Penyebab hentakan di pindah tab belum diselidiki.

## 3g. Keputusan 60 fps pada CPU 4x dan hasil percobaan pertama (2026-10-30, user: "minimum 60fps pokoknya")
Definisi lulus yang dipakai: CPU 4x (emulasi Chrome), 390 x 844 dan 1250 x 850, rata-rata 58 fps atau lebih, paling banyak 5% frame di atas 16,7 ms, tidak ada frame di atas 100 ms. Ini revisi usulan 3f. Status: belum lulus.

### Hasil ukur di salinan build main 0.0.4 (390 x 844, CPU 4x)
Tidak ada kode app yang diubah. Semua percobaan memakai localStorage atau CSS yang disuntikkan di salinan.
| Kondisi | Pindah tab (fps) | Damage dan heal (fps) |
|---|---|---|
| Kontrol: halaman kosong dengan klik | 60,0 | 60,0 |
| Asal (mi-fx default) | 44,0 | 43,6 |
| mi-fx lite | 44,6 | 52,6 |
| mi-fx off | 51,1 | 55,1 |
| Tanpa animasi dan transisi CSS | 53,0 | 52,4 |
| mi-fx off + tanpa animasi CSS | 52,7 sampai 55,5 | 54,7 sampai 56,9 |
| Tanpa bayangan, filter, backdrop | 43,9 | 44,2 |
| Sembunyikan kanvas efek | 45,9 | 47,2 |
| Tanpa View Transitions | 45,3 | 44,0 |
| contain pada halaman pager | 42,6 | 46,6 |
| content-visibility pada halaman pager | 45,2 | 47,2 |
| Tanpa scroll-timeline, scroll-snap, will-change, sticky, atau band atas (di atas mi-fx off + tanpa animasi) | 53,2 sampai 55,4 | 54,7 sampai 56,9 |
Selisih antar percobaan 2 fps atau kurang berada dalam derau ukur.

### Temuan
1. Alat ukur sehat: halaman kosong 60 fps di CPU 4x. Batas 55 fps datang dari app.
2. Di lebar HP semua 9 halaman sheet ada di layout sekaligus (pager geser, sekitar 2.300 elemen terlihat dari 3.042). Pindah tab = geser pager, bukan display:none.
3. Biaya terbesar ada di dua tempat: lapisan efek (JS rAF dan MutationObserver) dan animasi atau transisi CSS. Mematikan keduanya menaikkan dari 44 ke sekitar 55 fps.
4. Skrip pada damage dan heal: 321 ms dengan efek, 104 ms tanpa efek (Long Animation Frames, CPU 4x). Pada pindah tab, tanpa efek sisanya style dan layout native (591 ms dari 976 ms total frame panjang) dan skrip hanya 29 ms.
5. Bukan penyebab (diukur, hasil sama dengan asal): bayangan, filter, backdrop-filter, View Transitions, content-visibility, contain, scroll-timeline, scroll-snap, band atas.
6. Sisa 3 sampai 10% frame lambat jatuh pada frame yang memuat klik. Pemicu spesifik belum ditemukan.

### Usul perubahan (belum dikerjakan, butuh izin dan pemilik bagian)
| No | Usul | Pemilik | Perkiraan |
|---|---|---|---|
| F1 | Tier perangkat lemah (N14) memaksa mi-fx = off pada frame lambat berulang, bukan hanya lite | UI/UX | +7 fps pindah tab, +11 damage |
| F2 | Animasi dan transisi CSS hanya pada elemen yang sedang berinteraksi, bukan global. Matikan `.enter` dan transisi panjang pada tier lemah | UI/UX | +9 fps pindah tab |
| F3 | Periksa pemicu layout pada klik pindah tab (pCur, penanda tab, navShow memanggil offsetLeft setelah menulis style) | UI/UX | belum diukur |
| F4 | Tes N99 tests/fps_budget.py memakai definisi lulus di atas, jalan di CI | Checker | mengunci hasil |
Setelah F1 sampai F3 dipasang, ukur ulang. Jika masih di bawah 58 fps, langkah berikutnya adalah menjejak satu klik dengan Chrome trace (Layout, Paint, Commit) pada salinan.

### Batas yang harus diketahui
Chromium headless memakai rasterisasi perangkat lunak. HP asli dengan GPU bisa lebih cepat atau lebih lambat. Faktor 4x adalah tebakan untuk HP kelas menengah. Belum diukur: Learn, Training Ground, dadu 3D, builder, 1250 x 850, layar 90 atau 120 Hz, Safari, Firefox. Syarat 60 fps pada CPU 4x belum terbukti bisa dicapai. Hasil terbaik saya sejauh ini 55 sampai 57 fps.
Skrip: tools/research/abl2.py, abl3.py, abl4.py (lepas-pasang), loaf.py (Long Animation Frames), prof.py (profil CPU), ctl.py (kontrol).
