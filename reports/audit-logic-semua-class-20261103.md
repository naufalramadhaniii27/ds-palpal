# Audit logic semua class (2024 + tp/Valda) - 2026-11-03

Branch: claude/logic-audit-all (dasar origin/main build 115). Data Retromistika dan `hbpack-builtin-homebrew.js` tidak disentuh.

## Cara audit
- `tests/mech_scan.py`: memuat `index.html`, membaca data lewat hook baru `__bldData()`, memindai teks fitur class, subclass, species, feat, item. Fitur bermekanik (AC, HP, save, speed, Initiative, skill, resistance, uses, Fighting Style, pilihan) dicek: ada jalur data terstruktur, atau probe dinamis (sheet dengan dan tanpa fitur) menunjukkan angka berubah.
- `tests/golden_builds.py`: 12 class inti x level 1/5/10/20 (HP, PB, save) dengan rumus buku, ditambah build acuan di `tests/golden/builds/`.
- Sweep 29 class (inti, Artificer, tp) x level 1/5/10/20 = 116 build: HP dan PB cocok rumus, tanpa galat halaman.

## Temuan
| Kategori | Jumlah | Keterangan |
|---|---|---|
| Salah hitung (diperbaiki) | 3 | Warden Tower Shield tidak menambah AC, Steadfast Toughness tidak menambah HP, Defense tidak punya pilihan Fighting Style |
| Pilihan hilang (diperbaiki) | 13 | Warden: Sentinel's Stand, Stalwart Spirit save, Fighting Style. Fighting Style: Captain, Craftsman, Jaeger, Monster Hunter. Weapon Mastery: Captain, Dancer, Gadgeteer, Investigator, Jaeger, Martyr |
| Teks saja (diperbaiki lewat `fx`) | 8 | Dancer Fast Movement (speed), Warden Unyielding dan Improved Resolve (resistance), Monster Hunter Lair Sense, Summoner Shared Resilience, Warmage Tactical Insight (catatan di sheet) |
| Teks saja (belum, di baseline) | 419 | class 40 lebih, subclass 217, species 15, feat 59 lebih, item 111 lebih. Daftar lengkap di `tests/mech_baseline.json` |
| Sudah benar | 12 class inti x 4 level | HP, PB, save cocok. Pengecualian yang sah: Monk 14 (semua save), Rogue 15 (Slippery Mind), Paladin 6 (Aura of Protection), Sorcerer Draconic (+1 HP per level) |

Catatan: angka 419 dihitung pemindai (satu fitur bisa punya beberapa kategori). Sebagian besar kemungkinan false positive dari regex (misalnya teks "choose" yang ditangani builder inti, atau efek kondisional). Tiap baris perlu ditinjau satu per satu, lalu dipindah ke `by_design` dengan alasan atau diberi field `fx`.

## Evidence Warden (input B, hasil, harapan, sumber)
- Input: Warforged Warden 10 Godsworn, Adamantine Plate, Shield, Fighting Style Defense, Stand Tower Shield (scratchpad Bw2.json, sekarang `tests/golden/builds/warforged_warden10_tower.json`).
- Sebelum: AC 21, HP 94. Sesudah: AC 24, HP 94.
- AC: 18 (Plate) + 2 (Shield) + 2 (Tower Shield, bonus shield 4 pada level 10) + 1 (Defense) + 1 (Integrated Protection) = 24. Sumber: data class Warden di `src/data/tp03-tvss.js` (teks Tower Shield: shield +3, +4 pada level 10).
- Varian Steadfast Toughness: HP maks + CON mod (3) + level Warden (10) = 107, AC 22.

## Perubahan kode
- `classFx()` (11-logic-derivation.js): pembaca generik `CLASSES[x].fx`, memperhitungkan awalan multiclass.
- `pk()` mendukung `when:{key,val}` (pilihan muncul bila pilihan lain terpilih).
- Konsumen: 12 (AC `ac/acAb/acMin/shAc`, speed, init, save `saveFrom`), 14 (HP `hp:"con+lvl"`), 16 (defenses `def`).
- Hook baru `window.__bldData()` untuk tes.

## Data (diedit langsung)
Sumber JSON yang dipakai `tools/tp_build.py` tidak ada di repo, jadi `src/data/tp03-tvss.js`, `tp05-tghp.js`, `tp06-tsgeh.js`, `tp10-tssm.js`, `tp13-tsdm.js` diedit langsung. Jika sumber kembali, terapkan ulang field `fs`, `wm`, `pick`, `fx` di sana atau regenerasi akan menghapusnya.

## Belum dikerjakan
- Tinjauan 419 baris baseline satu per satu.
- Craftsman (Masterwork, Armor Enchantment), Martyr Armor of Faith (AC), Investigator Expertise, Barbarian Brutal Strike (pilihan), Feral Instinct, Ankylier Osteoderms (AC) dan species lain.
- Audit penuh DC mantra dan slot untuk class tp (sweep hanya mencakup HP, PB, galat halaman).
- Subclass 1 sampai 2 per class dan multiclass belum disapu otomatis.

## Pencegahan
- `tests/mech_scan.py` gagal bila fitur baru bermekanik tanpa jalur hitung dan tidak ada di baseline atau `by_design`.
- `tests/golden_builds.py` menjaga angka acuan. Keduanya ada di `.github/workflows/tests.yml`.
- Checklist "Menambah fitur baru" di `SOURCE-NOTES.md`.

## Tes
- `python3 build.py`, `--lint` (0 gagal), `tests/scenarios.py` (24 cek, 0 gagal, 390x844 dan 1250x850), `tests/golden_builds.py` (148 cek), `tests/mech_scan.py` (0 baru).
- `python3 build.py --check` lolos. CI penuh belum dijalankan di sesi ini.

## Pembaruan 2026-11-04: penutupan temuan dan upgrade mesin fx

Branch: claude/fx-all. Hasil triase 419 kandidat: 142 REAL, 240 situasional, 37 salah deteksi.

### Penutupan per batch
| Batch | File data | Hasil |
|---|---|---|
| A class dan species | `src/data/fx-A-class-species.js` | 13 dari 13 diperbaiki |
| B1 subclass | `src/data/fx-B1-subclass.js` | 24 dari 32 pada awalnya, sisanya ditutup di batch F dan G |
| B2 subclass | `src/data/fx-B2-subclass.js` | 23 dari 23 |
| C feat | `src/data/fx-C-feat.js` | 20 dari 21, sisanya di batch E |
| D item | `src/data/fx-D-item.js` | 53 ditangani |
| E feat | `src/data/fx-E-feat.js` | Hag, Ooze, Vampire Stage 1, Technical Mind Over Matter, Worthless (skor) |
| F subclass dan item | `src/data/fx-F-sub.js` | Aquatic Affinity, Resolute Hunter, Clockwork Lich, Exo-Frame Large, grafts dicatat sebagai pilihan |
| G mesin | `src/data/fx-G-engine.js` | Kasus toggle, pickLv, pilihan item, Masterwork |

Dua koreksi golden saat penggabungan: Armigers' Guild Tower Shield (Shield memberi +3 AC, teks VSS24) membuat golden Craftsman jadi AC 19 dan 21. Fighter Champion 10 memunculkan catatan Advantage Initiative (Remarkable Athlete) di daftar defenses empat golden item.

### Upgrade mesin (celah yang menyebabkan miss)
| Celah | Field | Kasus |
|---|---|---|
| Status sementara | `toggle:{id,label,default}`, `C.fxToggles`, `S.fxT` | Aberrant Horror, Specter, Vampire, Path of the Abomination |
| Pilihan per level | `pickLv`, `abUpPick` | Worthless: From the Ashes |
| Pilihan yang menambah item | pick `t:"item"` | Cybernetic Crafts, Mad Scientist |
| Aturan "bila sudah punya" | `resToImm`, `speedAddIf` | Specter, Hag Sea |
| Dadu tambahan | `atkDice` | Multiscale |
| Ganti stat serangan | `atkAb` | Mad Scientist (catatan), belum ada data yang mengubah angka |
| Pilihan teks bebas | pick `t:"text"` | Clockwork Lich |
| Masterwork | flag `mw` pada baris inventaris, cond `mwArmor` | Craftsman |

Dokumentasi field ada di `SOURCE-NOTES.md`.

### Belum tertangani
- Fitur dengan efek hanya teks karena bersyarat atau aktif: From the Ashes (kini punya pick, tapi catatan UI per level), bagian bersyarat Transformation, Contractor Backstabber, Resolution Quick Strike.
- Mad Scientist dan Cybernetic Crafts: stat serangan Intelligence hanya catatan, teks aturan bersyarat.
- Pilihan Fighting Style dari subclass (`fsPick`) dan efek bersyarat (`when`) belum diuji untuk multiclass.
- 215 situasional dan 36 salah deteksi dinilai dari teks, belum diaudit silang oleh pihak lain.
- Sumber `tp*.js` tidak punya JSON di repo. `tools/tp_build.py` akan menghapus edit di sana. Semua perbaikan ada di `fx-*.js`.
- Folder `books/` tidak ada di workspace ini. Angka dibaca dari data repo.

### Hasil tes (branch gabungan)
build, `--check`, `--lint` lolos. golden_builds 381 check. fx_engine 109 check. mech_scan 0 baru (257 gap diketahui, 21 by design). scenarios 24 check, 0 gagal di 390x844 dan 1250x850. `tests/e2e_fx_toggle.py` lolos.

### Pengaman agar kasus seperti Warden tidak terulang
1. Efek fitur ditulis sebagai data `fx` dan dihitung satu mesin.
2. `tests/mech_scan.py` gagal bila ada gap baru di luar baseline.
3. Setiap perbaikan wajib punya golden di `tests/golden/builds/`.
4. `.github/workflows/tests.yml` menjalankan semua tes di setiap push.
