# T5 High tech: laporan sementara (2026-10-27)

Branch t5-high-tech (lokal, belum di-push karena Vercel kena batas deploy). Dasar: main 697842a.

## Audit efek ganda
| Temuan | Tindakan | Bukti |
|---|---|---|
| Keyframes miShine ditulis dua kali (CSS 19 dan 20, hanya yang kedua dipakai) | Hapus yang pertama | build lolos, off_mode lolos |
| Keyframes miARise, miAFall, miALeaf tidak dipakai di CSS maupun JS | Hapus | grep 0 rujukan |
| Jejak percikan kursor (fx/19 G4): pool dibuat 0 kali, handler pointermove langsung return, CSS .mi-trail tidak terpakai | Hapus semuanya | scenarios 24/24 |
| Dua AudioContext (suara efek fx/16 dan musik fx/19) | Satu konteks bersama lewat MI.ac() di inti efek | tests/audio_ctx.py: sebelum 2, sesudah 1 |
| Empat listener klik pada #dmgBtn (suara, jurnal, goyang layar, prompt konsentrasi) | Tidak diubah. Tujuannya berbeda, bukan efek ganda | dibaca satu per satu |

## Belum dikerjakan
| Butir | Catatan |
|---|---|
| Popover API dan anchor positioning untuk menu dan tooltip | Menu More memakai kelas .open di CSS .more-grp, tata letaknya inline di layar lebar. Perlu uji visual tiap lebar |
| @starting-style untuk masuknya menu, toast, kartu | Perlu uji visual |
| Scene WebGL langit di Worker (OffscreenCanvas) | Perlu GPU nyata untuk menilai |
| Peta suara dan getar konsisten | Perlu daftar aksi dan pilihan Anda |

## Catatan
Gerbang T5 adalah audit kode tanpa efek ganda. Dua butir efek ganda yang nyata sudah dibersihkan. Butir sisanya adalah fitur baru dan butuh penilaian visual di perangkat Anda.
