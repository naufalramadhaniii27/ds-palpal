# Gate flags that need engine work (fx batch N1, 2026-11-05)

Source: top 300 flagged sentences ranked for RES, IMM, ADV, SPEED, SENSE, AC, PROF, SLOT. After fx-N1 and the gate fixes, 248 of the 300 are still flagged by the gate (52 became covered). Of the 248, 93 are false flags (the engine already makes the effect), 70 are written in fx-N1 (the gate has no atom for picks and toggles, so it may still flag them; the goldens prove the effect), and 130 are open. The open rows are counted below. The oracle verdict (present, missing, unknown) comes from `/tmp/g/chk.py`, a heuristic probe of the baseline build. It was NOT checked row by row, so "missing" is a lead, not a proof.

| Need | Rows | Proposed field | Note |
|---|---|---|---|
| Advantage on all checks or saves of one ability (Feylost, Gourmand, Rune Knight, Circle of Configuration, Astral Self, Mutation, Oath of Glory 2014, Champion death saves, Detective, Justice, Totem Warrior push/lift) | 15 | `advAb:{chk:[ab],save:[ab],death:1}` | `advOn` only prints a note line. The sheet needs roll-level advantage on the ability rows. |
| Speed forms: Fly equal to Speed, hover, Speed doubles, Speed +10 or +15, Swim twice Speed (Gamma Knight, Diabolist, Beastblood Guardian, Aberrant Mind, Mutagenist, Star-Spangled Banner, Blood Ascendant, Medium, House of Darts) | 9 | none needed for most: `mv:{fly:"speed"}`, `speedMul`, `speedAdd` with `toggle` exist | Expressible with v5 fields. Not written for lack of time and goldens. Hover and "enter other spaces" have no field (`mvNote:"hover"`). |
| Timed speed from consumables (potion of flying, swimming items) | 5 | `toggle` on an item row (timed, not equipped state) | Items count only while equipped. A consumable form has no on state. |
| Darkvision from a subclass or class (Diviner 120, Divination 60, Transmuter +60, Battle Smith 60) | 4 | `dark:N` and `darkAdd:N` | Check first whether `dark` exists on `GX.sub`. |
| Resistance or immunity for a limited time or on a trigger (Exterminator, Devourer Guild, Demon Brand, Bulwark Warrior, Knight Errant, Pestilence ignoring immunity, Poisoner) | 10 | `res` plus `toggle`; `ignoreImm:[type]` is new | The ignore-immunity rows (Pestilence, Poisoner) are not resistance of the character. |
| Resistance and immunity as standing text (Gourmand, Circle of Mutation, Dragonscarred, Dragonborn ancestry, Kalashtar dream immunity, Dungeon Delver trap damage) | 7 | `res` and `condImm` exist. Pick-based ones (Dragonscarred, Dragonborn) need `resPick:[types]` | |
| AC from a changing count or against one attack (Magic Missile Mage darts, +5 AC reaction item) | 2 | `acPlay:{label,max}` (a play-state number like the Bloodied toggle) | Both are play-time values, so `by_design` info may be the right answer instead. |
| Skill proficiency with a pick (Cleric Knowledge two skills, Samurai, Nightwatcher, Arcane Archer, Cavalier, Strength, Nature, Order, Dancer Mime, Sibyl with Expertise, Time Domain with doubled bonus, Warden Expertise) | 14 | `skillPick:{n,from:[..]}` and `skillExpert` exist | Many are expressible now. N1 did the ones with a clean book line. The rest were not written. |
| Weapon, armor and tool proficiency sentences | 65 | none | The engine reads these from the text. The oracle returns "unknown" because it only looks at skills. Probable false flags. Needs an oracle on `C.profs` or similar, not a field. |

Row counts are sentences, not entries. Several sentences belong to the same feature.

Recommended next step: an engine-output oracle in the gate (build the sheet for the owner, then test the effect on the sheet output). It would remove the 93 + 65 false flags and turn the "missing" leads into proofs.
