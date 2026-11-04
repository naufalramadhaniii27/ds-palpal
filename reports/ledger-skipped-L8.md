# Ledger skipped, bin L8 (shards 20 and 21)

Rows that need an engine change that does not exist. Key, then the field that is needed.

| Key (item) | Needed |
|---|---|
| Light Drinker (MISMATCH, Cold), Bounty Hunter Enforcer (Bludgeoning), Ether Spear (Force), Frozen Dagger (Cold), Harp of Valor (Thunder arrows) | `atkType:{when,t}`: damage type replacement on a weapon row |
| Pigskin Armor (MISMATCH, light category) | armor category override. AC is fixed (12 + full Dex via `acBase`+`acOver`), but proficiency still follows Medium |
| Blessed Reliquary | `luBump:{match:"Channel Divinity",add:1}`: +1 max on an existing class resource |
| Blaster Mod +1/+2/+3, Dragonfire Break, Vari-Blaster, Blaster for Dummies (proficiency/mastery) | atkBonus `when:"@pick:<k>"` (a bonus that targets one chosen blaster row), plus a weapon proficiency pick |
| Logic Unit (half PB on Intelligence checks without proficiency) | `chkBonus` that skips proficient skills (like Jack of All Trades) |
| Finger Picks (double PB on Thieves' Tools checks) | tool Expertise |
| Sun Shades (blocks Darkvision) | `darkOff:true` (a note is shown instead) |
| Girdle of Traveling Alchemy | auto-added inventory items (counts are tracked as `lu` rows instead) |
| Exo-Frame (two Battlefists) | auto-added inventory items (proficiency is granted) |
| Shagambi, Obo'laka | extra attack on top of Extra Attack, and `attuneAdd` (+1 on the real limit). Shagambi shows a note, Obo'laka sets the limit to 4 |
| Cantrip Module | cantrip pick from the Cleric, Druid or Wizard list with a chosen ability |
| Finger Gun Glove | the Finger Guns cantrip has no row in the spell table, so no spell can be shown |
| Brambleheart Quiver (+2 on the thorned Arrows) | arrows are not attack rows, a note is shown |
| Arcane Carbine spellDc | checked in `C.spellcasting`, see report |

## Spec errors found
- Guidance (Ulmyr's Eye), Ray of Frost (Borealus), Druidcraft (Petal Dancer Ward), Find Familiar (Omenbringer's Mantle) were already carried through `ITEM_SPELLS`. The reviewers only looked at fx.
- Necronomicon Ex Corvis: the text gives no cap of 22, the old row had one. Followed the text.
- Blessed Reliquary, Corvum and other Feather Robes: the old `by` text was lower case, so only Sorcerers could attune. Patched.
- Bloodscryer Oculus: the old row already adds 60 ft to Darkvision, so no new entry.
- Gift rows (Kubazan and the others) count only while equipped in the inventory.
