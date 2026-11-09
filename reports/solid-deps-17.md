# SOLID deps 17: kurangi pelanggaran guard deps

Cabang: claude/solid-deps-17. Deps sebelum 39, sesudah 2. Perilaku identik, hanya nama dan struktur impor.

## Penyebab
Guard deps membaca setiap pengenal yang namanya didefinisikan satu file saja. 37 dari 39 pelanggaran adalah bentrok nama, bukan pembacaan nyata. Contoh: `spCls` adalah variabel tab UI di builder/18 dan juga nama field data fx. Semua file data yang memakai field itu terhitung membaca UI.

## Perubahan per commit
| Commit | Isi | Deps |
|---|---|---|
| 1 | `spCls` (variabel tab builder/18) jadi `spClsTab`, dan setter `__set_spClsTab` di builder/22 | 39 ke 19 |
| 2 | Nama unik: `hint` jadi `bHint`, `featOpts` jadi `featOptsList`, `saveNotes` jadi `saveNoteRows`, `autoSpells` jadi `autoSpellList` (kunci query `autoSpells` tetap), `creatures` jadi `tgCreatures`, `live` jadi `tgSay`, `place` jadi `tgPlace` | 19 ke 7 |
| 3 | `abil` jadi `abilScores`, `card` jadi `stepCard` | 7 ke 4 |
| 4 | Kunci objek `sheet` diberi tanda kutip di builder/10a dan builder/25 | 4 ke 2 |

Baseline `tests/guard_baseline/guard_deps.json` turun dari 39 ke 2 entri.

## Sisa 2 pelanggaran
| Pembaca | Penyedia | Alasan tidak diubah |
|---|---|---|
| builder/09 | app/08b `MAN_SUM` | builder/09 dilarang disentuh, butuh desain terpisah |
| app/42 | app/35 `bldDot` | Port akhir tidak aman. 42 membungkus `bldDot` lewat `__set_bldDot`, port akan memanggil dirinya sendiri (rekursi). Catatan di app/00a menyebut kasus ini |

## Bukti
- `python3 tests/guard_all.py --enforce` hijau, exit 0.
- `node --check` semua file berubah, `python3 build.py` sukses.
- Snapshot 2997 build, tanpa error. Cabang ini dan origin/main memberi hash identik per build (total b7943d7416b159f2). Total f65fce1937133458 tidak muncul di lingkungan ini, juga tidak untuk origin/main. Snapshot penuh dalam satu halaman macet (Target crashed), jadi dijalankan dalam 6 pecahan dengan halaman baru.
