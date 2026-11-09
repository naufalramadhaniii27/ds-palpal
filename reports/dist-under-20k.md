# dist di bawah 20.000 file (Cloudflare Pages Free)

Tanggal 2026-11-09. Cabang `claude/dist-under-20k`, dasar main d5584092.

## Masalah

Cloudflare Pages Free menerima paling banyak 20.000 file per situs dan 25 MiB per file. `sh tools/pages_dist.sh` di main menghasilkan 20.999 file, jadi deploy gagal sejak 0.0.15.

## Angka sebelum dan sesudah

| Direktori di dist | main | cabang ini | selisih |
|---|---:|---:|---:|
| data/hb (JSON per paket homebrew) | 997 | 0 | -997 |
| data/hbs (shard + map.json) | 0 | 39 | +39 |
| img/portrait/t (thumbnail) | 942 | 0 | -942 |
| img/portrait/tp (paket thumbnail) | 0 | 264 | +264 |
| img/portrait (total) | 1.885 | 1.207 | -678 |
| data (total) | 8.538 | 7.580 | -958 |
| data/img, img/hd, img/icon, img/scn, img/mon, img/scard, lainnya | sama | sama | 0 |
| **Total dist** | **20.999** | **19.363** | **-1.636** |

Batas anggaran 19.500 (sisa 137). File terbesar 6.511.928 byte (`p/q1.*.js`), jauh di bawah 25 MiB. Shard homebrew terbesar 1.683.537 byte (paket `confc` sendirian), median 554.592 byte.

## Cara yang dipilih

| Opsi | Hemat file | Dipilih | Alasan |
|---|---:|---|---|
| a. Shard data/hb | -958 | Ya | Hanya dua pemuat (`src/app/27b-ui-library.js` libHbLoad, `src/builder/09-logic-feats-and-choices.js` wxHbLoad). Isi baris disalin byte per byte. Service worker sudah menyimpan semua GET same-origin, jadi shard ikut tersimpan untuk offline |
| b. Paket thumbnail potret | -678 | Ya | Satu pemakai (`src/app/20-ui-portrait.js` ppTile). Byte AVIF sama persis, tampil lewat blob URL. CSP sudah mengizinkan `img-src blob:` |
| b'. Sprite sheet thumbnail | -900an | Tidak | Perlu encode ulang gambar dan posisi background. Piksel tidak dijamin sama |
| c. File duplikat (438) | -438 | Tidak | Butuh pemetaan ulang jalur di tabel data atau aturan `_redirects` 200 yang tidak bisa dites lokal. Tidak perlu karena a+b sudah cukup |
| c'. Gambar yang tidak dipakai | ? | Tidak | Nama banyak gambar dirakit saat jalan (slug). Tidak terbukti aman tanpa menebak |

### a. Homebrew

- `tools/dist_pack.py` (dipanggil `tools/pages_dist.sh`) membaca `dist/data/hb/*.json`, mengurutkan id, mengisi shard sampai sekitar 600 KB (paket lebih besar dapat shard sendiri), menulis `dist/data/hbs/NN.json` berbentuk `{"<id>": rows}` dan `dist/data/hbs/map.json` (`{"<id>": "NN"}`). Teks baris disalin apa adanya. Tiap shard dibaca balik dan dibandingkan dengan file asal sebelum `dist/data/hb` dihapus.
- `hbRows(hid)` baru di `src/app/27b-ui-library.js`: ambil `data/hbs/map.json` sekali, lalu shard yang memuat paket. Tanpa map (pohon source, tes yang membuka root repo) jatuh ke `data/hb/<id>.json` seperti dulu. Gagal jaringan saat ambil map tidak dikunci, jadi dicoba lagi pada pembukaan berikutnya.
- Builder memakai fungsi yang sama lewat `env.__hbRows` / `genv.__hbRows` (fallback ke fetch lama jika belum ada).
- Teks pesan galat dan perilaku cache per paket (`LIB_HB`, `LIB_HBP`, `HBLOADED`) tidak berubah.

### b. Thumbnail potret

- `tools/dist_pack.py` mengemas `dist/img/portrait/t/<id>.avif` jadi `dist/img/portrait/tp/N.bin` (file AVIF disambung, maksimal 4 thumbnail satu spesies per paket, urut sesuai `img/portrait/index.js`) dan menambah `window.__PPTP=[[id, byte, ...], ...]` di akhir `dist/img/portrait/index.js`. Setiap paket dibaca balik dan dibandingkan byte per byte.
- `src/app/20-ui-portrait.js`: bila `__PPTP` ada, tile dibuat dengan `data-ppt` (markup lain sama: `alt`, `width`, `height`, `loading`, `decoding`). IntersectionObserver dengan margin 1250px (jarak lazy load bawaan Chrome) mengambil paket saat tile mendekati layar, lalu `img.src` diisi blob URL dari potongan byte yang sama. Blob URL disimpan, jadi membuka picker lagi tidak mengambil ulang. Tanpa `__PPTP` tile memakai `img/portrait/t/<id>.avif` seperti dulu. Memilih potret tetap memakai file penuh `img/portrait/<id>.avif`.

### Penjaga

- `tests/dist_budget.py`: jalankan `pages_dist.sh`, gagal bila dist lebih dari 19.500 file, ada file di atas 25 MiB, `data/hb` atau `img/portrait/t` masih ada di dist, map tidak memuat semua sumber `HBIDX`, shard tidak memberi baris yang sama, atau thumbnail tidak sama byte per byte. Pesan menyebut anggaran dan batas host, plus jumlah per folder.
- `.github/workflows/tests.yml` Job A: langkah baru "Hosted build fits Cloudflare Pages Free" sesudah HTML gate.

## Bukti

Semua dijalankan di worktree ini (lokal, `http.server`, Playwright Chromium). Pembanding: dist dari main d5584092 (`sh tools/pages_dist.sh` di main, disalin ke luar repo).

| No | Bukti | Hasil |
|---|---|---|
| 1 | `sh tools/pages_dist.sh` lalu `find dist -type f \| wc -l` | main 20.999, cabang ini **19.363**. `python3 tests/dist_budget.py` PASS (7 cek) |
| 2a | Library dari dist: 68 paket homebrew (paket pertama dan terakhir dari tiap 38 shard, satu shard berisi satu paket), semua pihak ketiga, dibuka lewat `data-lib-open` | 0 timeout, 0 page error di 390x844 dan 1250x850. Sesudah data tertunda selesai dimuat (jeda 8 detik), innerHTML `#libHb` 68 dari 68 identik dengan dist main di kedua viewport. Tanpa jeda, sebagian paket punya dua varian HTML (beda sekitar 70 karakter) yang muncul acak di main juga, jadi itu soal waktu muat, bukan perubahan ini |
| 2b | Retromistika (paket bawaan): Library cari "Mistikan" dan buka species Mistikan | Teks Library sama dengan main (hash sama) di kedua viewport |
| 2c | Picker potret: 48 tile pertama, data-pp, aria-label, ukuran gambar, hash piksel tiap thumbnail lewat canvas | Identik dengan main di kedua viewport. Screenshot picker: beda maksimum 17 dari 255 di latar (animasi), area thumbnail sama. Cari "fighter" (42 hasil lintas spesies) tampil lengkap |
| 2d | Jejak jaringan | Main meminta `data/hb/<id>.json` dan `img/portrait/t/*.avif`. Cabang ini hanya `data/hbs/NN.json`, `data/hbs/map.json`, `img/portrait/tp/N.bin`. Tidak ada permintaan ke jalur lama |
| 2e | Offline: buka paket dan picker dengan service worker aktif, `set_offline(True)`, reload, buka lagi | Service worker mengendalikan halaman. 4 paket tetap tampil offline, 12 thumbnail pertama tampil sama seperti online, di kedua viewport. Satu paket di 1250x850 memberi varian HTML waktu muat yang sama seperti di main (main juga beda di paket yang sama) |
| 3 | `tests/scenarios.py --root dist` (sheet lama Yudhi, sesudah Apply, karakter baru, 390x844 dan 1250x850), lalu `tests/compare_storage.py` | 24 cek, 0 gagal. localStorage 6 dari 6 file **sama** dengan dist main (run kedua). Run pertama beda pada ada atau tidaknya kunci `phb24-builder-v1(-bak)`; dua run main sendiri juga beda dengan pola yang sama di 1250x850, dan file run itu sama persis dengan run main yang juga punya kunci itu |
| 4 | `python3 tests/solid_snapshot.py OUT.json` | 2997 build, total **f65fce1937133458**, 0 galat |
| 5 | golden_builds (1479 cek), fx_engine, solid_contract, solid_data_contract, solid_ui_contract, csp_check (root dan `--root dist`), names_lint, version_label, e2e_fx_toggle, split_dist, fonts_dist, q_hb, perf_budget (`budget: ok`), `build.py --check` | Lulus |
| 5 | `python3 tests/guard_all.py --enforce` | exit 0 |
| 5 | `python3 tools/tsc_gate.py` / `python3 tools/html_gate.py` | 203 galat (sama dengan main) / 250 (baseline 250) |
| 5 | `tests/lazy_parts.py` | Cek waktu "dist early read" (< 1500 ms) goyah di mesin ini: cabang ini 1239 sampai 3437 ms, main d5584092 1159 sampai 4612 ms (main juga gagal 2 dari 5 run). Cek lain lulus. Fungsi yang diukur (`__libFind` pertama) tidak disentuh |
| 5 | `tests/portrait_pick.py` | Gagal di "lists 20 art portraits (48)", juga gagal sama di dist main: tes lama dari sebelum picker 48 per halaman. Cek pilih, tutup, hapus potret lulus |


## Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Membuka satu paket homebrew kecil kini mengunduh satu shard (median 554 KB mentah, gzip/brotli Cloudflare jauh lebih kecil) | Pembukaan pertama paket kecil sedikit lebih lambat di jaringan lambat. Paket lain di shard yang sama jadi instan | Target shard bisa diturunkan di `HB_TARGET` (lebih banyak file) |
| Cari potret per kelas (misal "fighter", 42 hasil dari 42 spesies) mengambil paket 4 thumbnail per hasil: sekitar 714 KB lawan 188 KB. Tampilan awal (spesies sendiri lalu urutan indeks) hampir sama: 48 tile pertama 221 KB lawan 212 KB, dengan 14 permintaan, bukan 48 | Cari kelas lebih boros byte. Hanya tile dekat layar yang diambil | `THUMBS_PER_PACK` bisa diturunkan ke 2 atau 3 bila perlu (sisa anggaran mengecil) |
| Pengguna dengan versi lama di cache service worker meminta `data/hb/<id>.json` atau `img/portrait/t/<id>.avif` yang tidak ada lagi di deploy baru | Sampai app memperbarui diri (service worker mengambil versi baru di latar), paket homebrew baru tidak bisa dibuka dan thumbnail yang belum pernah dilihat kosong. Yang sudah tersimpan di cache tetap tampil | Sementara, hilang sesudah pembaruan |
| Sisa anggaran 137 file | Rilis art berikutnya cepat melewati 19.500 | `tests/dist_budget.py` gagal di CI dengan pesan jelas, bukan di Cloudflare. Pemilik sudah memutuskan tidak menambah art |
| Pengujian lokal memakai `http.server`, bukan Cloudflare | Perilaku khusus host (SPA fallback untuk file hilang) tidak teruji | Semua file yang diminta app ada di dist, jadi fallback tidak terpakai |
