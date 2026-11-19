# Rencana kerja ds-palpal

Tujuan: aplikasi lebih cepat dan lebih sedikit bug, dengan bukti angka untuk tiap perubahan.

## Alur per tugas (gabungan plugin)

1. Rencana: catat tugas di file ini (planning-with-files). Satu tugas, satu hasil yang bisa diukur.
2. Telusuri: cari kode lewat typescript-lsp dan `tools/peek.py`, agen code-explorer (feature-dev) untuk area besar.
3. Ukur atau tulis tes gagal dulu: bug = tes gagal (superpowers test-driven-development), lambat = angka `tests/measure.py` atau profil CPU (application-performance, Cloudflare web-perf).
4. Akar masalah: systematic-debugging (superpowers). Cek semua pemanggil sebelum mengubah (ponytail).
5. Perubahan terkecil yang lengkap (ponytail). Data efek lewat fx schema, bukan kode per nama (CLAUDE.md).
6. Bukti: `tests/quick.py --changed`, angka sebelum dan sesudah (verification-before-completion).
7. Review: /review-pr dan silent-failure-hunter (pr-review-toolkit) sebelum PR ditandai Ready.
8. Catat hasil di `progress.md`, temuan di `findings.md`. Commit.

## Tugas

| No | Tugas | Status | Ukuran sukses |
|---|---|---|---|
| 1 | Builder lebih cepat saat dibuka | selesai (0.0.81) | build_warm 3748 -> 412 ms |
| 2 | Tap Build pertama di bawah 3 detik di HP lambat | selesai | bentuk hosting (dist): build_first 2613 ms, build_warm 523 ms (390x844 cpu4x) |
| 3 | Jaga biaya builder di CI | selesai | `tests/builder_cost.py`: jumlah toSheet per layar builder, batas di `tests/builder-cost.json`. Bug 0.0.80 memberi 68, batas 11 |
| 4 | Audit per karakter (`tools/audit_char.py`) | berjalan | menangkap 3 masalah Tigor lama (ASI di grup Feats, Fighting Style di grup Feats, label PHB-2014) pada versi lama |
| 5 | Tes karakter Tono Bakrie | butuh ekspor JSON dari pemilik | |
