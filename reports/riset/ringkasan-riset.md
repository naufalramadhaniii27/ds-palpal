# Ringkasan riset gabungan (2026-10-31)

Lima laporan di folder ini. Tiap laporan menyebut halaman yang benar-benar dibuka dan yang tidak terbukti.

| Laporan | Halaman terbuka | Temuan inti | Batas |
|---|---|---|---|
| kompetitor.md | 22 (18 berguna) | Advantage dan disadvantage tidak otomatis di D&D Beyond (staf menolak 2022, alasannya sumber saling batal). Roll20 2024 punya toggle efek tapi scaling dan resource kustom manual. Foundry otomatis lewat modul pihak ketiga. Shard tidak memodelkan advantage | Demiplane, Aurora, Hero Lab 2024, Lorefire 2024 tidak terbukti. Bukti keluhan pengguna 2025 sampai 2026 tipis |
| skema-efek.md | 17 (ditambah halaman via curl, bertanda) | PF2e (selector, predicate, tipe bonus, ChoiceSet) paling dekat dengan kebutuhan. Foundry punya ScaleValue dan Filters JSON. Predicate JSON bersarang lebih mudah divalidasi daripada formula bebas | 5etools `_copy`/`_mod`, Open5e v2, Borealis, rpg-toolkit tidak terbukti. Aturan "efek bernama sama tidak menumpuk" untuk 2024 belum terbukti. Baris (curl) perlu dibuka ulang lewat WebFetch |
| pengujian.md | 17 | Rancangan tes mutasi untuk tabel data, differential testing terhadap dnd5e-engine (MIT, SRD 2024), 10 metamorphic relation, urutan: fast-check, coverage, mutasi, differential, visual regression | Waktu dan biaya perkiraan. Relasi harus dicek ke PHB 2024 di books/ |
| ux-aksesibilitas-kinerja.md | 20 | Target 24 px, content-visibility (232 ms jadi 30 ms pada contoh), INP, kuota penyimpanan dan persist(), pola combobox dan dialog, Fuse.js dan MiniSearch | Hierarki tombol, gambar besar vs watermark, fokus tampak (2.4.11), gabung tiga arah tidak terbukti |
| lisensi-dan-data.md | 23 (19 berisi) | SRD 5.2 hanya CC-BY-4.0, SRD 5.1 ganda OGL atau CC-BY, Fan Content Policy melarang salin verbatim. Komentar menyebut DMCA 2024 pada mirror 5etools yang menyalin teks buku | Lisensi 5e.tools, repo homebrew, dan 5etools-img tidak terbukti. Bukan nasihat hukum |

## Urutan yang saya usulkan
1. Lisensi: putuskan nasib gambar 5etools-img dan kredit di aplikasi. Keputusan di pemilik proyek.
2. Tes: pindahkan fuzz_rules ke fast-check, tambah tes mutasi (tidak mengubah kode aplikasi).
3. Efek: skema efek deklaratif, mulai dengan pembacaan efek lama (angka sheet harus sama persis di golden_rules).
4. Chip konteks di roll popup (advantage bersyarat), mengisi celah yang belum ditutup D&D Beyond dan Shard.
5. UX: pencarian buku sudah ada. Berikutnya ukur INP dan content-visibility untuk daftar panjang.
