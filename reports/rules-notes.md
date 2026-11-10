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

## Zero miss 3: ADV, RES, SPELL (`src/data/fx-Z3.js`)

Semua tafsir di bagian ini hanya dari teks data aplikasi dan ingatan. Belum dicocokkan ke halaman buku (folder `books/` tidak ada). Naufal bisa mengecek kolom "Tafsir" ke buku PHB 2024. Kata "toggle" berarti baris keadaan main di sheet (fx toggle). Baris Note tanpa toggle berarti aturan yang selalu berlaku dengan syarat di kalimatnya.

### ADV (advantage)

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Status |
|---|---|---|---|
| 1 | Bard 7 Countercharm: Reaction, diri sendiri atau makhluk dalam 30 ft yang gagal save Charmed atau Frightened mengulang save dengan Advantage | Note di Defenses, hanya build 2024 (`ed:"2024"`). Teks 2014 beda (Advantage untuk sekutu selama aura) | Teks data, belum dicek ke buku |
| 2 | Rogue 18 Elusive: serangan terhadap Anda tidak bisa punya Advantage kecuali Anda Incapacitated | Note, dua edisi (teks 2014 sama artinya) | Teks data |
| 3 | Rogue 3 Steady Aim (2024): Bonus Action, Advantage di serangan berikutnya giliran ini bila belum bergerak, Speed jadi 0 | Toggle `steady-aim`, advOn dan Note Speed 0. Syarat "belum bergerak" tertulis di teks, tidak dihitung engine | Teks data |
| 4 | Innate Sorcery (2024): DC spell Sorcerer naik 1 dan Advantage di attack roll spell Sorcerer | Toggle `innate-sorcery` (id sama dengan Bear Witness Apocalypse Sorcery, jadi keduanya menyala bersama, memang satu keadaan). `spDc:1` kelas Sorcerer, advOn | Teks data |
| 5 | Wild Heart 3 Rage of the Wilds: Wolf, sekutu menyerang dengan Advantage terhadap musuh dalam 5 ft dari Anda | Toggle `wild-wolf`, Note. Pilihan Eagle (Dash dan Disengage dalam satu Bonus Action) tidak diberi model karena tidak ada angka | Teks data |
| 6 | Zealot 10 Zealous Presence: sampai sepuluh makhluk memiliki Advantage di attack roll dan save sampai giliran berikutnya | Toggle `zealous-presence`, Note (yang diuntungkan sekutu, bukan Anda) | Teks data |
| 7 | Champion 18 Survivor, Defy Death: death save punya Advantage dan hasil 18 sampai 20 dihitung 20 | advOn "Death Saving Throws" (masuk juga ke baris Saving Throws) dan Note 18 sampai 20. Heroic Rally sudah ada di data lain | Teks data |
| 8 | Glory 20 Living Legend: Advantage di semua check Charisma, reroll save gagal dengan Reaction, ubah serangan senjata meleset jadi kena sekali per giliran | Toggle `living-legend`, advOn dan dua Note | Teks data |
| 9 | Vengeance 20 Avenging Angel: musuh yang Frightened oleh Frightful Aura diserang dengan Advantage | Toggle `avenging-angel` (dipakai bersama baris Flight di `fx-Z2.js`), Note | Teks data |
| 10 | Trickery 3 Blessing of the Trickster: Advantage di Stealth untuk diri sendiri atau satu makhluk | Toggle `trickster-blessing`, advOn. Untuk makhluk lain tidak ada baris | Teks data |
| 11 | Trickery 3 Invoke Duplicity, Distract: Advantage di serangan terhadap makhluk yang bisa melihat ilusi bila Anda dan ilusi dalam 5 ft darinya | Toggle `invoke-duplicity`, advOn | Teks data |
| 12 | Moon 10 Moonlight Step: attack roll berikutnya giliran ini punya Advantage | Toggle `moonlight-step`, advOn | Teks data |
| 13 | Warrior of Shadow 6 Shadow Step: serangan melee berikutnya sebelum giliran selesai punya Advantage | Toggle `shadow-step`, advOn | Teks data |
| 14 | Glory 3 Peerless Athlete: 1 jam Advantage di Acrobatics dan Athletics | Toggle `peerless-athlete`, advOn. Tambahan jarak lompat 10 ft tidak dihitung | Teks data |
| 15 | Vengeance 3 Vow of Enmity: Advantage di serangan terhadap makhluk yang disumpah | Toggle `vow-of-enmity`, advOn | Teks data |
| 16 | Clockwork 14 Trance of Order: serangan terhadap Anda tidak bisa memakai Advantage dan d20 hasil 9 atau kurang dihitung 10 pada D20 Test | Toggle `trance-of-order`, dua Note | Teks data |
| 17 | Wild Magic 3 Tides of Chaos: Advantage di satu D20 Test, dipilih sebelum lemparan | Toggle `tides-of-chaos`, advOn. Pemulihan lewat slot sudah di baris resource | Teks data |
| 18 | Great Old One 6 Clairvoyant Combatant: makhluk yang gagal save menyerang Anda dengan Disadvantage dan Anda menyerangnya dengan Advantage. Pulih saat Short atau Long Rest atau dengan satu slot Pact Magic | Toggle `clairvoyant-combatant`, advOn dan dua Note. Baris resource lama (`Short Rest`) tidak diubah | Teks data |
| 19 | Feat Crusher, Enhanced Critical: critical Bludgeoning memberi Advantage pada semua serangan ke makhluk itu sampai awal giliran berikut | Note (efek untuk seluruh tim, tanpa toggle) | Teks data |
| 20 | Trickery 17 Improved Duplicity: Advantage untuk Anda dan sekutu di dekat ilusi | Tidak diubah, sudah ada di Situations | Sudah ada |

Situations (`src/app/34-ui-situations.js`, tabel `window.__sit`) sudah memberi 68 baris keadaan main dengan Advantage (Reckless Attack, Studied Attacks, Precise Hunter, Actor, Grappler, Mounted Combatant dan lain-lain). Pengukur membaca tabel itu sebagai bukti sheet. Tidak ada baris Situations yang ditambah (file milik UI).

Sengaja tidak diberi baris (by_design di `tests/zero_miss_baseline.json`): Stunning Strike (efek pada target), Restore Balance (meniadakan Advantage atau Disadvantage di roll makhluk lain), Wild Magic Surge (tabel acak).

### RES (resistance dan immunity)

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Status |
|---|---|---|---|
| 21 | Monk 18 Superior Defense (2024): 3 Focus Points, 1 menit Resistance ke semua damage kecuali Force | Toggle `superior-defense`, 12 jenis (semua kecuali Force). Biaya Focus Points tidak dipotong otomatis | Teks data |
| 22 | Wild Heart 3 Rage of the Wilds, Bear: selama Rage Resistance ke semua damage kecuali Force, Necrotic, Psychic, Radiant | Toggle `wild-bear`, 9 jenis. Dipilih tiap Rage, jadi bukan pilihan builder (sama dengan Falcon di `fx-Z2.js`) | Teks data |
| 23 | Stars 14 Full of Stars: selama Starry Form Resistance ke Bludgeoning, Piercing, Slashing | Toggle `starry-form` (id baru, baris Archer yang sudah ada tidak berubah) | Teks data |
| 24 | Elements 17 Elemental Epitome: pilih Acid, Cold, Fire, Lightning atau Thunder, Resistance ke jenis itu selama Elemental Attunement, boleh diganti tiap awal giliran | Pilihan builder `gx-epitome-sub-Warrior of the Elements` (satu jenis, bisa diubah di builder) dan toggle `elem-attune` yang sudah dipakai Stride of the Elements. Mengganti jenis tiap giliran berarti mengubah pilihan | Teks data. Alternatif: lima toggle (lebih ramai) |
| 25 | Hunter 15 Superior Hunter's Defense (2024): Reaction, Resistance ke damage yang baru diterima dan damage sejenis sampai akhir giliran | Note (jenis damage tergantung serangan, tidak bisa jadi daftar tetap) | Teks data |
| 26 | Boon of the Night Spirit, Shadowy Form: di Dim Light atau Darkness Resistance ke semua damage kecuali Psychic dan Radiant | Toggle `shadowy-form`, 11 jenis | Teks data |

Sengaja tidak diberi baris (by_design): Elemental Adept dan Poisoner (mengabaikan resistance milik target), entri tabel Wild Magic Surge.

### SPELL

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Status |
|---|---|---|---|
| 27 | Warlock 20 Eldritch Master: Magical Cunning memulihkan semua slot Pact Magic | Note. Angka "Regain up to N Pact slots" di baris Magical Cunning (`16-logic-feature-numbers.js`) tidak berubah | Teks data |
| 28 | Slot level 5 memulihkan Holy Nimbus, Living Legend, Avenging Angel, Elder Champion | Tag baris resource menjadi "Bonus Action, or a level 5 slot" (`LU_X` di `src/data/db4/02-limited-uses-damage-rows-save-notes.js`). Pemulihan tetap manual dengan titik | Teks data |
| 29 | Slot Pact Magic memulihkan Hurl Through Hell dan Beguiling Defenses | Tag "On hit, or a Pact slot" dan "Reaction, or a Pact slot" | Teks data |
| 30 | Elder Champion (Ancients 20): musuh dalam aura save melawan spell dengan Disadvantage, pulih 10 HP tiap awal giliran, spell berwaktu action bisa jadi Bonus Action | Toggle `elder-champion`, tiga Note | Teks data |
| 31 | Boon of Spell Recall, Free Casting: tiap memakai slot level 1 sampai 4 lempar 1d4, slot tidak terpakai bila hasil sama dengan level slot | Note | Teks data |

Sengaja tidak diberi baris (by_design): Divine Order Thaumaturge dan Primal Order Magician (cantrip tambahan dihitung builder lewat pilihan `p1opt`), Improved Blessed Strikes Potent Spellcasting (ada di `fx-L1.js` di balik pilihan `p7opt`, diuji), Ranger Fighting Style Druidic Warrior (feat sendiri), Ritual Adept (tag Ritual di baris spell), Oceanic Gift (efek ke sekutu).

Hanya build 2024 untuk Countercharm, Steady Aim, Innate Sorcery, Superior Defense dan Eldritch Master. Alasan: nama fitur sama di tabel kelas 2014 dengan teks lain atau tidak ada. Entri subclass memakai nama subclass 2024, jadi edisi 2014 (`Oath of Vengeance (2014)` dan sebagainya) tidak terpengaruh. Versi 2014 dari fitur ini (Wild Magic, Clockwork Soul, Circle of Stars dan lain-lain) belum diisi.

## Zero miss 4: triase 37 fitur hilang dan edisi 2014 (`src/data/fx-Z4.js`)

Semua tafsir di bagian ini hanya dari teks data aplikasi dan ingatan. Belum dicocokkan ke halaman buku (folder `books/` tidak ada). Kolom "Tafsir" bisa dicek Naufal ke buku.

### 2024: efek yang benar-benar kurang (diisi)

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Status |
|---|---|---|---|
| 1 | Paladin 2 Paladin's Smite: Divine Smite 2d8 Radiant, +1d8 lawan Fiend atau Undead, +1d8 per level slot di atas 1 | Note, ed 2024 | Teks data |
| 2 | Ranger 20 Foe Slayer: Hunter's Mark memakai d10 | Note, ed 2024 | Teks data |
| 3 | Ranger 10 Tireless: 1d8 + Wis Temp HP, Exhaustion turun 1 tiap Short Rest | Dua Note dan tag baris resource "Magic action, 1d8 + WIS Temp HP", ed 2024 | Teks data |
| 4 | Rogue 7 Reliable Talent: d20 9 atau kurang dihitung 10 pada check dengan skill atau tool yang dikuasai | Note, dua edisi (teks sama) | Teks data |
| 5 | Valor 3 Combat Inspiration: die menambah AC atau damage makhluk pemegangnya | Dua Note (efek ke makhluk lain, bukan AC karakter) | Teks data |
| 6 | Glory 3 Inspiring Smite: 2d8 + level Paladin Temp HP dibagi dalam 30 ft | Note | Teks data |
| 7 | Glory 15 Glorious Defense: bonus AC sebesar Cha (minimal +1) untuk target serangan | Tag baris resource "Reaction, +CHA to AC (min +1)" | Teks data |
| 8 | Wild Magic 6 Bend Luck: 1d4 ditambah atau dikurangi ke d20 makhluk lain | Note | Teks data |
| 9 | Evoker 14 Overchannel: pakai kedua dst. memberi 2d12 Necrotic per level spell, naik 1d12 tiap pakai | Note dan tag "Damage spell, maximum damage" | Teks data |
| 10 | Stars 3 Starry Form, Dragon: d20 9 atau kurang dihitung 10 untuk Int, Wis, Concentration | Toggle `stars-dragon` (id sama dengan Twinkling Constellations, satu keadaan), Note | Teks data |
| 11 | Stars 6 Cosmic Omen 1d6, Archfey 3 Steps of the Fey 1d10 Temp HP, Fiend 6 Dark One's Own Luck 1d10, Boon of Fate 2d4 | Tag baris resource | Teks data |
| 12 | Feat Grappler Fast Wrestler, Chef Replenishing Meal 1d8, Interception 1d10 + Proficiency Bonus | Note | Teks data |

### 2024: bukan hilang, salah baca pengukur (aturan klasifikasi, bukan pengecualian per fitur)

| Aturan baru | Fitur yang terdampak |
|---|---|
| "weapons you're proficient with" dan "Initiative Proficiency" bukan pemberian proficiency | Weapon Mastery (3 kelas), Alert, Weapon Master, Reliable Talent |
| Weapon Mastery punya kelas sendiri MASTERY, d20 floor punya kelas D20 | sama di atas |
| "roll 1d6 to decide" atau "on the ... table" untuk tampilan (Star Map, Feywild Gifts, Manifestations) bukan dadu permainan | Star Map, Fey Wanderer Spells, Clockwork Spells |
| Sheet sudah punya efek tetapi di balik pilihan atau gear: pengukur membangun varian | Improved Elemental Fury (Primal Strike), Aspect of the Wilds (Panther, Salmon), Medium Armor Master (Breastplate, Dex 16), Dazzling Footwork (tanpa armor, Cha tinggi), Martial Weapon Training (Wizard) |
| Pilihan feat yang dibiarkan kosong oleh quick fill diisi dengan opsi pertama | Keen Mind, Observant, Weapon Master |
| Baris sheet bernama lain | Pact Magic muncul sebagai baris "Pact Slots" |
| Fitur dengan nama sama di dua level diuji di tiap level | Improved Brutal Strike |
| Mode `ac.dex = max3` adalah aturan Medium Armor Master | Medium Armor Master |
| Baris `speeds` (Panther, Salmon) dibaca | Aspect of the Wilds |

Efek 2024 yang tidak bisa dihitung sheet (design): Wild Shape (stat block Beast), Wild Magic Surge (tabel acak, dua kelas).

### 2014: yang diisi

Semua entri kelas 2014 memakai `ed:"2014"` karena tabel kelas 2024 punya fitur bernama sama. Catatan engine: handler `gate-edition` kini juga membuang entri `ed:"2014"` pada build 2024.

| No | Kalimat (ditulis ulang) | Tafsir yang dipakai | Status |
|---|---|---|---|
| 13 | Bard 6 Countercharm: performa, Advantage di save lawan Frightened dan Charmed untuk Anda dan sekutu 30 ft | Toggle `countercharm`, advOn | Teks data |
| 14 | Bard 2 Song of Rest: extra d6 (d8, d10, d12 di level 9, 13, 17) | Note dengan seluruh skala | Teks data |
| 15 | Paladin 2 Divine Smite (2014): 2d8, maksimum 5d8, 6d8 lawan Undead atau Fiend | Note | Teks data |
| 16 | Ranger Favored Enemy Advantage Survival dan Int, Land's Stride Advantage save lawan tumbuhan | advOn | Teks data |
| 17 | Monk 18 Empty Body: Resistance semua kecuali Force, Invisible, Astral Projection 8 ki | Toggle `empty-body` | Teks data |
| 18 | Totem Warrior: Wolf (sekutu Advantage), Aspect Bear (Advantage Str check), Eagle (Fly sama dengan Speed saat Rage) | `when` di pilihan `p3tot14`, `p6tot14`, `p14tot14`, toggle `totem-eagle` | Teks data |
| 19 | Valor Combat Inspiration, Knowledge of the Ages, Preserve Life (5 x level), Dampen Elements, Wrath of the Storm 2d8, Combat Wild Shape 1d8 per level | Note | Teks data |
| 20 | Trickery Blessing dan Invoke Duplicity, Way of Shadow Shadow Step, Devotion Holy Nimbus, Vengeance Avenging Angel (musuh Frightened) dan Vow of Enmity, Arcane Trickster Versatile Trickster | Toggle dengan advOn atau Note. Id toggle dipakai bersama dengan versi 2024 | Teks data |
| 21 | Oathbreaker Dread Lord 4d10 dan 3d10 + Cha | Toggle `dread-lord`, Note. Angka 3d10 dari teks data yang terpotong, perlu cek buku | Perlu cek buku |
| 22 | Hunter: Colossus Slayer 1d8, Escape the Horde, Multiattack Defense +4 AC | `when` di `p3hunt14a`, `p7hunt14b`. Steel Will sudah ada di `fx-L12.js` | Teks data |
| 23 | Assassin Assassinate, Draconic Elemental Affinity, Wild Magic Bend Luck 2 sorcery points, Fiend Hurl Through Hell 10d10, Great Old One Entropic Ward, Abjuration Arcane Ward, Evocation Overchannel | Note (Entropic Ward juga advOn) | Teks data |
| 24 | Feat Alert (hidden attacker), Defensive Duelist, Healer, Polearm Master 1d4, Dual Wielder +1 AC | Note. Dual Wielder toggle `dual-defense` dengan `acAdd:1` | Teks data |

### 2014: design (tidak dimodelkan, alasan di baseline)

Wild Shape dan Wild Shape Improvement (stat block Beast), Magical Secrets baris kedua (pilihan spell yang sama, **belum dicek ke buku**), Pact Boon (Pact of the Talisman bukan pilihan builder, perlu keputusan Data), Nature's Sanctuary (efek pada penyerang), Extra Elemental Discipline (pilihan builder), Ranger's Companion tiga ukuran (stat block pendamping), Command Undead dan Undead Thralls (makhluk lain), Master Transmuter dan Transmuter's Stone (efek sekali pakai dan batu).


## Uncovered 1: kalimat tanpa status (`reports/uncovered-1.md`)

Tidak ada folder `books/`. Semua angka dan level di bawah dicocokkan ke teks fitur di app (`src/data`) dan ke hasil sheet lewat tes. Tidak ada yang diklaim cocok ke buku.

### Bacaan yang dipakai

| Soal | Bacaan harfiah yang dipakai | Status |
|---|---|---|
| Aura of Protection, Aura of Courage, Aura of Warding (kalimat "you and your allies") | Sheet menghitung bagian "you". Sekutu tidak dilacak. Kalimat dianggap tertutup untuk bagian diri sendiri | Belum diputuskan: apakah sheet perlu catatan untuk sekutu |
| Thought Shield (Great Old One 2024) | Resistance Psychic dihitung. Damage Psychic yang dipantulkan ke penyerang adalah pemicu dan tidak dihitung | Belum diputuskan |
| Iron Mind (Gloom Stalker), cabang "sudah proficient di Wisdom, pilih Intelligence atau Charisma" | Tidak dites (Ranger tidak punya save Wisdom dari kelas, cabang ini hanya muncul lewat multiclass). Kalimat dibiarkan uncovered | Belum diputuskan, perlu tes multiclass |
| "Roll d20 saat charge terakhir dipakai, hasil 1 menghancurkan item" | Info `ROLL:LAST_CHARGE`. Sheet menghitung charge, bukan hancurnya item. Syarat: item punya record charges | Belum diputuskan: apakah sheet perlu mengingatkan lemparan ini |
| Speed makhluk lain (`TARGET:SPEED`) memuat Horseshoes of Speed ("that creature's Speed increases by 30 feet") | Dibaca sebagai Speed hewan tunggangan, bukan Speed karakter | Belum diputuskan |
| Gerak sekali pakai yang diukur dalam Speed ("move up to half your Speed", `MOVE:SPEED_REF`) | Menghabiskan gerak, tidak mengubah nilai Speed | Diputuskan (bacaan harfiah) |
| Spellcasting Focus (`FOCUS:SPELLCASTING`) | Sheet tidak menyimpan focus. "Proficient with" di kalimat itu adalah syarat, bukan pemberian | Diputuskan |
| Teks pilihan Expertise, skill, tool, language (`STD:PICK_TEXT`) | Pick di class (`pick` dengan `k` expertise, skills, tools, languages) adalah recordnya. Kalimat lain di fitur yang sama hanya menjelaskan siapa yang boleh memilih atau apa yang disarankan. Kalimat dengan angka lain (+5) tetap uncovered | Diputuskan |
| Pool charges `[max, regain, reset]` | Tiap bagian menjelaskan satu kalimat. Jumlah yang diulang di kalimat lain ("up to 6") dijelaskan angkanya, bukan kelasnya | Diputuskan |
| Biaya aktivasi "expend 1 of its charges", "(Charge Cost 3)" | Info `FORM:ACTIVATE`. Bonus stat dengan biaya charge tetap uncovered | Diputuskan |
