# CLAUDE.md

Pembuat dan sheet karakter D&D 5e (aturan 2014 dan 2024). PWA satu halaman. Tanpa framework. Hosting Cloudflare (Pages, Workers, D1, R2).

## Aturan keras

- JANGAN baca, grep, atau edit `index.html`. `index.html` hasil build (28 MB). Semua kode ada di `src/`.
- Alur edit: ubah `src/`, jalankan `python3 build.py`, lalu `python3 build.py --check`. Commit `src/`, `index.html`, dan `sw.js` bersama.
- File baru wajib didaftarkan di `src/manifest.json` pada blok dan posisi yang benar. Urutan manifest = urutan eksekusi.
- Modul hanya boleh mengimpor file yang lebih awal di manifest. Nama dari file yang lebih akhir lewat port akhir (`builder/01b-logic-late-ports.js`, `app/00a-reg-late-ports.js`). Cek: `node tools/esm_codemod.js <blok>`.
- Builder dan fx tidak membaca `window.*` langsung. Pakai `genv` (`builder/00-env.js`) atau `FXENV` (`fx/00-fx-env.js`).
- Storage lewat `window.__store`, bukan `localStorage`.
- Efek fitur ditulis sebagai data (fx schema), bukan kode per nama. Daftar field ada di SOURCE-NOTES.md bagian "fx schema".
- Jangan ubah `tests/guard_baseline/`, `tools/ts-baseline.json`, `tools/html-baseline.json`, atau golden tanpa diminta.

## Peta engine (src/builder)

| File | Isi |
|---|---|
| `00-env.js` | Satu-satunya pintu ke `window.*` |
| `05-logic-choice-model-ruleset.js` | Model pilihan dan ruleset 2014 atau 2024 |
| `09*-logic-*` | Feat, tahap pilihan, overlay edisi, gerbang sumber WotC |
| `10a-logic-fx-registry.js` | Kontrak handler efek, `runFxPhase` |
| `10b`, `10c`, `11c` | Handler efek: entri, skor kemampuan, sheet |
| `10e-logic-fx-schema.js` | Skema entri efek (semua field yang boleh) |
| `11-logic-derivation.js` | `gfx()` mengumpulkan entri efek dari semua sumber |
| `11b-logic-fx-sources.js` | Sumber entri: class, subclass, species, background, feat, item |
| `12-logic-export-to-sheet.js` | `sheetInputs()` dan `toSheet()` |
| `12a-logic-sheet-registry.js` | `registerSheetGroup`, `registerSheetRule`, `runPhases` |
| `12c` sampai `12l` | Handler sheet per fase |
| `03-logic-magic-item-effects.js` | Efek item, `activeFx()`, override `FXO` |
| `14-logic-multiclass-hp-shop.js` | Multiclass, HP, toko |

Data efek per sumber ada di `src/data/fx-*.js`. Training Ground (simulasi tempur) ada di `src/tg/20-engine.js` dan `25-sim.js`.

Menambah aturan sheet: satu `registerSheetGroup()` atau `registerSheetRule()` dengan `reads`, `writes`, dan `about`. Orkestrator tidak diubah.

## Folder lain

`src/app` sheet dan Home. `src/fx` efek UI (IIFE klasik). `src/data` data buku (blok tertunda). `src/pdf` renderer PDF. `src/learn` modul belajar. `src/boot` skrip awal. `functions/` dan `workers/` API Cloudflare. `tools/` generator data dan gerbang CI. `reports/` catatan desain.

## Mencari data

Banyak file data berisi satu tabel dalam satu baris (`07-data-2014-spells.js` satu baris 431 KB, `q07-bestiary.js` 4,9 MB). Jangan grep file itu. Pakai `tools/peek.py`:

- `python3 tools/peek.py "Fireball"`: semua entri bernama Fireball, dengan file, baris, kolom, dan tabelnya (contoh `SP14.ov`)
- `python3 tools/peek.py "Fireball" -f 07-data`: hanya file yang path-nya memuat teks itu
- `python3 tools/peek.py "ring of prot" -i --where`: cari tanpa beda huruf besar kecil, hanya lokasi
- `python3 tools/peek.py --keys src/builder/07-data-2014-spells.js`: struktur tabel di satu file

## Tes cepat

`python3 tests/quick.py --changed`: pilih area dari file yang berubah terhadap `origin/main`, jalankan `build.py --check`, lalu tes area itu secara paralel. Log ada di `tests/out/quick/`.

- `python3 tests/quick.py engine`: fx_engine, golden_rules, golden_builds, invariants --quick (sekitar 4,5 menit, golden_builds paling lama)
- `python3 tests/quick.py --list`: daftar area
- `python3 tests/quick.py --changed --dry`: lihat tes yang akan jalan tanpa menjalankannya

## Tes minimum per jenis perubahan

Semua tes jalan dari root repo dan membuka `index.html` lokal. Build dulu sebelum tes. `tests/quick.py` menjalankan daftar ini per area.

| Perubahan | Tes |
|---|---|
| Apa saja | `python3 build.py --check` (sekitar 17 detik) |
| Engine efek atau data `fx-*` | `python3 tests/fx_engine.py`, `python3 tests/golden_builds.py`, `python3 tests/golden_rules.py`, `python3 tests/invariants.py` |
| Handler sheet (`12*`) | `python3 tests/solid_contract.py`, `python3 tests/solid_snapshot.py` |
| Struktur modul atau file baru | `python3 tests/names_lint.py`, `python3 tests/guard_all.py --enforce`, `python3 tools/tsc_gate.py` |
| Training Ground | `node tests/tg_engine.js 50` |
| UI atau CSS | `python3 tests/scenarios.py`, `python3 tools/html_gate.py` |
| PDF | `python3 tests/pdfx_export.py` |
| Item, feat, spell | `python3 tests/coverage_gate.py`, `python3 tests/mech_scan.py` |

Daftar lengkap tes yang dipakai CI ada di `.github/workflows/tests.yml` (Job A wajib).

## CI

CI tidak jalan untuk push ke branch kerja, dan tidak jalan untuk PR draft. CI jalan untuk push ke main, PR yang bukan draft, jadwal malam, dan Run workflow manual. Buka PR sebagai draft selama kerja masih berlangsung. Tandai "Ready for review" saat semua perubahan sudah masuk. Selama draft, uji lokal dengan `tests/quick.py`.

## Rujukan

- `SOURCE-NOTES.md`: peta file lengkap, fx schema, checklist fitur baru. Baca per bagian dengan `grep -n '^## '` lalu `sed -n`, jangan seluruhnya.
- `reports/solid-guards.md`, `reports/solid-deps-map.md`: penjaga SOLID dan peta dependensi.
- Versi rilis tercatat di judul commit (contoh `0.0.80: ...`).

## Plugin project

Aktif lewat `.claude/settings.json`.

Anthropic Directory: superpowers (TDD, systematic-debugging, verification-before-completion), feature-dev (/feature-dev), pr-review-toolkit (/review-pr, silent-failure-hunter), typescript-lsp (definisi dan referensi di `src/`, server dipasang hook sesi), frontend-design (kerja UI), Cloudflare (Workers, D1, R2, web-perf).

Pihak ketiga, dikunci ke commit yang sudah dibaca lewat `ref` di `extraKnownMarketplaces`:
- ponytail (DietrichGebert/ponytail, 96608e0): perubahan terkecil yang lengkap.
- planning-with-files (OthmanAdi/planning-with-files, 51bf62d): rencana kerja di file `task_plan.md`, `findings.md`, `progress.md` di root repo. Commit file itu supaya sesi berikutnya melanjutkan dari sana.
- application-performance (wshobson/agents, 4220308): agen performance-engineer dan frontend-developer, perintah /performance-optimization.

Naikkan `ref` hanya sesudah membaca isi versi baru.
