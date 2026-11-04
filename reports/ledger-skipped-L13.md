# Ledger L13 (shards 36 and 37): rows not fixed, engine field missing

| Key | Needed field |
|---|---|
| sub\|Wizard/Bladesinging\|Training in War and Song (one-handed melee weapon pick) | `pick t:"weapon"` filter for one-handed melee (no Two-Handed, melee only). Today the weapon pick lists every Simple/Martial weapon. |
| sub\|Wizard/Chronomancer\|Chronomancy Savant | `pickSub k:"sav"` filter by spell tag (Chronomancy) instead of school. Empty AUTO names stay and are ignored by autoSpells. |
| sub\|Wizard/Sangromancer\|Sangromancy Savant | Same, tag Sangromancy, plus "counts as Wizard spells". |
| sub\|Wizard/Protomancer\|Proto-Magic | Same, tag Protospell. |
| sub\|Wizard/Universalist\|Universal Savant | `sav` pick without school (any Wizard spell level 2 or lower). |
| sub\|Wizard/Protomancer\|Proto-Master | `lu max` equal to the number of prepared Protospell spells. |
| sub\|Wizard/Universalist\|Arcane Excellence | Extra spell slot at highest level (max 7): a `slotAdd` field. |
| sub\|Wizard/Daemonologist\|Stolen Secrets | Eldritch Invocation pick (list from the invocation data, with their effects and Wizard level as prerequisite). |
| sub\|Wizard/Materializer\|Arcane Artisan (bonus cantrip when Mending is known) | `cond:"minending"` in the pickSub handler (only `minill` exists, 10-logic-v17-additions.js). |
| sub\|Wizard/Ring Warden\|Master Metalsmith (double PB on the chosen tool) | Tool Expertise field (skillExpert is skills only). The ring choice is recorded as a pick. |
| sub\|Wizard/Alkemancer\|Skilled Alchemist (doubled PB on Alchemist's Supplies, PB damage with alchemical weapons) | Tool Expertise and a damage rider for alchemical items. Proficiency with the supplies is done (SUB_GRANT). |
| sub\|Wizard/Dragon Mage\|Invoke Dragon Tail (Str and Dex save proficiency, Str checks with INT) | Save proficiency field and an ability replacement for saves and checks. Grappled immunity is done, the rest is a Defenses note under the toggle. |

Partly done: Bladesinging Bladesong cond is `noMedHeavy` (the Shield half of the rule is not checked, only armor). Bladesong concentration bonus stays the existing save note.

## Spec errors found
- War Magic Tactical Wit: Initiative +INT was already counted (engine showed it before this batch). No entry added.
- Familiar Master Servitor's Agility is level 6 in the data, not 10. Pawn Storm and Covert Magic level 7, Deathseeker and Turquoise Efficiency level 6, Doomsayer Power from Darkness level 14.
- Mystic Strategist: 2d6 at 3, 3 at 7, 3d8 at 13, 4 at 19 (array as in House of Kings). Bishop Spellcasting table checked against Valda's Spire of Secrets p.154: identical to the 2024 Eldritch Knight table.
- Sangromancer Sanguine Vigor: hpLvl:1 gives the Wizard level in total (6 at level 6), matches the text.
