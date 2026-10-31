# Riset lanjutan dan ide baru untuk logic (2026-10-31)

## Tambahan yang dibaca
| Sumber | Yang diambil |
|---|---|
| Foundry pf2e, panduan rule element | Efek berupa objek JSON: `key`, `selector`, `value`, `label`, `predicate`. Predicate berupa daftar string yang semuanya harus benar, dengan pembungkus and, or, not, nor, nand dan pembanding lt, lte, gt, gte. Nilai bisa angka, rumus, tabel per level, atau ternary. Ada elemen RollOption yang membuat opsi untuk dirujuk elemen lain |
| adv-reminder | Advantage dan disadvantage dari banyak sumber digabung, yang berlawanan saling batal, tiap sumber tampil sebagai pesan, tombol roll yang benar disorot |
| automated-conditions-5e | Aturan bersyarat sebagai flag pada efek, kondisinya dievaluasi terhadap pelaku, target, dan aura |
| codemag, sheet satu HTML offline | State satu objek, nilai turunan tidak disimpan, render ulang dari state, fungsi aturan murni tanpa DOM, 44 px sentuh, tanpa uji otomatis |
| fast-check | Properti diuji dengan input acak, 100 kali per tes, hasil gagal diperkecil (shrinking) sampai contoh terkecil |
| Open5e API v2 | Resource punya `key`, `name`, `document`. Ada endpoint creatures, magic items, classes, species, spells, backgrounds, feats, equipment, rules, conditions. Isi dokumen SRD 2024 dan lisensinya tidak terbukti dari halaman yang dibuka |

Yang gagal dibuka atau tidak terbukti: model modifier D&D Beyond (hanya hasil pencarian forum), dokumen arsitektur Foundry dnd5e.

## Kondisi aplikasi yang relevan
- Roll popup sudah punya tombol Roll, Advantage, Disadvantage, I rolled myself.
- Sheet sudah punya situasi (`S.cond`) dan `cfx()` yang menggabungkan advantage dan disadvantage dari kondisi, membatalkannya, dan menampilkan sumbernya.
- Item punya kunci fx. Advantage save dari item sekarang masuk catatan di bawah Saving Throws.
- Audit `tools/audit_v.py` sudah punya pola regex untuk mendeteksi efek di teks.
- Strukur asal tiap angka sudah ada (breakdown, number map).

## Ide baru (gabungan)
| No | Ide | Gabungan dari | Hasil untuk pengguna |
|---|---|---|---|
| 1 | Buku besar efek (effect ledger): satu daftar efek `{selector, value, when, label, src}` untuk fitur, item, species, feat, kondisi. Efek yang ada sekarang dibaca ke daftar ini tanpa mengubah data tersimpan | PF2e rule element, struk angka milik kita | Satu jalur untuk save, skill, serangan, AC. Tabel berkunci nama fitur bisa dipindah satu per satu |
| 2 | Chip konteks di roll popup: efek bersyarat tampil sebagai chip (misalnya "vs spell", "vs poison", "Raging"). Pemain mengetuk chip yang berlaku, advantage bersih dan alasan sumbernya berubah langsung | adv-reminder, automated-conditions, popup roll yang ada | Advantage bersyarat dari item dan class berguna di meja, bukan hanya catatan teks |
| 3 | Penambang efek (effect miner): skrip build memindai teks fitur dan item dengan pola dari audit_v, membuat usulan efek berpenilaian keyakinan, lalu antrean tinjauan manusia atau agen. Usulan yang diterima masuk data | audit_v, skema efek, peninjauan agen | Menutup temuan audit (Save advantage 48, Immunity 86, Resistance 34, Speed 37, Darkvision 25) dengan kerja tinjau, bukan tulis tangan |
| 4 | Tes mutasi untuk mesin aturan: skrip mengubah satu konstanta di tabel (misalnya save class, kecepatan species), menjalankan golden_rules, dan mencatat mutasi yang lolos tanpa terdeteksi | fuzz, oracle golden, ide fast-check | Angka kepekaan tes: bagian mesin yang tidak dijaga tes terlihat |
| 5 | Panel "Memberi Anda" di Library: tiap entri menampilkan efek terstruktur dari buku besar sebagai chip, lengkap dengan status "sampai ke sheet" atau "catatan saja" | Buku besar efek, Library | Pengguna tahu apa yang otomatis dan apa yang manual. Hasil audit V jadi terlihat |
| 6 | Skema efek tunggal untuk sheet, builder, dan Training Ground: resistance, immunity, advantage monster memakai bentuk efek yang sama | Buku besar efek, reducer Training Ground | Satu mesin, satu set tes |

## Urutan usulan
1. Skema efek dan pembacaan efek lama ke buku besar (hanya baca, tanpa mengubah tampilan). Uji: angka sheet sama persis dengan sekarang di golden_rules 1.001 karakter.
2. Tes mutasi (ide 4). Berjalan paralel, tidak mengubah kode aplikasi.
3. Penambang efek (ide 3) untuk Save advantage dan Resistance terlebih dulu.
4. Chip konteks di roll popup (ide 2).
5. Panel "Memberi Anda" (ide 5), lalu Training Ground (ide 6).

## Risiko dan batas
- Tidak ada perubahan nama key localStorage dan bentuk data tersimpan. Buku besar dihitung dari data buku dan pilihan, tidak disimpan.
- Ide 3 menghasilkan usulan, bukan data final. Peninjauan wajib sebelum masuk.
- Ide 2 menambah satu langkah ketuk di popup. Perlu uji pemakaian di 390 x 844.
- Belum ada prototipe. Semua di atas masih rancangan.

## Sumber
- https://github.com/foundryvtt/pf2e/wiki/Quickstart-guide-for-rule-elements/e1d57184521e63eda4d4ba7df35526efe8250ee9
- https://gh.hhj520.top/kaelad02/adv-reminder
- https://www.foundryvtt-hub.com/package/automated-conditions-5e
- https://www.codemag.com/article/268071
- https://fast-check.dev/docs/introduction/what-is-property-based-testing/
- https://open5e.com/api-docs
