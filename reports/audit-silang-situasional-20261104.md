**Audit silang triase SITUASIONAL pada tests/mech_baseline.json "gaps"**

Tanggal 2026-11-04. Branch claude/w-audit (dari claude/fx-all). Tidak ada kode yang diubah.

**Metode**
- Populasi: 257 key di "gaps". Sampel: `random.seed(2026)`, `random.sample(list(gaps), 80)`, urutan key seperti di file JSON.
- Teks aturan dibaca dari `window.__bldData()` (cf, sub, feats, species, dmgi, wxi). Verdict triase sebelumnya tidak dibaca.
- Cek sheet: build dengan dan tanpa fitur lewat `window.__bldSheetFor` dan `window.__deriveFor`, level 8 sampai 20, lalu bandingkan ac, speed, moves, senses, defenses, saveNotes, itemAdv, initBonus, skill, save, atk. Tabel PADV di src/app/33 dan registri GX ikut dicek.
- Kriteria REAL_MISS: teks menyebut angka atau aturan tetap yang mengubah AC, HP, Speed atau moves, Initiative, save, skill, resistensi atau kerentanan, indra, ukuran, proficiency, daftar atau DC spell, bonus serang, atau inventaris, tanpa pemicu saat bermain, dan sheet tidak menunjukkannya.

**Hasil sampel (n = 80)**

| Kelas | Jumlah |
|---|---|
| REAL_MISS | 7 |
| OK_ALREADY_COUNTED | 4 |
| OK_SITUATIONAL | 69 |

OK_ALREADY_COUNTED: `Assassinate` (Initiative Advantage lewat PADV di app), `Hag Transformation: Stage 1` (Hag Form, AC 13 + Dex tanpa armor, terukur AC 15 pada Wizard level 19), `Ooze Transformation: Stage 1` (Speed 30 jadi 25, Blindsight 30 ft di C.senses), `Aberrant Horror Transformation: Stage 1` (Chitinous Shell dan Slimy Form sebagai toggle GX). Keempatnya masih ada di daftar gaps karena pemeriksa mech_scan mencari nama fitur, sedangkan efeknya terdaftar dengan nama sub-efek atau di tabel app. Artinya daftar gaps juga berisi entri basi.

**REAL_MISS**

| Key | Perubahan yang diharapkan | Bukti teks | Yang tampil di sheet |
|---|---|---|---|
| `item\|dmg\|Ionbreaker, the Tempest's Reach` | Moves: Fly = Speed (30 ft pada build uji), melayang maks 20 ft dari tanah | "Zephyr Step. Fly Speed equal to Speed, hovering within 20 ft of the ground." | Hanya +3 serang dan damage (hit +8, 1d8+5). `C.moves` kosong |
| `item\|tsgs\|Ionbreaker, the Tempest's Reach` | Sama dengan baris di atas (baris duplikat di buku tsgs) | Teks sama | Sama |
| `item\|thhw\|Crown of Daffodils` | Semua skill +1 dan Initiative +1 (Athletics 6 jadi 7, Initiative 2 jadi 3 pada build uji) | "you gain a +1 bonus to ability checks and saving throws" | Hanya save +1 (fx save:1). `D.skill` dan `D.init` tidak berubah |
| `feat\|Lycanthrope Transformation: Stage 2` | Defenses: Vulnerability, Bludgeoning, Piercing, Slashing dari senjata perak | "Silver Sensitivity (Flaw). In every form you are Vulnerable to Bludgeoning, Piercing and Slashing damage from silvered weapons" | `C.defenses` kosong. Engine sudah mendukung tipe Vulnerability |
| `sub\|Monk/Warrior of the Celestial\|Heavenborne` | Moves: Fly = Speed (55 ft pada Monk 17 uji), jatuh jika giliran berakhir di udara | "Limited Flight. You gain a Fly Speed equal to your Speed, but only in short bursts" | `C.moves` kosong, sheet sama dengan Monk 17 tanpa subclass |
| `sub\|Necromancer/Pharaoh\|Mummy Lord [Lichdom]` | saveNotes: Advantage pada save melawan spell dan efek magis | "Magic Resistance. You have Advantage on saves against spells and other magical effects." | Tidak ada `saveNotes` dan tidak ada ADV. Preseden: Gnomish Cunning ada di PADV |
| `sub\|Paladin/Oath of Redemption\|Emissary of Redemption` | Defenses: Resistance ke semua damage dari makhluk lain (hilang per makhluk yang kamu serang) | "You have Resistance to all damage dealt by other creatures." | `C.defenses` hanya berisi Aura of Courage |

Catatan batas: Emissary punya klausa hilang saat menyerang, Heavenborne punya batas "short bursts", dan Crown butuh minimal satu daffodil mekar. Ketiganya tetap saya hitung REAL_MISS karena keadaan awalnya aktif tanpa aksi pemain, dan fitur sejenis (Crown sisi save) sudah dihitung sheet.

**Batas keputusan yang bisa berubah (dihitung OK_SITUATIONAL)**
- `Defensive Tactics` (Vampire Slayer): pilihan opsi dan efeknya spesifik (Advantage lawan paralisis).
- `Draconic Rebirth` (ftd) dan `Personality Module` (tsdm): butuh pilihan yang tidak ada di teks (keluarga naga, dua skill).
- `Thayan Spell Tattoo` (dmg, hof): spell tidak ditentukan di teks. DC 13 dan serang +5 hanya untuk spell itu.
- `Exorcist's Doctrines` (Dogma, d20 9 ke bawah dihitung 10): aturan mengubah dadu, bukan angka. Sama seperti Reliable Talent yang juga tidak tampil sebagai angka.
- `Tumbling` (Acrobat): syarat gaya Dance aktif.
Jika kelima grup ini (7 key) semuanya dinilai REAL_MISS, tingkat luput naik ke sekitar 18 persen. Itu batas atas keputusan saya.

Sisa OK_SITUATIONAL (kira-kira 60 key) punya pemicu jelas: butuh aksi, reaction, rest, spell yang dirapal, mode Wild Shape atau Rage, makhluk pendamping (familiar, eidolon, companion), dadu acak, item yang diaktifkan atau satu kali pakai, atau pilihan yang dibuat saat bermain.

**Perkiraan tingkat luput untuk 257 key**
- Titik: 7/80 = 8,75 persen, setara sekitar 22 key dari 257.
- Interval 95 persen (Wilson): 4,3 sampai 17,0 persen, setara 11 sampai 44 key.
- Dengan koreksi populasi terbatas (80 dari 257): 3,6 sampai 13,9 persen.
- Entri basi (ALREADY_COUNTED): 4/80 = 5 persen, sekitar 13 key di daftar gaps sebenarnya sudah terhitung.

**Saran tindak lanjut (di luar tugas ini, tidak dikerjakan)**
1. Tambah entri GX untuk tujuh key di atas (mv fly, vul, adv, res, chk bonus).
2. Tambah dukungan bonus "ability checks" pada item fx (Crown of Daffodils dan sejenis, termasuk Stone of Good Luck yang teksnya "ability checks and saving throws each get a +1" tetapi tidak masuk gaps karena regex tidak menangkapnya). Cek: Stone of Good Luck juga hanya menaikkan save, skill tidak.
3. Pemeriksa mech_scan sebaiknya juga mengenali entri GX dan PADV dengan nama sub-efek agar gaps tidak berisi entri basi.
