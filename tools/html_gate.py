#!/usr/bin/env python3
"""N44 gate: HTML written from strings (innerHTML =, insertAdjacentHTML, outerHTML =) in src/, outside src/app/lib/html.js and src/data.
A file may not have more sites than tools/html-baseline.json says. Fewer is fine: run with --update to lower the baseline.
Last line: SCORE <total sites>.   python3 tools/html_gate.py [--update]"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(ROOT, "src"); BASE = os.path.join(ROOT, "tools", "html-baseline.json")
PAT = re.compile(r"\.(?:innerHTML|outerHTML)\s*\+?=(?!=)|insertAdjacentHTML\s*\(")
now = {}
for dp, _, fs in os.walk(SRC):
    rel = os.path.relpath(dp, SRC)
    if rel.startswith("data") or rel.startswith("css"): continue
    for f in fs:
        if not f.endswith(".js"): continue
        p = os.path.join(dp, f); r = os.path.relpath(p, ROOT)
        if r == "src/app/lib/html.js": continue
        n = len(PAT.findall(open(p, encoding="utf-8").read()))
        if n: now[r] = n
if "--update" in sys.argv:
    json.dump(now, open(BASE, "w"), indent=1, sort_keys=True); print("baseline written"); 
base = json.load(open(BASE)) if os.path.exists(BASE) else None
tot = sum(now.values()); bad = []
if base is not None:
    for k, v in now.items():
        if v > base.get(k, 0): bad.append("WORSE %s now %d baseline %d" % (k, v, base.get(k, 0)))
for b in bad: print(b)
print("html_gate: %d sites in %d files%s" % (tot, len(now), "" if base is None else " (baseline %d)" % sum(base.values())))
print("SCORE %d" % tot); sys.exit(1 if bad else 0)
