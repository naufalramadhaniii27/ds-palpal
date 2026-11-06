# Ledger bin L11 (shards 29, 30, 31): rows not fixed and spec notes

## Skipped (engine field missing)
| Key | Needed |
|---|---|
| sub\|Fighter/Living Crucible\|Compound Creator and Living Cauldron | lu max with a per-level offset plus a modifier (1+CON, 3+CON at 7, 5+CON at 18). `{f}` cannot step by level |
| sub\|Fighter/Champion (2014)\|Remarkable Athlete (skills part) | skillBonus for non-proficient STR/DEX/CON skills (half PB rounded up). Initiative is done with class-level steps (exact for single class only) |
| sub\|Fighter/Cavalier\|Bonus Proficiency | alternative choice (skill or language): the old skill pick is unconditional in WXS |
| sub\|Jaeger/Absolute Chapter\|Unencumbered Movement | cond "Light or no armor and no Shield" (lightNone + noShield) |
| sub\|Jaeger/Heretic Chapter\|Heretic Magic and sub\|Investigator/Occultist\|Pact Magic | subclass Pact Magic progression (pact slots, slot level, prepared counts) |
| sub\|Jaeger/Heretic Chapter\|Occult Arts | invocation pick with prerequisites tied to Warlock levels |
| sub\|Jaeger/Marauder Chapter\|Path of Gore, Salvation Chapter\|Art of Salvation, Sanguine Chapter\|Vital Consumption | Jaeger Finishers and Adrenaline Arts have no pick model (class text only); DC choice INT or CON |
| sub\|Jaeger/Marauder Chapter\|Unbreakable (AC part) | acArmAb with a cap (CON max +2). HP part done (hpLvl 1) |
| sub\|Necromancer/Blood Ascendant\|Nosferatu | walking Speed doubled needs speedMul (exists only on claude/w-fixmiss, fx-H-audit). Climb Speed done as mv speed2 |
| sub\|Monk/Way of the Cobalt Soul\|Mystical Erudition (3 rows) | Expertise as alternative to a proficiency |
| sub\|Monk/Way of the Sun Soul\|Radiant Sun Bolt | a field that adds a new attack row |
| sub\|Monster Hunter/Occultist Guild\|Occult Knowledge | pick filter for Ritual-tag spells from several lists |
| sub\|Investigator/Archivist\|Thesis | per-thesis spell tables are not in the repo (no books/ folder) |
| sub\|Monk/Way of the Kensei (partial) | weapon picks done (2 at 3, one each at 6, 11, 17) but no melee/ranged or Heavy/Special filter, and "counts as Monk weapon" is not computed |

## Spec errors and differences from the text
- Burden of Revolution Aura of Tenacity and Trapper Guild Ambusher's Advantage, Dead Mist Acolyte Dead Mist Lord, Death Knight Imperator: already in fx-B1 / fx-F on this base. The ledger rows were stale. No change.
- Couatl Calm Mind: spec said `imm`; conditions use `condImm` (`imm` is for damage types).
- Detective Interrogator's Instinct is level 10 in the text.
- Nightwatcher: WXS senses (Darkvision 60) would double with darkAdd; the `senses` item was removed from the tp05-tghp.js row (only edit of an original data row).
- Circle of the Sea Stormborn: the unconditional Resistance (16-logic-feature-numbers.js) and the Fly note (12-logic-export-to-sheet.js) were removed; both now come from the toggle `wrath-of-the-sea` (default off). Saved sheets show no Stormborn Resistance until the toggle is on.
- Steelsinger Defense is `acAdd:1` when armor is worn (no feat is added). Heavy Frame uses cond noShield only (also +2 with no armor). Entropy acBase takes WIS modifier without the minimum +1.
- Prescient Knight, Occultist Guild, Warrior of the Mystic Arts use THIRD_SUBS (their slot and known tables equal the Eldritch Knight table). School limits of Prescient Knight are not enforced. Mystic Arts still has the fx-B2 cantrip pick as well as the third-caster cantrip count, so the cantrip UI may ask twice (not kept from deleting to protect saved picks).
- Item grants (Overdrive Module, Starshield Hardsuit, Flashbang, Invisibomb, grafts) are single-option picks: the player must tick them.
- Merge note: fx-H-audit (claude/w-fixmiss) also adds Heavenborne-style fly (Limited Flight) and Pharaoh Magic Resistance; check duplicates when merged.
