# Permintaan ke bagian lain (zero miss 4)

| No | Ke | Permintaan |
|---|---|---|
| 1 | Data | Pact of the Talisman (Tasha, 1d4 pada check gagal) tidak ada di pilihan Pact Boon 2014 (`p3invocation` hanya Blade, Chain, Tome). Putuskan apakah ditambah |
| 2 | UI/UX | Toggle baru 2014 dan 2024 menambah daftar toggle: countercharm, empty-body, totem-eagle, holy-nimbus, dread-lord, versatile-trickster, dual-defense (baru) serta stars-dragon, shadow-step, trickster-blessing, invoke-duplicity, vow-of-enmity, avenging-angel (id dipakai bersama dengan versi 2024). Pengelompokan per fitur masih berlaku seperti permintaan zm3 no 4 |
| 3 | UI/UX | Tag baris resource makin panjang: Boon of Fate "On D20 Test, add or subtract 2d4, also regained when you roll Initiative", Steps of the Fey "Free spell, Refreshing Step 1d10 Temp HP". Cek di 390 px |
| 4 | Checker | `tests/zero_miss_measure.py` kini mengukur dua edisi dan butuh 50 sampai 60 detik. Baseline memuat kunci `measured14`. Gerbang CI cukup memakai exit code |
| 5 | Checker | Kartu aksi (card) tersisa 6: Boon of Energy Resistance, Charger, Defensive Duelist 2024, Poisoner, Polearm Master 2024, Battle Master 2014 (Maneuvers known). Efeknya hanya teks di kartu |
