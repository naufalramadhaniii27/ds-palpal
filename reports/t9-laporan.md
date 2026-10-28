# T9 Sisa tahap 3, tahap 3b (Friends) dan tahap 4 (potret di D1), rilis 0.0.2 (2026-10-28)

Dikerjakan di branch t7-storage. Rencana: claude/rencana-login-sinkron.md.

## Hasil
| Tahap | Isi |
|---|---|
| 3 sisa | Pengaturan ikut sinkron (gerak, haptik, suara, gambar kelas, pengingat backup), newest wins. Banner "belum ter-backup lebih dari 3 hari" dan "ruang cloud 90 persen", sekali sehari, bisa ditutup. Halaman Admin untuk pemilik app |
| 3b-1 | Profil: nama tampilan, @username, kode teman, bio, jumlah follower. Cari lewat username atau kode, tanpa daftar semua pengguna. Follow, follow balik satu ketuk, unfollow, blokir, buka blokir. Grid karakter (yang di-pin di atas). View only dari kartu |
| 3b-2 | Share lihat saja per karakter: Only me, All friends, Chosen friends. Hanya teman mutual. Pin, izin minta salinan |
| 3b-3 | Request a copy dari view only, pesan maks 140 huruf. Approve atau Decline di tab Requests. Salinan masuk ke karakter peminta lewat sinkron, bertanda "copied from" |
| 3b-4 | Feed: karakter teman yang terbaru berubah, urut waktu |
| 4 | Potret upload dikirim terpisah ke tabel portraits, teks karakter hanya memuat referensi. Potret ikut ke salinan yang disetujui |
| Versi | 0.0.2, What's New berisi 6 butir |

## Notifikasi
Tanpa popup. Titik kecil di tombol Friends dan tab terkait untuk follower baru, permintaan salinan baru, dan share baru. ask() hanya untuk aksi pengguna: unfollow, blokir, approve.

## Beda dari rencana
| Rencana | Kerja nyata | Alasan |
|---|---|---|
| "Shared with me" dan feed di Home | Di dialog Friends, tab Shared dan Feed | Home tetap ringkas. Titik di tombol Friends menandai yang baru |
| Avatar dari karakter favorit | Inisial nama | Potret karakter privat tidak boleh terlihat orang lain |
| Cron harian | Siklus dijalankan request pertama tiap hari UTC | Pages Functions tidak punya Cron |

## Tes
| Tes | Hasil |
|---|---|
| api_social (baru): kode teman, username, follow satu arah, mutual, share, chosen friends, feed, potret, request, approve, decline, unfollow, blokir, prefs | 37 lolos |
| friends_ui (baru), 390x844 dan 1250x850: profil, sharing, cari kode, follow balik, titik, grid, view only tidak menyimpan, request, approve, salinan tiba, blokir | 29 lolos |
| sync_banners (baru) | 9 lolos |
| cloud_sync (ditambah potret dan pengaturan) | 31 lolos |
| api_jwt | 10 lolos |
| Upgrade skema dari database tahap 3 (seperti produksi) | Data lama utuh, kolom baru terisi bawaan |
| Regresi lengkap 28 tes (scenarios, storage_idb, flow_home_sheet, version_label, overflow, overlap dan lainnya) | semua lolos |

## Ditemukan dan diperbaiki
- Banner dan bar view only tidak bisa diklik saat Home terbuka (Home membuat elemen lain inert). Ditambahkan ke daftar pengecualian di 31-ui-tour-and-focus.js.
- Tombol di dialog cloud memakai kelas yang tidak ada (`hbtn`). Diganti `btn press` milik app.
- Peringatan "older version of the builder" dan tombol Build muncul di view only. Disembunyikan.
