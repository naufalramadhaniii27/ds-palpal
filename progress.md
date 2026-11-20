# Progres

- 2026-11-19: 0.0.81 builder 10x lebih cepat saat dibuka lagi. Mulai tugas 2.
- Tugas 2 selesai (diukur di dist). Tugas 3 selesai: tests/builder_cost.py di CI bagian 4 dan quick.py engine, ui. Dibuktikan gagal saat bug 0.0.80 dikembalikan sementara.
- Tugas 4 selesai: tools/audit_char.py (--tigor, --sweep, --selftest, FILE.json). Sweep menemukan Expertise dan Improved Brutal Strike ganda; dicek, itu sesuai buku (level dan teks beda), aturan ganda diperketat.
- Sweep audit diperluas ke 19 buku pihak ketiga (1959 build) plus cek sheet kosong dan grup subclass hilang. Total 2229 karakter, bersih, 1 menit 43 detik.
- 0.0.82: libInv 2x lebih cepat dan bisa dicicil di waktu idle saat Search dibuka, skor nama tanpa regex dan dengan bag distance (identik dengan fzScore pada 66.247 nama x 20 kueri). tests/resp_budget.py mengukur semua tap utama.
- 0.0.84: transisi Home ke sheet v2 (View Transition), tombol Home tidak melompat (sy-acct), skeleton Library sama dengan tampilan Recent.
- 0.0.85 (engine): Cunning Strike, edisi baris damage, Expertise Quick Build, 5 item crash, Titan Frame, Boots, species (tanduk, Vect), profisiensi feat, Arcane Trickster, subclass pihak ketiga 2014. Tes baru: xdmg_edition, expertise_picks, item_fx_once, species_fx, feat_profs, quickbuild_rules, subclass_editions (semua di quick.py engine). Sweep audit 2631 karakter bersih.
