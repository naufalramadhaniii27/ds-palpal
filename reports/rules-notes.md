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

## Zero miss 2: SPEED, RESOURCE, PROF

Folder `books/` tetap tidak ada (dicek 2026-11-09). Teks dibaca dari data aplikasi. Halaman PHB 2024 diambil dari `BOOKPG.phb` (data aplikasi). Halaman buku 2014 dan XGE tidak tercatat di data, kolom sumber menulis "teks data" untuk itu. Semua bentuk yang berlangsung selama waktu tertentu dibuat toggle (keadaan main, mati bawaan), jadi sheet tidak menghitung terbang atau Speed tambahan sebelum pemain menyalakannya.

### SPEED (toggle di `src/data/fx-Z2.js`)

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Sumber | Status | Contoh angka |
|---|---|---|---|---|---|
| 1 | Wild Heart 14, Power of the Wilds (Falcon): selama Rage, Fly Speed sama dengan Speed, asal tanpa armor | Toggle `wild-falcon`, syarat `noBody` (tanpa armor, Shield boleh, sesuai kata "armor") | PHB 2024 p. 55 | RAW. Pilihan Falcon, Lion, Ram dipilih tiap Rage, jadi bukan pilihan builder | Speed 40: Fly 40 |
| 2 | Draconic Sorcery 14, Dragon Wings: Fly Speed 60 ft selama sayap ada | Toggle `dragon-wings` | PHB 2024 p. 148 | RAW | Fly 60 |
| 3 | 2014 Draconic Bloodline 14, Dragon Wings: Fly Speed sama dengan Speed sekarang | Toggle `dragon-wings`, nilai `speed` | Teks data 2014 (PHB 2014, Sorcerer) | RAW | Speed 30: Fly 30 |
| 4 | 2014 Divine Soul 14, Otherworldly Wings: Fly Speed 30 ft | Toggle `otherworldly-wings` | Teks data (XGE) | RAW | Fly 30 |
| 5 | Aberrant Sorcery 6, Revelation in Flesh: Swim Speed dua kali Speed, bisa bernapas di air | Toggle `flesh-aquatic`, `speed2`. Pilihan manfaat dipisah jadi dua toggle karena tiap manfaat dibeli dengan Sorcery Points sendiri | PHB 2024 p. 146 | RAW | Speed 30: Swim 60 |
| 6 | Aberrant Sorcery 6, Revelation in Flesh: Speed menjadi Fly Speed, bisa melayang | Toggle `flesh-flight`, `speed` | PHB 2024 p. 146 | RAW | Fly 30 |
| 7 | Oath of Vengeance 20, Avenging Angel: Fly Speed 60 ft, melayang (2024). 2014: Fly Speed 60 ft | Toggle `avenging-angel` di kedua edisi | PHB 2024 p. 117, teks data 2014 | RAW | Fly 60 |
| 8 | Psi Warrior 11, Telekinetic Adept: Bonus Action, Fly Speed dua kali Speed sampai akhir giliran | Toggle `psi-leap`, `speed2`. Baris resource Psi-Powered Leap sudah ada | PHB 2024 p. 99 | RAW | Speed 30: Fly 60 |
| 9 | Gloom Stalker, Dread Ambusher: Speed naik 10 ft sampai akhir giliran pertama tiap combat | Toggle `dread-ambusher`, `speedAdd` 10, 2024 dan 2014 | PHB 2024 p. 125, teks data 2014 | RAW | Speed 30: 40 |
| 10 | Warrior of the Elements 17, Elemental Epitome: Step of the Wind menambah Speed 20 ft sampai akhir giliran | Toggle `epitome-step`, `speedAdd` 20 | PHB 2024 p. 106 | RAW | +20 ft |
| 11 | Circle of the Stars 10, Twinkling Constellations: konstelasi Dragon aktif memberi Fly Speed 20 ft dan melayang | Toggle `stars-dragon` | PHB 2024 p. 89 | RAW | Fly 20 |
| 12 | Feat Charger: tiap aksi Dash, Speed naik 10 ft | Toggle `charger-dash` | PHB 2024 p. 202 | RAW | Speed 30: 40 |
| 13 | Dragonborn 5, Draconic Flight: Bonus Action, Fly Speed sama dengan Speed 10 menit, sekali per Long Rest | Toggle `draconic-flight`. Baris resource sudah ada | PHB 2024 p. 187 | RAW | Speed 30: Fly 30 |
| 14 | Goliath 5, Large Form: Bonus Action, Large, Advantage di check Strength, Speed naik 10 ft, 10 menit, sekali per Long Rest | Toggle `large-form`, `speedAdd` 10 dan catatan Advantage. Ukuran Large tidak diubah (tidak ada aturan sheet yang membaca ukuran di toggle) | PHB 2024 p. 192 | RAW | Speed 35: 45 |

Tidak diisi: Elixir of Flight Alchemist (Fly Speed 10, 20, 30 menurut level, hasil acak Experimental Elixir), Totemic Attunement Eagle 2014 (butuh kunci pilihan totem), Scout Superior Mobility untuk Climb dan Swim (Speed mode sudah memakai kata `speed` sehingga ikut naik bila ada), kalimat "move up to half your Speed" (bukan angka sheet, jarak dari keputusan meja).

### RESOURCE

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Sumber | Status | Contoh angka |
|---|---|---|---|---|---|
| 15 | Relentless Rage: tiap pakai sesudah yang pertama menaikkan DC 5 | Baris resource "Relentless Rage", 4 kotak, satu kotak per pakai. DC yang harus dilempar = 10 + 5 kali kotak yang sudah terpakai | PHB 2024 p. 53 | RAW. Tidak ada batas pakai di buku, 4 kotak adalah batas tampilan (DC 25) | Pakai ketiga: DC 20 |
| 16 | Relentless Rage: DC kembali ke 10 sesudah Short atau Long Rest | `reset: short` (juga terisi lagi saat Long Rest) | PHB 2024 p. 53 | RAW | - |
| 17-25 | Divine Strike domain Cleric, level 8: sekali per giliran, kena senjata, +1d8 (jenis menurut domain), level 14: 2d8 | Catatan `atkDice` di baris senjata, dua entri (level 8 dan level 14, jadi dua dadu 1d8 seperti Blessed Strikes). Life Radiant, Nature Cold atau Fire atau Lightning (pilihan), Tempest Thunder, Trickery Poison, War jenis senjata, Death Necrotic, Order Psychic, Twilight Radiant, Forge Fire | Teks data 2014 (PHB 2014, DMG 2014, XGE, TCE), `wotc09-subclasses-2014.js` | RAW. Blood Domain (TDCSR) sudah punya dadu 1d8, dadu kedua level 14 hilang dan ditambah | Level 8: +1d8, level 14: +1d8 +1d8 |

Tidak diisi: baris resource yang sudah ada tetapi ditandai gate (muatan item: `Wand of Magic Missiles` 7, `Staff of Healing` 10, dan lain-lain punya baris resource dengan `rg` dan `when` untuk pulih sebagian saat fajar). Aturan tukar slot dan Sorcery Points (Font of Magic, Wild Resurgence, Archdruid, Mantle of Majesty) tetap catatan teks atau aksi karena butuh keputusan pemain, bukan angka tetap.

### PROF

| No | Temuan | Tafsir | Sumber | Status |
|---|---|---|---|---|
| 26 | Sembilan subclass dan dua feat menawarkan DUA pilihan skill untuk satu aturan "pilih satu skill": Nature, Order, Peace, Apocalypse, Darkness, Mountain, Travel Domain, Cavalier, Samurai, feat Squat Nimbleness dan Inspirational Caster. Satu pilihan dari builder atau `fx-L10.js`, satu lagi dari `fx-N1.js` | Pilihan dobel dari `fx-N1.js` dihapus. Hasil uji: dua skill proficiency menjadi satu | Teks data tiap subclass dan feat (kalimat "pilih satu skill", satu proficiency). Halaman tidak dicatat di data | Cacat data. Sheet lama yang sudah memilih dua tetap memuat nilai pilihan kedua di `B.ch` (kunci `gx-sk-...`), nilainya tidak dipakai lagi dan tidak dihapus (tidak ada migrasi data) |

Selain itu ratusan kalimat PROF yang ditandai gate sudah dihitung sheet lewat data kelas (SUB_GRANT, pilihan builder p3skill, p2expertise, feat Resilient dan lain-lain). Feat Woodwise (tp15-thhw.js) berbeda: pilihan bawaan data feat (kunci `woodwise_sk`) tidak memberi proficiency apa pun, pilihan `fx-N1.js` adalah satu-satunya yang bekerja, jadi dibiarkan (permintaan 8). Sebelas subclass dicek langsung di sheet (Alchemist, Armorer, Artillerist, Battle Smith, Cartographer, Swords, Mercy, Drunken Master, Mastermind, Scout, Kensei) tanpa menemukan proficiency yang hilang. Kalimat gate untuk itu adalah false positive (permintaan 1 ke Checker).
