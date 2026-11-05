# Clause gate, audit round 2 (2026-11-05)

Announced before sampling (commit of this file comes before the sample is drawn).

- Seed for the sample: **77031** (the first audit used 20261108; the report examples use 20261105).
- Rules frozen at this commit: `excuse()` in `tests/clause_gate.py` with 19 reason codes plus the d3 die token. No rule is changed after the sample is seen. If a rule is wrong, it is listed under "rule defects found" and fixed in a later commit with a new number.
- Sample: 80 uncovered mechanical sentences and 80 covered or info mechanical sentences, stratified by source kind (class, sub, species, feat, item, spell), round robin, drawn by `python3 tests/clause_gate.py --data CACHE --audit 80 77031`.
- Judge: the author of the gate (one reader, so no inter-rater number), against the book text in the data and against the engine (GX, FXO, fx files).
- Definition of a real gap (TP for an uncovered sentence): the sentence states a standing effect or number of the character or item that the sheet computes or could compute with the current fx fields (v5), and no record produces it. Not a gap: flavor, table rows read by code, effects on others, play-time choices, conditions the sheet does not track by policy (SOURCE-NOTES fx batch H), numbers handled by code (checked in the engine).
- Definition of a miss (FN for an unflagged sentence): a covered or info sentence whose effect is NOT produced by the engine or whose number is not conserved.
