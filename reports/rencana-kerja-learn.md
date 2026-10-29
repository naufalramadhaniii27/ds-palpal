# Rencana kerja Learn: Hoot's Training Grounds (2026-10-29)

Gabungan seluruh riset dan keputusan di claude/rencana-menu-learn.md (U1 sampai U37). Dokumen ini urutan kerjanya. Detail kamus, panduan bahasa, dan sumber tetap di rencana-menu-learn.md.

## Tujuan dan batas
| Hal | Keputusan |
|---|---|
| Pengguna | Orang awam, remaja dan dewasa, yang belum pernah main game peran |
| Patokan bahasa | Bacaan anak 10 tahun (jenjang B3 dan C Kemendikbudristek). Nada santai untuk dewasa, tidak kekanak-kanakan |
| Bahasa | English (bawaan) dan Bahasa Indonesia, khusus Learn |
| Aturan | D&D 2024 saja, dicocokkan ke Library app |
| Bentuk | Belajar interaktif, bukan komik. Tanpa suara. Visual dulu |
| Gambar | Claude jalan duluan dengan gambar sementara. Gambar Codex (batch 234 sampai 236) dipasang begitu jadi |
| Tidak dibuat | Komik, tombol "Read to me", Family Mode, track khusus DM |

## Ukuran berhasil
| Ukuran | Target | Cara ukur |
|---|---|---|
| Selesai Jalur Inti tanpa dibantu | Orang awam di uji main | U21 |
| Paham | 4 dari 5 pertanyaan inti benar | Kuis akhir Jalur Inti di uji main |
| Waktu Jalur Inti | Sekitar 15 menit, maksimal 20 | Uji main dan corong Admin |
| Berhenti di tengah | Kurang dari 20 persen per tempat | Corong Admin (angka total saja) |
| Teks | 100 persen kalimat lolos cek keterbacaan | Tes Checker U13 |

## 12 prinsip desain (ringkasan riset)
| No | Prinsip | Dasar riset | Usulan |
|---|---|---|---|
| 1 | Satu hal per tempat, Jalur Inti pendek, sisanya bonus | AERO, The Angry GM, GDevelop | U14 |
| 2 | Pola tetap: Tebak, Lihat, Coba bareng, Coba sendiri, Kenapa, Find it on your sheet | AERO, IES (kuis, pertanyaan kenapa), worked example | U33, U24 |
| 3 | Tunjukkan, jangan tulis. Hoot memperagakan, tangan bayangan menunjuk | READISTANCE, keputusan tanpa suara | U29, U17 |
| 4 | Maksimal 2 kalimat per langkah, kata menempel di gambar | Nielsen Norman Group, IES | U11, U35 |
| 5 | Hitungan konkret, gambar, lalu angka seperti di sheet | CPA Singapura, IES | U34, U16 |
| 6 | Nama ramah dulu, istilah buku di sampingnya, dicocokkan ke Library | Riset pemain baru, Library app | U6, U15 |
| 7 | Umpan balik menyebut langkah yang benar. Tidak ada "salah", petunjuk lalu coba lagi | EEF | U22, U36 |
| 8 | Ide kreatif dihargai, lebih dari satu jawaban benar | Ulasan Adventure Begins | U32 |
| 9 | Pakai karakter sendiri, selalu kembali ke sheet | Riset pemain baru (mencari angka di sheet) | U1, U24 |
| 10 | Ulang dengan jeda: recap paling cepat sehari setelahnya | IES (jeda dan kuis) | U26, U36 |
| 11 | Tanpa pancingan, tanpa nilai dan peringkat antarpemain | Finlandia, PP Tunas | U30, U37 |
| 12 | Jalan di semua kondisi app: offline, Motion off, Calm, kontras tinggi, pembaca layar, tombol 48 piksel | Aturan app | U23 |

## Teknologi interaktif (riset 2026-10-29)
Dasar: app sekarang 7,6 MB (2,36 MB gzip), satu file HTML, tanpa library animasi. Pola yang sudah ada di kode dipakai ulang.

| Bagian | Pilihan | Alasan | Dipakai ulang dari kode |
|---|---|---|---|
| Geser kepingan, token, dadu | Pointer Events: setPointerCapture, `touch-action:none` hanya di benda yang digeser, ambang gerak sebelum mulai geser, `overflow-anchor:none` di area gulir | Satu cara untuk jari dan mouse. Tidak bentrok dengan scroll dan swipe app | Geser di 13 (bottom sheet), 27 (Library), 37 (hold and slide), 39 (HP drag) |
| Pengganti geser (WCAG 2.2 SC 2.5.7, level AA) | Setiap geser punya cara ketuk: ketuk benda lalu ketuk tujuan, atau tombol + dan − | Wajib di WCAG 2.2. Juga membantu orang yang sulit menggeser | Library sudah punya tombol Add selain geser |
| Keyboard | Enter atau Spasi mengangkat, panah memindah, Enter menaruh, Esc batal | Pola papan permainan yang aksesibel | Tombol app sudah fokus dengan Tab |
| Animasi dadu | Dadu 2D dari SVG (bentuk d4 sampai d20) dengan putar dan skala CSS, angka berganti cepat lalu berhenti | 0 KB tambahan. CSS 3D hanya mudah untuk kubus (d6). Dadu 3D WebGL butuh library 3D dan fisika ratusan KB dan berat di HP murah | Ikon d20 di 07 |
| Peragaan Hoot dan tangan bayangan | CSS transform dan opacity, urutan langkah dengan Web Animations API | 0 KB, jalan di luar thread utama. Lottie (sekitar 50 KB runtime) dan Rive (sekitar 200 KB) tidak perlu karena gambar Codex berupa gambar diam | Pola gerak di 19 dan 23 sampai 27 (fx) |
| Motion off dan reduced motion | Peragaan berubah jadi langkah diam bernomor dengan panah. Dadu langsung menampilkan hasil | Aturan app | `REDUCE` di 07, 29-motion-off.css |
| Grid giliran (Forest) | Elemen HTML: `role="grid"`, tiap kotak tombol berlabel, ketuk kotak tujuan untuk jalan, hasil diumumkan lewat `aria-live="polite"` | Canvas tidak terbaca pembaca layar dan tidak ikut zoom | Live region `ordLive` di 40 |
| Sorot sheet | Pindah tab sheet bila perlu, gulir ke elemen, sorot, kembali ke Learn. Bila elemen tidak ada (misal karakter tanpa spell), tampil penjelasan pengganti | Angka bisa ada di tab lain atau di luar layar | `setTab` di 21, tour di 31 |
| Pindah tempat | View Transitions bila didukung, tanpa animasi bila tidak | Sudah dipakai app | Pindah tab di 21 |
| Getar dan suara | `buzz()` dan setelan suara app | Ikut pilihan pengguna | 09, setelan mi-bz dan mi-snd |
| Pemuatan | Blok `data-defer`, dimuat saat Learn dibuka | App tidak lebih lambat dibuka | build.py sudah mendukung `data-defer` |
| Batas ukuran | Kode dan data Learn maksimal 300 KB mentah. Screenshot AVIF sebagai file terpisah, bukan di dalam HTML | Menjaga app tetap cepat | |

### Fitur web terbaru (dicek ke Baseline dan Interop 2026)
Aturan: fitur Baseline dipakai langsung dengan cadangan `@supports` untuk HP lama (iPhone yang masih iOS 18 belum punya anchor positioning). Fitur yang belum Baseline hanya jadi tambahan. App sudah memakai View Transitions, `:has()`, container queries, `@starting-style` dan scroll-driven animations dengan `@supports`.

| Fitur | Status | Dipakai untuk | Cadangan |
|---|---|---|---|
| CSS anchor positioning | Baseline Januari 2026 (Firefox 147, Safari 26, Chrome 125) | Label yang menempel di gambar (U35), kotak Hoot di samping elemen yang disorot di sheet dan builder, tanpa menghitung posisi dengan JS | Posisi dihitung JS seperti tour lama |
| Popover API | Baseline Januari 2025 | Kartu kamus, "When you're stuck", "Playing together". Tampil di top layer, jadi tidak perlu trik z-index dan tidak terhalang Home yang inert | Tidak perlu |
| Invoker commands (`command`, `commandfor`) | Baseline Desember 2025 | Tombol buka dan tutup popover tanpa JS | Delegasi klik app yang ada |
| View Transitions (satu dokumen) | Baseline Oktober 2025 | Pindah langkah dan pindah tempat, dadu "terbang" ke kotak hasil | Tanpa animasi |
| `@starting-style` | Baseline Agustus 2024 | Animasi muncul kartu dan kepingan tanpa JS | Muncul langsung |
| Container queries | Baseline | Layar tantangan menyesuaikan lebar panel, bukan lebar layar | Tidak perlu |
| Scroll snap | Interop 2026 | Peta lembah dan daftar tempat di HP | Gulir biasa |
| Navigation API | Baseline 2026 | Tombol Back HP mundur satu langkah di Learn, bukan keluar app | `hashchange` seperti sekarang |
| Custom Highlight API | Baseline 2026 | Menandai kata kamus di teks Hoot tanpa membungkus tiap kata | Garis bawah biasa |
| Scroll-driven animations | Belum Baseline (Firefox belum) | Gerak parallax peta, hanya tambahan | Peta diam |
| Interest invokers, `popover="hint"` | Belum Baseline | Tidak dipakai | |
| WebGPU, WebGL, Lottie, Rive | Tersedia tapi berat untuk kebutuhan ini | Tidak dipakai | |

## Tahap kerja
Setiap tahap selesai dengan tes. Rilis digabung (0.0.3), daftar rilis dikirim ke user sebelum push ke main.

### F0 Fondasi
| Isi | File |
|---|---|
| Struktur data dua bahasa: tiap teks punya kunci en dan id (U20) | src/app/45-data-learn.js (baru) |
| Penyimpanan progres, bahasa, waktu recap. Key baru `cs-learn-v1`, tidak mengubah key lama. Ikut sinkron cloud lewat daftar prefs (PF_KEYS) | src/app/46-logic-learn.js (baru), src/app/43-logic-cloud-sync.js (satu baris PF_KEYS) |
| Pintu masuk: tombol Learn di Home, rute #learn, tombol Back | src/app/47-ui-learn.js (baru), src/css/36-learn.css (baru) |
| Pilihan bahasa EN/ID di header Learn | 47 |
| Gambar sementara dari app, slot gambar Codex dengan fallback | 47, 36 |
| Learn dimuat belakangan, cara yang sama dengan builder (mekanisme tunda di 01-logic-boot-flags-builder-loader.js), supaya app tidak lebih lambat dibuka | 01, build.py |
| Offline: service worker hanya menyimpan gambar yang pernah dibuka. Saat Learn dibuka, gambar Learn diminta sekali supaya tersimpan. Gambar yang belum ada diganti kotak warna dengan label | 47, sw.js tidak diubah |
| Cek keterbacaan otomatis lebih dulu, supaya semua teks berikutnya langsung dicek: panjang kalimat, kata kaku Indonesia, istilah di luar kamus (U13, U28) | tests/learn_text.py (baru) |
| Selesai bila | Learn terbuka dan tertutup di 390x844 dan 1250x850, bahasa tersimpan setelah reload, tiga skenario wajib tidak berubah |

### F1 Mesin tantangan
Komponen dipakai ulang oleh semua tempat.
| Komponen | Isi | Usulan |
|---|---|---|
| Langkah Tebak | Satu soal sebelum belajar, jawaban apa pun lanjut | U33 |
| Langkah Lihat | Hoot memperagakan, tangan bayangan menunjuk, bisa diulang | U29 |
| Langkah Coba bareng dan Coba sendiri | Petunjuk muncul setelah salah satu kali, hilang di Coba sendiri. Tanpa batas waktu | U22, U33 |
| Langkah Kenapa | Pilih satu dari tiga alasan | U33 |
| Find it on your sheet | Buka sheet sendiri, sorot angkanya, tampilkan nama ramah dan label buku | U24 |
| Dadu dan bonus CPA | Dadu dilempar dan kepingan bonus digeser, lalu gambar batang, lalu "12 + 3 = 15". Hasil sama dengan target tetap berhasil | U34 |
| Label menempel | Label pendek di samping bagian gambar | U35 |
| Umpan balik | Kalimat menyebut langkah yang benar, XP tidak pernah berkurang | U36 |
| Kamus | Kata bergaris bisa diketuk, membuka entri Library yang sama | U6 |
| Tombol "I know this" | Lewati tempat, ditandai selesai tanpa XP penuh | U11 |
| Selesai bila | Satu tempat contoh jalan dari awal sampai akhir dengan semua komponen, di dua ukuran layar, dua bahasa, Motion off dan kontras tinggi |

### F2 Jalur Inti (5 tempat)
| Urutan | Tempat | Isi | Tambahan |
|---|---|---|---|
| 1 | Tavern | D&D itu cerita bersama. Story Guide bercerita, kamu bilang apa yang kamu lakukan | Kartu "Playing together" (U25). Beberapa jawaban benar (U32) |
| 2 | Rooftops | d20, tambah bonus, capai angka target | Contoh "Pas" |
| 3 | Forest | Giliranmu: jalan, lalu satu aksi utama (nama aksi 2024) | Grid besar, geser jalan |
| 4 | Campsite | HP turun saat kena, naik saat istirahat | 0 HP diarahkan ke Tempat Bonus |
| 5 | Market | Ngobrol dan melihat-lihat juga bagian main | Kartu "When you're stuck" (U10). Beberapa jawaban benar (U32) |
| Akhir | Kuis 5 pertanyaan inti, kartu "Take a break?", saran Forge Your Hero | | |
| Selesai bila | Jalur Inti selesai dalam satu sesi tes Playwright dengan karakter Yudhi, karakter dari Apply, dan karakter baru. Semua teks lolos cek F0 |

### F3 Forge Your Hero
| Isi | Usulan |
|---|---|
| Quick Hero: memakai Quick Build yang sudah ada, ditambah pilihan background, potret dan "Surprise me", kartu class bergambar | U31 (menggantikan 6 pahlawan jadi di U18) |
| Screenshot interaktif builder dengan titik bernomor, dibuat oleh Playwright untuk HP dan PC. Dijalankan di workspace Claude lalu file AVIF di-commit, karena build Cloudflare Pages hanya menyalin file | tools/learn_shots.py (baru), img/learn/shots/ |
| Try it for real: builder asli dengan mode panduan, karakter latihan bertanda Practice, Keep atau Discard di akhir (pakai ask()). Tour yang ada (31-ui-tour-and-focus.js) hanya daftar langkah tetap untuk Home, jadi dijadikan mesin sorot umum yang bisa dipakai di builder dan di "Find it on your sheet". Builder ada di dokumen yang sama, jadi bisa disorot langsung | U1, 31 |
| Selesai bila | Karakter Quick Hero bisa di-Apply ke sheet. Practice yang di-Discard tidak meninggalkan data. Tes gagal bila titik screenshot kehilangan elemennya |

### F4 Tempat Bonus (urut prioritas)
| Urutan | Tempat | Isi |
|---|---|---|
| 1 | Meet your dice | d4 sampai d20 dan cara membacanya (U27) |
| 2 | Windy Cliff | Advantage dan Disadvantage, saling batal. Heroic Inspiration = lempar ulang (aturan 2024) |
| 3 | Village Green | Score lawan bonus, Training Bonus, bonus minus dengan garis bilangan (U8, U16) |
| 4 | Training Yard | Kena lalu damage. Critical Hit hanya untuk serangan (U8) |
| 5 | Campsite 2 | 0 HP, death save, Hit Point Dice |
| 6 | Forest 2 | Bonus Action dan Reaction |
| 7 | Meadow | Conditions |
| 8 | Wizard Tower 1 | Cantrip dan spell slot (U9) |
| 9 | Wizard Tower 2 | Prepared spells dan concentration (U9) |
| 10 | Crumbling Bridge | Ujian akhir, bisa diulang, jalan cerita acak (U4) |
| Selesai bila | Tiap tempat lolos tes yang sama dengan F2. Urutan bebas |

### F5 Penghubung ke app
| Isi | Usulan |
|---|---|
| Tombol "Learn this" di penjelasan aturan sheet, langsung ke tempat yang cocok | U2 |
| Alat "Which die do I roll?" dari karakter sendiri, di Learn dan sheet | U7 |
| Contekan meja: satu halaman ringkas untuk sesi berjalan | U3 |
| Quick recap: 2 soal, muncul paling cepat sehari setelah belajar, opsional | U26, U36 |
| Corong di tab Admin: jumlah orang per tempat, angka total saja. Progres sudah ikut sinkron lewat prefs (batas 32 KB, progres jauh lebih kecil). Siklus harian server menghitung total dari prefs ke tabel kecil, Admin hanya membaca totalnya | U12, U30, functions/api/[[path]].js, tests/api_social.py |
| Selesai bila | Tiga skenario wajib lolos, sheet tidak berubah perilaku tanpa Learn dibuka |

### F6 Gambar Codex
| Isi |
|---|
| Ganti gambar sementara dengan batch 234 (scene, sampul, pose Hoot), 235 (ikon konsep, lencana track), 236 (peta, ujian akhir, lencana, pose Sela) begitu tersedia. Tanpa gambar, Learn tetap lengkap |
| Cek: gambar tanpa angka dan huruf, tanpa darah dan luka, versi AVIF ukuran HP dan PC |

### F7 Uji dan rilis
| Isi | Pelaku |
|---|---|
| Tes HP murah: Playwright dengan CPU diperlambat 4 kali, cek animasi dan geser tetap lancar | Claude |
| Suite Checker: tiga skenario wajib, Learn dua bahasa, 390x844 dan 1250x850, offline, Motion off, Calm, kontras tinggi, cek keterbacaan, titik screenshot | Claude |
| Teks Indonesia dibaca ulang dengan panduan U28 | Claude |
| Uji main Jalur Inti: 1 anak (patokan bahasa) dan 2 orang awam, tanpa dibantu, catat waktu, tempat macet, ikon yang tidak dipahami | User mengatur orangnya, Claude menyiapkan lembar catatan |
| Perbaikan dari uji main | Claude |
| Rilis 0.0.3: daftar rilis dikirim dulu, push ke main setelah disetujui | Claude, persetujuan user |

## Pembagian bagian proyek
| Bagian | Tugas di Learn |
|---|---|
| Data | 45-data-learn.js: teks dua bahasa, kamus, soal Tebak, Kenapa, recap, kuis, kartu ringkasan, teks titik screenshot |
| Logic | 46-logic-learn.js: progres, XP, simulasi aturan, hitungan CPA, recap, practice character, bahasa |
| UI/UX | 47-ui-learn.js dan 36-learn.css: peta, layar tantangan, komponen F1, penampil screenshot, Which die, sorotan sheet |
| Build tools | tools/learn_shots.py, entri baru di build.py dan SOURCE-NOTES.md |
| API | Hitungan corong harian di functions/api/[[path]].js |
| Checker | tests/learn_text.py, tests/learn_flow.py, dan regresi tiga skenario |

## Risiko
| Risiko | Penanganan |
|---|---|
| Data tersimpan rusak | Key baru `cs-learn-v1` saja, key lama tidak diubah. Learn tidak menulis ke karakter kecuali Apply dari Quick Hero atau Keep pada Practice |
| Screenshot builder usang setelah builder berubah | Dibuat ulang tiap build, tes gagal bila elemen titik hilang |
| Ikon tidak dipahami tanpa teks | Dicek di uji main sebelum rilis |
| Waktu 15 menit meleset | Diukur di uji main, isi tempat dipangkas bila lewat 20 menit |
| Isi Learn berbeda dari Library | Kamus mengambil entri Library, tidak menyalin |
| Mengubah tour Home merusak tour lama | Tour Home tetap memakai daftar yang sama di atas mesin baru, tes tour lama ikut dijalankan |
| Ukuran app bertambah | Data Learn dimuat saat Learn dibuka, bukan saat app mulai |
| Geser tidak bisa dipakai sebagian orang | Setiap geser punya cara ketuk dan keyboard, dites otomatis |

## Dicocokkan ke kode (2026-10-29)
PF_KEYS (sinkron prefs), tour di 31, Quick Build di builder/21, pemuatan tunda di 01, service worker, build Pages, endpoint prefs dan admin di API, entri Library di 03 dan 27. Empat hal yang semula keliru di rencana sudah dibetulkan: tour bukan mesin umum, screenshot tidak bisa dibuat di server Pages, gambar offline tidak tersimpan otomatis, corong butuh kerja di API.

## Keputusan yang masih terbuka
| Hal | Status |
|---|---|
| Kapan mulai coding | Menunggu "go" dari user |
| Siapa peserta uji main | Diatur user saat F7 |

## Sumber teknologi
- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements
- https://dev.to/randomengy/from-scratch-drag-and-drop-pitfalls-with-scroll-anchoring-and-touch-gestures-3299
- https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026
- https://svilenkovic.com/3d/webgl-vs-css-3d
- https://www.abratabia.com/game-accessibility/web-game-aria.php
- https://web.dev/baseline/2026
- https://web.dev/blog/interop-2026
- https://web.dev/blog/web-platform-09-2026
- https://www.refontelearning.com/blog/css-anchor-positioning-reaches-baseline
- https://www.buildmvpfast.com/blog/web-platform-baseline-2026-new-features-browser-support
- https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/
