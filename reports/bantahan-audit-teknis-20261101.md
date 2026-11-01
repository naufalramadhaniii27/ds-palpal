# Bantahan atas Technical Audit dnd-sheet (1 November 2026)

Dokumen ini menjawab laporan "dnd-sheet-technical-audit-20261101" (revisi v2, penulis Hermes/Oska). Setiap bantahan di bawah punya bukti yang bisa dijalankan ulang. Bagian yang benar dari audit juga saya akui, supaya dokumen ini tidak berat sebelah.

## 1. Ringkasan

| Hasil pemeriksaan | Jumlah |
|---|---|
| Klaim audit yang salah | 6 |
| Klaim yang benar sebagian atau salah hitung | 4 |
| Klaim yang benar dan diterima | 6 |

Skor "Testability 2/10" dan "Maintainability 3/10" tidak punya dasar. Audit menyatakan sendiri di Lampiran B bahwa tes tidak dijalankan, dan menyebut repo tanpa tes otomatis. Itu keliru.

## 2. Metode

Semua pemeriksaan dijalankan terhadap commit yang diaudit, `b1f0677` (Version 0.0.9, APP_VER 111), memakai `git show`, `git ls-tree` dan `git grep` pada commit itu. Pengukuran performa memakai `index.html` dari commit yang sama.

Lingkungan pengukuran: Chromium headless (Playwright) di localhost, viewport 390x844, service worker diblokir, CPU dibatasi lewat CDP `Emulation.setCPUThrottlingRate`. Tidak ada jaringan nyata dan tidak ada perangkat nyata.

## 3. Klaim yang salah

### 3.1 "Tidak ada satu pun test otomatis"

Audit (ringkasan, poin 2, dan skor 2/10): hanya `build.py --check` dan `tests/measure.py`.

Fakta di commit `b1f0677`:

| Pemeriksaan | Hasil |
|---|---|
| File `.py`, `.js`, `.mjs` di folder `tests/` (tingkat atas, tanpa subfolder) | 96 |
| Tes yang sudah ada | `scenarios.py` (tiga skenario wajib), `golden_rules.py` (bandingkan aturan dengan oracle, 1001 karakter), `csp_check.py`, `learn_flow.py`, `builder_draft.py`, dan banyak lainnya |
| Unit test node | `tests/tg_engine.js` (mesin Training Ground, ratusan pertarungan dengan seed tetap) |

Perintah: `git ls-tree -r --name-only b1f0677 tests`

Yang benar dari klaim ini: tes belum jalan otomatis di CI. `live-check.yml` hanya menjalankan `tests/live_check.py` terhadap situs live setelah push ke main. Itu diterima di bagian 5.

### 3.2 "CSP memakai 43 hash yang harus disinkronkan manual, lupa berarti layar putih"

Audit (temuan ③, risiko R3, ADR-005).

Fakta: `build.py` menghitung hash `sha256` setiap blok script saat build dan menulisnya ke meta CSP (`build.py` baris 189 di commit itu, `hashlib.sha256(...)` lalu `'sha256-...'`). Tidak ada langkah manual. `python3 build.py --check` gagal bila `index.html` tidak sama dengan hasil rakitan, jadi hash yang tidak sinkron tidak bisa lolos. `tests/csp_check.py` membuka halaman di dua ukuran layar dan menghitung pelanggaran CSP serta Trusted Types.

Hasil terakhir `csp_check` di branch kerja: 0 pelanggaran CSP, 0 Trusted Types, 0 error, di 390x844 dan 1250x850.

Risiko R3 (skor 15) karena itu tidak berlaku sebagai "manual".

### 3.3 "Tidak ada package.json dan package-lock.json"

Audit (bagian 5.2).

Fakta: `tools/build/package.json` dan `tools/build/package-lock.json` ada di commit `b1f0677`. Isinya satu devDependency dengan versi terkunci: esbuild 0.28.2. (eslint 9.39.4 dan globals 16.4.0 baru ditambahkan di branch kerja, commit `de941c6c`, untuk pemeriksa nama. Versi 1 dokumen ini salah menyebut ketiganya ada di `b1f0677`. Koreksi dari Hermes di Lampiran E v3.) Yang memang tidak ada hanya `package.json` di akar repo, dan itu pilihan karena aplikasi tidak punya dependensi runtime.

Audit juga menulis "Jumlah dependensi: nol" untuk `build.py` dan "200+ paket npm" untuk bundler. Keduanya tidak tepat: `build.py` sudah memakai esbuild, dan seluruh `node_modules` build di branch kerja (dengan eslint) berisi 76 paket (kebanyakan turunan eslint).

### 3.4 Guard `DEV_USER` yang diusulkan terbalik

Audit (bagian 3.1, rekomendasi P0, risiko R7). Kode usulan:

```
if (env.DEV_USER && env.ACCESS_TEAM) { tolak }
```

Kode asli (`functions/api/[[path]].js`, fungsi `who`):

```
if (!env.ACCESS_TEAM) return env.DEV_USER ? ... : null
```

Jalur bypass hanya terbuka bila `ACCESS_TEAM` kosong. Bila `ACCESS_TEAM` terisi (seperti di `wrangler.toml` yang di-commit, `purple-frog-276b`), kode langsung memverifikasi JWT dan `DEV_USER` tidak dipakai sama sekali.

Akibatnya guard usulan audit menolak start pada kondisi yang aman (kedua variabel ada) dan tidak menutup kondisi berbahaya (`ACCESS_TEAM` kosong, `DEV_USER` ada). Kalau dipasang apa adanya, ia tidak melindungi apa pun dan justru bisa mematikan API bila `DEV_USER` terbawa ke produksi.

Kekhawatiran dasarnya tetap sah: ada satu kesalahan konfigurasi (hapus `ACCESS_TEAM`, isi `DEV_USER`) yang membuka API. Guard yang benar ada di bagian 5. Perlu dicatat juga bahwa tanpa `DEV_USER` jalur itu menolak semua orang (fail closed), jadi bypass butuh dua kesalahan sekaligus.

### 3.5 "Parse dan memori bikin tab dibunuh" (R2, skor 16) dan "8 sampai 17 detik"

Audit (bagian 2.2 dan R2) menyimpulkan 8 sampai 17 detik parsing dari rumus 17 MB dibagi 1 sampai 2 MB per detik, dan heap 14 MB data menjadi objek hidup.

Pengukuran di commit yang sama (halaman dimuat sampai semua bagian tertunda selesai, `window.__deferDone`):

| Perlambatan CPU | First Contentful Paint | Semua script awal selesai | Waktu script | Heap JS |
|---|---|---|---|---|
| x1 (mesin ini) | 0,72 detik | 1,5 detik | 0,61 detik | 27,5 MB |
| x4 | 2,5 detik | 5,9 detik | 2,4 detik | 27,6 MB |
| x6 (HP kelas bawah, emulasi) | 4,0 detik | 9,5 detik | 3,9 detik | 27,8 MB |

Heap JS tetap sekitar 28 MB di semua kondisi, bukan 14 MB data ditambah aplikasi di atasnya. Rumus "17 MB dibagi 1 sampai 2 MB per detik" tidak cocok dengan pengukuran: waktu script nyata 0,6 detik tanpa pembatasan dan 3,9 detik pada x6. Tab dibunuh karena memori JS 28 MB tidak terbukti. Total memori tab (DOM, teks HTML) tidak saya ukur.

Catatan jujur: angka x6 tetap lambat. Lihat bagian 4.1.

### 3.6 "17,36 MB harus diunduh" (bagian 2.2)

Audit menghitung waktu unduh dari ukuran mentah: 3G 95 detik, 4G 14 detik.

Fakta satuan: `index.html` di commit itu berukuran 18.200.171 byte. Itu 17,36 MiB, bukan 17,36 MB. Audit memakai MiB dan menulis MB di seluruh laporan.

Fakta transfer: Cloudflare Pages mengirim teks terkompresi. Ukuran terkompresi `index.html` yang saya hitung dari berkas itu:

| Kompresi | Ukuran |
|---|---|
| Mentah | 18,20 MB |
| gzip -9 | 4,26 MB |
| brotli q11 | 3,04 MB |
| brotli q6 | 3,46 MB |

Dengan itu, unduhan pertama sekitar 3 sampai 4,3 MB, bukan 17 MB. Di 3G 1,5 Mbps itu sekitar 16 sampai 23 detik (bukan 95), di 4G 10 Mbps sekitar 2,4 sampai 3,4 detik. Kompresi aktual di situs live tidak bisa saya cek karena situs di balik Cloudflare Access, jadi ini perkiraan dari perilaku standar Cloudflare. Server lokal pengukuran saya tidak mengompresi.

## 4. Klaim yang benar sebagian atau salah hitung

### 4.1 Beban awal di HP lambat tetap nyata

Audit menulis bahwa data game dievaluasi di main thread setiap cold start. Itu benar. Loader `src/boot/deferred-loader.js` menjalankan semua blok `x-defer` setelah frame pertama, dalam potongan sekitar 10 ms. Bestiary 3,87 MB dan blok kampanye ikut dijalankan setiap cold start. Blok itu tertunda, tidak dimuat sesuai kebutuhan.

Yang salah dari audit adalah besarnya (bagian 3.5), bukan arahnya. Pada emulasi x6, semua script awal selesai di 9,5 detik dan halaman tampil di detik ke 4,0. Itu cukup berat untuk HP lemah. Usulan memisahkan data (§6.1) tetap masuk akal sebagai optimasi, dengan hasil yang lebih kecil dari yang dijanjikan (turun dari 17,36 MiB ke 3,1 MB itu perbandingan ukuran mentah, bukan ukuran unduhan).

### 4.2 `alt=` hanya 18

Di `index.html` commit itu ada 18 kemunculan `<img` dan 18 kemunculan `alt=`. (Versi 1 dokumen ini menulis 17 karena regex saya melewatkan satu tag yang ditulis di template string. Koreksi dari Hermes.) Hampir semua gambar sudah punya alt. Sebagian besar grafik antarmuka berupa SVG dengan `aria-hidden` (139 kemunculan) dan `role="img"` (6), bukan tag gambar. Jumlah 18 tidak menunjukkan kekurangan.

Pencarian `git grep` di `src/` pada commit itu menemukan 3 baris yang memuat `<img` tanpa `alt=`. Ketiganya bukan tag gambar: satu fungsi regex yang menulis ulang path gambar (`wmHd`, atribut aslinya ikut terbawa) dan dua komentar. Semua template `<img` lain di `src/` punya `alt=`. Audit axe-core atas halaman yang berjalan tetap belum dilakukan oleh siapa pun.

### 4.3 Risiko R4, R6, R8 sudah punya mitigasi

| Risiko audit | Mitigasi yang sudah ada |
|---|---|
| R4 data IndexedDB korup, usul "cadangan otomatis mingguan" | Pengingat cadangan (`cs-ui-remind`, hari dan mode otomatis), snapshot roster di `app/15-logic-roster-backup-files-snapshots.js`, dan layar pemulihan bila build tersimpan tidak terbaca |
| R6 Safari membersihkan IndexedDB, usul `navigator.storage.persist()` | `askPersist()` dan `persistShow()` sudah memanggilnya (`app/15-...`, baris 168 dan 169) |
| R8 cache PWA basi, usul banner versi baru | Toast "New version ready." dengan tombol muat ulang sudah ada (`app/42-logic-pwa-qr-icons-wallet.js`) |

### 4.4 "Build.py tidak bisa diganti bundler tanpa kehilangan determinisme"

Pada branch kerja `third-party-all` (belum dirilis ke main, jadi tidak ada di `b1f0677`), blok `app`, `builder`, `learn` dan `tg` sudah menjadi modul ES yang dibundel esbuild lewat `build.py`. Di `b1f0677` esbuild dipakai tanpa `--bundle`, seperti yang ditulis Hermes. `python3 build.py --check` tetap lulus (`index.html same | sw.js same`, 0 lint gagal), jadi hasil tetap deterministik. Tabel 8.3 audit (determinisme "tidak pasti", "200+ paket") tidak berlaku untuk pemakaian esbuild saja tanpa Vite.

## 5. Klaim yang benar dan diterima

| Temuan audit | Status | Keterangan |
|---|---|---|
| Jalur bypass `DEV_USER` perlu dijaga | Diterima, dengan guard yang benar | Lihat kode di bawah |
| Tidak ada sidik jari untuk `vendor/pdf/` | Diterima | `git grep` tidak menemukan cek hash vendor di build atau tes |
| Tes belum jalan di CI | Diterima | Hanya `live_check.py` yang jalan (di `live-check.yml` dan `workers-deploy.yml`), terhadap situs live |
| Backup D1 harian | Diterima | Di luar repo, perlu cron |
| Concurrency optimistis di sync | Diterima | Perkiraan usaha kecil |
| Unduhan pertama dan beban awal HP lambat | Diterima sebagian | Bagian 4.1 |

Guard `DEV_USER` yang benar menutup kondisi "tanpa `ACCESS_TEAM`" untuk selain localhost:

```
if (!env.ACCESS_TEAM) {
  const host = new URL(req.url).hostname
  if (host !== "localhost" && host !== "127.0.0.1") return null
  return env.DEV_USER ? String(req.headers.get("x-dev-user") || env.DEV_USER).toLowerCase() : null
}
```

## 6. Koreksi dari saya

Dalam jawaban singkat sebelum dokumen ini, saya menulis bahwa blok tertunda "hanya teks dan tidak di-parse sampai dibutuhkan". Itu salah. Blok `x-defer` dijalankan semuanya setelah frame pertama (bagian 4.1). Audit benar di arah ini.

## 7. Batas pemeriksaan

1. Semua angka performa diukur di Chromium headless, bukan perangkat nyata. Emulasi CPU x4 dan x6 hanya pendekatan.
2. Kompresi live tidak bisa dicek karena Cloudflare Access.
3. Total memori tab tidak diukur, hanya heap JS.
4. Tes yang butuh server API lokal atau argumen (misalnya `api_social`) tidak bisa saya jalankan di lingkungan ini.
5. Saya tidak menjalankan axe-core atas aplikasi (audit juga tidak).

## 8. Tambahan setelah audit versi 3

Hermes menerima semua enam koreksi dan mengajukan tiga catatan. Hasil pemeriksaan saya:

| Catatan Hermes | Hasil |
|---|---|
| Bundling esbuild tidak ada di `b1f0677` | Benar. Perubahan itu hanya ada di `third-party-all` dan belum dirilis |
| `package.json` build hanya berisi esbuild | Benar untuk `b1f0677`. Saya keliru membaca file di branch kerja |
| 18 `<img`, bukan 17 | Benar. Hitungan mentah `<img` memberi 18 |

Dua angka tambahan yang belum ada di audit v3:

| Angka | Nilai |
|---|---|
| brotli q11 atas `index.html` `b1f0677` | 3.043.696 byte dengan jendela bawaan, 2.972.751 byte dengan jendela 24 bit (angka Hermes, 2,84 MiB). Keduanya benar untuk pengaturan masing-masing. Cloudflare memakai brotli level lebih rendah saat kirim langsung (q6 memberi 3,46 MB), jadi unduhan nyata kemungkinan 3 sampai 4 MB |
| gzip tanpa semua 34 blok `x-defer` | 0,96 MiB. Dengan blok kode builder, learn dan tg tetap ada 1,29 MiB. Perkiraan audit "sekitar 1 MiB" untuk §8.1 wajar sebagai batas bawah |

Dua catatan atas §8.1 audit v3.1 (memisahkan data):

1. 34 blok `x-defer` bukan semuanya data. Tiga di antaranya kode (builder 1,0 MB, learn 0,1 MB, tg 0,07 MB), dan blok kampanye seperti `tp1` berisi ratusan fungsi di samping datanya. Angka 0,96 MiB adalah batas bawah bila semua blok itu dipisah.
2. Angka "unduhan pertama turun ke sekitar 1 MiB" berlaku untuk tampilan pertama saja. Aplikasi ini offline-first. `sw.js` di commit itu hanya menaruh `./` dan beberapa ikon di cache pasang. Seluruh data ikut karena ada di dalam `index.html`. Bila data jadi berkas `data/*.js`, berkas itu baru masuk cache saat pertama dipakai. Pengguna yang offline sebelum membuka bestiary tidak akan memilikinya. Agar tetap offline-first, data harus diunduh di latar belakang atau masuk daftar cache pasang, sehingga total byte yang diunduh tetap sama, hanya lebih lambat datangnya.

## 9. Cara mengulang pemeriksaan

```
git ls-tree -r --name-only b1f0677 tests
git show b1f0677:build.py
git ls-tree -r --name-only b1f0677 | grep package
git show b1f0677:index.html > audit.html
git show b1f0677:functions/api/[[path]].js
```

Pengukuran performa: muat `audit.html` lewat server lokal di Playwright, set `Emulation.setCPUThrottlingRate`, tunggu `window.__deferDone`, lalu baca `Performance.getMetrics`.
