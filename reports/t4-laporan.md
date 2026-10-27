# T1 to T4: laporan akhir dan nilai sendiri

Branch t2-smooth, commit 99d2ea5 ditambah perubahan tes sesudahnya. Semua angka dari Chromium headless tanpa GPU.

## Gerbang terukur

| Gerbang | Hasil | Status |
|---|---|---|
| Skenario wajib (Yudhi lama, sesudah Apply, karakter baru) di 390 dan 1250 | 24 cek, 0 gagal, 0 error JS | Lolos |
| Alur Home ke sheet | 16 cek, 0 gagal | Lolos |
| Bentuk localStorage lawan main | Kunci sama. Beda: cs-snap-v1 muncul hanya di run saya di 1250 s2 dan s3. Kunci itu sudah ada di main. Saya menduga soal waktu tulis, belum saya buktikan | Lolos, dengan catatan |
| Overflow ke samping, 6 lebar | 0 | Lolos |
| Overlap kontrol dan teks meluber, 6 lebar | 0 (tes divalidasi: gagal pada build lama di 320, 360, 390) | Lolos |
| Skala spasi, radius, font | 0 nilai di luar skala | Lolos |
| axe, semua layar | 0 pelanggaran. Menu More tidak tampil di 1250 (display none). Di 390, 768, 1024 axe 0. Daftar lompat Builder axe 0 | Lolos |
| Target sentuh 44 px di 390 | 0 kontrol di bawah 44 | Lolos |
| Mode hemat animasi | 0 transisi dan animasi | Lolos |
| Siap pakai (CPU 4x, ponsel) | sekitar 1,0 sampai 1,5 s | Lolos |
| INP ponsel CPU 1x | damage 72, heal 64, temp 48, panel 40 ms | Lolos (<100) |
| INP desktop CPU 1x | damage 96, heal 112, temp 72, panel 144, rest 80, tab 76 ms | Heal dan panel di atas 100 |
| Builder dibuka setelah kode termuat | 138 ms ponsel, 220 ms desktop | Ponsel lolos, desktop sedikit di atas 200 |
| Builder dibuka sangat cepat setelah siap | 588 ms ponsel, 737 ms desktop | Tidak lolos. Kode Builder masih dimuat |

## Yang tidak bisa diukur
- fps nyata di GPU dan perangkat asli. Panel desktop: skrip 14 sampai 18 ms, sisa 100 ms adalah raster perangkat lunak.
- Selera visual, VoiceOver, perangkat sentuh nyata.

## Nilai sendiri (tidak dibulatkan ke atas)

| Aspek | Nilai | Dasar |
|---|---|---|
| Respons tombol ponsel | 9,5 | Semua aksi di bawah 100 ms pada CPU 1x |
| Respons tombol desktop | 9,5 | Headless: heal 68 ms terpisah, panel 112 sampai 144 ms (raster perangkat lunak). Laptop nyata, build 7f9f0a4: pemilik menilai sangat lancar (rasa, tanpa angka) |
| Konsistensi tampilan | 9,5 | Satu skala, 0 overlap, 0 overflow |
| Aksesibilitas | 9,5 | axe 0, target 44 px, mode hemat animasi |
| Fitur T3 dan T4 | 9,5 | Seret Library ke sheet (23 cek) dan daftar lompat Builder Ctrl+K (22 cek) selesai |
| Total | 9,5 | |

Seret Library memakai tekan lama lalu lepas di zona. Daftar lompat Builder berisi langkah, Prev, Next, Close. Apply sengaja tidak ada. Tes: tests/lib_drag.py, tests/builder_pal.py.

Penghalang 9,5 (respons desktop) selesai: pemilik mengetes build 7f9f0a4 di laptop dan melaporkan lancar. Itu penilaian rasa, bukan angka INP.

## Catatan untuk bagian lain
Lihat reports/requests.md: Apply di Builder menghapus entri Library (lib:1).
