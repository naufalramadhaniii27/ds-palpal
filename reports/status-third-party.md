
## Status pekerjaan (diperbarui 2026-10-30, sesi lanjutan)
Branch third-party-all, dipush. Tidak ada rilis.

| Tahap | Status | Laporan |
|---|---|---|
| P0 sampai P2 | selesai | tp-gap.md |
| P3 Valda 2024 kelas yang ada | selesai | claude/p3-laporan.md |
| P4 11 kelas Valda, 134 subclass | selesai, suite hijau | claude/p4-laporan.md |
| P5 buku berikutnya | berjalan: Exploring Eberron 2024 dulu | belum |
| Q0 sampai Q8, R, S, T0 sampai T4, U, V | belum | belum |

Catatan teknis untuk sesi berikutnya:
- Kelas buku ketiga: tools/tp_class.py membuat rekaman kelas dari sumber dan overlay tools/tp/overlay/tvsc_<kelas>.py. Gerbang wxClasses di 09-logic. Subclass lintas kelas dibuat satu kali (alt).
- Alat untuk penulis agen: tools/tp/dump.py (baca sumber), tools/tp/gapcheck.py (cek GAP dan gaya), spec di reports/p4-spec-agen.md.
- Kelas tanpa slot memakai nslot dan smax. Cantrip dengan jumlah langkah bebas.
- Gunslinger (6 subclass Valda 2024) menunggu kelas Gunslinger dari jalur 2014.
- Pelajaran: nama subclass bisa sama dengan kata lain di data build (Medium). Deteksi sumber memakai subclass terpilih saja.
