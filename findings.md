# Temuan

- build_warm lambat karena redundant() memanggil toSheet() per opsi feat, dan tpRelabel menelusuri semua buku per fitur. Diperbaiki di 0.0.81.
- Sisa build_first adalah menunggu data tertunda (defer_done 6414 ms di 390x844 cpu4x).
- Waktu 5316 ms hanya terjadi di file tunggal 28 MB (tes lokal): browser membaca HTML berurutan dan bagian builder ada sesudah 15 MB data tp dan q. Bentuk hosting mengambil bagian sebagai file terpisah: build_first 2613 ms.
- Waktu ms di runner CI tidak stabil. Jumlah toSheet per layar stabil dan menangkap bug 0.0.80 (68 vs 6).
- Search the whole library: 6,2 s di CPU 4x. libInv (pecah kata 16 MB teks) 4,4 s, skor nama fzScore 66 ribu entri, libIndex, muat q7. Indeks dibuat ulang tiap halaman.
- Cache per entri (_nl, _fc) melanggar heap_tools 70 MB (86,7). Tanpa cache: 68,5 MB sama dengan dasar.
- libInv lama melewatkan kata "constructor" (bentrok Object.prototype).
- Persiapan idle 0.0.82 tidak pernah jalan: event qrefs (data q7 datang) membatalkannya. Diperbaiki: dimulai ulang sesudah qrefs. Urutan di CPU 4x: mulai 0, q7 siap +0,75 s, 4 job indeks +1,4 s, kata selesai +3,5 s.
- Mengambil q7 lebih awal untuk semua orang menaikkan heap_home (31,35 dari batas 32 MB): tidak dipakai.
