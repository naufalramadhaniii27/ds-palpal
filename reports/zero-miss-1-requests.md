# Zero miss 1: permintaan ke bagian lain

| No | Bagian | Permintaan | Alasan |
|---|---|---|---|
| 1 | UI/UX (app) | Tombol ganti jenis damage di baris pact weapon (Slashing, Necrotic, Psychic, Radiant) langsung di sheet, per serangan | Aturan 2024 memilih jenis per serangan. Zero miss 1 hanya menambah pilihan bawaan di builder (`B.ch.pactDmg`) dan catatan di baris. Tombol di sheet butuh state main baru, itu milik UI |
| 2 | Logic (builder, fungsi yang dipecah SOLID s16) | 2014 Improved Pact Weapon: pact weapon boleh Shortbow, Longbow, Light Crossbow, Heavy Crossbow | `pactList()` (10-logic-v17-additions.js) dan rule `warlock-pact-weapon` (12e) hanya menerima senjata melee. Perubahan menyentuh daftar pilihan dan aturan active weapon |
| 3 | Checker (tests/clause_gate.py) | Baris FDMG dicocokkan lewat (pemilik, nama fitur) saja. Beberapa baris memakai nama sub-bagian fitur: "Colossus Slayer" di fitur "Hunter's Prey", "Improved Lunar Radiance" di "Lunar Form", "Dreadful Strike" di "Stalker's Flurry". Sheet sudah menghitungnya, gate tetap menandai uncovered | False positive. Usul: gate juga mencocokkan nama baris FDMG yang muncul di teks fitur, seperti `gx_match` untuk GX |
| 4 | Checker | Invocation Warlock (INVOCATIONS, 2024 dan 2014) tidak masuk semesta clause_gate dan mech_scan | Efek Pact of the Blade di zero miss 1 tidak terlihat di hitungan gate. Bukti ada di tests/zero_miss_fx.py |
| 5 | Data | `books/` tidak ada di repo dan di mesin kerja | Aturan proyek meminta cek ke buku. Zero miss 1 memakai teks data aplikasi dan halaman `BOOKPG` |
