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
