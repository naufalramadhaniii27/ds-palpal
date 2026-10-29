# Inventaris layar dan dialog (disusun dari kode, 2026-10-29)

Sumber: pemanggilan ask(, openSheet(, showEntry type, dan elemen berid yang dibuat lewat JS di src/app, src/fx, src/builder. Status: S = sudah dipotret dan dicek di sesi T10, B = belum, ? = belum yakin cara membukanya.

## Layar utama
| Layar | Status |
|---|---|
| Home (kosong, 1 karakter, banyak karakter) | S kosong dan 1 karakter, B banyak |
| Sheet phone, 9 halaman | S dengan Fighter dan Wizard |
| Sheet lebar, 7 tab | S |
| Builder, 8 langkah (Home, Class, Background, Species, Abilities, Equipment, What's Next, Rules) | S dengan Fighter, B pada caster |

## Panel openSheet (judul dari kode)
| Panel | Status |
|---|---|
| Settings (12 bagian: Ability Scores, Backdrop, Carrying Capacity, Color-blind, High Contrast, Hit Points, Keyboard, One-handed, Portrait Frame, Screen, Spells, Text Size) | S halaman utama, B tiap bagian |
| Hit Points | B |
| Edit (nama karakter) | B |
| Portrait (pilih potret) | B setelah ada art baru |
| Manage Coin | B |
| Rest, Short Rest, Long Rest, Rest Summary | S Rest, B ringkasan |
| Manage Spells | S kelas tanpa spell, B caster |
| Search | S |
| Experience | S |
| Keyboard Shortcuts | B |

## Kartu showEntry (type)
bd (rincian angka), character, check, class, combat, cond, cuq, cust, feat, info, search, select, spell, spman, textarea.
Status: spell dan combat S. Lainnya B.

## Overlay dan jendela yang dibuat lewat JS
| Id | Fungsi | Status |
|---|---|---|
| saveWarn | storage penuh | B |
| recov | pemulihan data | B |
| staleV | data lama di tab lain | B |
| homeV | Home | S |
| bkp | dialog Back up, Restore, Cloud, Friends | S Backup, Cloud, Friends. B Restore berisi |
| chf | dialog di Home (fungsi belum dibaca) | ? |
| party | Party | S |
| lib | Library | S daftar. B semua halaman detail |
| spCards | Print Cards | B |
| rep | Report a problem | B |
| tourC | Tur | B |
| xpBox | XP | S |
| cbOpen | Combat | S |
| hpQm | menu HP cepat | B |
| offNote | catatan offline | B |
| edmBar | bar mode Edit | S |
| pwaUpd | pembaruan app | B |
| qrSend, qrScan | kirim dan pindai QR | B |
| syBan | banner sinkron | S |
| frBar | bar view only | B |
| ctxm | menu konteks | B |
| miPip | mini window | B |

## Dialog ask() (41 dengan teks tetap)
Dikelompokkan dari teks di kode. Semua B.
| Kelompok | Isi |
|---|---|
| Data dan storage | buka app dengan data apa adanya, sheet dan builder berbeda, kembali ke salinan, kembalikan backup, ganti isi dengan file, buka build ini |
| Karakter dan build | ganti build, kosongkan semua nilai build, mulai karakter baru (2 versi), terapkan build ke sheet (3 versi), pulihkan build cadangan, ganti ke Quick Build, ganti aturan, hapus kelas, hapus sumber homebrew, kosongkan perlengkapan awal |
| Sheet | koin dari builder, hapus entri, hapus item, hapus jurnal, set nilai (mode Edit), nilai terhitung berubah |
| Pertarungan | konsentrasi, Rage dengan armor berat (2 versi), pemakaian sumber daya |
| Bastion | hapus fasilitas, hapus defender, perbesar, lepaskan Bastion |
| Library | hapus dari sheet |
| Friends | berhenti follow, blokir, setujui salinan |
| Lain | peringatan Caution di Builder, konfirmasi 'If ...' di pemakaian item |

## Layar dari fitur khusus
Bastion (isi), Creatures (isi), Journal (isi), death saves, Print Cards, ekspor PDF, lembar cetak, Admin (S), What's New, Install app.
Status: Admin S. Lainnya B.

## Kombinasi tampilan
| Kombinasi | Status |
|---|---|
| Skin D&D Beyond dan Record, Light dan Dark | S dengan 2 karakter |
| Tema warna: Forest, Crimson | S. Tema lain B |
| Teks 130 persen | S skin D&D Beyond Dark. B Record |
| High Contrast | S phone D&D Beyond. B lainnya |
| Color-blind, One-handed, Backdrop mati | B |
| Lebar 320 | S Wizard |
| Lebar 768 | B (hanya tes otomatis) |

## Tidak bisa saya tes
Safari iPhone, Android asli, keyboard layar, sentuhan asli, notifikasi.
