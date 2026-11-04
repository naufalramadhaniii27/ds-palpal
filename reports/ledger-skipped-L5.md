# Ledger L5 (shards 12, 13, 14): rows that need an engine field that does not exist yet

Each row keeps the text note or the partial effect named in the last column. Nothing was hacked around.

| Key (item\|dmg\|name) | Needed field | What the sheet shows now |
|---|---|---|
| Planecaller's Codex, Protective Verses | `bookAdd:[spells]` for items (spells in a spellbook the Wizard may prepare from, not always prepared) | charges only |
| Silver Eagle Weapon | weapon dice replacement (`dieSet:"2d6"`) and a base weapon choice (the row has no `base`, so there is no attack row) | nothing |
| Ranseur of Torture (2d10 piercing) | weapon dice replacement | +3 and a note on the Pike row |
| Scourge of Shadow (3d4 slashing) | weapon dice replacement | +3 and a note on the Whip row |
| Sun Blade, Sunsword | weapon profile override (`dmgType:"Radiant"`, `finesse:1`) | +2 and a note on the Longsword row |
| Staff of the Adder (Snake Head), Spiked Shield (Shield Bash), Storm Sickle (Wind Blade), Starmetal Shield (Shooting Star) | extra attack row from an item (`attackRow:{n,ab,die,type,range}`) | text; Storm Sickle gets the lightning rider and Sickle proficiency |
| Snicker-Snack, Spirit Pike, Storm Sickle, Staff of the Sorcerer King, Sword of Resonance | fx `weapons` must also reach the attack-row proficiency test (`weapons` local in `12-logic-export-to-sheet.js` is built before the fx pass, only `C.profSrc` is updated) | the proficiency is listed under Weapons, the attack row still shows no Proficiency Bonus. Snicker-Snack `atkAb` CHA works |
| Sword of Resonance | `finesse` override and an Instrument proficiency name | Longsword proficiency listed only |
| Seafarer's Jacket | Expertise when already proficient with the tool (`toolExpert`) | proficiency listed |
| Niko's Mace | spell cast from charges with a fixed attack bonus (+9) | old `atk:9` dropped, text only |
| Obo'laka | `attuneAdd:1` (relative) | `attune:4`; a Thief 13 host would be 5 |
| Shagambi | `extraAttackAdd:1` (relative) | `extraAttack:2` text, only when the class has no Extra Attack |
| Splitter (+1 each part when split), Starmetal Solar Axe fissioned (two attacks) | per-form attack rows | +1 AC when split, Solar Axe rider by form |
| Orb of Skoraeus | bonus for concentration saves only (`concBonus`) | note under Saving Throws |
| Plaguebane Mask | conditional resistance (poison from contagions) | advantage note only |
