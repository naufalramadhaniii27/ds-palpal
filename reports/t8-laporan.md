# T8 Sinkron cloud (tahap 3) dan dua bug T7 (2026-10-28)

Rilis di main: aa11391 sampai f5c2e0e. Rencana: claude/rencana-login-sinkron.md tahap 3.

## Hasil
| Butir | Isi |
|---|---|
| Database | D1 `dnd-sheet` (APAC), binding `DB` lewat `wrangler.toml`. Tabel users, chars, versions, usage, state |
| API | `functions/api/[[path]].js`, hanya `/api/*`. Login dari JWT Cloudflare Access: tanda tangan kunci tim, `iss` tim purple-frog-276b, AUD aplikasi dnd-sheets-palpale. Service token dapat 403 |
| Simpan | PUT per karakter dengan nomor revisi. Body teks mentah, server tidak mem-parse JSON (batas CPU 10 ms) |
| Bentrok | Dua perangkat mengubah karakter yang sama: perangkat yang terakhir kirim menang, salinan lain disimpan sebagai versi "from another device". Tidak ada data hilang |
| Versi | Paling sering sekali per jam per karakter (sekali per hari di mode hemat), maks 30. Restore as copy membuat karakter baru |
| Hapus | Ke recycle bin 30 hari, bisa Restore dari dialog Cloud backup |
| Jatah | Per pengguna per hari 1.000 request, 1.200 baris tulis, 20.000 baca. 50 MB, 50 karakter, 1 MB per karakter |
| Siklus harian | Request pertama tiap hari UTC (07.00 WIB): pangkas versi, kosongkan bin, hapus usage lama, tentukan mode normal, hemat (>70 persen), jeda (>90 persen). Tanpa Cron |
| Klien | `src/app/43-logic-cloud-sync.js`. Mulai setelah builder dimuat. Cek perubahan tiap 10 detik, tarik daftar tiap 5 menit dan saat app kembali ke layar. Saat app ditutup, perubahan kecil dikirim dengan keepalive |
| Tampilan | Satu tombol awan di header sheet dan Home. Tanpa popup. Ketuk: status dan dialog Cloud backup |
| Tanpa API | File lokal, tes, host lain: sinkron mati diam-diam, tanpa ikon |
| sw.js | `/api/*` tidak pernah lewat cache. Gambar offline ikut precache |
| Bug T7 | Karakter kosong dari builder tidak lagi membawa profSrc Fighter dan aksi Second Wind |

## Bug yang ditemukan saat tes dan sudah diperbaiki
| Bug | Akibat bila lolos | Perbaikan |
|---|---|---|
| Service worker menyimpan jawaban GET `/api/chars` di cache | Perangkat membaca revisi lama, bentrok palsu, data terlewat | `/api/*` dilewati di sw.js |
| Perangkat baru: builder mengosongkan sheet (fresh start) setelah karakter dari cloud masuk | Karakter kosong terkirim menimpa karakter asli | `__publicFresh` dimatikan saat karakter diterima, sinkron mulai setelah builder dimuat |
| Saat pindah karakter, memori masih berisi karakter lama | Isi karakter lama terkirim dengan id karakter baru | Karakter terbuka dibaca dari slot tersimpan, sinkron berhenti sampai reload |
| Permintaan sinkron saat sedang sibuk hilang | Perubahan baru terlambat sampai | Diantrekan |
| 409 dianggap offline | Ikon salah, sinkron berhenti | Baca ulang lalu kirim lagi |

## Tes
| Tes | Hasil |
|---|---|
| cloud_sync (baru, server lokal wrangler + D1): unggah, perangkat kedua menerima, edit pindah, bentrok, Restore as copy, hapus ke bin, perangkat lain ikut menghapus, offline. 390x844 dan 1250x850 | 25 lolos |
| api_jwt (baru): token sah, tanpa token, AUD salah, kedaluwarsa, iss salah, kunci salah, kid tak dikenal, service token, token diubah, health | 10 lolos |
| blank_new (baru) | 9 lolos |
| live_check di situs (Access aktif): versi, header, file tidak terbit, API health dengan D1, cek token, migrasi, service worker, offline | 25 lolos |
| scenarios, storage_idb, flow_home_sheet, version_label dan 24 tes lain | semua lolos |
| Perangkat asli user | Ikon awan muncul, dialog menampilkan karakter di cloud |

## Catatan
- `wrangler.toml` menjadi sumber binding dan variabel Pages. Pengaturan di dashboard untuk bagian itu tidak dipakai lagi.
- Versi tampil masih 0.0.1. Belum ada entri What's New untuk Cloud backup.
- Belum dikerjakan dari tahap 3: halaman admin, preferensi ikut sinkron, banner "belum ter-backup lebih dari 3 hari" dan "storage 90 persen".
