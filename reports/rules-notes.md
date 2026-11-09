# Catatan tafsir aturan (zero miss)

Dasar setiap efek baru. Kolom sumber: buku dan halaman, atau URL errata dan Sage Advice. Folder `books/` tidak ada di repo dan di mesin kerja (dicek 2026-11-09), jadi teks yang dibaca adalah teks data aplikasi (`src/data`, `src/builder/06-data-2014-classes.js`) yang ditulis ulang dari buku, ditambah halaman buku yang tercatat di data (`BOOKPG`). Pencarian putusan resmi: WebSearch "Sage Advice 2024 errata Eldritch Smite Pact Magic slot Lifedrinker pact weapon damage type" dan forum D&D Beyond 211100 (tidak ada putusan resmi). Halaman free rules D&D Beyond tidak bisa dibuka (izin URL tidak dijawab), aidedd.org menolak robot.

## Zero miss 1: Warlock, Pact of the Blade

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Sumber | Status | Contoh angka |
|---|---|---|---|---|---|
| 1 | 2024 Pact of the Blade: damage pact weapon boleh Necrotic, Psychic, atau Radiant sebagai ganti jenis biasanya, sesuai pilihan | Pilihan per serangan menurut teks. Sheet menyimpan satu pilihan bawaan (`B.ch.pactDmg`, opsional). Baris serangan memakai jenis itu, catatan menyebut jenis lain yang juga boleh. Tanpa pilihan, jenis senjata tetap | PHB 2024 p. 156 (Pact of the Blade) | RAW, belum diputuskan resmi. Alternatif: tombol ganti jenis di baris serangan sheet (butuh UI, lihat permintaan) | Longsword, pilihan Radiant: 1d8+4 Radiant |
| 2 | 2024 Pact of the Blade: senjata terikat dihitung Spellcasting Focus | Catatan di baris serangan. Tidak ada angka | PHB 2024 p. 156 | RAW | - |
| 3 | 2024 Pact of the Blade: serangan dan damage boleh memakai Charisma | Charisma dipakai bila tidak lebih rendah dari ability senjata (perilaku lama M13, tidak diubah) | PHB 2024 p. 156 | RAW | CHA 18: +4 |
| 4 | 2024 Eldritch Smite: sekali per giliran, habiskan slot Pact Magic, 1d8 Force plus 1d8 per level slot, Prone bila Huge atau lebih kecil | Hanya slot Pact Magic (teks 2024 menyebut "Pact Magic spell slot", jadi slot Spellcasting dari multiclass tidak dipakai). Angka di baris memakai level slot Pact Magic saat ini | PHB 2024 p. 155 | RAW, teks jelas | Warlock 12, slot level 5: 6d8 Force |
| 5 | 2024 Lifedrinker: sekali per giliran, 1d6 Necrotic, Psychic, atau Radiant; boleh habiskan satu Hit Point Die, pulih sebesar lemparan + modifier CON, minimal 1 | Angka pulih ditulis: 1dHD + CON. Multiclass: "the die roll + CON" karena Hit Point Die bisa dari kelas mana saja | PHB 2024 p. 156 | RAW | CON 14, d8: pulih 1d8+2, minimal 1 |
| 6 | 2024 Thirsting Blade dan Devouring Blade: dua, lalu tiga serangan dengan pact weapon pada aksi Attack | Tidak berubah. Perbaikan teks: kalimat "Make one attack." tidak lagi diulang di belakang | PHB 2024 p. 157 (Thirsting Blade), p. 155 (Devouring Blade) | RAW | Warlock 12: tiga serangan |
| 7 | 2014 Pact of the Blade: proficient, magis untuk menembus resistance, tanpa aturan Charisma | Charisma tidak lagi dipakai untuk pact weapon 2014 kecuali subclass The Hexblade (Hex Warrior: berlaku untuk setiap pact weapon) | PHB 2014 p. 107-108, XGE p. 55 (Hex Warrior) | RAW | STR 16, CHA 18, bukan Hexblade: memakai STR +3 |
| 8 | 2014 Improved Pact Weapon: +1 serangan dan damage kecuali senjata magis yang sudah punya bonus; jadi focus; boleh berbentuk shortbow, longbow, light crossbow, heavy crossbow | +1 dihitung pada pact weapon tanpa bonus magis. Focus ditulis di catatan. Bentuk ranged belum dihitung (daftar pilihan pact weapon dan aturan "active weapon" hanya menerima melee, ada di fungsi builder yang sedang dipecah, dicatat sebagai permintaan) | XGE p. 57 | RAW | Longsword: +1 to hit, +1 damage |
| 9 | 2014 Lifedrinker (level 12): extra Necrotic sebesar modifier Charisma (minimal 1) | Baris damage memakai CHA mod, bukan 1d6 versi 2024 (sebelumnya baris 2024 ikut tampil di 2014, salah) | XGE p. 57 | RAW | CHA 18: 4 Necrotic |
| 10 | 2014 Eldritch Smite: sekali per giliran, habiskan warlock spell slot, 1d8 Force plus 1d8 per level slot, boleh jatuhkan target Prone bila Huge atau lebih kecil | "Warlock spell slot" dibaca sebagai slot Pact Magic. Rumus sama dengan 2024 | XGE p. 57 | Belum diputuskan resmi untuk multiclass. Alternatif: slot Spellcasting multiclass juga boleh (tidak dipakai) | Warlock 12: 6d8 |

## Zero miss 1: DMG 2024 weapons (extra damage saat kena)

Teks dibaca dari `src/data/dmgi-magic-items-dmg2024.js` (DMG 2024, ditulis ulang). Semua angka di bawah adalah dadu tambahan bersyarat, jadi sheet menulisnya sebagai catatan "Extra damage" di baris serangan senjata itu (field `atkDice`), tidak dijumlahkan ke damage utama. Varian senjata ("Flame Tongue (Rapier)") memakai baris item yang sama. Tidak ada errata DMG 2024 yang mengubah angka ini yang ditemukan.

| Item | Kalimat (ditulis ulang) | Tafsir | Status | Contoh |
|---|---|---|---|---|
| Axe of the Dwarvish Lords | d20 20 melawan makhluk: +20 Slashing. Serangan ranged yang kena: +1d8 Force, 2d8 melawan Giant | Dua catatan terpisah | RAW | +20 Slashing pada 20 alami |
| Dragon Slayer | Melawan Dragon: +3d6 dengan jenis damage senjata | Catatan bersyarat | RAW | Longsword: +3d6 Slashing |
| Dwarven Thrower | Serangan ranged kena: +1d8 Force, 2d8 melawan Giant | Ditulis di baris melee dan baris lempar karena satu senjata punya dua baris | RAW | +1d8 Force |
| Executioner's Axe | Kena Humanoid: +2d6 Slashing, jumlah yang sama jadi Temporary HP | Catatan bersyarat | RAW | +2d6 |
| Flame Tongue | Saat menyala: +2d6 Fire | Catatan "while burning". Tidak dibuat toggle, karena dadu tidak dijumlahkan | RAW | +2d6 Fire |
| Holy Avenger | Fiend atau Undead yang kena: +2d10 Radiant | Catatan bersyarat (hanya aktif bila attuned, attunement Paladin) | RAW | +2d10 |
| Mace of Smiting | d20 20: +7 Bludgeoning, +14 melawan Construct | Catatan bersyarat | RAW | +7 |
| Staff of Thunder and Lightning | Lightning: melee kena, +2d6 Lightning, sekali per fajar | Catatan, sekali per fajar | RAW | +2d6 |
| Sun Blade | Undead yang kena: +1d8 Radiant | Catatan. dieReplace Radiant dan Finesse yang lama tetap | RAW | +1d8 |
| Sword of Kas | Melawan Undead: +2d10 Slashing | Catatan | RAW | +2d10 |
| Sword of Life Stealing | d20 20, bukan Construct atau Undead: +15 Necrotic dan Temporary HP sebanyak itu | Catatan | RAW | +15 |
| Vorpal Sword | d20 20 pada makhluk yang kepalanya tidak bisa dipotong: +30 Slashing | Catatan, syarat kepala diringkas | RAW | +30 |
| Wand of Orcus | Setiap kena: +2d12 Necrotic | Catatan (tanpa syarat, tetapi tetap tidak dijumlahkan agar sama dengan pola lain) | RAW. Alternatif: jumlahkan ke damage utama | +2d12 |
| Wave | d20 20: +21 Necrotic | Catatan | RAW | +21 |
| Whelm | Serangan ranged kena: +1d8 Force, 4d8 melawan Giant, Elemental, atau Construct | Catatan | RAW | +1d8 |
