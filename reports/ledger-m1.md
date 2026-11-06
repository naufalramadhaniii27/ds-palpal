# Ledger rows unlocked by engine wave 2 (fx engine v5, `src/data/fx-M1.js`)

Base: `reports/ledger-skipped-all.md` (209 rows read, 57 informational, 152 rows that need an engine field). Section numbers below are the sections of that report.

| Section | Field | Rows unlocked | Rows still skipped |
|---|---|---|---|
| 1 Attack row granted | `attackRow` | Boomerang Shield (L3), Claws of the Umber Hulk (L3, L7), Staff of the Adder, Spiked Shield, Storm Sickle, Starmetal Shield (L5, one row), Gurt's Greataxe, Frozen Dagger, Bounty Hunter Enforcer (L3), damage type row of L8 (Light Drinker, Bounty Hunter Enforcer, Ether Spear, Frozen Dagger), Bugbear (2014) Long-Limbed (L9): 8 rows, plus Boomerang Shield inside the L2 row (partial) | Craftsman Masterwork, natural attacks of feats and Experiment X, Flensing Claws (no die in the text), Silver Eagle (no base weapon), Splitter and Solar Axe (forms), Infiltrator's Key, Wand of Orcus, Thornpiercer, Voltedge, Sun Soul, Cyber Katana, Brambleheart, Harp of Valor |
| 3 Dice, type, property | `dieReplace` | The Firm: Contractor, Lucent Destroyer (L2, L4), Ranseur of Torture (L5), Scourge of Shadow (L5), Sun Blade and Sunsword, Sword of Resonance (Finesse), Gurt's Greataxe (L7), Windvane, Oversized Longbow: 10 rows, plus Ranseur and Scourge in the L2 row (partial) | True-Ice Shards, Ruby Rod of Asmodeus, Monstrous Weapon (table not in repo), Silver Eagle (L9), Dragon Mage |
| 4 Resource pool | `slotAdd` | Boon of High Magic (L2, L3), Universalist Arcane Excellence: 3 rows | Focused Fighting, Blessed Reliquary, Spell Dynamos, stage feats, pact progressions, Living Crucible, Big Game Hunter, Jaeger arts |
| 5 Armor and AC | `acCap`, `acArmAb` | Wooden Chain of the Unbroken Circle (L6, L9), Manikin Integrated Gold Plating, Marauder Unbreakable (AC part): 4 rows | Infernal Bulwark, Coalition Recruit, Serpent Scale, Bounty Hunter's Vest, Elven Chain, Mithral Armor, Pigskin Armor, Absolute Chapter |
| 6 Tool Expertise | `toolExpert`, `toolPE` | Finger Picks (L4, L8), Seafarer's Jacket (L5, L9), Green Reaper and Runetagger: 5 rows | Child of Seth, Dwarf (Kaladesh) (tool is a pick), Cobalt Soul, Ring Warden (pick), Alkemancer |
| 7 Attack count, mastery | `pbAdd` | Ioun Stone Mastery (L2, L4): 2 rows | Two-Weapon Fighting off-hand, Shagambi, Obo'laka, Blaster Mods, Githyanki, `ofCls` sub names |
| 8 Exhaustion and locks | `exhLock` | Broken Vow: 1 row | Dämglesvir, Plaguebane Mask, Sun Shades, Cavalier, Heretic invocations, Celestial |
| 9 Speed, reach, size | `reach` | Golem Arms, Dhakaani Guul'dar Long-Limbed: 2 rows | Lilliputian (size down), Extended Barrel and Galepierce (`rangeMul` works, the host weapon is not defined), Boots of Speed, Blood Ascendant |
| 11 Check, save, passive | `chkBonusNp`, `saveProf` | Remarkable Athlete (2014), Vermin Lord, Highway Rider: 3 rows | Tactical Uplink (`passBonus`) |
| 13 Other | `chkBonusNp`, `saveProf` | Battlemind Unbreakable Mind, Logic Unit (L4, L8), Aven Kefnet's Blessing: 4 rows | the other 19 single cases |

Total: 42 rows unlocked and 2 partly (the L2 mixed rows), 110 of the 152 rows are still skipped. Sections 2, 10 and 12 are unchanged (spell filters, item grants, species swap).

Engine fields without a data row yet but covered by unit tests: `rangeMul` (needs the blaster list or a weapon base for Galepierce), `skillBonusNp`, `toolExpert` with a chosen tool (Ring Warden would need a tool pick).

Old note-only entries removed or shortened so a row is not shown twice: Gurt's Greataxe, Frozen Dagger (fx-L4), Sun Blade, Sunsword (fx-L5), Ranseur of Torture (fx-L5, first sentence), Scourge of Shadow (fx-L2), Lucent Destroyer (fx-L2), Golem Arms reach note (fx-L8), tool Expertise notes of Finger Picks (fx-L4), Seafarer's Jacket (fx-L9), Green Reaper and Runetagger (fx-L12). Finger Picks and Seafarer's Jacket now use `toolPE` without `tools` (the same effect: proficiency, or Expertise when already proficient).

Other fixes in this wave
- Field Medic: a character with no spellcasting class showed Charisma as the casting ability; it now follows the feat's own ability (Wisdom). Golden `fx_M1_field_medic_wisdom`.
- Feather Robe class case: already fixed in fx-int (`byOk` ignores case). Not changed.

Known limits of the new fields
- `pbAdd`: the Proficiency Bonus on the sheet follows `C.pbAdd`; the builder counts it through `pbOf()`. Passive scores and DCs follow the new value.
- `exhLock`: the sheet sets Exhaustion to the lock when it is lower. Removing the item does not lower Exhaustion by itself (the player lowers it).
- `toolExpert` only lists the tool (Defenses note, `C.toolExp`); the sheet does not roll tool checks.
- `slotAdd` changes the sheet slot table only. The builder spell step still shows the class table.
