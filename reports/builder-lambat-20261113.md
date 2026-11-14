# Builder lambat dan nama tidak muncul, 0.0.31

Temuan (Playwright, 390x844, CPU 4x, karakter baru):
| Keluhan | Penyebab | Perbaikan |
|---|---|---|
| Klik lambat | Langkah Equipment membuka katalog Add Items otomatis, sekitar 12000 elemen. Pindah ke Equipment 1588 ms (4x) | Katalog tertutup bawaan dan digambar hanya saat dibuka. 172 ms |
| Nama tidak muncul di sheet | Nama masuk ke build, sheet baru menerima saat Apply | Hook `__sheetSetName`, dipanggil 400 ms setelah mengetik. Nama bawaan terpilih saat fokus |
| Builder menutup sendiri | Belum bisa direproduksi. Tidak ada reload otomatis, builder tetap terbuka, fokus tetap | Perlu langkah dari pengguna. Dugaan: tombol Back atau gestur Back memicu penutupan lewat riwayat overlay (40d) |

Catatan: langkah Home masih 2900 elemen dan 140 ms (4x). Belum disentuh.
