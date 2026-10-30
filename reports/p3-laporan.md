# Laporan tahap P3: Valda's Spire of Secrets 2024 (VSS24)

Branch: third-party-all. Tidak ada rilis. Buku mati secara bawaan dan terkunci seperti wxGate.

## Isi yang masuk

| Bagian | Jumlah | Catatan |
|---|---|---|
| Species | 2 | Geppettin (garis keturunan Bisque, Marionette, Plushie), Mandrake (musim) |
| Feat | 9 | Dengan mantra gratis lewat DM_SP, pelacak pemakaian, aksi |
| Subclass kelas yang sudah ada | 38 | Cleric 1, Wizard 12, Bard 13, Barbarian 12. Teks, pelacak, aksi, efek |
| Mantra | 179 | Daftar kelas, tingkat, komponen, durasi, teks sendiri. Muncul hanya saat buku aktif |
| Senjata | sekitar 50 | Statistik dari sumber. Mastery baru (Parry, Shift, Tension, Mounted, Jolt, Overheat, Bludgeon, Automatic, Explode, Scatter, Sighted) |
| Senjata Switch | 11 bentuk ganda | Satu baris per bentuk |
| Item ajaib | 56 | Cangkok monster (efek kecepatan, penglihatan, AC), koktail, perangkat |
| Perlengkapan | 12 | Jebakan, bom, amunisi |
| Pilihan | 9 topeng | College of Masks memilih 3 topeng, lalu 1 di tingkat 6 dan 14 |

## Perubahan mesin

| File | Perubahan |
|---|---|
| src/builder/09-logic-feats-and-choices.js | Senjata sumber ketiga bisa dilepas lagi saat buku mati (tanda tp) |
| src/builder/10-logic-v17-additions.js | Jenis pilihan baru "opts" (daftar nama tetap) |
| tools/tp_build.py | Pembuat mantra dari data sumber, pembuat senjata, MASTERY tambahan |
| tests/tp_spells.py, tests/tp_items.py | Tes baru: mantra, senjata, cangkok, topeng |

## Belum masuk (di tp-gap.md)

| Hal | Alasan | Tahap |
|---|---|---|
| 11 kelas baru Valda dan fitur pilihan miliknya (Trik, Bom, Kutukan, Manuver, Penemuan) | Perlu mesin kelas baru | P4 |
| Mantra Spellfury Barbarian (slot sendiri) | Teks saja, tidak ada slot | P4 |
| Monster (45), dewa, aturan varian, hadiah | Hanya referensi | Q6 sampai Q8 |
| Kunci efek Swim dan Saves milik subclass | Mesin belum membaca. Jadi catatan | P4 |
| Jenis damage tambahan, Burrow setengah Speed | Teks saja | P4 |
