
## Status pekerjaan (diperbarui 2026-10-30, sesi lanjutan)
Branch third-party-all, dipush. Tidak ada rilis.

| Tahap | Status | Laporan |
|---|---|---|
| P0 sampai P2 | selesai | tp-gap.md |
| P3 Valda 2024 kelas yang ada | selesai | claude/p3-laporan.md |
| P4 11 kelas Valda, 134 subclass | selesai | claude/p4-laporan.md |
| P5 semua buku (15 buku, tp01 sampai tp15) | selesai, suite hijau | claude/p5a sampai p5l-laporan.md |
| Cross-link seluruh app (sheet dan builder) | selesai, tests/xlinks.py 35 cek | belum |
| Q0, Q0b, Q1 sampai Q8, R, S, T0 sampai T4, T5, U, V | belum | belum |

Catatan teknis:
- Buku 2014 (Deep Magic tkdm, Humblewood thhw) berlabel "(2014 rules)". Level subclass dijepit ke minimal 3. Spec agen: reports/p5-spec-agen.md bagian P5l.
- Teks mantra overlay boleh string atau [ringkasan, penuh].
- Sekolah Clockwork dan Void ada di SCH tp_build.py.
- GAP tersisa: reports/tp-gap.md (94 baris), sebagian besar "reference only" untuk tahap Q.
- Gunslinger (6 subclass Valda 2024) menunggu kelas dari jalur 2014.
- Mantra bernama sama dengan dua versi sumber: satu entri per nama.
- Kelas buku ketiga: tools/tp_class.py. Alat agen: tools/tp/dump2.py, gapcheck.py.
