# Q spec untuk agen penulis: kategori 5e.tools

Tujuan: menulis teks dengan kata sendiri (bahasa Inggris) dan efek ke sheet untuk entri 5e.tools. Kamu hanya menulis file overlay di tools/q/overlay/. Jangan ubah file lain.

## Aturan teks
- Bahasa Inggris, kata sendiri, bukan salinan kalimat sumber. Angka, DC, damage, durasi, jumlah pakai, syarat harus sama dengan sumber.
- Pendek, langsung, bentuk aktif. Tanpa em dash, en dash, titik semikolon, tagar, markdown tebal berlebihan (`**Judul.**` boleh untuk sub judul).
- Nama mantra dan benda ditulis polos, tanpa tag {@...}.
- Jangan sebut nama penulis atau nomor halaman.

## Membaca sumber (hanya baca)
```
python3 tools/q/todo.py reward count
python3 tools/q/todo.py reward <potongan> <jumlah potongan>     contoh: 3 8 = potongan ketiga dari delapan
python3 tools/q/qbuild.py --check                                 daftar GAP (tidak menulis)
```

## Reward (hadiah: Charm, Blessing, Boon, Piety Trait, Curse, Draconic Gift, dan lain-lain)
Tulis `tools/q/overlay/reward_<huruf>.py`:
```
R = {
 "Nama|SRC": {"d": "Teks kata sendiri.", "fx": {...}, "ch": [3, "0", "never"], "sp": [["Identify", 0]]},
}
```
Kunci harus persis seperti baris `## Nama|SRC` di keluaran todo.py. Satu teks untuk setiap entri di potongan milikmu.
- `d`: teks hadiah. Wajib.
- `fx`: efek tetap yang dihitung sheet. Hanya yang pasti dan tanpa syarat. Kunci yang dibaca mesin:
  - `ac` angka bonus AC, `save` angka bonus semua save, `atk` dan `dmg` angka bonus serangan dan damage
  - `abil` ["CON", 2, 22] = tambah 2 pada CON, batas 22
  - `res`, `imm`, `vul` daftar jenis damage ("Fire"), `condImm` daftar kondisi ("Frightened")
  - `dark` jarak darkvision dalam kaki, `fly`, `swim`, `climb` kecepatan dalam kaki
  - `adv` daftar kunci roll yang mendapat Advantage ("Initiative", nama skill)
  - `acBase` AC dasar tanpa armor
  Efek bersyarat atau situasional hanya jadi teks, jangan masuk fx.
- `ch`: pelacak pakai [jumlah max, "0" tak pulih sendiri atau "short" atau "long", teks kapan reset: "never", "dawn", "short", "long"]. Pakai untuk "tiga kali pakai", "satu kali per rest", "hari".
- `sp`: mantra yang bisa dilempar item ini: [["Nama Mantra", level slot atau 0 untuk gratis]].
- Piety Trait dan sejenisnya yang bergantung pada nilai Piety atau dewa: tulis syarat di teks.

## Cek hasilmu
```
python3 -c "import ast;ast.parse(open('tools/q/overlay/reward_a.py').read())"
python3 tools/q/qbuild.py --check
```
Jangan menjalankan `python3 tools/q/qbuild.py` tanpa `--check`, jangan jalankan build.py, jangan git. Agen lain bekerja bersamaan. Target: nol GAP "no overlay text" untuk potonganmu.

## Laporan akhir (5 baris)
File, jumlah entri, GAP tersisa, hal di sumber yang tidak bisa ditiru mesin (satu baris per hal), asumsi yang kamu ambil.
