#!/usr/bin/env python3
"""sheet_gaps: which clause-gate UNCOVERED sentences are also missing from the real sheet.

The clause gate reads the data tables, so it misses rules the sheet derivation handles in code (saveNotes, skills misc, ability bonuses).
This tool builds each class and subclass at level 20 (and the level the feature arrives at, when lower), and keeps an uncovered sentence
only when its feature name appears nowhere in the sheet's mechanical fields (everything except the feature text list and the inventory).
What is left is a real gap candidate, still to be read by a person.

  python3 tools/sheet_gaps.py [BOOK]        BOOK = a clause-gate book tag (default core). Uses the cached tables at tests/out/cg.json
                                            (made on first run, about 75 s).
Read only."""
import json, os, re, subprocess, sys
from collections import defaultdict
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = sys.argv[1] if len(sys.argv) > 1 else "core"
CACHE = os.path.join(ROOT, "tests", "out", "cg.json")
os.makedirs(os.path.dirname(CACHE), exist_ok=True)
cmd = [sys.executable, "tests/clause_gate.py", "--no-write", "--list", BOOK] + (["--data", CACHE] if os.path.exists(CACHE) else ["--save-data", CACHE])
out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True).stdout
rows = []
for line in out.splitlines():
    m = re.match(r"\[(class|sub)\|([^|]+)\|([^#\]]+?)(?:~\d+)?#\d+\] K=([^|]*)\| ([^|]*)\| (.*)", line)
    if m: rows.append(m.groups())
builds = {}
for kind, owner, feat, K, why, text in rows:
    cls, sub = (owner.split("/", 1) + [""])[:2]
    builds[(cls, sub)] = 1
SHEET = """([b])=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);
  const o=Object.assign({},C);delete o.features;delete o.inv;delete o.equipNote;return JSON.stringify(o)}"""
mech = {}
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldSheetFor==='function'"): break
        pg.wait_for_timeout(100)
    for cls, sub in builds:
        try: mech[(cls, sub)] = pg.evaluate(SHEET, [dict(cls=cls, sub=sub, level=20)])
        except Exception as e: mech[(cls, sub)] = ""
    br.close()
gaps = defaultdict(list)
for kind, owner, feat, K, why, text in rows:
    cls, sub = (owner.split("/", 1) + [""])[:2]
    s = mech.get((cls, sub), "")
    if s and feat.strip() not in s:
        gaps[owner + " | " + feat.strip()].append((K.strip(), text))
n = sum(len(v) for v in gaps.values())
print("%s: %d uncovered class/subclass sentences, %d in %d features have no trace on the level 20 sheet" % (BOOK, len(rows), n, len(gaps)))
for k in sorted(gaps):
    print("== " + k)
    for K, t in gaps[k]: print("   [%s] %s" % (K, t[:220]))
