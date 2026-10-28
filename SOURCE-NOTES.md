# SOURCE-NOTES

Peta source untuk `index.html`. Hasil build `index.html` dan `sw.js`. Source ada di `src/`. Jangan edit `index.html` langsung.

## Perintah

| Perintah | Fungsi |
|---|---|
| `python3 build.py` | Gabung `src/` menjadi `index.html`, isi hash CACHE di `sw.js` (16 huruf awal sha256 index.html) |
| `python3 build.py --check` | Build di memori, bandingkan dengan `index.html` dan `sw.js` byte per byte, lalu `--lint`. Exit 1 jika beda atau lint gagal |
| `python3 build.py --lint` | `node --check` untuk tiap file JS di `src/` dan tiap blok `<script>` hasil gabungan |
| `python3 tests/scenarios.py [OUT] [--root DIR]` | Tiga skenario wajib (sheet lama Yudhi, sesudah Apply, karakter baru) di 390x844 dan 1250x850. Menulis screenshot dan isi localStorage ke OUT (default `tests/out/`, diabaikan git) |
| `python3 tests/measure.py [OUT.json] [--runs N] [--only "1250x850 cpu4x"]` | Waktu siap, data Builder selesai, Builder pertama dan kedua, Search pertama, di 390 dan 1250, CPU 1x dan 4x |
| `python3 tests/flow_home_sheet.py [OUT]` | Alur Home ke sheet ke Home dan ganti karakter, dengan video. Cek perpindahan tersambung jalan dan tidak ada yang tertinggal tersembunyi |
| `python3 tests/compare_storage.py RUN_A RUN_B` | Bandingkan localStorage dua run. Cap waktu dan hash snapshot ditutup |
| `sh tools/pages_dist.sh` | Cloudflare Pages: salin situs jadi (index.html, sw.js, manifest, _headers, img, icons) ke `dist/`. Source, tests, reports tidak ikut. Header ada di `_headers` |
| `python3 build.py --verify-split` | Tes lama pemecah otomatis (nama otomatis, hanya untuk cek). Tidak mengubah `src/` |

Alur edit: ubah file di `src/`, jalankan `python3 build.py`, lalu `python3 build.py --check` dan `python3 tests/scenarios.py`. Commit `src/`, `index.html`, dan `sw.js` bersama.

## Cara kerja

- `src/manifest.json` mendaftar urutan isi `index.html`. Entri `text` berisi teks pendek langsung. Entri `file` satu file markup. Entri `block` berisi tag pembuka, daftar file, tag penutup.
- Isi file digabung apa adanya. Tidak ada minify, tidak ada pengubahan teks. Karena itu hasil build identik byte per byte.
- Urutan file di manifest adalah urutan kode di halaman. Memindah kode antar file mengubah urutan eksekusi. Lakukan hanya dengan sengaja dan tes ulang.
- Menambah file baru: buat file di folder yang cocok, tambah namanya di `manifest.json` pada blok dan posisi yang benar.

## Folder

| Folder | Isi | Blok di halaman |
|---|---|---|
| `html/` | `head.html` (doctype, meta, head), `sheet-body.html` (markup sheet dan Home) | teks |
| `css/` | Satu blok `<style>`. Font tertanam, dasar, mobile, cetak, skin D&D Beyond, patch per versi, CSS efek (`-fx-`) | `<style>` |
| `boot/` | Skrip kecil sebelum aplikasi: debug overlay, reload, tanda kedatangan, splash builder, pemuat data tertunda | `<script>` masing-masing |
| `app/` | Aplikasi sheet dan Home. Satu IIFE "use strict" dari `00-open.wrap.js` sampai `98-close.wrap.js`, lalu `99-` di luar IIFE | `<script>` |
| `fx/` | Paket efek dan interaksi (MI core, F1 sampai F5, WOW, X, D, W, Y, Z, L, M, G, K). Tiap file berisi IIFE sendiri | `<script>` |
| `data/` | Data aturan dan isi buku. Tiap file satu blok `<script type="text/x-defer" data-defer="...">`. `data/db4/` adalah satu blok yang dipecah per topik | x-defer |
| `builder/` | Builder karakter. Satu IIFE dari `00-open.wrap.js` sampai `98-close.wrap.js`, dimuat tertunda (data-defer="builder") | x-defer |

Peran di nama file `app/` dan `builder/`: `logic` (hitung, simpan, impor), `ui` (render dan interaksi), `data` (tabel tetap), `boot` (mulai). Peran ditentukan dari isi utama bagian itu. Kode lama tersusun per patch, jadi beberapa file `ui` masih memuat sedikit logic dan sebaliknya. Pemisahan penuh butuh pemindahan kode (mengubah urutan), di luar T0.

File `*.wrap.js` hanya membuka atau menutup IIFE. File ini tidak lolos `node --check` sendirian dan dicek di dalam bloknya. Semua file JS lain lolos `node --check` sendiri.

## Data dan storage

T7: penyimpanan utama IndexedDB (database `dnd-sheet`, store `kv` untuk data dan `meta` untuk catatan migrasi). `boot/store-gate.js` (di head) membuat `window.__store` dengan API seperti localStorage (getItem, setItem, removeItem, key, length, clear, plus flush, mode, ready, failed, estimate, fast). Semua kode app, fx dan builder memakai `__store`, bukan `localStorage`.
- Setiap tulis masuk memori, IndexedDB, dan localStorage (cermin, selama muat). Kunci yang gagal dicermin dicatat di meta `lsFail` dan di localStorage `cs-store-v1`.
- Mulai cepat (biasa): `cs-store-v1` ada dan tidak ada kunci gagal. Memori diisi dari localStorage seketika, blok app dan fx jalan inline seperti sebelum T7. IndexedDB disamakan di latar belakang.
- Mulai lambat (pertama kali, data lebih besar dari localStorage, atau `cs-store-v1` hilang): `window.__storeHold=1`, blok app dan fx (dibuka dengan `if(!window.__storeHold){`) dilewati, lalu dijalankan ulang berurutan setelah IndexedDB dibaca. Markup disembunyikan dengan kelas `st-wait` (maks 4 detik). Skrip pendek setelah blok fx memanggil `__gateRun`. `boot/deferred-loader.js` menunggu `__gateDone`.
- Rekonsiliasi di mulai lambat, per kunci: kunci di `lsFail` memakai IndexedDB. Selain itu nilai localStorage yang beda menang (versi lama, tes, alat lain), termasuk kunci yang dihapus. localStorage tanpa data app: IndexedDB dipakai apa adanya.
- Migrasi pertama menyimpan salinan penuh localStorage di meta `__legacy-backup` dan membaca balik tiap nilai. localStorage lama tidak dihapus.
- Tanpa IndexedDB atau tanpa jawaban 2,5 detik: app jalan di localStorage seperti dulu (`__store.mode()` = "ls").
- Tes: `python3 tests/storage_idb.py`.

Key localStorage tidak berubah oleh T0. Key utama: `cs-roster-v1` (roster), `yudhi-kelapa-build-v3` (sheet aktif, nama lama tetap), `yudhi-kelapa-sheet-v1` (state main), `phb24-builder-v1` (build), `phb24-builder-v1-bak`, `cs-snap-v1`, `cs-ui-*`, `mi-*`.

## Peta file

Urutan sama dengan manifest. Ukuran dalam byte.

| File | Peran | Ukuran |
|---|---|---|
| html/head.html | markup | 5.524 |
| css/00-fonts.css | tampilan (CSS) | 638.228 |
| css/01-base-band-layout.css | tampilan (CSS) | 3.463 |
| css/02-hero.css | tampilan (CSS) | 24.805 |
| css/03-mobile.css | tampilan (CSS) | 4.994 |
| css/04-breakdowns-editor.css | tampilan (CSS) | 6.306 |
| css/05-detail-sheets.css | tampilan (CSS) | 3.734 |
| css/06-print-sheet.css | tampilan (CSS) | 7.595 |
| css/07-ddb-skin.css | tampilan (CSS) | 12.260 |
| css/08-patches-v15-v28.css | tampilan (CSS) | 36.873 |
| css/09-v29-motion-tokens-glass.css | tampilan (CSS) | 12.468 |
| css/10-v30-header-playbar-hp-conditions.css | tampilan (CSS) | 27.530 |
| css/11-v31-tabs-cards-panels.css | tampilan (CSS) | 31.536 |
| css/12-v32-v34-patches.css | tampilan (CSS) | 26.991 |
| css/13-v35-v38-high-contrast-cards-print.css | tampilan (CSS) | 40.539 |
| css/14-combo.css | tampilan (CSS) | 5.865 |
| css/15-v43-v45-patches.css | tampilan (CSS) | 26.764 |
| css/16-builder.css | tampilan (CSS) | 34.888 |
| css/17-caution-recovery-backup.css | tampilan (CSS) | 7.011 |
| css/18-hold-and-slide-confirm.css | tampilan (CSS) | 42.950 |
| css/19-fx-micro-interactions.css | efek (CSS) | 30.205 |
| css/20-fx-round6-wow-x-d-packs.css | efek (CSS) | 8.168 |
| css/21-ddb-polish-and-buttons.css | tampilan (CSS) | 14.516 |
| css/22-design-system-main-page.css | tampilan (CSS) | 9.308 |
| css/23-fx-w-pack.css | efek (CSS) | 23.197 |
| css/24-fx-y-pack.css | efek (CSS) | 18.507 |
| css/25-fx-z-l-m-packs.css | efek (CSS) | 19.693 |
| css/26-fx-g-pack.css | efek (CSS) | 10.902 |
| css/27-fx-k-pack.css | efek (CSS) | 4.884 |
| css/28-connected-home-sheet.css | efek (CSS) | 809 |
| boot/debug-overlay.js | boot | 2.178 |
| boot/reload-helper.js | boot | 1.500 |
| boot/arrive-flag.js | boot | 783 |
| html/sheet-body.html | markup | 17.767 |
| boot/busy-splash.js | boot | 704 |
| app/00-open.wrap.js | pembungkus IIFE | 29 |
| app/01-logic-boot-flags-builder-loader.js | Logic | 4.822 |
| app/02-data-default-character.js | Data | 13.980 |
| app/03-data-glossary.js | Data | 30.178 |
| app/04-logic-storage.js | Logic | 11.526 |
| app/05-logic-helpers.js | Logic | 10.071 |
| app/06-logic-derivation.js | Logic | 14.684 |
| app/07-ui-theme-contrast-spring.js | UI | 12.896 |
| app/08-ui-render-sheet-and-actions.js | UI | 51.342 |
| app/09-ui-hit-points-playbar-death-saves.js | UI | 12.512 |
| app/10-ui-conditions.js | UI | 3.215 |
| app/11-ui-breakdown.js | UI | 2.002 |
| app/12-ui-bottom-sheet-modal.js | UI | 5.862 |
| app/13-ui-detail-cards.js | UI | 22.697 |
| app/14-ui-editor.js | UI | 14.541 |
| app/15-logic-roster-backup-files-snapshots.js | Logic | 38.856 |
| app/16-logic-import-chat-text-and-build-files.js | Logic | 51.877 |
| app/17-logic-tab-sync-and-test-hooks.js | Logic | 9.089 |
| app/18-ui-header-and-more-menu.js | UI | 14.045 |
| app/19-ui-global-click-delegation.js | UI | 8.497 |
| app/20-ui-portrait.js | UI | 1.274 |
| app/21-ui-tabs-pager.js | UI | 10.298 |
| app/22-ui-spell-data-and-slots.js | UI | 9.579 |
| app/23-ui-uses-items-coins-rest-spell-dc.js | UI | 42.054 |
| app/24-ui-manage-spells.js | UI | 9.925 |
| app/25-ui-settings-appearance.js | UI | 7.749 |
| app/26-ui-customize.js | UI | 5.741 |
| app/27-ui-party-search-commands-library.js | UI | 77.254 |
| app/28-ui-bastion.js | UI | 17.759 |
| app/29-ui-ddb-look.js | UI | 42.603 |
| app/30-ui-icons.js | UI | 29.355 |
| app/31-ui-tour-and-focus.js | UI | 5.431 |
| app/32-logic-play-undo-actions.js | Logic | 39.349 |
| app/33-logic-play-rage-conditions.js | Logic | 2.820 |
| app/34-ui-situations.js | UI | 46.791 |
| app/35-ui-combo.js | UI | 24.239 |
| app/36-ui-printable-sheet.js | UI | 12.549 |
| app/37-ui-pdf-export-hold-slide-confirm.js | UI | 8.019 |
| app/38-boot-init.js | boot | 1.830 |
| app/39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js | UI | 20.968 |
| app/40-ui-segments-notes-swipe-motion-panels.js | UI | 41.003 |
| app/41-ui-edit-mode.js | UI | 14.910 |
| app/42-logic-pwa-qr-icons-wallet.js | Logic | 28.447 |
| app/98-close.wrap.js | pembungkus IIFE | 7 |
| app/99-ui-backup-reminder-handlers.js | UI | 664 |
| fx/01-core-router-and-switch.js | efek | 3.337 |
| fx/02-micro-interactions.js | efek | 41.492 |
| fx/03-f1-card-light-and-morph.js | efek | 9.065 |
| fx/04-f2-odometer-hp-bar-scrub.js | efek | 5.884 |
| fx/05-f3-indicator-dock-toast.js | efek | 3.287 |
| fx/06-f4-reveal-on-scroll.js | efek | 5.393 |
| fx/07-f5-moments.js | efek | 12.805 |
| fx/08-round6.js | efek | 9.544 |
| fx/09-wow-pack.js | efek | 8.832 |
| fx/10-x-pack.js | efek | 9.984 |
| fx/11-d-pack.js | efek | 5.717 |
| fx/12-mini-window-v2.js | efek | 6.409 |
| fx/13-class-colour-hp-ring.js | efek | 2.837 |
| fx/14-w-pack.js | efek | 13.015 |
| fx/15-y-pack.js | efek | 10.974 |
| fx/16-z-pack-dice-sound-hover.js | efek | 31.002 |
| fx/17-l-pack-webgl-sky.js | efek | 5.702 |
| fx/18-m-pack-rolls-concentration.js | efek | 22.361 |
| fx/19-g-pack-cinematic.js | efek | 17.548 |
| fx/20-k-pack-character-colour-icon.js | efek | 8.536 |
| fx/21-connected-home-sheet.js | efek | 9.032 |
| boot/deferred-loader.js | boot | 2.756 |
| data/db1-phb-skills-species-backgrounds-feats-weapons.js | data | 63.677 |
| data/db2-phb-classes-a.js | data | 34.635 |
| data/db3-phb-classes-b.js | data | 36.462 |
| data/cffull-class-feature-text.js | data | 75.983 |
| data/subfull-subclass-feature-text.js | data | 114.199 |
| data/spfull-spell-text.js | data | 295.719 |
| data/spells-spell-list.js | data | 92.649 |
| data/dmgi-magic-items-dmg2024.js | data | 601.970 |
| data/itsp-spells-from-items.js | data | 7.156 |
| data/db4/01-languages-auto-spells-grants-prices-gear.js | data | 28.571 |
| data/db4/02-limited-uses-damage-rows-save-notes.js | data | 29.069 |
| data/db4/03-lifestyle-containers-printed-pages.js | data | 34.920 |
| data/db4/04-creature-stat-blocks.js | data | 84.754 |
| data/db4/05-gifts-weights-quick-build-bastions.js | data | 33.342 |
| data/db4/06-tools-proficiencies-packs-kits.js | data | 4.268 |
| data/db4/07-actions.js | data | 16.479 |
| data/db4/08-mpmm-species.js | data | 29.941 |
| data/efa-eberron-forge-of-the-artificer.js | data | 102.616 |
| data/wotc01-sources-2025-feats-boons-spells.js | data | 164.763 |
| data/wotc02-subclasses-2025.js | data | 105.982 |
| data/wotc03-magic-items-2025.js | data | 60.909 |
| data/wotc04-species-lorwyn-ravenloft.js | data | 12.971 |
| data/wotc05-backgrounds-2025.js | data | 10.938 |
| data/wotc06-gear-2024.js | data | 13.273 |
| data/wotc07-feats-2014.js | data | 103.590 |
| data/wotc08-backgrounds-2014.js | data | 71.524 |
| data/wotc09-subclasses-2014.js | data | 370.689 |
| data/wotc10-species-2014.js | data | 147.168 |
| data/wotc11-magic-items-2014.js | data | 1.006.392 |
| data/wotc12-spells-2014.js | data | 161.988 |
| data/wotc13-creature-stat-blocks.js | data | 79.580 |
| data/wotc14-gear-2014.js | data | 116.164 |
| data/wotc15-class-options-2014.js | data | 24.689 |
| data/hbpack-builtin-homebrew.js | data | 49.671 |
| builder/00-open.wrap.js | pembungkus IIFE | 28 |
| builder/01-logic-core-helpers.js | Logic | 2.048 |
| builder/02-data-magic-item-summaries.js | Data | 58.046 |
| builder/03-logic-magic-item-effects.js | Logic | 3.957 |
| builder/04-logic-storage.js | Logic | 1.164 |
| builder/05-logic-choice-model-ruleset.js | Logic | 2.544 |
| builder/06-data-2014-classes.js | Data | 139.869 |
| builder/07-data-2014-spells.js | Data | 431.814 |
| builder/08-logic-2014-rules.js | Logic | 16.285 |
| builder/09-logic-feats-and-choices.js | Logic | 47.909 |
| builder/10-logic-v17-additions.js | Logic | 18.011 |
| builder/11-logic-derivation.js | Logic | 10.560 |
| builder/12-logic-export-to-sheet.js | Logic | 62.539 |
| builder/13-logic-sources-and-packs.js | Logic | 10.199 |
| builder/14-logic-multiclass-hp-shop.js | Logic | 20.075 |
| builder/15-logic-import-from-sheet.js | Logic | 13.865 |
| builder/16-logic-feature-numbers.js | Logic | 8.883 |
| builder/17-ui-step-builder.js | UI | 23.900 |
| builder/18-ui-spells.js | UI | 19.327 |
| builder/19-ui-steps-sources-class-bg-species-abilities.js | UI | 32.917 |
| builder/20-ui-steps-equipment-next.js | UI | 24.340 |
| builder/21-ui-rules-reference.js | UI | 23.093 |
| builder/22-ui-shell.js | UI | 18.828 |
| builder/23-logic-level-up-and-build-files.js | Logic | 28.021 |
| builder/24-ui-icons.js | UI | 5.226 |
| builder/25-logic-hooks-for-the-sheet.js | Logic | 11.378 |
| builder/98-close.wrap.js | pembungkus IIFE | 7 |
| data/rs14-2014-wording.js | data | 1.686 |

## Tambahan sejak peta di atas dibuat

File di manifest yang belum tercatat di tabel utama. Urutan ikut manifest. Catatan: `fx/23-class-art-data.js` dimuat sebelum `app/00-open.wrap.js` supaya `window.__ART` sudah ada saat Home pertama digambar.

| File | Peran | Ukuran |
|---|---|---|
| css/29-motion-off.css | CSS | 695 |
| css/30-tap-44.css | CSS | 1.122 |
| css/31-home-hero.css | CSS | 8.654 |
| css/32-class-art.css | CSS | 2.254 |
| fx/23-class-art-data.js | efek | 16.535 |
| fx/22-home-hero.js | efek | 1.030 |
| fx/24-class-art.js | efek | 7.217 |

## Seni gambar (T6)

| Tempat | Isi |
|---|---|
| `img/` | Hasil pipeline, AVIF. Dilayani sebagai file statis, di-cache `sw.js` saat dipakai. Jangan diedit tangan |
| `img/manifest.json` | Peta gambar. Salinan JS ada di `src/fx/23-class-art-data.js` (`window.__ART`) |
| `tools/art_pipeline.py` | `python3 tools/art_pipeline.py SRC_DIR [--only emblems,scenes,icons,scenes2,vignettes,subclass]`. SRC_DIR adalah folder PNG dari branch Codex `art-batch` (`art/batch`). Jalankan ulang bila Codex menambah gambar |
| `src/fx/24-class-art.js` | Dua lapis `.cls-art-l` bergantian (crossfade) di belakang sheet. Scene kelas untuk Main dan Skills, scene tab untuk tab lain. Lapis `.bld-art` di dalam `#bld` untuk langkah Builder. Pembantu: `__artIc(cat,name)` ikon, `__artVig(grup,id,px)` gambar momen, `__artSub(kelas,sub,px)` emblem subclass, `__bldArt(step,B)` dipanggil `render()` Builder, `__miArtH` baris Settings |
| `tools/scene_contrast.py` | Audit kontras scene. `--write` menyimpan opasitas maksimum per scene (kunci `o`). Jalankan setelah `art_pipeline.py` |
| `src/css/32-class-art.css` | Gaya semua lapis dan gambar kecil. Saklar Art Off (`mi-clsart`), kontras tinggi dan cetak menyembunyikannya |

Folder gambar: `g0/frame-portrait` (bingkai kayu untuk pilihan Carved wood) dan `g0/home-inn-phone` (latar Home), `portrait/<species>-a|b` (20 potret, dipilih dari lembar Portrait di `app/20-ui-portrait.js`), `emblem/<kelas>`, `emblem/sub/<kelas>-<subclass>`, `scene/<kelas>-pc|phone`, `icon/<jenis>/<slug>`, `scn/<grup>/<id>-pc|phone` (tab, builder, screen, species, background), `vig/<grup>/<id>` (empty, moment, state).

Tes terkait: `tests/class_art.py`, `portrait_pick.py`, `builder_art.py`, `vignettes.py`, `sub_art.py`, `audio_ctx.py`, `lib_drag.py`, `builder_pal.py`.

## Sinkron cloud (T8, tahap 3)

| Tempat | Isi |
|---|---|
| `functions/api/[[path]].js` | API Pages Functions, hanya `/api/*` (`dist/_routes.json` dari `tools/pages_dist.sh`). Identitas dari JWT Cloudflare Access (header `Cf-Access-Jwt-Assertion`), dicek ke kunci tim, `ACCESS_AUD` dan `iss`. Service token dapat 403. Endpoint: `GET health`, `GET me`, `GET chars`, `GET/PUT/DELETE chars/:id`, `GET chars/:id/versions[/:rev]`. PUT menerima teks mentah (tidak di-parse, batas CPU 10 ms), `?base=rev&force=1`, header `x-name`, `x-sub` |
| `wrangler.toml` | Konfigurasi Pages: binding D1 `DB` (database `dnd-sheet`), variabel `ACCESS_TEAM`, `ACCESS_AUD`. File ini menggantikan pengaturan binding dan variabel di dashboard |
| Tabel D1 | `users`, `chars` (owner, id, rev, t, name, sub, data, size, deleted, vt), `versions` (maks 30 per karakter), `usage` (per pengguna per hari), `state` (hari, mode). Dibuat otomatis oleh API |
| Siklus harian | Request pertama tiap hari UTC: pangkas versi, kosongkan recycle bin lebih dari 30 hari, hapus usage lebih dari 40 hari, tentukan mode (normal, save di atas 70 persen, pause di atas 90 persen jatah gratis kemarin). Tanpa Cron |
| Jatah | Per pengguna per hari 1.000 request, 1.200 baris tulis, 20.000 baris baca. 50 MB, 50 karakter, 1 MB per karakter |
| `src/app/43-logic-cloud-sync.js` | Klien. Mulai setelah builder selesai dimuat (`bldready`). Satuan sinkron = satu entri roster (karakter terbuka dibaca dari slot tersimpan). Hash teks menentukan perubahan. Bentrok: perangkat ini menang, salinan lain disimpan sebagai versi `other-device`. Karakter terbuka yang berubah di cloud diganti hanya saat app mulai atau kembali ke layar (reload). Status di `cs-sync-v1`. Log singkat di sessionStorage `cs-sync-log` |
| `src/css/34-cloud-sync.css` | Tombol awan di header sheet dan Home, dialog Cloud backup (versi, recycle bin, Restore as copy) |
| `sw.js` | `/api/*` tidak pernah lewat cache |

Tes: `tests/cloud_sync.py` (butuh `wrangler pages dev --port 8788 --binding DEV_USER=a@test.dev --binding ACCESS_TEAM=` di root repo), `node tests/api_jwt.mjs`, `tests/live_check.py` (health dan cek token di situs live).
`DEV_USER` hanya untuk tes lokal: dipakai bila `ACCESS_TEAM` kosong (`--binding ACCESS_TEAM=`). Jangan diset di Cloudflare. `ACCESS_AUD` kosong berarti semua aplikasi Access di tim diterima. `/api/health` menampilkan AUD dari token supaya bisa diisi.

## Riwayat

- bf7444a: `src/` pertama, dipecah otomatis per 25 KB di baris banner, nama dari teks banner.
- T0 (commit ini): dipotong ulang di batas bagian yang bermakna (banner `=====` dan `----------` dari source asli), dipisah per peran, nama file dari isi. Tiap potongan berada di batas pernyataan tingkat atas (dicek dengan parser acorn), jadi tiap file JS lolos `node --check`. Isi digabung tetap identik byte per byte dengan `index.html` v102 (sha256 aac631cf...).
- T1 (branch t1-seamless): pemuat data Builder per irisan 10 ms sejak frame kedua, tap sebelum pemuat siap tidak hilang, perpindahan tersambung Home dan sheet (`fx/21-connected-home-sheet.js`, `css/28-connected-home-sheet.css`, `boot/arrive-flag.js`, kunci sessionStorage `mi-cx`).
- T5 dan T6 (branch t5-high-tech): satu AudioContext bersama, drag dari Library, daftar lompat Builder, seni gambar per kelas, tab, langkah Builder, empty state, momen dan subclass.
