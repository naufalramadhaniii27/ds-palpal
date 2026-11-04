# Ledger bin 7: baris yang dilewati (shard 18 dan 19)

| Key | Butuh field engine | Catatan |
|---|---|---|
| item\|skt\|Gurt's Greataxe | ganti dadu senjata (3d12 slashing, +2d12 vs human) | Baris hanya +1 atk/dmg. Dadu dasar greataxe 1d12 tetap salah |
| item\|pota\|Claws of the Umber Hulk | baris serangan baru dari item (Claws 1d8 slashing, proficient, STR) | Hanya burrow 20 yang terhitung |
| item\|pota\|Windvane | tambah properti senjata (finesse) | Bahasa Auran dan 1d6 lightning sudah dikerjakan, finesse belum |

## Catatan spec
- Teeth of Dahlver-Nar: sudah di-FXO null di `fx-D-item.js` (ledger membaca baris mentah). Tidak ada perubahan.
- Gift Devotee: spec menyebut nama spell umum. Spell dan kemampuan dibaca dari teks tiap gift (mis. Nylea's Votary = Speak with Animals, Purphoros's Devotee = Shield of Faith, Thassa's Devotee = Fog Cloud).
- Hazirawn: keadaan tanpa attunement (+1 dan 1d6) tidak dimodelkan, equip item attunement dihitung attuned.
- Keranos's Devotee: 1d6 lightning hanya pool pemakaian (sekali per giliran), bukan atkDice.
- Crawling Gauntlet: teks tidak menyebut kemampuan casting Mage Hand, dipakai Intelligence.
