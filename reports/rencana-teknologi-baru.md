# Rencana teknologi baru untuk seluruh app (2026-10-29)

Teknologi buatan sendiri di atas fitur web terbaru (lihat claude/audit-teknologi-app.md). Kolom "Cek ide serupa" berisi hasil pencarian web 2026-10-29. "Tidak ditemukan" artinya tidak muncul di pencarian, bukan jaminan belum pernah ada di mana pun.

## Usulan
| No | Nama | Isi | Dibangun dari | Cek ide serupa | Status |
|---|---|---|---|---|---|
| N1 | Reverse Builder | Tulis tujuan ("AC minimal 18, Stealth minimal +7, level 5"), mesin mencari kombinasi species, background, score, feat dan armor yang sah, lalu menampilkan beberapa pilihan dengan untung-ruginya. Berjalan di Web Worker supaya layar tidak macet | Mesin derivasi builder, Web Worker | Tidak ditemukan untuk D&D 5e. Yang ada: kalkulator AC, planner Pathfinder Kingmaker, simulator | Diusulkan |
| N2 | Mesin waktu karakter | Setiap perubahan dicatat sebagai kejadian. Geser garis waktu untuk melihat sheet di titik mana pun, bandingkan dua titik, pulihkan. Tersimpan lokal di IndexedDB, ikut sinkron secara ringkas | Event log, IndexedDB, View Transitions | Pengguna D&D Beyond dan Demiplane meminta change log di forum, belum tersedia | Diusulkan |
| N3 | Struk angka dan diff pembaruan | Setiap angka di sheet membawa asal-usul (aturan, item, fitur, entri Library). Setelah app diperbarui, muncul daftar "angka yang berubah di karaktermu dan sebabnya" | Mesin derivasi, rincian di 11-ui-breakdown.js | D&D Beyond hanya memberi tooltip errata, tanpa diff per karakter | Diusulkan |
| N4 | Rekap sesi tanpa AI | Dari catatan kejadian N2: damage diterima, penyembuhan, spell dipakai, slot habis, rest, naik level. Kartu rekap bisa disimpan sebagai gambar. Jalan offline, tidak mengirim apa pun | N2, canvas | Alat yang ada membuat rekap dari rekaman suara memakai AI berbayar | Diusulkan |
| N5 | Sheet masa depan | Lihat karakter dari level sekarang sampai 20: grafik HP, AC, bonus serangan, slot spell. Rencanakan pilihan level berikutnya lebih dulu | Mesin derivasi builder, SVG | Planner ada di game lain (Pathfinder). Gabungan planner dengan sheet yang hidup tidak ditemukan | Diusulkan |
| N6 | Rules fuzzer | Alat Checker: membuat ribuan karakter sah secara acak lewat builder, lalu memeriksa aturan tetap (tidak ada NaN, slot sesuai tabel, ekspor lalu impor sama persis, AC masuk akal) | Builder, Node, tes | Teknik property testing sudah dikenal. Penerapan ke builder 5e tidak ditemukan | Diusulkan |
| N7 | Playbar sesuai situasi | Sheet mengenali situasi dari keadaannya sendiri: bertarung (Initiative dilempar, HP berubah), menjelajah, istirahat. Tombol yang relevan naik ke depan. Dihitung di HP, tidak disimpan (sejalan U30) | State sheet, View Transitions | Tidak ditemukan | Diusulkan |
| N8 | Migrator cascade layer | Alat build: memindahkan 36 file patch CSS ke `@layer` secara otomatis. Playwright membandingkan gaya hasil di semua layar sebelum dan sesudah, harus sama persis, baru `!important` dibuang satu per satu | Playwright, `@layer` | Tidak ditemukan | Diusulkan |

## Urutan yang disarankan
| Urutan | Usulan | Alasan |
|---|---|---|
| 1 | N6 Rules fuzzer | Menjaga kebenaran semua usulan lain |
| 2 | N3 Struk angka | Fondasi untuk N1, N5, dan U40 (Explain any number) di Learn |
| 3 | N2 Mesin waktu | Fondasi untuk N4 |
| 4 | N8 Migrator layer | Membuka jalan perbaikan CSS di audit (prioritas 4) |
| 5 | N1, N5, N4, N7 | Fitur yang terlihat pengguna |

## Batas
- Semua jalan di paket gratis Cloudflare dan di HP, tanpa AI berbayar.
- Tidak mengubah key localStorage atau bentuk data lama tanpa migrasi.
- N2 menambah data per karakter. Perlu batas (misal ringkas kejadian lama) supaya kuota cloud tidak habis.

## Sumber cek ide serupa
- https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/15530-character-sheet-change-logs
- https://forums.demiplane.com/t/can-we-track-changes-character-sheets/6158
- https://www.dndbeyond.com/changelog/373-official-errata-extra-life-adventure-tooltip
- https://myarchivist.ai/dnd-session-recap
- https://github.com/AClaybrook/DAndDSimulator
