# T6 Immersive: laporan sementara (2026-10-27)

Branch t5-high-tech. Aset dari branch Codex art-batch (snapshot saat fetch). Gambar tidak disalin mentah ke repo. Pipeline tools/art_pipeline.py mengubahnya.

## Temuan penting
art-batch berisi 605 file PNG, 827 MB. Itu penyebab Deployment Storage Vercel penuh (34,58 GB dari 10 GB). Branch itu tidak boleh ikut deploy. Ignored Build Step untuk branch selain main sudah diisi di Vercel.

## Pipeline
| Masukan | Keluaran | Ukuran |
|---|---|---|
| emblems/class (13 PNG 1024 px) | img/emblem/<kelas>.avif 384 px, alpha | 152 KB |
| scenes/class (26 PNG, 4,5 MB rata-rata) | img/scene/<kelas>-pc.avif 1600 px, -phone.avif 720 px | 3,2 MB |
| icons (360 PNG, 540 KB rata-rata) | img/icon/<jenis>/<slug>.avif 128 px | 1,3 MB |
| Total | | 5,3 MB dari sekitar 830 MB |
Data peta (src/fx/23-class-art-data.js) dibuat pipeline. Jalankan ulang pipeline bila Codex menambah gambar.

## Sudah terpasang
| Butir | Tempat |
|---|---|
| Scene kelas di belakang sheet | PC lebar penuh, HP lebih samar. Kartu tetap solid |
| Emblem kelas di slot potret kosong | Potret yang user pasang selalu menang |
| Ikon spell | Daftar spell sheet dan baris Library (133 dari 397 spell punya ikon) |
| Ikon senjata | Baris Library kategori Equipment |
| Ikon kondisi | Chip kondisi aktif |
| Saklar Art di Settings | On atau Off, tersimpan di mi-clsart |

## Tes
class_art 28 cek, scenarios 24/24, flow 16/16, overflow 0, overlap 0, off_mode 0 animasi. axe 0 pelanggaran.

## Belum
| Butir | Alasan |
|---|---|
| Scene species, background, layar, langkah Builder | Hanya sebagian gambar jadi, perlu aturan pemetaan |
| Ikon item sihir, school, damage, creature, skill | Ada di manifest, belum dipasang di UI |
| Scene HP sebagai pita atas | Diganti latar samar penuh, karena pita tertutup header dan kartu |
| Audit kontras per scene | Kartu solid, tetapi belum diukur otomatis |
