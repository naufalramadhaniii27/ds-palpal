# Clause gate, audit round 2 (2026-11-05)

Announced before sampling (commit of this file comes before the sample is drawn).

- Seed for the sample: **77031** (the first audit used 20261108; the report examples use 20261105).
- Rules frozen at this commit: `excuse()` in `tests/clause_gate.py` with 19 reason codes plus the d3 die token. No rule is changed after the sample is seen. If a rule is wrong, it is listed under "rule defects found" and fixed in a later commit with a new number.
- Sample: 80 uncovered mechanical sentences and 80 covered or info mechanical sentences, stratified by source kind (class, sub, species, feat, item, spell), round robin, drawn by `python3 tests/clause_gate.py --data CACHE --audit 80 77031`.
- Judge: the author of the gate (one reader, so no inter-rater number), against the book text in the data and against the engine (GX, FXO, fx files).
- Definition of a real gap (TP for an uncovered sentence): the sentence states a standing effect or number of the character or item that the sheet computes or could compute with the current fx fields (v5), and no record produces it. Not a gap: flavor, table rows read by code, effects on others, play-time choices, conditions the sheet does not track by policy (SOURCE-NOTES fx batch H), numbers handled by code (checked in the engine).
- Definition of a miss (FN for an unflagged sentence): a covered or info sentence whose effect is NOT produced by the engine or whose number is not conserved.

## Results (frozen rules, seed 77031)

Frozen rules: uncovered 15245 (before excuse rules) to 6325. A later commit (rule defects below) brings it to 6146 on the final build, which also includes the N1 entries.

| Sample | n | Count | Rate | Wilson 95% |
|---|---|---|---|---|
| Flagged, true gap (strict) | 80 | 8 | 10.0% | 5.2% to 18.5% |
| Flagged, true gap or borderline | 80 | 21 | 26.3% | 17.9% to 36.8% |
| Not flagged, real miss | 80 | 0 | 0% | 0% to 4.6% |

Weighted recall (flagged pool 6325, unflagged mechanical pool 30456):

| Reading | True gaps flagged | Misses | Recall |
|---|---|---|---|
| Point estimate (0 of 80 misses) | 632 strict, 1660 with borderline | 0 | 100% |
| Worst case inside the Wilson upper bound (4.6%) | 632 strict, 1660 with borderline | 1395 | 31% strict, 54% with borderline |

Honest reading: precision is low (10% to 26%), so most flags are still noise. Recall is high in this sample but the interval is wide (80 sentences cannot exclude up to 4.6% misses, about 1400 sentences). Recall was not measured on a pool that is rich in true gaps, so treat it as "no miss found", not as proof.

Canaries: Martial Advantage and Bestial Soul were real and are now covered by fx-N1. Furious Storm resistance, Dhampir resistance and Grue darkvision were false flags: the engine parses them from the text, so the gate has no atom for them.

Rule defects found (fixed after the sample, not re-sampled): species DEF_SP atoms were not read, the class weapon master PROF atom was missing, the ASI pattern was too narrow, subclass pick sentences and "you know N cantrips" table sentences were not excused, "on a failure" was not recognised as a rider on others.

Main remaining cause of false flags: effects that the engine builds by parsing the book text (species and feat resistance, darkvision, weapon and tool proficiency, HP). The gate sees no record for them. The fix is an engine-output oracle: build the sheet for the owner and test the effect on the output instead of looking for an atom. That is a separate task.

Mutation on real data (final build): all covered 298 tested, record-level 163, class-level 165. Stat classes only 300 tested, record-level 298, class-level 300. The all-covered number is lower because many covered sentences rest on atoms that several sentences share, so removing one atom leaves another one in place.
