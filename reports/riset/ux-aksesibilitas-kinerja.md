# Riset UX, aksesibilitas, kinerja (2026-10-31)

## Status bukti

- Halaman dibuka dan terbaca: 20 (daftar di bawah). Satu halaman dibuka tetapi kosong (Ink & Switch). Satu ditolak (GitHub minisearch).
- Semua klaim di tabel berasal dari halaman itu. Selain itu ditandai "tidak terbukti".
- Beberapa halaman adalah salinan atau ringkasan pihak ketiga. Tertulis di kolom bukti.
- Kolom "Cara pakai" dan "Biaya" adalah penilaian saya untuk aplikasi satu HTML. Itu bukan klaim dari sumber.

### Halaman yang dibuka

1. https://web.dev/articles/content-visibility
2. https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
3. https://automerge.org/docs/hello/
4. https://github.com/krisk/Fuse
5. https://devstar.cn/MengningSoftware/docs/blame/branch/main/node_modules/minisearch/README.md (salinan README MiniSearch)
6. https://w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only
7. https://unlighthouse.dev/learn-lighthouse/inp (pihak ketiga)
8. https://www.legendkeeper.com/app/clf771vyfnl090886mqn1swsd/a9nnhn5r (panduan Pathbuilder, pihak ketiga)
9. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
10. https://www.boia.org/blog/understanding-target-size-under-wcag-2.2-and-how-it-affects-people-with-disabilities (2021, draf lama)
11. https://github.com/lucaong/react-minisearch
12. https://web.dev/articles/optimize-long-tasks?authuser=8
13. https://developer.chrome.com/blog/use-scheduler-yield
14. https://docs.yjs.dev/readme.md
15. https://web-platform-dx.github.io/web-features-explorer/features/prefers-reduced-motion
16. https://jaredcunha-7h8j7shw5-jaredcunha-coms-projects.vercel.app/blog/html-dialog-getting-accessibility-and-ux-right (blog pihak ketiga)
17. https://www.pcgamer.com/most-rpgs-are-getting-character-creation-wrong
18. https://uxdesign.cc/the-ux-writing-of-baldurs-gate-3-6ea80e6cc278
19. https://developer.mozilla.org/en-US/docs/Web/Progressive_Web_Apps/Guides/Offline_and_background_operation
20. https://web.dev/articles/virtualize-long-lists-react-window
21. https://inkandswitch.com/local-first/ (terbuka, isi kosong, tidak dipakai)

Ditolak: https://github.com/lucaong/minisearch (izin tidak dijawab).

## 1. Wizard dan pembuat karakter

| Praktik | Bukti | Cara pakai di satu HTML | Biaya |
|---|---|---|---|
| Pilihan harus bisa dinilai sebelum dikunci. Pemain sulit menebak dampak pilihan. | PC Gamer: https://www.pcgamer.com/most-rpgs-are-getting-character-creation-wrong | Tampilkan ringkasan dampak (stat, fitur level 1) di kartu pilihan. Beri tombol "Back" tanpa kehilangan data. | Rendah |
| Tooltip padat yang menjelaskan mekanik di titik keputusan. BG3 menaruh deskripsi, dadu, jarak, biaya slot, konsentrasi, durasi dalam satu jendela. | uxdesign.cc: https://uxdesign.cc/the-ux-writing-of-baldurs-gate-3-6ea80e6cc278 | Panel detail satu layar per pilihan. Di HP pakai bottom sheet. | Sedang |
| Fitur penting yang tersembunyi terlewat. Ikon kecil "add class" di BG3 banyak tidak ditemukan. | uxdesign.cc (sama) | Beri label teks pada aksi multiclass, jangan hanya ikon. | Rendah |
| Biaya respec yang menghukum mengurangi eksperimen. | PC Gamer (sama) | Builder: izinkan ubah pilihan kapan saja, tanpa penalti. Tandai langkah yang terpengaruh. | Rendah |
| Pathbuilder: pilih cakupan sumber di awal ("Core Only" untuk pemula, lalu "Get Started" untuk lebih banyak). Daftar awal dipersingkat (8 ancestry), tombol "All" membuka sisanya. Warna menandai kelangkaan. | LegendKeeper (pihak ketiga): https://www.legendkeeper.com/app/clf771vyfnl090886mqn1swsd/a9nnhn5r | Preset sumber ("Hanya PHB 2024") sebelum wizard. Daftar default pendek, tombol "Show all". | Rendah |
| Alur D&D Beyond dan Foundry | Tidak terbukti. Tidak ada halaman yang dibuka. | - | - |

## 2. Memilih dari daftar besar

| Praktik | Bukti | Cara pakai di satu HTML | Biaya |
|---|---|---|---|
| Fuse.js: fuzzy (Bitap), kunci berbobot, operator exact/prefix/negasi, highlight lewat indices. Dirancang untuk data kecil sampai menengah di klien. Ukuran sekitar 8,6 kB penuh dan 6,8 kB dasar (gzip). | https://github.com/krisk/Fuse | Satu `<script>` inline atau bundel lewat build.py. Kunci: nama, tipe, sumber. | ~7-9 kB. Pola `FuseWorker` ada, tetapi tidak perlu untuk ratusan entri (tidak terbukti perlu). |
| MiniSearch: fuzzy, prefix, `autoSuggest`, boost field, `filter`, tambah/hapus dokumen. Disebut hemat memori untuk peramban HP. | README: https://devstar.cn/MengningSoftware/docs/blame/branch/main/node_modules/minisearch/README.md | `filter` cocok untuk chip sumber dan kategori. `autoSuggest` untuk saran ketik. | Ukuran tidak tertulis di sumber. Tidak terbukti. |
| Windowing: render hanya yang terlihat. DOM besar memperlambat style calc dan mutasi. Tekniknya tidak terikat framework. Overscan kecil mencegah kedip. | https://web.dev/articles/virtualize-long-lists-react-window | Tulis virtual list sendiri (tinggi baris tetap, spacer atas dan bawah). | Sedang. Batas ukuran daftar yang butuh virtualisasi tidak diberikan sumber. Ukur dulu dengan Playwright. |
| `content-visibility: auto` + `contain-intrinsic-size` sebagai alternatif ringan. Contoh sumber: render awal 232 ms jadi 30 ms. | https://web.dev/articles/content-visibility | Tambahkan ke `.list-row` atau grup. Pakai `auto 56px`. | Sangat rendah. Placeholder salah memicu loncatan layout. |
| Combobox ARIA untuk pencarian: `role=combobox`, `aria-controls`, `aria-expanded`, `aria-activedescendant`. Panah, Home/End, Enter, Escape. Fokus DOM tetap di input. | https://w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only | Terapkan pada kotak cari. Daftar hasil `role=listbox`, item `role=option`. | Sedang |
| Pengelompokan dan chip filter di daftar besar | Tidak terbukti. Tidak ada sumber yang dibuka. | - | - |

## 3. Tombol dan hierarki visual di UI padat

| Praktik | Bukti | Cara pakai | Biaya |
|---|---|---|---|
| Ukuran tombol minimal 24x24 CSS px, atau jarak: lingkaran 24 px di tengah target tidak boleh bersinggungan dengan target lain. Contoh lulus: 20x20 dengan jarak 4 px. Contoh gagal: tinggi 16 px, jarak 1 px. Zoom tidak dihitung. | W3C: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | Terapkan `min-width/min-height: 24px` pada semua kontrol kecil. Untuk kontrol utama pakai lebih besar. W3C menyarankan melampaui minimum sebagai praktik terbaik. | Rendah |
| Menambah jarak antar target kecil bisa lulus tanpa desain ulang. | BOIA (2021, draf lama): https://www.boia.org/blog/understanding-target-size-under-wcag-2.2-and-how-it-affects-people-with-disabilities | Naikkan `gap` di baris tombol padat. | Rendah |
| Hierarki tombol primer/sekunder/ikon di UI padat | Tidak terbukti. Tidak ada halaman yang dibuka. | - | - |

## 4. Panel detail: gambar besar vs watermark

Tidak terbukti. Tidak ada halaman yang dibuka tentang topik ini. Saran: uji A/B sendiri dengan pengukuran 3 dan 5 di bawah.

## 5. Aksesibilitas

| Praktik | Bukti | Cara pakai | Biaya |
|---|---|---|---|
| Target 24 px (lihat topik 3). | W3C target size (URL di atas) | Audit semua tombol dengan skrip Playwright. | Rendah |
| `prefers-reduced-motion` berstatus Baseline, tersedia luas sejak 15 Juli 2022. | https://web-platform-dx.github.io/web-features-explorer/features/prefers-reduced-motion | Blok `@media (prefers-reduced-motion: reduce)` yang mematikan transisi panel. | Sangat rendah |
| `<dialog>` + `showModal()`: fokus pindah ke elemen fokus pertama. `close()` mengembalikan fokus ke pemicu. Penulis blog menyarankan jebakan fokus kustom, karena tidak bawaan. `autofocus` pada `<dialog>` gagal di Chrome macOS dan Windows. Konten di bawah inert tetapi masih bisa scroll. | Blog pihak ketiga: https://jaredcunha-7h8j7shw5-jaredcunha-coms-projects.vercel.app/blog/html-dialog-getting-accessibility-and-ux-right | Ganti `ask()` ke `<dialog>`. Taruh tombol tutup atau judul sebagai fokus awal. Simpan `scrollY` saat buka. | Sedang. Perlu uji di peramban target. |
| Pola combobox APG (topik 2). | APG (URL di atas) | Sama. | Sedang |
| Fokus tampak, tidak tertutup header sticky (WCAG 2.4.11), kontras warna | Tidak terbukti. Halaman W3C yang diminta ditolak, dan pencarian tidak mengembalikan halaman ini. | - | - |

## 6. Kinerja di HP murah

| Praktik | Bukti | Cara pakai | Biaya |
|---|---|---|---|
| INP: baik ≤200 ms, perlu perbaikan 200-500 ms, buruk >500 ms. Mengukur klik, ketuk, tombol. Delay input dan delay presentasi sering lebih dari 60% total. Uji di HP asli. | Pihak ketiga: https://unlighthouse.dev/learn-lighthouse/inp | Ukur dengan `PerformanceObserver` tipe `event`. Perkecil DOM. Jaga handler ringkas. | Rendah |
| Tugas panjang = lebih dari 50 ms. Pecah dengan `setTimeout` bungkus Promise (`yieldToMain`). `isInputPending` tidak lagi disarankan. | https://web.dev/articles/optimize-long-tasks?authuser=8 | Pecah render daftar dan hitung ulang sheet jadi potongan. | Rendah |
| `scheduler.yield()`: lanjutan dijadwalkan lebih awal dari antrean setTimeout. Sumber memberi dukungan Chrome 129 dan Edge 129. Tabel menyebut Firefox 142 tetapi teks bertentangan. Safari tidak didukung. Perlu deteksi fitur dan fallback. | https://developer.chrome.com/blog/use-scheduler-yield | `(scheduler.yield ? scheduler.yield() : new Promise(r => setTimeout(r)))`. | Sangat rendah |
| `content-visibility` dan virtualisasi (topik 2). | web.dev (URL di atas) | Sama. | - |

## 7. PWA offline-first

| Praktik | Bukti | Cara pakai | Biaya |
|---|---|---|---|
| Service worker mencegat `fetch`. Cache API lewat `caches.open`, `cache.put`, `caches.match`. Cache-first cepat tetapi bisa basi. Network-first jatuh ke cache saat offline. Pilih per sumber daya. Klon response sebelum cache. | MDN: https://developer.mozilla.org/en-US/docs/Web/Progressive_Web_Apps/Guides/Offline_and_background_operation | Cache-first untuk HTML dan aset statis. Beri versi pada nama cache. | Rendah |
| localStorage 5 MiB per origin, maksimum 10 MiB. Melebihi batas melempar `QuotaExceededError`. | MDN storage: https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria | Bungkus semua tulis dengan try/catch. | Rendah |
| IndexedDB, Cache API, OPFS memakai kuota peramban. Chromium 60% disk. Firefox best-effort 10% disk atau 10 GiB. Safari sekitar 60%. | MDN storage (sama) | Pindahkan karakter besar dari localStorage ke IndexedDB. Perlu migrasi (aturan proyek). | Sedang |
| `navigator.storage.persist()`: Firefox menampilkan prompt. Safari dan Chromium memutuskan otomatis dari riwayat interaksi. Data persisten dilewati saat tekanan penyimpanan. Pengusiran per origin, semua atau tidak sama sekali. | MDN storage (sama) | Panggil setelah pengguna menyimpan karakter pertama. Tampilkan status dengan `storage.estimate()`. | Rendah |
| Safari: jika tidak ada interaksi 7 hari penggunaan peramban dan pelacakan lintas situs dicegah, data buatan skrip dihapus. MDN tidak menyebut aplikasi di Home Screen sebagai pengecualian, tetapi menyebut kuota Home Screen sama dengan peramban. | MDN storage (sama) | Sediakan ekspor JSON dan pengingat cadangan. Apakah PWA terpasang terkena aturan 7 hari: tidak terbukti. | Rendah |

## 8. Sinkron lokal-pertama

| Praktik | Bukti | Cara pakai | Biaya |
|---|---|---|---|
| Automerge: CRDT, salinan lokal utama, edit offline, gabung otomatis tanpa server. Jaringan bebas (WebSocket, WebRTC, transfer satu arah seperti berkas lewat email). JS jalan di peramban, Rust lewat WebAssembly. | https://automerge.org/docs/hello/ | Dokumen karakter = Automerge doc. Ekspor berkas untuk pindah perangkat. | Ukuran bundel dan memori tidak tertulis. Tidak terbukti. Butuh WASM, sulit untuk satu HTML tanpa build. |
| Yjs: tipe bersama mirip Map/Array, konvergen apa pun urutan update, tanpa asumsi jaringan. Klaim "tercepat" merujuk benchmark milik proyek sendiri. | https://docs.yjs.dev/readme.md | Alternatif Automerge. | Ukuran tidak tertulis. Tidak terbukti. |
| Gabung tiga arah (three-way merge) untuk JSON karakter | Tidak terbukti. Tidak ada halaman yang dibuka. | Opsi: simpan versi dasar, bandingkan per field. Ini rancangan saya, bukan dari sumber. | Rendah sampai sedang |
| Esai Ink & Switch tentang local-first | Halaman terbuka tetapi isi kosong. Tidak terbukti. | - | - |

## 10 perbaikan prioritas

| # | Perbaikan | Alasan | Bukti |
|---|---|---|---|
| 1 | Pastikan semua kontrol minimal 24x24 px atau berjarak cukup. | Syarat WCAG 2.2 AA. Murah. Dampak langsung di HP. | W3C target size |
| 2 | Pasang `content-visibility:auto` + `contain-intrinsic-size` pada baris daftar sumber. | Satu baris CSS. Contoh sumber menunjukkan render awal turun besar. | web.dev content-visibility |
| 3 | Pre-wizard "pilih sumber" dengan preset, lalu daftar singkat dengan tombol "Show all". | Ratusan entri tidak muncul sekaligus. Pola ini dipakai Pathbuilder. | LegendKeeper |
| 4 | Pencarian dengan Fuse.js atau MiniSearch, filter chip lewat `filter`. | Ukuran kecil, tanpa server. Pilih setelah uji dengan data nyata. | Fuse, MiniSearch README |
| 5 | Ubah kotak cari jadi combobox ARIA. | Navigasi papan ketik dan pembaca layar. | APG combobox |
| 6 | Pecah tugas panjang dengan `yieldToMain` dan `scheduler.yield` bila ada. | Menjaga INP saat render ratusan item atau hitung ulang sheet. | web.dev long tasks, Chrome blog |
| 7 | Ganti `ask()` ke `<dialog>` dengan fokus awal dan pengembalian fokus yang diuji. | Perilaku fokus bawaan. Aturan proyek sudah melarang confirm/alert. | Blog dialog |
| 8 | Blok `prefers-reduced-motion` untuk semua transisi. | Baseline luas, biaya kecil. | web-features |
| 9 | `navigator.storage.persist()` + `estimate()` + tombol ekspor/impor JSON. | Mengurangi risiko kehilangan karakter. Safari punya aturan 7 hari. | MDN storage |
| 10 | Virtual list sendiri hanya jika pengukuran menunjukkan masalah setelah langkah 2 dan 6. | Lebih mahal dan berisiko. Batas ukuran daftar tidak ada di sumber. | web.dev virtualize |

Sinkron CRDT sengaja tidak masuk 10 besar. Bukti biaya bundel dan kecocokan dengan satu HTML tidak ada. Tahap awal cukup ekspor/impor JSON.

## 5 pengukuran Playwright

Semua dijalankan di 390x844 dan 1250x850. Uji tiga skenario wajib (sheet Yudhi, sesudah Apply, karakter baru).

| # | Ukuran | Cara | Lulus jika | Dasar |
|---|---|---|---|---|
| 1 | Ukuran target | `page.evaluate` baca `getBoundingClientRect()` semua `button, a, [role=button], input`. Hitung yang <24 px dan uji jarak lingkaran 24 px. | 0 pelanggaran yang tidak dikecualikan | W3C target size |
| 2 | INP lab | Pasang `PerformanceObserver({type:'event', durationThreshold:16})`. Klik chip filter, buka panel, ketik di pencarian. Ambil durasi terbesar. Throttle CPU 4x lewat CDP. | ≤200 ms | unlighthouse INP |
| 3 | Tugas panjang | `PerformanceObserver` tipe `longtask` selama buka daftar sumber penuh. Catat jumlah dan total blocking (durasi dikurangi 50 ms). | Tidak ada tugas >50 ms saat render daftar. Target ini usulan saya | web.dev long tasks |
| 4 | Jumlah simpul DOM dan waktu render daftar | Hitung `document.querySelectorAll('*').length` dan ukur waktu dari klik sampai baris pertama terlihat. Bandingkan sebelum dan sesudah `content-visibility`. | Waktu turun dan tanpa loncatan layout (CLS dari `layout-shift` entry) | web.dev content-visibility |
| 5 | Penyimpanan dan offline | Muat halaman, `context.setOffline(true)`, muat ulang. Lalu cek `navigator.storage.persisted()`, `estimate()`, dan isi kunci localStorage lama tidak berubah. | Halaman terbuka offline. Data tersimpan utuh | MDN offline, MDN storage |

Tambahan opsional untuk dialog: Tab berputar di dalam dialog, Escape menutup, fokus kembali ke pemicu. Dasar: blog dialog di atas, sumber pihak ketiga.
