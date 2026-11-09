# SOLID tahap 16: pecahan fungsi src/builder (guard_size builder 60 fungsi ke 0)

Basis: origin/main 3c960c85. Cabang claude/solid-s16. Hanya `src/builder` (17 file) dan baseline guard yang berubah, plus `index.html` dan `sw.js` hasil build. Tidak ada file baru, tidak ada entri manifest baru, kunci localStorage dan bentuk data tidak berubah.

## Cara pecah

Pola sama dengan tahap 14 dan 15: tiap fungsi besar dipecah jadi fungsi kecil bernama di file yang sama (deklarasi fungsi tingkat modul, jadi hoisting membuat posisi tidak berpengaruh).

| Pola | Dipakai di |
|---|---|
| Penutup (closure) tanpa variabel lokal dipindah ke tingkat modul | `bnOn`, `bnNames`, `sbTag`, `qbSpAll`, `krMine`, `mlIsWep`, `bpItems`, `qbPickFill`, `rhRow` |
| Variabel lokal yang dibaca dijadikan parameter dengan nama sama, jadi teks badan tidak berubah | hampir semua, mis. `cnTA(L,c,m,dc,rv,pb)` |
| Langkah berurutan jadi satu panggilan per langkah, urutan sama | `fromSheet`, `__bldNorm`, `autoSpells`, `cls14Tabs` |
| HTML: `let h="";` di helper lalu `h+=helper()` di pemanggil (gabung string asosiatif) | `renderClass`, `renderHome`, `renderSpecies`, `renderSpells`, `itemDetail` |
| Pulang awal: helper mengembalikan `true`/`null` sebagai tanda, pemanggil `return` di titik yang sama | `bnLevel`, `boSheet`, `hbsStop`, `srXl`, `xdLv`, `spOneCls` |
| Tabel aturan (registry) untuk rantai `if(x==="...")` yang saling lepas | `qbPick` (per `c.t`), `dbItems0` (per kategori), keduanya dengan `hasOwnProperty` agar nama prototipe tidak cocok |
| `builder/09`: helper ditulis di baris yang sudah ada | 12 fungsi, jumlah baris file turun 312 ke 308 |

Satu nama helper diganti sesudah guard_deps menemukan sisi palsu baru: `spAuto` (sama dengan kunci objek `spAuto:` di builder/25) menjadi `spAlways`.

## Guard

| Guard | Sebelum | Sesudah |
|---|---|---|
| guard_size total | 61 (1 file, 60 fungsi) | 1 (1 file, 0 fungsi) |
| guard_size fungsi di src/builder | 60 | 0 (cabang terbesar di builder sekarang 20) |
| guard_size file builder/09 | 312 baris | 308 baris (masih di atas 300) |
| guard_dispatch | 1 | 0 (`abil`: pembanding `k==="STR"` pindah ke `abTotal` di luar wilayah ORCH) |
| guard_deps | 39 | 39 |
| guard_dup | 0 | 0 |
| guard_window | 0 | 0 |
| tsc_gate | 217 galat, tidak ada file lebih buruk | 203 galat, tidak ada file lebih buruk |
| html_gate | 250 situs | 250 situs |

Baseline guard_size dan guard_dispatch diperbarui (hanya turun). Baseline lain tidak disentuh.

## Bukti

Batch: B1 (builder/23, 25: 7 fungsi), B2 (15, 16, 14: 6), B3 (19: 6), B4 (18, 20, 24: 7), B5 (21, 22, 17: 10), B6 (10, 13, 11, 08: 12), B7 (09: 12). Tiap batch: `node --input-type=module --check` per file, build, guard_all `--enforce`, tsc_gate, html_gate, dan dua cek statis (di bawah). Daftar tes browser penuh dijalankan pada B1 (salinan pohon sesudah B1) dan B7 (pohon akhir, kumulatif B1 sampai B7). B2 sampai B6 tidak dijalankan terpisah di browser karena satu run penuh sekitar 70 menit di mesin 2 CPU. Pohon akhir memuat semua batch, jadi hasil B7 berlaku untuk semuanya.

Cek statis per file (base origin/main lawan sesudah, alat di luar repo, berbasis eslint/espree yang sudah ada di tools/build):
- nama bebas (no-undef tanpa global): tidak ada nama bebas baru di 17 file. Helper tidak membaca variabel lokal yang lupa dijadikan parameter.
- bayangan: tidak ada fungsi yang sekarang membaca nama tingkat modul atau global yang dulu berupa variabel lokal (menangkap parameter hilang yang kebetulan sama nama dengan nama modul).

| Bukti | B1 | B7 (akhir) |
|---|---|---|
| solid_snapshot 2997 build | a893fba7ab867bb0, 0 galat, IDENTICAL | a893fba7ab867bb0, 0 galat, IDENTICAL |
| solid_builder_diff 3890 input lawan origin/main | a0bc6aefaeb4f3d9, IDENTICAL | a0bc6aefaeb4f3d9, IDENTICAL |
| golden_builds | 1479 OK | 1479 OK |
| fx_engine | 265 OK | 265 OK |
| solid_contract | 4766 OK | 4766 OK |
| solid_data_contract | 560, 0 gagal | 560, 0 gagal |
| solid_ui_contract | 308, 0 gagal | 308, 0 gagal |
| invariants | 2220 build, 0 pelanggaran | 2220 build, 0 pelanggaran |
| scenarios | 24, 0 gagal | 24, 0 gagal |
| csp_check, names_lint, version_label, e2e_fx_toggle | lulus | lulus |
| solid_ui_snapshot A (satu per satu, lawan main) | ae5d16aae548610d IDENTICAL | ae5d16aae548610d IDENTICAL |
| solid_ui_snapshot B | 692c6ce2c139fa64 IDENTICAL | 692c6ce2c139fa64 IDENTICAL |
| solid_ui_snapshot C | 9747903abd783869 IDENTICAL | 9747903abd783869 IDENTICAL |
| guard_all --enforce | exit 0 | exit 0, 0 baru |
| tsc_gate | tidak ada file lebih buruk | tidak ada file lebih buruk (203) |
| html_gate | 250 | 250 |

Hash UI per skenario dibandingkan dengan main yang direkam per skenario di mesin ini (A, B, C terpisah). Hash gabungan 18c6e679b5a4fc47 tidak dipakai karena run gabungan tidak dijalankan sesuai aturan.

solid_ui_snapshot memotret UI sheet, bukan langkah builder. Karena 25 dari 60 fungsi adalah render builder, dibuat alat tambahan di luar repo (`bldui.py`): untuk tiap golden build ketiga (259 build) pasang build lewat `__bldTestSet`, render tiap langkah lewat `__bldTestGo` (home, class, bg, species, abil, equip, next), buka empat kartu pertama, tab Spells dan tiga kartu spell pertama, lalu hash HTML `#body` dan `#steps`; ditambah 100 kartu `showRef` spell dan 8 feat. Dua run base identik (deterministik).

| Builder UI (bldui.py, 259 build, 3730 kunci) | Hasil |
|---|---|
| base origin/main | 9f4e1aba80c2ae59, 0 galat halaman |
| sesudah (B7) | 9f4e1aba80c2ae59, 0 galat halaman, IDENTICAL |

Satu kunci berisi galat yang sama di base dan sesudah: build no. 85 (urutan ketiga), langkah Class, `TypeError: Cannot read properties of undefined (reading 'map')`. Ini bug yang sudah ada di main, bukan dari tahap ini, dan tidak diperbaiki di sini (perilaku harus sama). Perlu dicek di tahap lain.

## Fungsi yang dipecah (60 dari 60)

| File | Fungsi | Sebelum (baris / cabang) | Sesudah (baris / cabang) |
|---|---|---|---|
| 08 | cls14Apply | 18 / 46 | 5 / 4 |
| 08 | cls14Tabs | 23 / 56 | 9 / 2 |
| 09 | (anon) | 10 / 35 | 7 / 12 |
| 09 | allFeats | 4 / 23 | 4 / 15 |
| 09 | dm14Set | 13 / 24 | 6 / 8 |
| 09 | eq14Set | 22 / 32 | 4 / 9 |
| 09 | featViol | 10 / 26 | 3 / 0 |
| 09 | hbSpellPicks | 5 / 21 | 1 / 1 |
| 09 | sp14Set | 17 / 30 | 3 / 4 |
| 09 | spFxTo | 9 / 35 | 6 / 13 |
| 09 | wxAb | 7 / 21 | 5 / 13 |
| 09 | wxGate | 4 / 30 | 3 / 5 |
| 09 | wxList | 4 / 22 | 2 / 4 |
| 09 | wxPicks | 5 / 21 | 4 / 11 |
| 10 | invPicks | 5 / 21 | 5 / 11 |
| 10 | isDone | 7 / 30 | 7 / 16 |
| 10 | pk | 8 / 26 | 7 / 16 |
| 10 | saveNotes | 6 / 25 | 6 / 4 |
| 10 | xdmgRows | 12 / 31 | 3 / 1 |
| 11 | abil | 20 / 31 | 16 / 4 |
| 11 | keepResKeys | 9 / 25 | 7 / 9 |
| 11 | manualLost | 8 / 30 | 4 / 3 |
| 11 | spellAb | 7 / 27 | 4 / 8 |
| 13 | autoSpells | 16 / 47 | 11 / 0 |
| 14 | baseOf | 1 / 21 | 1 / 10 |
| 14 | dbItems0 | 10 / 28 | 3 / 1 |
| 14 | mcChoices | 16 / 45 | 3 / 0 |
| 14 | syncPickItems | 5 / 30 | 4 / 3 |
| 15 | fromSheet | 46 / 121 | 29 / 5 |
| 16 | calcNote | 40 / 42 | 5 / 13 |
| 17 | armorAt | 4 / 23 | 4 / 10 |
| 17 | chips | 3 / 26 | 2 / 7 |
| 17 | preFail | 14 / 33 | 8 / 6 |
| 17 | showRef | 4 / 28 | 4 / 8 |
| 18 | renderSpells | 31 / 76 | 23 / 20 |
| 18 | spInfoOne | 6 / 28 | 5 / 8 |
| 18 | spRow | 7 / 28 | 7 / 8 |
| 18 | spellCounts | 9 / 33 | 6 / 3 |
| 19 | mcBlock | 12 / 24 | 10 / 7 |
| 19 | renderBg | 15 / 37 | 7 / 2 |
| 19 | renderClass | 45 / 83 | 16 / 3 |
| 19 | renderHome | 15 / 50 | 8 / 3 |
| 19 | renderSpecies | 22 / 77 | 11 / 3 |
| 19 | srcLists | 12 / 51 | 10 / 10 |
| 20 | itemDetail | 9 / 66 | 6 / 8 |
| 20 | renderNext | 17 / 21 | 17 / 17 |
| 21 | hbForm | 10 / 25 | 8 / 6 |
| 21 | hbSave | 10 / 33 | 8 / 7 |
| 21 | qbPick | 14 / 61 | 4 / 2 |
| 21 | qbSpells | 7 / 30 | 6 / 3 |
| 22 | (anon) | 21 / 37 | 12 / 19 |
| 22 | render | 16 / 51 | 9 / 2 |
| 23 | __bldCheck | 17 / 58 | 7 / 2 |
| 23 | __bldNorm | 56 / 82 | 35 / 10 |
| 23 | __bldOpen | 15 / 27 | 4 / 8 |
| 23 | __bldSheetBatch | 9 / 22 | 8 / 10 |
| 23 | qbSpMC | 8 / 30 | 4 / 1 |
| 24 | bDeco | 13 / 38 | 2 / 2 |
| 25 | __bldArmor | 10 / 23 | 6 / 10 |
| 25 | __bldDiff | 1 / 22 | 1 / 5 |

## Yang dilewati

| Hal | Alasan |
|---|---|
| Pemecahan file builder/09 (308 baris, masih di atas 300) | Tetap ditunda. Potongan file butuh impor melingkar atau port baru (lihat tahap 14). Di tahap ini hanya fungsinya yang dipecah, helper ditulis di baris yang sudah ada sehingga file tidak bertambah baris |
| Bug build no. 85 langkah Class | Ada di main juga. Tahap ini harus identik |
| Run browser penuh untuk B2 sampai B6 secara terpisah | Waktu. Dicakup run kumulatif B7 dan cek statis per batch |

Tidak ada fungsi yang gagal dibuktikan identik.
