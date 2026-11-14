# Valda 2014: rilis Tigor (0.0.18)

Isi: sumber tvss14 (Valda's Spire of Secrets, aturan 2014). Kelas Warden (2014), subkelas Stoneheart Defender, feat Crippling dan Titan Fighting.

Hasil uji Tigor (tests/valda14_tigor.py, 390x844 dan 1250x850): STR 16, DEX 10, CON 18, INT 8, WIS 14, CHA 10, HP 54, AC 21 (23 dengan Warden's Grasp), save STR +6 dan CON +7, Initiative +2. PDF 4 halaman di reports/valda14/.

Perubahan lintas bagian
- Data: tools/tp_build.py (TP_ONLY, entri tvss14, memakai DataEnv.slot), tools/tp_class.py, overlay tvc14_warden, tvss14_sub, tvss14_feat, src/data/tp16-tvss14.js.
- Logic: wxClasses (kelas buku 2014 hanya muncul di aturan 2014, kembaran 2024 tersembunyi), fs14List membaca fs14 kelas, SRC14 menambah tvss14.
- UI/UX: baris Situasi baru grasp14, mark14, resolve14 (tipe auto), nama grup PDF tanpa akhiran (2014).
- Versi 0.0.18 dan catatan rilis.

Temuan terbuka
- Label sumber di lampiran PDF untuk fitur Warden tertulis "PHB-2014". Seharusnya Valda's Spire. Dikerjakan di rilis berikut.
- Generator tp_build.py tidak identik dengan file tp lama (sudah dipatch manual). Jangan regenerasi file lama.

## 0.0.19: 14 subkelas Warden (2014)
Overlay tools/tp/overlay/tvss14_sub_warden.py. Loreseeker dan Soulblood Shaman jadi third caster lewat THIRD_SUBS (slot 4/3/3/1 di level 20). Generator tp_build.py baru mengeluarkan baris GX.sub (advOn, darkTo, mv) dan THIRD_SUBS. Tes: tests/valda14_warden_subs.py (14 subkelas, semua fitur sumber ada di sheet, slot, skill, terbang).
Catatan: Darkvision Nightgaunt memberi 60 ft, tambahan +30 ft bila sudah punya Darkvision hanya berupa catatan (engine belum mendukung syarat itu).
