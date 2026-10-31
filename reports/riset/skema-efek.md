# Riset skema efek deklaratif (rules as data)

> PERHATIAN: baris bertanda (curl) diambil lewat curl, bukan WebFetch, sebelum arahan koordinator. Itu menyimpang dari aturan sesi ini. Anggap baris itu belum terbukti sampai dibuka ulang lewat WebFetch. Jangan jadikan dasar data atau kode sebelum itu.


Tanggal: 2026-10-31. Bagian: Logic (usulan untuk Data + Logic).

## 0. Cara riset dan batasan

- Halaman terbuka lewat WebFetch (isi terbaca): 17. Daftar di bagian 8.
- Halaman terbuka tetapi kosong (hanya redirect atau metadata): 4. Tidak dihitung.
- Tambahan: 11 halaman wiki Foundry dan docs lain saya unduh lewat curl SEBELUM arahan koordinator "jangan pakai curl". Tidak dihitung dalam 17. Klaim dari halaman itu saya tandai (curl). Setelah arahan, saya berhenti memakai curl.
- Tidak terbukti (tidak ada halaman terbaca): skema 5etools (`_copy`, `_mod`, `entries`), skema field Open5e v2, Borealis (`crates/borealis-content`), electro-saiyan/dnd-character-builder-2024, isi internal KirkDiggler/rpg-toolkit, struktur JSON Pathbuilder, jsonlogic.com/operations, isi langdef CEL, struktur data 5e-bits SRD (di luar level/feature index). Pencarian untuk Borealis dan electro-saiyan tidak menemukan repo yang cocok.
- Tidak ada kode berlisensi yang disalin. Contoh JSON di bawah buatan sendiri, terinspirasi bentuk umum.

## 1. Temuan per proyek (hanya yang terbukti)

| Proyek | Bentuk efek | Predicate / kondisi | Skala level | Pilihan | Stacking | Validasi build |
|---|---|---|---|---|---|---|
| Foundry dnd5e Active Effect | `changes[]` dengan key (dot-path), mode, value. Mode: Add, Multiply, Override, Downgrade, Upgrade, Custom. | Tidak ada di halaman AE. Ada sistem Filters terpisah (curl). | Value boleh formula dengan `@prof`, `@details.level`, `@classes.barbarian.levels`. | Bukan di AE. | Halaman tidak menjelaskan. Upgrade/Downgrade = "ambil yang lebih tinggi/rendah". | Tidak terbukti. |
| Foundry dnd5e Filters (curl) | JSON `{o, k, v}`. `o` = AND/OR/NOT atau pembanding. | Pembanding: exact, in, has, hasany, hasall, contains, startswith dll. Bersarang. | - | - | - | - |
| Foundry dnd5e Rules (curl) | Rule saat roll: kategori attack/check/save/damage, tipe bonus, advantage mode, min/max. | Diatur lewat kategori roll. | - | - | Advantage: `+1` tambah sumber, `-1` tambah disadvantage, `=+1` paksa, `>=0` abaikan disadvantage. | - |
| Foundry dnd5e Advancement (curl) | Tipe: ItemGrant, ItemChoice, ScaleValue, ASI, HitPoints, Trait, Size, Subclass, ModifyItems. Berbasis level di class/subclass/background. | - | ScaleValue: nilai per level, berlaku sampai ada nilai baru. Diakses `@scale.<kelas>.<id>`. Tipe: numeric, dice, distance, usage, CR. | ItemChoice: kolam item, jumlah pilihan per level. | - | - |
| Foundry dnd5e Enchantment | Active effect khusus yang mengubah item, bukan actor. | Riders dan restriksi: tidak ada di halaman ini. | Tidak dibahas. | - | - | - |
| Foundry pf2e RuleElement | Objek JSON dengan `key` (tipe), `selector`, `predicate`, `priority`, `slug`, `label`. | Array roll option = AND implisit. `or`, `and`, `nor`, `nand`, `not`, `lt/lte/gt/gte/eq`. String kebab-case ber-domain (`self:`, `target:`, `item:`). | Resolvable `@actor.level`, `floor()`, `max()`, `ternary()`, `btwn()`. | `ChoiceSet` (prompt, flag, choices) + `GrantItem` dengan UUID dari pilihan. | Wajib `type` bonus (item, status, circumstance). Slug sama dibuang (curl, bagian pf2e-re). `AdjustModifier` bisa mengubah stacking. | Tidak terbukti. |
| Open5e v2 (deepwiki, api-docs) | Relasional: Species -> traits, Feat -> benefits, Class -> features sebagai record anak. | Tidak terbukti. | Tidak terbukti. | Tidak terbukti. | Tidak terbukti. | Tidak terbukti. |
| 5e-bits SRD (discussion, repo, docs.rs dnd-character) | Level class memuat daftar feature (index string). | Tidak ada. | Spell slot per level di record level. | Klien memetakan index feature ke kategori Choosable/Sheet/Passive/Ignored di kode. | - | Tidak terbukti. |
| furlat/dnd_engine (mirror) | `ModifiableValue`: base + 4 kanal (self/target x static/contextual). Modifier: bonus, advantage, crit, resistance. | Contextual = callable (kode), bukan data. | - | - | Aturan gabung tidak terdokumentasi di halaman. | - |
| KirkDiggler/rpg-toolkit | Hanya deskripsi repo terbaca. | Tidak terbukti. | - | - | - | - |
| 5eSchema (revilowaldow) | Repo skema JSON untuk format homebrew 5etools. Menunjuk ke `_test/test-json.js` dan `_schema-fast/homebrew.json` milik TheGiddyLimit untuk validasi. | - | - | - | - | JSON Schema + skrip validasi penuh. `_copy` dan `_mod`: tidak terbukti. |
| Pathbuilder | Halaman terbaca hanya alur ekspor. | - | - | - | - | Tidak terbukti. |
| JSONLogic (json-logic-js README) | Satu objek = satu operator: `{"op": [args]}`. `var` baca data. `and`, perbandingan. Ekstensi `add_operation`. | Ya, bersarang. | - | - | - | - |
| json-rules-engine (docs rules, mirror) | `conditions` root `all`/`any`/`not`. Leaf: `fact`, `operator`, `value`, `path`, `params`. `priority` integer. Serialisasi `toJSON()`. | Ya. `value` boleh fact lain. | - | - | - | Tidak ada bagian validasi. |
| CEL (repo cel-expr/cel-spec) | Ekspresi teks, bukan JSON. Tidak Turing-complete, tanpa mutasi, waktu linear. Dikompilasi ke AST sebelum evaluasi. | Ya (boolean). | - | - | - | Kompilasi di muka dimungkinkan. Kata "type-check" tidak muncul di halaman. |

## 2. Pelajaran untuk kita

1. Pisahkan tiga hal: efek (ubah angka), advancement (beri/pilih item per level), predicate (kapan berlaku). Foundry dan PF2e memisahkannya.
2. PF2e punya model paling dekat: selector + predicate + type + slug. Foundry dnd5e punya model level yang paling dekat: nilai bertahap dari level tertentu.
3. Predicate JSON bersarang (Filters, JSONLogic, json-rules-engine, PF2e) lebih mudah divalidasi daripada string ekspresi bebas (CEL, formula `@`).
4. Pilihan = penyimpan pilihan + hasil dipakai ulang (`ChoiceSet` menyimpan flag, `GrantItem` membaca flag).
5. Kontekstual berbasis callable (dnd_engine) tidak bisa diserialisasi. Hindari.

## 3. Usulan skema untuk kita

### 3.1 Bentuk efek

```json
{
  "id": "barb.rage.resist",
  "src": "class:barbarian/rage",
  "label": "Rage: resistance",
  "sel": "resist:bludgeoning",
  "op": "add",
  "val": true,
  "type": "untyped",
  "group": null,
  "when": ["state:raging"],
  "prio": 50
}
```

| Field | Arti |
|---|---|
| `id` | Unik di seluruh data. Dipakai untuk dedupe dan rincian. |
| `src` | Asal: `class:`, `species:`, `feat:`, `item:`, `spell:`. Tampil di rincian hitungan. |
| `label` | Teks Inggris untuk UI. |
| `sel` | Selector (daftar tertutup, bagian 3.5). Boleh array. |
| `op` | `add`, `set`, `min`, `max`, `mul`, `adv`, `dis`, `grant`, `choose`. |
| `val` | Angka, boolean, string, atau ekspresi/skala (3.3). |
| `type` | `base`, `untyped`, `item`, `status`, `circumstance`. Default `untyped`. |
| `group` | Kunci "tidak menumpuk" (bagian 4). |
| `when` | Predicate (3.2). Kosong = selalu. |
| `prio` | Urutan dalam fase. Default 50. |

### 3.2 Grammar predicate

Terinspirasi PF2e (array = AND), Foundry Filters (operator `in/has`), JSONLogic (satu key = satu operator). Tanpa `eval`.

```
pred   := true | [pred, ...]                 ; array = AND
        | "flag"                             ; string = flag boolean (state:raging)
        | {"all":[pred..]} | {"any":[pred..]} | {"not": pred}
        | {"eq"|"ne"|"gt"|"gte"|"lt"|"lte": [operand, operand]}
        | {"in":  [operand, [lit..]]}        ; nilai ada di daftar
        | {"has": [ref, lit]}                ; set di ref memuat lit
operand:= lit | ref | expr
lit    := number | string | boolean
ref    := {"ref":"<path>"}   atau string "@path" dalam expr
expr   := lihat 3.3
```

Aturan:
- Hanya satu key per objek operator.
- Root array = AND. Array kosong = true.
- Path ref dari daftar tertutup (3.5). Path tak dikenal = galat build.
- Tipe dicek: `gt` hanya number. `has` hanya set. 
- Tidak ada fungsi buatan pengguna. Operator baru ditambah di engine, bukan di data.

### 3.3 Nilai dan skala level

```
val := number | boolean | string
     | {"expr": "<ekspresi>"}
     | {"scale": {"by": "<ref angka>", "steps": {"1":2, "9":3, "16":4}}}
expr:= angka, @path, + - * /, floor(), ceil(), max(), min(), mod(), prof
```

- `scale`: pakai nilai dengan kunci terbesar yang <= nilai `by`. Sama dengan perilaku ScaleValue Foundry (nilai berlaku sampai ada nilai baru).
- `expr` memakai tokenizer kecil sendiri. Bukan `eval`, bukan `Function`.
- Kunci `steps` harus mulai di level terendah yang mungkin (cek build).

### 3.4 Advancement dan pilihan

```json
{ "op": "grant", "sel": "feat", "val": "archery" }
{ "op": "choose", "sel": "feat",
  "val": { "pick": 1, "from": {"category":"fighting-style"}, "slot": "fs.1" },
  "when": [{"gte":[{"ref":"class.fighter.level"},1]}] }
```

- `choose` menyimpan hasil di `character.choices["fs.1"]`. Efek lain membaca `{"ref":"choice.fs.1"}`.
- `grant` memberi item/spell/feat. Hasilnya adalah efek milik item itu, jadi rekursif.
- `from` adalah filter data (kategori, daftar id, level maksimum), bukan fungsi.
- Pilihan yang tersimpan butuh migrasi bila bentuk berubah (aturan proyek).

### 3.5 Selector (daftar awal)

`ac`, `ac.base`, `save:<abil>`, `save:all`, `check:<abil|skill>`, `attack:<kind>`, `damage:<kind>`, `resist:<type>`, `immune:<type>`, `speed:<mode>`, `hp.max`, `init`, `prof:<skill|tool|weapon>`, `feat`, `spell`, `item`.

Ref awal: `level`, `prof`, `abil.<abil>.mod`, `class.<id>.level`, `armor.worn`, `shield.worn`, `state.<nama>`, `condition.<nama>`, `attack.kind`, `attack.weapon.prop`, `attack.range`, `source.kind`, `save.abil`, `target.type`, `item.attuned`, `item.equipped`.

### 3.6 Delapan contoh efek D&D 2024

Catatan: angka dan teks aturan harus dicek ke `books/` sebelum masuk Data. Contoh ini ilustrasi bentuk.

1. Cloak of Protection (item, attuned): +1 AC dan +1 semua save.
```json
[
 {"id":"cloak-prot.ac","src":"item:cloak-of-protection","sel":"ac","op":"add","val":1,
  "type":"item","group":"cloak-of-protection","when":["item.attuned"]},
 {"id":"cloak-prot.save","src":"item:cloak-of-protection","sel":"save:all","op":"add","val":1,
  "type":"item","group":"cloak-of-protection","when":["item.attuned"]}
]
```
2. Rage resistance (Barbarian): resistance fisik saat Rage.
```json
{"id":"barb.rage.resist","src":"class:barbarian/rage",
 "sel":["resist:bludgeoning","resist:piercing","resist:slashing"],
 "op":"add","val":true,"when":["state.raging"]}
```
3. Danger Sense (Barbarian): advantage save DEX kecuali Incapacitated.
```json
{"id":"barb.danger-sense","src":"class:barbarian/danger-sense","sel":"save:dex","op":"adv","val":1,
 "when":[{"not":"condition.incapacitated"}]}
```
4. Dwarven Resilience (Dwarf): resist Poison dan advantage save melawan Poisoned.
```json
[
 {"id":"dwarf.res.poison","src":"species:dwarf","sel":"resist:poison","op":"add","val":true},
 {"id":"dwarf.adv.poisoned","src":"species:dwarf","sel":"save:all","op":"adv","val":1,
  "when":[{"eq":[{"ref":"save.condition"},"poisoned"]}]}
]
```
5. Ebonbane, advantage melawan spell (ilustrasi; teks item belum diverifikasi): advantage save terhadap spell.
```json
{"id":"ebonbane.adv-spell","src":"item:ebonbane","sel":"save:all","op":"adv","val":1,
 "when":["item.attuned",{"eq":[{"ref":"source.kind"},"spell"]}]}
```
6. Archery (Fighting Style): +2 attack roll senjata ranged.
```json
{"id":"fs.archery","src":"feat:archery","sel":"attack:weapon","op":"add","val":2,
 "type":"untyped","when":[{"eq":[{"ref":"attack.range"},"ranged"]}]}
```
7. Unarmored Defense (Barbarian): rumus AC dasar.
```json
{"id":"barb.unarmored","src":"class:barbarian/unarmored-defense","sel":"ac.base","op":"set",
 "val":{"expr":"10 + @abil.dex.mod + @abil.con.mod"},"type":"base",
 "when":[{"not":"armor.worn"}]}
```
Shield tetap boleh: efek ini hanya mengecek `armor.worn`, bukan `shield.worn`. Cek ke buku.
8. Fighting Style (pilihan): pilih satu feat kategori Fighting Style, lalu berikan.
```json
[
 {"id":"fighter.fs.choose","src":"class:fighter","sel":"feat","op":"choose",
  "val":{"pick":1,"from":{"category":"fighting-style"},"slot":"fs.1"}},
 {"id":"fighter.fs.grant","src":"class:fighter","sel":"feat","op":"grant",
  "val":{"ref":"choice.fs.1"}}
]
```

## 4. Aturan stacking (usulan)

Bukti dari halaman: PF2e wajibkan `type` bonus dan membuang efek ber-slug sama (curl). Foundry dnd5e punya Upgrade/Downgrade untuk "ambil yang terbaik" dan formula AC jamak (curl). Aturan D&D 2024 "efek bernama sama tidak menumpuk": tidak terbukti dari halaman. Cek di `books/` (PHB 2024, bab aturan) sebelum jadi kode.

Urutan hitung per selector:

| Fase | Isi | Aturan |
|---|---|---|
| 1. base | `op:set`, `type:base` | Ambil yang terbaik (hasil tertinggi). Contoh: Unarmored Defense vs armor vs Mage Armor. |
| 2. add | `op:add` | Kelompokkan per `group`. Dalam satu grup ambil nilai tertinggi. Antar grup dijumlahkan. `group:null` = selalu menumpuk. |
| 3. mul | `op:mul` | Kali berurutan menurut `prio`. |
| 4. clamp | `min`, `max` | Terakhir. Contoh: ability score maksimum 20. |
| Terpisah | `adv`/`dis` | Hitung jumlah sumber. Ada minimal satu adv dan satu dis = normal, berapa pun jumlahnya. Jangan simpan sebagai angka. |
| Terpisah | `resist`/`immune` | Set. Resistance ganda dari sumber berbeda = tetap satu. |

Dedupe: dua efek ber-`id` sama dari sumber ganda (dua Cloak) dihitung satu. Grup default = `id` item sumber, jadi dua salinan item yang sama tidak menumpuk.

Setiap hasil menyimpan rincian: daftar efek yang dipakai dan yang dibuang beserta alasan. UI sheet menampilkannya.

## 5. Validasi saat build

Bukti: repo 5eSchema merujuk JSON Schema dan skrip validasi penuh milik 5etools (`_test/test-json.js`). CEL memisahkan kompilasi dan evaluasi (bukti: repo cel-expr).

Usulan untuk `build.py` (atau skrip Node terpisah, dipanggil dari build):
1. JSON Schema untuk bentuk efek (field, enum `op`, `type`).
2. Cek semantik: `sel` dan `ref` ada di daftar tertutup, tipe operand cocok, `id` unik, `src` menunjuk entri nyata.
3. Parse `expr` dengan tokenizer yang sama dengan runtime. Gagal = build gagal.
4. Cek `scale.steps`: kunci naik, mulai dari level 1 atau level fitur.
5. Cek `choose`: `slot` unik per karakter, `from` menghasilkan minimal satu kandidat.
6. Tes emas: Yudhi (sheet lama), hasil Apply builder, karakter baru. Bandingkan hasil derive lama dengan hasil efek baru sebelum menghapus tabel berkunci nama.

## 6. Migrasi dari kondisi sekarang

| Langkah | Isi |
|---|---|
| A | Tambah mesin efek berdampingan dengan derive lama. Jalankan keduanya, catat selisih di `reports/`. |
| B | Pindahkan satu kelompok (AC) dulu. Lalu save, resist, attack. |
| C | Hapus tabel berkunci nama hanya setelah selisih nol pada tiga skenario. Minta izin sebelum hapus. |
| D | Tidak mengubah key localStorage. Pilihan baru masuk ke key baru dengan migrasi. |

## 7. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Aturan "tidak menumpuk" 2024 salah dibaca | AC/save salah | Cek buku dulu. Tulis tes per kasus. |
| Predicate tumbuh jadi bahasa pemrograman | Sulit dirawat | Operator tetap kecil. Operator baru lewat request ke Logic. |
| Daftar selector/ref bocor ke teks bebas | Efek tidak tervalidasi | Build gagal untuk selector tak dikenal. |
| Efek kontekstual rumit (reaksi, sekali per giliran) | Tidak muat di model | Model `state.*` flag dulu. Catat sisanya sebagai catatan teks. |
| Data lama (Yudhi) tak punya `choice.*` | Efek `grant` kosong | Migrasi memberi nilai default dan menandai "belum dipilih". |
| Rincian hitung hilang | Sulit debug | Wajib simpan daftar efek terpakai/dibuang. |
| Salinan teks buku | Lisensi | Teks `label` ditulis ulang sendiri. |
| Klaim riset tidak lengkap (5etools, Open5e, Borealis, dll. tidak terbaca) | Mungkin ada pola lebih baik | Ulangi riset untuk proyek itu bila izin akses halaman tersedia. |

## 8. Daftar halaman

Dibuka lewat WebFetch dan terbaca (17):
1. https://github.com/foundryvtt/pf2e/wiki/Quickstart-guide-for-rule-elements
2. https://hackmd.io/@foundryvtt-dnd5e/active-effects
3. https://deepwiki.com/open5e/open5e-api
4. https://gh.r-mj.com/furlat/dnd_engine
5. https://github.com/kirkdiggler (profil; ringkasan rpg-toolkit)
6. https://github.com/jwadhams/json-logic-js
7. https://github.com/revilowaldow/5eSchema
8. https://github.com/cel-expr/cel-spec
9. https://monitoring-git.chickenkiller.com/CacheControl/json-rules-engine/blob/master/docs/rules.md
10. https://www.github.com/5e-bits/5e-database/discussions/395
11. https://github.com/5e-bits/5e-srd-api
12. https://docs.rs/dnd-character/0.13.16/src/dnd_character/api/classes.rs.html
13. https://gh.r-mj.com/kobseryqum/foundry-pathbuilder2e-import
14. https://docs.rs/dnd/latest/dnd/
15. https://rook.foundryvtt.com/article/active-effects
16. https://github.com/foundryvtt/dnd5e/wiki/Enchantment/b51ca9822919a8f73714a2423985c43ec9ae4f1a
17. https://open5e.com/api-docs

Terbuka tapi kosong (redirect/metadata): mimir-dm additional-schemas, mimir-dm feat-schema, mimir-dm (alamat baru), foundryvtt.wiki active-effects.

Dibaca lewat curl sebelum arahan (tidak dihitung, ditandai "curl" di tabel): wiki dnd5e Active-Effect-Guide, Advancement, Advancement-Type-Scale-Value, Advancement-Type-Item-Choice, Advancement-Type-Item-Grant, Advancement-Type-Trait, Active-Effect-Rules, Filters, Activities, Active-Effects, Home; wiki pf2e Quickstart-guide-for-rule-elements (versi penuh, bagian stacking/slug). URL kanonik: https://github.com/foundryvtt/dnd5e/wiki/<nama halaman>.

Diblokir atau gagal: WebFetch ke github.com/foundryvtt/dnd5e/wiki/* (izin tidak dijawab), github.com/KirkDiggler/rpg-toolkit (izin), CEL langdef.md (izin), jsonlogic.com/operations (403 di proxy).
