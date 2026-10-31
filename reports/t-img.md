# T1 and T2: images

| Category | Files in repo | Matched | Token only | No image |
|---|---|---|---|---|
| monster | 4567 | 2607 | 1942 | 18 |
| item | 811 | 598 | 0 | 0 |
| species | 188 | 127 | 0 | 0 |
| class | 189 | 156 | 0 | 0 |
| bg | 99 | 97 | 0 | 0 |
| spell | 91 | 87 | 0 | 0 |
| feat | 43 | 42 | 0 | 0 |
| deity | 148 | 148 | 0 | 0 |
| vehicle | 61 | 61 | 0 | 0 |
| object | 9 | 9 | 0 | 0 |
| deck | 83 | 83 | 0 | 0 |
| recipe | 215 | 215 | 0 | 0 |
| facility | 15 | 15 | 0 | 0 |
| converted files | 6187 | 178258 | 0 | 0 |

Last row: files converted and total KB.

## T0 ukuran dan biaya
- Repo gambar resmi (5etools-mirror-3/5etools-img): 19.535 file, 5.104 petualangan, 3.727 buku, 7.679 bestiary. Diambil hanya folder yang dipakai app: bestiary, items, races, classes, backgrounds, spells, feats, deities, vehicles, objects, decks, recipes, bastions (sekitar 3,3 GB di disk kerja).
- Hasil konversi: 6.187 file WebP, 189 MB di data/img. Art maksimum 480 px, token 128 px.
- Penyimpanan: Cloudflare Pages (folder data di dist). dist 9.534 file, di bawah batas 20.000. R2 tidak dipakai karena upload objek tidak bisa dari sesi ini. Biaya R2 jika dipakai nanti: 189 MB masuk free tier 10 GB.
- Lisensi: sebagian gambar adalah seni berhak cipta WotC dan penerbit lain. App privat di belakang Cloudflare Access. Jika app dibuka ke publik, tinjau ulang.

## T3 entri tanpa gambar
Lihat reports/t3-noimage.json. Angka: monster 18, kendaraan 48, objek 30, item 213, fasilitas 35, feat 70 masuk gelombang Codex (414 gambar, 9 gelombang di Project claude/codex-t4-wave-N.md). Dewa 376, mantra 331, resep 263, bahasa, aturan, tabel, bahaya, penyakit, kultus tidak diberi gambar.

## T4 dan T5
Alat: tools/q/qart.py. Menunggu hasil Codex di branch art-t4.
