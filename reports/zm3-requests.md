# Permintaan ke bagian lain (zero miss 3)

| No | Ke | Permintaan |
|---|---|---|
| 1 | Checker | Pasang `python3 tests/zero_miss_measure.py` di CI sebagai gerbang. Skrip keluar dengan exit 1 bila ada fitur hilang baru atau fitur yang tadinya terpenuhi berubah jadi hilang. Baseline di `tests/zero_miss_baseline.json`. Lama jalan sekitar 1 sampai 2 menit |
| 2 | Checker | `tests/clause_gate.py` menghitung kalimat. Pengukur baru membaca hasil sheet, jadi angka kemajuan zero miss sebaiknya memakai pengukur ini. Gate boleh tetap sebagai alat pencari kalimat, tetapi 6120 uncovered tidak lagi dipakai sebagai kemajuan |
| 3 | Checker | Gate perlu membaca tabel Situations (`window.__sit.table`, `src/app/34-ui-situations.js`) dan toggle fx sebagai atom. Banyak kalimat Advantage sudah dihitung di sana dan tampil uncovered |
| 4 | UI/UX | Toggle baru banyak (Z2 15, Z3 sekitar 20). Daftar toggle di sheet perlu dikelompokkan per fitur atau per kelas supaya tidak panjang. Id toggle Z3: steady-aim, innate-sorcery, superior-defense, wild-bear, wild-wolf, zealous-presence, living-legend, avenging-angel, trickster-blessing, invoke-duplicity, moonlight-step, starry-form, shadow-step, elem-attune, peerless-athlete, vow-of-enmity, elder-champion, trance-of-order, tides-of-chaos, clairvoyant-combatant, shadowy-form |
| 5 | UI/UX | Elemental Epitome: jenis resistance mengikuti pilihan builder (satu jenis). Aturan buku membolehkan ganti jenis tiap awal giliran. Bila UI ingin tombol ganti cepat di sheet, itu pekerjaan UI (kunci `B.ch["gx-epitome-sub-Warrior of the Elements"]`) |
| 6 | UI/UX | Tag baris resource sekarang memuat "or a level 5 slot" dan "or a Pact slot". Bila chip terlalu panjang di 390 px, perlu dipendekkan atau diberi baris kedua |
| 7 | Build tools | Hook uji baru `window.__bldFillFor(b)` (test hook, di `src/builder/25-logic-hooks-for-the-sheet.js`) tidak menyimpan apa pun. Tidak perlu tindakan, hanya info |
