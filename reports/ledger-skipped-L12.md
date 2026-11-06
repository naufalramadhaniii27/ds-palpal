# Ledger bin L12 (shards 32 to 35): rows not fixed, and spec errors

Data for the fixed rows: `src/data/fx-L12.js`. Rules checked against the feature text (SUB_FULL).

## Skipped (engine field missing)
| Key | Needed |
|---|---|
| sub\|Ranger/Big Game Hunter\|Improved Bolas | lu max that changes formula at a class level (WIS mod, then WIS + DEX mod from level 7), plus a save DC note with doubled PB |
| sub\|Ranger/Vermin Lord\|Filth and Fortitude | `saveProf:[ab]` (fixed saving throw proficiency without a pick). Poison immunity stays the old note |
| sub\|Rogue/Highway Rider\|True Grit | `saveProf:["CON"]` (same) |
| sub\|Rogue/Cyber Ninja\|Cyber Katana | grant of a weapon row with +1/+2/+3 attack and damage by level and Vex outside the mastery limit (no Cyber Katana item exists in the data) |
| sub\|Vagabond/Experiment X\|Mutations | natural attack rows from a choice (Acid Spit dice by character level, Adamantine Claws scimitar stats +1/+2/+3) |
| sub\|Vagabond/Gourmand\|Fine Cuisine | ritual-only spell grant (`spells` would mark Gentle Repose always prepared) |
| sub\|Vagabond/Mage Brand\|Spellbranding | the Mage Brand Spellcasting table (prepared level 1+ spells) is not in the data |
| sub\|Rogue/Soulknife (2014)\|Psychic Blades | `actAtk` only matches `Soulknife`, not `Soulknife (2014)` (engine code) |
| sub\|Warlock/The Celestial\|Radiant Soul | the CHA rider is hard-coded for `Celestial Patron` in 09-logic-feats-and-choices.js |
| sub\|Warmage/Coalition Arcanist\|Tactical Uplink | `passBonus` (passive Perception only) |
| Tool Expertise (Green Reaper Toxic Tradecraft, Runetagger Impressionist) | `toolExpert`. Tool proficiency is added, Expertise is a Defenses note |

## Spec errors
- Oath of the Sun, Incandescent Strikes is a level 15 feature (spec said 11).
- Oath of the Giving Grave, Undying Sentinel is level 20 (spec said 15).
- Phantom, Tokens of the Departed is level 9 (spec said 3).
- Big Game Hunter, Improved Special Shots: the existing lu array already doubles PB from level 11 (8 uses at PB 4). Nothing to fix.
- Data and Technology skills do exist (XSK, engine v4), so Nanite Magic and Digital Nomad get real skill rows.
- Aristocratic Enchantment bonus spell is written "Hideous Laughter" in the text and is the spell Tasha's Hideous Laughter.
- Waxing and Waning: the new lu row (3 uses) may overlap with the Lunar Embodiment free spell row of level 3. The text is ambiguous, both rows are kept.
- Parasite Patron, Symbiotic Sentinel is also added by `fx-H-audit.js` on branch w-fixmiss. If both merge, drop one entry.

## Edits to original data files (override impossible)
- `tp05-tghp.js`: Apocalypse Sorcery Bear Witness old `fx` lost its always-on `res`/`condImm` (now a toggle in fx-L12). First Vampire Nocturnal Predator old `senses` removed (now `darkNone`/`darkHave`, since the old set-if-greater rule contradicts the text).
- MISMATCH rows (Astral Griffon auto, Frozen One, Genie Lord, Sibyl auto, Jinx Points, Steal Luck) are overridden by changing the global `AUTO` and `LU_X` rows from fx-L12.js. No source file edit.
