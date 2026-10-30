# Daftar teknologi app (2026-10-30)
Dua penanda. Signature: buatan sendiri, tidak ada di pustaka luar. Latest: fitur platform web atau layanan yang sudah ada, dipakai sebagai alat. Status: Jalan (ada di kode, dicek dengan grep di src/ tanggal ini), Rencana (ada di dokumen rencana, belum dikerjakan), Usulan (baru di dokumen ini atau gelombang terbaru).
Angka dukungan dari caniuse, dicek 2026-10-29. Tanda "belum diukur" berarti tidak dicek di sini.

## A. Yang sudah jalan di kode
| Teknologi | Jenis | Bukti di kode | Dukungan atau catatan |
|---|---|---|---|
| Satu file HTML dari src/ lewat build.py | Signature | build.py, SOURCE-NOTES.md | index.html 7.634.517 byte, gzip 2.362.704 |
| Pemuatan tunda blok data-defer (builder, Learn) | Signature | 01-logic-boot-flags-builder-loader.js, build.py | |
| Derivasi sheet dengan catatan asal angka (B) | Signature | 06-logic-derivation.js | Dasar breakdown, Explain any number |
| Generator QR dan bingkai QR berhash | Signature | 42-logic-pwa-qr-icons-wallet.js (QRG, qrFrames, qrHash) | Tanpa pustaka QR |
| Penerima QR lewat kamera | Latest | BarcodeDetector di 42 | Hanya Chrome Android dan Mac, Safari 17 di Mac. Ada jalur cadangan tempel teks |
| Service worker, shell offline, cache bernama per hash | Latest | sw.js | Cache dnd-sheet-<hash> |
| IndexedDB dengan salinan localStorage | Latest | 04-logic-storage.js | OPFS 95,57 persen (belum dipakai) |
| Penyimpanan persisten | Latest | storage.persist di kode | |
| View Transitions (satu dokumen) | Latest | startViewTransition di 4 berkas | 92,91 persen |
| @starting-style | Latest | 1 berkas CSS | 93,05 persen |
| Container queries | Latest | container-type di 1 berkas | Baseline |
| Scroll-driven animations | Latest | animation-timeline di 4 berkas | 87,84 persen, cadangan @supports |
| :has(), color-mix(), dvh, safe-area | Latest | 9, 23, 3, 14 berkas | |
| prefers-reduced-motion dan mode Motion off | Latest + Signature | 28 berkas CSS, REDUCE di 07, 29-motion-off.css | |
| Wake Lock | Latest | wakeLock di 2 berkas | 96 persen |
| Web Share | Latest | navigator.share di 2 berkas | 94,17 persen |
| CompressionStream (gzip) | Latest | 1 berkas | 96,67 persen |
| WebCrypto | Latest | crypto.subtle di 42 | |
| BroadcastChannel (sinkron antar tab) | Latest | 17-logic-tab-sync-and-test-hooks.js | |
| File System Access (simpan berkas) | Latest | showSaveFilePicker | Chrome saja, ada cadangan unduh |
| Vibration | Latest | vibrate di 4 berkas | 77,22 persen, Safari tidak |
| Web Audio | Latest | AudioContext | |
| File handler PWA | Latest | launchQueue di 42 | |
| IntersectionObserver, ResizeObserver, MutationObserver | Latest | 2, 2, 26 berkas | fx memakai 64 MutationObserver (kandidat N63 sampai N65) |
| AVIF untuk 989 ikon dan gambar | Latest | img/ | Folder img 74 MB |
| Cetak PDF: html2canvas 1.4.1 + jsPDF 2.5.1 dari cdnjs | Pihak ketiga | 37-ui-pdf-export-hold-slide-confirm.js baris 3 dan 4 | Bukan signature, bukan platform. Butuh internet. Dirancang diganti N80 |
| Cloudflare Pages + Pages Functions, D1, Access JWT | Latest | functions/api/[[path]].js, wrangler.toml | Layanan gratis. Pindah ke Workers ada di G5 |
| Anchor Spotlight, tour | Signature | 31-ui-tour-and-focus.js | Anchor Spotlight umum masih rencana (A5) |
| Learn: Choreo, Cermin aturan, Find it on your sheet, gerbang bahasa | Signature | src/learn, tools/learn_lint.js | Dirilis di 0.0.3 menurut rencana Learn |
| Dadu 3D dice-box (Babylon + Havok, vendor/dice 6 MB) | Pihak ketiga | Ada di origin/main (src/dice, vendor/dice, src/css/L-dice.css), tidak ada di t10-tidy | Jalan di main. E3 membangun ulang di Babylon 9.32.1 dan Havok 1.3.14. N27 mengusulkan menggantinya dengan lintasan hitung |
| Pencarian dengan indexOf | Dasar | Library, spell, commands | Akan digantikan N45 dan indeks bersama |

## B. Teknologi buatan sendiri di rencana (belum jalan)
| Kelompok | Kode | Status |
|---|---|---|
| Rencana teknologi dasar | N1 sampai N18 (Reverse Builder, Mesin waktu, Struk angka, Rules fuzzer, Migrator layer, Build DNA, Gabung per bagian, dan lainnya) | Rencana |
| Gelombang 2 | N19 Peta angka, N20 Lensa peluang, N21 Takaran pertarungan, N22 Duel build, N23 Dadu jujur, N24 Tautan QR tanpa server, N25 Penyimpanan memperbaiki diri, N26 Pemutar ulang | Rencana |
| Penyederhanaan | N27 sampai N31 | Rencana |
| Training Ground | N32 Atlas Hidup, N33 sampai N41 | Rencana. Dua prototipe Node jalan di tools/tg-proto (replay codec, pengurai stat block) |
| Seluruh app | N42 sampai N47 | Rencana |
| Engine | N48 sampai N79 | Rencana |
| Gelombang 4 | N80 sampai N89 | Usulan hari ini |

## C. Fitur platform yang direncanakan (Latest)
| Teknologi | Untuk | Dukungan |
|---|---|---|
| CSS anchor positioning | Anchor Spotlight, label gambar | 87,36 persen (Chrome dan Firefox sebagian, Safari 27 penuh), butuh cadangan JS |
| Popover API, invoker commands | Kamus Learn | Baseline |
| Navigation API | Tombol Back | Rencana A6 |
| OffscreenCanvas | Training Ground, atlas | 96,76 persen |
| scheduler.yield | Antrean kerja (N84) | 73,79 persen, Safari tidak, wajib cadangan |
| canvas.captureStream | Rekam video pertarungan | 97,24 persen |
| Gamepad | Training Ground | 97,24 persen |
| WebRTC data channel | Mode party, N24 | 97,26 persen |
| OPFS | Penyimpanan gambar besar | 95,57 persen |
| content-visibility | Daftar panjang | 94,85 persen |
| WebTransport | Tidak dipakai (cadangan) | 91,77 persen |
| text-wrap: balance, @property | Tipografi, animasi | 93,58 dan 96,13 persen |
| CSP dan Trusted Types | Keamanan (A1), 199 innerHTML perlu ditangani | |
| esbuild minify | A7 | |

## D. Belum terverifikasi
- Waktu derive() di HP lambat.
- JSON.parse lebih cepat daripada objek literal untuk data besar.
- Ed25519 di WebCrypto (SHA-256 untuk N82 dianggap aman, juga belum diukur).
- Firefox dan WebKit: workspace hanya punya Chromium, jadi dukungan lintas browser hanya dari caniuse.
- Rumus dan angka dari slide video BONEBOXID dikutip, belum dicek ke sumber asli.

## E. Ringkasan jumlah
| Jenis | Jalan | Rencana atau usulan |
|---|---|---|
| Signature | 5 kelompok (build, derivasi, QR, tour, Learn) | N1 sampai N89 (sekitar 89 kode, sebagian digabung atau dibatalkan) |
| Latest | 25 baris di bagian A | 13 baris di bagian C |
| Pihak ketiga | html2canvas, jsPDF, dice (Babylon, Havok) | N80 melepas dua pustaka cetak |
