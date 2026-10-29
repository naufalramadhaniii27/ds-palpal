# T11 Teknologi terbaru dan teknologi baru, menuju rilis 0.0.3 (mulai 2026-10-29)

Rencana: claude/rencana-kerja-teknologi.md dan claude/rencana-kerja-learn.md. Branch t7-storage. Persetujuan otomatis dari user (2026-10-29 13.40 WIB).

## G0 Alat uji dan pengukuran (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| Gabung t10-tidy | 20 commit T10 masuk (merge 596f937), tanpa konflik. scenarios 24/24, version_label 9/9 |
| N6 Rules fuzzer | tests/fuzz_rules.py, hook `__bldLists`, `__bldFuzz` (builder) dan `__deriveFor` (sheet, tanpa menyimpan). Putaran pertama 400 karakter: 0 gagal keras, tapi 22 jenis pilihan tidak terisi oleh isi otomatis Quick Build di level tinggi |
| Temuan fuzzer, diperbaiki | Fighting Style kedua (Champion 7) mengulang yang pertama. Prepared spell hanya diambil dari level 1, kurang di level tinggi. Mystic Arcanum level 6 sampai 9 tidak dipilih. Spellbook Wizard hanya level 1. Magic Initiate kosong bila semua spell level 1 sudah dikenal. Sesudah perbaikan: 1.000 karakter (seed 1 dan 7), 0 gagal, 0 pilihan terbuka |
| N18 Laporan bug diputar ulang | Report a Problem memuat 10 tindakan terakhir dengan state sebelum dan sesudah tiap tindakan (potret, catatan, jurnal tetap dibuang). tests/replay_report.py memutar ulang langkah demi langkah. `--self` membuat laporan lewat ketukan nyata (damage, heal, Heroic Inspiration) lalu membandingkan state akhir: sama di 390x844 dan 1250x850 |
| A10 Pengukuran | Long Animation Frames dan Event Timing (ketukan 100 ms ke atas), 10 terburuk, hanya di memori, masuk ke laporan masalah. Pengukuran lab sudah ada sebelumnya (tests/inp.py, tests/measure.py dengan CPU 4x) |
| A11 zstd | live-check mencetak Content-Encoding saat zstd, Brotli dan gzip ditawarkan (notice di GitHub Actions) |

## G1 Keamanan dan ukuran (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| A3 PDF | jsPDF 4.2.1 dan html2canvas-pro 2.5.2 di vendor/pdf (MIT, lisensi disertakan), tidak lagi dari cdnjs. Temuan: Export PDF hanya membuat PDF di host artifact lama, di app publik langsung membuka print. Sekarang PDF dibuat dan diunduh di app. tests/pdf_export.py: PDF 4 halaman di dua ukuran, tanpa request keluar |
| A1 CSP | CSP sebagai meta tag dibuat build.py: semua script inline diizinkan lewat hash sha256, `require-trusted-types-for 'script'`. Satu handler inline (fallback gambar HD) diganti listener. Policy Trusted Types `default` (HTML berbahaya dibuang dan dicatat) dan `cs-loader` (bagian builder yang ditunda dan script yang ditahan store-gate). frame-ancestors masuk _headers |
| A1 hasil | Trusted Types juga mengizinkan policy milik html2canvas-pro, base-uri 'self' (klon dokumen PDF memakai base). tests/csp_check.py: Home, sheet (semua tab, detail, damage, heal), More, Library, laporan, Export PDF di dua ukuran: 0 pelanggaran CSP, 0 HTML yang dibersihkan, 0 error. Script inline yang tidak ada di policy tidak jalan (dites) |
| A7 minify | build.py menjalankan esbuild 0.28.2 (tools/build, versi dikunci) per blok script dan style, hanya spasi dan sintaks, nama fungsi tetap. index.html 7,65 MB menjadi 7,31 MB, gzip 2,36 MB menjadi 2,27 MB. Minify penuh dengan ganti nama hanya menambah 0,8 persen gzip, tidak dipakai supaya laporan masalah tetap terbaca |
| A7 font | Tidak diganti. Archivo sudah variable. Barlow dan Courier Prime tidak punya versi variable. Roboto variable (66,5 KB) bisa menggantikan 7 file Roboto dan Roboto Condensed (151,6 KB), tapi Roboto Condensed harus dibentuk dari sumbu lebar dan bentuk hurufnya berubah. Penghematan sekitar 1 persen tidak sebanding dengan risiko mengubah tampilan (aturan user: jangan ganti gaya) |
| Regresi G1 | scenarios 24/24, flow_home_sheet 16/16, storage_idb 39/39, version_label 9/9, pdf_export, replay_report, csp_check, fuzz 120, tidy 14/14, overflow 0, overlap 0, blank_new 9/9, campaign 14/14, lib_add. starting_style gagal juga di commit sebelum T11 karena memanggil builder sebelum dimuat. Tes diperbaiki (menunggu builder), lalu lolos |

## G2 Tampilan dan dadu (selesai 2026-10-29)
| Kerja | Hasil |
|---|---|
| N8 Cascade layers | Semua CSS app dan CSS tema runtime di `@layer app`, file L-*.css di layer sendiri (feat, learn, dice). Snapshot gaya 74 layar (dua ukuran, Record, light, kontras tinggi): 0 beda |
| N8 !important | tools/important_trim.py: 2.631 deklarasi dianalisis, 44 dibuang, sisanya memang dibutuhkan atau di file efek dan print. Percobaan pertama (114) gagal verifikasi dan dibatalkan. Hasil akhir: 0 beda di 74 layar |
| A5 Top layer | ask(), ask builder, dan toast tampil sebagai popover manual (`topLayer()`), di atas semua z-index. Default popover browser direset dengan `:where([popover])`. Snapshot overlay sama. Temuan: di skin DDB toast punya `position:relative` sehingga jatuh di bawah layar dan tidak terlihat. Diperbaiki, toast kini muncul. Bottom sheet dan menu More belum dipindah (risiko tinggi, tidak perlu untuk Learn) |
| A6 Back ke Home | Back di sheet menutup panel dulu, Back berikutnya ke Home. tests/back_home.py lolos di dua ukuran |
| A8 content-visibility | Tidak dipakai. Diukur: daftar sheet Yudhi 7 sampai 19 baris, Library sudah memecah 60 baris per halaman. Tidak ada yang bisa dipercepat, risikonya posisi gulir melompat |
| A9 light-dark() | Tidak dipakai. Sekitar 20 aturan app memasang `color-scheme` per elemen. light-dark() di token akan berganti warna di dalam elemen itu |
| N14 Efek sesuai perangkat | Bila efek belum pernah dipilih: 4 core ke bawah dan memori 2 GB ke bawah, atau 90 frame awal lebih lambat dari 28 ms, efek turun ke lite. Pilihan di Settings selalu menang. tests/fx_tier.py 4/4 |
| D1 dan D2 Dadu 3D | dice-box 1.1.4 dibangun ulang di BabylonJS 9.32.1 dan Havok 1.3.14 (src/dice ke vendor/dice), dimuat saat lemparan pertama. Tombol Roll di breakdown dan save konsentrasi memakai dadu fisika. Motion off dan Calm memakai crypto. Bug ditemukan dan diperbaiki: hasil roll() per dadu, bukan per grup. tests/dice_app.py: 3 lemparan 3D per ukuran di bawah CSP, nilai sesuai, Motion off tanpa 3D |
| Regresi G2 | scenarios 24/24, flow 16/16, csp, pdf, replay, starting_style, overflow 0, overlap 0, campaign 14/14, lib_add, off_mode, modes_matrix, storage_idb 39/39, tidy 14/14, dice_app, fx_tier, back_home, fuzz 500 (0 gagal). sync_banners butuh server wrangler di 8788, tidak jalan di sini |

## Perubahan urutan (user, 2026-10-29 17.22 WIB)
Learn jadi prioritas dan dirilis secepatnya dengan kualitas tetap dijaga. Keputusan Claude: sesudah G2, langsung Learn F0 sampai F7. Rilis 0.0.3 berisi G0, G1, G2, dan Learn. G3, G4, dan G5 (termasuk pindah ke Workers) masuk rilis sesudahnya.

## Learn untuk rilis 0.0.3 (2026-10-29)
| Kerja | Hasil |
|---|---|
| F0 | src/learn (blok tunda `learn`), data EN dan ID, key `cs-learn-v1` ikut PF_KEYS, band di Home, jembatan `window.__app` (app berjalan di satu closure), gerbang bahasa di build (tools/learn_lint.js: 314 pasangan teks lolos) |
| F1 dan F2 | Tavern, Rooftops, Forest, Campsite, Market, cek akhir 5 soal. Tebak, Lihat, Coba, Kenapa, kartu ringkas, kamus popover, Find it on your sheet (Anchor Spotlight dengan anchor positioning dan cadangan JS), "I know this", XP. Dadu memakai dadu 3D bila efek nyala |
| F4 sebagian | Meet Your Dice dan Windy Cliff (Advantage, Disadvantage, saling batal, Heroic Inspiration) |
| U52 Tur Aplikasi | Bagian dari Learn (revisi user 19.22 WIB): tempat "Tur Aplikasi" di peta Learn, 7 titik di sheet sendiri, dua langkah menunggu ketukan nyata, lemparan dibatalkan di akhir, teks EN dan ID, kembali ke peta dengan XP. Home hanya kartu Learn. Settings dan pencarian perintah membuka tur lewat Learn |
| Dadu glossy (user 19.34 WIB) | Warna garnet tetap di semua skin (warna aksen lama abu hijau menutupi angka), pantulan studio buatan kode (tanpa file), highlight tajam, peta specular lama yang membuat kusam dilepas |
| Temuan | Tidak ada data karakter yang diubah Learn (dites). Sheet sendiri menambah detail item (type, cost) ke inventory setelah data builder dimuat, dengan atau tanpa Learn. a11y_scan gagal sejak CSP G1 karena axe disuntik, sekarang memakai bypass_csp (hanya di tes) |
| Tes | learn_flow (3 skenario wajib x 2 ukuran, EN dan ID, Back, Escape, reload, Motion off, tanpa anchor positioning, dadu 3D), learn_a11y (axe 0 pelanggaran, tombol 44 px), tour_flow, version_label 0.0.3 |
| Belum | F3 Forge Your Hero, F5 penghubung (Learn this, Which die, recap, corong Admin), Tempat Bonus lain, gambar Codex. Uji main orang sungguhan dan Safari di iPhone: tugas user |

## Sesudah rilis 0.0.3 (2026-10-29 malam)
| Kerja | Hasil |
|---|---|
| Saving throws di HP | Kembali 2 kolom (aturan T10 tidy membuat 3 kolom, STR terpotong). Catatan saving throw selebar kartu. Sudah di main |
| F4 Tempat Bonus | 7 tempat baru dan Crumbling Bridge (8 soal acak: satu dari tiap tempat inti, tiga dari sisanya). Kamus +10 istilah. Strip skor ke bonus, serangan melawan Armor Number |
| F5 | "Learn this" di panel aturan sheet (contoh Armor Class ke Training Yard). Quick recap sekali sehari dari tempat yang dipelajari minimal sehari sebelumnya |
| Sorotan | Bagian yang lebih tinggi dari setengah layar: kartu label di bawah, tidak keluar layar |
| Tes | learn_flow (semua tempat dan Crumbling Bridge), learn_links |

## Urutan kerja sesudah 0.0.3 (keputusan Claude, 2026-10-29 23.10 WIB, persetujuan otomatis)
Dokumen baru dari sesi lain: claude/riset-builder-wizard.md (G6) dan claude/rencana-kerja-training-ground.md (G7 Training Ground). Urutan:
| Urutan | Kerja | Alasan |
|---|---|---|
| 1 | G6 paket 1 dan 2 (builder dipercantik) | Tidak bergantung G3, langsung terlihat user |
| 2 | Learn F3 Forge Your Hero | Memakai builder G6 |
| 3 | G3 inti data (N3, N2 dan Game Log, N12, N13, N16), lalu G6 T9 dan T10 | Dasar G4 dan F5 lanjutan |
| 4 | G7 TG0 mesin pertarungan tanpa tampilan dan TG0b data makhluk | Tidak menyentuh tampilan |
| 5 | G4 fitur baru | Memakai G3 |
| 6 | G7 TG1 sampai TG5 | Sesudah mesin dan data |
| 7 | G5 pindah ke Workers | Paling akhir (keputusan user) |
Rilis bertahap ke main sesudah tiap kelompok lolos regresi.

## G6 Builder dipercantik (2026-10-29 malam)
| Kode | Hasil |
|---|---|
| B1 | Nama dan Campaign hanya di langkah Home (tes campaign.py disesuaikan) |
| B2 | Skor ability dalam heksagon dengan modifier, "points left" besar (merah bila lebih, hijau bila pas), tombol plus minus 44 px. Roll 4d6: 24 dadu 3D sekaligus, tiap ability ambil empat. tests/builder_4d6.py |
| B3 | Gambar besar class, species, atau background yang dipilih di atas langkahnya (art HD yang ada) |
| B4 | Daftar class dan species jadi kartu bergambar dengan ringkasan 3 baris |
| B5 | Bar "n choices left" dan tombol Next missing choice (membuka dan memfokus pilihan), atau loncat ke langkah berikutnya yang belum selesai |
| B6 | Identity (alignment 3 x 3, traits, ideals, bonds, flaws, backstory) dan Appearance (8 kolom dan deskripsi) di langkah What's Next, langsung ke kolom Description sheet. Langkah builder tidak berubah |
| B7 dan T14 | Token bulat dari potret (canvas), Save token, Share token bila HP bisa berbagi file |
| T1, T2 | @starting-style untuk dialog builder, text-wrap balance untuk judul |
| T3 | Sudah ada sebelumnya (setelan wake lock di app 39) |
| T4 | View Transition antar langkah dengan arah maju dan mundur, cadangan animasi lama |
| T5 | Back HP mundur satu langkah builder, dari langkah pertama menutup builder |
| T6 | Tidak dipakai di builder: B5 sudah membuka dan memfokus pilihannya. Sorotan tetap dipakai Learn dan Tur |
| T7 | Gambar besar bergeser pelan mengikuti gulir (scroll-driven), hanya bila didukung |
| T12 | Garis progres pilihan di bawah langkah, mengisi halus dengan @property |
| T13 | Kolom teks Identity tumbuh mengikuti isi (field-sizing) |
| Tes | builder_g6.py (Back, bar pilihan, kartu, progres, Identity sampai sesudah Apply), builder_4d6.py, regresi |

## Learn F3 Forge Your Hero (2026-10-30)
| Hal | Hasil |
|---|---|
| Tempat | Bagian "Your first hero" di peta Learn: 6 class pemula (emblem class) dan 6 species (gambar species), nama, Surprise me. Forge membuat karakter baru dengan Quick Build level 1 dan membuka builder di What's Next. Yudhi tetap ada |
| Gambar | Kartu class memakai emblem, bukan scene class (scene class punya darah, Learn tanpa darah) |
| Bug ditemukan | Tur Aplikasi tidak membatalkan lemparan natural 1 atau 20 dari jurnal karena key jurnal salah (id karakter, harus nama dari fx/18). Diperbaiki, tour_flow stabil 3 dari 3 |
| Tes | tests/learn_forge.py (Surprise me, petunjuk tanpa pilihan, hasil build, Apply), learn_flow, learn_a11y, tour_flow, scenarios |
| Belum dari F3 | Screenshot builder bertitik (tools/learn_shots.py) dan karakter latihan Keep atau Discard |

## G3 inti data (2026-10-30)
| Kode | Hasil |
|---|---|
| N3 | Struk angka: sesudah update app, toast "n numbers changed" dengan tombol See why ke panel What changed (alasan tiap angka dari breakdown). Disimpan di cs-rcpt-v1. tests/receipts.py |
| N13 | Kotak restore snapshot menyebut angka yang akan berubah |
| N16 dan T10 | Langkah What's Next di builder menampilkan angka sheet yang berubah sebelum Apply |
| N2 | Mesin waktu (History): titik otomatis per karakter (cs-tm-<id>, maksimal 40, digabung bila kurang dari 10 menit, titik saat app ke latar). Compare with now dan Go back (ask dengan pratinjau, snapshot dulu). Dari Settings, perintah history. tests/time_machine.py |
| D3 | Game Log: riwayat lemparan per karakter (mi-rl-<nama>, 50 terakhir), bertahan sesudah app ditutup. Semua lemparan masuk jurnal. Tur memakai key baru lewat window.__miRollKey. tests/game_log.py |
| N12 | Gabung per bagian saat dua perangkat mengubah karakter yang sama: salinan dasar disimpan per karakter (cs-sync-base-<id>). Bagian yang berubah di satu sisi diambil dari sisi itu. Bagian yang berubah di dua sisi memakai nilai perangkat ini, salinan cloud tetap jadi versi other-device, dan toast Choose membuka daftar per bagian (nilai di sini dan di sana, tombol Use other device). Karakter yang sedang dibuka hanya digabung saat app mulai atau kembali ke layar. tests/cloud_sync.py (39 cek, wrangler lokal dengan D1), tests/sync_merge_ui.py |
| T9 | Builder membuka langkah terakhir yang dipakai (cs-bld-step) dengan toast Back where you left off. Pilihan sudah tersimpan tiap perubahan sejak dulu. Karakter baru tetap mulai di Home. tests/builder_draft.py |
| Versi | APP_VER 106, label 0.0.4, What's New merangkum G6, F3, F4, G3 |

## G7 TG0 dan TG0b (2026-10-30)
| Hal | Hasil |
|---|---|
| TG0b | tools/tg_creatures.py mengubah bestiary-xmm.json 5etools (503 makhluk) ke data/tg-creatures.json: srd 330, bukan SRD 173, src dan pg per entri. Aksi terurai: atk 651, save 258, multi 307 (6 Multiattack tanpa daftar, diselesaikan manual), cast 27, other 196. Tidak ada tag 5etools tersisa. 681 KB sebagai file JSON statis di samping index.html (tools/pages_dist.sh menyalin data/), diambil saat Training Ground dibuka dan disimpan service worker untuk offline. Muat awal app tidak bertambah |
| TG0 | src/tg/20-engine.js: mesin tanpa tampilan, state JSON, step(state, perintah). Seed mulberry32, initiative, gerak di kisi (diagonal 5 kaki, Difficult Terrain dua kali), musuh menghalangi, Opportunity Attack (keputusan pemain), Disengage, Dash, Dodge, Help, serangan dengan Advantage dan Disadvantage dari kondisi, natural 20 dan 1, Critical Hit, Resistance, Immunity, Vulnerability, save dengan setengah damage, Multiattack, Recharge, death save, massive damage, Concentration save. Perintah yang ditolak tidak mengubah apa pun. Tanpa AI musuh |
| Tes | tests/tg_engine.js: data 503 (330 dan 173), aturan per unit, 1.000 pertarungan seed tetap dengan pilot tes: semua selesai, tanpa NaN, HP dalam batas dan cocok dengan log, replay sama persis |

## G4 fitur baru (2026-10-30)
| Kode | Hasil |
|---|---|
| N1 | Find a build: tujuan Armor Class, Hit Points, Initiative, skill, save, serangan. Mencoba semua species, background dengan +2 dan +1 ke ability yang dibutuhkan, Standard Array menurut urutan tujuan, dan untuk Armor Class semua armor yang boleh dipakai class, dengan atau tanpa Shield. Tiap percobaan lewat builder dan derive yang sama dengan sheet. 384 percobaan sekitar 8 sampai 14 detik, dicicil per 40 ms supaya layar tidak macet. Jalan di thread utama, bukan Web Worker, karena kode builder dan derive ada di halaman (beda dari rencana, dicatat). Use this build membawa hasil ke builder di langkah Abilities, build lama jadi backup |
| N5 | Levels up to 20 (dari panel Hit Points dan Proficiency): grafik SVG Hit Points, serangan terbaik, spell save DC, dan tabel per level. Pilihan level baru tidak ditebak |
| N4 | Session recap dari jurnal (sesi = rangkaian tanpa jeda lebih dari 4 jam): damage, healing, spell, lemparan dengan natural 20 dan 1, Concentration, kondisi, rest, level, koin. Save as picture (canvas PNG, Web Share bila bisa). Dari perintah recap dan laci Rolls |
| N9 | Rules check: chip di baris Conditions untuk armor berat tanpa Strength cukup, attunement lebih dari batas, 0 HP tanpa Unconscious, Exhaustion 6, dua Shield. Tombol perbaikan |
| N10 | Tabel peluang di panel save, skill, ability, dan serangan: DC 10, 15, 20 (serangan AC 12, 15, 18), biasa, Advantage, Disadvantage. Serangan memakai aturan natural 20 dan 1 |
| N11 | Build DNA: Copy build link dan Share build link di langkah What's Next. Isi hanya pilihan builder, gzip dan base64url di bagian # (tidak terkirim ke server), sekitar 820 karakter untuk Yudhi. Membuka link meminta konfirmasi lalu menambah karakter baru. QR satu kode belum |
| N15 | Pertanyaan di Library (how, can, what, ... atau tanda tanya) mendapat Short answer dari tabel niat 32 entri dan tombol ke aturan lengkap. Tanpa AI |
| N17 | Copy status for chat di panel Hit Points dan perintah status. Baris status yang ditempel di Import dikenali sebagai status, bukan karakter |
| D2 | Roll the death save for me dan Roll untuk Hit Point Dice, memakai dadu yang sama. I rolled myself di semua bar lemparan |
| Tes | tests/g4_play.py (semua di atas, Yudhi dan teman di browser lain), regresi |

## Learn sisa (2026-10-30)
| Kode | Hasil |
|---|---|
| U7 | Which die do I roll: pilih kelompok (Attack, Damage, Spell, Saving throw, Check, Fight, Rest), dadu dan bonus dari karakter sendiri |
| U3 | Table cheat sheet: angka karakter, giliranmu, 12 aksi, aturan lemparan |
| U47 | Coach mode di Settings (default mati): pertama kali satu jenis aturan dibuka, satu kalimat penjelasan muncul sekali (cs-coach) |
| Learn | Bagian At the table di peta Learn (bila ada karakter) membuka U7 dan U3 |
| F3 | Pahlawan dari Forge Your Hero bertanda Practice hero di Home dengan Keep dan Discard (Discard memakai ask dan snapshot dulu) |
| U12 | Admin: corong Learn per tempat (total saja, tanpa daftar orang) dari setelan yang tersinkron. Query diuji di D1 lokal |

## G7 TG1 sampai TG5 Training Ground versi pertama (2026-10-30)
| Fase | Hasil |
|---|---|
| TG1 | Layar setup dari band Training Ground di Home dan perintah training: 1 Who goes in (karakter di perangkat ini, dihitung dengan derive yang sama, atau Try a class: class dan level dibuat builder), 2 What waits for you (Easy sampai Legendary dengan rentang CR rencana, cari nama, penghitung plus minus, sampai 12 makhluk, sumber MM 2024 dan halaman, tanda SRD), 3 Who comes with you (sampai 3: Knight, Scout, Priest Acolyte, Mage Apprentice, Dire Wolf, Warrior Veteran), 4 Where you train (4 arena: Open field, Forest clearing, Old crypt, Broken bridge), bar jumlah dan Enter the field |
| TG2 | Papan kisi canvas 2D (44 px per petak di HP, 52 di PC, bergulir di bingkainya), penempatan spiral tanpa tumpuk, urutan giliran dengan bar HP, petak jangkauan gerak dari mesin, kursor panah dan Enter untuk keyboard, Undo |
| TG3 | Panel aksi: Move, serangan, save, Multiattack (daftar tersisa), Bonus Action, Dash, Disengage, Dodge, Stand up, kartu reaksi Opportunity Attack, log, End Turn, layar Victory atau Defeat dengan Fight again |
| TG4 | Semua token dikendalikan pemain. Aksi musuh dan sekutu dari stat block (serangan, save, Multiattack, Recharge). Aksi yang tidak dijalankan mesin memakai Use it (tingkat C) |
| TG5 | Spell tingkat B untuk karakter pemain: serangan spell, save dengan setengah damage untuk spell area, penyembuhan, panah (Magic Missile) dari SPELL_FX dan spCalc yang sama dengan kartu spell sheet. Slot per level, naik level slot, satu slot per giliran (aturan 2024), Concentration. Spell tanpa angka tampil sebagai by hand |
| Belum | Simpan pertarungan, mode party, ilustrasi Codex (TG6), legendary action otomatis, kondisi dari spell (Hold Person) otomatis, Help terbatas 5 kaki |

## G5 Workers disiapkan (2026-10-30)
| Hal | Hasil |
|---|---|
| Kode | workers/worker.js (static assets dari dist, /api memakai kode functions/api yang sama, Cron harian memanggil dailyRun), workers/wrangler.jsonc (di folder workers supaya wrangler.toml untuk Pages tidak tergantikan), dailyRun diekspor dari functions/api. Kompilasi Pages Functions dengan ekspor tambahan diuji (wrangler pages functions build) |
| Uji lokal | wrangler 4.150.0 dev dengan D1 lokal: index dan aset 200, /api/me dan /api/health 200, Cron (__scheduled) jalan, /api/admin dengan corong Learn |
| Deploy | .github/workflows/workers-deploy.yml: setelah push ke main, build dist lalu wrangler deploy. Tidak melakukan apa pun sampai secret CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID ada. Live-check alamat Workers jalan bila variabel WORKERS_BASE diisi. Pages tetap hidup |
| Langkah user | 1 Buat API token Cloudflare (izin Workers Scripts Edit dan D1 Edit), simpan sebagai secret repo CLOUDFLARE_API_TOKEN, dan Account ID sebagai CLOUDFLARE_ACCOUNT_ID. 2 Jalankan workflow workers-deploy. 3 Tambah alamat workers.dev ke aplikasi Cloudflare Access yang sama (policy Teman dan service token GitHub). 4 Isi variabel repo WORKERS_BASE dengan alamat itu |

## Rilis 0.0.4 (2026-10-30)
| Hal | Hasil |
|---|---|
| Commit | c465d85 dan c1ccf37 di main |
| Regresi | 38 tes lolos: scenarios, flow, csp, pdf, starting_style, overflow, overlap, campaign, lib_add, off_mode, storage_idb, tidy, dice_app, fx_tier, back_home, blank_new, learn_flow, learn_links, learn_forge, learn_a11y (dengan Forge dan Training Ground), tour_flow, builder_4d6, builder_g6, builder_draft, receipts, time_machine, game_log, sync_merge_ui, version_label, g4_play, tg_ui, a11y_scan, replay, tg_engine 1.000 pertarungan, fuzz 500, cloud_sync 39 cek, modes_matrix. flow dan starting_style sempat gagal saat CPU dipakai tes lain, lolos saat diulang sendiri |
| Live-check | Lolos. workers-deploy jalan dan berhenti karena secret Cloudflare belum ada (sesuai rancangan) |
| Tambahan TG | Pertarungan tersimpan di IndexedDB sendiri (dnd-tg) dengan Resume, legendary action (107 aksi, 41 merujuk serangan) |

## G7 lanjutan: Status sesudah rilis 0.0.4 dan antrean teknologi (2026-10-30 05.53 WIB)
Keputusan user 2026-10-30 05.53 WIB: teknologi Training Ground yang belum diterapkan diterima untuk dilanjutkan. Urutan dari yang paling terasa saat main.

Sudah jalan di 0.0.4: TG0 mesin (seed, replay, legendary action), TG0b 503 makhluk (data/tg-creatures.json, bukan OPFS: file statis yang disimpan service worker), TG1 sampai TG5 (setup, kisi Canvas 2D di thread utama, panel aksi, reaksi, log, Undo, spell tingkat B), simpan pertarungan di IndexedDB sendiri (dnd-tg) dengan Resume, content-visibility di daftar makhluk.

| Urutan | Teknologi | Fase rencana | Isi | Tes |
|---|---|---|---|---|
| 1 | Screen Wake Lock | TG2 | Layar tidak redup selama di medan, dilepas saat keluar | Tes tg_ui: lock diminta di medan, dilepas di setup |
| 2 | View Transitions | TG1 | Setup ke medan dan medan ke hasil berganti halus, cadangan tanpa animasi, Motion off tanpa animasi | Tes tanpa error di dua ukuran |
| 3 | `@property` bar HP | TG3 | Bar HP di urutan giliran dan panel bergerak halus | Snapshot dan tes reduced motion |
| 4 | Anchor positioning kartu aksi | TG3 | Kartu aksi singkat menempel ke token terpilih, cadangan panel bawah seperti sekarang | Tes posisi di 390 x 844 dan 1250 x 850, kartu tidak keluar layar |
| 5 | Bagikan susunan pertarungan | TG4 | Setup (makhluk, teman, arena, seed) jadi link pendek gzip, Web Share atau salin | Tes buka link menghasilkan setup sama |
| 6 | Pencarian jalur di Worker, `scheduler.yield()` | TG0, TG2 | Hanya bila diukur lambat di HP lemah (tes CPU 4 kali lebih lambat) | Ukur dulu, catat hasil |
| 7 | OffscreenCanvas di Worker | TG2 | Sama: hanya bila pengukuran menunjukkan papan menahan layar | Ukur dulu |
| 8 | Gamepad API, getar saat kena serang | TG2, TG3 | Tambahan, mengikuti setelan getar app | Tes tanpa gamepad tidak berubah |
| 9 | Rekam video, mode party WebRTC | TG7 | Menunggu Workers aktif (langkah user di laporan G5) | Setelah G5 |
| 10 | Ilustrasi makhluk, token, arena | TG6 | Menunggu Codex | Aturan HD proyek |

Yang sengaja tidak dipakai di app (dicatat di t11-laporan): A8 content-visibility di sheet, A9 light-dark(), variable font untuk Barlow dan Courier Prime, Web Worker untuk Find a build.

## Kandidat teknologi terbaru yang belum ada di daftar (dicek 2026-10-30 dari web.dev Baseline 2026 dan Interop 2026)
Belum diputuskan user. Dukungan tiap fitur dicek ulang di caniuse sebelum dipakai.
| Teknologi | Status | Pemakaian di app |
|---|---|---|
| Invoker commands (`command`, `commandfor`) | Ada di rencana A5, belum dipakai | Tombol buka dan tutup dialog, popover, Library tanpa JS |
| Dialog dan popover baru (`closedby`, `popover="hint"`, `:open`) | Interop 2026 | Tutup dengan ketuk di luar, tooltip aturan dan glosarium |
| Custom Highlight API | Baseline 2026 | Sorot kata yang dicari di Library dan Learn tanpa mengubah DOM |
| `@scope` | Baseline 2026 | CSS builder, Learn, Training Ground tidak bocor ke sheet |
| Container style queries | Baseline 2026 | Tampilan skin dan tema per komponen |
| `contrast-color()` | Baseline 2026 | Teks di chip warna class dan cincin HP selalu terbaca, membantu kontras tinggi |
| Advanced `attr()` | Interop 2026 | Warna dan ukuran dari atribut data (warna class, bar HP) |
| `shape()` | Baseline 2026 | Bentuk heksagon skor dan token dengan sudut melengkung |
| CSS `zoom` | Interop 2026 | Setelan ukuran teks 90 dan 130 lebih sederhana |
| `:active-view-transition` | Baseline 2026 | Mengatur gaya selama transisi builder dan Training Ground |
| IndexedDB `getAllRecords()` | Interop 2026 | Muat data penyimpanan lebih cepat saat app dibuka |
| Reporting API dan CSP violation reports | Baseline 2026 | Pelanggaran CSP masuk ke Report a Problem |
| JavaScript modules di service worker | Baseline 2026 | sw.js lebih rapi, tanpa efek ke pengguna |
| WebTransport | Baseline 2026, Interop 2026 | Alternatif WebRTC untuk mode party (TG7) |
| WebGPU untuk dadu 3D | Belum dicek | Renderer dadu lebih ringan bila didukung, cadangan WebGL2 |
