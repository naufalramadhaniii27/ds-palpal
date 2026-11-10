# Requests to other parts

## Logic: Builder Apply drops Library additions (from UI/UX, T4)
- Library "Add" and "Buy" write entries to the sheet with `lib:1` (items in `C.inv`, spells in the spell list).
- Builder Apply replaces `C`. `manualLost` lists only attacks and resources, so `lib:1` entries vanish without a warning.
- Ask: carry `lib:1` entries over in Apply, or list them in `manualLost` so the user sees what is lost.
- Not changed here because Apply belongs to Logic.

## Art: latar Home versi lanskap (dari T10)
Latar Home di PC memakai `home-inn-phone` (potret, 1088 x 1920) dengan cover. Di layar 2x ia diperbesar sekitar 2,3x. Perlu `home-inn-pc` lanskap 2400 x 1344, gaya sama. Setelah ada, tambah ke `tools/art_pipeline.py` (blok g0) dan pakai di CSS Home untuk lebar di atas 760 px.

## Art: ikon Species, Background, Size (dari T10)
Baris Identity di sheet memakai art untuk Class (`emblem`) dan Subclass (`esub`). Species, Background, dan Size masih ikon garis umum karena belum ada asset. Gaya dan ukuran sama dengan `icon` (576 px HD, tampil 22 px).

| Kategori | Jumlah | Nama file (slug) |
|---|---|---|
| species | 10 | aasimar, dragonborn, dwarf, elf, gnome, goliath, halfling, human, orc, tiefling |
| background | 16 | acolyte, artisan, charlatan, criminal, entertainer, farmer, guard, guide, hermit, merchant, noble, sage, sailor, scribe, soldier, wayfarer |
| size | 6 | tiny, small, medium, large, huge, gargantuan |

Setelah ada: tambah kategori ke `tools/art_pipeline.py` dan `img/manifest.json`, lalu UI/UX memakai `__artIc` di `renderIdentity`. Species kustom (misal Retron) dan background kustom tetap memakai ikon garis.

## Logic/Boot: kebijakan Trusted Types memotong teks pemain yang sah (dari riset 2026-10-30)
Berkas: src/boot/trusted-types.js, kebijakan `default`, ekspresi `BAD` dan `strip`.
Masalah: `\son[a-z]+\s*=` dicek pada seluruh string HTML, termasuk teks biasa yang sudah di-escape. Teks pemain yang memuat " on..." lalu "=" ikut dipotong.
Bukti (Chromium, build main eab1472, tools/research/tt_bug.py dan tt_real2 di scratchpad):
| Teks pemain | Tampil |
|---|---|
| Rage: once = 1 per rest | Rage: per rest |
| Spell slots: one = 1st level | Spell slots: level |
| Javascript: a language | blocked: a language |
| Nama fitur "Darkvision once = 1" di tab Features | Darkvision> (penutup tag ikut hilang, markup rusak) |
Dampak: teks hilang di tab Features, detail, dan lembar cetak. Bukan celah keamanan (CSP tetap memblokir). Tidak ada data yang berubah, hanya tampilan.
Usul perbaikan (bagian Logic): cek hanya di dalam tag, bukan di teks: `/<[^>]*\son[a-z]+\s*=/i`, atau urai dengan `<template>` dan buang atribut `on*` dan elemen berbahaya dari DOM hasil urai. Tes: korpus XSS (262 string diuji, 0 jalan) dan korpus teks sah di atas harus lolos keduanya.
Tidak diubah di sini.

Tambahan 2026-10-30 (bukti untuk permintaan di atas): prototipe pembersih berbasis DOM ada di tools/research/sanitize-proto.py (di luar app).
| Ukuran | Kebijakan sekarang | Pembersih DOM |
|---|---|---|
| 21 teks sah (termasuk "once = 1", tombol dengan teks itu) | 5 diubah | 0 diubah |
| 25 payload XSS (script, onerror, onload, javascript:, entitas tersamar, form, object, embed, meta, base, svg, template, math) | 1 jalan (link `jav&#x09;ascript:` bila diklik) | 0 jalan |
Catatan: pada app, CSP tetap memblokir javascript:, jadi satu payload itu bukan celah nyata saat ini. Kebijakan Trusted Types `default` tidak boleh memanggil `innerHTML` biasa untuk mengurai (rekursi). Perlu satu kebijakan bernama kedua (misal `cs-parse`, hanya mengembalikan string) yang harus ditambahkan ke daftar `trusted-types` di CSP buatan build.py. Tidak diubah di sini.

## Logic/Boot: salinan localStorage yang rusak menimpa salinan IndexedDB yang sehat (dari riset 2026-10-30)
Berkas: src/boot/store-gate.js, bagian "Slow start" dan rekonsiliasi per kunci. Komentar kode: nilai localStorage yang berbeda dari IndexedDB dianggap ditulis di luar versi app ini dan menang.
Bukti (Chromium, build main eab1472, tools/research/idbcheck.py):
| Langkah | Hasil |
|---|---|
| 1 Buka app dengan karakter Yudhi | IndexedDB menyimpan 11.747 karakter, JSON sah, nama "Yudhi Kelapa" |
| 2 Potong nilai localStorage `yudhi-kelapa-build-v3` jadi separuh, muat ulang | Layar menampilkan "New Character". Tidak ada layar pemulihan. IndexedDB sekarang menyimpan 5.873 karakter, bukan JSON sah |
| 3 Lakukan satu edit | IndexedDB tetap rusak |
Artinya satu salinan cermin yang rusak menggantikan salinan sehat di IndexedDB pada pemuatan berikutnya. Dalam uji ini saya menulis kerusakannya sendiri lewat localStorage. Seberapa sering rusak seperti ini terjadi di perangkat nyata tidak saya ukur.
Enam jenis kerusakan dicoba: potong separuh, string kosong, JSON bentuk salah (array), `null`, satu byte diubah, level berisi teks. Lima menghasilkan karakter kosong. Level berisi teks menampilkan "Fighter 1" (level 4 berubah jadi 1 tanpa pesan).
Usul (bagian Logic): sebelum nilai localStorage boleh menang, cek bisa di-parse dan bentuknya benar untuk kunci yang dikenal (misal `v===3` dan `abilities` untuk sheet). Bila tidak sah dan IndexedDB sah, pakai IndexedDB, simpan nilai rusak di meta untuk diagnosis, dan beri tahu pengguna. Ini bagian dari N25. Pertanyaan: mengapa layar pemulihan (BAD) tidak muncul pada jalur ini? Tidak diubah di sini.

## Request ke UI/UX: anggaran 60 fps pada CPU 4x (2026-10-30, dari sesi riset)
Syarat user: minimum 60 fps, dipilih pada kondisi CPU 4x. Bukti dan angka ada di reports/rencana-kerja-engine.md bagian 3g. Usul F1 sampai F3:
1. Tier lemah (N14) memaksa mi-fx = off pada frame lambat berulang. Ukuran: pindah tab 44 ke 51 fps, damage 44 ke 55 fps.
2. Batasi animasi dan transisi CSS global pada tier lemah. Ukuran: pindah tab 44 ke 53 fps.
3. Telusuri pemicu layout pada klik pindah tab.
Status: belum dikerjakan. Tidak ada perubahan di src/.

## Request ke bagian API (functions/api): guard DEV_USER dan concurrency (2026-11-01, dari audit teknis dan bantahan)
Bukti dan konteks ada di reports/bantahan-audit-teknis-20261101.md. Tidak ada perubahan di functions/ dari sesi ini.
1. Guard jalur tanpa ACCESS_TEAM. Sekarang `who()` di functions/api/[[path]].js menerima DEV_USER bila ACCESS_TEAM kosong, di host mana pun. Usul: bila ACCESS_TEAM kosong, hanya localhost dan 127.0.0.1 yang boleh memakai jalur itu, selain itu `return null`. Kode contoh ada di bagian 5 dokumen bantahan. Guard yang diusulkan audit awal (tolak bila DEV_USER dan ACCESS_TEAM sama-sama ada) terbalik, jangan dipakai.
2. Concurrency optimistis di sinkronisasi. Klien mengirim nomor revisi saat PUT, server menolak (409) bila revisi di server lebih baru, klien lalu menawarkan pilihan lewat ask(). Perkiraan 20 baris di API dan sebagian kecil di app/43-logic-cloud-sync.js. Butuh tes: tests/cloud_sync.py (perlu server lokal).
3. Backup D1 harian (di luar repo): `wrangler d1 export dnd-sheet --remote --output backup-DATE.sql`, simpan 14 hari, beri tahu bila gagal. Perlu cron di mesin Anda atau di VPS.
Status (2026-11-01, sesi yang sama):
1. Guard: dikerjakan di functions/api/[[path]].js dan diuji (tests/api_dev_guard.mjs, 8 pemeriksaan, 2 di antaranya gagal pada kode lama). api_social lulus (37) terhadap server lokal dengan guard baru. Produksi tidak berubah karena wrangler.toml dan workers/wrangler.jsonc mengisi ACCESS_TEAM.
2. Concurrency: tidak perlu. Sudah ada (base, 409, force, versi, gabung per bagian) dan sudah diuji di tests/cloud_sync.py. Usul audit keliru.
3. Backup D1: .github/workflows/d1-backup.yml. Perintah ekspor diuji lokal (--local). Belum jalan di GitHub: butuh secret CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID, dan jadwal GitHub hanya jalan dari main, jadi aktif setelah rilis berikutnya.

## Catatan untuk usulan "pisahkan data dari shell" (2026-11-01)
Bila data jadi berkas terpisah, sw.js perlu mengunduhnya di latar belakang atau memasukkannya ke daftar cache pasang. Tanpa itu aplikasi tidak lagi sepenuhnya offline sebelum tiap data dibuka sekali. Hasilnya lebih cepat pada tampilan pertama, bukan unduhan total yang lebih kecil. Keputusan belum diambil.

## Request ke bagian UI/UX: pilihan teks bebas `t:"text"` (fx engine v3a, 2026-11-04)
Engine sudah menyimpan dan menampilkan pilihan bertipe `text`. `choiceBody(c)` di src/builder/17-ui-step-builder.js belum punya cabang untuk `c.t==="text"`, jadi kartu pilihan tidak menampilkan kolom isian.
1. Tambah cabang `c.t==="text"` di `choiceBody`: satu `<input class="btx" type="text">` (atau textarea pendek) yang menulis string ke `B.ch[c.key]` (bukan array). Judul dari `c.title`. String kosong berarti belum dipilih (`isDone` memakai `!!v`).
2. Contoh nyata: Toymaker 20, Clockwork Lich, kunci `gx-spimm-sub-Toymaker` (tiga spell kebal).
3. Sheet: baris Defenses (Immunity, "Spells: ...") sudah dibuat engine lewat `defT`. Bagian "Your choice." di fitur memakai `ycOf` yang sudah menerima string.
4. Atribut baru di baris serangan `C.attacks[i]`, opsional: `xdice:[{d,t,s}]` (dadu damage tambahan) dan `abSrc`. Catatan teks sudah ikut di `note`, jadi UI tidak wajib berubah. Bila ingin kolom damage menampilkan dadu tambahan, baca `xdice`.
Status: UI belum dikerjakan. Tanpa langkah 1, pemain tidak bisa mengisi pilihan teks di builder (nilai bisa diisi lewat impor).
## UI/UX: toggle fx and Masterwork flag (from Logic, fx engine v3b, 2026-11-04)
Logic side is done (branch claude/fx-engine-v3b). Names below are fixed, do not rename.
1. Toggle list. `C.fxToggles = [{id, label, on:boolean, src}]` lists every toggle fx the character has (for example Chitinous Shell, Slimy Form, Incorporeal Movement, the Sanguine Curse, Raging for Path of the Abomination). `on` is the current state. `src` is the source label. Show one switch per row, for example in Defenses or a small "States" strip. Hide the strip when the list is empty.
2. State. The state is saved in the sheet state as `S.fxT = {[id]: true|false}` (missing id = the entry default, false). Save it with the normal sheet save. Do not rename and do not store it in C.
3. Expose it. Add `fxT:S.fxT` to the object returned by `window.__sheetState()` (src/app/17-logic-tab-sync-and-test-hooks.js). The builder reads the state there.
4. On a switch tap: write `S.fxT[id]=on`, save, then call `window.__bldFxToggle(id,on)` (it rebuilds the sheet through `__sheetSoft`, the same way `__bldToggleEq` does) and re-render. It returns false when the sheet is not a builder-made one (hand-filled sheet): then show a toast such as "Open Build and Apply to use this switch." and keep S.fxT as set.
5. Rage link (optional). Toggle id `rage` (Path of the Abomination: Large size, STR and DEX plus the Rage Damage bonus) should follow the sheet Rage mode. When the Rage mode turns on or off, set `S.fxT.rage` and call `window.__bldFxToggle("rage",on)`.
6. Masterwork. Inventory rows have `mw: true|false` (field `mw` on the row in `C.inv`, absent = false). Show a Masterwork on/off control on armor rows. On tap call `window.__bldSetMw(name, occ, on)` (same arguments as `__bldSetQty`, `occ` from `__R.occOf`). The AC bonus of Craftsman Masterwork Armor counts while the worn armor row has `mw` (the name suffix ", Masterwork" still works).
7. Inventory rows added by a pick (Cybernetic Crafts, Mad Scientist grafts) carry `px` in the builder inventory (`B.inv[].px`). The sheet does not need it.
Test without the UI: in Playwright set `S.fxT` and call `window.__bldFxToggle(id,on)`, or call `window.__bldSheetFor(build, {id:true})`.

## Data: items found by tests/invariants.py (from Logic/Checker, 2026-11-04)
1. Limited uses without a feature card. These counters are on the sheet but no feature of that name exists in the class, subclass or species data, so the counter has no text to belong to. Add the feature (or rename the `feature` of the limited-use row to an existing card): Bard College of Dirges "Memento Mori" (a spell, free cast), Necromancer Reanimator "Reanimated Companion", "Jolt to Life" (owner "Reanimator's Skill Set"), "Facilitated Revival: Raise Dead" (owner "Refined Reanimation"), Rogue Misfortune Bringer "Jinx Points", Wizard Blood Magic "Arcane Bloodletting", "Hemomantic Recovery", Wizard Plague Doctor "Imbalance Humors", Artificer Forge Adept "Aura of War", "Empower Aura", Artificer Maverick "Improved Genius", Barbarian Path of the Dad "Pretty Sure It's Over Here", species Accursed "Legacy: False Life" and "Legacy: Mirror Image" (owner "Legacy of a Thousand Young"). The test keeps them in a known list (KNOWN_DATA in tests/invariants.py). Remove an id from that list when fixed.
2. Vagabond class feature "Martial Recovery" (level 20) and the Dragon Banner subclass feature "Martial Recovery" (level 6) share one name, so the sheet has two actions and two counters with the same name (different rest type). Rename one.
3. Subclass tables of the source tkdm list every feature twice (College of Entropy, Entropy, Prescient Knight, Farseer, Serophage, The Sibyl, Blood Mage, Blood Magic (Deep Magic), Elementalist, Ring Warden). Logic now drops the repeat (subDedup in src/builder/09), but the data should be cleaned in src/data/tp14-tkdm.js.
4. The Rules Glossary links [[...]] to LIB_RULES entries only work after the Library was opened once (LIBR flag set in src/app/27 line 308). UI/UX: set LIBR when the app starts or let rich() look at LIB_RULES without the flag.

## Data / UI/UX: 2014 ruleset still shows 2024 content (found while testing Mistikan 2014, 2026-11-05)
Seen in the builder at Rules edition 2014 with Retromistika on (Sorcerer 7, Mistikan, Khodam Sorcery). Not fixed in branch claude/mistikan-2014-asi, which only fixes the missing 2014 ability increase for Mistikan and Retron.
1. Level 4 feat dropdown (class step, `feat4`) lists 2024 feats mixed with 2014 feats: Alert, Crafter, Healer, Lucky, Musician, Savage Attacker, Skilled, Tough, Actor, Athlete, Chef, Grappler, War Caster, Telekinetic, Speedy and more next to Alert (2014), Actor (2014), War Caster (2014) and so on. At 2014 the list should only hold the 2014 feats (plus Ability Score Improvement and the Blessed Warrior, Druidic Warrior style picks only if they belong to 2014). Owner: Logic or UI/UX (the filter that builds the feat list for `feat4`).
2. Khodam Sorcery text (src/data/hbpack-builtin-homebrew.js, Retromistika subclass) and the Mistikan ancestry text use 2024 wording at 2014: "Magic action", "Emanation", "Bonus Action" rules. In 2014 the same effects should say "action" and "within 10 feet". The sheet Actions tab also shows the 2024 action list at 2014 (Influence, Magic, Study, Utilize). Owner: Data (text variants for 2014) and Logic (action list by edition).
3. Species list at 2014 only shows species that carry `asi`, `asiPick` or `asiFlex` (sp14List). Any homebrew species added later needs one of these fields or it will not appear at 2014.

## 2026-11-06, art 0.0.14: data gap

| Dari | Ke | Permintaan | Catatan |
|---|---|---|---|
| Art | Data | Tambah Bastion facility Stable (DMG 2024, special facility level 9) ke data facility | Ikon sudah terpasang di img/icon/facility/stable.avif dan HD, muncul otomatis saat entrinya ada |

## 2026-11-08, PDFX export: perubahan kecil di luar file sendiri

| Dari | Ke | Perubahan | Catatan |
|---|---|---|---|
| UI (export PDF) | UI (creature) | `src/app/29b-ui-creatures-extras.js`: satu baris `export {crExpr,crText,crOf,crList,crEnv,crStat,crHpMax};` di akhir file | Perilaku sama. Ditaruh di akhir file supaya tidak bentrok dengan PR #20 (SOLID tahap 12) yang memecah `crList`. Dipakai `37a-ui-pdf-model.js` untuk stat block creature di PDF. Sudah diterapkan karena tanpa ini fitur tidak jalan. Mohon ditinjau pemilik file |
| UI (export PDF) | Logic (env) | `src/app/00-env.js`: `PDFLib`, `fontkit`, `PDFX` ditambah ke `bind([...])` | Pola sama dengan `html2canvas` dan `jspdf` |
| UI (export PDF) | Data, Logic (builder) | Selesai 2026-11-09: PDF memakai `f.full` dari sheet (builder 2014 mengisinya dari `CLS14.full` dan data subclass). Teks panjang species dan background PHB 2014 ditulis ulang dengan kata sendiri di `src/builder/06b-data-2014-long-text.js`. `12j` memakai `full14()` untuk fitur species dan background, dan hook `__bldLong14` (di `25` dan `00-env`) dipakai PDF untuk sheet lama tanpa `full`. Belum ada teks panjang untuk species dan background di luar PHB 2014, dan Spell Slots tetap satu baris. Builder menulis "At your level: 1 uses", PDF membetulkan jadi "1 use" | Usul untuk Data: perluas `06b` ke buku lain bila ada sumber |
| UI (export PDF) | Data | `SPELL_FULL` 2024 masih ringkas untuk Find Steed (tanpa stat block Otherworldly Steed), Command (efek lima perintah), Commune (peluang gagal 25%), komponen bernilai (Holy Water 25+ GP untuk Protection from Evil and Good). Range Find Steed perlu dicek ke PHB 2024 | Detail di claude/pdf-template-2024-mapping.md di project |
| UI (export PDF) | Logic (builder hooks) | `src/builder/25-logic-hooks-for-the-sheet.js`: `__bldFuzz` menerima `o.rs==="2014"` (memakai `rsLoad("2014")`, background tanpa ASI, level subclass 2014 lewat `subLv`). `__bldLists("2014")` memberi daftar PHB 2014 dan DMG 2014 dari langkah Sources | Hanya hook tes. Tanpa `o.rs` perilaku sama |
| UI (export PDF) | UI (creature) | Beast Master (2014): sudah dikerjakan 2026-11-08 atas permintaan pemilik. `crListBM` di 29b mendaftar beast CR 1/4 atau lebih rendah, Medium atau lebih kecil (atau hanya `C.companion` bila dipilih). `crBm14`: Proficiency Bonus ranger ke AC, serangan, damage, save, skill, Passive Perception. HP maksimum = yang lebih tinggi antara HP sendiri dan 4 x level ranger. 2024 tetap Primal Companion | Diuji tests/pdfx_sweep.py (cek baru: 2014 harus Ranger's Companion, 2024 tidak boleh), tests/creature_icons.py, scenarios. Pemain memilih beast di sheet (Extras, kartu beast: Make this my companion). Pilihan disimpan di state main `S.comp14` (kunci opsional baru, data lama tetap terbaca) karena Apply dari builder mengganti seluruh `C`. Sebelum memilih, Extras dan PDF melampirkan semua beast yang boleh dipilih. Usul untuk Logic (builder): tambah pilihan beast 2014 di langkah Class supaya juga bisa dipilih di builder |

## 2026-11-10, uncovered 2: temuan sheet untuk Logic dan Data

| Dari | Ke | Perubahan | Catatan |
|---|---|---|---|
| Uncovered | Logic | Gloom Stalker (2014) level 7, Iron Mind: sheet menulis Note teks 2024 dan tidak memberi proficiency save Wisdom. Aturan `gloom-stalker-7-saves` di `12c` memeriksa sub `Gloom Stalker` tanpa `(2014)` | Dicek dengan probe, karakter Ranger 7 2014: `C.saves` hanya STR dan DEX |
| Uncovered | Logic | Ranger 6 pada build 2014 mendapat Climb dan Swim Speed dari "Roving". Aturan `ranger-6-roving-speeds` berlabel "2024 only" | Probe: `C.moves` berisi climb:30 dan swim:30 di Ranger 6 2014 |
| Uncovered | Data | Draconic Bloodline (2014): baris data Draconic Resilience bertulis level 3, kode memberi HP +1 per level mulai level 1 dan AC dasar 13 + Dex | Perlu salah satu diluruskan |
| Uncovered | Logic | Fighter, Barbarian, Monk, Paladin, Ranger: aksi Attack menulis "Make one attack per Extra Attack" tanpa jumlah serangan | Kandidat: isi `extraAttack` 2/3/4 per level. Mengubah teks karakter resmi, perlu keputusan |

## 2026-11-10, consumed effects: existing first-render item links

The first render of Potion of Giant Strength (cloud) can show the generic words "Potion of Giant Strength" as plain text before the lazy item-reference index is warm. A subsequent render links the same words to the storm variant. The description, STR amount and potion mechanics are identical. This was observed by the paired effect test, not inferred from a book. The new U15 cases warm that item's reference index before comparing sheets, keeping their strict allowed-path checks rather than permitting arbitrary inventory HTML changes. Reference-index behavior was not changed in this task.

Resolved in the consumed-effect work: the live speed panel read `C.speeds` but omitted GX `C.moves`, even though the engine calculated the latter and mentioned it in the Speed source. The panel now merges both representations by maximum displayed speed and preserves condition/Exhaustion adjustments. Dedicated UI checks cover potion flight appearing and ending, a stronger legacy source winning, and several GX sources producing one maximum. The four reserved sheet issues were not changed.
