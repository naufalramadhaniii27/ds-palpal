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
