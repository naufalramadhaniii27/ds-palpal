# Update Retromistika (Playtest), 2026-11-03

Sumber: halaman Notion "Valeria's Fieldbook of Retromistika (Playtest)" dan "Public Lore". Teks aplikasi ditulis ulang dengan kata sendiri.

## Ditambah
| Jenis | Isi | File |
|---|---|---|
| Subclass | Circle of the Feathers (Druid), Oath of the Law (Paladin), Khodam Sorcery (Sorcerer) | src/data/hbpack-builtin-homebrew.js |
| Spell selalu siap | Oath of the Law, level 3 sampai 17 | sama |
| Resource | New Order (1 per Long Rest) | sama (LU_X) |
| Daftar aksi | Freeze!, Cruiser, Improved Remote Smite, New Order, Manifest Spirit, Empathic Strike, Rapid Protector, Birds of Paradise | src/data/db4/07-actions.js |
| Stat block (Library > Creatures) | Ahool, Weakened Ahool, Leyak, Toyol, Greater Banaspati, Lesser Banaspati | sama dengan pack |

## Sudah sama dengan halaman
Mistikan, Retron, 7 subclass lama (nama), Bleeding, Burning, Jinxed, skill Automotive dan Computer.

## Lanjutan 2026-11-04 (halaman dibaca ulang lewat Chrome, semua toggle dibuka)
| Item | Hasil |
|---|---|
| Hymns, Mystical Instrumentalist | Kerusakan diubah menjadi Necrotic, mengabaikan Resistance dan Immunity, melewati Temp HP (sebelumnya "lose Hit Points") |
| Pencak Silat | Ditulis ulang sesuai halaman: tambah Dexterous Attacks dan Unarmored Defense (L3), Martial Stances L7 (Reaction, Second Wind, DC, Temp HP), Steel Skin menggantikan Low Fighting Stance (L10), Killing Blow juga untuk Grappled dan tanpa Heavy (L15, termasuk baris FDMG), L18 Paralyzed dan ganti stance gratis |
| School of Modernity, Funky Playlist | Label "Tuned In" dan "In the Groove" dihapus (tidak ada di halaman) |
| Barong, Hymns (selain di atas), Joystick, Aerobics, Leyak Queen, Modernity (selain di atas), 3 subclass baru | Level, nama, dan isi cocok dengan halaman |
| Creatures | Ditambah Banaspati (tengah), Cruiser Motorcycle, Guardian Spirit |
| Daftar aksi | Tidak berubah |

## Belum diverifikasi atau belum ada
1. History dan Society di Public Lore: SELESAI, dicek 2026-11-04. Halaman Public Lore dibaca ulang (toggle History dan Society terbuka). Pembaca di app sudah memuat 8 bagian: A Young World, What to Expect, Origins, Calendar: BC and AD, The Two Reksas, The War and the Peace, Society, Daily Life. Isinya mencakup kalender BC/AD, dua era Reksa, Coalescence, perang 200 tahun, tahun sekarang AD 485, kehidupan harian, ketegangan, dan roh hidup bersama mortal. Tidak ada kalimat 10 kata berurutan yang sama dengan halaman (diuji dengan skrip, run terpanjang 8 kata). Tidak ada singkatan selain BC dan AD, nama era di dunia itu, dan keduanya dijelaskan sekali di teks. Tidak ada perubahan kode.
2. Mesin tidak menghitung angka berikut (hanya teks): Dexterous Attacks dan Unarmored Defense Pencak Silat (pilihan Str atau Dex belum ada di skema acBase), Steel Skin, stance L7 dan L18, bonus AC Circle of the Feathers. Tidak ada fx baru, jadi tidak ada golden build baru.
3. Cunning Eye (Pencak Silat, pilih Perception atau Medicine) tidak ada di halaman sekarang. Dipertahankan karena sheet Yudhi memakainya. Perlu keputusan Naufal.
4. Fitur tetap bernama "Martial Stances" (halaman L7 menulis "Martial Stance", L18 menulis "Martial Stances") agar kunci aksi lama tidak berubah.
5. Misfortune Bringer: aplikasi menulis save "against your spell save DC", halaman tidak menyebut DC.
6. Defensive Stance: "same target" pada halaman ditulis sebagai penyerang yang sama. Perlu konfirmasi penulis.
7. Teks "2014's Version" dicatat saja, tidak dimasukkan (aplikasi 2024 saja): Feathers Avian Shape L2, Oath Remote Smite sekali per giliran, Khodam Manifest Spirit L1, Leyak Queen L1 dan Leyak Form L1 dan Mystical Resilience L6, Modernity fitur L3 jadi L2, Pencak Silat Martial Stance memakai jumlah PB per Short atau Long Rest, plus ancestry 2014 pada Mistikan dan Retron.

## Angka di halaman yang tidak konsisten (keputusan yang diambil)
| Entri | Di halaman | Dipakai | Alasan |
|---|---|---|---|
| Weakened Ahool | CR 6, XP 8,400, PB +4 | XP 2,300, PB +3 | Serangan +7 sudah memakai PB +3. XP 8,400 salin dari Ahool |
| Toyol | CR 1, XP 8,400, PB +4 | XP 200, PB +2 | Serangan +6 dan save +6 memakai PB +2 |
| Leyak | CR 2, XP 400 | XP 450 | Tabel XP 2024 untuk CR 2 |
| Weakened Ahool Bite/Claw | +7 dan damage 10 (2d6 + 3) | sama | Mod STR +4 tidak cocok dengan "+ 3". Disalin apa adanya |
| Toyol Perception | +5, pasif 16 | sama | Pasif 16 tidak cocok dengan +5 (harusnya 15). Disalin apa adanya |
| Khodam, Spiritual Missile | "half as much Force damage equal to d12s" | ditulis "half of the Force damage rolled" | Kalimat sumber ambigu. Perlu konfirmasi penulis |
| Banaspati (tengah), HP | 43 (7d8 + 24) | sama | 7d8 + 24 tidak cocok dengan rata-rata 43 dan CON +2. Disalin apa adanya |
| Cruiser, kecepatan | "30 ft plus ten times Charisma modifier (minimum of ten)" | ditulis "minimum 10" | Tidak jelas apakah minimum berlaku pada tambahan atau total |
| Cruiser Ram | "5 + PB", 9 (1d6 + 5) | sama | Bonus serang = DEX +5 ditambah PB |
