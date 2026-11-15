# Lag klik builder karakter baru (0.0.33)

Penyebab: indeks pencarian Library (libIndex) dibangun di thread utama saat klik pertama di builder, dan dibuang lagi setiap event "qrefs" (tiap sumber yang selesai dimuat). Dengan semua sumber aktif, satu klik kelas atau background butuh sekitar 1,3 sampai 1,8 detik di CPU 4x lebih lambat.

Perbaikan (src/app/27b-ui-library.js):
- Indeks pertama dibangun saat idle, setelah builder terbuka (di sheet tidak, karena memperlambat Find a build).
- Event "qrefs" tidak lagi membuang indeks yang ada. Indeks lama tetap dipakai, lalu dibangun ulang sekali saat idle, 1,2 detik setelah event terakhir.

Hasil: klik Fighter 1483 ms menjadi 221 ms (CPU 4x, semua sumber aktif).

Belum direproduksi: "builder menutup sendiri dan tidak tersimpan". Flush pagehide dan visibilitychange sudah ada. Dugaan: tab dimatikan browser mobile karena heap besar. Lag yang diperbaiki di sini mengurangi tekanan itu.
