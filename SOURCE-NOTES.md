# SOURCE-NOTES

Peta source untuk `index.html`. Hasil build `index.html` dan `sw.js`. Source ada di `src/`. Jangan edit `index.html` langsung.

## Perintah

| Perintah | Fungsi |
|---|---|
| `python3 build.py` | Gabung `src/` menjadi `index.html`, isi hash CACHE di `sw.js` (16 huruf awal sha256 index.html) |
| `python3 build.py --check` | Build di memori, bandingkan dengan `index.html` dan `sw.js` byte per byte, lalu `--lint`. Exit 1 jika beda atau lint gagal |
| `python3 build.py --lint` | `node --check` untuk tiap file JS di `src/` dan tiap blok `<script>` hasil gabungan |
| `python3 tests/guard_all.py [--enforce|--strict] [--detail] [--browser]` | Lima penjaga SOLID (stage 4): `guard_window`, `guard_dispatch`, `guard_deps`, `guard_size`, `guard_dup`. Tanpa browser, kurang dari 10 detik. Default hanya melapor (exit 0). `--enforce` gagal untuk pelanggaran BARU terhadap `tests/guard_baseline/`, `--strict` gagal untuk semua. `--update-baseline` hanya dipakai sengaja sesudah ditinjau. Penjelasan dan konvensi penanda `solid:orchestrator` ada di `reports/solid-guards.md`. Peta dependensi: `reports/solid-deps-map.md` |
| `python3 tests/scenarios.py [OUT] [--root DIR]` | Tiga skenario wajib (sheet lama Yudhi, sesudah Apply, karakter baru) di 390x844 dan 1250x850. Menulis screenshot dan isi localStorage ke OUT (default `tests/out/`, diabaikan git) |
| `python3 tests/measure.py [OUT.json] [--runs N] [--only "1250x850 cpu4x"]` | Waktu siap, data Builder selesai, Builder pertama dan kedua, Search pertama, di 390 dan 1250, CPU 1x dan 4x |
| `python3 tests/flow_home_sheet.py [OUT]` | Alur Home ke sheet ke Home dan ganti karakter, dengan video. Cek perpindahan tersambung jalan dan tidak ada yang tertinggal tersembunyi |
| `python3 tests/companion_2014.py [OUT]` | Pemilih Ranger's Companion 2014 di Extras: daftar semua beast yang memenuhi syarat, tombol di kartu beast, pilihan tersimpan di `S.comp14` dan bertahan setelah Apply, PDF hanya melampirkan beast pilihan, Change mengembalikan daftar. 390x844 dan 1250x850 |
| `python3 tests/long14_sheet.py [OUT]` | Teks panjang species dan background PHB 2014 (`src/builder/06b-data-2014-long-text.js`): sheet menyimpan `full` dan kartu fitur menampilkannya, 390x844 dan 1250x850 |
| `python3 tests/long24_sheet.py [OUT]` | Teks panjang species resmi 2024 (`src/builder/06a2-data-2024-species-long-text.js`): Orc Fighter 2024 menyimpan `full` untuk Relentless Endurance dan kartu fitur menampilkannya, 390x844 dan 1250x850 |
| `python3 tests/pdfx_legacy24.py` | Sheet 2024 lama tanpa `full`: model PDF tetap memuat teks panjang species (Orc Fighter, Relentless Endurance). Jalur cadangan: `pxFull` di `src/app/37a-ui-pdf-model.js` memanggil `__bldLong14(g,n,"2024")`. |
| `python3 tests/long14_coverage.py` | Setiap teks di `src/builder/06a-data-2014-long-text-more.js` (species dan background 2014 di luar PHB) harus terjangkau lewat `__bldLong14` dari data app. Exit 1 bila ada yang tidak terjangkau |
| `python3 tests/pdfx_sweep.py [OUT]` | Sapuan PDFX: setiap class x subclass x level 1, 3, 5, 11, 17, 20, aturan 2024 dan 2014, lewat builder asli (`__bldFuzz`) dan `__pdfModelFor`. Model diperiksa untuk miss (teks rusak, ringkasan kosong, spell tanpa detail, creature tanpa AC/HP), level 1 dan 20 dirender. Sekitar 2 menit |
| `python3 tests/pdfx_export.py [OUT]` | Export PDF PDFX (template 2014 dan 2024, halaman spell, Features & Traits, creature): Yudhi, Wizard Quick Build sesudah Apply, Wizard yang sama di aturan 2014. 390x844 dan 1250x850. Cek PDF dibuat PDFX (bukan cadangan gambar), bagian wajib ada, ringkasan IN SHORT ada, tanpa error, tanpa request keluar situs |
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
| `pdf/` | Renderer PDF (PDFX). Modul ES, entry `main.js`, dibundel esbuild, blok tertunda data-defer="pdfx". Pustaka pdf-lib dan aset ada di `vendor/pdf/` | x-defer |
| `builder/` | Builder karakter. Modul ES, entry `main.js`, dibundel esbuild, dimuat tertunda (data-defer="builder") | x-defer |

Peran di nama file `app/` dan `builder/`: `logic` (hitung, simpan, impor), `ui` (render dan interaksi), `data` (tabel tetap), `boot` (mulai). Peran ditentukan dari isi utama bagian itu. Kode lama tersusun per patch, jadi beberapa file `ui` masih memuat sedikit logic dan sebaliknya. Pemisahan penuh butuh pemindahan kode (mengubah urutan), di luar T0.

Blok modul (`app`, `builder`, `learn`, `tg`) punya kunci `entry` di `manifest.json`. `build.py` memanggil esbuild untuk membundel entry dan semua `import` jadi satu IIFE strict. File `pre` (kode klasik yang juga jalan di node atau harus global) ditaruh di depan bundel.
Aturan modul: satu file hanya mengimpor file yang lebih awal di manifest, jadi urutan jalan sama dengan dulu. Nama yang dipakai file awal dari file akhir (hanya saat dipanggil) lewat port akhir: `app/00a-reg-late-ports.js` dan `builder/01b-logic-late-ports.js` (tahap 10, `__R` sudah tidak dipakai). Pemilik mendaftar sekali dengan `bindLive("Nama",{get:function(){return Nama;}})`, pembaca mengimpor `Nama` dari file port (fungsi) atau memanggil `lateGet("Nama")` (nilai). Nilai yang ditulis dari file lain lewat fungsi `__set_Nama`. Fungsi yang dipakai saat muat harus ada di file yang sama atau lebih awal. `node tools/esm_codemod.js <blok>` mengecek aturan ini. `tests/names_lint.py` mengecek nama tanpa deklarasi.
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
| app/37a-ui-pdf-model.js | UI (model cetak PDF, hanya membaca sheet) | 15.584 |
| app/37-ui-pdf-export-hold-slide-confirm.js | UI | 10.983 |
| app/38-boot-init.js | boot | 1.830 |
| app/39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js | UI | 20.968 |
| app/40-ui-segments-notes-swipe-motion-panels.js | UI | 41.003 |
| app/41-ui-edit-mode.js | UI | 14.910 |
| app/42-logic-pwa-qr-icons-wallet.js | Logic | 28.447 |
| app/98-close.wrap.js | pembungkus IIFE | 7 |
| app/99-ui-backup-reminder-handlers.js | UI | 664 |
| fx/01-core-router-and-switch.js | efek | 3.337 |
| fx/02-micro-interactions.js | efek | partikel, riak, goyang |
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
| data/fx-F-sub.js | data (fx, registry GX.sub, batch F) | 7.814 |
| data/fx-G-engine.js | data (fx, engine v3b: toggle, pickLv, item) | 4.600 |
| data/fx-H-audit.js | data (fx, batch H: hasil audit silang gaps, item, sub, feat) | 3.274 |
| data/fx-L4.js | data (fx, ledger bin 4: items Eye of Vecna to Necklace of Adaptation, GX.item and FXO) | 14.000 |
| data/fx-L5.js | data (fx, ledger fixes L5: 124 magic items, Necronomicon to Sword of Zariel) | 20.000 |
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
| builder/09c-logic-edition-overlays.js | Logic | tabel edisi 2014 (spell, equipment, magic item) |
| builder/09d-logic-wotc-source-gate.js | Logic | gerbang sumber WotC (`wxGate`) |
| builder/09b-logic-choice-stages.js | Logic | tahap `choices()` |
| builder/10-logic-v17-additions.js | Logic | 18.011 |
| builder/11-logic-derivation.js | Logic | 10.560 |
| builder/12-logic-export-to-sheet.js | Logic | 6.506 |
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

## Mesin efek: handler dan registry (SOLID tahap 1)

Aturan per kelompok field efek ada di handler kecil yang murni. Orkestrator hanya mengulang dan menggabung patch. Hasil hitung tidak berubah (bukti: `tests/solid_snapshot.py`, hash dari C dan D untuk semua golden dan semua build invarian).

| File | Isi |
|---|---|
| builder/00-env.js | Satu-satunya tempat mesin membaca `window.*` (GX, FXO, `__sheetState`, THIRD_SUBS, `__inTS`, `__appVer`, XSK, EFA_*). Nama global lama tetap |
| builder/10a-logic-fx-registry.js | Kontrak handler (teks di kepala file), registry `entry`, `ability`, `sheet`, daftar sumber, `runFxPhase`, `foldFxPhase` |
| builder/10b-logic-fx-handlers-entry.js | Handler entri: gate level, gate when, alias spCls, pick abPick, toggle |
| builder/10c-logic-fx-handlers-ability.js | Handler skor kemampuan: abCut, abil item, abUp, abDown, abPick, abUpPick, setsc, abSet |
| builder/11b-logic-fx-sources.js | Sumber entri: kelas dan subkelas, spesies, background, feat, item |
| builder/11c-logic-fx-handlers-sheet.js | Handler sheet (dipindah dari `toSheet()`): speed, speedMul, darkvision, init |

Menambah kelompok field baru: tulis satu handler dan daftarkan di file handler yang cocok (atau file baru di manifest sebelum 11). Tidak ada orkestrator yang diubah. `tests/solid_contract.py` mengecek kontrak. Yang belum dipindah: lihat bagian Deferred di `reports/solid-s1-analysis.md`.

## toSheet(): handler dan registry (SOLID tahap 2)

`toSheet()` hanya membangun masukan (`sheetInputs()`) lalu menjalankan fase. Setiap kelompok field dan setiap aturan kelas adalah handler di registry. Kontrak ada di kepala `12a-logic-sheet-registry.js`, tipe nilai di `12b-logic-sheet-schema.js` (state C dan lokal l) dan `10e-logic-fx-schema.js` (satu skema untuk entri efek). Bukti: `tests/solid_snapshot.py` (hash sama) dan `tests/solid_contract.py`.

| File | Isi |
|---|---|
| builder/12-logic-export-to-sheet.js | `QRY` (fungsi baca murni), `sheetInputs()`, `toSheet()` (penanda ORCH) |
| builder/12a-logic-sheet-registry.js | Kontrak, `registerSheetGroup`, `registerSheetRule`, `runPhases`, irisan (`makeCtx`), mode ketat |
| builder/12b-logic-sheet-schema.js | Skema state: kunci C dan l beserta tipenya, `patchProblems` |
| builder/12c sampai 12l | Handler per fase: dasar dan save, skill dan bahasa, AC dan bonus, speed dan indera dan init, proficiency, serangan, inventaris dan resource dan aksi, fitur, mantra, late pass dan penutup |
| builder/10e-logic-fx-schema.js | Skema entri efek: semua field yang boleh dan tipenya |

Menambah kelompok field atau aturan kelas: satu panggilan `registerSheetGroup()` atau `registerSheetRule()` (aturan kelas wajib punya `about`). Handler menyatakan `reads` dan `writes`, menerima hanya irisan itu, dan mengembalikan patch lewat `ctx.patch()`. Urutan: fase, lalu `order`, lalu urutan daftar. `scope:"part"` mengulang per bagian kelas, `scope:"each"` mengulang per elemen (`over`). Tes: `window.__sheetStrict=true` membuat pembacaan di luar irisan melempar galat.

## Env, port akhir, registry paket (SOLID tahap 8)

Builder dan fx tidak membaca `window.*` langsung lagi (di luar modul env). `genv.NAMA` dan `FXENV.NAMA` adalah properti yang sama dengan `window.NAMA`: getter membaca saat dipakai, setter menulis. Nama window lama tetap hidup. Metode browser (`matchMedia`, `fetch`, `scrollTo`, `addEventListener`, `requestAnimationFrame`) dikembalikan terikat ke `window`. `tools/lint_names.js` menganggap `FXENV.X=`, `genv.X=` dan `env.X=` sebagai deklarasi, sama dengan `window.X=`.

| File | Isi |
|---|---|
| builder/00-env.js | Accessor sempit tahap 1 sampai 5 (`gx`, `classDef`, `packTables`, ...) dan `genv` (tahap 8): tabel data, hook dan jembatan builder, metode browser |
| builder/00-reg.js | `__R`, kantong lama. Sejak tahap 10 tidak ada file yang mengimpornya (isinya pindah ke port akhir di `01b-logic-late-ports.js`). File dibiarkan karena penghapusan butuh izin |
| app/00a-reg-late-ports.js | Port akhir sheet (tahap 10): `bindLive`, `lateGet`, `lateSet`, dan satu fungsi pembungkus per nama fungsi. Tanpa impor, dimuat paling awal, tidak punya efek samping |
| builder/01a-logic-query-registry.js | `QRY` dan `provideQueries`: fungsi baca murni yang diberikan ke handler `toSheet()` sebagai `ctx.q`. Pemilik fungsi mendaftar sekali, nama ganda melempar error |
| builder/01b-logic-late-ports.js | Port akhir (tahap 8): fungsi milik file lebih akhir yang dipanggil file lebih awal (saat jalan, bukan saat muat). Satu export bernama per fungsi, daftar nama tertutup, pemilik memanggil `bindLate({...})` sekali. File yang lebih akhir dari pemilik mengimpor langsung dari pemilik. `sheetInputs()` memakai port ini, bukan `QRY.*` |
| builder/11-logic-derivation.js | `fxList()` (entri efek dengan item) dan `fxListBase()` (tanpa item) menggantikan `gfx(noItem)` untuk pemanggil luar. `gfx` tidak diekspor lagi |
| builder/13a-logic-pack-registry.js | Registry langkah paket untuk `applyPacks()` (tahap 5): `registerPackStep`, fase `reset`, `pack`, `post`, kontrak L dan I, mode ketat `packStrict`. Dijalankan oleh `runPackSteps` |
| builder/13b-logic-pack-handlers.js | Langkah paket: satu langkah per tabel aturan (SPECIES, BACKGROUNDS, FEATS, CLASSES, PRICE, AUTO, DMGI, CF_FULL). Urutan dalam fase sama dengan fungsi lama |
| fx/00-fx-env.js | `FXENV`, versi `genv` untuk paket fx. Skrip klasik, pertama di blok fx |
| fx/00b-fx-shared.js | `FXH`: fungsi kecil yang dulu disalin di paket Z dan M (`nf`, `rm`, `vis`, `esc`, `fx`, `ls`, `st`). Blok 12 baris ganda di fx/16 dan fx/18 hilang |
| fx/27-blend-sheet.js | Sheet detail berpadu gambar. Dipecah jadi 11 closure kecil yang berbagi `BLEND.K` (warna, geser makhluk, kunci makhluk, scene, judul, gambar hero, gulir dan settle, pintu masuk `__blendSheet`). Urutan kerja DOM tidak berubah |
| fx/23-class-art-data.js | Tidak disentuh: dimuat sebelum bundel app (di luar blok fx), jadi belum ada `FXENV` saat jalan |

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
| `acBase:[N,"full",ab]`, `acOver` | AC dasar tanpa armor: N, plus Dex bila "full", plus modifier ab (`"cast"` = modifier casting terbaik). Dipakai bila lebih tinggi. `acOver:true` juga berlaku saat armor dipakai (yang lebih tinggi dipakai, Titan Armor, Exo-Frame) | `{acBase:[13,"full"]}`, `{acBase:[10,"","cast"]}` |
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
| `skillProf`, `skillExpert`, `skillProfPlus` | proficiency; Expertise (butuh proficiency); proficiency, atau +1 ke check skill itu bila sudah proficient (Ioun Stone) | `{skillProf:["Arcana"]}` |
| `skillBonus:[[skill atau "*",nilai]]`, `chkBonus:[[ab,nilai]]` | bonus ke skill, atau ke semua skill satu kemampuan (kolom misc) | `{skillBonus:[["Stealth","pb"]]}` |
| `langs`, `tools`, `weapons`, `armor` | bahasa dan proficiency tetap. Ikut `C.profs` dan proficiency baris serangan | `{tools:["Smith's Tools"]}` |
| `spells:[[lvl,"A,B"]]`, `spCls` | spell selalu prepared; `spCls` menentukan kemampuan casting (default class entri, atau species) | `{spells:[[1,"Shield"]]}` |
| `spAtk`, `spDc` (+ `spCls`) | bonus spell attack dan Spell Save DC | Soulbind Chains |
| `pick:[{k,t,n,title,from,list,cats,cls,school}]` | pilihan di builder. `school` (cantrip) membatasi pilihan ke satu school (mis. Necromancy). Pilihan `multi` bisa mengaktifkan entri lain lewat `when:{key:"gx-k-kind-sumber",val}` (contoh Mask of Civility: tool atau language). `t`: skills, tool, lang, multi, cantrip. Disimpan di `B.ch["gx-"+k+"-"+kind+"-"+sumber]` | `{pick:[{k:"a",t:"skills",n:1,title:"Skill"}]}` |
| `saveBonusNp` | bonus ke saving throw yang tidak memakai Proficiency Bonus (sheet melewati save yang proficient). Dikirim sebagai `C.saveBonus[{s,v,np:1,t}]`; `06-logic-derivation.js` dan `23-ui-...` membaca `np` | Warmage House of Pawns, Multidiscipline: `{saveBonusNp:"halfPb"}` |
| `fsPick:1` | (hanya entri `sub`) pilihan Fighting Style feat dari subclass pada level `l`. Kunci `B.ch["sfs"+l]`, tipe `fs`, masuk `allFeats()`. Multiclass: kunci `m<i>:sfs<l>` (dibuat di `mcChoices()`, `14-logic-multiclass-hp-shop.js`) | Warmage House of Knights: `{l:7,fsPick:1}` |
| `pick` tipe `cantrip` + `slv:N` | daftar spell level N (default 0). Pilihan jadi spell selalu prepared pada kemampuan `spCls` | Summoner Shambling Plant: `{k:"s",t:"cantrip",cls:"Druid",slv:1,n:1}` |
| `mv:{burrow:..}` | kunci kecepatan apa saja dibaca apa adanya | Elemental Soul Earth |
| `size:"Large"` | (item) ukuran karakter naik ke ukuran itu bila lebih kecil (Tiny, Small, Medium, Large, Huge, Gargantuan). Tulis ke `C.size` di `12-logic-export-to-sheet.js`, ikut kapasitas bawaan. Batch F | Exo-Frame: `{size:"Large"}` |
| `abUp:[[ab,+N,maks]]` | kenaikan skor tetap, tidak melewati `maks` (default 20). Tampil di sumber skor | `{abUp:[["CON",1,20]]}` |
| `sense:[[nama,kaki,teks]]` | sense di `C.senses` (dipakai bila lebih besar dari yang sudah ada) | `{sense:[["Blindsight",30,""]]}` |
Perluasan batch F (`src/data/fx-F-sub.js`, subclass): `pick` boleh membawa `opt:1` (pilihan opsional, `isDone` menerima kosong, dipakai pilihan bahasa musuh favorit Resolute Hunter) dan `yc:1` (pilihan tersimpan ditampilkan sebagai "Your choice." di bawah fitur subclass lewat `ycOf`; untuk pilihan `multi` yang hanya dicatat: grafts Cybernetic Crafts dan Mad Scientist, Novel Intelligence, Bloody Rampage, musuh favorit). Pilihan graft menambah item ke inventory sejak engine v3b (pick `item`). Fitur yang sudah dihitung asli tidak diberi entri fx: Origami Familiar (spell subclass), Champion Additional Fighting Style (pick asli `p7fs`). Keduanya dicatat di `by_design`.
Perluasan batch C (feat): `pick` bertipe `weapon` (proficiency satu senjata, `wcats` default S dan M), `cantrip` boleh membawa filter `lvl` (level spell, default 0), `school`, `ct` (regex casting time), `nodmg:1` (tanpa damage). Entri feat membaca pick miliknya lewat `when:{key,val}`: pick gx (`gx-k-feat-slot`) atau pick bawaan FEATS (`key-slot`), lewat `fxCh`. `saveFrom` untuk feat memakai jalur yang sama. `spCls:"@asi"` memakai kemampuan yang dinaikkan feat, `spCls:"@abpick"` memakai kemampuan dari pick berkunci `ab`. Baris `LU_X` feat boleh memakai `max:"mod:@asi"` atau `"mod:@ab"`.


Override item (`window.FXO`, file `src/data/fx-D-item.js`): `FXO[nama item]={fx:{...}|null}` mengganti `fx` lama di baris DMGI tanpa mengubah data sumber (`fx:null` membuang efek yang salah hitung). Dibaca oleh `ovFx()` di `03-logic-magic-item-effects.js` (dipakai `activeFx()`, `itemFx()`, `baseOf()`). Entri `window.GX.item[nama]` kini berlaku juga untuk baris item yang tidak punya `fx`. Tes: `tests/fx_engine.py` (kasus FXO) dan `tests/golden/builds/item_*.json`.
Perluasan batch E (feat, `src/data/fx-E-feat.js`, dimuat sesudah fx-C-feat.js; entri C yang kurang lengkap diganti menurut nama lewat `rep()`, file C tidak diubah):
| Field | Arti | Contoh |
|---|---|---|
| `darkAdd:N` | tambah N kaki ke `C.darkvision` yang sudah ada (tanpa itu jadi N) | Hag Green Sisterhood |
| `darkTo:N` | Darkvision N kaki bila yang sekarang lebih kecil | Hag Red dan Sea Sisterhood |
| `senseAdd:[[nama,kaki,teks]]` | sense selain Darkvision: tambah kaki ke sense yang ada, kalau tidak ada diberikan | Ooze Form Blindsight 30 |
| `skillPE:[skill]` | proficiency, atau Expertise bila sudah proficient (dari sumber mana pun, diproses sesudah skillProf) | Hag Red Sisterhood, Vampire Strigoi |
| `skillAb:[[skill,ab]]` | skill memakai modifier `ab` bila lebih tinggi dari kemampuan aslinya. Tampil sebagai bonus misc (selisih modifier, statis pada skor saat build) | Technical Mind Over Matter |
| `abCut:{total,each}` | (entri feat) skor dari base, species, dan background diturunkan 1 per 1 pada skor tertinggi sampai total <= `total`, lalu semua turun `each`. Seri: urutan STR sampai CHA. Kenaikan feat tingkat 4 ke atas dihitung sesudahnya | Worthless |
Teks saja (kondisional atau aktif): lihat komentar di kepala `fx-E-feat.js`. Worthless From the Ashes sudah ada lewat `pickLv` (engine v3b). Technical Mind Over Matter: satu pilihan skill, ganti pilihan itu tiap level.

Perluasan v3a (engine, `12-logic-export-to-sheet.js` "late pass" sesudah serangan natural, `09-logic-feats-and-choices.js` untuk `defT`):
| Field | Arti | Contoh |
|---|---|---|
| `resToImm:[tipe]` | Resistance ke tipe itu, atau Immunity bila sudah ada Resistance ke tipe itu dari sumber lain (feat, class, item). Resistance lama dibuang dari daftar, baris Immunity memuat sumbernya | Specter Spectral Form: `{resToImm:["Necrotic"]}` |
| `speedAddIf:{swim:10}` | +N kaki ke Speed itu bila sudah punya dari sumber lain (`C.speeds` atau entri `mv` lain). Bila belum, `mv` entri yang sama yang memberikan (`"speed"` atau kaki). Kunci itu dilewati oleh jalur `mv` biasa. Hasil di `C.speeds[k]`, `C.moves`, `C.speedSrc` | Hag Sea Sisterhood: `{mv:{swim:"speed"},speedAddIf:{swim:10}}` |
| `atkDice:[{when,d,t,note}]` | dadu damage tambahan. `when`: `weapon`, `spell`, `unarmed`, atau nama baris serangan (nama senjata). Baris yang cocok mendapat `xdice:[{d,t,s}]` dan kalimat di `note`. Bila tidak ada baris yang cocok (mis. Breath Weapon, bukan baris serangan), jadi baris Note di Defenses | Multiscale: `atkDice:[{when:"Breath Weapon",d:"1d10",t:"...",note:"..."}]` |
| `atkAb:{kind,ab,opt,note}` | kemampuan pengganti untuk bonus serangan dan modifier damage pada baris `kind` (`unarmed`, `weapon`, `spell`, atau nama). Dipakai bila modifiernya lebih tinggi, `r.ab` diganti dan `r.abSrc` diisi. `opt:1` = hanya catatan di baris (untuk teks "can use" yang bersyarat), kemampuan tidak diganti | Mad Scientist: `atkAb:{kind:"unarmed",ab:"INT",opt:1}` per graft Monstrous Bite dan Monstrous Weapon |
| `pick` tipe `text` | pilihan teks bebas, tersimpan sebagai string di `B.ch[key]`. `yc:1` menampilkannya di fitur ("Your choice."), `defT:"Immunity"` (atau Resistance, Note, dst.) dan `dpre:"Spells"` membuat baris Defenses "Spells: <teks>". Teks kosong tidak ditampilkan. Kolom isian di builder butuh UI (reports/requests.md) | Toymaker Clockwork Lich: `{k:"spimm",t:"text",n:1,yc:1,defT:"Immunity",dpre:"Spells"}` |
Catatan v3a: Cybernetic Crafts tidak menyebut Intelligence di teksnya, jadi tidak ada `atkAb` untuk subclass itu. Mad Scientist hanya untuk Unarmed Strike yang diperbaiki graft, jadi `opt:1`. `when:{key}` untuk pilihan subclass memakai kunci lengkap (`gx-graft-sub-Xenoalchemist`).

#### fx batch H (audit silang `mech_baseline.json`)
Berkas: `src/data/fx-H-audit.js` (blok hbpack, sesudah fx-G). Isi: hasil audit 257 key "gaps" (laporan `reports/audit-silang-situasional-20261104.md` untuk sampel 80, `reports/audit-sisa-177-20261104.md` untuk sisanya). Hanya aturan tetap tanpa aksi, pemicu atau pilihan saat bermain yang dihitung. Dua tambahan engine kecil:
| Field | Arti | Contoh |
|---|---|---|
| `speedMul:N` | Speed dikali N sesudah semua tambahan dan potongan armor, sebelum `mv:"speed"` dibaca (jadi Climb sama dengan Speed yang sudah dikali). Tampil di `speedSrc` sebagai "×N". Kode: `12-logic-export-to-sheet.js` | Necromancer Blood Ascendant Nosferatu: `{speedMul:2,mv:{climb:"speed"}}` |
| `when:{key,val,any:1}` | `any:1` (entri feat) membaca pilihan `key` juga dari slot feat lain. Dipakai bila pilihan dibuat di feat yang berbeda dari feat pemilik entri. Kode: `fxCh()` di `11-logic-derivation.js` | Fey Stage 4 membaca Court dari pilihan `trFey1` di Fey Stage 1 |
Pola yang dipakai tanpa perubahan engine: `mv:{fly:"speed"}` untuk item dan subclass (Ionbreaker Zephyr Step, Warrior of the Celestial Heavenborne, Storm Sentinel Storm Wings), `chkBonus` untuk keenam kemampuan plus `init:1` untuk bonus +1 ke ability check (Crown of Daffodils, Stone of Good Luck; bonus save tetap dari `fx.save` di baris item), `advOn` untuk Advantage save (Pharaoh Magic Resistance, Parasite Symbiotic Sentinel), `initAdv`, `def` bertipe Vulnerability atau Resistance (Lycanthrope Silver Sensitivity, Oath of Redemption Emissary), `darkAdd` (Star and Shadow Reader), `vul` per Court (Fey Stage 4).
Sengaja tetap teks: klausa per makhluk pada Emissary of Redemption (Resistance hilang terhadap makhluk yang kamu serang atau kenai spell sampai Long Rest, sheet tidak melacak target, jadi baris Defenses memuat syaratnya dalam kata), batas "short bursts" Heavenborne, hover maksimal 20 ft Zephyr Step, Regeneration dan aturan sinar matahari Nosferatu.
Tes: `tests/golden/builds/fx_H_*.json`.
Pemindai: `tests/mech_scan.py` kini mengenali (1) entri `window.GX` yang namanya disebut dalam teks fitur atau bernama sama (kategori ditentukan dari field entri, tabel `GX_CAT`), jadi fitur yang dihitung lewat nama sub-efek tidak lagi masuk gaps, dan (2) frasa item "+1 bonus to ability checks and saving throws" dan "ability checks and saving throws each get a +1" (sebelumnya Stone of Good Luck lolos).

#### fx engine v3b (toggle, pickLv, abUpPick, item, Masterwork)
Berkas data: `src/data/fx-G-engine.js` (di blok hbpack, sesudah fx-F). Kode: `gfx()`, `abil()`, `fxOk()` di `11-logic-derivation.js`, `gxPicks()` di `09-...`, `syncPickItems()` di `14-...`, hook di `25-...`.
| Field | Arti | Contoh |
|---|---|---|
| `toggle:{id,label,default:false}` | Efek entri hanya terhitung bila keadaan `id` hidup. Keadaan disimpan di state sheet `S.fxT={[id]:bool}` (tidak di state builder), dibaca lewat `window.__sheetState().fxT`. Bila mati, entri tetap ada di `gfx()` tetapi hanya membawa `n,l,when,pick,pickLv,toggle` (pilihan tidak hilang). `C.fxToggles=[{id,label,on,src}]` mendaftar semua toggle. id yang sama di dua entri adalah satu saklar. Kondisi main seperti Bloodied dimodelkan sebagai toggle. Tes dan alat: `__bldSheetFor(build, {id:true})`, `__bldFxToggle(id,on)` (bangun ulang sheet setelah saklar diubah) | Aberrant Horror Chitinous Shell `{toggle:{id:"aberrant-chitinous",label:"..."},acAdd:2,speedAdd:-10,cond:"noHeavy"}` |
| nilai `"rage"` | Rage Damage bonus dari level Barbarian (2, 3, 4). Dipakai di `abUp` | Path of the Abomination: `abUp:[["STR","rage",29]]` dengan `toggle:{id:"rage"}` dan `size:"Large"` |
| `pickLv:[{lv,k,t,n,title,list}]` | Satu pilihan per level terdaftar (muncul bila level entri >= `lv`; level class untuk cls dan sub, level karakter untuk sisanya). Tiap item adalah pilihan utuh dengan `k` sendiri. Disimpan di `B.ch["gx-"+k+"-"+kind+"-"+sumber]` | Worthless From the Ashes |
| `abUpPick:{max}` | Tiap pilihan `pickLv` berisi teks seperti `"STR +2"` atau `"STR +1, DEX +1"`. Setiap bagian menaikkan skor itu, tidak melewati `max`. Urutan per level | Worthless: `max:18` |
| pick `t:"item"` | Seperti `multi` (nilai tersimpan sama, array nama). Item yang dipilih ditambahkan ke `B.inv` (baris `px`=kunci pilihan, terpasang bila punya efek atau bisa dipakai) saat sheet dibangun, dan dibuang bila pilihan berubah. `B.px[kunci]` mencatat nama yang sudah ditambahkan, jadi item yang dihapus pemain tidak kembali. Nama tanpa data item (sumber belum aktif) hanya tercatat. Item yang sudah dimiliki pemain tidak digandakan dan tidak pernah dibuang | Cybernetic Crafts, Mad Scientist |
| baris inventory `mw` | `B.inv[].mw=1` dan `C.inv[].mw=true`. Armor yang dipakai dengan `mw` memenuhi `cond:"mwArmor"` seperti nama ", Masterwork". Hook `__bldSetMw(nama,occ,on)` | Craftsman Masterwork Armor |
Kasus di data: Aberrant Horror Stage 1 (Chitinous Shell, Slimy Form), Specter Incorporeal Movement, Vampire Sanguine Curse (tanpa undangan), Path of the Abomination (Raging), Worthless From the Ashes, grafts Cybernetic Crafts dan Mad Scientist. Rage biasa dan Rage Damage sudah dihitung sheet lewat mode `S.mode.rage` (bukan fx). Craftsman Armor Enchantment dan Customize Armor (dipilih tiap Long Rest) belum dimodelkan. Permintaan UI: `reports/requests.md`. Tes: `tests/fx_engine.py`, `tests/golden/builds/fx_G_*.json` (kunci `fxT` di JSON memberi keadaan toggle).
#### Multiclass dan fx engine (aturan yang dites)
Tes: `tests/golden/builds/mc_*.json` (angka dihitung tangan, tertulis di `why`), kasus `mc:` di `tests/fx_engine.py`.
- Level sumber: entri `cls` dan `sub` memakai level class bagian itu (`e.lv`), entri species, bg, feat, item memakai level karakter (`TL()`). `pb`, `init:"pb"` dan `halfPb` selalu memakai level karakter. `"rage"` memakai level Barbarian di bagian mana pun.
- Kunci pilihan bagian kedua memakai awalan `m<i>:` (`when`, `saveFrom`, `fsPick` = `m0:sfs7`). Pilihan `pick` entri gx memakai akhiran `-m<i>` (`gx-k-sub-Nama-m0`). Toggle tidak berubah: id yang sama = satu saklar.
- `spCls` bawaan: entri `cls` atau `sub` tanpa `spCls` memakai class pemiliknya (`e.ocls`, diisi `put()` di `gfx()`), bukan "@species". Entri species, bg, feat, item tanpa `spCls` tetap "@species". `spAtk`/`spDc` tanpa `spCls` tetap berlaku untuk semua class.
- Feat yang tidak bisa diulang (`FEATS[n].rep` kosong) dihitung satu kali: `allFeats()` membuang salinan kedua (yang pertama menurut urutan level tetap). Dua Fighting Style yang sama dari dua class (Defense) memberi +1 AC sekali. `allFeats(true)` mengembalikan semua salinan, dipakai `featViol`, `scoreAt`, `saveTaken` supaya pelanggaran tetap dilaporkan.
- Class tanpa entri `MC_GRANT` (Warmage, Necromancer, Investigator) boleh menjadi class kedua; `MC_GRANT[cls]||{}` dan `MC_REQ[cls]||[]` dipakai di semua pembaca.
- Unarmored Defense dua class tidak bertumpuk. Otomatis = class utama dulu (kartu "Armor Class without Armor" di builder menawarkan pilihan lain, kunci `B.acMode` "ua", "uax", "acs"). Catatan: Draconic Resilience (10 + DEX + CHA) sebagai class utama bisa lebih rendah dari "Unarmored" (10 + DEX); otomatis tetap memakainya, pemain bisa memilih yang lain.
- Extra Attack dari beberapa class tidak bertumpuk: sheet memakai nilai terbesar ("Attacks per Action"), diuji lewat DOM di `tests/fx_engine.py`.
Catatan engine: pick dari entri feat tidak muncul di `choices(true)` (dipakai `allFeats`, mencegah rekursi). Tes unit: `python3 tests/fx_engine.py` (fixture kecil lewat `window.GX`, tanpa data asli).
#### fx engine v4 (cabang claude/w-eng, field baru dari ledger MISS)
Kode: `11-logic-derivation.js` (`fxv`, `fxOk`, `abil`, `gfx(noItem)`, `thirdOf`), `12-logic-export-to-sheet.js` (skill, save, AC, darkvision, late pass), `16-logic-feature-numbers.js`, `10-logic-v17-additions.js` (`saveNotes`, `luRows`), `09-...` (`dmXl`), `13-...` (`autoSpells`), `18-ui-spells.js` (`spFxN`), `03-...` (`attMax`), `app/06`, `app/23`, `app/24`, `app/25`, `app/36` (sisi sheet). Tes: `tests/fx_engine.py` (kasus berawalan "v4"). Field yang sudah ada dan hanya perlu data: `init` (angka, `"pb"`, kunci kemampuan, `min` di entri), `initAdv`, `advOn`, `langs`, `tools`, `weapons`, `skillProf`, `skillBonus`, `chkBonus`, `spAtk`, `spDc`, `spells` (tabel per level: `[[lvl,"A,B"]]`, level sumber), `mv`, `darkAdd`, `darkTo`, `hpLvl`, `hpFlat`, `atkDice`, `atkAb`, `res`, `imm`, `acBase`, `toggle`.
| Field | Arti | Contoh |
|---|---|---|
| nilai `[[lvl,val],...]` | Di mana saja nilai angka diterima (`init`, `acAdd`, `speedAdd`, `saveBonus`, `spAtk`, `prepAdd`, ...): langkah per level sumber (level class untuk cls dan sub, level karakter untuk sisanya). Langkah terakhir dengan lvl <= level sumber berlaku. Nilai langkah boleh `"pb"` atau kunci kemampuan | `{init:[[1,1],[5,2]]}` |
| `cond` baru | `heavy` (memakai Heavy), `medium`, `light` (memakai armor itu), `lightNone` dan `noMedHeavy` (tanpa armor atau Light). `init` kini ikut cek `cond` | `{acAdd:1,cond:"lightNone"}` |
| `initDie:"1d10"`, `noSurprise:true\|teks`, `condImm:[kondisi]` | Baris Note "Add 1d10 to Initiative rolls", Note "Cannot be surprised", Immunity "<kondisi> (condition)" di Defenses | `{noSurprise:true}` |
| `saveNote:[teks]` | Baris di bawah Saving Throws (bonus death save, advantage). `advOn` yang menyebut "save" atau "saving throw" juga disalin ke sana (tetap ada di Defenses) | `{saveNote:["+1 bonus to death saving throws"]}` |
| `saveBonusAb:[[ab,val]]` | Bonus hanya untuk satu saving throw. `C.saveBonus[{s,v,ab}]`; `app/06` hanya menambah ke save itu | `{saveBonusAb:[["INT",1]]}` |
| `abSet:[[ab,N]]` | Skor menjadi N bila lebih rendah, sesudah semua kenaikan (seperti `setsc` item, kini untuk semua sumber) | `{abSet:[["CON",23]]}` |
| `abPick:{k,from:[ab],up,max,set,n}` | Pilihan satu kemampuan dari daftar (pick `multi` dibuat otomatis dengan kunci `gx-<k>-<kind>-<sumber>`). `up`: naik sebesar itu, tidak lewat `max` (default 20). `set`: menjadi nilai itu bila lebih rendah. Tanpa pilihan tidak ada efek | Champion items `{abPick:{k:"a",from:["STR","WIS"],up:2,max:22}}`, Feather Robe `{abPick:{k:"a",from:["INT","CHA"],set:22}}` |
| `abDown:[[ab,-N,min]]` | Skor turun N, tidak di bawah `min` (default 1) | Tectonic Gauntlets `{abDown:[["INT",-4,7]]}` |
| `skillBonus` / `chkBonus` baris `[x,val,min]` | Elemen ketiga adalah batas bawah baris itu. `min` di entri tetap berlaku untuk seluruh entri | `{skillBonus:[["Arcana","WIS",1]]}` |
| `dcAdd:{"Nama fitur":val}` | Tambahan pada DC save di catatan fitur itu (`calcNote`): "Monk's Focus", "Breath Weapon", "Ki" | `{dcAdd:{"Monk's Focus":1}}` |
| `atkBonus:[{when,atk,dmg,crit,note}]` | Bonus datar ke serangan atau damage baris yang cocok. `when`: `weapon`, `melee`, `ranged`, `spell`, `unarmed`, `natural`, `any`, nama senjata, atau array. `atk`/`dmg`: angka, `"pb"`, kunci kemampuan, atau langkah level. `crit:19` menambah catatan "Critical hit on 19-20" | Expert Strike `{l:5,atkBonus:[{when:["weapon","unarmed"],atk:"INT",dmg:"INT"}]}` |
| `unarmed:{die,t,magic,force}` | Baris Unarmed Strike: `die` `"1d6"` atau langkah `[[lvl,"1d6"]]` (dipakai bila lebih besar dari die sekarang; `force:1` selalu), `t` jenis damage, `magic` catatan magical. Ganti kemampuan lewat `atkAb` yang sudah ada | Pugilist `{unarmed:{die:[[3,"1d6"],[5,"1d8"],[11,"1d10"],[17,"1d12"]]}}` |
| `extraAttack:N` | Teks aksi Attack menjadi "Make two attacks (sumber)" bila belum ada teks Extra Attack dari class | `{extraAttack:2}` |
| `acDexMax:2` | Dengan `acBase`: Dex dihitung maksimal +2 (mode sheet `max2`). Hanya nilai 2 yang ditampilkan benar | Barrier Tattoo `{acBase:[15,"full"],acDexMax:2,cond:"noBody"}` |
| `carryBump:true` | Dihitung satu ukuran lebih besar untuk kapasitas bawaan tanpa ubah ukuran. `C.carryBump`; `carryOf` membacanya. Powerful Build lama tetap dikenali lewat nama | Equine Build, Musclebound, Heavy Legs |
| `darkNone:N`, `darkHave:{add:N}\|{to:N}` | Darkvision N hanya bila belum punya; bila sudah punya: tambah N atau naik ke N. Cek "sudah punya" memakai nilai sebelum entri itu. `darkAdd` menumpuk, `darkTo` menyetel | `{darkNone:60,darkHave:{to:120}}` |
| `mv` nilai `"speed2"`, `"speedHalf"` | Kecepatan 2x Speed, setengah Speed | `{mv:{fly:"speed2"}}` |
| `lu:{n,max,reset,tag,pool,die,f,short6}` (atau array) | Baris limited-use dari entri apa saja. `max`: angka, array per level (indeks level-1), `"pb"`, `"pb2"`, `"lvl"`, `"half"`, `"mod:WIS"` (minimal 1), `{f:"rumus"}`. `reset`: long, short, dawn, dusk (jadi long), none, init. Level = level sumber | `{lu:{n:"Free Shield",max:1,reset:"long"}}` |
| `attune:N` | Batas attunement menjadi N (entri non-item lewat `gfx(true)`, entri `GX.item` hanya bila item equipped) | DD&D Artifactor `{attune:4}` |
| `prepAdd`, `cantAdd` | Tambahan jumlah spell prepared atau known, dan cantrip, di hitungan Builder (`spInfoOne`). `spCls` membatasi ke satu class; entri class dan subclass hanya untuk class sendiri | Grimoire Infinitus `{prepAdd:1,spCls:"Wizard"}` |
| `spListAdd:{cls?,spells:[nama]\|from,school?,lvl?}` (atau array) | Spell masuk daftar class (tidak otomatis prepared). Dibuat daftar semu `fx:...` di baris SPELLS dan dibaca `dmXl(cls)` seperti Dragonmark. Hanya sumber non-item (`gfx(true)`) | Time Domain `{spListAdd:{cls:"Cleric",spells:["Foresight","Time Stop"]}}` |
| `window.THIRD_SUBS[sub]={list,ab,cant}` | Subclass menjadi third caster seperti Eldritch Knight: slot dari 1/3 level, tabel spell known EK, `cant` cantrip dasar (+1 di level 10). Dibaca `isThird3`, `thirdOf`, sisi sheet `app/24` | `THIRD_SUBS["Prescient Knight"]={list:"Wizard",ab:"INT",cant:2}` |
| `window.XSK[nama]={ab,d}` | Skill di luar 18 (default: Technology dan Data, INT). Baris skill (`hb:1`) ditambahkan hanya bila entri menyebutnya (`skillProf`, `skillExpert`, `skillPE`, `skillBonus`, `skillAb`) atau pilihan memberi proficiency. Sheet biasa tidak berubah, key tersimpan tidak berubah | `{skillProf:["Technology"],skillBonus:[["Technology","WIS",1]]}` |
| baris `SAVE_NOTES` item ke-4 | Pemilik: nama species (trait), class atau subclass (class feature), feat. Dengan item ke-4 baris hanya berlaku untuk pemilik itu (Kalashtar vs Githzerai). Tanpa item ke-4 cocok per nama seperti dulu | `["trait","Mental Discipline","Advantage on ...","Kalashtar"]` |
| placeholder kosong | `AUTO`, `spells` dengan nama kosong (`[[3,""]]`) tidak menambah spell | |
Aturan tambahan: `autoSpells` melewati nama kosong. `gfx(true)` mengembalikan entri tanpa item (dipakai `attMax` dan `dmXl` karena keduanya jalan di dalam `activeFx`). `window.__bldXl()` (hook tes) mengembalikan bagian caster dengan daftar spell.
Belum dimodelkan (butuh perubahan model data atau UI): ganti dadu senjata (Silver Eagle 2d6, Oversized Longbow), jangkauan atau reach, kunci Exhaustion, `wmAdd` (tambahan Weapon Mastery), Two-Weapon Fighting off-hand, pilihan Expertise sebagai ganti dua proficiency, tabel spell known khusus per subclass di luar tabel EK, hitungan prepared yang bukan penambahan, efek bersyarat per bentuk (pakai `toggle`).

#### fx batch L2 (cabang claude/w-L2, ledger bin 2, item)
Berkas: `src/data/fx-L2.js` (blok `fxd`, sesudah `fx-D-item.js`). Isi: `FXO` (fx lama yang salah atau hanya benar saat pemicu) dan `GX.item` (spells at will dari item, `atkDice`, `atkBonus` dengan langkah level, `dcAdd`, `condImm`, `advOn`, `saveNote`, `darkTo/darkNone/darkHave`, `sense`, `abSet`, `acBase+acOver`, `acBase+acDexMax`, `attune`, `lu`, pick `t:"multi"` + entri `when` untuk Armor of Resistance dan Armor of Vulnerability, pick `cantrip` slv 1 untuk Boon of Spell Mastery, dan toggle untuk efek yang butuh pemicu).
Toggle baru: nimbus-cloud, dreadnought-active, war-horn-rune, bloodied, comets-flight, runic-circle, moon-card-wolf, lodestone-flight, ruidium-rage, ring-air-slain, ring-earth-slain, ring-fire-slain, ring-water-slain, saucepan-helmet, passkey-sword.
Satu edit data asli: `tp12-tsgs.js`, Bird of a Feather (Uncommon), `ch` reset `"1d4 hours"`. Yang belum bisa dihitung: `reports/ledger-skipped-L2.md`. Tes: `tests/golden/builds/fx_L2_*.json`.
#### fx batch L9 (ledger bin 9, `src/data/fx-L9.js`)
Dimuat di blok hbpack sesudah fx-G-engine.js. Isi: item (GX.item dan FXO), species (GX.species), dan tambalan data buku di tempat: `WXSP[buku][species]` (movesNote, lgn, linFx), `LU_X`, `SAVE_NOTES`, `SP_AUTO`, dan `ch` Iggwilv's Cauldron di `WXI`. Pola: toggle bersama untuk satu sakelar (`nautilid-suit`, `shifter-shifted`), pilihan season dan Resistance Suture lewat `when:{key:"gx-...",val}`. Yang tidak bisa: reports/ledger-skipped-L9.md.

4. Jalankan `python3 tests/mech_scan.py`. Tes memindai teks semua fitur (class, subclass, species, feat, item) dan gagal bila ada fitur bermekanik tanpa jalur hitung yang tidak ada di `tests/mech_baseline.json`. Perbaiki dengan field data. Bila memang tidak bisa dihitung, daftarkan di `by_design` dengan alasan. Jangan menambah ke `gaps` untuk fitur baru.
5. Tambah kasus di `tests/fx_engine.py` bila memperluas skema. Tambah build acuan di `tests/golden/builds/*.json` (`build`, `expect`, `why`) dengan angka dari buku. Jalankan `python3 tests/golden_builds.py`.
6. Data tp*.js dibuat oleh `tools/tp_build.py` dari JSON sumber yang tidak ada di repo. Sampai sumber itu kembali, edit `src/data/tp*.js` langsung dan catat di reports/.

#### fx ledger bin L1 (`src/data/fx-L1.js`, branch claude/w-L1)
Fixes for the ledger verdicts MISS, MISS_TOGGLE and MISMATCH of shards 00 to 03. Registry only (`GX.cls`, `GX.feat`, `GX.item`, `FXO`), no engine change. Loaded after fx-G-engine.js in the hbpack block. Sections: classes (Cleric and Druid Blessed Strikes and Elemental Fury via pick p7opt, Divine and Primal Order via p1opt, Vagabond Secret, Warmage Arcane Initiation, Witch's Curse, Monster Grimoire languages, Lichdom toggle), feats (proficiency, speed, sense, AC, limited-use rows, stage feat boons), items (Acquisitions Incorporated devices: the old row fx `save:1` is dropped by `FXO` and `saveBonusAb` takes its place). Showman: `fx.skills` removed in tp03 and tp13 so that `skillPE` can give Expertise when Performance is already known. Not done and why: `reports/ledger-skipped-L1.md`. Tests: `tests/golden/builds/fx_L1_*.json`.

#### fx batch L3 (items, ledger shards 07 and 08)
Berkas `src/data/fx-L3.js` (blok fxd, sesudah fx-D-item.js). Memakai field v4 untuk item: abUp, abPick, abDown (dengan `when` pada pilihan), abSet, langs, sense, darkNone/darkHave, advOn, saveNote, saveBonusAb, atkBonus, atkDice (when = nama baris item), unarmed, lu, toggle. `ITEM_SPELLS[item].dc` diisi untuk DC tetap. Banyak spec ledger salah karena baris spell sudah ada di ITEM_SPELLS. Yang belum bisa: `reports/ledger-skipped-L3.md`.
#### fx batch L4 (ledger bin 4)
Berkas `src/data/fx-L4.js` (sesudah fx-G). Item DMG dan sumber lain dari "Eye of Vecna" sampai "Necklace of Adaptation": `GX.item[nama]` untuk MISS, `FXO[nama]` untuk MISMATCH (fx lama diganti atau dibuang). Entri item dicari dengan nama baris persis, jadi item dengan daftar base memakai satu entri per nama varian ("Frost Brand (Greatsword)"). Saklar baru: runic-focus, flying-chariot, ghost-step, jetpack, moon-card, night, feral-guardian-transformed. Pilihan baru: tier Many Keyholes Dagger, Living Gloves, Logic Unit. Dua edit data kecil: `Iggwilv's Horn` ch menjadi 4 pakai per fajar (wotc11) dan `Marotte of Chance` diberi base Club (tp15). Yang belum bisa: `reports/ledger-skipped-L4.md`. Tes: `tests/golden/builds/fx_L4_*.json`.
#### fx batch L5 (ledger fixes, items Necronomicon to Sword of Zariel)
Berkas: `src/data/fx-L5.js` (blok hbpack, sesudah fx-G). `FXO[item]` mengganti fx lama baris, `GX.item[item]` menambah entri. Tiap entri punya `_L5:1` supaya muat dua kali tidak menghitung dua kali. Pola pilihan di item: entri berisi `pick:[{k,t:"multi"}]`, entri saudara memakai `when:{key:"gx-<k>-item-<nama item>",val}`. Kelas `GX.cls.Druid` dipakai untuk Squasher (`atkAb` pada baris bernama Squasher). Switch: lihat `reports/ledger-fixes-L5.md`. Yang belum bisa: `reports/ledger-skipped-L5.md`. Golden: `tests/golden/builds/fx_L5_*.json`, dibuat oleh `tools/gen_fx_L5_goldens.py`. Empat baris data diubah langsung (Staff of Ruling, Stonemaker War Pick, Star Razor Awakened dan Exalted, Pigskin Armor), dicatat di laporan.
#### fx batch L6 (ledger shards 15, 16, 17: items)
File `src/data/fx-L6.js` (blok `fxd`, sesudah `fx-D-item.js`). `GX.item[nama]` dan `FXO[nama]` untuk item DMG, EGW, FTD, ERLW, TSGS, dan lainnya. Pola: `FXO` membuang fx baris yang menghitung efek sekali pakai, acak, atau bersyarat sebagai permanen (Platinum Scarf, War Horn, Keelboat, Timepiece, Wheel of Stars, Ioun Vitality, Wingwear, Amethyst Lodestone, Toadstool Toddy, Infernal Machine, Infiltrator's Key, Thorn of Kren, Hide of the Feral Guardian, Pariah's Shield, Mace of the Black Crown, White Dragon Mask). Efeknya ditulis ulang sebagai `toggle`, `saveBonusAb`, `saveNote`, `lu`, `langs`, `darkAdd` atau `darkTo`, `advOn`, `atkDice`, `atkBonus`, `abUp`, `abSet`, `abDown`. Toggle baru: pariah-allies-1..3, war-horn-rune, wingwear-glide, amethyst-flight, toadstool-toddy, feral-guardian-transformed, black-crown-ablaze. Tes: `tests/golden/builds/fx_L6_*.json`.
Koreksi (fx-int): `tools`, `weapons`, dan `armor` dibaca oleh `12-logic-export-to-sheet.js`. Nilainya masuk ke `C.profs` (jadi `profs.weapons`, `profs.armor`, `profs.tools`) dan ke `C.profSrc`. Baris serangan memakai `C.profs.weapons` untuk `prof`, jadi senjata dari fx (Mockingblade: Shortsword) langsung proficient. Tes: `tests/golden/builds/fx_int_item_weapon_prof.json`. Catatan lama bahwa sheet belum membaca field itu sudah tidak berlaku.

#### Ledger bin 7 (`src/data/fx-L7.js`, blok `fxd` sesudah fx-D-item.js)
Perbaikan ledger shard 18 dan 19 (item buku 2014, gifts Theros, Tal'Dorei, Eberron). Skema sama dengan fx-D-item: `window.FXO[item]` mengganti fx baris lama, `window.GX.item[item]` menambah entri. Pola baru yang dipakai: pool `lu` pada item (muncul bila item equipped), `resToImm` untuk Dragon Mask (fx lama `res` dibuang agar tidak menaikkan dirinya sendiri), `abPick` untuk Champion gifts (up 2, max 22), pick `multi` plus entri `when` untuk Nightbringer, `toggle` untuk Wingwear, Ghost Step, Star Razor.
Empat baris data asli diubah karena `ch` tidak punya override: Iggwilv's Horn 4 pakai, Staff of Ruling 3, Ephixis 4 panah dusk, Mastix 3 dusk (`src/data/wotc11-magic-items-2014.js`).
Tidak bisa: lihat `reports/ledger-skipped-L7.md`.
#### fx batch L8 (cabang claude/w-L8, ledger shard 20 dan 21)
Berkas `src/data/fx-L8.js`, blok `fxd` sesudah `fx-D-item.js` (jadi sesudah `fx-H-audit.js` bila cabang itu digabung; `has()` melewati item yang sudah punya kunci itu). Isi: entri `GX.item` untuk item dari tee24, tftyp, toa, tghg, thhw, tkdm, tsdm, tsgeh, tsgs. Tidak ada field engine baru.
- `FXO`: Jetpack dan Cogwork Wings (fly lama dibuang, diganti toggle), Necronomicon Ex Corvis (abil lama diganti `abUp`/`abDown`), Armor of Zombie Flesh dan Second Skin (bonus AC +2 lama dibuang, AC 14 + Dex lewat `acBase`+`acOver`).
- `ITEM_SPELLS`: Mage Hand, Mending, Prestidigitation, Produce Flame, See Invisibility, Technomancy, Dancing Lights, Shield (Shield Module). Guidance, Ray of Frost, Druidcraft, Find Familiar sudah ada di tabel itu (spec ledger salah).
- `patch(nama, meta)`: menambah `base`, `wp` (baris serangan sendiri: Throwing Scarab, Tongueworm), `by` (jubah Feather: "Sorcerer, warlock or wizard" huruf kecil membuat Wizard gagal attune), `ch` (Bird of a Feather, 1d4 jam) ke baris `window.WXI` tanpa mengubah berkas tp.
- Pola: `atkBonus` dengan langkah level untuk "At character level 5/11/17" (Upgraded Magic Item); `atkDice` untuk damage tambahan bersyarat (muncul sebagai catatan di baris serangan); `toggle` untuk elixir, Charm, Scalehide Cream, Jetpack, Cogwork Wings (plus pilihan berat), Couatl Herald (tiga item), Moonswaddled, Un's Codex, Full Moon Extract, Flame Tongue of Greed, Saucepan helmet; `lu` untuk pool dan pemakaian.
Tes: `tests/golden/builds/fx_L8_*.json`. Yang tidak bisa dimodelkan: `reports/ledger-skipped-L8.md`.
#### fx batch L10 (`src/data/fx-L10.js`, cabang claude/w-L10)
Ledger fixes for shards 25 to 28 as `GX.sub` / `GX.species` data, loaded after fx-G. Uses only existing v4 fields. Also changes `LU_X` reset to `short1` for three Dancer features and empties `AUTO["Greenleaf College"]`. Skipped rows: `reports/ledger-skipped-L10.md`. Goldens: `tests/golden/builds/fx_L10_*.json`.
#### fx ledger bin L11 (`src/data/fx-L11.js`, hbpack, after fx-G)
Subclass rows from ledger shards 29 to 31 (Dancer, Druid, Fighter, Gadgeteer, Healer, Investigator, Jaeger, Martyr, Monk, Monster Hunter, Necromancer). Uses `GX.sub`, `THIRD_SUBS` (Prescient Knight, Occultist Guild, Warrior of the Mystic Arts) and corrects tp data in place (`LU_X` Bio-Serum reset, `AUTO` of Discord, Augmenter, Protector). Toggles: blood-moon, ruin-incarnate, wrath-of-the-sea, bloodied, elem-attune, perfect-form, astral-awakened. Goldens `tests/golden/builds/fx_L11_*.json`. Skipped rows: `reports/ledger-skipped-L11.md`.
#### fx batch L12 (branch claude/w-L12, ledger bin 12, shards 32 to 35)
Berkas: `src/data/fx-L12.js` (di manifest sesudah fx-G-engine.js). Isi: entri `GX.sub` untuk baris MISS, MISS_TOGGLE, MISMATCH subclass Necromancer sampai Warmage. Pakai field yang sudah ada (`defs`, `advOn`, `res`, `spells`, `spListAdd`, `lu`, `skillProf/Expert/PE`, `skillBonus`, `init`, `darkNone/darkHave`, `mv`, `toggle`, `THIRD_SUBS` untuk Sanguine Thief dan Drake-Blooded). Baris MISMATCH diganti dengan mengubah `AUTO` dan `LU_X` global dari berkas ini (tanpa mengedit berkas sumber). Dua edit kecil di `tp05-tghp.js`: Bear Witness (res dan condImm lama dibuang, kini toggle `innate-sorcery`) dan Nocturnal Predator (senses lama dibuang, kini `darkNone/darkHave`). Yang tidak bisa: `reports/ledger-skipped-L12.md`. Golden: `tests/golden/builds/fx_L12_*.json`.
#### fx batch N1 (`src/data/fx-N1.js`, branch claude/clause-gate2)
70 entries chosen from the clause gate's flagged list (ranked by RES, IMM, ADV, SPEED, SENSE, AC, PROF, SLOT) after checking each against the book text and the v5 engine. Only what the current engine can express: skill picks and expertise, `advOn` lines for species and subclasses, Ranger Roving climb and swim speed, Bestial Soul and Aspect of the Wilds picks, 14 form toggles (`toggle`), `atkDice` riders (Hobgoblin Martial Advantage, Blood Domain Divine Strike), Boon of the Furious Storm Bloodied immunity, Aven Hawk Flight, Hacker, Inspirational Caster, Squat Nimbleness, Woodwise, Mark of Storm. 12 specs that the engine already derived from text (Furious Storm resistance, Dhampir resistance, Grue darkvision and others) were dropped. Goldens: `tests/golden/builds/fx_N1_*.json` (68 files, 94 checks, `_off` files prove the toggle off state). Rows that need a new engine field are listed in `reports/gate-engine-needs.md`. The 27 same-entry overlaps with older fx files are different features of the same class, species or subclass and are documented in `tests/fx_overlap_allow.json`.

#### fx batch L13 (Warmage houses, Witch and Wizard subclasses, ledger shards 36 and 37)
`src/data/fx-L13.js`, last file of the hbpack block. Pure data, no engine change. It also corrects rows of other data files by name at load time: `AUTO[sub]` (House of Knights, Gingerbread Magic, Sky Magic, Leyline Magic), `SUB_GRANT[sub]` (Kings, Knights, Steel Magic, Lumimancer, Alkemancer), `LU_X` rows (Mystic Strategist Battle Dice, House of Rooks Covert Magic split in five), `WXS` rows (`sfree`, `cantrips`, Moonsight Darkvision add 60, always-on notes removed where a toggle replaces them) and `THIRD_SUBS["House of Bishops"]`. Toggle ids: bladesong, dragon-mask, dragon-heart, dragon-wings, dragon-tail, fam-climb, fam-swim, feed-on-life, conc. Goldens: `tests/golden/builds/fx_L13_*.json`. Rows without a field: `reports/ledger-skipped-L13.md`.
#### fx engine v5 (branch claude/w-eng2, ledger skipped rows ranked by field)
Code: `01-logic-core-helpers.js` (`pbOf` plus `setPbAdd`/`getPbAdd`), `11-logic-derivation.js` (`gfx()` settles pbAdd, `fxv` value `"halfPbUp"`), `12-logic-export-to-sheet.js` (saveProf, skill and check bonuses, AC cap, the late pass block "attackRow" and the v5 fields), sheet side `app/06` (`C.pbAdd`, `C.exhMin`), `app/19` (long rest), `app/39` (`exhTo`). Data: `src/data/fx-M1.js` (fxd block, after fx-L8). Tests: `tests/fx_engine.py` (cases "v5 ..."), `tests/golden/builds/fx_M1_*.json`.
| Field | Meaning | Example |
|---|---|---|
| `dieReplace:[{when,d,t,from,up,finesse,note}]` | Replaces the damage dice (`d`), the damage type (`t`) or adds the Finesse property (`finesse`: ability becomes the higher of Strength and Dexterity) on the matching attack rows. `when` as for `atkDice` (default `weapon`). `from`: only rows whose die is exactly this. `cat:"S"` or `"M"`: only Simple or Martial weapons. `up:1`: only when `d` is larger. The old die is kept in `dieSrc` | Gurt's Greataxe `{when:"Greataxe",d:"3d12"}` |
| `reach:[{when,add,mul}]` | Melee reach of the matching rows: `5 ft` becomes `N*mul+add`. Default `when` is `melee`. Adds a note on the row | Long-Limbed `{add:5}` |
| `rangeMul:[{when,mul}]` | Multiplies normal and long range (`80/320`) of the matching rows. Default `when` is `ranged`. Melee reach is not touched (use `reach`) | Extended Barrel `{when:"Blaster",mul:2}` |
| `acCap:N` | The entry adds at most N AC. Applies to `acAb`, `acAdd` (also an ability key), `acArmAb` and the ability part of `acBase` | Wooden Chain `{acAdd:"WIS",acCap:2}` |
| `toolExpert:[tool]` | Expertise (double Proficiency Bonus) with a tool the character is already proficient with. Does nothing without the proficiency. Writes `C.toolExp [{n,s,v}]`, adds "Expertise" to the tool source in `C.profSrc.tools` and a Defenses note with the bonus | Finger Picks |
| `toolPE:[tool]` | Proficiency, or Expertise when already proficient (the tool version of `skillPE`) | Seafarer's Jacket |
| `skillBonusNp`, `chkBonusNp` | Same rows as `skillBonus` and `chkBonus` but only for skills without proficiency. Value `"halfPbUp"` = half the Proficiency Bonus rounded up | Logic Unit `{chkBonusNp:[["INT","halfPb"]]}` |
| `saveProf:[ab]` | Fixed saving throw proficiency from any source (no pick). An existing source is kept | True Grit `{saveProf:["CON"]}` |
| `attackRow:[{n,ab,die,type,range,prof,bonus,atk,dmg,sub,k,natural,note}]` | A new attack row from an item or feature. `ab`: key, `"best"` (Strength or Dexterity) or `"cast"`. `prof`: `true`, `false`, a weapon name or `Simple`/`Martial` that must be in the weapon proficiencies, or `"armor:Shields"` (an armor proficiency). `xd:[{d,t}]`: extra damage dice on the row. `bonus`: flat to hit and damage (number, `"pb"`, ability or level steps), `atk`/`dmg` override one side. `range` with a `/` makes a ranged row (`gk` "R"). `natural:true` = Natural weapon row. A row with the same name is added once. The row is created before the other late fields, so `atkBonus`, `dieReplace` and `atkDice` of any entry reach it | Spiked Shield Shield Bash |
| `pbAdd:N` | Proficiency Bonus +N. `gfx()` sums the numeric `pbAdd` of the active entries (items count when equipped and attuned, toggles when on) and `pbOf()` includes it, so every "pb" value, DC and save follows. `C.pbAdd` is read by the sheet (`D.pb`) | Ioun Stone of Mastery |
| `slotAdd:[{lvl,n,ifHave,max}]` | Extra spell slots on the sheet's slot table. `lvl` a level or `"high"` (highest level held, at most `max`). `ifHave:1`: only when slots of that level exist. Needs a spellcasting sheet (slots), a non caster is skipped | Boon of High Magic |
| `exhLock:N` | Exhaustion cannot go below N while the entry is active. `C.exhMin`; the sheet raises Exhaustion to N, the stepper and long rest stop at N | Broken Vow |
Also fixed: a non caster whose only spells come from a feat with its own ability (Field Medic: Wisdom) showed Charisma in `C.spellcasting.ab`; the fallback now reads the ability of the feat spell source.
#### fx engine v6 (branch claude/w-eng3, ledger skipped rows ranked by field)
Code: `09-logic-feats-and-choices.js` (`gxPicks()` spell filters, `choices()` wmAdd), `11-logic-derivation.js` (item `spCls "@abpick"`), `12-logic-export-to-sheet.js` (late pass: sizeSet, dieStep, offHand, luBump, cdAdd), `14-logic-multiclass-hp-shop.js` (`syncPickItems()` grantItem, `slotAddApply()`), `18-ui-spells.js` (slot table of the spell step), sheet side `app/06` (Exhaustion release), `app/29` (tool check rows), `app/17` (`__sheetState()` also returns `exh` and `exhLk`), builder hook `__bldSpellSlots()`. Data: `src/data/fx-M2.js` (fxd block after fx-M1, no new part file). Tests: `tests/fx_engine.py` (cases "v6 ..." and direct checks), `tests/golden/builds/fx_M2_*.json`.
| Field | Meaning | Example |
|---|---|---|
| spell filters on a pick (`t:"spell"` or `t:"cantrip"`) | `lvl` (exact) or `lvMin`/`lvMax` (`"half"` = half the character level rounded up, at most 9; without any of them only cantrips). `cls`: a class name, a list of names (any of them) or `"@pick:k"` (the class chosen in pick k of the same entry, native feat picks too; `clsAll` when nothing is chosen yet). `rit:1` = Ritual tag. `schools:[..]`. `names:[..]` = only these spells. `rx` = regex on the summary. `bk` = source key of the book. The old `school`, `ct`, `nodmg` still work. The picked spells are always prepared for the class in `spCls`, which may also be `"@pick:k"` | Quicksmithing `{t:"spell",n:2,lvl:1,rit:1}` |
| `spCls:"@abpick"` on an item | Like the feat form: the ability chosen with `abPick` (pick k `ab`) becomes the spellcasting ability (`@sub:XXX`) | Cantrip Module |
| `luBump:[{match,add}]` | `+add` to the maximum of every class resource row (`C.res`) whose name is `match` or starts with it. The row tag names the source. A pool that does not exist is skipped. Runs after all rows are built | Focused Hunter `{match:"Adrenaline Points",add:1}` |
| `cdAdd:N` | Same as `luBump` on `Channel Divinity` | Blessed Reliquary |
| `wmAdd:N` | N more Weapon Mastery weapons in the class slot `wm` (a new slot when the class has none). Counts only while the entry counts. Not for 2014 rules | Star-Spangled Banner, Burden of Awakening |
| `offHand:true` | An extra row `<weapon> (off-hand)` for each Light melee weapon row, with the ability modifier on the damage (no `nomod`). Rows already named so are not doubled | Two-Weapon Fighting (feat) |
| `sizeSet:"Tiny"` | The size becomes exactly this, also smaller. Runs after the raising `size` fields | Lilliputian |
| `dieStep:[{when,n}]` | Moves the weapon die `n` steps on the ladder d4, d6, d8, d10, d12 (2d6 counts as d12). `n:-1` is one step down, minimum d4. Dice such as 3d12 and Unarmed Strike are not changed. The old die is kept in `dieSrc` | Lilliputian `{when:"weapon",n:-1}` |
| `grantItem:[{n,q}]` | The item joins `B.inv` (row tag `px` = `fx:kind:owner:idx:i`) while the entry counts and leaves with it. An item the player owns without the tag is never removed. The name must be a weapon, armor or priced item | Exo-Frame, two Battlefists |
| `slotAdd` in the builder | The spell step shows the same extra slots as the sheet (`slotAddApply()`); the line says where they come from | Boon of High Magic |
| Exhaustion release | `S.exhLk={min,add}` remembers how many levels the lock added. When `C.exhMin` drops (item unequipped, toggle off), those levels leave with it; levels the player had before stay. A new play-state key, no rename | Broken Vow |
| Tool check rows | The Proficiencies panel lists `Tool checks` for each tool in `C.toolExp`: double the Proficiency Bonus, plus the ability modifier the DM names | Finger Picks, Seafarer's Jacket |
AC states need no new field: the toggle (v3b) with `acAdd` covers Agile Parry, Evasive Fighter, Anticipatory Strike, Blood-Drunk (`acAdd:"rage"`, `saveBonus:"rage"`) and Circle of the Feathers (Swift Glide and Enchanted Wings share the toggle `avian-shape`). The Feathers Fly Speed (5 x Wisdom modifier) is not set: `mv` takes a fixed number.
Limits: the attack-roll cantrip filter of Spell Sniper (2014) is a name list (PHB cantrips), the data has no attack flag. Spells that are ritual-only (Ritual Caster 2014) are marked by a Defenses note, the sheet still treats them as always prepared. Rows still skipped: `reports/ledger-m2.md`.

## SOLID stage 9 (sheet UI, boot, Training Ground, Learn)

Analisis dan angka: `reports/solid-s9-analysis.md`. Ringkas:

- Env: `app/00-env.js` (juga API browser), `boot/boot-env.js` (const `BootEnv` di skrip klasik pertama), `tg/00-env.js`, `learn/00-env.js`. Kode di area itu tidak memakai `window.` langsung. Sisa: pembungkus UMD `tg/20-engine.js` dan `tg/25-sim.js`.
- File besar dipecah berurutan: 08 jadi 08, 08b, 08c. 15 jadi 15, 15b, 15c, 15d. 16 jadi 16, 16b (data catatan rilis), 16c. 29 jadi 29, 29b, 29c (tabel ikon). 32 jadi 32, 32b, 32c, 32d. 34 jadi 34, 34b, 34c. Impor file lain sudah diarahkan ke pemilik nama.
- Registry baru di `app/06a-logic-ui-registry.js`: SEARCHGRP (grup hasil Search, `gsHTML`), OVERLAY (lapisan Back, `ovTop`, urutan daftar = urutan z), PANEL (halaman sheet, `PAGES` dan perintah "go to").
- `__R`: tahap 9 menyisakan 275 nama di app dan 49 di builder. Tahap 10 menghapus semua pemakaian: nama dengan pembaca lebih awal pindah ke port akhir (`app/00a-reg-late-ports.js`, `builder/01b-logic-late-ports.js`), `hpWord` dan `slotAddApply` jadi impor, `classFx` dan `kitItems` dibuang karena tidak ada pembacanya. Lihat `reports/solid-s10-analysis.md`.

## SOLID tahap 13C (builder sisa, tes baru)

- `builder/09b-logic-choice-stages.js` memiliki `choicesBuild` (isi lama `choices()` dalam tahap `chBase`, `chBg`, `chSp*`, `chClass`, `chWarlock`, `chLang`, `chFxPicks`). `choices()` di file 09 memanggilnya lewat port akhir.
- `fromSheet`: pilihan subclass jadi `fsSubPicks` (satu fungsi per tipe pilihan: `fsGotTool`, `fsGotSkills`, `fsGotNamed`, `fsGotDefense`). `__bldNorm`: blok `byName` jadi `normByName` dengan langkah `bnCands`, `bnPut`, `bnMiPicks`, `bnMatch`, `bnDeal`, `bnPass`. `pk` dan `choiceBody` memakai tabel per tipe (`PK_KINDS`, `CB_TYPES`). `luRows`, `defenses`, `renderEquip` dibagi per sumber atau bagian.
- `fx/02` TIDAK dipecah (ditunda): perekam efek baru baru 93 persen stabil, belum cukup sebagai bukti identik.
- Tes: `python3 tests/solid_builder_diff.py --base DIR` (keluaran `__bldNorm` dan `__bldRound` pada 3890 masukan, build ini lawan pohon pembanding). `python3 tests/solid_fx_snapshot.py OUT.json [--root DIR]` dan `--diff A B [--ignore-ord]` (perekam efek: pendengar, animasi, pengamat, simpul DOM, DOM akhir, hook `__mi*`, tiga skenario, 390 dan 1250). Perekam tidak masuk CI.


## Uncovered 3: narrow field extensions

| Field | Meaning | Example |
|---|---|---|
| `weaponGroups:[{cat,k}]` | Grant proficiency only for a weapon whose category and kind match. `cat` is `S` or `M`, and `k` is `M` (melee) or `R` (ranged). A thrown melee weapon keeps kind M. Invalid groups are ignored. The standard proficiency panel names the group, and attack rows use the structured test. | Gun-Mage Adept: `weaponGroups:[{cat:"M",k:"R"}]`, at character level 4, ed 2024 |
| `classOnly:"Class"` | Gate an effect to its actual class/subclass source part. This uses the source class, including a multiclass part, rather than the primary class of the character. It is not a feat class prerequisite. | Alchemist / Mutagenist Advanced Mutation, l 10 |

`fx-Z5.js` declares Piloting in the existing XSK registry (Dexterity, as named by the Battleframe feat text). The extra-skills handler creates that row only when an effect or proficiency calls for it. Existing storage keys and data shapes do not change.
