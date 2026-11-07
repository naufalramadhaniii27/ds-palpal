# SOLID tahap 8: src/builder dan src/fx

Cakupan: `src/builder/*` dan `src/fx/*`. `src/app` dan `src/data` tidak disentuh. Syarat: perilaku identik. Alat bukti: `tests/solid_snapshot.py`, `tests/solid_ui_snapshot.py`, `golden_builds`, `fx_engine`, `solid_contract`, `solid_ui_contract`.

## 1. Pengukuran (origin/main 5b0a3a01)

| Guard | Sebelum | Sesudah |
|---|---|---|
| guard_window (D), seluruh repo | 1446 pemakaian | 911 |
| window di builder (di luar env) | 308 acuan `window.NAMA` | 0 |
| window di fx (di luar env) | 262 acuan `window.NAMA` | 1 (`fx/23-class-art-data.js`, lihat bagian 5) |
| guard_deps (D, I) | 146 back-edge | 137 |
| guard_size (S) | 252 di atas anggaran | 247 |
| guard_dup (DRY) | 1 blok | 0 |
| guard_dispatch (O) | 1 | 1 (tidak berubah) |

## 2. Yang dikerjakan

### 2.1 D: modul env

| Tempat | Cara | Catatan |
|---|---|---|
| `builder/00-env.js` | `genv`: 139 nama, getter membaca `window[n]` saat dipakai, setter menulis. 3 metode browser (`fetch`, `matchMedia`, `scrollTo`) dikembalikan terikat ke `window` | Penulisan ulang dengan parser acorn, hanya ekspresi `window.NAMA` di luar string dan komentar |
| `fx/00-fx-env.js` (baru) | `FXENV`, skrip klasik, file pertama di blok fx. 65 nama. Kelas dan objek browser (`IntersectionObserver`, `CSS`, `crypto`) kembali apa adanya, metode (`addEventListener`, `matchMedia`, `requestAnimationFrame`, `requestIdleCallback`) terikat | `FXENV.X=` dikenali `tools/lint_names.js` sebagai deklarasi (dulu `window.X=`) |

`this` dari fungsi hook yang dipanggil lewat env adalah `genv` atau `FXENV`, bukan `window`. Tidak ada hook yang memakai `this` (bukti: snapshot dan tes).

### 2.2 I dan D: sisa `__R` yang dibaca file lain

14 nama keluar dari `__R`: MCL, TL, baseOf, itemW, slotsAll, ensureInv, miFeats, spOptFx, fxCh, fxv, gfx, gxPicks, itemType, enabledPacks.

| Pembaca | Cara |
|---|---|
| File lebih akhir dari pemilik (gxPicks di 13 dan 14, gfx di 12 sampai 18, fxv di 14, 16, 18) | impor langsung dari pemilik |
| File lebih awal dari pemilik (03, 09, 10, 11, 12) | port akhir di `builder/01b-logic-late-ports.js`: satu export bernama per fungsi, daftar nama tertutup, pemilik memanggil `bindLate({...})` sekali, nama ganda atau nama tak dikenal melempar error |

Port: MCL, TL, baseOf, ensureInv, itemW, slotsAll, syncPickItems, hpCalc, effArmor, effShield, effWeps (pemilik 14), enabledPacks, miFeats, spOptFx, subGrant, packSkills (pemilik 13), fxList, fxListBase, fxCh, fxVal (pemilik 11), itemType (pemilik 20). Sisa entri `__R` lain (clsLv, B, SMAP, render, dan seterusnya, 49 nama) tetap, lihat bagian 5.

### 2.3 Irisan masukan `sheetInputs()`

`sheetInputs()` di `12-logic-export-to-sheet.js` tidak memakai `QRY.*` lagi. 11 pembacaan (`syncPickItems`, `TL`, `hpCalc`, `subGrant`, `effArmor`, `effShield`, `effWeps`, `baseOf`, `MCL`, `spOptFx`, `packSkills`) lewat port. Urutan pembacaan sama dengan kode lama. `QRY` tinggal sebagai `ctx.q` untuk handler (kontraknya tahap 5, tidak berubah).

### 2.4 `gfx()` ke accessor sempit

`gfx(noItem)` punya argumen bendera. Pemanggil luar (12, 13, 14, 16, 18, 09, 10, 03, 25) kini memakai `fxList()` (dengan entri item) atau `fxListBase()` (tanpa item). `gfx` tidak diekspor lagi dari `11-logic-derivation.js`. API publik `window.__fxRegistry().gfx(noItem)` tetap (dipakai tes) dan memilih salah satu dari dua accessor.

### 2.5 DRY

Blok 12 baris ganda di `fx/16` dan `fx/18` (nf, rm, vis, esc, fx, ls, st) pindah ke `fx/00b-fx-shared.js` sebagai `FXH`. Kedua paket mengambil dengan satu `const {...}=FXH`. guard_dup: 1 menjadi 0.

### 2.6 S: pemecahan

| Fungsi | Sebelum (baris, cabang) | Sesudah |
|---|---|---|
| `fx/27-blend-sheet.js` IIFE tunggal | 67, 126 | 11 closure kecil di satu file, berbagi `BLEND.K`. Semuanya di bawah anggaran (maks 20 cabang, 60 baris). `__blendSheet` dan `sceneOf` ikut keluar dari daftar |
| `spTraitText` (09) | 15, 83 | 6 fungsi kecil, di bawah anggaran |
| `gxPicks` (09) | 9, 73 | 8 fungsi kecil (`gxEntryPicks`, `gxPickBase`, `gxPickFrom`, `gxCantripClasses`, `gxSpellFilterA/B`, `gxCantripList`, `gxWeaponList`, `gxPickRow`), di bawah anggaran |

File `09` tetap 352 baris (baseline 354), tidak naik.

## 3. Bukti

| Tes | Sebelum (origin/main) | Sesudah |
|---|---|---|
| solid_snapshot penuh | a893fba7ab867bb0, 2997 build | a893fba7ab867bb0, 2997 build, 0 error halaman |
| solid_snapshot --golden | 76cc2943d6bf0384, 777 build | 76cc2943d6bf0384 |
| solid_ui_snapshot | 18c6e679b5a4fc47, 280 langkah | 18c6e679b5a4fc47 identik |
| golden_builds, fx_engine | 1479, 265 | 1479, 265 |
| solid_contract, solid_ui_contract | lulus | 4767 cek lulus, 231 cek lulus |
| invariants | lulus | 2220 build, 0 pelanggaran |
| scenarios | lulus | 24 cek, 0 gagal |
| perf_budget (--fast --runs 3) | dalam anggaran | budget ok, heap raw 34,44 MB (batas 35) |
| e2e_fx_toggle, csp_check, lazy_parts, names_lint | lulus | lulus (lazy_parts skor 97) |
| split_dist | gagal sesekali (`__bldPendList` hanya di versi pecah, pernah terjadi di origin/main juga) | lulus pada ulangan, gagal sekali pada run pertama dengan pesan yang sama dan satu keterlambatan 720 ms di 390 |

Catatan: satu run penuh solid_ui_snapshot saat mesin dibebani proses lain memberi 7 langkah berbeda (scenario B, 1250, overlay). Ulangan scenario B tanpa beban identik dengan origin/main, dan ulangan penuh sendirian identik (18c6e679b5a4fc47). Penyebabnya waktu, bukan isi.

## 4. Hal yang diputuskan

| Pilihan | Alasan |
|---|---|
| Nama env `genv` dan `FXENV`, bukan `env` | `env` dipakai sebagai nama parameter di `10a` dan `10d` (aturan nilai), menimbulkan bayangan |
| Port akhir sebagai modul sendiri, bukan `QRY` | `QRY` adalah kantong terbuka untuk handler `toSheet()`. Port ini daftar tertutup, bernama, terlihat di baris impor |
| `FXENV` berupa `const` di blok fx | Semua file fx satu blok `<script>` yang dijalankan sekali oleh gate, jadi `const` tingkat blok terlihat semua file sesudahnya |

## 5. Ditunda

| Butir | Alasan |
|---|---|
| `fx/23-class-art-data.js` (1 acuan window) | Dimuat sebelum bundel app (di luar blok fx), `FXENV` belum ada saat jalan. Perlu menggeser urutan muat, di luar tugas ini |
| Sisa `__R` (clsLv, B, SMAP, render, spLists, dan lain-lain, 49 nama) | Tidak ada di daftar tugas. Pola port akhir bisa dipakai untuk tahap berikutnya |
| Fungsi besar lain di guard_size builder dan fx (sekitar 100) | Hampir semuanya satu baris padat dengan 30 sampai 300 cabang (`fromSheet` 309, `__bldNorm` 313, `choices` 113, `renderClass` 83) atau IIFE seluruh paket fx (`fx/02` 127, `fx/18` 235, `fx/16` 361 cabang). Memecahnya tanpa mengubah perilaku butuh peninjauan satu per satu. Dikerjakan hanya yang disebut tugas (fx/27) dan dua fungsi builder yang terbukti identik lewat golden |
| Lapisan: `data/fx-*.js` membaca nama port | Tidak ada, guard_deps tidak mencatat edge baru |
