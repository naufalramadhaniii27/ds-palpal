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
| `sh tools/pages_dist.sh` | Cloudflare Pages: salin situs jadi (index.html, sw.js, manifest, _headers, img, icons) ke `dist/`. Source, tests, reports tidak ikut. Header ada di `_headers`. Sesudah salin, `tools/split_dist.py` memecah 34 bagian tunda jadi `dist/p/NAME.HASH.js` (lihat bagian Build terpecah) |
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
| `app/` | Aplikasi sheet dan Home. Modul ES, entry `main.js`, dibundel esbuild jadi satu IIFE strict | `<script>` |
| `fx/` | Paket efek dan interaksi (MI core, F1 sampai F5, WOW, X, D, W, Y, Z, L, M, G, K). Tiap file berisi IIFE sendiri | `<script>` |
| `data/` | Data aturan dan isi buku. Tiap file satu blok `<script type="text/x-defer" data-defer="...">`. `data/db4/` adalah satu blok yang dipecah per topik | x-defer |
| `builder/` | Builder karakter. Modul ES, entry `main.js`, dibundel esbuild, dimuat tertunda (data-defer="builder") | x-defer |

Peran di nama file `app/` dan `builder/`: `logic` (hitung, simpan, impor), `ui` (render dan interaksi), `data` (tabel tetap), `boot` (mulai). Peran ditentukan dari isi utama bagian itu. Kode lama tersusun per patch, jadi beberapa file `ui` masih memuat sedikit logic dan sebaliknya. Pemisahan penuh butuh pemindahan kode (mengubah urutan), di luar T0.

Blok modul (`app`, `builder`, `learn`, `tg`) punya kunci `entry` di `manifest.json`. `build.py` memanggil esbuild untuk membundel entry dan semua `import` jadi satu IIFE strict. File `pre` (kode klasik yang juga jalan di node atau harus global) ditaruh di depan bundel.
Aturan modul: satu file hanya mengimpor file yang lebih awal di manifest, jadi urutan jalan sama dengan dulu. Nama yang dipakai file awal dari file akhir (hanya saat dipanggil) lewat `__R` di `00-reg.js`. Nilai yang ditulis dari file lain lewat fungsi `__set_Nama`. Fungsi yang dipakai saat muat harus ada di file yang sama atau lebih awal. `node tools/esm_codemod.js <blok>` mengecek aturan ini. `tests/names_lint.py` mengecek nama tanpa deklarasi.
Blok `fx` tetap klasik: tiap file sudah satu closure sendiri dan tidak berbagi nama.

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
| data/fx-A-class-species.js | data (fx, registry GX) | 4.271 |
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

## Friends dan potret cloud (T9, tahap 3 sisa, 3b, 4)

| Tempat | Isi |
|---|---|
| API skema 2 | Kolom baru di users (username, code, bio, avatar, prefs, prefs_t, seen, active) dan chars (vis, copy_ok, pin, sum, from_user). Tabel follows, blocks, shares, copy_requests, portraits. Dipasang otomatis sekali (`state.schema = 2`), data lama tetap |
| Endpoint baru | `GET/PUT me`, `POST seen`, `GET/PUT prefs`, `GET friends`, `GET users/:id-username-kode`, `POST/DELETE follow/:x`, `POST/DELETE block/:x`, `GET/PUT chars/:id/meta`, `GET shared`, `GET feed`, `GET view/:owner/:id`, `PUT pic/:id`, `GET pic/:owner/:id`, `POST copy/:owner/:id`, `POST requests/:id/approve|decline`, `DELETE requests/:id`, `GET admin` |
| Aturan | Lihat, share, dan minta salinan hanya untuk teman mutual yang tidak saling blokir. Unfollow atau blokir mencabut share dan permintaan terbuka di antara keduanya. Salinan dibuat dengan SQL INSERT ... SELECT. Batas harian: 50 follow, 20 share, 10 permintaan salinan |
| Admin | Orang pertama yang login (users.created paling awal). Email tidak pernah dikirim API |
| `src/app/43-logic-cloud-sync.js` | Tambahan: potret upload terpisah (teks karakter memuat `cloud:<hash>`), ringkasan `x-sum` untuk grid, pengaturan `PF_KEYS` ikut sinkron, banner risiko (belum ter-backup lebih dari 3 hari, ruang cloud 90 persen) |
| `src/app/44-ui-friends.js` | Tombol Friends di Home (titik kecil untuk follower, permintaan, share baru), dialog dengan tab Profile, Friends, Sharing, Requests, Shared, Feed, Admin. View only: `FROZEN="view"`, data teman dimuat ke memori, Close memuat ulang |
| `src/css/35-friends.css` | Gaya dialog Friends, grid kartu, bar view only |
| `31-ui-tour-and-focus.js` | `#syBan` dan `#frBar` tidak dibuat inert saat Home terbuka |

Tes: `tests/api_social.py` (37 cek aturan API, tiga orang lewat header `x-dev-user` yang hanya aktif bila `ACCESS_TEAM` kosong), `tests/friends_ui.py` (29), `tests/sync_banners.py` (9), `tests/cloud_sync.py` (31, termasuk potret dan pengaturan).

## Riwayat

- bf7444a: `src/` pertama, dipecah otomatis per 25 KB di baris banner, nama dari teks banner.
- T0 (commit ini): dipotong ulang di batas bagian yang bermakna (banner `=====` dan `----------` dari source asli), dipisah per peran, nama file dari isi. Tiap potongan berada di batas pernyataan tingkat atas (dicek dengan parser acorn), jadi tiap file JS lolos `node --check`. Isi digabung tetap identik byte per byte dengan `index.html` v102 (sha256 aac631cf...).
- T1 (branch t1-seamless): pemuat data Builder per irisan 10 ms sejak frame kedua, tap sebelum pemuat siap tidak hilang, perpindahan tersambung Home dan sheet (`fx/21-connected-home-sheet.js`, `css/28-connected-home-sheet.css`, `boot/arrive-flag.js`, kunci sessionStorage `mi-cx`).
- T5 dan T6 (branch t5-high-tech): satu AudioContext bersama, drag dari Library, daftar lompat Builder, seni gambar per kelas, tab, langkah Builder, empty state, momen dan subclass.


## T10 Rapikan (branch t10-tidy)
- src/css/36-tidy.css dimuat paling akhir di blok CSS. Isinya perbaikan kecil dari audit screenshot. Aturan lama tidak diubah kecuali warna biru Temporary HP (token --tx-blue di 10-v30) dan dua nilai skala di 32 dan 35.
- app/40: edgeRows() memberi kelas ovf-l dan ovf-r pada #tabs dan .bnav, CSS memberi pudar tepi.
- tests/tidy.py memeriksa judul Home, siluet, pudar tepi, kartu hover ability, kontras Temporary HP dan tombol inventory di skin Record.

## T11 Teknologi dan Learn (branch t7-storage, rilis 0.0.3)
| File | Isi |
|---|---|
| build.py | `learn_lint()` (gerbang bahasa Learn), `minify()` esbuild per blok, `with_csp()` CSP dengan hash script. CSS app dibungkus `@layer app`, file `css/L-*.css` di layer sendiri (urutan `app, feat, learn, dice`) |
| tools/build/ | esbuild, BabylonJS, Havok (versi dikunci, `npm ci --prefix tools/build`) |
| tools/learn_lint.js | Cek teks Learn: panjang kalimat EN 14 dan ID 12 kata, 2 kalimat per teks, kata kaku Indonesia, angka sama di dua bahasa, kunci kamus |
| src/fx/25-dice3d.js | Dadu 3D sendiri (N27): WebGL 1, lintasan dihitung, tanpa mesin fisika. dice-box, Babylon, Havok dihapus 2026-10-30 |
| tools/important_trim.py | Analisis dan pembuangan !important yang tidak berpengaruh |
| src/boot/trusted-types.js | Policy Trusted Types `default` dan `cs-loader` |
| src/app/45-learn-bridge.js | `window.__app`: fungsi app yang dipakai Learn (app berjalan di satu closure) |
| src/learn/00 sampai 99 | Learn, blok tunda `data-defer="learn"`: 45 data dua bahasa, 46 progres, dadu, Anchor Spotlight (`window.__spot`), 47 tampilan. Key `cs-learn-v1` (ikut PF_KEYS) |
| src/css/L-learn.css, L-dice.css | Tampilan Learn, sorotan sheet, band Home. Baki dadu 3D |
| src/fx/25-dice3d.js | `window.__dice3d.roll([20,20])`, dimuat saat lemparan pertama |
| tests | learn_flow, dice_app, fx_tier, back_home, overlay_snapshot, style_snapshot (--variants), csp_check, pdf_export, replay_report, fuzz_rules |

### Sesudah 0.0.3 (rilis 0.0.4)
| File | Isi |
|---|---|
| src/app/46-logic-receipts.js | N3 struk angka sesudah update (`cs-rcpt-v1`), N13, N16 |
| src/app/47-logic-time-machine.js | N2 History (`cs-tm-<id>`), `window.__tm` |
| src/app/48-logic-sync-merge.js | N12 gabung per bagian: `cs-sync-base-<id>` (salinan dasar), `cs-sync-mg-<id>` (bagian yang dipilih), `window.__syMerge`. Dipanggil dari 43 |
| src/app/49-logic-status-and-odds.js | N17 status chat, N10 peluang, N9 rules check, N4 rekap sesi, N15 tanya aturan (tabel `ASK`), N11 Build DNA (`#build=`), N5 sheet masa depan, D2 lempar death save dan Hit Point Dice |
| src/app/50-logic-reverse-builder.js | N1 Find a build. Hook builder `__bldOpts`, `__bldUse` di builder 25 |
| src/app/51-ui-table-help.js | U7 Which die, U3 contekan, U47 coach mode (`cs-coach`) |
| src/fx/16 | D3 Game Log `mi-rl-<nama>`, `window.__miRollKey`, I rolled myself |
| src/builder/22 | T9 langkah terakhir `cs-bld-step` |
| tools/tg_creatures.py, data/tg-creatures.json, src/tg/ | G7 TG0b data 503 makhluk (JSON statis, diambil saat dibuka) dan TG0 mesin pertarungan (src/tg/20-engine.js) |
| src/app/44 dan functions/api | U12 corong Learn di Admin (total per tempat, tanpa data per orang) |
| src/tg/00, 20, 30, 99 | Blok tunda `data-defer="tg"`: mesin (`window.TGE`) dan layar Training Ground (`window.__tgOpen`, `__tgBack`, `__tgState`). CSS `css/L-tg.css` (layer learn) |
| src/app/52-tg-bridge.js | Karakter pemain untuk mesin: `__app.tgRoster()`, `__app.tgTry(class, level)`, spell tingkat B dari SPELL_FX dan spCalc |
| tools/learn_shots.py, img/learn/shots/ | Gambar builder asli dengan titik bernomor untuk Forge Your Hero (HP dan PC, tanpa art scene). Jalankan sesudah build bila tampilan builder berubah |
| tests | receipts, time_machine, game_log, sync_merge_ui, builder_draft, g4_play, tg_engine.js (node), cloud_sync (wrangler) |

## Pemeriksaan build dan CI

| Pemeriksaan | Perintah | Catatan |
|---|---|---|
| Build sinkron dengan `index.html`, `sw.js`, hash CSP, lint, sidik jari vendor | `python3 build.py --check` | Gagal bila salah satu berbeda |
| Sidik jari library PDF | `python3 build.py --vendor-update` | Menulis ulang `vendor/pdf/SHA256SUMS`. Jalankan hanya setelah mengganti library dengan sengaja |
| CI sebelum merge | `.github/workflows/tests.yml` | Menjalankan build check, `tg_engine.js`, dan tujuh tes browser yang tidak butuh server |


## Build terpecah (hosting)
- `index.html` di root tetap satu berkas dan tetap hasil proyek. `tools/split_dist.py` membuat bentuk kedua hanya untuk `dist/`: tiap `<script type="text/x-defer" data-defer="N">` jadi `data-src="p/N.HASH.js"`. Hanya Python standar, jalan dari `tools/pages_dist.sh`.
- CSP tidak diubah. Hash tiap bagian sudah ada di meta CSP, dan loader menjalankan teks hasil fetch sebagai skrip inline. Berkas yang berubah di jalan ditolak browser.
- `src/boot/deferred-loader.js` mengambil berkas setelah halaman terbaca, lalu menjalankannya berurutan. `__bldNeed()` membaca bagian yang belum datang lewat XHR sinkron, jadi pemanggil lama tidak berubah.
- `sw.js` hasil pecah menyimpan semua bagian saat install. Bagian yang sudah ada di cache lama disalin, tidak diunduh lagi. Permintaan `p/*.js` dijawab dari cache tanpa fetch ulang. `_headers` memberi `immutable` untuk `/p/*`.
- Hasil ukur (`tests/measure_split.py`, 6 Mbps, 40 ms): tampilan pertama sama (1,8 detik) karena berkas tunggal sudah tampil saat HTML masih mengalir. Manfaatnya ada di rilis: satu bagian berubah berarti satu berkas diunduh, bukan seluruh halaman.
- Tes: `python3 tests/split_dist.py` (nama window sama dengan berkas tunggal, 34 bagian sekali fetch, bagian rusak ditolak CSP, offline). Tes lain memakai `index.html` tunggal. Tes yang mengosongkan localStorage tepat setelah `goto` bisa balapan dengan boot di build terpecah karena event load datang lebih awal. Jalankan tes itu pada berkas tunggal.


## Menambah fitur baru (checklist, wajib)
Tujuan: tidak ada fitur yang punya angka atau pilihan di teks tetapi tidak dihitung builder.
1. Tulis efek sebagai field data, bukan kode per nama. Engine membaca field ini secara umum, jadi data baru (tp*, homebrew) terhitung otomatis.
2. Field class di `CLASSES[nama]`: `fs` (level Fighting Style), `wm` (jumlah Weapon Mastery per level), `pick` (pilihan; boleh memakai `when:{key,val}` agar pilihan muncul hanya bila pilihan lain terpilih), `fx` (efek).
3. Efek memakai satu skema untuk semua sumber (fx engine v2). Letak entri: `CLASSES[cls].fx` (class), `window.GX.{cls,sub,species,bg,feat,item}[nama]` (daftar entri, dibaca lazy), array `gx` di `FEATS[n]`, `SPECIES[n]`, `BACKGROUNDS[n]`, dan di `DMGI[...][5].gx` (item). Semua dikumpulkan oleh `gfx()` (11-logic-derivation.js). `classFx()` sama dengan `gfx()` (nama lama dipertahankan). Setiap entri punya label sumber `lbl` yang tercatat di C (bonus AC, saveBonus, initBonus, hpBonus, defenses, speedSrc, misc/miscSrc skill, profSrc). Item hanya terhitung bila equipped (`eq`) dan attuned bila perlu (`activeFx()`).

#### fx schema
Syarat entri: `n` nama (default nama sumber), `l` level minimum (level class untuk cls dan sub, level karakter untuk sisanya), `when:{key,val}` aktif bila pilihan `key` berisi `val`, `cond` kondisi armor.
Nilai angka boleh: angka, `"pb"`, `"halfPb"`, `"lvl"`, `"halfLvl"`, atau kunci kemampuan (`"CON"` = modifier). `min` menjadi batas bawah hasil.
`cond`: `noHeavy` (tanpa Heavy armor), `noArmor` (tanpa armor dan tanpa Shield), `noBody` (tanpa armor, Shield boleh), `noShield`, `shield`, `armor`, `mwArmor` (armor yang dipakai bernama "<Armor>, Masterwork"; `baseOf` mengenali nama itu untuk armor, p = 0).

| Field | Arti | Contoh |
|---|---|---|
| `ac:[[lvl,val]]`, `acAb`, `acMin` | bonus AC per level class, atau modifier kemampuan | `{n:"Fighting Style",ac:[[1,1]],cond:"armor"}` |
| `acAdd` | bonus AC (nilai angka) | `{acAdd:1,cond:"noShield"}` |
| `acBase:[N,"full",ab]` | AC dasar tanpa armor: N, plus Dex bila "full", plus modifier ab. Dipakai bila lebih tinggi | `{acBase:[13,"full"]}` |
| `acDexAb:ab` | sama dengan `acBase:[10,"full",ab]` (Unarmored Defense) | `{acDexAb:"CON"}` |
| `acMw:N` | +N AC bila armor yang dipakai bernama Masterwork | `{acMw:1}` |
| `acNoDex:true` | modifier Dex tidak ditambah ke AC (C.ac.dex menjadi kosong). Ditambah batch A | Ankylier Osteoderms |
| `acArmAb:"WIS"` | saat memakai armor, modifier kemampuan itu ditambah ke AC sebagai ganti Dex (butuh `cond:"armor"`). Ditambah batch A | Martyr Anointed Armor |
| `shAc:[[lvl,extra]]` | AC tambahan saat memegang Shield | Warden Tower Shield |
| `saveBonus` | bonus ke semua saving throw | `{saveBonus:"halfPb"}` |
| `saveFrom:key` | pilihan `key` memberi proficiency save | Warden Stalwart Spirit |
| `init`, `initAdv` | bonus Initiative; advantage pada Initiative (catatan di defenses) | `{init:"pb"}` |
| `hp:"con+lvl"`, `hpLvl`, `hpFlat` | HP maksimum: CON + level; per level sumber; tetap | `{hpLvl:1}` |
| `speed:[[lvl,kaki]]`, `speedAdd`, `speedSet` | tambah speed; set speed bila lebih tinggi | `{speedAdd:10,cond:"noHeavy"}` |
| `mv:{climb,swim,fly}` | kecepatan lain: `"speed"` atau kaki. Tampil di speedSrc, juga `C.moves` | `{mv:{fly:"speed"}}` |
| `res`, `imm`, `vul` | daftar tipe damage (Resistance, Immunity, Vulnerability) | `{res:["Fire"]}` |
| `def:[jenis,teks]`, `defs:[[jenis,teks]]`, `advOn:[teks]` | baris defenses bebas; advantage pada teks | `{advOn:["saves against being Charmed"]}` |
| `skillProf`, `skillExpert` | proficiency; Expertise (butuh proficiency) | `{skillProf:["Arcana"]}` |
| `skillBonus:[[skill atau "*",nilai]]`, `chkBonus:[[ab,nilai]]` | bonus ke skill, atau ke semua skill satu kemampuan (kolom misc) | `{skillBonus:[["Stealth","pb"]]}` |
| `langs`, `tools`, `weapons`, `armor` | bahasa dan proficiency tetap | `{tools:["Smith's Tools"]}` |
| `spells:[[lvl,"A,B"]]`, `spCls` | spell selalu prepared; `spCls` menentukan kemampuan casting (default class entri, atau species) | `{spells:[[1,"Shield"]]}` |
| `spAtk`, `spDc` (+ `spCls`) | bonus spell attack dan Spell Save DC | Soulbind Chains |
| `pick:[{k,t,n,title,from,list,cats,cls}]` | pilihan di builder. `t`: skills, tool, lang, multi, cantrip. Disimpan di `B.ch["gx-"+k+"-"+kind+"-"+sumber]` | `{pick:[{k:"a",t:"skills",n:1,title:"Skill"}]}` |

Catatan engine: pick dari entri feat tidak muncul di `choices(true)` (dipakai `allFeats`, mencegah rekursi). Tes unit: `python3 tests/fx_engine.py` (fixture kecil lewat `window.GX`, tanpa data asli).
4. Jalankan `python3 tests/mech_scan.py`. Tes memindai teks semua fitur (class, subclass, species, feat, item) dan gagal bila ada fitur bermekanik tanpa jalur hitung yang tidak ada di `tests/mech_baseline.json`. Perbaiki dengan field data. Bila memang tidak bisa dihitung, daftarkan di `by_design` dengan alasan. Jangan menambah ke `gaps` untuk fitur baru.
5. Tambah kasus di `tests/fx_engine.py` bila memperluas skema. Tambah build acuan di `tests/golden/builds/*.json` (`build`, `expect`, `why`) dengan angka dari buku. Jalankan `python3 tests/golden_builds.py`.
6. Data tp*.js dibuat oleh `tools/tp_build.py` dari JSON sumber yang tidak ada di repo. Sampai sumber itu kembali, edit `src/data/tp*.js` langsung dan catat di reports/.
