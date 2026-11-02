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
- Converted so far: death save pips, HP max button (src/app/09), speeds and defenses (src/app/23), update toast, QR play button and QR progress dots (src/app/42). render() redraws when something else overwrote the element. Checked in browser at 390x844: pips render, tap sets aria-pressed, no page errors.
- Left: about 198 innerHTML sites. Lint rule not added yet.

## Job A-C on M1 + N46 + N44 (branch nilai-98/n44, 2026-11-02)
- tools/run_jobs.py A B C --retry: 32 tests, 0 failed, 2524 s. chaos_storage 50 seeds ok, migrate_all ok, tsc_gate ok, perf_budget ok.
- Not yet run: style snapshot (tests/style_snapshot.py --variants), 2014 edition scenarios at both viewports by hand, 500-seed chaos on the final build, CI.
- Style snapshot (--variants), origin/main vs nilai-98/n44: 74 screens, 64700 elements, 0 differences.
- CI run 41413337680: Job C2 failed once at 'A uploads its character' (1250x850), rerun of the failed job passed. Treated as a flake of tests/cloud_sync.py (race between first start and seeding). Needs the Fase 1.1 flake hunt (10 runs).
- Bug found by tsc_gate (CI Job A) in my N44 change: QR progress dots removal dropped the `var k` used by the final loop in qrScanStep. Fixed with `let k`. No test covers QR scan completion (gap, to add).
- tests/cloud_sync.py: "A uploads its character" failed in CI 2 of 3 runs at 1250x850. Cause: seeding after first load raced with the first start, which uploaded a blank "New Character". Now seeded by an init script before the first script (same method as the other 24 tests). 3 local runs 39/39.
- Local note: repeated runs of run_cloud_sync.sh fill the local D1 daily quota (HTTP 429) and stale workerd processes give HTTP 500. Fix: pkill -x workerd; rm -rf .wrangler/state.

## M15 fonts as files (branch nilai-98/m15)
- tools/split_dist.py: 20 base64 fonts in the CSS (22 files with unicode-range subsets) become dist/fonts/FAMILY-WEIGHT.HASH.woff2. Preload for Roboto 400 and 500 (Latin subset). sw.js stores all 22 at install and answers them from cache first. The single-file index.html of the project root is unchanged (fonts stay base64 there, as the plan says).
- Hosting form index.html: 2,473,064 -> 1,805,538 bytes (-667,526, about -652 KB). gzip 521,847 bytes.
- tests/fonts_dist.py 8/8 (no data URI left, 22 files, preloaded fonts requested first, all stored by the service worker, fonts load offline, no page errors). Added to Job A in CI and to tools/run_jobs.py Job B.
- Style snapshot with --variants on dist vs single file: 74 screens, 64700 elements, 0 differences. csp_check, split_dist, scenarios, off_mode pass.
- CI m15 run: chaos_storage seeds 13 and 29 failed with "key lost: cs-rcpt-v1" (12 local reruns of both seeds: 0 failures). The key is a receipt cache rebuilt on every start by a timer, so a tab closed in that window may lose it; no user data. Added to VOLATILE in tests/chaos_storage.py with the reason. Decision logged here, open to reversal if the receipt must be durable.

## UI: detail panel picture (branch nilai-98/ui-detail-img, user report 2026-11-02 18:53)
- Problem: sheet detail cards (Background: Soldier, Size, items such as Potion of Healing) showed a huge generic outline icon (book, paw), while the chip on the hero card showed the right picture. Cause: sheetIco() in src/app/12 used a fixed generic icon for Background and Size, and Codex icon lookup only (no 5etools picture).
- Fix: order is now 5etools picture (window.QIMG, same tables as the Library, new wm5()), then the Codex icon (same as the chip: background, size, species), then the generic one.
- tests/detail_img.py 8/8 (390x844 and 1250x850): Soldier uses data/img/backgrounds/XPHB/Soldier.webp, Size uses img/icon/size/medium, Potion of Healing uses data/img/items/XDMG/Potion of Healing.webp. In Job C and CI.
- Not changed: small row icons in Inventory. Potion of Healing has no Codex icon in img/icon/item yet (the PNG is in art-batch, installed in the last step). A 5etools picture is a wide illustration, unreadable at 24 px, so rows wait for the Codex icons.

## Aturan gambar (keputusan 2026-11-02 19:39, disepakati dengan sesi lain)
- Ikon kecil (baris daftar, inventory, chip) selalu memakai ikon Codex bila ada, walaupun 5etools punya gambar entri itu. Alasan: gambar 5etools berbentuk ilustrasi lebar, tidak terbaca di 24 px.
- Panel detail besar memakai gambar 5etools lebih dulu, lalu ikon Codex, lalu ikon generik (sudah dikerjakan di nilai-98/ui-detail-img, sheetIco/wm5 di src/app/12).
- Angka: sekitar 470 ikon sudah dibuat Codex di art-batch tapi belum dipasang di main. 393 ikon ada di daftar tapi belum dibuat Codex (antrean grid G01 sampai G04).
- Akibat untuk pemasangan akhir: pemasangan 1 Nov (tools/art_icons2.py) melewati ikon yang entrinya punya gambar 5etools. Itu dibalik: semua ikon Codex dipasang. Contoh yang terkena: Potion of Healing.

## N44 ratchet
- tools/html_gate.py counts innerHTML/outerHTML assignments and insertAdjacentHTML in src/ (not src/data, css, lib/html.js). Baseline 255 sites in 61 files (tools/html-baseline.json). A file may not get more. In Job A and CI. This is the number to bring to 0.
- Bug found by detail_img while converting: render(raw(x), el) with a lone raw() threw "Invalid value used as weak map key" (render expected a template). The playbar icon commit (a few minutes on branch nilai-98/n44b, never merged) had that bug. Fixed in lib/html.js (a lone raw, string, number or array draws like html`${x}`), 3 new cases in tests/html_lib.py (20/20), and tests/detail_img.py now also checks playbar icons, pips, speeds and condition chips.
- N44 sites now 248 (from 255 baseline): condition chips, playbar icons, swipe dots, sheet watermark.
## N32 part trace (branch nilai-98/n32)
- src/boot/deferred-loader.js: two lines call window.__deferHook around each part (only tests/lib/trace.js sets it). tests/lib/trace.js records globals and registry key changes per part, then wraps part globals in a Proxy that counts reads per screen. tests/trace_screens.py runs the 74 screens of style_snapshot at 6 viewport/variant combinations. tools/split_plan.py writes reports/split-plan.md.
- Result: 34 parts, 185 globals, each owned by exactly one part (0 shared). 9 shared tables listed (AUTO, BACKGROUNDS, CLASSES, DMGI, FEATS, SPECIES, SPELLS, SPELL_FULL, SUB_FULL, each filled by 2 to 6 parts). Only one part removes registry keys (the applyPacks style one).
- Caveat found: the Library index build reads most data parts in the background, so "core" is overstated (16 parts) in split-plan.md. True core needs a second trace with that build switched off. Not done yet.
- Not done: the cross-check build with the plan and the guard (Fase 2.2).
## N32 second trace (nilai-98/n32b)
- Added test hook window.__noLibIdx (libIndex returns []), set only by CS_TRACE_NOLIB=1 in tests/style_snapshot.py. Result: reads under the last screen ("library") stay at 10,228,878 with or without the index. So the index is not the only background reader. Another reader (libXs and the library list) runs after the last screen mark.
- Finding: the Proxy method cannot rank sheet screens. Sheet tabs show 0 to 1 reads of data globals, because app code keeps references taken before the proxies are installed (they are installed after "bldready"). Counting reads does not give the core tier.
- Decision: for Fase 2.2 use a guard instead of counting. Make each deferred global a getter that logs the first read per screen and install it before app code runs. N33 and the loader plan wait for that guard.
- Update: trace.js now installs getters at part load (not after bldready). 29 globals show reads; boot 2,916, sheet tabs 1 to 10 each. Tiers (Library index off): core 4, on demand 11, never read 14, changeable 1, no global 4.
- Doubt: db1 to db4 and spells show "never read" although the sheet shows species and classes. Likely the app reads them through registries (builder adds keys to CLASSES, SPECIES) or through const bindings that are not window properties. Do not split on this table alone. Fase 2.2 guard must also cover those registries.
- Third trace (nilai-98/n32c): trace.js now swaps var globals for counting Proxies (a classic-script var cannot be redefined) and separates reads made while a part loads ("load") from screen reads. Sheet render at boot reads db1, db2, db4, spells, dmgi, subfull, spfull, cffull, itsp, hbpack: these stay core. Doubt from before is resolved.
- tools/split_plan.py new section "Lazy candidates": parts with no shared-table keys and only Library reads. Result: q7 (monster rows, 4.7 MB) and wotc3 to wotc6, wotc8, wotc10, wotc11, wotc13 to wotc15. Total 6.2 MB of 20.9 MB deferred data (30%). These feed Fase 2.2 and N33. wotc1, wotc2, wotc7, wotc9, wotc12, tp1, efa, db3 add keys to shared tables, so they stay.
- Caveat: 74 screens only. The guard in Fase 2.2 must load a lazy part synchronously on first read, so a missed screen costs a delay, not an error.
- Correction (static scan of the 11 lazy candidates): most of them change shared objects that the trace does not track as registry keys. wotc3 and wotc11 add to ITEM_SPELLS (read at boot). wotc4 and wotc10 change ACTS, DEF_SP, LU_X, SP_AUTO, SAVE_NOTES, TOOLS. wotc6 changes GEAR, ITEMDESC, MOUNTT. wotc8 changes TOOLS. wotc13 changes CREATURES. wotc15 changes CLASSES and OPTS. Moving them later would drop data from the sheet until they load.
- Real lazy set: q7 (4.7 MB, only adds monster rows to QREFS.monster), wotc5 (9 KB) and wotc14 (111 KB, WX and WXG only). That is 4.9 MB, 23% of deferred data. Readers of QREFS.monster: the Library and builder wxRef() at builder start. wxRef must read monster rows only when asked, then a guard can load q7 on the first read.
- split_plan.py list is a first filter only. It needs the static scan (shared objects written by a part) to become the rule.
## Fase 2.2 first lazy part (branch nilai-98/f22-lazy)
- Loader: a part with data-lazy="1" is skipped by the normal run. window.__lazyRun(name) runs it. The page reads the file 2.5 s after it is ready and keeps the text (a synchronous request offline does not reach the service worker cache: found by the offline test, fixed).
- q7 (monster rows, 4.7 MB) is lazy. New stub part q7s makes QREFS.monster a getter that runs q7 on the first read. wxRef() builds QLIVE.monster the same way, so the builder does not read it at start. Library search and the QLIVE test hook read it.
- split_dist.py keeps the data-lazy attribute. New test tests/lazy_parts.py: single file and dist, 390 and 1250, not loaded at ready, loads on first Library search, gone after, QLIVE has monster, offline dist finds a monster. 100 percent.
- Measured JS heap at ready (CDP, after GC, 3 runs each, old sheet, 390x844): main 29.4 MB, now 24.8 MB. That is 4.6 MB (16 percent) lower. Parse time of 4.7 MB is no longer in the first load.
- Not done yet: wotc5 and wotc14 (120 KB), the guard that counts reads of unloaded parts, other tiers. Full jobs run in CI.
