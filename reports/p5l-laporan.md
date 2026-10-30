# P5l: Deep Magic dan Humblewood (aturan 2014)

Hasil
- Deep Magic (tkdm, 14 file sumber digabung): 773 mantra unik, 72 subclass (25 nama grup E, Wizard dan Cleric masing-masing banyak), 33 feat, 4 background, 29 item plus 1 varian (Dagger of Wounding).
- Humblewood (thhw, Campaign Setting dan Tales): 10 spesies dengan 12 subras sebagai opsi lineage, 7 subclass, 11 feat, 3 background, 11 mantra, 45 item dan 18 gear.
- Fitur pilihan Rune, Hieroglyph, Elemental Mastery, Pact Boon, Invocation dan Traveler's Trick dipasang sebagai pick pada subclass atau feat pemiliknya.
- Generator: sekolah Clockwork dan Void ditambahkan. Teks mantra boleh berupa string tunggal atau pasangan [ringkasan, penuh].
- Tes baru tests/tp_p5l.py: 75 cek.
- GAP baru: 0 untuk kedua buku. Sisa hanya baris "reference only" (monster, deity, variant rule, itemGroup) untuk tahap Q.

Hal yang mesin tidak bisa ungkapkan (teks saja)
- Mantra bernama sama dengan dua versi sumber (sekitar 60 nama, misal Drown, Curse of Incompetence, Insightful Maneuver). Satu entri per nama, versi pertama dipakai.
- Daftar expanded spells tipe "expanded" tidak dibaca generator (Void Speaker, Great Machine).
- Pelacak dengan max = modifier ability di lu subclass (Arcane Prescience, Befuddling Touch, Ward of Shadows).
- Pilihan skill atau bahasa "A atau B" dari subclass hanya catatan.
- Subclass Elementalist dan Ring Warden memunculkan fitur ganda dari dua sumber.
- Feather Robe dan Feathered Helm: lima varian ras dalam satu baris.
- Leyline Magic menggabung tujuh terrain jadi mantra selalu siap.
- Sumber rusak yang ditulis ulang dengan asumsi: Raptor Woodland Hunter, Cat Domain Divine Strike, Staff of Violet Fire (dua efek, bukan tiga).
