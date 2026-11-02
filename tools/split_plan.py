#!/usr/bin/env python3
"""N32: turn reports/trace.json (tests/trace_screens.py) into reports/split-plan.md.
For each deferred part: the globals it makes, the screens that read them, and a tier:
  core         read on Home or a sheet screen (home, tab, detail, more, library of the sheet)   -> must be loaded with the sheet
  on demand    read only on builder / library / learn / training ground screens
  never read   not read on any of the screens (check by hand before moving: it may be read through a dynamic name)
  changeable   the part removes registry keys (applyPacks style), N33 does not touch it. A part that only adds keys to a table other parts also fill is
               not changeable: it is listed in "shared tables" below, and every part of such a table must load before the table is read
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
            name = s[len(vp) + 1:] if s.startswith(vp + " ") else s
            reads.setdefault(g, {}).setdefault(vp + "|" + name, 0); reads[g][vp + "|" + name] += c
regs_by = {}
for n, p in parts.items():
    for r in p["reg"]: regs_by.setdefault(r, set()).add(n)
rows = []; summary = {"core": 0, "on demand": 0, "never read": 0, "changeable": 0}
for n in sorted(parts):
    p = parts[n]; gl = sorted(p["globals"]); scr = set()
    for g in gl:
        for k in reads.get(g, {}): scr.add(k.split("|", 1)[1])
    changeable = any(d < 0 for d in p["reg"].values())  # a part that removes registry keys (applyPacks style) must not be split
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
out += ["", "## Shared tables", "", "| Table | Parts that add keys |", "|---|---|"]
for r in sorted(regs_by): out.append("| %s | %s |" % (r, ", ".join(sorted(regs_by[r]))))
out += ["", "## Ownership", "", "Globals made by deferred parts: %d, all owned by one part (a global made by two parts would show twice)." % sum(len(p["globals"]) for p in parts.values())]
owners = {}
for n, p in parts.items():
    for g in p["globals"]: owners.setdefault(g, []).append(n)
dup = {g: o for g, o in owners.items() if len(o) > 1}
out += ["Globals made by more than one part: %d%s" % (len(dup), (" (" + ", ".join(sorted(dup)[:10]) + ")") if dup else "")]
out += ["", "## Reading this plan", "",
        "- Reads are counted against the screen that is open when they happen. The Library index is built in the background soon after the builder data has loaded, and it reads most data parts once. So a part read on `more` or `library` may be read only by that index build, not by the screen. Before moving a part to a later tier, run the trace again with the index build switched off (next step of Fase 2.2) and compare.",
        "- Parts read on `home` or a `tab` screen, with no index build, are the true core. In this run only q1 shows tab reads (tab6, tab7).",
        "", "A global read through a dynamic name (window[name]) or only on a screen that the 74 screens do not open shows as never read. Check those by hand before moving them."]
open(os.path.join(ROOT, "reports", "split-plan.md"), "w").write("\n".join(out) + "\n")
print("parts", len(rows), summary)
