# P5 spec untuk agen penulis: buku 2024 tambahan (mulai Exploring Eberron 2024)

Tujuan: menulis teks dengan kata sendiri (bahasa Inggris) untuk dipakai app. Kamu hanya menulis file overlay Python yang diberikan. Jangan ubah file lain. Jangan jalankan `tp_build.py` tanpa `--check` dan jangan jalankan `build.py`. Agen lain bekerja bersamaan.

## Aturan teks
- Tulis ulang dengan kata sendiri. Jangan salin kalimat sumber. Angka, DC, jenis damage, durasi, jumlah pakai, syarat, dan nama harus sama dengan sumber.
- Pendek, langsung, bentuk aktif. Judul kecil di dalam teks: `**Judul.**`.
- Tanpa em dash, en dash, titik koma, atau tag `{@...}`. Nama mantra ditulis polos.
- Jangan tulis nama penulis atau nama buku di teks aturan.

## Membaca sumber
```
python3 tools/tp/dump2.py "Exploring Eberron - 2024" list
python3 tools/tp/dump2.py "Exploring Eberron - 2024" race            # semua species, atau tambah nama
python3 tools/tp/dump2.py "Exploring Eberron - 2024" background|feat|spell|item|itemGroup|magicvariant [Nama]
python3 tools/tp/dump2.py "Exploring Eberron - 2024" sub [Kelas] [Nama]
```
Item "fluff" tidak perlu. Teks aturan saja.

## Bentuk file (ikuti contoh yang ada, baca dulu)
- Subclass: `tools/tp/overlay/tee24_sub.py`, `SUB = {...}`. Contoh: `tvss_sub_wizard.py`, `tvss_sub_bard.py`. Kunci: spab, f, lu, acts, fx, pick, grant. Hanya fx skills, exp, langs, senses, res, imm, notes yang dibaca. Kelas Artificer sudah ada di app (data EFA). Cek `grep -n "def sub_records" -A60 tools/tp_build.py`.
- Species: `tee24_species.py`. Contoh: `tvss_species.py` (SPECIES, LU, ACTS, SP_AUTO, DEF). Species yang punya garis keturunan: pakai `lin`.
- Background: `tee24_bg.py`. Contoh: `tdcg_bg.py` dan `tdcsr_bg.py` (BG, OPTS, ALSO, LU, TL). Pilihan feat pakai nama feat yang ada di app atau di buku ini.
- Feat: `tee24_feat.py`. Contoh: `tvss_feat.py` (FEATS, ALSO). `dm` untuk mantra gratis.
- Mantra: `tee24_spell.py`, `TEXT = {nama: [ringkasan, teks penuh]}`. Contoh: `tvss_spell_1.py`.
- Item: `tee24_item.py`. Contoh: `tvss_item.py` (ITEMS lewat `add(...)`, SP, WPN, GEAR, MASTERY, WDESC). Item yang bervarian rarity (misal "Blast Disk (Common)") ditulis satu baris per varian. Grup dan magicvariant: tulis tiap varian sebagai item. Baca `grep -n "item_records\|weapon_records\|def .*item" tools/tp_build.py` untuk bentuk baris.

## Cek hasil
```
python3 -c "import ast;ast.parse(open('tools/tp/overlay/FILE.py').read())"
python3 tools/tp_build.py --check | tail -5      # lihat jumlah GAP; baris EE24 di reports/tp-gap.md hanya ditulis oleh build penuh, jadi cek lewat output --check
```
Target: tidak ada GAP "no overlay text" untuk bagianmu.

## Laporan akhir (singkat)
File yang dibuat, jumlah entri, GAP tersisa, hal di sumber yang mesin tidak bisa ungkapkan (satu baris per hal).

# Tambahan untuk Grim Hollow Player's Guide 2024 (tghp)
Sumber: `python3 tools/tp/dump2.py "Grim Hollow - Player's Guide - 2024" ...` (perintah list, race, background, feat, spell, item, baseitem, itemMastery, class, sub, opt). Prefix file overlay: `tghp_`, kelas `tghc_`.
- Subclass: tulis ke `tghp_sub_<huruf>.py` dengan `SUB = {...}` (loader `tghp_sub.py` menggabung semua). Bentuk seperti `tvss_sub_wizard.py`. Fitur pilihan subclass (optionalfeature yang dirujuk lewat optionalfeatureProgression: CA:AT College of Adventurers, EI Daemonologist, LC:CO Living Crucible, MB:M Misfortune Bringer, CM:MO Circle of Mutation) dibuat sebagai `pick` dengan `k: "opts"` (daftar nama dan teks). Lihat contoh pick `opts` di `tvss_sub_bard.py`. Jika jumlah pilihan naik per level, tulis satu pick per level.
- Mantra: `tghp_spell_<n>.py` dengan `TEXT = {nama: [ringkasan, teks penuh]}`.
- Species: `tghp_species.py`. Species Grim Hollow punya kumpulan trait (feature type HT, 107 trait). Setiap species: bagian tetap (size, speed, jenis, dll) dan `opts = {"label": "Heritage Traits", "n": 8, "list": [[nama, teks, fx], ...]}` berisi seluruh pool HT dengan teks sendiri. fx per trait memakai kunci yang dibaca mesin (lihat `spOptFx` dan `SFX` di `src/builder/13-logic-sources-and-packs.js`, contoh `src/data/wotc10-species-2014.js` opts "Animal Enhancement"). Trait tradisional tiap species ditulis di teks pembuka trait dan di kunci `def` (daftar nama) jika mesin membacanya, jika tidak di teks. Pool boleh dibagi sebagai variabel Python POOL dan dipakai tiap species. Trait yang efeknya tidak bisa diungkapkan fx tetap ditulis dalam teks. Species yang namanya sama dengan species inti (Dragonborn, Dwarf, Elf, Gnome, Halfling, Human) dibuat sebagai entri sendiri dengan nama sumber persis.
- Background: `tghp_bg.py`, feat: `tghp_feat.py` (termasuk 12 Boon dan feat advanced weapon). Cek `tp_build.py` bg_records dan feat_records.
- Item: `tghp_item.py`, senjata dari baseitem sumber (45) dengan MASTERY (9 mastery baru: Brutal, Defending, Disarming, Entangling, Returning, Scatter, Set, Strong-Draw, Swift) dan WDESC, seperti `tvss_item.py`. Armor modifikasi (AdvEq 17) sebagai item.
- Kelas Monster Hunter: `tghc_monster_hunter.py` `CLASS = {...}`, contoh `tvsc_alchemist.py` dan spec `reports/p4-spec-agen.md`. Fitur pilihan Monster Grimoire (feature type MGS, 13 tipe makhluk) lewat `opts`. Tiga hal di luar tahap ini: Transformation (charoption, feature type */TB */TF), Gift of Dread (GoD), Gear modifications (TG:*), Hunter Traits dipakai species. Jangan tulis itu kecuali tugasmu menyebutnya.
Jangan jalankan `tp_build.py` tanpa `--check` dan jangan jalankan `build.py`.

# P5c: Transformations of Grim Hollow Player's Guide 2024
Tiap Transformation menjadi 4 feat ("<Nama> Transformation: Stage N") yang dibuat generator `trans_records` di tools/tp_build.py. Kamu menulis teks sendiri.
Baca: `python3 tools/tp/dump2.py "Grim Hollow - Player's Guide - 2024" charoption <Nama>` (aturan tiap stage ada di teks itu: berapa Boon dipilih, Boon yang wajib) dan `... opt <Kode>:TB` / `<Kode>:TF` (kode: AH Aberrant Horror, F Fey, Fi Fiend, H Hag, L Lich, Ly Lycanthrope, O Ooze, P Primordial, Ser Seraph, SG Shadowsteel Ghoul, Spec Specter, V Vampire). Stage tiap Boon/Flaw ada di prerequisite ("Stage N").
Bentuk file `tools/tp/overlay/tghp_trans_<x>.py`:
```
TRANS = {
 "Vampire": {
  "intro": "2 sampai 4 kalimat tentang Transformation ini, dengan aturan umum (cara maju stage, penyembuhan, aturan makan) yang penting untuk bermain.",
  "stages": {1: {"rule": "Aturan stage ini dalam kalimat sendiri.", "take": 1, "fixed": ["Fanged Bite"], "d": "ringkasan 1 kalimat"}, 2: {...}, 3: {...}, 4: {...}},
  "opt": {"Fanged Bite": "Teks Boon atau Flaw", ...}   # satu teks untuk SETIAP Boon (TB) dan Flaw (TF) Transformation ini
 }, ...
}
```
- `fixed` = Boon wajib di stage itu (dimasukkan ke teks feat). `take` = jumlah Boon yang dipilih pemain dari sisa Boon stage itu. Flaw stage itu selalu didapat dan ditulis otomatis dalam teks.
- Jika aturan sumber untuk sebuah stage berbeda (misal Flaw menggantikan Flaw stage sebelumnya), tulis di `rule`.
- Teks: kata sendiri, bahasa Inggris, angka dan nama sama dengan sumber, tanpa em dash, titik koma, tag. Singkat per Boon (1 sampai 4 kalimat).
- Jangan jalankan build. Validasi: `python3 tools/tp/gapcheck.py "<Nama Transformation>"` harus tanpa GAP (jangan jalankan tp_build.py tanpa --check).

# P5g bis P5k: buku kecil dan Dark Matter (chunk)
Buku dengan banyak entri memakai file chunk `<prefix>_<jenis>_<x>.py` (loader `<prefix>_<jenis>.py` menggabung semuanya, dibuat oleh tools/tp/scaffold.py). Bentuk isi tiap chunk sama dengan contoh lama:
- `<prefix>_sub_<x>.py`: `SUB = {...}` (opsional `EXT = [...]` untuk pilihan tambahan pada subclass app, lihat tsae_sub.py)
- `<prefix>_spell_<x>.py`: `TEXT = {...}`
- `<prefix>_feat_<x>.py`: `FEATS = {...}`, opsional `ALSO = [...]`
- `<prefix>_item_<x>.py`: `ITEMS = []` lewat `add(...)`, `SP`, `WPN`, `GEAR`, `MASTERY`, `WDESC` (contoh tghp_item.py, tee24_item.py)
- `<prefix>_bg.py` dan `<prefix>_species.py`: satu file (BG/OPTS/ALSO/LU/TL dan SPECIES/LU/ACTS/SP_AUTO/DEF)
- kelas: `<clspre><kelas>.py` dengan `CLASS = {...}` (contoh tghc_monster_hunter.py, tsgc_jaeger.py)
Prefix: Healer tshl (kelas tshc_healer), Summoner tssm (kelas tssc_summoner), Dr Dhrolin tsdd, Griffon's Saddlebag tsgs, Dark Matter tsdm (kelas tsdc_gadgeteer). Sumber dibaca dengan `python3 tools/tp/dump2.py "<nama file tanpa penerbit>" ...` (contoh: "Healer - 2024", "Summoner - 2024", "Dhrolins Dictionary of Dinosaurs - 2024", "Griffon's Saddlebag, Book 1 - 2024", "Dark Matter - 2024"). Perintah: list, class, sub, opt, race, background, feat, spell, item, baseitem, itemMastery, magicvariant.
Subclass milik kelas yang tidak ada di app (misal Gunslinger) cukup dilewati dan dilaporkan. Subclass untuk kelas Valda (Alchemist, Captain, Craftsman, Dancer, Investigator, Martyr, Necromancer, Vagabond, Warden, Warmage, Witch) memakai nama kelas itu.
Alias nama bentrok ditangani generator. Tulis nama persis seperti sumber.

# P5l: buku aturan 2014 (Deep Magic, Humblewood)
- Buku ini berlabel "(2014 rules)". Bentuk overlay sama dengan buku 2024, dengan perbedaan berikut.
- Ras 2014 memakai `asi` (contoh bentuk lengkap di tools/tp/overlay/tdcg_species.py). Subras jadi opsi `opts` (lineage) pada ras induk.
- Level fitur subclass 2014 dijepit ke minimal 3 oleh generator. Tulis teks fitur apa adanya, jangan ubah level.
- Fitur pilihan (Rune, Hieroglyph, Elemental Mastery, dll) tidak punya tautan progresi di sumber. Tempelkan sebagai `pick` pada subclass atau feat pemiliknya (`dump2.py "<buku>" opt <Tipe>`). Tiap fitur pilihan harus terpakai di satu pick.
- Subclass satu nama di beberapa kelas: generator memberi alias. Tulis nama persis seperti sumber.
- Daftar subclass Deep Magic per agen ada di /tmp/dm_sub_groups.json (grup A sampai E).
- Mantra Deep Magic: `TEXT = {"Nama": "teks"}` untuk setiap nama unik di rentang alfabet milikmu.
