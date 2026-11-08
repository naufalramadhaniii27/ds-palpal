# PDFX: engine export PDF character sheet

Status 2026-11-08: renderer dan adapter terpasang. Tombol Export PDF memakai PDFX. Export gambar lama (html2canvas + jsPDF) tetap sebagai cadangan, lalu dialog print.

## Susunan
| Lapis | File | Tugas |
|---|---|---|
| Renderer | `src/pdf/` (blok tertunda `pdfx`, dibundel esbuild) | Model cetak ke PDF. Tidak membaca state app, tidak menulis storage. Menerbitkan `window.PDFX`. Diperiksa penjaga SOLID repo |
| Aset | `vendor/pdf/pdfx-tpl-2014.pdf`, `vendor/pdf/pdfx-tpl-2024.pdf` | Template sheet. 2024 = template 2014 dengan label 2024. |
| Aset | `vendor/pdf/pdfx-map.json` | Posisi field per template + peta baris spell dan checkbox prepared. |
| Aset | `vendor/pdf/pdfx-Inter-*.ttf` | Inter Regular, Medium, SemiBold, Bold, Italic, dipotong ke Latin (sekitar 52 KB per gaya). |
| Pustaka | `vendor/pdf/cantoo-pdf-lib-2.11.1.min.js`, `vendor/pdf/pdf-lib-fontkit-1.1.1.min.js` | Dimuat saat tombol ditekan, disimpan service worker, lalu jalan offline. |
| Adapter | `src/app/37a-ui-pdf-model.js` | `pdfModel()`: C, S, D dan helper tampilan sheet ke model di bawah. Tidak menghitung ulang, tidak menulis apa pun. |
| Tombol | `src/app/37-ui-pdf-export-hold-slide-confirm.js` | `makeSheetPdf()` memuat pustaka dan aset, menunggu data tertunda (`__bldNeed`), lalu `PDFX.render`. Gagal: export gambar lama, lalu print. |

## API
```
PDFX.render(model, assets, { PDFLib, fontkit }) -> Promise<{ bytes, pages, overflow }>
```
`overflow` berisi nama kotak yang terpotong dan spell yang tidak muat di halaman 3. Isinya tetap lengkap di halaman lampiran.

## Markup teks
`**tebal**`, `_miring abu_`, `{{kecil abu}}`, `^^LABEL^^` (label kecil), baris diawali `# ` = judul bagian, string kosong = jarak.

## Susunan renderer (SOLID)
| File | Tanggung jawab |
|---|---|
| `pdf/00-env.js` | Satu-satunya pintu ke window |
| `pdf/01-data-style.js` | Warna, font, ukuran |
| `pdf/02-logic-markup.js` | Markup teks ke potongan bergaya |
| `pdf/03-logic-typeset.js` | Bungkus teks ke baris. Hanya butuh fungsi ukur, tidak kenal pdf-lib |
| `pdf/04-ui-canvas.js` | Satu-satunya file yang memanggil API gambar pdf-lib |
| `pdf/05-data-sheet-fields.js` | Peta field template sebagai data |
| `pdf/06-ui-fields.js` | Isi field dan kotak. Kotak yang tidak muat mengembalikan sisanya |
| `pdf/07-ui-sheet-pages.js` | Registry pengisi halaman 1 sampai 3 (`pxAddPainter`) |
| `pdf/08-ui-flow.js` | Aliran dua kolom halaman lampiran |
| `pdf/09-ui-blocks.js` | Jenis blok: spell, fitur, teks, creature, ringkasan IN SHORT |
| `pdf/10-ui-appendix.js` | Registry bagian lampiran (`pxAddPart`): sambungan sheet, spell, fitur, creature |
| `pdf/11-ui-render.js` | Orkestrator `renderPdf` |
| `pdf/main.js` | Menerbitkan `window.PDFX` |

Menambah bagian lampiran atau isi halaman baru = satu `pxAddPart` atau `pxAddPainter`, tanpa mengubah orkestrator.

## Skema model
```
edition: "2024" | "2014"
name, classLevel, background, species, alignment, xp
slot3: 2024 = subclass, 2014 = player name
abilities: { STR: ["20", "+5"], ... }
prof, inspiration, ac, initiative, speed ("30 ft"), passive
hpMax, hpCurrent, hpTemp, hitDiceTotal ("20d10"), hitDice ("20")
deathSaves: [sukses, gagal]
saves: [ { v: "+11", prof: true } x6 urut STR..CHA ]
skills: { "Animal Handling": { v: "+1", prof: false }, ... 18 skill }
weapons: [ [nama, bonus atau "DC 19", damage] ]   (lebih dari 3 pindah ke catatan)
attackNotes, proficiencies, equipment, features: [markup]
boxes: { topA, topB, topC, topD }   2024: species traits, feats, weapon mastery, defenses. 2014: personality, ideals, bonds, flaws
coins: { CP, SP, EP, GP, PP }
looks: { age, height, weight, eyes, skin, hair }, factionName
allies, backstory, moreFeatures, treasure: [markup]
spellcasting: null | {
  className, ability, dc, attack,
  slots: { "1": { total, used } ... },
  levels: [ { level, slots, spells: [ { name, tag, prepared, line, text: [markup], details: [[label, nilai]] } ] } ]
}
appendix: [ [judul grup, [ { name, tag, text: [markup] } ]] ]
creatures: [ { name, tag, meta, stats: [[label, nilai]], abilities: {STR: [skor, mod]}, lines: [[label, nilai]],
               sections: [[judul, [[nama, teks markup]]]] } ]
```

## Perilaku
- Field form dibuang, isi digambar langsung (flatten) supaya bisa memakai banyak gaya font. Template kosong tetap fillable.
- Karakter tanpa spell: halaman 3 dibuang.
- Kotak yang terlalu panjang: font turun sampai 6.2 pt. Kalau tetap tidak muat, paragraf yang tidak muat pindah utuh ke bagian "Continued from the Sheet" di awal lampiran. Tidak ada isi yang hilang.
- Spell melebihi baris template: baris terakhir level itu menjadi "+N more, see Spell Descriptions".
- Lampiran dua kolom: Spell Descriptions, Features & Traits, Companions & Summons. Bagian baru menyambung di kolom kosong. Judul diulang dengan "(CONTINUED)".

## Dua lapis deskripsi
Setiap fitur, spell, item, dan creature punya `summary` (satu baris, langsung dipahami) dan `text` (aturan lengkap). Sumber:

| Jenis | Ringkas | Lengkap |
|---|---|---|
| Fitur class, subclass, feat (2024) | teks di sheet (sudah berisi pilihan dan angka karakter) | `CF_FULL`, `SUB_FULL`, `FEAT_FULL` |
| Spell | `x.sum` | `x.full` |
| Fitur 2014, species, item, aturan homebrew | kalimat awal (otomatis, maks sekitar 170 huruf) | teks penuh |
| Creature | dibuat dari stat block: ukuran, tipe, AC, HP, speed, aksi utama dengan bonus dan damage | stat block |

Kalau teks aslinya sudah pendek (230 huruf atau kurang) dan tidak ada teks lengkap terpisah, hanya ringkasan yang tampil.

## Uji (browser)
```
python3 tests/pdfx_export.py [OUT]   # tombol Export PDF: Yudhi, Wizard Quick Build, Wizard 2014, dua viewport
python3 tests/pdfx_sweep.py [OUT]    # semua class x subclass x 6 level x 2 edisi, model dan PDF, deteksi miss otomatis
```
Hasil sapuan 2026-11-08: 540 karakter (2024: 12 class, 48 subclass. 2014: 12 class, 42 subclass, 33 race, 19 background dari PHB 2014 dan DMG 2014), 180 dirender penuh, 0 miss, 0 error, maksimal 21 halaman. Catatan aturan di luar PDF: Beast Master (2014) masih mendapat Primal Companion 2024 di sheet, lihat reports/requests.md.

## Uji (Node)
```
node test/run.js test/aldric-2024.json test/aldric-2014.json test/fighter.json test/wizard.json
```
Hasil 2026-11-08: Aldric 2024 9 halaman, Aldric 2014 7 halaman, Fighter 4 halaman, Wizard (73 spell, 2 creature) 13 halaman. Render 0,5 sampai 1,1 detik.

## Aturan integrasi (supaya tidak bentrok)
- Hanya file baru di app. Satu kait di tombol export yang memanggil adapter lalu `PDFX.render`.
- Tidak mengubah key localStorage atau bentuk data tersimpan.
- Kerja di branch sendiri, gabung ke main setelah tiga skenario wajib lolos.
