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
| Scene kelas di belakang sheet | Main dan Skills (HP), Actions juga di PC. PC lebar penuh, HP lebih samar. Kartu tetap solid |
| Scene per tab | Spells, Inventory, Features, Description, Notes, Extras (dan Actions di HP). Dua lapis bergantian, crossfade 0,45 detik |
| Scene langkah Builder | Class mengikuti kelas pilihan, Species dan Background mengikuti pilihan (cadangan scene Builder bila tidak ada gambar), Abilities, Equipment, What's Next. Opasitas 16 persen (22 di PC) |
| Emblem kelas di slot potret kosong | Potret yang user pasang selalu menang |
| Gambar empty state | Home (karakter), item, spell, makhluk. Cadangan: ikon gambar lama |
| Gambar momen | Natural 20, Natural 1 (overlay roll), Level Up, catatan offline |
| Emblem subclass | Library: baris subclass di halaman kelas dan halaman subclass (53 emblem) |
| Ikon spell, senjata, kondisi | Daftar spell, Library Equipment, chip kondisi, inventori |
| Saklar Art di Settings | On atau Off, tersimpan di mi-clsart. Off, kontras tinggi dan cetak menyembunyikan semua gambar ini |

Urutan muat: `fx/23-class-art-data.js` sebelum `app/00-open.wrap.js`, supaya Home pertama sudah punya `window.__ART`.

## Tes
| Tes | Hasil |
|---|---|
| class_art | 22 cek lolos, termasuk ganti scene saat pindah ke Spells |
| builder_art | 14 lolos |
| vignettes | 14 lolos, termasuk roll nat 20 dan nat 1, offline |
| sub_art | 14 lolos |
| scenarios 24, flow 16 | lolos |
| overflow 0, overlap 0, off_mode 0 animasi | lolos |
| build --check | lolos |

## Belum
| Butir | Alasan |
|---|---|
| Vignette state (backup-done, import-failed, saving, storage-full, update) dan momen (death-save, inspiration, level-20, stabilized, subclass) | Belum ada titik pasang yang tepat. Perlu keputusan di mana tampil |
| Scene layar (bastion, combat, journal, rest, party, settings, tour) | Layar itu belum punya lapis latar sendiri |
| Ikon item sihir, school, damage, creature, skill | Ada di manifest, belum dipasang di UI |

## Perbaikan di luar gambar
| Temuan | Perbaikan |
|---|---|
| Skin Record (kertas) mode terang: kartu ringkasan Inventory berlatar gelap dengan teks gelap ("144 lb" nyaris tak terbaca). Ada juga di main sebelum T6 | `.ihero` memakai `--panel-2` di skin selain ddb (css/31-home-hero.css). Terbaca di mode terang dan gelap |

## Audit kontras scene
`python3 tools/scene_contrast.py` memadukan tiap scene pada opasitas tampil di atas warna halaman (skin gelap dan terang), lalu mengukur warna teks terhadap 5 persen piksel terburuk. Batas lulus 4,5.
| Keadaan | Hasil |
|---|---|
| Opasitas lama (PC 0,55, HP 0,40) | 66 dari 292 kombinasi di bawah 4,5. Terburuk 2,64 (barbarian PC gelap) |
| Langkah Builder (0,22 PC, 0,16 HP) | Terburuk 7,9. Lulus |
| Sesudah `--write` (opasitas per scene, 0,38 sampai 0,44) | 0 dari 292 di bawah 4,5. Terendah 4,5 |
Opasitas per scene tersimpan di kunci `o` pada `img/manifest.json` dan `window.__ART`. Jalankan `--write` setelah tiap run `art_pipeline.py`. Scene sheet jadi sedikit lebih samar di PC. Jika terlalu samar menurut selera, pilihan lain: gelapkan hanya area judul.
