# P4 spec untuk agen penulis: kelas dan subclass Valda's Spire of Secrets 2024

Tujuan: menulis teks kelas dan subclass dengan kata sendiri (bahasa Inggris) untuk dipakai app. Kamu hanya menulis file overlay Python. Kamu tidak mengubah file lain.

## Aturan teks
- Bahasa Inggris. Tulis ulang dengan kata sendiri. Jangan salin kalimat sumber. Angka, nama fitur, nama mantra, dan aturan harus sama dengan sumber.
- Pakai: pendek, langsung, bentuk aktif. Satu fitur = satu paragraf. Judul kecil di dalam teks pakai `**Judul.**`.
- Jangan pakai em dash, en dash, titik koma, atau tag seperti `{@spell ...}`. Nama mantra ditulis polos.
- Jangan menambah aturan yang tidak ada di sumber. Jangan hilangkan angka, DC, jenis damage, durasi, jumlah pakai, atau syarat.
- Jangan menulis kata "Valda" atau nama penulis di dalam teks aturan. Kredit sudah ada di kartu buku.

## Membaca sumber (hanya baca)
```
python3 tools/tp/dump.py class Warden
python3 tools/tp/dump.py sub Warden            # semua subclass kelas itu
python3 tools/tp/dump.py sub Warden "Godsworn" # satu subclass
python3 tools/tp/dump.py opt T                 # fitur pilihan: BF DO T AInit WC GH S MP MV:V MV:C MV:HK MV:MS MV:GW
```

## File yang kamu tulis
1. `tools/tp/overlay/tvsc_<kelas>.py` berisi `CLASS = {...}` (kelas dan fitur pilihan). Contoh lengkap: `tools/tp/overlay/tvsc_alchemist.py`.
2. `tools/tp/overlay/tvss_sub_<kelas>.py` berisi `SUB = {...}` (subclass). Contoh lengkap: `tools/tp/overlay/tvss_sub_wizard.py` dan `tvss_sub_bard.py`. Jika tugasmu hanya sebagian subclass, pakai nama file yang diberikan (misal `tvss_sub_captain_a.py`).

### CLASS
```
CLASS = {
 "eq": ["Pilihan A ...", "Pilihan B ..."],          # perlengkapan awal, satu string per pilihan (A, B, C), tulis ulang dari tabel sumber
 "f": {"Nama Fitur": "Teks penuh", ...},            # satu teks per nama fitur kelas di sumber. Lewati Ability Score Improvement, Epic Boon, Subclass Feature, "<Kelas> Subclass"
 "s": {"Nama Fitur": "Ringkasan 1 kalimat"},        # opsional. Tanpa ini ringkasan diambil dari kalimat pertama teks penuh
 "res": [{"n": "Nama", "tag": "Short Rest", "reset": "long|short|short1", "max": 3 | "pb" | "mod:INT" | [20 angka] | "col:Nama Kolom Tabel"}],
 "lu": [{"feature": "Nama Fitur", "n": "Nama tampil", "lvl": 5, "max": 1, "reset": "long", "tag": "Bonus Action"}],   # pelacak pakai per rest
 "acts": {"Nama Fitur": "action|bonus|reaction|free|other"},   # fitur yang muncul di tab Actions
 "opts": [{"feature": "Nama Fitur Kelas", "title": "Judul pilihan", "types": ["T"], "col": "Tricks"}],
        # col = nama kolom tabel yang berisi jumlah kumulatif. Jika tidak ada kolom: "levels": [5, 9, 13, 17] (satu per level) atau "cum": {"2": 3, "5": 4}
 "opt": {"T": {"Nama Pilihan": "Teks pilihan, termasuk syarat level atau subclass"}},   # satu teks untuk SETIAP fitur pilihan dengan tipe itu di sumber
}
```
- Nama di `f` harus sama persis dengan nama fitur di sumber. Fitur yang muncul dua kali (misal Cohort di level 2 dan 9) cukup satu teks yang mencakup semua level.
- `max` bisa dibaca dari tabel kelas. Gunakan `col:` agar angka diambil otomatis.
- Tulis semua pilihan yang kelas ambil di `opts`. Jika dua tipe berbagi satu pilihan, pakai `"types": ["MV:C", "MV:HK"]`.
- Jangan ubah `tools/tp_class.py` atau `tools/tp_build.py`. Jika sumber butuh sesuatu yang tidak bisa diungkapkan, tulis di teks dan catat di akhir laporanmu.

### SUB (subclass)
```
SUB = {
"Nama Subclass": {"spab": "INT",                      # kemampuan casting subclass jika ada, kosong jika tidak
 "f": {"Nama Fitur": "Teks", ...},                    # satu teks per fitur di sumber (selain entri deskripsi subclass sendiri)
 "lu": [{"feature": "Nama Fitur", "n": "Nama tampil", "lvl": 3, "max": 1 | "pb" | "mod:INT" | [20 angka], "reset": "long|short|short1", "tag": "Bonus Action"}],
 "acts": {"Nama Fitur": "action|bonus|reaction|free|other"},
 "fx": [[3, "Nama Fitur", {"skills": [...], "exp": [...], "langs": [...], "senses": {...}, "res": [...], "imm": [...], "notes": [["Note", "teks"]]}]],
 "pick": [{"l": 3, "k": "opts", "n": 2, "key": "unik", "feature": "Nama Fitur", "title": "Judul", "list": [["Nama", "teks"], ...]}],
 "grant": {"f": "Nama Fitur", "tools": [[3, "Nama Alat"]], "weapons": [[3, "Nama"]], "skills": [[3, "Nama"]]}},
}
```
- Hanya kunci `skills, exp, langs, senses, res, imm, notes` yang dibaca mesin di `fx`. Kunci lain (swim, saves, speed) tidak dibaca. Taruh di `notes`.
- `fx` hanya untuk efek tetap yang jelas (proficiency, resistance, immunity, sense). Efek bersyarat jadi teks dan `notes`.
- Level fitur subclass dimulai dari 3. Level diambil dari sumber otomatis.
- Mantra gratis atau selalu siap yang disebut sebagai nama biasa di sumber (additionalSpells) diambil otomatis. Pilihan mantra jadi teks.
- Fitur yang memberi pilihan tetap (misal pilih 2 dari daftar) pakai `pick` dengan `k: "opts"`. `key` harus unik di seluruh subclass.
- Fitur yang memberi Bomb Formula atau trik: jadikan teks.
- Subclass dengan nama yang sama ada di dua kelas (Captain dan Vagabond punya Brigand, Pugilist dan lain-lain). Teks boleh mirip, tetapi cek sumber masing-masing: isinya berbeda.

## Subclass lintas kelas
Captain dan Vagabond berbagi banyak subclass (cross-compatible). Fiturnya hanya ada di satu kelas (kelas asal). `dump.py sub <Kelas>` untuk kelas lain hanya menampilkan satu judul. Tugasmu menyebut nama subclass yang harus kamu tulis. Tulis sekali saja. Mesin menampilkannya di kedua kelas dan menambah catatan lintas kelas sendiri. Jangan tulis catatan itu.

## Cek hasilmu
```
python3 tools/tp/gapcheck.py Warden        # daftar GAP kelas itu dan cek gaya (em dash, titik koma, tag, panjang)
python3 -c "import ast,sys;ast.parse(open('tools/tp/overlay/tvsc_warden.py').read())"
```
Jangan menjalankan `python3 tools/tp_build.py` tanpa `--check` dan jangan menjalankan `python3 build.py`. Agen lain bekerja di waktu yang sama. Target: nol GAP untuk kelas dan subclass milikmu.

## Laporan akhir (singkat)
Tulis: file yang dibuat, jumlah fitur dan subclass, GAP yang tersisa, dan hal di sumber yang mesin tidak bisa ungkapkan (satu baris per hal).
