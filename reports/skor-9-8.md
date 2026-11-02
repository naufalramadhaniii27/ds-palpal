# Skor 9,8: laporan kerja

Dokumen rencana: Project `claude/rencana-9-8-lengkap.md` dan `claude/langkah-teknis-9-8.md`. Salinan laporan ini ada di Project `claude/skor-9-8.md`.
Perintah ukur: `python3 tools/score.py` (penuh), `--quick` (hitungan dan ukuran berkas, detik), `--rescore FILE` (hitung ulang dari angka tersimpan), `--probe BAGIAN.UKURAN --limit N` (untuk git bisect).
Rumus nilai bagian: lantai + (10 - lantai) x (rata-rata kredit - rata-rata kredit awal) / (1 - rata-rata kredit awal). Lantai adalah nilai awal dari rencana. Kredit sebuah ukuran 0 di angka awal dan 1 di sasaran. Ukuran yang alatnya belum ada bernilai kredit 0. Jalan awal menghasilkan lantai persis, semua sasaran tercapai menghasilkan 10.

## Baseline (2026-11-02, branch nilai-98/n43-fase0, mode penuh)

| Bagian | Nilai awal | Ukuran | Sudah lolos di baseline |
|---|---|---|---|
| Logic aturan | 8 | 8 | 3 |
| Data dan Library | 7 | 5 | 2 |
| UI dan UX | 7 | 7 | 3 |
| Visual dan art | 7 | 5 | 2 |
| Kinerja | 6 | 10 | 0 |
| Keandalan | 7.5 | 8 | 2 |
| Tes dan proses | 7 | 6 | 4 |
| Kerapian kode | 5 | 12 | 0 |
| Keamanan | 8 | 7 | 2 |
| Aksesibilitas | 7 | 7 | 2 |

Rata-rata awal: 6,95 (rencana menyebut 7,1 karena memakai 12 baris, termasuk dua baris kinerja dan satu baris ukuran berkas).

## Beda antara dokumen dan kode nyata (kode menang)

| Hal | Dokumen | Kode nyata | Tindakan |
|---|---|---|---|
| Heap JS saat Home | 54 MB | 35,4 MB mentah, 29,3 MB sesudah GC paksa (Chromium 390x844, CPU x1) | Ukuran dipakai: `heap_home_raw_mb` (mentah). Sasaran 30 MB tetap. |
| Heap setelah builder dan Library dibuka | tidak ada | 65,6 MB | Sasaran 60 MB (dokumen: di bawah 60 MB) |
| FCP CPU x4 | 2,5 detik | 2,79 detik (median 3 jalan, 390x844) | Sasaran 1,5 detik |
| Home siap CPU x4 | 6,2 detik | 2,95 detik dengan definisi `ready` di `tests/measure.py` (Home atau sheet tergambar dan thread bebas) | Definisi `ready` dipakai, sasaran 2,5 detik |
| Buka sheet CPU x4 | 0,46 detik | 0,14 detik | Sudah di bawah sasaran 0,3 detik |
| Respons tap (INP) Heal CPU x4 | belum diukur | 184 ms (damage 200, heal 184, tab 92) | Sasaran 100 ms |
| Cari fireball di Library | belum diukur | 175 ms (CPU x1), 850 ms (CPU x4) | Sasaran 50 ms |
| Unduhan pertama bentuk split | sekitar 3,5 MB brotli | 0,92 MB brotli, 1,03 MB gzip (halaman pertama saja). Semua bagian: 21,6 MB mentah | Sudah di bawah 1,2 MB |
| `index.html` | 23,6 MB, 5,3 MB gzip | 24,09 MB, 5,44 MB gzip, 3,76 MB brotli | Anggaran: naik paling banyak 10 persen |
| `var` | 4.947 | 6.595 (regex `var\s` termasuk teks dalam string) | Dipakai angka 6.595 sebagai angka awal M1 |
| `function(` | 4.059 | 5.923 | idem |
| `innerHTML` dan sejenisnya | 235 + 13 | 262 (`.innerHTML =`, `insertAdjacentHTML`, `.outerHTML =`) | Angka awal N44 262 |
| `navStack` | 57 | 46 | angka awal M6 46 |
| `JSON.parse(JSON.stringify` | 44 | 50 | angka awal M10 50 |
| `MutationObserver` | 74 | 76 | angka awal M4 76 |
| `syncGet` | 1 | 2 (definisi dan satu pemakaian) | angka awal M7 2 |
| File CSS bernama patch atau versi | 3 | 7 (regex `patch` atau `v<angka>` di nama) | angka awal N34 7 |
| Baris di atas 300 karakter (selain `src/data`) | belum dihitung | 1.099 | angka awal Fase 3.3 |
| Perintah snapshot gaya | `style_snapshot.py --variants snap OUT` | `style_snapshot.py OUT.json --variants` (OUT dulu) | Dokumen salah, dipakai bentuk di kode |
| Snapshot gaya dua jalan build sama | dianggap 0 beda | 9.328 beda antar dua jalan build yang sama (HP berubah acak) | Diperbaiki: data disuntik lewat `add_init_script`, bukan `evaluate` lalu `reload`. Dua jalan sekarang 0 beda. |
| `overlap_scan` di 1250 | 7 temuan | 7 temuan, semua `.tx[Automotive]` 4 px | Diperbaiki di Fase 0 (padding tombol skill 8 jadi 4 px di kontainer sempit), 0 temuan |
| Tes `cloud_sync` | masuk Job | butuh `wrangler pages dev` | Dikeluarkan dari daftar tes biasa, dijalankan lewat `tools/run_cloud_sync.sh` (butir N40) |
| Tes `learn_a11y` dan `a11y_scan` | berjalan sendiri | butuh jalur `axe.min.js` | `AXE_JS` (bawaan `/home/claude/axe-tool/node_modules/axe-core/axe.min.js`, axe-core 4.10.2) |

## Riwayat

### 2026-11-02 N43 + Fase 0 (gelombang 1)
Hasil: kerangka skor (tools/score.py, targets, bisect), anggaran kinerja (tests/perf_budget.py + perf-budget.json), runner Job A-C (tools/run_jobs.py), CI tiga job + job skor. Job A sampai C hijau di mesin ini (26 tes, satu per satu).
Temuan dan perbaikan:
- Bug produk di src/boot/deferred-loader.js: bila daftar bagian kosong saat halaman masih dibaca, step() hanya menunggu DOMContentLoaded dan rantai berhenti, padahal parser menambah bagian sesudahnya. Builder tidak termuat sekitar separuh waktu (6 bagian tersisa, __deferDone 0). Perbaikan: ulangi step tiap 40 ms selama readyState loading. tg_ui dan tg_n2 lolos lagi.
- Bug tes: 25 tes menyiapkan data lewat goto, set storage, reload. Halaman lama menulis daftar karakter kembali saat reload, jadi karakter bisa menjadi New Character. Semua diganti init script yang dijaga sessionStorage (pola yang sama dengan style_snapshot).
- Beda dokumen dan kode: lihat tabel di atas. Heap dokumen 54 MB, nyata 35,4 MB mentah, 29,3 MB sesudah GC.
Sebelum/sesudah: skor baseline tidak berubah (perbaikan ini memperbaiki keandalan, bukan ukuran).

### 2026-11-02 N40 + Fase 1 (gelombang 1, lanjutan)
Alat baru (semua keluar dengan baris `SCORE n` untuk tools/score.py):
- tests/lib/chaos.js + tests/chaos_storage.py: kegagalan put IndexedDB, transaksi dibatalkan, QuotaExceededError di localStorage, fetch putus atau lambat. Seed menentukan kegagalan dan urutan aksi. Seed gagal ditulis ke reports/chaos-gagal.json, `--seed N` mengulang. Seed yang pernah menemukan bug (KNOWN) selalu jalan lebih dulu.
- tests/fail_modes.py: storage penuh, offline, dua tab, data rusak, tutup tab saat menulis, tanda cermin (cs-store-v1), ganti edisi 2024 ke 2014 dan sebaliknya. Dua ukuran layar. Dua perangkat tetap di tests/cloud_sync.py (lewat tools/run_cloud_sync.sh).
- tests/migrate_all.py: build tiap APP_VER 102 sampai 113 (index.html dari git) menyimpan data Yudhi, build sekarang membukanya. Tidak ada layar pemulihan, teks sheet dan jumlah roster sama dengan baseline. Versi sebelum 102 tidak punya commit per angka di riwayat, jadi tidak diuji.
- tools/flake_hunt.py (nama .py, bukan .sh seperti di rencana): ulang tiap tes N kali. Satu putaran penuh makan sekitar 40 menit, 10 putaran adalah run malam. Hasil 10 dari 10 belum dijalankan (lihat di bawah).
- Laporan error: src/boot/err-report.js, POST /api/err tanpa login, tabel errs dan errdev di D1, email dan angka 6 digit ke atas dihapus, 50 per perangkat per hari, 5000 per hari total, tampil di halaman Admin. Hanya https atau cs-err-test=1, mati dengan cs-err-off=1. tests/err_report.py: 10 cek lolos di D1 lokal.
Temuan produk:
- Bug nyata (seed 287, 3 dari 8 ulangan sebelum perbaikan): bila tulis cs-store-v1 gagal, tanda dihapus dan tidak ditulis lagi selama tidak ada kunci yang berubah status gagalnya. Start berikutnya masuk jalur lambat dan salinan IndexedDB lama menang atas localStorage yang lebih baru (temp HP kembali ke nilai lama). Perbaikan di src/boot/store-gate.js: MARKBAD, tanda ditulis ulang pada tulis cermin berikutnya yang berhasil dan saat pagehide. 10 dari 10 lolos sesudahnya. Uji tetap: fail_modes "mirror mark" (gagal tanpa perbaikan, lolos dengan perbaikan).
- Bug loader builder (gelombang 1): lihat entri sebelumnya.
- Catatan desain, bukan bug: salinan karakter aktif di cs-roster-v1 tertinggal dari kunci sheet sampai karakter diganti (rSnap). Kunci sheet adalah sumber kebenaran. Tes membandingkan hanya keberadaan salinan itu.
- Catatan UI: elemen hiasan di Home builder membawa atribut data-rs="2024" selain tombolnya. Tidak merusak, tapi selector `[data-rs]` ambigu. Tes memakai `button[data-rs]`.
Hasil 500 seed (sebelum perbaikan MARKBAD): 499 lolos, 1 gagal (seed 287), 3825 kegagalan disuntikkan. Sesudah perbaikan seed 287 lolos 10 dari 10. Ulang 500 seed penuh dengan build baru: lihat baris berikutnya.

## N44 html templates (in progress, branch nilai-98/n44)
- src/app/lib/html.js: 7.9 KB source, 4.4 KB minified, 2.0 KB gzip (plan target 3 KB minified, not met, gzip is under). tests/html_lib.py 17/17.
- Converted so far: death save pips, HP max button (src/app/09), speeds and defenses (src/app/23). Checked in browser at 390x844: pips render, tap sets aria-pressed, no page errors.
- Left: about 198 innerHTML sites. Lint rule not added yet.
