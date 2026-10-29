# Audit teknologi seluruh app (2026-10-29)

Cara cek: hitung pemakaian tiap fitur di src/app, src/builder, src/css, src/html, sw.js dan functions/api (skrip audit, 104 file JS, 2,2 MB JS, 1,16 MB CSS). Patokan "terbaru": Baseline 2026 dan Interop 2026 (web.dev, edisi September 2026). Bahan untuk rencana teknologi baru.

## Sudah dipakai
| Teknologi | Jumlah pemakaian | Status web |
|---|---|---|
| View Transitions (`startViewTransition`, `view-transition-name`) | 8 dan 6 | Baseline Oktober 2025 |
| CSS `:has()` | 21 | Baseline |
| Container queries | 15 | Baseline |
| `@starting-style` | 2 | Baseline 2024 |
| Scroll-driven animations (dengan `@supports`) | 14 | Belum Baseline, dipakai sebagai tambahan |
| `color-mix()` | 90 | Baseline |
| `@property` | 2 | Baseline |
| `field-sizing` | 2 | Baseline 2026 |
| Web Animations API (`.animate`) | 155 | Baseline |
| `inert` | 4 | Baseline |
| Pointer capture | 7 | Baseline |
| IndexedDB, `storage.persist` | 2, 5 | Baseline |
| BroadcastChannel, Web Locks | 5, 3 | Baseline |
| Wake Lock, Vibration, Web Share, Clipboard async | 5, 8, 5, 10 | Baseline atau sebagian (dengan cek dukungan) |
| CompressionStream | 4 | Baseline |
| `scheduler.yield` | 2 | Belum semua browser, dengan cek dukungan |
| File System Access (simpan backup di PC) | 3 | Chromium saja, dengan cadangan download biasa |
| PWA (service worker, manifest), AVIF | | Baseline |
| Server: Cloudflare Pages Functions, D1, Access JWT, async/await | 509 baris API | Modern |

## Belum dipakai, bermanfaat
| Teknologi | Status web | Manfaat untuk app |
|---|---|---|
| CSS cascade layers (`@layer`) | Baseline | CSS terdiri dari 36 file "patch" bertumpuk dengan sekitar 800 `!important`. Layer membuat urutan menang jelas tanpa `!important` |
| CSS anchor positioning | Baseline Januari 2026 | Tooltip, menu More, popup detail, tour, tanpa hitung posisi JS |
| Popover API, `<dialog>` | Baseline | ask(), bottom sheet, menu: top layer, Esc dan fokus otomatis, tidak perlu z-index 2147483647 |
| Invoker commands | Baseline Desember 2025 | Buka dan tutup dialog atau popover tanpa JS |
| Navigation API | Baseline 2026 | Tombol Back HP menutup dialog atau pindah tab, bukan keluar app |
| `content-visibility` | Baseline | Daftar panjang (spell, item, Library) lebih cepat digambar |
| `light-dark()`, `oklch()` | Baseline | Tema terang dan gelap lebih ringkas, warna lebih merata |
| CSS nesting, `@scope` | Baseline, `@scope` Baseline 2026 | CSS lebih rapi, gaya tidak bocor antar bagian |
| `crypto.randomUUID`, `structuredClone`, `AbortController` | Baseline | ID karakter, salin data, batalkan fetch sinkron |
| `Intl` | Baseline | Format angka dan teks dua bahasa di Learn |
| Service worker navigation preload | Baseline | App terbuka lebih cepat saat ada versi baru |
| Long Animation Frames API | Chromium | Ukur bagian yang membuat app tersendat |

## Gaya kode
| Hal | Keadaan | Catatan |
|---|---|---|
| JS | Gaya ES5 (`var` sekitar 5.200 kali, tanpa modul, tanpa async di app) | Jalan di semua browser. Bukan masalah bagi pengguna, tapi menyulitkan perawatan |
| Ukuran | index.html 7,6 MB, 2,36 MB gzip | Builder dan data besar sudah ditunda (`data-defer`) |
| Kompresi | Belum dicek di server live (butuh token Access) | Zstandard Baseline 2026. Perlu cek header live |

## Di luar fitur browser (cek kedua, 2026-10-29)
| Area | Keadaan sekarang | Teknologi terbaru | Manfaat |
|---|---|---|---|
| Hosting | Cloudflare Pages + Pages Functions | Cloudflare Workers dengan static assets. Dokumen Cloudflare: Workers punya fitur lebih luas. Fitur khusus Workers: Cron Triggers, Workers Logs, Rate Limiting, Gradual Deployments, Image Resizing, Queues, source maps. Durable Objects disarankan lewat Workers. Panduan migrasi resmi tersedia | Siklus harian bisa pakai Cron sungguhan (sekarang menumpang request pertama tiap hari). Log error server. Rate limit API. Rilis bertahap. Tidak terkena antrean 1 build Pages |
| Build | build.py menggabung file, tanpa minify. JS sekitar 2,2 MB mentah | esbuild atau Lightning CSS untuk minify dan cek sintaks | File lebih kecil, app terbuka lebih cepat. Perlu dites tidak mengubah perilaku |
| Sinkron | Revisi dengan base dan force, menarik data saat app dibuka atau tampil lagi | CRDT (Yjs, Automerge) dan sinkron real-time lewat Durable Objects | CRDT tidak perlu: karakter hampir selalu diubah satu orang, dan artikel local-first menyarankan tidak memakai CRDT untuk data satu penulis. Real-time lewat Durable Objects bisa dipertimbangkan bila perlu perubahan langsung muncul di perangkat lain |
| Login | Cloudflare Access (email) | Passkeys (WebAuthn) | Perlu dicek apakah Access mendukung passkey sebagai metode login. Belum dicek |
| AI di browser | Tidak ada | Chrome built-in AI: Translator, Language Detector, Summarizer stabil sejak Chrome 138. Prompt API tercantum Chrome 148. Hanya Chrome | Tidak cocok jadi fitur utama karena hanya Chrome. Teks Learn ditulis tangan |
| Pengukuran | Tidak ada pengukuran performa di perangkat pengguna | Long Animation Frames API, metrik INP | Tahu bagian mana yang tersendat di HP pengguna |
| Kompresi live | Belum bisa dicek dari workspace (jaringan ke situs live ditolak) | Zstandard Baseline 2026, Brotli | Perlu dicek lewat GitHub Actions live-check |

Sumber tambahan:
- https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/
- https://developer.chrome.com/docs/ai/built-in-apis
- https://dev.to/raxxostudios/local-first-architecture-for-solo-apps-when-crdts-help-and-when-they-hurt-4pj0

## Cek ketiga (2026-10-29)
| Area | Keadaan sekarang | Teknologi terbaru | Temuan |
|---|---|---|---|
| Keamanan halaman | Tidak ada Content-Security-Policy di _headers. 198 pemakaian innerHTML (dengan esc()) | Trusted Types, Baseline Februari 2026, ditegakkan lewat CSP | Penting sejak ada Friends: app menampilkan nama, bio, dan karakter milik orang lain. CSP dan Trusted Types membuat browser menolak HTML yang belum disaring, jadi satu esc() yang terlewat tidak menjadi celah XSS |
| Kompresi | Belum dicek di live | Zstandard sebagai Content-Encoding, Baseline Februari 2026 | Dukungan zstd di Cloudflare untuk situs ini belum dicek |
| Database | D1, satu lokasi utama | D1 global read replication, masih Beta, butuh Sessions API lewat binding Worker | Tunggu GA. Bila pindah ke Workers, bisa dipakai untuk mempercepat baca dari Indonesia |
| Login | Cloudflare Access email | Mei 2026: Cloudflare jadi identity provider bawaan Access (login pakai akun Cloudflare). Halaman itu tidak menyebut passkey | Passkey untuk login Access belum terbukti ada. Passkey sendiri berarti membuat sistem login sendiri di luar Access, perubahan besar |
| PWA | Install, offline, wake lock, share | Push notification, Background Sync | Push tidak dipakai (U30, tanpa pancingan). Background Sync hanya Chrome dan Firefox |

Sumber:
- https://web.dev/blog/baseline-digest-feb-2026
- https://developers.cloudflare.com/d1/best-practices/read-replication/
- https://developers.cloudflare.com/changelog/post/2026-05-19-cloudflare-as-identity-provider/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/trusted-types

## Cek keempat: library dan aset (2026-10-29)
| Area | Keadaan sekarang | Temuan |
|---|---|---|
| Ekspor PDF | jsPDF 2.5.1 dan html2canvas 1.4.1 (keduanya rilis 2022), dimuat dari cdnjs saat dipakai | jsPDF di bawah 4.2.0 punya beberapa CVE 2026 (misal CVE-2026-25940, injeksi PDF lewat AcroForm). App hanya memakai addImage dari canvas sendiri, jadi kemungkinan tidak terkena, tapi versinya usang. Dimuat dari internet, jadi ekspor PDF tidak jalan offline (ada cadangan print). html2canvas tidak lagi aktif dikembangkan |
| Font | 22 file woff2 statis subset Latin, 653 KB base64 di dalam HTML | Variable font (satu file untuk banyak ketebalan) bisa memperkecil ukuran |
| Gambar | AVIF, `loading="lazy"`, `decoding="async"` | Sudah modern. `sizes="auto"` baru Baseline September 2026, bisa dipakai bila ada srcset |
| Tes aksesibilitas | tests/a11y_scan.py dengan axe-core | Sudah ada |

Sumber:
- https://advisories.gitlab.com/npm/jspdf/CVE-2026-25940/
