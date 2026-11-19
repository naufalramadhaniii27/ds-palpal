# Temuan

- build_warm lambat karena redundant() memanggil toSheet() per opsi feat, dan tpRelabel menelusuri semua buku per fitur. Diperbaiki di 0.0.81.
- Sisa build_first adalah menunggu data tertunda (defer_done 6414 ms di 390x844 cpu4x).
- Waktu 5316 ms hanya terjadi di file tunggal 28 MB (tes lokal): browser membaca HTML berurutan dan bagian builder ada sesudah 15 MB data tp dan q. Bentuk hosting mengambil bagian sebagai file terpisah: build_first 2613 ms.
- Waktu ms di runner CI tidak stabil. Jumlah toSheet per layar stabil dan menangkap bug 0.0.80 (68 vs 6).
