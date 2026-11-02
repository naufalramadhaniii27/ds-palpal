#!/usr/bin/env python3
"""N32: turn reports/trace.json (tests/trace_screens.py) into reports/split-plan.md.
For each deferred part: the globals it makes, the screens that read them, and a tier:
  core         read on Home or a sheet screen (home, tab, detail, more, library of the sheet)   -> must be loaded with the sheet
  on demand    read only on builder / library / learn / training ground screens
  never read   not read on any of the screens (check by hand before moving: it may be read through a dynamic name)
  changeable   the part adds or removes registry keys of a table that other parts also change (applyPacks style), N33 does not touch it
The plan is input for the three-tier loader (Fase 2.2). Python standard library only.   python3 tools/split_plan.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "reports", "trace.json")))
CORE = ("home", "tab", "detail", "more")
parts = {}; reads = {}
for run in T:
    vp = run["run"]; tr = run["trace"]
    for n, p in tr["parts"].items():
        q = parts.setdefault(n, {"globals": set(), "reg": {}}); q["globals"].update(p["globals"])
        for r, d in p["regDelta"].items(): q["reg"][r] = d
    for g, scr in tr["reads"].items():
        for s, c in scr.items():
            name = s.split(" ", 1)[1] if " " in s else s
            reads.setdefault(g, {}).setdefault(vp + "|" + name, 0); reads[g][vp + "|" + name] += c
regs_by = {}
for n, p in parts.items():
    for r in p["reg"]: regs_by.setdefault(r, set()).add(n)
rows = []; summary = {"core": 0, "on demand": 0, "never read": 0, "changeable": 0}
for n in sorted(parts):
    p = parts[n]; gl = sorted(p["globals"]); scr = set()
    for g in gl:
        for k in reads.get(g, {}): scr.add(k.split("|", 1)[1])
    changeable = any(len(regs_by[r]) > 1 for r in p["reg"])
    if changeable: tier = "changeable"
    elif not gl and not p["reg"]: tier = "no global"
    elif any(any(s.startswith(c) for c in CORE) for s in scr): tier = "core"
    elif scr: tier = "on demand"
    else: tier = "never read"
    summary[tier] = summary.get(tier, 0) + 1
    rows.append((n, tier, len(gl), ", ".join(gl[:4]) + (" ..." if len(gl) > 4 else ""), ", ".join(sorted(p["reg"])), ", ".join(sorted(scr)[:4])))
out = ["# Split plan (N32)", "", "From reports/trace.json, %d runs. Tiers: %s." % (len(T), ", ".join("%s %d" % kv for kv in summary.items())), "",
       "| Part | Tier | Globals | Examples | Registry keys added | Read on screens |", "|---|---|---|---|---|---|"]
for r in rows: out.append("| %s | %s | %d | %s | %s | %s |" % r)
out += ["", "A global read through a dynamic name (window[name]) or only on a screen that the 74 screens do not open shows as never read. Check those by hand before moving them."]
open(os.path.join(ROOT, "reports", "split-plan.md"), "w").write("\n".join(out) + "\n")
print("parts", len(rows), summary)
