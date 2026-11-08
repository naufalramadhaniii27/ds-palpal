# SOLID tahap 13D: perekam efek fx 100 persen stabil (tidak tercapai, fx tidak dipecah)

Basis: origin/main caf121c9. Cabang: claude/solid-s13d. Batas waktu perekam: 45 menit (mulai 11:19 WIB).

## Hasil

Perekam 100 persen stabil TIDAK tercapai dalam batas waktu. Sesuai aturan, `src/fx` tidak disentuh dan tidak ada pecahan fx. PR ini hanya berisi perekam `tests/solid_fx_snapshot.py` yang diperbaiki dan laporan ini. Tidak ada perubahan `src/`, `index.html`, `sw.js`.

## Yang dibekukan di perekam

| Sumber noise | Cara |
|---|---|
| Date.now, performance.now, setTimeout, setInterval, rAF, idle callback | jam palsu Playwright (`clock.install` lalu `pause_at`), maju hanya lewat `run_for` per 100 ms |
| Math.random | berbenih tiap langkah (sudah ada di 13C) |
| animasi dan transisi CSS | dimatikan lewat style init |
| IntersectionObserver | pengganti yang di-poll jam palsu tiap 50 ms (kelas reveal dan `mi-hd` tidak bergantung frame) |
| tunggu idle | kondisi: tidak ada request tertunda dan tidak ada Web Animation terbatas yang jalan, bukan sleep |
| boot dan builder | `waitc` menunggu kondisi (`__deferDone`, `__bldOpen`) sambil memajukan jam |
| hook fx | dijalankan satu per satu, jam maju 60 ms antar hook (await timer di halaman macet bila jam dijeda) |
| normalisasi DOM | atribut `class` kosong dibuang |

## Bukti stabilitas (dua run basis dari main, 390x844)

| Versi perekam | Pasangan hash sama |
|---|---|
| 13C (jam asli) | sekitar 93 persen (angka 13C, semua skenario dan viewport) |
| jam palsu + animasi mati (skenario A, tiga run) | `ord`, `set`, `win`, `lis` sama di hampir semua langkah, `dom` beda di semua langkah (id kartu memakai Date.now, jam belum dijeda) |
| + jam dijeda + kelas kosong dibuang (A, ABC 390) | ABC 390: 410 dari 467 pasangan sama (87.8 persen), selisih terbesar di `dom` skenario A dan C |
| + IntersectionObserver palsu (A 390) | `ord/set/win/lis` sama kecuali 2 langkah, `dom` beda di semua langkah karena SATU sebab: kelas `mi-hd` pada judul panel Feat muncul di satu run saja |
| + jeda jam bila ada request tertunda (A 390) | lebih buruk (`win`, `lis` beda), dicabut |

Sisa noise yang diketahui: kelas `mi-hd` (fx/08, IntersectionObserver threshold .6) pada judul panel yang tersembunyi, diduga balapan antara pemuatan nyata (fetch, skrip) dan jam palsu saat boot. Belum terbukti penyebabnya. Skenario B, C dan viewport 1250x850 tidak sempat dibuktikan tiga kali berturut-turut (satu run ABC 390 sekitar 10 menit, satu pasang 1250 menambah 10 menit lagi, tiga pasang tidak muat sebelum 13:15).

Saran langkah berikut: (1) cari kenapa `mi-hd` muncul sesaat di panel tersembunyi pada satu run (rekam `classList.add` dengan stack di fx/08), (2) buang `mi-hd` dari normalisasi DOM bila ternyata kelas dekoratif murni, (3) baru jalankan tiga pasang run penuh.

## Ditunda

| Item | Alasan |
|---|---|
| Pecahan fx/02, 16, 18, 19, 24 | perekam belum 100 persen stabil. Tambahan teknis: guard_size menghitung IIFE beserta fungsi dalamnya, jadi fx/02 (blok 121 baris/127 cabang) harus dipecah menjadi beberapa IIFE yang berbagi `burst`, `ring`, `smoke`, `C`, `vis`, `FINE` lewat objek non-window, supaya `win` tidak berubah |

## Tes

Hanya `tests/solid_fx_snapshot.py` yang berubah (alat, bukan CI). Daftar tes penuh tidak dijalankan karena `src/` tidak berubah. Guard: tidak ada perubahan hitungan (guard_size 120 pelanggar pada main).
