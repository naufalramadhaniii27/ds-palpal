# Ledger skipped, bin L6 (shards 15, 16, 17)

| Key | Needed engine field | Why |
|---|---|---|
| item\|dmg\|Wooden Chain of the Unbroken Circle | `acAdd` with an ability cap (for example `acAddMax:2`) | Text: AC bonus equal to the Wisdom modifier, maximum +2. `acAdd:"WIS"` has no cap and would overcount above WIS 14. |
| item\|egw\|Infiltrator's Key (Awakened, Exalted) | attack row for a form-changing item | The +1 attack and damage only applies while the key is a dagger. The key has no weapon row, so the wrong static +atk/+dmg was dropped (FXO null) and the dagger form stays text. |
| item\|dmg\|Thayan Spell Tattoo | spell pick over a level range (1 to 3) and a fixed DC 13 / +5 for non-casters | Done as three optional single-spell picks (one per level). The non-caster DC 13 / attack +5 is not modeled. |
| item\|dmg\|Wand of Orcus | `base:["Mace"]` on the item row | The row has no base weapon, so no attack row exists. The extra 2d12 necrotic shows as a Defenses note instead of on an attack row. |
| item\|dmg\|Thornpiercer, Voltedge | same (no base weapon row) | Extra damage dice appear as a Defenses note. |
| item\|dmg\|Travel Alchemical Kit, item\|dmg\|Thornpiercer, item\|dmg\|Thunderous Flail, item\|egw\|Infiltrator's Key (all tiers), Living Gloves (Thieves' Tools option) | sheet side reading of fx `tools` and `weapons` | SOURCE-NOTES lists both fields, but only `langs` is consumed (`C.profs` ignores them). Data was not written, since it would be inert. Poisoner's Kit, Flail, Thornpiercer weapons and Thieves' Tools proficiency need this. The Living Gloves pick still records the choice. |
| item\|dmg\|Grimoire Infinitus (all tiers) | none | `prepAdd` is written (+1, +2, +3 Wizard prepared spells) and shows in the Builder spell count only. The sheet C has no field to golden-test it. |
