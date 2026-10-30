# P5g sampai P5k: Healer, Summoner, Dr Dhrolin's Dinosaurs, Griffon's Saddlebag Book 1, Dark Matter (semua 2024)

## Hasil
| Buku | Isi yang masuk builder dan sheet |
|---|---|
| Healer (tshl) | kelas Healer, 4 subclass, 15 mantra |
| Summoner (tssm) | kelas Summoner, 27 pilihan Evolution, 14 subclass, 10 item, 5 mantra |
| Dr Dhrolin's Dinosaurs (tsdd) | 6 species, 1 subclass Ranger |
| Griffon's Saddlebag Book 1 (tsgs) | 12 subclass, species Feathren, 359 item dan varian |
| Dark Matter (tsdm) | kelas Gadgeteer dengan 7 subclass, 38 subclass untuk kelas lain, 22 background, 10 species, 81 feat, 55 mantra, item dan senjata (48 base item, 9 mastery) |

## Perubahan mesin
- Subclass dengan nama sama di dua buku diberi alias buku: "College of Chronology (Dark Matter)".
- Properti senjata DM-B, DM-C, DM-D, DM-F, DM-R dikenali.
- Gerbang wxClasses membawa kelas milik buku lain saat sebuah buku menambah subclass ke kelas itu.
- Tautan silang: nama spell, monster, dan item sihir di teks mana pun menjadi tautan (sheet dan builder). Lihat tests/xlinks.py.

## GAP yang tersisa (reports/tp-gap.md)
- Subclass Gunslinger Laserist dan Space Cowboy menunggu jalur 2014.
- Monster (14 Summoner, 13 Saddlebag, 125 Dark Matter), 14 aturan varian, itemGroup: referensi saja, untuk tahap Q.
- Mekanik yang mesin tidak punya, hanya teks: Action Points Eidolon, penghitung Healer's Dice per aksi, tether, slot graft, Mega Hit Points, Overheat, bonus bersyarat.
- Skill Data, Piloting, Technology belum ada di daftar skill app, ditulis sebagai catatan.
- Scatter mastery bentrok antar buku, yang dimuat terakhir menang.

## Tes
- tests/tp_p5g.py: 185 cek, 0 gagal (390x844 dan 1250x850).
- tests/tp_sources.py: ditambah 76 kasus subclass baru.
- tests/xlinks.py: 23 cek, 0 gagal.
- Regresi penuh: lihat /tmp/suite_p5g.txt (hasil ditulis di status).
